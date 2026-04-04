import { WargaRepository } from "../repositories/warga.repository";
import bcrypt from "bcrypt";
import { AuthRepository } from "../repositories/auth.repository";

export class WargaService {
  static async getAllWarga() {
    return WargaRepository.findAll();
  }

  /** Registrasi warga baru oleh Sekretaris (tanpa membuat User akun login) */
  static async registerWarga(data: any) {
    const {
      email, password, name,
      noKK, noRumah, kepalaKeluarga, jumlahAnggota, statusRumah, noTelepon
    } = data;
    const hashedPassword = await bcrypt.hash(password, 10);

    return AuthRepository.createUserWithWarga({
      noTelepon,       // identifier login warga
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
          statusRumah,
          noTelepon,
        },
      },
    });
  }

  static async getWargaById(id: number) {
    const warga = await WargaRepository.findById(id);
    if (!warga) throw new Error("Warga not found");
    return warga;
  }

  static async updateWarga(id: number, data: any) {
    const { noKK, noRumah, kepalaKeluarga, jumlahAnggota, statusRumah, noTelepon } = data;
    return WargaRepository.update(id, {
      noKK,
      noRumah: noRumah || undefined,
      kepalaKeluarga,
      jumlahAnggota: parseInt(jumlahAnggota),
      statusRumah,
      noTelepon,
    });
  }
}
