/* Rich multi-turn Indonesian dialogues and clear step-by-step quest hints for Cincin Perunggu (Bab 0-1). */
(function(root){
'use strict';

function seq(npc,title,turns,action){
 const nodes={};
 turns.forEach((t,idx)=>{
  const id='n'+idx,next=idx<turns.length-1?'n'+(idx+1):null;
  nodes[id]={speaker:t[0],text:t[1]};
  if(next)nodes[id].next=next;
  else nodes[id].action=action;
 });
 return {npc,title,node:'n0',nodes};
}

const D={
 'cp-0-0':{
  hint:'Melangkahlah melewati halaman Pos Nilasar ke utara menuju pendopo berkubah biru dan tekan [E] untuk berbicara dengan Bu Marsiyah.',
  dialogue:{
   id:'cp-0-0',npc:'Marsiyah',title:'Pagi di Pos Nilasar',node:'n0',
   nodes:{
    n0:{speaker:'Marsiyah',text:'Duduk dulu, Nara. Cawan pertama selalu hak orang yang baru masuk ke halaman—jangan langsung memanggul bekal sebelum tenggorokanmu basah.',next:'n1'},
    n1:{speaker:'Nara',text:'Pagi, Bu Marsiyah! Di dekat gerbang tadi kulihat puluhan pedati garam dan gandum menumpuk di pelataran. Apa benar Kesa menaikkan lagi pajak Keping Tata di Gerbang Timur?',next:'n2'},
    n2:{speaker:'Marsiyah',text:'Bukan cuma soal bea Benteng Tata. Semalam longsoran pasir menutup jalur tebing utara menuju Menara Senja, dan di ujung utara klan berkuda Cirusia mulai menutup perbatasan Salkara. Kalau tidak ada perintis yang membuka rute baru, stok pos ini bisa habis sebelum dua pekan.',next:'n3'},
    n3:{speaker:'Nara',text:'Kalau begitu biar aku dan Ruru yang menyusuri jalur utara, Bu! Sekalian... kalau bayaran garamnya cukup nanti, aku masih menabung untuk mencari kabar ayahku di pelabuhan selatan.',next:'n4'},
    n4:{speaker:'Marsiyah',text:'Tarun memang nakhoda keras kepala, tapi enam tahun tanpa kabar bukan berarti hilang ditelan laut. Hari ini orang-orang di halaman ini membutuhkan jalan yang aman. Ambil dulu tas kulit tua lapis benang peredam Tseren di meja perbekalan sisi barat, lalu cek tali tambat di halaman pedati sebelah timur.',choices:[{text:'“Siap, Bu. Setelah cek tas dan tali, aku langsung naik ke utara?”',next:'c0'},{text:'“Ada yang perlu kuperiksa dulu sebelum berangkat ke tebing utara?”',next:'c1'}]},
    c0:{speaker:'Marsiyah',text:'Belum langsung ke tebing, Nara. Bu Lamit mengirim pesan bahwa air di Telaga Sumi beriak tanpa angin. Setelah mengambil tas dan memeriksa tali, singgahlah ke barat dulu—tetapi ingat, jangan masuk ke terowongan Urat Sumi.',action:'CP_0_0'},
    c1:{speaker:'Marsiyah',text:'Ada. Bu Lamit mengirim kabar bahwa air sumur di Telaga Sumi beriak tanpa angin. Ambil tas peredam Tseren di meja kiri dan cek tali pedati di sisi kanan, lalu pergilah ke Telaga Sumi di barat sebelum mendaki jalur utara.',action:'CP_0_0'}
   }
  }
 },
 'cp-0-1':{
  hint:'Pergi ke meja perbekalan di sisi barat (kiri) halaman Pos Nilasar dan tekan [E] untuk mengambil tas peredam Tseren yang dipinjamkan Marsiyah.',
  dialogue:seq('Nara','Bekal seorang perintis',[
   ['Nara','Ini dia tas kulit berlapis benang peredam Tseren yang dimaksud Bu Marsiyah barusan... Bagian luarnya sudah kusam terkena pasir, tapi jahitannya masih kokoh sekali.'],
   ['Ruru','*Krrt...* (Ruru mengendus tali kulit tas itu, lalu mengetukkan cakarnya pelan pada kantung samping yang terasa lebih tebal.)'],
   ['Nara','Tas sudah di pundak. Sekarang sesuai pesan Bu Marsiyah, kita cek kekuatan tali tambat di halaman kafilah sebelah timur dulu.']
  ],'CP_0_1')
 },
 'cp-0-2':{
  hint:'Berjalanlah ke halaman kafilah di sisi timur (dekat pedati) Pos Nilasar dan tekan [E] untuk menguji tali tambat.',
  dialogue:seq('Nara','Bekal seorang perintis',[
   ['Nara','Serat tali tambatnya rapat dan tidak getas. Cukup kuat menahan beban kalau rombongan harus melewati turunan tebing nanti.'],
   ['Ruru','*Krrt!* (Ruru menegakkan telinganya dan menatap ke arah barat—jalur keluar menuju Telaga Sumi.)'],
   ['Nara','Perlengkapan beres! Ayo berangkat ke barat menuju Telaga Sumi, Ruru—kita lihat air yang dicemaskan Bu Lamit seperti kata Bu Marsiyah tadi.']
  ],'CP_0_2')
 },

 'cp-1-0':{
  hint:'Menuju Telaga Sumi di arah barat Pos Nilasar. Dekati bibir Sumur Induk dan tekan [E] untuk memeriksa riak air.',
  dialogue:seq('Nara','Air yang bergetar',[
   ['Nara','Aneh... udara di pelataran telaga tenang sekali, tapi air di dasar Sumur Induk beriak membentuk lingkaran dari tengah ke tepi.'],
   ['Ruru','*Hrrr...* (Bulu tengkuk Ruru meremang. Ia menempelkan telinganya ke batu lantai sumur, lalu mundur setengah langkah.)'],
   ['Nara','Ada dengung rendah sekali dari bawah batu. Mari kita cek retakan di dinding saluran sebelah sebelum melapor ke Bu Lamit.']
  ],'CP_1_0')
 },
 'cp-1-1':{
  hint:'Berjalanlah beberapa langkah ke saluran batu di sisi Telaga Sumi dan tekan [E] untuk memeriksa retakannya.',
  dialogue:seq('Nara','Air yang bergetar',[
   ['Nara','Retakannya baru, memanjang ke arah terowongan bawah tanah Urat Sumi. Getarannya bahkan terasa merambat lewat sol sepatuku.'],
   ['Nara','Unta-unta karavan di luar sana juga gelisah. Aku harus segera bicara dengan Bu Lamit di tepi balai air ini.']
  ],'CP_1_1')
 },
 'cp-1-2':{
  hint:'Temui Bu Lamit di dekat saluran air Telaga Sumi dan tekan [E] untuk melaporkan temuanmu.',
  dialogue:{
   id:'cp-1-2',npc:'Bu Lamit',title:'Dengung di Urat Sumi',node:'n0',
   nodes:{
    n0:{speaker:'Bu Lamit',text:'Nah, itu dia perintis muda dari Nilasar! Jangan cuma berdiri melongo di pinggir batu, Nara—kau lihat sendiri kan air sumur ini beriak tanpa disentuh angin?',next:'n1'},
    n1:{speaker:'Nara',text:'Iya, Bu Lamit. Di dinding saluran sebelah juga ada retakan halus yang bergetar. Tadi pas tanganku menyentuh bibir sumur... kayak ada suara berdengung dari dalam terowongan Urat Sumi.',next:'n2'},
    n2:{speaker:'Nara',text:'(Sekejap, di dalam kepala Nara terngiang bisikan tumpang-tindih dari dalam batu. Ia buru-buru menarik tangannya ke balik jubah—teringat larangan keras Nenek Ima untuk tidak pernah bercerita soal suara batu.)',next:'n3'},
    n3:{speaker:'Bu Lamit',text:'(Bu Lamit menyipitkan mata penuh perhatian.) Tanganmu gemetar sedikit, Nak. Air dingin atau getaran batu? Ingat pesan suamiku Tiwano dulu waktu baru turun dari kapal Bahtari: kalau laut atau batu di bawah kaki mulai bergumam aneh, jangan sok berani masuk ke rongganya sendirian.',choices:[{text:'“Cuma kaget karena airnya dingin sekali, Bu.”',next:'c0'},{text:'“Apa Pak Tiwano pernah cerita soal getaran seperti ini?”',next:'c1'}]},
    c0:{speaker:'Bu Lamit',text:'Haha, alasan anak muda! Sudahlah, jangan masuk ke terowongan Urat Sumi itu. Catat saja keretakannya buat Marsiyah, lalu hati-hati di jalur utara nanti—pasirnya baru saja longsor.',action:'CP_1_2'},
    c1:{speaker:'Bu Lamit',text:'Tiwano selalu bilang palung laut selatan dan terowongan tua daratan ini punya urat yang sama. Kalau satu sisi tertekan, sisi lain ikut bergetar. Pergilah ke utara sekarang, Nara—dan jaga telingamu.',action:'CP_1_2'}
   }
  }
 },

 'cp-2-0':{
  hint:'Berjalanlah ke jalur utara menuju Bukit Menara Senja. Periksa pijakan batu pertama di lereng dengan [E].',
  dialogue:seq('Nara','Ruru membaca lereng',[
   ['Nara','Ini batas ujung batu pasir yang masih kokoh. Dari sini ke atas, bekas longsoran semalam menimbun jalur lama karavan.'],
   ['Nara','Ayo, Ruru—tunjukkan di mana tanah di bawah pasir ini masih padat.']
  ],'CP_2_0')
 },
 'cp-2-1':{
  hint:'Ikuti lereng menanjak ke arah Menara Senja dan periksa tepi longsoran dengan [E].',
  dialogue:seq('Nara','Ruru membaca lereng',[
   ['Ruru','*Grrr—yapp!* (Ruru berhenti mendadak dan menggaruk pinggiran pasir yang tampak rata, memperlihatkan rongga kosong di bawahnya.)'],
   ['Nara','Bagus sekali, Ruru! Hampir saja kakiku menginjak kantong pasir hisap. Satu penanda lagi di sisi punggung bukit, lalu kita naik ke pos Menara Senja.']
  ],'CP_2_1')
 },
 'cp-2-2':{
  hint:'Lanjutkan sedikit lagi ke punggung bukit Menara Senja dan tekan [E] untuk menancapkan penanda jalur aman.',
  dialogue:seq('Nara','Ruru membaca lereng',[
   ['Nara','Patok penanda jalur aman terpasang. Kalau pedati garam lewat sisi kanan batu ini, rodanya tidak akan terperosok ke jurang pasir.'],
   ['Nara','Dari sini siluet Menara Simpul ke-9 sudah kelihatan menjulang di timur. Sebelum kembali ke bawah, sebaiknya kusapa Pak Jumel di pos pengamat Menara Senja.']
  ],'CP_2_2')
 },

 'cp-3-0':{
  hint:'Dekati pos pengamat Menara Senja dan tekan [E] untuk berbicara dengan penjaga tua Jumel soal tasmu.',
  dialogue:seq('Jumel','Sketsa dari masa silam',[
   ['Jumel','Tunggu sebentar, anak muda... Jangan bergerak dulu. Tas kulit berjahitan tebal di bahumu itu—dari mana Marsiyah memberikannya padamu?'],
   ['Nara','Eh, ini tas pinjaman dari gudang Pos Nilasar, Pak Jumel. Memangnya kenapa? Ada yang aneh dengan tas ini?'],
   ['Jumel','Masuklah ke bangku pengamat sebentar. Aku harus mencocokkannya dengan buku catatan tua milik kakekku.']
  ],'CP_3_0')
 },
 'cp-3-1':{
  hint:'Periksa buku catatan Ban Jumel yang terbuka di dekat Menara Senja dengan menekan [E].',
  dialogue:seq('Nara','Sketsa dari masa silam',[
   ['Nara','Ada gambar sketsa tangan di halaman ini—bentuk gesper kuningan dan lipatan kain peredam di dalamnya persis sama dengan tas yang kubawa!'],
   ['Nara','Di bawahnya tertulis: “Ia melintas beberapa pekan sebelum malam menelan suara, membawa bungkusan perunggu untuk Saryel...” Siapa orang ini, Pak Jumel?']
  ],'CP_3_1')
 },
 'cp-3-2':{
  hint:'Bicara kembali dengan Jumel di Menara Senja [E] untuk mendengar kisah tentang Sahdan.',
  dialogue:{
   id:'cp-3-2',npc:'Jumel',title:'Catatan Ban Jumel',node:'n0',
   nodes:{
    n0:{speaker:'Jumel',text:'Namanya Sahdan. Kakekku, Ban Jumel, mencatatnya sebagai seorang perintis tanpa marga. Ia berjalan dari timur—dari arah dataran tinggi Lulan Tua—tepat beberapa pekan sebelum Hari Senyap memutus 99 Menara Simpul.',next:'n1'},
    n1:{speaker:'Nara',text:'Bungkusan perunggu untuk Saryel? Maksud Bapak... Saryel penjaga Pos Nilasar yang dulu?',next:'n2'},
    n2:{speaker:'Jumel',text:'Benar. Kakekku melihat sendiri Sahdan menyerahkan bungkusan terbungkus kain tebal kepada Saryel. Setelah itu, tanpa membawa pengawal maupun persediaan banyak, ia berbalik arah dan berjalan kembali seorang diri menuju jantung batu di timur... dan tak pernah turun lagi.',choices:[{text:'“Apa Marsiyah tahu tas ini dulunya milik Sahdan?”',next:'c0'},{text:'“Kenapa ia kembali ke Lulan Tua sendirian tepat sebelum Hari Senyap?”',next:'c1'}]},
    c0:{speaker:'Jumel',text:'Penjaga Nilasar selalu mewariskan amanat dari tangan ke tangan: Saryel, Azhel, Ilyam, sampai Marsiyah. Kalau Marsiyah meminjamkan tas itu kepadamu, berarti kau dianggap cukup dapat dipercaya. Sekarang turunlah—kafilah di Gerbang Timur menunggumu.',action:'CP_3_2'},
    c1:{speaker:'Jumel',text:'Tak ada yang tahu pasti, Nara. Mungkin ia ingin menuntaskan sesuatu di Menara Pertama sebelum malam gelap itu jatuh. Hati-hati saat melintas di Gerbang Timur nanti—prajurit Dewan belakangan ini gelisah.',action:'CP_3_2'}
   }
  }
 },

 'cp-4-0':{
  hint:'Turunlah ke jalan timur Pos Nilasar dan tekan [E] pada ikatan minyak lentera kafilah untuk memulai pengawalan.',
  dialogue:seq('Nara','Muatan di Gerbang Timur',[
   ['Nara','Dua ikat minyak lentera Bahtari dan kontrak dagang kafilah. Kalau tidak cepat diantar lewat Gerbang Timur, lentera pos saudara bisa padam malam ini.'],
   ['Nara','Angin di jalan terbuka mulai kencang—aku harus melangkah stabil supaya ikatannya tidak rusak.']
  ],'CP_4_0')
 },
 'cp-4-1':{
  hint:'Ikuti jalan ke timur menuju Gerbang Pemeriksaan dan tekan [E] untuk memeriksa kontrak kafilah di tengah perjalanan.',
  dialogue:seq('Nara','Muatan di Gerbang Timur',[
   ['Nara','Kertas serat Tseren di dalam tas masih kering dan aman. Di kejauhan sudah terlihat spanduk prajurit Dewan di Gerbang Timur.'],
   ['Nara','Ayo maju, Ruru. Semoga Komandan Kesa mau meloloskan rombongan ini tanpa ulah macam-macam.']
  ],'CP_4_1')
 },
 'cp-4-2':{
  hint:'Dekati Gerbang Pemeriksaan Timur tempat Komandan Kesa berjaga dan tekan [E] untuk menghadap.',
  dialogue:{
   id:'cp-4-2',npc:'Kesa',title:'Pemeriksaan Gerbang Timur',node:'n0',
   nodes:{
    n0:{speaker:'Kesa',text:'Berhenti di batas patok! Semua gerobak dan perintis dari Pos Nilasar wajib membuka muatan. Ini instruksi darurat langsung dari Benteng Tata.',next:'n1'},
    n1:{speaker:'Nara',text:'Komandan Kesa, ini cuma dua ikat minyak lentera buat pos saudara sama kontrak dagang resmi! Semua surat jalannya sudah dicap—kenapa ditahan juga?',next:'n2'},
    n2:{speaker:'Kesa',text:'(Kesa menatap ikatan minyak itu dengan rahang mengeras, lalu menoleh sekilas ke prajuritnya sebelum menjawab lebih pelan.) Satu ikat tetap kusita sebagai jaminan jalur. Tidak ada kafilah yang boleh melintas penuh sebelum pemeriksaan kami selesai.',choices:[{text:'“Kalau minyaknya ditahan, pos seberang bakal gelap saat badai!”',next:'c0'},{text:'“Berikan surat bukti penyitaannya supaya aku bisa melapor jujur ke Marsiyah.”',next:'c1'}]},
    c0:{speaker:'Kesa',text:'Kau kira aku senang mencekik pasokan minyak orang? Perintah dari atas menyuruh kami menyaring setiap barang yang keluar dari pos-pos tua Asharim. Ambil satu ikat sisanya—dan jangan berdebat di depan pengawal.',action:'CP_4_2'},
    c1:{speaker:'Kesa',text:'(Kesa menyobek secarik tanda terima dan menekankannya ke tangan Nara.) Ini tandanya. Katakan pada Marsiyah satu ikat ditahan di gerbang. Dan Nara... kalau kau melihat sesuatu yang tak wajar di gerbang ini, jangan ceroboh.',action:'CP_4_2'}
   }
  }
 },

 'cp-5-0':{
  hint:'Tunggu patroli Dewan menjauh, dekati papan pengumuman razia di sisi gerbang dan tekan [E].',
  dialogue:seq('Nara','Apa yang dicari Dewan?',[
   ['Nara','Ssst, merunduk sebentar di balik peti, Ruru... Prajurit patrolinya baru saja lewat.'],
   ['Nara','Di pengumuman ini tertulis soal kenaikan pajak Keping Tata dan larangan membawa barang logam tak terdaftar. Tapi kenapa penggeledahannya seketat itu?']
  ],'CP_5_0')
 },
 'cp-5-1':{
  hint:'Menyusup ke sisi seberang gerbang saat patroli lewat, lalu periksa daftar barang sitaan dengan [E].',
  dialogue:seq('Nara','Apa yang dicari Dewan?',[
   ['Nara','Lihat daftar sitaannya: bukan cuma garam dan minyak. Setiap perkakas perunggu tua, garpu tala, sampai pecahan lempeng batu disita dan dikirim ke Benteng Tata.'],
   ['Nara','Ada satu berkas perintah lagi di meja pos sebelah. Ayo kita intip pelan-pelan sebelum penjaga berbalik.']
  ],'CP_5_1')
 },
 'cp-5-2':{
  hint:'Hindari jangkauan patroli dan tekan [E] untuk membaca surat perintah pencarian Dewan.',
  dialogue:seq('Nara','Apa yang dicari Dewan?',[
   ['Nara','“Prioritas utama: lacak dan sita artefak perunggu peninggalan Lulanai yang diyakini disembunyikan di pos-pos tua Asharim sejak Hari Senyap.”'],
   ['Nara','Jadi ini bukan soal pajak semata! Dewan Tetua ketakutan karena sesuatu sedang terjadi pada jaringan menara. Langit mulai gelap oleh badai pasir—kita harus cepat pulang ke Pos Nilasar!']
  ],'CP_5_2')
 },

 'cp-6-0':{
  hint:'Badai pasir datang! Cepat kembali ke arah barat menuju Pos Nilasar, singgah di jalur teduh pertama [E].',
  dialogue:seq('Nara','Pulang sebelum badai',[
   ['Nara','Anginnya menyapu keras sekali! Pegang ujung jubahku kalau susah melihat, Ruru—kita berlindung sebentar di ceruk batu ini sebelum menerobos sisa jalan.'],
   ['Nara','Satu ikat minyak lentera dan surat penyitaan dari Kesa masih aman. Sedikit lagi kita sampai ke gerbang Pos Nilasar.']
  ],'CP_6_0')
 },
 'cp-6-1':{
  hint:'Terobos badai masuk ke halaman Pos Nilasar dan tekan [E] di halaman pos untuk memeriksa keadaan.',
  dialogue:seq('Nara','Pulang sebelum badai',[
   ['Nara','Semua tenda pasar sudah digulung rapat! Para pedagang berkerumun mencari teduh di balik tembok batu biru.'],
   ['Nara','Bu Marsiyah pasti menunggu laporan di balai. Ayo cepat laporkan semua yang terjadi di Gerbang Timur!']
  ],'CP_6_1')
 },
 'cp-6-2':{
  hint:'Temui Marsiyah di bawah naungan balai Pos Nilasar [E] untuk melaporkan penyitaan Kesa.',
  dialogue:{
   id:'cp-6-2',npc:'Marsiyah',title:'Tiga Denyut di Tengah Badai',node:'n0',
   nodes:{
    n0:{speaker:'Nara',text:'Bu Marsiyah! Maaf... aku cuma bisa bawa pulang satu ikat minyak. Satunya lagi ditahan Kesa di Gerbang Timur. Ini surat tanda sitanya—dan mereka ternyata menggeledah semua pos tua buat mencari artefak perunggu Lulanai.',next:'n1'},
    n1:{speaker:'Marsiyah',text:'Kau tidak menutup-nutupi kegagalan atau membesar-besarkannya. Itu sudah cukup bagiku, Nara. Tetapi— (Tiba-tiba tanah di bawah kaki mereka bergetar hebat!)',next:'n2'},
    n2:{speaker:'Nara',text:'Bu—gempa?! Tidak, lihat ke arah bukit utara! Menara Simpul ke-9... menyala?!',next:'n3'},
    n3:{speaker:'Marsiyah',text:'(Wajah Marsiyah menegang pucat menatap tiga denyut cahaya kuning pekat yang memecah langit badai, disusul derak logam raksasa dari kejauhan.) Satu... dua... tiga denyut tanpa penyetelan.',choices:[{text:'“Apa artinya tiga denyut kuning itu, Bu?”',next:'c0'},{text:'“Apa itu berhubungan dengan getaran di Telaga Sumi tadi?”',next:'c1'}]},
    c0:{speaker:'Marsiyah',text:'Itu tanda bahaya terakhir yang tertulis dalam wasiat empat penjaga Pos Nilasar: Bejana Batu di ujung selatan mulai jebol. Nara, ikut aku ke ruang bawah dapur batu sekarang juga. Waktunya sudah habis.',action:'CP_6_2'},
    c1:{speaker:'Marsiyah',text:'Ya—tekanannya merambat sepanjang Garis Surut dari selatan sampai ke sini! Jika prajurit Dewan menyerbu pos malam ini, apa yang kusimpan di balik dinding akan dirampas percuma. Ikut aku ke bawah dapur batu sekarang.',action:'CP_6_2'}
   }
  }
 },

 'cp-7-0':{
  hint:'Ikuti Marsiyah ke ruang tersembunyi di dekat balai Pos Nilasar dan tekan [E] untuk membuka bata tersegel.',
  dialogue:seq('Marsiyah','Cincin di balik bata',[
   ['Marsiyah','Bantu aku menggeser batu penutup di sudut dinding ini. Tidak ada satu pun anggota Dewan Tetua yang tahu ruang bawah dapur ini masih menyimpan peninggalan lama.'],
   ['Nara','Ini bata segelnya... Di belakangnya ada kotak kain tua.']
  ],'CP_7_0')
 },
 'cp-7-1':{
  hint:'Buka kain pembungkus di samping balai dengan menekan [E].',
  dialogue:seq('Marsiyah','Cincin di balik bata',[
   ['Marsiyah','Buka lipatan kainnya perlahan. Selama tiga puluh satu tahun sejak Tahun 72 Post-Senyap, aku menjaganya dari setiap razia Benteng Tata.'],
   ['Nara','Benda di dalamnya cuma... sebuah cincin perunggu kecil? Warnanya kusam kehijauan, tidak ada permata sama sekali.']
  ],'CP_7_1')
 },
 'cp-7-2':{
  hint:'Dekati Marsiyah dan tekan [E] untuk menyentuh Cincin Perunggu.',
  dialogue:{
   id:'cp-7-2',npc:'Marsiyah',title:'Sengatan Cincin Perunggu',node:'n0',
   nodes:{
    n0:{speaker:'Marsiyah',text:'Bagi mata orang awam, itu memang tampak seperti logam tua tak berharga. Cobalah ulurkan tanganmu dan pegang cincin itu, Nara.',next:'n1'},
    n1:{speaker:'Nara',text:'(Begitu ujung jari telunjuk Nara menyentuhnya, satu sengatan hangat seperti setruman halus menyambar dari jarinya hingga ke belakang telinganya! Ukiran tipis di dalam cincin berpendar redup sekejap sebelum padam lagi.)',next:'n2'},
    n2:{speaker:'Nara',text:'(Nara tersentak, refleks menarik dan menyembunyikan jarinya di balik lipatan jubah.) A-ah, dingin sekali logamnya, Bu... berdebu pula.',next:'n3'},
    n3:{speaker:'Marsiyah',text:'(Marsiyah melihat jelas getaran kecil di jari Nara, namun suaranya tetap tenang dan tidak mendesak.) Simpan benda itu di saku terdalam tas peredam milik Sahdan. Jangan sampai prajurit Dewan menemukannya.',next:'n4'},
    n4:{speaker:'Nara',text:'Tas ini harus dibawa ke mana, Bu? Kenapa Ibu mempercayakan benda sepenting ini padaku?',choices:[{text:'“Apa cincin ini yang dicari prajurit Dewan tadi?”',next:'c0'},{text:'“Aku akan menjaganya baik-baik. Apa langkah selanjutnya?”',next:'c1'}]},
    c0:{speaker:'Marsiyah',text:'Ya. Dan kalau mereka merampasnya di sini, semuanya tamat. Pergilah ke kaki Menara Simpul ke-9 di timur laut—periksa lempeng batunya dengan cincin itu. Kesa baru saja melihat menara menyala; barangkali masih ada celah bagimu.',action:'CP_7_2'},
    c1:{speaker:'Marsiyah',text:'Menujulah ke kaki Menara Simpul ke-9 di arah timur laut. Dekatkan cincin itu pada lempeng batunya untuk melihat apakah jalurnya masih merespons. Hati-hati terhadap badai dan patroli gerbang.',action:'CP_7_2'}
   }
  }
 },

 'cp-8-0':{
  hint:'Berjalanlah ke arah Gerbang Utara menuju Menara Simpul ke-9 dan tekan [E] saat bertemu Kesa.',
  dialogue:{
   id:'cp-8-0',npc:'Kesa',title:'Celah di Tengah Badai',node:'n0',
   nodes:{
    n0:{speaker:'Kesa',text:'Tunggu! ...Tenang, aku tidak membunyikan peluit penjaga. Kau melihat sendiri tiga denyut cahaya kuning dari Menara ke-9 tadi, kan?',next:'n1'},
    n1:{speaker:'Nara',text:'Komandan Kesa? Kau... tidak menahanku? Bukannya Dewan menyuruh kalian menyegel semua jalur menuju menara?',next:'n2'},
    n2:{speaker:'Kesa',text:'Benteng Tata bilang menara-menara lama selain tujuh menara mereka sudah mati selamanya. Kalau itu bohong, berarti sesuatu di luar sana jauh lebih besar dari urusan pajak Keping Tata. Lewatlah lewat celah tebing utara—aku tidak melihat siapa pun melintas malam ini.',next:'n3'},
    n3:{speaker:'Nara',text:'Terima kasih, Kak Kesa. Jaga dirimu juga di gerbang.',action:'CP_8_0'}
   }
  }
 },
 'cp-8-1':{
  hint:'Susuri jalur menanjak di tengah badai menuju timur laut. Berlindung sejenak di pelindung tebing [E].',
  dialogue:seq('Nara','Celah di tengah badai',[
   ['Nara','Angin tebingnya ganas sekali! Ruru, merapat ke dinding batu sebelah sini dulu.'],
   ['Nara','Cincin di dalam saku tas terasa semakin hangat—seolah bergetar searah dengan dengungan dari puncak Menara ke-9 di depan sana.']
  ],'CP_8_1')
 },
 'cp-8-2':{
  hint:'Capai pelataran Menara Simpul ke-9 di puncak timur laut dan tekan [E] di dekat lempeng pemeriksaan.',
  dialogue:seq('Nara','Celah di tengah badai',[
   ['Nara','Ini dia kaki Menara Simpul ke-9. Ukiran di lempeng batunya persis sama dengan pola mikroskopis di bagian dalam Cincin Perunggu!'],
   ['Nara','Aneh... setiap kali cincin ini kudekatkan, dengung batu di bawah kakiku ikut berdenyut mengikuti irama tertentu.']
  ],'CP_8_2')
 },

 'cp-9-0':{
  hint:'Berdiri di depan Lempeng Menara ke-9 dan tekan [E], lalu ulangi pola getaran dengan tombol panah!',
  dialogue:{
   id:'cp-9-0',npc:'Sahdan',title:'Gema di Menara Simpul ke-9',node:'n0',
   nodes:{
    n0:{speaker:'Nara',text:'(Begitu pola getaran selaras, Cincin Perunggu menyetrum kuat dan mengunci hangat di jari Nara. Dari kedalaman batu menara bangkit gema suara yang dingin, jernih, dan nyaris tanpa emosi...)',next:'n1'},
    n1:{speaker:'Sahdan',text:'“Perunggu kembali menyentuh jalur... Jangan bawa cincin itu ke Benteng.”',next:'n2'},
    n2:{speaker:'Nara',text:'Suara itu... Sahdan?! Suaranya mengalir dari arah Menara Pertama di tengah benua!',next:'n3'},
    n3:{speaker:'Sahdan',text:'“Bawa ke sumbernya di Menara Pertama... sebelum bejana di selatan pecah.”',next:'n4'},
    n4:{speaker:'Nara',text:'(Gema itu padam perlahan, namun cincin perunggu di tangan Nara kini berdenyut seirama dengan detak nadinya sendiri.) Aku mengerti... tujuannya bukan Gerbang Surut di selatan, melainkan sumber kodenya di Menara Pertama!',action:'CP_9_0'}
   }
  }
 },

 'cp-10-0':{
  hint:'Mundurlah beberapa langkah dari altar Menara ke-9 dan tekan [E] untuk memeriksa jejak aneh di pasir.',
  dialogue:seq('Nara','Siluet di punggung bukit',[
   ['Ruru','*Grrrr!* (Ruru mendadak menoleh tajam ke arah punggung bukit di timur laut menara, bulunya berdiri tegak.)'],
   ['Nara','Ada suara langkah lain di balik deru badai... dan jejak kaki ini baru sekali tercetak di pasir basah!']
  ],'CP_10_0')
 },
 'cp-10-1':{
  hint:'Bergerak ke sisi tepi pelataran menara (hindari tebing terbuka) dan tekan [E] untuk mengamati sosok di bukit.',
  dialogue:seq('Nara','Siluet di punggung bukit',[
   ['Nara','Siapa itu di punggung bukit sana?! Pemuda berjubah gelap... Di tangannya ada sepasang garpu tala perunggu yang ikut berpendar memantulkan cahaya menara!'],
   ['Nara','Dia menatap lurus ke arah tanganku! Seolah dia bisa merasakan kalau cincin ini baru saja aktif di nadiku... Kita tidak boleh mengejarnya ke tebing terbuka, Ruru.']
  ],'CP_10_1')
 },
 'cp-10-2':{
  hint:'Ambil jalur turun yang aman di sisi menara [E] untuk kembali ke Pos Nilasar.',
  dialogue:seq('Nara','Siluet di punggung bukit',[
   ['Nara','Dia sudah menghilang di balik tirai pasir. Tapi aku yakin tatapannya tadi bukan tatapan prajurit Dewan.'],
   ['Nara','Ayo cepat turun ke Pos Nilasar, Ruru. Ibu Marsiyah harus segera tahu soal suara Sahdan dan pemuda bergarpu tala itu!']
  ],'CP_10_2')
 },

 'cp-11-0':{
  hint:'Temui Marsiyah di balai utama Pos Nilasar [E] untuk melaporkan peristiwa di Menara ke-9 dan meminta peta lereng timur.',
  dialogue:{
   id:'cp-11-0',npc:'Marsiyah',title:'Menuju Sumber di Menara Pertama',node:'n0',
   nodes:{
    n0:{speaker:'Nara',text:'Bu Marsiyah... waktu kuselaraskan di Menara ke-9, cincinnya menyetrum dan langsung terkunci di detak nadiku. Ada suara Sahdan lewat Garis Surut—ia menyuruhku membawa cincin ini ke Menara Pertama sebelum bejana di selatan pecah. Lalu di bukit badai, ada pemuda berjubah gelap memegang garpu tala perunggu yang memandangiku.',next:'n1'},
    n1:{speaker:'Marsiyah',text:'(Marsiyah terdiam lama, jemarinya mengepal pelan di atas peta.) Menara Pertama... di jantung dataran tinggi Lulan Tua. Ya, tas dan cincin itu memang dibawa Sahdan puluhan tahun silam, dijaga turun-temurun oleh Saryel, Azhel, Ilyam, sampai ke tanganku.',next:'n2'},
    n2:{speaker:'Marsiyah',text:'Kalau sampai ada orang lain yang membawa garpu tala Perunggu Gaung di luar sana, berarti bukan hanya Dewan Tetua yang memburu cincin ini. Rute barat dijaga ketat prajurit. Kau harus memutar lewat lereng timur—ambil peta ini, singgahlah dulu di rumahmu di Dusun Sela, lalu cari karavan besar menuju Padang Salkara agar bisa menembus lereng utara Lulan Tua.',choices:[{text:'“Apakah Ibu akan baik-baik saja di Pos Nilasar?”',next:'c0'},{text:'“Kenapa cincinnya menyengat tanganku, Bu?”',next:'c1'}]},
    c0:{speaker:'Marsiyah',text:'Pos Nilasar sudah bertahan melewati badai lebih tua daripada umurku. Ambillah bekal perjalanan di halaman timur, lalu berangkatlah ke Dusun Sela sebelum fajar, Nara.',action:'CP_11_0'},
    c1:{speaker:'Marsiyah',text:'Barangkali Nenek Ima di Dusun Sela lebih pantas menjawab pertanyaan itu daripada aku. Ambillah bekal perjalanan di halaman timur, lalu segera berangkat lewat gerbang timur.',action:'CP_11_0'}
   }
  }
 },
 'cp-11-1':{
  hint:'Ambil bekal perjalanan di halaman timur Pos Nilasar dengan menekan [E].',
  dialogue:seq('Nara','Jalan keluar Pos Nilasar',[
   ['Nara','Wadah air penuh, garam batangan cukup, peta lereng timur dari Ibu Marsiyah sudah kusimpan, dan tas peredam tertutup rapat.'],
   ['Nara','Sekarang tinggal menuju patok penanda rute timur di ambang keluar Pos Nilasar untuk bertolak ke Dusun Sela.']
  ],'CP_11_1')
 },
 'cp-11-2':{
  hint:'Periksa patok penanda rute timur di jalan keluar Pos Nilasar [E] untuk berangkat menuju Dusun Sela.',
  dialogue:{
   id:'cp-11-2',npc:'Nara',title:'Jalan Keluar Pos Nilasar',node:'n0',
   nodes:{
    n0:{speaker:'Nara',text:'Ini patok penanda rute lereng timur menuju Dusun Sela. Dari sini jalurnya mendaki punggung bukit pasir jauh dari pos razia prajurit Dewan.',next:'n1'},
    n1:{speaker:'Nara',text:'(Nara menoleh sekali lagi ke arah kubah biru Pos Nilasar yang mulai diselimuti kabut fajar, lalu mengusap kepala Ruru.)',choices:[{text:'“Ayo, Ruru. Nenek Ima pasti menunggu kita di Dusun Sela.”',next:'c0'},{text:'“Kita jaga baik-baik amanat Ibu Marsiyah sampai ke utara.”',next:'c1'}]},
    c0:{speaker:'Nara',text:'Ruru mendengkur pelan dan melompat lebih dulu menapaki jalan berbatu ke arah timur.',action:'CP_11_2'},
    c1:{speaker:'Nara',text:'Cincin di pergelangan tangan Nara terasa hangat, seolah ikut menunjuk arah menuju lereng timur.',action:'CP_11_2'}
   }
  }
 },

 'cp-12-0':{
  hint:'Susuri jalur timur jauh menuju Dusun Sela! Periksa tenda pengungsi pertama di pintu masuk dusun [E].',
  dialogue:seq('Nara','Dusun yang menampung pelarian',[
   ['Nara','Dusun Sela biasanya tenang... tapi sekarang penuh tenda darurat! Semua ini penambang garam dan rombongan kafilah dari perbatasan utara.'],
   ['Nara','Kata mereka pasukan berkuda Panji Dolgak dan Gorkan sudah menduduki pos perbatasan dan merampas gerobak garam. Semoga Nenek Ima baik-baik saja di rumah.']
  ],'CP_12_0')
 },
 'cp-12-1':{
  hint:'Berjalanlah masuk ke tengah Dusun Sela menuju rumah batu kecil milik Nenek Ima dan tekan [E].',
  dialogue:seq('Nara','Dusun yang menampung pelarian',[
   ['Nara','Jalanan dusun sesak oleh pedati-pedati patah. Ruru, pelan-pelan jangan sampai menyenggol tenda keluarga yang sedang beristirahat.'],
   ['Nara','Itu dia teras rumah batu Nenek Ima di depan!']
  ],'CP_12_1')
 },
 'cp-12-2':{
  hint:'Dekati pintu rumah Nenek Ima di Dusun Sela dan tekan [E] untuk mengetuk.',
  dialogue:seq('Ima','Dusun yang menampung pelarian',[
   ['Ima','Nara?! Syukurlah kau pulang utuh... Masuk dulu ke dalam rumah. Di luar udara makin dingin dan mata-mata dari Pos Dagang berkeliaran sampai ke tepi dusun.'],
   ['Nara','Iya, Nek. Aku juga bawa kabar penting dari Pos Nilasar.']
  ],'CP_12_2')
 },

 'cp-13-0':{
  hint:'Di dalam pelataran rumah Ima, tekan [E] pada pintu kayu saat Ima memergoki Cincin Perunggu di tanganmu.',
  dialogue:seq('Ima','Di bawah alat tenun',[
   ['Nara','(Malam itu, saat Nara mengeluarkan Cincin Perunggu di dekat cahaya lentera, pendar ukiran halusnya memantul ke dinding—dan Nenek Ima melihatnya!)'],
   ['Ima','(Wajah Ima seketika pucat pasi.) Jangan keluarkan benda itu di dekat jendela! Tutup dan palang pintu kayu sekarang juga, Nara!']
  ],'CP_13_0')
 },
 'cp-13-1':{
  hint:'Hampiri kotak kayu berlapis kain di bawah alat tenun Nenek Ima dan tekan [E].',
  dialogue:seq('Ima','Di bawah alat tenun',[
   ['Ima','(Dengan tangan gemetar, Ima menyingkap lantai batu di bawah alat tenunnya dan mengangkat sebuah kotak kayu tua berlapis kain tebal.)'],
   ['Nara','Nek... itu di dalamnya apa? Kenapa ukiran garis di benda perunggu itu persis sekali sama pola di dalam cincin ini?']
  ],'CP_13_1')
 },
 'cp-13-2':{
  hint:'Bicara dengan Nenek Ima [E] mengenai ukiran Penutup Telinga Perunggu dan rahasia darah Lulanai.',
  dialogue:{
   id:'cp-13-2',npc:'Ima',title:'Rahasia di Bawah Alat Tenun',node:'n0',
   nodes:{
    n0:{speaker:'Ima',text:'Ini Penutup Telinga Perunggu milik orang tuaku. Mereka penyintas Lulanai yang lolos saat jaringan menara diputus pada Hari Senyap. Ketika Dewan Tetua memfitnah benda ini membawa wabah Bising menular dan memburu kaum kita, keluarga ibumu membuang nama lama dan hidup menyamar sebagai orang Asharim di dusun ini.',next:'n1'},
    n1:{speaker:'Nara',text:'Jadi... aku punya darah Lulanai dari Ibu?! Itu sebabnya batu sumur berbisik, dan cincin ini menyengat jariku sejak pertama kupegang?',next:'n2'},
    n2:{speaker:'Ima',text:'Cincin itu ditempa dari logam tanah leluhur ibumu—ia mengenali darah di nadimu. Dengar baik-baik, Nara: jangan pernah, sekali pun, kau katakan pada orang Asharim, Cirusia, apalagi Dewan Tetua bahwa benda itu hidup di tanganmu. Bagi mereka, orang Lulanai adalah hantu yang harus dilenyapkan.',next:'n3'},
    n3:{speaker:'Nara',text:'Nek... (Nara menatap sepasang penutup telinga yang ukurannya tampak lebih kecil dari yang satunya—ukuran telinga seorang gadis muda.) Apakah... Ibu dulu tahu semua ini?',choices:[{text:'“Apakah Ibu pernah memakai penutup telinga yang kecil itu, Nek?”',next:'c0'},{text:'“Aku janji akan berhati-hati dan tidak membocorkannya pada siapa pun.”',next:'c1'}]},
    c0:{speaker:'Ima',text:'(Ima tak sanggup menjawab. Ia hanya menatap penutup telinga kecil itu lama sekali, lalu menutup kotak kayu dengan tangan gemetar.) Sudah larut, Nara. Besok pagi lewatlah jalur kanal menuju perbatasan Remuz–Zamer dan temui Orsuk dari Panji Balkut. Ia satu-satunya orang Cirusia yang masih menghargai jalur damai.',action:'CP_13_2'},
    c1:{speaker:'Ima',text:'(Ima menggenggam bahu Nara erat, masih enggan menyentuh kotak kayu itu lagi.) Simpan cincinmu baik-baik. Besok pagi turunlah ke jalur kanal menuju perbatasan Remuz–Zamer dan cari Orsuk dari Panji Balkut. Jangan mudah percaya pada orang asing di jalan.',action:'CP_13_2'}
   }
  }
 },

 'cp-14-0':{
  hint:'Turunlah ke Pos Dagang di jalur kanal timur (selatan-timur Dusun Sela) dan periksa jembatan kanal [E].',
  dialogue:seq('Nara','Daftar nama di tepi kanal',[
   ['Nara','Di sepanjang kanal ini penjagaannya beda sekali dengan Pos Nilasar. Prajurit Dewan Tetua berpatroli terang-terangan di depan gudang Pos Dagang!'],
   ['Nara','Aku harus menyelinap di sisi kanal tanpa terlihat patroli untuk tahu kesepakatan apa yang dibuat Pos Dagang dengan Dewan.']
  ],'CP_14_0')
 },
 'cp-14-1':{
  hint:'Tunggu patroli kanal menjauh, lalu dekati buku daftar pelintas di jembatan tengah kanal dan tekan [E].',
  dialogue:seq('Nara','Daftar nama di tepi kanal',[
   ['Nara','Lihat buku daftar ini! Penguasa Pos Dagang menyerahkan salinan daftar nama pelintas langsung kepada pengintai Dewan Tetua demi mendapat pengawalan bersenjata!'],
   ['Nara','Pantas Bu Marsiyah melarangku lewat jalur barat. Kalau namaku masuk daftar itu, pengejaran Benteng Tata bakal langsung mengarah ke Dusun Sela.']
  ],'CP_14_1')
 },
 'cp-14-2':{
  hint:'Hindari patroli kanal dan melintaslah ke jalur aman di ujung timur kanal [E].',
  dialogue:seq('Nara','Daftar nama di tepi kanal',[
   ['Nara','Berhasil lolos tanpa ketahuan patroli. Di depan sana sudah terlihat pos transit perbatasan Remuz–Zamer—tempat karavan Panji Balkut tertahan.'],
   ['Nara','Ayo cari Orsuk, Ruru.']
  ],'CP_14_2')
 },

 'cp-15-0':{
  hint:'Masuk ke pos perbatasan Remuz–Zamer di utara-timur kanal dan periksa muatan garam batangan [E].',
  dialogue:seq('Nara','Garam untuk karavan Balkut',[
   ['Nara','Tumpukan garam batu batangan Asharim siap angkut! Karavan sebesar ini memang cuma bisa bertahan kalau jalur barter dengan Cirusia tidak terputus.'],
   ['Nara','Kita cek dulu tali tambat pedati kerbaunya sebelum bicara dengan Orsuk.']
  ],'CP_15_0')
 },
 'cp-15-1':{
  hint:'Periksa tali tambat pedati Balkut di perbatasan [E].',
  dialogue:seq('Nara','Garam untuk karavan Balkut',[
   ['Nara','Pedati berat beroda besi seperti ini butuh tambatan jembatan yang benar-benar rata di atas tebing.'],
   ['Nara','Nah, itu dia kepala pengawal Panji Balkut sedang memeriksa daftar pasokan di depan!']
  ],'CP_15_1')
 },
 'cp-15-2':{
  hint:'Temui Orsuk di pos perbatasan Remuz–Zamer dan tekan [E] untuk menawarkan bantuan merintis jalan.',
  dialogue:{
   id:'cp-15-2',npc:'Orsuk',title:'Karavan Panji Balkut',node:'n0',
   nodes:{
    n0:{speaker:'Orsuk',text:'Aku tidak pandai basa-basi, anak muda. Kau perintis dari Asharim yang disebut-sebut bisa membaca jalur tebing? Nama ku Orsuk dari Panji Balkut.',next:'n1'},
    n1:{speaker:'Nara',text:'Aku Nara, dari Dusun Sela dan Pos Nilasar. Kulihat gerobak garam kalian tertahan di sini—padahal Padang Salkara sudah di depan mata. Apa Panji Tua memblokade celah bawah?',next:'n2'},
    n2:{speaker:'Orsuk',text:'Benar. Pasukan Panji Dolgak dan Gorkan mengunci gerbang tebing karena kelaparan makin parah dan dendam Perang Tujuh Musim dipanaskan lagi. Lada biru Bahtari putus, pajak garam Dewan mencekik, dan musim lalu rumput padang gagal tumbuh.',next:'n3'},
    n3:{speaker:'Orsuk',text:'Kalau kami memaksa lewat bawah, darah tumpah. Tapi di atas tebing samping ada jembatan tambat darurat. Aku butuh perintis yang berani memanjat jalur tebing dan menurunkan dek jembatan dari atas agar garam damai ini bisa sampai ke Sidang Tujuh Panji.',choices:[{text:'“Aku bantu buka jalurnya—asal boleh ikut rombongan ke utara.”',next:'c0'},{text:'“Apa Panji Tua mau mendengar tawaran garam damai di sidang nanti?”',next:'c1'}]},
    c0:{speaker:'Orsuk',text:'Sepakat! Kalau garam ini masuk ke perkemahan sebelum genderang perang ditabuh, seluruh utara masih punya harapan. Sebentar—sebelum kita naik ke tebing, rapikan dulu timbangan di meja takar sebelah sana.',action:'CP_15_2'},
    c1:{speaker:'Orsuk',text:'Menurut Hukum Adat Cirusia, utusan yang membawa perjanjian dagang sah tidak boleh disentuh sebelum didengar di depan api sidang. Itu satu-satunya peluang kita. Sebelum mendaki, periksa dulu catatan timbangan di meja batu depan itu.',action:'CP_15_2'}
   }
  }
 },

 'cp-16-0':{
  hint:'Hampiri meja takar di dekat pemuda berjubah gelap (Maruani) di tepi pos perbatasan dan tekan [E], lalu ikuti ketukan Nada Pengikat!',
  dialogue:{
   id:'cp-16-0',npc:'Maruani',title:'Sapaan Melalui Meja Batu',node:'n0',
   nodes:{
    n0:{speaker:'Nara',text:'(Begitu tangan Nara menyentuh batu meja takar, sebuah ketukan terukur merambat melalui batu—menggetarkan tulang telapak tangannya persis seperti gema di Menara ke-9! Namun Orsuk di kejauhan tidak mendengar apa-apa.)',next:'n1'},
    n1:{speaker:'Maruani',text:'(Pemuda berjubah gelap dari bukit badai itu menoleh tenang dengan senyum dingin—menyamar sebagai juru takar karavan.) Pendengaranmu bagus, saudara perintis. Tidak mudah menemukan keturunan yang telinganya masih utuh dari Bising.',next:'n2'},
    n2:{speaker:'Nara',text:'Kau... pemuda yang membawa garpu tala di Menara ke-9! Siapa kau sebenarnya? Apa maumu mengikuti karavan ini?!',next:'n3'},
    n3:{speaker:'Maruani',text:'Namaku Maruani. Tenang saja—kalau aku ingin merebut cincinmu dengan kekerasan, aku sudah melakukannya di badai malam itu. Sayangnya cincin 5 Arsitek Agung terkunci pada detak nadimu. Cincin yang direbut paksa hanya akan kembali menjadi perunggu mati. Aku membutuhkanmu hidup... dan memahami kebenaran.',next:'n4'},
    n4:{speaker:'Maruani',text:'Lihatlah mereka yang kau bela di perbatasan ini: orang Asharim dan Cirusia saling membunuh memperebutkan saluran Urat Sumi dan jalan batu yang bahkan tak mereka ketahui siapa pembuatnya. Pengorbanan leluhur kita di Hari Senyap sia-sia, Nara. Hanya dengan Nada Pengikat dan Gerbang Surut di tangan Lulanai dunia ini bisa dipaksa berhenti saling mencabik.',choices:[{text:'“Sahdan memperingatkan agar tidak membuka Gerbang Surut dengan paksa!”',next:'c0'},{text:'“Menundukkan bangsa lain lewat getaran bukan kedamaian—itu penjajahan baru.”',next:'c1'}]},
    c0:{speaker:'Maruani',text:'Sahdan tidak pernah menjadi arsitek, ia hanya pembawa pesan. Kau akan melihat sendiri di Sidang Api nanti betapa kacaunya dunia tanpa tangan yang memegang kendali. Sampai bertemu di Padang Salkara, pembawa cincin.',action:'CP_16_0'},
    c1:{speaker:'Maruani',text:'Kata-kata indah tidak akan menghentikan tombak Panji Dolgak di depan sana. Tanyakan pada hatimu saat melihat api sidang nanti—apakah mereka layak diberi pilihan. Aku melangkah lebih dulu ke utara.',action:'CP_16_0'}
   }
  }
 },

 'cp-17-0':{
  hint:'Mulai pendakian jalur samping tebing di utara pos perbatasan. Periksa pijakan lereng pertama [E].',
  dialogue:seq('Nara','Jalan di atas blokade',[
   ['Nara','Maruani sudah mendahului ke utara! Aku harus cepat sebelum dia memanaskan keadaan di perkemahan.'],
   ['Nara','Ruru, carikan pijakan di atas celah tebing—jangan sampai pasukan Panji Dolgak di bawah melihat bayangan kita.']
  ],'CP_17_0')
 },
 'cp-17-1':{
  hint:'Naik lebih tinggi menyusuri tepi tebing di atas blokade dan periksa batu tambatan [E].',
  dialogue:seq('Nara','Jalan di atas blokade',[
   ['Nara','Ya ampun... Lihat ke bawah celah sana. Pos pengintai yang hangus terbakar, dan ternak-ternak Cirusia yang mati membusuk karena tidak ada garam dan lada biru untuk mengawetkannya.'],
   ['Nara','Maruani benar soal satu hal: mereka memang terdesak kelaparan. Tapi jawabannya bukan menaklukkan mereka—melainkan membuka lagi jalur dagang yang putus.']
  ],'CP_17_1')
 },
 'cp-17-2':{
  hint:'Capai puncak celah tebing sebelum jembatan gantung Balkut dan tekan [E].',
  dialogue:seq('Nara','Jalan di atas blokade',[
   ['Nara','Jika perang meledak hari ini antara Cirusia dan Asharim, Dusun Sela akan menjadi korban pertama dan jalan menuju Menara Pertama di Lulan Tua akan tertutup darah.'],
   ['Nara','Tidak ada jalan lain—aku harus menghentikan perang ini dulu bersama Orsuk! Di depan sudah tampak mekanisme jembatan tambat Balkut.']
  ],'CP_17_2')
 },

 'cp-18-0':{
  hint:'Dekati tambatan kiri jembatan Balkut dan tekan [E], lalu tekan [E] tepat saat penanda berada di zona hijau!',
  dialogue:seq('Nara','Turunkan jembatan tambat',[
   ['Nara','Pasak kiri sudah menegang kuat! Dua tambatan lagi supaya beban pedati garam Orsuk tidak membuat jembatan oleng.']
  ],'CP_18_0')
 },
 'cp-18-1':{
  hint:'Dekati kerekan utama di tengah tebing dan tekan [E], lalu tepatkan di zona hijau!',
  dialogue:seq('Nara','Turunkan jembatan tambat',[
   ['Nara','Kerekan utama berputar! Rantai penahannya menahan berat dek kayu—tinggal pengunci sisi kanan yang terakhir!']
  ],'CP_18_1')
 },
 'cp-18-2':{
  hint:'Selesaikan tambatan kanan [E] untuk menurunkan dek jembatan Balkut sepenuhnya!',
  dialogue:{
   id:'cp-18-2',npc:'Orsuk',title:'Jembatan Terbuka, Kepungan Menanti',node:'n0',
   nodes:{
    n0:{speaker:'Nara',text:'Dek jembatan turun! Ayo, Kak Orsuk, bawa masuk kereta garamnya sekarang!',next:'n1'},
    n1:{speaker:'Orsuk',text:'(Kereta-kereta kerbau Balkut meluncur mulus melintasi jembatan—namun di ujung padang, barisan penunggang kuda berat Panji Dolgak langsung mengepung mereka dengan tombak terhunus!)',next:'n2'},
    n2:{speaker:'Orsuk',text:'Tahan tombak kalian, Hurgak! Kami membawa kontrak garam damai dari Pos Tua Asharim—dan menurut Sumpah Api Tujuh Panji, utusan dagang berhak didengar di depan api sidang sebelum disentuh seujung jari pun!',next:'n3'},
    n3:{speaker:'Orsuk',text:'(Para penunggang kuda menggeram kesal, namun tidak berani melanggar Hukum Adat. Orsuk berbisik cepat kepada Nara.) Kita berhasil masuk ke perkemahan 47 tenda. Dengarkan suara para pemimpin panji dulu sebelum kita menghadap Odgar.',action:'CP_18_2'}
   }
  }
 },

 'cp-19-0':{
  hint:'Masuk ke Perkemahan Tujuh Panji di utara. Dekati tenda Panji Tua (sisi kiri) dan tekan [E] untuk mendengar tuntutan Dargun.',
  dialogue:seq('Dargun','Suara di sekitar Sidang Api',[
   ['Dargun','Seratus tujuh tahun lalu bangsa selatan membakar karavan kami di Tepi Salkara dan meninggalkan leluhur kami mati beku! Sekarang mereka mencekik kami dengan pajak garam saat ternak kami sekarat!'],
   ['Nara','(Di balik bayangan tenda di sudut sana, Nara sempat melihat Maruani membisikkan sesuatu tentang kelemahan pos-pos garam Asharim kepada pengawal Dargun sebelum menghilang!) Dia sengaja menyiram minyak ke bara perang...']
  ],'CP_19_0')
 },
 'cp-19-1':{
  hint:'Bergeser ke sisi kanan api unggun dan tekan [E] untuk mendengar sikap Salgur dari Panji Muda.',
  dialogue:seq('Salgur','Suara di sekitar Sidang Api',[
   ['Salgur','Menyerbu Asharim bukan menyelamatkan perut rakyat kita—itu cuma memberi alasan bagi Benteng Tata untuk membakar padang dengan pasukan gabungan dan menutup total jalur dagang selamanya!'],
   ['Nara','Tiga Panji Tua menuntut perang, tiga Panji Muda menolak. Kedudukan terkunci 3 lawan 3—semua mata kini tertuju pada Odgar, si pemegang suara penengah.']
  ],'CP_19_1')
 },
 'cp-19-2':{
  hint:'Temui Odgar (Panji Kadum) di bagian belakang lingkaran tenda [E] sebelum Sidang Api dimulai.',
  dialogue:seq('Odgar','Suara di sekitar Sidang Api',[
   ['Odgar','Aku menjaga batu tempat seluruh nama yang gugur dipahat, anak muda. Sebelum kau maju ke api sidang membawa nama Asharim, periksa dulu batu nama di belakangku—sepertinya batu tua itu ikut mendengung aneh sejak senja tadi.']
  ],'CP_19_2')
 },

 'cp-21-0':{
  hint:'Dekati Monolit Batu Nama di belakang Odgar dan tekan [E], lalu selaraskan getaran dengan tombol panah!',
  dialogue:{
   id:'cp-21-0',npc:'Nara',title:'Bisikan dari Monolit Batu Nama',node:'n0',
   nodes:{
    n0:{speaker:'Nara',text:'(Begitu getaran selaras, Cincin Perunggu di saku baju Nara bergetar dingin—menangkap serpihan Echoes tua yang bocor lewat jaringan batu penuntun dari Menara ke-9...)',next:'n1'},
    n1:{speaker:'Hemira',text:'“...tujuh menara redup mereka memompa tekanan balik ke selatan... dinding Bejana Batu tidak akan tahan bila dipaksa...”',next:'n2'},
    n2:{speaker:'Nara',text:'Itu bukan suara dari malam kebakaran Salkara—itu suara peringatan lama dari arah Menara ke-9 tentang menara Dewan Tetua dan Bejana Batu! Tapi Odgar memanggilku ke api sidang sekarang. Jangan sampai aku melupakan bisikan itu.',action:'CP_21_0'}
   }
  }
 },

 'cp-20-0':{
  hint:'Maju ke tengah Api Sidang Tujuh Panji dan tekan [E] untuk menyampaikan tawaran di hadapan Odgar!',
  dialogue:{
   id:'cp-20-0',npc:'Odgar',title:'Mandat di Depan Api Sidang',node:'n0',
   nodes:{
    n0:{speaker:'Odgar',text:'Tiga Panji Tua menuntut tombak, tiga Panji Muda meminta jalan dagang. Dan kau—seorang perintis muda dari Asharim—berdiri di depan api kami. Katakan dengan jujur di hadapan seluruh panji: apa yang sebenarnya kau bawa tanpa berpura-pura memiliki bukti kebakaran seratus tujuh tahun silam?',choices:[{text:'“Kami bawa kontrak garam damai Pos Tua—dan siap membuktikan kebenaran di Tepi Salkara!”',next:'n1'},{text:'“Kami sudah tahu siapa pembakar Tepi Salkara dan menuntut kalian tunduk!”',next:'retry'}]},
    retry:{speaker:'Orsuk',text:'Tahan lidahmu, Nara! Kita belum punya satu pun bukti sah dari reruntuhan pantai Tepi Salkara. Berbohong di depan api sama saja mengakhiri nyawa kita berdua. Coba sampaikan tawaran yang jujur!',next:'n0'},
    n1:{speaker:'Odgar',text:'(Odgar memandangi wajah Nara dan para pemimpin panji dalam hening yang berat, lalu menancapkan tongkat penandanya ke tanah.) Baik. Garam dari Pos Tua Asharim diterima sebagai niat baik. Genderang perang kutahan selama empat hari pergantian angin.',next:'n2'},
    n2:{speaker:'Odgar',text:'Jika kau dan Orsuk mampu kembali dari reruntuhan terlarang di pesisir Tepi Salkara membawa bukti sah atas apa yang terjadi pada malam seratus tujuh tahun lalu, jalur padang dibuka. Bila tidak—ketujuh panji akan bergerak ke selatan.',next:'n3'},
    n3:{speaker:'Orsuk',text:'Empat hari pergantian angin... Itu cukup untuk menembus pesisir utara, Nara. Ayo bersiap.',next:'n4'},
    n4:{speaker:'Nara',text:'(Saat Nara menatap jalan utara menuju Tepi Salkara, Cincin Perunggu di balik jubahnya kembali menyengat hangat ujung jarinya—tanda bahwa Maruani pun sedang bergerak ke arah yang sama.) Bab 1 belum usai... dan Menara Pertama tetap menanti.',action:'CP_20_0'}
   }
  }
 }
};

root.CINCIN_DIALOGUES=D;
})(typeof window!=='undefined'?window:globalThis);
