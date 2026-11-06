/* Parte 2: fuente de textos y objetivos del piloto. Sin locución generada. */
"use strict";
const GUION_INICIO = {
  lineas: {
  "IN00": {
    "nombre": "La noche de la ofrenda",
    "texto": "110 s",
    "pausa": 1
  },
  "IN01": {
    "nombre": "Un nombre provisional",
    "texto": "130 s",
    "pausa": 1
  },
  "IN02": {
    "nombre": "Lo que puede hacer tu luz",
    "texto": "210 s",
    "pausa": 1
  },
  "IN03": {
    "nombre": "El ojo sobre el camino",
    "texto": "150 s",
    "pausa": 1
  },
  "IN04": {
    "nombre": "Momo guarda un sitio",
    "texto": "130 s",
    "pausa": 1
  },
  "IN05": {
    "nombre": "Lo que llamaban honor",
    "texto": "190 s",
    "pausa": 1
  },
  "IN06": {
    "nombre": "Una luz que sí se comparte",
    "texto": "220 s",
    "pausa": 1
  },
  "IN07": {
    "nombre": "El nombre que falta",
    "texto": "160 s",
    "pausa": 1
  },
  "IN08": {
    "nombre": "Ir a comprobarlo",
    "texto": "80 s",
    "pausa": 1
  },
  "IN09": {
    "nombre": "Salir de Hinode",
    "texto": "180 s",
    "pausa": 1
  },
  "DE01": {
    "nombre": "Lumi",
    "texto": "Despacio. Puedes apoyar los pies.",
    "pausa": 1
  },
  "DE02": {
    "nombre": "Hikari",
    "texto": "¿Dónde estoy?",
    "pausa": 1
  },
  "DE03": {
    "nombre": "Lumi",
    "texto": "Junto al faro. Soy Lumi. ¿Cómo te llamas?",
    "pausa": 1
  },
  "DE04": {
    "nombre": "Hikari",
    "texto": "No lo recuerdo.",
    "pausa": 2
  },
  "DE05": {
    "nombre": "Lumi",
    "texto": "¿Te parece Hikari, mientras lo recuerdas?",
    "pausa": 1
  },
  "DE06": {
    "nombre": "Hikari",
    "texto": "Hikari. Por ahora.",
    "pausa": 1
  },
  "DE07": {
    "nombre": "Lumi",
    "texto": "Hay un pueblo al otro lado de la pradera. Allí podemos preguntar.",
    "pausa": 1
  },
  "MO01": {
    "nombre": "Ayuda",
    "texto": "Muévete con {mover}. Usa {correr} cuando tengas espacio.",
    "pausa": 1
  },
  "MO02": {
    "nombre": "Ayuda",
    "texto": "Salta con {saltar}.",
    "pausa": 1
  },
  "MO03": {
    "nombre": "Lumi",
    "texto": "La capa puede sostenerte un momento. Prueba desde aquí.",
    "pausa": 1
  },
  "MO04": {
    "nombre": "Ayuda",
    "texto": "En el aire, mantén {saltar} para planear.",
    "pausa": 1
  },
  "MO05": {
    "nombre": "Lumi",
    "texto": "Si prefieres, el sendero también baja.",
    "pausa": 1
  },
  "MO06": {
    "nombre": "Lumi",
    "texto": "Mira cómo vuelve tu luz al descansar.",
    "pausa": 1
  },
  "HU01": {
    "nombre": "Lumi",
    "texto": "Ese ojo está mirando el camino. Ponte detrás de la roca.",
    "pausa": 1
  },
  "HU02": {
    "nombre": "Ayuda",
    "texto": "Agáchate con {agacharse}. Cruza cuando el ojo se aparte.",
    "pausa": 1
  },
  "HU03": {
    "nombre": "Lumi",
    "texto": "El torii está cerca. Sigue hasta su luz.",
    "pausa": 1
  },
  "HI01": {
    "nombre": "Momo",
    "texto": "¡Por aquí! Bajo el torii no entra.",
    "pausa": 1
  },
  "HI02": {
    "nombre": "Momo",
    "texto": "Soy Momo. ¿Ya se fue?",
    "pausa": 1
  },
  "HI03": {
    "nombre": "Hikari",
    "texto": "No lo sé.",
    "pausa": 1
  },
  "HI04": {
    "nombre": "Momo",
    "texto": "Entonces quédate un momento.",
    "pausa": 1
  },
  "HI05": {
    "nombre": "Tsuru",
    "texto": "Momo, deja que respire. Ven, pequeña.",
    "pausa": 1
  },
  "TS01": {
    "nombre": "Tsuru",
    "texto": "Soy Tsuru. Estás a salvo aquí.",
    "pausa": 1
  },
  "TS02": {
    "nombre": "Hikari",
    "texto": "¿Qué pasó en el faro?",
    "pausa": 1
  },
  "TS03": {
    "nombre": "Tsuru",
    "texto": "Hace tres meses llevaron a una niña. Akari. Era su ofrenda a la Luna.",
    "pausa": 1
  },
  "TS04": {
    "nombre": "Tsuru",
    "texto": "La luna se volvió roja esa noche. Los avisos decían que el guardián había herido a nuestra protectora.",
    "pausa": 1
  },
  "TS05": {
    "nombre": "Momo",
    "texto": "¿Y después volvía a casa?",
    "pausa": 1
  },
  "TS06": {
    "nombre": "Tsuru",
    "texto": "Los que subían no volvían. Nos enseñaron a llamar honor a esa ausencia.",
    "pausa": 2
  },
  "TS11": {
    "nombre": "Tsuru",
    "texto": "Tu luz viene del entorno y vuelve al descansar. La de los niños no volvía.",
    "pausa": 1
  },
  "TS07": {
    "nombre": "Hikari",
    "texto": "¿Y nadie los buscaba?",
    "pausa": 1
  },
  "TS08": {
    "nombre": "Tsuru",
    "texto": "Hubo padres que lo intentaron. A algunos se los llevaron. Otros desaparecieron.",
    "pausa": 2
  },
  "TS09": {
    "nombre": "Tsuru",
    "texto": "Yo también callé. No quiero volver a hacerlo.",
    "pausa": 1
  },
  "TS10": {
    "nombre": "Tsuru",
    "texto": "Guardé una hoja del registro. Está junto a mi farol. Voy a mostrártela.",
    "pausa": 1
  },
  "PR01": {
    "nombre": "Tsuru",
    "texto": "Tu máscara me recuerda a Akari. Pero no sé qué te ocurrió. No voy a darte por cierto lo que solo sospecho.",
    "pausa": 1,
    "pregunta": "¿Me conoces?"
  },
  "PR02": {
    "nombre": "Tsuru",
    "texto": "Tasogare, su guardián. Lo vi cortar el hilo. Lo que quería hacer después, no lo sé.",
    "pausa": 1,
    "pregunta": "¿Quién rompió el faro?"
  },
  "PR03": {
    "nombre": "Tsuru",
    "texto": "No todos podemos cruzar el mar. Y quienes lo intentaron ya no están para contarnos qué pasó.",
    "pausa": 1,
    "pregunta": "¿Por qué siguen aquí?"
  },
  "PR04": {
    "nombre": "Tsuru",
    "texto": "No la había visto de cerca antes de hoy.",
    "pausa": 1,
    "pregunta": "¿Lumi estaba con ustedes?"
  },
  "FA00": {
    "nombre": "Momo",
    "texto": "¿Me ayudas con esto? El viento vuelve a abrirlo.",
    "pausa": 1
  },
  "FA01": {
    "nombre": "Momo",
    "texto": "Se abre de este lado. Del otro aguanta.",
    "pausa": 1
  },
  "FA02": {
    "nombre": "Interacción",
    "texto": "Asegurar el postigo · {interactuar}",
    "pausa": 1
  },
  "FA03": {
    "nombre": "Interacción",
    "texto": "Compartir un poco de luz · {interactuar}",
    "pausa": 1
  },
  "FA04": {
    "nombre": "Momo",
    "texto": "¡Ahora sí! Ya puedo soltarlo.",
    "pausa": 1
  },
  "FA05": {
    "nombre": "Tsuru",
    "texto": "La luz que compartes viene del entorno. Vuelve al descansar. En el faro tomaban la luz de los niños.",
    "pausa": 1
  },
  "RE01": {
    "nombre": "Tsuru",
    "texto": "Mira este nombre. Nao. Tenía ocho años.",
    "pausa": 1
  },
  "RE02": {
    "nombre": "Hikari",
    "texto": "Aquí dice cuándo salió.",
    "pausa": 1
  },
  "RE03": {
    "nombre": "Tsuru",
    "texto": "Y aquí debía decir cuándo volvió.",
    "pausa": 2
  },
  "RE04": {
    "nombre": "Tsuru",
    "texto": "De él no quedó ni una respuesta. No fue el único.",
    "pausa": 1
  },
  "RE05": {
    "nombre": "Tsuru",
    "texto": "Dejé mi relato aquí después de aquella noche. Para no volver a callarlo.",
    "pausa": 1
  },
  "RE06": {
    "nombre": "Tsuru, testimonio",
    "texto": "Cada doce años, abrían las puertas del faro.",
    "pausa": 1
  },
  "RU01": {
    "nombre": "Tsuru",
    "texto": "Sigue los cerezos hasta el Santuario del Pétalo. Allí busca el registro. Está en el atril exterior, junto a la escalinata.",
    "pausa": 1
  },
  "RU02": {
    "nombre": "Hikari",
    "texto": "Quiero ver qué escribieron.",
    "pausa": 1
  },
  "RU03": {
    "nombre": "Lumi",
    "texto": "Las cuatro luces deben volver a su sitio.",
    "pausa": 1
  },
  "RU04": {
    "nombre": "Momo",
    "texto": "¿Las cuatro? Si estamos buscando un libro.",
    "pausa": 1
  },
  "RU05": {
    "nombre": "Lumi",
    "texto": "Perdón. El registro primero. Te acompaño.",
    "pausa": 1
  },
  "SA01": {
    "nombre": "Lumi",
    "texto": "El sendero de los cerezos empieza por aquí.",
    "pausa": 1
  },
  "SA02": {
    "nombre": "Ayuda",
    "texto": "Usa {lumi} si necesitas orientación. El objetivo también está en tu diario.",
    "pausa": 1
  },
  "SA03": {
    "nombre": "Momo",
    "texto": "¡Acuérdate del camino de vuelta!",
    "pausa": 1
  },
  "AP01": {
    "nombre": "Tsuru, testimonio",
    "texto": "Cada doce años, abrían las puertas del faro.",
    "pausa": 1
  },
  "AP02": {
    "nombre": "Tsuru",
    "texto": "Llevaban niños al Faro del Alba. Decían que su luz nos daría la protección de la Luna.",
    "pausa": 1
  },
  "AP03": {
    "nombre": "Tsuru",
    "texto": "Aquella noche llevaron a Akari. Tasogare, el guardián del faro, caminaba a su lado.",
    "pausa": 1
  },
  "AP04": {
    "nombre": "Tsuru",
    "texto": "Nos prometieron que no sufriría.",
    "pausa": 1
  },
  "AP05": {
    "nombre": "Tasogare",
    "texto": "¡Basta!",
    "pausa": 1
  },
  "AP06": {
    "nombre": "Rótulo",
    "texto": "Tres meses después. Faro del Alba.",
    "pausa": 1
  },
  "AP07": {
    "nombre": "Tsuru",
    "texto": "El guardián cortó el hilo. El faro se quebró. La luna se volvió roja.",
    "pausa": 1
  }
},
  bloques: {
    aviso: ['AV01'],
    postigo: ['FA01'], farol: ['FA04', 'FA05'], momoAyuda: ['FA00'], momoFarol: ['FA04'],
    nombre: ['DE01', 'DE02', 'DE03', 'DE04', 'DE05', 'DE06'],
    momo: ['HI01', 'HI02', 'HI03', 'HI04', 'HI05'],
    tsuru: ['TS01', 'TS02', 'TS03', 'TS04', 'TS05', 'TS06', 'TS11', 'TS07', 'TS08', 'TS09', 'TS10'],
    hoja: ['RE01', 'RE02', 'RE03', 'RE04'], testimonio: ['RE05', 'RE06'],
    rumbo: ['RU01', 'RU02', 'RU03', 'RU04', 'RU05']
  },
  resumen: 'Desperté junto al faro sin recordar mi nombre. Lumi me acompaña y me llamo Hikari por ahora. En Hinode, Tsuru me contó que entregaban niños a la Luna para mantener su protección. Guardó una hoja con el nombre de Nao y ningún regreso escrito. Buscaré el registro completo en el Santuario del Pétalo.',
  aviso: { titulo: 'Aviso del faro · versión oficial', texto: 'Nuestra protectora está herida. El guardián quebró su luz. Mantengan encendidos los faroles del pacto.', procedencia: 'Es un anuncio de quienes administran el faro. Su acusación no demuestra qué ocurrió ni explica por qué los niños no regresaban.' },
  registroPetalo: {
    titulo: 'Registro de las ofrendas · Santuario del Pétalo',
    paginas: [
      'Archivo público del Santuario del Pétalo. Este libro reúne los asientos de las entregas al Faro del Alba. La hoja que conservó Tsuru corresponde a este registro.',
      'Asiento de Nao. Edad: ocho años. Salida hacia el Faro del Alba: asentada. La columna de regreso está vacía.',
      'Las páginas anteriores también conservan listas de entregas sin constancias de regreso. Una instrucción del archivo dice: «El registro se cierra con la entrega al faro».',
      'El archivo termina en la entrega. No dice qué pasó después. Copiaré los nombres. Aún debemos averiguar qué ocurrió con los niños.'
    ],
    resumen: 'Consulté el registro público en el atril exterior del Santuario del Pétalo. La hoja de Tsuru corresponde al asiento de Nao, de ocho años. Su regreso no está asentado; las listas anteriores tampoco tienen constancias de regreso. La instrucción cierra cada registro con la entrega al faro. Esto confirma lo que falta en los documentos, pero todavía no prueba el destino de los niños ni la identidad de la Luna.'
  },
  velo: 'Lumi: El Velo aún no nos deja pasar por aquí. Sigamos lo que tenemos delante.',
  prologo: 'Hace tres meses, Akari fue llevada al rito de la ofrenda. Un guardián interrumpió la extracción y el Faro del Alba se quebró.',
  documento: 'Nombre: Nao.\nEdad: ocho años.\nSalida al faro: asentada.\nRegreso: —',
  misiones: [
    { id: 'inicio_luna', nom: 'Un nombre entre las ruinas', tipo: 'p', dif: 0, des: { auto: 1 }, rec: { xp: 0 }, desc: 'Busca ayuda y descubre qué ocurrió en el faro.', pasos: [
      { k: 'ev', ev: 'inicio:nombre', txt: 'Acércate a Lumi y mira a tu alrededor', x: 0, z: 16 },
      { k: 'ev', ev: 'inicio:hinode', txt: 'Busca ayuda en Hinode, al suroeste', x: -85, z: 54 },
      { k: 'ev', ev: 'inicio:tsuru', txt: 'Habla con Tsuru en el patio de Hinode', npc: 'tsuru', pos: 'inicio:tsuru' },
      { k: 'ev', ev: 'inicio:hoja', txt: 'Examina la hoja que guardó Tsuru; puedes ayudar antes a Momo', pos: 'inicio:hoja' },
      { k: 'ev', ev: 'inicio:rumbo', txt: 'Habla con Tsuru sobre el registro del Pétalo', pos: 'inicio:tsuru' },
      { k: 'ev', ev: 'inicio:salida', txt: 'Sigue el camino de los cerezos, al noroeste de Hinode', x: -126, z: 27 }
    ] },
    { id: 'registro_petalo', nom: 'Los nombres de la ofrenda', tipo: 'p', dif: 0, des: { tras: 'inicio_luna' }, rec: { xp: 0 }, desc: 'Consulta el libro en el atril exterior del Santuario del Pétalo, junto a la escalinata.', pasos: [
      { k: 'ev', ev: 'inicio:registro_completo', txt: 'Lee el registro en el atril exterior, junto a la escalinata del Santuario del Pétalo ({interactuar})', pos: () => Estr.registroPetalo }
    ] }
  ]
};
GUION_INICIO.lineas.AV01 = { nombre: GUION_INICIO.aviso.titulo, texto: GUION_INICIO.aviso.texto, pausa: 1 };
GUION_INICIO.bloques.registroPetalo = GUION_INICIO.registroPetalo.paginas.map((texto, i) => {
  const id = 'RP0' + (i + 1);
  GUION_INICIO.lineas[id] = { nombre: i === 3 ? 'Hikari' : GUION_INICIO.registroPetalo.titulo, texto, pausa: 1 };
  return id;
});
