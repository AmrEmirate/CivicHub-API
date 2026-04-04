import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../service/payment.service";

export class PaymentController {
  static async initiatePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tagihanId, metode } = req.body;
      const result = await PaymentService.initiatePayment(parseInt(tagihanId, 10), metode);
      
      res.status(200).json({
        message: result.message || "Payment initiated",
        pembayaran: result.pembayaran,
        midtransResponse: result.midtransResponse,
        checkoutUrl: result.checkoutUrl
      });
    } catch (err: any) {
      if (err.message === "Tagihan not found") res.status(404).json({ message: "Tagihan tidak ditemukan" });
      else if (err.message === "Tagihan is already paid") res.status(400).json({ message: "Tagihan sudah lunas" });
      else next(err);
    }
  }

  static async webhookCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PaymentService.handleWebhook(req.body);
      
      if (result === "SUCCESS") res.status(200).json({ message: "Pembayaran berhasil dikonfirmasi" });
      else if (result === "FAILED") res.status(200).json({ message: "Status pembayaran diperbarui ke GAGAL" });
      else res.status(200).json({ message: "Status diakui, menunggu konfirmasi" });

    } catch (err: any) {
      if (err.message === "Payment not found") res.status(404).json({ message: "Data pembayaran tidak ditemukan" });
      else if (err.message === "Invalid signature key! Suspected spoofing.") res.status(403).json({ message: "Signature tidak valid" });
      else next(err);
    }
  }
}

