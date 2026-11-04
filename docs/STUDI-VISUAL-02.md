# Studi visual 02 — Penghuni Pos Batu Biru

Lanjutan terbatas dari studi 01, tanpa Computer Use, browser, atau pembuatan gambar baru.

## Perubahan

- Maren dibuat ulang: jubah berlipat, selendang biru dengan ujung diagonal, ikat pinggang, kerudung berlapis, rambut abu, garis wajah, anting kecil, paket bersegel, dan tongkat. Gerak napas serta kepala tetap dianimasikan.
- Ruru dibuat ulang: telinga melengkung dengan bidang dalam, pipi dan moncong lebih terbentuk, mata dan kumis, empat kaki beranimasi, ekor lebar yang melengkung serta lentera kecil di ujungnya. Ekor dan lentera bergerak terpisah.
- Konversi warna Ruru dipindah setelah model masuk scene agar warnanya diproses bersama karakter lain.
- Model baru dipakai di game dan atlas. GLB Maren dan Ruru diperbarui; ekspor tetap pose statis tanpa tekstur Canvas dan klip animasi.

## Membuka

Ekstrak ZIP, lalu buka `pos-batu-biru.html` atau `Mainkan.bat`. Maren berada di bawah kanopi; Ruru mengikuti Nara. Untuk melihat model terpisah, buka `atlas.html`, lalu pilih Maren atau Ruru.

## Validasi dan batas

22 tes otomatis lulus, termasuk geometri finite, ukuran karakter, posisi kaki, animasi pada beberapa waktu, anggaran di bawah 90 mesh per karakter baru, serta regresi rute dan penyimpanan. Seluruh 24 GLB lolos validasi struktur exporter.

Tidak dilakukan pemeriksaan browser atau pengukuran FPS pada iterasi ini. Bentuk, perpotongan pakaian dan gerak perlu dinilai langsung di game. Pengujian kode bukan bukti bahwa kualitas visual sudah setara dengan ilustrasi brief.

Sumber model: `src/companions-art.js`. Tidak memakai aset pihak ketiga tambahan. Studi 01 dan build v4 tetap tersedia sebagai paket terpisah.
