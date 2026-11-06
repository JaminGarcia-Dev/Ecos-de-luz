/* === Ecos de Luz · 21-combate.js ===
   Combate de Hikari (antes en 10-juego.js): combo propio de cada arma (ARMAS), golpe cargado y
   golpe tras la esquiva, búfer de entrada y cancelaciones, fijar objetivo (cámara, orientación y
   cambio de objetivo), guardia que gasta luz, parada a tiempo (devuelve luz, aturde al atacante y
   abre un contraataque), reacciones con peso (pausa, sacudida, empuje, tambaleo y derribo) y pulso
   de luz. Los golpes agotan el ánimo de los animales y la oscuridad de los gólems, y rompen las Sombras (35-sombras.js).
   El estado vive en J (10-juego.js); los números, en COMBATE. */
"use strict";

const COMBATE = {
  guardia: { reduce: .75, costeLuz: .8, arco: 2.2, empuje: 3.5, aturdido: .22 },
  parada: { ventana: .2, espera: .4, luz: 8, contra: 1.4, contraMult: 1.6, aturdeAnimal: 1.8, calma: .25, pausa: .08 },
  /* esquiva precisa (desde el principio, sin nivel): el golpe llega en los primeros 'ventana' s de invulnerabilidad; da 'luz' una vez por esquiva */
  esquivaPrecisa: { ventana: .1, luz: 4 },
  rotura: { aturdido: .9, daño: .6 },
  derribo: { umbral: .16, dur: 1.15, levantarse: .55, empuje: 9 },
  tambaleo: .3, empujeGolpe: 6,
  bufer: .16,                       // s que se recuerda una pulsación de ataque (más tiempo ejecutaba órdenes viejas)
  carga: { min: .6, sinNivel: .2 },
  tras: .3,                         // s tras la esquiva para el golpe especial
  imantar: { dist: 3.2, max: 1.1 }, // acercamiento limitado, sin lanzarse varios metros
  avance: { combo: .65, cargado: 1.8, esquiva: .85, velocidad: 4.8 },
  duracionMin: { combo: .43, cargado: .66, esquiva: .44 },
  fijar: { radio: 22, perder: 32, cambio: 150, giro: 7, alto: .3 },
  peso: { pausa: [0, .025, .045, .07], sacudida: [0, .18, .3, .45], vibra: [0, .3, .55, .9], empuje: [0, 1.5, 3.5, 6] },
  pulso: { coste: 30, radio: 14, espera: 6, daño: 12 }
};

/* dificultad (fase 5 de PLAN_JUEGO): daño a Hikari, vida y equilibrio de los enemigos que nacen, ventana de la parada y s de invulnerabilidad
   de la esquiva. 'exigente' es la referencia. Sube la presión y la exigencia, no el número de puntos de vida a secas. */
const DIFICULTADES = {
  sereno: { nom: 'Sereno', daño: .7, vida: .9, equilibrio: .9, parada: .24, invul: .24 },
  exigente: { nom: 'Exigente', daño: 1, vida: 1, equilibrio: 1, parada: .16, invul: .18 },
  intenso: { nom: 'Intenso', daño: 1.2, vida: 1.1, equilibrio: 1.1, parada: .14, invul: .16 }
};
const dificultad = () => DIFICULTADES[AJUSTES.dificultad] || DIFICULTADES.exigente;

