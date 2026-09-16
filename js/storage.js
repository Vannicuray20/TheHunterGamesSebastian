/* =========================================================
   LOS JUEGOS · ALMACÉN DE PARTIDA  ·  SEBASTIAN #017
   ========================================================= */

var DB_KEY = 'juegos_sebastian_017_v1';

var Store = (function () {
  var DEFAULT = {
    version: 1,
    nombre: PARTICIPANTE.nombre,
    numero: PARTICIPANTE.numero,
    codigo: PARTICIPANTE.codigo,
    created: '',
    lastVisit: '',
    firstTimeDone: false,
    victorias: [],          // array de ids de juegos ganados (sin repetir)
    orderOfWins: [],        // ids en orden de victoria (para numeración de diplomas)
    gamesPlayed: 0,
    gamesCompleted: 0,
    totalScore: 0,
    bestScore: {},
    attempts: {},
    stats: { supervivencia: 0, combate: 0, estrategia: 0, velocidad: 0, relaciones: 0, precision: 0 },
    diplomas: {},           // gameId -> documento
    soundOn: true
  };

  var data = null;

  function load() {
    if (data) return data;
    try {
      var raw = localStorage.getItem(DB_KEY);
      if (raw) {
        data = JSON.parse(raw);
        for (var k in DEFAULT) if (!(k in data)) data[k] = DEFAULT[k];
      }
    } catch (e) { data = null; }
    if (!data) {
      data = JSON.parse(JSON.stringify(DEFAULT));
      data.created = nowISO();
      save();
    }
    return data;
  }

  function save() {
    try { localStorage.setItem(DB_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function daysSinceLast() {
    if (!data.lastVisit) return 0;
    var last = new Date(data.lastVisit).getTime();
    var now = Date.now();
    return Math.floor((now - last) / 86400000);
  }

  function touchVisit() {
    data.lastVisit = nowISO();
    save();
  }

  function get() { return load(); }

  function gamesWon() { return load().victorias.length; }

  function rank() { return rankFor(gamesWon()); }

  function hasWon(gameId) { return load().victorias.indexOf(gameId) !== -1; }

  function victoriesCount() { return load().orderOfWins.length; }

  function nextLockedIndex() {
    var d = load();
    for (var i = 0; i < GAMES.length; i++) {
      if (d.victorias.indexOf(GAMES[i].id) === -1) return i;
    }
    return -1;
  }

  function isUnlocked(idx) {
    // El primer juego siempre está abierto; cada siguiente se abre con la victoria del anterior.
    if (idx <= 0) return true;
    return hasWon(GAMES[idx - 1].id);
  }

  function addStat(key, points) {
    var d = load();
    d.stats[key] = Math.max(0, Math.min(100, (d.stats[key] || 0) + Math.round(points)));
    save();
  }

  function registerResult(res) {
    var d = load();
    d.gamesPlayed++;
    d.attempts[res.gameId] = (d.attempts[res.gameId] || 0) + 1;

    if (res.win) {
      var already = hasWon(res.gameId);
      if (!already) {
        d.victorias.push(res.gameId);
        d.orderOfWins.push(res.gameId);
        d.gamesCompleted++;
      }
      if (res.score > (d.bestScore[res.gameId] || 0)) d.bestScore[res.gameId] = res.score;
      d.totalScore += res.score;
    }
    save();
    return d;
  }

  function storeDiploma(res, doc) {
    var d = load();
    d.diplomas[res.gameId] = doc;
    save();
    return doc;
  }

  function genCertCode(victoryNo) {
    var chars = 'ABCDEF0123456789';
    var r = '';
    for (var i = 0; i < 4; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
    var vn = String(victoryNo);
    while (vn.length < 3) vn = '0' + vn;
    return 'CERT-017-' + vn + '-' + r;
  }

  function formatDate(d) {
    var dd = d.getDate(), mm = d.getMonth() + 1, yyyy = d.getFullYear();
    var meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return dd + ' de ' + meses[mm - 1] + ' de ' + yyyy;
  }

  function fmtTime(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    var rem = s % 60;
    return (m < 10 ? '0' + m : m) + ':' + (rem < 10 ? '0' + rem : rem);
  }

  return {
    load: load,
    get: get,
    save: save,
    touchVisit: touchVisit,
    daysSinceLast: daysSinceLast,
    rank: rank,
    gamesWon: gamesWon,
    hasWon: hasWon,
    victoriesCount: victoriesCount,
    nextLockedIndex: nextLockedIndex,
    isUnlocked: isUnlocked,
    addStat: addStat,
    registerResult: registerResult,
    storeDiploma: storeDiploma,
    genCertCode: genCertCode,
    formatDate: formatDate,
    fmtTime: fmtTime
  };
})();