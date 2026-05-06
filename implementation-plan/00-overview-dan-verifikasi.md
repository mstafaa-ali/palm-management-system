# 📋 Overview Proyek & Verifikasi Status Implementasi

> Dokumen ini berisi ringkasan analisis keseluruhan proyek Palm Management System berdasarkan `project-description.md` dan `requirement-document.md`, serta hasil verifikasi implementasi FR-01 sampai FR-04.

---

## 1. Arsitektur Sistem

| Layer | Teknologi | Lokasi |
|-------|-----------|--------|
| **Frontend** | Next.js (App Router) + Shadcn/UI + Recharts | `palm-management-system/` |
| **Backend** | Express.js + TypeScript | `palm-management-backend/` |
| **Database** | PostgreSQL + Prisma ORM | `palm-management-backend/prisma/` |
| **Auth** | express-session + connect-pg-simple | `palm-management-backend/src/lib/auth.middleware.ts` |

---

## 2. Peta Fitur (Requirement Mapping)

### Modul A: Manajemen Kebun

| ID | Fitur | Status | Catatan |
|----|-------|--------|---------|
| FR-01 | Manajemen Master Data Blok | ✅ Selesai (dengan catatan) | Lihat detail verifikasi di bawah |
| FR-02 | Pencatatan Produksi (Panen) | ✅ Selesai (dengan catatan) | Lihat detail verifikasi di bawah |
| FR-03 | Pencatatan Biaya (Cost Tracking) | ✅ Selesai | CRUD lengkap |
| FR-04 | Kalkulasi Produktivitas | ⚠️ Parsial | Yield/Ha belum dihitung dari data harvests |

### Modul B: Manajemen PKS

| ID | Fitur | Status | Catatan |
|----|-------|--------|---------|
| FR-05 | Log Jembatan Timbang | ❌ Belum | Halaman placeholder saja |
| FR-06 | Monitoring Rendemen (OER/KER) | ❌ Belum | Belum ada model/schema |
| FR-07 | Tracking Losses | ❌ Belum | Belum ada model/schema |

### Modul C: Simulasi Harga TBS

| ID | Fitur | Status | Catatan |
|----|-------|--------|---------|
| FR-08 | Pengaturan Parameter Harga | ⚠️ Parsial | UI statis, belum ada backend/logika |
| FR-09 | Kalkulator Harga Wajar | ⚠️ Parsial | UI statis, formula belum aktif |
| FR-10 | Analisis Sensitivitas | ❌ Belum | Belum ada implementasi |

---

## 3. Verifikasi Detail FR-01 s/d FR-04

### ✅ FR-01: Manajemen Master Data Blok

**Requirement:** Sistem harus menyimpan data blok kebun (ID Blok, Luas Ha, Tahun Tanam, Jenis Bibit, Lokasi GPS)

**Status: SELESAI — dengan catatan minor**

| Komponen | Status | Detail |
|----------|--------|--------|
| Schema (Prisma) | ✅ | Model `Land` memiliki semua field: `id`, `luas_ha`, `usia_tanam_raw`, `jenis_bibit`, `koordinat_gps`, `lokasi_kebun` |
| Backend API GET | ✅ | `GET /api/lands` — daftar semua lahan, `GET /api/lands/user/:nik` — lahan per pemilik |
| Backend API PUT | ✅ | `PUT /api/lands/:id` — update jenis_bibit & koordinat_gps |
| Frontend Tabel | ✅ | `ManagemenKebun.tsx` — tabel daftar lahan |
| Frontend Detail | ✅ | `lahan/[id]/page.tsx` — detail spesifikasi aset |
| Frontend Edit | ✅ | `EditLahanDialog.tsx` — dialog edit jenis bibit & GPS |

> [!WARNING]
> **Gap minor:**
> - `getAllLands` response tidak include field `jenis_bibit` dan `koordinat_gps` di flatten mapping (line 55-72)
> - PUT endpoint hanya mengupdate `jenis_bibit` dan `koordinat_gps`, tidak bisa edit field lain (luas_ha, lokasi_kebun, dll)
> - Tidak ada fitur **Create** lahan baru dan **Delete** lahan

---

### ✅ FR-02: Pencatatan Produksi (Panen)

**Requirement:** Sistem harus memungkinkan input data panen harian per blok (Jumlah Janjang, Estimasi Berat/Kg)

**Status: SELESAI**

| Komponen | Status | Detail |
|----------|--------|--------|
| Schema (Prisma) | ✅ | Model `Harvest` dengan `jumlah_janjang`, `estimasi_berat_kg`, `tanggal_panen` |
| Backend API GET | ✅ | `GET /api/harvests/land/:landId` — riwayat panen per lahan |
| Backend API POST | ✅ | `POST /api/harvests` — tambah data panen |
| Frontend Form | ✅ | `HarvestTab.tsx` — form input panen harian |
| Frontend Tabel | ✅ | `HarvestTab.tsx` — tabel riwayat panen |

> [!NOTE]
> **Gap minor:**
> - Tidak ada fitur DELETE/UPDATE untuk data panen (hanya ada di Cost)
> - Tidak ada validasi duplikasi tanggal panen untuk lahan yang sama

---

### ✅ FR-03: Pencatatan Biaya (Cost Tracking)

