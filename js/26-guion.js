/* === Ecos de Luz · 26-guion.js ===
   Textos del mundo en un solo sitio: el prólogo, los avisos del asedio y del asalto, la huida, la Noche Roja, el duelo,
   las voces de los habitantes, la línea de cada gólem purificado, los ecos del pasado (27-ecos.js) y los murales
   (04-estructuras.js). Las conversaciones de la historia están en GUION.inicio (50 y 59) y las secundarias, en
   68-secundarias.js. Pilar 4: frases cortas. */
"use strict";

// textos comunes de liberación; GF-LIB-P0 usa frase y GF-LIB-P3 usa despedida de cada custodio
// GF-LIB-P2, GF-LIB-P4 y GF-LIB-P6 no llevan texto; la escena y los dones se conectan después
const GUARDIANES_LIBERACION = {
  aviso: 'El sello ha cedido.',
  'GF-LIB-P1': 'Canalizar luz · mantén {interactuar}',
  'GF-LIB-P5': 'La llevaré conmigo.'
};

const GUION = {
  // prólogo (09-cinematica.js): frases de los planos con texto; la última es el lema del título
  intro: [
    'Hubo un valle que nunca conoció la noche.',
    'Cada generación, el pueblo cantaba para que la luz no se fuera.',
    'Aquel año, la elegida fue Akari.',
    'Él dijo que no.',
    'Y la oscuridad que el faro contenía entró en el valle.',
    'De lo último que quedaba de ella… despertaste tú.',
    'Devuelve el amanecer. Descubre lo que cuesta.'
  ],
  // asalto al faro (acto 3): avisos y marcador
  asalto: { empieza: 'La oscuridad tomó el faro', ola: 'Oleada {n} de {m}', marcador: 'Asalto al faro · oleada {n}/{m}', vuelve: 'Vuelve al faro: la tormenta roja lo rodea', fin: 'La plaza es tuya: la espiral se enciende' },
  // asedio de Hinode (Noche Roja): avisos y marcador ({n} oleada, {m} total)
  asedio: { empieza: 'Las Sombras rodean Hinode', ola: 'Oleada {n} de {m}', marcador: 'Asedio · oleada {n}/{m}', vuelve: 'Vuelve a Hinode: las Sombras te esperan', fin: 'Hinode resiste' },
  // la huida (acto 1): el primer Cazador del Ocaso sale del humo; consejo para esconderse y aviso al llegar a Hinode
  huida: { consejo: 'Que no te vea su ojo: agáchate ({agacharse}) junto a una roca o un árbol, o métete bajo un torii', aldea: 'Los faroles de Hinode lo espantan' },
  tsuru: { farol: 'El farol de Tsuru.' },
  // Tasogare, el Guardián del Ocaso: una frase por aparición (pilar 4: frases cortas)
  tasogare: {
    nocheRoja: 'Tasogare · Entréguenme a los niños. Yo los protegeré.',
    derrota: 'Akari… perdóname por no haber encontrado otra forma.'
  },
  // murales: [título, texto] (Recuerdos de piedra)
  murales: [
    ['La guardiana dorada', 'Antes de los nombres, la Luna Dorada velaba la isla. El faro le devolvía la luz del valle y ella la repartía. Nadie tenía que subir la escalinata.'],
    ['Los guardianes del Faro', 'Cuatro familias atendían las luces de los santuarios.'],
    ['El pueblo de Hinode', 'Hinode significa «salida del sol». Aquí se cantaba para que la luz no se fuera. Las letras más viejas hablan de una escalinata.'],
    ['La marea que escucha', 'Dicen que el agua guarda los ecos de quienes se fueron. Si la oyes con calma, devuelve una perla de luz.'],
    ['La guardiana y el conejo', 'Una guardiana de luz vela los cerezos. A sus pies descansa un conejo blanco. Sobre su cabeza, un disco completo, sin corte.'],
    ['Kiri, la montaña niebla', 'En la cumbre más alta se ve el valle entero. Los antiguos subían allí cuando necesitaban recordar de dónde venían.'],
    ['Las tres pirámides', 'Quien construyó la arena en escalones quería hablar con el cielo. Por eso cada escalón mira un poco más arriba.'],
    ['Más allá del Velo', 'Más allá del mar, dice la piedra, solo hay bestias que devoran el alma. Nadie que cruzó la niebla volvió para contarlo.']
  ],
  // capa oculta de cada mural (solo con el farol de Tsuru): lo que el pueblo calló sobre la Ofrenda
  muralesOcultos: [
    'El faro no ardía con aceite. Cada generación, un niño subía la escalinata y se volvía luz.',
    'Las luces usaban energía del entorno. No necesitaban ofrendas infantiles.',
    'El canto de cada mañana era el de la Ofrenda. Se cantaba para que el niño no tuviera miedo al subir.',
    'Cada perla es la promesa de una madre que esperó en la orilla.',
    'El disco completo es la señal antigua de la guardiana. El sello de los registros es otro: una media luna cortada por una grieta.',
    'Desde la cumbre se ve la escalinata entera. Aquí venían a despedirse.',
    'Un sabio contaba los escalones. Llevó a muchos niños arriba y lo llamó el precio justo.',
    'La última elegida subió con una máscara de marfil y oro. Nadie la vio bajar.'
  ],
  // el duelo con Tasogare (fase 21): rótulo, avisos y estado en la barra
  duelo: { nombre: 'Tasogare', sub: 'El Guardián del Ocaso', vuelve: 'Vuelve a la plaza del faro: Tasogare te espera', fin: 'Tasogare se retira a lo alto de la espiral', roto: '¡Roto!',
    espiral: 'La espiral solo existe donde la ilumina tu haz', espiralMarca: 'Ilumina la espiral con el haz · Tasogare espera arriba', espiralFin: 'Tasogare sube a lo alto del faro, donde tiene a Momo' },
  // voz silabeada de cada habitante en los diálogos: tono base (semitonos), timbre y formante (01-audio.js)
  voces: {
    tsuru: { base: 59, timbre: 'triangle', formante: 900 }, momo: { base: 76, timbre: 'sine', formante: 1700 }, kaito: { base: 52, timbre: 'triangle', formante: 720 },
    yuki: { base: 64, timbre: 'triangle', formante: 1250 }, taiyo: { base: 47, timbre: 'sawtooth', formante: 560 }
  },
  // frases al ceder la coraza; se conservan estas claves para la cinemática actual
  jefes: {
    musgoso: 'Deja libre el paso.',
    escarcha: 'Deja una luz encendida.',
    arena: 'Guarda la copia.',
    marea: 'Sujeta la cuerda.',
    cerezo: 'No pises los brotes.'
  },
  // custodios del faro: solo textos; un don compartido y una despedida, sin resurrección
  guardianes: {
    cerezo: { id: 'cerezo', nombre: 'Vera', oficio: 'Injertadora', frase: 'No pises los brotes.', despedida: 'Que siga creciendo.',
      don: { nom: 'Pétalo bordado', txt: 'Un pétalo para el camino.' }, pista: 'La mano del relieve hace ese mismo gesto.', liberacion: GUARDIANES_LIBERACION },
    marea: { id: 'marea', nombre: 'León', oficio: 'Calafate', frase: 'Sujeta la cuerda.', despedida: 'Hay sitio en la orilla.',
      don: { nom: 'Brazada serena', txt: 'El nado rápido gasta un 3 % menos de luz.' }, pista: 'Ese nudo lo usábamos en los amarres.', liberacion: GUARDIANES_LIBERACION },
    arena: { id: 'arena', nombre: 'Inés', oficio: 'Copista', frase: 'Guarda la copia.', despedida: 'Que puedan leerlo.',
      don: { nom: 'Copia conservada', txt: 'El esquema queda junto a tus notas.' }, pista: 'La copia lleva la marca de esa mano.', liberacion: GUARDIANES_LIBERACION },
    musgoso: { id: 'musgoso', nombre: 'Bruno', oficio: 'Cantero', frase: 'Deja libre el paso.', despedida: 'El paso queda libre.',
      don: { nom: 'Costura firme', txt: 'Planear gasta un 3 % menos de luz.' }, pista: 'Estas marcas guiaban a quienes reparaban el paso.', liberacion: GUARDIANES_LIBERACION },
    escarcha: { id: 'escarcha', nombre: 'Alba', oficio: 'Cuidadora de refugios', frase: 'Deja una luz encendida.', despedida: 'Que nadie quede atrás.',
      don: { nom: 'Brasa duradera', txt: 'El calor de estas fogatas dura dos segundos más.' }, pista: 'Aquí alguien dejaba luz para los viajeros.', liberacion: GUARDIANES_LIBERACION }
  },
  /* ecos del pasado: figuras de luz que repiten un momento cuando Hikari se acerca (27-ecos.js).
     lugar: sitio de 02-terreno (o x, z); figuras: posición relativa, giro (o 'faro'), alto y acción */
  ecos: [
    { id: 'canto', lugar: 'faro', dx: 0, dz: 22, titulo: 'El canto del alba', texto: 'Cada generación, el pueblo cantaba al faro mientras alguien subía la escalinata.',
      motivo: { timbre: 'voz', notas: [62, 64, 67, 69, 67, 64], paso: .55, dur: .7, cada: 9 },
      figuras: [{ x: -2, z: 0, mira: 'faro', accion: 'cantar' }, { x: 0, z: .8, mira: 'faro', accion: 'cantar', alto: 1.3 }, { x: 2, z: 0, mira: 'faro', accion: 'cantar' }, { x: .9, z: 1.8, mira: 'faro', accion: 'cantar', alto: .95, nino: 1 }] },
    { id: 'guardianes', lugar: 'faro', dx: 12, dz: -6, titulo: 'Los guardianes', texto: 'Cuatro familias atendían las luces del valle.',
      motivo: { timbre: 'campana', notas: [74, 79, 81, 86], paso: .7, dur: 2.4, cada: 10 },
      figuras: [{ x: 0, z: 0, mira: 'faro', accion: 'ofrecer' }, { x: 1.6, z: 1, mira: 'faro', accion: 'ofrecer' }, { x: -1.6, z: 1, mira: 'faro', accion: 'ofrecer' }, { x: 0, z: 2, mira: 'faro', accion: 'ofrecer' }] },
    { id: 'pescador', lugar: 'muelleEco', dx: 0, dz: 0, titulo: 'Kaito y Rui', texto: '«Mira cómo brilla el agua al amanecer», le decía Kaito a su hijo Rui.',
      motivo: [{ timbre: 'flauta', notas: [69, 72, 74, 72], paso: .6, dur: .8, cada: 9 }, { timbre: 'agua', notas: [86, 83], paso: 1.1, dur: .25, vol: .6 }],
      figuras: [{ x: 0, z: 0, mira: 'muelle', accion: 'pescar' }, { x: .6, z: .6, mira: 'muelle', accion: 'señalar', alto: .95, nino: 1 }] },
    { id: 'quiebre', lugar: 'mirador', dx: -3, dz: 3, titulo: 'El guardián y el niño', texto: 'Hace años, el guardián del faro pasó por aquí con un niño de la mano. El niño no volvió a bajar.',
      motivo: { timbre: 'trompa', notas: [50, 47, 45], paso: 1.3, dur: 1.6, cada: 11 },
      figuras: [{ x: 0, z: 0, mira: 'faro', accion: 'caminar' }, { x: .7, z: .3, mira: 'faro', accion: 'caminar', alto: .95, nino: 1 }] },
    { id: 'cerezo', lugar: 'petalo', dx: 10, dz: -14, titulo: 'El cerezo que no durmió', texto: 'Cuando todo se apagó, los niños siguieron jugando entre los cerezos, como si nada.',
      motivo: { timbre: 'punteo', notas: [79, 81, 84, 81, 86, 84], paso: .18, dur: .5, cada: 7 },
      figuras: [{ x: 0, z: 0, accion: 'jugar', alto: .95, nino: 1 }, { x: 1.5, z: 1, accion: 'jugar', alto: 1, nino: 1 }] },
    { id: 'peregrino', lugar: 'escarcha', dx: -18, dz: 10, titulo: 'El peregrino de Kiri', texto: 'Los antiguos subían a la montaña cuando necesitaban recordar de dónde venían.',
      motivo: [{ timbre: 'pasos', notas: [0, 0, 0, 0, 0, 0], paso: .55, dur: .1, cada: 8 }, { timbre: 'campana', notas: [81, null, 81], paso: 1.1, dur: 1.2, vol: .5 }],
      figuras: [{ x: 0, z: 0, accion: 'caminar', baston: 1, encorvado: .2 }] }
  ]
};

GUION.inicio = GUION_INICIO;
