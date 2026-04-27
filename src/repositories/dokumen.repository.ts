import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export class DokumenRepository {
  static async create(data: Prisma.DokumenCreateInput) {
    return prisma.dokumen.create({ data });
  }

  static async findAll(filters: any = {}) {
    return prisma.dokumen.findMany({
      where: filters,
      include: {
        author: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findById(id: number) {
    return prisma.dokumen.findUnique({
      where: { id },
      include: {
        author: { select: { name: true } }
      }
    });
  }

  static async delete(id: number) {
    return prisma.dokumen.delete({ where: { id } });
  }

  static async update(id: number, data: Prisma.DokumenUpdateInput) {
    return prisma.dokumen.update({ where: { id }, data });
  }
}
