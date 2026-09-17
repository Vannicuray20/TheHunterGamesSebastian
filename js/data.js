/* =========================================================
   LOS JUEGOS · DATA  ·  SEBASTIAN #017
   ========================================================= */

var PARTICIPANTE = { nombre: 'SEBASTIAN', numero: '#017', codigo: 'S-017' };

var RANKS = [
  { min: 0,  label: 'PARTICIPANTE' },
  { min: 1,  label: 'SUPERVIVIENTE' },
  { min: 2,  label: 'COMPETIDOR' },
  { min: 3,  label: 'CAMPEÓN' },
  { min: 4,  label: 'ÉLITE' },
  { min: 5,  label: 'LEYENDA' }
];

var INTERVALS = [
  { num: '#002', nombre: 'VESPER' },
  { num: '#011', nombre: 'KYLAN' },
  { num: '#023', nombre: 'NYXRA' },
  { num: '#031', nombre: 'ORION' },
  { num: '#007', nombre: 'AUREL' },
  { num: '#019', nombre: 'DANTE' },
  { num: '#025', nombre: 'SEREN' }
];

var MESSAGES = {
  enter: 'Bienvenido de nuevo, Sebastian.',
  win: 'Otra victoria para el participante #017.',
  lose: 'No terminó como esperabas, Sebastian.',
  unlock: 'Tu colección acaba de crecer.',
  returnDays: 'Los Juegos te estaban esperando.',
  diplomaClaim: 'Has desbloqueado un nuevo diploma.'
};

var STAT_DEFS = [
  { key: 'supervivencia', label: 'Supervivencia', icon: 'heart' },
  { key: 'combate',       label: 'Combate',       icon: 'swords' },
  { key: 'estrategia',    label: 'Estrategia',    icon: 'knight' },
  { key: 'velocidad',     label: 'Velocidad',     icon: 'bolt' },
  { key: 'relaciones',    label: 'Relaciones',    icon: 'rings' },
  { key: 'precision',     label: 'Precisión',     icon: 'target' }
];

/* ------------------ GAMES ------------------ */
var GAMES = [
  {
    id: 'seleccion', numeral: 'I', title: 'LA LLUVIA DORADA', subtitle: 'Atrapa los dones del patrocinador',
    area: 'Reflejos', statKey: 'velocidad', difficulty: 'NOVATO', difficultyValue: 1, timeLimit: 60,
    icon: 'star',
    objective: 'Atrapa con tu cesta los dones que caen del cielo durante 60 segundos. Esquiva los nidos de avispas y las brasas y encadena dones para multiplicar tu puntuación.',
    rule: 'Mueve a Sebastian con el ratón, el dedo o las teclas A/D y flechas. Los dones dorados valen puntos; la plata regala vidas; los peligros las arrebatan. Tienes tres vidas.'
  },
  {
    id: 'arena', numeral: 'II', title: 'LA ARENA', subtitle: 'Supervivencia',
    area: 'Supervivencia', statKey: 'supervivencia', difficulty: 'INTERMEDIO', difficultyValue: 2, timeLimit: 30,
    icon: 'arena',
    objective: 'Sobrevive 30 segundos en la arena esquivando los proyectiles. No dejes que te alcancen tres veces.',
    rule: 'Mueve tu emblema con el ratón, tu dedo o las flechas. Los peligros arrecian con cada segundo.'
  },
  {
    id: 'laberinto', numeral: 'III', title: 'EL LABERINTO', subtitle: 'Memoria y orientación',
    area: 'Memoria', statKey: 'estrategia', difficulty: 'INTERMEDIO', difficultyValue: 2, timeLimit: 46,
    icon: 'maze',
    objective: 'Memoriza el camino iluminado y reprodúcelo al pie de la letra. Cuatro rondas, cada vez más largo.',
    rule: 'Observa el sendero. Cuando desaparezca, toca las casillas en el mismo orden. Tres errores y caes.'
  },
  {
    id: 'caza', numeral: 'IV', title: 'LA CAZA', subtitle: 'Supervivencia y velocidad',
    area: 'Velocidad', statKey: 'velocidad', difficulty: 'DIFICIL', difficultyValue: 3, timeLimit: 45,
    icon: 'crosshair',
    objective: 'Caza 24 objetivos antes de que desparezcan. Los que escapan te cuestan una vida.',
    rule: 'Los presagios aparecen y se desvanecen. Tócalos a tiempo y encadena combos para puntuar más.'
  },
  {
    id: 'refugio', numeral: 'V', title: 'EL ÚLTIMO REFUGIO', subtitle: 'Estrategia y decisiones',
    area: 'Estrategia', statKey: 'estrategia', difficulty: 'DIFICIL', difficultyValue: 3, timeLimit: 0,
    icon: 'campfire',
    objective: 'Guía a Sebastian por ocho decisiones críticas sin dejar que su fortaleza se agote.',
    rule: 'Cada decisión tiene consecuencias sobre tu fortaleza y tus suministros. Elige con cabeza.'
  },
  {
    id: 'noche', numeral: 'VI', title: 'LA NOCHE', subtitle: 'Supervivencia nocturna',
    area: 'Supervivencia', statKey: 'supervivencia', difficulty: 'AVANZADO', difficultyValue: 4, timeLimit: 45,
    icon: 'moon',
    objective: 'Mantén encendido el fuego de tu campamento. Destierra los ojos que avanzan desde la oscuridad.',
    rule: 'Toca a los intrusos antes de que alcancen la hoguera. Si el fuego se apaga, la noche gana.'
  },
  {
    id: 'final', numeral: 'VII', title: 'EL DESAFÍO FINAL', subtitle: 'La gran prueba definitiva',
    area: 'Todo', statKey: 'combate', difficulty: 'DEFINITIVO', difficultyValue: 5, timeLimit: 40,
    icon: 'crown',
    objective: 'Tres etapas. Una sola corona. Velocidad, memoria y juicio: pásalas todas.',
    rule: 'Etapa I: Ruptura (velocidad). Etapa II: Código (memoria). Etapa III: Juicio (decisiones). Fallar una etapa cuesta una oportunidad.'
  }
];

