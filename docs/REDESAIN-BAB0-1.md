# The Silent Route — dunia ilustrasi 2,5D

Revisi implementasi 9 November 2026. Acuan naratif: Story Bible revisi 9 November. Arahan visual: batu pasir, aksen biru kusam, garis tinta `#2B2A33`, warna cel-shaded, arsiran tipis, dan kedalaman atmosfer seperti tiga ilustrasi acuan pengguna. Ilustrasi tidak memuat label atau teks; teks petunjuk berada pada HUD, dialog, dan peta.

## Perubahan yang dapat dimainkan

- Kamera ortografis miring dengan orbit mouse dan gulir zoom. WASD/panah, Shift, lompat/glide, E, Q, tangga, jurnal, peta, dan jeda mempertahankan pemetaan kontrol.
- Pos Nilasar menjadi halaman karavanserai dengan kanal kebun, serambi, rumah batu pasir, kain peneduh dan palma. Monolit dekoratif yang menutupi Buku Tamu Batu dihapus.
- Menara Senja dan Jumel dipindahkan ke kaki kompleks 009. Jalan menara menanjak lewat tikungan yang tetap dapat dilalui dua arah.
- Telaga Sumi memiliki tiga elevasi pijakan (2,0; 2,3; 2,6), dua kanal melingkar, empat penyeberangan kering, dan Sumur Induk berkubah. Batas air mencegah pemain berjalan begitu saja di atas kanal.
- Balai Cawan menjadi serambi utara telaga. Buku tamu dan titipan dagang berada di meja terpisah, dengan ruang pendekatan kosong.
- Kompleks 009 mempertahankan urutan lentera → cincin → surat → bangunan uji. Atap bangunan uji dibuat terbuka agar kedua bukti dapat dibaca dari kamera miring.
- Dusun Sela memiliki rumah serta serambi Ima, kebun, gerobak, dan gerbang kain Balkut. Jalur utara menuju perkemahan tujuh panji yang mengelilingi satu lingkar sidang.
- Material memakai bidang warna datar, arsiran dalam ruang dunia, kontur tinta tipis, dan atmosfer berlapis. Kain peneduh memudar saat karakter berada di bawahnya. Model/animasi Nara yang sudah sedang dikerjakan tidak diganti.

## Urutan node

29 langkah Bab 0 dipertahankan. Bab 1 menambah 9 langkah terarah:

| Langkah | Lokasi dan tujuan | Fungsi |
| --- | --- | --- |
| Ima | Serambi Dusun Sela | Penutup Telinga Perunggu dan latar keluarga |
| Jumel | Halaman Menara Senja | Mengantar bekal Ima |
| Buku Tamu Batu | Pos Nilasar | Mengambil salinan dengan asal tercatat |
| Catatan balai | Balai Cawan | Serah terima catatan dan politik Pos Dagang |
| Titipan pedagang | Meja perbekalan balai | Pilihan menyertakan keraguan atas klaim harga |
| Orsuk | Gerbang Balkut, Dusun Sela | Membuka perjalanan karavan |
| Perbekalan Balkut | Ambang Padang Salkara | Serah terima titipan |
| Tujuh panji | Lingkar sidang | Kebuntuan 3–3–1 tetap belum terpecahkan |
| Janji | Sisi barat lingkar api | Hak kembali dengan bukti; tanpa Cap Cirusia |

Dialog tambahan adalah implementasi ringkas alur bible, bukan durasi penuh Bab 1 sepanjang beberapa jam. Penyelidikan dan Cap Cirusia berada pada Bab 2, yang belum diimplementasikan di slice ini.

## Data, simpanan, dan pemeriksaan

`data/world.json` menyimpan letak NPC, jalan, plateau, kanal dan label peta; `data/quests.json` menyimpan tujuan serta lintasan aman. Peta menandai titik interaksi aktif, bukan hanya nama kawasan. Ruru membaca lintasan yang sama dengan pemeriksaan navigasi.

Simpanan v6 yang sudah menyelesaikan 29 langkah dilanjutkan pada pertemuan Ima. Simpanan versi 4/5 tetap memakai migrasi yang ada. Posisi lama di Menara Senja atau kanal baru dipindahkan ke pijakan aman. Migrasi tidak memberikan cap atau mengubah keputusan yang sudah tercatat.

Jalankan `npm run build` setelah menyunting JSON. `npm test` memeriksa seluruh pilihan quest, save/load, kanon, fisika, batching, kamera ortografis, undakan, serta perjalanan seluruh 38 node pada kedua rute menggunakan controller dan collision nyata. Durasi uji navigasi otomatis bukan perkiraan durasi bermain manusia.

`tests/visual.html` menyediakan fixture visual dengan penyimpanan memori. `tests/playthrough.html` menyediakan perjalanan otomatis melalui controller dan dialog dengan kunci penyimpanan QA tersendiri. Kedua halaman tidak menulis simpanan pemain utama. Tidak ada layanan jarak jauh atau publikasi yang ditambahkan.
