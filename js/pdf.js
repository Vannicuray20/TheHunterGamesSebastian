/* =========================================================
   LOS JUEGOS · GENERACIÓN DE DIPLOMAS  ·  SEBASTIAN #017
   ========================================================= */

function sealSVG(uid) {
  uid = uid || '';
  return '<svg viewBox="0 0 120 120" aria-hidden="true">' +
    '<circle cx="60" cy="60" r="56" fill="#f3e9cf" stroke="#b3872f" stroke-width="3"/>' +
    '<circle cx="60" cy="60" r="50" fill="none" stroke="#b3872f" stroke-width="1.2" stroke-dasharray="3 3"/>' +
    '<circle cx="60" cy="60" r="34" fill="none" stroke="#b3872f" stroke-width="2"/>' +
    '<path d="M60 26 l8 18 h20 l-16 12 l6 20 l-18 -11 l-18 11 l6 -20 l-16 -12 h20 Z" fill="#b3872f" opacity=".85"/>' +
    '<circle cx="60" cy="60" r="8" fill="#6b1f1f"/>' +
    '<text x="60" y="108" text-anchor="middle" font-size="8.5" letter-spacing="2" fill="#6b4f17" font-family="Georgia, serif">JUEGOS</text>' +
    '</svg>';
}

function buildDiplomaHTML(doc) {
  var stats = [
    { k: 'PUNTUACIÓN', v: String(doc.score) },
    { k: 'POSICIÓN', v: doc.positionName },
    { k: 'TIEMPO', v: doc.time }
  ];
  var statHtml = '<div class="doc-stats">' + stats.map(function (s) {
    return '<span>' + s.k + '<b>' + s.v + '</b></span>';
  }).join('') + '</div>';

  return '<div class="doc-diploma">' +
    '<div class="doc-inner">' +
      '<div class="doc-org">Comité Central de los Juegos</div>' +
      '<div class="doc-motto">“' + doc.motto + '”</div>' +
      '<div class="doc-title">Certificado Oficial de Victoria</div>' +
      '<div class="doc-cert">Se certifica que</div>' +
      '<div class="doc-sep"></div>' +
      '<div class="doc-name">' + doc.nombre + '</div>' +
      '<div class="doc-num">PARTICIPANTE ' + doc.numero + '</div>' +
      '<div class="doc-certify">ha completado satisfactoriamente</div>' +
      '<div class="doc-game">' + doc.gameTitle + '</div>' +
      '<div class="doc-game-sub">' + doc.gameSub + '</div>' +
      '<div class="doc-par">' + doc.letter + ', el Comité de los Juegos reconoce oficialmente su victoria.</div>' +
      statHtml +
      '<div class="doc-victoryno">VICTORIA N.º ' + doc.victoryNoText + '</div>' +
      '<div class="doc-bottom">' +
        '<div class="doc-signbox">' +
          '<div class="doc-sign">' + doc.firma + '</div>' +
          '<div class="doc-sign-line"></div>' +
          '<div class="doc-sign-role">El Comité de los Juegos</div>' +
        '</div>' +
        '<div class="doc-sealbox">' + sealSVG(doc.gameId) + '</div>' +
        '<div class="doc-datebox">' +
          '<div class="doc-date-label">Fecha</div>' +
          '<div class="doc-date">' + doc.dateText + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="doc-cert-code">' + doc.certCode + '</div>' +
      '<div class="doc-game-sub" style="margin-top:10px;font-size:10px;letter-spacing:.2em">DIFÍCULTAD: ' + doc.difficulty + ' · RANGO: ' + doc.rank + '</div>' +
    '</div>' +
  '</div>';
}

function spacedTxt(s) {
  return s.split('').join(' ');
}

/* Carga dinámica de jsPDF (el juego funciona sin conexión; si no hay red, usa impresión) */
var __jspdfUrl = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
var __jspdfState = { loading: null };

function jspdfAvailable() {
  return !!(window.jspdf && window.jspdf.jsPDF);
}

function jspdfLoad(cb) {
  if (jspdfAvailable()) { cb(true); return; }
  if (__jspdfState.loading) { setTimeout(function () { jspdfLoad(cb); }, 250); return; }
  __jspdfState.loading = true;
  var done = false;
  var s = document.createElement('script');
  s.src = __jspdfUrl;
  s.onload = function () { if (!done) { done = true; cb(true); } };
  s.onerror = function () { if (!done) { done = true; cb(false); } };
  document.head.appendChild(s);
  setTimeout(function () { if (!done) { done = true; cb(false); } }, 6000);
}

