import { Router } from "express";
import { TagihanController } from "../controllers/tagihan.controller";
import { authenticate } from "../middleware/auth";
import { authorizeFilters } from "../middleware/role";
import { validateCreateIuranMaster, validateGenerateTagihan } from "../middleware/validate";

const router = Router();

router.use(authenticate);

// WARGA
router.get("/me", authorizeFilters(["WARGA"]), TagihanController.getMyTagihan);

// BENDAHARA & RT
router.post("/iuran-master", authorizeFilters(["ADMIN_KEUANGAN", "SUPER_ADMIN"]), validateCreateIuranMaster, TagihanController.createIuranMaster);
router.get("/iuran-master", authorizeFilters(["SUPER_ADMIN", "ADMIN_KEUANGAN"]), TagihanController.getIuranMaster);
router.put("/iuran-master/:id", authorizeFilters(["ADMIN_KEUANGAN", "SUPER_ADMIN"]), TagihanController.updateIuranMaster);
router.delete("/iuran-master/:id", authorizeFilters(["ADMIN_KEUANGAN", "SUPER_ADMIN"]), TagihanController.deleteIuranMaster);

router.post("/generate", authorizeFilters(["ADMIN_KEUANGAN", "SUPER_ADMIN"]), validateGenerateTagihan, TagihanController.generateTagihanBulanan);
router.get("/tunggakan", authorizeFilters(["SUPER_ADMIN", "ADMIN_KEUANGAN"]), TagihanController.getTunggakan);
router.put("/:id/status", authorizeFilters(["ADMIN_KEUANGAN", "SUPER_ADMIN"]), TagihanController.updateStatusTagihan);

export default router;
