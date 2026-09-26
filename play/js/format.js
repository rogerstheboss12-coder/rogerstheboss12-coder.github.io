/* Number and time formatting. */
(function (root) {
  'use strict';
  var NAMES = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion',
    'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion',
    'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion', 'vigintillion',
    'unvigintillion', 'duovigintillion', 'tresvigintillion', 'quattuorvigintillion', 'quinvigintillion',
    'sexvigintillion', 'septenvigintillion', 'octovigintillion', 'novemvigintillion', 'trigintillion',
    'untrigintillion', 'duotrigintillion', 'trestrigintillion', 'quattuortrigintillion', 'quintrigintillion',
    'sextrigintillion', 'septentrigintillion', 'octotrigintillion', 'novemtrigintillion', 'quadragintillion',
    'unquadragintillion', 'duoquadragintillion', 'tresquadragintillion', 'quattuorquadragintillion',
    'quinquadragintillion', 'sexquadragintillion', 'septenquadragintillion', 'octoquadragintillion',
    'novemquadragintillion', 'quinquagintillion', 'unquinquagintillion', 'duoquinquagintillion',
    'tresquinquagintillion', 'quattuorquinquagintillion', 'quinquinquagintillion', 'sexquinquagintillion',
    'septenquinquagintillion', 'octoquinquagintillion', 'novemquinquagintillion', 'sexagintillion',
    'unsexagintillion', 'duosexagintillion', 'tresexagintillion', 'quattuorsexagintillion', 'quinsexagintillion',
    'sexsexagintillion', 'septsexagintillion', 'octosexagintillion', 'novemsexagintillion', 'septuagintillion',
    'unseptuagintillion', 'duoseptuagintillion', 'treseptuagintillion', 'quattuorseptuagintillion',
    'quinseptuagintillion', 'sexseptuagintillion', 'septseptuagintillion', 'octoseptuagintillion',
    'novemseptuagintillion', 'octogintillion', 'unoctogintillion', 'duooctogintillion', 'tresoctogintillion',
    'quattuoroctogintillion', 'quinoctogintillion', 'sexoctogintillion', 'septoctogintillion', 'octooctogintillion',
    'novemoctogintillion', 'nonagintillion', 'unnonagintillion', 'duononagintillion', 'trenonagintillion',
    'quattuornonagintillion', 'quinnonagintillion', 'sexnonagintillion', 'septnonagintillion', 'octononagintillion',
    'novemnonagintillion', 'centillion'];

  // Big-number style (#7): 'named' (1.234 million), 'letters' (1.23M, then 1.23aa, 1.23ab…) or 'sci' (1.23e6).
  var mode = 'named';
  function setMode(m) { mode = m === 'letters' || m === 'sci' ? m : 'named'; }
  var LETTERS = ['', 'K', 'M', 'B', 'T'];
  function letters(k) {
    if (k < LETTERS.length) return LETTERS[k];
    var i = k - LETTERS.length, a = 'abcdefghijklmnopqrstuvwxyz';
    return i < 676 ? a[Math.floor(i / 26)] + a[i % 26] : null;
  }

  // Returns { num: '1.234', word: 'million' } so the UI can style them separately.
  function parts(n) {
    if (!isFinite(n)) return { num: '∞', word: '' };
    if (n < 0) { var p = parts(-n); p.num = '-' + p.num; return p; }
    if (n < 1e6) {
      var d = n < 10 ? 2 : n < 1000 ? 2 : 0;
      if (n >= 1000) return { num: Math.floor(n).toLocaleString('en-US'), word: '' };
      return { num: n.toFixed(d).replace(/\.00$/, ''), word: '' };
    }
    if (mode === 'sci') return { num: n.toExponential(3).replace('e+', 'e'), word: '' };
    var k = Math.floor(Math.log10(n) / 3);
    if (mode === 'letters') {
      var lv = n / Math.pow(10, k * 3);
      if (lv >= 999.995) { lv /= 1000; k++; }
      var suf = letters(k);
      return suf == null ? { num: n.toExponential(3).replace('e+', 'e'), word: '' } : { num: lv.toFixed(2) + suf, word: '' };
    }
    if (k >= NAMES.length) return { num: n.toExponential(3).replace('e+', 'e'), word: '' };
    var v = n / Math.pow(10, k * 3);
    if (v >= 999.9995) { v /= 1000; k++; }
    // Spanish (long scale) only names up to decillion; beyond that use scientific notation.
    if (k > 11 && root.I18N && root.I18N.current() !== 'en') return { num: n.toExponential(3).replace('e+', 'e'), word: '' };
    return { num: v.toFixed(3), word: root.T ? root.T(NAMES[k]) : NAMES[k] };
  }

  function money(n, sym) {
    var p = parts(n);
    return (sym || '$') + p.num + (p.word ? ' ' + p.word : '');
  }

  function num(n) {
    var p = parts(n);
    return p.num + (p.word ? ' ' + p.word : '');
  }

  function short(n) { // compact, for badges
    if (n < 1e3) return String(Math.floor(n));
    var k = Math.floor(Math.log10(n) / 3);
    if (mode === 'sci') return n.toExponential(1).replace('e+', 'e');
    var suf = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    if (mode === 'letters' && k >= suf.length && letters(k)) return (n / Math.pow(10, k * 3)).toFixed(1).replace(/\.0$/, '') + letters(k);
    if (k < suf.length) return (n / Math.pow(10, k * 3)).toFixed(1).replace(/\.0$/, '') + suf[k];
    return n.toExponential(1).replace('e+', 'e');
  }

  function time(sec) {
    if (!isFinite(sec)) return '—';
    if (sec < 1) return sec.toFixed(2) + 's';
    sec = Math.ceil(sec);
    var d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    function p2(x) { return (x < 10 ? '0' : '') + x; }
    if (d) return d + 'd ' + p2(h) + ':' + p2(m) + ':' + p2(s);
    return p2(h) + ':' + p2(m) + ':' + p2(s);
  }

  function unit(n, one, many) {
    var t = root.T || function (x, v) { return x.replace('{n}', v.n); };
    return t(n === '1' ? one : many, { n: n });
  }
  function duration(sec) { // human words (translated)
    sec = Math.floor(sec);
    if (sec < 60) return unit(String(sec), '{n} second', '{n} seconds');
    if (sec < 3600) return unit(String(Math.floor(sec / 60)), '{n} minute', '{n} minutes');
    if (sec < 86400) return unit((sec / 3600).toFixed(1).replace(/\.0$/, ''), '{n} hour', '{n} hours');
    return unit((sec / 86400).toFixed(1).replace(/\.0$/, ''), '{n} day', '{n} days');
  }

  root.Fmt = { parts: parts, money: money, num: num, short: short, time: time, duration: duration, setMode: setMode, mode: function () { return mode; } };
})(typeof window !== 'undefined' ? window : globalThis);
