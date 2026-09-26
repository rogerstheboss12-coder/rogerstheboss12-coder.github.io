/* Content for the v1.1 systems: Bill of Rights perks (Amendments), Cabinet seniority perks,
 * the Chief of Staff (auto-buy), Town Hall decisions, rival-candidate Debates, weekly goals,
 * the weekly Showdown boss, leagues (grouped leaderboards) and Game Center ids.
 * Extends GameData; logic lives in extras.js. All text is English source; Spanish is in lang-es-extras.js. */
(function (root) {
  'use strict';
  var D = root.GameData;

  // ---------- Bill of Rights: spend Amendments on permanent perks ----------
  // Every Amendment ratified is also one perk point. Level k costs k points. Perks apply to main worlds.
  var PERKS = [
    { id: 'cabinet', icon: '🎩', name: 'Standing Cabinet', levels: [3, 6, 10], desc: 'After an Election or Convention, the first {v} managers are already hired.' },
    { id: 'headstart', icon: '🏗️', name: 'Head Start', levels: [2, 4, 6], desc: 'After an Election or Convention, the first {v} businesses start with 25 units.' },
    { id: 'speed', icon: '⚡', name: 'Swift Justice', levels: [1.25, 1.5, 2], desc: 'Every business runs ×{v} faster.' },
    { id: 'pork', icon: '🐖', name: 'Pork Barrel', levels: [0.7, 0.5, 0.3], desc: 'Bills (cash upgrades) cost ×{v}.' },
    { id: 'night', icon: '🌙', name: 'Night Session', levels: [1.5, 2, 3], desc: 'Offline earnings ×{v}.' },
    { id: 'mandate', icon: '🗳️', name: 'Grassroots Mandate', levels: [1.2, 1.4, 1.6], desc: 'Elections attract ×{v} prestige currency.' },
    { id: 'filibuster', icon: '🎤', name: 'Filibuster', levels: [2.5, 3], desc: 'Stump Speeches give ×{v} profit instead of ×2.' },
    { id: 'skies', icon: '🦅', name: 'Open Skies', levels: [1.5, 2], desc: 'Sky bonuses appear more often and pay ×{v}.' },
    { id: 'debate', icon: '🎙️', name: 'Right to Rebuttal', levels: [1.25, 1.5], desc: 'Debates last ×{v} longer and pay ×{v} ★.' },
    { id: 'dividend', icon: '★', name: 'Liberty Dividend', levels: [1, 2, 3], desc: 'Every mission pays +{v} ★.' }
  ];
  var PERK_RESPEC_LB = 100;

  // ---------- Cabinet seniority (light skill tree) ----------
  // A Cabinet Secretary builds seniority while appointed (online and offline). Each tier offers two perks.
  // Perks apply while the business has a manager, survive Elections and reset at a Convention.
  var SENIORITY = {
    tiers: [3600, 8 * 3600, 24 * 3600],   // seconds of Secretary time to unlock tiers 1–3
    choices: [
      [{ key: 'spd', v: 2, name: 'Efficiency Drive', desc: 'This business runs ×2 faster.' },
        { key: 'upg', v: 3, name: 'Lobbying Push', desc: 'This business earns ×3 profit.' }],
      [{ key: 'cost', v: 0.75, name: 'Bulk Discount', desc: 'This business costs 25% less to expand.' },
        { key: 'upg', v: 3, name: 'Franchise Deal', desc: 'This business earns ×3 profit.' }],
      [{ key: 'all', v: 1.1, name: 'Mentorship', desc: 'Every business on this world earns +10% profit.' },
        { key: 'upg', v: 5, name: 'Living Legend', desc: 'This business earns ×5 profit.' }]
    ]
  };

  // ---------- Chief of Staff (auto-hire / auto-pass), bought once in the Freedom Store ----------
  D.STORE.push({ id: 'chief', name: 'Chief of Staff', desc: 'Unlocks Auto-hire (managers and Cabinet Secretaries) and Auto-pass (bills) switches on every main world. One-time purchase.', cost: 150, unlock: 'auto', icon: '🧑‍💼' });

  // ---------- Town Hall decisions (Earth mechanic; replaces petitions) ----------
  // Option effects: cash (minutes of Earth income), lb, sky (a bonus flies by now), speech (minutes of ×2),
  // buff { profit|speed, targets: 'all' | [indices], mins }. Earth businesses: 0 Flag Stand … 9 Launchpad.
  var DECISIONS = [
    { q: 'The Bald Eagle Hatchery is overrun with eagles!', a: ['Release them over the stadium', { sky: 1, lb: 2 }], b: ['Sell eagle-feather quills', { cash: 6 }] },
    { q: 'Citizens demand a new national holiday.', a: ['Declare Fireworks Friday', { buff: { profit: 5, targets: [3], mins: 10 } }], b: ['Keep everyone working', { buff: { speed: 1.5, targets: 'all', mins: 6 } }] },
    { q: 'A pie-eating contest got out of hand.', a: ['Sponsor it on live TV', { buff: { profit: 6, targets: [2], mins: 10 } }], b: ['Bill the contestants', { cash: 8 }] },
    { q: 'Cable news wants an exclusive interview.', a: ['Go live right now', { buff: { profit: 6, targets: [5], mins: 10 } }], b: ['Give a speech instead', { speech: 30 }] },
    { q: 'A monster truck is stuck on the Capitol steps.', a: ['Make it a tourist attraction', { buff: { profit: 6, targets: [4], mins: 10 } }], b: ['Tow it and fine the driver', { cash: 7 }] },
    { q: 'Hollywood wants to film a biopic about you.', a: ['Approve the script', { buff: { profit: 6, targets: [7], mins: 10 } }], b: ['Demand a bigger budget', { lb: 4 }] },
    { q: 'The Federal Reserve printer is jammed.', a: ['Hit it with a wrench', { buff: { profit: 6, targets: [8], mins: 8 } }], b: ['Hire a repair crew', { buff: { speed: 2, targets: [8], mins: 10 } }] },
    { q: 'A shale rig struck something shiny.', a: ['Drill deeper!', { buff: { profit: 6, targets: [6], mins: 10 } }], b: ['Sell the mineral rights', { cash: 9 }] },
    { q: 'Kids want a flag stand on every corner.', a: ['Let them run it', { buff: { profit: 8, targets: [0, 1], mins: 10 } }], b: ['Tax the lemonade next door', { cash: 5 }] },
    { q: 'NASA interns found a spare rocket.', a: ['Launch it for science', { buff: { profit: 5, targets: [9], mins: 10 } }], b: ['Auction it off', { cash: 10 }] },
    { q: 'Small businesses ask for a tax break.', a: ['Cut taxes for the little guys', { buff: { profit: 3, targets: [0, 1, 2, 3, 4], mins: 10 } }], b: ['Cut taxes for the big guys', { buff: { profit: 3, targets: [5, 6, 7, 8, 9], mins: 10 } }] },
    { q: 'Congress is deadlocked — again.', a: ['Order pizza and wait it out', { buff: { speed: 1.5, targets: 'all', mins: 8 } }], b: ['Pass it by executive order', { buff: { profit: 2, targets: 'all', mins: 6 } }] },
    { q: 'A marching band wants to parade through the Oval Office.', a: ['Join in on tuba', { speech: 20, lb: 1 }], b: ['Sell parade tickets', { cash: 6 }] },
    { q: 'The eagles want better health insurance.', a: ['Grant it — they earned it', { buff: { profit: 8, targets: [1], mins: 12 } }], b: ['Offer extra fish instead', { cash: 4, lb: 2 }] },
    { q: 'A town wants to rename itself after you.', a: ['Graciously accept', { lb: 5 }], b: ['Suggest a naming-rights fee', { cash: 8 }] },
    { q: 'The fireworks warehouse is… a bit too full.', a: ['Early Fourth of July!', { buff: { profit: 10, targets: [3], mins: 5 }, sky: 1 }], b: ['Sell the surplus to Canada', { cash: 9 }] },
    { q: 'Tourists keep asking where the Moon base is.', a: ['Build a gift shop', { buff: { profit: 2, targets: 'all', mins: 8 } }], b: ['Charge for directions', { cash: 6 }] },
    { q: 'An inventor pitches a self-waving flag.', a: ['Fund the prototype', { buff: { speed: 3, targets: [0], mins: 12 } }], b: ['Buy the patent outright', { lb: 3, cash: 3 }] },
    { q: 'The diner ran out of apple pie!', a: ['Declare a pie emergency', { buff: { speed: 2.5, targets: [2], mins: 10 } }], b: ['Serve cherry and hope', { cash: 5, lb: 1 }] },
    { q: 'A citizen wants the national bird changed to a turkey.', a: ['Hold a public vote', { speech: 25 }], b: ['Politely decline with a medal', { lb: 4 }] }
  ];
  var DECISION_CFG = { firstAfter: 120, every: [180, 300] }; // seconds

  // ---------- Debates: timed boss fights against fictional rival candidates ----------
  var CANDIDATES = [
    { name: 'Senator Snoozeworth', party: 'The Nap Party', face: 'cand_snooze', line: 'Zzz… I mean, vote for me.' },
    { name: 'Governor Flip-Flopson', party: 'The Both-Sides Party', face: 'cand_flip', line: 'I stand firmly on both sides of every issue.' },
    { name: 'Mr. Moneybags McGee', party: 'The Money Party', face: 'cand_fat', line: 'I\'ll buy this election. Literally.' },
    { name: 'CANDIDATE-9000', party: 'The Algorithm Party', face: 'rival_robot', line: 'I have calculated your defeat.' },
    { name: 'Supreme Chancellor Zorp', party: 'The Probe Party', face: 'rival_alien', line: 'Take me to your voters.' },
    { name: 'Archduke Beige', party: 'The Beige Party', face: 'rival_duke', line: 'Beige: the color of progress.' },
    { name: 'Colonel Tallhat', party: 'The Hat Party', face: 'cand_hat', line: 'My hat has more experience than you.' },
    { name: 'King Whatever III', party: 'The Meh Party', face: 'rival_king', line: 'Eh. Let\'s debate, I guess.' }
  ];
  var DEBATE = {
    unlockPlaytime: 1800,  // seconds of play before the first challenge
    cooldown: 3 * 3600,    // seconds between challenges
    minutes: 5,            // debate length
    baseK: 2, perLevel: 0.15, maxK: 4.5, // target = income/sec × seconds × k
    lb: function (level) { return Math.min(30, 6 + 2 * level); },
    loseLb: 2, cardEvery: 3
  };

  // ---------- Weekly goals (Monday to Monday, 5 per week) ----------
  var WEEKLY = {
    pool: [
      { id: 'missions', stat: 'missions', n: 15, icon: '🎯', text: 'Complete {n} missions' },
      { id: 'catches', stat: 'catches', n: 20, icon: '🦅', text: 'Catch {n} sky bonuses' },
      { id: 'speeches', stat: 'speeches', n: 7, icon: '🎤', text: 'Give {n} Stump Speeches' },
      { id: 'elections', stat: 'elections', n: 3, icon: '🗳️', text: 'Hold {n} elections' },
      { id: 'decisions', stat: 'decisions', n: 10, icon: '🏛️', text: 'Make {n} Town Hall decisions' },
      { id: 'debates', stat: 'debatesWon', n: 2, icon: '🎙️', text: 'Win {n} debates' },
      { id: 'milestones', stat: 'milestones', n: 40, icon: '⚡', text: 'Reach {n} business milestones' },
      { id: 'tiers', stat: 'eventTiers', n: 6, icon: '🎉', text: 'Claim {n} event reward tiers' },
      { id: 'bills', stat: 'bills', n: 60, icon: '📜', text: 'Pass {n} bills' },
      { id: 'hires', stat: 'hires', n: 10, icon: '🎩', text: 'Hire {n} managers' },
      { id: 'daily', stat: 'dailies', n: 5, icon: '📅', text: 'Claim {n} daily rewards' }
    ],
    perWeek: 5,
    reward: { lb: 15, xp: 150 },
    bonus: { lb: 50, card: 2, warp: 4 * 3600 }
  };

  // ---------- Weekly Showdown: a 24-hour boss fight every Saturday ----------
  var SHOWDOWN = {
    weekday: 5,            // days after the Monday epoch (5 = Saturday)
    hp: 1000,
    bosses: [
      { id: 'kraken', name: 'The Deficit Kraken', emoji: '🦑', line: 'Your budget is MINE!' },
      { id: 'titan', name: 'The Red Tape Titan', emoji: '🗿', line: 'Fill out form 27-B in triplicate.' },
      { id: 'dragon', name: 'The Filibuster Dragon', emoji: '🐉', line: 'I shall now read the phone book. Aloud.' },
      { id: 'hydra', name: 'The Inflation Hydra', emoji: '🐍', line: 'Cut off one price hike, two more grow back!' },
      { id: 'golem', name: 'The Gridlock Golem', emoji: '🚧', line: 'Nothing moves. Nothing passes.' },
      { id: 'leviathan', name: 'The Pothole Leviathan', emoji: '🐋', line: 'I live beneath every road.' }
    ],
    // Damage per action (awarded wherever Pass XP is).
    dmg: { mission: 25, daily: 20, speech: 15, catch: 8, mechanic: 10, milestone: 4, hire: 8, upgrade: 1, order: 15,
      election: 60, launch: 150, convention: 200, debate: 40, eventTier: 20, achievement: 3, donation: 10, weekly: 30 },
    tiers: [
      { at: 0.25, lb: 10 },
      { at: 0.5, lb: 20, card: 1 },
      { at: 0.75, warp: 2 * 3600 },
      { at: 1, lb: 40, card: 1 }
    ]
  };

  // ---------- Leagues: grouped leaderboards (50–100 per group) ----------
  // Real players come from the league server when it is configured and reachable; AI rivals
  // (clearly labelled) fill every group up to its size, and stand in completely when offline.
  var LEAGUE = {
    minGroup: 50, maxGroup: 100,
    // Final-rank rewards for each board.
    ranks: [
      { top: 1, lb: 60, card: 1 },
      { top: 3, lb: 40 },
      { top: 10, lb: 25 },
      { pct: 0.25, lb: 12 },
      { pct: 1, lb: 5 }
    ],
    // Generated display names (no free text, so nothing needs moderation). The server checks the same lists.
    titles: ['Governor', 'Senator', 'Mayor', 'Sheriff', 'Commissioner', 'Ambassador', 'Admiral', 'Chancellor',
      'Judge', 'Treasurer', 'Delegate', 'Councilor', 'Speaker', 'Marshal', 'Consul', 'Envoy'],
    names: ['Abigail', 'Bartholomew', 'Cornelius', 'Dolly', 'Ezekiel', 'Florence', 'Gus', 'Hattie', 'Ignatius', 'Josephine',
      'Kit', 'Lulu', 'Mortimer', 'Nell', 'Otis', 'Prudence', 'Quincy', 'Rosalind', 'Silas', 'Tabitha',
      'Ulysses', 'Vera', 'Winifred', 'Xavier', 'Yolanda', 'Zebulon', 'Barnaby', 'Clementine', 'Delbert', 'Eugenia'],
    places: ['New Ohio', 'Moon Kansas', 'Mars Vermont', 'Ceres Texas', 'Lunar Maine', 'Venus Nevada', 'Titan Oregon', 'Pluto Dakota',
      'Io Iowa', 'Europa Utah', 'Saturn Idaho', 'Nebula Montana', 'Orion Georgia', 'Vega Virginia', 'Comet Carolina',
      'Galaxy Alabama', 'Quasar Florida', 'Andromeda Arizona', 'Ganymede Delaware', 'Callisto Colorado'],
    // AI rival final scores: event boards in log10(event earnings), showdown boards in damage.
    // Calibrated with `node tools/sim.js 5 72 <profile>`: casual ends ≈ 10^19.6, engaged ≈ 10^20.1.
    simEvent: { mean: 19.2, sd: 0.9, min: 12, max: 21.2, curve: 0.12 },
    simShowdown: { median: 800, spread: 1.5, min: 60, max: 3000 },
    // Set to the deployed league server (see server/README.md), e.g. 'https://sst-leagues.example.workers.dev'.
    server: 'https://sst-leagues.rogerstheboss12.workers.dev'
  };

  // ---------- Comeback bonus ----------
  var COMEBACK = { awayDays: 3, mult: 2, hours: 1 };

  // ---------- Game Center ----------
  // Leaderboard and achievement ids must match App Store Connect (see store/game-center.md).
  var GC_PREFIX = 'sst.';
  var GAME_CENTER = {
    leaderboards: {
      event: GC_PREFIX + 'lb.event',          // recurring, 3 days: event score (log scale ×1000)
      showdown: GC_PREFIX + 'lb.showdown',    // recurring, weekly: Showdown damage
      amendments: GC_PREFIX + 'lb.amendments',
      achievements: GC_PREFIX + 'lb.achievements',
      racewins: GC_PREFIX + 'lb.racewins'
    },
    // Up to 100 of the game's achievements are mirrored to Game Center (Apple's limit), as achPrefix + id.
    // Recurring boards reset at one global instant (App Store Connect start time, minutes after 00:00 UTC),
    // while the game's events and Showdown follow local midnight. Scores are only sent while both agree.
    periodOffsetMin: 0,
    achPrefix: GC_PREFIX + 'ach.',
    achievements: []
  };

  D.EXTRAS = {
    PERKS: PERKS, PERK_RESPEC_LB: PERK_RESPEC_LB, SENIORITY: SENIORITY, DECISIONS: DECISIONS, DECISION_CFG: DECISION_CFG,
    CANDIDATES: CANDIDATES, DEBATE: DEBATE, WEEKLY: WEEKLY, SHOWDOWN: SHOWDOWN, LEAGUE: LEAGUE, COMEBACK: COMEBACK, GAME_CENTER: GAME_CENTER
  };

  // Achievements for the new systems.
  [1, 10, 50].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'debate' + n, kind: 'debatesWon', n: n, tpl: 'debateach', reward: n >= 50 ? 25 : 8 }); });
  [10, 100, 500].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'decide' + n, kind: 'decisions', n: n, tpl: 'decideach', reward: n >= 500 ? 20 : 5 }); });
  [1, 10, 50].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'weekly' + n, kind: 'weeklyDone', n: n, tpl: 'weeklyach', reward: n >= 50 ? 40 : 10 }); });
  [1, 5, 25].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'boss' + n, kind: 'bossKills', n: n, tpl: 'bossach', reward: n >= 25 ? 40 : 10 }); });
  [1, 10].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'podium' + n, kind: 'podiums', n: n, tpl: 'podiumach', reward: 25 }); });
  [1, 10, 30].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'perk' + n, kind: 'perkLevels', n: n, tpl: 'perkach', reward: 15 }); });
  [1, 15, 50].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'senior' + n, kind: 'seniorPerks', n: n, tpl: 'seniorach', reward: 10 }); });
  [25, 100].forEach(function (n) { D.ACHIEVEMENTS.push({ id: 'codex' + n, kind: 'codex', n: n, tpl: 'codexach', reward: 10 }); });

  // Game Center mirrors a curated set (≤100): the first/most notable tier of each family.
  var GC_ACH = ['world1', 'world2', 'world3', 'world4', 'mgr0', 'mgr1', 'mgr2', 'mgr3', 'mgr4', 'chief0', 'chief1', 'chief2', 'chief3', 'chief4',
    'elect0_1', 'elect0_10', 'elect1_1', 'elect2_1', 'elect3_1', 'elect4_1', 'all0_100', 'all1_100', 'all2_100', 'all3_100', 'all4_100',
    'all0_1000', 'life0_3', 'life0_9', 'life1_6', 'life2_6', 'life3_6', 'life4_6', 'life3_13', 'click100', 'click10000', 'catch10', 'catch200',
    'speech10', 'speech50', 'streak7', 'streak30', 'streak100', 'badge1', 'badge5', 'badge20', 'conv1', 'conv3', 'conv10',
    'mission50', 'mission150', 'cards25', 'cards100', 'events1', 'events10', 'evsets1', 'evsets15', 'evtop1', 'evtop10',
    'race1', 'race5', 'race20', 'orders10', 'orders50', 'debate1', 'debate10', 'debate50', 'decide100', 'decide500',
    'weekly1', 'weekly10', 'weekly50', 'boss1', 'boss5', 'boss25', 'podium1', 'podium10', 'perk1', 'perk10', 'perk30',
    'senior1', 'senior15', 'senior50', 'codex25', 'codex100'];
  GAME_CENTER.achievements = GC_ACH.filter(function (id) { return D.ACHIEVEMENTS.some(function (a) { return a.id === id; }); });
})(typeof window !== 'undefined' ? window : globalThis);
