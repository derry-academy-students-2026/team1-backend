import express from "express";

import morganMiddleware from "./config/morganMiddleware.js";
import healthRouter from "./routes/healthRouter.js";

export const app = express();

// Middleware
app.use(express.json());
app.use(morganMiddleware);

app.use(healthRouter);

export default app;
