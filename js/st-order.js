/* Crackle & Pour — order station: an illustrated front-of-house scene */
CG.stations = CG.stations || {};

CG.stations.order = (function () {
  'use strict';

  var panel, queueEl, waitEl, bubbleEl;
  var openCustId = null;

  function init() {
    panel = document.getElementById('panel-order');
    panel.innerHTML =
      '<div class="station-head"><h2>Front Counter</h2><p class="hint">Tap a customer to take their order</p></div>' +
      '<div id="order-waiting" class="waiting-row"></div>' +
      '<div class="scene-wrap order-scene">' +
      CG.svg.sceneOrderBack() +
      '<div id="order-queue" class="queue-row scene-actors"></div>' +
      CG.svg.sceneOrderFront() +
      '<div id="order-bubble" class="bubble-layer"></div>' +
      '</div>';
    queueEl = panel.querySelector('#order-queue');
    waitEl = panel.querySelector('#order-waiting');
    bubbleEl = panel.querySelector('#order-bubble');
    CG.events.on('queuechange', render);
    CG.events.on('patiencetick', onPatience);
  }

  function render() {
    if (CG.state.screen !== 'service') return;
    var queued = CG.customers.queued().slice(0, 4);
    var waiting = CG.customers.waiting();

    if (openCustId && !queued.some(function (c) { return c.id === openCustId; })) {
      openCustId = null;
      bubbleEl.innerHTML = '';
    }

    queueEl.innerHTML = queued.map(function (c) {
      return '<button class="cust-slot' + (openCustId === c.id ? ' talking' : '') + '" data-cid="' + c.id + '">' +
        '<span class="cust-ring" data-ring="' + c.id + '">' + CG.svg.patienceRing(c.patience, CG.moodColor(c.patience)) + '</span>' +
        '<span class="cust-body">' + CG.svg.customer(c.charId, c.mood) + '</span>' +
        '<span class="cust-name">' + CG.data.CHARACTERS[c.charId].name + '</span>' +
        '</button>';
    }).join('') || '<div class="queue-empty">' + (CG.state.service.closed ? 'Doors are closed.' : 'No one in line… for now.') + '</div>';

    waitEl.innerHTML = waiting.length
      ? '<span class="wait-label">Waiting:</span>' + waiting.map(function (c) {
          return '<span class="wait-chip" title="' + CG.data.CHARACTERS[c.charId].name + '">' + CG.svg.customer(c.charId, c.mood) + '</span>';
        }).join('')
      : '';

    queueEl.querySelectorAll('.cust-slot').forEach(function (el) {
      el.addEventListener('click', function () {
        CG.audio.play('tap');
        openBubble(el.getAttribute('data-cid'));
      });
    });

    // smart register: auto-greet the front of the line
    if (!openCustId && queued.length && CG.state.upgrades.register > 0) {
      openBubble(queued[0].id);
    }
  }

  function openBubble(cid) {
    var c = CG.customers.byId(cid);
    if (!c || c.status !== 'queued') return;
    openCustId = cid;
    var char = CG.data.CHARACTERS[c.charId];
    bubbleEl.innerHTML =
      '<div class="speech-bubble">' +
      '<p class="sb-text">“' + greeting(char) + ' ' + CG.customers.orderText(c.order) + ', please!”</p>' +
      CG.svg.tagPills(c.order) +
      '<button class="btn btn-primary btn-take">Take Order — ' + CG.data.fmtMoney(orderPrice(c.order)) + '</button>' +
      '</div>';
    bubbleEl.querySelector('.btn-take').addEventListener('click', function () {
      CG.audio.play('ding');
      openCustId = null;
      bubbleEl.innerHTML = '';
      CG.tickets.createTicket(c);
      CG.ui.toast('Order up: ' + CG.data.RECIPES[c.order.recipe].name + ' for ' + char.name);
    });
    render();
  }

  function orderPrice(order) {
    return CG.data.priceOf({ recipe: order.recipe, size: order.size, extras: order.extras, toppings: order.toppings });
  }

  function greeting(char) {
    var lines = ['Hi there!', 'Morning!', 'Hey!', 'Hello hello!', 'Good day!'];
    if (char.name === 'Dex') return 'Quick one —';
    if (char.name === 'Theo') return 'Ah, the artisan touch.';
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
    update: function () {}
  };
})();
