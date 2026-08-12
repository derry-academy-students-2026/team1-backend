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

	it("getAllOpen should return 200 with open job roles", async () => {
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

	it("getById should return 400 when id is not numeric", async () => {
		const service = {
			findAllOpen: vi.fn(),
			findById: vi.fn(),
		};
		const controller = new JobRoleController(service as never);
		const res = createMockResponse();

		await controller.getById({ params: { id: "abc" } } as never, res as never);

		expect(service.findById).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: "ID must be a number" });
	});

	it("getById should return 404 when no job role exists", async () => {
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

	it("getById should return 200 when job role exists", async () => {
		const role = { id: 12, roleName: "Platform Engineer" };
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
});
