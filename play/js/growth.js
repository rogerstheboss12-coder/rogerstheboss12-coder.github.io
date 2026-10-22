/* Growth (1.1.4): helping players bring friends. Share text with the invite code on its own line, the one-time
 * "Did a friend invite you?" paste card, share-card headlines and poster slogans, win-back reminders and the
 * browser build's "free on the App Store" card. Rules: every link is the App Store; sharing is never rewarded
 * (only a new player entering a code is, through the existing Campaign redeem flow); all content is parody.
 * Logic is plain functions so it can be tested in Node; the UI part runs only in the browser. */
(function (root) {
  'use strict';
  var DAY = 86400000;
  // App Analytics campaign links: shares and the web game's App Store card are counted separately in App Store Connect.
  var APP_STORE = 'https://apps.apple.com/app/apple-store/id6816208938?pt=129442366&ct=sst-share&mt=8', WEB2IOS = 'https://apps.apple.com/app/apple-store/id6816208938?pt=129442366&ct=sst-web2ios&mt=8';
  var INVITE_RE = /^[A-HJKMNP-Z2-9]{6}$/;   // same format as Campaign / server/worker.js
  function T(s, v) { return root.T ? root.T(s, v) : s.replace(/\{(\w+)\}/g, function (m, k) { return v && v[k] != null ? v[k] : m; }); }

  function state(s) {
    var g = s.extras.growth || (s.extras.growth = {});
    if (g.pasteSeen === undefined) g.pasteSeen = false;
    if (g.webCards === undefined) g.webCards = 0;
    if (g.webCardAt === undefined) g.webCardAt = 0;      // playtime (s) when the last web card was shown
    return g;
  }

  // ---------- Share text: the code gets its own line so it survives the trip through the App Store ----------
  var SHARE_LINES = {
    invite: 'Build a ridiculous political empire with me in Star-Spangled Tycoon! Enter my code in Campaign HQ for ★{n} free.',
    card: 'Breaking news from my parody political empire in Star-Spangled Tycoon! Enter my code in Campaign HQ for ★{n} free.',
    poster: 'My parody campaign poster, made in Star-Spangled Tycoon. Enter my code in Campaign HQ for ★{n} free.'
  };
  var SHARE_NOCODE = {
    invite: 'Build a ridiculous political empire with me in Star-Spangled Tycoon!',
    card: 'Breaking news from my parody political empire in Star-Spangled Tycoon!',
    poster: 'My parody campaign poster, made in Star-Spangled Tycoon.'
  };
  function shareText(kind, code, url, bonus) {
    kind = SHARE_LINES[kind] ? kind : 'card';
    var lines = [code ? T(SHARE_LINES[kind], { n: bonus }) : T(SHARE_NOCODE[kind])];
    if (code) lines.push(T('Code: {code}', { code: code }));
    lines.push(url || APP_STORE);
    return lines.join('\n');
  }

  // A pasted message → the invite code in it ('' if none). Accepts the whole share text ("Code: K7M2QX",
  // also the older "use my code K7M2QX"), an invite link (?c= / ?ref=) or just the code.
  function parseInviteCode(text) {
    var t = String(text == null ? '' : text), m, re = /(?:code|c[oó]digo)\s*[:：]?\s*([A-Za-z0-9]{6})(?![A-Za-z0-9])/gi;
    while ((m = re.exec(t))) { if (INVITE_RE.test(m[1].toUpperCase())) return m[1].toUpperCase(); }
    m = /[?&](?:ref|c)=([A-Za-z0-9]{6})(?![A-Za-z0-9])/.exec(t);
    if (m && INVITE_RE.test(m[1].toUpperCase())) return m[1].toUpperCase();
    var bare = t.trim().replace(/[\s-]/g, '').toUpperCase();
    return INVITE_RE.test(bare) ? bare : '';
  }

  // The one-time paste card: after the tutorial, inside the redeem window, before any friend code is used.
  function pasteCardDue(s, t, C, B) {
    C = C || root.Campaign; B = B || root.BUILD || {};
    if (B.demo || !s.tutorial.done || state(s).pasteSeen) return false;
    if (C.pendingInvite && C.pendingInvite()) return false;   // an invite link already carries the code
    return C.canRedeem(s, t);
  }

  // ---------- Share cards ----------
  // Optional share button: first election and every 10th; the other milestones every time.
  function shareMoment(kind, s) {
    if (kind === 'election') { var n = s.stats.elections || 0; return n === 1 || (n > 0 && n % 10 === 0); }
    return !!HEADLINES[kind];
  }
  var HEADLINES = {
    election: [
      '{name} Wins in a Landslide; Opponent Demands a Recount of the Recount',
      'Election #{n}: {name} Wins, Credits "Free Fireworks" Platform',
      '{name} Sweeps {world}; Pundits Run Out of Adjectives',
      'Voters Choose {name}, Then Ask for Seconds',
      '{name} Victory Speech Runs Four Hours; Crowd Demands Encore'
    ],
    convention: [
      'Constitution Amended Again; Founders Reportedly "Fine With It"',
      '{name} Ratifies Amendment #{n}: Mandatory Fireworks Fridays',
      'Constitutional Convention Ends Early After Someone Brings Pie',
      '{name} Rewrites the Rules, Adds Footnotes and a Glossary'
    ],
    launch: [
      '{name} Plants Flag on {world}; Locals Unsure What a Flag Is',
      'Rocket Launch a Success: {world} Gets Its First Gift Shop',
      '{name} Lands on {world}, Immediately Opens a Flag Stand',
      'One Small Step for {name}, One Giant Leap for Souvenir Sales'
    ],
    eventTier: [
      '{name} Crushes Festival Goals; Funnel Cake Futures Soar',
      'Reward Tier Cleared! Confetti Reserves "Critically Low"',
      '{name} Wins the Festival, Declares Every Day a Holiday'
    ],
    debate: [
      '{name} Wins Debate by Saying "Freedom" 41 Times',
      'Moderator Gives Up, Declares {name} the Winner',
      '{name} Wins Debate; Rival Still Looking for Note Cards',
      'Fact-Checkers Need a Nap After {name} Debate Victory'
    ],
    showdown: [
      '{name} Defeats Giant Monster; Insurance Companies Weep',
      'Monster Defeated! {name} Offers It a Cabinet Position',
      'Showdown Final Score: {name} 1, Monster 0'
    ]
  };
  var DECKS = [
    'Sources close to the Cabinet confirm the President "had snacks the whole time."',
    'Eagles across the nation were reportedly "cautiously thrilled."',
    'Economists call the result "unprecedented, and also very shiny."',
    'The Cabinet celebrated with a parade, a second parade and a nap.',
    'Experts agree: nobody saw this coming, except everybody.'
  ];
  // seed: any non-negative integer (the UI passes a random one; tests pass fixed ones).
  function headline(kind, vars, seed) {
    var list = HEADLINES[kind] || HEADLINES.election, n = seed >>> 0;
    return { head: T(list[n % list.length], vars), deck: T(DECKS[Math.floor(n / list.length) % DECKS.length]) };
  }
  var SLOGANS = [
    'A Chicken in Every Pot, a Rocket in Every Garage', 'Four More Years (of Naps)', 'Vote for Me. I Have Snacks.',
    'Liberty, Justice and Free Parking', 'Promises Kept: 3. Promises Made: 4,000.', 'Lower Taxes, Higher Fireworks',
    'Fiscally Responsible-ish', 'Ask Not What Your Galaxy Can Do for You', 'Tough on Crime, Soft on Puppies',
    'Proudly Undecided on Every Issue', 'The Candidate Your Mom Would Pick', 'Bald Eagles for Everyone',
    'Now With 20% More Democracy', 'No Promises. Just Vibes.', 'Building Bridges to Mars', 'One Nation, Under Construction',
    'I Cannot Tell a Lie: I\'m Great', 'Speak Softly and Carry a Big Rocket', 'Because Somebody Has To',
    'Experience You Can Almost Trust', 'Free Pie Fridays', 'Read My Lips: More Fireworks', 'Keep Calm and Vote for Me',
    'A Flag Stand on Every Corner', 'Strong Economy, Stronger Hats', 'Your Vote Counts (We Checked Twice)',
    'Making Mondays Optional', 'From Sea to Shining Space Station', 'Honest. Mostly.', 'Taxes Are Down, Confetti Is Up',
    'Elect the Mustache', 'The Moon Is Just the Beginning', 'I Have a Plan. It\'s a Secret.', 'Vote Early, Vote Snacky',
    'Life, Liberty and the Pursuit of Naps', 'More Eagles, Fewer Meetings', 'Approved by 9 out of 10 Eagles',
    'Leading From Slightly Behind', 'The Galaxy Needs a Manager', 'Proudly Running Unopposed (Hopefully)'
  ];

  // ---------- Win-back reminders (only scheduled when the player turned reminders on) ----------
  var MEMOS = [
    { who: 'George Washingtun', line: 'The treasury vault won\'t close anymore. Too much money. Please advise.' },
    { who: 'Abe Lincorn', line: 'We held a Cabinet meeting without you. It was mostly pie.' },
    { who: 'Teddy Roosebolt', line: 'The eagles keep asking where you went. I said "vacation." They did not believe me.' },
    { who: 'Thomas Jeffersong', line: 'I have drafted a Declaration of Please Come Back.' },
    { who: 'Alexander Hamiltoon', line: 'I did the math. You are extremely rich. Come count it.' },
    { who: 'Cosmic Uncle Sam', line: 'I want YOU… to collect your earnings.' }
  ];
  // gainFor(seconds) → offline earnings for that long, already formatted ('' when the Cabinet earns nothing yet).
  // The lines rotate by day, so a player who keeps coming back sees a different memo each time.
  function winback(t, gainFor) {
    var day = Math.floor(t / DAY);
    return [{ id: 13, days: 3, k: 0 }, { id: 14, days: 7, k: 1 }].map(function (w) {
      var m = MEMOS[(day + w.k * 3) % MEMOS.length], x = gainFor(w.days * DAY / 1000), line = '“' + T(m.line) + '” ';
      return {
        id: w.id, at: t + w.days * DAY, title: T('📜 A memo from {who}', { who: m.who }),
        body: line + (x ? T(w.days === 3 ? 'Your Cabinet has earned about {x} since you left.' : 'About {x} is waiting in your treasury.', { x: x }) : T('Your Cabinet is waiting for you, President.'))
      };
    });
  }

  // ---------- Browser build: "Your empire on iPhone" card ----------
  var WEB_CARD_MAX = 2, WEB_CARD_GAP = 1800;
  function webCardDue(s, B) {
    B = B || root.BUILD || {};
    var p = B.ads && B.ads.provider;
    if (!B.web || B.demo || B.appLive === false || p === 'crazygames' || p === 'gamedistribution') return false;   // portals that forbid outbound links
    var g = state(s);
    if (!s.tutorial.done || g.webCards >= WEB_CARD_MAX) return false;
    return !g.webCards || s.stats.playtime - g.webCardAt >= WEB_CARD_GAP;
  }
  function markWebCard(s) { var g = state(s); g.webCards++; g.webCardAt = s.stats.playtime; }

  root.Growth = {
    APP_STORE: APP_STORE, HEADLINES: HEADLINES, SLOGANS: SLOGANS, MEMOS: MEMOS, WEB_CARD_MAX: WEB_CARD_MAX,
    state: state, shareText: shareText, parseInviteCode: parseInviteCode, pasteCardDue: pasteCardDue,
    shareMoment: shareMoment, headline: headline, winback: winback, webCardDue: webCardDue, markWebCard: markWebCard
  };

  // ---------------------------------------------------------------- UI (browser only)
  var UI = root.UI;
  if (!UI || !root.ExtrasUI || !root.Campaign) return;
  var G = root.Growth, C = root.Campaign, D = root.GameData, E = root.Engine, F = root.Fmt, P = root.Portraits, FX = root.FX, PL = root.Platform, A = root.GameAudio;
  function S() { return UI.state(); }
  function tE(s, v) { return UI.tE(s, v); }
  function esc(s) { return UI.esc(s); }
  function track(name, props) { if (root.Analytics) root.Analytics.track(name, props || {}); }
  function myCode() { return C.state(S()).invite.code; }
  function textFor(kind) { var code = myCode(); return shareText(kind, code, C.inviteUrl(code), C.CFG.invite.newPlayer); }
  function busyFree() { return !UI.anyModal() && !document.querySelector('.cine, .wa-house') && !(root.Tutorial && root.Tutorial.active()); }

  // Everything a card shows about the player.
  function mainWi(s) { return E.isMain(s.world) ? s.world : 0; }
  function cardInfo(kind, s, extra) {
    var wi = mainWi(s), w = D.WORLDS[wi], ws = s.worlds[wi];
    var hired = w.managers.filter(function (m, i) { return ws.biz[i] && ws.biz[i].manager; });
    var face = (extra && extra.face) || (hired.length ? hired[Math.floor(Math.random() * hired.length)] : w.managers[0]).face;
    var worlds = 0; for (var i = 0; i < D.MAIN_WORLDS; i++) if (s.unlocked[i]) worlds++;
    var name = root.Extras.leagueIdentity(s).name;
    var vars = { name: name, world: UI.wn(extra && extra.world != null ? extra.world : wi), n: F.num(extra && extra.n != null ? extra.n : kind === 'convention' ? s.amendments : s.stats.elections || 0) };
    var h = headline(kind, vars, Math.floor(Math.random() * 1e6));
    return {
      kind: kind, name: name, face: face, faceBg: w.accent, head: h.head, deck: h.deck, code: myCode(), slogan: extra && extra.slogan,
      date: new Date(E.now()).toLocaleDateString(root.I18N ? root.I18N.current() : 'en', { year: 'numeric', month: 'long', day: 'numeric' }),
      stats: [[T('All-time earnings'), F.money(ws.lifetime, w.sym)], [T('Elections won'), F.num(s.stats.elections || 0)],
        [T('Amendments'), F.num(s.amendments)], [T('Worlds'), worlds + ' / ' + D.MAIN_WORLDS]],
      labels: { masthead: T('The Star-Spangled Gazette'), edition: T('Parody edition'), free: T('Free on the App Store'), code: T('Code: {code}', { code: myCode() }),
        price: T('Price: one Liberty Buck'), parody: T('A parody game. All characters are fictional caricatures.'), vote: T('Vote'), world: UI.wn(wi) }
    };
  }

  // Preview → share. No reward of any kind for sharing.
  function openPreview(info, kind) {
    var SC = root.ShareCard;
    if (!SC) return;
    SC.render(info).then(function (canvas) {
      var url = canvas.toDataURL('image/png');
      UI.modal(UI.head('📤 ' + tE('Share'), '') + '<div class="modal-body center"><img class="share-preview" alt="' + esc(info.head || info.slogan || '') + '" src="' + url + '">' +
        '<div class="dialog-actions"><button class="btn blue" data-act="close">' + tE('Not now') + '</button><button class="btn big" data-act="growthShareNow">📤 ' + tE('Share') + '</button></div></div>', 'small share-modal');
      pending = { url: url, text: textFor(kind === 'poster' ? 'poster' : 'card'), kind: kind };
    });
  }
  var pending = null;

  // Floating "📤 Share" pill after a milestone; it fades on its own and is never required.
  var pill = null, pillTimer = 0;
  function offer(kind, extra) {
    var s = S();
    if (PL.demo || !root.ShareCard || !s.tutorial.done || !shareMoment(kind, s)) return;
    var info = cardInfo(kind, s, extra);
    if (pill) pill.remove();
    clearTimeout(pillTimer);
    pill = document.createElement('button');
    pill.className = 'share-pill';
    pill.innerHTML = '📤 ' + tE('Share');
    pill.addEventListener('click', function () { A.play('click', 0.6); hidePill(); track('share_card_open', { k: kind }); openPreview(info, kind); });
    document.body.appendChild(pill);
    pillTimer = setTimeout(hidePill, 12000);
  }
  function hidePill() { clearTimeout(pillTimer); if (pill) { pill.remove(); pill = null; } }

  // Campaign poster: pick a portrait and a slogan.
  var poster = { face: '', slogan: 0 };
  function posterFaces(s) {
    var out = [];
    for (var wi = 0; wi < D.MAIN_WORLDS; wi++) if (s.unlocked[wi]) D.WORLDS[wi].managers.forEach(function (m) { out.push({ face: m.face, name: m.name, bg: D.WORLDS[wi].accent }); });
    return out;
  }
  function posterModal() {
    var s = S(), faces = posterFaces(s);
    if (!poster.face || !faces.some(function (f) { return f.face === poster.face; })) poster.face = faces[0].face;
    var body = '<p class="panel-note">' + tE('Pick a portrait and a slogan, then share your poster.') + '</p><div class="poster-faces">' + faces.map(function (f) {
      return '<button class="poster-face' + (f.face === poster.face ? ' on' : '') + '" data-act="posterFace" data-face="' + esc(f.face) + '" aria-label="' + esc(f.name) + '">' + P.portrait(f.face, { uid: 'pf' + f.face, bg: f.bg }) + '</button>';
    }).join('') + '</div><div class="setting"><span>' + tE('Slogan') + '</span><select aria-label="' + tE('Slogan') + '" onchange="Game.act(\'posterSlogan\', {v: this.value})">' +
      SLOGANS.map(function (x, i) { return '<option value="' + i + '"' + (i === poster.slogan ? ' selected' : '') + '>' + esc(T(x)) + '</option>'; }).join('') + '</select></div>' +
      '<div class="dialog-actions"><button class="btn blue" data-act="posterRandom">🎲 ' + tE('Surprise me') + '</button><button class="btn big" data-act="posterMake">🖼️ ' + tE('Make poster') + '</button></div>';
    if (posterWrap && posterWrap.isConnected) { posterWrap.querySelector('.modal-body').innerHTML = body; return; }
    posterWrap = UI.modal(UI.head('🖼️ ' + tE('Campaign poster'), '') + '<div class="modal-body">' + body + '</div>', 'small');
  }
  var posterWrap = null;

  // Paste card: a friend's share text is on the clipboard; read it only when the player taps Paste.
  function pasteCard() {
    G.state(S()).pasteSeen = true;
    track('invite_paste_card', {});
    UI.modal(UI.head('🤝 ' + tE('Did a friend invite you?'), '') + '<div class="modal-body"><p>' + tE('If a friend sent you a message with a code, copy it and tap Paste. You both get Liberty Bucks: ★{n} for you.', { n: C.CFG.invite.newPlayer }) + '</p>' +
      '<div class="dialog-actions"><button class="btn blue" data-act="close">' + tE('No thanks') + '</button><button class="btn blue" data-act="campaignEnter">' + tE('Type it') + '</button><button class="btn big" data-act="growthPaste">📋 ' + tE('Paste code') + '</button></div></div>', 'small');
    root.Game.save();
  }

  function webCard(moment) {
    var s = S(), B = root.BUILD || {};
    if (!webCardDue(s, B)) return;
    setTimeout(function () {
      if (!busyFree() || !webCardDue(s, B)) return;
      markWebCard(s);
      track('web_app_card', { m: moment });
      UI.modal(UI.head('📱 ' + tE('Your empire on iPhone'), '') + '<div class="modal-body center"><p>' + tE('Star-Spangled Tycoon is free on the App Store, with iCloud saves and reminders.') + '</p>' +
        '<div class="dialog-actions"><button class="btn blue" data-act="close">' + tE('Keep playing') + '</button><a class="btn gold big" href="' + esc(B.portal && B.appUrl ? B.appUrl : WEB2IOS) + '" target="_blank" rel="noopener" data-act="close">📱 ' + tE('Free on the App Store') + '</a></div></div>', 'small');
      root.Game.save();
    }, 4000);
  }

  var ACTIONS = {
    growthShareNow: function () {
      if (!pending) return;
      var p = pending;
      track('share_card', { k: p.kind });
      PL.shareImage(p.url, p.text, 'star-spangled-' + p.kind + '.png').then(function (r) { if (r === 'downloaded') FX.toast('🖼️', T('Image saved'), T('The message was copied too. Paste it next to the picture.')); });
      UI.closeTop();
    },
    growthPoster: function () { posterModal(); },
    posterFace: function (d) { poster.face = d.face; posterModal(); },
    posterSlogan: function (d) { poster.slogan = Math.max(0, Math.min(SLOGANS.length - 1, d.v | 0)); },
    posterRandom: function () { poster.slogan = Math.floor(Math.random() * SLOGANS.length); var f = posterFaces(S()); poster.face = f[Math.floor(Math.random() * f.length)].face; posterModal(); },
    posterMake: function () {
      var s = S(), f = posterFaces(s).filter(function (x) { return x.face === poster.face; })[0];
      var info = cardInfo('poster', s, { face: poster.face, slogan: T(SLOGANS[poster.slogan]) });
      info.faceBg = f ? f.bg : info.faceBg;
      UI.closeTop(); track('poster_make', { s: poster.slogan });
      openPreview(info, 'poster');
    },
    growthPaste: function () {
      var read = navigator.clipboard && navigator.clipboard.readText ? navigator.clipboard.readText() : Promise.reject(new Error('no clipboard'));
      read.then(function (txt) {
        var code = parseInviteCode(txt);
        UI.closeTop();
        if (!code) { FX.toast('📋', T('No code found'), T('Copy the code from your friend\'s message, or type it in.')); root.Game.act('campaignEnter', {}); return; }
        root.Game.act('campaignEnter', { code: code });
        root.Game.act('campaignRedeem', {});
      }, function () { UI.closeTop(); root.Game.act('campaignEnter', {}); });
    }
  };
  Object.keys(ACTIONS).forEach(function (k) { root.ExtrasUI.ACTIONS[k] = ACTIONS[k]; });

  // 1 Hz from the game loop.
  function tick() {
    var s = S();
    if (s && busyFree() && pasteCardDue(s, E.now())) pasteCard();
  }
  root.GrowthUI = { offer: offer, webCard: webCard, tick: tick, textFor: textFor };
})(typeof window !== 'undefined' ? window : globalThis);
