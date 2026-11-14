# The Silent Route — Game Design & Technical Build Brief (AI Agent Handover Reference)

> **Status Dokumen:** Aktif & Kanonis (Pembaruan **9 November 2026** — *Questline v6 / Kanon Revisi 9 November 2026*)  
> **Tujuan Dokumen:** Menjadi pegangan tunggal (*Single Source of Truth*) bagi developer maupun **AI Agent lain** untuk memahami desain game, aturan kanon cerita, arsitektur kode, aset visual WebP, serta *pipeline build & test* pada repositori **The Silent Route** saat ini.  
> **Rujukan Kanon Cerita Lengkap:** Lihat [`docs/STORY-BIBLE.md`](STORY-BIBLE.md).

---

## 1. Ringkasan Eksekutif & Visi Game

**The Silent Route** adalah game petualangan *third-person* 3D berbasis web (Vanilla JS + Three.js lokal, berjalan 100% *offline-capable* di browser tanpa *bundler* eksternal) tentang **Nara** (17 tahun), seorang kurir muda di dunia fantasi **Tanah Sada** pada **Tahun 100 Telan (TS 501)**.

Seratus tahun setelah jaringan komunikasi kuno **100 Menara Simpul (Jalur Echoes)** diputus secara sengaja pada **Malam Tiga Napas** untuk menghentikan gelombang gaung liar, lima bangsa hidup terpisah dan mengandalkan kurir jalan kaki. Di saat **Dewan Tetua** memonopoli jalur dengan *iuran jalur* dan menyaring kabar lewat tujuh *Menara Simpul Redup*, struktur penahan beban di bawah pulau **Menara Simpul Keseratus (Gerbang Surut)** yaitu **Bejana Batu** mulai retak.

### 5 Pilar Desain Utama
1. **Perjalanan adalah Gameplay (*Traversal as Storytelling*):** Tantangan datang dari membaca kontur medan (batu vs pasir vs tebing), mengelola daya angkat **Jubah Layar** (*glide*), memilih rute saat cuaca berubah, dan memasang struktur persisten (**Tangga Tali**) yang tetap tinggal di dunia.
2. **Tanpa Combat, Tanpa Grinding, Tanpa Crafting:** Tidak ada musuh untuk dibunuh, tidak ada *health bar* atau *leveling* statistik. Progres murni berasal dari pengantaran, kejujuran laporan, eksplorasi catatan sejarah, dan **Nama Baik** (reputasi kepercayaan lintas bangsa).
3. **Setiap Barang Membawa Jiwa & Konsekuensi:** Paket dapat mendingin atau tergores akibat benturan/badai pasir, tetapi **tidak pernah menyebabkan *game over* (*no softlock*)**. Kejujuran kurir saat melaporkan kondisi barang jauh lebih dihargai daripada kesempurnaan semu.
4. **Investigasi Mandiri (*No Omniscient Echo*):** Fenomena **Echoes / Jejak** memiliki batas fisik yang ketat—bukan pendeteksi kebohongan otomatis dan bukan rekaman video masa lalu. Pemain membandingkan bukti fisik, dokumen arsip, dan kesaksian antarbangsa di dalam **Buku Jalur**.
5. **Estetika *Hand-Crafted Ink & Warm Watercolor*:** Dunia 3D prosedural berpadu dengan *post-processing ink outline* (`src/ink-render.js`), palet warna mineral hangat ala Moebius/Ghibli, serta ilustrasi dan *portrait* bergaya goresan tinta di atas kertas bertekstur (`.webp`).

---

## 2. Aturan Kanon & Kosakata Baku (Revisi 9 November 2026)

> **PERINGATAN KERAS UNTUK AI AGENT:** Jangan pernah menggunakan istilah lama yang sudah dihapus/diganti pada revisi sebelumnya! Selalu gunakan istilah baku **Revisi 9 November 2026 (`Lampiran C` & `Lampiran D`)** di bawah ini untuk semua teks UI, dialog, dan narasi baru.

### 2.1 Tabel Pemetaan Nama Tokoh & ID Internal Kode
Demi menjaga kompatibilitas *save game* (`version: 6`), model 3D prosedural (`JSArt.character(id)`), dan *script* pengujian, **ID internal di kode tetap menggunakan string lama**, sedangkan **seluruh nama tampil (*display name*) dan dialog wajib menggunakan Nama Kanon Baru**:

