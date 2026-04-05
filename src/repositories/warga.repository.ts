import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export class WargaRepository {
  static async findAll() {
    return prisma.warga.findMany({
      include: { user: { select: { email: true, name: true, role: true } } }
    });
  }

  static async findById(id: number) {
    return prisma.warga.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true, role: true } }, tagihan: true }
    });
  }

  static async update(id: number, data: Prisma.WargaUpdateInput) {
    return prisma.warga.update({
      where: { id },
      data
    });
  }

  static async getStats() {
    const totalWargaKk = await prisma.warga.count();
    const sumAnggota = await prisma.warga.aggregate({
      _sum: {
        jumlahAnggota: true,
      },
    });

    const hunianMilikCount = await prisma.warga.count({
      where: { statusRumah: "MILIK_SENDIRI" },
    });

    const hunianSewaCount = await prisma.warga.count({
      where: { statusRumah: { in: ["SEWA", "KONTRAK"] } },
    });

    return {
      totalKK: totalWargaKk,
      totalWarga: sumAnggota._sum.jumlahAnggota || 0,
      hunianMilik: hunianMilikCount,
      hunianSewa: hunianSewaCount,
    };
  }
}
