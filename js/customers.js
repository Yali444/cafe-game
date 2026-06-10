/* Crackle & Pour — customer arrivals, patience, moods, order generation */
CG.customers = (function () {
  'use strict';

  var d = CG.data;

  function byId(id) {
    var sv = CG.state.service;
    if (!sv) return null;
    for (var i = 0; i < sv.customers.length; i++) {
      if (sv.customers[i].id === id) return sv.customers[i];
    }
    return null;
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ---------- order generation ---------- */

  function rollOrder(char) {
    var s = CG.state;
    var recipes = s.unlocked.recipes.slice();
    if (char.only) {
      var allowed = char.only.filter(function (r) { return recipes.indexOf(r) >= 0; });
      if (allowed.length) recipes = allowed;
    }
    var recipeId;
    if (char.prefersComplex) {
      recipes.sort(function (a, b) { return d.RECIPES[b].complexity - d.RECIPES[a].complexity; });
      recipeId = recipes[0];
    } else if (char.prefersNewest || Math.random() < 0.4) {
      recipeId = recipes[recipes.length - 1]; // unlock order is preserved in the array
    } else {
      recipeId = pick(recipes);
    }
    var recipe = d.RECIPES[recipeId];

    var roast = null;
    if (recipe.brew) {
      if (char.forceRoast && s.unlocked.roasts.indexOf(char.forceRoast) >= 0) roast = char.forceRoast;
      else roast = pick(s.unlocked.roasts);
    }

    var extras = [];
    if (recipe.syrupOk && s.unlocked.syrups.length && (char.sweet || Math.random() < 0.5)) {
      var syr = pick(s.unlocked.syrups);
      var pumps = 1 + Math.floor(Math.random() * 3);
      if (char.sweet) pumps = Math.max(2, pumps);
      extras.push({ syrup: syr, pumps: pumps });
    }

    var toppings = [];
    recipe.toppingsOk.forEach(function (t) {
      if (s.unlocked.toppings.indexOf(t) >= 0 && toppings.length < 2 && Math.random() < 0.35) toppings.push(t);
    });

    return { recipe: recipeId, size: pick(['S', 'M', 'L']), roast: roast, extras: extras, toppings: toppings };
  }

  function orderText(order) {
    var r = d.RECIPES[order.recipe];
    var parts = [d.SIZES[order.size].name + ' ' + r.name];
    if (order.roast) parts.push(d.ROASTS[order.roast].name.toLowerCase() + ' roast');
    order.extras.forEach(function (e) { parts.push(e.pumps + ' pump' + (e.pumps > 1 ? 's' : '') + ' ' + d.SYRUPS[e.syrup].name.toLowerCase()); });
    order.toppings.forEach(function (t) { parts.push(d.TOPPINGS[t].name.toLowerCase()); });
    return parts.join(', ');
  }

  /* ---------- day scheduling ---------- */

  function startDay() {
    var s = CG.state, sv = s.service;
    var count = d.dayCustomerCount(s.day);
    var ids = Object.keys(d.CHARACTERS).filter(function (cid) {
      var c = d.CHARACTERS[cid];
      return !c.minDay || s.day >= c.minDay;
    });

    // arrival times: even spread with jitter; the first arrives quickly
    var times = [];
    var usable = sv.dayLength - 15;
    for (var i = 0; i < count; i++) {
      var base = 4 + (usable - 4) * (i / count);
      times.push(Math.max(2, base + (Math.random() * 14 - 7)));
    }
    // a rush cluster from day 3 — three arrivals squeezed mid-day
    if (s.day >= 3 && count >= 6) {
      var mid = usable * (0.4 + Math.random() * 0.2);
      times[Math.floor(count / 2) - 1] = mid;
      times[Math.floor(count / 2)] = mid + 5;
      times[Math.floor(count / 2) + 1] = mid + 11;
    }
    times.sort(function (a, b) { return a - b; });

    var lastChar = null;
    sv.spawnQueue = times.map(function (t) {
      var cid;
      do { cid = pick(ids); } while (cid === lastChar && ids.length > 1);
      lastChar = cid;
      return { at: t, charId: cid };
    });
  }

  function spawn(charId) {
    var sv = CG.state.service;
    var char = d.CHARACTERS[charId];
    var cust = {
      id: 'c' + (sv.nextId++),
      charId: charId,
      status: 'queued',          // queued -> waiting -> done | left
      patience: 100,
      order: rollOrder(char),
      mood: 'happy',
      ringTimer: 0
    };
    sv.customers.push(cust);
    CG.audio.play('select');
    CG.events.emit('queuechange');
    return cust;
  }

  /* ---------- per-frame update ---------- */

  function update(dt) {
    var s = CG.state, sv = s.service;

    // arrivals
    while (sv.spawnQueue.length && sv.spawnQueue[0].at <= sv.clock && !sv.closed) {
      spawn(sv.spawnQueue.shift().charId);
    }

    var decayPerSec = 100 / d.patienceSeconds(s.day) * CG.upgradeValue('decor');
    var changed = false;

    sv.customers.forEach(function (c) {
      if (c.status !== 'queued' && c.status !== 'waiting') return;
      var char = d.CHARACTERS[c.charId];
      var before = c.patience;
      c.patience = Math.max(0, c.patience - decayPerSec / char.patienceMult * dt);
      if (char.patienceFloor) c.patience = Math.max(char.patienceFloor, c.patience);

      var mood = CG.moodFor(c.patience);
      if (mood !== c.mood) { c.mood = mood; changed = true; if (mood === 'angry') CG.audio.play('buzz'); }

      // storm-out only while still un-ordered
      if (c.patience <= 0 && c.status === 'queued') {
        c.status = 'left';
        sv.lostToday++;
        CG.ui.toast(char.name + ' left without ordering!', 'bad');
        CG.audio.play('buzz');
        changed = true;
      }

      // throttle ring redraw to ~4Hz
      c.ringTimer += dt;
      if (c.ringTimer > 0.25 && Math.abs(before - c.patience) > 0.01) {
        c.ringTimer = 0;
        CG.events.emit('patiencetick', c);
      }
    });

    if (changed) CG.events.emit('queuechange');
  }

  function queued() {
    return CG.state.service.customers.filter(function (c) { return c.status === 'queued'; });
  }
  function waiting() {
    return CG.state.service.customers.filter(function (c) { return c.status === 'waiting'; });
  }
  function unresolved() {
    return CG.state.service.customers.filter(function (c) { return c.status === 'queued' || c.status === 'waiting'; });
  }

  // at closing time un-ordered customers head home politely
  function closeDoors() {
    queued().forEach(function (c) { c.status = 'left'; });
    CG.events.emit('queuechange');
  }

  return {
    byId: byId, startDay: startDay, update: update, orderText: orderText,
    queued: queued, waiting: waiting, unresolved: unresolved, closeDoors: closeDoors
  };
})();
