/* === Ecos de Luz · 07-sistemas.js ===
   Objetos e inventario, experiencia y niveles, recolectables, cofres, misiones
   (fácil → épica), retos de los santuarios, NPC, lugares descubribles y guardado. */
"use strict";

const ITEMS = {
  katana: { nom: 'Katana del Alba', tipo: 'arma', dmg: 10, alc: 2.7, vel: 1, ic: 'espada', desc: 'La hoja guardada en el Mirador. Corta sombras, no seres vivos: solo asusta y calma.' },
  naginata: { nom: 'Naginata de Escarcha', tipo: 'arma', dmg: 14, alc: 3.5, vel: .85, ic: 'lanza', desc: 'Larga y helada. Más alcance, golpes más pausados.' },
  arco: { nom: 'Arco de luz', tipo: 'arma', estilo: 'arco', dmg: 0, alc: 0, vel: 1, ic: 'arco', desc: 'Flechas de luz para mantener la distancia. Tensa la cuerda para perforar.' },
  escuela: { nom: 'Escuela de luz', tipo: 'arma', estilo: 'luz', dmg: 0, alc: 0, vel: 1, ic: 'palma', desc: 'Luz concentrada, un abanico cercano y un escudo que cuesta luz al parar.' },
  escuela_viento: { nom: 'Escuela de viento', tipo: 'arma', estilo: 'viento', dmg: 0, alc: 0, vel: 1, ic: 'pluma', desc: 'Cortes lejanos para moverte y abrir espacio.' },
  escuela_brasa: { nom: 'Escuela de brasa', tipo: 'arma', estilo: 'brasa', dmg: 0, alc: 0, vel: 1, ic: 'llama', desc: 'Calor que permanece sobre el suelo.' },
  escuela_escarcha: { nom: 'Escuela de escarcha', tipo: 'arma', estilo: 'escarcha', dmg: 0, alc: 0, vel: 1, ic: 'copo', desc: 'Frena el avance y presiona las guardias.' },
  escuela_oscuridad: { nom: 'Escuela de oscuridad', tipo: 'arma', estilo: 'oscuridad', dmg: 0, alc: 0, vel: 1, ic: 'nucleo', desc: 'Tinta contenida con un coste de luz y vida.' },
  odachi: { nom: 'Odachi Solar', tipo: 'arma', dmg: 19, alc: 3.2, vel: .7, ic: 'espadon', desc: 'Una hoja enorme que guarda el calor del primer amanecer.' },
  te: { nom: 'Té de sakura', tipo: 'cons', hp: 45, ic: 'taza', desc: 'Recupera 45 de vida.' },
  onigiri: { nom: 'Onigiri', tipo: 'cons', hp: 30, luz: 25, ic: 'arroz', desc: 'Recupera 30 de vida y 25 de luz.' },
  esencia: { nom: 'Esencia estelar', tipo: 'cons', luz: 80, ic: 'estrella', desc: 'Recupera 80 de luz.' },
  manto_alba: { nom: 'Manto del Alba', tipo: 'manto', tint: 0xffffff, perk: {}, ic: 'manto', desc: 'Tu manto original: carmesí, ámbar y oro.' },
  manto_sakura: { nom: 'Manto de Sakura', tipo: 'manto', tint: 0xffb4d2, perk: { luz: .2 }, ic: 'manto', desc: '+20 % de luz máxima.' },
  manto_marea: { nom: 'Manto de Marea', tipo: 'manto', tint: 0x6fe0d0, perk: { hp: .15 }, ic: 'manto', desc: '+15 % de vida máxima.' },
  manto_escarcha: { nom: 'Manto de Escarcha', tipo: 'manto', tint: 0xa8d8ff, perk: { dmg: .15 }, ic: 'manto', desc: '+15 % de daño de luz.' },
  manto_solar: { nom: 'Manto Solar', tipo: 'manto', tint: 0xffd060, perk: { luz: .15, dmg: .1 }, ic: 'manto', desc: '+15 % de luz y +10 % de daño.' },
  farol: { nom: 'Farol de Tsuru', tipo: 'especial', ic: 'farol', desc: 'Una brasa que no se apaga. A su luz, los murales muestran lo que el pueblo calló.' },
  mascara: { nom: 'Máscara de kitsune', tipo: 'mascara', ic: 'mascara', desc: 'Los animales te oyen menos. Equipar con Zurrón.' },
  pelaje: { nom: 'Pelaje', tipo: 'mat', ic: 'pelaje', desc: 'Suave y cálido.' }, hierba: { nom: 'Hierba fresca', tipo: 'mat', ic: 'hoja', desc: 'Sirve para té y comida.' },
  colmillo: { nom: 'Colmillo', tipo: 'mat', ic: 'colmillo', desc: 'Recuerdo de un animal calmado.' }, carne: { nom: 'Ración', tipo: 'mat', ic: 'carne', desc: 'Para cocinar onigiri.' },
  garra: { nom: 'Garra', tipo: 'mat', ic: 'garra', desc: 'Pesada y lisa.' }, miel: { nom: 'Miel', tipo: 'mat', ic: 'gota', desc: 'Dulce y espesa.' },
  escama: { nom: 'Escama', tipo: 'mat', ic: 'escama', desc: 'Brilla al sol.' }, aguijon: { nom: 'Aguijón', tipo: 'mat', ic: 'aguijon', desc: 'Con cuidado.' },
  pluma: { nom: 'Pluma', tipo: 'mat', ic: 'pluma', desc: 'Ligera como el viento.' }, concha: { nom: 'Concha', tipo: 'mat', ic: 'concha', desc: 'Guarda el sonido del mar.' },
  flor: { nom: 'Flor de té', tipo: 'mat', ic: 'flor', desc: 'Para la Abuela Tsuru.' }, perla: { nom: 'Perla de luz', tipo: 'mat', ic: 'perla', desc: 'Late con la marea.' },
  cana: { nom: 'Caña de Kaito', tipo: 'mat', ic: 'cana', desc: 'La caña perdida del pescador.' }
};
const RECETAS = [{ id: 'te', req: { flor: 2, hierba: 1 } }, { id: 'onigiri', req: { carne: 1, hierba: 1 } }, { id: 'esencia', req: { concha: 1, pluma: 1 } }, { id: 'esencia', req: { escama: 2 } }];
const DIF = ['Fácil', 'Media', 'Difícil', 'Épica'];
/* luz rescatada (motas): el puntaje que se gasta en los altares. Cuánta da cada cosa; las Sombras rotas soltarán la suya */
const LUZ_RESCATADA = { chispa: 5, eco: 25 };
/* llamas (vidas, 10-juego.js): cuántas, a qué distancia (m) se recogen las motas que dejó el Ocaso y a cuál se avivan
   junto a un altar, y su color */
const LLAMAS = { max: 3, recoger: 2.4, altar: 4.5, color: 0xffc96a };
/* mejoras que se compran con luz rescatada en los altares de los santuarios (rediseño: «toda luz tiene un precio»):
   coste de cada nivel (motas) y efecto por nivel. capa: planear gasta menos luz (fracción) y cae más despacio (caida);
   vida: vida máxima; manto: el efecto del manto equipado crece (fracción). Se compran a menos de altar m de un altar */
const MEJORAS_ALTAR = {
  capa: { nom: 'Capa de luz', ic: 'alas', desc: n => 'Planear gasta un ' + n * 12 + ' % menos de luz y cae un ' + n * 6 + ' % más despacio', costes: [40, 90, 160], efecto: .12, caida: .06 },
  vida: { nom: 'Corazón de luz', ic: 'escudo', desc: n => '+' + n * 15 + ' de vida máxima', costes: [40, 90, 160], efecto: 15 },
  manto: { nom: 'Hilo de luz', ic: 'manto', desc: n => 'El efecto de tu manto crece un ' + n * 25 + ' %', costes: [60, 120, 200], efecto: .25 }
};
const ALTAR_OFRENDA = 6;   // m: a esta distancia de un altar de santuario se puede ofrecer la luz rescatada
/* reto de los cristales de Escarcha: alcance para tocar un cristal y para volver a oír la secuencia en el altar (m),
   color de los cristales en reposo (fracción del suyo, sobre el gris) y su halo mínimo, y la cámara mientras suena la
   secuencia: altura del punto que mira sobre el suelo de la cámara (por encima del altar), distancia (m) e inclinación (rad) */
const RETO_CRISTALES = { toque: 3.2, verOtraVez: 3.2, reposo: .35, haloReposo: .18, foco: { alto: 2.2, dist: 9, pitch: 1.4 } };
const FRAGN = ['Fragmento del Pétalo', 'Fragmento de la Duna', 'Fragmento de la Marea', 'Fragmento de Escarcha'];

/* ---------- misiones ---------- */
/* la Noche Roja (rediseño): llega con el segundo fragmento (misión 'nocheRoja'); en su escena el cielo se vuelve rojo hasta el
   final (Sis.ST.cieloRojo, Atmosfera.rojo), hay más Sombras (SOMBRAS_CFG.rojo) y Tasogare roba un fragmento (Sis.ST.robado) */
/* aspecto y rutina de cada habitante (25-gente.js): pasear, jugar, pescar, vigilar o meditar; puntos relativos a su sitio.
   Las escenas crean dobles con estas fichas (con otra rutina) */
const FICHAS_NPC = {
  tsuru: { nombre: 'Abuela Tsuru', alto: 1.3, kimono: 0x8a6fa8, obi: 0x3a2a4a, pelo: 0xd8d8e0, baston: 1, farol: 1, encorvado: .3, rutina: { tipo: 'pasear', puntos: [[0, 0], [5, -3], [-3, 4]], vel: .5 } },
  momo: { nombre: 'Momo', alto: .95, kimono: 0xe58fb0, obi: 0xffd27a, pelo: 0x2a1d1a, nino: 1, moño: false, rutina: { tipo: 'jugar', radio: 3, vel: 2.4 } },
  kaito: { nombre: 'Kaito', alto: 1.6, kimono: 0x3f6f8a, obi: 0x1d2a3a, sombrero: 0xd9b26a, pelo: 0x2a1d1a, moño: false, rutina: { tipo: 'pescar', mira: .35 } },
  yuki: { nombre: 'Yuki', alto: 1.5, kimono: 0x6a9a5a, obi: 0x2a3a22, pelo: 0x1c1c26, rutina: { tipo: 'vigilar', puntos: [[0, 0], [4, 3], [-2, 5]], vel: .9 } },
  taiyo: { nombre: 'Sabio Taiyo', alto: 1.65, kimono: 0xc9a050, obi: 0x7a1d2a, barba: 1, pelo: 0xe8e8e8, baston: 1, rutina: { tipo: 'meditar', mira: 'faro' } }
};
/* misiones: las de los capítulos (50 y 59) y las secundarias (68-secundarias.js) */
const MIS = [...GUION_INICIO.misiones, ...SECUNDARIAS];
const Q = {}; MIS.forEach(m => Q[m.id] = m);

