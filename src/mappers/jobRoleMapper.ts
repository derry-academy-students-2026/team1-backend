import type {
	JobRoleDetailedResponseDto,
	JobRoleResponseDto,
} from "../dtos/jobRoleDto.js";
import Logger from "../lib/logger.js";

type JobRoleWithRelations = {
	jobRoleId: number;
	roleName: string;
	location: string;
	closingDate: Date;
	status: {
		statusId: number;
		statusName: string;
	};
	capability: {
		capabilityId: number;
		capabilityName: string;
	};
	band: {
		bandId: number;
		bandName: string;
	};
};

/**
 * Maps a job role from the database to a response DTO.
 * @param jobRole The job role object retrieved from the database.
 * @returns A JobRoleResponseDto object.
 */

export const mapToJobRoleResponseDto = (
	jobRole: JobRoleWithRelations,
): JobRoleResponseDto => {
	Logger.debug(
		`Mapping job role "${jobRole.roleName}" (ID: ${jobRole.jobRoleId}) to response DTO`,
	);

	return {
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
		status: {
			id: jobRole.status.statusId,
			name: jobRole.status.statusName,
		},
	};
};

/**
 * Maps a detailed job role from the database to a detailed response DTO.
 * @param jobRole The job role object retrieved from the database, including extended details.
 * @returns A JobRoleDetailedResponseDto object containing complete job role information.
 */
export const mapToJobRoleDetailedResponseDto = (
	jobRole: JobRoleWithRelations & {
		description: string;
		responsibilities: string;
		sharepointUrl: string;
		numberOfOpenPositions: number;
	},
): JobRoleDetailedResponseDto => {
	Logger.debug(
		`Mapping detailed job role "${jobRole.roleName}" (ID: ${jobRole.jobRoleId}) to detailed response DTO`,
	);

	return {
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
		status: {
			id: jobRole.status.statusId,
			name: jobRole.status.statusName,
		},
		description: jobRole.description,
		responsibilities: jobRole.responsibilities,
		sharepointUrl: jobRole.sharepointUrl,
		numberOfOpenPositions: jobRole.numberOfOpenPositions,
	};
};
