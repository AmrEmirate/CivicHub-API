# Integrasi Frontend dan Backend CivicHub

Proyek ini bertujuan untuk menyambungkan semua fitur yang ada di backend (Node.js/Express) dengan aplikasi frontend (Next.js) dan memastikan UI/UX selaras serta ramah pengguna.

## User Review Required

> [!IMPORTANT]
> Terdapat beberapa API di frontend saat ini yang mencoba memanggil *endpoint* yang belum ada di Backend (contoh: `/kas/stats` atau `/warga` dengan *pagination*). 
> **Pendekatan yang saya pilih:** Jika fitur masuk akal dilakukan di backend (seperti agregasi statistik), saya akan menambahkan *endpoint* ringan di Backend. Jika tidak, saya akan menyesuaikan logika Frontend agar sesuai dengan *endpoint* yang sudah ada. Mohon konfirmasi jika Anda setuju dengan pendekatan ini.

## Proposed Changes

---

### Backend Updates (CivicHub-API)

Beberapa penyesuaian endpoint di backend untuk memfasilitasi kebutuhan User Interface.

#### [MODIFY] src/controllers/kas.controller.ts
- Menambahkan method `getStats` untuk memberikan ringkasan keuangan (Saldo, Pemasukan, Pengeluaran) yang digunakan oleh *dashboard* dan halaman *financial* frontend.

#### [MODIFY] src/routers/kas.routes.ts
- Menambahkan *route* `GET /stats` yang akan memanggil method `KasController.getStats`.

---

### Frontend API Clients & Services (CivicHub)

Memastikan semua *API service* menggunakan *endpoint* yang benar dan mengelola token otentikasi dengan standar keamanan yang baik.

#### [MODIFY] lib/api/api-client.ts
- Memperbaiki pengiriman token JWT untuk setiap *request*.
- Memperbaiki *error handling* dan memastikan *redirect* ke halaman login jika token *expired* (Response 401).

#### [MODIFY] lib/services/announcement-service.ts
- Segera implementasikan service ini secara utuh (menghubungkan ke `GET /pengumuman`, `POST /pengumuman`, dll) alih-alih menggunakan *mock data*.

#### [MODIFY] lib/services/financial-service.ts
- Menyesuaikan struktur request untuk `Kas`, `Tagihan`, dan Inisiasi `Payment` (Midtrans) agar persis sama dengan struktur yang ada di kode *Backend*.

#### [MODIFY] lib/services/member-service.ts
- Menyesuaikan format integrasi data Warga, terutama terkait status `MILIK_SENDIRI` / `SEWA` agar tidak gagal divalidasi oleh database backend.

---

### Frontend UI/UX Alignment (CivicHub)

Pembaruan halaman dan komponen agar memiliki estetika yang "wow" dan *user-friendly*, serta menyembunyikan aksi administratif jika user adalah warga biasa.

#### [MODIFY] app/dashboard/page.tsx
- Menyajikan ringkasan *stats* dan tabel *feed* dari API (Warga Stats, Finance Stats, Announcements List).
- Mengimplementasikan pengecekan role (*Role-based filtering*) sehingga Warga hanya melihat Tagihan mereka.

#### [MODIFY] app/members/page.tsx
- Mengatur status *loading* yang rapi.
- Menghubungkan *Search* dan *Filter* dengan data asil yang didapat dari Backend.

#### [MODIFY] app/financial/page.tsx & app/payment/page.tsx
- Menghubungkan *UI Table* kas dan iuran.
- Mengaktifkan tombol inisiasi bayar `Midtrans`, menambahkan notifikasi WhatsApp *webhook success* yang sudah jalan di BE ke alur interaksi User.

#### [MODIFY] app/announcements/page.tsx
- Form pembuatan Pengumuman khusus untuk Admin. Warga hanya dapat membaca.

## Open Questions

> [!NOTE]
> 1. Apakah ada *role* tertentu di Backend (misalnya `SUPER_ADMIN`) yang harus di-*hardcode* untuk UI frontend, atau kita mengikuti persis role JWT yang ada di Backend saat ini?
> 2. Apakah *webhook* Midtrans akan dicoba menggunakan emulator lokal seperti *Ngrok* dari *frontend* saat testing nanti, atau cukup test data dummy sementara ini?

## Verification Plan

### Automated Tests
- Menjalankan `npm run dev` pada *Frontend* dan *Backend* bersamaan.
- Mengecek error di konsol pada dua sisi (Browser Developer Tools & Terminal Backend).

### Manual Verification
- Melakukan percobaan *Login* menggunakan data dari Auth BE.
- Melakukan percobaan *Create Warga* -> memastikan notifikasi/WhatsApp masuk (jika fitur aktif).
- Melihat List Pengumuman (*Read/Write*).
- Mencoba membuat tagihan bulanan dan inisiasi pembayaran (Midtrans simulasi).
