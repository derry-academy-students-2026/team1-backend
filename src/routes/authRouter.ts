import express from "express";
import { AuthController } from "../controllers/authController.js";
import { LoginSchema, RegisterSchema } from "../dtos/authDto.js";
import { validateBody } from "../middleware/validate.js";
import { AuthService } from "../services/authService.js";

const router = express.Router();
const controller = new AuthController(new AuthService());

// validateBody rejects malformed requests before the controller ever runs
router.post(
	"/login",
	validateBody(LoginSchema),
	controller.login.bind(controller),
);
router.post(
	"/register",
	validateBody(RegisterSchema),
	controller.register.bind(controller),
);

export default router;
