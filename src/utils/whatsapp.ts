import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { logger } from "./logger";

export class WhatsAppService {
  private client: Client;
  private isReady: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      }
    });
  }

  /**
   * Inisialisasi koneksi WhatsApp secara eksplisit.
   * Dipanggil satu kali dari server startup (app.ts), bukan saat import.
   */
  public init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.client.on("qr", (qr) => {
      logger.info("Scan QR Code di bawah ini untuk autentikasi WhatsApp:");
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      logger.info("✨ WhatsApp Client is READY!");
      this.isReady = true;
    });

    this.client.on("disconnected", (reason) => {
      logger.warn("WhatsApp Client was disconnected", reason);
      this.isReady = false;
      this.isInitialized = false;
    });

    logger.info("Starting WhatsApp Client...");
    this.client.initialize();
  }

  public async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.isReady) {
      logger.warn(`WhatsApp not ready. Missed message to ${phoneNumber}: ${message}`);
      return false;
    }

    try {
      // Normalisasi nomor ke format internasional Indonesia (tanpa +)
      let formattedNumber = phoneNumber.trim().replace(/\s+/g, "");

      // Hapus prefix '+' jika ada (WhatsApp Web.js tidak pakai '+')
      if (formattedNumber.startsWith("+")) {
        formattedNumber = formattedNumber.substring(1);
      }

      // '0812...' → '6281...'
      if (formattedNumber.startsWith("0")) {
        formattedNumber = "62" + formattedNumber.substring(1);
      }

      // Pastikan dimulai dengan '62' (kode Indonesia)
      if (!formattedNumber.startsWith("62")) {
        formattedNumber = "62" + formattedNumber;
      }

      if (!formattedNumber.endsWith("@c.us")) {
        formattedNumber += "@c.us";
      }

      await this.client.sendMessage(formattedNumber, message);
      logger.info(`Message sent successfully to ${phoneNumber}`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to send WhatsApp message: ${error.message}`);
      return false;
    }
  }
}

// Singleton — client TIDAK langsung diinisialisasi saat import.
// Panggil waService.init() secara eksplisit dari app.ts.
export const waService = new WhatsAppService();
