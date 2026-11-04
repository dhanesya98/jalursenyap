# Jalur Senyap — Game Design & Build Brief (Demo)

*Judul kerja. Dokumen ini punya dua fungsi: pegangan kreatif untuk dunia dan ceritanya, serta brief teknis yang bisa ditempel ke Codex atau Antigravity untuk membangun demo.*

## 1. Ringkasan

**Jalur Senyap** adalah game petualangan third-person tentang seorang kurir muda yang mengantar surat dan paket antar bangsa di dunia fantasi. Jalur dagang kuno yang dulu menghubungkan semua peradaban kini sebagian padam, dan tugas sang kurir adalah menghidupkannya lagi, satu pos demi satu pos.

**Pilar desain**

1. **Perjalanan adalah gameplay.** Kedalaman datang dari level design dan traversal, bukan dari combat atau statistik.
2. **Dunia bernapas.** Ada hari hangat dan hari berat. Dunianya tidak selalu ramah, dan itu bagian dari pesonanya.
3. **Pengantaran adalah cerita.** Setiap paket membuka kisah kecil penerimanya, dan semuanya menyambung ke satu misteri besar.
4. **Tanpa combat, tanpa grinding, tanpa crafting.** Progres berasal dari eksplorasi, reputasi, dan cerita.
5. **Terinspirasi prinsip Silk Road, sepenuhnya fantasi.** Yang dipinjam adalah jaringan, pertukaran, dan kepercayaan antar budaya, bukan sejarahnya.

## 2. Tone dan rasa dunia

**Referensi:** kehangatan keseharian ala Ghibli, rasa petualangan dan dunia yang luas serta tua ala Lord of the Rings dan Harry Potter, serta sisi dunia yang tidak selalu ramah dan penuh politik antar bangsa ala Game of Thrones. Dari GoT yang diambil adalah *keras dan rumitnya dunia*, bukan kekerasan eksplisit, supaya tetap nyaman dimainkan siapa saja.

### Sistem Cuaca Hari

Setiap hari pengantaran punya **kondisi hari** yang mengubah suasana sekaligus cara bermain:

| Kondisi | Visual dan musik | Efek gameplay | Efek cerita |
| --- | --- | --- | --- |
| **C****e****ra****h** | Cahaya keemasan, musik hangat | Jalur lebih lapang, traversal lebih mudah | NPC ramah, dialog tambahan, hadiah kecil |
| **B****e****r****kabut** | Visibilitas pendek, musik sunyi | Landmark sulit dilihat, harus mengandalkan peta dan pendamping | NPC berhati-hati, banyak bisik dan rumor |
| **B****adai** | Langit gelap, angin, musik tegang | Beberapa jalur tertutup, glide sulit, harus cari rute alternatif | NPC tertutup atau curiga, ada risiko paket rusak |
| **Malam ****T****en****ang** | Biru gelap, cahaya bulan, cahaya lentera | Rute berbeda yang hanya muncul malam | Kisah yang tidak diceritakan di siang hari |

Prinsipnya: hari berat tidak menghukum pemain, tetapi membuat perjalanan terasa *berarti*. Setelah melewati hari berat, hari hangat berikutnya terasa seperti hadiah.

## 3. Dunia

Dunia dibangun di sekitar satu jalur panjang yang menghubungkan lima bangsa fantasi. Masing-masing terinspirasi dari *prinsip* peran bangsa-bangsa di jalur dagang kuno, tetapi sepenuhnya diciptakan ulang.

| Bangsa | Habitat | Peran di jalur | Rasa budaya |
| --- | --- | --- | --- |
| **Asharim** | Gurun dan oasis berkubah | Pedagang dan penjaga caravanserai | Ramah tapi penuh tata krama tawar-menawar, bahasa penuh peribahasa |
| **Tseren** | Pegunungan berkabut | Penenun kain dan pembuat kertas ajaib | Pendiam, teliti, percaya bahwa tulisan menyimpan jiwa |
| **C****ir****usia** | Stepa dan dataran angin | Penunggang pengawal karavan | Bebas, lugas, memegang janji lebih dari hukum |
| **P****a****h****ita****n** | Pelabuhan dan kepulauan rempah | Pelaut dan pedagang rempah | Riuh, penuh musik, selalu membawa kabar dari seberang |
| **W****a****r****j****ia****n** | Reruntuhan menara relay | Dulu penjaga pos kuno, kini hampir punah | Melankolis, menyimpan rahasia jalur |

**Wilayah demo:** Lembah Pasir milik Asharim, dengan caravanserai bernama **Pos Batu Biru** sebagai hub.

## 4. Cerita

### Premis

Dahulu ada **seratus Simpul**, menara relay yang mengalirkan **Gema**, sihir yang membawa kabar, suara, dan ingatan antar bangsa. Pada peristiwa yang disebut **Hari Senyap**, Simpul-simpul itu padam satu per satu. Bangsa-bangsa terpisah, kabar terputus, dan kecurigaan tumbuh. Kini hanya para kurir yang menghubungkan dunia, dengan berjalan kaki.

### Tokoh

- **Nara** (protagonis, bisa dibuat dapat dipilih sebagai laki-laki atau perempuan). Kurir magang yang mewarisi tas kurir tua milik kurir legendaris. Rendah hati, penasaran, keras kepala.
- **Maren** (Asharim). Kepala Pos Batu Biru dan mantan kurir senior. Hangat di luar, menyimpan penyesalan.
- **Ruru**. Makhluk kecil berbulu yang menemani Nara. Hanya penunjuk arah dan penghibur, bukan petarung.
- **Dewan Tol**. Guild pedagang yang diuntungkan karena jalur terputus. Bukan penjahat murni, dan alasannya masuk akal.

### Misteri utama

Sebuah **surat bersegel dari Simpul Pertama** tidak pernah sampai ke tujuannya. Surat itu ada di dalam tas kurir yang diwarisi Nara. Siapa pengirimnya, kenapa tidak pernah dikirim, dan apa hubungannya dengan Hari Senyap adalah benang merah seluruh game.

