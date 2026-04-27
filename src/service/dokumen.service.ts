import { DokumenRepository } from "../repositories/dokumen.repository";

export class DokumenService {
  static async createDokumen(data: {
    title: string;
    fileUrl: string;
    type: string;
    size?: string;
    authorId: number;
  }) {
    return DokumenRepository.create({
      title: data.title,
      fileUrl: data.fileUrl,
      type: data.type,
      size: data.size,
      author: { connect: { id: data.authorId } }
    });
  }

  static async getAllDokumen(type?: string) {
    const filters: any = {};
    if (type) filters.type = type;
    return DokumenRepository.findAll(filters);
  }

  static async deleteDokumen(id: number) {
    return DokumenRepository.delete(id);
  }
}
