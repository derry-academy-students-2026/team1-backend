import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockLogin, mockRegister } = vi.hoisted(() => ({
	mockLogin: vi.fn((_req, res) => {
		res.status(200).json({ token: "signed.jwt.value" });
	}),
	mockRegister: vi.fn((_req, res) => {
		res.status(201).json({ token: "signed.jwt.value" });
	}),
}));

vi.mock("../../src/controllers/authController.js", () => ({
	AuthController: class {
		login = mockLogin;
		register = mockRegister;
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

	it("POST /auth/register should delegate to register", async () => {
		const app = express();
		app.use(express.json());
		app.use("/auth", authRouter);

		const response = await request(app)
			.post("/auth/register")
			.send({ email: "new@example.com", password: "Password123!" });

		expect(response.status).toBe(201);
		expect(response.body).toEqual({ token: "signed.jwt.value" });
		expect(mockRegister).toHaveBeenCalledTimes(1);
	});

	it("POST /auth/register should reject an invalid email before reaching the controller", async () => {
		const app = express();
		app.use(express.json());
		app.use("/auth", authRouter);

		const response = await request(app)
			.post("/auth/register")
			.send({ email: "not-an-email", password: "Password123!" });

		expect(response.status).toBe(400);
		expect(response.body.errors).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ message: "Enter a valid email address" }),
			]),
		);
		expect(mockRegister).not.toHaveBeenCalled();
	});

	it("POST /auth/login should reject a weak password before reaching the controller", async () => {
		const app = express();
		app.use(express.json());
		app.use("/auth", authRouter);

		const response = await request(app)
			.post("/auth/login")
			.send({ email: "test1@example.com", password: "short" });

		expect(response.status).toBe(400);
		expect(response.body.errors.length).toBeGreaterThan(0);
		expect(mockLogin).not.toHaveBeenCalled();
	});
});
