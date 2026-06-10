/* Crackle & Pour — build station: assemble per ticket, then serve */
CG.stations.build = (function () {
  'use strict';

  var d = CG.data;
  var panel, msgEl, cupEl, listEl, shelfEl, serveEl;
  var ticket = null;
  var pump = { active: false, comp: null, count: 0, timer: 0 };
  var ring = { active: false, comp: null, t: 0 };
  var shake = { comp: null, hits: 0, pulse: 0 };

  function init() {
    panel = document.getElementById('panel-build');
    panel.innerHTML =
      '<div class="station-head"><h2>Build &amp; Serve</h2><p class="hint" id="build-msg"></p></div>' +
      '<div class="build-stage">' +
      '  <div id="build-cup" class="build-cup"></div>' +
      '  <div id="build-list" class="build-list"></div>' +
      '</div>' +
      '<div id="build-shelf" class="build-shelf"></div>' +
      '<div id="build-serve" class="build-servebox"></div>';
    msgEl = panel.querySelector('#build-msg');
    cupEl = panel.querySelector('#build-cup');
    listEl = panel.querySelector('#build-list');
    shelfEl = panel.querySelector('#build-shelf');
    serveEl = panel.querySelector('#build-serve');
    CG.events.on('ticketschange', function () {
      if (CG.state.service && CG.state.service.activeStation === 'build') enter();
    });
  }

  function enter() {
    resetMinigames();
    var sel = CG.tickets.selected();
    var open = CG.tickets.open();
    ticket = (sel && sel.status !== 'served') ? sel : open[0] || null;
    if (!ticket) {
      msgEl.textContent = 'No drinks to build. Take some orders!';
      cupEl.innerHTML = '';
      listEl.innerHTML = '';
      shelfEl.innerHTML = '';
      serveEl.innerHTML = '';
      return;
    }
    var cust = CG.customers.byId(ticket.customerId);
    msgEl.innerHTML = d.SIZES[ticket.size].name + ' ' + d.RECIPES[ticket.recipe].name +
      ' for <b>' + d.CHARACTERS[cust.charId].name + '</b>';
    render();
  }

  function resetMinigames() {
    pump = { active: false, comp: null, count: 0, timer: 0 };
    ring = { active: false, comp: null, t: 0 };
    shake = { comp: null, hits: 0, pulse: 0 };
  }

  function render() {
    renderCup();
    renderList();
    renderShelf();
    renderServe();
  }

  function renderCup() {
    var hasLiquid = ticket.components.some(function (c) {
      return c.done && (c.kind === 'holding-brew' || c.kind === 'holding-milk' || c.kind === 'tap');
    });
    var whipDone = ticket.components.some(function (c) { return c.topping === 'whip' && c.done; });
    var dust = null;
    ticket.components.forEach(function (c) {
      if (c.done && c.kind === 'shake') dust = d.TOPPINGS[c.topping].color;
    });
    cupEl.innerHTML = CG.svg.cup(ticket.size, {
      fill: hasLiquid,
      color: d.RECIPES[ticket.recipe].milk ? '#c8a165' : '#6f4e37',
      whip: whipDone,
      dust: dust
    });
  }

  function renderList() {
    listEl.innerHTML = ticket.components.map(function (c, i) {
      return '<div class="comp kind-' + c.kind + (c.done ? ' done' : '') + '">' +
        (c.done ? '✓ ' : '○ ') + c.label + (c.done ? ' <small>' + c.score + '%</small>' : '') + '</div>';
    }).join('');
  }

  function renderShelf() {
    var sv = CG.state.service;
    var html = '';

    // holding shelf: brew + milk products
    ['brew', 'milk'].forEach(function (slot) {
      var h = sv.holding[slot];
      var needComp = ticket.components.filter(function (c) {
        return !c.done && c.kind === 'holding-' + slot;
      })[0];
      var cls = 'shelf-item holding';
      var label = slot === 'brew' ? 'Shot' : 'Milk';
      if (!h) cls += ' empty';
      else if (h.ticketId !== ticket.id) cls += ' wrongticket';
      html += '<button class="' + cls + '" data-slot="' + slot + '"' + ((!h || !needComp) && h ? '' : '') + '>' +
        CG.svg.icon(slot === 'brew' ? 'brew' : 'milk') +
        '<span>' + (h ? (h.ticketId === ticket.id ? 'Pour ' + label : 'Wrong order') : 'No ' + label.toLowerCase()) + '</span></button>';
    });

    // hot water tap (americano)
    if (ticket.components.some(function (c) { return c.kind === 'tap'; })) {
      html += '<button class="shelf-item" data-water="1">' + CG.svg.icon('milk') + '<span>Hot water</span></button>';
    }

    // syrup bottles: every unlocked syrup + chocolate sauce if any pump comp wants it
    var bottles = CG.state.unlocked.syrups.slice();
    if (ticket.components.some(function (c) { return c.syrup === 'chocolate'; })) bottles.push('chocolate');
    bottles.forEach(function (s) {
      var info = s === 'chocolate' ? d.CHOC : d.SYRUPS[s];
      html += '<button class="shelf-item bottle" data-syrup="' + s + '" style="--syr:' + info.color + '">' +
        '<span class="bottle-shape"></span><span>' + info.name + '</span></button>';
    });

    // toppings
    ticket.components.forEach(function (c) {
      if (c.kind === 'ring' && !c.done) {
        html += '<button class="shelf-item" data-whip="' + c.id + '">' + CG.svg.icon('build') + '<span>Whipped cream<br><small>hold over cup</small></span></button>';
      }
      if (c.kind === 'shake' && !c.done) {
        html += '<button class="shelf-item" data-shake="' + c.id + '">' + CG.svg.icon('roast') + '<span>' + d.TOPPINGS[c.topping].name + '<br><small>tap the pulse ×3</small></span></button>';
      }
    });

    shelfEl.innerHTML = html + '<div id="build-minigame"></div>';
    bindShelf();
  }

  function bindShelf() {
    var sv = CG.state.service;

    shelfEl.querySelectorAll('[data-slot]').forEach(function (el) {
      el.addEventListener('click', function () {
        var slot = el.getAttribute('data-slot');
        var h = sv.holding[slot];
        if (!h) { CG.ui.toast('Nothing in hand — make it first!'); CG.audio.play('tap'); return; }
        if (h.ticketId !== ticket.id) {
          var other = CG.tickets.byId(h.ticketId);
          var cust = other && CG.customers.byId(other.customerId);
          CG.ui.toast('That belongs to ' + (cust ? d.CHARACTERS[cust.charId].name : 'another order') + '!', 'bad');
          CG.audio.play('buzz');
          return;
        }
        var comp = ticket.components.filter(function (c) { return !c.done && c.kind === 'holding-' + slot; })[0];
        if (!comp) { CG.ui.toast('This drink doesn’t need that.'); return; }
        comp.done = true;
        comp.score = h.score;
        CG.tickets.completeStep(ticket, slot === 'brew' ? 'brew' : 'milk', h.score);
        sv.holding[slot] = null;
        CG.audio.play('pour');
        CG.ui.updateHUD();
        render();
      });
    });

    var waterBtn = shelfEl.querySelector('[data-water]');
    if (waterBtn) waterBtn.addEventListener('click', function () {
      var comp = ticket.components.filter(function (c) { return c.kind === 'tap' && !c.done; })[0];
      if (!comp) return;
      comp.done = true; comp.score = 100;
      CG.audio.play('pour');
      render();
    });

    shelfEl.querySelectorAll('[data-syrup]').forEach(function (el) {
      bindPump(el, el.getAttribute('data-syrup'));
    });

    shelfEl.querySelectorAll('[data-whip]').forEach(function (el) {
      bindWhip(el, el.getAttribute('data-whip'));
    });

    shelfEl.querySelectorAll('[data-shake]').forEach(function (el) {
      el.addEventListener('click', function () { startShake(el.getAttribute('data-shake')); });
    });
  }

  /* ---------- syrup pumps (hold; ticks every 0.4s) ---------- */

  function bindPump(el, syrup) {
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      var comp = ticket.components.filter(function (c) { return c.syrup === syrup && !c.done; })[0];
      if (!comp) {
        // syrup not on this ticket — a mistake
        ticket.mistakes++;
        CG.ui.toast('That’s not on the ticket! (−15)', 'bad');
        CG.audio.play('buzz');
        return;
      }
      pump = { active: true, comp: comp, count: 0, timer: 0.39, el: el };
      el.classList.add('pressed');
    });
    var stop = function () {
      el.classList.remove('pressed');
      if (!pump.active || pump.comp == null) return;
      var c = pump.comp;
      c.done = true;
      c.score = Math.max(0, 100 - 35 * Math.abs(pump.count - c.target));
      pump = { active: false, comp: null, count: 0, timer: 0 };
      CG.audio.play(c.score >= 65 ? 'chime' : 'buzz');
      render();
    };
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointercancel', stop);
  }

  /* ---------- whipped cream (hold 1s ring) ---------- */

  function bindWhip(el, compId) {
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      var comp = ticket.components.filter(function (c) { return c.id === compId; })[0];
      if (!comp || comp.done) return;
      ring = { active: true, comp: comp, t: 0, el: el };
      el.classList.add('pressed');
    });
    var stop = function () {
      el.classList.remove('pressed');
      if (!ring.active) return;
      var c = ring.comp;
      c.done = true;
      c.score = Math.round(Math.min(ring.t / 1, 1) * 100);
      ring = { active: false, comp: null, t: 0 };
      CG.audio.play(c.score >= 80 ? 'chime' : 'tap');
      render();
    };
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointercancel', stop);
  }

  /* ---------- dust shaker (3 rhythm taps) ---------- */

  function startShake(compId) {
    var comp = ticket.components.filter(function (c) { return c.id === compId; })[0];
    if (!comp || comp.done) return;
    shake = { comp: comp, hits: 0, score: 0, pulse: 0 };
    var box = shelfEl.querySelector('#build-minigame');
    box.innerHTML = '<div class="shake-box"><div class="shake-pulse" id="shake-pulse"></div>' +
      '<button class="btn btn-primary" id="shake-btn">SHAKE! <span id="shake-count">0/3</span></button></div>';
    box.querySelector('#shake-btn').addEventListener('click', function () {
      // pulse cycles 0..1; "big" = near 1
      var p = Math.abs(Math.sin(shake.pulse * Math.PI * 2));
      var pts = p > 0.75 ? 33.4 : p > 0.45 ? 20 : 8;
      shake.hits++;
      shake.score += pts;
      CG.audio.play(pts > 30 ? 'chime' : 'tap');
      box.querySelector('#shake-count').textContent = shake.hits + '/3';
      if (shake.hits >= 3) {
        comp.done = true;
        comp.score = Math.round(Math.min(shake.score, 100));
        shake = { comp: null, hits: 0, pulse: 0 };
        box.innerHTML = '';
        render();
      }
    });
  }

  /* ---------- serve ---------- */

  function renderServe() {
    var ready = CG.tickets.readyToServe(ticket);
    var missing = '';
    if (!ready) {
      var firstMissing = ticket.components.filter(function (c) { return !c.done; })[0];
      missing = firstMissing ? 'Still needs: ' + firstMissing.label : '';
    }
    serveEl.innerHTML =
      '<button class="btn btn-serve" id="serve-btn"' + (ready ? '' : ' disabled') + '>SERVE</button>' +
      (missing ? '<p class="serve-hint">' + missing + '</p>' : '');
    serveEl.querySelector('#serve-btn').addEventListener('click', function () {
      if (!CG.tickets.readyToServe(ticket)) return;
      var done = ticket;
      ticket = null;
      CG.tickets.serve(done);
    });
  }

  /* ---------- per-frame ---------- */

  function update(dt) {
    if (pump.active && pump.comp) {
      pump.timer += dt;
      if (pump.timer >= 0.4) {
        pump.timer = 0;
        pump.count++;
        CG.audio.play('pump');
        if (pump.el) pump.el.setAttribute('data-count', pump.count);
      }
    }
    if (ring.active) {
      ring.t += dt;
      if (ring.el) ring.el.style.setProperty('--ringpct', Math.min(ring.t, 1) * 100 + '%');
    }
    if (shake.comp) {
      shake.pulse = (shake.pulse + dt / 0.8) % 1;
      var p = Math.abs(Math.sin(shake.pulse * Math.PI * 2));
      var el = shelfEl.querySelector('#shake-pulse');
      if (el) el.style.transform = 'scale(' + (0.4 + p * 0.6).toFixed(3) + ')';
    }
  }

  function exit() {
    resetMinigames();
    ticket = null;
  }

  return { init: init, enter: enter, exit: exit, update: update, resetDay: exit };
})();
