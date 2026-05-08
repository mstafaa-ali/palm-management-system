# Walkthrough FR-07: Tracking Losses

> **Status:** ✅ Selesai Diimplementasi
> **Fitur:** Pencatatan kehilangan minyak (oil losses) di berbagai tahap pengolahan untuk audit efisiensi.
> **Tanggal Implementasi:** 2026-05-07

---

## 1. Perubahan Database (Prisma)

Model `MillLoss` telah ditambahkan untuk menyimpan data kehilangan minyak per titik proses.

```prisma
model MillLoss {
  id                  String          @id @default(uuid()) @db.Uuid
  production_id       String?         @db.Uuid
  tanggal             DateTime        @db.Date
  tahap_proses        String          @db.VarChar(50)
  jenis_losses        String          @db.VarChar(100)
  losses_kg           Decimal         @db.Decimal(10, 2)
  kadar_minyak_persen Decimal?        @db.Decimal(5, 2)
  oil_losses_kg       Decimal?        @db.Decimal(10, 2)
  catatan             String?         @db.Text
  created_at          DateTime        @default(now())
  production          MillProduction? @relation(fields: [production_id], references: [id])

  @@map("mill_losses")
}
```

---

## 2. Implementasi Backend

### Controller & Routes
- **`mill-losses.controller.ts`**: Menangani operasi CRUD dan agregasi summary.
- **`mill-losses.routes.ts`**: Mendaftarkan endpoint API.
- **`server.ts`**: Menghubungkan route ke `/api/mill-losses`.

### Logika Bisnis Utama
- **Auto-hitung Oil Losses:** Di backend, `oil_losses_kg` dihitung otomatis jika `kadar_minyak_persen` diberikan:
  `oil_losses_kg = (losses_kg * kadar_minyak_persen) / 100`.
- **Agregasi Summary:** Endpoint `/api/mill-losses/summary` melakukan pengelompokan (groupBy) berdasarkan `tahap_proses` dan menghitung **Losses Rate** terhadap total TBS Olah dari modul FR-06.

---

## 3. Implementasi Frontend (UI/UX)

### Komponen Baru
1.  **`LossesDashboard.tsx`**: Menampilkan 3 kartu KPI utama dan grafik batang horizontal breakdown losses per tahap.
2.  **`LossesTable.tsx`**: Tabel riwayat pencatatan dengan indikator warna per tahap.
3.  **`LossesFormDialog.tsx`**: Form input dengan fitur:
    *   Dropdown dinamis (pilih tahap -> auto-select jenis losses).
    *   Preview real-time estimasi kehilangan sebelum disimpan.

### Integrasi Halaman
Menambahkan tab **"Tracking Losses"** sebagai tab ketiga di halaman `/mill-operations`.

---

## 4. Cara Melakukan Verifikasi

Untuk memastikan fitur berjalan dengan benar, ikuti langkah-langkah berikut:

### A. Verifikasi UI & Input
1.  Buka browser ke `http://localhost:3000/mill-operations`.
2.  Klik tab **"Tracking Losses"**.
3.  Pastikan KPI Cards (Total Oil Losses, Losses Rate) muncul (awalnya 0 jika data kosong).
4.  Klik tombol merah **"Catat Losses"**.
5.  Isi form:
    *   Pilih Tahap: **Press**.
    *   Pastikan Jenis Losses otomatis terisi: **Fibre**.
    *   Input Berat: **100** kg.
    *   Input Kadar Minyak: **2.5** %.
    *   **Cek:** Pastikan muncul teks "Estimasi Oil Losses: 2.50 kg" di bawah input.
6.  Klik **"Simpan Losses"**.

### B. Verifikasi Data & Summary
1.  Pastikan data yang baru diinput muncul di tabel **"Riwayat Losses Harian"** di bagian bawah.
2.  Cek KPI **"Total Oil Losses"** di atas, pastikan nilainya bertambah.
3.  Cek grafik batang, pastikan bar untuk **"Press"** muncul dengan nilai 2.5 kg.
4.  Coba ubah filter **Periode** (Bulan/Tahun) di dashboard untuk melihat data di periode lain.

### C. Verifikasi Integrasi (Losses Rate)
1.  Buka tab **"Produksi & Rendemen"** dan pastikan ada data produksi di bulan yang sama.
2.  Kembali ke tab **"Tracking Losses"**.
3.  Pastikan KPI **"Losses Rate"** tidak lagi 0% (dihitung dari Total Oil Losses / Total TBS Olah).