| ID Internal (`world.json` / `art.js`) | Nama Kanon Baru (Wajib di UI & Dialog) | Nama Lama (Jangan Dipakai di Teks) | Peran & Keterangan Kanon (Rev 9 Nov 2026) | File Portrait (`assets/portraits/`) |
| :--- | :--- | :--- | :--- | :--- |
| `nara` | **Nara** | Nara | Kurir magang (17 thn) asal Dusun Sela; putri **Tarun** (Bahtari) & ibu berdarah Lulanai; cucu **Nenek Ima**. | `nara.webp` / `01-nara.webp` |
| `ruru` | **Ruru** | Ruru | Pendamping kecil bertelinga besar dengan lentera di ekornya; memindai medan & peka pada gaung/jejak. | `ruru.webp` / `23-ruru.webp` |
| `maren` | **Marsiyah** | *Maren* | Kepala **Pos Nilasar (Batu Biru)**; penjaga ke-4 Surat Penyalaan (`Saryel → Azhel → Ilyam → Marsiyah`). | `marsiyah.webp` / `02-marsiyah.webp` |
| `juma` | **Jumel** | *Jumel* | Penjaga **Menara Senja**; cucu **Ban Jumel** yang menyimpan buku harian kesaksian malam TS 401 tentang Sahdan. | `jumel.webp` / `03-jumel.webp` |
| `kesa` | **Kesa** | Kesa | Prajurit tetua muda **Gerbang Dewan Tetua** (timur); bimbang antara perintah penahanan kabar dan nuraninya. | `kesa.webp` / `04-kesa.webp` |
| `bulamat` | **Bu Lamit** | *Bu Lamat / Bu Lamit* | Tetua **Telaga Sumi** asal Bahtari; istri **Tiwano**; menjaga Sumur Induk Urat Sumi & penerima Lagu Titipanan. | `bu-lamit.webp` / `05-bu-lamit.webp` |
| `pedagang` | **Pedagang Jalan / Pedagang Asharim** | Pedagang Lembah | Pengembara karavan yang membawa kabar gesekan Kubu Pos Tua vs Kubu Pos Dagang. | `pedagang-asharim.webp` / `pedagang.webp` |
| `dorin` | **Tiwano** | *Dorin / Tiwano* | Pelaut Rumah Layar Bahtari & suami Bu Lamit; pengirim Kerang Suara berisi Lagu Titipanan. | `tiwano.webp` / `06-tiwano.webp` |
| `tarun` | **Tarun** | Tarun | Ayah Nara; kurir/pelaut Rumah Layar yang tertahan kontrak *Utang Kabar* sejak tahun 95. | `tarun.webp` / `07-tarun.webp` |
| `ima` | **Ima (Nenek Ima)** | Ima | Nenek Nara di Dusun Sela; keturunan Lulanai yang menyembunyikan asal-usul dari persekusi pasca-Telan. | `ima.webp` / `08-ima.webp` |
| `taluk` | **Taluk (Yang Tetua)** | Taluk / Ketua Dewan | Pemimpin **Dewan Tetua** di Benteng Tata; mewarisi *Ikrar Sambung* (bukan penjahat karikatural). | `taluk.webp` / `09-taluk.webp` |
| `orsa` | **Orsuk** | *Orsa* | Pengawal **Panji Balkut** (Cirusia) di bawah pemimpin **Salgur, si Tali Panjang**. | `orsuk.webp` / `10-orsuk.webp` |
| `sahdan` | **Sahdan / Roh Sahdan** | Sahdan | Kurir lintas bangsa yang menyatu menjadi jangkar di Menara Simpul Pusat; menitipkan tas & surat di Pos Nilasar. | `sahdan.webp` / `11-sahdan.webp` |
| `wirna` | **Wilanu / Roh Wilanu** | *Wirna* | Pemimpin arsitek Lulanai pada Malam Tiga Napas yang memutuskan pemutusan sepihak. | `wilanu.webp` / `12-wilanu.webp` |
| `dahan` | **Dalumi / Roh Dalumi** | *Dahan* | Tetua arsitek Lulanai yang menentang keputusan sepihak Wilanu dan mengingatkan *Ikrar Sambung*. | `dalumi.webp` / `13-dalumi.webp` |
| `hesta` | **Hemira / Suara Hemira** | *Hesta / Hemira* | Arsitek Lulanai generasi pasca-Telan (Kaum Terbuka) yang membelot ke Dewan tahun 52 lalu meninggalkan peringatan tahun 58. | `hemira.webp` / `14-hemira.webp` |
| `yazhir` | **Yazhir** | Yazhir | Penambang Lulanai di tambang basalt Lulan Tua (~410 Pra-Telan); suaranya menjadi gaung pertama yang terekam batu; gugur bersama 2 penggali karena para pendiri sengaja diam. | - |
| `ilumara` | **Ilumara** | Ilumara | Pembaca batu Lulanai (~405 Pra-Telan) yang menentang penguburan rahasia tambang basalt oleh para pendiri; nada penolakannya tersisa di lapisan terdalam Batu Pusat. | - |

