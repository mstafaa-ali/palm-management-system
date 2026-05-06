# FR-05: Log Jembatan Timbang

> **Status:** ❌ Belum diimplementasi
> **Modul:** B — Manajemen PKS
> **Requirement:** Pencatatan TBS masuk (Bruto, Tara, Netto) dan sumber asal kebun (Internal vs Eksternal)
> **Prioritas:** 🟡 P1
> **Dependensi:** Tidak ada (independen, bisa dikerjakan paralel)

---

## 1. Deskripsi Fitur

Fitur ini mencatat proses penerimaan Tandan Buah Segar (TBS) di Pabrik Kelapa Sawit (PKS) melalui jembatan timbang. Setiap truk yang masuk akan:

1. Ditimbang saat masuk (berat **Bruto** = truk + muatan)
2. Ditimbang saat keluar (berat **Tara** = truk kosong)
3. Dihitung berat bersih (**Netto** = Bruto - Tara)
4. Dicatat asal muatannya (**Internal** dari kebun sendiri atau **Eksternal** dari petani mitra)

---

## 2. Rencana Database Schema

### Model Baru: `WeighbridgeLog`

```prisma
// prisma/schema.prisma — TAMBAHKAN

model WeighbridgeLog {
  id              String    @id @default(uuid()) @db.Uuid
  nomor_kendaraan String    @db.VarChar(20)     // Plat nomor truk
  nama_supir      String?   @db.VarChar(255)
  
  // Sumber TBS
  sumber          String    @db.VarChar(20)     // "Internal" | "Eksternal"
  land_id         String?   @db.Uuid            // FK ke Land (jika Internal)
  nama_pemasok    String?   @db.VarChar(255)    // Nama petani mitra (jika Eksternal)
  
  // Data Timbangan
  berat_bruto_kg  Decimal   @db.Decimal(10, 2)  // Berat kotor (truk + TBS)
  berat_tara_kg   Decimal?  @db.Decimal(10, 2)  // Berat truk kosong
  berat_netto_kg  Decimal?  @db.Decimal(10, 2)  // Otomatis: bruto - tara
  
  // Waktu
  waktu_masuk     DateTime  @default(now())     // Timestamp timbang masuk
  waktu_keluar    DateTime?                     // Timestamp timbang keluar
  
  // Status
  status          String    @db.VarChar(20)     @default("masuk")  // "masuk" | "selesai"
  
  // Metadata
  created_at      DateTime  @default(now())
  
  // Relasi
  land            Land?     @relation(fields: [land_id], references: [id])
  
  @@map("weighbridge_logs")
}
```

**Update Model `Land`:**
```prisma
model Land {
  // ... field yang sudah ada ...
  weighbridge_logs WeighbridgeLog[]  // ← TAMBAHKAN relasi
}
```

---

## 3. Rencana Backend API

### Controller: `weighbridge.controller.ts`

| Endpoint | Method | Fungsi | Deskripsi |
|----------|--------|--------|-----------|
| `/api/weighbridge` | GET | `getAllWeighbridgeLogs` | Daftar semua log timbangan (filter: tanggal, status, sumber) |
| `/api/weighbridge` | POST | `createWeighbridgeEntry` | Catat truk masuk (Bruto) |
| `/api/weighbridge/:id/tara` | PATCH | `updateTara` | Update berat Tara + hitung Netto + set status "selesai" |
| `/api/weighbridge/:id` | GET | `getWeighbridgeById` | Detail satu transaksi |
| `/api/weighbridge/summary` | GET | `getDailySummary` | Rangkuman harian (total truk, total netto, breakdown sumber) |

### Flow Bisnis

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Truk Masuk  │────▶│ Input Bruto  │────▶│ Status:      │
│  (POST)      │     │ + Sumber     │     │ "masuk"      │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Truk Keluar │────▶│ Input Tara   │────▶│ Status:      │
│  (PATCH)     │     │ + Hitung     │     │ "selesai"    │
└──────────────┘     │   Netto      │     └──────────────┘
                     └──────────────┘
```

### Contoh Implementasi Controller

```typescript
// weighbridge.controller.ts

