import express from "express";
import morganMiddleware from "./config/morganMiddleware.js";
import Logger from "./lib/logger.js";
import healthRouter from "./routes/healthRouter.js";
import jobRolesRouter from "./routes/jobRolesRouter.js";

export const app = express();

Logger.info("App initialization started");

// Middleware
app.use(express.json());
app.use(morganMiddleware);
Logger.info("Morgan HTTP middleware registered");

app.use(healthRouter);
app.use("/jobs", jobRolesRouter);
Logger.info("Job routes mounted at /jobs");
Logger.error("This is a test error log to verify logging functionality");

export default app;