### 2.2 Pemetaan Istilah Tempat, Lembaga & Teknis (`Lampiran D.1 & D.3`)
- **Tempat & Wilayah:**
  - **Pos Nilasar** (nama resmi; warga sehari-hari juga menyebut **Batu Biru** atau **Pos Nilasar (Batu Biru)**) ← *menggantikan Pos Batu Biru*.
  - **Menara Senja** ← *menggantikan Menara Batu Senja*.
  - **Pegunungan Silin** (julukan: *Kabut Lirih*) ← *menggantikan Pegunungan Kabut Lirih*.
  - **Kepulauan Lamuna** ← *menggantikan Kepulauan Lada Biru*.
  - **Lulan Tua** ← *menggantikan Reruntuhan Hening*.
- **Lembaga & Faksi:**
  - **Dewan Tetua** / **Dewan Tetua** / **iuran jalur** / **Gerbang Dewan Tetua** ← *menggantikan Dewan Tol / Dewan / tol*.
    - Semboyan resmi Dewan Tetua: *"Tata mengelola."*
    - Slogan plakat gerbang Dewan Tetua: *"Setiap kabar ada bobotnya."*
    - Balasan getir rakyat di pasar/pos: *"Semua ditimbang, kecuali yang menimbang."*
  - **Aliran Selaras** (Tseren) ← *menggantikan Aliran Rapi*.
  - **Malam Tiga Napas** ← *menggantikan Malam Hening*.
  - **Ikatan Arsitek** ← *menggantikan Ikatan Penyetel*.
- **Istilah Teknis Jaringan Echoes:**
  - **Gerbang Surut** (di Menara Simpul Keseratus) ← *menggantikan Katup*.
  - **Bejana Batu** (ruang penahan beban bawah pulau) ← *menggantikan Bendungan*.
  - **gaung** / **Batu Gaung** / **Gaung Arsitek** / **tinta gaung** ← *menggantikan resonansi / Batu Resonansi / Resonansi Arsitek / tinta resonansi*.
  - **arsitek** / **Cincin Arsitek** ← *menggantikan penyetel / Cincin Penyetel* (catatan: kata kerja *menyetel / penyetelan* tetap boleh dipakai untuk tindakan teknis menyelaraskan alat).
  - **berlapis peredam** (benang berlapis peredam gaung) ← *menggantikan berinsulasi*.
  - **menara sambung** ← *menggantikan menara relay*.
- **Pembedaan Ketat Empat Istilah Suara (`Lampiran D.1`):**
  1. **Jejak:** Hanya untuk *bekas bunyi pasif pada batu* (mis. rekaman pemeriksaan berulang di batu uji).
  2. **Roh:** Untuk tokoh masa lampau yang telah tiada/menyatu dengan batu namun masih menjawab secara terbatas (`Roh Sahdan`, `Roh Wilanu`, `Roh Dalumi`).
  3. **Suara:** Untuk tokoh yang nasibnya belum pasti (`Suara Hemira`).
  4. **Gaung:** Untuk getaran fisik pada jaringan Echoes, sumur, atau tinta.

### 2.3 Lima Bangsa & Tujuh Panji Cirusia (`data/canon.json`)
1. **Asharim** (*Lembah Pasir & Sabuk Sungai Kembar*): Konfederasi suaka air (*Pakta Sumur Terbuka*). Terowongan Urat Sumi dilapisi cuma-cuma oleh Lulanai sebagai penebus rahasia pasca-tambang asal. Terbelah antara **Kubu Pos Tua** (penjaga kerahasiaan Buku Tamu Batu) dan **Kubu Pos Dagang** (rekanan Dewan Tetua). Semboyan: *"Air tidak bertanya nama."*
2. **Tseren** (*Pegunungan Silin / Kabut Lirih*): Birokrasi arsip & pembuat kertas/tinta (*Kanon Aksara*). Terbelah antara **Aliran Murni** dan **Aliran Selaras**. Semboyan: *"Tinta tak pernah lupa."*
3. **Cirusia** (*Padang Salkara*): Konfederasi militer-kesukuan (*Sumpah Api Tujuh Panji*) dalam kebuntuan politik 3–3–1. Semboyan: *"Bohonglah di depan api, kalau berani."*
   - **3 Panji Tua:** **Panji Gorkan** (*Dargun, si Bara*), **Panji Dolgak** (*Hurgak, si Tanduk Besi*), **Panji Sarbuk** (*Kutlak, si Angin Debu*).
   - **3 Panji Muda:** **Panji Balkut** (*Salgur, si Tali Panjang* — asal Orsuk), **Panji Tumran** (*Borlan, si Roda Kempa*), **Panji Ulmar** (*Burgul, si Bintang Rendah*).
   - **1 Penengah/Penentu:** **Panji Kadum** (*Odgar, si Batu Nama*).
