/* =========================================================
   LOS JUEGOS · MOTOR DE JUEGOS  ·  SEBASTIAN #017
   ========================================================= */

/* ---------- runtime común ---------- */
var GameRuntime = {
  zone: null, hudTimer: null, hudScore: null, onEnd: null, ended: false,
  ivs: [], loops: [], lns: [],

  reset: function (zone, ht, hs) {
    this.clearAll();
    this.zone = zone; this.hudTimer = ht; this.hudScore = hs;
    this.ended = false; this.ivs = []; this.loops = []; this.lns = [];
  },

  setInt: function (fn, ms) { var id = setInterval(fn, ms); this.ivs.push(id); return id; },
  setTout: function (fn, ms) { var id = setTimeout(fn, ms); this.ivs.push(id); return id; },

  loop: function (step) {
    var running = true, token = 0;
    function frame() {
      if (!running) return;
      step();
      token = requestAnimationFrame(frame);
    }
    token = requestAnimationFrame(frame);
    var obj = { stop: function () { running = false; cancelAnimationFrame(token); } };
    this.loops.push(obj);
    return obj;
  },

  on: function (el, type, fn) {
    el.addEventListener(type, fn);
    this.lns.push({ el: el, type: type, fn: fn });
    return fn;
  },

  clearAll: function () {
    for (var i = 0; i < this.ivs.length; i++) clearInterval(this.ivs[i]);
    for (var j = 0; j < this.loops.length; j++) this.loops[j].stop();
    for (var k = 0; k < this.lns.length; k++) {
      var l = this.lns[k];
      if (l.el) l.el.removeEventListener(l.type, l.fn);
    }
    this.ivs = []; this.loops = []; this.lns = [];
  },

  setScore: function (v) { if (this.hudScore) this.hudScore.textContent = v; },
  zoneRect: function () { return this.zone.getBoundingClientRect(); },

  feedback: function (x, y, text, cls) {
    var el = document.createElement('div');
    el.className = 'g-feedback ' + (cls || 'neutral');
    el.textContent = text;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    this.zone.appendChild(el);
    var zone = el.parentNode;
    this.setTout(function () { if (zone) zone.removeChild(el); }, 1100);
  },

  finish: function (res) {
    if (this.ended) return;
    this.ended = true;
    this.clearAll();
    if (this.onEnd) this.onEnd(res);
  }
};

function gameTimer(totalSec, onDone) {
  var start = Date.now();
  var el = GameRuntime.hudTimer;
  var iv = null;
  function upd() {
    var left = Math.max(0, totalSec * 1000 - (Date.now() - start));
    if (el) {
      el.textContent = Store.fmtTime(left);
      if (left > 0 && left < 5000) el.classList.add('warn'); else el.classList.remove('warn');
    }
    if (left <= 0) { clearInterval(iv); if (el) el.classList.remove('warn'); if (onDone) onDone(); }
  }
  upd();
  iv = setInterval(upd, 100);
  GameRuntime.ivs.push(iv);
  return {
    stop: function () { clearInterval(iv); if (el) el.classList.remove('warn'); }
  };
}

function readyOverlay(zone, data, onGo) {
  zone.innerHTML = '';
  zone.style.overflow = 'auto';
  var o = document.createElement('div');
  o.className = 'g-start';
  var goBtn = '<button class="btn btn-primary btn-lg" id="g-go">COMENZAR DESAFÍO</button>';
  o.innerHTML =
    '<h3>' + data.title + '</h3>' +
    '<p>' + data.sub + '</p>' +
    '<p class="g-count"></p>' +
    goBtn;
  zone.appendChild(o);
  var btn = o.querySelector('#g-go');
  btn.addEventListener('click', function () {
    SFX.init(); SFX.click();
    btn.disabled = true; btn.textContent = '';
    var seq = ['3', '2', '1'];
    var i = 0;
    o.querySelector('.g-count').textContent = '3';
    SFX.countdown();
    var iv = setInterval(function () {
      if (i < seq.length) { o.querySelector('.g-count').textContent = seq[i]; SFX.countdown(); i++; }
      else { clearInterval(iv); o.remove(); onGo(); }
    }, 600);
    GameRuntime.ivs.push(iv);
  });
}

function rnd(a, b) { return a + Math.random() * (b - a); }
function randPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

var Games = {};

/* ===========================
   JUEGO I · LA LLUVIA DORADA
   atrapa los dones que caen del cielo de la arena
   =========================== */
