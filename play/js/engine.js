/* Pure game logic — no DOM. Shared by the browser game, tests and tools/sim.js. */
(function (root) {
  'use strict';
  var D = root.GameData;
  var MAX = 1e300;
  var SAVE_VERSION = 3;
  var DAY = 86400000;

  // Clock is injectable so the platform layer can supply server-verified time.
  var clock = function () { return Date.now(); };
  function now() { return clock(); }
  function setClock(fn) { clock = fn; }

  function nb(wi) { return D.WORLDS[wi].businesses.length; }
  // Live-ops hooks (live.js). Each returns a neutral value when that module isn't loaded.
  function LV() { return root.Live; }
  function X() { return root.Extras; }
  // Product of a hook value from Executive Orders (live.js) and Bill of Rights perks (extras.js).
  function field(state, name) {
    return (LV() && state.live ? LV().hookField(state, name) : 1) * (X() && state.extras ? X().field(state, name) : 1);
  }
  function isMain(wi) { return wi < D.MAIN_WORLDS; }

  function newWorldState(w) {
    return {
      cash: w.index === 0 ? 5 : w.businesses[0].cost + 1,
      runEarned: 0,
      lifetime: 0,
      angels: 0,
      angelsSpent: 0,
      elections: 0,
      biz: w.businesses.map(function (b, i) {
        return { owned: i === 0 ? 1 : 0, progress: 0, running: false, manager: false, chief: false };
      }),
      upgrades: {},
      angelUpgrades: {},
      launched: false,
      effects: [],        // temporary buffs: { targets: [i…] | 'all', speed, profit, until, kind, label }
      missionsDone: {},
      loopCharges: 1,     // Universe mechanic
      loopClock: 0,
      eventKey: null,     // event world: which 3-day slot + event this state belongs to
      eventId: null,
      eventClaimed: {},
      base: null,         // event world: catches/taps counters when the event started (for missions)
      anchor: null        // Multiverse: { biz, since } — the business anchored across realities
    };
  }

  function newState() {
    return {
      v: SAVE_VERSION,
      created: now(),
      lastSeen: now(),
      maxTime: now(),
      world: 0,
      unlocked: D.WORLDS.map(function (w, wi) { return wi === 0; }),
      lb: 10,
      permMult: 1,
      permBought: 0,
      offlineBought: 0,
      rallyUntil: 0,
      speechUntil: 0,
      badges: 0,
      amendments: 0,
      conventions: 0,
      iap: { founding: false, purchases: {} },
      ads: { day: '', freelb: 0 },
      daily: { streak: 0, lastDay: '', total: 0 },
      achievements: {},
      stats: { clicks: 0, catches: 0, speeches: 0, playtime: 0, missions: 0, treaties: 0, flares: 0, loops: 0, anchors: 0,
        decisions: 0, debatesWon: 0, debatesLost: 0, milestones: 0, elections: 0, bills: 0, hires: 0, eventTiers: 0, weeklyDone: 0, bossKills: 0, podiums: 0 },
      settings: { sfx: true, music: true, buyMode: 1, volume: 0.6, sfxVol: 0.6, musicVol: 0.6, tracks: {}, lang: 'auto', textSize: 'm', colorblind: false, reduceMotion: false,
        haptics: true, notifications: false, quietHours: true, analytics: true, numFormat: 'named', bestBuy: true, tips: true, confirmElect: true },
      seenIntro: {},
      tutorial: { step: 0, done: false },
      worlds: D.WORLDS.map(newWorldState),
      live: LV() ? LV().defaults() : undefined,
      extras: X() ? X().defaults() : undefined
    };
  }

  // ---------- Derived multipliers ----------
  function milestoneMults(owned) {
    var speed = 1, profit = 1;
    for (var i = 0; i < D.MILESTONES.length; i++) {
      var m = D.MILESTONES[i];
      if (owned < m.at) break;
      if (m.speed) speed *= m.speed;
      if (m.profit) profit *= m.profit;
    }
    return { speed: speed, profit: profit };
  }

  function nextMilestone(owned) {
    for (var i = 0; i < D.MILESTONES.length; i++) if (owned < D.MILESTONES[i].at) return D.MILESTONES[i];
    return null;
  }

  function frameTier(owned) {
    var t = D.FRAME_TIERS[0];
    for (var i = 0; i < D.FRAME_TIERS.length; i++) if (owned >= D.FRAME_TIERS[i].at) t = D.FRAME_TIERS[i];
    return t.name;
  }

  function minOwned(ws) {
    var m = Infinity;
    ws.biz.forEach(function (b) { if (b.owned < m) m = b.owned; });
    return m;
  }

  function allMilestoneMult(ws) {
    var lo = minOwned(ws), p = 1;
    for (var i = 0; i < D.ALL_MILESTONES.length; i++) {
      if (lo < D.ALL_MILESTONES[i].at) break;
      p *= D.ALL_MILESTONES[i].profit;
    }
    return p;
  }

  function nextAllMilestone(ws) {
    var lo = minOwned(ws);
    for (var i = 0; i < D.ALL_MILESTONES.length; i++) if (lo < D.ALL_MILESTONES[i].at) return D.ALL_MILESTONES[i];
    return null;
  }

  function angelEffect(state, wi) {
    var w = D.WORLDS[wi], ws = state.worlds[wi], eff = 0.02 + state.amendments * D.CONVENTION.angelPer;
    w.cashUpgrades.forEach(function (u) { if (u.target === 'angel' && ws.upgrades[u.id]) eff += u.add; });
    w.angelUpgrades.forEach(function (u) { if (u.target === 'angel' && ws.angelUpgrades[u.id]) eff += u.add; });
    return eff;
  }

  // Global multiplier shared by every world (boosts, purchases, badges, amendments).
  // Paid/purchasable boosts (Freedom Multiplier, Founding Pack, Mega Rally) skip the
  // rotating events so they stay a level playing field.
  function boostMult(state, t, wi) {
    t = t || now();
    var fair = wi != null && !isMain(wi);
    var m = fair ? 1 : state.permMult;
    if (state.iap.founding && !fair) m *= 3;
    if (state.speechUntil > t) m *= 2 * field(state, 'speechBoost');
    if (state.rallyUntil > t && !fair) m *= 10;
    if (X() && state.extras && !fair) m *= X().comebackMult(state, t, wi == null ? 0 : wi);
    m *= 1 + state.badges * D.BADGE_BONUS;
    m *= Math.pow(1 + D.CONVENTION.profitPer, state.amendments);
    return m;
  }

  function tributeMult(state, wi) {
    return isMain(wi) && wi + 1 < D.MAIN_WORLDS && state.unlocked[wi + 1] ? D.TRIBUTE * field(state, 'tribute') : 1;
  }

  function activeEffects(ws, t) {
    t = t || now();
    if (ws.effects.length && ws.effects.some(function (e) { return e.until <= t; })) {
      ws.effects = ws.effects.filter(function (e) { return e.until > t; });
    }
    return ws.effects;
  }

  function worldMults(state, wi, t) {
    t = t || now();
    var w = D.WORLDS[wi], ws = state.worlds[wi], n = nb(wi);
    var upg = new Array(n).fill(1), spd = new Array(n).fill(1), all = 1;
    w.cashUpgrades.forEach(function (u) {
      if (!ws.upgrades[u.id] || !u.mult) return;
      if (u.target === 'all') all *= u.mult; else upg[u.target] *= u.mult;
    });
    w.angelUpgrades.forEach(function (u) {
      if (!ws.angelUpgrades[u.id] || !u.mult) return;
      if (u.target === 'all') all *= u.mult; else upg[u.target] *= u.mult;
    });
    activeEffects(ws, t).forEach(function (e) {
      for (var i = 0; i < n; i++) {
        if (e.targets !== 'all' && e.targets.indexOf(i) < 0) continue;
        if (e.profit) upg[i] *= e.profit;
        if (e.speed) spd[i] *= e.speed;
      }
    });
    if (w.event && w.boost != null && w.boost < n) upg[w.boost] *= 3; // the event's featured business
    if (wi === D.ANCHOR.world && ws.anchor && ws.anchor.biz < n) upg[ws.anchor.biz] *= anchorMult(state, t);
    var lm = LV() && state.live ? LV().worldMods(state, wi) : null;
    if (lm) { for (var k = 0; k < n; k++) { upg[k] *= lm.upg[k]; spd[k] *= lm.spd[k]; } all *= lm.all; }
    if (X() && state.extras && isMain(wi)) all *= X().applyMods(state, wi, upg, spd);
    var angel = 1 + ws.angels * angelEffect(state, wi);
    var global = all * angel * allMilestoneMult(ws) * boostMult(state, t, wi) * tributeMult(state, wi);
    return { upg: upg, spd: spd, global: global, angel: angel };
  }

  function bizStats(state, wi, i, mults) {
    var b = D.WORLDS[wi].businesses[i], bs = state.worlds[wi].biz[i];
    mults = mults || worldMults(state, wi);
    var ms = milestoneMults(bs.owned);
    var time = b.time / ms.speed / mults.spd[i];
    var rev = b.rev * bs.owned * ms.profit * mults.upg[i] * mults.global;
    return { time: time, rev: Math.min(rev, MAX), perSec: Math.min(rev / time, MAX) };
  }

  // mode: false = everything owned, true = managed only, 'active' = managed or currently running
  function incomePerSec(state, wi, mode) {
    var ws = state.worlds[wi], mults = worldMults(state, wi), total = 0;
    for (var i = 0; i < ws.biz.length; i++) {
      var bs = ws.biz[i];
      if (!bs.owned) continue;
      if (mode === true && !bs.manager) continue;
      if (mode === 'active' && !bs.manager && !bs.running) continue;
      total += bizStats(state, wi, i, mults).perSec;
    }
    return Math.min(total, MAX);
  }

  // ---------- Costs ----------
  function unitCostBase(state, wi, i) {
    var m = LV() && state.live ? LV().costMult(state, wi) : 1;
    if (X() && state.extras) m *= X().bizCost(state, wi, i);
    return D.WORLDS[wi].businesses[i].cost * (state.worlds[wi].biz[i].chief ? 0.1 : 1) * m;
  }

  function costFor(state, wi, i, n) {
    var b = D.WORLDS[wi].businesses[i], k = state.worlds[wi].biz[i].owned;
    var r = b.coef;
    return unitCostBase(state, wi, i) * Math.pow(r, k) * (Math.pow(r, n) - 1) / (r - 1);
  }

  function maxAffordable(state, wi, i) {
    var b = D.WORLDS[wi].businesses[i], ws = state.worlds[wi], k = ws.biz[i].owned;
    var c0 = unitCostBase(state, wi, i), r = b.coef;
    var n = Math.floor(Math.log(ws.cash * (r - 1) / (c0 * Math.pow(r, k)) + 1) / Math.log(r));
    if (!isFinite(n) || n < 0) n = 0;
    while (n > 0 && costFor(state, wi, i, n) > ws.cash) n--;
    return n;
  }

  function buyQty(state, wi, i, mode) {
    var bs = state.worlds[wi].biz[i];
    if (mode === 'max') return Math.max(1, maxAffordable(state, wi, i));
    if (mode === 'next') { var m = nextMilestone(bs.owned); return m ? m.at - bs.owned : 1; }
    return mode;
  }

  function buy(state, wi, i, n) {
    var ws = state.worlds[wi];
    if (!(n > 0)) return false;
    var c = costFor(state, wi, i, n);
    if (c > ws.cash) return false;
    ws.cash -= c;
    var before = ws.biz[i].owned;
    ws.biz[i].owned += n;
    for (var k = 0; k < D.MILESTONES.length && D.MILESTONES[k].at <= ws.biz[i].owned; k++) if (D.MILESTONES[k].at > before) state.stats.milestones++;
    return { before: before, after: ws.biz[i].owned };
  }

  function hireManager(state, wi, i) {
    var ws = state.worlds[wi], b = D.WORLDS[wi].businesses[i];
    if (ws.biz[i].manager || !ws.biz[i].owned || ws.cash < b.managerCost) return false;
    ws.cash -= b.managerCost; ws.biz[i].manager = true;
    state.stats.hires++;
    return true;
  }

  function hireChief(state, wi, i) {
    var ws = state.worlds[wi], b = D.WORLDS[wi].businesses[i];
    if (!ws.biz[i].manager || ws.biz[i].chief || ws.cash < b.chiefCost) return false;
    ws.cash -= b.chiefCost; ws.biz[i].chief = true;
    return true;
  }

  function findUpgrade(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  // Cash-upgrade price after the Pork Barrel perk (main worlds only).
  function upgradeCost(state, wi, u) { return isMain(wi) ? u.cost * field(state, 'billCost') : u.cost; }
  function buyUpgrade(state, wi, id) {
    var ws = state.worlds[wi], u = findUpgrade(D.WORLDS[wi].cashUpgrades, id), c = u && upgradeCost(state, wi, u);
    if (!u || ws.upgrades[id] || ws.cash < c) return false;
    ws.cash -= c; ws.upgrades[id] = true;
    state.stats.bills++;
    return true;
  }

  function buyAngelUpgrade(state, wi, id) {
    var ws = state.worlds[wi], u = findUpgrade(D.WORLDS[wi].angelUpgrades, id);
    if (!u || ws.angelUpgrades[id] || ws.angels < u.cost) return false;
    ws.angels -= u.cost; ws.angelsSpent += u.cost; ws.angelUpgrades[id] = true;
    if (u.free) ws.biz[u.target].owned += u.free;
    return true;
  }

  // ---------- Prestige ----------
  function totalAngelsFor(state, wi) {
    var ws = state.worlds[wi], w = D.WORLDS[wi];
    if (!isFinite(w.prestigeScale)) return 0;
    return Math.floor(150 * Math.sqrt(ws.lifetime / w.prestigeScale) * (isMain(wi) ? field(state, 'prestigeGain') : 1));
  }

  function claimableAngels(state, wi) {
    var ws = state.worlds[wi];
    return Math.max(0, totalAngelsFor(state, wi) - ws.angels - ws.angelsSpent);
  }

  function resetWorld(state, wi, keep) {
    var w = D.WORLDS[wi], old = state.worlds[wi], fresh = newWorldState(w);
    fresh.missionsDone = old.missionsDone;
    fresh.loopCharges = old.loopCharges; fresh.loopClock = old.loopClock;
    if (keep) {
      fresh.lifetime = old.lifetime;
      fresh.angels = old.angels;
      fresh.angelsSpent = old.angelsSpent;
      fresh.angelUpgrades = old.angelUpgrades;
      fresh.elections = old.elections;
      fresh.launched = old.launched;
      fresh.anchor = old.anchor;
      w.angelUpgrades.forEach(function (u) { if (fresh.angelUpgrades[u.id] && u.free) fresh.biz[u.target].owned += u.free; });
    }
    if (X() && state.extras) X().onReset(state, wi, fresh, keep);
    state.worlds[wi] = fresh;
    return fresh;
  }

  function holdElection(state, wi) {
    var gain = claimableAngels(state, wi);
    if (gain <= 0) return 0;
    var fresh = resetWorld(state, wi, true);
    fresh.angels += gain;
    fresh.elections += 1;
    state.stats.elections++;
    return gain;
  }

  function launchNext(state, wi) {
    var w = D.WORLDS[wi], ws = state.worlds[wi];
    if (!w.next || state.unlocked[wi + 1] || ws.cash < w.next.cost) return false;
    ws.cash -= w.next.cost; ws.launched = true;
    state.unlocked[wi + 1] = true;
    return true;
  }

  // ---------- Constitutional Convention (second prestige) ----------
  function conventionScore(state) {
    var s = 0;
    for (var wi = 0; wi < D.MAIN_WORLDS; wi++) s += Math.log10(1 + state.worlds[wi].lifetime);
    return s;
  }
  function totalAmendmentsFor(state) {
    return Math.floor(Math.pow(conventionScore(state) / D.CONVENTION.scoreDiv, 2));
  }
  function claimableAmendments(state) {
    if (!state.unlocked[D.CONVENTION.requires]) return 0;
    return Math.max(0, totalAmendmentsFor(state) - state.amendments);
  }
  function holdConvention(state) {
    var gain = claimableAmendments(state);
    if (gain <= 0) return 0;
    // Resets every main world completely (including prestige currency and lifetime).
    // Worlds stay unlocked; further amendments require out-earning the previous score.
    for (var wi = 0; wi < D.MAIN_WORLDS; wi++) resetWorld(state, wi, false);
    state.amendments += gain;
    state.conventions++;
    if (X() && state.extras) X().onConvention(state);
    if (state.world >= D.MAIN_WORLDS) state.world = 0;
    return gain;
  }

  // ---------- Earning ----------
  function earn(state, wi, amount) {
    var ws = state.worlds[wi];
    if (!(amount > 0)) return;
    ws.cash = Math.min(MAX, ws.cash + amount);
    ws.runEarned = Math.min(MAX, ws.runEarned + amount);
    ws.lifetime = Math.min(MAX, ws.lifetime + amount);
  }

  function startRun(state, wi, i) {
    var bs = state.worlds[wi].biz[i];
    if (!bs.owned || bs.running || bs.manager) return false;
    bs.running = true; bs.progress = 0;
    return true;
  }

  function tickWorld(state, wi, dt, t) {
    if (!state.unlocked[wi]) return null;
    var ws = state.worlds[wi], mults = worldMults(state, wi, t), paid = null;
    for (var i = 0; i < ws.biz.length; i++) {
      var bs = ws.biz[i];
      if (!bs.owned) continue;
      if (bs.manager) bs.running = true;
      if (!bs.running) continue;
      var st = bizStats(state, wi, i, mults);
      bs.progress += dt / st.time;
      if (bs.progress >= 1) {
        var cycles = bs.manager ? Math.floor(bs.progress) : 1;
        earn(state, wi, st.rev * cycles);
        bs.progress = bs.manager ? bs.progress - cycles : 0;
        if (!bs.manager) bs.running = false;
        (paid = paid || []).push(i);
      }
    }
    return paid;
  }

  function tick(state, dt, t) {
    t = t || now();
    var out = [];
    updateEvent(state, t);
    chargeLoops(state, t);
    for (var wi = 0; wi < state.worlds.length; wi++) out.push(tickWorld(state, wi, dt, t));
    if (X() && state.extras) X().accrue(state, dt);
    state.stats.playtime += dt;
    if (t > state.maxTime) state.maxTime = t;
    return out;
  }

  // Offline earnings are uncapped once the clock is verified; unverifiable clocks get UNVERIFIED_CAP.
  var UNVERIFIED_CAP = 8 * 3600;

  // Credits managed earnings for `seconds` without simulating individual cycles. `mult` scales the payout (Night Session).
  function simulateAway(state, seconds, onlyWorld, allBusinesses, mult) {
    var gains = [];
    for (var wi = 0; wi < state.worlds.length; wi++) {
      if (!state.unlocked[wi] || (onlyWorld != null && wi !== onlyWorld)) { gains.push(0); continue; }
      var ws = state.worlds[wi];
      var g = incomePerSec(state, wi, allBusinesses ? false : true) * seconds;
      if (!allBusinesses) {
        var mults = worldMults(state, wi);
        ws.biz.forEach(function (bs, i) {
          if (!bs.manager && bs.running) {
            var st = bizStats(state, wi, i, mults);
            if ((1 - bs.progress) * st.time <= seconds) { g += st.rev; bs.running = false; bs.progress = 0; }
            else bs.progress += seconds / st.time;
          }
        });
      }
      if (mult > 0) g *= mult;
      earn(state, wi, g);
      gains.push(g);
    }
    return gains;
  }

  // ---------- Clock safety ----------
  // Returns { credit: seconds to grant, rollback: bool }. `verified` = time came from a server.
  function offlineCredit(state, t, verified) {
    var away = (t - state.lastSeen) / 1000;
    if (t < state.maxTime - 5 * 60 * 1000) return { credit: 0, away: 0, rollback: true };
    if (away <= 0) return { credit: 0, away: 0, rollback: false };
    if (verified) return { credit: away, away: away, rollback: false, capped: false };
    return { credit: Math.min(away, UNVERIFIED_CAP), away: away, rollback: false, capped: away > UNVERIFIED_CAP };
  }

  // ---------- World mechanics ----------
  function addEffect(ws, e) { ws.effects.push(e); }

  function spawnFlare(state, t, rnd) {
    var ws = state.worlds[1], owned = [];
    ws.biz.forEach(function (b, i) { if (b.owned) owned.push(i); });
    if (!owned.length) return null;
    var i = owned[Math.floor((rnd || Math.random)() * owned.length)];
    var e = { kind: 'flare', targets: [i], speed: 5 * field(state, 'flareSpeed'), until: (t || now()) + 45000 * field(state, 'flareDur') };
    addEffect(ws, e);
    state.stats.flares++;
    return e;
  }
  function extendFlare(state, t) {
    var fl = state.worlds[1].effects.filter(function (e) { return e.kind === 'flare'; })[0];
    if (!fl || fl.extended) return false;
    fl.until += 30000; fl.extended = true;
    return true;
  }

  var TREATY_TYPES = [
    { key: 'low', profit: 4, targets: [0, 1, 2, 3, 4] },
    { key: 'high', profit: 4, targets: [5, 6, 7, 8, 9] },
    { key: 'speed', speed: 2, targets: 'all' },
    { key: 'focus', profit: 12, targets: null },
    { key: 'even', profit: 3, targets: [0, 2, 4, 6, 8] },
    { key: 'odd', profit: 3, targets: [1, 3, 5, 7, 9] }
  ];
  function treatyOffer(rnd) {
    rnd = rnd || Math.random;
    var a = Math.floor(rnd() * TREATY_TYPES.length), b = Math.floor(rnd() * (TREATY_TYPES.length - 1));
    if (b >= a) b++;
    return [a, b].map(function (k) {
      var tt = TREATY_TYPES[k], o = { key: tt.key, profit: tt.profit, speed: tt.speed, targets: tt.targets };
      if (tt.key === 'focus') o.targets = [Math.floor(rnd() * 10)];
      return o;
    });
  }
  function signTreaty(state, offer, t) {
    var ws = state.worlds[2];
    ws.effects = ws.effects.filter(function (e) { return e.kind !== 'treaty'; });
    addEffect(ws, { kind: 'treaty', key: offer.key, targets: offer.targets, profit: offer.profit, speed: offer.speed, until: (t || now()) + 600000 * field(state, 'treatyDur') });
    state.stats.treaties++;
  }

  var LOOP_MS = 15 * 60 * 1000, LOOP_MAX = 3, LOOP_SECONDS = 1800;
  function chargeLoops(state, t) {
    var ws = state.worlds[3];
    if (!state.unlocked[3]) return;
    if (!ws.loopClock) ws.loopClock = t;
    var ms = LOOP_MS / field(state, 'loopRate');
    while (ws.loopCharges < LOOP_MAX && t - ws.loopClock >= ms) { ws.loopCharges++; ws.loopClock += ms; }
    if (ws.loopCharges >= LOOP_MAX) ws.loopClock = t;
  }
  function loopProgress(state, t) {
    var ws = state.worlds[3];
    if (ws.loopCharges >= LOOP_MAX) return 1;
    return Math.min(1, ((t || now()) - ws.loopClock) / (LOOP_MS / field(state, 'loopRate')));
  }
  function useLoop(state) {
    var ws = state.worlds[3];
    if (ws.loopCharges <= 0) return 0;
    if (ws.loopCharges === LOOP_MAX) ws.loopClock = now();
    ws.loopCharges--;
    state.stats.loops++;
    return simulateAway(state, LOOP_SECONDS, 3, true)[3];
  }

  // ---------- Reality Anchor (Multiverse) ----------
  // The anchored business's profit grows ×1 every stepMin minutes (smoothly), up to ×max — offline too.
  function anchorMult(state, t) {
    var a = state.worlds[D.ANCHOR.world].anchor;
    if (!a) return 1;
    var mins = Math.max(0, ((t || now()) - a.since) / 60000);
    return Math.min(D.ANCHOR.max * field(state, 'anchorMax'), 1 + mins / D.ANCHOR.stepMin);
  }
  function setAnchor(state, i, t) {
    var ws = state.worlds[D.ANCHOR.world];
    if (!(i >= 0 && i < ws.biz.length) || (ws.anchor && ws.anchor.biz === i)) return false;
    ws.anchor = { biz: i, since: t || now() };
    state.stats.anchors = (state.stats.anchors || 0) + 1;
    return true;
  }

  // ---------- Rotating events (3 days each, back to back; see js/events-data.js) ----------
  function localMidnight(t) { var d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
  var forcedEvent = null; // dev/tests: an event id to run instead of the scheduled one
  function forceEvent(id) { forcedEvent = typeof id === 'string' ? id : null; }
  function eventWindow(t) {
    t = t || now();
    var a = D.Events.eventAt(t), ev = a.event, key = a.key;
    if (forcedEvent && D.Events.eventDef(forcedEvent)) { ev = D.Events.eventDef(forcedEvent); key = 'E' + a.slot + ':' + ev.eventId + ':forced'; }
    return { active: true, start: a.start, end: a.end, key: key, slot: a.slot, event: ev };
  }
  function eventTheme(t) { return eventWindow(t).event; }
  function eventSetId(eventId) { return eventId === 'fest' ? 'fest' : 'ev_' + eventId; }
  function updateEvent(state, t) {
    var ei = D.EVENT_INDEX, win = eventWindow(t), ws = state.worlds[ei];
    if (ws.eventKey !== win.key) {
      // Rewards the player reached but didn't claim are granted automatically when an event ends.
      if (ws.eventKey && ws.eventId) {
        var got = claimEventTiers(state);
        if (got.n) state.eventRecap = { id: ws.eventId, lb: got.lb, badges: got.badges, cards: got.cards, gain: got.gain, world: got.world };
      }
      D.Events.setEvent(win.event.eventId);
      var fresh = newWorldState(D.WORLDS[ei]);
      fresh.eventKey = win.key; fresh.eventId = win.event.eventId;
      fresh.base = { catches: state.stats.catches, clicks: state.stats.clicks };
      state.worlds[ei] = fresh;
    } else if (D.WORLDS[ei].eventId !== ws.eventId) D.Events.setEvent(ws.eventId);
    state.unlocked[ei] = true;
    return win;
  }
  function eventTiersReached(ws) {
    var n = 0;
    D.EVENT_TIERS.forEach(function (tier) { if (ws.lifetime >= tier.at) n++; });
    return n;
  }
  function eventTiersReady(state) {
    var ws = state.worlds[D.EVENT_INDEX];
    return D.EVENT_TIERS.filter(function (tier, k) { return ws.lifetime >= tier.at && !ws.eventClaimed[k]; });
  }
  // Grants every reached, unclaimed tier: ★, Liberty Badges, Time Warps (on a main world) and event cards.
  function claimEventTiers(state) {
    var ws = state.worlds[D.EVENT_INDEX], got = { lb: 0, badges: 0, n: 0, cards: [], gain: 0, world: null, completed: [] };
    D.EVENT_TIERS.forEach(function (tier, k) {
      if (ws.lifetime < tier.at || ws.eventClaimed[k]) return;
      ws.eventClaimed[k] = true; got.n++;
      if (tier.lb) { state.lb += tier.lb; got.lb += tier.lb; }
      if (tier.badge) { state.badges += tier.badge; got.badges += tier.badge; }
      state.stats.eventTiers = (state.stats.eventTiers || 0) + 1;
      if (LV() && state.live) {
        var out = LV().eventPrize(state, ws.eventId, { warp: tier.warp, card: tier.card });
        got.lb += out.lb; got.gain += out.gain; got.cards = got.cards.concat(out.cards); got.completed = got.completed.concat(out.completed);
        if (out.world != null) got.world = out.world;
        LV().noteEventTier(state, ws.eventId, k + 1);
      }
    });
    return got;
  }

  // ---------- Missions ----------
  function missionProgress(state, wi, m) {
    var ws = state.worlds[wi];
    switch (m.kind) {
      case 'own': return ws.biz[m.biz].owned;
      case 'hire': return ws.biz[m.biz].manager ? 1 : 0;
      case 'chief': return ws.biz[m.biz].chief ? 1 : 0;
      case 'income': return incomePerSec(state, wi, false);
      case 'angels': return ws.angels + ws.angelsSpent;
      case 'promises': return Object.keys(ws.angelUpgrades).length;
      case 'upgrades': return Object.keys(ws.upgrades).length;
      case 'earn': return ws.lifetime;
      case 'all': return minOwned(ws);
      case 'elect': return ws.elections;
      case 'catch': return state.stats.catches - (ws.base ? ws.base.catches : state.stats.catches);
      case 'taps': return state.stats.clicks - (ws.base ? ws.base.clicks : state.stats.clicks);
      case 'tier': return eventTiersReached(ws);
    }
    return 0;
  }
  function activeMissions(state, wi) {
    var ws = state.worlds[wi], out = [];
    var list = D.WORLDS[wi].missions;
    for (var k = 0; k < list.length && out.length < 3; k++) if (!ws.missionsDone[list[k].id]) out.push(list[k]);
    return out;
  }
  function missionComplete(state, wi, m) { return missionProgress(state, wi, m) >= m.n; }
  // Returns { lb, prize } where prize (event missions) holds Time Warp / card results, or null.
  function claimMissionFull(state, wi, id) {
    var m = activeMissions(state, wi).filter(function (x) { return x.id === id; })[0];
    if (!m || !missionComplete(state, wi, m)) return null;
    state.worlds[wi].missionsDone[id] = true;
    var reward = Math.round(m.reward * field(state, 'missionLb')) + (X() && state.extras ? X().missionBonus(state) : 0);
    state.lb += reward; state.stats.missions++;
    var prize = m.prize && LV() && state.live ? LV().eventPrize(state, state.worlds[wi].eventId, m.prize) : null;
    return { lb: reward, prize: prize, mission: m };
  }
  function claimMission(state, wi, id) { var r = claimMissionFull(state, wi, id); return r ? r.lb : 0; }
  function claimableMissions(state, wi) {
    if (!D.WORLDS[wi].missions.length) return 0;
    return activeMissions(state, wi).filter(function (m) { return missionComplete(state, wi, m); }).length;
  }

  // ---------- Daily rewards ----------
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function dailyStatus(state, t) {
    t = t || now();
    var today = dayKey(t), yesterday = dayKey(localMidnight(t) - DAY / 2);
    var dl = state.daily;
    var claimable = dl.lastDay !== today;
    var streak = dl.lastDay === yesterday || dl.lastDay === today ? dl.streak : 0;
    var index = claimable ? streak % D.DAILY.length : (streak - 1 + D.DAILY.length) % D.DAILY.length;
    return { claimable: claimable, streak: streak, index: index, today: today };
  }
  function claimDaily(state, t) {
    t = t || now();
    if (t < state.maxTime - 5 * 60 * 1000) return null; // clock rolled back
    var st = dailyStatus(state, t);
    if (!st.claimable) return null;
    var r = D.DAILY[st.index];
    state.daily.streak = st.streak + 1;
    state.daily.lastDay = st.today;
    state.daily.total++;
    if (r.lb) state.lb += r.lb;
    if (r.speech) state.speechUntil = Math.min(Math.max(state.speechUntil, t) + r.speech * 1000, t + 24 * 3600 * 1000);
    if (r.rally) state.rallyUntil = Math.max(state.rallyUntil, t) + r.rally * 1000;
    var gain = 0;
    if (r.warp) gain = simulateAway(state, r.warp, state.world)[state.world];
    var cards = r.card && LV() && state.live ? LV().grantCards(state, r.card) : [];
    return { reward: r, day: st.index + 1, gain: gain, cards: cards };
  }

  // ---------- Achievements ----------
  function checkAchievements(state) {
    var got = [];
    D.ACHIEVEMENTS.forEach(function (a) {
      if (state.achievements[a.id]) return;
      var ok = false, ws = a.world != null ? state.worlds[a.world] : null;
      if (ws && !state.unlocked[a.world]) return;
      switch (a.kind) {
        case 'biz': ok = ws.biz[a.biz].owned >= a.n; break;
        case 'all': ok = minOwned(ws) >= a.n; break;
        case 'life': ok = ws.lifetime >= a.n; break;
        case 'managers': ok = ws.biz.every(function (b) { return b.manager; }); break;
        case 'chiefs': ok = ws.biz.every(function (b) { return b.chief; }); break;
        case 'elections': ok = ws.elections >= a.n; break;
        case 'world': ok = state.unlocked[a.world]; break;
        case 'clicks': ok = state.stats.clicks >= a.n; break;
        case 'catches': ok = state.stats.catches >= a.n; break;
        case 'speeches': ok = state.stats.speeches >= a.n; break;
        case 'daily': ok = state.daily.streak >= a.n; break;
        case 'badges': ok = state.badges >= a.n; break;
        case 'conventions': ok = state.conventions >= a.n; break;
        case 'missions': ok = state.stats.missions >= a.n; break;
        default: ok = (LV() && state.live ? LV().achCheck(state, a) : false) || (X() && state.extras ? X().achCheck(state, a) : false);
      }
      if (ok) { state.achievements[a.id] = now(); state.lb += a.reward; got.push(a); }
    });
    return got;
  }

  // ---------- Store ----------
  function storePrice(state, item) {
    if (item.perm) return item.cost * Math.pow(2, state.permBought);
    return item.cost;
  }
  function storeOwned(state, item) { return !!(item.unlock && X() && state.extras && X().hasUnlock(state, item.unlock)); }

  function buyStore(state, id) {
    var item = D.STORE.filter(function (s) { return s.id === id; })[0];
    if (!item) return false;
    var price = storePrice(state, item);
    if (state.lb < price || storeOwned(state, item)) return false;
    if (item.warp && !isMain(state.world)) return false; // no buying progress in events
    state.lb -= price;
    var t = now(), result = { item: item };
    if (item.warp) result.gain = simulateAway(state, item.warp, state.world)[state.world];
    if (item.rally) state.rallyUntil = Math.max(state.rallyUntil, t) + item.rally * 1000;
    if (item.perm) { state.permMult *= item.perm; state.permBought++; }
    if (item.unlock && X()) X().grantUnlock(state, item.unlock);
    return result;
  }

  // Applies a completed real-money purchase. Idempotent per transaction id.
  function grantIAP(state, productId, transactionId) {
    var p = D.IAP.filter(function (x) { return x.id === productId; })[0];
    if (!p) return null;
    var key = transactionId || productId;
    if (state.iap.purchases[key]) return null;
    if (p.type === 'nonconsumable' && state.iap.founding && p.noAds) { state.iap.purchases[key] = now(); return null; }
    state.iap.purchases[key] = now();
    if (p.lb) state.lb += p.lb;
    if (p.noAds) state.iap.founding = true;
    if (LV() && state.live) LV().grantProduct(state, p, now());
    return p;
  }

  function adsToday(state, t) {
    var k = dayKey(t || now());
    if (state.ads.day !== k) { state.ads.day = k; state.ads.freelb = 0; }
    return state.ads;
  }

  function giveSpeech(state) {
    var t = now();
    var base = Math.max(state.speechUntil, t);
    state.speechUntil = Math.min(base + 4 * 3600 * 1000 * field(state, 'speechLen'), t + 24 * 3600 * 1000);
    state.stats.speeches++;
  }

  // ---------- Save / Load ----------
  function serialize(state) { state.lastSeen = now(); return JSON.stringify(state); }

  function migrate(s) {
    if (!s.v || s.v < 2) {
      // v1 → v2: event world slot, new systems. Defaults are filled by deserialize().
      if (s.unlocked && s.unlocked.length < 5) s.unlocked.push(false);
      s.maxTime = Math.max(s.lastSeen || 0, s.created || 0);
      s.tutorial = { step: 99, done: true }; // existing players skip the new tutorial
    }
    if ((s.v || 1) < 3) {
      // v2 → v3: The Multiverse becomes world 5 (index 4); the rotating event moves to index 5.
      if (Array.isArray(s.worlds)) s.worlds.splice(4, 0, null);
      if (Array.isArray(s.unlocked)) s.unlocked.splice(4, 0, false);
      if (s.world === 4) s.world = 5;
      if (s.seenIntro && s.seenIntro[4]) { delete s.seenIntro[4]; s.seenIntro[5] = true; }
    }
    s.v = SAVE_VERSION;
    return s;
  }

  function fillDefaults(target, defaults) {
    Object.keys(defaults).forEach(function (k) {
      if (target[k] === undefined) target[k] = defaults[k];
      else if (defaults[k] && typeof defaults[k] === 'object' && !Array.isArray(defaults[k]) && typeof target[k] === 'object' && k !== 'achievements' && k !== 'seenIntro') {
        fillDefaults(target[k], defaults[k]);
      }
    });
  }

  function deserialize(str) {
    var s = migrate(JSON.parse(str));
    var base = newState();
    ['v', 'created', 'lastSeen', 'maxTime', 'world', 'lb', 'permMult', 'permBought', 'offlineBought', 'rallyUntil', 'speechUntil',
      'badges', 'amendments', 'conventions', 'iap', 'ads', 'daily', 'achievements', 'stats', 'settings', 'seenIntro', 'tutorial'].forEach(function (k) {
      if (s[k] === undefined) s[k] = base[k];
    });
    if (s.settings && s.settings.sfxVol === undefined && s.settings.volume != null) s.settings.sfxVol = s.settings.musicVol = s.settings.volume;
    fillDefaults(s.settings, base.settings); fillDefaults(s.stats, base.stats); fillDefaults(s.iap, base.iap);
    fillDefaults(s.daily, base.daily); fillDefaults(s.tutorial, base.tutorial); fillDefaults(s.ads, base.ads);
    while (s.unlocked.length < D.WORLDS.length) s.unlocked.push(false);
    if (LV()) LV().ensure(s);
    if (X()) X().ensure(s);
    s.worlds = D.WORLDS.map(function (w, wi) {
      var def = newWorldState(w), got = s.worlds && s.worlds[wi];
      if (!got || !got.biz || got.biz.length !== def.biz.length) return def;
      Object.keys(def).forEach(function (k) { if (got[k] === undefined) got[k] = def[k]; });
      // v1.0 mission ids were list positions ('m0_12'); map them to the stable ids.
      var legacy = D.LEGACY_MISSIONS && D.LEGACY_MISSIONS[wi];
      if (legacy && got.missionsDone) Object.keys(got.missionsDone).forEach(function (id) {
        if (!/^m\d+_\d+$/.test(id)) return;
        if (legacy[id]) got.missionsDone[legacy[id]] = got.missionsDone[id];
        delete got.missionsDone[id];
      });
      return got;
    });
    if (!(s.world >= 0 && s.world < D.WORLDS.length) || !s.unlocked[s.world]) s.world = 0;
    return s;
  }

  // Picks the save with more progress (used to reconcile device vs. cloud).
  function progressScore(s) {
    if (!s) return -1;
    var score = (s.amendments || 0) * 1e6 + (s.stats ? s.stats.playtime : 0);
    return score;
  }

  root.Engine = {
    MAX: MAX, SAVE_VERSION: SAVE_VERSION, LOOP_MAX: LOOP_MAX, LOOP_SECONDS: LOOP_SECONDS,
    now: now, setClock: setClock, newState: newState, newWorldState: newWorldState,
    milestoneMults: milestoneMults, nextMilestone: nextMilestone, frameTier: frameTier,
    nextAllMilestone: nextAllMilestone, minOwned: minOwned, allMilestoneMult: allMilestoneMult,
    angelEffect: angelEffect, boostMult: boostMult, tributeMult: tributeMult, worldMults: worldMults, bizStats: bizStats,
    incomePerSec: incomePerSec, costFor: costFor, maxAffordable: maxAffordable, buyQty: buyQty,
    buy: buy, hireManager: hireManager, hireChief: hireChief, buyUpgrade: buyUpgrade, upgradeCost: upgradeCost, field: field,
    buyAngelUpgrade: buyAngelUpgrade, totalAngelsFor: totalAngelsFor, claimableAngels: claimableAngels,
    holdElection: holdElection, launchNext: launchNext, earn: earn, startRun: startRun,
    conventionScore: conventionScore, claimableAmendments: claimableAmendments, holdConvention: holdConvention,
    tick: tick, tickWorld: tickWorld, simulateAway: simulateAway, UNVERIFIED_CAP: UNVERIFIED_CAP, offlineCredit: offlineCredit,
    activeEffects: activeEffects, spawnFlare: spawnFlare, extendFlare: extendFlare, treatyOffer: treatyOffer, signTreaty: signTreaty,
    chargeLoops: chargeLoops, loopProgress: loopProgress, useLoop: useLoop, anchorMult: anchorMult, setAnchor: setAnchor,
    eventWindow: eventWindow, eventTheme: eventTheme, updateEvent: updateEvent, forceEvent: forceEvent,
    eventTiersReady: eventTiersReady, claimEventTiers: claimEventTiers, eventTiersReached: eventTiersReached, eventSetId: eventSetId,
    missionProgress: missionProgress, activeMissions: activeMissions, missionComplete: missionComplete,
    claimMission: claimMission, claimMissionFull: claimMissionFull, claimableMissions: claimableMissions,
    dayKey: dayKey, dailyStatus: dailyStatus, claimDaily: claimDaily,
    checkAchievements: checkAchievements, storePrice: storePrice, storeOwned: storeOwned, buyStore: buyStore, grantIAP: grantIAP, adsToday: adsToday,
    giveSpeech: giveSpeech, serialize: serialize, deserialize: deserialize, progressScore: progressScore, isMain: isMain
  };
})(typeof window !== 'undefined' ? window : globalThis);
