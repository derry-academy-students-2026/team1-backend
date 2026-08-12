import { type Prisma, PrismaClient } from "@prisma/client";
import Logger from "./lib/logger.js";

const prisma = new PrismaClient({
	log:
		process.env.NODE_ENV === "development"
			? [{ emit: "event", level: "query" }]
			: [],
});

// Log Prisma queries in development mode
if (process.env.NODE_ENV === "development") {
	prisma.$on("query", (e: Prisma.QueryEvent) => {
		Logger.debug(
			`[DB QUERY] ${e.query} | Params: ${JSON.stringify(e.params)} | Duration: ${e.duration}ms`,
		);
	});
}

// Log when connection is established
Logger.info("Prisma database client initialized");

export default prisma;