### Struktur tiga babak (gambaran besar)

1. **Babak 1, Menyalakan kembali.** Nara belajar menjadi kurir, menghidupkan Simpul pertama, dan menyadari surat itu penting.
2. **Babak 2, Menyusuri jalur.** Tiap bangsa memberi potongan misteri. Kepercayaan dibangun dan diuji, ada pengkhianatan kecil dan kesalahpahaman antar budaya.
3. **Babak 3, Surat sampai.** Terungkap bahwa Hari Senyap bukan bencana alam. Pilihan terakhir Nara menentukan jalur itu dibuka kembali untuk semua, atau dikendalikan sebagian pihak.

## 5. Cakupan demo (vertical slice)

**Target:** 15 sampai 20 menit bermain. Satu wilayah, tiga pengantaran, satu kondisi Badai, satu cliffhanger.

### Alur demo

1. **Pembuka (hangat).** Nara tiba di Pos Batu Biru. Maren memberi tugas pertama dan mengajarkan kontrol dasar.
2. **Pengantaran 1, Roti Rempah (Cerah).** Antar roti ke penjaga menara di bukit. Tutorial traversal: lari, lompat, glide. NPC ramah, dialog panjang, rute santai.
3. **Pengantaran 2, Lagu untuk Oasis (Berkabut).** Bawa sebuah lagu (item cerita) ke keluarga di oasis. Pemain belajar membaca landmark dan peta. Mekanik baru: **Kait Tali** untuk membuka jalan pintas.
4. **Pengantaran 3, Surat Bersegel (Badai).** Melewati badai pasir menuju Simpul yang padam. Jalur utama tertutup, harus memakai rute alternatif dan Kait Tali. Di akhir, Nara menyalakan Simpul dan Gema pertama muncul dengan sebuah suara dari masa lalu.
5. **Penutup.** Cliffhanger: Gema menyebut nama Nara.

### Contoh dialog (nada acuan)

> **Maren:** Jalan itu panjang, Nara. Tapi tiap surat yang sampai membuatnya sedikit lebih pendek.

> **Penjaga menara:** Roti ini masih hangat? Bahkan angin pun segan merusaknya. Kamu kurir yang baik.

> **Maren (Badai):** Hari ini langit sedang tidak ramah. Kalau kamu memilih berangkat, itu bukan keberanian bodoh, asal kamu tahu kapan harus berhenti.

## 6. Spesifikasi gameplay

**Pergerakan**

- Lari, lompat, dan **glide** dengan jubah layar. Tidak ada stamina rumit, hanya durasi glide pendek yang terisi saat menyentuh tanah.
- Panjat tepian (ledge) sederhana, hanya pada permukaan yang ditandai.
- Alat untuk demo: **Kait Tali**, mengait titik yang ditandai untuk berayun atau menarik diri ke atas, dan Tangga Tali, struktur yang dipasang pemain dan tetap ada (lihat bagian 13.3).

**Interaksi dan sistem**

- **Tas kurir** sebagai ikon dan inventory. Isinya hanya paket aktif, surat, dan item cerita, tanpa crafting.
- **Jurnal pengantaran**: daftar tugas, penerima, dan potongan cerita.
- **Reputasi per bangsa**: bukan angka yang digrind, tetapi tingkat kepercayaan yang naik dari pilihan dan pengantaran. Reputasi membuka pos, dialog, dan jalur baru.
- **Kondisi paket**: paket rapuh bisa rusak jika jatuh dari ketinggian tertentu atau terkena badai, tetapi tidak ada game over, hanya konsekuensi cerita.
- **Checkpoint** di setiap pos dan titik penting. Jatuh atau gagal hanya mengulang dari checkpoint terdekat tanpa hukuman.

**Tidak ada di demo:** combat, crafting, level karakter, ekonomi uang, multiplayer.

## 7. Spesifikasi teknis (untuk coding agent)

**Engine:** belum ditentukan. Bagian ini sengaja ditulis netral supaya bisa dipakai di engine apa pun yang dipilih. Syarat utamanya: proyek berbasis file yang bisa dibaca dan diedit coding agent dengan andal.

**Struktur folder**

```
project/
  AGENTS.md
  levels/      pos_batu_biru, lembah_pasir, simpul_01
  player/      controller, camera, glide, grapple
  systems/     weather_manager, delivery_manager,
               reputation, save_system
  ui/          dialogue_box, journal, hud
  props/       package, grapple_point, checkpoint
  data/
    dialogue/  *.json
    deliveries.json
    weather.json
  assets/      (CC0 / placeholder)
```

**Aturan teknis**

- Semua konten cerita (dialog, daftar pengantaran, kondisi hari) disimpan di **file JSON di folder data**, bukan ditulis langsung di kode.
- Satu modul, satu tanggung jawab. Komunikasi antar sistem lewat event, bukan saling memanggil langsung.
- Pakai **placeholder geometri** (balok, silinder, dan bola sederhana) lebih dulu. Seni dan aset diganti belakangan.
- Aset pihak ketiga hanya yang berlisensi bebas (CC0) dan dicatat sumbernya di `assets/CREDITS.md`.
- Setiap milestone harus bisa dijalankan dan dites sebelum lanjut ke berikutnya.

## 8. Rencana milestone dan prompt

Bangun **bertahap**. Agen coding jauh lebih andal bila diberi satu milestone jelas dengan kriteria selesai, dibanding satu perintah raksasa.

### Prompt master (simpan sebagai AGENTS.md)

