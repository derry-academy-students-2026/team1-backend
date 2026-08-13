import type { JobRoleResponseDto, JobRoleDetailedResponseDto } from "../dtos/jobRoleDto.js";

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
): JobRoleResponseDto => ({
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
});

export const mapToJobRoleDetailedResponseDto = (
    jobRole: JobRoleWithRelations & {
        description: string;
        responsibilities: string;
        sharepointUrl: string;
        numberOfOpenPositions: number;
    }
): JobRoleDetailedResponseDto => ({
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
});