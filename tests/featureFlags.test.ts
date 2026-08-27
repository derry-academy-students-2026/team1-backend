import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
	delete process.env.FEATURE_JOB_ROLES_ENABLED;
	vi.resetModules();
});

describe("job roles feature flag", () => {
	it("returns 404 for job role routes when disabled", async () => {
		process.env.FEATURE_JOB_ROLES_ENABLED = "false";
		vi.resetModules();

		const { app } = await import("../src/app.js");
		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ error: "Route not found" });
	});
});
