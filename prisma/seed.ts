import { PrismaClient, Role, StatusTagihan, StatusPembayaran, JenisKas } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Database Seeding Started ---')

  // Clear existing data (in reverse order of dependencies)
  console.log('Clearing existing data...')
  await prisma.kasHarian.deleteMany()
  await prisma.pembayaran.deleteMany()
  await prisma.tagihan.deleteMany()
  await prisma.iuranMaster.deleteMany()
  await prisma.warga.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 10)

  // 1. Create Users for each Role
  console.log('Creating role-based users...')
  
  // SUPER_ADMIN
  await prisma.user.create({
    data: {
      email: 'superadmin@gmail.com',
      name: 'Super Admin CivicHub',
      role: Role.SUPER_ADMIN,
      password: hashedPassword
    }
  })

  // ADMIN_ADMINISTRASI (Sekretaris)
  await prisma.user.create({
    data: {
      email: 'sekretaris@gmail.com',
      name: 'Sekretaris RT',
      role: Role.ADMIN_ADMINISTRASI,
      password: hashedPassword
    }
  })

  // ADMIN_KEUANGAN (Bendahara)
  await prisma.user.create({
    data: {
      email: 'bendahara@gmail.com',
      name: 'Bendahara RT',
      role: Role.ADMIN_KEUANGAN,
      password: hashedPassword
    }
  })

  // 2. Create IuranMaster
  console.log('Creating iuran master data...')
  const iuranKeamanan = await prisma.iuranMaster.create({
    data: { nama: 'Iuran Keamanan', nominal: 50000, periode: 'BULANAN' }
  })
  const iuranKebersihan = await prisma.iuranMaster.create({
    data: { nama: 'Iuran Kebersihan', nominal: 35000, periode: 'BULANAN' }
  })
  const iuranSosial = await prisma.iuranMaster.create({
    data: { nama: 'Iuran Sosial', nominal: 15000, periode: 'BULANAN' }
  })

  const totalIuran = iuranKeamanan.nominal + iuranKebersihan.nominal + iuranSosial.nominal

  // 3. Create Warga and their corresponding Users
  console.log('Creating dummy warga data...')
  const dummyWargaData = [
    {
      name: 'Budi Santoso',
      noTelepon: '081234567890', // Login Utama Warga
      email: 'budi@gmail.com',
      noRumah: 'A-01',
      noKK: '3201010101010001',
      kepalaKeluarga: 'Budi Santoso',
      jumlahAnggota: 4,
      statusRumah: 'MILIK_SENDIRI'
    },
    {
      name: 'Siti Aminah',
      noTelepon: '081234567891',
      noRumah: 'A-02',
      noKK: '3201010101010002',
      kepalaKeluarga: 'Siti Aminah',
      jumlahAnggota: 3,
      statusRumah: 'SEWA'
    },
    {
      name: 'Agus Prayitno',
      noTelepon: '081234567892',
      noRumah: 'B-05',
      noKK: '3201010101010003',
      kepalaKeluarga: 'Agus Prayitno',
      jumlahAnggota: 5,
      statusRumah: 'KONTRAK'
    }
  ]

  for (const data of dummyWargaData) {
    const user = await prisma.user.create({
      data: {
        noTelepon: data.noTelepon,
        email: data.email || null,
        name: data.name,
        role: Role.WARGA,
        password: hashedPassword,
        warga: {
          create: {
            noRumah: data.noRumah,
            noKK: data.noKK,
            kepalaKeluarga: data.kepalaKeluarga,
            jumlahAnggota: data.jumlahAnggota,
            noTelepon: data.noTelepon,
            statusRumah: data.statusRumah
          }
        }
      },
      include: { warga: true }
    })

    if (user.warga) {
      // 4. Create Tagihan for each Warga (Januari & Februari)
      console.log(`Creating invoices for ${data.name}...`)
      
      // Tagihan Januari (LUNAS)
      const tagihanJan = await prisma.tagihan.create({
        data: {
          wargaId: user.warga.id,
          bulan: 1,
          tahun: 2026,
          totalNominal: totalIuran,
          status: StatusTagihan.LUNAS
        }
      })

      await prisma.pembayaran.create({
        data: {
          tagihanId: tagihanJan.id,
          metode: 'CASH',
          jumlahBayar: totalIuran,
          tanggalBayar: new Date('2026-01-05'),
          status: StatusPembayaran.SUCCESS
        }
      })

      // Tagihan Februari (BELUM LUNAS)
      await prisma.tagihan.create({
        data: {
          wargaId: user.warga.id,
          bulan: 2,
          tahun: 2026,
          totalNominal: totalIuran,
          status: StatusTagihan.BELUM_LUNAS
        }
      })
    }
  }

  // 5. Create KasHarian
  console.log('Creating daily cash records...')
  await prisma.kasHarian.createMany({
    data: [
      {
        tanggal: new Date('2026-01-05'),
        jenis: JenisKas.PEMASUKAN,
        kategori: 'IURAN',
        keterangan: 'Pemasukan Iuran Januari - 3 Warga',
        nominal: totalIuran * 3
      },
      {
        tanggal: new Date('2026-01-10'),
        jenis: JenisKas.PENGELUARAN,
        kategori: 'OPERASIONAL',
        keterangan: 'Biaya Perbaikan Lampu Jalan RT',
        nominal: 150000
      },
      {
        tanggal: new Date('2026-02-01'),
        jenis: JenisKas.PEMASUKAN,
        kategori: 'DONASI',
        keterangan: 'Sumbangan dari Donatur Hamba Allah',
        nominal: 500000
      }
    ]
  })

  console.log('--- Database Seeding Completed Successfully ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
