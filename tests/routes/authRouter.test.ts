import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockLogin } = vi.hoisted(() => ({
	mockLogin: vi.fn((_req, res) => {
		res.status(200).json({ token: "signed.jwt.value" });
	}),
}));

vi.mock("../../src/controllers/authController.js", () => ({
	AuthController: class {
		login = mockLogin;
	},
}));

import authRouter from "../../src/routes/authRouter.js";

describe("authRouter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("POST /auth/login should delegate to login", async () => {
		const app = express();
		app.use(express.json());
		app.use("/auth", authRouter);

		const response = await request(app)
			.post("/auth/login")
			.send({ email: "test1@example.com", password: "Password123!" });

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ token: "signed.jwt.value" });
		expect(mockLogin).toHaveBeenCalledTimes(1);
	});

	it("GET /auth/login should not be routed", async () => {
		const app = express();
		app.use("/auth", authRouter);

		const response = await request(app).get("/auth/login");

		expect(response.status).toBe(404);
		expect(mockLogin).not.toHaveBeenCalled();
	});
});