var GAME_MOTTOES = {
  seleccion: 'Bajo la lluvia dorada, solo la mano firme atrapa su destino.',
  arena:     'La arena no perdona, pero es justa.',
  laberinto: 'Recordar es la única salida.',
  caza:      'El rápido devora, el lento perece.',
  refugio:   'El corazón sabio encuentra refugio.',
  noche:     'Hasta la noche más negra teme a la valentía.',
  final:     'El mejor no es el más fuerte: es el que lo da todo.'
};

var GAME_LETTERS = {
  seleccion: 'Por su reflejo veloz y su pulso firme bajo la lluvia dorada de los patrocinadores',
  arena:     'Por su coraje frente al hierro y su sangría para sobrevivir donde otros caen',
  laberinto: 'Por su memoria prodigiosa y su orientación inquebrantable en la penumbra',
  caza:      'Por su velocidad y su pulso certero cuando todo se mueve a su alrededor',
  refugio:   'Por su prudencia y su juicio sereno en la hora de las decisiones imposibles',
  noche:     'Por su valor en la oscuridad y su luz que no se apaga jamás',
  final:     'Por haber resistido la prueba total: velocidad, memoria y voluntad de vencer'
};

function rankFor(victorias) {
  var r = RANKS[0];
  for (var i = 0; i < RANKS.length; i++) {
    if (victorias >= RANKS[i].min) r = RANKS[i];
  }
  return r.label;
}

/* ------------------ SCENES / sequences ------------------ */

var SEQ_IDENTITY = [
  { html: '<span class="seq-line">ARCHIVO DE PARTICIPANTE</span>' },
  { html: '<span class="seq-line seq-divider"></span><span class="seq-line">IDENTIDAD CONFIRMADA</span>' },
  { html: '<span class="seq-line big">SEBASTIAN</span>' },
  { html: '<span class="seq-line script">"Tu participación ha sido registrada."</span>' },
  { html: '<div class="seq-hr"></div><span class="seq-line idnum">#017</span><span class="seq-line minor">NÚMERO DE PARTICIPANTE</span>' },
  { html: '<div class="seq-hr"></div><div><span class="seq-line idnum">PARTICIPANTE #017</span><br><span class="seq-line gold">SEBASTIAN</span></div>' }
];

