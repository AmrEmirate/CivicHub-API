import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { logger } from "./utils";
import prisma from "./config/prisma";
import { waService } from "./utils/whatsapp";
import { startCronJobs } from "./utils/cron";

import authRoutes from "./routers/auth.routes";
import wargaRoutes from "./routers/warga.routes";
import tagihanRoutes from "./routers/tagihan.routes";
import paymentRoutes from "./routers/payment.routes";
import kasRoutes from "./routers/kas.routes";
import pengumumanRoutes from "./routers/pengumuman.routes";
import notifikasiRoutes from "./routers/notifikasi.routes";
import laporanRoutes from "./routers/laporan.routes";
import userRoutes from "./routers/user.routes";

const PORT: number = parseInt(process.env.PORT || "3000", 10);

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.configure();
    this.route();
    this.errorHandler();
  }

  private configure(): void {
    this.app.use(helmet());
    this.app.use(compression());

    // 🔒 4. CORS TERBATAS — Hanya izinkan domain frontend resmi
    const allowedOrigins = (process.env.ALLOWED_ORIGINS as string || "").split(",");
    this.app.use(cors({
      origin: (origin, callback) => {
        // Izinkan request tanpa origin (Postman, mobile app, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: Origin '${origin}' tidak diizinkan.`));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }));

    // Batasi ukuran payload request (mencegah request bombing)
    this.app.use(express.json({ limit: '10kb' }));
    
    // 🔒 3. MENGAKTIFKAN RATE LIMITING (ANTI DDOS & BRUTE FORCE)
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 menit
      max: 200, // Limit setiap IP maksimal 200 request per 15 menit
      message: { error: "Terlalu banyak permintaan dari IP ini, coba lagi nanti." },
      standardHeaders: true,
      legacyHeaders: false,
    });

    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, 
      max: 15, // Khusus login/register: Dibatasi maksimal 15 coba
      message: { error: "Terlalu banyak percobaan login. Akun dikunci sementara selama 15 menit." },
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use("/api/", apiLimiter);
    this.app.use("/api/auth", authLimiter);
    
    // Logging request
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private route(): void {
    // API Routes
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/warga", wargaRoutes);
    this.app.use("/api/tagihan", tagihanRoutes);
    this.app.use("/api/payment", paymentRoutes);
    this.app.use("/api/kas", kasRoutes);
    this.app.use("/api/pengumuman", pengumumanRoutes);
    this.app.use("/api/notifikasi", notifikasiRoutes);
    this.app.use("/api/laporan", laporanRoutes);
    this.app.use("/api/users", userRoutes);

    // Root route — tidak mengekspos nama/detail sistem
    this.app.get("/", (req: Request, res: Response) => {
      res.status(200).json({ status: "ok" });
    });

    // 🔒 5. HEALTH CHECK — Diamankan, tidak ada info sensitif yang bocor
    this.app.get("/health", async (req: Request, res: Response) => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ 
          status: "ok", 
          message: "API is running",
        });
      } catch {
        res.status(503).json({ 
          status: "error", 
          message: "Service unavailable",
        });
      }
    });

    // 🔒 404 Catch-all — Jangan biarkan Express return HTML default (bocorkan versi framework)
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: "Endpoint tidak ditemukan" });
    });
  }

  private errorHandler(): void {
    this.app.use(
      (error: any, req: Request, res: Response, next: NextFunction) => {
        // Log error detail HANYA di server, TIDAK dikirim ke client
        logger.error(`${req.method} ${req.path}: ${error.message}`);

        // 🔒 Map Prisma error codes ke HTTP status yang tepat
        if (error.code === 'P2002') {
          return res.status(409).json({ error: "Data sudah terdaftar (duplicate)" });
        }
        if (error.code === 'P2025') {
          return res.status(404).json({ error: "Data tidak ditemukan" });
        }
        if (error.code === 'P2003') {
          return res.status(400).json({ error: "Referensi data tidak valid" });
        }

        // 🔒 SANITASI ERROR — Jangan bocorkan detail internal ke client
        const statusCode = typeof error.status === 'number' ? error.status
                         : typeof error.code === 'number' ? error.code
                         : 500;

        // Pesan aman yang tidak mengekspos struktur db / stack trace
        const safeMessage = statusCode < 500
          ? error.message
          : "Terjadi kesalahan pada server. Silakan coba lagi.";

        res.status(statusCode).json({ error: safeMessage });
      }
    );
  }

  public server: any;

  public start(): void {
    this.server = this.app.listen(PORT, () => {
      logger.info(`API Running on port: ${PORT}`);

      // 🔒 Server timeout — cegah koneksi lambat menumpuk (Slowloris attack)
      this.server.timeout = 30000; // 30 detik
      this.server.keepAliveTimeout = 65000; // Sedikit lebih dari load balancer timeout

      // Inisialisasi WhatsApp setelah server berhasil start
      waService.init();

      // Jalankan cron jobs pengingat tagihan via WhatsApp
      startCronJobs();
    });

    this.server.on('error', (error: any) => {
      logger.error(`Server Error: ${error.message}`);
    });
  }
}

export default App;
