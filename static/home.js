/* Star-Spangled Tycoon — home page behaviour.
 * Starfield, the hero orbit, the scroll-driven campaign trail (GSAP ScrollTrigger + Lenis when available),
 * the live parody-election tally and display ads. Everything degrades to a readable static page. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cfg = window.SST || {};

  // ---------------- starfield ----------------
  var cv = document.getElementById('stars'), cx = cv.getContext('2d'), stars = [], W = 0, H = 0, dpr = Math.min(2, devicePixelRatio || 1), scrollY0 = 0;
  function sizeStars() {
    W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(W * H / 5200); stars = [];
    for (var i = 0; i < n; i++) {
      var z = Math.random();
      stars.push({ x: Math.random() * W, y: Math.random() * H * 3, z: z, r: .3 + z * 1.2, p: Math.random() * 6.28, c: Math.random() < .12 ? (Math.random() < .5 ? '#fbe39a' : '#9fc5ff') : '#f3eedf' });
    }
  }
  function drawStars(t) {
    cx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], y = ((s.y - scrollY0 * (.05 + s.z * .25)) % (H * 3) + H * 3) % (H * 3);
      if (y > H) continue;
      cx.globalAlpha = .35 + .65 * (reduce ? .7 : (.5 + .5 * Math.sin(t / 900 + s.p)) * s.z + (1 - s.z) * .4);
      cx.fillStyle = s.c; cx.beginPath(); cx.arc(s.x, y, s.r, 0, 6.2832); cx.fill();
    }
  }
  sizeStars(); addEventListener('resize', sizeStars);

  // ---------------- hero orbit ----------------
  // Satellites ride a tilted ellipse around the planet; the far half passes behind it.
  var orbit = document.querySelector('.orbit'), sats = orbit ? [].slice.call(orbit.querySelectorAll('.sat')) : [];
  var planet = orbit && orbit.querySelector('.planet');
  var tilt = -14 * Math.PI / 180, spin = 0, lastT = 0, hover = false;
  if (orbit) { orbit.addEventListener('pointerenter', function () { hover = true; }); orbit.addEventListener('pointerleave', function () { hover = false; }); }
  function placeSats(dt) {
    if (!orbit) return;
    var size = orbit.clientWidth, R = size * .5, r = size * .15, c = size / 2, sw = sats.length ? sats[0].offsetWidth : 0;
    if (!reduce) spin += dt * (hover ? .000035 : .00011);
    for (var i = 0; i < sats.length; i++) {
      var a = spin + i / sats.length * 6.2832, ex = Math.cos(a) * R, ey = Math.sin(a) * r;
      var x = c + ex * Math.cos(tilt) - ey * Math.sin(tilt), y = c + ex * Math.sin(tilt) + ey * Math.cos(tilt);
      var depth = Math.sin(a), sc = .72 + .28 * (depth + 1) / 2;
      sats[i].style.transform = 'translate(' + (x - sw / 2).toFixed(1) + 'px,' + (y - sw / 2).toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
      sats[i].style.zIndex = depth > 0 ? 3 : 1;
      sats[i].style.opacity = depth > 0 ? 1 : .55 + .45 * (depth + 1);
    }
    if (planet) planet.style.zIndex = 2;
  }

  function frame(t) {
    var dt = lastT ? Math.min(64, t - lastT) : 16; lastT = t;
    if (!document.hidden) { drawStars(t); placeSats(dt); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------------- nav ----------------
  var nav = document.querySelector('.site-nav');
  function onScroll() { scrollY0 = scrollY; nav.classList.toggle('solid', scrollY > 40); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---------------- campaign trail ----------------
  var worlds = [].slice.call(document.querySelectorAll('.world'));
  var bgs = [].slice.call(document.querySelectorAll('.trail-bg img'));
  var stops = [].slice.call(document.querySelectorAll('.rail .stop'));
  var fill = document.querySelector('.rail .fill'), rocket = document.querySelector('.rail .rocket'), trail = document.querySelector('.trail-worlds');
  var active = -1;
  function setWorld(i) {
    if (i === active) return; active = i;
    bgs.forEach(function (b, k) { b.classList.toggle('on', k === i); });
    stops.forEach(function (s, k) { s.classList.toggle('done', k <= i); });
    document.documentElement.style.setProperty('--acc', worlds[i].getAttribute('data-acc'));
  }
  function setProgress(p) {
    p = Math.max(0, Math.min(1, p));
    if (fill) fill.style.height = (p * 100) + '%';
    if (rocket) rocket.style.top = (p * 100) + '%';
  }
  // Rail stops sit where each world's section starts.
  stops.forEach(function (s, k) { s.style.top = (k / (stops.length - 1) * 100) + '%'; });

  var G = window.gsap, ST = window.ScrollTrigger;
  if (G && ST && !reduce) {
    G.registerPlugin(ST);
    if (window.Lenis) {
      var lenis = new window.Lenis({ lerp: .11 });
      lenis.on('scroll', ST.update);
      G.ticker.add(function (time) { lenis.raf(time * 1000); });
      G.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) { var el = document.querySelector(a.getAttribute('href')); if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -70 }); } });
      });
    }
    worlds.forEach(function (w, i) {
      ST.create({ trigger: w, start: 'top 55%', end: 'bottom 55%', onToggle: function (self) { if (self.isActive) setWorld(i); } });
      var icons = w.querySelectorAll('.biz li');
      G.from(icons, { y: 40, opacity: 0, scale: .6, rotation: -12, duration: .7, ease: 'back.out(1.8)', stagger: .05,
        scrollTrigger: { trigger: w.querySelector('.biz'), start: 'top 85%', once: true } });
      G.from(w.querySelector('h3'), { yPercent: 40, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: w, start: 'top 70%', once: true } });
    });
    if (trail) ST.create({ trigger: trail, start: 'top 50%', end: 'bottom 50%', scrub: true, onUpdate: function (self) { setProgress(self.progress); } });
    G.from('.member', { y: 30, opacity: 0, duration: .6, ease: 'power2.out', stagger: .04, scrollTrigger: { trigger: '.cabinet .row', start: 'top 85%', once: true } });
  } else {
    // No GSAP (blocked, or reduced motion): switch worlds with an IntersectionObserver instead.
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setWorld(worlds.indexOf(e.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    worlds.forEach(function (w) { io.observe(w); });
    addEventListener('scroll', function () {
      if (!trail) return;
      var r = trail.getBoundingClientRect(); setProgress((innerHeight / 2 - r.top) / r.height);
    }, { passive: true });
  }
  if (worlds.length) setWorld(0);

  // ---------------- parody election tally ----------------
  var pf = document.getElementById('pf'), pm = document.getElementById('pm'), pst = document.getElementById('pst');
  if (pf && cfg.server) {
    fetch(cfg.server + '/v1/poll?poll=pres2026', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (p) {
      var a = p.counts.flip || 0, b = p.counts.moneybags || 0, t = a + b, few = t < 20, pa = few ? 50 : Math.round(a / t * 100);
      pf.style.width = pa + '%'; pm.style.width = (100 - pa) + '%';
      pst.textContent = p.closed ? (p.winner === 'flip' ? 'Polls closed. Gov. Flip-Flopson wins.' : 'Polls closed. Mr. Moneybags McGee wins.')
        : few ? 'Too early to call. Cast your vote in the game.' : pa + '% Flip-Flopson, ' + (100 - pa) + '% Moneybags, from ' + t.toLocaleString('en-US') + ' votes.';
    }).catch(function () { pst.textContent = 'The vote count is taking a coffee break. Check back soon.'; });
  }

  // ---------------- display ads ----------------
  document.querySelectorAll('ins.adsbygoogle').forEach(function () { try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {} });
})();
