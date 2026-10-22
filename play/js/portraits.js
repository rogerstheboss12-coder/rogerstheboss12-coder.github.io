/* Procedural SVG caricatures for the parody-politician managers.
 * Every face is assembled from a small kit of parts: head, hair, facial hair,
 * eyewear, headwear and expression. */
(function (root) {
  'use strict';

  var SKIN = { a: '#f6d2b5', b: '#efc19e', c: '#e7b08a', d: '#c98e63', e: '#8d5a3b', alien: '#7cff6b', alien2: '#b69cff', metal: '#b8c0cc', pale: '#f3dcc8' };

  var FACES = {
    // Earth
    washington: { skin: 'a', hair: 'wig', hairColor: '#f2f2f2', mouth: 'tight', suit: '#1f3a93', tie: 'cravat', jaw: 1.05 },
    teddy: { skin: 'b', hair: 'short', hairColor: '#6b4a2b', stache: 'walrus', glasses: 'pince', mouth: 'grin', suit: '#6b4f2a', tie: '#7a1f1f' },
    lincoln: { skin: 'c', hair: 'mop', hairColor: '#2a1d14', beard: 'chin', hat: 'tophat', mouth: 'tight', suit: '#1a1a1a', tie: '#1a1a1a', long: 1.18 },
    jefferson: { skin: 'a', hair: 'wig', hairColor: '#d9a066', mouth: 'smile', suit: '#3b5b3b', tie: 'cravat' },
    reagan: { skin: 'b', hair: 'pomp', hairColor: '#4a2f1d', mouth: 'grin', suit: '#2c3e63', tie: '#c8102e', cheeks: true },
    nixon: { skin: 'c', hair: 'recede', hairColor: '#3a2a20', mouth: 'smirk', suit: '#3d3d3d', tie: '#1f3a93', nose: 1.5, jowls: true, brows: 'heavy' },
    ike: { skin: 'b', hair: 'bald', hairColor: '#d8c8b0', mouth: 'grin', suit: '#6b6b3a', tie: '#6b6b3a', stars: 5 },
    jfk: { skin: 'b', hair: 'pomp', hairColor: '#8a5a2b', mouth: 'grin', suit: '#2b2f3a', tie: '#2b2f3a', jaw: 1.08 },
    hamilton: { skin: 'a', hair: 'wig', hairColor: '#c98a4a', mouth: 'smirk', suit: '#1f3a93', tie: 'cravat' },
    fdr: { skin: 'b', hair: 'recede', hairColor: '#7a7a7a', glasses: 'pince', mouth: 'grin', suit: '#3d3d4d', tie: '#1f3a93' },
    // Solar System
    cleveland: { skin: 'b', hair: 'side', hairColor: '#6b5a4a', stache: 'walrus', mouth: 'none', suit: '#2b2f3a', tie: '#2b2f3a', wide: 1.25, jowls: true },
    carter: { skin: 'b', hair: 'side', hairColor: '#c9a86a', mouth: 'bigteeth', suit: '#7a5a3a', tie: '#1f3a93' },
    hoover: { skin: 'a', hair: 'side', hairColor: '#5a4a3a', mouth: 'tight', suit: '#333333', tie: '#333333', collar: true, jaw: 1.15 },
    lbj: { skin: 'b', hair: 'side', hairColor: '#7a7a7a', hat: 'cowboy', mouth: 'grin', suit: '#6b8fb5', tie: '#c8102e', ears: 1.45, nose: 1.35, long: 1.1 },
    ford: { skin: 'b', hair: 'bald', hairColor: '#c9a86a', mouth: 'smile', suit: '#2c3e63', tie: '#c8a82e' },
    harding: { skin: 'a', hair: 'side', hairColor: '#e0e0e0', brows: 'heavy', mouth: 'smile', suit: '#1b2a4a', tie: '#c8102e', jaw: 1.1 },
    polk: { skin: 'a', hair: 'swept', hairColor: '#b0b0b0', mouth: 'tight', suit: '#1a1a1a', tie: 'cravat', brows: 'heavy', long: 1.08 },
    tyler: { skin: 'a', hair: 'side', hairColor: '#d8c8b0', mouth: 'smile', suit: '#2e6b8a', tie: '#f5c518', nose: 1.5, bowtie: true },
    mckinley: { skin: 'a', hair: 'recede', hairColor: '#3a2a20', brows: 'heavy', mouth: 'tight', suit: '#333333', tie: '#333333', jaw: 1.1, visorsun: true },
    truman: { skin: 'a', hair: 'side', hairColor: '#b0b0b0', glasses: 'round', mouth: 'grin', suit: '#3d3d4d', tie: '#c8102e', bowtie: true },
    // Milky Way
    alien1: { skin: 'alien', hair: 'none', alien: true, mouth: 'smile', suit: '#1f3a93', tie: '#c8102e' },
    monroe: { skin: 'a', hair: 'wig', hairColor: '#e8e8e8', mouth: 'tight', suit: '#7a1f1f', tie: 'cravat', visor: true },
    madison: { skin: 'pale', hair: 'wig', hairColor: '#d8d8d8', mouth: 'smile', suit: '#5c2e7a', tie: 'cravat', small: 0.9, antenna: true },
    taft: { skin: 'b', hair: 'side', hairColor: '#8a6a4a', stache: 'handlebar', mouth: 'smile', suit: '#6b4f2a', tie: '#c8a82e', wide: 1.3, hat: 'cowboy' },
    grant: { skin: 'c', hair: 'short', hairColor: '#4a3525', beard: 'full', mouth: 'none', suit: '#1f3a93', tie: '#1f3a93', stars: 3 },
    wilson: { skin: 'a', hair: 'side', hairColor: '#8a8a8a', glasses: 'pince', mouth: 'tight', suit: '#333333', tie: '#333333', long: 1.15 },
    clonewash: { skin: 'a', hair: 'wig', hairColor: '#f2f2f2', mouth: 'tight', suit: '#1f3a93', tie: 'cravat', barcode: true },
    alien2: { skin: 'alien2', hair: 'none', alien: true, eyes3: true, mouth: 'open', suit: '#333333', tie: '#f5c518' },
    jackson: { skin: 'a', hair: 'tall', hairColor: '#e8e8e8', mouth: 'tight', suit: '#1a1a1a', tie: 'cravat', long: 1.12, brows: 'heavy' },
    robolincoln: { skin: 'metal', hair: 'none', robot: true, beard: 'chin', beardColor: '#555b63', hat: 'tophat', mouth: 'robot', suit: '#1a1a1a', tie: '#1a1a1a', long: 1.15 },
    // Universe
    coolidge: { skin: 'a', hair: 'side', hairColor: '#b5652a', mouth: 'tight', suit: '#2b2f3a', tie: '#a35cff', glow: '#a35cff' },
    jqadams: { skin: 'a', hair: 'bald', hairColor: '#e8e8e8', mouth: 'tight', suit: '#1a1a1a', tie: 'cravat', mutton: true },
    vanburen: { skin: 'a', hair: 'bald', hairColor: '#f2f2f2', mutton: true, muttonBig: true, mouth: 'smile', suit: '#1a1a1a', tie: 'cravat' },
    arthur: { skin: 'b', hair: 'short', hairColor: '#6b4a2b', mutton: true, stache: 'walrus', mouth: 'none', suit: '#3d3d4d', tie: '#3d3d4d' },
    hayes: { skin: 'b', hair: 'short', hairColor: '#8a6a4a', beard: 'long', mouth: 'none', suit: '#1a1a1a', tie: '#1a1a1a' },
    bharrison: { skin: 'a', hair: 'bald', hairColor: '#c9a86a', beard: 'full', beardColor: '#c9a86a', mouth: 'none', suit: '#3d3d4d', tie: '#3d3d4d' },
    fillmore: { skin: 'a', hair: 'side', hairColor: '#dcdcdc', mouth: 'tight', suit: '#1a1a1a', tie: 'cravat', brows: 'heavy' },
    ztaylor: { skin: 'c', hair: 'mop', hairColor: '#8a8a8a', mouth: 'grin', suit: '#b1187e', tie: '#f5c518', sparkle: true },
    admin: { skin: 'a', hair: 'none', hood: true, mouth: 'none', suit: '#222831', tie: '#222831', screen: true },
    // Multiverse
    jadams: { skin: 'a', hair: 'recede', hairColor: '#e8e8e8', mouth: 'tight', suit: '#1a1a1a', tie: 'cravat', wide: 1.12, brows: 'heavy', glow: '#ff5fd2' },
    whharrison: { skin: 'b', hair: 'swept', hairColor: '#8a8a8a', mouth: 'smile', suit: '#2b2f3a', tie: 'cravat', long: 1.12, nose: 1.3 },
    pierce: { skin: 'a', hair: 'mop', hairColor: '#3a2a20', mouth: 'smirk', suit: '#1a1a1a', tie: 'cravat', jaw: 1.05 },
    buchanan: { skin: 'a', hair: 'swoop', hairColor: '#f2f2f2', mouth: 'tight', suit: '#1a1a1a', tie: 'cravat', glasses: 'round' },
    ajohnson: { skin: 'b', hair: 'side', hairColor: '#2a1d14', brows: 'heavy', mouth: 'tight', suit: '#1a1a1a', tie: 'cravat', jaw: 1.12 },
    garfield: { skin: 'a', hair: 'short', hairColor: '#7a5a3a', beard: 'full', mouth: 'none', suit: '#2b2f3a', tie: '#2b2f3a' },
    mirrorwash: { skin: 'a', hair: 'wig', hairColor: '#2a2a2a', beard: 'goat', beardColor: '#1a1a1a', mouth: 'smirk', suit: '#5a1f2a', tie: 'cravat', brows: 'heavy' },
    altlincoln: { skin: 'c', hair: 'mop', hairColor: '#2a1d14', stache: 'handlebar', hat: 'tophat', mouth: 'grin', suit: '#6b1f7a', tie: '#f5c518', long: 1.18 },
    kidpres: { skin: 'd', hair: 'buzz', hairColor: '#2a1d14', mouth: 'grin', small: 0.86, suit: '#1f3a93', tie: '#c8102e', hat: 'cap', bowtie: true },
    auntsam: { skin: 'a', hair: 'long', hairColor: '#f2f2f2', hat: 'samhat', mouth: 'smile', suit: '#c8102e', tie: '#1f3a93', lashes: true, bowtie: true },
    franklin: { skin: 'a', hair: 'franklin', hairColor: '#d8d0c0', glasses: 'round', mouth: 'smile', suit: '#6b4f2a', tie: 'cravat', wide: 1.1 },
    ross: { skin: 'a', hair: 'long', hairColor: '#6b3a1f', hat: 'bonnet', mouth: 'smile', suit: '#1f3a93', tie: 'cravat', lashes: true, small: 0.95 },
    revere: { skin: 'b', hair: 'wig', hairColor: '#7a5030', hat: 'tricorn', mouth: 'grin', suit: '#1f3a93', tie: 'cravat' },
    sousa: { skin: 'a', hair: 'short', hairColor: '#2a1d14', beard: 'full', glasses: 'pince', hat: 'bandcap', mouth: 'none', suit: '#c8102e', tie: '#f5c518', stars: 2 },
    liberty: { skin: '#7fd1b0', hair: 'long', hairColor: '#5fb898', hat: 'crown', mouth: 'smile', suit: '#6ac4a0', tie: '#6ac4a0', lashes: true },
    samjr: { skin: 'a', hair: 'short', hairColor: '#f2f2f2', hat: 'samhat', mouth: 'grin', suit: '#1f3a93', tie: '#c8102e', bowtie: true, small: 0.92 },
    // Debate candidates (fictional)
    cand_snooze: { skin: 'pale', hair: 'recede', hairColor: '#bbbbbb', mouth: 'open', hat: 'beanie', suit: '#4a5a7a', tie: '#8fa3d9', brows: 'heavy' },
    cand_flip: { skin: 'b', hair: 'pomp', hairColor: '#d9a066', mouth: 'grin', suit: '#7a2f8a', tie: '#1f3a93', cheeks: true },
    cand_fat: { skin: 'b', hair: 'bald', hairColor: '#8a8a8a', stache: 'handlebar', hat: 'tophat', glasses: 'pince', mouth: 'smirk', suit: '#2f6b2f', tie: '#f5c518', wide: 1.3, jowls: true },
    cand_hat: { skin: 'a', hair: 'short', hairColor: '#4a3525', stache: 'walrus', hat: 'cowboy', mouth: 'grin', suit: '#8a5a2b', tie: '#c8102e' },
    // Space Race rivals (fictional)
    rival_duke: { skin: 'pale', hair: 'side', hairColor: '#c9b89a', stache: 'handlebar', glasses: 'pince', hat: 'tophat', mouth: 'smirk', suit: '#8a7f6a', tie: '#c9b89a' },
    rival_robot: { skin: 'metal', hair: 'none', robot: true, antenna: true, mouth: 'robot', suit: '#3a3f47', tie: '#ff5fd2' },
    rival_alien: { skin: '#ff8a5c', hair: 'none', alien: true, eyes3: true, hat: 'crown', mouth: 'grin', suit: '#4a1f6b', tie: '#ffd24a' },
    rival_king: { skin: 'b', hair: 'side', hairColor: '#7a6a5a', beard: 'chin', beardColor: '#7a6a5a', hat: 'crown', mouth: 'tight', suit: '#6b2a8a', tie: '#f5c518', brows: 'heavy' },
    unclesam: { skin: 'a', hair: 'white', hairColor: '#f2f2f2', beard: 'goat', beardColor: '#f2f2f2', hat: 'samhat', mouth: 'smile', suit: '#1f3a93', tie: '#c8102e', bowtie: true, point: true }
  };

  function shade(hex, f) { // f < 1 darker, > 1 lighter
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function c(x) { return Math.max(0, Math.min(255, Math.round(f < 1 ? x * f : x + (255 - x) * (f - 1)))); }
    return '#' + ((1 << 24) + (c(r) << 16) + (c(g) << 8) + c(b)).toString(16).slice(1);
  }

  function portrait(key, opts) {
    opts = opts || {};
    var f = FACES[key] || FACES.washington;
    var skin = SKIN[f.skin] || f.skin, skinD = shade(skin, 0.82);
    var hc = f.hairColor || '#333', bc = f.beardColor || hc;
    var wide = f.wide || 1, long = f.long || 1, jaw = f.jaw || 1, sm = f.small || 1;
    var hw = 26 * wide * sm, hh = 31 * long * sm; // head half-width/height
    var cx = 50, cy = 50;
    var o = [];
    var uid = 'p' + key + (opts.uid || '');
    var bg = opts.bg || '#26314f';

    o.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="portrait' + (opts.talking ? ' talking' : '') + '">');
    o.push('<defs><clipPath id="c' + uid + '"><circle cx="50" cy="50" r="49"/></clipPath>' +
      '<radialGradient id="g' + uid + '" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="' + shade(bg, 1.35) + '"/><stop offset="1" stop-color="' + bg + '"/></radialGradient></defs>');
    o.push('<g clip-path="url(#c' + uid + ')"><rect width="100" height="100" fill="url(#g' + uid + ')"/><g transform="translate(7.5 15) scale(0.85)">');
    if (f.glow) o.push('<circle cx="50" cy="48" r="40" fill="' + f.glow + '" opacity="0.35"/>');
    if (f.sparkle) for (var s = 0; s < 6; s++) o.push('<circle cx="' + (12 + s * 15) + '" cy="' + (15 + (s % 3) * 10) + '" r="1.6" fill="#fff" opacity="0.8"/>');

    // Shoulders / suit
    var sw = 40 * Math.max(1, wide * 0.9);
    o.push('<path d="M' + (50 - sw) + ' 100 Q' + (50 - sw) + ' 78 50 76 Q' + (50 + sw) + ' 78 ' + (50 + sw) + ' 100Z" fill="' + f.suit + '"/>');
    if (f.hood) o.push('<path d="M14 100 Q10 40 50 18 Q90 40 86 100Z" fill="' + f.suit + '"/>');
    o.push('<path d="M40 77 L50 92 L60 77Z" fill="#fff"/>');
    if (f.tie === 'cravat') o.push('<path d="M43 78 Q50 90 57 78 Q54 86 50 88 Q46 86 43 78Z" fill="#fff" stroke="#ddd" stroke-width="0.8"/>');
    else if (f.bowtie) o.push('<path d="M43 80 L50 83 L57 80 L57 86 L50 83 L43 86Z" fill="' + f.tie + '"/>');
    else o.push('<path d="M48 80 L52 80 L54 ' + (f.tieLong ? 100 : 95) + ' L50 ' + (f.tieLong ? 103 : 98) + ' L46 ' + (f.tieLong ? 100 : 95) + 'Z" fill="' + f.tie + '"/>');
    if (f.stars) for (s = 0; s < f.stars; s++) o.push(star(24 + s * 3.2, 86 - (s % 2) * 2, 1.6, '#f5c518'));
    o.push('<path d="M22 100 L30 84" stroke="' + shade(f.suit, 0.7) + '" stroke-width="1.2"/><path d="M78 100 L70 84" stroke="' + shade(f.suit, 0.7) + '" stroke-width="1.2"/>');
    // US flag pin
    if (!f.noPin) o.push('<rect x="64" y="84" width="5" height="3.4" fill="#c8102e"/><rect x="64" y="84" width="2.2" height="1.8" fill="#1f3a93"/>');

    // Neck
    o.push('<rect x="' + (cx - 8) + '" y="' + (cy + hh * 0.6) + '" width="16" height="14" fill="' + skinD + '"/>');

    // Back hair (wigs, long styles)
    if (f.hair === 'wig') {
      o.push('<ellipse cx="' + cx + '" cy="' + (cy - 4) + '" rx="' + (hw + 7) + '" ry="' + (hh + 3) + '" fill="' + hc + '"/>');
      o.push('<circle cx="' + (cx - hw - 3) + '" cy="' + (cy + 8) + '" r="6" fill="' + hc + '"/><circle cx="' + (cx + hw + 3) + '" cy="' + (cy + 8) + '" r="6" fill="' + hc + '"/>');
      o.push('<circle cx="' + (cx - hw - 3) + '" cy="' + (cy + 17) + '" r="5" fill="' + hc + '"/><circle cx="' + (cx + hw + 3) + '" cy="' + (cy + 17) + '" r="5" fill="' + hc + '"/>');
    }
    if (f.hair === 'long') o.push('<path d="M' + (cx - hw - 5) + ' ' + (cy + hh + 4) + ' Q' + (cx - hw - 8) + ' ' + (cy - hh - 6) + ' ' + cx + ' ' + (cy - hh - 6) + ' Q' + (cx + hw + 8) + ' ' + (cy - hh - 6) + ' ' + (cx + hw + 5) + ' ' + (cy + hh + 4) + 'Z" fill="' + hc + '"/>');
    if (f.hair === 'franklin') o.push('<path d="M' + (cx - hw - 4) + ' ' + (cy + hh) + ' Q' + (cx - hw - 7) + ' ' + (cy - 6) + ' ' + (cx - hw + 2) + ' ' + (cy - 12) + ' L' + (cx - hw + 4) + ' ' + (cy + 4) + 'Z M' + (cx + hw + 4) + ' ' + (cy + hh) + ' Q' + (cx + hw + 7) + ' ' + (cy - 6) + ' ' + (cx + hw - 2) + ' ' + (cy - 12) + ' L' + (cx + hw - 4) + ' ' + (cy + 4) + 'Z" fill="' + hc + '"/>');
    if (f.hair === 'tall') o.push('<path d="M' + (cx - hw - 4) + ' ' + (cy + 5) + ' Q' + (cx - hw) + ' ' + (cy - hh - 22) + ' ' + cx + ' ' + (cy - hh - 16) + ' Q' + (cx + hw) + ' ' + (cy - hh - 22) + ' ' + (cx + hw + 4) + ' ' + (cy + 5) + 'Z" fill="' + hc + '"/>');

    // Ears
    var er = 5 * (f.ears || 1);
    if (!f.alien && !f.robot && !f.hood) {
      o.push('<ellipse cx="' + (cx - hw) + '" cy="' + (cy + 2) + '" rx="' + er * 0.8 + '" ry="' + er * 1.2 + '" fill="' + skinD + '"/>');
      o.push('<ellipse cx="' + (cx + hw) + '" cy="' + (cy + 2) + '" rx="' + er * 0.8 + '" ry="' + er * 1.2 + '" fill="' + skinD + '"/>');
    }

    // Head
    if (f.alien) {
      o.push('<path d="M' + (cx - hw - 4) + ' ' + (cy - 8) + ' Q' + cx + ' ' + (cy - hh - 22) + ' ' + (cx + hw + 4) + ' ' + (cy - 8) + ' Q' + (cx + hw) + ' ' + (cy + hh) + ' ' + cx + ' ' + (cy + hh + 2) + ' Q' + (cx - hw) + ' ' + (cy + hh) + ' ' + (cx - hw - 4) + ' ' + (cy - 8) + 'Z" fill="' + skin + '"/>');
    } else if (f.robot) {
      o.push('<rect x="' + (cx - hw) + '" y="' + (cy - hh) + '" width="' + hw * 2 + '" height="' + hh * 2 + '" rx="8" fill="' + skin + '" stroke="#7d8793" stroke-width="1.5"/>');
      o.push('<circle cx="' + (cx - hw + 4) + '" cy="' + (cy - hh + 5) + '" r="1.5" fill="#7d8793"/><circle cx="' + (cx + hw - 4) + '" cy="' + (cy - hh + 5) + '" r="1.5" fill="#7d8793"/>');
      o.push('<rect x="' + (cx - hw - 4) + '" y="' + (cy - 4) + '" width="4" height="10" fill="#7d8793"/><rect x="' + (cx + hw) + '" y="' + (cy - 4) + '" width="4" height="10" fill="#7d8793"/>');
    } else {
      var jw = hw * jaw;
      o.push('<path d="M' + (cx - hw) + ' ' + (cy - 6) + ' Q' + (cx - hw) + ' ' + (cy - hh) + ' ' + cx + ' ' + (cy - hh) + ' Q' + (cx + hw) + ' ' + (cy - hh) + ' ' + (cx + hw) + ' ' + (cy - 6) +
        ' Q' + (cx + jw) + ' ' + (cy + hh * 0.85) + ' ' + cx + ' ' + (cy + hh) + ' Q' + (cx - jw) + ' ' + (cy + hh * 0.85) + ' ' + (cx - hw) + ' ' + (cy - 6) + 'Z" fill="' + skin + '"/>');
      if (f.jowls) o.push('<path d="M' + (cx - hw + 2) + ' ' + (cy + 10) + ' Q' + (cx - hw - 2) + ' ' + (cy + hh) + ' ' + (cx - 8) + ' ' + (cy + hh - 2) + '" fill="' + skinD + '" opacity="0.6"/><path d="M' + (cx + hw - 2) + ' ' + (cy + 10) + ' Q' + (cx + hw + 2) + ' ' + (cy + hh) + ' ' + (cx + 8) + ' ' + (cy + hh - 2) + '" fill="' + skinD + '" opacity="0.6"/>');
      if (f.tan) o.push('<ellipse cx="' + cx + '" cy="' + (cy + 4) + '" rx="' + (hw - 7) + '" ry="' + (hh - 10) + '" fill="#e8a060" opacity="0.35"/>');
    }
    if (f.cheeks) o.push('<circle cx="' + (cx - hw + 7) + '" cy="' + (cy + 9) + '" r="4" fill="#ff8a8a" opacity="0.35"/><circle cx="' + (cx + hw - 7) + '" cy="' + (cy + 9) + '" r="4" fill="#ff8a8a" opacity="0.35"/>');

    // Front hair
    var top = cy - hh;
    switch (f.hair) {
      case 'wig': o.push('<path d="M' + (cx - hw) + ' ' + (cy - 6) + ' Q' + (cx - hw) + ' ' + (top - 4) + ' ' + cx + ' ' + (top - 5) + ' Q' + (cx + hw) + ' ' + (top - 4) + ' ' + (cx + hw) + ' ' + (cy - 6) + ' Q' + cx + ' ' + (top + 6) + ' ' + (cx - hw) + ' ' + (cy - 6) + 'Z" fill="' + hc + '"/>'); break;
      case 'short': o.push('<path d="M' + (cx - hw) + ' ' + (cy - 5) + ' Q' + (cx - hw - 1) + ' ' + (top - 5) + ' ' + cx + ' ' + (top - 4) + ' Q' + (cx + hw + 1) + ' ' + (top - 5) + ' ' + (cx + hw) + ' ' + (cy - 5) + ' L' + (cx + hw - 3) + ' ' + (top + 9) + ' Q' + cx + ' ' + (top + 5) + ' ' + (cx - hw + 3) + ' ' + (top + 9) + 'Z" fill="' + hc + '"/>'); break;
      case 'side': o.push('<path d="M' + (cx - hw) + ' ' + (cy - 3) + ' Q' + (cx - hw - 2) + ' ' + (top - 6) + ' ' + (cx + 4) + ' ' + (top - 5) + ' Q' + (cx + hw + 2) + ' ' + (top - 3) + ' ' + (cx + hw) + ' ' + (cy - 3) + ' L' + (cx + hw - 3) + ' ' + (top + 10) + ' Q' + (cx - 6) + ' ' + (top + 2) + ' ' + (cx - hw + 5) + ' ' + (top + 13) + 'Z" fill="' + hc + '"/><path d="M' + (cx - 8) + ' ' + (top - 3) + ' L' + (cx - 4) + ' ' + (top + 6) + '" stroke="' + shade(hc, 0.7) + '" stroke-width="1"/>'); break;
      case 'pomp': o.push('<path d="M' + (cx - hw) + ' ' + (cy - 4) + ' Q' + (cx - hw - 3) + ' ' + (top - 12) + ' ' + (cx + 2) + ' ' + (top - 10) + ' Q' + (cx + hw + 4) + ' ' + (top - 8) + ' ' + (cx + hw) + ' ' + (cy - 4) + ' L' + (cx + hw - 4) + ' ' + (top + 8) + ' Q' + cx + ' ' + (top + 1) + ' ' + (cx - hw + 4) + ' ' + (top + 9) + 'Z" fill="' + hc + '"/>'); break;
      case 'swoop': o.push('<path d="M' + (cx - hw - 2) + ' ' + (cy - 2) + ' Q' + (cx - hw - 6) + ' ' + (top - 12) + ' ' + (cx + 6) + ' ' + (top - 8) + ' Q' + (cx + hw + 12) + ' ' + (top - 4) + ' ' + (cx + hw + 4) + ' ' + (top + 12) + ' Q' + (cx + 2) + ' ' + (top + 2) + ' ' + (cx - hw + 2) + ' ' + (top + 14) + 'Z" fill="' + hc + '"/><path d="M' + (cx - hw) + ' ' + (top + 4) + ' Q' + cx + ' ' + (top - 6) + ' ' + (cx + hw + 6) + ' ' + (top + 6) + '" stroke="' + shade(hc, 0.8) + '" fill="none" stroke-width="1.2"/>'); break;
      case 'recede': o.push('<path d="M' + (cx - hw) + ' ' + (cy - 3) + ' Q' + (cx - hw) + ' ' + (top - 3) + ' ' + (cx - 10) + ' ' + (top + 2) + ' L' + (cx - hw + 3) + ' ' + (top + 14) + 'Z" fill="' + hc + '"/><path d="M' + (cx + hw) + ' ' + (cy - 3) + ' Q' + (cx + hw) + ' ' + (top - 3) + ' ' + (cx + 10) + ' ' + (top + 2) + ' L' + (cx + hw - 3) + ' ' + (top + 14) + 'Z" fill="' + hc + '"/><path d="M' + (cx - 6) + ' ' + (top + 1) + ' Q' + cx + ' ' + (top - 3) + ' ' + (cx + 6) + ' ' + (top + 1) + '" stroke="' + hc + '" stroke-width="2.5" fill="none"/>'); break;
      case 'bald': o.push('<path d="M' + (cx - hw) + ' ' + (cy - 2) + ' Q' + (cx - hw) + ' ' + (top + 6) + ' ' + (cx - hw + 5) + ' ' + (top + 12) + ' L' + (cx - hw + 2) + ' ' + (cy + 2) + 'Z" fill="' + hc + '"/><path d="M' + (cx + hw) + ' ' + (cy - 2) + ' Q' + (cx + hw) + ' ' + (top + 6) + ' ' + (cx + hw - 5) + ' ' + (top + 12) + ' L' + (cx + hw - 2) + ' ' + (cy + 2) + 'Z" fill="' + hc + '"/><ellipse cx="' + (cx - 6) + '" cy="' + (top + 6) + '" rx="6" ry="3" fill="#fff" opacity="0.35"/>'); break;
      case 'mop': o.push('<path d="M' + (cx - hw - 2) + ' ' + (cy) + ' Q' + (cx - hw - 6) + ' ' + (top - 8) + ' ' + cx + ' ' + (top - 6) + ' Q' + (cx + hw + 6) + ' ' + (top - 8) + ' ' + (cx + hw + 2) + ' ' + (cy) + ' L' + (cx + hw - 2) + ' ' + (top + 11) + ' L' + (cx + 8) + ' ' + (top + 6) + ' L' + cx + ' ' + (top + 11) + ' L' + (cx - 8) + ' ' + (top + 6) + ' L' + (cx - hw + 2) + ' ' + (top + 11) + 'Z" fill="' + hc + '"/>'); break;
      case 'white': o.push('<path d="M' + (cx - hw) + ' ' + (cy - 4) + ' Q' + (cx - hw - 2) + ' ' + (top - 5) + ' ' + cx + ' ' + (top - 4) + ' Q' + (cx + hw + 2) + ' ' + (top - 5) + ' ' + (cx + hw) + ' ' + (cy - 4) + ' Q' + (cx + hw - 6) + ' ' + (top + 4) + ' ' + cx + ' ' + (top + 5) + ' Q' + (cx - hw + 6) + ' ' + (top + 4) + ' ' + (cx - hw) + ' ' + (cy - 4) + 'Z" fill="' + hc + '"/>'); break;
      case 'buzz': o.push('<path d="M' + (cx - hw) + ' ' + (cy - 6) + ' Q' + (cx - hw) + ' ' + (top - 2) + ' ' + cx + ' ' + (top - 2) + ' Q' + (cx + hw) + ' ' + (top - 2) + ' ' + (cx + hw) + ' ' + (cy - 6) + ' Q' + cx + ' ' + (top + 7) + ' ' + (cx - hw) + ' ' + (cy - 6) + 'Z" fill="' + hc + '" opacity="0.9"/>'); break;
      case 'long': o.push('<path d="M' + (cx - hw) + ' ' + (cy - 4) + ' Q' + (cx - hw) + ' ' + (top - 4) + ' ' + cx + ' ' + (top - 4) + ' Q' + (cx + hw) + ' ' + (top - 4) + ' ' + (cx + hw) + ' ' + (cy - 4) + ' Q' + (cx + 8) + ' ' + (top + 2) + ' ' + cx + ' ' + (top + 8) + ' Q' + (cx - 8) + ' ' + (top + 2) + ' ' + (cx - hw) + ' ' + (cy - 4) + 'Z" fill="' + hc + '"/>'); break;
      case 'franklin': o.push('<ellipse cx="' + (cx - 6) + '" cy="' + (top + 6) + '" rx="6" ry="3" fill="#fff" opacity="0.35"/>'); break;
      case 'swept': o.push('<path d="M' + (cx - hw - 2) + ' ' + (cy + 2) + ' Q' + (cx - hw - 3) + ' ' + (top - 6) + ' ' + (cx + 2) + ' ' + (top - 5) + ' Q' + (cx + hw + 4) + ' ' + (top - 4) + ' ' + (cx + hw + 2) + ' ' + (cy + 2) + ' L' + (cx + hw - 3) + ' ' + (top + 8) + ' Q' + cx + ' ' + (top + 1) + ' ' + (cx - hw + 3) + ' ' + (top + 8) + 'Z" fill="' + hc + '"/><path d="M' + (cx - hw) + ' ' + (top + 2) + ' Q' + cx + ' ' + (top - 6) + ' ' + (cx + hw) + ' ' + (top + 2) + '" stroke="' + shade(hc, 0.8) + '" fill="none" stroke-width="1.2"/>'); break;
      case 'tall': o.push('<path d="M' + (cx - hw) + ' ' + (cy - 6) + ' Q' + (cx - 4) + ' ' + (top - 2) + ' ' + (cx + hw) + ' ' + (cy - 6) + ' Q' + cx + ' ' + (top - 8) + ' ' + (cx - hw) + ' ' + (cy - 6) + 'Z" fill="' + hc + '"/>'); break;
    }
    if (f.mutton) {
      var mb = f.muttonBig ? 1.5 : 1;
      o.push('<path d="M' + (cx - hw) + ' ' + (cy - 6) + ' Q' + (cx - hw - 3 * mb) + ' ' + (cy + 18 * mb) + ' ' + (cx - hw + 10) + ' ' + (cy + 16) + ' L' + (cx - hw + 6) + ' ' + (cy - 2) + 'Z" fill="' + hc + '"/><path d="M' + (cx + hw) + ' ' + (cy - 6) + ' Q' + (cx + hw + 3 * mb) + ' ' + (cy + 18 * mb) + ' ' + (cx + hw - 10) + ' ' + (cy + 16) + ' L' + (cx + hw - 6) + ' ' + (cy - 2) + 'Z" fill="' + hc + '"/>');
    }

    // Eyes & brows
    var ey = cy - 2;
    if (f.alien) {
      o.push('<ellipse cx="' + (cx - 10) + '" cy="' + ey + '" rx="7" ry="10" transform="rotate(-20 ' + (cx - 10) + ' ' + ey + ')" fill="#111"/><ellipse cx="' + (cx + 10) + '" cy="' + ey + '" rx="7" ry="10" transform="rotate(20 ' + (cx + 10) + ' ' + ey + ')" fill="#111"/>');
      o.push('<circle cx="' + (cx - 12) + '" cy="' + (ey - 4) + '" r="2" fill="#fff"/><circle cx="' + (cx + 8) + '" cy="' + (ey - 4) + '" r="2" fill="#fff"/>');
      if (f.eyes3) o.push('<ellipse cx="' + cx + '" cy="' + (ey - 16) + '" rx="4" ry="5" fill="#111"/><circle cx="' + (cx - 1) + '" cy="' + (ey - 18) + '" r="1.2" fill="#fff"/>');
      o.push('<path d="M' + (cx - 8) + ' ' + (top - 12) + ' Q' + (cx - 14) + ' ' + (top - 26) + ' ' + (cx - 18) + ' ' + (top - 28) + '" stroke="' + shade(skin, 0.7) + '" stroke-width="2" fill="none"/><circle cx="' + (cx - 18) + '" cy="' + (top - 28) + '" r="3" fill="#f5c518"/>');
      o.push('<path d="M' + (cx + 8) + ' ' + (top - 12) + ' Q' + (cx + 14) + ' ' + (top - 26) + ' ' + (cx + 18) + ' ' + (top - 28) + '" stroke="' + shade(skin, 0.7) + '" stroke-width="2" fill="none"/><circle cx="' + (cx + 18) + '" cy="' + (top - 28) + '" r="3" fill="#f5c518"/>');
    } else if (f.robot) {
      o.push('<rect x="' + (cx - 17) + '" y="' + (ey - 5) + '" width="34" height="9" rx="4" fill="#111"/><circle cx="' + (cx - 8) + '" cy="' + ey + '" r="3" fill="#ff3b3b" class="blink"/><circle cx="' + (cx + 8) + '" cy="' + ey + '" r="3" fill="#ff3b3b" class="blink"/>');
    } else if (f.screen) {
      o.push('<ellipse cx="50" cy="52" rx="20" ry="24" fill="#0b0f14"/><rect x="36" y="44" width="28" height="3" fill="#33ff66"/><circle cx="42" cy="50" r="2.5" fill="#33ff66" class="blink"/><circle cx="58" cy="50" r="2.5" fill="#33ff66" class="blink"/>');
    } else if (f.visor) {
      o.push('<rect x="' + (cx - hw + 2) + '" y="' + (ey - 6) + '" width="' + (hw * 2 - 4) + '" height="10" rx="5" fill="#35d0ff" opacity="0.85"/><rect x="' + (cx - hw + 5) + '" y="' + (ey - 4) + '" width="10" height="3" rx="1.5" fill="#fff" opacity="0.7"/>');
    } else {
      o.push('<ellipse cx="' + (cx - 9) + '" cy="' + ey + '" rx="3.8" ry="4.2" fill="#fff"/><ellipse cx="' + (cx + 9) + '" cy="' + ey + '" rx="3.8" ry="4.2" fill="#fff"/>');
      o.push('<circle cx="' + (cx - 8.4) + '" cy="' + (ey + 0.6) + '" r="2.2" fill="#222" class="pupil"/><circle cx="' + (cx + 9.6) + '" cy="' + (ey + 0.6) + '" r="2.2" fill="#222" class="pupil"/>');
      if (f.lashes) o.push('<path d="M' + (cx - 13) + ' ' + (ey - 4) + ' L' + (cx - 11) + ' ' + (ey - 2) + ' M' + (cx + 13) + ' ' + (ey - 4) + ' L' + (cx + 11) + ' ' + (ey - 2) + '" stroke="#222" stroke-width="1.2"/><circle cx="' + (cx - hw + 7) + '" cy="' + (cy + 9) + '" r="4" fill="#ff8a8a" opacity="0.35"/><circle cx="' + (cx + hw - 7) + '" cy="' + (cy + 9) + '" r="4" fill="#ff8a8a" opacity="0.35"/>');
      var bw = f.brows === 'heavy' ? 2.8 : 1.6, bcol = shade(f.hair === 'bald' || f.hair === 'wig' ? '#6b5a4a' : hc, 0.8);
      o.push('<path d="M' + (cx - 14) + ' ' + (ey - 7) + ' Q' + (cx - 9) + ' ' + (ey - 10) + ' ' + (cx - 4) + ' ' + (ey - 7) + '" stroke="' + bcol + '" stroke-width="' + bw + '" fill="none" stroke-linecap="round"/>');
      o.push('<path d="M' + (cx + 4) + ' ' + (ey - 7) + ' Q' + (cx + 9) + ' ' + (ey - 10) + ' ' + (cx + 14) + ' ' + (ey - 7) + '" stroke="' + bcol + '" stroke-width="' + bw + '" fill="none" stroke-linecap="round"/>');
    }
    if (f.antenna) o.push('<path d="M' + cx + ' ' + (top - 6) + ' L' + cx + ' ' + (top - 20) + '" stroke="#999" stroke-width="1.5"/><circle cx="' + cx + '" cy="' + (top - 21) + '" r="3" fill="#ff5fd2" class="blink"/>');

    // Glasses
    if (f.glasses === 'pince' || f.glasses === 'round') {
      var gr = f.glasses === 'round' ? 5.5 : 4.8;
      o.push('<circle cx="' + (cx - 9) + '" cy="' + ey + '" r="' + gr + '" fill="none" stroke="#222" stroke-width="1.2"/><circle cx="' + (cx + 9) + '" cy="' + ey + '" r="' + gr + '" fill="none" stroke="#222" stroke-width="1.2"/><path d="M' + (cx - 9 + gr) + ' ' + ey + ' L' + (cx + 9 - gr) + ' ' + ey + '" stroke="#222" stroke-width="1.2"/>');
    } else if (f.glasses === 'aviator') {
      o.push('<path d="M' + (cx - 16) + ' ' + (ey - 5) + ' L' + (cx - 2) + ' ' + (ey - 5) + ' Q' + (cx - 2) + ' ' + (ey + 7) + ' ' + (cx - 9) + ' ' + (ey + 6) + ' Q' + (cx - 16) + ' ' + (ey + 6) + ' ' + (cx - 16) + ' ' + (ey - 5) + 'Z" fill="#1a2b44" opacity="0.92"/>');
      o.push('<path d="M' + (cx + 16) + ' ' + (ey - 5) + ' L' + (cx + 2) + ' ' + (ey - 5) + ' Q' + (cx + 2) + ' ' + (ey + 7) + ' ' + (cx + 9) + ' ' + (ey + 6) + ' Q' + (cx + 16) + ' ' + (ey + 6) + ' ' + (cx + 16) + ' ' + (ey - 5) + 'Z" fill="#1a2b44" opacity="0.92"/><path d="M' + (cx - 2) + ' ' + (ey - 4) + ' L' + (cx + 2) + ' ' + (ey - 4) + '" stroke="#c8a82e" stroke-width="1"/>');
    }

    // Nose
    if (!f.alien && !f.robot && !f.screen) {
      var nz = f.nose || 1;
      o.push('<path d="M' + cx + ' ' + (ey + 2) + ' Q' + (cx + 5 * nz) + ' ' + (ey + 9 * nz) + ' ' + (cx + 1) + ' ' + (ey + 10 * nz) + ' Q' + (cx - 3) + ' ' + (ey + 10 * nz) + ' ' + (cx - 3) + ' ' + (ey + 8 * nz) + '" fill="' + skinD + '" stroke="' + shade(skin, 0.7) + '" stroke-width="0.8"/>');
    }

    // Mouth
    var my = cy + 15 * long;
    var mouth = opts.talking ? 'open' : f.mouth;
    switch (mouth) {
      case 'grin': o.push('<path d="M' + (cx - 9) + ' ' + my + ' Q' + cx + ' ' + (my + 9) + ' ' + (cx + 9) + ' ' + my + 'Z" fill="#7a1f1f"/><path d="M' + (cx - 8) + ' ' + (my + 0.5) + ' L' + (cx + 8) + ' ' + (my + 0.5) + ' L' + (cx + 6) + ' ' + (my + 3) + ' L' + (cx - 6) + ' ' + (my + 3) + 'Z" fill="#fff"/>'); break;
      case 'bigteeth': o.push('<path d="M' + (cx - 11) + ' ' + my + ' Q' + cx + ' ' + (my + 11) + ' ' + (cx + 11) + ' ' + my + 'Z" fill="#fff" stroke="#7a1f1f" stroke-width="1"/><path d="M' + (cx - 4) + ' ' + my + ' L' + (cx - 4) + ' ' + (my + 5) + ' M' + cx + ' ' + my + ' L' + cx + ' ' + (my + 6) + ' M' + (cx + 4) + ' ' + my + ' L' + (cx + 4) + ' ' + (my + 5) + '" stroke="#ddd" stroke-width="0.6"/>'); break;
      case 'smile': o.push('<path d="M' + (cx - 8) + ' ' + my + ' Q' + cx + ' ' + (my + 6) + ' ' + (cx + 8) + ' ' + my + '" stroke="#7a1f1f" stroke-width="2" fill="none" stroke-linecap="round"/>'); break;
      case 'tight': o.push('<path d="M' + (cx - 7) + ' ' + (my + 1) + ' Q' + cx + ' ' + (my + 3) + ' ' + (cx + 7) + ' ' + (my + 1) + '" stroke="#7a3a2a" stroke-width="2" fill="none" stroke-linecap="round"/>'); break;
      case 'smirk': o.push('<path d="M' + (cx - 7) + ' ' + (my + 2) + ' Q' + (cx + 1) + ' ' + (my + 4) + ' ' + (cx + 8) + ' ' + (my - 2) + '" stroke="#7a1f1f" stroke-width="2" fill="none" stroke-linecap="round"/>'); break;
      case 'pucker': o.push('<ellipse cx="' + cx + '" cy="' + (my + 1) + '" rx="4.5" ry="3" fill="#b5452a"/><ellipse cx="' + cx + '" cy="' + (my + 1) + '" rx="2" ry="1.2" fill="#5a1a10"/>'); break;
      case 'open': o.push('<ellipse cx="' + cx + '" cy="' + (my + 2) + '" rx="6" ry="5" fill="#5a1010" class="mouth-talk"/><path d="M' + (cx - 5) + ' ' + (my - 1) + ' L' + (cx + 5) + ' ' + (my - 1) + '" stroke="#fff" stroke-width="1.5"/>'); break;
      case 'robot': o.push('<rect x="' + (cx - 9) + '" y="' + my + '" width="18" height="5" fill="#222"/><path d="M' + (cx - 5) + ' ' + my + ' V' + (my + 5) + ' M' + cx + ' ' + my + ' V' + (my + 5) + ' M' + (cx + 5) + ' ' + my + ' V' + (my + 5) + '" stroke="#555" stroke-width="1"/>'); break;
    }

    // Facial hair
    if (f.stache === 'walrus') o.push('<path d="M' + (cx - 12) + ' ' + (my + 1) + ' Q' + (cx - 6) + ' ' + (my - 8) + ' ' + cx + ' ' + (my - 4) + ' Q' + (cx + 6) + ' ' + (my - 8) + ' ' + (cx + 12) + ' ' + (my + 1) + ' Q' + cx + ' ' + (my - 1) + ' ' + (cx - 12) + ' ' + (my + 1) + 'Z" fill="' + hc + '"/>');
    if (f.stache === 'handlebar') o.push('<path d="M' + cx + ' ' + (my - 3) + ' Q' + (cx - 8) + ' ' + (my - 7) + ' ' + (cx - 14) + ' ' + (my - 1) + ' Q' + (cx - 16) + ' ' + (my - 6) + ' ' + (cx - 12) + ' ' + (my - 6) + ' M' + cx + ' ' + (my - 3) + ' Q' + (cx + 8) + ' ' + (my - 7) + ' ' + (cx + 14) + ' ' + (my - 1) + ' Q' + (cx + 16) + ' ' + (my - 6) + ' ' + (cx + 12) + ' ' + (my - 6) + '" stroke="' + hc + '" stroke-width="3" fill="none" stroke-linecap="round"/>');
    if (f.beard === 'chin') o.push('<path d="M' + (cx - hw + 2) + ' ' + (cy + 4) + ' Q' + (cx - hw + 2) + ' ' + (cy + hh + 8) + ' ' + cx + ' ' + (cy + hh + 9) + ' Q' + (cx + hw - 2) + ' ' + (cy + hh + 8) + ' ' + (cx + hw - 2) + ' ' + (cy + 4) + ' Q' + (cx + hw - 6) + ' ' + (cy + hh) + ' ' + cx + ' ' + (my + 6) + ' Q' + (cx - hw + 6) + ' ' + (cy + hh) + ' ' + (cx - hw + 2) + ' ' + (cy + 4) + 'Z" fill="' + bc + '"/>');
    if (f.beard === 'full') o.push('<path d="M' + (cx - hw) + ' ' + (cy) + ' Q' + (cx - hw) + ' ' + (cy + hh + 6) + ' ' + cx + ' ' + (cy + hh + 6) + ' Q' + (cx + hw) + ' ' + (cy + hh + 6) + ' ' + (cx + hw) + ' ' + cy + ' Q' + (cx + 10) + ' ' + (my - 6) + ' ' + cx + ' ' + (my - 4) + ' Q' + (cx - 10) + ' ' + (my - 6) + ' ' + (cx - hw) + ' ' + cy + 'Z" fill="' + bc + '"/><path d="M' + (cx - 5) + ' ' + (my + 1) + ' L' + (cx + 5) + ' ' + (my + 1) + '" stroke="#5a1a10" stroke-width="1.5"/>');
    if (f.beard === 'long') o.push('<path d="M' + (cx - hw) + ' ' + cy + ' Q' + (cx - hw + 2) + ' ' + (cy + hh + 22) + ' ' + cx + ' ' + (cy + hh + 26) + ' Q' + (cx + hw - 2) + ' ' + (cy + hh + 22) + ' ' + (cx + hw) + ' ' + cy + ' Q' + (cx + 10) + ' ' + (my - 6) + ' ' + cx + ' ' + (my - 4) + ' Q' + (cx - 10) + ' ' + (my - 6) + ' ' + (cx - hw) + ' ' + cy + 'Z" fill="' + bc + '"/>');
    if (f.beard === 'goat') o.push('<path d="M' + (cx - 6) + ' ' + (my + 5) + ' Q' + cx + ' ' + (my + 22) + ' ' + (cx + 6) + ' ' + (my + 5) + 'Z" fill="' + bc + '"/>');
    if (f.cig) o.push('<rect x="' + (cx + 8) + '" y="' + (my + 1) + '" width="14" height="2" fill="#222" transform="rotate(-18 ' + (cx + 8) + ' ' + my + ')"/><circle cx="' + (cx + 22) + '" cy="' + (my - 4) + '" r="1.5" fill="#ff8c1a"/>');
    if (f.barcode) for (s = 0; s < 7; s++) o.push('<rect x="' + (cx - 7 + s * 2) + '" y="' + (top + 8) + '" width="' + (s % 2 ? 0.8 : 1.4) + '" height="5" fill="#222"/>');

    // Hats
    if (f.hat === 'tophat') {
      o.push('<rect x="' + (cx - hw - 4) + '" y="' + (top - 1) + '" width="' + (hw * 2 + 8) + '" height="5" rx="2" fill="#111"/><rect x="' + (cx - hw + 5) + '" y="' + (top - 30) + '" width="' + (hw * 2 - 10) + '" height="30" fill="#111"/><rect x="' + (cx - hw + 5) + '" y="' + (top - 7) + '" width="' + (hw * 2 - 10) + '" height="4" fill="#444"/>');
    } else if (f.hat === 'samhat') {
      o.push('<rect x="' + (cx - hw - 5) + '" y="' + (top - 1) + '" width="' + (hw * 2 + 10) + '" height="5" rx="2" fill="#1f3a93"/><rect x="' + (cx - hw + 4) + '" y="' + (top - 32) + '" width="' + (hw * 2 - 8) + '" height="32" fill="#fff"/>');
      for (s = 0; s < 3; s++) o.push('<rect x="' + (cx - hw + 4 + s * (hw * 2 - 8) / 3 + 3) + '" y="' + (top - 32) + '" width="' + ((hw * 2 - 8) / 6) + '" height="24" fill="#c8102e"/>');
      o.push('<rect x="' + (cx - hw + 4) + '" y="' + (top - 9) + '" width="' + (hw * 2 - 8) + '" height="7" fill="#1f3a93"/>' + star(cx, top - 5.5, 3, '#fff'));
    } else if (f.hat === 'cowboy') {
      o.push('<ellipse cx="' + cx + '" cy="' + (top + 2) + '" rx="' + (hw + 14) + '" ry="6" fill="#8a5a2b"/><path d="M' + (cx - hw + 3) + ' ' + (top + 2) + ' Q' + (cx - hw + 1) + ' ' + (top - 18) + ' ' + cx + ' ' + (top - 14) + ' Q' + (cx + hw - 1) + ' ' + (top - 18) + ' ' + (cx + hw - 3) + ' ' + (top + 2) + 'Z" fill="#a0692f"/><rect x="' + (cx - hw + 3) + '" y="' + (top - 3) + '" width="' + (hw * 2 - 6) + '" height="3" fill="#5a3a1a"/>');
    }
    if (f.hat === 'tricorn') {
      o.push('<path d="M' + (cx - hw - 10) + ' ' + (top + 4) + ' Q' + cx + ' ' + (top - 26) + ' ' + (cx + hw + 10) + ' ' + (top + 4) + ' Q' + cx + ' ' + (top - 4) + ' ' + (cx - hw - 10) + ' ' + (top + 4) + 'Z" fill="#1a1a1a"/><path d="M' + (cx - hw - 10) + ' ' + (top + 4) + ' Q' + cx + ' ' + (top - 4) + ' ' + (cx + hw + 10) + ' ' + (top + 4) + '" stroke="' + '#f5c518' + '" stroke-width="1.5" fill="none"/>');
    } else if (f.hat === 'bandcap') {
      o.push('<rect x="' + (cx - hw + 1) + '" y="' + (top - 14) + '" width="' + (hw * 2 - 2) + '" height="16" rx="3" fill="#1f3a93"/><rect x="' + (cx - hw + 1) + '" y="' + (top - 2) + '" width="' + (hw * 2 - 2) + '" height="4" fill="#f5c518"/><path d="M' + (cx - hw) + ' ' + (top + 2) + ' Q' + cx + ' ' + (top + 10) + ' ' + (cx + hw) + ' ' + (top + 2) + 'Z" fill="#111"/>' + star(cx, top - 7, 4, '#f5c518'));
    } else if (f.hat === 'bonnet') {
      o.push('<path d="M' + (cx - hw - 6) + ' ' + (cy - 2) + ' Q' + (cx - hw - 6) + ' ' + (top - 12) + ' ' + cx + ' ' + (top - 12) + ' Q' + (cx + hw + 6) + ' ' + (top - 12) + ' ' + (cx + hw + 6) + ' ' + (cy - 2) + ' Q' + cx + ' ' + (top + 4) + ' ' + (cx - hw - 6) + ' ' + (cy - 2) + 'Z" fill="#fff" stroke="#ddd" stroke-width="1"/><path d="M' + (cx - hw - 4) + ' ' + (cy - 4) + ' Q' + cx + ' ' + (top + 2) + ' ' + (cx + hw + 4) + ' ' + (cy - 4) + '" stroke="#c8102e" stroke-width="2" fill="none"/>');
    } else if (f.hat === 'crown') {
      var cr = '';
      for (var sp = 0; sp < 7; sp++) { var ax = cx - hw + 2 + sp * (hw * 2 - 4) / 6; cr += '<path d="M' + (ax - 3) + ' ' + (top + 2) + ' L' + ax + ' ' + (top - 16 + Math.abs(sp - 3) * 2) + ' L' + (ax + 3) + ' ' + (top + 2) + 'Z" fill="' + (f.gold ? '#f5c518' : '#5fb898') + '" stroke="' + (f.gold ? '#a67c00' : '#3f8f70') + '" stroke-width="0.8"/>'; }
      o.push(cr + '<rect x="' + (cx - hw) + '" y="' + (top - 1) + '" width="' + hw * 2 + '" height="6" rx="2" fill="' + (f.gold ? '#ffd84a' : '#6ac4a0') + '" stroke="' + (f.gold ? '#a67c00' : '#3f8f70') + '" stroke-width="0.8"/>');
    }
    // Event hats (rotating-event managers)
    var hl = cx - hw, hr2 = cx + hw, acc = f.suit;
    if (f.hat === 'cap') {
      o.push('<path d="M' + (hl + 1) + ' ' + (top + 4) + ' Q' + (hl + 1) + ' ' + (top - 14) + ' ' + cx + ' ' + (top - 14) + ' Q' + (hr2 - 1) + ' ' + (top - 14) + ' ' + (hr2 - 1) + ' ' + (top + 4) + 'Z" fill="' + shade(acc, 1.15) + '"/><path d="M' + (cx - 4) + ' ' + (top + 3) + ' Q' + (hr2 + 14) + ' ' + (top - 2) + ' ' + (hr2 + 16) + ' ' + (top + 6) + ' Q' + (hr2 + 4) + ' ' + (top + 8) + ' ' + (cx - 4) + ' ' + (top + 6) + 'Z" fill="' + shade(acc, 0.75) + '"/><circle cx="' + cx + '" cy="' + (top - 13) + '" r="2" fill="' + shade(acc, 0.6) + '"/>');
    } else if (f.hat === 'chef') {
      o.push('<rect x="' + (hl + 3) + '" y="' + (top - 8) + '" width="' + (hw * 2 - 6) + '" height="11" fill="#fff" stroke="#ddd" stroke-width="0.8"/><circle cx="' + (cx - 10) + '" cy="' + (top - 14) + '" r="10" fill="#fff"/><circle cx="' + (cx + 10) + '" cy="' + (top - 14) + '" r="10" fill="#fff"/><circle cx="' + cx + '" cy="' + (top - 22) + '" r="11" fill="#fff"/>');
    } else if (f.hat === 'beanie') {
      o.push('<path d="M' + (hl) + ' ' + (top + 6) + ' Q' + (hl) + ' ' + (top - 16) + ' ' + cx + ' ' + (top - 16) + ' Q' + (hr2) + ' ' + (top - 16) + ' ' + (hr2) + ' ' + (top + 6) + 'Z" fill="' + shade(acc, 1.1) + '"/><rect x="' + (hl - 1) + '" y="' + (top) + '" width="' + (hw * 2 + 2) + '" height="7" rx="3" fill="' + shade(acc, 0.8) + '"/><circle cx="' + cx + '" cy="' + (top - 17) + '" r="4.5" fill="#fff"/>');
    } else if (f.hat === 'pith') {
      o.push('<ellipse cx="' + cx + '" cy="' + (top + 3) + '" rx="' + (hw + 10) + '" ry="5" fill="#c9b68a"/><path d="M' + (hl + 2) + ' ' + (top + 3) + ' Q' + (hl + 2) + ' ' + (top - 18) + ' ' + cx + ' ' + (top - 18) + ' Q' + (hr2 - 2) + ' ' + (top - 18) + ' ' + (hr2 - 2) + ' ' + (top + 3) + 'Z" fill="#e0cf9f"/><rect x="' + (hl + 2) + '" y="' + (top - 2) + '" width="' + (hw * 2 - 4) + '" height="3" fill="#8a6a3a"/>');
    } else if (f.hat === 'hardhat') {
      o.push('<path d="M' + (hl) + ' ' + (top + 3) + ' Q' + (hl) + ' ' + (top - 17) + ' ' + cx + ' ' + (top - 17) + ' Q' + (hr2) + ' ' + (top - 17) + ' ' + (hr2) + ' ' + (top + 3) + 'Z" fill="#f5c518"/><rect x="' + (hl - 5) + '" y="' + (top + 1) + '" width="' + (hw * 2 + 10) + '" height="4" rx="2" fill="#e0a800"/><rect x="' + (cx - 2) + '" y="' + (top - 17) + '" width="4" height="18" fill="#e0a800"/>');
    } else if (f.hat === 'wizard') {
      o.push('<path d="M' + (hl - 6) + ' ' + (top + 4) + ' L' + (cx + 6) + ' ' + (top - 36) + ' L' + (hr2 + 6) + ' ' + (top + 4) + 'Z" fill="' + shade(acc, 0.7) + '"/><ellipse cx="' + cx + '" cy="' + (top + 4) + '" rx="' + (hw + 10) + '" ry="4" fill="' + shade(acc, 0.55) + '"/>' + star(cx + 1, top - 12, 4, '#f5c518') + star(cx - 7, top - 3, 2.5, '#fff'));
    } else if (f.hat === 'bandana') {
      o.push('<path d="M' + (hl - 1) + ' ' + (top + 6) + ' Q' + (hl) + ' ' + (top - 12) + ' ' + cx + ' ' + (top - 12) + ' Q' + (hr2) + ' ' + (top - 12) + ' ' + (hr2 + 1) + ' ' + (top + 6) + 'Z" fill="#c8102e"/><path d="M' + (hr2) + ' ' + (top + 2) + ' L' + (hr2 + 10) + ' ' + (top + 10) + ' L' + (hr2 + 4) + ' ' + (top + 12) + 'Z" fill="#a50d26"/><circle cx="' + (cx - 8) + '" cy="' + (top - 4) + '" r="1.4" fill="#fff"/><circle cx="' + (cx + 6) + '" cy="' + (top - 7) + '" r="1.4" fill="#fff"/><circle cx="' + (cx + 2) + '" cy="' + (top + 1) + '" r="1.4" fill="#fff"/>');
    } else if (f.hat === 'helm') {
      o.push('<path d="M' + (hl - 4) + ' ' + (cy + 4) + ' Q' + (hl - 5) + ' ' + (top - 16) + ' ' + cx + ' ' + (top - 16) + ' Q' + (hr2 + 5) + ' ' + (top - 16) + ' ' + (hr2 + 4) + ' ' + (cy + 4) + ' L' + (hr2 - 2) + ' ' + (cy + 4) + ' L' + (hr2 - 2) + ' ' + (top + 8) + ' L' + (hl + 2) + ' ' + (top + 8) + ' L' + (hl + 2) + ' ' + (cy + 4) + 'Z" fill="' + shade(acc, 0.85) + '" stroke="' + shade(acc, 0.55) + '" stroke-width="1"/><rect x="' + (cx - 3) + '" y="' + (top - 16) + '" width="6" height="24" fill="#fff" opacity="0.8"/>');
    } else if (f.hat === 'headband') {
      o.push('<rect x="' + (hl - 1) + '" y="' + (top + 2) + '" width="' + (hw * 2 + 2) + '" height="6" rx="2" fill="' + shade(acc, 1.2) + '"/><rect x="' + (hl - 1) + '" y="' + (top + 4) + '" width="' + (hw * 2 + 2) + '" height="1.6" fill="#fff"/>');
    } else if (f.hat === 'flower') {
      var fcol = ['#ff5fa2', '#f5c518', '#ff8a3a', '#b69cff'];
      for (sp = 0; sp < 5; sp++) o.push('<circle cx="' + (hl + 4 + sp * (hw * 2 - 8) / 4) + '" cy="' + (top + 2 - (sp % 2) * 3) + '" r="4.2" fill="' + fcol[sp % 4] + '"/><circle cx="' + (hl + 4 + sp * (hw * 2 - 8) / 4) + '" cy="' + (top + 2 - (sp % 2) * 3) + '" r="1.5" fill="#fff6c4"/>');
    } else if (f.hat === 'headset') {
      o.push('<path d="M' + (hl - 2) + ' ' + (cy - 2) + ' Q' + (hl - 2) + ' ' + (top - 12) + ' ' + cx + ' ' + (top - 12) + ' Q' + (hr2 + 2) + ' ' + (top - 12) + ' ' + (hr2 + 2) + ' ' + (cy - 2) + '" stroke="#222" stroke-width="3.5" fill="none"/><rect x="' + (hl - 7) + '" y="' + (cy - 8) + '" width="8" height="13" rx="3" fill="#333"/><rect x="' + (hr2 - 1) + '" y="' + (cy - 8) + '" width="8" height="13" rx="3" fill="#333"/><path d="M' + (hl - 3) + ' ' + (cy + 4) + ' Q' + (hl) + ' ' + (cy + 16) + ' ' + (cx - 8) + ' ' + (cy + 15) + '" stroke="#333" stroke-width="2" fill="none"/><circle cx="' + (cx - 8) + '" cy="' + (cy + 15) + '" r="2.5" fill="#333"/>');
    } else if (f.hat === 'santa') {
      o.push('<path d="M' + (hl) + ' ' + (top + 4) + ' Q' + (cx - 4) + ' ' + (top - 30) + ' ' + (hr2 + 12) + ' ' + (top - 8) + ' L' + (hr2) + ' ' + (top + 4) + 'Z" fill="#c8102e"/><rect x="' + (hl - 3) + '" y="' + (top) + '" width="' + (hw * 2 + 6) + '" height="7" rx="3.5" fill="#fff"/><circle cx="' + (hr2 + 12) + '" cy="' + (top - 8) + '" r="4.5" fill="#fff"/>');
    } else if (f.hat === 'witch') {
      o.push('<ellipse cx="' + cx + '" cy="' + (top + 4) + '" rx="' + (hw + 14) + '" ry="5" fill="#1a1024"/><path d="M' + (hl + 3) + ' ' + (top + 4) + ' L' + (cx + 10) + ' ' + (top - 34) + ' L' + (hr2 - 3) + ' ' + (top + 4) + 'Z" fill="#241533"/><rect x="' + (hl + 4) + '" y="' + (top - 3) + '" width="' + (hw * 2 - 8) + '" height="4" fill="#ff7a1a"/>');
    } else if (f.hat === 'pilgrim') {
      o.push('<rect x="' + (hl - 5) + '" y="' + (top) + '" width="' + (hw * 2 + 10) + '" height="5" rx="2" fill="#1a1a1a"/><path d="M' + (hl + 4) + ' ' + (top) + ' L' + (hl + 7) + ' ' + (top - 24) + ' L' + (hr2 - 7) + ' ' + (top - 24) + ' L' + (hr2 - 4) + ' ' + (top) + 'Z" fill="#1a1a1a"/><rect x="' + (hl + 5) + '" y="' + (top - 7) + '" width="' + (hw * 2 - 10) + '" height="4" fill="#4a3a2a"/><rect x="' + (cx - 4) + '" y="' + (top - 8) + '" width="8" height="6" fill="none" stroke="#d4af37" stroke-width="1.6"/>');
    } else if (f.hat === 'partyhat') {
      o.push('<path d="M' + (cx - 11) + ' ' + (top + 3) + ' L' + cx + ' ' + (top - 26) + ' L' + (cx + 11) + ' ' + (top + 3) + 'Z" fill="' + shade(acc, 1.2) + '"/><path d="M' + (cx - 7) + ' ' + (top - 6) + ' L' + (cx + 7) + ' ' + (top - 6) + ' M' + (cx - 4) + ' ' + (top - 15) + ' L' + (cx + 4) + ' ' + (top - 15) + '" stroke="#fff" stroke-width="2.4"/><circle cx="' + cx + '" cy="' + (top - 27) + '" r="3.5" fill="#f5c518"/>');
    } else if (f.hat === 'bunny') {
      o.push('<ellipse cx="' + (cx - 9) + '" cy="' + (top - 16) + '" rx="5.5" ry="16" fill="#fff" stroke="#ddd" stroke-width="0.8" transform="rotate(-10 ' + (cx - 9) + ' ' + (top - 16) + ')"/><ellipse cx="' + (cx + 9) + '" cy="' + (top - 16) + '" rx="5.5" ry="16" fill="#fff" stroke="#ddd" stroke-width="0.8" transform="rotate(10 ' + (cx + 9) + ' ' + (top - 16) + ')"/><ellipse cx="' + (cx - 9) + '" cy="' + (top - 16) + '" rx="2.4" ry="11" fill="#ffc4d8" transform="rotate(-10 ' + (cx - 9) + ' ' + (top - 16) + ')"/><ellipse cx="' + (cx + 9) + '" cy="' + (top - 16) + '" rx="2.4" ry="11" fill="#ffc4d8" transform="rotate(10 ' + (cx + 9) + ' ' + (top - 16) + ')"/><rect x="' + (hl + 2) + '" y="' + (top + 1) + '" width="' + (hw * 2 - 4) + '" height="4" rx="2" fill="#ff9ec4"/>');
    }
    // Cosmetic "looks" (applied to every portrait when equipped)
    var look = opts.look != null ? opts.look : root.Portraits.look;
    if (look === 'look_shades') {
      o.push('<path d="M' + (cx - 17) + ' ' + (ey - 5) + ' L' + (cx - 2) + ' ' + (ey - 5) + ' Q' + (cx - 2) + ' ' + (ey + 7) + ' ' + (cx - 9) + ' ' + (ey + 7) + ' Q' + (cx - 17) + ' ' + (ey + 7) + ' ' + (cx - 17) + ' ' + (ey - 5) + 'Z" fill="#111"/>' +
        '<path d="M' + (cx + 17) + ' ' + (ey - 5) + ' L' + (cx + 2) + ' ' + (ey - 5) + ' Q' + (cx + 2) + ' ' + (ey + 7) + ' ' + (cx + 9) + ' ' + (ey + 7) + ' Q' + (cx + 17) + ' ' + (ey + 7) + ' ' + (cx + 17) + ' ' + (ey - 5) + 'Z" fill="#111"/>' +
        '<path d="M' + (cx - 2) + ' ' + (ey - 4) + ' L' + (cx + 2) + ' ' + (ey - 4) + '" stroke="#111" stroke-width="1.5"/><path d="M' + (cx - 14) + ' ' + (ey - 3) + ' L' + (cx - 8) + ' ' + (ey - 3) + '" stroke="#fff" stroke-width="1.2" opacity="0.6"/>');
    } else if (look === 'look_party') {
      var px = cx + hw * 0.35, py = f.hat ? top - 26 : top + 2;
      o.push('<g transform="rotate(18 ' + px + ' ' + py + ')"><path d="M' + (px - 9) + ' ' + py + ' L' + px + ' ' + (py - 26) + ' L' + (px + 9) + ' ' + py + 'Z" fill="#ff3fa4"/>' +
        '<path d="M' + (px - 6) + ' ' + (py - 8) + ' L' + (px + 6) + ' ' + (py - 8) + ' M' + (px - 3) + ' ' + (py - 17) + ' L' + (px + 3) + ' ' + (py - 17) + '" stroke="#f5c518" stroke-width="2.5"/><circle cx="' + px + '" cy="' + (py - 27) + '" r="3.5" fill="#27e0ff"/></g>');
    } else if (look === 'look_helmet' || look === 'look_helmet_gold') {
      var gold = look === 'look_helmet_gold', hr = Math.max(hw, hh) + 13;
      o.push('<circle cx="' + cx + '" cy="' + (cy - 3) + '" r="' + hr + '" fill="' + (gold ? 'rgba(255,215,90,0.22)' : 'rgba(190,225,255,0.2)') + '" stroke="' + (gold ? '#f5c518' : '#e8f4ff') + '" stroke-width="2.5"/>' +
        '<path d="M' + (cx - hr * 0.55) + ' ' + (cy - hr * 0.62) + ' Q' + (cx - hr * 0.2) + ' ' + (cy - hr * 0.9) + ' ' + (cx + hr * 0.15) + ' ' + (cy - hr * 0.85) + '" stroke="#fff" stroke-width="3" fill="none" opacity="0.7" stroke-linecap="round"/>' +
        '<rect x="' + (cx - hr * 0.8) + '" y="' + (cy + hr - 10) + '" width="' + hr * 1.6 + '" height="8" rx="4" fill="' + (gold ? '#c99a00' : '#b8c0cc') + '"/>');
    }
    if (f.point) o.push('<path d="M70 100 L72 70 Q74 62 78 66 L80 72 L84 70 L84 100Z" fill="' + SKIN.a + '" stroke="#c8a080" stroke-width="0.8"/><rect x="66" y="88" width="22" height="12" fill="' + f.suit + '"/>');

    o.push('</g></g><circle cx="50" cy="50" r="48.5" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>' +
      (f.prop ? '<circle cx="82" cy="82" r="14" fill="#fff" stroke="rgba(0,0,0,0.25)" stroke-width="1"/><text x="82" y="88.5" font-size="17" text-anchor="middle">' + f.prop + '</text>' : '') + '</svg>');
    return o.join('');
  }

  function star(x, y, r, color) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      pts.push((x + rr * Math.cos(a)).toFixed(2) + ',' + (y + rr * Math.sin(a)).toFixed(2));
    }
    return '<polygon points="' + pts.join(' ') + '" fill="' + color + '"/>';
  }

  // Generated faces for rotating-event managers (js/events-data.js).
  if (root.GameData && root.GameData.EVENT_FACES) Object.keys(root.GameData.EVENT_FACES).forEach(function (k) { FACES[k] = root.GameData.EVENT_FACES[k]; });

  root.Portraits = { portrait: portrait, FACES: FACES, star: star, look: '' };
})(typeof window !== 'undefined' ? window : globalThis);
