/* Static game data: worlds, businesses, managers, upgrades, missions,
 * events, daily rewards, store catalog and achievements.
 * Economy model: exponential unit costs, per-business milestones, managers,
 * cash upgrades, a per-world prestige currency (√ of lifetime earnings) and a
 * global second prestige layer (the Constitutional Convention). */
(function (root) {
  'use strict';

  // Payback = seconds for one base unit to earn back its own cost.
  // Revenue per cycle is derived: rev = cost / payback * time.
  function biz(name, cost, coef, time, payback, flavor) {
    return { name: name, cost: cost, coef: coef, time: time, rev: (cost / payback) * time, flavor: flavor };
  }

  var MANAGER_RATIO = [250, 250, 140, 60, 12, 8, 7.5, 3.1, 4.7, 3.9];

  var WORLDS = [
    {
      id: 'earth', name: 'Earth', title: 'Make America Orbital',
      currency: 'Dollars', sym: '$', bg: 'assets/worlds/world1.jpg',
      prestigeName: 'Patriot Donors', prestigeShort: 'Donors', prestigeVerb: 'Hold an Election',
      prestigeScale: 1e12, eventCatcher: 'eagle', theme: 'march', mechanic: 'townhall',
      mechanicName: 'Town Hall', mechanicDesc: 'Citizens bring you dilemmas. Every answer does something different — instant cash, Liberty Bucks, or a boost for some of your businesses.',
      intro: 'My fellow Americans! Our destiny lies among the stars — but first, we need cash. Tap the Flag Stand to start earning!',
      accent: '#c8102e',
      businesses: [
        biz('Flag Stand', 4, 1.07, 0.6, 2.4, 'Waving since 1776.'),
        biz('Bald Eagle Hatchery', 60, 1.15, 3, 3, 'Majestic. Loud. Profitable.'),
        biz('Apple Pie Diner', 720, 1.14, 6, 8, 'As American as… well.'),
        biz('Fireworks Factory', 8640, 1.13, 12, 24, 'Every day is the Fourth.'),
        biz('Monster Truck Rally', 103680, 1.12, 24, 48, 'Sunday! Sunday! SUNDAY!'),
        biz('Cable News Network', 1244160, 1.11, 96, 192, 'Breaking news, around the clock.'),
        biz('Shale Rig', 14929920, 1.10, 384, 768, 'Drill, baby, drill.'),
        biz('Hollywood Studio', 179159040, 1.09, 1536, 3072, 'Sequels to sequels.'),
        biz('Federal Reserve Printer', 2149908480, 1.08, 6144, 12288, 'Brrrrrrrr.'),
        biz('Launchpad Program', 25798901760, 1.07, 36864, 32055, 'Destination: everywhere.')
      ],
      managers: [
        { name: 'George Washingtun', title: 'Commander of Flags', face: 'washington' },
        { name: 'Teddy Roosebolt', title: 'Chief Eagle Wrangler', face: 'teddy' },
        { name: 'Abe Lincorn', title: 'Secretary of Pie', face: 'lincoln' },
        { name: 'Thomas Jeffersong', title: 'Minister of Boom', face: 'jefferson' },
        { name: 'Ronald Raygun', title: 'Truck Rally Announcer', face: 'reagan' },
        { name: 'Richard Nixin\'', title: 'Anchor-in-Chief', face: 'nixon' },
        { name: 'Dwight D. Eisenhauler', title: 'General of Crude', face: 'ike' },
        { name: 'Jack F. Kennedazzle', title: 'Head of Glamour', face: 'jfk' },
        { name: 'Alexander Hamiltoon', title: 'Treasurer of Brrr', face: 'hamilton' },
        { name: 'Franklin D. Rocketvelt', title: 'Director of Liftoff', face: 'fdr' }
      ],
      next: { cost: 1e15, label: 'Fund the Moonshot' }
    },
    {
      id: 'solar', name: 'Solar System', title: 'Manifest Destiny 2.0',
      currency: 'Moon Dollars', sym: '☾$', bg: 'assets/worlds/world2.jpg',
      prestigeName: 'Space Force Veterans', prestigeShort: 'Veterans', prestigeVerb: 'Hold a Space Election',
      prestigeScale: 1e12, eventCatcher: 'satellite', theme: 'synth', mechanic: 'flare',
      mechanicName: 'Solar Flares', mechanicDesc: 'The Sun erupts every few minutes, supercharging one business to ×5 speed for 45 seconds. Tap the flare to extend it!',
      intro: 'We made it off-world! The Moon, Mars, and the gas giants await — every rock a new strip mall. Watch for solar flares: they supercharge a business!',
      accent: '#ff9a1f',
      businesses: [
        biz('Zero-G Hot Dog Cart', 5, 1.05, 1.5, 3, 'Relish floats. Buns do too.'),
        biz('Moon Bounce House', 90, 1.21, 5, 4, 'One small hop for a kid.'),
        biz('Lunar Cheese Mine', 1500, 1.07, 20, 10, 'We were right all along.'),
        biz('Mars Terraform Ranch', 25000, 1.19, 2, 20, 'Home, home on the red range.'),
        biz('Asteroid Mining Rig', 4e5, 1.09, 45, 50, 'Freedom ore. Very shiny.'),
        biz('Orbital Megamall', 7e6, 1.15, 180, 180, 'Food court in every orbit.'),
        biz('Jupiter Gas Station', 1.2e8, 1.13, 600, 700, 'Hydrogen, regular or premium.'),
        biz('Saturn Ring Resort', 2.2e9, 1.17, 3000, 3000, 'All-inclusive. Rings extra.'),
        biz('Mercury Solar Ring', 4e10, 1.10, 14400, 11000, 'Sunlight, now with a subscription.'),
        biz('Dyson Sphere Co.', 8e11, 1.12, 86400, 40000, 'We put a fence around the Sun.')
      ],
      managers: [
        { name: 'Grover Grilland', title: 'Hot Dog Commissioner', face: 'cleveland' },
        { name: 'Jimmy Cartwheel', title: 'Bounce Supervisor', face: 'carter' },
        { name: 'Herbert Hooverboard', title: 'Cheese Foreman', face: 'hoover' },
        { name: 'Lyndon B. Ranchson', title: 'Head Rancher of Mars', face: 'lbj' },
        { name: 'Gerald Ford-Drill', title: 'Asteroid Boss', face: 'ford' },
        { name: 'Warren G. Hard-Sell', title: 'Megamall Magnate', face: 'harding' },
        { name: 'James K. Polkadot', title: 'Great Red Spot Attendant', face: 'polk' },
        { name: 'John Tiki Tyler', title: 'Resort Host', face: 'tyler' },
        { name: 'William McKinsolar', title: 'Solar Evangelist', face: 'mckinley' },
        { name: 'Harry S. Trumanaut', title: 'Sphere Architect', face: 'truman' }
      ],
      next: { cost: 1e16, label: 'Build the Warp Gate' }
    },
    {
      id: 'galaxy', name: 'Milky Way', title: 'Galactic Freedom Initiative',
      currency: 'Galactic Credits', sym: '₲', bg: 'assets/worlds/world3.jpg',
      prestigeName: 'Alien Allies', prestigeShort: 'Allies', prestigeVerb: 'Hold a Galactic Election',
      prestigeScale: 1e13, eventCatcher: 'ufo', theme: 'arp', mechanic: 'treaty',
      mechanicName: 'Alien Treaties', mechanicDesc: 'Envoys arrive with trade deals. Pick one of two treaties — each reshapes your economy for 10 minutes.',
      intro: 'Warp gate online! 100 billion stars, and not one American franchise. Alien envoys will offer treaties — choose wisely!',
      accent: '#7cff6b',
      businesses: [
        biz('Alien Embassy Booth', 10, 1.08, 1, 3, 'Take me to your lobbyist.'),
        biz('Exoplanet Real Estate', 250, 1.12, 4, 5, 'Location, location, light-years.'),
        biz('Nebula Paint Co.', 5000, 1.09, 10, 12, 'Now in 16 million cosmic hues.'),
        biz('Space Cowboy Rodeo', 1.2e5, 1.14, 30, 30, 'Yee-haw in zero gravity.'),
        biz('Warp Drive Dealership', 3e6, 1.10, 90, 70, 'Zero percent APR, 9.9 warp.'),
        biz('Wormhole Toll Road', 8e7, 1.11, 300, 200, 'Exact change only.'),
        biz('Clone Senate', 2e9, 1.16, 900, 800, 'Unanimous every time.'),
        biz('Pulsar Radio', 6e10, 1.09, 3600, 3500, 'Talk radio at 700 pulses/sec.'),
        biz('Black Hole Casino', 2e12, 1.12, 21600, 14000, 'The house always wins. Forever.'),
        biz('Star Forge', 7e13, 1.08, 100000, 50000, 'Stars: forged in the USA.')
      ],
      managers: [
        { name: 'Senator Zorp', title: 'Ambassador of Hellos', face: 'alien1' },
        { name: 'James Monrover', title: 'Doctrine Realtor', face: 'monroe' },
        { name: 'Martian Madison', title: 'Paint Commissioner', face: 'madison' },
        { name: 'William Howard Taft-Off', title: 'Rodeo Champion', face: 'taft' },
        { name: 'Ulysses S. Grantgravity', title: 'Warp Salesman', face: 'grant' },
        { name: 'Woodrow Wormhole-son', title: 'Toll Collector', face: 'wilson' },
        { name: 'Clone Washington #47', title: 'Majority Leader(s)', face: 'clonewash' },
        { name: 'Grand Chancellor Gl\'orb', title: 'Shock Jock', face: 'alien2' },
        { name: 'Andrew Jackpot', title: 'Pit Boss', face: 'jackson' },
        { name: 'Robo-Lincoln 3000', title: 'Forge Master', face: 'robolincoln' }
      ],
      next: { cost: 1e17, label: 'Annex the Universe' }
    },
    {
      id: 'universe', name: 'Known Universe', title: 'The United States of Everything',
      currency: 'Omnibucks', sym: 'Ω', bg: 'assets/worlds/world4.jpg',
      prestigeName: 'Cosmic Delegates', prestigeShort: 'Delegates', prestigeVerb: 'Hold a Universal Election',
      prestigeScale: 1e14, eventCatcher: 'comet', theme: 'ambient', mechanic: 'loop',
      mechanicName: 'Temporal Loops', mechanicDesc: 'Loops charge over time (even offline). Spend one to replay 30 minutes of this world\'s full production instantly.',
      intro: 'The final frontier! Every galaxy, every dimension, every timeline. Temporal Loops charge up over time — spend them to replay history for profit.',
      accent: '#b69cff',
      businesses: [
        biz('Dark Matter Refinery', 25, 1.06, 0.8, 3, 'We can\'t see it, but we sell it.'),
        biz('Time Travel Tourism', 700, 1.10, 3, 6, 'Visit 1776. Again.'),
        biz('Multiverse Bank', 2e4, 1.13, 12, 14, 'Your money, in every reality.'),
        biz('Galaxy Cluster Suburbs', 6e5, 1.08, 40, 35, 'Cul-de-sacs the size of galaxies.'),
        biz('Quasar Power Plant', 2e7, 1.15, 150, 90, 'Brighter than a trillion suns.'),
        biz('Cosmic String Yo-Yo Co.', 8e8, 1.10, 500, 250, 'Walk the dog across spacetime.'),
        biz('Entropy Insurance', 3e10, 1.12, 1800, 1000, 'Heat death? You\'re covered.'),
        biz('Big Bang Reenactment', 1.2e12, 1.14, 7200, 4000, 'Nightly at 8. Bring earplugs.'),
        biz('Simulation Admin Console', 5e13, 1.09, 28800, 16000, 'sudo make america great.'),
        biz('Universal Constitution', 2.5e15, 1.07, 172800, 60000, 'We the Everyone…')
      ],
      managers: [
        { name: 'Quantum Coolidge', title: 'Dark Matter Czar', face: 'coolidge' },
        { name: 'John Quincy Adams-Ant', title: 'Time Tour Guide', face: 'jqadams' },
        { name: 'Martin Van Burenverse', title: 'Multiversal Banker', face: 'vanburen' },
        { name: 'Chester A. Arthurverse', title: 'Suburb Planner', face: 'arthur' },
        { name: 'Rutherford B. Hayesar', title: 'Quasar Operator', face: 'hayes' },
        { name: 'Benjamin Harrisonic', title: 'String Theorist', face: 'bharrison' },
        { name: 'Millard Fillmore-verse', title: 'Chief Actuary', face: 'fillmore' },
        { name: 'Zachary Taylor-Made', title: 'Showrunner', face: 'ztaylor' },
        { name: 'The Admin', title: 'Root User', face: 'admin' },
        { name: 'Cosmic Uncle Sam', title: 'Father of Everything', face: 'unclesam' }
      ],
      next: { cost: 1e18, label: 'Open the Multiverse Rift' }
    },
    {
      id: 'multi', name: 'The Multiverse', title: 'One Nation, Under Infinite Realities',
      currency: 'Multibucks', sym: '∞$', bg: 'assets/worlds/world5.jpg',
      prestigeName: 'Variant Voters', prestigeShort: 'Variants', prestigeVerb: 'Hold a Multiversal Election',
      prestigeScale: 1e15, eventCatcher: 'portal', theme: 'multi', mechanic: 'anchor',
      mechanicName: 'Reality Anchor', mechanicDesc: 'Anchor one business across every reality. Its profit grows ×1 every 6 minutes it stays anchored, up to ×10 — even offline. Re-anchoring starts over.',
      intro: 'The rift is open! Infinite Americas, infinite markets, infinite paperwork. Anchor your best business across every reality and watch it grow.',
      accent: '#ff5fd2',
      businesses: [
        biz('Alt-History Gift Shop', 50, 1.06, 0.9, 3, 'Souvenirs from timelines that never happened.'),
        biz('Parallel Parking Garage', 1500, 1.11, 3.5, 6, 'Park in every reality at once.'),
        biz('Doppelgänger Staffing', 5e4, 1.12, 12, 14, 'Hire yourself. Infinitely.'),
        biz('Butterfly Effect Farm', 1.5e6, 1.09, 45, 35, 'Flap here, hurricane profits there.'),
        biz('Timeline Tollbooth', 6e7, 1.14, 160, 90, 'Branch points: exact change only.'),
        biz('What-If Studios', 2.5e9, 1.10, 540, 260, 'Every sequel, in every universe.'),
        biz('Paradox Insurance', 1e11, 1.12, 1900, 1000, 'Grandfather clause included.'),
        biz('Infinite Monkey Press', 4e12, 1.13, 7500, 4000, 'Shakespeare, eventually.'),
        biz('Schrödinger\'s Deli', 1.6e14, 1.09, 30000, 16000, 'The sandwich is both fresh and not.'),
        biz('The Omniversal Congress', 8e15, 1.07, 180000, 60000, 'Every America, one gavel.')
      ],
      managers: [
        { name: 'John Adamsverse', title: 'Curator of Maybes', face: 'jadams' },
        { name: 'William Henry Harri-Soon', title: 'Valet of All Realities', face: 'whharrison' },
        { name: 'Franklin Pierce-Through', title: 'Head of Duplicates', face: 'pierce' },
        { name: 'James Buchanverse', title: 'Chief Flapper', face: 'buchanan' },
        { name: 'Andrew Johnson Prime', title: 'Branch Point Warden', face: 'ajohnson' },
        { name: 'James A. Garfold', title: 'Showrunner of Maybe', face: 'garfield' },
        { name: 'Mirror Washington', title: 'Evil Twin Underwriter', face: 'mirrorwash' },
        { name: 'Lincoln-B of Timeline 7', title: 'Editor-in-Chief', face: 'altlincoln' },
        { name: 'President Timmy, Age 8', title: 'Box-Opening Officer', face: 'kidpres' },
        { name: 'Auntie Sam', title: 'Speaker of Everything', face: 'auntsam' }
      ],
      next: null
    },
    {
      // Rotating event slot (world index 5). js/events-data.js swaps the active 3-day event in here;
      // this placeholder only keeps the shape valid until it loads.
      id: 'event', event: true, name: 'Freedom Fest', title: 'Fireworks, floats and freedom',
      currency: 'Fest Bucks', sym: 'F$', bg: 'assets/worlds/event.jpg',
      prestigeName: '', prestigeShort: '', prestigeVerb: '', prestigeScale: Infinity,
      eventCatcher: 'eagle', theme: 'fest', mechanic: null, accent: '#f5c518', intro: '',
      businesses: [],
      managers: [],
      next: null
    }
  ];

  var EVENT_INDEX = 5;
  var MAIN_WORLDS = 5;
  // Event content, calendar and reward tiers: js/events-data.js (GameData.EVENTS, EVENT_TIERS).
  var BADGE_BONUS = 0.10; // each Liberty Badge: +10% profit everywhere, forever

  WORLDS.forEach(function (w, wi) {
    w.index = wi;
    w.businesses.forEach(function (b, i) {
      b.icon = 'assets/icons/w' + (wi + 1) + '_b' + (i + 1) + '.png';
      b.managerCost = b.cost * MANAGER_RATIO[i];
      b.chiefCost = b.managerCost * 1e8;
      w.managers[i].cost = b.managerCost;
    });
  });

  // ---- Milestones (per business, by units owned) ----
  var MILESTONES = [];
  [25, 50, 100, 200, 300, 400].forEach(function (n) { MILESTONES.push({ at: n, speed: 2 }); });
  for (var n = 500; n <= 1000; n += 100) MILESTONES.push({ at: n, profit: 3 });
  for (n = 1100; n <= 2000; n += 100) MILESTONES.push({ at: n, profit: 2 });
  // Late milestones are split in two (same total multiplier) so the long gaps above 2,000 pay out twice as often.
  for (n = 2250; n <= 5000; n += 250) { MILESTONES.push({ at: n - 125, profit: 1.5 }); MILESTONES.push({ at: n, profit: 2 }); }
  for (n = 5500; n <= 10000; n += 500) { MILESTONES.push({ at: n - 250, profit: 2 }); MILESTONES.push({ at: n, profit: 2.5 }); }

  // Icon frame tiers, by milestones reached.
  var FRAME_TIERS = [
    { at: 0, name: 'basic' }, { at: 25, name: 'bronze' }, { at: 100, name: 'silver' },
    { at: 400, name: 'gold' }, { at: 1000, name: 'platinum' }, { at: 2500, name: 'diamond' }
  ];

  // "Every business" milestones — applies to all businesses in the world.
  var ALL_MILESTONES = [];
  [25, 50, 100, 150, 200, 250, 300, 350, 400].forEach(function (n) { ALL_MILESTONES.push({ at: n, profit: 2 }); });
  for (n = 500; n <= 1000; n += 100) ALL_MILESTONES.push({ at: n, profit: 3 });
  for (n = 1250; n <= 5000; n += 250) ALL_MILESTONES.push({ at: n, profit: 4 });

  var UPGRADE_ADJ = ['Deluxe', 'Patriotic', 'Star-Spangled', 'Freedom-Grade', 'Bipartisan', 'Executive', 'Federal', 'Constitutional', 'Manifest', 'Liberty-Class', 'Hyper-American', 'Transcendent', 'Omni-Patriotic', 'Eternal'];
  var UPGRADE_ALL_NAMES = ['Tax Cut for Everyone', 'Infrastructure Bill', 'National Holiday', 'Stimulus Check', 'New Deal 2.0', 'Great Society Plus', 'Marshall Plan (Space)', 'Freedom Act', 'Liberty Surplus', 'Eagle Standard', 'Hyper-Budget', 'The Grand Omnibus', 'Manifest Everything Act', 'Eternal Surplus'];
  function roman(n) { return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'][n - 1] || String(n); }

  // ---- Cash upgrades: rounds of (businesses + "everything") ×3 ----
  function cashUpgrades(w, wi) {
    var list = [], nb = w.businesses.length, per = nb + 1;
    var rounds = w.event ? 5 : 14;
    var shift = w.event ? -0.6 : [0, 0.3, 1.0, 1.8, 2.6][wi];
    var C0 = 2.5e5 * Math.pow(10, shift);
    var a = w.event ? 0.45 : 0.28, q = w.event ? 0.004 : 0.0085;
    for (var j = 0; j < rounds * per; j++) {
      var target = j % per;
      var round = Math.floor(j / per);
      list.push({
        id: 'c' + wi + '_' + j,
        cost: C0 * Math.pow(10, a * j + q * j * j),
        target: target === nb ? 'all' : target,
        mult: 3, round: round,
        name: target === nb ? UPGRADE_ALL_NAMES[round % UPGRADE_ALL_NAMES.length] : UPGRADE_ADJ[round % UPGRADE_ADJ.length] + ' ' + w.businesses[target].name
      });
    }
    if (!w.event) {
      for (var k = 0; k < 10; k++) {
        list.push({ id: 'ce' + wi + '_' + k, cost: C0 * Math.pow(10, 4 + k * 22), target: 'angel', add: 0.01 + (k >= 5 ? 0.01 : 0),
          tpl: 'Campaign Finance Reform {r}', r: k + 1, name: 'Campaign Finance Reform ' + roman(k + 1) });
      }
    }
    list.sort(function (x, y) { return x.cost - y.cost; });
    return list;
  }

  // ---- Prestige (angel) upgrades, paid by sacrificing prestige currency ----
  function angelUpgrades(w, wi) {
    var list = [];
    if (w.event) return list;
    var j = 0;
    function push(u) { u.id = 'a' + wi + '_' + list.length; u.cost = 1e4 * Math.pow(10, 0.9 * j + 0.055 * j * j); j++; list.push(u); }
    for (var r = 0; r < 4; r++) {
      push({ target: 'angel', add: 0.02 + 0.01 * r, tpl: 'Grassroots Campaign {r}', r: r + 1, name: 'Grassroots Campaign ' + roman(r + 1) });
      for (var i = 0; i < 10; i++) {
        if ((i + r) % 2 === 0) push({ target: i, mult: 3, tpl: 'Lobbyist for {biz}', name: 'Lobbyist for ' + w.businesses[i].name });
        else push({ target: i, free: 10 + r * 15, tpl: 'Federal Grant: {biz}', name: 'Federal Grant: ' + w.businesses[i].name });
      }
      push({ target: 'all', mult: 5, tpl: 'Landslide Victory {r}', r: r + 1, name: 'Landslide Victory ' + roman(r + 1) });
    }
    return list;
  }

  // ---- Missions: sequential goals per main world, 3 shown at a time ----
  // v1.0 list (ids were positions: 'm<wi>_<k>'). Kept only to migrate old saves to the stable ids below.
  function legacyMissions(w, wi) {
    var list = [];
    var T = [10, 25, 50, 100, 150, 200, 300, 400, 500, 750, 1000];
    w.businesses.forEach(function (b, i) {
      T.forEach(function (n) { list.push({ kind: 'own', biz: i, n: n, est: b.cost * Math.pow(b.coef, n) / (b.coef - 1) / 10 }); });
      list.push({ kind: 'hire', biz: i, n: 1, est: b.managerCost * 2 });
    });
    [1, 5, 10, 20, 35, 50, 75, 100].forEach(function (n) { var u = w.cashUpgrades[n - 1]; if (u) list.push({ kind: 'upgrades', n: n, est: u.cost * 2 }); });
    [1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e25, 1e30, 1e40, 1e50].forEach(function (n) { list.push({ kind: 'earn', n: n, est: n }); });
    [25, 50, 100, 200, 400].forEach(function (n) { var worst = w.businesses[w.businesses.length - 1]; list.push({ kind: 'all', n: n, est: worst.cost * Math.pow(worst.coef, n) / (worst.coef - 1) }); });
    [1, 3, 5, 10].forEach(function (n) { list.push({ kind: 'elect', n: n, est: w.prestigeScale * Math.pow(4, n) }); });
    list.sort(function (x, y) { return x.est - y.est; });
    var map = {};
    list.forEach(function (m, k) { map['m' + wi + '_' + k] = missionId(wi, m); });
    return map;
  }
  function missionId(wi, m) { return 'm' + wi + '.' + m.kind + '.' + (m.biz != null ? m.biz + '.' : '') + m.n; }
  // Lifetime earnings needed to have attracted n prestige currency in total.
  function prestigeEst(w, n) { return w.prestigeScale * Math.pow(n / 150, 2); }

  // ~450 per world, from the first minutes to the far end of the game (lifetime 1e300, 10,000 of everything).
  function missions(w, wi) {
    var list = [], nb = w.businesses.length, worst = w.businesses[nb - 1];
    var OWN = [10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 750, 900, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 7500, 10000];
    w.businesses.forEach(function (b, i) {
      OWN.forEach(function (n) { list.push({ kind: 'own', biz: i, n: n, est: b.cost * Math.pow(b.coef, n) / (b.coef - 1) / 10 }); });
      list.push({ kind: 'hire', biz: i, n: 1, est: b.managerCost * 2 });
      list.push({ kind: 'chief', biz: i, n: 1, est: b.chiefCost * 3 });
    });
    [1, 5, 10, 20, 35, 50, 75, 100, 125, 150, w.cashUpgrades.length].forEach(function (n) {
      var u = w.cashUpgrades[n - 1];
      if (u) list.push({ kind: 'upgrades', n: n, est: u.cost * 2 });
    });
    var ten = function (x) { return Number('1e' + x); };
    for (var e = 3; e <= 300; e += e < 30 ? 3 : e < 100 ? 5 : 10) list.push({ kind: 'earn', n: ten(e), est: ten(e) });
    list.push({ kind: 'earn', n: 1e25, est: 1e25 }); // kept from v1.0
    for (e = 2; e <= 290; e += e < 30 ? 2 : e < 100 ? 5 : 10) list.push({ kind: 'income', n: ten(e), est: ten(e) * 3600 });
    [25, 50, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000, 7500, 10000].forEach(function (n) {
      list.push({ kind: 'all', n: n, est: worst.cost * Math.pow(worst.coef, n) / (worst.coef - 1) });
    });
    [1, 3, 5, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200].forEach(function (n) { list.push({ kind: 'elect', n: n, est: w.prestigeScale * Math.pow(4, Math.min(n, 10)) * Math.pow(1.6, Math.max(0, n - 10)) }); });
    for (e = 2; e <= 150; e += e < 20 ? 1 : e < 60 ? 4 : 10) list.push({ kind: 'angels', n: ten(e), est: prestigeEst(w, ten(e)) });
    [1, 5, 10, 20, 30, 40, w.angelUpgrades.length].forEach(function (n) {
      var u = w.angelUpgrades[n - 1];
      if (u) list.push({ kind: 'promises', n: n, est: prestigeEst(w, u.cost * 2) });
    });
    list.sort(function (x, y) { return x.est - y.est; });
    list.forEach(function (m) {
      m.id = missionId(wi, m);
      m.reward = Math.max(1, Math.min(30, Math.round(Math.log10(Math.max(10, m.est)) / 3)));
    });
    return list;
  }
  var LEGACY_MISSIONS = [];

  WORLDS.forEach(function (w, wi) {
    w.cashUpgrades = cashUpgrades(w, wi);
    w.angelUpgrades = angelUpgrades(w, wi);
    w.missions = w.event ? [] : missions(w, wi);
    LEGACY_MISSIONS[wi] = w.event ? {} : legacyMissions(w, wi);
  });

  // ---- Daily login rewards (7-day cycle) ----
  var DAILY = [
    { lb: 5, icon: '★' }, { speech: 4 * 3600, icon: '🎤' }, { lb: 10, icon: '★' }, { warp: 3600, icon: '⏩' },
    { lb: 20, icon: '★' }, { rally: 900, icon: '📣' }, { lb: 50, badge: 0, icon: '🏆' }
  ];

  // ---- Reality Anchor (Multiverse mechanic) ----
  var ANCHOR = { world: 4, max: 10, stepMin: 6 };  // ×1 more every 6 minutes, up to ×10

  // ---- Constitutional Convention (second prestige) ----
  var CONVENTION = {
    requires: 3,        // Known Universe unlocked
    scoreDiv: 60,       // amendments = floor((Σ log10(lifetime) / scoreDiv)^2)
    profitPer: 0.25,    // each amendment multiplies all profit by (1 + profitPer)
    angelPer: 0.005     // … and adds +0.5% prestige effectiveness
  };

  // ---- Achievements ----
  var ACHIEVEMENTS = [];
  var BIZ_ACH = [25, 50, 100, 200, 300, 400, 500, 1000, 2000, 5000];
  var LIFE_ACH = [1e6, 1e9, 1e12, 1e15, 1e18, 1e24, 1e36, 1e50, 1e75, 1e100, 1e150, 1e200, 1e250, 1e300];
  WORLDS.forEach(function (w, wi) {
    if (w.event) return;
    w.businesses.forEach(function (b, i) {
      BIZ_ACH.forEach(function (n) {
        ACHIEVEMENTS.push({ id: 'b' + wi + '_' + i + '_' + n, world: wi, kind: 'biz', biz: i, n: n, tpl: 'bizach', reward: n >= 1000 ? 5 : n >= 400 ? 2 : 1 });
      });
    });
    [1, 25, 50, 100, 200, 300, 400, 500, 1000].forEach(function (n) {
      ACHIEVEMENTS.push({ id: 'all' + wi + '_' + n, world: wi, kind: 'all', n: n, tpl: 'allach', reward: n >= 400 ? 5 : 2 });
    });
    LIFE_ACH.forEach(function (n, k) {
      ACHIEVEMENTS.push({ id: 'life' + wi + '_' + k, world: wi, kind: 'life', n: n, k: k, tpl: 'lifeach', reward: 3 });
    });
    ACHIEVEMENTS.push({ id: 'mgr' + wi, world: wi, kind: 'managers', tpl: 'mgrach', reward: 10 });
    ACHIEVEMENTS.push({ id: 'chief' + wi, world: wi, kind: 'chiefs', tpl: 'chiefach', reward: 25 });
    [1, 5, 10].forEach(function (n) {
      ACHIEVEMENTS.push({ id: 'elect' + wi + '_' + n, world: wi, kind: 'elections', n: n, tpl: 'electach', reward: 5 });
    });
    if (wi > 0) ACHIEVEMENTS.push({ id: 'world' + wi, world: wi, kind: 'world', tpl: 'worldach', reward: 20 });
  });
  [10, 100, 1000, 10000].forEach(function (n) { ACHIEVEMENTS.push({ id: 'click' + n, kind: 'clicks', n: n, tpl: 'clickach', reward: 2 }); });
  [1, 10, 50, 200].forEach(function (n) { ACHIEVEMENTS.push({ id: 'catch' + n, kind: 'catches', n: n, tpl: 'catchach', reward: 3 }); });
  [1, 10, 50].forEach(function (n) { ACHIEVEMENTS.push({ id: 'speech' + n, kind: 'speeches', n: n, tpl: 'speechach', reward: 2 }); });
  [7, 30, 100].forEach(function (n) { ACHIEVEMENTS.push({ id: 'streak' + n, kind: 'daily', n: n, tpl: 'dailyach', reward: 10 }); });
  [1, 5, 20].forEach(function (n) { ACHIEVEMENTS.push({ id: 'badge' + n, kind: 'badges', n: n, tpl: 'badgeach', reward: 10 }); });
  [1, 3, 10].forEach(function (n) { ACHIEVEMENTS.push({ id: 'conv' + n, kind: 'conventions', n: n, tpl: 'convach', reward: 50 }); });
  [10, 50, 150].forEach(function (n) { ACHIEVEMENTS.push({ id: 'mission' + n, kind: 'missions', n: n, tpl: 'missionach', reward: 5 }); });

  // ---- Freedom Store (Liberty Bucks) ----
  var STORE = [
    { id: 'warp1h', name: 'Time Warp: 1 Hour', desc: 'Instantly collect 1 hour of managed earnings on the current world.', cost: 5, warp: 3600, icon: '⏩' },
    { id: 'warp1d', name: 'Time Warp: 1 Day', desc: 'Instantly collect 24 hours of managed earnings on the current world.', cost: 40, warp: 86400, icon: '⏭️' },
    { id: 'warp7d', name: 'Time Warp: 1 Week', desc: 'Instantly collect 7 days of managed earnings on the current world.', cost: 200, warp: 604800, icon: '🚀' },
    { id: 'rally', name: 'Mega Rally', desc: '×10 profit on every main world for 15 minutes.', cost: 15, rally: 900, icon: '📣' },
    { id: 'perm', name: 'Freedom Multiplier', desc: 'Permanent ×2 profit on every main world (not in events). Stacks! Price doubles each purchase.', cost: 100, perm: 2, icon: '🦅' }
  ];

  // ---- Real-money products (StoreKit). IDs must match App Store Connect. ----
  var IAP_PREFIX = 'com.aarondavidrogers.starspangledtycoon.';
  var IAP = [
    { id: IAP_PREFIX + 'lb100', type: 'consumable', lb: 100, name: 'Pocket of Liberty', icon: '★', fallbackPrice: '$0.99' },
    { id: IAP_PREFIX + 'lb550', type: 'consumable', lb: 550, name: 'Bag of Liberty', icon: '💰', fallbackPrice: '$4.99', tag: '+10%' },
    { id: IAP_PREFIX + 'lb1200', type: 'consumable', lb: 1200, name: 'Vault of Liberty', icon: '🏦', fallbackPrice: '$9.99', tag: '+20%' },
    { id: IAP_PREFIX + 'lb3200', type: 'consumable', lb: 3200, name: 'Fort Knox', icon: '🏰', fallbackPrice: '$19.99', tag: 'Best value' },
    { id: IAP_PREFIX + 'founding', type: 'nonconsumable', perm: 3, noAds: true, lb: 250, name: 'Founding Fathers Pack', icon: '📜', fallbackPrice: '$4.99',
      desc: 'Permanent ×3 profit on every main world, no ads ever (all ad rewards are free), and 250 ★.' }
  ];

  // Rewarded-ad placements. With the Founding Pack these rewards are granted without an ad.
  var AD_REWARDS = {
    speech: { name: 'Stump Speech' },
    offline: { name: 'Double offline earnings' },
    freelb: { name: 'Free Liberty Bucks', lb: 3, perDay: 5 }
  };

  var NEWS = [
    [
      'Local eagle files for small business loan',
      'Congress agrees on something; historians baffled',
      'Apple pie futures hit all-time high',
      'Fireworks now legally classified as a food group',
      'Monster truck elected to county school board',
      'Cable news anchor reports on self reporting on self',
      'Fed prints commemorative trillion-dollar bill, spends it on snacks',
      'Launchpad intern asks "what if we just… went?"',
      'Poll: 97% of Americans want a flag on the Moon. The other 3% want two',
      'Bald eagle population surpasses human population in Ohio'
    ],
    [
      'Moon declared the 51st state; cartographers furious',
      'Martian cattle refuse to moo in low gravity',
      'Asteroid belt rebranded "Asteroid Suspenders" for extra hold',
      'Jupiter gas prices soar to $4.99 per cubic kilometer',
      'Saturn ring resort wins "Most Rings" award again',
      'Dyson Sphere construction delayed by permit dispute with the Sun',
      'Pluto reinstated as planet in exchange for tax incentives',
      'Venus weather forecast: 900°F and freedom'
    ],
    [
      'Aliens confused by electoral college; so are we',
      'Clone Senate passes bill 100–0, again, forever',
      'Black hole casino reports record losses — for everyone but the house',
      'Nebula paint recall: "Cosmic Beige" found to be actual beige',
      'Galactic Congress filibuster enters third millennium',
      'Space cowboy lassos a moon; moon unimpressed',
      'Wormhole toll road adds carpool lane for binary stars'
    ],
    [
      'Universe expands; property taxes expand faster',
      'Big Bang reenactment sells out every seat in every dimension',
      'Admin console found running on a very old operating system',
      'Entropy Insurance denies claim citing "act of physics"',
      'Multiverse bank reports you are rich in 42% of realities',
      'Time tourists spoil the ending of history',
      'Constitution amended to include "and also everything else"'
    ],
    [
      'Local man meets 4,000 versions of himself; all of them owe him money',
      'Butterfly flaps wings in Ohio; stock markets in 9 realities soar',
      'Evil twin of the Treasury Secretary files taxes early, is praised',
      'Timeline where the Moon is cheese reports record dairy exports',
      'Schrödinger\'s Deli sandwich both recalled and not recalled',
      'Omniversal Congress passes bill in 11 dimensions, vetoes it in 3',
      'Scientists confirm: every reality still arguing about daylight saving time',
      'Infinite monkeys finish Hamlet; demand royalties'
    ],
    [
      'A new event is in town!'
    ]
  ];

  var ADVISOR_TIPS = [
    'Buy 25 of a business to double its speed. Milestones stack!',
    'Managers run businesses for you — even while you sleep.',
    'Holding an Election resets your businesses but earns Donors. Each Donor boosts profit by 2%!',
    'Catch the flying bonus for cash or Liberty Bucks!',
    'Give a Stump Speech for ×2 profit. Speeches stack up to 24 hours.',
    'Cabinet Secretaries make a business 90% cheaper to expand.',
    'Every world earns in the background. Launching a new world gives the previous one a permanent ×5 Colonial Tribute!',
    'Complete Missions for Liberty Bucks. Three are active at a time.',
    'A new event starts every 3 days. Its reward tiers pay Liberty Bucks, Time Warps, Library cards and permanent Liberty Badges.'
  ];

  root.GameData = {
    WORLDS: WORLDS, MAIN_WORLDS: MAIN_WORLDS, EVENT_INDEX: EVENT_INDEX, MANAGER_RATIO: MANAGER_RATIO, buildCashUpgrades: cashUpgrades,
    BADGE_BONUS: BADGE_BONUS, MILESTONES: MILESTONES, ALL_MILESTONES: ALL_MILESTONES, FRAME_TIERS: FRAME_TIERS,
    ACHIEVEMENTS: ACHIEVEMENTS, LEGACY_MISSIONS: LEGACY_MISSIONS, STORE: STORE, IAP: IAP, AD_REWARDS: AD_REWARDS, DAILY: DAILY, CONVENTION: CONVENTION, ANCHOR: ANCHOR,
    NEWS: NEWS, ADVISOR_TIPS: ADVISOR_TIPS, TRIBUTE: 5, roman: roman, UPGRADE_ADJ: UPGRADE_ADJ, UPGRADE_ALL_NAMES: UPGRADE_ALL_NAMES
  };
})(typeof window !== 'undefined' ? window : globalThis);
