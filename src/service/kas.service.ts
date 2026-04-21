import { KasRepository } from "../repositories/kas.repository";
import { PrismaClient } from "@prisma/client";
import PDFDocument from "pdfkit";
import { Response } from "express";

const prisma = new PrismaClient();

export class KasService {
  static async recordKas(data: any) {
    const { jenis, kategori, keterangan, nominal, buktiUrl } = data;
    return KasRepository.create({
      jenis, kategori, keterangan, buktiUrl,
      nominal: parseFloat(nominal)
    });
  }

  static async getBukuKasUmum(page?: number, limit?: number) {
    const kas = await KasRepository.findAllOrderByDateDesc();
    let saldo = 0;
    const kasDenganSaldo = [...kas].reverse().map(item => {
      if (item.jenis === "PEMASUKAN") saldo += item.nominal;
      else saldo -= item.nominal;
      return { ...item, saldoBerikutnya: saldo };
    }).reverse();

    let paginatedData = kasDenganSaldo;
    if (page && limit) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedData = kasDenganSaldo.slice(startIndex, endIndex);
    }

    return { totalSaldoAkhir: saldo, riwayat: paginatedData, totalItem: kasDenganSaldo.length };
  }

  static async getStats() {
    const kasRecords = await prisma.kasHarian.findMany();
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    for (const record of kasRecords) {
      if (record.jenis === "PEMASUKAN") totalPemasukan += record.nominal;
      if (record.jenis === "PENGELUARAN") totalPengeluaran += record.nominal;
    }

    const tagihanCounts = await prisma.tagihan.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    let invoicesTunggakan = 0;
    let invoicesBaru = 0;
    let invoicesLunas = 0;

    for (const group of tagihanCounts) {
      if (group.status === "TUNGGAKAN") invoicesTunggakan = group._count.id;
      if (group.status === "BELUM_LUNAS") invoicesBaru = group._count.id;
      if (group.status === "LUNAS") invoicesLunas = group._count.id;
    }

    return {
      totalPemasukan,
      totalPengeluaran,
      saldo: totalPemasukan - totalPengeluaran,
      invoicesTunggakan,
      invoicesBaru,
      invoicesLunas
    };
  }

  static async exportLaporanTahunan(tahun: string, res: Response) {
    const kasData = await KasRepository.findAllOrderByDateAsc();
    const filteredKas = kasData.filter(kas => new Date(kas.tanggal).getFullYear() === parseInt(tahun));

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Keuangan_RT_${tahun}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN RT', { align: 'center' });
    doc.fontSize(14).text(`TAHUN ANGGARAN ${tahun}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).font('Helvetica-Bold');
    const tableTop = 200;
    const tanggalX = 50, jenisX = 150, ketX = 250, nominalX = 450;

    doc.text('Tanggal', tanggalX, tableTop);
    doc.text('Tipe', jenisX, tableTop);
    doc.text('Keterangan', ketX, tableTop);
    doc.text('Nominal (Rp)', nominalX, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    doc.font('Helvetica');
    let currentY = tableTop + 25;
    let totalPemasukan = 0, totalPengeluaran = 0;

    filteredKas.forEach(kas => {
      if (currentY > 700) { doc.addPage(); currentY = 50; }
      doc.text(new Date(kas.tanggal).toLocaleDateString("id-ID"), tanggalX, currentY);
      doc.text(kas.jenis, jenisX, currentY);
      doc.text(kas.keterangan.length > 30 ? kas.keterangan.substring(0, 30) + '...' : kas.keterangan, ketX, currentY, { width: 180 });
      doc.text(kas.nominal.toLocaleString('id-ID'), nominalX, currentY);

      if (kas.jenis === "PEMASUKAN") totalPemasukan += kas.nominal;
      if (kas.jenis === "PENGELUARAN") totalPengeluaran += kas.nominal;
      currentY += 20;
    });

    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 10;

    doc.font('Helvetica-Bold');
    doc.text(`Total Pemasukan: Rp ${totalPemasukan.toLocaleString('id-ID')}`, 50, currentY);
    currentY += 20;
    doc.text(`Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString('id-ID')}`, 50, currentY);
    currentY += 20;
    doc.text(`Saldo Akhir Buku Kas (${tahun}): Rp ${(totalPemasukan - totalPengeluaran).toLocaleString('id-ID')}`, 50, currentY);

    currentY += 50;
    doc.font('Helvetica');
    doc.text('Mengetahui,', 400, currentY);
    currentY += 50;
    doc.text('( Ketua RT )', 400, currentY);
    doc.text('( Bendahara )', 100, currentY);

    doc.end();
  }
}
