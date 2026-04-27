import { Router } from "express";
import { WargaController } from "../controllers/warga.controller";
import { authenticate } from "../middleware/auth";
import { authorizeFilters } from "../middleware/role";
import { validateWargaId, validateRegisterWarga } from "../middleware/validate";

const router = Router();

// HANYA SEKRETARIS & RT yang bisa mengelola warga
router.use(authenticate);

router.get("/", authorizeFilters(["SUPER_ADMIN", "ADMIN_ADMINISTRASI"]), WargaController.getAllWarga);
router.get("/stats", authorizeFilters(["SUPER_ADMIN", "ADMIN_ADMINISTRASI"]), WargaController.getStats);
router.post("/", authorizeFilters(["ADMIN_ADMINISTRASI"]), validateRegisterWarga, WargaController.registerWarga);
router.get("/:id(\\d+)", authorizeFilters(["SUPER_ADMIN", "ADMIN_ADMINISTRASI"]), validateWargaId, WargaController.getWargaById);
router.put("/:id(\\d+)", authorizeFilters(["SUPER_ADMIN", "ADMIN_ADMINISTRASI"]), validateWargaId, WargaController.updateWarga);
router.delete("/:id(\\d+)", authorizeFilters(["SUPER_ADMIN", "ADMIN_ADMINISTRASI"]), validateWargaId, WargaController.deleteWarga);

export default router;
