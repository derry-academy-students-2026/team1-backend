import type { RequestHandler } from "express";
import morgan from "morgan";

import logger from "../config/logger.js";

const requestLogger: RequestHandler = morgan("combined", {
	stream: {
		write: (message: string) => {
			logger.http(message.trim());
		},
	},
});

export default requestLogger;
