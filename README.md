# Srikandi File Downloader - Ekstensi Microsoft Edge

Ekstensi ini memungkinkan Anda mengunduh file surat keluar yang berada di dalam iframe pada halaman website Srikandi.

## 📋 Fitur
- Otomatis mendeteksi iframe dengan file S3 di halaman Srikandi
- Menambahkan tombol download pada setiap iframe yang terdeteksi
- Hanya aktif pada halaman detail surat keluar/ tanda tangan naskah
- Interface popup untuk melihat status dan file yang terdeteksi

## 🔧 Instalasi

### 1. Persiapan File
1. Clone / Download Repo ini 
2. Ganti nama folder ke (misal: `srikandi-downloader`)

### 2. Install di Microsoft Edge
1. Buka Microsoft Edge
2. Ketik `edge://extensions/` di address bar
3. Aktifkan "Developer mode" (toggle di kiri bawah)
4. Klik "Load unpacked"
5. Pilih folder tempat Anda menyimpan file ekstensi
6. Ekstensi akan muncul di daftar dan siap digunakan

## 📖 Cara Penggunaan

### Otomatis (Direkomendasikan)
1. Buka halaman Srikandi: Naskah Keluar/ Naskah Masuk
2. Ekstensi akan otomatis mendeteksi iframe dengan file S3
3. Tombol "📥 Unduh File" akan muncul di pojok kanan atas setiap iframe
4. Klik tombol untuk mengunduh file

### Manual via Popup
1. Klik icon ekstensi di toolbar Edge
2. Popup akan menampilkan status ekstensi
3. Jika ada file terdeteksi, akan ditampilkan dalam daftar
4. Klik tombol "📥" di samping setiap file untuk mengunduh
5. Gunakan tombol "🔍 Scan Ulang" jika perlu refresh deteksi

## ⚙️ Spesifikasi Teknis

### URL yang Didukung
- Halaman: Naskah Keluar/ Naskah Masuk
- File: `https://s3.arsip.go.id/srikandi-prod/*`

### Permissions
- `activeTab`: Untuk akses halaman aktif
- `downloads`: Untuk fungsi download file
- `host_permissions`: Akses ke domain Srikandi dan S3

### Kompatibilitas
- Microsoft Edge (Chromium) versi 88+
- Manifest V3 compliant

## 🔍 Troubleshooting

### Error "Invalid filename"
Jika muncul error ini di console:
1. Buka Developer Tools (F12) → Console
2. Periksa log untuk melihat nama file yang diproses
3. Error ini biasanya disebabkan karakter khusus dalam nama file
4. Versi terbaru sudah menangani masalah ini dengan:
   - URL decoding otomatis
   - Pembersihan karakter invalid
   - Pemotongan nama file yang terlalu panjang

### URL dengan Parameter AWS S3
Contoh URL yang didukung:
```
https://s3.arsip.go.id/srikandi-prod/....
```

Ekstensi akan otomatis:
- Mengekstrak nama file: 
- Membersihkan karakter: 
- Menambah prefix: `Srikandi_`

### Ekstensi Tidak Aktif
- Pastikan Anda berada di halaman yang benar
- Cek apakah anda sudah berada pada detail Halaman Naskah Keluar/ Naskah Masuk
- Refresh halaman dan coba lagi

### Tombol Download Tidak Muncul
- Pastikan iframe berisi file dari S3 Arsip
- Coba klik "Scan Ulang" di popup ekstensi
- Periksa console browser untuk error (F12)

### Download Gagal
- Periksa koneksi internet
- Cek log error

## 🛡️ Keamanan
- Ekstensi hanya aktif pada domain yang ditentukan
- Tidak mengakses data pribadi atau cookie
- Tidak mengirim data ke server eksternal
- Source code terbuka / open source

## 📝 Catatan Pengembangan
- Menggunakan Manifest V3 (terbaru)
- Service Worker untuk background process
- Content Script untuk manipulasi DOM
- Modern JavaScript (ES6+)

## 🐛 Melaporkan Bug
Jika menemukan masalah:
1. Buka Developer Tools (F12)
2. Periksa console untuk error
3. Screenshot masalah yang terjadi
4. Catat URL halaman dan versi browser

## 📄 Lisensi
Bebas digunakan untuk keperluan pribadi dan institusi.