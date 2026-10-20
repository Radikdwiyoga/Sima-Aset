# SIMA - Sistem Informasi Manajemen Aset Terpadu Enterprise

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase_Hosting-Spark_Plan_100%25_Free-orange?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Sistem Informasi Manajemen Aset (SIMA) Terpadu adalah aplikasi tata kelola inventaris korporat modern berbasis Web untuk memantau, mendata, melacak, dan mengaudit seluruh aset fisik dan non-fisik perusahaan secara terintegrasi lintas divisi.

---

## 🌐 Akses Live Web Application

Aplikasi telah berhasil dideploy dan dapat langsung diakses secara online:
> 🔗 **Production URL:** [https://sima-aset.web.app](https://sima-aset.web.app)

---

## 🔐 Akun Pengujian & Demo 1-Click Login

Sistem dilengkapi proteksi rute wajib login. Pada halaman login ([`/login`](https://sima-aset.web.app/login)), telah disediakan kartu **Uji Coba Demo 1-Click Login** untuk masing-masing peran tanpa perlu mengetik kata sandi:

| Peran (Role) | Email / Username | Password | Deskripsi Hak Akses |
| :--- | :--- | :--- | :--- |
| **👑 Super Admin** | `admin@sima.com` / `admin` | `admin123` | Akses penuh 100% ke seluruh modul, CRUD aset, import Excel, stok opname, dan manajemen user. |
| **🛠️ Admin Aset** | `andi@company.com` / `andi` | `admin123` | Operasional aset: Tambah/edit data, cetak label QR, proses peminjaman, dan servis. |
| **👤 Staff / Pemohon** | `budi@company.com` / `budi` | `admin123` | Hak akses terbatas: Hanya melihat katalog aset dan mengajukan peminjaman (tombol tambah/edit aset dinonaktifkan otomatis). |
| **📋 Auditor / Manajemen** | `rina@company.com` / `rina` | `admin123` | Pengawasan: Pelaksanaan stock opname fisik, verifikasi kondisi aset, dan ekspor laporan analitik. |

---

## 🚀 Fitur Utama yang Telah Berjalan

### 1. 📊 Dashboard Analitik Real-Time
- **Metrik KPI Utama:** Total Aset, Aset Aktif, Aset Tidak Aktif, dan Aset dalam Perbaikan (Servis) yang otomatis dihitung dari database.
- **Grafik Distribusi Kategori (Donut Chart):** Visualisasi dinamis komposisi aset berdasarkan kategori riil di sistem lengkap dengan persentase dan total unit di tengah grafik.
- **Grafik Sebaran per Lokasi (Bar Chart):** Pemetaan fisik aset di kantor pusat, cabang, maupun gudang secara otomatis.
- **Shortcut Scan QR:** Tombol cepat di navbar dashboard untuk memeriksa aset dan PIC pemegang barang.

### 2. 📦 Manajemen Master Data Aset (CRUD Terpadu)
- Katalog aset komprehensif dengan filter status (*Semua, Aktif, Tidak Aktif, Dalam Perbaikan*), kategori, lokasi, serta pencarian instan.
- Modal detail aset lengkap: Tag ID, Nomor Seri, Merk, Tipe, Lokasi Fisik, Nilai Perolehan, Riwayat Pemakai (PIC), Foto Aset, serta **Upload & Unduh Dokumen Kelengkapan (Faktur, Kartu Garansi, Buku Manual, BAST)**.
- Pembatasan tombol CRUD secara otomatis berdasarkan peran user yang sedang login (RBAC).

### 3. 📥 Fitur Import / Migrasi Data Massal dari Excel (.xlsx)
- **Download Template Standar:** Tombol *Unduh Template Excel (.xlsx)* yang otomatis menghasilkan format kolom resmi beserta contoh data.
- **Drag & Drop Upload:** Mendukung file format resmi Microsoft Excel `.xlsx` (dan `.xls`).
- **Auto-Mapping Header Fleksibel:** Mendeteksi nama kolom bahasa Indonesia maupun properti teknis (Nama Aset, Kode Aset, Kategori, Lokasi, Kondisi, Nilai Aset, PIC, Serial Number).
- **Live Data Preview:** Tinjauan baris data dan validasi sebelum disimpan ke sistem.

### 4. 📤 Ekspor Laporan Data Multiformat
- **Download Excel (.xlsx):** Mengunduh seluruh atau sebagian data aset terfilter langsung ke dalam format binary Microsoft Excel (`.xlsx`) siap pakai dengan styling kolom yang rapi.
- **Cetak / Unduh PDF Resmi:** Menghasilkan dokumen cetak laporan resmi berstandar korporat yang rapi dan siap diprint atau disimpan sebagai PDF.

### 5. 📱 Pemindai Barcode / QR Code Interaktif
- Terintegrasi kamera perangkat langsung dari browser.
- **Fitur Putar Balik Kamera (Switch Camera):** Memungkinkan pergantian antara kamera belakang *(environment)* dan kamera depan *(user)* untuk kemudahan scan di ponsel (Android/iOS) maupun laptop.
- Deteksi instan untuk menampilkan informasi aset, spesifikasi, dan status peminjam.

### 6. 🤝 Modul Peminjaman Barang / Aset
- Pencatatan peminjaman aset dengan nomor peminjaman otomatis (`LOAN/YYYY/MM/xxx`).
- Form input peminjam, divisi, keperluan, tanggal pinjam, dan estimasi tanggal kembali.
- **Fitur Upload Dokumen Bukti:** Pengunggahan surat jalan / formulir serah terima peminjaman fisik.
- Fitur **Cetak Bukti Peminjaman** langsung ke PDF.

### 7. 📋 Stock Opname & Audit Fisik
- Pelaksanaan audit berkala untuk mencocokkan keberadaan fisik aset dengan data sistem.
- Pembaruan status dan kondisi aset langsung dari hasil scan (*Baik, Dalam Perbaikan, Rusak*).
- Riwayat audit tercatat secara transparan.

### 8. 🎨 Desain Antarmuka & Responsivitas (UI/UX)
- Sidebar navigasi desktop dibuat *sticky* dan dilengkapi area scroll mandiri agar tidak terpotong pada layar laptop dengan resolusi terbatas.
- Desain modern bernuansa *Enterprise Slate & Deep Indigo* dengan icon visual dari *Lucide React*.
- Favicon browser disesuaikan dengan logo resmi SIMA.

---

## 🛠️ Arsitektur & Teknologi

| Komponen | Teknologi |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Static HTML Export) |
| **Bahasa Pemrograman** | TypeScript 5.0 |
| **Styling & UI** | Tailwind CSS v4, Lucide React Icons |
| **Data Visualization** | Recharts (PieChart, BarChart, ResponsiveContainer) |
| **File Processing** | SheetJS (`xlsx`) untuk import & export Excel client-side |
| **Camera & QR** | HTML5 Canvas Video Stream, jsQR Engine |
| **Hosting & Cloud** | Firebase Hosting (100% Free Spark Plan) |
| **CI/CD** | GitHub Actions Workflow |

---

## 💻 Panduan Menjalankan di Komputer Lokal

### Prasyarat
- Node.js versi 18 ke atas
- npm atau yarn

### Langkah Instalasi

1. **Clone repositori:**
   ```bash
   git clone https://github.com/Radikdwiyoga/Sima-Aset.git
   cd Sima-Aset
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan development server:**
   ```bash
   npm run dev
   ```

4. **Buka di browser:**
   Akses [http://localhost:3000](http://localhost:3000)

---

## 🚀 Panduan Build & Deploy ke Firebase Hosting

Proyek ini telah dikonfigurasi untuk ekspor statis (`output: 'export'`) sehingga dapat dihosting secara gratis 100% di Firebase Hosting:

```bash
# 1. Build berkas produksi ke folder out/
npm run build

# 2. Deploy ke Firebase Hosting
npx firebase deploy --only hosting --project sima-aset
```

---

## 📄 Lisensi
Hak Cipta &copy; 2026 SIMA - Sistem Informasi Manajemen Aset Terpadu. Dikembangkan untuk efisiensi tata kelola inventaris korporat.
