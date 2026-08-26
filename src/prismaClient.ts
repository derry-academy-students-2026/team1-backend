import prismaPkg from "@prisma/client";
import Logger from "./lib/logger.js";

const { PrismaClient } = prismaPkg;

type QueryLogEvent = {
	query: string;
	params: string;
	duration: number;
};

const prisma = new PrismaClient({
	log:
		process.env.NODE_ENV === "development"
			? [{ emit: "event", level: "query" }]
			: [],
});

// Log Prisma queries in development mode
if (process.env.NODE_ENV === "development") {
	/** Writes Prisma query details to the debug log in development. */
	prisma.$on("query", (event: QueryLogEvent) => {
		Logger.debug(
			`[DB QUERY] ${event.query} | Params: ${JSON.stringify(event.params)} | Duration: ${event.duration}ms`,
		);
	});
}

// Log when connection is established
Logger.info("Prisma database client initialized");

export default prisma;
