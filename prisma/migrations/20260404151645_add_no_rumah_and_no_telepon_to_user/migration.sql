/*
  Warnings:

  - A unique constraint covering the columns `[noTelepon]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "noTelepon" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Warga" ADD COLUMN     "noRumah" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_noTelepon_key" ON "User"("noTelepon");
