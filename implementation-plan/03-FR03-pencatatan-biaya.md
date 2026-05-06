# FR-03: Pencatatan Biaya (Cost Tracking)

> **Status:** ✅ Selesai — Implementasi terlengkap
> **Modul:** A — Manajemen Kebun
> **Requirement:** Sistem harus dapat mengalokasikan biaya (Pupuk, Upah, Transport) ke masing-masing blok

---

## 1. Apa yang Sudah Diimplementasi

### 1.1 Database Schema (`prisma/schema.prisma`)

```prisma
model Cost {
  id            String   @id @default(uuid()) @db.Uuid
  land_id       String   @db.Uuid
  tanggal       DateTime @db.Date
  jenis_biaya   String   @db.VarChar(100)  // "Pupuk", "Upah", "Transport", "Lainnya"
  jumlah_biaya  Decimal  @db.Decimal(15, 2)
  keterangan    String?  @db.Text
  created_at    DateTime @default(now())
  land          Land     @relation(...)
}
```

### 1.2 Backend API — CRUD Lengkap

| Endpoint | Method | Controller | Status |
|----------|--------|------------|--------|
| `/api/costs/land/:landId` | GET | `getCostsByLand` | ✅ |
| `/api/costs` | POST | `createCost` | ✅ |
| `/api/costs/:id` | DELETE | `deleteCost` | ✅ |

**Highlights:**
- Semua controller sudah memiliki error handling & validasi input
- Resolve `owner_nik` → `land_id` konsisten di GET dan POST
- DELETE memverifikasi existence sebelum hapus (404 jika tidak ada)

### 1.3 Frontend

| Komponen | File | Status |
|----------|------|--------|
| Form Input Biaya | `components/management/CostTab.tsx` | ✅ |
| Tabel Riwayat Biaya | `components/management/CostTab.tsx` | ✅ |
| Tab "Biaya Operasional" | `app/farm-management/lahan/[id]/page.tsx` | ✅ |

**UI Detail:**
- **Form:** Tanggal (date), Jenis Biaya (select: Pupuk/Upah/Transport/Maintenance/Lainnya), Jumlah Biaya Rp (number), Keterangan (text, opsional)
- **Tabel:** Tanggal, Jenis Biaya (badge berwarna), Keterangan, Jumlah (Rp format), Aksi (hapus)
- **Badge Colors:** Pupuk=hijau, Upah=biru, Transport=oranye, Lainnya=abu-abu
- **Konfirmasi hapus:** Menggunakan `confirm()` dialog sebelum delete

---

## 2. Gap & Rekomendasi Perbaikan

### 2.1 Tidak Ada Fitur UPDATE

**Masalah:** User tidak bisa mengedit data biaya yang sudah diinput. Jika salah, harus hapus dan input ulang.

**Rekomendasi:** Tambahkan endpoint PUT dan UI dialog edit:

```typescript
// costs.controller.ts — Tambahkan
export const updateCost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { tanggal, jenis_biaya, jumlah_biaya, keterangan } = req.body;
  // ... update logic ...
};
```

### 2.2 Tidak Ada Rangkuman Total Biaya

**Rekomendasi:** Tambahkan ringkasan di atas tabel:
- Total biaya per kategori (Pupuk: Rp X, Upah: Rp Y, Transport: Rp Z)
- Total keseluruhan biaya untuk lahan tersebut
- Perbandingan biaya bulan ini vs bulan lalu

### 2.3 Kategori Biaya Bisa Diperluas

**Saat ini:** 5 opsi hardcoded di frontend (`Pupuk`, `Upah`, `Transport`, `Maintenance`, `Lainnya`)
**Rekomendasi:** Pertimbangkan membuat tabel master `CostCategory` jika kategori sering berubah, atau biarkan hardcoded jika sudah cukup.

---

## 3. Checklist Verifikasi

- [x] Model `Cost` di schema Prisma
- [x] Field `jenis_biaya` — Pupuk, Upah, Transport ✅ sesuai requirement
- [x] Field `jumlah_biaya` (Decimal 15,2) — cukup untuk nominal Rupiah besar
- [x] Field `keterangan` (optional Text)
- [x] API GET riwayat biaya per lahan
- [x] API POST tambah biaya
- [x] API DELETE hapus biaya
- [x] Resolve NIK → UUID di controller
- [x] UI Form input biaya dengan select jenis
- [x] UI Tabel riwayat biaya dengan badge berwarna
- [x] Format Rupiah di tampilan (toLocaleString)
- [x] Konfirmasi sebelum hapus
- [ ] API PUT untuk update data biaya
- [ ] Ringkasan total biaya per kategori
