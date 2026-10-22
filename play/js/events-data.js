/* Rotating events: 30 three-day events that run back to back on a shared calendar.
 * Content lives in js/events-content-*.js (root.EVENT_CONTENT, English + Spanish side by side);
 * this file turns it into playable worlds, schedules them and swaps the active one into
 * GameData.WORLDS[EVENT_INDEX] so the engine can treat the event like any other world. */
(function (root) {
  'use strict';
  var D = root.GameData, CONTENT = root.EVENT_CONTENT || [];
  var DAY = 86400000;
  var EVENT_DAYS = 3;
  var EPOCH = [2026, 0, 5];   // shared with the Liberty Pass calendar (a Monday)

  // Every event shares one economy so pacing is identical; only the content changes.
  // [cost, coef, cycle seconds, payback seconds]
  var ECON = [
    [3, 1.07, 1, 2], [40, 1.12, 4, 4], [500, 1.11, 10, 8], [7000, 1.10, 30, 20], [1e5, 1.09, 90, 60],
    [2e6, 1.08, 300, 200], [4e7, 1.09, 900, 600], [9e8, 1.08, 2700, 1800], [2e10, 1.07, 7200, 5000], [5e11, 1.07, 21600, 14000]
  ];

  // Reward tiers by event earnings. Warps are Time Warps on your current main world.
  // Tuned with `node tools/sim.js 4 72 <profile>`: casual ≈ tier 9, engaged/boosted players reach tier 10.
  var TIERS = [
    { at: 1e5, lb: 5 },
    { at: 1e7, warp: 3600 },
    { at: 1e9, card: 1, lb: 5 },
    { at: 1e11, lb: 15, badge: 1 },
    { at: 1e13, warp: 4 * 3600 },
    { at: 1e15, card: 1, lb: 15 },
    { at: 3e16, lb: 40 },
    { at: 1e18, warp: 12 * 3600, card: 1 },
    { at: 2e19, lb: 80, badge: 1 },
    { at: 5e20, warp: 24 * 3600, card: 2, lb: 100 }
  ];
  var CARDS_PER_EVENT = 6;
  var SET_COMPLETE_LB = 50;     // one-time bonus for finishing an event collection
  var EVENT_CARD_BONUS = 0.01;  // each event card: +1% profit on every main world
  var SET_EVENT_MULT = 2;       // a completed collection doubles that event's profit whenever it returns

  // ---------- Manager faces (procedural, seeded by name) ----------
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  var SKINS = ['a', 'b', 'c', 'd', 'e', 'a', 'b', 'c'];
  var HAIRS = ['short', 'side', 'pomp', 'mop', 'long', 'recede', 'bald', 'swept', 'short', 'long'];
  var HAIR_COLORS = ['#2a1d14', '#4a2f1d', '#6b4a2b', '#8a5a2b', '#c9a86a', '#d9a066', '#b0b0b0', '#e8e8e8', '#1a1a1a', '#a33b1f'];
  var MOUTHS = ['smile', 'grin', 'smirk', 'open', 'smile', 'grin'];
  var FACES = {};
  // look: 'hat', 'hat|prop' or '|prop'; hat may be any portrait hat, prop an emoji badge.
  function makeFace(key, name, look, accent) {
    var h = hash(name), bit = function (n, m) { return Math.floor(h / Math.pow(m, n)) % m; };
    var parts = (look || '').split('|'), hair = HAIRS[bit(1, 10)];
    var f = {
      skin: SKINS[bit(0, 8)], hair: hair, hairColor: HAIR_COLORS[bit(2, 10)], mouth: MOUTHS[bit(3, 6)],
      suit: accent, tie: ['#ffffff', '#f5c518', '#1a1a1a', '#c8102e'][bit(4, 4)], noPin: true
    };
    if (hair === 'long' && bit(5, 2)) f.lashes = true;
    if (hair !== 'long') {
      var fx = bit(6, 7);
      if (fx === 1) f.stache = 'walrus';
      else if (fx === 2) f.beard = 'full';
      else if (fx === 3) f.beard = 'goat';
      else if (fx === 4) f.stache = 'handlebar';
    }
    if (bit(7, 5) === 0) f.glasses = 'round';
    if (bit(8, 4) === 0) f.bowtie = true;
    if (parts[0]) f.hat = parts[0];
    if (f.hat === 'crown') f.gold = true;
    if (parts[1]) f.prop = parts[1];
    FACES[key] = f;
    return key;
  }

  // ---------- Build playable worlds from content ----------
  var ES = {};
  function es(pair) { if (pair && pair[1]) ES[pair[0]] = pair[1]; return pair ? pair[0] : ''; }

  var BIZ_EMOJI_PNG = { fest: ['assets/icons/ev_b1.png', 'assets/icons/ev_b2.png', 'assets/icons/ev_b3.png', 'assets/icons/ev_b4.png', 'assets/icons/ev_b5.png', 'assets/icons/ev_b6.png'] };

  function build(c, k) {
    var ev = {
      id: 'event', event: true, eventId: c.id, order: k, cat: c.cat, emoji: c.emoji,
      name: es(c.name), title: es(c.title), currency: es(c.currency), sym: c.sym, accent: c.accent,
      bg: c.bgImg || null, bgCss: 'radial-gradient(ellipse at 50% 18%, ' + c.bg[2] + ' 0%, ' + c.bg[1] + ' 38%, ' + c.bg[0] + ' 100%)',
      prestigeName: '', prestigeShort: '', prestigeVerb: '', prestigeScale: Infinity, mechanic: null,
      eventCatcher: c.catcher === 'eagle' ? 'eagle' : 'emoji:' + c.catcher, theme: c.music || 'fest',
      intro: es(c.intro), boost: c.boost, pins: c.pins || [], window: c.window || null, yearRound: !!c.yearRound,
      next: null, news: c.news.map(es)
    };
    ev.businesses = c.biz.map(function (b, i) {
      var e = ECON[i];
      var biz = { name: es([b[1], b[2]]), flavor: es([b[3], b[4]]), emoji: b[0], cost: e[0], coef: e[1], time: e[2], rev: (e[0] / e[3]) * e[2] };
      var png = BIZ_EMOJI_PNG[c.id] && BIZ_EMOJI_PNG[c.id][i];
      biz.icon = png || null;
      biz.managerCost = biz.cost * D.MANAGER_RATIO[i];
      biz.chiefCost = biz.managerCost * 1e8;
      return biz;
    });
    ev.managers = c.mgr.map(function (m, i) {
      var face = m[3] && m[3].charAt(0) === '@' ? m[3].slice(1) : makeFace('ev_' + c.id + '_' + i, m[0], m[3], c.accent);
      return { name: m[0], title: es([m[1], m[2]]), face: face, cost: ev.businesses[i].managerCost };
    });
    ev.cardSet = c.id === 'fest' ? 'fest' : 'ev_' + c.id;
    ev.cards = c.id === 'fest' ? [] : c.cards.map(function (x, j) {
      return { id: 'ev_' + c.id + '_' + j, set: ev.cardSet, event: c.id, emoji: x[0], name: es([x[1], x[2]]), accent: c.accent };
    });
    ev.cashUpgrades = D.buildCashUpgrades(ev, D.EVENT_INDEX);
    ev.angelUpgrades = [];
    ev.missions = eventMissions(ev);
    return ev;
  }

  // ---------- Event missions (sequential, 3 active at a time) ----------
  // Every 8th mission pays an event card and every 8th (offset) a Time Warp; the rest pay ★.
  function eventMissions(ev) {
    var list = [];
    ev.businesses.forEach(function (b, i) {
      [10, 25, 50, 100].forEach(function (n) { list.push({ kind: 'own', biz: i, n: n, est: b.cost * Math.pow(b.coef, n) / (b.coef - 1) / 10 }); });
      list.push({ kind: 'hire', biz: i, n: 1, est: b.managerCost * 2 });
    });
    [5, 15, 30].forEach(function (n) { var u = ev.cashUpgrades[n - 1]; list.push({ kind: 'upgrades', n: n, est: u.cost * 2 }); });
    [1e4, 1e7, 1e10, 1e13, 1e16, 1e19].forEach(function (n) { list.push({ kind: 'earn', n: n, est: n }); });
    [10, 25, 50].forEach(function (n) { var w = ev.businesses[9]; list.push({ kind: 'all', n: n, est: w.cost * Math.pow(w.coef, n) / (w.coef - 1) }); });
    [[1, 2e3], [3, 1e7], [6, 1e12]].forEach(function (x) { list.push({ kind: 'catch', n: x[0], est: x[1] }); });
    [[25, 50], [150, 5e5]].forEach(function (x) { list.push({ kind: 'taps', n: x[0], est: x[1] }); });
    [[3, 2e9], [6, 2e15], [9, 4e19]].forEach(function (x) { list.push({ kind: 'tier', n: x[0], est: x[1] }); });
    list.sort(function (x, y) { return x.est - y.est; });
    list.forEach(function (m, k) {
      m.id = 'm4_' + ev.eventId + '_' + k;
      m.reward = 1 + Math.floor(k / 12);
      if (k % 8 === 7) m.prize = { card: 1 };
      else if (k % 8 === 3) m.prize = { warp: Math.min(3600, 900 * (1 + Math.floor(k / 16))) };
    });
    return list;
  }

  var EVENTS = CONTENT.map(build);
  var BY_ID = {};
  EVENTS.forEach(function (e) { BY_ID[e.eventId] = e; });

  // ---------- Calendar ----------
  function epochMs() { return new Date(EPOCH[0], EPOCH[1], EPOCH[2]).getTime(); }
  function dayIndex(t) {
    var d = new Date(t);
    return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(EPOCH[0], EPOCH[1], EPOCH[2])) / DAY);
  }
  function dateOfDay(n) { return new Date(EPOCH[0], EPOCH[1], EPOCH[2] + n); }
  function slotOf(t) { return Math.floor(dayIndex(t) / EVENT_DAYS); }
  function slotStart(s) { return dateOfDay(s * EVENT_DAYS).getTime(); }
  function mmdd(d) { return (d.getMonth() + 1) * 100 + d.getDate(); }
  function parseMD(s) { var p = s.split('-'); return +p[0] * 100 + +p[1]; }
  function inWindow(win, md) {
    var a = parseMD(win[0]), b = parseMD(win[1]);
    return a <= b ? md >= a && md <= b : md >= a || md <= b;
  }

  var MIN_GAP = 15;     // an event won't repeat within 15 slots (45 days) unless nothing else fits
  var PIN_GUARD = 8;    // …nor run within 8 slots of its pinned holiday date
  var SEASON_GAP = 7;   // in-season events get priority, at most every 7 slots (21 days)
  var pinCache = null, sched = [], lastUsed = {};
  function pins() {
    if (pinCache) return pinCache;
    pinCache = {};
    for (var y = EPOCH[0]; y <= EPOCH[0] + 12; y++) {
      EVENTS.forEach(function (e, k) {
        e.pins.forEach(function (p) {
          var s = slotOf(new Date(y, (parseMD(p) / 100 | 0) - 1, parseMD(p) % 100, 12).getTime());
          if (s >= 0 && pinCache[s] == null) pinCache[s] = k;
        });
      });
    }
    return pinCache;
  }
  function pinnedNear(k, s) {
    var pc = pins();
    for (var d = -PIN_GUARD; d <= PIN_GUARD; d++) if (pc[s + d] === k) return true;
    return false;
  }
  function pickFor(s) {
    var pc = pins();
    if (pc[s] != null) return pc[s];
    var md = mmdd(new Date(slotStart(s) + DAY * 1.5));
    var best = -1, bestUsed = Infinity, fallback = -1, fbUsed = Infinity;
    EVENTS.forEach(function (e, k) {
      if (!e.window || !inWindow(e.window, md) || pinnedNear(k, s)) return;
      var used = lastUsed[k] == null ? -1e9 + k : lastUsed[k];
      if (s - used >= SEASON_GAP && used < bestUsed) { bestUsed = used; best = k; }
    });
    if (best >= 0) return best;
    EVENTS.forEach(function (e, k) {
      if (e.window ? !inWindow(e.window, md) : e.pins.length && !e.yearRound) return;
      if (pinnedNear(k, s)) return;
      var used = lastUsed[k] == null ? -1e9 + k : lastUsed[k];
      if (used < fbUsed) { fbUsed = used; fallback = k; }
      if (s - used < MIN_GAP) return;
      if (used < bestUsed) { bestUsed = used; best = k; }
    });
    return best >= 0 ? best : fallback >= 0 ? fallback : s % EVENTS.length;
  }
  function scheduleIndex(s) {
    if (s < 0) s = 0;
    while (sched.length <= s) {
      var n = sched.length, k = pickFor(n);
      sched.push(k); lastUsed[k] = n;
    }
    return sched[s];
  }
  function slotInfo(s) {
    var k = scheduleIndex(s);
    return { slot: s, key: 'E' + s + ':' + EVENTS[k].eventId, event: EVENTS[k], start: slotStart(s), end: slotStart(s + 1) };
  }
  function eventAt(t) { return slotInfo(Math.max(0, slotOf(t))); }
  function upcoming(t, n) {
    var s = Math.max(0, slotOf(t)), out = [];
    for (var i = 1; i <= n; i++) out.push(slotInfo(s + i));
    return out;
  }

  // ---------- Swap the active event into the world slot ----------
  var SWAP = ['eventId', 'order', 'cat', 'emoji', 'name', 'title', 'currency', 'sym', 'accent', 'bg', 'bgCss', 'eventCatcher', 'theme', 'intro',
    'boost', 'businesses', 'managers', 'cashUpgrades', 'angelUpgrades', 'missions', 'cardSet', 'cards'];
  function setEvent(id) {
    var ev = BY_ID[id] || EVENTS[0], w = D.WORLDS[D.EVENT_INDEX];
    if (!ev || w.eventId === ev.eventId) return w;
    SWAP.forEach(function (k) { w[k] = ev[k]; });
    w.index = D.EVENT_INDEX;
    D.NEWS[D.EVENT_INDEX] = ev.news;
    return w;
  }
  function eventDef(id) { return BY_ID[id] || null; }

  if (EVENTS.length) setEvent(eventAt(Date.now()).event.eventId);

  // Spanish strings for all event content.
  if (root.I18N) root.I18N.register('es', ES);

  D.EVENTS = EVENTS;
  D.EVENT_FACES = FACES;
  D.EVENT_TIERS = TIERS;
  D.EVENT_CFG = {
    days: EVENT_DAYS, epoch: EPOCH, cardsPerEvent: CARDS_PER_EVENT, setCompleteLb: SET_COMPLETE_LB,
    cardBonus: EVENT_CARD_BONUS, setEventMult: SET_EVENT_MULT, econ: ECON
  };
  D.Events = {
    eventAt: eventAt, slotInfo: slotInfo, slotOf: slotOf, upcoming: upcoming, setEvent: setEvent, eventDef: eventDef,
    scheduleIndex: scheduleIndex, epochMs: epochMs, ES: ES
  };
})(typeof window !== 'undefined' ? window : globalThis);
