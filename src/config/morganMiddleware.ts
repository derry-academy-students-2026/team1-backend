import type { RequestHandler } from "express";
import morgan, { type StreamOptions } from "morgan";

import Logger from "../lib/logger.js";

// Route Morgan output through Winston's http level
const stream: StreamOptions = {
	/**
	 * Writes Morgan's formatted request line to the Winston HTTP logger.
	 * @param message formatted request and response details
	 */
	write: (message) => Logger.http(message.trimEnd()),
};

/** Morgan format used for request method, URL, status, size, and duration. */
const morganMiddleware: RequestHandler = morgan(
	":method :url :status :res[content-length] - :response-time ms",
	{ stream },
);

export default morganMiddleware;