var SEQ_PRESENTACION = [
  { html: '<span class="seq-line script">"Sebastian."</span>' },
  { html: '<span class="seq-line mono">Tu nombre ha sido registrado.</span>' },
  { html: '<span class="seq-line mono">Tu número ha sido asignado.</span>' },
  { html: '<span class="seq-line mono">La arena te espera.</span>' },
  { html: '<span class="seq-line mono">A partir de este momento...</span>' },
  { html: '<span class="seq-line big script-gold">THE HUNTER GAMES COMIENZAN.</span>' },
  { html: '<div class="seq-hr"></div><span class="seq-line idnum">PARTICIPANTE #017</span><br><span class="seq-line gold">SEBASTIAN</span>' }
];

/* ------------------ GAME V scenarios ------------------ */
var SCENARIOS_REFUGIO = [
  {
    kicker: 'AMANECER',
    text: 'Sebastian despierta en el último refugio. Un grupo de extraños llama a la puerta pidiendo resguardo. La tormenta se acerca y los suministros alcanzan justo para los tuyos.',
    options: [
      { label: 'Abrir las puertas y compartir a ciegas', fx: { fortaleza: 12, suministro: -18, good: false }, result: 'La generosidad honra tu nombre, pero los suministros menguan de golpe.' },
      { label: 'Compartir a cambio de tareas y vigías', fx: { fortaleza: 16, suministro: -8, good: true }, result: 'El refugio gana manos y miradas. La tormenta encontrará un muro unido.' },
      { label: 'Negar la entrada y cerrar los accesos', fx: { fortaleza: -14, suministro: 0, good: false }, result: 'La puerta cerrada trae una quietud incómoda... y voces que murmuran afuera.' }
    ]
  },
  {
    kicker: 'HOGAR',
    text: 'El fuego se apaga sin que quede yesca. Los vecinos del refugio te miran esperando una decisión. Cerca hay un viejo bosque prohibido.',
    options: [
      { label: 'Ir solo al bosque prohibido por madera seca', fx: { fortaleza: 10, suministro: -4, good: false }, result: 'Regresas con brazadas de leña y el corazón desbocado.' },
      { label: 'Armar una brigada y preparar linternas', fx: { fortaleza: 18, suministro: -10, good: true }, result: 'El trabajó se reparte. El fuego vuelve a respirar al anochecer.' },
      { label: 'Guardar silencio y esperar a que amaine', fx: { fortaleza: -16, suministro: 0, good: false }, result: 'La noche crece sin fuego y el frío se cuela por las grietas.' }
    ]
  },
  {
    kicker: 'HERIDA',
    text: 'Una guardiana se hiere en la muralla. Sin atenderla, la herida se infecta. El botiquín solo alcanza para uno de los casos pendientes.',
    options: [
      { label: 'Usar todo el botiquín en la guardiana', fx: { fortaleza: 14, suministro: -12, good: true }, result: 'La guardiana vuelve a la muralla. La confianza crece entre los tuyos.' },
      { label: 'Guardar el botiquín para emergencias mayores', fx: { fortaleza: -12, suministro: 0, good: false }, result: 'La herida empeora. El murmullo de la duda empieza a circular.' },
      { label: 'Improvisar con hierbas del huerto', fx: { fortaleza: 4, suministro: -4, good: false }, result: 'Una curación incierta, pero el fuego sigue ardiendo.' }
    ]
  },
  {
    kicker: 'DESCONOCIDO',
    text: 'Un mensajero llega al alba con un trato de la otra facción: suministros a cambio de entregar a un fugitivo que se esconde en el refugio.',
    options: [
      { label: 'Aceptar el trato sin mirar atrás', fx: { fortaleza: -20, suministro: 20, good: false }, result: 'Las despensas se llenan, pero una sombra se posa sobre tu nombre.' },
      { label: 'Proteger al fugitivo y rechazar el trato', fx: { fortaleza: 14, suministro: -6, good: true }, result: 'El refugio entero te respalda. El honor pesa más que el pan.' },
      { label: 'Despachar al mensajero sin responder', fx: { fortaleza: -6, suministro: 0, good: false }, result: 'Ni un sí ni un no. Las consecuencias tardarán, pero llegarán.' }
    ]
  },
  {
    kicker: 'RACIA',
    text: 'La lluvia se lleva la ruta de caminos. Es hora de escoger hacia dónde retirarse con lo que queda de equipo.',
    options: [
      { label: 'Retirarse pronto con lo esencial', fx: { fortaleza: 10, suministro: -8, good: true }, result: 'Un camino limpio y seguro. La lluvia borra vuestras huellas.' },
      { label: 'Esperar a recoger cada provision', fx: { fortaleza: -10, suministro: 6, good: false }, result: 'El retraso casi os cuesta. Los caminos se vuelven lodo.' },
      { label: 'Dividir el grupo para cubrir terreno', fx: { fortaleza: -8, suministro: 6, good: false }, result: 'La mitad del grupo llega tarde y descalza.' }
    ]
  },
  {
    kicker: 'CASA',
    text: 'Un incendio empieza en el granero donde guardan la reserva de grano. El humo se ve desde la muralla.',
    options: [
      { label: 'Lanzarse a contener el fuego con agua', fx: { fortaleza: -6, suministro: -14, good: false }, result: 'El fuego cede, pero las barricas de agua quedan vacías.' },
      { label: 'Organizar la cadena humana y salvar grano', fx: { fortaleza: 16, suministro: -6, good: true }, result: 'Las manos se pasan sacos de grano. El refugio resiste la furia.' },
      { label: 'Dejarlo arder y mudar de sitio', fx: { fortaleza: -18, suministro: 0, good: false }, result: 'Perdéis el granero y la fe de muchos.' }
    ]
  },
  {
    kicker: 'LUMBRE',
    text: 'Tres vigías traen noticias: la facción rival marcha hacia el refugio. Puedes tender una trampa o cerrar el portón y aguantar.',
    options: [
      { label: 'Tender una emboscada en la espesura', fx: { fortaleza: 18, suministro: -10, good: true }, result: 'La emboscada desbarata la columna rival. El refugio respira.' },
      { label: 'Cerrar el portón y aguantar el sitio', fx: { fortaleza: 6, suministro: -12, good: false }, result: 'El sitio desgasta los nervios y la despensa.' },
      { label: 'Enviar un emisario a parlamentar', fx: { fortaleza: 8, suministro: -4, good: false }, result: 'Las palabras ganan tiempo, pero el cuchillo sigue en la mesa.' }
    ]
  },
  {
    kicker: 'CORONA',
    text: 'El refugio se ha convertido en leyenda. Las demás facciones piden un líder para los tiempos de paz venideros. Te miran a ti, Sebastian.',
    options: [
      { label: 'Aceptar y repartir la mesa para todos', fx: { fortaleza: 16, suministro: 0, good: true }, result: 'Los clarines suenan. Un nuevo pacto nace bajo tu nombre.' },
      { label: 'Ceder el mando al más veterano', fx: { fortaleza: 6, suministro: 0, good: false }, result: 'La paz llega, aunque tu nombre se guarda en los archivos.' },
      { label: 'Disolver el refugio y marchar solo', fx: { fortaleza: -12, suministro: 0, good: false }, result: 'Las cenizas guardarán la historia de un líder que eligió el camino.' }
    ]
  }
];

