import express from "express";
import jwt from "jsonwebtoken";
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

const TEST_SECRET = "test-secret";

describe("jobRolesRouter", () => {
	let token: string;

	beforeEach(() => {
		vi.clearAllMocks();
		process.env.JWT_SECRET = TEST_SECRET;
		token = jwt.sign({ userId: 1, email: "test1@example.com" }, TEST_SECRET, {
			expiresIn: "1h",
		});
	});

	it("GET /job-roles should delegate to getAllOpen", async () => {
		const app = express();
		app.use("/job-roles", jobRolesRouter);

		const response = await request(app)
			.get("/job-roles")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual([{ id: 1, roleName: "Engineer" }]);
		expect(mockGetAllOpen).toHaveBeenCalledTimes(1);
	});

	it("GET /job-roles/:id should delegate to getById", async () => {
		const app = express();
		app.use("/job-roles", jobRolesRouter);

		const response = await request(app)
			.get("/job-roles/1")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ id: 1, roleName: "Engineer" });
		expect(mockGetById).toHaveBeenCalledTimes(1);
	});

	it("GET /job-roles should return 401 without a token", async () => {
		const app = express();
		app.use("/job-roles", jobRolesRouter);

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid token" });
		expect(mockGetAllOpen).not.toHaveBeenCalled();
	});
});
