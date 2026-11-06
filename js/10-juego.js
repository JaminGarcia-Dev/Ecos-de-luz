/* === Ecos de Luz · 10-juego.js ===
   Entrada, cámara, bucle principal y arranque. La física del jugador está en 18-movimiento.js,
   Hikari en 17-hikari.js y el combate en 21-combate.js. */
"use strict";

const J = {
  x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, yaw: Math.PI, camYaw: 0, camPitch: .38, camDist: 6.4, camDistObj: 6.4, giro: 0,
  estilo: null, estiloVel: 1, estiloBloquea: false, suelo: true, nada: false, planeo: false, agachado: false, vel: 0, vivo: true, mascara: false, doble: false, tSalto: 9, tPulsoSalto: 9, tPulsoEsq: 9, tAire: 0, nadoRapido: false, nadoRapidoAnt: false, nadoBloq: false, nadoLibre: true, tAvisoNado: 0, tNadoRegen: 9, mantenSalto: 0, cdEsq: 0, cdPulso: 0, rodando: 0, inv: 0, atq: null, combo: 0, tCombo: 0, combate: 0, carga: 0, cargando: 0,
  herido: 0, recoger: 0, acariciar: 0, pulsoT: 0, shake: 0, sinDano: 99, metros: 0, paso: 0, ultimoGolpe: null, tGolpe: 0, hitstop: 0, lastSafe: null, bioma: 0, rodDir: [0, 1], cae: false, enAgua: false, perfecta: false, glideEv: false, tAvisoIsla: 0,
  trepa: null, aupa: null, desliza: false, derrape: false, impacto: 0, trepaVel: 0,
  guardia: false, guardiaT: 0, paradaT: 0, contra: 0, derribo: 0, tambaleo: 0, bloqueoT: 0, bufAtq: 0
};
Sis.J = J;
const G = { estado: 'carga', guia: false, region: '', interior: 0, tAuto: 0, tBioma: 0, sx: 0, sy: 0, sz: 0, mdx: 0, mdy: 0, locked: false, drag: false, dragMov: 0, lamp: null, bloqueo: false, tFauna: 0, lastTick: 0, fadeDeath: false };
const KEYP = {};
/* cámara: al trepar, rapidez del giro hacia la espalda, inclinación mínima y espera tras moverla a mano (s);
   distancia mínima a paredes y edificios, la mínima al jugador cuando algo la tapa y por debajo de cuál se
   considera atascada (m) */
const CAM_TREPA = { giro: 2.2, pitch: .32, espera: .8, pared: .3, min: .35, atasco: 1.5 };
/* inclinación de la cámara (rad): mínima (desde abajo) y máxima (desde arriba; más, la vista queda casi cenital) */
const CAM_PITCH = { min: -.45, max: 1.05 };
/* columnas finas (espigas, faroles, postes: radio menor de fina, m): fuera de las cuevas no acercan la cámara a Hikari */
const CAM_COLUMNA = { fina: 1.2 };
/* cámara en las cuevas: distancia máxima en la cámara grande y en el túnel (m), y hasta qué fracción del radio puede
   apartarse del eje del túnel o del centro de la cúpula (la roca tiene relieve: hasta un 20 % hacia dentro) */
const CAM_CUEVA = { camara: 8, tunel: 4.6, pared: .78 };
/* ¿un punto de la cueva e (enCueva) a la altura y queda ya en la roca? */
function enRocaCueva(e, y) {
  const c = e.c, k = CAM_CUEVA.pared; if (!e.enCamara) return e.d > c.R * k;
  const yr = (y - c.cy) / (c.Rc * 1.25 * k); return e.d > c.Rc * k * Math.sqrt(Math.max(0, 1 - yr * yr));
}
/* foco: un momento del juego (la secuencia del reto de los cristales) lleva la cámara a un punto, con su distancia e
   inclinación (evento focoCamara; null lo suelta). Rapidez con la que va y vuelve, y a cuántos m del punto deja de mandar */
const CAM_FOCO = { rapidez: 2.5, lejos: 25 };
Bus.on('focoCamara', f => { if (f) { f.pitch0 = G.foco ? G.foco.pitch0 : J.camPitch; G.focoUlt = f; } G.foco = f; });
/* pista de las columnas de aire: a cuántos m del borde de una columna y de su base en altura aparece */
const PISTA_CORRIENTE = { lejos: 10, alto: 6 };
/* lámpara de Hikari: intensidad de día, extra de noche y en cuevas; altura sobre ella, alcance (m) y caída */
const LAMPARA = { dia: .15, noche: .8, cueva: 1.15, alto: 2.3, alcance: 15, caida: 1.25 };
/* fuera del Velo: hora (escala de Atmosfera.FASES) y margen de mar alrededor de la isla donde ya no llega el rojo */
const FUERA_VELO = { entorno: .45, margen: 1 };
const _tmpP = { x: 0, z: 0 }, _arr = [];

