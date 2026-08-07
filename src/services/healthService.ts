import logger from "../config/logger.js";

export interface HealthStatus {
	status: "UP";
	time: string;
}

export const getHealthStatus = (): HealthStatus => {
	logger.debug("Health status generated");

	return {
		status: "UP",
		time: new Date().toISOString(),
	};
};
