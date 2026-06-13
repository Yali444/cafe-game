/* FIKA — brew bar: dial-in espresso, hands-on V60, AeroPress, batch carafe */
CG.stations.brew = (function () {
  'use strict';

  var d = CG.data;
  var panel, msgEl, stageEl, overlayEl, controlsEl;
  var ticket = null;
  var mode = null;            // espresso | v60 | aero | batch
  var phase = 'pick';
  var beanSpent = false;

  /* espresso state */
  var dial = { center: 55, v: 50, dragging: false, score: 0 };
  var shot = { fill: 0, running: false };
  var PULL_TARGET = 65;

  /* v60 state */
  var v60 = { level: 0, phase: 0, targets: [28, 56, 88], scores: [], pouring: false,
              bloomT: 0, penalty: 0, kx: 0, ky: 0, grabbed: false, pid: null };

  /* aero state */
  var aero = { steepT: 0, steeping: false, steepScore: 0, pressY: 0, pressing: false, pauses: 0, started: false };

  /* batch state */
  var batch = { brewing: false, t: 0 };

  function init() {
    panel = document.getElementById('panel-brew');
    panel.innerHTML =
      '<div class="station-head"><h2>Brew Bar</h2><p class="hint" id="brew-msg"></p></div>' +
      '<div class="scene-wrap brew-scene">' +
      '  <div id="brew-stage" class="scene-host"></div>' +
      '  <div id="brew-overlays" class="scene-overlays"></div>' +
      '</div>' +
      '<div id="brew-controls" class="station-controls"></div>';
    msgEl = panel.querySelector('#brew-msg');
    stageEl = panel.querySelector('#brew-stage');
    overlayEl = panel.querySelector('#brew-overlays');
    controlsEl = panel.querySelector('#brew-controls');
    CG.events.on('ticketschange', function () { if (active() && phase === 'pick') enter(); });
    CG.events.on('inventorychange', function () { if (active() && phase === 'pick') enter(); });
  }

  function active() { return CG.state.service && CG.state.service.activeStation === 'brew'; }

  function pct(n, of) { return (n / of * 100) + '%'; }

  /* ---------- entry / ticket pick ---------- */

  function enter() {
    var sv = CG.state.service;
    overlayEl.innerHTML = '';
    phase = 'pick';
    ticket = CG.tickets.pickFor('brew');
    if (!ticket) {
      mode = 'espresso';
      stageEl.innerHTML = sceneFor(mode);
      stageEl.classList.add('dim');
      msgEl.textContent = 'Nothing to brew right now.';
      controlsEl.innerHTML = '';
      return;
    }
    mode = d.RECIPES[ticket.recipe].brew;
    stageEl.innerHTML = sceneFor(mode);
    stageEl.classList.remove('dim');
    var cust = CG.customers.byId(ticket.customerId);
    var name = d.CHARACTERS[cust.charId].name;
    var o = ticket.origin ? d.ORIGINS[ticket.origin] : null;

    if (mode !== 'batch' && o && sv.roastInventory[ticket.origin] <= 0) {
      stageEl.classList.add('dim');
      msgEl.innerHTML = 'No roasted <b>' + o.short + '</b> on the shelf.';
      controlsEl.innerHTML = '<button class="btn btn-warn btn-wide" id="goto-roast">To the Roastery →</button>';
      controlsEl.querySelector('#goto-roast').addEventListener('click', function () { CG.main.switchStation('roast'); });
      return;
    }

    msgEl.innerHTML = d.RECIPES[ticket.recipe].name + ' for <b>' + name + '</b>' +
      (o ? ' · ' + o.short + ' <span class="note">(' + o.notes + ')</span>' : '');

    if (mode === 'espresso') setupEspresso();
    else if (mode === 'v60') setupV60();
    else if (mode === 'aero') setupAero();
    else setupBatch();
  }

  function sceneFor(m) {
    if (m === 'v60') return CG.svg.sceneBrewV60();
    if (m === 'aero') return CG.svg.sceneBrewAero();
    if (m === 'batch') return CG.svg.sceneBrewBatch();
    return CG.svg.sceneBrewEspresso();
  }

  function spendBean() {
    if (mode === 'batch' || !ticket.origin) return;
    CG.state.service.roastInventory[ticket.origin]--;
    beanSpent = true;
    CG.events.emit('inventorychange');
  }

  function refundBean() {
    if (beanSpent && ticket && ticket.origin) {
      CG.state.service.roastInventory[ticket.origin]++;
      CG.events.emit('inventorychange');
    }
    beanSpent = false;
  }

  function finishBrew(score) {
    phase = 'done';
    beanSpent = false;
    overlayEl.innerHTML = '';
    score = Math.round(score);
    var t = ticket;
    var isMilk = !!d.RECIPES[t.recipe].milk;
    CG.tickets.completeStep(t, 'brew', score);
    CG.audio.play(score >= 85 ? 'fanfare' : 'chime');
    CG.ui.updateHUD();

    if (isMilk) {
      // shot pulled — hand off to the milk bar to finish the drink
      msgEl.textContent = (mode === 'espresso' ? 'Shot pulled' : 'Brew done') + ' — ' + score + '. Now steam the milk.';
      controlsEl.innerHTML = '<button class="btn btn-primary btn-wide" id="goto-milk">Steam the milk →</button>';
      controlsEl.querySelector('#goto-milk').addEventListener('click', function () { CG.main.switchStation('milk'); });
    } else {
      // black coffee — serve right here
      renderServe(t, (mode === 'espresso' ? 'Shot pulled' : 'Brew done') + ' — ' + score + '.');
    }
    ticket = null;
  }

  function renderServe(t, headline) {
    msgEl.textContent = headline + ' Serve it while it\'s hot.';
    controlsEl.innerHTML = '<button class="btn btn-confirm btn-wide" id="brew-serve">Serve ' +
      d.RECIPES[t.recipe].name + ' →</button>';
    controlsEl.querySelector('#brew-serve').addEventListener('click', function () {
      CG.tickets.serve(t);
      // move on to the next thing to brew
      enter();
    });
  }

  /* ================= espresso: dial → dock → stop the shot ================= */

  function setupEspresso() {
    phase = 'dial';
    dial.center = 35 + Math.random() * 40;
    dial.v = 8;
    dial.dragging = false;
    shot = { fill: 0, running: false };
    var win = CG.upgradeValue('grinder') * 100;

    overlayEl.innerHTML =
      '<div class="dial-plate" style="left:5%;top:26%;width:52%">' +
      '  <span class="dial-label">grind dial</span>' +
      '  <div class="dial-track" id="dial-track">' +
      '    <div class="dial-window" style="left:' + (dial.center - win / 2) + '%;width:' + win + '%"></div>' +
      '    <div class="dial-knob" id="dial-knob" style="left:' + dial.v + '%"></div>' +
      '  </div>' +
      '</div>';
    controlsEl.innerHTML = '<p class="control-note">Drag the dial into the sweet spot, then let go.</p>';

    var track = overlayEl.querySelector('#dial-track');
    var knob = overlayEl.querySelector('#dial-knob');
    track.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      track.setPointerCapture(e.pointerId);
      dial.dragging = true;
      moveDial(e);
    });
    track.addEventListener('pointermove', function (e) { if (dial.dragging) moveDial(e); });
    var release = function () {
      if (!dial.dragging) return;
      dial.dragging = false;
      var half = CG.upgradeValue('grinder') * 100 / 2;
      dial.score = Math.round(d.clamp(100 - Math.abs(dial.v - dial.center) / half * 50, 0, 100));
      CG.audio.play(dial.score >= 50 ? 'chime' : 'buzz');
      spendBean();
      setupDock();
    };
    track.addEventListener('pointerup', release);
    track.addEventListener('pointercancel', release);

    function moveDial(e) {
      var r = track.getBoundingClientRect();
      dial.v = d.clamp((e.clientX - r.left) / r.width * 100, 0, 100);
      knob.style.left = dial.v + '%';
      if (Math.random() < 0.2) CG.audio.play('grind');
    }
  }

  function setupDock() {
    phase = 'dock';
    msgEl.textContent = 'Lock the portafilter into the group head.';
    controlsEl.innerHTML = '<p class="control-note">Drag it up to the machine.</p>';
    overlayEl.innerHTML =
      '<div class="drag-el" id="pf" style="left:64%;top:80%;width:26%">' + CG.svg.portafilter() + '</div>' +
      '<div class="dock-zone" id="pf-zone" style="left:34%;top:62%;width:26%;height:16%"></div>';

    var pf = overlayEl.querySelector('#pf');
    var zone = overlayEl.querySelector('#pf-zone');
    var grabbed = false;

    pf.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      pf.setPointerCapture(e.pointerId);
      grabbed = true;
      pf.classList.add('grabbed');
    });
    pf.addEventListener('pointermove', function (e) {
      if (!grabbed) return;
      var host = overlayEl.getBoundingClientRect();
      var x = (e.clientX - host.left) / host.width * 100;
      var y = (e.clientY - host.top) / host.height * 100;
      pf.style.left = d.clamp(x - 13, 0, 78) + '%';
      pf.style.top = d.clamp(y - 8, 0, 84) + '%';
      zone.classList.toggle('hot', overZone(pf, zone));
    });
    var drop = function () {
      if (!grabbed) return;
      grabbed = false;
      pf.classList.remove('grabbed');
      if (overZone(pf, zone)) {
        CG.audio.play('select');
        startShot();
      }
    };
    pf.addEventListener('pointerup', drop);
    pf.addEventListener('pointercancel', drop);
  }

  function overZone(el, zone) {
    var a = el.getBoundingClientRect(), b = zone.getBoundingClientRect();
    var cx = a.left + a.width / 2, cy = a.top + a.height / 2;
    return cx > b.left && cx < b.right && cy > b.top && cy < b.bottom;
  }

  function startShot() {
    phase = 'shot';
    shot.running = true;
    shot.fill = 0;
    overlayEl.innerHTML = '<button class="scene-zone full-zone" id="shot-stop" aria-label="Stop the shot"></button>';
    var dock = stageEl.querySelector('#esp-pf-dock');
    if (dock) dock.setAttribute('opacity', '1');
    var stream = stageEl.querySelector('#esp-stream');
    if (stream) stream.setAttribute('opacity', '1');
    CG.audio.play('pour');
    msgEl.textContent = 'The shot is running — tap to stop at the line.';
    controlsEl.innerHTML = '<p class="control-note">Watch the crema rise…</p>';
    overlayEl.querySelector('#shot-stop').addEventListener('pointerdown', stopShot);
  }

  function stopShot() {
    if (phase !== 'shot') return;
    shot.running = false;
    var stream = stageEl.querySelector('#esp-stream');
    if (stream) stream.setAttribute('opacity', '0');
    var score = shot.fill > 110 ? 20 : d.clamp(100 - Math.abs(shot.fill - PULL_TARGET) * 4, 0, 100);
    finishBrew(0.4 * dial.score + 0.6 * score);
  }

  /* ================= v60: grab the kettle, pour in phases ================= */

  function setupV60() {
    phase = 'v60';
    v60 = { level: 0, phase: 0, targets: [28, 56, 88], scores: [], pouring: false,
            bloomT: 0, penalty: 0, kx: 64, ky: 28, grabbed: false, pid: null };
    spendBean();
    overlayEl.innerHTML =
      '<div class="drag-el kettle-el" id="kettle" style="left:58%;top:24%;width:30%">' + CG.svg.kettle() + '</div>' +
      '<div class="pour-stream hidden" id="kstream"></div>' +
      '<div class="bloom-ring hidden" id="bloom"></div>';
    controlsEl.innerHTML = '<p class="control-note" id="v60-note">Bloom first — pour gently to the first line, then release.</p>';
    msgEl.textContent = 'Pick up the kettle.';

    var kettleEl = overlayEl.querySelector('#kettle');
    kettleEl.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      kettleEl.setPointerCapture(e.pointerId);
      v60.grabbed = true;
      kettleEl.classList.add('grabbed');
      moveKettle(e);
    });
    kettleEl.addEventListener('pointermove', function (e) { if (v60.grabbed) moveKettle(e); });
    var release = function () {
      if (!v60.grabbed) return;
      v60.grabbed = false;
      kettleEl.classList.remove('grabbed');
      setPouring(false);
      v60Release();
    };
    kettleEl.addEventListener('pointerup', release);
    kettleEl.addEventListener('pointercancel', release);

    function moveKettle(e) {
      var host = overlayEl.getBoundingClientRect();
      v60.kx = d.clamp((e.clientX - host.left) / host.width * 100, 0, 100);
      v60.ky = d.clamp((e.clientY - host.top) / host.height * 100, 0, 100);
      kettleEl.style.left = d.clamp(v60.kx - 15, -6, 76) + '%';
      kettleEl.style.top = d.clamp(v60.ky - 12, -2, 78) + '%';
      // spout over the dripper? (dripper ≈ x 30–48%, y 22–48% of scene)
      var over = v60.kx > 18 && v60.kx < 52 && v60.ky > 38 && v60.ky < 62;
      setPouring(over);
    }
  }

  function setPouring(on) {
    if (v60.pouring === on) return;
    v60.pouring = on;
    var k = overlayEl.querySelector('#kettle');
    var s = overlayEl.querySelector('#kstream');
    if (k) k.classList.toggle('tilt', on);
    if (s) s.classList.toggle('hidden', !on);
    var drip = stageEl.querySelector('#v60-drip');
    if (drip) drip.setAttribute('opacity', on ? '1' : '0');
    if (on) CG.audio.play('pour');
  }

  function v60Release() {
    if (phase !== 'v60' || v60.phase >= 3) return;
    if (v60.level < 4) return; // barely poured — not a real attempt
    var target = v60.targets[v60.phase];
    var score = d.clamp(100 - Math.abs(v60.level - target) * 4, 0, 100);
    v60.scores.push(score);
    CG.audio.play(score >= 60 ? 'chime' : 'tap');
    v60.phase++;
    var note = panel.querySelector('#v60-note');
    if (v60.phase === 1) {
      v60.bloomT = 1.8;
      var bloom = overlayEl.querySelector('#bloom');
      if (bloom) bloom.classList.remove('hidden');
      msgEl.textContent = 'Let it bloom…';
      if (note) note.textContent = 'Wait for the bloom to settle.';
    } else if (v60.phase === 2) {
      msgEl.textContent = 'Final pour — up to the top line.';
      if (note) note.textContent = 'Slow spirals to the last line, then release.';
      showLine(3);
    } else if (v60.phase === 3) {
      var avg = v60.scores.reduce(function (a, b) { return a + b; }, 0) / 3;
      finishBrew(Math.max(0, avg - v60.penalty));
    }
  }

  function showLine(n) {
    var l = stageEl.querySelector('#v60-line' + n);
    if (l) l.setAttribute('opacity', '1');
  }

  function v60Update(dt) {
    if (v60.bloomT > 0) {
      v60.bloomT -= dt;
      var bloom = overlayEl.querySelector('#bloom');
      if (bloom) bloom.style.transform = 'scale(' + (0.5 + v60.bloomT / 1.8 * 0.6) + ')';
      if (v60.pouring && v60.penalty === 0) {
        v60.penalty = 15;
        CG.ui.toast('Let it bloom!', 'bad');
        CG.audio.play('buzz');
      }
      if (v60.bloomT <= 0) {
        if (bloom) bloom.classList.add('hidden');
        msgEl.textContent = 'Second pour — to the middle line.';
        var note = panel.querySelector('#v60-note');
        if (note) note.textContent = 'Pour to the second line, then release.';
        showLine(2);
      }
      return;
    }
    if (v60.pouring && v60.phase < 3) {
      v60.level = Math.min(112, v60.level + 17 * CG.upgradeValue('kettle') * dt / 1);
      var fill = stageEl.querySelector('#v60-fill');
      if (fill) fill.setAttribute('y', 112 - v60.level / 100 * 50);
      var water = stageEl.querySelector('#v60-water');
      if (water) { water.setAttribute('rx', 18); water.setAttribute('ry', 5); }
      // stream follows the kettle spout
      var s = overlayEl.querySelector('#kstream');
      if (s) {
        s.style.left = (v60.kx - 16) + '%';
        s.style.top = (v60.ky + 2) + '%';
      }
      if (v60.level >= 112) { setPouring(false); v60Release(); }
    } else {
      var w = stageEl.querySelector('#v60-water');
      if (w) { w.setAttribute('rx', 0); w.setAttribute('ry', 0); }
    }
  }

  /* ================= aeropress: steep timing + steady press ================= */

  function setupAero() {
    phase = 'aero';
    aero = { steepT: 0, steeping: false, steepScore: 0, pressY: 0, pressing: false, pauses: 0, started: false };
    spendBean();
    controlsEl.innerHTML = '<button class="btn btn-primary btn-wide" id="aero-start">Add coffee &amp; water</button>';
    msgEl.textContent = 'Immersion brew — timing is everything.';
    controlsEl.querySelector('#aero-start').addEventListener('click', function () {
      CG.audio.play('pour');
      aero.steeping = true;
      var brew = stageEl.querySelector('#aero-brew');
      if (brew) brew.setAttribute('opacity', '0.9');
      overlayEl.innerHTML = '<div class="steep-ring" id="steep-ring"><span></span></div>';
      controlsEl.innerHTML = '<button class="btn btn-primary btn-wide" id="aero-go">Press!</button>';
      msgEl.textContent = 'Steep… press when the ring closes.';
      controlsEl.querySelector('#aero-go').addEventListener('click', function () {
        if (!aero.steeping) return;
        aero.steeping = false;
        aero.steepScore = d.clamp(100 - Math.abs(aero.steepT - 3) / 0.9 * 50, 0, 100);
        CG.audio.play(aero.steepScore >= 60 ? 'chime' : 'buzz');
        startPress();
      });
    });
  }

  function startPress() {
    overlayEl.innerHTML = '<div class="dock-zone hot press-zone" id="press-zone" style="left:30%;top:38%;width:25%;height:15%"><span>hold to press</span></div>';
    msgEl.textContent = 'Press slowly and steadily to the bottom.';
    controlsEl.innerHTML = '<p class="control-note">Lifting off mid-press costs you.</p>';
    var zone = overlayEl.querySelector('#press-zone');
    zone.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      zone.setPointerCapture(e.pointerId);
      if (aero.started && !aero.pressing) aero.pauses++;
      aero.started = true;
      aero.pressing = true;
      CG.audio.play('steam');
    });
    var up = function () { aero.pressing = false; };
    zone.addEventListener('pointerup', up);
    zone.addEventListener('pointercancel', up);
  }

  function aeroUpdate(dt) {
    if (aero.steeping) {
      aero.steepT += dt;
      var ring = overlayEl.querySelector('#steep-ring span');
      if (ring) ring.style.transform = 'scale(' + Math.min(aero.steepT / 3, 1.15) + ')';
      if (aero.steepT > 4.4) { // oversteeped — auto press
        aero.steeping = false;
        aero.steepScore = 35;
        CG.ui.toast('Oversteeped', 'bad');
        startPress();
      }
      return;
    }
    if (aero.pressing && aero.pressY < 44) {
      aero.pressY += 19 * dt;
      var pl = stageEl.querySelector('#aero-plunger');
      if (pl) pl.setAttribute('transform', 'translate(0,' + Math.min(aero.pressY, 44) + ')');
      var fill = stageEl.querySelector('#aero-fill');
      if (fill) fill.setAttribute('y', 120 - (aero.pressY / 44) * 38);
      if (aero.pressY >= 44) {
        var pressScore = d.clamp(100 - aero.pauses * 15, 40, 100);
        finishBrew(0.5 * aero.steepScore + 0.5 * pressScore);
      }
    }
  }

  /* ================= batch: keep the carafe stocked ================= */

  function setupBatch() {
    phase = 'batch';
    var sv = CG.state.service;
    renderBatchFill();
    if (sv.batchCarafe > 0) {
      msgEl.textContent = 'The carafe is hot — draw a cup.';
      controlsEl.innerHTML = '<button class="btn btn-primary btn-wide" id="batch-draw">Draw a cup (' + sv.batchCarafe + ' left)</button>';
      controlsEl.querySelector('#batch-draw').addEventListener('click', function () {
        sv.batchCarafe--;
        renderBatchFill();
        var q = sv.roastQuality[d.BATCH_ORIGIN];
        finishBrew(d.clamp(70 + ((q == null ? 70 : q) - 70) * 0.6, 55, 92));
      });
    } else if (sv.roastInventory[d.BATCH_ORIGIN] > 0) {
      msgEl.textContent = 'The carafe is empty.';
      controlsEl.innerHTML = '<button class="btn btn-primary btn-wide" id="batch-brew">Brew a fresh batch</button>';
      controlsEl.querySelector('#batch-brew').addEventListener('click', function () {
        sv.roastInventory[d.BATCH_ORIGIN]--;
        CG.events.emit('inventorychange');
        batch = { brewing: true, t: 0 };
        var drip = stageEl.querySelector('#batch-drip');
        if (drip) drip.setAttribute('opacity', '1');
        CG.audio.play('pour');
        msgEl.textContent = 'Brewing…';
        controlsEl.innerHTML = '<p class="control-note">The smell of fresh filter coffee.</p>';
      });
    } else {
      stageEl.classList.add('dim');
      msgEl.innerHTML = 'No <b>Colombia</b> roasted for the batch.';
      controlsEl.innerHTML = '<button class="btn btn-warn btn-wide" id="goto-roast2">To the Roastery →</button>';
      controlsEl.querySelector('#goto-roast2').addEventListener('click', function () { CG.main.switchStation('roast'); });
    }
  }

  function renderBatchFill() {
    var sv = CG.state.service;
    var fill = stageEl.querySelector('#batch-fill');
    if (fill) fill.setAttribute('y', 106 - (sv.batchCarafe / d.BATCH_CARAFE) * 44);
  }

  function batchUpdate(dt) {
    if (!batch.brewing) return;
    batch.t += dt;
    var sv = CG.state.service;
    var fill = stageEl.querySelector('#batch-fill');
    if (fill) fill.setAttribute('y', 106 - Math.min(batch.t / 3.2, 1) * 44);
    if (batch.t >= 3.2) {
      batch.brewing = false;
      sv.batchCarafe = d.BATCH_CARAFE;
      var drip = stageEl.querySelector('#batch-drip');
      if (drip) drip.setAttribute('opacity', '0');
      CG.audio.play('chime');
      setupBatch();
    }
  }

  /* ---------- per-frame ---------- */

  function update(dt) {
    if (phase === 'shot' && shot.running) {
      var rate = 22 + 40 * Math.sin(Math.PI * Math.min(shot.fill, 100) / 100);
      shot.fill += rate * dt;
      var fill = stageEl.querySelector('#esp-fill');
      if (fill) fill.setAttribute('y', 33 - Math.min(shot.fill, 112) / 100 * 31);
      var crema = stageEl.querySelector('#esp-crema');
      if (crema) crema.setAttribute('y', 33 - Math.min(shot.fill, 112) / 100 * 31);
      if (shot.fill > 115) stopShot();
    }
    if (phase === 'v60') v60Update(dt);
    if (phase === 'aero') aeroUpdate(dt);
    if (phase === 'batch') batchUpdate(dt);
  }

  function exit() {
    if (phase !== 'done' && ticket) refundBean();
    phase = 'pick';
    ticket = null;
    batch.brewing = false;
  }

  return { init: init, enter: enter, exit: exit, update: update, resetDay: exit };
})();
