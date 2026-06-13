/* FIKA — counter: greet the guest (3D), pick the bean, take the order */
CG.stations = CG.stations || {};

CG.stations.order = (function () {
  'use strict';

  var panel, waitEl, bubbleEl, promptEl;
  var openCustId = null;
  var chosenOrigin = {};   // custId -> origin key the player selected

  function init() {
    panel = document.getElementById('panel-order');
    panel.classList.add('order-3d');
    panel.innerHTML =
      '<div class="station-head floaty"><h2>The Counter</h2><p class="hint">Tap the guest to greet them</p></div>' +
      '<div id="order-waiting" class="waiting-row"></div>' +
      '<div id="order-prompt" class="greet-prompt hidden"></div>' +
      '<div id="order-bubble" class="bubble-layer"></div>';
    waitEl = panel.querySelector('#order-waiting');
    bubbleEl = panel.querySelector('#order-bubble');
    promptEl = panel.querySelector('#order-prompt');
    CG.events.on('queuechange', render);
    CG.events.on('gltap', function (role) {
      if (CG.state.service && CG.state.service.activeStation === 'order' && role === 'guest') {
        var q = CG.customers.queued();
        if (q.length) { CG.audio.play('tap'); openBubble(q[0].id); }
      }
    });
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

    // 3D guest
    if (CG.gfx && CG.gfx.available()) {
      if (guest) CG.gfx.showGuest(guest.charId, guest.mood);
      else CG.gfx.clearGuest();
    }

    if (!guest) {
      promptEl.classList.remove('hidden');
      promptEl.innerHTML = '<div class="queue-empty">' +
        (CG.state.service.closed ? 'That\'s everyone for today.' : 'A quiet moment… the next guest is on their way.') + '</div>';
    } else if (!openCustId) {
      promptEl.classList.remove('hidden');
      promptEl.innerHTML = '<button class="greet-btn">Greet ' + CG.data.CHARACTERS[guest.charId].name + ' ☕</button>';
      promptEl.querySelector('.greet-btn').onclick = function () { CG.audio.play('tap'); openBubble(guest.id); };
    } else {
      promptEl.classList.add('hidden');
      promptEl.innerHTML = '';
    }

    waitEl.innerHTML = '';

    if (guest && !openCustId && CG.state.upgrades.host > 0) openBubble(guest.id);
  }

  function originsForOrder(order) {
    // batch is house-bean only; everything else lets the player choose any unlocked origin
    if (CG.data.RECIPES[order.recipe].brew === 'batch') return [CG.data.BATCH_ORIGIN];
    return CG.state.unlocked.origins.slice();
  }

  function openBubble(cid) {
    var c = CG.customers.byId(cid);
    if (!c || c.status !== 'queued') return;
    openCustId = cid;
    promptEl.classList.add('hidden'); promptEl.innerHTML = '';
    var char = CG.data.CHARACTERS[c.charId];
    var opts = originsForOrder(c.order);
    if (!chosenOrigin[cid]) chosenOrigin[cid] = (c.order.origin && opts.indexOf(c.order.origin) >= 0) ? c.order.origin : opts[0];

    bubbleEl.innerHTML =
      '<div class="speech-bubble">' +
      '<div class="sb-head"><span class="sb-who">' + char.name + '</span></div>' +
      '<p class="sb-text">“' + greeting(char) + ' ' + CG.customers.orderText(c.order) + ', please.”</p>' +
      beanPicker(c, opts) +
      '<button class="btn btn-primary btn-take">Take the order · ' + CG.data.fmtMoney(CG.data.priceOf(c.order)) + '</button>' +
      '</div>';

    bubbleEl.querySelectorAll('.bean-chip').forEach(function (el) {
      el.addEventListener('click', function () {
        chosenOrigin[cid] = el.getAttribute('data-origin');
        CG.audio.play('tap');
        openBubble(cid); // re-render selection
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

  return {
    init: init,
    enter: function () { render(); },
    exit: function () { if (CG.gfx && CG.gfx.available()) CG.gfx.clearGuest(); },
    update: function () {},
    resetDay: function () { chosenOrigin = {}; }
  };
})();
