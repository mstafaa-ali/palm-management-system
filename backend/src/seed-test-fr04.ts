import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const landId = "de8b6f7d-1a9f-4225-8eee-6f82c1976a11";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  console.log("Inserting test data for Land:", landId);

  // 1. Insert Harvests
  await prisma.harvest.createMany({
    data: [
      {
        land_id: landId,
        tanggal_panen: new Date(year, month, 1),
        jumlah_janjang: 200,
        estimasi_berat_kg: 5000,
      },
      {
        land_id: landId,
        tanggal_panen: new Date(year, month, 5),
        jumlah_janjang: 300,
        estimasi_berat_kg: 7000,
      },
    ],
  });

  // 2. Insert Costs
  await prisma.cost.createMany({
    data: [
      {
        land_id: landId,
        tanggal: new Date(year, month, 2),
        jenis_biaya: "Pupuk",
        jumlah_biaya: 2000000,
        keterangan: "Beli pupuk NPK",
      },
      {
        land_id: landId,
        tanggal: new Date(year, month, 4),
        jenis_biaya: "Upah",
        jumlah_biaya: 1000000,
        keterangan: "Upah panen harian",
      },
    ],
  });

  console.log("Test data inserted successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
