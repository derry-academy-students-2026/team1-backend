import express from "express";

import morganMiddleware from "./config/morganMiddleware.js";
import logger from "./lib/logger.js";
import healthRouter from "./routes/healthRouter.js";

export const app = express();

// Middleware
app.use(express.json());
app.use(morganMiddleware);

app.use(healthRouter);

const parsedPort = Number.parseInt(process.env.PORT ?? "3000", 10);
const PORT = Number.isFinite(parsedPort) ? parsedPort : 3000;

// Start server
if (process.env.NODE_ENV !== "test") {
	app.listen(PORT, () => {
		logger.info(
			`Health Endpoint of Basic Node: http://localhost:${PORT}/health`,
		);
	});
}
