import { Request, Response } from "express";
import { WargaService } from "../service/warga.service";

export class WargaController {
  static async getAllWarga(req: Request, res: Response): Promise<void> {
    try {
      const warga = await WargaService.getAllWarga();
      res.status(200).json(warga);
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
      const { id } = req.params;
      const warga = await WargaService.getWargaById(parseInt(id as string, 10));
      res.status(200).json(warga);
    } catch (err: any) {
      if (err.message === "Warga not found") res.status(404).json({ message: err.message });
      else res.status(500).json({ error: err.message });
    }
  }

  static async updateWarga(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const warga = await WargaService.updateWarga(parseInt(id as string, 10), req.body);
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
