/* =========================================================
   THE HUNGER GAMES · CONCIERTO EN VIVO — PLAYLIST COMPLETA DE BILLIE EILISH
   Sin anuncios: cada canción se reproduce en un reproductor
   libre de publicidad (Invidious). Al terminar una canción,
   avanza sola a la siguiente hasta pasar por toda la playlist.
   ========================================================= */
var YTPlay = (function () {
  var SEARCH_HOSTS = [
    'https://invidious.f5.si',
    'https://invidious.tiekoetter.com',
    'https://yewtu.be',
    'https://invidious.nerdvpn.de'
  ];
  var EMBED_HOSTS = [
    'https://invidious.tiekoetter.com'
  ];
  var CACHEKEY = 'thg_ytcache';
  var KNOWN_IDS = {
    'ocean eyes': { v: 'viimfQi_pUw', l: 209 },
    'bad guy': { v: 'DyDfgMOUjCI', l: 206 },
    'lovely (con khalid)': { v: 'V1Pl8CzNzCw', l: 201 },
    "when the party's over": { v: 'pbMwTqkKSps', l: 194 },
    'everything i wanted': { v: 'EgBJmlPo8Xw', l: 288 },
    'bury a friend': { v: 'HUHC9tYz8ik', l: 213 },
    'you should see me in a crown': { v: 'Ah0Ys50CqO8', l: 181 }
  };
  var dock = null, iframe = null, nextFrame = null, curFrame = null, loading = null;
  var currentEl = null, currentQuery = null;
  var list = [], index = -1, active = false, endTimer = null;
  var embedLoaded = false;
  var onChange = null;

  function SONGS() {
    var out = [];
    if (window.PLAYLIST_BILLIE) {
      window.PLAYLIST_BILLIE.forEach(function (alb) {
        alb.tracks.forEach(function (t) {
          var known = KNOWN_IDS[norm(t)] || null;
          out.push({
            q: t + ' Billie Eilish',
            lab: t + ' · Billie Eilish',
            v: known ? known.v : null,
            l: known ? known.l : 0
          });
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
    dock.style.cssText =
      'position:fixed;left:-10000px;top:0;width:720px;height:405px;' +
      'transform:none;opacity:0;pointer-events:none;z-index:1;';
    dock.innerHTML =
      '<div class="yt-stage" style="position:relative;width:100%;height:100%;overflow:hidden;">' +
      '<iframe id="yt-iframe" title="Audio Billie Eilish" allow="autoplay; encrypted-media"' +
      ' style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"></iframe>' +
      '<iframe id="yt-iframe2" title="Siguiente" allow="autoplay; encrypted-media"' +
      ' style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"></iframe>' +
      '<div class="yt-load" id="yt-loading" style="position:absolute;top:0;left:0;right:0;bottom:0;display:none;' +
      'align-items:center;justify-content:center;">Conectando…</div>' +
      '<div id="yt-dock-label" style="display:none;"></div>' +
      '</div>';
    document.body.appendChild(dock);
    iframe = document.getElementById('yt-iframe');
    nextFrame = document.getElementById('yt-iframe2');
    curFrame = iframe;
    loading = document.getElementById('yt-loading');
    labelEl = document.getElementById('yt-dock-label');
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

  function loadEmbed(id, autoplay) {
    embedLoaded = false;
    curFrame = (curFrame === iframe) ? nextFrame : iframe;
    var url = EMBED_HOSTS[0] + '/embed/' + encodeURIComponent(id) +
      '?rel=0&playsinline=1' + (autoplay ? '&autoplay=1' : '');
    var frame = curFrame;
    frame.src = url;
    if (autoplay) {
      setTimeout(function () {
        if (!embedLoaded) {
          frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
            '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
        }
      }, 9000);
    }
  }

  function prefetchNext() {
    if (!list.length || !active) return;
    var n = (((index >= 0 ? index : 0) + 1) % list.length);
    var nx = list[n];
    if (!nx || !nx.v) return;
    var alt = (curFrame === iframe) ? nextFrame : iframe;
    alt.src = EMBED_HOSTS[0] + '/embed/' + encodeURIComponent(nx.v) + '?rel=0&playsinline=1';
  }

  function firstKnown() {
    var s = SONGS();
    for (var i = 0; i < s.length; i++) { if (s[i].v) return i; }
    return 0;
  }

  function warmAll() {
    var s = SONGS();
    var qs = [];
    for (var i = 0; i < s.length; i++) {
      if (!s[i].v && !cacheGet(s[i].q)) qs.push(s[i].q);
    }
    var k = 0;
    function step() {
      if (k >= qs.length) return;
      var q = qs[k++];
      search(q).then(function () { setTimeout(step, 500); }).catch(function () { setTimeout(step, 500); });
    }
    setTimeout(step, 800);
  }

  function prewarm() {
    build();
    var s = SONGS();
    if (!s.length) return;
    var first = s[firstKnown()];
    var id = first.v;
    if (!id) { var c = cacheGet(first.q); id = c ? c.v : null; }
    if (id) loadEmbed(id, true);
    warmAll();
  }

  function playVideo(q, lab, el) {
    build();
    list = SONGS();
    currentQuery = q;
    mark(el);
    active = true;
    clearEnd();
    labelEl.textContent = (lab || 'Música') + ' ♪';
    loading.style.display = 'flex';
    var song = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].q === q) { song = list[i]; break; }
    }
    if (song && song.v) {
      loadEmbed(song.v, true);
      scheduleEnd(song.l);
      prefetchNext();
      return;
    }
    search(q).then(function (v) {
      if (currentQuery !== q) return;
      loadEmbed(v.v, true);
      scheduleEnd(v.l);
      prefetchNext();
    }).catch(function () {
      if (currentQuery !== q) return;
      active = false;
      clearEnd();
      hideLoading();
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
    var i = index >= 0 ? index : firstKnown();
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
    if (dock) { dock.style.display = 'none'; }
    sync();
  }

  return {
    play: playVideo,
    startPlaylist: startPlaylist,
    next: next,
    pause: pause,
    shut: shut,
    prewarm: prewarm,
    on: function () { return !!active; },
    playing: function () { return !!active; },
    now: function () { return (index >= 0 && list[index]) ? list[index].lab : ''; },
    setOnChange: function (fn) { onChange = fn; }
  };
})();