/* ------------------ GAME VII stage C scenarios ------------------ */
var SCENARIOS_JUICIO = [
  {
    text: 'El suministro de agua se reduce a la mitad. El manantial más próximo tarda dos días. ¿Qué decides?',
    options: [
      { good: true,  label: 'Racionar el agua desde hoy mismo' },
      { good: false, label: 'Beber sin medida mientras haya' },
      { good: false, label: 'Ignorar el problema y seguir igual' }
    ]
  },
  {
    text: 'Un guardia duerme en su puesto a medianoche. La noche está despejada. ¿Qué haces?',
    options: [
      { good: false, label: 'Dejarlo pasar; no hay peligro a la vista' },
      { good: true,  label: 'Despertarlo y cubrir su turno' },
      { good: false, label: 'Castigarlo públicamente mañana' }
    ]
  },
  {
    text: 'Hay una sola dosis de medicamento y dos heridos graves. Uno es tuyo, otro de un aliado. ¿Qué haces?',
    options: [
      { good: true,  label: 'Atender al que esté más grave' },
      { good: false, label: 'Guardar la dosis para tu aliado' },
      { good: false, label: 'Partir la dosis para los dos' }
    ]
  },
  {
    text: 'Se enciende una luz en la muralla a mitad de la noche. ¿Es una señal o una trampa?',
    options: [
      { good: true,  label: 'Enviar solo a un vigía a comprobarlo' },
      { good: false, label: 'Salir en masa a ver qué es' },
      { good: false, label: 'Apagar todas las luces y esconderse' }
    ]
  },
  {
    text: 'El grano del almacén está húmedo y empieza a germinar. Queda una semana de cosecha. ¿Qué haces?',
    options: [
      { good: true,  label: 'Secarlo y ventilarlo sin demora' },
      { good: false, label: 'Esperar a que se seque solo' },
      { good: false, label: 'Quemarlo para que no se pudra' }
    ]
  },
  {
    text: 'Un desconocido ofrece secretos del rival a cambio de comida. ¿Qué haces?',
    options: [
      { good: true,  label: 'Escuchar con cautela y verificar todo' },
      { good: false, label: 'Pagar por todo lo que diga' },
      { good: false, label: 'Echarlo del refugio sin escucharlo' }
    ]
  }
];

