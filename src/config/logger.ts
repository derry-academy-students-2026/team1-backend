import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import winston from "winston";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const logsDirectory = path.resolve(dirname, "..", "..", "logs");

mkdirSync(logsDirectory, { recursive: true });

const logLevels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
} as const;

const logFormat = winston.format.printf(({ timestamp, level, message }) => {
	return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
	levels: logLevels,
	level: "debug",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		logFormat,
	),
	transports: [
		new winston.transports.File({
			filename: path.join(logsDirectory, "all.log"),
			level: "debug",
		}),
		new winston.transports.File({
			filename: path.join(logsDirectory, "error.log"),
			level: "error",
		}),
	],
});

if (process.env.NODE_ENV !== "production") {
	logger.add(new winston.transports.Console());
}

export default logger;
