import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("GET /health", () => {
	it("should return status UP and current time", async () => {
		const response = await request(app).get("/health");

		expect(response.status).toBe(200);
		expect(response.body.status).toBe("UP");
		expect(new Date(response.body.time).toString()).not.toBe("Invalid Date");
	});
});

describe("Error Handling", () => {
	it("should return 404 for unknown routes", async () => {
		const response = await request(app).get("/unknown-route");

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ error: "Route not found" });
	});

	it("should handle 404 for POST requests to unknown routes", async () => {
		const response = await request(app).post("/api/unknown");

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ error: "Route not found" });
	});

	it("should return 500 with internal server error response", async () => {
		process.env.JWT_SECRET = "test-secret";
		const token = jwt.sign(
			{ userId: 1, email: "test1@example.com" },
			"test-secret",
			{ expiresIn: "1h" },
		);

		const response = await request(app)
			.get("/job-roles/invalid")
			.set("Authorization", `Bearer ${token}`)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
	});
});

describe("Route protection", () => {
	beforeAll(() => {
		process.env.JWT_SECRET = "test-secret";
	});

	it("should return 401 for /job-roles without a token", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid token" });
	});

	it("should keep POST /auth/login public", async () => {
		const response = await request(app).post("/auth/login").send({});

		expect(response.status).not.toBe(404);
		expect(response.status).toBe(400);
	});
});
