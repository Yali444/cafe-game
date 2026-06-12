/* FIKA — day summary (level-up style) + upgrade shop with machine detail view */
CG.shop = (function () {
  'use strict';

  var d = CG.data;

  /* ---------- day summary: banner + reward cards + guest list ---------- */

  function renderSummary() {
    var s = CG.state, sv = s.service;
    var el = document.getElementById('summary-body');

    var rows = sv.results.map(function (r) {
      return '<div class="sum-row">' +
        '<span class="sum-avatar">' + CG.svg.customer(r.charId, r.stars >= 3 ? 'happy' : 'neutral') + '</span>' +
        '<span class="sum-info"><b>' + r.name + '</b><small>' + r.drink + '</small></span>' +
        CG.svg.stars(r.stars) +
        '<span class="sum-cash">' + d.fmtMoney(r.price) +
        (r.tip > 0 ? '<small class="tip">+' + d.fmtMoney(r.tip) + '</small>' : '') + '</span>' +
        '</div>';
    }).join('') || '<p class="sum-none">No drinks served today…</p>';

    var best = sv.results.reduce(function (a, r) { return (!a || r.score > a.score) ? r : a; }, null);

    el.innerHTML =
      '<div class="lvlup-burst">✦ &nbsp; ✦ &nbsp; ✦</div>' +
      '<div class="ribbon-wrap"><h2 class="ribbon">Day ' + s.day + ' complete!</h2></div>' +
      '<div class="reward-row">' +
      '  <div class="reward-card"><span class="rw-icon">' + CG.svg.icon('coin') + '</span>' +
      '    <b>' + d.fmtMoney(sv.earnedToday) + '</b><small>sales</small></div>' +
      '  <div class="reward-card"><span class="rw-icon sage">' + CG.svg.icon('star') + '</span>' +
      '    <b>' + d.fmtMoney(sv.tipsToday) + '</b><small>tips</small></div>' +
      '  <div class="reward-card"><span class="rw-icon clay">' + CG.svg.icon('build') + '</span>' +
      '    <b>' + (best ? best.score : '—') + '</b><small>best drink</small></div>' +
      '</div>' +
      (sv.lostToday ? '<p class="sum-lost">' + sv.lostToday + ' guest' + (sv.lostToday > 1 ? 's' : '') + ' walked out</p>' : '') +
      '<div class="sum-list">' + rows + '</div>' +
      '<div class="sum-totals">' +
      '  <div class="grand"><span>Total earned</span><b>' + d.fmtMoney(sv.earnedToday + sv.tipsToday) + '</b></div>' +
      '</div>';

    s.stats.dayHistory.push({ day: s.day, earned: sv.earnedToday + sv.tipsToday, served: sv.results.length });
  }

  /* ---------- shop list ---------- */

  function renderShop() {
    var s = CG.state;
    var el = document.getElementById('shop-body');
    document.getElementById('shop-money').textContent = d.fmtMoney(s.money);

    el.innerHTML = Object.keys(d.UPGRADES).map(function (key) {
      var u = d.UPGRADES[key];
      var lvl = s.upgrades[key] || 0;
      var maxed = lvl >= u.max;
      var cost = maxed ? null : u.costs[lvl];
      var afford = cost != null && s.money >= cost;
      var pct = Math.round(lvl / u.max * 100);
      return '<button class="shop-card" data-detail="' + key + '">' +
        '<span class="shop-icon">' + CG.svg.icon(u.icon) + '</span>' +
        '<span class="shop-info"><b>' + u.name + '</b><small>' + u.desc + '</small>' +
        '<span class="lvlrow"><span class="lv-badge">Lv' + lvl + '</span>' +
        '<span class="lvlbar"><span class="lvlbar-fill" style="width:' + pct + '%"></span></span></span></span>' +
        (maxed
          ? '<span class="shop-max">MAX</span>'
          : '<span class="shop-price' + (afford ? '' : ' dim') + '">' + d.fmtMoney(cost) + '</span>') +
        '</button>';
    }).join('');

    el.querySelectorAll('[data-detail]').forEach(function (card) {
      card.addEventListener('click', function () {
        CG.audio.play('tap');
        showDetail(card.getAttribute('data-detail'));
      });
    });
  }

  /* ---------- upgrade detail: machine portrait + stat bars ---------- */

  function statBars(key, lvl) {
    var u = d.UPGRADES[key];
    var rows = [
      { label: u.desc, v: lvl / u.max },
      { label: 'Consistency', v: 0.45 + lvl / u.max * 0.5 },
      { label: 'Charm', v: 0.6 + lvl / u.max * 0.35 }
    ];
    return rows.map(function (r) {
      return '<div class="stat-row"><span class="stat-label">' + r.label + '</span>' +
        '<span class="lvlbar big"><span class="lvlbar-fill" style="width:' + Math.round(r.v * 100) + '%"></span></span></div>';
    }).join('');
  }

  function showDetail(key) {
    var s = CG.state;
    var u = d.UPGRADES[key];
    var lvl = s.upgrades[key] || 0;
    var maxed = lvl >= u.max;
    var cost = maxed ? null : u.costs[lvl];
    var afford = cost != null && s.money >= cost;

    CG.ui.showModal(
      '<div class="upgrade-detail">' +
      '<span class="lv-badge float">Lv' + lvl + '</span>' +
      '<div class="ud-stage">' + CG.svg.machinePortrait(key) + '</div>' +
      '<h3 class="ud-name">' + u.name + '</h3>' +
      '<div class="ud-stats">' + statBars(key, lvl) + '</div>' +
      '</div>',
      maxed
        ? [{ label: 'Fully upgraded', cls: 'btn-ghost' }]
        : [
            { label: 'Back', cls: 'btn-ghost' },
            {
              label: afford ? 'Upgrade · ' + d.fmtMoney(cost) : 'Need ' + d.fmtMoney(cost),
              cls: afford ? 'btn-primary' : '',
              onTap: afford ? function () { buy(key); } : function () { showDetail(key); }
            }
          ]
    );
  }

  function buy(key) {
    var s = CG.state;
    var u = d.UPGRADES[key];
    var lvl = s.upgrades[key] || 0;
    var cost = u.costs[lvl];
    if (cost == null || s.money < cost) return;
    s.money = Math.round((s.money - cost) * 100) / 100;
    s.upgrades[key] = lvl + 1;
    CG.audio.play('fanfare');
    CG.ui.toast(u.name + ' → Lv' + (lvl + 1), 'good');
    CG.save.save();
    renderShop();
    showDetail(key);
  }

  return { renderSummary: renderSummary, renderShop: renderShop };
})();
