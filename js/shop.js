/* Crackle & Pour — end-of-day summary + upgrade shop */
CG.shop = (function () {
  'use strict';

  var d = CG.data;

  /* ---------- day summary ---------- */

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
      '<div class="ribbon-wrap"><h2 class="ribbon">Day ' + s.day + ' Complete!</h2></div>' +
      '<div class="sum-list">' + rows + '</div>' +
      '<div class="sum-totals">' +
      '  <div><span>Sales</span><b>' + d.fmtMoney(sv.earnedToday) + '</b></div>' +
      '  <div><span>Tips</span><b class="tip">' + d.fmtMoney(sv.tipsToday) + '</b></div>' +
      (sv.lostToday ? '<div><span>Walked out</span><b class="bad">' + sv.lostToday + '</b></div>' : '') +
      (best ? '<div><span>Best drink</span><b>' + best.drink + ' (' + best.score + '%)</b></div>' : '') +
      '  <div class="grand"><span>Total earned</span><b>' + d.fmtMoney(sv.earnedToday + sv.tipsToday) + '</b></div>' +
      '</div>';

    s.stats.dayHistory.push({ day: s.day, earned: sv.earnedToday + sv.tipsToday, served: sv.results.length });
  }

  /* ---------- shop ---------- */

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
      return '<div class="shop-card' + (maxed ? ' maxed' : '') + '">' +
        '<span class="shop-icon">' + CG.svg.icon(u.icon) + '</span>' +
        '<div class="shop-info"><b>' + u.name + '</b><small>' + u.desc + '</small>' +
        '<span class="lvlrow"><span class="lv-badge">Lv' + lvl + '</span>' +
        '<span class="lvlbar"><span class="lvlbar-fill" style="width:' + pct + '%"></span></span></span></div>' +
        (maxed
          ? '<span class="shop-max">MAX</span>'
          : '<button class="btn btn-buy" data-up="' + key + '"' + (afford ? '' : ' disabled') + '>' + d.fmtMoney(cost) + '</button>') +
        '</div>';
    }).join('');

    el.querySelectorAll('[data-up]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-up');
        var u = d.UPGRADES[key];
        var lvl = s.upgrades[key] || 0;
        var cost = u.costs[lvl];
        if (s.money < cost) return;
        s.money = Math.round((s.money - cost) * 100) / 100;
        s.upgrades[key] = lvl + 1;
        CG.audio.play('cash');
        CG.ui.toast(u.name + ' upgraded!', 'good');
        CG.save.save();
        renderShop();
      });
    });
  }

  return { renderSummary: renderSummary, renderShop: renderShop };
})();
