import type { Request, Response } from "express";
import type { CreateApplicationDto } from "../dtos/applicationDto.js";
import type { JwtPayloadDto } from "../dtos/authDto.js";
import Logger from "../lib/logger.js";
import {
	ApplicationError,
	type ApplicationErrorCode,
	type ApplicationService,
} from "../services/applicationService.js";

const ROLE_NOT_FOUND_MESSAGE = "Job role not found";

const ERROR_RESPONSES: Record<
	ApplicationErrorCode,
	{ status: number; message: string }
> = {
	ROLE_NOT_FOUND: { status: 404, message: ROLE_NOT_FOUND_MESSAGE },
	ROLE_CLOSED: {
		status: 409,
		message: "This role is no longer accepting applications",
	},
	DUPLICATE_APPLICATION: {
		status: 409,
		message: "You have already applied for this role",
	},
};

/**
 * Controller class for handling job role application requests.
 * It delegates the business logic to the ApplicationService and formats the HTTP responses.
 */
export class ApplicationController {
	constructor(private service: ApplicationService) {}

	/**
	 * Handles the request to apply for a job role.
	 * @param req http request object
	 * @param res http response object
	 */
	async create(req: Request, res: Response): Promise<void> {
		// req.params.id is numeric, req.body is validated and req.user is present:
		// validateParams, validateBody and requireAuthenticatedUser ran first
		const id = Number(req.params.id);
		const userId = (req.user as JwtPayloadDto).userId;
		const dto = req.body as CreateApplicationDto;

		Logger.debug(
			`🌐 [POST /job-roles/:id/apply] Received application for job role ID: ${id}`,
		);

		try {
			const application = await this.service.create(id, userId, dto);
			Logger.info(
				`📤 [POST /job-roles/:id/apply] Created application for job role ID ${id} by user ID ${userId} | Status: 201`,
			);
			res.status(201).json(application);
		} catch (error) {
			if (error instanceof ApplicationError) {
				const { status, message } = ERROR_RESPONSES[error.code];
				Logger.warn(
					`⚠️  [POST /job-roles/:id/apply] ${error.code} for job role ID ${id} by user ID ${userId} | Status: ${status}`,
				);
				res.status(status).json({ message });
				return;
			}

			Logger.error(
				`❌ [POST /job-roles/:id/apply] Request failed for job role ID ${id} by user ID ${userId}: ${error instanceof Error ? error.message : String(error)}`,
			);
			res.status(500).json({ message: "Failed to submit application" });
		}
	}

	/**
	 * Handles the request to check whether the signed-in account has already
	 * applied for a job role.
	 * @param req http request object
	 * @param res http response object
	 */
	async getStatus(req: Request, res: Response): Promise<void> {
		const id = Number(req.params.id);
		const userId = (req.user as JwtPayloadDto).userId;

		Logger.debug(
			`🌐 [GET /job-roles/:id/application-status] Received request for job role ID: ${id} by user ID: ${userId}`,
		);

		try {
			const hasApplied = await this.service.hasApplied(id, userId);
			Logger.info(
				`📤 [GET /job-roles/:id/application-status] Returning hasApplied=${hasApplied} for job role ID ${id} by user ID ${userId} | Status: 200`,
			);
			res.status(200).json({ hasApplied });
		} catch (error) {
			Logger.error(
				`❌ [GET /job-roles/:id/application-status] Request failed for job role ID ${id} by user ID ${userId}: ${error instanceof Error ? error.message : String(error)}`,
			);
			res.status(500).json({ message: "Failed to fetch application status" });
		}
	}

	/**
	 * Handles the request to retrieve every applicant for a job role.
	 * @param req http request object
	 * @param res http response object
	 */
	async getByRoleId(req: Request, res: Response): Promise<void> {
		const id = Number(req.params.id);
		Logger.debug(
			`🌐 [GET /job-roles/:id/applications] Received request for job role ID: ${id}`,
		);

		try {
			const applications = await this.service.findByRoleId(id);
			Logger.info(
				`📤 [GET /job-roles/:id/applications] Returning ${applications.length} application(s) | Status: 200`,
			);
			res.status(200).json(applications);
		} catch (error) {
			if (error instanceof ApplicationError) {
				const { status, message } = ERROR_RESPONSES[error.code];
				Logger.warn(
					`⚠️  [GET /job-roles/:id/applications] ${error.code} for job role ID ${id} | Status: ${status}`,
				);
				res.status(status).json({ message });
				return;
			}

			Logger.error(
				`❌ [GET /job-roles/:id/applications] Request failed for job role ID ${id}: ${error instanceof Error ? error.message : String(error)}`,
			);
			res.status(500).json({ message: "Failed to fetch applications" });
		}
	}
}