const LUGARES = [
  { id: 'faro', nom: 'Faro del Alba', ic: 'faro', x: 0, z: 0, r: 34, xp: 20, viaje: 1 }, { id: 'aldea', nom: 'Aldea de Hinode', ic: 'casa', x: -104, z: 64, r: 40, xp: 20, viaje: 1 },
  { id: 'mirador', nom: 'Ruinas del Mirador', ic: 'columna', x: 74, z: 80, r: 22, xp: 20, viaje: 1 }, { id: 'petalo', nom: 'Santuario del Pétalo', ic: 'torii', x: -252, z: -205, r: 34, xp: 30, viaje: 1 },
  { id: 'escarcha', nom: 'Santuario de Escarcha', ic: 'torii', x: 270, z: -190, r: 34, xp: 30, viaje: 1 }, { id: 'duna', nom: 'Santuario de la Duna', ic: 'torii', x: 246, z: 232, r: 34, xp: 30, viaje: 1 },
  { id: 'marea', nom: 'Santuario de la Marea', ic: 'torii', x: -246, z: 232, r: 34, xp: 30, viaje: 1 }, { id: 'muelle', nom: 'Muelle de Kaito', ic: 'ola', x: -150, z: 152, r: 18, xp: 15, viaje: 1 },
  { id: 'cristal', nom: 'Cueva de Cristal', ic: 'cueva', x: 0, z: 0, r: 16, xp: 40 }, { id: 'gruta', nom: 'Gruta de las Luciérnagas', ic: 'cueva', x: 0, z: 0, r: 24, xp: 40 },
  { id: 'kiri', nom: 'Cima de Kiri', ic: 'montana', x: CIMA_KIRI.x, z: CIMA_KIRI.z, r: 18, xp: 80 }, { id: 'oasis', nom: 'Oasis del Sol Dormido', ic: 'palmera', x: OASIS.x, z: OASIS.z, r: 30, xp: 25 },
  { id: 'circulo', nom: 'Círculo de piedras', ic: 'piedra', x: 115, z: -75, r: 16, xp: 20 }
];
// columnas de aire cálido: suben hasta alto m sobre el suelo (70 si no se dice); la última de Kiri deja planear hasta la losa de la cima
const CORR = [{ x: 264, z: -214, r: 7 }, { x: 256, z: -230, r: 7 }, { x: 233, z: -287, r: 7, alto: 82 }, { x: -70, z: -135, r: 7 }, { x: 100, z: 120, r: 6 }];

