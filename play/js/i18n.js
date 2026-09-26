/* Tiny i18n: English source strings are the keys; language packs map them to translations.
 * T('Own {n} {biz}.', { n: 25, biz: 'Flag Stand' }) — placeholders are replaced after lookup,
 * and placeholder *values* that are themselves strings are translated too when marked with T.name(). */
(function (root) {
  'use strict';
  var packs = { en: null };
  var lang = 'en';

  function detect() {
    var n = (root.navigator && (navigator.languages && navigator.languages[0] || navigator.language)) || 'en';
    n = n.toLowerCase().slice(0, 2);
    return packs[n] !== undefined ? n : 'en';
  }

  function setLang(code) {
    lang = code === 'auto' || !code ? detect() : (packs[code] !== undefined ? code : 'en');
    if (root.document) document.documentElement.lang = lang;
    return lang;
  }

  function T(s, vars) {
    if (s == null) return '';
    var p = packs[lang];
    var out = (p && p[s]) || s;
    if (vars) out = out.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return out;
  }

  function register(code, dict) { packs[code] = Object.assign(packs[code] || {}, dict); }
  function current() { return lang; }
  function available() { return Object.keys(packs); }

  root.I18N = { T: T, setLang: setLang, register: register, current: current, available: available, detect: detect };
  root.T = T;
})(typeof window !== 'undefined' ? window : globalThis);