const Combate = (() => {
  const C = COMBATE, RAD = Math.PI / 180, _p = new THREE.Vector3(), _o = { x: 0, y: 0, z: 0, yaw: 0 };
  let obj = null, cambioAcc = 0, marca = null, marcaT = 0;
  const armaId = () => Sis.ST.eq.arma || null;
  const stats = () => { const it = Sis.arma(), F = Armas.ficha(armaId()); return it ? { dmg: it.dmg, alc: it.alc, vel: it.vel } : { dmg: F.daño, alc: F.alcance, vel: 1 }; };

  /* ---------- marca del objetivo fijado (arte sustituible) ---------- */
  function crearMarca() {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.strokeStyle = '#fff'; x.lineWidth = 7; x.lineCap = 'round';
    for (let k = 0; k < 4; k++) { x.save(); x.translate(64, 64); x.rotate(k * Math.PI / 2); x.beginPath(); x.moveTo(-34, -52); x.lineTo(0, -40); x.lineTo(34, -52); x.stroke(); x.restore(); }
    x.beginPath(); x.arc(64, 64, 6, 0, TAU); x.fillStyle = '#fff'; x.fill();
    const t = new THREE.CanvasTexture(c);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, color: 0xffe9a8, transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, fog: false }));
    s.renderOrder = 10; s.visible = false; return s;
  }
  function crear() { marca = crearMarca(); scene.add(marca); for (const M of estilos()) M.crear(scene); }

  /* ---------- objetivo ---------- */
  function posObj(o, out) {
    if (o.tipo === 'animal') { const a = o.ref; return out.set(a.x, a.y + (a.m.alto || .6) * a.esc * .6, a.z); }
    if (o.tipo === 'sombra') { const s = o.ref; return out.set(s.x, s.y + s.E.alto * .6, s.z); }
    if (o.tipo === 'tasogare') return Duelo.pos(out);
    return o.ref.M.nucleo.getWorldPosition(out);
  }
  function valido(o) {
    if (!o) return false;
    if (o.tipo === 'animal') { const a = o.ref; return Fauna.lista.includes(a) && a.estado !== 'calmado' && Math.hypot(a.x - J.x, a.z - J.z) < C.fijar.perder; }
    if (o.tipo === 'sombra') { const s = o.ref; return Sombras.lista.includes(s) && s.estado !== 'romper' && Math.hypot(s.x - J.x, s.z - J.z) < C.fijar.perder; }
    if (o.tipo === 'tasogare') return Duelo.enPie() && Math.hypot(Duelo.x - J.x, Duelo.z - J.z) < C.fijar.perder;
    return Jefes.activo === o.ref && Jefes.enCombate();
  }
  function candidatos() {
    if (Practica.activa) return Duelo.enPie() ? [{ tipo: 'tasogare', ref: Duelo, prio: -.85 }] : [];
    const L = [], B = Jefes.activo;
    if (B && Jefes.enCombate()) L.push({ tipo: 'jefe', ref: B, prio: -.8 });
    for (const s of Sombras.lista) if (s.estado !== 'romper' && s.estado !== 'brotar' && Math.hypot(s.x - J.x, s.z - J.z) < C.fijar.radio) L.push({ tipo: 'sombra', ref: s, prio: -.6 });
    if (Duelo.enPie() && Math.hypot(Duelo.x - J.x, Duelo.z - J.z) < C.fijar.radio) L.push({ tipo: 'tasogare', ref: Duelo, prio: -.85 });
    for (const a of Fauna.lista) {
      if (a.estado === 'calmado' || Math.hypot(a.x - J.x, a.z - J.z) > C.fijar.radio) continue;
      const hostil = a.prov || a.estado === 'agresivo' || a.estado === 'atacar' || a.estado === 'amenaza' || a.estado === 'aturdido';
      L.push({ tipo: 'animal', ref: a, prio: hostil ? -.5 : 0 });
    }
    return L;
  }
  function rumbo(o) { posObj(o, _p); return Math.atan2(_p.x - J.x, _p.z - J.z); }
  function mejor() {
    let m = null, mv = 1e9;
    for (const o of candidatos()) { posObj(o, _p); const d = Math.hypot(_p.x - J.x, _p.z - J.z), v = Math.abs(angDif(J.camYaw, Math.atan2(_p.x - J.x, _p.z - J.z))) * 1.5 + d / C.fijar.radio + o.prio; if (v < mv) { mv = v; m = o; } }
    return m;
  }
  function alternar() {
    if (obj) { obj = null; Sonido.sfx('ui'); return; }
    obj = mejor();
    if (obj) { Sonido.sfx('ui2'); marcaT = 0; } else { J.camYaw = J.yaw; J.camPitch = .38; }   // sin objetivo: centra la cámara
  }
  /* cambia al objetivo más cercano hacia un lado (lado > 0: derecha de la pantalla) */
  function cambiar(lado) {
    const r0 = rumbo(obj); let m = null, mv = 1e9;
    for (const o of candidatos()) { if (o.ref === obj.ref) continue; const d = angDif(r0, rumbo(o)) * -lado; if (d > .02 && d < mv) { mv = d; m = o; } }
    if (m) { obj = m; marcaT = 0; Sonido.sfx('ui'); }
  }
  /* ayuda de cámara con objetivo: gira hacia él y usa el ratón (o el stick) para cambiar de objetivo */
  function camara(dt) {
    if (!obj) return null;
    if (!valido(obj)) { obj = null; return null; }
    cambioAcc = cambioAcc * Math.exp(-4 * dt) + G.mdx; G.mdx = 0;
    if (Math.abs(cambioAcc) > C.fijar.cambio) { cambiar(Math.sign(cambioAcc)); cambioAcc = 0; }
    posObj(obj, _p); const d = Math.hypot(_p.x - J.x, _p.z - J.z);
    J.camYaw = angDamp(J.camYaw, Math.atan2(_p.x - J.x, _p.z - J.z), C.fijar.giro, dt);
    J.camPitch = damp(J.camPitch, clamp(C.fijar.alto + (_p.y - J.y - 1.4) / Math.max(d, 2) * -.4, .08, .6), 2, dt);
    return _p;
  }
  /* tras el movimiento: de cara al objetivo salvo al correr, esquivar o planear */
  function orientar(dt) {
    if (!obj || !J.suelo || J.nada || J.rodando > 0 || J.planeo || J.trepa || J.aupa || J.desliza || J.derribo > 0) return;
    if (J.atq && J.atq.f >= J.atq.g.t[0]) return;
    if (J.vel > MOV.vel.andar + .5 && !J.guardia) return;
    J.yaw = angDamp(J.yaw, rumbo(obj), 12, dt);
  }

  /* ---------- temporizadores ---------- */
  function relojes(dt) {
    J.cdPulso = Math.max(0, J.cdPulso - dt / C.pulso.espera);
    J.tambaleo = Math.max(0, (J.tambaleo || 0) - dt); J.bloqueoT = Math.max(0, (J.bloqueoT || 0) - dt * 4);
    J.paradaT = Math.max(0, (J.paradaT || 0) - dt * 3.5); J.contra = Math.max(0, (J.contra || 0) - dt);
    if (J.derribo > 0) { J.derribo += dt / C.derribo.dur; if (J.derribo >= 1) J.derribo = 0; }
    J.finEsq = J.rodando > 0 ? 0 : (J.finEsq === undefined ? 9 : J.finEsq + dt);
    J.bufAtq = Math.max(0, (J.bufAtq || 0) - dt);
  }

  /* ---------- entrada por fotograma (antes del movimiento) ---------- */
  function entrada(dt) {
    const S = Sis.ST, bloq = !!UI.dlg || !J.vivo || G.bloqueo;
    relojes(dt);
    if (bloq) { J.guardia = false; J.cargando = 0; if (ultimoEstilo) ultimoEstilo.reiniciar(); J.estilo = null; J.estiloBloquea = false; J.estiloVel = 1; return; }
    if (KEYP.KeyZ || KEYP.Mouse1) alternar();
    if (obj && !valido(obj)) obj = null;
    const aturdido = J.derribo > 0 || J.tambaleo > 0;
    if (KEYP.Mouse0) J.bufAtq = C.bufer;
    guardia(dt, aturdido);
    if (estiloDe()) entradaEstilo(estiloDe(), dt, aturdido); else { estiloLibre(); ataque(dt, aturdido); }
    // pulso de luz
    if (KEYP.KeyQ) { if (!Sis.pulso()) UI.aviso('El Pulso de luz se desbloquea en el nivel 3', 'error'); else if (J.cdPulso > 0) Sonido.sfx('error'); else if (S.luz < C.pulso.coste) { UI.aviso('Necesitas ' + C.pulso.coste + ' de luz', 'error'); Sonido.sfx('error'); } else pulso(); }
    // objetos rápidos, cambio de arma y guía de Lumi
    if (KEYP.Digit1) Sis.usar('te'); if (KEYP.Digit2) Sis.usar('onigiri'); if (KEYP.Digit3) Sis.usar('esencia');
    if (KEYP.Digit4 && !J.atq) { const o = ['katana', 'naginata', 'odachi', 'arco', 'escuela', 'escuela_viento', 'escuela_brasa', 'escuela_escarcha', 'escuela_oscuridad'].filter(i => Sis.tiene(i)); if (o.length > 1 && Sis.equipar(o[(o.indexOf(S.eq.arma) + 1) % o.length])) { J.combo = 0; UI.aviso('Arma: ' + Sis.arma().nom, 'conteo'); } }
    if (KEYP.KeyF) { G.guia = !G.guia; UI.aviso(G.guia ? 'Lumi te guiará hacia tu objetivo' : 'Lumi vuelve a acompañarte', 'conteo'); Sonido.sfx('ui2'); }
  }

  /* ---------- guardia ---------- */
  function guardia(dt, aturdido) {
    // atacar tiene prioridad: con la guardia alzada, pulsar ataque golpea y la guardia vuelve después
    const est = estiloDe(), quiere = !!KEY.KeyR && !(J.bufAtq > 0) && !aturdido && !(est && (est.id === 'luz' || ocupado(est))) && J.suelo && !J.nada && !J.trepa && !J.aupa && !J.desliza && !J.planeo && J.rodando === 0 && !Haz.on && !J.canaliza;
    if (quiere && J.atq && J.atq.f >= J.atq.g.t[1]) J.atq = null;   // cancela la recuperación de un golpe
    if (quiere && !J.atq) {
      // la parada solo vale al pulsar la guardia (no al volver a alzarla tras un golpe) y sin pulsarla sin parar
      if (!J.guardia) { J.guardia = true; J.guardiaT = 0; J.paradaLista = !!KEYP.KeyR && (J.sinGuardia === undefined ? 9 : J.sinGuardia) > C.parada.espera; J.cargando = 0; Sonido.sfx('guardia'); }
      J.guardiaT += dt; J.combate = Math.max(J.combate, 1.5);
    } else if (J.guardia) { J.guardia = false; J.sinGuardia = 0; }
    if (!J.guardia) J.sinGuardia = (J.sinGuardia === undefined ? 9 : J.sinGuardia) + dt;
  }

  /* ---------- estilos de distancia y de luz: una sola ranura ofensiva (la del arma equipada) ---------- */
  const estilos = () => [ArcoLuz, EscuelaLuz, EscuelaViento, EscuelaBrasa, EscuelaEscarcha, EscuelaOscuridad];
  const estiloDe = () => { const it = Sis.arma(); return it && ({ arco: ArcoLuz, luz: EscuelaLuz, viento: EscuelaViento, brasa: EscuelaBrasa, escarcha: EscuelaEscarcha, oscuridad: EscuelaOscuridad })[it.estilo] || null; };
  const ocupado = M => { const e = M.estado(); return !!e.accion || e.carga !== null; };
  let ultimoEstilo = null;
  /* sin estilo equipado: lo que quedaba de uno se apaga */
  function estiloLibre() {
    if (ultimoEstilo) { ultimoEstilo.reiniciar(); ultimoEstilo = null; }
    J.estilo = null; J.estiloVel = 1; J.estiloBloquea = false;
  }
  function entradaEstilo(M, dt, aturdido) {
    if (ultimoEstilo !== M) { if (ultimoEstilo) ultimoEstilo.reiniciar(); ultimoEstilo = M; J.atq = null; J.cargando = 0; }
    const S = Sis.ST, E = { libre: !aturdido && J.rodando === 0 && !J.nada && !J.trepa && !J.aupa && !J.desliza && !Haz.on && !J.canaliza, atacar: !!KEY.Mouse0, atacarPulsado: !!KEYP.Mouse0,
      esquivaReciente: J.finEsq, x: J.x, y: J.y, z: J.z, yaw: J.yaw, objetivo: null, luz: S.luz, vida: S.hp, guardia: !!KEY.KeyR, guardiaPulsada: !!KEYP.KeyR, esquivarPulsado: !!KEYP.KeyV, cancelar: aturdido };
    if (obj) { posObj(obj, _p); E.objetivo = { x: _p.x, y: _p.y, z: _p.z }; }
    const R = M.entrada(dt, E);
    if (R.gasta) S.luz = Math.max(0, S.luz - R.gasta);
    // coste de vida de la escuela de oscuridad: no es un ataque enemigo, no se esquiva ni se bloquea y nunca mata (deja 1)
    if (R.gastaVida) { S.hp = Math.max(1, S.hp - R.gastaVida); J.sinDano = 0; }
    if (R.aviso) { UI.aviso(R.aviso, 'error'); Sonido.sfx('error'); }
    if (R.yaw !== null) J.yaw = R.yaw;
    J.estiloVel = R.ralentiza; J.estiloBloquea = R.bloquea; J.estilo = R.pose.nombre === 'reposo' ? null : R.pose;
    if (J.estilo || R.gasta) J.combate = Math.max(J.combate, 3);
    J.bufAtq = 0;
  }

  /* ---------- ataques ---------- */
  const libre = () => J.rodando === 0 && !J.nada && !J.trepa && !J.aupa && !J.desliza && !(J.derribo > 0) && !(J.tambaleo > 0) && !Haz.on && !J.canaliza && !J.guardia;
  function ataque(dt, aturdido) {
    if (J.atq) { avanzar(dt); return; }
    J.tCombo -= dt; if (J.tCombo <= 0) J.combo = 0;
    if (!libre()) { J.cargando = 0; return; }
    if (J.cargando > 0) {
      if (KEY.Mouse0) { J.cargando += dt; if (!Sis.cargado() && J.cargando > C.carga.sinNivel) { J.cargando = 0; empezar('combo'); } }
      else { const c = J.cargando; J.cargando = 0; empezar(Sis.cargado() && c > C.carga.min ? 'cargado' : 'combo'); }
      return;
    }
    if (J.bufAtq > 0) { J.bufAtq = 0; if (J.finEsq < C.tras) empezar('esquiva'); else if (KEY.Mouse0) J.cargando = .0001; else empezar('combo'); }
  }
  function empezar(tipo) {
    const F = Armas.ficha(armaId()), st = stats(); let g, n = 0;
    if (tipo === 'cargado') g = F.cargado; else if (tipo === 'esquiva') g = F.esquiva; else { n = J.combo % F.combo.length; g = F.combo[n]; }
    J.atq = { g, n, tipo, t: 0, dur: Math.max(g.dur / st.vel, C.duracionMin[tipo]), f: 0, fPrev: 0, toc: new Set(), impulso: false, onda: false, rumbo: null, comprometido: false, contra: J.contra > 0, aire: !J.suelo, avance: Math.min(g.avance || 0, C.avance[tipo]) };
    J.combate = 3; J.bufAtq = 0; J.guardia = false;
    // orientación: objetivo fijado, el animal hostil más cercano delante, la dirección de marcha o la cámara
    if (obj) J.yaw = rumbo(obj);
    else {
      let m = null, dmin = 5.5; for (const a of Fauna.lista.concat(Sombras.lista)) { if (a.estado === 'calmado' || a.estado === 'romper') continue; const d = Math.hypot(a.x - J.x, a.z - J.z); if (d < dmin && Math.abs(angDif(J.yaw, Math.atan2(a.x - J.x, a.z - J.z))) < 1.4) { dmin = d; m = a; } }
      if (m) J.yaw = Math.atan2(m.x - J.x, m.z - J.z); else if (!(KEY.KeyW || KEY.KeyA || KEY.KeyS || KEY.KeyD || Mando.mx || Mando.mz)) J.yaw = J.camYaw;
    }
    // imán: con objetivo cerca, el avance cierra la distancia
    if (obj && !J.atq.aire) { posObj(obj, _p); const radio = obj.tipo === 'animal' ? obj.ref.E.r * obj.ref.esc : obj.tipo === 'sombra' ? obj.ref.E.r : obj.tipo === 'tasogare' ? DUELO.radio : obj.ref.rad || .7;
      const d = Math.hypot(_p.x - J.x, _p.z - J.z) - radio, alc = st.alc * (g.alc || 1); if (d < C.imantar.dist + alc) J.atq.avance = clamp(d - alc * .6, 0, Math.min(C.avance[tipo], C.imantar.max)); }
  }
  function avanzar(dt) {
    const A = J.atq, g = A.g, t = g.t;
    A.t += dt; A.fPrev = A.f; A.f = Math.min(1, A.t / A.dur); const f = A.f;
    if (f < t[0] && obj) J.yaw = angDamp(J.yaw, rumbo(obj), 10, dt);   // corrige la puntería mientras anticipa
    if (!A.impulso && f >= t[0]) {
      A.impulso = true; Sonido.sfx('corte', { fuerza: Math.min(2, (g.peso || 1) - 1 + (A.tipo === 'combo' ? 0 : 1)), peso: g.peso || 1 });
      if (g.salto && J.suelo) { J.vy = g.salto; J.suelo = false; }
    }
    // avance del cuerpo durante el golpe, con perfil suave (1 - u², que integra 2/3) para que los pies lo sigan
    if (!A.aire && A.avance > 0 && f >= t[0] && f < t[2]) { const u = (f - t[0]) / (t[2] - t[0]), v = Math.min(C.avance.velocidad, A.avance * Math.PI / (2 * (t[2] - t[0]) * A.dur) * Math.sin(Math.PI * u)); J.vx = Math.sin(J.yaw) * v; J.vz = Math.cos(J.yaw) * v; }
    else if (!A.aire && f >= t[0] && f < t[1] && !A.avance) { J.vx *= .5; J.vz *= .5; }
    // vuelta completa del cuerpo
    if (g.vuelta && f > t[0] && A.fPrev < t[1]) { const u0 = clamp((A.fPrev - t[0]) / (t[1] - t[0]), 0, 1), u1 = clamp((f - t[0]) / (t[1] - t[0]), 0, 1); J.yaw += (easeIO(u1) - easeIO(u0)) * g.vuelta * RAD; }
    if (f > t[0] && A.fPrev < t[1]) barrer(A, Math.min(f, t[1]));
    if (g.onda && !A.onda && f >= t[1]) { A.onda = true; onda(A); }
    A.comprometido = f > t[0] * .5 && f < t[1];
    const enc = g.encadena !== undefined ? g.encadena : t[2];
    if (f >= 1 || (J.bufAtq > 0 && f >= enc)) {
      const sigue = J.bufAtq > 0;
      J.combo = A.tipo === 'combo' ? A.n + 1 : A.tipo === 'esquiva' ? 1 : 0; J.tCombo = .6; J.atq = null;
      if (sigue && libre()) { J.bufAtq = 0; empezar('combo'); }
    }
  }
  /* la hoja barre un sector entre el fotograma anterior y este: daña una vez a cada animal y al gólem */
  function barrer(A, f1) {
    const g = A.g, id = armaId(), st = stats();
    if (A.rumbo === null) A.rumbo = J.yaw - Armas.giroHoja(id, g, g.t[0]);
    const r1 = J.yaw - Armas.giroHoja(id, g, f1), d = angDif(A.rumbo, r1), centro = A.rumbo + d / 2, medio = Math.abs(d) / 2 + (g.ang || .3);
    A.rumbo = r1;
    const alc = st.alc * (g.alc || 1), base = st.dmg * Sis.dmgMult() * (g.mult || 1) * (A.contra ? C.parada.contraMult : 1), peso = g.peso || 1;
    _o.x = J.x; _o.y = J.y; _o.z = J.z; _o.yaw = centro;
    // el cargado y las armas pesadas quiebran el farol del escudo; el cargado interrumpe el cierre de la Luna
    const toc = Impacto.sector(_o, alc, medio, base, { peso, contra: A.contra, romper: A.tipo === 'cargado', romperSombra: A.tipo === 'cargado' || peso >= 3 }, A.toc, (x, y, z) => chispas(x, y, z, A));
    if (toc) impacto(A, peso);
  }
  function chispas(x, y, z, A) { const F = Armas.ficha(armaId()); FX.rafaga(x, y, z, 10 + A.g.peso * 6, 3 + A.g.peso, .35, .14, A.contra ? 0xfff2b0 : F.estela, 1); }
  function impacto(A, peso) {
    J.hitstop = Math.max(J.hitstop, C.peso.pausa[peso] * (A.contra ? 1.6 : 1)); J.shake = Math.max(J.shake, C.peso.sacudida[peso]);
    Mando.vibrar(C.peso.vibra[peso], C.peso.vibra[peso] * .6, 60 + peso * 40); Sonido.sfx('golpe', { peso });
    if (A.contra) { FX.numero('¡Contraataque!', J.x, J.y + 2.3, J.z, '#fff2b0'); J.contra = 0; A.contra = false; }
  }
  /* onda de choque (golpes pesados contra el suelo) */
  function onda(A) {
    const g = A.g, st = stats(), px = J.x + Math.sin(J.yaw) * st.alc * .7, pz = J.z + Math.cos(J.yaw) * st.alc * .7, r = g.onda.r;
    const dmg = st.dmg * Sis.dmgMult() * g.mult * g.onda.mult, py = sueloEnJ(px, J.y + 1, pz);
    Impacto.circulo(px, J.y, pz, r, dmg, { peso: 3, romperSombra: true }, A.toc);
    for (let i = 0; i < 36; i++) { const a = i / 36 * TAU; FX.emit(px + Math.cos(a) * .4, py + .1, pz + Math.sin(a) * .4, Math.cos(a) * r * 2.4, .6, Math.sin(a) * r * 2.4, .45, .3, 0xd8c8a8, .8); }
    FX.rafaga(px, py + .3, pz, 22, 3, .6, .25, Armas.ficha(armaId()).estela, 1);
    J.shake = Math.max(J.shake, 1.1); Sonido.sfx('aterrizar', { vol: 2 }); Mando.vibrar(1, .8, 260);
  }

  /* ---------- pulso de luz ---------- */
  function pulso() {
    const S = Sis.ST, P = C.pulso; S.luz -= P.coste; J.cdPulso = 1; J.pulsoT = 1; Sonido.sfx('pulso'); J.combate = 3;
    for (let i = 0; i < 48; i++) { const a = i / 48 * TAU; FX.emit(J.x + Math.cos(a) * .6, J.y + .5, J.z + Math.sin(a) * .6, Math.cos(a) * 12, .2, Math.sin(a) * 12, .9, .3, 0x9ffff0, .9); }
    FX.rafaga(J.x, J.y + 1, J.z, 24, 4, 1.2, .3, 0xfff0b0, 1);
    Impacto.pulso(J.x, J.z, P.radio, P.daño * Sis.dmgMult()); G.hazBloq = true; J.shake = .6;
  }

  /* ---------- daño recibido: esquiva, parada, guardia y reacciones ---------- */
  function recibir(e) {
    const S = Sis.ST; if (!J.vivo || Cin.activa) return;
    if (J.inv > 0 && !e.caida) {
      // esquiva precisa: el golpe llega al empezar la invulnerabilidad (J.inv baja desde dificultad().invul)
      if (J.rodando > 0 && !J.perfecta && dificultad().invul - J.inv < C.esquivaPrecisa.ventana) { J.perfecta = true; S.luz = Math.min(Sis.luzMax(), S.luz + C.esquivaPrecisa.luz); UI.aviso('¡Esquiva precisa!', 'conteo'); FX.rafaga(J.x, J.y + 1, J.z, 22, 4, .8, .25, 0xffe9a8, 1); Sonido.sfx('recoger'); }
      return;
    }
    // escudo de la escuela de luz: una parada más amplia que cuesta luz al acertar
    if (estiloDe() === EscuelaLuz && !e.caida && e.x !== undefined) {
      const d = EscuelaLuz.defender(e, S.luz); if (d.aviso) { UI.aviso(d.aviso, 'error'); Sonido.sfx('error'); }
      if (d.bloquea) { const dx = e.x - J.x, dz = e.z - J.z, l = Math.hypot(dx, dz) || 1; S.luz = Math.max(0, S.luz - d.gasta); parada(e, dx / l, dz / l, true); return; }
    }
    let dmg = e.caida ? e.dmg : e.dmg * dificultad().daño; const conDir = e.x !== undefined;
    const dx = conDir ? e.x - J.x : 0, dz = conDir ? e.z - J.z : 0, l = Math.hypot(dx, dz) || 1;
    const frontal = conDir && Math.abs(angDif(J.yaw, Math.atan2(dx, dz))) < C.guardia.arco / 2;
    if (J.guardia && frontal && !e.caida && !e.imparable) {
      if (J.paradaLista && J.guardiaT < dificultad().parada) { parada(e, dx / l, dz / l); return; }
      const coste = dmg * C.guardia.costeLuz;
      if (S.luz >= coste) {
        S.luz -= coste; dmg *= 1 - C.guardia.reduce; J.bloqueoT = 1; J.combate = 3;
        J.vx -= dx / l * C.guardia.empuje; J.vz -= dz / l * C.guardia.empuje; J.tambaleo = Math.max(J.tambaleo, C.guardia.aturdido);
        Sonido.sfx('bloqueo'); Mando.vibrar(.5, .4, 120); J.shake = Math.max(J.shake, .45); J.hitstop = Math.max(J.hitstop, .05);
        FX.rafaga(J.x + dx / l * .5, J.y + 1, J.z + dz / l * .5, 16, 3.5, .35, .14, 0xfff0c0, 1);
        if (dmg > .5) { S.hp -= dmg; J.sinDano = 0; FX.numero(String(Math.round(dmg)), J.x, J.y + 2, J.z, '#ffc0a8'); if (S.hp <= 0) morir(); }
        return;
      }
      // sin luz: la guardia se rompe
      S.luz = 0; J.guardia = false; J.tambaleo = C.rotura.aturdido; dmg *= C.rotura.daño;
      UI.aviso('¡Guardia rota! Te falta luz', 'error'); Sonido.sfx('rota');
    }
    S.hp -= dmg; J.herido = 1; J.sinDano = 0; J.shake = .8; J.combate = 3; UI.vineta(.9); Sonido.sfx('herido'); Mando.vibrar(.7, .5, 220); FX.numero(String(Math.round(dmg)), J.x, J.y + 2, J.z, '#ff8a7a');
    const fuerte = !e.caida && (e.derriba || dmg >= Sis.hpMax() * C.derribo.umbral);   // derriba: siempre (la embestida del Cazador)
    if (conDir) { const k = fuerte ? C.derribo.empuje : C.empujeGolpe; J.vx -= dx / l * k; J.vz -= dz / l * k; }
    if (fuerte && J.suelo && !J.nada) { J.derribo = .001; J.inv = Math.max(J.inv, C.derribo.dur * .85); J.perfecta = true; if (conDir) J.yaw = Math.atan2(dx, dz); Sonido.sfx('derribo'); }
    else if (!e.caida) J.tambaleo = Math.max(J.tambaleo || 0, C.tambaleo);
    J.atq = null; J.cargando = 0; J.guardia = false; J.planeo = false; Mov.reiniciar();
    if (S.hp <= 0) morir();
  }
  function parada(e, ux, uz, pagada) {
    const S = Sis.ST, P = C.parada;
    if (!pagada) S.luz = Math.min(Sis.luzMax(), S.luz + P.luz); J.paradaT = 1; J.contra = P.contra; J.paradaLista = false; J.combate = 3;
    J.hitstop = Math.max(J.hitstop, P.pausa); J.shake = Math.max(J.shake, .5); Sonido.sfx('parada'); Mando.vibrar(.4, .9, 120);
    FX.rafaga(J.x + ux * .55, J.y + 1.05, J.z + uz * .55, 34, 5, .5, .2, 0xfff2b0, 1); FX.numero('¡Parada!', J.x, J.y + 2.2, J.z, '#fff2b0');
    if (e.a) Fauna.desviar(e.a, P.aturdeAnimal, P.calma, ux, uz);
    if (e.s) Sombras.desviar(e.s, ux, uz);   // la Sombra rebota y queda aturdida
    if (e.esq) Sombras.devolver(e.esq);      // la esquirla vuelve a la lanzadora
    if (e.td) Duelo.parada();   // el corte de Tasogare, parado: se tambalea
    if (e.B) Jefes.parada(e.B, e);   // gasta su equilibrio y, si el ataque es interrumpible, lo hace tambalearse
    Bus.emit('parada', { a: e.a, B: e.B });
  }

  /* ---------- por fotograma, tras la cámara: marca del objetivo ---------- */
  function actualizar(dt) {
    for (const M of estilos()) M.actualizar(dt);
    if (!marca) return;
    marca.visible = !!obj && J.vivo && !Cin.activa;
    if (!marca.visible) return;
    marcaT += dt; posObj(obj, _p);
    const d = camera.position.distanceTo(_p), s = d * .055 * (1 + .25 * Math.max(0, 1 - marcaT * 4));
    marca.position.set(_p.x, _p.y + (obj.tipo === 'animal' ? (obj.ref.m.alto || .6) * obj.ref.esc * .6 + .35 : obj.tipo === 'sombra' ? .7 : 1.2), _p.z);
    marca.scale.set(s, s, 1); marca.material.rotation = marcaT * .8; marca.material.opacity = .75 + .25 * Math.sin(marcaT * 6);
    const hostil = obj.tipo === 'jefe' || obj.tipo === 'sombra' || obj.ref.prov || obj.ref.estado === 'agresivo' || obj.ref.estado === 'atacar';
    marca.material.color.setHex(J.contra > 0 ? 0xffffff : hostil ? 0xffb070 : 0xaffff0);
  }
  function reiniciar() { obj = null; J.atq = null; J.cargando = 0; J.guardia = false; J.derribo = 0; J.tambaleo = 0; J.bloqueoT = 0; J.contra = 0; J.bufAtq = 0; for (const M of estilos()) M.reiniciar(); ultimoEstilo = null; J.estilo = null; J.estiloVel = 1; J.estiloBloquea = false; }

  return {
    crear, entrada, orientar, camara, actualizar, recibir, reiniciar,
    get objetivo() { return obj ? obj.ref : null; }, get fijado() { return !!obj; },
    rumboObjetivo: () => (obj ? rumbo(obj) : null),
    _probar(tipo, n) { J.atq = null; J.combo = n || 0; empezar(tipo || 'combo'); }   // gancho de pruebas
  };
})();
Bus.on('dañoJugador', e => Combate.recibir(e));

