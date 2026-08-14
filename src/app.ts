import express from "express";
import morganMiddleware from "./config/morganMiddleware.js";
import Logger from "./lib/logger.js";
import authRouter from "./routes/authRouter.js";
import healthRouter from "./routes/healthRouter.js";
import jobRolesRouter from "./routes/jobRolesRouter.js";

export const app = express();

Logger.info("App initialization started");

// Middleware
app.use(express.json());
app.use(morganMiddleware);
Logger.info("Morgan HTTP middleware registered");

app.use(healthRouter);
app.use("/auth", authRouter);
Logger.info("Auth routes mounted at /auth");
app.use("/job-roles", jobRolesRouter);
Logger.info("Job routes mounted at /job-roles");

// Error handling middleware
app.use(
	/**
	 * Logs unexpected request failures and returns a sanitized 500 response.
	 * @param err error raised by an earlier middleware or route handler
	 * @param req request that caused the failure
	 * @param res response used to report the failure
	 */
	(
		err: unknown,
		req: express.Request,
		res: express.Response,
		_next: express.NextFunction,
	) => {
		const error = err instanceof Error ? err : new Error(String(err));
		Logger.error(
			`🔴 [ERROR HANDLER] Path: ${req.path} | Method: ${req.method} | Error: ${error.message}`,
		);

		if (process.env.NODE_ENV === "development") {
			Logger.debug(`Stack trace: ${error.stack}`);
		}

		res.status(500).json({
			error: "Internal server error",
			...(process.env.NODE_ENV === "development" && { message: error.message }),
		});
	},
);

// 404 handler
/**
 * Reports requests that do not match any registered route.
 * @param req unmatched request
 * @param res response used to report the missing route
 */
app.use((_req: express.Request, res: express.Response) => {
	Logger.warn(`⚠️  [404] Route not found: ${_req.method} ${_req.path}`);
	res.status(404).json({ error: "Route not found" });
});

export default app;
