import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "../repositories/auth.repository";
import { JWT_SECRET } from "../middleware/auth";

export class AuthService {
  /**
   * Login universal:
   * - Admin (RT, Sekretaris, Bendahara): login via EMAIL
   * - Warga: login via NOMOR TELEPON
   */
  static async login(identifier: string, passwordString: string) {
    // Deteksi: jika mengandung '@', asumsikan email (untuk admin)
    const isEmail = identifier.includes("@");

    const user = isEmail
      ? await AuthRepository.findUserByEmail(identifier)
      : await AuthRepository.findUserByNoTelepon(identifier);

    if (!user) {
      throw new Error(
        isEmail
          ? "Akun dengan email tersebut tidak ditemukan"
          : "Akun dengan nomor telepon tersebut tidak ditemukan"
      );
    }

    const isValidPassword = await bcrypt.compare(passwordString, user.password);
    if (!isValidPassword) throw new Error("Password salah");

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, wargaId: user.warga?.id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        noTelepon: user.noTelepon,
        role: user.role,
      },
    };
  }

  static async registerWarga(data: any) {
    const {
      email, password, name,
      noKK, noRumah, kepalaKeluarga, jumlahAnggota, statusRumah, noTelepon
    } = data;
    const hashedPassword = await bcrypt.hash(password, 10);

    return AuthRepository.createUserWithWarga({
      // noTelepon di User digunakan sebagai identifier login warga
      noTelepon,
      email: email || null,
      name,
      role: "WARGA",
      password: hashedPassword,
      warga: {
        create: {
          noKK,
          noRumah: noRumah || null,
          kepalaKeluarga,
          jumlahAnggota: parseInt(jumlahAnggota) || 1,
          noTelepon,
          statusRumah,
        },
      },
    });
  }
}
