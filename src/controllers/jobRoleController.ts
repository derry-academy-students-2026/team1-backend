import { Request, Response } from "express";
import { JobRoleService } from "../services/jobRoleService.js";
import { CreateJobRoleRequestDto } from "../dtos/jobRoleDto.js";


export class JobRoleController {
    constructor(private service: JobRoleService = new JobRoleService()) { }


    async getAll(req: Request, res: Response): Promise<void> {

        const jobRoles = await this.service.findAll();
        res.status(200).json(jobRoles);

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

        res.status(200).json(jobRole);
    }

    async create(req: Request, res: Response): Promise<void> {
        const body: CreateJobRoleRequestDto = req.body;
        const newJobRole = await this.service.create(body);
        res.status(201).json(newJobRole);
    }

    

}
