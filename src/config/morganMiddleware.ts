import type { RequestHandler } from "express";
import morgan, { type StreamOptions } from "morgan";

import Logger from "../lib/logger.js";

// Route Morgan output through Winston's http level
const stream: StreamOptions = {
	write: (message) => Logger.http(message.trimEnd()),
};

const morganMiddleware: RequestHandler = morgan(
	":method :url :status :res[content-length] - :response-time ms",
	{ stream },
);

export default morganMiddleware;