4. **Bahtari** (*Kepulauan Lamuna & Jejaring Sungai-Laut*): Bangsa pelaut, lada biru, dan Kerang Suara (*Hukum Sauh dan Lagu*). Terbelah antara **Rumah Dagang** (kreditur *Utang Kabar*) dan **Rumah Layar** (serikat pelaut seperti Tiwano & Tarun). Semboyan: *"Pasang selalu kembali."*
5. **Lulanai** (*Lulan Tua — Dataran Tinggi Basalt Tengah*): Bangsa arsitek perancang 100 Simpul (*Ikatan Arsitek*). Titik asal Echoes bermula dari tambang basalt Lulan Tua (~410 Pra-Telan) di mana tiga orang gugur karena para pendiri sengaja diam dan mengubur kejadian itu di bawah Menara Simpul Pusat (400 Pra-Telan). Terpencar menjadi **Kaum Pantang** (Mairuma), **Kaum Terbuka** (Ruania), dan **Kaum Sesal** (Lunaia). Tidak memiliki Cap Saksi fisik. Semboyan: *"Dengar dan resapi."*

### 2.4 Aturan Penulisan Dialog (`Lampiran C`)
- **TIDAK ADA SALAM RITUAL:** Hapus dan jangan pernah membuat sapaan buatan seperti *"Teduh di jalanmu / Air di langkahmu"*, *"Tinta tenang / Kata terjaga"*, atau *"Pasang baik / Layar penuh"*. Tokoh menyapa dan berpamitan secara alami layaknya percakapan manusia sehari-hari.
- **Semboyan Bangsa Muncul Sesekali:** Semboyan tiap bangsa (*"Air tidak bertanya nama"*, *"Tinta tak pernah lupa"*, *"Pasang selalu kembali"*, dll.) diselipkan sesekali secara organik di tengah obrolan sebagai pepatah, bukan di setiap awal/akhir percakapan.
- **Suara Karakter yang Khas:**
  - **Nara:** Lugas, sedikit cerewet saat gugup, mengoreksi kalimatnya sendiri (*"Dua lapis daun. Tiga, sih, sama kainnya"*), peduli pada barang titipan.
  - **Marsiyah:** Tenang, keibuan, selalu mendahulukan minum/napas tamu (*Tiga Cawan*) sebelum bicara tugas, tegas soal kejujuran laporan.
  - **Jumel:** Hemat kata, selalu menyebut waktu/arah angin secara presisi, membedakan kesaksian mata dari catatan warisan.
  - **Bu Lamit:** Hangat, tertawa lepas, penuh rindu keluarga pesisir.
  - **Kesa:** Kaku saat membacakan pasal Dewan Tetua, namun retak dan manusiawi karena surat ibunya sendiri pernah tertahan.

---

## 3. Desain Questline Aktif: Bab 0 — Pos Nilasar (Batu Biru)

Build saat ini mengimplementasikan **Bab 0 (Prolog penuh, 29 langkah linear dengan 4 titik percabangan pilihan = 16 variasi jalur dialog)** di wilayah **Lembah Pasir**.

