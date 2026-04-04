import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";

// Helper — jalankan setelah rules, hentikan jika ada error
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      error: "Validasi gagal", 
      details: errors.array().map(e => e.msg) 
    });
    return;
  }
  next();
};

// ─── AUTH ─────────────────────────────────────────────────────────
export const validateLogin = [
  // 'identifier' bisa berupa email (admin) atau nomor telepon (warga)
  body("identifier")
    .trim()
    .notEmpty()
    .withMessage("Email atau nomor telepon tidak boleh kosong"),
  body("password").isLength({ min: 6 }).withMessage("Password minimal 6 karakter"),
  handleValidationErrors,
];

export const validateRegisterWarga = [
  body("password").isLength({ min: 8 }).withMessage("Password minimal 8 karakter"),
  body("name").trim().notEmpty().withMessage("Nama tidak boleh kosong"),
  body("noTelepon")
    .trim()
    .notEmpty().withMessage("Nomor telepon wajib diisi (digunakan sebagai username login)")
    .matches(/^[0-9]{10,15}$/).withMessage("Nomor telepon harus 10-15 digit angka"),
  body("noKK")
    .trim()
    .notEmpty()
    .matches(/^[0-9]{16}$/).withMessage("Nomor KK harus 16 digit angka"),
  body("noRumah").optional().trim(),
  body("kepalaKeluarga").trim().notEmpty().withMessage("Nama kepala keluarga tidak boleh kosong"),
  body("jumlahAnggota")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Jumlah anggota harus antara 1-20"),
  body("statusRumah")
    .optional()
    .isIn(["MILIK_SENDIRI", "SEWA", "KONTRAK"])
    .withMessage("Status rumah harus MILIK_SENDIRI, SEWA, atau KONTRAK"),
  handleValidationErrors,
];

// ─── KAS ─────────────────────────────────────────────────────────
export const validateRecordKas = [
  body("jenis").isIn(["PEMASUKAN", "PENGELUARAN"]).withMessage("Jenis kas harus PEMASUKAN atau PENGELUARAN"),
  body("kategori").trim().notEmpty().withMessage("Kategori tidak boleh kosong"),
  body("keterangan").trim().notEmpty().withMessage("Keterangan tidak boleh kosong"),
  body("nominal").isFloat({ min: 0.01 }).withMessage("Nominal harus bilangan positif"),
  handleValidationErrors,
];

// ─── TAGIHAN ──────────────────────────────────────────────────────
export const validateCreateIuranMaster = [
  body("nama").trim().notEmpty().withMessage("Nama iuran tidak boleh kosong"),
  body("nominal").isFloat({ min: 1 }).withMessage("Nominal harus bilangan positif"),
  body("periode").optional().isIn(["BULANAN", "MINGGUAN"]).withMessage("Periode harus BULANAN atau MINGGUAN"),
  handleValidationErrors,
];

export const validateGenerateTagihan = [
  body("bulan").isInt({ min: 1, max: 12 }).withMessage("Bulan harus antara 1-12"),
  body("tahun").isInt({ min: 2000, max: 2100 }).withMessage("Tahun tidak valid"),
  handleValidationErrors,
];

// ─── PAYMENT ──────────────────────────────────────────────────────
export const validateInitiatePayment = [
  body("tagihanId").isInt({ min: 1 }).withMessage("tagihanId tidak valid"),
  body("metode").optional().isIn(["CASH", "TRANSFER", "QRIS", "GOPAY"]).withMessage("Metode pembayaran tidak valid"),
  handleValidationErrors,
];

// ─── WARGA ────────────────────────────────────────────────────────
export const validateWargaId = [
  param("id").isInt({ min: 1 }).withMessage("ID warga tidak valid"),
  handleValidationErrors,
];
