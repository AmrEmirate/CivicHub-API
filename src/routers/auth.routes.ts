import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateLogin, validateRegisterWarga } from "../middleware/validate";

const router = Router();

router.post("/login", validateLogin, AuthController.login);
router.post("/register", validateRegisterWarga, AuthController.registerWarga);

// Fitur OTP Lupa Kata Sandi / Buat Sandi Awal
router.post("/request-otp", AuthController.requestOtp);
router.post("/reset-password", AuthController.resetPasswordWithOtp);

export default router;
