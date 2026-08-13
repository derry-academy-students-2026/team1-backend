import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		jobRole: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
		},
	},
}));

import prisma from "../../src/prismaClient.js";
import { JobRoleService } from "../../src/services/jobRoleService.js";

const sampleDbJobRole = {
	jobRoleId: 1,
	roleName: "Software Engineer",
	location: "Belfast",
	closingDate: new Date("2026-12-31T00:00:00.000Z"),
	status: {
		statusId: 1,
		statusName: "open",
	},
	capability: {
		capabilityId: 2,
		capabilityName: "Engineering",
	},
	band: {
		bandId: 3,
		bandName: "Band 3",
	},
};

describe("JobRoleService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("findAllOpen should query open roles and map them to response DTOs", async () => {
		vi.mocked(prisma.jobRole.findMany).mockResolvedValue([
			sampleDbJobRole,
		] as never);

		const service = new JobRoleService();
		const result = await service.findAllOpen();

		expect(prisma.jobRole.findMany).toHaveBeenCalledWith({
			include: {
				capability: true,
				band: true,
				status: true,
			},
			where: {
				status: {
					equals: "open",
					mode: "insensitive",
				},
			},
		});

		expect(result).toEqual([
			{
				id: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				capability: {
					id: 2,
					name: "Engineering",
				},
				band: {
					id: 3,
					name: "Band 3",
				},
				closingDate: new Date("2026-12-31T00:00:00.000Z"),
				status: {
					id: 1,
					name: "open",
				},
			},
		]);
	});

	it("findById should return null when no job role is found", async () => {
		vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(null as never);

		const service = new JobRoleService();
		const result = await service.findById(42);

		expect(prisma.jobRole.findUnique).toHaveBeenCalledWith({
			where: { jobRoleId: 42 },
			include: {
				capability: true,
				band: true,
				status: true,
			},
		});
		expect(result).toBeNull();
	});

	it("findById should map database model when a job role exists", async () => {
		vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(
			sampleDbJobRole as never,
		);

		const service = new JobRoleService();
		const result = await service.findById(1);

		expect(result).toEqual({
			id: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			capability: {
				id: 2,
				name: "Engineering",
			},
			band: {
				id: 3,
				name: "Band 3",
			},
			closingDate: new Date("2026-12-31T00:00:00.000Z"),
			status: {
				id: 1,
				name: "open",
			},
		});
	});
});
