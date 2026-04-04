import cron from "node-cron";
import { TagihanRepository } from "../repositories/tagihan.repository";
import { waService } from "./whatsapp";
import { logger } from "./logger";

/**
 * SCHEDULED JOB: Notifikasi Pengingat Tagihan via WhatsApp
 *
 * Terdapat 2 jadwal pengingat:
 * 1. Awal bulan (tanggal 1, jam 08:00): Pengingat tagihan baru
 * 2. Pertengahan bulan (tanggal 15, jam 08:00): Pengingat warga yang masih belum bayar
 */
export function startCronJobs(): void {
  logger.info("🕐 Menginisialisasi cron jobs notifikasi pengingat...");

  // ── PENGINGAT 1: Awal Bulan (Tanggal 1, 08:00 WIB) ─────────────────────
  // Cron expression: '0 8 1 * *' = jam 08:00 di tanggal 1 setiap bulan
  cron.schedule(
    "0 8 1 * *",
    async () => {
      logger.info("[CRON] Menjalankan pengingat tagihan awal bulan...");

      try {
        const daftarTunggakan = await TagihanRepository.findTunggakan();

        if (daftarTunggakan.length === 0) {
          logger.info("[CRON] Tidak ada tunggakan. Tidak ada pesan yang dikirim.");
          return;
        }

        let berhasilKirim = 0;
        let gagalKirim = 0;

        for (const item of daftarTunggakan) {
          const { warga, jumlahBulanTunggakan, totalNominalTunggakan } = item;
          const noTelepon = warga.noTelepon || warga.user?.noTelepon;

          if (!noTelepon) {
            logger.warn(`[CRON] Warga ${warga.kepalaKeluarga} tidak memiliki nomor telepon.`);
            gagalKirim++;
            continue;
          }

          const pesan =
            `📢 *PENGINGAT IURAN RT*\n\n` +
            `Yth. Bpk/Ibu *${warga.kepalaKeluarga}*,\n\n` +
            `Kami mengingatkan bahwa Anda memiliki tunggakan iuran RT:\n` +
            `📌 Jumlah bulan tunggak: *${jumlahBulanTunggakan} bulan*\n` +
            `💰 Total yang harus dibayar: *Rp ${totalNominalTunggakan.toLocaleString("id-ID")}*\n\n` +
            `Silakan segera melakukan pembayaran melalui:\n` +
            `• QRIS (scan di tempat)\n` +
            `• Transfer Bank\n` +
            `• Pembayaran langsung ke Bendahara RT\n\n` +
            `Terima kasih atas kerjasamanya. 🙏\n` +
            `_Sistem CivicHub - RT/RW_`;

          const terkirim = await waService.sendMessage(noTelepon, pesan);
          if (terkirim) {
            berhasilKirim++;
            logger.info(`[CRON] Pesan terkirim ke ${warga.kepalaKeluarga} (${noTelepon})`);
          } else {
            gagalKirim++;
          }
        }

        logger.info(
          `[CRON] Pengingat selesai. Terkirim: ${berhasilKirim}, Gagal: ${gagalKirim}`
        );
      } catch (error: any) {
        logger.error(`[CRON] Error saat mengirim pengingat: ${error.message}`);
      }
    },
    {
      timezone: "Asia/Jakarta",
    }
  );

  // ── PENGINGAT 2: Pertengahan Bulan (Tanggal 15, 08:00 WIB) ──────────────
  // Untuk warga yang masih belum bayar setelah pengingat pertama
  cron.schedule(
    "0 8 15 * *",
    async () => {
      logger.info("[CRON] Menjalankan pengingat tunggakan pertengahan bulan...");

      try {
        const daftarTunggakan = await TagihanRepository.findTunggakan();

        if (daftarTunggakan.length === 0) {
          logger.info("[CRON] Semua warga sudah lunas. Tidak ada pengingat yang dikirim.");
          return;
        }

        let berhasilKirim = 0;

        for (const item of daftarTunggakan) {
          const { warga, jumlahBulanTunggakan, totalNominalTunggakan } = item;
          const noTelepon = warga.noTelepon || warga.user?.noTelepon;

          if (!noTelepon) continue;

          const pesan =
            `⚠️ *PENGINGAT KEDUA: IURAN BELUM DIBAYAR*\n\n` +
            `Yth. Bpk/Ibu *${warga.kepalaKeluarga}*,\n\n` +
            `Hingga saat ini kami belum menerima pembayaran iuran:\n` +
            `📌 Tunggakan: *${jumlahBulanTunggakan} bulan*\n` +
            `💰 Total: *Rp ${totalNominalTunggakan.toLocaleString("id-ID")}*\n\n` +
            `Mohon segera dilunasi agar kegiatan RT/RW tetap berjalan lancar.\n\n` +
            `_Sistem CivicHub - RT/RW_`;

          const terkirim = await waService.sendMessage(noTelepon, pesan);
          if (terkirim) berhasilKirim++;
        }

        logger.info(
          `[CRON] Pengingat pertengahan bulan selesai. Terkirim: ${berhasilKirim}`
        );
      } catch (error: any) {
        logger.error(`[CRON] Error saat mengirim pengingat pertengahan bulan: ${error.message}`);
      }
    },
    {
      timezone: "Asia/Jakarta",
    }
  );

  logger.info("✅ Cron jobs berhasil dijadwalkan:");
  logger.info("   • Pengingat 1: Setiap tanggal 1 pukul 08:00 WIB");
  logger.info("   • Pengingat 2: Setiap tanggal 15 pukul 08:00 WIB");
}
