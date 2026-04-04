import { Request, Response, NextFunction } from "express";
import { AuthService } from "../service/auth.service";

export class AuthController {
  /**
   * Login universal:
   * - Admin (RT, Sekretaris, Bendahara): gunakan field 'identifier' = email
   * - Warga: gunakan field 'identifier' = nomor telepon
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, password } = req.body;
      const result = await AuthService.login(identifier, password);
      res.status(200).json({ message: "Login berhasil", ...result });
    } catch (err: any) {
      const notFoundMsgs = [
        "Akun dengan email tersebut tidak ditemukan",
        "Akun dengan nomor telepon tersebut tidak ditemukan",
        "Password salah",
      ];
      if (notFoundMsgs.includes(err.message)) {
        res.status(401).json({ message: err.message });
      } else {
        next(err);
      }
    }
  }

  static async registerWarga(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.registerWarga(req.body);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pw, ...safeUser } = user as any;
      res.status(201).json({ message: "Warga berhasil didaftarkan", user: safeUser });
    } catch (err: any) {
      if (err.code === 'P2002' || err.message?.includes('Unique constraint')) {
        res.status(409).json({ error: "Nomor telepon atau email sudah terdaftar" });
      } else {
        next(err);
      }
    }
  }
}