```
Kamu membantu membangun demo game 3D third-person berjudul
"Jalur Senyap".

Konsep: kurir muda di dunia fantasi bernuansa jalur dagang kuno,
mengantar surat dan paket antar bangsa. TIDAK ADA combat, crafting,
atau grinding. Fokus pada traversal (lari, lompat, glide, kait tali),
level design, dan cerita lewat pengantaran.

Aturan:
- Engine dan bahasa pemrograman mengikuti pilihan pemilik proyek;
  tanyakan bila belum jelas.
- Konten cerita ada di data/*.json, bukan di kode.
- Gunakan placeholder geometri dulu, aset belakangan.
- Satu modul satu tanggung jawab, komunikasi lewat event.
- Setiap milestone harus bisa dijalankan tanpa error.
- Setelah selesai tiap milestone, jelaskan apa yang berubah dan
  cara mengetesnya.
- Jangan menambah fitur di luar milestone yang diminta.
```

### Milestone

**M1. Controller dan kamera.** Proyek baru, level uji sederhana (gray-box), karakter yang bisa lari, lompat, dan glide dengan kamera third-person yang halus. *Selesai bila:* bergerak terasa enak di level uji berisi tangga, jurang kecil, dan platform tinggi.

**M2. Interaksi dan dialog.** Ambil dan serahkan paket, kotak dialog yang membaca JSON, jurnal pengantaran sederhana. *Selesai bila:* satu pengantaran penuh bisa dimainkan dari menerima tugas sampai menyerahkan paket.

**M3. Level gray-box demo.** Pos Batu Biru, rute ke menara, oasis, dan Simpul padam, lengkap dengan checkpoint dan titik Kait Tali. *Selesai bila:* seluruh alur demo bisa dilalui dengan geometri placeholder.

**M4. Sistem Cuaca Hari.** Tiga kondisi (hangat, berkabut, badai) yang mengubah pencahayaan, kabut, partikel, dan menutup atau membuka rute tertentu. *Selesai bila:* pengantaran 3 terasa berbeda jelas dari pengantaran 1.

**M5. Konten cerita dan reputasi.** Semua dialog dan tiga pengantaran dimasukkan ke JSON, reputasi dasar, save system di checkpoint. *Selesai bila:* demo bisa dimainkan dari awal sampai cliffhanger dengan cerita lengkap.

**M6. Visual, audio, dan polish.** Ganti placeholder dengan aset CC0 atau aset buatan sendiri, tambahkan musik dan efek suara, color grading bergaya, lalu export build. *Selesai bila:* demo layak ditunjukkan kepada orang lain.

## 9. Risiko dan saran jujur

1. **Kamera dan rasa gerak 3D adalah bagian tersulit.** Agen coding sering menghasilkan kontrol yang berfungsi tetapi kurang terasa enak. Siapkan waktu untuk menyetel angka (kecepatan, gravitasi, durasi glide) secara manual, dan jangan menganggap M1 selesai sebelum kamu sendiri puas memainkannya.
2. **Seni adalah beban kerja sebenarnya.** Kode bisa dibantu agen, tetapi nuansa Ghibli dan petualangan epik datang dari pencahayaan, warna, komposisi, dan aset. Rencanakan waktu untuk ini di M6, dan anggap M1 sampai M5 sebagai fondasi teknis.
3. **Jangan memperluas scope sebelum demo selesai.** Satu wilayah, tiga pengantaran. Ide tambahan masuk daftar ke depan, bukan ke demo.
4. **Jalur cadangan.** Jika 3D terasa terlalu berat setelah M1 sampai M2, versi 2.5D atau 2D side-scrolling dengan cerita dan sistem hari yang sama jauh lebih mudah dibangun dan dilihat, tanpa mengubah jiwa gamenya.
5. **Uji dengan orang lain lebih awal.** Setelah M3, minta dua atau tiga orang mencoba tanpa penjelasan. Dari situ kelihatan apakah traversal dan petunjuk arahnya cukup jelas.

## 10. Nama dan istilah dunia

Dunianya bernama **Tanah Lintas**, dan jalur utamanya dulu disebut **Jalur Gema**, kini **Jalur Senyap**. Nama bangsa mengikuti pilihanmu (Cirusia dan Pahitan dipertahankan), lalu sisanya dilengkapi dengan gaya yang sama: bunyi yang terasa seperti gema budaya nyata, tetapi diciptakan ulang.

| Bangsa | Wilayah | Tempat penting | Sapaan khas |
| --- | --- | --- | --- |
| **Asharim** | Lembah Pasir | Pos Batu Biru, Telaga Sumi, Menara Batu Senja | “Teduh di jalanmu.” dijawab “Air di langkahmu.” |
| **Tseren** | Pegunungan Kabut Lirih | Desa Kertas Awan | “Tinta tenang.” dijawab “Kata terjaga.” |
| **Cirusia** | Padang Bayu | Perkemahan Tujuh Panji | “Angin searah.” dijawab “Janji sampai.” |
| **Pahitan** | Kepulauan Lada Biru | Bandar Lada | “Pasang baik!” dijawab “Layar penuh!” |
| **Warjian** | Reruntuhan Hening | Menara relay lama | “Hening menyertai.” (tidak dibalas, hanya mengangguk) |

| Istilah | Arti |
| --- | --- |
| **Simpul** | Menara relay penyalur Gema. Ada seratus, dinamai dengan nomor (Simpul Pertama, Simpul Sembilan) |
| **Gema** | Sihir pembawa kabar, suara, dan ingatan |
| **Hari Senyap** | Peristiwa padamnya Simpul-simpul |
| **Pos Singgah** | Caravanserai, tempat istirahat dan hub di jalur |
| **Ikatan Pengantar** | Persekutuan para kurir |
| **Nama Baik** | Sistem reputasi per bangsa |
| **Buku Jalur** | Jurnal penemuan: rute, rumor, kebiasaan tiap bangsa |
| **Tas Pengantar, Jubah Layar,  Tali**** ****K****ait** | Tas kurir, jubah untuk glide, dan gadget kait |
| **Kerang Suara** | Wadah lagu atau pesan yang tidak boleh dibuka di perjalanan |
| **Dewan Tol** | Guild pedagang pengatur pos tol |

