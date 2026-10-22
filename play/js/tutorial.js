/* First-run guided tutorial: a spotlight + speech bubble that walks the player
 * through tapping, buying, unlocking, hiring and speeches. */
(function (root) {
  'use strict';
  var T = root.T, E = root.Engine;
  var S = null, layer, spot, bubble, lastStep = -1;

  function q(sel) { return document.querySelector(sel); }
  function W0() { return S.worlds[0]; }

  var STEPS = [
    { text: 'Tap the Flag Stand to make your first dollar!', target: function () { return q('.biz:nth-child(1) .biz-icon'); },
      done: function () { return W0().lifetime > 0 || W0().biz[0].owned > 1; } },
    { text: 'Cha-ching! Buy another Flag Stand to earn more per tap.', target: function () { return q('.biz:nth-child(1) .biz-buy'); },
      done: function () { return W0().biz[0].owned >= 2; } },
    { text: 'Keep tapping and buying. Save $60 to open the Bald Eagle Hatchery.',
      // Point at what the player should do right now: tap to earn until they can afford the unlock.
      target: function () { return W0().cash >= 60 ? q('.biz:nth-child(2) .biz-buy') : q('.biz:nth-child(1) .biz-icon'); },
      done: function () { return W0().biz[1].owned >= 1; } },
    { text: 'Every 25 of a business doubles its speed! Grow your empire until you have $1,000.', target: function () { return q('#cash-box'); },
      done: function () { return W0().cash >= 1000 || W0().biz[0].manager; } },
    { text: 'Time to delegate. Open the Cabinet to hire a manager.', target: function () { return q('#menu [data-panel=managers]'); },
      done: function () { return root.UI.isOpen() === 'managers' || W0().biz[0].manager; }, allowModal: true },
    { text: 'Hire George Washingtun. He\'ll run the Flag Stand forever — even while you\'re away.', target: function () { return q('.modal [data-act=hire][data-i="0"]'); },
      done: function () { return W0().biz[0].manager; }, allowModal: true },
    { text: 'Last tip: give a Stump Speech to double all profits for 4 hours. Go get \'em, President!', target: function () { return q('#speech-btn'); },
      done: function () { return S.stats.speeches > 0; }, finalSkip: true }
  ];

  function init(state) {
    S = state;
    layer = document.getElementById('tutorial-layer');
    layer.innerHTML = '<div class="tut-spot"></div><div class="tut-bubble"><div class="tut-text"></div><div class="tut-actions"><button class="tut-skip" data-act="tutorialSkip"></button></div></div>';
    spot = layer.querySelector('.tut-spot');
    bubble = layer.querySelector('.tut-bubble');
  }
  function setState(state) { S = state; lastStep = -1; }

  function active() { return S && !S.tutorial.done && S.world === 0; }

  function update() {
    if (!layer) return;
    if (!active()) { layer.classList.remove('show'); return; }
    var st = STEPS[S.tutorial.step];
    if (!st) { finish(); return; }
    if (st.done()) {
      S.tutorial.step++;
      if (root.Analytics) root.Analytics.track('tutorial_step', { step: S.tutorial.step });
      if (S.tutorial.step >= STEPS.length) { finish(); return; }
      st = STEPS[S.tutorial.step];
    }
    var blocking = root.UI.anyModal() && !st.allowModal;
    var el = st.target();
    if (blocking || document.querySelector('.cine')) { layer.classList.remove('show'); return; }
    layer.classList.add('show');
    if (lastStep !== S.tutorial.step) {
      lastStep = S.tutorial.step;
      layer.querySelector('.tut-text').textContent = T(st.text);
      layer.querySelector('.tut-skip').textContent = st.finalSkip ? T('Finish tutorial') : T('Skip tutorial');
      bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
    }
    if (el) {
      var r = el.getBoundingClientRect(), pad = 8;
      spot.style.display = 'block';
      spot.style.left = (r.left - pad) + 'px'; spot.style.top = (r.top - pad) + 'px';
      spot.style.width = (r.width + pad * 2) + 'px'; spot.style.height = (r.height + pad * 2) + 'px';
      var below = r.bottom + 150 < innerHeight;
      var bw = Math.min(320, innerWidth - 24);
      var x = Math.max(12, Math.min(innerWidth - bw - 12, r.left + r.width / 2 - bw / 2));
      bubble.style.width = bw + 'px';
      bubble.style.left = x + 'px';
      bubble.style.top = below ? (r.bottom + 16) + 'px' : 'auto';
      bubble.style.bottom = below ? 'auto' : (innerHeight - r.top + 16) + 'px';
      bubble.classList.toggle('above', !below);
    } else {
      spot.style.display = 'none';
      bubble.style.left = '12px'; bubble.style.top = 'auto'; bubble.style.bottom = '100px';
    }
  }

  function finish() {
    S.tutorial.done = true;
    layer.classList.remove('show');
    if (root.Analytics) root.Analytics.track('tutorial_done', { step: S.tutorial.step });
  }
  function restart() { S.tutorial.done = false; S.tutorial.step = 0; lastStep = -1; if (S.world !== 0) root.Game.act('travel', { w: '0' }); }

  root.Tutorial = { init: init, setState: setState, update: update, finish: finish, restart: restart, active: active, STEPS: STEPS };
})(typeof window !== 'undefined' ? window : globalThis);
