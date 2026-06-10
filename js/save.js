/* Crackle & Pour — localStorage persistence */
CG.save = (function () {
  'use strict';

  var KEY = 'cafegame.save.v1';

  function migrate(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (raw.v !== 1) return null; // future versions default fields here
    if (typeof raw.day !== 'number' || typeof raw.money !== 'number') return null;
    // defensive defaults so older/partial saves never crash
    raw.upgrades = raw.upgrades || { grinder: 0, roaster: 0, steamer: 0, decor: 0, register: 0 };
    raw.unlocked = raw.unlocked || { recipes: [], roasts: [], syrups: [], toppings: [] };
    raw.stats = raw.stats || { servedTotal: 0, bestDrink: 0, dayHistory: [] };
    raw.settings = raw.settings || { muted: false };
    return raw;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return migrate(JSON.parse(raw));
    } catch (e) { return null; }
  }

  function persist() {
    var s = CG.state;
    try {
      localStorage.setItem(KEY, JSON.stringify({
        v: 1,
        day: s.day,
        money: s.money,
        upgrades: s.upgrades,
        unlocked: s.unlocked,
        stats: s.stats,
        settings: { muted: CG.audio.isMuted() },
        savedAt: new Date().toISOString()
      }));
    } catch (e) { /* storage full / private mode — play on without saving */ }
  }

  function wipe() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  function exists() { return load() !== null; }

  return { load: load, save: persist, wipe: wipe, exists: exists };
})();
