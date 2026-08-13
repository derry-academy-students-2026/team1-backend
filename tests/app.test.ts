import request from "supertest";
import { describe, expect, it } from "vitest";
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
		const response = await request(app)
			.get("/job-roles/invalid")
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
	});
});
