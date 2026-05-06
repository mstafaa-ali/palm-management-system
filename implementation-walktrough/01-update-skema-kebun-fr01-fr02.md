# Penjelasan Implementasi FR-01 & FR-02 (Update Skema Kebun)

Berikut adalah penjelasan detail mengenai perubahan dan penambahan fitur yang telah dilakukan sesuai dengan dokumen `01-update-skema-kebun-fr01-fr02.md`. Penjelasan ini dapat Anda gunakan sebagai bahan validasi dan pembelajaran.

## 1. Perubahan Database (Prisma Schema)

> [!NOTE]
> Database schema mendefinisikan struktur data kita. Perubahan di sini adalah pondasi untuk fitur yang akan dibangun di Backend dan Frontend.

- **Tabel `Land` (`lands`)**: 
  - Kolom `jenis_bibit` (`String?`) sudah ada sebelumnya.
  - Kolom `lokasi_gps` diganti namanya menjadi `koordinat_gps` (`String?`) agar sesuai dengan dokumen *requirement* (FR-01/02). Hal ini dilakukan menggunakan fitur Prisma `@db.Text` untuk menampung teks latitude dan longitude.
- **Tabel `WorkLog` (`work_logs`)**:
  - Menambahkan kolom baru `jumlah_janjang` bertipe `Int?` (Integer Opsional). Ini digunakan untuk mencatat jumlah panen janjang saat log kerja harian diinput. 
  - *(Catatan: Pada tabel `harvests`, kolom `jumlah_janjang` memang sudah tersedia dan digunakan di form Panen Harian. Penambahan di `work_logs` berguna jika sistem juga merekam janjang per individu pekerja).*

**Langkah teknis**: File `schema.prisma` diupdate dan perintah `npx prisma db push` dijalankan agar struktur tabel di database PostgreSQL langsung tersinkronisasi.

## 2. Pembaruan Backend (API & Controller)

> [!TIP]
> Backend bertugas menerima data dari *client* (Frontend), melakukan validasi dasar, dan menyimpannya ke *database* via Prisma.

- **`lands.controller.ts` & `lands.routes.ts`**:
  - **Fitur Baru (Update Lahan)**: Karena sebelumnya tidak ada fungsi untuk meng-*update* spesifikasi lahan, saya menambahkan fungsi `updateLand` dengan method HTTP `PUT /api/lands/:id`.
  - Fungsi ini menerima `jenis_bibit` dan `koordinat_gps` melalui `req.body`, mencari lahan berdasarkan ID (atau NIK pemilik), dan memanggil fungsi `prisma.land.update()` untuk menyimpan perubahan.
- **`work-logs.controller.ts`**:
  - Pada fungsi `createWorkLog` (`POST /api/work-logs`), endpoint kini siap menerima parameter `jumlah_janjang` dan akan langsung menyimpannya ketika log kerja baru dibuat. 

## 3. Pembaruan Frontend (UI & Integrasi)

> [!IMPORTANT]
> Di bagian *frontend*, tujuan utamanya adalah menampilkan data spesifikasi lahan baru dan memberikan antarmuka (form) agar pengguna bisa mengeditnya.

- **Komponen Baru: `EditLahanDialog` (`components/management/EditLahanDialog.tsx`)**:
  - Saya membuat satu komponen form *pop-up* (menggunakan `Dialog` dari Shadcn UI) yang berisi input untuk **Jenis Bibit** (menggunakan *Dropdown/Select*) dan **Koordinat GPS** (menggunakan *Input Text* standar).
  - Ketika formulir di-*submit*, React akan mengirimkan *request* `PUT` ke endpoint backend yang baru saja dibuat (`/api/lands/:id`). Setelah sukses, status akan ditutup dan data UI akan diperbarui secara otomatis menggunakan *callback* `onSuccess`.
- **Integrasi di Halaman Lahan Detail (`app/farm-management/lahan/[id]/page.tsx`)**:
  - **Menampilkan Data**: Menambahkan ikon dan blok khusus untuk merender nilai *Jenis Bibit* dan *Koordinat GPS* di bawah spesifikasi *Sertifikasi Kebun* dan *Mitra PKS*.
  - **Memasang Tombol Edit**: Meletakkan tombol `EditLahanDialog` tepat di sebelah judul "Spesifikasi Aset" agar *user experience*-nya natural (user bisa melihat spesifikasi aset dan langsung mengklik edit di area yang sama).
- **Form Panen Harian (`HarvestTab.tsx`)**:
  - Validasi sistem menunjukkan bahwa Form *Input Panen Harian* yang terintegrasi di sistem (melalui `HarvestTab.tsx` dan `harvests.controller.ts`) ternyata **sudah memiliki input "Jumlah Janjang"**. Oleh karena itu, form ini tidak memerlukan modifikasi lebih lanjut untuk FR-02.

## Validasi Kesuksesan (Verification Plan)
Untuk memastikan semuanya berjalan, Anda dapat melakukan hal berikut saat aplikasi dijalankan:
1. Masuk ke menu **Farm Management**.
2. Klik **Detail** pada salah satu lahan petani yang ada di daftar.
3. Di *tab* Overview, pada kotak "Spesifikasi Aset", cek apakah label **Jenis Bibit** dan **Koordinat GPS** sudah muncul.
4. Klik tombol **Edit Spesifikasi** di sudut atas kotak tersebut.
5. Cobalah mengubah nilai **Jenis Bibit** menjadi "Marihat" atau "Topaz", dan isi **Koordinat GPS**. Lalu, klik **Simpan Perubahan**.
6. Nilai baru harusnya akan langsung muncul di halaman tanpa perlu me-*refresh*.

Semoga penjelasan ini mempermudah proses evaluasi dan pembelajaran Anda. Jika Anda ingin memeriksa *source code*-nya, Anda bisa merujuk ke file-file yang dimodifikasi melalui git *diff*.
