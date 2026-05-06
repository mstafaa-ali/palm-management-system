# FR-04: Kalkulasi Produktivitas (Yield per Hektar)

> **Status:** ✅ Selesai
> **Modul:** A — Manajemen Kebun
> **Requirement:** Sistem secara otomatis menghitung Yield per Hektar (Ton/Ha) berdasarkan histori data panen
> **Prioritas Fix:** 🔴 P0 — Harus diperbaiki pertama sebelum FR lainnya

---

## 1. Analisis Masalah

### 1.1 Data Source yang Salah

Saat ini endpoint `GET /api/lands/:id/stats` mengambil tonase dari tabel **WorkLog**:

```typescript
// lands.controller.ts — getLandStats (SAAT INI)
const logs = await prisma.workLog.findMany({
  where: {
    land_id: landIdStr,
    check_in_time: { gte: startOfMonth, lte: endOfMonth }
  }
});
```

**Masalah:** Data panen dicatat di tabel `Harvest` (FR-02), bukan `WorkLog`. Kedua tabel ini:
- `WorkLog` = tracking jam kerja karyawan + tonase (input oleh karyawan)
- `Harvest` = pencatatan panen harian resmi per blok (input oleh manajer/admin)

**Solusi:** Stats harus mengagregrasi dari **kedua sumber** atau hanya dari `Harvest` sebagai sumber resmi.

### 1.2 Yield per Ha Masih Hardcoded

```typescript
// lahan/[id]/page.tsx — MOCK_DATA (line 72)
stats: {
  yieldEstimation: 11.6,  // ← HARDCODED!
}
```

Nilai ini tidak pernah diupdate dari backend karena endpoint stats tidak mengembalikan yield per ha.

### 1.3 Cost per Kg TBS Tidak Dihitung

Requirement Modul 1 Poin 4: *"Processing (Sistem): Sistem menghitung Yield per Ha (Tonase/Luas) dan Cost per Kg TBS"*

Saat ini tidak ada endpoint yang menggabungkan data Cost dengan data Harvest.

---

## 2. Rencana Implementasi

### 2.1 Update Backend: Endpoint Stats Baru

**File:** `palm-management-backend/src/controllers/lands.controller.ts`

Refactor fungsi `getLandStats` agar:
1. Mengambil data dari `Harvest` (bukan hanya WorkLog)
2. Menghitung Yield per Ha secara dinamis
3. Menghitung Cost per Kg TBS
4. Mendukung filter periode (bulan/tahun)

```typescript
export async function getLandStats(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { bulan, tahun } = req.query; // Optional filter

  try {
    // 1. Resolve land ID
    const land = await resolveLandId(id);
    if (!land) {
      res.status(404).json(errorResponse("Lahan tidak ditemukan."));
      return;
    }

    // 2. Tentukan periode
    const year = tahun ? Number(tahun) : new Date().getFullYear();
    const month = bulan ? Number(bulan) - 1 : new Date().getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // 3. Agregasi data HARVEST (sumber resmi panen)
    const harvestAgg = await prisma.harvest.aggregate({
      _sum: {
        estimasi_berat_kg: true,
        jumlah_janjang: true,
      },
      _count: true,
      where: {
        land_id: land.id,
        tanggal_panen: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const totalBeratKg = Number(harvestAgg._sum.estimasi_berat_kg || 0);
    const totalJanjang = Number(harvestAgg._sum.jumlah_janjang || 0);
    const totalBeratTon = totalBeratKg / 1000;

    // 4. Hitung Yield per Ha
    const luasHa = Number(land.luas_ha || 0);
    const yieldPerHa = luasHa > 0 ? totalBeratTon / luasHa : 0;

    // 5. Agregasi data COST (untuk Cost per Kg)
    const costAgg = await prisma.cost.aggregate({
      _sum: { jumlah_biaya: true },
      where: {
        land_id: land.id,
        tanggal: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const totalBiaya = Number(costAgg._sum.jumlah_biaya || 0);
    const costPerKg = totalBeratKg > 0 ? totalBiaya / totalBeratKg : 0;

    // 6. Data chart harian (dari Harvest)
    const harvests = await prisma.harvest.findMany({
      where: {
        land_id: land.id,
        tanggal_panen: { gte: startOfMonth, lte: endOfMonth },
      },
      orderBy: { tanggal_panen: "asc" },
    });

    const chartData = harvests.map((h) => ({
      date: h.tanggal_panen.toISOString().split("T")[0],
      berat_kg: Number(h.estimasi_berat_kg),
      janjang: h.jumlah_janjang,
    }));

    // 7. Agregasi WorkLog (untuk efisiensi kerja)
    const workLogAgg = await prisma.workLog.aggregate({
      _sum: { tonase: true },
      _count: true,
      where: {
        land_id: land.id,
        check_in_time: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    // Response
    res.status(200).json({
      status: "success",
      data: {
        // Info Lahan
        land_info: {
          id: land.id,
          lokasi_kebun: land.lokasi_kebun,
          luas_ha: luasHa,
          jenis_bibit: land.jenis_bibit,
          koordinat_gps: land.koordinat_gps,
          baseline_tonase: Number(land.baseline_produksi_ton || 0),
        },
        // Kalkulasi Produktivitas (FR-04)
        produktivitas: {
          total_berat_kg: totalBeratKg,
          total_berat_ton: Math.round(totalBeratTon * 100) / 100,
          total_janjang: totalJanjang,
          yield_per_ha: Math.round(yieldPerHa * 100) / 100,  // ← KEY METRIC
          jumlah_hari_panen: harvestAgg._count,
        },
        // Kalkulasi Biaya (Cost per Kg)
        biaya: {
          total_biaya: totalBiaya,
          cost_per_kg: Math.round(costPerKg * 100) / 100,  // ← KEY METRIC
        },
        // Data Chart
        chart_data: chartData,
        // Efisiensi Kerja (dari WorkLog)
        efisiensi: {
          total_work_sessions: workLogAgg._count,
          total_tonase_work: Number(workLogAgg._sum.tonase || 0),
        },
        // Periode
        periode: {
          bulan: month + 1,
          tahun: year,
        },
      },
    });
  } catch (err) {
    console.error(`[GET /api/lands/${id}/stats] Error:`, err);
    res.status(500).json(errorResponse("Gagal memuat statistik lahan."));
  }
}

// Helper function
async function resolveLandId(id: string) {
  // Coba sebagai owner_nik dulu
  let land = await prisma.land.findFirst({ where: { owner_nik: id } });
  if (land) return land;

  // Fallback: coba sebagai UUID
  try {
    land = await prisma.land.findUnique({ where: { id } });
    return land;
  } catch {
    return null;
  }
}
```

