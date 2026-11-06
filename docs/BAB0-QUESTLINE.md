# BAB 0 — Questline v6

Implementasi 6 November 2026 mengikuti Story Bible revisi terpadu. Cakupan: urutan quest, interaksi, dialog, konsekuensi kondisi barang, catatan, simpanan, serta geometri minimum agar adegan bisa dimainkan. UI peta M dan jurnal Tab/J dipertahankan.

## Alur

1. Maren → Buku Tamu Batu → tas dan roti.
2. Penanda jalan → serah-terima Juma → buku kakek → kembali ke Maren.
3. Titian → serah-terima Bu Lamat/lagu → Sumur Induk → kembali ke Maren.
4. Hitung dua ikat perbekalan → papan perintah gerbang → pemeriksaan Kesa → ambil satu ikat dan bukti → laporan jujur kepada Maren.
5. Buku pemeriksaan Maren → terima surat → ucapkan nama pembawa/penyaksi dan bubuhkan cap → konfirmasi instruksi.
6. Kesa membuka pengunci tebing → pilih rute → periksa bekal di persinggahan.
7. Amati tiga denyut → periksa retak cincin → kontak punggung surat pada lempeng 009.
8. Pintu bangunan uji → batu berjejak → pelat tahun 58 → epilog di penanda Dusun Sela.

29 langkah linear; empat titik pilihan menghasilkan 16 kombinasi percakapan. Pilihan pemeriksaan mempunyai konsekuensi pada kondisi pembungkus (95 atau maksimum 72 sebelum perjalanan pulang). Semua pilihan laporan tetap jujur sesuai kanon. Kiriman ketiga berstatus gagal sebagian/dilaporkan, tidak ditandai telah sampai. Satu mandat surat tercatat terpisah dari tiga tugas sehari-hari.

## Aturan penting

- Tidak ada penambahan Cap Saksi sesudah lagu. Kesaksian kejujuran mengikuti laporan; cap baru dibubuhkan di meja tinta.
- Tas dipinjamkan sebelum pengantaran pertama. Surat diterima setelah tugas ketiga dan catatan tanda uji diperiksa.
- Pengunci utara merupakan collider dan objek nyata yang dilepas oleh tindakan Kesa. Gerbang resmi tetap tertutup.
- Kait Tali tidak digunakan. Ngarai barat memiliki titian dengan permukaan fisik yang dapat dilalui dua arah. Tangga Tali opsional tetap ada.
- 009 tidak menyalakan jaringan umum. Lentera hanya memantulkan tekanan; segel tetap tertutup dan surat tetap dibawa hingga sesudah ending.
- Pantulan di lempeng berasal dari Sahdan dalam kanon. Nama pembicara tidak diumumkan kepada pemain saat identitasnya belum dibuktikan.
- Jejak lokal bangunan uji berasal dari Hesta tahun 58 dalam kanon. Pemain mengetahui sumber fisik, tahun, dan potongan peringatan; nama penyetel serta laporan terkini tetap belum diketahui.
- Buku Jalur hanya menampilkan tugas yang sudah diterima. Catatan baru mengikuti kejadian, dengan label Disaksikan, Dokumen, Kesaksian, Serah-terima, atau Belum terjawab.
- Dialog dapat ditutup dan dilanjutkan dari node tersimpan. Tidak ada hadiah berulang dari interaksi atau pemuatan simpanan.
- VO tetap nonaktif. Lagu kerang, musik, dan efek yang telah tersedia tetap digunakan.
- Bab 1 belum diimplementasikan; epilog menyatakan tujuan berikutnya tanpa menjanjikan akses yang belum tersedia.

## Simpanan dan migrasi

Versi aktif: 6, kunci utama `jalur-senyap-demo1`. Kunci lama dipertahankan agar tombol Lanjutkan menemukan simpanan sebelumnya. Data mentah v4/v5 dicadangkan satu kali di `jalur-senyap-demo1:backup-v4` atau `:backup-v5` sebelum migrasi disimpan. Jika cadangan gagal ditulis, pemuatan dihentikan dan data lama tidak ditimpa.

Simpanan setelah Telaga Sumi pada versi lama dilanjutkan dari `return_shell`. Tugas ketiga baru, laporan, surat, dan penutup harus dialami kembali. Pemeriksaan migrasi tidak menganggap kegagalan ketiga yang dulu diceritakan sebagai kejadian yang telah dimainkan. Catatan terlambat dan cap lama tidak disalin ke progres baru. Posisi dikembalikan dekat Maren untuk transisi ini; reputasi, pengaturan, dan struktur yang valid dipertahankan.

## Pengujian

`npm test` menjalankan:

- `tests/quest.cjs`: 16 kombinasi pilihan, penolakan aksi di luar urutan, hadiah idempoten, save/load setiap langkah, dialog terputus, kondisi barang, pemisahan cap/jejak/epilog, migrasi semua milestone lama, dan kegagalan backup.
- `tests/test.cjs`: fisika, collision, titian dua arah, pengunci Kesa, tangga, frame rate, gerak, aset, dan geometri karakter.
- `tests/canon.cjs`: aturan kanon, referensi target/dialog, batas informasi pembicara, serta VO nonaktif.
- `tests/quest-navigation.cjs`: controller dan collision sebenarnya mencapai seluruh 29 target berturut-turut lewat kedua rute, tanpa teleport antarquest.

`tests/playthrough.html` memakai kunci QA terpisah (`qa-bab0-v6:`). Tombol Uji alur lengkap A/B menjalankan controller dan UI dialog sebenarnya. Ini pemeriksaan integrasi, bukan pengganti playtest manusia. `tests/visual.html` memakai penyimpanan memori untuk inspeksi adegan.

## Durasi dan playtest lanjutan

Target desain: 40–60 menit. Target ini belum dianggap tercapai. Peta inti masih menggunakan skala demo lama; navigasi otomatis sprint hanya memerlukan sekitar 2,5–3 menit untuk seluruh alur. Dialog, orientasi, pilihan, eksplorasi, dan ritme pemain menambah durasi, tetapi diperlukan pengukuran pemain baru untuk menilai apakah kebutuhan 40–60 menit sudah terpenuhi.

Simpanan menyimpan `elapsed` dan `timings` per langkah untuk waktu aktif bermain/dialog. Jeda, peta, jurnal, dan tab tersembunyi tidak dihitung. Metrik berada lokal di browser; tidak dikirim ke layanan mana pun.

Uji 3–5 pemain baru tanpa panduan. Catat waktu per adegan, kebingungan tujuan, bagian yang terlalu verbal, serta pemahaman alasan Maren mempercayai Nara dan bertindak sekarang. Jika durasi masih pendek, tambah keputusan dan kejadian perjalanan yang bermakna pada rute; jangan memperlambat kecepatan atau menambahkan waktu tunggu wajib.

Hasil QA browser: cabang A/Jalur Lentera dan B/Tebing Utara mencapai epilog melalui controller dan UI dialog; konsol tanpa error/warning. Simpanan setelah epilog berhasil dimuat kembali. Layout jurnal diperiksa dan diperbaiki. Mainkan.bat membuka index.html (perjalanan lengkap); pos-batu-biru.html tetap halaman studi visual.