### 3.1 Alur 29 Langkah (`data/quests.json`)
| Tahap | Langkah (`id` quest) | Ringkasan Gameplay & Cerita | Cuaca |
| :--- | :--- | :--- | :--- |
| **Pembuka (Pos Nilasar)** | `welcome` → `register` → `take_bag` | Nara menemui **Marsiyah** di paviliun, memahat namanya di **Buku Tamu Batu**, lalu menerima pinjaman **tas berlapis peredam** peninggalan Sahdan beserta bungkusan **Roti Rempah**. | `hangat` (Hari Hangat) |
| **Tugas 1: Roti Rempah** | `bread_route` → `bread_handoff` → `juma_ledger` → `return_bread` | Mendaki jalur batu ke utara menuju **Menara Senja**, menyerahkan roti kepada **Jumel** (dialog berubah jika waktu tempuh `> 180 dtk`), memeriksa sketsa tas Sahdan di buku harian **Ban Jumel (TS 401)**, lalu kembali ke Marsiyah. | `hangat` |
| **Tugas 2: Kerang Suara** | `shell_crossing` → `shell_handoff` → `well` → `return_shell` | Membawa **Kerang Suara** kiriman **Tiwano** melewati titian ngarai barat menuju **Telaga Sumi**. Mendengarkan lagu keluarga bersama **Bu Lamit** (termasuk nada sumbang khas Tiwano sebagai tanda keaslian manusiawi; dialog menyesuaikan jika integritas `< 60`), memeriksa dengung gaung di **Sumur Induk**, lalu melapor ke Marsiyah. Membuka alat **Tangga Tali**. | `kabut` (Hari Berkabut) |
| **Tugas 3: Perbekalan Pos Saudara** | `supplies_check` → `toll_notice` → `detention` → `recover_cargo` → `report` | Menghitung 2 ikat perbekalan, berjalan ke **Gerbang Dewan Tetua** di timur, membaca maklumat penutupan jalur, dan menghadapi pemeriksaan **Kesa**. Satu ikat disita Dewan Tetua, satu ikat dikembalikan (pilihan pemain menentukan integritas sisa barang: `72%` dengan berita acara lengkap atau `95%` dengan fokus perlindungan kain). Nara membawa pulang 1 ikat sisa dan melapor secara jujur (`gagal sebagian`) kepada Marsiyah. | `kabut` → `berat` (Badai) |
| **Mandat Surat Penyalaan** | `warnings` → `letter` → `stamp` → `farewell` | Mencocokkan tanda bahaya di buku pemeriksaan Marsiyah. Karena kejujuran Nara pada tugas ke-3 dan lengkapnya tanda bahaya, Marsiyah menyerahkan **Surat Penyalaan** (titipan `Saryel → Azhel → Ilyam → Marsiyah`). Mereka membubuhkan **Cap Saksi Asharim** di atas bantalan **tinta gaung** sambil mengucapkan nama pembawa (`Nara`) dan penyaksi (`Marsiyah`). Segel depan tetap tertutup. | `berat` |
| **Lintas Badai & Pemeriksaan 009** | `kesa_open` → `storm_shelter` → `relay_lantern` → `relay_ring` → `relay_contact` | Kesa membuka pengunci fisik **Tebing Utara**. Pemain memilih rute di peta: **Jalur Lentera (`safe`)** yang lebih panjang namun terlindung dinding batu, atau **Tebing Utara (`fast`)** yang lebih pendek namun terpapar angin badai. Di **Simpul Sembilan (009)**, Nara mengamati **3 denyut lentera tanpa penyetelan**, memeriksa **retak cincin penanda**, lalu menempelkan punggung surat bercap pada lempeng 009. **Pantulan jauh** (*Roh Sahdan*) merespons tinta cap dan menyebut nama *"Nara"*. Jaringan umum **tidak** menyala; segel surat **tetap tertutup**. | `berat` |
| **Bangunan Uji & Epilog** | `test_entry` → `test_echo` → `test_record` → `epilogue` | Ruru menuntun Nara ke **Bangunan Uji** yang disegel di belakang 009. Di dalamnya, **batu uji** memutar rekaman lokal pasif dari **tahun 58** (*Jejak pada batu uji* milik Hemira—tanpa menyebut nama Hemira secara prematur) tentang 7 cabang Menara Simpul Redup yang membebani ruang penahan di bawah pulau **Gerbang Surut**. Setelah mencocokkan pelat inspeksi tahun 58, Nara dan Ruru berhenti di penanda keberangkatan menuju **Dusun Sela** (akhir Bab 0). | `berat` |

---

## 4. Spesifikasi Mekanik Gameplay & Sistem UI

### 4.1 Pergerakan & Traversal (`src/controller.js`, `src/core.js`, `src/world.js`)
- **Kontrol Dasar:** `W A S D` / Panah (jalan), `Shift` (sprint), `Spasi` (lompat; tahan di udara untuk membuka **Jubah Layar / Glide** hingga anggaran `4.5 detik` yang terisi ulang instan saat menyentuh tanah).
- **Permukaan Medan (`Terrain`):**
  - `rock` (batu): kecepatan `1.0x` (pijakan mantap).
  - `sand` (pasir): kecepatan `0.82x` saat hangat/kabut, turun menjadi `0.61x` saat badai (`berat`).
  - `cliff` (tebing curam): kecepatan `0.48x` dan kemiringan tinggi menolak pendakian biasa.
- **Interaksi Kontekstual (`E`):**
  - Berbicara dengan NPC, memeriksa objek/dokumen quest, memanjat **Tepian Bertanda Lentera** (`ledge-north`), serta memasang/memanjat **Tangga Tali** (`ladder-west`, `ladder-east`).
  - **Catatan Desain Penting:** Mekanik *Kait Tali (Grapple)* dari prototipe lama **telah dipensiunkan di Bab 0** (`world.anchors = []`); ngarai barat menggunakan **Titian Kayu tetap** (`west-bridge`) yang bisa diseberangi dua arah dengan berjalan kaki.
- **Pemindaian Ruru (`Q`):** Cooldown `12 detik`. Memancarkan cincin kuning (`scanRing`) di atas kontur tanah dan menggerakkan lentera pemandu (`guide`) ke titik rute berikutnya.

### 4.2 Pemisahan Peta (`M`) dan Buku Jalur (`Tab` / `J`)
Sesuai arahan desain pengguna, tombol HUD dan layar overlay **tidak boleh tumpang-tindih (*no overlap*)**:
1. **Peta Wilayah (`M` — `#map-screen`):**
   - Menampilkan kanvas kartografi Lembah Pasir (`JSMap`) dengan garis kontur elevasi riil yang dihitung langsung dari fungsi `Terrain.height(x, z)`, rute aktif, posisi landmark, tangga yang sudah dipasang, panah posisi/arah hadap Nara, serta pemilih rute badai (**Jalur Lentera** vs **Tebing Utara**).
