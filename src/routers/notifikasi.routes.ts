import { Router } from "express";
import { NotifikasiController } from "../controllers/notifikasi.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, NotifikasiController.getMyNotifications);
router.put("/:id/read", authenticate, NotifikasiController.markAsRead);

export default router;
