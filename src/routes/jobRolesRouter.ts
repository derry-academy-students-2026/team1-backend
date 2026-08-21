import express from "express";
import { JobRoleController } from "../controllers/jobRoleController.js";
import { IdParamSchema } from "../dtos/jobRoleDto.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validateParams } from "../middleware/validate.js";
import { JobRoleService } from "../services/jobRoleService.js";

const router = express.Router();
const controller = new JobRoleController(new JobRoleService());

router.use(requireAuth);

router.get("/", controller.getAllOpen.bind(controller));
// validateParams rejects a non-numeric :id before the controller ever runs
router.get(
	"/:id",
	validateParams(IdParamSchema),
	controller.getById.bind(controller),
);

export default router;
