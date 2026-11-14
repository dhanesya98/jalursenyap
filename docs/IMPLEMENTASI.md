> Catatan v4/v5 di bawah bersifat historis. Untuk questline aktif v6, lihat [BAB0-QUESTLINE.md](BAB0-QUESTLINE.md).

# Implementasi brief pada demo v4

| Bagian brief | Hasil dalam build |
| --- | --- |
| Satu wilayah, tiga pengantaran | Lembah Pasir, Roti Rempah, Kerang Suara, Surat Bersegel; penerima dan penutup berurutan |
| Traversal | Lari, lompat, glide terbatas, tarikan Kait Tali, tepian bertanda, Tangga Tali permanen |
| Ruru | Pendamping visual, pemindaian medan dengan cooldown dan petunjuk pijakan berikutnya |
| Hari hangat, berkabut, badai | Pencahayaan, jarak pandang, partikel, angin, kecepatan pasir, anggaran glide dan paparan paket berubah |
| Pilihan rute | Tol tertutup saat badai; Jalur Lentera lebih panjang; Tebing Utara lebih pendek dan terpapar angin |
| Paket | Kerusakan akibat jatuh/paparan badai; tetap bisa diantar; dialog kerang retak dan roti dingin |
| Nama Baik | Lima bangsa tercatat; pengantaran/pilihan/tangga menaikkan kepercayaan; kabar tambahan dari Marsiyah pada ambang kepercayaan |
| Buku Jalur | Peta, rute pilihan, tugas, rumor, penemuan, reputasi, dan perlengkapan |
| Save/checkpoint | Autosave lokal, checkpoint saat masuk pos, kembali ke checkpoint, tangga tetap tersimpan |
| Cerita | Dialog JSON dari brief, Sahdan, Takhta Timbang Agung (TTA), surat Simpul Pertama, Gema menyebut Nara |
| Visual | Karakter/NPC/properti 3D, 7 potret, 3 ilustrasi wilayah, peta, 24 ikon, UI, katalog interaktif, 24 ekspor GLB |
| Audio | Angin dan efek sintesis; melodi singkat saat beristirahat; kontrol volume |
| Build | HTML offline, engine lokal, source dan skrip pengembangan tanpa npm dependencies |

## Batas demo

- Reputasi di build ini memengaruhi tingkat kepercayaan dan informasi tambahan. Sistem perizinan pos/jalur berdasarkan reputasi secara menyeluruh belum dibuat; jalur alternatif utama tetap dapat dijelajahi.
- Kait Tali menarik Nara ke titik tujuan; tidak menggunakan simulasi ayunan pendulum.
- GLB ekspor bersifat statis dan terpisah dari animasi prosedural game. Lihat `assets/models/README.txt` untuk batas format.
- Terrain dan model runtime menggunakan geometri low-poly dengan palet bergaya. Detail ilustrasi potret/pemandangan tidak seluruhnya direplikasi sebagai detail mesh 3D.
- Target durasi 15–20 menit belum diukur dalam playtest pemain baru. Pemeriksaan otomatis membuktikan rute dapat dilalui, bukan memastikan pengalaman atau durasi pemain.
- Malam Tenang, bivak, empat wilayah bangsa lain, variasi gender Nara, serta alat di luar demo tidak termasuk build ini. Ikon bulan tersedia sebagai bagian pustaka, bukan penanda fitur malam yang telah aktif.

## Perbaikan utama dari sumber awal

Alur pengantaran dan altar dijaga state agar ending tidak dapat dipicu sebelum surat dan dua tugas sebelumnya selesai. Hadiah tidak dapat diambil berulang. NPC, checkpoint, jalur, collider, dan permukaan memakai koordinat terrain yang sama. Jalur diuji dua arah, termasuk jurang barat dan rangkaian kait timur. Data lokal menggantikan ketergantungan jaringan saat berjalan; simpanan rusak ditolak tanpa mengganti state aktif.

## Bukti pengujian

`tests/results.json`: 19 tes lulus. `assets/models/validation.json`: 24 GLB lulus pemeriksaan struktur. Browser Chrome desktop: judul, HUD, dialog, jurnal, oasis, badai, ending, model viewer dan galeri diperiksa; tidak ada error/warning tercatat dalam pemeriksaan terakhir.

Skenario `tests/visual.html` memakai penyimpanan memori agar QA tidak menimpa perjalanan pemain. Tidak dilakukan playtest penuh dari awal sampai akhir oleh pemain manusia, benchmark perangkat rendah, atau validasi kontrol sentuh/gamepad.

## Pembaruan kanon · 2026-11-05

