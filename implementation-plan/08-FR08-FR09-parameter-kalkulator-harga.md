# FR-08 & FR-09: Parameter Harga & Kalkulator Harga Wajar TBS

> **Status:** ⚠️ Parsial — UI statis sudah ada, backend belum ada
> **Modul:** C — Simulasi Harga TBS
> **Requirement:**
> - **FR-08:** Input manual atau otomatis harga CPO global dan harga Kernel
> - **FR-09:** Fitur simulasi harga TBS dengan memasukkan variabel biaya olah (K) sesuai formula Disbun atau internal
> **Prioritas:** 🟡 P1
> **Dependensi:** Tidak ada (independen)

---

## 1. Analisis Kondisi Saat Ini

### Yang Sudah Ada

File `components/simulation/PriceCalculator.jsx` sudah memiliki:
- ✅ UI Input harga CPO (text field + slider, range 10.000 – 15.000)
- ✅ UI Output "Harga TBS Wajar Hari Ini" (tampilan besar, premium design)
- ✅ UI Margin PKS Est. dan Indeks K

### Yang Belum Ada
- ❌ **Semua data hardcoded** — Harga TBS (Rp 2.650), Margin (Rp 150), Indeks K (87.5%)
- ❌ **Tidak ada state management** — Slider/input tidak mengubah output apapun
- ❌ **Tidak ada backend** — Tidak ada API untuk simpan/ambil parameter
- ❌ **Formula kalkulasi belum ada** — Tidak ada logic perhitungan

---

## 2. Formula Harga TBS

### 2.1 Formula Disbun (Dinas Perkebunan)

Rumus penetapan Harga TBS yang umum digunakan oleh Disbun di Indonesia:

```
┌─────────────────────────────────────────────────────────────┐
│                 FORMULA HARGA TBS DISBUN                    │
│                                                             │
│  Harga TBS = K × (Harga CPO × Rendemen CPO                │
│              + Harga PK × Rendemen PK)                      │
│                                                             │
│  Dimana:                                                    │
│  • K = Indeks proporsi (biasanya 85-92%)                   │
│      → Merepresentasikan pembagian keuntungan              │
│        antara petani dan PKS                               │
│  • Harga CPO = Harga CPO di Rotterdam/KPB (Rp/Kg)         │
│  • Rendemen CPO = OER rata-rata (misal: 22%)              │
│  • Harga PK = Harga Palm Kernel (Rp/Kg)                   │
│  • Rendemen PK = KER rata-rata (misal: 5%)                │
│                                                             │
│  CONTOH KALKULASI:                                         │
│  K = 87.5%                                                 │
│  Harga CPO = Rp 12.500/Kg                                 │
│  Rendemen CPO = 22%                                        │
│  Harga PK = Rp 6.000/Kg                                   │
│  Rendemen PK = 5%                                          │
│                                                             │
│  Harga TBS = 0.875 × (12.500 × 0.22 + 6.000 × 0.05)      │
│            = 0.875 × (2.750 + 300)                         │
│            = 0.875 × 3.050                                 │
│            = Rp 2.669/Kg                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Variabel yang Dibutuhkan

| Variabel | Sumber | Tipe Input |
|----------|--------|------------|
| Harga CPO Global (Rp/Kg) | Manual atau API | Number + Slider |
| Harga Palm Kernel (Rp/Kg) | Manual | Number |
| Rendemen CPO / OER (%) | Manual atau dari FR-06 | Number + Slider |
| Rendemen PK / KER (%) | Manual atau dari FR-06 | Number + Slider |
| Indeks K (%) | Manual | Number + Slider |
| Biaya Olah PKS (Rp/Kg TBS) | Manual | Number |

---

## 3. Rencana Database Schema

### Model Baru: `PriceParameter`

```prisma
// prisma/schema.prisma — TAMBAHKAN

model PriceParameter {
  id                String   @id @default(uuid()) @db.Uuid
  tanggal           DateTime @db.Date @unique     // 1 record per hari
  
  // Harga Pasar
  harga_cpo_per_kg  Decimal  @db.Decimal(12, 2)   // Harga CPO (Rp/Kg)
  harga_pk_per_kg   Decimal  @db.Decimal(12, 2)   // Harga Palm Kernel (Rp/Kg)
  
  // Rendemen (bisa override dari data aktual FR-06)
  rendemen_cpo      Decimal  @db.Decimal(5, 2)    // OER % (default: 22)
  rendemen_pk       Decimal  @db.Decimal(5, 2)    // KER % (default: 5)
  
  // Biaya & Proporsi
  indeks_k          Decimal  @db.Decimal(5, 2)    // K factor (default: 87.5)
  biaya_olah_per_kg Decimal? @db.Decimal(12, 2)   // Opsional: biaya olah PKS
  
  // Hasil Kalkulasi (disimpan untuk riwayat)
  harga_tbs_wajar   Decimal? @db.Decimal(12, 2)   // Hasil formula
  margin_pks        Decimal? @db.Decimal(12, 2)   // Margin PKS per Kg
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  @@map("price_parameters")
}
```

> [!NOTE]
> **Desain Decision:** Menggunakan `tanggal @unique` memastikan hanya ada 1 parameter per hari. Jika ingin multiple simulasi per hari, hapus constraint unique dan tambahkan field `nama_simulasi`.

---

## 4. Rencana Backend API

### Controller: `price.controller.ts`

| Endpoint | Method | Fungsi | Deskripsi |
|----------|--------|--------|-----------|
| `/api/price/calculate` | POST | `calculateTBSPrice` | Hitung harga TBS berdasarkan parameter (tanpa simpan) |
| `/api/price/parameters` | POST | `saveParameters` | Simpan parameter harga hari ini |
| `/api/price/parameters/latest` | GET | `getLatestParameters` | Ambil parameter terakhir |
| `/api/price/parameters/history` | GET | `getParameterHistory` | Riwayat parameter 30 hari |

### Contoh Implementasi

```typescript
// price.controller.ts

