/* ============================================================================
 * Jalur Senyap — Complete 3/4 Isometric-Top-Down Painted Pixel World Data
 * Pixel scene mapping for the original Cincin Perunggu campaign:
 * - All 22 Story Sequences (`STORY.steps` from `src/cincin-story.js`)
 * - All 58 Sub-Objectives (`cp-0-0` to `cp-21-0`) & branching dialogues (`CINCIN_DIALOGUES`)
 * - All 10 Canonical Scenes mapped across 8 Dense Painted 1280x720 Pixel Maps
 * - All Optional POIs, Rumors, Five Nations Compendium (`GAME_DATA.canon.nations`),
 *   Equipment, Lagu Kerang Suara, and Mini-Games.
 * ============================================================================ */
(function (root) {
  'use strict';

  const WORLD_W = 1280;
  const WORLD_H = 720;
  const px = p => Math.round((p / 100) * WORLD_W);
  const py = p => Math.round((p / 100) * WORLD_H);

  // Map each of the 11 canonical `STORY.steps[i].scene` IDs to our 9 dense painted pixel maps
  const SCENE_TO_MAP = {
    nilasar: 'nilasar',
    sumi:    'sumi',
    senja:   'senja',
    kesa:    'gerbang',
    relay:   'simpul',
    sela:    'sela',
    canal:   'sela',
    border:  'balkut',
    cliff:   'balkut',
    camp:    'salkara',
    coast:   'tepisalkara'
  };

  // Exact world coordinates (in 1280x720 space) for every single one of the 58 canonical sub-objectives (`cp-0-0` .. `cp-21-0`)!
  const STEP_TARGETS = {
    // Seq 0: Bekal seorang perintis (nilasar)
    'cp-0-0': { map: 'nilasar', x: 640, y: 238, npc: 'marsiyah' },
    'cp-0-1': { map: 'nilasar', x: 474, y: 353, label: 'Ambil Tas Peredam Tseren [E]' },
    'cp-0-2': { map: 'nilasar', x: 832, y: 367, label: 'Uji Tali Tambat & Timbang Bekal [E]' },

    // Seq 1: Air yang bergetar (sumi)
    'cp-1-0': { map: 'sumi', x: 620, y: 514, label: 'Periksa Riak Sumur Induk [E]', minigame: 'resonance_tune' },
    'cp-1-1': { map: 'sumi', x: 426, y: 358, label: 'Periksa Retakan Saluran [E]' },
    'cp-1-2': { map: 'sumi', x: 849, y: 396, npc: 'bulamat' },

    // Seq 2: Ruru membaca lereng (senja)
    'cp-2-0': { map: 'senja', x: 605, y: 627, label: 'Periksa Pijakan Batu [E]', sonar: true },
    'cp-2-1': { map: 'senja', x: 656, y: 480, label: 'Periksa Tepi Longsoran [E]', sonar: true },
    'cp-2-2': { map: 'senja', x: 577, y: 393, label: 'Pasang Penanda Jalur Aman [E]', sonar: true },

    // Seq 3: Sketsa dari masa silam (senja)
    'cp-3-0': { map: 'senja', x: 737, y: 319, npc: 'jumel' },
    'cp-3-1': { map: 'senja', x: 586, y: 391, label: 'Baca Catatan Ban Jumel [E]' },
    'cp-3-2': { map: 'senja', x: 737, y: 319, npc: 'jumel' },

    // Seq 4: Muatan di Gerbang Timur (kesa -> gerbang)
    'cp-4-0': { map: 'gerbang', x: 205, y: 590, label: 'Periksa Ikatan Minyak Lentera [E]' },
    'cp-4-1': { map: 'gerbang', x: 358, y: 490, label: 'Periksa Kontrak Kafilah [E]' },
    'cp-4-2': { map: 'gerbang', x: 560, y: 386, npc: 'kesa', minigame: 'negotiate_kesa' },

    // Seq 5: Apa yang dicari Dewan? (kesa -> gerbang stealth)
    'cp-5-0': { map: 'gerbang', x: 256, y: 403, label: 'Baca Pengumuman Razia [E]', stealth: true },
    'cp-5-1': { map: 'gerbang', x: 422, y: 374, label: 'Periksa Daftar Barang Sitaan [E]', stealth: true },
    'cp-5-2': { map: 'gerbang', x: 474, y: 518, label: 'Baca Perintah Pencarian Dewan [E]', stealth: true },

    // Seq 6: Pulang sebelum badai (nilasar storm)
    'cp-6-0': { map: 'nilasar', x: 1037, y: 403, label: 'Berteduh di Jalur Teduh [E]', storm: true },
    'cp-6-1': { map: 'nilasar', x: 640, y: 446, label: 'Periksa Halaman Pos [E]', storm: true },
    'cp-6-2': { map: 'nilasar', x: 640, y: 238, npc: 'marsiyah', storm: true },

    // Seq 7: Cincin di balik bata (nilasar)
    'cp-7-0': { map: 'nilasar', x: 742, y: 223, label: 'Buka Bata Tersegel [E]', sonar: true },
    'cp-7-1': { map: 'nilasar', x: 691, y: 230, label: 'Buka Kain Pembungkus [E]' },
    'cp-7-2': { map: 'nilasar', x: 640, y: 238, npc: 'marsiyah' },

    // Seq 8: Celah di tengah badai (relay -> simpul)
    'cp-8-0': { map: 'gerbang', x: 560, y: 386, npc: 'kesa', storm: true },
    'cp-8-1': { map: 'simpul', x: 866, y: 471, label: 'Berlindung di Pelindung Tebing [E]', storm: true },
    'cp-8-2': { map: 'simpul', x: 937, y: 442, label: 'Periksa Lempeng Pemeriksaan [E]', storm: true },

    // Seq 9: Detak yang dikenali batu (relay -> simpul)
    'cp-9-0': { map: 'simpul', x: 997, y: 439, label: 'Selaraskan Lempeng Menara ke-9 [E]', minigame: 'resonance_simpul' },

    // Seq 10: Siluet di punggung bukit (relay -> simpul)
    'cp-10-0': { map: 'simpul', x: 1046, y: 526, label: 'Periksa Jejak di Pasir [E]', sonar: true },
    'cp-10-1': { map: 'simpul', x: 1137, y: 435, label: 'Amati Kilau Garpu Tala [E]' },
    'cp-10-2': { map: 'simpul', x: 1052, y: 627, label: 'Ambil Jalur Turun Aman [E]' },

    // Seq 11: Jalan keluar Pos Nilasar (nilasar)
    'cp-11-0': { map: 'nilasar', x: 640, y: 238, npc: 'marsiyah' },
    'cp-11-1': { map: 'nilasar', x: 832, y: 367, label: 'Ambil Bekal Perjalanan Timur [E]' },
    'cp-11-2': { map: 'nilasar', x: 1088, y: 403, label: 'Periksa Penanda Rute Sela [E]' },

    // Seq 12: Dusun yang menampung pelarian (sela)
    'cp-12-0': { map: 'sela', x: 286, y: 458, label: 'Periksa Tenda Pengungsi [E]' },
    'cp-12-1': { map: 'sela', x: 435, y: 389, label: 'Susuri Jalur Rumah Dusun [E]' },
    'cp-12-2': { map: 'sela', x: 512, y: 254, npc: 'ima' },

    // Seq 13: Di bawah alat tenun (sela)
    'cp-13-0': { map: 'sela', x: 512, y: 254, label: 'Palang Pintu Kayu Rumah Ima [E]' },
    'cp-13-1': { map: 'sela', x: 620, y: 280, label: 'Buka Kotak di Bawah Alat Tenun [E]', minigame: 'loom_ima' },
    'cp-13-2': { map: 'sela', x: 545, y: 271, npc: 'ima' },

    // Seq 14: Daftar nama di tepi kanal (canal -> sela right half)
    'cp-14-0': { map: 'sela', x: 896, y: 108, label: 'Lintasi Jembatan Kanal [E]', stealth: true },
    'cp-14-1': { map: 'sela', x: 1114, y: 407, label: 'Periksa Buku Daftar Pelintas [E]', stealth: true },
    'cp-14-2': { map: 'sela', x: 895, y: 605, label: 'Ambil Jalur Tanpa Pengintai [E]', stealth: true },

    // Seq 15: Garam untuk karavan Balkut (border -> balkut)
    'cp-15-0': { map: 'balkut', x: 310, y: 506, label: 'Periksa Garam Batangan [E]' },
    'cp-15-1': { map: 'balkut', x: 208, y: 494, label: 'Periksa Tali Tambat Pedati [E]' },
    'cp-15-2': { map: 'balkut', x: 443, y: 438, npc: 'orsuk' },

    // Seq 16: Sapaan melalui meja batu (border -> balkut)
    'cp-16-0': { map: 'balkut', x: 369, y: 485, npc: 'maruani' },

    // Seq 17: Jalan di atas blokade (cliff -> balkut upper path)
    'cp-17-0': { map: 'balkut', x: 752, y: 597, label: 'Periksa Pijakan Lereng Tebing [E]', sonar: true, stealth: true },
    'cp-17-1': { map: 'balkut', x: 706, y: 448, label: 'Periksa Batu Tambatan [E]', stealth: true },
    'cp-17-2': { map: 'balkut', x: 681, y: 355, label: 'Capai Puncak Celah Balkut [E]', stealth: true },

    // Seq 18: Turunkan jembatan tambat (cliff -> balkut winches)
    'cp-18-0': { map: 'balkut', x: 720, y: 298, label: 'Kerekan Tambatan Kiri [E]' },
    'cp-18-1': { map: 'balkut', x: 764, y: 315, label: 'Kerekan Utama Tengah [E]', minigame: 'winch_2' },
    'cp-18-2': { map: 'balkut', x: 815, y: 308, label: 'Kerekan Tambatan Kanan [E]' },

    // Seq 19: Suara di sekitar Sidang Api (camp -> salkara)
    'cp-19-0': { map: 'salkara', x: 717, y: 306, npc: 'dargun' },
    'cp-19-1': { map: 'salkara', x: 870, y: 374, npc: 'salgur' },
    'cp-19-2': { map: 'salkara', x: 538, y: 374, npc: 'odgar' },

    // Seq 20: Tawaran di depan api (camp -> salkara)
    'cp-20-0': { map: 'salkara', x: 704, y: 403, label: 'Maju ke Api Sidang Tujuh Panji [E]', minigame: 'council_odgar' },

    // Seq 21: Dengung Batu Nama (camp -> salkara)
    'cp-21-0': { map: 'salkara', x: 333, y: 223, label: 'Selaraskan Monolit Batu Nama [E]', minigame: 'resonance_batunama' },

    // Seq 22: Suara empat panji lainnya (camp -> salkara)
    'cp-22-0': { map: 'salkara', x: 628, y: 264, npc: 'hurgak' },
    'cp-22-1': { map: 'salkara', x: 812, y: 310, npc: 'kutlak' },
    'cp-22-2': { map: 'salkara', x: 848, y: 445, npc: 'borlan' },
    'cp-22-3': { map: 'salkara', x: 534, y: 448, npc: 'burgul' },

    // Seq 23: Jejak sabotase di perkemahan (camp -> salkara)
    'cp-23-0': { map: 'salkara', x: 465, y: 588, label: 'Periksa Peti Garam Berminyak [E]', sonar: true, stealth: true },
    'cp-23-1': { map: 'salkara', x: 748, y: 598, label: 'Kunci Ulang Katup Lentera Sabotase [E]' },
    'cp-23-2': { map: 'salkara', x: 935, y: 505, label: 'Hadapi Penyusup & Kuatkan Janji Orsuk [E]' },

    // Seq 24: Gema seratus tujuh tahun (coast -> tepisalkara)
    'cp-24-0': { map: 'tepisalkara', x: 585, y: 225, label: 'Dengarkan Batu Pesisir Bernyanyi [E]', sonar: true },
    'cp-24-1': { map: 'tepisalkara', x: 295, y: 232, label: 'Cocokkan Denah Tungku Dapur Pos Karavan [E]' },
    'cp-24-2': { map: 'tepisalkara', x: 1085, y: 292, label: 'Telusuri Arah Angin & Bangkai Kapal Bahtari [E]', minigame: 'wind_chronicle' },

    // Seq 25: Gema Maruani & pengakuan Dargun (coast -> tepisalkara)
    'cp-25-0': { map: 'tepisalkara', x: 775, y: 272, label: 'Selaraskan Batu Pesisir Timur dari Gema Maruani [E]' },
    'cp-25-1': { map: 'tepisalkara', x: 685, y: 315, npc: 'dargun-pesisir', minigame: 'confront_dargun' },

    // Seq 26: Meterai gencatan senjata Salkara (camp -> salkara)
    'cp-26-0': { map: 'salkara', x: 595, y: 374, label: 'Serahkan Mandat Bukti ke Api Sidang Odgar [E]' }
  };

  // Equipment Compendium (from original journal)
  const EQUIPMENT = [
    { name: 'Tas Peredam Tseren', tag: 'WARISAN SAHDAN', desc: 'Tas kulit tua berlapis benang peredam serat Tseren. Menjaga gema perunggu tetap teduh dari pantauan garpu tala Dewan.' },
    { name: 'Jubah Layar Perintis', tag: 'PERINTIS NILASAR', desc: 'Jubah tenun ganda yang melindungi perintis dari terpaan pasir Ngarai Barat dan dinginnya angin tebing.' },
    { name: 'Cincin Perunggu Lulanai', tag: 'GARIS SURUT · 009', desc: 'Cincin perunggu kusam tanpa permata yang tersimpan di balik bata dapur Pos Nilasar sejak Tahun 72 Post-Senyap. Mengunci pada detak nadi Nara.' },
    { name: 'Kerang Suara Telaga', tag: 'AKUSTIK SUMI', desc: 'Cangkang kerang akustik milik Bu Lamit yang menyimpan rekaman Lagu Kerang Suara dari masa sebelum Hari Senyap.' },
    { name: 'Tali Tambat Kafilah', tag: 'KAFILAH BALKUT', desc: 'Tali serat rami berlapis lilin untuk mengikat muatan garam dan menarik kerekan Jembatan Tambat Balkut.' },
    { name: 'Lentera Ekor Ruru', tag: 'SAHABAT PERJALANAN', desc: 'Lentera kuningan mungil di ujung ekor Ruru. Memancarkan gelombang sonar untuk membaca rongga pasir dan jejak tersembunyi.' }
  ];

  const NEGOTIATIONS = {}; // Retained export shape; use canonical dialogue graphs.

  // All 8 Dense Painted 1280x720 Pixel Maps covering all 10 Story Scenes
  // Ground contours in native 1280 x 720 image coordinates.
  // Only walkPolygons permit travel; blockPolygons cut out solid scenery.
  // Physics further insets these surfaces by the complete elliptical foot.
  const MAPS = {
    "nilasar": {
      "name": "Pos Nilasar",
      "subtitle": "BAB 0 · Karavanserai Kubah Biru & Pasar Teduh",
      "bg": "bg-nilasar",
      "spawn": [640,590],
      "walkPolygons": [
        [
          [334,393],
          [455,350],
          [565,340],
          [725,340],
          [819,381],
          [938,421],
          [1001,413],
          [995,470],
          [905,502],
          [788,526],
          [773,606],
          [704,624],
          [590,624],
          [571,579],
          [459,537],
          [335,578],
          [269,575],
          [266,518]
        ],
        [
          [572,252],
          [718,252],
          [718,350],
          [572,350]
        ],
        [
          [480,230],
          [578,229],
          [578,219],
          [700,219],
          [716,211],
          [810,222],
          [813,259],
          [480,259]
        ],
        [
          [587,607],
          [700,607],
          [701,692],
          [580,706]
        ],
        [
          [269,552],
          [336,571],
          [332,615],
          [229,652],
          [144,679],
          [109,650],
          [155,613],
          [222,585]
        ],
        [
          [932,403],
          [1055,389],
          [1140,369],
          [1249,385],
          [1260,421],
          [1131,438],
          [1059,454],
          [979,477]
        ],
        [
          [1124,396],
          [1130,338],
          [1151,301],
          [1153,234],
          [1210,230],
          [1215,302],
          [1191,349],
          [1195,392]
        ],
        [
          [1110,165],
          [1171,150],
          [1204,182],
          [1210,241],
          [1150,242],
          [1152,203]
        ]
      ],
      "blockPolygons": [
        [
          [692,453],
          [691,459],
          [688,465],
          [684,470],
          [678,475],
          [671,479],
          [663,482],
          [654,483],
          [645,484],
          [636,483],
          [627,482],
          [619,479],
          [612,475],
          [606,470],
          [602,465],
          [599,459],
          [598,453],
          [599,447],
          [602,441],
          [606,436],
          [612,431],
          [619,427],
          [627,424],
          [636,423],
          [645,422],
          [654,423],
          [663,424],
          [671,427],
          [678,431],
          [684,436],
          [688,441],
          [691,447]
        ],
        [
          [575,413],
          [609,398],
          [612,436],
          [579,453]
        ],
        [
          [680,409],
          [710,416],
          [727,452],
          [691,468]
        ],
        [
          [600,480],
          [614,478],
          [620,502],
          [598,501]
        ],
        [
          [397,360],
          [477,340],
          [492,397],
          [432,429],
          [400,420]
        ],
        [
          [310,380],
          [370,390],
          [381,450],
          [357,480],
          [332,479],
          [314,452]
        ]
      ],
      "lights": [
        [46,26],
        [54,26],
        [49,54],
        [51,54],
        [39,71],
        [45,76],
        [68,66]
      ],
      "npcs": [
        {
          "id": "marsiyah",
          "name": "Bu Marsiyah",
          "sprite": "npc-marsiyah",
          "x": 640,
          "y": 238
        },
        {
          "id": "pedagang-garam",
          "name": "Pedagang Garam",
          "sprite": "npc-pedagang-asharim",
          "x": 459,
          "y": 434,
          "poiText": "Garam batangan masih bisa ditimbang. Keping Tata berubah nilai, tetapi karavan tetap butuh bekal yang dapat dipercaya."
        },
        {
          "id": "juru-air",
          "name": "Juru Air Nilasar",
          "sprite": "npc-wilanu",
          "x": 770,
          "y": 468,
          "poiText": "Air tidak bertanya nama. Di dalam patok pos, pertengkaran harus berhenti. Isi wadah secukupnya; rombongan berikutnya juga perlu minum."
        }
      ],
      "exits": [
        {
          "x": 205,
          "y": 605,
          "r": 50,
          "to": "sumi",
          "spawn": [1140,390],
          "label": "Telaga Sumi (Barat)"
        },
        {
          "x": 1179,
          "y": 190,
          "r": 44,
          "to": "senja",
          "spawn": [609,640],
          "label": "Menara Senja (Utara)"
        },
        {
          "x": 1203,
          "y": 410,
          "r": 42,
          "to": "gerbang",
          "spawn": [179,634],
          "label": "Gerbang Timur / Dusun Sela"
        }
      ]
    },
    "sumi": {
      "name": "Telaga Sumi",
      "subtitle": "BAB 0 · Teras Air Pirus & Sumur Induk",
      "bg": "bg-sumi",
      "spawn": [1170,390],
      "walkPolygons": [
        [
          [393,336],
          [430,297],
          [504,265],
          [593,252],
          [681,265],
          [736,285],
          [776,320],
          [806,357],
          [807,402],
          [770,458],
          [711,500],
          [630,524],
          [527,520],
          [448,490],
          [407,440],
          [391,390]
        ],
        [
          [747,309],
          [825,315],
          [875,358],
          [947,385],
          [1050,382],
          [1080,351],
          [1247,341],
          [1259,411],
          [1069,430],
          [1020,419],
          [933,442],
          [801,438],
          [770,408]
        ],
        [
          [216,221],
          [244,190],
          [284,180],
          [319,192],
          [339,205],
          [365,213],
          [408,240],
          [440,268],
          [474,300],
          [453,322],
          [424,294],
          [393,271],
          [363,254],
          [329,234],
          [298,227],
          [277,239],
          [237,251],
          [210,249]
        ],
        [
          [455,430],
          [490,470],
          [428,512],
          [388,580],
          [343,573],
          [371,506]
        ],
        [
          [375,553],
          [394,584],
          [446,604],
          [445,636],
          [396,652],
          [371,689],
          [272,665],
          [189,619],
          [205,579],
          [265,558],
          [319,571]
        ],
        [
          [714,440],
          [754,450],
          [808,479],
          [859,537],
          [879,562],
          [847,583],
          [803,550],
          [780,514],
          [726,489],
          [707,472]
        ],
        [
          [832,557],
          [878,580],
          [923,602],
          [996,578],
          [1047,585],
          [1049,612],
          [971,651],
          [872,674],
          [752,681],
          [692,653],
          [735,622],
          [797,608]
        ]
      ],
      "blockPolygons": [
        [
          [764,409],
          [761,425],
          [753,441],
          [739,455],
          [721,468],
          [698,478],
          [673,486],
          [645,490],
          [616,492],
          [587,490],
          [559,486],
          [534,478],
          [511,468],
          [493,455],
          [479,441],
          [471,425],
          [468,409],
          [471,393],
          [479,377],
          [493,363],
          [511,350],
          [534,340],
          [559,332],
          [587,328],
          [616,326],
          [645,328],
          [673,332],
          [698,340],
          [721,350],
          [739,363],
          [753,377],
          [761,393]
        ],
        [
          [696,243],
          [749,249],
          [765,279],
          [735,291],
          [692,274]
        ]
      ],
      "lights": [
        [57,25],
        [33,46],
        [67,56],
        [50,88]
      ],
      "npcs": [
        {
          "id": "bulamat",
          "name": "Bu Lamit",
          "sprite": "npc-bulamat",
          "x": 849,
          "y": 396,
          "hasShellSong": true
        }
      ],
      "hazards": [
        { "id": "sumi-sand-drift", "kind": "slick", "name": "Rembesan Pasir Sumi", "x": 415, "y": 515, "r": 36 }
      ],
      "exits": [
        {
          "x": 1203,
          "y": 390,
          "r": 52,
          "to": "nilasar",
          "spawn": [282,576],
          "label": "Pos Nilasar (Timur)"
        }
      ]
    },
    "senja": {
  "name": "Menara Senja",
  "subtitle": "BAB 0 · Lereng Longsoran & Pos Pengamat Ban Jumel",
  "bg": "bg-senja",
  "spawn": [
    609,
    620
  ],
  "lights": [
    [
      40,
      12
    ],
    [
      27,
      46
    ],
    [
      22,
      60
    ],
    [
      68,
      60
    ],
    [
      83,
      14
    ]
  ],
  "npcs": [
    {
      "id": "jumel",
      "name": "Pak Jumel",
      "sprite": "npc-jumel",
      "x": 737,
      "y": 319
    }
  ],
  "hazards": [
    { "id": "senja-ridge-gust", "kind": "wind_gust", "name": "Hembusan Lereng Senja", "x": 652, "y": 364, "r": 38, "period": 5.8, "activeFrom": 0.62, "push": [-16, 10], "damage": 2, "clearedOnce": "cp-3-2" }
  ],
  "exits": [
    {
      "x": 615,
      "y": 691,
      "r": 52,
      "to": "nilasar",
      "spawn": [
        1165,
        274
      ],
      "label": "Pos Nilasar (Selatan)"
    }
  ],
  "walkSurfaces": [
    {
      "id": "arrival-terrace",
      "label": "Teras kedatangan",
      "polygon": [
        [
          392,
          590
        ],
        [
          432,
          570
        ],
        [
          509,
          603
        ],
        [
          596,
          608
        ],
        [
          667,
          575
        ],
        [
          718,
          594
        ],
        [
          743,
          634
        ],
        [
          695,
          674
        ],
        [
          686,
          708
        ],
        [
          510,
          708
        ],
        [
          500,
          663
        ],
        [
          403,
          642
        ]
      ]
    },
    {
      "id": "lower-stairs",
      "label": "Anak tangga bawah",
      "polygon": [
        [
          643,
          584
        ],
        [
          675,
          597
        ],
        [
          710,
          542
        ],
        [
          742,
          518
        ],
        [
          720,
          493
        ],
        [
          697,
          516
        ],
        [
          681,
          535
        ]
      ]
    },
    {
      "id": "middle-ledge",
      "label": "Pelataran batu tengah",
      "polygon": [
        [
          668,
          494
        ],
        [
          700,
          514
        ],
        [
          726,
          519
        ],
        [
          814,
          489
        ],
        [
          890,
          473
        ],
        [
          906,
          444
        ],
        [
          879,
          425
        ],
        [
          809,
          447
        ],
        [
          744,
          459
        ],
        [
          696,
          465
        ]
      ]
    },
    {
      "id": "middle-stairs",
      "label": "Anak tangga tengah",
      "polygon": [
        [
          639,
          482
        ],
        [
          671,
          502
        ],
        [
          704,
          486
        ],
        [
          677,
          460
        ],
        [
          648,
          438
        ],
        [
          627,
          413
        ],
        [
          598,
          423
        ],
        [
          601,
          443
        ]
      ]
    },
    {
      "id": "shrine-terrace",
      "label": "Pelataran altar",
      "polygon": [
        [
          506,
          365
        ],
        [
          579,
          364
        ],
        [
          603,
          380
        ],
        [
          661,
          372
        ],
        [
          681,
          398
        ],
        [
          645,
          423
        ],
        [
          598,
          437
        ],
        [
          547,
          422
        ],
        [
          505,
          407
        ]
      ]
    },
    {
      "id": "upper-stairs",
      "label": "Anak tangga menuju menara",
      "polygon": [
        [
          627,
          374
        ],
        [
          657,
          393
        ],
        [
          689,
          372
        ],
        [
          710,
          352
        ],
        [
          749,
          337
        ],
        [
          761,
          313
        ],
        [
          735,
          304
        ],
        [
          707,
          315
        ],
        [
          695,
          342
        ],
        [
          652,
          351
        ]
      ]
    },
    {
      "id": "tower-doorstep",
      "label": "Ambang pintu menara",
      "polygon": [
        [
          704,
          317
        ],
        [
          722,
          309
        ],
        [
          752,
          310
        ],
        [
          780,
          306
        ],
        [
          804,
          313
        ],
        [
          790,
          328
        ],
        [
          751,
          340
        ],
        [
          711,
          341
        ]
      ]
    },
    {
      "id": "upper-bridge-deck",
      "label": "Papan jembatan atas",
      "polygon": [
        [
          368,
          393
        ],
        [
          412,
          400
        ],
        [
          465,
          398
        ],
        [
          507,
          387
        ],
        [
          511,
          402
        ],
        [
          466,
          416
        ],
        [
          412,
          418
        ],
        [
          368,
          410
        ]
      ]
    },
    {
      "id": "west-terrace",
      "label": "Pelataran reruntuhan barat",
      "polygon": [
        [
          192,
          414
        ],
        [
          267,
          392
        ],
        [
          328,
          371
        ],
        [
          368,
          386
        ],
        [
          369,
          422
        ],
        [
          323,
          448
        ],
        [
          285,
          478
        ],
        [
          225,
          503
        ],
        [
          153,
          516
        ],
        [
          139,
          491
        ]
      ]
    },
    {
      "id": "lower-bridge-deck",
      "label": "Papan jembatan bawah",
      "polygon": [
        [
          264,
          485
        ],
        [
          285,
          478
        ],
        [
          316,
          507
        ],
        [
          346,
          529
        ],
        [
          378,
          548
        ],
        [
          430,
          568
        ],
        [
          415,
          585
        ],
        [
          369,
          567
        ],
        [
          323,
          541
        ],
        [
          285,
          513
        ]
      ]
    },
    {
      "id": "lower-bridge-landing",
      "label": "Ujung papan ke teras selatan",
      "polygon": [
        [
          406,
          562
        ],
        [
          435,
          561
        ],
        [
          450,
          585
        ],
        [
          427,
          607
        ],
        [
          400,
          593
        ]
      ]
    },
    {
      "id": "west-bridge-landing",
      "label": "Sambungan ujung barat jembatan bawah",
      "polygon": [
        [
          247,
          468
        ],
        [
          274,
          454
        ],
        [
          295,
          469
        ],
        [
          300,
          489
        ],
        [
          281,
          507
        ],
        [
          264,
          491
        ],
        [
          246,
          487
        ]
      ]
    }
  ],
  "collisionObjects": [
    {
      "id": "south-tree",
      "label": "Pohon dan batu di teras selatan",
      "polygon": [
        [
          405,
          628
        ],
        [
          431,
          618
        ],
        [
          473,
          626
        ],
        [
          495,
          651
        ],
        [
          497,
          696
        ],
        [
          460,
          713
        ],
        [
          412,
          696
        ],
        [
          400,
          661
        ]
      ]
    },
    {
      "id": "south-shrub",
      "label": "Semak di jalur selatan",
      "polygon": [
        [
          546,
          654
        ],
        [
          562,
          650
        ],
        [
          576,
          664
        ],
        [
          579,
          691
        ],
        [
          559,
          695
        ],
        [
          543,
          678
        ]
      ]
    },
    {
      "id": "south-east-rock",
      "label": "Batu tepi timur teras selatan",
      "polygon": [
        [
          685,
          619
        ],
        [
          704,
          614
        ],
        [
          719,
          630
        ],
        [
          711,
          651
        ],
        [
          690,
          667
        ],
        [
          677,
          653
        ]
      ]
    },
    {
      "id": "central-cliff",
      "label": "Dinding tebing di antara dua pelataran",
      "polygon": [
        [
          510,
          449
        ],
        [
          548,
          447
        ],
        [
          579,
          461
        ],
        [
          600,
          483
        ],
        [
          603,
          556
        ],
        [
          578,
          582
        ],
        [
          539,
          583
        ],
        [
          514,
          557
        ]
      ]
    },
    {
      "id": "middle-boulders",
      "label": "Bongkah batu pelataran tengah",
      "polygon": [
        [
          773,
          451
        ],
        [
          785,
          437
        ],
        [
          803,
          437
        ],
        [
          820,
          452
        ],
        [
          826,
          465
        ],
        [
          806,
          472
        ],
        [
          780,
          469
        ]
      ]
    },
    {
      "id": "middle-rock",
      "label": "Batu kecil dekat tangga tengah",
      "polygon": [
        [
          723,
          476
        ],
        [
          730,
          467
        ],
        [
          740,
          470
        ],
        [
          745,
          481
        ],
        [
          734,
          488
        ]
      ]
    },
    {
      "id": "east-tree",
      "label": "Pohon lereng timur",
      "polygon": [
        [
          741,
          501
        ],
        [
          758,
          492
        ],
        [
          786,
          501
        ],
        [
          803,
          524
        ],
        [
          796,
          555
        ],
        [
          777,
          574
        ],
        [
          743,
          574
        ],
        [
          732,
          553
        ]
      ]
    },
    {
      "id": "west-arch",
      "label": "Kaki gerbang reruntuhan barat",
      "polygon": [
        [
          136,
          418
        ],
        [
          160,
          397
        ],
        [
          178,
          402
        ],
        [
          190,
          424
        ],
        [
          206,
          442
        ],
        [
          199,
          460
        ],
        [
          174,
          469
        ],
        [
          141,
          458
        ]
      ]
    },
    {
      "id": "fallen-column",
      "label": "Kolom roboh di utara pelataran barat",
      "polygon": [
        [
          268,
          356
        ],
        [
          294,
          337
        ],
        [
          319,
          344
        ],
        [
          330,
          361
        ],
        [
          316,
          382
        ],
        [
          285,
          393
        ],
        [
          265,
          382
        ]
      ]
    },
    {
      "id": "west-rubble",
      "label": "Puing di tepi barat",
      "polygon": [
        [
          209,
          499
        ],
        [
          223,
          491
        ],
        [
          239,
          496
        ],
        [
          245,
          507
        ],
        [
          229,
          520
        ],
        [
          213,
          515
        ]
      ]
    },
    {
      "id": "altar-base",
      "label": "Kaki altar batu",
      "polygon": [
        [
          552,
          331
        ],
        [
          589,
          328
        ],
        [
          606,
          345
        ],
        [
          604,
          367
        ],
        [
          586,
          374
        ],
        [
          555,
          366
        ]
      ]
    },
    {
      "id": "altar-rock",
      "label": "Batu dekat tikungan altar",
      "polygon": [
        [
          568,
          414
        ],
        [
          579,
          409
        ],
        [
          591,
          416
        ],
        [
          592,
          430
        ],
        [
          575,
          434
        ],
        [
          564,
          425
        ]
      ]
    },
    {
      "id": "tower-wall",
      "label": "Dinding dasar menara",
      "polygon": [
        [
          680,
          262
        ],
        [
          710,
          282
        ],
        [
          754,
          287
        ],
        [
          799,
          270
        ],
        [
          833,
          253
        ],
        [
          839,
          283
        ],
        [
          825,
          307
        ],
        [
          786,
          316
        ],
        [
          752,
          309
        ],
        [
          726,
          312
        ],
        [
          696,
          308
        ],
        [
          678,
          292
        ]
      ]
    },
    {
      "id": "upper-bridge-north-rope",
      "label": "Pagar utara jembatan atas",
      "polygon": [
        [
          366,
          368
        ],
        [
          415,
          377
        ],
        [
          466,
          376
        ],
        [
          508,
          364
        ],
        [
          508,
          386
        ],
        [
          465,
          397
        ],
        [
          412,
          399
        ],
        [
          366,
          392
        ]
      ]
    },
    {
      "id": "upper-bridge-south-rope",
      "label": "Pagar selatan jembatan atas",
      "polygon": [
        [
          368,
          413
        ],
        [
          412,
          420
        ],
        [
          466,
          418
        ],
        [
          510,
          405
        ],
        [
          510,
          413
        ],
        [
          466,
          426
        ],
        [
          412,
          428
        ],
        [
          368,
          421
        ]
      ]
    },
    {
      "id": "lower-bridge-north-rope",
      "label": "Pagar utara jembatan bawah",
      "polygon": [
        [
          275,
          470
        ],
        [
          298,
          488
        ],
        [
          333,
          508
        ],
        [
          376,
          535
        ],
        [
          432,
          554
        ],
        [
          430,
          562
        ],
        [
          374,
          541
        ],
        [
          331,
          516
        ],
        [
          294,
          493
        ],
        [
          282,
          484
        ]
      ]
    },
    {
      "id": "lower-bridge-south-rope",
      "label": "Pagar selatan jembatan bawah",
      "polygon": [
        [
          279,
          516
        ],
        [
          321,
          545
        ],
        [
          367,
          571
        ],
        [
          413,
          590
        ],
        [
          413,
          597
        ],
        [
          365,
          578
        ],
        [
          318,
          552
        ],
        [
          275,
          523
        ]
      ]
    }
  ]
},
    "gerbang": {
      "name": "Gerbang Timur",
      "subtitle": "BAB 0 · Pos Pemeriksaan Dewan Tetua",
      "bg": "bg-gerbang",
      "spawn": [179,634],
      "walkPolygons": [
        [
          [54,678],
          [112,631],
          [178,594],
          [241,563],
          [269,520],
          [319,486],
          [329,429],
          [291,410],
          [285,389],
          [345,394],
          [407,397],
          [486,386],
          [535,365],
          [590,367],
          [613,389],
          [592,429],
          [540,459],
          [471,478],
          [432,524],
          [390,553],
          [378,609],
          [336,645],
          [306,668],
          [282,708],
          [61,708]
        ]
      ],
      "blockPolygons": [
        [
          [385,574],
          [422,553],
          [471,581],
          [481,630],
          [435,653],
          [385,638]
        ],
        [
          [271,596],
          [294,596],
          [296,624],
          [271,625]
        ],
        [
          [343,377],
          [426,376],
          [432,405],
          [398,414],
          [360,407]
        ]
      ],
      "lights": [
        [39,41],
        [48,49],
        [42,13],
        [52,20]
      ],
      "npcs": [
        {
          "id": "kesa",
          "name": "Komandan Kesa",
          "sprite": "npc-kesa",
          "x": 560,
          "y": 386
        }
      ],
      "patrols": [
        {
          "id": "guard-1",
          "name": "Pengawal Dewan",
          "sprite": "npc-kesa",
          "waypoints": [
            [357,428],
            [535,409]
          ],
          "speed": 72,
          "visionDist": 135,
          "visionAngle": 0.48
        },
        {
          "id": "guard-2",
          "name": "Pengawal Gerbang",
          "sprite": "npc-kesa",
          "waypoints": [
            [260,550],
            [350,483]
          ],
          "speed": 68,
          "visionDist": 130,
          "visionAngle": 0.48
        }
      ],
      "hazards": [
        { "id": "gerbang-dust-squall", "kind": "wind_gust", "name": "Debu Gerbang Timur", "x": 436, "y": 436, "r": 40, "period": 6.0, "activeFrom": 0.60, "push": [-18, 8], "damage": 2 }
      ],
      "exits": [
        {
          "x": 102,
          "y": 655,
          "r": 48,
          "to": "nilasar",
          "spawn": [1075,403],
          "label": "Pos Nilasar (Barat)"
        },
        {
          "x": 565,
          "y": 377,
          "r": 46,
          "to": "simpul",
          "spawn": [850,471],
          "label": "Menara Simpul ke-9"
        },
        {
          "x": 342,
          "y": 602,
          "r": 44,
          "to": "sela",
          "spawn": [346,590],
          "label": "Jalur Dusun Sela (Bab 1)"
        }
      ],
      "coverRects": []
    },
    "simpul": {
  "name": "Menara Simpul ke-9",
  "subtitle": "BAB 0 · Pelataran Basal & Gema Garis Surut",
  "bg": "bg-gerbang",
  "spawn": [
    850,
    471
  ],
  "walkPolygons": [
    [
      [
        768,
        433
      ],
      [
        824,
        419
      ],
      [
        862,
        394
      ],
      [
        882,
        365
      ],
      [
        929,
        331
      ],
      [
        978,
        348
      ],
      [
        1007,
        379
      ],
      [
        1084,
        379
      ],
      [
        1149,
        400
      ],
      [
        1158,
        449
      ],
      [
        1124,
        487
      ],
      [
        1094,
        524
      ],
      [
        1003,
        556
      ],
      [
        930,
        562
      ],
      [
        847,
        537
      ],
      [
        812,
        498
      ],
      [
        769,
        479
      ]
    ],
    [
      [
        1048,
        511
      ],
      [
        1090,
        516
      ],
      [
        1131,
        555
      ],
      [
        1134,
        595
      ],
      [
        1093,
        618
      ],
      [
        1059,
        599
      ],
      [
        1039,
        581
      ],
      [
        1004,
        559
      ]
    ],
    [
      [
        935,
        621
      ],
      [
        981,
        613
      ],
      [
        1031,
        612
      ],
      [
        1080,
        593
      ],
      [
        1134,
        613
      ],
      [
        1134,
        646
      ],
      [
        1096,
        663
      ],
      [
        1066,
        696
      ],
      [
        1001,
        701
      ],
      [
        933,
        655
      ]
    ],
    [
      [
        775,
        417
      ],
      [
        811,
        359
      ],
      [
        853,
        318
      ],
      [
        888,
        302
      ],
      [
        928,
        292
      ],
      [
        960,
        320
      ],
      [
        956,
        350
      ],
      [
        912,
        383
      ],
      [
        862,
        424
      ],
      [
        810,
        448
      ]
    ]
  ],
  "blockPolygons": [
    [
      [
        957,
        349
      ],
      [
        992,
        366
      ],
      [
        1048,
        365
      ],
      [
        1091,
        385
      ],
      [
        1073,
        404
      ],
      [
        1015,
        413
      ],
      [
        960,
        394
      ],
      [
        941,
        376
      ]
    ],
    [
      [
        1071,
        431
      ],
      [
        1098,
        428
      ],
      [
        1119,
        471
      ],
      [
        1098,
        504
      ],
      [
        1074,
        491
      ]
    ],
    [
      [
        807,
        328
      ],
      [
        827,
        315
      ],
      [
        850,
        328
      ],
      [
        850,
        355
      ],
      [
        831,
        369
      ],
      [
        806,
        356
      ]
    ],
    [
      [
        908,
        269
      ],
      [
        927,
        260
      ],
      [
        948,
        272
      ],
      [
        949,
        296
      ],
      [
        930,
        311
      ],
      [
        908,
        297
      ]
    ]
  ],
  "lights": [
    [
      78,
      34
    ],
    [
      78,
      48
    ]
  ],
  "npcs": [],
  "hazards": [
    { "id": "simpul-resonant-hum", "kind": "resonance_field", "name": "Denyut Menara Simpul 009", "x": 892, "y": 364, "r": 44, "period": 5.2, "activeFrom": 0.58, "push": [14, 12], "damage": 2, "clearedOnce": "cp-9-0" }
  ],
  "exits": [
    {
      "x": 800,
      "y": 462,
      "r": 34,
      "to": "gerbang",
      "spawn": [
        495,
        405
      ],
      "label": "Kembali ke Gerbang Timur"
    }
  ]
},
    "sela": {
      "name": "Dusun Sela & Kanal Balai Cawan",
      "subtitle": "BAB 1 · Rumah Nenek Ima & Pos Dagang Kanal",
      "bg": "bg-sela",
      "spawn": [346,590],
      "walkPolygons": [
        [
          [243,276],
          [322,263],
          [377,242],
          [425,231],
          [484,243],
          [550,257],
          [620,264],
          [674,279],
          [736,285],
          [763,307],
          [762,442],
          [713,458],
          [699,509],
          [747,528],
          [776,555],
          [779,667],
          [744,696],
          [665,684],
          [621,659],
          [568,655],
          [546,606],
          [500,606],
          [476,680],
          [365,700],
          [304,694],
          [280,660],
          [313,615],
          [304,563],
          [299,500],
          [270,445],
          [207,417],
          [200,368],
          [243,344]
        ],
        [
          [483,222],
          [547,222],
          [548,265],
          [482,265]
        ],
        [
          [743,285],
          [748,165],
          [763,147],
          [775,96],
          [801,96],
          [800,288]
        ],
        [
          [786,85],
          [1015,85],
          [1015,130],
          [787,130]
        ],
        [
          [790,576],
          [1018,576],
          [1018,629],
          [788,629]
        ],
        [
          [1007,84],
          [1076,91],
          [1102,126],
          [1090,175],
          [1137,190],
          [1139,357],
          [1130,450],
          [1168,452],
          [1172,611],
          [1129,646],
          [1038,639],
          [1007,615]
        ],
        [
          [724,271],
          [775,271],
          [779,318],
          [729,318]
        ],
        [
          [766,576],
          [806,576],
          [806,629],
          [766,629]
        ]
      ],
      "blockPolygons": [
        [
          [350,345],
          [386,327],
          [416,344],
          [480,399],
          [475,423],
          [414,413],
          [363,391]
        ],
        [
          [416,325],
          [484,325],
          [484,348],
          [417,348]
        ],
        [
          [554,324],
          [695,325],
          [696,353],
          [556,350]
        ],
        [
          [528,511],
          [548,512],
          [558,636],
          [531,635]
        ],
        [
          [1040,349],
          [1098,348],
          [1098,439],
          [1037,439]
        ],
        [
          [1030,204],
          [1050,205],
          [1074,267],
          [1062,319],
          [1030,316]
        ],
        [
          [1030,477],
          [1065,479],
          [1088,513],
          [1069,548],
          [1030,549]
        ],
        [
          [552,449],
          [598,449],
          [605,502],
          [574,541],
          [551,532]
        ],
        [
          [690,443],
          [740,445],
          [743,507],
          [698,516]
        ]
      ],
      "lights": [
        [22,6],
        [30,20],
        [13,61],
        [55,59],
        [23,95]
      ],
      "npcs": [
        {
          "id": "ima",
          "name": "Nenek Ima",
          "sprite": "npc-ima",
          "x": 512,
          "y": 254
        }
      ],
      "patrols": [
        {
          "id": "canal-guard",
          "name": "Pengintai Pos Dagang",
          "sprite": "npc-kesa",
          "waypoints": [
            [1015,335],
            [1015,553]
          ],
          "speed": 68,
          "visionDist": 125,
          "visionAngle": 0.46
        },
        {
          "id": "canal-dock-guard",
          "name": "Penjaga Dermaga Sela",
          "sprite": "npc-dargun",
          "waypoints": [
            [1085,220],
            [1085,340]
          ],
          "speed": 60,
          "visionDist": 115,
          "visionAngle": 0.44
        }
      ],
      "coverRects": [[73,44,76,48],[80,22,83,26]],
      "hazards": [
        { "id": "sela-sluice-north", "kind": "sluice_surge", "name": "Luapan Pintu Kanal Utara", "x": 962, "y": 108, "r": 42, "period": 6.2, "activeFrom": 0.58, "push": [22, 6], "clearedOnce": "cp-14-0" },
        { "id": "sela-sluice-south", "kind": "sluice_surge", "name": "Arus Pintu Kanal Selatan", "x": 824, "y": 605, "r": 42, "period": 6.2, "activeFrom": 0.52, "push": [-20, 4], "clearedOnce": "cp-14-0" },
        { "id": "sela-moss-slick", "kind": "slick", "name": "Papan Lumut Licin", "x": 762, "y": 236, "r": 36 },
        { "id": "sela-east-slick", "kind": "slick", "name": "Tepian Batu Basah", "x": 1052, "y": 292, "r": 38 }
      ],
      "exits": [
        {
          "x": 350,
          "y": 675,
          "r": 44,
          "to": "nilasar",
          "spawn": [1075,403],
          "label": "Pos Nilasar (Barat)"
        },
        {
          "x": 1062,
          "y": 101,
          "r": 44,
          "to": "balkut",
          "spawn": [269,504],
          "label": "Perbatasan & Tebing Balkut (Utara)"
        }
      ]
    },
    "balkut": {
  "name": "Perbatasan Remuz–Zamer & Tebing Balkut",
  "subtitle": "BAB 1 · Karavan Garam, Meja Takar & Jembatan Tambat",
  "bg": "bg-balkut",
  "spawn": [
    269,
    504
  ],
  "walkPolygons": [
    [
      [
        89,
        509
      ],
      [
        150,
        472
      ],
      [
        225,
        438
      ],
      [
        272,
        415
      ],
      [
        346,
        392
      ],
      [
        415,
        373
      ],
      [
        473,
        357
      ],
      [
        537,
        348
      ],
      [
        576,
        323
      ],
      [
        628,
        292
      ],
      [
        678,
        273
      ],
      [
        711,
        258
      ],
      [
        754,
        277
      ],
      [
        797,
        287
      ],
      [
        843,
        284
      ],
      [
        856,
        303
      ],
      [
        813,
        325
      ],
      [
        789,
        353
      ],
      [
        760,
        367
      ],
      [
        726,
        394
      ],
      [
        691,
        420
      ],
      [
        643,
        432
      ],
      [
        594,
        466
      ],
      [
        576,
        518
      ],
      [
        595,
        560
      ],
      [
        591,
        595
      ],
      [
        571,
        623
      ],
      [
        573,
        665
      ],
      [
        524,
        694
      ],
      [
        478,
        708
      ],
      [
        108,
        708
      ],
      [
        108,
        675
      ],
      [
        76,
        619
      ],
      [
        87,
        573
      ]
    ],
    [
      [
        642,
        417
      ],
      [
        688,
        420
      ],
      [
        731,
        450
      ],
      [
        756,
        486
      ],
      [
        779,
        527
      ],
      [
        799,
        565
      ],
      [
        819,
        610
      ],
      [
        845,
        649
      ],
      [
        882,
        689
      ],
      [
        895,
        715
      ],
      [
        731,
        715
      ],
      [
        716,
        686
      ],
      [
        735,
        651
      ],
      [
        715,
        611
      ],
      [
        698,
        568
      ],
      [
        676,
        527
      ],
      [
        649,
        490
      ]
    ],
    [
      [
        826,
        247
      ],
      [
        866,
        215
      ],
      [
        910,
        199
      ],
      [
        960,
        184
      ],
      [
        1014,
        160
      ],
      [
        1072,
        129
      ],
      [
        1123,
        98
      ],
      [
        1177,
        65
      ],
      [
        1227,
        102
      ],
      [
        1194,
        140
      ],
      [
        1154,
        176
      ],
      [
        1102,
        204
      ],
      [
        1053,
        227
      ],
      [
        995,
        247
      ],
      [
        941,
        263
      ],
      [
        895,
        269
      ],
      [
        863,
        274
      ]
    ],
    [
      [
        795,
        287
      ],
      [
        818,
        253
      ],
      [
        848,
        231
      ],
      [
        887,
        245
      ],
      [
        892,
        275
      ],
      [
        861,
        302
      ],
      [
        836,
        317
      ]
    ]
  ],
  "blockPolygons": [
    [
      [
        259,
        411
      ],
      [
        288,
        394
      ],
      [
        362,
        381
      ],
      [
        408,
        404
      ],
      [
        411,
        437
      ],
      [
        363,
        457
      ],
      [
        333,
        481
      ],
      [
        291,
        480
      ],
      [
        265,
        458
      ]
    ],
    [
      [
        494,
        471
      ],
      [
        528,
        449
      ],
      [
        562,
        471
      ],
      [
        575,
        535
      ],
      [
        559,
        572
      ],
      [
        526,
        582
      ],
      [
        495,
        561
      ]
    ],
    [
      [
        141,
        580
      ],
      [
        217,
        559
      ],
      [
        272,
        579
      ],
      [
        296,
        639
      ],
      [
        278,
        684
      ],
      [
        244,
        699
      ],
      [
        164,
        687
      ],
      [
        130,
        651
      ]
    ],
    [
      [
        318,
        564
      ],
      [
        365,
        532
      ],
      [
        426,
        545
      ],
      [
        477,
        579
      ],
      [
        489,
        654
      ],
      [
        462,
        684
      ],
      [
        370,
        684
      ],
      [
        318,
        659
      ]
    ],
    [
      [
        109,
        359
      ],
      [
        157,
        334
      ],
      [
        216,
        342
      ],
      [
        245,
        375
      ],
      [
        238,
        410
      ],
      [
        203,
        436
      ],
      [
        146,
        427
      ],
      [
        108,
        400
      ]
    ],
    [
      [
        891,
        251
      ],
      [
        915,
        248
      ],
      [
        934,
        267
      ],
      [
        916,
        287
      ],
      [
        892,
        279
      ]
    ],
    [
      [
        736,
        235
      ],
      [
        764,
        212
      ],
      [
        813,
        231
      ],
      [
        839,
        253
      ],
      [
        850,
        281
      ],
      [
        832,
        288
      ],
      [
        806,
        266
      ],
      [
        768,
        250
      ]
    ]
  ],
  "lights": [
    [
      40,
      34
    ],
    [
      38,
      66
    ]
  ],
  "npcs": [
    {
      "id": "orsuk",
      "name": "Orsuk (Panji Balkut)",
      "sprite": "npc-orsuk",
      "x": 443,
      "y": 438
    },
    {
      "id": "maruani",
      "name": "Maruani · Juru Takar",
      "sprite": "npc-maruani",
      "x": 369,
      "y": 485
    }
  ],
  "patrols": [
    {
      "id": "balkut-lookout",
      "name": "Pengintai Blokade Tebing",
      "sprite": "npc-hurgak",
      "waypoints": [
        [690,405],
        [750,355]
      ],
      "speed": 56,
      "visionDist": 116,
      "visionAngle": 0.42
    }
  ],
  "hazards": [
    { "id": "balkut-gust-low", "kind": "wind_gust", "name": "Hembusan Angin Celah", "x": 736, "y": 518, "r": 50, "period": 5.5, "activeFrom": 0.56, "push": [-24, 12], "damage": 3 },
    { "id": "balkut-gust-high", "kind": "wind_gust", "name": "Terpaan Angin Tebing", "x": 712, "y": 392, "r": 46, "period": 5.8, "activeFrom": 0.58, "push": [-22, 10], "damage": 3 },
    { "id": "balkut-rockfall", "kind": "rock_slide", "name": "Guguran Kerikil Tebing", "x": 686, "y": 488, "r": 36, "period": 6.8, "activeFrom": 0.68, "push": [-10, 14], "damage": 4, "clearedOnce": "cp-17-1" }
  ],
  "exits": [
    {
      "x": 116,
      "y": 604,
      "r": 44,
      "to": "sela",
      "spawn": [
        1075,
        173
      ],
      "label": "Kanal & Dusun Sela (Selatan)"
    },
    {
      "x": 945,
      "y": 224,
      "r": 44,
      "to": "salkara",
      "spawn": [
        368,
        616
      ],
      "label": "Seberangi Jembatan ke Padang Salkara"
    }
  ]
},
    "salkara": {
  "name": "Padang Salkara · Sidang Tujuh Panji",
  "subtitle": "BAB 1 · Perkemahan 47 Tenda, Api Sidang & Monolit Batu Nama",
  "bg": "bg-salkara",
  "spawn": [
    368,
    616
  ],
  "walkPolygons": [
    [
      [
        247,
        324
      ],
      [
        316,
        291
      ],
      [
        417,
        263
      ],
      [
        489,
        244
      ],
      [
        595,
        268
      ],
      [
        648,
        285
      ],
      [
        828,
        290
      ],
      [
        879,
        326
      ],
      [
        957,
        336
      ],
      [
        986,
        389
      ],
      [
        968,
        454
      ],
      [
        1004,
        496
      ],
      [
        1002,
        586
      ],
      [
        1055,
        619
      ],
      [
        1006,
        663
      ],
      [
        942,
        695
      ],
      [
        786,
        695
      ],
      [
        736,
        670
      ],
      [
        723,
        699
      ],
      [
        408,
        700
      ],
      [
        355,
        677
      ],
      [
        310,
        666
      ],
      [
        278,
        704
      ],
      [
        236,
        687
      ],
      [
        276,
        627
      ],
      [
        241,
        582
      ],
      [
        226,
        551
      ],
      [
        207,
        487
      ],
      [
        195,
        437
      ],
      [
        232,
        401
      ],
      [
        229,
        364
      ]
    ],
    [
      [
        310,
        281
      ],
      [
        351,
        260
      ],
      [
        399,
        248
      ],
      [
        436,
        253
      ],
      [
        443,
        277
      ],
      [
        406,
        292
      ],
      [
        354,
        309
      ]
    ],
    [
      [
        397,
        277
      ],
      [
        445,
        237
      ],
      [
        492,
        219
      ],
      [
        510,
        182
      ],
      [
        555,
        177
      ],
      [
        600,
        185
      ],
      [
        643,
        206
      ],
      [
        665,
        260
      ],
      [
        649,
        300
      ],
      [
        520,
        314
      ],
      [
        429,
        302
      ]
    ]
  ],
  "blockPolygons": [
    [
      [
        785,
        423
      ],
      [
        784,
        429
      ],
      [
        780,
        436
      ],
      [
        774,
        441
      ],
      [
        767,
        446
      ],
      [
        757,
        450
      ],
      [
        746,
        453
      ],
      [
        734,
        455
      ],
      [
        722,
        456
      ],
      [
        710,
        455
      ],
      [
        698,
        453
      ],
      [
        687,
        450
      ],
      [
        677,
        446
      ],
      [
        670,
        441
      ],
      [
        664,
        436
      ],
      [
        660,
        429
      ],
      [
        659,
        423
      ],
      [
        660,
        417
      ],
      [
        664,
        410
      ],
      [
        670,
        405
      ],
      [
        677,
        400
      ],
      [
        687,
        396
      ],
      [
        698,
        393
      ],
      [
        710,
        391
      ],
      [
        722,
        390
      ],
      [
        734,
        391
      ],
      [
        746,
        393
      ],
      [
        757,
        396
      ],
      [
        767,
        400
      ],
      [
        774,
        405
      ],
      [
        780,
        410
      ],
      [
        784,
        417
      ]
    ],
    [
      [
        643,
        203
      ],
      [
        663,
        152
      ],
      [
        698,
        124
      ],
      [
        733,
        112
      ],
      [
        775,
        133
      ],
      [
        812,
        178
      ],
      [
        825,
        241
      ],
      [
        808,
        266
      ],
      [
        744,
        280
      ],
      [
        668,
        264
      ]
    ],
    [
      [
        838,
        261
      ],
      [
        849,
        213
      ],
      [
        886,
        175
      ],
      [
        928,
        151
      ],
      [
        970,
        172
      ],
      [
        1010,
        214
      ],
      [
        1020,
        275
      ],
      [
        1008,
        307
      ],
      [
        949,
        332
      ],
      [
        876,
        315
      ]
    ],
    [
      [
        986,
        334
      ],
      [
        1009,
        288
      ],
      [
        1063,
        256
      ],
      [
        1101,
        252
      ],
      [
        1145,
        288
      ],
      [
        1170,
        330
      ],
      [
        1168,
        390
      ],
      [
        1117,
        413
      ],
      [
        1023,
        398
      ]
    ],
    [
      [
        957,
        479
      ],
      [
        980,
        429
      ],
      [
        1041,
        390
      ],
      [
        1084,
        386
      ],
      [
        1143,
        419
      ],
      [
        1174,
        468
      ],
      [
        1164,
        539
      ],
      [
        1117,
        572
      ],
      [
        1009,
        560
      ],
      [
        974,
        535
      ]
    ],
    [
      [
        809,
        604
      ],
      [
        829,
        554
      ],
      [
        876,
        521
      ],
      [
        914,
        505
      ],
      [
        949,
        521
      ],
      [
        990,
        561
      ],
      [
        1017,
        618
      ],
      [
        1017,
        655
      ],
      [
        960,
        681
      ],
      [
        861,
        676
      ],
      [
        813,
        651
      ]
    ],
    [
      [
        526,
        624
      ],
      [
        535,
        582
      ],
      [
        568,
        549
      ],
      [
        615,
        526
      ],
      [
        650,
        538
      ],
      [
        695,
        583
      ],
      [
        721,
        648
      ],
      [
        721,
        671
      ],
      [
        685,
        697
      ],
      [
        578,
        696
      ],
      [
        528,
        670
      ]
    ],
    [
      [
        244,
        463
      ],
      [
        256,
        423
      ],
      [
        298,
        394
      ],
      [
        334,
        384
      ],
      [
        369,
        397
      ],
      [
        415,
        425
      ],
      [
        433,
        477
      ],
      [
        445,
        518
      ],
      [
        398,
        547
      ],
      [
        318,
        558
      ],
      [
        255,
        532
      ]
    ],
    [
      [
        561,
        351
      ],
      [
        591,
        337
      ],
      [
        618,
        364
      ],
      [
        615,
        389
      ],
      [
        584,
        401
      ],
      [
        560,
        381
      ]
    ],
    [
      [
        633,
        334
      ],
      [
        658,
        326
      ],
      [
        674,
        340
      ],
      [
        672,
        362
      ],
      [
        645,
        372
      ],
      [
        628,
        354
      ]
    ],
    [
      [
        705,
        321
      ],
      [
        739,
        317
      ],
      [
        750,
        339
      ],
      [
        750,
        365
      ],
      [
        705,
        366
      ]
    ],
    [
      [
        784,
        335
      ],
      [
        804,
        330
      ],
      [
        820,
        351
      ],
      [
        818,
        373
      ],
      [
        784,
        379
      ]
    ],
    [
      [
        828,
        368
      ],
      [
        849,
        366
      ],
      [
        868,
        389
      ],
      [
        860,
        411
      ],
      [
        827,
        416
      ]
    ],
    [
      [
        556,
        434
      ],
      [
        580,
        430
      ],
      [
        601,
        451
      ],
      [
        598,
        479
      ],
      [
        566,
        488
      ],
      [
        552,
        462
      ]
    ],
    [
      [
        791,
        467
      ],
      [
        817,
        453
      ],
      [
        839,
        459
      ],
      [
        844,
        483
      ],
      [
        826,
        507
      ],
      [
        792,
        508
      ]
    ],
    [
      [
        463,
        141
      ],
      [
        499,
        102
      ],
      [
        538,
        94
      ],
      [
        566,
        128
      ],
      [
        581,
        166
      ],
      [
        556,
        187
      ],
      [
        497,
        178
      ]
    ],
    [
      [
        501,
        194
      ],
      [
        519,
        188
      ],
      [
        534,
        200
      ],
      [
        526,
        213
      ],
      [
        507,
        213
      ]
    ],
    [
      [
        442,
        204
      ],
      [
        465,
        201
      ],
      [
        494,
        219
      ],
      [
        486,
        239
      ],
      [
        448,
        233
      ]
    ],
    [
      [
        620,
        222
      ],
      [
        636,
        222
      ],
      [
        644,
        243
      ],
      [
        629,
        253
      ],
      [
        616,
        240
      ]
    ]
  ],
  "lights": [
    [
      55,
      55
    ],
    [
      40,
      27
    ],
    [
      20,
      47
    ],
    [
      14,
      52
    ],
    [
      95,
      15
    ],
    [
      83,
      79
    ]
  ],
  "npcs": [
    {
      "id": "dargun",
      "name": "Dargun (Panji Tua)",
      "sprite": "npc-dargun",
      "x": 717,
      "y": 306
    },
    {
      "id": "salgur",
      "name": "Salgur (Panji Muda)",
      "sprite": "npc-salgur",
      "x": 870,
      "y": 374
    },
    {
      "id": "hurgak",
      "name": "Hurgak (Panji Dolgak)",
      "sprite": "npc-hurgak",
      "x": 628,
      "y": 264,
      "poiText": "Panji Dolgak menjaga ternak dan besi tempa. Tanpa bukti yang sah, kami tidak akan mempertaruhkan kuda kami di ngarai."
    },
    {
      "id": "kutlak",
      "name": "Kutlak (Panji Sarbuk)",
      "sprite": "npc-kutlak",
      "x": 812,
      "y": 310,
      "poiText": "Angin debu membawa banyak kabar palsu dari selatan. Kami menunggu apa yang dikatakan Batu Nama."
    },
    {
      "id": "borlan",
      "name": "Borlan (Panji Tumran)",
      "sprite": "npc-borlan",
      "x": 848,
      "y": 445,
      "poiText": "Roda pedati Tumran butuh garam Asharim, bukan perang saudara di perbatasan."
    },
    {
      "id": "burgul",
      "name": "Burgul (Panji Ulmar)",
      "sprite": "npc-burgul",
      "x": 534,
      "y": 448,
      "poiText": "Bintang rendah di atas Salkara belum bergeser. Empat hari adalah waktu yang adil bagi perintis untuk mencari bukti."
    },
    {
      "id": "odgar",
      "name": "Odgar si Batu Nama (Panji Kadum)",
      "sprite": "npc-odgar",
      "x": 538,
      "y": 374
    }
  ],
  "hazards": [
    { "id": "salkara-eddy-west", "kind": "ember_eddy", "name": "Pusaran Debu Bara", "x": 452, "y": 515, "r": 44, "period": 5.4, "activeFrom": 0.5, "push": [18, -14], "damage": 2 },
    { "id": "salkara-eddy-east", "kind": "ember_eddy", "name": "Pusaran Angin Tenda", "x": 786, "y": 525, "r": 44, "period": 6.0, "activeFrom": 0.54, "push": [-18, -12], "damage": 2 },
    { "id": "salkara-monolith-wave", "kind": "resonance_field", "name": "Gelombang Dengung Batu Nama", "x": 408, "y": 275, "r": 48, "period": 4.8, "activeFrom": 0.55, "push": [16, 12], "damage": 2, "clearedOnce": "cp-21-0" }
  ],
  "patrols": [
    {
      "id": "salkara-saboteur",
      "encId": "penyusup_maruani",
      "name": "Penyusup Malam Sabotase",
      "sprite": "npc-maruani",
      "waypoints": [[500, 520], [620, 490]],
      "speed": 58,
      "visionRange": 135,
      "visionFovDeg": 76
    }
  ],
  "exits": [
    {
      "x": 296,
      "y": 584,
      "r": 44,
      "to": "balkut",
      "spawn": [
        858,
        267
      ],
      "label": "Tebing Jembatan Balkut (Selatan)"
    },
    {
      "x": 948,
      "y": 360,
      "r": 44,
      "to": "tepisalkara",
      "spawn": [
        310,
        515
      ],
      "label": "Reruntuhan Tepi Salkara (Utara)"
    }
  ]
},
"tepisalkara": {
  "name": "Tepi Salkara · Reruntuhan Pesisir",
  "subtitle": "BAB 1 FINALE · Bekas Pos Karavan 107 Tahun Lalu, Batu Bernyanyi & Dermaga Sinyal",
  "bg": "bg-tepisalkara",
  "spawn": [310, 515],
  "walkPolygons": [
    [
      [60, 698], [45, 665], [160, 568], [295, 470], [420, 395],
      [405, 290], [405, 195], [440, 145], [505, 75], [555, 35],
      [740, 35], [715, 75], [815, 120], [885, 190], [925, 245],
      [925, 345], [880, 370], [715, 370], [630, 398], [520, 468],
      [395, 558], [315, 615], [250, 655], [190, 698]
    ],
    [
      [108, 120], [398, 120], [435, 195], [435, 300], [395, 370], [108, 370]
    ],
    [
      [905, 260], [1172, 260], [1172, 322], [905, 322]
    ]
  ],
  "blockPolygons": [
    [[248, 115], [344, 115], [344, 205], [248, 205]],
    [[95, 75], [395, 75], [395, 138], [250, 138], [250, 152], [95, 152]],
    [[88, 120], [132, 120], [132, 360], [88, 360]],
    [[95, 300], [220, 340], [220, 385], [95, 385]],
    [[315, 298], [412, 298], [412, 385], [315, 385]],
    [[556, 140], [620, 140], [620, 200], [556, 200]],
    [[734, 175], [806, 175], [806, 248], [734, 248]],
    [[1118, 246], [1176, 246], [1176, 292], [1118, 292]]
  ],
  "npcs": [
    {
      "id": "orsuk-pesisir",
      "name": "Orsuk (Kepala Pengawal Balkut)",
      "sprite": "npc-orsuk",
      "x": 495,
      "y": 295,
      "poiText": "Suara laut di balik batu pesisir ini pernah ditakuti orang Cirusia selama seratus tujuh tahun. Mari kita ungkap isi sebenarnya bersama-sama."
    },
    {
      "id": "dargun-pesisir",
      "name": "Dargun (Panji Gorkan)",
      "sprite": "npc-dargun",
      "x": 685,
      "y": 315,
      "poiText": "Jika kau memang membawa bukti dari dapur tua dan dermaga ini, buktikan di depan mataku sendiri."
    },
    {
      "id": "utusan-ulmar",
      "name": "Utusan Panji Ulmar",
      "sprite": "npc-burgul",
      "x": 790,
      "y": 335,
      "poiText": "Ketujuh panji mengirim saksi ke tebing ini. Apa pun yang terungkap di sini akan dibawa pulang kepada Odgar."
    }
  ],
  "patrols": [
    {
      "id": "tepi-gorkan-scout",
      "encId": "pengawal_gorkan_pesisir",
      "name": "Pengintai Panji Gorkan",
      "sprite": "npc-hurgak",
      "waypoints": [[490, 225], [695, 265]],
      "speed": 56,
      "visionRange": 135,
      "visionFovDeg": 76
    }
  ],
  "hazards": [
    { "id": "tepi-sea-gust", "kind": "wind_gust", "name": "Angin Badai Tepi Salkara", "x": 965, "y": 290, "r": 42, "period": 5.2, "activeFrom": 0.56, "push": [-18, 0], "damage": 2 },
    { "id": "tepi-echo-wave", "kind": "resonance_field", "name": "Gelombang Gema Batu Pesisir", "x": 610, "y": 325, "r": 42, "period": 5.6, "activeFrom": 0.58, "push": [0, 16], "damage": 2, "clearedOnce": "cp-25-0" }
  ],
  "exits": [
    {
      "x": 215,
      "y": 595,
      "r": 44,
      "to": "salkara",
      "spawn": [860, 355],
      "label": "Padang Salkara (Selatan)"
    }
  ]
}
  };

  // Senja is authored object by object; masks and debug drawing share these exact shapes.
  MAPS.senja.walkPolygons = MAPS.senja.walkSurfaces.map(surface => surface.polygon);
  MAPS.senja.blockPolygons = MAPS.senja.collisionObjects.map(object => object.polygon);
  MAPS.nilasar.exits.find(exit => exit.to === 'senja').spawn = [609,620];
  const TITLE_SLIDES = [
    { file: '07-telaga-sumi.webp', title: 'Telaga Sumi', region: 'Suaka Air Nilasar' },
    { file: '06-pos-nilasar.webp', title: 'Pos Nilasar', region: 'Gerbang Perintis Timur' },
    { file: '01-lembah-pasir.webp', title: 'Lembah Pasir', region: 'Nadi Kafilah Karavan' },
    { file: '13-menara-senja.webp', title: 'Menara Senja', region: 'Pos Gema Punggungan' },
    { file: '12-dusun-sela.webp', title: 'Dusun Sela', region: 'Terusan Penenun Tua' },
    { file: '14-simpul-sembilan.webp', title: 'Simpul Sembilan', region: 'Punggungan Garpu Tala' },
    { file: '03-padang-salkara.webp', title: 'Padang Salkara', region: 'Tujuh Panji Salkara' },
    { file: '16-batu-tepi.webp', title: 'Batu Tepi', region: 'Tepi Laut Salkara' },
    { file: '02-pegunungan-silin.webp', title: 'Pegunungan Silin', region: 'Jalur Lintas Awan' },
    { file: '04-kepulauan-lamuna.webp', title: 'Kepulauan Lamuna', region: 'Bandar Kayu & Layar' },
    { file: '05-dataran-basalt.webp', title: 'Dataran Basalt', region: 'Tangga Batu Hitam' },
    { file: '08-bandar-lada.webp', title: 'Bandar Lada', region: 'Dermaga Rempah Barat' },
    { file: '09-lulan-tua.webp', title: 'Lulan Tua', region: 'Reruntuhan Kota Kanal' },
    { file: '10-benteng-tata.webp', title: 'Benteng Tata', region: 'Gerbang Perbatasan' },
    { file: '11-menara-keseratus.webp', title: 'Menara Keseratus', region: 'Cakrawala Cincin Perunggu' },
    { file: '15-balai-cawan.webp', title: 'Balai Cawan', region: 'Ruang Sidang Timur' },
    { file: '17-desa-kertas-awan.webp', title: 'Desa Kertas Awan', region: 'Lembah Angin Tinggi' },
    { file: '18-gudang-naskah.webp', title: 'Gudang Naskah', region: 'Arsip Tinta & Stempel' },
    { file: '19-menara-pusat.webp', title: 'Menara Pusat', region: 'Jantung Jaringan Gema' },
    { file: '20-gerbang-surut.webp', title: 'Gerbang Surut', region: 'Batas Lautan Senja' }
  ];
  root.BAB0_DATA = {
    WORLD_W,
    WORLD_H,
    SCENE_TO_MAP,
    STEP_TARGETS,
    EQUIPMENT,
    NEGOTIATIONS,
    TITLE_SLIDES,
    MAPS
  };
})(globalThis);
