import type {
	ApplicationResponseDto,
	CreateApplicationDto,
} from "../dtos/applicationDto.js";
import Logger from "../lib/logger.js";
import { mapToApplicationResponseDto } from "../mappers/applicationMapper.js";
import prisma from "../prismaClient.js";

export type ApplicationErrorCode =
	| "ROLE_NOT_FOUND"
	| "ROLE_CLOSED"
	| "DUPLICATE_APPLICATION";

export class ApplicationError extends Error {
	constructor(public readonly code: ApplicationErrorCode) {
		super(code);
		this.name = "ApplicationError";
	}
}

const isUniqueConstraintViolation = (error: unknown): boolean =>
	(error as { code?: string })?.code === "P2002";

/**
 * Service class for managing applications to job roles.
 * Enforces that a role is still accepting applications and that an account can
 * only apply to a given role once.
 */
export class ApplicationService {
	/**
	 * Creates an application for a job role on behalf of the signed-in account.
	 * @param jobRoleId The ID of the job role being applied for.
	 * @param userId The ID of the account submitting the application, taken from the JWT.
	 * @param dto The validated applicant details.
	 * @returns A promise that resolves to the created application as a response DTO.
	 * @throws {ApplicationError} When the role is missing, closed, or already applied for.
	 */
	public async create(
		jobRoleId: number,
		userId: number,
		dto: CreateApplicationDto,
	): Promise<ApplicationResponseDto> {
		Logger.debug(
			`📝 Creating application for job role ID ${jobRoleId} by user ID ${userId}...`,
		);

		try {
			const jobRole = await prisma.jobRole.findUnique({
				where: { jobRoleId },
				include: { status: true },
			});

			if (!jobRole) {
				Logger.warn(`⚠️  Job role with ID ${jobRoleId} not found`);
				throw new ApplicationError("ROLE_NOT_FOUND");
			}

			if (
				jobRole.status.statusName.toLowerCase() !== "open" ||
				jobRole.numberOfOpenPositions <= 0
			) {
				Logger.warn(
					`⚠️  Job role ID ${jobRoleId} is not accepting applications (status: "${jobRole.status.statusName}", open positions: ${jobRole.numberOfOpenPositions})`,
				);
				throw new ApplicationError("ROLE_CLOSED");
			}

			// status and createdAt come from the schema defaults, never from the caller
			const application = await prisma.application.create({
				data: {
					jobRoleId,
					userId,
					applicantName: dto.applicantName,
					applicantEmail: dto.applicantEmail,
					phoneNumber: dto.phoneNumber,
					address: dto.address,
					linkedInUrl: dto.linkedInUrl ?? null,
					coverLetter: dto.coverLetter,
				},
			});

			Logger.info(
				`✅ Created application ID ${application.applicationId} for job role ID ${jobRoleId}`,
			);
			return mapToApplicationResponseDto(application);
		} catch (error) {
			if (error instanceof ApplicationError) {
				throw error;
			}

			if (isUniqueConstraintViolation(error)) {
				Logger.warn(
					`⚠️  User ID ${userId} has already applied for job role ID ${jobRoleId}`,
				);
				throw new ApplicationError("DUPLICATE_APPLICATION");
			}

			Logger.error(
				`❌ Failed to create application for job role ID ${jobRoleId}: ${error instanceof Error ? error.message : String(error)}`,
			);
			throw error;
		}
	}

	/**
	 * Finds every application submitted for a job role, newest first.
	 * @param jobRoleId The ID of the job role whose applicants are requested.
	 * @returns A promise that resolves to an array of ApplicationResponseDto objects.
	 * @throws {ApplicationError} When no job role exists with that ID.
	 */
	public async findByRoleId(
		jobRoleId: number,
	): Promise<ApplicationResponseDto[]> {
		Logger.debug(`🔍 Fetching applications for job role ID: ${jobRoleId}`);

		try {
			const jobRole = await prisma.jobRole.findUnique({
				where: { jobRoleId },
			});

			if (!jobRole) {
				Logger.warn(`⚠️  Job role with ID ${jobRoleId} not found`);
				throw new ApplicationError("ROLE_NOT_FOUND");
			}

			const applications = await prisma.application.findMany({
				where: { jobRoleId },
				orderBy: { createdAt: "desc" },
			});

			Logger.info(
				`✅ Successfully retrieved ${applications.length} application(s) for job role ID ${jobRoleId}`,
			);
			return applications.map(mapToApplicationResponseDto);
		} catch (error) {
			if (error instanceof ApplicationError) {
				throw error;
			}

			Logger.error(
				`❌ Failed to fetch applications for job role ID ${jobRoleId}: ${error instanceof Error ? error.message : String(error)}`,
			);
			throw error;
		}
	}
}
