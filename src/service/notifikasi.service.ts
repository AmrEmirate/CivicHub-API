import prisma from "../config/prisma";

export class NotifikasiService {
  static async create(data: { title: string; message: string; userId: number }) {
    return await prisma.notifikasi.create({
      data,
    });
  }

  static async getByUserId(userId: number) {
    return await prisma.notifikasi.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async markAsRead(id: number) {
    return await prisma.notifikasi.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
