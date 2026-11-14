# Antarmuka revisi 4 — 14 November 2026

## Perubahan
- HUD memakai grid bersama: panel status, tujuan, lokasi, toolbar dan status simpan mendapat ruang tersendiri.
- Ukuran judul tujuan 19 menjadi 16 px (14 px pada layar kecil); judul modal 29 menjadi 22 px; nama pembicara 28 menjadi 22 px; teks dialog normal 17 menjadi 15 px. Preferensi teks besar tetap tersedia.
- Menu dan dialog menyembunyikan HUD di belakangnya. Notifikasi dan petunjuk interaksi ditumpuk menurut tinggi teks, dengan jarak aman dari lokasi/toolbar.
- Header puzzle sekarang memuat judul dan tombol kembali dalam aliran layout yang sama, bukan tombol absolut di atas teks.
- Tab peta dan jurnal dapat membungkus, kolom dapat menyusut, dan panel panjang bisa digulir. Dialog pada layar sempit/pendek mengutamakan teks tanpa kolom potret.
- Gaya warna kertas, hijau dan kuningan dipertahankan.

## Validasi
Audit browser pada 1280x720, 1024x768, 868x839, 640x360, 390x844 dan 320x568; setiap ukuran diuji dengan skala teks 1 dan 1.4 pada HUD, judul, dialog bercabang panjang, jurnal, peta, jeda, puzzle penahan, muatan, dan panduan. Total 108 kombinasi lulus. Pemeriksaan mencakup luapan horizontal panel, batas viewport modal, dan tabrakan pasangan panel/kontrol penting. HUD juga memakai nama lokasi panjang, tujuan panjang, notifikasi serta prompt bersamaan.

Pemeriksaan visual dilakukan pada HUD desktop/sempit, dialog dengan teks sangat besar pada layar pendek, jurnal dan puzzle. Bundle offline berhasil dibuka dan dilanjutkan ke gameplay. Builder serta verifikasi 9 skrip, 2 stylesheet, audio, sintaks dan ID unik lulus.

Audit ini memakai viewport browser, bukan pengujian pada seluruh perangkat sentuh fisik. Pengujian terisolasi memakai server lokal port 4174 agar tidak mengganti save dari server bermain port 4173.

Perubahan produksi hanya HTML/CSS dan rebuild bundle. Mesin gerak, collider, quest, serta format save tetap versi hasil patch v3; hasil regresi collision v3 disertakan sebagai riwayat, tidak diklaim dijalankan ulang untuk perubahan CSS ini.
