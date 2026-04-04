import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";
import { authorizeFilters } from "../middleware/role";
import { validateInitiatePayment } from "../middleware/validate";

const router = Router();

// Endpoint webhook/callback tidak boleh di-authenticate dengan JWT karena dipanggil oleh server Payment Gateway
router.post("/webhook", PaymentController.webhookCallback);

// Inisiasi pembayaran hanya bisa dilakukan oleh Warga
router.use(authenticate);
router.post("/initiate", authorizeFilters(["WARGA"]), validateInitiatePayment, PaymentController.initiatePayment);

export default router;
