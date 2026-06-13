/* FIKA — milk bar: stretch the foam, heat it, then pour the art. Clear, readable, two-step. */
CG.stations.milk = (function () {
  'use strict';

  var d = CG.data;
  var panel, msgEl, stageEl, overlayEl, controlsEl, metersEl, cupEl, sceneWrapEl;
  var ticket = null;
  var phase = 'pick';        // pick | stretch | heat | pour | done
  var holding = false;
  var foam = 0, heat = 0, fill = 0, art = 0;
  var steamSfxT = 0;

  var FOAM_RATE = 26, HEAT_RATE = 30, ART_RATE = 46;

  function init() {
    panel = document.getElementById('panel-milk');
    panel.innerHTML =
      '<div class="station-head floaty"><h2>Milk Bar</h2><p class="hint" id="milk-msg"></p></div>' +
      '<div class="scene-wrap milk-scene">' +
      '  <div id="milk-rig" class="scene-host"></div>' +
      '  <div id="milk-cup" class="cup-overlay hidden"></div>' +
      '  <div id="milk-meters" class="milk-meters hidden"></div>' +
      '  <div id="milk-overlays" class="scene-overlays"></div>' +
      '</div>' +
      '<div id="milk-controls" class="station-controls"></div>';
    msgEl = panel.querySelector('#milk-msg');
    stageEl = panel.querySelector('#milk-rig');
    overlayEl = panel.querySelector('#milk-overlays');
    metersEl = panel.querySelector('#milk-meters');
    cupEl = panel.querySelector('#milk-cup');
    controlsEl = panel.querySelector('#milk-controls');
    sceneWrapEl = panel.querySelector('.scene-wrap');
    CG.events.on('ticketschange', function () {
      if (CG.state.service && CG.state.service.activeStation === 'milk' && phase === 'pick') enter();
    });
  }

  function targets() { return d.RECIPES[ticket.recipe].milk; }
  function isArt() { return !!d.RECIPES[ticket.recipe].art; }
  function use3d() { return CG.gfx && CG.gfx.available(); }
  function showCup() { if (use3d()) CG.gfx.showMilkCup(); else cupEl.classList.remove('hidden'); }

  function setBackdrop() {
    var is3d = CG.gfx && CG.gfx.available();
    if (is3d) { sceneWrapEl.classList.add('show3d'); stageEl.innerHTML = ''; }
    else { sceneWrapEl.classList.remove('show3d'); stageEl.innerHTML = CG.svg.sceneMilk(); }
  }

  function enter() {
    holding = false;
    overlayEl.innerHTML = '';
    metersEl.classList.add('hidden'); metersEl.innerHTML = '';
    cupEl.classList.add('hidden'); cupEl.innerHTML = '';
    if (use3d()) CG.gfx.hideMilkCup();
    setBackdrop();
    ticket = CG.tickets.pickFor('milk');
    phase = 'pick';
    if (!ticket) {
      var waiting = CG.tickets.open().filter(function (t) { return t.steps.milk && !t.steps.brew.done; });
      msgEl.textContent = waiting.length ? 'Pull the shot at the Brew bar first.' : 'No milk to steam right now.';
      controlsEl.innerHTML = waiting.length ? '<button class="btn btn-warn btn-wide" id="goto-brew">To the Brew bar →</button>' : '';
      var gb = controlsEl.querySelector('#goto-brew');
      if (gb) gb.addEventListener('click', function () { CG.main.switchStation('brew'); });
      stageEl.classList.add('dim');
      return;
    }
    stageEl.classList.remove('dim');
    var cust = CG.customers.byId(ticket.customerId);
    var r = d.RECIPES[ticket.recipe];
    msgEl.innerHTML = r.name + ' for <b>' + d.CHARACTERS[cust.charId].name + '</b>' +
      ' · <span class="note">' + (r.art ? 'silky microfoam — then pour the art' : 'gently steamed') + '</span>';
    controlsEl.innerHTML = '<button class="btn btn-primary btn-wide" id="milk-start">Pick up the pitcher</button>';
    controlsEl.querySelector('#milk-start').addEventListener('click', startStretch);
  }

  /* ---- meters ---- */
  function meterHTML(id, label, t) {
    // t = [center, halfBand] in %
    var lo = t[0] - t[1], w = t[1] * 2;
    return '<div class="mtr" id="mtr-' + id + '">' +
      '<div class="mtr-top"><span class="mtr-label">' + label + '</span><span class="mtr-check" id="chk-' + id + '">✓</span></div>' +
      '<div class="mtr-bar">' +
      '<div class="mtr-zone" style="left:' + lo + '%;width:' + w + '%"></div>' +
      '<div class="mtr-fill" id="fill-' + id + '"></div>' +
      '</div></div>';
  }

  function showMeters() {
    var t = targets();
    metersEl.innerHTML = meterHTML('foam', 'foam', t.foam) + meterHTML('heat', 'heat', t.temp);
    metersEl.classList.remove('hidden');
  }

  function paintMeters() {
    var t = targets();
    setFill('foam', foam, t.foam);
    setFill('heat', heat, t.temp);
  }
  function setFill(id, val, t) {
    var f = panel.querySelector('#fill-' + id);
    if (f) f.style.width = Math.min(100, val) + '%';
    var inZone = Math.abs(val - t[0]) <= t[1];
    var m = panel.querySelector('#mtr-' + id);
    if (m) m.classList.toggle('inzone', inZone);
  }

  /* ---- stage 1: stretch the foam ---- */
  function startStretch() {
    phase = 'stretch';
    foam = 0; heat = 0; fill = 0; art = 0;
    CG.audio.play('select');
    showMeters();
    showCup();
    renderCup();
    msgEl.textContent = 'Hold to stretch the milk — release when FOAM is in the green.';
    holdButton('Hold to stretch foam', function () {
      // released
      if (foam < 6) return; // not really steamed yet
      phase = 'heat';
      CG.audio.play('chime');
      msgEl.textContent = 'Now sink the wand to heat — release when HEAT is in the green.';
      holdButton('Hold to heat', function () {
        if (heat < 6) return;
        CG.audio.play('chime');
        if (isArt()) startPour();
        else finish(false);
      });
    });
  }

  // a reusable press-and-hold control; onRelease fires when the player lets go
  function holdButton(label, onRelease) {
    controlsEl.innerHTML = '<button class="btn btn-primary btn-wide hold-pour" id="milk-hold">' + label + '</button>';
    var btn = controlsEl.querySelector('#milk-hold');
    var down = function (e) { e.preventDefault(); holding = true; btn.classList.add('held'); };
    var up = function () { if (!holding) return; holding = false; btn.classList.remove('held'); onRelease(); };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
  }

  /* ---- stage 2: pour the art (art drinks only) ---- */
  function startPour() {
    phase = 'pour';
    art = 0;
    msgEl.textContent = 'Pour the art — hold to feather, release as the leaf fills out.';
    showCup();
    renderCup();
    // an art progress bar with a "rosetta" sweet zone near the top
    metersEl.innerHTML =
      '<div class="mtr art" id="mtr-art"><div class="mtr-top"><span class="mtr-label">latte art</span>' +
      '<span class="mtr-tier" id="art-tier">—</span></div>' +
      '<div class="mtr-bar"><div class="mtr-zone art-zone" style="left:80%;width:18%"></div>' +
      '<div class="mtr-fill art" id="fill-art"></div></div></div>';
    holdButton('Hold to pour', function () { finish(false); });
  }

  function renderCup() {
    var f = Math.max(fill, phase === 'pour' ? 0.85 : fill);
    if (use3d()) CG.gfx.setMilkCup(f, artTierFor());
    else cupEl.innerHTML = CG.svg.latteCup(f, artTierFor(), '#c89a6c');
  }

  function artTierFor() {
    if (!isArt()) return null;
    if (art >= 80) return 'rosetta';
    if (art >= 45) return 'tulip';
    if (art >= 15) return 'heart';
    return null;
  }

  /* ---- per-frame ---- */
  function update(dt) {
    if (!holding) return;
    var speed = CG.upgradeValue('pitcher');
    if (phase === 'stretch') {
      foam += FOAM_RATE * speed * dt;
      heat += 0.3 * HEAT_RATE * speed * dt; // a little heat builds while stretching
      fill = Math.min(1, fill + 0.22 * dt);
      paintMeters(); renderCup();
      tickSteam(dt);
      if (foam >= 100) { holding = false; }
    } else if (phase === 'heat') {
      heat += HEAT_RATE * speed * dt;
      fill = Math.min(1, fill + 0.18 * dt);
      paintMeters(); renderCup();
      tickSteam(dt);
      if (heat >= 100) { holding = false; CG.audio.play('screech'); CG.ui.toast('Scorched the milk', 'bad'); finish(true); }
    } else if (phase === 'pour') {
      art = Math.min(110, art + ART_RATE * dt);
      var f = panel.querySelector('#fill-art'); if (f) f.style.width = Math.min(100, art) + '%';
      var tier = panel.querySelector('#art-tier'); var tn = artTierFor();
      if (tier) tier.textContent = tn || '—';
      var m = panel.querySelector('#mtr-art'); if (m) m.classList.toggle('inzone', art >= 80 && art <= 98);
      renderCup();
      tickSteam(dt);
      if (art >= 110) { holding = false; finish(false); } // overpoured — art floods
    }
  }

  function tickSteam(dt) {
    steamSfxT += dt;
    if (steamSfxT > 0.28) { steamSfxT = 0; CG.audio.play('steam'); }
  }

  function finish(overheated) {
    if (phase === 'done') return;
    phase = 'done';
    holding = false;
    var t = targets();
    var foamScore = d.clamp(100 - Math.abs(foam - t.foam[0]) / t.foam[1] * 50, 0, 100);
    var heatScore = d.clamp(100 - Math.abs(heat - t.temp[0]) / t.temp[1] * 50, 0, 100);
    var score = 0.5 * foamScore + 0.5 * heatScore;
    if (fill < 0.6) score -= (0.6 - fill) * 50;
    var tier = artTierFor();
    if (art > 105) { score -= 6; } // overpoured floods the art
    if (tier === 'rosetta') score += 10;
    else if (tier === 'tulip') score += 6;
    else if (tier === 'heart') score += 3;
    score = Math.round(d.clamp(score, 0, 100));
    if (overheated === true) score = Math.min(score, 35);

    var theTicket = ticket;
    CG.tickets.completeStep(theTicket, 'milk', score);
    CG.audio.play(score >= 85 ? 'fanfare' : score >= 50 ? 'chime' : 'buzz');
    CG.ui.updateHUD();

    overlayEl.innerHTML = '';
    metersEl.classList.add('hidden');
    fill = Math.max(fill, 0.85);
    if (use3d()) { CG.gfx.showMilkCup(); CG.gfx.setMilkCup(fill, tier); }
    else { cupEl.classList.remove('hidden'); cupEl.innerHTML = CG.svg.latteCup(fill, tier, '#c89a6c'); }

    msgEl.textContent = 'Milk poured — ' + score + (tier ? ' · ' + tier : '') + '. Serve it.';
    controlsEl.innerHTML = '<button class="btn btn-confirm btn-wide" id="milk-serve">Serve ' +
      d.RECIPES[theTicket.recipe].name + ' →</button>';
    controlsEl.querySelector('#milk-serve').addEventListener('click', function () {
      CG.tickets.serve(theTicket);
      enter();
    });
    ticket = null;
  }

  function exit() { holding = false; phase = 'pick'; ticket = null; if (use3d()) CG.gfx.hideMilkCup(); }

  return { init: init, enter: enter, exit: exit, update: update, resetDay: exit };
})();
