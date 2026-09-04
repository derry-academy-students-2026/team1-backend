import express from "express";
import { ApplicationController } from "../controllers/applicationController.js";
import { CreateApplicationSchema } from "../dtos/applicationDto.js";
import { IdParamSchema } from "../dtos/jobRoleDto.js";
import {
	requireAuth,
	requireAuthenticatedUser,
} from "../middleware/authMiddleware.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { ApplicationService } from "../services/applicationService.js";

const router = express.Router();
const controller = new ApplicationController(new ApplicationService());

router.use(requireAuth);

// validateParams rejects a non-numeric :id and validateBody the applicant
// details, so the controller only ever sees a valid request
router.post(
	"/:id/apply",
	validateParams(IdParamSchema),
	validateBody(CreateApplicationSchema),
	requireAuthenticatedUser,
	controller.create.bind(controller),
);
router.get(
	"/:id/applications",
	validateParams(IdParamSchema),
	controller.getByRoleId.bind(controller),
);
// Lets the frontend show "already applied" on page load, independent of session state
router.get(
	"/:id/application-status",
	validateParams(IdParamSchema),
	requireAuthenticatedUser,
	controller.getStatus.bind(controller),
);

export default router;
