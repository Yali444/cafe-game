/* FIKA — roastery: pick an origin, ride the curve, drop on its profile */
CG.stations.roast = (function () {
  'use strict';

  var d = CG.data;
  var panel, thermoMark, bandEl, beansG, smokeG, msgEl, bagsG, controlsEl, cracklesEl, zonesEl;
  var phase = 'idle';   // idle -> loaded -> roasting -> cooling
  var targetOrigin = null;
  var t = 0;
  var crackled = { first: false, second: false };
  var crackleTick = 0;

  function init() {
    panel = document.getElementById('panel-roast');
    panel.innerHTML =
      '<div class="station-head"><h2>Roastery</h2><p class="hint" id="roast-msg">Tap a bag of greens to load the drum</p></div>' +
      '<div class="scene-wrap roast-scene">' +
      CG.svg.sceneRoast() +
      '<div id="roast-crackles"></div>' +
      '<div id="roast-zones"></div>' +
      '<div class="thermo-overlay"><div class="thermo-track">' +
      '<div class="thermo-band" id="roast-band"><span id="roast-band-label"></span></div>' +
      '<div class="thermo-mark" id="thermo-mark"></div></div>' +
      '<label class="gauge-tag">profile</label></div>' +
      '</div>' +
      '<div id="roast-controls" class="station-controls"></div>';
    thermoMark = panel.querySelector('#thermo-mark');
    bandEl = panel.querySelector('#roast-band');
    beansG = panel.querySelector('#roast-beans');
    smokeG = panel.querySelector('#roast-smoke');
    msgEl = panel.querySelector('#roast-msg');
    bagsG = panel.querySelector('#roast-bags');
    controlsEl = panel.querySelector('#roast-controls');
    cracklesEl = panel.querySelector('#roast-crackles');
    zonesEl = panel.querySelector('#roast-zones');
    renderInventory();
    renderControls();
    positionBand();
  }

  function bandHalf() { return CG.upgradeValue('roaster'); }

  function positionBand() {
    if (!targetOrigin) { bandEl.style.opacity = '0'; return; }
    var o = d.ORIGINS[targetOrigin];
    var half = bandHalf();
    bandEl.style.opacity = '1';
    bandEl.style.bottom = ((o.roastCenter - half) / d.ROAST_TOTAL * 100) + '%';
    bandEl.style.height = (2 * half / d.ROAST_TOTAL * 100) + '%';
    panel.querySelector('#roast-band-label').textContent = o.short;
  }

  function beanColor() {
    if (phase === 'idle') return null;
    if (phase === 'loaded') return '#94a06b';
    var frac = Math.min(t / d.ROAST_TOTAL, 1);
    if (frac < 0.3) return '#94a06b';
    if (frac < 0.5) return '#bd9a6a';
    if (frac < 0.68) return '#8a5e38';
    if (frac < 0.85) return '#5a3a22';
    return '#2a1a10';
  }

  function renderBeans() {
    var color = beanColor();
    beansG.innerHTML = color ? CG.svg.beanGroup(22, color) : '';
  }

  function renderInventory() {
    var sv = CG.state.service;
    if (!sv || !bagsG) return;
    var unlocked = CG.state.unlocked.origins;
    bagsG.innerHTML = CG.svg.roastBags(unlocked, sv.roastInventory, sv.roastQuality, targetOrigin);

    // tap zones over the bags
    zonesEl.innerHTML = unlocked.map(function (o, i) {
      var x = CG.svg.ROAST_BAG_X[i];
      return '<button class="scene-zone" data-origin="' + o + '" aria-label="' + d.ORIGINS[o].name + '"' +
        ' style="left:' + ((x - 27) / 360 * 100) + '%;top:37%;width:' + (54 / 360 * 100) + '%;height:42%"></button>';
    }).join('');
    zonesEl.querySelectorAll('.scene-zone').forEach(function (z) {
      z.addEventListener('click', function () {
        if (phase === 'roasting') return;
        loadOrigin(z.getAttribute('data-origin'));
      });
    });
  }

  function loadOrigin(origin) {
    var sv = CG.state.service;
    if (sv.roastInventory[origin] >= d.ROAST_CAP) {
      CG.ui.toast(d.ORIGINS[origin].short + ' shelf is full');
      return;
    }
    CG.audio.play('pour');
    targetOrigin = origin;
    phase = 'loaded';
    t = 0;
    thermoMark.style.bottom = '0%';
    smokeG.setAttribute('opacity', '0');
    positionBand();
    renderBeans();
    renderInventory();
    renderControls();
    msgEl.innerHTML = '<b>' + d.ORIGINS[origin].name + '</b> — ' + d.ORIGINS[origin].notes;
  }

  function renderControls() {
    if (phase === 'idle') {
      controlsEl.innerHTML = '<p class="control-note">Pick an origin from the shelf to begin.</p>';
    } else if (phase === 'loaded') {
      controlsEl.innerHTML = '<button class="btn btn-primary btn-wide" id="roast-start">Start the roast</button>';
      controlsEl.querySelector('#roast-start').addEventListener('click', function () {
        CG.audio.play('select');
        phase = 'roasting';
        t = 0;
        crackled = { first: false, second: false };
        renderControls();
        msgEl.textContent = 'Listen for first crack… drop inside the profile.';
      });
    } else if (phase === 'roasting') {
      controlsEl.innerHTML = '<button class="btn btn-drop" id="roast-drop">Drop</button>';
      controlsEl.querySelector('#roast-drop').addEventListener('click', drop);
    } else {
      controlsEl.innerHTML = '<button class="btn btn-ghost" id="roast-again">Roast another batch</button>';
      controlsEl.querySelector('#roast-again').addEventListener('click', function () {
        CG.audio.play('tap');
        phase = 'idle';
        targetOrigin = null;
        thermoMark.style.bottom = '0%';
        positionBand();
        renderBeans();
        renderInventory();
        renderControls();
        msgEl.textContent = 'Tap a bag of greens to load the drum';
      });
    }
  }

  function drop() {
    if (phase !== 'roasting') return;
    var sv = CG.state.service;
    var o = d.ORIGINS[targetOrigin];
    var score = Math.round(d.clamp(100 - Math.abs(t - o.roastCenter) / bandHalf() * 50, 0, 100));
    phase = 'cooling';
    CG.audio.play('drop');

    if (t >= d.ROAST_BURN) {
      CG.ui.toast('Burnt — into the bin it goes', 'bad');
      CG.audio.play('buzz');
      smokeG.setAttribute('opacity', '1');
    } else {
      var add = Math.min(d.ROAST_BATCH_UNITS, d.ROAST_CAP - sv.roastInventory[targetOrigin]);
      sv.roastInventory[targetOrigin] += add;
      var q = sv.roastQuality[targetOrigin];
      sv.roastQuality[targetOrigin] = q == null ? score : Math.round(q * 0.5 + score * 0.5);
      var msg = score >= 90 ? 'A beautiful curve.' : score >= 60 ? 'Solid batch.' : 'A little off profile.';
      CG.ui.toast(msg + ' +' + add + ' ' + o.short + ' (' + score + ')', score >= 60 ? 'good' : '');
      CG.audio.play(score >= 90 ? 'fanfare' : 'chime');
    }
    renderInventory();
    renderControls();
    CG.events.emit('inventorychange');
    msgEl.textContent = 'Batch resting on the cooling tray.';
  }

  function update(dt) {
    if (phase !== 'roasting') return;
    t += dt;
    thermoMark.style.bottom = Math.min(t / d.ROAST_TOTAL, 1) * 100 + '%';

    if (!crackled.first && t > d.ORIGINS.ethiopia.roastCenter - 1.1) { crackled.first = true; msgEl.textContent = 'First crack!'; }
    if (!crackled.second && t > 7.2) { crackled.second = true; msgEl.textContent = 'Second crack — careful now.'; }
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

    if (t >= d.ROAST_TOTAL) {
      t = d.ROAST_BURN + 1;
      drop();
    }
  }

  function spark() {
    var s = document.createElement('div');
    s.className = 'crack-spark';
    s.style.left = (14 + Math.random() * 22) + '%';
    s.style.top = (34 + Math.random() * 26) + '%';
    cracklesEl.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 500);
  }

  CG.events.on('inventorychange', function () { if (bagsG) renderInventory(); });

  return {
    init: init,
    enter: function () { renderInventory(); renderControls(); renderBeans(); positionBand(); },
    exit: function () {},
    update: update,
    resetDay: function () {
      phase = 'idle'; targetOrigin = null; t = 0;
      if (thermoMark) {
        thermoMark.style.bottom = '0%';
        positionBand(); renderBeans(); renderControls(); renderInventory();
      }
    }
  };
})();
