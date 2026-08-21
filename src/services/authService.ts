import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { getJwtExpiresIn, getJwtSecret } from "../config/authConfig.js";
import {
	isValidEmail,
	isValidRegistrationPassword,
	type JwtPayloadDto,
	type LoginResponseDto,
	type RegisterResponseDto,
} from "../dtos/authDto.js";
import Logger from "../lib/logger.js";
import prisma from "../prismaClient.js";

// Verified against a throwaway hash when no user matches, so a missing email
// costs the same time as a wrong password and cannot be enumerated.
let decoyHash: string | null = null;

export type RegistrationErrorCode =
	| "INVALID_EMAIL"
	| "WEAK_PASSWORD"
	| "DUPLICATE_EMAIL";

export class RegistrationError extends Error {
	constructor(public readonly code: RegistrationErrorCode) {
		super(code);
		this.name = "RegistrationError";
	}
}

/** Lazily creates the hash used to equalize missing-user login timing. */
const getDecoyHash = async (): Promise<string> => {
	if (!decoyHash) {
		decoyHash = await argon2.hash("no-user-matched-placeholder");
	}
	return decoyHash;
};

/**
 * Service responsible for authenticating users and issuing JSON Web Tokens.
 * Passwords are stored as Argon2id hashes, which embed a per-user random salt.
 */
export class AuthService {
	/**
	 * Authenticates a user with their email and password.
	 * @param email the email address supplied by the caller
	 * @param password the plain text password supplied by the caller
	 * @returns a signed JWT when the credentials are valid, otherwise null
	 * @throws Will throw an error if the database query or token signing fails.
	 */
	public async login(
		email: string,
		password: string,
	): Promise<LoginResponseDto | null> {
		Logger.debug("🔐 Attempting to authenticate user...");

		try {
			const user = await prisma.user.findUnique({
				where: { email: email.trim().toLowerCase() },
			});

			if (!user) {
				await argon2.verify(await getDecoyHash(), password).catch(() => false);
				Logger.warn("⚠️  Authentication failed: no matching credentials");
				return null;
			}

			const passwordMatches = await argon2.verify(user.passwordHash, password);

			if (!passwordMatches) {
				Logger.warn("⚠️  Authentication failed: no matching credentials");
				return null;
			}

			Logger.info(`✅ Authenticated user ID: ${user.userId}`);

			return {
				token: this.signToken({ userId: user.userId, email: user.email }),
			};
		} catch (error) {
			Logger.error(
				`❌ Authentication operation failed: ${error instanceof Error ? error.message : String(error)}`,
			);
			throw error;
		}
	}

	/** Registers a new applicant and returns a token for the created account. */
	public async register(
		email: string,
		password: string,
	): Promise<RegisterResponseDto> {
		Logger.debug("📝 Attempting to register user...");
		const normalizedEmail = email.trim().toLowerCase();

		if (!isValidEmail(normalizedEmail)) {
			throw new RegistrationError("INVALID_EMAIL");
		}

		if (!isValidRegistrationPassword(password)) {
			throw new RegistrationError("WEAK_PASSWORD");
		}

		try {
			const existingUser = await prisma.user.findUnique({
				where: { email: normalizedEmail },
			});

			if (existingUser) {
				throw new RegistrationError("DUPLICATE_EMAIL");
			}

			const passwordHash = await argon2.hash(password);
			const user = await prisma.user.create({
				data: { email: normalizedEmail, passwordHash, role: "user" },
			});

			Logger.info(`✅ Registered user ID: ${user.userId}`);
			return {
				token: this.signToken({ userId: user.userId, email: user.email }),
			};
		} catch (error) {
			if (error instanceof RegistrationError) {
				throw error;
			}
			Logger.error(
				`❌ Registration operation failed: ${error instanceof Error ? error.message : String(error)}`,
			);
			throw error;
		}
	}

	/**
	 * Signs a JWT for an authenticated user.
	 * @param payload the minimal claims to embed in the token
	 * @returns the signed token string
	 */
	private signToken(payload: JwtPayloadDto): string {
		return jwt.sign(payload, getJwtSecret(), {
			expiresIn: getJwtExpiresIn(),
		} as jwt.SignOptions);
	}
}