**Requirement:** Sistem harus dapat mengalokasikan biaya (Pupuk, Upah, Transport) ke masing-masing blok

**Status: SELESAI — Implementasi terbaik dari semua FR**

| Komponen | Status | Detail |
|----------|--------|--------|
| Schema (Prisma) | ✅ | Model `Cost` dengan `jenis_biaya`, `jumlah_biaya`, `keterangan`, `tanggal` |
| Backend API GET | ✅ | `GET /api/costs/land/:landId` |
| Backend API POST | ✅ | `POST /api/costs` |
| Backend API DELETE | ✅ | `DELETE /api/costs/:id` |
| Frontend Form | ✅ | `CostTab.tsx` — form input biaya (select jenis: Pupuk/Upah/Transport/Maintenance/Lainnya) |
| Frontend Tabel | ✅ | `CostTab.tsx` — tabel riwayat biaya dengan badge berwarna + format Rupiah |

> [!TIP]
> FR-03 adalah implementasi paling lengkap: CRUD (Create, Read, Delete) sudah berfungsi baik di backend maupun frontend.

---

### ⚠️ FR-04: Kalkulasi Produktivitas

**Requirement:** Sistem secara otomatis menghitung Yield per Hektar (Ton/Ha) berdasarkan histori data panen

**Status: PARSIAL — Logika kalkulasi belum lengkap**

| Komponen | Status | Detail |
|----------|--------|--------|
| Stats Endpoint | ⚠️ | `GET /api/lands/:id/stats` — menghitung `real_tonase_current_month` dari **WorkLog** (bukan Harvest!) |
| Yield/Ha UI | ⚠️ | `LahanDetailPage` menampilkan `yieldEstimation` tapi nilainya dari **MOCK_DATA** (hardcoded 11.6) |
| Chart Data | ⚠️ | Chart data diambil dari WorkLog, bukan dari Harvest |
| Cost per Kg | ❌ | Belum ada kalkulasi Cost per Kg TBS |

> [!CAUTION]
> **Masalah kritis pada FR-04:**
> 1. **Data source salah** — Stats endpoint menggunakan tabel `WorkLog` untuk tonase, padahal data panen dicatat di tabel `Harvest`. Kedua tabel ini tidak sinkron.
> 2. **Yield per Ha tidak dihitung** — Nilai `yieldEstimation` di frontend masih hardcoded dari mock data (11.6 Ton/Ha), bukan kalkulasi `TotalTonase / LuasHa`.
> 3. **Cost per Kg TBS belum ada** — Requirement menyebutkan sistem harus menghitung Cost per Kg, tapi belum ada endpoint yang menggabungkan data Cost dengan data Harvest.
> 4. **Tidak ada kalkulasi otomatis** — Belum ada endpoint yang menjalankan formula `Yield = TotalBerat / LuasHa` secara dinamis.

---

## 4. Peta File Proyek

```
palm-management-system/
├── palm-management-backend/
│   ├── prisma/schema.prisma          # 6 model: User, Land, WorkLog, Session, Harvest, Cost
│   └── src/
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── lands.controller.ts    # getAllLands, getLandsByNik, getLandStats, updateLand
│       │   ├── users.controller.ts
│       │   ├── work-logs.controller.ts
│       │   ├── harvests.controller.ts # getHarvestsByLand, createHarvest
│       │   └── costs.controller.ts    # getCostsByLand, createCost, deleteCost
│       ├── routes/                    # 6 route files (1:1 dengan controllers)
│       └── server.ts                  # Express app entry point (port 5000)
│
├── palm-management-system/            # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx                   # Dashboard utama
│   │   ├── farm-management/
│   │   │   ├── page.tsx               # Tabel daftar lahan
│   │   │   └── lahan/[id]/page.tsx    # Detail lahan (650 baris, tabs: Overview/Panen/Biaya)
│   │   ├── mill-operations/page.tsx   # Placeholder saja
│   │   └── price-calculator/page.tsx  # UI statis
│   └── components/
│       ├── management/                # ManagemenKebun, HarvestTab, CostTab, EditLahanDialog
│       ├── dashboard/RefinedStats.jsx # Dashboard KPI cards + chart (data mock)
│       └── simulation/PriceCalculator.jsx # Kalkulator harga TBS (statis)
```

---

## 5. Urutan Prioritas Implementasi Selanjutnya

| Prioritas | ID | Fitur | Kompleksitas | Dependensi |
|-----------|----|-------|-------------|------------|
| 🔴 P0 | FR-04 | Fix Kalkulasi Produktivitas | Medium | FR-02 (Harvest data) |
| 🟡 P1 | FR-05 | Log Jembatan Timbang | High | Schema baru + CRUD |
| 🟡 P1 | FR-08/09 | Parameter & Kalkulator Harga | Medium | Backend formula logic |
| 🟠 P2 | FR-06 | Monitoring Rendemen (OER/KER) | High | FR-05 (TBS In data) |
| 🟠 P2 | FR-10 | Analisis Sensitivitas | Medium | FR-08/09 |
| 🔵 P3 | FR-07 | Tracking Losses | Medium | FR-06 |

> Guideline detail untuk masing-masing fitur tersedia di file terpisah dalam folder ini.