/* ---------- entrada ---------- */
function activo() { return G.estado === 'juego' && !Cin.activa && !UI.pausado; }
function iniciarEntrada() {
  const cv = renderer.domElement;
  addEventListener('keydown', e => {
    if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (UI.dlg && e.code === 'Tab') return;
    if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (!KEY[e.code]) KEYP[e.code] = true; KEY[e.code] = true; Sonido.iniciar();
    if (G.estado === 'portada-menu') { if (e.code === 'Escape' || e.code === 'KeyP') UI.cerrar(); return; }
    if (Cin.activa && (e.code === 'Escape' || e.code === 'KeyP')) { UI.pausado ? UI.cerrar() : UI.abrir('diario'); return; }
    if (G.estado !== 'juego') return;
    if (e.code === 'Escape' || e.code === 'KeyP') { UI.pausado ? UI.cerrar() : UI.abrir(); }
    else if (UI.pausado) { if (e.code === 'KeyJ' || e.code === 'Tab') UI.abrir('misiones'); else if (e.code === 'KeyI') UI.abrir('zurron'); else if (e.code === 'KeyM') UI.abrir('mapa'); }
    else if (!Cin.activa) { if (e.code === 'KeyJ' || e.code === 'Tab') UI.abrir('misiones'); else if (e.code === 'KeyI') UI.abrir('zurron'); else if (e.code === 'KeyM') UI.abrir('mapa'); }
  });
  addEventListener('keyup', e => { KEY[e.code] = false; });
  addEventListener('blur', () => { for (const k in KEY) KEY[k] = false; });
  cv.addEventListener('mousedown', e => {
    Sonido.iniciar(); if (G.estado !== 'juego' || UI.pausado || Cin.activa) return;
    if (e.button === 0) { if (!G.locked) { G.drag = true; G.dragMov = 0; try { cv.requestPointerLock(); } catch (er) { } } else KEYP.Mouse0 = true; KEY.Mouse0 = true; }
    if (e.button === 2) { KEYP.Mouse2 = true; KEY.Mouse2 = true; }
    if (e.button === 1) { e.preventDefault(); KEYP.Mouse1 = true; KEY.Mouse1 = true; }
  });
  addEventListener('mouseup', e => {
    if (e.button === 0) { if (G.drag && G.dragMov < 6) KEYP.Mouse0 = true; G.drag = false; KEY.Mouse0 = false; }
    if (e.button === 2) KEY.Mouse2 = false;
    if (e.button === 1) KEY.Mouse1 = false;
  });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  addEventListener('mousemove', e => { if (G.locked || G.drag) { G.mdx += e.movementX || 0; G.mdy += e.movementY || 0; G.dragMov += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0); } });
  addEventListener('wheel', e => { if (activo()) J.camDistObj = clamp(J.camDistObj + Math.sign(e.deltaY) * .6, 2.8, 12); }, { passive: true });
  document.addEventListener('pointerlockchange', () => {
    const was = G.locked; G.locked = document.pointerLockElement === cv;
    if (was && !G.locked && G.estado === 'juego' && !UI.pausado && !Cin.activa && !UI.dlg) UI.abrir();
  });
  document.addEventListener('pointerlockerror', () => { G.locked = false; });
  addEventListener('resize', redimensionar);
}
function redimensionar() { Render.redimensionar(); }

/* ---------- utilidades de mundo ---------- */
function sueloEnJ(x, y, z) {
  let h = altura(x, z); if (h < NIVEL_AGUA && esHielo(x, z)) h = NIVEL_AGUA + HIELO_SUELO;
  const ec = enCueva(x, y + .5, z); if (ec) h = ec.suelo; const s = Sol.suelo(x, z, y); return s > h ? s : h;
}
function empujarArboles(p, r, y) {
  const c = Flora.colisionadores(p.x, p.z, r + .5, _arr);
  for (const q of c) {
    if (y > q.y1 - .1 || y + 1.6 < q.y0) continue;   // por encima (planeando, saltando) o por debajo no se choca
    const dx = p.x - q.x, dz = p.z - q.z, d = Math.hypot(dx, dz), m = q.r + r; if (d < m && d > 1e-4) { p.x = q.x + dx / d * m; p.z = q.z + dz / d * m; }
  }
}
/* los habitantes ocupan su sitio: Hikari los rodea (nunca los empuja a ellos) con una corrección corta por subpaso */
const GENTE_COL = { radio: .3, maxCorreccion: .06, alto: 1.8 };
function empujarGente(p, r, y) {
  for (const id in Sis.npcs) {
    const n = Sis.npcs[id]; if (!n.g.visible || (Sis.ST.ausentes && Sis.ST.ausentes[id])) continue;
    const q = n.g.position; if (Math.abs(q.y - y) > GENTE_COL.alto) continue;
    const dx = p.x - q.x, dz = p.z - q.z, d = Math.hypot(dx, dz), m = GENTE_COL.radio + r;
    if (d < m && d > 1e-4) { const k = Math.min(m - d, GENTE_COL.maxCorreccion) / d; p.x += dx * k; p.z += dz * k; }
  }
}
function superficie(x, z) { const b = biomaDe(x, z); return b === 2 ? 'nieve' : b === 3 ? 'arena' : 'tierra'; }

/* salto con la pantalla a negro (inicio, viaje, reaparecer): carga el terreno de alrededor y aclara cuando
   los fotogramas vuelven a ir fluidos (seguidos por debajo de fluido), para no ver los tirones de los primeros
   fotogramas en un sitio nuevo; como mucho espera maxima (ms) */
const ENTRADA = { negro: 450, asiente: 350, fluido: 40, seguidos: 12, maxima: 1800, aclara: 800 };
function saltar(x, z, antes, despues) {
  teletransportar(x, z); actualizarChunks(x, z, 30); Flora.forzar(x, z); if (antes) antes();
  const t0 = performance.now(); let u = t0, buenos = 0;
  const mira = () => {
    const t = performance.now(); buenos = t - u < ENTRADA.fluido ? buenos + 1 : 0; u = t;
    if ((buenos >= ENTRADA.seguidos && t - t0 > ENTRADA.asiente) || t - t0 > ENTRADA.maxima) { UI.fundido(0, ENTRADA.aclara); if (despues) despues(); }
    else requestAnimationFrame(mira);
  };
  requestAnimationFrame(mira);
}

/* equipos modestos: si tras SUGERENCIA.espera s en la portada el valle no llega a SUGERENCIA.fps (ya con la
   resolución dinámica actuando), se propone bajar un nivel de calidad. Una vez por sesión; «Seguir así» la apaga */
const SUGERENCIA = { espera: 4, fps: 45, muyLento: 25 };   // por debajo de muyLento propone directamente la baja
function vigilarCalidad() {
  if (G.sugerida || AJUSTES.calidad === 'baja' || AJUSTES.sinSugerencia) return;
  // FPS reales: fotogramas de la portada entre tiempo de reloj (el dt del bucle va recortado y, en un equipo
  // muy lento, ni la espera acabaría ni la media lo reflejaría)
  const t = performance.now(); if (!G.tPortada0) { G.tPortada0 = t; G.nPortada = 0; } G.nPortada++; if (t - G.tPortada0 < SUGERENCIA.espera * 1000) return;
  G.sugerida = true; const fps = G.nPortada / ((t - G.tPortada0) / 1000);
  if (fps < SUGERENCIA.fps) UI.sugerirCalidad(AJUSTES.calidad === 'alta' && fps >= SUGERENCIA.muyLento ? 'media' : 'baja', Math.round(fps));
}

