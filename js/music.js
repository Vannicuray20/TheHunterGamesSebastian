/* THE HUNTER GAMES · banda sonora original generada (Web Audio, sin derechos de autor) */
var Music = (function () {
  var ctx = null, master = null, sources = [], tick = null;
  var active = null, idx = -1;
  var MUSIC_VOL = 0.22;
  var onChange = null;

  function nf(m) { return 440 * Math.pow(2, ((m) - 69) / 12); }

  var TRACKS = [
    {
      name: 'Amanecer en el Recinto',
      mood: 'Inicio · calma preparada', bpm: 56, padVol: 0.042, arpN: 2,
      chords: [
        [52, 57, 60, 64], [48, 52, 57, 60], [48, 55, 60, 64], [43, 47, 52, 55]
      ],
      arpBase: [57, 60, 64, 69]
    },
    {
      name: 'La Sombra del Tributo',
      mood: 'Arena · tensión', bpm: 72, padVol: 0.04, arpN: 3,
      chords: [
        [50, 53, 57, 60], [46, 50, 53, 57], [45, 52, 57, 60], [43, 50, 55, 58]
      ],
      arpBase: [50, 53, 57, 62]
    },
    {
      name: 'La Caza',
      mood: 'Persecución', bpm: 96, padVol: 0.036, arpN: 4,
      chords: [
        [40, 47, 52, 55], [45, 52, 57, 60], [50, 53, 57, 60], [47, 50, 55, 59]
      ],
      arpBase: [52, 55, 60, 64, 67]
    },
    {
      name: 'La Noche de los Ojos',
      mood: 'Oscuridad', bpm: 44, padVol: 0.05, arpN: 1,
      chords: [
        [40, 47, 52], [38, 45, 50], [41, 48, 53], [43, 50, 55]
      ],
      arpBase: [47, 50, 52]
    },
    {
      name: 'El Último Refugio',
      mood: 'Memorias · recogimiento', bpm: 66, padVol: 0.045, arpN: 3,
      chords: [
        [43, 47, 50, 55], [50, 54, 57, 62], [52, 55, 59, 64], [48, 52, 55, 60]
      ],
      arpBase: [47, 50, 55, 59]
    },
    {
      name: 'Victoria del Distrito',
      mood: 'Triunfo · esperanza', bpm: 88, padVol: 0.042, arpN: 4,
      chords: [
        [48, 55, 60, 64], [43, 47, 50, 55], [45, 52, 57, 60], [41, 45, 48, 53]
      ],
      arpBase: [52, 55, 60, 64, 67, 72]
    }
  ];

  function buildMaster() {
    if (master) { try { master.disconnect(); } catch (e) {} master = null; }
    master = ctx.createGain();
    master.gain.value = MUSIC_VOL;
    master.connect(ctx.destination);
  }

  function stopEngine() {
    if (tick) { clearInterval(tick); tick = null; }
    for (var i = 0; i < sources.length; i++) {
      try { sources[i].stop(); } catch (e) {}
      try { sources[i].disconnect(); } catch (e) {}
    }
    sources = [];
    if (master) { try { master.disconnect(); } catch (e) {} master = null; }
  }

  function pad(freqs, t0, dur, vol) {
    for (var i = 0; i < freqs.length; i++) {
      var o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = 'triangle';
      o.frequency.value = freqs[i];
      lp.type = 'lowpass';
      lp.frequency.value = 850 + freqs[i] * 0.35;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + dur * 0.3);
      g.gain.setValueAtTime(vol, t0 + dur * 0.65);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(lp); lp.connect(g); g.connect(master);
      o.start(t0); o.stop(t0 + dur + 0.1);
      sources.push(o);
    }
  }

  function pluck(freq, t0, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + 1);
    sources.push(o);
  }

  function startTrack(i) {
    stopEngine();
    buildMaster();
    idx = (i % TRACKS.length + TRACKS.length) % TRACKS.length;
    active = TRACKS[idx];
    var step = 60 / active.bpm;
    var ci = 0, arpPos = 0;
    var nextChord = ctx.currentTime + 0.06;
    tick = setInterval(function () {
      while (nextChord < ctx.currentTime + 0.7) {
        var ch = active.chords[ci];
        var midis = ch.slice();
        pad(midis.map(nf), nextChord, step * 1.35, active.padVol);
        for (var a = 0; a < active.arpN; a++) {
          var m = active.arpBase[(arpPos) % active.arpBase.length];
          pluck(nf(m), nextChord + (step * (a + 0.55) / active.arpN), 0.055);
          arpPos++;
        }
        ci = (ci + 1) % active.chords.length;
        nextChord += step;
      }
    }, 120);
    sync();
  }

  function init() {
    if (ctx) return true;
    if (window.SFX && SFX.getCtx && SFX.getCtx()) {
      ctx = SFX.getCtx();
    } else {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return true;
  }

  function play(i) {
    if (!init()) return false;
    startTrack(typeof i === 'number' ? i : (idx < 0 ? 0 : idx));
    return true;
  }

  function stop() {
    stopEngine();
    active = null;
    sync();
  }

  function toggle() {
    if (!init()) return false;
    if (active) { stop(); return false; }
    play(idx < 0 ? 0 : idx);
    return true;
  }

  function next() {
    if (!init()) return false;
    play(idx + 1);
    return true;
  }

  function current() {
    return { idx: idx, active: active, tracks: TRACKS };
  }

  function setOnChange(fn) { onChange = fn; }

  function sync() {
    if (onChange) onChange();
  }

  function isOn() { return !!(active && ctx); }

  return {
    TRACKS: TRACKS, init: init, play: play, stop: stop, toggle: toggle,
    next: next, current: current, isOn: isOn, setOnChange: setOnChange
  };
})();