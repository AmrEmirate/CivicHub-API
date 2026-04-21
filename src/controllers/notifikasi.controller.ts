import { Response, NextFunction } from "express";
import { NotifikasiService } from "../service/notifikasi.service";
import { ProtectedRequest } from "../middleware/auth";

export class NotifikasiController {
  static async getMyNotifications(req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const data = await NotifikasiService.getByUserId(userId);
      res.status(200).json(data);
    } catch (err: any) {
      next(err);
    }
  }

  static async markAsRead(req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = await NotifikasiService.markAsRead(parseInt(id, 10));
      res.status(200).json({ message: "Notifikasi dibaca", data });
    } catch (err: any) {
      next(err);
    }
  }
}
