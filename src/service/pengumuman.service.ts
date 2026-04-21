import prisma from "../config/prisma";

export class PengumumanService {
  static async create(data: { title: string; content: string; type: string; targetRole?: string; authorId: number }) {
    return await prisma.pengumuman.create({
      data,
    });
  }

  static async getAll(userRole?: string) {
    const whereClause = userRole ? {
      targetRole: { in: ["ALL", userRole] }
    } : {};

    return await prisma.pengumuman.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { name: true, role: true }
        }
      }
    });
  }

  static async getById(id: number) {
    const p = await prisma.pengumuman.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true, role: true }
        }
      }
    });
    if (!p) throw new Error("Pengumuman not found");
    return p;
  }

  static async update(id: number, data: { title?: string; content?: string; type?: string }) {
    return await prisma.pengumuman.update({
      where: { id },
      data,
    });
  }

  static async delete(id: number) {
    return await prisma.pengumuman.delete({
      where: { id },
    });
  }
}
