/* Crackle & Pour — ticket lifecycle, ticket strip UI, serve scoring */
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

  function buildComponents(order) {
    var recipe = d.RECIPES[order.recipe];
    var comps = [];
    if (recipe.brew === 'espresso') comps.push({ id: 'shot', label: 'Espresso shot', kind: 'holding-brew', done: false, score: 0 });
    if (recipe.brew === 'pourover') comps.push({ id: 'coffee', label: 'Pour-over coffee', kind: 'holding-brew', done: false, score: 0 });
    if (recipe.water) comps.push({ id: 'water', label: 'Hot water', kind: 'tap', done: false, score: 0 });
    if (recipe.milk) comps.push({ id: 'milk', label: 'Steamed milk', kind: 'holding-milk', done: false, score: 0 });
    if (recipe.choc) comps.push({ id: 'choc', label: recipe.choc + ' pumps chocolate', kind: 'pump', syrup: 'chocolate', target: recipe.choc, done: false, score: 0 });
    order.extras.forEach(function (e) {
      comps.push({ id: 'syr-' + e.syrup, label: e.pumps + ' pump' + (e.pumps > 1 ? 's' : '') + ' ' + d.SYRUPS[e.syrup].name, kind: 'pump', syrup: e.syrup, target: e.pumps, done: false, score: 0 });
    });
    order.toppings.forEach(function (t) {
      comps.push({ id: 'top-' + t, label: d.TOPPINGS[t].name, kind: d.TOPPINGS[t].kind, topping: t, done: false, score: 0 });
    });
    return comps;
  }

  function createTicket(cust) {
    var sv = CG.state.service;
    var o = cust.order;
    var recipe = d.RECIPES[o.recipe];
    var t = {
      id: 't' + (sv.nextId++),
      customerId: cust.id,
      recipe: o.recipe, size: o.size, roast: o.roast,
      extras: o.extras, toppings: o.toppings,
      steps: {
        brew: recipe.brew ? { done: false, score: 0 } : null,
        milk: recipe.milk ? { done: false, score: 0 } : null,
        build: { done: false, score: 0 }
      },
      components: buildComponents(o),
      mistakes: 0,
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
    var sv = CG.state.service;
    return open().filter(function (t) {
      if (!t.steps[step] || t.steps[step].done) return false;
      // brew/milk also excluded if their output is already in hand
      var hold = step === 'brew' ? sv.holding.brew : step === 'milk' ? sv.holding.milk : null;
      if (hold && hold.ticketId === t.id) return false;
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

  // prefer the selected ticket if it needs `step`, else the oldest one that does
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

  function buildDone(ticket) {
    return ticket.components.every(function (c) { return c.done; });
  }

  function readyToServe(ticket) {
    return (!ticket.steps.brew || ticket.steps.brew.done) &&
           (!ticket.steps.milk || ticket.steps.milk.done) &&
           buildDone(ticket);
  }

  /* ---------- serve & scoring ---------- */

  function makeScore(ticket) {
    var sv = CG.state.service;
    var parts = [];
    if (ticket.steps.brew) parts.push({ w: 0.35, v: ticket.steps.brew.score });
    if (ticket.steps.milk) parts.push({ w: 0.25, v: ticket.steps.milk.score });
    var compScores = ticket.components.map(function (c) { return c.score; });
    var buildScore = compScores.length
      ? compScores.reduce(function (a, b) { return a + b; }, 0) / compScores.length
      : 100;
    buildScore = Math.max(0, buildScore - 15 * ticket.mistakes);
    ticket.steps.build.score = Math.round(buildScore);
    parts.push({ w: 0.25, v: buildScore });
    if (ticket.roast) {
      var q = sv.roastQuality[ticket.roast];
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
    var tip = Math.round(price * tipRate * quirkMod * 100) / 100;

    s.money = Math.round((s.money + price + tip) * 100) / 100;
    sv.earnedToday = Math.round((sv.earnedToday + price) * 100) / 100;
    sv.tipsToday = Math.round((sv.tipsToday + tip) * 100) / 100;
    s.stats.servedTotal++;
    if (final > s.stats.bestDrink) s.stats.bestDrink = final;

    ticket.status = 'served';
    cust.status = 'done';
    cust.mood = stars >= 3 ? 'happy' : stars === 2 ? 'neutral' : 'annoyed';
    if (sv.selectedTicketId === ticket.id) {
      var next = open()[0];
      sv.selectedTicketId = next ? next.id : null;
    }

    sv.results.push({
      name: char.name, charId: cust.charId,
      drink: d.SIZES[ticket.size].name + ' ' + d.RECIPES[ticket.recipe].name,
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
      stripEl.innerHTML = '<div class="strip-empty">No open tickets — greet your customers!</div>';
      return;
    }
    stripEl.innerHTML = tickets.map(function (t) {
      var cust = CG.customers.byId(t.customerId);
      var char = d.CHARACTERS[cust.charId];
      var sel = sv.selectedTicketId === t.id ? ' sel' : '';
      var ring = CG.moodColor(cust.patience);
      return '<button class="mini-ticket' + sel + '" data-tid="' + t.id + '" style="--ring:' + ring + '">' +
        '<span class="mt-name">' + char.name + '</span>' +
        '<span class="mt-drink">' + t.size + ' · ' + d.RECIPES[t.recipe].name + '</span>' +
        (t.roast ? '<span class="mt-roast" style="color:' + d.ROASTS[t.roast].color + '">●</span> ' : '') +
        '<span class="mt-steps">' +
        stepIcon('B', t.steps.brew) + stepIcon('M', t.steps.milk) +
        '<span class="tstep ' + (buildDone(t) ? 'done' : '') + '">A</span>' +
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
    var steps = t.components.map(function (c) {
      return '<span class="rc-step' + (c.done ? ' done' : '') + '">' + (c.done ? '✓' : '○') + ' ' + c.label + '</span>';
    }).join('');
    CG.ui.showModal(
      '<div class="recipe-card">' +
      '<h3 class="rc-title">' + d.SIZES[t.size].name + ' ' + d.RECIPES[t.recipe].name + '</h3>' +
      '<div class="rc-row">' +
      '<div class="rc-art">' + CG.svg.drink(t, false) + '</div>' +
      '<div class="rc-side"><div class="rc-for">' + CG.svg.customer(cust.charId, cust.mood) +
      '<span>for ' + char.name + '</span></div>' + CG.svg.tagPills(t) + '</div>' +
      '</div>' +
      '<div class="rc-steps">' + steps + '</div>' +
      '</div>'
    );
  }

  CG.events.on('ticketschange', renderStrip);
  CG.events.on('queuechange', renderStrip);

  return {
    byId: byId, createTicket: createTicket, open: open, needing: needing,
    selected: selected, select: select, pickFor: pickFor,
    completeStep: completeStep, buildDone: buildDone, readyToServe: readyToServe,
    serve: serve, renderStrip: renderStrip
  };
})();
