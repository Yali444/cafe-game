/* Crackle & Pour — game loop, day flow, station switching, boot */
CG.main = (function () {
  'use strict';

  var $ = function (sel) { return document.querySelector(sel); };
  var STATION_ORDER = ['order', 'roast', 'brew', 'milk', 'build'];
  var lastTs = 0;
  var hudTimer = 0;

  /* ---------- station switching ---------- */

  function switchStation(name) {
    var sv = CG.state.service;
    if (!sv || sv.activeStation === name && panelVisible(name)) { highlightTab(name); return; }
    var prev = CG.stations[sv.activeStation];
    if (prev && prev.exit) prev.exit();
    sv.activeStation = name;
    document.querySelectorAll('.station-panel').forEach(function (el) {
      el.classList.toggle('active', el.id === 'panel-' + name);
    });
    highlightTab(name);
    CG.audio.play('tap');
    var st = CG.stations[name];
    if (st && st.enter) st.enter();
  }

  function panelVisible(name) {
    var el = document.getElementById('panel-' + name);
    return el && el.classList.contains('active');
  }

  function highlightTab(name) {
    document.querySelectorAll('.tab-btn').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-station') === name);
    });
  }

  function updateBadges() {
    var sv = CG.state.service;
    if (!sv) return;
    setBadge('order', CG.customers.queued().length);
    var lowBeans = CG.state.unlocked.roasts.some(function (r) { return sv.roastInventory[r] <= 1; });
    setBadge('roast', lowBeans ? '!' : 0);
    setBadge('brew', CG.tickets.needing('brew').length + (sv.holding.brew ? 0 : 0));
    setBadge('milk', CG.tickets.needing('milk').length);
    var buildable = CG.tickets.open().filter(CG.tickets.readyToServe).length;
    setBadge('build', (sv.holding.brew || sv.holding.milk) ? '●' : buildable || 0);
  }

  function setBadge(station, val) {
    var b = document.querySelector('.tab-btn[data-station="' + station + '"] .badge');
    if (!b) return;
    if (!val) { b.classList.add('hidden'); return; }
    b.classList.remove('hidden');
    b.textContent = val;
  }

  /* ---------- day flow ---------- */

  function startDay() {
    var s = CG.state;
    CG.resetService(s.day);
    Object.keys(CG.stations).forEach(function (k) {
      if (CG.stations[k].resetDay) CG.stations[k].resetDay();
    });
    CG.customers.startDay();
    CG.tickets.renderStrip();
    CG.ui.setPaused(false, true);
    CG.ui.showScreen('service');
    switchStation('order');
    CG.stations.order.enter();
    CG.ui.updateHUD();
    updateBadges();
  }

  function showDayIntro() {
    var s = CG.state;
    var fresh = CG.data.applyUnlocks(s, s.day);
    CG.save.save();
    $('#intro-day').textContent = 'Day ' + s.day;
    $('#intro-info').innerHTML =
      '<p>' + CG.data.dayCustomerCount(s.day) + ' customers expected</p>' +
      (fresh.length ? '<p class="intro-new">NEW: ' + fresh.join(' · ') + '</p>' : '');
    CG.ui.showScreen('dayintro');
  }

  function endDay() {
    CG.audio.play('fanfare');
    CG.shop.renderSummary();
    CG.save.save();
    CG.ui.showScreen('summary');
  }

  function toTitle() {
    CG.state.service = null;
    refreshTitle();
    CG.ui.showScreen('title');
  }

  /* ---------- main loop ---------- */

  function frame(ts) {
    requestAnimationFrame(frame);
    var dt = Math.min((ts - lastTs) / 1000, 0.1);
    lastTs = ts;
    if (CG.state.screen !== 'service' || CG.state.paused || !CG.state.service) return;

    var sv = CG.state.service;
    sv.clock += dt;

    if (!sv.closed && sv.clock >= sv.dayLength) {
      sv.closed = true;
      CG.customers.closeDoors();
      CG.ui.toast('Closing time! Finish the open orders.');
    }

    CG.customers.update(dt);
    var st = CG.stations[sv.activeStation];
    if (st && st.update) st.update(dt);

    hudTimer += dt;
    if (hudTimer > 0.25) {
      hudTimer = 0;
      CG.ui.updateHUD();
      updateBadges();
    }

    // day complete: doors closed, queue cleared, every ticket served
    if (sv.closed &&
        CG.customers.unresolved().length === 0 &&
        sv.tickets.every(function (t) { return t.status === 'served'; }) &&
        sv.spawnQueue.length === 0) {
      endDay();
    }
  }

  /* ---------- title ---------- */

  function refreshTitle() {
    var has = CG.save.exists();
    $('#btn-continue').classList.toggle('hidden', !has);
    if (has) {
      var data = CG.save.load();
      $('#btn-continue').innerHTML = 'Continue — Day ' + data.day + ' · ' + CG.data.fmtMoney(data.money);
    }
  }

  function init() {
    $('#title-logo').innerHTML = CG.svg.logo();
    CG.ui.init();

    // stations build their panel DOM once
    STATION_ORDER.forEach(function (k) { CG.stations[k].init(); });

    // tab bar
    var bar = $('#tabbar');
    bar.innerHTML = STATION_ORDER.map(function (k) {
      var labels = { order: 'Order', roast: 'Roast', brew: 'Brew', milk: 'Milk', build: 'Serve' };
      return '<button class="tab-btn" data-station="' + k + '">' +
        CG.svg.icon(k) + '<span>' + labels[k] + '</span><span class="badge hidden"></span></button>';
    }).join('');
    bar.querySelectorAll('.tab-btn').forEach(function (el) {
      el.addEventListener('click', function () { switchStation(el.getAttribute('data-station')); });
    });

    // title buttons
    $('#btn-new').addEventListener('click', function () {
      CG.audio.play('select');
      if (CG.save.exists()) {
        CG.ui.confirm('Start over? Your current cafe will be erased.', function () {
          CG.save.wipe(); CG.newGame(); showDayIntro();
        });
      } else {
        CG.newGame(); showDayIntro();
      }
    });
    $('#btn-continue').addEventListener('click', function () {
      CG.audio.play('select');
      var data = CG.save.load();
      if (!data) { refreshTitle(); return; }
      CG.loadGame(data);
      showDayIntro();
    });

    // day intro -> open the cafe
    $('#btn-open').addEventListener('click', function () {
      CG.audio.play('ding');
      startDay();
    });

    // summary -> shop
    $('#btn-to-shop').addEventListener('click', function () {
      CG.audio.play('tap');
      CG.state.day++;
      CG.save.save();
      CG.shop.renderShop();
      CG.ui.showScreen('shop');
    });

    // shop -> next day
    $('#btn-next-day').addEventListener('click', function () {
      CG.audio.play('select');
      showDayIntro();
    });

    var saved = CG.save.load();
    if (saved && saved.settings) CG.audio.setMuted(!!saved.settings.muted);
    refreshTitle();
    CG.ui.showScreen('title');
    requestAnimationFrame(function (ts) { lastTs = ts; requestAnimationFrame(frame); });
  }

  document.addEventListener('DOMContentLoaded', init);

  return { switchStation: switchStation, startDay: startDay, toTitle: toTitle, showDayIntro: showDayIntro };
})();
