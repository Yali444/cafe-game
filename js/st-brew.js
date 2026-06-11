/* Crackle & Pour — brew station: grind + espresso pull / pour-over */
CG.stations.brew = (function () {
  'use strict';

  var d = CG.data;
  var panel, msgEl, stageEl, controlsEl, grindEl;
  var ticket = null;          // ticket locked in for this brew
  var mode = null;            // 'espresso' | 'pourover'
  var phase = 'pick';         // pick | grind | pull | pour1 | bloom | pour2 | done
  var holdingBtn = false;
  var grind = { v: 0, center: 60, score: 0 };
  var fill = 0;
  var bloomT = 0, bloomPenalty = 0, pour1Score = 0;
  var beanSpent = false;

  var PULL_TARGET = 65, POUR_T1 = 45, POUR_T2 = 85;

  function init() {
    panel = document.getElementById('panel-brew');
    panel.innerHTML =
      '<div class="station-head"><h2>Brew Bar</h2><p class="hint" id="brew-msg"></p></div>' +
      '<div id="brew-stage" class="scene-wrap brew-scene"></div>' +
      '<div id="brew-grind" class="grind-box hidden">' +
      '  <div class="grind-bar"><div class="grind-window" id="grind-window"></div><div class="grind-fill" id="grind-fill"></div></div>' +
      '  <button class="btn btn-hold" id="grind-btn">HOLD TO GRIND</button>' +
      '</div>' +
      '<div id="brew-controls" class="brew-controls"></div>';
    msgEl = panel.querySelector('#brew-msg');
    stageEl = panel.querySelector('#brew-stage');
    controlsEl = panel.querySelector('#brew-controls');
    grindEl = panel.querySelector('#brew-grind');
    bindHold(panel.querySelector('#grind-btn'), grindDown, grindUp);
    CG.events.on('ticketschange', function () { if (active() && phase === 'pick') enter(); });
    CG.events.on('inventorychange', function () { if (active() && phase === 'pick') enter(); });
  }

  function active() { return CG.state.service && CG.state.service.activeStation === 'brew'; }

  function bindHold(btn, onDown, onUp) {
    btn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      btn.classList.add('pressed');
      onDown();
    });
    var release = function () {
      if (!btn.classList.contains('pressed')) return;
      btn.classList.remove('pressed');
      onUp();
    };
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
  }

  /* ---------- phase: pick ---------- */

  function enter() {
    var sv = CG.state.service;
    grindEl.classList.add('hidden');
    if (sv.holding.brew) {
      ticket = null;
      msgEl.textContent = 'A ' + (sv.holding.brew.type === 'espresso' ? 'shot' : 'pour-over') + ' is waiting on the shelf.';
      stageEl.innerHTML = CG.svg.sceneBrew(sv.holding.brew.type);
      stageEl.classList.remove('dim');
      controlsEl.innerHTML = '<button class="btn btn-primary" id="goto-build">Deliver it at Build →</button>';
      controlsEl.querySelector('#goto-build').addEventListener('click', function () { CG.main.switchStation('build'); });
      return;
    }
    ticket = CG.tickets.pickFor('brew');
    phase = 'pick';
    if (!ticket) {
      msgEl.textContent = 'No drinks need brewing right now.';
      stageEl.innerHTML = CG.svg.sceneBrew('espresso');
      stageEl.classList.add('dim');
      controlsEl.innerHTML = '';
      return;
    }
    mode = d.RECIPES[ticket.recipe].brew;
    var cust = CG.customers.byId(ticket.customerId);
    var name = d.CHARACTERS[cust.charId].name;
    var R = d.ROASTS[ticket.roast];

    if (sv.roastInventory[ticket.roast] <= 0) {
      msgEl.innerHTML = 'Out of <b style="color:' + R.color + '">' + R.name + '</b> roast beans!';
      stageEl.innerHTML = CG.svg.sceneBrew(mode);
      stageEl.classList.add('dim');
      controlsEl.innerHTML = '<button class="btn btn-warn" id="goto-roast">Go Roast Beans →</button>';
      controlsEl.querySelector('#goto-roast').addEventListener('click', function () { CG.main.switchStation('roast'); });
      return;
    }

    msgEl.innerHTML = (mode === 'espresso' ? 'Espresso' : 'Pour-over') + ' for <b>' + name + '</b> — ' +
      '<span style="color:' + R.color + '">' + R.name + '</span> roast';
    stageEl.innerHTML = CG.svg.sceneBrew(mode);
    stageEl.classList.remove('dim');
    controlsEl.innerHTML = '<button class="btn btn-primary" id="brew-start">Start — grind the beans</button>';
    controlsEl.querySelector('#brew-start').addEventListener('click', startGrind);
  }

  /* ---------- phase: grind ---------- */

  function startGrind() {
    var sv = CG.state.service;
    if (!ticket || sv.roastInventory[ticket.roast] <= 0) { enter(); return; }
    sv.roastInventory[ticket.roast]--;
    beanSpent = true;
    CG.events.emit('inventorychange');
    CG.audio.play('select');

    phase = 'grind';
    grind.v = 0;
    grind.center = 45 + Math.random() * 30;
    var winPct = CG.upgradeValue('grinder') * 100;
    var win = panel.querySelector('#grind-window');
    win.style.left = (grind.center - winPct / 2) + '%';
    win.style.width = winPct + '%';
    panel.querySelector('#grind-fill').style.transform = 'scaleX(0)';
    grindEl.classList.remove('hidden');
    controlsEl.innerHTML = '';
    msgEl.textContent = 'Hold to grind — release inside the gold window.';
  }

  function grindDown() {
    if (phase === 'grind') holdingBtn = true;
  }

  function grindUp() {
    if (phase !== 'grind' || !holdingBtn) return;
    holdingBtn = false;
    finishGrind();
  }

  function finishGrind() {
    var half = CG.upgradeValue('grinder') * 100 / 2;
    grind.score = Math.round(d.clamp(100 - Math.abs(grind.v - grind.center) / half * 50, 0, 100));
    CG.audio.play(grind.score >= 50 ? 'chime' : 'buzz');
    grindEl.classList.add('hidden');
    if (mode === 'espresso') startPull();
    else startPour(1);
  }

  /* ---------- phase: espresso pull ---------- */

  function startPull() {
    phase = 'pull';
    fill = 0;
    stageEl.innerHTML = CG.svg.sceneBrew('espresso');
    setTargetLine('#brew-target', '#brew-glass', PULL_TARGET, 48);
    controlsEl.innerHTML = '<button class="btn btn-hold" id="pull-btn">HOLD TO PULL</button>';
    bindHold(controlsEl.querySelector('#pull-btn'), function () { holdingBtn = true; setStream('#brew-stream', true); },
      function () { holdingBtn = false; setStream('#brew-stream', false); finishPull(); });
    msgEl.textContent = 'Pull the shot — stop at the dashed line.';
  }

  function setStream(sel, on) {
    var el = stageEl.querySelector(sel);
    if (el) el.setAttribute('opacity', on ? '1' : '0');
    if (on) CG.audio.play('pour');
  }

  function setTargetLine(lineSel, groupSel, targetPct, glassH) {
    var line = stageEl.querySelector(lineSel);
    if (line) {
      var y = glassH * (1 - targetPct / 100);
      line.setAttribute('y1', y); line.setAttribute('y2', y);
    }
  }

  function finishPull() {
    if (phase !== 'pull') return;
    var score = fill > 110 ? 20 : Math.round(d.clamp(100 - Math.abs(fill - PULL_TARGET) * 4, 0, 100));
    done(Math.round(0.4 * grind.score + 0.6 * score));
  }

  /* ---------- phase: pour-over ---------- */

  function startPour(n) {
    phase = 'pour' + n;
    if (n === 1) { fill = 0; stageEl.innerHTML = CG.svg.sceneBrew('pourover'); }
    setTargetLine('#pour-target', null, n === 1 ? POUR_T1 : POUR_T2, 69);
    controlsEl.innerHTML = '<button class="btn btn-hold" id="pour-btn">HOLD TO POUR</button>';
    bindHold(controlsEl.querySelector('#pour-btn'),
      function () {
        if (phase === 'bloom') { bloomPenalty = 15; CG.ui.toast('Let it bloom!', 'bad'); CG.audio.play('buzz'); return; }
        holdingBtn = true; setStream('#pour-stream', true);
      },
      function () { holdingBtn = false; setStream('#pour-stream', false); finishPour(); });
    msgEl.textContent = n === 1 ? 'First pour — wet the grounds to the line.' : 'Final pour — fill to the top line.';
  }

  function finishPour() {
    if (phase === 'pour1') {
      pour1Score = d.clamp(100 - Math.abs(fill - POUR_T1) * 4, 0, 100);
      phase = 'bloom';
      bloomT = 1.5;
      msgEl.textContent = 'Blooming… wait for it…';
      controlsEl.querySelector('#pour-btn').classList.add('waiting');
    } else if (phase === 'pour2') {
      var p2 = fill > 110 ? 20 : d.clamp(100 - Math.abs(fill - POUR_T2) * 4, 0, 100);
      var pourScore = Math.max(0, (pour1Score + p2) / 2 - bloomPenalty);
      done(Math.round(0.35 * grind.score + 0.65 * pourScore));
    }
  }

  /* ---------- finish ---------- */

  function done(score) {
    var sv = CG.state.service;
    phase = 'done';
    sv.holding.brew = { ticketId: ticket.id, type: mode, score: score };
    beanSpent = false;
    CG.audio.play(score >= 85 ? 'fanfare' : 'chime');
    CG.ui.updateHUD();
    msgEl.textContent = (mode === 'espresso' ? 'Shot' : 'Pour-over') + ' done — ' + score + '%!';
    controlsEl.innerHTML = '<button class="btn btn-primary" id="goto-build2">Deliver at Build →</button>' +
      (CG.tickets.needing('brew').length ? '<button class="btn btn-ghost" id="brew-next">Next brew</button>' : '');
    controlsEl.querySelector('#goto-build2').addEventListener('click', function () { CG.main.switchStation('build'); });
    var nx = controlsEl.querySelector('#brew-next');
    if (nx) nx.addEventListener('click', enter);
    ticket = null;
  }

  /* ---------- per-frame ---------- */

  function update(dt) {
    if (phase === 'grind' && holdingBtn) {
      grind.v = Math.min(100, grind.v + dt / 2.2 * 100);
      panel.querySelector('#grind-fill').style.transform = 'scaleX(' + (grind.v / 100).toFixed(3) + ')';
      if (grind.v % 12 < dt * 50) CG.audio.play('grind');
      if (grind.v >= 100) { holdingBtn = false; finishGrind(); }
    }
    if ((phase === 'pull' || phase === 'pour1' || phase === 'pour2') && holdingBtn) {
      var rate = 22 + 42 * Math.sin(Math.PI * Math.min(fill, 100) / 100);
      fill += rate * dt;
      var fillEl = stageEl.querySelector(phase === 'pull' ? '#brew-fill' : '#pour-fill');
      if (fillEl) {
        var h = phase === 'pull' ? 48 : 69;
        fillEl.setAttribute('y', h - Math.min(fill, 115) / 100 * h);
      }
      if (fill > 115) { // overflow spill
        holdingBtn = false;
        setStream(phase === 'pull' ? '#brew-stream' : '#pour-stream', false);
        CG.ui.toast('Overflow!', 'bad');
        CG.audio.play('buzz');
        if (phase === 'pull') finishPull(); else finishPour();
      }
    }
    if (phase === 'bloom') {
      bloomT -= dt;
      if (bloomT <= 0) {
        var btn = controlsEl.querySelector('#pour-btn');
        if (btn) btn.classList.remove('waiting');
        startPour(2);
      }
    }
  }

  function exit() {
    // abandoning mid-brew refunds the bean and cancels
    if (beanSpent && ticket && phase !== 'done') {
      CG.state.service.roastInventory[ticket.roast]++;
      beanSpent = false;
      CG.events.emit('inventorychange');
    }
    holdingBtn = false;
    phase = 'pick';
    ticket = null;
  }

  return { init: init, enter: enter, exit: exit, update: update, resetDay: exit };
})();
