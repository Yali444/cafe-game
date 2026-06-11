/* Crackle & Pour — inline SVG art: characters, illustrated scenes, drinks, icons */
CG.svg = (function () {
  'use strict';

  var LINE = '#7a5743';

  /* ================= customers ================= */

  function hairSvg(c) {
    var h = c.hairColor;
    switch (c.hair) {
      case 'bun':
        return '<circle cx="50" cy="16" r="9" fill="' + h + '" stroke="' + LINE + '" stroke-width="2"/>' +
               '<path d="M28 38 a22 20 0 0 1 44 0 l-4 -2 a18 16 0 0 0 -36 0 z" fill="' + h + '"/>';
      case 'beanie':
        return '<path d="M27 36 a23 21 0 0 1 46 0 z" fill="' + h + '"/>' +
               '<rect x="26" y="32" width="48" height="8" rx="4" fill="' + h + '" stroke="' + LINE + '" stroke-width="1.5"/>' +
               '<circle cx="50" cy="14" r="4" fill="' + h + '" stroke="' + LINE + '" stroke-width="1.5"/>';
      case 'pony':
        return '<path d="M28 40 a22 22 0 0 1 44 0 l-5 -3 a17 17 0 0 0 -34 0 z" fill="' + h + '"/>' +
               '<path d="M68 30 q12 4 8 26 q-3 14 -8 16 q4 -16 0 -26 q-2 -8 -6 -12 z" fill="' + h + '"/>';
      case 'short':
        return '<path d="M28 38 a22 20 0 0 1 44 0 l-6 -2 a16 14 0 0 0 -32 0 z" fill="' + h + '"/>';
      case 'pigtails':
        return '<path d="M30 38 a20 18 0 0 1 40 0 l-5 -2 a15 13 0 0 0 -30 0 z" fill="' + h + '"/>' +
               '<circle cx="24" cy="42" r="7" fill="' + h + '" stroke="' + LINE + '" stroke-width="1.5"/>' +
               '<circle cx="76" cy="42" r="7" fill="' + h + '" stroke="' + LINE + '" stroke-width="1.5"/>';
      case 'curly':
        return '<circle cx="36" cy="26" r="8" fill="' + h + '"/><circle cx="50" cy="20" r="9" fill="' + h + '"/>' +
               '<circle cx="64" cy="26" r="8" fill="' + h + '"/><circle cx="29" cy="36" r="6" fill="' + h + '"/>' +
               '<circle cx="71" cy="36" r="6" fill="' + h + '"/>';
      case 'flower':
        return '<path d="M28 40 a22 21 0 0 1 44 0 l-4 -2 a18 17 0 0 0 -36 0 z" fill="' + h + '"/>' +
               '<g transform="translate(68,24)"><circle r="3.4" cx="0" cy="-4" fill="#f48fb1"/>' +
               '<circle r="3.4" cx="4" cy="2" fill="#f48fb1"/><circle r="3.4" cx="-4" cy="2" fill="#f48fb1"/>' +
               '<circle r="2.4" fill="#ffd54f"/></g>';
      case 'bald':
        return '<ellipse cx="42" cy="22" rx="6" ry="3" fill="#ffffff" opacity="0.35"/>';
      default:
        return '';
    }
  }

  function accessorySvg(c) {
    switch (c.accessory) {
      case 'glasses':
        return '<g stroke="#5d4037" stroke-width="2" fill="none">' +
               '<circle cx="41" cy="42" r="7"/><circle cx="59" cy="42" r="7"/><line x1="48" y1="42" x2="52" y2="42"/></g>';
      case 'headphones':
        return '<path d="M28 40 a22 22 0 0 1 44 0" stroke="#544a6b" stroke-width="4" fill="none"/>' +
               '<rect x="24" y="38" width="8" height="13" rx="4" fill="#f2a3b3" stroke="' + LINE + '" stroke-width="1.5"/>' +
               '<rect x="68" y="38" width="8" height="13" rx="4" fill="#f2a3b3" stroke="' + LINE + '" stroke-width="1.5"/>';
      case 'mustache':
        return '<path d="M40 53 q5 -4 10 0 q5 -4 10 0 q-5 6 -10 3 q-5 3 -10 -3z" fill="#5d4037"/>';
      case 'scarf':
        return '<path d="M34 66 q16 9 32 0 l-2 8 q-14 7 -28 0 z" fill="#e08e7a" stroke="' + LINE + '" stroke-width="1.5"/>' +
               '<rect x="56" y="70" width="9" height="16" rx="4" fill="#e08e7a" stroke="' + LINE + '" stroke-width="1.5"/>';
      case 'freckles':
        return '<g fill="#c98e5a"><circle cx="36" cy="48" r="1.2"/><circle cx="40" cy="50" r="1.2"/>' +
               '<circle cx="64" cy="48" r="1.2"/><circle cx="60" cy="50" r="1.2"/></g>';
      case 'phone':
        return '<rect x="73" y="74" width="11" height="18" rx="2.5" fill="#544a6b" transform="rotate(8 78 82)" stroke="' + LINE + '" stroke-width="1.5"/>' +
               '<rect x="75" y="77" width="7" height="11" rx="1" fill="#bfe3f5" transform="rotate(8 78 82)"/>';
      default:
        return '';
    }
  }

  function faceSvg(mood) {
    var eyes, brows = '', mouth, extra = '';
    if (mood === 'angry') {
      eyes = '<circle cx="42" cy="43" r="2.6" fill="#33231a"/><circle cx="58" cy="43" r="2.6" fill="#33231a"/>';
      brows = '<line x1="37" y1="36" x2="46" y2="40" stroke="#33231a" stroke-width="2.4" stroke-linecap="round"/>' +
              '<line x1="63" y1="36" x2="54" y2="40" stroke="#33231a" stroke-width="2.4" stroke-linecap="round"/>';
      mouth = '<path d="M42 58 q8 -7 16 0" stroke="#33231a" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
      extra = '<circle cx="34" cy="50" r="4" fill="#e57373" opacity="0.6"/><circle cx="66" cy="50" r="4" fill="#e57373" opacity="0.6"/>';
    } else if (mood === 'annoyed') {
      eyes = '<circle cx="42" cy="43" r="2.6" fill="#33231a"/><circle cx="58" cy="43" r="2.6" fill="#33231a"/>';
      brows = '<line x1="38" y1="37" x2="46" y2="38.5" stroke="#33231a" stroke-width="2.2" stroke-linecap="round"/>' +
              '<line x1="62" y1="37" x2="54" y2="38.5" stroke="#33231a" stroke-width="2.2" stroke-linecap="round"/>';
      mouth = '<path d="M43 57 q7 -3.5 14 0" stroke="#33231a" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    } else if (mood === 'neutral') {
      eyes = '<circle cx="42" cy="43" r="2.8" fill="#33231a"/><circle cx="58" cy="43" r="2.8" fill="#33231a"/>';
      mouth = '<line x1="44" y1="57" x2="56" y2="57" stroke="#33231a" stroke-width="2.4" stroke-linecap="round"/>';
    } else {
      eyes = '<circle cx="42" cy="43" r="2.8" fill="#33231a"/><circle cx="58" cy="43" r="2.8" fill="#33231a"/>';
      mouth = '<path d="M42 55 q8 8 16 0" stroke="#33231a" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
      extra = '<circle cx="34" cy="50" r="4" fill="#f8b4a0" opacity="0.55"/><circle cx="66" cy="50" r="4" fill="#f8b4a0" opacity="0.55"/>';
    }
    return brows + eyes + mouth + extra;
  }

  function customer(charId, mood) {
    var c = CG.data.CHARACTERS[charId];
    return '<svg viewBox="0 0 100 110" class="cust-svg" aria-label="' + c.name + '">' +
      '<path d="M26 110 v-22 a24 22 0 0 1 48 0 v22 z" fill="' + c.top + '" stroke="' + LINE + '" stroke-width="2"/>' +
      '<circle cx="50" cy="86" r="3" fill="#fff" opacity="0.55"/>' +
      '<circle cx="50" cy="44" r="22" fill="' + c.skin + '" stroke="' + LINE + '" stroke-width="2"/>' +
      hairSvg(c) + faceSvg(mood || 'happy') + accessorySvg(c) +
      '</svg>';
  }

  function patienceRing(pct, color) {
    var r = 17, circ = 2 * Math.PI * r;
    var off = circ * (1 - pct / 100);
    return '<svg viewBox="0 0 40 40" class="ring-svg">' +
      '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="#00000022" stroke-width="4"/>' +
      '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="4" ' +
      'stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" ' +
      'transform="rotate(-90 20 20)"/></svg>';
  }

  /* ================= scene primitives ================= */
  /* scenes are 360x240; counter top edge sits at y=176 */

  function wall(color, stripe) {
    var stripes = '', x;
    for (x = 0; x < 380; x += 36) {
      stripes += '<rect x="' + x + '" y="0" width="18" height="240" fill="' + stripe + '"/>';
    }
    return '<rect x="-5" y="-5" width="370" height="250" fill="' + color + '"/>' + stripes +
      // wainscot line
      '<rect x="-5" y="118" width="370" height="6" fill="#ffffff88"/>';
  }

  function bunting(y) {
    var cols = ['#f2a3b3', '#bfe0c0', '#f5c64f', '#aed5e8'];
    var out = '<path d="M-5 ' + (y - 6) + ' q90 14 185 0 q95 14 185 0" fill="none" stroke="' + LINE + '" stroke-width="2.5"/>';
    var i, x;
    for (i = 0; i < 9; i++) {
      x = 8 + i * 42;
      var dy = 6 * Math.sin((i / 8) * Math.PI) + (i % 2 ? 4 : 0);
      out += '<path d="M' + x + ' ' + (y - 4 + dy) + ' l16 0 l-8 18 z" fill="' + cols[i % 4] + '" stroke="' + LINE + '" stroke-width="2"/>';
    }
    return out;
  }

  function counterFront() {
    var planks = '', x;
    for (x = 30; x < 360; x += 66) {
      planks += '<line x1="' + x + '" y1="196" x2="' + x + '" y2="240" stroke="#9c7355" stroke-width="2.5"/>';
    }
    return '<rect x="-6" y="188" width="372" height="58" fill="#b58e6f" stroke="' + LINE + '" stroke-width="3"/>' + planks +
      '<rect x="-6" y="174" width="372" height="16" rx="5" fill="#d9b078" stroke="' + LINE + '" stroke-width="3"/>';
  }

  function shelf(x, y, w) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="9" rx="3" fill="#c89a6a" stroke="' + LINE + '" stroke-width="2.5"/>' +
      '<path d="M' + (x + 8) + ' ' + (y + 9) + ' l7 12 h-7 z" fill="#a87c52" stroke="' + LINE + '" stroke-width="2"/>' +
      '<path d="M' + (x + w - 15) + ' ' + (y + 9) + ' l7 12 h-7 z" fill="#a87c52" stroke="' + LINE + '" stroke-width="2"/>';
  }

  function windowFrame(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<rect x="0" y="0" width="86" height="92" rx="8" fill="#b3acdf" stroke="' + LINE + '" stroke-width="3.5"/>' +
      '<path d="M14 70 l11 -14 8 9 12 -18 14 18 v15 h-45 z" fill="#9890cf" opacity="0.8"/>' +
      '<path d="M20 22 l2.4 5.6 5.6 0 -4.5 3.6 1.4 5.8 -4.9 -3.4 -4.9 3.4 1.4 -5.8 -4.5 -3.6 5.6 0 z" fill="#fffaec" opacity="0.9"/>' +
      '<circle cx="62" cy="24" r="9" fill="#fffaec" opacity="0.9"/>' +
      '<line x1="43" y1="2" x2="43" y2="90" stroke="' + LINE + '" stroke-width="3"/>' +
      '<line x1="2" y1="46" x2="84" y2="46" stroke="' + LINE + '" stroke-width="3"/>' +
      '<path d="M2 0 q10 30 0 60 l-8 0 0 -60 z" fill="#f2a3b3" stroke="' + LINE + '" stroke-width="2.5"/>' +
      '<path d="M84 0 q-10 30 0 60 l8 0 0 -60 z" fill="#f2a3b3" stroke="' + LINE + '" stroke-width="2.5"/>' +
      '</g>';
  }

  function plant(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' +
      '<path d="M0 0 q-3 -16 -12 -22 M0 0 q0 -18 4 -26 M0 0 q5 -14 14 -18" stroke="#7fa86b" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="-12" cy="-23" rx="5" ry="7" fill="#9bc185" stroke="#6c9159" stroke-width="2" transform="rotate(-30 -12 -23)"/>' +
      '<ellipse cx="4" cy="-27" rx="5" ry="8" fill="#9bc185" stroke="#6c9159" stroke-width="2"/>' +
      '<ellipse cx="14" cy="-19" rx="5" ry="7" fill="#9bc185" stroke="#6c9159" stroke-width="2" transform="rotate(30 14 -19)"/>' +
      '<path d="M-11 0 h22 l-3.5 14 h-15 z" fill="#e2987a" stroke="' + LINE + '" stroke-width="2.5"/>' +
      '</g>';
  }

  function cupStack(x, y, n, color) {
    var out = '', i;
    for (i = 0; i < n; i++) {
      var yy = y - i * 10;
      out += '<path d="M' + x + ' ' + yy + ' h26 l-3.5 9 h-19 z" fill="' + (color || '#fffaec') + '" stroke="' + LINE + '" stroke-width="2.2"/>';
    }
    return out;
  }

  function jar(x, y, fillColor, frac, label) {
    var h = 30, inner = Math.max(0, Math.min(1, frac)) * (h - 6);
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<rect x="0" y="0" width="24" height="' + h + '" rx="6" fill="#ffffffd0" stroke="' + LINE + '" stroke-width="2.4"/>' +
      '<rect x="2.5" y="' + (h - 3 - inner) + '" width="19" height="' + inner + '" rx="4" fill="' + fillColor + '"/>' +
      '<rect x="3" y="-5" width="18" height="7" rx="3" fill="#c89a6a" stroke="' + LINE + '" stroke-width="2"/>' +
      (label ? '<rect x="3" y="11" width="18" height="9" rx="2.5" fill="#fffaec" stroke="' + LINE + '" stroke-width="1.4"/>' +
        '<text x="12" y="18" text-anchor="middle" font-size="6.5" font-weight="bold" fill="' + LINE + '">' + label + '</text>' : '') +
      '</g>';
  }

  function sack(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<path d="M4 8 q-7 18 -3 30 q12 7 30 0 q4 -12 -3 -30 z" fill="#dcc49a" stroke="' + LINE + '" stroke-width="2.6"/>' +
      '<path d="M4 8 q14 6 24 0 l3 -7 q-15 -5 -30 0 z" fill="#cdb185" stroke="' + LINE + '" stroke-width="2.6"/>' +
      '<ellipse cx="16" cy="24" rx="4.5" ry="3" fill="#8d5a2b" transform="rotate(-20 16 24)"/>' +
      '<ellipse cx="24" cy="29" rx="4.5" ry="3" fill="#8d5a2b" transform="rotate(25 24 29)"/>' +
      '</g>';
  }

  function woodSign(x, y, w, text, small) {
    var h = small ? 24 : 30;
    var cx = x + w / 2;
    return '<line x1="' + (x + 12) + '" y1="0" x2="' + (x + 12) + '" y2="' + y + '" stroke="' + LINE + '" stroke-width="2.5"/>' +
      '<line x1="' + (x + w - 12) + '" y1="0" x2="' + (x + w - 12) + '" y2="' + y + '" stroke="' + LINE + '" stroke-width="2.5"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="#c89a6a" stroke="' + LINE + '" stroke-width="3"/>' +
      '<rect x="' + (x + 4) + '" y="' + (y + 4) + '" width="' + (w - 8) + '" height="' + (h - 8) + '" rx="5" fill="none" stroke="#fff8e9" stroke-width="1.8" opacity="0.7"/>' +
      '<text x="' + cx + '" y="' + (y + h / 2 + (small ? 4 : 5)) + '" text-anchor="middle" font-size="' + (small ? 11 : 13) + '" font-weight="bold" fill="#fff8e9" font-family="inherit">' + text + '</text>';
  }

  function sceneOpen(cls) {
    return '<svg viewBox="0 0 360 240" class="scene-svg ' + (cls || '') + '" preserveAspectRatio="xMidYMid slice">';
  }

  /* ================= station scenes ================= */

  function sceneOrderBack() {
    return sceneOpen('scene-back') +
      wall('#f8e8b0', '#fdf3cd') +
      windowFrame(18, 42) +
      bunting(20) +
      woodSign(208, 34, 134, 'Crackle &amp; Pour') +
      shelf(122, 96, 74) +
      plant(140, 96, 0.7) +
      cupStack(160, 95, 2, '#f2a3b3') +
      plant(330, 174, 1.05) +
      '</svg>';
  }

  function sceneOrderFront() {
    return sceneOpen('scene-front-svg') +
      counterFront() +
      // till + tip jar + a little menu card on the counter
      '<rect x="18" y="142" width="52" height="34" rx="6" fill="#9eb585" stroke="' + LINE + '" stroke-width="3"/>' +
      '<rect x="26" y="150" width="24" height="12" rx="3" fill="#fffaec" stroke="' + LINE + '" stroke-width="2"/>' +
      '<circle cx="60" cy="156" r="4" fill="#f2a3b3" stroke="' + LINE + '" stroke-width="1.8"/>' +
      jar(300, 146, '#f5c64f', 0.4, 'tip') +
      '<rect x="84" y="150" width="30" height="26" rx="4" fill="#fffaec" stroke="' + LINE + '" stroke-width="2.4" transform="rotate(-6 99 163)"/>' +
      '<line x1="90" y1="158" x2="106" y2="156" stroke="#d8c5a4" stroke-width="2"/>' +
      '<line x1="90" y1="164" x2="106" y2="162" stroke="#d8c5a4" stroke-width="2"/>' +
      '</svg>';
  }

  function sceneRoast() {
    return sceneOpen('') +
      wall('#f3d9c4', '#f9e6d4') +
      bunting(18) +
      shelf(150, 76, 134) +
      '<g id="roast-jars"></g>' +
      sack(186, 134) + sack(226, 142) +
      // drum roaster on the counter
      '<g transform="translate(18,52) scale(0.78)">' +
      '<rect x="20" y="120" width="160" height="40" rx="10" fill="#b58e6f" stroke="' + LINE + '" stroke-width="3"/>' +
      '<rect x="30" y="20" width="140" height="108" rx="18" fill="#9eb585" stroke="' + LINE + '" stroke-width="3"/>' +
      '<rect x="38" y="28" width="124" height="14" rx="7" fill="#fffaec" stroke="' + LINE + '" stroke-width="2"/>' +
      '<circle cx="100" cy="76" r="38" fill="#fffaec" stroke="' + LINE + '" stroke-width="3"/>' +
      '<circle cx="100" cy="76" r="31" fill="#5e4434"/>' +
      '<g id="roast-beans"></g>' +
      '<circle cx="100" cy="76" r="31" fill="none" stroke="' + LINE + '" stroke-width="2.5"/>' +
      '<rect x="44" y="50" width="22" height="11" rx="5.5" fill="#f2a3b3" stroke="' + LINE + '" stroke-width="2"/>' +
      '<circle cx="152" cy="56" r="8" fill="#f5c64f" stroke="' + LINE + '" stroke-width="2"/>' +
      '<line x1="152" y1="56" x2="156" y2="51" stroke="' + LINE + '" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M62 130 h76 l-8 18 h-60 z" fill="#8a6248" stroke="' + LINE + '" stroke-width="2.5"/>' +
      '<g id="roast-smoke" opacity="0"><circle cx="100" cy="10" r="7" fill="#cfc8e8" opacity="0.8"/>' +
      '<circle cx="112" cy="2" r="9" fill="#dfd9f2" opacity="0.7"/><circle cx="90" cy="0" r="6" fill="#dfd9f2" opacity="0.6"/></g>' +
      '</g>' +
      counterFront() +
      cupStack(170, 165, 1) +
      '</svg>';
  }

  function sceneBrew(mode) {
    var machine;
    if (mode === 'pourover') {
      machine =
        // gooseneck kettle on the left
        '<g transform="translate(52,120)">' +
        '<path d="M8 12 h44 l-6 44 h-32 z" fill="#9eb585" stroke="' + LINE + '" stroke-width="3"/>' +
        '<path d="M8 18 q-14 2 -10 18 l6 14" fill="none" stroke="' + LINE + '" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M8 18 q-14 2 -10 18 l6 14" fill="none" stroke="#9eb585" stroke-width="3.5" stroke-linecap="round"/>' +
        '<rect x="22" y="0" width="18" height="12" rx="4" fill="#b9cba6" stroke="' + LINE + '" stroke-width="2.4"/>' +
        '</g>' +
        // dripper + server on a wooden stand
        '<g transform="translate(116,28)">' +
        '<rect x="14" y="0" width="14" height="148" rx="6" fill="#c89a6a" stroke="' + LINE + '" stroke-width="3"/>' +
        '<rect x="14" y="38" width="92" height="12" rx="6" fill="#c89a6a" stroke="' + LINE + '" stroke-width="3"/>' +
        '<path d="M44 8 h60 l-18 32 h-24 z" fill="#ffffffd8" stroke="' + LINE + '" stroke-width="3"/>' +
        '<path d="M52 13 h44 l-13 23 h-18 z" fill="#c8a165" stroke="' + LINE + '" stroke-width="1.6"/>' +
        '<g id="pour-stream" opacity="0"><rect x="70" y="-18" width="5" height="24" rx="2.5" fill="#aed5e8"/></g>' +
        '<rect x="64" y="40" width="20" height="10" rx="3" fill="#b58e6f" stroke="' + LINE + '" stroke-width="2"/>' +
        '<g transform="translate(38,79)">' +
        '<path d="M0 0 h72 l-7 64 a6 6 0 0 1 -6 5 h-46 a6 6 0 0 1 -6 -5 z" fill="#ffffffd8" stroke="' + LINE + '" stroke-width="3"/>' +
        '<clipPath id="serverclip"><path d="M2 2 h68 l-7 62 a5 5 0 0 1 -5 3 h-44 a5 5 0 0 1 -5 -3 z"/></clipPath>' +
        '<g clip-path="url(#serverclip)"><rect id="pour-fill" x="0" y="69" width="72" height="70" fill="#7a5230"/></g>' +
        '<line id="pour-target" x1="-8" y1="30" x2="80" y2="30" stroke="#e2798f" stroke-width="2.5" stroke-dasharray="4 3"/>' +
        '</g></g>';
    } else {
      machine =
        // big sage espresso machine, reference-style
        '<g transform="translate(96,18)">' +
        cupStack(18, 22, 2) + cupStack(118, 22, 2) +
        '<rect x="0" y="24" width="168" height="70" rx="16" fill="#9eb585" stroke="' + LINE + '" stroke-width="3.2"/>' +
        '<rect x="9" y="33" width="150" height="13" rx="6.5" fill="#b9cba6" stroke="' + LINE + '" stroke-width="2"/>' +
        '<rect x="30" y="52" width="108" height="34" rx="11" fill="#fffaec" stroke="' + LINE + '" stroke-width="2.6"/>' +
        '<circle cx="56" cy="69" r="8" fill="#f2a3b3" stroke="' + LINE + '" stroke-width="2"/>' +
        '<line x1="56" y1="69" x2="61" y2="63" stroke="' + LINE + '" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="112" cy="69" r="8" fill="#f5c64f" stroke="' + LINE + '" stroke-width="2"/>' +
        '<line x1="112" y1="69" x2="107" y2="63" stroke="' + LINE + '" stroke-width="2" stroke-linecap="round"/>' +
        '<rect x="80" y="62" width="10" height="14" rx="3" fill="#bfe0c0" stroke="' + LINE + '" stroke-width="2"/>' +
        // body columns down to the counter + drip tray
        '<rect x="2" y="90" width="34" height="72" rx="9" fill="#9eb585" stroke="' + LINE + '" stroke-width="3"/>' +
        '<rect x="132" y="90" width="34" height="72" rx="9" fill="#9eb585" stroke="' + LINE + '" stroke-width="3"/>' +
        '<rect x="30" y="150" width="108" height="11" rx="5" fill="#b9cba6" stroke="' + LINE + '" stroke-width="2.2"/>' +
        // group head + portafilter
        '<rect x="66" y="92" width="36" height="14" rx="5" fill="#8a6248" stroke="' + LINE + '" stroke-width="2.6"/>' +
        '<path d="M78 106 h12 v8 h-12 z" fill="' + LINE + '"/>' +
        '<rect x="100" y="94" width="48" height="9" rx="4.5" fill="#b58e6f" stroke="' + LINE + '" stroke-width="2.2"/>' +
        '<g id="brew-stream" opacity="0"><rect x="81" y="112" width="6" height="28" rx="3" fill="#6f4e37"/></g>' +
        // steam lever on the side
        '<rect x="160" y="48" width="9" height="48" rx="4.5" fill="#b58e6f" stroke="' + LINE + '" stroke-width="2.2" transform="rotate(16 164 48)"/>' +
        '</g>' +
        // shot glass under the spout (ids + coords used by st-brew)
        '<g id="brew-glass" transform="translate(158,128)">' +
        '<path d="M0 0 h44 l-4 44 a5 5 0 0 1 -5 4 h-26 a5 5 0 0 1 -5 -4 z" fill="#ffffffd8" stroke="' + LINE + '" stroke-width="2.6"/>' +
        '<clipPath id="glassclip"><path d="M1 1 h42 l-4 43 a4 4 0 0 1 -4 3 h-26 a4 4 0 0 1 -4 -3 z"/></clipPath>' +
        '<g clip-path="url(#glassclip)"><rect id="brew-fill" x="0" y="48" width="44" height="48" fill="#6f4e37"/></g>' +
        '<line id="brew-target" x1="-6" y1="18" x2="50" y2="18" stroke="#e2798f" stroke-width="2.5" stroke-dasharray="4 3"/>' +
        '</g>' +
        // grinder on the right with bean hopper
        '<g transform="translate(286,96)">' +
        '<rect x="0" y="26" width="44" height="54" rx="9" fill="#e2987a" stroke="' + LINE + '" stroke-width="2.8"/>' +
        '<path d="M8 26 h28 l-4 -18 h-20 z" fill="#ffffffc8" stroke="' + LINE + '" stroke-width="2.4"/>' +
        '<ellipse cx="17" cy="16" rx="3.5" ry="2.4" fill="#8d5a2b"/><ellipse cx="26" cy="13" rx="3.5" ry="2.4" fill="#8d5a2b"/>' +
        '<circle cx="22" cy="48" r="6" fill="#fffaec" stroke="' + LINE + '" stroke-width="2"/>' +
        '</g>';
    }
    return sceneOpen('') +
      wall('#fbe3cf', '#fdf0e2') +
      // backsplash tiles behind the machine
      '<g opacity="0.55"><rect x="60" y="56" width="240" height="62" rx="8" fill="#fffaf0"/>' +
      '<path d="M60 87 h240 M120 56 v62 M180 56 v62 M240 56 v62" stroke="#ecd9c0" stroke-width="2"/></g>' +
      bunting(16) +
      shelf(12, 64, 70) + jar(22, 32, '#8d5a2b', 0.7) + jar(52, 38, '#c69c6d', 0.5) +
      machine +
      counterFront() +
      '</svg>';
  }

  function sceneMilk() {
    return sceneOpen('') +
      wall('#e8eedd', '#f2f6ea') +
      bunting(16) +
      // little fridge in the back
      '<g transform="translate(22,64)">' +
      '<rect x="0" y="0" width="64" height="112" rx="10" fill="#fffaf0" stroke="' + LINE + '" stroke-width="3"/>' +
      '<line x1="4" y1="44" x2="60" y2="44" stroke="' + LINE + '" stroke-width="2.5"/>' +
      '<rect x="48" y="14" width="6" height="20" rx="3" fill="#c8b69a"/>' +
      '<rect x="48" y="54" width="6" height="26" rx="3" fill="#c8b69a"/>' +
      '<rect x="10" y="12" width="22" height="24" rx="4" fill="#f2a3b3" stroke="' + LINE + '" stroke-width="2"/>' +
      '<path d="M15 22 q6 -7 12 0 q-6 8 -12 0" fill="#fffaec"/>' +
      '</g>' +
      shelf(168, 60, 96) +
      // milk bottles on the shelf
      '<g transform="translate(178,28)">' +
      '<path d="M4 12 h14 l2 8 v12 h-18 v-12 z" fill="#ffffffe8" stroke="' + LINE + '" stroke-width="2.2"/>' +
      '<rect x="7" y="6" width="8" height="7" rx="2" fill="#aed5e8" stroke="' + LINE + '" stroke-width="1.8"/>' +
      '<path d="M34 12 h14 l2 8 v12 h-18 v-12 z" fill="#ffffffe8" stroke="' + LINE + '" stroke-width="2.2"/>' +
      '<rect x="37" y="6" width="8" height="7" rx="2" fill="#f2a3b3" stroke="' + LINE + '" stroke-width="1.8"/>' +
      '</g>' +
      // steam machine + wand
      '<g transform="translate(118,42)">' +
      '<rect x="0" y="0" width="108" height="52" rx="14" fill="#9eb585" stroke="' + LINE + '" stroke-width="3"/>' +
      '<circle cx="28" cy="26" r="9" fill="#f2a3b3" stroke="' + LINE + '" stroke-width="2"/>' +
      '<line x1="28" y1="26" x2="33" y2="20" stroke="' + LINE + '" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="62" y="18" width="30" height="14" rx="5" fill="#fffaec" stroke="' + LINE + '" stroke-width="2"/>' +
      '<rect x="40" y="48" width="10" height="44" rx="5" fill="#b9cba6" stroke="' + LINE + '" stroke-width="2.2" transform="rotate(-14 45 48)"/>' +
      '<circle cx="33" cy="96" r="4.5" fill="' + LINE + '"/>' +
      '<g id="milk-steam" opacity="0">' +
      '<path d="M36 100 q-6 12 2 22 q6 10 -2 18" stroke="#ffffffcc" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M48 102 q-4 10 2 16" stroke="#ffffff99" stroke-width="4" fill="none" stroke-linecap="round"/></g>' +
      '</g>' +
      // pitcher on the counter under the wand (ids used by st-milk)
      '<g id="milk-pitcher" transform="translate(122,120)">' +
      '<path d="M0 0 h56 l-7 56 h-42 z" fill="#fffaec" stroke="' + LINE + '" stroke-width="3"/>' +
      '<path d="M56 4 l16 8 -17 6" fill="#fffaec" stroke="' + LINE + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<clipPath id="pitchclip"><path d="M2 2 h52 l-6.5 52 h-39 z"/></clipPath>' +
      '<g clip-path="url(#pitchclip)"><rect id="milk-fill" x="0" y="22" width="56" height="40" fill="#fdfdfd"/>' +
      '<rect id="milk-foam" x="0" y="16" width="56" height="8" fill="#fffef5" opacity="0.95"/></g>' +
      '<path d="M16 32 q12 -8 24 0" fill="none" stroke="#f2a3b3" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>' +
      '</g>' +
      counterFront() +
      cupStack(216, 166, 2) +
      '</svg>';
  }

  function sceneBuild() {
    return sceneOpen('') +
      wall('#fce4dc', '#fdf0ea') +
      bunting(16) +
      woodSign(232, 30, 112, 'Serve bar', true) +
      shelf(16, 70, 82) + cupStack(26, 68, 2) + plant(80, 70, 0.6) +
      counterFront() +
      // spotlight mat under the drink
      '<ellipse cx="180" cy="182" rx="64" ry="8" fill="#ffffff" opacity="0.55"/>' +
      '<g id="cup-host" transform="translate(130,86)"></g>' +
      jar(312, 146, '#f2a3b3', 0.6) +
      '</svg>';
  }

  /* ================= layered drink art ================= */
  /* tall glass: interior from y=26 to y=92, drawn in a 100x110 box */

  function drinkGroup(ticket, onlyDone) {
    var d = CG.data;
    var layers = [];
    var has = function (kind, syr) {
      return ticket.components.some(function (c) {
        if (syr ? c.syrup !== syr && !(syr === '*' && c.kind === 'pump' && c.syrup !== 'chocolate') : c.kind !== kind) return false;
        return onlyDone ? c.done : true;
      });
    };
    // syrup tint at the bottom
    ticket.components.forEach(function (c) {
      if (c.kind === 'pump' && c.syrup !== 'chocolate' && (!onlyDone || c.done)) {
        layers.push({ h: 9, color: d.SYRUPS[c.syrup] ? shade(d.SYRUPS[c.syrup].color) : '#f2a3b3' });
      }
    });
    if (has('pump', 'chocolate')) layers.push({ h: 9, color: '#5a3219' });
    if (has('holding-brew')) layers.push({ h: 22, color: '#6f4e37' });
    if (has('tap')) layers.push({ h: 14, color: '#8a6248' });
    if (has('holding-milk')) layers.push({ h: 24, color: '#fbf3e4' });

    var whip = ticket.components.some(function (c) { return c.kind === 'ring' && (!onlyDone || c.done); });
    var dust = null;
    ticket.components.forEach(function (c) {
      if (c.kind === 'shake' && (!onlyDone || c.done)) dust = d.TOPPINGS[c.topping].color;
    });

    var s = { S: 0.86, M: 1, L: 1.14 }[ticket.size || 'M'];
    var out = '<g transform="translate(50,94) scale(' + s + ') translate(-50,-94)">';
    // glass
    out += '<path d="M31 24 h38 l-4 66 a5 5 0 0 1 -5 4 h-20 a5 5 0 0 1 -5 -4 z" fill="#ffffffd0" stroke="' + LINE + '" stroke-width="3"/>';
    // liquid layers from the bottom up, clipped
    out += '<clipPath id="drinkclip"><path d="M32.5 25.5 h35 l-3.9 64 a4 4 0 0 1 -4 3.2 h-19 a4 4 0 0 1 -4 -3.2 z"/></clipPath>';
    out += '<g clip-path="url(#drinkclip)">';
    var y = 92;
    layers.forEach(function (l) {
      y -= l.h;
      out += '<rect x="28" y="' + y + '" width="44" height="' + (l.h + 1) + '" fill="' + l.color + '"/>';
    });
    if (layers.length) out += '<rect x="28" y="' + y + '" width="44" height="2.5" fill="#ffffff" opacity="0.45"/>';
    out += '</g>';
    // glass shine
    out += '<path d="M37 32 l-2.5 48" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.55"/>';
    if (whip) {
      out += '<g fill="#fffef7" stroke="' + LINE + '" stroke-width="2">' +
        '<circle cx="50" cy="20" r="9.5"/><circle cx="39" cy="23" r="7"/><circle cx="61" cy="23" r="7"/><circle cx="50" cy="12" r="6"/></g>';
    }
    if (dust) {
      var dy = whip ? 14 : 24;
      out += '<g fill="' + dust + '"><circle cx="44" cy="' + dy + '" r="1.5"/><circle cx="52" cy="' + (dy - 2) + '" r="1.5"/>' +
        '<circle cx="58" cy="' + (dy + 1) + '" r="1.5"/><circle cx="48" cy="' + (dy + 3) + '" r="1.2"/></g>';
    }
    return out + '</g>';
  }

  function shade(hex) { return hex; }

  function drink(ticket, onlyDone) {
    return '<svg viewBox="0 0 100 110" class="drink-svg">' + drinkGroup(ticket, onlyDone) + '</svg>';
  }

  /* recipe-card style ingredient tag pills; works for orders and tickets */
  function tagPills(o) {
    var d = CG.data;
    var r = d.RECIPES[o.recipe];
    var pills = [];
    var pill = function (label, bg, light) {
      pills.push('<span class="tagpill' + (light ? ' light' : '') + '" style="--pill:' + bg + '">' + label + '</span>');
    };
    pill(d.SIZES[o.size].name + ' ' + r.name, '#f2a3b3');
    if (o.roast) pill(d.ROASTS[o.roast].name + ' roast', d.ROASTS[o.roast].color);
    if (r.brew === 'espresso') pill('Espresso', '#8a6248');
    if (r.brew === 'pourover') pill('Pour-over', '#a9744f');
    if (r.water) pill('Hot water', '#aed5e8', true);
    if (r.milk) pill('Steamed milk', '#fbf3e4', true);
    if (r.choc) pill(r.choc + '× chocolate', '#5a3219');
    (o.extras || []).forEach(function (e) {
      pill(e.pumps + '× ' + d.SYRUPS[e.syrup].name, d.SYRUPS[e.syrup].color, true);
    });
    (o.toppings || []).forEach(function (t) {
      pill(d.TOPPINGS[t].name, '#f5c64f', true);
    });
    return '<span class="tagpills">' + pills.join('') + '</span>';
  }

  /* roast inventory jars rendered into the roast scene */
  function roastJars(unlockedRoasts, inv, quality) {
    var d = CG.data;
    var out = '', i;
    for (i = 0; i < unlockedRoasts.length; i++) {
      var r = unlockedRoasts[i];
      var frac = inv[r] / d.ROAST_CAP;
      out += '<g transform="translate(' + (158 + i * 42) + ',38) scale(1.18)">' +
        jar(0, 0, d.ROASTS[r].color, frac, String(inv[r])) + '</g>';
    }
    return out;
  }

  /* ================= icons ================= */

  function icon(name) {
    var inner = '';
    switch (name) {
      case 'order':
        inner = '<path d="M6 8 a4 4 0 0 1 4-4 h20 a4 4 0 0 1 4 4 v12 a4 4 0 0 1 -4 4 h-12 l-7 6 v-6 h-1 a4 4 0 0 1 -4 -4 z" fill="currentColor"/>' +
                '<circle cx="14" cy="14" r="2" fill="#fff"/><circle cx="20" cy="14" r="2" fill="#fff"/><circle cx="26" cy="14" r="2" fill="#fff"/>';
        break;
      case 'roast':
        inner = '<ellipse cx="20" cy="20" rx="12" ry="15" fill="currentColor"/>' +
                '<path d="M20 7 q-5 13 0 26" stroke="#fff" stroke-width="2.5" fill="none"/>';
        break;
      case 'brew':
        inner = '<path d="M8 12 h20 l-3 18 a3 3 0 0 1 -3 2 h-8 a3 3 0 0 1 -3 -2 z" fill="currentColor"/>' +
                '<path d="M28 15 q7 1 6 7 t-8 5" fill="none" stroke="currentColor" stroke-width="3"/>' +
                '<path d="M13 8 q1 -3 0 -5 M19 8 q1 -3 0 -5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>';
        break;
      case 'milk':
        inner = '<path d="M10 12 h16 l-3 22 h-10 z" fill="currentColor"/>' +
                '<path d="M26 14 l8 4 -9 3" fill="currentColor"/>' +
                '<path d="M14 8 q2 -4 0 -6 M20 8 q2 -4 0 -6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>';
        break;
      case 'build':
        inner = '<path d="M9 14 h22 l-3 18 a3 3 0 0 1 -3 2 h-10 a3 3 0 0 1 -3 -2 z" fill="currentColor"/>' +
                '<circle cx="15" cy="10" r="4" fill="currentColor"/><circle cx="21" cy="7" r="4.5" fill="currentColor"/><circle cx="27" cy="10" r="4" fill="currentColor"/>';
        break;
      case 'star':
        inner = '<path d="M20 3 l5 11 12 1.5 -9 8 2.7 12 -10.7 -6.3 -10.7 6.3 2.7 -12 -9 -8 12 -1.5 z" fill="currentColor"/>';
        break;
      case 'coin':
        inner = '<circle cx="20" cy="20" r="15" fill="currentColor"/><text x="20" y="26" text-anchor="middle" font-size="17" font-weight="bold" fill="#fff">$</text>';
        break;
      case 'pause':
        inner = '<rect x="10" y="8" width="7" height="24" rx="2.5" fill="currentColor"/><rect x="23" y="8" width="7" height="24" rx="2.5" fill="currentColor"/>';
        break;
      case 'sound':
        inner = '<path d="M8 15 h6 l8 -7 v24 l-8 -7 h-6 z" fill="currentColor"/>' +
                '<path d="M26 14 q5 6 0 12 M30 10 q8 10 0 20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
        break;
      case 'mute':
        inner = '<path d="M8 15 h6 l8 -7 v24 l-8 -7 h-6 z" fill="currentColor"/>' +
                '<line x1="26" y1="14" x2="36" y2="26" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
                '<line x1="36" y1="14" x2="26" y2="26" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>';
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

  /* hanging wooden sign logo for the title screen */
  function logo() {
    return '<svg viewBox="0 0 260 190" class="logo-svg">' +
      '<line x1="58" y1="0" x2="66" y2="34" stroke="' + LINE + '" stroke-width="3.5"/>' +
      '<line x1="202" y1="0" x2="194" y2="34" stroke="' + LINE + '" stroke-width="3.5"/>' +
      '<circle cx="58" cy="0" r="4" fill="#f5c64f" stroke="' + LINE + '" stroke-width="2"/>' +
      '<circle cx="202" cy="0" r="4" fill="#f5c64f" stroke="' + LINE + '" stroke-width="2"/>' +
      '<rect x="30" y="32" width="200" height="126" rx="18" fill="#c89a6a" stroke="' + LINE + '" stroke-width="5"/>' +
      '<rect x="40" y="42" width="180" height="106" rx="12" fill="#fff8e9" stroke="#e3cba2" stroke-width="3"/>' +
      // sparkles
      '<g fill="#f5c64f" stroke="#e0a73a" stroke-width="2" stroke-linejoin="round">' +
      '<path d="M58 60 l3 7 7 0 -5.6 4.6 1.8 7.3 -6.2 -4.4 -6.2 4.4 1.8 -7.3 -5.6 -4.6 7 0 z"/>' +
      '<path d="M206 116 l2.2 5 5 0 -4 3.3 1.3 5.2 -4.5 -3.1 -4.5 3.1 1.3 -5.2 -4 -3.3 5 0 z"/></g>' +
      // cup with heart latte art
      '<g transform="translate(86,58)">' +
      '<path d="M8 18 h74 l-8 50 a7 7 0 0 1 -7 5.5 h-44 a7 7 0 0 1 -7 -5.5 z" fill="#fffaec" stroke="' + LINE + '" stroke-width="4"/>' +
      '<path d="M15 26 h60 l-4 25 h-52 z" fill="#6f4e37"/>' +
      '<path d="M82 26 q18 3 15 18 q-3 14 -18 12" fill="none" stroke="' + LINE + '" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M82 26 q18 3 15 18 q-3 14 -18 12" fill="none" stroke="#fffaec" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="4" y="12" width="82" height="10" rx="5" fill="#f2a3b3" stroke="' + LINE + '" stroke-width="2.5"/>' +
      '<g stroke="#cfc8e8" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.95">' +
      '<path d="M26 8 q5 -8 0 -16"/><path d="M45 9 q5 -9 0 -18"/><path d="M64 8 q5 -8 0 -16"/></g>' +
      '<g transform="translate(45,38)">' +
      '<path d="M0 9 C-9 1 -8 -7 -2 -7 C0 -7 0 -4 0 -4 C0 -4 0 -7 2 -7 C8 -7 9 1 0 9 z" fill="#f8e3c0" stroke="#e8c89a" stroke-width="1.6"/></g>' +
      '</g>' +
      '</svg>';
  }

  return {
    customer: customer, patienceRing: patienceRing,
    sceneOrderBack: sceneOrderBack, sceneOrderFront: sceneOrderFront,
    sceneRoast: sceneRoast, sceneBrew: sceneBrew, sceneMilk: sceneMilk, sceneBuild: sceneBuild,
    beanGroup: beanGroup, roastJars: roastJars, tagPills: tagPills,
    drink: drink, drinkGroup: drinkGroup,
    icon: icon, stars: stars, logo: logo, bunting: bunting
  };

  /* beanGroup is referenced above the definition only at runtime */
  function beanGroup(n, color) {
    var out = '', i, a, r, x, y, rot;
    for (i = 0; i < n; i++) {
      a = (i * 137.5) * Math.PI / 180;
      r = 4 + (i * 7919 % 26);
      x = 100 + Math.cos(a) * r;
      y = 74 + Math.sin(a) * r * 0.8;
      rot = (i * 53) % 180;
      out += '<g transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + rot + ')">' +
        '<ellipse rx="4.6" ry="3.1" fill="' + color + '"/>' +
        '<line x1="-3" y1="0" x2="3" y2="0" stroke="#00000066" stroke-width="0.9"/></g>';
    }
    return out;
  }
})();
