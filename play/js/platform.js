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
    // If the SDK is slower than the timeout the game has already started from local storage; switching to the
    // Data Module mid-session would overwrite the player's cloud save with the fresh game.
    var timedOut = false;
    var t = setTimeout(function () { timedOut = true; res(false); }, 8000);
    Promise.resolve(sdk.init()).then(function () { clearTimeout(t); if (timedOut) return; cgData = sdk.data; try { sdk.game.loadingStart(); } catch (e) {} res(true); }, function () { clearTimeout(t); res(false); });
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
    var cands = [{ raw: readLocal(), cloud: false }];
    lastRaw = cands[0].raw;
    var prefs = plugin('Preferences'), cloud = plugin('CloudSave');
    return Promise.all([
      prefs ? safe(prefs.get({ key: KEY })) : null,
      cloud ? safe(cloud.get({ key: KEY })) : null
    ]).then(function (r) {
      if (r[0] && r[0].value) cands.push({ raw: r[0].value, cloud: false });
      if (r[1] && r[1].value) cands.push({ raw: r[1].value, cloud: true });
      // A fresh install often launches before iCloud has delivered the key: hold cloud writes for a while so a new game can't overwrite it.
      if (cloud && !(r[1] && r[1].value)) cloudHoldUntil = Date.now() + CLOUD_HOLD;
      noteCloud(r[1] && r[1].value);
      // Only saves that actually load are candidates; a damaged one is set aside (never overwritten) for support.
      var best = null, bestScore = -1;
      loadIssue = null;
      cands.forEach(function (c, i) {
        var raw = c.raw;
        if (!raw) return;
        try {
          var s = root.Engine.deserialize(raw);
          var sc = root.Engine.progressScore(s) + (c.cloud ? 0.5 : 0);
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

  var lastCloud = 0, saveError = 0, cloudHoldUntil = 0, cloudScore = -1, CLOUD_HOLD = 20000, cloudHandler = null;
  function scoreOf(raw) { try { return root.Engine.progressScore(root.Engine.deserialize(raw)); } catch (e) { return -1; } }
  // Remembers the best progress seen in iCloud so a weaker local state never overwrites it.
  function noteCloud(raw) { if (raw) cloudScore = Math.max(cloudScore, scoreOf(raw)); }
  // Calls fn(raw) when another device's iCloud save arrives with more progress than the one in `cur()`.
  function onCloudChange(cur, fn) {
    var cloud = plugin('CloudSave');
    if (!cloud) return;
    cloudHandler = fn;
    safe(cloud.addListener('changed', function () {
      safe(cloud.get({ key: KEY })).then(function (r) {
        var raw = r && r.value;
        if (!raw) return;
        var sc = scoreOf(raw), mine = cur();
        noteCloud(raw);
        if (sc > mine && cloudHandler) cloudHandler(raw);
      });
    }));
  }
  // Web build: remember what this tab last loaded or wrote. If the stored save has changed since, another tab
  // has been playing, so this (stale) tab must not overwrite it.
  var lastRaw = null;
  function writeSave(raw, force, override) {
    if (!native && !cgData && !override) {
      var cur = null; try { cur = localStorage.getItem(KEY); } catch (e) {}
      if (cur !== lastRaw) return 'other-tab';
    }
    saveError = writeLocal(raw) ? 0 : Date.now();
    var prefs = plugin('Preferences'), cloud = plugin('CloudSave');
    if (prefs) safe(prefs.set({ key: KEY, value: raw }));
    // iCloud key-value store is rate-limited; sync at most every 30s unless forced.
    var t = Date.now();
    // force (import, restore, cloud choice) bypasses the launch hold: the player explicitly chose this save.
    if (cloud && (force || (t >= cloudHoldUntil && t - lastCloud > 30000))) {
      lastCloud = t;
      if (scoreOf(raw) >= cloudScore) { safe(cloud.set({ key: KEY, value: raw })); noteCloud(raw); }
    }
    if (!saveError) lastRaw = raw;
    // Native builds also keep a Preferences copy, so only web storage failing on its own is fatal there.
    return !saveError || !!prefs;
  }
  function clearSave() {
    lastRaw = null;
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
    if (!gcCaps) gcCaps = safe(gc.capabilities()).then(function (r) { gcCaps = r || {}; return gcCaps; });
    return Promise.all([safe(gc.authenticate({ interactive: !!interactive })), gcCaps]).then(function (a) {
      gcReady = !!(a[0] && a[0].authenticated);
      // Only challenges App Store Connect actually serves get a button (none until they're live).
      if (gcReady && gcCap('challenges') && !gcLive) gcLive = safe(gc.challengeDefinitions()).then(function (r) { gcLive = (r && r.ids) || []; });
      return gcReady;
    });
  }
  // iOS 26 challenges + activities. gcCaps: null until asked, then a promise, then {challenges, activities}
  // ({} on older iOS or a native build without these methods). Ids come from GAME_CENTER in extras-data.js.
  var gcCaps = null;
  // gcLive: challenge ids Game Center returned (null until asked, a promise while loading).
  var gcLive = null;
  function gcCap(k) { return !!(gcCaps && gcCaps[k]); }
  function gcId(group, kind) { var G = root.GameData && root.GameData.EXTRAS && root.GameData.EXTRAS.GAME_CENTER; return G && G[group] && G[group][kind]; }
  var gcExtra = {
    challengesAvailable: function (kind) { return gcCap('challenges') && Array.isArray(gcLive) && gcLive.indexOf(gcId('challenges', kind)) >= 0; },
    activitiesAvailable: function () { return gcCap('activities') && gcReady; },
    // kind: 'event' | 'showdown'. Resolves true when Apple's challenge sheet opened.
    challengeFriends: function (kind) {
      var gc = plugin('GameCenter'), id = gcId('challenges', kind);
      if (!gc || !id || !gcExtra.challengesAvailable(kind)) return Promise.resolve(false);
      return (gcReady ? Promise.resolve(true) : gcAuth(true)).then(function (ok) {
        return ok ? safe(gc.presentChallenge({ challengeDefinitionId: id })).then(function (r) { return !!(r && r.shown); }) : false;
      });
    },
    startActivity: function (kind, properties) {
      var gc = plugin('GameCenter'), id = gcId('activities', kind);
      if (!gc || !id || !gcExtra.activitiesAvailable()) return Promise.resolve(false);
      return safe(gc.startActivity({ kind: kind, definitionId: id, properties: properties || {} })).then(function (r) { return !!(r && r.ok); });
    },
    endActivity: function (kind) {
      var gc = plugin('GameCenter');
      if (!gc || !gcExtra.activitiesAvailable()) return Promise.resolve(false);
      return safe(gc.endActivity({ kind: kind })).then(function (r) { return !!(r && r.ok); });
    }
  };
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
    verified = false; // only a successful response below vouches for the clock
    if (http) {
      p = http.request({ url: 'https://www.apple.com/library/test/success.html', method: 'HEAD', connectTimeout: 5000, readTimeout: 5000 })
        .then(function (r) { var h = r.headers || {}; return h.Date || h.date; });
    } else {
      // Same-origin HEAD works on web (dev server / hosted build).
      p = fetch(location.href, { method: 'HEAD', cache: 'no-store' }).then(function (r) { return r.headers.get('date'); });
      // A hung request must not hold the event rollover (main.js holdEvent) forever.
      p = Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('time sync timeout')); }, 5000); })]);
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
  // Consent (UMP) and the iOS tracking prompt run from initAds() (idempotent), which main.js calls early in the first
  // session (see maybeInitAds) and which runs again here first, so consent always precedes any ad request.
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
      // The plugin only resolves showRewardVideoAd() once the reward is earned; early dismissal or a
      // failed present only fire events, so settle from those too or the caller hangs forever.
      return new Promise(function (resolve) {
        var earned = false, done = false, handles = [];
        function finish(r) {
          if (done) return;
          done = true;
          handles.forEach(function (h) { safe(h).then(function (x) { if (x && x.remove) x.remove(); }); });
          preloadAd();
          resolve(r);
        }
        function on(ev, fn) { if (ad.addListener) handles.push(ad.addListener(ev, fn)); }
        on('onRewardedVideoAdReward', function () { earned = true; });
        on('onRewardedVideoAdDismissed', function () { finish(earned ? 'earned' : 'dismissed'); });
        on('onRewardedVideoAdFailedToShow', function () { finish('nofill'); });
        ad.showRewardVideoAd().then(function (item) {
          if (item) earned = true;
          finish(earned ? 'earned' : 'dismissed');
        }, function (e) {
          console.warn('[platform] show ad', e && e.message);
          finish('nofill');
        });
      });
    });
  }
  function requestReview() {
    var st = plugin('Store');
    return st ? safe(st.requestReview()) : Promise.resolve(null);
  }
  // Deep links (starspangled://event, …) from App Store in-app event cards.
  function onDeepLink(fn) {
    // Game Center activities/challenges launched from the Games app arrive as starspangled://event or …/showdown.
    var gc = plugin('GameCenter');
    if (gc) safe(gc.addListener('activityLaunch', function (e) { if (e && e.url) fn(e.url); }));
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
    safe(st.addListener('transaction', function (tx) { if (purchaseHandler) purchaseHandler(tx, !!tx.restored); }));
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
  // ---------------- Sharing ----------------
  // Native: the share sheet (@capacitor/share); a picture is written to the cache first (@capacitor/filesystem).
  // Web: Web Share, else the picture is downloaded / the text copied. Resolves 'shared', 'cancelled', 'downloaded', 'copied' or 'failed'.
  function copyText(text) {
    if (!navigator.clipboard) return Promise.resolve('failed');
    return navigator.clipboard.writeText(text).then(function () { return 'copied'; }, function () { return 'failed'; });
  }
  function shareText(text) {
    var sh = plugin('Share');
    if (sh) return sh.share({ text: text }).then(function () { return 'shared'; }, function () { return 'cancelled'; });
    if (navigator.share) return navigator.share({ text: text }).then(function () { return 'shared'; }, function (e) { return e && e.name === 'AbortError' ? 'cancelled' : copyText(text); });
    return copyText(text);
  }
  function shareImage(dataUrl, text, name) {
    var fs = plugin('Filesystem'), sh = plugin('Share');
    if (fs && sh) {
      return fs.writeFile({ path: name, data: dataUrl.split(',')[1], directory: 'CACHE' })
        .then(function (r) { return sh.share({ text: text, files: [r.uri] }); })
        .then(function () { return 'shared'; }, function (e) { console.warn('[platform] share', e && e.message); return /cancel/i.test(e && e.message || '') ? 'cancelled' : 'failed'; });
    }
    function download() {
      var a = document.createElement('a');
      a.href = dataUrl; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      return copyText(text).then(function () { return 'downloaded'; });
    }
    // Built synchronously so navigator.share still runs inside the tap (Safari requires it).
    var file = null;
    try {
      var bin = atob(dataUrl.split(',')[1]), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      file = new File([bytes], name, { type: 'image/png' });
    } catch (e) { file = null; }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      return navigator.share({ files: [file], text: text }).then(function () { return 'shared'; }, function (e) { return e && e.name === 'AbortError' ? 'cancelled' : download(); });
    }
    return download();
  }

  function openUrl(url) {
    var br = plugin('Browser');
    if (br) return safe(br.open({ url: url }));
    root.open(url, '_blank', 'noopener');
  }

  root.Platform = {
    native: native, android: android, demo: DEMO, web: WEB, ADS: ADS, cgReady: cgReady,
    storeName: android ? 'Google Play' : 'App Store',
    loadSave: loadSave, forgetCloud: function () { cloudScore = -1; cloudHoldUntil = 0; }, onCloudChange: onCloudChange, writeSave: writeSave, clearSave: clearSave, readLocal: readLocal,
    loadIssue: function () { return loadIssue; }, saveError: function () { return saveError; },
    syncTime: syncTime, now: now, isVerified: function () { return verified; },
    readBackups: readBackups, loadBackups: loadBackups, addBackup: addBackup,
    gcAuth: gcAuth, gcSubmit: gcSubmit, gcAchieve: gcAchieve, gcShow: gcShow, gcAvailable: function () { return !!plugin('GameCenter'); }, gcReady: function () { return gcReady; }, gc: gcExtra,
    haptic: haptic, setHaptics: function (on) { hapticsOn = on; },
    requestNotifications: requestNotifications, scheduleNotifications: scheduleNotifications, cancelNotifications: cancelNotifications,
    initAds: initAds, showRewardedAd: showRewardedAd, adsAvailable: adsAvailable, showAdPrivacyOptions: showAdPrivacyOptions,
    initStore: initStore, price: price, purchase: purchase, finish: finish, restore: restore, storeAvailable: storeAvailable,
    onLifecycle: onLifecycle, requestReview: requestReview, onDeepLink: onDeepLink, initChrome: initChrome, hideSplash: hideSplash, openUrl: openUrl,
    shareText: shareText, shareImage: shareImage
  };
})(typeof window !== 'undefined' ? window : globalThis);
