/* Game controller: loop, actions, persistence, world mechanics, monetization and flows. */
(function (root) {
  'use strict';
  var D = root.GameData, E = root.Engine, F = root.Fmt, UI = root.UI, FX = root.FX, A = root.GameAudio, P = root.Portraits,
    PL = root.Platform, AN = root.Analytics, TU = root.Tutorial, T = root.T, I18N = root.I18N, LV = root.Live, LVU = root.LiveUI,
    X = root.Extras, XU = root.ExtrasUI;
  var DEV = !!(root.BUILD && root.BUILD.dev);
  // Dev only: '#dev-timer' drives the loop with timers so it keeps running in a hidden tab (testing).
  var raf = DEV && /timer/.test(root.location ? location.hash : '') ? function (cb) { return setTimeout(function () { cb(performance.now()); }, 50); } : function (cb) { return requestAnimationFrame(cb); };
  var S;
  var resetting = false;

  var SPEECH_LINES = [
    'My fellow Americans…', 'Four more years! Four more years!', 'I promise lower taxes AND more fireworks!',
    'A chicken in every pot, and a rocket in every garage!', 'Ask not what your galaxy can do for you…',
    'We choose to go to the Moon — and also the gift shop!', 'Speak softly and carry a big rocket!',
    'Tear down this… asteroid!', 'The only thing we have to fear is running out of eagles!',
    'The buck stops… at the space station!', 'Four score and seven light-years ago…', 'I cannot tell a lie: profits are up!',
    'God bless America — and every planet near it!'
  ];

  function save(force) {
    if (resetting || !S) return;
    PL.writeSave(E.serialize(S), force);
  }

  function W() { return D.WORLDS[S.world]; }
  // Music for a world: the player's pick for it (#49) or the world's own theme.
  function themeFor(w) { var pick = S.settings.tracks && S.settings.tracks[w.id]; return pick && pick !== 'auto' ? pick : w.theme; }
  function shake(big) {
    var app = document.getElementById('app');
    if (!app || document.documentElement.classList.contains('reduce-motion')) return;
    app.classList.remove('shake', 'shake-big'); void app.offsetWidth; app.classList.add(big ? 'shake-big' : 'shake');
    setTimeout(function () { app.classList.remove('shake', 'shake-big'); }, 700);
  }
  function WS() { return S.worlds[S.world]; }
  function money(n, wi) { return F.money(n, D.WORLDS[wi == null ? S.world : wi].sym); }
  var esc = function (s) { return UI.esc(s); }, tE = function (s, v) { return UI.tE(s, v); };

  // ---------------- Actions ----------------
  var ACT = {};
  ACT.close = function () { UI.closeTop(); };
  ACT.tab = function (d) { UI.setTab(d.panel, d.tab); };
  ACT.openPanel = function (d) { UI.open(d.panel); };

  ACT.tap = function (d) {
    var i = +d.i, bs = WS().biz[i];
    if (!bs.owned) return;
    S.stats.clicks++;
    if (E.startRun(S, S.world, i)) { A.play('click', 0.5, 40); PL.haptic('light'); }
    var c = UI.cards()[i];
    if (c && !document.documentElement.classList.contains('reduce-motion')) c.icon.animate([{ transform: 'scale(0.9)' }, { transform: 'scale(1)' }], { duration: 160 });
  };

  ACT.buy = function (d, el) {
    var i = +d.i, wi = S.world, bs = WS().biz[i];
    var q = bs.owned === 0 ? 1 : E.buyQty(S, wi, i, S.settings.buyMode);
    var beforeM = E.milestoneMults(bs.owned), beforeAll = E.allMilestoneMult(WS()), beforeTier = E.frameTier(bs.owned);
    var cashBefore = WS().cash, cost = E.costFor(S, wi, i, q);
    var r = E.buy(S, wi, i, q);
    if (!r) return;
    var p = FX.rectCenter(el), big = q >= 100 || cost >= cashBefore * 0.5;
    FX.coins(p.x, p.y, big ? 22 : Math.min(12, 4 + Math.floor(Math.log10(q + 1) * 4)));
    A.play('cash', big ? 0.9 : 0.55, 60); PL.haptic(big ? 'medium' : 'light');
    if (big) FX.bump(document.getElementById('cash-box'));
    if (r.before === 0) {
      FX.confetti(p.x, p.y, 30);
      UI.update();
    }
    var afterM = E.milestoneMults(WS().biz[i].owned), afterAll = E.allMilestoneMult(WS());
    if (afterM.speed > beforeM.speed || afterM.profit > beforeM.profit) {
      var ic = FX.rectCenter(UI.cards()[i].icon);
      FX.confetti(ic.x, ic.y, 40);
      A.play('fanfare', 0.5, 500); PL.haptic('medium');
      var what = afterM.speed > beforeM.speed ? T('speed ×{n}', { n: afterM.speed / beforeM.speed }) : T('profit ×{n}', { n: afterM.profit / beforeM.profit });
      FX.floatText(ic.x - 30, ic.y - 20, what + '!', '#f5c518');
      LVU.award('milestone');
    }
    if (E.frameTier(WS().biz[i].owned) !== beforeTier) {
      var fc = FX.rectCenter(UI.cards()[i].icon);
      FX.floatText(fc.x - 30, fc.y + 10, '🏅 ' + T(E.frameTier(WS().biz[i].owned)), '#f5c518');
    }
    if (afterAll > beforeAll) {
      FX.confetti(innerWidth / 2, innerHeight / 3, 80);
      A.play('fanfare', 0.7); PL.haptic('heavy');
      FX.toast('🇺🇸', T('E Pluribus Profit!'), tE('Every business at {n}: all profit ×{m}', { n: E.minOwned(WS()), m: afterAll / beforeAll }));
    }
  };

  ACT.hire = function (d, el) {
    var i = +d.i;
    if (!E.hireManager(S, S.world, i)) return;
    A.play('stamp', 0.8); PL.haptic('medium');
    FX.toast('🎩', T('{name} hired!', { name: W().managers[i].name }), tE('Now running {biz} automatically.', { biz: UI.bn(S.world, i) }), { minor: true });
    if (el) { var p = FX.rectCenter(el); FX.confetti(p.x, p.y, 25); }
    AN.track('hire', { w: S.world, i: i });
    LVU.award('hire');
    UI.refreshPanel(true);
  };
  ACT.chief = function (d) {
    var i = +d.i;
    if (!E.hireChief(S, S.world, i)) return;
    A.play('fanfare', 0.6); PL.haptic('medium');
    FX.toast('🏛️', T('Cabinet Secretary appointed'), tE('{biz} is now 90% cheaper.', { biz: UI.bn(S.world, i) }), { minor: true });
    UI.refreshPanel(true);
  };
  ACT.buyUpgrade = function (d, el) {
    if (!E.buyUpgrade(S, S.world, d.id)) return;
    LVU.award('upgrade');
    A.play('stamp', 0.7); PL.haptic('light');
    if (el) { var p = FX.rectCenter(el); FX.coins(p.x, p.y, 8); }
    UI.refreshPanel(true);
  };
  ACT.buyAllUpgrades = function () {
    var n = 0;
    W().cashUpgrades.forEach(function (u) { if (!WS().upgrades[u.id] && E.buyUpgrade(S, S.world, u.id)) n++; });
    if (n) LVU.award('upgrade', n);
    if (n) { A.play('stamp', 0.8); PL.haptic('medium'); FX.toast('📜', T('{n} bills passed!', { n: n }), T('Profits multiplied.'), { minor: true }); }
    UI.refreshPanel(true);
  };
  ACT.buyAngel = function (d) {
    if (!E.buyAngelUpgrade(S, S.world, d.id)) return;
    A.play('fanfare', 0.5); PL.haptic('medium');
    UI.refreshPanel(true);
  };

  ACT.elect = function () {
    var w = W(), wi = S.world, ws = WS(), gain = E.claimableAngels(S, wi);
    if (gain <= 0) return;
    if (S.settings.confirmElect === false) { ACT.electConfirm(); return; }
    var m = w.managers[0], eff = E.angelEffect(S, wi);
    var owned = ws.biz.reduce(function (n, b) { return n + b.owned; }, 0), mgrs = ws.biz.filter(function (b) { return b.manager; }).length;
    var now = ws.angels * eff, after = (ws.angels + gain) * eff, ratio = (1 + after) / (1 + now);
    var li = function (a, b) { return '<li><span>' + a + '</span><b>' + b + '</b></li>'; };
    var preview = '<div class="preview-grid"><div class="pv lose"><h4>🔄 ' + tE('Resets') + '</h4><ul>' +
      li(tE('Cash'), money(ws.cash)) + li(tE('Businesses'), F.num(owned)) + li(tE('Managers'), mgrs) + li(tE('Bills'), Object.keys(ws.upgrades).length) + '</ul></div>' +
      '<div class="pv keep"><h4>✅ ' + tE('You keep') + '</h4><ul><li>' + tE('All-time earnings and {p}', { p: T(w.prestigeShort) }) + '</li><li>' + tE('Campaign Promises, missions and achievements') + '</li><li>' + tE('Every other world, ★ and cards') + '</li></ul></div></div>' +
      '<div class="payoff good">' + T('+{n} {p}: profit bonus <b>+{a}%</b> → <b>+{b}%</b> — ×{r} profit on {world}', { n: F.num(gain), p: esc(T(w.prestigeShort)), a: F.num(now * 100), b: F.num(after * 100), r: ratio < 100 ? ratio.toFixed(2) : F.short(ratio), world: esc(UI.wn(wi)) }) + '</div>' +
      '<label class="dont-ask"><input type="checkbox" id="elect-noask"> ' + tE('Don\'t ask again (change in Settings)') + '</label>';
    UI.advisorDialog(m.face, m.name, T('Ready to <b>{verb}</b>? The campaign never stops!', { verb: esc(T(w.prestigeVerb)) }),
      '<button class="btn blue" data-act="close">' + tE('Not yet') + '</button><button class="btn red big" data-act="electConfirm">🗳️ ' + tE('Vote!') + '</button>', { title: '🗳️ ' + tE('Election Day'), talking: true, extra: preview });
  };
  ACT.electConfirm = function () {
    var box = document.getElementById('elect-noask');
    if (box && box.checked) S.settings.confirmElect = false;
    var wi = S.world;
    if (XU) XU.snapshot('election');
    var gain = E.holdElection(S, wi);
    UI.closeAll();
    if (!gain) return;
    A.play('cheer', 0.8); A.play('fanfare', 0.6); PL.haptic('heavy');
    shake(true);
    FX.confetti(innerWidth / 2, innerHeight / 2, 160);
    UI.renderWorld();
    FX.toast('🗳️', T('Landslide victory!'), '+' + F.num(gain) + ' ' + tE(W().prestigeName));
    AN.track('election', { w: wi, gain: gain, n: WS().elections });
    webBreak('election');
    LVU.award('election');
    save(true);
  };

  ACT.convention = function () {
    var gain = E.claimableAmendments(S);
    if (gain <= 0) return;
    UI.advisorDialog('unclesam', 'Cosmic Uncle Sam', T('A Constitutional Convention will <b>reset every main world</b> — cash, businesses, upgrades, managers and prestige currency. In return you ratify <b>+{n} Amendments</b>: ×{m} profit everywhere, forever. Liberty Bucks, badges, achievements and purchases are kept.',
      { n: gain, m: F.short(Math.pow(1 + D.CONVENTION.profitPer, S.amendments + gain) / Math.pow(1 + D.CONVENTION.profitPer, S.amendments)) }),
      '<button class="btn blue" data-act="close">' + tE('Not yet') + '</button><button class="btn red big" data-act="conventionConfirm">📜 ' + tE('Ratify') + '</button>', { title: '📜 ' + tE('Constitutional Convention'), talking: true });
  };
  ACT.conventionConfirm = function () {
    if (XU) XU.snapshot('convention');
    var gain = E.holdConvention(S);
    UI.closeAll();
    if (!gain) return;
    A.play('fanfare', 1); A.play('cheer', 0.8); PL.haptic('heavy');
    shake(true);
    FX.confetti(innerWidth / 2, innerHeight / 2, 200);
    travel(0);
    FX.toast('📜', T('Amendments ratified!'), T('+{n} Amendments — all profit ×{m}', { n: gain, m: F.short(Math.pow(1 + D.CONVENTION.profitPer, S.amendments)) }));
    AN.track('convention', { gain: gain, total: S.amendments });
    LVU.award('convention');
    maybeReview('convention');
    save(true);
  };

  ACT.store = function (d) {
    var r = E.buyStore(S, d.id);
    if (!r) return;
    A.play('achieve', 0.7); PL.haptic('success');
    var it = r.item;
    if (it.warp) FX.toast('⏩', T('Time warp!'), T('Collected {x}.', { x: money(r.gain) }));
    else if (it.rally) FX.toast('📣', T('Mega Rally!'), T('×10 profit for 15 minutes.'));
    else if (it.perm) FX.toast('🦅', T('Freedom Multiplier'), T('All profit now ×{n} forever.', { n: F.short(S.permMult) }));
    FX.confetti(innerWidth / 2, innerHeight / 2, 50);
    AN.track('store', { id: it.id });
    UI.refreshPanel(true);
    save(true);
  };

  ACT.travel = function (d) { if (PL.demo && +d.w > 0 && E.isMain(+d.w)) { root.DemoUI.prompt('world'); return; } travel(+d.w); UI.closeAll(); webBreak('travel'); };
  ACT.launch = function (d) {
    var from = +d.w;
    if (PL.demo) { root.DemoUI.prompt('world'); return; }
    if (!E.launchNext(S, from)) return;
    UI.closeAll();
    save(true);
    var fw = D.WORLDS[from], tw = D.WORLDS[from + 1];
    A.play('launch', 1); PL.haptic('heavy');
    AN.track('launch', { to: from + 1 });
    LVU.award('launch');
    FX.launch('assets/icons/rocket.png', T('Leaving {world}', { world: UI.wn(from) }), T('Destination: {world}', { world: UI.wn(from + 1) }),
      T('Welcome to {world}', { world: UI.wn(from + 1) }), T(tw.title), function () {
        travel(from + 1, true);
        A.play('cheer', 0.8);
        FX.toast('👑', T('Colonial Tribute!'), T('{world} now earns ×{n} forever.', { world: UI.wn(from), n: D.TRIBUTE }));
        maybeReview('launch');
      });
  };

  ACT.toggle = function (d) {
    var k = d.k;
    S.settings[k] = !S.settings[k];
    if (k === 'sfx') A.setSfx(S.settings.sfx);
    if (k === 'music') { A.setMusic(S.settings.music); if (S.settings.music) A.playTheme(themeFor(W())); }
    if (k === 'analytics') AN.setEnabled(S.settings.analytics);
    if (k === 'notifications' && S.settings.notifications) {
      PL.requestNotifications().then(function (ok) {
        if (!ok && PL.native) { S.settings.notifications = false; FX.toast('🔕', T('Notifications are off'), T('Enable them for Star-Spangled Tycoon in iOS Settings.')); }
        UI.refreshPanel(true);
      });
    }
    UI.applySettings();
    UI.refreshPanel(true);
  };
  ACT.setChoice = function (d) {
    S.settings[d.k] = d.v;
    if (d.k === 'lang' || d.k === 'numFormat') { I18N.setLang(S.settings.lang); UI.applySettings(); UI.renderWorld(); }
    UI.applySettings();
    UI.refreshPanel(true);
  };
  ACT.volume = function (d) {
    var k = d.k === 'musicVol' ? 'musicVol' : 'sfxVol';
    S.settings[k] = +d.v;
    if (k === 'musicVol') A.setMusicVolume(S.settings.musicVol); else A.setVolume(S.settings.sfxVol);
  };
  ACT.setTrack = function (d) {
    S.settings.tracks = S.settings.tracks || {};
    S.settings.tracks[W().id] = d.v;
    A.playTheme(themeFor(W()));
  };
  ACT.upgFilter = function (d) { UI.panelTab.upgFilter = d.f || 'all'; UI.refreshPanel(true); };
  ACT.setAuto = function (d) {
    if (!X.setAuto(S, d.kind, S.world, d.on === '1')) return;
    A.play('click', 0.6); PL.haptic('light');
    if (d.on === '1') runAuto(S.world);
    UI.refreshPanel(true);
  };
  ACT.tips = function () { showTip(); };
  ACT.export = function () {
    var code = btoa(unescape(encodeURIComponent(E.serialize(S))));
    UI.panelTab.settings_save = code;
    UI.refreshPanel(true);
    var ta = document.getElementById('save-text');
    if (ta) { ta.select(); try { navigator.clipboard.writeText(code); FX.toast('💾', T('Save exported'), T('Copied to clipboard.')); } catch (e) {} }
  };
  ACT.import = function () {
    UI.modal(UI.head('📥 ' + tE('Import save'), tE('Paste an exported save code')) + '<div class="modal-body"><textarea class="save" id="import-text" aria-label="' + tE('Save code') + '"></textarea>' +
      '<div class="dialog-actions"><button class="btn blue" data-act="close">' + tE('Cancel') + '</button><button class="btn" data-act="importConfirm">' + tE('Load save') + '</button></div></div>', 'small');
  };
  ACT.importConfirm = function () {
    var t = document.getElementById('import-text');
    try {
      var json = decodeURIComponent(escape(atob(t.value.trim())));
      var ns = E.deserialize(json);
      if (XU) XU.snapshot('import');
      PL.writeSave(E.serialize(ns), true);
      resetting = true;
      location.reload();
    } catch (e) { FX.toast('⚠️', T('Import failed'), T('That code doesn\'t look like a save.')); }
  };
  ACT.hardReset = function () {
    UI.modal(UI.head('⚠️ ' + tE('Reset everything?'), tE('This cannot be undone')) + '<div class="modal-body"><p>' + tE(PL.android ? 'All worlds, Liberty Bucks and achievements on this device will be erased. Purchases can be restored.' : 'All worlds, Liberty Bucks and achievements on this device and in iCloud will be erased. Purchases can be restored.') + '</p><div class="dialog-actions"><button class="btn blue" data-act="close">' + tE('Keep playing') + '</button><button class="btn red" data-act="hardResetConfirm">' + tE('Erase my empire') + '</button></div></div>', 'small');
  };
  ACT.hardResetConfirm = function () {
    resetting = true;
    PL.clearSave();
    setTimeout(function () { location.reload(); }, 300);
  };
  ACT.speech = function () { startSpeech(); };
  ACT.privacy = function () {
    UI.modal(UI.head('🔒 ' + tE('Privacy policy'), '') + '<div class="modal-body"><iframe class="privacy-frame" src="privacy.html" title="' + tE('Privacy policy') + '"></iframe></div>');
  };
  ACT.adPrivacy = function () { PL.showAdPrivacyOptions(); };
  ACT.tutorialSkip = function () { TU.finish(); };
  ACT.tutorialRestart = function () { UI.closeAll(); TU.restart(); };

  // World mechanics
  ACT.flare = function (d, el, ev) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    if (E.extendFlare(S, E.now())) { LVU.award('mechanic'); A.play('achieve', 0.5); PL.haptic('medium'); FX.toast('☀️', T('Flare extended!'), T('+30 seconds of ×5 speed.'), { minor: true }); }
  };
  ACT.openTreaty = function () { openTreaty(); };
  ACT.signTreaty = function (d) {
    if (!pendingTreaty) return;
    var offer = pendingTreaty.offers[+d.k];
    E.signTreaty(S, offer, E.now());
    pendingTreaty = null;
    UI.closeAll();
    A.play('stamp', 0.9); PL.haptic('success');
    FX.toast('🤝', T('Treaty signed!'), UI.treatyLabel(offer) + ' · ' + T('10 minutes'), { minor: true });
    AN.track('treaty', { key: offer.key });
    LVU.award('mechanic');
  };
  ACT.openAnchor = function () {
    var wi = D.ANCHOR.world, ws = S.worlds[wi], w = D.WORLDS[wi];
    var btns = w.businesses.map(function (b, i) {
      if (!ws.biz[i].owned) return '';
      var on = ws.anchor && ws.anchor.biz === i;
      return '<button class="btn ' + (on ? 'blue ghost' : 'gold') + ' anchor-btn" data-act="setAnchor" data-i="' + i + '" ' + (on ? 'disabled' : '') + '>' + UI.bizIcon(wi, i) + '<span>' + esc(UI.bn(wi, i)) + (on ? ' ⚓' : '') + '</span></button>';
    }).join('');
    UI.advisorDialog(w.managers[0].face, w.managers[0].name, T('Which business should we anchor across every reality? Its profit grows ×1 every {m} minutes, up to ×{x}. {warn}',
      { m: D.ANCHOR.stepMin, x: D.ANCHOR.max * LV.hookField(S, 'anchorMax'), warn: ws.anchor ? T('Moving the anchor starts the growth over.') : '' }), '<div class="anchor-grid">' + btns + '</div>', { title: '⚓ ' + tE('Reality Anchor'), talking: true });
  };
  ACT.setAnchor = function (d) {
    if (!E.setAnchor(S, +d.i, E.now())) return;
    UI.closeAll();
    A.play('stamp', 0.9); PL.haptic('success');
    FX.toast('⚓', T('Reality anchored!'), T('{biz} will grow up to ×{x}.', { biz: UI.bn(D.ANCHOR.world, +d.i), x: D.ANCHOR.max * LV.hookField(S, 'anchorMax') }), { minor: true });
    AN.track('anchor', { i: +d.i });
    LVU.award('mechanic');
    save();
  };
  ACT.useLoop = function () {
    var gain = E.useLoop(S);
    if (!gain && gain !== 0) return;
    LVU.award('mechanic');
    A.play('achieve', 0.8); PL.haptic('heavy');
    FX.confetti(innerWidth / 2, innerHeight / 3, 60);
    FX.toast('⟲', T('Temporal Loop!'), T('Replayed 30 minutes: +{x}', { x: money(gain, 3) }));
  };
  // Town Hall: a citizen brings a dilemma; each answer has a different effect.
  ACT.openDecision = function () {
    if (!pendingDecision) return;
    var c = pendingDecision.card, m = D.WORLDS[0].managers[pendingDecision.face];
    var opt = function (k, o) {
      return '<button class="btn ' + (k ? 'blue' : 'gold') + ' big decide-btn" data-act="decide" data-k="' + k + '">' + tE(o[0]) + '<small>' + esc(XU.decisionLabel(o[1])) + '</small></button>';
    };
    UI.advisorDialog(m.face, m.name, '<b>' + tE('Town Hall') + ':</b> ' + tE(c.q), opt(0, c.a) + opt(1, c.b), { title: '🏛️ ' + tE('A citizen needs a decision'), talking: true });
  };
  ACT.decide = function (d) {
    if (!pendingDecision) return;
    var card = pendingDecision.card;
    pendingDecision = null;
    UI.closeAll();
    var r = X.decide(S, card, +d.k, E.now());
    if (!r) return;
    LVU.award('mechanic');
    A.play('stamp', 0.9); PL.haptic('success');
    var parts = [];
    if (r.gain) parts.push('+' + money(r.gain, 0));
    if (r.lb) parts.push('★' + r.lb);
    if (r.speech) parts.push('🎤 +' + F.duration(r.speech * 60));
    if (r.buff) parts.push(XU.decisionLabel({ buff: r.buff }));
    FX.toast('🏛️', T('The people have spoken!'), esc(parts.join(' · ')), { minor: true });
    if (r.gain) { FX.coins(innerWidth / 2, innerHeight / 3, 16); FX.bump(document.getElementById('cash-box')); }
    if (r.sky) setTimeout(spawnCatch, 600);
    AN.track('decision', { k: +d.k });
  };
  function eventGainText(g) {
    var parts = [];
    if (g.lb) parts.push('★' + g.lb);
    if (g.gain) parts.push('⏩ +' + money(g.gain, g.world));
    if (g.cards && g.cards.length) parts.push('🃏 ×' + g.cards.length);
    if (g.badges) parts.push('🏅 ×' + g.badges + ' ' + T('Liberty Badge'));
    return parts.join(' · ');
  }
  function announceSets(ids) {
    (ids || []).forEach(function (id) {
      var set = D.LIVE.CARD_SETS.filter(function (x) { return x.id === id; })[0];
      if (set) FX.toast('🏛️', T('Collection complete!'), T('{name}: +★{lb}, and ×{m} profit whenever this event returns.', { name: T(set.name), lb: D.EVENT_CFG.setCompleteLb, m: D.EVENT_CFG.setEventMult }));
    });
  }
  ACT.claimEvent = function () {
    var g = E.claimEventTiers(S);
    if (!g.n) return;
    A.play('fanfare', 0.9); PL.haptic('success');
    FX.confetti(innerWidth / 2, innerHeight / 2, 100);
    FX.toast(W().emoji || '🎉', T('Event rewards claimed!'), eventGainText(g));
    AN.track('event_tier', { n: g.n, badges: S.badges, ev: S.worlds[D.EVENT_INDEX].eventId });
    LVU.award('eventTier', g.n);
    LVU.announceCards(g.cards);
    announceSets(g.completed);
    UI.refreshPanel(true); save(true);
  };
  ACT.claimMission = function (d, el, ev, double) {
    var full = E.claimMissionFull(S, S.world, d.id);
    if (!full) return;
    var r = full.lb;
    if (full.prize) {
      var pz = full.prize;
      if (pz.gain) FX.toast('⏩', T('Time Warp!'), T('Collected {x}.', { x: money(pz.gain, pz.world) }), { minor: true });
      LVU.announceCards(pz.cards);
      announceSets(pz.completed);
    }
    if (double) S.lb += r;
    A.play('achieve', 0.7); PL.haptic('success');
    if (el && el.isConnected) { var p = FX.rectCenter(el); FX.confetti(p.x, p.y, 30); FX.floatText(p.x, p.y, '+★' + r * (double ? 2 : 1), '#f5c518'); }
    else if (double) FX.toast('★', T('Doubled!'), '+★' + r * 2, { minor: true });
    AN.track('mission', { id: d.id, double: !!double });
    LVU.award('mission');
    UI.refreshPanel(true);
  };
  ACT.claimMissionDouble = function (d, el) {
    if (LV.adLeft(S, 'missionDouble') <= 0) return;
    withRewardedAd('missionDouble', function () { if (LV.useAd(S, 'missionDouble')) ACT.claimMission(d, el, null, true); });
  };
  ACT.claimDaily = function (d, el, ev, double) {
    var t = E.now(), r = E.claimDaily(S, t);
    if (!r) return;
    if (double) { // grant the same reward a second time
      var rw = r.reward;
      if (rw.lb) S.lb += rw.lb;
      if (rw.speech) S.speechUntil = Math.min(Math.max(S.speechUntil, t) + rw.speech * 1000, t + 24 * 3600 * 1000);
      if (rw.rally) S.rallyUntil = Math.max(S.rallyUntil, t) + rw.rally * 1000;
      if (rw.warp) r.gain += E.simulateAway(S, rw.warp, S.world)[S.world];
      if (rw.card) r.cards = r.cards.concat(LV.grantCards(S, rw.card));
    }
    A.play('fanfare', 0.8); PL.haptic('success');
    FX.confetti(innerWidth / 2, innerHeight / 2, 90);
    FX.toast(r.reward.icon, T('Day {n} reward!', { n: r.day }) + (double ? ' ×2' : ''), UI.dailyLabel(r.reward) + (r.gain ? ' · +' + money(r.gain) : ''));
    LVU.announceCards(r.cards);
    AN.track('daily', { day: r.day, streak: S.daily.streak, double: !!double });
    LVU.award('daily');
    if (S.daily.streak % 7 === 0) maybeReview('streak7');
    UI.refreshPanel(true); save(true);
  };
  ACT.claimDailyDouble = function () {
    if (!E.dailyStatus(S).claimable || LV.adLeft(S, 'dailyDouble') <= 0) return;
    withRewardedAd('dailyDouble', function () { if (LV.useAd(S, 'dailyDouble')) ACT.claimDaily({}, null, null, true); });
  };

  // Monetization
  ACT.iap = function (d) {
    var p = D.IAP.filter(function (x) { return x.id === d.id; })[0];
    if (!p) return;
    if (PL.demo || PL.web) { root.DemoUI.prompt('store'); return; }
    AN.track('purchase_start', { id: p.id });
    if (!PL.storeAvailable()) {
      if (DEV) { onTransaction({ productId: p.id, transactionId: 'dev-' + Date.now() }); return; }
      FX.toast('⚠️', T('Store unavailable'), T(PL.android ? 'Purchases are only available in the Google Play version.' : 'Purchases are only available in the App Store version.'));
      return;
    }
    busy(true);
    PL.purchase(p.id).then(function (r) {
      busy(false);
      if (r && r.status === 'success') onTransaction(r);
      else if (r && r.status === 'pending') FX.toast('⏳', T('Purchase pending'), T('We\'ll deliver it as soon as it\'s approved.'));
      else if (r && r.status === 'failed') {
        AN.track('purchase_failed', { id: p.id, error: String(r.error || '').slice(0, 60) });
        FX.toast('⚠️', T('Purchase failed'), /not found|load products/i.test(r.error || '') ? T(PL.android ? 'This item isn\'t available from Google Play right now. Please try again later.' : 'This item isn\'t available from the App Store right now. Please try again later.') : esc(r.error || ''));
      }
    });
  };
  ACT.restore = function () {
    if (!PL.storeAvailable()) { FX.toast('ℹ️', T('Nothing to restore'), T(PL.android ? 'Purchases are only available in the Google Play version.' : 'Purchases are only available in the App Store version.')); return; }
    busy(true);
    PL.restore().then(function (txs) {
      busy(false);
      var n = 0;
      txs.forEach(function (tx) { if (onTransaction(tx, true)) n++; });
      FX.toast('✅', T('Purchases restored'), n ? T('{n} item(s) restored.', { n: n }) : T('Everything was already up to date.'));
    });
  };
  ACT.freeLb = function () {
    var ads = E.adsToday(S), cfg = D.AD_REWARDS.freelb;
    if (ads.freelb >= cfg.perDay) return;
    withRewardedAd('freelb', function () {
      ads.freelb++; S.lb += cfg.lb;
      A.play('achieve', 0.7); PL.haptic('success');
      FX.toast('★', T('Liberty Bucks!'), '+' + cfg.lb);
      UI.refreshPanel(true); save();
    });
  };
  ACT.offlineDouble = function () {
    if (!lastOffline) return;
    var gains = lastOffline; lastOffline = null;
    withRewardedAd('offline', function () {
      gains.forEach(function (g, wi) { if (g > 0) E.earn(S, wi, g); });
      UI.closeAll();
      A.play('cash', 1); PL.haptic('success');
      FX.coins(innerWidth / 2, innerHeight / 2, 24);
      FX.toast('💰', T('Doubled!'), T('Offline earnings doubled.'));
      save();
    });
  };

  // Applies a StoreKit transaction exactly once, then finishes it.
  function onTransaction(tx, isRestore) {
    var p = E.grantIAP(S, tx.productId, tx.transactionId);
    PL.finish(tx.transactionId);
    if (!p) return false;
    if (isRestore && p.type !== 'nonconsumable') return false;
    A.play('fanfare', 1); PL.haptic('success');
    FX.confetti(innerWidth / 2, innerHeight / 2, 150);
    var msg = p.noAds ? T('Founding Fathers Pack unlocked: ×3 profit and no ads, forever.') : p.pass ? T('Premium Liberty Pass unlocked! Claim your rewards in the Pass.') : T('+{n} Liberty Bucks', { n: F.num(p.lb) });
    FX.toast(p.icon, T('Thank you, Patriot!'), msg);
    if (p.offer || p.pass) UI.closeAll();
    if (p.cosmetic) LVU.applyCosmetics();
    AN.track('purchase_complete', { id: p.id });
    UI.refreshPanel(true);
    save(true);
    return true;
  }

  function busy(on) {
    var el = document.getElementById('busy');
    if (on && !el) { el = document.createElement('div'); el.id = 'busy'; el.innerHTML = '<div class="spinner" role="progressbar" aria-label="' + tE('Working…') + '"></div>'; document.body.appendChild(el); }
    if (!on && el) el.remove();
  }

  // Browser build: an occasional full-screen ad at a natural pause (js/web-ads.js rate-limits it).
  function webBreak(name) {
    if (root.WebAds && root.WebAds.on) setTimeout(function () { if (!UI.anyModal()) root.WebAds.interstitial(name); }, 2500);
  }

  // Founding Pack owners get ad rewards immediately; others watch a rewarded ad.
  function withRewardedAd(placement, grant) {
    if (PL.demo) { root.DemoUI.prompt('ads'); return; }
    if (S.iap.founding) { grant(); return; }
    AN.track('ad_start', { p: placement });
    A.duck(true);
    // The browser build shows real web ads (or a house ad) itself; only the dev web server simulates one.
    var web = !PL.native && !PL.web;
    var overlay = web ? UI.modal('<div class="modal-body center"><div class="ad-sim">📺</div><p>' + tE('Your sponsor\'s message…') + '</p><p class="panel-note small">' + tE('(Simulated ad in the web build)') + '</p></div>', 'small') : null;
    if (overlay) overlay._sticky = true;
    busy(!web && !PL.web);
    PL.showRewardedAd(placement).then(function (res) {
      busy(false); A.duck(false);
      if (overlay) { overlay._sticky = false; overlay.remove(); UI.closeTop(); }
      if (res === 'earned') { AN.track('ad_reward', { p: placement }); grant(); }
      else if (res === 'nofill' && LV.noFillGrant(S)) {
        // No ad to show: don't punish the player for it (capped per day).
        AN.track('ad_nofill_grant', { p: placement });
        FX.toast('🎁', T('No ad right now'), T('This one\'s on us, President!'), { minor: true });
        grant();
      } else if (res === 'nofill') FX.toast('📺', T('No ad available'), T('Try again in a moment.'));
      else AN.track('ad_dismissed', { p: placement });
    });
  }

  // ---------------- Flows ----------------
  function travel(wi, arriving) {
    if (!S.unlocked[wi]) return;
    S.world = wi;
    UI.renderWorld();
    A.playTheme(themeFor(W()));
    UI.update();
    save();
    AN.track('travel', { w: wi });
    var key = D.WORLDS[wi].event ? 'event_' + S.worlds[wi].eventKey : wi;
    if (!S.seenIntro[key]) setTimeout(function () { showIntro(wi, key); }, arriving ? 1800 : 200);
  }

  function showIntro(wi, key) {
    S.seenIntro[key == null ? wi : key] = true;
    var w = D.WORLDS[wi], m = w.managers[wi === 0 || w.event ? 0 : w.managers.length - 1];
    var extra = w.mechanicName ? '<p class="mech-intro"><b>✦ ' + tE(w.mechanicName) + ':</b> ' + tE(w.mechanicDesc) + '</p>' : '';
    UI.advisorDialog(m.face, m.name, tE(w.intro) + extra, '<button class="btn big" data-act="close">' + tE('Let\'s go!') + ' 🇺🇸</button>',
      { title: (w.event ? '🎉 ' : (wi + 1) + '. ') + esc(UI.worldName(wi)), sub: esc(UI.worldTitle(wi)), talking: true });
  }

  var tipIndex = 0;
  function showTip() {
    var m = W().managers[tipIndex % W().managers.length];
    UI.advisorDialog(m.face, m.name, tE(D.ADVISOR_TIPS[tipIndex % D.ADVISOR_TIPS.length]), null, { talking: true });
    tipIndex++;
  }

  // Contextual one-time tips (after the tutorial)
  var TIPS = [
    { id: 'upg', when: function () { return S.world === 0 && WS().cash >= W().cashUpgrades[0].cost && !Object.keys(WS().upgrades).length; },
      face: 8, text: 'A bill is ready to pass! Visit <b>⬆️ Upgrades</b> to triple a business\'s profits.' },
    { id: 'missions', when: function () { return E.claimableMissions(S, S.world) > 0 && S.stats.missions === 0; },
      face: 3, text: 'You completed a mission! Open <b>🎯 Missions</b> to claim your ★ Liberty Bucks.' },
    { id: 'elect', when: function () { return E.claimableAngels(S, S.world) >= 10 && WS().elections === 0 && E.isMain(S.world); },
      face: 5, text: 'Supporters are lining up! Holding an <b>🗳️ Election</b> resets this world, but each supporter boosts profit forever. The more you earn, the bigger the war chest.' },
    { id: 'moon', when: function () { return S.world === 0 && !S.unlocked[1] && WS().lifetime >= 1e12; },
      face: 9, text: 'Mission control reports: at <b>$1 quadrillion</b> we can fund the Moonshot. Check the <b>🪐 Star Map</b>!' },
    { id: 'event', when: function () { return S.unlocked[D.EVENT_INDEX] && S.world !== D.EVENT_INDEX && S.tutorial.done && S.stats.playtime > 600; },
      face: 0, text: 'A new <b>🎉 event</b> is live! Visit it from the <b>🪐 Star Map</b> to earn Liberty Bucks, Time Warps, Library cards and permanent Liberty Badges.' }
  ];
  // Rating prompt at happy moments (see Live.shouldAskReview for the rules).
  function maybeReview(moment) {
    if (!LV.shouldAskReview(S, moment)) return;
    LV.markReviewAsked(S);
    AN.track('review_prompt', { moment: moment });
    setTimeout(function () { PL.requestReview(); }, 2500);
  }

  // Offer reminders once, the first time a player comes back after being away for an hour or more.
  var remindAskPending = false;
  function maybeAskReminders() {
    if (!remindAskPending || S.settings.notifications || S.live.seen.remindAsk || S.stats.playtime < 1800) return false;
    remindAskPending = false;
    S.live.seen.remindAsk = true;
    AN.track('remind_ask', {});
    UI.advisorDialog('washington', 'George Washingtun', T('Welcome back! Want a heads-up when your treasury is overflowing, your daily reward is ready or the Space Race is about to end? You can change this anytime in Settings.'),
      '<button class="btn blue" data-act="remindNo">' + tE('Not now') + '</button><button class="btn big" data-act="remindYes">🔔 ' + tE('Remind me') + '</button>', { title: '🔔 ' + tE('Reminders'), talking: true });
    return true;
  }
  ACT.remindYes = function () {
    UI.closeAll();
    AN.track('remind_answer', { yes: 1 });
    ACT.toggle({ k: 'notifications' });
  };
  ACT.remindNo = function () { UI.closeAll(); AN.track('remind_answer', { yes: 0 }); };

  function checkTips() {
    if (UI.anyModal() || document.querySelector('.cine') || TU.active()) return;
    if (maybeAskReminders()) return;
    if (S.settings.tips === false) return;
    for (var i = 0; i < TIPS.length; i++) {
      var t = TIPS[i], key = 'tip_' + t.id + (t.id === 'event' ? '_' + S.worlds[D.EVENT_INDEX].eventKey : '');
      if (S.seenIntro[key]) continue;
      if (t.when()) {
        S.seenIntro[key] = true;
        var m = D.WORLDS[0].managers[t.face];
        UI.advisorDialog(m.face, m.name, T(t.text), null, { talking: true });
        return;
      }
    }
  }

  function startSpeech() {
    A.unlock();
    if (S.speechUntil - E.now() > 20 * 3600 * 1000) { FX.toast('🎤', T('The crowd needs a rest'), T('Speeches stack up to 24 hours.')); return; }
    withRewardedAd('speech', runSpeech);
  }
  function runSpeech() {
    var w = W(), ws = WS();
    var hired = w.managers.filter(function (m, i) { return ws.biz[i].manager; });
    var pool = hired.length ? hired : w.managers.slice(0, 3);
    var m = pool[Math.floor(Math.random() * pool.length)];
    var crowd = '';
    var skin = ['#f6d2b5', '#e7b08a', '#c98e63', '#8d5a3b', '#efc19e'], shirts = ['#c8102e', '#1f3a93', '#ffffff', '#f5c518'];
    var signs = ['USA!', '4 MORE', 'VOTE!', '★★★', 'YES!', 'WOO!'];
    for (var i = 0; i < 10; i++) {
      crowd += '<div class="person' + (i % 3 === 1 ? ' arm' : '') + '" style="animation-delay:' + (i * 0.07) + 's"><i style="background:' + skin[i % 5] + '"></i><b style="background:' + shirts[i % 4] + '"></b>' +
        (i % 3 === 0 ? '<div class="sign">' + signs[i % 6] + '</div>' : '') + '</div>';
    }
    var html = UI.head('🎤 ' + tE('Stump Speech'), tE('{name} takes the podium', { name: m.name })) +
      '<div class="modal-body"><div class="speech-stage"><div class="flagwall"></div><div class="speech-bubble" id="speech-line">…</div>' +
      '<div class="speaker">' + P.portrait(m.face, { uid: 'spk', bg: w.accent, talking: true }) + '</div><div class="podium"></div><div class="crowd">' + crowd + '</div></div>' +
      '<div class="bar speech-prog"><i id="speech-prog"></i></div>' +
      '<p class="panel-note center">' + tE('Rallying the base… +{h} hours of ×2 profit (max 24h)', { h: 4 * LV.hookField(S, 'speechLen') }) + '</p></div>';
    var wrap = UI.modal(html, 'small');
    wrap._sticky = true;
    wrap.querySelector('.modal-close').style.display = 'none';
    var lines = SPEECH_LINES.slice().sort(function () { return Math.random() - 0.5; });
    var k = 0, dur = 5000, t0 = performance.now();
    var el = wrap.querySelector('#speech-line'), prog = wrap.querySelector('#speech-prog');
    el.textContent = T(lines[0]);
    A.play('cheer', 0.4);
    var iv = setInterval(function () {
      var f = (performance.now() - t0) / dur;
      prog.style.width = Math.min(100, f * 100) + '%';
      if (Math.floor(f * 4) > k) { k++; el.textContent = T(lines[k % lines.length]); }
      if (f >= 1) {
        clearInterval(iv);
        E.giveSpeech(S);
        LVU.award('speech');
        A.play('cheer', 0.9); PL.haptic('success');
        FX.confetti(innerWidth / 2, innerHeight / 2, 90);
        wrap._sticky = false;
        UI.closeAll();
        FX.toast('🎤', T('The crowd goes wild!'), T('×2 profit · {t} remaining', { t: F.time((S.speechUntil - E.now()) / 1000) }));
        save();
      }
    }, 100);
  }

  // ---------------- World-mechanic scheduling ----------------
  var pendingTreaty = null, pendingDecision = null, nextFlare = 0, nextTreaty = 0, nextDecision = 0, recentDecisions = [];
  function scheduleMechanics(t) {
    nextFlare = t + (60 + Math.random() * 60) * 1000;
    nextTreaty = t + (90 + Math.random() * 60) * 1000;
    nextDecision = t + D.EXTRAS.DECISION_CFG.firstAfter * 1000;
  }
  function drawDecision() {
    var deck = D.EXTRAS.DECISIONS, k;
    do { k = Math.floor(Math.random() * deck.length); } while (recentDecisions.indexOf(k) >= 0 && recentDecisions.length < deck.length);
    recentDecisions.push(k); if (recentDecisions.length > 8) recentDecisions.shift();
    return { card: deck[k], face: [0, 2, 3, 8][Math.floor(Math.random() * 4)] };
  }
  function runMechanics(t) {
    if (S.unlocked[1] && t > nextFlare) {
      nextFlare = t + (150 + Math.random() * 150) * 1000;
      var fl = E.spawnFlare(S, t);
      if (fl && S.world === 1) { A.play('achieve', 0.4); FX.toast('☀️', T('Solar flare!'), tE('{biz} is running at ×5 speed. Tap ☀ to extend!', { biz: UI.bn(1, fl.targets[0]) })); }
    }
    if (S.unlocked[2] && S.world === 2 && !pendingTreaty && t > nextTreaty) {
      pendingTreaty = { offers: E.treatyOffer(), expires: t + 120000 };
      nextTreaty = t + (240 + Math.random() * 180) * 1000;
      A.play('eagle', 0.3);
      FX.toast('👽', T('An alien envoy has arrived!'), T('Tap Negotiate to choose a treaty.'));
    }
    if (pendingTreaty && t > pendingTreaty.expires) pendingTreaty = null;
    // A decision waits until it's answered (no penalty for being away).
    if (S.world === 0 && !pendingDecision && t > nextDecision && S.tutorial.done) {
      var ev = D.EXTRAS.DECISION_CFG.every;
      pendingDecision = drawDecision();
      nextDecision = t + (ev[0] + Math.random() * (ev[1] - ev[0])) * 1000;
      A.play('stamp', 0.3);
    } else if (pendingDecision && t > nextDecision) nextDecision = t + 30000;
  }
  function openTreaty() {
    if (!pendingTreaty) return;
    var m = D.WORLDS[2].managers[Math.random() < 0.5 ? 0 : 7];
    var btns = pendingTreaty.offers.map(function (o, k) {
      return '<button class="btn ' + (k ? 'blue' : 'gold') + ' big treaty-btn" data-act="signTreaty" data-k="' + k + '">' + UI.treatyLabel(o) + '<small>' + tE('for 10 minutes') + '</small></button>';
    }).join('');
    UI.advisorDialog(m.face, m.name, tE('Greetings, Earth President. My people offer a trade agreement. Choose one — the other delegation will be… disappointed.'), btns, { title: '🤝 ' + tE('Alien Treaty'), talking: true });
  }

  // Sky bonus catchers
  var nextCatch = 0;
  function scheduleCatch(first) { nextCatch = E.now() + (first ? 40000 : (60000 + Math.random() * 90000) * (S ? E.field(S, 'skyRate') : 1)); }
  function spawnCatch() {
    var w = W();
    FX.catcher(w.eventCatcher, T('Tap to catch the bonus!'), function (x, y) {
      S.stats.catches++;
      A.play('eagle', 0.7); PL.haptic('medium');
      LVU.award('catch');
      var wi = S.world, sky = E.isMain(wi) ? E.field(S, 'sky') : 1;
      if (Math.random() < 0.35) {
        var lb = (1 + Math.floor(Math.random() * 3)) * sky;
        S.lb += lb;
        FX.floatText(x, y, '+★' + lb, '#f5c518');
      } else {
        var inc = E.incomePerSec(S, wi, false);
        var gain = Math.max(inc * (60 + Math.random() * 120), WS().cash * 0.05, D.WORLDS[wi].businesses[0].cost * 5) * sky;
        E.earn(S, wi, gain);
        FX.floatText(x, y, '+' + money(gain));
        FX.bump(document.getElementById('cash-box'));
      }
      FX.coins(x, y, 14);
      AN.track('catch', {});
    });
    if (w.eventCatcher === 'eagle') A.play('eagle', 0.35);
  }

  // ---------------- Offline / lifecycle ----------------
  var lastOffline = null;
  function applyOffline(verified) {
    var t = E.now();
    var cr = E.offlineCredit(S, t, verified);
    if (cr.rollback) {
      S.lastSeen = t;
      FX.toast('⏰', T('Clock changed'), T('Your device clock moved backwards, so offline earnings were skipped.'));
      AN.track('clock_rollback', {});
      return;
    }
    if (cr.away < 30) { S.lastSeen = t; return; }
    var night = E.field(S, 'offline');
    var gains = E.simulateAway(S, cr.credit, null, false, night);
    S.lastSeen = t;
    X.accrue(S, cr.credit);
    if (LV.onReturn(S, cr.away, t)) LVU.queueOffer();
    var comeback = X.onReturn(S, cr.away, t);
    if (cr.away >= 3600) remindAskPending = true;
    E.chargeLoops(S, t);
    for (var wi = 0; wi < D.MAIN_WORLDS; wi++) runAuto(wi);
    var any = gains.some(function (g) { return g > 0; });
    AN.track('offline_return', { away: Math.round(cr.away), credit: Math.round(cr.credit), verified: verified, comeback: comeback });
    if (!any && !comeback) return;
    lastOffline = gains;
    var list = gains.map(function (g, wi) {
      return g > 0 ? '<li><span>' + esc(UI.worldName(wi)) + '</span><span>+' + money(g, wi) + '</span></li>' : '';
    }).join('');
    if (night > 1) list += '<li class="note"><span>🌙 ' + tE('Night Session') + '</span><span>×' + F.short(night) + '</span></li>';
    var m = D.WORLDS[S.world].managers[0];
    var capNote = cr.capped ? ' ' + T('(capped at {d} — connect to the internet to verify longer absences)', { d: F.duration(cr.credit) }) : '';
    setTimeout(function () {
      if (document.querySelector('.offline-modal')) return;
      var extra = '<ul class="gain-list">' + list + '</ul>' + (comeback ? '<div class="payoff good">🎉 ' + T('Welcome-back bonus: <b>×{m} profit</b> on every main world for {h}!', { m: D.EXTRAS.COMEBACK.mult, h: F.duration(D.EXTRAS.COMEBACK.hours * 3600) }) + '</div>' : '') + XU.welcomeSummary();
      var w = UI.advisorDialog(m.face, m.name, T('Welcome back, President! You were away for <b>{d}</b>{cap}. Your Cabinet kept the economy humming:', { d: F.duration(cr.away), cap: esc(capNote) }),
        (any ? '<button class="btn blue big" data-act="offlineDouble">' + (S.iap.founding ? '×2 ' + tE('Double it!') : '▶ ' + tE('Watch ad: ×2')) + '</button>' : '') + '<button class="btn big" data-act="close">' + tE('Collect') + ' 💰</button>',
        { title: '🌙 ' + tE('While you were away…'), extra: extra, talking: true,
          onClose: function () { lastOffline = null; webBreak('welcome_back'); A.play('cash', 0.9); FX.coins(innerWidth / 2, innerHeight / 2, 20); if (any) FX.bump(document.getElementById('cash-box')); maybeDaily(); } });
      w.classList.add('offline-modal');
    }, 400);
  }
  // Chief of Staff: hire and pass what the switches allow on one world (#17).
  function runAuto(wi) {
    var r = X.autoRun(S, wi);
    if (r.hired) LVU.award('hire', r.hired);
    if (r.bills) LVU.award('upgrade', r.bills);
    if ((r.hired || r.promoted || r.bills) && wi === S.world) UI.refreshPanel(true);
    return r;
  }

  function maybeDaily() {
    setTimeout(function () {
      if (!UI.anyModal() && E.dailyStatus(S).claimable && S.tutorial.done && S.stats.playtime > 30) UI.open('daily');
    }, 600);
  }

  function onPause() {
    save(true);
    AN.flush();
    A.pause(true);
    if (!S.settings.notifications) return;
    var t = E.now(), list = [];
    // "You can afford it": when managed income alone reaches the next launch on the current path (#38).
    var afford = null;
    for (var aw = 0; aw < D.MAIN_WORLDS && !afford; aw++) {
      var nx = D.WORLDS[aw].next;
      if (!nx || !S.unlocked[aw] || S.unlocked[aw + 1]) continue;
      var inc = E.incomePerSec(S, aw, true) * E.field(S, 'offline'), need = nx.cost - S.worlds[aw].cash;
      if (inc > 0 && need > 0 && need / inc < 7 * 86400) afford = { at: t + need / inc * 1000, w: aw };
    }
    if (afford && afford.at - t > 3600e3) list.push({ id: 7, at: afford.at, title: T('Liftoff is funded!'), body: T('{world} can now afford {what}. Launch the next world!', { world: UI.wn(afford.w), what: T(D.WORLDS[afford.w].next.label) }) });
    else list.push({ id: 1, at: t + 12 * 3600 * 1000, title: T('Your treasury is overflowing!'), body: T('Your Cabinet has been earning all night. Come collect!') });
    if (S.speechUntil > t) list.push({ id: 2, at: S.speechUntil, title: T('Your Stump Speech wore off'), body: T('Give another speech to keep profits doubled.') });
    var tomorrow = new Date(t); tomorrow.setHours(24 + 10, 0, 0, 0);
    list.push({ id: 3, at: tomorrow.getTime(), title: T('Your daily reward is ready'), body: T('Keep your streak alive, President!') });
    var race = S.live.race;
    if (race.week && LV.unlocked(S, 'race')) {
      var endAt = LV.weekInfo(t).end - 3 * 3600 * 1000;
      if (endAt > t) list.push({ id: 5, at: endAt, title: T('The Space Race ends in 3 hours!'), body: race.rp >= LV.rivalRP(S, endAt) ? T('You\'re ahead — hold the lead!') : T('The rival is ahead. Time for a comeback!') });
    }
    var nxt = D.Events.upcoming(t, 1)[0];
    if (nxt) list.push({ id: 6, at: nxt.start + 10 * 3600 * 1000, title: T('New event: {name}', { name: nxt.event.emoji + ' ' + T(nxt.event.name) }), body: T('Three days of new businesses, missions and Library cards. Go!') });
    if (S.unlocked[3] && S.worlds[3].loopCharges < E.LOOP_MAX) list.push({ id: 4, at: t + (E.LOOP_MAX - S.worlds[3].loopCharges) * 15 * 60 * 1000, title: T('Temporal Loops fully charged'), body: T('Replay history for profit in the Known Universe.') });
    list = list.concat(XU.notifications(t));
    if (S.settings.quietHours !== false) list.forEach(function (n) { n.at = quiet(n.at); });
    PL.scheduleNotifications(list);
  }
  // Quiet hours: anything due between 10 PM and 8 AM waits until 8 AM.
  function quiet(at) {
    var d = new Date(at), h = d.getHours();
    if (h >= 22) { d.setDate(d.getDate() + 1); d.setHours(8, 0, 0, 0); } else if (h < 8) d.setHours(8, 0, 0, 0);
    return d.getTime();
  }
  var lastResume = 0;
  function onResume() {
    var t = Date.now();
    if (t - lastResume < 1000) return;
    lastResume = t;
    A.pause(false);
    PL.cancelNotifications();
    PL.syncTime().then(function (v) { applyOffline(v); });
  }

  // starspangled://event, …/pass, …/race, …/orders, …/library, …/store, …/daily, …/missions
  function openDeepLink(url) {
    var m = /^starspangled:\/\/([a-z]+)/i.exec(url || ''), key = m && m[1].toLowerCase();
    if (root.NATIVE_DEBUG) console.log('[deeplink] ' + url + ' → ' + key);
    if (!key || !S) return;
    AN.track('deeplink', { to: key });
    UI.closeAll();
    if (key === 'invite') { var code = (/^starspangled:\/\/invite\/([a-z0-9]{6})/i.exec(url) || [])[1]; UI.open('campaign'); if (code) ACT.campaignEnter({ code: code.toUpperCase() }); return; }
    if (key === 'event') { if (S.unlocked[D.EVENT_INDEX]) travel(D.EVENT_INDEX); else UI.open('worlds'); return; }
    if (['pass', 'race', 'orders', 'library', 'store', 'daily', 'missions', 'worlds', 'weekly', 'leagues', 'showdown', 'codex', 'debate', 'campaign'].indexOf(key) >= 0) UI.open(key);
  }

  // ---------------- Loop ----------------
  var last = performance.now(), lastUI = 0, lastPanel = 0, lastSlow = 0, lastSave = 0, payTimes = {}, lastWorld = -1, lastEventKey = null;
  // Rewards auto-granted when an event ended.
  function showRecap() {
    var r = S.eventRecap, ev = D.Events.eventDef(r.id);
    S.eventRecap = null;
    FX.toast(ev ? ev.emoji : '🎉', T('{name} has ended', { name: ev ? T(ev.name) : T('The event') }), T('Unclaimed rewards were sent to you: {x}', { x: eventGainText(r) }));
    LVU.announceCards(r.cards);
    save();
  }
  function loop(ts) {
    var dt = (ts - last) / 1000; last = ts;
    var t = E.now();
    if (dt > 2) E.simulateAway(S, dt);
    else if (dt > 0) {
      var paid = E.tick(S, dt, t);
      var mine = paid[S.world];
      if (mine) mine.forEach(onPayout);
    }
    var evKey = S.worlds[D.EVENT_INDEX].eventKey;
    if (S.world !== lastWorld || evKey !== lastEventKey) {
      var rolled = lastEventKey !== null && evKey !== lastEventKey;
      lastWorld = S.world; lastEventKey = evKey; UI.renderWorld(); A.playTheme(themeFor(W()));
      if (rolled) {
        var ne = D.WORLDS[D.EVENT_INDEX], ik = 'event_' + evKey;
        FX.toast(ne.emoji, T('New event: {name}', { name: T(ne.name) }), T(ne.title));
        if (S.world === D.EVENT_INDEX && !S.seenIntro[ik]) setTimeout(function () { if (!UI.anyModal()) showIntro(D.EVENT_INDEX, ik); }, 1500);
      }
    }
    if (S.eventRecap && !UI.anyModal()) showRecap();
    guard(UI.frame);
    if (ts - lastUI > 100) { guard(UI.update); guard(TU.update); lastUI = ts; }
    if (ts - lastPanel > 500) { guard(UI.refreshPanel); lastPanel = ts; }
    if (ts - lastSlow > 1000) {
      lastSlow = ts;
      var got = E.checkAchievements(S);
      if (got.length) {
        // One compact line, however many unlocked at once.
        var stars = got.reduce(function (n, a) { return n + a.reward; }, 0);
        FX.toast('🏆', got.length === 1 ? esc(UI.achText(got[0])[0]) : T('{n} achievements unlocked', { n: got.length }), '★' + stars, { minor: true });
        A.play('achieve', 0.35, 800); AN.track('achievements', { n: got.length });
        LVU.award('achievement', got.length);
      }
      if (t > nextCatch && !document.querySelector('.cine') && TU && !TU.active()) { spawnCatch(); scheduleCatch(); }
      guard(function () { runMechanics(t); });
      for (var aw = 0; aw < D.MAIN_WORLDS; aw++) runAuto(aw);
      guard(checkTips);
      guard(LVU.slowTick);
      guard(XU.slowTick);
      if (root.CampaignUI) guard(root.CampaignUI.tick);
    }
    if (ts - lastSave > 5000) { save(); lastSave = ts; }
    raf(loop);
  }

  // A rendering bug must never stop the economy: log it once (and report it) and keep the loop alive.
  var guardSeen = {};
  function guard(fn) {
    try { fn(); } catch (e) {
      var k = String(e && e.message);
      if (guardSeen[k]) return;
      guardSeen[k] = true;
      console.error(e);
      AN.track('ui_error', { m: k.slice(0, 80) });
    }
  }

  function onPayout(i) {
    var st = E.bizStats(S, S.world, i);
    if (st.time < 0.5) return;
    var t = performance.now();
    if (payTimes[i] && t - payTimes[i] < 350) return;
    payTimes[i] = t;
    var c = UI.cards()[i];
    if (!c) return;
    var r = c.fill.parentNode.getBoundingClientRect();
    FX.floatText(r.left + r.width / 2, r.top, '+' + money(st.rev));
  }

  // ---------------- Dev panel (dev builds only) ----------------
  function devPanel() {
    var d = document.createElement('div');
    d.id = 'dev';
    d.innerHTML = '<b>DEV</b>' +
      '<button data-dev="cash">cash ×1000</button><button data-dev="warp">warp 1h</button><button data-dev="warpd">warp 1d</button>' +
      '<button data-dev="lb">+100★</button><button data-dev="unlock">unlock worlds</button><button data-dev="angels">+prestige</button>' +
      '<button data-dev="catch">catcher</button><button data-dev="event">next event</button><button data-dev="flare">flare</button><button data-dev="treaty">treaty</button>' +
      '<button data-dev="petition">decision</button><button data-dev="debate">debate now</button><button data-dev="showdown">+300 dmg</button><button data-dev="comeback">comeback</button><button data-dev="day">+1 day</button><button data-dev="offline">offline 5h</button>' +
      '<button data-dev="xp">+2000 XP</button><button data-dev="rp">+300 RP</button><button data-dev="raceEnd">end race</button><button data-dev="cards">+5 cards</button>' +
      '<button data-dev="offer">offer</button><button data-dev="orderDay">new order day</button><button data-dev="live">unlock live</button><button data-dev="hide">hide</button>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) {
      var k = e.target.dataset.dev; if (!k) return;
      var ws = WS(), t = E.now();
      if (k === 'cash') E.earn(S, S.world, Math.max(1000, ws.cash * 999));
      if (k === 'warp') E.simulateAway(S, 3600);
      if (k === 'warpd') E.simulateAway(S, 86400);
      if (k === 'lb') S.lb += 100;
      if (k === 'unlock') { for (var u = 1; u < D.MAIN_WORLDS; u++) S.unlocked[u] = true; }
      if (k === 'angels') ws.angels = Math.max(100, ws.angels * 10);
      if (k === 'catch') spawnCatch();
      if (k === 'event') { var evs = D.EVENTS, cur = D.WORLDS[D.EVENT_INDEX].eventId, ix = evs.map(function (e) { return e.eventId; }).indexOf(cur); E.forceEvent(evs[(ix + 1) % evs.length].eventId); E.updateEvent(S, t); travel(D.EVENT_INDEX); }
      if (k === 'flare') nextFlare = 0;
      if (k === 'treaty') { nextTreaty = 0; pendingTreaty = null; }
      if (k === 'petition') { nextDecision = 0; pendingDecision = null; }
      if (k === 'day') { S.daily.lastDay = E.dayKey(t - 86400000); }
      if (k === 'offline') { S.lastSeen = t - 5 * 3600 * 1000; applyOffline(true); }
      if (k === 'xp') S.live.pass.xp += 2000;
      if (k === 'rp') S.live.race.rp += 300;
      if (k === 'raceEnd') S.live.race.week = 'W-1';
      if (k === 'cards') LVU.grantCardsToast(5);
      if (k === 'offer') { var ids = ['starter', 'moon', 'galaxy', 'comeback']; S.live.offers.active = null; var id = ids[(S.live.offers.dev = ((S.live.offers.dev || 0) + 1)) % 4]; delete S.live.offers.shown[id]; if (LV.triggerOffer(S, id, t)) LVU.showOffer(); }
      if (k === 'orderDay') S.live.orders.day = '';
      if (k === 'live') { S.tutorial.done = true; S.stats.playtime = Math.max(S.stats.playtime, 3600); }
      if (k === 'debate') { S.extras.debate.next = 0; S.extras.debate.active = null; S.extras.debate.result = null; }
      if (k === 'showdown') S.extras.showdown.dmg += 300;
      if (k === 'comeback') { S.lastSeen = t - 4 * 86400 * 1000; applyOffline(true); }
      if (k === 'hide') d.remove();
      UI.refreshPanel(true);
    });
  }

  // ---------------- Boot ----------------
  function boot() {
    PL.initChrome();
    if (root.WebAds) root.WebAds.setAudio(function () { A.pause(true); }, function () { A.pause(false); });
    setTimeout(PL.hideSplash, 8000); // safety net
    PL.loadSave().then(function (raw) {
      var loaded = null;
      if (raw) { try { loaded = E.deserialize(raw); } catch (e) { console.warn('Bad save, starting fresh', e); } }
      S = loaded || E.newState();
      root.Game.state = function () { return S; };
      E.setClock(PL.now);
      I18N.setLang(S.settings.lang);
      A.initSfx();
      A.setSfx(S.settings.sfx); A.setMusic(S.settings.music); A.setVolume(S.settings.sfxVol); A.setMusicVolume(S.settings.musicVol);
      FX.init();
      UI.init(S);
      LVU.init({ withRewardedAd: withRewardedAd, save: save });
      LVU.boot();
      XU.init({ save: save, travel: travel, spawnCatch: spawnCatch, runAuto: runAuto });
      UI.applySettings();
      TU.init(S);
      E.updateEvent(S, E.now());
      if (!S.unlocked[S.world]) S.world = 0;
      UI.renderWorld(); lastWorld = S.world; lastEventKey = S.worlds[D.EVENT_INDEX].eventKey;
      document.getElementById('speech-btn').addEventListener('click', function () { A.play('click', 0.6); PL.haptic('light'); startSpeech(); });
      var firstGesture = function () {
        A.unlock(); A.playTheme(themeFor(W()));
        document.removeEventListener('pointerdown', firstGesture);
      };
      document.addEventListener('pointerdown', firstGesture);
      PL.onLifecycle(onPause, onResume);
      window.addEventListener('beforeunload', function () { save(true); });
      scheduleCatch(true);
      scheduleMechanics(E.now());
      if (!S.seenIntro[S.world]) setTimeout(function () { showIntro(S.world); }, 300);
      if (DEV && /dev/.test(location.hash)) devPanel();
      AN.setEnabled(S.settings.analytics !== false);
      PL.onDeepLink(openDeepLink);
      AN.track('session_start', { native: PL.native, lang: I18N.current(), worlds: S.unlocked.filter(Boolean).length });
      PL.syncTime().then(function (v) { applyOffline(v); if (!lastOffline) maybeDaily(); });
      PL.initStore(D.IAP.map(function (p) { return p.id; }), onTransaction).then(function () { UI.refreshPanel(true); });
      raf(function (t) { last = t; raf(function (t2) { PL.hideSplash(); loop(t2); }); });
    });
  }

  Object.keys(LVU.ACTIONS).forEach(function (k) { ACT[k] = LVU.ACTIONS[k]; });
  Object.keys(XU.ACTIONS).forEach(function (k) { ACT[k] = XU.ACTIONS[k]; });

  root.Game = {
    act: function (name, data, el, ev) { if (ACT[name]) ACT[name](data || {}, el, ev); },
    save: save,
    pendingTreaty: function () { return pendingTreaty; },
    pendingDecision: function () { return pendingDecision; },
    reloadWithoutSave: function () { resetting = true; location.reload(); },
    spawnCatch: function () { spawnCatch(); },
    themeFor: function (w) { return themeFor(w); },
    review: function (moment) { maybeReview(moment); },
    openDeepLink: function (url) { openDeepLink(url); },
    state: function () { return S; }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(typeof window !== 'undefined' ? window : globalThis);
