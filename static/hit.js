/* Counts a page view: sends only the path and the referring site's host. No cookies, storage or ids. Totals: node tools/site/stats.mjs
 * window.sstHit(path) counts a virtual page (e.g. '/quiz/result/snoozeworth') the same way. */
(function () {
  function send(p) {
    try {
      if (/^(localhost|127\.)/.test(location.hostname) || navigator.webdriver) return;
      var r = ''; try { r = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
      var body = JSON.stringify({ p: p, r: r }), url = 'https://sst-leagues.rogerstheboss12.workers.dev/v1/hit';
      if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }));
      else fetch(url, { method: 'POST', body: body, keepalive: true, headers: { 'Content-Type': 'text/plain' } });
    } catch (e) {}
  }
  window.sstHit = send;
  send(location.pathname);
})();
