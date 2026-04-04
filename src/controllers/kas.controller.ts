import { Request, Response, NextFunction } from "express";
import { KasService } from "../service/kas.service";

export class KasController {
  static async recordKas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kas = await KasService.recordKas(req.body);
      res.status(201).json({ message: "Kas record created", kas });
    } catch (err) {
      next(err);
    }
  }

  static async getBukuKasUmum(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await KasService.getBukuKasUmum();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async exportLaporanTahunan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tahun } = req.params;
      await KasService.exportLaporanTahunan(tahun as string, res);
    } catch (err) {
      if (!res.headersSent) {
        next(err);
      }
    }
  }
}

