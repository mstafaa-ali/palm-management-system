# Walkthrough: FR-05 Log Jembatan Timbang

Fitur ini telah diimplementasikan sepenuhnya untuk mencatat arus masuk dan keluar TBS (Tandan Buah Segar) di Pabrik Kelapa Sawit (PKS) menggunakan sistem jembatan timbang digital.

## 1. Database & Schema
Telah ditambahkan model `WeighbridgeLog` pada `prisma/schema.prisma` untuk menyimpan data timbangan secara presisi dengan tipe data `Decimal`.

**Perubahan Utama:**
- Penambahan model `WeighbridgeLog` dengan field: `berat_bruto_kg`, `berat_tara_kg`, `berat_netto_kg`.
- Penambahan relasi ke tabel `Land` (untuk sumber Internal).
- Penambahan field `sumber` ("Internal" | "Eksternal") dan `status` ("masuk" | "selesai").

## 2. Backend API Implementation
API telah dibangun menggunakan Express.js dengan controller yang menangani logika bisnis timbangan.

**Endpoints:**
- `POST /api/weighbridge`: Mencatat truk masuk (Input plat nomor, supir, sumber, dan berat Bruto).
- `PATCH /api/weighbridge/:id/tara`: Mencatat truk keluar (Input berat Tara, otomatis menghitung Netto, dan mengubah status ke "selesai").
- `GET /api/weighbridge`: Mengambil list data timbangan dengan filter tanggal, sumber, dan status.
- `GET /api/weighbridge/summary`: Mengambil ringkasan harian (Total truk, total tonase netto, breakdown internal/eksternal).

**Logic Highlights:**
- Validasi mandatory field berdasarkan sumber (Internal wajib `land_id`, Eksternal wajib `nama_pemasok`).
- Proteksi agar berat Tara tidak boleh lebih besar dari Bruto.
- Otomatisasi perhitungan `Netto = Bruto - Tara` saat truk keluar.

## 3. Frontend Implementation
UI dibangun menggunakan Next.js (App Router) dengan desain yang intuitif untuk operator jembatan timbang.

**Halaman Utama:** `/mill-operations`
Halaman ini bertindak sebagai _dashboard_ operasional PKS yang terdiri dari:
- **KPI Summary Cards**: Menampilkan statistik real-time hari ini (Total truk, total tonase, perbandingan sumber).
- **Tabs Interface**:
  - **Antrean Aktif**: Daftar truk yang sudah timbang masuk tapi belum timbang keluar. Tersedia tombol cepat "Input Tara".
  - **Riwayat Hari Ini**: Daftar transaksi yang sudah selesai lengkap dengan rincian Bruto, Tara, dan Netto.
- **Entry Dialog**: Form popup untuk mencatat truk masuk dengan validasi input yang ketat.

**Komponen Utama:**
- `WeighbridgeTable.tsx`: Tabel dinamis dengan filter tanggal dan sumber.
- `WeighbridgeSummary.tsx`: Menampilkan metrik performa harian.
- `WeighbridgeEntryDialog.tsx` & `TaraInputDialog.tsx`: Modal interaktif untuk input data.

## 4. Cara Verifikasi
1. Buka halaman `/mill-operations`.
2. Klik tombol **"+ Catat Truk Masuk"**. Isi data (contoh: Plat BA 1234 XY, Bruto 12000 kg).
3. Pastikan truk muncul di tab **"Antrean Aktif"**.
4. Klik tombol **"Input Tara"** pada baris truk tersebut. Masukkan berat kosong (contoh: 4000 kg).
5. Sistem akan otomatis menghitung Netto (8000 kg) dan memindahkan data ke tab **"Riwayat Hari Ini"**.
6. Periksa kartu **"Total Netto"** di bagian atas, nilainya akan bertambah secara otomatis.

---
**Status:** ✅ Selesai
**File Terkait:**
- `backend/src/controllers/weighbridge.controller.ts`
- `backend/src/routes/weighbridge.routes.ts`
- `frontend/app/mill-operations/page.tsx`
- `frontend/components/mill/` (Seluruh komponen pendukung)
