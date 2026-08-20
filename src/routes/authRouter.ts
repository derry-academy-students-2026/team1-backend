import express from "express";
import { AuthController } from "../controllers/authController.js";
import { AuthService } from "../services/authService.js";

const router = express.Router();
const controller = new AuthController(new AuthService());

/** Delegates login requests to the authentication controller. */
const loginHandler = (req: express.Request, res: express.Response) =>
	controller.login(req, res);

/** Delegates registration requests to the authentication controller. */
const registerHandler = (req: express.Request, res: express.Response) =>
	controller.register(req, res);

router.post("/login", loginHandler);
router.post("/register", registerHandler);

export default router;
