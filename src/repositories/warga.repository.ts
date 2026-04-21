import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export class WargaRepository {
  static async findAll(search?: string, page?: number, limit?: number, status?: string) {
    const whereClause: Prisma.WargaWhereInput = {};
    if (search) {
      whereClause.OR = [
        { kepalaKeluarga: { contains: search, mode: 'insensitive' } },
        { noKK: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status && status !== 'semua') {
      if (status === 'milik') {
        whereClause.statusRumah = 'MILIK_SENDIRI';
      } else if (status === 'sewa') {
        whereClause.statusRumah = { in: ['SEWA', 'KONTRAK'] };
      }
    }

    const queryArgs: Prisma.WargaFindManyArgs = {
      where: whereClause,
      include: { user: { select: { email: true, name: true, role: true, noTelepon: true } } },
      orderBy: { createdAt: 'desc' }
    };

    if (page && limit) {
      queryArgs.skip = (page - 1) * limit;
      queryArgs.take = limit;
    }

    const [data, total] = await Promise.all([
      prisma.warga.findMany(queryArgs),
      prisma.warga.count({ where: whereClause })
    ]);

    return { data, total };
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
