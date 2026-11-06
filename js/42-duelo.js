/* === Ecos de Luz · 42-duelo.js ===
   El duelo final contra Tasogare (rediseño de la historia, fase 21). Fase 1, en la plaza del faro: espada contra
   espada. Tasogare ronda a Hikari en guardia (de frente para sus golpes y a veces contraataca); ataca con cortes
   anunciados en rojo (un abanico en el suelo; de uno a tres seguidos), que se pueden parar, y con cargas (una línea roja
   en el suelo), que hay que esquivar. Es vulnerable al recuperarse de sus ataques, al ser parado (se tambalea), por la
   espalda y sin equilibrio (roto, de rodillas). Sin luz, se retira a lo alto de la espiral (aviso 'dueloFin'). Si Hikari
   cae o se aleja, se va y la espera. Entra en el combate por las mismas puertas que los demás (objetivo 'tasogare',
   golpear, parada con 'td', pulso, barra). Lo lanza un paso de misión con empieza: 'duelo'. Números en DUELO; textos en
   GUION.duelo. Arte: el modelo de 36-tasogare.js; las marcas, mallas planas aditivas. */
"use strict";

/* vida y equilibrio (máximo, cuánto gasta cada golpe según su peso, una parada, un pulso; recuperación por s tras espera;
   s roto); corte (aviso del primero y de los siguientes, s del golpe, alcance y arco, daño, cuántos seguidos como mucho);
   carga (aviso, velocidad, duración, ancho, daño); contraataque (probabilidad al bloquear, aviso, daño, espera mínima);
   rondar (distancia, velocidad, s entre ataques); s vulnerable al recuperarse y al tambalearse; la plaza (radios entre los
   que se mueve), a qué distancia del faro la ve llegar (entra) y a qué distancia la deja; radio de su cuerpo como blanco; colores de las marcas */
const DUELO = {
  vida: 650, eq: { max: 100, golpe: 7, peso: [0, .6, 1, 1.6], parada: 35, pulso: 18, recupera: 14, espera: 2, roto: 3, rotoMult: 1.5 },
  corte: { aviso: .9, avisoCombo: .7, dur: .44, impacto: .48, alcance: 3.4, arco: 1.9, daño: 14, combo: 3 },
  carga: { aviso: 1.1, vel: 9, dur: .6, ancho: 1.4, daño: 18 },
  contra: { prob: .35, aviso: .8, daño: 10, espera: 2.4 },
  rondar: { dist: [3.2, 4.5], vel: 2.3, cd: [1.5, 2.3], cargaDesde: 6.5 },
  recupera: 1.2, tambaleo: 1.3, entrada: 1.6,
  plaza: [9, 22], ve: 28, lejos: 40, radio: .7,
  color: { marca: 0xff3a24, borde: 0xffd8b0, filo: 0xff5a3a, brillo: .75 }
};

