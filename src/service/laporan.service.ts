import prisma from "../config/prisma";

export class LaporanService {
  static async create(data: { title: string; fileUrl?: string; bulan: number; tahun: number; pembuatId: number }) {
    return await prisma.laporan.create({
      data: {
        ...data,
        status: "PENDING"
      }
    });
  }

  static async getAll() {
    return await prisma.laporan.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        pembuat: { select: { name: true, role: true } },
        penyetuju: { select: { name: true, role: true } }
      }
    });
  }

  static async getById(id: number) {
    const l = await prisma.laporan.findUnique({
      where: { id },
      include: {
        pembuat: { select: { name: true, role: true } },
        penyetuju: { select: { name: true, role: true } }
      }
    });
    if (!l) throw new Error("Laporan not found");
    return l;
  }

  static async processApproval(id: number, status: "APPROVED" | "REVISI", komentar: string, penyetujuId: number) {
    const l = await prisma.laporan.findUnique({ where: { id } });
    if (!l) throw new Error("Laporan not found");

    return await prisma.laporan.update({
      where: { id },
      data: {
        status,
        komentar,
        penyetujuId
      }
    });
  }
}
