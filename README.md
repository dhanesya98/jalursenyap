# Jalur Senyap — Studi Visual 02 (v5.1)

Petualangan kurir third-person di Lembah Pasir, berdasarkan brief di `docs/BRIEF.md`. Tiga pengantaran menghubungkan Pos Batu Biru, Menara Batu Senja, Telaga Sumi, dan Simpul Sembilan. Tanpa combat, crafting, atau grinding.

## Studi visual 02

Maren dan Ruru telah dibuat ulang dan dipasang di game serta atlas. Lihat [perubahan dan batas pemeriksaan](docs/STUDI-VISUAL-02.md). Iterasi ini diperiksa lewat kode, tanpa Computer Use.

## Studi visual baru

Buka **pos-batu-biru.html** untuk langsung menilai Pos Batu Biru dan Nara yang telah dipoles. Gunakan tombol sudut pandang atau berjalan sendiri. Lihat [catatan perubahan dan batas studi](docs/STUDI-VISUAL-01.md). Area lain belum menerima pemolesan yang sama. Versi v4 tetap tersedia terpisah.

## Mainkan

1. Ekstrak seluruh ZIP ke satu folder.
2. Buka `index.html` di browser desktop dengan WebGL. `Mainkan.bat` membuka halaman yang sama di browser default Windows.
3. Klik **Mulai perjalanan**, temui Maren, lalu ikuti petunjuk dan Buku Jalur.

Semua gambar, JavaScript, audio sintesis, dan engine tersedia lokal. Tidak memerlukan instalasi paket, koneksi internet, akun, atau API key. Kontrol ditujukan untuk keyboard dan mouse; kontrol sentuh/gamepad belum tersedia.

Jika browser membatasi penyimpanan berkas lokal, jalankan `node tools/serve.cjs`, lalu buka `http://127.0.0.1:4173`. Node hanya diperlukan untuk server pengembangan, pengujian, atau pembangunan ulang data. Tutup server dengan Ctrl+C. Penyimpanan lokal bergantung pada browser dan alamat halaman; simpanan dari localhost tidak otomatis berpindah ke file lokal atau browser lain.

## Kontrol

| Tombol | Aksi |
| --- | --- |
| WASD / panah | Bergerak |
| Shift | Berlari |
| Spasi | Lompat; tahan saat turun untuk membuka Jubah Layar |
| Mouse | Kamera; klik dunia untuk mengunci pointer, Esc untuk melepas |
| E | Bicara, periksa pos, panjat tangga/tepian bertanda |
| F | Tarik diri menuju cincin Kait Tali dalam pandangan |
| L | Pasang Tangga Tali di penanda |
| Q | Pindai medan bersama Ruru, cooldown 12 detik |
| J | Buku Jalur, pilihan rute, rumor, perlengkapan |
| H / Esc | Panduan / jeda |

Kait Tali dan Tangga Tali terbuka pada tugas kedua. Alat dipilih di Pos Batu Biru. Glide terbatas dan terisi kembali saat mendarat; badai menghabiskannya lebih cepat. Batu memberi pijakan lebih cepat daripada pasir. Tebing curam memerlukan rute lain atau alat. Paket dapat tergores tetapi tetap bisa diantar. Jatuh ke jurang mengembalikan Nara ke pos terakhir. Tangga yang dipasang menetap dalam simpanan.

## Aset visual

Buka `atlas.html` untuk katalog dengan model 3D yang bisa diputar dan dianimasikan.

- 7 potret PNG: Nara, Ruru, Maren, Juma, Bu Lamat, Kesa, dan Pedagang.
- 3 ilustrasi lingkungan PNG: Lembah Pasir, Telaga Sumi, Simpul Sembilan.
- Peta SVG wilayah yang dibangun dari koordinat rute game.
- 24 ikon SVG individual dan satu sprite SVG.
- 24 model GLB: 7 karakter dan 17 properti, arsitektur, paket, serta perlengkapan.
- Dunia 3D: terrain, jalur, jurang, landmark, hub, NPC, palem, reruntuhan, altar, partikel dan pencahayaan cuaca.

Model di game memakai geometri dan animasi prosedural `src/art.js`. GLB adalah ekspor pose statis dengan hierarki bagian, tanpa skin atau klip animasi; materialnya mendekati warna game. Potret dan ilustrasi 2D bukan tangkapan layar dunia 3D. Tidak ada model atau tekstur marketplace yang disisipkan. Sumber dan catatan pembuatan ada di `assets/CREDITS.md`.

## Mengedit proyek

`src/core.js` mengelola aturan, state, dan terrain; `controller.js` menangani gerak; `world.js` menempatkan dunia; `art.js` membangun model; `audio.js` membuat suara; `ui.js` menampilkan antarmuka; `app.js` menyatukannya melalui event dan pembaruan frame.

Dialog, pengantaran, cuaca, lokasi, dan teks cerita tambahan berada di `data/*.json` serta `data/dialogue/*.json`. Setelah mengedit JSON, jalankan `node tools/build.cjs` untuk memperbarui bundle offline dan peta. Teks kontrol dan label antarmuka berada di HTML/JS.

```text
node tools/build.cjs
node tests/test.cjs
node tools/export-models.cjs --verify
```

Untuk membuat ulang GLB setelah mengedit model: `node tools/export-models.cjs`.

## Status validasi

22 pengujian otomatis lulus: alur tiga pengantaran dan ending, hadiah yang tidak berulang, save/load, checkpoint, lintasan utara/barat/timur, grapple, tangga, tepian, glide, konsistensi gerak pada 30/60/120 FPS, efek medan/cuaca, dan aset lokal. Seluruh 24 GLB lolos pemeriksaan struktur exporter. Hasil ada di `tests/results.json` dan `assets/models/validation.json`.

Pemeriksaan browser desktop mencakup judul, HUD, dialog, jurnal, oasis, badai, ending, dan katalog. `tests/visual.html` menyediakan skenario QA eksplisit dengan penyimpanan memori, terpisah dari progres pemain. Pengujian rute otomatis menggunakan controller game, sedangkan skenario visual memasang state secara langsung untuk memeriksa tampilan.

Ini merupakan build demo dengan visual 3D low-poly prosedural. Target durasi 15–20 menit pada brief belum divalidasi melalui playtest pengguna. Rasa kontrol, performa pada perangkat lain, dan keseimbangan durasi masih perlu playtest. Malam Tenang, wilayah empat bangsa lain, bivak, multiplayer, dan pilihan gender Nara belum diimplementasikan dalam demo ini.
