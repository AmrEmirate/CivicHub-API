import { Request, Response, NextFunction } from "express";
import { LaporanService } from "../service/laporan.service";
import { ProtectedRequest } from "../middleware/auth";
import { NotifikasiService } from "../service/notifikasi.service";

export class LaporanController {
  static async create(req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, fileUrl, bulan, tahun } = req.body;
      const pembuatId = req.user?.id;
      if (!pembuatId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const data = await LaporanService.create({ title, fileUrl, bulan: parseInt(bulan, 10), tahun: parseInt(tahun, 10), pembuatId });
      res.status(201).json({ message: "Laporan created successfully", data });
    } catch (err: any) {
      next(err);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await LaporanService.getAll();
      res.status(200).json(data);
    } catch (err: any) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = await LaporanService.getById(parseInt(id, 10));
      res.status(200).json(data);
    } catch (err: any) {
      if (err.message === "Laporan not found") res.status(404).json({ message: err.message });
      else next(err);
    }
  }

  static async processApproval(req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, komentar } = req.body; // status must be "APPROVED" or "REVISI"
      const penyetujuId = req.user?.id;
      
      if (!penyetujuId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      if (status !== "APPROVED" && status !== "REVISI") {
        res.status(400).json({ message: "Status invalid" });
        return;
      }

      const lInfo = await LaporanService.getById(parseInt(id, 10));
      const data = await LaporanService.processApproval(parseInt(id, 10), status, komentar || "", penyetujuId);
      
      // Kirim Notifikasi balik ke Bendahara
      await NotifikasiService.create({
        title: `Laporan ${status}`,
        message: `Laporan "${data.title}" telah ${status === 'APPROVED' ? 'Disetujui' : 'Butuh Direvisi'} oleh RT. ${komentar ? 'Komentar: ' + komentar : ''}`,
        userId: lInfo.pembuatId
      });

      res.status(200).json({ message: `Laporan ${status}`, data });
    } catch (err: any) {
      if (err.message === "Laporan not found") res.status(404).json({ message: err.message });
      else next(err);
    }
  }
}
