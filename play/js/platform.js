/* Platform bridge: native iOS / Android (Capacitor) with web fallbacks.
 * Everything the game needs from the device goes through here:
 * storage + iCloud, verified time, haptics, notifications, ads, purchases, lifecycle. */
(function (root) {
  'use strict';
  var Cap = root.Capacitor;
  var native = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  var android = native && Cap.getPlatform && Cap.getPlatform() === 'android';
  var cache = {};
  function plugin(name) {
    if (!native) return null;
    if (cache[name]) return cache[name];
    // npm plugins are exposed on Capacitor.Plugins. The app's local Swift plugins (Store, CloudSave)
    // are registered after load, so talk to them through the bridge's native primitives instead.
    var p = Cap.Plugins && Cap.Plugins[name];
    if (!p && Cap.nativePromise) {
      p = new Proxy({}, {
        get: function (t, m) {
          if (m === 'then') return undefined;
          if (m === 'addListener') return function (ev, cb) { return Promise.resolve(Cap.addListener(name, ev, cb)); };
          return function (opts) { return Cap.nativePromise(name, m, opts || {}); };
        }
      });
    }
    cache[name] = p || null;
    return cache[name];
  }
  function safe(p) { return p && p.catch ? p.catch(function (e) { console.warn('[platform]', e && e.message || e); return null; }) : Promise.resolve(p); }

  // ---------------- Config ----------------
  // Real AdMob rewarded unit. `testing` is switched on automatically for Xcode Debug runs
  // (the native shell sets window.NATIVE_DEBUG) and the web build, so you never see live ads while developing;
  // App Store / TestFlight (Release) builds serve real ads.
  var ADS = {
    rewardedIos: 'ca-app-pub-3768224016614773/5395035086',
    // Android rewarded unit (AdMob → the Android app). The AdMob *app* id lives in android/keystore.properties.
    rewardedAndroid: '',
    testing: !!root.NATIVE_DEBUG || !(root.BUILD && root.BUILD.dev === false)
  };

  // ---------------- Storage ----------------
  var KEY = 'starSpangledTycoon.save.v1';
  // CrazyGames build: saves go through the CrazyGames SDK Data Module (synced to the player's CrazyGames account;
  // their rules say not to rely on local saves). Everything waits for SDK.init(), which preloads the data.
  var CG = !native && !!(root.BUILD && root.BUILD.portal === 'crazygames');
  var cgData = null;
  var cgReady = !CG ? Promise.resolve(false) : new Promise(function (res) {
    var sdk = root.CrazyGames && root.CrazyGames.SDK;
    if (!sdk) return res(false);
    var t = setTimeout(function () { res(false); }, 8000);
    Promise.resolve(sdk.init()).then(function () { clearTimeout(t); cgData = sdk.data; try { sdk.game.loadingStart(); } catch (e) {} res(true); }, function () { clearTimeout(t); res(false); });
  });
  function readLocal() {
    if (cgData) { try { return cgData.getItem(KEY); } catch (e) { return null; } }
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  // Returns false when the write failed (storage full, blocked, private mode…) so the game can warn the player.
  function writeLocal(v) {
    if (cgData) { try { cgData.setItem(KEY, v); return true; } catch (e) { console.warn('[platform] CrazyGames save', e && e.message); return false; } }
    try { localStorage.setItem(KEY, v); return true; } catch (e) { console.warn('[platform] save', e && e.message); return false; }
  }

  // Loads the best available save from device storage, iCloud and web storage.
  function loadSave() {
    return cgReady.then(function () {
      // One-time move of a browser save made before the Data Module was available.
      if (cgData && !readLocal()) {
        var old = null; try { old = localStorage.getItem(KEY); } catch (e) {}
        if (old) writeLocal(old);
      }
      return loadSaveNow();
    });
  }
  function loadSaveNow() {
    var cands = [readLocal()];
    var prefs = plugin('Preferences'), cloud = plugin('CloudSave');
    return Promise.all([
      prefs ? safe(prefs.get({ key: KEY })) : null,
      cloud ? safe(cloud.get({ key: KEY })) : null
    ]).then(function (r) {
      if (r[0] && r[0].value) cands.push(r[0].value);
      if (r[1] && r[1].value) cands.push(r[1].value);
      // Only saves that actually load are candidates; a damaged one is set aside (never overwritten) for support.
      var best = null, bestScore = -1;
      loadIssue = null;
      cands.forEach(function (raw, i) {
        if (!raw) return;
        try {
          var s = root.Engine.deserialize(raw);
          var sc = root.Engine.progressScore(s) + (i === 2 ? 0.5 : 0);
          if (sc > bestScore) { bestScore = sc; best = raw; }
        } catch (e) {
          console.warn('[platform] unreadable save', i, e && e.message);
          loadIssue = 'damaged';
          stashDamaged(raw);
        }
      });
      return best;
    });
  }

  var loadIssue = null, DKEY = KEY + '.damaged';
  function stashDamaged(raw) {
    try { if (!localStorage.getItem(DKEY)) localStorage.setItem(DKEY, raw); } catch (e) {}
    var prefs = plugin('Preferences');
    if (prefs) safe(prefs.set({ key: DKEY, value: raw }));
  }

  var lastCloud = 0, saveError = 0;
  function writeSave(raw, force) {
    saveError = writeLocal(raw) ? 0 : Date.now();
    var prefs = plugin('Preferences'), cloud = plugin('CloudSave');
    if (prefs) safe(prefs.set({ key: KEY, value: raw }));
    // iCloud key-value store is rate-limited; sync at most every 30s unless forced.
    var t = Date.now();
    if (cloud && (force || t - lastCloud > 30000)) { lastCloud = t; safe(cloud.set({ key: KEY, value: raw })); }
    // Native builds also keep a Preferences copy, so only web storage failing on its own is fatal there.
    return !saveError || !!prefs;
  }
  function clearSave() {
    if (cgData) { try { cgData.removeItem(KEY); } catch (e) {} }
    try { localStorage.removeItem(KEY); } catch (e) {}
    var prefs = plugin('Preferences'), cloud = plugin('CloudSave');
    if (prefs) safe(prefs.remove({ key: KEY }));
    if (cloud) safe(cloud.remove({ key: KEY }));
  }

  // ---------------- Rolling backups (#48) ----------------
  // Up to 5 snapshots, kept on the device (web storage + native preferences), newest first.
  var BKEY = KEY + '.backups', MAX_BACKUPS = 5;
  function readBackups() {
    try { var v = JSON.parse(localStorage.getItem(BKEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }
  function loadBackups() {
    var prefs = plugin('Preferences'), local = readBackups();
    if (!prefs) return Promise.resolve(local);
    return safe(prefs.get({ key: BKEY })).then(function (r) {
      try { var v = r && r.value ? JSON.parse(r.value) : []; return Array.isArray(v) && v.length >= local.length ? v : local; } catch (e) { return local; }
    });
  }
  function addBackup(raw, label, t) {
    var list = readBackups().filter(function (b) { return b && b.data; });
    list.unshift({ t: t || Date.now(), label: label || 'auto', data: raw });
    while (list.length > MAX_BACKUPS) list.pop();
    var json = JSON.stringify(list);
    try { localStorage.setItem(BKEY, json); } catch (e) { list.pop(); try { localStorage.setItem(BKEY, JSON.stringify(list)); } catch (e2) {} }
    var prefs = plugin('Preferences');
    if (prefs) safe(prefs.set({ key: BKEY, value: json }));
    return list;
  }

  // ---------------- Game Center (native plugin; no-op on web) ----------------
  var gcReady = false;
  // Silent at launch; interactive (Apple's sign-in sheet) only when the player taps a Game Center button.
  function gcAuth(interactive) {
    var gc = plugin('GameCenter');
    if (!gc) return Promise.resolve(false);
    return safe(gc.authenticate({ interactive: !!interactive })).then(function (r) { gcReady = !!(r && r.authenticated); return gcReady; });
  }
  function gcSubmit(id, score) {
    var gc = plugin('GameCenter');
    if (!gc || !gcReady || !(score >= 0)) return Promise.resolve(false);
    return safe(gc.submitScore({ leaderboardId: id, score: Math.floor(score) }));
  }
  function gcAchieve(id, pct) {
    var gc = plugin('GameCenter');
    if (!gc || !gcReady) return Promise.resolve(false);
    return safe(gc.reportAchievement({ achievementId: id, percent: pct == null ? 100 : pct }));
  }
  function gcShow(leaderboardId) {
    var gc = plugin('GameCenter');
    if (!gc) return Promise.resolve(false);
    return (gcReady ? Promise.resolve(true) : gcAuth(true)).then(function (ok) { return ok ? safe(gc.show({ leaderboardId: leaderboardId || '' })) : false; });
  }

  // ---------------- Verified time ----------------
  // We read the HTTP Date header from a well-known server to detect device clock tampering.
  var offset = 0, verified = false;
  function syncTime() {
    var http = plugin('CapacitorHttp');
    var p;
    if (http) {
      p = http.request({ url: 'https://www.apple.com/library/test/success.html', method: 'HEAD', connectTimeout: 5000, readTimeout: 5000 })
        .then(function (r) { var h = r.headers || {}; return h.Date || h.date; });
    } else {
      // Same-origin HEAD works on web (dev server / hosted build).
      p = fetch(location.href, { method: 'HEAD', cache: 'no-store' }).then(function (r) { return r.headers.get('date'); });
    }
    return safe(p.then(function (d) {
      var ms = d ? Date.parse(d) : NaN;
      if (!isNaN(ms)) { offset = ms - Date.now(); verified = true; }
      return verified;
    })).then(function () { return verified; });
  }
  function now() { return Date.now() + offset; }

  // ---------------- Haptics ----------------
  var hapticsOn = true;
  function haptic(kind) {
    if (!hapticsOn) return;
    var h = plugin('Haptics');
    if (h) {
      if (kind === 'success') safe(h.notification({ type: 'SUCCESS' }));
      else safe(h.impact({ style: kind === 'heavy' ? 'HEAVY' : kind === 'medium' ? 'MEDIUM' : 'LIGHT' }));
    } else if (navigator.vibrate && kind !== 'light') {
      try { navigator.vibrate(kind === 'heavy' ? 30 : 12); } catch (e) {}
    }
  }

  // ---------------- Local notifications ----------------
  function requestNotifications() {
    var n = plugin('LocalNotifications');
    if (!n) return Promise.resolve(false);
    return safe(n.requestPermissions()).then(function (r) { return !!(r && r.display === 'granted'); });
  }
  var NOTE_IDS = []; for (var ni = 1; ni <= 20; ni++) NOTE_IDS.push({ id: ni });
  function scheduleNotifications(list) {
    var n = plugin('LocalNotifications');
    if (!n) return;
    safe(n.cancel({ notifications: NOTE_IDS })).then(function () {
      var items = list.filter(function (x) { return x.at > Date.now() + 60000; }).map(function (x) {
        return { id: x.id, title: x.title, body: x.body, schedule: { at: new Date(x.at), allowWhileIdle: true } };
      });
      if (items.length) safe(n.schedule({ notifications: items }));
    });
  }
  function cancelNotifications() {
    var n = plugin('LocalNotifications');
    if (n) safe(n.cancel({ notifications: NOTE_IDS }));
  }

  // ---------------- Ads (rewarded only) ----------------
  var adReady = false, adInit = null;
  function initAds() {
    var ad = plugin('AdMob');
    if (!ad) return Promise.resolve(false);
    if (adInit) return adInit;
    adInit = safe(ad.initialize({ initializeForTesting: ADS.testing }))
      .then(function () { return safe(ad.requestConsentInfo()); })
      .then(function (info) {
        if (info && info.isConsentFormAvailable && info.status === 'REQUIRED') return safe(ad.showConsentForm());
      })
      .then(function () { return safe(ad.trackingAuthorizationStatus()); })
      .then(function (st) { if (st && st.status === 'notDetermined') return safe(ad.requestTrackingAuthorization()); })
      .then(function () { return preloadAd(); })
      .then(function () { return true; });
    return adInit;
  }
  function preloadAd() {
    var ad = plugin('AdMob');
    if (!ad) return Promise.resolve(false);
    // Google's sample rewarded unit stands in until the Android unit id is filled in.
    var unit = android ? (ADS.rewardedAndroid || 'ca-app-pub-3940256099942544/5224354917') : ADS.rewardedIos;
    return safe(ad.prepareRewardVideoAd({ adId: unit, isTesting: ADS.testing || (android && !ADS.rewardedAndroid) })).then(function (r) { adReady = !!r; return adReady; });
  }
  // Resolves 'earned' (reward earned), 'nofill' (no ad could be loaded or shown) or 'dismissed'
  // (closed before the reward). On web, simulates a short "ad".
  // Consent (UMP) and the iOS tracking prompt are deferred until the player first chooses to watch an ad.
  function showRewardedAd(placement) {
    var ad = plugin('AdMob');
    if (DEMO) return Promise.resolve('unavailable');
    // Browser build: real web ads (js/web-ads.js), never free rewards.
    if (!native && WEB && root.WebAds) return root.WebAds.rewarded(placement);
    if (!ad) return new Promise(function (res) { setTimeout(function () { res('earned'); }, 1500); });
    var p = initAds().then(function () { return adReady ? true : preloadAd(); });
    return p.then(function (ok) {
      if (!ok) return 'nofill';
      adReady = false;
      return ad.showRewardVideoAd().then(function (item) {
        preloadAd();
        return item ? 'earned' : 'dismissed';
      }, function (e) {
        console.warn('[platform] show ad', e && e.message);
        preloadAd();
        return 'nofill';
      });
    });
  }
  function requestReview() {
    var st = plugin('Store');
    return st ? safe(st.requestReview()) : Promise.resolve(null);
  }
  // Deep links (starspangled://event, …) from App Store in-app event cards.
  function onDeepLink(fn) {
    var app = plugin('App');
    if (!app) return;
    safe(app.addListener('appUrlOpen', function (e) { if (e && e.url) fn(e.url); }));
    safe(app.getLaunchUrl()).then(function (r) { if (r && r.url) fn(r.url); });
  }
  var DEMO = !!(root.BUILD && root.BUILD.demo);
  var WEB = !native && !!(root.BUILD && root.BUILD.web);
  function adsAvailable() { return !DEMO && (!!plugin('AdMob') || !native); }
  function showAdPrivacyOptions() {
    var ad = plugin('AdMob');
    if (ad) return safe(ad.showPrivacyOptionsForm());
    return Promise.resolve();
  }

  // ---------------- In-app purchases (custom StoreKit 2 plugin) ----------------
  var products = {};
  var purchaseHandler = null;
  function initStore(ids, onTransaction) {
    purchaseHandler = onTransaction;
    var st = plugin('Store');
    if (!st) return Promise.resolve({});
    safe(st.addListener('transaction', function (tx) { if (purchaseHandler) purchaseHandler(tx); }));
    // Google Play needs to know which products to acknowledge (kept) rather than consume.
    var nonConsumables = ((root.GameData && root.GameData.IAP) || []).filter(function (p) { return p.type === 'nonconsumable'; }).map(function (p) { return p.id; });
    return safe(st.getProducts({ ids: ids, nonConsumables: nonConsumables })).then(function (r) {
      (r && r.products || []).forEach(function (p) { products[p.id] = p; });
      // Deliver any unfinished transactions from previous sessions.
      return safe(st.pendingTransactions());
    }).then(function (r) {
      (r && r.transactions || []).forEach(function (tx) { if (purchaseHandler) purchaseHandler(tx); });
      return products;
    });
  }
  function price(id, fallback) { return products[id] ? products[id].displayPrice : fallback; }
  function storeAvailable() { return !!plugin('Store'); }
  // Resolves { status: 'success'|'cancelled'|'pending'|'failed', transactionId, productId }
  function purchase(id) {
    var st = plugin('Store');
    if (!st) return Promise.resolve({ status: 'unavailable' });
    return st.purchase({ id: id }).catch(function (e) { return { status: 'failed', error: e && e.message }; });
  }
  function finish(transactionId) {
    var st = plugin('Store');
    if (st && transactionId) safe(st.finish({ transactionId: String(transactionId) }));
  }
  function restore() {
    var st = plugin('Store');
    if (!st) return Promise.resolve([]);
    return safe(st.restore()).then(function (r) { return (r && r.transactions) || []; });
  }

  // ---------------- Lifecycle & chrome ----------------
  function onLifecycle(onPause, onResume) {
    var app = plugin('App');
    if (app) {
      safe(app.addListener('pause', onPause));
      safe(app.addListener('resume', onResume));
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) onPause(); else onResume(); });
  }
  function initChrome() {
    var sb = plugin('StatusBar');
    if (sb) { safe(sb.setOverlaysWebView({ overlay: true })); safe(sb.setStyle({ style: 'DARK' })); }
  }
  // Called once the first frame of the game has been drawn.
  function hideSplash() {
    var sp = plugin('SplashScreen');
    if (sp) safe(sp.hide({ fadeOutDuration: 300 }));
  }
  function openUrl(url) {
    var br = plugin('Browser');
    if (br) return safe(br.open({ url: url }));
    root.open(url, '_blank', 'noopener');
  }

  root.Platform = {
    native: native, android: android, demo: DEMO, web: WEB, ADS: ADS, cgReady: cgReady,
    storeName: android ? 'Google Play' : 'App Store',
    loadSave: loadSave, writeSave: writeSave, clearSave: clearSave, readLocal: readLocal,
    loadIssue: function () { return loadIssue; }, saveError: function () { return saveError; },
    syncTime: syncTime, now: now, isVerified: function () { return verified; },
    readBackups: readBackups, loadBackups: loadBackups, addBackup: addBackup,
    gcAuth: gcAuth, gcSubmit: gcSubmit, gcAchieve: gcAchieve, gcShow: gcShow, gcAvailable: function () { return !!plugin('GameCenter'); }, gcReady: function () { return gcReady; },
    haptic: haptic, setHaptics: function (on) { hapticsOn = on; },
    requestNotifications: requestNotifications, scheduleNotifications: scheduleNotifications, cancelNotifications: cancelNotifications,
    initAds: initAds, showRewardedAd: showRewardedAd, adsAvailable: adsAvailable, showAdPrivacyOptions: showAdPrivacyOptions,
    initStore: initStore, price: price, purchase: purchase, finish: finish, restore: restore, storeAvailable: storeAvailable,
    onLifecycle: onLifecycle, requestReview: requestReview, onDeepLink: onDeepLink, initChrome: initChrome, hideSplash: hideSplash, openUrl: openUrl
  };
})(typeof window !== 'undefined' ? window : globalThis);
