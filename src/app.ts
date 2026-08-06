import express from "express";

export const app = express();

// Middleware
app.use(express.json());

// Health endpoint
app.get("/health", (_req, res) => {
	res.json({ status: "UP", time: new Date().toISOString() });
});