import type { RequestHandler } from "express";
import morgan from "morgan";

import logger from "../lib/logger.js";

morgan.token("path", (req) => {
	const request = req as typeof req & { originalUrl?: string };
	const url = (request.originalUrl ?? request.url ?? "").split("?")[0];
	return url;
});

const morganMiddleware: RequestHandler = morgan(
	":remote-addr :method :path :status :res[content-length] - :response-time ms",
	{
		stream: {
			write: (message: string) => {
				logger.http(message.trim());
			},
		},
	},
);

export default morganMiddleware;
