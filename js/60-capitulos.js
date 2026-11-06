/* Lógica de los capítulos 1–7 sobre el motor del inicio (51-piloto.js): puntos del relato, conversaciones, comentarios
   al caminar y pistas. Texto y misiones en 59-guion-capitulos.js; objetos y figuras en 61-escenario-capitulos.js;
   regiones, sistemas y fin de capítulo en 49-campana.js. Cada paso de misión avanza por eventos con nombre (Sis.evento):
   aquí solo se decide cuándo hablar, qué se puede tocar y qué pasos ya están cumplidos. */
"use strict";
/* radios (m) de los puntos y de los comentarios al acercarse; fundido (ms) antes de un recuerdo */
const CAP_RADIOS = { altar: 4, mural: 4.5, npc: 3.4, eco: 12, arena: 30, faroles: 18, emisor: 2.6, gruta: 14, conejo: 9, sayo: 3.2, fundido: 500 };
/* evento que emite el final de cada conversación de capítulo */
const CAP_EVENTOS = {
  c1_altar: 'c1:altar_observado', c1_mural: 'c1:mural_comparado', c1_tsuru: 'c1:testimonio_compartido',
  c2_kaito: 'c2:kaito_consultado', c2_rui: 'c2:rui_observado', c2_sayo: 'c2:sayo_escuchada', c2_kaitoFin: 'c2:pruebas_compartidas',
  c3_archivo: 'c3:archivo_contrastado', c3_estela: 'c3:esquema_copiado', c3_estelaLibre: 'c3:esquema_copiado', c3_tsuru: 'c3:pruebas_compartidas',
  c4_refugio: 'c4:refugio_conocido', c4_mirador: 'c4:regreso_decidido', c4_captura: 'c4:momo_capturada',
  c5_senal: 'c5:senal', c5_senalLibre: 'c5:senal', c5_taiyo: 'c5:registros', c5_plaza: 'c5:plaza_hablada', c5_despues: 'c5:despues',
  c6_gruta: 'c6:ruta_acordada', c6_registro: 'c6:registro_leido', c6_libre: 'c6:regreso_acordado',
  c7_plan: 'c7:plan', c7_evacuacion: 'c7:evacuacion', c7_libre: 'c7:dorada_libre',
  ep7_hinode: 'ep7:archivos', ep7_propuesta: 'ep7:propuesta_publica', ep7_senal: 'ep7:senal_orientada',
  ep7_entrega: 'ep7:suministros_entregados', ep7_mesa: 'ep7:mesa_preparada', ep7_memoria: 'ep7:memoria', ep7_nombre: 'ep7:nombre'
};
/* epílogo: cada tarea conserva su marca aunque se haga antes de su paso en la misión */
const EP7_EVENTOS = {
  archivos: 'ep7:archivos', propuesta: 'ep7:propuesta_publica', senal: 'ep7:senal_orientada', yoake: 'ep7:yoake',
  cesta: 'ep7:cesta_recogida', suministros: 'ep7:suministros_entregados', mesa: 'ep7:mesa_preparada', memoria: 'ep7:memoria', nombre: 'ep7:nombre', fin: 'ep7:fin'
};
/* capítulo 6: emboscada en el paso de los mojones (m desde la arena de Escarcha hacia el faro), radio en que brota,
   radio de la arena en que se da por superada y Sombras que la forman */
const EMBOSCADA = { paso: 35, brota: 45, superada: 45, tipos: ['rastrera', 'lanzadora'], separacion: 4 };
/* misión principal de cada capítulo */
const CAP_MISIONES = { 1: 'c1_petalo', 2: 'c2_marea', 3: 'c3_duna', 4: 'c4_velo', 5: 'c5_tasogare', 6: 'c6_kiri', 7: 'c7_luna' };

