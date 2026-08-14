import express from "express";
import { JobRoleController } from "../controllers/jobRoleController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { JobRoleService } from "../services/jobRoleService.js";

const router = express.Router();
const controller = new JobRoleController(new JobRoleService());

router.use(requireAuth);

/** Delegates collection requests to the job-role controller. */
const getAllOpenHandler = (req: express.Request, res: express.Response) =>
	controller.getAllOpen(req, res);

/** Delegates individual job-role requests to the job-role controller. */
const getByIdHandler = (req: express.Request, res: express.Response) =>
	controller.getById(req, res);

router.get("/", getAllOpenHandler);
router.get("/:id", getByIdHandler);

export default router;
