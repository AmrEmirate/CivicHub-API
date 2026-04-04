import { Router } from "express";
import { WargaController } from "../controllers/warga.controller";
import { authenticate } from "../middleware/auth";
import { authorizeFilters } from "../middleware/role";
import { validateWargaId, validateRegisterWarga } from "../middleware/validate";

const router = Router();

// HANYA SEKRETARIS & RT yang bisa mengelola warga
router.use(authenticate);

router.get("/", authorizeFilters(["SUPER_ADMIN", "ADMIN_ADMINISTRASI"]), WargaController.getAllWarga);
router.post("/", authorizeFilters(["ADMIN_ADMINISTRASI"]), validateRegisterWarga, WargaController.registerWarga);
router.get("/:id", authorizeFilters(["SUPER_ADMIN", "ADMIN_ADMINISTRASI"]), validateWargaId, WargaController.getWargaById);
router.put("/:id", authorizeFilters(["ADMIN_ADMINISTRASI"]), validateWargaId, WargaController.updateWarga);

export default router;
