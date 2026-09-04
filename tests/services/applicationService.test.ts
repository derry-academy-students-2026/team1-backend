import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		jobRole: {
			findUnique: vi.fn(),
		},
		application: {
			create: vi.fn(),
			findMany: vi.fn(),
			findUnique: vi.fn(),
		},
	},
}));

import prisma from "../../src/prismaClient.js";
import {
	ApplicationError,
	ApplicationService,
} from "../../src/services/applicationService.js";

const JOB_ROLE_ID = 1;
const USER_ID = 7;

const openJobRole = {
	jobRoleId: JOB_ROLE_ID,
	roleName: "Software Engineer",
	numberOfOpenPositions: 2,
	status: { statusId: 1, statusName: "open" },
};

const applicationInput = {
	applicantName: "Ada Lovelace",
	applicantEmail: "ada@example.com",
	phoneNumber: "07700 900123",
	address: "1 Example Street, Belfast, BT1 1AA",
	linkedInUrl: "https://www.linkedin.com/in/ada",
	coverLetter: "I am interested in this role.",
	rightToWork: "yes" as const,
	privacyConsent: "on" as const,
};

const sampleDbApplication = {
	applicationId: 10,
	jobRoleId: JOB_ROLE_ID,
	userId: USER_ID,
	...applicationInput,
	linkedInUrl: applicationInput.linkedInUrl as string | null,
	status: "in progress",
	createdAt: new Date("2026-09-03T10:15:00.000Z"),
};

const expectedDto = {
	id: 10,
	roleId: JOB_ROLE_ID,
	applicantName: applicationInput.applicantName,
	applicantEmail: applicationInput.applicantEmail,
	phoneNumber: applicationInput.phoneNumber,
	address: applicationInput.address,
	linkedInUrl: applicationInput.linkedInUrl,
	coverLetter: applicationInput.coverLetter,
	rightToWork: applicationInput.rightToWork,
	privacyConsent: applicationInput.privacyConsent,
	status: "in progress",
	createdAt: sampleDbApplication.createdAt,
};