// POST /api/weighbridge — Truk masuk
export const createWeighbridgeEntry = async (req: Request, res: Response) => {
  const { 
    nomor_kendaraan, nama_supir, sumber, 
    land_id, nama_pemasok, berat_bruto_kg 
  } = req.body;

  // Validasi: jika Internal, land_id wajib; jika Eksternal, nama_pemasok wajib
  if (sumber === "Internal" && !land_id) {
    return res.status(400).json({ error: "land_id wajib untuk sumber Internal" });
  }
  if (sumber === "Eksternal" && !nama_pemasok) {
    return res.status(400).json({ error: "nama_pemasok wajib untuk sumber Eksternal" });
  }

  const entry = await prisma.weighbridgeLog.create({
    data: {
      nomor_kendaraan,
      nama_supir,
      sumber,
      land_id: sumber === "Internal" ? land_id : null,
      nama_pemasok: sumber === "Eksternal" ? nama_pemasok : null,
      berat_bruto_kg: Number(berat_bruto_kg),
      status: "masuk",
    },
  });

  res.status(201).json({ success: true, data: entry });
};

// PATCH /api/weighbridge/:id/tara — Truk keluar
export const updateTara = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { berat_tara_kg } = req.body;

  const entry = await prisma.weighbridgeLog.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ error: "Data tidak ditemukan" });

  const netto = Number(entry.berat_bruto_kg) - Number(berat_tara_kg);

  const updated = await prisma.weighbridgeLog.update({
    where: { id },
    data: {
      berat_tara_kg: Number(berat_tara_kg),
      berat_netto_kg: netto,
      waktu_keluar: new Date(),
      status: "selesai",
    },
  });

  res.json({ success: true, data: updated });
};
```

---

## 4. Rencana Frontend

### 4.1 Halaman: `/mill-operations` (Replace Placeholder)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Breadcrumb: Home > Mill Operations                  │
│ Header: "Operasional PKS — Jembatan Timbang"       │
├─────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│ │Total Truk│ │Total     │ │Internal  │ │External│ │
│ │Hari Ini  │ │Netto (T) │ │Count     │ │Count   │ │
│ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
├─────────────────────────────────────────────────────┤
│ [Tabs: Antrean Aktif | Riwayat Hari Ini]            │
│                                                     │
│ Tab Antrean: Tabel truk status "masuk"              │
│  + Tombol "Input Tara" per row                      │
│                                                     │
│ Tab Riwayat: Tabel truk status "selesai"            │
│  + Filter tanggal, sumber                           │
├─────────────────────────────────────────────────────┤
│ [Button: + Catat Truk Masuk]                        │
│  → Dialog form: Plat, Supir, Sumber, Bruto          │
└─────────────────────────────────────────────────────┘
```

### 4.2 Komponen yang Dibutuhkan

| File | Deskripsi |
|------|-----------|
| `components/mill/WeighbridgeTable.tsx` | Tabel antrean & riwayat timbangan |
| `components/mill/WeighbridgeEntryDialog.tsx` | Dialog form catat truk masuk |
| `components/mill/TaraInputDialog.tsx` | Dialog input berat tara |
| `components/mill/WeighbridgeSummary.tsx` | KPI cards rangkuman harian |

---

## 5. Checklist Implementasi

### Database
- [ ] Tambah model `WeighbridgeLog` di schema.prisma
- [ ] Tambah relasi `weighbridge_logs` di model `Land`
- [ ] Run `npx prisma migrate dev --name add_weighbridge`

### Backend
- [ ] Buat `weighbridge.controller.ts`
- [ ] Buat `weighbridge.routes.ts`
- [ ] Register route di `server.ts`
- [ ] Implementasi: POST (truk masuk)
- [ ] Implementasi: PATCH (input tara, hitung netto)
- [ ] Implementasi: GET (list + filter)
- [ ] Implementasi: GET summary (rangkuman harian)

### Frontend
- [ ] Replace placeholder di `mill-operations/page.tsx`
- [ ] Buat `WeighbridgeTable.tsx`
- [ ] Buat `WeighbridgeEntryDialog.tsx`
- [ ] Buat `TaraInputDialog.tsx`
- [ ] Buat `WeighbridgeSummary.tsx` (KPI cards)
- [ ] Badge status: "masuk" (kuning), "selesai" (hijau)
- [ ] Badge sumber: "Internal" (biru), "Eksternal" (oranye)

### Testing
- [ ] Test flow: POST truk masuk → PATCH tara → verifikasi netto = bruto - tara
- [ ] Test validasi: Internal tanpa land_id → 400
- [ ] Test filter: GET dengan query params tanggal & sumber
