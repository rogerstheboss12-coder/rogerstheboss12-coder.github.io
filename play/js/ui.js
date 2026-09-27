/* DOM rendering: business cards, top bar, mechanic bar, menu badges and modal panels.
 * All user actions are routed through data-act attributes to Game.act(). */
(function (root) {
  'use strict';
  var D = root.GameData, E = root.Engine, F = root.Fmt, P = root.Portraits, T = root.T, PL = root.Platform;
  var S = null;
  var cards = [];
  var openPanel = null, panelTab = {}, modalStack = [];
  var BUY_MODES = [1, 10, 100, 'next', 'max'];
  var pressing = false;

  function $(id) { return document.getElementById(id); }
  function W() { return D.WORLDS[S.world]; }
  function WS() { return S.worlds[S.world]; }
  function money(n, wi) { return F.money(n, D.WORLDS[wi == null ? S.world : wi].sym); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tE(s, v) { return esc(T(s, v)); }

  // ---------- Content name helpers (translated) ----------
  function bn(wi, i) { return T(D.WORLDS[wi].businesses[i].name); }
  function wn(wi) { return T(D.WORLDS[wi].name); }
  function eventName() { return T(D.WORLDS[D.EVENT_INDEX].name); }
  function worldName(wi) { return D.WORLDS[wi].event ? eventName() : wn(wi); }
  function worldTitle(wi) { return T(D.WORLDS[wi].title); }
  function upgName(wi, u) {
    if (u.tpl) return T(u.tpl, { r: D.roman(u.r), biz: typeof u.target === 'number' ? bn(wi, u.target) : '' });
    if (u.target === 'all') return T(D.UPGRADE_ALL_NAMES[u.round % D.UPGRADE_ALL_NAMES.length]);
    if (typeof u.target === 'number' && u.round != null) return T('{adj} {name}', { adj: T(D.UPGRADE_ADJ[u.round % D.UPGRADE_ADJ.length]), name: bn(wi, u.target) });
    return T(u.name);
  }
  function achText(a) {
    var w = a.world != null ? wn(a.world) : '';
    var v = { n: a.n, world: w, biz: a.biz != null ? bn(a.world, a.biz) : '', r: a.k != null ? D.roman(a.k + 1) : '' };
    switch (a.tpl) {
      case 'bizach': return [T('{biz} ×{n}', v), T('Own {n} {biz}.', v)];
      case 'allach': return [T('E Pluribus {n}', v), T('Own {n} of every business on {world}.', v)];
      case 'lifeach': v.amount = F.money(a.n, D.WORLDS[a.world].sym); return [T('{world} Tycoon {r}', v), T('Earn {amount} all-time.', v)];
      case 'mgrach': return [T('Full Cabinet ({world})', v), T('Hire every manager on {world}.', v)];
      case 'chiefach': return [T('Deep State ({world})', v), T('Appoint every Cabinet Secretary on {world}.', v)];
      case 'electach': return [a.n === 1 ? T('First Term ({world})', v) : T('{n} Terms ({world})', v), T('Hold {n} elections on {world}.', v)];
      case 'worldach': return [T('Welcome to {world}', v), T('Unlock {world}.', v)];
      case 'clickach': return [T('Hands-On President {n}', v), T('Tap businesses {n} times.', v)];
      case 'catchach': return [T('Sky Patrol {n}', v), T('Catch {n} flying bonuses.', v)];
      case 'speechach': return [T('Stump Speaker {n}', v), T('Give {n} stump speeches.', v)];
      case 'dailyach': return [T('Loyal Voter {n}', v), T('Reach a {n}-day login streak.', v)];
      case 'badgeach': return [T('Decorated Patriot {n}', v), T('Earn {n} Liberty Badges.', v)];
      case 'convach': return [T('Founding Father {n}', v), T('Hold {n} Constitutional Conventions.', v)];
      case 'missionach': return [T('Mission Accomplished {n}', v), T('Complete {n} missions.', v)];
      case 'cardach': return [T('Librarian {n}', v), T('Collect {n} Presidential Library cards.', v)];
      case 'raceach': return [T('Space Racer {n}', v), T('Win the weekly Space Race {n} times.', v)];
      case 'orderach': return [T('Pen Is Mightier {n}', v), T('Sign {n} Executive Orders.', v)];
      case 'eventach': return [T('Event Regular {n}', v), T('Reach a reward tier in {n} different events.', v)];
      case 'evsetach': return [T('Collector {n}', v), T('Complete {n} event collections.', v)];
      case 'evtopach': return [T('Event Champion {n}', v), T('Reach the final tier in {n} events.', v)];
      case 'debateach': return [T('Master Debater {n}', v), T('Win {n} debates.', v)];
      case 'decideach': return [T('The Decider {n}', v), T('Make {n} Town Hall decisions.', v)];
      case 'weeklyach': return [T('Goal-Getter {n}', v), T('Complete {n} weekly goals.', v)];
      case 'bossach': return [T('Monster Slayer {n}', v), T('Defeat {n} Showdown bosses.', v)];
      case 'podiumach': return [T('On the Podium {n}', v), T('Finish in the top 3 of {n} leaderboards.', v)];
      case 'perkach': return [T('Bill of Rights {n}', v), T('Ratify {n} perk levels.', v)];
      case 'seniorach': return [T('Old Guard {n}', v), T('Choose {n} Cabinet seniority perks.', v)];
      case 'codexach': return [T('Historian {n}', v), T('Discover {n} Codex entries.', v)];
    }
    return [a.id, ''];
  }
  function missionText(wi, m) {
    var v = { n: F.short(m.n) };
    switch (m.kind) {
      case 'own': v.biz = bn(wi, m.biz); return T('Own {n} {biz}', v);
      case 'hire': v.biz = bn(wi, m.biz); return T('Hire the manager for {biz}', v);
      case 'upgrades': return T('Pass {n} upgrades', v);
      case 'chief': v.biz = bn(wi, m.biz); return T('Promote the manager of {biz} to Cabinet Secretary', v);
      case 'income': v.amount = money(m.n, wi); return T('Earn {amount} per second', v);
      case 'angels': v.p = T(D.WORLDS[wi].prestigeShort); v.n = F.num(m.n); return T('Attract {n} {p} in total', v);
      case 'promises': v.p = T('Campaign Promises'); return T('Keep {n} Campaign Promises', v);
      case 'earn': v.amount = money(m.n, wi); return T('Earn {amount} all-time', v);
      case 'all': return T('Own {n} of every business', v);
      case 'elect': return T('Hold {n} elections', v);
      case 'catch': return T('Catch {n} sky bonuses during this event', v);
      case 'taps': return T('Tap businesses {n} times during this event', v);
      case 'tier': return T('Reach reward tier {n}', v);
    }
    return '';
  }

  function init(state) {
    S = state;
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeTop();
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role=button][data-act]')) { e.preventDefault(); onClick({ target: e.target }); }
    });
    $('buy-mode').addEventListener('click', function () {
      var i = BUY_MODES.indexOf(S.settings.buyMode);
      S.settings.buyMode = BUY_MODES[(i + 1) % BUY_MODES.length];
      root.GameAudio.play('click', 0.6); PL.haptic('light');
      renderBuyMode();
    });
    $('world-badge').addEventListener('click', function () { open('worlds'); });
    $('world-mini').addEventListener('click', function () { open('worlds'); });
    $('lb-box').addEventListener('click', function () { panelTab.store = 'lb'; open('store'); });
    document.querySelectorAll('#menu button').forEach(function (b) {
      b.addEventListener('click', function () { root.GameAudio.play('click', 0.6); PL.haptic('light'); open(b.dataset.panel); });
    });
    // Never swap panel DOM out from under a press, or the click is lost.
    document.addEventListener('pointerdown', function () { pressing = true; }, true);
    document.addEventListener('pointerup', function () { setTimeout(function () { pressing = false; }, 0); }, true);
    document.addEventListener('pointercancel', function () { pressing = false; }, true);
  }

  function setState(state) { S = state; }

  function onClick(e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    root.Game.act(el.dataset.act, el.dataset, el, e);
  }

  // ---------- Settings application ----------
  function applySettings() {
    var st = S.settings, cl = document.documentElement.classList;
    cl.toggle('text-s', st.textSize === 's'); cl.toggle('text-l', st.textSize === 'l'); cl.toggle('text-xl', st.textSize === 'xl');
    cl.toggle('cb', !!st.colorblind);
    var rm = st.reduceMotion || (root.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    cl.toggle('reduce-motion', !!rm);
    PL.setHaptics(st.haptics !== false);
    F.setMode(st.numFormat);
    translateStatic();
  }
  function translateStatic() {
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = T(el.dataset.t); });
    $('world-badge').setAttribute('aria-label', T('Star Map'));
    $('world-mini').setAttribute('aria-label', T('Star Map'));
    $('lb-box').setAttribute('aria-label', T('Liberty Bucks'));
    $('buy-mode').setAttribute('aria-label', T('Buy quantity'));
  }

  // ---------- World chrome ----------
  function renderWorld() {
    var w = W(), wi = S.world;
    var bgv = w.bg ? 'url("' + w.bg + '")' : w.bgCss;
    $('bg-img').style.backgroundImage = bgv;
    $('world-planet').style.backgroundImage = bgv;
    $('world-mini').style.backgroundImage = bgv;
    document.body.dataset.eventId = w.event ? w.eventId || '' : '';
    $('world-name').textContent = worldName(wi);
    $('world-title').textContent = worldTitle(wi);
    $('ml-election').textContent = w.event ? T('Rewards') : T(w.prestigeShort);
    document.documentElement.style.setProperty('--accent', w.accent);
    document.body.dataset.world = w.id;
    $('ticker-inner').innerHTML = D.NEWS[wi].concat(D.NEWS[wi]).map(function (n) { return '<span>' + tE(n) + '</span>'; }).join('');
    if (root.LiveUI) root.LiveUI.applyCosmetics(); // before building, so portraits get the equipped look
    buildBusinesses();
    if (root.LiveUI) root.LiveUI.applyCosmetics();
    renderBuyMode();
    translateStatic();
    lastMech = null;
  }

  function renderBuyMode() {
    var m = S.settings.buyMode;
    $('buy-mode').innerHTML = tE('Buy') + '<br><b>' + (m === 'next' ? tE('NEXT') : m === 'max' ? tE('MAX') : '×' + m) + '</b>';
  }

  var RING_C = 2 * Math.PI * 53;
  function buildBusinesses() {
    var host = $('businesses'), w = W(), wi = S.world;
    host.innerHTML = '';
    cards = w.businesses.map(function (b, i) {
      var el = document.createElement('div');
      el.className = 'biz';
      el.innerHTML =
        '<div class="biz-icon" role="button" tabindex="0" data-act="tap" data-i="' + i + '" aria-label="' + tE('Run {biz}', { biz: bn(wi, i) }) + '">' +
          '<svg class="biz-ring" viewBox="0 0 114 114" aria-hidden="true"><circle class="track" cx="57" cy="57" r="53"/><circle class="fill" cx="57" cy="57" r="53" stroke-dasharray="' + RING_C + '" stroke-dashoffset="' + RING_C + '" transform="rotate(-90 57 57)"/></svg>' +
          iconHtml(b) +
          '<div class="biz-owned">0</div>' +
          '<div class="biz-mgr" aria-hidden="true">' + P.portrait(w.managers[i].face, { uid: 'card' + i, bg: w.accent }) + '</div>' +
          '<div class="biz-flare" data-act="flare" aria-hidden="true">☀</div>' +
        '</div>' +
        '<div class="biz-body">' +
          '<div class="biz-bar" data-act="tap" data-i="' + i + '" aria-hidden="true"><div class="biz-bar-fill"></div><span class="biz-name">' + esc(bn(wi, i)) + '</span><div class="biz-rev"></div></div>' +
          '<div class="biz-row"><button class="biz-buy" data-act="buy" data-i="' + i + '"><span class="q"></span><span class="c"></span></button><div class="biz-timer" aria-hidden="true">--:--:--</div></div>' +
          '<div class="biz-milestone"></div>' +
        '</div>';
      host.appendChild(el);
      return {
        el: el, icon: el.querySelector('.biz-icon'), ring: el.querySelector('.biz-ring .fill'), owned: el.querySelector('.biz-owned'),
        fill: el.querySelector('.biz-bar-fill'), rev: el.querySelector('.biz-rev'), buy: el.querySelector('.biz-buy'),
        q: el.querySelector('.biz-buy .q'), c: el.querySelector('.biz-buy .c'), timer: el.querySelector('.biz-timer'),
        ms: el.querySelector('.biz-milestone'), last: {}
      };
    });
  }

  function setText(card, key, el, val) { if (card.last[key] !== val) { card.last[key] = val; el.innerHTML = val; } }
  function setAttr(card, key, el, attr, val) { if (card.last[key] !== val) { card.last[key] = val; el.setAttribute(attr, val); } }
  function setClass(el, cls, on) { if (el.classList.contains(cls) !== on) el.classList.toggle(cls, on); }

  function frame() {
    var ws = WS(), mults = E.worldMults(S, S.world);
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i], bs = ws.biz[i];
      if (!bs.owned) continue;
      var st = E.bizStats(S, S.world, i, mults);
      var fast = st.time < 0.25 && (bs.manager || bs.running);
      setClass(c.el, 'fast', fast);
      if (!fast) c.fill.style.transform = 'scaleX(' + (bs.running ? Math.min(1, bs.progress) : 0) + ')';
    }
  }

  // ---------- Best buy (#1): the purchase with the fastest payback ----------
  // Recomputed about once a second. Returns { kind: 'biz', i } or { kind: 'upg', id } or null.
  var best = null, bestAt = 0;
  function computeBest() {
    var wi = S.world, ws = WS(), w = W(), mode = S.settings.buyMode, base = E.incomePerSec(S, wi, false), out = null, score = Infinity;
    if (!(base > 0)) return null;
    for (var i = 0; i < ws.biz.length; i++) {
      var bs = ws.biz[i];
      if (!bs.owned && (i === 0 || !ws.biz[i - 1].owned)) continue;
      var q = bs.owned ? E.buyQty(S, wi, i, mode) : 1, cost = E.costFor(S, wi, i, q);
      bs.owned += q;
      var gain = E.incomePerSec(S, wi, false) - base;
      bs.owned -= q;
      if (gain > 0 && cost / gain < score) { score = cost / gain; out = { kind: 'biz', i: i }; }
    }
    var mults = E.worldMults(S, wi), n = 0;
    for (var k = 0; k < w.cashUpgrades.length && n < 12; k++) {
      var u = w.cashUpgrades[k];
      if (ws.upgrades[u.id]) continue;
      n++;
      var g = 0;
      if (u.target === 'all') g = base * (u.mult - 1);
      else if (u.target === 'angel') g = ws.angels ? base * (u.add * ws.angels) / mults.angel : 0;
      else if (ws.biz[u.target].owned) g = E.bizStats(S, wi, u.target, mults).perSec * (u.mult - 1);
      var c = E.upgradeCost(S, wi, u);
      if (g > 0 && c / g < score) { score = c / g; out = { kind: 'upg', id: u.id }; }
    }
    return out;
  }
  function bestBuy() {
    if (S.settings.bestBuy === false) return null;
    var t = Date.now();
    if (t - bestAt > 1000) { bestAt = t; best = computeBest(); }
    return best;
  }

  // ---------- Election payoff (#6) ----------
  function electionPayoff(wi) {
    var ws = S.worlds[wi], eff = E.angelEffect(S, wi), claim = E.claimableAngels(S, wi);
    var now = ws.angels * eff, after = (ws.angels + claim) * eff;
    return { claim: claim, now: now, after: after, ratio: (1 + after) / (1 + now) };
  }

  function update() {
    var w = W(), ws = WS(), wi = S.world, mults = E.worldMults(S, wi), mode = S.settings.buyMode, t = E.now();
    var bb = bestBuy();
    var p = F.parts(ws.cash);
    $('cash-num').textContent = w.sym + p.num;
    $('cash-word').textContent = p.word;
    $('income-num').textContent = money(E.incomePerSec(S, wi, 'active'));
    $('lb-num').textContent = F.short(S.lb);

    var flared = {};
    E.activeEffects(ws, t).forEach(function (e) { if (e.kind === 'flare') e.targets.forEach(function (k) { flared[k] = e; }); });

    var firstLockedShown = false;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i], bs = ws.biz[i];
      var locked = bs.owned === 0;
      setClass(c.el, 'locked', locked);
      setClass(c.el, 'managed', bs.manager);
      setClass(c.el, 'running', bs.running || bs.manager);
      setClass(c.el, 'flared', !!flared[i]);
      setClass(c.el, 'flare-ext', !!(flared[i] && flared[i].extended));
      setClass(c.el, 'anchored', !!(w.mechanic === 'anchor' && ws.anchor && ws.anchor.biz === i));
      setClass(c.el, 'best', !!(bb && bb.kind === 'biz' && bb.i === i));
      var hidden = locked && firstLockedShown;
      setClass(c.el, 'hidden', hidden);
      if (locked) firstLockedShown = true;
      var tier = E.frameTier(bs.owned);
      if (c.last.tier !== tier) { if (c.last.tier) c.icon.classList.remove('tier-' + c.last.tier); c.icon.classList.add('tier-' + tier); c.last.tier = tier; }
      var q = locked ? 1 : E.buyQty(S, wi, i, mode);
      var cost = E.costFor(S, wi, i, q);
      var can = cost <= ws.cash;
      c.buy.disabled = !can;
      setClass(c.el, 'can', can);
      if (locked) {
        setText(c, 'q', c.q, tE('Unlock'));
        setText(c, 'c', c.c, esc(bn(wi, i)) + '<small>' + money(cost) + '</small>');
        setText(c, 'o', c.owned, '0');
        setText(c, 'ms', c.ms, tE(w.businesses[i].flavor));
        setAttr(c, 'aria', c.buy, 'aria-label', T('Unlock {biz} for {cost}', { biz: bn(wi, i), cost: money(cost) }));
        continue;
      }
      var st = E.bizStats(S, wi, i, mults);
      setText(c, 'o', c.owned, F.short(bs.owned));
      setText(c, 'q', c.q, tE('Buy ×{n}', { n: F.short(q) }));
      setText(c, 'c', c.c, money(cost));
      setAttr(c, 'aria', c.buy, 'aria-label', T('Buy {n} {biz} for {cost}. You own {owned}.', { n: q, biz: bn(wi, i), cost: money(cost), owned: bs.owned }));
      setText(c, 'rev', c.rev, st.time < 0.25 ? money(st.perSec) + T('/sec') : money(st.rev));
      var left = bs.running || bs.manager ? (1 - bs.progress) * st.time : st.time;
      setText(c, 't', c.timer, F.time(left));
      var nm = E.nextMilestone(bs.owned);
      var prevAt = 0;
      for (var k = 0; k < D.MILESTONES.length; k++) { if (D.MILESTONES[k].at <= bs.owned) prevAt = D.MILESTONES[k].at; else break; }
      var frac = nm ? (bs.owned - prevAt) / (nm.at - prevAt) : 1;
      c.ring.style.strokeDashoffset = RING_C * (1 - frac);
      setText(c, 'ms', c.ms, nm ? tE('Next: {at} → {what}', { at: nm.at, what: nm.speed ? T('speed ×{n}', { n: nm.speed }) : T('profit ×{n}', { n: nm.profit }) }) : tE('All milestones reached!'));
    }
    updateBadges();
    updateBoosts();
    updateSpeech();
    updateMechanicBar();
    if (root.LiveUI) root.LiveUI.updateHub();
  }

  function badge(id, n, txt) {
    var el = $(id);
    if (!el) return;
    var show = n > 0;
    if (el.classList.contains('show') !== show) el.classList.toggle('show', show);
    var t = txt || (n > 99 ? '99+' : String(n));
    if (el.textContent !== (show ? t : '')) el.textContent = show ? t : '';
  }

  function updateBadges() {
    var w = W(), ws = WS(), wi = S.world;
    var nUpg = w.cashUpgrades.filter(function (u) { return !ws.upgrades[u.id] && E.upgradeCost(S, wi, u) <= ws.cash; }).length;
    badge('b-upgrades', nUpg);
    var bb = bestBuy();
    $('menu').querySelector('[data-panel=upgrades]').classList.toggle('best-nav', !!(bb && bb.kind === 'upg'));
    badge('b-managers', w.businesses.filter(function (b, i) {
      var bs = ws.biz[i];
      return (!bs.manager && bs.owned && b.managerCost <= ws.cash) || (bs.manager && !bs.chief && b.chiefCost <= ws.cash);
    }).length);
    var ep = w.event ? null : electionPayoff(wi);
    // Pulse when an Election at least doubles this world's prestige bonus (or the first one is worth taking).
    var worth = ep && ep.claim > 0 && (ep.ratio >= 2 || (ws.elections === 0 && ep.claim >= 10));
    var electReady = w.event ? E.eventTiersReady(S).length : (worth ? 1 : 0);
    badge('b-election', electReady, w.event ? '!' : (ep && ep.ratio >= 1.995 ? '×' + F.short(ep.ratio) : '!'));
    $('nav-election').classList.toggle('pulse-nav', !!worth);
    badge('b-missions', E.claimableMissions(S, wi));
    var worldsReady = (w.next && !S.unlocked[wi + 1] && ws.cash >= w.next.cost ? 1 : 0) + (E.claimableAmendments(S) > 0 ? 1 : 0);
    badge('b-worlds', worldsReady, '!');
    var daily = E.dailyStatus(S).claimable ? 1 : 0;
    badge('b-daily', daily, '!');
    var liveDots = (root.LiveUI ? root.LiveUI.dotCount() : 0) + (root.ExtrasUI ? root.ExtrasUI.dotCount() : 0);
    badge('b-more', worldsReady + daily + liveDots, '!');
    if (root.LiveUI) root.LiveUI.navBadges(badge);
    var sb = $('b-store'), lbt = F.short(S.lb);
    if (sb.textContent !== lbt) sb.textContent = lbt;
    sb.classList.add('show');
  }

  function updateBoosts() {
    var t = E.now(), out = [];
    var fair = !E.isMain(S.world); // paid boosts don't apply to events
    var perm = (fair ? 1 : S.permMult * (S.iap.founding ? 3 : 1)) * (1 + S.badges * D.BADGE_BONUS) * Math.pow(1 + D.CONVENTION.profitPer, S.amendments);
    if (perm > 1.001) out.push('<span class="boost perm" title="' + tE('Permanent multiplier') + '">🦅 ×' + F.short(perm) + '</span>');
    if (S.speechUntil > t) out.push('<span class="boost speech">🎤 ×2 ' + F.time((S.speechUntil - t) / 1000) + '</span>');
    if (S.rallyUntil > t && !fair) out.push('<span class="boost rally">📣 ×10 ' + F.time((S.rallyUntil - t) / 1000) + '</span>');
    if (S.extras && S.extras.comeback.until > t && !fair) out.push('<span class="boost comeback" title="' + tE('Welcome-back bonus') + '">🎉 ×' + D.EXTRAS.COMEBACK.mult + ' ' + F.time((S.extras.comeback.until - t) / 1000) + '</span>');
    if (E.tributeMult(S, S.world) > 1) out.push('<span class="boost tribute">👑 ×' + D.TRIBUTE + '</span>');
    var ang = WS().angels;
    if (ang > 0) out.push('<span class="boost">' + tE(W().prestigeShort) + ' +' + F.short(ang * E.angelEffect(S, S.world) * 100) + '%</span>');
    var h = out.join('');
    if ($('boosts').innerHTML !== h) $('boosts').innerHTML = h;
  }

  function updateSpeech() {
    var t = E.now(), left = (S.speechUntil - t) / 1000;
    var sm = F.short(2 * E.field(S, 'speechBoost'));
    var txt = left > 0 ? T('×{m} active · {t}', { m: sm, t: F.time(left) }) : (S.iap.founding ? T('×{m} profit for 4 hours', { m: sm }) : T('▶ Watch ad: ×{m} for 4h', { m: sm }));
    if (left > 20 * 3600) txt = T('Max 24h · {t}', { t: F.time(left) });
    if ($('speech-sub').textContent !== txt) $('speech-sub').textContent = txt;
  }

  // ---------- Mechanic bar (world-specific systems & event) ----------
  var lastMech = '';
  function updateMechanicBar() {
    var w = W(), ws = WS(), t = E.now(), h = '';
    if (w.event) {
      var win = E.eventWindow(t), ready = E.eventTiersReady(S).length;
      var done = Object.keys(ws.eventClaimed).length;
      var next = D.EVENT_TIERS.filter(function (tier, k) { return !ws.eventClaimed[k] && ws.lifetime < tier.at; })[0];
      h = '<span class="mech-ic">' + w.emoji + '</span><span class="mech-txt"><b>' + esc(eventName()) + '</b> · ' + tE('ends in {t}', { t: F.time(Math.max(0, win.end - t) / 1000) }) +
        ' · ' + tE('Tier {a}/{b}', { a: done, b: D.EVENT_TIERS.length }) + (next ? ' · ' + tE('next at {x}', { x: money(next.at) }) : '') + '</span>' +
        (ready ? '<button class="btn gold sm" data-act="claimEvent">' + tE('Claim ({n})', { n: ready }) + '</button>' : '');
    } else if (w.mechanic === 'flare') {
      var fl = E.activeEffects(ws, t).filter(function (e) { return e.kind === 'flare'; })[0];
      h = '<span class="mech-ic">☀️</span><span class="mech-txt"><b>' + tE('Solar Flares') + '</b> · ' +
        (fl ? tE('{biz} at ×5 speed · {t}', { biz: bn(1, fl.targets[0]), t: F.time((fl.until - t) / 1000) }) + (fl.extended ? '' : ' · ' + tE('tap ☀ to extend')) : tE('The Sun is simmering…')) + '</span>';
    } else if (w.mechanic === 'treaty') {
      var tr = E.activeEffects(ws, t).filter(function (e) { return e.kind === 'treaty'; })[0];
      var pend = root.Game.pendingTreaty();
      h = '<span class="mech-ic">🤝</span><span class="mech-txt"><b>' + tE('Alien Treaties') + '</b> · ' +
        (tr ? treatyLabel(tr) + ' · ' + F.time((tr.until - t) / 1000) : (pend ? tE('An envoy is waiting!') : tE('Awaiting the next envoy…'))) + '</span>' +
        (pend ? '<button class="btn gold sm" data-act="openTreaty">' + tE('Negotiate') + '</button>' : '');
    } else if (w.mechanic === 'loop') {
      var prog = E.loopProgress(S, t);
      h = '<span class="mech-ic">⟲</span><span class="mech-txt"><b>' + tE('Temporal Loops') + '</b> · ' + ws.loopCharges + '/' + E.LOOP_MAX +
        (ws.loopCharges < E.LOOP_MAX ? ' · ' + tE('next in {t}', { t: F.time((1 - prog) * 900) }) : '') + '</span>' +
        '<button class="btn blue sm" data-act="useLoop" ' + (ws.loopCharges > 0 ? '' : 'disabled') + '>' + tE('Replay 30 min') + '</button>';
    } else if (w.mechanic === 'anchor') {
      var an = ws.anchor, am = E.anchorMult(S, t), amax = D.ANCHOR.max * (root.Live ? root.Live.hookField(S, 'anchorMax') : 1);
      h = '<span class="mech-ic">⚓</span><span class="mech-txt"><b>' + tE('Reality Anchor') + '</b> · ' +
        (an ? esc(bn(S.world, an.biz)) + ' ×' + am.toFixed(1) + (am < amax ? ' · ' + tE('×{m} in {t}', { m: amax, t: F.time((amax - am) * D.ANCHOR.stepMin * 60) }) : ' · ' + tE('fully anchored')) : tE('Anchor a business to grow its profit')) + '</span>' +
        '<button class="btn ' + (an ? 'blue' : 'gold') + ' sm" data-act="openAnchor">' + (an ? tE('Re-anchor') : tE('Anchor')) + '</button>';
    } else if (w.mechanic === 'townhall') {
      var dec = root.Game.pendingDecision();
      h = '<span class="mech-ic">🏛️</span><span class="mech-txt"><b>' + tE('Town Hall') + '</b> · ' + (dec ? tE('A citizen needs your decision!') : tE('Citizens are lining up with questions…')) + '</span>' +
        (dec ? '<button class="btn gold sm pulse-btn" data-act="openDecision">' + tE('Decide') + '</button>' : '');
    }
    if (h !== lastMech) { $('mechanic-bar').innerHTML = h; lastMech = h; }
    $('mechanic-bar').classList.toggle('show', !!h);
  }

  function treatyLabel(o) {
    var what = o.speed ? T('speed ×{n}', { n: o.speed }) : T('profit ×{n}', { n: o.profit });
    var who;
    if (o.targets === 'all') who = T('everything');
    else if (o.key === 'low') who = T('businesses 1–5');
    else if (o.key === 'high') who = T('businesses 6–10');
    else if (o.key === 'even') who = T('odd-numbered businesses');
    else if (o.key === 'odd') who = T('even-numbered businesses');
    else who = bn(2, o.targets[0]);
    return esc(who) + ' ' + esc(what);
  }

  // ---------- Modals ----------
  function modal(html, cls, onClose) {
    var wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = '<div class="modal ' + (cls || '') + '" role="dialog" aria-modal="true">' + html + '</div>';
    wrap.addEventListener('click', function (e) { if (e.target === wrap && !wrap._sticky) close(wrap); });
    wrap._onClose = onClose;
    $('modal-root').appendChild(wrap);
    modalStack.push(wrap);
    var h2 = wrap.querySelector('h2');
    if (h2) { h2.id = 'mh' + Date.now().toString(36) + modalStack.length; wrap.firstChild.setAttribute('aria-labelledby', h2.id); }
    return wrap;
  }
  function close(wrap) {
    var i = modalStack.indexOf(wrap);
    if (i >= 0) modalStack.splice(i, 1);
    if (wrap._panel) openPanel = null;
    wrap.remove();
    if (wrap._onClose) wrap._onClose();
  }
  function closeTop() { if (modalStack.length && !modalStack[modalStack.length - 1]._sticky) close(modalStack[modalStack.length - 1]); }
  function closeAll() { while (modalStack.length) close(modalStack[modalStack.length - 1]); }
  function anyModal() { return modalStack.length > 0; }

  function head(title, sub) {
    return '<div class="modal-head"><h2>' + title + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') + '<button class="modal-close" data-act="close" aria-label="' + tE('Close') + '">✕</button></div>';
  }

  var PANELS = {};
  function open(name) {
    if (openPanel && openPanel.name === name) return;
    closeAll();
    var wrap = modal(head('') + '<div class="modal-body"></div>');
    wrap._panel = true;
    openPanel = { name: name, wrap: wrap };
    refreshPanel(true);
    if (root.Analytics) root.Analytics.track('panel', { name: name });
  }

  // Patches only the top-level children that changed, so buttons aren't recreated under the user.
  function patch(body, html) {
    var tpl = document.createElement('div');
    tpl.innerHTML = html;
    var a = body.children, b = tpl.children;
    if (a.length !== b.length) { body.innerHTML = html; return; }
    for (var i = b.length - 1; i >= 0; i--) {
      if (!a[i].isEqualNode(b[i])) body.replaceChild(b[i], a[i]);
    }
  }

  // Heavy panels refresh less often, and nothing re-renders while the player is scrolling (#47).
  var PANEL_EVERY = { leagues: 2000, library: 3000, codex: 3000, unlocks: 2000, settings: 3000, perks: 1000, showdown: 1000, weekly: 1000, more: 1000 };
  var scrollingUntil = 0;
  if (root.document) document.addEventListener('scroll', function () { scrollingUntil = Date.now() + 350; }, true);
  function refreshPanel(force) {
    if (!openPanel || (pressing && !force)) return;
    if (!force) {
      var now = Date.now();
      if (now < scrollingUntil || now - (openPanel.at || 0) < (PANEL_EVERY[openPanel.name] || 0)) return;
      openPanel.at = now;
    }
    var r = PANELS[openPanel.name]();
    var wrap = openPanel.wrap, body = wrap.querySelector('.modal-body');
    var h = wrap.querySelector('.modal-head');
    var headHtml = '<h2>' + r.title + '</h2>' + (r.sub ? '<p>' + r.sub + '</p>' : '') + '<button class="modal-close" data-act="close" aria-label="' + tE('Close') + '">✕</button>';
    if (h._last !== headHtml) { h.innerHTML = headHtml; h._last = headHtml; }
    if (force) { var sc = body.scrollTop; body.innerHTML = r.body; body.scrollTop = sc; body._last = r.body; }
    else if (body._last !== r.body) { patch(body, r.body); body._last = r.body; }
  }

  function tabs(name, list) {
    var cur = panelTab[name] || list[0][0];
    return '<div class="modal-tabs" role="tablist">' + list.map(function (t) {
      return '<button role="tab" aria-selected="' + (t[0] === cur) + '" class="' + (t[0] === cur ? 'on' : '') + '" data-act="tab" data-panel="' + name + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
    }).join('') + '</div>';
  }
  function setTab(panel, tab) { panelTab[panel] = tab; refreshPanel(true); }

  function iconHtml(b) { return b.icon ? '<img src="' + b.icon + '" alt="">' : '<span class="biz-emoji" aria-hidden="true">' + b.emoji + '</span>'; }
  function bizIcon(wi, i) { return iconHtml(D.WORLDS[wi].businesses[i]); }
  function targetLabel(wi, u) {
    var w = D.WORLDS[wi];
    if (u.target === 'all') return T('Profit of <b>everything</b> ×{n}', { n: u.mult });
    if (u.target === 'angel') return T('<b>{p}</b> effectiveness +{n}%', { p: esc(T(w.prestigeName)), n: Math.round(u.add * 100) });
    if (u.free) return T('+{n} free <b>{biz}</b>', { n: u.free, biz: esc(bn(wi, u.target)) });
    return T('<b>{biz}</b> profit ×{n}', { biz: esc(bn(wi, u.target)), n: u.mult });
  }
  function upgIcon(wi, u) {
    if (u.target === 'all') return '🇺🇸';
    if (u.target === 'angel') return '🗳️';
    return bizIcon(wi, u.target);
  }
  function row(key, icon, title, sub, btn, cls) {
    return '<div class="row ' + (cls || '') + '" data-k="' + key + '"><div class="row-icon" aria-hidden="true">' + icon + '</div><div><div class="row-title">' + title + '</div><div class="row-sub">' + sub + '</div></div>' + (btn || '<span></span>') + '</div>';
  }

  // Upgrade filters (#4): all · affordable · "everything" bills · prestige bills · one business.
  function upgFilterOk(f, u, can) {
    if (!f || f === 'all') return true;
    if (f === 'afford') return can;
    if (f === 'every') return u.target === 'all';
    if (f === 'angel') return u.target === 'angel';
    return u.target === +f.slice(1);
  }
  PANELS.upgrades = function () {
    var w = W(), ws = WS(), wi = S.world;
    var tab = panelTab.upgrades || 'avail', f = panelTab.upgFilter || 'all', bb = bestBuy();
    var cost = function (u) { return E.upgradeCost(S, wi, u); };
    var afford = w.cashUpgrades.filter(function (u) { return !ws.upgrades[u.id] && cost(u) <= ws.cash; }).length;
    var list = w.cashUpgrades.filter(function (u) { return (tab === 'owned' ? ws.upgrades[u.id] : !ws.upgrades[u.id]) && upgFilterOk(f, u, cost(u) <= ws.cash); });
    var body = tabs('upgrades', [['avail', tE('Available')], ['owned', tE('Purchased ({n})', { n: Object.keys(ws.upgrades).length })]]);
    if (tab === 'avail') body += '<div class="toolbar"><p class="panel-note">' + tE('Pass bills to multiply your profits. Upgrades stay until your next Election.') + '</p><button class="btn gold" data-act="buyAllUpgrades" ' + (afford ? '' : 'disabled') + '>' + tE('Buy all affordable ({n})', { n: afford }) + '</button></div>';
    if (tab === 'avail' && root.Extras && root.Extras.hasUnlock(S, 'auto') && E.isMain(wi)) {
      var on = S.extras.auto.bills[wi] !== false;
      body += '<div class="setting auto-row"><span>🧑‍💼 ' + tE('Auto-pass bills on {world}', { world: worldName(wi) }) + '</span><button class="toggle ' + (on ? 'on' : '') + '" role="switch" aria-checked="' + on + '" aria-label="' + tE('Auto-pass bills') + '" data-act="setAuto" data-kind="bills" data-on="' + (on ? 0 : 1) + '"></button></div>';
    }
    var chips = [['all', tE('All')], ['afford', tE('Affordable')], ['every', '🇺🇸 ' + tE('Everything')]];
    if (w.cashUpgrades.some(function (u) { return u.target === 'angel'; })) chips.push(['angel', '🗳️']);
    body += '<div class="filter-chips" role="group" aria-label="' + tE('Filter') + '">' + chips.map(function (c) {
      return '<button class="' + (f === c[0] ? 'on' : '') + '" aria-pressed="' + (f === c[0]) + '" data-act="upgFilter" data-f="' + c[0] + '">' + c[1] + '</button>';
    }).join('') + '<select aria-label="' + tE('Business') + '" onchange="Game.act(\'upgFilter\', { f: this.value })"><option value="all">' + tE('Business…') + '</option>' +
      w.businesses.map(function (b, i) { return '<option value="b' + i + '"' + (f === 'b' + i ? ' selected' : '') + '>' + esc(bn(wi, i)) + '</option>'; }).join('') + '</select></div>';
    body += list.slice(0, tab === 'avail' ? (f === 'all' ? 30 : 100) : 250).map(function (u) {
      var c = cost(u), can = c <= ws.cash, isBest = bb && bb.kind === 'upg' && bb.id === u.id;
      return row(u.id, upgIcon(wi, u), (isBest ? '<span class="best-tag">' + tE('Best buy') + '</span> ' : '') + esc(upgName(wi, u)), targetLabel(wi, u),
        ws.upgrades[u.id] ? '<span class="btn blue ghost">' + tE('Passed') + '</span>' : '<button class="btn" data-act="buyUpgrade" data-id="' + u.id + '" ' + (can ? '' : 'disabled') + '>' + money(c) + '</button>', ws.upgrades[u.id] ? 'done' : (isBest ? 'best-row' : ''));
    }).join('') || '<p class="panel-note">' + tE('Nothing here yet.') + '</p>';
    return { title: '⬆️ ' + tE('Upgrades — {world}', { world: worldName(wi) }), sub: tE('Legislation for profit'), body: body };
  };

  PANELS.managers = function () {
    var w = W(), ws = WS(), wi = S.world;
    var body = '<p class="panel-note">' + tE('Appoint a manager to run a business automatically — forever, even offline. Managers can then be promoted to Cabinet Secretary, making that business 90% cheaper to expand.') + '</p>';
    var XX = root.Extras, main = E.isMain(wi);
    if (XX && main) body += '<p class="panel-note small">🎖️ ' + tE('Cabinet Secretaries build seniority over time and unlock perks (after {a}, {b} and {c}).', { a: F.duration(D.EXTRAS.SENIORITY.tiers[0]), b: F.duration(D.EXTRAS.SENIORITY.tiers[1]), c: F.duration(D.EXTRAS.SENIORITY.tiers[2]) }) + '</p>';
    if (XX && main && XX.hasUnlock(S, 'auto')) {
      var on = S.extras.auto.hire[wi] !== false;
      body += '<div class="setting auto-row"><span>🧑‍💼 ' + tE('Auto-hire managers and Secretaries on {world}', { world: worldName(wi) }) + '</span><button class="toggle ' + (on ? 'on' : '') + '" role="switch" aria-checked="' + on + '" aria-label="' + tE('Auto-hire') + '" data-act="setAuto" data-kind="hire" data-on="' + (on ? 0 : 1) + '"></button></div>';
    }
    body += w.businesses.map(function (b, i) {
      var m = w.managers[i], bs = ws.biz[i];
      var face = P.portrait(m.face, { uid: 'mg' + i, bg: w.accent });
      var btn;
      if (!bs.manager) btn = '<button class="btn" data-act="hire" data-i="' + i + '" ' + (b.managerCost <= ws.cash && bs.owned ? '' : 'disabled') + '>' + tE('Hire') + '<small>' + money(b.managerCost) + '</small></button>';
      else if (!bs.chief) btn = '<button class="btn gold" data-act="chief" data-i="' + i + '" ' + (b.chiefCost <= ws.cash ? '' : 'disabled') + '>' + tE('Promote') + '<small>' + money(b.chiefCost) + '</small></button>';
      else btn = '<span class="btn blue ghost">' + tE('Secretary ✓') + '</span>';
      var status = bs.manager ? (bs.chief ? ' · <b>' + tE('Cabinet Secretary') + '</b>' : ' · <b>' + tE('Hired') + '</b>') : (bs.owned ? '' : ' · <i>' + tE('buy the business first') + '</i>');
      if (XX && main && (bs.chief || XX.senTiers(S, wi, i))) {
        var tiers = XX.senTiers(S, wi, i), pk = XX.senPickable(S, wi, i);
        status += ' · 🎖️ ' + tE('Seniority {a}/{b}', { a: tiers, b: 3 });
        btn = '<div class="btn-stack">' + btn + '<button class="btn ' + (pk ? 'gold' : 'blue') + ' sm' + (pk ? ' dot-btn' : '') + '" data-act="openSeniority" data-i="' + i + '">🎖️ ' + (pk ? tE('Pick perk') : tE('Perks')) + '</button></div>';
      }
      return row('m' + i, face, esc(m.name), tE(m.title) + ' · ' + tE('runs') + ' <b>' + esc(bn(wi, i)) + '</b>' + status, btn, bs.chief ? 'done' : '');
    }).join('');
    return { title: '🎩 ' + tE('The Cabinet — {world}', { world: worldName(wi) }), sub: tE('Parody politicians, real productivity'), body: body };
  };

  PANELS.election = function () {
    var w = W(), ws = WS(), wi = S.world;
    if (w.event) return PANELS.eventRewards();
    var claim = E.claimableAngels(S, wi), eff = E.angelEffect(S, wi), pn = esc(T(w.prestigeName)), ps = esc(T(w.prestigeShort));
    var body = '<div class="hero"><div class="row-icon hero-ic">🗳️</div><div class="hero-stats">' +
      '<div><div class="lbl">' + pn + '</div><div class="big-num">' + F.num(ws.angels) + '</div></div>' +
      '<div><div class="lbl">' + tE('Profit bonus') + '</div><div class="big-num">+' + F.num(ws.angels * eff * 100) + '%</div></div>' +
      '<div><div class="lbl">' + tE('Gain on election') + '</div><div class="big-num good">+' + F.num(claim) + '</div></div></div></div>';
    var ep = electionPayoff(wi);
    if (claim > 0) body += '<div class="payoff ' + (ep.ratio >= 2 ? 'good' : '') + '">' + T('Election now: profit bonus <b>+{a}%</b> → <b>+{b}%</b> (×{r} profit on {world})', { a: F.num(ep.now * 100), b: F.num(ep.after * 100), r: ep.ratio < 100 ? ep.ratio.toFixed(2) : F.short(ep.ratio), world: esc(worldName(wi)) }) +
      (ep.ratio >= 2 ? ' · <b>' + tE('Worth it!') + '</b>' : ' · ' + tE('Tip: wait until it at least doubles your bonus.')) + '</div>';
    body += '<p class="panel-note">' + T('Holding an Election resets this world\'s cash, businesses, managers and upgrades — but your campaign attracts <b>{p}</b>. Each one boosts profit by <b>{e}%</b>. You earn more the more you\'ve made all-time ({life}).', { p: pn, e: (eff * 100).toFixed(1).replace(/\.0$/, ''), life: money(ws.lifetime) }) + '</p>';
    body += '<div class="center-cta"><button class="btn red big" data-act="elect" ' + (claim > 0 ? '' : 'disabled') + '>' + tE(w.prestigeVerb) + (claim > 0 ? '<small>+' + F.num(claim) + ' ' + ps + '</small>' : '<small>' + tE('Earn more to attract supporters') + '</small>') + '</button></div>';
    body += '<h3>' + tE('Campaign Promises') + ' <span class="h3-sub">— ' + tE('spend {p} (they stop boosting profit)', { p: T(w.prestigeShort) }) + '</span></h3>';
    var avail = w.angelUpgrades.filter(function (u) { return !ws.angelUpgrades[u.id]; }).slice(0, 12);
    body += avail.map(function (u) {
      var can = ws.angels >= u.cost;
      return row(u.id, upgIcon(wi, u), esc(upgName(wi, u)), targetLabel(wi, u), '<button class="btn gold" data-act="buyAngel" data-id="' + u.id + '" ' + (can ? '' : 'disabled') + '>' + F.num(u.cost) + '<small>' + ps + '</small></button>');
    }).join('') || '<p class="panel-note">' + tE('Every promise kept!') + '</p>';
    return { title: '🗳️ ' + tE(w.prestigeVerb), sub: tE('{n} elections held on {world}', { n: ws.elections, world: worldName(wi) }), body: body };
  };

  function tierLabel(tier) {
    var out = [];
    if (tier.lb) out.push('★ ' + tier.lb);
    if (tier.warp) out.push('⏩ ' + tE('{d} warp', { d: F.duration(tier.warp) }));
    if (tier.card) out.push('🃏 ' + (tier.card > 1 ? tE('{n} event cards', { n: tier.card }) : tE('Event card')));
    if (tier.badge) out.push('🏅 ' + tE('Liberty Badge'));
    return out.join(' + ');
  }
  PANELS.eventRewards = function () {
    var ei = D.EVENT_INDEX, w = D.WORLDS[ei], ws = S.worlds[ei], win = E.eventWindow(E.now()), L = root.Live, LD = D.LIVE;
    var tab = panelTab.eventRewards || 'tiers';
    var body = '<div class="hero"><div class="row-icon hero-ic ev-hero">' + w.emoji + '</div><div class="hero-stats">' +
      '<div><div class="lbl">' + tE('Event earnings') + '</div><div class="big-num">' + money(ws.lifetime, ei) + '</div></div>' +
      '<div><div class="lbl">' + tE('Tier') + '</div><div class="big-num">' + E.eventTiersReached(ws) + ' / ' + D.EVENT_TIERS.length + '</div></div>' +
      '<div><div class="lbl">' + tE('Ends in') + '</div><div class="big-num">' + F.time(Math.max(0, win.end - E.now()) / 1000) + '</div></div></div></div>';
    body += tabs('eventRewards', [['tiers', tE('Rewards')], ['cards', tE('Collection')], ['next', tE('Coming up')]]);
    if (tab === 'tiers') {
      body += '<p class="panel-note">' + tE('Time Warps pay out on your current main world. Liberty Badges boost profit everywhere by +{n}% each, forever. Unclaimed rewards are sent to you when the event ends.', { n: Math.round(D.BADGE_BONUS * 100) }) + '</p>';
      body += D.EVENT_TIERS.map(function (tier, k) {
        var got = ws.eventClaimed[k], ready = ws.lifetime >= tier.at && !got;
        var pct = Math.min(100, Math.log10(Math.max(1, ws.lifetime)) / Math.log10(tier.at) * 100);
        return row('t' + k, tier.badge ? '🏅' : tier.card ? '🃏' : tier.warp ? '⏩' : '★', tE('Tier {n}', { n: k + 1 }) + ' — ' + money(tier.at, ei),
          tierLabel(tier) + (got ? '' : '<div class="bar"><i style="width:' + pct + '%"></i></div>'),
          got ? '<span class="btn blue ghost">' + tE('Claimed') + '</span>' : '<button class="btn gold" data-act="claimEvent" ' + (ready ? '' : 'disabled') + '>' + tE('Claim') + '</button>', got ? 'done' : '');
      }).join('');
    } else if (tab === 'cards' && L) {
      var set = w.cardSet, have = L.cardCount(S, set), size = L.setSize(set);
      body += '<p class="panel-note">' + tE('Earn this event\'s cards from reward tiers and missions. Each event card adds +{p}% profit on every main world. Finish the collection for ★{lb} and ×{m} profit whenever this event returns.', { p: Math.round(D.EVENT_CFG.cardBonus * 100), lb: D.EVENT_CFG.setCompleteLb, m: D.EVENT_CFG.setEventMult }) + '</p>';
      body += '<h3>' + esc(eventName()) + ' <span class="h3-sub">' + have + '/' + size + (have === size ? ' ✓' : '') + '</span></h3><div class="card-grid">';
      LD.CARDS.filter(function (c) { return c.set === set; }).forEach(function (c) { body += libCard(c); });
      body += '</div>';
    } else {
      body += '<p class="panel-note">' + tE('A new event starts every 3 days. Each one has its own businesses, Cabinet, missions and collection.') + '</p>';
      body += D.Events.upcoming(E.now(), 5).map(function (a, k) {
        var e = a.event, d = new Date(a.start);
        return row('n' + k, '<span class="biz-emoji sm">' + e.emoji + '</span>', esc(T(e.name)), esc(T(e.title)) + ' · ' + tE('starts in {t}', { t: F.duration((a.start - E.now()) / 1000) }),
          '<span class="small">' + d.toLocaleDateString(T('en-US'), { month: 'short', day: 'numeric' }) + '</span>');
      }).join('');
    }
    return { title: w.emoji + ' ' + esc(eventName()), sub: esc(worldTitle(ei)), body: body };
  };
  // Library card tile (shared with the Presidential Library panel).
  function libCard(c) {
    var own = !!S.live.cards[c.id];
    var art = c.emoji ? '<div class="lc-emoji">' + c.emoji + '</div>' : P.portrait(c.face, { uid: 'lc' + c.id, bg: c.accent || D.WORLDS[c.world].accent });
    return '<div class="lib-card ' + (own ? 'own' : 'missing') + '">' + (own ? art : '<div class="lc-q">?</div>') + '<div class="lc-name">' + (own ? esc(c.emoji ? T(c.name) : c.name) : '???') + '</div></div>';
  }

  PANELS.missions = function () {
    var wi = S.world, w = W();
    var act = E.activeMissions(S, wi), done = Object.keys(S.worlds[wi].missionsDone).length, total = w.missions.length;
    var body = '<p class="panel-note">' + tE('Complete missions to earn ★ Liberty Bucks. Three are active at a time.') + '</p>';
    body += '<div class="bar big"><i style="width:' + (done / total * 100) + '%"></i></div><p class="panel-note center">' + tE('{a} / {b} complete', { a: done, b: total }) + '</p>';
    body += act.map(function (m) {
      var prog = E.missionProgress(S, wi, m), ok = prog >= m.n;
      var icon = m.biz != null ? bizIcon(wi, m.biz) : { earn: '💰', income: '📈', angels: '🤝', promises: '🎗️', upgrades: '📜', elect: '🗳️', catch: '🪁', taps: '👆', tier: '🏅' }[m.kind] || '🇺🇸';
      var logKind = m.kind === 'earn' || m.kind === 'income' || m.kind === 'angels';
      var pct = logKind ? Math.min(100, Math.log10(Math.max(1, prog)) / Math.log10(m.n) * 100) : Math.min(100, prog / m.n * 100);
      var dbl = ok && root.Live && root.Live.adLeft(S, 'missionDouble') > 0;
      var prize = m.prize ? (m.prize.card ? ' + 🃏 ' + tE('Event card') : ' + ⏩ ' + tE('{d} warp', { d: F.duration(m.prize.warp) })) : '';
      return row(m.id, icon, esc(missionText(wi, m)), '★ ' + m.reward + prize + '<div class="bar"><i style="width:' + pct + '%"></i></div>',
        '<div class="btn-stack"><button class="btn ' + (ok ? 'gold' : '') + '" data-act="claimMission" data-id="' + m.id + '" ' + (ok ? '' : 'disabled') + '>' + (ok ? tE('Claim') : Math.floor(pct) + '%') + '</button>' +
        (dbl ? '<button class="btn blue sm" data-act="claimMissionDouble" data-id="' + m.id + '">' + (S.iap.founding ? '' : '▶ ') + tE('Claim ×2') + '</button>' : '') + '</div>');
    }).join('') || '<p class="panel-note">' + tE('Every mission complete. Legendary!') + '</p>';
    return { title: '🎯 ' + tE('Missions — {world}', { world: worldName(wi) }), sub: '', body: body };
  };

  PANELS.unlocks = function () {
    var w = W(), ws = WS(), wi = S.world;
    var tab = panelTab.unlocks || 'mile';
    var body = tabs('unlocks', [['mile', tE('Milestones')], ['ach', tE('Achievements')], ['global', tE('Global')]]);
    if (tab === 'mile') {
      var nam = E.nextAllMilestone(ws);
      body += row('all', '🇺🇸', tE('Every business'),
        (nam ? T('Own <b>{n}</b> of everything → all profit ×{m} (lowest: {lo})', { n: nam.at, m: nam.profit, lo: E.minOwned(ws) }) : tE('All complete!')) +
        (nam ? '<div class="bar"><i style="width:' + Math.min(100, E.minOwned(ws) / nam.at * 100) + '%"></i></div>' : ''), '<span class="btn blue ghost">×' + F.short(E.allMilestoneMult(ws)) + '</span>');
      body += w.businesses.map(function (b, i) {
        var bs = ws.biz[i], nm = E.nextMilestone(bs.owned), mm = E.milestoneMults(bs.owned);
        return row('b' + i, bizIcon(wi, i), tE('{biz} — {n} owned', { biz: bn(wi, i), n: bs.owned }),
          (nm ? T('At <b>{at}</b>: {what}', { at: nm.at, what: nm.speed ? T('speed ×{n}', { n: nm.speed }) : T('profit ×{n}', { n: nm.profit }) }) : tE('Maxed!')) + ' · ' + tE('current: speed ×{s}, profit ×{p}', { s: mm.speed, p: F.short(mm.profit) }) +
          (nm ? '<div class="bar"><i style="width:' + Math.min(100, bs.owned / nm.at * 100) + '%"></i></div>' : ''));
      }).join('');
    } else {
      var list = D.ACHIEVEMENTS.filter(function (a) { return tab === 'ach' ? a.world === wi : a.world == null; });
      var got = list.filter(function (a) { return S.achievements[a.id]; }).length;
      body += '<p class="panel-note">' + T('<b>{a} / {b}</b> unlocked. Each achievement pays out <b>★ Liberty Bucks</b>.', { a: got, b: list.length }) + '</p><div class="grid-ach">';
      body += list.map(function (a) {
        var tx = achText(a);
        return '<div class="ach ' + (S.achievements[a.id] ? 'got' : '') + '"><b>' + (S.achievements[a.id] ? '🏆 ' : '🔒 ') + esc(tx[0]) + '</b>' + esc(tx[1]) + '<div class="rw">★ ' + a.reward + '</div></div>';
      }).join('') + '</div>';
    }
    return { title: '🏆 ' + tE('Unlocks'), sub: tE('{a} / {b} achievements', { a: Object.keys(S.achievements).length, b: D.ACHIEVEMENTS.length }), body: body };
  };

  PANELS.store = function () {
    var tab = panelTab.store || 'items', wi = S.world;
    var body = tabs('store', [['items', tE('Freedom Store')], ['style', tE('Style')], ['lb', tE('Get Liberty Bucks')]]);
    body += '<div class="hero"><div class="row-icon hero-ic gold">★</div><div class="hero-stats"><div><div class="lbl">' + tE('Liberty Bucks') + '</div><div class="big-num">' + F.num(S.lb) + '</div></div>' +
      '<div><div class="lbl">' + tE('How to earn') + '</div><div class="small-strong">' + tE('Achievements, missions, daily rewards, events and the flying bonus.') + '</div></div></div></div>';
    if (tab === 'style' && root.LiveUI) {
      body += root.LiveUI.styleTab();
    } else if (tab === 'items') {
      body += D.STORE.map(function (it) {
        var price = E.storePrice(S, it), can = S.lb >= price, extra = '';
        if (it.warp) extra = ' · ' + tE('≈ {x} now', { x: money(E.incomePerSec(S, wi, true) * it.warp) });
        if (it.perm) extra = ' · ' + tE('current ×{n}', { n: F.short(S.permMult) });
        if (it.warp && !E.isMain(wi)) { can = false; extra = ' · <b>' + tE('Not available during events') + '</b>'; }
        if (E.storeOwned(S, it)) return row(it.id, it.icon, tE(it.name), tE(it.desc), '<span class="btn blue ghost">' + tE('Owned') + '</span>', 'done');
        return row(it.id, it.icon, tE(it.name), tE(it.desc) + extra, '<button class="btn gold" data-act="store" data-id="' + it.id + '" ' + (can ? '' : 'disabled') + '>★ ' + F.num(price) + '</button>');
      }).join('');
    } else {
      var ads = E.adsToday(S), freeLeft = D.AD_REWARDS.freelb.perDay - ads.freelb;
      body += row('free', '📺', tE('Free Liberty Bucks'), S.iap.founding ? tE('Founding Fathers get it free — {n} left today', { n: freeLeft }) : tE('Watch a short ad for ★{lb} — {n} left today', { lb: D.AD_REWARDS.freelb.lb, n: freeLeft }),
        '<button class="btn blue" data-act="freeLb" ' + (freeLeft > 0 ? '' : 'disabled') + '>' + (S.iap.founding ? '★ ' + D.AD_REWARDS.freelb.lb : '▶ ' + tE('Watch')) + '</button>');
      body += D.IAP.filter(function (p) { return !p.hidden; }).map(function (p) {
        var owned = p.type === 'nonconsumable' && S.iap.founding;
        var price = PL.price(p.id, p.fallbackPrice);
        var sub = p.desc ? tE(p.desc) : tE('{n} Liberty Bucks', { n: F.num(p.lb) }) + (p.tag ? ' · <b>' + tE(p.tag) + '</b>' : '');
        return row(p.id, p.icon, tE(p.name), sub, owned ? '<span class="btn blue ghost">' + tE('Owned') + '</span>' : '<button class="btn ' + (p.noAds ? 'red' : '') + '" data-act="iap" data-id="' + p.id + '">' + esc(price) + '</button>', p.noAds ? 'featured' : '');
      }).join('');
      if (PL.web) body += '<p class="panel-note small">' + tE('Purchases are made in the iPhone and iPad app. Everything else in the Freedom Store works right here.') + '</p>';
      else body += '<div class="dialog-actions"><button class="btn blue" data-act="restore">' + tE('Restore purchases') + '</button></div>';
      if (!PL.web) body += '<p class="panel-note small">' + tE(PL.android ? 'Purchases are processed by Google Play. Liberty Bucks are a virtual currency with no cash value.' : 'Purchases are processed by Apple. Liberty Bucks are a virtual currency with no cash value.') + (PL.storeAvailable() ? '' : ' ' + tE('(Store unavailable in this build — purchases are simulated.)')) + '</p>';
    }
    return { title: '🦅 ' + tE('Freedom Store'), sub: tE('Spend freedom, earn more freedom'), body: body };
  };

  PANELS.worlds = function () {
    var body = '<p class="panel-note">' + tE('Every world runs its own economy — and they all keep earning while you\'re away. Launching a new world grants the previous one a permanent ×{n} Colonial Tribute.', { n: D.TRIBUTE }) + '</p><div class="worlds-grid">';
    for (var wi = 0; wi < D.MAIN_WORLDS; wi++) {
      var w = D.WORLDS[wi], un = S.unlocked[wi], ws = S.worlds[wi], cur = wi === S.world, btn;
      if (cur) btn = '<span class="btn blue">' + tE('You are here') + '</span>';
      else if (un) btn = '<button class="btn" data-act="travel" data-w="' + wi + '">' + tE('Travel') + '</button>';
      else {
        var prev = D.WORLDS[wi - 1], pws = S.worlds[wi - 1];
        var ready = S.unlocked[wi - 1] && pws.cash >= prev.next.cost;
        btn = '<div class="small">' + tE(prev.next.label) + ' · ' + esc(wn(wi - 1)) + ': ' + F.money(prev.next.cost, prev.sym) + '</div>' +
          '<div class="bar"><i style="width:' + (S.unlocked[wi - 1] ? Math.min(100, Math.max(0, Math.log10(Math.max(1, pws.cash)) / Math.log10(prev.next.cost) * 100)) : 0) + '%"></i></div>' +
          '<button class="btn red" data-act="launch" data-w="' + (wi - 1) + '" ' + (ready ? '' : 'disabled') + '>🚀 ' + tE('Launch') + '</button>';
      }
      body += '<div class="world-card ' + (cur ? 'current ' : '') + (un ? '' : 'locked') + '"><div class="wimg" style="background-image:url(\'' + w.bg + '\')">' + (un ? '' : '<div class="lock">🔒</div>') + '</div>' +
        '<div class="winfo"><h3>' + (wi + 1) + '. ' + esc(wn(wi)) + '</h3><p>' + tE(w.title) + '</p>' +
        (un ? '<p>' + F.money(ws.cash, w.sym) + ' · ' + F.money(E.incomePerSec(S, wi, false), w.sym) + T('/sec') + (E.tributeMult(S, wi) > 1 ? ' · 👑×' + D.TRIBUTE : '') + '</p>' : '') +
        (w.mechanicName ? '<p class="mech-chip">✦ ' + tE(w.mechanicName) + '</p>' : '') + btn + '</div></div>';
    }
    body += '</div>';
    var win = E.eventWindow(E.now()), ei = D.EVENT_INDEX;
    var nx = D.Events.upcoming(E.now(), 1)[0];
    body += '<h3>🎉 ' + tE('Live Event') + '</h3>' + row('event', '<span class="biz-emoji sm">' + D.WORLDS[ei].emoji + '</span>', esc(eventName()),
      tE('Live now! Ends in {t}.', { t: F.time((win.end - E.now()) / 1000) }) + ' ' + tE('Rewards: ★, Time Warps, Library cards and Liberty Badges.') + (nx ? ' ' + tE('Next up: {e}', { e: nx.event.emoji + ' ' + T(nx.event.name) }) : ''),
      S.world === ei ? '<span class="btn blue">' + tE('You are here') + '</span>' : '<button class="btn gold" data-act="travel" data-w="' + ei + '">' + tE('Join') + '</button>', 'featured');
    var canConv = S.unlocked[D.CONVENTION.requires], amend = E.claimableAmendments(S);
    body += '<h3>📜 ' + tE('Constitutional Convention') + '</h3>' + row('conv', '📜', tE('Amendments: {n}', { n: S.amendments }) + ' · ×' + F.short(Math.pow(1 + D.CONVENTION.profitPer, S.amendments)),
      canConv ? T('Resets <b>every main world</b> — cash, businesses, upgrades and prestige currency — in exchange for Amendments. Each Amendment multiplies all profit by ×{p} and adds +{a}% prestige effectiveness, forever. Worlds stay unlocked.', { p: 1 + D.CONVENTION.profitPer, a: (D.CONVENTION.angelPer * 100).toFixed(1) }) : tE('Unlocks after you reach the Known Universe.'),
      '<button class="btn red" data-act="convention" ' + (amend > 0 ? '' : 'disabled') + '>' + (amend > 0 ? tE('Convene (+{n})', { n: amend }) : tE('Convene')) + '</button>');
    if (root.Extras && (S.amendments > 0 || S.conventions > 0)) {
      var pts = root.Extras.perkPoints(S);
      body += row('bor', '📜', tE('Bill of Rights'), tE('Spend Amendments on permanent perks. {n} point(s) to spend.', { n: pts }),
        '<button class="btn ' + (pts ? 'gold' : 'blue') + '" data-act="openPanel" data-panel="perks">' + tE('Open') + '</button>', pts ? 'featured' : '');
    }
    return { title: '🪐 ' + tE('Star Map'), sub: tE('From sea to shining star'), body: body };
  };

  PANELS.daily = function () {
    var st = E.dailyStatus(S);
    var body = '<p class="panel-note">' + tE('Log in every day to climb the 7-day reward ladder. Miss a day and the streak starts over.') + '</p><div class="daily-grid">';
    body += D.DAILY.map(function (r, k) {
      var claimedIdx = st.claimable ? st.index - 1 : st.index;
      var cls = k <= claimedIdx && st.streak > 0 ? 'got' : (st.claimable && k === st.index ? 'today' : '');
      return '<div class="day ' + cls + '"><div class="dn">' + tE('Day {n}', { n: k + 1 }) + '</div><div class="di">' + r.icon + '</div><div class="dr">' + dailyLabel(r) + '</div></div>';
    }).join('') + '</div>';
    var dd = st.claimable && root.Live && root.Live.adLeft(S, 'dailyDouble') > 0;
    body += '<div class="center-cta"><button class="btn gold big" data-act="claimDaily" ' + (st.claimable ? '' : 'disabled') + '>' + (st.claimable ? tE('Claim Day {n}', { n: st.index + 1 }) : tE('Come back tomorrow!')) + '</button>' +
      (dd ? ' <button class="btn blue big" data-act="claimDailyDouble">' + (S.iap.founding ? '' : '▶ ') + tE('Claim ×2') + '</button>' : '') +
      '<p class="panel-note center">' + tE('Current streak: {n} days', { n: st.streak }) + '</p></div>';
    return { title: '📅 ' + tE('Daily Reward'), sub: '', body: body };
  };
  function dailyLabel(r) {
    if (r.lb) return '★ ' + r.lb + (r.card ? ' + 🃏' : '');
    if (r.speech) return tE('×2 for 4h');
    if (r.warp) return tE('1h warp');
    if (r.rally) return tE('×10 for 15m');
    if (r.card) return '🃏';
    return '';
  }

  PANELS.more = function () {
    var items = [['unlocks', '🏆', 'Unlocks'], ['worlds', '🪐', 'Star Map'], ['daily', '📅', 'Daily Reward']];
    if (root.LiveUI) items = items.concat(root.LiveUI.moreItems());
    if (root.ExtrasUI) items = items.concat(root.ExtrasUI.moreItems());
    items.push(['settings', '⚙️', 'Settings']);
    var body = '<div class="more-grid">' + items.map(function (it) {
      var dot = (it[0] === 'daily' && E.dailyStatus(S).claimable) || (it[0] === 'worlds' && $('b-worlds').classList.contains('show')) || (root.LiveUI && root.LiveUI.dot(it[0])) || (root.ExtrasUI && root.ExtrasUI.dot(it[0]));
      return '<button class="more-item" data-act="openPanel" data-panel="' + it[0] + '"><span class="mi">' + it[1] + '</span><span>' + tE(it[2]) + '</span>' + (dot ? '<span class="badge show">!</span>' : '') + '</button>';
    }).join('') + '</div>';
    return { title: '☰ ' + tE('More'), sub: '', body: body };
  };

  PANELS.settings = function () {
    var st = S.stats, set = S.settings;
    function tog(k, label) { return '<div class="setting"><span>' + tE(label) + '</span><button class="toggle ' + (set[k] ? 'on' : '') + '" role="switch" aria-checked="' + !!set[k] + '" aria-label="' + tE(label) + '" data-act="toggle" data-k="' + k + '"></button></div>'; }
    function choice(k, label, opts) {
      return '<div class="setting"><span>' + tE(label) + '</span><div class="seg">' + opts.map(function (o) {
        return '<button class="' + (set[k] === o[0] ? 'on' : '') + '" aria-pressed="' + (set[k] === o[0]) + '" data-act="setChoice" data-k="' + k + '" data-v="' + o[0] + '">' + o[1] + '</button>';
      }).join('') + '</div></div>';
    }
    function slider(k, label) {
      return '<div class="setting"><span>' + tE(label) + '</span><input type="range" min="0" max="1" step="0.05" value="' + set[k] + '" aria-label="' + tE(label) + '" oninput="Game.act(\'volume\', {k: \'' + k + '\', v: this.value})"></div>';
    }
    var tracks = [['auto', tE('World theme')], ['march', tE('Earth march')], ['synth', tE('Solar synth')], ['arp', tE('Galactic arpeggio')], ['ambient', tE('Universal ambient')], ['multi', tE('Multiverse waltz')], ['fest', tE('Fest parade')]];
    var body = '<h3>' + tE('Sound & feel') + '</h3><div class="settings-grid">' + tog('sfx', 'Sound effects') + tog('music', 'Music') +
      slider('sfxVol', 'Effects volume') + slider('musicVol', 'Music volume') +
      '<div class="setting"><span>' + tE('Music on {world}', { world: worldName(S.world) }) + '</span><select aria-label="' + tE('Music track') + '" onchange="Game.act(\'setTrack\', {v: this.value})">' +
      tracks.map(function (x) { var cur = (set.tracks || {})[W().id] || 'auto'; return '<option value="' + x[0] + '"' + (cur === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></div>' +
      tog('haptics', 'Haptics') + '</div>';
    body += '<h3>' + tE('Display & help') + '</h3><div class="settings-grid">' +
      choice('numFormat', 'Big numbers', [['named', '1.2 ' + tE('million')], ['letters', '1.2M · 1.2aa'], ['sci', '1.2e6']]) +
      tog('bestBuy', 'Highlight the best buy') + tog('tips', 'Advisor tips') + tog('confirmElect', 'Confirm before Elections') + '</div>';
    body += '<h3>' + tE('Accessibility') + '</h3><div class="settings-grid">' +
      choice('textSize', 'Text size', [['s', 'A−'], ['m', 'A'], ['l', 'A+'], ['xl', 'A++']]) + tog('colorblind', 'Color-blind friendly') + tog('reduceMotion', 'Reduce motion') +
      choice('lang', 'Language', [['auto', tE('Auto')], ['en', 'English'], ['es', 'Español']]) + '</div>';
    body += '<h3>' + tE('Notifications') + '</h3><div class="settings-grid">' + tog('notifications', 'Reminders (speeches, daily, Space Race)') + tog('quietHours', 'Quiet hours (10 PM – 8 AM)') + '</div>';
    if (root.ExtrasUI) body += root.ExtrasUI.settingsSection();
    body += '<h3>' + tE('Privacy') + '</h3><div class="settings-grid">' + tog('analytics', 'Share anonymous usage stats') + '</div>' +
      '<p class="panel-note small">' + tE('Helps us find what to improve. No personal data, no advertising ID — just anonymous gameplay events.') + '</p>';
    body += '<h3>' + tE('Statistics') + '</h3><div class="stats-list">' +
      '<div>' + tE('Time played') + '</div><div>' + F.duration(st.playtime) + '</div>' +
      '<div>' + tE('Businesses tapped') + '</div><div>' + F.num(st.clicks) + '</div>' +
      '<div>' + tE('Sky bonuses caught') + '</div><div>' + F.num(st.catches) + '</div>' +
      '<div>' + tE('Stump speeches') + '</div><div>' + F.num(st.speeches) + '</div>' +
      '<div>' + tE('Missions completed') + '</div><div>' + F.num(st.missions) + '</div>' +
      '<div>' + tE('Login streak') + '</div><div>' + S.daily.streak + '</div>' +
      '<div>' + tE('Liberty Badges') + '</div><div>' + S.badges + '</div>' +
      '<div>' + tE('Amendments') + '</div><div>' + S.amendments + '</div>' +
      '<div>' + tE('Town Hall decisions') + '</div><div>' + F.num(st.decisions || 0) + '</div>' +
      '<div>' + tE('Debates won') + '</div><div>' + F.num(st.debatesWon || 0) + '</div>' +
      '<div>' + tE('Showdown bosses defeated') + '</div><div>' + F.num(st.bossKills || 0) + '</div>' +
      '<div>' + tE('Achievements') + '</div><div>' + Object.keys(S.achievements).length + ' / ' + D.ACHIEVEMENTS.length + '</div>' +
      D.WORLDS.map(function (w, wi) {
        if (w.event || !S.unlocked[wi]) return '';
        return '<div>' + tE('{world} all-time earnings', { world: wn(wi) }) + '</div><div>' + F.money(S.worlds[wi].lifetime, w.sym) + '</div>';
      }).join('') + '</div>';
    body += '<h3>' + tE('Save data') + '</h3><p class="panel-note">' + tE(PL.android ? 'Your empire autosaves on this device and is included in your Android backup. Export a backup code to move it manually.' : 'Your empire autosaves on this device and syncs to iCloud. Export a backup code to move it manually.') + '</p>' +
      '<textarea class="save" id="save-text" readonly aria-label="' + tE('Save code') + '">' + (panelTab.settings_save || '') + '</textarea>' +
      '<div class="dialog-actions"><button class="btn blue" data-act="export">' + tE('Export') + '</button><button class="btn" data-act="import">' + tE('Import') + '</button><button class="btn red" data-act="hardReset">' + tE('Reset everything') + '</button></div>';
    if (root.ExtrasUI) body += root.ExtrasUI.backupsSection();
    body += '<h3>' + tE('About') + '</h3><div class="dialog-actions left"><button class="btn blue" data-act="privacy">' + tE('Privacy policy') + '</button><button class="btn blue" data-act="restore">' + tE('Restore purchases') + '</button>' +
      (PL.native ? '<button class="btn blue" data-act="adPrivacy">' + tE('Ad privacy choices') + '</button>' : '') + '<button class="btn blue" data-act="tutorialRestart">' + tE('Replay tutorial') + '</button></div>' +
      '<p class="panel-note small">' + tE('Star-Spangled Tycoon {v} — a parody idle game. All politicians depicted are historical figures or fictional characters, drawn as cartoon caricatures with parody names. No endorsement is implied.', { v: esc((root.BUILD && root.BUILD.version) || '') }) + '</p>';
    return { title: '⚙️ ' + tE('Settings'), sub: '', body: body };
  };

  // ---------- Dialogs ----------
  function advisorDialog(face, who, text, actions, opts) {
    opts = opts || {};
    var h = (opts.title ? head(opts.title, opts.sub) : '') + '<div class="modal-body"><div class="advisor"><div class="face" aria-hidden="true">' + P.portrait(face, { uid: 'adv' + Math.random().toString(36).slice(2, 7), bg: W().accent, talking: opts.talking }) + '</div>' +
      '<div class="bubble"><div class="who">' + esc(who) + '</div>' + text + (opts.extra || '') + '</div></div>' +
      '<div class="dialog-actions">' + (actions || '<button class="btn big" data-act="close">' + tE('Got it!') + '</button>') + '</div></div>';
    var wrap = modal(h, 'small', opts.onClose);
    if (opts.sticky) wrap._sticky = true;
    return wrap;
  }

  root.UI = {
    init: init, setState: setState, applySettings: applySettings, renderWorld: renderWorld, renderBuyMode: renderBuyMode, frame: frame, update: update,
    open: open, refreshPanel: refreshPanel, setTab: setTab, closeTop: closeTop, closeAll: closeAll, anyModal: anyModal, modal: modal, head: head,
    advisorDialog: advisorDialog, cards: function () { return cards; }, panelTab: panelTab, isOpen: function () { return openPanel && openPanel.name; },
    PANELS: PANELS, row: row, tabs: tabs, bizIcon: bizIcon, libCard: libCard, tierLabel: tierLabel, eventName: eventName, missionText: missionText, state: function () { return S; },
    esc: esc, tE: tE, money: money, bn: bn, wn: wn, worldName: worldName, worldTitle: worldTitle, achText: achText, treatyLabel: treatyLabel, dailyLabel: dailyLabel, upgName: upgName
  };
})(typeof window !== 'undefined' ? window : globalThis);