interface TBSCalculation {
  harga_tbs_wajar: number;
  margin_pks: number;
  detail: {
    komponen_cpo: number;  // Harga CPO × Rendemen CPO
    komponen_pk: number;   // Harga PK × Rendemen PK
    total_sebelum_k: number;
    indeks_k_applied: number;
  };
}

// POST /api/price/calculate — Kalkulasi tanpa simpan
export const calculateTBSPrice = async (req: Request, res: Response) => {
  const {
    harga_cpo_per_kg,
    harga_pk_per_kg,
    rendemen_cpo,      // dalam persen, misal 22
    rendemen_pk,        // dalam persen, misal 5
    indeks_k,           // dalam persen, misal 87.5
    biaya_olah_per_kg,  // opsional
  } = req.body;

  // Validasi
  if (!harga_cpo_per_kg || !rendemen_cpo || !indeks_k) {
    return res.status(400).json({
      success: false,
      message: "harga_cpo_per_kg, rendemen_cpo, dan indeks_k wajib diisi.",
    });
  }

  const cpo = Number(harga_cpo_per_kg);
  const pk = Number(harga_pk_per_kg || 0);
  const oer = Number(rendemen_cpo) / 100;
  const ker = Number(rendemen_pk || 0) / 100;
  const k = Number(indeks_k) / 100;
  const biayaOlah = Number(biaya_olah_per_kg || 0);

  // Formula Disbun
  const komponenCPO = cpo * oer;
  const komponenPK = pk * ker;
  const totalSebelumK = komponenCPO + komponenPK;
  const hargaTBS = k * totalSebelumK;

  // Margin PKS = Harga jual - Harga beli - Biaya olah
  // Simplifikasi: margin = totalSebelumK - hargaTBS - biayaOlah
  const marginPKS = totalSebelumK - hargaTBS - biayaOlah;

  const result: TBSCalculation = {
    harga_tbs_wajar: Math.round(hargaTBS),
    margin_pks: Math.round(marginPKS),
    detail: {
      komponen_cpo: Math.round(komponenCPO),
      komponen_pk: Math.round(komponenPK),
      total_sebelum_k: Math.round(totalSebelumK),
      indeks_k_applied: k,
    },
  };

  res.json({ success: true, data: result });
};

