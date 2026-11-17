/* Lite Narrative RPG System for Jalur Senyap (Bab 0–1, 103 Post-Senyap).
   DOM-free: base stats, source_id modifier stack, tool/quest progression,
   ratio-based combat, and Bab 0 regional encounters. */
(function (root) {
  'use strict';

  const DEFENSE_CONSTANT = 20;
  const BASE_CRIT_CHANCE = 0.05;
  const CRIT_MULTIPLIER = 1.75;
  const VARIANCE_MIN = 0.9;
  const VARIANCE_MAX = 1.1;

  const BASE_PER_LEVEL = {
    1: { ketahanan: 40, ketangkasan: 10, pertahanan: 6, kepekaan: 8 },
    2: { ketahanan: 46, ketangkasan: 12, pertahanan: 8, kepekaan: 10 },
    3: { ketahanan: 52, ketangkasan: 14, pertahanan: 10, kepekaan: 12 },
    4: { ketahanan: 58, ketangkasan: 16, pertahanan: 12, kepekaan: 14 },
    5: { ketahanan: 64, ketangkasan: 18, pertahanan: 14, kepekaan: 16 },
    6: { ketahanan: 70, ketangkasan: 20, pertahanan: 16, kepekaan: 18 }
  };

  // Fast Bab 0 pacing (~3-5 min per early level via quests, POIs, and challenges).
  const XP_THRESHOLDS = { 1: 0, 2: 60, 3: 150, 4: 270, 5: 420, 6: 600 };

  const ITEMS = {
    gear_rompi_kulit: {
      id: 'gear_rompi_kulit',
      name: 'Rompi Kulit Kafilah',
      origin: 'Asharim × Cirusia',
      category: 'equipment',
      tier: 'Bekal Awal',
      slot: null,
      unlockObjective: null,
      feature: 'Pelindung awal perintis Dusun Sela dari kulit samak gurun Asharim dan jahitan lapis tiga ala penunggang Cirusia. Aktif otomatis sepanjang perjalanan.',
      modifiers: [
        { stat: 'ketahanan', amount: 5 },
        { stat: 'ketangkasan', amount: 2 },
        { stat: 'pertahanan', amount: 2 }
      ]
    },
    alat_tas_peredam: {
      id: 'alat_tas_peredam',
      name: 'Tas Peredam Tseren',
      origin: 'Pegunungan Silin · Tseren',
      category: 'tool',
      tier: 'Rilis Bab 0',
      slot: null,
      unlockObjective: 'cp-0-2',
      feature: 'Tas perintis tua dari gudang Pos Nilasar berlapis benang peredam gaung asal Pegunungan Silin (Tseren). Memangkas dorongan & susut muatan badai pasir hingga 55% lebih awet.',
      modifiers: []
    },
    alat_lentera_ruru: {
      id: 'alat_lentera_ruru',
      name: 'Lentera Angin & Peluit Ruru',
      origin: 'Bahtari × Asharim',
      category: 'tool',
      tier: 'Rilis Bab 0',
      slot: null,
      unlockObjective: 'cp-2-2',
      feature: 'Berbahan bakar minyak ikan palung Bahtari yang tahan badai pasir Asharim, dipadu peluit tebing untuk Ruru. Memperluas radar [Q] (170 → 220 px), jeda pindai 2,5 detik, dan Siasat Ruru (1.45x).',
      modifiers: []
    },
    artefak_cincin_perunggu: {
      id: 'artefak_cincin_perunggu',
      name: 'Cincin Perunggu',
      origin: 'Pusaka Kuno · Pra-Senyap',
      category: 'mystery',
      tier: 'Rilis Bab 0',
      slot: null,
      unlockObjective: 'cp-7-2',
      feature: 'Cincin Perunggu Gaung kuno peninggalan masa Pra-Senyap yang dipercayakan Marsiyah di Pos Nilasar. Membuka Simpul Sembilan & menggandakan durasi penuntun [Q]. Setelah terikat nadi di Simpul, Baca Celah memulihkan +3 HP & meringankan negosiasi (-2).',
      modifiers: []
    },
    gear_selendang_sela: {
      id: 'gear_selendang_sela',
      name: 'Selendang Tenun Sela',
      origin: 'Dusun Sela · Asharim',
      category: 'equipment',
      tier: 'Rilis Bab 1',
      slot: null,
      unlockObjective: 'cp-13-2',
      feature: 'Tenunan tangan Nenek Ima khas Dusun Sela dengan pola serat pelindung rahasia keluarga. Memangkas dorongan rintangan alam Bab 1 (-50%, maks 1 HP) dan memperkuat ketahanan fisik.',
      modifiers: [
        { stat: 'ketahanan', amount: 10 },
        { stat: 'ketangkasan', amount: 5 },
        { stat: 'pertahanan', amount: 5 },
        { stat: 'kepekaan', amount: 4 }
      ]
    },
    gear_lencana_salkara: {
      id: 'gear_lencana_salkara',
      name: 'Meterai Penengah Salkara',
      origin: 'Cirusia (Panji Kadum)',
      category: 'equipment',
      tier: 'Rilis Bab 1',
      slot: null,
      unlockObjective: 'cp-20-0',
      feature: 'Mandat sah Sidang Tujuh Panji berukir monolit Panji Kadum di bawah Hukum Janji Api Odgar. Membuat pengintai ragu (kesadaran patroli -30%) serta menambah wibawa tempur penuh.',
      modifiers: [
        { stat: 'ketangkasan', amount: 7 },
        { stat: 'pertahanan', amount: 4 },
        { stat: 'kepekaan', amount: 6 }
      ]
    }
  };

  const CONSUMABLES = {
    roti_nilasar: { id: 'roti_nilasar', origin: 'Asharim', name: 'Roti Hangat Nilasar', heal: 12, desc: 'Bekal Bab 0 dari dapur suaka Pos Nilasar (gandum gurun & rempah jalur). Memulihkan 12 Ketahanan.' },
    garam_mineral: { id: 'garam_mineral', origin: 'Asharim × Cirusia', name: 'Kapsul Garam Balkut', heal: 24, desc: 'Bekal Bab 1 racikan garam batu Asharim dan ransum karavan Panji Balkut Cirusia. Memulihkan 24 Ketahanan.' }
  };

  // Regional enemy bands in Bab 0-1 (no full auto-scaling).
  const ENCOUNTERS = {
    bandit_gurun: {
      id: 'bandit_gurun',
      name: 'Perampok Jalur Gurun',
      region: 'Lembah Pasir · Band 1',
      tier: 'regular',
      sprite: 'npc-kutlak',
      maxHp: 28,
      atk: 12,
      def: 4,
      negotiateKepekaan: 10,
      xpReward: 25,
      stealthXp: 35,
      drop: 'roti_nilasar',
      desc: 'Penghadang kafilah di balik bukit pasir antara Nilasar dan Sumi.'
    },
    pengintai_dewan: {
      id: 'pengintai_dewan',
      name: 'Pengintai Razia Dewan',
      region: 'Gerbang Timur · Band 2',
      tier: 'regular',
      sprite: 'npc-kesa',
      portrait: 'portrait-kesa',
      maxHp: 36,
      atk: 14,
      def: 6,
      negotiateKepekaan: 12,
      xpReward: 30,
      stealthXp: 40,
      drop: 'roti_nilasar',
      desc: 'Petugas patroli Benteng Tata yang memeriksa bawaan perintis.'
    },
    penghadang_sela: {
      id: 'penghadang_sela',
      name: 'Pengutip Cukai Kanal Sela',
      region: 'Dusun Sela · Band 2',
      tier: 'regular',
      sprite: 'npc-dargun',
      maxHp: 44,
      atk: 14,
      def: 7,
      negotiateKepekaan: 13,
      xpReward: 38,
      stealthXp: 48,
      drop: 'roti_nilasar',
      desc: 'Penjaga dermaga rakit yang memungut biaya lewat gelap di tepi saluran.'
    },
    penjaga_cirusia: {
      id: 'penjaga_cirusia',
      name: 'Penjaga Pos Balkut',
      region: 'Pos Balkut · Band 3',
      tier: 'regular',
      sprite: 'npc-hurgak',
      maxHp: 56,
      atk: 18,
      def: 9,
      negotiateKepekaan: 15,
      xpReward: 46,
      stealthXp: 56,
      drop: 'garam_mineral',
      desc: 'Pengawal garis perbatasan Cirusia dengan pentungan berlapis perunggu.'
    },
    prajurit_tebing_balkut: {
      id: 'prajurit_tebing_balkut',
      name: 'Regu Tebing Balkut',
      region: 'Ngarai Balkut · Band 3',
      tier: 'regular',
      sprite: 'npc-hurgak',
      maxHp: 64,
      atk: 24,
      def: 9,
      negotiateKepekaan: 16,
      xpReward: 52,
      stealthXp: 64,
      drop: 'garam_mineral',
      desc: 'Piket pengawas celah tebing yang menutup jalur karavan dengan perisai kayu keras.'
    },
    penjaga_sidang_salkara: {
      id: 'penjaga_sidang_salkara',
      name: 'Pengawal Lingkar Salkara',
      region: 'Padang Salkara · Band 4',
      tier: 'regular',
      sprite: 'npc-borlan',
      maxHp: 68,
      atk: 29,
      def: 11,
      negotiateKepekaan: 18,
      xpReward: 65,
      stealthXp: 78,
      drop: 'garam_mineral',
      desc: 'Penjaga lingkar luar 47 tenda Tujuh Panji yang menguji niat setiap utusan.'
    },
    juara_tujuh_panji: {
      id: 'juara_tujuh_panji',
      name: 'Ujian Tombak Tujuh Panji',
      region: 'Padang Salkara · Ujian Bab 1',
      tier: 'boss',
      sprite: 'npc-salgur',
      maxHp: 520,
      atk: 32,
      def: 16,
      negotiateKepekaan: 22,
      xpReward: 95,
      stealthXp: 115,
      drop: 'garam_mineral',
      desc: 'Juara tanding tombak adat Tujuh Panji; menguji keteguhan perintis maupun kefasihan kata.'
    },
    penyusup_maruani: {
      id: 'penyusup_maruani',
      name: 'Penyusup Bayangan Sabotase',
      region: 'Padang Salkara · Gangguan Malam',
      tier: 'regular',
      sprite: 'npc-maruani',
      portrait: 'portrait-maruani',
      maxHp: 68,
      atk: 39,
      def: 10,
      negotiateKepekaan: 20,
      xpReward: 75,
      stealthXp: 90,
      drop: 'garam_mineral',
      desc: 'Kaki tangan pengacau yang menyelundupkan minyak lentera untuk memicu bentrokan antar panji.'
    },
    pengawal_gorkan_pesisir: {
      id: 'pengawal_gorkan_pesisir',
      name: 'Pengintai Panji Gorkan',
      region: 'Tepi Salkara · Band 5',
      tier: 'regular',
      sprite: 'npc-hurgak',
      maxHp: 76,
      atk: 42,
      def: 13,
      negotiateKepekaan: 22,
      xpReward: 82,
      stealthXp: 98,
      drop: 'garam_mineral',
      desc: 'Pengawal garis keras Gorkan yang berpatroli di reruntuhan pantai untuk menghalangi penyelidik.'
    },
    bayangan_tepi_salkara: {
      id: 'bayangan_tepi_salkara',
      name: 'Utusan Gema Pesisir',
      region: 'Tepi Salkara · Ujian Akhir Bab 1',
      tier: 'boss',
      sprite: 'npc-maruani',
      portrait: 'portrait-maruani',
      maxHp: 560,
      atk: 34,
      def: 15,
      negotiateKepekaan: 26,
      xpReward: 120,
      stealthXp: 140,
      drop: 'garam_mineral',
      desc: 'Utusan bersenjata garpu perunggu suruhan Maruani yang menjaga batu pesisir agar masa lalu tetap terkubur.'
    },
    kapten_blokade: {
      id: 'kapten_blokade',
      name: 'Regu Blokade Gerbang Timur',
      region: 'Celah Badai · Konfrontasi Besar Bab 0',
      tier: 'boss',
      sprite: 'npc-salgur',
      maxHp: 340,
      atk: 16,
      def: 12,
      negotiateKepekaan: 18,
      xpReward: 60,
      stealthXp: 70,
      drop: 'roti_nilasar',
      desc: 'Barisan penjaga bersenjata tombak tumpul dan tameng kayu di celah pemeriksaan.'
    }
  };

  const DEFAULT_MAP_ENCOUNTERS = {
    nilasar: 'bandit_gurun',
    sumi: 'bandit_gurun',
    senja: 'bandit_gurun',
    gerbang: 'pengintai_dewan',
    simpul: 'pengintai_dewan',
    sela: 'penghadang_sela',
    balkut: 'penjaga_cirusia',
    salkara: 'penjaga_sidang_salkara',
    tepisalkara: 'pengawal_gorkan_pesisir'
  };

  function getEnemyIntent(enc) {
    if (!enc || enc.done) return { type: 'strike', label: 'Serangan Siaga', mult: 1 };
    const r = Math.max(1, Number(enc.round) || 1);
    const tier = enc.tmpl?.tier || 'regular';
    const lowHp = enc.hp < (enc.tmpl?.maxHp || 30) * 0.5;
    if (r % 3 === 0) return { type: 'heavy', label: 'Hantaman Berat!', mult: 1.35 };
    if ((tier !== 'regular' || lowHp) && r % 4 === 2) return { type: 'brace', label: 'Sikap Tameng', mult: 0.7 };
    return { type: 'strike', label: 'Serangan Terukur', mult: 1 };
  }

  function getBaseStats(level) {
    const lv = Math.max(1, Math.min(6, Math.floor(Number(level) || 1)));
    return { ...BASE_PER_LEVEL[lv] };
  }

  function initialRpgState() {
    const startItems = ['gear_rompi_kulit'];
    const base = getBaseStats(1);
    const modifiers = buildModifiersFromUnlocked(startItems);
    const bonusHp = modifiers.filter(m => m.stat === 'ketahanan').reduce((s, m) => s + m.amount, 0);
    return {
      level: 1,
      xp: 0,
      hp: base.ketahanan + bonusHp,
      equipped: {},
      modifiers,
      unlockedItems: startItems,
      consumables: { garam_mineral: 0, roti_nilasar: 2 },
      choiceFlags: {},
      encounterResults: {}
    };
  }

  // Linear passive progression: every unlocked item stays active without slot juggling.
  function buildModifiersFromUnlocked(unlockedItems) {
    const mods = [];
    for (const itemId of unlockedItems || []) {
      const item = ITEMS[itemId];
      if (!item || !item.modifiers?.length) continue;
      for (const m of item.modifiers) {
        mods.push({ source_id: item.id, stat: m.stat, amount: m.amount, label: item.name });
      }
    }
    return mods;
  }

  function getDerivedStats(rpg) {
    const base = getBaseStats(rpg.level);
    const derived = { ...base };
    for (const m of rpg.modifiers || []) {
      if (m.stat in derived) derived[m.stat] += m.amount;
    }
    return derived;
  }

  function clampHpToMax(rpg) {
    const maxHp = getDerivedStats(rpg).ketahanan;
    rpg.hp = Math.max(0, Math.min(rpg.hp, maxHp));
    return maxHp;
  }

  // Legacy compatibility: passive items cannot be unequipped and activate on unlock.
  function unequipItem() {
    return false;
  }

  function equipItem(rpg, itemId) {
    if (!rpg || !ITEMS[itemId] || !rpg.unlockedItems?.includes(itemId)) return false;
    rpg.modifiers = buildModifiersFromUnlocked(rpg.unlockedItems);
    clampHpToMax(rpg);
    return true;
  }

  function grantXp(rpg, amount) {
    const gain = Math.max(0, Math.round(Number(amount) || 0));
    if (!gain) return { leveledUp: false, level: rpg.level };
    rpg.xp += gain;
    let leveledUp = false;
    while (rpg.level < 6 && rpg.xp >= XP_THRESHOLDS[rpg.level + 1]) {
      const prevMax = getDerivedStats(rpg).ketahanan;
      rpg.level += 1;
      leveledUp = true;
      const nextMax = getDerivedStats(rpg).ketahanan;
      // Only actual level-up adds the level's Max HP delta cleanly.
      rpg.hp = Math.min(nextMax, rpg.hp + Math.max(0, nextMax - prevMax));
    }
    return { leveledUp, level: rpg.level, nextThreshold: XP_THRESHOLDS[rpg.level + 1] || null };
  }

  function unlockItem(rpg, itemId) {
    if (!ITEMS[itemId]) return false;
    if (!rpg.unlockedItems.includes(itemId)) {
      rpg.unlockedItems.push(itemId);
      rpg.modifiers = buildModifiersFromUnlocked(rpg.unlockedItems);
      clampHpToMax(rpg);
      return true;
    }
    return false;
  }

  function useConsumable(rpg, consumableId) {
    const c = CONSUMABLES[consumableId];
    if (!c || (rpg.consumables[consumableId] || 0) <= 0) return 0;
    const maxHp = getDerivedStats(rpg).ketahanan;
    if (rpg.hp >= maxHp) return 0;
    rpg.consumables[consumableId] -= 1;
    const before = rpg.hp;
    rpg.hp = Math.min(maxHp, rpg.hp + c.heal);
    return rpg.hp - before;
  }

  // Ratio-based defense: dmg * K / (K + def), ±10% variance, 5% crit (1.75x), single rounding at end.
  function calculateDamage(atk, def, options = {}) {
    const mult = Number.isFinite(options.actionMult) ? options.actionMult : 1;
    const rollVar = Number.isFinite(options.varianceRoll) ? options.varianceRoll : Math.random();
    const rollCrit = Number.isFinite(options.critRoll) ? options.critRoll : Math.random();
    const critBonus = Number.isFinite(options.critBonus) ? options.critBonus : 0;
    const variance = VARIANCE_MIN + (VARIANCE_MAX - VARIANCE_MIN) * Math.max(0, Math.min(1, rollVar));
    const isCrit = rollCrit < Math.min(0.95, BASE_CRIT_CHANCE + critBonus);
    const raw = Math.max(1, atk) * mult;
    const mitigated = raw * (DEFENSE_CONSTANT / (DEFENSE_CONSTANT + Math.max(0, def)));
    const damage = Math.max(1, Math.round(mitigated * variance * (isCrit ? CRIT_MULTIPLIER : 1)));
    return { damage, isCrit };
  }

  function getQuestStage(campaignState, seqIndex, objectives) {
    const seqObjs = objectives.filter(o => o.seqIndex === seqIndex);
    const doneCount = seqObjs.filter(o => campaignState.completed.includes(o.id)).length;
    const total = seqObjs.length;
    if (!total) return { status: 'active', done: 0, total: 0 };
    if (doneCount >= total) return { status: 'completed', done: total, total };
    if (doneCount === total - 1 && seqObjs.some(o => campaignState.foundFlags['ready_' + o.id])) {
      return { status: 'ready', done: doneCount, total };
    }
    return { status: 'active', done: doneCount, total };
  }

  function validateRpg(rpg, fallbackLevel = 1) {
    const base = initialRpgState();
    if (!rpg || typeof rpg !== 'object') return base;
    const lv = Math.max(1, Math.min(6, Math.floor(Number(rpg.level) || fallbackLevel)));
    const out = {
      level: lv,
      xp: Math.max(0, Math.round(Number(rpg.xp) || 0)),
      hp: Math.max(1, Math.round(Number(rpg.hp) || getBaseStats(lv).ketahanan)),
      equipped: {},
      modifiers: [],
      unlockedItems: Array.isArray(rpg.unlockedItems) ? rpg.unlockedItems.filter(id => !!ITEMS[id]) : ['gear_rompi_kulit'],
      consumables: {
        garam_mineral: Math.max(0, Math.floor(Number(rpg.consumables?.garam_mineral ?? 0))),
        roti_nilasar: Math.max(0, Math.floor(Number((rpg.consumables?.roti_nilasar ?? 2) + (rpg.consumables?.teh_gurun ?? 0))))
      },
      choiceFlags: rpg.choiceFlags && typeof rpg.choiceFlags === 'object' ? { ...rpg.choiceFlags } : {},
      encounterResults: rpg.encounterResults && typeof rpg.encounterResults === 'object' ? { ...rpg.encounterResults } : {}
    };
    if (!out.unlockedItems.includes('gear_rompi_kulit')) out.unlockedItems.unshift('gear_rompi_kulit');
    out.modifiers = buildModifiersFromUnlocked(out.unlockedItems);
    clampHpToMax(out);
    return out;
  }

  root.RPGSystem = {
    DEFENSE_CONSTANT,
    BASE_CRIT_CHANCE,
    CRIT_MULTIPLIER,
    XP_THRESHOLDS,
    ITEMS,
    CONSUMABLES,
    ENCOUNTERS,
    DEFAULT_MAP_ENCOUNTERS,
    getBaseStats,
    initialRpgState,
    getDerivedStats,
    equipItem,
    unequipItem,
    grantXp,
    unlockItem,
    useConsumable,
    calculateDamage,
    getEnemyIntent,
    getQuestStage,
    validateRpg
  };

  if (typeof module !== 'undefined') module.exports = root.RPGSystem;
})(typeof window !== 'undefined' ? window : globalThis);
