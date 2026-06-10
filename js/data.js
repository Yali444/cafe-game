/* Crackle & Pour — game data & balance constants */
var CG = window.CG || {};

CG.data = (function () {
  'use strict';

  var ROASTS = {
    light:  { name: 'Light',  color: '#c69c6d', center: 4.6, order: 0 },
    medium: { name: 'Medium', color: '#8d5a2b', center: 6.2, order: 1 },
    dark:   { name: 'Dark',   color: '#4a2c17', center: 7.8, order: 2 }
  };
  var ROAST_TOTAL = 9.2;     // seconds for marker to reach top
  var ROAST_BURN = 8.8;      // past this = burnt batch
  var ROAST_BATCH_UNITS = 6; // inventory units per batch
  var ROAST_CAP = 12;        // max units per roast level

  // milk targets: [center, halfBand] in %
  var RECIPES = {
    espresso:   { name: 'Espresso',      price: 3.0, brew: 'espresso', milk: null, water: false, choc: 0, syrupOk: false, toppingsOk: [], complexity: 1 },
    americano:  { name: 'Americano',     price: 3.5, brew: 'espresso', milk: null, water: true,  choc: 0, syrupOk: true,  toppingsOk: [], complexity: 2 },
    pourover:   { name: 'Pour-Over',     price: 4.5, brew: 'pourover', milk: null, water: false, choc: 0, syrupOk: false, toppingsOk: [], complexity: 3 },
    latte:      { name: 'Latte',         price: 4.5, brew: 'espresso', milk: { temp: [78, 10], foam: [22, 13] }, water: false, choc: 0, syrupOk: true, toppingsOk: ['whip', 'cocoa', 'cinnamon'], complexity: 4 },
    cappuccino: { name: 'Cappuccino',    price: 4.5, brew: 'espresso', milk: { temp: [70, 10], foam: [68, 13] }, water: false, choc: 0, syrupOk: true, toppingsOk: ['cocoa', 'cinnamon'], complexity: 4 },
    mocha:      { name: 'Mocha',         price: 5.0, brew: 'espresso', milk: { temp: [75, 10], foam: [45, 13] }, water: false, choc: 2, syrupOk: false, toppingsOk: ['whip', 'cocoa'], complexity: 5 },
    hotchoc:    { name: 'Hot Chocolate', price: 4.0, brew: null,       milk: { temp: [75, 10], foam: [30, 13] }, water: false, choc: 2, syrupOk: false, toppingsOk: ['whip', 'cinnamon'], complexity: 3 }
  };

  var SIZES = { S: { name: 'Small', mod: -0.5 }, M: { name: 'Medium', mod: 0 }, L: { name: 'Large', mod: 1 } };

  var SYRUPS = {
    vanilla:  { name: 'Vanilla',  color: '#f2e4c4' },
    caramel:  { name: 'Caramel',  color: '#cd8b3e' },
    hazelnut: { name: 'Hazelnut', color: '#a9744f' }
  };
  var CHOC = { name: 'Chocolate', color: '#5a3219' }; // build-station sauce, not an unlockable syrup

  var TOPPINGS = {
    whip:     { name: 'Whipped Cream', kind: 'ring' },
    cocoa:    { name: 'Cocoa Dust',    kind: 'shake', color: '#6b4226' },
    cinnamon: { name: 'Cinnamon Dust', kind: 'shake', color: '#b5651d' }
  };

  // 8 recurring customers
  var CHARACTERS = {
    mabel:  { name: 'Mabel',  skin: '#f3c9a5', hair: 'bun',      hairColor: '#cfcfcf', top: '#c79ab5', accessory: 'glasses',
              patienceMult: 1.4, prefersNewest: true },
    dex:    { name: 'Dex',    skin: '#c98e5a', hair: 'beanie',   hairColor: '#37474f', top: '#8fa8b8', accessory: 'headphones',
              patienceMult: 0.7, only: ['espresso', 'americano'] },
    priya:  { name: 'Priya',  skin: '#b5763f', hair: 'pony',     hairColor: '#2d2026', top: '#7da7cc', accessory: 'none',
              patienceMult: 1.0, tipBonusAt90: 0.3 },
    hank:   { name: 'Hank',   skin: '#e8b88a', hair: 'short',    hairColor: '#6d4c41', top: '#e08e7a', accessory: 'mustache',
              patienceMult: 1.0, forceRoast: 'dark' },
    junie:  { name: 'Junie',  skin: '#f7d6b3', hair: 'pigtails', hairColor: '#e67e22', top: '#f7dd88', accessory: 'freckles',
              patienceMult: 1.0, sweet: true },
    theo:   { name: 'Theo',   skin: '#d9a06b', hair: 'curly',    hairColor: '#3e2723', top: '#6aa893', accessory: 'scarf',
              patienceMult: 1.0, only: ['pourover'], minDay: 4 },
    rosa:   { name: 'Rosa',   skin: '#cc8855', hair: 'flower',   hairColor: '#1b1b1b', top: '#f0a18a', accessory: 'none',
              patienceMult: 1.0, patienceFloor: 25 },
    marcus: { name: 'Marcus', skin: '#8d5a3b', hair: 'bald',     hairColor: '#000000', top: '#7c8aa0', accessory: 'phone',
              patienceMult: 1.0, prefersComplex: true }
  };

  // applied at the START of the listed day
  var UNLOCKS = {
    1: { recipes: ['espresso', 'americano'], roasts: ['medium'], syrups: ['vanilla'], toppings: [] },
    2: { recipes: ['latte'] },
    3: { roasts: ['dark'], syrups: ['caramel'], toppings: ['cocoa'] },
    4: { recipes: ['pourover'] },
    5: { recipes: ['cappuccino'], toppings: ['whip'] },
    6: { roasts: ['light'], syrups: ['hazelnut'] },
    7: { recipes: ['mocha'] },
    8: { recipes: ['hotchoc'], toppings: ['cinnamon'] }
  };

  var UPGRADES = {
    grinder:  { name: 'Burr Grinder', icon: 'brew',  costs: [25, 60], max: 2,
                desc: 'Wider grind sweet-spot', values: [0.22, 0.30, 0.38] },
    roaster:  { name: 'Drum Roaster', icon: 'roast', costs: [30, 70], max: 2,
                desc: 'Wider roast drop window', values: [0.7, 0.9, 1.1] },
    steamer:  { name: 'Steam Wand',   icon: 'milk',  costs: [30, 70], max: 2,
                desc: 'Slower, easier steaming', values: [1, 0.85, 0.7] },
    decor:    { name: 'Cozy Decor',   icon: 'build', costs: [40, 90], max: 2,
                desc: 'Customers wait happily longer', values: [1, 0.9, 0.8] },
    register: { name: 'Smart Register', icon: 'order', costs: [50], max: 1,
                desc: 'Auto-greets the next customer', values: [0, 1] }
  };

  var TIP_RATES = [0, 0, 0.05, 0.10, 0.18, 0.25]; // index by stars 1..5

  function dayCustomerCount(day) { return Math.min(4 + day, 14); }
  function dayLength(day) { return Math.min(120 + day * 20, 360); }
  function patienceSeconds(day) { return Math.min(45 + day * 5, 75); }

  function priceOf(ticket) {
    var p = RECIPES[ticket.recipe].price + SIZES[ticket.size].mod;
    p += 0.5 * ticket.extras.length + 0.5 * ticket.toppings.length;
    return Math.round(p * 100) / 100;
  }

  function starsFor(score) {
    if (score >= 95) return 5;
    if (score >= 85) return 4;
    if (score >= 70) return 3;
    if (score >= 50) return 2;
    return 1;
  }

  // mutates state.unlocked; returns list of human-readable new unlock names
  function applyUnlocks(state, day) {
    var u = UNLOCKS[day];
    if (!u) return [];
    var fresh = [];
    (u.recipes || []).forEach(function (r) {
      if (state.unlocked.recipes.indexOf(r) < 0) { state.unlocked.recipes.push(r); fresh.push(RECIPES[r].name); }
    });
    (u.roasts || []).forEach(function (r) {
      if (state.unlocked.roasts.indexOf(r) < 0) { state.unlocked.roasts.push(r); fresh.push(ROASTS[r].name + ' Roast'); }
    });
    (u.syrups || []).forEach(function (s) {
      if (state.unlocked.syrups.indexOf(s) < 0) { state.unlocked.syrups.push(s); fresh.push(SYRUPS[s].name + ' Syrup'); }
    });
    (u.toppings || []).forEach(function (t) {
      if (state.unlocked.toppings.indexOf(t) < 0) { state.unlocked.toppings.push(t); fresh.push(TOPPINGS[t].name); }
    });
    return fresh;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function fmtMoney(n) { return '$' + n.toFixed(2).replace(/\.00$/, ''); }

  return {
    ROASTS: ROASTS, ROAST_TOTAL: ROAST_TOTAL, ROAST_BURN: ROAST_BURN,
    ROAST_BATCH_UNITS: ROAST_BATCH_UNITS, ROAST_CAP: ROAST_CAP,
    RECIPES: RECIPES, SIZES: SIZES, SYRUPS: SYRUPS, CHOC: CHOC, TOPPINGS: TOPPINGS,
    CHARACTERS: CHARACTERS, UNLOCKS: UNLOCKS, UPGRADES: UPGRADES, TIP_RATES: TIP_RATES,
    dayCustomerCount: dayCustomerCount, dayLength: dayLength, patienceSeconds: patienceSeconds,
    priceOf: priceOf, starsFor: starsFor, applyUnlocks: applyUnlocks,
    clamp: clamp, fmtMoney: fmtMoney
  };
})();
window.CG = CG;
