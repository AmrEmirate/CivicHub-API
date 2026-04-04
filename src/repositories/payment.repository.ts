import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export class PaymentRepository {
  static async findTagihanById(id: number) {
    return prisma.tagihan.findUnique({
      where: { id },
      include: { warga: { include: { user: true } } }
    });
  }

  static async createPembayaran(data: Prisma.PembayaranCreateInput) {
    return prisma.pembayaran.create({ data });
  }

  static async findPembayaranByReferenceId(referenceId: string) {
    return prisma.pembayaran.findUnique({
      where: { referenceId },
      include: { tagihan: { include: { warga: { include: { user: true } } } } }
    });
  }

  static async executePaymentSuccessTransaction(
    pembayaranId: number, 
    tagihanId: number, 
    jumlah: number, 
    keterangan: string
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.pembayaran.update({
        where: { id: pembayaranId },
        data: { status: "SUCCESS", tanggalBayar: new Date() }
      });

      await tx.tagihan.update({
        where: { id: tagihanId },
        data: { status: "LUNAS" }
      });

      await tx.kasHarian.create({
        data: {
          jenis: "PEMASUKAN",
          kategori: "IURAN",
          keterangan,
          nominal: jumlah
        }
      });
    });
  }

  static async updatePembayaranStatus(pembayaranId: number, status: "FAILED" | "PENDING") {
    return prisma.pembayaran.update({
      where: { id: pembayaranId },
      data: { status }
    });
  }
}
