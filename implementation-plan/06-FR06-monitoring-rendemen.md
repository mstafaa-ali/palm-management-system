# FR-06: Monitoring Rendemen (OER/KER)

> **Status:** ❌ Belum diimplementasi
> **Modul:** B — Manajemen PKS
> **Requirement:** Input data hasil olah harian untuk mendapatkan persentase Oil Extraction Rate (OER) dan Kernel Extraction Rate (KER)
> **Prioritas:** 🟠 P2
> **Dependensi:** FR-05 (Log Jembatan Timbang — sebagai sumber data TBS masuk)

---

## 1. Deskripsi Fitur

Setelah TBS diterima dan ditimbang (FR-05), TBS diproses di pabrik untuk menghasilkan:
- **CPO** (Crude Palm Oil) — minyak sawit mentah
- **PK** (Palm Kernel) — inti sawit

Rendemen adalah persentase hasil olah terhadap berat TBS yang masuk:

```
┌──────────────────────────────────────────────────────┐
│  OER (Oil Extraction Rate)                           │
│  = (Tonase CPO dihasilkan / Tonase TBS diolah) × 100│
│                                                      │
│  Contoh: 5 Ton CPO / 22 Ton TBS = 22.7%             │
│  Standar industri: 20-24%                            │
├──────────────────────────────────────────────────────┤
│  KER (Kernel Extraction Rate)                        │
│  = (Tonase PK dihasilkan / Tonase TBS diolah) × 100 │
│                                                      │
│  Contoh: 1.1 Ton PK / 22 Ton TBS = 5.0%             │
│  Standar industri: 4-6%                              │
└──────────────────────────────────────────────────────┘
```

---

## 2. Rencana Database Schema

### Model Baru: `MillProduction`

```prisma
// prisma/schema.prisma — TAMBAHKAN

model MillProduction {
  id                  String   @id @default(uuid()) @db.Uuid
  tanggal_produksi    DateTime @db.Date
  
  // Input TBS Olah
  tbs_olah_kg         Decimal  @db.Decimal(12, 2)  // Total TBS yang diolah hari itu
  
  // Output Produksi
  cpo_dihasilkan_kg   Decimal  @db.Decimal(12, 2)  // Tonase CPO
  pk_dihasilkan_kg    Decimal  @db.Decimal(12, 2)   // Tonase Palm Kernel
  
  // Rendemen (dihitung otomatis, disimpan untuk query cepat)
  oer_persen          Decimal? @db.Decimal(5, 2)    // Oil Extraction Rate %
  ker_persen          Decimal? @db.Decimal(5, 2)    // Kernel Extraction Rate %
  
  // Catatan
  catatan             String?  @db.Text
  created_at          DateTime @default(now())
  
  @@map("mill_productions")
}
```

> [!NOTE]
> **Desain Decision:** OER dan KER bisa saja dihitung on-the-fly (tidak perlu disimpan), tapi menyimpannya di kolom memudahkan query agregasi dan reporting historis tanpa perlu join ulang.

---

## 3. Rencana Backend API

### Controller: `mill-production.controller.ts`

| Endpoint | Method | Fungsi | Deskripsi |
|----------|--------|--------|-----------|
| `/api/mill-production` | GET | `getAllProductions` | Daftar produksi harian (filter: tanggal, range) |
| `/api/mill-production` | POST | `createProduction` | Input data produksi harian |
| `/api/mill-production/:id` | PUT | `updateProduction` | Update data jika ada koreksi |
| `/api/mill-production/:id` | DELETE | `deleteProduction` | Hapus data produksi |
| `/api/mill-production/summary` | GET | `getRendemenSummary` | Rangkuman OER/KER per periode |

### Contoh Implementasi

