import { Router } from "express";
import { DokumenController } from "../controllers/dokumen.controller";
import { authenticate } from "../middleware/auth";
import { authorizeFilters } from "../middleware/role";

const router = Router();

router.use(authenticate);

router.post("/", authorizeFilters(["SUPER_ADMIN", "ADMIN_ADMINISTRASI"]), DokumenController.create);
router.get("/", DokumenController.getAll);
router.delete("/:id", authorizeFilters(["SUPER_ADMIN", "ADMIN_ADMINISTRASI"]), DokumenController.delete);

export default router;
