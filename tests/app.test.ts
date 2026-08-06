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
