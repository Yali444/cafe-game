/* FIKA — counter: greet the guest, pick the bean, take the order (2D) */
CG.stations = CG.stations || {};

CG.stations.order = (function () {
  'use strict';

  var panel, queueEl, bubbleEl;
  var openCustId = null;
  var chosenOrigin = {};   // custId -> origin key the player selected

  function init() {
    panel = document.getElementById('panel-order');
    panel.innerHTML =
      '<div class="station-head"><h2>The Counter</h2><p class="hint">Tap the guest to take their order</p></div>' +
      '<div class="scene-wrap order-scene">' +
      CG.svg.sceneOrderBack() +
      '<div id="order-queue" class="queue-row scene-actors"></div>' +
      CG.svg.sceneOrderFront() +
      '<div id="order-bubble" class="bubble-layer"></div>' +
      '</div>';
    queueEl = panel.querySelector('#order-queue');
    bubbleEl = panel.querySelector('#order-bubble');
    CG.events.on('queuechange', render);
    CG.events.on('patiencetick', onPatience);
  }

  function activeGuest() {
    var q = CG.customers.queued();
    return q.length ? q[0] : null;
  }

  function render() {
    if (CG.state.screen !== 'service') return;
    var guest = activeGuest();

    if (openCustId && (!guest || guest.id !== openCustId)) {
      openCustId = null;
      bubbleEl.innerHTML = '';
    }

    queueEl.innerHTML = guest
      ? '<button class="cust-slot' + (openCustId === guest.id ? ' talking' : '') + (guest.arriving ? ' just-arrived' : '') + '" data-cid="' + guest.id + '">' +
          '<span class="cust-name">' + CG.data.CHARACTERS[guest.charId].name + '</span>' +
          '<span class="cust-ring" data-ring="' + guest.id + '">' + CG.svg.patienceRing(guest.patience, CG.moodColor(guest.patience)) + '</span>' +
          '<span class="cust-body">' + CG.svg.customer(guest.charId, guest.mood) + '</span>' +
        '</button>'
      : '<div class="queue-empty">' + (CG.state.service.closed ? 'That\'s everyone for today.' : 'A quiet moment… the next guest is on their way.') + '</div>';
    if (guest) guest.arriving = false;

    var slot = queueEl.querySelector('.cust-slot');
    if (slot) slot.addEventListener('click', function () { CG.audio.play('tap'); openBubble(slot.getAttribute('data-cid')); });

    if (guest && !openCustId && CG.state.upgrades.host > 0) openBubble(guest.id);
  }

  function originsForOrder(order) {
    if (CG.data.RECIPES[order.recipe].brew === 'batch') return [CG.data.BATCH_ORIGIN];
    return CG.state.unlocked.origins.slice();
  }

  function openBubble(cid) {
    var c = CG.customers.byId(cid);
    if (!c || c.status !== 'queued') return;
    openCustId = cid;
    var char = CG.data.CHARACTERS[c.charId];
    var opts = originsForOrder(c.order);
    if (!chosenOrigin[cid]) chosenOrigin[cid] = (c.order.origin && opts.indexOf(c.order.origin) >= 0) ? c.order.origin : opts[0];

    bubbleEl.innerHTML =
      '<div class="speech-bubble">' +
      '<div class="sb-head">' +
      '<span class="sb-portrait">' + CG.svg.customer(c.charId, c.mood) + '</span>' +
      '<span class="sb-who">' + char.name + '</span>' +
      '</div>' +
      '<p class="sb-text">“' + greeting(char) + ' ' + CG.customers.orderText(c.order) + ', please.”</p>' +
      beanPicker(c, opts) +
      '<button class="btn btn-primary btn-take">Take the order · ' + CG.data.fmtMoney(CG.data.priceOf(c.order)) + '</button>' +
      '</div>';

    bubbleEl.querySelectorAll('.bean-chip').forEach(function (el) {
      el.addEventListener('click', function () {
        chosenOrigin[cid] = el.getAttribute('data-origin');
        CG.audio.play('tap');
        openBubble(cid);
      });
    });
    bubbleEl.querySelector('.btn-take').addEventListener('click', function () {
      CG.audio.play('ding');
      var origin = chosenOrigin[cid];
      openCustId = null;
      bubbleEl.innerHTML = '';
      CG.tickets.createTicket(c, origin);
      CG.ui.toast(CG.data.RECIPES[c.order.recipe].name + ' for ' + char.name);
    });
    render();
  }

  function beanPicker(c, opts) {
    if (CG.data.RECIPES[c.order.recipe].brew === 'batch') return '';
    var sel = chosenOrigin[c.id];
    var pref = c.order.preferOrigin;
    return '<div class="bean-pick"><span class="bean-label">Choose the bean</span><div class="bean-row">' +
      opts.map(function (o) {
        var od = CG.data.ORIGINS[o];
        var star = (pref === o) ? ' <span class="bean-pref">♥</span>' : '';
        return '<button class="bean-chip' + (sel === o ? ' on' : '') + '" data-origin="' + o + '">' +
          '<span class="bean-dot" style="background:' + od.bean + '"></span>' +
          '<span class="bean-name">' + od.short + star + '</span>' +
          '<span class="bean-notes">' + od.notes + '</span></button>';
      }).join('') + '</div></div>';
  }

  function greeting(char) {
    var lines = ['Hej!', 'Morning.', 'Hi there —', 'Good day.'];
    if (char.name === 'Dex') return 'Quick one —';
    if (char.name === 'Theo') return 'What did you roast this week?';
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function onPatience(c) {
    if (CG.state.service.activeStation !== 'order') return;
    var ring = queueEl && queueEl.querySelector('[data-ring="' + c.id + '"]');
    if (ring) ring.innerHTML = CG.svg.patienceRing(c.patience, CG.moodColor(c.patience));
  }

  return {
    init: init,
    enter: function () { render(); },
    exit: function () {},
    update: function () {},
    resetDay: function () { chosenOrigin = {}; }
  };
})();
