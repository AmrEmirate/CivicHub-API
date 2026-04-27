import { Router } from "express";
import { KasController } from "../controllers/kas.controller";
import { authenticate } from "../middleware/auth";
import { authorizeFilters } from "../middleware/role";
import { validateRecordKas } from "../middleware/validate";

const router = Router();

router.use(authenticate);

router.get("/stats", KasController.getStats);
// BENDAHARA, RT bisa catat kas dan lihat buku kas
router.post("/record", authorizeFilters(["ADMIN_KEUANGAN", "SUPER_ADMIN"]), validateRecordKas, KasController.recordKas);
router.get("/buku-kas", authorizeFilters(["SUPER_ADMIN", "ADMIN_KEUANGAN"]), KasController.getBukuKasUmum);
router.get("/laporan-tahunan/:tahun", authorizeFilters(["SUPER_ADMIN", "ADMIN_KEUANGAN"]), KasController.exportLaporanTahunan);

export default router;
