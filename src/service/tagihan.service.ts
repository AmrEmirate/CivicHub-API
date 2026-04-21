import { TagihanRepository } from "../repositories/tagihan.repository";
import { WargaRepository } from "../repositories/warga.repository";

export class TagihanService {
  static async createIuranMaster(data: any) {
    return TagihanRepository.createIuranMaster({
      nama: data.nama,
      nominal: parseFloat(data.nominal),
      periode: data.periode
    });
  }

  static async getIuranMaster() {
    return TagihanRepository.findAllIuranMaster();
  }

  static async generateTagihanBulanan(bulan: number, tahun: number, targetNoTelepon?: string) {
    const wargaResult = await WargaRepository.findAll();
    let allWarga: any[] = 'data' in wargaResult ? (wargaResult as any).data : wargaResult;
    
    if (targetNoTelepon) {
      allWarga = allWarga.filter((w: any) => w.user && w.user.noTelepon === targetNoTelepon);
    }

    const allIuranMaster = await TagihanRepository.findAllIuranMaster();
    
    const totalNominal = allIuranMaster.reduce((sum, item) => sum + item.nominal, 0);

    const createdTagihans = [];
    for (const warga of allWarga) {
      const existing = await TagihanRepository.findExistingTagihan(warga.id, bulan, tahun);
      
      if (!existing) {
        const tagihan = await TagihanRepository.createTagihan({
          warga: { connect: { id: warga.id } },
          bulan,
          tahun,
          totalNominal,
          status: "BELUM_LUNAS"
        });
        createdTagihans.push(tagihan);
      }
    }

    return createdTagihans;
  }

  static async getTunggakan(page?: number, limit?: number) {
    const tunggakan = await TagihanRepository.findTunggakan();
    let paginatedData = tunggakan;
    
    if (page && limit) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedData = tunggakan.slice(startIndex, endIndex);
    }
    
    return { data: paginatedData, total: tunggakan.length };
  }

  static async getMyTagihan(wargaId: number) {
    return TagihanRepository.findByWargaId(wargaId);
  }
}
