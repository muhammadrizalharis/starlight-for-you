# ✨ Starlight — untuk Salsabila Adistya Wati

Sebuah web persembahan untuk sahabat, penuh animasi bertema **bintang & galaxy**, dibuat dengan HTML, CSS, dan JavaScript murni (tanpa framework, tanpa proses build). Siap langsung di-deploy ke **GitHub Pages**.

## 🌌 Fitur

- **Hero** dengan **galaksi 3D** (Three.js): ribuan partikel spiral rose→ungu berputar, inti bercahaya, parallax mengikuti gerak mouse & scroll.
- **Surat** untuk sahabat dengan desain kartu elegan.
- **Timeline** perjalanan persahabatan.
- **Galeri 3D carousel**: foto berputar melingkar (coverflow), bisa diputar otomatis, **diseret/di-swipe**, tombol ‹ ›, dan **klik foto untuk memperbesar (lightbox)**.
- **Alasan bersyukur punya sahabat** dalam bentuk kartu.
- **Musik latar** yang bisa dinyalakan/dimatikan.
- Efek romantis: **nebula glow**, **kelopak bunga & mawar berterbangan**, **bintang jatuh**, **jejak kilau kursor** (desktop), efek **tilt 3D** pada kartu, **bintang melayang**, **reveal saat scroll**, dan **navigasi titik**.
- **Hemat performa (HP kentang aman)**: deteksi otomatis 3 tingkat perangkat — jumlah partikel, pixel ratio, kelopak, dan efek dikurangi di HP/perangkat low-end; animasi berat dimatikan saat tab tidak aktif dan saat `prefers-reduced-motion`.
- Responsif untuk HP & desktop.

## 📁 Struktur

```
starlight-for-you/
├── index.html
├── css/style.css
├── js/script.js
└── assets/
    ├── music.mp3        (tambahkan sendiri — lihat di bawah)
    └── photos/          (ganti SVG dengan foto asli)
```

## 🎵 Menambahkan musik

Letakkan file lagu favorit kalian dengan nama **`music.mp3`** di dalam folder `assets/`.
Karena kebijakan browser, musik baru diputar setelah ada interaksi pertama (klik/sentuh) atau saat tombol ♪ di pojok kanan atas ditekan.

> Pastikan kamu punya hak untuk menggunakan lagu tersebut.

## 🖼️ Foto galeri

Galeri memakai 6 foto di `assets/photos/foto1.jpeg` … `foto6.jpeg`.
Ganti file-file itu (nama sama) untuk mengubah foto, atau sesuaikan `src` di `index.html` pada bagian galeri.

## ✍️ Personalisasi teks

Semua teks (surat, timeline, alasan) ada di `index.html` — ubah sesuka hati sesuai cerita kalian.

## 🚀 Cara deploy ke GitHub Pages

1. Buat repository baru di GitHub bernama **`starlight-for-you`**.
2. Upload semua isi folder ini ke repository tersebut (lihat perintah Git di bawah).
3. Buka **Settings → Pages**.
4. Pada **Source**, pilih branch **`main`** dan folder **`/ (root)`**, lalu **Save**.
5. Tunggu beberapa saat, web akan tersedia di:
   `https://<username-github-kamu>.github.io/starlight-for-you/`

### Perintah Git (jalankan di dalam folder ini)

```bash
git init
git add .
git commit -m "Starlight untuk Salsabila"
git branch -M main
git remote add origin https://github.com/<username>/starlight-for-you.git
git push -u origin main
```

## 🧪 Pratinjau lokal

```bash
# dengan Python
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

---

Dibuat dengan 💖 di bawah langit yang sama.
