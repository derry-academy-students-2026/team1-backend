import type { Request, Response } from "express";
import type { LoginRequestDto, RegisterRequestDto } from "../dtos/authDto.js";
import Logger from "../lib/logger.js";
import {
	type AuthService,
	RegistrationError,
} from "../services/authService.js";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

/**
 * Controller class for handling authentication requests.
 * It delegates credential checking and token issuing to the AuthService.
 */
export class AuthController {
	constructor(private service: AuthService) {}

	/**
	 * Handles a login request, returning a JWT when the credentials are valid.
	 * @param req http request object
	 * @param res http response object
	 */
	async login(req: Request, res: Response): Promise<void> {
		Logger.debug("🌐 [POST /auth/login] Received login request");

		// Shape already validated by the validateBody(LoginSchema) middleware
		const { email, password } = req.body as LoginRequestDto;

		try {
			const result = await this.service.login(email, password);

			if (!result) {
				Logger.warn("⚠️  [POST /auth/login] Invalid credentials | Status: 401");
				res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
				return;
			}

			Logger.info("📤 [POST /auth/login] Issued token | Status: 200");
			res.status(200).json(result);
		} catch (error) {
			Logger.error(
				`❌ [POST /auth/login] Request failed: ${error instanceof Error ? error.message : String(error)}`,
			);
			res.status(500).json({ message: "Failed to process login" });
		}
	}

	/** Handles applicant registration and maps service errors to the API contract. */
	async register(req: Request, res: Response): Promise<void> {
		Logger.debug("🌐 [POST /auth/register] Received registration request");
		// Shape already validated by the validateBody(RegisterSchema) middleware
		const { email, password } = req.body as RegisterRequestDto;

		try {
			const result = await this.service.register(email, password);
			Logger.info("📤 [POST /auth/register] Issued token | Status: 201");
			res.status(201).json(result);
		} catch (error) {
			if (error instanceof RegistrationError) {
				const responses = {
					INVALID_EMAIL: [400, "Enter a valid email address"],
					WEAK_PASSWORD: [
						400,
						"Password must be more than 8 characters and include an uppercase letter, a lowercase letter, and a special character",
					],
					DUPLICATE_EMAIL: [409, "An account with this email already exists"],
				} as const;
				const [status, message] = responses[error.code];
				Logger.warn(
					`⚠️  [POST /auth/register] ${error.code} | Status: ${status}`,
				);
				res.status(status).json({ message });
				return;
			}

			Logger.error(
				`❌ [POST /auth/register] Request failed: ${error instanceof Error ? error.message : String(error)}`,
			);
			res.status(500).json({ message: "Failed to process registration" });
		}
	}
}
