import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/authConfig.js";
import type { JwtPayloadDto } from "../dtos/authDto.js";
import Logger from "../lib/logger.js";

declare global {
	// biome-ignore lint/style/noNamespace: required to augment the Express Request type
	namespace Express {
		interface Request {
			user?: JwtPayloadDto;
		}
	}
}

const INVALID_TOKEN_MESSAGE = "Invalid token";

/**
 * Express middleware that requires a valid `Authorization: Bearer <token>` header.
 * Attaches the decoded claims to `req.user` and responds 401 for any failure.
 * @param req http request object
 * @param res http response object
 * @param next callback to pass control to the next handler
 */
export const requireAuth = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const header = req.headers.authorization;

	if (!header?.startsWith("Bearer ")) {
		Logger.warn(
			`⚠️  [AUTH] Missing bearer token: ${req.method} ${req.path} | Status: 401`,
		);
		res.status(401).json({ message: INVALID_TOKEN_MESSAGE });
		return;
	}

	const token = header.slice("Bearer ".length).trim();

	try {
		const payload = jwt.verify(token, getJwtSecret()) as JwtPayloadDto;

		if (typeof payload.userId !== "number" || typeof payload.email !== "string") {
			throw new Error("Invalid token payload");
		}

		req.user = { userId: payload.userId, email: payload.email };
		Logger.debug(`🔓 [AUTH] Verified token for user ID: ${payload.userId}`);
		next();
	} catch (error) {
		Logger.warn(
			`⚠️  [AUTH] Token rejected for ${req.method} ${req.path}: ${error instanceof Error ? error.message : String(error)} | Status: 401`,
		);
		res.status(401).json({ message: INVALID_TOKEN_MESSAGE });
	}
};

export default requireAuth;
