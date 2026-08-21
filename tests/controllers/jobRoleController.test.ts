import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/jobRoleController.js";

const createMockResponse = () => {
	const json = vi.fn();
	const status = vi.fn().mockReturnValue({ json });

	return { json, status };
};

describe("JobRoleController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return 200 with open job roles when getAllOpen succeeds", async () => {
		const service = {
			findAllOpen: vi.fn().mockResolvedValue([{ id: 1, roleName: "Engineer" }]),
			findById: vi.fn(),
		};
		const controller = new JobRoleController(service as never);
		const res = createMockResponse();

		await controller.getAllOpen(
			{ params: { status: "open" } } as never,
			res as never,
		);

		expect(service.findAllOpen).toHaveBeenCalledTimes(1);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith([{ id: 1, roleName: "Engineer" }]);
	});

	it("should return 404 when getById finds no job role", async () => {
		const service = {
			findAllOpen: vi.fn(),
			findById: vi.fn().mockResolvedValue(null),
		};
		const controller = new JobRoleController(service as never);
		const res = createMockResponse();

		await controller.getById({ params: { id: "12" } } as never, res as never);

		expect(service.findById).toHaveBeenCalledWith(12);
		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ error: "Job role not found" });
	});

	it("should return 200 when getById finds a job role", async () => {
		const role = {
			id: 12,
			roleName: "Platform Engineer",
			location: "Belfast",
			capability: { id: 1, name: "Engineering" },
			band: { id: 2, name: "Band 3" },
			closingDate: new Date("2026-12-31"),
			status: { id: 1, name: "open" },
			description: "We are looking for a Platform Engineer",
			responsibilities: "Design and maintain infrastructure",
			sharepointUrl: "https://sharepoint.example.com/roles/platform-engineer",
			numberOfOpenPositions: 1,
		};
		const service = {
			findAllOpen: vi.fn(),
			findById: vi.fn().mockResolvedValue(role),
		};
		const controller = new JobRoleController(service as never);
		const res = createMockResponse();

		await controller.getById({ params: { id: "12" } } as never, res as never);

		expect(service.findById).toHaveBeenCalledWith(12);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(role);
	});

	it("should return 500 when getAllOpen's service call fails", async () => {
		const service = {
			findAllOpen: vi.fn().mockRejectedValue(new Error("Database error")),
			findById: vi.fn(),
		};
		const controller = new JobRoleController(service as never);
		const res = createMockResponse();

		await controller.getAllOpen(
			{ params: { status: "open" } } as never,
			res as never,
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			error: "Failed to fetch job roles",
		});
	});

	it("should return 500 when getById's service call fails", async () => {
		const service = {
			findAllOpen: vi.fn(),
			findById: vi.fn().mockRejectedValue(new Error("Database error")),
		};
		const controller = new JobRoleController(service as never);
		const res = createMockResponse();

		await controller.getById({ params: { id: "12" } } as never, res as never);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			error: "Failed to fetch job role",
		});
	});

	it("should return 500 when getAllOpen's service rejects with a non-Error value", async () => {
		const service = {
			findAllOpen: vi.fn().mockRejectedValue("boom"),
			findById: vi.fn(),
		};
		const controller = new JobRoleController(service as never);
		const res = createMockResponse();

		await controller.getAllOpen(
			{ params: { status: "open" } } as never,
			res as never,
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			error: "Failed to fetch job roles",
		});
	});

	it("should return 500 when getById's service rejects with a non-Error value", async () => {
		const service = {
			findAllOpen: vi.fn(),
			findById: vi.fn().mockRejectedValue("boom"),
		};
		const controller = new JobRoleController(service as never);
		const res = createMockResponse();

		await controller.getById({ params: { id: "12" } } as never, res as never);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			error: "Failed to fetch job role",
		});
	});
});
