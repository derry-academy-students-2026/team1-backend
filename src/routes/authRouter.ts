import express from "express";
import { AuthController } from "../controllers/authController.js";
import { AuthService } from "../services/authService.js";

const router = express.Router();
const controller = new AuthController(new AuthService());

router.post("/login", (req, res) => controller.login(req, res));

export default router;