### 2.2 Update Frontend: Lahan Detail Page

**File:** `palm-management-system/app/farm-management/lahan/[id]/page.tsx`

Update `fetchStats()` agar menggunakan data baru:

```typescript
React.useEffect(() => {
  async function fetchStats() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/lands/${idStr}/stats`);
      if (res.ok) {
        const json = await res.json();
        const d = json.data;

        setData((prev) => ({
          ...prev,
          stats: {
            totalProduction: d.produktivitas.total_berat_ton,
            baselineProduction: d.land_info.baseline_tonase,
            yieldEstimation: d.produktivitas.yield_per_ha,  // ← REAL DATA
            efficiency: d.efisiensi.total_work_sessions,
            costPerKg: d.biaya.cost_per_kg,                 // ← NEW
          },
          specs: {
            ...prev.specs,
            area: d.land_info.luas_ha,
            jenis_bibit: d.land_info.jenis_bibit || prev.specs.jenis_bibit,
            koordinat_gps: d.land_info.koordinat_gps || prev.specs.koordinat_gps,
          },
          productionHistory: d.chart_data.map((item: any) => ({
            month: item.date,
            actual: item.berat_kg / 1000, // Konversi ke Ton
            baseline: d.land_info.baseline_tonase / 30,
          })),
        }));
      }
    } catch (err) {
      console.error("Gagal load stats:", err);
    } finally {
      setIsLoading(false);
    }
  }
  fetchStats();
}, [idStr]);
```

### 2.3 Tambah Card "Cost per Kg" di Overview

Tambahkan stat card ke-5 atau ganti card "Efisiensi Kerja":

```tsx
<Card>
  <CardContent className="p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">Cost / Kg TBS</p>
        <h3 className="text-3xl font-bold text-palm-dark mt-2">
          Rp {data.stats.costPerKg?.toLocaleString("id-ID") || "0"}
          <span className="text-lg text-slate-500 font-medium">/Kg</span>
        </h3>
      </div>
      <div className="p-3 bg-red-50 rounded-lg text-red-500">
        <DollarSign className="w-5 h-5" />
      </div>
    </div>
    <div className="mt-4 text-sm text-slate-500">
      Total Biaya ÷ Total Berat Panen
    </div>
  </CardContent>
</Card>
```

---

## 3. Formula Kalkulasi

```
┌─────────────────────────────────────────────────────┐
│  Yield per Ha = Total Estimasi Berat (Ton) / Luas Ha│
│                                                     │
│  Contoh: 15.000 Kg ÷ 1000 = 15 Ton                │
│          15 Ton ÷ 12.5 Ha = 1.2 Ton/Ha             │
├─────────────────────────────────────────────────────┤
│  Cost per Kg = Total Biaya (Rp) / Total Berat (Kg) │
│                                                     │
│  Contoh: Rp 5.000.000 ÷ 15.000 Kg = Rp 333/Kg    │
└─────────────────────────────────────────────────────┘
```

---

## 4. Checklist Implementasi

- [x] Refactor `getLandStats` — agregasi dari `Harvest` bukan `WorkLog`
- [x] Hitung `yield_per_ha` = totalTon / luasHa
- [x] Hitung `cost_per_kg` = totalBiaya / totalBeratKg
- [x] Tambah query parameter `?bulan=X&tahun=Y` untuk filter periode
- [x] Update frontend untuk consume response baru
- [x] Hapus MOCK_DATA dari `yieldEstimation`
- [x] Tambah stat card "Cost per Kg TBS"
- [x] Test dengan data real dari database
- [x] Verifikasi chart data menggunakan Harvest bukan WorkLog
