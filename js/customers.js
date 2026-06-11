/* FIKA — guest arrivals, patience, moods, order generation */
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
      recipeId = recipes[recipes.length - 1]; // unlock order preserved
    } else {
      recipeId = pick(recipes);
    }
    var recipe = d.RECIPES[recipeId];

    var origin = null;
    if (recipe.brew === 'batch') {
      origin = d.BATCH_ORIGIN;
    } else if (recipe.brew) {
      if (char.forceOrigin && s.unlocked.origins.indexOf(char.forceOrigin) >= 0) origin = char.forceOrigin;
      else origin = pick(s.unlocked.origins);
    }

    return { recipe: recipeId, origin: origin };
  }

  function orderText(order) {
    var r = d.RECIPES[order.recipe];
    if (order.recipe === 'batch') return 'Just a cup of the batch filter';
    if (!order.origin) return 'A ' + r.name.toLowerCase();
    var o = d.ORIGINS[order.origin];
    if (r.milk) return 'A ' + r.name.toLowerCase() + ' on the ' + o.short;
    return 'The ' + o.short + ' as ' + (r.name === 'Espresso' ? 'a straight shot' : (r.name === 'AeroPress' ? 'an AeroPress' : 'a ' + r.name)) +
      ' — something ' + o.flavor;
  }

  /* ---------- day scheduling ---------- */

  function startDay() {
    var s = CG.state, sv = s.service;
    var count = d.dayCustomerCount(s.day);
    var ids = Object.keys(d.CHARACTERS).filter(function (cid) {
      var c = d.CHARACTERS[cid];
      return !c.minDay || s.day >= c.minDay;
    });

    var times = [];
    var usable = sv.dayLength - 15;
    for (var i = 0; i < count; i++) {
      var base = 4 + (usable - 4) * (i / count);
      times.push(Math.max(2, base + (Math.random() * 14 - 7)));
    }
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

      if (c.patience <= 0 && c.status === 'queued') {
        c.status = 'left';
        sv.lostToday++;
        CG.ui.toast(char.name + ' left without ordering', 'bad');
        CG.audio.play('buzz');
        changed = true;
      }

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

  function closeDoors() {
    queued().forEach(function (c) { c.status = 'left'; });
    CG.events.emit('queuechange');
  }

  return {
    byId: byId, startDay: startDay, update: update, orderText: orderText,
    queued: queued, waiting: waiting, unresolved: unresolved, closeDoors: closeDoors
  };
})();
