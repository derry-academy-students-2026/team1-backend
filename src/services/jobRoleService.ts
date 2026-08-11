import type { CreateJobRoleRequestDto } from "../dtos/jobRoleDto.js";
import prisma from "../prismaClient.js";
import type { JobRole } from "@prisma/client";


export class JobRoleService {
    async findAll(): Promise<JobRole[]> {
        return prisma.jobRole.findMany();
    }

    async findById(id: number): Promise<JobRole | null> {
        return prisma.jobRole.findUnique({
            where: { jobRoleId: id },
        });
    }

    async create(job: CreateJobRoleRequestDto): Promise<JobRole> {
        return prisma.jobRole.create({
            data: {
                roleName: job.jobRoleName,
                location: job.location,
                capabilityId: job.capabilityId,
                bandId: job.bandId,
                closingDate: new Date(job.closingDate),
                status: job.status,
            },
        });
    }

    async update(id: number, job: CreateJobRoleRequestDto): Promise<JobRole | null> {
        const existingJob = await prisma.jobRole.findUnique({
            where: { jobRoleId: id },
        });

        if (!existingJob) {
            return null;
        }

        return prisma.jobRole.update({
            where: { jobRoleId: id },
            data: {
                roleName: job.jobRoleName,
                location: job.location,
                capabilityId: job.capabilityId,
                bandId: job.bandId,
                closingDate: new Date(job.closingDate),
                status: job.status,
            },
        });
    }

    async delete(id: number): Promise<boolean> {
        const existingJob = await prisma.jobRole.findUnique({
            where: { jobRoleId: id },
        });

        if (!existingJob) {
            return false;
        }

        await prisma.jobRole.delete({
            where: { jobRoleId: id },
        });

        return true;
    }
}