import { Request, Response } from "express";
import { WargaService } from "../service/warga.service";

export class WargaController {
  static async getAllWarga(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      
      const result = await WargaService.getAllWarga(search, page, limit, status);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async registerWarga(req: Request, res: Response): Promise<void> {
    try {
      const user = await WargaService.registerWarga(req.body);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pw, ...safeUser } = user as any;
      res.status(201).json({ message: "Warga recorded successfully", user: safeUser });
    } catch (err: any) {
      if (err.message?.includes('Unique constraint')) {
        res.status(409).json({ error: "Nomor telepon atau email sudah terdaftar" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }

  static async getWargaById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const warga = await WargaService.getWargaById(parseInt(id, 10));
      res.status(200).json(warga);
    } catch (err: any) {
      if (err.message === "Warga not found") res.status(404).json({ message: err.message });
      else res.status(500).json({ error: err.message });
    }
  }

  static async updateWarga(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const warga = await WargaService.updateWarga(parseInt(id, 10), req.body);
      res.status(200).json({ message: "Warga updated", warga });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await WargaService.getStats();
      res.status(200).json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
