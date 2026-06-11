/* FIKA — Nordic soft-shaded SVG art: scenes, equipment, characters */
CG.svg = (function () {
  'use strict';

  var INK = '#2e2a26';

  /* ============ shared scene plumbing (360x240, counter top at y=172) ============ */

  function defs(p) {
    return '<defs>' +
      '<linearGradient id="' + p + 'w" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#f5f0e8"/><stop offset="1" stop-color="#e8e1d3"/></linearGradient>' +
      '<linearGradient id="' + p + 'ct" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#b6967a"/><stop offset="1" stop-color="#9a7d63"/></linearGradient>' +
      '<linearGradient id="' + p + 'wd" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#8d7159"/><stop offset="1" stop-color="#755d4a"/></linearGradient>' +
      '<linearGradient id="' + p + 'st" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#56504a"/><stop offset="1" stop-color="#403b36"/></linearGradient>' +
      '<filter id="' + p + 'b" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="5"/></filter>' +
      '</defs>';
  }

  function open(p, cls) {
    return '<svg viewBox="0 0 360 240" class="scene-svg ' + (cls || '') + '" preserveAspectRatio="xMidYMid slice">' + defs(p);
  }

  function wall(p) {
    return '<rect x="-5" y="-5" width="370" height="250" fill="url(#' + p + 'w)"/>' +
      '<rect x="-5" y="-5" width="370" height="250" fill="#caa97e" opacity="0.05"/>';
  }

  function counter(p) {
    return '<rect x="-6" y="182" width="372" height="62" fill="url(#' + p + 'wd)"/>' +
      '<rect x="-6" y="168" width="372" height="16" rx="6" fill="url(#' + p + 'ct)"/>' +
      '<rect x="-6" y="168" width="372" height="3.5" rx="1.75" fill="#ffffff" opacity="0.35"/>' +
      '<rect x="-6" y="182" width="372" height="5" fill="#3c352d" opacity="0.18"/>';
  }

  function shadow(p, x, y, rx, ry, op) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + (ry || 5) + '" fill="#3c352d" opacity="' + (op || 0.16) + '" filter="url(#' + p + 'b)"/>';
  }

  /* ---------- furnishing props ---------- */

  function pendant(x, len) {
    return '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + len + '" stroke="#4a443d" stroke-width="2"/>' +
      '<path d="M' + (x - 17) + ' ' + (len + 16) + ' a17 17 0 0 1 34 0 z" fill="#4a443d"/>' +
      '<path d="M' + (x - 17) + ' ' + (len + 16) + ' a17 17 0 0 1 34 0 l-4 0 a13 13 0 0 0 -26 0 z" fill="#5d564e"/>' +
      '<circle cx="' + x + '" cy="' + (len + 13) + '" r="4" fill="#f3d9a4" opacity="0.95"/>' +
      '<circle cx="' + x + '" cy="' + (len + 14) + '" r="10" fill="#f3d9a4" opacity="0.22"/>';
  }

  function menuBoard(p, x, y, w, h) {
    var lines = '', i;
    for (i = 0; i < 4; i++) {
      lines += '<rect x="' + (x + 12) + '" y="' + (y + 16 + i * 13) + '" width="' + (w - 24 - (i % 2) * 14) + '" height="3.5" rx="1.75" fill="#e9e2d3" opacity="0.7"/>';
    }
    return shadow(p, x + w / 2, y + h + 4, w / 2, 4, 0.12) +
      '<rect x="' + (x - 4) + '" y="' + (y - 4) + '" width="' + (w + 8) + '" height="' + (h + 8) + '" rx="6" fill="#b6967a"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="#43504a"/>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + 11) + '" text-anchor="middle" font-size="8" letter-spacing="2" fill="#e9e2d3" font-family="Georgia,serif" font-style="italic">menu</text>' +
      lines;
  }

  function plant(p, x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' +
      shadow(p, 0, 3, 16, 4, 0.14) +
      '<path d="M0 -6 q-4 -20 -16 -27 M0 -6 q0 -24 5 -33 M0 -6 q7 -18 18 -23" stroke="#7b8a6f" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="-16" cy="-29" rx="6" ry="9" fill="#92a285" transform="rotate(-32 -16 -29)"/>' +
      '<ellipse cx="5" cy="-35" rx="6" ry="10" fill="#9cab8e"/>' +
      '<ellipse cx="18" cy="-25" rx="6" ry="9" fill="#86977a" transform="rotate(30 18 -25)"/>' +
      '<path d="M-13 -6 h26 l-4 17 h-18 z" fill="#ddd5c4"/>' +
      '<path d="M-13 -6 h26 l-1 4 h-24 z" fill="#ffffff" opacity="0.4"/>' +
      '</g>';
  }

  function framedArch(x, y) {
    return '<rect x="' + x + '" y="' + y + '" width="44" height="56" rx="3" fill="#faf7f1"/>' +
      '<rect x="' + x + '" y="' + y + '" width="44" height="56" rx="3" fill="none" stroke="#cbbfa9" stroke-width="2"/>' +
      '<path d="M' + (x + 10) + ' ' + (y + 44) + ' v-16 a12 12 0 0 1 24 0 v16 z" fill="#c97f5d" opacity="0.85"/>' +
      '<circle cx="' + (x + 22) + '" cy="' + (y + 16) + '" r="5" fill="#d9b87c"/>';
  }

  function shelfThin(p, x, y, w) {
    return shadow(p, x + w / 2, y + 10, w / 2, 3, 0.1) +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="6" rx="3" fill="#b6967a"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="2" rx="1" fill="#ffffff" opacity="0.3"/>';
  }

  function cupRow(x, y, n) {
    var out = '', i;
    for (i = 0; i < n; i++) {
      out += '<path d="M' + (x + i * 20) + ' ' + y + ' h14 l-2 11 h-10 z" fill="#faf7f1"/>' +
        '<path d="M' + (x + i * 20) + ' ' + y + ' h14 l-0.5 3 h-13 z" fill="#ddd5c4"/>';
    }
    return out;
  }

  function beanBag(p, x, y, origin, s) {
    var o = CG.data.ORIGINS[origin];
    return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' +
      shadow(p, 0, 46, 22, 5, 0.16) +
      '<path d="M-20 -8 q-6 30 -3 48 q23 9 46 0 q3 -18 -3 -48 z" fill="#e3d6bf"/>' +
      '<path d="M-20 -8 q-6 30 -3 48 q10 4 23 4 l0 -52 z" fill="#d8c9b0"/>' +
      '<path d="M-20 -8 q20 7 40 0 l2 -9 q-22 -6 -44 0 z" fill="#cdbda2"/>' +
      '<rect x="-15" y="8" width="30" height="22" rx="3" fill="#faf7f1"/>' +
      '<circle cx="0" cy="14" r="4" fill="' + o.bag + '"/>' +
      '<text x="0" y="26" text-anchor="middle" font-size="7.5" font-weight="600" fill="' + INK + '" font-family="system-ui,sans-serif">' + o.short + '</text>' +
      '</g>';
  }

  /* ============ scenes ============ */

  /* --- order: the front of house --- */

  function sceneOrderBack() {
    var p = 'so';
    return open(p, 'scene-back') + wall(p) +
      pendant(64, 26) + pendant(296, 40) +
      menuBoard(p, 132, 36, 96, 72) +
      framedArch(22, 58) + shelfThin(p, 252, 70, 86) + cupRow(262, 56, 3) +
      plant(p, 322, 168, 1) +
      '</svg>';
  }

  function sceneOrderFront() {
    var p = 'sf';
    return open(p, 'scene-front-svg') + counter(p) +
      // register
      shadow(p, 50, 168, 30, 5, 0.2) +
      '<rect x="24" y="138" width="52" height="32" rx="7" fill="url(#' + p + 'st)"/>' +
      '<rect x="30" y="144" width="26" height="12" rx="3" fill="#cfe3d6" opacity="0.9"/>' +
      '<circle cx="66" cy="150" r="4" fill="#c97f5d"/>' +
      // small vase
      '<path d="M300 146 q-5 12 0 22 q9 4 18 0 q5 -10 0 -22 q-9 -4 -18 0z" fill="#ddd5c4"/>' +
      '<path d="M306 146 q-2 -10 -8 -14 M312 146 q1 -11 6 -15" stroke="#9aab8c" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      // menu card on the counter
      '<rect x="92" y="148" width="26" height="22" rx="3" fill="#faf7f1" transform="rotate(-5 105 159)"/>' +
      '<line x1="97" y1="155" x2="111" y2="153.5" stroke="#cbbfa9" stroke-width="2"/>' +
      '<line x1="97" y1="160" x2="111" y2="158.5" stroke="#cbbfa9" stroke-width="2"/>' +
      '</svg>';
  }

  /* --- roastery --- */

  function sceneRoast() {
    var p = 'sr';
    return open(p) + wall(p) +
      shelfThin(p, 18, 56, 120) + cupRow(28, 42, 2) +
      '<text x="78" y="50" font-size="9" letter-spacing="3" fill="#a59a88" font-family="system-ui,sans-serif">ROASTERY</text>' +
      // drum roaster: cream body, charcoal drum, walnut base
      '<g transform="translate(28,76)">' +
      shadow(p, 62, 100, 64, 7, 0.18) +
      '<rect x="0" y="86" width="124" height="14" rx="6" fill="url(#' + p + 'ct)"/>' +
      '<rect x="6" y="0" width="112" height="88" rx="16" fill="#efe9dd"/>' +
      '<rect x="6" y="0" width="112" height="10" rx="5" fill="#ffffff" opacity="0.5"/>' +
      '<rect x="6" y="74" width="112" height="14" rx="7" fill="#ddd5c4"/>' +
      '<circle cx="62" cy="44" r="33" fill="url(#' + p + 'st)"/>' +
      '<circle cx="62" cy="44" r="26" fill="#1f1c19"/>' +
      '<g id="roast-beans"></g>' +
      '<circle cx="55" cy="36" r="11" fill="#ffffff" opacity="0.07"/>' +
      '<circle cx="104" cy="16" r="6" fill="#c97f5d"/>' +
      '<rect x="14" y="12" width="22" height="8" rx="4" fill="#cbbfa9"/>' +
      '<path d="M40 88 h44 l-5 12 h-34 z" fill="#755d4a"/>' +
      '<g id="roast-smoke" opacity="0"><circle cx="62" cy="-8" r="7" fill="#b9b2a6" opacity="0.7"/>' +
      '<circle cx="74" cy="-16" r="9" fill="#c9c2b6" opacity="0.6"/><circle cx="52" cy="-18" r="6" fill="#c9c2b6" opacity="0.5"/></g>' +
      '</g>' +
      counter(p) +
      '<g id="roast-bags"></g>' +
      '</svg>';
  }

  /* origin bags standing on the roastery counter; tap zones are laid over these x-centres */
  var ROAST_BAG_X = [206, 258, 310];
  function roastBags(unlocked, inv, quality, selected) {
    var p = 'sr';
    return unlocked.map(function (o, i) {
      var x = ROAST_BAG_X[i];
      var q = quality[o];
      return '<g' + (selected === o ? ' class="bag-sel"' : '') + '>' +
        beanBag(p, x, 126, o, 0.92) +
        '<g transform="translate(' + x + ',106)">' +
        '<rect x="-14" y="-10" width="28" height="17" rx="8.5" fill="' + (inv[o] > 0 ? '#4a443d' : '#b9ab93') + '"/>' +
        '<text x="0" y="2.5" text-anchor="middle" font-size="10" font-weight="700" fill="#faf7f1" font-family="system-ui,sans-serif">' + inv[o] + '</text>' +
        '</g>' +
        (q != null ? '<text x="' + x + '" y="182" text-anchor="middle" font-size="7.5" fill="#efe9dd" font-family="system-ui,sans-serif">q ' + Math.round(q) + '</text>' : '') +
        '</g>';
    }).join('');
  }

  function beanGroup(n, color) {
    var out = '', i, a, r, x, y, rot;
    for (i = 0; i < n; i++) {
      a = (i * 137.5) * Math.PI / 180;
      r = 3 + (i * 7919 % 21);
      x = 62 + Math.cos(a) * r;
      y = 44 + Math.sin(a) * r * 0.8;
      rot = (i * 53) % 180;
      out += '<g transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + rot + ')">' +
        '<ellipse rx="4" ry="2.7" fill="' + color + '"/>' +
        '<line x1="-2.6" y1="0" x2="2.6" y2="0" stroke="#00000055" stroke-width="0.8"/></g>';
    }
    return out;
  }

  /* --- brew bar variants --- */

  function brewWallCommon(p, label) {
    return wall(p) + pendant(40, 18) +
      shelfThin(p, 230, 52, 116) + cupRow(240, 38, 3) +
      '<text x="20" y="50" font-size="9" letter-spacing="3" fill="#a59a88" font-family="system-ui,sans-serif">' + label + '</text>';
  }

  /* espresso: grinder left, machine centre, shot glass under group (glass local h=40) */
  function sceneBrewEspresso() {
    var p = 'se';
    return open(p) + brewWallCommon(p, 'BREW BAR') +
      // grinder
      '<g transform="translate(34,66)">' +
      shadow(p, 26, 110, 30, 6, 0.18) +
      '<rect x="6" y="34" width="40" height="72" rx="9" fill="url(#' + p + 'st)"/>' +
      '<rect x="6" y="34" width="40" height="8" rx="4" fill="#6a635b"/>' +
      '<path d="M12 34 h28 l-5 -22 h-18 z" fill="#e8e2d6" opacity="0.92"/>' +
      '<ellipse cx="22" cy="22" rx="4" ry="2.8" fill="#7e5634"/><ellipse cx="31" cy="18" rx="4" ry="2.8" fill="#6e4a2c"/>' +
      '<circle cx="26" cy="64" r="8" fill="#b6967a"/>' +
      '<circle cx="26" cy="64" r="3" fill="#755d4a"/>' +
      '<rect x="18" y="88" width="16" height="10" rx="3" fill="#2b2724"/>' +
      '</g>' +
      // espresso machine: low matte charcoal + walnut sides
      '<g transform="translate(118,84)">' +
      shadow(p, 80, 90, 86, 8, 0.2) +
      '<rect x="0" y="0" width="160" height="62" rx="12" fill="url(#' + p + 'st)"/>' +
      '<rect x="0" y="0" width="160" height="8" rx="4" fill="#6a635b"/>' +
      '<rect x="-8" y="6" width="14" height="52" rx="6" fill="#8d7159"/>' +
      '<rect x="154" y="6" width="14" height="52" rx="6" fill="#8d7159"/>' +
      cupRow(18, -12, 2) + cupRow(106, -12, 2) +
      '<circle cx="34" cy="30" r="9" fill="#efe9dd"/><circle cx="34" cy="30" r="3.5" fill="#c97f5d"/>' +
      '<rect x="120" y="22" width="26" height="6" rx="3" fill="#8d7159"/>' +
      // group head + portafilter dock
      '<rect x="62" y="58" width="38" height="14" rx="5" fill="#2b2724"/>' +
      '<g id="esp-pf-dock" opacity="0"><rect x="56" y="68" width="50" height="8" rx="4" fill="#8d7159"/><path d="M76 76 h10 v6 h-10 z" fill="#2b2724"/></g>' +
      '<g id="esp-stream" opacity="0"><rect x="78" y="80" width="5" height="28" rx="2.5" fill="#8a5a30"/></g>' +
      // drip tray
      '<rect x="44" y="100" width="74" height="7" rx="3.5" fill="#9b948b"/>' +
      '</g>' +
      // shot glass on the tray (fill rect local: y=130+... glass top y=130? define group)
      '<g id="esp-glass" transform="translate(180,142)">' +
      '<clipPath id="' + p + 'gc"><path d="M1 1 h30 l-3 30 a4 4 0 0 1 -4 3 h-16 a4 4 0 0 1 -4 -3 z"/></clipPath>' +
      '<g clip-path="url(#' + p + 'gc)"><rect id="esp-fill" x="0" y="34" width="32" height="36" fill="#8a5a30"/>' +
      '<rect x="0" y="34" width="32" height="3" fill="#caa468" id="esp-crema"/></g>' +
      '<path d="M0 0 h32 l-3 31 a5 5 0 0 1 -5 4 h-16 a5 5 0 0 1 -5 -4 z" fill="none" stroke="#ffffff" stroke-opacity="0.75" stroke-width="2.5"/>' +
      '<line id="esp-target" x1="-7" y1="13" x2="39" y2="13" stroke="#c97f5d" stroke-width="2.5" stroke-dasharray="4 3"/>' +
      '</g>' +
      counter(p) +
      '</svg>';
  }

  /* portafilter for dragging (DOM element) */
  function portafilter() {
    return '<svg viewBox="0 0 90 44" class="drag-svg">' +
      '<ellipse cx="34" cy="38" rx="26" ry="4" fill="#3c352d" opacity="0.18"/>' +
      '<path d="M10 14 h48 v10 a14 14 0 0 1 -14 12 h-20 a14 14 0 0 1 -14 -12 z" fill="#56504a"/>' +
      '<path d="M10 14 h48 v5 h-48 z" fill="#6a635b"/>' +
      '<rect x="56" y="14" width="32" height="9" rx="4.5" fill="#8d7159"/>' +
      '<rect x="56" y="14" width="32" height="3.5" rx="1.75" fill="#ffffff" opacity="0.3"/>' +
      '</svg>';
  }

  /* v60: stand + dripper + server on a scale; kettle is a separate draggable */
  function sceneBrewV60() {
    var p = 'sv';
    return open(p) + brewWallCommon(p, 'SLOW BAR') +
      '<g transform="translate(96,52)">' +
      shadow(p, 44, 122, 52, 7, 0.18) +
      // slate scale
      '<rect x="-4" y="114" width="96" height="10" rx="5" fill="#4a443d"/>' +
      '<rect x="64" y="116.5" width="18" height="5" rx="2.5" fill="#cfe3d6" opacity="0.85"/>' +
      // glass server
      '<g id="v60-server">' +
      '<clipPath id="' + p + 'sc"><path d="M12 62 h64 l-6 50 h-52 z"/></clipPath>' +
      '<g clip-path="url(#' + p + 'sc)"><rect id="v60-fill" x="8" y="112" width="72" height="56" fill="#7a4e28"/></g>' +
      '<path d="M12 62 h64 l-6 50 h-52 z" fill="#ffffff" opacity="0.14"/>' +
      '<path d="M12 62 h64 l-6 50 h-52 z" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="2.5"/>' +
      '<line id="v60-line1" x1="6" y1="98" x2="82" y2="98" stroke="#c97f5d" stroke-width="2" stroke-dasharray="3 3"/>' +
      '<line id="v60-line2" x1="6" y1="84" x2="82" y2="84" stroke="#c97f5d" stroke-width="2" stroke-dasharray="3 3" opacity="0"/>' +
      '<line id="v60-line3" x1="6" y1="68" x2="82" y2="68" stroke="#c97f5d" stroke-width="2" stroke-dasharray="3 3" opacity="0"/>' +
      '</g>' +
      // ceramic V60 with walnut collar
      '<path d="M14 18 h60 l-21 38 h-18 z" fill="#faf7f1"/>' +
      '<path d="M14 18 h60 l-3 6 h-54 z" fill="#ffffff"/>' +
      '<path d="M14 18 h60 l-21 38 h-18 z" fill="#cbbfa9" opacity="0.25"/>' +
      '<ellipse id="v60-water" cx="44" cy="30" rx="0" ry="0" fill="#8a5a30" opacity="0.85"/>' +
      '<path d="M20 30 h48 l-2.5 5 h-43 z" fill="#8d7159"/>' +
      '<path d="M40 56 h8 v6 h-8 z" fill="#ddd5c4"/>' +
      '<g id="v60-drip" opacity="0"><rect x="41.5" y="60" width="4" height="14" rx="2" fill="#8a5a30"/></g>' +
      '</g>' +
      counter(p) +
      '</svg>';
  }

  /* matte black gooseneck kettle (draggable DOM element); spout at left tip */
  function kettle() {
    return '<svg viewBox="0 0 110 80" class="drag-svg">' +
      '<ellipse cx="62" cy="74" rx="34" ry="5" fill="#3c352d" opacity="0.18"/>' +
      '<path d="M34 30 q-2 40 28 40 q30 0 28 -40 z" fill="#3a3531"/>' +
      '<path d="M34 30 q-2 8 1 14 l52 0 q3 -6 1 -14 z" fill="#4a443d"/>' +
      '<path d="M34 32 q-16 2 -26 16 l-6 -3 q10 -18 30 -19 z" fill="#3a3531"/>' +
      '<path d="M2 45 l6 3 4 -5 -7 -4 z" fill="#3a3531"/>' +
      '<rect x="40" y="20" width="44" height="10" rx="5" fill="#2b2724"/>' +
      '<path d="M48 18 q14 -14 28 0" fill="none" stroke="#8d7159" stroke-width="7" stroke-linecap="round"/>' +
      '<circle cx="90" cy="38" r="3" fill="#c97f5d"/>' +
      '</svg>';
  }

  /* aeropress on a server */
  function sceneBrewAero() {
    var p = 'sa';
    return open(p) + brewWallCommon(p, 'BREW BAR') +
      '<g transform="translate(128,44)">' +
      shadow(p, 52, 130, 54, 7, 0.18) +
      '<rect x="0" y="122" width="104" height="10" rx="5" fill="#4a443d"/>' +
      '<g><clipPath id="' + p + 'ac"><path d="M22 78 h60 l-5 42 h-50 z"/></clipPath>' +
      '<g clip-path="url(#' + p + 'ac)"><rect id="aero-fill" x="18" y="120" width="68" height="46" fill="#7a4e28"/></g>' +
      '<path d="M22 78 h60 l-5 42 h-50 z" fill="#ffffff" opacity="0.14"/>' +
      '<path d="M22 78 h60 l-5 42 h-50 z" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="2.5"/></g>' +
      // chamber
      '<rect x="30" y="34" width="44" height="46" rx="5" fill="#d8d3ca" opacity="0.55"/>' +
      '<rect x="30" y="34" width="44" height="46" rx="5" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="2.5"/>' +
      '<rect id="aero-brew" x="33" y="58" width="38" height="20" rx="3" fill="#8a5a30" opacity="0"/>' +
      // plunger
      '<g id="aero-plunger">' +
      '<rect x="36" y="2" width="32" height="34" rx="5" fill="url(#' + p + 'st)"/>' +
      '<rect x="26" y="0" width="52" height="9" rx="4.5" fill="#2b2724"/>' +
      '</g>' +
      '</g>' +
      counter(p) +
      '</svg>';
  }

  /* batch brewer with glass carafe */
  function sceneBrewBatch() {
    var p = 'sb';
    return open(p) + brewWallCommon(p, 'BREW BAR') +
      '<g transform="translate(124,56)">' +
      shadow(p, 56, 116, 58, 7, 0.18) +
      '<rect x="0" y="0" width="34" height="112" rx="9" fill="#efe9dd"/>' +
      '<rect x="0" y="0" width="34" height="8" rx="4" fill="#ffffff" opacity="0.6"/>' +
      '<rect x="0" y="0" width="112" height="22" rx="9" fill="#efe9dd"/>' +
      '<rect x="84" y="14" width="22" height="12" rx="4" fill="#ddd5c4"/>' +
      '<rect x="64" y="22" width="10" height="8" fill="#cbbfa9"/>' +
      '<g id="batch-drip" opacity="0"><rect x="66" y="30" width="5" height="22" rx="2.5" fill="#7a4e28"/></g>' +
      '<g><clipPath id="' + p + 'bc"><path d="M44 56 h62 l-6 50 h-50 z"/></clipPath>' +
      '<g clip-path="url(#' + p + 'bc)"><rect id="batch-fill" x="40" y="106" width="70" height="54" fill="#7a4e28"/></g>' +
      '<path d="M44 56 h62 l-6 50 h-50 z" fill="#ffffff" opacity="0.14"/>' +
      '<path d="M44 56 h62 l-6 50 h-50 z" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="2.5"/>' +
      '<rect x="64" y="46" width="22" height="10" rx="5" fill="#4a443d"/></g>' +
      '<rect x="34" y="106" width="78" height="8" rx="4" fill="#4a443d"/>' +
      '</g>' +
      counter(p) +
      '</svg>';
  }

  /* --- milk bar: wand fixed, pitcher dragged --- */

  function sceneMilk() {
    var p = 'sm';
    return open(p) + wall(p) + pendant(318, 24) +
      shelfThin(p, 20, 58, 104) + cupRow(30, 44, 2) +
      '<text x="22" y="80" font-size="9" letter-spacing="3" fill="#a59a88" font-family="system-ui,sans-serif">MILK BAR</text>' +
      // side of the espresso machine with steam wand
      '<g transform="translate(118,48)">' +
      shadow(p, 56, 132, 60, 7, 0.16) +
      '<rect x="0" y="0" width="112" height="48" rx="11" fill="url(#' + p + 'st)"/>' +
      '<rect x="0" y="0" width="112" height="7" rx="3.5" fill="#6a635b"/>' +
      '<circle cx="26" cy="24" r="8" fill="#efe9dd"/><circle cx="26" cy="24" r="3" fill="#c97f5d"/>' +
      '<rect x="64" y="18" width="30" height="11" rx="5" fill="#8d7159"/>' +
      '<rect x="36" y="44" width="8" height="46" rx="4" fill="#9b948b" transform="rotate(-12 40 44)"/>' +
      '<circle cx="31" cy="92" r="4" fill="#56504a"/>' +
      '<g id="milk-steam" opacity="0">' +
      '<path d="M33 96 q-6 12 2 22 q6 10 -2 18" stroke="#ffffff" stroke-opacity="0.8" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M44 98 q-4 10 2 16" stroke="#ffffff" stroke-opacity="0.55" stroke-width="4" fill="none" stroke-linecap="round"/></g>' +
      '</g>' +
      counter(p) +
      '</svg>';
  }

  /* steam pitcher (draggable DOM element) */
  function pitcherSvg() {
    return '<svg viewBox="0 0 90 78" class="drag-svg">' +
      '<ellipse cx="42" cy="72" rx="28" ry="5" fill="#3c352d" opacity="0.18"/>' +
      '<path d="M14 10 h52 l-7 58 h-38 z" fill="#d8d3ca"/>' +
      '<path d="M14 10 h52 l-1.5 9 h-49 z" fill="#eceae5"/>' +
      '<path d="M14 10 h22 l-4 58 h-11 z" fill="#c4beb4" opacity="0.6"/>' +
      '<path d="M66 14 l16 8 -17 7" fill="#d8d3ca"/>' +
      '<clipPath id="pitclip"><path d="M16 12 h48 l-6.4 54 h-35 z"/></clipPath>' +
      '<g clip-path="url(#pitclip)"><rect id="milk-fill" x="10" y="34" width="64" height="46" fill="#fcfbf8"/>' +
      '<rect id="milk-foam" x="10" y="28" width="64" height="8" fill="#ffffff"/></g>' +
      '</svg>';
  }

  /* --- the pass: tray, cup, pour & art --- */

  function scenePass() {
    var p = 'sp';
    return open(p) + wall(p) + pendant(52, 20) +
      framedArch(294, 52) +
      '<text x="22" y="56" font-size="9" letter-spacing="3" fill="#a59a88" font-family="system-ui,sans-serif">THE PASS</text>' +
      shelfThin(p, 20, 70, 96) + cupRow(30, 56, 3) +
      // walnut serving board
      shadow(p, 180, 178, 70, 7, 0.18) +
      '<rect x="112" y="160" width="136" height="12" rx="6" fill="url(#' + p + 'ct)"/>' +
      '<rect x="112" y="160" width="136" height="4" rx="2" fill="#ffffff" opacity="0.35"/>' +
      // cup host (st-build injects the ceramic cup here)
      '<g id="cup-host"></g>' +
      // pour stream host
      '<g id="pass-stream" opacity="0"><rect x="176" y="74" width="5" height="46" rx="2.5" fill="#fcfbf8"/></g>' +
      counter(p) +
      '</svg>';
  }

  /* ceramic cup with live liquid; placed in #cup-host (cup centred on x=180, base y=160) */
  function passCup(liquidColor, fillFrac, artTier, cremaLine) {
    var topY = 92, botY = 156, lipW = 64, baseW = 48;
    var h = botY - topY;
    var lvl = botY - 4 - Math.max(0, Math.min(1, fillFrac)) * (h - 14);
    var art = '';
    if (artTier === 'heart') {
      art = '<g transform="translate(180,' + (lvl + 9) + ') scale(0.9)"><path d="M0 8 C-9 1 -8 -6 -2 -6 C0 -6 0 -3 0 -3 C0 -3 0 -6 2 -6 C8 -6 9 1 0 8 z" fill="#fcfbf8"/></g>';
    } else if (artTier === 'tulip') {
      art = '<g transform="translate(180,' + (lvl + 8) + ')" fill="#fcfbf8">' +
        '<path d="M0 9 C-7 4 -6 -1 -1.5 -1 C0 -1 0 1 0 1 C0 1 0 -1 1.5 -1 C6 -1 7 4 0 9z"/>' +
        '<path d="M0 1 C-5 -3 -4 -7 -1 -7 C0 -7 0 -5 0 -5 C0 -5 0 -7 1 -7 C4 -7 5 -3 0 1z" transform="translate(0,-4)"/></g>';
    } else if (artTier === 'rosetta') {
      art = '<g transform="translate(180,' + (lvl + 6) + ')" stroke="#fcfbf8" stroke-width="2.6" fill="none" stroke-linecap="round">' +
        '<path d="M0 14 l0 -18"/><path d="M-8 10 q8 -3 16 0"/><path d="M-7 5 q7 -3 14 0"/><path d="M-5.5 0 q5.5 -2.5 11 0"/><path d="M-4 -4.5 q4 -2 8 0"/></g>';
    }
    return '<g>' +
      '<clipPath id="spcup"><path d="M' + (180 - lipW / 2 + 2) + ' ' + (topY + 2) + ' h' + (lipW - 4) + ' l-' + ((lipW - baseW) / 2 - 1) + ' ' + (h - 6) + ' a5 5 0 0 1 -5 4 h-' + (baseW - 14) + ' a5 5 0 0 1 -5 -4 z"/></clipPath>' +
      '<g clip-path="url(#spcup)">' +
      (fillFrac > 0 ? '<rect x="120" y="' + lvl + '" width="120" height="80" fill="' + liquidColor + '"/>' +
        (cremaLine ? '<rect x="120" y="' + lvl + '" width="120" height="4" fill="#caa468"/>' : '') : '') +
      '</g>' + art +
      '<path d="M' + (180 - lipW / 2) + ' ' + topY + ' h' + lipW + ' l-' + ((lipW - baseW) / 2) + ' ' + h + ' h-' + baseW + ' z" fill="#faf7f1" opacity="0.28"/>' +
      '<path d="M' + (180 - lipW / 2) + ' ' + topY + ' h' + lipW + ' l-' + ((lipW - baseW) / 2) + ' ' + h + ' a6 6 0 0 1 -6 4 h-' + (baseW - 12) + ' a6 6 0 0 1 -6 -4 z" fill="none" stroke="#efe9dd" stroke-width="3.5"/>' +
      '<path d="M' + (180 + lipW / 2 - 2) + ' ' + (topY + 12) + ' q16 4 12 18 q-3 12 -16 12" fill="none" stroke="#efe9dd" stroke-width="6" stroke-linecap="round"/>' +
      '</g>';
  }

  /* ============ customers (soft, no outlines) ============ */

  function hairSvg(c) {
    var h = c.hairColor;
    switch (c.hair) {
      case 'bun':
        return '<circle cx="50" cy="16" r="9" fill="' + h + '"/>' +
               '<path d="M28 38 a22 20 0 0 1 44 0 l-4 -2 a18 16 0 0 0 -36 0 z" fill="' + h + '"/>';
      case 'beanie':
        return '<path d="M27 36 a23 21 0 0 1 46 0 z" fill="' + h + '"/>' +
               '<rect x="26" y="32" width="48" height="8" rx="4" fill="' + h + '"/>' +
               '<rect x="26" y="32" width="48" height="3" rx="1.5" fill="#ffffff" opacity="0.25"/>';
      case 'pony':
        return '<path d="M28 40 a22 22 0 0 1 44 0 l-5 -3 a17 17 0 0 0 -34 0 z" fill="' + h + '"/>' +
               '<path d="M68 30 q12 4 8 26 q-3 14 -8 16 q4 -16 0 -26 q-2 -8 -6 -12 z" fill="' + h + '"/>';
      case 'short':
        return '<path d="M28 38 a22 20 0 0 1 44 0 l-6 -2 a16 14 0 0 0 -32 0 z" fill="' + h + '"/>';
      case 'pigtails':
        return '<path d="M30 38 a20 18 0 0 1 40 0 l-5 -2 a15 13 0 0 0 -30 0 z" fill="' + h + '"/>' +
               '<circle cx="24" cy="42" r="7" fill="' + h + '"/><circle cx="76" cy="42" r="7" fill="' + h + '"/>';
      case 'curly':
        return '<circle cx="36" cy="26" r="8" fill="' + h + '"/><circle cx="50" cy="20" r="9" fill="' + h + '"/>' +
               '<circle cx="64" cy="26" r="8" fill="' + h + '"/><circle cx="29" cy="36" r="6" fill="' + h + '"/>' +
               '<circle cx="71" cy="36" r="6" fill="' + h + '"/>';
      case 'flower':
        return '<path d="M28 40 a22 21 0 0 1 44 0 l-4 -2 a18 17 0 0 0 -36 0 z" fill="' + h + '"/>' +
               '<g transform="translate(68,24)"><circle r="3.2" cx="0" cy="-4" fill="#dca3ae"/>' +
               '<circle r="3.2" cx="4" cy="2" fill="#dca3ae"/><circle r="3.2" cx="-4" cy="2" fill="#dca3ae"/>' +
               '<circle r="2.2" fill="#d9b87c"/></g>';
      case 'bald':
        return '<ellipse cx="42" cy="22" rx="6" ry="3" fill="#ffffff" opacity="0.3"/>';
      default: return '';
    }
  }

  function accessorySvg(c) {
    switch (c.accessory) {
      case 'mustache':
        return '<path d="M40 53 q5 -4 10 0 q5 -4 10 0 q-5 6 -10 3 q-5 3 -10 -3z" fill="#6e5a48"/>';
      case 'scarf':
        return '<path d="M34 66 q16 9 32 0 l-2 8 q-14 7 -28 0 z" fill="#b87c66"/>' +
               '<rect x="56" y="70" width="9" height="16" rx="4" fill="#b87c66"/>';
      case 'freckles':
        return '<g fill="#c08a5c"><circle cx="36" cy="48" r="1.2"/><circle cx="40" cy="50" r="1.2"/>' +
               '<circle cx="64" cy="48" r="1.2"/><circle cx="60" cy="50" r="1.2"/></g>';
      case 'phone':
        return '<rect x="73" y="74" width="11" height="18" rx="2.5" fill="#56504a" transform="rotate(8 78 82)"/>' +
               '<rect x="75" y="77" width="7" height="11" rx="1" fill="#cfe3d6" transform="rotate(8 78 82)"/>';
      default: return '';
    }
  }

  function faceSvg(mood) {
    var eyes, brows = '', mouth, extra = '';
    if (mood === 'angry') {
      eyes = '<circle cx="42" cy="43" r="2.6" fill="' + INK + '"/><circle cx="58" cy="43" r="2.6" fill="' + INK + '"/>';
      brows = '<line x1="37" y1="36" x2="46" y2="40" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
              '<line x1="63" y1="36" x2="54" y2="40" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>';
      mouth = '<path d="M42 58 q8 -7 16 0" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
      extra = '<circle cx="34" cy="50" r="4" fill="#cf8676" opacity="0.5"/><circle cx="66" cy="50" r="4" fill="#cf8676" opacity="0.5"/>';
    } else if (mood === 'annoyed') {
      eyes = '<circle cx="42" cy="43" r="2.6" fill="' + INK + '"/><circle cx="58" cy="43" r="2.6" fill="' + INK + '"/>';
      brows = '<line x1="38" y1="37" x2="46" y2="38.5" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
              '<line x1="62" y1="37" x2="54" y2="38.5" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>';
      mouth = '<path d="M43 57 q7 -3.5 14 0" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    } else if (mood === 'neutral') {
      eyes = '<circle cx="42" cy="43" r="2.8" fill="' + INK + '"/><circle cx="58" cy="43" r="2.8" fill="' + INK + '"/>';
      mouth = '<line x1="44" y1="57" x2="56" y2="57" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>';
    } else {
      eyes = '<circle cx="42" cy="43" r="2.8" fill="' + INK + '"/><circle cx="58" cy="43" r="2.8" fill="' + INK + '"/>';
      mouth = '<path d="M42 55 q8 8 16 0" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
      extra = '<circle cx="34" cy="50" r="4" fill="#e2ab8f" opacity="0.45"/><circle cx="66" cy="50" r="4" fill="#e2ab8f" opacity="0.45"/>';
    }
    return brows + eyes + mouth + extra;
  }

  function customer(charId, mood) {
    var c = CG.data.CHARACTERS[charId];
    return '<svg viewBox="0 0 100 110" class="cust-svg" aria-label="' + c.name + '">' +
      '<ellipse cx="50" cy="107" rx="26" ry="3.5" fill="#3c352d" opacity="0.14"/>' +
      '<path d="M26 110 v-22 a24 22 0 0 1 48 0 v22 z" fill="' + c.top + '"/>' +
      '<path d="M26 110 v-22 a24 22 0 0 1 48 0 v6 l-48 0 z" fill="#ffffff" opacity="0.12"/>' +
      '<circle cx="50" cy="44" r="22" fill="' + c.skin + '"/>' +
      '<path d="M30 36 a22 22 0 0 1 40 -4" fill="#ffffff" opacity="0.1"/>' +
      hairSvg(c) + faceSvg(mood || 'happy') + accessorySvg(c) +
      '</svg>';
  }

  function patienceRing(pct, color) {
    var r = 17, circ = 2 * Math.PI * r;
    var off = circ * (1 - pct / 100);
    return '<svg viewBox="0 0 40 40" class="ring-svg">' +
      '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="#2e2a2618" stroke-width="4"/>' +
      '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="4" ' +
      'stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" ' +
      'transform="rotate(-90 20 20)"/></svg>';
  }

  /* ============ drink card art & tags ============ */

  function drink(ticket) {
    var d = CG.data;
    var r = d.RECIPES[ticket.recipe];
    var milkColor = r.milk ? '#e9dbc6' : null;
    var liquid = r.milk ? '#c89a6c' : '#7a4e28';
    var art = r.art ? '<g transform="translate(50,33) scale(0.85)"><path d="M0 8 C-9 1 -8 -6 -2 -6 C0 -6 0 -3 0 -3 C0 -3 0 -6 2 -6 C8 -6 9 1 0 8 z" fill="#fcfbf8"/></g>' : '';
    return '<svg viewBox="0 0 100 110" class="drink-svg">' +
      '<ellipse cx="50" cy="100" rx="30" ry="4" fill="#3c352d" opacity="0.16"/>' +
      '<path d="M26 28 h48 l-6 62 a6 6 0 0 1 -6 5 h-24 a6 6 0 0 1 -6 -5 z" fill="#faf7f1"/>' +
      '<path d="M29 32 h42 l-5 54 a4 4 0 0 1 -4 3 h-22 a4 4 0 0 1 -4 -3 z" fill="' + liquid + '"/>' +
      (milkColor ? '<path d="M29 32 h42 l-1.6 17 h-39 z" fill="' + milkColor + '"/>' : '<path d="M29 32 h42 l-0.5 5 h-41 z" fill="#caa468"/>') +
      art +
      '<path d="M74 38 q15 3 12 17 q-3 13 -16 12" fill="none" stroke="#efe9dd" stroke-width="5.5" stroke-linecap="round"/>' +
      '<path d="M26 28 h48 l-1 9 h-46 z" fill="#ffffff" opacity="0.35"/>' +
      '</svg>';
  }

  function tagPills(o) {
    var d = CG.data;
    var r = d.RECIPES[o.recipe];
    var pills = [];
    var pill = function (label, tone) {
      pills.push('<span class="tagpill ' + (tone || '') + '">' + label + '</span>');
    };
    pill(r.name, 'clay');
    if (o.origin) pill(d.ORIGINS[o.origin].short, 'walnut');
    if (o.origin) pill(d.ORIGINS[o.origin].notes, 'linen');
    if (r.milk) pill(r.art ? 'microfoam + art' : 'steamed milk', 'linen');
    return '<span class="tagpills">' + pills.join('') + '</span>';
  }

  /* ============ icons (thin line, minimal) ============ */

  function icon(name) {
    var s = 'fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';
    var inner = '';
    switch (name) {
      case 'order':
        inner = '<path d="M7 7 h26 v16 a4 4 0 0 1 -4 4 h-12 l-7 6 v-6 h-3 z" ' + s + '/>' +
                '<line x1="13" y1="14" x2="27" y2="14" ' + s + '/><line x1="13" y1="19" x2="22" y2="19" ' + s + '/>';
        break;
      case 'roast':
        inner = '<ellipse cx="20" cy="20" rx="11" ry="14" ' + s + '/>' +
                '<path d="M20 7 q-5 13 0 26" ' + s + '/>';
        break;
      case 'brew':
        inner = '<path d="M9 13 h19 l-2.5 16 a3 3 0 0 1 -3 2.5 h-8 a3 3 0 0 1 -3 -2.5 z" ' + s + '/>' +
                '<path d="M28 16 q6 0 5 6 t-7 5" ' + s + '/>' +
                '<path d="M14 9 q1 -2.5 0 -5 M22 9 q1 -2.5 0 -5" ' + s + '/>';
        break;
      case 'kettle':
        inner = '<path d="M13 15 q-2 16 7 17 q9 -1 7 -17 z" ' + s + '/>' +
                '<path d="M13 16 q-7 1 -9 7" ' + s + '/>' +
                '<path d="M15 12 q5 -5 10 0" ' + s + '/>';
        break;
      case 'milk':
        inner = '<path d="M12 12 h14 l-2.5 20 h-9 z" ' + s + '/>' +
                '<path d="M26 14 l7 4 -8 3" ' + s + '/>';
        break;
      case 'build':
        inner = '<path d="M11 14 h18 l-2.5 16 a3 3 0 0 1 -3 2.5 h-7 a3 3 0 0 1 -3 -2.5 z" ' + s + '/>' +
                '<path d="M16 9 q1 -2.5 0 -5 M24 9 q1 -2.5 0 -5" ' + s + '/>' +
                '<line x1="8" y1="36" x2="32" y2="36" ' + s + '/>';
        break;
      case 'star':
        inner = '<path d="M20 4 l4.6 10 11 1.3 -8.2 7.4 2.4 10.9 -9.8 -5.8 -9.8 5.8 2.4 -10.9 -8.2 -7.4 11 -1.3 z" fill="currentColor"/>';
        break;
      case 'pause':
        inner = '<line x1="15" y1="10" x2="15" y2="30" ' + s + '/><line x1="25" y1="10" x2="25" y2="30" ' + s + '/>';
        break;
      case 'sound':
        inner = '<path d="M9 16 h5 l7 -6 v20 l-7 -6 h-5 z" fill="currentColor"/>' +
                '<path d="M26 15 q4 5 0 10 M30 11 q7 9 0 18" ' + s + '/>';
        break;
      case 'mute':
        inner = '<path d="M9 16 h5 l7 -6 v20 l-7 -6 h-5 z" fill="currentColor"/>' +
                '<line x1="26" y1="15" x2="34" y2="25" ' + s + '/><line x1="34" y1="15" x2="26" y2="25" ' + s + '/>';
        break;
    }
    return '<svg viewBox="0 0 40 40" class="icon-svg">' + inner + '</svg>';
  }

  function stars(n) {
    var out = '', i;
    for (i = 1; i <= 5; i++) {
      out += '<span class="star ' + (i <= n ? 'on' : 'off') + '">' + icon('star') + '</span>';
    }
    return '<span class="stars">' + out + '</span>';
  }

  /* title mark: ceramic cup, soft steam */
  function logo() {
    return '<svg viewBox="0 0 220 150" class="logo-svg">' +
      '<defs><filter id="lgb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter></defs>' +
      '<ellipse cx="110" cy="134" rx="58" ry="7" fill="#3c352d" opacity="0.14" filter="url(#lgb)"/>' +
      '<path d="M64 52 h92 l-10 70 a10 10 0 0 1 -10 8 h-52 a10 10 0 0 1 -10 -8 z" fill="#faf7f1"/>' +
      '<path d="M64 52 h92 l-2 14 h-88 z" fill="#ffffff" opacity="0.55"/>' +
      '<path d="M70 58 h80 l-4 26 h-72 z" fill="#c89a6c"/>' +
      '<g transform="translate(110,74) scale(1.15)"><path d="M0 8 C-9 1 -8 -6 -2 -6 C0 -6 0 -3 0 -3 C0 -3 0 -6 2 -6 C8 -6 9 1 0 8 z" fill="#fcfbf8"/></g>' +
      '<path d="M156 62 q22 4 18 24 q-4 18 -24 16" fill="none" stroke="#e3dccd" stroke-width="8" stroke-linecap="round"/>' +
      '<g stroke="#d8d0c0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9">' +
      '<path d="M92 40 q5 -9 0 -18"/><path d="M112 42 q5 -10 0 -20"/><path d="M132 40 q5 -9 0 -18"/></g>' +
      '</svg>';
  }

  return {
    customer: customer, patienceRing: patienceRing,
    sceneOrderBack: sceneOrderBack, sceneOrderFront: sceneOrderFront,
    sceneRoast: sceneRoast, roastBags: roastBags, beanGroup: beanGroup, ROAST_BAG_X: ROAST_BAG_X,
    sceneBrewEspresso: sceneBrewEspresso, sceneBrewV60: sceneBrewV60,
    sceneBrewAero: sceneBrewAero, sceneBrewBatch: sceneBrewBatch,
    portafilter: portafilter, kettle: kettle,
    sceneMilk: sceneMilk, pitcherSvg: pitcherSvg,
    scenePass: scenePass, passCup: passCup,
    drink: drink, tagPills: tagPills,
    icon: icon, stars: stars, logo: logo
  };
})();
