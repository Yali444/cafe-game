/* FIKA — brew bar: dial-in espresso, hands-on V60, AeroPress, batch carafe */
CG.stations.brew = (function () {
  'use strict';

  var d = CG.data;
  var panel, msgEl, stageEl, overlayEl, controlsEl, sceneWrapEl;
  var ticket = null;
  var mode = null;            // espresso | v60 | aero | batch
  var phase = 'pick';
  var beanSpent = false;

  /* espresso state */
  var dial = { center: 55, v: 50, dragging: false, score: 0 };
  var pull = { level: 0, pouring: false, score: 0 };
  var PULL_TARGET = 70;       // crema should reach 70% of the glass
  var PULL_BAND = 12;         // ± tolerance (generous, readable)
  var PULL_RATE = 25;         // %/sec — slow & steady so you can stop on the line

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
    sceneWrapEl = panel.querySelector('.scene-wrap');
    CG.events.on('ticketschange', function () { if (active() && phase === 'choose') chooseOrder(); });
    CG.events.on('inventorychange', function () { if (active() && (phase === 'choose' || phase === 'method')) chooseOrder(); });
  }

  function active() { return CG.state.service && CG.state.service.activeStation === 'brew'; }

  function pct(n, of) { return (n / of * 100) + '%'; }

  /* ---------- entry: pick an order, then pick how to brew it ---------- */

  var METHODS = [
    { mode: 'espresso', title: 'Espresso', sub: 'machine' },
    { mode: 'v60',      title: 'Pour-over', sub: 'V60' },
    { mode: 'aero',     title: 'AeroPress', sub: 'immersion' },
    { mode: 'batch',    title: 'Batch',     sub: 'filter' }
  ];
  function methodTitle(m) { for (var i = 0; i < METHODS.length; i++) if (METHODS[i].mode === m) return METHODS[i].title; return m; }

  function enter() { chooseOrder(); }

  function chooseOrder() {
    phase = 'choose';
    ticket = null;
    overlayEl.innerHTML = '';
    setBackdrop('espresso');
    stageEl.classList.add('dim');
    var list = CG.tickets.needing('brew');
    if (!list.length) {
      msgEl.textContent = 'No orders waiting to brew.';
      controlsEl.innerHTML = '<p class="control-note">Take an order at the counter first.</p>';
      return;
    }
    msgEl.textContent = 'Choose an order to brew';
    controlsEl.innerHTML = '<div class="brew-orders">' + list.map(function (t) {
      var cust = CG.customers.byId(t.customerId);
      var nm = d.CHARACTERS[cust.charId].name;
      var r = d.RECIPES[t.recipe];
      var o = t.origin ? d.ORIGINS[t.origin].short : '';
      return '<button class="brew-order-card" data-tid="' + t.id + '">' +
        '<span class="boc-cust">' + CG.svg.customer(cust.charId, cust.mood) + '</span>' +
        '<span class="boc-info"><b>' + nm + '</b><small>' + r.name + (o ? ' · ' + o : '') + '</small></span>' +
        '<span class="boc-go">→</span></button>';
    }).join('') + '</div>';
    controlsEl.querySelectorAll('.brew-order-card').forEach(function (el) {
      el.addEventListener('click', function () {
        CG.audio.play('tap');
        var t = CG.tickets.byId(el.getAttribute('data-tid'));
        if (t) { CG.tickets.select(t.id); chooseMethod(t); }
      });
    });
  }

  function chooseMethod(t) {
    phase = 'method';
    ticket = t;
    overlayEl.innerHTML = '';
    setBackdrop('espresso');
    stageEl.classList.add('dim');
    var cust = CG.customers.byId(t.customerId);
    var nm = d.CHARACTERS[cust.charId].name;
    var r = d.RECIPES[t.recipe];
    msgEl.innerHTML = 'How will you brew the <b>' + r.name + '</b> for ' + nm + '?';
    controlsEl.innerHTML = '<div class="brew-methods">' + METHODS.map(function (m) {
      return '<button class="brew-method" data-mode="' + m.mode + '"><b>' + m.title + '</b><small>' + m.sub + '</small></button>';
    }).join('') + '</div><button class="btn btn-ghost btn-wide brew-back">← back to orders</button>';
    controlsEl.querySelectorAll('.brew-method').forEach(function (el) {
      el.addEventListener('click', function () {
        var picked = el.getAttribute('data-mode');
        if (picked === r.brew) { CG.audio.play('select'); startBrewing(t, picked); }
        else {
          CG.audio.play('buzz');
          CG.ui.toast(nm + ' asked for a ' + r.name + ' — use the ' + methodTitle(r.brew), 'bad');
        }
      });
    });
    controlsEl.querySelector('.brew-back').addEventListener('click', function () { CG.audio.play('tap'); chooseOrder(); });
  }

  function startBrewing(t, m) {
    var sv = CG.state.service;
    ticket = t; mode = m;
    phase = 'brewing';
    overlayEl.innerHTML = '';
    setBackdrop(mode);
    stageEl.classList.remove('dim');
    var cust = CG.customers.byId(ticket.customerId);
    var name = d.CHARACTERS[cust.charId].name;
    var o = ticket.origin ? d.ORIGINS[ticket.origin] : null;

    if (mode !== 'batch' && o && sv.roastInventory[ticket.origin] <= 0) {
      stageEl.classList.add('dim');
      msgEl.innerHTML = 'No roasted <b>' + o.short + '</b> on the shelf.';
      controlsEl.innerHTML = '<button class="btn btn-warn btn-wide" id="goto-roast">To the Roastery →</button>' +
        '<button class="btn btn-ghost btn-wide brew-back">← back to orders</button>';
      controlsEl.querySelector('#goto-roast').addEventListener('click', function () { CG.main.switchStation('roast'); });
      controlsEl.querySelector('.brew-back').addEventListener('click', function () { CG.audio.play('tap'); chooseOrder(); });
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

  function setBackdrop(m) { stageEl.innerHTML = sceneFor(m); }

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

  /* ================= espresso: grind dial → hold-to-pour, stop in the band ================= */

  function setupEspresso() {
    phase = 'dial';
    dial.center = 30 + Math.random() * 40;
    dial.v = 8;
    dial.dragging = false;
    pull = { level: 0, pouring: false, score: 0 };
    var win = CG.upgradeValue('grinder') * 100;

    overlayEl.innerHTML =
      '<div class="dial-plate" style="left:8%;right:8%;top:30%;width:auto">' +
      '  <span class="dial-label">grind — line up the dial</span>' +
      '  <div class="dial-track" id="dial-track">' +
      '    <div class="dial-window" style="left:' + (dial.center - win / 2) + '%;width:' + win + '%"></div>' +
      '    <div class="dial-knob" id="dial-knob" style="left:' + dial.v + '%"></div>' +
      '  </div>' +
      '</div>';
    controlsEl.innerHTML = '<p class="control-note">Drag the dial into the green band, then let go.</p>';

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
      startPull();
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

  /* ---- the pull: hold to pour a slow shot; the cup fills in the scene ---- */
  function startPull() {
    phase = 'shot';
    pull = { level: 0, pouring: false, score: 0 };
    paintCup();
    var stream = stageEl.querySelector('#esp-stream');
    if (stream) stream.setAttribute('opacity', '0');
    overlayEl.innerHTML = '<div class="pour-status" id="shot-status">hold to pour</div>';
    msgEl.textContent = 'Hold to pull the shot — let go when the crema reaches the line.';
    controlsEl.innerHTML = '<button class="btn btn-primary btn-wide hold-pour" id="hold-pour">Hold to pour</button>';

    var btn = controlsEl.querySelector('#hold-pour');
    var down = function (e) {
      e.preventDefault(); pull.pouring = true; btn.classList.add('held');
      var s = stageEl.querySelector('#esp-stream'); if (s) s.setAttribute('opacity', '1');
      CG.audio.play('pour');
    };
    var up = function () { if (phase === 'shot' && pull.pouring) endPull(); };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
  }

  // map the 0..100 fill level to the scene cup's liquid + crema (y grows downward)
  function paintCup() {
    var y = 33 - Math.min(pull.level, 112) / 100 * 31;
    var fill = stageEl.querySelector('#esp-fill');
    if (fill) fill.setAttribute('y', y);
    var crema = stageEl.querySelector('#esp-crema');
    if (crema) crema.setAttribute('y', y);
  }

  function pullUpdate(dt) {
    if (phase !== 'shot' || !pull.pouring) return;
    pull.level = Math.min(118, pull.level + PULL_RATE * dt);
    paintCup();
    var inBand = Math.abs(pull.level - PULL_TARGET) <= PULL_BAND;
    var target = stageEl.querySelector('#esp-target');
    if (target) target.setAttribute('stroke', inBand ? '#5aa45a' : '#c98d5e');
    var status = overlayEl.querySelector('#shot-status');
    if (status) {
      if (pull.level > PULL_TARGET + PULL_BAND) { status.textContent = 'too much'; status.className = 'pour-status over'; }
      else if (inBand) { status.textContent = 'perfect — let go'; status.className = 'pour-status good'; }
      else { status.textContent = 'pouring…'; status.className = 'pour-status'; }
    }
    if (pull.level >= 118) endPull(); // overflowed
  }

  function endPull() {
    if (phase !== 'shot') return;
    pull.pouring = false;
    var btn = controlsEl.querySelector('#hold-pour');
    if (btn) btn.classList.remove('held');
    var stream = stageEl.querySelector('#esp-stream');
    if (stream) stream.setAttribute('opacity', '0');
    var over = pull.level > PULL_TARGET + PULL_BAND;
    var score = over
      ? d.clamp(60 - (pull.level - (PULL_TARGET + PULL_BAND)) * 3, 15, 60)
      : d.clamp(100 - Math.abs(pull.level - PULL_TARGET) / PULL_BAND * 45, 0, 100);
    pull.score = score;
    finishBrew(0.4 * dial.score + 0.6 * score);
  }

  /* ================= v60: grab the kettle, pour in phases ================= */

  var V60_BLOOM = 45, V60_FINAL = 300;   // pour-over targets, in grams

  function setupV60() {
    phase = 'v60';
    v60 = { grams: 0, stage: 'bloom', pouring: false, bloomT: 0, penalty: 0,
            kx: 50, ky: 12, grabbed: false, pid: null, bloomScore: 0 };
    spendBean();
    overlayEl.innerHTML =
      '<div class="drag-el kettle-el" id="kettle" style="left:46%;top:5%;width:32%">' + CG.svg.kettle() + '</div>' +
      '<div class="pour-stream hidden" id="kstream"></div>' +
      '<div class="scale-readout" id="v60-scale"><b id="v60-g">0</b> g <span class="scale-tgt" id="v60-tgt">/ ' + V60_BLOOM + ' g · bloom</span></div>';
    controlsEl.innerHTML = '<p class="control-note" id="v60-note">Hold the kettle over the grounds — pour to about ' + V60_BLOOM + ' g, then lift off to bloom.</p>';
    msgEl.textContent = 'Pour-over — wet the coffee bed evenly.';

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
      kettleEl.style.left = d.clamp(v60.kx - 16, -8, 72) + '%';
      kettleEl.style.top = d.clamp(v60.ky - 6, -4, 70) + '%';
      // pour only when the spout tip hovers over the coffee bed (top of the rig)
      var overBed = v60.kx > 18 && v60.kx < 58 && v60.ky > 12 && v60.ky < 44;
      setPouring(overBed && (v60.stage === 'bloom' || v60.stage === 'main'));
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

  function v60ScaleTick() {
    var g = panel.querySelector('#v60-g');
    if (g) g.textContent = Math.round(v60.grams);
    var tgt = v60.stage === 'main' ? V60_FINAL : V60_BLOOM;
    var tol = v60.stage === 'main' ? 22 : 10;
    var el = panel.querySelector('#v60-scale');
    if (el) el.classList.toggle('on', Math.abs(v60.grams - tgt) <= tol);
  }

  function v60Release() {
    if (phase !== 'v60') return;
    if (v60.stage === 'bloom') {
      if (v60.grams < 12) return; // not a real pour yet
      v60.bloomScore = d.clamp(100 - Math.abs(v60.grams - V60_BLOOM) * 2.4, 0, 100);
      v60.stage = 'bloomwait';
      v60.bloomT = 2.2;
      CG.audio.play(v60.bloomScore >= 60 ? 'chime' : 'tap');
      msgEl.textContent = 'Let it bloom…';
      var note = panel.querySelector('#v60-note');
      if (note) note.textContent = 'Wait for the bloom to settle — don\'t pour.';
    } else if (v60.stage === 'main') {
      if (v60.grams < V60_BLOOM + 20) return;
      var mainScore = d.clamp(100 - Math.abs(v60.grams - V60_FINAL) * 0.6, 0, 100);
      v60.stage = 'done';
      finishBrew(Math.max(0, v60.bloomScore * 0.4 + mainScore * 0.6 - v60.penalty));
    }
  }

  function v60Update(dt) {
    if (v60.stage === 'bloomwait') {
      v60.bloomT -= dt;
      if (v60.pouring && v60.penalty === 0) {
        v60.penalty = 15;
        CG.ui.toast('Let it bloom!', 'bad');
        CG.audio.play('buzz');
      }
      var w = stageEl.querySelector('#v60-water');
      if (w) { var r = 27 + Math.sin(Date.now() / 180) * 2.5; w.setAttribute('rx', r); w.setAttribute('ry', r * 0.17); }
      if (v60.bloomT <= 0) {
        v60.stage = 'main';
        var t = panel.querySelector('#v60-tgt');
        if (t) t.textContent = '/ ' + V60_FINAL + ' g';
        msgEl.textContent = 'Main pour — up to ' + V60_FINAL + ' g.';
        var note = panel.querySelector('#v60-note');
        if (note) note.textContent = 'Pour in slow spirals to ' + V60_FINAL + ' g, then lift off.';
        v60ScaleTick();
      }
      return;
    }
    if (v60.pouring && (v60.stage === 'bloom' || v60.stage === 'main')) {
      v60.grams = Math.min(380, v60.grams + 60 * CG.upgradeValue('kettle') * dt);
      v60ScaleTick();
      var water = stageEl.querySelector('#v60-water');
      if (water) { var rr = Math.min(30, v60.grams / 6); water.setAttribute('rx', rr); water.setAttribute('ry', rr * 0.17); }
      var fillFrac = d.clamp((v60.grams - 30) / (V60_FINAL - 30), 0, 1);
      var fill = stageEl.querySelector('#v60-fill');
      if (fill) fill.setAttribute('y', 114 - fillFrac * 44);
      var s = overlayEl.querySelector('#kstream');
      if (s) { s.style.left = (v60.kx - 13) + '%'; s.style.top = (v60.ky + 2) + '%'; }
    }
  }

  /* ================= aeropress: steep timing + steady press ================= */

  function setupAero() {
    phase = 'aero';
    aero = { stage: 'steep', steepT: 0, target: 3.0, steepScore: 0,
             pressY: 0, jerk: 0, lastClientY: 0 };
    spendBean();
    var brew = stageEl.querySelector('#aero-brew');
    if (brew) brew.setAttribute('opacity', '0.9');
    var fill = stageEl.querySelector('#aero-fill');
    if (fill) { fill.setAttribute('y', '84'); fill.setAttribute('height', '36'); }
    overlayEl.innerHTML = '<div class="steep-readout" id="aero-timer"><b>0.0</b>s <span class="scale-tgt">steep ' + aero.target.toFixed(1) + 's</span></div>';
    msgEl.textContent = 'Immersion brew — let it steep, then press.';
    controlsEl.innerHTML = '<button class="btn btn-primary btn-wide" id="aero-go">Press now</button>';
    controlsEl.querySelector('#aero-go').addEventListener('click', function () {
      if (aero.stage !== 'steep') return;
      aero.steepScore = d.clamp(100 - Math.abs(aero.steepT - aero.target) / 1.0 * 50, 0, 100);
      CG.audio.play(aero.steepScore >= 60 ? 'chime' : 'buzz');
      startPress();
    });
  }

  function startPress() {
    aero.stage = 'press';
    msgEl.textContent = 'Press the plunger down — slow and steady.';
    controlsEl.innerHTML = '<p class="control-note">Drag the plunger down evenly. Don\'t rush it.</p>';
    overlayEl.innerHTML =
      '<div class="press-handle" id="aero-press"><span>press ↓</span></div>' +
      '<div class="press-meter"><div class="press-bar" id="aero-bar"></div></div>';
    var h = overlayEl.querySelector('#aero-press');
    var dragging = false, startClientY = 0, startPressY = 0;
    h.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      h.setPointerCapture(e.pointerId);
      dragging = true; startClientY = e.clientY; startPressY = aero.pressY; aero.lastClientY = e.clientY;
      CG.audio.play('steam');
    });
    h.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var host = overlayEl.getBoundingClientRect();
      var moved = (e.clientY - startClientY) / host.height * 210;     // % of travel
      var np = d.clamp(startPressY + moved, aero.pressY, 100);        // monotonic, downward only
      var frameSpeed = e.clientY - aero.lastClientY;
      if (frameSpeed > 13) aero.jerk += (frameSpeed - 13);            // yanking → channeling penalty
      aero.lastClientY = e.clientY;
      aero.pressY = np;
      paintPress();
      if (aero.pressY >= 100) { dragging = false; finishAero(); }
    });
    var up = function () { dragging = false; };
    h.addEventListener('pointerup', up);
    h.addEventListener('pointercancel', up);
    paintPress();
  }

  function paintPress() {
    var pl = stageEl.querySelector('#aero-plunger');
    if (pl) pl.setAttribute('transform', 'translate(0,' + (aero.pressY / 100 * 44).toFixed(1) + ')');
    var fill = stageEl.querySelector('#aero-fill');
    if (fill) fill.setAttribute('y', (84 + aero.pressY / 100 * 30).toFixed(1));
    var bar = overlayEl.querySelector('#aero-bar');
    if (bar) bar.style.width = aero.pressY + '%';
    var h = overlayEl.querySelector('#aero-press');
    if (h) h.style.top = (12 + aero.pressY / 100 * 34) + '%';
  }

  function finishAero() {
    var pressScore = d.clamp(100 - aero.jerk * 1.6, 35, 100);
    finishBrew(0.5 * aero.steepScore + 0.5 * pressScore);
  }

  function aeroUpdate(dt) {
    if (aero.stage !== 'steep') return;
    aero.steepT += dt;
    var tm = overlayEl.querySelector('#aero-timer');
    if (tm) {
      tm.querySelector('b').textContent = aero.steepT.toFixed(1);
      tm.classList.toggle('on', Math.abs(aero.steepT - aero.target) <= 0.6);
    }
    if (aero.steepT > aero.target + 2) {       // over-steeped — auto press
      aero.steepScore = 35;
      CG.ui.toast('Oversteeped', 'bad');
      startPress();
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
    if (phase === 'shot') pullUpdate(dt);
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
