/* Crackle & Pour — central game state + event bus */
(function () {
  'use strict';

  /* tiny event bus */
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
    upgrades: { grinder: 0, roaster: 0, steamer: 0, decor: 0, register: 0 },
    unlocked: { recipes: [], roasts: [], syrups: [], toppings: [] },
    stats: { servedTotal: 0, bestDrink: 0, dayHistory: [] },
    service: null
  };

  CG.resetService = function (day) {
    CG.state.service = {
      clock: 0,
      dayLength: CG.data.dayLength(day),
      closed: false,
      spawnQueue: [],      // [{at, customer}] built by customers.startDay
      customers: [],       // live Customer objects
      tickets: [],
      nextId: 1,
      activeStation: 'order',
      selectedTicketId: null,
      roastInventory: { light: 0, medium: 6, dark: 0 }, // a starter batch of medium each morning
      roastQuality: { light: null, medium: 70, dark: null },
      holding: { brew: null, milk: null }, // {ticketId, type, score}
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
    s.upgrades = { grinder: 0, roaster: 0, steamer: 0, decor: 0, register: 0 };
    s.unlocked = { recipes: [], roasts: [], syrups: [], toppings: [] };
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
    if (patience > 66) return '#81b29a';
    if (patience > 33) return '#f2cc8f';
    if (patience > 10) return '#e09f3e';
    return '#d75a4a';
  };

  CG.upgradeValue = function (key) {
    var u = CG.data.UPGRADES[key];
    return u.values[CG.state.upgrades[key] || 0];
  };
})();
