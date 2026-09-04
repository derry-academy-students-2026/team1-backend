import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationController } from "../../src/controllers/applicationController.js";
import { ApplicationError } from "../../src/services/applicationService.js";

const createMockResponse = () => {
	const json = vi.fn();
	const status = vi.fn().mockReturnValue({ json });

	return { json, status };
};

const applicationBody = {
	applicantName: "Ada Lovelace",
	applicantEmail: "ada@example.com",
	phoneNumber: "07700 900123",
	address: "1 Example Street, Belfast, BT1 1AA",
	coverLetter: "I am interested in this role.",
	rightToWork: "yes",
	privacyConsent: "on",
};

const createRequest = (overrides: Record<string, unknown> = {}) => ({
	params: { id: "1" },
	body: applicationBody,
	user: { userId: 7, email: "account@example.com" },
	...overrides,
});

const createStatusService = (hasApplied: boolean | Error) => ({
	create: vi.fn(),
	findByRoleId: vi.fn(),
	hasApplied:
		hasApplied instanceof Error
			? vi.fn().mockRejectedValue(hasApplied)
			: vi.fn().mockResolvedValue(hasApplied),
});

describe("ApplicationController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("create", () => {
		it("should return 201 with the created application", async () => {
			const created = { id: 10, roleId: 1, status: "in progress" };
			const service = {
				create: vi.fn().mockResolvedValue(created),
				findByRoleId: vi.fn(),
			};
			const controller = new ApplicationController(service as never);
			const res = createMockResponse();

			await controller.create(createRequest() as never, res as never);

			expect(service.create).toHaveBeenCalledWith(1, 7, applicationBody);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(created);
		});

		it("should take the user ID from the token rather than the request body", async () => {
			const service = {
				create: vi.fn().mockResolvedValue({ id: 10 }),
				findByRoleId: vi.fn(),
			};
			const controller = new ApplicationController(service as never);
			const res = createMockResponse();

			await controller.create(
				createRequest({
					body: { ...applicationBody, userId: 999 },
				}) as never,
				res as never,
			);

			expect(service.create.mock.calls[0][1]).toBe(7);
		});

		it.each([
			["ROLE_NOT_FOUND", 404, "Job role not found"],
			["ROLE_CLOSED", 409, "This role is no longer accepting applications"],
			["DUPLICATE_APPLICATION", 409, "You have already applied for this role"],
		] as const)(
			"should map %s to %i",
			async (code, expectedStatus, expectedMessage) => {
				const service = {
					create: vi.fn().mockRejectedValue(new ApplicationError(code)),
					findByRoleId: vi.fn(),
				};
				const controller = new ApplicationController(service as never);
				const res = createMockResponse();

				await controller.create(createRequest() as never, res as never);

				expect(res.status).toHaveBeenCalledWith(expectedStatus);
				expect(res.json).toHaveBeenCalledWith({ message: expectedMessage });
			},
		);

		it("should return 500 when the service fails unexpectedly", async () => {
			const service = {
				create: vi.fn().mockRejectedValue(new Error("Connection lost")),
				findByRoleId: vi.fn(),
			};
			const controller = new ApplicationController(service as never);
			const res = createMockResponse();

			await controller.create(createRequest() as never, res as never);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Failed to submit application",
			});
		});
	});

	describe("getStatus", () => {
		it("should return 200 with hasApplied true when the user has already applied", async () => {
			const service = createStatusService(true);
			const controller = new ApplicationController(service as never);
			const res = createMockResponse();

			await controller.getStatus(createRequest() as never, res as never);

			expect(service.hasApplied).toHaveBeenCalledWith(1, 7);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ hasApplied: true });
		});

		it("should return 200 with hasApplied false when the user has not applied", async () => {
			const service = createStatusService(false);
			const controller = new ApplicationController(service as never);
			const res = createMockResponse();

			await controller.getStatus(createRequest() as never, res as never);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ hasApplied: false });
		});

		it("should return 500 when the service fails unexpectedly", async () => {
			const service = createStatusService(new Error("Connection lost"));
			const controller = new ApplicationController(service as never);
			const res = createMockResponse();

			await controller.getStatus(createRequest() as never, res as never);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Failed to fetch application status",
			});
		});
	});

	describe("getByRoleId", () => {
		it("should return 200 with the role's applications", async () => {
			const applications = [{ id: 10, roleId: 1 }];
			const service = {
				create: vi.fn(),
				findByRoleId: vi.fn().mockResolvedValue(applications),
			};
			const controller = new ApplicationController(service as never);
			const res = createMockResponse();

			await controller.getByRoleId(
				{ params: { id: "1" } } as never,
				res as never,
			);

			expect(service.findByRoleId).toHaveBeenCalledWith(1);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(applications);
		});

		it("should return 404 when the job role does not exist", async () => {
			const service = {
				create: vi.fn(),
				findByRoleId: vi
					.fn()
					.mockRejectedValue(new ApplicationError("ROLE_NOT_FOUND")),
			};
			const controller = new ApplicationController(service as never);
			const res = createMockResponse();

			await controller.getByRoleId(
				{ params: { id: "1" } } as never,
				res as never,
			);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: "Job role not found" });
		});

		it("should return 500 when the service fails unexpectedly", async () => {
			const service = {
				create: vi.fn(),
				findByRoleId: vi.fn().mockRejectedValue(new Error("Connection lost")),
			};
			const controller = new ApplicationController(service as never);
			const res = createMockResponse();

			await controller.getByRoleId(
				{ params: { id: "1" } } as never,
				res as never,
			);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Failed to fetch applications",
			});
		});
	});
});
