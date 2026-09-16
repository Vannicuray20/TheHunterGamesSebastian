/* =========================================================
   LOS JUEGOS · PARTÍCULAS Y CONFETI  ·  SEBASTIAN #017
   ========================================================= */

var FX = (function () {
  var canvas, ctx, W = 0, H = 0, parts = [], raf = null, streaming = false;

  var GOLD = ['#d4af37', '#f2dc8a', '#fff3c4', '#f6e27a', '#c9a227', '#9b1c2e', '#ffffff'];

  function init() {
    canvas = document.getElementById('fx-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    if (canvas) { canvas.width = W; canvas.height = H; }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 1;
      if (p.life <= 0 || p.y > H + 40 || p.x < -40 || p.x > W + 40) { parts.splice(i, 1); continue; }
      var a = Math.min(1, p.life / 30);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = a * p.alpha;
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2 * 0.6, p.size, p.size * 0.6);
      }
      ctx.restore();
    }
    if (parts.length > 0 || streaming) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = null;
      ctx.clearRect(0, 0, W, H);
    }
  }

  function ensure() { if (!raf) { loop(); } }

  function spawn(p) { parts.push(p); ensure(); }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function burst(x, y, count, opts) {
    opts = opts || {};
    for (var i = 0; i < count; i++) {
      var ang = rnd(0, Math.PI * 2);
      var sp = rnd(2, 11) * (opts.power != null ? opts.power : 1);
      spawn({
        x: x, y: y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 2,
        g: 0.25,
        rot: rnd(0, Math.PI * 2),
        vr: rnd(-0.2, 0.2),
        size: rnd(6, 14),
        color: opts.colors ? opts.colors[Math.floor(Math.random() * opts.colors.length)] : GOLD[Math.floor(Math.random() * GOLD.length)],
        shape: Math.random() < 0.25 ? 'circle' : 'rect',
        life: rnd(80, 160),
        alpha: rnd(0.7, 1)
      });
    }
  }

  function rain(durationMs, perFrame) {
    streaming = true;
    var until = Date.now() + (durationMs || 3000);
    perFrame = perFrame || 3;
    var last = 0;
    function frame() {
      if (Date.now() < until) {
        for (var i = 0; i < perFrame; i++) {
          spawn({
            x: rnd(0, W), y: -rnd(0, 120),
            vx: rnd(-0.8, 0.8), vy: rnd(1.4, 3.6),
            g: 0.05, rot: rnd(0, Math.PI * 2), vr: rnd(-0.15, 0.15),
            size: rnd(5, 12),
            color: GOLD[Math.floor(Math.random() * GOLD.length)],
            shape: Math.random() < 0.2 ? 'circle' : 'rect',
            life: rnd(160, 260), alpha: rnd(0.7, 1)
          });
        }
        last = requestAnimationFrame(frame);
      } else {
        streaming = false;
        if (last) cancelAnimationFrame(last);
      }
    }
    if (!raf) ensure();
    frame();
  }

  window.addEventListener('load', init);

  return { init: init, burst: burst, rain: rain, colors: GOLD };
})();