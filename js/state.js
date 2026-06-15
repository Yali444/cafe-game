/* Kopi — central game state + event bus */
(function () {
  'use strict';

  var listeners = {};
  CG.events = {
    on: function (name, fn) { (listeners[name] = listeners[name] || []).push(fn); },
    emit: function (name) {
      var args = Array.prototype.slice.call(arguments, 1);
      (listeners[name] || []).forEach(function (fn) { fn.apply(null, args); });
    }
  };

  CG.state = {
    screen: 'title',
    paused: false,
    day: 1,
    money: 0,
    upgrades: { grinder: 0, roaster: 0, kettle: 0, pitcher: 0, decor: 0, host: 0 },
    unlocked: { recipes: [], origins: [] },
    stats: { servedTotal: 0, bestDrink: 0, dayHistory: [] },
    service: null
  };

  CG.resetService = function (day) {
    CG.state.service = {
      clock: 0,
      dayLength: CG.data.dayLength(day),
      closed: false,
      guestsTotal: CG.data.dayCustomerCount(day),
      guestsSpawned: 0,
      guestsServed: 0,
      pendingSpawn: 1.5,       // seconds until the next guest walks in (null = nobody pending)
      charQueue: [],           // shuffled charIds for the day
      customers: [],
      tickets: [],
      nextId: 1,
      activeStation: 'order',
      selectedTicketId: null,
      roastInventory: { colombia: 6, ethiopia: 5, kenya: 5 }, // a starter batch of every origin
      roastQuality: { colombia: 72, ethiopia: 70, kenya: 70 },
      batchCarafe: 0,          // cups left in the batch-brew carafe
      batchBrewedAt: null,     // service-clock time the carafe was last brewed (freshness)
      earnedToday: 0,
      tipsToday: 0,
      lostToday: 0,
      results: []
    };
  };

  CG.newGame = function () {
    var s = CG.state;
    s.day = 1;
    s.money = 0;
    s.upgrades = { grinder: 0, roaster: 0, kettle: 0, pitcher: 0, decor: 0, host: 0 };
    s.unlocked = { recipes: [], origins: [] };
    s.stats = { servedTotal: 0, bestDrink: 0, dayHistory: [] };
    s.service = null;
  };

  CG.loadGame = function (data) {
    var s = CG.state;
    s.day = data.day;
    s.money = data.money;
    s.upgrades = data.upgrades;
    s.unlocked = data.unlocked;
    s.stats = data.stats;
    s.service = null;
    CG.audio.setMuted(!!(data.settings && data.settings.muted));
  };

  CG.moodFor = function (patience) {
    if (patience > 66) return 'happy';
    if (patience > 33) return 'neutral';
    if (patience > 10) return 'annoyed';
    return 'angry';
  };

  CG.moodColor = function (patience) {
    if (patience > 66) return '#94a98c';
    if (patience > 33) return '#d9b87c';
    if (patience > 10) return '#cf9362';
    return '#c5705c';
  };

  CG.upgradeValue = function (key) {
    var u = CG.data.UPGRADES[key];
    return u.values[CG.state.upgrades[key] || 0];
  };
})();