// POST /api/price/parameters — Simpan + Kalkulasi
export const saveParameters = async (req: Request, res: Response) => {
  const {
    harga_cpo_per_kg, harga_pk_per_kg,
    rendemen_cpo, rendemen_pk,
    indeks_k, biaya_olah_per_kg,
  } = req.body;

  // Hitung dulu
  const cpo = Number(harga_cpo_per_kg);
  const pk = Number(harga_pk_per_kg || 0);
  const k = Number(indeks_k) / 100;
  const oer = Number(rendemen_cpo) / 100;
  const ker = Number(rendemen_pk || 0) / 100;
  const hargaTBS = k * (cpo * oer + pk * ker);
  const marginPKS = (cpo * oer + pk * ker) - hargaTBS;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const param = await prisma.priceParameter.upsert({
    where: { tanggal: today },
    update: {
      harga_cpo_per_kg: cpo,
      harga_pk_per_kg: pk,
      rendemen_cpo: Number(rendemen_cpo),
      rendemen_pk: Number(rendemen_pk || 0),
      indeks_k: Number(indeks_k),
      biaya_olah_per_kg: Number(biaya_olah_per_kg || 0),
      harga_tbs_wajar: Math.round(hargaTBS),
      margin_pks: Math.round(marginPKS),
    },
    create: {
      tanggal: today,
      harga_cpo_per_kg: cpo,
      harga_pk_per_kg: pk,
      rendemen_cpo: Number(rendemen_cpo),
      rendemen_pk: Number(rendemen_pk || 0),
      indeks_k: Number(indeks_k),
      biaya_olah_per_kg: Number(biaya_olah_per_kg || 0),
      harga_tbs_wajar: Math.round(hargaTBS),
      margin_pks: Math.round(marginPKS),
    },
  });

  res.json({ success: true, data: param });
};
```

---

## 5. Rencana Frontend

### 5.1 Refactor `PriceCalculator.jsx` → `PriceCalculator.tsx`

Ubah dari komponen statis menjadi interaktif:

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌──── KOLOM KIRI (4/12) ────────────────────────────────────┐  │
│ │ Card: Parameter Harga                                     │  │
│ │                                                           │  │
│ │ [Harga CPO Global (Rp/Kg)]                               │  │
│ │ Input: 12.500   Slider: 8.000 ─── 18.000                │  │
│ │                                                           │  │
│ │ [Harga Palm Kernel (Rp/Kg)]                              │  │
│ │ Input: 6.000    Slider: 3.000 ─── 10.000                │  │
│ │                                                           │  │
│ │ [Rendemen CPO / OER (%)]                                 │  │
│ │ Input: 22.0     Slider: 18 ─── 28                       │  │
│ │                                                           │  │
│ │ [Rendemen PK / KER (%)]                                  │  │
│ │ Input: 5.0      Slider: 3 ─── 8                         │  │
│ │                                                           │  │
│ │ [Indeks K (%)]                                           │  │
│ │ Input: 87.5     Slider: 80 ─── 95                       │  │
│ │                                                           │  │
│ │ [Biaya Olah PKS (Rp/Kg TBS)]  — Opsional                │  │
│ │ Input: 350                                               │  │
│ │                                                           │  │
│ │ [Button: Simpan Parameter Hari Ini]                      │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│ ┌──── KOLOM KANAN (8/12) ───────────────────────────────────┐  │
│ │ Card Dark: HASIL KALKULASI (real-time, tanpa klik)       │  │
│ │                                                           │  │
│ │              Harga TBS Wajar Hari Ini                    │  │
│ │              ╔══════════════════╗                         │  │
│ │              ║  Rp 2.669 /Kg   ║                         │  │
│ │              ╚══════════════════╝                         │  │
│ │                                                           │  │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│ │ │Komponen  │ │Komponen  │ │Margin    │ │Indeks K  │    │  │
│ │ │CPO       │ │PK        │ │PKS Est.  │ │Applied   │    │  │
│ │ │Rp 2.750  │ │Rp 300    │ │Rp 31/Kg  │ │87.5%     │    │  │
│ │ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │  │
│ └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 State Management

```tsx
"use client";

import { useState, useMemo } from "react";

export default function PriceCalculator() {
  const [params, setParams] = useState({
    harga_cpo: 12500,
    harga_pk: 6000,
    rendemen_cpo: 22,
    rendemen_pk: 5,
    indeks_k: 87.5,
    biaya_olah: 350,
  });

  // Kalkulasi REAL-TIME (tanpa perlu klik button)
  const result = useMemo(() => {
    const komponenCPO = params.harga_cpo * (params.rendemen_cpo / 100);
    const komponenPK = params.harga_pk * (params.rendemen_pk / 100);
    const totalSebelumK = komponenCPO + komponenPK;
    const hargaTBS = (params.indeks_k / 100) * totalSebelumK;
    const marginPKS = totalSebelumK - hargaTBS - params.biaya_olah;

    return {
      harga_tbs: Math.round(hargaTBS),
      margin_pks: Math.round(marginPKS),
      komponen_cpo: Math.round(komponenCPO),
      komponen_pk: Math.round(komponenPK),
    };
  }, [params]);

  // ... render UI ...
}
```

### 5.3 Fitur Interaktif

1. **Real-time calculation** — setiap perubahan slider/input langsung mengupdate hasil
2. **Animasi angka** — gunakan CSS transition saat angka berubah
3. **Tombol simpan** — simpan parameter ke database via POST `/api/price/parameters`
4. **Load latest** — saat page load, fetch parameter terakhir via GET `/api/price/parameters/latest`

---

## 6. Checklist Implementasi

### Database
- [ ] Tambah model `PriceParameter` di schema.prisma
- [ ] Run `npx prisma migrate dev --name add_price_parameters`

### Backend
- [ ] Buat `price.controller.ts`
- [ ] Buat `price.routes.ts`
- [ ] Register route di `server.ts`: `/api/price`
- [ ] Implementasi: POST `/calculate` (kalkulasi tanpa simpan)
- [ ] Implementasi: POST `/parameters` (simpan + upsert)
- [ ] Implementasi: GET `/parameters/latest`
- [ ] Implementasi: GET `/parameters/history`

### Frontend
- [ ] Refactor `PriceCalculator.jsx` → `PriceCalculator.tsx`
- [ ] Tambah state management (useState + useMemo)
- [ ] Tambah semua input parameter (CPO, PK, OER, KER, K, biaya olah)
- [ ] Implementasi real-time kalkulasi di frontend
- [ ] Buat slider untuk setiap parameter numerik
- [ ] Hubungkan tombol "Simpan" ke backend
- [ ] Load parameter terakhir saat page mount
- [ ] Update detail breakdown (Komponen CPO, PK, Margin, K)

### Testing
- [ ] Verifikasi formula: Harga TBS = K × (CPO × OER + PK × KER)
- [ ] Test edge: K = 0 atau rendemen = 0
- [ ] Test upsert: simpan 2x di hari yang sama harus update, bukan create baru
- [ ] Test load latest: harus mengembalikan parameter terakhir