Story Bible Gabungan disalin utuh ke `docs/STORY-BIBLE.md`. Babak 1: usia dan asal Nara, Tarun, kesaksian warisan Juma, rantai penjagaan surat, Dorun/Bu Lamiyah, Ajaran Tata, dan alasan Marsiyah menyerahkan surat telah diperbarui. Cap Asharim dicatat saat pengantaran lagu selesai, lalu dibubuhkan saat Marsiyah menyerahkan surat. Surat tetap dibawa setelah Simpul Sembilan menyala.

Data lima bangsa dibaca dari `data/canon.json`; galeri yang sama dipakai Atlas dan Buku Jalur. Simpanan versi 4 dipetakan ke versi 5; nama bangsa lama dan penemuan lama dimigrasikan. VO dinonaktifkan atas permintaan pemilik proyek. Game tidak memuat rekaman percakapan; musik latar, efek, dan lagu Kerang Suara tetap aktif. Berkas VO lama dibiarkan untuk dihapus manual. Tidak ada perubahan model 3D dalam pembaruan ini. Bagian 12.3 serta usulan audit tidak diubah menjadi ketetapan baru.

## Pembaruan kanon · 2026-11-06 (Bab 0 — Pos Nilasar (Batu Biru))

Story Bible Kanon Revisi Terpadu (6 November 2026) disalin utuh ke `docs/STORY-BIBLE.md` beserta peta `assets/world/peta-100-simpul.webp`. Demo diposisikan secara kanonis sebagai **Bab 0 — Pos Nilasar (Batu Biru)** (prolog sebelum perjalanan Bab 1 ke Dusun Sela dan Padang Salkara):
- **Provenans tas & surat:** Sahdan menitipkan baik `Surat Penyalaan` maupun tas berinsulasi di Pos Nilasar (Batu Biru) kepada Saryel (`Saryel → Bahar → Ilyam → Marsiyah`). Marsiyah meminjamkan tas kepada Nara sebelum tugas pertama; Ruru sudah bersama Nara sejak awal.
- **Tiga tugas & laporan jujur:** Roti hangat untuk Juma membuka cerita buku harian kakek Juma; Kerang Suara untuk Bu Lamiyah membangun ikatan saksi tanpa istilah `Kait Tali` (diganti istilah lintasan `Tali Lintas` / tambatan tali); tugas ketiga yang gagal sebagian dilaporkan secara jujur oleh Nara kepada Marsiyah.
- **Tanda uji 009 & dua suara terpisah:** Lengkapnya tanda bahaya 009 mendorong Marsiyah menyerahkan `Surat Penyalaan` dan membubuhkan `Cap Saksi Asharim` di atas bantalan tinta gaung. Saat punggung surat ditempelkan pada lempeng pemeriksaan 009, pantulan `Garis Surut` milik **Sahdan** membaca nama Nara dari tinta cap, sedangkan rekaman lokal **Hemira** tahun 58 terdengar terpisah dari batu bangunan uji di dekatnya.


## Pembaruan kanon · 2026-11-12 (Titik Asal Echoes & Titik Nol)

Kanon dan Story Bible diperbarui dengan penetapan **Titik Asal Echoes (v3, penguburan disengaja)**:
- **Tragedi Tambang Basalt Lulan Tua (~410 Pra-Telan):** Penambang Yazhir terkurung dan dinding batu memantulkan suaranya. Tiga orang gugur (Yazhir dan dua penggali) karena para pendiri Ikatan Arsitek sengaja diam sejak awal demi menjaga persekutuan dan nama baik. Pembaca batu Ilumara menentang penutupan ini dan menuntut Asharim diberi tahu, namun kalah suara.
- **Penguburan & Penebusan Urat Sumi (405–400 Pra-Telan):** Tambang ditutup rapat dan Menara Simpul Pusat (001) dibangun tepat di atasnya. Lulanai menyusun cerita resmi penemuan batu ingatan, menyimpan *Syarat Wajah* hanya sebagai aturan internal Ikatan (*adat Tanda*), dan diam-diam melapisi terowongan Urat Sumi Asharim tanpa pungutan imbalan sebagai penebus rasa bersalah di masa kemarau.
- **Pola Pewarisan:** Pendiri sadar, keturunan buta. Pola penutupan pertama ini diulangi oleh Wilanu empat abad kemudian pada Hari Senyap. Petunjuk ditanam di Bab 2 (satu baris kering arsip Tseren yang selamat karena Kanon Aksara) dan Bab 4A (lapisan serpihan tertua di batu pusat mendahului debat Wilanu–Dalumi).
