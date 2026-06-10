/* Crackle & Pour — inline SVG art builders (no image assets) */
CG.svg = (function () {
  'use strict';

  /* ---------- customers ---------- */

  function hairSvg(c) {
    var h = c.hairColor;
    switch (c.hair) {
      case 'bun':
        return '<circle cx="50" cy="16" r="9" fill="' + h + '"/>' +
               '<path d="M28 38 a22 20 0 0 1 44 0 l-4 -2 a18 16 0 0 0 -36 0 z" fill="' + h + '"/>';
      case 'beanie':
        return '<path d="M27 36 a23 21 0 0 1 46 0 z" fill="' + h + '"/>' +
               '<rect x="26" y="32" width="48" height="8" rx="4" fill="' + h + '" stroke="#263238" stroke-width="1"/>' +
               '<circle cx="50" cy="14" r="4" fill="' + h + '"/>';
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
        return '<path d="M28 40 a22 22 0 0 1 44 0" stroke="#222" stroke-width="4" fill="none"/>' +
               '<rect x="24" y="38" width="8" height="13" rx="4" fill="#e07a5f"/>' +
               '<rect x="68" y="38" width="8" height="13" rx="4" fill="#e07a5f"/>';
      case 'mustache':
        return '<path d="M40 53 q5 -4 10 0 q5 -4 10 0 q-5 6 -10 3 q-5 3 -10 -3z" fill="#5d4037"/>';
      case 'scarf':
        return '<path d="M34 66 q16 9 32 0 l-2 8 q-14 7 -28 0 z" fill="#c0392b"/>' +
               '<rect x="56" y="70" width="9" height="16" rx="4" fill="#c0392b"/>';
      case 'freckles':
        return '<g fill="#c98e5a"><circle cx="36" cy="48" r="1.2"/><circle cx="40" cy="50" r="1.2"/>' +
               '<circle cx="64" cy="48" r="1.2"/><circle cx="60" cy="50" r="1.2"/></g>';
      case 'phone':
        return '<rect x="73" y="74" width="11" height="18" rx="2.5" fill="#222" transform="rotate(8 78 82)"/>' +
               '<rect x="75" y="77" width="7" height="11" rx="1" fill="#7fd4f5" transform="rotate(8 78 82)"/>';
      default:
        return '';
    }
  }

  // mood: happy | neutral | annoyed | angry
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
    } else { // happy
      eyes = '<circle cx="42" cy="43" r="2.8" fill="#33231a"/><circle cx="58" cy="43" r="2.8" fill="#33231a"/>';
      mouth = '<path d="M42 55 q8 8 16 0" stroke="#33231a" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
      extra = '<circle cx="34" cy="50" r="4" fill="#f8b4a0" opacity="0.55"/><circle cx="66" cy="50" r="4" fill="#f8b4a0" opacity="0.55"/>';
    }
    return brows + eyes + mouth + extra;
  }

  function customer(charId, mood) {
    var c = CG.data.CHARACTERS[charId];
    return '<svg viewBox="0 0 100 110" class="cust-svg" aria-label="' + c.name + '">' +
      // body
      '<path d="M26 110 v-22 a24 22 0 0 1 48 0 v22 z" fill="' + c.top + '" stroke="#7a5743" stroke-width="2"/>' +
      '<circle cx="50" cy="86" r="3" fill="#fff" opacity="0.55"/>' +
      // head
      '<circle cx="50" cy="44" r="22" fill="' + c.skin + '" stroke="#7a5743" stroke-width="2"/>' +
      hairSvg(c) + faceSvg(mood || 'happy') + accessorySvg(c) +
      '</svg>';
  }

  // circular patience ring; pct 0..100
  function patienceRing(pct, color) {
    var r = 17, circ = 2 * Math.PI * r;
    var off = circ * (1 - pct / 100);
    return '<svg viewBox="0 0 40 40" class="ring-svg">' +
      '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="#00000022" stroke-width="4"/>' +
      '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="4" ' +
      'stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" ' +
      'transform="rotate(-90 20 20)"/></svg>';
  }

  /* ---------- drinks & machines ---------- */

  function cup(size, opts) {
    opts = opts || {};
    var s = { S: 0.8, M: 1, L: 1.18 }[size || 'M'];
    var liquid = opts.fill ? '<path d="M30 40 h40 l-4.6 42 h-30.8 z" fill="' + (opts.color || '#6f4e37') + '"/>' : '';
    var whip = opts.whip
      ? '<g fill="#fffef7" stroke="#7a5743" stroke-width="1.6"><circle cx="50" cy="33" r="9"/><circle cx="40" cy="36" r="7"/><circle cx="60" cy="36" r="7"/><circle cx="50" cy="26" r="6"/></g>'
      : '';
    var dust = opts.dust
      ? '<g fill="' + opts.dust + '"><circle cx="44" cy="31" r="1.4"/><circle cx="51" cy="29" r="1.4"/><circle cx="58" cy="32" r="1.4"/><circle cx="47" cy="34" r="1.2"/><circle cx="55" cy="35" r="1.2"/></g>'
      : '';
    return '<svg viewBox="0 0 100 100" class="cup-svg" style="width:' + (s * 100) + '%;height:' + (s * 100) + '%">' +
      '<path d="M26 36 h48 l-6 52 a6 6 0 0 1 -6 5 h-24 a6 6 0 0 1 -6 -5 z" fill="#fffaec" stroke="#7a5743" stroke-width="2.6"/>' +
      liquid +
      '<path d="M74 44 q14 2 12 14 q-2 12 -16 10" fill="none" stroke="#7a5743" stroke-width="5.5" stroke-linecap="round"/>' +
      '<path d="M74 44 q14 2 12 14 q-2 12 -16 10" fill="none" stroke="#fffaec" stroke-width="2.4" stroke-linecap="round"/>' +
      '<rect x="24" y="32" width="52" height="8" rx="4" fill="#f2a3b3" stroke="#7a5743" stroke-width="2"/>' +
      '<path d="M38 62 q4 -7 10 -2 q6 -5 10 2" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="' + (opts.fill ? 0.5 : 0) + '"/>' +
      whip + dust +
      '</svg>';
  }

  function roaster() {
    return '<svg viewBox="0 0 200 170" class="machine-svg">' +
      // wooden base
      '<rect x="20" y="120" width="160" height="34" rx="10" fill="#b58e6f" stroke="#7a5743" stroke-width="3"/>' +
      '<line x1="36" y1="128" x2="36" y2="146" stroke="#9c7355" stroke-width="3" stroke-linecap="round"/>' +
      '<line x1="164" y1="128" x2="164" y2="146" stroke="#9c7355" stroke-width="3" stroke-linecap="round"/>' +
      // sage body
      '<rect x="30" y="20" width="140" height="108" rx="18" fill="#9eb585" stroke="#7a5743" stroke-width="3"/>' +
      '<rect x="38" y="28" width="124" height="14" rx="7" fill="#fffaec" stroke="#7a5743" stroke-width="2"/>' +
      // drum window
      '<circle cx="100" cy="76" r="38" fill="#fffaec" stroke="#7a5743" stroke-width="3"/>' +
      '<circle cx="100" cy="76" r="31" fill="#5e4434"/>' +
      '<g id="roast-beans"></g>' +
      '<circle cx="100" cy="76" r="31" fill="none" stroke="#7a5743" stroke-width="2.5"/>' +
      // cute details: pink switch + gold gauge
      '<rect x="44" y="50" width="22" height="11" rx="5.5" fill="#f2a3b3" stroke="#7a5743" stroke-width="2"/>' +
      '<circle cx="152" cy="56" r="8" fill="#f5c64f" stroke="#7a5743" stroke-width="2"/>' +
      '<line x1="152" y1="56" x2="156" y2="51" stroke="#7a5743" stroke-width="2" stroke-linecap="round"/>' +
      // chute
      '<path d="M62 130 h76 l-8 16 h-60 z" fill="#8a6248" stroke="#7a5743" stroke-width="2.5"/>' +
      '<g id="roast-smoke" opacity="0"><circle cx="100" cy="14" r="6" fill="#cfc8e8" opacity="0.8"/>' +
      '<circle cx="110" cy="6" r="8" fill="#dfd9f2" opacity="0.7"/><circle cx="92" cy="4" r="5" fill="#dfd9f2" opacity="0.6"/></g>' +
      '</svg>';
  }

  function beanGroup(n, color) {
    var out = '', i, a, r, x, y, rot;
    for (i = 0; i < n; i++) {
      a = (i * 137.5) * Math.PI / 180;
      r = 4 + (i * 7919 % 26);
      x = 100 + Math.cos(a) * r;
      y = 72 + Math.sin(a) * r * 0.8;
      rot = (i * 53) % 180;
      out += '<g transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + rot + ')">' +
        '<ellipse rx="4.6" ry="3.1" fill="' + color + '"/>' +
        '<line x1="-3" y1="0" x2="3" y2="0" stroke="#00000066" stroke-width="0.9"/></g>';
    }
    return out;
  }

  function espressoMachine() {
    return '<svg viewBox="0 0 200 190" class="machine-svg">' +
      // cups stacked on top
      '<path d="M52 14 h22 l-2.5 12 h-17 z" fill="#fffaec" stroke="#7a5743" stroke-width="2.2"/>' +
      '<path d="M126 14 h22 l-2.5 12 h-17 z" fill="#fffaec" stroke="#7a5743" stroke-width="2.2"/>' +
      // sage body
      '<rect x="30" y="24" width="140" height="62" rx="14" fill="#9eb585" stroke="#7a5743" stroke-width="3"/>' +
      '<rect x="38" y="32" width="124" height="12" rx="6" fill="#b9cba6" stroke="#7a5743" stroke-width="2"/>' +
      // cream face panel with dial "eyes"
      '<rect x="56" y="48" width="88" height="30" rx="10" fill="#fffaec" stroke="#7a5743" stroke-width="2.5"/>' +
      '<circle cx="78" cy="63" r="7" fill="#f2a3b3" stroke="#7a5743" stroke-width="2"/>' +
      '<line x1="78" y1="63" x2="82" y2="58" stroke="#7a5743" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="122" cy="63" r="7" fill="#f5c64f" stroke="#7a5743" stroke-width="2"/>' +
      '<line x1="122" y1="63" x2="118" y2="58" stroke="#7a5743" stroke-width="2" stroke-linecap="round"/>' +
      // group head
      '<rect x="86" y="84" width="28" height="14" rx="5" fill="#8a6248" stroke="#7a5743" stroke-width="2.5"/>' +
      '<path d="M95 98 h10 v8 h-10 z" fill="#7a5743"/>' +
      '<g id="brew-stream" opacity="0"><rect x="97" y="104" width="6" height="30" rx="3" fill="#6f4e37"/></g>' +
      // glass (ids + coords used by st-brew)
      '<g id="brew-glass" transform="translate(78,128)">' +
      '<path d="M0 0 h44 l-4 44 a5 5 0 0 1 -5 4 h-26 a5 5 0 0 1 -5 -4 z" fill="#ffffffd8" stroke="#7a5743" stroke-width="2.6"/>' +
      '<clipPath id="glassclip"><path d="M1 1 h42 l-4 43 a4 4 0 0 1 -4 3 h-26 a4 4 0 0 1 -4 -3 z"/></clipPath>' +
      '<g clip-path="url(#glassclip)"><rect id="brew-fill" x="0" y="48" width="44" height="48" fill="#6f4e37"/></g>' +
      '<line id="brew-target" x1="-6" y1="18" x2="50" y2="18" stroke="#e2798f" stroke-width="2.5" stroke-dasharray="4 3"/>' +
      '</g>' +
      // side lever
      '<rect x="150" y="56" width="10" height="56" rx="5" fill="#b58e6f" stroke="#7a5743" stroke-width="2.2" transform="rotate(18 155 56)"/>' +
      '</svg>';
  }

  function pourOverRig() {
    return '<svg viewBox="0 0 200 190" class="machine-svg">' +
      '<path d="M58 30 h84 l-26 44 h-32 z" fill="#ffffffd8" stroke="#7a5743" stroke-width="3"/>' +
      '<path d="M70 36 h60 l-19 32 h-22 z" fill="#c8a165" stroke="#7a5743" stroke-width="1.6"/>' +
      '<g id="pour-stream" opacity="0"><rect x="97" y="6" width="5" height="28" rx="2.5" fill="#aed5e8"/></g>' +
      '<rect x="90" y="74" width="20" height="10" rx="3" fill="#b58e6f" stroke="#7a5743" stroke-width="2"/>' +
      '<g transform="translate(64,86)">' +
      '<path d="M0 0 h72 l-7 64 a6 6 0 0 1 -6 5 h-46 a6 6 0 0 1 -6 -5 z" fill="#ffffffd8" stroke="#7a5743" stroke-width="3"/>' +
      '<clipPath id="serverclip"><path d="M2 2 h68 l-7 62 a5 5 0 0 1 -5 3 h-44 a5 5 0 0 1 -5 -3 z"/></clipPath>' +
      '<g clip-path="url(#serverclip)"><rect id="pour-fill" x="0" y="69" width="72" height="70" fill="#7a5230"/></g>' +
      '<line id="pour-target" x1="-8" y1="30" x2="80" y2="30" stroke="#e2798f" stroke-width="2.5" stroke-dasharray="4 3"/>' +
      '</g></svg>';
  }

  function milkRig() {
    return '<svg viewBox="0 0 200 200" class="machine-svg">' +
      '<rect x="18" y="8" width="76" height="38" rx="12" fill="#9eb585" stroke="#7a5743" stroke-width="3"/>' +
      '<circle cx="40" cy="27" r="7" fill="#f2a3b3" stroke="#7a5743" stroke-width="2"/>' +
      '<line x1="40" y1="27" x2="44" y2="22" stroke="#7a5743" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="68" y="22" width="16" height="10" rx="4" fill="#fffaec" stroke="#7a5743" stroke-width="2"/>' +
      '<rect x="50" y="42" width="10" height="42" rx="5" fill="#b9cba6" stroke="#7a5743" stroke-width="2.2" transform="rotate(-14 55 42)"/>' +
      '<circle cx="44" cy="93" r="4.5" fill="#7a5743"/>' +
      '<g id="milk-steam" opacity="0">' +
      '<path d="M48 96 q-6 12 2 22 q6 10 -2 20" stroke="#ffffffcc" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M60 98 q-4 10 2 18" stroke="#ffffff99" stroke-width="4" fill="none" stroke-linecap="round"/></g>' +
      '<g id="milk-pitcher" transform="translate(30,108)">' +
      '<path d="M0 0 h56 l-7 56 h-42 z" fill="#fffaec" stroke="#7a5743" stroke-width="3"/>' +
      '<path d="M56 4 l16 8 -17 6" fill="#fffaec" stroke="#7a5743" stroke-width="3" stroke-linejoin="round"/>' +
      '<clipPath id="pitchclip"><path d="M2 2 h52 l-6.5 52 h-39 z"/></clipPath>' +
      '<g clip-path="url(#pitchclip)"><rect id="milk-fill" x="0" y="22" width="56" height="40" fill="#fdfdfd"/>' +
      '<rect id="milk-foam" x="0" y="16" width="56" height="8" fill="#fffef5" opacity="0.95"/></g>' +
      '<path d="M16 32 q12 -8 24 0" fill="none" stroke="#f2a3b3" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>' +
      '</g></svg>';
  }

  /* ---------- icons (tab bar, tickets, shop) ---------- */

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

  function logo() {
    return '<svg viewBox="0 0 220 150" class="logo-svg">' +
      '<ellipse cx="110" cy="134" rx="78" ry="9" fill="#7a574322"/>' +
      // sparkle stars
      '<g fill="#f5c64f" stroke="#e0a73a" stroke-width="2" stroke-linejoin="round">' +
      '<path d="M34 28 l3.5 8 8 0 -6.4 5.2 2 8.3 -7.1 -5 -7.1 5 2 -8.3 -6.4 -5.2 8 0 z"/>' +
      '<path d="M190 70 l2.5 5.8 5.8 0 -4.6 3.7 1.5 6 -5.2 -3.6 -5.2 3.6 1.5 -6 -4.6 -3.7 5.8 0 z"/></g>' +
      // cup
      '<path d="M52 50 h116 l-12 76 a10 10 0 0 1 -10 8 h-72 a10 10 0 0 1 -10 -8 z" fill="#fffaec" stroke="#7a5743" stroke-width="5"/>' +
      '<path d="M62 62 h96 l-6 38 h-84 z" fill="#6f4e37"/>' +
      '<path d="M168 62 q26 4 22 26 q-4 20 -26 18" fill="none" stroke="#7a5743" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M168 62 q26 4 22 26 q-4 20 -26 18" fill="none" stroke="#fffaec" stroke-width="3.5" stroke-linecap="round"/>' +
      '<rect x="46" y="42" width="128" height="14" rx="7" fill="#f2a3b3" stroke="#7a5743" stroke-width="3"/>' +
      // steam
      '<g stroke="#cfc8e8" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.95">' +
      '<path d="M86 32 q6 -10 0 -20"/><path d="M110 34 q6 -12 0 -24"/><path d="M134 32 q6 -10 0 -20"/></g>' +
      // latte-art heart
      '<g transform="translate(110,84)">' +
      '<path d="M0 14 C-14 2 -12 -10 -3 -10 C0 -10 0 -6 0 -6 C0 -6 0 -10 3 -10 C12 -10 14 2 0 14 z" fill="#f8e3c0" stroke="#e8c89a" stroke-width="2"/></g>' +
      '</svg>';
  }

  return {
    customer: customer, patienceRing: patienceRing,
    cup: cup, roaster: roaster, beanGroup: beanGroup,
    espressoMachine: espressoMachine, pourOverRig: pourOverRig, milkRig: milkRig,
    icon: icon, stars: stars, logo: logo
  };
})();