/* ---------- llamas (vidas) y el Ocaso ----------
   Hikari tiene max llamas. Al caer gasta una y reaparece en su último punto de luz; si cae sin llamas, la alcanza el
   Ocaso: suelta sus motas donde cayó y vuelve con todas las llamas. Si llega a ese sitio (a menos de recoger m) antes
   de caer otra vez, las recupera; si cae antes, se pierden. Las llamas se avivan junto a un altar de santuario (a menos
   de altar m) y en los puntos de luz. Contra un gólem no se gastan: el intento vuelve a cero, como siempre.
   Números en LLAMAS (07-sistemas.js, que lo necesita para el estado inicial). */
const Llamas = (() => {
  let marca = null, tFx = 0;
  const S = () => Sis.ST, n = () => (S().llamas === undefined ? LLAMAS.max : S().llamas);
  function avivar() { if (n() >= LLAMAS.max) return; S().llamas = LLAMAS.max; UI.aviso('Tus llamas se avivan', 'conteo'); Sonido.sfx('farol'); FX.rafaga(J.x, J.y + 1.2, J.z, 18, 2, .7, .22, LLAMAS.color); Sis.guardar(); }
  /* al caer (antes de reaparecer): devuelve el aviso que se muestra */
  function alCaer(enJefe) {
    const s = S();
    if (enJefe) return 'Tu luz se desvanece… el guardián vuelve a esperar';
    let perdidas = false; if (s.ocaso) { s.ocaso = null; perdidas = true; }   // caer otra vez apaga las motas que quedaron atrás
    if (n() > 0) { s.llamas = n() - 1; return (perdidas ? 'Las motas que dejaste se apagaron. ' : '') + 'Pierdes una llama… Lumi te lleva al último punto de luz'; }
    if (s.motas > 0) s.ocaso = { x: J.x, y: Math.max(J.y, NIVEL_AGUA), z: J.z, motas: s.motas };
    s.motas = 0; s.llamas = LLAMAS.max;
    return 'Te alcanzó el Ocaso. ' + (s.ocaso ? 'Tu luz rescatada quedó donde caíste' : 'Recuperas tus llamas');
  }
  function actualizar(dt) {
    const o = S().ocaso;
    if (o && !marca) { marca = new Halo(LLAMAS.color, .9); marca.scale.set(2.2, 2.2, 1); scene.add(marca); }
    if (!o && marca) { scene.remove(marca); marca = null; }
    if (o) {
      const t = U.uT.value; marca.position.set(o.x, o.y + 1.1 + Math.sin(t * 1.6) * .15, o.z); marca.opacidad = .65 + .25 * Math.sin(t * 3);
      tFx += dt; if (tFx > .12) { tFx = 0; FX.emit(o.x + rnd(-.4, .4), o.y + .4, o.z + rnd(-.4, .4), 0, rnd(.6, 1.4), 0, 1.4, .14, LLAMAS.color, .8); }
      if (J.vivo && Math.hypot(J.x - o.x, J.z - o.z) < LLAMAS.recoger && Math.abs(J.y - o.y) < 3) { S().ocaso = null; Sis.rescatar(o.motas); UI.aviso('Recuperas tu luz rescatada', 'conteo'); Sonido.sfx('fragmento'); Sis.guardar(); }
    }
    // altares de los santuarios
    if (J.vivo && n() < LLAMAS.max) for (const k in Estr.altar) { const a = Estr.altar[k]; if (Math.hypot(J.x - a.x, J.z - a.z) < LLAMAS.altar) { avivar(); break; } }
    Hikari.llamas(n());
  }
  return { avivar, alCaer, actualizar, get n() { return n(); } };
})();
function morir() {
  if (Practica.activa) { Practica.terminar(false); return; }
  if (!J.vivo) return; const enJefeAlCaer = Jefes.enCombate(), txt = Llamas.alCaer(enJefeAlCaer);
  J.vivo = false; J.planeo = false; Combate.reiniciar(); UI.fundido(1, 700); UI.aviso(txt, 'error');
  setTimeout(() => {
    Jefes.alMorir(); const S = Sis.ST; let best = S.checkpoint ? { x: S.checkpoint.x, z: S.checkpoint.z } : null, bd = 1e9; if (!best) for (const l of LUGARES) if (l.viaje && S.lug[l.id]) { const d = Math.hypot(l.x - J.x, l.z - J.z); if (d < bd) { bd = d; best = Sis.viajar(l.id); } }
    if (!best) best = { x: 0, z: 14 };
    // al reaparecer se dice qué pasó y adónde se vuelve (antes solo había un aviso breve y parecía un reinicio)
    const sitio = LUGARES.filter(l => Math.hypot(l.x - best.x, l.z - best.z) < 90).sort((p, q) => Math.hypot(p.x - best.x, p.z - best.z) - Math.hypot(q.x - best.x, q.z - best.z))[0];
    saltar(best.x, best.z, null, () => UI.banner(enJefeAlCaer ? 'Tu luz se desvaneció' : 'Caíste', (sitio ? 'Vuelves a ' + sitio.nom : 'Vuelves al último punto de luz') + ' · llamas: ' + Llamas.n + '/' + LLAMAS.max, sitio ? sitio.ic : 'luz', 'mision')); S.hp = Sis.hpMax(); S.luz = Sis.luzMax(); J.vivo = true; J.inv = 2; for (const a of Fauna.lista) { a.estado = 'idle'; a.prov = false; a.t = 3; a.ani = a.aniMax; }
  }, 1500);
}
function teletransportar(x, z) {
  J.x = x; J.z = z; J.vx = J.vz = J.vy = 0; J.y = sueloEnJ(x, altura(x, z) + 1.5, z); if (J.y < NIVEL_AGUA) J.y = Math.max(J.y, NIVEL_AGUA - .4);
  J.suelo = true; J.planeo = false; Mov.reiniciar(); Combate.reiniciar(); G.sx = J.x; G.sy = J.y + 1.4; G.sz = J.z; Hikari.reiniciarTela(); Lumi.teletransportar(x, J.y, z); Fauna.lista.forEach(a => { if (Math.hypot(a.x - x, a.z - z) > 190 && !a.nombrado) a.estado = 'idle'; });
}

/* vista de depuración de los sólidos: se hace al pedirla (con los que haya entonces) y se quita con false */
function verSolidos(v) { if (G.vistaSol) { scene.remove(G.vistaSol); G.vistaSol.geometry.dispose(); G.vistaSol = null; } if (v !== false) { G.vistaSol = Sol.vista(); scene.add(G.vistaSol); } }

