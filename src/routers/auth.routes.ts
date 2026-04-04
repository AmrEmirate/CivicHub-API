import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateLogin, validateRegisterWarga } from "../middleware/validate";

const router = Router();

router.post("/login", validateLogin, AuthController.login);
router.post("/register", validateRegisterWarga, AuthController.registerWarga);

export default router;
