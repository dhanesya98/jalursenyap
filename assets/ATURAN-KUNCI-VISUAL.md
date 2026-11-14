# ATURAN KUNCI ASET VISUAL (VISUAL ASSET FREEZE / LOCK)
Tanggal Kunci: 11 November 2026

## 1. STATUS PENGUNCIAN (LOCKED & FINAL)
Seluruh aset visual pada direktori berikut telah berstatus **FINAL / FROZEN** dan **TIDAK BOLEH DIUBAH, DITIMPA, ATAU DI-ROLLBACK**:
- `assets/portraits/` (37 berkas WebP portrait karakter & NPC kanon)
- `assets/characters/` (34 lembar pose T-pose WebP karakter)
- `assets/world/` (Lanskap, panorama 2D, peta svg/webp)
- `assets/kits/` (Visual kit lima bangsa, interior, elemen)

Daftar checksum dan ukuran berkas resmi tercatat di:
`assets/LOCKED_VISUALS_MANIFEST.json`

Cadangan perlindungan tersimpan di:
`assets/_backup_locked_visuals/`

## 2. ATURAN KERAS UNTUK DEVELOPER & AI AGENT
1. **Dilarang Menghasilkan Gambar Baru / ImageGen:**
   Tidak boleh menjalankan generator gambar atau skrip prompt untuk menggantikan aset karakter yang sudah ada.
2. **Dilarang Menimpa Berkas Portrait:**
   Semua file WebP di `assets/portraits/` adalah kanon visual resmi game *The Silent Route*.
3. **Pemulihan Otomatis Jika Terjadi Rollback Google Drive:**
   Jika Google Drive melakukan sinkronisasi mundur atau menimpa aset visual, pulihkan berkas langsung dari folder cadangan `assets/_backup_locked_visuals/` menggunakan skrip `tools/restore-locked-visuals.cjs`.
