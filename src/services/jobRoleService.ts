
import { JobRole } from "../models/jobRole";

// Mock data — later replaced by a real ORM (e.g. Prisma)
const mockJobs: JobRole[] = [
    { id: 1, jobRoleName: "Example Job", location: "Derry", capabilityId: 0, bandId: 0, closingDate: "2023-01-01", status: "open " },
];
export class JobRoleService {
    async findById(id: number): Promise<JobRole | undefined> {
        return mockJobs.find(j => j.id === id);
    }
    async findAll(): Promise<JobRole[]> {
        return mockJobs;
    }

    async create(job: Omit<JobRole, "id">): Promise<JobRole> {
        const newJob = { ...job, id: mockJobs.length + 1 };
        mockJobs.push(newJob);
        return newJob;
    }

    async update(id: number, job: Omit<JobRole, "id">): Promise<JobRole> {
        const index = mockJobs.findIndex(j => j.id === id);
        if (index === -1) {
            throw new Error("Job not found");
        }
        mockJobs[index] = { ...mockJobs[index], ...job };
        return mockJobs[index];
    }

    async delete(id: number): Promise<Boolean> {
        const index = mockJobs.findIndex(j => j.id === id);
        if (index === -1) {
            throw new Error("Job not found");
        }
        mockJobs.splice(index, 1);
        return true;
    }

}