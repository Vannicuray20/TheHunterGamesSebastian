/* =========================================================
   LOS JUEGOS · DIRECCIÓN Y EXPERIENCIA  ·  SEBASTIAN #017
   ========================================================= */

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  var routing = false;
  var pendingDiploma = null;
  var lastResult = null;
  var activeGame = { id: null, idx: 0 };
  var justIntro = false;

  /* ------------------------------------------------ rutas */
  function afterShow(id) {
    if (id === 'arena') renderArena();
    if (id === 'expediente') renderExpediente();
    if (id === 'fame') renderFame();
    if (id === 'diplomas') renderDiplomas();
    if (id === 'howto') renderHowto();
    if (id === 'playlist') renderPlaylist();
    if (id === 'diploma-view' && pendingDiploma) renderDiplomaView(pendingDiploma);
  }

  function go(id) {
    if (routing) return;
    routing = true;
    SFX.init();
    SFX.whoosh();
    var old = document.querySelector('.screen.is-active');
    var nw = document.getElementById('screen-' + id);
    if (!nw) { routing = false; return; }
    if (old && old !== nw) {
      old.classList.remove('is-active');
      old.classList.add('leaving');
      setTimeout(function () {
        old.classList.remove('leaving');
        nw.classList.add('is-active');
        routing = false;
        window.scrollTo(0, 0);
        afterShow(id);
      }, 440);
    } else {
      nw.classList.add('is-active');
      routing = false;
      afterShow(id);
    }
  }

  /* ------------------------------------------------ toasts */
  var toastTimer = null;
  function toast(msg, ms) {
    var t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove('show');
      t.classList.add('hide');
      setTimeout(function () { t.hidden = true; t.classList.remove('hide'); }, 650);
    }, ms || 3400);
  }

  /* ------------------------------------------------ RNG */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function makeLeaderboard(res) {
    var g = GAMES[res.idx];
    var rand = mulberry32((g.id.split('').reduce(function (a, c) { return a * 31 + c.charCodeAt(0) | 0; }, 7)) + (res.score || 0) * 13 + (Store.get().attempts[g.id] || 1) * 7919);
    var rows = INTERVALS.map(function (r) {
      var score;
      if (res.win) {
        score = Math.round((res.score * 0.45 + rand() * res.score * 0.45));
      } else {
        score = Math.round(rand() * 2600);
      }
      return { num: r.num, nombre: r.nombre, score: score };
    });
    rows.push({ num: PARTICIPANTE.numero, nombre: PARTICIPANTE.nombre, score: res.score, seba: true });
    rows.sort(function (a, b) { return b.score - a.score; });
    var pos = 0;
    for (var i = 0; i < rows.length; i++) { if (rows[i].seba) { pos = i + 1; break; } }
    if (res.win) pos = 1;
    return { rows: rows, position: pos };
  }

  function positionName(n) {
    return n + 'º PUESTO';
  }

  function makeDiploma(res, lb) {
    var g = GAMES[res.idx];
    var d = Store.get();
    var existing = d.diplomas[g.id];
    var victoryNo = existing ? existing.victoryNo : d.orderOfWins.length;
    var vn = String(victoryNo);
    while (vn.length < 2) vn = '0' + vn;
    return {
      nombre: PARTICIPANTE.nombre,
      numero: PARTICIPANTE.numero,
      gameId: g.id,
      numeral: g.numeral,
      gameTitle: 'JUEGO ' + g.numeral + ' — ' + g.title,
      gameSub: g.subtitle.toUpperCase(),
      letter: GAME_LETTERS[g.id],
      motto: GAME_MOTTOES[g.id],
      difficulty: g.difficulty,
      difficultyValue: g.difficultyValue,
      score: res.score,
      positionName: positionName(lb ? lb.position : 1),
      time: Store.fmtTime(res.timeMs),
      victoryNo: victoryNo,
      victoryNoText: vn,
      certCode: Store.genCertCode(victoryNo),
      dateISO: new Date().toISOString(),
      dateText: Store.formatDate(new Date()),
      rank: Store.rank(),
      firma: 'El Comité de los Juegos'
    };
  }

  /* ------------------------------------------------ secuencias */
  function playSequence(blockId, seq, cb) {
    var block = $(blockId);
    block.innerHTML = '';
    seq.forEach(function (item, i) {
      setTimeout(function () {
        var d = document.createElement('div');
        d.innerHTML = item.html;
        block.appendChild(d);
        SFX.select();
        if (i === Math.floor(seq.length / 2)) SFX.confirm();
        if (i === seq.length - 1) SFX.unlock();
      }, i * 980);
    });
    setTimeout(function () { if (cb) cb(); }, seq.length * 980 + 500);
  }

  /* ------------------------------------------------ flujo inicio */
  function clickIniciar() {
    SFX.init(); SFX.start(); SFX.click();
    if (!Store.get().firstTimeDone) {
      startIdentityFlow();
    } else {
      toast(MESSAGES.enter, 3000);
      go('arena');
    }
    YTPlay.startPlaylist();
  }

  function startIdentityFlow() {
    go('identity');
    $('seq-id-continue').hidden = true;
    playSequence('seq-id-block', SEQ_IDENTITY, function () {
      $('seq-id-continue').hidden = false;
    });
  }

  function startPresentacion() {
    var d = Store.get();
    d.firstTimeDone = true;
    Store.save();
    justIntro = true;
    $('seq-pres-continue').hidden = true;
    playSequence('seq-pres-block', SEQ_PRESENTACION, function () {
      $('seq-pres-continue').hidden = false;
    });
  }

  /* ------------------------------------------------ arena */
  function renderArena() {
    $('arena-rank').textContent = Store.rank();
    $('arena-pts').textContent = Store.get().totalScore + ' PTOS';
    var grid = $('game-grid');
    grid.innerHTML = '';
    var nextI = Store.nextLockedIndex();

    GAMES.forEach(function (g, i) {
      var won = Store.hasWon(g.id);
      var unlocked = Store.isUnlocked(i);
      var card = document.createElement('div');
      card.className = 'game-card' + (won ? ' unlocked' : '') + (unlocked ? '' : ' locked');
      if (unlocked && i === nextI) {
        card.style.borderColor = 'rgba(212,175,55,.75)';
        card.style.boxShadow = '0 18px 60px rgba(212,175,55,.22), var(--shadow)';
      }

      var badge = won ? '<span class="gc-badge done">CONQUISTADO</span>' :
        (unlocked ? '<span class="gc-badge">DISPONIBLE</span>' : '');

      card.innerHTML =
        '<div class="gc-top">' +
          '<span class="gc-no">JUEGO ' + g.numeral + '</span>' + badge +
        '</div>' +
        '<div class="gc-icon">' + icon(g.icon) + '</div>' +
        '<div class="gc-title">' + g.title + '</div>' +
        '<div class="gc-sub">' + g.subtitle + '</div>' +
        '<div class="gc-line">' + g.objective + '</div>' +
        '<div class="gc-meta"><span>' + g.difficulty + '</span><span>' + g.area + '</span></div>';

      if (unlocked) {
        var b = document.createElement('button');
        b.className = 'btn ' + (i === nextI ? 'btn-primary' : 'btn-ghost') + ' btn-sm';
        b.style.cssText = 'margin-top:14px;width:100%;position:relative;z-index:2;';
        b.textContent = won ? 'REPETIR DESAFÍO' : 'ENTRAR A LA ARENA';
        b.addEventListener('click', function () { enterGame(i); });
        card.appendChild(b);
      } else {
        var lock = document.createElement('div');
        lock.className = 'gc-lock';
        lock.innerHTML = '<span>' + icon('lock') + ' BLOQUEADO</span>';
        card.appendChild(lock);
      }
      grid.appendChild(card);
    });
  }

  function enterGame(idx) {
    var g = GAMES[idx];
    activeGame = { id: g.id, idx: idx };
    SFX.init(); SFX.start(); SFX.click();
    $('hud-game').textContent = 'JUEGO ' + g.numeral;
    $('hud-name').textContent = g.title;
    $('hud-timer').textContent = '00:00';
    $('hud-score').textContent = '0';
    $('hud-timer').classList.remove('warn');
    GameRuntime.reset($('game-zone'), $('hud-timer'), $('hud-score'));
    GameRuntime.onEnd = function (res) {
      res.gameId = g.id; res.idx = idx;
      onGameEnd(res);
    };
    go('game');
    Games[g.id].play($('game-zone'), g);
  }

  /* ------------------------------------------------ fin de partida */
  var STAT_SECONDARY = {
    seleccion: 'precision', arena: 'combate', laberinto: 'supervivencia',
    caza: 'precision', refugio: 'relaciones', noche: 'precision', final: 'estrategia'
  };

  function onGameEnd(res) {
    var g = GAMES[res.idx];
    var wasWonBefore = Store.hasWon(g.id);

    Store.registerResult(res);
    Store.addStat(g.statKey, res.win ? 30 : 10);
    Store.addStat(STAT_SECONDARY[g.id], res.win ? 12 : 5);

    var lb = makeLeaderboard(res);

    if (res.win) {
      var rankBefore = Store.rank();
      var isNewWin = !wasWonBefore;
      var doc = null;
      if (isNewWin) {
        doc = makeDiploma(res, lb);
        Store.storeDiploma(res, doc);
      } else {
        doc = Store.get().diplomas[g.id];
      }
      pendingDiploma = doc;
      lastResult = res;

      if (isNewWin) {
        var rankAfter = Store.rank();
        if (rankAfter !== rankBefore) {
          SFX.rankUp();
          toast('NUEVO RANGO OBTENIDO: ' + rankAfter, 4000);
        }
      }
      renderResult(res, lb, isNewWin);
      go('result');
    } else {
      SFX.lose();
      renderResult(res, lb, false);
      go('result');
    }
  }

  function renderResult(res, lb, isNewWin) {
    var g = GAMES[res.idx];
    var card = $('result-card');
    var title = res.win
      ? '<h2 class="result-title win">VICTORIA CONFIRMADA</h2>'
      : '<h2 class="result-title lose">DERROTA EN LA ARENA</h2>';
    var msg = res.win
      ? 'Felicidades, Sebastian.'
      : 'No terminó como esperabas, Sebastian.';

    card.innerHTML =
      '<div class="result-panel">' +
        title +
        '<p class="result-msg">“' + msg + '”</p>' +
        '<div class="result-grid">' +
          cell('Participante', '#017') +
          cell('Juego', g.title) +
          cell('Resultado', res.win ? 'VICTORIA' : 'DERROTA') +
          cell('Tiempo', Store.fmtTime(res.timeMs)) +
          cell('Puntuación', res.score) +
          cell('Posición', lb.position === 1 ? '<span class="rank1">#1</span>' : '#' + lb.position) +
        '</div>' +
      '</div>';

    var table = $('result-table');
    var head = '<table><thead><tr><th>Participante</th><th>Nombre</th><th>Puntuación</th></tr></thead><tbody>';
    var body = lb.rows.map(function (r) {
      var star = r.seba ? ' · <span style="color:var(--gold-2)">#017</span>' : '';
      return '<tr class="' + (r.seba ? 'seba' : '') + '"><td>' + r.num + '</td><td>' + r.nombre + star + '</td><td>' + r.score + '</td></tr>';
    }).join('');
    table.innerHTML = head + body + '</tbody></table>';

    var act = $('result-actions');
    act.innerHTML = '';
    if (res.win) {
      addBtn(act, '🏆 ' + (isNewWin ? 'RECLAMAR MI DIPLOMA' : 'VER DIPLOMA'), 'btn-primary', function () { SFX.click(); showVictoryCinematic(); });
      if (Store.nextLockedIndex() > -1) {
        addBtn(act, 'SIGUIENTE JUEGO', 'btn-ghost', function () { SFX.click(); go('arena'); });
      }
      addBtn(act, 'GALERÍA DE VICTORIAS', 'btn-ghost', function () { SFX.click(); go('diplomas'); });
      addBtn(act, 'VOLVER A LA ARENA', 'btn-ghost', function () { SFX.click(); go('arena'); });
    } else {
      addBtn(act, 'REINTENTAR DESAFÍO', 'btn-primary', function () { SFX.click(); enterGame(res.idx); });
      addBtn(act, 'VOLVER A LA ARENA', 'btn-ghost', function () { SFX.click(); go('arena'); });
    }
  }

  function cell(k, v) {
    return '<div class="result-cell"><div class="k">' + k + '</div><div class="v">' + v + '</div></div>';
  }
  function addBtn(parent, txt, cls, fn) {
    var b = document.createElement('button');
    b.className = 'btn ' + cls;
    b.innerHTML = txt;
    b.addEventListener('click', fn);
    parent.appendChild(b);
  }

  /* ------------------------------------------------ victoria cinematográfica */
  function showVictoryCinematic() {
    go('victory');
    ['vseq-a', 'vseq-b', 'vseq-c', 'vseq-d', 'vseq-e'].forEach(function (id) {
      $(id).classList.remove('show');
    });
    SFX.win();
    var seq = [
      { el: 'vseq-a', delay: 500 },
      { el: 'vseq-b', delay: 1700 },
      { el: 'vseq-c', delay: 2900 },
      { el: 'vseq-d', delay: 4300 },
      { el: 'vseq-e', delay: 6500 }
    ];
    seq.forEach(function (it) {
      setTimeout(function () {
        var el = $(it.el);
        if (!el) return;
        if (it.el === 'vseq-d') {
          SFX.unlock();
          FX.rain(6000, 4);
        }
        if (it.el === 'vseq-e') {
          SFX.diploma();
          toast(MESSAGES.diplomaClaim, 4000);
        }
        el.classList.add('show');
      }, it.delay);
    });
    setTimeout(function () { $('vseq-e').classList.add('show'); }, 6700);
  }

  function openDiplomaModal() {
    if (!pendingDiploma) return;
    SFX.click();
    var stage = $('diploma-stage');
    stage.innerHTML = '<div class="diploma-preview">' + buildDiplomaHTML(pendingDiploma) + '</div>';
    $('diploma-modal').hidden = false;
  }

  function closeDiplomaModal() { $('diploma-modal').hidden = true; }

  function renderDiplomaView(doc) {
    $('dview-doc').innerHTML = buildDiplomaHTML(doc);
  }

  function downloadCurrent() {
    if (!pendingDiploma) return;
    SFX.diploma();
    downloadDiploma(pendingDiploma);
    toast('Descargando ' + pendingDiploma.certCode + '...', 3000);
  }

  /* ------------------------------------------------ sala / fondo */
  function renderExpediente() {
    var d = Store.get();
    var card = $('file-card');
    card.innerHTML =
      '<div class="file-top">' +
        '<div>' +
          '<div class="file-idline">EXPEDIENTE ' + PARTICIPANTE.numero + '</div>' +
          '<div class="file-name">' + PARTICIPANTE.nombre + '</div>' +
          '<div class="file-state"><span class="dot"></span> ESTADO: ACTIVO</div>' +
        '</div>' +
        '<div class="file-seal">' + sealSVG('exp') + '</div>' +
      '</div>' +
      '<div class="file-data">' +
        item('Nombre', PARTICIPANTE.nombre) +
        item('Número', PARTICIPANTE.numero) +
        item('Estado', 'ACTIVO') +
        item('Nivel / Rango', Store.rank()) +
        item('Victorias', d.victorias.length) +
        item('Juegos disputados', d.gamesPlayed) +
        item('Juegos completados', d.gamesCompleted) +
        item('Diplomas obtenidos', d.orderOfWins.length) +
      '</div>';

    var sg = $('stats-grid');
    sg.innerHTML = '';
    STAT_DEFS.forEach(function (st) {
      var val = d.stats[st.key] || 0;
      var el = document.createElement('div');
      el.className = 'stat-card stat-pop';
      el.innerHTML =
        '<div class="stat-icon">' + icon(st.icon) + '</div>' +
        '<div class="stat-body">' +
          '<div class="stat-label">' + st.label + '</div>' +
          '<div class="stat-val">' + val + '</div>' +
          '<div class="stat-bar"><i style="width:' + Math.min(100, val) + '%"></i></div>' +
        '</div>';
      sg.appendChild(el);
    });

    var rt = $('rank-track');
    rt.innerHTML = '';
    RANKS.forEach(function (r) {
      var d2 = Store.get();
      var on = Store.rank() === r.label;
      var earned = d2.victorias.length >= r.min;
      var chip = document.createElement('div');
      chip.className = 'rank-chip' + (on ? ' on' : '') + (earned && !on ? ' earned' : '');
      chip.textContent = r.label;
      rt.appendChild(chip);
    });
  }

  function item(k, v) {
    return '<div class="file-item"><div class="k">' + k + '</div><div class="v">' + v + '</div></div>';
  }

  function renderFame() {
    var d = Store.get();
    var wins = d.victorias.length;
    var card = $('fame-card');
    card.innerHTML =
      '<div class="fame-sub">SALÓN DE LA FAMA · ' + PARTICIPANTE.numero + '</div>' +
      '<div class="fame-name">' + PARTICIPANTE.nombre + '</div>' +
      '<div class="fame-sub">' + PARTICIPANTE.numero + ' · RANGO ' + Store.rank() + '</div>' +
      '<div class="fame-counters">' +
        c('🏆 Victorias', wins) + c('🎓 Diplomas', d.orderOfWins.length) +
        c('⚔️ Desafíos completados', d.gamesCompleted) + c('⭐ Puntos', d.totalScore) +
      '</div>';

    var medals = $('fame-medals');
    medals.innerHTML = '';
    GAMES.forEach(function (g, i) {
      var m = document.createElement('div');
      m.className = 'medal ' + (i < wins ? '' : 'locked-medal');
      m.innerHTML = icon(i < wins ? 'medal' : 'lock') +
        '<span class="m-t">Victoria ' + String(i + 1 < 10 ? '0' + (i + 1) : i + 1) + '</span>' +
        '<span class="m-g">' + g.title + '</span>';
      medals.appendChild(m);
    });
  }

  function c(n, v) {
    return '<div class="fame-counter"><div class="n">' + v + '</div><div class="l">' + n + '</div></div>';
  }

  function renderDiplomas() {
    var d = Store.get();
    var grid = $('diploma-grid');
    grid.innerHTML = '';
    GAMES.forEach(function (g) {
      var doc = d.diplomas[g.id];
      var el = document.createElement('div');
      el.className = 'dip-card ' + (doc ? 'unlocked' : 'locked');
      if (doc) {
        el.innerHTML =
          '<div class="dip-icon">' + icon('trophy') + '</div>' +
          '<div class="dip-title">' + g.title + '</div>' +
          '<span class="dip-state">🔓 DESBLOQUEADO</span>' +
          '<div class="dip-code">' + doc.certCode + ' · VICTORIA N.º ' + doc.victoryNoText + '</div>' +
          '<div class="dip-actions">' +
            '<button class="btn btn-ghost btn-sm" data-a="view">VER</button>' +
            '<button class="btn btn-primary btn-sm" data-a="dl">DESCARGAR PDF</button>' +
          '</div>';
        el.querySelector('[data-a="view"]').addEventListener('click', function () {
          pendingDiploma = doc;
          go('diploma-view');
        });
        el.querySelector('[data-a="dl"]').addEventListener('click', function () {
          SFX.diploma();
          downloadDiploma(doc);
          toast('Descargando ' + doc.certCode + '...', 3000);
        });
      } else {
        el.innerHTML =
          '<div class="dip-icon">' + icon('lock') + '</div>' +
          '<div class="dip-title">' + g.title + '</div>' +
          '<span class="dip-state locked">🔒 BLOQUEADO</span>';
      }
      grid.appendChild(el);
    });
  }

  function renderHowto() {
    var body = $('howto-body');
    body.innerHTML = '';
    body.innerHTML =
      '<div class="howto-card">' +
        '<h4>El camino de Sebastián #017</h4>' +
        '<p>Cada juego pertenece a la arena del Comité Central de los Juegos. Gana un desafío para desbloquear el siguiente, suma puntos, sube de rango y colecciona tus diplomas oficiales. Toda tu historia queda guardada en tu expediente.</p>' +
      '</div>';

    GAMES.forEach(function (g) {
      var card = document.createElement('div');
      card.className = 'howto-card';
      card.innerHTML =
        '<h4>JUEGO ' + g.numeral + ' · ' + g.title + '</h4>' +
        '<p><b>Objetivo:</b> ' + g.objective + '</p>' +
        '<p><b>Reglas:</b> ' + g.rule + '</p>' +
        '<p style="margin-top:8px"><b>Área:</b> ' + g.area + ' · <b>Dificultad:</b> ' + g.difficulty + '</p>';
      body.appendChild(card);
    });

    var extra = document.createElement('div');
    extra.className = 'howto-card';
    extra.innerHTML =
      '<h4>Diplomas y rangos</h4>' +
      '<p>Cada victoria desbloquea un <b>Certificado Oficial de Victoria</b> descargable en PDF con tu nombre, tu número <b>' + PARTICIPANTE.numero + '</b> y un código único de certificado. Los rangos crecen con cada victoria: PARTICIPANTE → SUPERVIVIENTE → COMPETIDOR → CAMPEÓN → ÉLITE → LEYENDA.</p>' +
      '<p style="margin-top:8px"><b>Truco:</b> si cierras la página, tu expediente, tus diplomas y tus estadísticas se guardan automáticamente en este dispositivo.</p>';
    body.appendChild(extra);
  }

  /* ------------------------------------------------ playlist */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var playlistFrom = 'home';

  function syncMusicUI() {
    var on = YTPlay.playing();
    var bar = $('music-bar');
    $('music-toggle').textContent = on ? '❚❚' : '▶';
    $('music-track').textContent = on ? (YTPlay.now() || 'BILLIE EILISH') : 'BILLIE EILISH · EN ESPERA';
    bar.classList.toggle('playing', on);
  }

  function renderPlaylist() {
    var body = $('playlist-body');
    body.innerHTML = '';

var html = '';
    html += '<div class="pl-section"><div class="pl-head"><span class="pl-title">Mis Opciones</span><span class="pl-mood">todas las canciones de Billie Eilish</span></div>' +
      '<p class="pl-note">Playlist completa de Billie Eilish. Al iniciar la partida suena sola y sigue en orden; pulsa cualquier canción para escucharla al instante.</p>';
    PLAYLIST_BILLIE.forEach(function (alb) {
      html += '<div class="pl-album">' + esc(alb.album) + '</div>';
      html += '<div class="billie-chips">';
      alb.tracks.forEach(function (t) {
        html += '<span class="billie-chip" data-q="' + esc(t + ' Billie Eilish') + '" data-lab="' + esc(t + ' · Billie Eilish') + '" title="Escuchar ' + esc(t) + '">' + esc(t) + '</span>';
      });
      html += '</div>';
    });
    html += '</div>';

    body.innerHTML = html;

    var chipEls = body.querySelectorAll('.billie-chip');
    for (var bi = 0; bi < chipEls.length; bi++) {
      (function (el) {
        el.addEventListener('click', function () {
          SFX.init(); SFX.click();
          YTPlay.play(el.getAttribute('data-q'), el.getAttribute('data-lab'), el);
        });
      })(chipEls[bi]);
    }
    syncMusicUI();
  }

  /* ------------------------------------------------ abandono */
  function abandonar() {
    if (!confirm('¿Rendirse y abandonar la arena, Sebastian? Esta derrota quedará en tu expediente.')) return;
    if (GameRuntime.ended) return;
    SFX.lose();
    GameRuntime.finish({
      win: false, score: 0, timeMs: 0,
      gameId: activeGame.id, idx: activeGame.idx, detail: 'Rendición voluntaria'
    });
  }

  /* ------------------------------------------------ bindings */
  function bindAll() {
    $('btn-iniciar').addEventListener('click', clickIniciar);
    $('btn-continuar').addEventListener('click', function () {
      SFX.init(); SFX.click();
      if (!Store.get().firstTimeDone) { startIdentityFlow(); return; }
      go('arena');
    });
    $('btn-expediente-home').addEventListener('click', function () { SFX.click(); go('expediente'); });
    $('btn-diplomas-home').addEventListener('click', function () { SFX.click(); go('diplomas'); });
    $('btn-howto-home').addEventListener('click', function () { SFX.click(); go('howto'); });
    $('btn-playlist-home').addEventListener('click', function () { SFX.click(); playlistFrom = 'home'; go('playlist'); });

    $('btn-id-continue').addEventListener('click', function () {
      SFX.click(); SFX.confirm();
      go('presentacion');
      startPresentacion();
    });
    $('btn-enter-arena').addEventListener('click', function () {
      SFX.click(); SFX.start();
      toast(justIntro ? 'La arena te espera, Participante #017.' : MESSAGES.enter, 3200);
      justIntro = false;
      go('arena');
      YTPlay.startPlaylist();
    });

    $('btn-expe-arena').addEventListener('click', function () { SFX.click(); go('expediente'); });
    $('btn-fame-arena').addEventListener('click', function () { SFX.click(); go('fame'); });
    $('btn-dip-arena').addEventListener('click', function () { SFX.click(); go('diplomas'); });
    $('btn-howto-arena').addEventListener('click', function () { SFX.click(); go('howto'); });
    $('btn-playlist-arena').addEventListener('click', function () { SFX.click(); playlistFrom = 'arena'; go('playlist'); });
    $('btn-playlist-back').addEventListener('click', function () { SFX.click(); go(playlistFrom === 'home' ? 'home' : 'arena'); });
    $('btn-home-arena').addEventListener('click', function () { SFX.click(); go('home'); });

    $('btn-expe-back').addEventListener('click', function () { SFX.click(); go('arena'); });
    $('btn-fame-back').addEventListener('click', function () { SFX.click(); go('arena'); });
    $('btn-dip-back').addEventListener('click', function () { SFX.click(); go('arena'); });
    $('btn-howto-back').addEventListener('click', function () { SFX.click(); go('arena'); });

    $('btn-game-abandon').addEventListener('click', abandonar);

    $('btn-claim-diploma').addEventListener('click', openDiplomaModal);
    $('diploma-close').addEventListener('click', closeDiplomaModal);
    $('btn-diploma-view').addEventListener('click', function () {
      closeDiplomaModal();
      go('diploma-view');
    });
    $('btn-diploma-download').addEventListener('click', downloadCurrent);
    $('btn-dview-download').addEventListener('click', downloadCurrent);
    $('btn-dview-close').addEventListener('click', function () { SFX.click(); pendingDiploma ? go('diplomas') : go('arena'); });

    var fab = $('sound-fab');
    var ic = $('sound-icon');
    function syncIcon() {
      fab.classList.toggle('muted', !SFX.isOn());
      ic.textContent = SFX.isOn() ? '♪' : '×';
    }
    fab.addEventListener('click', function () {
      SFX.init();
      SFX.setOn(!SFX.isOn());
      if (!SFX.isOn() && YTPlay.playing()) YTPlay.shut();
      syncIcon();
      syncMusicUI();
      if (SFX.isOn()) SFX.confirm();
    });
    syncIcon();

    $('music-toggle').addEventListener('click', function () {
      SFX.init(); SFX.click();
      if (YTPlay.playing()) { YTPlay.pause(); } else { YTPlay.startPlaylist(); }
      syncMusicUI();
    });
    $('music-next').addEventListener('click', function () {
      SFX.init(); SFX.click();
      YTPlay.next();
    });
    YTPlay.setOnChange(syncMusicUI);
  }

  /* ------------------------------------------------ autotest */
  function runSelfTest() {
    var fail = [], pass = 0;
    function check(n, ok) { if (ok) { pass++; } else { fail.push(n); } }
    var saved = null;
    try { saved = localStorage.getItem(DB_KEY); } catch (e) {}
    try {
      Store.load();
      check('participante', PARTICIPANTE.nombre === 'SEBASTIAN' && PARTICIPANTE.numero === '#017');
      check('games-wiring', GAMES.length === 7 && GAMES.every(function (g) {
        return !!Games[g.id] && typeof Games[g.id].play === 'function';
      }));
      check('icons', typeof icon('trophy') === 'string' && icon('x-times') === icon('trophy'));
      check('ranks', RANKS.length >= 5 && Store.rank());
      check('music-data', (function () { var n = 0; PLAYLIST_BILLIE.forEach(function (a) { n += a.tracks.length; }); return Music.TRACKS.length === 0 && n >= 50; })());
      check('ytplay', typeof YTPlay === 'object' && typeof YTPlay.play === 'function' && typeof YTPlay.startPlaylist === 'function');
      check('cert', Store.genCertCode(3).indexOf('CERT-017-') === 0 && Store.genCertCode(3).indexOf('-003-') !== -1);
      check('fmt', Store.fmtTime(90000) === '01:30');
      var img = makeDiploma({ idx: 0, win: true, score: 500, timeMs: 12000 }, { position: 1 });
      check('diploma', !!img.certCode && img.nombre === 'SEBASTIAN' && img.numero === '#017');
      check('diploma-credito-ausente', img.gameTitle && buildDiplomaHTML(img).indexOf('Vannia') === -1);
      var lb = makeLeaderboard({ idx: 4, gameId: 'caza', win: true, score: 1000 });
      check('leaderboard', lb.rows.length === INTERVALS.length + 1 && lb.position === 1);
      check('estadisticas', STAT_DEFS.length >= 6);
      var todosLosJuegos = true;
      GAMES.forEach(function (g) {
        try {
          var dd = document.createElement('div');
          dd.id = 'selftest-zone-' + g.id;
          Games[g.id].play(dd, g);
          if (!dd.innerHTML || dd.innerHTML.indexOf('COMENZAR DESAFÍO') === -1) todosLosJuegos = false;
        } catch (e2) { todosLosJuegos = false; }
      });
      check('juegos-renderizan', todosLosJuegos);
      Store.registerResult({ gameId: 'seleccion', idx: 0, win: true, score: 300, timeMs: 8000 });
      check('register-win', Store.hasWon('seleccion') && Store.get().totalScore >= 300);
    } catch (e) { fail.push('exception:' + e.message); }
    if (saved !== null) { try { localStorage.setItem(DB_KEY, saved); } catch (e) {} }
    document.title = 'SELFTEST-PASS.' + pass + '-FAIL.' + fail.length + '-' + (fail.join(',') || 'OK');

    setTimeout(function () {
      try {
        var dz = document.createElement('div');
        dz.id = 'selftest-deep-zone';
        document.body.appendChild(dz);
        GameRuntime.reset(dz, null, null);
        GameRuntime.onEnd = function () {};
        Games.seleccion.play(dz, GAMES[0]);
        var b = dz.querySelector('#g-go');
        if (b) b.click();
      } catch (e3) { document.title += '|DEEP:EXCEPTION'; }
      setTimeout(function () {
        var board = document.querySelector('.dones-canvas');
        document.title += '|DEEP:' + (board ? 'DONES-OK' : 'DONES-FAIL');
      }, 2800);
    }, 300);
  }

  /* ------------------------------------------------ init */
  function init() {
    Store.load();
    var d = Store.get();
    var days = Store.daysSinceLast();
    if (d.firstTimeDone) {
      if (days >= 1) {
        setTimeout(function () { toast(MESSAGES.returnDays, 5000); }, 1200);
        $('home-return-msg').hidden = false;
        $('home-return-msg').textContent = '“' + MESSAGES.returnDays + '”';
      }
    }
    Store.touchVisit();
    bindAll();
    syncMusicUI();
    if (typeof YTPlay.prewarm === 'function') { YTPlay.prewarm(); }
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
      document.addEventListener(ev, function once() {
        document.removeEventListener(ev, once);
        YTPlay.startPlaylist();
      }, { once: true });
    });
    if (/selftest/i.test(location.search || '')) runSelfTest();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();