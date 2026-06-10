/* Crackle & Pour — synthesized WebAudio SFX (no audio files) */
CG.audio = (function () {
  'use strict';

  var ctx = null;
  var muted = false;

  function ensure() {
    if (muted) return null;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }

  function tone(freq, dur, type, vol, when, slide) {
    var c = ensure(); if (!c) return;
    var t = c.currentTime + (when || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol || 0.15, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, vol, freq, q, when) {
    var c = ensure(); if (!c) return;
    var t = c.currentTime + (when || 0);
    var len = Math.max(1, Math.floor(c.sampleRate * dur));
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0), i;
    for (i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource(); src.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 2000; f.Q.value = q || 1;
    var g = c.createGain();
    g.gain.setValueAtTime(vol || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(c.destination);
    src.start(t); src.stop(t + dur + 0.02);
  }

  var sfx = {
    tap:     function () { tone(620, 0.07, 'triangle', 0.12); },
    select:  function () { tone(440, 0.06, 'triangle', 0.1); tone(660, 0.08, 'triangle', 0.1, 0.05); },
    pump:    function () { noise(0.05, 0.14, 900, 2); tone(220, 0.05, 'square', 0.05); },
    crack:   function () { noise(0.04, 0.2, 3200, 4); },
    drop:    function () { noise(0.25, 0.18, 600, 1); tone(180, 0.2, 'sine', 0.1); },
    steam:   function () { noise(0.3, 0.08, 4200, 0.8); },
    screech: function () { tone(2200, 0.35, 'sawtooth', 0.07, 0, 2600); noise(0.35, 0.1, 5000, 3); },
    pour:    function () { noise(0.28, 0.09, 1400, 1.2); },
    ding:    function () { tone(880, 0.4, 'sine', 0.14); tone(1320, 0.5, 'sine', 0.07, 0.02); },
    chime:   function () { tone(523, 0.18, 'sine', 0.13); tone(659, 0.2, 'sine', 0.13, 0.1); tone(784, 0.35, 'sine', 0.13, 0.2); },
    fanfare: function () { tone(523, 0.15, 'triangle', 0.13); tone(659, 0.15, 'triangle', 0.13, 0.12); tone(784, 0.15, 'triangle', 0.13, 0.24); tone(1047, 0.45, 'triangle', 0.15, 0.36); },
    buzz:    function () { tone(140, 0.3, 'sawtooth', 0.12); },
    cash:    function () { tone(987, 0.08, 'square', 0.08); tone(1318, 0.12, 'square', 0.08, 0.07); },
    grind:   function () { noise(0.12, 0.1, 700, 0.7); },
    sip:     function () { tone(330, 0.1, 'sine', 0.08, 0, 392); }
  };

  function play(name) {
    if (muted || !sfx[name]) return;
    try { sfx[name](); } catch (e) { /* audio is never fatal */ }
  }

  function setMuted(m) {
    muted = !!m;
    CG.events.emit('mutechange', muted);
  }

  // iOS: AudioContext must be created/resumed from a user gesture
  document.addEventListener('pointerdown', function unlock() {
    ensure();
  }, { passive: true });

  return { play: play, setMuted: setMuted, isMuted: function () { return muted; } };
})();
