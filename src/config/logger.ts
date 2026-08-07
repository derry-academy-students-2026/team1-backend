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

const pad = (value: number, length = 2): string => {
	return value.toString().padStart(length, "0");
};

const formatTimestamp = (date: Date): string => {
	const year = date.getFullYear();
	const month = pad(date.getMonth() + 1);
	const day = pad(date.getDate());
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());
	const seconds = pad(date.getSeconds());
	const milliseconds = pad(date.getMilliseconds(), 3);

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}:${milliseconds}`;
};

const logFormat = winston.format.printf(({ timestamp, level, message }) => {
	return `${timestamp} ${level}: ${message}`;
});

const baseFormat = winston.format.combine(
	winston.format.timestamp({ format: () => formatTimestamp(new Date()) }),
	winston.format.errors({ stack: true }),
	winston.format.splat(),
);

const fileFormat = winston.format.combine(baseFormat, logFormat);

const consoleFormat = winston.format.combine(
	baseFormat,
	winston.format.colorize(),
	logFormat,
);

const logger = winston.createLogger({
	levels: logLevels,
	level: "debug",
	format: fileFormat,
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
	logger.add(new winston.transports.Console({ format: consoleFormat }));
}

export default logger;