**Tokoh tambahan:** **Sahdan** (kurir legendaris, pemilik tas sebelum Nara), **Juma** (penjaga Menara Batu Senja), **Bu Lamat** (penerima lagu di Telaga Sumi), dan **Kesa** (petugas Dewan Tol).

## 11. Skrip dialog demo

Nada penulisan: kalimat pendek, peribahasa ringan pada Asharim, kehangatan yang jujur di hari cerah, dan kata-kata yang lebih tertahan saat Badai. Pilihan dialog hanya mengubah nada dan Nama Baik, bukan jalan cerita.

### Adegan 1. Tiba di Pos Batu Biru (Cerah)

*Nara melewati gerbang Pos Singgah. Ruru melompat keluar dari tas dan mengendus udara.*

**Maren:** Berhenti di situ. Tas itu. Kamu tahu siapa pemilik sebelumnya?

**Nara:** Kata orang desa, kurir yang paling banyak mengantar surat sepanjang jalur. Namanya Sahdan.

**Maren:** Memang Sahdan. Dan dia tidak pernah mengeluh soal bahu pegal. *(tersenyum)* Selamat datang di Pos Batu Biru, Nara. Teduh di jalanmu.

**Nara:** Air di langkahmu.

**Maren:** Kamu paham sopan santun juga. Bagus. Tugas pertamamu ringan: roti rempah untuk Juma di Menara Batu Senja. Dia bilang rotiku harus sampai selagi hangat, atau dia akan mengadu ke seluruh pos.

*(Tutorial gerak: lari dan lompat. Ruru berlari di depan menunjukkan arah.)*

**Maren:** Ikuti Ruru kalau bingung. Dia tidak bisa membaca peta, tapi dia tidak pernah tersesat.

### Adegan 2. Roti Rempah (Cerah)

*(Tutorial glide di sepanjang bukit. Nara tiba di menara.)*

**Juma:** Roti itu masih hangat? Bahkan angin pun segan merusaknya. Kamu kurir yang baik.

**Nara:** Bu Maren bilang Anda akan mengadu kalau terlambat.

**Juma:** Itu cara kami bilang rindu. *(menatap tas Nara)* Tas itu. Aku kenal jahitannya. Sahdan membawa tas yang sama waktu terakhir lewat sini, tepat sebelum Hari Senyap.

**Nara:** Anda tahu apa yang terjadi padanya?

**Juma:** Aku tahu dia membawa sesuatu yang tidak mau dia sebut. Tanyakan pada Maren, tapi pelan-pelan. Dia tidak suka diburu.

*Pilihan:*

- **A. “Aku akan bertanya pelan-pelan.”** Juma: “Itu baru kurir sejati.” (Nama Baik Asharim naik)
- **B. “Aku akan tanya sekarang juga.”** Juma terkekeh: “Anak muda. Semoga angin sedang baik padamu.” (tanpa konsekuensi, hanya nada)

### Adegan 3. Lagu untuk Telaga Sumi (Berkabut)

*Kabut turun di Pos Batu Biru. Maren menyerahkan sebuah kerang kecil.*

**Maren:** Kerang Suara. Di dalamnya ada lagu pengantar tidur dari seseorang di Pahitan untuk keluarganya di Telaga Sumi. Lagunya bertahan selama kerangnya tidak dibuka, jadi jangan dibuka dan jangan dijatuhkan.

**Nara:** Dan kalau jatuh?

**Maren:** Lagunya jadi lain. Kadang lebih sedih, kadang lebih indah. Tapi bukan yang dikirim. *(menyerahkan gulungan tali berkait)* Ini Kait Tali. Jembatan sisi barat runtuh sebelum musim hujan, tapi tebing di atasnya masih punya titik kait.

*(Tutorial Kait Tali. Kabut menyembunyikan landmark. Ruru menunjuk arah.)*

**Pedagang di jalan:** Kau kurir Batu Biru? Dengar-dengar Simpul Sembilan padam bukan karena rusak. Ada yang sengaja memadamkannya.

**Nara:** Siapa yang rugi kalau jalurnya mati?

**Pedagang di jalan:** Itu pertanyaan yang tidak ditanyakan orang yang ingin tetap berdagang.

*(Nara tiba di Telaga Sumi dan menyerahkan kerang.)*

**Bu Lamat:** Kerang ini, dari Pahitan? Dia berjanji akan mengirim lagu untuk cucu-cucunya sebelum pelayaran terakhir. *(mendekatkan kerang ke telinga; lagu pelan terdengar)* Nadanya meleset di bagian akhir.

**Nara:** Maaf, mungkin karena kabut tadi.

**Bu Lamat:** Bukan. Dia memang selalu meleset di bagian itu. Terima kasih, Nak. Kamu mengantar lebih dari yang kamu tahu.

*Pilihan:*

- **A. “Boleh aku mendengarnya sekali?”** Bu Lamat mengizinkan. Lagunya tercatat di Buku Jalur.
- **B. “Aku harus segera kembali.”** Bu Lamat mengangguk: “Jalan pulang bukan musuh, hanya panjang.”

**Bu Lamat:** Kalau kamu ke timur, hati-hati dengan petugas Tol. Mereka sedang gelisah.

### Adegan 4. Surat Bersegel (Badai)

*Malam. Badai menggeram di luar Pos. Maren menatap tas Nara.*

**Maren:** Aku tidak menyuruhmu membuka bagian dalam tas itu. Tapi ada yang berpendar di sana.

**Nara:** Surat ini berdenyut seperti jantung.

**Maren:** Itu segel Simpul Pertama. Sahdan membawanya sebelum Hari Senyap dan tidak pernah sampai ke tujuan. Dia menitipkannya padaku, lalu pergi dan tidak kembali. *(jeda)* Aku tidak pernah berani mengantarnya sendiri.

**Nara:** Kenapa sekarang? Kenapa aku?

**Maren:** Karena tas itu memilihmu. Belum pernah terjadi pada siapa pun sejak dia.

*Pilihan:*