Games.seleccion = {
  play: function (zone, game) {
    var self = this;
    readyOverlay(zone, {
      title: 'JUEGO I — LA LLUVIA DORADA',
      sub: game.rule + '<br><br><b>SEBASTIAN #017</b>, el cielo de la arena se abre.<br><span style="opacity:.75">' + game.objective + '</span>'
    }, function () { self._start(zone, game); });
  },

  _start: function (zone, game) {
    var self = this;
    var TOTAL = game.timeLimit || 60;
    var TARGET = 2500;
    var t0 = Date.now();
    var gm = Games.seleccion;

    zone.innerHTML = '';
    zone.style.overflow = 'hidden';
    var S = zone.getBoundingClientRect();
    var W = Math.max(320, Math.round(S.width - 8));
    var H = Math.max(420, Math.round(S.height - 8));

    var wrap = document.createElement('div');
    wrap.className = 'dones-wrap';
    wrap.style.width = W + 'px';
    wrap.style.height = H + 'px';
    zone.appendChild(wrap);

    var cv = document.createElement('canvas');
    cv.className = 'dones-canvas';
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr;
    cv.height = H * dpr;
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    wrap.appendChild(cv);
    var ctx = cv.getContext('2d');

    var hud = document.createElement('div');
    hud.className = 'dones-hud';
    hud.innerHTML =
      '<div class="dones-brand">THE HUNTER GAMES · LA LLUVIA DORADA</div>' +
      '<div class="dones-stats">' +
        '<span class="dones-pill ds">⭐ <i id="d-score">0</i></span>' +
        '<span class="dones-pill dl">❤️ <i id="d-life">3</i></span>' +
        '<span class="dones-pill dc">🔥 <i id="d-combo">×1</i></span>' +
        '<span class="dones-pill dm">🎯 META <i id="d-target">' + TARGET + '</i></span>' +
      '</div>' +
      '<div class="dones-clock" id="d-clock">01:00</div>' +
      '<div class="dones-warn" id="d-warn">⚠️ ¡QUEDAN 10 SEGUNDOS!</div>';
    wrap.appendChild(hud);

    var elScore = hud.querySelector('#d-score');
    var elLife = hud.querySelector('#d-life');
    var elCombo = hud.querySelector('#d-combo');
    var elComboPill = hud.querySelector('.dones-pill.dc');
    var elClock = hud.querySelector('#d-clock');
    var elWarn = hud.querySelector('#d-warn');

    var toast = document.createElement('div');
    toast.className = 'dones-toast';
    wrap.appendChild(toast);

    var flash = document.createElement('div');
    flash.className = 'dones-flash';
    wrap.appendChild(flash);

    var state = 'run';
    var done = false;
    var score = 0, lives = 3, streak = 0, bestStreak = 0, catches = 0, hitsTaken = 0, lifeGained = 0;
    var elapsed = 0, lastNow = performance.now(), shake = 0;
    var spawnAcc = 0;
    var toastTimer = null;
    var keys = {};
    var items = [], parts = [], floats = [];

    var GROUND = H - 40;
    var pl = { x: W / 2, y: GROUND - 34, targetX: W / 2, moveT: 0, lean: 0, catchT: 0, invuln: 0 };

    var stars = [], skyline = [], dust = [];
    (function initScene() {
      var i, bx, wy;
      for (i = 0; i < 80; i++) stars.push({ x: Math.random() * W, y: Math.random() * (GROUND - 30), r: Math.random() * 1.3 + 0.3, a: Math.random() * 0.5 + 0.25, tw: Math.random() * 6.28 });
      for (bx = 4; bx < W; bx += 30) skyline.push({ x: bx, w: 30 + Math.random() * 6, h: 24 + Math.random() * 80, lit: Math.random() });
      for (i = 0; i < 30; i++) dust.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + 0.5, vy: -(5 + Math.random() * 14), a: Math.random() * 0.35 + 0.08 });
    })();

    function rrect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function mult() { return Math.min(5, 1 + Math.floor(streak / 4)); }

    function setHud() {
      elScore.textContent = score;
      elLife.textContent = lives;
      var m = mult();
      elCombo.textContent = '×' + m;
      elComboPill.className = 'dones-pill dc' + (m >= 3 ? ' hot' : '');
    }

    function showToast(msg, cls) {
      toast.className = 'dones-toast show' + (cls ? ' ' + cls : '');
      toast.textContent = msg;
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.className = 'dones-toast'; }, 2200);
    }

    function floatText(x, y, text, cls) { floats.push({ x: x, y: y, text: text, cls: cls || '', life: 1 }); }

    function burst(x, y, color, n, spd) {
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2;
        var s = (spd || 120) * (0.4 + Math.random());
        parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.6 + Math.random() * 0.5, max: 1.1, r: 1.5 + Math.random() * 2.5, color: color });
      }
    }

    function spawnItem() {
      var d = Math.min(1, elapsed / TOTAL);
      var r = Math.random();
      var hz = 0.16 + d * 0.26;
      var kind;
      if (r < hz) kind = Math.random() < 0.6 ? 'avispa' : 'llama';
      else if (r < hz + 0.05) kind = 'vida';
      else if (r < hz + 0.05 + (0.10 + d * 0.06)) kind = 'oro';
      else kind = 'don';
      var base = 108 + d * 175;
      if (kind === 'llama') base *= 1.28;
      if (kind === 'vida') base *= 0.8;
      var x0 = 42 + Math.random() * (W - 84);
      items.push({
        kind: kind, x: x0, x0: x0, y: -34, vy: base + rnd(-14, 22),
        t: 0, sway: Math.random() * 6.28, swayAmp: 5 + Math.random() * 16,
        r: kind === 'avispa' ? 15 : 14, rot: rnd(-0.18, 0.18)
      });
    }

    function grab(it) {
      if (it.kind === 'avispa' || it.kind === 'llama') {
        if (pl.invuln > 0) { burst(it.x, it.y, '#7a3040', 8); return true; }
        lives--; hitsTaken++; streak = 0; shake = 16; pl.invuln = 1.1;
        flash.className = 'dones-flash on';
        setTimeout(function () { flash.className = 'dones-flash'; }, 420);
        burst(it.x, it.y, '#e0636b', 22, 180);
        SFX.error();
        floatText(it.x, it.y - 20, '¡AY!', 'bad');
        setHud();
        if (lives <= 0) { lives = 0; setHud(); end(false); }
        return true;
      }
      var m = mult();
      var pts = it.kind === 'oro' ? 260 : (it.kind === 'vida' ? 150 : 100);
      score += pts * m;
      catches++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      pl.catchT = 0.32;
      burst(it.x, it.y, it.kind === 'vida' ? '#cfd6e6' : '#ffd766', 14, 150);
      if (it.kind === 'vida') {
        lives = Math.min(5, lives + 1);
        lifeGained++;
        floatText(it.x, it.y - 20, '+1 VIDA', 'life');
        SFX.unlock();
        showToast('🪙 ¡UN DON DE PLATA! +1 VIDA', 'good');
      } else {
        floatText(it.x, it.y - 20, '+' + (pts * m), mult() >= 3 ? 'hot' : 'good');
        if (streak > 0 && streak % 5 === 0) {
          SFX.combo();
          showToast('🔥 ¡RACHA ×' + m + '! EL DISTRITO TE APOYA', 'good');
        } else {
          SFX.correct();
        }
      }
      setHud();
      return true;
    }

    function update(dt, now) {
      elapsed += dt;
      var left = Math.max(0, TOTAL - elapsed);
      elClock.textContent = Store.fmtTime(left * 1000);
      if (left <= 10 && left > 0) elWarn.className = 'dones-warn show';
      else elWarn.className = 'dones-warn';

      if (keys.left) pl.targetX -= 470 * dt;
      if (keys.right) pl.targetX += 470 * dt;
      pl.targetX = Math.max(56, Math.min(W - 56, pl.targetX));
      var dx = pl.targetX - pl.x;
      pl.x += dx * Math.min(1, dt * 13);
      pl.lean += (Math.max(-1, Math.min(1, dx / 90)) - pl.lean) * Math.min(1, dt * 8);
      if (Math.abs(dx) > 2) pl.moveT += dt; else pl.moveT = 0;
      if (pl.invuln > 0) pl.invuln -= dt;
      if (pl.catchT > 0) pl.catchT -= dt;

      var iv = (760 - Math.min(1, elapsed / TOTAL) * 360) / 1000;
      spawnAcc += dt;
      if (spawnAcc >= iv) {
        spawnAcc = 0;
        spawnItem();
        if (Math.random() < 0.12) spawnItem();
      }

      for (var i = items.length - 1; i >= 0; i--) {
        var it = items[i];
        it.t += dt;
        it.y += it.vy * dt;
        it.x = it.x0 + Math.sin(it.t * 2 + it.sway) * it.swayAmp;
        if (it.y >= pl.y - 30 && it.y <= pl.y + 22 && Math.abs(it.x - pl.x) < 50) {
          if (grab(it)) { items.splice(i, 1); continue; }
        }
        if (it.y > GROUND + 8) {
          if (it.kind === 'don' || it.kind === 'oro') {
            if (streak > 0) { streak = 0; setHud(); }
          }
          if (it.kind === 'avispa' || it.kind === 'llama') burst(it.x, GROUND - 4, '#6a2a33', 8);
          items.splice(i, 1);
        }
      }

      for (i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 260 * dt;
        p.vx *= 0.99;
        if (p.life <= 0) parts.splice(i, 1);
      }
      for (i = floats.length - 1; i >= 0; i--) {
        var f = floats[i];
        f.life -= dt * 0.9;
        f.y -= 34 * dt;
        if (f.life <= 0) floats.splice(i, 1);
      }
      for (i = 0; i < dust.length; i++) {
        var du = dust[i];
        du.y += du.vy * dt;
        if (du.y < -8) { du.y = H + 8; du.x = Math.random() * W; }
      }
      if (shake > 0) shake = Math.max(0, shake - dt * 60);

      if (elapsed >= TOTAL && state === 'run') end(true);
    }

    function drawSky(now) {
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#06070f');
      g.addColorStop(0.45, '#0e1024');
      g.addColorStop(0.74, '#1e1a2e');
      g.addColorStop(0.9, '#35262a');
      g.addColorStop(1, '#120c10');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      var mx = W * 0.8, my = H * 0.17, mr = 34;
      var mg = ctx.createRadialGradient(mx, my, 4, mx, my, 150);
      mg.addColorStop(0, 'rgba(255,244,214,.9)');
      mg.addColorStop(0.12, 'rgba(255,236,190,.26)');
      mg.addColorStop(1, 'rgba(255,236,190,0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mx, my, 150, 0, 6.2832);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,247,225,.92)';
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, 6.2832);
      ctx.fill();
      ctx.fillStyle = 'rgba(214,200,170,.55)';
      ctx.beginPath();
      ctx.arc(mx - 9, my - 6, 5, 0, 6.2832);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx + 8, my + 7, 4, 0, 6.2832);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx + 2, my - 12, 3, 0, 6.2832);
      ctx.fill();

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        ctx.globalAlpha = s.a * (0.55 + 0.45 * Math.sin(now * 0.0015 + s.tw));
        ctx.fillStyle = '#dfe6ff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (i = 0; i < skyline.length; i++) {
        var b = skyline[i];
        var top = GROUND - 14 - b.h;
        ctx.fillStyle = '#080a16';
        ctx.fillRect(b.x, top, b.w, b.h + 14);
        if (b.lit > 0.55) {
          ctx.fillStyle = 'rgba(212,175,55,.5)';
          var wy, wx;
          for (wy = top + 8; wy < GROUND - 12; wy += 12) {
            for (wx = b.x + 5; wx < b.x + b.w - 5; wx += 10) {
              if ((wx + wy) % 3 === 0) ctx.fillRect(wx, wy, 3, 4);
            }
          }
        }
      }
    }

    function drawGround() {
      var g = ctx.createLinearGradient(0, GROUND - 10, 0, H);
      g.addColorStop(0, 'rgba(30,26,38,.2)');
      g.addColorStop(0.3, '#0d0b16');
      g.addColorStop(1, '#050409');
      ctx.fillStyle = g;
      ctx.fillRect(0, GROUND - 10, W, H - GROUND + 10);
      ctx.strokeStyle = 'rgba(212,175,55,.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND);
      ctx.lineTo(W, GROUND);
      ctx.stroke();
      var rg = ctx.createLinearGradient(0, GROUND, 0, GROUND + 40);
      rg.addColorStop(0, 'rgba(212,175,55,.24)');
      rg.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(0, GROUND, W, 40);
    }

    function drawPlayer(now) {
      var x = pl.x, y = pl.y;
      var bob = Math.sin(pl.moveT * 13) * 2.2;
      y += bob;
      var blink = pl.invuln > 0 && Math.floor(pl.invuln * 12) % 2 === 0;
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(pl.x, GROUND - 2, 30, 7, 0, 0, 6.2832);
      ctx.fill();
      ctx.globalAlpha = 1;
      if (blink) ctx.globalAlpha = 0.35;

      var sp = ctx.createRadialGradient(x, y - 40, 10, x, y - 40, 150);
      sp.addColorStop(0, 'rgba(212,175,55,.16)');
      sp.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = sp;
      ctx.beginPath();
      ctx.arc(x, y - 40, 150, 0, 6.2832);
      ctx.fill();

      ctx.strokeStyle = '#161a2e';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      var lo = Math.sin(pl.moveT * 13) * 5;
      ctx.beginPath();
      ctx.moveTo(x - 8, y + 16);
      ctx.lineTo(x - 8 + lo, GROUND - 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 16);
      ctx.lineTo(x + 8 - lo, GROUND - 3);
      ctx.stroke();

      var bg = ctx.createLinearGradient(0, y - 12, 0, y + 20);
      bg.addColorStop(0, '#323a5e');
      bg.addColorStop(1, '#1b203a');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(x - 13, y - 12);
      ctx.lineTo(x + 13, y - 12);
      ctx.quadraticCurveTo(x + 20, y + 12, x + 16, y + 20);
      ctx.lineTo(x - 16, y + 20);
      ctx.quadraticCurveTo(x - 20, y + 12, x - 13, y - 12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(212,175,55,.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 16, y + 18);
      ctx.lineTo(x + 16, y + 18);
      ctx.stroke();
      ctx.fillStyle = 'rgba(212,175,55,.9)';
      ctx.beginPath();
      ctx.arc(x, y + 7, 4, 0, 6.2832);
      ctx.fill();

      ctx.fillStyle = '#e8c39a';
      ctx.beginPath();
      ctx.arc(x, y - 20, 9.5, 0, 6.2832);
      ctx.fill();
      ctx.fillStyle = '#2b3052';
      ctx.beginPath();
      ctx.arc(x, y - 21, 10, Math.PI * 1.03, Math.PI * 1.97);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 20);
      ctx.quadraticCurveTo(x, y - 31, x + 10, y - 20);
      ctx.quadraticCurveTo(x, y - 25, x - 10, y - 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(212,175,55,.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y - 21, 10, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      ctx.fillStyle = '#20233a';
      var ex = Math.max(-1.6, Math.min(1.6, pl.lean * 1.6));
      ctx.beginPath();
      ctx.arc(x - 3.4 + ex, y - 19, 1.4, 0, 6.2832);
      ctx.arc(x + 3.4 + ex, y - 19, 1.4, 0, 6.2832);
      ctx.fill();

      var raise = pl.catchT > 0 ? 4 : 0;
      ctx.strokeStyle = '#e8c39a';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 6);
      ctx.lineTo(x - 34, y - 10 - raise);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 11, y - 6);
      ctx.lineTo(x + 34, y - 10 - raise);
      ctx.stroke();

      var by = y - 12 - raise;
      var bgl = ctx.createLinearGradient(0, by - 6, 0, by + 12);
      bgl.addColorStop(0, '#f0cf72');
      bgl.addColorStop(1, '#b8912f');
      ctx.fillStyle = bgl;
      ctx.beginPath();
      ctx.moveTo(x - 44, by - 4);
      ctx.lineTo(x + 44, by - 4);
      ctx.quadraticCurveTo(x + 40, by + 14, x, by + 14);
      ctx.quadraticCurveTo(x - 40, by + 14, x - 44, by - 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(90,66,16,.55)';
      ctx.lineWidth = 1.2;
      for (var k = 1; k < 6; k++) {
        var xx = x - 44 + k * 14.6;
        ctx.beginPath();
        ctx.moveTo(xx, by - 3);
        ctx.lineTo(xx - 2, by + 12);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,236,170,.9)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x - 44, by - 4);
      ctx.lineTo(x + 44, by - 4);
      ctx.stroke();
      if (pl.catchT > 0) {
        ctx.globalAlpha = pl.catchT / 0.32 * 0.6;
        ctx.strokeStyle = '#fff3c4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, by, 52, 0, 6.2832);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }

    function drawItem(it, now) {
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(it.rot + Math.sin(it.t * 2 + it.sway) * 0.12);
      if (it.kind === 'don' || it.kind === 'oro' || it.kind === 'vida') {
        var gold = it.kind === 'oro';
        var canopy = it.kind === 'vida' ? '#cfd6e6' : (gold ? '#f4d27a' : '#e7e2d2');
        ctx.fillStyle = canopy;
        ctx.beginPath();
        ctx.arc(0, -24, 15, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-15, -24);
        ctx.quadraticCurveTo(0, -30, 15, -24);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(240,240,240,.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-11, -25);
        ctx.lineTo(-4, -6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(11, -25);
        ctx.lineTo(4, -6);
        ctx.stroke();
        ctx.shadowColor = gold ? 'rgba(255,210,90,.9)' : (it.kind === 'vida' ? 'rgba(200,215,255,.9)' : 'rgba(255,225,150,.7)');
        ctx.shadowBlur = 16;
        var cg = ctx.createLinearGradient(0, -8, 0, 10);
        cg.addColorStop(0, it.kind === 'vida' ? '#eef2ff' : '#ffe9a3');
        cg.addColorStop(1, it.kind === 'vida' ? '#aab4cc' : (gold ? '#c9962a' : '#d9b24d'));
        ctx.fillStyle = cg;
        rrect(-11, -7, 22, 16, 5);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(120,30,40,.75)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(0, 9);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-11, 0);
        ctx.lineTo(11, 0);
        ctx.stroke();
        if (gold) {
          ctx.fillStyle = 'rgba(255,255,255,.9)';
          ctx.beginPath();
          ctx.arc(-4, -3, 1.6, 0, 6.2832);
          ctx.fill();
        }
      } else if (it.kind === 'avispa') {
        ctx.shadowColor = 'rgba(224,80,90,.8)';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#3a2530';
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, 6.2832);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#e0636b';
        var s;
        for (s = 0; s < 8; s++) {
          var a = s / 8 * 6.2832 + Math.sin(now * 0.006) * 0.2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 10);
          ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17);
          ctx.lineTo(Math.cos(a + 0.4) * 10, Math.sin(a + 0.4) * 10);
          ctx.closePath();
          ctx.fill();
        }
        var wf = Math.sin(now * 0.05) * 0.5;
        ctx.fillStyle = 'rgba(220,220,240,.35)';
        ctx.beginPath();
        ctx.ellipse(-16, -4, 10, 5, -0.5 + wf, 0, 6.2832);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(16, -4, 10, 5, 0.5 - wf, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = '#f0b0b6';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, 6.2832);
        ctx.fill();
      } else {
        ctx.shadowColor = 'rgba(255,140,60,.9)';
        ctx.shadowBlur = 20;
        var fg = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
        fg.addColorStop(0, '#fff2c0');
        fg.addColorStop(0.4, '#ff9a3c');
        fg.addColorStop(1, '#c0392b');
        ctx.fillStyle = fg;
        var wob = Math.sin(now * 0.01) * 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -15 + wob);
        ctx.quadraticCurveTo(13, -4, 10, 8);
        ctx.quadraticCurveTo(0, 14, -10, 8);
        ctx.quadraticCurveTo(-13, -4, 0, -15 + wob);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,240,190,.9)';
        ctx.beginPath();
        ctx.arc(0, 2, 4, 0, 6.2832);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawParts() {
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawFloats() {
      ctx.textAlign = 'center';
      ctx.font = '700 15px Cinzel, Georgia, serif';
      for (var i = 0; i < floats.length; i++) {
        var f = floats[i];
        ctx.globalAlpha = Math.max(0, f.life);
        ctx.fillStyle = f.cls === 'bad' ? '#ff8f97' : (f.cls === 'life' ? '#dfe8ff' : (f.cls === 'hot' ? '#ffe08a' : '#ffd766'));
        ctx.fillText(f.text, f.x, f.y);
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }

    function drawVignette() {
      var vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.72);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,.55)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }

    function draw(now) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      if (shake > 0) ctx.translate(rnd(-shake, shake) * 0.4, rnd(-shake, shake) * 0.4);
      drawSky(now);
      drawGround();
      for (var i = 0; i < dust.length; i++) {
        var du = dust[i];
        ctx.globalAlpha = du.a;
        ctx.fillStyle = '#e8d9a8';
        ctx.beginPath();
        ctx.arc(du.x, du.y, du.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < items.length; i++) drawItem(items[i], now);
      drawPlayer(now);
      drawParts();
      drawFloats();
      drawVignette();
    }

    function results(win, pts, bonus) {
      var res = document.createElement('div');
      res.className = 'dones-results';
      res.innerHTML =
        '<div class="cr-box">' +
          '<div class="cr-title">' + (win ? '🏆 ¡LLUVIA SUPERADA!' : '🩸 LA ARENA GANÓ') + '</div>' +
          '<div class="cr-sub">' + (win ? 'Los patrocinadores vieron a #017 atrapar su destino.' : 'Los dones siguieron cayendo y las vidas se agotaron.') + '</div>' +
          '<div class="cr-stats">' +
            '<div class="cr-row"><span>🎁 Dones atrapados</span><b>' + catches + '</b></div>' +
            '<div class="cr-row"><span>🔥 Mejor racha</span><b>' + bestStreak + '</b></div>' +
            '<div class="cr-row"><span>💥 Peligros recibidos</span><b>' + hitsTaken + '</b></div>' +
            '<div class="cr-row"><span>❤️ Vidas restantes</span><b>' + lives + '</b></div>' +
            (bonus ? '<div class="cr-row"><span>✨ Bono final</span><b>+' + bonus + '</b></div>' : '') +
            '<div class="cr-score">⭐ PUNTUACIÓN: <b>' + pts + '</b></div>' +
          '</div>' +
          '<div class="cr-actions">' +
            '<button class="btn btn-ghost" id="cr-replay">VOLVER A JUGAR</button>' +
            '<button class="btn btn-primary" id="cr-go">CONTINUAR</button>' +
          '</div>' +
        '</div>';
      wrap.appendChild(res);
      GameRuntime.on(res.querySelector('#cr-replay'), 'click', function () {
        SFX.init(); SFX.click();
        gm._start(zone, game);
      });
      GameRuntime.on(res.querySelector('#cr-go'), 'click', function () {
        SFX.init(); SFX.click();
        GameRuntime.finish({
          win: win,
          score: pts,
          timeMs: Date.now() - t0,
          detail: win ? 'Atrapó los dones de la lluvia dorada con reflejos de campeón' : 'La lluvia dorada sepultó a #017 antes de la campana'
        });
      });
    }

    function end(win) {
      if (done) return;
      done = true;
      state = 'fin';
      var bonus = win ? lives * 150 + bestStreak * 30 : 0;
      var pts = score + bonus;
      loop.stop();
      SFX[win ? 'win' : 'lose']();
      results(win, pts, bonus);
    }

    GameRuntime.on(window, 'keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { keys.left = true; e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keys.right = true; e.preventDefault(); }
    });
    GameRuntime.on(window, 'keyup', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    });
    function pointTo(clientX) {
      var r = cv.getBoundingClientRect();
      pl.targetX = clientX - r.left;
    }
    GameRuntime.on(cv, 'pointermove', function (e) { pointTo(e.clientX); });
    GameRuntime.on(cv, 'pointerdown', function (e) { pointTo(e.clientX); });

    setHud();

    var loop = GameRuntime.loop(function () {
      var now = performance.now();
      var dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      update(dt, now);
      draw(now);
    });
  }
};

