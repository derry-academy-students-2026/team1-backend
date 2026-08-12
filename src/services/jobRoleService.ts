import type { JobRoleResponseDto } from "../dtos/jobRoleDto.js";
import Logger from "../lib/logger.js";
import prisma from "../prismaClient.js";

/**
 * Maps a job role from the database to a response DTO.
 * @param jobRole The job role object retrieved from the database.
 * @returns A JobRoleResponseDto object.
 */

const mapToJobRoleResponseDto = (jobRole: {
	jobRoleId: number;
	roleName: string;
	location: string;
	closingDate: Date;
	status: string;
	capability: {
		capabilityId: number;
		capabilityName: string;
	};
	band: {
		bandId: number;
		bandName: string;
	};
}): JobRoleResponseDto => ({
	id: jobRole.jobRoleId,
	roleName: jobRole.roleName,
	location: jobRole.location,
	capability: {
		id: jobRole.capability.capabilityId,
		name: jobRole.capability.capabilityName,
	},
	band: {
		id: jobRole.band.bandId,
		name: jobRole.band.bandName,
	},
	closingDate: jobRole.closingDate,
	status: jobRole.status,
});

/**
 * Service class for managing job roles. Provides methods to find all open job roles, find a job role by ID, and create a new job role.
 * This service interacts with the database using Prisma ORM.
 * It maps database entities to response DTOs for API responses.
 */

export class JobRoleService {
	/**
	 * Finds all open job roles in the database and returns them as an array of JobRoleResponseDto objects.
	 * @returns A promise that resolves to an array of JobRoleResponseDto objects representing all open job roles.
	 * @throws Will throw an error if the database query fails.
	 */
	public async findAllOpen(): Promise<JobRoleResponseDto[]> {
		Logger.debug("📋 Fetching all open job roles from database...");

		try {
			const jobRoles = await prisma.jobRole.findMany({
				include: {
					capability: true,
					band: true,
				},

				where: {
					status: {
						equals: "open",
						mode: "insensitive",
					},
				},
			});

			Logger.info(
				`✅ Successfully retrieved ${jobRoles.length} open job role(s)`,
			);

			if (jobRoles.length === 0) {
				Logger.warn("⚠️  No open job roles found in database");
			}

			return jobRoles.map(mapToJobRoleResponseDto);
		} catch (error) {
			Logger.error(
				`❌ Failed to fetch open job roles: ${error instanceof Error ? error.message : String(error)}`,
			);
			throw error;
		}
	}

	/**
	 * Finds a job role by its ID and returns it as a JobRoleResponseDto object.
	 * @param id The ID of the job role to find.
	 * @returns A promise that resolves to a JobRoleResponseDto object representing the job role, or null if not found.
	 * @throws Will throw an error if the database query fails.
	 */
	public async findById(id: number): Promise<JobRoleResponseDto | null> {
		Logger.debug(`🔍 Looking up job role with ID: ${id}`);

		try {
			const jobRole = await prisma.jobRole.findUnique({
				where: { jobRoleId: id },
				include: {
					capability: true,
					band: true,
				},
			});

			if (!jobRole) {
				Logger.warn(`⚠️  Job role with ID ${id} not found`);
				return null;
			}

			Logger.info(
				`✅ Successfully retrieved job role: "${jobRole.roleName}" (ID: ${id})`,
			);
			return mapToJobRoleResponseDto(jobRole);
		} catch (error) {
			Logger.error(
				`❌ Failed to fetch job role ID ${id}: ${error instanceof Error ? error.message : String(error)}`,
			);
			throw error;
		}
	}
}
