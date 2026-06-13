/* FIKA — milk bar: one continuous gesture steams the milk and free-pours the art, then serve */
CG.stations.milk = (function () {
  'use strict';

  var d = CG.data;
  var panel, msgEl, stageEl, overlayEl, controlsEl, gaugesEl, cupEl;
  var ticket = null;
  var phase = 'pick';        // pick | make | done
  var steaming = false;
  var pos = 0.8;             // 0 = tip near surface (foam), 1 = deep (heat)
  var temp = 0, foam = 0, fill = 0;
  var steamTime = 0, steamSfxT = 0;
  var lastX = 0, dir = 0, wiggles = 0;

  function init() {
    panel = document.getElementById('panel-milk');
    panel.innerHTML =
      '<div class="station-head"><h2>Milk Bar</h2><p class="hint" id="milk-msg"></p></div>' +
      '<div class="scene-wrap milk-scene">' +
      '  <div id="milk-rig" class="scene-host"></div>' +
      '  <div id="milk-cup" class="cup-overlay hidden"></div>' +
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
    cupEl = panel.querySelector('#milk-cup');
    controlsEl = panel.querySelector('#milk-controls');
    CG.events.on('ticketschange', function () {
      if (CG.state.service && CG.state.service.activeStation === 'milk' && phase === 'pick') enter();
    });
  }

  function targets() { return d.RECIPES[ticket.recipe].milk; }

  function enter() {
    steaming = false;
    overlayEl.innerHTML = '';
    gaugesEl.classList.add('hidden');
    cupEl.classList.add('hidden');
    cupEl.innerHTML = '';
    stageEl.innerHTML = CG.svg.sceneMilk();
    ticket = CG.tickets.pickFor('milk');
    phase = 'pick';
    if (!ticket) {
      var waiting = CG.tickets.open().filter(function (t) {
        return t.steps.milk && !t.steps.brew.done;
      });
      msgEl.textContent = waiting.length
        ? 'Pull the shot at the Brew bar first.'
        : 'No milk to steam right now.';
      controlsEl.innerHTML = waiting.length
        ? '<button class="btn btn-warn btn-wide" id="goto-brew">To the Brew bar →</button>'
        : '';
      var gb = controlsEl.querySelector('#goto-brew');
      if (gb) gb.addEventListener('click', function () { CG.main.switchStation('brew'); });
      stageEl.classList.add('dim');
      return;
    }
    stageEl.classList.remove('dim');
    var cust = CG.customers.byId(ticket.customerId);
    var r = d.RECIPES[ticket.recipe];
    msgEl.innerHTML = r.name + ' for <b>' + d.CHARACTERS[cust.charId].name + '</b>' +
      ' · <span class="note">' + (r.art ? 'silky microfoam — pour some art' : 'gently steamed') + '</span>';
    controlsEl.innerHTML = '<button class="btn btn-primary btn-wide" id="milk-start">Pick up the pitcher</button>';
    controlsEl.querySelector('#milk-start').addEventListener('click', startMake);
  }

  function startMake() {
    phase = 'make';
    temp = 0; foam = 0; fill = 0; pos = 0.8; steamTime = 0; wiggles = 0; dir = 0;
    CG.audio.play('select');
    gaugesEl.classList.remove('hidden');
    cupEl.classList.remove('hidden');
    var t = targets();
    setBand('#band-temp', t.temp);
    setBand('#band-foam', t.foam);
    updateGauges();
    renderCup();
    var artLine = d.RECIPES[ticket.recipe].art ? ' Wiggle as you pour to draw the art.' : '';
    msgEl.textContent = 'Hold the pitcher — raise it for foam, lower it for heat.' + artLine;
    controlsEl.innerHTML = '<p class="control-note">One smooth motion: texture the milk, then pour. Let go when it looks right.</p>';

    overlayEl.innerHTML = '<div class="drag-el pitcher-el" id="pitcher" style="left:24%;top:54%;width:28%">' + CG.svg.pitcherSvg() + '</div>';
    var pitcher = overlayEl.querySelector('#pitcher');
    var pid = null;

    pitcher.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      pitcher.setPointerCapture(e.pointerId);
      pid = e.pointerId;
      steaming = true;
      lastX = e.clientX;
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
      var x = d.clamp((e.clientX - host.left) / host.width, 0.06, 0.62);
      pitcher.style.left = (x * 100 - 9) + '%';
      pitcher.style.top = (y * 100 - 9) + '%';
      // count wiggles (direction reversals) once the cup is taking milk — that's the art
      if (fill > 0.25) {
        var ddx = e.clientX - lastX;
        if (Math.abs(ddx) > 8) {
          var nd = ddx > 0 ? 1 : -1;
          if (dir && nd !== dir) wiggles++;
          dir = nd;
          lastX = e.clientX;
        }
      } else {
        lastX = e.clientX;
      }
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

  function artTierFor() {
    if (!d.RECIPES[ticket.recipe].art) return null;
    if (wiggles >= 6) return 'rosetta';
    if (wiggles >= 3) return 'tulip';
    if (wiggles >= 1) return 'heart';
    return null;
  }

  function renderCup() {
    cupEl.innerHTML = CG.svg.latteCup(fill, fill > 0.4 ? artTierFor() : null, '#c89a6c');
  }

  function updateGauges() {
    panel.querySelector('#fill-temp').style.transform = 'scaleY(' + (Math.min(temp, 100) / 100).toFixed(3) + ')';
    panel.querySelector('#fill-foam').style.transform = 'scaleY(' + (Math.min(foam, 100) / 100).toFixed(3) + ')';
  }

  function update(dt) {
    if (phase !== 'make' || !steaming) return;
    steamTime += dt;
    var speed = CG.upgradeValue('pitcher');
    temp += (6 + 16 * pos) * speed * dt;
    foam += (1 + 22 * (1 - pos)) * speed * dt;
    if (fill < 1) fill = Math.min(1, fill + 0.3 * dt);
    steamSfxT += dt;
    if (steamSfxT > 0.28) { steamSfxT = 0; CG.audio.play('steam'); }
    updateGauges();
    renderCup();
    if (temp >= 100) {
      steaming = false;
      setSteamFx(false);
      CG.audio.play('screech');
      CG.ui.toast('Scorched the milk', 'bad');
      finish(true);
    }
  }

  function finish(overheated) {
    if (phase !== 'make') return;
    phase = 'done';
    var t = targets();
    var tempScore = d.clamp(100 - Math.abs(temp - t.temp[0]) / t.temp[1] * 50, 0, 100);
    var foamScore = d.clamp(100 - Math.abs(foam - t.foam[0]) / t.foam[1] * 50, 0, 100);
    var score = 0.5 * tempScore + 0.5 * foamScore;
    if (fill < 0.6) score -= (0.6 - fill) * 60;  // didn't fill the cup
    var tier = artTierFor();
    if (tier === 'rosetta') score += 10;
    else if (tier === 'tulip') score += 6;
    else if (tier === 'heart') score += 3;
    score = Math.round(d.clamp(score, 0, 100));
    if (overheated === true) score = Math.min(score, 30);

    var theTicket = ticket;
    CG.tickets.completeStep(theTicket, 'milk', score);
    CG.audio.play(score >= 85 ? 'fanfare' : score >= 50 ? 'chime' : 'buzz');
    CG.ui.updateHUD();

    setSteamFx(false);
    overlayEl.innerHTML = '';
    gaugesEl.classList.add('hidden');
    fill = Math.max(fill, 0.85);
    cupEl.innerHTML = CG.svg.latteCup(fill, tier, '#c89a6c');

    msgEl.textContent = 'Milk poured — ' + score + (tier ? ' · ' + tier : '') + '. Serve it.';
    controlsEl.innerHTML = '<button class="btn btn-confirm btn-wide" id="milk-serve">Serve ' +
      d.RECIPES[theTicket.recipe].name + ' →</button>';
    controlsEl.querySelector('#milk-serve').addEventListener('click', function () {
      CG.tickets.serve(theTicket);
      enter();
    });
    ticket = null;
  }

  function exit() {
    steaming = false;
    phase = 'pick';
    ticket = null;
  }

  return { init: init, enter: enter, exit: exit, update: update, resetDay: exit };
})();
