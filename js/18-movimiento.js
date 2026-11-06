/* === Ecos de Luz · 18-movimiento.js ===
   Física del jugador (antes en 10-juego.js): aceleración y frenado con peso, giro con
   inercia y derrape, pendientes que frenan o empujan, salto, doble salto, planeo, nado,
   esquiva, deslizar (correr + agacharse), trepar paredes y acantilados gastando luz, y
   aupar a salientes. El estado vive en J (10-juego.js). */
"use strict";

/* números del movimiento (m, s, m/s, m/s²) */
const MOV = {
  vel: { andar: 3.2, correr: 6.8, agachado: 1.25, bucear: 2.6, guardia: 1.5 },   // fase 1 de PLAN_JUEGO: andar ágil y carrera rápida
  /* nado (fase 2 de PLAN_JUEGO): normal gratis; con {correr}, rápido a costa de luz (la misma por segundo que el planeo, con sus
     mejoras); no se regenera nada durante el sprint ni esperaRegen s después; al agotarse hay que soltar {correr} y volver a
     tener 'entrada' de luz; aviso al bajar de la fracción 'aviso' de la luz máxima (y no se repite en avisoEspera s);
     profundidad del suelo a la que se entra a nadar y a la que se sale (histéresis: las olas no alternan el modo) */
  nado: { normal: 3.6, rapido: 6.8, acel: 12, frenado: 14, entrada: 12, esperaRegen: .75, aviso: .2, avisoEspera: 3, profundidad: [.75, .55] },
  fijado: { andar: 2.6, correr: 5 },   // con un enemigo fijado la pelea conserva su ritmo
  acel: 18, frenado: 24, acelHielo: 5, frenadoHielo: 3, aire: 8,
  giro: [14, 7],                       // rad/s del cuerpo parado y a toda velocidad
  derrape: 4.8,                        // solo al invertir una carrera, no al andar
  salto: 9.9, dobleSalto: 9.2, saltoAgua: 7.2, gravedad: 24, paso: .6,
  coyote: .12, buferSalto: .12,        // s: aún se salta tras salir de un borde; un Espacio pulsado antes de aterrizar cuenta
  planeo: { vel: 8.8, caida: 2.1, caidaMejor: 1.5, coste: 10, costeMejor: 6, giro: 2.6, corriente: 11 },
  pendiente: { resbalar: 1.15, empuje: 24, subida: .3, bajada: .12 },
  deslizar: { velMin: 4.8, friccion: 6.2, friccionNieve: 2.3, friccionArena: 11.7, gravedad: 16, giro: 1.8, velFin: 1.4 },   // fricción escalada para recorrer lo mismo que con la carrera anterior
  /* trepar (fase 4 de PLAN_JUEGO): solo con intención ({saltar} mantenido 'intencion' s contra la pared) y, en el terreno, solo en los
     biomas de 'biomas' (Sakura, Kiri y Dunas: no en la pradera ni en los lagos, donde están las aldeas); la obra marcada como fina
     (casas, templos, muros, columnas…) no se trepa ni se aupa */
  trepar: { pendiente: 1.25, vel: 1.6, lateral: 1.3, coste: 8, costeQuieto: 2.5, minLuz: 4, empuje: .1, intencion: .15, biomas: [1, 2, 3], impulso: [5.5, 6.5] },
  aupar: { min: .45, max: .95, duracion: .5 },
  esquiva: { dur: .5, vel: 9.5, invul: .24, espera: .85, bufer: .15 },   // preparación, evasión y salida distinguibles
  subpaso: .12, subpasosMax: 6,        // m máximos por subpaso de colisión y tope de subpasos por fotograma
  caida: { umbral: 19, factor: 2.5, max: 35 },
  regen: { quieto: 16, andando: 9, agua: 6, corriente: 34, vida: 1.6, esperaVida: 6 }
};

