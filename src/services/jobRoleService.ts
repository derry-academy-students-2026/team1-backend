import type { CreateJobRoleRequestDto, JobRoleResponseDto } from "../dtos/jobRoleDto.js";
import prisma from "../prismaClient.js";


export class JobRoleService {


    public async findAll(): Promise<JobRoleResponseDto[]> {

        const jobRoles = await prisma.jobRole.findMany();

        return jobRoles.map(job => ({
            id: job.jobRoleId,
            roleName: job.roleName,
            location: job.location,
            capabilityId: job.capabilityId,
            bandId: job.bandId,
            closingDate: job.closingDate,
            status: job.status,
        }));

    }

    public async findById(id: number): Promise<JobRoleResponseDto | null> {

        const jobRole = await prisma.jobRole.findUnique({
            where: { jobRoleId: id },
        });

        if (!jobRole) {
            return null;
        }

        return {
            id: jobRole.jobRoleId,
            roleName: jobRole.roleName,
            location: jobRole.location,
            capabilityId: jobRole.capabilityId,
            bandId: jobRole.bandId,
            closingDate: jobRole.closingDate,
            status: jobRole.status,
        };
    }



    public async create(data: CreateJobRoleRequestDto): Promise<JobRoleResponseDto> {
        const createdJobRole = await prisma.jobRole.create({ data });

        return {
            id: createdJobRole.jobRoleId,
            roleName: createdJobRole.roleName,
            location: createdJobRole.location,
            capabilityId: createdJobRole.capabilityId,
            bandId: createdJobRole.bandId,
            closingDate: createdJobRole.closingDate,
            status: createdJobRole.status,
        };
    }

}