/* Minimal, privacy-friendly analytics via TelemetryDeck (https://telemetrydeck.com).
 * Events are kept in a local ring buffer and, when CONFIG.appID is set, sent in batches as
 * TelemetryDeck "signals". No device identifiers, no IDFA, no personal data: only a random
 * install id, hashed with SHA-256 before it leaves the device. Players can turn it off in Settings. */
(function (root) {
  'use strict';
  var CONFIG = {
    appID: '5F52496B-F9CC-4181-9690-043AFFC0B688', // TelemetryDeck app ID (Dashboard → your app → Set Up App). Empty = nothing is sent.
    namespace: 'com.starspangledtycoon', // TelemetryDeck organization namespace
    batchSize: 20,
    flushMs: 30000
  };
  var KEY = 'sst.analytics.id';
  var queue = [], log = [], enabled = true, installId = null, userHash = null;
  var session = 's' + Math.random().toString(36).slice(2) + Date.now().toString(36);

  function id() {
    if (installId) return installId;
    try { installId = localStorage.getItem(KEY); } catch (e) {}
    if (!installId) {
      installId = 'i' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      try { localStorage.setItem(KEY, installId); } catch (e) {}
    }
    return installId;
  }
  function hashedUser() {
    if (userHash) return Promise.resolve(userHash);
    var raw = id(), subtle = root.crypto && root.crypto.subtle;
    if (!subtle || !root.TextEncoder) return Promise.resolve(userHash = raw);
    return subtle.digest('SHA-256', new TextEncoder().encode(raw + ':star-spangled-tycoon')).then(function (buf) {
      return (userHash = Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''));
    }, function () { return (userHash = raw); });
  }
  function testMode() { return !!root.NATIVE_DEBUG || !(root.BUILD && root.BUILD.dev === false); }
  function endpoint() {
    return 'https://nom.telemetrydeck.com/v2/' + (CONFIG.namespace ? 'namespace/' + encodeURIComponent(CONFIG.namespace) + '/' : '');
  }

  function track(name, props) {
    if (!enabled) return;
    var ev = { e: name, t: Date.now(), p: props || {} };
    log.push(ev); if (log.length > 200) log.shift();
    if (CONFIG.appID) { queue.push(ev); if (queue.length >= CONFIG.batchSize) flush(); }
  }

  function signal(ev, user) {
    var payload = {
      'TelemetryDeck.AppInfo.version': String((root.BUILD && root.BUILD.version) || 'dev'),
      'TelemetryDeck.RunContext.locale': String((root.navigator && navigator.language) || ''),
      'TelemetryDeck.Device.platform': root.Platform && root.Platform.native ? 'iOS' : 'web'
    };
    Object.keys(ev.p).forEach(function (k) { var v = ev.p[k]; if (v != null && typeof v !== 'object') payload['Game.' + k] = String(v); });
    return { appID: CONFIG.appID, clientUser: user, sessionID: session, type: 'Game.' + ev.e, isTestMode: testMode(), payload: payload };
  }

  function flush() {
    if (!CONFIG.appID || !enabled || !queue.length) return Promise.resolve();
    var batch = queue.splice(0, queue.length);
    return hashedUser().then(function (user) {
      return fetch(endpoint(), {
        method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(batch.map(function (ev) { return signal(ev, user); })), keepalive: true
      }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); });
    }).catch(function () { queue = batch.concat(queue).slice(-500); });
  }

  var timer = setInterval(flush, CONFIG.flushMs);
  if (timer && timer.unref) timer.unref(); // don't keep Node (tests) alive

  root.Analytics = {
    CONFIG: CONFIG, track: track, flush: flush, signal: signal,
    setEnabled: function (on) { enabled = !!on; if (!on) queue = []; },
    enabled: function () { return enabled; },
    recent: function () { return log.slice(-50); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
