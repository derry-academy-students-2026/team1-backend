

export interface JobRoleResponseDto {
    id: number;
    jobRoleName: string;
    location: string;
    capabilityId: number;
    bandId: number;
    closingDate: string;
    status: string;
}

export interface CreateJobRoleRequestDto {
    jobRoleName: string;
    location: string;
    capabilityId: number;
    bandId: number;
    closingDate: string;
    status: string;
}





