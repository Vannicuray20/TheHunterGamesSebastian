/* =========================================================
   LOS JUEGOS · MOTOR DE AUDIO  ·  SEBASTIAN #017
   ========================================================= */

var SFX = (function () {
  var ctx = null;
  var master = null;
  var enabled = true;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    enabled = Store.get().soundOn !== false;
  }

  function isOn() { return enabled; }

  function setOn(on) {
    enabled = !!on;
    var d = Store.get();
    d.soundOn = enabled;
    Store.save();
  }

  function tone(freq, dur, type, vol, when, dest) {
    if (!enabled || !ctx) return;
    var t0 = ctx.currentTime + (when || 0);
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(dest || master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function melody(notes, when) {
    var t = when || 0;
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      tone(n[0], n[1], n[2] || 'triangle', n[3] || 0.18, t);
      t += n[1] * 0.92;
    }
  }

  return {
    init: init, isOn: isOn, setOn: setOn, getCtx: function () { return ctx; },

    hover: function () { tone(980, 0.05, 'sine', 0.05); },
    click: function () { tone(520, 0.08, 'triangle', 0.16); tone(780, 0.06, 'sine', 0.1, 0.03); },
    whoosh: function () {
      // barrido descendente de ruido blanco
      if (!enabled || !ctx) return;
      var dur = 0.45;
      var buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      var src = ctx.createBufferSource();
      src.buffer = buf;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      var f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(2400, ctx.currentTime);
      f.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + dur);
      src.connect(f); f.connect(g); g.connect(master);
      src.start();
    },
    start: function () {
      melody([[392, .18], [523.25, .18], [659.25, .18], [783.99, .34], [1046.5, .5, 'sawtooth', .14]]);
    },
    confirm: function () { tone(660, .14, 'sine', .2); tone(880, .2, 'triangle', .18, .12); tone(1320, .3, 'sine', .14, .26); },
    countdown: function () { tone(440, .09, 'square', .12); tone(520, .09, 'square', .1, .1); tone(880, .5, 'triangle', .16, .2); },
    correct: function () { tone(660, .1, 'triangle', .2); tone(990, .14, 'sine', .14, .08); },
    combo: function () { tone(784, .1, 'triangle', .2); tone(1046, .1, 'triangle', .18, .07); tone(1318, .16, 'sine', .14, .14); },
    error: function () { tone(220, .18, 'sawtooth', .14); tone(160, .28, 'sawtooth', .12, .1); },
    tick: function () { tone(1000, .04, 'sine', .08); },
    win: function () {
      melody([[523.25, .16], [659.25, .16], [783.99, .16], [1046.5, .3, 'triangle', .2], [783.99, .12], [1046.5, .2], [1318.5, .42, 'sawtooth', .16]]);
    },
    lose: function () { melody([[392, .22], [349.2, .22], [311.1, .34], [261.6, .5, 'sawtooth', .13]]); },
    unlock: function () { melody([[1046.5, .12], [1318.5, .12], [1568, .2], [2093, .34, 'sine', .2]]); },
    diploma: function () { melody([[659.25, .18], [783.99, .18], [987.77, .22], [1318.5, .34, 'triangle', .2]]); },
    rankUp: function () {
      melody([[523.25, .14], [659.25, .14], [783.99, .14], [1046.5, .18, 'triangle', .2], [1568, .4, 'sawtooth', .12]]);
    },
    select: function () { tone(540, .09, 'triangle', .16); tone(810, .12, 'sine', .12, .06); },
    danger: function () { tone(196, .16, 'sawtooth', .12); tone(196, .16, 'sawtooth', .12, .2); }
  };
})();