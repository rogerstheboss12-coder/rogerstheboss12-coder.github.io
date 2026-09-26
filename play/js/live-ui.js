/* UI + actions for the live-ops systems: hub chips, Liberty Pass, Space Race, Executive Orders,
 * Presidential Library, Style (cosmetics) tab, limited-time offers and extra rewarded ads.
 * main.js merges ACTIONS into its action table and calls hooks from the game loop. */
(function (root) {
  'use strict';
  var D = root.GameData, E = root.Engine, F = root.Fmt, P = root.Portraits, T = root.T, PL = root.Platform, L = root.Live, LD = D.LIVE;
  var UI = root.UI, FX = root.FX, A = root.GameAudio;
  var ctx = null;          // { withRewardedAd, save, onPurchase }
  var lastHub = null, lastIntro = 0, pick = null;

  function S() { return UI.state(); }
  function esc(s) { return UI.esc(s); }
  function tE(s, v) { return UI.tE(s, v); }
  function money(n, wi) { return UI.money(n, wi); }
  function row(k, i, t, s, b, c) { return UI.row(k, i, t, s, b, c); }
  function mainWi() { var s = S(); return s.world < D.MAIN_WORLDS ? s.world : 0; }
  function init(c) { ctx = c; }

  // ---------- Labels ----------
  function rewardLabel(r) {
    var out = [];
    if (r.lb) out.push('★ ' + r.lb);
    if (r.speech) out.push('🎤 ' + tE('×2 for {h}h', { h: r.speech }));
    if (r.warp) out.push('⏩ ' + tE('{d} warp', { d: F.duration(r.warp) }));
    if (r.rally) out.push('📣 ' + tE('×10 for 15m'));
    if (r.card) out.push('🃏 ' + (r.card > 1 ? tE('{n} Library cards', { n: r.card }) : tE('Library card')));
    if (r.cosmetic) {
      var id = r.cosmetic === 'season' ? L.seasonInfo().exclusive : r.cosmetic, c = L.cosmetic(id);
      out.push('🎨 ' + (c ? tE(c.name) : ''));
    }
    return out.join(' + ');
  }
  function orderEffect(card) {
    var ty = L.orderType(card.type), wi = mainWi();
    if (!ty) return '';
    var v = { biz: card.biz != null ? esc(UI.bn(wi, card.biz)) : '', biz2: card.biz2 != null ? esc(UI.bn(wi, card.biz2)) : '', n: card.biz != null ? card.biz + 1 : '' };
    switch (ty.id) {
      case 'holiday': return T('<b>{biz}</b> profit ×4 (business #{n} on every world)', v);
      case 'lowfive': return tE('Businesses 1–5: profit ×2');
      case 'highfive': return tE('Businesses 6–10: profit ×2');
      case 'speech': return tE('Stump Speeches last 6 hours');
      case 'sky': return tE('Sky bonuses pay ×3');
      case 'townhall': return tE('Town Hall cash pays ×3; treaties and decision boosts last twice as long');
      case 'flare': return tE('Solar Flares last twice as long, at ×8 speed');
      case 'infra': return tE('Every business runs 25% faster');
      case 'buyam': return tE('Every business is 15% cheaper');
      case 'charter': return tE('Colonial Tribute doubled (×10)');
      case 'loop': return tE('Temporal Loops charge twice as fast');
      case 'stimulus': return tE('+50% ★ from missions');
      case 'newdeal': return T('<b>{biz}</b> profit ×10, but <b>{biz2}</b> profit ×½', v);
      case 'mandate': return tE('All profit ×1.5');
    }
    return '';
  }
  function tagName(tag) { return { econ: T('Economy'), space: T('Space'), liberty: T('Liberty'), unity: T('Unity') }[tag]; }
  function orderCard(card, extra, cls) {
    var ty = L.orderType(card.type);
    return '<div class="order-card ' + ty.rarity + ' ' + (cls || '') + '"><div class="oc-top"><span class="oc-tag">' + LD.ORDER_TAGS[ty.tag] + ' ' + esc(tagName(ty.tag)) + '</span><span class="oc-rar">' + tE(ty.rarity === 'common' ? 'Common' : ty.rarity === 'rare' ? 'Rare' : 'Legendary') + '</span></div>' +
      '<div class="oc-name">📜 ' + tE(ty.name) + '</div><div class="oc-fx">' + orderEffect(card) + '</div>' + (extra || '') + '</div>';
  }

  // ---------- Hub chips ----------
  function chip(act, panel, icon, text, cls) {
    return '<button class="hub-chip ' + (cls || '') + '" data-act="' + act + '"' + (panel ? ' data-panel="' + panel + '"' : '') + '><span>' + icon + '</span>' + text + '</button>';
  }
  function updateHub() {
    var s = S(), el = document.getElementById('hub');
    if (!el || !s) return;
    var t = E.now(), h = '';
    if (s.tutorial.done) {
      var off = L.activeOffer(s, t);
      if (off) h += chip('openOffer', '', off.def.icon, tE(off.def.name) + ' · ' + F.time((off.until - t) / 1000), 'offer');
      if (L.unlocked(s, 'pass')) {
        var pc = L.passClaimable(s);
        h += chip('openPanel', 'pass', '✪', tE('Pass {a}/{b}', { a: L.passTier(s), b: LD.SEASON.tiers }), pc ? 'dot' : '');
      }
      if (L.unlocked(s, 'race') && s.live.race.week) {
        var me = s.live.race.rp, rv = L.rivalRP(s, t);
        h += chip('openPanel', 'race', '🚀', (me >= rv ? tE('Ahead by {n}', { n: me - rv }) : tE('Behind by {n}', { n: rv - me })), (s.live.race.pending ? 'dot ' : '') + (me >= rv ? 'good' : 'bad'));
      }
      if (L.unlocked(s, 'orders')) h += chip('openPanel', 'orders', '📜', tE('Orders'), L.orderReady(s, t) ? 'dot' : '');
      var dn = L.donationReady(s, t);
      if (dn.ready) h += chip('donation', '', '💝', tE('Donation'), 'gift');
      if (root.ExtrasUI) h += root.ExtrasUI.hubChips(t);
      if (L.cardCount(s) > 0) h += chip('openPanel', 'library', '🃏', L.cardCount(s) + '/' + LD.CARDS.length, '');
    }
    if (h !== lastHub) { el.innerHTML = h; lastHub = h; el.classList.toggle('show', !!h); }
  }
  function moreItems() {
    var s = S(), out = [];
    if (L.unlocked(s, 'pass')) out.push(['pass', '✪', 'Liberty Pass']);
    if (L.unlocked(s, 'race')) out.push(['race', '🚀', 'Space Race']);
    if (L.unlocked(s, 'orders')) out.push(['orders', '📜', 'Executive Orders']);
    out.push(['library', '🏛️', 'Presidential Library']);
    return out;
  }
  function dot(panel) {
    var s = S();
    if (panel === 'pass') return L.unlocked(s, 'pass') && L.passClaimable(s) > 0;
    if (panel === 'race') return !!s.live.race.pending;
    if (panel === 'orders') return L.orderReady(s);
    return false;
  }
  function dotCount() { return ['pass', 'race', 'orders'].filter(dot).length; }
  function navBadges(badge) {
    badge('b-pass', dot('pass') ? 1 : 0, '!');
    badge('b-race', dot('race') ? 1 : 0, '!');
    badge('b-orders', dot('orders') ? 1 : 0, '!');
    var s = S();
    ['pass', 'race', 'orders'].forEach(function (k) {
      var b = document.getElementById('nav-' + k);
      if (b) b.style.display = L.unlocked(s, k) ? '' : 'none';
    });
  }

  // ---------- Cosmetics ----------
  var SKIN_VARS = ['--blue', '--blue-d', '--red', '--red-d', '--gold', '--gold-d', '--gold-l'];
  function applyCosmetics() {
    var s = S(), cs = s.live.cosmetics, root_ = document.documentElement, th = L.cosmetic(cs.theme);
    // Event themes (#35) are generated from the event's own colors.
    if (th && th.palette) {
      var p = th.palette;
      root_.dataset.skin = 'event';
      [p.mid, p.dark, p.hi, shade(p.hi, 0.6), p.accent, shade(p.accent, 0.7), shade(p.accent, 1.35)].forEach(function (v, k) { root_.style.setProperty(SKIN_VARS[k], v); });
    } else {
      SKIN_VARS.forEach(function (k) { root_.style.removeProperty(k); });
      root_.dataset.skin = (cs.theme || 'theme_classic').replace('theme_', '');
    }
    var host = document.getElementById('businesses');
    if (host) host.dataset.frame = (cs.frame || '').replace('frame_', '');
    if (P.look !== (cs.look || '')) { P.look = cs.look || ''; }
  }
  function shade(hex, f) {
    var n = parseInt(String(hex).slice(1), 16);
    if (isNaN(n)) return hex;
    var c = [n >> 16, (n >> 8) & 255, n & 255].map(function (x) { return Math.max(0, Math.min(255, Math.round(f < 1 ? x * f : x + (255 - x) * (f - 1)))); });
    return '#' + ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2]).toString(16).slice(1);
  }
  function styleTab() {
    var s = S(), cs = s.live.cosmetics, body = '<p class="panel-note">' + tE('Style is purely cosmetic — it never changes your profits. Buy with ★ Liberty Bucks, or earn exclusives from the Liberty Pass and special bundles.') + '</p>';
    [['theme', 'Themes'], ['frame', 'Icon Frames'], ['look', 'Cabinet Looks']].forEach(function (grp) {
      body += '<h3>' + tE(grp[1]) + '</h3><div class="style-grid">';
      LD.COSMETICS.filter(function (c) { return c.kind === grp[0] && !c.event; }).forEach(function (c) {
        var owned = !!cs.owned[c.id], on = cs[c.kind] === c.id, prev;
        if (c.kind === 'theme') prev = '<div class="sw">' + c.swatch.map(function (col) { return '<i style="background:' + col + '"></i>'; }).join('') + '</div>';
        else if (c.kind === 'frame') prev = '<div class="fr-prev" data-frame="' + c.id.replace('frame_', '') + '"><div class="fr-ic"><img src="assets/icons/w1_b1.png" alt=""></div></div>';
        else prev = '<div class="lk-prev">' + P.portrait('washington', { uid: 'lk' + c.id, look: c.id, bg: '#1f3a93' }) + '</div>';
        var btn;
        if (on) btn = c.kind === 'theme' ? '<span class="btn blue ghost">' + tE('Equipped') + '</span>' : '<button class="btn blue" data-act="equipCosmetic" data-id="' + c.id + '">' + tE('Unequip') + '</button>';
        else if (owned) btn = '<button class="btn blue" data-act="equipCosmetic" data-id="' + c.id + '">' + tE('Equip') + '</button>';
        else if (c.exclusive) btn = '<span class="btn ghost excl">🔒 ' + tE(c.exclusive) + '</span>';
        else btn = '<button class="btn gold" data-act="buyCosmetic" data-id="' + c.id + '" ' + (s.lb >= c.cost ? '' : 'disabled') + '>★ ' + c.cost + '</button>';
        body += '<div class="style-item ' + (on ? 'on' : '') + '">' + prev + '<div class="st-name">' + tE(c.name) + '</div>' + btn + '</div>';
      });
      body += '</div>';
    });
    // Event themes: earned at an event's final reward tier.
    var evThemes = LD.COSMETICS.filter(function (c) { return c.event; }), owned = evThemes.filter(function (c) { return cs.owned[c.id]; });
    body += '<h3>' + tE('Event Themes') + ' <span class="h3-sub">' + owned.length + '/' + evThemes.length + '</span></h3><p class="panel-note small">' + tE('Reach an event\'s final reward tier to earn its theme.') + '</p><div class="style-grid">';
    body += owned.map(function (c) {
      var on = cs.theme === c.id;
      return '<div class="style-item ' + (on ? 'on' : '') + '"><div class="sw">' + c.swatch.map(function (col) { return '<i style="background:' + col + '"></i>'; }).join('') + '</div><div class="st-name">' + c.emoji + ' ' + tE(c.name) + '</div>' +
        (on ? '<span class="btn blue ghost">' + tE('Equipped') + '</span>' : '<button class="btn blue" data-act="equipCosmetic" data-id="' + c.id + '">' + tE('Equip') + '</button>') + '</div>';
    }).join('') + (owned.length ? '' : '<p class="panel-note">' + tE('None yet — every event has one to win.') + '</p>') + '</div>';
    return body;
  }

  // ---------- Panels ----------
  var PANELS = UI.PANELS;

  PANELS.pass = function () {
    var s = S(), t = E.now(), si = L.seasonInfo(t), p = s.live.pass, tier = L.passTier(s), per = LD.SEASON.xpPerTier;
    var into = tier >= LD.SEASON.tiers ? (p.xp - LD.SEASON.tiers * per) % LD.SEASON.bonusXp : p.xp - tier * per;
    var need = tier >= LD.SEASON.tiers ? LD.SEASON.bonusXp : per;
    var left = (si.end - t) / 1000, claim = L.passClaimable(s), excl = L.cosmetic(si.exclusive);
    var body = '<div class="hero pass-hero"><div class="row-icon hero-ic gold">✪</div><div class="hero-stats">' +
      '<div><div class="lbl">' + tE('Tier') + '</div><div class="big-num">' + tier + ' / ' + LD.SEASON.tiers + '</div></div>' +
      '<div><div class="lbl">' + tE('Season ends in') + '</div><div class="big-num">' + F.duration(left) + '</div></div>' +
      '<div><div class="lbl">' + tE('Next tier') + '</div><div class="small-strong">' + F.num(into) + ' / ' + F.num(need) + ' XP</div><div class="bar"><i style="width:' + Math.min(100, into / need * 100) + '%"></i></div></div></div></div>';
    if (!p.premium) {
      body += '<div class="pass-upsell"><div><b>' + tE('Premium Pass') + '</b> — ' + tE('unlocks a second reward on every tier: {lb} ★ in total, Time Warps, Mega Rallies and the season-exclusive {x}. Rewards for tiers you\'ve already reached are granted instantly.', { lb: LD.PASS_PREMIUM_LB, x: excl ? T(excl.name) : '' }) + '</div>' +
        (left < 3 * 86400 ? '<div class="warn">' + tE('Only {d} left this season — premium applies to the current season only.', { d: F.duration(left) }) + '</div>' : '') +
        '<button class="btn red big" data-act="iap" data-id="' + LD.PASS_PRODUCT + '">' + tE('Unlock Premium') + '<small>' + esc(PL.price(LD.PASS_PRODUCT, '$4.99')) + '</small></button></div>';
    } else body += '<p class="panel-note center">⭐ ' + tE('Premium Pass active — thank you, Patriot!') + '</p>';
    body += '<div class="toolbar"><p class="panel-note">' + tE('Earn XP from missions, daily rewards, speeches, sky bonuses, orders and more.') + '</p><button class="btn gold" data-act="claimPass" ' + (claim ? '' : 'disabled') + '>' + tE('Claim all ({n})', { n: claim }) + '</button></div>';
    body += '<div class="pass-track"><div class="pt-head"><span>' + tE('Tier') + '</span><span>' + tE('Free') + '</span><span>⭐ ' + tE('Premium') + '</span></div>';
    for (var k = 0; k < LD.SEASON.tiers; k++) {
      var reached = k < tier;
      var fcls = p.free[k] ? 'got' : reached ? 'ready' : '', pcls = p.prem[k] ? 'got' : reached && p.premium ? 'ready' : (p.premium ? '' : 'locked');
      body += '<div class="pt-row ' + (reached ? 'reached' : '') + '"><span class="pt-n">' + (k + 1) + '</span><span class="pt-cell ' + fcls + '">' + rewardLabel(LD.passTrack(k, false)) + '</span><span class="pt-cell prem ' + pcls + '">' + rewardLabel(LD.passTrack(k, true)) + '</span></div>';
    }
    body += '</div><p class="panel-note small">' + tE('After tier {n}, every {x} XP earns ★{lb}.', { n: LD.SEASON.tiers, x: F.num(LD.SEASON.bonusXp), lb: LD.SEASON.bonusLb }) + '</p>';
    return { title: '✪ ' + tE('Liberty Pass'), sub: tE(si.name), body: body };
  };

  PANELS.race = function () {
    var s = S(), t = E.now(), r = s.live.race, wk = L.weekInfo(t), rival = LD.RIVALS[r.rival], lg = LD.LEAGUES[r.league];
    var body = '';
    if (r.pending) body += raceResultHtml(r.pending);
    var rv = L.rivalRP(s, t), tgt = Math.round(L.raceTarget(s)), max = Math.max(tgt, r.rp, rv, 1);
    body += '<div class="hero race-hero"><div class="row-icon hero-ic rival-face">' + P.portrait(rival.face, { uid: 'rv', bg: '#5a1f2a' }) + '</div><div class="hero-stats">' +
      '<div><div class="lbl">' + tE('This week\'s rival') + '</div><div class="small-strong">' + tE(rival.name) + '</div><div class="panel-note small">' + esc(rival.leader) + ' — “' + tE(rival.motto) + '”</div></div>' +
      '<div><div class="lbl">' + tE('League') + '</div><div class="big-num">' + lg.icon + '</div><div class="small-strong">' + tE(lg.name) + '</div></div>' +
      '<div><div class="lbl">' + tE('Ends in') + '</div><div class="big-num">' + F.duration((wk.end - t) / 1000) + '</div></div></div></div>';
    var stations = LD.STATIONS.map(function (st, k) { return '<span class="st" style="left:' + (k / (LD.STATIONS.length - 1) * 100) + '%" title="' + tE(st) + '"></span>'; }).join('');
    body += '<div class="race-track">' + stations +
      '<div class="lane you"><span class="lane-lbl">🇺🇸 ' + tE('You') + ' · ' + F.num(r.rp) + '</span><span class="rocket" style="left:' + Math.min(100, r.rp / max * 100) + '%">🚀</span></div>' +
      '<div class="lane rival"><span class="lane-lbl">' + esc(rival.leader) + ' · ' + F.num(rv) + '</span><span class="rocket" style="left:' + Math.min(100, rv / max * 100) + '%">🛸</span></div>' +
      '<div class="race-stations"><span>' + tE(LD.STATIONS[0]) + '</span><span>' + tE(LD.STATIONS[LD.STATIONS.length - 1]) + '</span></div></div>';
    body += '<p class="panel-note center">' + (r.rp >= rv ? tE('You\'re ahead! Keep it up to win {w} this week.', { w: rewardLabel(lg.win) }) : tE('The rival is ahead. Win this week for {w}.', { w: rewardLabel(lg.win) })) + ' ' + tE('Winning promotes you to the next league.') + '</p>';
    body += '<h3>' + tE('Earn race points') + '</h3><div class="rp-grid">' + [
      ['📅', 'Daily reward', LD.RP.daily], ['🎯', 'Mission', LD.RP.mission], ['🎤', 'Stump Speech', LD.RP.speech], ['🦅', 'Sky bonus', LD.RP.catch],
      ['✦', 'World event (decision, flare, treaty, loop, anchor)', LD.RP.mechanic], ['⚡', 'Business milestone', LD.RP.milestone], ['🎩', 'Hire a manager', LD.RP.hire],
      ['📜', 'Executive Order', LD.RP.order], ['🗳️', 'Election', LD.RP.election], ['🚀', 'Launch a world', LD.RP.launch]
    ].map(function (x) { return '<div><span>' + x[0] + ' ' + tE(x[1]) + '</span><b>+' + x[2] + '</b></div>'; }).join('') + '</div>';
    body += '<h3>' + tE('Leagues') + '</h3>' + LD.LEAGUES.map(function (l, k) {
      return row('lg' + k, l.icon, tE(l.name) + (k === r.league ? ' · <b>' + tE('you are here') + '</b>' : ''), tE('Win: {w}', { w: rewardLabel(l.win) }) + ' · ' + tE('Lose: {w}', { w: rewardLabel(l.lose) }), '', k === r.league ? 'featured' : '');
    }).join('');
    return { title: '🚀 ' + tE('Space Race'), sub: tE('A new rival every Monday'), body: body };
  };
  function raceResultHtml(p) {
    var rival = LD.RIVALS[p.rivalIdx];
    return '<div class="race-result ' + (p.won ? 'won' : 'lost') + '"><div class="rr-title">' + (p.won ? '🏆 ' + tE('Victory!') : '🚀 ' + tE('So close!')) + '</div>' +
      '<p>' + (p.won ? tE('You beat {r} {a} to {b}.', { r: rival.leader, a: F.num(p.my), b: F.num(p.rival) }) : tE('{r} won {b} to {a}.', { r: rival.leader, a: F.num(p.my), b: F.num(p.rival) })) +
      (p.leagueAfter !== p.league ? ' ' + tE('New league: {l}', { l: T(LD.LEAGUES[p.leagueAfter].name) }) : '') + '</p>' +
      '<button class="btn gold big" data-act="claimRace">' + tE('Claim {w}', { w: rewardLabel(p.reward) }) + '</button></div>';
  }

  PANELS.orders = function () {
    var s = S(), t = E.now(), o = L.ordersToday(s, t), syn = L.synergy(o.slots);
    var body = '<p class="panel-note">' + tE('Sign one Executive Order per day. Up to {n} stay in effect on the four main worlds until you replace them. Matching planks earn bonuses!', { n: LD.ORDER_SLOTS }) + '</p>';
    body += '<div class="syn-bar">' + ['econ', 'space', 'liberty'].map(function (k) { return '<span class="syn ' + (syn.counts[k] >= 3 ? 'on' : '') + '">' + LD.ORDER_TAGS[k] + ' ' + esc(tagName(k)) + ' ×' + syn.counts[k] + '</span>'; }).join('') +
      '<span class="syn-total">' + tE('Plank bonus: all profit ×{m}', { m: F.short(syn.mult) }) + '</span></div>';
    body += '<p class="panel-note small">' + tE('3 of a plank: ×{a} · all 5: ×{b} · one of each: ×{c}', { a: LD.ORDER_SYNERGY.three, b: LD.ORDER_SYNERGY.five, c: LD.ORDER_SYNERGY.unity }) + '</p>';
    body += '<h3>' + tE('In effect ({a}/{b})', { a: o.slots.length, b: LD.ORDER_SLOTS }) + '</h3><div class="order-grid">';
    for (var k = 0; k < LD.ORDER_SLOTS; k++) {
      var c = o.slots[k];
      if (pick != null && c) body += orderCard(c, '<button class="btn red sm" data-act="replaceOrder" data-slot="' + k + '">' + tE('Replace') + '</button>', 'pickable');
      else body += c ? orderCard(c) : '<div class="order-card empty">' + tE('Empty slot') + '</div>';
    }
    body += '</div>';
    if (pick != null) body += '<div class="center-cta"><p class="panel-note">' + tE('All slots are full — choose an order to replace.') + '</p><button class="btn blue" data-act="cancelPick">' + tE('Cancel') + '</button></div>';
    body += '<h3>' + tE('Today\'s draft') + '</h3>';
    if (o.drafted) {
      var next = new Date(t); next.setHours(24, 0, 0, 0);
      body += '<p class="panel-note center">' + tE('Signed! A new draft arrives in {t}.', { t: F.time((next.getTime() - t) / 1000) }) + '</p>';
    } else {
      body += '<div class="order-grid draft">' + o.offer.map(function (c, k2) {
        return orderCard(c, '<button class="btn gold" data-act="draftOrder" data-k="' + k2 + '">' + tE('Sign') + ' ✍️</button>', pick === k2 ? 'picked' : '');
      }).join('') + '</div>';
      if (L.adLeft(s, 'reroll') > 0) body += '<div class="center-cta"><button class="btn blue" data-act="rerollOrders">' + (s.iap.founding ? '' : '▶ ') + tE('New draft') + '</button></div>';
    }
    return { title: '📜 ' + tE('Executive Orders'), sub: tE('Signed {n} orders', { n: o.total }), body: body };
  };

  PANELS.library = function () {
    var s = S(), total = L.cardCount(s), tab = UI.panelTab.library || 'cabinet';
    var body = '<div class="hero"><div class="row-icon hero-ic">🏛️</div><div class="hero-stats"><div><div class="lbl">' + tE('Collected') + '</div><div class="big-num">' + total + ' / ' + LD.CARDS.length + '</div></div>' +
      '<div><div class="lbl">' + tE('How to earn cards') + '</div><div class="small-strong">' + tE('Every 5th mission, day 7 of the login ladder, Space Race results, the free Liberty Pass track — and event tiers and missions for event collections. Cards are never sold.') + '</div></div></div></div>';
    body += UI.tabs('library', [['cabinet', tE('Cabinets & Landmarks')], ['events', tE('Event Collections')]]);
    if (tab === 'events') {
      var evSets = LD.CARD_SETS.filter(function (set) { return set.eventSet; }), done = Object.keys(s.live.events.setsDone).length;
      body += '<p class="panel-note">' + tE('Each event card: +{p}% profit on every main world. A finished collection pays ★{lb} and doubles that event\'s profit whenever it returns. Collections completed: {a}/{b}.',
        { p: Math.round(D.EVENT_CFG.cardBonus * 100), lb: D.EVENT_CFG.setCompleteLb, a: done, b: evSets.length }) + '</p>';
      var cur = D.WORLDS[D.EVENT_INDEX].cardSet;
      evSets.slice().sort(function (a, b) { return (b.id === cur) - (a.id === cur); }).forEach(function (set) {
        var have = L.cardCount(s, set.id), size = L.setSize(set.id), ev = D.Events.eventDef(set.event);
        body += '<h3>' + (ev ? ev.emoji + ' ' : '') + tE(set.name) + ' <span class="h3-sub">' + have + '/' + size + (have === size ? ' ✓' : '') + (set.id === cur ? ' · ' + tE('live now') : '') + '</span></h3><div class="card-grid">';
        LD.CARDS.filter(function (c) { return c.set === set.id; }).forEach(function (c) { body += UI.libCard(c); });
        body += '</div>';
      });
    } else {
      LD.CARD_SETS.forEach(function (set) {
        if (set.eventSet) return;
        var have = L.cardCount(s, set.id), size = L.setSize(set.id), bonus;
        if (set.id === 'landmarks') bonus = tE('Each: +{p}% profit on every main world · complete: ×{m}', { p: set.perCard * 100, m: set.complete });
        else bonus = tE('Each: +{p}% {world} profit · complete: ×{m}', { p: set.perCard * 100, world: UI.wn(set.world), m: set.complete });
        body += '<h3>' + tE(set.name) + ' <span class="h3-sub">' + have + '/' + size + (have === size ? ' ✓' : '') + '</span></h3><p class="panel-note small">' + bonus + '</p><div class="card-grid">';
        LD.CARDS.filter(function (c) { return c.set === set.id; }).forEach(function (c) { body += UI.libCard(c); });
        body += '</div>';
      });
    }
    return { title: '🏛️ ' + tE('Presidential Library'), sub: tE('Collect the Cabinet, complete the sets'), body: body };
  };

  // ---------- Offers ----------
  function showOffer() {
    var s = S(), off = L.activeOffer(s, E.now());
    if (!off) return;
    var d = off.def, cos = d.cosmetic ? L.cosmetic(d.cosmetic) : null;
    UI.modal(UI.head(d.icon + ' ' + tE(d.name), tE('Limited time · ends in {t}', { t: F.time((off.until - E.now()) / 1000) })) +
      '<div class="modal-body center"><div class="offer-hero"><div class="offer-value">' + tE('{x}× the Liberty Bucks per dollar', { x: L.offerValue(d) }) + '</div>' +
      '<div class="offer-lb">★ ' + F.num(d.lb) + '</div><div class="panel-note">' + tE('Liberty Bucks') + '</div>' +
      (cos ? '<div class="offer-extra">🎨 ' + tE('+ exclusive {kind}: {name}', { kind: T(cos.kind === 'theme' ? 'theme' : 'icon frame'), name: T(cos.name) }) + '</div>' : '') + '</div>' +
      '<p class="panel-note small">' + tE('Compared with the ★100 pack. One purchase per player; this offer won\'t come back.') + '</p>' +
      '<div class="dialog-actions"><button class="btn blue" data-act="close">' + tE('No thanks') + '</button><button class="btn red big" data-act="iap" data-id="' + d.product + '">' + esc(PL.price(d.product, '$' + d.price)) + '</button></div></div>', 'small');
    if (root.Analytics) root.Analytics.track('offer_view', { id: d.id });
  }

  // ---------- Intros for newly unlocked features ----------
  var INTROS = [
    { id: 'orders', face: 'hamilton', who: 'Alexander Hamiltoon', text: 'Mr. President, your pen awaits! Each day you may sign one <b>Executive Order</b> from a draft of three. Keep up to five in effect — and match their planks for bonus profit.', panel: 'orders' },
    { id: 'race', face: 'rival_duke', who: 'Archduke Beige', text: 'Hah! You call that a space program? Every week a rival power races you to the stars. Earn <b>race points</b> by playing — missions, speeches, milestones — and beat us by Monday for rewards and a league promotion.', panel: 'race' },
    { id: 'pass', face: 'franklin', who: 'Ben Franklite', text: 'A penny saved is a Liberty Pass tier earned! Everything you do now earns <b>Pass XP</b>. Climb 30 tiers each season for Liberty Bucks, boosts and Library cards.', panel: 'pass' },
    { id: 'library', face: 'washington', who: 'George Washingtun', text: 'You earned your first <b>Presidential Library</b> card! Collect the whole Cabinet of a world to multiply its profits.', panel: 'library', when: function (s) { return L.cardCount(s) > 0; } }
  ];
  function checkIntros() {
    var s = S(), t = Date.now();
    if (UI.anyModal() || document.querySelector('.cine') || t - lastIntro < 45000) return false;
    for (var k = 0; k < INTROS.length; k++) {
      var it = INTROS[k];
      if (s.live.seen[it.id]) continue;
      if (it.when ? !it.when(s) : !L.unlocked(s, it.id)) continue;
      s.live.seen[it.id] = true; lastIntro = t;
      UI.advisorDialog(it.face, it.who, T(it.text), '<button class="btn blue" data-act="close">' + tE('Later') + '</button><button class="btn big" data-act="openPanel" data-panel="' + it.panel + '">' + tE('Show me') + '</button>', { talking: true, title: '✨ ' + tE('New!') });
      return true;
    }
    return false;
  }

  // ---------- Game-loop hooks ----------
  var queuedOffer = false, queuedRace = false;
  function onEvents(evs) {
    evs.forEach(function (e) {
      if (e.type === 'offer') queuedOffer = true;
      if (e.type === 'raceResult') queuedRace = true;
      if (e.type === 'season') FX.toast('✪', T('A new Liberty Pass season!'), tE(e.info.name));
    });
  }
  function slowTick() {
    var s = S();
    onEvents(L.update(s, E.now()));
    if (UI.anyModal() || document.querySelector('.cine') || (root.Tutorial && root.Tutorial.active())) return;
    if (queuedRace && s.live.race.pending) { queuedRace = false; UI.open('race'); return; }
    if (queuedOffer) { queuedOffer = false; if (L.activeOffer(s)) { showOffer(); return; } }
    checkIntros();
  }
  function queueOffer() { queuedOffer = true; }
  function boot() { onEvents(L.update(S(), E.now())); }

  // Called by main.js after actions: awards XP/RP and grants cards every 5th mission.
  function award(kind, n) {
    var s = S();
    L.award(s, kind, n);
    if (root.Extras) root.Extras.award(s, kind, n, E.now());
    if (kind === 'mission' && s.stats.missions % 5 === 0) grantCardsToast(1);
  }
  function grantCardsToast(n) {
    var got = L.grantCards(S(), n);
    announceCards(got);
    return got;
  }
  function announceCards(ids) {
    if (!ids || !ids.length) return;
    var c = L.card(ids[0]);
    FX.toast('🃏', ids.length === 1 ? T('Library card: {name}', { name: c.emoji ? T(c.name) : c.name }) : T('{n} Library cards!', { n: ids.length }), tE('Open the Presidential Library to see your collection.'), { minor: true });
  }

  // ---------- Actions ----------
  var ACTIONS = {
    openOffer: function () { showOffer(); },
    claimPass: function () {
      var r = L.claimPass(S(), E.now());
      if (!r.n) return;
      A.play('fanfare', 0.8); root.Platform.haptic('success');
      FX.confetti(innerWidth / 2, innerHeight / 2, 90);
      FX.toast('✪', T('Pass rewards claimed!'), (r.lb ? '★' + r.lb : '') + (r.gain ? ' · +' + money(r.gain, r.world) : ''));
      announceCards(r.cards);
      if (L.passTier(S()) >= 10) root.Game.review('passTier10');
      applyCosmetics(); UI.refreshPanel(true); ctx.save(true);
    },
    draftOrder: function (d) {
      var s = S(), k = +d.k, o = L.ordersToday(s);
      if (o.slots.length >= LD.ORDER_SLOTS) { pick = k; UI.refreshPanel(true); return; }
      if (!L.draftOrder(s, k, -1, E.now())) return;
      signed();
    },
    replaceOrder: function (d) {
      if (pick == null) return;
      if (!L.draftOrder(S(), pick, +d.slot, E.now())) return;
      pick = null; signed();
    },
    cancelPick: function () { pick = null; UI.refreshPanel(true); },
    rerollOrders: function () {
      var s = S();
      if (L.adLeft(s, 'reroll') <= 0) return;
      ctx.withRewardedAd('reroll', function () { if (L.useAd(s, 'reroll')) { L.rerollOrders(s, E.now()); A.play('stamp', 0.6); UI.refreshPanel(true); } });
    },
    claimRace: function () {
      var r = L.claimRace(S(), E.now());
      if (!r) return;
      A.play(r.won ? 'cheer' : 'achieve', 0.9); root.Platform.haptic('success');
      if (r.won) root.Game.review('raceWin');
      FX.confetti(innerWidth / 2, innerHeight / 2, r.won ? 160 : 50);
      FX.toast(r.won ? '🏆' : '🚀', r.won ? T('Space Race won!') : T('Race rewards'), (r.lb ? '★' + r.lb : ''));
      announceCards(r.cards);
      UI.refreshPanel(true); ctx.save(true);
    },
    donation: function () {
      var s = S();
      if (!L.donationReady(s).ready) return;
      ctx.withRewardedAd('donation', function () {
        var r = L.claimDonation(s, E.now());
        if (!r) return;
        A.play('cash', 1); root.Platform.haptic('success');
        FX.coins(innerWidth / 2, innerHeight / 2, 24);
        FX.toast('💝', T('Campaign donation!'), '+' + money(r.gain, r.world) + ' · ★' + r.lb);
        ctx.save();
      });
    },
    buyCosmetic: function (d) {
      if (!L.buyCosmetic(S(), d.id)) return;
      A.play('achieve', 0.7); root.Platform.haptic('success');
      restyle(); ctx.save(true);
    },
    equipCosmetic: function (d) { if (L.equip(S(), d.id)) { A.play('click', 0.6); restyle(); } }
  };
  function signed() {
    A.play('stamp', 1); root.Platform.haptic('success');
    FX.confetti(innerWidth / 2, innerHeight / 3, 60);
    FX.toast('📜', T('Executive Order signed!'), T('It takes effect immediately.'), { minor: true });
    UI.refreshPanel(true); ctx.save(true);
  }
  function restyle() {
    applyCosmetics();
    UI.renderWorld(); // re-draw portraits with the new look
    UI.refreshPanel(true);
  }

  root.LiveUI = {
    init: init, updateHub: updateHub, moreItems: moreItems, dot: dot, dotCount: dotCount, navBadges: navBadges,
    applyCosmetics: applyCosmetics, styleTab: styleTab, showOffer: showOffer, queueOffer: queueOffer,
    slowTick: slowTick, boot: boot, award: award, grantCardsToast: grantCardsToast, announceCards: announceCards, rewardLabel: rewardLabel,
    ACTIONS: ACTIONS
  };
})(typeof window !== 'undefined' ? window : globalThis);
