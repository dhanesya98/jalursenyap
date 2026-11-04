# Jalur Senyap

![Ilustrasi konsep Lembah Pasir: Nara dan Ruru memandang jalur panjang menuju cakrawala](assets/world/lembah-pasir.png)

*Ilustrasi konsep Lembah Pasir.*

**Jalur Senyap** adalah game petualangan third-person tentang seorang kurir muda yang mengantar surat dan paket antar bangsa di dunia fantasi. Tanpa combat, tanpa crafting, tanpa grinding. Yang ada hanya perjalanan, medan yang harus dibaca, dan cerita di setiap pengantaran.

## Coba mainkan

Mau langsung mencoba? Buka versi online di **[dhanesya98.github.io/jalursenyap](https://dhanesya98.github.io/jalursenyap/)**. Tidak perlu mengunduh apa pun. Gunakan browser desktop dengan WebGL, keyboard, dan mouse (lihat [Kontrol](#kontrol)).

## Premis

Dahulu, seratus menara relay bernama **Simpul** mengalirkan **Gema**, sihir yang membawa kabar, suara, dan ingatan antar bangsa di **Tanah Lintas**. Jalur itu disebut **Jalur Gema**. Lalu datang **Hari Senyap**: Simpul-simpul padam satu per satu, kabar terputus, dan kecurigaan tumbuh di antara bangsa-bangsa. Jalur Gema kini dikenal sebagai **Jalur Senyap**.

Kamu adalah **Nara**, kurir magang yang mewarisi tas kurir tua milik Sahdan, kurir legendaris yang menghilang sebelum Hari Senyap. Di dalam tas itu ada sebuah **surat bersegel dari Simpul Pertama** yang tidak pernah sampai ke tujuannya. Bersama **Ruru**, makhluk kecil berbulu yang menjadi penunjuk arah, Nara mengantar paket demi paket, mendengar kisah tiap penerimanya, dan perlahan menyalakan kembali Simpul yang padam.

Setiap pengantaran membuka cerita kecil. Semuanya menyambung ke satu misteri besar: apa sebenarnya yang terjadi pada Hari Senyap.

## Inspirasi: Silk Road

Dunia game ini sangat terinspirasi dari **Jalur Sutra (Silk Road)**, tetapi hanya dari *prinsipnya*, bukan sejarahnya. Semua bangsa, tokoh, dan ceritanya murni fantasi.

- **Jaringan jalur dagang yang menghubungkan peradaban berbeda.** Lima bangsa fantasi, masing-masing dengan wilayah, budaya, bahasa, dan sapaan khas: Asharim, Tseren, Cirusia, Pahitan, dan Warjian.
- **Pos Singgah (caravanserai).** Tempat istirahat dan pusat jalur: menerima tugas, bertemu karakter, dan membuka rute baru. Pos Batu Biru adalah Pos Singgah di Lembah Pasir.
- **Pos estafet.** Simpul terinspirasi dari sistem pos relay kuno yang menyambung kabar melintasi jarak jauh.
- **Barang membawa makna.** Yang diantar bukan hanya benda, tetapi juga kabar, lagu, dan ingatan. Sebuah lagu bisa berubah sedikit di tiap persinggahan.
- **Kepercayaan sebagai mata uang.** Kurir yang dipercaya bisa melewati pos yang tertutup bagi orang lain. Reputasi per bangsa (**Nama Baik**) menggantikan level dan statistik.
- **Persinggungan budaya.** Konflik dan keindahan cerita lahir dari salah paham, adat yang bertabrakan, dan hal-hal yang berubah saat berpindah tangan.

Inspirasi lain: **Death Stranding** untuk eksplorasi dan traversal (membaca medan, merencanakan rute, jalan yang dibuka tetap terbuka), **Moebius** dan **Studio Ghibli** untuk visual dan world building, serta **Outer Wilds** untuk rasa ingin tahu dan penemuan.

## Kontrol

Kontrol ditujukan untuk keyboard dan mouse.

| Tombol | Aksi |
| --- | --- |
| WASD / panah | Bergerak |
| Shift | Berlari |
| Spasi | Lompat; tahan saat turun untuk membuka Jubah Layar |
| Mouse | Kamera; klik dunia untuk mengunci pointer, Esc untuk melepas |
| E | Bicara, periksa pos, panjat tangga atau tepian bertanda |
| F | Tarik diri menuju cincin Kait Tali dalam pandangan |
| L | Pasang Tangga Tali di penanda |
| Q | Pindai medan bersama Ruru (cooldown 12 detik) |
| J | Buku Jalur: pilihan rute, rumor, perlengkapan |
| H / Esc | Panduan / jeda |

Beberapa hal yang perlu diketahui saat bermain:

- Kait Tali dan Tangga Tali terbuka pada tugas kedua. Alat dipilih di Pos Batu Biru.
- Glide terbatas dan terisi kembali saat mendarat. Badai menghabiskannya lebih cepat.
- Batu memberi pijakan lebih cepat daripada pasir. Tebing curam memerlukan rute lain atau alat.
- Paket dapat tergores tetapi tetap bisa diantar. Jatuh ke jurang mengembalikan Nara ke pos terakhir.
- Tangga yang dipasang menetap dalam simpanan.

## Menjalankan

1. Ekstrak seluruh ZIP ke satu folder.
2. Buka `index.html` di browser desktop dengan WebGL (di Windows, `Mainkan.bat` membuka halaman yang sama).
3. Klik **Mulai perjalanan**, temui Maren, lalu ikuti petunjuk dan Buku Jalur.

Semua berkas tersedia lokal dan tidak memerlukan instalasi paket, koneksi internet, atau akun. Jika browser membatasi penyimpanan berkas lokal, jalankan `node tools/serve.cjs` lalu buka `http://127.0.0.1:4173`.

## Dokumentasi dan aset

- [`docs/BRIEF.md`](docs/BRIEF.md): brief lengkap (dunia, cerita, art direction, dialog).
- `atlas.html`: katalog aset visual dengan model 3D yang bisa diputar.
- `pos-batu-biru.html`: studi visual Pos Batu Biru.

## Status demo

Ini adalah build demo dengan satu wilayah (Lembah Pasir), tiga pengantaran, dan visual 3D low-poly prosedural. Durasi 15 sampai 20 menit belum divalidasi lewat playtest. Malam Tenang, wilayah empat bangsa lain, bivak, multiplayer, dan pilihan gender Nara belum diimplementasikan.
