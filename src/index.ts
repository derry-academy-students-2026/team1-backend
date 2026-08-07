import express from "express";

import logger from "./config/logger.js";
import requestLogger from "./middleware/requestLogger.js";
import healthRouter from "./routes/healthRouter.js";

const app = express();
const parsedPort = Number.parseInt(process.env.PORT ?? "3000", 10);
const PORT = Number.isFinite(parsedPort) ? parsedPort : 3000;

// Middleware
app.use(express.json());
app.use(requestLogger);

app.use(healthRouter);

// Start server
app.listen(PORT, () => {
	logger.info(`Health Endpoint of Basic Node: http://localhost:${PORT}/health`);
import { app } from "./app.js";

const PORT = Number(process.env.PORT) || 3000;

// Start server
app.listen(PORT, () => {
	console.log(`Health Endpoint of Basic Node: http://localhost:${PORT}/health`);
});
