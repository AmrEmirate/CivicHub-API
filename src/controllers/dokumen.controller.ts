import { Response, NextFunction } from "express";
import { DokumenService } from "../service/dokumen.service";
import { ProtectedRequest } from "../middleware/auth";

export class DokumenController {
  static async create(req: ProtectedRequest, res: Response, next: NextFunction) {
    try {
      const { title, fileUrl, type, size } = req.body;
      const authorId = req.user?.id;

      if (!authorId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const dokumen = await DokumenService.createDokumen({
        title,
        fileUrl,
        type,
        size,
        authorId
      });

      res.status(201).json(dokumen);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: ProtectedRequest, res: Response, next: NextFunction) {
    try {
      const { type } = req.query;
      const dokumen = await DokumenService.getAllDokumen(type as string);
      res.status(200).json(dokumen);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: ProtectedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await DokumenService.deleteDokumen(id);
      res.status(200).json({ message: "Dokumen deleted" });
    } catch (error) {
      next(error);
    }
  }
}
