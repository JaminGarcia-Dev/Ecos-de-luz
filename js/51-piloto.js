/* Progreso y encuentros del inicio. Estado persistente en Sis.ST.inicio; texto en GUION.inicio. */
"use strict";
const Piloto = (() => {
  const P = { radioHinode: 39, radioSalida: 11, nombreTras: 1.5, costeFarol: 8, ayudaTras: 12 };
  let espera = 0, tAyuda = 0, alPaso = null, anterior = null, orientados = [], encuadre = null;
  const estado = () => Sis.ST.inicio;
  const dato = id => GUION.inicio.lineas[id];
  const linea = id => ({ ...dato(id), id });
  function nota(id, titulo, texto) {
    const s = estado(); if (s.notas.some(n => n.id === id)) return;
    s.notas.push({ id, titulo, texto }); UI.diarioNuevo(titulo, texto);
  }
  function sincronizar() {
    const s = estado(), flags = ['nombre', 'hinode', 'tsuru', 'hoja', 'rumbo', 'fin'];
    const eventos = ['nombre', 'hinode', 'tsuru', 'hoja', 'rumbo', 'salida'];
    let m = Sis.ST.mis.inicio_luna;
    while (m && m.e === 'activa' && s[flags[m.p]]) { Sis.evento('inicio:' + eventos[m.p]); m = Sis.ST.mis.inicio_luna; }
    if (s.registroPetalo && Sis.ST.mis.registro_petalo && Sis.ST.mis.registro_petalo.e === 'activa') Sis.evento('inicio:registro_completo');
    UI.refrescarMision();
  }
  function completar(id) {
    const s = estado(); s.dialogo = null;
    if (id === 'nombre') {
      s.nombre = true; nota('nombre', 'Un nombre provisional', 'Desperté sin recordar mi nombre. Acepté llamarme Hikari por ahora. Lumi me guía hacia Hinode.');
    } else if (id === 'momo') s.momo = true;
    else if (id === 'tsuru') {
      s.tsuru = true; nota('tsuru', 'Lo que llamaban honor', 'Tsuru cuenta que llevaban niños al faro como ofrenda a la Luna. Dice que no regresaban y que algunas familias intentaron oponerse. Ella también guardó silencio.');
    } else if (id === 'hoja') { conversar('documento'); return; }
    else if (id === 'documento') {
      s.hoja = true; nota('hoja', 'Hoja del registro de las ofrendas', GUION.inicio.documento + '\n\nTsuru afirma que Nao no volvió. El registro no explica qué ocurrió con él. El original sigue guardado por Tsuru.');
    } else if (id === 'testimonio') s.testimonio = true;
    else if (id === 'aviso') nota('aviso', GUION.inicio.aviso.titulo, GUION.inicio.aviso.texto + '\n\n' + GUION.inicio.aviso.procedencia);
    else if (id === 'registroPetalo') {
      s.registroPetalo = true; nota('registroPetalo', GUION.inicio.registroPetalo.titulo, GUION.inicio.registroPetalo.resumen);
      UI.aviso('Registro copiado en el diario. Has completado este tramo de historia.', 'mision');
    }
    else if (id === 'rumbo') {
      s.rumbo = true; nota('rumbo', 'Ir a comprobarlo', GUION.inicio.resumen);
      nota('lumi', 'Una frase de Lumi', 'Lumi dijo: «Las cuatro luces deben volver a su sitio». Estábamos hablando de buscar un registro. No sé a qué luces se refería.');
    }
    Bus.emit('conversacion', id);   // los capítulos reaccionan al final de sus conversaciones (60-capitulos.js)
    sincronizar(); Sis.guardar();
  }
  function soltarActores() {
    for (const n of orientados) n.hablando = false; orientados = [];
    encuadre = null;
    Bus.emit('focoCamara', null);
  }
  function conversar(id) {
    if (UI.dlg || Cin.activa) return;
    const s = estado(), previo = s.dialogo && s.dialogo.id === id ? s.dialogo.i : 0;
    let lineas = (GUION.inicio.bloques[id] || []).map(linea);
    if (id === 'documento') lineas = [{ nombre: 'Hoja del registro', texto: GUION.inicio.documento, pausa: 0, id: 'registro' }];
    if (/^PR\d\d$/.test(id)) lineas = [{ nombre: 'Hikari', texto: dato(id).pregunta, pausa: .5 }, linea(id)];
    if (id === 'habitante') lineas = [{ nombre: 'Yuki', texto: 'Los faroles de Hinode mantienen lejos ese ojo. Si buscas respuestas, habla con Tsuru en el patio.', pausa: 1 }];
    if (id === 'kaito') lineas = [{ nombre: 'Kaito', texto: 'No te acerques a la niebla del mar sin un camino seguro. Hinode está al norte de este muelle.', pausa: 1 }];
    if (id === 'taiyo') lineas = [{ nombre: 'Taiyō', texto: 'Hay preguntas que el faro nunca quiso responder. Tsuru guardó un registro. Empieza por escucharlo.', pausa: 1 }];
    if (!lineas.length) return;
    if (alPaso) { alPaso = null; UI.subtitulo(null); }
    const cerca = Math.hypot(J.x - PatioInicio.puntos.tsuru.x, J.z - PatioInicio.puntos.tsuru.z) < 16;
    if (cerca) {
      for (const k of ['tsuru', 'momo']) { const n = Sis.npcs[k]; n.ocupado = true; n.g.rotation.y = Math.atan2(J.x - n.g.position.x, J.z - n.g.position.z); orientados.push(n); }
      const p = id === 'aviso' ? PatioInicio.puntos.aviso : id === 'documento' || id === 'hoja' ? PatioInicio.puntos.hoja : PatioInicio.puntos.tsuru;
      const mirar = { x: (J.x + p.x) / 2, y: p.y + 1.15, z: (J.z + p.z) / 2 };
      const a = Math.atan2(J.x - p.x, J.z - p.z) + .55;
      const desde = EscenasInicio.libre({ x: mirar.x + Math.sin(a) * 5, y: p.y + 3.1, z: mirar.z + Math.cos(a) * 5 }, mirar);
      encuadre = { desde: new THREE.Vector3(desde.x, desde.y, desde.z), mirar, actual: camera.position.clone() };
      J.yaw = Math.atan2(p.x - J.x, p.z - J.z); J.camYaw = J.yaw; J.camPitch = .35;
    }
    UI.dialogo('', lineas, () => { soltarActores(); completar(id); }, null, {
      i: previo, pausas: true,
      alLinea: i => { s.dialogo = { id, i }; Sis.guardar(); },
      alHablar: (nombre, lineaId) => { for (const n of orientados) n.hablando = n.nombre === nombre || nombre === 'Tsuru' && n === Sis.npcs.tsuru; Bus.emit('narrativa:linea', { id: lineaId || id, grupo: id, nombre }); }
    });
  }
  function preguntas() {
    UI.opciones('Preguntar a Tsuru', ['PR01', 'PR02', 'PR03', 'PR04'].map(id => ({ texto: dato(id).pregunta, fn: () => conversar(id) })).concat([{ texto: 'Seguir explorando', fn() {} }]));
  }
  function prologoFin() {
    const s = estado(); s.prologo = true; nota('prologo', 'La noche de la ofrenda', GUION.inicio.prologo); Sis.guardar();
  }
  function iniciar() {
    if (!Sis.ST.inicio) Sis.ST.inicio = Campana.inicio();
    PatioInicio.crear();
    for (const id of ['tsuru', 'momo']) {
      const n = Sis.npcs[id], p = PatioInicio.puntos[id];
      n.ocupado = true; n.g.position.set(p.x, p.y, p.z); n.ir(p.x, p.z); n.g.rotation.y = Math.PI;
    }
    // El piloto no activa las figuras y revelaciones del argumento anterior.
    for (const e of Ecos.lista) for (const n of e.figs) n.g.visible = false;
  }
  function reanudar() {
    Atmosfera.lunaNarrativa(estado().cap && estado().cap.doradaLibre ? 0 : 1);   // tras la liberación (capítulo 7), la luna vuelve a ser dorada
    espera = 0; anterior = { x: J.x, z: J.z }; sincronizar(); Capitulos.reanudar();
    if (estado().dialogo) conversar(estado().dialogo.id);
  }
  function alCaminar(id) {
    if (UI.dlg || Cin.activa || alPaso || UI.ocupada()) return false;
    const l = dato(id); if (!l) return false;
    alPaso = { id, t: Math.max(4, l.texto.length / 15 + 1.4) };
    UI.subtitulo(l.nombre + ' · ' + UI.teclas(l.texto)); Bus.emit('narrativa:linea', { id, nombre: l.nombre }); return true;
  }
  function aprender(evento) {
    const t = estado().tutorial;
    if (evento === 'saltar') t.saltar = true;
    if (evento === 'metros') t.caminar = true;
  }
  function actualizar(dt, jugador, t) {
    if (G.estado !== 'juego') return;
    const s = estado(); PatioInicio.actualizar(t); EscenarioCapitulos.actualizar(dt, jugador, t);
    if (Estr.registroPetalo) Estr.registroPetalo.halo.opacidad = s.registroPetalo ? .1 : .4;
    if (alPaso) { alPaso.t -= dt; if (alPaso.t <= 0) { UI.subtitulo(null); alPaso = null; } }
    if (UI.dlg || Cin.activa) return;
    Capitulos.actualizar(dt, jugador);
    espera += dt; tAyuda += dt;
    if (!s.nombre && espera > P.nombreTras && jugador.suelo) { conversar('nombre'); return; }
    if (!s.nombre) return;
    const S = sitio('aldea'), d = Math.hypot(jugador.x - S.x, jugador.z - S.z);
    if (d < P.radioHinode && !s.hinode) {
      s.hinode = true; Cazadores.salir('pradera', null); sincronizar(); Sis.guardar();
    }
    if (!s.hinode && !s.huida && jugador.x < -21 && jugador.x > -68 && jugador.z > 12 && jugador.z < 59 && jugador.suelo && !UI.ocupada()) {
      s.huida = true; Sis.guardar(); Cin.huidaInicio(); return;
    }
    if (s.hinode && !s.momo && d < 22 && jugador.suelo) { conversar('momo'); return; }
    if (!s.hinode && !s.tutorial.caminar && anterior && Math.hypot(jugador.x - anterior.x, jugador.z - anterior.z) > 7) { s.tutorial.caminar = true; }
    if (jugador.planeo && !s.tutorial.planear) { s.tutorial.planear = true; s.tutorial.luz = Sis.ST.luz; }
    if (s.tutorial.planear && !s.tutorial.recuperar && jugador.suelo && Sis.ST.luz > (s.tutorial.luz || 0) + 1 && alCaminar('MO06')) s.tutorial.recuperar = true;
    if (!s.hinode && !s.tutorial.capa && Math.hypot(jugador.x + 16, jugador.z - 21) < 7 && alCaminar('MO03')) s.tutorial.capa = true;
    if (!s.hinode && !s.tutorial.ruta && jugador.x < -18 && jugador.suelo && alCaminar('MO05')) s.tutorial.ruta = true;
    if (s.huida && !s.hinode && d < 55 && !s.tutorial.torii && alCaminar('HU03')) s.tutorial.torii = true;
    if (s.rumbo && !s.tutorial.salida && Math.hypot(jugador.x + 126, jugador.z - 27) < 25 && alCaminar('SA01')) s.tutorial.salida = true;
    if (s.rumbo && !s.fin && (Math.hypot(jugador.x + 126, jugador.z - 27) < P.radioSalida || Math.hypot(jugador.x - sitio('petalo').x, jugador.z - sitio('petalo').z) < 20)) {
      s.fin = true; sincronizar(); nota('salida', 'El camino de los cerezos', 'Dejo Hinode para buscar el registro en el Santuario del Pétalo. Puedo volver a hablar con Tsuru y revisar las pruebas.'); Sis.guardar();
      UI.banner('Rumbo al Santuario del Pétalo', 'Busca el registro en el atril exterior, junto a la escalinata', 'brote', 'mision');
    }
    if (tAyuda > P.ayudaTras && !s.hinode && !s.tutorial.hinode && alCaminar('DE07')) { s.tutorial.hinode = true; tAyuda = 0; }
  }
  function interactuable(jugador) {
    let best = null, distancia = Infinity;
    const cand = (p, radio, txt, fn) => {
      if (!p || Math.abs(jugador.y - p.y) > 3) return;
      const d = Math.hypot(jugador.x - p.x, jugador.z - p.z);
      if (d < radio && d < distancia) { distancia = d; best = { x: p.x, z: p.z, txt, fn }; }
    };
    const s = estado(), pts = PatioInicio.puntos;
    Capitulos.candidatos(jugador, cand);   // primero: ante un empate de distancia gana el punto del capítulo
    if (!s.nombre) { cand({ x: jugador.x, y: jugador.y, z: jugador.z }, 4, 'Hablar con Lumi · {interactuar}', () => conversar('nombre')); return best; }
    if (s.rumbo) cand(Estr.registroPetalo, 2.1, s.registroPetalo ? 'Volver a leer el registro del Pétalo' : 'Leer el registro de las ofrendas', () => conversar('registroPetalo'));
    cand(pts.aviso, 2.6, 'Leer el aviso del faro', () => conversar('aviso'));
    cand(pts.tsuru, 3.2, !s.tsuru ? 'Hablar con Tsuru' : s.hoja && !s.rumbo ? 'Preguntar por el registro del Pétalo' : 'Preguntar a Tsuru', () => {
      if (!s.momo) conversar('momo'); else if (!s.tsuru) conversar('tsuru'); else if (s.hoja && !s.rumbo) conversar('rumbo'); else if (Sis.encargo('tsuru')) Sis.hablar('tsuru'); else preguntas();
    });
    cand(pts.momo, 2.5, 'Hablar con Momo', () => {
      if (!s.momo) conversar('momo'); else if (!s.tsuru) conversar('tsuru');
      else if (Sis.encargo('momo')) Sis.hablar('momo');   // un encargo (68-secundarias.js) antes que repetir lo de siempre
      else conversar(s.farol ? 'momoFarol' : 'momoAyuda');
    });
    if (s.tsuru) {
      cand(pts.hoja, 2.1, 'Examinar la hoja del registro', () => conversar(s.hoja ? 'documento' : 'hoja'));
      if (!s.postigo) cand(pts.farol, 2.1, 'Asegurar el postigo · {interactuar}', () => {
        s.postigo = true; Sis.guardar(); J.recoger = .8; conversar('postigo');
      });
      else if (!s.farol) cand(pts.farol, 2.1, 'Compartir un poco de luz · {interactuar}', () => {
        if (Sis.ST.luz < P.costeFarol) { UI.aviso('Descansa un momento: la luz del entorno vuelve a ti.'); return; }
        s.farol = true; Sis.ST.luz -= P.costeFarol; J.recoger = .8; Sis.guardar();
        nota('farol', 'Una luz que sí se comparte', 'Aseguré el postigo y compartí luz ambiental con el farol de Momo. Mi energía puede recuperarse. No fue una ofrenda.');
        conversar('farol');
      });
      // El testimonio está separado del papel para no tapar la acción principal.
      cand({ x: pts.tsuru.x + 1.4, y: pts.tsuru.y, z: pts.tsuru.z - 1.7 }, 1.6, 'Escuchar el testimonio de Tsuru', () => conversar('testimonio'));
    }
    // los habitantes de la aldea: Yuki, Kaito y Taiyō siempre; los demás, cuando tienen un encargo (Sis.hablar elige de qué hablan)
    for (const id in Sis.npcs) {
      const n = Sis.npcs[id]; if (n.g.visible && (['yuki', 'kaito', 'taiyo'].includes(id) || Sis.encargo(id))) cand(n.g.position, 3, 'Hablar con ' + n.nombre, () => Sis.hablar(id));
    }
    return best;
  }
  function pista() {
    const s = estado();
    if (!s.nombre) return 'Muévete con {mover} y acércate a Lumi · {interactuar}';
    if (!s.hinode) return UI.teclas(dato(s.huida ? 'HU02' : !s.tutorial.caminar ? 'MO01' : !s.tutorial.saltar ? 'MO02' : 'MO04').texto);
    if (!s.tsuru) return 'Busca a Tsuru en el patio. Puedes revisar tu objetivo en el diario.';
    if (!s.hoja) return 'La hoja está sobre la mesa. Ayudar a Momo es opcional.';
    return Capitulos.pista();
  }
  function encuadrar(dt) {
    if (!encuadre || !UI.dlg) return false;
    const e = encuadre, k = 1 - Math.exp(-4 * dt); e.actual.lerp(e.desde, k);
    camera.position.copy(e.actual); camera.lookAt(e.mirar.x, e.mirar.y, e.mirar.z); return true;
  }
  function reintentarHuida(c) {
    if (estado().hinode) return false;
    c.estado = 'regreso'; c.tEst = 0; c.tVer = 0; c.marca.visible = false;
    teletransportar(-23, 32); J.inv = 3; UI.aviso('El ojo te encontró. Vuelve a cubrirte y cruza cuando se aparte.'); return true;
  }
  function diario() {
    const s = estado();
    const notas = s.notas.map(n => '<div class="dia"><h4>' + n.titulo + '</h4><p>' + n.texto.replace(/\n/g, '<br>') + '</p></div>').join('');
    return (notas || '<div class="md">Lo que descubras quedará aquí, con su procedencia.</div>') + (s.dialogo ? '<div class="dia"><h4>Conversación pendiente</h4><p>Al continuar volverás a la intervención que estabas leyendo.</p></div>' : '');
  }
  return { iniciar, reanudar, actualizar, interactuable, conversar, completar, nota, prologoFin, pista, diario, encuadrar, reintentarHuida, sincronizar, alCaminar, aprender, get estado() { return estado(); } };
})();
