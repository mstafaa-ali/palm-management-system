# FR-07: Tracking Losses

> **Status:** ❌ Belum diimplementasi
> **Modul:** B — Manajemen PKS
> **Requirement:** Pencatatan kehilangan minyak (losses) pada setiap tahap pengolahan (Digester, Press, dsb) untuk audit efisiensi
> **Prioritas:** 🔵 P3
> **Dependensi:** FR-06 (Monitoring Rendemen — sebagai basis data produksi)

---

## 1. Deskripsi Fitur

Dalam proses pengolahan TBS menjadi CPO, terdapat kehilangan minyak (oil losses) di berbagai tahap. Tracking losses penting untuk:
- **Audit efisiensi** pabrik
- **Identifikasi bottleneck** di tahap mana losses tertinggi
- **Optimasi proses** untuk mengurangi losses

### Tahap Pengolahan & Titik Losses

```
TBS Masuk
    │
    ▼
┌──────────┐
│ Sterilizer│ → Losses: Condensate (air rebusan mengandung minyak)
└────┬─────┘
     ▼
┌──────────┐
│ Thresher  │ → Losses: Empty Bunch (tandan kosong masih mengandung minyak)
└────┬─────┘
     ▼
┌──────────┐
│ Digester  │ → Losses: Sludge underflow
└────┬─────┘
     ▼
┌──────────┐
│ Press     │ → Losses: Fibre (ampas press masih mengandung minyak)
└────┬─────┘
     ▼
┌──────────┐
│ Clarifier │ → Losses: Final effluent (limbah cair)
└────┬─────┘
     ▼
  CPO Final
```

---

## 2. Rencana Database Schema

### Model Baru: `MillLoss`

```prisma
// prisma/schema.prisma — TAMBAHKAN

model MillLoss {
  id                  String   @id @default(uuid()) @db.Uuid
  production_id       String?  @db.Uuid              // FK ke MillProduction (opsional)
  tanggal             DateTime @db.Date
  
  // Titik Losses
  tahap_proses        String   @db.VarChar(50)       // "Sterilizer" | "Thresher" | "Digester" | "Press" | "Clarifier"
  jenis_losses        String   @db.VarChar(100)      // "Condensate" | "Empty Bunch" | "Fibre" | "Sludge" | "Final Effluent"
  
  // Pengukuran
  losses_kg           Decimal  @db.Decimal(10, 2)    // Berat losses (kg)
  kadar_minyak_persen Decimal? @db.Decimal(5, 2)     // % kandungan minyak di losses
  oil_losses_kg       Decimal? @db.Decimal(10, 2)    // losses_kg × kadar_minyak% (dihitung)
  
  // Catatan
  catatan             String?  @db.Text
  created_at          DateTime @default(now())
  
  // Relasi (opsional, untuk link ke produksi harian)
  production          MillProduction? @relation(fields: [production_id], references: [id])
  
  @@map("mill_losses")
}
```

**Update Model `MillProduction`:**
```prisma
model MillProduction {
  // ... field yang sudah ada ...
  losses  MillLoss[]  // ← TAMBAHKAN relasi
}
```

---

## 3. Rencana Backend API

### Controller: `mill-losses.controller.ts`

| Endpoint | Method | Fungsi | Deskripsi |
|----------|--------|--------|-----------|
| `/api/mill-losses` | GET | `getAllLosses` | Daftar losses (filter: tanggal, tahap_proses) |
| `/api/mill-losses` | POST | `createLoss` | Input data losses |
| `/api/mill-losses/:id` | PUT | `updateLoss` | Update data losses |
| `/api/mill-losses/:id` | DELETE | `deleteLoss` | Hapus data losses |
| `/api/mill-losses/summary` | GET | `getLossesSummary` | Rangkuman losses per tahap per periode |

### Contoh Implementasi

