

export interface JobRoleResponseDto {
    id: number;
    roleName: string;
    location: string;
    capabilityId: number;
    bandId: number;
    closingDate: Date;
    status: string;
}

export interface CreateJobRoleRequestDto {
    roleName: string;
    location: string;
    capabilityId: number;
    bandId: number;
    closingDate: Date;
    status: string;
}





