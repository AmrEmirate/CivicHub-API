<div align="center">

# 🏘️ CivicHub API

**Backend REST API untuk Sistem Manajemen Kas & Iuran RT/RW**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

*Solusi digital untuk pengelolaan administrasi dan keuangan warga RT/RW*

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur](#-arsitektur)
- [Role & Akses](#-role--akses)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Instalasi & Setup](#-instalasi--setup)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Keamanan](#-keamanan)

---

## 🌟 Tentang Proyek

**CivicHub API** adalah backend RESTful API yang dirancang untuk membantu pengurus RT/RW dalam mengelola administrasi warga dan keuangan lingkungan secara digital. Sistem ini menangani mulai dari pendataan warga, pengelolaan iuran bulanan, pembayaran online melalui payment gateway, hingga pembukuan kas harian.

Dengan CivicHub, pengurus RT/RW tidak perlu lagi mencatat iuran secara manual di buku fisik — semua terintegrasi dalam satu platform yang aman dan mudah digunakan.

---

## ✨ Fitur Utama

### 👥 Manajemen Warga
- Pendataan lengkap warga beserta info KK (Kartu Keluarga)
- Pengelolaan status rumah (Milik Sendiri / Sewa / Kontrak)
- Registrasi akun mandiri oleh warga

### 💰 Sistem Iuran & Tagihan
- Konfigurasi iuran master (Keamanan, Kebersihan, Sosial, dll.)
- Generate tagihan bulanan otomatis untuk seluruh warga
- Pemantauan tagihan & tunggakan secara real-time
- Histori tagihan pribadi untuk setiap warga

### 💳 Pembayaran Online (Midtrans)
- Inisiasi pembayaran via Midtrans Payment Gateway
- Support metode: **CASH**, **Transfer Bank**, **QRIS**
- Webhook callback otomatis untuk konfirmasi pembayaran
- Bukti pembayaran tersimpan di cloud (Cloudinary)

### 📊 Kas & Laporan Keuangan
- Pencatatan buku kas harian (Pemasukan & Pengeluaran)
- Kategori transaksi: Iuran, Donasi, Operasional
- Export laporan tahunan (Excel/PDF)
- Rekap keuangan lengkap

### 📲 Notifikasi WhatsApp Otomatis
- Pengingat tagihan via WhatsApp menggunakan `whatsapp-web.js`
- Cron job terjadwal untuk blast notifikasi
- Notifikasi konfirmasi pembayaran

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---|---|
| **Runtime** | Node.js 22.x |
| **Language** | TypeScript 5.x |
| **Framework** | Express.js 4.x |
| **Database** | PostgreSQL |
| **ORM** | Prisma 6.x |
| **Authentication** | JSON Web Token (JWT) |
| **Password Hashing** | bcrypt |
| **Payment Gateway** | Midtrans |
| **Cloud Storage** | Cloudinary |
| **Notifikasi** | WhatsApp Web JS |
| **Email** | Nodemailer |
| **Logging** | Winston |
| **Scheduler** | node-cron |
| **Laporan Excel** | SheetJS (xlsx) |
| **PDF** | PDFKit |
| **Validasi** | express-validator |
| **Security** | Helmet, express-rate-limit |
| **Testing** | Jest + Supertest |

---

## 🏗️ Arsitektur

Proyek ini menggunakan pola **Repository-Service-Controller (RSC)** untuk memisahkan tanggung jawab setiap layer:

```
src/
├── controllers/       # Menerima HTTP request & mengirim response
│   ├── auth.controller.ts
│   ├── warga.controller.ts
│   ├── tagihan.controller.ts
│   ├── payment.controller.ts
│   └── kas.controller.ts
│
├── service/           # Business logic & aturan domain
│   ├── auth.service.ts
│   ├── warga.service.ts
│   ├── tagihan.service.ts
│   ├── payment.service.ts
│   └── kas.service.ts
│
├── repositories/      # Interaksi langsung dengan database (Prisma)
│   ├── warga.repository.ts
│   ├── tagihan.repository.ts
│   └── kas.repository.ts
│
├── routers/           # Definisi route & middleware chain
├── middleware/        # Auth, Role, Validasi
├── utils/             # Helper: logger, WhatsApp, cron jobs
├── config/            # Konfigurasi Prisma, Cloudinary, dll.
└── types/             # TypeScript type definitions
```

---

## 🔐 Role & Akses

Sistem menggunakan **Role-Based Access Control (RBAC)** dengan 4 tingkat akses:

| Role | Deskripsi | Akses |
|---|---|---|
| `SUPER_ADMIN` | Ketua RT / Admin Utama | Full access (read semua data) |
| `ADMIN_ADMINISTRASI` | Sekretaris | Kelola data warga |
| `ADMIN_KEUANGAN` | Bendahara | Kelola tagihan, kas, laporan |
| `WARGA` | Warga Biasa | Lihat tagihan diri sendiri & bayar |

---

## 📡 API Endpoints

Base URL: `http://localhost:3000/api`

### 🔑 Authentication
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/auth/login` | Login akun | ❌ |
| `POST` | `/auth/register` | Registrasi warga baru | ❌ |

### 👥 Warga
| Method | Endpoint | Deskripsi | Role |
|---|---|---|---|
| `GET` | `/warga` | Daftar semua warga | SUPER_ADMIN, ADMIN_ADMINISTRASI |
| `POST` | `/warga` | Tambah warga baru | ADMIN_ADMINISTRASI |
| `GET` | `/warga/:id` | Detail warga | SUPER_ADMIN, ADMIN_ADMINISTRASI |
| `PUT` | `/warga/:id` | Update data warga | ADMIN_ADMINISTRASI |

### 🧾 Tagihan & Iuran
| Method | Endpoint | Deskripsi | Role |
|---|---|---|---|
| `GET` | `/tagihan/me` | Tagihan milik warga saat ini | WARGA |
| `POST` | `/tagihan/iuran-master` | Buat jenis iuran baru | ADMIN_KEUANGAN |
| `GET` | `/tagihan/iuran-master` | Daftar jenis iuran | SUPER_ADMIN, ADMIN_KEUANGAN |
| `POST` | `/tagihan/generate` | Generate tagihan bulanan | ADMIN_KEUANGAN |
| `GET` | `/tagihan/tunggakan` | Daftar tagihan tunggakan | SUPER_ADMIN, ADMIN_KEUANGAN |

### 💳 Payment
| Method | Endpoint | Deskripsi | Role |
|---|---|---|---|
| `POST` | `/payment/initiate` | Mulai proses pembayaran | WARGA |
| `POST` | `/payment/webhook` | Callback dari Midtrans | — |

### 📒 Kas Harian
| Method | Endpoint | Deskripsi | Role |
|---|---|---|---|
| `POST` | `/kas/record` | Catat transaksi kas | ADMIN_KEUANGAN |
| `GET` | `/kas/buku-kas` | Lihat buku kas umum | SUPER_ADMIN, ADMIN_KEUANGAN |
| `GET` | `/kas/laporan-tahunan/:tahun` | Export laporan tahunan | SUPER_ADMIN, ADMIN_KEUANGAN |

---

## 🗄️ Database Schema

```
User ─────────────── Warga ──────────────── Tagihan
 (auth & role)    (data KK & rumah)     (iuran bulanan)
                                              │
                                         Pembayaran
                                      (payment gateway)

KasHarian
(buku kas RT)
```

**Model Utama:**
- **User** — Akun login (email/telepon + password + role)
- **Warga** — Data lengkap warga (KK, rumah, jumlah anggota)
- **IuranMaster** — Jenis & nominal iuran yang berlaku
- **Tagihan** — Tagihan bulanan per warga
- **Pembayaran** — Riwayat transaksi pembayaran
- **KasHarian** — Buku kas pemasukan & pengeluaran RT

---

## 🚀 Instalasi & Setup

### Prasyarat
- **Node.js** v18 atau lebih baru
- **PostgreSQL** (lokal atau cloud seperti Supabase)
- **npm** atau **yarn**

### 1. Clone Repository

```bash
git clone https://github.com/AmrEmirate/CivicHub-API.git
cd CivicHub-API
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Salin file `.env.example` menjadi `.env` lalu isi konfigurasinya:

```bash
cp .env.example .env
```

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrasi database
npx prisma migrate dev --name init

# (Opsional) Isi data awal / seeder
npm run seed
```

---

## ⚙️ Konfigurasi Environment

Buat file `.env` di root project dengan variabel berikut:

```env
# === SERVER ===
PORT=3000
NODE_ENV=development

# === DATABASE (PostgreSQL / Supabase) ===
DATABASE_URL="postgresql://user:password@host:5432/civichub_db"
DIRECT_URL="postgresql://user:password@host:5432/civichub_db"

# === JWT ===
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# === MIDTRANS (Payment Gateway) ===
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false

# === CLOUDINARY (Upload Bukti Bayar) ===
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# === CORS ===
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

> ⚠️ **Jangan pernah commit file `.env` ke GitHub!** File ini sudah di-exclude di `.gitignore`.

---

## ▶️ Menjalankan Aplikasi

### Mode Development (Hot Reload)
```bash
npm run dev
```

### Mode Production
```bash
npm start
```

### Build TypeScript
```bash
npm run build
```

### Jalankan Testing
```bash
npm test
```

### Seeding Data Awal
```bash
npm run seed
```

### Health Check
```
GET http://localhost:3000/health
```
Response:
```json
{
  "status": "ok",
  "message": "API is running"
}
```

---

## 🔒 Keamanan

CivicHub API menerapkan berbagai lapisan keamanan:

| Fitur | Implementasi |
|---|---|
| **Security Headers** | Helmet.js (XSS, CSRF protection) |
| **Rate Limiting** | 200 req/15 menit (API umum), 15 req/15 menit (auth) |
| **CORS** | Hanya domain terdaftar yang diizinkan |
| **Input Validation** | express-validator pada semua endpoint |
| **Password** | Hashing dengan bcrypt |
| **JWT Auth** | Token berbasis JSON Web Token |
| **RBAC** | Role-Based Access Control ketat |
| **Payload Limit** | Maksimal 10kb per request (anti request bombing) |
| **Error Sanitization** | Stack trace tidak dikirim ke client |
| **Prisma Error Mapping** | Error DB dipetakan ke HTTP status yang tepat |
| **Server Timeout** | 30 detik (anti Slowloris attack) |

---

## 👤 Author

**Amar** — [GitHub @AmrEmirate](https://github.com/AmrEmirate)

---

<div align="center">

*Dibuat dengan ❤️ untuk memajukan digitalisasi administrasi RT/RW Indonesia*

</div>
