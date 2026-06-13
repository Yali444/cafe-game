/* FIKA — reference-style illustration kit: warm pastels, thin outlines, dense scenes */
CG.svg = (function () {
  'use strict';

  var O = '#8a705a';        // soft warm outline
  var OW = 1.8;             // outline width
  var INK = '#4a3f33';

  function ol(extra) { return 'stroke="' + O + '" stroke-width="' + (extra || OW) + '" stroke-linejoin="round"'; }

  /* ============ scene plumbing (portrait 360x540, counter slab y420-440, front to 540) ============ */

  function defs(p) {
    return '<defs>' +
      '<linearGradient id="' + p + 'w" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#f9eccb"/><stop offset="1" stop-color="#f3e0b4"/></linearGradient>' +
      '<linearGradient id="' + p + 'ct" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#d2ad74"/><stop offset="1" stop-color="#c19c64"/></linearGradient>' +
      '<linearGradient id="' + p + 'wd" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#b08a5e"/><stop offset="1" stop-color="#9c7950"/></linearGradient>' +
      '<linearGradient id="' + p + 'sg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#a8bd90"/><stop offset="1" stop-color="#8da377"/></linearGradient>' +
      '<linearGradient id="' + p + 'st" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#5b554d"/><stop offset="1" stop-color="#46413a"/></linearGradient>' +
      '<filter id="' + p + 'b" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4"/></filter>' +
      '</defs>';
  }

  function open(p, cls) {
    return '<svg viewBox="0 0 360 540" class="scene-svg ' + (cls || '') + '" preserveAspectRatio="xMidYMax slice">' + defs(p);
  }

  function wall(p) {
    var stripes = '', x;
    for (x = 8; x < 380; x += 34) {
      stripes += '<rect x="' + x + '" y="-5" width="15" height="550" fill="#fbf2da" opacity="0.6"/>';
    }
    return '<rect x="-5" y="-5" width="370" height="550" fill="url(#' + p + 'w)"/>' + stripes +
      '<rect x="-5" y="252" width="370" height="7" fill="#e3cf9f"/>' +
      '<rect x="-5" y="252" width="370" height="2.5" fill="#ffffff" opacity="0.5"/>';
  }

  /* a tall window with soft sky, curtain ties */
  function windowFrame(p, x, y, w, h) {
    return shadow(p, x + w / 2, y + h + 6, w / 2, 5, 0.1) +
      '<rect x="' + (x - 6) + '" y="' + (y - 6) + '" width="' + (w + 12) + '" height="' + (h + 12) + '" rx="10" fill="#fdf8ec" ' + ol(2.4) + '/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="#cfe4ea"/>' +
      '<circle cx="' + (x + w * 0.7) + '" cy="' + (y + h * 0.22) + '" r="' + (w * 0.13) + '" fill="#fff6dd"/>' +
      '<path d="M' + x + ' ' + (y + h * 0.62) + ' q' + (w * 0.25) + ' -14 ' + (w * 0.5) + ' 0 q' + (w * 0.25) + ' -12 ' + (w * 0.5) + ' 2 l0 ' + (h * 0.38) + ' h-' + w + ' z" fill="#a7c48b" opacity="0.9"/>' +
      '<path d="M' + x + ' ' + (y + h * 0.74) + ' q' + (w * 0.3) + ' -10 ' + (w * 0.6) + ' 0 q' + (w * 0.2) + ' -8 ' + (w * 0.4) + ' 2 l0 ' + (h * 0.26) + ' h-' + w + ' z" fill="#90ad75" opacity="0.9"/>' +
      '<line x1="' + (x + w / 2) + '" y1="' + y + '" x2="' + (x + w / 2) + '" y2="' + (y + h) + '" stroke="' + O + '" stroke-width="2.4"/>' +
      '<line x1="' + x + '" y1="' + (y + h / 2) + '" x2="' + (x + w) + '" y2="' + (y + h / 2) + '" stroke="' + O + '" stroke-width="2.4"/>';
  }

  /* white tiled backsplash band */
  function tiles(x, y, w, h) {
    var out = '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="#fdfaf2" ' + ol(2) + '/>';
    var i;
    for (i = y + 16; i < y + h; i += 16) {
      out += '<line x1="' + (x + 2) + '" y1="' + i + '" x2="' + (x + w - 2) + '" y2="' + i + '" stroke="#ece1cc" stroke-width="1.6"/>';
    }
    var row = 0;
    for (i = y; i < y + h; i += 16) {
      var off = (row % 2) * 16;
      for (var j = x + off; j < x + w; j += 32) {
        out += '<line x1="' + j + '" y1="' + (i + 0.5) + '" x2="' + j + '" y2="' + Math.min(i + 16, y + h) + '" stroke="#ece1cc" stroke-width="1.6"/>';
      }
      row++;
    }
    return out + '</g>';
  }

  function counter(p) {
    var planks = '', x;
    for (x = 44; x < 360; x += 72) {
      planks += '<line x1="' + x + '" y1="448" x2="' + x + '" y2="540" stroke="#8f6d47" stroke-width="2.2" opacity="0.5"/>';
    }
    return '<rect x="-6" y="440" width="372" height="106" fill="url(#' + p + 'wd)"/>' + planks +
      '<rect x="-6" y="488" width="372" height="4" fill="#8f6d47" opacity="0.4"/>' +
      '<rect x="-6" y="420" width="372" height="22" rx="7" fill="url(#' + p + 'ct)" ' + ol(2.4) + '/>' +
      '<rect x="-2" y="423" width="364" height="5" rx="2.5" fill="#ffffff" opacity="0.45"/>';
  }

  function shadow(p, x, y, rx, ry, op) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + (ry || 4.5) + '" fill="#6b543c" opacity="' + (op || 0.18) + '" filter="url(#' + p + 'b)"/>';
  }

  /* ============ prop library ============ */

  function pendant(x, len) {
    return '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + len + '" stroke="' + O + '" stroke-width="2.2"/>' +
      '<path d="M' + (x - 16) + ' ' + (len + 15) + ' a16 16 0 0 1 32 0 z" fill="#5b554d" ' + ol(2) + '/>' +
      '<path d="M' + (x - 11) + ' ' + (len + 13) + ' a11 11 0 0 1 22 0 z" fill="#6d665d"/>' +
      '<circle cx="' + x + '" cy="' + (len + 12.5) + '" r="3.6" fill="#ffd98c"/>' +
      '<circle cx="' + x + '" cy="' + (len + 13) + '" r="9" fill="#ffd98c" opacity="0.3"/>';
  }

  function chalkMenu(p, x, y, w, h) {
    var lines = '', i;
    for (i = 0; i < 3; i++) {
      lines += '<rect x="' + (x + 12) + '" y="' + (y + 22 + i * 12) + '" width="' + (w - 38 - (i % 2) * 10) + '" height="3" rx="1.5" fill="#e9e2d3" opacity="0.75"/>' +
        '<rect x="' + (x + w - 20) + '" y="' + (y + 22 + i * 12) + '" width="9" height="3" rx="1.5" fill="#f0c9a8" opacity="0.9"/>';
    }
    return shadow(p, x + w / 2, y + h + 5, w / 2, 4, 0.12) +
      '<rect x="' + (x - 5) + '" y="' + (y - 5) + '" width="' + (w + 10) + '" height="' + (h + 10) + '" rx="7" fill="#c9a36a" ' + ol(2.2) + '/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="#4b5a50"/>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + 14) + '" text-anchor="middle" font-size="9" letter-spacing="1.5" fill="#f3ead6" font-family="Georgia,serif" font-style="italic">menu</text>' +
      lines +
      '<path d="M' + (x + 13) + ' ' + (y + h - 8) + ' h7 l-1 5 h-5 z" fill="#f3ead6" opacity="0.85"/>' +
      '<path d="M' + (x + 21) + ' ' + (y + h - 6) + ' q3 1 5 -2" stroke="#f3ead6" stroke-width="1.4" fill="none" opacity="0.85"/>';
  }

  function shelfPlank(p, x, y, w) {
    return shadow(p, x + w / 2, y + 11, w / 2, 3, 0.12) +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="7" rx="3.5" fill="#c9a36a" ' + ol(2) + '/>' +
      '<rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="' + (w - 2) + '" height="2.4" rx="1.2" fill="#ffffff" opacity="0.4"/>' +
      '<path d="M' + (x + 9) + ' ' + (y + 7) + ' l6 10 h-6 z" fill="#a9845a" ' + ol(1.5) + '/>' +
      '<path d="M' + (x + w - 15) + ' ' + (y + 7) + ' l6 10 h-6 z" fill="#a9845a" ' + ol(1.5) + '/>';
  }

  function cupStack(x, y, n, color) {
    var out = '', i;
    for (i = 0; i < n; i++) {
      var yy = y - i * 9;
      out += '<path d="M' + x + ' ' + yy + ' h22 l-3 9 h-16 z" fill="' + (color || '#fdf8ec') + '" ' + ol(1.6) + '/>' +
        '<path d="M' + x + ' ' + yy + ' h22 l-0.6 2.4 h-20.8 z" fill="#ffffff" opacity="0.55"/>';
    }
    return out;
  }

  function mug(x, y, color) {
    return '<path d="M' + x + ' ' + y + ' h15 v13 a3.5 3.5 0 0 1 -3.5 3.5 h-8 a3.5 3.5 0 0 1 -3.5 -3.5 z" fill="' + (color || '#f2cfc4') + '" ' + ol(1.6) + '/>' +
      '<path d="M' + (x + 15) + ' ' + (y + 3) + ' q6 0 5 5 t-6 4.5" fill="none" ' + ol(1.8) + '/>' +
      '<rect x="' + (x + 1.5) + '" y="' + (y + 1.5) + '" width="12" height="3" rx="1.5" fill="#ffffff" opacity="0.45"/>';
  }

  function jar(x, y, h, color, frac, label) {
    var inner = Math.max(0, Math.min(1, frac == null ? 0.7 : frac)) * (h - 7);
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<rect x="0" y="0" width="20" height="' + h + '" rx="5" fill="#ffffff" fill-opacity="0.75" ' + ol(1.7) + '/>' +
      '<rect x="2.5" y="' + (h - 2.5 - inner) + '" width="15" height="' + inner + '" rx="3.5" fill="' + (color || '#b98e5c') + '"/>' +
      '<rect x="2" y="-5" width="16" height="6.5" rx="3" fill="#c9a36a" ' + ol(1.6) + '/>' +
      (label ? '<rect x="3" y="' + (h * 0.34) + '" width="14" height="8" rx="2" fill="#fdf8ec" ' + ol(1.2) + '/>' : '') +
      '</g>';
  }

  function bottle(x, y, color) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<path d="M3 9 q-3 3 -3 8 v12 a3 3 0 0 0 3 3 h8 a3 3 0 0 0 3 -3 v-12 q0 -5 -3 -8 z" fill="' + (color || '#aed0c2') + '" ' + ol(1.6) + '/>' +
      '<rect x="4" y="0" width="6" height="9" rx="2" fill="' + (color || '#aed0c2') + '" ' + ol(1.6) + '/>' +
      '<rect x="2" y="16" width="10" height="8" rx="2" fill="#fdf8ec" opacity="0.85"/>' +
      '</g>';
  }

  function plantPot(p, x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' +
      shadow(p, 0, 3, 14, 3.5, 0.14) +
      '<path d="M0 -5 q-4 -16 -14 -22 M0 -5 q0 -20 4 -28 M0 -5 q6 -15 15 -19" stroke="#84a06b" stroke-width="3.6" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="-14" cy="-24" rx="5.5" ry="8" fill="#9cba80" ' + ol(1.5) + ' transform="rotate(-32 -14 -24)"/>' +
      '<ellipse cx="4" cy="-30" rx="5.5" ry="9" fill="#a7c48b" ' + ol(1.5) + '/>' +
      '<ellipse cx="15" cy="-21" rx="5.5" ry="8" fill="#90ad75" ' + ol(1.5) + ' transform="rotate(30 15 -21)"/>' +
      '<path d="M-11 -5 h22 l-3.5 14 h-15 z" fill="#e3a98a" ' + ol(1.7) + '/>' +
      '<path d="M-11 -5 h22 l-0.8 3.2 h-20.4 z" fill="#ffffff" opacity="0.4"/>' +
      '</g>';
  }

  function plantHang(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<line x1="-9" y1="-100" x2="-2" y2="0" stroke="' + O + '" stroke-width="1.6"/>' +
      '<line x1="9" y1="-100" x2="2" y2="0" stroke="' + O + '" stroke-width="1.6"/>' +
      '<path d="M-12 0 h24 l-4 12 h-16 z" fill="#f2cfc4" ' + ol(1.7) + '/>' +
      '<path d="M-9 2 q-7 13 -4 24 M0 3 q0 15 -2 22 M9 2 q6 12 3 22" stroke="#84a06b" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="-12" cy="22" r="3.4" fill="#9cba80"/><circle cx="-1" cy="27" r="3.4" fill="#a7c48b"/><circle cx="11" cy="21" r="3.4" fill="#90ad75"/>' +
      '</g>';
  }

  function fridge(p, x, y, h) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      shadow(p, 31, h + 3, 32, 5, 0.16) +
      '<rect x="0" y="0" width="62" height="' + h + '" rx="10" fill="#fdf8ec" ' + ol(2.2) + '/>' +
      '<rect x="2" y="2" width="58" height="8" rx="4" fill="#ffffff" opacity="0.7"/>' +
      '<line x1="3" y1="' + (h * 0.42) + '" x2="59" y2="' + (h * 0.42) + '" stroke="' + O + '" stroke-width="1.8"/>' +
      '<rect x="48" y="10" width="5.5" height="' + (h * 0.42 - 18) + '" rx="2.75" fill="#d8c8a8" ' + ol(1.3) + '/>' +
      '<rect x="48" y="' + (h * 0.42 + 8) + '" width="5.5" height="' + (h * 0.34) + '" rx="2.75" fill="#d8c8a8" ' + ol(1.3) + '/>' +
      '<rect x="9" y="12" width="22" height="22" rx="4" fill="#f2cfc4" ' + ol(1.5) + '/>' +
      '<path d="M15 23 C12 19 13 16 16.5 16 C18 16 19 18 20 18 C21 18 22 16 23.5 16 C27 16 28 19 25 23 q-5 5 -5 5 q-5 -5 -5 -5z" fill="#d9876a"/>' +
      '<rect x="9" y="' + (h * 0.42 + 12) + '" width="16" height="12" rx="3" fill="#cfe0d5" ' + ol(1.3) + '/>' +
      '</g>';
  }

  function framedPrint(p, x, y) {
    return shadow(p, x + 19, y + 50, 19, 3, 0.1) +
      '<rect x="' + x + '" y="' + y + '" width="38" height="46" rx="3" fill="#fdf8ec" ' + ol(2) + '/>' +
      '<path d="M' + (x + 9) + ' ' + (y + 36) + ' v-13 a10 10 0 0 1 20 0 v13 z" fill="#d9876a" opacity="0.9"/>' +
      '<circle cx="' + (x + 19) + '" cy="' + (y + 13) + '" r="4" fill="#e9c178"/>';
  }

  function register(p, x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      shadow(p, 27, 36, 28, 4.5, 0.18) +
      '<rect x="0" y="6" width="54" height="30" rx="7" fill="url(#' + p + 'sg)" ' + ol(2) + '/>' +
      '<rect x="0" y="6" width="54" height="6" rx="3" fill="#ffffff" opacity="0.35"/>' +
      '<rect x="7" y="12" width="26" height="12" rx="3" fill="#dff0e4" ' + ol(1.5) + '/>' +
      '<circle cx="44" cy="18" r="4.5" fill="#f2cfc4" ' + ol(1.4) + '/>' +
      '<rect x="8" y="-4" width="38" height="11" rx="4" fill="#5b554d" ' + ol(1.6) + ' transform="rotate(-6 27 1)"/>' +
      '</g>';
  }

  function pastryDome(p, x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      shadow(p, 22, 30, 24, 4, 0.16) +
      '<rect x="0" y="24" width="44" height="6" rx="3" fill="#c9a36a" ' + ol(1.8) + '/>' +
      '<path d="M4 24 a18 18 0 0 1 36 0 z" fill="#ffffff" fill-opacity="0.45" ' + ol(1.7) + '/>' +
      '<circle cx="22" cy="5" r="2.6" fill="#c9a36a" ' + ol(1.4) + '/>' +
      '<path d="M12 23 q2 -8 9 -7 q-1 -4 4 -4 q5 0 4 4 q7 -1 9 7 z" fill="#e0a96f" ' + ol(1.4) + '/>' +
      '</g>';
  }

  function vasePlant(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<path d="M4 12 q-4 8 0 16 q7 3 14 0 q4 -8 0 -16 q-7 -3 -14 0z" fill="#cfe0d5" ' + ol(1.7) + '/>' +
      '<path d="M9 12 q-3 -9 -8 -12 M13 12 q1 -10 5 -13" stroke="#84a06b" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="1" cy="-1" r="3" fill="#f2cfc4" ' + ol(1.2) + '/><circle cx="18" cy="-2" r="3" fill="#e9c178" ' + ol(1.2) + '/>' +
      '</g>';
  }

  function tipJar(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<rect x="0" y="0" width="22" height="26" rx="5" fill="#ffffff" fill-opacity="0.7" ' + ol(1.7) + '/>' +
      '<rect x="3" y="14" width="16" height="9" rx="2" fill="#e9c178"/>' +
      '<rect x="2" y="-4" width="18" height="6" rx="3" fill="#c9a36a" ' + ol(1.5) + '/>' +
      '<text x="11" y="11" text-anchor="middle" font-size="6.5" font-weight="700" fill="' + INK + '" font-family="system-ui,sans-serif">tip</text>' +
      '</g>';
  }

  function menuCard(x, y) {
    return '<g transform="translate(' + x + ',' + y + ') rotate(-5)">' +
      '<rect x="0" y="0" width="24" height="20" rx="3" fill="#fdf8ec" ' + ol(1.6) + '/>' +
      '<line x1="4" y1="6" x2="20" y2="6" stroke="#d8c8a8" stroke-width="1.8"/>' +
      '<line x1="4" y1="11" x2="20" y2="11" stroke="#d8c8a8" stroke-width="1.8"/>' +
      '<line x1="4" y1="16" x2="14" y2="16" stroke="#f0c9a8" stroke-width="1.8"/>' +
      '</g>';
  }

  function brewScale(p, x, y, w) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      shadow(p, w / 2, 12, w / 2 + 2, 3.5, 0.16) +
      '<rect x="0" y="0" width="' + w + '" height="10" rx="5" fill="#4f4a43" ' + ol(1.7) + '/>' +
      '<rect x="' + (w - 18) + '" y="2.5" width="13" height="5" rx="2.5" fill="#cfe0d5"/>' +
      '</g>';
  }

  function timer(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<rect x="0" y="0" width="18" height="20" rx="4" fill="#f2cfc4" ' + ol(1.6) + '/>' +
      '<rect x="3.5" y="4" width="11" height="7" rx="2" fill="#fdf8ec"/>' +
      '<circle cx="9" cy="16" r="2.2" fill="' + O + '"/>' +
      '</g>';
  }

  function tamper(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<rect x="0" y="10" width="16" height="6" rx="3" fill="#5b554d" ' + ol(1.5) + '/>' +
      '<rect x="4" y="0" width="8" height="11" rx="3.5" fill="#c9a36a" ' + ol(1.5) + '/>' +
      '</g>';
  }

  function cloth(x, y, color) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<rect x="0" y="0" width="26" height="9" rx="3" fill="' + (color || '#aed0c2') + '" ' + ol(1.5) + '/>' +
      '<rect x="0" y="3" width="26" height="3" fill="#ffffff" opacity="0.4"/>' +
      '</g>';
  }

  function filterBox(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<rect x="0" y="0" width="26" height="20" rx="3.5" fill="#e9c178" ' + ol(1.6) + '/>' +
      '<path d="M5 -4 h16 l-3 5 h-10 z" fill="#fdf8ec" ' + ol(1.3) + '/>' +
      '<circle cx="13" cy="10" r="4.5" fill="#fdf8ec"/>' +
      '</g>';
  }

  function saucerStack(x, y, n) {
    var out = '', i;
    for (i = 0; i < n; i++) {
      out += '<ellipse cx="' + x + '" cy="' + (y - i * 4.5) + '" rx="16" ry="4" fill="#fdf8ec" ' + ol(1.5) + '/>';
    }
    return out;
  }

  function bell(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<path d="M-9 10 a9 9 0 0 1 18 0 z" fill="#e9c178" ' + ol(1.6) + '/>' +
      '<circle cx="0" cy="-1" r="2.2" fill="#c9a36a" ' + ol(1.2) + '/>' +
      '<rect x="-12" y="10" width="24" height="4" rx="2" fill="#c9a36a" ' + ol(1.4) + '/>' +
      '</g>';
  }

  function sack(p, x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      shadow(p, 16, 42, 18, 4, 0.16) +
      '<path d="M4 8 q-7 17 -3 30 q15 6 30 0 q4 -13 -3 -30 z" fill="#e7d3ac" ' + ol(1.9) + '/>' +
      '<path d="M4 8 q14 6 24 0 l3 -7 q-15 -5 -30 0 z" fill="#d8bf92" ' + ol(1.9) + '/>' +
      '<ellipse cx="14" cy="24" rx="4" ry="2.8" fill="#7e5634" transform="rotate(-20 14 24)"/>' +
      '<ellipse cx="22" cy="29" rx="4" ry="2.8" fill="#7e5634" transform="rotate(25 22 29)"/>' +
      '</g>';
  }

  function coolingTray(p, x, y) {
    var beans = '', i;
    for (i = 0; i < 8; i++) {
      beans += '<ellipse cx="' + (x + 7 + (i % 4) * 8) + '" cy="' + (y + 4 + Math.floor(i / 4) * 5) + '" rx="3" ry="2.1" fill="#8a5e38" transform="rotate(' + (i * 40) + ' ' + (x + 7 + (i % 4) * 8) + ' ' + (y + 4 + Math.floor(i / 4) * 5) + ')"/>';
    }
    return shadow(p, x + 19, y + 14, 20, 3.5, 0.14) +
      '<rect x="' + x + '" y="' + y + '" width="38" height="12" rx="4" fill="#d8c8a8" ' + ol(1.7) + '/>' + beans;
  }

  /* ============ scenes (portrait 360x540) ============ */

  /* --- order: front of house --- */

  function sceneOrderBack() {
    var p = 'so';
    return open(p, 'scene-back') + wall(p) +
      pendant(56, 22) + pendant(304, 44) +
      windowFrame(p, 24, 96, 108, 130) +
      chalkMenu(p, 170, 100, 128, 94) +
      shelfPlank(p, 158, 234, 120) + cupStack(166, 224, 2, '#f2cfc4') + jar(204, 208, 24, '#b98e5c', 0.7) + bottle(234, 204) + mug(262, 216, '#aed0c2') +
      shelfPlank(p, 18, 262, 110) + mug(26, 244, '#f2cfc4') + cupStack(54, 252, 2) + jar(90, 236, 24, '#a87f4f', 0.55) +
      plantHang(332, 104) +
      tiles(0, 300, 360, 122) +
      '</svg>';
  }

  function sceneOrderFront() {
    var p = 'sf';
    return open(p, 'scene-front-svg') + counter(p) +
      register(p, 16, 384) +
      pastryDome(p, 86, 390) +
      menuCard(146, 400) +
      vasePlant(286, 388) +
      tipJar(322, 394) +
      '</svg>';
  }

  /* --- roastery --- */

  var ROAST_BAG_X = [196, 248, 300];

  function sceneRoast() {
    var p = 'sr';
    return open(p) + wall(p) +
      pendant(178, 18) +
      windowFrame(p, 232, 92, 100, 122) +
      '<text x="18" y="86" font-size="10" letter-spacing="3" fill="#b3996e" font-family="system-ui,sans-serif">ROASTERY</text>' +
      shelfPlank(p, 14, 130, 152) +
      jar(22, 104, 24, '#a87f4f', 0.8) + jar(48, 104, 24, '#7e5634', 0.55) + jar(74, 104, 24, '#94a06b', 0.7) +
      cupStack(106, 121, 2) + sack(p, 132, 178) +
      tiles(0, 300, 360, 122) +
      '<g transform="translate(14,270) scale(1.5)">' +
      shadow(p, 62, 100, 66, 6, 0.18) +
      '<rect x="0" y="86" width="124" height="14" rx="6" fill="url(#' + p + 'ct)" ' + ol(2) + '/>' +
      '<rect x="6" y="0" width="112" height="88" rx="16" fill="#f3ead6" ' + ol(2.2) + '/>' +
      '<rect x="8" y="2" width="108" height="9" rx="4.5" fill="#ffffff" opacity="0.6"/>' +
      '<rect x="6" y="74" width="112" height="14" rx="7" fill="#ddd0b2"/>' +
      '<circle cx="62" cy="44" r="33" fill="url(#' + p + 'st)" ' + ol(2.2) + '/>' +
      '<circle cx="62" cy="44" r="26" fill="#241f1a"/>' +
      '<g id="roast-beans"></g>' +
      '<circle cx="54" cy="36" r="10" fill="#ffffff" opacity="0.07"/>' +
      '<circle cx="104" cy="16" r="6.5" fill="#d9876a" ' + ol(1.6) + '/>' +
      '<rect x="12" y="11" width="24" height="9" rx="4.5" fill="#c9a36a" ' + ol(1.5) + '/>' +
      '<circle cx="104" cy="68" r="5" fill="#e9c178" ' + ol(1.4) + '/>' +
      '<line x1="104" y1="68" x2="107" y2="64" stroke="' + O + '" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M40 88 h44 l-5 12 h-34 z" fill="#9c7950" ' + ol(1.8) + '/>' +
      '<g id="roast-smoke" opacity="0"><circle cx="62" cy="-8" r="7" fill="#cdc3b1" opacity="0.75"/>' +
      '<circle cx="74" cy="-16" r="9" fill="#dcd3c2" opacity="0.65"/><circle cx="52" cy="-18" r="6" fill="#dcd3c2" opacity="0.55"/></g>' +
      '</g>' +
      counter(p) +
      '<g id="roast-bags"></g>' +
      '</svg>';
  }

  function beanBag(p, x, y, origin, s) {
    var o = CG.data.ORIGINS[origin];
    return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' +
      shadow(p, 0, 47, 22, 4.5, 0.16) +
      '<path d="M-20 -8 q-6 30 -3 48 q23 9 46 0 q3 -18 -3 -48 z" fill="#ecd9b2" ' + ol(2) + '/>' +
      '<path d="M-20 -8 q-6 30 -3 48 q10 4 23 4 l0 -52 z" fill="#e0cba0" opacity="0.7"/>' +
      '<path d="M-20 -8 q20 7 40 0 l2 -9 q-22 -6 -44 0 z" fill="#d4bd8d" ' + ol(2) + '/>' +
      '<rect x="-15" y="8" width="30" height="22" rx="3.5" fill="#fdf8ec" ' + ol(1.5) + '/>' +
      '<circle cx="0" cy="14.5" r="4" fill="' + o.bag + '" ' + ol(1.2) + '/>' +
      '<text x="0" y="26" text-anchor="middle" font-size="7.5" font-weight="700" fill="' + INK + '" font-family="system-ui,sans-serif">' + o.short + '</text>' +
      '</g>';
  }

  function roastBags(unlocked, inv, quality, selected) {
    var p = 'sr';
    return unlocked.map(function (o, i) {
      var x = ROAST_BAG_X[i];
      var q = quality[o];
      return '<g' + (selected === o ? ' class="bag-sel"' : '') + '>' +
        beanBag(p, x, 364, o, 1.05) +
        '<g transform="translate(' + x + ',340)">' +
        '<rect x="-15" y="-11" width="30" height="19" rx="9.5" fill="' + (inv[o] > 0 ? '#5b554d' : '#c2af8d') + '" ' + ol(1.5) + '/>' +
        '<text x="0" y="3.5" text-anchor="middle" font-size="11" font-weight="700" fill="#fdf8ec" font-family="system-ui,sans-serif">' + inv[o] + '</text>' +
        '</g>' +
        (q != null ? '<text x="' + x + '" y="466" text-anchor="middle" font-size="9" font-weight="600" fill="#fdf8ec" font-family="system-ui,sans-serif">q ' + Math.round(q) + '</text>' : '') +
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
    return wall(p) +
      pendant(28, 18) +
      windowFrame(p, 22, 86, 100, 118) +
      '<text x="138" y="86" font-size="10" letter-spacing="3" fill="#b3996e" font-family="system-ui,sans-serif">' + label + '</text>' +
      shelfPlank(p, 224, 142, 122) + jar(232, 116, 22, '#7e5634', 0.7) + jar(258, 116, 22, '#a87f4f', 0.5) + mug(286, 124, '#f2cfc4') + mug(312, 124, '#aed0c2') +
      tiles(0, 300, 360, 122);
  }

  /* espresso: wide sage machine; ids + inner glass geometry preserved */
  function sceneBrewEspresso() {
    var p = 'se';
    return open(p) + brewWallCommon(p, 'BREW BAR') +
      '<g transform="translate(2,282) scale(1.3)">' +
      shadow(p, 28, 110, 32, 6, 0.18) +
      '<rect x="6" y="34" width="44" height="72" rx="10" fill="url(#' + p + 'st)" ' + ol(2) + '/>' +
      '<rect x="8" y="36" width="40" height="7" rx="3.5" fill="#6d665d"/>' +
      '<path d="M12 34 h32 l-5 -24 h-22 z" fill="#ffffff" fill-opacity="0.7" ' + ol(1.8) + '/>' +
      '<ellipse cx="22" cy="20" rx="4" ry="2.8" fill="#7e5634"/><ellipse cx="32" cy="16" rx="4" ry="2.8" fill="#6e4a2c"/>' +
      '<ellipse cx="27" cy="25" rx="4" ry="2.8" fill="#8a5e38"/>' +
      '<circle cx="28" cy="64" r="8.5" fill="#c9a36a" ' + ol(1.7) + '/>' +
      '<circle cx="28" cy="64" r="3" fill="#9c7950"/>' +
      '<rect x="20" y="90" width="16" height="11" rx="3.5" fill="#2e2a25" ' + ol(1.4) + '/>' +
      '</g>' +
      '<g transform="translate(58,290) scale(1.45)">' +
      shadow(p, 88, 94, 92, 7, 0.2) +
      '<rect x="0" y="0" width="176" height="58" rx="13" fill="url(#' + p + 'sg)" ' + ol(2.4) + '/>' +
      '<rect x="2" y="2" width="172" height="9" rx="4.5" fill="#ffffff" opacity="0.4"/>' +
      '<rect x="-4" y="-8" width="184" height="10" rx="5" fill="#c9a36a" ' + ol(2) + '/>' +
      cupStack(10, -17, 2) + cupStack(62, -17, 2, '#f2cfc4') + cupStack(140, -17, 2) +
      '<circle cx="32" cy="28" r="9" fill="#fdf8ec" ' + ol(1.8) + '/><circle cx="32" cy="28" r="3.2" fill="#d9876a"/>' +
      '<line x1="32" y1="28" x2="37" y2="23" stroke="' + O + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="88" cy="26" r="7" fill="#e9c178" ' + ol(1.6) + '/>' +
      '<line x1="88" y1="26" x2="84" y2="21" stroke="' + O + '" stroke-width="1.6" stroke-linecap="round"/>' +
      '<rect x="118" y="20" width="34" height="12" rx="5" fill="#fdf8ec" ' + ol(1.7) + '/>' +
      '<circle cx="166" cy="26" r="5.5" fill="#f2cfc4" ' + ol(1.5) + '/>' +
      '<rect x="56" y="56" width="38" height="14" rx="5.5" fill="#46413a" ' + ol(1.8) + '/>' +
      '<path d="M70 70 h12 v8 h-12 z" fill="#2e2a25"/>' +
      '<rect x="120" y="56" width="38" height="14" rx="5.5" fill="#46413a" ' + ol(1.8) + '/>' +
      '<path d="M134 70 h12 v8 h-12 z" fill="#2e2a25"/>' +
      '<rect x="146" y="58" width="40" height="8" rx="4" fill="#c9a36a" ' + ol(1.7) + '/>' +
      '<g id="esp-pf-dock" opacity="0"><rect x="50" y="68" width="50" height="9" rx="4.5" fill="#c9a36a" ' + ol(1.7) + '/><rect x="92" y="69.5" width="26" height="6" rx="3" fill="#a9845a"/></g>' +
      '<g id="esp-stream" opacity="0"><rect x="73" y="78" width="5" height="16" rx="2.5" fill="#8a5a30"/></g>' +
      '<rect x="2" y="56" width="28" height="34" rx="8" fill="url(#' + p + 'sg)" ' + ol(2) + '/>' +
      '<rect x="146" y="66" width="28" height="24" rx="8" fill="url(#' + p + 'sg)" ' + ol(2) + '/>' +
      '<rect x="30" y="84" width="118" height="8" rx="4" fill="#9b948b" ' + ol(1.6) + '/>' +
      '</g>' +
      '<g id="esp-glass" transform="translate(150,368) scale(1.4)">' +
      '<clipPath id="' + p + 'gc"><path d="M1 1 h30 l-3 30 a4 4 0 0 1 -4 3 h-16 a4 4 0 0 1 -4 -3 z"/></clipPath>' +
      '<g clip-path="url(#' + p + 'gc)"><rect id="esp-fill" x="0" y="34" width="32" height="36" fill="#8a5a30"/>' +
      '<rect x="0" y="34" width="32" height="3" fill="#caa468" id="esp-crema"/></g>' +
      '<path d="M0 0 h32 l-3 31 a5 5 0 0 1 -5 4 h-16 a5 5 0 0 1 -5 -4 z" fill="#ffffff" fill-opacity="0.25" ' + ol(2) + '/>' +
      '<line id="esp-target" x1="-7" y1="13" x2="39" y2="13" stroke="#d9876a" stroke-width="2.5" stroke-dasharray="4 3"/>' +
      '</g>' +
      counter(p) +
      tamper(78, 400) + cloth(322, 404, '#aed0c2') +
      '</svg>';
  }

  function portafilter() {
    return '<svg viewBox="0 0 90 44" class="drag-svg">' +
      '<ellipse cx="34" cy="39" rx="26" ry="4" fill="#6b543c" opacity="0.2"/>' +
      '<path d="M10 14 h48 v10 a14 14 0 0 1 -14 12 h-20 a14 14 0 0 1 -14 -12 z" fill="#5b554d" ' + ol(2) + '/>' +
      '<path d="M11 15 h46 v5 h-46 z" fill="#6d665d"/>' +
      '<rect x="56" y="14" width="32" height="9.5" rx="4.75" fill="#c9a36a" ' + ol(1.8) + '/>' +
      '<rect x="57" y="15" width="30" height="3.5" rx="1.75" fill="#ffffff" opacity="0.4"/>' +
      '</svg>';
  }

  /* v60: stand + server (inner ids preserved) */
  function sceneBrewV60() {
    var p = 'sv';
    return open(p) + brewWallCommon(p, 'SLOW BAR') +
      '<g transform="translate(56,220) scale(1.62)">' +
      shadow(p, 44, 124, 56, 6, 0.18) +
      '<rect x="-8" y="114" width="104" height="11" rx="5.5" fill="#4f4a43" ' + ol(1.8) + '/>' +
      '<rect x="62" y="116.5" width="20" height="6" rx="3" fill="#cfe0d5"/>' +
      '<g id="v60-server">' +
      '<clipPath id="' + p + 'sc"><path d="M12 62 h64 l-6 50 h-52 z"/></clipPath>' +
      '<g clip-path="url(#' + p + 'sc)"><rect id="v60-fill" x="8" y="112" width="72" height="56" fill="#7a4e28"/></g>' +
      '<path d="M12 62 h64 l-6 50 h-52 z" fill="#dce8e0" fill-opacity="0.5" ' + ol(2) + '/>' +
      '<line id="v60-line1" x1="6" y1="98" x2="82" y2="98" stroke="#d9876a" stroke-width="2" stroke-dasharray="3 3"/>' +
      '<line id="v60-line2" x1="6" y1="84" x2="82" y2="84" stroke="#d9876a" stroke-width="2" stroke-dasharray="3 3" opacity="0"/>' +
      '<line id="v60-line3" x1="6" y1="68" x2="82" y2="68" stroke="#d9876a" stroke-width="2" stroke-dasharray="3 3" opacity="0"/>' +
      '</g>' +
      '<path d="M14 18 h60 l-21 38 h-18 z" fill="#f3e3c3" ' + ol(2) + '/>' +
      '<path d="M16 20 h56 l-3 5.5 h-50 z" fill="#fbf0d8"/>' +
      '<ellipse id="v60-water" cx="44" cy="30" rx="0" ry="0" fill="#8a5a30" opacity="0.85"/>' +
      '<path d="M20 30 h48 l-2.5 5.5 h-43 z" fill="#c9a36a" ' + ol(1.5) + '/>' +
      '<path d="M40 56 h8 v6 h-8 z" fill="#ddd0b2" ' + ol(1.3) + '/>' +
      '<g id="v60-drip" opacity="0"><rect x="41.5" y="60" width="4" height="14" rx="2" fill="#8a5a30"/></g>' +
      '</g>' +
      counter(p) +
      filterBox(238, 398) + timer(276, 398) + brewScale(p, 312, 406, 40) +
      '</svg>';
  }

  function kettle() {
    return '<svg viewBox="0 0 110 80" class="drag-svg">' +
      '<ellipse cx="62" cy="74" rx="34" ry="5" fill="#6b543c" opacity="0.2"/>' +
      '<path d="M34 30 q-2 40 28 40 q30 0 28 -40 z" fill="#46413a" ' + ol(2) + '/>' +
      '<path d="M35 31 q-2 8 1 13 l51 0 q3 -5 1 -13 z" fill="#5b554d"/>' +
      '<path d="M34 32 q-16 2 -26 16 l-6 -3 q10 -18 30 -19 z" fill="#46413a" ' + ol(1.8) + '/>' +
      '<path d="M2 45 l6 3 4 -5 -7 -4 z" fill="#46413a" ' + ol(1.6) + '/>' +
      '<rect x="40" y="20" width="44" height="10" rx="5" fill="#2e2a25" ' + ol(1.7) + '/>' +
      '<path d="M48 18 q14 -14 28 0" fill="none" stroke="#c9a36a" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M48 18 q14 -14 28 0" fill="none" stroke="' + O + '" stroke-width="9.5" stroke-linecap="round" opacity="0.35"/>' +
      '<circle cx="90" cy="38" r="3.2" fill="#d9876a"/>' +
      '</svg>';
  }

  /* aeropress (inner ids preserved) */
  function sceneBrewAero() {
    var p = 'sa';
    return open(p) + brewWallCommon(p, 'BREW BAR') +
      '<g transform="translate(76,214) scale(1.55)">' +
      shadow(p, 52, 132, 56, 6, 0.18) +
      '<rect x="-4" y="122" width="112" height="11" rx="5.5" fill="#4f4a43" ' + ol(1.8) + '/>' +
      '<g><clipPath id="' + p + 'ac"><path d="M22 78 h60 l-5 42 h-50 z"/></clipPath>' +
      '<g clip-path="url(#' + p + 'ac)"><rect id="aero-fill" x="18" y="120" width="68" height="46" fill="#7a4e28"/></g>' +
      '<path d="M22 78 h60 l-5 42 h-50 z" fill="#dce8e0" fill-opacity="0.5" ' + ol(2) + '/></g>' +
      '<rect x="30" y="34" width="44" height="46" rx="5" fill="#e6e0d2" fill-opacity="0.6" ' + ol(2) + '/>' +
      '<rect id="aero-brew" x="33" y="58" width="38" height="20" rx="3" fill="#8a5a30" opacity="0"/>' +
      '<g id="aero-plunger">' +
      '<rect x="36" y="2" width="32" height="34" rx="5" fill="url(#' + p + 'st)" ' + ol(1.8) + '/>' +
      '<rect x="26" y="0" width="52" height="10" rx="5" fill="#2e2a25" ' + ol(1.6) + '/>' +
      '</g>' +
      '</g>' +
      counter(p) +
      mug(262, 398, '#f2cfc4') + mug(290, 402, '#aed0c2') + timer(322, 398) +
      '</svg>';
  }

  /* batch brewer (inner ids preserved) */
  function sceneBrewBatch() {
    var p = 'sb';
    return open(p) + brewWallCommon(p, 'BREW BAR') +
      '<g transform="translate(64,247) scale(1.5)">' +
      shadow(p, 56, 118, 60, 6, 0.18) +
      '<rect x="0" y="0" width="34" height="112" rx="9" fill="#f3ead6" ' + ol(2.2) + '/>' +
      '<rect x="2" y="2" width="30" height="8" rx="4" fill="#ffffff" opacity="0.7"/>' +
      '<rect x="0" y="0" width="112" height="22" rx="9" fill="#f3ead6" ' + ol(2.2) + '/>' +
      '<rect x="84" y="14" width="22" height="12" rx="4" fill="#ddd0b2" ' + ol(1.5) + '/>' +
      '<circle cx="17" cy="56" r="5" fill="#d9876a" ' + ol(1.4) + '/>' +
      '<rect x="64" y="22" width="10" height="8" fill="#d4bd8d" ' + ol(1.3) + '/>' +
      '<g id="batch-drip" opacity="0"><rect x="66" y="30" width="5" height="22" rx="2.5" fill="#7a4e28"/></g>' +
      '<g><clipPath id="' + p + 'bc"><path d="M44 56 h62 l-6 50 h-50 z"/></clipPath>' +
      '<g clip-path="url(#' + p + 'bc)"><rect id="batch-fill" x="40" y="106" width="70" height="54" fill="#7a4e28"/></g>' +
      '<path d="M44 56 h62 l-6 50 h-50 z" fill="#dce8e0" fill-opacity="0.5" ' + ol(2) + '/>' +
      '<rect x="64" y="46" width="22" height="10" rx="5" fill="#4f4a43" ' + ol(1.6) + '/></g>' +
      '<rect x="34" y="106" width="78" height="9" rx="4.5" fill="#4f4a43" ' + ol(1.7) + '/>' +
      '</g>' +
      counter(p) +
      mug(262, 400, '#f2cfc4') + jar(294, 390, 26, '#fdf8ec', 0.8) + cloth(324, 406, '#f2cfc4') +
      '</svg>';
  }

  /* --- milk bar (machine inner coords preserved) --- */

  function sceneMilk() {
    var p = 'sm';
    return open(p) + wall(p) +
      pendant(326, 20) +
      '<text x="20" y="86" font-size="10" letter-spacing="3" fill="#b3996e" font-family="system-ui,sans-serif">MILK BAR</text>' +
      shelfPlank(p, 170, 130, 120) +
      bottle(178, 104, '#fdfdfd') + bottle(198, 104, '#f2cfc4') + mug(222, 112, '#aed0c2') + mug(248, 112, '#fdf8ec') +
      framedPrint(p, 302, 110) +
      tiles(0, 300, 360, 122) +
      fridge(p, 14, 242, 178) +
      '<g transform="translate(96,160) scale(1.5)">' +
      shadow(p, 60, 134, 64, 6, 0.16) +
      '<rect x="0" y="0" width="116" height="48" rx="11" fill="url(#' + p + 'st)" ' + ol(2.2) + '/>' +
      '<rect x="2" y="2" width="112" height="7" rx="3.5" fill="#6d665d"/>' +
      '<circle cx="26" cy="24" r="8.5" fill="#fdf8ec" ' + ol(1.7) + '/><circle cx="26" cy="24" r="3" fill="#d9876a"/>' +
      '<rect x="64" y="18" width="32" height="12" rx="5" fill="#c9a36a" ' + ol(1.6) + '/>' +
      '<rect x="36" y="44" width="8" height="46" rx="4" fill="#9b948b" ' + ol(1.7) + ' transform="rotate(-12 40 44)"/>' +
      '<circle cx="31" cy="92" r="4.5" fill="#46413a"/>' +
      '<g id="milk-steam" opacity="0">' +
      '<path d="M33 96 q-6 12 2 22 q6 10 -2 18" stroke="#ffffff" stroke-opacity="0.85" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M44 98 q-4 10 2 16" stroke="#ffffff" stroke-opacity="0.6" stroke-width="4" fill="none" stroke-linecap="round"/></g>' +
      '</g>' +
      counter(p) +
      cloth(288, 404, '#aed0c2') + saucerStack(330, 410, 3) +
      '</svg>';
  }

  function pitcherSvg() {
    return '<svg viewBox="0 0 90 78" class="drag-svg">' +
      '<ellipse cx="42" cy="72" rx="28" ry="5" fill="#6b543c" opacity="0.2"/>' +
      '<path d="M14 10 h52 l-7 58 h-38 z" fill="#e3ded3" ' + ol(2) + '/>' +
      '<path d="M15.5 11.5 h49 l-1.6 8 h-46 z" fill="#f4f1ea"/>' +
      '<path d="M14 10 h22 l-4 58 h-11 z" fill="#cfc8ba" opacity="0.55"/>' +
      '<path d="M66 14 l16 8 -17 7" fill="#e3ded3" ' + ol(2) + '/>' +
      '<clipPath id="pitclip"><path d="M16 12 h48 l-6.4 54 h-35 z"/></clipPath>' +
      '<g clip-path="url(#pitclip)"><rect id="milk-fill" x="10" y="34" width="64" height="46" fill="#fcfbf8"/>' +
      '<rect id="milk-foam" x="10" y="28" width="64" height="8" fill="#ffffff"/></g>' +
      '</svg>';
  }

  /* --- the pass (cup-host + pass-stream preserved) --- */

  function scenePass() {
    var p = 'sp';
    return open(p) + wall(p) +
      pendant(44, 18) +
      windowFrame(p, 234, 92, 102, 126) +
      '<text x="20" y="86" font-size="10" letter-spacing="3" fill="#b3996e" font-family="system-ui,sans-serif">THE PASS</text>' +
      shelfPlank(p, 14, 142, 122) + cupStack(22, 132, 2) + mug(52, 124, '#f2cfc4') + jar(82, 116, 24, '#e9c178', 0.6) +
      plantHang(330, 240) +
      tiles(0, 300, 360, 122) +
      shadow(p, 180, 428, 80, 7, 0.18) +
      '<rect x="92" y="404" width="176" height="16" rx="8" fill="url(#' + p + 'ct)" ' + ol(2.4) + '/>' +
      '<rect x="94" y="406" width="172" height="4.5" rx="2.25" fill="#ffffff" opacity="0.45"/>' +
      '<ellipse cx="180" cy="404" rx="58" ry="6" fill="#ffffff" opacity="0.6"/>' +
      '<g id="cup-host"></g>' +
      '<g id="pass-stream" opacity="0"><rect x="175" y="120" width="7" height="112" rx="3.5" fill="#fcfbf8"/></g>' +
      counter(p) +
      bell(56, 396) + saucerStack(300, 406, 3) + vasePlant(330, 384) +
      '</svg>';
  }

  function passCup(liquidColor, fillFrac, artTier, cremaLine) {
    var topY = 240, botY = 400, lipW = 116, baseW = 86;
    var h = botY - topY;
    var lvl = botY - 8 - Math.max(0, Math.min(1, fillFrac)) * (h - 28);
    var art = '';
    if (artTier === 'heart') {
      art = '<g transform="translate(180,' + (lvl + 20) + ') scale(2)"><path d="M0 8 C-9 1 -8 -6 -2 -6 C0 -6 0 -3 0 -3 C0 -3 0 -6 2 -6 C8 -6 9 1 0 8 z" fill="#fcfbf8"/></g>';
    } else if (artTier === 'tulip') {
      art = '<g transform="translate(180,' + (lvl + 18) + ') scale(2)" fill="#fcfbf8">' +
        '<path d="M0 9 C-7 4 -6 -1 -1.5 -1 C0 -1 0 1 0 1 C0 1 0 -1 1.5 -1 C6 -1 7 4 0 9z"/>' +
        '<path d="M0 1 C-5 -3 -4 -7 -1 -7 C0 -7 0 -5 0 -5 C0 -5 0 -7 1 -7 C4 -7 5 -3 0 1z" transform="translate(0,-4)"/></g>';
    } else if (artTier === 'rosetta') {
      art = '<g transform="translate(180,' + (lvl + 14) + ') scale(2)" stroke="#fcfbf8" stroke-width="2.4" fill="none" stroke-linecap="round">' +
        '<path d="M0 14 l0 -18"/><path d="M-8 10 q8 -3 16 0"/><path d="M-7 5 q7 -3 14 0"/><path d="M-5.5 0 q5.5 -2.5 11 0"/><path d="M-4 -4.5 q4 -2 8 0"/></g>';
    }
    return '<g>' +
      '<clipPath id="spcup"><path d="M' + (180 - lipW / 2 + 3) + ' ' + (topY + 3) + ' h' + (lipW - 6) + ' l-' + ((lipW - baseW) / 2 - 1.5) + ' ' + (h - 9) + ' a7 7 0 0 1 -7 6 h-' + (baseW - 20) + ' a7 7 0 0 1 -7 -6 z"/></clipPath>' +
      '<g clip-path="url(#spcup)">' +
      (fillFrac > 0 ? '<rect x="100" y="' + lvl + '" width="160" height="180" fill="' + liquidColor + '"/>' +
        (cremaLine ? '<rect x="100" y="' + lvl + '" width="160" height="7" fill="#caa468"/>' : '') : '') +
      '</g>' + art +
      '<path d="M' + (180 - lipW / 2) + ' ' + topY + ' h' + lipW + ' l-' + ((lipW - baseW) / 2) + ' ' + h + ' h-' + baseW + ' z" fill="#fdf8ec" opacity="0.3"/>' +
      '<path d="M' + (180 - lipW / 2) + ' ' + topY + ' h' + lipW + ' l-' + ((lipW - baseW) / 2) + ' ' + h + ' a9 9 0 0 1 -9 7 h-' + (baseW - 18) + ' a9 9 0 0 1 -9 -7 z" fill="none" ' + ol(5) + '/>' +
      '<path d="M' + (180 + lipW / 2 - 3) + ' ' + (topY + 24) + ' q30 8 22 36 q-6 24 -30 24" fill="none" stroke="' + O + '" stroke-width="14" stroke-linecap="round"/>' +
      '<path d="M' + (180 + lipW / 2 - 3) + ' ' + (topY + 24) + ' q30 8 22 36 q-6 24 -30 24" fill="none" stroke="#fdf8ec" stroke-width="7" stroke-linecap="round"/>' +
      '</g>';
  }

  /* standalone latte cup for the milk bar — drawn 3/4 top-down (bird's-eye)
     so the latte art reads as poured onto the crema surface, not the side wall */
  function latteCup(fillFrac, artTier, liquid) {
    liquid = liquid || '#c89a6c';
    var cx = 58;
    var f = Math.max(0, Math.min(1, fillFrac));
    // mug silhouette: wide rim ellipse up top, tapering to a smaller base
    var rimCy = 50, rimRx = 42, rimRy = 17;
    var baseCy = 120, baseRx = 30, baseRy = 10;
    // coffee surface sits deep & small when empty, rises to the rim when full
    var surfCy = 70 - f * (70 - rimCy);
    var surfRx = 26 + f * (rimRx - 5 - 26);
    var surfRy = surfRx * (rimRy / rimRx);

    // latte art, drawn in a circular design space then foreshortened onto the ellipse
    var art = '';
    if (f > 0.35 && artTier) {
      var sc = surfRx / 20, sq = surfRy / surfRx;
      var inner = '';
      if (artTier === 'heart') {
        inner = '<path d="M0 -12 C-10 -22 -22 -6 0 11 C22 -6 10 -22 0 -12 Z" fill="#fcfbf8"/>';
      } else if (artTier === 'tulip') {
        inner = '<g fill="#fcfbf8">' +
          '<path d="M0 -4 C-10 -14 -20 -1 0 12 C20 -1 10 -14 0 -4 Z"/>' +
          '<path d="M0 -12 C-7 -19 -14 -9 0 0 C14 -9 7 -19 0 -12 Z"/></g>';
      } else if (artTier === 'rosetta') {
        inner = '<g stroke="#fcfbf8" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M-18 0 H15"/>' +
          '<path d="M-13 0 q5 -7 12 -6"/><path d="M-13 0 q5 7 12 6"/>' +
          '<path d="M-7 0 q5 -7 12 -6"/><path d="M-7 0 q5 7 12 6"/>' +
          '<path d="M-1 0 q4 -6 10 -5"/><path d="M-1 0 q4 6 10 5"/>' +
          '<path d="M5 0 q3 -5 8 -4"/><path d="M5 0 q3 5 8 4"/></g>';
      }
      art = '<g clip-path="url(#lcsurf)"><g transform="translate(' + cx + ',' + surfCy.toFixed(1) +
        ') scale(' + sc.toFixed(3) + ',' + (sc * sq).toFixed(3) + ')">' + inner + '</g></g>';
    }

    return '<svg viewBox="0 0 116 150" class="latte-cup-svg">' +
      // contact shadow
      '<ellipse cx="' + cx + '" cy="' + (baseCy + 9) + '" rx="34" ry="6" fill="#6b543c" opacity="0.16"/>' +
      // mug body: back of rim arcs over the top, walls taper to the base front
      '<path d="M' + (cx - rimRx) + ' ' + rimCy + ' A ' + rimRx + ' ' + rimRy + ' 0 0 1 ' + (cx + rimRx) + ' ' + rimCy +
        ' L ' + (cx + baseRx) + ' ' + baseCy + ' A ' + baseRx + ' ' + baseRy + ' 0 0 0 ' + (cx - baseRx) + ' ' + baseCy + ' Z" ' +
        'fill="#fdf8ec" ' + ol(4.5) + '/>' +
      // side shading on the lower body
      '<path d="M' + (cx + rimRx - 2) + ' ' + (rimCy + 4) + ' L ' + (cx + baseRx) + ' ' + baseCy +
        ' A ' + baseRx + ' ' + baseRy + ' 0 0 0 ' + (cx + baseRx - 13) + ' ' + (baseCy + 4) + ' Z" fill="#000" opacity="0.05"/>' +
      // handle (top-down loop on the right)
      '<path d="M' + (cx + rimRx - 6) + ' ' + (rimCy + 2) + ' q22 -4 22 12 q0 14 -20 11" fill="none" stroke="' + O + '" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M' + (cx + rimRx - 6) + ' ' + (rimCy + 2) + ' q22 -4 22 12 q0 14 -20 11" fill="none" stroke="#fdf8ec" stroke-width="4" stroke-linecap="round"/>' +
      // rim opening: outer ellipse (ceramic lip) + inner wall well
      '<ellipse cx="' + cx + '" cy="' + rimCy + '" rx="' + rimRx + '" ry="' + rimRy + '" fill="#fdf8ec" ' + ol(4) + '/>' +
      '<ellipse cx="' + cx + '" cy="' + (rimCy + 1) + '" rx="' + (rimRx - 4) + '" ry="' + (rimRy - 1.5) + '" fill="#e7d9bf"/>' +
      // coffee surface
      '<clipPath id="lcsurf"><ellipse cx="' + cx + '" cy="' + surfCy.toFixed(1) + '" rx="' + surfRx.toFixed(1) + '" ry="' + surfRy.toFixed(1) + '"/></clipPath>' +
      (f > 0
        ? '<ellipse cx="' + cx + '" cy="' + surfCy.toFixed(1) + '" rx="' + surfRx.toFixed(1) + '" ry="' + surfRy.toFixed(1) + '" fill="' + liquid + '"/>' +
          '<ellipse cx="' + cx + '" cy="' + (surfCy - surfRy * 0.28).toFixed(1) + '" rx="' + (surfRx * 0.74).toFixed(1) + '" ry="' + (surfRy * 0.5).toFixed(1) + '" fill="#fff" opacity="0.10"/>'
        : '') +
      art +
      '</svg>';
  }

  /* ============ machine portraits (upgrade screen) ============ */

  function machinePortrait(key) {
    var p = 'mp' + key;
    var inner = '';
    if (key === 'grinder') {
      inner = '<g transform="translate(62,28) scale(1.5)">' +
        '<rect x="6" y="34" width="44" height="72" rx="10" fill="url(#' + p + 'st)" ' + ol(2) + '/>' +
        '<rect x="8" y="36" width="40" height="7" rx="3.5" fill="#6d665d"/>' +
        '<path d="M12 34 h32 l-5 -24 h-22 z" fill="#ffffff" fill-opacity="0.7" ' + ol(1.8) + '/>' +
        '<ellipse cx="22" cy="20" rx="4" ry="2.8" fill="#7e5634"/><ellipse cx="32" cy="16" rx="4" ry="2.8" fill="#6e4a2c"/>' +
        '<circle cx="28" cy="64" r="8.5" fill="#c9a36a" ' + ol(1.7) + '/><circle cx="28" cy="64" r="3" fill="#9c7950"/>' +
        '<rect x="20" y="90" width="16" height="11" rx="3.5" fill="#2e2a25" ' + ol(1.4) + '/></g>';
    } else if (key === 'roaster') {
      inner = '<g transform="translate(38,36) scale(1.0)">' +
        '<rect x="0" y="86" width="124" height="14" rx="6" fill="url(#' + p + 'ct)" ' + ol(2) + '/>' +
        '<rect x="6" y="0" width="112" height="88" rx="16" fill="#f3ead6" ' + ol(2.2) + '/>' +
        '<circle cx="62" cy="44" r="33" fill="url(#' + p + 'st)" ' + ol(2.2) + '/>' +
        '<circle cx="62" cy="44" r="26" fill="#241f1a"/>' + beanGroup(14, '#8a5e38') +
        '<circle cx="104" cy="16" r="6.5" fill="#d9876a" ' + ol(1.6) + '/></g>';
    } else if (key === 'kettle') {
      inner = '<g transform="translate(36,52) scale(1.45)">' +
        '<path d="M34 30 q-2 40 28 40 q30 0 28 -40 z" fill="#46413a" ' + ol(2) + '/>' +
        '<path d="M35 31 q-2 8 1 13 l51 0 q3 -5 1 -13 z" fill="#5b554d"/>' +
        '<path d="M34 32 q-16 2 -26 16 l-6 -3 q10 -18 30 -19 z" fill="#46413a" ' + ol(1.8) + '/>' +
        '<rect x="40" y="20" width="44" height="10" rx="5" fill="#2e2a25" ' + ol(1.7) + '/>' +
        '<path d="M48 18 q14 -14 28 0" fill="none" stroke="#c9a36a" stroke-width="7" stroke-linecap="round"/></g>';
    } else if (key === 'pitcher') {
      inner = '<g transform="translate(56,46) scale(1.35)">' +
        '<path d="M14 10 h52 l-7 58 h-38 z" fill="#e3ded3" ' + ol(2) + '/>' +
        '<path d="M15.5 11.5 h49 l-1.6 8 h-46 z" fill="#f4f1ea"/>' +
        '<path d="M66 14 l16 8 -17 7" fill="#e3ded3" ' + ol(2) + '/>' +
        '<path d="M26 30 q14 -9 28 0" fill="none" stroke="#f2cfc4" stroke-width="3" stroke-linecap="round"/></g>';
    } else if (key === 'decor') {
      inner = plantHang(58, 60) + plantPot('x', 130, 138, 1.5) + framedPrint(p, 100, 36);
    } else {
      inner = '<g transform="translate(58,40)">' +
        '<rect x="20" y="0" width="56" height="40" rx="8" fill="#4b5a50" ' + ol(2) + '/>' +
        '<text x="48" y="18" text-anchor="middle" font-size="9" fill="#f3ead6" font-family="Georgia,serif" font-style="italic">welcome</text>' +
        '<rect x="14" y="6" width="6" height="120" rx="3" fill="#c9a36a" ' + ol(1.8) + '/>' +
        bell(64, 64) + '</g>';
    }
    return '<svg viewBox="0 0 200 190" class="portrait-svg">' + defs(p) +
      shadow(p, 100, 172, 64, 8, 0.18) + inner + '</svg>';
  }

  /* ============ characters ============ */

  function hairSvg(c) {
    var h = c.hairColor;
    switch (c.hair) {
      case 'bun':
        return '<circle cx="50" cy="16" r="9" fill="' + h + '" ' + ol(1.6) + '/>' +
               '<path d="M28 38 a22 20 0 0 1 44 0 l-4 -2 a18 16 0 0 0 -36 0 z" fill="' + h + '"/>';
      case 'beanie':
        return '<path d="M27 36 a23 21 0 0 1 46 0 z" fill="' + h + '"/>' +
               '<rect x="26" y="32" width="48" height="8" rx="4" fill="' + h + '" ' + ol(1.5) + '/>' +
               '<circle cx="50" cy="14" r="4" fill="' + h + '" ' + ol(1.5) + '/>';
      case 'pony':
        return '<path d="M28 40 a22 22 0 0 1 44 0 l-5 -3 a17 17 0 0 0 -34 0 z" fill="' + h + '"/>' +
               '<path d="M68 30 q12 4 8 26 q-3 14 -8 16 q4 -16 0 -26 q-2 -8 -6 -12 z" fill="' + h + '"/>';
      case 'short':
        return '<path d="M28 38 a22 20 0 0 1 44 0 l-6 -2 a16 14 0 0 0 -32 0 z" fill="' + h + '"/>';
      case 'pigtails':
        return '<path d="M30 38 a20 18 0 0 1 40 0 l-5 -2 a15 13 0 0 0 -30 0 z" fill="' + h + '"/>' +
               '<circle cx="24" cy="42" r="7" fill="' + h + '" ' + ol(1.5) + '/><circle cx="76" cy="42" r="7" fill="' + h + '" ' + ol(1.5) + '/>';
      case 'curly':
        return '<circle cx="36" cy="26" r="8" fill="' + h + '"/><circle cx="50" cy="20" r="9" fill="' + h + '"/>' +
               '<circle cx="64" cy="26" r="8" fill="' + h + '"/><circle cx="29" cy="36" r="6" fill="' + h + '"/>' +
               '<circle cx="71" cy="36" r="6" fill="' + h + '"/>';
      case 'flower':
        return '<path d="M28 40 a22 21 0 0 1 44 0 l-4 -2 a18 17 0 0 0 -36 0 z" fill="' + h + '"/>' +
               '<g transform="translate(68,24)"><circle r="3.2" cx="0" cy="-4" fill="#eba7b0"/>' +
               '<circle r="3.2" cx="4" cy="2" fill="#eba7b0"/><circle r="3.2" cx="-4" cy="2" fill="#eba7b0"/>' +
               '<circle r="2.2" fill="#e9c178"/></g>';
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
        return '<path d="M34 66 q16 9 32 0 l-2 8 q-14 7 -28 0 z" fill="#cb8870" ' + ol(1.4) + '/>' +
               '<rect x="56" y="70" width="9" height="16" rx="4" fill="#cb8870" ' + ol(1.4) + '/>';
      case 'freckles':
        return '<g fill="#c08a5c"><circle cx="36" cy="48" r="1.2"/><circle cx="40" cy="50" r="1.2"/>' +
               '<circle cx="64" cy="48" r="1.2"/><circle cx="60" cy="50" r="1.2"/></g>';
      case 'phone':
        return '<rect x="73" y="74" width="11" height="18" rx="2.5" fill="#5b554d" ' + ol(1.4) + ' transform="rotate(8 78 82)"/>' +
               '<rect x="75" y="77" width="7" height="11" rx="1" fill="#cfe0d5" transform="rotate(8 78 82)"/>';
      default: return '';
    }
  }

  // bigger, rounder eyes with a catchlight — the main "cute" lever
  function eyePair(r, blink) {
    var hl = '<circle cx="43.4" cy="41.4" r="1.4" fill="#ffffff"/><circle cx="59.4" cy="41.4" r="1.4" fill="#ffffff"/>';
    if (blink) {
      return '<path d="M38 43 q4 3 8 0" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
             '<path d="M54 43 q4 3 8 0" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    }
    return '<circle cx="42" cy="43" r="' + r + '" fill="' + INK + '"/><circle cx="58" cy="43" r="' + r + '" fill="' + INK + '"/>' + hl;
  }

  function faceSvg(mood) {
    var eyes, brows = '', mouth, blush = '';
    if (mood === 'angry') {
      eyes = eyePair(3.4);
      brows = '<line x1="36" y1="35" x2="46" y2="39" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
              '<line x1="64" y1="35" x2="54" y2="39" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>';
      mouth = '<path d="M42 59 q8 -7 16 0" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
      blush = '<ellipse cx="33" cy="52" rx="5" ry="3.2" fill="#e08d77" opacity="0.55"/><ellipse cx="67" cy="52" rx="5" ry="3.2" fill="#e08d77" opacity="0.55"/>';
    } else if (mood === 'annoyed') {
      eyes = eyePair(3.4);
      brows = '<line x1="37" y1="37" x2="46" y2="38.5" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
              '<line x1="63" y1="37" x2="54" y2="38.5" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>';
      mouth = '<path d="M43 58 q7 -3 14 0" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    } else if (mood === 'neutral') {
      eyes = eyePair(3.6);
      mouth = '<path d="M44 57 q6 2 12 0" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      blush = '<ellipse cx="33" cy="52" rx="4.5" ry="3" fill="#f0b89c" opacity="0.4"/><ellipse cx="67" cy="52" rx="4.5" ry="3" fill="#f0b89c" opacity="0.4"/>';
    } else {
      eyes = eyePair(3.8);
      mouth = '<path d="M41 55 q9 9 18 0" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
              '<path d="M44 56 q6 5 12 0z" fill="#e58c80" opacity="0.5"/>';
      blush = '<ellipse cx="33" cy="52" rx="5" ry="3.2" fill="#f0a890" opacity="0.55"/><ellipse cx="67" cy="52" rx="5" ry="3.2" fill="#f0a890" opacity="0.55"/>';
    }
    return blush + brows + eyes + mouth;
  }

  function customer(charId, mood) {
    var c = CG.data.CHARACTERS[charId];
    var collar = c.collar || c.top;
    return '<svg viewBox="0 0 100 110" class="cust-svg" aria-label="' + c.name + '">' +
      '<ellipse cx="50" cy="108" rx="28" ry="3.6" fill="#6b543c" opacity="0.16"/>' +
      '<rect x="45" y="61" width="10" height="13" rx="5" fill="' + c.skin + '" ' + ol(1.6) + '/>' +
      '<path d="M21 110 v-19 a27 23 0 0 1 58 0 v19 z" fill="' + c.top + '" ' + ol(2) + '/>' +
      '<path d="M23 94 a25 21 0 0 1 54 -2 v2 z" fill="#ffffff" opacity="0.13"/>' +
      '<path d="M39 69 q11 10 22 0 l-5 13 q-6 4 -12 0 z" fill="' + collar + '" ' + ol(1.5) + '/>' +
      '<circle cx="50" cy="44" r="22" fill="' + c.skin + '" ' + ol(2) + '/>' +
      '<path d="M30 36 a20 20 0 0 1 40 0 a20 14 0 0 0 -40 0z" fill="#ffffff" opacity="0.10"/>' +
      hairSvg(c) + faceSvg(mood || 'happy') + accessorySvg(c) +
      '</svg>';
  }

  function patienceRing(pct, color) {
    var r = 17, circ = 2 * Math.PI * r;
    var off = circ * (1 - pct / 100);
    return '<svg viewBox="0 0 40 40" class="ring-svg">' +
      '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="#8a705a30" stroke-width="4"/>' +
      '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="4" ' +
      'stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" ' +
      'transform="rotate(-90 20 20)"/></svg>';
  }

  /* ============ drink card art & tags ============ */

  function drink(ticket) {
    var d = CG.data;
    var r = d.RECIPES[ticket.recipe];
    var milkColor = r.milk ? '#efe0c8' : null;
    var liquid = r.milk ? '#c89a6c' : '#7a4e28';
    var art = r.art ? '<g transform="translate(50,33) scale(0.85)"><path d="M0 8 C-9 1 -8 -6 -2 -6 C0 -6 0 -3 0 -3 C0 -3 0 -6 2 -6 C8 -6 9 1 0 8 z" fill="#fcfbf8"/></g>' : '';
    return '<svg viewBox="0 0 100 110" class="drink-svg">' +
      '<ellipse cx="50" cy="100" rx="30" ry="4" fill="#6b543c" opacity="0.18"/>' +
      '<path d="M26 28 h48 l-6 62 a6 6 0 0 1 -6 5 h-24 a6 6 0 0 1 -6 -5 z" fill="#fdf8ec" ' + ol(2.2) + '/>' +
      '<path d="M29 32 h42 l-5 54 a4 4 0 0 1 -4 3 h-22 a4 4 0 0 1 -4 -3 z" fill="' + liquid + '"/>' +
      (milkColor ? '<path d="M29 32 h42 l-1.6 17 h-39 z" fill="' + milkColor + '"/>' : '<path d="M29 32 h42 l-0.5 5 h-41 z" fill="#caa468"/>') +
      art +
      '<path d="M74 38 q15 3 12 17 q-3 13 -16 12" fill="none" stroke="' + O + '" stroke-width="7.5" stroke-linecap="round"/>' +
      '<path d="M74 38 q15 3 12 17 q-3 13 -16 12" fill="none" stroke="#fdf8ec" stroke-width="4" stroke-linecap="round"/>' +
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

  /* ============ icons ============ */

  function icon(name) {
    var s = 'fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"';
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
      case 'coin':
        inner = '<circle cx="20" cy="20" r="14" ' + s + '/><text x="20" y="26" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">$</text>';
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

  /* title: a busy little brew-bar vignette */
  function logo() {
    var p = 'lg';
    return '<svg viewBox="0 0 260 170" class="logo-svg">' + defs(p) +
      shadow(p, 130, 158, 92, 8, 0.16) +
      '<rect x="18" y="132" width="224" height="14" rx="7" fill="url(#' + p + 'ct)" ' + ol(2.2) + '/>' +
      // latte cup with heart
      '<g transform="translate(58,46)">' +
      '<path d="M8 18 h74 l-8 56 a8 8 0 0 1 -8 6.5 h-42 a8 8 0 0 1 -8 -6.5 z" fill="#fdf8ec" ' + ol(2.6) + '/>' +
      '<path d="M14 25 h62 l-4 26 h-54 z" fill="#c89a6c"/>' +
      '<g transform="translate(45,38) scale(1.2)"><path d="M0 8 C-9 1 -8 -6 -2 -6 C0 -6 0 -3 0 -3 C0 -3 0 -6 2 -6 C8 -6 9 1 0 8 z" fill="#fcfbf8"/></g>' +
      '<path d="M82 28 q18 3 15 19 q-3 15 -19 13" fill="none" stroke="' + O + '" stroke-width="8.5" stroke-linecap="round"/>' +
      '<path d="M82 28 q18 3 15 19 q-3 15 -19 13" fill="none" stroke="#fdf8ec" stroke-width="4.5" stroke-linecap="round"/>' +
      '<g stroke="#ddd0b2" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.95">' +
      '<path d="M22 10 q5 -8 0 -16"/><path d="M44 12 q5 -9 0 -18"/><path d="M66 10 q5 -8 0 -16"/></g>' +
      '</g>' +
      // V60 beside it
      '<g transform="translate(170,72)">' +
      '<path d="M0 0 h52 l-18 32 h-16 z" fill="#fdf8ec" ' + ol(2.2) + '/>' +
      '<path d="M5 10 h42 l-2 4.5 h-38 z" fill="#c9a36a" ' + ol(1.4) + '/>' +
      '<path d="M22 32 h8 v5 h-8 z" fill="#ddd0b2" ' + ol(1.2) + '/>' +
      '<path d="M2 42 h48 l-4 18 h-40 z" fill="#ffffff" fill-opacity="0.4" ' + ol(2) + '/>' +
      '</g>' +
      // beans
      '<g ' + ol(1.2) + '><ellipse cx="36" cy="124" rx="6" ry="4.2" fill="#7e5634" transform="rotate(-20 36 124)"/>' +
      '<ellipse cx="226" cy="120" rx="6" ry="4.2" fill="#8a5e38" transform="rotate(28 226 120)"/></g>' +
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
    scenePass: scenePass, passCup: passCup, latteCup: latteCup,
    machinePortrait: machinePortrait,
    drink: drink, tagPills: tagPills,
    icon: icon, stars: stars, logo: logo
  };
})();
