import { Request, Response } from "express";
import { JobRoleService } from "../services/jobRoleService.js";
import { JobRoleResponseDto, CreateJobRoleRequestDto } from "../dtos/jobRoleDto.js";


export class JobRoleController {
    constructor(private service: JobRoleService = new JobRoleService()) { }


    async getAll(req: Request, res: Response): Promise<void> {

        const jobRoles = await this.service.findAll();

        const dto: JobRoleResponseDto[] = jobRoles.map(jobRole => ({
            id: jobRole.id,
            jobRoleName: jobRole.jobRoleName,
            location: jobRole.location,
            capabilityId: jobRole.capabilityId,
            bandId: jobRole.bandId,
            closingDate: jobRole.closingDate,
            status: jobRole.status
        }));
        res.status(200).json(dto);

    }

    async getById(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: "ID must be a number" });
            return;
        }
        const jobRole = await this.service.findById(id);
        if (!jobRole) {
            res.status(404).json({ error: "Job role not found" });
            return;
        }

        const dto: JobRoleResponseDto = {
            id: jobRole.id,
            jobRoleName: jobRole.jobRoleName,
            location: jobRole.location,
            capabilityId: jobRole.capabilityId,
            bandId: jobRole.bandId,
            closingDate: jobRole.closingDate,
            status: jobRole.status
        };

        res.status(200).json(dto);
    }

    async create(req: Request, res: Response): Promise<void> {
        const body: CreateJobRoleRequestDto = req.body;
        const newJobRole = await this.service.create(body);
        res.status(201).json(newJobRole);
    }

    

}