const Mov = (() => {
  const _p = { x: 0, z: 0 };
  let empujeT = 0;

  /* acerca la velocidad horizontal al objetivo con aceleración limitada (frena más fuerte) */
  function acercar(tx, tz, acel, fren, dt) {
    const dx = tx - J.vx, dz = tz - J.vz, d = Math.hypot(dx, dz); if (d < 1e-5) return;
    const a = (tx * tx + tz * tz) >= (J.vx * J.vx + J.vz * J.vz) * .98 && (tx * J.vx + tz * J.vz) >= 0 ? acel : fren;
    const s = Math.min(d, a * dt); J.vx += dx / d * s; J.vz += dz / d * s;
  }
  const grad = (x, z, e) => [(altura(x + e, z) - altura(x - e, z)) / (2 * e), (altura(x, z + e) - altura(x, z - e)) / (2 * e)];

  /* ---------- trepar y aupar ---------- */
  function soltar(empuje) { const W = J.trepa; J.trepa = null; if (W) { J.vx = W.nx * empuje; J.vz = W.nz * empuje; } J.vy = 0; J.suelo = false; }
  function empezarAupa(x1, y1, z1) {
    J.aupa = { t: 0, dur: MOV.aupar.duracion * clamp((y1 - J.y) / 1.2, .6, 1.2), x0: J.x, y0: J.y, z0: J.z, x1, y1, z1 };
    J.trepa = null; J.planeo = false; J.desliza = false; J.vx = J.vz = J.vy = 0; Sonido.sfx('salto');
  }
  /* ¿se puede ir en línea recta de (x0, z0) a (x1, z1) a la altura y sin entrar en un sólido? */
  function pasoLibre(x0, z0, x1, z1, y) { for (let t = .25; t <= 1; t += .25) if (Sol.dentro(lerp(x0, x1, t), y, lerp(z0, z1, t), .1)) return false; return true; }
  /* ¿hay una pared (estructura o acantilado) o un saliente delante? */
  function intentarTrepar(dx, dz, dt) {
    const S = Sis.ST, T = MOV.trepar;
    if (J.nada || J.planeo || J.desliza || J.atq || J.rodando > 0 || J.canaliza || enCueva(J.x, J.y + 1, J.z)) { empujeT = 0; return; }
    const w = Sol.pared(J.x + dx * .2, J.z + dz * .2, .55, J.y);
    if (w && -(dx * w.nx + dz * w.nz) > .55) {
      empujeT += dt; const dh = w.y1 - J.y;
      if (dh > MOV.aupar.min && dh <= MOV.aupar.max && (!J.suelo || empujeT > .15)) { const ax = J.x - w.nx * (.45 + w.d), az = J.z - w.nz * (.45 + w.d); if (pasoLibre(J.x, J.z, ax, az, w.y1 + .4)) { empezarAupa(ax, w.y1, az); return; } }
      if (dh > MOV.aupar.max && S.luz > T.minLuz && J.mantenSalto >= T.intencion && (!J.suelo || empujeT > T.empuje)) { J.trepa = { tipo: 'sol', nx: w.nx, nz: w.nz }; Sonido.sfx('recoger'); }
      return;
    }
    const px = J.x + dx * .6, pz = J.z + dz * .6, dh = altura(px, pz) - J.y;
    if (dh > MOV.aupar.min && pendiente(px, pz) > T.pendiente) {
      const g = grad(px, pz, .4), l = Math.hypot(g[0], g[1]) || 1, nx = -g[0] / l, nz = -g[1] / l;
      if (-(dx * nx + dz * nz) > .5) { empujeT += dt; if (T.biomas.includes(biomaDe(px, pz)) && T.biomas.includes(biomaDe(J.x, J.z)) && S.luz > T.minLuz && J.mantenSalto >= T.intencion && (!J.suelo || empujeT > T.empuje)) { J.trepa = { tipo: 'suelo', nx, nz }; Sonido.sfx('recoger'); } return; }
    } else if (!J.suelo && J.vy < 4 && dh > MOV.aupar.min && dh <= MOV.aupar.max && pendiente(px + dx * .3, pz + dz * .3) < 1) {
      // aupar a un escalón del terreno no atraviesa nada (vallas, barandillas): el camino tiene que estar libre de sólidos
      const ax = px + dx * .3, az = pz + dz * .3, ay = altura(ax, az);
      if (pasoLibre(J.x, J.z, ax, az, ay + .4)) { empezarAupa(ax, ay, az); return; }
    }
    empujeT = 0;
  }
  function trepar(dt, ix, iz, bloq) {
    const T = MOV.trepar, W = J.trepa, S = Sis.ST, sube = bloq ? 0 : iz, lado = bloq ? 0 : ix;
    const rx = W.nz, rz = -W.nx;                       // derecha del jugador mirando la pared
    J.x += rx * lado * T.lateral * dt; J.z += rz * lado * T.lateral * dt; J.y += sube * T.vel * dt;
    if (W.tipo === 'suelo') {
      // punto del acantilado a la altura actual: búsqueda a lo largo de la normal
      const f = s => altura(J.x + W.nx * s, J.z + W.nz * s) - J.y;
      let a = -1.4, b = 1.4;
      if (f(a) < 0) { empezarAupa(J.x - W.nx * .9, altura(J.x - W.nx * .9, J.z - W.nz * .9), J.z - W.nz * .9); return; }  // ya no hay pared: cima
      if (f(b) > 0) { soltar(.5); return; }
      for (let k = 0; k < 9; k++) { const m = (a + b) / 2; if (f(m) > 0) a = m; else b = m; }
      const s = (a + b) / 2, sx = J.x + W.nx * s, sz = J.z + W.nz * s, g = grad(sx, sz, .4), l = Math.hypot(g[0], g[1]);
      if (l > .05) { const nx = -g[0] / l, nz = -g[1] / l; W.nx = lerp(W.nx, nx, .25); W.nz = lerp(W.nz, nz, .25); const n = Math.hypot(W.nx, W.nz); W.nx /= n; W.nz /= n; }
      J.x = sx + W.nx * .3; J.z = sz + W.nz * .3;
      if (pendiente(sx, sz) < T.pendiente * .7 || altura(sx - W.nx * .7, sz - W.nz * .7) < J.y + .55) { const qx = sx - W.nx * .6, qz = sz - W.nz * .6; empezarAupa(qx, Math.max(altura(qx, qz), J.y), qz); return; }
    } else {
      const w = Sol.pared(J.x, J.z, .7, J.y);
      if (!w) { soltar(.5); return; }
      W.nx = w.nx; W.nz = w.nz; J.x += w.nx * (.3 - w.d); J.z += w.nz * (.3 - w.d);
      if (J.y + 1.15 > w.y1) { empezarAupa(J.x - w.nx * .75, w.y1, J.z - w.nz * .75); return; }
    }
    S.luz = Math.max(0, S.luz - (sube || lado ? T.coste : T.costeQuieto) * dt);
    J.yaw = Math.atan2(-W.nx, -W.nz); J.vx = J.vz = J.vy = 0; J.suelo = false; J.planeo = false; J.trepaVel = Math.hypot(sube, lado);
    if (S.luz <= 0) { soltar(1.2); UI.aviso('Sin luz para seguir trepando', 'error'); return; }
    if (!bloq && KEYP.Space) { J.vx = W.nx * T.impulso[0]; J.vz = W.nz * T.impulso[0]; J.vy = T.impulso[1]; J.yaw = Math.atan2(W.nx, W.nz); J.trepa = null; J.tSalto = 0; Sonido.sfx('salto'); return; }
    if (!bloq && KEYP.KeyC) { soltar(.8); return; }
    if (sube < 0 && J.y <= sueloEnJ(J.x, J.y, J.z) + .05) { J.trepa = null; J.suelo = true; J.y = sueloEnJ(J.x, J.y, J.z); }
  }
  function aupar(dt) {
    const A = J.aupa; A.t += dt / A.dur;
    const t = Math.min(1, A.t), sube = easeIO(Math.min(1, t / .65)), ade = easeIO(clamp((t - .4) / .6, 0, 1));
    J.y = lerp(A.y0, A.y1 + .02, sube); J.x = lerp(A.x0, A.x1, ade); J.z = lerp(A.z0, A.z1, ade); J.vx = J.vz = J.vy = 0;
    J.yaw = angDamp(J.yaw, Math.atan2(A.x1 - A.x0, A.z1 - A.z0), 10, dt);
    if (A.t >= 1) { J.aupa = null; J.suelo = true; J.y = sueloEnJ(J.x, J.y + .3, J.z); J.impacto = 2; }
  }

  /* ---------- paso principal ---------- */
  function actualizar(dt) {
    const S = Sis.ST, bloq = !!UI.dlg || !J.vivo || G.bloqueo;
    let ix = bloq ? 0 : (KEY.KeyD ? 1 : 0) - (KEY.KeyA ? 1 : 0), iz = bloq ? 0 : (KEY.KeyW ? 1 : 0) - (KEY.KeyS ? 1 : 0);
    if (!bloq && !ix && !iz && (Mando.mx || Mando.mz)) { ix = Mando.mx; iz = Mando.mz; }
    const aturdido = J.derribo > 0 || J.tambaleo > 0 || J.bloqueoT > .3;   // reacciones del combate (21-combate.js)
    const ix0 = ix, iz0 = iz;   // entrada sin bloquear: dirección para levantarse rodando
    if (J.canaliza || J.atrapado > 0 || aturdido) { ix = 0; iz = 0; }
    const fx = Math.sin(J.camYaw), fz = Math.cos(J.camYaw), rx = -fz, rz = fx;
    let dx = fx * iz + rx * ix, dz = fz * iz + rz * ix; let mag = Math.hypot(dx, dz); if (mag > 1) { dx /= mag; dz /= mag; mag = 1; }
    const quiere = mag > .1, ux = quiere ? dx / mag : 0, uz = quiere ? dz / mag : 0;
    J.derrape = false; J.tSalto += dt; J.mantenSalto = !bloq && KEY.Space ? J.mantenSalto + dt : 0;   // cuánto lleva pulsado {saltar}: la intención de trepar
    // búferes (tiempo desde la última pulsación de salto y de esquiva) y tiempo sin suelo (margen al borde)
    J.tPulsoSalto = !bloq && KEYP.Space ? 0 : J.tPulsoSalto + dt; J.tPulsoEsq = !bloq && KEYP.KeyV ? 0 : J.tPulsoEsq + dt; J.tAire = J.suelo ? 0 : J.tAire + dt;
    // aupar y trepar tienen su propio control
    J.nadoRapido = false;
    if (J.aupa) { aupar(dt); finPaso(dt, S, quiere); return; }
    if (J.trepa) { trepar(dt, ix, iz, bloq); if (J.trepa) { finPaso(dt, S, quiere); return; } }
    const gh = sueloEnJ(J.x, J.y, J.z), prevNada = J.nada, profundo = gh < NIVEL_AGUA - MOV.nado.profundidad[prevNada ? 1 : 0];
    J.nada = profundo && J.y < NIVEL_AGUA + .25;
    if (J.nada && !prevNada) { Sonido.sfx('chapuzon'); FX.rafaga(J.x, 0, J.z, 22, 3, .9, .22, 0xcfeeff, 2); J.planeo = false; J.desliza = false; }
    J.agachado = !bloq && !!KEY.KeyC && J.suelo && !J.nada && !J.atq && !J.desliza;
    const buceo = J.nada && !bloq && KEY.KeyC;
    // nado rápido: con {correr} en la superficie y moviéndose; cuesta luz como el planeo
    const N = MOV.nado, pideCorrer = !!(KEY.ShiftLeft || KEY.ShiftRight || Mando.sprint);
    if (!pideCorrer) J.nadoLibre = true;
    if (J.nadoBloq && J.nadoLibre && S.luz >= N.entrada) J.nadoBloq = false;
    let rapido = J.nada && !buceo && !bloq && quiere && pideCorrer && !J.nadoBloq && (J.nadoRapidoAnt || S.luz >= N.entrada);
    if (rapido && S.luz <= 0) { J.nadoBloq = true; J.nadoLibre = false; rapido = false; }
    J.nadoRapidoAnt = J.nadoRapido = rapido; J.tAvisoNado -= dt;
    if (rapido) {
      S.luz = Math.max(0, S.luz - (Sis.planeoPlus() ? MOV.planeo.costeMejor : MOV.planeo.coste) * Sis.planeoMult().coste * Sis.donMult('marea') * dt);
      if (S.luz < Sis.luzMax() * N.aviso && J.tAvisoNado <= 0) { UI.aviso('Te queda poca luz para nadar rápido', 'error'); J.tAvisoNado = N.avisoEspera; }
    }
    // moverse corta la recuperación de un golpe desde que ya se podría encadenar (no si hay otro golpe pedido o se carga)
    if (quiere && J.atq && !J.atq.comprometido && !(J.bufAtq > 0) && !(J.cargando > 0) && J.atq.f >= (J.atq.g.encadena !== undefined ? J.atq.g.encadena : J.atq.g.t[2])) J.atq = null;
    // velocidad objetivo (cuesta arriba más lenta, cuesta abajo algo más rápida)
    let vObj = J.nada ? (buceo ? MOV.vel.bucear : rapido ? N.rapido : N.normal) : J.agachado ? MOV.vel.agachado : J.guardia ? MOV.vel.guardia : (KEY.ShiftLeft || KEY.ShiftRight || Mando.sprint) ? MOV.vel.correr : MOV.vel.andar;
    if (Combate.fijado && J.suelo && !J.nada) vObj = Math.min(vObj, vObj > MOV.vel.andar ? MOV.fijado.correr : MOV.fijado.andar);
    if (J.estiloVel < 1) vObj *= J.estiloVel; if (J.lento > 0) vObj *= .6; if (J.atq || J.rodando > 0) vObj *= .35; if (J.cargando > 0) vObj *= .4;
    if (J.suelo && quiere && !J.nada) { const g = (altura(J.x + ux * .6, J.z + uz * .6) - altura(J.x - ux * .6, J.z - uz * .6)) / 1.2; vObj *= g > 0 ? 1 - MOV.pendiente.subida * Math.min(g, 1.2) : 1 + MOV.pendiente.bajada * Math.min(-g, 1); }
    const hielo = J.suelo && !J.nada && esHielo(J.x, J.z) && altura(J.x, J.z) < NIVEL_AGUA;   // solo resbala el lago helado (el agua de la nieve), no toda la nieve: como en sueloEnJ
    let tx = dx * vObj, tz = dz * vObj;
    // ---- planeo ----
    if (!bloq && !J.suelo && !J.nada && KEY.Space && J.vy < -.8 && J.tSalto > .3 && S.luz > 6 && !J.planeo) { J.planeo = true; Sonido.sfx('planeo'); if (!J.glideEv) { Sis.evento('planear'); J.glideEv = true; } }
    if (J.planeo && (!KEY.Space || J.suelo || J.nada || S.luz <= 0 || bloq)) J.planeo = false;
    // ---- deslizar: correr y agacharse ----
    if (!bloq && !J.desliza && J.suelo && !J.nada && !J.atq && J.rodando === 0 && KEYP.KeyC && Math.hypot(J.vx, J.vz) > MOV.deslizar.velMin) { J.desliza = true; Sonido.sfx('esquiva'); }
    if (J.planeo) {
      S.luz = Math.max(0, S.luz - (Sis.planeoPlus() ? MOV.planeo.costeMejor : MOV.planeo.coste) * Sis.planeoMult().coste * Sis.donMult('musgoso') * dt);
      if (quiere) J.yaw = angDamp(J.yaw, Math.atan2(dx, dz), MOV.planeo.giro, dt);
      const k = 1 - Math.exp(-2.4 * dt); J.vx += (Math.sin(J.yaw) * MOV.planeo.vel - J.vx) * k; J.vz += (Math.cos(J.yaw) * MOV.planeo.vel - J.vz) * k;
    } else if (J.desliza) {
      const D = MOV.deslizar, sup = superficie(J.x, J.z), fr = sup === 'nieve' ? D.friccionNieve : sup === 'arena' ? D.friccionArena : D.friccion;
      let v = Math.hypot(J.vx, J.vz); const nv = Math.max(0, v - fr * dt); if (v > 1e-4) { J.vx *= nv / v; J.vz *= nv / v; }
      const g = grad(J.x, J.z, .5); J.vx -= g[0] * D.gravedad * dt; J.vz -= g[1] * D.gravedad * dt;
      if (quiere) { v = Math.hypot(J.vx, J.vz); const a = Math.atan2(J.vx, J.vz), b = a + clamp(angDif(a, Math.atan2(dx, dz)), -D.giro * dt, D.giro * dt); J.vx = Math.sin(b) * v; J.vz = Math.cos(b) * v; }
      if (Math.random() < dt * 30) FX.emit(J.x, J.y + .05, J.z, rnd(-.5, .5), rnd(.3, .9), rnd(-.5, .5), .5, .14, superficie(J.x, J.z) === 'nieve' ? 0xf4f8ff : 0xd8c8a8, .6);
      if (bloq || !KEY.KeyC || !J.suelo || J.nada || Math.hypot(J.vx, J.vz) < D.velFin) J.desliza = false;
    } else {
      const acel = J.nada ? N.acel : !J.suelo ? MOV.aire : hielo ? MOV.acelHielo : MOV.acel, fren = J.nada ? N.frenado : !J.suelo ? MOV.aire : hielo ? MOV.frenadoHielo : MOV.frenado;
      const v = Math.hypot(J.vx, J.vz);
      if (J.suelo && quiere && v > MOV.derrape && (tx * J.vx + tz * J.vz) < -.2 * v * Math.hypot(tx, tz)) J.derrape = true;
      acercar(tx, tz, acel, fren, dt);
      if (J.derrape && Math.random() < dt * 25) FX.emit(J.x, J.y + .05, J.z, rnd(-.6, .6), rnd(.2, .8), rnd(-.6, .6), .45, .14, 0xd8d0b8, .5);
    }
    // ---- esquiva ----
    const E = MOV.esquiva;
    if (J.rodando > 0) { J.rodando += dt / E.dur; const f = 1 - J.rodando; J.vx = J.rodDir[0] * E.vel * Math.max(f, .2); J.vz = J.rodDir[1] * E.vel * Math.max(f, .2); if (J.rodando >= 1) J.rodando = 0; }
    // la esquiva cancela un golpe salvo en su parte comprometida, y permite levantarse rodando tras un derribo
    const puedeEsq = !(J.atq && J.atq.comprometido) && !J.estiloBloquea && !(J.tambaleo > 0) && !(J.derribo > 0 && J.derribo < COMBATE.derribo.levantarse);
    if (!bloq && J.tPulsoEsq < E.bufer && J.cdEsq <= 0 && J.rodando === 0 && !J.nada && puedeEsq) {
      J.tPulsoEsq = 9; J.rodando = .001; J.cdEsq = E.espera; J.inv = dificultad().invul; J.perfecta = false; J.atq = null; J.desliza = false; J.guardia = false; J.cargando = 0; J.derribo = 0;
      const ex = fx * iz0 + rx * ix0, ez = fz * iz0 + rz * ix0, el = Math.hypot(ex, ez);
      const mm = quiere ? [ux, uz] : el > .1 ? [ex / el, ez / el] : [Math.sin(J.yaw), Math.cos(J.yaw)]; J.rodDir = mm; J.yaw = Math.atan2(mm[0], mm[1]); Sonido.sfx('esquiva'); FX.rafaga(J.x, J.y + .3, J.z, 8, 1.5, .4, .15, 0xcfeeff);
    }
    // ---- salto: con búfer (un Espacio pulsado poco antes de aterrizar o de acabar la esquiva cuenta) y margen al borde
    // (aún se salta justo después de salir de él); el doble salto, solo al pulsar ----
    if (!bloq && J.tPulsoSalto < MOV.buferSalto && !(J.atrapado > 0) && !aturdido) {
      const enSuelo = J.suelo || (J.tAire < MOV.coyote && J.vy <= 0);
      if (J.nada) { J.vy = MOV.saltoAgua; J.nada = false; J.y = Math.max(J.y, NIVEL_AGUA + .05); J.tPulsoSalto = 9; Sonido.sfx('salto'); }
      else if (enSuelo && J.rodando === 0) { J.vy = MOV.salto; J.suelo = false; J.tSalto = 0; J.doble = false; J.desliza = false; J.tPulsoSalto = 9; Sonido.sfx('salto'); Sis.evento('saltar'); }
      else if (KEYP.Space && !J.suelo && !J.doble && Sis.dobleSalto() && !J.planeo) { J.vy = MOV.dobleSalto; J.doble = true; J.tSalto = 0; Sonido.sfx('doble'); FX.rafaga(J.x, J.y + .2, J.z, 14, 2, .6, .2, 0x9ffff0); Sis.evento('saltar'); }
    }
    // ---- pendientes demasiado empinadas: resbalar (no dentro de una cueva: allí el suelo es el del túnel, no la loma de encima) ----
    if (J.suelo && !J.nada && !enCueva(J.x, J.y + 1, J.z)) {
      const sl = pendiente(J.x, J.z);
      if (sl > MOV.pendiente.resbalar) { const g = grad(J.x, J.z, .6), gl = Math.hypot(g[0], g[1]) || 1; J.vx -= g[0] / gl * MOV.pendiente.empuje * dt; J.vz -= g[1] / gl * MOV.pendiente.empuje * dt; const dot = (J.vx * g[0] + J.vz * g[1]) / gl; if (dot > 0) { J.vx -= g[0] / gl * dot; J.vz -= g[1] / gl * dot; } }
    }
    // ---- trepar o aupar al empujar contra una pared ----
    if (!bloq && quiere && !J.trepa) { intentarTrepar(ux, uz, dt); if (J.aupa || J.trepa) { finPaso(dt, S, quiere); return; } } else empujeT = 0;
    // ---- corrientes de aire ----
    let up = 0; for (const c of CORR) if (Math.hypot(J.x - c.x, J.z - c.z) < c.r && J.y < altura(c.x, c.z) + (c.alto || 70) && !J.suelo) up = 1;
    // ---- vertical ----
    if (J.nada) { if (buceo) J.vy = damp(J.vy, J.y > gh + .6 ? -2.8 : 0, 6, dt); else J.vy = damp(J.vy, (NIVEL_AGUA - .42 - J.y) * 3.2, 7, dt); }
    else if (J.planeo) J.vy = damp(J.vy, (Sis.planeoPlus() ? -MOV.planeo.caidaMejor : -MOV.planeo.caida) * Sis.planeoMult().caida + up * MOV.planeo.corriente, 4, dt);
    else if (!J.suelo) { J.vy -= MOV.gravedad * dt; if (up) J.vy = Math.min(J.vy + 48 * dt, 9); }
    if (up) S.luz = Math.min(Sis.luzMax(), S.luz + MOV.regen.corriente * dt);
    // ---- mover con colisiones ----
    // en subpasos de MOV.subpaso m: a la velocidad de la carrera y la esquiva, con un tirón, un solo paso saltaría paredes finas
    const probar = (px, pz) => { const nh = sueloEnJ(px, J.y, pz); return J.suelo ? nh - J.y > MOV.paso : nh > J.y + .35; };
    const sub = clamp(Math.ceil(Math.hypot(J.vx, J.vz) * dt / MOV.subpaso), 1, MOV.subpasosMax), sdt = dt / sub;
    let nx = J.x, nz = J.z;
    for (let i = 0; i < sub; i++) {
      const ax = nx, az = nz; nx = ax + J.vx * sdt; nz = az + J.vz * sdt;
      if (probar(nx, nz)) { if (!probar(nx, az)) nz = az; else if (!probar(ax, nz)) nx = ax; else { nx = ax; nz = az; J.vx = J.vz = 0; } }
      _p.x = nx; _p.z = nz; Sol.empujar(_p, .42, J.y); empujarArboles(_p, .35, J.y); empujarGente(_p, .42, J.y); nx = _p.x; nz = _p.z;
    }
    // corriente que devuelve a la orilla de la tierra más cercana (la isla principal o una isla extra, 02-terreno.js)
    const T = tierraDe(nx, nz), ox = nx - T.x, oz = nz - T.z, rr = Math.hypot(ox, oz);
    if (rr > T.r + 16) { const a = (rr - T.r - 16) * 1.5 + 4; nx -= ox / rr * a * dt * 3; nz -= oz / rr * a * dt * 3; J.vx -= ox / rr * 6 * dt; J.vz -= oz / rr * 6 * dt; if (J.tAvisoIsla <= 0) { UI.aviso('Una corriente de luz te devuelve a la isla', 'conteo'); J.tAvisoIsla = 6; } }
    J.tAvisoIsla -= dt;
    J.x = nx; J.z = nz;
    const gh2 = sueloEnJ(J.x, J.y, J.z);
    if (J.suelo && !J.nada) { if (J.y - gh2 < .5 && J.vy <= .5 && !KEYP.Space) J.y = gh2; else if (J.y - gh2 >= .5) J.suelo = false; }
    if (!J.suelo || J.nada) {
      J.y += J.vy * dt; const gh3 = sueloEnJ(J.x, J.y, J.z);
      if (J.nada) J.y = clamp(J.y, gh3 + .35, NIVEL_AGUA - .2);
      else if (J.y <= gh3) {
        const C = MOV.caida;
        if (J.vy < -C.umbral && !(gh3 < NIVEL_AGUA - .6)) Combate.recibir({ dmg: Math.min(C.max, (-J.vy - C.umbral) * C.factor), caida: true });
        if (J.vy < -4 && gh3 >= NIVEL_AGUA - .6) { Sonido.sfx('aterrizar', { vol: Math.min(2, -J.vy / 10) }); FX.rafaga(J.x, gh3 + .1, J.z, 6, 1.6, .5, .18, 0xd8d0b8); }
        J.impacto = Math.max(0, -J.vy); J.y = gh3; J.vy = 0; J.suelo = true; J.planeo = false; J.doble = false; J.glideEv = false;
      } else J.suelo = false;
    }
    const ec = enCueva(J.x, J.y + 1.7, J.z); if (ec && J.y + 1.7 > ec.techo) { J.y = ec.techo - 1.7; J.vy = Math.min(J.vy, 0); }
    if (J.y < -25) { J.y = Math.max(altura(J.x, J.z), 1); J.vy = 0; }
    // ---- orientación: en el suelo, el cuerpo gira hacia donde pide el mando (no hacia donde aún lo lleva la inercia);
    // en el aire o deslizando, hacia donde va. Más despacio cuanto más rápido ----
    J.vel = Math.hypot(J.vx, J.vz);
    const yawAnt = J.yaw, haciaMando = J.suelo && quiere && !J.desliza;
    if (J.rodando === 0 && !J.planeo && !J.atq && !J.derrape) {
      if ((J.vel > .5 || haciaMando) && (quiere || J.desliza)) { const obj = haciaMando ? Math.atan2(ux, uz) : Math.atan2(J.vx, J.vz), r = lerp(MOV.giro[0], MOV.giro[1], clamp(J.vel / MOV.vel.correr, 0, 1)) * (J.desliza ? .4 : 1); J.yaw += clamp(angDif(J.yaw, obj), -r * dt, r * dt); }
    }
    J.giro = damp(J.giro, clamp(angDif(yawAnt, J.yaw) / Math.max(dt, .001) / 6, -1, 1), 10, dt);
    // pasos y distancia
    if (J.suelo && !J.nada && !J.desliza) J.metros += J.vel * dt;
    if (J.metros > 4) { Sis.evento('metros', J.metros); J.metros = 0; }
    finPaso(dt, S, quiere);
  }
  /* temporizadores y regeneración (también al trepar y aupar) */
  function finPaso(dt, S, quiere) {
    J.cdEsq = Math.max(0, J.cdEsq - dt); J.inv = Math.max(0, J.inv - dt); J.herido = Math.max(0, J.herido - dt * 2.2); J.recoger = Math.max(0, J.recoger - dt * 2.4); J.acariciar = Math.max(0, J.acariciar - dt); J.pulsoT = Math.max(0, J.pulsoT - dt * 1.6); J.combate = Math.max(0, J.combate - dt); J.sinDano += dt;
    J.mascara = !!S.eq.mascara; J.shake = Math.max(0, J.shake - dt * 3); J.lento = Math.max(0, (J.lento || 0) - dt); J.atrapado = Math.max(0, (J.atrapado || 0) - dt);
    const R = MOV.regen;
    if (J.sinDano > R.esperaVida && !Jefes.enCombate()) S.hp = Math.min(Sis.hpMax(), S.hp + R.vida * dt);
    if (J.suelo && !J.nada && !J.planeo && !J.trepa && !J.desliza && !Haz.on) S.luz = Math.min(Sis.luzMax(), S.luz + (J.vel < .5 ? R.quieto : R.andando) * dt);   // en el agua J.suelo sigue activo: no vale la regeneración de tierra   // con el haz encendido, la luz no vuelve
    J.tNadoRegen = J.nadoRapido ? 0 : J.tNadoRegen + dt;   // la luz vuelve al nadar solo tras esperaRegen s sin sprint
    if (J.nada && J.tNadoRegen > MOV.nado.esperaRegen && !J.planeo && !J.trepa && !Haz.on) S.luz = Math.min(Sis.luzMax(), S.luz + R.agua * dt);
  }
  /* corta los estados de movimiento (teletransporte, daño, cinemáticas) */
  function reiniciar() { J.trepa = null; J.aupa = null; J.desliza = false; J.derrape = false; empujeT = 0; J.tPulsoSalto = J.tPulsoEsq = 9; }
  return { actualizar, reiniciar };
})();
// El apoyo de la animación produce el paso; recorrer metros ya no crea un golpe fuera de fase.
Bus.on('hikari:paso', p => {
  Sonido.sfx('paso', { sup: superficie(p.x, p.z), suelo: p, vol: J.agachado ? .5 : .8 });
  if (superficie(p.x, p.z) === 'nieve' && J.vel > 1) FX.emit(p.x, p.y + .05, p.z, 0, .4, 0, .4, .1, 0xf4f8ff, .5);
});