/* ===========================
   JUEGO II · LA ARENA
   =========================== */
Games.arena = {
  play: function (zone, game) {
    var self = this;
    readyOverlay(zone, {
      title: 'JUEGO II — LA ARENA',
      sub: game.rule + '<br><br>Mantente con vida ' + game.timeLimit + ' segundos. Tres impactos y será el final.'
    }, function () { self._start(zone, game); });
  },

  _start: function (zone, game) {
    zone.innerHTML = '';
    var rect = zone.getBoundingClientRect();
    var W = rect.width, H = rect.height;
    var canvas = document.createElement('canvas');
    canvas.className = 'game-canvas';
    canvas.width = W; canvas.height = H;
    zone.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var lives = 3, elapsed = 0, last = performance.now();
    var playerX = W / 2, playerY = H - 48, targetX = W / 2;
    var hazards = [];
    var invuln = 0;
    var t0 = Date.now();
    var lifeWrap = document.createElement('div');
    lifeWrap.className = 'life-dots';
    lifeWrap.style.cssText = 'position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:5;';
    lifeWrap.innerHTML = '<span class="life-dot"></span><span class="life-dot"></span><span class="life-dot"></span>';
    zone.appendChild(lifeWrap);

    function drawLives() {
      var dots = lifeWrap.querySelectorAll('.life-dot');
      for (var i = 0; i < dots.length; i++) dots[i].className = 'life-dot' + (i < lives ? '' : ' gone');
    }
    drawLives();

    canvas.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      targetX = e.clientX - r.left;
    });

    var keys = {};
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);

    function keydown(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { keys.left = true; e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keys.right = true; e.preventDefault(); }
    }
    function keyup(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    }

    function end(win) {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
      var used = Date.now() - t0;
      GameRuntime.finish({
        win: win,
        score: win ? Math.round(used / 1000) * 20 + (3 - lives) * 40 : Math.round(used / 1000) * 10,
        timeMs: used,
        detail: (win ? 'La arena te corona superviviente' : 'La arena reclamó a #017') + ' · ' + lives + ' vidas'
      });
    }

    var spawnTimer = GameRuntime.setInt(function () {
      hazards.push({
        x: rnd(20, W - 20), y: -24,
        vy: 120 + Math.min(160, elapsed * 6),
        r: 10 + Math.random() * 6
      });
    }, 420);

    var loop = GameRuntime.loop(function () {
      var now = performance.now();
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      if (keys.left) targetX -= 380 * dt;
      if (keys.right) targetX += 380 * dt;
      targetX = Math.max(26, Math.min(W - 26, targetX));
      playerX += (targetX - playerX) * Math.min(1, dt * 14);

      for (var i = hazards.length - 1; i >= 0; i--) {
        var h = hazards[i];
        h.y += h.vy * dt;
        if (h.y > H + 30) { hazards.splice(i, 1); continue; }
        if (now > invuln) {
          var dx = Math.abs(h.x - playerX);
          var dy = Math.abs(h.y - playerY);
          if (dx < h.r + 34 && dy < h.r + 20) {
            hazards.splice(i, 1);
            lives--;
            drawLives();
            invuln = now + 900;
            SFX.error();
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(224,99,107,.9)';
            ctx.lineWidth = 3;
            ctx.arc(playerX, playerY, 30 + Math.random() * 20, 0, Math.PI * 2);
            ctx.stroke();
            if (lives <= 0) { loop.stop(); clearInterval(spawnTimer); end(false); }
          }
        }
      }

      ctx.clearRect(0, 0, W, H);
      // fondo
      ctx.fillStyle = 'rgba(10,8,18,.35)';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(212,175,55,.05)';
      ctx.lineWidth = 1;
      for (var gx = 0; gx < W; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (var gy = 0; gy < H; gy += 50) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

      // hazards
      for (var j = 0; j < hazards.length; j++) {
        var hz = hazards[j];
        ctx.save();
        ctx.shadowColor = 'rgba(163,41,47,.8)';
        ctx.shadowBlur = 16;
        ctx.fillStyle = 'rgba(163,41,47,.92)';
        ctx.translate(hz.x, hz.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-hz.r, -hz.r, hz.r * 2, hz.r * 2);
        ctx.restore();
      }

      // player
      var pulse = (now / 100) % 2 < 1 ? 1 : 1.08;
      ctx.save();
      ctx.shadowColor = (now < invuln) ? 'rgba(224,99,107,.9)' : 'rgba(212,175,55,.9)';
      ctx.shadowBlur = 22;
      ctx.translate(playerX, playerY);
      ctx.scale(pulse, pulse);
      ctx.beginPath();
      ctx.moveTo(0, -14); ctx.lineTo(20, 14); ctx.lineTo(0, 8); ctx.lineTo(-20, 14); ctx.closePath();
      ctx.fillStyle = (now < invuln) ? 'rgba(224,99,107,.6)' : 'rgba(212,175,55,.95)';
      ctx.fill();
      ctx.restore();

      if (elapsed >= game.timeLimit) { loop.stop(); clearInterval(spawnTimer); end(true); }
    });
  }
};