/* ---------- cámara ---------- */
function camaraJ(dt) {
  const sens = .0024 * AJUSTES.sens, fij = Combate.camara(dt);   // con objetivo fijado, el ratón cambia de objetivo
  G.tCamMan = G.mdx || G.mdy ? 0 : (G.tCamMan || 0) + dt;
  // trepando, si no se mueve la cámara, se va sola a la espalda de Hikari (fuera de la pared) y algo por encima
  // (sin esperar si la pared la tiene atascada contra Hikari)
  if (J.trepa && (G.tCamMan > CAM_TREPA.espera || J.camDist < CAM_TREPA.atasco)) { J.camYaw = angDamp(J.camYaw, Math.atan2(-J.trepa.nx, -J.trepa.nz), CAM_TREPA.giro, dt); if (J.camPitch < CAM_TREPA.pitch) J.camPitch = damp(J.camPitch, CAM_TREPA.pitch, CAM_TREPA.giro, dt); }
  // con foco, la cámara mira a su punto (y vuelve después a Hikari y a la inclinación que tenía)
  const F = G.focoUlt, conFoco = !!G.foco && Math.hypot(J.x - G.foco.x, J.z - G.foco.z) < CAM_FOCO.lejos;   /* lejos del punto (viaje, muerte) no manda */
  G.kFoco = damp(G.kFoco || 0, conFoco ? 1 : 0, CAM_FOCO.rapidez, dt); const kF = F ? G.kFoco : 0;
  const pMin = CAM_PITCH.min, pMax = F && kF > .02 ? Math.max(F.pitch, CAM_PITCH.max) : CAM_PITCH.max;   /* el foco puede mirar más desde arriba */
  J.camYaw -= G.mdx * sens; J.camPitch = clamp(J.camPitch + G.mdy * sens * (AJUSTES.invY ? -1 : 1), pMin, pMax); G.mdx = G.mdy = 0;
  if (KEY.ArrowLeft) J.camYaw += 1.9 * dt; if (KEY.ArrowRight) J.camYaw -= 1.9 * dt; if (KEY.ArrowUp) J.camPitch = clamp(J.camPitch - 1.2 * dt, pMin, pMax); if (KEY.ArrowDown) J.camPitch = clamp(J.camPitch + 1.2 * dt, pMin, pMax);
  if (F && kF > .02) J.camPitch = damp(J.camPitch, conFoco ? F.pitch : F.pitch0, CAM_FOCO.rapidez, dt);
  if (conFoco && F.yaw !== undefined) J.camYaw = angDamp(J.camYaw, F.yaw, CAM_FOCO.rapidez, dt);
  const ty = J.y + (J.agachado ? 1.0 : J.nada ? .8 : 1.4);
  G.sx = damp(G.sx, kF ? lerp(J.x, F.x, kF) : J.x, 16, dt); G.sy = damp(G.sy, kF ? lerp(ty, F.y, kF) : ty, 7, dt); G.sz = damp(G.sz, kF ? lerp(J.z, F.z, kF) : J.z, 16, dt);
  const ec = enCueva(J.x, J.y + 1, J.z); const jc = Jefes.enCombate(), maxD = ec ? (ec.enCamara ? CAM_CUEVA.camara : CAM_CUEVA.tunel) : jc ? 16 : 12;
  let dObj = Math.min(J.camDistObj + (J.planeo ? 1.2 : 0) + (J.vel > 5.4 ? .5 : 0) + (jc ? 3.5 : 0), maxD); if (kF) dObj = lerp(dObj, F.dist, kF);
  const cp = Math.cos(J.camPitch), sp = Math.sin(J.camPitch), ux = -Math.sin(J.camYaw) * cp, uy = sp, uz = -Math.cos(J.camYaw) * cp;
  let dl = dObj; for (let d = .45; d <= dObj; d += .45) { const px = G.sx + ux * d, py = G.sy + uy * d, pz = G.sz + uz * d; let blk = (!ec && py < altura(px, pz) + .35) || Sol.dentro(px, py, pz, CAM_TREPA.pared, ec ? 0 : CAM_COLUMNA.fina);   /* en una cueva mandan sus límites, no el terreno de encima; fuera, las columnas finas no la acercan */ if (!blk && ec) { const e2 = enCueva(px, py, pz); blk = !e2 || py > e2.techo - .35 || py < e2.suelo + .15 || enRocaCueva(e2, py); } if (!blk && py < NIVEL_AGUA - 6 && J.y > -1) blk = false; if (blk) { dl = Math.max(CAM_TREPA.min, d - .45); break; } }
  J.camDist = dl < J.camDist ? dl : damp(J.camDist, dl, 2.5, dt);
  let cx = G.sx + ux * J.camDist, cy = G.sy + uy * J.camDist, cz = G.sz + uz * J.camDist;
  if (!ec) { _tmpP.x = cx; _tmpP.z = cz; Sol.fueraColumnas(_tmpP, cy, CAM_TREPA.pared, CAM_COLUMNA.fina); cx = _tmpP.x; cz = _tmpP.z; }   /* si acaba dentro de una, se aparta de lado (el material de obra es de doble cara: se vería su interior) */
  const gc = Math.max(altura(cx, cz), Sol.suelo(cx, cz, G.sy)) + .45; if (cy < gc && !ec) cy = gc;   /* tampoco baja de lo que se pisa (losas) */ if (ec) { const e2 = enCueva(cx, cy, cz); if (e2) cy = clamp(cy, e2.suelo + .3, e2.techo - .4); }
  if (J.shake > 0) { cx += rnd(-1, 1) * J.shake * .08; cy += rnd(-1, 1) * J.shake * .08; }
  camera.position.set(cx, cy, cz);
  G.fij = damp(G.fij || 0, fij ? 1 : 0, 4, dt); const kf = .3 * G.fij;
  if (fij) { G.fx = fij.x; G.fy = fij.y; G.fz = fij.z; }
  if (kf > .001) camera.lookAt(lerp(G.sx, G.fx, kf), lerp(G.sy + .2, G.fy, kf), lerp(G.sz, G.fz, kf)); else camera.lookAt(G.sx, G.sy + .2, G.sz);
  const fov = AJUSTES.fov + (J.vel > 5.4 ? 4 : 0) + (J.planeo ? 8 : 0) + (J.rodando > 0 ? 5 : 0); if (Math.abs(camera.fov - fov) > .05) { camera.fov = damp(camera.fov, fov, 5, dt); camera.updateProjectionMatrix(); }
}

