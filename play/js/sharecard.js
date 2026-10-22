/* Share cards (1.1.4): draws a 1080×1350 parody "front page" (milestones) or campaign poster on a canvas.
 * Input is plain data from GrowthUI (name, headline, numbers, portrait key, invite code); sharing is in Platform.shareImage. */
(function (root) {
  'use strict';
  var W = 1080, H = 1350;
  var SERIF = 'Georgia, "Times New Roman", serif', SANS = '"Avenir Next", "Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  var NAVY = '#0c1430', RED = '#c8102e', GOLD = '#f5c518', PAPER = '#f3ead7', INK = '#1d1a16';

  function font(ctx, weight, size, family) { ctx.font = weight + ' ' + Math.round(size) + 'px ' + family; }
  function wrap(ctx, text, maxW) {
    var words = String(text || '').split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      var next = line ? line + ' ' + w : w;
      if (line && ctx.measureText(next).width > maxW) { lines.push(line); line = w; } else line = next;
    });
    if (line) lines.push(line);
    return lines;
  }
  // Biggest size (from `size` down to `min`) at which the text fits in `maxLines` lines; returns { size, lines }.
  function fit(ctx, text, maxW, size, min, maxLines, weight, family) {
    for (; size > min; size -= 4) {
      font(ctx, weight, size, family);
      var lines = wrap(ctx, text, maxW);
      if (lines.length <= maxLines && lines.every(function (l) { return ctx.measureText(l).width <= maxW; })) return { size: size, lines: lines };
    }
    font(ctx, weight, min, family);
    return { size: min, lines: wrap(ctx, text, maxW) };
  }
  function oneLine(ctx, text, maxW, size, weight, family) {
    for (; size > 14; size -= 2) { font(ctx, weight, size, family); if (ctx.measureText(text).width <= maxW) break; }
    return size;
  }
  function star(ctx, x, y, r, color) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r;
      ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }
  function loadPortrait(face, bg) {
    return new Promise(function (res) {
      var img = new Image();
      img.onload = function () { res(img); };
      img.onerror = function () { res(null); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(root.Portraits.portrait(face, { uid: 'share', bg: bg }));
    });
  }
  function drawPortrait(ctx, img, cx, cy, r, ring) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, Math.PI * 2); ctx.fillStyle = ring; ctx.fill();
    if (img) ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }
  // Navy band with "Free on the App Store" and the invite code.
  function footer(ctx, info, top) {
    ctx.fillStyle = NAVY; ctx.fillRect(0, top, W, H - top);
    ctx.fillStyle = RED; ctx.fillRect(0, top, W, 8);
    var mid = top + (H - top) / 2 - 12;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
    oneLine(ctx, info.labels.free, info.code ? 520 : 960, 46, '800', SANS);
    ctx.fillText(info.labels.free, 60, mid);
    if (info.code) {
      ctx.textAlign = 'right'; ctx.fillStyle = GOLD;
      oneLine(ctx, info.labels.code, 420, 50, '800', 'ui-monospace, Menlo, monospace');
      ctx.fillText(info.labels.code, W - 60, mid);
    }
    ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.65)';
    oneLine(ctx, info.labels.parody, 960, 22, '500', SANS);
    ctx.fillText(info.labels.parody, W / 2, H - 30);
  }

  function frontPage(ctx, info, img) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(24, 24, W - 48, H - 48);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = RED;
    font(ctx, '700', 26, SANS);
    var ed = '★ ' + info.labels.edition.toUpperCase() + ' ★';
    ctx.fillText(ed, W / 2, 86);
    ctx.fillStyle = INK;
    oneLine(ctx, info.labels.masthead, 960, 92, '700', SERIF);
    ctx.fillText(info.labels.masthead, W / 2, 180);
    ctx.fillRect(60, 204, W - 120, 4); ctx.fillRect(60, 214, W - 120, 1.5);
    font(ctx, 'italic 400', 26, SERIF); ctx.textAlign = 'left'; ctx.fillText(info.date, 60, 250);
    ctx.textAlign = 'right'; ctx.fillText(info.labels.price, W - 60, 250);
    ctx.fillRect(60, 268, W - 120, 1.5);
    // Headline + deck
    ctx.textAlign = 'center';
    var h = fit(ctx, info.head, 960, 96, 52, 3, '800', SERIF), y = 290 + h.size;
    h.lines.forEach(function (l) { ctx.fillText(l, W / 2, y); y += h.size * 1.08; });
    font(ctx, 'italic 400', 32, SERIF); ctx.fillStyle = '#4a4339';
    var deck = wrap(ctx, info.deck, 900).slice(0, 2);
    y += 6;
    deck.forEach(function (l) { ctx.fillText(l, W / 2, y); y += 40; });
    ctx.fillStyle = INK; ctx.fillRect(60, y, W - 120, 1.5);
    // Photo + caption (left), numbers (right)
    var footTop = 1196, r = Math.min(180, (footTop - y - 120) / 2), cx = 60 + r + 10, cy = y + 30 + r + 10;
    drawPortrait(ctx, img, cx, cy, r, INK);
    ctx.fillStyle = INK; ctx.textAlign = 'center';
    oneLine(ctx, info.name, 2 * r + 60, 30, 'italic 700', SERIF);
    ctx.fillText(info.name, cx, cy + r + 52);
    var sx = cx + r + 60, sw = W - 60 - sx, rows = info.stats, rh = Math.min(110, (footTop - y - 50) / rows.length), sy = y + 30;
    var vs = Math.min(46, rh - 44);
    ctx.textAlign = 'left';
    rows.forEach(function (row, i) {
      var top = sy + i * rh;
      ctx.fillStyle = '#6b6153'; font(ctx, '700', 22, SANS); ctx.fillText(String(row[0]).toUpperCase(), sx, top + 24);
      ctx.fillStyle = INK; oneLine(ctx, row[1], sw, vs, '800', SERIF); ctx.fillText(row[1], sx, top + 32 + vs);
      if (i < rows.length - 1) ctx.fillRect(sx, top + rh - 8, sw, 1);
    });
    footer(ctx, info, footTop);
  }

  function posterPage(ctx, info, img) {
    ctx.fillStyle = NAVY; ctx.fillRect(0, 0, W, H);
    // Stripes behind the portrait, a row of stars on top.
    for (var i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? '#f4f1ea' : RED; ctx.fillRect(0, 300 + i * 70, W, 70); }
    ctx.fillStyle = 'rgba(12,20,48,0.35)'; ctx.fillRect(0, 300, W, 490);
    for (var k = 0; k < 9; k++) star(ctx, 90 + k * 112.5, 70, 22, GOLD);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#fff';
    font(ctx, '900', 150, SERIF);
    ctx.fillText(info.labels.vote.toUpperCase(), W / 2, 250);
    drawPortrait(ctx, img, W / 2, 545, 230, '#fff');
    ctx.fillStyle = GOLD;
    oneLine(ctx, info.name, 960, 64, '800', SERIF);
    ctx.fillText(info.name, W / 2, 880);
    ctx.fillStyle = '#fff';
    var s = fit(ctx, '“' + info.slogan + '”', 940, 80, 44, 3, 'italic 700', SERIF), y = 920 + s.size;
    s.lines.forEach(function (l) { ctx.fillText(l, W / 2, y); y += s.size * 1.1; });
    footer(ctx, info, 1196);
  }

  // info: from GrowthUI.cardInfo. Resolves the drawn canvas.
  function render(info) {
    return loadPortrait(info.face, info.faceBg).then(function (img) {
      var c = document.createElement('canvas');
      c.width = W; c.height = H;
      var ctx = c.getContext('2d');
      (info.kind === 'poster' ? posterPage : frontPage)(ctx, info, img);
      return c;
    });
  }
  root.ShareCard = { render: render, W: W, H: H };
})(typeof window !== 'undefined' ? window : globalThis);
