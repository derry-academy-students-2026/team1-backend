import express from "express";
import { JobRoleController } from "../controllers/jobRoleController.js";
import { JobRoleService } from "../services/jobRoleService.js";

const router = express.Router();
const controller = new JobRoleController(new JobRoleService());

router.get("/", (req, res) => controller.getAllOpen(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));

export default router;
