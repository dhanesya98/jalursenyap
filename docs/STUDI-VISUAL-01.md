# Studi visual 01 — Pos Batu Biru dan Nara

Buka **pos-batu-biru.html** setelah mengekstrak paket. Halaman ini menjalankan dunia 3D, controller, kamera, pencahayaan, dan interaksi game yang sama dengan `index.html`. Tombol sudut pandang memindahkan Nara ke empat titik untuk melihat hasilnya; setelah itu WASD, mouse, lompat, dan percakapan tetap berfungsi. Progres studi disimpan hanya di memori dan tidak menimpa simpanan perjalanan.

## Yang berubah dari v4

- **Nara:** geometri baru dengan jubah melengkung mengelilingi bahu, lipatan dan hem asimetris, scarf dua ekor, rambut berlapis, mata/alis/hidung, sepatu bertali, tas kulit berjahitan dan segel. Animasi berjalan, diam, dan glide tetap ada. Sumber: `src/nara-art.js`.
- **Pos:** bangunan utama dengan lengkung batu, kubah berubin, menara kecil, relief atap dan penopang dinding. Kanopi melendut dan bergerak lembut, meja surat, roti, kendi, peti, karpet, palem berdaun terpisah, kolam, paving, serta tanaman di tepi halaman. Semua adalah geometri 3D. Sumber: `src/atelier.js`.
- **Material:** tekstur plester, batu, kain, kayu, karpet dan ubin digambar dengan Canvas lalu dipakai pada mesh. Tone ramp memakai warna bayangan ungu hangat. Kilap realistis dihindari.
- **Kontur:** garis sepia tipis mengikuti perbedaan kedalaman saat kamera bergerak, dengan penurunan kekuatan seiring jarak. Sumber: `src/ink-render.js`. Kontur ini melengkapi garis lipatan dan sambungan geometri.
- **Cahaya:** bayangan arah yang lebih jelas, jangkauan shadow map difokuskan ke sekitar pemain, dan contact shadow di kaki Nara.
- **Latar:** panorama 2D baru pada silinder jauh di luar batas permainan. Awan peach/lilac dan langit turquoise mengikuti palet brief. Geometri dekat tetap dapat dilihat dari berbagai sudut; panorama jauh tidak dapat didatangi.

## Penilaian dan batas

Tujuan iterasi ini adalah menunjukkan satu standar visual yang lebih dekat ke brief, bukan menyatakan seluruh dunia sudah dipoles. Oasis, Simpul, model NPC lain dan Ruru masih memakai bentuk v4. Model Nara baru lebih terperinci tetapi belum sama dengan detail potret ilustrasinya. Bentuk landmark di luar pos masih memerlukan revisi agar konsisten.

Tekstur dilukis secara prosedural, bukan hasil texturing manual setiap permukaan. Kontur layar dapat sedikit berubah ketebalannya pada sudut tajam dan objek sangat kecil. Langit jauh memakai panorama berulang; tidak merupakan skybox 360 derajat yang unik. Studi ini belum memakai LUT khusus per cuaca.

## Verifikasi

21 pengujian otomatis lulus, termasuk rute pengantaran, grapple, tangga, glide, dan akses ke Maren serta tas persediaan setelah susunan halaman berubah. Seluruh 24 GLB diverifikasi ulang; GLB Nara diperbarui dengan bentuk baru, tetap pose statis tanpa tekstur Canvas atau klip animasi.

Tampilan halaman pos dan Nara diperiksa melalui browser Chrome desktop. ImageGen hanya dipakai untuk panorama jauh. Pengukuran FPS akhir tidak diselesaikan karena pemeriksaan Computer Use dihentikan atas permintaan pengguna. Angka awal diambil saat jendela diminimalkan dan tidak digunakan sebagai benchmark. Pengujian tidak menjamin frame rate pada perangkat lain.

## Berkas penting

- `pos-batu-biru.html`: studi visual yang langsung dapat dimainkan.
- `index.html`: perjalanan lengkap dengan pos dan Nara baru.
- `atlas.html`: katalog, termasuk model Nara baru.
- `assets/models/character-nara.glb`: ekspor statis model baru.
- `assets/world/asharim-distance-v5.png`: panorama asli.
- `assets/world/asharim-distance-v5-prompt.json`: prompt dan sumber panorama.
- `data/atelier-backdrop.js`: data URI hasil build agar texture tidak memerlukan fetch atau CORS dari berkas lokal.

Membangun ulang: `node tools/build.cjs`. Menguji: `node tests/test.cjs`. Server lokal opsional: `node tools/serve.cjs` lalu buka URL yang dicetak. Semua aset tersedia lokal; tidak memerlukan API key atau internet.

Geometri statis pos digabung dari 829 objek render menjadi 44 batch. Batas geometri dan kanopi yang dianimasikan diuji tetap sama. Tab tersembunyi menghentikan pembaruan render.