/* ===========================
   JUEGO III · EL LABERINTO
   =========================== */
Games.laberinto = {
  play: function (zone, game) {
    var self = this;
    readyOverlay(zone, {
      title: 'JUEGO III — EL LABERINTO',
      sub: game.rule + '<br><br>Ojos entrenados, mente de acero. Tu camino es secreto.'
    }, function () { self._start(zone, game); });
  },

  _start: function (zone, game) {
    var ROWS = 6, COLS = 6;
    var rounds = [4, 6, 8, 10];
    var roundIdx = 0;
    var errors = 0, correctTotal = 0;
    var t0 = Date.now();
    var timer = null;

    zone.innerHTML = '';

    function genPath(len) {
      var cells = ROWS * COLS;
      var start = Math.floor(Math.random() * cells);
      var path = [start];
      var cur = start;
      var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      var guard = 0;
      while (path.length < len && guard < 400) {
        guard++;
        var opts = [];
        for (var d = 0; d < dirs.length; d++) {
          var r = Math.floor(cur / COLS) + dirs[d][0];
          var c = cur % COLS + dirs[d][1];
          if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            var n = r * COLS + c;
            if (path.indexOf(n) === -1) opts.push(n);
          }
        }
        if (opts.length === 0) break;
        cur = randPick(opts);
        path.push(cur);
      }
      return path;
    }

    function roundStart() {
      zone.innerHTML = '';
      var len = rounds[roundIdx];
      var path = genPath(len);
      var correctSteps = 0, inputIdx = 0, showing = false;

      // overlays
      var tr = document.createElement('div');
      tr.className = 'target-round';
      tr.innerHTML = '<div class="tr-title">RONDA ' + (roundIdx + 1) + ' · CAMINO SECRETO</div>' +
        '<div class="tr-sub">Memoriza la ruta de ' + len + ' casillas iluminadas</div>';
      zone.appendChild(tr);

      var grid = document.createElement('div');
      grid.className = 'path-grid';
      grid.style.cssText = 'grid-template-columns:repeat(' + COLS + ', minmax(34px,64px));position:absolute;inset:0;margin:auto;place-content:center;z-index:2;width:min(90%,600px);';
      zone.appendChild(grid);

      for (var i = 0; i < ROWS * COLS; i++) {
        (function (idx) {
          var cell = document.createElement('div');
          cell.className = 'path-cell';
          cell.dataset.idx = idx;
          cell.addEventListener('click', function () {
            if (showing || inputIdx >= path.length) return;
            if (parseInt(cell.dataset.idx) === path[inputIdx]) {
              correctSteps++; correctTotal++;
              cell.classList.add('pick');
              SFX.correct();
              inputIdx++;
              if (inputIdx >= path.length) {
                SFX.combo();
                GameRuntime.setTout(function () { afterRound(correctSteps); }, 600);
              }
            } else {
              errors++;
              cell.classList.add('wrong');
              SFX.error();
              GameRuntime.setTout(function () { cell.classList.remove('wrong'); }, 500);
              if (errors >= 3) {
                timer.stop();
                GameRuntime.finish({ win: false, score: correctTotal * 25 - errors * 50, timeMs: Date.now() - t0, detail: 'La memoria flaqueó en la ronda ' + (roundIdx + 1) });
              }
            }
          });
          grid.appendChild(cell);
        })(i);
      }

      function afterRound(score) {
        roundIdx++;
        if (roundIdx >= rounds.length) {
          timer.stop();
          GameRuntime.finish({
            win: true,
            score: score * 25 + rounds.length * 150 - errors * 50,
            timeMs: Date.now() - t0,
            detail: 'Los nueve pasos del laberinto quedaron atrás'
          });
          return;
        }
        roundStart();
      }

      // mostrar camino
      tr.style.zIndex = 25;
      showing = true;
      var stepTimers = [];
      for (var s = 0; s < path.length; s++) {
        (function (si) {
          stepTimers.push(setTimeout(function () {
            grid.children[path[si]].classList.add('lit');
          }, 250 + si * 620));
        })(s);
      }
      GameRuntime.setTout(function () {
        for (var k = 0; k < stepTimers.length; k++) clearTimeout(stepTimers[k]);
        for (var cidx = 0; cidx < grid.children.length; cidx++) grid.children[cidx].classList.remove('lit');
        if (tr.parentNode) tr.parentNode.removeChild(tr);
        showing = false;
        SFX.confirm();
      }, 250 + path.length * 620 + 600); // mostrar, ocultar, permitir input

      if (!timer) {
        timer = gameTimer(game.timeLimit, function () {
          GameRuntime.finish({ win: false, score: correctTotal * 25, timeMs: Date.now() - t0, detail: 'El tiempo devoró la ruta' });
        });
      }
    }

    roundStart();
  }
};

