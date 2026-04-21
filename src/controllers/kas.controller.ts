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

  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await KasService.getStats();
      res.status(200).json(stats);
    } catch (err) {
      next(err);
    }
  }

  static async getBukuKasUmum(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const result = await KasService.getBukuKasUmum(page, limit);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async exportLaporanTahunan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tahun = String(req.params.tahun);
      await KasService.exportLaporanTahunan(tahun, res);
    } catch (err) {
      if (!res.headersSent) {
        next(err);
      }
    }
  }
}

