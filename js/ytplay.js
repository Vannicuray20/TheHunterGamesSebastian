/* =========================================================
   HUNTER GAMES · CONCIERTO EN VIVO
   Busca la canción en YouTube y la reproduce al presionarla.
   Sin piezas de audio propias: cada canción se reproduce
   desde su video oficial encontrado en vivo.
   ========================================================= */
var YTPlay = (function () {
  var INSTANCES = [
    'https://invidious.f5.si',
    'https://yewtu.be',
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de',
    'https://vid.puffyan.us'
  ];
  var CACHEKEY = 'thg_ytcache';
  var dock = null, iframe = null, loading = null, labelEl = null, extEl = null;
  var currentEl = null, currentQuery = null;

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function build() {
    if (dock) return;
    dock = document.createElement('div');
    dock.id = 'yt-dock';
    dock.innerHTML =
      '<div class="yt-head"><span class="yt-ico">♪</span>' +
      '<span class="yt-lab" id="yt-dock-label">CONCIERTO</span>' +
      '<button class="yt-close" id="yt-dock-close" title="Cerrar el concierto">✕</button></div>' +
      '<div class="yt-stage"><div class="yt-load" id="yt-loading">Buscando la canción…</div>' +
      '<iframe id="yt-iframe" title="Concierto HUNTER GAMES" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>' +
      '<div class="yt-foot"><a id="yt-ext" href="#" target="_blank" rel="noopener">Abrir en YouTube ↗</a></div>';
    document.body.appendChild(dock);
    iframe = document.getElementById('yt-iframe');
    loading = document.getElementById('yt-loading');
    labelEl = document.getElementById('yt-dock-label');
    extEl = document.getElementById('yt-ext');
    document.getElementById('yt-dock-close').addEventListener('click', shut);
    iframe.addEventListener('load', function () { if (loading) loading.style.display = 'none'; });
  }

  function cacheGet(q) {
    try { var m = JSON.parse(localStorage.getItem(CACHEKEY) || '{}'); return m[q] || null; } catch (e) { return null; }
  }
  function cacheSet(q, id) {
    try { var m = JSON.parse(localStorage.getItem(CACHEKEY) || '{}'); m[q] = id; localStorage.setItem(CACHEKEY, JSON.stringify(m)); } catch (e) {}
  }

  function pick(list, q) {
    var nq = norm(q);
    var want = /billie eilish/.test(nq) ? 'billie eilish' : null;
    var tokens = nq.split(/[^a-z0-9]+/).filter(function (t) { return t.length > 1; });
    var best = null, bs = -1e9;
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var id = it.videoId;
      if (!id) continue;
      var title = norm(it.title || '');
      var author = norm(it.author || '');
      var s = 0;
      if (want && author.indexOf(want) >= 0) s += 70;
      if (author.indexOf('topic') >= 0) s += 10;
      var hits = 0;
      for (var k = 0; k < tokens.length; k++) { if (title.indexOf(tokens[k]) >= 0) hits++; }
      s += hits * 14;
      if (tokens.length && hits === tokens.length) s += 45;
      var len = it.lengthSeconds;
      if (len && len >= 110) s += 12; else if (len && len < 60) s -= 25;
      if (s > bs) { bs = s; best = id; }
    }
    return best;
  }

  function search(q) {
    var cached = cacheGet(q);
    if (cached) return Promise.resolve(cached);
    var list = INSTANCES.slice();
    function attempt() {
      if (!list.length) return Promise.reject(new Error('sin conexión'));
      var base = list.shift();
      return fetch(base + '/api/v1/search?type=video&q=' + encodeURIComponent(q))
        .then(function (r) { if (!r.ok) throw new Error('http' + r.status); return r.json(); })
        .then(function (arr) {
          if (!arr || !arr.length) throw new Error('vacío');
          var id = pick(arr, q);
          if (!id) throw new Error('sin buenos resultados');
          cacheSet(q, id);
          return id;
        })
        .catch(function () { return attempt(); });
    }
    return attempt();
  }

  function mark(el) {
    if (currentEl && currentEl !== el) currentEl.classList.remove('playing');
    currentEl = el || null;
    if (el) el.classList.add('playing');
  }

  function unmark() {
    if (currentEl) { currentEl.classList.remove('playing'); currentEl = null; }
  }

  function play(query, label, el) {
    build();
    currentQuery = query;
    mark(el);
    dock.style.display = 'flex';
    dock.dataset.state = 'loading';
    if (window.Music && Music.isOn) { try { Music.stop(); } catch (e) {} }
    labelEl.textContent = (label || 'Música') + ' ♪';
    extEl.href = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
    loading.style.display = 'flex';
    iframe.src = 'about:blank';
    search(query).then(function (id) {
      if (currentQuery !== query) return;
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
        '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      dock.dataset.state = 'play';
    }).catch(function () {
      if (currentQuery !== query) return;
      loading.style.display = 'none';
      labelEl.textContent = 'No se pudo conectar · usa “Abrir en YouTube”';
      dock.dataset.state = 'error';
    });
  }

  function shut() {
    currentQuery = null;
    unmark();
    if (dock) {
      if (iframe) iframe.src = 'about:blank';
      dock.style.display = 'none';
    }
  }

  return {
    play: play,
    shut: shut,
    on: function () { return !!(dock && dock.style.display === 'flex'); }
  };
})();