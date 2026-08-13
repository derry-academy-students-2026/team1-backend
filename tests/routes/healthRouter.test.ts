import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/controllers/healthController.js", () => ({
	getHealth: vi.fn((_req, res) => {
		res.status(200).json({ status: "UP" });
	}),
}));

import { getHealth } from "../../src/controllers/healthController.js";
import healthRouter from "../../src/routes/healthRouter.js";

describe("healthRouter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("GET /health should call controller and return response", async () => {
		const app = express();
		app.use(healthRouter);

		const response = await request(app).get("/health");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ status: "UP" });
		expect(getHealth).toHaveBeenCalledTimes(1);
	});
});
