/* FIKA — milk bar: hold the pitcher under the wand; depth sets foam vs heat */
CG.stations.milk = (function () {
  'use strict';

  var d = CG.data;
  var panel, msgEl, stageEl, overlayEl, controlsEl, gaugesEl;
  var ticket = null;
  var phase = 'pick';        // pick | steam | done
  var steaming = false;
  var pos = 0.8;             // 0 = tip near surface (foam), 1 = deep (heat)
  var temp = 0, foam = 0;
  var steamTime = 0;
  var steamSfxT = 0;

  function init() {
    panel = document.getElementById('panel-milk');
    panel.innerHTML =
      '<div class="station-head"><h2>Milk Bar</h2><p class="hint" id="milk-msg"></p></div>' +
      '<div class="scene-wrap milk-scene">' +
      '  <div id="milk-rig" class="scene-host"></div>' +
      '  <div id="milk-overlays" class="scene-overlays"></div>' +
      '  <div id="milk-gauges" class="gauges-overlay hidden">' +
      '    <div class="gauge"><div class="gauge-track"><div class="gauge-band" id="band-temp"></div>' +
      '      <div class="gauge-fill temp" id="fill-temp"></div></div><label class="gauge-tag">heat</label></div>' +
      '    <div class="gauge"><div class="gauge-track"><div class="gauge-band" id="band-foam"></div>' +
      '      <div class="gauge-fill foam" id="fill-foam"></div></div><label class="gauge-tag">foam</label></div>' +
      '  </div>' +
      '</div>' +
      '<div id="milk-controls" class="station-controls"></div>';
    msgEl = panel.querySelector('#milk-msg');
    stageEl = panel.querySelector('#milk-rig');
    overlayEl = panel.querySelector('#milk-overlays');
    gaugesEl = panel.querySelector('#milk-gauges');
    controlsEl = panel.querySelector('#milk-controls');
    CG.events.on('ticketschange', function () {
      if (CG.state.service && CG.state.service.activeStation === 'milk' && phase === 'pick') enter();
    });
  }

  function targets() { return d.RECIPES[ticket.recipe].milk; }

  function enter() {
    var sv = CG.state.service;
    steaming = false;
    overlayEl.innerHTML = '';
    gaugesEl.classList.add('hidden');
    stageEl.innerHTML = CG.svg.sceneMilk();
    if (sv.holding.milk) {
      ticket = null;
      msgEl.textContent = 'Textured milk is waiting on the pass shelf.';
      stageEl.classList.remove('dim');
      controlsEl.innerHTML = '<button class="btn btn-primary btn-wide" id="milk-pass">Take it to the Pass →</button>';
      controlsEl.querySelector('#milk-pass').addEventListener('click', function () { CG.main.switchStation('build'); });
      return;
    }
    ticket = CG.tickets.pickFor('milk');
    phase = 'pick';
    if (!ticket) {
      msgEl.textContent = 'No milk to steam right now.';
      controlsEl.innerHTML = '';
      stageEl.classList.add('dim');
      return;
    }
    stageEl.classList.remove('dim');
    var cust = CG.customers.byId(ticket.customerId);
    var r = d.RECIPES[ticket.recipe];
    msgEl.innerHTML = r.name + ' milk for <b>' + d.CHARACTERS[cust.charId].name + '</b>' +
      ' · <span class="note">' + (r.foamHint || (r.art ? 'silky microfoam' : 'gently steamed')) + '</span>';
    controlsEl.innerHTML = '<button class="btn btn-primary btn-wide" id="milk-start">Pick up the pitcher</button>';
    controlsEl.querySelector('#milk-start').addEventListener('click', startSteam);
  }

  function startSteam() {
    phase = 'steam';
    temp = 0; foam = 0; pos = 0.8; steamTime = 0;
    CG.audio.play('select');
    gaugesEl.classList.remove('hidden');
    var t = targets();
    setBand('#band-temp', t.temp);
    setBand('#band-foam', t.foam);
    updateGauges();
    msgEl.textContent = 'Hold the pitcher — raise it for foam, lower it for heat. Release inside both bands.';
    controlsEl.innerHTML = '<p class="control-note">Tip near the surface stretches; deep heats.</p>';

    overlayEl.innerHTML = '<div class="drag-el pitcher-el" id="pitcher" style="left:26%;top:56%;width:28%">' + CG.svg.pitcherSvg() + '</div>';
    var pitcher = overlayEl.querySelector('#pitcher');
    var pid = null;

    pitcher.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      pitcher.setPointerCapture(e.pointerId);
      pid = e.pointerId;
      steaming = true;
      pitcher.classList.add('grabbed');
      setSteamFx(true);
      movePitcher(e);
    });
    pitcher.addEventListener('pointermove', function (e) {
      if (e.pointerId === pid) movePitcher(e);
    });
    var stop = function (e) {
      if (e.pointerId !== pid) return;
      pid = null;
      steaming = false;
      pitcher.classList.remove('grabbed');
      setSteamFx(false);
      if (steamTime > 0.4) finish();
    };
    pitcher.addEventListener('pointerup', stop);
    pitcher.addEventListener('pointercancel', stop);

    function movePitcher(e) {
      var host = overlayEl.getBoundingClientRect();
      var y = d.clamp((e.clientY - host.top) / host.height, 0.42, 0.8);
      pos = (y - 0.42) / 0.38;                 // 0 high (foam) .. 1 low (heat)
      pitcher.style.top = (y * 100 - 9) + '%';
    }
  }

  function setSteamFx(on) {
    var s = stageEl.querySelector('#milk-steam');
    if (s) s.setAttribute('opacity', on ? '1' : '0');
  }

  function setBand(sel, t) {
    var el = panel.querySelector(sel);
    el.style.bottom = (t[0] - t[1]) + '%';
    el.style.height = (t[1] * 2) + '%';
  }

  function updateGauges() {
    panel.querySelector('#fill-temp').style.transform = 'scaleY(' + (Math.min(temp, 100) / 100).toFixed(3) + ')';
    panel.querySelector('#fill-foam').style.transform = 'scaleY(' + (Math.min(foam, 100) / 100).toFixed(3) + ')';
    var foamRect = overlayEl.querySelector('#milk-foam');
    if (foamRect) foamRect.setAttribute('height', 4 + foam / 100 * 14);
  }

  function update(dt) {
    if (phase !== 'steam' || !steaming) return;
    steamTime += dt;
    var speed = CG.upgradeValue('pitcher');
    temp += (6 + 16 * pos) * speed * dt;
    foam += (1 + 22 * (1 - pos)) * speed * dt;
    steamSfxT += dt;
    if (steamSfxT > 0.28) { steamSfxT = 0; CG.audio.play('steam'); }
    updateGauges();
    if (temp >= 100) {
      steaming = false;
      setSteamFx(false);
      CG.audio.play('screech');
      CG.ui.toast('Scorched the milk', 'bad');
      finish(true);
    }
  }

  function finish(overheated) {
    if (phase !== 'steam') return;
    phase = 'done';
    var t = targets();
    var tempScore = d.clamp(100 - Math.abs(temp - t.temp[0]) / t.temp[1] * 50, 0, 100);
    var foamScore = d.clamp(100 - Math.abs(foam - t.foam[0]) / t.foam[1] * 50, 0, 100);
    var score = Math.round(0.5 * tempScore + 0.5 * foamScore);
    if (overheated === true) score = Math.min(score, 30);

    CG.state.service.holding.milk = { ticketId: ticket.id, type: 'milk', score: score };
    CG.audio.play(score >= 85 ? 'fanfare' : score >= 50 ? 'chime' : 'buzz');
    CG.ui.updateHUD();
    msgEl.textContent = 'Milk textured — ' + score + '.';
    overlayEl.innerHTML = '';
    controlsEl.innerHTML = '<button class="btn btn-primary btn-wide" id="milk-pass2">Take it to the Pass →</button>';
    controlsEl.querySelector('#milk-pass2').addEventListener('click', function () { CG.main.switchStation('build'); });
    ticket = null;
  }

  function exit() {
    steaming = false;
    phase = 'pick';
    ticket = null;
  }

  return { init: init, enter: enter, exit: exit, update: update, resetDay: exit };
})();
