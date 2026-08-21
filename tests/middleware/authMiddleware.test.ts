import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { requireAuth } from "../../src/middleware/authMiddleware.js";

const TEST_SECRET = "test-secret";

const buildApp = () => {
	const app = express();
	app.get("/protected", requireAuth, (req, res) => {
		res.status(200).json({ user: req.user });
	});
	return app;
};

describe("requireAuth", () => {
	beforeEach(() => {
		process.env.JWT_SECRET = TEST_SECRET;
	});

	it("should allow the request through with a valid bearer token", async () => {
		const token = jwt.sign(
			{ userId: 1, email: "test1@example.com" },
			TEST_SECRET,
			{ expiresIn: "1h" },
		);

		const response = await request(buildApp())
			.get("/protected")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body.user).toEqual({
			userId: 1,
			email: "test1@example.com",
		});
	});

	it("should return 401 when the Authorization header is missing", async () => {
		const response = await request(buildApp()).get("/protected");

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid token" });
	});

	it("should return 401 when the scheme is not Bearer", async () => {
		const response = await request(buildApp())
			.get("/protected")
			.set("Authorization", "Basic abc123");

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid token" });
	});

	it("should return 401 for a malformed token", async () => {
		const response = await request(buildApp())
			.get("/protected")
			.set("Authorization", "Bearer not-a-jwt");

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid token" });
	});

	it("should return 401 for a validly signed token with a malformed payload", async () => {
		const token = jwt.sign({ userId: "not-a-number", email: 123 }, TEST_SECRET);

		const response = await request(buildApp())
			.get("/protected")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid token" });
	});

	it("should return 401 for a token signed with a different secret", async () => {
		const token = jwt.sign({ userId: 1, email: "a@b.com" }, "other-secret");

		const response = await request(buildApp())
			.get("/protected")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(401);
	});

	it("should return 401 for an expired token", async () => {
		const token = jwt.sign({ userId: 1, email: "a@b.com" }, TEST_SECRET, {
			expiresIn: "-1s",
		});

		const response = await request(buildApp())
			.get("/protected")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(401);
	});

	it("should return 401 when JWT_SECRET is not configured", async () => {
		const token = jwt.sign({ userId: 1, email: "a@b.com" }, TEST_SECRET);
		process.env.JWT_SECRET = "";

		const response = await request(buildApp())
			.get("/protected")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(401);
	});
});
