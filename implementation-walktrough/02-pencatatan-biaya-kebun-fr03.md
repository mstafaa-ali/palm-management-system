# Walkthrough Implementasi FR-03: Pencatatan Biaya Kebun

Dokumen ini menjelaskan perubahan dan penambahan fitur yang dilakukan berdasarkan `implementation-plan/02-pencatatan-biaya-kebun-fr03.md` untuk mengimplementasikan pencatatan biaya operasional kebun.

## 1. Perubahan Database (Prisma Schema)
Berdasarkan pengecekan terhadap schema yang ada (`schema.prisma`), model `Cost` ternyata **sudah terdefinisi** sebelumnya dan sesuai dengan kebutuhan operasional:

```prisma
model Cost {
  id            String   @id @default(uuid()) @db.Uuid
  land_id       String   @db.Uuid
  tanggal       DateTime @db.Date
  jenis_biaya   String   @db.VarChar(100) // "Pupuk", "Upah", "Transport", dsb.
  jumlah_biaya  Decimal  @db.Decimal(15, 2)
  keterangan    String?  @db.Text
  created_at    DateTime @default(now())

  land Land @relation(fields: [land_id], references: [id], onDelete: Cascade)

  @@map("costs")
}
```
**Insight Validasi:**
Karena skema tabel `costs` sudah ada, kita tidak perlu menjalankan `npx prisma db push` atau membuat migrasi baru. Ini mencegah risiko data *loss* atau *breaking changes* pada tabel yang mungkin sudah menyimpan data.

## 2. Pembaruan Backend (API & Controller)
API `POST` dan `GET` untuk biaya ternyata sudah tersedia pada file `costs.controller.ts` dan `costs.routes.ts`. Untuk memenuhi keseluruhan FR-03 (di mana disebutkan perlunya fitur hapus jika terjadi kesalahan), kita menambahkan fungsionalitas `DELETE`.

**Perubahan yang Dilakukan:**
1. **`src/controllers/costs.controller.ts`**: Menambahkan fungsi `deleteCost`. Fungsi ini memverifikasi ketersediaan data berdasarkan `id` dan kemudian menghapusnya dari database.
2. **`src/routes/costs.routes.ts`**: Mendaftarkan endpoint baru `router.delete("/:id", deleteCost);`.

Endpoint lengkap pada `/api/costs` kini mendukung:
- `POST /api/costs` -> Membuat data biaya baru.
- `GET /api/costs/land/:landId` -> Mengambil data riwayat biaya berdasarkan ID lahan.
- `DELETE /api/costs/:id` -> Menghapus data riwayat biaya berdasarkan ID transaksi biaya.

## 3. Pembaruan Frontend (UI & Integrasi)
Sama halnya dengan backend, dasar dari komponen frontend `CostTab.tsx` sudah dibuat sebelumnya dan terhubung di halaman Detail Lahan (`app/farm-management/lahan/[id]/page.tsx`). Kami menyempurnakannya agar sinkron 100% dengan dokumen rencana kerja (FR-03).

**Perubahan yang Dilakukan:**
1. **Menambahkan Kategori "Maintenance"**: Pada form pencatatan biaya, kami menambahkan opsi "Maintenance" ke dalam dropdown `jenis_biaya` sesuai dengan rancangan.
2. **Implementasi Fungsi Hapus (Delete)**: Menambahkan tombol dengan *icon* *trash* (`lucide-react`) pada setiap baris data di tabel "Riwayat Biaya". Tombol ini memanggil `handleDelete` yang terintegrasi dengan endpoint `DELETE /api/costs/:id` di backend. Setelah proses *delete* berhasil, tabel akan memuat ulang (*refetch*) data secara otomatis.

## 4. Validasi Pekerjaan
- [x] **Model Database**: Menggunakan model `Cost` yang ada yang relevan untuk merekam *pengeluaran per lahan*.
- [x] **Backend API**: Endpoints `GET`, `POST`, dan `DELETE` siap dan berfungsi.
- [x] **Frontend Terpasang**: Form input (Tanggal, Jenis Biaya, Nominal, Keterangan) dan Tabel Data riwayat sukses disempurnakan dengan dukungan "Hapus Data". Tab ini sudah muncul sempurna sebagai salah satu menu "Biaya Operasional" di halaman Profil/Detail Lahan.

Dengan demikian, seluruh kebutuhan dari FR-03 telah diselesaikan dengan memodifikasi modul yang sebelumnya masih berupa *draft/half-implemented* menjadi fitur utuh (CRUD) yang bisa beroperasi secara *end-to-end*.
