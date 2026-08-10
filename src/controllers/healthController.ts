import type { NextFunction, Request, Response } from "express";

import logger from "../lib/logger.js";
import { getHealthStatus } from "../services/healthService.js";

export const getHealth = (
	_req: Request,
	res: Response,
	next: NextFunction,
): void => {
	try {
		const healthStatus = getHealthStatus();

		logger.info("Health check completed");
		res.json(healthStatus);
	} catch (error) {
		if (error instanceof Error) {
			logger.error("Health check failed", error);
		} else {
			logger.error(`Health check failed: ${String(error)}`);
		}
		next(error);
	}
};
