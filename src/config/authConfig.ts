import Logger from "../lib/logger.js";

const DEFAULT_TOKEN_EXPIRY = "1h";

/**
 * Reads the JWT signing secret from the environment.
 * Throws at call time (rather than import time) so tests and non-auth routes
 * are not coupled to the secret being present.
 * @returns the configured JWT secret
 * @throws Error if JWT_SECRET is not set
 */
export const getJwtSecret = (): string => {
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		Logger.error("❌ [AUTH CONFIG] JWT_SECRET environment variable is not set");
		throw new Error("JWT_SECRET environment variable is not set");
	}

	return secret;
};

/**
 * Reads the JWT expiry window from the environment, defaulting to one hour.
 * @returns the configured token lifetime
 */
export const getJwtExpiresIn = (): string =>
	process.env.JWT_EXPIRES_IN ?? DEFAULT_TOKEN_EXPIRY;
