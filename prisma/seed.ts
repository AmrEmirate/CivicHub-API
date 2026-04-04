import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding database...');

  // 1. Membersihkan database (opsional, hati-hati jika di production)
  // await prisma.pembayaran.deleteMany();
  // await prisma.tagihan.deleteMany();
  // await prisma.warga.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.iuranMaster.deleteMany();
  // await prisma.kasHarian.deleteMany();

  // 2. Setup Password Default
  const defaultPassword = await bcrypt.hash('admin123', 10);

  // 3. Buat Akun RT (SUPER_ADMIN)
  const rtUser = await prisma.user.upsert({
    where: { email: 'rt@civichub.local' },
    update: {},
    create: {
      email: 'rt@civichub.local',
      name: 'Bapak Budi (Ketua RT)',
      password: defaultPassword,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log('✅ Akun RT dibuat:', rtUser.email);

  // 4. Buat Akun Sekretaris (ADMIN_ADMINISTRASI)
  const sekretarisUser = await prisma.user.upsert({
    where: { email: 'sekretaris@civichub.local' },
    update: {},
    create: {
      email: 'sekretaris@civichub.local',
      name: 'Ibu Ani (Sekretaris)',
      password: defaultPassword,
      role: Role.ADMIN_ADMINISTRASI,
    },
  });
  console.log('✅ Akun Sekretaris dibuat:', sekretarisUser.email);

  // 5. Buat Akun Bendahara (ADMIN_KEUANGAN)
  const bendaharaUser = await prisma.user.upsert({
    where: { email: 'bendahara@civichub.local' },
    update: {},
    create: {
      email: 'bendahara@civichub.local',
      name: 'Pak Joko (Bendahara)',
      password: defaultPassword,
      role: Role.ADMIN_KEUANGAN,
    },
  });
  console.log('✅ Akun Bendahara dibuat:', bendaharaUser.email);

  // 6. Data Master Iuran Awal
  const iuranKeamanan = await prisma.iuranMaster.upsert({
    where: { id: (await prisma.iuranMaster.findFirst({ where: { nama: 'Iuran Keamanan Bulanan' } }))?.id ?? 0 },
    update: {},
    create: {
      nama: 'Iuran Keamanan Bulanan',
      nominal: 35000,
      periode: 'BULANAN',
    },
  });

  const iuranKebersihan = await prisma.iuranMaster.upsert({
    where: { id: (await prisma.iuranMaster.findFirst({ where: { nama: 'Iuran Kebersihan (Sampah)' } }))?.id ?? 0 },
    update: {},
    create: {
      nama: 'Iuran Kebersihan (Sampah)',
      nominal: 15000,
      periode: 'BULANAN',
    },
  });
  console.log('✅ Data Master Iuran dibuat.');

  // 7. Buat Akun Warga Contoh (login via nomor telepon)
  const wargaUser = await prisma.user.upsert({
    where: { noTelepon: '081234567890' },
    update: {},
    create: {
      noTelepon: '081234567890', // digunakan sebagai username login
      name: 'Bapak Slamet',
      password: defaultPassword,
      role: Role.WARGA,
      warga: {
        create: {
          noRumah: 'No. 12A',
          noKK: '3578012345678901',
          kepalaKeluarga: 'Slamet Rahardjo',
          jumlahAnggota: 4,
          noTelepon: '081234567890',
          statusRumah: 'MILIK_SENDIRI',
        },
      },
    },
  });
  console.log('✅ Akun Warga contoh dibuat (login pakai noTelepon: 081234567890)');

  console.log('🎉 Seeding Selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
