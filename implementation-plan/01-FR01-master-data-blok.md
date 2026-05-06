# FR-01: Manajemen Master Data Blok

> **Status:** ✅ Selesai (dengan catatan perbaikan)
> **Modul:** A — Manajemen Kebun
> **Requirement:** Sistem harus dapat menyimpan data blok kebun (ID Blok, Luas Ha, Tahun Tanam, Jenis Bibit, Lokasi GPS)

---

## 1. Apa yang Sudah Diimplementasi

### 1.1 Database Schema (`prisma/schema.prisma`)
Model `Land` sudah memiliki semua field yang dibutuhkan:

```prisma
model Land {
  id                    String   @id @default(uuid()) @db.Uuid
  owner_nik             String   @db.VarChar(50)
  nama_kelompok_tani    String?  @db.VarChar(255)
  lokasi_kebun          String?  @db.Text
  luas_ha               Decimal? @db.Decimal(10, 4)
  status_kepemilikan    String?  @db.VarChar(100)
  jenis_sertifikasi     String?  @db.VarChar(100)
  usia_tanam_raw        String?  @db.VarChar(100)
  jenis_bibit           String?  @db.VarChar(100)     // ✅ Sesuai requirement
  koordinat_gps         String?  @db.Text              // ✅ Sesuai requirement
  baseline_produksi_ton Decimal? @db.Decimal(10, 4)
  produksi_raw          String?  @db.VarChar(100)
  pabrik_mitra          String?  @db.VarChar(255)
}
```

### 1.2 Backend API
| Endpoint | Method | Controller | Status |
|----------|--------|------------|--------|
| `/api/lands` | GET | `getAllLands` | ✅ |
| `/api/lands/user/:nik` | GET | `getLandsByNik` | ✅ |
| `/api/lands/:id` | PUT | `updateLand` | ✅ (hanya jenis_bibit & koordinat_gps) |

### 1.3 Frontend
| Komponen | File | Status |
|----------|------|--------|
| Tabel Daftar Lahan | `components/management/ManagemenKebun.tsx` | ✅ |
| Detail Lahan | `app/farm-management/lahan/[id]/page.tsx` | ✅ |
| Dialog Edit | `components/management/EditLahanDialog.tsx` | ✅ |

---

## 2. Gap & Rekomendasi Perbaikan

### 2.1 Response `getAllLands` Tidak Include Field Baru

**Masalah:** Fungsi `getAllLands` di `lands.controller.ts` (line 55-72) meng-flatten response tapi **tidak menyertakan** `jenis_bibit` dan `koordinat_gps`.

**Fix:**
```typescript
// lands.controller.ts — getAllLands function, di dalam .map()
const data = lands.map((land) => ({
  // ... field yang sudah ada ...
  jenis_bibit:           land.jenis_bibit,           // ← TAMBAHKAN
  koordinat_gps:         land.koordinat_gps,          // ← TAMBAHKAN
}));
```

### 2.2 PUT Endpoint Terbatas

**Masalah:** Endpoint `PUT /api/lands/:id` hanya bisa update `jenis_bibit` dan `koordinat_gps`.

**Rekomendasi:** Perluas agar bisa update field lain yang relevan:
```typescript
export async function updateLand(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const {
    jenis_bibit,
    koordinat_gps,
    lokasi_kebun,        // ← TAMBAHKAN
    luas_ha,             // ← TAMBAHKAN
    usia_tanam_raw,      // ← TAMBAHKAN
    pabrik_mitra,        // ← TAMBAHKAN
  } = req.body;

  // ... logic update dengan semua field ...
}
```

### 2.3 Belum Ada Create & Delete Lahan

**Rekomendasi:**
- Tambahkan `POST /api/lands` untuk membuat lahan baru
- Tambahkan `DELETE /api/lands/:id` untuk menghapus lahan
- Buat UI form "Tambah Lahan Baru" di halaman Farm Management

---

## 3. Checklist Verifikasi

- [x] Field `id` (UUID) sebagai ID Blok
- [x] Field `luas_ha` (Decimal) untuk Luas Hektar
- [x] Field `usia_tanam_raw` (VARCHAR) untuk Tahun Tanam
- [x] Field `jenis_bibit` (VARCHAR) untuk Jenis Bibit
- [x] Field `koordinat_gps` (TEXT) untuk Lokasi GPS
- [x] API GET untuk listing data blok
- [x] API PUT untuk update data blok
- [x] UI Tabel listing + Detail view + Edit dialog
- [ ] API POST untuk create lahan baru (opsional)
- [ ] API DELETE untuk hapus lahan (opsional)
- [ ] Response `getAllLands` include `jenis_bibit` & `koordinat_gps`
