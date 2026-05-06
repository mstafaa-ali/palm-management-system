# FR-02: Pencatatan Produksi (Panen)

> **Status:** ✅ Selesai (dengan catatan perbaikan)
> **Modul:** A — Manajemen Kebun
> **Requirement:** Sistem harus memungkinkan input data panen harian per blok (Jumlah Janjang, Estimasi Berat/Kg)

---

## 1. Apa yang Sudah Diimplementasi

### 1.1 Database Schema (`prisma/schema.prisma`)

```prisma
model Harvest {
  id                 String   @id @default(uuid()) @db.Uuid
  land_id            String   @db.Uuid
  tanggal_panen      DateTime @db.Date
  jumlah_janjang     Int                          // ✅ Sesuai requirement
  estimasi_berat_kg  Decimal  @db.Decimal(10, 2)  // ✅ Sesuai requirement
  created_at         DateTime @default(now())
  land               Land     @relation(...)
}
```

### 1.2 Backend API

| Endpoint | Method | Controller | Status |
|----------|--------|------------|--------|
| `/api/harvests/land/:landId` | GET | `getHarvestsByLand` | ✅ |
| `/api/harvests` | POST | `createHarvest` | ✅ |

**Catatan:** Controller sudah memiliki mekanisme resolve `owner_nik` → `land_id` (line 16-22 di `harvests.controller.ts`), sehingga frontend bisa mengirim NIK maupun UUID.

### 1.3 Frontend

| Komponen | File | Status |
|----------|------|--------|
| Form Input Panen | `components/management/HarvestTab.tsx` | ✅ |
| Tabel Riwayat Panen | `components/management/HarvestTab.tsx` | ✅ |
| Tab "Panen Harian" | `app/farm-management/lahan/[id]/page.tsx` (line 639-641) | ✅ |

**UI Detail:**
- Form: Tanggal Panen (date), Jumlah Janjang (number, min 1), Estimasi Berat Kg (number, step 0.01)
- Tabel: Tanggal, Jumlah Janjang, Estimasi Berat, Waktu Input
- Layout: 1/3 form + 2/3 tabel (responsive grid)

---

## 2. Gap & Rekomendasi Perbaikan

### 2.1 Tidak Ada DELETE/UPDATE untuk Data Panen

**Masalah:** Berbeda dengan `CostTab.tsx` yang sudah memiliki fitur hapus, `HarvestTab.tsx` belum memiliki operasi DELETE atau EDIT.

**Implementasi yang dibutuhkan:**

**Backend:**
```typescript
// harvests.controller.ts — Tambahkan
export const deleteHarvest = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  // ... logic hapus berdasarkan harvest id ...
};

export const updateHarvest = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { tanggal_panen, jumlah_janjang, estimasi_berat_kg } = req.body;
  // ... logic update ...
};
```

**Route:**
```typescript
// harvests.routes.ts
router.delete("/:id", deleteHarvest);
router.put("/:id", updateHarvest);
```

**Frontend:** Tambahkan tombol hapus di setiap row tabel riwayat panen (sama seperti CostTab).

### 2.2 Tidak Ada Validasi Duplikasi Tanggal

**Rekomendasi:** Tambahkan pengecekan apakah sudah ada data panen untuk `land_id` + `tanggal_panen` yang sama, untuk mencegah double entry.

```typescript
// Di createHarvest, sebelum prisma.harvest.create()
const existing = await prisma.harvest.findFirst({
  where: {
    land_id: actualLandId,
    tanggal_panen: new Date(tanggal_panen),
  },
});
if (existing) {
  res.status(409).json({
    success: false,
    message: "Data panen untuk tanggal ini sudah ada.",
  });
  return;
}
```

### 2.3 Integrasi dengan Validasi Timbangan (Modul 1, Poin 3)

Requirement Document menyebutkan: *"Validasi Timbangan: Data estimasi kebun dicocokkan dengan data timbangan nyata saat TBS tiba di PKS atau RAM"*

Ini akan diimplementasi saat FR-05 (Log Jembatan Timbang) selesai. Nantinya perlu:
- Relasi antara `Harvest.estimasi_berat_kg` dengan berat aktual dari timbangan
- UI untuk membandingkan estimasi vs aktual
- Alert jika deviasi melebihi threshold tertentu

---

## 3. Checklist Verifikasi

- [x] Model `Harvest` di schema Prisma
- [x] Field `jumlah_janjang` (Int) — sesuai requirement
- [x] Field `estimasi_berat_kg` (Decimal) — sesuai requirement
- [x] Field `tanggal_panen` (Date) — pencatatan harian
- [x] API GET riwayat panen per lahan
- [x] API POST tambah data panen
- [x] Resolve NIK → UUID di controller
- [x] UI Form input panen
- [x] UI Tabel riwayat panen
- [ ] API DELETE untuk hapus data panen
- [ ] API PUT untuk update data panen
- [ ] Validasi duplikasi tanggal
- [ ] Integrasi validasi timbangan (butuh FR-05)
