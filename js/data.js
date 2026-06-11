/* Kopi — specialty cafe & roastery: data & balance */
var CG = window.CG || {};

CG.data = (function () {
  'use strict';

  /* single-origin greens; each roasts to its own profile window */
  var ORIGINS = {
    colombia: { name: 'Colombia · Huila',        short: 'Colombia', notes: 'caramel · red apple · cocoa',
                roastCenter: 6.4, bean: '#7e5634', bag: '#a8b5a0', flavor: 'comforting' },
    ethiopia: { name: 'Ethiopia · Yirgacheffe',  short: 'Ethiopia', notes: 'jasmine · bergamot · peach',
                roastCenter: 4.8, bean: '#a87f4f', bag: '#c97f5d', flavor: 'floral' },
    kenya:    { name: 'Kenya · Nyeri AA',        short: 'Kenya',    notes: 'blackcurrant · grapefruit · brown sugar',
                roastCenter: 5.6, bean: '#8a5e38', bag: '#8f86a8', flavor: 'bright' }
  };
  var ROAST_TOTAL = 9.2;     // seconds for the roast curve
  var ROAST_BURN = 8.6;      // past this the batch is burnt
  var ROAST_BATCH_UNITS = 6;
  var ROAST_CAP = 12;
  var BATCH_ORIGIN = 'colombia'; // the house batch-brew bean
  var BATCH_CARAFE = 4;          // cups per batch carafe

  /* milk targets: [center, halfBand] in % — texture profiles per drink */
  var RECIPES = {
    espresso:  { name: 'Espresso',    price: 3.5, brew: 'espresso', milk: null, art: false, complexity: 1,
                 blurb: 'a straight shot' },
    batch:     { name: 'Batch Filter', price: 3.0, brew: 'batch',   milk: null, art: false, complexity: 1,
                 blurb: 'from the house carafe' },
    cortado:   { name: 'Cortado',     price: 4.0, brew: 'espresso', milk: { temp: [62, 9], foam: [14, 9] }, art: false, complexity: 3,
                 blurb: 'equal parts, gently warm' },
    flatwhite: { name: 'Flat White',  price: 4.5, brew: 'espresso', milk: { temp: [66, 8], foam: [24, 9] }, art: true, complexity: 4,
                 blurb: 'silky microfoam' },
    latte:     { name: 'Latte',       price: 5.0, brew: 'espresso', milk: { temp: [70, 8], foam: [34, 10] }, art: true, complexity: 4,
                 blurb: 'poured with care' },
    v60:       { name: 'V60 Pour-Over', price: 5.5, brew: 'v60',    milk: null, art: false, complexity: 5,
                 blurb: 'bloom, then slow spirals' },
    aeropress: { name: 'AeroPress',   price: 4.5, brew: 'aero',     milk: null, art: false, complexity: 4,
                 blurb: 'steeped and pressed' }
  };

  /* 8 regulars */
  var CHARACTERS = {
    mabel:  { name: 'Mabel',  skin: '#eec9a7', hair: 'bun',      hairColor: '#d8d3cb', top: '#b9a0ad',
              patienceMult: 1.4, prefersNewest: true },
    dex:    { name: 'Dex',    skin: '#c08a5c', hair: 'beanie',   hairColor: '#5b6770', top: '#8da0ab',
              patienceMult: 0.7, only: ['espresso', 'batch'] },
    priya:  { name: 'Priya',  skin: '#b5763f', hair: 'pony',     hairColor: '#3a2e33', top: '#7c98ad',
              patienceMult: 1.0, tipBonusAt90: 0.3 },
    hank:   { name: 'Hank',   skin: '#e2b186', hair: 'short',    hairColor: '#7a6248', top: '#c08a72', accessory: 'mustache',
              patienceMult: 1.0, forceOrigin: 'colombia' },
    junie:  { name: 'Junie',  skin: '#f2d2ae', hair: 'pigtails', hairColor: '#cd8d57', top: '#d9c08a', accessory: 'freckles',
              patienceMult: 1.0, only: ['latte', 'flatwhite', 'cortado'] },
    theo:   { name: 'Theo',   skin: '#d09c68', hair: 'curly',    hairColor: '#46362b', top: '#7fA38f', accessory: 'scarf',
              patienceMult: 1.0, only: ['v60'], minDay: 3 },
    rosa:   { name: 'Rosa',   skin: '#c48653', hair: 'flower',   hairColor: '#2e2a26', top: '#c97f5d',
              patienceMult: 1.0, patienceFloor: 25 },
    marcus: { name: 'Marcus', skin: '#8d5a3b', hair: 'bald',     hairColor: '#000000', top: '#6f7b8a', accessory: 'phone',
              patienceMult: 1.0, prefersComplex: true }
  };

  /* applied at the start of the listed day */
  var UNLOCKS = {
    1: { recipes: ['espresso', 'batch'], origins: ['colombia'] },
    2: { recipes: ['latte'] },
    3: { recipes: ['v60'], origins: ['ethiopia'] },
    4: { recipes: ['cortado'] },
    5: { recipes: ['flatwhite'] },
    6: { origins: ['kenya'] },
    7: { recipes: ['aeropress'] }
  };

  var UPGRADES = {
    grinder: { name: 'EK Grinder',     icon: 'brew',  costs: [25, 60], max: 2,
               desc: 'Wider dial-in sweet spot', values: [0.22, 0.30, 0.38] },
    roaster: { name: 'Drum Roaster',   icon: 'roast', costs: [30, 70], max: 2,
               desc: 'Wider profile drop window', values: [0.7, 0.9, 1.1] },
    kettle:  { name: 'Gooseneck Kettle', icon: 'kettle', costs: [30, 70], max: 2,
               desc: 'Steadier, slower pours', values: [1, 0.85, 0.72] },
    pitcher: { name: 'Steam Pitcher',  icon: 'milk',  costs: [30, 70], max: 2,
               desc: 'Calmer steaming gauges', values: [1, 0.85, 0.7] },
    decor:   { name: 'Warm Interior',  icon: 'build', costs: [40, 90], max: 2,
               desc: 'Guests wait more happily', values: [1, 0.9, 0.8] },
    host:    { name: 'Host Stand',     icon: 'order', costs: [50], max: 1,
               desc: 'Greets the next guest for you', values: [0, 1] }
  };

  var TIP_RATES = [0, 0, 0.05, 0.10, 0.18, 0.25]; // by stars 1..5

  function dayCustomerCount(day) { return Math.min(4 + day, 14); }
  function dayLength(day) { return Math.min(120 + day * 20, 360); }
  function patienceSeconds(day) { return Math.min(45 + day * 5, 75); }

  function priceOf(ticket) { return RECIPES[ticket.recipe].price; }

  function starsFor(score) {
    if (score >= 95) return 5;
    if (score >= 85) return 4;
    if (score >= 70) return 3;
    if (score >= 50) return 2;
    return 1;
  }

  function applyUnlocks(state, day) {
    var u = UNLOCKS[day];
    if (!u) return [];
    var fresh = [];
    (u.recipes || []).forEach(function (r) {
      if (state.unlocked.recipes.indexOf(r) < 0) { state.unlocked.recipes.push(r); fresh.push(RECIPES[r].name); }
    });
    (u.origins || []).forEach(function (o) {
      if (state.unlocked.origins.indexOf(o) < 0) { state.unlocked.origins.push(o); fresh.push(ORIGINS[o].name); }
    });
    return fresh;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function fmtMoney(n) { return '$' + n.toFixed(2).replace(/\.00$/, ''); }

  return {
    ORIGINS: ORIGINS, ROAST_TOTAL: ROAST_TOTAL, ROAST_BURN: ROAST_BURN,
    ROAST_BATCH_UNITS: ROAST_BATCH_UNITS, ROAST_CAP: ROAST_CAP,
    BATCH_ORIGIN: BATCH_ORIGIN, BATCH_CARAFE: BATCH_CARAFE,
    RECIPES: RECIPES, CHARACTERS: CHARACTERS, UNLOCKS: UNLOCKS, UPGRADES: UPGRADES, TIP_RATES: TIP_RATES,
    dayCustomerCount: dayCustomerCount, dayLength: dayLength, patienceSeconds: patienceSeconds,
    priceOf: priceOf, starsFor: starsFor, applyUnlocks: applyUnlocks,
    clamp: clamp, fmtMoney: fmtMoney
  };
})();
window.CG = CG;