```typescript
// mill-losses.controller.ts

export const createLoss = async (req: Request, res: Response) => {
  const { 
    production_id, tanggal, tahap_proses, 
    jenis_losses, losses_kg, kadar_minyak_persen, catatan 
  } = req.body;

  const lossesKg = Number(losses_kg);
  const kadar = kadar_minyak_persen ? Number(kadar_minyak_persen) : null;
  
  // Hitung oil losses jika kadar minyak diketahui
  const oilLossesKg = kadar !== null ? (lossesKg * kadar) / 100 : null;

  const loss = await prisma.millLoss.create({
    data: {
      production_id: production_id || null,
      tanggal: new Date(tanggal),
      tahap_proses,
      jenis_losses,
      losses_kg: lossesKg,
      kadar_minyak_persen: kadar,
      oil_losses_kg: oilLossesKg,
      catatan,
    },
  });

  res.status(201).json({ success: true, data: loss });
};

// GET /api/mill-losses/summary — Breakdown per tahap
export const getLossesSummary = async (req: Request, res: Response) => {
  const { bulan, tahun } = req.query;
  // ... filter periode ...

  const summary = await prisma.millLoss.groupBy({
    by: ["tahap_proses"],
    _sum: { losses_kg: true, oil_losses_kg: true },
    _count: true,
    where: { tanggal: { gte: start, lte: end } },
    orderBy: { _sum: { oil_losses_kg: "desc" } },
  });

  res.json({ success: true, data: summary });
};
```

---

## 4. Rencana Frontend

### 4.1 Integrasi ke Halaman `/mill-operations`

Tambahkan tab ketiga di Mill Operations:

```
┌─────────────────────────────────────────────────────────────┐
│ [Tabs: Jembatan Timbang | Produksi & Rendemen | Losses]    │
├─────────────────────────────────────────────────────────────┤
│ Tab "Losses":                                               │
│                                                             │
│ ┌──────────────────┐ ┌──────────────────┐                  │
│ │ Total Oil Losses │ │ Losses Rate (%)  │                  │
│ │ 245 Kg           │ │ 1.12%            │                  │
│ └──────────────────┘ └──────────────────┘                  │
│                                                             │
│ [BarChart Horizontal: Losses per Tahap]                     │
│   Sterilizer  ████████ 45 Kg                               │
│   Thresher    ██████ 35 Kg                                 │
│   Digester    ████████████ 68 Kg                           │
│   Press       ██████████████████ 72 Kg                     │
│   Clarifier   ██████ 25 Kg                                 │
│                                                             │
│ [Tabel Detail Losses Harian]                               │
│   + Button "Catat Losses"                                  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Komponen yang Dibutuhkan

| File | Deskripsi |
|------|-----------|
| `components/mill/LossesDashboard.tsx` | KPI cards + chart breakdown |
| `components/mill/LossesTable.tsx` | Tabel detail losses harian |
| `components/mill/LossesFormDialog.tsx` | Dialog form input losses |

### 4.3 Visualisasi

**Horizontal BarChart** per tahap proses (Recharts):
- Warna gradien: merah muda → merah tua (semakin besar losses semakin gelap)
- Tooltip: tahap, jenis losses, berat (kg), kadar minyak %, oil losses

**Losses Rate** dihitung sebagai:
```
Losses Rate (%) = Total Oil Losses (Kg) / Total TBS Olah (Kg) × 100
```
Membutuhkan data dari FR-06 (`MillProduction.tbs_olah_kg`).

---

## 5. Checklist Implementasi

### Database
- [ ] Tambah model `MillLoss` di schema.prisma
- [ ] Tambah relasi `losses` di model `MillProduction`
- [ ] Run `npx prisma migrate dev --name add_mill_losses`

### Backend
- [ ] Buat `mill-losses.controller.ts`
- [ ] Buat `mill-losses.routes.ts`
- [ ] Register route di `server.ts`: `/api/mill-losses`
- [ ] Implementasi: POST + auto-hitung oil_losses_kg
- [ ] Implementasi: GET list + filter
- [ ] Implementasi: GET summary (groupBy tahap_proses)

### Frontend
- [ ] Buat `LossesDashboard.tsx` (KPI + horizontal bar chart)
- [ ] Buat `LossesTable.tsx`
- [ ] Buat `LossesFormDialog.tsx` (select tahap, input kg & kadar)
- [ ] Integrasikan sebagai tab ketiga di `/mill-operations`

### Testing
- [ ] Verifikasi: oil_losses = losses_kg × kadar_minyak / 100
- [ ] Test summary groupBy tahap_proses
- [ ] Test relasi production_id (opsional)
