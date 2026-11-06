/* === Ecos de Luz · 38-cazadores.js ===
   Cazadores del Ocaso: serpientes-dragón de humo con un ojo rojo. La cabeza sigue en bucle una ruta suave (curva
   cerrada) por encima del terreno, ondulando, y deja una estela: cada segmento del cuerpo va sobre ella. Del ojo sale un
   haz rojo que barre el suelo. Si Hikari entra en el haz y nada la tapa (terreno, construcciones), pasa a alerta: el haz
   la sigue y la cabeza se gira hacia ella; si sigue viéndola, avisa (una marca roja en el suelo que la persigue) y se
   lanza en picado: si la alcanza la derriba y le quita motas (una parte cae al suelo y se puede recoger); se evita
   esquivando a tiempo o escondiéndose. Después vuelve a su ruta. Hikari se esconde en Hinode (sus faroles lo espantan),
   una cueva, un refugio (torii, casas), agachada junto a una roca, un árbol o un muro, o agachada y quieta con el farol
   de Tsuru. El de la pradera persigue a Hikari en la huida del inicio; una escena puede hacerlo salir (salir) y un
   combate invocar otro (invocar, la espiral del capítulo 5). Sale del humo y se deshace en él. Fichas en CAZADORES;
   números en CAZADOR.
   Arte sustituible: el cuerpo es una malla instanciada (una llamada de dibujo) con la tinta mate de las Sombras; la
   cabeza, otra malla; el ojo, un halo; el haz, un cono aditivo; su mancha y la marca del picado, discos en el suelo. */
"use strict";

/* cada Cazador: puntos de su ruta (x, z; se recorren en bucle), altura sobre el suelo (mínima y máxima, cambia despacio),
   velocidad (m/s) y desfase de su ondulación. La ruta evita Hinode (los faroles de la aldea protegen) y el faro */
const CAZADORES = [
  { id: 'pradera', nom: 'Gran Cazador de la Pradera', ruta: [[-25, 40], [-45, 15], [-72, 8], [-62, 35], [-40, 62]], alto: [11, 15], vel: 6.5, fase: 0 }
];
/* aspecto: cuántos segmentos y cada cuántos m, radio del cuello a la cola, ondulación de la cabeza (lado y alto en m,
   frecuencia), colores, ojo (color y tamaño del halo), haz (largo, radio al final, cuánto mira hacia abajo, cuánto barre a
   cada lado y a qué frecuencia, opacidad), humo por segundo y distancia a la que deja de moverse y dibujarse */
const CAZADOR = {
  segmentos: 30, paso: 1.25, radio: [1.6, .22], ondula: { lado: 1.6, alto: .8, frec: .45 },
  color: { cuerpo: 0x0a0910, lomo: 0x1c0b10, cuerno: 0x24222a },
  ojo: { color: 0xff3a24, tam: 3.2 }, haz: { largo: 30, radio: 6, baja: .7, barre: .6, frec: .35, opacidad: .1 },
  humo: 40, lejos: 220,
  /* salir del humo o deshacerse en él: s y humo por segundo */
  aparece: { dur: 1.6, humo: 120 },
  /* vista: s viéndola seguida para la alerta y s sin verla para volver a patrullar; cono (factor sobre el del haz) y
     alcance (factor sobre su largo); distancia a la que empieza el aviso del borde; segundos entre latidos (lejos y en
     alerta); radio de Hinode (sus faroles la protegen); cuánto gira la cabeza hacia ella (rad) y opacidad del haz en
     alerta; cobertura: agachada a menos de r m de una roca, un árbol o un muro de al menos 'alto' m */
  vista: { verTras: .3, perder: 1.6, cono: 1.1, alcance: 1.15, aviso: 75, latido: [3.5, 1.3], seguro: 40, giraCabeza: .9, hazAlerta: .24, cubre: { r: 1.2, alto: 1 } },
  /* embestida: s de alerta viéndola para lanzarse; s de aviso (la marca en el suelo); s del picado; cuántos m sigue de
     largo y a qué altura pasa sobre la marca; radio del golpe y daño (siempre derriba); velocidad de regreso a la ruta
     (factor de la suya); s sin poder volver a alertarse; radio de la marca; a cuántos m/s la persigue la marca (algo menos
     que correr: andando no se escapa; hay que esquivar a tiempo o esconderse) y en qué parte del picado deja de corregir */
  embestida: { tras: 1, aviso: .9, picado: 1.3, pasa: 10, bajo: 1.1, radio: 2.4, daño: 8, regreso: 2.2, calma: 6, marca: 2.6, sigue: 7, corrige: .45 },
  /* motas que quita: fracción de las que lleva (con mínimo y máximo), parte que cae al suelo y se puede recoger, en
     cuántas bolitas, cuántos s duran y a qué distancia se recogen */
  motas: { frac: .3, min: 5, max: 40, recupera: .5, bolas: 4, dura: 25, coger: 1.7 }
};

