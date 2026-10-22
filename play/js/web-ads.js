/* Ads for the browser build (`node scripts/build.mjs --web`). Does nothing in the app or the demo.
 *  - Rewarded + interstitial breaks through Google's H5 Games Ads (the AdSense Ad Placement API: adBreak/adConfig).
 *  - A 300×600 display rail beside the game on wide screens.
 *  - House ads (our own promos) whenever Google has nothing to show — including before AdSense approves the site —
 *    so rewarded perks keep working and every slot is filled.
 * Portal builds (`--portal=`) swap the provider: 'crazygames' uses the CrazyGames SDK, 'gamedistribution' (also GameMonetize)
 * uses the gdsdk SDK; both allow no outbound links. 'none' (itch.io, generic) shows only house ads, and 'poki' is a stub that
 * shows house ads. Settings come from site.config.json via window.BUILD.ads. */
(function (root) {
  'use strict';
  var B = root.BUILD || {}, ON = !!B.web, C = B.ads || {}, SLOTS = C.slots || {};
  var PROVIDER = C.provider || 'adsense', NO_LINKS = PROVIDER === 'crazygames' || PROVIDER === 'gamedistribution';
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
  // Owner, Oct 21: every house ad promotes the iPhone/iPad app (App Analytics campaign ct=sst-webad); portals keep their own app link.
  var APP_AD = B.portal && B.appUrl ? B.appUrl : 'https://apps.apple.com/app/apple-store/id6816208938?pt=129442366&ct=sst-webad&mt=8';
  var PROMOS = B.appLive ? [
    { icon: 'assets/branding/icon_1024.png', title: 'Take your empire to go', body: 'Star-Spangled Tycoon is free on iPhone and iPad.', href: APP_AD, cta: 'Get the app' },
    { icon: 'assets/icons/w1_b6.png', title: 'Your Cabinet, in your pocket', body: 'Collect offline earnings on your phone. Free on the App Store.', href: APP_AD, cta: 'Get it free' },
    { icon: 'assets/icons/w4_b10.png', title: 'Run the Multiverse from your iPhone', body: 'Same game, made for iPhone and iPad, with iCloud saves and Game Center.', href: APP_AD, cta: 'Free on the App Store' },
    { icon: 'assets/icons/w1_b2.png', title: 'New events every 3 days', body: 'Get a reminder when the next event starts. Free on iPhone and iPad.', href: APP_AD, cta: 'Get the app' }
  ] : [
    { icon: 'assets/branding/icon_1024.png', title: 'Take your empire to go', body: 'Star-Spangled Tycoon is coming soon to iPhone and iPad.', href: SITE, cta: 'Visit the website' }
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

  // ---------------- GameDistribution / GameMonetize ----------------
  // build.mjs sets window.GD_OPTIONS (game id; events forwarded to gdEvent) and loads the gdsdk script in the head.
  var gdPending = null; // the rewarded ad on screen: { end, fallback }
  function gdOk() { return !!(root.gdsdk && typeof root.gdsdk.showAd === 'function'); }
  function gdRewarded() {
    return new Promise(function (res) {
      var done = false;
      function end(r) { if (done) return; done = true; gdPending = null; lastBreak = Date.now(); res(r); }
      function fallback() { if (done) return; done = true; gdPending = null; houseRewarded().then(res); }
      gdPending = { end: end, fallback: fallback };
      Promise.resolve().then(function () { return root.gdsdk.showAd('rewarded'); }).catch(fallback);
    });
  }
  // SDK events: pause/resume map to the game's audio pause; the reward resolves 'earned' (closing without it is 'dismissed').
  function gdEvent(e) {
    var name = e && e.name;
    if (name === 'SDK_GAME_PAUSE') audio.mute();
    else if (name === 'SDK_GAME_START') { audio.unmute(); if (gdPending) gdPending.end('dismissed'); }
    else if (name === 'SDK_REWARDED_WATCH_COMPLETE') { if (gdPending) gdPending.end('earned'); }
    else if (name === 'SDK_ERROR') { if (gdPending) gdPending.fallback(); }
  }

  // ---------------- Breaks ----------------
  // Resolves 'earned', 'dismissed' or 'nofill' like Platform.showRewardedAd.
  function rewarded(name) {
    if (!ON) return Promise.resolve('nofill');
    // CrazyGames: their ad or the game's own capped "this one's on us" grant (Platform.showRewardedAd → 'nofill').
    if (PROVIDER === 'crazygames') return cgAd('rewarded');
    // GameDistribution: their rewarded ad, or house ads if the SDK is missing or fails.
    if (PROVIDER === 'gamedistribution') return gdOk() ? gdRewarded() : houseRewarded();
    // Poki is a stub: house ads only until its SDK is wired.
    if (PROVIDER === 'none' || PROVIDER === 'poki' || !ready) return houseRewarded();
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
    if (!ON || (PROVIDER === 'adsense' && !ready) || (PROVIDER === 'crazygames' && !cg) || PROVIDER === 'none' || PROVIDER === 'poki' ||
        (PROVIDER === 'gamedistribution' && !gdOk())) return;
    var now = Date.now();
    if (now - started < min(C.firstInterstitialAfterMin, 5) || now - lastBreak < min(C.minMinutesBetweenInterstitials, 3)) return;
    if (document.hidden) return;
    lastBreak = now;
    if (PROVIDER === 'crazygames') { cgAd('midgame'); return; }
    if (PROVIDER === 'gamedistribution') { Promise.resolve().then(function () { return root.gdsdk.showAd(); }).catch(function () {}); return; }
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
    on: ON, provider: PROVIDER, noLinks: NO_LINKS, rewarded: rewarded, interstitial: interstitial, gdEvent: gdEvent,
    setAudio: function (mute, unmute) { audio.mute = mute; audio.unmute = unmute; }
  };
  if (ON && PROVIDER === 'adsense') {
    loadGoogle();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountRail); else mountRail();
  } else if (ON && PROVIDER === 'crazygames') loadCrazyGames();
})(typeof window !== 'undefined' ? window : globalThis);
