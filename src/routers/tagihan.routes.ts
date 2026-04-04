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
router.post("/iuran-master", authorizeFilters(["ADMIN_KEUANGAN"]), validateCreateIuranMaster, TagihanController.createIuranMaster);
router.get("/iuran-master", authorizeFilters(["SUPER_ADMIN", "ADMIN_KEUANGAN"]), TagihanController.getIuranMaster);

router.post("/generate", authorizeFilters(["ADMIN_KEUANGAN"]), validateGenerateTagihan, TagihanController.generateTagihanBulanan);
router.get("/tunggakan", authorizeFilters(["SUPER_ADMIN", "ADMIN_KEUANGAN"]), TagihanController.getTunggakan);

export default router;