/* ===========================
   JUEGO IV · LA CAZA
   =========================== */
Games.caza = {
  play: function (zone, game) {
    var self = this;
    readyOverlay(zone, {
      title: 'JUEGO IV — LA CAZA',
      sub: game.rule + '<br><br>Necesitas <b>24 presas</b>. Los objetivos que escapan te cuestan una vida.'
    }, function () { self._start(zone, game); });
  },

  _start: function (zone, game) {
    zone.innerHTML = '';
    var theme = null;
    var rect0 = zone.getBoundingClientRect();
    var W = rect0.width, H = rect0.height;
    var lives = 3, hits = 0, combo = 0, bestCombo = 0;
    var t0 = Date.now();

    var lifeWrap = document.createElement('div');
    lifeWrap.className = 'life-dots';
    lifeWrap.style.cssText = 'position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:5;';
    lifeWrap.innerHTML = '<span class="life-dot"></span><span class="life-dot"></span><span class="life-dot"></span>';
    zone.appendChild(lifeWrap);

    var comboEl = document.createElement('div');
    comboEl.style.cssText = 'position:absolute;top:10px;right:14px;z-index:5;font-family:var(--font-display);letter-spacing:.2em;font-size:13px;color:var(--gold-2);';
    comboEl.textContent = 'x1';
    zone.appendChild(comboEl);

    function drawLives() {
      var dots = lifeWrap.querySelectorAll('.life-dot');
      for (var i = 0; i < dots.length; i++) dots[i].className = 'life-dot' + (i < lives ? '' : ' gone');
    }
    drawLives();

    function end(win, reason) {
      var used = Date.now() - t0;
      GameRuntime.finish({
        win: win,
        score: hits * 50 + bestCombo * 20 + (win ? Math.max(0, game.timeLimit - used / 1000) * 5 : 0),
        timeMs: used,
        detail: reason
      });
    }

    var spawnIv = GameRuntime.setInt(function () {
      spawnTarget();
    }, 620);

    function spawnTarget() {
      var r = GameRuntime.zoneRect();
      var t = document.createElement('div');
      t.className = 'hit-target';
      var size = 58 + Math.random() * 26;
      t.style.width = size + 'px'; t.style.height = size + 'px';
      var p = randPos(GameRuntime.zone);
      t.style.left = p.pctX * 100 + '%';
      t.style.top = p.pctY * 100 + '%';
      t.style.animationDuration = (0.9 + Math.random() * 0.6) + 's';
      zone.appendChild(t);

      var captured = false;
      t.addEventListener('click', function () {
        if (captured) return;
        captured = true;
        hits++; combo++; bestCombo = Math.max(bestCombo, combo);
        SFX.correct();
        if (combo >= 3) SFX.combo();
        comboEl.textContent = 'x' + combo;
        var cr = GameRuntime.zoneRect();
        GameRuntime.feedback(p.left + 10, p.top, '+' + (50 + combo * 5), 'good');
        t.remove();
        if (hits >= 24) { clearInterval(spawnIv); end(true, 'La caza concluyó · ' + hits + ' presas · combo x' + bestCombo); }
      });

      // la presa se escapa
      GameRuntime.setTout(function () {
        if (!captured && t.parentNode) {
          captured = true;
          lives--; drawLives(); combo = 0; comboEl.textContent = 'x1';
          SFX.error();
          var r2 = GameRuntime.zoneRect();
          GameRuntime.feedback(p.left, p.top, 'ESCAPÓ', 'bad');
          t.remove();
          if (lives <= 0) { clearInterval(spawnIv); end(false, 'Las presas te superaron'); }
        }
      }, 1500);
    }

    gameTimer(game.timeLimit, function () {
      clearInterval(spawnIv);
      if (hits >= 24) end(true, 'La caza concluyó')
      else end(false, 'El tiempo abatió la caza · ' + hits + ' presas');
    });
  }
};

