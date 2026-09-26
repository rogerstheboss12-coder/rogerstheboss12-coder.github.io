/* Leagues: grouped leaderboards (50–100 per group) for each rotating event and each weekly Showdown.
 * Real players come from the league server (server/, a Cloudflare Worker) when LEAGUE.server is set and
 * reachable. AI rivals — deterministic, clearly labelled — fill every group up to its size, and stand in
 * completely when the game is offline, so the feature always works. */
(function (root) {
  'use strict';
  var D = root.GameData, C = D.EXTRAS.LEAGUE;

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) { // mulberry32
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(rnd) { var u = Math.max(1e-9, rnd()), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function pick(rnd, list) { return list[Math.floor(rnd() * list.length)]; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  // ---------- Names ----------
  function randomName(rnd) { return pick(rnd, C.titles) + ' ' + pick(rnd, C.names) + ' of ' + pick(rnd, C.places); }
  // True if a name is built only from the shared word lists (the server applies the same check).
  function validName(name) {
    var m = /^(\S+) (\S+) of (.+)$/.exec(name || '');
    return !!m && C.titles.indexOf(m[1]) >= 0 && C.names.indexOf(m[2]) >= 0 && C.places.indexOf(m[3]) >= 0;
  }

  // ---------- AI rivals ----------
  function groupSize(key, id) { return C.minGroup + hash(key + '|' + id) % (C.maxGroup - C.minGroup + 1); }
  // Score of rival j at time t. Rivals play in sessions, so their scores rise in steps.
  function rivalScore(kind, rnd, frac) {
    var sessions = 4 + Math.floor(rnd() * 22), phase = rnd();
    var f = frac >= 1 ? 1 : clamp(Math.floor(frac * sessions + phase) / sessions, 0, 1);
    if (kind === 'ev') {
      var s = C.simEvent, fin = clamp(s.mean + s.sd * gauss(rnd), s.min, s.max);
      return f <= 0 ? 0 : Math.pow(10, fin * Math.pow(f, s.curve));
    }
    var d = C.simShowdown, total = clamp(d.median * Math.pow(d.spread, gauss(rnd)), d.min, d.max);
    return Math.round(total * f);
  }
  function rivals(opts, count) {
    var out = [], seed = hash(opts.key + ':' + opts.me.id), frac = clamp(((opts.t || Date.now()) - opts.start) / (opts.end - opts.start), 0, 1);
    for (var j = 0; j < count; j++) {
      var rnd = rng(hash(seed + '#' + j));
      var name = randomName(rnd);
      if (name === opts.me.name) name = randomName(rnd);
      out.push({ id: 'ai' + j, name: name, score: rivalScore(opts.kind, rnd, frac), ai: true });
    }
    return out;
  }

  // opts: { key, kind: 'ev'|'sd', start, end, t, me: { id, name, score }, real: [{ id, name, score }] }
  // Returns { rows (sorted, best first), rank (1-based), size, realCount }.
  function standings(opts) {
    var real = (opts.real || []).filter(function (r) { return r && r.id !== opts.me.id; }).slice(0, C.maxGroup - 1);
    var size = Math.max(groupSize(opts.key, opts.me.id), real.length + 1);
    size = Math.min(C.maxGroup, size);
    var rows = real.map(function (r) { return { id: r.id, name: r.name, score: +r.score || 0, ai: false }; })
      .concat(rivals(opts, Math.max(0, size - 1 - real.length)));
    rows.push({ id: opts.me.id, name: opts.me.name, score: opts.me.score || 0, me: true });
    rows.sort(function (a, b) { return b.score - a.score || (a.me ? -1 : b.me ? 1 : 0); });
    var rank = 1;
    for (var i = 0; i < rows.length; i++) if (rows[i].me) { rank = i + 1; break; }
    return { rows: rows, rank: rank, size: rows.length, realCount: real.length };
  }

  // ---------- Network (league server) ----------
  var inflight = {}, lastSync = {};
  function serverUrl() { return (root.LEAGUE_SERVER || C.server || '').replace(/\/+$/, ''); }
  function online() { return !!serverUrl() && typeof fetch === 'function' && !(root.BUILD && root.BUILD.demo); }
  function request(path, body) {
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 6000) : null;
    return fetch(serverUrl() + path, {
      method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined, signal: ctl ? ctl.signal : undefined, cache: 'no-store'
    }).then(function (r) { if (timer) clearTimeout(timer); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .catch(function (e) { if (timer) clearTimeout(timer); throw e; });
  }
  // Sends the player's score for a board and stores the group's real players on the board record.
  // Throttled per board; resolves true when fresh data arrived.
  function sync(board, key, me, force) {
    if (!online() || !me.id || !validName(me.name)) return Promise.resolve(false);
    var t = Date.now(), prev = lastSync[key];
    if (inflight[key]) return inflight[key];
    if (!force && prev && t - prev.at < 60000 && prev.score === board.score) return Promise.resolve(false);
    if (!force && prev && t - prev.at < 20000) return Promise.resolve(false);
    lastSync[key] = { at: t, score: board.score };
    inflight[key] = request('/v1/submit', { board: key, player: me.id, name: me.name, score: board.score })
      .then(function (res) {
        inflight[key] = null;
        if (!res || !Array.isArray(res.entries)) return false;
        board.real = res.entries.filter(function (e) { return e && typeof e.id === 'string' && validName(e.name) && isFinite(e.score); })
          .map(function (e) { return { id: e.id, name: e.name, score: +e.score }; });
        board.community = res.total != null ? { total: +res.total || 0, players: +res.players || 0 } : null;
        board.syncedAt = t;
        return true;
      }, function () { inflight[key] = null; return false; });
    return inflight[key];
  }

  root.Leagues = {
    hash: hash, rng: rng, randomName: randomName, validName: validName, groupSize: groupSize,
    rivals: rivals, standings: standings, online: online, sync: sync, serverUrl: serverUrl
  };
})(typeof window !== 'undefined' ? window : globalThis);