- **A. “Aku berangkat sekarang.”** Maren: “Berani, tapi dengarkan. Kalau angin menyapu dua kali, berhenti dan tunggu.”
- **B. “Aku butuh waktu sebentar.”** Maren: “Badai tidak menunggu, Nara. Tapi aku akan menunggumu.”

*(Nara berangkat. Di pos tol, hujan pasir menampar dari samping.)*

**Kesa:** Jalur timur ditutup. Perintah Dewan. Badai atau bukan.

**Nara:** Aku membawa surat bersegel. Ini tidak bisa menunggu.

**Kesa:** *(merendahkan suara)* Aku tidak punya masalah denganmu, Kurir. Tapi aku diperintah untuk tidak membiarkan siapa pun mencapai Simpul Sembilan. Siapa pun.

**Nara:** Kenapa Dewan takut pada menara yang padam?

**Kesa:** Siapa bilang takut? *(menoleh ke arah lain)* Ada jalan lewat tebing utara. Aku tidak melihatmu mengambilnya.

*(Rute alternatif: tebing utara, Kait Tali, badai pasir. Jalur utama tertutup. Nara tiba di Simpul Sembilan.)*

*Nara menempelkan surat pada pusat Simpul. Lentera-lentera menyala satu per satu. Gema bergetar.*

**Suara dalam Gema (terputus-putus):** ...kalau kamu mendengar ini, berarti suratnya akhirnya mulai berjalan.

**Suara dalam Gema:** ...jangan percaya pos yang menyala terlalu terang...

**Suara dalam Gema:** ...Nara. Kamu seharusnya belum sampai di sini.

*(Layar menggelap. Ruru bersuara cemas. Muncul judul: JALUR SENYAP.)*

## 12. Art direction

Arah visual direvisi: **garis tinta halus dan bidang warna datar ala Moebius (Jean Giraud)**, dengan lanskap luas dan sunyi seperti dalam karya-karyanya. Dunia dan karakter 3D memakai kontur tinta tipis dan warna datar dengan gradasi lembut, sedangkan latar jauh berupa ilustrasi 2D bergaya Moebius. Kesannya: sunyi, luas, aneh tapi indah. Kehangatan tetap ada, dan hadir paling kuat di pos singgah, kota, dan pertemuan dengan karakter, sebagai kontras terhadap lanskap luas yang sunyi (lentera, kain, makanan, cahaya). Studio Ghibli menjadi pasangan Moebius untuk kehangatan dan kehidupan dunia: detail keseharian yang hidup, langit dan awan yang indah, perhatian pada alam, serta tokoh yang hangat. Thunder Lotus tetap menjadi rujukan emosi karakter dan interior pos. **Death Stranding diambil untuk eksplorasi dan traversal, bukan untuk visual** (lihat bagian 13.2).

### 12.1 Prinsip visual

1. **Garis adalah tulang punggung.** Kontur tinta tipis dan konsisten pada karakter, struktur, dan batuan, dengan hatching (arsiran) untuk bayangan dan tekstur.
2. **Warna datar dan hemat.** Bidang warna luas dengan gradasi halus ala airbrush, sedikit warna per adegan, dan saturasi dunia dijaga rendah sampai menengah. Warna jenuh dipakai hanya untuk lentera, kain, dan Gema.
3. **Skala dan kekosongan.** Lanskap luas dan sepi, manusia kecil, horizon jauh, dengan ruang kosong yang disengaja. Keheningan adalah bagian dari desain.
4. **Satu titik fokus yang mengundang.** Selalu ada landmark atau cahaya lentera yang menarik pemain ke depan.
5. **Aneh tapi logis.** Bentuk dan makhluk fantasi yang ganjil tetap punya aturan dan fungsi yang jelas, bukan sekadar ornamen.
6. **Kehangatan sebagai hadiah.** Dunia luasnya tenang dan agak pudar, tetapi pos singgah, karakter, dan keseharian dipenuhi detail hangat ala Ghibli (makanan, kain, cahaya lentera), sehingga kehangatan terasa berarti.

### 12.2 Referensi dan apa yang diambil

| Referensi | Yang diambil | Yang tidak diambil |
| --- | --- | --- |
| Moebius (Arzach, Blueberry) | Garis tinta halus, hatching, bidang warna datar, langit pastel, arsitektur dan makhluk aneh, pengelana sunyi | Tema dewasa dan psikedelik yang terlalu jauh dari nada game ini |
| Outer Wilds | Bentuk sederhana yang terbaca, cahaya dramatis | Palet kosmik dan nuansa sci-fi |
| Journey | Cahaya di bukit pasir, kain yang mengalir | Tanpa dialog sama sekali |
| Studio Ghibli dan Thunder Lotus | Kehangatan keseharian, detail kecil yang hidup, langit dan awan, perhatian pada alam, serta emosi karakter dan interior pos | Gaya karakter anime yang mulus dan animasi 2D frame-by-frame |

### 12.3 Palet

