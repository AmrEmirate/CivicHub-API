/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN_ADMINISTRASI', 'ADMIN_KEUANGAN', 'WARGA');

-- CreateEnum
CREATE TYPE "StatusTagihan" AS ENUM ('BELUM_LUNAS', 'LUNAS', 'TUNGGAKAN');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "JenisKas" AS ENUM ('PEMASUKAN', 'PENGELUARAN');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'WARGA';

-- CreateTable
CREATE TABLE "Warga" (
    "id" SERIAL NOT NULL,
    "noKK" TEXT NOT NULL,
    "kepalaKeluarga" TEXT NOT NULL,
    "jumlahAnggota" INTEGER NOT NULL DEFAULT 1,
    "noTelepon" TEXT,
    "statusRumah" TEXT NOT NULL DEFAULT 'MILIK_SENDIRI',
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IuranMaster" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nominal" DOUBLE PRECISION NOT NULL,
    "periode" TEXT NOT NULL DEFAULT 'BULANAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IuranMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tagihan" (
    "id" SERIAL NOT NULL,
    "wargaId" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "totalNominal" DOUBLE PRECISION NOT NULL,
    "status" "StatusTagihan" NOT NULL DEFAULT 'BELUM_LUNAS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tagihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" SERIAL NOT NULL,
    "tagihanId" INTEGER NOT NULL,
    "metode" TEXT NOT NULL,
    "jumlahBayar" DOUBLE PRECISION NOT NULL,
    "tanggalBayar" TIMESTAMP(3),
    "referenceId" TEXT,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'PENDING',
    "buktiUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KasHarian" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jenis" "JenisKas" NOT NULL,
    "kategori" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "nominal" DOUBLE PRECISION NOT NULL,
    "buktiUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KasHarian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Warga_noKK_key" ON "Warga"("noKK");

-- CreateIndex
CREATE UNIQUE INDEX "Warga_userId_key" ON "Warga"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Pembayaran_referenceId_key" ON "Pembayaran"("referenceId");

-- AddForeignKey
ALTER TABLE "Warga" ADD CONSTRAINT "Warga_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tagihan" ADD CONSTRAINT "Tagihan_wargaId_fkey" FOREIGN KEY ("wargaId") REFERENCES "Warga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_tagihanId_fkey" FOREIGN KEY ("tagihanId") REFERENCES "Tagihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
