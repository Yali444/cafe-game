/* Crackle & Pour — milk station: steam to temperature + foam targets */
CG.stations.milk = (function () {
  'use strict';

  var d = CG.data;
  var panel, msgEl, stageEl, controlsEl, gaugesEl;
  var ticket = null;
  var phase = 'pick';        // pick | steam | done
  var steaming = false;
  var pos = 0.8;             // pitcher depth 0 (surface/foamy) .. 1 (deep/hot)
  var temp = 0, foam = 0;
  var steamTime = 0;         // accumulated; releasing after a real steam finishes the pour
  var dragId = null, dragZone = null;
  var steamSfxT = 0;

  function init() {
    panel = document.getElementById('panel-milk');
    panel.innerHTML =
      '<div class="station-head"><h2>Milk Bar</h2><p class="hint" id="milk-msg"></p></div>' +
      '<div class="scene-wrap milk-scene">' +
      '  <div id="milk-rig" class="scene-host"></div>' +
      '  <div id="milk-gauges" class="gauges-overlay">' +
      '    <div class="gauge"><div class="gauge-track"><div class="gauge-band" id="band-temp"></div>' +
      '      <div class="gauge-fill temp" id="fill-temp"></div></div><label>Heat</label></div>' +
      '    <div class="gauge"><div class="gauge-track"><div class="gauge-band" id="band-foam"></div>' +
      '      <div class="gauge-fill foam" id="fill-foam"></div></div><label>Foam</label></div>' +
      '  </div>' +
      '</div>' +
      '<div id="milk-controls" class="brew-controls"></div>';
    msgEl = panel.querySelector('#milk-msg');
    stageEl = panel.querySelector('#milk-rig');
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
    if (sv.holding.milk) {
      ticket = null;
      msgEl.textContent = 'Steamed milk is waiting on the shelf.';
      stageEl.innerHTML = CG.svg.sceneMilk();
      stageEl.classList.remove('dim');
      controlsEl.innerHTML = '<button class="btn btn-primary" id="milk-build">Deliver it at Build →</button>';
      controlsEl.querySelector('#milk-build').addEventListener('click', function () { CG.main.switchStation('build'); });
      gaugesEl.classList.add('hidden');
      return;
    }
    ticket = CG.tickets.pickFor('milk');
    phase = 'pick';
    gaugesEl.classList.add('hidden');
    stageEl.innerHTML = CG.svg.sceneMilk();
    if (!ticket) {
      msgEl.textContent = 'No drinks need milk right now.';
      controlsEl.innerHTML = '';
      stageEl.classList.add('dim');
      return;
    }
    stageEl.classList.remove('dim');
    var cust = CG.customers.byId(ticket.customerId);
    msgEl.innerHTML = d.RECIPES[ticket.recipe].name + ' milk for <b>' + d.CHARACTERS[cust.charId].name + '</b>';
    controlsEl.innerHTML = '<button class="btn btn-primary" id="milk-start">Start Steaming</button>';
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
    controlsEl.innerHTML =
      '<div class="milk-dragzone" id="milk-dragzone">' +
      '  <div class="dz-label top">↑ near surface — builds FOAM</div>' +
      '  <div class="dz-pitcher" id="dz-pitcher">' + CG.svg.icon('milk') + '<span>hold &amp; drag</span></div>' +
      '  <div class="dz-label bot">↓ deep — builds HEAT</div>' +
      '</div>';
    msgEl.textContent = 'Hold the pitcher, drag up for foam, down for heat. Release inside both bands!';

    dragZone = controlsEl.querySelector('#milk-dragzone');
    var pitcher = controlsEl.querySelector('#dz-pitcher');
    dragZone.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      dragZone.setPointerCapture(e.pointerId);
      dragId = e.pointerId;
      steaming = true;
      movePitcher(e);
      setSteamFx(true);
    });
    dragZone.addEventListener('pointermove', function (e) {
      if (e.pointerId === dragId) movePitcher(e);
    });
    var stop = function (e) {
      if (e.pointerId !== dragId) return;
      dragId = null;
      steaming = false;
      setSteamFx(false);
      // a real steam session ends on release; a stray tap just pauses
      if (steamTime > 0.4) finish();
    };
    dragZone.addEventListener('pointerup', stop);
    dragZone.addEventListener('pointercancel', stop);

    function movePitcher(e) {
      var r = dragZone.getBoundingClientRect();
      pos = d.clamp((e.clientY - r.top) / r.height, 0, 1);
      pitcher.style.top = (pos * 100) + '%';
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
    var foamRect = stageEl.querySelector('#milk-foam');
    if (foamRect) foamRect.setAttribute('height', 4 + foam / 100 * 16);
  }

  function update(dt) {
    if (phase !== 'steam' || !steaming) return;
    steamTime += dt;
    var speed = CG.upgradeValue('steamer');
    // deep = heat fast; shallow = foam fast
    temp += (6 + 16 * pos) * speed * dt;
    foam += (1 + 22 * (1 - pos)) * speed * dt;
    steamSfxT += dt;
    if (steamSfxT > 0.28) { steamSfxT = 0; CG.audio.play('steam'); }
    updateGauges();
    if (temp >= 100) {
      steaming = false;
      dragId = null;
      setSteamFx(false);
      CG.audio.play('screech');
      CG.ui.toast('Scorched the milk!', 'bad');
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
    msgEl.textContent = 'Milk steamed — ' + score + '%!';
    controlsEl.innerHTML = '<button class="btn btn-primary" id="milk-build2">Deliver at Build →</button>';
    controlsEl.querySelector('#milk-build2').addEventListener('click', function () { CG.main.switchStation('build'); });
    ticket = null;
  }

  function exit() {
    steaming = false;
    dragId = null;
    phase = 'pick';
    ticket = null;
  }

  return { init: init, enter: enter, exit: exit, update: update, resetDay: exit };
})();
