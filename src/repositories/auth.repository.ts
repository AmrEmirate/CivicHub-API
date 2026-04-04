import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

export class AuthRepository {
  /** Login Admin (RT, Sekretaris, Bendahara) via email */
  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { warga: true }
    });
  }

  /** Login Warga via nomor telepon */
  static async findUserByNoTelepon(noTelepon: string) {
    return prisma.user.findUnique({
      where: { noTelepon },
      include: { warga: true }
    });
  }

  static async createUserWithWarga(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: { warga: true }
    });
  }
}
