/* =========================================================
   THE HUNGER GAMES · CONCIERTO EN VIVO — PLAYLIST COMPLETA DE BILLIE EILISH
   Al iniciar la partida la playlist arranca sola y se reproduce
   toda, en orden. Cada canción se busca en vivo y se emite
   dentro del juego. Al terminar una canción, sigue la siguiente.
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
  var dock = null, slot = null, loading = null, labelEl = null, extEl = null;
  var player = null, fallback = null, currentEl = null, currentQuery = null;
  var list = [], index = -1, active = false;
  var apiReady = false, apiTimedOut = false;
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
      '<div class="yt-stage"><div id="yt-slot"></div>' +
      '<div class="yt-load" id="yt-loading">Conectando a la playlist…</div></div>' +
      '<div class="yt-foot"><a id="yt-ext" href="#" target="_blank" rel="noopener">Abrir en YouTube ↗</a></div>';
    document.body.appendChild(dock);
    slot = document.getElementById('yt-slot');
    loading = document.getElementById('yt-loading');
    labelEl = document.getElementById('yt-dock-label');
    extEl = document.getElementById('yt-ext');
    document.getElementById('yt-dock-close').addEventListener('click', shut);
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

  function ensureAPI(cb) {
    if (window.YT && window.YT.Player && apiReady) { cb(true); return; }
    if (apiTimedOut) { cb(false); return; }
    cb._stack = true;
    var boot = false;
    if (!window.__thgApiCbs) { window.__thgApiCbs = []; boot = true; }
    window.__thgApiCbs.push(cb);
    if (!boot) return;
    window.__thgApiBoot = true;
    window.onYouTubeIframeAPIReady = function () {
      apiReady = true;
      var cbs = window.__thgApiCbs; window.__thgApiCbs = [];
      cbs.forEach(function (f) { f(true); });
    };
    setTimeout(function () {
      if (!apiReady && window.__thgApiCbs) {
        apiTimedOut = true;
        var cbs = window.__thgApiCbs; window.__thgApiCbs = [];
        cbs.forEach(function (f) { f(false); });
      }
    }, 9000);
    var s = document.createElement('script');
    s.id = 'thg-yt-api';
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }

  function cacheGet(q) {
    try { var m = JSON.parse(localStorage.getItem(CACHEKEY) || '{}'); return m[q] || null; } catch (e) { return null; }
  }
  function cacheSet(q, id) {
    try { var m = JSON.parse(localStorage.getItem(CACHEKEY) || '{}'); m[q] = id; localStorage.setItem(CACHEKEY, JSON.stringify(m)); } catch (e) {}
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
      if (s > bs) { bs = s; best = id; }
    }
    return best;
  }

  function search(q) {
    var cached = cacheGet(q);
    if (cached) return Promise.resolve(cached);
    var list_ = INSTANCES.slice();
    function attempt() {
      if (!list_.length) return Promise.reject(new Error('sin conexión'));
      var base = list_.shift();
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

  function prepareFallback(url) {
    if (!fallback) {
      fallback = document.createElement('iframe');
      fallback.id = 'yt-iframe';
      fallback.title = 'Concierto Billie Eilish';
      fallback.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
      fallback.setAttribute('allowfullscreen', '');
      slot.appendChild(fallback);
    }
    fallback.src = url;
    fallback.style.display = 'block';
  }

  function playInPlayer(id) {
    if (!window.YT || !window.YT.Player) return false;
    if (!player) {
      player = new YT.Player(slot, {
        videoId: id,
        playerVars: {
          autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1,
          enablejsapi: 1, origin: location.origin
        },
        events: {
          onReady: function (e) { try { e.target.playVideo(); } catch (err) {} },
          onStateChange: onState,
          onError: function () {
            active = false;
            if (dock) dock.dataset.state = 'error';
            sync();
          }
        }
      });
    } else {
      player.loadVideoById(id);
    }
    return true;
  }

  function onState(e) {
    var ST = (window.YT && window.YT.PlayerState) || { ENDED: 0, PLAYING: 1 };
    if (e.data === ST.PLAYING) {
      active = true;
      if (loading) loading.style.display = 'none';
      if (dock) dock.dataset.state = 'play';
      sync();
    } else if (e.data === ST.ENDED) {
      setTimeout(function () { if (active) next(); }, 900);
    }
  }

  function playVideo(q, lab, el) {
    build();
    list = SONGS();
    currentQuery = q;
    mark(el);
    active = true;
    dock.style.display = 'flex';
    dock.dataset.state = 'loading';
    labelEl.textContent = (lab || 'Música') + ' ♪';
    extEl.href = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
    loading.style.display = 'flex';
    search(q).then(function (id) {
      if (currentQuery !== q) return;
      var ok = playInPlayer(id);
      if (!ok) {
        prepareFallback('https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
          '?autoplay=1&rel=0&modestbranding=1&playsinline=1');
      }
      if (dock) dock.dataset.state = 'play';
    }).catch(function () {
      if (currentQuery !== q) return;
      active = false;
      loading.style.display = 'none';
      labelEl.textContent = 'No se pudo conectar · abre en YouTube';
      if (dock) dock.dataset.state = 'error';
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
    if (active && dock && dock.style.display !== 'flex') return;
    list = SONGS();
    if (!list.length) return;
    playListIndex(index < 0 ? 0 : index + 1);
  }

  function pause() {
    active = false;
    if (player) { try { player.pauseVideo(); } catch (e) {} }
    if (fallback) { try { fallback.src = 'about:blank'; fallback.style.display = 'none'; } catch (e) {} }
    if (dock) dock.style.display = 'none';
    unmark();
    sync();
  }

  function shut() {
    currentQuery = null;
    active = false;
    if (player) { try { player.stopVideo(); } catch (e) {} }
    if (fallback) { try { fallback.src = 'about:blank'; } catch (e) {} }
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