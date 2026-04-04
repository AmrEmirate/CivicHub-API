import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export class KasRepository {
  static async create(data: Prisma.KasHarianCreateInput) {
    return prisma.kasHarian.create({ data });
  }

  static async findAllOrderByDateDesc() {
    return prisma.kasHarian.findMany({
      orderBy: { tanggal: "desc" }
    });
  }

  static async findAllOrderByDateAsc() {
    return prisma.kasHarian.findMany({
      orderBy: { tanggal: "asc" }
    });
  }
}
