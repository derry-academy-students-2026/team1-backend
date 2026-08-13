import type { NextFunction, Request, Response } from "express";

import Logger from "../lib/logger.js";
import { getHealthStatus } from "../services/healthService.js";

/**
 * Handles the request to retrieve the health status of the application.
 * @param _req http request object
 * @param res http response object
 * @param next next function for error handling
 */
export const getHealth = (
	_req: Request,
	res: Response,
	next: NextFunction,
): void => {
	try {
		const healthStatus = getHealthStatus();

		Logger.info("Health endpoint accessed");
		res.json(healthStatus);
	} catch (error) {
		if (error instanceof Error) {
			Logger.error("Health check failed", error);
		} else {
			Logger.error(`Health check failed: ${String(error)}`);
		}
		next(error);
	}
};