describe("ApplicationService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("create", () => {
		it("should persist the applicant details against the role and the signed-in user", async () => {
			vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(
				openJobRole as never,
			);
			vi.mocked(prisma.application.create).mockResolvedValue(
				sampleDbApplication as never,
			);

			const service = new ApplicationService();
			const result = await service.create(
				JOB_ROLE_ID,
				USER_ID,
				applicationInput,
			);

			expect(prisma.application.create).toHaveBeenCalledWith({
				data: {
					jobRoleId: JOB_ROLE_ID,
					userId: USER_ID,
					applicantName: applicationInput.applicantName,
					applicantEmail: applicationInput.applicantEmail,
					phoneNumber: applicationInput.phoneNumber,
					address: applicationInput.address,
					linkedInUrl: applicationInput.linkedInUrl,
					coverLetter: applicationInput.coverLetter,
					rightToWork: applicationInput.rightToWork,
					privacyConsent: applicationInput.privacyConsent,
				},
			});
			expect(result).toEqual(expectedDto);
		});

		it("should leave status to the schema default rather than setting it explicitly", async () => {
			vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(
				openJobRole as never,
			);
			vi.mocked(prisma.application.create).mockResolvedValue(
				sampleDbApplication as never,
			);

			const service = new ApplicationService();
			const result = await service.create(
				JOB_ROLE_ID,
				USER_ID,
				applicationInput,
			);

			const createArgs = vi.mocked(prisma.application.create).mock.calls[0][0];
			expect(createArgs.data).not.toHaveProperty("status");
			expect(result.status).toBe("in progress");
		});

		it("should store a missing linkedInUrl as null", async () => {
			vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(
				openJobRole as never,
			);
			vi.mocked(prisma.application.create).mockResolvedValue({
				...sampleDbApplication,
				linkedInUrl: null,
			} as never);

			const service = new ApplicationService();
			const result = await service.create(JOB_ROLE_ID, USER_ID, {
				...applicationInput,
				linkedInUrl: undefined,
			});

			const createArgs = vi.mocked(prisma.application.create).mock.calls[0][0];
			expect(createArgs.data).toMatchObject({ linkedInUrl: null });
			expect(result.linkedInUrl).toBeNull();
		});

		it("should accept a role whose status name is capitalised", async () => {
			vi.mocked(prisma.jobRole.findUnique).mockResolvedValue({
				...openJobRole,
				status: { statusId: 1, statusName: "Open" },
			} as never);
			vi.mocked(prisma.application.create).mockResolvedValue(
				sampleDbApplication as never,
			);

			const service = new ApplicationService();

			await expect(
				service.create(JOB_ROLE_ID, USER_ID, applicationInput),
			).resolves.toEqual(expectedDto);
		});

		it("should throw ROLE_NOT_FOUND when the job role does not exist", async () => {
			vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(null as never);

			const service = new ApplicationService();

			await expect(
				service.create(JOB_ROLE_ID, USER_ID, applicationInput),
			).rejects.toThrow(new ApplicationError("ROLE_NOT_FOUND"));
			expect(prisma.application.create).not.toHaveBeenCalled();
		});

		it("should throw ROLE_CLOSED when the role status is not open", async () => {
			vi.mocked(prisma.jobRole.findUnique).mockResolvedValue({
				...openJobRole,
				status: { statusId: 2, statusName: "closed" },
			} as never);

			const service = new ApplicationService();

			await expect(
				service.create(JOB_ROLE_ID, USER_ID, applicationInput),
			).rejects.toThrow(new ApplicationError("ROLE_CLOSED"));
			expect(prisma.application.create).not.toHaveBeenCalled();
		});

		it("should throw ROLE_CLOSED when there are no open positions left", async () => {
			vi.mocked(prisma.jobRole.findUnique).mockResolvedValue({
				...openJobRole,
				numberOfOpenPositions: 0,
			} as never);

			const service = new ApplicationService();

			await expect(
				service.create(JOB_ROLE_ID, USER_ID, applicationInput),
			).rejects.toThrow(new ApplicationError("ROLE_CLOSED"));
			expect(prisma.application.create).not.toHaveBeenCalled();
		});

		it("should translate a Prisma unique constraint violation into DUPLICATE_APPLICATION", async () => {
			vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(
				openJobRole as never,
			);
			vi.mocked(prisma.application.create).mockRejectedValue(
				Object.assign(new Error("Unique constraint failed"), { code: "P2002" }),
			);

			const service = new ApplicationService();

			await expect(
				service.create(JOB_ROLE_ID, USER_ID, applicationInput),
			).rejects.toThrow(new ApplicationError("DUPLICATE_APPLICATION"));
		});

		it("should rethrow unexpected database errors", async () => {
			vi.mocked(prisma.jobRole.findUnique).mockRejectedValue(
				new Error("Connection lost"),
			);

			const service = new ApplicationService();

			await expect(
				service.create(JOB_ROLE_ID, USER_ID, applicationInput),
			).rejects.toThrow("Connection lost");
		});
	});

	describe("hasApplied", () => {
		it("should return true when an application already exists for the role and user", async () => {
			vi.mocked(prisma.application.findUnique).mockResolvedValue(
				sampleDbApplication as never,
			);

			const service = new ApplicationService();
			const result = await service.hasApplied(JOB_ROLE_ID, USER_ID);

			expect(prisma.application.findUnique).toHaveBeenCalledWith({
				where: { jobRoleId_userId: { jobRoleId: JOB_ROLE_ID, userId: USER_ID } },
			});
			expect(result).toBe(true);
		});

		it("should return false when no application exists for the role and user", async () => {
			vi.mocked(prisma.application.findUnique).mockResolvedValue(null);

			const service = new ApplicationService();
			const result = await service.hasApplied(JOB_ROLE_ID, USER_ID);

			expect(result).toBe(false);
		});
	});

	describe("findByRoleId", () => {
		it("should return the role's applications newest first", async () => {
			vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(
				openJobRole as never,
			);
			vi.mocked(prisma.application.findMany).mockResolvedValue([
				sampleDbApplication,
			] as never);

			const service = new ApplicationService();
			const result = await service.findByRoleId(JOB_ROLE_ID);

			expect(prisma.application.findMany).toHaveBeenCalledWith({
				where: { jobRoleId: JOB_ROLE_ID },
				orderBy: { createdAt: "desc" },
			});
			expect(result).toEqual([expectedDto]);
		});

		it("should throw ROLE_NOT_FOUND when the job role does not exist", async () => {
			vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(null as never);

			const service = new ApplicationService();

			await expect(service.findByRoleId(JOB_ROLE_ID)).rejects.toThrow(
				new ApplicationError("ROLE_NOT_FOUND"),
			);
			expect(prisma.application.findMany).not.toHaveBeenCalled();
		});
	});
});