2. **Buku Jalur (`Tab` / `J` — `#journal`):**
   - Berfungsi sebagai **Kompendium In-Game** dengan 4 tab terpisah:
     - **Tugas Pengantaran (`deliveries`):** Tujuan aktif saat ini, kartu progres 3 pengantaran + 1 mandat surat, serta daftar riwayat 29 langkah (*Jejak perjalanan*).
     - **Catatan & Cerita (`lore`):** Catatan observasi Nara yang terklasifikasi (*Disaksikan*, *Dokumen*, *Kesaksian*, *Serah-terima*, *Belum terjawab*), rumor pedagang, tempat yang ditemukan (*discoveries*), status **Cap Saksi**, dan tingkat kepercayaan **Nama Baik** di 5 bangsa.
     - **Lima Bangsa (`nations`):** Kompendium interaktif (`JSNations`) dengan ilustrasi `.webp`, semboyan, kontrak Pra-Simpul, politik internal, dan daftar **Tujuh Panji Cirusia**.
     - **Perlengkapan & Gear (`equipment`):** Manajemen alat (Tangga Tali, Jubah Layar) dan profil Nara & Ruru.

### 4.3 Sistem Audio (`src/audio.js`)
- Menggunakan **Web Audio API prosedural** (tanpa ketergantungan file MP3 eksternal) untuk deru angin sesuai cuaca (`hangat`, `kabut`, `berat`), langkah kaki (`rock` vs `sand`), lonceng pos, gaung Simpul 009, dan melodi **Kerang Suara** (*Senandung Tidur Bahtari*).
- Dilengkapi **Audio Player UI** di dalam kotak dialog dan *floating pill* di HUD (`▶ Putar`, `⏸ Jeda`, `⏹ Stop`) saat mendengarkan Kerang Suara.
- **Voice-Over (VO) Dinonaktifkan Secara Kanonis:** `playVoice()` adalah *no-op* yang tidak pernah memicu pemutaran file rekaman suara percakapan (diuji oleh `tests/canon.cjs`).

---

## 5. Arsitektur Teknis & Struktur Direktori

Proyek ini dirancang agar dapat dijalankan langsung dengan membuka `index.html` (melalui `data/game-data.js` dan `data/atelier-backdrop.js` yang sudah di-*bundle*) maupun melalui server lokal (`node tools/serve.cjs`).

