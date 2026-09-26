/* UI + actions for the v1.1 systems: weekly goals, Debates, the weekly Showdown, leaderboards (leagues),
 * the Bill of Rights, Cabinet seniority, the Codex, the Library museum, the welcome-back summary,
 * backups, smarter notifications and Game Center. main.js merges ACTIONS and calls the hooks. */
(function (root) {
  'use strict';
  var D = root.GameData, E = root.Engine, F = root.Fmt, P = root.Portraits, T = root.T, PL = root.Platform;
  var X = root.Extras, XD = D.EXTRAS, LG = root.Leagues, L = root.Live, LD = D.LIVE;
  var UI = root.UI, FX = root.FX, A = root.GameAudio;
  var ctx = null;

  function S() { return UI.state(); }
  function esc(s) { return UI.esc(s); }
  function tE(s, v) { return UI.tE(s, v); }
  function money(n, wi) { return UI.money(n, wi); }
  function row(k, i, t, s, b, c) { return UI.row(k, i, t, s, b, c); }
  function mainWi() { var s = S(); return E.isMain(s.world) ? s.world : 0; }
  function init(c) {
    ctx = c;
    if (PL.gcAvailable()) PL.gcAuth(false).then(function (ok) { if (ok) gameCenterSync(true); });
  }
  function award(kind, n) { if (root.LiveUI) root.LiveUI.award(kind, n); }

  // ---------- Labels ----------
  function targetsLabel(targets, wi) {
    if (targets === 'all') return T('everything');
    if (targets.length === 1) return UI.bn(wi, targets[0]);
    if (targets.join() === '0,1,2,3,4') return T('businesses 1–5');
    if (targets.join() === '5,6,7,8,9') return T('businesses 6–10');
    return targets.map(function (i) { return UI.bn(wi, i); }).join(' + ');
  }
  function decisionLabel(fx) {
    var out = [];
    if (fx.cash) out.push(T('+{n} min of income', { n: fx.cash }));
    if (fx.lb) out.push('★' + fx.lb);
    if (fx.sky) out.push(T('a sky bonus'));
    if (fx.speech) out.push(T('🎤 ×2 for {n} min', { n: fx.speech }));
    if (fx.buff) {
      var b = fx.buff;
      out.push(targetsLabel(b.targets, 0) + ' ' + (b.speed ? T('speed ×{n}', { n: b.speed }) : T('profit ×{n}', { n: b.profit })) + ' · ' + T('{n} min', { n: b.mins }));
    }
    return out.join(' + ');
  }
  function rewardText(r) {
    var out = [];
    if (r.lb) out.push('★' + r.lb);
    if (r.warp) out.push('⏩ ' + F.duration(r.warp));
    if (r.card) out.push('🃏 ×' + r.card);
    return out.join(' + ');
  }

  // ---------- Hub chips, More menu, dots ----------
  function hubChips(t) {
    var s = S(), h = '';
    if (!s.tutorial.done) return h;
    var d = s.extras.debate;
    if (d.active) {
      var pct = Math.min(100, X.debateProgress(s) / d.active.target * 100);
      h += chip('openPanel', 'debate', '🎙️', Math.floor(pct) + '% · ' + F.time(Math.max(0, d.active.end - t) / 1000), pct >= 100 ? 'good' : 'bad');
    } else if (d.result) h += chip('openPanel', 'debate', '🎙️', d.result.won ? tE('Debate won!') : tE('Debate over'), 'dot');
    else if (X.debateReady(s, t)) h += chip('openPanel', 'debate', '🎙️', tE('Debate challenge!'), 'dot gift');
    var sd = X.showdownInfo(t);
    if (sd.active && L.unlocked(s, 'race')) {
      var dmg = s.extras.showdown.key === sd.key ? s.extras.showdown.dmg : 0;
      h += chip('openPanel', 'showdown', sd.boss.emoji, tE('Showdown {p}%', { p: Math.floor(Math.min(999, dmg / XD.SHOWDOWN.hp * 100)) }), X.showdownTiersReady(s).length ? 'dot boss' : 'boss');
    }
    var wk = X.weeklyClaimable(s);
    if (wk) h += chip('openPanel', 'weekly', '🗓️', tE('Weekly ({n})', { n: wk }), 'dot');
    if (X.boardsClaimable(s).length) h += chip('openPanel', 'leagues', '🏅', tE('Rank rewards!'), 'dot');
    if (root.CampaignUI) h += root.CampaignUI.chip(t);
    return h;
  }
  function chip(act, panel, icon, text, cls) {
    return '<button class="hub-chip ' + (cls || '') + '" data-act="' + act + '"' + (panel ? ' data-panel="' + panel + '"' : '') + '><span>' + icon + '</span>' + text + '</button>';
  }
  function moreItems() {
    var s = S(), out = [['campaign', '🗳️', 'Campaign HQ'], ['weekly', '🗓️', 'Weekly Goals'], ['leagues', '🏅', 'Leaderboards']];
    if (X.debateUnlocked(s)) out.push(['debate', '🎙️', 'Debates']);
    if (L.unlocked(s, 'race')) out.push(['showdown', '⚔️', 'Showdown']);
    out.push(['codex', '📖', 'Codex']);
    if (s.amendments > 0 || s.conventions > 0) out.push(['perks', '📜', 'Bill of Rights']);
    return out;
  }
  function dot(panel) {
    var s = S(), t = E.now();
    switch (panel) {
      case 'weekly': return X.weeklyClaimable(s) > 0;
      case 'leagues': return X.boardsClaimable(s).length > 0;
      case 'debate': return !!s.extras.debate.result || X.debateReady(s, t);
      case 'showdown': return X.showdownTiersReady(s).length > 0;
      case 'codex': return X.codexNew(s) > 0;
      case 'perks': return X.perkPoints(s) > 0;
      case 'campaign': return !!root.CampaignUI && root.CampaignUI.dot();
    }
    return false;
  }
  function dotCount() { return ['campaign', 'weekly', 'leagues', 'debate', 'showdown', 'codex', 'perks'].filter(dot).length; }

  // ---------- Weekly goals ----------
  UI.PANELS.weekly = function () {
    var s = S(), w = s.extras.weekly, t = E.now(), wk = L.weekInfo(t);
    var done = w.goals.filter(function (id) { return w.claimed[id]; }).length;
    var body = '<div class="hero"><div class="row-icon hero-ic">🗓️</div><div class="hero-stats">' +
      '<div><div class="lbl">' + tE('Completed') + '</div><div class="big-num">' + done + ' / ' + w.goals.length + '</div></div>' +
      '<div><div class="lbl">' + tE('Resets in') + '</div><div class="big-num">' + F.duration((wk.end - t) / 1000) + '</div></div></div></div>';
    body += '<p class="panel-note">' + tE('Five new goals every Monday. Each pays ★{lb} and {xp} Pass XP; finish all five for a bonus chest.', { lb: XD.WEEKLY.reward.lb, xp: XD.WEEKLY.reward.xp }) + '</p>';
    body += w.goals.map(function (id) {
      var g = X.goalDef(id), prog = X.goalProgress(s, id), ok = prog >= g.n, got = w.claimed[id];
      return row('g' + id, g.icon, tE(g.text, { n: g.n }), F.num(Math.min(prog, g.n)) + ' / ' + g.n + ' · ★' + XD.WEEKLY.reward.lb + ' + ' + XD.WEEKLY.reward.xp + ' XP' +
        (got ? '' : '<div class="bar"><i style="width:' + Math.min(100, prog / g.n * 100) + '%"></i></div>'),
        got ? '<span class="btn blue ghost">' + tE('Claimed') + '</span>' : '<button class="btn gold" data-act="claimGoal" data-id="' + id + '" ' + (ok ? '' : 'disabled') + '>' + tE('Claim') + '</button>', got ? 'done' : '');
    }).join('');
    var all = w.goals.length && done === w.goals.length;
    body += row('bonus', '🎁', tE('Bonus chest'), rewardText(XD.WEEKLY.bonus) + ' · ' + tE('Time Warps pay out on your current main world.'),
      w.bonus ? '<span class="btn blue ghost">' + tE('Claimed') + '</span>' : '<button class="btn red" data-act="claimWeeklyBonus" ' + (all ? '' : 'disabled') + '>' + tE('Open') + '</button>', w.bonus ? 'done' : 'featured');
    return { title: '🗓️ ' + tE('Weekly Goals'), sub: tE('Bigger goals, bigger rewards'), body: body };
  };

  // ---------- Debates ----------
  function debatePreview(s, wi) {
    var secs = XD.DEBATE.minutes * 60 * X.field(s, 'debateLen');
    return { secs: secs, target: Math.max(E.incomePerSec(s, wi, false) * secs * X.debateK(s), D.WORLDS[wi].businesses[1].cost * 20) };
  }
  UI.PANELS.debate = function () {
    var s = S(), d = s.extras.debate, t = E.now(), body = '';
    var cand = XD.CANDIDATES[d.active ? d.active.c : d.result ? d.result.c : (s.extras.debate.level + Math.floor(s.created / 1000)) % XD.CANDIDATES.length];
    body += '<div class="hero debate-hero"><div class="row-icon hero-ic rival-face">' + P.portrait(cand.face, { uid: 'dbc', bg: '#5a1f2a', talking: true }) + '</div><div class="hero-stats">' +
      '<div><div class="lbl">' + tE('Your opponent') + '</div><div class="small-strong">' + esc(cand.name) + '</div><div class="panel-note small">' + tE(cand.party) + ' — “' + tE(cand.line) + '”</div></div>' +
      '<div><div class="lbl">' + tE('Debate level') + '</div><div class="big-num">' + (d.level + 1) + '</div></div></div></div>';
    if (d.result) {
      var r = d.result;
      body += '<div class="race-result ' + (r.won ? 'won' : 'lost') + '"><div class="rr-title">' + (r.won ? '🏆 ' + tE('You won the debate!') : '🎙️ ' + tE('The crowd went the other way…')) + '</div>' +
        '<p>' + tE('You earned {a} of the {b} needed on {world}.', { a: money(r.got, r.wi), b: money(r.target, r.wi), world: UI.wn(r.wi) }) + '</p>' +
        '<button class="btn gold big" data-act="claimDebate">' + tE('Claim ★{n}', { n: r.lb }) + (r.card ? ' + 🃏' : '') + '</button></div>';
    } else if (d.active) {
      var a = d.active, got = X.debateProgress(s), pct = Math.min(100, got / a.target * 100);
      body += '<p class="panel-note center">' + tE('Earn {x} on {world} before the timer runs out!', { x: money(a.target, a.wi), world: UI.wn(a.wi) }) + '</p>' +
        '<div class="bar big"><i style="width:' + pct + '%"></i></div><p class="panel-note center"><b>' + money(got, a.wi) + '</b> · ' + Math.floor(pct) + '% · ' + tE('{t} left', { t: F.time(Math.max(0, a.end - t) / 1000) }) + '</p>' +
        '<p class="panel-note">💡 ' + tE('Give a Stump Speech, pass bills, buy businesses and tap the ones without managers to win.') + '</p>' +
        '<div class="center-cta"><button class="btn blue" data-act="close">' + tE('Keep campaigning') + '</button> <button class="btn red" data-act="forfeitDebate">' + tE('Concede') + '</button></div>';
    } else if (X.debateReady(s, t)) {
      var wi = mainWi(), pv = debatePreview(s, wi);
      body += '<p class="panel-note center">' + tE('Challenge: earn {x} on {world} in {m} minutes.', { x: money(pv.target, wi), world: UI.wn(wi), m: Math.round(pv.secs / 60) }) + '</p>' +
        '<p class="panel-note center">' + tE('Win: ★{w} (a Library card every {n} wins) and a harder rival next time. Lose: ★{l}.', { w: Math.round(XD.DEBATE.lb(d.level) * X.field(s, 'debateLb')), n: XD.DEBATE.cardEvery, l: XD.DEBATE.loseLb }) + '</p>' +
        '<div class="center-cta"><button class="btn blue" data-act="close">' + tE('Not now') + '</button> <button class="btn red big" data-act="startDebate">🎙️ ' + tE('Accept the debate') + '</button></div>';
    } else if (!X.debateUnlocked(s)) {
      body += '<p class="panel-note center">' + tE('Debates unlock after 30 minutes of play.') + '</p>';
    } else {
      body += '<p class="panel-note center">' + tE('Your next challenger arrives in {t}.', { t: F.duration(Math.max(0, d.next - t) / 1000) }) + '</p>';
    }
    body += '<p class="panel-note small">' + tE('Debates won: {w} · lost: {l}', { w: s.stats.debatesWon || 0, l: s.stats.debatesLost || 0 }) + '</p>';
    return { title: '🎙️ ' + tE('Debates'), sub: tE('Rival candidates, timed challenges'), body: body };
  };

  // ---------- Showdown ----------
  UI.PANELS.showdown = function () {
    var s = S(), t = E.now(), info = X.showdownInfo(t), sd = s.extras.showdown, hp = XD.SHOWDOWN.hp;
    var dmg = info.active && sd.key === info.key ? sd.dmg : 0, pct = Math.min(100, dmg / hp * 100);
    var body = '<div class="boss-stage ' + (pct >= 100 ? 'down' : '') + '"><div class="boss-emoji" aria-hidden="true">' + info.boss.emoji + '</div>' +
      '<div class="boss-name">' + tE(info.boss.name) + '</div><div class="boss-line">“' + tE(info.boss.line) + '”</div>' +
      '<div class="boss-hp"><i style="width:' + (100 - pct) + '%"></i><span>' + (pct >= 100 ? tE('Defeated!') + ' · ' + F.num(dmg) + ' ' + tE('damage') : F.num(Math.max(0, hp - dmg)) + ' / ' + F.num(hp) + ' HP') + '</span></div></div>';
    if (!info.active) {
      body += '<p class="panel-note center">' + tE('The Showdown runs every Saturday for 24 hours. Next one starts in {t}.', { t: F.duration((info.next - t) / 1000) }) + '</p>';
    } else {
      body += '<p class="panel-note center">' + tE('Everything you do deals damage — missions, speeches, sky bonuses, decisions, debates, milestones and more. Ends in {t}.', { t: F.time((info.end - t) / 1000) }) + '</p>';
      body += XD.SHOWDOWN.tiers.map(function (tier, k) {
        var got = sd.claimed[k], ready = dmg >= tier.at * hp && !got;
        return row('sd' + k, tier.at >= 1 ? '🏆' : '⚔️', tE('{p}% damage', { p: tier.at * 100 }), rewardText(tier) + (tier.at >= 1 ? ' · ' + tE('boss defeated') : ''),
          got ? '<span class="btn blue ghost">' + tE('Claimed') + '</span>' : '<button class="btn gold" data-act="claimShowdown" ' + (ready ? '' : 'disabled') + '>' + tE('Claim') + '</button>', got ? 'done' : '');
      }).join('');
      body += '<div class="center-cta"><button class="btn blue" data-act="openLeague" data-tab="sd">🏅 ' + tE('Showdown leaderboard') + '</button></div>';
      var brd = s.extras.league.boards['sd:' + info.key];
      if (brd && brd.community) body += '<p class="panel-note center">🌎 ' + tE('Community: {n} players dealt {d} damage this week.', { n: F.num(brd.community.players), d: F.num(brd.community.total) }) + '</p>';
    }
    body += '<h3>' + tE('Damage per action') + '</h3><div class="rp-grid">' + [
      ['🎯', 'Mission', 'mission'], ['📅', 'Daily reward', 'daily'], ['🎤', 'Stump Speech', 'speech'], ['🦅', 'Sky bonus', 'catch'],
      ['✦', 'World event (decision, flare, treaty, loop, anchor)', 'mechanic'], ['🎙️', 'Debate won', 'debate'], ['⚡', 'Business milestone', 'milestone'],
      ['🎩', 'Hire a manager', 'hire'], ['📜', 'Executive Order', 'order'], ['🗳️', 'Election', 'election'], ['🎉', 'Event tier', 'eventTier']
    ].map(function (x) { return '<div><span>' + x[0] + ' ' + tE(x[1]) + '</span><b>' + XD.SHOWDOWN.dmg[x[2]] + '</b></div>'; }).join('') + '</div>';
    return { title: '⚔️ ' + tE('Weekly Showdown'), sub: tE(info.boss.name), body: body };
  };

  // ---------- Leaderboards ----------
  function boardFor(kind) {
    var s = S(), t = E.now();
    var live = X.boardsNow(s, t).filter(function (b) { return b.kind === kind; })[0];
    if (live) return { key: live.key, rec: s.extras.league.boards[live.key], live: true };
    // Otherwise the most recent finished board of that kind.
    var b = s.extras.league.boards, best = null;
    Object.keys(b).forEach(function (k) { if (b[k].kind === kind && (!best || b[k].end > b[best].end)) best = k; });
    return best ? { key: best, rec: b[best], live: false } : null;
  }
  function scoreText(kind, v) { return kind === 'ev' ? money(v, D.EVENT_INDEX) : F.num(v) + ' ' + T('dmg'); }
  UI.PANELS.leagues = function () {
    var s = S(), t = E.now(), tab = UI.panelTab.leagues || 'ev', lg = X.leagueIdentity(s), body = '';
    var claim = X.boardsClaimable(s);
    claim.forEach(function (k) {
      var r = s.extras.league.boards[k];
      body += '<div class="race-result won"><div class="rr-title">' + (r.emoji || '🏅') + ' ' + tE('Final rank: #{r} of {n}', { r: r.result.rank, n: r.result.size }) + '</div><p>' + esc(T(r.title)) + '</p>' +
        '<button class="btn gold big" data-act="claimBoard" data-k="' + esc(k) + '">' + tE('Claim {w}', { w: rewardText(r.result) }) + '</button></div>';
    });
    body += UI.tabs('leagues', [['ev', '🎉 ' + tE('Event')], ['sd', '⚔️ ' + tE('Showdown')]]);
    var b = boardFor(tab);
    if (!b) {
      body += '<p class="panel-note center">' + (tab === 'sd' ? tE('The Showdown leaderboard opens on Saturday.') : tE('Play the live event to join its leaderboard.')) + '</p>';
    } else {
      var r = b.rec || { score: 0, real: [], kind: tab, start: t, end: t + 1 };
      var st = X.standings(s, b.key, r, Math.min(t, r.end)), rw = X.rankReward(st.rank, st.size);
      body += '<div class="hero"><div class="row-icon hero-ic">🏅</div><div class="hero-stats">' +
        '<div><div class="lbl">' + tE('Your rank') + '</div><div class="big-num">#' + st.rank + ' / ' + st.size + '</div></div>' +
        '<div><div class="lbl">' + (b.live ? tE('Ends in') : tE('Ended')) + '</div><div class="big-num">' + (b.live ? F.duration((r.end - t) / 1000) : '✓') + '</div></div>' +
        '<div><div class="lbl">' + tE('Reward at this rank') + '</div><div class="small-strong">' + rewardText(rw) + '</div></div></div></div>';
      body += '<p class="panel-note small">' + (LG.online() ? tE('{n} real players in your group; AI rivals (🤖) fill the rest.', { n: st.realCount }) : tE('Offline: your group is made of AI rivals (🤖). Real players join when you\'re online.')) + ' ' +
        tE('Groups hold 50–100 players. You appear as {name}.', { name: esc(lg.name) }) + '</p>';
      body += '<ol class="league-list">' + st.rows.map(function (x, i) {
        return '<li class="' + (x.me ? 'me' : '') + (i < 3 ? ' top' + (i + 1) : '') + '"><span class="lr">' + (i + 1) + '</span><span class="ln">' + esc(x.name) + (x.ai ? ' <i class="ai" title="' + tE('AI rival') + '">🤖</i>' : '') + (x.me ? ' <b>(' + tE('you') + ')</b>' : '') + '</span><span class="ls">' + scoreText(tab, x.score) + '</span></li>';
      }).join('') + '</ol>';
      body += '<p class="panel-note small">' + tE('Rewards: #1 ★{a} + card · top 3 ★{b} · top 10 ★{c} · top 25% ★{d} · everyone else ★{e}.', { a: XD.LEAGUE.ranks[0].lb, b: XD.LEAGUE.ranks[1].lb, c: XD.LEAGUE.ranks[2].lb, d: XD.LEAGUE.ranks[3].lb, e: XD.LEAGUE.ranks[4].lb }) + '</p>';
    }
    if (PL.gcAvailable()) body += '<div class="center-cta"><button class="btn blue" data-act="gameCenter" data-lb="' + (tab === 'sd' ? 'showdown' : 'event') + '">🎮 ' + tE('Game Center leaderboards') + '</button></div>';
    return { title: '🏅 ' + tE('Leaderboards'), sub: tE('Compete in groups of 50–100'), body: body };
  };

  // ---------- Bill of Rights ----------
  UI.PANELS.perks = function () {
    var s = S(), pts = X.perkPoints(s);
    var body = '<div class="hero"><div class="row-icon hero-ic">📜</div><div class="hero-stats">' +
      '<div><div class="lbl">' + tE('Points to spend') + '</div><div class="big-num">' + pts + '</div></div>' +
      '<div><div class="lbl">' + tE('Amendments ratified') + '</div><div class="big-num">' + s.amendments + '</div></div></div></div>';
    body += '<p class="panel-note">' + tE('Every Amendment you ratify at a Constitutional Convention is also a point for the Bill of Rights. Level 1 costs 1 point, level 2 costs 2, level 3 costs 3. Perks are permanent and apply to every main world.') + '</p>';
    body += XD.PERKS.map(function (p) {
      var lv = X.perkLevel(s, p.id), max = p.levels.length, next = lv < max ? p.levels[lv] : null;
      var cur = lv ? T(p.desc, { v: fmtPerk(p.levels[lv - 1]) }) : tE('Not ratified yet.');
      var pips = '<span class="pips">' + p.levels.map(function (v, k) { return '<i class="' + (k < lv ? 'on' : '') + '"></i>'; }).join('') + '</span>';
      return row('p' + p.id, p.icon, tE(p.name) + ' ' + pips, esc(cur) + (next != null ? '<br><span class="next">' + tE('Next: {d}', { d: T(p.desc, { v: fmtPerk(next) }) }) + '</span>' : ''),
        next == null ? '<span class="btn blue ghost">' + tE('Max') + '</span>' : '<button class="btn gold" data-act="buyPerk" data-id="' + p.id + '" ' + (pts >= lv + 1 ? '' : 'disabled') + '>' + tE('Ratify') + '<small>' + tE('{n} pt', { n: lv + 1 }) + '</small></button>', lv === max ? 'done' : '');
    }).join('');
    body += '<div class="dialog-actions"><button class="btn red" data-act="respecPerks" ' + (X.perkSpent(s) && s.lb >= XD.PERK_RESPEC_LB ? '' : 'disabled') + '>' + tE('Repeal all (★{n})', { n: XD.PERK_RESPEC_LB }) + '</button></div>';
    return { title: '📜 ' + tE('Bill of Rights'), sub: tE('Spend Amendments on permanent perks'), body: body };
  };
  function fmtPerk(v) { return String(v); }

  // ---------- Seniority ----------
  function openSeniority(i) {
    var s = S(), wi = S().world, ws = s.worlds[wi], cfg = XD.SENIORITY, r = X.sen(s, wi, i), reached = X.senTiers(s, wi, i);
    var m = D.WORLDS[wi].managers[i];
    var html = cfg.tiers.map(function (at, tier) {
      var ok = tier < reached, pick = r.p[tier];
      var head = '<div class="sen-head"><b>' + tE('Tier {n}', { n: tier + 1 }) + '</b> · ' + (ok ? tE('unlocked') : tE('{a} / {b} as Secretary', { a: F.duration(Math.min(r.s, at)), b: F.duration(at) })) + '</div>';
      var opts = cfg.choices[tier].map(function (c, k) {
        var chosen = pick === k, other = pick >= 0 && !chosen;
        return '<button class="sen-opt ' + (chosen ? 'chosen' : '') + '" data-act="pickSen" data-i="' + i + '" data-t="' + tier + '" data-c="' + k + '" ' + (ok && pick < 0 ? '' : 'disabled') + (other ? ' aria-disabled="true"' : '') + '><b>' + tE(c.name) + '</b><span>' + tE(c.desc) + '</span>' + (chosen ? '<em>✓ ' + tE('Chosen') + '</em>' : '') + '</button>';
      }).join('');
      return '<div class="sen-tier ' + (ok ? '' : 'locked') + '">' + head + '<div class="sen-opts">' + opts + '</div></div>';
    }).join('');
    var note = ws.biz[i].chief ? tE('Seniority grows while {name} serves as Cabinet Secretary — even offline.', { name: m.name }) : tE('Appoint {name} as Cabinet Secretary again to keep building seniority.', { name: m.name });
    note += ' ' + tE('Perks work while the business has a manager. A Constitutional Convention resets seniority.');
    UI.modal(UI.head('🎖️ ' + esc(m.name), tE(m.title) + ' · ' + esc(UI.bn(wi, i))) + '<div class="modal-body"><p class="panel-note">' + note + '</p>' + html + '</div>', 'small');
  }

  // ---------- Codex ----------
  UI.PANELS.codex = function () {
    var s = S(), C = D.CODEX || {}, tab = UI.panelTab.codex, lang = root.I18N.current();
    X.codexMarkSeen(s);
    var worlds = [];
    for (var wi = 0; wi < D.MAIN_WORLDS; wi++) if (s.unlocked[wi]) worlds.push(wi);
    if (tab == null || worlds.indexOf(+tab) < 0) tab = worlds.indexOf(s.world) >= 0 ? s.world : 0;
    tab = +tab;
    function bio(id) { var e = C[id]; return e ? (lang === 'es' && e.es ? e.es : e.en) : ''; }
    var body = UI.tabs('codex', worlds.map(function (k) { return [String(k), (k + 1) + '. ' + esc(UI.wn(k))]; }));
    body += '<p class="panel-note">' + tE('Entries unlock as you buy businesses and hire managers. {a} / {b} discovered.', { a: X.codexCount(s), b: D.MAIN_WORLDS * 21 }) + '</p>';
    var w = D.WORLDS[tab], cx = s.extras.codex;
    body += '<div class="codex-world" style="background-image:url(\'' + w.bg + '\')"><div><h3>' + esc(UI.wn(tab)) + '</h3><p>' + esc(bio('w' + tab)) + '</p></div></div>';
    body += '<h3>' + tE('Businesses') + '</h3>' + w.businesses.map(function (b, i) {
      var id = 'b' + tab + '_' + i, got = cx[id];
      return row(id, got ? UI.bizIcon(tab, i) : '❔', got ? esc(UI.bn(tab, i)) : '???', got ? esc(bio(id)) : tE('Buy this business to unlock its entry.'), '', got ? '' : 'done');
    }).join('');
    body += '<h3>' + tE('The Cabinet') + '</h3>' + w.managers.map(function (m, i) {
      var id = 'm' + tab + '_' + i, got = cx[id];
      return row(id, got ? P.portrait(m.face, { uid: 'cx' + tab + '_' + i, bg: w.accent }) : '❔', got ? esc(m.name) + ' <span class="h3-sub">' + tE(m.title) + '</span>' : '???',
        got ? esc(bio(id)) : tE('Hire this manager to unlock their entry.'), '', got ? '' : 'done');
    }).join('');
    return { title: '📖 ' + tE('Codex'), sub: tE('The (mostly) true history of the Republic'), body: body };
  };

  // ---------- Library museum ----------
  function museum() {
    var s = S(), body = '<p class="panel-note">' + tE('Your finished collections hang in the museum. Swipe through the halls.') + '</p><div class="museum">';
    var halls = LD.CARD_SETS.filter(function (set) { return !set.eventSet; });
    halls.forEach(function (set) {
      var have = L.cardCount(s, set.id), size = L.setSize(set.id), wi = typeof set.world === 'number' ? set.world : null;
      var bg = wi != null ? D.WORLDS[wi].bg : 'assets/worlds/world1.jpg';
      body += '<section class="hall ' + (have === size ? 'complete' : '') + '" style="background-image:url(\'' + bg + '\')"><h4>' + tE(set.name) + ' <span>' + have + '/' + size + (have === size ? ' ★' : '') + '</span></h4><div class="frames">' +
        LD.CARDS.filter(function (c) { return c.set === set.id; }).map(function (c) {
          var own = !!s.live.cards[c.id];
          var art = own ? (c.emoji ? '<div class="lc-emoji">' + c.emoji + '</div>' : P.portrait(c.face, { uid: 'mu' + c.id, bg: c.accent || (wi != null ? D.WORLDS[wi].accent : '#1f3a93') })) : '<div class="lc-q">?</div>';
          return '<figure class="frame ' + (own ? '' : 'empty') + '">' + art + '<figcaption>' + (own ? esc(c.emoji ? T(c.name) : c.name) : '???') + '</figcaption></figure>';
        }).join('') + '</div></section>';
    });
    var done = LD.CARD_SETS.filter(function (set) { return set.eventSet && s.live.events.setsDone[set.id]; });
    body += '<section class="hall event-wing"><h4>' + tE('Event Wing') + ' <span>' + done.length + '/' + LD.CARD_SETS.filter(function (x) { return x.eventSet; }).length + '</span></h4><div class="frames">' +
      (done.length ? done.map(function (set) {
        var ev = D.Events.eventDef(set.event);
        return '<figure class="frame trophy"><div class="lc-emoji">' + (ev ? ev.emoji : '🏆') + '</div><figcaption>' + tE(set.name) + '</figcaption></figure>';
      }).join('') : '<p class="panel-note">' + tE('Complete an event collection to hang its trophy here.') + '</p>') + '</div></section>';
    return body + '</div>';
  }

  // ---------- Welcome-back summary (#5) ----------
  function welcomeSummary() {
    var s = S(), t = E.now(), items = [];
    function item(icon, text, act, extra) { items.push('<li><span class="wi">' + icon + '</span><span class="wt">' + text + '</span>' + (act ? '<button class="btn sm gold" data-act="' + act + '"' + (extra || '') + '>' + tE('Go') + '</button>' : '') + '</li>'); }
    var ds = E.dailyStatus(s, t);
    if (ds.claimable && s.tutorial.done) item('📅', tE('Your daily reward is ready (day {n}).', { n: ds.index + 1 }), 'openPanel', ' data-panel="daily"');
    var mis = 0;
    for (var wi = 0; wi < D.MAIN_WORLDS; wi++) if (s.unlocked[wi]) mis += E.claimableMissions(s, wi);
    if (mis) item('🎯', tE('{n} missions ready to claim.', { n: mis }), 'openPanel', ' data-panel="missions"');
    var ev = E.eventTiersReady(s).length;
    if (ev) item(D.WORLDS[D.EVENT_INDEX].emoji || '🎉', tE('{n} event reward tiers to claim.', { n: ev }), 'travel', ' data-w="' + D.EVENT_INDEX + '"');
    if (L.unlocked(s, 'pass') && L.passClaimable(s)) item('✪', tE('{n} Liberty Pass rewards.', { n: L.passClaimable(s) }), 'openPanel', ' data-panel="pass"');
    if (s.live.race.pending) item('🚀', tE('Your Space Race results are in.'), 'openPanel', ' data-panel="race"');
    if (X.weeklyClaimable(s)) item('🗓️', tE('Weekly goals ready to claim.'), 'openPanel', ' data-panel="weekly"');
    if (X.boardsClaimable(s).length) item('🏅', tE('Leaderboard rewards are waiting.'), 'openPanel', ' data-panel="leagues"');
    var sd = X.showdownInfo(t);
    if (sd.active && L.unlocked(s, 'race')) item(sd.boss.emoji, tE('{boss} is attacking — the Showdown is live!', { boss: T(sd.boss.name) }), 'openPanel', ' data-panel="showdown"');
    if (X.debateReady(s, t)) item('🎙️', tE('A rival candidate challenged you to a debate.'), 'openPanel', ' data-panel="debate"');
    if (X.senPickCount(s)) item('🎖️', tE('{n} Cabinet seniority perks to choose.', { n: X.senPickCount(s) }), 'openPanel', ' data-panel="managers"');
    if (X.perkPoints(s)) item('📜', tE('{n} Bill of Rights points to spend.', { n: X.perkPoints(s) }), 'openPanel', ' data-panel="perks"');
    // Elections that would at least double a world's bonus.
    for (wi = 0; wi < D.MAIN_WORLDS && items.length < 9; wi++) {
      if (!s.unlocked[wi]) continue;
      var ws = s.worlds[wi], eff = E.angelEffect(s, wi), c = E.claimableAngels(s, wi);
      var ratio = (1 + (ws.angels + c) * eff) / (1 + ws.angels * eff);
      if (c > 0 && ratio >= 2) item('🗳️', tE('An Election on {world} would multiply its profit ×{r}.', { world: UI.wn(wi), r: ratio < 100 ? ratio.toFixed(1) : F.short(ratio) }), 'travel', ' data-w="' + wi + '"');
    }
    // Milestones you can afford right now on this world.
    var cur = s.world, cws = s.worlds[cur], near = 0;
    cws.biz.forEach(function (b, i) {
      if (near >= 2 || !b.owned) return;
      var nm = E.nextMilestone(b.owned);
      if (nm && E.costFor(s, cur, i, nm.at - b.owned) <= cws.cash) { near++; item('⚡', tE('{biz}: buy {n} more for {what} — affordable now.', { biz: UI.bn(cur, i), n: nm.at - b.owned, what: nm.speed ? T('speed ×{n}', { n: nm.speed }) : T('profit ×{n}', { n: nm.profit }) }), ''); }
    });
    if (!items.length) return '';
    return '<h4 class="wb-head">' + tE('Ready for you') + '</h4><ul class="wb-list">' + items.join('') + '</ul>';
  }

  // ---------- Notifications (#38) ----------
  function notifications(t) {
    var s = S(), out = [];
    // Event ending soon with rewards left.
    var win = E.eventWindow(t), ws = s.worlds[D.EVENT_INDEX], evName = T(D.WORLDS[D.EVENT_INDEX].name);
    var tiers = E.eventTiersReached(ws);
    if (ws.lifetime > 0 && tiers < D.EVENT_TIERS.length && win.end - 3 * 3600e3 > t) out.push({ id: 8, at: win.end - 3 * 3600e3, title: T('{name} ends in 3 hours', { name: evName }), body: T('You\'re at tier {a} of {b}. One more push!', { a: tiers, b: D.EVENT_TIERS.length }) });
    // Showdown start.
    var sd = X.showdownInfo(t);
    if (L.unlocked(s, 'race')) {
      var sdAt = sd.active ? 0 : sd.next + 10 * 3600e3;
      if (sdAt > t) out.push({ id: 9, at: sdAt, title: T('Showdown: {boss} attacks!', { boss: T(sd.boss.name) }), body: T('24 hours to defeat it. Everything you do deals damage.') });
      else if (sd.active && sd.end - 2 * 3600e3 > t && s.extras.showdown.dmg < XD.SHOWDOWN.hp) out.push({ id: 9, at: sd.end - 2 * 3600e3, title: T('{boss} is still standing!', { boss: T(sd.boss.name) }), body: T('Two hours left in the Showdown.') });
    }
    // Debate challenger.
    var d = s.extras.debate;
    if (X.debateUnlocked(s) && !d.active && d.next > t) out.push({ id: 10, at: d.next, title: T('A rival candidate wants a debate!'), body: T('Beat them in a timed challenge for Liberty Bucks.') });
    // Weekly goals about to reset with rewards unclaimed.
    var wk = L.weekInfo(t), w = s.extras.weekly;
    var open = w.goals.filter(function (id) { return !w.claimed[id]; }).length;
    if (open && wk.end - 6 * 3600e3 > t) out.push({ id: 11, at: wk.end - 6 * 3600e3, title: T('Weekly goals reset tonight'), body: T('{n} goals left this week. Claim what you can!', { n: open }) });
    // Anchor fully grown.
    var an = s.worlds[D.ANCHOR.world].anchor;
    if (an && s.unlocked[D.ANCHOR.world]) {
      var full = an.since + (D.ANCHOR.max * E.field(s, 'anchorMax') - 1) * D.ANCHOR.stepMin * 60000;
      if (full > t + 600000) out.push({ id: 12, at: full, title: T('Reality Anchor at full strength'), body: T('Your anchored business is earning ×{m}.', { m: D.ANCHOR.max * E.field(s, 'anchorMax') }) });
    }
    return out;
  }

  // ---------- Backups (#48) ----------
  var backupList = null;
  function snapshot(label) {
    var s = S();
    if (!s) return;
    backupList = PL.addBackup(E.serialize(s), label || 'auto', Date.now());
  }
  function backupsSection() {
    var list = backupList || (backupList = PL.readBackups());
    var names = { auto: T('Autosave'), election: T('Before an Election'), convention: T('Before a Convention'), import: T('Before an import'), restore: T('Before a restore'), manual: T('Manual backup') };
    var body = '<h4 class="sub-h">' + tE('Backups on this device') + '</h4><p class="panel-note small">' + tE('The last 5 snapshots are kept automatically (every 15 minutes of play and before Elections, Conventions and imports).') + '</p>';
    body += list.length ? '<ul class="backup-list">' + list.map(function (b, k) {
      var d = new Date(b.t);
      return '<li><span>' + esc(names[b.label] || b.label) + '<small>' + d.toLocaleString(T('en-US'), { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + '</small></span><button class="btn blue sm" data-act="restoreBackup" data-k="' + k + '">' + tE('Restore') + '</button></li>';
    }).join('') + '</ul>' : '<p class="panel-note">' + tE('No backups yet.') + '</p>';
    body += '<div class="dialog-actions left"><button class="btn blue" data-act="backupNow">💾 ' + tE('Back up now') + '</button></div>';
    return body;
  }

  // ---------- Settings: leaderboards & Game Center ----------
  function settingsSection() {
    var s = S(), lg = X.leagueIdentity(s);
    var body = '<h3>' + tE('Leaderboards') + '</h3><div class="settings-grid"><div class="setting"><span>' + tE('Your name') + '<small class="setting-sub">' + esc(lg.name) + '</small></span><button class="btn blue sm" data-act="rerollName">🎲 ' + tE('New name') + '</button></div>' +
      '<div class="setting"><span>' + tE('League server') + '<small class="setting-sub">' + (LG.online() ? tE('Connected when online') : tE('Not set up — AI rivals only')) + '</small></span></div>';
    if (PL.gcAvailable()) body += '<div class="setting"><span>🎮 Game Center<small class="setting-sub">' + (PL.gcReady() ? tE('Signed in') : tE('Not signed in')) + '</small></span><button class="btn blue sm" data-act="gameCenter">' + tE('Open') + '</button></div>';
    body += '</div><p class="panel-note small">' + tE('Leaderboards share only a random player ID, your generated name and your event/Showdown scores.') + '</p>';
    return body;
  }

  // ---------- Game Center sync ----------
  var lastGc = 0;
  function gameCenterSync(force) {
    var s = S(), t = Date.now();
    if (!PL.gcReady() || (!force && t - lastGc < 60000)) return;
    lastGc = t;
    var G = XD.GAME_CENTER, lb = G.leaderboards;
    PL.gcSubmit(lb.amendments, s.amendments);
    PL.gcSubmit(lb.achievements, Object.keys(s.achievements).length);
    PL.gcSubmit(lb.racewins, s.live.race.wins);
    var ev = s.worlds[D.EVENT_INDEX];
    if (ev.lifetime > 1 && X.gcPeriodMatches('event', E.now())) PL.gcSubmit(lb.event, Math.floor(Math.log10(ev.lifetime) * 1000));
    var sd = X.showdownInfo(E.now());
    if (sd.active && s.extras.showdown.key === sd.key && s.extras.showdown.dmg > 0 && X.gcPeriodMatches('showdown', E.now())) PL.gcSubmit(lb.showdown, s.extras.showdown.dmg);
    var rep = s.extras.gc || (s.extras.gc = {});
    G.achievements.forEach(function (id) { if (s.achievements[id] && !rep[id]) { rep[id] = 1; PL.gcAchieve(G.achPrefix + id, 100); } });
  }

  // ---------- League sync ----------
  var lastLeague = 0;
  function leagueSync() {
    var s = S(), t = Date.now();
    if (!LG.online() || t - lastLeague < 30000) return;
    lastLeague = t;
    var lg = X.leagueIdentity(s);
    X.boardsNow(s, E.now()).forEach(function (b) {
      var rec = s.extras.league.boards[b.key];
      if (rec && rec.score > 0) LG.sync(rec, b.key, { id: lg.id, name: lg.name }).then(function (fresh) { if (fresh && UI.isOpen() === 'leagues') UI.refreshPanel(); });
    });
  }

  // ---------- One-time introductions for the new systems ----------
  var INTROS = [
    { id: 'x_weekly', face: 'washington', who: 'George Washingtun', panel: 'weekly', when: function (s) { return s.stats.playtime >= 900; },
      text: 'New: <b>Weekly Goals</b>! Five bigger goals every Monday, each worth Liberty Bucks and Pass XP — finish all five for a bonus chest.' },
    { id: 'x_debate', face: 'lincoln', who: 'Abe Lincorn', panel: 'debate', when: function (s) { return X.debateReady(s, E.now()); },
      text: 'A rival candidate has challenged you to a <b>Debate</b>! Earn a target amount before the timer runs out to win Liberty Bucks. Each win brings a tougher rival.' },
    { id: 'x_showdown', face: 'teddy', who: 'Teddy Roosebolt', panel: 'showdown', when: function (s) { return L.unlocked(s, 'race') && X.showdownInfo(E.now()).active; },
      text: 'Bully! The <b>Weekly Showdown</b> is here: a monster attacks every Saturday for 24 hours. Everything you do deals damage — defeat it for rewards.' },
    { id: 'x_leagues', face: 'hamilton', who: 'Alexander Hamiltoon', panel: 'leagues', when: function (s) { return s.worlds[D.EVENT_INDEX].lifetime > 0 && s.stats.playtime >= 1500; },
      text: 'Every event and Showdown now has <b>Leaderboards</b>: you compete in a group of 50–100 for rank rewards. Check where you stand!' },
    { id: 'x_codex', face: 'jefferson', who: 'Thomas Jeffersong', panel: 'codex', when: function (s) { return X.codexCount(s) >= 8 && s.stats.playtime >= 600; },
      text: 'I\'ve started the <b>Codex</b>: the (mostly) true history of every business and Cabinet member you unlock. Have a read!' },
    { id: 'x_perks', face: 'unclesam', who: 'Cosmic Uncle Sam', panel: 'perks', when: function (s) { return X.perkPoints(s) > 0; },
      text: 'Every Amendment you ratify is also a point for the <b>Bill of Rights</b>: permanent perks like faster businesses, cheaper bills and bigger offline earnings.' }
  ];
  var lastIntro = 0;
  function checkIntros() {
    var s = S(), t = Date.now();
    if (!s.tutorial.done || t - lastIntro < 45000) return false;
    for (var k = 0; k < INTROS.length; k++) {
      var it = INTROS[k];
      if (s.live.seen[it.id] || !it.when(s)) continue;
      s.live.seen[it.id] = true; lastIntro = t;
      UI.advisorDialog(it.face, it.who, T(it.text), '<button class="btn blue" data-act="close">' + tE('Later') + '</button><button class="btn big" data-act="openPanel" data-panel="' + it.panel + '">' + tE('Show me') + '</button>', { talking: true, title: '✨ ' + tE('New!') });
      return true;
    }
    return false;
  }

  // ---------- Game-loop hook (1 Hz) ----------
  var lastBackupPlay = null, queuedDebate = false;
  function slowTick() {
    var s = S(), t = E.now();
    X.update(s, t).forEach(function (e) {
      if (e.type === 'debate') { queuedDebate = true; if (e.result.won) award('debate'); A.play(e.result.won ? 'cheer' : 'achieve', 0.7); }
      if (e.type === 'showdown' && L.unlocked(s, 'race')) FX.toast(e.info.boss.emoji, T('Showdown: {boss} attacks!', { boss: T(e.info.boss.name) }), T('24 hours to defeat it. Everything you do deals damage.'));
      if (e.type === 'board') FX.toast(e.board.emoji || '🏅', T('Final rank: #{r} of {n}', { r: e.board.result.rank, n: e.board.result.size }), T('Open Leaderboards to claim {w}.', { w: rewardText(e.board.result) }), { minor: true });
      if (e.type === 'weekly') FX.toast('🗓️', T('New weekly goals!'), T('Five new goals are live. Finish all five for a bonus chest.'), { minor: true });
    });
    if (s.extras.recap && !UI.anyModal()) {
      var r = s.extras.recap; s.extras.recap = null;
      FX.toast('⚔️', T('The Showdown has ended'), T('Unclaimed rewards were sent to you: {x}', { x: '★' + r.lb + (r.cards && r.cards.length ? ' · 🃏 ×' + r.cards.length : '') }));
    }
    // Backups every 15 minutes of play.
    if (lastBackupPlay == null) lastBackupPlay = s.stats.playtime;
    if (s.stats.playtime - lastBackupPlay >= 900) { lastBackupPlay = s.stats.playtime; snapshot('auto'); }
    leagueSync();
    gameCenterSync();
    if (UI.anyModal() || document.querySelector('.cine') || (root.Tutorial && root.Tutorial.active())) return;
    if (queuedDebate && s.extras.debate.result) { queuedDebate = false; UI.open('debate'); return; }
    checkIntros();
  }

  // ---------- Actions ----------
  var ACTIONS = {
    claimGoal: function (d) {
      var r = X.claimGoal(S(), d.id);
      if (!r) return;
      award('weekly');
      A.play('achieve', 0.8); PL.haptic('success');
      FX.toast('🗓️', T('Weekly goal complete!'), '★' + r.lb + ' · +' + r.xp + ' XP', { minor: true });
      UI.refreshPanel(true); ctx.save(true);
    },
    claimWeeklyBonus: function () {
      var r = X.claimWeeklyBonus(S(), E.now());
      if (!r) return;
      A.play('fanfare', 1); PL.haptic('heavy');
      FX.confetti(innerWidth / 2, innerHeight / 2, 140);
      FX.toast('🎁', T('Bonus chest!'), '★' + r.lb + (r.gain ? ' · +' + money(r.gain, r.world) : ''));
      if (root.LiveUI) root.LiveUI.announceCards(r.cards);
      UI.refreshPanel(true); ctx.save(true);
    },
    startDebate: function () {
      var s = S(), a = X.startDebate(s, mainWi(), E.now());
      if (!a) return;
      A.play('cheer', 0.6); PL.haptic('medium');
      if (s.world !== a.wi) ctx.travel(a.wi);
      UI.closeAll();
      FX.toast('🎙️', T('The debate is on!'), T('Earn {x} in {t}.', { x: money(a.target, a.wi), t: F.time((a.end - a.start) / 1000) }));
    },
    forfeitDebate: function () { if (X.forfeitDebate(S(), E.now())) UI.refreshPanel(true); },
    claimDebate: function () {
      var r = X.claimDebate(S());
      if (!r) return;
      A.play(r.won ? 'fanfare' : 'achieve', 0.9); PL.haptic('success');
      if (r.won) FX.confetti(innerWidth / 2, innerHeight / 2, 120);
      FX.toast('🎙️', r.won ? T('Victory at the podium!') : T('Better luck next time'), '★' + r.lb);
      if (root.LiveUI) root.LiveUI.announceCards(r.cards);
      UI.refreshPanel(true); ctx.save(true);
    },
    claimShowdown: function () {
      var r = X.claimShowdown(S(), E.now());
      if (!r.n) return;
      A.play('fanfare', 0.9); PL.haptic('success');
      FX.confetti(innerWidth / 2, innerHeight / 2, r.kill ? 180 : 80);
      if (r.kill) { var app = document.getElementById('app'); if (app && !document.documentElement.classList.contains('reduce-motion')) { app.classList.add('shake-big'); setTimeout(function () { app.classList.remove('shake-big'); }, 700); } }
      FX.toast('⚔️', r.kill ? T('Boss defeated!') : T('Showdown rewards!'), '★' + r.lb + (r.gain ? ' · +' + money(r.gain, r.world) : ''));
      if (root.LiveUI) root.LiveUI.announceCards(r.cards);
      UI.refreshPanel(true); ctx.save(true);
    },
    openLeague: function (d) { UI.panelTab.leagues = d.tab || 'ev'; UI.open('leagues'); },
    claimBoard: function (d) {
      var r = X.claimBoard(S(), d.k);
      if (!r) return;
      A.play(r.rank <= 3 ? 'cheer' : 'achieve', 0.9); PL.haptic('success');
      FX.confetti(innerWidth / 2, innerHeight / 2, r.rank <= 3 ? 160 : 60);
      FX.toast(r.emoji || '🏅', T('Rank #{r} rewards', { r: r.rank }), '★' + r.lb);
      if (root.LiveUI) root.LiveUI.announceCards(r.cards);
      UI.refreshPanel(true); ctx.save(true);
    },
    rerollName: function () { X.rerollName(S()); A.play('click', 0.6); UI.refreshPanel(true); ctx.save(); },
    gameCenter: function (d) {
      var ids = XD.GAME_CENTER.leaderboards;
      PL.gcShow(d && d.lb ? ids[d.lb] : '').then(function (ok) { if (ok === false) FX.toast('🎮', T('Game Center unavailable'), T('Sign in to Game Center in iOS Settings.')); else gameCenterSync(true); });
    },
    buyPerk: function (d) {
      if (!X.buyPerk(S(), d.id)) return;
      A.play('stamp', 1); PL.haptic('success');
      FX.confetti(innerWidth / 2, innerHeight / 3, 50);
      UI.refreshPanel(true); ctx.save(true);
    },
    respecPerks: function () {
      UI.modal(UI.head('📜 ' + tE('Repeal the Bill of Rights?'), '') + '<div class="modal-body"><p>' + tE('All perks are removed and every point is refunded, for ★{n}.', { n: XD.PERK_RESPEC_LB }) + '</p><div class="dialog-actions"><button class="btn blue" data-act="close">' + tE('Cancel') + '</button><button class="btn red" data-act="respecConfirm">' + tE('Repeal') + '</button></div></div>', 'small');
    },
    respecConfirm: function () { UI.closeTop(); if (X.respecPerks(S())) { A.play('stamp', 0.8); UI.refreshPanel(true); ctx.save(true); } },
    openSeniority: function (d) { openSeniority(+d.i); },
    pickSen: function (d) {
      var s = S();
      if (!X.pickSenPerk(s, s.world, +d.i, +d.t, +d.c)) return;
      A.play('fanfare', 0.6); PL.haptic('success');
      UI.closeTop(); openSeniority(+d.i);
      UI.refreshPanel(true); ctx.save(true);
    },
    backupNow: function () { snapshot('manual'); A.play('stamp', 0.6); FX.toast('💾', T('Backup saved'), T('Kept on this device.'), { minor: true }); UI.refreshPanel(true); },
    restoreBackup: function (d) {
      var b = (backupList || PL.readBackups())[+d.k];
      if (!b) return;
      UI.modal(UI.head('💾 ' + tE('Restore this backup?'), new Date(b.t).toLocaleString()) + '<div class="modal-body"><p>' + tE('Your current progress is backed up first, then the game reloads with this snapshot.') + '</p><div class="dialog-actions"><button class="btn blue" data-act="close">' + tE('Cancel') + '</button><button class="btn red" data-act="restoreConfirm" data-k="' + (+d.k) + '">' + tE('Restore') + '</button></div></div>', 'small');
    },
    restoreConfirm: function (d) {
      var b = (backupList || PL.readBackups())[+d.k];
      if (!b) return;
      try { E.deserialize(b.data); } catch (e) { FX.toast('⚠️', T('Import failed'), T('That code doesn\'t look like a save.')); return; }
      var data = b.data;
      snapshot('restore');
      PL.writeSave(data, true);
      if (root.Game && root.Game.reloadWithoutSave) root.Game.reloadWithoutSave();
    }
  };

  // Library panel gets a Museum tab.
  var libPanel = UI.PANELS.library;
  UI.PANELS.library = function () {
    var r = libPanel();
    if ((UI.panelTab.library || 'cabinet') === 'museum') {
      var cut = r.body.indexOf('<div class="modal-tabs"');
      var head = r.body.slice(0, cut);
      r.body = head + UI.tabs('library', [['cabinet', tE('Cabinets & Landmarks')], ['events', tE('Event Collections')], ['museum', '🖼️ ' + tE('Museum')]]) + museum();
    } else r.body = r.body.replace(/(<div class="modal-tabs"[^]*?)(<\/div>)/, function (m, a, b) { return a + '<button role="tab" aria-selected="false" class="" data-act="tab" data-panel="library" data-tab="museum">🖼️ ' + tE('Museum') + '</button>' + b; });
    return r;
  };

  root.ExtrasUI = {
    init: init, hubChips: hubChips, moreItems: moreItems, dot: dot, dotCount: dotCount, decisionLabel: decisionLabel,
    welcomeSummary: welcomeSummary, notifications: notifications, snapshot: snapshot, backupsSection: backupsSection,
    settingsSection: settingsSection, slowTick: slowTick, museum: museum, gameCenterSync: gameCenterSync, ACTIONS: ACTIONS
  };
})(typeof window !== 'undefined' ? window : globalThis);