/* ===========================
   JUEGO V · EL ÚLTIMO REFUGIO
   =========================== */
Games.refugio = {
  play: function (zone, game) {
    var self = this;
    readyOverlay(zone, {
      title: 'JUEGO V — EL ÚLTIMO REFUGIO',
      sub: game.rule + '<br><br>Cada decisión escribe tu historia. Que la fortaleza no toque el cero.'
    }, function () { self._start(zone, game); });
  },

  _start: function (zone, game) {
    zone.innerHTML = '';
    var t0 = Date.now();
    var idx = 0;
    var fortaleza = 100, suministros = 100;
    var decisiones = SCENARIOS_REFUGIO.slice();

    function render() {
      zone.innerHTML = '';
      zone.style.overflow = 'auto';
      if (idx >= decisiones.length) {
        // victoria
        GameRuntime.finish({
          win: true,
          score: Math.round(fortaleza + suministros * 0.5 + decisiones.length * 100),
          timeMs: Date.now() - t0,
          detail: 'El refugio sobrevive bajo el mando de #017'
        });
        return;
      }
      if (fortaleza <= 0) {
        GameRuntime.finish({
          win: false,
          score: Math.round(suministros * 0.4),
          timeMs: Date.now() - t0,
          detail: 'La fortaleza de #017 se apagó en la decisión ' + (idx + 1)
        });
        return;
      }

      var sc = decisiones[idx];
      var wrap = document.createElement('div');
      wrap.className = 'scene-card';
      wrap.style.cssText = 'margin:10px auto;';

      var bars = '';
      bars += '<div class="scene-res"><div class="r"><label>Fortaleza</label><strong id="f-val">' + Math.round(fortaleza) + '</strong>' +
        '<div class="res-bar' + (fortaleza > 55 ? ' ok' : '') + '"><i style="width:' + fortaleza + '%"></i></div></div>';
      bars += '<div class="r"><label>Suministros</label><strong id="s-val">' + Math.round(suministros) + '</strong>' +
        '<div class="res-bar' + (suministros > 55 ? ' ok' : '') + '"><i style="width:' + suministros + '%"></i></div></div></div>';

      wrap.innerHTML =
        bars +
        '<div class="scene-kicker">DECISIÓN ' + (idx + 1) + ' DE ' + decisiones.length + ' · ' + sc.kicker + '</div>' +
        '<div class="scene-title">' + sc.text + '</div>' +
        '<div id="scene-opts"></div>';

      var optsBox = wrap.querySelector('#scene-opts');
      sc.options.forEach(function (opt) {
        var b = document.createElement('button');
        b.className = 'scene-opt';
        b.textContent = opt.label;
        b.addEventListener('click', function () {
          SFX.init(); SFX.click();
          fortaleza = Math.max(0, Math.min(100, fortaleza + opt.fx.fortaleza));
          suministros = Math.max(0, Math.min(100, suministros + opt.fx.suministro));
          optsBox.querySelectorAll('.scene-opt').forEach(function (x) { x.disabled = true; x.classList.add('pick'); });
          b.classList.add(opt.fx.good ? 'good' : 'bad');
          if (opt.fx.good) SFX.correct(); else SFX.error();

          var info = document.createElement('div');
          info.style.cssText = 'margin-top:16px;font-family:var(--font-serif);font-style:italic;color:var(--gold-2);font-size:15px;line-height:1.6;text-align:center;';
          info.textContent = '“' + opt.result + '”';
          wrap.appendChild(info);

          var next = document.createElement('button');
          next.className = 'btn btn-primary';
          next.style.cssText = 'margin:22px auto 0;display:flex;';
          next.textContent = idx + 1 >= decisiones.length ? 'ENFRENTAR LA CORONA' : 'CONTINUAR';
          next.addEventListener('click', function () {
            SFX.click();
            idx++;
            render();
          });
          wrap.appendChild(next);
        });
        optsBox.appendChild(b);
      });

      zone.appendChild(wrap);
    }

    render();
  }
};