const Sis = (() => {
  const nuevoEstado = () => ({ campana: Campana.id, capitulo: 0, secundarias: { version: 1, amistades: {}, kiriVistas: {}, cierres: [] }, retos: {}, inicio: Campana.inicio(), grieta: 0, ausentes: {}, cieloRojo: false, ocultos: {}, robado: null, ultimoFrag: null, nivel: 1, xp: 0, hp: 100, luz: 100, frag: [false, false, false, false], inv: { onigiri: 2 }, eq: { arma: null, manto: 'manto_alba', mascara: false }, mis: {}, seg: null, lug: {}, rec: {}, cofres: {}, murales: {}, ecos: {}, motas: 0, llamas: LLAMAS.max, ocaso: null, onis: {}, mejoras: {}, vistos: 0, t: 0, diario: [], pos: null, final: false, vision: false, calmados: 0 });
  let ST = nuevoEstado(); const RETO = { petalo: { prog: 0 }, duna: { act: false, t: 0, n: 0 }, escarcha: { fase: 'espera', seq: [], i: 0, t: 0, k: 0 } };
  const cola = [], picks = [], npcs = {}, cofres = []; let pg, timer = null, tNpc = 0, UIr = 0;
  const secundarias = () => {
    const s = ST.secundarias || (ST.secundarias = {});
    if (!s.amistades) s.amistades = {};
    if (!s.kiriVistas) s.kiriVistas = {};
    if (!s.cierres) s.cierres = [];
    return s;
  };
  const mejora = id => (ST.mejoras && ST.mejoras[id]) || 0;
  const hpMax = () => Math.round((100 + 12 * (ST.nivel - 1) + MEJORAS_ALTAR.vida.efecto * mejora('vida')) * (1 + perk('hp')));
  const luzMax = () => Math.round((100 + 8 * (ST.nivel - 1)) * (1 + perk('luz')));
  const dmgMult = () => (1 + .08 * (ST.nivel - 1)) * (1 + perk('dmg'));
  const perk = k => { const m = ITEMS[ST.eq.manto]; return ((m && m.perk && m.perk[k]) || 0) * (1 + MEJORAS_ALTAR.manto.efecto * mejora('manto')); };
  /* planeo: multiplicadores del gasto de luz y de la caída (planeo mejorado del nivel 4 aparte) */
  /* dones de los Guardianes del Faro (ST.dones[id], una vez por guardián): el de Marea abarata el nado rápido, el del Musgoso el planeo y el de Escarcha alarga las fogatas */
  const DONES = { marea: { coste: .97 }, musgoso: { coste: .97 }, escarcha: { fogata: 2 } };
  const don = id => !!(ST.dones && ST.dones[id]);
  const donMult = id => don(id) && DONES[id].coste || 1;
  const darDon = id => { ST.dones = ST.dones || {}; if (ST.dones[id]) return false; ST.dones[id] = 1; return true; };
  const planeoMult = () => ({ coste: 1 - MEJORAS_ALTAR.capa.efecto * mejora('capa'), caida: 1 - MEJORAS_ALTAR.capa.caida * mejora('capa') });
  /* altar de santuario cercano (para ofrecer la luz rescatada) */
  const altarCerca = () => { const J = Sis.J; for (const k in Estr.altar) { const a = Estr.altar[k]; if (Math.hypot(J.x - a.x, J.z - a.z) < ALTAR_OFRENDA) return a; } return null; };
  function mejorar(id) {
    const M = MEJORAS_ALTAR[id], n = mejora(id);
    if (!M || n >= M.costes.length) return false;
    if (!altarCerca()) { UI.aviso('Ofrece tu luz rescatada en un altar de santuario', 'error'); Sonido.sfx('error'); return false; }
    if ((ST.motas || 0) < M.costes[n]) { UI.aviso('Necesitas ' + M.costes[n] + ' motas de luz rescatada', 'error'); Sonido.sfx('error'); return false; }
    ST.motas -= M.costes[n]; ST.mejoras = ST.mejoras || {}; ST.mejoras[id] = n + 1;
    ProgresionEnemiga.registrar(ST);
    if (id === 'vida') ST.hp = Math.min(hpMax(), ST.hp + M.efecto);
    const J = Sis.J; FX.rafaga(J.x, J.y + 1.2, J.z, 30, 3, 1.2, .26, LLAMAS.color, 2); Sonido.sfx('nivel'); UI.aviso(M.nom + ' · nivel ' + (n + 1), 'conteo'); Bus.emit('mejora', { id, nivel: n + 1 }); guardar();
    return true;
  }
  const xpSig = n => Math.round(90 * Math.pow(n, 1.3)), NIVEL_MAX = 10;
  const tiene = id => ST.inv[id] || 0;
  const arma = () => ST.eq.arma ? ITEMS[ST.eq.arma] : null;

  function dar(id, n, silencio) {
    n = n || 1; ST.inv[id] = (ST.inv[id] || 0) + n; const it = ITEMS[id];
    ProgresionEnemiga.registrar(ST);
    if (!silencio) UI.item(it.nom, n, it.ic);
    if (it.tipo === 'arma' && !ST.eq.arma) equipar(id);
    for (const q of MIS) if (q.des && q.des.item === id) revelar(q.id);   // misiones que aparecen al conseguir un objeto
    revisarInventario();   // también los objetos que no vienen de una recogida (semillas de los gólems, recompensas)
  }
  /* pasos 'inv' de las misiones activas que ya se cumplen */
  function revisarInventario() { for (const id in ST.mis) { const m = ST.mis[id]; if (m.e === 'activa') { const s = Q[id].pasos[m.p]; if (s && s.k === 'inv' && tiene(s.it) >= s.n) avanzar(id); } } }
  function quitar(id, n) { ST.inv[id] = Math.max(0, (ST.inv[id] || 0) - n); if (!ST.inv[id]) delete ST.inv[id]; }
  function equipar(id) {
    const it = ITEMS[id]; if (!it || !tiene(id)) return false;
    // una sola ranura ofensiva: no se cambia de arma con enemigos cerca
    if (it.tipo === 'arma' && ST.eq.arma && ST.eq.arma !== id && Sis.J && Sis.J.combate > 0 && !Practica.activa) { UI.aviso('Cambia de arma fuera del combate', 'error'); Sonido.sfx('error'); return false; }
    if (it.tipo === 'arma') ST.eq.arma = id; else if (it.tipo === 'manto') { ST.eq.manto = id; Bus.emit('mantoCambia'); ST.hp = Math.min(ST.hp, hpMax()); ST.luz = Math.min(ST.luz, luzMax()); } else if (it.tipo === 'mascara') ST.eq.mascara = !ST.eq.mascara;
    Sonido.sfx('ui2'); Bus.emit('equipo'); return true;
  }
  function usar(id) {
    const it = ITEMS[id]; if (!it || !tiene(id)) return false;
    if (it.tipo === 'cons') { if (it.hp && ST.hp >= hpMax() && !it.luz) { UI.aviso('Ya tienes la vida al máximo'); return false; } if (it.luz && !it.hp && ST.luz >= luzMax()) { UI.aviso('Ya tienes la luz al máximo'); return false; }
      ST.hp = Math.min(hpMax(), ST.hp + (it.hp || 0)); ST.luz = Math.min(luzMax(), ST.luz + (it.luz || 0)); quitar(id, 1); Sonido.sfx('recoger'); Bus.emit('curar', it); return true; }
    equipar(id); return false;
  }
  function cocinar(i) { const r = RECETAS[i]; for (const k in r.req) if (tiene(k) < r.req[k]) { UI.aviso('Te faltan ingredientes', 'error'); Sonido.sfx('error'); return; } for (const k in r.req) quitar(k, r.req[k]); dar(r.id, 1); Sonido.sfx('recoger'); }
  /* suma motas de luz rescatada; la interfaz lo muestra por el aviso 'motas' */
  function rescatar(n) { ST.motas = (ST.motas || 0) + n; Bus.emit('motas', { n, total: ST.motas }); }
  function ganarXP(n) {
    if (ST.nivel >= NIVEL_MAX) return; ST.xp += n;
    while (ST.nivel < NIVEL_MAX && ST.xp >= xpSig(ST.nivel)) { ST.xp -= xpSig(ST.nivel); ST.nivel++; ST.hp = hpMax(); ST.luz = luzMax(); Sonido.sfx('nivel'); Bus.emit('nivel', ST.nivel); UI.nivel(ST.nivel, HABIL[ST.nivel]); }
    if (ST.nivel >= NIVEL_MAX) ST.xp = 0;
  }
  const HABIL = { 2: 'Doble salto: pulsa {saltar} otra vez en el aire', 3: 'Pulso de luz ({pulso}): onda que calma y empuja', 4: 'Planeo mejorado: gasta menos luz', 5: 'Golpe cargado: mantén {atacar} y suelta', 7: 'Esquiva perfecta: reaparece luz al esquivar a tiempo', 10: '¡Nivel máximo! Eres un verdadero Eco del Alba' };
  const dobleSalto = () => ST.nivel >= 2, pulso = () => ST.nivel >= 3, planeoPlus = () => ST.nivel >= 4, cargado = () => ST.nivel >= 5;

  /* habitantes que se perdieron (pilar 3: se deshacen en luz): ST.ausentes[id] = quien hereda sus misiones y diálogos */
  const npcDe = id => (ST.ausentes && ST.ausentes[id]) || id;
  function perder(id, heredero) { ST.ausentes[id] = heredero; if (npcs[id]) npcs[id].g.visible = false; guardar(); }

  /* ---------- misiones ---------- */
  function reqOk(q) {
    const d = q.des || {}, va = (id, n) => ST.mis[id] && (ST.mis[id].e === 'hecha' || ST.mis[id].p >= n);
    return (!d.req || d.req.every(r => ST.mis[r] && ST.mis[r].e === 'hecha')) && (d.cap === undefined || Campana.capitulo() >= d.cap)
      && (!d.con || tiene(d.con)) && (!d.paso || va(d.paso[0], d.paso[1]));
  }
  /* las que aparecen por un lugar, un objeto o al acabar otra: si no se cumplía el resto al ocurrir, se revelan después */
  function revelarPendientes() {
    for (const q of MIS) { const d = q.des; if (!d || ST.mis[q.id] || d.npc) continue;
      if (d.lugar && ST.lug[d.lugar] || d.item && tiene(d.item) || d.tras && ST.mis[d.tras] && ST.mis[d.tras].e === 'hecha') revelar(q.id); }
  }
  function revelar(id) {
    const q = Q[id]; if (!q || ST.mis[id] || !reqOk(q)) return; ST.mis[id] = { e: 'activa', p: 0, c: 0 };
    UI.aviso('Nueva misión: ' + q.nom, 'mision'); Sonido.sfx('mision'); if (!ST.seg || ST.mis[ST.seg].e !== 'activa' || q.tipo === 'p') ST.seg = id; UI.refrescarMision(); Bus.emit('mision', id);
    for (const s of [0]) pasoInicial(id);
    const s0 = q.pasos[0]; if (s0 && s0.empieza) Bus.emit('empieza:' + s0.empieza);
  }
  function pasoInicial(id) {
    const q = Q[id], m = ST.mis[id]; if (!m || m.e !== 'activa') return;
    if (reconciliarSecundaria(id)) return;
    const s = q.pasos[m.p]; if (s && s.k === 'inv' && tiene(s.it) >= s.n) avanzar(id);
    if (s && s.k === 'ev' && s.previo) { m.c = Object.keys(ST[s.previo] || {}).length; if (m.c >= (s.n || 1)) avanzar(id); }   // lo hecho antes de aceptarla cuenta
  }
  function avanzar(id) {
    const q = Q[id], m = ST.mis[id]; if (!m || m.e !== 'activa') return;
    m.p++; m.c = 0; Sonido.sfx('ui2');
    if (m.p >= q.pasos.length) completar(id);
    else {
      UI.aviso(q.pasos[m.p].txt, 'paso'); UI.refrescarMision(); pasoInicial(id);
      const s = m.e === 'activa' && q.pasos[m.p]; if (s && s.empieza) Bus.emit('empieza:' + s.empieza);
    }
  }
  function completar(id, silencio) {
    const q = Q[id], m = ST.mis[id]; if (!m || m.e === 'hecha') return;
    m.e = 'hecha'; if (ST.seg === id) ST.seg = null;
    if (!silencio) {
      ganarXP(q.rec.xp || 0); (q.rec.items || []).forEach(r => dar(r[0], r[1])); Sonido.sfx('mision'); UI.banner('Misión completada', q.nom + ' · +' + (q.rec.xp || 0) + ' XP', 'hecho', 'mision');
      if (q.cierre && !secundarias().cierres.includes(id)) secundarias().cierres.push(id);
      if (id === 'chispas' && !secundarias().chispasComentarioVisto) secundarias().chispasComentarioPendiente = true;
    }
    for (const o of MIS) if (o.des && o.des.tras === id) revelar(o.id);
    if (!ST.seg) { const n = MIS.find(o => ST.mis[o.id] && ST.mis[o.id].e === 'activa' && o.tipo === 'p') || MIS.find(o => ST.mis[o.id] && ST.mis[o.id].e === 'activa'); ST.seg = n ? n.id : null; }
    UI.refrescarMision(); guardar();
  }
  /* Los hechos anteriores a la oferta se reconcilian sin volver a conceder moneda. */
  function reconciliarSecundaria(id) {
    const m = ST.mis[id]; if (!m || m.e !== 'activa') return false;
    const s = secundarias(); let cumplido = false;
    if (id === 'chispas') {
      if (m.p >= 1) { completar(id); return true; }
      m.c = Math.max(m.c || 0, Math.min(6, Object.keys(ST.rec).filter(k => /^c[0-9]+$/.test(k) && ST.rec[k]).length));
      cumplido = m.c >= 6;
    } else if (id === 'pescador') cumplido = m.p === 0 && !!(ST.rec.ca || tiene('cana'));
    else if (id === 'amigos' && m.p === 0) {
      m.c = Math.max(m.c || 0, Math.min(3, (s.amistadesCredito || 0) + Object.keys(s.amistades).length)); cumplido = m.c >= 3;
    } else if (id === 'te') cumplido = m.p < 2 && !!s.tePreparado;
    else if (id === 'kiri') {
      const principal = ST.mis.c6_kiri;
      cumplido = m.p === 0 ? !!(ST.lug.kiri || principal && (principal.e === 'hecha' || principal.p >= 8)) : !!(s.kiriVistas.corrientes && s.kiriVistas.valle);
    }
    if (cumplido) { avanzar(id); return true; }
    return false;
  }
  /* Versión propia: p:1 de Kiri pertenecía a la entrega antigua, no a las dos vistas. */
  function migrarSecundarias() {
    const s = secundarias();
    if (s.version !== 1) {
      const a = ST.mis.amigos, k = ST.mis.kiri;
      s.amistadesCredito = a && a.e === 'activa' ? Math.min(3, a.p >= 1 ? 3 : a.c || 0) : 0;
      s.version = 1;
      if (k && k.e === 'activa' && k.p >= 1) completar('kiri');
    }
    if (ST.mis.te && ST.mis.te.e === 'hecha') { s.tePreparado = true; s.teCompartido = true; }
    if (ST.mis.pescador && ST.mis.pescador.e === 'hecha') s.canaDevuelta = true;
    for (const id of ['chispas', 'te', 'pescador', 'amigos', 'kiri']) reconciliarSecundaria(id);
  }
  function identidadAnimal(a) {
    // 07 asigna el UID al observar al individuo. No cambia a.id ni la descarga de fauna de 06.
    // PENDIENTE (fase 8, bloque 9): ajustar en 06 la confianza de 2,4 a 2,5 s. Ese archivo queda fuera del encargo.
    const s = secundarias();
    if (a.id) a.uidAmistad = 'nom:' + a.id;
    else if (!a.uidAmistad) {
      s.siguienteAnimal = (s.siguienteAnimal || 0) + 1; a.uidAmistad = 'fauna:' + s.siguienteAnimal;
    } else {
      const n = /^fauna:([0-9]+)$/.exec(a.uidAmistad); if (n) s.siguienteAnimal = Math.max(s.siguienteAnimal || 0, +n[1]);
    }
    return a.uidAmistad;
  }
  function registrarCaricia(e) {
    if (!e || !e.a) return;
    const s = secundarias(), uid = identidadAnimal(e.a); if (s.amistades[uid]) return;
    s.amistades[uid] = true; evento('acariciar'); guardar();
  }
  /* Un cierre espera al control libre. Su texto también sobrevive a guardar y cargar. */
  function mostrarCierre() {
    const s = secundarias(); if (!s.cierres.length || UI.dlg || UI.pausado || Cin.activa || UI.ocupada() || !Sis.J || !Sis.J.vivo || Sis.J.combate > 0) return;
    const id = s.cierres[0], q = Q[id];
    if (!q || !q.cierre) { s.cierres.shift(); return; }
    UI.dialogo('Hikari', q.cierre, () => { const i = s.cierres.indexOf(id); if (i >= 0) s.cierres.splice(i, 1); guardar(); });
  }
  function evento(nom, n) {
    n = n || 1;
    Piloto.aprender(nom);
    for (const id in ST.mis) {
      const m = ST.mis[id]; if (m.e !== 'activa') continue; const s = Q[id].pasos[m.p]; if (!s || s.k !== 'ev' || s.ev !== nom) continue;
      m.c += n; if (m.c >= (s.n || 1)) avanzar(id); else { UI.refrescarMision(); UI.aviso(s.txt.split(' (')[0] + ': ' + Math.floor(m.c) + '/' + s.n, 'conteo'); }
    }
    Campana.evento(nom);
  }
  function seguir(id) { if (ST.mis[id] && ST.mis[id].e === 'activa') { ST.seg = id; UI.refrescarMision(); Sonido.sfx('ui'); } }
  function listaMisiones() { return MIS.filter(q => ST.mis[q.id]).map(q => ({ q, m: ST.mis[q.id] })); }
  /* posición del objetivo de la misión seguida (guía del minimapa, brújula y Lumi) */
  function objetivo() {
    const id = ST.seg; if (!id || !ST.mis[id] || ST.mis[id].e !== 'activa') return null;
    const q = Q[id], m = ST.mis[id], s = q.pasos[m.p]; if (!s) return null; let p = null;
    if (s.k === 'escena' && s.npc) { const q = sitioPaso(s); p = { x: q.x, z: q.z }; }
    else if (s.k === 'ir' || s.k === 'escena' || s.x !== undefined) p = { x: s.x, z: s.z };   // un paso con sitio (también un evento, como el asedio)
    else if (s.k === 'hablar') { const n = npcs[npcDe(s.npc)]; if (n) p = { x: n.g.position.x, z: n.g.position.z }; }
    else if (s.k === 'inv' || s.k === 'ev') {
      if (s.pos) p = typeof s.pos === 'function' ? s.pos() : bus(s.pos);
      else if (s.ev === 'katana') p = { x: Estr.katana.x, z: Estr.katana.z };
      else if (s.ev === 'corazon' || s.ev === 'corona') p = { x: 0, z: 0 };
      else if (s.ev && s.ev.indexOf('frag:') === 0) { const i = +s.ev.slice(5); const a = [Estr.altar.petalo, Estr.altar.duna, Estr.altar.marea, Estr.altar.escarcha][i]; if (a) p = { x: a.x, z: a.z }; }
      else if (s.it === 'perla') p = bus('perla');
    }
    /* copia: p puede ser un punto del mundo (Estr.registroPetalo, PatioInicio.puntos) que no se debe tocar */
    return p ? Object.assign({}, p, { txt: s.txt, q: q.nom }) : { x: null, txt: s.txt, q: q.nom };
  }
  function bus(t) {
    if (t.indexOf('inicio:') === 0) return PatioInicio.puntos[t.slice(7)] || null;
    const J = Sis.J || { x: 0, z: 0 }; let b = null, bd = 1e9;
    if (t.indexOf('animal:') === 0) { const id = t.slice(7), a = Fauna.lista.find(x => x.id === id); if (a) return { x: a.x, z: a.z }; const n = NOMBRADOS.find(x => x.id === id); return n ? { x: n.x, z: n.z } : null; }
    if (t === 'eco') return Ecos.cercano(J);
    if (t === 'muralOculto') { for (const m of Estr.murales) if (m.visto && !ST.ocultos[m.k]) { const d = Math.hypot(m.x - J.x, m.z - J.z); if (d < bd) { bd = d; b = { x: m.x, z: m.z }; } } return b; }
    if (t === 'mural') { for (const m of Estr.murales) if (!m.visto) { const d = Math.hypot(m.x - J.x, m.z - J.z); if (d < bd) { bd = d; b = { x: m.x, z: m.z }; } } return b; }
    for (const p of picks) if (p.tipo === t && p.on) { const d = Math.hypot(p.x - J.x, p.z - J.z); if (d < bd) { bd = d; b = { x: p.x, z: p.z }; } } return b;
  }

  /* ---------- recolectables ---------- */
  const PK = { chispa: { c: 0xffe08a, s: 1.0, r: 1.9 }, flor: { c: 0xffc4e4, s: .9, r: 1.8 }, viento: { c: 0x9ffcff, s: 2.0, r: 3.0 }, perla: { c: 0xe8f6ff, s: 1.0, r: 2.0 }, orbe: { c: 0xffb347, s: 2.4, r: 3.0 }, luciernaga: { c: 0xcfff8a, s: 1.1, r: 2.2 }, cana: { c: 0xd9a86a, s: 1.2, r: 2.4 } };
  function colocar(tipo, id, x, y, z) {
    if (ST.rec[id]) return null; const d = PK[tipo];
    const s = new Halo(d.c); s.scale.set(d.s * 1.6, d.s * 1.6, 1); s.position.set(x, y, z); pg.add(s);
    const nuc = new Halo(0xffffff); nuc.scale.set(d.s * .55, d.s * .55, 1); nuc.position.set(x, y, z); pg.add(nuc);
    const p = { tipo, id, x, y, z, s, nuc, on: true, r: d.r, f: Math.random() * 6, base: d.s }; picks.push(p); return p;
  }
  function quitarPick(p) { p.on = false; pg.remove(p.s); pg.remove(p.nuc); for (const o of p.pistas || []) pg.remove(o); }
  /* Anclas de fase 8. Se calculan después del sorteo completo, sin consumir su azar. */
  function puntoRuta(ruta, distancia) {
    for (let i = 1; i < ruta.length; i++) {
      const a = ruta[i - 1], b = ruta[i], dx = b[0] - a[0], dz = b[1] - a[1], d = Math.hypot(dx, dz);
      if (!d) continue;
      if (distancia <= d || i === ruta.length - 1) { const u = clamp(distancia / d, 0, 1); return { x: lerp(a[0], b[0], u), z: lerp(a[1], b[1], u), nx: -dz / d, nz: dx / d }; }
      distancia -= d;
    }
    return { x: ruta[0][0], z: ruta[0][1], nx: 0, nz: 1 };
  }
  const apoyoRecogida = (x, z) => Math.max(altura(x, z), Sol.suelo(x, z, altura(x, z) + 1.5));
  function transitableRecogida(x, z) {
    const y = apoyoRecogida(x, z), p = { x, z };
    return y > .8 && pendiente(x, z) < .35 && !Sol.empujar(p, .7, y);
  }
  function pasoRecogida(a, b) {
    const n = Math.max(1, Math.ceil(Math.hypot(a.x - b.x, a.z - b.z))); let y = apoyoRecogida(a.x, a.z);
    for (let i = 1; i <= n; i++) {
      const x = lerp(a.x, b.x, i / n), z = lerp(a.z, b.z, i / n), h = apoyoRecogida(x, z), p = { x, z };
      if (h <= .8 || Math.abs(h - y) > .65 || Sol.empujar(p, .7, h)) return false;
      y = h;
    }
    return true;
  }
  function anclasChispas() {
    // PENDIENTE (fase 8, bloque 2): recorrido y capturas con toda la obra del original. Aquí se comprueban terreno y sólidos disponibles.
    const anclas = [], ruta = CAMINOS[2];
    const libre = p => transitableRecogida(p.x, p.z) && anclas.every(a => Math.hypot(a.x - p.x, a.z - p.z) >= 4 - 1e-6);
    function sobreRuta(camino, d, lado) {
      for (let ajuste = 0; ajuste <= 20; ajuste++) for (const signo of ajuste ? [1, -1] : [1]) {
        const p = puntoRuta(camino, d + signo * ajuste);
        for (const desvio of lado ? [6, 5, 4, 3, 0] : [0]) {
          const q = { x: p.x + p.nx * desvio * lado, z: p.z + p.nz * desvio * lado };
          if (libre(q) && pasoRecogida(p, q)) { anclas.push(q); return; }
        }
      }
      throw new Error('No hay apoyo transitable para c' + anclas.length);
    }
    for (const [d, lado] of [[55, 0], [63, 0], [100, 1], [108, 1], [155, -1], [163, -1]]) sobreRuta(ruta, d, lado);
    const a = Estr.altar.petalo, s = sitio('petalo'), l = Math.hypot(a.x - s.x, a.z - s.z), dx = (a.x - s.x) / l, dz = (a.z - s.z) / l;
    const acceso = [[a.x + dx * 30, a.z + dz * 30], [a.x, a.z]];
    sobreRuta(acceso, 19, 0); sobreRuta(acceso, 23, 0);
    /* Busca una ruta continua por el borde seco. No interpola a través de la laguna. */
    const inicio = sitio('muelle'), destino = { x: -189, z: 178 }, paso = 1;
    const clave = (x, z) => x + ',' + z, nodos = new Map(), abiertos = [];
    const primero = { x: inicio.x, z: inicio.z, coste: 0, padre: null, prioridad: 0 }; nodos.set(clave(0, 0), primero); abiertos.push(primero);
    let fin = null;
    while (abiertos.length && nodos.size < 12000) {
      abiertos.sort((a, b) => b.prioridad - a.prioridad); const p = abiertos.pop();
      if (Math.hypot(p.x - destino.x, p.z - destino.z) <= 2) { fin = p; break; }
      for (const [ix, iz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const x = p.x + ix * paso, z = p.z + iz * paso, k = clave(x - inicio.x, z - inicio.z), coste = p.coste + Math.hypot(ix, iz) * paso;
        if (Math.hypot(x - inicio.x, z - inicio.z) > 85 || nodos.has(k) || !transitableRecogida(x, z) || !pasoRecogida(p, { x, z })) continue;
        const n = { x, z, coste, padre: p, prioridad: coste + Math.hypot(x - destino.x, z - destino.z) }; nodos.set(k, n); abiertos.push(n);
      }
    }
    if (!fin) throw new Error('No hay recorrido seco desde el muelle a Marea');
    const orilla = []; for (let p = fin; p; p = p.padre) orilla.push([p.x, p.z]); orilla.reverse();
    for (const d of [18, 28, 38]) sobreRuta(orilla, d, 0);
    return anclas;
  }
  function anclasFlores() {
    const s = sitio('aldea'), puntos = [];
    for (const [base, cantidad] of [[.4, 3], [1.2, 2]]) {
      let parche = null;
      for (let intento = 0; intento < 42 && !parche; intento++) for (const d of [42, 44, 46, 48, 49]) {
        const angulo = base + intento * .15;
        const grupo = Array.from({ length: cantidad }, (_, i) => {
          const lateral = (i - (cantidad - 1) / 2) * 4.2;
          return { x: s.x + Math.cos(angulo) * d - Math.sin(angulo) * lateral, z: s.z + Math.sin(angulo) * d + Math.cos(angulo) * lateral };
        });
        if (grupo.every(p => transitableRecogida(p.x, p.z) && puntos.every(q => Math.hypot(p.x - q.x, p.z - q.z) >= 8))) { parche = grupo; break; }
      }
      if (!parche) throw new Error('No hay apoyo para el parche de flores de Hinode');
      puntos.push(...parche);
    }
    return puntos;
  }
  function sembrarPicks() {
    const r = rng(4242), posiciones = []; let n = 0, ints = 0;
    while (n < 80 && ints++ < 3000) { const x = (r() - .5) * 860, z = (r() - .5) * 860; if (Math.hypot(x, z) > 420) continue; const h = altura(x, z); if (h < 1 || pendiente(x, z) > .8 || CUEVAS.some(c => Math.hypot(x - c.mx, z - c.mz) < c.mr)) continue; if (SITIOS.some(s => Math.hypot(x - s.x, z - s.z) < s.r1)) continue; posiciones.push({ x, z, y: h + 1.1 }); n++; }
    anclasChispas().forEach((p, i) => { posiciones[i] = { ...p, y: apoyoRecogida(p.x, p.z) + 1.1 }; });
    posiciones.forEach((p, i) => colocar('chispa', 'c' + i, p.x, p.y, p.z));
    const flores = anclasFlores(), S = sitio('aldea');
    for (let i = 0; i < 8; i++) {
      const a = i * .8 + .4, d = 34 + (i % 3) * 8, p = flores[i] || { x: S.x + Math.cos(a) * d, z: S.z + Math.sin(a) * d };
      const h = apoyoRecogida(p.x, p.z); if (h > 1) colocar('flor', 'f' + i, p.x, h + .6, p.z);
    }
    Estr.perlas.forEach((p, i) => colocar('perla', 'p' + i, p.x, altura(p.x, p.z) + .8, p.z));
    const c1 = CUEVAS[1], P = c1.pts; colocar('luciernaga', 'l0', P[3].x, P[3].y + 2, P[3].z); colocar('luciernaga', 'l1', P[10].x, P[10].y + 2.2, P[10].z); colocar('luciernaga', 'l2', P[16].x, P[16].y + 2, P[16].z);
    colocar('luciernaga', 'l3', c1.cx + 4, c1.cy + 2, c1.cz + 3); colocar('luciernaga', 'l4', c1.cx - 5, c1.cy + 3, c1.cz - 2);
    const cx = -196, cz = 188; colocar('cana', 'ca', cx, Math.max(altura(cx, cz), 0) + .9, cz);
    const vz = [[-70, -135, 1.3], [140, 30, 1.1], [214, 150, 1.6], [-190, -160, 1.2], [40, -300, 1.5]]; vz.forEach((v, i) => colocar('viento', 'v' + i, v[0], altura(v[0], v[1]) + 12 * v[2] + 1.5, v[1]));
    Estr.piramides.forEach((p, i) => colocar('viento', 'v' + (5 + i), p.x, p.top + 2.2, p.z)); colocar('viento', 'v8', 220, altura(220, -316) + 3, -316);
    colocar('viento', 'v9', 330, altura(330, 180) + 14, 180);
  }
  function actualizarPicks(dt, J, t) {
    for (const p of picks) {
      if (!p.on) continue; const dx = p.x - J.x, dz = p.z - J.z, d2 = dx * dx + dz * dz;
      if (d2 > 160 * 160) { p.s.visible = p.nuc.visible = false; continue; } p.s.visible = p.nuc.visible = true;
      const k = 1 + .18 * Math.sin(t * 3 + p.f); p.s.scale.setScalar(p.base * 1.6 * k); p.s.position.y = p.nuc.position.y = p.y + Math.sin(t * 1.6 + p.f) * .18;
      if (d2 < p.r * p.r && Math.abs(p.y - (J.y + .9)) < p.r + 1.2) recoger(p);
    }
  }
  function recoger(p) {
    if (!p.on || ST.rec[p.id]) return;
    quitarPick(p); if (p.tipo !== 'orbe') ST.rec[p.id] = 1; FX.rafaga(p.x, p.y, p.z, 14, 2.2, .7, .18, PK[p.tipo].c); J_.recoger = 1;
    switch (p.tipo) {
      case 'chispa': ST.luz = Math.min(luzMax(), ST.luz + 15); ganarXP(3); rescatar(LUZ_RESCATADA.chispa); Sonido.sfx('chispa'); evento('chispa'); break;
      case 'flor': dar('flor', 1); Sonido.sfx('recoger'); break;
      case 'viento': ganarXP(14); ST.luz = luzMax(); Sonido.sfx('recoger'); UI.aviso('Espíritu del viento liberado', 'conteo'); evento('viento'); break;
      case 'perla': dar('perla', 1); Sonido.sfx('recoger'); break;
      case 'luciernaga': ganarXP(4); Sonido.sfx('chispa'); evento('luciernaga'); break;
      case 'cana': dar('cana', 1); Sonido.sfx('recoger'); evento('cana'); break;
      case 'orbe': Sonido.sfx('fragmento'); RETO.duna.n++; if (RETO.duna.n >= 6) { timer = null; RETO.duna.act = false; retoResuelto('duna'); } else UI.aviso('Orbes ' + RETO.duna.n + '/6', 'conteo'); break;
    }
    revisarInventario(); guardar();
  }
  let J_ = {};

  /* ---------- cofres ---------- */
  const LOOT = [[['esencia', 1], ['te', 2]], [['onigiri', 3], ['esencia', 1]], [['te', 3]], [['esencia', 2]], [['onigiri', 2], ['te', 1]]];
  function sembrarCofres() {
    const c0 = CUEVAS[0], c1 = CUEVAS[1], pts = [[c0.cx + c0.cofre[0], c0.cz + c0.cofre[1], c0.cy], [c1.cx + c1.cofre[0], c1.cz + c1.cofre[1], c1.cy], [Estr.piramides[1].x, Estr.piramides[1].z, Estr.piramides[1].top], [-118, 40, null], [-232, 224, null], [237, -277, null], [-205, -300, null], [190, 150, null]];
    pts.forEach((p, i) => {
      const y = p[2] === null ? altura(p[0], p[1]) : p[2]; const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.BoxGeometry(.9, .5, .6), new THREE.MeshStandardMaterial({ color: 0x7a2e2a, roughness: .7 }))); const tapa = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .9, 8, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x8e3a2f, roughness: .7 })); tapa.rotation.z = Math.PI / 2; tapa.rotation.y = Math.PI / 2; tapa.position.y = .25; g.add(tapa);
      const orno = new THREE.Mesh(new THREE.BoxGeometry(.95, .08, .1), new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: .6, roughness: .3 })); orno.position.y = .26; g.add(orno);
      const h = new Halo(0xffd27a, .6); h.scale.set(3, 3, 1); h.position.y = .6; g.add(h);
      g.position.set(p[0], y + .25, p[1]); g.rotation.y = i * 1.3; pg.add(g); const c = { i, x: p[0], z: p[1], y: y + .5, g, h, abierto: !!ST.cofres[i] }; if (c.abierto) { tapa.rotation.x = -1.2; h.visible = false; } c.tapa = tapa; cofres.push(c);
    });
  }
  function pistasCana() {
    const objeto = { x: -196, z: 188 }, muelle = sitio('muelle'), candidatos = [];
    for (const r of [6, 7, 8]) for (let i = 0; i < 24; i++) {
      const a = i * Math.PI / 12, p = { x: objeto.x + Math.cos(a) * r, z: objeto.z + Math.sin(a) * r };
      if (transitableRecogida(p.x, p.z)) candidatos.push(p);
    }
    candidatos.sort((a, b) => Math.hypot(a.x - muelle.x, a.z - muelle.z) - Math.hypot(b.x - muelle.x, b.z - muelle.z));
    const p = candidatos[0];
    if (p) {
      const tabla = new THREE.Mesh(new THREE.BoxGeometry(.8, .08, .15), cofres[0].g.children[0].material);
      tabla.position.set(p.x, apoyoRecogida(p.x, p.z) + .04, p.z); tabla.rotation.y = Math.atan2(objeto.x - p.x, objeto.z - p.z); pg.add(tabla);
    }
    const cana = picks.find(p => p.id === 'ca' && p.on); if (!cana) return;
    const y = Math.max(altura(objeto.x, objeto.z), NIVEL_AGUA) + .9;
    const corcho = new THREE.Mesh(new THREE.SphereGeometry(.08, 8, 6), cofres[0].tapa.material);
    corcho.position.set(objeto.x, y, objeto.z); pg.add(corcho);
    const linea = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .4, 4), cofres[0].g.children[0].material);
    linea.position.set(objeto.x, y - .2, objeto.z); pg.add(linea);
    cana.pistas = [corcho, linea];
    // PENDIENTE (fase 8, bloque 6): validar las dos pistas y las dos rutas a la caña con los sólidos del original.
  }
  function abrirCofre(c) { c.abierto = true; ST.cofres[c.i] = 1; c.h.visible = false; c.tapa.rotation.x = -1.2; Sonido.sfx('cofre'); FX.rafaga(c.x, c.y + .5, c.z, 24, 3, 1, .2, 0xffd27a, 1.5); const l = LOOT[c.i % LOOT.length]; l.forEach(r => dar(r[0], r[1])); ganarXP(25); UI.aviso('¡Cofre abierto! +25 XP', 'conteo'); guardar(); }

  /* ---------- NPC y diálogos ---------- */
  function crearNPCs() {
    const D = FICHAS_NPC;
    for (const id in D) {
      const p = Estr.npcs[id], n = Gente.crear(Object.assign({ id }, D[id])), r = D[id].rutina;
      n.g.position.set(p.x, p.y !== undefined ? p.y : altura(p.x, p.z), p.z);
      n.g.rotation.y = r.mira === 'faro' ? Math.atan2(-p.x, -p.z) : r.mira !== undefined ? r.mira : rnd(0, TAU); scene.add(n.g); npcs[id] = n;
    }
  }
  /* encargos de un habitante: un paso 'hablar' que ya se puede entregar o una secundaria que ofrece (68-secundarias.js).
     Si se perdió, su heredero los atiende (npcDe); no hay encargos durante una escena ni con quien no está a la vista
     (ocupado no cuenta: la historia coloca así a Momo, a Tsuru y a los que esperan en Yoake o en el muelle) */
  const disponible = id => {
    const c = ST.inicio.cap || {};
    return npcs[id] && npcs[id].g.visible && !ST.ausentes[id] && !Cin.activa
      && !(id === 'momo' && c.momoCapturada && !c.momoRescatada) && !(typeof Asedio !== 'undefined' && Asedio.activo);
  };
  function entregas(id) {
    const r = [];
    for (const qid in ST.mis) { const m = ST.mis[qid], s = m.e === 'activa' && Q[qid].pasos[m.p]; if (s && s.k === 'hablar' && npcDe(s.npc) === id && (!s.quita || tiene(s.quita[0]) >= s.quita[1])) r.push([qid, s]); }
    return r;
  }
  const ofertas = id => MIS.filter(q => !ST.mis[q.id] && q.des && q.des.npc && npcDe(q.des.npc) === id && reqOk(q));
  const comentarioYuki = id => id === 'yuki' && secundarias().chispasComentarioPendiente;
  const principalNPC = id => typeof Capitulos !== 'undefined' && Capitulos.conversacionPendiente(id);
  const encargo = id => disponible(id) && !principalNPC(id) && (comentarioYuki(id) || entregas(id).length > 0 || ofertas(id).length > 0);
  /* con un encargo, el habitante habla de él (una oferta cada vez); si no, de la historia (51-piloto.js) */
  function hablar(id) {
    if (UI.dlg || UI.pausado || !disponible(id)) return;
    const principal = principalNPC(id); if (principal) { Piloto.conversar(principal); return; }
    if (!encargo(id)) { Piloto.conversar(id === 'yuki' ? 'habitante' : id); return; }
    const n = npcs[id], comentario = comentarioYuki(id) ? ['Encontraste luz donde parecía que el camino terminaba.'] : [], entrega = entregas(id)[0]; ST.vistos++;
    const comentarioLeido = () => { if (comentario.length) { secundarias().chispasComentarioPendiente = false; secundarias().chispasComentarioVisto = true; } };
    if (entrega) {
      const [qid, s] = entrega, m = ST.mis[qid], paso = m.p;
      const lineas = comentario.concat(s.npc !== id && s.dlgHeredero ? s.dlgHeredero : s.dlg);
      UI.dialogo(n.nombre, lineas, () => {
        comentarioLeido();
        if (ST.mis[qid] !== m || m.e !== 'activa' || m.p !== paso || s.quita && tiene(s.quita[0]) < s.quita[1]) return;
        if (s.quita) quitar(s.quita[0], s.quita[1]);
        if (qid === 'te') secundarias().tePreparado = true;
        if (qid === 'pescador') secundarias().canaDevuelta = true;
        // PENDIENTE (fase 8, bloque 6): gesto de tres segundos con la caña. La rutina de pesca ya existe.
        avanzar(qid); guardar();
      }, GUION.voces[id]);
    } else {
      const q = ofertas(id)[0], lineas = comentario.concat(q ? q.des.npc !== id && q.introHeredero ? q.introHeredero : q.intro : []);
      UI.dialogo(n.nombre, lineas, () => { comentarioLeido(); if (q) revelar(q.id); guardar(); }, GUION.voces[id]);
    }
  }
  function actualizarNPCs(dt, J) {
    for (const id in npcs) { if (ST.ausentes[id]) { npcs[id].g.visible = false; continue; } npcs[id].actualizar(dt, J.x, J.z); } tNpc -= dt;
    if (tNpc <= 0) { tNpc = .6; for (const id in npcs) npcs[id].sig.userData.v = encargo(id); revelarPendientes(); }   // la marca sobre la cabeza: tiene un encargo
  }

  /* Montaje mínimo completo: el motor congela sus seis segundos durante la pausa. */
  function registrarTeCompartido() {
    if (Cin.teCompartido) return;
    Cin.teCompartido = cb => {
      const id = npcDe('tsuru'), n = npcs[id]; if (!disponible(id)) return;
      const p = n.g.position, j = Sis.J, cx = (p.x + j.x) / 2, cz = (p.z + j.z) / 2, y = Math.max(p.y, j.y);
      const ocupado = n.ocupado, posicion = p.clone(); n.ocupado = true;
      // PENDIENTE (fase 8, bloque 7): banco, bandeja, tazas y gesto de servir. Requieren revisión visual en Hinode y Yoake.
      Cin.util.arrancar([{ dur: 6, f(u, t, dt) {
        n.actualizar(dt, j.x, j.z); n.g.position.copy(posicion);
        Cin.util.cam(cx + 3.4, y + 2.4, cz + 3.4, cx, y + .9, cz);
      } }], () => {
        n.ocupado = ocupado; n.g.position.copy(posicion); secundarias().teCompartido = true;
        if (cb) cb(); guardar();
      }, 'teCompartido');
    };
  }

  let vistaKiri = null;
  function puntosKiri() {
    const c = Estr.cima; if (!c) return [];
    const d = Math.hypot(c.x, c.z), lx = c.z / d, lz = -c.x / d;
    return [{ x: c.x + .7 * lx, y: c.y, z: c.z + .7 * lz, lado: 'corrientes' },
      { x: c.x - .7 * lx, y: c.y, z: c.z - .7 * lz, lado: 'valle' }];
  }
  function observarKiri(p) {
    if (vistaKiri || UI.dlg || Cin.activa) return;
    const c = Estr.cima, destino = p.lado === 'corrientes' ? CORR[2] : { x: 0, z: 0 };
    const yaw = Math.atan2(destino.x - c.x, destino.z - c.z);
    const foco = { x: c.x, y: c.y + 1, z: c.z, dist: 4, pitch: .35, yaw };
    vistaKiri = { p, t: 0, foco }; Bus.emit('focoCamara', foco);
    // PENDIENTE (fase 8, bloque 7): validar encuadres y entrada/salida de 0,4 s con la cámara de Claude.
  }
  function actualizarVistaKiri(dt, J) {
    if (!vistaKiri || UI.pausado) return;
    const v = vistaKiri, focoAjeno = typeof G !== 'undefined' && G.foco !== v.foco;
    const mueveCamara = typeof G !== 'undefined' && G.tCamMan === 0 || focoAjeno
      || KEY.ArrowLeft || KEY.ArrowRight || KEY.ArrowUp || KEY.ArrowDown;
    const interrumpida = mueveCamara || UI.dlg || Cin.activa || !J.vivo || !J.suelo || J.combate > 0 || Math.abs(J.y - v.p.y) > .6 || Math.hypot(J.x - v.p.x, J.z - v.p.z) > .65;
    v.t += dt;
    if (!interrumpida && v.t < 2) return;
    vistaKiri = null; if (!focoAjeno) Bus.emit('focoCamara', null);
    if (v.t >= 1.4 && !focoAjeno && !UI.dlg && !Cin.activa && J.vivo && J.suelo) {
      secundarias().kiriVistas[v.p.lado] = true;
      const s = secundarias();
      if (s.kiriVistas.corrientes && s.kiriVistas.valle && !s.kiriPanorama) { s.kiriPanorama = true; evento('kiri:panorama'); }
      guardar();
    }
  }

  function recordarCompras() {
    if (!Sis.J || !Sis.J.vivo || UI.dlg || UI.pausado || Cin.activa || UI.ocupada() || Sis.J.combate > 0 || !altarCerca()) return;
    const s = secundarias(), compradas = Object.values(ST.mejoras || {}).some(n => n > 0);
    if (!s.primeraCompraAvisada && !compradas && ST.motas >= 40) {
      s.primeraCompraAvisada = true; UI.aviso('Puedes mejorar en este altar. El primer nivel cuesta 40 motas.', 'mision'); guardar();
    } else if (!s.segundaCompraAvisada && ST.frag[2] && ST.motas >= 90 && ['capa', 'vida'].some(id => mejora(id) === 1)) {
      s.segundaCompraAvisada = true; UI.aviso('Puedes mejorar otra vez. El segundo nivel cuesta 90 motas.', 'mision'); guardar();
    }
  }


  /* ---------- lugares ---------- */
  function actualizarLugares(J) {
    for (const l of LUGARES) if (!ST.lug[l.id] && Math.hypot(J.x - l.x, J.z - l.z) < l.r && (l.id !== 'kiri' || J.y > 95)) {
      ST.lug[l.id] = 1; ganarXP(l.xp); UI.banner(l.nom, 'Lugar descubierto · +' + l.xp + ' XP', l.ic, 'lugar'); Sonido.sfx('mision'); Bus.emit('lugar', l.id);
      for (const q of MIS) if (q.des && q.des.lugar === l.id) revelar(q.id); guardar();
    }
  }
  function viajar(id) { const l = LUGARES.find(q => q.id === id); if (!l || !ST.lug[id] || !l.viaje) return null; const o = id === 'marea' ? { x: -236, z: 232 } : id === 'muelle' ? { x: -146, z: 146 } : id === 'faro' ? { x: 0, z: 14 } : { x: l.x + 5, z: l.z + 8 }; return o; }

  /* ---------- retos de los santuarios ---------- */
  /* fragmentos en su pedestal: los recuperados menos el que robó Tasogare (cuenta para el color y la luz del mundo, no
     para los retos: ese santuario no se repite) */
  const enSitio = () => ST.frag.map((v, i) => v && i !== ST.robado);
  const eMundo = () => .12 + .22 * enSitio().filter(Boolean).length;
  /* Tasogare roba un fragmento (Noche Roja): por defecto, el último recuperado */
  function robar(i) {
    if (i === undefined || i === null) { i = ST.ultimoFrag; if (i === null || !ST.frag[i]) i = ST.frag.lastIndexOf(true); }
    if (i < 0 || ST.robado !== null) return ST.robado; ST.robado = i; Estr.encenderFragmento(i, false); Estr.vaciarPedestal(i, true); Bus.emit('fragmentos', enSitio()); guardar(); return i;
  }
  /* un reto resuelto deja el fragmento en su altar: se integra al tocarlo (60-capitulos.js) */
  function retoResuelto(id) { ST.retos[id] = true; evento('reto:' + id); guardar(); }
  function encenderFarol(f) {
    if (f.on || ST.frag[0] || ST.retos.petalo) return; const r = RETO.petalo;
    if (f.i === r.prog) { f.on = true; f.mesh.material.color.setHex(0xffd08a); r.prog++; Sonido.sfx('farol', { k: f.i }); FX.rafaga(f.x, f.y + 1, f.z, 16, 2, 1, .2, 0xffc080, 1); if (r.prog >= 3) setTimeout(() => retoResuelto('petalo'), 900); }
    else { for (const q of Estr.faroles) { q.on = false; q.mesh.material.color.setHex(0x4a4458); } r.prog = 0; Sonido.sfx('error'); UI.aviso('Orden equivocado: empieza por el 1', 'error'); Bus.emit('retoFallo', 'petalo'); }
  }
  /* canon 2.0: el fragmento no va al pedestal del faro, se queda en Hikari; su región recupera la luz */
  function integrarFragmento(i) {
    if (ST.frag[i]) return; ST.frag[i] = true; ST.ultimoFrag = i; Bus.emit('fragmentos', enSitio()); ganarXP(150);
    const a = [Estr.altar.petalo, Estr.altar.duna, Estr.altar.marea, Estr.altar.escarcha][i]; if (a) FX.rafaga(a.x, a.y, a.z, 70, 7, 2, .4, Estr.COL_FRAG[i], 3);
    Sonido.sfx('fragmento'); UI.banner('Fragmento integrado', FRAGN[i] + ' · la región recupera su luz', 'luz', 'fragmento');
    evento('frag:' + i); guardar();
  }
  function iniciarDuna() {
    const R = RETO.duna; if (R.act || ST.frag[1]) return; R.act = true; R.n = 0; R.t = 100; Sonido.sfx('pulso'); UI.aviso('¡Reúne los 6 orbes antes de que acabe el tiempo!', 'mision');
    const S = sitio('duna'), pos = [[S.x + 2.4, S.z + 1.8, S.h + 6 + 2], ...Estr.piramides.map(p => [p.x, p.z, p.top + 2.2]), [266, 262, null], [222, 214, null]];
    R.orbes = pos.map((p, i) => colocar('orbe', 'o' + i + Date.now(), p[0], p[2] === null ? altura(p[0], p[1]) + 1.6 : p[2], p[1]));
  }
  function finDuna() { const R = RETO.duna; R.act = false; timer = null; (R.orbes || []).forEach(o => o && o.on && quitarPick(o)); UI.aviso('Se acabó el tiempo. Vuelve al altar para reintentar', 'error'); Sonido.sfx('error'); Bus.emit('retoFallo', 'duna'); }
  function iniciarEscarcha() {
    const R = RETO.escarcha; if (R.fase !== 'espera' || ST.frag[3]) return;
    if (!R.seq.length) { R.seq = [rndi(0, 3)]; while (R.seq.length < 4) { const k = rndi(0, 3); if (k !== R.seq[R.seq.length - 1]) R.seq.push(k); } }   // al fallar se repite la misma melodía
    mostrarEscarcha();
  }
  /* suena la secuencia (también al volver a oírla): la cámara sube sobre el altar para ver los cuatro cristales */
  function mostrarEscarcha() {
    const R = RETO.escarcha, a = Estr.altar.escarcha, F = RETO_CRISTALES.foco;
    R.fase = 'mostrar'; R.i = 0; R.t = 1.2; R.k = 0; Sonido.sfx('pulso'); UI.aviso('Mira y escucha la secuencia…', 'mision');
    // casi desde arriba y alineada con el anillo (los cristales están en las diagonales): caben los cuatro en pantalla
    const yaw = Math.round(Sis.J.camYaw / (Math.PI / 2)) * (Math.PI / 2);
    Bus.emit('focoCamara', { x: a.x, y: CUEVAS[0].cy + F.alto, z: a.z, dist: F.dist, pitch: F.pitch, yaw });
  }
  function tocarCristal(c) {
    const R = RETO.escarcha; if (R.fase !== 'entrada') { if (R.fase === 'espera') UI.aviso('Activa primero el altar del centro ({interactuar})'); return; }
    c.luz = 1; Sonido.sfx('cristal', { k: c.i });
    if (c.i === R.seq[R.i]) { R.i++; if (R.i >= 4) { R.fase = 'hecho'; setTimeout(() => retoResuelto('escarcha'), 900); } } else { R.fase = 'espera'; Sonido.sfx('error'); UI.aviso('Secuencia equivocada. Activa el altar para volver a oírla', 'error'); }
  }
  let marcaEscarcha = false;   // el marcador del HUD es del reto (lo quita solo él)
  function actualizarRetos(dt, J) {
    const R = RETO.escarcha;
    if (R.fase === 'mostrar') { R.t -= dt; if (R.t <= 0) { if (R.i < 4) { const c = Estr.cristalesMem[R.seq[R.i]]; c.luz = 1; Sonido.sfx('cristal', { k: c.i }); R.i++; R.t = .85; } else { R.fase = 'entrada'; R.i = 0; Bus.emit('focoCamara', null); UI.aviso('Ahora repite: toca los cristales ({interactuar})', 'mision'); } } }
    // en reposo, cada cristal del reto deja ver su color y un halo tenue; al sonar, brilla entero
    for (const c of Estr.cristalesMem) { c.luz = Math.max(0, (c.luz || 0) - dt * .8); c.halo.opacidad = Math.max(RETO_CRISTALES.haloReposo, c.luz * .9); c.mesh.material.color.setHex(c.luz > .1 ? c.hex : c.reposo); }
    // progreso al repetir la secuencia, mientras Hikari está en la cámara
    const ae = Estr.altar.escarcha, cerca = ae && J && Math.hypot(J.x - ae.x, J.z - ae.z) < CUEVAS[0].Rc + 2;
    if (R.fase === 'entrada' && cerca) { timer = { txt: 'Cristales ' + R.i + ' / 4', frac: R.i / 4 }; marcaEscarcha = true; } else if (marcaEscarcha) { timer = null; marcaEscarcha = false; }
    if (RETO.duna.act) { RETO.duna.t -= dt; timer = { txt: 'Orbes ' + RETO.duna.n + '/6', t: RETO.duna.t, max: 100 }; if (RETO.duna.t <= 0) finDuna(); }
    for (const f of Estr.faroles) { if ((ST.frag[0] || ST.retos.petalo) && !f.on) { f.on = true; f.mesh.material.color.setHex(0xffd08a); } f.halo.opacidad = damp(f.halo.opacidad, f.on ? .85 : 0, 4, dt); }
  }

  /* ---------- interacción ---------- */
  function interactuable(J) {
    // conversaciones y puntos del relato primero (51-piloto.js, 60-capitulos.js); el mundo, cuando el capítulo lo abre
    { const p = Piloto.interactuable(J); if (p || !Campana.usa('mundo')) return p; }
    let best = null, bd = 1e9; const cand = (x, z, r, txt, fn, y) => { const d = Math.hypot(J.x - x, J.z - z); if (d < r && (y === undefined || Math.abs(J.y - y) < 4.5) && d < bd) { bd = d; best = { txt, fn, x, z }; } };
    const k = Estr.katana; if (k && !k.tomada) cand(k.x, k.z, 3.2, 'Tomar la Katana del Alba', () => { k.tomada = true; k.mesh.visible = false; k.halo.visible = false; Bus.emit('katanaTomada', { x: k.x, z: k.z }); dar('katana', 1); ST.eq.arma = 'katana'; Sonido.sfx('fragmento'); FX.rafaga(k.x, k.y, k.z, 40, 5, 1.5, .3, 0x9ffff0, 2); UI.banner('Katana del Alba', 'Pulsa {atacar} para atacar · los animales solo se defienden si los golpeas', 'espada', 'mision'); evento('katana'); });
    for (const m of Estr.murales) if (!m.visto) cand(m.x, m.z, 4, 'Leer el mural', () => { m.visto = true; ST.murales[m.k] = 1; ganarXP(15); Sonido.sfx('mision'); ST.diario.push(m.k); UI.diarioNuevo(m.titulo, m.texto); evento('mural'); guardar(); });
    if (tiene('farol')) for (const m of Estr.murales) if (m.visto && !ST.ocultos[m.k]) cand(m.x, m.z, 4, 'Alzar el farol ante el mural', () => leerOculto(m));
    // mientras un oni de sombra guarda el santuario, su reto no responde (35-sombras.js)
    const bloq = MIS.find(q => q.bloquea && ST.mis[q.id] && ST.mis[q.id].e === 'activa');
    const guardado = (id, x, z) => { if (bloq) { cand(x, z, 5, bloq.bloquea, () => { UI.aviso(bloq.bloquea, 'error'); Sonido.sfx('error'); }); return true; } if (!Sombras.custodia(id)) return false; cand(x, z, 5, 'Un oni de sombra guarda este santuario', () => { UI.aviso('Vence primero al oni de sombra que lo guarda', 'error'); Sonido.sfx('error'); }); return true; };
    for (const f of Estr.faroles) if (!f.on && !ST.frag[0] && !guardado('petalo', f.x, f.z)) cand(f.x, f.z, 3.4, 'Encender farol ' + (f.i + 1), () => encenderFarol(f));
    const am = Estr.altar.marea; if (am && !ST.frag[2] && !ST.retos.marea && tiene('perla') >= 5 && !guardado('marea', am.x, am.z)) cand(am.x, am.z, 5, 'Colocar las perlas en el altar', () => { quitar('perla', 5); retoResuelto('marea'); });
    else if (am && !ST.frag[2] && !ST.retos.marea) cand(am.x, am.z, 5, 'Altar de la Marea (faltan perlas)', () => UI.aviso('Necesitas 5 perlas de luz. Bucea en la laguna ({agacharse} bajo el agua)'));
    const ad = Estr.altar.duna; if (ad && !ST.frag[1] && !ST.retos.duna && !RETO.duna.act && !guardado('duna', ad.x, ad.z)) cand(ad.x, ad.z, 5, 'Despertar el altar de la Duna', iniciarDuna);
    const ae = Estr.altar.escarcha; if (ae && !ST.frag[3] && RETO.escarcha.fase === 'espera' && !guardado('escarcha', ae.x, ae.z)) cand(ae.x, ae.z, 5, 'Activar el altar de los cristales', iniciarEscarcha, ae.y - 2);
    // mientras dura el reto, el altar no ofrece mejoras: al repetir, deja volver a oír la secuencia
    const enReto = RETO.escarcha.fase === 'mostrar' || RETO.escarcha.fase === 'entrada';
    if (RETO.escarcha.fase === 'entrada') {
      for (const c of Estr.cristalesMem) cand(c.x, c.z, RETO_CRISTALES.toque, 'Tocar el cristal', () => tocarCristal(c));
      if (ae) cand(ae.x, ae.z, RETO_CRISTALES.verOtraVez, 'Volver a oír la secuencia', mostrarEscarcha, ae.y - 2);
    }
    for (const c of cofres) if (!c.abierto) cand(c.x, c.z, 3, 'Abrir cofre', () => abrirCofre(c), c.y);
    const kSec = ST.mis.kiri;
    if (kSec && kSec.e === 'activa' && kSec.p === 1 && J.suelo && !vistaKiri) for (const p of puntosKiri()) {
      if (!secundarias().kiriVistas[p.lado] && Math.abs(J.y - p.y) <= .6) cand(p.x, p.z, .65, p.lado === 'corrientes' ? 'Observar las corrientes ({interactuar})' : 'Observar el valle ({interactuar})', () => observarKiri(p));
    }
    const a = Fauna.acariciable(J.x, J.z); if (a && J.agachado) cand(a.x, a.z, 4, 'Acariciar (' + a.nom + ')', () => { Fauna.acariciar(a); J_.acariciar = 1.4; ganarXP(5); });
    if (!best && !enReto) { const a = altarCerca(); if (a && Sis.J.vivo) cand(a.x, a.z, ALTAR_OFRENDA, 'Ofrecer luz rescatada (' + (ST.motas || 0) + ')', () => UI.abrir('altar')); }
    return best;
  }

  /* capa oculta de un mural: a la luz del farol de Tsuru se lee lo que el pueblo calló (va al diario) */
  function leerOculto(m) { ST.ocultos[m.k] = 1; ganarXP(25); Sonido.sfx('latido'); UI.diarioNuevo(m.titulo + ' · lo que calla', GUION.muralesOcultos[m.k]); evento('oculto'); guardar(); }

  /* ---------- ciclo ---------- */
  function iniciar() {
    migrarSecundarias(); registrarTeCompartido();
    pg = new THREE.Group(); scene.add(pg);
    LUGARES.find(l => l.id === 'cristal').x = CUEVAS[0].bx; LUGARES.find(l => l.id === 'cristal').z = CUEVAS[0].bz; LUGARES.find(l => l.id === 'gruta').x = CUEVAS[1].bx; LUGARES.find(l => l.id === 'gruta').z = CUEVAS[1].bz;
    crearNPCs(); sembrarPicks(); sembrarCofres(); pistasCana();
    if (ST.ausentes.tsuru && npcs.momo) npcs.momo.ponerGesto('añoranza');
    Hikari.grieta(ST.grieta || 0);   // la grieta de la máscara, según lo que ha descubierto   // Momo, tras perder a su abuela
    Bus.on('calmado', e => {
      ST.calmados++; ganarXP(e.xp || 10); (e.ofrenda || []).forEach(o => { if (ITEMS[o] && Math.random() < .75) dar(o, 1); });
      evento('calmar:' + e.sp); if (e.id) evento('calmar:' + e.id); if (e.grupo) evento('calmar:' + e.grupo);
    });
    Bus.on('acariciado', registrarCaricia);
    Bus.on('asedioFin', () => evento('asedio'));
    Bus.on('asaltoFin', () => evento('asalto'));
    Bus.on('dueloFin', () => evento('duelo'));
    Bus.on('duelo2Fin', () => evento('duelo2'));
    for (let i = 0; i < 4; i++) if (ST.frag[i] && i !== ST.robado) Estr.encenderFragmento(i, true);
    if (ST.robado !== null) Estr.vaciarPedestal(ST.robado, true);
    for (const id in ST.mis) { const m = ST.mis[id], s = m.e === 'activa' && Q[id] && Q[id].pasos[m.p]; if (s && s.empieza) Bus.emit('empieza:' + s.empieza); }
    { const n = ST.frag.filter(Boolean).length; for (const q of MIS) if (q.des && q.des.frags && n >= q.des.frags && !ST.mis[q.id] && !ST.final && reqOk(q)) ST.mis[q.id] = { e: 'activa', p: 0, c: 0 }; }
    if (ST.frag.every(Boolean)) Estr.mostrarEspiral(true);
    if (ST.inv.katana) { Estr.katana.tomada = true; Estr.katana.mesh.visible = false; Estr.katana.halo.visible = false; }
    for (const m of Estr.murales) m.visto = !!ST.murales[m.k];
  }
  /* una escena empieza al llegar si Hikari está en el suelo, sin diálogo, sin pelea y sin Sombras cerca */
  const ESCENA = { sombras: 30 };
  const sitioPaso = s => { if (!s.npc) return s; const n = npcs[npcDe(s.npc)]; return n ? n.g.position : s; };
  const escenaLista = (J, s) => { const p = sitioPaso(s); return (!s.npc || disponible(npcDe(s.npc)) && !principalNPC(npcDe(s.npc))) && !Cin.activa && J.vivo && J.suelo && !UI.dlg && !UI.pausado && !(J.combate > 0) && !Jefes.enCombate() && Math.hypot(J.x - p.x, J.z - p.z) < s.r && (p.y === undefined || Math.abs(J.y - p.y) < 1.5) && !Sombras.lista.some(o => Math.hypot(o.x - J.x, o.z - J.z) < ESCENA.sombras); };
  function actualizar(dt, J, t) {
    Sis.J = J; J_ = J; ST.t += dt;
    actualizarPicks(dt, J, t); actualizarNPCs(dt, J); actualizarLugares(J);
    /* el piloto lleva su propia lógica, pero sus misiones avanzan por los mismos pasos que las de la historia anterior */
    Piloto.actualizar(dt, J, t);
    for (const a of Fauna.lista) identidadAnimal(a);
    for (const id of ['chispas', 'te', 'pescador', 'amigos', 'kiri']) reconciliarSecundaria(id);
    actualizarVistaKiri(dt, J);
    if (Campana.usa('mundo')) actualizarRetos(dt, J);
    for (const id in ST.mis) { const m = ST.mis[id]; if (m.e === 'activa') { const s = Q[id].pasos[m.p]; if (s && s.k === 'ir' && Math.hypot(J.x - s.x, J.z - s.z) < s.r && (!s.y || J.y > s.y)) avanzar(id); if (s && s.k === 'escena' && escenaLista(J, s)) Cin[s.cin](() => avanzar(id)); } }
    for (let i = cola.length - 1; i >= 0; i--) { cola[i].t -= dt; if (cola[i].t <= 0) { cola[i].fn(); cola.splice(i, 1); } }
    for (const c of CORR) {   // aire cálido que sube en las columnas de Kiri
      const d = Math.hypot(J.x - c.x, J.z - c.z); if (d < 70 && Math.random() < dt * 22) { const a = Math.random() * TAU, r = Math.random() * c.r * .8; FX.emit(c.x + Math.cos(a) * r, altura(c.x, c.z) + 1, c.z + Math.sin(a) * r, 0, 9 + Math.random() * 4, 0, 1.6, .22, 0xcffcff, .35); } }
    UIr -= dt; if (UIr <= 0) { UIr = .5; UI.refrescarMision(true); }
    mostrarCierre(); recordarCompras();
  }
  /* marcador del HUD sin tiempo: { txt, frac } (o null) */
  function marcador(m) { timer = m; }
  function guardar() { if (typeof Practica !== 'undefined' && Practica.activa) return; try { ProgresionEnemiga.registrar(ST); ST.pos = Sis.J ? { x: Sis.J.x, z: Sis.J.z, y: Sis.J.y } : ST.pos; localStorage.setItem(Campana.clave, JSON.stringify(ST)); } catch (e) { } }
  function cargar() {
    try {
      const s = localStorage.getItem(Campana.clave); if (!s) return false;
      const g = JSON.parse(s); if (!Campana.compatible(g)) return false;
      ST = Object.assign(nuevoEstado(), g); ST.secundarias = g.secundarias || {};
      Campana.migrar(ST, g); ProgresionEnemiga.registrar(ST);
      /* Reconciliar antes de crear los objetos. Conservar la posición guardada durante la migración. */
      const jugador = Sis.J; Sis.J = null;
      try { migrarSecundarias(); guardar(); } finally { Sis.J = jugador; }
      Bus.emit('fragmentos', enSitio()); return true;
    } catch (e) { return false; }
  }
  const hayPartida = () => { try { const s = JSON.parse(localStorage.getItem(Campana.clave)); return !!s && Campana.compatible(s); } catch (e) { return false; } };
  function nueva() {
    vistaKiri = null;
    ST = nuevoEstado(); Sis.ST = ST; Bus.emit('fragmentos', enSitio());
    if (typeof Practica !== 'undefined' && Practica.activa) return;
    try { localStorage.removeItem(Campana.clave); } catch (e) { }
    revelar('inicio_luna');
  }
  function reiniciarMundo() { if (vistaKiri) Bus.emit('focoCamara', null); vistaKiri = null; for (const p of picks) if (p.on) quitarPick(p); picks.length = 0; }

  return {
    get ST() { return ST; }, set ST(v) { ST = v; }, J: null, iniciar, actualizar, interactuable, hablar, encargo, dar, quitar, usar, equipar, cocinar, ganarXP, rescatar, mejora, mejorar, planeoMult, don, donMult, darDon, DONES, altarCerca, evento, seguir, objetivo, listaMisiones, integrarFragmento, eMundo, viajar, guardar, cargar, nueva, hayPartida, robar, enSitio, marcador, perder, npcDe,
    hpMax, luzMax, dmgMult, xpSig, tiene, arma, dobleSalto, pulso, planeoPlus, cargado, get timer() { return timer; }, npcs, NIVEL_MAX, revelar, RETO, picks, cofres, reiniciarMundo
  };
})();
