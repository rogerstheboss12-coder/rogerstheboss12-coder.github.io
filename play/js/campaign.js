/* The Campaign: the 2026 parody presidential race (players vote; the result is announced on Election Night,
 * the same poll the marketing reels and the web demo use) and invite codes (reward for bringing friends).
 * Both talk to the league server (server/worker.js: /v1/vote, /v1/poll, /v1/invite, /v1/invite/redeem).
 * Logic is plain functions on the save so it can be tested in Node; the UI part runs only in the browser. */
(function (root) {
  'use strict';
  var D = root.GameData;

  var CFG = {
    poll: 'pres2026',
    closes: Date.UTC(2026, 10, 1, 4),          // Nov 1 2026, midnight Eastern (must match POLLS in server/worker.js)
    showUntil: Date.UTC(2026, 10, 15),         // the race stays in the menu until results have had time to be claimed
    candidates: [
      { id: 'flip', name: 'Governor Flip-Flopson', party: 'The Both-Sides Party', face: 'cand_flip', bg: '#5b2a6e',
        line: 'I stand firmly on both sides of every issue.' },
      { id: 'moneybags', name: 'Mr. Moneybags McGee', party: 'The Money Party', face: 'cand_fat', bg: '#1f5a2a',
        line: 'I\'ll buy this election. Literally.' }
    ],
    reward: { winner: 30, loser: 12 },           // Liberty Bucks once the result is in
    invite: { friend: 25, max: 10, newPlayer: 40, redeemDays: 14 },
    promoMax: 50,                                // cap on Liberty Bucks per reel code, whatever the server says
    // Community goal: everyone who plays Election Night shares the reward if players together clear enough event tiers.
    goal: { id: 'election2026', board: 'ev:E100:election', reward: { lb: 30, warp: 12 * 3600 }, showUntil: Date.UTC(2026, 10, 12) }
  };

  function state(s) {
    var c = s.extras.campaign || (s.extras.campaign = {});
    if (c.vote === undefined) c.vote = '';
    if (c.sent === undefined) c.sent = '';
    if (c.result === undefined) c.result = null;          // { winner, counts, closed }
    if (c.paid === undefined) c.paid = false;
    if (!c.invite) c.invite = { code: '', friends: 0, paid: 0, redeemed: '' };
    if (!c.promos) c.promos = {};                          // reel code → Liberty Bucks received
    if (!c.goal) c.goal = { progress: 0, target: 0, done: false, over: false, claimed: false };
    return c;
  }
  function candidate(id) { return CFG.candidates.filter(function (c) { return c.id === id; })[0] || null; }
  function pollOpen(t) { return t < CFG.closes; }
  function raceVisible(t) { return t < CFG.showUntil; }

  function vote(s, id, t) {
    if (!pollOpen(t) || !candidate(id)) return false;
    state(s).vote = id;
    return true;
  }
  // Stores a tally from the server. Returns true if the final result just arrived.
  function setTally(s, r) {
    if (!r || !r.counts) return false;
    var c = state(s), was = c.result && c.result.closed;
    c.result = { counts: r.counts, closed: !!r.closed, winner: r.closed && candidate(r.winner) ? r.winner : null };
    return !was && c.result.closed;
  }
  function resultClaimable(s) { var c = state(s); return !!(c.result && c.result.winner && c.vote && !c.paid); }
  function claimResult(s) {
    if (!resultClaimable(s)) return null;
    var c = state(s), won = c.vote === c.result.winner, lb = won ? CFG.reward.winner : CFG.reward.loser;
    c.paid = true; s.lb += lb;
    return { won: won, lb: lb, winner: c.result.winner };
  }
  function shares(r) {
    var total = 0, out = {};
    CFG.candidates.forEach(function (c) { total += (r && r.counts && r.counts[c.id]) || 0; });
    CFG.candidates.forEach(function (c) { out[c.id] = total ? ((r.counts[c.id] || 0) / total) : 1 / CFG.candidates.length; });
    return { total: total, pct: out };
  }

  // ---------- Invites ----------
  function canRedeem(s, t) {
    var c = state(s);
    return !c.invite.redeemed && t - (s.created || t) < CFG.invite.redeemDays * 86400000;
  }
  // Friend count from the server → Liberty Bucks not yet paid.
  function setFriends(s, n) {
    var inv = state(s).invite;
    inv.friends = Math.max(inv.friends, Math.min(CFG.invite.max, n | 0));
    var due = (inv.friends - inv.paid) * CFG.invite.friend;
    if (due > 0) { s.lb += due; inv.paid = inv.friends; }
    return due > 0 ? due : 0;
  }
  function redeemed(s, code) {
    var inv = state(s).invite;
    if (inv.redeemed) return 0;
    inv.redeemed = code; s.lb += CFG.invite.newPlayer;
    return CFG.invite.newPlayer;
  }

  // ---------- Reel codes ----------
  function isPromo(code) { return /^R\d{2}[A-Z0-9]{4}$/.test(code); }
  function promoRedeemed(s, code, lb) {
    var c = state(s);
    if (c.promos[code] != null) return 0;
    lb = Math.max(0, Math.min(CFG.promoMax, lb | 0));
    c.promos[code] = lb; s.lb += lb;
    return lb;
  }

  // ---------- Community goal ----------
  function goalPlayed(s) { var b = s.extras.league.boards[CFG.goal.board]; return !!(b && b.score > 0); }
  function setGoal(s, r) {
    if (!r || r.target == null) return false;
    var g = state(s).goal, was = g.done;
    g.progress = +r.progress || 0; g.target = +r.target || 0; g.done = !!r.done; g.over = !!r.over; g.starts = +r.starts || 0; g.ends = +r.ends || 0;
    return !was && g.done;
  }
  function goalClaimable(s) { var g = state(s).goal; return g.done && g.over && !g.claimed && goalPlayed(s); }
  function claimGoal(s, t) {
    if (!goalClaimable(s)) return null;
    state(s).goal.claimed = true;
    return root.Live.applyReward(s, CFG.goal.reward, t);
  }
  function goalVisible(s, t) { var g = state(s).goal; return t < CFG.goal.showUntil && !!g.target && (t >= (g.starts || 0) - 7 * 86400000); }

  // ---------- Network ----------
  function LG() { return root.Leagues; }
  function request(path, body) {
    var url = LG() && LG().serverUrl();
    if (!url || typeof fetch !== 'function') return Promise.reject(new Error('offline'));
    return fetch(url + path, {
      method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined, cache: 'no-store'
    }).then(function (r) { return r.json().then(function (j) { j._status = r.status; return j; }); });
  }
  function demo() { return !!(root.BUILD && root.BUILD.demo); }
  function playerId(s) { var id = root.Extras.leagueIdentity(s).id; return demo() ? 'w' + id.slice(1) : id; }
  // Sends an unsent vote, or refreshes the tally. Resolves { final: bool } when fresh data arrived.
  function syncPoll(s, t) {
    var c = state(s);
    var p = c.vote && c.sent !== c.vote && pollOpen(t)
      ? request('/v1/vote', { poll: CFG.poll, voter: playerId(s), choice: c.vote }).then(function (r) { if (r._status === 200) c.sent = r.you; return r; })
      : request('/v1/poll?poll=' + CFG.poll);
    return p.then(function (r) { return { final: setTally(s, r) }; }, function () { return null; });
  }
  function syncInvite(s) {
    return request('/v1/invite?player=' + encodeURIComponent(playerId(s))).then(function (r) {
      if (!r || !r.code) return null;
      var inv = state(s).invite;
      inv.code = r.code;
      if (r.redeemed && !inv.redeemed) inv.redeemed = r.redeemed;   // restored save / reinstall: no second bonus
      return { due: setFriends(s, r.friends) };
    }, function () { return null; });
  }
  function syncGoal(s) {
    return request('/v1/goal?goal=' + CFG.goal.id).then(function (r) { return { done: setGoal(s, r) }; }, function () { return null; });
  }
  function redeem(s, code) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (isPromo(code)) {
      if (state(s).promos[code] != null) return Promise.resolve({ ok: false, error: 'already redeemed' });
      return request('/v1/promo/redeem', { player: playerId(s), code: code }).then(function (r) {
        if (r._status === 200) return { ok: true, lb: promoRedeemed(s, code, r.lb), promo: true };
        if (r.error === 'already redeemed') state(s).promos[code] = 0;
        return { ok: false, error: r.error || 'error' };
      }, function () { return { ok: false, error: 'offline' }; });
    }
    if (!canRedeem(s, Date.now())) return Promise.resolve({ ok: false, error: state(s).invite.redeemed ? 'already redeemed' : 'too late' });
    return request('/v1/invite/redeem', { player: playerId(s), code: code }).then(function (r) {
      if (r._status === 200) return { ok: true, lb: redeemed(s, code) };
      return { ok: false, error: r.error || 'error' };
    }, function () { return { ok: false, error: 'offline' }; });
  }

  root.Campaign = {
    CFG: CFG, state: state, candidate: candidate, pollOpen: pollOpen, raceVisible: raceVisible, vote: vote,
    setTally: setTally, resultClaimable: resultClaimable, claimResult: claimResult, shares: shares,
    canRedeem: canRedeem, setFriends: setFriends, redeemed: redeemed, isPromo: isPromo, promoRedeemed: promoRedeemed,
    setGoal: setGoal, goalClaimable: goalClaimable, claimGoal: claimGoal, goalVisible: goalVisible,
    syncPoll: syncPoll, syncInvite: syncInvite, syncGoal: syncGoal, redeem: redeem
  };

  // ---------------------------------------------------------------- UI (browser only)
  var UI = root.UI;
  if (!UI || !root.ExtrasUI) return;
  var C = root.Campaign, E = root.Engine, T = root.T, P = root.Portraits, FX = root.FX, A = root.GameAudio, PL = root.Platform;
  function S() { return UI.state(); }
  function tE(s, v) { return UI.tE(s, v); }
  function esc(s) { return UI.esc(s); }
  var APP_URL = 'https://apps.apple.com/app/id6816208938';

  UI.PANELS.campaign = function () {
    var s = S(), t = E.now(), c = state(s), body = '';
    if (raceVisible(t)) {
      var r = c.result, sh = shares(r), open = pollOpen(t);
      if (resultClaimable(s)) {
        var w = candidate(r.winner);
        body += '<div class="race-result won"><div class="rr-title">🎉 ' + tE('{name} wins!', { name: esc(T(w.name)) }) + '</div><p>' +
          (c.vote === r.winner ? tE('Your candidate won the Presidency.') : tE('Your candidate lost, but democracy thanks you.')) + '</p>' +
          '<button class="btn gold big" data-act="campaignClaim">' + tE('Claim ★{n}', { n: c.vote === r.winner ? CFG.reward.winner : CFG.reward.loser }) + '</button></div>';
      }
      body += '<p class="panel-note">' + (open
        ? tE('The Great 2026 Parody Election! Vote for President before Election Night — players and the internet vote together. Results arrive on November 1: ★{a} if your candidate wins, ★{b} if not.', { a: CFG.reward.winner, b: CFG.reward.loser })
        : (r && r.winner ? tE('The votes are in! {name} is the President-Elect.', { name: esc(T(candidate(r.winner).name)) }) : tE('The polls are closed. Counting every ballot…'))) + '</p>';
      body += '<div class="campaign-race">' + CFG.candidates.map(function (k) {
        var mine = c.vote === k.id, pct = Math.round(sh.pct[k.id] * 100), won = r && r.winner === k.id;
        return '<div class="cand' + (mine ? ' mine' : '') + (won ? ' won' : '') + '">' +
          '<div class="row-icon hero-ic">' + P.portrait(k.face, { uid: 'cp' + k.id, bg: k.bg, talking: mine }) + '</div>' +
          '<div class="cand-name">' + (won ? '👑 ' : '') + esc(T(k.name)) + '</div><div class="h3-sub">' + esc(T(k.party)) + '</div>' +
          '<div class="cand-line">“' + esc(T(k.line)) + '”</div>' +
          (sh.total ? '<div class="bar"><div class="fill" style="width:' + pct + '%"></div></div><div class="small-strong">' + pct + '%</div>' : '') +
          (open ? '<button class="btn ' + (mine ? 'gold' : 'blue') + '" data-act="campaignVote" data-id="' + k.id + '">' + (mine ? '✓ ' + tE('Your vote') : '🗳️ ' + tE('Vote')) + '</button>' : '') +
          '</div>';
      }).join('') + '</div>';
      if (sh.total) body += '<p class="panel-note small center">' + tE('{n} votes so far.', { n: root.Fmt.num(sh.total) }) + '</p>';
      if (open && c.vote && c.sent !== c.vote) body += '<p class="panel-note small center">' + tE('Your vote is saved and will be counted when you\'re online.') + '</p>';
    }
    var g = c.goal;
    if (!demo() && goalVisible(s, t)) {
      var gp = g.target ? Math.min(100, g.progress / g.target * 100) : 0;
      body += '<h3>🌎 ' + tE('Community goal: Election Night') + '</h3><p class="panel-note">' + tE('During Election Night (Nov 1–3), every reward tier any player clears counts. Reach {n} tiers together and everyone who played gets ★{lb} and a 12-hour Time Warp.', { n: root.Fmt.num(g.target), lb: CFG.goal.reward.lb }) + '</p>' +
        '<div class="bar goal-bar"><i style="width:' + gp.toFixed(1) + '%"></i></div><p class="panel-note small center">' + tE('{a} / {b} tiers', { a: root.Fmt.num(g.progress), b: root.Fmt.num(g.target) }) + (g.done ? ' · ✅ ' + tE('Goal reached!') : '') + '</p>';
      if (goalClaimable(s)) body += '<div class="center-cta"><button class="btn gold big" data-act="campaignGoal">' + tE('Claim ★{n} + Time Warp', { n: CFG.goal.reward.lb }) + '</button></div>';
      else if (g.done && g.over && !g.claimed && !goalPlayed(s)) body += '<p class="panel-note small center">' + tE('The reward goes to players who took part in Election Night.') + '</p>';
    }
    if (demo()) return { title: '🗳️ ' + tE('Campaign HQ'), sub: tE('Vote for President'), body: body + root.DemoUI.cta() };
    // Invites
    var inv = c.invite;
    body += '<h3>🤝 ' + tE('Invite friends') + '</h3><p class="panel-note">' + tE('Share your code. When a friend enters it in their first {d} days, they get ★{b} and you get ★{a} (up to {m} friends).', { a: CFG.invite.friend, b: CFG.invite.newPlayer, m: CFG.invite.max, d: CFG.invite.redeemDays }) + '</p>';
    body += '<div class="settings-grid"><div class="setting"><span>' + tE('Your code') + '<small class="setting-sub">' + (inv.code ? '<b class="invite-code">' + esc(inv.code) + '</b> · ' + tE('{n}/{m} friends joined', { n: inv.friends, m: CFG.invite.max }) : tE('Connect to the internet to get your code.')) + '</small></span>' +
      (inv.code ? '<button class="btn blue sm" data-act="campaignShare">📤 ' + tE('Share') + '</button>' : '') + '</div>';
    if (inv.redeemed) body += '<div class="setting"><span>' + tE('Friend code used') + '<small class="setting-sub">' + esc(inv.redeemed) + '</small></span></div>';
    else if (canRedeem(s, t)) body += '<div class="setting"><span>' + tE('Got a friend\'s code?') + '<small class="setting-sub">' + tE('Enter it for ★{n}.', { n: CFG.invite.newPlayer }) + '</small></span><button class="btn blue sm" data-act="campaignEnter">' + tE('Enter code') + '</button></div>';
    body += '<div class="setting"><span>🎬 ' + tE('Code from our videos?') + '<small class="setting-sub">' + tE('Some of our videos end with a secret code worth up to ★{n}.', { n: CFG.promoMax }) + '</small></span><button class="btn blue sm" data-act="campaignEnter">' + tE('Enter code') + '</button></div>';
    body += '</div>';
    return { title: '🗳️ ' + tE('Campaign HQ'), sub: tE('Vote for President · invite friends'), body: body };
  };

  function share(text) {
    if (navigator.share) return navigator.share({ text: text }).catch(function () {});
    if (navigator.clipboard) return navigator.clipboard.writeText(text).then(function () { FX.toast('📋', T('Copied!'), T('Paste it to a friend.')); }, function () {});
  }
  function refresh() { if (UI.isOpen() === 'campaign') UI.refreshPanel(true); }

  var ACTIONS = {
    campaignVote: function (d) {
      var s = S();
      if (!vote(s, d.id, E.now())) return;
      A.play('stamp', 0.9); PL.haptic('success'); FX.confetti(innerWidth / 2, innerHeight / 3, 40);
      if (root.Analytics) root.Analytics.track('campaign_vote', { c: d.id });
      UI.refreshPanel(true); root.Game.save(true);
      syncPoll(s, E.now()).then(function () { refresh(); root.Game.save(); });
    },
    campaignClaim: function () {
      var r = claimResult(S());
      if (!r) return;
      A.play(r.won ? 'cheer' : 'achieve', 0.9); PL.haptic('success'); FX.confetti(innerWidth / 2, innerHeight / 2, r.won ? 160 : 60);
      FX.toast('🗳️', r.won ? T('Your candidate won!') : T('Better luck in 2028'), '★' + r.lb);
      UI.refreshPanel(true); root.Game.save(true);
    },
    campaignGoal: function () {
      var r = claimGoal(S(), E.now());
      if (!r) return;
      A.play('fanfare', 0.9); PL.haptic('success'); FX.confetti(innerWidth / 2, innerHeight / 2, 160);
      FX.toast('🌎', T('Community goal reached!'), '★' + r.lb + (r.gain ? ' · +' + UI.money(r.gain, r.world) : ''));
      UI.refreshPanel(true); root.Game.save(true);
    },
    campaignShare: function () {
      var code = state(S()).invite.code;
      if (!code) return;
      share(T('Build a ridiculous political empire with me in Star-Spangled Tycoon! Use my code {code} for ★{n} free: {url}', { code: code, n: CFG.invite.newPlayer, url: APP_URL }));
      if (root.Analytics) root.Analytics.track('invite_share', {});
    },
    campaignEnter: function (d) {
      UI.modal(UI.head('🤝 ' + tE('Enter a friend\'s code'), '') + '<div class="modal-body"><input id="inviteCodeInput" class="code-input" maxlength="7" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="ABC123 / R42ABCD" value="' + esc(d.code || '') + '">' +
        '<div class="dialog-actions"><button class="btn blue" data-act="close">' + tE('Cancel') + '</button><button class="btn big" data-act="campaignRedeem">' + tE('Redeem') + '</button></div></div>', 'small');
    },
    campaignRedeem: function () {
      var el = document.getElementById('inviteCodeInput'), s = S();
      redeem(s, el ? el.value : '').then(function (r) {
        if (r.ok) {
          UI.closeTop(); A.play('fanfare', 0.9); PL.haptic('success'); FX.confetti(innerWidth / 2, innerHeight / 2, 100);
          FX.toast(r.promo ? '🎬' : '🤝', r.promo ? T('Code accepted!') : T('Welcome aboard!'), '★' + r.lb); root.Game.save(true); refresh();
          if (root.Analytics) root.Analytics.track(r.promo ? 'promo_redeem' : 'invite_redeem', r.promo ? { code: String(el && el.value).toUpperCase().slice(0, 3) } : {});
          return;
        }
        var msg = { 'unknown code': 'That code doesn\'t exist.', 'own code': 'You can\'t use your own code.', 'already redeemed': 'You\'ve already used a friend\'s code.',
          'code full': 'That code has already been used by {m} friends.', 'bad code': 'That doesn\'t look like a code.', expired: 'That code has expired.', 'too late': 'Friend codes work in your first {d} days of playing.', unavailable: 'Codes are unavailable right now. Try again later.', offline: 'You need to be online to redeem a code.' }[r.error] || 'Something went wrong. Try again later.';
        FX.toast('⚠️', T('Code not accepted'), T(msg, { m: CFG.invite.max, d: CFG.invite.redeemDays }));
      });
    }
  };
  Object.keys(ACTIONS).forEach(function (k) { root.ExtrasUI.ACTIONS[k] = ACTIONS[k]; });

  // Hub chip, menu entry and badge
  function claimable(s) { return resultClaimable(s) || goalClaimable(s); }
  function chip(t) {
    var s = S(), c = state(s);
    if (!s.tutorial.done) return '';
    if (goalClaimable(s)) return '<button class="hub-chip dot gift" data-act="openPanel" data-panel="campaign"><span>🌎</span>' + tE('Community reward!') + '</button>';
    if (claimable(s)) return '<button class="hub-chip dot" data-act="openPanel" data-panel="campaign"><span>🗳️</span>' + tE('Election results!') + '</button>';
    if (pollOpen(t) && !c.vote && s.stats.playtime >= 600) return '<button class="hub-chip dot gift" data-act="openPanel" data-panel="campaign"><span>🗳️</span>' + tE('Vote for President!') + '</button>';
    return '';
  }

  // Background sync: poll every 10 minutes (every minute around the close), invites every 5 minutes.
  var lastPoll = 0, lastInvite = 0, lastGoal = 0;
  function tick() {
    var s = S(), t = E.now(), now = Date.now();
    if (!s || !LG() || !LG().serverUrl()) return;
    var c = state(s), near = Math.abs(t - CFG.closes) < 3600000;
    if (raceVisible(t) && !(c.result && c.result.closed) && now - lastPoll > (near || (c.vote && c.sent !== c.vote) ? 60000 : 600000)) {
      lastPoll = now;
      syncPoll(s, t).then(function (r) {
        if (r && r.final && resultClaimable(s)) FX.toast('🗳️', T('The votes are in!'), T('{name} wins the Presidency. Open Campaign HQ to claim your reward.', { name: T(candidate(state(s).result.winner).name) }));
        refresh();
      });
    }
    var g = c.goal, live = g.starts && t >= g.starts && t < g.ends + 3600000;
    if (!demo() && t < CFG.goal.showUntil && !g.claimed && !(g.done && g.over) && now - lastGoal > (live ? 120000 : 900000)) {
      lastGoal = now;
      syncGoal(s).then(function (r) {
        if (r && r.done) FX.toast('🌎', T('Community goal reached!'), T('Everyone who played Election Night gets ★{n} and a Time Warp when it ends.', { n: CFG.goal.reward.lb }));
        refresh();
      });
    }
    if (!demo() && now - lastInvite > 300000) {
      lastInvite = now;
      syncInvite(s).then(function (r) {
        if (r && r.due) { FX.toast('🤝', T('A friend joined!'), '★' + r.due); A.play('cheer', 0.7); root.Game.save(true); }
        refresh();
      });
    }
  }
  root.CampaignUI = { chip: chip, tick: tick, dot: function () { return claimable(S()); } };
})(typeof window !== 'undefined' ? window : globalThis);
