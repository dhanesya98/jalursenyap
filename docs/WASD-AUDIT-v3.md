# Audit WASD seluruh map — revisi 3

Tanggal: 14 November 2026. Semua perubahan dibuat di salinan kerja; sumber G: tidak ditulis.

## Perbaikan setelah mengulang pengujian

- Menara Senja, tangga bawah: memperluas overlap landing atas di atas tapak tangga yang terlihat. Sebelumnya arah turun dapat tersendat di (697.16, 506.19).
- Menara Senja, jembatan bawah: meruncingkan ujung collider tali utara mengikuti arah tali. Sebelumnya tombol D dari landing barat tertahan di (275.44, 484.55). Uji ulang A lalu D berhasil sampai landing timur (446.03, 580.77).
- Menara Simpul, tangga platform bawah: memperbaiki bentuk pijakan ujung bawah dan overlap dengan tanah. Sebelumnya arah naik tertahan dekat (1095.04, 604.09), arah turun dekat (1087.71, 594.84). Dinding depan tetap terpisah; tangga timur menjadi penghubung.

## Hasil otomatis

npm test lulus: 23 kelompok regresi, 124176 sapuan keluar di tepi delapan map, 58 target quest dan 14 pintu. Bundle offline dibangun ulang, 9 skrip dan 2 stylesheet cocok dengan sumber.

27 rute dalam tests/wasd-routes.json diuji maju dan balik, berjalan dan sprint: 108 kombinasi. Tes menggerakkan tombol WASD pada controller asli setiap tick, tanpa click-path atau teleport antartitik. Teleport hanya digunakan untuk menyiapkan titik awal setiap kasus. Setiap tick memeriksa seluruh tapak kaki tetap pada ground yang diizinkan. Kasus menekan dinding/jurang juga diuji sambil sprint dan lompat.

| Map | Rute otomatis, masing-masing dua arah dan dua kecepatan |
| --- | --- |
| Nilasar | Tangga kuil, selatan, timur; jembatan barat |
| Sumi | Jembatan barat laut, barat daya, tenggara; tangga timur |
| Senja | Dua jembatan lengkap dengan landing; tangga bawah, tengah, menara |
| Gerbang | Koridor miring dari barat daya sampai gerbang |
| Simpul | Tangga platform bawah, pelataran pilar, tangga monolit |
| Sela | Jembatan utara/selatan, dua tangga tengah |
| Balkut | Pangkal dan dek jembatan, tangga tebing |
| Salkara | Tangga masuk, perkemahan utara, jalur sidang barat/timur |

## Uji tombol langsung di browser

- Nilasar: W/S naik-turun tangga kuil.
- Sumi: S+A / W+D melintasi jembatan barat daya dua arah.
- Senja: A/D di kedua jembatan, serta W/S dan diagonal di tangga bawah. Titik tali yang ditemukan pada uji langsung diperbaiki lalu diuji ulang.
- Gerbang: W+D / S+A melalui koridor miring.
- Simpul: D lalu W naik dari platform bawah; S lalu A kembali turun. Menahan W, termasuk Shift+W+Space, tetap tertahan di sisi dinding.
- Sela: D/A melintasi kedua landing jembatan selatan; S/W tangga tengah. W dan Shift+W+Space di sisi jembatan tertahan di y=580.43, tidak masuk kanal.
- Balkut: lintasan pangkal, di samping mesin tambat dan kaki pilar, sepanjang dek lalu balik; S+D/W+A dan W/S pada tangga tebing. Objek mesin dan pilar tetap perlu dikelilingi.
- Salkara: W+D naik tangga masuk dan S+A turun sampai transisi map yang memang disediakan.

Uji rute otomatis dan uji tombol browser adalah dua lapisan berbeda. Hasil ini mencakup rute dan titik yang tercantum, bukan klaim bahwa setiap kemungkinan posisi/pola tombol telah dicoba manual.
