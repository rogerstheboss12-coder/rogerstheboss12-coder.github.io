/* Ads for the browser build (`node scripts/build.mjs --web`). Does nothing in the app or the demo.
 *  - Rewarded + interstitial breaks through Google's H5 Games Ads (the AdSense Ad Placement API: adBreak/adConfig).
 *  - A 300×600 display rail beside the game on wide screens.
 *  - House ads (our own promos) whenever Google has nothing to show — including before AdSense approves the site —
 *    so rewarded perks keep working and every slot is filled.
 * Portal builds (`--portal=`) swap the provider: 'crazygames' uses the CrazyGames SDK (no outbound links allowed),
 * 'none' (itch.io) shows only house ads. Settings come from site.config.json via window.BUILD.ads. */
(function (root) {
  'use strict';
  var B = root.BUILD || {}, ON = !!B.web, C = B.ads || {}, SLOTS = C.slots || {};
  var PROVIDER = C.provider || 'adsense', NO_LINKS = PROVIDER === 'crazygames';
  var cg = null; // CrazyGames SDK once initialised
  var SITE = B.siteUrl || '/';
  var ready = false, started = Date.now(), lastBreak = 0;
  var audio = { mute: function () {}, unmute: function () {} };
  function min(n, d) { return (typeof n === 'number' ? n : d) * 60000; }

  // ---------------- Google loader ----------------
  function loadGoogle() {
    if (!C.client) return;
    root.adsbygoogle = root.adsbygoogle || [];
    root.adBreak = root.adConfig = function (o) { root.adsbygoogle.push(o); };
    var s = document.createElement('script');
    s.async = true; s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(C.client);
    s.setAttribute('data-ad-client', C.client);
    s.setAttribute('data-ad-frequency-hint', '30s');
    if (C.testMode) s.setAttribute('data-adbreak-test', 'on');
    document.head.appendChild(s);
    root.adConfig({ preloadAdBreaks: 'on', sound: 'on', onReady: function () { ready = true; } });
  }

  // ---------------- House ads ----------------
  var PROMOS = [
    { icon: 'assets/branding/icon_1024.png', title: 'Take your empire to go', body: B.appLive ? 'Star-Spangled Tycoon is free on iPhone and iPad.' : 'Star-Spangled Tycoon is coming soon to iPhone and iPad.', href: B.appLive ? B.appUrl : SITE, cta: B.appLive ? 'Get the app' : 'Visit the website' },
    { icon: 'assets/icons/w1_b2.png', title: 'What\'s your parody politician name?', body: 'Type your first name, meet your candidate, share your campaign card.', href: SITE + 'name/', cta: 'Find my name' },
    { icon: 'assets/icons/w1_b6.png', title: 'Flip-Flopson or Moneybags?', body: 'The Great 2026 Parody Election is live. See who\'s winning.', href: SITE + 'goal/', cta: 'See the results' },
    { icon: 'assets/icons/w4_b10.png', title: 'Every Cabinet member, explained', body: 'The Codex has the (mostly) true history of all 100 businesses and politicians.', href: SITE + 'codex/', cta: 'Open the Codex' }
  ];
  var promoIx = Math.floor(Math.random() * PROMOS.length);
  function nextPromo() { return PROMOS[promoIx++ % PROMOS.length]; }
  function t(s) { return root.T ? root.T(s) : s; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function promoHtml(p) {
    return '<img src="' + p.icon + '" alt="" width="96" height="96"><b>' + esc(t(p.title)) + '</b><p>' + esc(t(p.body)) + '</p>' +
      (NO_LINKS ? '' : '<a class="wa-cta" href="' + p.href + '" target="_blank" rel="noopener">' + esc(t(p.cta)) + '</a>');
  }
  // A 5-second sponsor card. Resolves 'earned' once the countdown finishes and the player claims.
  function houseRewarded() {
    return new Promise(function (res) {
      var wrap = document.createElement('div');
      wrap.className = 'wa-house'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-label', t('Sponsored'));
      wrap.innerHTML = '<div class="wa-card"><small>' + esc(t('A word from our sponsor')) + '</small>' + promoHtml(nextPromo()) +
        '<button class="wa-claim" disabled>' + esc(t('Reward in')) + ' <span>5</span></button></div>';
      document.body.appendChild(wrap);
      var btn = wrap.querySelector('.wa-claim'), n = 5;
      var iv = setInterval(function () {
        n--;
        if (n > 0) { btn.querySelector('span').textContent = n; return; }
        clearInterval(iv);
        btn.disabled = false; btn.textContent = '🎁 ' + t('Claim reward');
        btn.focus();
      }, 1000);
      btn.addEventListener('click', function () { wrap.remove(); res('earned'); });
    });
  }

  // ---------------- CrazyGames ----------------
  // The SDK script is in the page head (build.mjs); Platform initialises it before loading the save.
  function loadCrazyGames() {
    var sdk = root.CrazyGames && root.CrazyGames.SDK;
    if (!sdk || !root.Platform) return;
    root.Platform.cgReady.then(function (ok) {
      if (!ok) return;
      cg = sdk;
      try { sdk.game.loadingStop(); sdk.game.gameplayStart(); } catch (e) {}
    });
  }
  function cgAd(kind) {
    return new Promise(function (res) {
      if (!cg) return res('nofill');
      var done = false;
      function end(r) { if (!done) { done = true; audio.unmute(); try { cg.game.gameplayStart(); } catch (e) {} res(r); } }
      try { cg.game.gameplayStop(); } catch (e) {}
      cg.ad.requestAd(kind, {
        adStarted: function () { audio.mute(); },
        adFinished: function () { lastBreak = Date.now(); end('earned'); },
        adError: function () { end('nofill'); }
      });
    });
  }

  // ---------------- Breaks ----------------
  // Resolves 'earned', 'dismissed' or 'nofill' like Platform.showRewardedAd.
  function rewarded(name) {
    if (!ON) return Promise.resolve('nofill');
    // CrazyGames: their ad or the game's own capped "this one's on us" grant (Platform.showRewardedAd → 'nofill').
    if (PROVIDER === 'crazygames') return cgAd('rewarded');
    if (PROVIDER === 'none' || !ready) return houseRewarded();
    return new Promise(function (res) {
      var done = false, shown = false;
      function end(r) { if (done) return; done = true; clearTimeout(guard); lastBreak = Date.now(); res(r); }
      function fallback() { if (done) return; done = true; clearTimeout(guard); houseRewarded().then(res); }
      // If Google hasn't offered an ad within 5s, stop waiting.
      var guard = setTimeout(function () { if (!shown) fallback(); }, 5000);
      root.adBreak({
        type: 'reward', name: String(name || 'reward'),
        beforeAd: function () { shown = true; audio.mute(); },
        afterAd: function () { audio.unmute(); },
        beforeReward: function (showAdFn) { if (!done) showAdFn(); },
        adViewed: function () { end('earned'); },
        adDismissed: function () { end('dismissed'); },
        adBreakDone: function (info) {
          if (done) return;
          if (!shown) fallback();
          else end(info && info.breakStatus === 'viewed' ? 'earned' : 'dismissed');
        }
      });
    });
  }
  // Full-screen ad at a natural pause. Silently skipped when too soon or when Google has nothing.
  function interstitial(name) {
    if (!ON || (PROVIDER === 'adsense' && !ready) || (PROVIDER === 'crazygames' && !cg) || PROVIDER === 'none') return;
    var now = Date.now();
    if (now - started < min(C.firstInterstitialAfterMin, 5) || now - lastBreak < min(C.minMinutesBetweenInterstitials, 3)) return;
    if (document.hidden) return;
    lastBreak = now;
    if (PROVIDER === 'crazygames') { cgAd('midgame'); return; }
    root.adBreak({ type: 'next', name: String(name || 'next'), beforeAd: function () { audio.mute(); }, afterAd: function () { audio.unmute(); } });
  }

  // ---------------- Display rail (wide screens only) ----------------
  function mountRail() {
    if (!root.matchMedia || !root.matchMedia('(min-width: 1400px) and (min-height: 640px)').matches) return;
    var el = document.createElement('aside');
    el.id = 'ad-rail'; el.setAttribute('aria-label', t('Advertisement'));
    if (C.client && SLOTS.rail) {
      el.innerHTML = '<small>' + esc(t('Advertisement')) + '</small><ins class="adsbygoogle" style="display:inline-block;width:300px;height:600px" data-ad-client="' +
        esc(C.client) + '" data-ad-slot="' + esc(SLOTS.rail) + '"></ins>';
    } else {
      el.innerHTML = '<small>' + esc(t('Sponsored')) + '</small><div class="wa-card wa-rail-card">' + promoHtml(nextPromo()) + '</div>';
    }
    document.body.appendChild(el);
    document.documentElement.classList.add('has-rail');
    if (C.client && SLOTS.rail) { try { (root.adsbygoogle = root.adsbygoogle || []).push({}); } catch (e) {} }
  }

  root.WebAds = {
    on: ON, provider: PROVIDER, noLinks: NO_LINKS, rewarded: rewarded, interstitial: interstitial,
    setAudio: function (mute, unmute) { audio.mute = mute; audio.unmute = unmute; }
  };
  if (ON && PROVIDER === 'adsense') {
    loadGoogle();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountRail); else mountRail();
  } else if (ON && PROVIDER === 'crazygames') loadCrazyGames();
})(typeof window !== 'undefined' ? window : globalThis);