const Cazadores = (() => {
  const K = CAZADOR, lista = [], bolas = [];
  let matHaz = null, matMancha = null, matMarca = null, tLatido = 0, consejo = false;
  const _cols = [];
  const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _m = new THREE.Matrix4(), _d = new THREE.Vector3(), _z = new THREE.Vector3(0, 0, 1), _ab = new THREE.Vector3(0, -1, 0);
  const _y = new THREE.Vector3(0, 1, 0), _q2 = new THREE.Quaternion(), _o = new THREE.Vector3(), _v = new THREE.Vector3(), _t = new THREE.Vector3();
  const PASO_ESTELA = .3;   // m entre puntos de la estela de la cabeza

  /* ---------- arte ---------- */
  function geoSegmento() {   // un segmento del cuerpo (radio 1) con su aleta en el lomo
    return fusionar([pieza(new THREE.SphereGeometry(1, 10, 8), K.color.cuerpo, { sy: .85, sz: 1.55 }), pieza(new THREE.ConeGeometry(.2, .7, 4), K.color.lomo, { y: .85, z: -.3, rx: -.6 })]);
  }
  function geoCabeza() {     // cabeza alargada con mandíbula y dos cuernos hacia atrás; mira a +z
    const C = K.color, P = [pieza(new THREE.SphereGeometry(1, 12, 10), C.cuerpo, { sx: 1.3, sy: 1.0, sz: 2.2, z: .6 }), pieza(new THREE.BoxGeometry(1.5, .5, 2.4), C.lomo, { y: -.55, z: 1.2, rx: .12 })];
    for (const s of [-1, 1]) P.push(pieza(new THREE.ConeGeometry(.22, 2.2, 5), C.cuerno, { x: s * .6, y: .9, z: -.6, rx: -1.1, rz: s * .25 }));
    return fusionar(P);
  }
  function disco(mat) { const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, mat); m.renderOrder = 2; m.visible = false; scene.add(m); return m; }
  function crearUno(F) {
    const mat = Sombras.materialMate(), curva = new THREE.CatmullRomCurve3(F.ruta.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal');
    const cuerpo = new THREE.InstancedMesh(geoSegmento(), mat, K.segmentos); cuerpo.frustumCulled = false; cuerpo.castShadow = true; scene.add(cuerpo);
    const cabeza = new THREE.Mesh(geoCabeza(), mat); scene.add(cabeza);   // sin sombra: la del cuerpo basta (una llamada menos)
    const ojo = new Halo(K.ojo.color, .95); ojo.scale.set(K.ojo.tam, K.ojo.tam, 1); scene.add(ojo);
    matHaz = matHaz || new THREE.MeshBasicMaterial({ color: K.ojo.color, transparent: true, opacity: K.haz.opacidad, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const g = new THREE.ConeGeometry(K.haz.radio, K.haz.largo, 16, 1, true); g.translate(0, -K.haz.largo / 2, 0);   // el vértice en el ojo; se abre hacia -y
    const haz = new THREE.Mesh(g, matHaz.clone()); haz.frustumCulled = false; scene.add(haz);
    matMancha = matMancha || new THREE.MeshBasicMaterial({ map: TEX.halo, color: new THREE.Color(K.ojo.color).multiplyScalar(1.6), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    matMarca = matMarca || new THREE.MeshBasicMaterial({ color: new THREE.Color(K.ojo.color).multiplyScalar(4), transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const gr = new THREE.RingGeometry(.78, 1, 48); gr.rotateX(-Math.PI / 2); const marca = new THREE.Mesh(gr, matMarca); marca.renderOrder = 2; marca.visible = false; scene.add(marca);
    return { F, curva, L: curva.getLength(), u: Math.random(), t: 0, cuerpo, cabeza, ojo, haz, mancha: disco(matMancha), marca, k: 0, forzado: false, cerca: false,
      estela: null, cab: new THREE.Vector3(), foco: null, estado: 'patrulla', tVer: 0, tPerder: 0, tEst: 0, calma: 0, giro: 0, objetivo: new THREE.Vector3(), picado: null, golpeo: false };
  }
  function crear() { for (const F of CAZADORES) lista.push(crearUno(F)); }

  /* ---------- ruta, estela y cuerpo ---------- */
  /* el punto de la ruta en u (con la ondulación y la altura sobre el suelo) */
  function puntoRuta(c, u, t, out) {
    const O = K.ondula, p = c.curva.getPointAt(u, out), tg = c.curva.getTangentAt(u, _d), ph = t * O.frec * TAU + c.F.fase, lado = Math.sin(ph) * O.lado;
    p.x += -tg.z * lado; p.z += tg.x * lado;
    const a = c.F.alto, h = lerp(a[0], a[1], .5 + .5 * Math.sin(t * .07 + c.F.fase));
    p.y = Math.max(altura(p.x, p.z), NIVEL_AGUA) + h + Math.sin(ph * .8 + 1) * O.alto;
    return p;
  }
  /* la estela empieza detrás de la cabeza, sobre la propia ruta (al aparecer cerca) */
  function iniciarEstela(c) {
    c.estela = []; puntoRuta(c, c.u, c.t, c.cab); const largo = K.segmentos * K.paso + 2, n = Math.ceil(largo / PASO_ESTELA);
    for (let i = 1; i <= n; i++) { const u = ((c.u - i * PASO_ESTELA / c.L) % 1 + 1) % 1; c.estela.push(puntoRuta(c, u, c.t - i * PASO_ESTELA / c.F.vel, new THREE.Vector3())); }
  }
  function grabarEstela(c) {
    const E = c.estela; if (c.cab.distanceTo(E[0]) < PASO_ESTELA) return;
    const viejo = E.pop(); E.unshift(viejo.copy(c.cab));   // reusa el último punto (sin crear objetos)
  }
  /* punto a 'd' m por detrás de la cabeza a lo largo de la estela */
  function enEstela(c, d, out) {
    let a = c.cab, resto = d;
    for (const b of c.estela) { const l = a.distanceTo(b); if (l >= resto) return out.copy(a).lerp(b, l > 0 ? resto / l : 0); resto -= l; a = b; }
    return out.copy(a);
  }
  const pos = []; for (let i = 0; i <= 31; i++) pos.push(new THREE.Vector3());
  function colocarCuerpo(c, dt) {
    for (let i = 0; i <= K.segmentos; i++) enEstela(c, (i + .7) * K.paso, pos[i]);
    for (let i = 0; i < K.segmentos; i++) {
      const a = pos[i], b = pos[i + 1], r = lerp(K.radio[0], K.radio[1], Math.pow(i / (K.segmentos - 1), .8)) * (c.k < 1 ? Math.max(.001, smooth(0, 1, c.k * 1.6 - i / K.segmentos * .6)) : 1);   // sale del humo de la cabeza a la cola
      _d.subVectors(a, b); if (_d.lengthSq() < 1e-8) _d.set(0, 0, 1); _d.normalize(); _q.setFromUnitVectors(_z, _d); _s.set(r, r, Math.max(r, K.paso * .45)); _m.compose(a, _q, _s); c.cuerpo.setMatrixAt(i, _m);   // los segmentos finos se alargan: la cola no se rompe en cuentas
    }
    c.cuerpo.instanceMatrix.needsUpdate = true;
    for (let n = Math.floor(dt * (K.humo + (c.k < 1 ? K.aparece.humo : 0)) + Math.random()); n > 0; n--) { const i = rndi(0, K.segmentos - 1), p = pos[i], r = lerp(K.radio[0], K.radio[1], i / K.segmentos); FX.humo(p.x + rnd(-r, r) * .6, p.y + rnd(-r, r) * .5, p.z + rnd(-r, r) * .6, rnd(-.3, .3), rnd(.2, .7), rnd(-.3, .3), rnd(1.4, 2.4), r * rnd(.9, 1.4), 0x140c10, .32); }
  }

  /* ---------- movimiento de la cabeza: patrulla, aviso, picado y regreso ---------- */
  function moverCabeza(c, dt) {
    const B = K.embestida; c.t += dt; c.tEst += dt;
    const lenta = c.estado === 'aviso' ? .3 : 1; c.u = (c.u + c.F.vel * lenta * dt / c.L) % 1;
    if (c.estado === 'picado') {
      const k = Math.min(1, c.tEst / B.picado), e = k * k * (3 - 2 * k); if (k < B.corrige) curvaPicado(c); c.picado.getPointAt(e, c.cab);
      if (k >= 1) { c.estado = 'regreso'; c.tEst = 0; c.marca.visible = false; }
    } else if (c.estado === 'regreso') {
      const p = puntoRuta(c, c.u, c.t, _t), d = c.cab.distanceTo(p), v = c.F.vel * B.regreso * dt;
      if (d <= v || d < 1) { c.cab.copy(p); c.estado = 'patrulla'; c.calma = B.calma; c.tVer = 0; } else c.cab.addScaledVector(p.sub(c.cab), v / d);
    } else puntoRuta(c, c.u, c.t, c.cab);
  }
  /* el picado: de la cabeza a la marca (pasa a poca altura) y sigue de largo, subiendo; mientras la marca la persigue, la
     curva se rehace hacia ella (la dirección de entrada no cambia) */
  function curvaPicado(c) {
    const B = K.embestida, T = c.objetivo, d = c.dPicado, P = c.picado.points;
    P[1].set(T.x - d.x * 3, T.y + B.bajo + 2, T.z - d.z * 3); P[2].set(T.x, T.y + B.bajo, T.z); P[3].set(T.x + d.x * B.pasa, T.y + B.pasa * .6, T.z + d.z * B.pasa);
    c.picado.needsUpdate = true;
  }
  function lanzarse(c) {
    const T = c.objetivo, hx = T.x - c.cab.x, hz = T.z - c.cab.z, l = Math.hypot(hx, hz) || 1;
    c.dPicado = (c.dPicado || new THREE.Vector3()).set(hx / l, 0, hz / l);
    c.picado = new THREE.CatmullRomCurve3([c.cab.clone(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], false, 'centripetal'); curvaPicado(c);
    c.estado = 'picado'; c.tEst = 0; c.golpeo = false; Sonido.sfx('cazadorGrito', { pos: { x: c.cab.x, y: c.cab.y, z: c.cab.z } });
  }
  /* la marca la persigue (sin pasar de B.sigue m/s) mientras no esté escondida */
  function perseguir(c, dt, J, oculta) {
    if (oculta) return;
    const T = c.objetivo, dx = J.x - T.x, dz = J.z - T.z, d = Math.hypot(dx, dz), v = Math.min(d, K.embestida.sigue * dt);
    if (d > 1e-3) { T.x += dx / d * v; T.z += dz / d * v; }
    T.y = Math.max(altura(T.x, T.z), NIVEL_AGUA); if (Math.hypot(J.x - T.x, J.z - T.z) < 1) T.y = Math.max(T.y, J.y);   // sobre lo que pise (un puente, el muelle)
    c.marca.position.set(T.x, T.y + .45, T.z);
  }
  /* un Cazador con mira en su ficha (el invocado en la espiral) barre ese sitio: un punto que gira y sube y baja */
  const _m2 = new THREE.Vector3();
  function miraFicha(c) { const M = c.F.mira; return _m2.set(M.x + Math.sin(c.t * .45) * M.radio, M.y + Math.sin(c.t * .31) * M.alto, M.z + Math.cos(c.t * .45) * M.radio); }
  function mover(c, dt, J) {
    if (!c.estela) iniciarEstela(c);
    moverCabeza(c, dt); grabarEstela(c);
    colocarCuerpo(c, dt);
    // la cabeza, mirando hacia donde va; en alerta y en el aviso se gira hacia Hikari o la marca
    const V = K.vista, H = K.haz; enEstela(c, .6, _v); _d.subVectors(c.cab, _v); if (_d.lengthSq() < 1e-8) _d.set(0, 0, 1); _d.normalize();
    c.cabeza.position.copy(c.cab); c.cabeza.quaternion.setFromUnitVectors(_z, _d); c.cabeza.scale.setScalar(Math.max(.001, smooth(0, .5, c.k)));
    const mira = c.estado === 'alerta' && J ? _t.set(J.x, J.y, J.z) : c.estado === 'aviso' ? c.objetivo : c.F.mira ? miraFicha(c) : null, base = Math.atan2(_d.x, _d.z);
    c.giro = damp(c.giro, mira ? clamp(angDif(base, Math.atan2(mira.x - c.cab.x, mira.z - c.cab.z)), -V.giraCabeza, V.giraCabeza) : 0, 3, dt);
    c.cabeza.quaternion.premultiply(_q2.setFromAxisAngle(_y, c.giro));
    // el ojo y el haz: barre el suelo; en alerta la sigue; en el aviso apunta a la marca; en el picado y el regreso, apagado
    c.ojo.position.set(0, .35, 2.4).applyQuaternion(c.cabeza.quaternion).add(c.cabeza.position); c.ojo.opacidad = (.8 + .15 * Math.sin(c.t * 4)) * smooth(.2, .6, c.k);
    const yaw = base + c.giro + Math.sin(c.t * H.frec * TAU) * H.barre, dir = _p.set(Math.sin(yaw) * Math.cos(H.baja), -Math.sin(H.baja), Math.cos(yaw) * Math.cos(H.baja));
    if (mira) { dir.set(mira.x - c.ojo.position.x, mira.y + .8 - c.ojo.position.y, mira.z - c.ojo.position.z).normalize(); if (dir.y > -.15) { dir.y = -.15; dir.normalize(); } }
    const fuerte = c.estado === 'alerta', apagado = c.estado === 'picado' || c.estado === 'regreso' || c.estado === 'aviso' || c.k < 1;   // en el aviso manda la marca; al salir del humo, aún no mira
    c.dir = (c.dir || new THREE.Vector3()).copy(dir); c.haz.material.opacity = damp(c.haz.material.opacity, apagado ? 0 : fuerte ? V.hazAlerta : H.opacidad, 4, dt);
    c.ojo.scale.setScalar(K.ojo.tam * (fuerte || apagado ? 1.5 : 1)); c.haz.position.copy(c.ojo.position); c.haz.quaternion.setFromUnitVectors(_ab, dir);
    // la mancha: donde el haz toca el suelo (lo que ve)
    let hit = null; if (!apagado) for (let s = 2; s <= H.largo; s += 1) { const x = c.ojo.position.x + dir.x * s, y = c.ojo.position.y + dir.y * s, z = c.ojo.position.z + dir.z * s, sy = Math.max(altura(x, z), NIVEL_AGUA); if (y <= sy) { hit = { x, y: sy, z, s }; break; } }
    c.mancha.visible = !!hit; if (hit) { const rr = H.radio * hit.s / H.largo * 2.2; c.mancha.position.set(hit.x, hit.y + .15, hit.z); c.mancha.scale.set(rr, 1, rr); }
    c.foco = hit;
    // la marca del picado late en el suelo
    // la marca del picado: un anillo que se cierra hasta el golpe
    if (c.marca.visible) { const B = K.embestida, e = B.marca * (c.estado === 'aviso' ? lerp(2.4, 1, Math.min(1, c.tEst / B.aviso)) : 1 + .1 * Math.sin(c.t * 18)); c.marca.scale.set(e, 1, e); }
  }

  /* ---------- ver, esconderse y embestir ---------- */
  /* ¿Hikari está escondida, y dónde? En Hinode ('aldea': sus faroles la protegen), en una cueva, en un refugio (torii,
     casas), agachada junto a una roca, un árbol o un muro ('cubierta') o agachada y quieta con el farol de Tsuru (su brasa
     la envuelve). Si no, '' */
  function escondida(J) {
    const A = sitio('aldea'); if (Math.hypot(J.x - A.x, J.z - A.z) < K.vista.seguro) return 'aldea';
    if (enCueva(J.x, J.y + 1, J.z)) return 'cueva'; if (Estr.enRefugio(J.x, J.z)) return 'refugio';
    if (!J.agachado) return '';
    if (Sis.tiene('farol') > 0 && Math.hypot(J.vx || 0, J.vz || 0) < .6) return 'farol';
    return aCubierto(J) ? 'cubierta' : '';
  }
  function aCubierto(J) {
    const C = K.vista.cubre;
    for (const q of Flora.colisionadores(J.x, J.z, C.r, _cols)) if (q.y1 - J.y >= C.alto && Math.hypot(q.x - J.x, q.z - J.z) < q.r + C.r) return true;
    return Sol.cubre(J.x, J.z, C.r, J.y, C.alto);
  }
  /* ¿el Cazador la ve? Dentro del cono del haz y de su alcance, y sin terreno ni construcciones entre el ojo y ella */
  function ve(c, J) {
    const H = K.haz, V = K.vista, e = c.ojo.position; _o.set(J.x - e.x, J.y + .8 - e.y, J.z - e.z); const d = _o.length();
    if (d > H.largo * V.alcance || d < .1) return false;
    if (_o.dot(c.dir) / d < Math.cos(Math.atan(H.radio / H.largo) * V.cono)) return false;
    for (let i = 1; i < 12; i++) { const t = i / 12 * .94; _v.copy(e).addScaledVector(_o, t); if (_v.y < altura(_v.x, _v.z) || Sol.dentro(_v.x, _v.y, _v.z, 0)) return false; }
    return true;
  }
  function vigilar(c, dt, J, oculta) {
    const V = K.vista, B = K.embestida; c.calma = Math.max(0, c.calma - dt);
    if (c.estado === 'patrulla') {
      const la = c.calma <= 0 && !oculta && ve(c, J); c.tVer = la ? c.tVer + dt : 0;
      if (c.tVer >= V.verTras) { c.estado = 'alerta'; c.tEst = 0; c.tPerder = 0; Sonido.sfx('cazadorGrito', { pos: { x: c.cab.x, y: c.cab.y, z: c.cab.z } }); Bus.emit('cazadorVe', { id: c.F.id }); if (!consejo) { consejo = true; UI.aviso(GUION.huida.consejo, 'mision'); } }
    } else if (oculta === 'aldea' && (c.estado === 'alerta' || c.estado === 'aviso')) {   // los faroles de Hinode lo espantan: se aparta
      c.estado = 'regreso'; c.tEst = 0; c.marca.visible = false; Sonido.sfx('cazadorGrito', { pos: { x: c.cab.x, y: c.cab.y, z: c.cab.z } });
      Bus.emit('cazadorPierde', { id: c.F.id, por: 'aldea' }); UI.aviso(GUION.huida.aldea, 'mision');
    } else if (c.estado === 'alerta') {
      const la = !oculta && ve(c, J); c.tPerder = la ? 0 : c.tPerder + dt;
      if (c.tPerder >= V.perder) { c.estado = 'patrulla'; c.tVer = 0; Bus.emit('cazadorPierde', { id: c.F.id }); }
      else if (la && c.tEst >= B.tras) {   // se lanza: marca roja donde está Hikari
        c.estado = 'aviso'; c.tEst = 0; c.objetivo.set(J.x, Math.max(altura(J.x, J.z), NIVEL_AGUA, J.y), J.z);
        c.marca.position.set(c.objetivo.x, c.objetivo.y + .45, c.objetivo.z); c.marca.visible = true; Sonido.sfx('avisoAtaque');   // la marca, por encima de la hierba
      }
    } else if (c.estado === 'aviso') { perseguir(c, dt, J, oculta); if (c.tEst >= B.aviso) lanzarse(c); }
    else if (c.estado === 'picado' && !c.golpeo && J.vivo) {   // ¿la alcanza?
      if (c.tEst < B.picado * B.corrige) perseguir(c, dt, J, oculta);
      if (c.cab.distanceTo(_v.set(J.x, J.y + .7, J.z)) < B.radio && !oculta) { c.golpeo = true; alcanzar(c, J); }
    }
  }
  /* la alcanza: la derriba (poco daño) y le quita motas; una parte cae al suelo y se puede recoger */
  function alcanzar(c, J) {
    if (Piloto.reintentarHuida(c)) return;
    const S = Sis.ST, M = K.motas, hp = S.hp;
    Bus.emit('dañoJugador', { dmg: K.embestida.daño * (c.perfil ? c.perfil.daño : 1), x: c.cab.x, z: c.cab.z, imparable: true, derriba: true });
    if (S.hp >= hp) return;   // la esquivó a tiempo
    const n = Math.min(S.motas || 0, clamp(Math.round((S.motas || 0) * M.frac), M.min, M.max)); if (n <= 0) return;
    S.motas -= n; Bus.emit('motas', { n: -n, total: S.motas }); Bus.emit('motasPerdidas', { n, id: c.F.id });
    const queda = Math.round(n * M.recupera), k = Math.min(M.bolas, queda);
    for (let i = 0; i < k; i++) { const a = i / k * TAU + rnd(-.4, .4), r = rnd(2.3, 3.6), x = J.x + Math.cos(a) * r, z = J.z + Math.sin(a) * r, h = new Halo(LLAMAS.color, .9); h.scale.set(.7, .7, 1); scene.add(h);
      bolas.push({ h, x, y: Math.max(altura(x, z), NIVEL_AGUA) + .6, z, n: Math.floor(queda / k) + (i < queda % k ? 1 : 0), t: 0 }); }
    // el resto se lo lleva el Cazador: chispas que suben hacia su cabeza
    for (let i = 0; i < 24; i++) FX.emit(J.x, J.y + 1, J.z, (c.cab.x - J.x) * rnd(.3, .6), (c.cab.y - J.y) * rnd(.3, .6), (c.cab.z - J.z) * rnd(.3, .6), 1.2, .2, LLAMAS.color, .9);
  }
  function moverBolas(dt, J) {
    const M = K.motas;
    for (let i = bolas.length - 1; i >= 0; i--) {
      const b = bolas[i]; b.t += dt; b.h.position.set(b.x, b.y + Math.sin(b.t * 3 + i) * .15, b.z); b.h.opacidad = .9 * Math.min(1, (M.dura - b.t) / 3);
      if (J && J.vivo && Math.hypot(J.x - b.x, J.z - b.z) < M.coger && Math.abs(J.y + .8 - b.y) < 2) { Sis.rescatar(b.n); Sonido.sfx('recoger'); FX.rafaga(b.x, b.y, b.z, 10, 2, .5, .18, LLAMAS.color, 1.5); scene.remove(b.h); bolas.splice(i, 1); }
      else if (b.t > M.dura) { scene.remove(b.h); bolas.splice(i, 1); }
    }
  }
  /* ¿patrulla? El de la pradera, durante la huida del inicio (hasta llegar a Hinode); los demás solo cuando los pide
     una escena ('forzado') o un combate los invoca (F.temporal, la espiral) */
  function activo(c) {
    const S = Sis.ST;
    return c.forzado || c.F.temporal || c.F.id === 'pradera' && S.inicio.huida && !S.inicio.hinode;
  }
  /* una escena lo hace salir del humo: en su ruta, a unos d m de (x, z); devuelve su cabeza (se mueve). Con x null, lo suelta */
  function salir(id, x, z, d) {
    const c = lista.find(o => o.F.id === id); if (x === null) { c.forzado = false; return c.cab; }
    let mejor = 0, err = 1e9; for (let i = 0; i < 96; i++) { const p = c.curva.getPointAt(i / 96, _p), e = Math.abs(Math.hypot(p.x - x, p.z - z) - d); if (e < err) { err = e; mejor = i / 96; } }
    c.u = mejor; c.estela = null; c.k = 0; c.forzado = true; c.estado = 'patrulla'; c.tVer = 0; puntoRuta(c, c.u, c.t, c.cab); return c.cab;
  }
  /* un Cazador invocado (temporal: una escena o un duelo lo pide y lo retira); con soloMira barre pero no vigila */
  function invocar(F) { const c = crearUno(Object.assign({ temporal: true }, F)); lista.push(c); return c; }
  function retirar(id) {
    const i = lista.findIndex(c => c.F.id === id); if (i < 0) return; const c = lista[i]; mostrar(c, false);
    for (const o of [c.cuerpo, c.cabeza, c.ojo, c.haz, c.mancha, c.marca]) scene.remove(o); lista.splice(i, 1);
  }
  function mostrar(c, v) { c.cuerpo.visible = c.cabeza.visible = c.haz.visible = v; c.ojo.visible = v; if (!v) { c.mancha.visible = false; c.marca.visible = false; } }
  function actualizar(dt, J) {
    const cp = camera.position, V = K.vista, jugando = J && J.vivo && !Cin.activa, oculta = jugando ? escondida(J) : ''; let cerca0 = null, dMin = 1e9, alerta = false;
    for (const c of lista) {
      const obj = activo(c) ? 1 : 0;
      // cada encuentro captura la potencia de la región (el daño de su embestida)
      if (obj && !c.perfil) { const origen = c.curva.getPointAt(c.u, _p); c.perfil = ProgresionEnemiga.capturar(ProgresionEnemiga.region(origen.x, origen.z)); }
      if (!obj && c.k <= 0) { c.perfil = null; if (c.cerca) { c.cerca = false; mostrar(c, false); c.estela = null; c.estado = 'patrulla'; } continue; }
      // lejos de la cámara solo avanza por su ruta (sin moverse el cuerpo ni dibujarse); al volver, la estela se rehace
      const h = c.estado === 'patrulla' ? c.curva.getPointAt(c.u, _p) : c.cab, cerca = Math.hypot(h.x - cp.x, h.z - cp.z) < K.lejos;
      if (cerca !== c.cerca) { c.cerca = cerca; mostrar(c, cerca); if (!cerca) { c.estela = null; c.estado = 'patrulla'; c.tVer = 0; } }
      // sale del humo o se deshace en él (lejos, sin transición); si no puede vigilar (escena, Hikari caída, se retira), se aparta
      if (!cerca) c.k = obj; else { const k0 = c.k; c.k = clamp(c.k + (obj ? dt : -dt) / K.aparece.dur, 0, 1); if (obj && k0 < .3 && c.k >= .3) Sonido.sfx('cazadorGrito', { pos: { x: c.cab.x, y: c.cab.y, z: c.cab.z } }); }
      if ((!jugando || !obj) && (c.estado === 'alerta' || c.estado === 'aviso')) { c.estado = 'regreso'; c.tEst = 0; c.marca.visible = false; }
      if (cerca) { mover(c, dt, jugando ? J : null); if (jugando && obj && c.k >= 1 && !c.F.soloMira) { vigilar(c, dt, J, oculta); const d = c.cab.distanceTo(_v.set(J.x, J.y, J.z)); if (d < dMin) { dMin = d; cerca0 = c; } alerta = alerta || c.estado === 'alerta' || c.estado === 'aviso' || c.estado === 'picado'; } }
      else { c.t += dt; c.u = (c.u + c.F.vel * dt / c.L) % 1; }
    }
    moverBolas(dt, jugando ? J : null);
    // Aviso visual y presencia del Cazador: un aire que sale de su cabeza, más seguido cuanto más cerca
    const k = cerca0 ? smooth(V.aviso, 18, dMin) : 0;
    if (k > 0) { _p.copy(cerca0.cabeza.position).project(camera); let x = _p.x, y = _p.y; if (_p.z > 1) { x = -x; y = -y; } UI.bordeCazador(x, y, k, alerta, oculta); }
    else UI.bordeCazador(0, 0, 0, false, false);
    tLatido -= dt; if (k > .15 && tLatido <= 0) {
      Sonido.sfx('acecho', { pos: { x: cerca0.cab.x, y: cerca0.cab.y, z: cerca0.cab.z } });
      tLatido = lerp(V.latido[0], V.latido[1], alerta ? 1 : k * .5);
    }
  }
  return { crear, actualizar, lista, escondida, salir, invocar, retirar, get bolas() { return bolas; } };
})();
