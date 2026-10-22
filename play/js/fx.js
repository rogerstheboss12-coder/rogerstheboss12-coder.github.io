/* 2-D vector effects: floating numbers, coin bursts, confetti, toasts,
 * flying bonus catchers, and the rocket-launch cinematic. */
(function (root) {
  'use strict';
  var layer, toasts;

  function init() {
    layer = document.getElementById('fx-layer');
    toasts = document.getElementById('toasts');
  }

  function rectCenter(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r };
  }

  var floatCount = 0;
  function floatText(x, y, text, color) {
    if (floatCount > 24) return;
    var d = document.createElement('div');
    d.className = 'float-cash';
    d.textContent = text;
    if (color) d.style.color = color;
    d.style.left = x + 'px'; d.style.top = y + 'px';
    layer.appendChild(d); floatCount++;
    setTimeout(function () { d.remove(); floatCount--; }, 1150);
  }

  function coins(x, y, n) {
    n = reduced() ? 0 : (n || 8);
    for (var i = 0; i < n; i++) {
      var c = document.createElement('div');
      c.className = 'coin';
      c.style.left = x + 'px'; c.style.top = y + 'px';
      layer.appendChild(c);
      var ang = Math.random() * Math.PI * 2, dist = 40 + Math.random() * 60;
      c.animate([
        { transform: 'translate(-50%,-50%) scale(0.6)', opacity: 1 },
        { transform: 'translate(' + (Math.cos(ang) * dist - 9) + 'px,' + (Math.sin(ang) * dist - 40) + 'px) scale(1)', opacity: 1, offset: 0.5 },
        { transform: 'translate(' + (Math.cos(ang) * dist * 1.2 - 9) + 'px,' + (Math.sin(ang) * dist + 40) + 'px) scale(0.7) rotateY(720deg)', opacity: 0 }
      ], { duration: 800 + Math.random() * 300, easing: 'ease-out' }).onfinish = (function (el) { return function () { el.remove(); }; })(c);
    }
  }

  function confetti(x, y, n) {
    n = reduced() ? 0 : (n || 40);
    var cols = ['#c8102e', '#ffffff', '#1f3a93', '#f5c518'];
    for (var i = 0; i < n; i++) {
      var c = document.createElement('div');
      c.className = 'confetti';
      c.style.background = cols[i % 4];
      c.style.left = x + 'px'; c.style.top = y + 'px';
      layer.appendChild(c);
      var ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, v = 150 + Math.random() * 250;
      var dx = Math.cos(ang) * v, dy = Math.sin(ang) * v;
      c.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (Math.random() * 720) + 'deg)', opacity: 1, offset: 0.4 },
        { transform: 'translate(' + dx * 1.3 + 'px,' + (dy + 380) + 'px) rotate(' + (Math.random() * 1440) + 'deg)', opacity: 0 }
      ], { duration: 1600 + Math.random() * 600, easing: 'cubic-bezier(.2,.6,.4,1)' }).onfinish = (function (el) { return function () { el.remove(); }; })(c);
    }
  }

  // Notifications: one at a time on phones (sitting just above the bottom nav, clear of
  // the camera), queued, tap to dismiss. `minor` ones are compact and dropped when busy.
  var queue = [], showing = 0;
  function phone() {
    var sb = document.getElementById('sidebar');
    return sb && sb.getBoundingClientRect().top > innerHeight / 2;
  }
  function place() {
    var sb = document.getElementById('sidebar');
    toasts.style.bottom = phone() ? (innerHeight - sb.getBoundingClientRect().top + 10) + 'px' : '';
  }
  function toast(icon, title, text, opts) {
    var minor = !!(opts && opts.minor);
    if (minor && (queue.length || showing >= (phone() ? 1 : 3))) return;
    queue.push({ icon: icon, title: title, text: text || '', minor: minor });
    while (queue.length > 3) queue.shift();
    pump();
  }
  function pump() {
    var max = phone() ? 1 : 3;
    while (showing < max && queue.length) show(queue.shift());
  }
  function show(q) {
    place();
    var d = document.createElement('div'), gone = false;
    d.className = 'toast' + (q.minor ? ' minor' : '');
    d.innerHTML = '<span class="ti">' + q.icon + '</span><span><b>' + q.title + '</b>' + q.text + '</span>';
    toasts.appendChild(d);
    showing++;
    function done() {
      if (gone) return;
      gone = true;
      d.classList.add('out');
      setTimeout(function () { d.remove(); showing--; pump(); }, 250);
    }
    d.addEventListener('click', done);
    setTimeout(done, q.minor ? 2200 : 3400);
  }

  // ---- Flying catchers: one sprite per world ----
  var SPRITES = {
    eagle: '<svg viewBox="0 0 110 80"><g class="wing l"><path d="M55 40 Q30 5 2 12 Q25 22 30 30 Q15 30 8 38 Q35 38 55 44Z" fill="#4a2c14"/></g>' +
      '<g class="wing r"><path d="M55 40 Q80 5 108 12 Q85 22 80 30 Q95 30 102 38 Q75 38 55 44Z" fill="#4a2c14"/></g>' +
      '<ellipse cx="55" cy="46" rx="16" ry="10" fill="#5c3715"/><path d="M42 50 L30 62 L46 56 L52 64 L55 54Z" fill="#fff"/>' +
      '<circle cx="70" cy="38" r="9" fill="#fff"/><path d="M77 36 L88 40 L78 43Z" fill="#f5b50a"/><circle cx="72" cy="36" r="1.8" fill="#111"/>' +
      '<rect x="44" y="52" width="14" height="9" fill="#c8102e"/><rect x="44" y="52" width="6" height="5" fill="#1f3a93"/></svg>',
    satellite: '<svg viewBox="0 0 110 80"><g class="spin"><rect x="4" y="32" width="34" height="16" fill="#1f3a93" stroke="#9fb6ff"/><rect x="72" y="32" width="34" height="16" fill="#1f3a93" stroke="#9fb6ff"/>' +
      '<path d="M38 40 H72" stroke="#ccc" stroke-width="3"/><rect x="44" y="26" width="22" height="28" rx="4" fill="#dcdcdc"/><circle cx="55" cy="22" r="8" fill="none" stroke="#fff" stroke-width="2"/>' +
      '<rect x="48" y="34" width="14" height="9" fill="#c8102e"/><circle class="glow" cx="55" cy="14" r="3" fill="#ff3b3b"/></g></svg>',
    ufo: '<svg viewBox="0 0 110 80"><path class="glow" d="M40 50 L25 80 H85 L70 50Z" fill="#7cff6b" opacity="0.5"/><ellipse cx="55" cy="44" rx="48" ry="12" fill="#b8c0cc"/>' +
      '<ellipse cx="55" cy="34" rx="20" ry="16" fill="#9fd3ff" opacity="0.85"/><ellipse cx="55" cy="36" rx="7" ry="9" fill="#7cff6b"/><circle cx="52" cy="34" r="1.8" fill="#111"/><circle cx="58" cy="34" r="1.8" fill="#111"/>' +
      '<circle class="glow" cx="20" cy="45" r="3" fill="#f5c518"/><circle cx="40" cy="50" r="3" fill="#f5c518"/><circle class="glow" cx="70" cy="50" r="3" fill="#f5c518"/><circle cx="90" cy="45" r="3" fill="#f5c518"/></svg>',
    comet: '<svg viewBox="0 0 110 80"><defs><linearGradient id="ct" x1="0" x2="1"><stop offset="0" stop-color="#b69cff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>' +
      '<path d="M0 30 L80 34 L80 46 L0 50Z" fill="url(#ct)"/><circle class="glow" cx="84" cy="40" r="16" fill="#b69cff" opacity="0.6"/><circle cx="84" cy="40" r="10" fill="#fff"/>' +
      '<text x="84" y="45" font-size="13" text-anchor="middle" fill="#1f3a93" font-weight="900">★</text></svg>',
    portal: '<svg viewBox="0 0 110 80"><defs><radialGradient id="pg"><stop offset="0" stop-color="#fff"/><stop offset="0.35" stop-color="#27e0ff"/><stop offset="0.7" stop-color="#ff5fd2"/><stop offset="1" stop-color="#5a1f8a" stop-opacity="0"/></radialGradient></defs>' +
      '<g class="spin"><ellipse cx="55" cy="40" rx="38" ry="36" fill="url(#pg)"/><path d="M55 8 A32 32 0 0 1 87 40" stroke="#fff" stroke-width="3" fill="none" opacity="0.7"/><path d="M55 72 A32 32 0 0 1 23 40" stroke="#fff" stroke-width="3" fill="none" opacity="0.7"/></g>' +
      '<text class="glow" x="55" y="48" font-size="22" text-anchor="middle" fill="#1f3a93" font-weight="900">★</text></svg>'
  };

  function reduced() { return document.documentElement.classList.contains('reduce-motion'); }

  function catcher(kind, label, onCatch) {
    var el = document.createElement('button');
    el.className = 'catcher';
    el.setAttribute('aria-label', label);
    el.innerHTML = kind && kind.indexOf('emoji:') === 0 ? '<span class="catch-emoji">' + kind.slice(6) + '</span>' : SPRITES[kind] || SPRITES.eagle;
    var H = window.innerHeight, W = window.innerWidth;
    var fromLeft = Math.random() < 0.5;
    var y0 = H * (0.2 + Math.random() * 0.4), y1 = H * (0.15 + Math.random() * 0.5);
    el.style.left = '0px'; el.style.top = '0px';
    if (!fromLeft) el.style.transform = 'scaleX(-1)';
    document.body.appendChild(el);
    var dur = (reduced() ? 16000 : 9000) + Math.random() * 3000;
    var anim = el.animate([
      { transform: 'translate(' + (fromLeft ? -130 : W + 20) + 'px,' + y0 + 'px)' + (fromLeft ? '' : ' scaleX(-1)') },
      { transform: 'translate(' + (W / 2 - 55) + 'px,' + ((y0 + y1) / 2 - 40) + 'px)' + (fromLeft ? '' : ' scaleX(-1)') },
      { transform: 'translate(' + (fromLeft ? W + 20 : -130) + 'px,' + y1 + 'px)' + (fromLeft ? '' : ' scaleX(-1)') }
    ], { duration: dur, easing: 'linear' });
    anim.onfinish = function () { el.remove(); };
    el.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      anim.cancel(); el.remove();
      onCatch(e.clientX, e.clientY);
    });
  }

  // ---- Launch cinematic ----
  function launch(rocketSrc, leaveText, destText, welcomeText, titleText, done) {
    var host = document.getElementById('cinematic');
    var c = document.createElement('div');
    c.className = 'cine';
    c.innerHTML = '<div class="sky"></div><div class="streaks"></div><div class="ground"></div>' +
      '<img class="rocket" src="' + rocketSrc + '" alt="">' +
      '<div class="countdown"></div><div class="cine-text"></div><div class="flash"></div>';
    host.appendChild(c);
    var cd = c.querySelector('.countdown'), txt = c.querySelector('.cine-text');
    txt.innerHTML = leaveText + '<small>' + destText + '</small>';
    txt.classList.add('show');
    var n = 3;
    cd.textContent = n;
    var iv = setInterval(function () {
      n--;
      if (n > 0) { cd.textContent = n; return; }
      clearInterval(iv);
      cd.textContent = (root.T ? root.T('LIFTOFF!') : 'LIFTOFF!');
      cd.style.fontSize = '72px';
      c.classList.add('go');
      c.querySelector('.sky').style.opacity = '0.2';
      var rocket = c.querySelector('.rocket');
      var puffs = setInterval(function () {
        var r = rocket.getBoundingClientRect();
        var s = document.createElement('div');
        s.className = 'smoke';
        var size = 60 + Math.random() * 60;
        s.style.width = s.style.height = size + 'px';
        s.style.left = (r.left + r.width / 2 - size / 2 + (Math.random() - 0.5) * 60) + 'px';
        s.style.top = (r.bottom - size / 2) + 'px';
        c.appendChild(s);
        setTimeout(function () { s.remove(); }, 1600);
      }, 60);
      setTimeout(function () { cd.textContent = ''; txt.classList.remove('show'); }, 1500);
      setTimeout(function () {
        clearInterval(puffs);
        c.querySelector('.flash').classList.add('on');
        txt.innerHTML = welcomeText + '<small>' + titleText + '</small>';
      }, 3800);
      setTimeout(function () { txt.classList.add('show'); if (done) done(); }, 4300);
      setTimeout(function () { c.style.transition = 'opacity 0.8s'; c.style.opacity = '0'; }, 6200);
      setTimeout(function () { c.remove(); }, 7100);
    }, 900);
  }

  // Quick "pop" on an element (cash counter after a big gain).
  function bump(el) {
    if (!el || reduced() || !el.animate) return;
    el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.14)', filter: 'brightness(1.4)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.2,1.6,.4,1)' });
  }

  root.FX = { init: init, floatText: floatText, coins: coins, confetti: confetti, toast: toast, catcher: catcher, launch: launch, rectCenter: rectCenter, bump: bump };
})(typeof window !== 'undefined' ? window : globalThis);