/* ---------- ambiente por fotograma ---------- */
let _lampT = 0;
function ambiente(dt, camPos) {
  const ec = enCueva(J.x, J.y + 1, J.z); G.interior = damp(G.interior, ec ? 1 : 0, 3, dt);
  Hikari.llevaFarol(Sis.tiene('farol') > 0);
  // fuera del Velo (una isla extra, 02-terreno.js) no llega el rojo de la Luna y es de mañana
  const fuera = islaEn(J.x, J.z, FUERA_VELO.margen);
  if (!Cin.activa) { Atmosfera.rojo(fuera ? 0 : Sis.ST.cieloRojo ? 1 : 0, dt); aplicarEntorno(Practica.activa ? .7 : fuera ? FUERA_VELO.entorno : Asedio.entorno(Sis.eMundo()), G.interior); Jefes.postAmbiente(); }
  const bajoAgua = camera.position.y < NIVEL_AGUA - .15 && !ec;
  if (bajoAgua) { scene.fog.color.setRGB(.02, .16, .22); scene.fog.density = .09; }
  // lámpara de Hikari
  if (G.lamp) { G.lamp.position.set(J.x, J.y + LAMPARA.alto, J.z); const noche = ENTORNO.e < .35 ? 1 : 0; G.lamp.intensity = lerp(LAMPARA.dia + noche * LAMPARA.noche, LAMPARA.cueva, G.interior); }
  if (!Cin.activa && !Practica.activa) { const b = biomaDe(J.x, J.z); J.bioma = b; G.tBioma -= dt; if (G.tBioma <= 0) { G.tBioma = .6; const R = regionDe(J.x, J.z); if (R.nom !== G.region) { G.region = R.nom; if (G.estado === 'juego') UI.banner(R.nom, 'Región', R.ic, 'lugar'); } } }
  U_uniformes(dt);
}
function U_uniformes(dt) { U.uT.value += dt; U.uJug.value.set(J.x, J.y, J.z); }

function mejorInteract(J) { if (!Campana.usa('jefes')) return Sis.interactuable(J); const o = DueloLuna.interactuable(J); if (o) return o; const a = Sis.interactuable(J), b = Jefes.interactuable(J); if (!a) return b; if (!b) return a; return Math.hypot(a.x - J.x, a.z - J.z) <= Math.hypot(b.x - J.x, b.z - J.z) ? a : b; }

