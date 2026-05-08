# FR-06: Monitoring Rendemen (OER/KER) — Implementation Walkthrough

Fitur **Monitoring Rendemen** (Oil Extraction Rate & Kernel Extraction Rate) telah berhasil diimplementasikan sesuai dengan rancangan. Berikut adalah ringkasan perubahan yang telah dilakukan.

## 1. Database Schema (`prisma/schema.prisma`)
Menambahkan model `MillProduction` untuk menyimpan data hasil olahan harian PKS:
- `tanggal_produksi` (Date)
- `tbs_olah_kg` (Input total TBS yang diolah)
- `cpo_dihasilkan_kg` (Output CPO)
- `pk_dihasilkan_kg` (Output Palm Kernel)
- `oer_persen` & `ker_persen` (Disimpan secara otomatis saat input)

> [!NOTE]
> Pembaruan database telah disinkronisasi menggunakan `npx prisma db push` sehingga skema siap digunakan.

## 2. Backend API (`backend/src/controllers/mill-production.controller.ts`)
Telah diimplementasikan endpoint REST API berikut:
- **`GET /api/mill-production`**: Mengambil riwayat produksi harian, diurutkan dari yang terbaru.
- **`POST /api/mill-production`**: Mencatat produksi harian. Backend secara otomatis akan menghitung OER% dan KER% berdasarkan total TBS olah dan CPO/PK yang dihasilkan.
- **`PUT /api/mill-production/:id`**: Memperbarui catatan produksi (dengan kalkulasi ulang rendemen).
- **`DELETE /api/mill-production/:id`**: Menghapus catatan produksi.
- **`GET /api/mill-production/summary`**: Mengambil agregat dan rata-rata OER/KER dalam bulan berjalan.

Semua route telah diintegrasikan pada `backend/src/server.ts` di bawah *base URL* `/api/mill-production`.

## 3. Frontend / UI (`frontend/app/mill-operations/page.tsx`)
Halaman "Operasional PKS" sekarang memiliki **Tabs** yang rapi menggunakan komponen Shadcn UI:
1. **Jembatan Timbang**: Menampilkan log timbangan (fitur sebelumnya).
2. **Produksi & Rendemen**: Tab baru yang berisikan:
   - **Tombol "Catat Produksi Hari Ini"**: Membuka dialog form untuk memasukkan data olah harian (`ProductionFormDialog.tsx`). *Note: dependency `textarea` dan `sonner` telah di-install menggunakan shadcn.*
   - **4 KPI Cards**: Menampilkan Total TBS Olah, Total CPO, Rata-rata OER, dan Rata-rata KER. Indikator target akan otomatis berubah warna jika berada di bawah target standar industri (22% untuk OER dan 5% untuk KER).
   - **Line Chart**: Grafik interaktif `Recharts` yang menampilkan tren OER (hijau) dan KER (biru) beserta garis putus-putus (*dashed line*) kuning untuk batas target harian.
   - **Tabel Produksi Harian**: Tabel interaktif dengan *badging* otomatis pada nilai OER dan KER.

## 4. Pembaruan Dashboard Utama (`RefinedStats.jsx`)
KPI "Rata-rata OER" pada halaman utama (Dashboard) kini sudah **tidak di-hardcode** dan mengambil data sesungguhnya dari API `/api/mill-production/summary` menggunakan efek `useEffect`. Nilai rata-rata dan warna indikator target otomatis berubah sesuai kalkulasi database.

## 5. Verifikasi dan Flow Test
- **Input Data**: Saat pengguna mengisi Form Produksi Harian (misalnya: `TBS Olah = 22000`, `CPO = 5000`), sistem secara otomatis menyimpan `OER` sebagai `22.73%` dan memperbarui seluruh ringkasan KPI dan grafik *Real-time*.
- **Data Rendering**: Setelah *submit*, form tertutup dan *toast notification* sukses akan muncul, sekaligus menyegarkan tabel riwayat produksi di bawahnya secara instan.
