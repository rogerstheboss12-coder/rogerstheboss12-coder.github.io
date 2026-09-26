/* Audio: original synthesized SFX and music (see tools/audio), played through WebAudio
 * for gapless loops and low latency, with an HTMLAudio fallback when fetch is unavailable. */
(function (root) {
  'use strict';

  var SFX = ['cash', 'click', 'fanfare', 'launch', 'bonus', 'cheer', 'achieve', 'stamp', 'flare', 'alien', 'loop'];
  var ALIAS = { eagle: 'bonus' };
  var MUSIC = { march: 'music_earth', synth: 'music_solar', arp: 'music_galaxy', ambient: 'music_universe', multi: 'music_multi', fest: 'music_fest' };
  var BASE = 'assets/audio/';

  var ctx = null, sfxGain = null, musicGain = null;
  var buffers = {}, loading = {}, htmlPools = {};
  var sfxOn = true, musicOn = true, volume = 0.6, musicVolume = 0.6, ducked = false, paused = false;
  var theme = null, current = null; // current = { src, gain, name }
  var lastPlay = {};

  function ensureCtx() {
    if (ctx) return ctx;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    sfxGain = ctx.createGain(); sfxGain.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.connect(ctx.destination);
    applyVolume();
    return ctx;
  }
  function applyVolume() {
    if (!ctx) return;
    sfxGain.gain.value = sfxOn ? volume : 0;
    musicGain.gain.setTargetAtTime(musicOn && !paused ? musicVolume * (ducked ? 0.15 : 0.45) : 0, ctx.currentTime, 0.2);
  }

  function load(name) {
    if (buffers[name] || loading[name]) return loading[name] || Promise.resolve(buffers[name]);
    if (!ensureCtx() || !root.fetch || location.protocol === 'file:') return Promise.resolve(null);
    loading[name] = fetch(BASE + name + '.m4a').then(function (r) { return r.arrayBuffer(); })
      .then(function (ab) { return new Promise(function (res, rej) { ctx.decodeAudioData(ab, res, rej); }); })
      .then(function (b) { buffers[name] = b; return b; })
      .catch(function () { return null; });
    return loading[name];
  }

  function initSfx() {
    ensureCtx();
    SFX.forEach(load);
  }

  function htmlPlay(name, vol) {
    var pool = htmlPools[name] || (htmlPools[name] = [0, 1, 2].map(function () { var a = new Audio(BASE + name + '.m4a'); a.preload = 'auto'; return a; }));
    var a = pool.find(function (x) { return x.paused || x.ended; }) || pool[0];
    try { a.currentTime = 0; a.volume = Math.min(1, volume * vol); a.play().catch(function () {}); } catch (e) {}
  }

  function play(name, vol, minGapMs) {
    name = ALIAS[name] || name;
    if (!sfxOn || paused) return;
    vol = vol == null ? 1 : vol;
    var t = performance.now();
    if (minGapMs && lastPlay[name] && t - lastPlay[name] < minGapMs) return;
    lastPlay[name] = t;
    var b = buffers[name];
    if (!b || !ctx) { if (!ctx || location.protocol === 'file:') htmlPlay(name, vol); else load(name); return; }
    if (ctx.state === 'suspended') ctx.resume();
    var src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = b; g.gain.value = vol;
    src.connect(g); g.connect(sfxGain);
    src.start();
  }

  function playTheme(name) {
    theme = name;
    if (!musicOn || !ensureCtx()) return;
    var file = MUSIC[name];
    if (current && current.name === file) return;
    load(file).then(function (b) {
      if (!b || theme !== name || (current && current.name === file)) return;
      if (ctx.state === 'suspended') ctx.resume();
      var src = ctx.createBufferSource(), g = ctx.createGain();
      src.buffer = b; src.loop = true;
      g.gain.value = 0; g.gain.setTargetAtTime(1, ctx.currentTime, 0.6);
      src.connect(g); g.connect(musicGain);
      src.start();
      if (current) {
        var old = current;
        old.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
        setTimeout(function () { try { old.src.stop(); } catch (e) {} }, 2500);
      }
      current = { src: src, gain: g, name: file };
      applyVolume();
    });
  }

  function stopMusic() {
    if (current) { try { current.src.stop(); } catch (e) {} current = null; }
  }

  function setMusic(on) {
    musicOn = on;
    if (!on) stopMusic();
    else if (theme) { var t = theme; theme = null; playTheme(t); }
    applyVolume();
  }
  function setSfx(on) { sfxOn = on; applyVolume(); }
  function setVolume(v) { volume = v; applyVolume(); }          // effects
  function setMusicVolume(v) { musicVolume = v; applyVolume(); }
  function duck(on) { ducked = on; applyVolume(); }
  function pause(on) {
    paused = on;
    if (!ctx) return;
    if (on) { applyVolume(); setTimeout(function () { if (paused && ctx.state === 'running') ctx.suspend(); }, 300); }
    else { ctx.resume(); applyVolume(); }
  }

  // Resume audio on first user gesture (autoplay policy).
  function unlock() {
    if (!ensureCtx()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (musicOn && theme && !current) { var t = theme; theme = null; playTheme(t); }
  }

  root.GameAudio = { initSfx: initSfx, play: play, playTheme: playTheme, setMusic: setMusic, setSfx: setSfx, setVolume: setVolume, setMusicVolume: setMusicVolume, duck: duck, pause: pause, unlock: unlock,
    TRACKS: Object.keys(MUSIC) };
})(typeof window !== 'undefined' ? window : globalThis);
