import type { CreateJobRoleRequestDto, JobRoleResponseDto } from "../dtos/jobRoleDto.js";
import prisma from "../prismaClient.js";

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


export class JobRoleService {


    public async findAll(): Promise<JobRoleResponseDto[]> {

        const jobRoles = await prisma.jobRole.findMany({
            include: {
                capability: true,
                band: true,
            },
        });

        return jobRoles.map(mapToJobRoleResponseDto);

    }

    public async findById(id: number): Promise<JobRoleResponseDto | null> {

        const jobRole = await prisma.jobRole.findUnique({
            where: { jobRoleId: id },
            include: {
                capability: true,
                band: true,
            },
        });

        if (!jobRole) {
            return null;
        }

        return mapToJobRoleResponseDto(jobRole);
    }



    public async create(data: CreateJobRoleRequestDto): Promise<JobRoleResponseDto> {
        const createdJobRole = await prisma.jobRole.create({
            data,
            include: {
                capability: true,
                band: true,
            },
        });

        return mapToJobRoleResponseDto(createdJobRole);
    }

}