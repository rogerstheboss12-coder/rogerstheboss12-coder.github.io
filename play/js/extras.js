/* v1.1 systems logic (no DOM): Bill of Rights perks, Cabinet seniority perks, Chief of Staff
 * auto-buy, comeback bonus, Town Hall decisions, Debates, weekly goals, the weekly Showdown,
 * league boards (settlement; rivals/network live in leagues.js) and the Codex.
 * The engine calls in through small hooks (field, worldMods, bizCost, onReset, …). */
(function (root) {
  'use strict';
  var D = root.GameData, X = D.EXTRAS;
  var DAY = 86400000;

  function E() { return root.Engine; }
  function LV() { return root.Live; }
  function LG() { return root.Leagues; }
  function now() { return E().now(); }
  function isMain(wi) { return wi < D.MAIN_WORLDS; }
  function bump(state) { state.extras.rev = (state.extras.rev || 0) + 1; }

  // ---------- State ----------
  function defaults() {
    return {
      rev: 0,
      perks: {},
      sen: {},                                   // 'wi_i' → { s: seconds as Secretary, p: [choice per tier, -1 = none] }
      auto: { owned: false, hire: {}, bills: {} },
      comeback: { until: 0, n: 0 },
      debate: { level: 0, next: 0, active: null, result: null, wins: 0 },
      weekly: { week: '', goals: [], base: {}, claimed: {}, bonus: false },
      showdown: { key: '', dmg: 0, claimed: {} },
      league: { id: '', name: '', boards: {} },
      codex: {}, codexSeen: 0,
      recap: null
    };
  }
  var STAT_DEFAULTS = { decisions: 0, debatesWon: 0, debatesLost: 0, milestones: 0, elections: 0, bills: 0, hires: 0, eventTiers: 0,
    weeklyDone: 0, bossKills: 0, podiums: 0 };
  function fill(target, def) {
    Object.keys(def).forEach(function (k) {
      if (target[k] === undefined) target[k] = def[k];
      else if (def[k] && typeof def[k] === 'object' && !Array.isArray(def[k]) && target[k] && typeof target[k] === 'object' && Object.keys(def[k]).length) fill(target[k], def[k]);
    });
  }
  function ensure(state) {
    if (!state.extras) state.extras = defaults();
    else fill(state.extras, defaults());
    state.stats = state.stats || {};
    fill(state.stats, STAT_DEFAULTS);
    return state.extras;
  }

  // ---------- Bill of Rights (Amendment perks) ----------
  function perkDef(id) { return X.PERKS.filter(function (p) { return p.id === id; })[0]; }
  function perkLevel(state, id) { return (state.extras && state.extras.perks[id]) || 0; }
  function perkValue(state, id) {
    var lv = perkLevel(state, id), p = perkDef(id);
    return lv && p ? p.levels[lv - 1] : null;
  }
  function perkSpent(state) {
    var n = 0;
    Object.keys(state.extras.perks).forEach(function (id) { var lv = state.extras.perks[id]; n += lv * (lv + 1) / 2; });
    return n;
  }
  function perkPoints(state) { return Math.max(0, (state.amendments || 0) - perkSpent(state)); }
  function perkLevels(state) {
    var n = 0;
    Object.keys(state.extras.perks).forEach(function (id) { n += state.extras.perks[id]; });
    return n;
  }
  function buyPerk(state, id) {
    var p = perkDef(id), lv = perkLevel(state, id);
    if (!p || lv >= p.levels.length || perkPoints(state) < lv + 1) return false;
    state.extras.perks[id] = lv + 1;
    bump(state);
    return true;
  }
  function respecPerks(state) {
    if (!perkSpent(state) || state.lb < X.PERK_RESPEC_LB) return false;
    state.lb -= X.PERK_RESPEC_LB;
    state.extras.perks = {};
    state.extras.respecs = (state.extras.respecs || 0) + 1;
    bump(state);
    return true;
  }

  // Multiplicative hook values used by the engine (1 = no effect).
  function field(state, name) {
    if (!state.extras) return 1;
    var v;
    switch (name) {
      case 'billCost': return perkValue(state, 'pork') || 1;
      case 'offline': return perkValue(state, 'night') || 1;
      case 'prestigeGain': return perkValue(state, 'mandate') || 1;
      case 'speechBoost': v = perkValue(state, 'filibuster'); return v ? v / 2 : 1;
      case 'sky': return perkValue(state, 'skies') || 1;
      case 'skyRate': return perkValue(state, 'skies') ? 1 / Math.sqrt(perkValue(state, 'skies')) : 1;
      case 'debateLen': case 'debateLb': return perkValue(state, 'debate') || 1;
    }
    return 1;
  }
  function missionBonus(state) { return state.extras ? perkValue(state, 'dividend') || 0 : 0; }

  // After an Election (keep = true) or a Convention (keep = false): pre-hire managers and seed businesses.
  function onReset(state, wi, fresh) {
    if (!state.extras || !isMain(wi)) return;
    var cab = perkValue(state, 'cabinet'), hs = perkValue(state, 'headstart');
    for (var i = 0; i < fresh.biz.length; i++) {
      if (cab && i < cab) fresh.biz[i].manager = true;
      if (hs && i < hs) fresh.biz[i].owned = Math.max(fresh.biz[i].owned, 25);
    }
  }
  function onConvention(state) { if (state.extras) { state.extras.sen = {}; bump(state); } }

  // ---------- Cabinet seniority ----------
  function senKey(wi, i) { return wi + '_' + i; }
  function sen(state, wi, i) {
    var k = senKey(wi, i), s = state.extras.sen;
    return s[k] || (s[k] = { s: 0, p: [-1, -1, -1] });
  }
  function senTiers(state, wi, i) {
    var r = state.extras.sen[senKey(wi, i)], n = 0;
    if (!r) return 0;
    X.SENIORITY.tiers.forEach(function (at) { if (r.s >= at) n++; });
    return n;
  }
  function senPickable(state, wi, i) {
    var r = state.extras.sen[senKey(wi, i)], reached = senTiers(state, wi, i);
    if (!r) return 0;
    var n = 0;
    for (var k = 0; k < reached; k++) if (r.p[k] < 0) n++;
    return n;
  }
  function pickSenPerk(state, wi, i, tier, choice) {
    if (!isMain(wi) || !(choice === 0 || choice === 1)) return false;
    var r = sen(state, wi, i);
    if (tier >= senTiers(state, wi, i) || r.p[tier] >= 0) return false;
    r.p[tier] = choice;
    bump(state);
    return true;
  }
  function seniorPerks(state) {
    var n = 0;
    Object.keys(state.extras.sen).forEach(function (k) { state.extras.sen[k].p.forEach(function (c) { if (c >= 0) n++; }); });
    return n;
  }
  // Seconds of Secretary time accrue on every unlocked main world (online ticks and offline returns).
  function accrue(state, seconds) {
    if (!state.extras || !(seconds > 0)) return;
    for (var wi = 0; wi < D.MAIN_WORLDS; wi++) {
      if (!state.unlocked[wi]) continue;
      state.worlds[wi].biz.forEach(function (b, i) { if (b.chief) sen(state, wi, i).s += seconds; });
    }
  }
  function senPickCount(state) {
    var n = 0;
    for (var wi = 0; wi < D.MAIN_WORLDS; wi++) {
      if (!state.unlocked[wi]) continue;
      for (var i = 0; i < state.worlds[wi].biz.length; i++) n += senPickable(state, wi, i);
    }
    return n;
  }

  // Per-world multipliers from perks (Swift Justice + seniority). Cached until state.extras.rev changes.
  var modCache = { state: null, rev: -1, worlds: [] };
  function worldMods(state, wi) {
    var x = state.extras;
    if (!x || !isMain(wi)) return null;
    if (modCache.state !== state || modCache.rev !== x.rev) modCache = { state: state, rev: x.rev, worlds: [] };
    if (modCache.worlds[wi]) return modCache.worlds[wi];
    var ws = state.worlds[wi], n = ws.biz.length, upg = new Array(n).fill(1), spd = new Array(n).fill(1), cost = new Array(n).fill(1), all = 1;
    var sp = perkValue(state, 'speed') || 1;
    for (var i = 0; i < n; i++) {
      spd[i] *= sp;
      var r = x.sen[senKey(wi, i)];
      if (!r) continue;
      r.p.forEach(function (c, tier) {
        if (c < 0) return;
        var ch = X.SENIORITY.choices[tier][c];
        if (ch.key === 'upg') upg[i] *= ch.v;
        else if (ch.key === 'spd') spd[i] *= ch.v;
        else if (ch.key === 'cost') cost[i] *= ch.v;
        else if (ch.key === 'all') all *= ch.v;
      });
    }
    // Seniority perks work while the business has a manager; the cache key covers perks, so hires are checked live.
    return (modCache.worlds[wi] = { upg: upg, spd: spd, cost: cost, all: all, sen: true });
  }
  // Applies the cached mods, masking seniority for businesses without a manager.
  function applyMods(state, wi, upg, spd) {
    var m = worldMods(state, wi);
    if (!m) return 1;
    var ws = state.worlds[wi], sp = perkValue(state, 'speed') || 1, all = 1;
    for (var i = 0; i < upg.length; i++) {
      if (ws.biz[i].manager) { upg[i] *= m.upg[i]; spd[i] *= m.spd[i]; }
      else spd[i] *= sp;
    }
    // "Mentorship" (all +10%) counts only for businesses whose Secretary is still managed.
    Object.keys(state.extras.sen).forEach(function (k) {
      var p = k.split('_');
      if (+p[0] !== wi || !ws.biz[+p[1]] || !ws.biz[+p[1]].manager) return;
      if (state.extras.sen[k].p[2] === 0) all *= X.SENIORITY.choices[2][0].v;
    });
    return all;
  }
  function bizCost(state, wi, i) {
    var m = worldMods(state, wi);
    return m && state.worlds[wi].biz[i].manager ? m.cost[i] : 1;
  }

  // ---------- Chief of Staff (auto-buy) ----------
  function hasUnlock(state, key) { return key === 'auto' && !!(state.extras && state.extras.auto.owned); }
  function grantUnlock(state, key) {
    if (key !== 'auto') return false;
    var a = state.extras.auto;
    a.owned = true;
    for (var wi = 0; wi < D.MAIN_WORLDS; wi++) { if (a.hire[wi] == null) a.hire[wi] = true; if (a.bills[wi] == null) a.bills[wi] = true; }
    return true;
  }
  function setAuto(state, kind, wi, on) {
    var a = state.extras.auto;
    if (!a.owned || !isMain(wi) || (kind !== 'hire' && kind !== 'bills')) return false;
    a[kind][wi] = !!on;
    return true;
  }
  // Buys what the switches allow on one world. Returns { hired, promoted, bills }.
  function autoRun(state, wi) {
    var out = { hired: 0, promoted: 0, bills: 0 }, a = state.extras && state.extras.auto;
    if (!a || !a.owned || !isMain(wi) || !state.unlocked[wi]) return out;
    var w = D.WORLDS[wi], ws = state.worlds[wi];
    if (a.hire[wi]) {
      w.businesses.forEach(function (b, i) {
        if (!ws.biz[i].manager && ws.biz[i].owned && ws.cash >= b.managerCost && E().hireManager(state, wi, i)) out.hired++;
      });
      w.businesses.forEach(function (b, i) {
        // Promotions are expensive; keep a cushion so they don't starve business purchases.
        if (ws.biz[i].manager && !ws.biz[i].chief && ws.cash >= b.chiefCost * 3 && E().hireChief(state, wi, i)) out.promoted++;
      });
    }
    if (a.bills[wi]) {
      for (var k = 0; k < w.cashUpgrades.length; k++) {
        var u = w.cashUpgrades[k];
        if (ws.upgrades[u.id]) continue;
        if (E().upgradeCost(state, wi, u) > ws.cash) break; // sorted by cost
        if (E().buyUpgrade(state, wi, u.id)) out.bills++;
      }
    }
    return out;
  }

  // ---------- Comeback bonus ----------
  function onReturn(state, awaySec, t) {
    var cb = X.COMEBACK;
    if (!state.extras || awaySec < cb.awayDays * 86400 || state.stats.playtime < 1800) return false;
    state.extras.comeback.until = t + cb.hours * 3600000;
    state.extras.comeback.n++;
    return true;
  }
  function comebackMult(state, t, wi) {
    return state.extras && isMain(wi) && state.extras.comeback.until > t ? X.COMEBACK.mult : 1;
  }

  // ---------- Town Hall decisions ----------
  // Returns what happened: { gain, lb, sky, speech, buff } (the UI spawns the sky bonus).
  function decide(state, card, which, t) {
    t = t || now();
    var opt = card && card[which === 1 ? 'b' : 'a'];
    if (!opt) return null;
    var fx = opt[1], out = { gain: 0, lb: 0, sky: !!fx.sky, speech: 0, buff: null };
    var ws = state.worlds[0];
    if (fx.cash) {
      var inc = E().incomePerSec(state, 0, false);
      out.gain = Math.max(inc * fx.cash * 60, ws.cash * 0.04, 50) * E().field(state, 'petition');
      E().earn(state, 0, out.gain);
    }
    if (fx.lb) { state.lb += fx.lb; out.lb = fx.lb; }
    if (fx.speech) {
      state.speechUntil = Math.min(Math.max(state.speechUntil, t) + fx.speech * 60000, t + 24 * 3600000);
      out.speech = fx.speech;
    }
    if (fx.buff) {
      var b = fx.buff;
      ws.effects.push({ kind: 'decision', targets: b.targets, profit: b.profit, speed: b.speed, until: t + b.mins * 60000 * E().field(state, 'treatyDur') });
      out.buff = b;
    }
    state.stats.decisions++;
    return out;
  }

  // ---------- Debates ----------
  function debateUnlocked(state) { return !!(state.tutorial && state.tutorial.done) && state.stats.playtime >= X.DEBATE.unlockPlaytime; }
  function debateReady(state, t) {
    var d = state.extras.debate;
    return debateUnlocked(state) && !d.active && !d.result && (t || now()) >= d.next;
  }
  function debateK(state) { var c = X.DEBATE; return Math.min(c.maxK, c.baseK + c.perLevel * state.extras.debate.level); }
  function debateCandidate(state, t) {
    var d = state.extras.debate, h = LV() ? LV().hash(String(d.level) + ':' + state.created + ':' + Math.floor((t || now()) / 3600000)) : 0;
    return h % X.CANDIDATES.length;
  }
  function startDebate(state, wi, t) {
    t = t || now();
    if (!debateReady(state, t) || !isMain(wi) || !state.unlocked[wi]) return null;
    var secs = X.DEBATE.minutes * 60 * field(state, 'debateLen'), ws = state.worlds[wi];
    var inc = E().incomePerSec(state, wi, false);
    var target = Math.max(inc * secs * debateK(state), D.WORLDS[wi].businesses[1].cost * 20);
    state.extras.debate.active = { wi: wi, c: debateCandidate(state, t), start: t, end: t + secs * 1000, base: ws.lifetime, target: target };
    return state.extras.debate.active;
  }
  function debateProgress(state) {
    var a = state.extras.debate.active;
    return a ? Math.max(0, state.worlds[a.wi].lifetime - a.base) : 0;
  }
  // Settles an active debate once it is won or its time runs out. Returns the result when it settles.
  function updateDebate(state, t) {
    t = t || now();
    var d = state.extras.debate, a = d.active;
    if (!a) return null;
    var got = debateProgress(state), won = got >= a.target;
    if (!won && t < a.end) return null;
    d.active = null;
    d.next = t + X.DEBATE.cooldown * 1000;
    if (won) { d.level++; d.wins++; state.stats.debatesWon++; } else state.stats.debatesLost++;
    var lb = won ? Math.round(X.DEBATE.lb(d.level - 1) * field(state, 'debateLb')) : X.DEBATE.loseLb;
    d.result = { won: won, c: a.c, wi: a.wi, lb: lb, card: won && d.wins % X.DEBATE.cardEvery === 0 ? 1 : 0, got: got, target: a.target, level: d.level };
    return d.result;
  }
  function forfeitDebate(state, t) {
    var a = state.extras.debate.active;
    if (!a) return null;
    a.end = Math.min(a.end, t || now());
    a.target = Infinity;
    return updateDebate(state, t);
  }
  function claimDebate(state) {
    var d = state.extras.debate, r = d.result;
    if (!r) return null;
    d.result = null;
    state.lb += r.lb;
    var cards = r.card && LV() && state.live ? LV().grantCards(state, r.card) : [];
    return { lb: r.lb, cards: cards, won: r.won };
  }

  // ---------- Weekly goals ----------
  function counter(state, stat) { return stat === 'dailies' ? state.daily.total : (state.stats[stat] || 0); }
  function weekKey(t) { return LV() ? LV().weekInfo(t).key : 'W0'; }
  function updateWeekly(state, t) {
    var w = state.extras.weekly, key = weekKey(t);
    if (w.week === key) return false;
    var rnd = LV().rng(LV().hash(key + ':weekly:' + state.created)), pool = X.WEEKLY.pool.slice(), goals = [];
    while (goals.length < X.WEEKLY.perWeek && pool.length) goals.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0].id);
    var base = {};
    X.WEEKLY.pool.forEach(function (g) { base[g.stat] = counter(state, g.stat); });
    state.extras.weekly = { week: key, goals: goals, base: base, claimed: {}, bonus: false };
    return true;
  }
  function goalDef(id) { return X.WEEKLY.pool.filter(function (g) { return g.id === id; })[0]; }
  function goalProgress(state, id) {
    var g = goalDef(id), w = state.extras.weekly;
    return g ? Math.max(0, counter(state, g.stat) - (w.base[g.stat] || 0)) : 0;
  }
  function goalDone(state, id) { var g = goalDef(id); return !!g && goalProgress(state, id) >= g.n; }
  function weeklyClaimable(state) {
    var w = state.extras.weekly, n = 0;
    w.goals.forEach(function (id) { if (goalDone(state, id) && !w.claimed[id]) n++; });
    if (!w.bonus && w.goals.length && w.goals.every(function (id) { return w.claimed[id]; })) n++;
    return n;
  }
  function claimGoal(state, id) {
    var w = state.extras.weekly;
    if (w.goals.indexOf(id) < 0 || w.claimed[id] || !goalDone(state, id)) return null;
    w.claimed[id] = true;
    state.lb += X.WEEKLY.reward.lb;
    if (state.live) state.live.pass.xp += X.WEEKLY.reward.xp;
    state.stats.weeklyDone++;
    return { lb: X.WEEKLY.reward.lb, xp: X.WEEKLY.reward.xp };
  }
  function claimWeeklyBonus(state, t) {
    var w = state.extras.weekly;
    if (w.bonus || !w.goals.length || !w.goals.every(function (id) { return w.claimed[id]; })) return null;
    w.bonus = true;
    var b = X.WEEKLY.bonus;
    return LV() ? LV().applyReward(state, { lb: b.lb, card: b.card, warp: b.warp }, t) : null;
  }

  // ---------- Weekly Showdown ----------
  function showdownInfo(t) {
    t = t || now();
    var wk = LV().weekInfo(t), s = new Date(wk.start);
    s.setDate(s.getDate() + X.SHOWDOWN.weekday);
    var start = s.getTime(), e = new Date(start); e.setDate(e.getDate() + 1);
    var boss = X.SHOWDOWN.bosses[((wk.index % X.SHOWDOWN.bosses.length) + X.SHOWDOWN.bosses.length) % X.SHOWDOWN.bosses.length];
    var nextStart = new Date(start); nextStart.setDate(nextStart.getDate() + 7);
    return { key: 'SD' + wk.index, start: start, end: e.getTime(), active: t >= start && t < e.getTime(), boss: boss, week: wk.index,
      next: t < start ? start : nextStart.getTime() };
  }
  // True when the local event/Showdown period at t is the one Game Center's recurring board is running,
  // so a score never lands on the previous or next board (see GAME_CENTER.periodOffsetMin).
  function gcPeriodMatches(kind, t) {
    var DAY = 86400000, ep = D.EVENT_CFG.epoch, off = (X.GAME_CENTER.periodOffsetMin || 0) * 60000;
    var gcDay = Math.floor((t - Date.UTC(ep[0], ep[1], ep[2]) - off) / DAY);
    if (kind === 'event') return D.Events.slotOf(t) === Math.floor(gcDay / D.EVENT_CFG.days);
    var sd = showdownInfo(t);
    return sd.active && ((gcDay % 7) + 7) % 7 === X.SHOWDOWN.weekday;
  }
  function showdownTiersReady(state) {
    var sd = state.extras.showdown;
    return X.SHOWDOWN.tiers.filter(function (tier, k) { return sd.dmg >= tier.at * X.SHOWDOWN.hp && !sd.claimed[k]; });
  }
  function claimShowdown(state, t) {
    var sd = state.extras.showdown, out = { lb: 0, cards: [], gain: 0, n: 0, world: null, kill: false };
    X.SHOWDOWN.tiers.forEach(function (tier, k) {
      if (sd.dmg < tier.at * X.SHOWDOWN.hp || sd.claimed[k]) return;
      sd.claimed[k] = true; out.n++;
      if (tier.at >= 1) { state.stats.bossKills++; out.kill = true; }
      var r = LV() ? LV().applyReward(state, { lb: tier.lb, card: tier.card, warp: tier.warp }, t) : { lb: 0 };
      out.lb += r.lb || 0; out.cards = out.cards.concat(r.cards || []); out.gain += r.gain || 0;
      if (r.world != null) out.world = r.world;
    });
    return out;
  }
  function updateShowdown(state, t) {
    var info = showdownInfo(t), sd = state.extras.showdown;
    if (!info.active || sd.key === info.key) return info;
    if (sd.key && showdownTiersReady(state).length) {
      var got = claimShowdown(state, t);
      state.extras.recap = { kind: 'showdown', lb: got.lb, cards: got.cards, gain: got.gain, world: got.world };
    }
    state.extras.showdown = { key: info.key, dmg: 0, claimed: {} };
    return info;
  }
  // Called wherever Pass XP is awarded.
  function award(state, kind, n, t) {
    if (!state.extras) return 0;
    var info = showdownInfo(t), sd = state.extras.showdown;
    if (!info.active || sd.key !== info.key) return 0;
    var d = (X.SHOWDOWN.dmg[kind] || 0) * (n == null ? 1 : n);
    sd.dmg += d;
    return d;
  }

  // ---------- League boards (grouped leaderboards) ----------
  // Board keys: 'ev:<event slot key>' (score = event earnings) and 'sd:<showdown key>' (score = damage).
  function leagueIdentity(state, rnd) {
    var lg = state.extras.league;
    rnd = rnd || Math.random;
    if (!lg.id) lg.id = 'p' + Math.floor(rnd() * 36e8).toString(36) + Math.floor(rnd() * 36e8).toString(36) + (state.created || 0).toString(36);
    if (!lg.name && LG()) lg.name = LG().randomName(rnd);
    return lg;
  }
  function rerollName(state, rnd) {
    if (!LG()) return null;
    state.extras.league.name = LG().randomName(rnd || Math.random);
    return state.extras.league.name;
  }
  function boardsNow(state, t) {
    t = t || now();
    var out = [], win = E().eventWindow(t), ev = state.worlds[D.EVENT_INDEX];
    out.push({ key: 'ev:' + win.key, kind: 'ev', start: win.start, end: win.end, score: ev.eventKey === win.key ? ev.lifetime : 0,
      title: win.event.name, emoji: win.event.emoji });
    var sd = showdownInfo(t);
    if (sd.active) out.push({ key: 'sd:' + sd.key, kind: 'sd', start: sd.start, end: sd.end, score: state.extras.showdown.key === sd.key ? state.extras.showdown.dmg : 0,
      title: sd.boss.name, emoji: sd.boss.emoji });
    return out;
  }
  // Remembers the player's latest score on live boards and settles finished ones. Returns newly settled results.
  function updateBoards(state, t) {
    t = t || now();
    var boards = state.extras.league.boards, settled = [];
    boardsNow(state, t).forEach(function (b) {
      var r = boards[b.key] || (boards[b.key] = { kind: b.kind, start: b.start, end: b.end, score: 0, title: b.title, emoji: b.emoji, real: [], result: null, claimed: false });
      if (b.score > r.score) r.score = b.score;
    });
    Object.keys(boards).forEach(function (k) {
      var r = boards[k];
      if (!r.result && t >= r.end) {
        if (r.score > 0) { r.result = settle(state, k, r); settled.push(r); }
        else r.claimed = true; // didn't play: nothing to claim
      }
      if (r.claimed && t - r.end > 14 * DAY) delete boards[k];
    });
    return settled;
  }
  // Standings for a board: the player, cached real players and AI rivals (memoized for a few seconds).
  var stMemo = {};
  function standings(state, key, r, t) {
    var lg = leagueIdentity(state), m = stMemo[key], bucket = Math.floor((t || 0) / 5000);
    if (m && m.bucket === bucket && m.score === r.score && m.real === r.real && m.name === lg.name) return m.st;
    var st = LG().standings({ key: key, kind: r.kind, start: r.start, end: r.end, me: { id: lg.id, name: lg.name, score: r.score }, real: r.real || [], t: t });
    stMemo[key] = { bucket: bucket, score: r.score, real: r.real, name: lg.name, st: st };
    return st;
  }
  function rankReward(rank, size) {
    var list = X.LEAGUE.ranks;
    for (var i = 0; i < list.length; i++) {
      var x = list[i];
      if ((x.top && rank <= x.top) || (x.pct && rank <= Math.ceil(size * x.pct))) return x;
    }
    return list[list.length - 1];
  }
  function settle(state, key, r) {
    var st = standings(state, key, r, r.end), rw = rankReward(st.rank, st.size);
    return { rank: st.rank, size: st.size, lb: rw.lb, card: rw.card || 0 };
  }
  function claimBoard(state, key) {
    var r = state.extras.league.boards[key];
    if (!r || !r.result || r.claimed) return null;
    r.claimed = true;
    state.lb += r.result.lb;
    if (r.result.rank <= 3) state.stats.podiums++;
    var cards = r.result.card && LV() && state.live ? LV().grantCards(state, r.result.card) : [];
    return { lb: r.result.lb, cards: cards, rank: r.result.rank, size: r.result.size, title: r.title, emoji: r.emoji };
  }
  function boardsClaimable(state) {
    var b = state.extras.league.boards;
    return Object.keys(b).filter(function (k) { return b[k].result && !b[k].claimed; });
  }

  // ---------- Codex ----------
  // Entries: 'w<wi>' (world unlocked), 'b<wi>_<i>' (business bought), 'm<wi>_<i>' (manager hired).
  function updateCodex(state, t) {
    var c = state.extras.codex, added = 0;
    for (var wi = 0; wi < D.MAIN_WORLDS; wi++) {
      if (!state.unlocked[wi]) continue;
      if (!c['w' + wi]) { c['w' + wi] = t || 1; added++; }
      state.worlds[wi].biz.forEach(function (b, i) {
        if (b.owned > 0 && !c['b' + wi + '_' + i]) { c['b' + wi + '_' + i] = t || 1; added++; }
        if (b.manager && !c['m' + wi + '_' + i]) { c['m' + wi + '_' + i] = t || 1; added++; }
      });
    }
    return added;
  }
  function codexCount(state) { return Object.keys(state.extras.codex).length; }
  function codexNew(state) { return Math.max(0, codexCount(state) - (state.extras.codexSeen || 0)); }
  function codexMarkSeen(state) { state.extras.codexSeen = codexCount(state); }

  // ---------- Achievements ----------
  function achCheck(state, a) {
    if (!state.extras) return false;
    switch (a.kind) {
      case 'debatesWon': case 'decisions': case 'weeklyDone': case 'bossKills': case 'podiums': return (state.stats[a.kind] || 0) >= a.n;
      case 'perkLevels': return perkLevels(state) >= a.n;
      case 'seniorPerks': return seniorPerks(state) >= a.n;
      case 'codex': return codexCount(state) >= a.n;
    }
    return false;
  }

  // ---------- Periodic update (1 Hz from the game loop; also safe headless) ----------
  function update(state, t) {
    t = t || now();
    ensure(state);
    var ev = [];
    if (LV()) {
      if (updateWeekly(state, t)) ev.push({ type: 'weekly' });
      var before = state.extras.showdown.key, info = updateShowdown(state, t);
      if (info.active && before !== info.key) ev.push({ type: 'showdown', info: info });
    }
    var dr = updateDebate(state, t);
    if (dr) ev.push({ type: 'debate', result: dr });
    if (LG()) updateBoards(state, t).forEach(function (r) { ev.push({ type: 'board', board: r }); });
    if (updateCodex(state, t)) ev.push({ type: 'codex' });
    return ev;
  }

  root.Extras = {
    defaults: defaults, ensure: ensure,
    perkDef: perkDef, perkLevel: perkLevel, perkValue: perkValue, perkSpent: perkSpent, perkPoints: perkPoints, perkLevels: perkLevels,
    buyPerk: buyPerk, respecPerks: respecPerks, field: field, missionBonus: missionBonus, onReset: onReset, onConvention: onConvention,
    sen: sen, senTiers: senTiers, senPickable: senPickable, pickSenPerk: pickSenPerk, seniorPerks: seniorPerks, accrue: accrue, senPickCount: senPickCount,
    worldMods: worldMods, applyMods: applyMods, bizCost: bizCost,
    hasUnlock: hasUnlock, grantUnlock: grantUnlock, setAuto: setAuto, autoRun: autoRun,
    onReturn: onReturn, comebackMult: comebackMult, decide: decide,
    debateUnlocked: debateUnlocked, debateReady: debateReady, debateK: debateK, startDebate: startDebate, debateProgress: debateProgress,
    updateDebate: updateDebate, forfeitDebate: forfeitDebate, claimDebate: claimDebate,
    updateWeekly: updateWeekly, goalDef: goalDef, goalProgress: goalProgress, goalDone: goalDone, weeklyClaimable: weeklyClaimable,
    claimGoal: claimGoal, claimWeeklyBonus: claimWeeklyBonus,
    showdownInfo: showdownInfo, gcPeriodMatches: gcPeriodMatches, showdownTiersReady: showdownTiersReady, claimShowdown: claimShowdown, updateShowdown: updateShowdown, award: award,
    leagueIdentity: leagueIdentity, rerollName: rerollName, boardsNow: boardsNow, updateBoards: updateBoards, standings: standings,
    rankReward: rankReward, claimBoard: claimBoard, boardsClaimable: boardsClaimable,
    updateCodex: updateCodex, codexCount: codexCount, codexNew: codexNew, codexMarkSeen: codexMarkSeen,
    achCheck: achCheck, update: update
  };
})(typeof window !== 'undefined' ? window : globalThis);
