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
    alat_tas_peredam: {
      id: 'alat_tas_peredam',
      name: 'Tas Peredam Tseren',
      category: 'tool',
      tier: 'Alat Perintis',
      slot: null,
      unlockObjective: 'cp-0-2',
      feature: 'Menjaga muatan tetap teduh saat badai dan meredam getaran barang bawaan.',
      modifiers: []
    },
    alat_lentera_ruru: {
      id: 'alat_lentera_ruru',
      name: 'Lentera Angin & Peluit Ruru',
      category: 'tool',
      tier: 'Alat Perintis',
      slot: null,
      unlockObjective: 'cp-2-2',
      feature: 'Memangkas jeda pindai Ruru menjadi 4 detik dan membuka taktik pengalihan di konfrontasi.',
      modifiers: []
    },
    gear_rompi_kulit: {
      id: 'gear_rompi_kulit',
      name: 'Rompi Kulit Kafilah',
      category: 'equipment',
      tier: 'Common',
      slot: 'perlengkapan',
      unlockObjective: null,
      feature: 'Pelindung standar perintis lembah pasir.',
      modifiers: [
        { stat: 'ketahanan', amount: 6 },
        { stat: 'pertahanan', amount: 2 }
      ]
    },
    gear_tongkat_perintis: {
      id: 'gear_tongkat_perintis',
      name: 'Tongkat Ukur Perintis',
      category: 'equipment',
      tier: 'Common',
      slot: 'bekal',
      unlockObjective: 'cp-1-2',
      feature: 'Tongkat kayu keras untuk menguji kepadatan pasir dan menangkis sergapan.',
      modifiers: [
        { stat: 'ketangkasan', amount: 3 },
        { stat: 'kepekaan', amount: 2 }
      ]
    },
    gear_kompas_bahtari: {
      id: 'gear_kompas_bahtari',
      name: 'Kompas Arus Bahtari',
      category: 'equipment',
      tier: 'Uncommon',
      slot: 'bekal',
      unlockObjective: 'cp-3-2',
      feature: 'Kompas kuningan penunjuk arah angin dan pembacaan niat lawan bicara.',
      modifiers: [
        { stat: 'ketangkasan', amount: 4 },
        { stat: 'kepekaan', amount: 5 }
      ]
    },
    gear_jubah_asharim: {
      id: 'gear_jubah_asharim',
      name: 'Jubah Tenun Asharim',
      category: 'equipment',
      tier: 'Uncommon',
      slot: 'perlengkapan',
      unlockObjective: 'cp-6-2',
      feature: 'Tenun berlapis penahan badai pasir Nilasar dan pelindung benturan.',
      modifiers: [
        { stat: 'ketahanan', amount: 10 },
        { stat: 'pertahanan', amount: 4 },
        { stat: 'kepekaan', amount: 3 }
      ]
    },
    gear_sabuk_garam: {
      id: 'gear_sabuk_garam',
      name: 'Sabuk Penimbang Garam',
      category: 'equipment',
      tier: 'Rare',
      slot: 'bekal',
      unlockObjective: 'cp-4-2',
      feature: 'Sabuk kulit berbandul timbangan pasar yang menjaga kuda-kuda tetap kokoh.',
      modifiers: [
        { stat: 'ketahanan', amount: 8 },
        { stat: 'ketangkasan', amount: 5 },
        { stat: 'pertahanan', amount: 3 }
      ]
    },
    artefak_cincin_perunggu: {
      id: 'artefak_cincin_perunggu',
      name: 'Cincin Perunggu',
      category: 'mystery',
      tier: 'Artefak Misteri',
      slot: 'artefak',
      unlockObjective: 'cp-7-2',
      feature: 'Cincin perunggu kusam tanpa permata. Terkadang memberi sengatan halus di jari Nara.',
      modifiers: []
    },
    gear_selendang_sela: {
      id: 'gear_selendang_sela',
      name: 'Selendang Tenun Sela',
      category: 'equipment',
      tier: 'Rare',
      slot: 'perlengkapan',
      unlockObjective: 'cp-13-2',
      feature: 'Selendang serat kanal buatan Nenek Ima yang melindungi pundak dari angin dingin dan hantaman.',
      modifiers: [
        { stat: 'ketahanan', amount: 12 },
        { stat: 'pertahanan', amount: 5 },
        { stat: 'kepekaan', amount: 4 }
      ]
    },
    gear_tali_balkut: {
      id: 'gear_tali_balkut',
      name: 'Tambang Panjat Balkut',
      category: 'equipment',
      tier: 'Rare',
      slot: 'bekal',
      unlockObjective: 'cp-15-2',
      feature: 'Tambang rami berbobot perunggu pemberian Orsuk untuk menyeimbangkan pijakan tebing dan serangan balas.',
      modifiers: [
        { stat: 'ketahanan', amount: 4 },
        { stat: 'ketangkasan', amount: 7 },
        { stat: 'pertahanan', amount: 4 }
      ]
    },
    gear_lencana_salkara: {
      id: 'gear_lencana_salkara',
      name: 'Meterai Penengah Salkara',
      category: 'equipment',
      tier: 'Epic',
      slot: 'artefak',
      unlockObjective: 'cp-20-0',
      feature: 'Lencana mandataris Tujuh Panji. Memberi wibawa penuh dalam sidang dan benturan keras di Padang Salkara.',
      modifiers: [
        { stat: 'ketangkasan', amount: 6 },
        { stat: 'pertahanan', amount: 6 },
        { stat: 'kepekaan', amount: 8 }
      ]
    },
    gear_kalung_tujuh_panji: {
      id: 'gear_kalung_tujuh_panji',
      name: 'Jimat Sumpah Tujuh Panji',
      category: 'equipment',
      tier: 'Rare',
      slot: 'bekal',
      unlockObjective: 'cp-23-2',
      feature: 'Anyaman kulit dan piringan perunggu pemberian Orsuk setelah menggagalkan sabotase minyak di Salkara.',
      modifiers: [
        { stat: 'ketahanan', amount: 8 },
        { stat: 'ketangkasan', amount: 7 },
        { stat: 'kepekaan', amount: 6 }
      ]
    },
    gear_mandat_cirusia: {
      id: 'gear_mandat_cirusia',
      name: 'Mandat Kesaksian Cirusia',
      category: 'equipment',
      tier: 'Epic',
      slot: 'artefak',
      unlockObjective: 'cp-26-0',
      feature: 'Lempeng batu bertanda gencatan senjata resmi dari Odgar. Membuka jalan menuju pegunungan utara pada babak berikutnya.',
      modifiers: [
        { stat: 'ketahanan', amount: 10 },
        { stat: 'ketangkasan', amount: 9 },
        { stat: 'pertahanan', amount: 7 },
        { stat: 'kepekaan', amount: 10 }
      ]
    }
  };

  const CONSUMABLES = {
    garam_mineral: { id: 'garam_mineral', name: 'Kapsul Garam Balkut', heal: 24, desc: 'Memulihkan 24 Ketahanan saat menempuh tebing & medan berat.' },
    teh_gurun: { id: 'teh_gurun', name: 'Teh Daun Gurun', heal: 18, desc: 'Memulihkan 18 Ketahanan.' },
    roti_nilasar: { id: 'roti_nilasar', name: 'Roti Hangat Nilasar', heal: 12, desc: 'Memulihkan 12 Ketahanan.' }
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
      atk: 11,
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
      atk: 12,
      def: 6,
      negotiateKepekaan: 12,
      xpReward: 30,
      stealthXp: 40,
      drop: 'teh_gurun',
      desc: 'Petugas patroli Benteng Tata yang memeriksa bawaan perintis.'
    },
    penghadang_sela: {
      id: 'penghadang_sela',
      name: 'Pengutip Cukai Kanal Sela',
      region: 'Dusun Sela · Band 2',
      tier: 'regular',
      sprite: 'npc-dargun',
      maxHp: 44,
      atk: 13,
      def: 7,
      negotiateKepekaan: 13,
      xpReward: 38,
      stealthXp: 48,
      drop: 'teh_gurun',
      desc: 'Penjaga dermaga rakit yang memungut biaya lewat gelap di tepi saluran.'
    },
    penjaga_cirusia: {
      id: 'penjaga_cirusia',
      name: 'Penjaga Pos Balkut',
      region: 'Pos Balkut · Band 3',
      tier: 'regular',
      sprite: 'npc-hurgak',
      maxHp: 56,
      atk: 14,
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
      atk: 21,
      def: 10,
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
      atk: 32,
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
      atk: 35,
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
      atk: 42,
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
      atk: 14,
      def: 12,
      negotiateKepekaan: 18,
      xpReward: 60,
      stealthXp: 70,
      drop: 'teh_gurun',
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
    const base = getBaseStats(1);
    return {
      level: 1,
      xp: 0,
      hp: base.ketahanan,
      equipped: { perlengkapan: 'gear_rompi_kulit', bekal: null, artefak: null },
      modifiers: buildModifiersFromEquipped({ perlengkapan: 'gear_rompi_kulit', bekal: null, artefak: null }),
      unlockedItems: ['gear_rompi_kulit'],
      consumables: { garam_mineral: 0, teh_gurun: 2, roti_nilasar: 2 },
      choiceFlags: {},
      encounterResults: {}
    };
  }

  function buildModifiersFromEquipped(equipped) {
    const mods = [];
    for (const itemId of Object.values(equipped || {})) {
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

  // Remove modifiers by source_id without leaking or healing HP.
  function unequipItem(rpg, itemId) {
    const item = ITEMS[itemId];
    if (!item || !item.slot) return false;
    if (rpg.equipped[item.slot] !== itemId) return false;
    rpg.equipped[item.slot] = null;
    rpg.modifiers = (rpg.modifiers || []).filter(m => m.source_id !== itemId);
    clampHpToMax(rpg);
    return true;
  }

  function equipItem(rpg, itemId) {
    const item = ITEMS[itemId];
    if (!item || !item.slot) return false;
    if (!rpg.unlockedItems.includes(itemId)) return false;
    const prevId = rpg.equipped[item.slot];
    if (prevId === itemId) return true;
    if (prevId) unequipItem(rpg, prevId);
    rpg.equipped[item.slot] = itemId;
    rpg.modifiers = (rpg.modifiers || []).filter(m => m.source_id !== itemId);
    for (const m of item.modifiers || []) {
      rpg.modifiers.push({ source_id: item.id, stat: m.stat, amount: m.amount, label: item.name });
    }
    // Keep absolute HP clamped to newMaxHp so equip/unequip never grants free heal.
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
      if (itemId === 'artefak_cincin_perunggu') {
        rpg.equipped.artefak = itemId;
      }
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
      equipped: { perlengkapan: null, bekal: null, artefak: null },
      modifiers: [],
      unlockedItems: Array.isArray(rpg.unlockedItems) ? rpg.unlockedItems.filter(id => !!ITEMS[id]) : ['gear_rompi_kulit'],
      consumables: {
        garam_mineral: Math.max(0, Math.floor(Number(rpg.consumables?.garam_mineral ?? 0))),
        teh_gurun: Math.max(0, Math.floor(Number(rpg.consumables?.teh_gurun ?? 2))),
        roti_nilasar: Math.max(0, Math.floor(Number(rpg.consumables?.roti_nilasar ?? 2)))
      },
      choiceFlags: rpg.choiceFlags && typeof rpg.choiceFlags === 'object' ? { ...rpg.choiceFlags } : {},
      encounterResults: rpg.encounterResults && typeof rpg.encounterResults === 'object' ? { ...rpg.encounterResults } : {}
    };
    if (!out.unlockedItems.includes('gear_rompi_kulit')) out.unlockedItems.unshift('gear_rompi_kulit');
    for (const slot of ['perlengkapan', 'bekal', 'artefak']) {
      const id = rpg.equipped?.[slot];
      if (id && ITEMS[id]?.slot === slot && out.unlockedItems.includes(id)) {
        out.equipped[slot] = id;
      }
    }
    out.modifiers = buildModifiersFromEquipped(out.equipped);
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