/* ---------- bucle ---------- */
let _ultimo = performance.now();
function tick(dtReal) {
  const dt = Math.min(dtReal, G.dtMax || .05); let d = dt;
  if (J.hitstop > 0) { J.hitstop -= dt; d = dt * .08; }
  const S = Sis.ST;
  if (G.estado === 'carga') return;
  Sonido.pausar(UI.pausado && G.estado !== 'portada-menu');   // en Ajustes desde la portada la música sigue a su volumen
  Mando.leer(dt);
  if (UI.pausado) { render(); limpiarEntrada(); return; }
  if (Cin.activa) {
    Cin.actualizar(dt); Tasogare.actualizar(dt); Cazadores.actualizar(dt, null); ambienteCin(dt); transmitirMundo(camera.position.x, camera.position.z, dt, true); render(); limpiarEntrada(); return;   // en una escena, los Cazadores solo se mueven
  }
  if (G.estado === 'portada' || G.estado === 'intro') { if (G.estado === 'portada') vigilarCalidad(); Portada.camara(dt); transmitirMundo(camera.position.x, camera.position.z, dt, true); render(); limpiarEntrada(); return; }
  // ---- juego ----
  J.canaliza = 0;
  const it = (!Practica.activa && !UI.dlg && J.vivo) ? mejorInteract(J) : null;
  if (UI.dlg) { if (UI.dlg.opciones && (KEYP.ArrowDown || KEYP.ArrowUp)) UI.moverOpcion(KEYP.ArrowDown ? 1 : -1); if (KEYP.KeyR) UI.repetirDialogo(); if (KEYP.KeyV && UI.dlg.op.pausas) UI.saltarDialogo(); else if (KEYP.KeyE || KEYP.Enter || KEYP.Space) UI.avanzarDialogo(); G.canalT = 0; }
  else if (it && it.canal) {
    if (KEY.KeyE && !G.canalBloq) { G.canalT = (G.canalT || 0) + dt; J.canaliza = 1; if (G.canalT >= it.canal) { G.canalT = 0; G.canalBloq = true; it.fn(); } }
    else G.canalT = 0;
  } else { G.canalT = 0; if (it && KEYP.KeyE) { it.fn(); Sonido.sfx('ui'); } }
  if (!KEY.KeyE) G.canalBloq = false;
  if (!KEY.Mouse2) G.hazBloq = false;
  Combate.entrada(d);
  Mov.actualizar(d);
  if (!Practica.activa) Campana.limitar(J, d);   // el Velo: regiones que aún no abrió el capítulo (49-campana.js)
  Combate.orientar(d);
  if (!Piloto.encuadrar(dt)) camaraJ(dt);
  Combate.actualizar(dt);
  Haz.actualizar(d, J, !!KEY.Mouse2 && !G.hazBloq && J.vivo && !UI.dlg && !J.nada && !J.atq && !J.guardia && !(J.derribo > 0) && J.rodando === 0 && !J.canaliza && !J.trepa && !J.aupa);
  // animación
  const arma = Sis.arma();
  Hikari.equipar(S.eq.arma || null, S.eq.mascara); const mt = ITEMS[S.eq.manto]; if (mt && Hikari.capa) Hikari.capa.mesh.material.color.setHex(mt.tint);
  Hikari.mover(J.x, J.y, J.z, J.yaw, d);
  Hikari.animar(d, { vel: J.vel, suelo: J.suelo && !J.nada, agachado: J.agachado, giro: J.giro, vy: J.vy, planeo: J.planeo, nada: J.nada, nadoRapido: J.nadoRapido, recoger: J.recoger, acariciar: J.acariciar, herido: J.herido, pulso: J.pulsoT, rodando: J.rodando > 0 ? J.rodando : 0, combate: J.combate, armado: !!arma,
    golpe: J.atq ? J.atq.g : null, fGolpe: J.atq ? J.atq.f : 0, carga: Sis.cargado() ? Math.min(1, J.cargando / COMBATE.carga.min) : 0, cargaG: Armas.ficha(S.eq.arma).cargado,
    guardia: J.guardia, parada: J.paradaT, derribo: J.derribo, bloqueo: J.bloqueoT, contra: J.contra > 0, objetivo: Combate.rumboObjetivo(),
    estilo: J.estilo, armaFuera: J.combate > 0 || !!J.atq || J.guardia || Combate.fijado || J.cargando > .15, hablando: !!UI.dlg, haz: Haz.on, canal: !!J.canaliza, luz: S.luz / Sis.luzMax(), vx: J.vx, vz: J.vz, mira: J.camYaw, impacto: J.impacto, desliza: J.desliza, derrape: J.derrape, trepa: !!J.trepa, trepaVel: J.trepaVel, aupa: J.aupa ? Math.max(.001, J.aupa.t) : 0 });
  // mundo vivo
  const prov = Practica.activa ? null : Fauna.actualizar(UI.dlg ? 0 : d, J);
  if (Practica.activa) { Duelo.actualizar(d, J); Practica.actualizar(d); }
  else {   // campaña única: cada sistema funciona desde el capítulo que lo abre (CAPITULOS en 49-campana.js)
    if (Campana.usa('jefes')) Jefes.actualizar(d, J);
    if (Campana.usa('sombras')) Sombras.actualizar(d, J);
    if (Campana.usa('asedio')) Asedio.actualizar(d, J);
    if (Campana.usa('duelo')) { Duelo.actualizar(d, J); DueloEspiral.actualizar(d, J); }
    if (Campana.usa('lumi')) LumiEnlaces.actualizar(d, J);
    if (Campana.usa('luna')) DueloLuna.actualizar(d, J);
  }
  Tasogare.actualizar(d);
  Cazadores.actualizar(d, UI.dlg || Practica.activa ? null : J);
  const obj = Sis.objetivo();
  Lumi.actualizar(dt, J.x, J.y, J.z, J.yaw, G.guia && obj && obj.x !== null && obj.x !== undefined ? obj : null, G.interior);
  if (!Practica.activa) Sis.actualizar(dt, J, U.uT.value);
  if (Campana.usa('ecos')) Ecos.actualizar(dt, J); Llamas.actualizar(dt);
  Estr.actualizar(dt, U.uT.value, J.x, J.y, J.z, G.interior); Estr.animarEspiral(U.uT.value);
  ambiente(dt, camera.position);
  FX.actualizar(dt);
  // partículas por región: polen (o luciérnagas de noche) en la pradera, pétalos, nieve, arena y luciérnagas en los lagos
  Flora.actualizarParticulas(dt, G.interior > .5 ? 5 : [ENTORNO.e < .3 ? 4 : 0, 1, 2, 3, ENTORNO.e < .35 ? 4 : 5][J.bioma], camera.position.x, camera.position.y, camera.position.z);
  // interfaz
  J.tGolpe -= dt; let bestia = prov; if (!bestia && J.ultimoGolpe && J.tGolpe > 0 && Fauna.lista.includes(J.ultimoGolpe)) bestia = J.ultimoGolpe;
  if (Combate.objetivo && Fauna.lista.includes(Combate.objetivo)) bestia = Combate.objetivo;
  const jb = (DueloLuna.activo && DueloLuna.barra(J)) || (LumiEnlaces.activo && LumiEnlaces.barra(J)) || Duelo.barra(J) || Jefes.barra() || Sombras.barra(J); if (jb) bestia = jb;
  UI.prompt(it ? (it.canal ? 'Mantén · ' : '') + it.txt : null); UI.promptProg(it && it.canal ? (G.canalT || 0) / it.canal : 0); UI.mira(Haz.on);
  const q0 = S.mis.despertar; let pista = null;
  if (!G.locked && !G.drag && G.estado === 'juego' && !UI.dlg && Mando.ultimo !== 'mando') pista = 'Haz clic en la pantalla para mover la cámara con el ratón · Esc: pausa y controles';
  else if (q0 && q0.e === 'activa') pista = ['{mover} para moverte · {correr} para correr', '{saltar} para saltar', 'En el aire, mantén {saltar} para planear', null, null][q0.p] || null;
  // pista de la columna de aire: cerca y a su altura (no desde una cueva que pase por debajo)
  if (!pista && J.suelo && !J.nada && !enCueva(J.x, J.y + 1, J.z)) for (const c of CORR) if (Math.hypot(J.x - c.x, J.z - c.z) < c.r + PISTA_CORRIENTE.lejos && Math.abs(J.y - altura(c.x, c.z)) < PISTA_CORRIENTE.alto) { pista = 'Columna de aire cálido: salta dentro ({saltar}) y mantén {saltar} para planear'; break; }
  UI.pista(Practica.activa ? UI.teclas('Fijar: {fijar} · atacar: {atacar} · guardia: {guardia} · esquiva: {esquivar}') : Piloto.pista());
  J.cdEsqF = J.cdEsq / .9; const ctx = { guia: G.guia, bestia, region: G.region }; const jj = Object.assign({}, J); jj.cdEsq = J.cdEsq / .9; jj.cdPulso = J.cdPulso; UI.actualizar(dt, jj, ctx);
  if (J.herido <= 0) UI.vineta(0); else UI.vineta(J.herido * .8);
  Sonido.oyente(camera);
  Sonido.actualizar(dt, J.bioma, G.interior, ENTORNO.e < .35, J.vel, J.y, J.nada ? 1 : (J.y < 3 ? .35 : 0) + (J.bioma === 4 ? .25 : 0), {
    practica: Practica.activa, combate: enJefe() ? 1 : J.combate > 0 ? .55 : 0, luz: S.frag.filter(Boolean).length / 4,
    dialogo: !!UI.dlg, aldea: Math.hypot(J.x - sitio('aldea').x, J.z - sitio('aldea').z) < 40,
    peligro: Cazadores.lista.some(c => ['alerta', 'aviso', 'picado'].includes(c.estado)) ? 1 : 0,
    cieloRojo: !!S.cieloRojo, planeo: J.planeo });
  transmitirMundo(J.x, J.z, dt, false);
  seguirLuces(J.x, J.y, J.z);
  G.tAuto += dt; if (G.tAuto > 30) { G.tAuto = 0; Sis.guardar(); }
  render(); limpiarEntrada();
}
/* ms por fotograma para construir terreno (en las cinemáticas la cámara viaja más rápido) */
const CARGA_MS = { juego: 4, cine: 6 };
function transmitirMundo(px, pz, dt, cin) { actualizarChunks(px, pz, cin ? CARGA_MS.cine : CARGA_MS.juego); Flora.actualizar(dt, px, pz, cin); if (cin) seguirLuces(px, camera.position.y, pz); }
/* pelea contra un jefe (gólem, Tasogare, las ataduras de Lumi o la Luna Roja): la música de combate sube a su capa de jefe */
const enJefe = () => Jefes.enCombate() || [Duelo, DueloEspiral, LumiEnlaces, DueloLuna].some(m => m.activo);
function ambienteCin(dt) { U.uT.value += dt; U.uJug.value.set(J.x, J.y, J.z); Estr.actualizar(dt, U.uT.value, 0, -999, 0, 0); G.interior = 0; if (G.lamp) { if (Cin.lamp) { G.lamp.position.set(Cin.lamp.x, Cin.lamp.y, Cin.lamp.z); G.lamp.intensity = Cin.lamp.i; } else G.lamp.intensity = 0; } Flora.actualizarParticulas(dt, 0, camera.position.x, camera.position.y, camera.position.z); Sonido.oyente(camera); Sonido.actualizar(dt, 0, 0, Cin.tipo === 'intro', 0, 30, 0, { escena: Cin.tipo, plano: Cin.plano() }); }
function limpiarEntrada() { for (const k in KEYP) KEYP[k] = false; }
/* desenfoque de profundidad: en las cinemáticas y en la portada (el foco lo ponen ellas) */
const DESENFOQUE = { cine: .6, portada: .6 };
function render() { if (G.sinRender) return; Render.ajustes.desenfoqueObj = Cin.activa ? DESENFOQUE.cine : G.estado === 'portada' ? DESENFOQUE.portada : 0; Render.ajustes.cineObj = Cin.activa ? 1 : 0; Render.dibujar(); }
/* precarga de una cinemática (con la pantalla en negro): recorre la ruta de su cámara cada PRECARGA.paso m y en cada
   punto construye el terreno que falte (sus niveles de detalle quedan guardados: luego se cambian sin verse) y la hierba
   y la vegetación de alrededor. Un punto por fotograma, para no bloquear la página */
