/* FIKA — the pass: pour the drink together, free-pour the art, serve */
CG.stations.build = (function () {
  'use strict';

  var d = CG.data;
  var panel, msgEl, sceneEl, overlayEl, listEl, serveEl;
  var ticket = null;
  var cupFill = 0;           // 0..1
  var milkIn = false;
  var artTier = null;
  var pour = null;           // active pour: {comp, kind, lastX, lastDir, extremum, wiggles}

  function init() {
    panel = document.getElementById('panel-build');
    panel.innerHTML =
      '<div class="station-head"><h2>The Pass</h2><p class="hint" id="pass-msg"></p></div>' +
      '<div class="scene-wrap pass-scene">' +
      '  <div id="pass-scene" class="scene-host"></div>' +
      '  <div id="pass-overlays" class="scene-overlays"></div>' +
      '</div>' +
      '<div id="pass-list" class="build-list"></div>' +
      '<div id="pass-serve" class="station-controls"></div>';
    msgEl = panel.querySelector('#pass-msg');
    sceneEl = panel.querySelector('#pass-scene');
    overlayEl = panel.querySelector('#pass-overlays');
    listEl = panel.querySelector('#pass-list');
    serveEl = panel.querySelector('#pass-serve');
    CG.events.on('ticketschange', function () {
      if (CG.state.service && CG.state.service.activeStation === 'build') enter();
    });
  }

  function enter() {
    pour = null;
    var sel = CG.tickets.selected();
    var open = CG.tickets.open();
    ticket = (sel && sel.status !== 'served') ? sel : open[0] || null;
    sceneEl.innerHTML = CG.svg.scenePass();
    if (!ticket) {
      msgEl.textContent = 'Nothing on the pass. Take some orders.';
      sceneEl.classList.add('dim');
      overlayEl.innerHTML = '';
      listEl.innerHTML = '';
      serveEl.innerHTML = '';
      return;
    }
    sceneEl.classList.remove('dim');
    var cust = CG.customers.byId(ticket.customerId);
    var r = d.RECIPES[ticket.recipe];
    msgEl.innerHTML = r.name + ' for <b>' + d.CHARACTERS[cust.charId].name + '</b>' +
      (ticket.origin ? ' · ' + d.ORIGINS[ticket.origin].short : '');

    // restore visual state from components
    var shotComp = comp('shot'), filterComp = comp('filter'), milkComp = comp('milkpour');
    cupFill = 0; milkIn = false; artTier = null;
    if (shotComp && shotComp.done) cupFill = 0.3;
    if (filterComp && filterComp.done) cupFill = 0.85;
    if (milkComp && milkComp.done) { cupFill = 0.92; milkIn = true; artTier = milkComp.tier || null; }
    renderCup();
    renderShelf();
    renderList();
    renderServe();
  }

  function comp(id) {
    if (!ticket) return null;
    for (var i = 0; i < ticket.components.length; i++) {
      if (ticket.components[i].id === id) return ticket.components[i];
    }
    return null;
  }

  function renderCup() {
    var host = sceneEl.querySelector('#cup-host');
    if (!host) return;
    var color = milkIn ? '#c89a6c' : '#7a4e28';
    var crema = !milkIn && cupFill > 0 && d.RECIPES[ticket.recipe].brew === 'espresso';
    host.innerHTML = CG.svg.passCup(color, cupFill, artTier, crema);
  }

  /* ---------- holding shelf chips ---------- */

  function renderShelf() {
    var sv = CG.state.service;
    var shotComp = comp('shot'), filterComp = comp('filter'), milkComp = comp('milkpour');
    var html = '';

    if (shotComp && !shotComp.done) {
      var hasShot = sv.holding.brew && sv.holding.brew.ticketId === ticket.id;
      var wrong = sv.holding.brew && sv.holding.brew.ticketId !== ticket.id;
      html += chip('shot', hasShot ? 'Pour the shot' : wrong ? 'Wrong order' : 'No shot yet', hasShot, 'tap');
    }
    if (filterComp && !filterComp.done) {
      var hasBrew = sv.holding.brew && sv.holding.brew.ticketId === ticket.id;
      var wrongB = sv.holding.brew && sv.holding.brew.ticketId !== ticket.id;
      html += chip('filter', hasBrew ? 'Hold to pour' : wrongB ? 'Wrong order' : 'Nothing brewed', hasBrew, 'hold');
    }
    if (milkComp && !milkComp.done) {
      var brewFirst = (shotComp && !shotComp.done);
      var hasMilk = sv.holding.milk && sv.holding.milk.ticketId === ticket.id;
      var wrongM = sv.holding.milk && sv.holding.milk.ticketId !== ticket.id;
      var label = brewFirst ? 'Shot first' : hasMilk ? (milkComp.kind === 'art' ? 'Hold & wiggle to pour' : 'Hold to pour milk') : wrongM ? 'Wrong order' : 'No milk yet';
      html += chip('milk', label, hasMilk && !brewFirst, 'hold');
    }
    overlayEl.innerHTML = html;

    overlayEl.querySelectorAll('.pass-chip.ready').forEach(function (el) {
      var id = el.getAttribute('data-act');
      if (id === 'shot') {
        el.addEventListener('pointerdown', function (e) { e.preventDefault(); pourShot(); });
      } else {
        el.addEventListener('pointerdown', function (e) {
          e.preventDefault();
          el.setPointerCapture(e.pointerId);
          el.classList.add('pressed');
          startPour(id === 'filter' ? comp('filter') : comp('milkpour'), e);
        });
        el.addEventListener('pointermove', function (e) { if (pour) trackPour(e); });
        var up = function () {
          el.classList.remove('pressed');
          endPour();
        };
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
      }
    });
  }

  function chip(act, label, ready, kindHint) {
    return '<button class="pass-chip' + (ready ? ' ready' : '') + '" data-act="' + act + '">' +
      '<span class="pc-dot"></span>' + label + '</button>';
  }

  /* ---------- pours ---------- */

  function pourShot() {
    var sv = CG.state.service;
    var c = comp('shot');
    if (!c || c.done || !sv.holding.brew || sv.holding.brew.ticketId !== ticket.id) return;
    c.done = true;
    CG.tickets.completeStep(ticket, 'brew', sv.holding.brew.score);
    sv.holding.brew = null;
    cupFill = 0.3;
    CG.audio.play('pour');
    setStream(true);
    setTimeout(function () { setStream(false); }, 450);
    CG.ui.updateHUD();
    // re-render happens via ticketschange
  }

  function startPour(c, e) {
    if (!c || c.done) return;
    var sv = CG.state.service;
    pour = {
      comp: c,
      kind: c.kind,
      lastX: e.clientX,
      lastDir: 0,
      sinceTurn: 0,
      wiggles: 0
    };
    setStream(true);
    CG.audio.play('pour');
  }

  function trackPour(e) {
    if (!pour || pour.kind !== 'art') { if (pour) pour.lastX = e.clientX; return; }
    var dx = e.clientX - pour.lastX;
    pour.lastX = e.clientX;
    if (Math.abs(dx) < 1) return;
    var dir = dx > 0 ? 1 : -1;
    pour.sinceTurn += Math.abs(dx);
    if (dir !== pour.lastDir && pour.lastDir !== 0 && pour.sinceTurn > 14) {
      pour.wiggles++;
      pour.sinceTurn = 0;
    }
    if (pour.lastDir === 0) pour.lastDir = dir;
    else if (dir !== pour.lastDir) pour.lastDir = dir;
  }

  function endPour() {
    if (!pour) return;
    var sv = CG.state.service;
    var c = pour.comp;
    setStream(false);
    var f = cupFill * 100;

    if (c.kind === 'pour' && c.id === 'filter') {
      var acc = d.clamp(100 - Math.abs(f - 85) * 4, 0, 100);
      c.done = true;
      c.score = Math.round(acc);
      CG.tickets.completeStep(ticket, 'brew', sv.holding.brew.score);
      sv.holding.brew = null;
    } else if (c.id === 'milkpour') {
      var stopAcc = d.clamp(100 - Math.abs(f - 92) * 5, 0, 100);
      var artScore = 62, tier = null;
      if (c.kind === 'art') {
        if (pour.wiggles >= 5) { artScore = 100; tier = 'rosetta'; }
        else if (pour.wiggles >= 3) { artScore = 90; tier = 'tulip'; }
        else if (pour.wiggles >= 1) { artScore = 78; tier = 'heart'; }
        c.score = Math.round(0.5 * stopAcc + 0.5 * artScore);
        c.tier = tier;
        artTier = tier;
        if (tier) CG.ui.toast(tier === 'rosetta' ? 'A rosetta!' : tier === 'tulip' ? 'A tulip!' : 'A heart!', 'good');
      } else {
        c.score = Math.round(stopAcc);
      }
      c.done = true;
      milkIn = true;
      CG.tickets.completeStep(ticket, 'milk', sv.holding.milk.score);
      sv.holding.milk = null;
    }
    pour = null;
    CG.audio.play(c.score == null || c.score >= 60 ? 'chime' : 'tap');
    CG.ui.updateHUD();
  }

  function setStream(on) {
    var s = sceneEl.querySelector('#pass-stream');
    if (s) s.setAttribute('opacity', on ? '1' : '0');
    if (s && pour && pour.comp && pour.comp.id === 'milkpour') {
      s.querySelector('rect').setAttribute('fill', '#fcfbf8');
    } else if (s) {
      s.querySelector('rect').setAttribute('fill', '#7a4e28');
    }
  }

  /* ---------- checklist + serve ---------- */

  function renderList() {
    listEl.innerHTML = ticket.components.map(function (c) {
      return '<span class="comp' + (c.done ? ' done' : '') + '">' +
        (c.done ? '✓ ' : '○ ') + c.label +
        (c.done && c.score != null ? ' <small>' + c.score + '</small>' : '') + '</span>';
    }).join('');
  }

  function renderServe() {
    var ready = CG.tickets.readyToServe(ticket);
    serveEl.innerHTML =
      '<button class="btn btn-serve btn-wide" id="serve-btn"' + (ready ? '' : ' disabled') + '>Serve</button>';
    serveEl.querySelector('#serve-btn').addEventListener('click', function () {
      if (!CG.tickets.readyToServe(ticket)) return;
      var done = ticket;
      ticket = null;
      CG.tickets.serve(done);
    });
  }

  /* ---------- per-frame: pour fills the cup ---------- */

  function update(dt) {
    if (!pour) return;
    var max = pour.comp.id === 'filter' ? 1.05 : 1.02;
    cupFill = Math.min(max, cupFill + 0.26 * dt);
    renderCup();
    if (cupFill >= max) endPour(); // overflowed — forces the stop
  }

  function exit() {
    pour = null;
    ticket = null;
  }

  return { init: init, enter: enter, exit: exit, update: update, resetDay: exit };
})();
