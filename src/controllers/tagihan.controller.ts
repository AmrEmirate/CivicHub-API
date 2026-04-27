import { Request, Response, NextFunction } from "express";
import { TagihanService } from "../service/tagihan.service";
import { ProtectedRequest } from "../middleware/auth";

export class TagihanController {
  static async createIuranMaster(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const iuran = await TagihanService.createIuranMaster(req.body);
      res.status(201).json({ message: "Iuran Master created", iuran });
    } catch (err) {
      next(err);
    }
  }

  static async getIuranMaster(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const iuran = await TagihanService.getIuranMaster();
      res.status(200).json(iuran);
    } catch (err) {
      next(err);
    }
  }

  static async updateIuranMaster(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "ID tidak valid" });
        return;
      }
      const iuran = await TagihanService.updateIuranMaster(id, req.body);
      res.status(200).json({ message: "Iuran Master updated", iuran });
    } catch (err: any) {
      next(err);
    }
  }

  static async deleteIuranMaster(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "ID tidak valid" });
        return;
      }
      await TagihanService.deleteIuranMaster(id);
      res.status(200).json({ message: "Iuran Master deleted" });
    } catch (err: any) {
      next(err);
    }
  }

  static async generateTagihanBulanan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bulan = parseInt(req.body.bulan, 10);
      const tahun = parseInt(req.body.tahun, 10);
      // Validasi NaN — body.bulan/tahun sudah di-validate oleh express-validator, ini guard tambahan
      if (isNaN(bulan) || isNaN(tahun)) {
        res.status(400).json({ error: "Bulan dan tahun harus berupa angka" });
        return;
      }
      const createdTagihans = await TagihanService.generateTagihanBulanan(bulan, tahun);
      res.status(201).json({ message: `Berhasil generate ${createdTagihans.length} tagihan` });
    } catch (err) {
      next(err);
    }
  }

  static async getTunggakan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const tunggakan = await TagihanService.getTunggakan(page, limit);
      res.status(200).json(tunggakan);
    } catch (err) {
      next(err);
    }
  }

  static async getMyTagihan(req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.wargaId) {
        res.status(400).json({ message: "Profil warga tidak terhubung ke akun ini" });
        return;
      }
      const tagihans = await TagihanService.getMyTagihan(req.user.wargaId);
      res.status(200).json(tagihans);
    } catch (err) {
      next(err);
    }
  }

  static async updateStatusTagihan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      if (isNaN(id)) {
        res.status(400).json({ error: "ID tidak valid" });
        return;
      }
      if (!status || !["BELUM_LUNAS", "LUNAS", "TUNGGAKAN"].includes(status)) {
        res.status(400).json({ error: "Status tidak valid" });
        return;
      }
      const tagihan = await TagihanService.updateStatusTagihan(id, status);
      res.status(200).json({ message: "Status tagihan updated", tagihan });
    } catch (err) {
      next(err);
    }
  }
}