/* ===========================
   JUEGO VI · LA NOCHE
   =========================== */
Games.noche = {
  play: function (zone, game) {
    var self = this;
    readyOverlay(zone, {
      title: 'JUEGO VI — LA NOCHE',
      sub: game.rule + '<br><br>Resiste ' + game.timeLimit + ' segundos. Un toque cualquiera puede apagar el fuego.'
    }, function () { self._start(zone, game); });
  },

  _start: function (zone, game) {
    zone.innerHTML = '';
    var rect = zone.getBoundingClientRect();
    var W = rect.width, H = rect.height;
    var canvas = document.createElement('canvas');
    canvas.className = 'game-canvas';
    canvas.width = W; canvas.height = H;
    zone.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var hp = 100, eyes = [], banished = 0;
    var t0 = Date.now();

    var hpEl = document.createElement('div');
    hpEl.style.cssText = 'position:absolute;top:12px;left:50%;transform:translateX(-50%);width:min(320px,60%);z-index:5;';
    hpEl.innerHTML = '<div style="font-size:10px;letter-spacing:.3em;color:var(--gold-2);text-align:center;margin-bottom:4px;font-family:var(--font-display)">EL FUEGO</div>' +
      '<div class="res-bar" style="height:10px"><i id="hp-fill" style="width:100%;background:linear-gradient(90deg,#f6e27a,#d4af37,#e36d3a);height:100%;display:block"></i></div>';
    zone.appendChild(hpEl);

    function updateHp() {
      var f = hpEl.querySelector('#hp-fill');
      if (f) f.style.width = Math.max(0, hp) + '%';
    }

    canvas.addEventListener('pointerdown', function (e) {
      var r = canvas.getBoundingClientRect();
      var mx = e.clientX - r.left, my = e.clientY - r.top;
      var best = null, bestD = 34;
      for (var i = eyes.length - 1; i >= 0; i--) {
        var d = Math.hypot(eyes[i].x - mx, eyes[i].y - my);
        if (d < bestD) { best = i; bestD = d; }
      }
      if (best !== null) {
        SFX.correct();
        banished++;
        FX.burst(eyes[best].x + r.left, eyes[best].y + r.top, 14);
        eyes.splice(best, 1);
        GameRuntime.feedback(e.clientX - r.left, e.clientY - r.top, '+15', 'good');
      }
    });

    function end(win) {
      GameRuntime.finish({
        win: win,
        score: banished * 15 + Math.round(hp),
        timeMs: Date.now() - t0,
        detail: (win ? 'La noche retrocedió ante la hoguera' : 'El fuego se apagó en la oscuridad') + ' · ' + banished + ' espíritus desterrados'
      });
    }

    var spawnIv = GameRuntime.setInt(function () {
      if (eyes.length < 14) {
        var edge = Math.floor(rnd(0, 4));
        var e = { x: 0, y: 0, speed: rnd(16, 30), hp: 3 };
        if (edge === 0) { e.x = rnd(10, W - 10); e.y = -14; }
        else if (edge === 1) { e.x = rnd(10, W - 10); e.y = H + 14; }
        else if (edge === 2) { e.x = -14; e.y = rnd(10, H - 10); }
        else { e.x = W + 14; e.y = rnd(10, H - 10); }
        eyes.push(e);
      }
    }, 560);

    var loop = GameRuntime.loop(function () {
      var dt = 1 / 60;
      var now = Date.now();
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#04050c';
      ctx.fillRect(0, 0, W, H);

      // estrellas tenues
      for (var s = 0; s < 40; s++) {
        var sx = (s * 97) % W, sy = (s * 53) % H;
        ctx.globalAlpha = 0.12 + 0.2 * Math.abs(Math.sin(now / 900 + s));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx, sy, 1.4, 1.4);
      }
      ctx.globalAlpha = 1;

      // fuego central
      var cx = W / 2, cy = H / 2;
      var flicker = 10 + 6 * Math.sin(now / 90) + 4 * Math.sin(now / 47);
      ctx.save();
      ctx.shadowColor = 'rgba(255,168,64,.9)';
      ctx.shadowBlur = 46 + 18 * Math.sin(now / 60);
      ctx.fillStyle = '#e36d3a';
      ctx.beginPath(); ctx.moveTo(cx, cy - 34); ctx.lineTo(cx + 18, cy + 6); ctx.lineTo(cx, cy + 26); ctx.lineTo(cx - 18, cy + 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f6e27a';
      ctx.beginPath(); ctx.moveTo(cx, cy - 24); ctx.lineTo(cx + 10, cy - 2); ctx.lineTo(cx, cy + 12); ctx.lineTo(cx - 10, cy - 2); ctx.closePath(); ctx.fill();
      ctx.restore();

      for (var i = eyes.length - 1; i >= 0; i--) {
        var e = eyes[i];
        var dx = cx - e.x, dy = cy - e.y;
        var dist = Math.hypot(dx, dy) || 1;
        e.x += dx / dist * e.speed * dt;
        e.y += dy / dist * e.speed * dt;
        // dibujar ojos
        var ang = Math.atan2(dy, dx);
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(ang);
        ctx.fillStyle = 'rgba(240,244,255,.94)';
        ctx.beginPath(); ctx.ellipse(-7, -4, 5, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(7, -4, 5, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#9b1c2e';
        ctx.beginPath(); ctx.arc(7, -4, 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-7, -4, 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        if (dist < 34) {
          eyes.splice(i, 1);
          hp -= 6;
          updateHp();
          SFX.error();
          FX.burst(cx, cy, 10);
          if (hp <= 0) { loop.stop(); clearInterval(spawnIv); end(false); return; }
        }
      }

      if (now - t0 > game.timeLimit * 1000) { loop.stop(); clearInterval(spawnIv); end(true); }
    });
  }
};

/* ===========================
   JUEGO VII · EL DESAFÍO FINAL
   =========================== */
Games.final = {
  play: function (zone, game) {
    var self = this;
    readyOverlay(zone, {
      title: 'JUEGO VII — EL DESAFÍO FINAL',
      sub: 'Tres etapas te separan de la corona: <b>Ruptura</b>, <b>Código</b> y <b>Juicio</b>.<br>Una sola caída puede costarlo todo.'
    }, function () { self._start(zone, game); }
    );
  },

  _start: function (zone, game) {
    var t0 = Date.now();
    var stageScore = 0;
    zone.innerHTML = '';
    var common = {
      finish: function (win, score, detail) {
        GameRuntime.finish({ win: win, score: score, timeMs: Date.now() - t0, detail: detail });
      }
    };

    function stageIntro(title, sub, next) {
      zone.innerHTML = '';
      zone.style.overflow = 'auto';
      var tr = document.createElement('div');
      tr.className = 'target-round';
      tr.innerHTML = '<div class="tr-title">' + title + '</div>' +
        '<div class="tr-sub">' + sub + '</div>' +
        '<button class="btn btn-primary" id="tr-go">INICIAR ETAPA</button>';
      zone.appendChild(tr);
      tr.querySelector('#tr-go').addEventListener('click', function () {
        SFX.click();
        tr.remove();
        next();
      });
    }

    /* ---------- ETAPA A: RUPTURA (velocidad) ---------- */
    function etapaRuptura() {
      stageIntro('ETAPA I · RUPTURA', 'Caza <b>15 señales</b> en 20 segundos.', function () {
        var A = { hits: 0, lives: 3, done: false };
        var stops = GameRuntime.setInt(function () { spawn(); }, 620);
        var comboEl = document.createElement('div');
        comboEl.style.cssText = 'position:absolute;top:10px;right:14px;z-index:5;font-family:var(--font-display);letter-spacing:.2em;font-size:13px;color:var(--gold-2);';
        comboEl.textContent = 'x1';
        zone.appendChild(comboEl);

        function spawn() {
          if (A.done) return;
          var p = randPos(GameRuntime.zone);
          var t = document.createElement('div');
          t.className = 'hit-target';
          t.style.width = '58px'; t.style.height = '58px';
          t.style.left = p.pctX * 100 + '%';
          t.style.top = p.pctY * 100 + '%';
          zone.appendChild(t);
          var captured = false;
          t.addEventListener('click', function () {
            if (captured || A.done) return;
            captured = true;
            A.hits++;
            stageScore += 40;
            SFX.correct();
            t.remove();
            if (A.hits >= 15) {
              A.done = true;
              clearInterval(stops);
              tmr.stop();
              GameRuntime.feedback(GameRuntime.zoneRect().width / 2, 100, 'ETAPA SUPERADA', 'good');
              GameRuntime.setTout(function () { etapaCodigo(); }, 900);
            }
          });
          GameRuntime.setTout(function () {
            if (!captured && t.parentNode) {
              captured = true;
              A.lives--;
              SFX.error();
              t.remove();
              if (A.lives <= 0 && !A.done) { A.done = true; clearInterval(stops); common.finish(false, stageScore, 'Ruptura: la velocidad venció a #017'); }
            }
          }, 1400);
        }

        var tmr = gameTimer(20, function () {
          if (!A.done) {
            A.done = true;
            clearInterval(stops);
            if (A.hits >= 15) GameRuntime.setTout(function () { etapaCodigo(); }, 900);
            else common.finish(false, stageScore, 'Ruptura: ' + A.hits + ' de 15 señales');
          }
        });
      });
    }

    /* ---------- ETAPA B: CÓDIGO (memoria simon) ---------- */
    function etapaCodigo() {
      stageIntro('ETAPA II · CÓDIGO', 'Repite la secuencia de los Padres. Cada ronda, una nota más larga.', function () {
        var cols = [['#d4af37', '#8a6d1f'], ['#a3292f', '#5c1017'], ['#2f6b48', '#143d28'], ['#3a4f9b', '#1c2a55']];
        var seq = [], round = 1, mistakes = 0;
        zone.innerHTML = '';
        var grid = document.createElement('div');
        grid.className = 'simon-grid';
        grid.style.cssText = 'grid-template-columns:repeat(2,1fr);position:absolute;inset:0;margin:auto;z-index:2;';
        var pads = [];
        for (var i = 0; i < cols.length; i++) {
          var pad = document.createElement('div');
          pad.className = 'simon-pad';
          pad.style.background = 'radial-gradient(circle at 50% 30%, ' + cols[i][0] + ',' + cols[i][1] + ')';
          grid.appendChild(pad);
          pads.push(pad);
        }
        var seqEl = document.createElement('div');
        seqEl.className = 'simon-seq';
        zone.appendChild(seqEl);
        zone.appendChild(grid);

        function nextRound(extra) {
          seq.push(Math.floor(rnd(0, 4)));
          if (extra) seq.push(Math.floor(rnd(0, 4)));
          seqEl.textContent = 'RONDA ' + round;
          showSeq(function () { waitInput(); });
        }

        function light(p) {
          pads[p].classList.add('lit');
          SFX.select();
          setTimeout(function () { pads[p].classList.remove('lit'); }, 300);
        }

        function showSeq(next) {
          var i = 0;
          function step() {
            if (i < seq.length) {
              light(seq[i]);
              GameRuntime.setTout(function () { i++; step(); }, 650);
            } else {
              GameRuntime.setTout(next, 500);
            }
          }
          step();
        }

        function waitInput() {
          var idx = 0;
          var accepting = true;
          var handlers = pads.map(function (pad, pi) {
            var fn = function () {
              if (!accepting) return;
              light(pi);
              if (pi === seq[idx]) {
                idx++;
                if (idx >= seq.length) {
                  accepting = false;
                  SFX.combo();
                  round++;
                  if (round > 4) {
                    seqEl.textContent = 'CÓDIGO VERIFICADO';
                    GameRuntime.setTout(function () { etapaJuicio(); }, 1000);
                  } else {
                    GameRuntime.setTout(function () { nextRound(round === 3); }, 700);
                  }
                }
              } else {
                mistakes++;
                SFX.error();
                if (mistakes >= 3) { accepting = false; common.finish(false, stageScore, 'Código: la secuencia venció tu memoria'); }
                else { seqEl.textContent = 'CÓDIGO ERRADO · INTENTA DE NUEVO'; }
              }
            };
            pad.addEventListener('click', fn);
            return fn;
          });
          GameRuntime.lns = GameRuntime.lns.concat(handlers.map(function (fn, i2) {
            return { el: pads[i2], type: 'click', fn: fn };
          }));
        }

        nextRound(false);
      });
    }

    /* ---------- ETAPA C: JUICIO (decisiones) ---------- */
    function etapaJuicio() {
      stageIntro('ETAPA III · JUICIO', 'Cinco dilemas. El Comité exige al menos <b>4</b> respuestas equilibradas.', function () {
        var pool = shuffle(SCENARIOS_JUICIO.slice()).slice(0, 5);
        var idx = 0, correct = 0;

        function one() {
          zone.innerHTML = '';
          zone.style.overflow = 'auto';
          if (idx >= pool.length) {
            if (correct >= 4) {
              stageScore += 300;
              common.finish(true, stageScore, 'La corona es de #017 · ' + correct + ' juicios equilibrados');
            } else {
              common.finish(false, stageScore, 'El Juicio se inclinó en tu contra · ' + correct + ' de 5');
            }
            return;
          }
          var sc = pool[idx];
          var wrap = document.createElement('div');
          wrap.className = 'scene-card';
          wrap.style.cssText = 'margin:10px auto;';
          wrap.innerHTML = '<div class="scene-kicker">JUICIO ' + (idx + 1) + ' DE 5</div>' +
            '<div class="scene-title">' + sc.text + '</div><div id="opts"></div>';
          var box = wrap.querySelector('#opts');
          sc.options.forEach(function (opt) {
            var b = document.createElement('button');
            b.className = 'scene-opt';
            b.textContent = opt.label;
            b.addEventListener('click', function () {
              SFX.click();
              box.querySelectorAll('.scene-opt').forEach(function (x) { x.disabled = true; });
              b.classList.add('pick');
              if (opt.good) { correct++; SFX.correct(); b.classList.add('good'); }
              else { SFX.error(); b.classList.add('bad'); }
              var info = document.createElement('div');
              info.style.cssText = 'margin-top:14px;text-align:center;font-family:var(--font-serif);font-style:italic;color:var(--gold-2);font-size:15px;';
              info.textContent = opt.good ? '“El Comité asiente.”' : '“El Comité toma nota.”';
              wrap.appendChild(info);
              var nxt = document.createElement('button');
              nxt.className = 'btn btn-primary';
              nxt.style.cssText = 'margin:20px auto 0;display:flex;';
              nxt.textContent = idx + 1 >= pool.length ? 'CONOCER EL VEREDICTO' : 'SIGUIENTE';
              nxt.addEventListener('click', function () { SFX.click(); idx++; one(); });
              wrap.appendChild(nxt);
            });
            box.appendChild(b);
          });
          zone.appendChild(wrap);
        }
        one();
      });
    }

    etapaRuptura();
  }
};
