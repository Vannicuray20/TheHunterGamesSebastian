/* THE HUNGER GAMES · la música del juego ahora es la playlist de Billie Eilish.
   Las piezas originales se retiraron: este módulo queda inactivo por compatibilidad. */
var Music = {
  TRACKS: [],
  init: function () { return false; },
  play: function () { return false; },
  stop: function () {},
  toggle: function () { return false; },
  next: function () { return false; },
  current: function () { return { idx: -1, active: null, tracks: [] }; },
  isOn: function () { return false; },
  setOnChange: function () {}
};