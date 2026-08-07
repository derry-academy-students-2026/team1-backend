import type { RequestHandler } from "express";
import morgan from "morgan";

import logger from "../config/logger.js";

morgan.token("path", (req) => {
	const url = (req.originalUrl ?? req.url ?? "").split("?")[0];
	return url;
});

const requestLogger: RequestHandler = morgan(
	":remote-addr :method :path :status :res[content-length] - :response-time ms",
	{
		stream: {
			write: (message: string) => {
				logger.http(message.trim());
			},
		},
	},
);

export default requestLogger;
