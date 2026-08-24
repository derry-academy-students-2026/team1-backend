import type { Request, Response } from "express";
import Logger from "../lib/logger.js";
import type { JobRoleService } from "../services/jobRoleService.js";

/**
 * Controller class for handling job role related requests.
 * It delegates the business logic to the JobRoleService and formats the HTTP responses.
 */
export class JobRoleController {
	constructor(private service: JobRoleService) {}

	/**
	 * Handles the request to retrieve all open job roles.
	 * @param _req http request object
	 * @param res http response object
	 */

	async getAllOpen(_req: Request, res: Response): Promise<void> {
		Logger.debug(
			"🌐 [GET /job-roles] Received request to fetch all open job roles",
		);

		try {
			const jobRoles = await this.service.findAllOpen();
			Logger.info(
				`📤 [GET /job-roles] Returning ${jobRoles.length} job role(s) | Status: 200`,
			);
			res.status(200).json(jobRoles);
		} catch (error) {
			Logger.error(
				`❌ [GET /job-roles] Request failed: ${error instanceof Error ? error.message : String(error)}`,
			);
			res.status(500).json({ error: "Failed to fetch job roles" });
		}
	}

	/**
	 * Handles the request to retrieve a job role by its ID.
	 * @param req http request object
	 * @param res http response object
	 * @returns void
	 */

	async getById(req: Request, res: Response): Promise<void> {
		// req.params.id is already validated as numeric by validateParams(IdParamSchema)
		const id = Number(req.params.id);
		Logger.debug(
			`🌐 [GET /job-roles/:id] Received request for job role ID: ${id}`,
		);

		try {
			const jobRole = await this.service.findById(id);
			if (!jobRole) {
				Logger.warn(
					`⚠️  [GET /job-roles/:id] Job role not found for ID: ${id} | Status: 404`,
				);
				res.status(404).json({ error: "Job role not found" });
				return;
			}

			Logger.info(`📤 [GET /job-roles/:id] Returning job role | Status: 200`);
			res.status(200).json(jobRole);
		} catch (error) {
			Logger.error(
				`❌ [GET /job-roles/:id] Request failed: ${error instanceof Error ? error.message : String(error)}`,
			);
			res.status(500).json({ error: "Failed to fetch job role" });
		}
	}
}
