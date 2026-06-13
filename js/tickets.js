/* FIKA — ticket lifecycle, ticket strip, serve scoring */
CG.tickets = (function () {
  'use strict';

  var d = CG.data;

  function byId(id) {
    var sv = CG.state.service;
    if (!sv) return null;
    for (var i = 0; i < sv.tickets.length; i++) {
      if (sv.tickets[i].id === id) return sv.tickets[i];
    }
    return null;
  }

  /* ---------- creation ---------- */

  function createTicket(cust, originOverride) {
    var sv = CG.state.service;
    var o = cust.order;
    var recipe = d.RECIPES[o.recipe];
    var origin = (originOverride != null) ? originOverride : o.origin;
    var t = {
      id: 't' + (sv.nextId++),
      customerId: cust.id,
      recipe: o.recipe,
      origin: origin,
      preferOrigin: o.preferOrigin || null,
      steps: {
        brew: { done: false, score: 0 },
        milk: recipe.milk ? { done: false, score: 0 } : null
      },
      // where the drink is finished & served
      serveStation: recipe.milk ? 'milk' : 'brew',
      status: 'taken'
    };
    sv.tickets.push(t);
    cust.status = 'waiting';
    if (!sv.selectedTicketId) sv.selectedTicketId = t.id;
    CG.events.emit('ticketschange');
    CG.events.emit('queuechange');
    return t;
  }

  /* ---------- queries ---------- */

  function open() {
    return CG.state.service.tickets.filter(function (t) { return t.status !== 'served'; });
  }

  function needing(step) {
    return open().filter(function (t) {
      if (!t.steps[step] || t.steps[step].done) return false;
      // milk only after the shot has been pulled
      if (step === 'milk' && t.steps.brew && !t.steps.brew.done) return false;
      return true;
    });
  }

  function selected() {
    return byId(CG.state.service.selectedTicketId);
  }

  function select(id) {
    CG.state.service.selectedTicketId = id;
    CG.events.emit('ticketschange');
  }

  function pickFor(step) {
    var sel = selected();
    var list = needing(step);
    if (sel && list.indexOf(sel) >= 0) return sel;
    return list[0] || null;
  }

  function completeStep(ticket, step, score) {
    ticket.steps[step].done = true;
    ticket.steps[step].score = Math.round(score);
    CG.events.emit('ticketschange');
  }

  function readyToServe(ticket) {
    if (!ticket.steps.brew.done) return false;
    if (ticket.steps.milk && !ticket.steps.milk.done) return false;
    return true;
  }

  /* ---------- serve & scoring ---------- */

  function makeScore(ticket) {
    var sv = CG.state.service;
    var parts = [];
    parts.push({ w: 0.45, v: ticket.steps.brew.score });
    if (ticket.steps.milk) parts.push({ w: 0.30, v: ticket.steps.milk.score });
    if (ticket.origin) {
      var q = sv.roastQuality[ticket.origin];
      parts.push({ w: 0.15, v: q == null ? 70 : q });
    }
    var wsum = parts.reduce(function (a, p) { return a + p.w; }, 0);
    return parts.reduce(function (a, p) { return a + p.v * (p.w / wsum); }, 0);
  }

  function serve(ticket) {
    var s = CG.state, sv = s.service;
    var cust = CG.customers.byId(ticket.customerId);
    var char = d.CHARACTERS[cust.charId];

    var make = makeScore(ticket);
    var wait = cust.patience;
    var final = Math.round(0.65 * make + 0.35 * wait);
    var stars = d.starsFor(final);

    var price = d.priceOf(ticket);
    var tipRate = d.TIP_RATES[stars];
    var quirkMod = (char.tipBonusAt90 && final >= 90) ? 1 + char.tipBonusAt90 : 1;
    // reward matching the guest's preferred bean
    if (ticket.preferOrigin && ticket.origin === ticket.preferOrigin) quirkMod += 0.2;
    var tip = Math.round(price * tipRate * quirkMod * 100) / 100;

    s.money = Math.round((s.money + price + tip) * 100) / 100;
    sv.earnedToday = Math.round((sv.earnedToday + price) * 100) / 100;
    sv.tipsToday = Math.round((sv.tipsToday + tip) * 100) / 100;
    s.stats.servedTotal++;
    if (final > s.stats.bestDrink) s.stats.bestDrink = final;

    ticket.status = 'served';
    cust.status = 'done';
    sv.guestsServed++;
    cust.mood = stars >= 3 ? 'happy' : stars === 2 ? 'neutral' : 'annoyed';
    if (sv.selectedTicketId === ticket.id) {
      var next = open()[0];
      sv.selectedTicketId = next ? next.id : null;
    }

    sv.results.push({
      name: char.name, charId: cust.charId,
      drink: d.RECIPES[ticket.recipe].name + (ticket.origin ? ' · ' + d.ORIGINS[ticket.origin].short : ''),
      stars: stars, score: final, price: price, tip: tip
    });

    CG.audio.play(stars >= 4 ? 'fanfare' : stars >= 3 ? 'chime' : stars === 2 ? 'sip' : 'buzz');
    CG.audio.play('cash');
    CG.ui.floatText(
      '+' + d.fmtMoney(price) + (tip > 0 ? ' <span class="tip">+' + d.fmtMoney(tip) + ' tip</span>' : '') +
      '<br>' + CG.svg.stars(stars),
      stars >= 4 ? 'great' : stars >= 3 ? 'good' : 'meh'
    );

    CG.events.emit('ticketschange');
    CG.events.emit('queuechange');
    CG.ui.updateHUD();
  }

  /* ---------- ticket strip ---------- */

  var stripEl = null;

  function stepIcon(label, st) {
    if (!st) return '';
    return '<span class="tstep ' + (st.done ? 'done' : '') + '">' + label + '</span>';
  }

  function renderStrip() {
    if (!stripEl) stripEl = document.getElementById('ticket-strip');
    var sv = CG.state.service;
    if (!sv) return;
    var tickets = open();
    if (!tickets.length) {
      stripEl.innerHTML = '<div class="strip-empty">No open tickets — greet your guests</div>';
      return;
    }
    stripEl.innerHTML = tickets.map(function (t) {
      var cust = CG.customers.byId(t.customerId);
      var char = d.CHARACTERS[cust.charId];
      var sel = sv.selectedTicketId === t.id ? ' sel' : '';
      var ring = CG.moodColor(cust.patience);
      return '<button class="mini-ticket' + sel + '" data-tid="' + t.id + '" style="--ring:' + ring + '">' +
        '<span class="mt-name">' + char.name + '</span>' +
        '<span class="mt-drink">' + d.RECIPES[t.recipe].name +
        (t.origin ? ' · <em>' + d.ORIGINS[t.origin].short + '</em>' : '') + '</span>' +
        '<span class="mt-steps">' +
        stepIcon('B', t.steps.brew) + stepIcon('M', t.steps.milk) +
        '</span></button>';
    }).join('');

    stripEl.querySelectorAll('.mini-ticket').forEach(function (el) {
      el.addEventListener('click', function () {
        CG.audio.play('tap');
        var t = byId(el.getAttribute('data-tid'));
        if (sv.selectedTicketId === t.id) showDetail(t);
        else select(t.id);
      });
    });
  }

  function showDetail(t) {
    var cust = CG.customers.byId(t.customerId);
    var char = d.CHARACTERS[cust.charId];
    var r = d.RECIPES[t.recipe];
    var steps = [];
    steps.push((t.steps.brew.done ? '✓' : '○') + ' ' + (r.brew === 'espresso' ? 'Pull the shot' : r.brew === 'v60' ? 'Brew the V60' : r.brew === 'aero' ? 'Brew the AeroPress' : 'Draw from the batch'));
    if (t.steps.milk) steps.push((t.steps.milk.done ? '✓' : '○') + ' Steam & pour the milk' + (r.art ? ' art' : ''));
    CG.ui.showModal(
      '<div class="recipe-card">' +
      '<h3 class="rc-title">' + r.name + '</h3>' +
      '<p class="rc-sub">' + (t.origin ? d.ORIGINS[t.origin].name : 'house menu') + '</p>' +
      '<div class="rc-row">' +
      '<div class="rc-art">' + CG.svg.drink(t) + '</div>' +
      '<div class="rc-side"><div class="rc-for">' + CG.svg.customer(cust.charId, cust.mood) +
      '<span>for ' + char.name + '</span></div>' + CG.svg.tagPills(t) + '</div>' +
      '</div>' +
      '<p class="rc-blurb">' + r.blurb + (t.origin ? ' — ' + d.ORIGINS[t.origin].notes : '') + '</p>' +
      '<div class="rc-steps">' + steps.map(function (x) { return '<span class="rc-step' + (x[0] === '✓' ? ' done' : '') + '">' + x + '</span>'; }).join('') + '</div>' +
      '</div>'
    );
  }

  CG.events.on('ticketschange', renderStrip);
  CG.events.on('queuechange', renderStrip);

  return {
    byId: byId, createTicket: createTicket, open: open, needing: needing,
    selected: selected, select: select, pickFor: pickFor,
    completeStep: completeStep, readyToServe: readyToServe,
    serve: serve, renderStrip: renderStrip
  };
})();
