/* Free browser demo (built with `node scripts/build.mjs --demo`): World 1, the live event and the Campaign vote.
 * Purchases, ads and further worlds point players to the App Store instead. Does nothing in the app. */
(function (root) {
  'use strict';
  var DEMO = !!(root.BUILD && root.BUILD.demo);
  var APP_URL = 'https://apps.apple.com/app/id6816208938';
  var UI = root.UI, T = root.T;
  function tE(s, v) { return UI.tE(s, v); }
  function track(why) { if (root.Analytics) root.Analytics.track('demo_cta', { why: why }); }

  function cta() {
    return '<div class="demo-cta"><p>' + tE('Enjoying the demo? The full game is free on iPhone and iPad: 5 worlds, rotating events, leaderboards and more.') + '</p>' +
      '<a class="btn gold big" href="' + APP_URL + '" target="_blank" rel="noopener" onclick="DemoUI.track(\'button\')">📱 ' + tE('Get it free on the App Store') + '</a></div>';
  }
  var WHY = {
    world: 'The rest of the galaxy is waiting in the full game! Launch to Mars, the Galaxy, the Universe and the Multiverse on iPhone and iPad.',
    store: 'Purchases are available in the App Store version.',
    ads: 'Bonus rewards are available in the App Store version.'
  };
  function prompt(why) {
    track(why);
    UI.modal(UI.head('🇺🇸 ' + tE('Keep your empire growing'), '') + '<div class="modal-body center"><p>' + tE(WHY[why] || WHY.world) + '</p>' + cta() +
      '<div class="dialog-actions"><button class="btn blue" data-act="close">' + tE('Keep playing the demo') + '</button></div></div>', 'small');
  }
  function banner() {
    var b = document.createElement('a');
    b.className = 'demo-banner'; b.href = APP_URL; b.target = '_blank'; b.rel = 'noopener';
    b.innerHTML = '📱 ' + tE('Free demo · Get the full game on the App Store') + ' ›';
    b.addEventListener('click', function () { track('banner'); });
    document.body.appendChild(b);
    document.documentElement.classList.add('is-demo');
  }
  root.DemoUI = { on: DEMO, cta: cta, prompt: prompt, track: track };
  if (DEMO) {
    // After the game has picked its language.
    var go = function () { setTimeout(banner, 800); };
    if (document.readyState === 'complete') go(); else root.addEventListener('load', go);
  }
})(typeof window !== 'undefined' ? window : globalThis);
