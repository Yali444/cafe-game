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

    // the player chooses the bean now; the guest only carries a soft preference
    var origin = null, prefer = null;
    if (recipe.brew === 'batch') {
      origin = d.BATCH_ORIGIN;
    } else if (recipe.brew) {
      if (char.forceOrigin && s.unlocked.origins.indexOf(char.forceOrigin) >= 0) prefer = char.forceOrigin;
      else if (Math.random() < 0.6) prefer = pick(s.unlocked.origins);
      origin = prefer || pick(s.unlocked.origins); // a sensible default; player can change it
    }

    return { recipe: recipeId, origin: origin, preferOrigin: prefer };
  }

  function orderText(order) {
    var r = d.RECIPES[order.recipe];
    if (order.recipe === 'batch') return 'Just a cup of the batch filter';
    var base = r.name === 'Espresso' ? 'an espresso' :
      r.name === 'AeroPress' ? 'an AeroPress' :
      'a ' + r.name.toLowerCase();
    if (order.preferOrigin) {
      var o = d.ORIGINS[order.preferOrigin];
      return 'I\'d love ' + base + ' — the ' + o.short + ' if you have it';
    }
    return 'Could I get ' + base;
  }

  /* ---------- day scheduling (one guest at a time) ---------- */

  function startDay() {
    var s = CG.state, sv = s.service;
    var ids = Object.keys(d.CHARACTERS).filter(function (cid) {
      var c = d.CHARACTERS[cid];
      return !c.minDay || s.day >= c.minDay;
    });

    // build the day's guest list, avoiding the same regular twice in a row
    var queue = [];
    var lastChar = null;
    for (var i = 0; i < sv.guestsTotal; i++) {
      var cid;
      do { cid = pick(ids); } while (cid === lastChar && ids.length > 1);
      lastChar = cid;
      queue.push(cid);
    }
    sv.charQueue = queue;
    sv.guestsSpawned = 0;
    sv.pendingSpawn = 1.5; // the first guest takes a beat to arrive
  }

  function spawn(charId) {
    var sv = CG.state.service;
    var char = d.CHARACTERS[charId];
    var cust = {
      id: 'c' + (sv.nextId++),
      charId: charId,
      status: 'queued',          // queued -> waiting -> done
      patience: 100,
      order: rollOrder(char),
      mood: 'happy',
      ringTimer: 0,
      arriving: true
    };
    sv.customers.push(cust);
    CG.audio.play('ding');
    CG.events.emit('queuechange');
    return cust;
  }

  /* ---------- per-frame update ---------- */

  function update(dt) {
    var s = CG.state, sv = s.service;
    var active = unresolved();

    // schedule the next guest only once the counter is clear
    if (active.length === 0 && sv.guestsSpawned < sv.guestsTotal) {
      if (sv.pendingSpawn == null) sv.pendingSpawn = d.nextArrivalDelay();
      sv.pendingSpawn -= dt;
      if (sv.pendingSpawn <= 0) {
        sv.pendingSpawn = null;
        spawn(sv.charQueue[sv.guestsSpawned++]);
      }
    }

    // patience is a slow, forgiving wait meter — it floors but never makes a guest leave
    var decayPerSec = 100 / d.patienceSeconds(s.day) * CG.upgradeValue('decor');
    var changed = false;

    sv.customers.forEach(function (c) {
      if (c.status !== 'queued' && c.status !== 'waiting') return;
      var char = d.CHARACTERS[c.charId];
      var before = c.patience;
      c.patience = Math.max(0, c.patience - decayPerSec / char.patienceMult * dt);
      if (char.patienceFloor) c.patience = Math.max(char.patienceFloor, c.patience);

      var mood = CG.moodFor(c.patience);
      if (mood !== c.mood) { c.mood = mood; changed = true; }

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
