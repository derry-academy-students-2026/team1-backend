import logger from "../lib/logger.js";

/**
 * Returns the health status of the application.
 * @returns {HealthStatus} An object containing the health status and timestamp.
 * @throws {Error} If the health check fails.
 */
export interface HealthStatus {
	status: "UP";
	time: string;
}

/**
 * Returns the health status of the application.
 * @throws {Error} If the health check fails.
 * @returns {HealthStatus} An object containing the health status and timestamp.
 */
export const getHealthStatus = (): HealthStatus => {
	logger.debug("Health status generated");

	return {
		status: "UP",
		time: new Date().toISOString(),
	};
};
