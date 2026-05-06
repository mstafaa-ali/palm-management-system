# Walkthrough — FR-04: Kalkulasi Produktivitas (Yield per Hektar)

Dokumen ini merangkum perubahan yang dilakukan untuk mengimplementasikan fitur kalkulasi produktivitas otomatis dan biaya operasional per kg TBS.

## Perubahan yang Dilakukan

### 1. Backend (Manajemen Lahan)
Refaktor besar dilakukan pada endpoint statistik lahan untuk memastikan data yang ditampilkan akurat dan berasal dari sumber yang benar.

- **File:** [lands.controller.ts](file:///Users/adila/Documents/ali/Project/palm-management-system/backend/src/controllers/lands.controller.ts)
- **Perubahan:**
    - Mengubah sumber data agregasi tonase dari tabel `WorkLog` ke tabel **`Harvest`** (sumber resmi panen).
    - Menambahkan logika kalkulasi **Yield per Ha** (Total Tonase / Luas Lahan).
    - Menambahkan logika kalkulasi **Cost per Kg TBS** (Total Biaya / Total Berat Kg).
    - Menambahkan dukungan filter periode via query parameter `bulan` dan `tahun`.
    - Menambahkan helper `resolveLandId` untuk menangani input ID berupa UUID maupun owner_nik.

### 2. Database Synchronization
- **Tindakan:** Menjalankan `npx prisma db push` di folder `backend`.
- **Tujuan:** Menyinkronkan skema database PostgreSQL dengan `schema.prisma` agar kolom baru (`jenis_bibit`, `koordinat_gps`) dan tabel baru (`harvests`, `costs`) tersedia di database.
- **Catatan:** Perintah ini juga secara otomatis menjalankan `npx prisma generate`.

### 3. Frontend (Dashboard Detail Lahan)
Pembaruan UI dilakukan untuk menampilkan metrik produktivitas baru yang lebih relevan bagi pengelola kebun.

- **File:** [page.tsx](file:///Users/adila/Documents/ali/Project/palm-management-system/frontend/app/farm-management/lahan/%5Bid%5D/page.tsx)
- **Perubahan:**
    - Memperbarui `fetchStats` untuk memetakan response API baru ke state komponen.
    - Mengganti stat card **"Efisiensi Kerja"** dengan card **"Cost / Kg TBS"**.
    - Mengupdate `MOCK_DATA` agar konsisten dengan struktur data baru selama loading.
    - Memastikan grafik (Line Chart) menampilkan data harian yang bersumber dari data panen riil.

---

## Verifikasi dan Pengujian

### Otomatis (TypeScript)
- Menjalankan `npx tsc --noEmit` di folder backend.
- **Hasil:** Berhasil tanpa error (`Found 0 errors`). Seluruh tipe data antara Prisma Client, Controller, dan Response sudah sinkron.

### Manual / Logika
- **Kalkulasi Yield:** Memastikan pembagian total berat (Ton) dengan luas (Ha) menghasilkan angka yang masuk akal.
- **Kalkulasi Cost:** Memastikan total biaya dibagi total berat panen menghasilkan Rp/Kg yang akurat.
- **Data Source:** Verifikasi bahwa `chart_data` kini mengambil dari `estimasi_berat_kg` di tabel `Harvest`.

---

## Pratinjau Perubahan UI

> [!NOTE]
> Perubahan UI mencakup penambahan metrik biaya di baris statistik utama (Top Stats) dan sinkronisasi data riil pada grafik tren produksi.

```tsx
// Cuplikan Card Baru
<Card>
  <p className="text-sm font-medium text-slate-500">Cost / Kg TBS</p>
  <h3 className="text-3xl font-bold text-palm-dark mt-2">
    Rp {data.stats.costPerKg?.toLocaleString("id-ID") || "0"}
    <span className="text-lg text-slate-500 font-medium">/Kg</span>
  </h3>
</Card>
```
