import prisma from "../config/prisma";
import { Prisma, StatusTagihan } from "@prisma/client";

export class TagihanRepository {
  static async createIuranMaster(data: Prisma.IuranMasterCreateInput) {
    return prisma.iuranMaster.create({ data });
  }

  static async findAllIuranMaster() {
    return prisma.iuranMaster.findMany();
  }

  static async updateIuranMaster(id: number, data: Prisma.IuranMasterUpdateInput) {
    return prisma.iuranMaster.update({ where: { id }, data });
  }

  static async deleteIuranMaster(id: number) {
    return prisma.iuranMaster.delete({ where: { id } });
  }

  static async findExistingTagihan(wargaId: number, bulan: number, tahun: number) {
    return prisma.tagihan.findFirst({
      where: { wargaId, bulan, tahun }
    });
  }

  static async createTagihan(data: Prisma.TagihanCreateInput) {
    return prisma.tagihan.create({ data });
  }

  static async updateStatusTagihan(id: number, status: string) {
    return prisma.tagihan.update({ where: { id }, data: { status: status as StatusTagihan } });
  }

  /**
   * Laporan tunggakan: mengelompokkan per warga dengan:
   * - jumlah bulan tunggakan
   * - total nominal yang harus dilunasi
   */
  static async findTunggakan() {
    const tagihanBelumLunas = await prisma.tagihan.findMany({
      where: { status: { in: ["BELUM_LUNAS", "TUNGGAKAN"] } },
      include: {
        warga: {
          include: {
            user: { select: { name: true, noTelepon: true, email: true } }
          }
        }
      },
      orderBy: [{ wargaId: "asc" }, { tahun: "asc" }, { bulan: "asc" }]
    });

    // Kelompokkan per warga
    const grouped = new Map<number, {
      warga: any;
      jumlahBulanTunggakan: number;
      totalNominalTunggakan: number;
      detailTagihan: { bulan: number; tahun: number; nominal: number; status: string }[];
    }>();

    for (const tagihan of tagihanBelumLunas) {
      const existing = grouped.get(tagihan.wargaId);
      const detail = {
        bulan: tagihan.bulan,
        tahun: tagihan.tahun,
        nominal: tagihan.totalNominal,
        status: tagihan.status,
      };

      if (existing) {
        existing.jumlahBulanTunggakan += 1;
        existing.totalNominalTunggakan += tagihan.totalNominal;
        existing.detailTagihan.push(detail);
      } else {
        grouped.set(tagihan.wargaId, {
          warga: tagihan.warga,
          jumlahBulanTunggakan: 1,
          totalNominalTunggakan: tagihan.totalNominal,
          detailTagihan: [detail],
        });
      }
    }

    return Array.from(grouped.values()).sort(
      (a, b) => b.jumlahBulanTunggakan - a.jumlahBulanTunggakan
    );
  }

  static async findByWargaId(wargaId: number) {
    return prisma.tagihan.findMany({
      where: { wargaId },
      include: { pembayaran: true },
      orderBy: [{ tahun: "desc" }, { bulan: "desc" }]
    });
  }
}