const PRECARGA = { paso: 25 };
function precargarRuta(ruta, cb) {
  const P = [];
  for (let k = 0; k < ruta.length; k++) {
    const [x0, z0] = ruta[k], [x1, z1] = ruta[Math.min(k + 1, ruta.length - 1)], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / PRECARGA.paso));
    for (let s = 0; s < (k === ruta.length - 1 ? 1 : n); s++) P.push([lerp(x0, x1, s / n), lerp(z0, z1, s / n)]);
  }
  let i = 0;
  const paso = () => {
    if (i >= P.length) { cb(); return; }
    const [x, z] = P[i++]; while (actualizarChunks(x, z, 1e4) > 0); Flora.forzar(x, z);
    requestAnimationFrame(paso);
  };
  paso();
}
function frame() { const n = performance.now(); const dt = (n - _ultimo) / 1000; _ultimo = n; if (!G.manual) { try { tick(dt); } catch (e) { console.error(e); } } requestAnimationFrame(frame); }

/* ---------- arranque ---------- */
function esperar(ms) { return new Promise(r => setTimeout(r, ms || 20)); }
async function arrancar() {
  UI.iniciar(); UI.cargando(.02, 'Despertando el valle…');
  await esperar(60);
  Render.crear(); Diagnostico.vigilar(renderer.domElement);
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(AJUSTES.fov, innerWidth / innerHeight, .25, 1500); camera.layers.enable(CAPAS.estatica);
  iniciarEntrada();
  UI.cargando(.08, 'Tejiendo la tierra…'); await esperar();
  TEX.det = texRuido(512); U.tDet.value = TEX.det; await Texturas.crear(); MAT_SUELO = crearMaterialSuelo(); TEX.halo = texHalo(64); Halo.lote(scene);
  for (const s of SITIOS) s.h = Math.max(2.4, alturaNatural(s.x, s.z));
  prepararCuevas(); trazarCaminos();
  UI.cargando(.16, 'Dibujando el mapa del mundo…'); await esperar();
  generarMapa();
  UI.cargando(.24, 'Encendiendo el cielo y el mar…'); await esperar();
  Atmosfera.crear(); crearAgua(); Flora.init(); FX.init();
  UI.cargando(.34, 'Levantando el faro, los santuarios y las cuevas…'); await esperar();
  Estr.init();
  UI.cargando(.5, 'Despertando a Hikari y a Lumi…'); await esperar();
  Hikari.crear(); Tasogare.crear(); Cazadores.crear(); Combate.crear(); Lumi.crear(); Fauna.iniciar();
  G.lamp = new THREE.PointLight(0xbfffee, .3, LAMPARA.alcance, LAMPARA.caida); scene.add(G.lamp);
  Sis.cargar(); Sis.iniciar(); Sis.J = J; Ecos.crear(); Jefes.iniciar(); Haz.crear(); Mando.iniciar();
  Piloto.iniciar(); EscenasInicio.preparar();
  Practica.crear();
  UI.cargando(.56, 'Preparando la banda sonora…'); await esperar();
  // posición inicial
  const S0 = sitio('faro'); const guard = Sis.ST.pos; if (guard && Sis.ST.mis && Object.keys(Sis.ST.mis).length) { J.x = guard.x; J.z = guard.z; } else { J.x = 0; J.z = 11; }
  J.y = sueloEnJ(J.x, 300, J.z); G.sx = J.x; G.sy = J.y + 1.4; G.sz = J.z; J.camYaw = Math.PI + .5; J.yaw = Math.PI; Hikari.mover(J.x, J.y, J.z, J.yaw);
  // carga de terreno inicial alrededor del jugador
  camera.position.set(J.x, J.y + 4, J.z + 8);
  for (let i = 0; i < 40; i++) { const p = actualizarChunks(J.x, J.z, 70); UI.cargando(.6 + .34 * (1 - Math.min(1, p / 70)), 'Cargando el terreno…'); await esperar(); if (p === 0) break; }
  Flora.forzar(J.x, J.z); UI.cargando(.97, 'Casi listo…'); await esperar();
  aplicarEntorno(1, 0); seguirLuces(J.x, J.y, J.z); camera.lookAt(J.x, J.y + 1, J.z);
  const muestras = Animales.muestras(); muestras.add(Sombras.muestras()); muestras.add(LumiEnlaces.muestras()); muestras.add(DueloLuna.muestras()); muestras.add(LunaRoja.muestras()); muestras.add(LunaDorada.muestras()); for (const M of [ArcoLuz, EscuelaLuz, EscuelaViento, EscuelaBrasa, EscuelaEscarcha, EscuelaOscuridad]) for (const m of M.muestras()) muestras.add(m); scene.add(muestras);
  await Render.precompilar([{ escena: scene, cam: camera }], k => UI.cargando(.97 + .03 * k, 'Preparando la luz…'));
  if (/[?&]solidos/.test(location.search)) verSolidos(true);   // vista de depuración de los sólidos (04-estructuras.js)
  try { renderer.compile(scene, camera); } catch (e) { } scene.remove(muestras);
  render(); UI.finCarga(); G.estado = 'portada'; Portada.mostrar(true); Diagnostico.avisar();
  $('btnContinuar').onclick = () => Portada.salir(() => empezar(false));
  $('btnNueva').onclick = () => {
    if (!Sis.hayPartida()) { Portada.salir(() => empezar(true)); return; }
    if (!G.confirmaNueva) { G.confirmaNueva = true; const tx = $('btnNueva').querySelector('span'); tx.textContent = '¿Borrar progreso? Pulsa otra vez'; setTimeout(() => { G.confirmaNueva = false; tx.textContent = 'Nueva partida'; }, 4000); return; }
    try { localStorage.removeItem(Campana.clave); sessionStorage.setItem('ecos2_auto', Campana.id); } catch (e) { } location.reload();
  };
  $('btnControles').onclick = () => { Portada.mostrar(false); G.estado = 'portada-menu'; UI.abrir('controles'); };
  $('btnAjustes').onclick = () => { Portada.mostrar(false); G.estado = 'portada-menu'; UI.abrir('ajustes'); };
  $('btnPractica').onclick = () => Portada.salir(() => { Practica.comenzar(); });
  UI.onReanudar = () => { if (G.estado === 'portada-menu') { G.estado = 'portada'; Portada.mostrar(true); } else if (G.estado === 'juego') { try { renderer.domElement.requestPointerLock(); } catch (e) { } } };
  $('btnSalir').onclick = () => { if (G.estado === 'juego' || G.estado === 'intro') Sis.guardar(); location.reload(); };
  $('btnVolver').onclick = () => UI.cerrar();
  UI.onViaje = id => { const p = Sis.viajar(id); if (!p) return; UI.cerrar(); UI.fundido(1, ENTRADA.negro); setTimeout(() => { saltar(p.x, p.z); Sonido.sfx('fragmento'); }, ENTRADA.negro + 50); };
  Bus.on('mantoCambia', () => { }); Bus.on('mundo', () => { }); Bus.on('avivar', () => Llamas.avivar());
  Cin.alFinal = () => { teletransportar(0, 11); G.bloqueo = false; };
  Cin.colocarJugador = (x, z, yaw, y) => { teletransportar(x, z); if (y !== undefined) { J.y = sueloEnJ(x, y + 1, z); G.sy = J.y + 1.4; } J.yaw = J.camYaw = yaw; };   // una escena deja a Hikari donde acaba (y: sobre algo alto, como el muelle)
  frame();
  let auto = null; try { auto = sessionStorage.getItem('ecos2_auto'); sessionStorage.removeItem('ecos2_auto'); } catch (e) { }
  if (auto) empezar(true);
}
function empezar(nueva) {
  Sonido.iniciar(); Portada.mostrar(false);
  if (nueva) { Sis.nueva(); Sis.ST.lug.faro = 1; G.estado = 'intro'; }
  const arrancarJuego = () => { Atmosfera.rojo(Sis.ST.cieloRojo ? 1 : 0); G.estado = 'juego'; UI.hud(true); UI.refrescarMision(); G.region = ''; Piloto.reanudar(); Sis.guardar(); };
  if ((nueva || !Sis.ST.inicio.prologo) && !Sis.ST.final) {
    UI.fundido(1, 10); setTimeout(() => precargarRuta(Cin.RUTAS.intro, () => { UI.fundido(0, 900); Cin.intro(() => { UI.fundido(1, 0); saltar(0, 11, () => { J.camYaw = Math.PI + .5; arrancarJuego(); G.region = BIOMAS[biomaDe(J.x, J.z)].nom; },
      // al aclarar: el título y después la región (en cola; el primer eco espera a que terminen)
      () => { const b = BIOMAS[biomaDe(J.x, J.z)]; UI.banner('Ecos de Luz', 'Hikari · El despertar', 'luz', 'mision'); UI.banner(b.nom, 'Región', b.ic, 'lugar'); }); }); }), 200);
  } else { UI.fundido(1, ENTRADA.negro); setTimeout(() => saltar(J.x, J.z, arrancarJuego), ENTRADA.negro); }
}
window.__ecos = {
  J, G, tick, estado: () => G.estado, manual(v) { G.manual = v; },
  empezarRapido(nueva) { Sonido.iniciar(); Portada.mostrar(false); if (nueva) Sis.nueva(); G.estado = 'juego'; UI.hud(true); UI.refrescarMision(); G.region = 'x'; teletransportar(J.x, J.z); Sis.ST.inicio.prologo = true; Piloto.reanudar(); },
  tele(x, z) { teletransportar(x, z); }, sim(n, dt) { G.sinRender = true; for (let i = 0; i < n; i++) tick(dt || 1 / 30); G.sinRender = false; }, avanzar(n, dt) { for (let i = 0; i < n; i++) { G.sinRender = i < n - 1; tick(dt || 1 / 30); } G.sinRender = false; },
  mirar(yaw, pitch, dist) { J.camYaw = yaw; if (pitch !== undefined) J.camPitch = pitch; if (dist) { J.camDistObj = dist; J.camDist = dist; } },
  tecla(c, v) { KEY[c] = v; if (v) KEYP[c] = true; }, solidos: verSolidos, get Jefes() { return Jefes; }, get Haz() { return Haz; }, get Mando() { return Mando; }, Sis, Fauna, Estr, UI, Cin, Flora, get Hikari() { return Hikari; }, get Combate() { return Combate; }, get Armas() { return Armas; }
};
addEventListener('load', () => { arrancar().catch(e => { console.error(e); $('txtCarga').textContent = 'Error: ' + e.message; }); });
