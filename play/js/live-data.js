/* Live-ops content: Liberty Pass, limited-time offers, extra ad placements, cosmetics,
 * the weekly Space Race, Executive Orders and the Presidential Library.
 * Extends GameData; logic lives in live.js. */
(function (root) {
  'use strict';
  var D = root.GameData;
  var PREFIX = 'com.aarondavidrogers.starspangledtycoon.';

  // ---------- Liberty Pass (28-day seasons) ----------
  // Seasons are anchored to a fixed Monday so every player shares the same calendar.
  var SEASON = { epoch: [2026, 0, 5], days: 28, tiers: 30, xpPerTier: 450, bonusXp: 1000, bonusLb: 10 };
  var SEASON_NAMES = [
    { name: 'Season of Liberty', exclusive: 'frame_liberty' },
    { name: 'Moonshot Season', exclusive: 'look_helmet_gold' },
    { name: 'Galactic Frontier Season', exclusive: 'theme_frontier' },
    { name: 'Founders\' Season', exclusive: 'frame_founders' }
  ];
  // Pass XP per game action.
  var XP = {
    daily: 100, mission: 40, speech: 25, catch: 10, mechanic: 15, election: 80, launch: 200, convention: 300,
    achievement: 5, eventTier: 60, order: 50, hire: 10, upgrade: 2, donation: 20
  };
  // Reward tracks are generated so they're easy to rebalance.
  function passTrack(tier, premium) {
    var t = tier + 1;
    if (!premium) {
      if (t % 5 === 0) return { card: 1 };
      if (t % 5 === 2) return { speech: 2 };
      if (t % 5 === 4) return { warp: 3600 };
      return { lb: 5 + Math.floor(t / 6) * 2 };
    }
    if (t === 30) return { cosmetic: 'season', lb: 100 };
    if (t === 10) return { cosmetic: 'look_shades', lb: 30 };
    if (t === 20) return { cosmetic: 'frame_stars', lb: 40 };
    if (t % 5 === 3) return { rally: 900 };
    if (t % 5 === 1) return { warp: 4 * 3600 };
    return { lb: 20 + Math.floor(t / 5) * 5 };
  }

  // ---------- Limited-time offers (each shown once; one-time purchase while active) ----------
  var OFFERS = [
    { id: 'starter', product: PREFIX + 'offer_starter', name: 'Starter Pack', icon: '🎁', hours: 48, lb: 500, cosmetic: 'theme_patriot', price: 1.99 },
    { id: 'moon', product: PREFIX + 'offer_moon', name: 'Moonshot Bundle', icon: '🌕', hours: 24, lb: 1200, cosmetic: 'frame_apollo', price: 4.99 },
    { id: 'galaxy', product: PREFIX + 'offer_galaxy', name: 'Galactic Bundle', icon: '🌌', hours: 24, lb: 3000, cosmetic: 'theme_nebula', price: 9.99 },
    { id: 'comeback', product: PREFIX + 'offer_comeback', name: 'Welcome Back Bundle', icon: '🎉', hours: 24, lb: 600, price: 2.99, repeatDays: 30 }
  ];
  var BASE_VALUE = 100 / 0.99; // Liberty Bucks per dollar in the smallest pack
  var OFFER_GAP_H = 24;         // minimum hours between two milestone offers

  // Extra rewarded-ad placements (per-day caps). Founding Pack owners get them without ads.
  var AD_EXTRA = {
    donation: { perDay: 3, cooldownH: 4, warp: 1800, lb: 3 },
    missionDouble: { perDay: 5 },
    dailyDouble: { perDay: 1 },
    reroll: { perDay: 1 }
  };

  // ---------- Cosmetics (purely visual; never affect profit) ----------
  var COSMETICS = [
    { id: 'theme_classic', kind: 'theme', name: 'Classic Glory', cost: 0, swatch: ['#1f3a93', '#c8102e', '#f5c518'] },
    { id: 'theme_parchment', kind: 'theme', name: 'Declaration Parchment', cost: 250, swatch: ['#6b4a2b', '#e9d8b0', '#8f0b21'] },
    { id: 'theme_gilded', kind: 'theme', name: 'Gilded Age', cost: 300, swatch: ['#16120a', '#d4af37', '#fff3c4'] },
    { id: 'theme_apollo', kind: 'theme', name: 'Apollo White', cost: 300, swatch: ['#e9edf3', '#1b2a4a', '#c8102e'] },
    { id: 'theme_synth', kind: 'theme', name: 'Synthwave Senate', cost: 400, swatch: ['#2a0b4a', '#ff3fa4', '#27e0ff'] },
    { id: 'theme_patriot', kind: 'theme', name: 'Patriot Blue', exclusive: 'Starter Pack', swatch: ['#0a2a6b', '#ffffff', '#e8323c'] },
    { id: 'theme_nebula', kind: 'theme', name: 'Nebula', exclusive: 'Galactic Bundle', swatch: ['#1a0f3a', '#b69cff', '#5ef0c8'] },
    { id: 'theme_frontier', kind: 'theme', name: 'Galactic Frontier', exclusive: 'Liberty Pass', swatch: ['#06231f', '#3fe0a0', '#f5c518'] },
    { id: 'frame_laurel', kind: 'frame', name: 'Laurel Wreath', cost: 200 },
    { id: 'frame_stars', kind: 'frame', name: 'Star-Spangled Ring', cost: 250 },
    { id: 'frame_holo', kind: 'frame', name: 'Hologram', cost: 400 },
    { id: 'frame_apollo', kind: 'frame', name: 'Apollo Silver', exclusive: 'Moonshot Bundle' },
    { id: 'frame_liberty', kind: 'frame', name: 'Liberty Torch', exclusive: 'Liberty Pass' },
    { id: 'frame_founders', kind: 'frame', name: 'Founders\' Seal', exclusive: 'Liberty Pass' },
    { id: 'look_shades', kind: 'look', name: 'Aviator Shades', cost: 150 },
    { id: 'look_party', kind: 'look', name: 'Party Hats', cost: 150 },
    { id: 'look_helmet', kind: 'look', name: 'Space Helmets', cost: 300 },
    { id: 'look_helmet_gold', kind: 'look', name: 'Golden Helmets', exclusive: 'Liberty Pass' }
  ];
  // Event themes: earned by reaching an event's final reward tier. Colors come from the event itself.
  (D.EVENTS || []).forEach(function (e) {
    var c = root.EVENT_CONTENT && root.EVENT_CONTENT.filter(function (x) { return x.id === e.eventId; })[0];
    var bg = c ? c.bg : ['#0b1433', '#1f3a93', '#c8102e'];
    COSMETICS.push({ id: 'theme_ev_' + e.eventId, kind: 'theme', event: e.eventId, name: e.name, emoji: e.emoji, exclusive: 'Final event tier',
      swatch: [bg[0], bg[1], e.accent], palette: { dark: bg[0], mid: bg[1], hi: bg[2], accent: e.accent } });
  });

  // ---------- Space Race (weekly rival) ----------
  var RIVALS = [
    { name: 'The Grand Duchy of Blandovia', leader: 'Archduke Beige', face: 'rival_duke', motto: 'Beige is a color. We checked.' },
    { name: 'The Robo-Republic of Nulltopia', leader: 'Chairman 0xDEAD', face: 'rival_robot', motto: 'Resistance is inefficient.' },
    { name: 'The Zorgon Hegemony', leader: 'Overlord Blorp', face: 'rival_alien', motto: 'All your moons are belong to us.' },
    { name: 'The Kingdom of Meh', leader: 'King Whatever III', face: 'rival_king', motto: 'We\'ll get to space eventually.' }
  ];
  var LEAGUES = [
    { name: 'Bronze League', icon: '🥉', target: 350, win: { lb: 20, card: 1 }, lose: { lb: 5 } },
    { name: 'Silver League', icon: '🥈', target: 600, win: { lb: 35, card: 1 }, lose: { lb: 8, card: 1 } },
    { name: 'Gold League', icon: '🥇', target: 900, win: { lb: 50, card: 2 }, lose: { lb: 12, card: 1 } },
    { name: 'Platinum League', icon: '💠', target: 1300, win: { lb: 80, card: 2 }, lose: { lb: 18, card: 1 } },
    { name: 'Galactic League', icon: '🌌', target: 1800, win: { lb: 120, card: 3 }, lose: { lb: 25, card: 1 } }
  ];
  var RACE_WIN_XP = 150;
  // Race points per action.
  var RP = {
    daily: 15, mission: 15, speech: 8, catch: 3, mechanic: 4, election: 40, launch: 100, convention: 150,
    milestone: 3, hire: 5, upgrade: 1, order: 10, donation: 5
  };
  var STATIONS = ['Launchpad', 'Low Orbit', 'The Moon', 'Mars', 'Asteroid Belt', 'Jupiter', 'Saturn', 'Pluto', 'Alpha Centauri'];

  // ---------- Executive Orders (daily draft, 5 slots, permanent until replaced) ----------
  // tag: econ 💰 / space 🚀 / liberty 🦅. Three of a tag → ×1.5 profit, five → ×3; one of each → ×1.25.
  var ORDER_TAGS = { econ: '💰', space: '🚀', liberty: '🦅' };
  var ORDER_TYPES = [
    { id: 'holiday', tag: 'econ', rarity: 'common', name: 'Tax Holiday', needsBiz: true, profitBiz: 4 },
    { id: 'lowfive', tag: 'econ', rarity: 'common', name: 'Main Street Relief Act', profitRange: [0, 4], mult: 2 },
    { id: 'highfive', tag: 'space', rarity: 'common', name: 'Space Industry Act', profitRange: [5, 9], mult: 2 },
    { id: 'speech', tag: 'liberty', rarity: 'common', name: 'Campaign Finance Act', speechLen: 1.5 },
    { id: 'sky', tag: 'liberty', rarity: 'common', name: 'Open Skies Act', sky: 3 },
    { id: 'townhall', tag: 'liberty', rarity: 'common', name: 'Open Door Act', petition: 3, treatyDur: 2 },
    { id: 'flare', tag: 'space', rarity: 'common', name: 'Solar Subsidy', flareDur: 2, flareSpeed: 1.6 },
    { id: 'infra', tag: 'space', rarity: 'rare', name: 'Infrastructure Bill', speedAll: 1.25 },
    { id: 'buyam', tag: 'econ', rarity: 'rare', name: 'Buy American Act', cost: 0.85 },
    { id: 'charter', tag: 'space', rarity: 'rare', name: 'Colonial Charter', tribute: 2 },
    { id: 'loop', tag: 'space', rarity: 'rare', name: 'Time Dilation Act', loopRate: 2 },
    { id: 'stimulus', tag: 'econ', rarity: 'rare', name: 'Stimulus Checks', missionLb: 1.5 },
    { id: 'newdeal', tag: 'econ', rarity: 'legendary', name: 'The New Deal', needsBiz: true, profitBiz: 10, penaltyBiz: 0.5 },
    { id: 'mandate', tag: 'liberty', rarity: 'legendary', name: 'Mandate of the People', profitAll: 1.5 }
  ];
  var ORDER_RARITY = { common: 0.6, rare: 0.3, legendary: 0.1 };
  var ORDER_SLOTS = 5;
  var ORDER_SYNERGY = { three: 1.5, five: 3, unity: 1.25 };

  // ---------- Presidential Library (collectible cards, earned by playing; never sold) ----------
  var CARDS = [];
  D.WORLDS.forEach(function (w, wi) {
    if (w.event) return;
    w.managers.forEach(function (m, i) {
      // 'c4_*' already belongs to the Freedom Fest crew, so the Multiverse cabinet uses 'mv_*'.
      CARDS.push({ id: (wi === 4 ? 'mv_' : 'c' + wi + '_') + i, set: 'w' + wi, world: wi, face: m.face, name: m.name });
    });
  });
  // The original Freedom Fest crew (ids kept so existing collections carry over).
  [['franklin', 'Ben Franklite'], ['ross', 'Betsy Ross-Racer'], ['revere', 'Paul Revere-Rocket'], ['sousa', 'John Philip Sousaphone'], ['liberty', 'Lady Liberty'], ['samjr', 'Uncle Sam Jr.']]
    .forEach(function (x, i) { CARDS.push({ id: 'c4_' + i, set: 'fest', eventSet: true, event: 'fest', world: D.EVENT_INDEX, face: x[0], name: x[1], accent: '#f5c518' }); });
  [['bell', '🔔', 'Liberty Bell'], ['liberty', '🗽', 'Statue of Liberty'], ['rushmore', '🗿', 'Mount Rushmore'], ['capitol', '🏛️', 'The Capitol'],
    ['seal', '🦅', 'The Great Seal'], ['bridge', '🌉', 'Golden Gate Bridge'], ['saturn5', '🚀', 'Saturn V'], ['tranquility', '🌕', 'Tranquility Base']
  ].forEach(function (l) { CARDS.push({ id: 'lm_' + l[0], set: 'landmarks', emoji: l[1], name: l[2] }); });
  // Event collections: 6 cards per rotating event, earned only from that event's tiers and missions.
  (D.EVENTS || []).forEach(function (e) { e.cards.forEach(function (c) { CARDS.push({ id: c.id, set: c.set, eventSet: true, event: e.eventId, emoji: c.emoji, name: c.name, accent: c.accent }); }); });
  var CARD_SETS = [
    { id: 'w0', name: 'Earth Cabinet', world: 0, perCard: 0.05, complete: 3 },
    { id: 'w1', name: 'Solar Cabinet', world: 1, perCard: 0.05, complete: 3 },
    { id: 'w2', name: 'Galactic Cabinet', world: 2, perCard: 0.05, complete: 3 },
    { id: 'w3', name: 'Universal Cabinet', world: 3, perCard: 0.05, complete: 3 },
    { id: 'w4', name: 'Multiversal Cabinet', world: 4, perCard: 0.05, complete: 3 },
    { id: 'fest', name: 'Freedom Fest Crew', world: D.EVENT_INDEX, event: 'fest', eventSet: true, perCard: 0, complete: 2 },
    { id: 'landmarks', name: 'American Landmarks', world: 'main', perCard: 0.02, complete: 2 }
  ];
  // Engine hooks look sets up by id ('w' + world, 'landmarks'); event collections follow.
  (D.EVENTS || []).forEach(function (e) {
    if (e.cardSet !== 'fest') CARD_SETS.push({ id: e.cardSet, name: e.name, world: D.EVENT_INDEX, event: e.eventId, eventSet: true, emoji: e.emoji, perCard: 0, complete: 2 });
  });

  // New systems unlock gradually after the tutorial (seconds of playtime), to avoid overload.
  var FEATURE_UNLOCK = { orders: 600, race: 1200, pass: 1800, library: 0 };

  var LIVE_IAP = [
    { id: PREFIX + 'libertypass', type: 'consumable', pass: true, name: 'Liberty Pass', icon: '✪', fallbackPrice: '$4.99', hidden: true }
  ].concat(OFFERS.map(function (o) {
    return { id: o.product, type: 'consumable', offer: o.id, lb: o.lb, cosmetic: o.cosmetic, name: o.name, icon: o.icon, fallbackPrice: '$' + o.price, hidden: true };
  }));
  D.IAP.push.apply(D.IAP, LIVE_IAP);

  // Day 7 of the login ladder also grants a Library card.
  D.DAILY[6].card = 1;

  // Achievements for the new systems.
  [5, 25, 54, 100, 150, CARDS.length].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'cards' + n, kind: 'cards', n: n, tpl: 'cardach', reward: n >= CARDS.length ? 100 : n >= 100 ? 25 : 10 }); });
  [1, 10, 20, (D.EVENTS || []).length].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'events' + n, kind: 'eventsPlayed', n: n, tpl: 'eventach', reward: n >= 20 ? 30 : 10 }); });
  [1, 5, 15, 29].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'evsets' + n, kind: 'eventSets', n: n, tpl: 'evsetach', reward: n >= 15 ? 50 : 15 }); });
  [1, 10].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'evtop' + n, kind: 'eventTop', n: n, tpl: 'evtopach', reward: 25 }); });
  [1, 5, 20].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'race' + n, kind: 'raceWins', n: n, tpl: 'raceach', reward: 10 }); });
  [10, 50].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'orders' + n, kind: 'orders', n: n, tpl: 'orderach', reward: 5 }); });

  var PASS_PREMIUM_LB = 0;
  for (var pk = 0; pk < SEASON.tiers; pk++) PASS_PREMIUM_LB += passTrack(pk, true).lb || 0;

  D.LIVE = {
    SEASON: SEASON, SEASON_NAMES: SEASON_NAMES, XP: XP, passTrack: passTrack, PASS_PREMIUM_LB: PASS_PREMIUM_LB,
    OFFERS: OFFERS, BASE_VALUE: BASE_VALUE, OFFER_GAP_H: OFFER_GAP_H, AD_EXTRA: AD_EXTRA, COSMETICS: COSMETICS,
    RIVALS: RIVALS, LEAGUES: LEAGUES, RACE_WIN_XP: RACE_WIN_XP, RP: RP, STATIONS: STATIONS,
    ORDER_TAGS: ORDER_TAGS, ORDER_TYPES: ORDER_TYPES, ORDER_RARITY: ORDER_RARITY, ORDER_SLOTS: ORDER_SLOTS, ORDER_SYNERGY: ORDER_SYNERGY,
    CARDS: CARDS, CARD_SETS: CARD_SETS, FEATURE_UNLOCK: FEATURE_UNLOCK, PASS_PRODUCT: PREFIX + 'libertypass'
  };
})(typeof window !== 'undefined' ? window : globalThis);
