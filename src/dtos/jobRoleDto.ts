import { z } from "zod";

/** Schema for the GET/PUT/DELETE /job-roles/:id route params. */
export const IdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, "ID must be a number"),
});

export interface CapabilityDto {
	id: number;
	name: string;
}

export interface BandDto {
	id: number;
	name: string;
}

export interface StatusDto {
	id: number;
	name: string;
}

export interface JobRoleResponseDto {
	id: number;
	roleName: string;
	location: string;
	capability: CapabilityDto;
	band: BandDto;
	closingDate: Date;
	status: StatusDto;
}

export interface CreateJobRoleRequestDto {
	roleName: string;
	location: string;
	capabilityId: number;
	bandId: number;
	closingDate: Date;
	statusId: number;
}

export interface JobRoleDetailedResponseDto {
	id: number;
	roleName: string;
	location: string;
	capability: CapabilityDto;
	band: BandDto;
	closingDate: Date;
	status: StatusDto;
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	numberOfOpenPositions: number;
}
