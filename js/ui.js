/* Crackle & Pour — screens, HUD, toasts, modal, pause */
CG.ui = (function () {
  'use strict';

  var $ = function (sel) { return document.querySelector(sel); };

  function showScreen(name) {
    CG.state.screen = name;
    document.querySelectorAll('.screen').forEach(function (el) {
      el.classList.toggle('active', el.id === 'screen-' + name);
    });
    window.scrollTo(0, 0);
  }

  /* ---------- HUD ---------- */

  function clockLabel() {
    var sv = CG.state.service;
    if (!sv) return '';
    // map the service day onto 7:00 AM – 5:00 PM
    var frac = Math.min(sv.clock / sv.dayLength, 1);
    var mins = 7 * 60 + Math.floor(frac * 600);
    var h = Math.floor(mins / 60), m = mins % 60;
    var ampm = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12 === 0 ? 12 : h % 12;
    return hh + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  }

  function updateHUD() {
    var s = CG.state, sv = s.service;
    $('#hud-day').textContent = 'Day ' + s.day;
    $('#hud-money').textContent = CG.data.fmtMoney(s.money);
    if (sv) {
      $('#hud-clock').textContent = sv.closed ? 'CLOSED' : clockLabel();
      var fill = $('#hud-clockfill');
      var prog = sv.guestsTotal ? sv.guestsServed / sv.guestsTotal : 0;
      fill.style.transform = 'scaleX(' + Math.min(prog, 1).toFixed(3) + ')';
      var g = $('#hud-guests');
      if (g) g.textContent = '☕ ' + sv.guestsServed + '/' + sv.guestsTotal;
    }
  }

  /* ---------- toasts ---------- */

  function toast(msg, type) {
    var box = $('#toasts');
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.innerHTML = msg;
    box.appendChild(el);
    setTimeout(function () { el.classList.add('out'); }, 2200);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2700);
  }

  // floating score/money popup over the service area
  function floatText(msg, cls) {
    var host = $('#float-layer');
    if (!host) return;
    var el = document.createElement('div');
    el.className = 'float-text ' + (cls || '');
    el.innerHTML = msg;
    host.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1600);
  }

  /* ---------- modal ---------- */

  function showModal(html, buttons) {
    var ov = $('#overlay-modal');
    $('#modal-body').innerHTML = html;
    var btnBox = $('#modal-buttons');
    btnBox.innerHTML = '';
    (buttons || [{ label: 'OK' }]).forEach(function (b) {
      var btn = document.createElement('button');
      btn.className = 'btn ' + (b.cls || 'btn-primary');
      btn.textContent = b.label;
      btn.addEventListener('click', function () {
        CG.audio.play('tap');
        hideModal();
        if (b.onTap) b.onTap();
      });
      btnBox.appendChild(btn);
    });
    ov.classList.remove('hidden');
  }

  function hideModal() { $('#overlay-modal').classList.add('hidden'); }

  function confirmBox(msg, onYes) {
    showModal('<p class="modal-msg">' + msg + '</p>', [
      { label: 'Cancel', cls: 'btn-ghost' },
      { label: 'Yes', onTap: onYes }
    ]);
  }

  /* ---------- pause ---------- */

  function setPaused(p, silent) {
    if (CG.state.screen !== 'service') p = false;
    CG.state.paused = p;
    $('#overlay-pause').classList.toggle('hidden', !p);
    if (!silent) CG.audio.play('tap');
  }

  function refreshMuteButtons() {
    var m = CG.audio.isMuted();
    document.querySelectorAll('.mute-btn').forEach(function (b) {
      b.innerHTML = CG.svg.icon(m ? 'mute' : 'sound');
    });
  }

  function init() {
    $('#btn-pause').innerHTML = CG.svg.icon('pause');
    $('#btn-pause').addEventListener('click', function () { setPaused(true); });
    $('#btn-resume').addEventListener('click', function () { setPaused(false); });
    $('#btn-restart-day').addEventListener('click', function () {
      setPaused(false, true);
      confirmBox('Restart this day from the morning?', function () { CG.main.startDay(); });
    });
    $('#btn-quit-title').addEventListener('click', function () {
      setPaused(false, true);
      confirmBox('Quit to title? Today\'s progress will be lost.', function () { CG.main.toTitle(); });
    });
    document.querySelectorAll('.mute-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        CG.audio.setMuted(!CG.audio.isMuted());
        CG.save.save();
      });
    });
    CG.events.on('mutechange', refreshMuteButtons);
    refreshMuteButtons();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && CG.state.screen === 'service' && !CG.state.paused) setPaused(true, true);
    });
  }

  return {
    showScreen: showScreen, updateHUD: updateHUD, toast: toast, floatText: floatText,
    showModal: showModal, hideModal: hideModal, confirm: confirmBox,
    setPaused: setPaused, init: init
  };
})();
