import { KasService } from "../src/service/kas.service";
import { KasRepository } from "../src/repositories/kas.repository";

jest.mock("../src/repositories/kas.repository");

describe("KasService", () => {
  it("should calculate totalSaldoAkhir correctly", async () => {
    const mockData = [
      { id: 3, nominal: 50000, jenis: "PENGELUARAN" },
      { id: 2, nominal: 100000, jenis: "PEMASUKAN" },
      { id: 1, nominal: 200000, jenis: "PEMASUKAN" }
    ];

    // the latest at index 0 because orderBy desc
    (KasRepository.findAllOrderByDateDesc as jest.Mock).mockResolvedValue(mockData);

    const result = await KasService.getBukuKasUmum();
    const expectedSaldo = 200000 + 100000 - 50000;
    
    expect(result.totalSaldoAkhir).toBe(expectedSaldo);
  });
});