```typescript
// mill-production.controller.ts

export const createProduction = async (req: Request, res: Response) => {
  const { tanggal_produksi, tbs_olah_kg, cpo_dihasilkan_kg, pk_dihasilkan_kg, catatan } = req.body;

  // Validasi
  if (!tanggal_produksi || !tbs_olah_kg || !cpo_dihasilkan_kg || !pk_dihasilkan_kg) {
    return res.status(400).json({ success: false, message: "Semua field produksi wajib diisi." });
  }

  const tbsOlah = Number(tbs_olah_kg);
  const cpo = Number(cpo_dihasilkan_kg);
  const pk = Number(pk_dihasilkan_kg);

  // Hitung rendemen otomatis
  const oer = tbsOlah > 0 ? (cpo / tbsOlah) * 100 : 0;
  const ker = tbsOlah > 0 ? (pk / tbsOlah) * 100 : 0;

  const production = await prisma.millProduction.create({
    data: {
      tanggal_produksi: new Date(tanggal_produksi),
      tbs_olah_kg: tbsOlah,
      cpo_dihasilkan_kg: cpo,
      pk_dihasilkan_kg: pk,
      oer_persen: Math.round(oer * 100) / 100,
      ker_persen: Math.round(ker * 100) / 100,
      catatan,
    },
  });

  res.status(201).json({ success: true, data: production });
};

// GET /api/mill-production/summary?bulan=5&tahun=2026
export const getRendemenSummary = async (req: Request, res: Response) => {
  const { bulan, tahun } = req.query;
  const year = tahun ? Number(tahun) : new Date().getFullYear();
  const month = bulan ? Number(bulan) - 1 : new Date().getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const agg = await prisma.millProduction.aggregate({
    _sum: { tbs_olah_kg: true, cpo_dihasilkan_kg: true, pk_dihasilkan_kg: true },
    _avg: { oer_persen: true, ker_persen: true },
    _count: true,
    where: { tanggal_produksi: { gte: start, lte: end } },
  });

  res.json({
    success: true,
    data: {
      total_tbs_olah_kg: Number(agg._sum.tbs_olah_kg || 0),
      total_cpo_kg: Number(agg._sum.cpo_dihasilkan_kg || 0),
      total_pk_kg: Number(agg._sum.pk_dihasilkan_kg || 0),
      rata_oer: Number(agg._avg.oer_persen || 0),
      rata_ker: Number(agg._avg.ker_persen || 0),
      jumlah_hari_produksi: agg._count,
    },
  });
};
```

---

## 4. Rencana Frontend

### 4.1 Integrasi ke Halaman `/mill-operations`

Tambahkan tab baru di halaman Mill Operations:

```
┌─────────────────────────────────────────────────────┐
│ [Tabs: Jembatan Timbang | Produksi & Rendemen]      │
├─────────────────────────────────────────────────────┤
│ Tab "Produksi & Rendemen":                          │
│                                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│ │Total TBS │ │Total CPO │ │Rata OER  │ │Rata KER│ │
│ │Olah (T)  │ │(Ton)     │ │(%)       │ │(%)     │ │
│ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                     │
│ [LineChart: Tren OER & KER 30 hari]                 │
│   - Line hijau: OER%                                │
│   - Line biru: KER%                                 │
│   - Dashed line: target OER (22%)                   │
│                                                     │
│ [Tabel Input Produksi Harian]                       │
│  + Button "Catat Produksi Hari Ini"                 │
└─────────────────────────────────────────────────────┘
```

### 4.2 Komponen yang Dibutuhkan

| File | Deskripsi |
|------|-----------|
| `components/mill/RendemenDashboard.tsx` | KPI cards + chart OER/KER |
| `components/mill/ProductionTable.tsx` | Tabel riwayat produksi harian |
| `components/mill/ProductionFormDialog.tsx` | Dialog form input produksi |

### 4.3 Visualisasi OER/KER

Gunakan `LineChart` dari Recharts (sudah diinstal) dengan:
- **Garis OER**: warna hijau (#065F46), solid
- **Garis KER**: warna biru (#3B82F6), solid
- **Target OER**: dashed line kuning di 22%
- **Target KER**: dashed line kuning di 5%
- **Tooltip**: tampilkan tanggal, TBS olah, CPO, PK, OER%, KER%

---

## 5. Integrasi dengan Dashboard Utama

Update `RefinedStats.jsx` agar KPI card "Rata-rata OER" mengambil data real:

```jsx
// components/dashboard/RefinedStats.jsx
// Ganti hardcoded "23.4" dengan fetch dari /api/mill-production/summary

const [oerAvg, setOerAvg] = useState("23.4");
useEffect(() => {
  fetch(`${apiUrl}/api/mill-production/summary`)
    .then(res => res.json())
    .then(json => setOerAvg(json.data.rata_oer.toFixed(1)));
}, []);
```

---

## 6. Checklist Implementasi

### Database
- [ ] Tambah model `MillProduction` di schema.prisma
- [ ] Run `npx prisma migrate dev --name add_mill_production`

### Backend
- [ ] Buat `mill-production.controller.ts`
- [ ] Buat `mill-production.routes.ts`
- [ ] Register route di `server.ts`: `/api/mill-production`
- [ ] Implementasi: POST create + auto-hitung OER/KER
- [ ] Implementasi: GET list + filter tanggal
- [ ] Implementasi: GET summary (agregasi bulanan)
- [ ] Implementasi: PUT update + DELETE

### Frontend
- [ ] Buat `RendemenDashboard.tsx` dengan 4 KPI cards
- [ ] Buat `ProductionTable.tsx` (tabel + form dialog)
- [ ] Buat chart tren OER/KER (Recharts LineChart)
- [ ] Integrasikan ke halaman `/mill-operations` sebagai tab
- [ ] Update `RefinedStats.jsx` untuk data real OER

### Testing
- [ ] Verifikasi kalkulasi: OER = (CPO / TBS) × 100
- [ ] Verifikasi kalkulasi: KER = (PK / TBS) × 100
- [ ] Test summary endpoint dengan range tanggal
- [ ] Test edge case: TBS = 0 (hindari division by zero)
