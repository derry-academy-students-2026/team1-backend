import winston from "winston";

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "white",
};

winston.addColors(colors);

const colorCodes = {
	error: "\u001b[31m",
	warn: "\u001b[33m",
	info: "\u001b[32m",
	http: "\u001b[35m",
	debug: "\u001b[37m",
};

const resetColor = "\u001b[0m";

const colorLine = (level: string, line: string): string => {
	const color = colorCodes[level as keyof typeof colorCodes];
	return color ? `${color}${line}${resetColor}` : line;
};

// Show all logs in development; only warn+ in production
const level = () => {
	const env = process.env.NODE_ENV || "development";
	return env === "development" ? "debug" : "warn";
};

const format = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:SSS" }),
	winston.format.printf((info) => {
		const line = `[${info.timestamp}] [${info.level}]: ${info.message}`;
		return colorLine(info.level, line);
	}),
);
const transports = [
	new winston.transports.Console(),
	new winston.transports.File({ filename: "logs/error.log", level: "error" }),
	new winston.transports.File({ filename: "logs/all.log" }),
];

const Logger = winston.createLogger({
	level: level(),
	levels,
	format,
	transports,
});
export default Logger;
