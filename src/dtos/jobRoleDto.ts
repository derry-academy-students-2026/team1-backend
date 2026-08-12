

export interface CapabilityDto {
    id: number;
    name: string;
}

export interface BandDto {
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





