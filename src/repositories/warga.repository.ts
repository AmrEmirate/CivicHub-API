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
}
