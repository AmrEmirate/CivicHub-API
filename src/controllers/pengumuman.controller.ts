import { Request, Response, NextFunction } from "express";
import { PengumumanService } from "../service/pengumuman.service";
import { ProtectedRequest } from "../middleware/auth";

export class PengumumanController {
  static async create(req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, content, type, targetRole } = req.body;
      const authorId = req.user?.id;
      if (!authorId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const p = await PengumumanService.create({ 
        title, 
        content, 
        type: type || "INFO", 
        targetRole: targetRole || "ALL",
        authorId 
      });
      res.status(201).json({ message: "Pengumuman created", data: p });
    } catch (err: any) {
      next(err);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      
      const pengumuman = await PengumumanService.getAll(user.role);

      res.status(200).json(pengumuman);
    } catch (err: any) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = await PengumumanService.getById(parseInt(id, 10));
      res.status(200).json(data);
    } catch (err: any) {
      if (err.message === "Pengumuman not found") {
        res.status(404).json({ message: err.message });
      } else {
        next(err);
      }
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { title, content, type } = req.body;
      const data = await PengumumanService.update(parseInt(id, 10), { title, content, type });
      res.status(200).json({ message: "Pengumuman updated", data });
    } catch (err: any) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await PengumumanService.delete(parseInt(id, 10));
      res.status(200).json({ message: "Pengumuman deleted" });
    } catch (err: any) {
      next(err);
    }
  }
}
