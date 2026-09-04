import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreate, mockGetByRoleId } = vi.hoisted(() => ({
	mockCreate: vi.fn((_req, res) => {
		res.status(201).json({ id: 10, roleId: 1, status: "in progress" });
	}),
	mockGetByRoleId: vi.fn((_req, res) => {
		res.status(200).json([{ id: 10, roleId: 1 }]);
	}),
}));

vi.mock("../../src/controllers/applicationController.js", () => ({
	ApplicationController: class {
		create = mockCreate;
		getByRoleId = mockGetByRoleId;
	},
}));

import applicationRouter from "../../src/routes/applicationRouter.js";

const TEST_SECRET = "test-secret";

const validApplication = {
	applicantName: "Ada Lovelace",
	applicantEmail: "ada@example.com",
	phoneNumber: "07700 900123",
	address: "1 Example Street, Belfast, BT1 1AA",
	coverLetter: "I am interested in this role.",
	rightToWork: "yes",
	privacyConsent: "on",
};

const createApp = () => {
	const app = express();
	app.use(express.json());
	app.use("/job-roles", applicationRouter);
	return app;
};

describe("applicationRouter", () => {
	let token: string;

	beforeEach(() => {
		vi.clearAllMocks();
		process.env.JWT_SECRET = TEST_SECRET;
		token = jwt.sign({ userId: 1, email: "test1@example.com" }, TEST_SECRET, {
			expiresIn: "1h",
		});
	});

	it("POST /job-roles/:id/apply should delegate to create", async () => {
		const response = await request(createApp())
			.post("/job-roles/1/apply")
			.set("Authorization", `Bearer ${token}`)
			.send(validApplication);

		expect(response.status).toBe(201);
		expect(response.body).toEqual({ id: 10, roleId: 1, status: "in progress" });
		expect(mockCreate).toHaveBeenCalledTimes(1);
	});

	it("POST /job-roles/:id/apply should return 400 for an invalid email", async () => {
		const response = await request(createApp())
			.post("/job-roles/1/apply")
			.set("Authorization", `Bearer ${token}`)
			.send({ ...validApplication, applicantEmail: "not-an-email" });

		expect(response.status).toBe(400);
		expect(response.body.errors).toEqual([
			{
				field: "applicantEmail",
				message:
					"Enter an email address in the correct format, like name@example.com",
			},
		]);
		expect(mockCreate).not.toHaveBeenCalled();
	});

	it.each([
		[
			"rightToWork",
			{ rightToWork: "maybe" },
			"Select whether you have the right to work in the UK/Ireland",
		],
		[
			"privacyConsent",
			{ privacyConsent: "off" },
			"Consent is required to submit your application",
		],
	] as const)(
		"POST /job-roles/:id/apply should return 400 for invalid %s",
		async (_field, invalidField, message) => {
			const response = await request(createApp())
				.post("/job-roles/1/apply")
				.set("Authorization", `Bearer ${token}`)
				.send({ ...validApplication, ...invalidField });

			expect(response.status).toBe(400);
			expect(response.body).toMatchObject({ message });
			expect(response.body.errors).toContainEqual({
				field: _field,
				message,
			});
			expect(mockCreate).not.toHaveBeenCalled();
		},
	);

	it("POST /job-roles/:id/apply should return 400 when new required fields are missing", async () => {
		const { rightToWork: _rightToWork, ...withoutRightToWork } = validApplication;
		const response = await request(createApp())
			.post("/job-roles/1/apply")
			.set("Authorization", `Bearer ${token}`)
			.send(withoutRightToWork);

		expect(response.status).toBe(400);
		expect(response.body.errors).toEqual([
			{
				field: "rightToWork",
				message: "Select whether you have the right to work in the UK/Ireland",
			},
		]);
		expect(mockCreate).not.toHaveBeenCalled();
	});

	it("POST /job-roles/:id/apply should return 400 for a non-numeric id", async () => {
		const response = await request(createApp())
			.post("/job-roles/abc/apply")
			.set("Authorization", `Bearer ${token}`)
			.send(validApplication);

		expect(response.status).toBe(400);
		expect(mockCreate).not.toHaveBeenCalled();
	});

	it("POST /job-roles/:id/apply should return 401 without a token", async () => {
		const response = await request(createApp())
			.post("/job-roles/1/apply")
			.send(validApplication);

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid token" });
		expect(mockCreate).not.toHaveBeenCalled();
	});

	it("GET /job-roles/:id/applications should delegate to getByRoleId", async () => {
		const response = await request(createApp())
			.get("/job-roles/1/applications")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual([{ id: 10, roleId: 1 }]);
		expect(mockGetByRoleId).toHaveBeenCalledTimes(1);
	});

	it("GET /job-roles/:id/applications should return 401 without a token", async () => {
		const response = await request(createApp()).get(
			"/job-roles/1/applications",
		);

		expect(response.status).toBe(401);
		expect(mockGetByRoleId).not.toHaveBeenCalled();
	});
});