Palet dasar mengikuti empat kondisi hari yang sudah ada di papan suasana. Saturasi dunia dijaga rendah sampai menengah, sehingga satu warna jenuh berfungsi sebagai penanda di semua kondisi: **kuning lentera (#F2C46B)**. Warna ini menandai Simpul, checkpoint, titik kait, dan tujuan pengantaran, sehingga pemain belajar membaca dunia lewat cahaya.

| Kondisi | Warna utama | Keterangan |
| --- | --- | --- |
| Cerah | #F6D9A0, #F2A64B, #D18B4F, #7A4A32 | Emas, lapang, ramah |
| Berkabut | #CBD3D6, #9AA7AD, #7F8E96, #5B6A73 | Pudar, sunyi, penuh bisik |
| Badai | #4A4A57, #34343F, #8A5A45, #C79A6B | Gelap, berpasir, tidak ramah |
| Malam Tenang | #1F2A4A, #2F3F66, #E8EEF8, #F2C46B | Biru dalam, lentera hangat |

**Langit Moebius**, aksen pastel untuk kondisi Cerah dan peralihan fajar atau senja (hindari pada Badai):

| Warna | Hex | Dipakai untuk |
| --- | --- | --- |
| Turquoise pucat | #8FD3D1 | Langit Cerah, fajar |
| Lilac | #C9B8E8 | Senja, bayangan langit |
| Peach | #F2C4A0 | Cakrawala Cerah |
| Merah muda debu | #E3A6B4 | Awan senja |

Aksen warna tiap bangsa, dipakai pada kain, arsitektur, dan ornamen:

| Bangsa | Aksen | Rasa |
| --- | --- | --- |
| Asharim | #3D6E8F biru batu, #C86A3C terakota | Kokoh, hangat, penuh ubin dan kain |
| Tseren | #EDE6D3 kertas, #8FA68A hijau kabut | Tenang, bersih, rapuh |
| Cirusia | #A8452F merah tanah, #D9B45A rumput kering | Bebas, berangin, berani |
| Pahitan | #2E8B8B teal, #E07B39 jingga rempah | Riuh, basah, penuh aroma |
| **Warjian** | #6F7A68 lumut, #A6805A perunggu pudar | Tua, sunyi, retak |

### 12.4 Bahasa bentuk

- **Asharim:** kubah, lengkung, ubin geometris, kain yang menggantung dan berkibar.
- **Tseren:** atap bertingkat tipis, garis vertikal, lembaran kertas bergantung, jembatan tali.
- **Cirusia:** tenda bulat, panji, bentuk aerodinamis, ornamen spiral.
- **Pahitan:** layar, tiang miring, rumah panggung, bentuk gelombang.
- **Warjian:** menara retak, batu berlumut, bentuk monolit, simbol Gema yang pudar.

**Karakter**

- **Nara:** proporsi bergaya sekitar lima kepala, tangan dan kaki sedikit besar agar gerakan traversal terbaca. Siluet utamanya dibentuk oleh **Jubah Layar** dan **tas pengantar**, dua elemen yang harus langsung dikenali bahkan dari jauh.
- **Ruru:** siluet bulat berbulu dengan telinga besar dan ekor yang berpendar tipis kuning lentera, supaya mudah ditemukan saat kondisi Berkabut.
- **Karakter lain:** satu ciri besar per tokoh (topi Juma, selendang Bu Lamat, jubah tol Kesa) agar siluet mereka berbeda satu sama lain.

### 12.5 Pencahayaan per kondisi hari

| Kondisi | Cahaya | Atmosfer | Warna bayangan | Partikel |
| --- | --- | --- | --- | --- |
| Cerah | Matahari rendah, hangat, bayangan lembut tapi jelas | Debu emas tipis | Ungu hangat | Debu bercahaya, kelopak |
| Berkabut | Cahaya menyebar, kontras rendah, hampir tanpa bayangan tegas | Kabut berlapis tiga kedalaman | Biru abu | Butir embun |
| Badai | Datar dan gelap, dengan celah cahaya sesekali, kontras tinggi di dekat | Pasir melintang, langit menekan | Merah tua | Pasir horizontal, kain berkibar kencang |
| Malam Tenang | Bulan dan lentera sebagai sumber, rim light dingin | Udara jernih, bintang | Biru tua | Kunang-kunang, percikan Gema |

Aturan: perubahan antar kondisi harus terasa lewat **cahaya dan atmosfer terlebih dahulu**, baru geometri. Lentera tetap menjadi titik hangat di semua kondisi, termasuk hari paling berat.

### 12.6 Pipeline 3D painterly

- **Model:** low-poly bersih dengan bentuk besar yang berani. Detail kecil dilukis di tekstur, bukan dimodelkan.
- **Kontur tinta:** garis tipis berwarna gelap (bukan hitam pekat) pada siluet dan lipatan penting, dengan ketebalan konsisten. Objek dekat memakai garis sedikit lebih tebal dan objek jauh lebih tipis agar kedalaman terbaca.
- **Hatching:** arsiran tipis pada area bayangan batu, kain, dan bukit pasir, dibuat sebagai tekstur, bukan geometri.
- **Warna:** bidang datar dengan gradasi halus, tanpa material realistis. Satu atau dua nilai bayangan saja per material.
- **Atmosfer:** kabut dan penurunan kontras seiring jarak (aerial perspective) menjadi alat utama untuk memberi kesan skala.
- **Color grading:** satu preset per kondisi hari, diatur lewat tabel warna (LUT) agar perpindahan antar hari konsisten.

### 12.7 Latar 2D painterly

- **Lapisan:** langit, pegunungan jauh, awan atau kabut, dan bukit tengah, digambar sebagai ilustrasi bergaya Moebius dengan garis halus, bidang warna datar, dan langit pastel. Bergerak sangat pelan (parallax) dan **tidak pernah bisa dijangkau**.
- **Sambungan 3D ke 2D:** kontur dan palet latar disamakan dengan dunia 3D. Kabut atmosfer dan penurunan kontras seiring jarak menyatukan keduanya.
- **Struktur raksasa di kejauhan:** menara, kerangka makhluk besar, atau reruntuhan sebagai siluet di latar untuk memberi kesan dunia jauh lebih besar dari pemain.
- **Variasi:** satu set langit per kondisi hari untuk tiap wilayah.
- **Format:** panorama lebar dengan resolusi tinggi agar tidak pecah. Hindari objek yang bisa diinteraksi di dalam gambar.

### 12.8 UI dan tipografi

- **Konsep:** kertas dan tinta. **Buku Jalur** terasa seperti buku catatan perjalanan, lengkap dengan cap segel dan coretan tinta.
- **HUD:** nyaris tak terlihat. Cukup ikon lentera kecil sebagai arah tujuan dan indikator kondisi paket di tas.
- **Warna UI:** krem kertas #F3E9D2, tinta #2B2A33, aksen lentera #F2C46B, segel merah #A8452F.
- **Tipografi:** serif humanis yang bernuansa kaligrafi untuk judul, dan sans humanis yang sederhana untuk teks dialog supaya mudah dibaca.
- **Kotak dialog:** kertas lusuh dengan tepi tidak rata. Potret setengah badan 2D bergaya lukisan untuk karakter penting bersifat opsional tetapi sangat menambah kesan Thunder Lotus.

### 12.9 Prompt gaya dasar (untuk Flow atau generator gambar lain)

```
Moebius-inspired fantasy landscape illustration, fine ink
linework, cross-hatching, flat color planes with soft airbrush
gradients, vast quiet desert and mist, strange ancient
architecture, lone traveler with a heavy pack, [SCENE],
[DAY CONDITION], limited palette: [HEX COLORS], pastel sky
accents, no text, wide composition
```

Isi `[SCENE]`, `[DAY CONDITION]`, dan `[HEX COLORS]` dari bagian palet di atas. Pakai referensi gambar yang sama setiap kali agar gaya tetap konsisten.

### 12.10 Daftar cek konsistensi

- Apakah siluetnya terbaca tanpa warna?
- Apakah garisnya tipis, konsisten, dan memakai hatching untuk bayangan?
- Apakah warnanya datar dan hemat, dengan warna jenuh hanya pada lentera, kain, atau Gema?
- Apakah ada rasa skala dan ruang kosong yang disengaja?
- Apakah cahaya dan kondisi harinya jelas terasa?
- Apakah latar 2D menyatu dengan 3D lewat garis, palet, dan atmosfer?
- Apakah bangsa ini langsung dikenali dari bentuk dan aksen warnanya?

## 13. Referensi tambahan: Moebius dan Death Stranding

**Moebius** dan Studio Ghibli menjadi acuan utama untuk visual dan world building (bagian 12), sedangkan **Death Stranding** diambil untuk **eksplorasi dan traversal**: mengantar barang melintasi medan luas dan menyambung kembali dunia yang terputus. Targetnya: eksplorasi harus semenyenangkan Death Stranding. Bagian ini merinci apa yang diambil dari ketiganya dan bagaimana mencapainya.

### 13.1 Moebius (Jean Giraud): visual dan world building

**Yang diambil**

- **Pengelana sunyi di dunia yang luas.** Dalam karya seperti *Arzach*, sosok kecil menjelajahi lanskap aneh nyaris tanpa dialog. Ini cocok dengan Nara: banyak momen perjalanan tanpa kata, dan dunia yang bercerita lewat bentuknya.
- **Gurun dan reruntuhan yang asing tapi logis.** Arsitektur ganjil, menara, dan batu yang terasa seperti peninggalan peradaban lain. Cocok untuk Warjian, Simpul yang padam, dan Lembah Pasir.
- **Misteri tanpa penjelasan.** Dunia tidak menerangkan dirinya. Pemain menyusun sendiri dari petunjuk, sejalan dengan Buku Jalur.
- **Langit pastel yang berani.** Langit berwarna tak terduga di atas bumi berwarna tanah memberi kesan dunia lain yang tetap indah.
- **Makhluk dan kendaraan yang aneh.** Fauna dan flora fantastis memberi identitas pada tiap wilayah.

**Cara menerapkan di dunia**

- **Satu keanehan ekologis per wilayah** sebagai identitas. Saran awal: pohon kertas di Pegunungan Kabut Lirih, kawanan ikan terbang di Kepulauan Lada Biru, dan batu yang berdengung tertiup angin di Padang Bayu.
- **Reruntuhan Warjian menyiratkan sihir yang tidak sepenuhnya dipahami** bangsa-bangsa sekarang, sehingga ada rasa dunia yang lebih tua dari semua orang.
- **Struktur raksasa di kejauhan** (menara atau kerangka makhluk besar) sebagai siluet latar, untuk memberi kesan dunia jauh lebih besar dari pemain.

### 13.2 Death Stranding: traversal dan jaringan

Kemiripannya besar: keduanya tentang mengantar barang dan menghubungkan kembali komunitas yang terisolasi. Karena itu ini referensi terkuat untuk gameplay inti, sekaligus risiko kemiripan yang perlu dikelola.

**Yang diambil**

- **Medan sebagai tantangan utama.** Pemain membaca kemiringan, pijakan, dan arus, lalu memilih jalur. Tidak ada musuh, tetapi medan tetap memberi tegangan.
- **Perencanaan rute sebelum berangkat.** Di Pos Singgah, pemain membuka Buku Jalur dan memilih antara rute cepat tapi berisiko dan rute aman tapi panjang, tergantung kondisi hari.
- **Jalan yang dibuka tetap terbuka.** Jalan pintas yang dibuka dengan Kait Tali tetap ada untuk pengantaran berikutnya, sehingga pemain merasakan jalur dunia perlahan pulih.
- **Rasa terhubungnya dunia.** Tiap Simpul yang dinyalakan menyambung peta. Di peta muncul garis cahaya tipis antar Simpul dan NPC saling bertukar kabar.
- **HUD minimal dan keheningan.** Lanskap luas, dengan musik yang masuk pada momen tertentu, bukan terus-menerus.

**Yang dihindari**

- **Berjalan panjang yang monoton.** Ini kritik umum pada game bertema mengantar. Setiap rute harus punya variasi, landmark, dan imbalan di ujungnya. Aturan praktis awal: tidak ada segmen lari datar lebih dari sekitar 30 detik tanpa sesuatu yang baru. Angka ini perlu disetel lewat playtest.
- **Sistem beban dan keseimbangan yang rumit.** Sesuai keinginanmu tanpa sistem rumit, paket hanya boleh punya satu sifat sederhana (misalnya rapuh atau berat) dengan efek jelas, seperti glide yang lebih pendek.
- **Combat dan musuh.** Tetap tidak ada.
- **Kemiripan berlebihan.** Karena premisnya dekat, bedakan lewat nada hangat-fantasi, Gema dan Simpul, serta cerita episodik tiap pengantaran.

**Opsional setelah demo:** jejak kurir asinkron, yaitu lentera atau tanda yang ditinggalkan kurir lain di jalur. Ini bukan bagian cakupan demo sekarang.

### 13.3 Sistem eksplorasi: target seseru Death Stranding

Keseruan eksplorasi Death Stranding tidak datang dari pertarungan, melainkan dari lingkaran keputusan yang jelas: membaca medan, merencanakan, mengambil risiko, lalu melihat hasilnya terpasang di dunia. Berikut cara menerjemahkannya ke Jalur Senyap tanpa combat.

**Lingkaran inti (tiap pengantaran)**

1. **Baca.** Di Pos Singgah, pemain membuka Buku Jalur dan melihat rute, kondisi hari, dan sifat paket.
2. **Rencanakan.** Pilih rute dan alat yang dibawa (muatan terbatas).
3. **Lintasi.** Membaca medan langsung, memilih jalur, dan memakai alat.
4. **Hadapi kejutan.** Cuaca berubah, jalur tertutup, atau medan yang salah dibaca.
5. **Tiba dan lihat dampaknya.** Cerita penerima, Nama Baik naik, dan jalan yang dibuka tetap ada.

**Sistem pendukung**

- **Medan yang bisa dibaca.** Jenis permukaan (pasir lunak, kerikil, batu licin, es tipis, lumpur), kemiringan, dan arus sungai memengaruhi kecepatan, tarikan, dan peluang tergelincir. Tiap jenis punya isyarat visual, suara, dan animasi kaki yang jelas agar pemain bisa menilai sebelum melangkah. Tidak ada angka stamina, hanya akibat langsung pada gerak.
- **Muatan alat terbatas.** Sebelum berangkat, pemain memilih beberapa alat dari persediaan Pos: Kait Tali, **Tangga Tali**, Pasak Pijak (pijakan sementara di tebing), dan Layar Cadangan (memperpanjang glide). Tidak ada crafting: alat diambil dari persediaan, bukan dirakit dari bahan. Slot terbatas membuat rencana menjadi berarti.
- **Infrastruktur yang bertahan.** Sebagian alat (Tangga Tali, jembatan tali, pos istirahat kecil) bisa dipasang **permanen**. Jalan yang dibuka tetap ada untuk pengantaran berikutnya, dipakai dan dikomentari NPC, dan menambah Nama Baik. Ini sumber kepuasan terbesar: dunia berubah karena perjalananmu.
- **Ruru sebagai pemindai.** Ruru bisa dikirim mengendus sekitar dan menandai kemiringan, jurang, atau jalur aman dalam radius pendek dengan jeda pemulihan. Ini membuat membaca medan terasa sebagai gameplay.
- **Risiko dan imbalan.** Rute cepat melewati medan sulit, rute aman lebih panjang. Paket rapuh menambah tekanan. Cuaca membuka dan menutup rute, sehingga kondisi hari memengaruhi pilihan.
- **Berlindung dan menunggu cuaca.** Saat Badai, pemain bisa mendirikan bivak kecil atau berteduh di Pos sampai cuaca berganti.
- **Momentum dan alur.** Meluncur di bukit pasir, glide antar tebing, dan berayun dengan Kait Tali bisa dirangkai menjadi gerak yang mulus. Pemain mahir bergerak lebih cepat, tetapi itu tidak wajib.
- **Penemuan.** Titik pandang, jalan pintas rahasia, dan reruntuhan Warjian tercatat otomatis di Buku Jalur, sehingga rasa ingin tahu ala Outer Wilds ikut memberi imbalan.

**Cakupan untuk demo**

- Dua alat: Kait Tali dan Tangga Tali (struktur permanen).
- Ruru sebagai pemindai medan sederhana.
- Tiga jenis permukaan: batu, pasir lunak, dan tebing curam.
- Dua rute ke tujuan di Pengantaran 3: cepat tapi berisiko, dan aman tapi panjang.
- Struktur yang dipasang tersimpan dan terlihat di pengantaran berikutnya.
- **Ditunda setelah demo:** bivak, Layar Cadangan, Pasak Pijak, dan jejak asinkron antar pemain.

**Ukuran keseruan untuk playtest**

- Apakah pemain berhenti sejenak membaca medan sebelum bergerak?
- Apakah pemain memilih rute berbeda dan bisa menjelaskan alasannya?
- Apakah pemain sengaja memasang struktur permanen dan bangga melihatnya dipakai?
- Apakah ada momen hampir jatuh tapi selamat yang terasa memuaskan, bukan menjengkelkan?
- Apakah ada segmen datar lebih dari sekitar 30 detik tanpa hal baru?

**Tambahan dampak pada milestone**

- **M1:** jenis permukaan dasar dan efeknya pada gerak.
- **M3:** rute ganda dan titik pasang Tangga Tali.
- **M4:** cuaca memengaruhi pijakan dan menutup rute.
- **M5:** simpan struktur yang dipasang dan jalan pintas yang dibuka.

### 13.4 Dampak pada milestone

- **M3 (level gray-box):** rancang minimal dua rute berbeda ke satu tujuan, satu cepat tapi berisiko dan satu aman tapi panjang.
- **M4 (Cuaca Hari):** cuaca memengaruhi pijakan (pasir lebih lembut saat badai) dan penutupan rute, bukan hanya tampilan.
- **M5 (cerita dan reputasi):** simpan jalan pintas yang sudah dibuka, dan tampilkan garis cahaya antar Simpul yang sudah menyala di peta Buku Jalur.

## 14. Langkah berikutnya

- Tentukan nama bangsa, wilayah, dan Simpul yang final (nama di dokumen ini masih draf).
- Tulis ulang dialog demo dengan suaramu sendiri agar nadanya konsisten.
- Siapkan referensi visual: moodboard untuk kondisi Cerah dan Badai.
- Mulai dari M1, dan jangan lanjut sebelum kontrolnya terasa benar.
