import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetAllOpen, mockGetById } = vi.hoisted(() => ({
	mockGetAllOpen: vi.fn((_req, res) => {
		res.status(200).json([{ id: 1, roleName: "Engineer" }]);
	}),
	mockGetById: vi.fn((_req, res) => {
		res.status(200).json({ id: 1, roleName: "Engineer" });
	}),
}));

vi.mock("../../src/controllers/jobRoleController.js", () => ({
	JobRoleController: class {
		getAllOpen = mockGetAllOpen;
		getById = mockGetById;
	},
}));

import jobRolesRouter from "../../src/routes/jobRolesRouter.js";

describe("jobRolesRouter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("GET /job-roles should delegate to getAllOpen", async () => {
		const app = express();
		app.use("/job-roles", jobRolesRouter);

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.body).toEqual([{ id: 1, roleName: "Engineer" }]);
		expect(mockGetAllOpen).toHaveBeenCalledTimes(1);
	});

	it("GET /job-roles/:id should delegate to getById", async () => {
		const app = express();
		app.use("/job-roles", jobRolesRouter);

		const response = await request(app).get("/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ id: 1, roleName: "Engineer" });
		expect(mockGetById).toHaveBeenCalledTimes(1);
	});
});
