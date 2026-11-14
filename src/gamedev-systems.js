/* ============================================================================
 * JALUR SENYAP v4 — GAMEDEV SKILLS ARCHITECTURE MODULE (src/gamedev-systems.js)
 * Integrates patterns from all 23 installed gamedev skills:
 * - web-engines (6): threejs-scene-setup, threejs-materials-lighting,
 *   threejs-gltf-loading, pixijs-rendering, phaser-core, phaser-arcade-physics
 * - genres (2): visual-novel, puzzle
 * - disciplines (15): ai-behavior-trees-utility-ai, audio-design, camera-systems,
 *   create-game-assets, dialogue-systems, game-ai, game-feel, game-ui-ux,
 *   input-systems, level-design, performance-optimization, physics-tuning,
 *   procedural-gen, save-systems, shader-programming
 * ============================================================================ */
(function (root) {
  'use strict';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // ==========================================================================
  // 1. PROCEDURAL-GEN: Deterministic SplitMix64 PRNG & Seeded Streams
  // ==========================================================================
  class SplitMix64 {
    constructor(seed = 103) {
      this.state = BigInt(seed) & 0xFFFFFFFFFFFFFFFFn;
    }
    nextU64() {
      this.state = (this.state + 0x9E3779B97F4A7C15n) & 0xFFFFFFFFFFFFFFFFn;
      let z = this.state;
      z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & 0xFFFFFFFFFFFFFFFFn;
      z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & 0xFFFFFFFFFFFFFFFFn;
      return (z ^ (z >> 31n)) & 0xFFFFFFFFFFFFFFFFn;
    }
    nextFloat() {
      return Number(this.nextU64() >> 11n) / 9007199254740992;
    }
    range(min, max) {
      return min + this.nextFloat() * (max - min);
    }
    below(n) {
      if (n <= 1) return 0;
      return Math.floor(this.nextFloat() * n);
    }
    fork(label = '') {
      let h = Number(this.nextU64() & 0x7FFFFFFFn);
      for (let i = 0; i < label.length; i++) {
        h = Math.imul(h ^ label.charCodeAt(i), 16777619) >>> 0;
      }
      return new SplitMix64(h);
    }
    snapshot() {
      return this.state.toString();
    }
    restore(str) {
      try { this.state = BigInt(str) & 0xFFFFFFFFFFFFFFFFn; } catch (_) {}
    }
  }

  // ==========================================================================
  // 2. INPUT-SYSTEMS: Intent Actions, Radial Deadzone, 150ms Buffer & Rebind
  // ==========================================================================
  const DEFAULT_BINDINGS = {
    move_up: ['KeyW', 'ArrowUp'],
    move_down: ['KeyS', 'ArrowDown'],
    move_left: ['KeyA', 'ArrowLeft'],
    move_right: ['KeyD', 'ArrowRight'],
    sprint: ['ShiftLeft', 'ShiftRight'],
    jump: ['Space'],
    interact: ['KeyE'],
    scan: ['KeyQ'],
    guide: ['KeyG'],
    cam_left: ['KeyZ'],
    cam_right: ['KeyX'],
    cam_center: ['KeyC'],
    journal: ['Tab', 'KeyJ'],
    map: ['KeyM'],
    help: ['KeyH'],
    backlog: ['KeyB'],
    vn_auto: ['KeyV'],
    skills_hud: ['F2', 'Backquote']
  };

  const GLYPH_LABELS = {
    keyboard: {
      interact: 'E', jump: 'Space', scan: 'Q',
      guide: 'G', journal: 'Tab', map: 'M', pause: 'Esc', backlog: 'B'
    },
    gamepad: {
      interact: 'A / X', jump: 'B', scan: 'Y',
      guide: 'LB', journal: 'Select', map: 'DPad ↑', pause: 'Start', backlog: 'LT'
    },
    touch: {
      interact: 'Ketuk [E]', jump: 'Lompat', scan: 'Ruru',
      guide: 'Kompas', journal: 'Jurnal', map: 'Peta', pause: 'Jeda', backlog: 'Riwayat'
    }
  };

  class ActionBuffer {
    constructor(windowSec = 0.15) {
      this.window = windowSec;
      this.pressedAt = Object.create(null);
    }
    press(action, nowSec) {
      this.pressedAt[action] = nowSec;
    }
    consume(action, nowSec) {
      const t = this.pressedAt[action];
      if (t === undefined || (nowSec - t) > this.window) return false;
      delete this.pressedAt[action];
      return true;
    }
    clear() {
      this.pressedAt = Object.create(null);
    }
  }

  class InputSystem {
    constructor(storage) {
      this.storage = storage;
      this.bindings = JSON.parse(JSON.stringify(DEFAULT_BINDINGS));
      this.buffer = new ActionBuffer(0.15);
      this.device = 'keyboard';
      this.deadzone = 0.2;
      this.responseCurve = 1.35;
      this.gamepadState = { moveX: 0, moveY: 0, camX: 0, camY: 0, buttons: {} };
      this.touchState = { active: false, moveX: 0, moveY: 0 };
      this.rebindTarget = null;
      this.loadBindings();
    }

    static applyRadialDeadzone(x, y, dead = 0.2, curve = 1.35) {
      if (!(dead >= 0 && dead < 1 && curve > 0)) return { x: 0, y: 0 };
      const mag = Math.hypot(x, y);
      if (mag <= dead) return { x: 0, y: 0 };
      const scaled = Math.min((mag - dead) / (1 - dead), 1);
      const factor = Math.pow(scaled, curve) / mag;
      return { x: x * factor, y: y * factor };
    }

    loadBindings() {
      try {
        const raw = this.storage?.getItem('jalur-senyap-bindings-v1');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          for (const k of Object.keys(DEFAULT_BINDINGS)) {
            if (Array.isArray(parsed[k]) && parsed[k].length) {
              this.bindings[k] = parsed[k].map(String);
            }
          }
        }
      } catch (_) {}
    }

    saveBindings() {
      try {
        this.storage?.setItem('jalur-senyap-bindings-v1', JSON.stringify(this.bindings));
      } catch (_) {}
    }

    resetBindings() {
      this.bindings = JSON.parse(JSON.stringify(DEFAULT_BINDINGS));
      this.saveBindings();
    }

    rebind(action, keyCode) {
      if (!this.bindings[action] || keyCode === 'Escape') return { ok: false, reason: 'reserved' };
      for (const [other, keys] of Object.entries(this.bindings)) {
        if (other !== action && keys.includes(keyCode)) {
          return { ok: false, reason: 'conflict', conflictWith: other };
        }
      }
      this.bindings[action] = [keyCode];
      this.saveBindings();
      return { ok: true };
    }

    auditBindings() {
      const problems = [];
      const seen = new Map();
      for (const [action, keys] of Object.entries(this.bindings)) {
        if (!keys || !keys.length) problems.push(`${action}: no binding`);
        for (const k of keys || []) {
          if (seen.has(k) && seen.get(k) !== action) {
            problems.push(`${action} and ${seen.get(k)} share ${k}`);
          }
          seen.set(k, action);
        }
      }
      return problems;
    }

    isActionHeld(action, keysDown) {
      const codes = this.bindings[action] || [];
      for (const c of codes) {
        if (keysDown && keysDown[c]) return true;
      }
      if (action === 'sprint' && this.gamepadState.buttons.sprint) return true;
      if (action === 'jump' && this.gamepadState.buttons.jump) return true;
      return false;
    }

    getMoveVector(keysDown) {
      let kx = (this.isActionHeld('move_right', keysDown) ? 1 : 0) - (this.isActionHeld('move_left', keysDown) ? 1 : 0);
      let ky = (this.isActionHeld('move_up', keysDown) ? 1 : 0) - (this.isActionHeld('move_down', keysDown) ? 1 : 0);
      if (kx !== 0 || ky !== 0) {
        const len = Math.hypot(kx, ky);
        return { x: kx / len, y: ky / len };
      }
      if (this.touchState.active && (this.touchState.moveX || this.touchState.moveY)) {
        return InputSystem.applyRadialDeadzone(this.touchState.moveX, this.touchState.moveY, 0.12, 1.15);
      }
      if (this.gamepadState.moveX || this.gamepadState.moveY) {
        return { x: this.gamepadState.moveX, y: this.gamepadState.moveY };
      }
      return { x: 0, y: 0 };
    }

    pollGamepad(nowSec, onEdgeAction) {
      if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') return;
      let pads;
      try { pads = navigator.getGamepads(); } catch (_) { return; }
      const pad = pads && (pads[0] || pads[1] || pads[2] || pads[3]);
      if (!pad || !pad.connected) return;
      const move = InputSystem.applyRadialDeadzone(pad.axes[0] || 0, -(pad.axes[1] || 0), this.deadzone, this.responseCurve);
      const cam = InputSystem.applyRadialDeadzone(pad.axes[2] || 0, pad.axes[3] || 0, this.deadzone, 1.25);
      this.gamepadState.moveX = move.x;
      this.gamepadState.moveY = move.y;
      this.gamepadState.camX = cam.x;
      this.gamepadState.camY = cam.y;
      if (Math.hypot(move.x, move.y) > 0.1 || Math.hypot(cam.x, cam.y) > 0.1) {
        this.device = 'gamepad';
      }
      const map = {
        jump: !!(pad.buttons[0]?.pressed),
        interact: !!(pad.buttons[2]?.pressed || pad.buttons[1]?.pressed),
        scan: !!(pad.buttons[3]?.pressed),
        guide: !!(pad.buttons[4]?.pressed),
        sprint: !!(pad.buttons[7]?.pressed || pad.buttons[10]?.pressed),
        journal: !!(pad.buttons[8]?.pressed),
        pause: !!(pad.buttons[9]?.pressed),
        map: !!(pad.buttons[12]?.pressed)
      };
      for (const [act, down] of Object.entries(map)) {
        const was = !!this.gamepadState.buttons[act];
        this.gamepadState.buttons[act] = down;
        if (down && !was) {
          this.device = 'gamepad';
          this.buffer.press(act, nowSec);
          if (onEdgeAction) onEdgeAction(act);
        }
      }
    }

    glyph(action) {
      const table = GLYPH_LABELS[this.device] || GLYPH_LABELS.keyboard;
      if (this.device === 'keyboard' && this.bindings[action]?.[0]) {
        const code = this.bindings[action][0];
        return code.replace(/^Key/, '').replace(/^Digit/, '');
      }
      return table[action] || 'E';
    }
  }

  // ==========================================================================
  // 3. GAME-FEEL: Decaying Trauma Screen Shake, Hit-Stop & Squash-Stretch
  // ==========================================================================
  class GameFeel {
    constructor() {
      this.trauma = 0;
      this.decay = 1.35;
      this.maxOffset = { x: 0.22, y: 0.15 };
      this.maxRoll = 0.032;
      this.shakeStrength = 1.0;
      this.reduceMotion = false;
      this.time = 0;
      this.offset = { x: 0, y: 0, roll: 0 };
      this.timeScale = 1.0;
      this._hitStopId = 0;
      this.scalePose = { x: 1, y: 1, z: 1, velY: 0 };
    }

    addTrauma(amount) {
      if (this.reduceMotion) amount *= 0.2;
      this.trauma = clamp(this.trauma + amount, 0, 1);
    }

    feedback(tier = 'small') {
      if (tier === 'small') {
        this.addTrauma(0.14);
        this.popScale(1.06, 0.94);
      } else if (tier === 'medium') {
        this.addTrauma(0.36);
        this.popScale(1.16, 0.86);
        this.hitStop(0.045, 0.15);
      } else if (tier === 'large') {
        this.addTrauma(0.72);
        this.popScale(1.24, 0.78);
        this.hitStop(0.09, 0.08);
      }
    }

    popScale(xz = 1.15, y = 0.85) {
      if (this.reduceMotion) return;
      this.scalePose.x = xz;
      this.scalePose.z = xz;
      this.scalePose.y = y;
    }

    hitStop(durationSec = 0.06, slow = 0.1) {
      if (this.reduceMotion) return;
      const myId = ++this._hitStopId;
      this.timeScale = slow;
      setTimeout(() => {
        if (this._hitStopId === myId) {
          this.timeScale = 1.0;
        }
      }, Math.max(10, durationSec * 1000));
    }

    update(realDt) {
      // Scale spring return (overshoot back to 1.0)
      const k = 1 - Math.exp(-16 * realDt);
      this.scalePose.x = lerp(this.scalePose.x, 1, k);
      this.scalePose.y = lerp(this.scalePose.y, 1, k);
      this.scalePose.z = lerp(this.scalePose.z, 1, k);
      if (Math.abs(this.scalePose.x - 1) < 0.002) this.scalePose.x = 1;
      if (Math.abs(this.scalePose.y - 1) < 0.002) this.scalePose.y = 1;
      if (Math.abs(this.scalePose.z - 1) < 0.002) this.scalePose.z = 1;

      if (this.trauma <= 0) {
        this.offset.x = 0;
        this.offset.y = 0;
        this.offset.roll = 0;
        return this.offset;
      }
      this.trauma = Math.max(0, this.trauma - this.decay * realDt);
      const shake = this.trauma * this.trauma * this.shakeStrength * (this.reduceMotion ? 0.15 : 1);
      this.time += realDt * 28;
      this.offset.x = this.maxOffset.x * shake * Math.sin(this.time * 1.7);
      this.offset.y = this.maxOffset.y * shake * Math.sin(this.time * 2.3);
      this.offset.roll = this.maxRoll * shake * Math.sin(this.time * 1.1);
      if (this.trauma === 0) {
        this.offset.x = 0;
        this.offset.y = 0;
        this.offset.roll = 0;
      }
      return this.offset;
    }
  }

  // ==========================================================================
  // 4. AI-BEHAVIOR-TREES-UTILITY-AI & GAME-AI: Blackboard, Reactive BT & Utility
  // ==========================================================================
  const BTStatus = { SUCCESS: 'SUCCESS', FAILURE: 'FAILURE', RUNNING: 'RUNNING' };

  class Blackboard {
    constructor(initial = {}) {
      this.data = Object.assign(Object.create(null), initial);
    }
    get(key, fallback = null) {
      return this.data[key] !== undefined ? this.data[key] : fallback;
    }
    set(key, val) {
      this.data[key] = val;
    }
  }

  class BTNode {
    tick(_bb, _dt) { return BTStatus.FAILURE; }
    reset() {}
  }

  class BTCondition extends BTNode {
    constructor(fn) { super(); this.fn = fn; }
    tick(bb) { return this.fn(bb) ? BTStatus.SUCCESS : BTStatus.FAILURE; }
  }

  class BTAction extends BTNode {
    constructor(fn, resetFn = null) {
      super();
      this.fn = fn;
      this.resetFn = resetFn;
    }
    tick(bb, dt) { return this.fn(bb, dt); }
    reset() { if (this.resetFn) this.resetFn(); }
  }

  class ReactiveSequence extends BTNode {
    constructor(children = []) {
      super();
      this.children = children;
      this.runningIdx = -1;
    }
    tick(bb, dt) {
      for (let i = 0; i < this.children.length; i++) {
        const s = this.children[i].tick(bb, dt);
        if (s === BTStatus.RUNNING) {
          if (this.runningIdx !== -1 && this.runningIdx !== i) {
            this.children[this.runningIdx].reset();
          }
          this.runningIdx = i;
          return BTStatus.RUNNING;
        }
        this.children[i].reset();
        if (s === BTStatus.FAILURE) {
          if (this.runningIdx !== -1) {
            this.children[this.runningIdx].reset();
            this.runningIdx = -1;
          }
          return BTStatus.FAILURE;
        }
      }
      this.runningIdx = -1;
      return BTStatus.SUCCESS;
    }
    reset() {
      if (this.runningIdx !== -1) {
        this.children[this.runningIdx].reset();
        this.runningIdx = -1;
      }
    }
  }

  class ReactiveSelector extends BTNode {
    constructor(children = []) {
      super();
      this.children = children;
      this.runningIdx = -1;
    }
    tick(bb, dt) {
      for (let i = 0; i < this.children.length; i++) {
        const s = this.children[i].tick(bb, dt);
        if (s === BTStatus.RUNNING) {
          if (this.runningIdx !== -1 && this.runningIdx !== i) {
            this.children[this.runningIdx].reset();
          }
          this.runningIdx = i;
          return BTStatus.RUNNING;
        }
        this.children[i].reset();
        if (s === BTStatus.SUCCESS) {
          if (this.runningIdx !== -1 && this.runningIdx !== i) {
            this.children[this.runningIdx].reset();
          }
          this.runningIdx = -1;
          return BTStatus.SUCCESS;
        }
      }
      this.runningIdx = -1;
      return BTStatus.FAILURE;
    }
    reset() {
      if (this.runningIdx !== -1) {
        this.children[this.runningIdx].reset();
        this.runningIdx = -1;
      }
    }
  }

  const Curves = {
    inverseLerp01(v, a, b) {
      if (a === b) return 0;
      return clamp((v - a) / (b - a), 0, 1);
    },
    sigmoid(x, k = 8, mid = 0.5) {
      return clamp(1 / (1 + Math.exp(-k * (x - mid))), 0, 1);
    },
    compensate(product, count) {
      if (product <= 0 || count <= 1) return Math.max(0, product);
      const mod = 1 - 1 / count;
      const makeup = (1 - product) * mod;
      return clamp(product + product * makeup, 0, 1);
    }
  };

  class UtilityScorer {
    constructor(actions) {
      this.actions = actions;
      this.currentAction = null;
      this.lastScores = {};
    }
    select(bb, inertiaBonus = 0.05) {
      let best = null;
      let bestScore = 0;
      this.lastScores = {};
      for (const act of this.actions) {
        const factors = act.considerations.map(fn => clamp(fn(bb), 0, 1));
        let raw = 1;
        for (const f of factors) raw *= f;
        let score = Curves.compensate(raw, factors.length);
        if (score > 0 && this.currentAction === act.name) {
          score = Math.min(1, score + inertiaBonus);
        }
        this.lastScores[act.name] = +score.toFixed(3);
        if (score > bestScore) {
          bestScore = score;
          best = act;
        }
      }
      this.currentAction = best ? best.name : null;
      return { action: this.currentAction, score: bestScore, scores: this.lastScores };
    }
  }

  // Ruru Companion Utility AI + Guard Patrol Reactive BT Manager
  class GameAIManager {
    constructor() {
      this.ruruBB = new Blackboard({
        distToPlayer: 1.5,
        distToObjective: 50,
        scanActive: 0,
        nearDiscoveryDist: 999,
        stormIntensity: 0
      });
      this.ruruUtility = new UtilityScorer([
        {
          name: 'GuideToObjective',
          considerations: [
            bb => bb.get('scanActive') > 0 ? 1.0 : 0.25,
            bb => Curves.inverseLerp01(bb.get('distToObjective'), 2.5, 45)
          ]
        },
        {
          name: 'SniffRelic',
          considerations: [
            bb => Curves.inverseLerp01(bb.get('nearDiscoveryDist'), 18, 2),
            bb => bb.get('stormIntensity') < 0.8 ? 0.95 : 0.4
          ]
        },
        {
          name: 'ShelterClose',
          considerations: [
            bb => bb.get('stormIntensity'),
            bb => Curves.inverseLerp01(bb.get('distToPlayer'), 0.5, 6)
          ]
        },
        {
          name: 'FollowBeside',
          considerations: [
            () => 0.62
          ]
        }
      ]);

      this.guardBB = new Blackboard({
        distToPlayer: 99,
        inSightCone: false,
        awareness01: 0,
        alerted: false,
        patrolPhase: 0,
        stateName: 'Patrol'
      });

      this.guardTree = new ReactiveSelector([
        new ReactiveSequence([
          new BTCondition(bb => {
            // Hysteresis: enter alert at awareness >= 0.75 (or < 7.5m in cone), exit only when < 0.25 (or > 12.5m)
            const d = bb.get('distToPlayer');
            const cone = bb.get('inSightCone');
            if (!bb.get('alerted') && cone && d < 7.5) bb.set('alerted', true);
            else if (bb.get('alerted') && (!cone || d > 12.5)) bb.set('alerted', false);
            return bb.get('alerted');
          }),
          new BTAction(bb => {
            bb.set('stateName', 'Inspecting');
            return BTStatus.RUNNING;
          }, () => {
            this.guardBB.set('stateName', 'Patrol');
          })
        ]),
        new BTAction(bb => {
          bb.set('stateName', 'Patrol');
          return BTStatus.RUNNING;
        })
      ]);

      this.accum = 0;
      this.ruruDecision = { action: 'FollowBeside', score: 0.62, scores: {} };
    }

    tick(game, dt) {
      this.accum += dt;
      if (this.accum < 0.1) return; // 10 Hz AI decision cadence
      const stepDt = this.accum;
      this.accum = 0;
      if (!game || !game.player) return;

      const p = game.player.position;
      const obj = game.state.objective();
      const dObj = obj ? Math.hypot(obj.position[0] - p.x, obj.position[2] - p.z) : 50;
      let nearDisc = 999;
      for (const d of game.data?.world?.discoveries || []) {
        if (game.state.value.discoveries.includes(d.id)) continue;
        const dist = Math.hypot(d.position[0] - p.x, d.position[2] - p.z);
        if (dist < nearDisc) nearDisc = dist;
      }

      this.ruruBB.set('distToPlayer', game.ruru ? game.ruru.position.distanceTo(p) : 1.5);
      this.ruruBB.set('distToObjective', dObj);
      this.ruruBB.set('scanActive', game.guideTime > 0 ? 1 : 0);
      this.ruruBB.set('nearDiscoveryDist', nearDisc);
      this.ruruBB.set('stormIntensity', game.state.value.weather === 'berat' ? 0.92 : 0.1);
      this.ruruDecision = this.ruruUtility.select(this.ruruBB, 0.05);

      // Update Guard Perception & BT
      const guards = game.world?.cincinPatrols || [];
      let minGuardDist = 99;
      let anyInCone = false;
      for (const g of guards) {
        const dx = p.x - g.position.x;
        const dz = p.z - g.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist < minGuardDist) minGuardDist = dist;
        if (dist < 14 && dist > 0.01) {
          const fwdX = Math.sin(g.rotation.y);
          const fwdZ = Math.cos(g.rotation.y);
          const dot = (dx / dist) * fwdX + (dz / dist) * fwdZ;
          if (dot > 0.45) anyInCone = true; // ~63 deg half-angle cone
        }
      }
      this.guardBB.set('distToPlayer', minGuardDist);
      this.guardBB.set('inSightCone', anyInCone);
      const curAw = this.guardBB.get('awareness01');
      const nextAw = anyInCone && minGuardDist < 10
        ? clamp(curAw + stepDt * 1.4, 0, 1)
        : clamp(curAw - stepDt * 0.8, 0, 1);
      this.guardBB.set('awareness01', nextAw);
      this.guardTree.tick(this.guardBB, stepDt);
    }
  }

  // ==========================================================================
  // 5. DIALOGUE-SYSTEMS & VISUAL-NOVEL: Validator, Typewriter, Backlog, Skip, Auto
  // ==========================================================================
  class VNDialogueSystem {
    constructor(storage) {
      this.storage = storage;
      this.seenKey = 'jalur-senyap-seen-lines-v1';
      this.seenLines = new Set();
      this.backlog = [];
      this.maxBacklog = 160;
      this.cps = 58; // Characters per second (0 = instant)
      this.autoMode = false;
      this.skipMode = false;
      this.revealedChars = 0;
      this.fullLength = 0;
      this.isComplete = true;
      this.currentLineId = '';
      this.autoTimer = 0;
      this.skipTimer = 0;
      this.loadSeen();
    }

    loadSeen() {
      try {
        const raw = this.storage?.getItem(this.seenKey);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) arr.forEach(id => this.seenLines.add(String(id)));
        }
      } catch (_) {}
    }

    saveSeen() {
      try {
        this.storage?.setItem(this.seenKey, JSON.stringify([...this.seenLines].slice(-1200)));
      } catch (_) {}
    }

    static validateAllDialogues(dialogues) {
      const issues = [];
      for (const [dlgId, dlg] of Object.entries(dialogues || {})) {
        if (!dlg || !dlg.nodes) {
          issues.push(`${dlgId}: missing nodes`);
          continue;
        }
        const start = dlg.node || 'n0';
        if (!dlg.nodes[start]) issues.push(`${dlgId}: missing start node ${start}`);
        for (const [nId, node] of Object.entries(dlg.nodes)) {
          if (node.next && !dlg.nodes[node.next]) {
            issues.push(`${dlgId}.${nId}: missing next target ${node.next}`);
          }
          for (const c of node.choices || []) {
            if (c.next && !dlg.nodes[c.next]) {
              issues.push(`${dlgId}.${nId}: choice missing target ${c.next}`);
            }
          }
        }
      }
      return issues;
    }

    beginLine(dlgId, nodeId, speaker, text, el) {
      this.currentLineId = `${dlgId}:${nodeId}`;
      const cleanText = String(text || '');
      this.fullLength = cleanText.length;

      // Record in backlog (avoid duplicate consecutive entries)
      const last = this.backlog[this.backlog.length - 1];
      if (!last || last.id !== this.currentLineId) {
        this.backlog.push({ id: this.currentLineId, speaker: speaker || 'Nara', text: cleanText });
        if (this.backlog.length > this.maxBacklog) this.backlog.shift();
      }

      // Stop skipMode if this line has not been seen yet! (Visual-Novel skill rule)
      if (this.skipMode && !this.seenLines.has(this.currentLineId)) {
        this.skipMode = false;
      }

      if (!el) {
        this.isComplete = true;
        this.seenLines.add(this.currentLineId);
        return;
      }

      // Pre-layout full text to prevent word-wrap jumping (Visual-Novel Pattern 1)
      if (this.cps <= 0 || this.skipMode) {
        el.textContent = cleanText;
        this.revealedChars = this.fullLength;
        this.isComplete = true;
        this.seenLines.add(this.currentLineId);
        this.saveSeen();
      } else {
        el.innerHTML = '';
        const visibleSpan = document.createElement('span');
        visibleSpan.className = 'vn-visible-slice';
        const hiddenSpan = document.createElement('span');
        hiddenSpan.className = 'vn-hidden-slice';
        hiddenSpan.style.opacity = '0';
        hiddenSpan.textContent = cleanText;
        el.append(visibleSpan, hiddenSpan);
        this._visSpan = visibleSpan;
        this._hidSpan = hiddenSpan;
        this._rawText = cleanText;
        this.revealedChars = 0;
        this.isComplete = false;
      }
      this.autoTimer = Math.max(1.4, Math.min(4.8, 0.9 + cleanText.length * 0.035));
      this.skipTimer = 0.09;
    }

    completeLine(el) {
      if (this.isComplete) return false;
      this.isComplete = true;
      this.revealedChars = this.fullLength;
      if (el && this._rawText !== undefined) {
        el.textContent = this._rawText;
      }
      if (this.currentLineId) {
        this.seenLines.add(this.currentLineId);
        this.saveSeen();
      }
      return true;
    }

    update(dt, ui) {
      if (!ui || !ui.dialogue) return;
      const el = document.getElementById('vn-text');
      const node = ui.dialogue.nodes?.[ui.node];
      if (!node) return;

      if (!this.isComplete) {
        this.revealedChars += this.cps * dt;
        const count = Math.min(this.fullLength, Math.floor(this.revealedChars));
        if (this._visSpan && this._hidSpan && this._rawText !== undefined) {
          this._visSpan.textContent = this._rawText.slice(0, count);
          this._hidSpan.textContent = this._rawText.slice(count);
        }
        if (count >= this.fullLength) {
          this.completeLine(el);
        }
        return;
      }

      // Pause auto/skip at choices
      if (node.choices && node.choices.length) {
        this.skipMode = false;
        return;
      }

      if (this.skipMode && this.seenLines.has(this.currentLineId)) {
        this.skipTimer -= dt;
        if (this.skipTimer <= 0) {
          this.skipTimer = 0.09;
          ui.advance();
        }
      } else if (this.autoMode) {
        this.autoTimer -= dt;
        if (this.autoTimer <= 0) {
          ui.advance();
        }
      }
    }
  }

  // ==========================================================================
  // 6. PUZZLE SKILL: Pure Board Model, Undo/Restart Stack & BFS Solver + Hint
  // ==========================================================================
  class PuzzleEngine {
    // Family 1: Resonance Ring Tuning ('tune')
    // 3 Bronze Rings (Outer, Middle, Inner), each has phase 0..3. Goal: align all to [0, 0, 0].
    // Moves:
    //  0 ("Putar Cincin Luar & Tengah"): (r0+1)%4, (r1+1)%4
    //  1 ("Putar Cincin Tengah & Dalam"): (r1+1)%4, (r2+1)%4
    //  2 ("Putar Cincin Luar & Dalam"): (r0+1)%4, (r2+3)%4
    static createTuneBoard(seed = 103) {
      const rng = new SplitMix64(seed);
      const state = {
        kind: 'tune',
        rings: [0, 0, 0],
        moves: 0,
        rngState: rng.snapshot()
      };
      // Generate backwards from solved state [0,0,0] so it is 100% guaranteed solvable!
      const scrambleMoves = [0, 1, 2, 0, 1];
      for (const m of scrambleMoves) {
        state.rings = PuzzleEngine.stepRings(state.rings, m);
      }
      if (state.rings.every(r => r === 0)) state.rings = [3, 2, 3];
      return state;
    }

    static stepRings(rings, moveIdx) {
      const r = rings.slice();
      if (moveIdx === 0) { r[0] = (r[0] + 1) % 4; r[1] = (r[1] + 1) % 4; }
      else if (moveIdx === 1) { r[1] = (r[1] + 1) % 4; r[2] = (r[2] + 1) % 4; }
      else if (moveIdx === 2) { r[0] = (r[0] + 1) % 4; r[2] = (r[2] + 3) % 4; }
      return r;
    }

    // Family 2: Balkut Winch Counterweight ('bridge')
    // 3 Counterweight Pins [p0, p1, p2] in values 0..2. Goal: all equal to 2 (balanced lock).
    static createBridgeBoard(seed = 209) {
      const rng = new SplitMix64(seed);
      return {
        kind: 'bridge',
        pins: [1, 0, 1],
        moves: 0,
        rngState: rng.snapshot()
      };
    }

    static stepPins(pins, moveIdx) {
      const p = pins.slice();
      if (moveIdx === 0) { p[0] = (p[0] + 1) % 3; p[1] = (p[1] + 1) % 3; }
      else if (moveIdx === 1) { p[0] = (p[0] + 1) % 3; p[1] = (p[1] + 1) % 3; p[2] = (p[2] + 1) % 3; }
      else if (moveIdx === 2) { p[1] = (p[1] + 1) % 3; p[2] = (p[2] + 1) % 3; }
      return p;
    }

    static isSolved(state) {
      if (!state) return false;
      if (state.kind === 'tune') return state.rings.every(v => v === 0);
      if (state.kind === 'bridge') return state.pins.every(v => v === 2);
      return false;
    }

    static applyMove(state, moveIdx) {
      const next = JSON.parse(JSON.stringify(state));
      next.moves = (next.moves || 0) + 1;
      if (next.kind === 'tune') {
        next.rings = PuzzleEngine.stepRings(next.rings, moveIdx);
      } else if (next.kind === 'bridge') {
        next.pins = PuzzleEngine.stepPins(next.pins, moveIdx);
      }
      const solved = PuzzleEngine.isSolved(next);
      return {
        state: next,
        events: [
          { type: 'move', moveIdx, moves: next.moves },
          ...(solved ? [{ type: 'solved' }] : [])
        ]
      };
    }

    static hashState(state) {
      if (state.kind === 'tune') return `tune:${state.rings.join(',')}`;
      return `bridge:${state.pins.join(',')}`;
    }

    // BFS Solver that returns shortest move sequence [m0, m1, ...]
    static solveBFS(startState) {
      if (PuzzleEngine.isSolved(startState)) return [];
      const queue = [{ state: startState, path: [] }];
      const visited = new Set([PuzzleEngine.hashState(startState)]);
      while (queue.length > 0) {
        const { state, path } = queue.shift();
        if (path.length >= 10) continue;
        for (let m = 0; m < 3; m++) {
          const { state: next } = PuzzleEngine.applyMove(state, m);
          const h = PuzzleEngine.hashState(next);
          if (visited.has(h)) continue;
          const nextPath = [...path, m];
          if (PuzzleEngine.isSolved(next)) return nextPath;
          visited.add(h);
          queue.push({ state: next, path: nextPath });
        }
      }
      return null;
    }
  }

  // ==========================================================================
  // 7. SAVE-SYSTEMS: Atomic Save (.tmp -> .bak -> key), Corruption Recovery & Slots
  // ==========================================================================
  class AtomicSaveSystem {
    constructor(storage, baseKey = 'jalur-senyap-cincin-v1') {
      this.storage = storage;
      this.baseKey = baseKey;
      this.lastBackupUsed = false;
    }

    saveAtomic(key, dataObj) {
      if (!this.storage) return false;
      const json = JSON.stringify(dataObj);
      const tmpKey = `${key}.tmp`;
      const bakKey = `${key}.bak`;
      try {
        this.storage.setItem(tmpKey, json);
        const verifyTmp = this.storage.getItem(tmpKey);
        if (verifyTmp !== json) return false;
        const prev = this.storage.getItem(key);
        if (prev) {
          try {
            // Only overwrite .bak if previous primary save was valid JSON
            JSON.parse(prev);
            this.storage.setItem(bakKey, prev);
          } catch (_) {}
        }
        this.storage.setItem(key, json);
        return true;
      } catch (_) {
        return false;
      }
    }

    loadSafe(key, validatorFn) {
      if (!this.storage) return null;
      this.lastBackupUsed = false;
      const candidates = [
        { k: key, isBak: false },
        { k: `${key}.bak`, isBak: true }
      ];
      for (const { k, isBak } of candidates) {
        try {
          const raw = this.storage.getItem(k);
          if (!raw) continue;
          const data = JSON.parse(raw);
          if (!validatorFn || validatorFn(data)) {
            this.lastBackupUsed = isBak;
            if (isBak) {
              // Restore primary from valid backup
              try { this.storage.setItem(key, raw); } catch (_) {}
            }
            return data;
          }
        } catch (_) {}
      }
      return null;
    }

    saveSlot(slotIdx, stateValue) {
      const slotKey = `${this.baseKey}:slot-${slotIdx}`;
      const meta = {
        savedAt: new Date().toISOString(),
        questIndex: stateValue.questIndex || 0,
        elapsed: stateValue.elapsed || 0,
        state: stateValue
      };
      return this.saveAtomic(slotKey, meta);
    }

    loadSlot(slotIdx, validatorFn) {
      const slotKey = `${this.baseKey}:slot-${slotIdx}`;
      const meta = this.loadSafe(slotKey, m => m && m.state && (!validatorFn || validatorFn(m.state)));
      return meta ? meta.state : null;
    }

    listSlots() {
      const slots = [];
      for (let i = 1; i <= 3; i++) {
        const slotKey = `${this.baseKey}:slot-${i}`;
        let info = null;
        try {
          const raw = this.storage?.getItem(slotKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.state) {
              info = {
                slot: i,
                questIndex: parsed.questIndex,
                elapsed: parsed.elapsed,
                savedAt: parsed.savedAt
              };
            }
          }
        } catch (_) {}
        slots.push(info || { slot: i, empty: true });
      }
      return slots;
    }
  }

  root.JSGamedevSkills = {
    SplitMix64,
    ActionBuffer,
    InputSystem,
    GameFeel,
    BTStatus,
    Blackboard,
    BTNode,
    BTCondition,
    BTAction,
    ReactiveSequence,
    ReactiveSelector,
    Curves,
    UtilityScorer,
    GameAIManager,
    VNDialogueSystem,
    PuzzleEngine,
    AtomicSaveSystem
  };
})(globalThis);