```text
Jalur-Senyap-v4/
├── index.html                  # Aplikasi utama game 3D (HUD, Peta M, Buku Jalur Tab, Dialog)
├── atlas.html                  # Katalog visual interaktif (3D model viewer, 5 bangsa, peta, 14 portrait, kit bangunan)
├── PORTRAIT.html               # Galeri & alat audit khusus 14 Portrait Dialog (1024×1024 WebP)
├── AUDIT.html                  # Galeri & alat audit khusus 29 Lembar Konsep Visual (WebP)
├── pos-batu-biru.html          # Halaman studi visual kamera Pos Nilasar (digenerate oleh build.cjs)
├── Mainkan.bat                 # Peluncur cepat Windows
├── package.json                # Skrip npm test & build (tanpa node_modules eksternal)
├── vendor/
│   └── three.min.js            # Engine Three.js r128 lokal
├── data/
│   ├── canon.json              # Sumber kanon 5 bangsa, Tujuh Panji, rantai Surat Penyalaan (Revisi 2026-11-07)
│   ├── quests.json             # Definisi 29 langkah quest Bab 0, objek interaksi, dan catatan Buku Jalur
│   ├── deliveries.json         # Metadata 3 tugas pengantaran + 1 mandat surat
│   ├── world.json              # Koordinat landmark, NPC, rute (north, west, safe, fast, direct, toll), tangga, jembatan
│   ├── weather.json            # Parameter pencahayaan & kabut untuk cuaca hangat, kabut, berat
│   ├── copy.json               # Teks dinamis (roti dingin, kerang tergores, sapaan idle NPC, status cap)
│   ├── dialogue/               # 22 berkas JSON percakapan bercabang (maren_intro.json .. epilogue.json)
│   ├── game-data.js            # [GENERATED] Bundle seluruh JSON di atas untuk mode offline (dibuat oleh tools/build.cjs)
│   └── atelier-backdrop.js     # [GENERATED] Data URI WebP backdrop jarak jauh (dibuat oleh tools/build.cjs)
├── src/
│   ├── core.js                 # Logika murni (State v6, validasi save, migrasi v4/v5->v6, Terrain height/slope/surface)
│   ├── app.js                  # Loop utama Game, inisialisasi Three.js, input keyboard/mouse, cuaca, kamera
│   ├── controller.js           # Fisika pergerakan pemain (JSPlayer: jalan, lari, lompat, glide, tangga, tepian)
│   ├── world.js                # Pembangunan mesh terrain, jalur, penempatan NPC, checkpoint, kolisi (JSWorld)
│   ├── quest-world.js          # Geometri properti quest fisik, jembatan barat, gerbang pengunci Kesa, suar tujuan
│   ├── ui.js                   # Manajer DOM UI, Peta (JSMap), Buku Jalur, Dialog & pemetaan 14 Portrait
│   ├── nations.js              # Komponen pemilih & perender kompendium Lima Bangsa (JSNations)
│   ├── audio.js                # Sintesis Web Audio API (angin, efek, lagu Kerang Suara; VO nonaktif)
│   ├── art.js                  # Factory geometri 3D dasar karakter & properti (JSArt)
│   ├── nara-art.js             # Rig & animasi prosedural 3D Nara
│   ├── companions-art.js       # Rig & animasi prosedural 3D Marsiyah (`maren`) & Ruru (`ruru`)
│   ├── travelers-art.js        # Rig & animasi prosedural 3D Jumel, Bu Lamit (`bulamat`), Kesa, Pedagang
│   ├── atelier.js              # Arsitektur 3D Pos Nilasar & static mesh batching (JSAtelier)
│   ├── region-art.js           # Arsitektur 3D Menara Senja, Telaga Sumi, Gerbang Dewan Tetua, Simpul 009 (JSRegionArt)
│   ├── ink-render.js           # Post-processing garis tinta / outline (JSInkRender)
│   ├── style.css               # Stylesheet utama game (tema kertas hangat, HUD, dialog, peta, kompendium)
│   ├── nations.css             # Stylesheet kompendium Lima Bangsa
│   └── atlas.css               # Stylesheet halaman Atlas Visual
├── assets/
│   ├── portraits/              # 14 portrait dialog resmi (1024×1024 .webp) + alias nama baru & lama
│   ├── webp/                   # 29 lembar konsep visual audit (.webp)
│   ├── world/                  # Ilustrasi wilayah (.webp), peta-100-simpul.webp, peta-lembah.svg, & sub-folder nations/
│   ├── icons/                  # 24 ikon vektor UI (.svg)
│   └── models/                 # 24 ekspor statis .glb & validation.json
├── tools/
│   ├── build.cjs               # Memvalidasi JSON/dialog, membundle data/game-data.js, membuat peta-lembah.svg & halaman QA
│   └── serve.cjs               # Server HTTP statis lokal (port 4173)
└── tests/
    ├── canon.cjs               # Uji kepatuhan kanon (nama rantai penjaga, 2 lokasi jejak, batas info Hemira, VO mati)
    ├── quest.cjs               # Uji seluruh 16 cabang questline, validasi save/load di tiap langkah, & migrasi save lama
    ├── test.cjs                # Uji fisika, kolisi, batching mesh, anggaran geometri, & keberadaan seluruh aset HTML/CSS
    └── quest-navigation.cjs    # Simulasi bot berjalan kaki melalui seluruh 29 target quest di rute safe & fast tanpa nyangkut
```

---

## 6. Panduan Kerja & Aturan Emas untuk AI Agent Berikutnya

Jika Anda adalah AI Agent yang ditugaskan melanjutkan pengembangan proyek ini (misalnya membuat **Bab 1: Dusun Sela & Padang Salkara**, menambah quest, memodifikasi UI, atau memperbarui dialog), patuhi **7 Aturan Emas** berikut:

1. **Jangan MengubahFile `data/game-data.js` Secara Manual:**
   - Selalu edit berkas sumber di `data/*.json` atau `data/dialogue/*.json`, lalu jalankan:
     ```bash
     node tools/build.cjs
     ```
   - Skrip `tools/build.cjs` akan memvalidasi keutuhan *node* dialog dan kesesuaian `actions` antara `data/quests.json` dan `data/dialogue/*.json`, lalu menghasilkan ulang `data/game-data.js`, `assets/world/peta-lembah.svg`, `pos-batu-biru.html`, `tests/visual.html`, dan `tests/playthrough.html`.

2. **Pertahankan ID Internal (`maren`, `bulamat`, `dorin`, `orsa`, `wirna`, `dahan`, `hesta`):**
   - Fungsi 3D seperti `JSArt.character('maren')` atau `JSArt.character('bulamat')` serta validasi di `src/core.js` dan `tests/*.cjs` bergantung pada ID internal tersebut. Gunakan nama baru (**Marsiyah**, **Bu Lamit**, **Tiwano**, **Orsuk**, **Wilanu**, **Dalumi**, **Hemira**) pada properti `name`, `speaker`, `npc`, `title`, dan `text`.

