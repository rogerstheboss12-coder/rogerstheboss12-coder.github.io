/* Live-ops logic (no DOM): Liberty Pass, offers, extra ad placements, cosmetics, Space Race,
 * Executive Orders and the Presidential Library. The engine calls into this module through
 * small hooks (worldMods, costMult, …) so every system stays testable headless. */
(function (root) {
  'use strict';
  var D = root.GameData, L = D.LIVE;
  var DAY = 86400000, WEEK = 7 * DAY;

  function E() { return root.Engine; }
  function now() { return E().now(); }

  // ---------- Helpers ----------
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) { // mulberry32
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function localMidnight(t) { var d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function dayKey(t) { return E().dayKey(t); }
  function nb(wi) { return D.WORLDS[wi].businesses.length; }
  function isMain(wi) { return wi < D.MAIN_WORLDS; }
  function bump(state) { state.live.rev = (state.live.rev || 0) + 1; }

  // ---------- State ----------
  function defaults() {
    return {
      rev: 0,
      seen: {},
      pass: { season: '', xp: 0, premium: false, free: {}, prem: {}, bonus: 0 },
      offers: { shown: {}, active: null, bought: {}, last: 0 },
      ads: { day: '', donation: 0, lastDonation: 0, missionDouble: 0, dailyDouble: 0, reroll: 0, nofill: 0 },
      review: { last: 0, n: 0 },
      cosmetics: { owned: { theme_classic: true }, theme: 'theme_classic', frame: '', look: '' },
      race: { week: '', rp: 0, league: 0, rival: 0, startFrac: 0, wins: 0, pending: null },
      orders: { day: '', offer: [], drafted: false, slots: [], total: 0 },
      cards: {},
      events: { best: {}, runs: {}, setsDone: {} }   // per event id: best tier reached, runs played; finished collections
    };
  }
  function fill(target, def) {
    Object.keys(def).forEach(function (k) {
      if (target[k] === undefined) target[k] = def[k];
      else if (def[k] && typeof def[k] === 'object' && !Array.isArray(def[k]) && typeof target[k] === 'object' && target[k] && Object.keys(def[k]).length) fill(target[k], def[k]);
    });
  }
  function ensure(state) {
    if (!state.live) state.live = defaults();
    else fill(state.live, defaults());
    Object.keys(state.live.events.best).forEach(function (id) { grantEventTheme(state, id); });
    return state.live;
  }

  function unlocked(state, feature) {
    if (!state.tutorial || !state.tutorial.done) return false;
    return state.stats.playtime >= (L.FEATURE_UNLOCK[feature] || 0);
  }

  // ---------- Calendar ----------
  function daysSinceEpoch(t) {
    var d = new Date(t), e = L.SEASON.epoch;
    return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(e[0], e[1], e[2])) / DAY);
  }
  function dateFromEpochDays(n) { var e = L.SEASON.epoch; return new Date(e[0], e[1], e[2] + n).getTime(); }
  function seasonInfo(t) {
    t = t || now();
    var idx = Math.floor(daysSinceEpoch(t) / L.SEASON.days);
    var meta = L.SEASON_NAMES[((idx % L.SEASON_NAMES.length) + L.SEASON_NAMES.length) % L.SEASON_NAMES.length];
    return { index: idx, key: 'S' + idx, start: dateFromEpochDays(idx * L.SEASON.days), end: dateFromEpochDays((idx + 1) * L.SEASON.days), name: meta.name, exclusive: meta.exclusive };
  }
  function weekInfo(t) {
    t = t || now();
    var idx = Math.floor(daysSinceEpoch(t) / 7); // epoch is a Monday
    var start = dateFromEpochDays(idx * 7), end = dateFromEpochDays(idx * 7 + 7);
    return { index: idx, key: 'W' + idx, start: start, end: end, frac: Math.min(1, Math.max(0, (t - start) / (end - start))) };
  }

  // ---------- Rewards ----------
  function mainWorld(state) { return isMain(state.world) ? state.world : 0; }
  function applyReward(state, r, t) {
    t = t || now();
    var out = { lb: 0, cards: [], gain: 0 };
    if (r.lb) { state.lb += r.lb; out.lb += r.lb; }
    if (r.speech) state.speechUntil = Math.min(Math.max(state.speechUntil, t) + r.speech * 3600000, t + 24 * 3600000);
    if (r.rally) state.rallyUntil = Math.max(state.rallyUntil, t) + r.rally * 1000;
    if (r.warp) { var w = mainWorld(state); out.gain = E().simulateAway(state, r.warp, w)[w]; out.world = w; }
    if (r.card) out.cards = grantCards(state, r.card);
    if (r.cosmetic) {
      var id = r.cosmetic === 'season' ? seasonInfo(t).exclusive : r.cosmetic;
      if (state.live.cosmetics.owned[id]) { state.lb += 50; out.lb += 50; } else { state.live.cosmetics.owned[id] = true; out.cosmetic = id; equip(state, id); }
    }
    bump(state);
    return out;
  }
  function mergeOut(a, b) {
    a.lb += b.lb; a.gain += b.gain || 0; a.cards = a.cards.concat(b.cards || []);
    if (b.world != null) a.world = b.world;
    if (b.cosmetic) (a.cosmetics = a.cosmetics || []).push(b.cosmetic);
    return a;
  }

  // ---------- Pass XP & race points ----------
  function award(state, kind, n) {
    var lv = state.live;
    n = n == null ? 1 : n;
    var xp = (L.XP[kind] || 0) * n, rp = 0;
    lv.pass.xp += xp;
    if (unlocked(state, 'race') && lv.race.week) { rp = (L.RP[kind] || 0) * n; lv.race.rp += rp; }
    return { xp: xp, rp: rp };
  }

  // ---------- Liberty Pass ----------
  function passTier(state) { return Math.min(L.SEASON.tiers, Math.floor(state.live.pass.xp / L.SEASON.xpPerTier)); }
  function passBonusReady(state) {
    var extra = state.live.pass.xp - L.SEASON.tiers * L.SEASON.xpPerTier;
    return extra > 0 ? Math.floor(extra / L.SEASON.bonusXp) - state.live.pass.bonus : 0;
  }
  function passClaimable(state) {
    var p = state.live.pass, reached = passTier(state), n = 0;
    for (var k = 0; k < reached; k++) { if (!p.free[k]) n++; if (p.premium && !p.prem[k]) n++; }
    return n + Math.max(0, passBonusReady(state));
  }
  function claimPass(state, t) {
    var p = state.live.pass, reached = passTier(state), out = { lb: 0, cards: [], gain: 0, n: 0 };
    for (var k = 0; k < reached; k++) {
      if (!p.free[k]) { p.free[k] = true; mergeOut(out, applyReward(state, L.passTrack(k, false), t)); out.n++; }
      if (p.premium && !p.prem[k]) { p.prem[k] = true; mergeOut(out, applyReward(state, L.passTrack(k, true), t)); out.n++; }
    }
    var bonus = passBonusReady(state);
    if (bonus > 0) { p.bonus += bonus; state.lb += bonus * L.SEASON.bonusLb; out.lb += bonus * L.SEASON.bonusLb; out.n += bonus; }
    return out;
  }
  function activatePremium(state) { state.live.pass.premium = true; bump(state); }

  // ---------- Offers ----------
  function offerDef(id) { return L.OFFERS.filter(function (o) { return o.id === id; })[0]; }
  function activeOffer(state, t) {
    var a = state.live.offers.active;
    if (!a) return null;
    if ((t || now()) >= a.until || state.live.offers.bought[a.id]) { state.live.offers.active = null; return null; }
    return { def: offerDef(a.id), until: a.until };
  }
  function triggerOffer(state, id, t) {
    t = t || now();
    var of = state.live.offers, def = offerDef(id);
    if (!def || of.active || (of.shown[id] && !def.repeatDays)) return null;
    if (def.repeatDays && of.shown[id] && t - of.shown[id] < def.repeatDays * DAY) return null;
    if (!def.repeatDays && of.last && t - of.last < L.OFFER_GAP_H * 3600000) return null; // space offers out
    of.shown[id] = t; of.last = t;
    of.active = { id: id, until: t + def.hours * 3600000 };
    return def;
  }
  function offerValue(def) { return Math.round((def.lb / def.price) / L.BASE_VALUE * 10) / 10; }
  function onReturn(state, awaySec, t) {
    if (awaySec >= 3 * 86400 && state.stats.playtime > 3600) return triggerOffer(state, 'comeback', t);
    return null;
  }

  // ---------- Extra ad placements ----------
  function adsExtra(state, t) {
    var a = state.live.ads, k = dayKey(t || now());
    if (a.day !== k) { a.day = k; a.donation = 0; a.missionDouble = 0; a.dailyDouble = 0; a.reroll = 0; a.nofill = 0; }
    return a;
  }
  function adLeft(state, key, t) { return L.AD_EXTRA[key].perDay - adsExtra(state, t)[key]; }
  function donationReady(state, t) {
    t = t || now();
    var a = adsExtra(state, t), cfg = L.AD_EXTRA.donation;
    if (a.donation >= cfg.perDay) return { ready: false, left: 0, wait: localMidnight(t) + DAY - t };
    var wait = a.lastDonation ? a.lastDonation + cfg.cooldownH * 3600000 - t : 0;
    return { ready: wait <= 0, left: cfg.perDay - a.donation, wait: Math.max(0, wait) };
  }
  function claimDonation(state, t) {
    t = t || now();
    if (!donationReady(state, t).ready) return null;
    var a = adsExtra(state, t), cfg = L.AD_EXTRA.donation;
    a.donation++; a.lastDonation = t;
    var out = applyReward(state, { warp: cfg.warp, lb: cfg.lb }, t);
    award(state, 'donation');
    return out;
  }
  function useAd(state, key, t) {
    var a = adsExtra(state, t);
    if (a[key] >= L.AD_EXTRA[key].perDay) return false;
    a[key]++;
    return true;
  }

  // When no ad can be loaded, the reward is granted anyway — up to NOFILL_PER_DAY times a day.
  var NOFILL_PER_DAY = 10;
  function noFillGrant(state, t) {
    var a = adsExtra(state, t);
    if (a.nofill >= NOFILL_PER_DAY) return false;
    a.nofill++;
    return true;
  }

  // ---------- Rating prompt ----------
  // Asked only at happy moments, after 2h+ of play, at most every 60 days and 3 times a year (iOS also caps it).
  var REVIEW_MOMENTS = { raceWin: 1, launch: 1, streak7: 1, convention: 1, passTier10: 1 };
  function shouldAskReview(state, moment, t) {
    t = t || now();
    var r = state.live.review;
    if (!REVIEW_MOMENTS[moment] || state.stats.playtime < 7200) return false;
    if (r.last && t - r.last < 60 * DAY) return false;
    if (r.n >= 3 && r.last && t - r.last < 365 * DAY) return false;
    return true;
  }
  function markReviewAsked(state, t) { var r = state.live.review; r.last = t || now(); r.n++; }

  // ---------- Cosmetics ----------
  function cosmetic(id) { return L.COSMETICS.filter(function (c) { return c.id === id; })[0]; }
  function buyCosmetic(state, id) {
    var c = cosmetic(id), cs = state.live.cosmetics;
    if (!c || c.exclusive || cs.owned[id] || state.lb < c.cost) return false;
    state.lb -= c.cost; cs.owned[id] = true;
    equip(state, id);
    return true;
  }
  function equip(state, id) {
    var c = cosmetic(id), cs = state.live.cosmetics;
    if (!c || !cs.owned[id]) return false;
    if (c.kind === 'theme') cs.theme = id;
    else cs[c.kind] = cs[c.kind] === id ? '' : id; // frames and looks toggle off
    return true;
  }

  // ---------- Space Race ----------
  function rivalOf(key) { return hash(key + 'rival') % L.RIVALS.length; }
  function raceTarget(state) {
    var r = state.live.race, lg = L.LEAGUES[r.league], sf = rng(hash(r.week + 'target'))();
    return lg.target * (0.92 + 0.16 * sf) * (1 - r.startFrac);
  }
  function rivalRP(state, t) {
    var r = state.live.race;
    if (!r.week) return 0;
    var wk = weekInfo(t), rnd = rng(hash(r.week + 'curve'));
    var e = 0.8 + 0.3 * rnd();
    var p = r.startFrac >= 1 ? 1 : Math.max(0, Math.min(1, (wk.frac - r.startFrac) / (1 - r.startFrac)));
    if (wk.key !== r.week) p = 1;
    return Math.floor(raceTarget(state) * Math.pow(p, e));
  }
  function startRace(state, t, partial) {
    var r = state.live.race, wk = weekInfo(t);
    r.week = wk.key; r.rp = 0; r.rival = rivalOf(wk.key); r.startFrac = partial ? Math.min(0.85, wk.frac) : 0;
  }
  function settleRace(state, t) {
    var r = state.live.race, rival = rivalRP(state, t), won = r.rp > rival, lg = L.LEAGUES[r.league];
    var before = r.league, reward = won ? lg.win : lg.lose;
    if (won) { r.wins++; r.league = Math.min(L.LEAGUES.length - 1, r.league + 1); }
    else if (r.rp < raceTarget(state) * 0.25) r.league = Math.max(0, r.league - 1);
    r.pending = { won: won, my: r.rp, rival: rival, rivalIdx: r.rival, league: before, leagueAfter: r.league, reward: reward, week: r.week };
    return r.pending;
  }
  function claimRace(state, t) {
    var r = state.live.race, p = r.pending;
    if (!p) return null;
    r.pending = null;
    var out = applyReward(state, p.reward, t);
    if (p.won) state.live.pass.xp += L.RACE_WIN_XP;
    out.won = p.won;
    return out;
  }

  // ---------- Executive Orders ----------
  function orderType(id) { return L.ORDER_TYPES.filter(function (o) { return o.id === id; })[0]; }
  function rollOrder(rnd, avoid) {
    var roll = rnd(), rarity = roll < L.ORDER_RARITY.legendary ? 'legendary' : roll < L.ORDER_RARITY.legendary + L.ORDER_RARITY.rare ? 'rare' : 'common';
    var pool = L.ORDER_TYPES.filter(function (o) { return o.rarity === rarity && avoid.indexOf(o.id) < 0; });
    if (!pool.length) pool = L.ORDER_TYPES.filter(function (o) { return avoid.indexOf(o.id) < 0; });
    var ty = pool[Math.floor(rnd() * pool.length)], card = { type: ty.id };
    if (ty.needsBiz) { card.biz = Math.floor(rnd() * 10); if (ty.penaltyBiz) { card.biz2 = (card.biz + 1 + Math.floor(rnd() * 9)) % 10; } }
    return card;
  }
  function makeOffer(seed) {
    var rnd = rng(seed), out = [], avoid = [];
    for (var k = 0; k < 3; k++) { var c = rollOrder(rnd, avoid); avoid.push(c.type); out.push(c); }
    return out;
  }
  function ordersToday(state, t) {
    var o = state.live.orders, k = dayKey(t || now());
    if (o.day !== k) { o.day = k; o.drafted = false; o.offer = makeOffer(hash(k + ':' + state.created)); }
    return o;
  }
  function orderReady(state, t) { return unlocked(state, 'orders') && !ordersToday(state, t).drafted; }
  function draftOrder(state, k, slot, t) {
    var o = ordersToday(state, t), card = o.offer[k];
    if (o.drafted || !card) return false;
    if (o.slots.length < L.ORDER_SLOTS) o.slots.push(card);
    else if (slot >= 0 && slot < o.slots.length) o.slots[slot] = card;
    else return false;
    o.drafted = true; o.total++;
    award(state, 'order');
    bump(state);
    return true;
  }
  function rerollOrders(state, t) {
    var o = ordersToday(state, t);
    if (o.drafted) return false;
    o.offer = makeOffer(hash(o.day + ':reroll:' + state.created + ':' + (t || now())));
    return true;
  }
  function revokeOrder(state, slot) {
    var o = state.live.orders;
    if (slot < 0 || slot >= o.slots.length) return false;
    o.slots.splice(slot, 1); bump(state);
    return true;
  }
  function tagCounts(slots) {
    var c = { econ: 0, space: 0, liberty: 0 };
    slots.forEach(function (s) { var ty = orderType(s.type); if (ty) c[ty.tag]++; });
    return c;
  }
  function synergy(slots) {
    var c = tagCounts(slots), m = 1, labels = [];
    Object.keys(c).forEach(function (k) {
      if (c[k] >= 5) { m *= L.ORDER_SYNERGY.five; labels.push({ tag: k, n: 5, mult: L.ORDER_SYNERGY.five }); }
      else if (c[k] >= 3) { m *= L.ORDER_SYNERGY.three; labels.push({ tag: k, n: 3, mult: L.ORDER_SYNERGY.three }); }
    });
    if (c.econ && c.space && c.liberty) { m *= L.ORDER_SYNERGY.unity; labels.push({ tag: 'unity', mult: L.ORDER_SYNERGY.unity }); }
    return { mult: m, labels: labels, counts: c };
  }
  // Product of a numeric field across active orders (e.g. 'speechLen').
  function orderField(state, field) {
    var m = 1;
    state.live.orders.slots.forEach(function (s) { var ty = orderType(s.type); if (ty && ty[field]) m *= ty[field]; });
    return m;
  }

  // ---------- Presidential Library ----------
  function cardCount(state, set) {
    var n = 0;
    L.CARDS.forEach(function (c) { if ((!set || c.set === set) && state.live.cards[c.id]) n++; });
    return n;
  }
  var sizeCache = {};
  function setSize(set) { return sizeCache[set] != null ? sizeCache[set] : (sizeCache[set] = L.CARDS.filter(function (c) { return c.set === set; }).length); }
  function cardSet(id) { return L.CARD_SETS.filter(function (x) { return x.id === id; })[0]; }
  // Generic card drops (missions, daily ladder, pass, race) never include event collections.
  function grantCards(state, n, rnd) {
    rnd = rnd || Math.random;
    var got = [];
    for (var k = 0; k < n; k++) {
      var pool = L.CARDS.filter(function (c) {
        if (state.live.cards[c.id] || c.eventSet) return false;
        return c.set === 'landmarks' || state.unlocked[c.world];
      });
      if (!pool.length) pool = L.CARDS.filter(function (c) { return !state.live.cards[c.id] && !c.eventSet; });
      if (!pool.length) { state.lb += 10; continue; }
      var c = pool[Math.floor(rnd() * pool.length)];
      state.live.cards[c.id] = now();
      got.push(c.id);
    }
    if (got.length) bump(state);
    return got;
  }
  // Cards from one event collection. Duplicates become ★10; finishing a set pays a one-time bonus.
  function grantSetCards(state, setId, n, rnd) {
    rnd = rnd || Math.random;
    var out = { ids: [], lb: 0, completed: [] }, ev = state.live.events;
    for (var k = 0; k < n; k++) {
      var pool = L.CARDS.filter(function (c) { return c.set === setId && !state.live.cards[c.id]; });
      if (!pool.length) { state.lb += 10; out.lb += 10; continue; }
      var c = pool[Math.floor(rnd() * pool.length)];
      state.live.cards[c.id] = now();
      out.ids.push(c.id);
    }
    if (out.ids.length && !ev.setsDone[setId] && cardCount(state, setId) === setSize(setId)) {
      ev.setsDone[setId] = now();
      state.lb += D.EVENT_CFG.setCompleteLb; out.lb += D.EVENT_CFG.setCompleteLb; out.completed.push(setId);
    }
    if (out.ids.length) bump(state);
    return out;
  }
  // Applies an event reward (Time Warp on a main world and/or event cards). Returns { lb, gain, world, cards, completed }.
  function eventPrize(state, eventId, prize) {
    var out = { lb: 0, gain: 0, world: null, cards: [], completed: [] };
    if (!prize) return out;
    if (prize.warp) { var w = mainWorld(state); out.gain = E().simulateAway(state, prize.warp, w)[w]; out.world = w; }
    if (prize.card && eventId) {
      var g = grantSetCards(state, E().eventSetId(eventId), prize.card);
      out.cards = g.ids; out.lb += g.lb; out.completed = g.completed;
    }
    return out;
  }
  function noteEventTier(state, eventId, tier) {
    var ev = state.live.events;
    if (!eventId) return;
    if (!(ev.best[eventId] >= tier)) ev.best[eventId] = tier;
    grantEventTheme(state, eventId);
  }
  // The event's theme is earned at its final reward tier (also back-filled for older saves).
  function grantEventTheme(state, eventId) {
    var id = 'theme_ev_' + eventId, cs = state.live.cosmetics;
    if (cs.owned[id] || !(state.live.events.best[eventId] >= D.EVENT_TIERS.length) || !cosmetic(id)) return false;
    cs.owned[id] = true;
    bump(state);
    return true;
  }
  function eventCardsOwned(state) {
    var n = 0;
    L.CARDS.forEach(function (c) { if (c.eventSet && state.live.cards[c.id]) n++; });
    return n;
  }
  function card(id) { return L.CARDS.filter(function (c) { return c.id === id; })[0]; }

  // ---------- Engine hooks ----------
  var modCache = { state: null, rev: -1, day: '', worlds: [] };
  function worldMods(state, wi) {
    var lv = state.live;
    if (!lv) return null;
    var evId = D.WORLDS[D.EVENT_INDEX].eventId;
    if (modCache.state !== state || modCache.rev !== lv.rev || modCache.ev !== evId) { modCache = { state: state, rev: lv.rev, ev: evId, worlds: [] }; }
    if (modCache.worlds[wi]) return modCache.worlds[wi];
    var n = nb(wi), upg = new Array(n).fill(1), spd = new Array(n).fill(1), all = 1;
    if (isMain(wi)) {
      lv.orders.slots.forEach(function (s) {
        var ty = orderType(s.type);
        if (!ty) return;
        if (ty.profitBiz && s.biz < n) upg[s.biz] *= ty.profitBiz;
        if (ty.penaltyBiz && s.biz2 < n) upg[s.biz2] *= ty.penaltyBiz;
        if (ty.profitRange) for (var i = ty.profitRange[0]; i <= ty.profitRange[1] && i < n; i++) upg[i] *= ty.mult;
        if (ty.speedAll) for (var j = 0; j < n; j++) spd[j] *= ty.speedAll;
        if (ty.profitAll) all *= ty.profitAll;
      });
      all *= synergy(lv.orders.slots).mult;
      var set = cardSet('w' + wi), have = cardCount(state, set.id);
      all *= (1 + set.perCard * have) * (have === setSize(set.id) ? set.complete : 1);
      var lmSet = cardSet('landmarks'), lm = cardCount(state, 'landmarks');
      all *= (1 + lmSet.perCard * lm) * (lm === setSize('landmarks') ? lmSet.complete : 1);
      all *= 1 + D.EVENT_CFG.cardBonus * eventCardsOwned(state);
    } else {
      // A finished collection doubles that event's profit whenever it comes back.
      var cs = D.WORLDS[wi].cardSet;
      if (cs && setSize(cs) && cardCount(state, cs) === setSize(cs)) all *= D.EVENT_CFG.setEventMult;
    }
    return (modCache.worlds[wi] = { upg: upg, spd: spd, all: all });
  }
  function costMult(state, wi) { return isMain(wi) && state.live ? orderField(state, 'cost') : 1; }
  function hookField(state, field) { return state.live ? orderField(state, field) : 1; }

  function achCheck(state, a) {
    var lv = state.live;
    if (!lv) return false;
    if (a.kind === 'cards') return cardCount(state) >= a.n;
    if (a.kind === 'raceWins') return lv.race.wins >= a.n;
    if (a.kind === 'orders') return lv.orders.total >= a.n;
    if (a.kind === 'eventsPlayed') return Object.keys(lv.events.best).length >= a.n;
    if (a.kind === 'eventSets') return Object.keys(lv.events.setsDone).length >= a.n;
    if (a.kind === 'eventTop') { var top = D.EVENT_TIERS.length, n = 0; Object.keys(lv.events.best).forEach(function (k) { if (lv.events.best[k] >= top) n++; }); return n >= a.n; }
    return false;
  }

  // ---------- Periodic update ----------
  // Rolls seasons/weeks/days and returns notable events for the UI.
  function update(state, t) {
    t = t || now();
    var lv = ensure(state), ev = [];
    var si = seasonInfo(t);
    if (lv.pass.season !== si.key) {
      var old = lv.pass.season;
      lv.pass = { season: si.key, xp: 0, premium: false, free: {}, prem: {}, bonus: 0 };
      if (old) ev.push({ type: 'season', info: si });
    }
    if (unlocked(state, 'race')) {
      var wk = weekInfo(t);
      if (!lv.race.week) startRace(state, t, true);
      // The rival's pace counts from when the player shows up, so a late start isn't a loss.
      else if (lv.race.week !== wk.key) { ev.push({ type: 'raceResult', result: settleRace(state, t) }); startRace(state, t, true); }
    }
    if (unlocked(state, 'orders')) ordersToday(state, t);
    activeOffer(state, t);
    if (!lv.offers.active && state.tutorial.done) {
      var trig = null;
      if (!lv.offers.shown.starter && state.stats.playtime >= 900) trig = 'starter';
      else if (!lv.offers.shown.moon && state.unlocked[1]) trig = 'moon';
      else if (!lv.offers.shown.galaxy && state.unlocked[2]) trig = 'galaxy';
      if (trig && triggerOffer(state, trig, t)) ev.push({ type: 'offer', id: trig });
    }
    return ev;
  }

  // Applies an IAP product defined in live-data (pass / offers). Returns true if handled.
  function grantProduct(state, p, t) {
    if (p.pass) { activatePremium(state); return true; }
    if (p.offer) {
      state.live.offers.bought[p.offer] = true;
      if (state.live.offers.active && state.live.offers.active.id === p.offer) state.live.offers.active = null;
      if (p.cosmetic) applyReward(state, { cosmetic: p.cosmetic }, t);
      return true;
    }
    return false;
  }

  root.Live = {
    ensure: ensure, defaults: defaults, unlocked: unlocked, hash: hash, rng: rng,
    seasonInfo: seasonInfo, weekInfo: weekInfo, applyReward: applyReward, award: award,
    passTier: passTier, passClaimable: passClaimable, passBonusReady: passBonusReady, claimPass: claimPass, activatePremium: activatePremium,
    offerDef: offerDef, activeOffer: activeOffer, triggerOffer: triggerOffer, offerValue: offerValue, onReturn: onReturn,
    adsExtra: adsExtra, adLeft: adLeft, noFillGrant: noFillGrant, NOFILL_PER_DAY: NOFILL_PER_DAY,
    shouldAskReview: shouldAskReview, markReviewAsked: markReviewAsked, donationReady: donationReady, claimDonation: claimDonation, useAd: useAd,
    cosmetic: cosmetic, buyCosmetic: buyCosmetic, equip: equip,
    raceTarget: raceTarget, rivalRP: rivalRP, startRace: startRace, settleRace: settleRace, claimRace: claimRace,
    orderType: orderType, ordersToday: ordersToday, orderReady: orderReady, draftOrder: draftOrder, rerollOrders: rerollOrders, revokeOrder: revokeOrder,
    synergy: synergy, orderField: orderField, makeOffer: makeOffer,
    card: card, cardCount: cardCount, setSize: setSize, cardSet: cardSet, grantCards: grantCards, grantSetCards: grantSetCards,
    eventPrize: eventPrize, noteEventTier: noteEventTier, grantEventTheme: grantEventTheme, eventCardsOwned: eventCardsOwned,
    worldMods: worldMods, costMult: costMult, hookField: hookField, achCheck: achCheck,
    update: update, grantProduct: grantProduct
  };
})(typeof window !== 'undefined' ? window : globalThis);
