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

  static async findByWargaId(wargaId: number) {
    return prisma.tagihan.findMany({
      where: { wargaId },
      include: { pembayaran: true },
      orderBy: [{ tahun: "desc" }, { bulan: "desc" }]
    });
  }

  /**
   * Hapus warga dan user-nya sekaligus dalam satu transaksi.
   * Urutan: hapus tagihan & pembayaran terkait → hapus warga → hapus user
   */
  static async deleteWithUser(wargaId: number, userId: number) {
    return prisma.$transaction(async (tx) => {
      // Hapus pembayaran terkait tagihan warga ini
      const tagihanIds = await tx.tagihan.findMany({
        where: { wargaId },
        select: { id: true }
      });
      if (tagihanIds.length > 0) {
        await tx.pembayaran.deleteMany({
          where: { tagihanId: { in: tagihanIds.map(t => t.id) } }
        });
        await tx.tagihan.deleteMany({ where: { wargaId } });
      }
      // Hapus notifikasi user
      await tx.notifikasi.deleteMany({ where: { userId } });
      // Hapus warga
      await tx.warga.delete({ where: { id: wargaId } });
      // Hapus user
      await tx.user.delete({ where: { id: userId } });
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