3. **Semua Aset Gambar Wajib Berformat `.webp` (atau `.svg` untuk Ikon/Peta Vektor):**
   - Jangan menambahkan berkas `.png` atau `.jpg` mentah. Seluruh *portrait* (`assets/portraits/`), ilustrasi dunia (`assets/world/`), dan lembar konsep (`assets/webp/`) menggunakan `.webp` agar ukuran repositori ringan dan cepat dimuat.

4. **Jaga Invarian Validasi Save (`State.validate` di `src/core.js`):**
   - `State.validate()` memeriksa konsistensi antara `questIndex`, `history`, `notes`, `completed`, `capSaksi`, `witnesses`, dan `dialogueProgress`. Jika Anda menambah langkah quest baru di `data/quests.json`, pastikan aturan di `State.expected(v)` tetap sinkron.

5. **Patuhi Batas Informasi Misteri (*Spoiler Guard* di Bab 0):**
   - Pada Bab 0, pemain **belum mengetahui** bahwa suara di batu uji bangunan 009 adalah milik **Hemira** (pelat inspeksi tahun 58 sudah aus namanya), dan **belum mengetahui** bahwa pantulan jauh di lempeng 009 adalah **Roh Sahdan**. `tests/canon.cjs` secara eksplisit menguji bahwa string `"Hemira"` atau `"Hesta"` tidak bocor di dalam `data/dialogue/test_stone.json`.

6. **Pastikan Medan Tetap Dapat Dilalui Tanpa Teleportasi:**
   - Setiap perubahan koordinat di `data/world.json` atau penambahan *blocker* di `src/world.js` / `src/quest-world.js` harus diuji dengan `node tests/quest-navigation.cjs` yang menyimulasikan karakter berjalan kaki melewati ke-29 langkah dari awal hingga akhir.

7. **Selalu Jalankan Keempat Suite Pengujian Sebelum Menyelesaikan Tugas:**
   ```bash
   node tools/build.cjs
   node tests/canon.cjs
   node tests/quest.cjs
   node tests/test.cjs
   node tests/quest-navigation.cjs
   ```
   Semua perintah di atas harus menghasilkan **PASS 100% (exit code 0)**.

---

## 7. Peta Jalan Pengembangan Selanjutnya (Bab 1 – Bab 5)

Fondasi data di `data/canon.json` dan `assets/portraits/` sudah menyiapkan tokoh dan lore untuk babak-babak berikutnya sesuai [`docs/STORY-BIBLE.md`](STORY-BIBLE.md):
- **Bab 1 — Dusun Sela & Padang Salkara (Cirusia):** Menemui **Nenek Ima** (`08-ima.webp`), menyeberang ke Padang Salkara bersama pengawal **Orsuk** dari **Panji Balkut** (`10-orsa.webp`), dan menghadapi sidang terbuka **Tujuh Panji** (`Gorkan`, `Dolgak`, `Sarbuk`, `Balkut`, `Tumran`, `Ulmar`, `Kadum`) yang berakhir buntu 3–3–1. Nara berjanji kembali membawa bukti; **Cap Cirusia belum diberikan pada Bab 1**.
- **Bab 2 — Cirusia dan Pegunungan Silin (Tseren):** Menyelidiki Batu Tepi Salkara, membawa bukti dan pengakuan ke sidang untuk memperoleh **Cap Cirusia**, lalu menelusuri Rumah Naskah di Desa Kertas Awan, menghadapi ketegangan **Aliran Murni** vs **Aliran Selaras**, dan membandingkan naskah asli dengan tinta gaung untuk **Cap Saksi ketiga**.
- **Bab 3 — Kepulauan Lamuna & Bandar Lada (Bahtari):** Menemui **Tiwano** (`06-dorin.webp`), menelusuri jejak kontrak *Utang Kabar* ayah Nara (**Tarun**, `07-tarun.webp`), dan berhadapan dengan monopoli Rumah Dagang.
- **Bab 4A — Lulan Tua; Bab 4B — Benteng Tata:** Memasuki Rumah Jejak di Lulan Tua dan memahami kode surat, lalu berunding dengan Yang Tetua **Taluk** di Benteng Tata. Pengetahuan diperoleh dengan membandingkan jawaban **Roh Wilanu** (`12-wirna.webp`), **Roh Dalumi** (`13-dahan.webp`), dan **Suara Hemira** (`14-hesta.webp`).
- **Bab 5 — Menara Simpul Keseratus (Gerbang Surut):** Setelah pertemuan Roh Sahdan di pusat pada Bab 4A serta persiapan Benteng pada Bab 4B, keputusan akhir pelepasan beban **Bejana Batu** melalui salah satu dari tiga akhir cerita kanon.
