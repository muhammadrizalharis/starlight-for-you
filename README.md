# ✨ Starlight — untuk Salsabila Adistya Wati

Sebuah web romantis penuh animasi bertema **bintang & galaxy**, dibuat dengan HTML, CSS, dan JavaScript murni (tanpa framework, tanpa proses build). Siap langsung di-deploy ke **GitHub Pages**.

## 🌌 Fitur

- **Hero** dengan latar bintang berkelap-kelip (starfield) & bintang jatuh.
- **Surat cinta** dengan desain kartu elegan.
- **Timeline** perjalanan hubungan.
- **Galeri** kenangan (tinggal ganti foto).
- **Alasan menyayangi** dalam bentuk kartu.
- **Musik latar** yang bisa dinyalakan/dimatikan.
- Animasi **hati melayang**, efek **reveal saat scroll**, dan **navigasi titik** di samping.
- Responsif (HP & desktop) serta menghormati `prefers-reduced-motion`.

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

## 🖼️ Mengganti foto galeri

Ganti file `assets/photos/photo1.svg` … `photo6.svg` dengan foto kalian (boleh `.jpg`/`.png`).
Jika memakai ekstensi berbeda, sesuaikan juga `src` di `index.html` pada bagian galeri.

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
