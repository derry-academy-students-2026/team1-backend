import type {
	JobRoleDetailedResponseDto,
	JobRoleResponseDto,
} from "../dtos/jobRoleDto.js";
import Logger from "../lib/logger.js";
import {
	mapToJobRoleDetailedResponseDto,
	mapToJobRoleResponseDto,
} from "../mappers/jobRoleMapper.js";
import prisma from "../prismaClient.js";

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
					status: true,
				},

				where: {
					status: {
						is: {
							statusName: {
								equals: "open",
								mode: "insensitive",
							},
						},
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
	 * Finds a job role by its ID and returns it as a JobRoleDetailedResponseDto object with complete job information.
	 * @param id The ID of the job role to find.
	 * @returns A promise that resolves to a JobRoleDetailedResponseDto object representing the job role with full details, or null if not found.
	 * @throws Will throw an error if the database query fails.
	 */
	public async findById(
		id: number,
	): Promise<JobRoleDetailedResponseDto | null> {
		Logger.debug(`🔍 Looking up job role with ID: ${id}`);

		try {
			const jobRole = await prisma.jobRole.findUnique({
				where: { jobRoleId: id },
				include: {
					capability: true,
					band: true,
					status: true,
				},
			});

			if (!jobRole) {
				Logger.warn(`⚠️  Job role with ID ${id} not found`);
				return null;
			}

			Logger.info(
				`✅ Successfully retrieved job role: "${jobRole.roleName}" (ID: ${id})`,
			);
			return mapToJobRoleDetailedResponseDto(jobRole);
		} catch (error) {
			Logger.error(
				`❌ Failed to fetch job role ID ${id}: ${error instanceof Error ? error.message : String(error)}`,
			);
			throw error;
		}
	}
}