const Capitulos = (() => {
  const R = CAP_RADIOS;
  /* marcas de una sola vez de los capítulos, en el estado del relato (se guardan con la partida) */
  const marcas = () => { const s = Sis.ST.inicio; if (!s.cap) s.cap = {}; return s.cap; };
  /* paso actual de una misión: -1 sin revelar, 99 hecha */
  const paso = id => { const m = Sis.ST.mis[id]; return !m ? -1 : m.e === 'hecha' ? 99 : m.p; };
  const cerca = (J, p, r) => !!p && Math.hypot(J.x - p.x, J.z - p.z) < r;
  // sin altura: el punto se alcanza desde la escalinata o el suelo
  const plano = p => p && { x: p.x, z: p.z };
  function una(clave, id) { const c = marcas(); if (c[clave] || !Piloto.alCaminar(id)) return false; c[clave] = true; return true; }
  function hablarUna(clave, bloque) { const c = marcas(); if (c[clave]) return false; c[clave] = true; Piloto.conversar(bloque); return true; }
  function notaDe(id) { for (const n in GUION_CAPITULOS) { const t = GUION_CAPITULOS[n].notas[id]; if (t) { Piloto.nota(id, t[0], t[1]); return; } } }
  const mural = k => plano(Estr.murales.find(m => m.k === k));
  const eco = id => { const e = Ecos.lista.find(o => o.E.id === id); return e && { x: e.x, z: e.z }; };
  const npc = id => Sis.npcs[id] && plano(Sis.npcs[id].g.position);

  /* ¿ya está cumplido lo que pide este evento? (el jugador pudo hacerlo antes de que la misión lo pidiera) */
  function cumplido(ev) {
    let m;
    if (ev && ev.startsWith('ep7:')) return Object.keys(EP7_EVENTOS).some(k => EP7_EVENTOS[k] === ev && !!epilogo()[k]);
    if (ev === 'katana') return Sis.tiene('katana');
    if (ev === 'c2:emisor_cubierto') return !!marcas().emisor;
    if (ev === 'c4:agua_repartida') return !!marcas().agua;
    if (ev === 'c4:senal_lista') return !!marcas().senal;
    // las piedras y los glifos ya colocados cuentan al retomar estas conversaciones fuera de orden
    if ((m = /^jefe:(musgoso|arena):items$/.exec(ev))) {
      const s = Jefes.st(m[1]), it = m[1] === 'musgoso' ? 'piedra' : 'glifo';
      return !!(s.inv || s.visto || s.der || s.can) || Sis.tiene(it) + Object.keys(s.slots || {}).length >= 3;
    }
    if ((m = /^reto:(\w+)$/.exec(ev))) return !!Sis.ST.retos[m[1]];
    if ((m = /^frag:(\d)$/.exec(ev))) return !!Sis.ST.frag[+m[1]];
    if ((m = /^jefe:(\w+):(pelea|purificado|canal)$/.exec(ev))) { const s = Jefes.st(m[1]); return m[2] === 'pelea' ? !!s.visto : m[2] === 'purificado' ? !!s.der : !!s.can; }
    return false;
  }
  function reconciliar() {
    migrarEpilogo();
    const ep = Sis.ST.mis.ep7_amanecer, qep = MIS.find(o => o.id === 'ep7_amanecer');
    // Avanzar tantas tareas guardadas como haya seguidas; nunca emitir el cierre desde los créditos abiertos.
    while (ep && ep.e === 'activa' && qep.pasos[ep.p] && cumplido(qep.pasos[ep.p].ev)) {
      const antes = ep.p; Sis.evento(qep.pasos[ep.p].ev); if (ep.p === antes && ep.e === 'activa') break;
    }
    for (const n in CAP_MISIONES) {
      const id = CAP_MISIONES[n], m = Sis.ST.mis[id]; if (!m || m.e !== 'activa') continue;
      const q = MIS.find(o => o.id === id), s = q && q.pasos[m.p];
      if (s && s.k === 'ev' && cumplido(s.ev)) Sis.evento(s.ev);
    }
  }
  /* tocar un fragmento: recuerdo en el faro (se precarga con la pantalla en negro), integración y lo que cuenta Hikari */
  function tocarFragmento(i, variante, bloque) {
    if (Sis.ST.frag[i] || Cin.activa) return;
    UI.fundido(1, R.fundido);
    setTimeout(() => precargarRuta(Cin.RUTAS.intro, () => {
      UI.fundido(0, R.fundido);
      Cin.recuerdo(() => { Sis.integrarFragmento(i); Piloto.conversar(bloque); }, variante);
    }), R.fundido + 50);
  }

  /* ---------- capítulo 1 · el Pétalo ---------- */
  const capitulo1 = {
    candidatos(J, cand) {
      const p = paso('c1_petalo'), A = plano(Estr.altar.petalo);
      if (p === 0) cand(A, R.altar, 'Examinar el altar', () => Piloto.conversar('c1_altar'));
      else if (p > 0 && p < 8) cand(A, R.altar, 'Examinar el altar', () => Piloto.conversar('c1_altarPronto'));
      else if (p === 8) cand(A, R.altar, 'Tocar el fragmento', () => tocarFragmento(0, 0, 'c1_recuerdo'));
      if (p === 1) cand(mural(4), R.mural, 'Comparar el mural con el sello del registro', () => Piloto.conversar('c1_mural'));
      if (p === 9) cand(PatioInicio.puntos.tsuru, R.npc, 'Contar a Tsuru lo que encontraste', () => Piloto.conversar('c1_tsuru'));
    },
    actualizar(J) {
      const p = paso('c1_petalo'); if (p < 0 || p === 99) return;
      if (p >= 1 && p <= 3 && cerca(J, eco('cerezo'), R.eco)) una('eco', 'CPM01');
      if (p === 2 && hablarUna('katana', 'c1_katana')) return;
      // la escuela de luz llega al romper las tres Sombras de la emboscada de la katana (fase 6)
      if (p >= 3 && Sis.tiene('katana') && (Sis.ST.sombrasRotas || 0) >= 3 && !Sis.tiene('escuela') && hablarUna('formaLuz', 'c1_forma_luz')) return;
      if (p === 3 && Sis.tiene('semilla') >= 1) una('semilla', 'CPM06');
      if ((p === 3 || p === 4) && !Jefes.st('cerezo').can && cerca(J, ARENAS.cerezo, R.arena) && hablarUna('arena', 'c1_arena')) return;
      if (p === 5) una('hojas', 'CPG04');
      if (p === 7) {
        if (!marcas().canal) una('canal', 'CPG08');
        else if (cerca(J, Estr.faroles[0], R.faroles)) una(Sombras.custodia('petalo') ? 'oni' : 'faroles', Sombras.custodia('petalo') ? 'CPK04' : 'CPG10');
      }
      if (p === 8) una('fragmento', 'CPG15');
    },
    pista() {
      const p = paso('c1_petalo');
      if (p === 3) return 'Las semillas brillan en Sakura. Mantén {lumi} para que Lumi te guíe.';
      if (p === 7 && Sombras.custodia('petalo')) return 'Vence al oni de sombra que guarda los faroles.';
      return null;
    }
  };

  /* ---------- capítulo 2 · la Marea ---------- */
  const capitulo2 = {
    candidatos(J, cand) {
      const p = paso('c2_marea'), P = EscenarioCapitulos.puntos, A = plano(Estr.altar.marea);
      if (p === 0) cand(npc('kaito'), R.npc, 'Hablar con Kaito', () => Piloto.conversar('c2_kaito'));
      if (p === 2) cand(P.emisor, R.emisor, 'Asegurar el postigo del emisor', () => { marcas().emisor = true; J.recoger = .8; Sonido.sfx('ui2'); Sis.evento('c2:emisor_cubierto'); Sis.guardar(); });
      if (p === 3) cand(P.sayo, R.sayo, 'Hablar con la mujer de la gruta', () => Piloto.conversar('c2_sayo'));
      if (p === 10) cand(A, R.altar, 'Tocar el fragmento', () => tocarFragmento(2, 1, 'c2_recuerdo'));
      if (p === 11) cand(npc('kaito'), R.npc, 'Contar a Kaito lo que encontraste', () => Piloto.conversar('c2_kaitoFin'));
    },
    actualizar(J) {
      const p = paso('c2_marea'), P = EscenarioCapitulos.puntos, c = marcas(); if (p < 0 || p === 99) return;
      if (p === 1 && cerca(J, eco('pescador'), R.eco) && hablarUna('rui', 'c2_rui')) return;
      if (p === 2) {
        if (cerca(J, P.emisor, R.gruta) && hablarUna('gruta', 'c2_gruta')) return;
        if (c.gruta && !c.conejoCruza && cerca(J, P.emisor, R.conejo)) { c.conejoCruza = true; EscenarioCapitulos.cruzarConejo(); }
        if (c.conejoCruza) una('conejo', 'C2GR05');
      }
      // pista opcional del estanque: no añade un paso de misión ni exige volver al muelle
      if (p >= 4 && p <= 6 && !Jefes.st('marea').visto && !Jefes.st('marea').can && cerca(J, ARENAS.marea, R.arena) && hablarUna('nudoMarea', 'c2_amarre')) return;
      if (p === 4 && cerca(J, Estr.altar.marea, R.arena)) una('altarMarea', 'C2AG01');
      if (p === 6) { una('perlaMarea', 'C2AG03'); if (cerca(J, ARENAS.marea, R.arena)) una('arenaMarea', 'C2AG04'); }
      if (p === 7) una('brazaletes', 'C2AG06');
      if (p === 9) una('calmado', 'C2AG10');
    },
    pista() {
      const p = paso('c2_marea');
      if (p === 2) return 'La Gruta de las Luciérnagas está en Sakura. Mantén {lumi} para que Lumi te guíe.';
      if (p === 4) return 'Las perlas de luz brillan bajo el agua de la laguna. Mantén {agacharse} para bucear.';
      return null;
    }
  };

  /* ---------- capítulo 3 · Duna ---------- */
  const capitulo3 = {
    candidatos(J, cand) {
      const p = paso('c3_duna'), P = EscenarioCapitulos.puntos;
      if (p === 0) cand(P.archivo, R.altar, 'Consultar el archivo de Duna', () => Piloto.conversar('c3_archivo'));
      if (p === 1) cand(P.estela, R.altar, 'Examinar la estela del esquema', () => Piloto.conversar(Jefes.st('arena').can ? 'c3_estelaLibre' : 'c3_estela'));
      if (p === 7) cand(plano(Estr.altar.duna), R.altar + 1, 'Tocar el fragmento', () => tocarFragmento(1, 2, 'c3_recuerdo'));
      if (p === 8) cand(PatioInicio.puntos.tsuru, R.npc, 'Contar a Tsuru lo que encontraste', () => Piloto.conversar('c3_tsuru'));
    },
    actualizar(J) {
      const p = paso('c3_duna'), S = sitio('duna'); if (p < 0 || p === 99) return;
      if (p === 0 && cerca(J, S, R.arena) && hablarUna('oasis', 'c3_oasis')) return;
      if (p === 2 && cerca(J, S, R.arena * 1.5)) una('piramides', 'CDG01');
      if (p === 3 && cerca(J, ARENAS.arena, R.arena)) una('red', 'CDG04');
      if (p === 4) una('cadenas', 'CDG05');
      if (p === 6) { una('calmaArena', 'CDG09'); if (cerca(J, Estr.altar.duna, R.faroles)) una('orbes', 'CDT01'); }
      if (p === 7) una('fragArena', 'CDT04');
    },
    pista() {
      const p = paso('c3_duna');
      if (p === 2) return 'Los glifos brillan en lo alto de las tres pirámides. Sube por sus escaleras.';
      if (p === 6) return 'El altar de la Duna está en el santuario. Los orbes se apagan en 100 segundos.';
      return null;
    }
  };

  /* ---------- capítulo 4 · fuera del Velo ---------- */
  /* la travesía cambia de isla: al llegar o volver se guarda dónde está el grupo y avanza la misión */
  function cruzar(ida) { Cin.travesia(ida, () => { marcas().enYoake = ida; Sis.evento(ida ? 'c4:velo_cruzado' : 'c4:regreso_desembarcado'); Sis.guardar(); }); }
  const capitulo4 = {
    candidatos(J, cand) {
      const p = paso('c4_velo'), P = IslaYoake.puntos;
      if (p === 4) cand(npc('kaito'), R.npc, 'Subir a la barca de Kaito', () => Piloto.conversar('c4_barca'));
      if (p === 5) cand(P.aiko, R.npc, 'Hablar con Aiko', () => Piloto.conversar('c4_refugio'));
      if (p === 6) cand(P.compuerta, R.emisor + .6, 'Orientar la compuerta hacia el bancal seco', () => { marcas().agua = true; J.recoger = .8; Sonido.sfx('ui2'); Sis.evento('c4:agua_repartida'); Piloto.alCaminar('C4R13'); Sis.guardar(); });
      if (p === 7) cand(P.lampara, R.emisor + .6, 'Liberar el postigo de la lámpara', () => { marcas().senal = true; J.recoger = .8; Sonido.sfx('farol'); Sis.evento('c4:senal_lista'); Piloto.alCaminar('C4R16'); Sis.guardar(); });
      if (p === 8) cand(P.mirador, R.altar, 'Mirar el amanecer', () => Piloto.conversar('c4_mirador'));
      if (p === 9) cand(P.embarcadero, R.altar, 'Volver a la barca de Kaito', () => Piloto.conversar('c4_vuelta'));
    },
    actualizar(J) {
      const p = paso('c4_velo'), c = marcas(); if (p < 0 || p === 99) return;
      // el arco de luz se aprende tras habilitar la señal con Ren (fase 6)
      if (p >= 8 && c.senal && !Sis.tiene('arco') && hablarUna('formaArco', 'c4_forma_arco')) return;
      if (p === 1) { if (!una('cerco1', 'C4N02')) una('cerco2', 'C4N03'); }
      if (p === 3) {
        if (hablarUna('perdida', 'c4_perdida')) return;
        una('costa', 'C4T08');
        if (cerca(J, npc('kaito'), R.arena / 3)) Sis.evento('c4:muelle_alcanzado');
      }
      if (p === 7 && cerca(J, IslaYoake.puntos.torre, R.gruta) && hablarUna('ren', 'c4_ren')) return;
      if (p === 10 && !c.momoCapturada && !Cin.activa) { c.momoCapturada = true; Cin.capturaMomo(() => Piloto.conversar('c4_captura')); }
    },
    pista() {
      const p = paso('c4_velo');
      if (p === 1) return 'Resiste las oleadas de Sombras en la plaza de Hinode. Yuki protege a los niños.';
      if (p === 3) return 'El muelle de Kaito está al suroeste de Hinode. Cúbrete del Cazador tras las rocas.';
      return null;
    }
  };

  /* ---------- capítulo 5 · el rescate de Momo ---------- */
  const capitulo5 = {
    candidatos(J, cand) {
      const p = paso('c5_tasogare'), P = EscenarioCapitulos.puntos;
      if (p === 5) cand(npc('taiyo'), R.npc, 'Hablar con Taiyō', () => Piloto.conversar('c5_taiyo'));
      if (p === 9 && P.cierre) cand(P.cierre, R.emisor, 'Interrumpir el extractor y abrir el aro', () => Cin.muerteTasogare());
    },
    actualizar(J) {
      const p = paso('c5_tasogare'), P = EscenarioCapitulos.puntos; if (p < 0 || p === 99) return;
      if (p === 0 && hablarUna('senalMomo', Jefes.st('musgoso').can ? 'c5_senalLibre' : 'c5_senal')) return;
      if ((p === 1 || p === 2) && !Jefes.st('musgoso').can && !Jefes.st('musgoso').visto && cerca(J, ARENAS.musgoso, R.arena) && hablarUna('guardian', 'c5_guardian')) return;
      if (p === 3) una('musgo', 'C5G05');
      if (p === 5) una('calmaMusgo', 'C5G09');
      if (p === 6 && cerca(J, sitio('faro'), R.arena + 10) && hablarUna('plaza', 'c5_plaza')) return;
      if (p === 8) { if (!una('espiral1', 'C5L01') && !una('espiral2', 'C5L03')) una('ojo', 'C5L05'); }
      if (p === 9 && cerca(J, P.aro, R.faroles / 2) && hablarUna('momo', 'c5_momo')) return;
      if (p === 10 && hablarUna('despues', 'c5_despues')) return;
    },
    pista() {
      const p = paso('c5_tasogare');
      if (p === 1) return 'Las Piedras Ancestrales están junto al sendero que sube al Mirador.';
      if (p === 8) return 'Ilumina cada plataforma de la espiral con {haz} antes de pisarla.';
      return null;
    }
  };

  /* ---------- capítulo 6 · Kiri ---------- */
  /* el paso de los mojones: entre la arena de Escarcha y el faro */
  function pasoMojones() { const A = ARENAS.escarcha, d = Math.hypot(A.x, A.z), E = EMBOSCADA; return { x: A.x - A.x / d * E.paso, z: A.z - A.z / d * E.paso }; }
  function emboscada() {
    const P = pasoMojones(), E = EMBOSCADA, zona = { x: P.x, z: P.z, r: 10, tipos: E.tipos, estado: 'activa', n: 0 };
    E.tipos.forEach((tipo, i) => { Sombras.crear(tipo, P.x + (i - .5) * E.separacion, P.z, zona); zona.n++; });
    notaDe('c6_emboscada'); Piloto.alCaminar('C6B01');
  }
  const capitulo6 = {
    candidatos(J, cand) {
      const p = paso('c6_kiri'), P = EscenarioCapitulos.puntos;
      if (p === 0) cand(P.sayo, R.altar, 'Ordenar las pruebas con Lumi', () => Piloto.conversar('c6_gruta'));
      if (p === 6) cand(plano(Estr.altar.escarcha), R.altar + 1, 'Tocar el fragmento', () => tocarFragmento(3, 3, 'c6_identidad'));
      if (p === 7) cand(plano(Estr.cima), R.altar, 'Leer el registro de Kiri', () => Piloto.conversar('c6_registro'));
    },
    actualizar(J) {
      const p = paso('c6_kiri'), c = marcas(); if (p < 0 || p === 99) return;
      if (p === 1) {
        if (!c.emboscada && cerca(J, pasoMojones(), EMBOSCADA.brota)) { c.emboscada = true; emboscada(); }
        if (cerca(J, ARENAS.escarcha, EMBOSCADA.superada)) { Sis.evento('c6:intercepcion'); Piloto.alCaminar('C6B03'); }
      }
      // comentarios opcionales ante el refugio y la arena; las balizas conservan su objetivo propio
      if (p === 2 && cerca(J, ARENAS.escarcha, R.arena * 1.5)) {
        if (!una('refugioKiri', 'GF-C6-P01') && !una('balizas', 'C6B04')) una('gestoKiri', 'C6B06');
      }
      if (p === 3 && !una('estacas', 'C6G01')) una('ventisca', 'C6G04');
      if (p === 5) { una('calmaHielo', 'C6G08'); if (cerca(J, Estr.altar.escarcha, R.faroles)) una('cristales', 'C6C01'); }
      if (p === 8 && cerca(J, ARENAS.escarcha, R.arena) && hablarUna('traicion', 'c6_traicion')) return;
      if (p === 10 && hablarUna('libre', 'c6_libre')) return;
    },
    pista() {
      const p = paso('c6_kiri');
      if (p === 0) return 'La cámara de la Gruta de las Luciérnagas, en Sakura, está fuera de la red del faro.';
      if (p === 7) return 'Las corrientes de aire de Kiri te suben: planea dentro de ellas manteniendo {saltar}.';
      return null;
    }
  };

  /* ---------- capítulo 7 · la Luna Roja, y el epílogo ---------- */
  function epilogo() { const c = marcas(); return c.ep7 || (c.ep7 = {}); }
  /* partidas del recorrido anterior de cinco pasos: conservar lo visto y ofrecer las tareas nuevas */
  function migrarEpilogo() {
    const m = Sis.ST.mis.ep7_amanecer; if (!m || epilogo().version) return;
    const e = epilogo(), antiguas = ['archivos', 'yoake', 'memoria', 'nombre', 'fin'];
    if (m.e === 'hecha') Object.keys(EP7_EVENTOS).forEach(k => { e[k] = true; });
    else { antiguas.slice(0, m.p).forEach(k => { e[k] = true; }); m.p = 0; m.c = 0; }
    e.version = 1; Sis.guardar();
  }
  function terminarTarea(clave, J) {
    const e = epilogo(); if (e[clave]) return;
    e[clave] = true; if (J) J.recoger = .8;
    Sis.evento(EP7_EVENTOS[clave]); Sis.guardar();
  }
  const capitulo7 = {
    candidatos(J, cand) {
      const p = paso('c7_luna'), e = paso('ep7_amanecer'), P = EscenarioCapitulos.puntos, Y = IslaYoake.puntos;
      if (p === 2) cand(npc('kaito'), R.npc, 'Confirmar con Kaito la evacuación', () => Piloto.conversar('c7_evacuacion'));
      if (p === 3 && P.cierre) cand(P.cierre, R.emisor, 'Invertir el conducto', () => Cin.encarnacion(C => { DueloLuna.empezar(C); Sis.evento('c7:conducto'); }));
      if (e < 0 || e === 99 || epilogo().memoria) cand(npc('momo'), R.npc, 'Hablar con Momo · {interactuar}', () => {
        if (Sis.encargo('momo')) Sis.hablar('momo'); else Piloto.conversar('c7_momoSegura');
      });
      else cand(npc('momo'), R.npc, 'Colocar los nombres con Sayo y Momo · {interactuar}', () => Piloto.conversar('ep7_memoria'));
      if (e < 0) return;
      if (marcas().enYoake) cand(Y.embarcadero, R.altar, 'Volver a Hinode · {interactuar}', () => viajarEpilogo(false));
      else cand(Y.epViaje, R.npc, 'Viajar con Kaito a Yoake · {interactuar}', () => Piloto.conversar('ep7_kaito'));
      if (e === 99) return;
      const t = epilogo();
      if (!t.archivos) cand(Y.epArchivos, R.emisor, 'Abrir los archivos · {interactuar}', () => Piloto.conversar('ep7_hinode'));
      if (!t.propuesta) cand(Y.epPropuesta, R.emisor, 'Colocar la propuesta · {interactuar}', () => Piloto.conversar('ep7_propuesta'));
      if (!t.senal) cand(Y.epSenal, R.emisor, 'Orientar la señal hacia la entrada · {interactuar}', () => Piloto.conversar('ep7_senal'));
      if (!t.cesta && !t.suministros) cand(Y.epCesta, R.emisor, 'Recoger la cesta · {interactuar}', () => { terminarTarea('cesta', J); Sonido.sfx('ui2'); Piloto.alCaminar('EP7T04'); });
      if (t.cesta && !t.suministros) cand(Y.epEntrega, R.emisor, 'Dejar la cesta junto al canal · {interactuar}', () => Piloto.conversar('ep7_entrega'));
      if (!t.mesa) cand(Y.epMesa, R.emisor, 'Preparar un sitio con Chiyo · {interactuar}', () => Piloto.conversar('ep7_mesa'));
      if (!t.memoria) cand(Y.epMemoria, R.emisor, 'Colocar los nombres con Sayo y Momo · {interactuar}', () => Piloto.conversar('ep7_memoria'));
      if (t.memoria && !t.nombre) cand(Y.mirador, R.altar, 'Caminar con Momo hasta el mirador · {interactuar}', () => Piloto.conversar('ep7_nombre'));
      const objetivo = MIS.find(m => m.id === 'ep7_amanecer').pasos[e];
      if (objetivo && objetivo.ev === 'ep7:fin') cand(Y.mirador, R.altar, 'Terminar este recorrido · {interactuar}', () => EscenasCapitulos.creditos(() => terminarTarea('fin')));
    },
    actualizar(J) {
      const p = paso('c7_luna'), c = marcas(), P = EscenarioCapitulos.puntos;
      if (p === 0 && cerca(J, sitio('faro'), R.arena + 10) && hablarUna('plan7', 'c7_plan')) return;
      if (p === 1) una('paso7', 'C7B01');
      if (p === 3 && cerca(J, P.aro, R.faroles / 2) && hablarUna('corona7', 'c7_corona')) return;
      if (p === 4 && DueloLuna.activo) { if (DueloLuna.etapa >= 2 && !una('ramales', 'C7G04')) { if (!una('digna', 'C7G05')) una('padre', 'C7G06'); } }
      if (p === 5) una('vencida', 'C7G10');
      if (p === 6 && !Cin.activa) {
        // Cargar entre el montaje y el diálogo retoma la conversación, sin volver a pagar el coste de Lumi.
        if (c.doradaLibre) Piloto.conversar('c7_libre');
        else Cin.liberacion(() => Piloto.conversar('c7_libre'));
      }
      if (c.ep7 && c.ep7.yoake && c.enYoake && hablarUna('epLlegada', 'ep7_llegada')) return;
    },
    pista() {
      const p = paso('c7_luna');
      if (p === 1) return 'Despeja la plaza del faro: Yuki mantiene el paso de los niños.';
      if (p === 3) return 'Sube por la espiral del faro hasta la corona.';
      if (p === 4) return 'Abre las cubiertas de los anclajes con {haz} y córtalos con {atacar}. Esquiva sus avisos.';
      return null;
    }
  };

  const CAPITULOS_LOGICA = { 1: capitulo1, 2: capitulo2, 3: capitulo3, 4: capitulo4, 5: capitulo5, 6: capitulo6, 7: capitulo7 };
  /* los capítulos ya abiertos siguen respondiendo (una misión puede quedar a medias al pasar al siguiente) */
  const abiertos = () => Object.keys(CAPITULOS_LOGICA).filter(n => Campana.capitulo() >= +n).map(n => CAPITULOS_LOGICA[n]);

  Bus.on('conversacion', id => {
    notaDe(id === 'c3_estelaLibre' ? 'c3_estela' : id);
    const clave = Object.keys(EP7_EVENTOS).find(k => EP7_EVENTOS[k] === CAP_EVENTOS[id]);
    if (clave) terminarTarea(clave); else if (CAP_EVENTOS[id]) Sis.evento(CAP_EVENTOS[id]);
  });
  Bus.on('retoFallo', id => { if (id === 'petalo') Piloto.alCaminar('CPG14'); else if (id === 'duna') Piloto.alCaminar('CDT03'); });
  // Duna: Lumi comprueba la usurpación y decide seguir informando (no se muestra; lo confiesa en el capítulo 6)
  Bus.on('conversacion', id => { if (id === 'c3_archivo') marcas().lumiInforma = true; });
  /* estilos nuevos: se conceden al cerrar su conversación (una sola vez) y la primera vez que se equipan enseñan su gesto */
  const ESTILOS_GESTO = { escuela: ['Escuela de luz disponible', 'Toca {atacar} para soltar un orbe', 'palma'], arco: ['Arco de luz disponible', 'Mantén {atacar} para tensar. Suelta para disparar', 'arco'],
    escuela_viento: ['Escuela de viento disponible', 'Combina {guardia} y {atacar} para abrir espacio', 'pluma'], escuela_brasa: ['Escuela de brasa disponible', 'Combina {guardia} y {atacar}. Después, sal con {esquivar}', 'llama'],
    escuela_escarcha: ['Escuela de escarcha disponible', 'Combina {guardia} y {atacar} para frenar el avance', 'copo'], escuela_oscuridad: ['Escuela de oscuridad disponible', 'Oscuridad usa luz y un poco de vida. Siempre conserva 1 de vida', 'nucleo'] };
  /* concesión de un estilo: una sola vez; la oscuridad llega sin rótulo (la herencia de Tasogare) */
  function conceder(id, silencio) { if (Sis.tiene(id)) return; Sis.dar(id, 1, true); if (!silencio) UI.banner(ESTILOS_GESTO[id][0], 'Elige tu estilo fuera de combate', ESTILOS_GESTO[id][2], 'mision'); }
  const CONCESIONES = { c1_forma_luz: 'escuela', c4_forma_arco: 'arco' };
  Bus.on('conversacion', id => { if (CONCESIONES[id]) conceder(CONCESIONES[id], id === 'c5_forma_oscuridad'); });
  /* las escuelas de la fase 7 llegan al cumplir su paso, sin conversación que pise a la historia: rótulo y un comentario al caminar */
  const FORMAS = [{ item: 'escuela_viento', linea: 'F7V02', cuando: () => paso('c2_marea') >= 2 },
    { item: 'escuela_brasa', linea: 'F7B04', cuando: () => paso('c3_duna') >= 1 },
    { item: 'escuela_escarcha', linea: 'F7E02', cuando: () => paso('c6_kiri') >= 1 }];
  Bus.on('equipo', () => {
    const id = Sis.ST.eq.arma, g = ESTILOS_GESTO[id], S = Sis.ST; if (!g) return;
    S.consejos = S.consejos || {}; if (S.consejos['gesto_' + id]) return; S.consejos['gesto_' + id] = 1; UI.aviso(g[1], 'mision');
  });
  // Yoake: subir a la barca y volver de ella lanzan la travesía
  Bus.on('conversacion', id => { if (id === 'c4_barca') cruzar(true); else if (id === 'c4_vuelta') cruzar(false); });
  // Kiri: tras la confesión, la Luna toma a Lumi y empieza el combate de las ataduras (66-lumi-enlaces.js)
  // epílogo: el viaje a Yoake ya no cruza un Velo rojo
  function viajarEpilogo(ida) {
    // La travesía crea sus dobles al arrancar. Momo ya vive en Yoake y no embarca otra vez.
    const pasajeros = TRAVESIA.pasajeros;
    TRAVESIA.pasajeros = pasajeros.filter(n => n !== 'momo');
    try { Cin.travesia(ida, () => { marcas().enYoake = ida; if (ida) terminarTarea('yoake'); Sis.guardar(); }, { sinTextos: true, sinRojo: true }); }
    finally { TRAVESIA.pasajeros = pasajeros; }
  }
  Bus.on('conversacion', id => { if (id === 'ep7_kaito') viajarEpilogo(true); });
  Bus.on('conversacion', id => { if (id !== 'c6_traicion') return; const A = ARENAS.escarcha; LumiEnlaces.empezar({ x: A.x, y: altura(A.x, A.z), z: A.z }); Sis.evento('c6:traicion'); });
  Bus.on('capitulo', n => { const C = CAPITULOS[n]; if (C) UI.banner('Capítulo ' + n, C.nom, 'luz', 'mision'); });

  /* ---------- puertas para 51-piloto.js ---------- */
  /* Una secundaria espera a la conversación principal del mismo habitante. */
  function conversacionPendiente(id) {
    const s = Sis.ST.inicio;
    if (id === 'tsuru' || id === 'momo') {
      if (!s.momo) return 'momo';
      if (!s.tsuru) return 'tsuru';
      if (id === 'tsuru' && s.hoja && !s.rumbo) return 'rumbo';
    }
    const puertas = [
      ['c1_petalo', 9, 'tsuru', 'c1_tsuru'], ['c2_marea', 0, 'kaito', 'c2_kaito'], ['c2_marea', 11, 'kaito', 'c2_kaitoFin'],
      ['c3_duna', 8, 'tsuru', 'c3_tsuru'], ['c4_velo', 4, 'kaito', 'c4_barca'], ['c5_tasogare', 5, 'taiyo', 'c5_taiyo'],
      ['c7_luna', 2, 'kaito', 'c7_evacuacion']
    ];
    const p = puertas.find(([m, n, npc]) => Sis.npcDe(npc) === id && paso(m) === n);
    return p ? p[3] : null;
  }
  function candidatos(J, cand) { migrarEpilogo(); for (const c of abiertos()) c.candidatos(J, cand); }
  function actualizar(dt, J) {
    reconciliar();
    if (J.suelo) for (const c of abiertos()) c.actualizar(J);
    if (!Cin.activa && !UI.dlg) for (const f of FORMAS) if (!Sis.tiene(f.item) && f.cuando()) { conceder(f.item); Piloto.alCaminar(f.linea); break; }
    // la oscuridad ya es de Hikari desde que Tasogare se deshizo: partidas guardadas antes la reciben aquí
    const cap = Sis.ST.inicio && Sis.ST.inicio.cap;
    if (cap && cap.oscuridadHeredada) conceder('escuela_oscuridad', true);
  }
  function pista() { for (const c of abiertos().reverse()) { const t = c.pista(); if (t) return t; } return null; }
  /* partidas que ya estaban en un capítulo antes de que existiera su misión */
  function reanudar() { for (const n in CAP_MISIONES) if (Campana.capitulo() >= +n && !Sis.ST.mis[CAP_MISIONES[n]]) Sis.revelar(CAP_MISIONES[n]); }
  return { candidatos, actualizar, pista, reanudar, paso, cumplido, conversacionPendiente };
})();