/* ------------------ ICONS ------------------ */
var _iconStroke = 'fill=\'none\' stroke=\'currentColor\' stroke-width=\'6\' stroke-linecap=\'round\' stroke-linejoin=\'round\'';

var ICONS = {
  heart: '<svg viewBox="0 0 100 100">' +
    '<path d="M50 86 C22 66 10 50 10 34 C10 20 22 12 34 12 C42 12 48 16 50 22 C52 16 58 12 66 12 C78 12 90 20 90 34 C90 50 78 66 50 86Z" ' + _iconStroke + ' stroke-width="5"/>' +
    '<path d="M32 48 L44 48 L50 36 L56 48 L68 48 L56 60 L50 50 L44 60 Z" fill="currentColor" stroke="none"/></svg>',
  swords: '<svg viewBox="0 0 100 100">' +
    '<path d="M22 12 L52 42 M22 12 L12 22 M22 12 L18 30 M26 32 L30 18" ' + _iconStroke + '/>' +
    '<path d="M78 88 L48 58 M78 88 L88 78 M78 88 L82 70 M74 68 L70 82" ' + _iconStroke + '/>' +
    '<path d="M48 58 L52 42 M52 42 L30 18 M48 58 L70 82 M22 12 L78 88" stroke="currentColor" stroke-width="3"/></svg>',
  knight: '<svg viewBox="0 0 100 100">' +
    '<path d="M52 8 L66 16 L58 30 L72 28 L80 40 L72 46 L60 48 L38 40 L36 28 Z" ' + _iconStroke + '/>' +
    '<path d="M38 40 C30 30 26 40 30 46 C26 44 22 46 26 52 C22 52 20 56 24 60 L34 62 L48 60 L58 62 L74 66 L84 62 L82 56 L78 52 Z" ' + _iconStroke + '/>' +
    '<path d="M34 64 L40 86 M58 64 L56 86 M40 86 L56 86" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>',
  bolt: '<svg viewBox="0 0 100 100"><path d="M56 8 L24 56 L44 56 L36 92 L76 40 L54 40 Z" ' + _iconStroke + ' stroke-width="5"/></svg>',
  rings: '<svg viewBox="0 0 100 100">' +
    '<circle cx="34" cy="44" r="24" ' + _iconStroke + '/>' +
    '<circle cx="66" cy="44" r="24" ' + _iconStroke + '/>' +
    '<path d="M50 20 C44 28 44 60 50 68 M50 20 C56 28 56 60 50 68" stroke="currentColor" stroke-width="4" fill="none"/></svg>',
  target: '<svg viewBox="0 0 100 100">' +
    '<circle cx="50" cy="50" r="34" ' + _iconStroke + '/>' +
    '<circle cx="50" cy="50" r="18" ' + _iconStroke + '/>' +
    '<circle cx="50" cy="50" r="5" fill="currentColor" stroke="none"/>' +
    '<path d="M28 22 L20 12 M72 22 L80 12" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>',
  gates: '<svg viewBox="0 0 100 100">' +
    '<path d="M14 84 V44 L34 26 V84 Z" ' + _iconStroke + '/>' +
    '<path d="M40 84 V20 L60 20 V84 Z" ' + _iconStroke + '/>' +
    '<path d="M66 84 V44 L86 26 V84 Z" ' + _iconStroke + '/>' +
    '<path d="M18 66 C26 60 42 60 50 68 M50 68 C58 60 74 60 82 66" stroke="currentColor" stroke-width="4" fill="none"/></svg>',
  arena: '<svg viewBox="0 0 100 100">' +
    '<path d="M50 8 L64 26 L82 24 L76 42 L92 52 L74 58 L70 78 L52 70 L38 84 L34 62 L14 58 L28 44 M50 8 L84 24 M34 62 L16 44" ' + _iconStroke + ' stroke-width="4"/>' +
    '<circle cx="50" cy="46" r="12" ' + _iconStroke + ' stroke-width="4"/></svg>',
  maze: '<svg viewBox="0 0 100 100">' +
    '<path d="M10 14 H44 V40 H22 V66 H44 V86 H58 V40 H78 V92 M58 66 H36 M10 14 V34" ' + _iconStroke + ' stroke-width="5"/>' +
    '<circle cx="86" cy="14" r="7" fill="currentColor" stroke="none"/></svg>',
  crosshair: '<svg viewBox="0 0 100 100">' +
    '<circle cx="50" cy="50" r="22" ' + _iconStroke + '/>' +
    '<path d="M50 6 V20 M50 80 V94 M6 50 H20 M80 50 H94" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="50" cy="50" r="4" fill="currentColor" stroke="none"/></svg>',
  campfire: '<svg viewBox="0 0 100 100">' +
    '<path d="M50 12 C62 30 76 38 70 52 C84 46 84 66 72 66 H28 C16 66 16 46 30 52 C24 38 38 30 50 12 Z" ' + _iconStroke + ' stroke-width="5"/>' +
    '<path d="M50 24 C56 34 62 40 58 48 M50 24 C44 34 38 40 42 48" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<path d="M18 78 H82" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M14 88 H86" stroke="currentColor" stroke-width="6" stroke-linecap="round" opacity=".5"/></svg>',
  moon: '<svg viewBox="0 0 100 100">' +
    '<path d="M66 10 C44 16 30 36 30 60 C30 82 48 96 68 90 C48 88 36 76 36 60 C36 42 48 26 66 10 Z" ' + _iconStroke + ' stroke-width="5"/>' +
    '<circle cx="30" cy="30" r="3" fill="currentColor"/><circle cx="20" cy="44" r="3" fill="currentColor"/><circle cx="26" cy="72" r="3" fill="currentColor"/></svg>',
  crown: '<svg viewBox="0 0 100 100">' +
    '<path d="M12 34 L32 54 L50 24 L68 54 L88 34 L82 78 H18 Z" ' + _iconStroke + '/>' +
    '<circle cx="50" cy="64" r="10" ' + _iconStroke + '/>' +
    '<path d="M42 88 H58 M44 86 L46 94 M56 86 L54 94" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>',
  trophy: '<svg viewBox="0 0 100 100">' +
    '<path d="M28 14 H72 V40 C72 56 62 64 50 64 C38 64 28 56 28 40 Z" ' + _iconStroke + '/>' +
    '<path d="M28 18 H16 V28 C16 40 24 46 34 46 M72 18 H84 V28 C84 40 76 46 66 46" ' + _iconStroke + '/>' +
    '<path d="M44 64 C44 74 40 78 34 80 H66 C60 78 56 74 56 64 M50 78 V88" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/></svg>',
  diploma: '<svg viewBox="0 0 100 100">' +
    '<path d="M22 16 H68 V84 H32 C26 84 22 80 22 74 Z" ' + _iconStroke + '/>' +
    '<path d="M58 16 V24 C58 30 62 34 68 34" stroke="currentColor" stroke-width="5" fill="none"/>' +
    '<path d="M30 32 H50 M30 42 H50 M30 52 H46" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
  lock: '<svg viewBox="0 0 100 100">' +
    '<rect x="24" y="42" width="52" height="42" rx="6" ' + _iconStroke + '/>' +
    '<path d="M34 42 V30 C34 18 42 12 50 12 C58 12 66 18 66 30 V42" ' + _iconStroke + '/>' +
    '<circle cx="50" cy="60" r="6" fill="currentColor" stroke="none"/></svg>',
  medal: '<svg viewBox="0 0 100 100">' +
    '<circle cx="50" cy="58" r="26" ' + _iconStroke + '/>' +
    '<path d="M50 32 L62 20 H74 V44 M50 32 L38 20 H26 V44" ' + _iconStroke + ' stroke-width="5"/>' +
    '<path d="M42 66 L48 72 L60 60" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 100 100"><path d="M50 8 L60 38 L92 38 L66 57 L76 88 L50 68 L24 88 L34 57 L8 38 L40 38 Z" fill="currentColor"/></svg>',
  clock: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" ' + _iconStroke + '/><path d="M50 26 V52 L68 62" stroke="currentColor" stroke-width="6" stroke-linecap="round" fill="none"/></svg>',
  flame: '<svg viewBox="0 0 100 100"><path d="M50 10 C64 30 78 40 72 56 C86 48 86 70 72 70 H28 C14 70 14 48 28 56 C22 40 36 30 50 10 Z" ' + _iconStroke + ' stroke-width="5"/></svg>',
  shield: '<svg viewBox="0 0 100 100"><path d="M50 8 L84 22 V48 C84 72 70 86 50 94 C30 86 16 72 16 48 V22 Z" ' + _iconStroke + '/><path d="M50 28 V52" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="60" r="4" fill="currentColor" stroke="none"/></svg>'
};

