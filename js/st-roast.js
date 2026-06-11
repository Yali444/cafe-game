/* Crackle & Pour — roastery: drum-roast green beans into jarred inventory */
CG.stations.roast = (function () {
  'use strict';

  var d = CG.data;
  var panel, thermoMark, beansG, smokeG, msgEl, jarsG, controlsEl, cracklesEl;
  var phase = 'idle';   // idle -> loaded -> roasting -> cooling
  var targetRoast = null;
  var t = 0;            // roast timer
  var crackled = { first: false, second: false };
  var crackleTick = 0;

  function init() {
    panel = document.getElementById('panel-roast');
    var bands = ['light', 'medium', 'dark'].map(function (r) {
      var R = d.ROASTS[r];
      return '<div class="thermo-band band-' + r + '" data-band="' + r + '"><span>' + R.name + '</span></div>';
    }).join('');
    panel.innerHTML =
      '<div class="station-head"><h2>Roastery</h2><p class="hint" id="roast-msg">Roast beans ahead — drinks need them!</p></div>' +
      '<div class="scene-wrap roast-scene">' +
      CG.svg.sceneRoast() +
      '<div id="roast-crackles"></div>' +
      '<div class="thermo-overlay"><div class="thermo-track">' + bands +
      '<div class="thermo-mark" id="thermo-mark"></div></div></div>' +
      '</div>' +
      '<div id="roast-controls" class="roast-controls"></div>';
    thermoMark = panel.querySelector('#thermo-mark');
    beansG = panel.querySelector('#roast-beans');
    smokeG = panel.querySelector('#roast-smoke');
    msgEl = panel.querySelector('#roast-msg');
    jarsG = panel.querySelector('#roast-jars');
    controlsEl = panel.querySelector('#roast-controls');
    cracklesEl = panel.querySelector('#roast-crackles');
    positionBands();
    renderControls();
    renderInventory();
  }

  function positionBands() {
    var halfSec = bandHalf();
    ['light', 'medium', 'dark'].forEach(function (r) {
      var el = panel.querySelector('[data-band="' + r + '"]');
      var c = d.ROASTS[r].center / d.ROAST_TOTAL;
      var h = (2 * halfSec) / d.ROAST_TOTAL;
      el.style.bottom = ((c - halfSec / d.ROAST_TOTAL) * 100) + '%';
      el.style.height = (h * 100) + '%';
    });
  }

  function bandHalf() { return CG.upgradeValue('roaster'); }

  function beanColor() {
    if (phase === 'idle') return null;
    if (phase === 'loaded') return '#9aa86d'; // green beans
    var frac = Math.min(t / d.ROAST_TOTAL, 1);
    if (frac < 0.3) return '#9aa86d';
    if (frac < 0.5) return '#c69c6d';
    if (frac < 0.67) return '#8d5a2b';
    if (frac < 0.85) return '#4a2c17';
    return '#241208';
  }

  function renderBeans() {
    var color = beanColor();
    beansG.innerHTML = color ? CG.svg.beanGroup(26, color) : '';
  }

  function renderInventory() {
    var sv = CG.state.service;
    if (!sv || !jarsG) return;
    jarsG.innerHTML = CG.svg.roastJars(CG.state.unlocked.roasts, sv.roastInventory, sv.roastQuality);
  }

  function renderControls() {
    var sv = CG.state.service;
    if (phase === 'idle') {
      controlsEl.innerHTML = '<button class="btn btn-primary" id="roast-load">Load Green Beans</button>';
      controlsEl.querySelector('#roast-load').addEventListener('click', function () {
        CG.audio.play('pour');
        phase = 'loaded';
        targetRoast = null;
        renderBeans();
        renderControls();
        msgEl.textContent = 'Pick a target roast, then fire it up.';
      });
    } else if (phase === 'loaded') {
      var picks = CG.state.unlocked.roasts.map(function (r) {
        var full = sv && sv.roastInventory[r] >= d.ROAST_CAP;
        return '<button class="btn btn-chip roast-pick' + (targetRoast === r ? ' sel' : '') + '" data-roast="' + r + '"' +
          (full ? ' disabled' : '') + '>' + d.ROASTS[r].name + (full ? ' (full)' : '') + '</button>';
      }).join('');
      controlsEl.innerHTML = '<div class="chip-row">' + picks + '</div>' +
        '<button class="btn btn-primary" id="roast-start"' + (targetRoast ? '' : ' disabled') + '>Start Roast</button>';
      controlsEl.querySelectorAll('.roast-pick').forEach(function (el) {
        el.addEventListener('click', function () {
          CG.audio.play('tap');
          targetRoast = el.getAttribute('data-roast');
          renderControls();
        });
      });
      controlsEl.querySelector('#roast-start').addEventListener('click', function () {
        if (!targetRoast) return;
        CG.audio.play('select');
        phase = 'roasting';
        t = 0;
        crackled = { first: false, second: false };
        smokeG.setAttribute('opacity', '0');
        renderControls();
        msgEl.textContent = 'Aim for the ' + d.ROASTS[targetRoast].name + ' band… listen for the crack!';
      });
    } else if (phase === 'roasting') {
      controlsEl.innerHTML = '<button class="btn btn-drop" id="roast-drop">DROP!</button>';
      controlsEl.querySelector('#roast-drop').addEventListener('click', drop);
    } else { // cooling
      controlsEl.innerHTML = '<button class="btn btn-primary" id="roast-again">Roast Another Batch</button>';
      controlsEl.querySelector('#roast-again').addEventListener('click', function () {
        CG.audio.play('tap');
        phase = 'idle';
        thermoMark.style.bottom = '0%';
        renderBeans();
        renderControls();
        msgEl.textContent = 'Roast beans ahead — drinks need them!';
      });
    }
  }

  function drop() {
    if (phase !== 'roasting') return;
    var sv = CG.state.service;
    var R = d.ROASTS[targetRoast];
    var score = d.clamp(100 - Math.abs(t - R.center) / bandHalf() * 50, 0, 100);
    score = Math.round(score);
    phase = 'cooling';
    CG.audio.play('drop');

    if (t >= d.ROAST_BURN) {
      CG.ui.toast('Burnt! The batch goes in the bin.', 'bad');
      CG.audio.play('buzz');
      smokeG.setAttribute('opacity', '1');
    } else {
      var add = Math.min(d.ROAST_BATCH_UNITS, d.ROAST_CAP - sv.roastInventory[targetRoast]);
      sv.roastInventory[targetRoast] += add;
      var q = sv.roastQuality[targetRoast];
      sv.roastQuality[targetRoast] = q == null ? score : Math.round(q * 0.5 + score * 0.5);
      var msg = score >= 90 ? 'Beautiful roast!' : score >= 60 ? 'Solid batch.' : 'A bit off… drinkable.';
      CG.ui.toast(msg + ' +' + add + ' ' + R.name + ' (' + score + '%)', score >= 60 ? 'good' : '');
      CG.audio.play(score >= 90 ? 'fanfare' : 'chime');
    }
    renderInventory();
    renderControls();
    CG.events.emit('inventorychange');
    msgEl.textContent = 'Batch cooled and ready.';
  }

  function update(dt) {
    if (phase !== 'roasting') return;
    t += dt;
    thermoMark.style.bottom = Math.min(t / d.ROAST_TOTAL, 1) * 100 + '%';

    if (!crackled.first && t > d.ROASTS.light.center - 1.2) { crackled.first = true; msgEl.textContent = 'First crack!'; }
    if (!crackled.second && t > d.ROASTS.dark.center - 1.0) { crackled.second = true; msgEl.textContent = 'Second crack — careful now!'; }
    if (crackled.first) {
      crackleTick += dt;
      var rate = crackled.second ? 0.09 : 0.22;
      if (crackleTick > rate) {
        crackleTick = 0;
        CG.audio.play('crack');
        spark();
      }
    }

    renderBeans();

    if (t >= d.ROAST_TOTAL) { // way past dark — auto-burn
      t = d.ROAST_BURN + 1;
      drop();
    }
  }

  function spark() {
    var s = document.createElement('div');
    s.className = 'crack-spark';
    s.style.left = (12 + Math.random() * 28) + '%';
    s.style.top = (30 + Math.random() * 30) + '%';
    cracklesEl.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 500);
  }

  CG.events.on('inventorychange', function () { if (jarsG) renderInventory(); });

  return {
    init: init,
    enter: function () { positionBands(); renderInventory(); renderControls(); renderBeans(); },
    exit: function () {},
    update: update,
    resetDay: function () {
      phase = 'idle'; targetRoast = null; t = 0;
      if (thermoMark) { thermoMark.style.bottom = '0%'; renderBeans(); renderControls(); renderInventory(); }
    }
  };
})();
