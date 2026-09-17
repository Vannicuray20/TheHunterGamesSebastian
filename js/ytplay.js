/* =========================================================
   THE HUNGER GAMES · CONCIERTO EN VIVO — PLAYLIST COMPLETA DE BILLIE EILISH
   Sin anuncios: cada canción se reproduce en un reproductor
   libre de publicidad (Invidious). Al terminar una canción,
   avanza sola a la siguiente hasta pasar por toda la playlist.
   ========================================================= */
var YTPlay = (function () {
  var SEARCH_HOSTS = [
    'https://invidious.f5.si',
    'https://yewtu.be',
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de',
    'https://vid.puffyan.us'
  ];
  var EMBED_HOSTS = [
    'https://invidious.f5.si',
    'https://yewtu.be',
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de'
  ];
  var CACHEKEY = 'thg_ytcache';
  var dock = null, iframe = null, loading = null, labelEl = null, extEl = null;
  var currentEl = null, currentQuery = null;
  var list = [], index = -1, active = false, endTimer = null;
  var embedLoaded = false, embedAttempt = 0;
  var onChange = null;

  function SONGS() {
    var out = [];
    if (window.PLAYLIST_BILLIE) {
      window.PLAYLIST_BILLIE.forEach(function (alb) {
        alb.tracks.forEach(function (t) {
          out.push({ q: t + ' Billie Eilish', lab: t + ' · Billie Eilish' });
        });
      });
    }
    return out;
  }

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function build() {
    if (dock) return;
    dock = document.createElement('div');
    dock.id = 'yt-dock';
    dock.dataset.state = 'idle';
    dock.innerHTML =
      '<div class="yt-head"><span class="yt-ico">♪</span>' +
      '<span class="yt-lab" id="yt-dock-label">BILLIE EILISH · PLAYLIST</span>' +
      '<button class="yt-close" id="yt-dock-close" title="Cerrar el concierto">✕</button></div>' +
      '<div class="yt-stage"><iframe id="yt-iframe" title="Concierto Billie Eilish" ' +
      'allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>' +
      '<div class="yt-load" id="yt-loading">Conectando sin anuncios…</div></div>' +
      '<div class="yt-foot"><a id="yt-ext" href="#" target="_blank" rel="noopener">Abrir en YouTube ↗</a></div>';
    document.body.appendChild(dock);
    iframe = document.getElementById('yt-iframe');
    loading = document.getElementById('yt-loading');
    labelEl = document.getElementById('yt-dock-label');
    extEl = document.getElementById('yt-ext');
    document.getElementById('yt-dock-close').addEventListener('click', shut);
    iframe.addEventListener('load', function () { embedLoaded = true; hideLoading(); });
  }

  function hideLoading() {
    if (loading) loading.style.display = 'none';
  }

  function sync() {
    if (onChange) { try { onChange(); } catch (e) {} }
  }

  function chipFor(q) {
    var els = document.querySelectorAll('.billie-chip');
    for (var i = 0; i < els.length; i++) {
      if (els[i].getAttribute('data-q') === q) return els[i];
    }
    return null;
  }

  function mark(el) {
    if (currentEl && currentEl !== el) currentEl.classList.remove('playing');
    currentEl = el || null;
    if (el) el.classList.add('playing');
  }

  function unmark() {
    if (currentEl) { currentEl.classList.remove('playing'); currentEl = null; }
  }

  function cacheGet(q) {
    try { var m = JSON.parse(localStorage.getItem(CACHEKEY) || '{}'); return m[q] || null; } catch (e) { return null; }
  }
  function cacheSet(q, v) {
    try { var m = JSON.parse(localStorage.getItem(CACHEKEY) || '{}'); m[q] = v; localStorage.setItem(CACHEKEY, JSON.stringify(m)); } catch (e) {}
  }

  function pick(list_, q) {
    var nq = norm(q);
    var want = /billie eilish/.test(nq) ? 'billie eilish' : null;
    var tokens = nq.split(/[^a-z0-9]+/).filter(function (t) { return t.length > 1; });
    var best = null, bs = -1e9;
    for (var i = 0; i < list_.length; i++) {
      var it = list_[i];
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
      if (s > bs) { bs = s; best = it; }
    }
    return best;
  }

  function search(q) {
    var cached = cacheGet(q);
    if (cached) return Promise.resolve({ vid: cached.v, len: cached.l });
    var hosts = SEARCH_HOSTS.slice();
    function attempt() {
      if (!hosts.length) return Promise.reject(new Error('sin conexión'));
      var base = hosts.shift();
      return fetch(base + '/api/v1/search?type=video&q=' + encodeURIComponent(q))
        .then(function (r) { if (!r.ok) throw new Error('http' + r.status); return r.json(); })
        .then(function (arr) {
          if (!arr || !arr.length) throw new Error('vacío');
          var it = pick(arr, q);
          if (!it) throw new Error('sin buenos resultados');
          var v = { v: it.videoId, l: it.lengthSeconds || 0 };
          cacheSet(q, v);
          return v;
        })
        .catch(function () { return attempt(); });
    }
    return attempt();
  }

  function clearEnd() {
    if (endTimer) { clearTimeout(endTimer); endTimer = null; }
  }

  function scheduleEnd(len) {
    clearEnd();
    var wait = Math.max((len > 0 ? len : 200) + 2, 15) * 1000;
    endTimer = setTimeout(function () {
      endTimer = null;
      if (active) next();
    }, wait);
  }

  function loadEmbed(id, tries) {
    embedLoaded = false;
    embedAttempt = 0;
    function tryHost() {
      if (!iframe) return;
      var base = EMBED_HOSTS[embedAttempt];
      if (!base) { hideLoading(); return; }
      embedLoaded = false;
      iframe.src = base + '/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&playsinline=1';
      setTimeout(function () {
        if (!embedLoaded && embedAttempt < EMBED_HOSTS.length - 1) {
          embedAttempt++;
          tryHost();
        }
      }, 7000);
    }
    tryHost();
  }

  function playVideo(q, lab, el) {
    build();
    list = SONGS();
    currentQuery = q;
    mark(el);
    active = true;
    clearEnd();
    dock.style.display = 'flex';
    dock.dataset.state = 'loading';
    labelEl.textContent = (lab || 'Música') + ' ♪';
    extEl.href = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
    loading.style.display = 'flex';
    search(q).then(function (v) {
      if (currentQuery !== q) return;
      loadEmbed(v.v, 0);
      scheduleEnd(v.l);
      dock.dataset.state = 'play';
    }).catch(function () {
      if (currentQuery !== q) return;
      active = false;
      clearEnd();
      hideLoading();
      labelEl.textContent = 'Sin conexión · abre en YouTube';
      dock.dataset.state = 'error';
      sync();
    });
  }

  function playListIndex(i) {
    list = SONGS();
    if (!list.length) return false;
    i = ((i % list.length) + list.length) % list.length;
    index = i;
    var s = list[index];
    playVideo(s.q, s.lab, chipFor(s.q));
    return true;
  }

  function startPlaylist() {
    if (active && dock && dock.style.display === 'flex') return;
    list = SONGS();
    if (!list.length) return;
    active = true;
    var i = index >= 0 ? index : Math.floor(Math.random() * list.length);
    playListIndex(i);
  }

  function next() {
    list = SONGS();
    if (!list.length) return;
    playListIndex(index < 0 ? 0 : index + 1);
  }

  function pause() {
    active = false;
    clearEnd();
    if (iframe) { try { iframe.src = 'about:blank'; } catch (e) {} }
    if (dock) dock.style.display = 'none';
    unmark();
    sync();
  }

  function shut() {
    currentQuery = null;
    active = false;
    clearEnd();
    if (iframe) { try { iframe.src = 'about:blank'; } catch (e) {} }
    unmark();
    if (dock) { dock.style.display = 'none'; dock.dataset.state = 'idle'; }
    sync();
  }

  return {
    play: playVideo,
    startPlaylist: startPlaylist,
    next: next,
    pause: pause,
    shut: shut,
    on: function () { return !!active; },
    playing: function () { return !!active; },
    now: function () { return (index >= 0 && list[index]) ? list[index].lab : ''; },
    setOnChange: function (fn) { onChange = fn; }
  };
})();