/* ---------- haz de luz apuntado (acción de luz de Hikari) ---------- */
const Haz = (() => {
  const H = { on: false, o: new THREE.Vector3(), d: new THREE.Vector3(), t: 0 }, UP = new THREE.Vector3(0, 1, 0), _o = new THREE.Vector3(), _d = new THREE.Vector3(), _a = new THREE.Vector3(), _e = new THREE.Vector3(), _c = new THREE.Vector3();
  let nuc, glow, punta, mano, t = 0;
  H.crear = function () {
    const g = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true), add = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    nuc = new THREE.Mesh(g, add(0xfff6d8)); glow = new THREE.Mesh(g, add(0xffd27a)); glow.material.opacity = .28;
    punta = new Halo(0xfff0b0);
    mano = new Halo(0xfff0b0);
    for (const m of [nuc, glow, punta, mano]) { m.visible = false; m.frustumCulled = false; scene.add(m); }
  };
  H.actualizar = function (dt, J, activo) {
    if (!activo) { if (H.on) { H.on = false; for (const m of [nuc, glow, punta, mano]) m.visible = false; } return null; }
    if (!H.on) { H.on = true; Sonido.sfx('chispa'); }
    t += dt; camera.getWorldDirection(_d);
    const rc = Jefes.rayo(camera.position, _d, 75); _a.copy(camera.position).addScaledVector(_d, rc.t);
    _o.set(J.x + Math.sin(J.yaw) * .35, J.y + 1.15, J.z + Math.cos(J.yaw) * .35);
    _c.subVectors(_a, _o); let L = _c.length(); if (L < .5) { _c.copy(_d); L = 1; } _c.normalize();
    const hit = Jefes.rayo(_o, _c, Math.min(L + .5, 45)); _e.copy(_o).addScaledVector(_c, hit.t);
    J.yaw = Math.atan2(_c.x, _c.z);
    const len = Math.max(.2, hit.t), w = 1 + Math.sin(t * 30) * .15; H.o.copy(_o); H.d.copy(_c); H.t = len;
    for (const [m, r] of [[nuc, .06 * w], [glow, .2 * w]]) { m.visible = true; m.position.copy(_o).addScaledVector(_c, len / 2); m.quaternion.setFromUnitVectors(UP, _c); m.scale.set(r, len, r); }
    punta.visible = true; punta.position.copy(_e); const ps = (hit.s ? 2.4 : 1.3) * w; punta.scale.set(ps, ps, 1);
    mano.visible = true; mano.position.copy(_o); mano.scale.set(.9, .9, 1);
    if (Math.random() < dt * 40) FX.emit(_e.x, _e.y, _e.z, rnd(-2, 2), rnd(0, 3), rnd(-2, 2), .5, .25, hit.s ? 0xffe9a8 : 0xfff6d8, .9);
    Jefes.hazImpacto(hit, dt);
    return hit;
  };
  return H;
})();
