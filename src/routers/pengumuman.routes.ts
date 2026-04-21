import { Router } from "express";
import { PengumumanController } from "../controllers/pengumuman.controller";
import { authenticate } from "../middleware/auth";
import { authorizeFilters } from "../middleware/role";

const router = Router();

// Warga bisa melihat pengumuman
router.get("/", authenticate, PengumumanController.getAll);
router.get("/:id", authenticate, PengumumanController.getById);

// RT (SUPER_ADMIN) dan Sekretaris (ADMIN_ADMINISTRASI) bisa manage pengumuman
router.post("/", authenticate, authorizeFilters(["SUPER_ADMIN", "ADMIN_ADMINISTRASI"]), PengumumanController.create);
router.put("/:id", authenticate, authorizeFilters(["SUPER_ADMIN", "ADMIN_ADMINISTRASI"]), PengumumanController.update);
router.delete("/:id", authenticate, authorizeFilters(["SUPER_ADMIN", "ADMIN_ADMINISTRASI"]), PengumumanController.delete);

export default router;
