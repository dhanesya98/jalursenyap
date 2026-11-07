# Sumber aset Jalur Senyap v4

## Konsep dan cerita

Dunia, istilah, tokoh, dan dialog dasar mengikuti brief pengguna, disertakan di `docs/BRIEF.md`. Konten dari dokumen dipakai sebagai spesifikasi desain, bukan sebagai izin untuk tindakan eksternal. File game.zip dan brief asli tidak diubah.

## Aset baru untuk proyek ini

- **Potret PNG:** tujuh gambar dibuat menggunakan ImageGen bawaan. Prompt, referensi, dan catatan ada di `portrait-prompts.json` serta `PORTRAIT-ICON-CREDITS.txt`; ukuran dan hash ada di `portrait-icon-manifest.json`.
- **Ilustrasi lingkungan PNG:** tiga gambar dibuat menggunakan ImageGen bawaan. Prompt/catatan sumber ada di `world/prompts.json`. Ilustrasi ini dipakai pada judul, catatan wilayah, dan atlas.
- **Ikon dan peta SVG:** digambar dengan kode untuk proyek ini. Peta berasal dari koordinat dunia game, bukan layanan peta eksternal.
- **Model 3D dan GLB:** geometri prosedural buatan proyek di `src/art.js`, diekspor dengan `tools/export-models.cjs`. Lihat `models-manifest.json` dan `models/README.txt`. GLB memakai pose statis; animasi game dihitung saat runtime.
- **Terrain, langit, partikel, jalur, UI:** dibuat dengan kode lokal untuk proyek ini.
- **Audio:** angin, langkah, efek, dan melodi sederhana disintesis oleh Web Audio dalam `src/audio.js`. Tidak menggunakan rekaman pihak ketiga atau suara manusia hasil cloning.

Aset ImageGen tidak dinyatakan sebagai aset CC0 pihak ketiga. Tidak ada foto, model, musik, atau tekstur pihak ketiga yang diunduh untuk build ini. Font menggunakan font sistem (Georgia dan Segoe UI), tanpa file font yang dibundel.

## Engine

`vendor/three.min.js` disalin dari proyek sumber pengguna, Three.js r128. Copyright © 2010–2021 Three.js Authors; MIT License. Header lisensi dipertahankan. Salinan teks lisensi ada di `../vendor/LICENSE-THREE.txt`.

## Studi visual v5
Nara baru: src/nara-art.js. Pos, tekstur Canvas, dan bayangan: src/atelier.js. Kontur layar: src/ink-render.js. Geometri dan tekstur ini dibuat dengan kode untuk proyek. Panorama jauh tambahan dibuat dengan ImageGen bawaan; prompt lengkap di world/asharim-distance-v5-prompt.json. Tidak ada layanan gambar yang dipanggil saat game berjalan.

## Studi visual 02
Maren dan Ruru dibuat ulang sebagai geometri dan rig asli di src/companions-art.js. Tekstur kain memakai Canvas lokal. Tidak ada model, gambar atau audio pihak ketiga tambahan.


## Ilustrasi lima bangsa · 2026-11-05

Lima gambar `assets/world/nations/*-concept-v1.webp` dibuat dengan built-in ImageGen. Referensi gaya: ilustrasi Lembah Pasir dan potret Nara milik proyek. Detail prompt ada pada `assets/world/nations/prompts-dan-sumber.json`. Gambar adalah konsep lingkungan, bukan tangkapan layar atau model 3D.
