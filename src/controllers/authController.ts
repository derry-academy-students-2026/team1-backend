import type { Request, Response } from "express";
import type { LoginRequestDto } from "../dtos/authDto.js";
import Logger from "../lib/logger.js";
import type { AuthService } from "../services/authService.js";

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

		const { email, password } = (req.body ?? {}) as Partial<LoginRequestDto>;

		if (typeof email !== "string" || typeof password !== "string") {
			Logger.warn(
				"⚠️  [POST /auth/login] Request body missing email or password | Status: 400",
			);
			res.status(400).json({ message: "Email and password are required" });
			return;
		}

		if (email.trim() === "" || password === "") {
			Logger.warn(
				"⚠️  [POST /auth/login] Empty email or password | Status: 400",
			);
			res.status(400).json({ message: "Email and password are required" });
			return;
		}

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
}
