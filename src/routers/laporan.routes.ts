import { Router } from "express";
import { LaporanController } from "../controllers/laporan.controller";
import { authenticate } from "../middleware/auth";
import { authorizeFilters } from "../middleware/role";

const router = Router();

// Semua role bisa melihat laporan (Atau batasi ke Sekretaris, Bendahara, RT sja?)
// Untuk sementara kita buka akses read untuk semua yang login (Warga jg bisa melihatnya sbgi Transparansi)
router.get("/", authenticate, LaporanController.getAll);
router.get("/:id", authenticate, LaporanController.getById);

// Yang create harus Bendahara (ADMIN_KEUANGAN)
router.post("/", authenticate, authorizeFilters(["ADMIN_KEUANGAN", "SUPER_ADMIN"]), LaporanController.create);

// Yang approve harus RT (SUPER_ADMIN)
router.put("/:id/approve", authenticate, authorizeFilters(["SUPER_ADMIN"]), LaporanController.processApproval);

export default router;