const Duelo = (() => {
  let D = DUELO, opciones = {}, perfil = null;
  let activo = false, fase = 'fuera', t = 0, x = 0, y = 0, z = 0, yaw = 0, vida = D.vida, eq = D.eq.max, eqT = 9, cd = 1.5, combo = 0, tContra = 0, golpeo = false, dirC = [0, 1];
  let sector = null, borde = null, linea = null, mat = null, matB = null, filo = null;
  const S0 = () => opciones.centro || sitio('faro');
  function marcas() {
    if (sector) return;
    // la marca se ve sobre la plaza teñida de rojo: relleno rojo intenso y un borde casi blanco
    const mb = c => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(D.color.brillo), transparent: true, opacity: 0, blending: THREE.NormalBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    mat = mb(D.color.marca); matB = mb(D.color.borde);
    const g1 = new THREE.CircleGeometry(1, 28, -Math.PI / 2 - D.corte.arco / 2, D.corte.arco); g1.rotateX(-Math.PI / 2); sector = new THREE.Mesh(g1, mat); sector.visible = false; sector.renderOrder = 2; scene.add(sector);
    const g3 = new THREE.RingGeometry(.93, 1, 28, 1, -Math.PI / 2 - D.corte.arco / 2, D.corte.arco); g3.rotateX(-Math.PI / 2); borde = new THREE.Mesh(g3, matB); sector.add(borde);
    const g2 = new THREE.PlaneGeometry(D.carga.ancho, 1); g2.rotateX(-Math.PI / 2); g2.translate(0, 0, .5); linea = new THREE.Mesh(g2, mat); linea.visible = false; linea.renderOrder = 2; scene.add(linea);
    filo = new Halo(D.color.filo, 0); filo.scale.set(1.2, 1.2, 1); scene.add(filo);
  }
  const suelo = (px, pz) => opciones.centro ? opciones.centro.y : sueloEnJ(px, Estr.yFaro + 6, pz);
  function colocar() { y = suelo(x, z); Tasogare.colocar(x, y, z, yaw); }
  function ocultarMarcas() { if (sector) { sector.visible = false; linea.visible = false; filo.opacidad = 0; } }
  /* ---------- empezar, esperar y retirarse ---------- */
  function empezar(op) { opciones = op || {}; activo = true; fase = 'espera'; marcas(); }
  function detener() { activo = false; fase = 'fuera'; ocultarMarcas(); Tasogare.caminar(0); Tasogare.mostrar(false); Sis.marcador(null); }
  function entrar(J) {
    perfil = opciones.perfil || ProgresionEnemiga.capturar('faro');
    D = { ...DUELO, vida: Math.round((opciones.vida || DUELO.vida) * perfil.vida), eq: { ...DUELO.eq, max: DUELO.eq.max * perfil.equilibrio },
      corte: { ...DUELO.corte, daño: DUELO.corte.daño * perfil.daño, combo: 1 + perfil.rango },
      carga: { ...DUELO.carga, daño: DUELO.carga.daño * perfil.daño }, contra: { ...DUELO.contra, daño: DUELO.contra.daño * perfil.daño }, plaza: opciones.centro ? [0, 12] : DUELO.plaza };
    const S = S0(), a = Math.atan2(J.x - S.x, J.z - S.z) + .5, r = clamp(Math.hypot(J.x - S.x, J.z - S.z) + 2, D.plaza[0] + 1, D.plaza[1] - 1);
    x = S.x + Math.sin(a) * r; z = S.z + Math.cos(a) * r; yaw = Math.atan2(J.x - x, J.z - z); vida = D.vida; eq = D.eq.max; cd = 1.5; combo = 0;
    fase = 'entrada'; t = 0; Tasogare.mostrar(true); Tasogare.hojaEntera(false); Tasogare.brillo(1); Tasogare.abrirAlas(opciones.practica ? 0 : 1); Tasogare.pose(opciones.practica ? 'guardia' : 'alzar', 0, true); colocar();
    if (opciones.practica) { Sonido.sfx('farol'); return; }
    for (let i = 0; i < 50; i++) FX.humo(x + rnd(-.8, .8), y + rnd(0, 2.6), z + rnd(-.8, .8), rnd(-.5, .5), rnd(.6, 1.6), rnd(-.5, .5), rnd(1.4, 2.4), rnd(.5, 1), 0x2e2228, .45);
    Sonido.sfx('trueno'); Sonido.sfx('cazadorGrito', { pos: { x, y: y + 2, z } }); UI.banner(GUION.duelo.nombre, GUION.duelo.sub, 'espada', 'mision'); J.shake = Math.max(J.shake || 0, .6);
  }
  function irse(motivo) {
    ocultarMarcas(); for (let i = 0; i < 40; i++) FX.humo(x + rnd(-.7, .7), y + rnd(0, 2.4), z + rnd(-.7, .7), rnd(-.4, .4), rnd(.9, 2), rnd(-.4, .4), rnd(1.4, 2.4), rnd(.5, .95), 0x2e2228, .4);
    FX.rafaga(x, y + 1.4, z, 30, 2.2, 1.4, .16, 0xff4a24, 1.4); Sonido.sfx('disolver', { pos: { x, y: y + 1, z } }); Tasogare.mostrar(false); Tasogare.abrirAlas(0);
    if (opciones.practica) { activo = false; fase = 'fuera'; Sis.marcador(null); Bus.emit('practica:resultado', { gano: motivo === 'vencido' }); }
    else if (motivo === 'vencido') { activo = false; fase = 'fuera'; Sis.marcador(null); UI.aviso(GUION.duelo.fin, 'mision'); Bus.emit('dueloFin'); } else fase = 'espera';
  }
  /* ---------- ataques ---------- */
  function avisarCorte(J, primero) {
    fase = 'aviso'; t = 0; golpeo = false; Tasogare.pose('alzar', 6); sector.visible = true; Sonido.sfx('sombraSalto', { pos: { x, y: y + 1, z } });
    sector.scale.setScalar(D.corte.alcance); mat.opacity = 0; combo += primero ? 0 : 1;
  }
  function avisarCarga(J) {
    fase = 'avisoCarga'; t = 0; golpeo = false; Tasogare.pose('guardia', 6); dirC = [J.x - x, J.z - z]; const l = Math.hypot(dirC[0], dirC[1]) || 1; dirC = [dirC[0] / l, dirC[1] / l]; yaw = Math.atan2(dirC[0], dirC[1]);
    linea.visible = true; linea.position.set(x, y + .08, z); linea.rotation.y = yaw; linea.scale.set(1, 1, D.carga.vel * D.carga.dur); mat.opacity = 0; Sonido.sfx('latido');
  }
  function cortar(J, contra) {
    fase = 'corte'; t = 0; golpeo = false; opciones.contraActual = contra; sector.visible = false; Tasogare.mezclar('alzar', 'corte', 0);
  }
  function impactoCorte(J) {
    golpeo = true; Sonido.sfx('corte', { peso: 3, pos: { x, y: y + 1, z } });
    FX.rafaga(x + Math.sin(yaw) * 1.6, y + 1.2, z + Math.cos(yaw) * 1.6, 18, 3, .5, .2, D.color.filo, 1.2);
    const dx = J.x - x, dz = J.z - z, d = Math.hypot(dx, dz);
    if (J.vivo && d < D.corte.alcance + .4 && Math.abs(J.y - y) < 2 && Math.abs(angDif(yaw, Math.atan2(dx, dz))) < D.corte.arco / 2) Bus.emit('dañoJugador', { dmg: opciones.contraActual ? D.contra.daño : D.corte.daño, x, z, td: true });
  }
  /* ---------- lo que le hacen a él ---------- */
  const guarda = () => fase === 'acechar' || fase === 'entrada';
  function golpear(o, alc, ang, dmg, op) {
    if (!activo || !Tasogare.visible || fase === 'espera' || fase === 'fuera') return 0;
    const dx = x - o.x, dz = z - o.z, d = Math.hypot(dx, dz) - D.radio; if (d > alc || Math.abs(o.y - y) > 2.4) return 0;
    if (Math.abs(angDif(o.yaw, Math.atan2(dx, dz))) > ang + .2 && d > .8) return 0;
    const Q = D.eq, peso = (op && op.peso) || 1, deFrente = Math.abs(angDif(yaw, Math.atan2(-dx, -dz))) < 1.9;
    if (guarda() && deFrente && peso < 3) {   // en guardia, de frente: para el golpe; a veces contraataca
      eq -= Q.golpe * Q.peso[peso] * .5; eqT = 0; FX.rafaga(x - dx * .3, y + 1.3, z - dz * .3, 12, 3, .3, .12, 0xfff0c0, 1); Sonido.sfx('bloqueo');
      if (tContra <= 0 && Math.random() < D.contra.prob) { fase = 'contra'; t = 0; tContra = D.contra.espera; Tasogare.pose('alzar', 10); sector.visible = true; sector.scale.setScalar(D.corte.alcance); mat.opacity = 0; }
      if (eq <= 0) romper(); return 1;
    }
    if (guarda() && deFrente) { fase = 'tambaleo'; t = 0; Tasogare.pose('recibir', 8); }   // un golpe pesado rompe la guardia
    const k = fase === 'roto' ? Q.rotoMult : 1; vida -= dmg * k; eq -= fase === 'roto' ? 0 : Q.golpe * Q.peso[peso] * (op && op.contra ? 1.5 : 1); eqT = 0;
    FX.numero(String(Math.round(dmg * k)), x, y + 2.7, z, fase === 'roto' ? '#fff2b0' : '#ffd0b0'); FX.rafaga(x, y + 1.4, z, 10, 2.4, .4, .14, 0xff6a3a, 1);
    if (vida <= 0) { irse('vencido'); return 1; }
    if (eq <= 0 && fase !== 'roto') romper();
    return 1;
  }
  function romper() { fase = 'roto'; t = 0; eq = 0; ocultarMarcas(); Tasogare.pose('rodillas', 6); Sonido.sfx('rota'); FX.numero(GUION.duelo.roto, x, y + 3, z, '#fff2b0'); }
  /* su corte, parado a tiempo: se tambalea y pierde equilibrio */
  function parada() {
    if (!activo) return; eq -= D.eq.parada; eqT = 0; ocultarMarcas(); combo = 0;
    if (eq <= 0) romper(); else { fase = 'tambaleo'; t = 0; Tasogare.pose('recibir', 8); }
  }
  function pulso(px, pz, r) {
    if (!activo || !Tasogare.visible || Math.hypot(x - px, z - pz) > r + D.radio) return;
    eq -= D.eq.pulso; eqT = 0; if (fase === 'aviso' || fase === 'avisoCarga' || fase === 'contra') { ocultarMarcas(); fase = 'tambaleo'; t = 0; Tasogare.pose('recibir', 8); }
    if (eq <= 0 && fase !== 'roto') romper();
  }
  /* ---------- por fotograma ---------- */
  function mover(J, dt, tx, tz, vel) {
    const S = S0(), dx = tx - x, dz = tz - z, d = Math.hypot(dx, dz); if (d < .05) return 0;
    const v = Math.min(vel * dt, d); let nx = x + dx / d * v, nz = z + dz / d * v;
    const r = Math.hypot(nx - S.x, nz - S.z); if (r > .001 && (r < D.plaza[0] || r > D.plaza[1])) { const rr = clamp(r, D.plaza[0], D.plaza[1]); nx = S.x + (nx - S.x) / r * rr; nz = S.z + (nz - S.z) / r * rr; }
    if (Sol.dentro(nx, suelo(nx, nz) + 1, nz, .3)) return 0;
    x = nx; z = nz; return v / dt;
  }
  function actualizar(dt, J) {
    if (!activo) return;
    const S = S0(), dJ = Math.hypot(J.x - S.x, J.z - S.z), vivo = J.vivo && !Cin.activa;
    if (fase === 'espera') { Sis.marcador({ txt: GUION.duelo.vuelve }); if (vivo && dJ < D.ve) entrar(J); return; }
    if (!J.vivo || dJ > D.lejos) { irse('lejos'); return; }
    t += dt; cd -= dt; tContra -= dt; eqT += dt; J.combate = Math.max(J.combate || 0, 3);
    if (fase !== 'roto' && eqT > D.eq.espera) eq = Math.min(D.eq.max, eq + D.eq.recupera * dt);
    const dx = J.x - x, dz = J.z - z, d = Math.hypot(dx, dz), haciaJ = Math.atan2(dx, dz); let vel = 0;
    Sis.marcador(null);
    switch (fase) {
      case 'entrada': if (t > D.entrada) { fase = 'acechar'; t = 0; Tasogare.pose('guardia', 4); Tasogare.abrirAlas(0); } yaw = angDamp(yaw, haciaJ, 4, dt); break;
      case 'acechar': {
        yaw = angDamp(yaw, haciaJ, 5, dt); const R = D.rondar, r = clamp(d, R.dist[0], R.dist[1]), a = Math.atan2(-dx, -dz) + .35;
        vel = mover(J, dt, J.x + Math.sin(a) * r, J.z + Math.cos(a) * r, R.vel);
        if (cd <= 0 && vivo) { cd = rnd(R.cd[0], R.cd[1]); combo = 0; if (d > R.cargaDesde) avisarCarga(J); else avisarCorte(J, true); }
        break;
      }
      case 'aviso': case 'contra': {
        const C = D.corte, av = fase === 'contra' ? D.contra.aviso : combo > 0 ? C.avisoCombo : C.aviso, k = Math.min(1, t / av);
        if (k < .6) { yaw = angDamp(yaw, haciaJ, 6, dt); if (d > 2.4) vel = mover(J, dt, J.x - dx / d * 2, J.z - dz / d * 2, D.rondar.vel * .8); }
        sector.position.set(x, suelo(x, z) + .1, z); sector.rotation.y = yaw; mat.opacity = .2 + .4 * k; matB.opacity = .4 + .6 * k;
        filo.position.copy(Tasogare.hueso('manoD').getWorldPosition(_v)); filo.opacidad = .9 * k;
        if (t >= av) cortar(J, fase === 'contra');
        break;
      }
      case 'corte':
        Tasogare.mezclar('alzar', 'corte', smooth(0, D.corte.impacto, t / D.corte.dur));
        if (!golpeo && t >= D.corte.dur * D.corte.impacto) impactoCorte(J);
        if (fase !== 'corte') break;
        filo.opacidad = Math.max(0, filo.opacidad - dt * 4);
        if (t > D.corte.dur) { if (combo + 1 < D.corte.combo && d < D.corte.alcance + 2) avisarCorte(J, false); else { fase = 'recupera'; t = 0; } }
        break;
      case 'avisoCarga': { const k = Math.min(1, t / D.carga.aviso); mat.opacity = .35 + .65 * k; if (t >= D.carga.aviso) { fase = 'carga'; t = 0; linea.visible = false; Tasogare.pose('corte', 10); Sonido.sfx('cazadorGrito', { pos: { x, y: y + 2, z } }); } break; }
      case 'carga':
        vel = mover(J, dt, x + dirC[0] * 5, z + dirC[1] * 5, D.carga.vel);
        if (!golpeo && J.vivo && Math.hypot(J.x - x, J.z - z) < D.carga.ancho * .5 + .6 && Math.abs(J.y - y) < 2) { golpeo = true; Bus.emit('dañoJugador', { dmg: D.carga.daño, x: x - dirC[0], z: z - dirC[1], td: true, imparable: true, derriba: true }); }
        if (Math.random() < dt * 60) FX.humo(x, y + rnd(.3, 2), z, -dirC[0] * 2, rnd(.2, .8), -dirC[1] * 2, rnd(.8, 1.4), rnd(.4, .8), 0x2e2228, .35);
        if (t > D.carga.dur) { fase = 'recupera'; t = 0; Tasogare.pose('guardia', 3); }
        break;
      case 'recupera': Tasogare.mezclar('corte', 'guardia', smooth(0, D.recupera, t)); if (t > D.recupera) { fase = 'acechar'; t = 0; Tasogare.pose('guardia', 5); } break;
      case 'tambaleo': if (t > D.tambaleo) { fase = 'acechar'; t = 0; Tasogare.pose('guardia', 4); cd = Math.max(cd, .6); } break;
      case 'roto': if (t > D.eq.roto) { fase = 'acechar'; t = 0; eq = D.eq.max; Tasogare.pose('guardia', 3); cd = .8; } break;
    }
    Tasogare.caminar(vel); colocar();
  }
  /* para fijar el objetivo y la cámara */
  function pos(out) { return out.set(x, y + 1.6, z); }
  const enPie = () => activo && Tasogare.visible && fase !== 'espera' && fase !== 'fuera';
  function barra(J) { if (!enPie() || Math.hypot(J.x - x, J.z - z) > 30) return null; return { jefe: true, nom: (opciones.practica ? 'Eco de Tasogare · práctica' : GUION.duelo.nombre + ' · ' + GUION.duelo.sub) + (fase === 'roto' ? ' · ' + GUION.duelo.roto : ''), estado: '', ani: Math.max(0, vida), aniMax: D.vida, eq: Math.max(0, eq) / D.eq.max }; }
  const _v = new THREE.Vector3();
  Bus.on('empieza:duelo', empezar);
  return { empezar, detener, actualizar, golpear, parada, pulso, pos, barra, enPie, get activo() { return activo; }, get fase() { return fase; }, get vida() { return vida; }, get eq() { return eq; }, get x() { return x; }, get z() { return z; },
    depurar: () => ({ fase, t, vida, vidaMax: D.vida, eq, eqMax: D.eq.max, combo, golpesMax: D.corte.combo, perfil, yaw, y, golpeo, practica: !!opciones.practica }) };
})();