function pdfBuildDiploma(doc) {
  jspdfLoad(function (ok) {
    if (!ok) { htmlPrintDiploma(doc); return; }
    var JS = window.jspdf;
    if (!JS || !JS.jsPDF) { htmlPrintDiploma(doc); return; }
    var pdf = new JS.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  var W = 297, H = 210;
  var INK = [42, 30, 7], GOLD = [179, 135, 47], CRIMSON = [107, 31, 31], BROWN = [107, 79, 23];

  pdf.setFillColor(247, 242, 225);
  pdf.rect(0, 0, W, H, 'F');

  pdf.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  pdf.setLineWidth(1.4);
  pdf.rect(6, 6, W - 12, H - 12);
  pdf.setLineWidth(0.5);
  pdf.rect(9.5, 9.5, W - 19, H - 19);

  var C = W / 2;
  function ctr(txt, y, size, font, style, color) {
    pdf.setFont(font || 'times', style || 'normal');
    pdf.setFontSize(size);
    pdf.setTextColor.apply(pdf, color || INK);
    pdf.text(txt, C, y, { align: 'center' });
  }

  ctr(spacedTxt('COMITÉ CENTRAL DE LOS JUEGOS'), 24, 11, 'times', 'normal', BROWN);
  ctr('“' + doc.motto + '”', 31, 13, 'times', 'italic', BROWN);
  ctr(spacedTxt('CERTIFICADO OFICIAL DE VICTORIA'), 42, 18, 'times', 'bold', CRIMSON);
  ctr('SE CERTIFICA QUE', 50, 11, 'times', 'bolditalic', BROWN);

  pdf.setFont('times', 'bold');
  pdf.setFontSize(34);
  pdf.setTextColor(36, 19, 3);
  pdf.text(doc.nombre, C, 60, { align: 'center', charSpace: 3 });

  ctr(spacedTxt('PARTICIPANTE ' + doc.numero), 67, 12, 'times', 'bolditalic', BROWN);
  ctr('ha completado satisfactoriamente', 75, 12, 'times', 'italic', INK);

  pdf.setFont('times', 'bold');
  pdf.setFontSize(17);
  pdf.setTextColor(CRIMSON[0], CRIMSON[1], CRIMSON[2]);
  pdf.text(doc.gameTitle, C, 83, { align: 'center' });

  ctr(doc.gameSub.toUpperCase(), 89, 10, 'times', 'bolditalic', BROWN);

  var par = doc.letter + ', el Comité de los Juegos reconoce oficialmente su victoria.';
  var lines = pdf.splitTextToSize(par, 210);
  pdf.setFont('times', 'italic');
  pdf.setFontSize(11.5);
  pdf.setTextColor(74, 53, 16);
  pdf.text(lines, C, 98, { align: 'center', lineHeightFactor: 1.45 });

  pdf.setFont('times', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(INK[0], INK[1], INK[2]);
  pdf.text('PUNTUACIÓN  ' + doc.score + '      POSICIÓN  ' + doc.positionName + '      TIEMPO  ' + doc.time, C, 112, { align: 'center' });

  pdf.setFont('times', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(CRIMSON[0], CRIMSON[1], CRIMSON[2]);
  pdf.text(spacedTxt('VICTORIA N.º ' + doc.victoryNoText), C, 122, { align: 'center' });

  ctr('FECHA: ' + doc.dateText.toUpperCase(), 130, 10, 'times', 'normal', BROWN);

  // firma
  pdf.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  pdf.setLineWidth(0.5);
  pdf.line(C - 55, 140, C - 5, 140);
  pdf.setFont('times', 'bolditalic');
  pdf.setFontSize(12);
  pdf.setTextColor(INK[0], INK[1], INK[2]);
  pdf.text(spacedTxt('EL COMITÉ DE LOS JUEGOS'), C - 30, 148, { align: 'center' });

  // sello
  var sx = C + 62, sy = 152, r = 17;
  pdf.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  pdf.setLineWidth(0.8);
  pdf.circle(sx, sy, r);
  pdf.circle(sx, sy, r - 3);
  pdf.setFillColor(179, 135, 47);
  pdf.circle(sx, sy, r - 6, 'F');
  pdf.setFillColor(107, 31, 31);
  pdf.circle(sx, sy, 3.4, 'F');
  // estrella
  pdf.setFillColor(179, 135, 47);
  pdf.triangle(sx, sy - 6, sx - 6, sy + 4, sx + 6, sy + 4, 'F');

  pdf.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  pdf.setLineWidth(0.4);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(BROWN[0], BROWN[1], BROWN[2]);
  pdf.text(spacedTxt(doc.certCode), C, 178, { align: 'center' });

  pdf.setFont('times', 'italic');
  pdf.setFontSize(8.5);
  pdf.setTextColor(138, 109, 42);
  pdf.text('ESTE CERTIFICADO PERTENECE AL UNIVERSO FICTICIO DE LOS JUEGOS.', C, 190, { align: 'center' });

  var fname = 'Diploma_' + doc.nombre.replace(/\s+/g, '_') + '_' + doc.gameId + '.pdf';
  pdf.save(fname);
  });
}

function htmlPrintDiploma(doc) {
  var w = window.open('', '_blank', 'width=980,height=760');
  if (!w) { alert('El navegador bloqueó la descarga. Permite ventanas emergentes o descarga el PDF manualmente.'); return; }
  var inner = buildDiplomaHTML(doc);
  w.document.write(
    '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Diploma ' + doc.certCode + '</title>' +
    '<style>body{margin:0;font-family:Georgia,serif}@media print{.no-print{display:none}}' +
    '.no-print{position:fixed;top:0;left:0;right:0;background:#0a0a14;color:#d4af37;padding:14px;text-align:center;font-size:13px;letter-spacing:.2em}' +
    '.wrap{margin-top:56px;max-width:900px;margin-left:auto;margin-right:auto}' +
    '</style></head><body>' +
    '<div class="no-print">Usa los controles de impresión y elige "Guardar como PDF".</div>' +
    '<div class="wrap">' + inner + '</div>' +
    '<script>window.onload=function(){setTimeout(function(){window.print();},600);};<' + '/script>' +
    '</body></html>'
  );
  w.document.close();
  w.focus();
}

function downloadDiploma(doc) {
  pdfBuildDiploma(doc);
  return doc;
}