function icon(name) {
  return ICONS[name] || ICONS.trophy;
}

/* ============================================================
   MIS OPCIONES · DISCOGRAFÍA DE BILLIE EILISH
   (Cada canción se reproduce en el Concierto al pulsarla.)
   ============================================================ */
var PLAYLIST_BILLIE = [
  {
    album: 'DON\'T SMILE AT ME (EP, 2017)',
    tracks: [
      'COPYCAT', 'idontwannabeyouanymore', 'my boy', 'watch', 'party favor',
      'bellyache', 'ocean eyes', 'hostage', '&burn'
    ]
  },
  {
    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO? (2019)',
    tracks: [
      '!!!!!!!', 'bad guy', 'xanny', 'you should see me in a crown',
      'all the good girls go to hell', 'wish you were gay', 'when the party\'s over',
      '8', 'my strange addiction', 'bury a friend', 'ilomilo',
      'listen before i go', 'i love you', 'goodbye'
    ]
  },
  {
    album: 'HAPPIER THAN EVER (2021)',
    tracks: [
      'Getting Older', 'I Didn\'t Change My Number', 'Billie Bossa Nova', 'my future',
      'Oxytocin', 'GOLDWING', 'Lost Cause', 'Halley\'s Comet', 'Not My Responsibility',
      'OverHeated', 'Everybody Dies', 'Your Power', 'NDA', 'Therefore I Am',
      'Happier Than Ever', 'Male Fantasy'
    ]
  },
  {
    album: 'HIT ME HARD AND SOFT (2024)',
    tracks: [
      'SKINNY', 'LUNCH', 'CHIHIRO', 'BIRDS OF A FEATHER', 'WILDFLOWER',
      'THE GREATEST', 'L\'AMOUR DE MA VIE', 'THE DINER', 'BITTERSUITE', 'BLUE'
    ]
  },
  {
    album: 'SENCILLOS Y COLABORACIONES DESTACADAS',
    tracks: [
      'Lovely (con Khalid)', 'Everything I Wanted', 'No Time to Die',
      'Lo Vas a Olvidar (con ROSALÍA)', 'What Was I Made For?', 'guess (con Charli XCX)'
    ]
  }
];