/* === Ecos de Luz · 17-hikari.js ===
   Hikari: malla continua con esqueleto (skinning) generada por código, capa y cintas de
   tela, katana, alas de luz y aura. Animación procedural:
   · Locomoción con pies apoyados (IK de dos huesos): cada pie se planta en el suelo real,
     la zancada y la cadencia dependen de la velocidad y la cadera se ajusta a la pendiente.
   · Brazos acoplados a las piernas, torsión del tronco, inclinación por aceleración y en las
     curvas, amortiguación al aterrizar, respiración y cabeza que mira hacia la cámara.
   · Poses por estado (aire, planeo, nado, deslizar, trepar, aupar, esquiva, ataque…) que se
     mezclan suavemente con la locomoción. */
"use strict";

/* Luz de personaje: relleno suave y contraluz en el mismo programa, sin luces ni pases adicionales.
   Cada identidad conserva su paleta; Tasogare usa un perfil oscuro y los habitantes uno cálido. */
const ASPECTO_PERSONAJES = {
  hikari: { relleno: .24, borde: .28, color: [.72, .86, 1], exponente: 3.1 },
  habitante: { relleno: .16, borde: .18, color: [1, .82, .6], exponente: 3 },
  ocaso: { relleno: .025, borde: .14, color: [1, .16, .07], exponente: 3.2 },
  tunica: 0xe5dfcf, ribete: 0xf4d99b
};

const Hikari = (() => {
  /* ---------- datos ---------- */
  const COL = HIKARI_DISENO.color;
  // esqueleto en reposo: nombre, padre, posición local (el personaje mira a +Z; +X es su izquierda)
  const HUESOS = [
    ['cadera', -1, 0, .58, 0], ['columna', 0, 0, .07, 0], ['pecho', 1, 0, .13, 0], ['cuello', 2, 0, .135, -.005], ['cabeza', 3, 0, .065, .005],
    ['hombroI', 2, .045, .1, -.005], ['brazoI', 5, .08, -.01, 0], ['antebrazoI', 6, 0, -.19, 0], ['manoI', 7, 0, -.17, 0],
    ['hombroD', 2, -.045, .1, -.005], ['brazoD', 9, -.08, -.01, 0], ['antebrazoD', 10, 0, -.19, 0], ['manoD', 11, 0, -.17, 0],
    ['musloI', 0, .072, -.03, 0], ['piernaI', 13, 0, -.25, 0], ['pieI', 14, 0, -.24, 0], ['dedosI', 15, 0, -.045, .085],
    ['musloD', 0, -.072, -.03, 0], ['piernaD', 17, 0, -.25, 0], ['pieD', 18, 0, -.24, 0], ['dedosD', 19, 0, -.045, .085]
  ];
  const H = {}; HUESOS.forEach((h, i) => H[h[0]] = i);
  const L1 = .25, L2 = .24, TOBILLO = .06, CADERA = .58;
  /* aleteo de la capa: fuerza y rapidez en reposo y lo que suman por cada m/s de velocidad */
  // arco: cuánto se adelantan los bordes del anclaje (m); curva: empuje hacia atrás del centro en cada iteración (m),
  // que mantiene la sección en U a lo largo; torso: semiejes de la elipse con la que choca (ancho y fondo, m)
  /* llamas (vidas) en la capa: fila de la tela, columnas, separación de la tela (m) y tamaño del brillo */
  const LLAMAS_CAPA = { columna: HIKARI_DISENO.llamas.columna, filas: HIKARI_DISENO.llamas.filas, fuera: .008 };
  /* grieta de la máscara: trazo en zigzag sobre el lado derecho (puntos x, y sobre la máscara, en orden de aparición), una
     rama, grosor y color */
  const GRIETA = { trazo: [[-.012, 1.115], [0, 1.098], [.014, 1.082], [.006, 1.066], [.022, 1.052], [.03, 1.028], [.02, 1.012], [.034, .992]], rama: [[.006, 1.066], [-.012, 1.058], [-.02, 1.046]], ancho: .0035, color: 0x241a1a };
  const FAROL_HIKARI = { escala: .62, pos: [.15, -.03, .06] };   // el farol de Tsuru en su cintura (izquierda): tamaño y sitio en la cadera
  const CAPA = { viento: .55, vientoVel: .26, frec: 1.7, frecVel: .32, arco: .065, curva: .0025, torso: [.16, .105],
    largo: HIKARI_DISENO.capa.largo, anchoArriba: HIKARI_DISENO.capa.arriba, anchoAbajo: HIKARI_DISENO.capa.abajo, anchoVuelo: HIKARI_DISENO.capa.vuelo, caida: .16, diagonales: .22, relleno: .1,
    separa: .014, mov: .035, extra: 4, hz: 120, iter: 4, maxSub: 6, estira: 1.03,   // tela estable: paso fijo de 1/120 s, 4 pasadas por paso, 6 pasos como mucho por fotograma, tope de estiramiento del 3 %
    despliegue: 5, flotacion: .025, giroCabeza: .035, giroTronco: .025, conservarAncho: .1 };
  /* marcha: largo de cada paso = base + k·v (m); el pie toca el suelo como mucho 'apoyo' metros de recorrido
     del cuerpo (lo que permite la pierna); el resto de la zancada es vuelo. Altura del paso y separación de los pies.
     trote: entre v[0] y v[1] m/s la marcha pasa a trote, adaptada a andar a 2,4 y correr a 4,2 m/s.
     Al trotar, el pie sube más (alza, m), los codos se doblan (codo, rad), los brazos
     se mecen más (brazo), el cuerpo se inclina algo más (inclina, rad) y bota más (bote, m) */
  const MARCHA = { pasoBase: .365, pasoK: .164, apoyo: .5, apoyoMin: .1, apoyoMax: .62, alzaMin: .05, alzaMax: .14, ancho: .085, vMin: .35, bajaMax: .13,
    libera: { dist: .24, torsion: .7, lateral: .025, extension: .9, velCiclo: 2.2, pivote: 2.1, dur: .18, durPivote: .1 },   // liberar el apoyo: m de su sitio de descanso, rad de giro del cuerpo desde que se plantó (40°), m mínimos a su lado, fracción de pierna extendida, velocidad bajo la cual manda la distancia, giro del pivote (120°) y duración de la recolocación y del pivote (s)
    trote: { v: [1.9, 5.2], alza: .135, codo: 1, brazo: .13, inclina: .045, bote: .032 } };

  function crearMalla() { return ModeloHikari.crear(H); }

  /* material: color por vértice, rugosidad y brillo por vértice (aMat) y líneas que brillan con la luz. borde: luz de
     contorno (Hikari, un ser de luz, se separa del fondo; los habitantes, que comparten el material, no la llevan) */
  const uBrillo = { value: 1 }, BORDE = { fuerza: ASPECTO_PERSONAJES.hikari.borde };
  function material(borde, brillo, perfil) {   // todos los perfiles comparten programa; solo cambian uniformes
    const A = perfil || ASPECTO_PERSONAJES.habitante;
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, skinning: true, roughness: 1, metalness: 0 });
    const uBorde = { value: borde !== undefined ? borde : A.borde }, uRelleno = { value: A.relleno },
      uColorBorde = { value: new THREE.Vector3(...A.color) }, uExpBorde = { value: A.exponente };
    const uLuz = brillo || (A === ASPECTO_PERSONAJES.hikari ? uBrillo : { value: 1 });
    m.onBeforeCompile = sh => {
      Atmosfera.inyectar(sh); sh.uniforms.uBrillo = uLuz; sh.uniforms.uBorde = uBorde;
      Object.assign(sh.uniforms, { uRelleno, uColorBorde, uExpBorde });
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aMat; varying vec2 vMat;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMat = aMat;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uBrillo, uBorde, uRelleno, uExpBorde; uniform vec3 uColorBorde; varying vec2 vMat;')
        .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vMat.x;')
        .replace('#include <emissivemap_fragment>', `float contornoP = pow(1. - abs(dot(normal, normalize(vViewPosition))), uExpBorde);
totalEmissiveRadiance += vColor*(vMat.y*uBrillo + uRelleno*uBrillo) + uColorBorde*contornoP*uBorde*uBrillo;`);
    };
    m.customProgramCacheKey = () => 'hikari';
    return m;
  }

  /* ---------- objetos de la escena ---------- */
  const R = new THREE.Group(), B = [];
  let malla, orejas, capa, cintas = [], alas = [], aura, marcasLlama = [], nLlamas = 3;
  // arma: modelo en la mano derecha, funda y estela (modelos y trayectorias en 20-armas.js)
  let armaId, armaMano = null, armaFunda = null, estela = null, wArma = 0, wIzq = 0, poseLista = false;
  const MONTA = { q: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 + .15, 0, 0)), p: new THREE.Vector3(0, -.045, .01) };
  MONTA.qi = MONTA.q.clone().invert();
  const POLO = { D: new THREE.Vector3(-.45, -.55, -.7).normalize(), I: new THREE.Vector3(.45, -.55, -.7).normalize() };   // hacia dónde apuntan los codos

  function crear() {
    const geo = crearMalla();
    for (const h of HUESOS) { const b = new THREE.Bone(); b.name = h[0]; b.position.set(h[2], h[3], h[4]); B.push(b); }
    HUESOS.forEach((h, i) => { if (h[1] >= 0) B[h[1]].add(B[i]); });
    const matHikari = material(BORDE.fuerza, null, ASPECTO_PERSONAJES.hikari); matHikari.map = ModeloHikari.atlas();
    malla = new THREE.SkinnedMesh(geo, matHikari); malla.name = 'Hikari_cuerpo'; R.name = 'Hikari'; malla.add(B[0]); malla.bind(new THREE.Skeleton(B));
    malla.castShadow = true; malla.receiveShadow = true; malla.frustumCulled = false; R.add(malla);
    crearGrieta();
    const hb = n => B[H[n]];
    montar(null);
    const precompila = Armas.modelo('katana'); precompila.visible = false; R.add(precompila);   // compila el material de las armas durante la carga
    // orejas de kitsune (máscara equipada)
    orejas = new THREE.Group();
    for (const s of [-1, 1]) orejas.add(new THREE.Mesh(fusionar([pieza(new THREE.ConeGeometry(.04, .13, 4), COL.mascara, { x: s * .07, y: .12, z: .01, rz: -s * .25 }), pieza(new THREE.ConeGeometry(.02, .08, 4), COL.oro, { x: s * .07, y: .115, z: .028, rz: -s * .25 })]), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .4 })));
    orejas.visible = false; hb('cabeza').add(orejas);
    // alas de luz (planeo)
    for (const s of [-1, 1]) {
      const g = new THREE.BufferGeometry(), pos = [], col = [], idx = [], N = 7;
      for (let i = 0; i <= N; i++) { const t = i / N, a = t * 1.25; pos.push(0, 0, 0, Math.cos(a) * 1.0 * (.5 + t * .55), Math.sin(a) * .35 - t * .25, 0); const c1 = new THREE.Color(0xffe8a8).lerp(new THREE.Color(0x5ff2e0), t); col.push(1, .9, .6, c1.r * 2, c1.g * 2, c1.b * 2); if (i < N) { const b = i * 2; idx.push(b, b + 1, b + 3, b, b + 3, b + 2); } }
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      m.position.set(s * .05, .08, -.08); m.scale.x = s; hb('pecho').add(m); alas.push(m);
    }
    aura = new Halo(0x9ffff0, .16); aura.scale.set(1.6, 1.6, 1); hb('pecho').add(aura);
    // capa y cintas (tela simulada en el mundo)
    const cc = COL.capa.map(h => lin(h));
    capa = new Tela(HIKARI_DISENO.capa.cols, HIKARI_DISENO.capa.filas, CAPA.largo, CAPA.anchoArriba, CAPA.anchoAbajo, (u, v) => {
      const c = v < .55 ? cc[0].clone().lerp(cc[1], v / .55) : cc[1].clone().lerp(cc[2], (v - .55) / .45);
      if (v > .91 || u < .035 || u > .965) c.lerp(lin(HIKARI_DISENO.ribete), .95);
      else if (v > .85) c.lerp(lin(COL.oro), .45);
      return c.multiplyScalar(.95 + .05 * Math.cos(u * TAU * 3));
    }, { emissive: 0x3a1020, emissiveIntensity: .3, roughness: .92 }, { caida: CAPA.caida, diagonales: CAPA.diagonales, relleno: CAPA.relleno, hz: CAPA.hz, iter: CAPA.iter, maxSub: CAPA.maxSub, estira: CAPA.estira, mov: CAPA.mov, extra: CAPA.extra });
    scene.add(capa.mesh);
    capa.mesh.name = 'Hikari_capa';
    const geoLlama = ModeloHikari.llama(), matLlama = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
    marcasLlama = LLAMAS_CAPA.filas.map((j,k) => { const h = new THREE.Mesh(geoLlama, matLlama); h.name = 'Llama_' + (k+1); h.scale.set(HIKARI_DISENO.llamas.ancho, HIKARI_DISENO.llamas.alto, 1); scene.add(h); return h; });
    for (let s = 0; s < 2; s++) { const t = new Tela(3, 12, .61, .02, .012, (u, v) => lin(COL.linea).multiplyScalar(1.15 - v * .4), { emissive: 0x1a6a62, emissiveIntensity: .65 }); t.mesh.name = 'Cinta_' + s; scene.add(t.mesh); cintas.push(t); }
    scene.add(R);
    return R;
  }
  /* cambia el arma: modelo en la mano, funda en la cadera o la espalda y estela con el color del arma */
  const liberar = o => o.traverse(m => { if (m.isMesh) { m.geometry.dispose(); m.material.dispose(); } });
  function montar(id) {
    const hb = n => B[H[n]], F = Armas.ficha(id);
    if (armaMano) { armaMano.parent.remove(armaMano); liberar(armaMano); }
    if (armaFunda) { armaFunda.parent.remove(armaFunda); liberar(armaFunda); armaFunda = null; }
    if (estela) { scene.remove(estela.mesh); estela.liberar(); }
    armaId = id; armaMano = Armas.modelo(id); armaMano.position.copy(MONTA.p); armaMano.quaternion.copy(MONTA.q); armaMano.visible = false; hb('manoD').add(armaMano);
    if (id && F.funda) { const f = F.funda; armaFunda = Armas.funda(id); armaFunda.position.fromArray(f.pos); armaFunda.rotation.fromArray(f.rot); armaFunda.traverse(m => { if (m.isMesh) m.castShadow = true; }); hb(f.hueso).add(armaFunda); }
    estela = new Armas.Estela(F.estela); scene.add(estela.mesh);
  }
  function equipar(id, mascara) { if ((id || null) !== armaId) montar(id || null); orejas.visible = !!mascara; }

  /* ---------- estado de la animación ---------- */
  const P = { hipY: 0, hipX: 0, lean: 0, roll: 0, twist: 0, pyaw: 0, spine: 0, head: 0, headY: 0, aL: [0, .1, .2], aR: [0, .1, .2], lL: [0, 0], lR: [0, 0], wIK: 0 };
  const pies = [0, 1].map(i => ({ lado: i ? -1 : 1, pos: new THREE.Vector3(), desde: new THREE.Vector3(), hacia: new THREE.Vector3(), t: 1, dur: .2, aire: false, pPrev: 0, y0: 0 }));
  let fase = 0, tt = 0, alaV = 0, listo = false, velPrev = 0, acel = 0, yawPrev = 0, giroV = 0, bob = 0, bobV = 0, sueloPrev = true, miraY = 0;
  // pose del arma: objetivo (PO, de Armas.pose) y suavizada (PS), en el espacio del cuerpo
  const PO = { G: new THREE.Vector3(), D: new THREE.Vector3(), F: new THREE.Vector3() }, PS = { G: new THREE.Vector3(), D: new THREE.Vector3(0, .5, .8), F: new THREE.Vector3(0, -.8, .5), izq: 0, dos: false };
  const _qW = new THREE.Quaternion(), _qH = new THREE.Quaternion(), _qP = new THREE.Quaternion(), _q4 = new THREE.Quaternion(), _X = new THREE.Vector3(), _Y = new THREE.Vector3(), _Z = new THREE.Vector3(), _g = new THREE.Vector3(), _h = new THREE.Vector3();
  const ultimo = new THREE.Vector3();
  const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), _f = new THREE.Vector3(), _s = new THREE.Vector3();
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion(), _e = new THREE.Euler();
  const qIK = [[new THREE.Quaternion(), new THREE.Quaternion(), new THREE.Quaternion()], [new THREE.Quaternion(), new THREE.Quaternion(), new THREE.Quaternion()]];
  const suelo = (x, y, z) => { const h = sueloEnJ(x, y + .6, z); return h > -1e8 ? h : y; };

  /* posición de descanso de un pie (en el suelo, a un lado del cuerpo) */
  function descanso(i, out) {
    const yaw = R.rotation.y, l = pies[i].lado * MARCHA.ancho;
    out.set(R.position.x + Math.cos(yaw) * l, 0, R.position.z - Math.sin(yaw) * l);
    out.y = suelo(out.x, R.position.y, out.z); return out;
  }
  function empezarPaso(pie, dur) { pie.aire = true; pie.t = 0; pie.dur = dur; pie.desde.set(pie.pos.x - R.position.x, 0, pie.pos.z - R.position.z); pie.y0 = pie.pos.y; }
  let bajaCadera = 0;
  function reiniciarPies() { bajaCadera = 0; for (let i = 0; i < 2; i++) { descanso(i, pies[i].pos); pies[i].aire = false; pies[i].t = 1; pies[i].recoloca = false; pies[i].yawApoyo = R.rotation.y; } ultimo.copy(R.position); }

  /* base ortonormal → cuaternión (columnas X, Y, Z) */
  function cuat(out, X, Y, Z) { _m.makeBasis(X, Y, Z); return out.setFromRotationMatrix(_m); }
  /* IK de la pierna i hacia el tobillo objetivo (mundo): deja en qIK[i] muslo, pierna y pie (locales) */
  function ikPierna(i, tobillo, normal, cabeceo) {
    const s = i ? 'D' : 'I', cad = B[H.cadera], muslo = B[H['muslo' + s]], pierna = B[H['pierna' + s]];
    _a.copy(tobillo); cad.worldToLocal(_a);                       // objetivo en el espacio de la cadera
    _d.subVectors(_a, muslo.position); let d = _d.length(); const dmax = (L1 + L2) * .995;
    if (d > dmax) { _d.multiplyScalar(dmax / d); d = dmax; } if (d < .08) { _d.set(0, -.08, 0); d = .08; }
    _d.normalize();
    _f.set(.12 * pies[i].lado, 0, 1); _s.crossVectors(_d, _f);
    if (_s.lengthSq() < 1e-6) { if (pies[i].planoS) _s.copy(pies[i].planoS); else _s.set(1, 0, 0); } else { _s.normalize(); pies[i].planoS = (pies[i].planoS || new THREE.Vector3()).copy(_s); }   // con el objetivo alineado con el frente, el plano de la rodilla es el anterior
    _f.crossVectors(_s, _d).normalize(); // rodilla hacia delante
    const al = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    _b.copy(_d).multiplyScalar(Math.cos(al)).addScaledVector(_f, Math.sin(al));   // dirección del muslo
    _c.copy(muslo.position).addScaledVector(_b, L1);                               // rodilla
    const dirP = _w.subVectors(muslo.position, _c).addScaledVector(_d, d).normalize(); // de la rodilla al tobillo
    const Y1 = _b.clone().negate(), Z1 = _f.clone().addScaledVector(_b, -_f.dot(_b)).normalize(), X1 = new THREE.Vector3().crossVectors(Y1, Z1);
    cuat(qIK[i][0], X1, Y1, Z1);
    const Y2 = dirP.clone().negate(), Z2 = _f.clone().addScaledVector(dirP, -_f.dot(dirP)).normalize(), X2 = new THREE.Vector3().crossVectors(Y2, Z2);
    cuat(_q, X2, Y2, Z2); qIK[i][1].copy(qIK[i][0]).invert().multiply(_q);
    // pie: plano sobre el suelo (normal) mirando hacia donde mira el cuerpo, con cabeceo del paso
    cad.getWorldQuaternion(_q2); _q3.copy(_q2).multiply(_q);                        // orientación mundial de la pierna
    const yaw = R.rotation.y; _f.set(Math.sin(yaw), 0, Math.cos(yaw)); _f.addScaledVector(normal, -_f.dot(normal)).normalize();
    _s.crossVectors(normal, _f).normalize(); cuat(_q, _s, normal, _f);
    if (cabeceo) { _q2.setFromAxisAngle(_s, cabeceo); _q.premultiply(_q2); }
    qIK[i][2].copy(_q3).invert().multiply(_q);
  }
  /* IK del brazo s ('I' o 'D'): la muñeca a 'muneca' (mundo) con el codo hacia POLO y la mano orientada como qMano (mundo).
     Marcos: Y a lo largo del hueso (hacia el hombro) y X como bisagra del codo; w mezcla con la pose actual */
  function brazo(s, muneca, qMano, w) {
    const hombro = B[H['hombro' + s]], sup = B[H['brazo' + s]], inf = B[H['antebrazo' + s]], mano = B[H['mano' + s]];
    const L1 = inf.position.length(), L2 = mano.position.length();
    hombro.getWorldQuaternion(_qP);
    _a.copy(muneca); hombro.worldToLocal(_a);
    _d.subVectors(_a, sup.position); let d = _d.length(); d = clamp(d, .06, (L1 + L2) * .999); _d.normalize();
    _f.copy(POLO[s]).addScaledVector(_d, -POLO[s].dot(_d)); if (_f.lengthSq() < 1e-6) _f.set(0, -1, 0).addScaledVector(_d, -_d.y); _f.normalize();
    const al = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    _b.copy(_d).multiplyScalar(Math.cos(al)).addScaledVector(_f, Math.sin(al));            // brazo
    _c.copy(_d).multiplyScalar(d).addScaledVector(_b, -L1).normalize();                     // antebrazo
    _Y.copy(_b).negate(); _Z.copy(_d).multiplyScalar(Math.sin(al)).addScaledVector(_f, -Math.cos(al)); _Z.addScaledVector(_Y, -_Z.dot(_Y)).normalize(); _X.crossVectors(_Y, _Z);
    cuat(_q, _X, _Y, _Z);
    _Y.copy(_c).negate(); _Z.crossVectors(_X, _Y); cuat(_q2, _X, _Y, _Z);
    _q3.copy(_q).invert().multiply(_q2);
    sup.quaternion.slerp(_q, w); inf.quaternion.slerp(_q3, w);
    _q4.copy(_qP).multiply(_q2).invert().multiply(qMano); mano.quaternion.slerp(_q4, w);
  }
  /* coloca las manos en el arma: la derecha en la empuñadura y, a dos manos, la izquierda más arriba o abajo del mango */
  function brazosArma(dt) {
    R.updateMatrixWorld(true);
    _g.copy(PS.G); R.localToWorld(_g);
    _Y.copy(PS.D).applyQuaternion(R.quaternion); _Z.copy(PS.F).applyQuaternion(R.quaternion); _X.crossVectors(_Y, _Z);
    cuat(_qW, _X, _Y, _Z); _qH.copy(_qW).multiply(MONTA.qi);                 // orientación de la mano para que el arma quede así
    const dir = _h.copy(_Y);
    _w.copy(MONTA.p).applyQuaternion(_qH); _v.copy(_g).sub(_w);
    brazo('D', _v, _qH, wArma);
    wIzq = damp(wIzq, PS.dos ? 1 : 0, 12, dt);
    if (wIzq * wArma > .01) { _v.copy(_g).addScaledVector(dir, PS.izq).sub(_w); brazo('I', _v, _qH, wArma * wIzq); }
  }
  function normalSuelo(x, y, z, out) {
    const h = suelo(x, y, z), hx = suelo(x + .15, y, z), hz = suelo(x, y, z + .15);
    return out.set(h - hx, .15, h - hz).normalize();
  }

  /* ---------- animación: S es el estado del jugador ---------- */
  function animar(dt, S) {
    dt = Math.min(dt, .05); tt += dt;
    const vx = S.vx || 0, vz = S.vz || 0, vel = S.vel || Math.hypot(vx, vz), TR = MARCHA.trote, kTrote = smooth(TR.v[0], TR.v[1], vel);
    if (!listo || R.position.distanceTo(ultimo) > 1.6) { reiniciarPies(); listo = true; }
    ultimo.copy(R.position);
    // aceleración (hacia delante) y giro, suavizados
    acel = damp(acel, clamp((vel - velPrev) / Math.max(dt, 1e-3), -40, 40), 6, dt); velPrev = vel;
    giroV = damp(giroV, angDif(yawPrev, R.rotation.y) / Math.max(dt, 1e-3), 8, dt); yawPrev = R.rotation.y;
    const locom = S.suelo && !S.nada && !S.planeo && !(S.rodando > 0) && !S.trepa && !S.aupa && !S.desliza && !(S.derribo > 0);
    // amortiguación al aterrizar
    if (S.suelo && !sueloPrev && (S.impacto || 0) > 3) bobV -= Math.min(S.impacto, 22) * .055;
    sueloPrev = !!S.suelo;
    bobV += (-bob * 140 - bobV * 18) * dt; bob += bobV * dt;

    const T = { hipY: 0, hipX: 0, lean: 0, roll: 0, twist: 0, pyaw: 0, spine: Math.sin(tt * 1.6) * .02, head: 0, headY: 0, aL: [Math.sin(tt * 1.5) * .04, .12, .22], aR: [Math.sin(tt * 1.5 + 1) * .04, .12, .22], lL: [0, .02], lR: [0, .02] };
    let rate = 12;
    if (locom) {
      // inclinación por velocidad y aceleración; peralte en las curvas; vaivén en reposo
      T.lean = .05 + .2 * smooth(.5, 7.6, vel) + TR.inclina * kTrote + clamp(acel * .012, -.2, .25);
      T.roll = clamp(-giroV * vel * .028, -.38, .38);
      T.twist = clamp(-giroV * CAPA.giroTronco, -.18, .18);
      T.headY = clamp(giroV * CAPA.giroCabeza, -.3, .3);
      if (vel < .3) { T.hipX = Math.sin(tt * .45) * .012; T.roll += Math.sin(tt * .45) * .03; }
      if (S.derrape) { T.lean = -.35; T.hipY -= .1; }
      if (S.agachado) { T.hipY -= .2; T.lean += .4; T.head = -.25; }
    }
    if (!S.suelo && !S.nada && !S.planeo && !S.trepa) {
      if (S.vy > 1) { T.lL = [.6, 1.0]; T.lR = [-.2, .4]; T.aL = [2.2, .55, .3]; T.aR = [2.0, .5, .3]; T.lean = .12; T.hipY = .02; }
      else { T.lL = [.3, .45]; T.lR = [.05, .6]; T.aL = [.3, 1.0, .35]; T.aR = [.35, 1.05, .35]; T.lean = .1 + clamp(-S.vy * .012, 0, .25); }
      rate = 9;
    }
    if (S.planeo) { const flota = Math.sin(tt * 1.8); T.lean = 1.18; T.aL = [.3 + flota * .035, 1.4, .12]; T.aR = [.3 - flota * .035, 1.4, .12]; T.lL = [-.3, .2]; T.lR = [-.4, .16]; T.head = -.5; T.roll = -clamp(S.giro, -1, 1) * .55; T.hipY = .1 + flota * CAPA.flotacion; T.spine = flota * .025; rate = 7; }
    if (S.nada) { const nf = Math.sin(tt * 5.5 * (.4 + vel * .25)); T.lean = vel > .3 ? 1.15 : .15; T.aL = [nf * 1.4 + .6, .35, .3]; T.aR = [-nf * 1.4 + .6, .35, .3]; T.lL = [Math.sin(tt * 9) * .35, .2]; T.lR = [-Math.sin(tt * 9) * .35, .2]; T.hipY = -.15; T.head = -.35; }
    if (S.desliza) { T.lean = -.42; T.hipY = -.24; T.lL = [1.25, .25]; T.lR = [.45, 1.75]; T.aL = [.6, 1.1, .4]; T.aR = [.3, .8, .3]; T.head = .3; T.twist = .25; rate = 14; }
    if (S.trepa) { const c = Math.sin(tt * 5.5 * clamp(S.trepaVel || 0, .15, 1)); T.lean = -.08; T.aL = [2.75 + c * .35, .3, .5 - c * .4]; T.aR = [2.75 - c * .35, .3, .5 + c * .4]; T.lL = [.9 - c * .5, 1.1 - c * .4]; T.lR = [.9 + c * .5, 1.1 + c * .4]; T.head = .35; T.hipY = -.04; rate = 14; }
    if (S.aupa) { const k = clamp(S.aupa, 0, 1); T.aL = [lerp(2.6, .5, k), .35, lerp(.4, 1.6, k)]; T.aR = [lerp(2.6, .5, k), .35, lerp(.4, 1.6, k)]; T.lL = [lerp(.8, 1.4, k), lerp(1.2, 1.9, k)]; T.lR = [lerp(.3, .6, k), lerp(.6, 1.2, k)]; T.lean = lerp(.1, .5, k); rate = 18; }
    if (S.recoger > 0) { const k = Math.sin(S.recoger * Math.PI); T.lean += .5 * k; T.aR = [1.1 * k, .1, .5 * k]; T.hipY -= .13 * k; T.lL[0] += .5 * k; T.lR[0] += .5 * k; T.lL[1] += .9 * k; T.lR[1] += .9 * k; }
    if (S.acariciar > 0) { const k = Math.min(1, S.acariciar * 4); T.hipY -= .24 * k; T.lean += .35 * k; T.aR = [1.2 * k, .15, .5 + Math.sin(tt * 7) * .3 * k]; T.head = -.2; }
    if (S.herido > 0) { const k = Math.sin(clamp(S.herido, 0, 1) * Math.PI); T.lean -= .6 * k; T.aL = [-.5 * k, 1.1 * k, .6]; T.aR = [-.4 * k, 1.1 * k, .6]; T.head = .3 * k; rate = 20; }
    if (S.pulso > 0) { const k = Math.sin(clamp(S.pulso, 0, 1) * Math.PI); T.aL = [.2, 1.6 * k, .2]; T.aR = [.2, 1.6 * k, .2]; T.lean -= .2 * k; T.head = .35 * k; T.hipY += .06 * k; rate = 16; }
    if (S.rodando > 0) { const k = S.rodando; T.lean = k * TAU; T.hipY = -.26; T.aL = [1.3, .2, 1.4]; T.aR = [1.3, .2, 1.4]; T.lL = [1.6, 2.2]; T.lR = [1.6, 2.2]; T.head = -.6; rate = 40; }
    // derribo: cae de espaldas, queda en el suelo y se levanta
    if (S.derribo > 0) {
      const p = S.derribo, cae = smooth(0, .22, p), lev = smooth(.6, 1, p), k = cae * (1 - lev), sube = Math.sin(lev * Math.PI);
      T.lean = lerp(T.lean, -1.3, k) + .75 * sube; T.hipY = lerp(T.hipY, -.44, k) - .2 * sube; T.roll = 0;
      T.lL = [lerp(.2, 1.2, k) + .9 * sube, lerp(.1, .7, k) + 1.4 * sube]; T.lR = [lerp(.2, .8, k) + .7 * sube, lerp(.1, 1.3, k) + 1.2 * sube];
      T.aL = [lerp(.3, -.5, k) + .8 * sube, .2 + 1.1 * k, .4]; T.aR = [lerp(.3, -.4, k) + .8 * sube, .2 + 1.0 * k, .5]; T.head = .45 * k - .3 * sube; rate = 13;
    }
    // ---------- pose del arma: trayectoria del golpe, carga, guardia o reposo ----------
    const desenv = !!S.armaFuera;
    let gArma = null, fArma = 0, modo = 'listo';
    if (S.golpe) { gArma = S.golpe; fArma = S.fGolpe; rate = 30; }
    else if (S.carga > 0 && S.cargaG) { gArma = S.cargaG; fArma = S.cargaG.t[0] * Math.min(1, S.carga) * .98; }
    else if (S.guardia || S.parada > 0) modo = 'guardia';
    else if (S.estilo) modo = 'apunta';
    Armas.pose(armaId, gArma, fArma, modo, PO);
    if (S.parada > 0) PO.D.applyAxisAngle(_Y.set(0, 1, 0), Math.sin(S.parada * Math.PI) * .7);   // parada: la hoja desvía hacia fuera
    const kp = PO.exacto || !poseLista ? 1 : 1 - Math.exp(-(gArma ? 22 : 14) * dt); poseLista = true;
    PS.G.lerp(PO.G, kp); PS.D.lerp(PO.D, kp).normalize(); PS.F.lerp(PO.F, kp); PS.F.addScaledVector(PS.D, -PS.F.dot(PS.D)).normalize(); PS.izq = PO.izq; PS.dos = PO.dos;
    const usaArma = desenv && !(S.rodando > 0) && !S.nada && !S.planeo && !S.trepa && !S.aupa && !S.haz && !S.canal && !S.hablando && !(S.recoger > 0) && !(S.acariciar > 0) && !(S.derribo > 0) && !(S.pulso > .2);
    wArma = damp(wArma, usaArma ? 1 : 0, usaArma ? 16 : 10, dt);
    if (wArma > .01) {
      T.twist = lerp(T.twist, PO.giro, wArma); T.lean += PO.inclina * wArma; T.hipY -= PO.baja * wArma;
      if (S.guardia) { T.lean += .08 * wArma; T.hipY -= .05 * wArma; }
      if (S.bloqueo > 0) { T.lean -= .3 * S.bloqueo; T.hipY -= .06 * S.bloqueo; }
      if (!S.golpe) T.aL = [.35, .45, .9];   // a una mano: el brazo libre equilibra
      // arco: el brazo libre tensa la cuerda hacia el pecho mientras se apunta
      if (S.estilo && S.estilo.nombre.indexOf('arco') === 0) { const tira = S.estilo.nombre === 'arco_apunta' ? S.estilo.k : S.estilo.nombre === 'arco_tensado' ? 1 : 0; T.aL = [1.5 - .75 * tira, .3, .5]; }
    }
    if (S.hablando) { T.aR = [.5 + Math.sin(tt * 2.2) * .12, .35, .8]; T.head = Math.sin(tt * 1.4) * .08; }
    if (S.haz) { T.aR = [1.6, .08, .05]; T.twist = -.12; }
    if (S.canal) { T.aR = [1.15, .45, .5]; T.aL = [1.15, .45, .5]; T.lean += .1; }
    // tiende la mano (cinemáticas; 0…1): el brazo derecho al frente y la mirada hacia arriba
    if (S.tender > 0) { const k = S.tender; T.aR = [lerp(T.aR[0], 1.3, k), lerp(T.aR[1], .08, k), lerp(T.aR[2], .15, k)]; T.head = lerp(T.head, -.4, k); }
    const brazosLibres = wArma < .5 && !S.haz && !S.canal && !S.hablando && !(S.recoger > 0) && !(S.acariciar > 0) && !(S.herido > 0) && !(S.pulso > 0) && !(S.derribo > 0) && !(S.tender > 0);
    // la cabeza mira hacia donde mira la cámara cuando está quieta (o al objetivo fijado)
    if (S.objetivo !== undefined && S.objetivo !== null) T.headY = clamp(angDif(R.rotation.y, S.objetivo), -.9, .9);
    else if (S.mira !== undefined && vel < 1.5 && !S.golpe) {
      miraY = damp(miraY, clamp(angDif(R.rotation.y, S.mira), -.8, .8), 3.5, dt);
      T.headY = miraY + Math.sin(tt * .65) * .035;
    }

    // mezcla hacia la pose objetivo
    const k = 1 - Math.exp(-rate * dt);
    for (const f of ['hipY', 'hipX', 'lean', 'roll', 'twist', 'pyaw', 'spine', 'head', 'headY']) P[f] += (T[f] - P[f]) * (f === 'lean' && S.rodando > 0 ? 1 : k);
    for (const f of ['aL', 'aR']) for (let i = 0; i < 3; i++) P[f][i] += (T[f][i] - P[f][i]) * k;
    for (const f of ['lL', 'lR']) for (let i = 0; i < 2; i++) P[f][i] += (T[f][i] - P[f][i]) * k;
    P.wIK = damp(P.wIK, locom ? 1 : 0, locom ? 14 : 20, dt);

    // ---------- marcha: fase, despegue y apoyo de cada pie ----------
    const yaw = R.rotation.y, fx = Math.sin(yaw), fz = Math.cos(yaw);
    let bobMarcha = 0, avance = [0, 0];
    if (locom) {
      const n = smooth(.3, 7.6, vel), lp = MARCHA.pasoBase + MARCHA.pasoK * vel, frec = Math.max(vel, .4) / lp / 2;
      const apoyo = clamp(Math.min(MARCHA.apoyo, 1.25 * lp) / (2 * lp), MARCHA.apoyoMin, MARCHA.apoyoMax);
      if (vel > MARCHA.vMin) fase = (fase + frec * dt) % 1;
      for (let i = 0; i < 2; i++) {
        const pie = pies[i], p = (fase + i * .5) % 1;
        if (vel > MARCHA.vMin) {
          const cruza = (pie.pPrev < apoyo && p >= apoyo) || (p < pie.pPrev && p >= apoyo);
          if (cruza && !pie.aire) empezarPaso(pie, (1 - apoyo) / frec);   // al correr ambos pies pueden estar en el aire
          // destino relativo al cuerpo: su sitio de descanso, adelantado medio apoyo
          if (pie.aire) { descanso(i, _v); const m = apoyo / frec * .5; pie.hacia.set(_v.x - R.position.x + vx * m, 0, _v.z - R.position.z + vz * m); }
        } else if (!pie.aire && !pies[1 - i].aire) { // en reposo: un paso corto si el pie quedó lejos de su sitio
          descanso(i, _v);
          if (_v.distanceTo(pie.pos) > .1) { empezarPaso(pie, .2); pie.recoloca = true; pie.hacia.set(_v.x - R.position.x, 0, _v.z - R.position.z); }
        }
        // liberar el apoyo antes de que la pierna se cruce, se retuerza o se estire (fase 3 de PLAN_JUEGO): al girar, el pie
        // plantado se quedaba en el mundo mientras el cuerpo daba la vuelta y las piernas se cruzaban
        if (!pie.aire) {
          const Lb = MARCHA.libera, rx = Math.cos(yaw), rz = -Math.sin(yaw), px = pie.pos.x - R.position.x, pz = pie.pos.z - R.position.z;
          const lat = (px * rx + pz * rz) * pie.lado, tors = Math.abs(angDif(pie.yawApoyo === undefined ? yaw : pie.yawApoyo, yaw));
          const hd = Math.hypot(pie.pos.x - (R.position.x + rx * .072 * pie.lado), pie.pos.z - (R.position.z + rz * .072 * pie.lado));
          descanso(i, _v); const dist = Math.hypot(pie.pos.x - _v.x, pie.pos.z - _v.z);
          const roto = lat < Lb.lateral || tors > Lb.torsion || hd > Lb.extension * (L1 + L2);   // pie cruzado, retorcido o estirado: se suelta aunque el otro esté en el aire
          const mal = roto || (vel < Lb.velCiclo && dist > Lb.dist && !pies[1 - i].aire);
          if (mal) { empezarPaso(pie, roto ? Lb.durPivote : Lb.dur); pie.recoloca = true; pie.hacia.set(_v.x - R.position.x, 0, _v.z - R.position.z); }
        }
        pie.pPrev = p;
        if (pie.aire && pie.recoloca) { descanso(i, _v); pie.hacia.set(_v.x - R.position.x + vx * .06, 0, _v.z - R.position.z + vz * .06); }
        if (pie.aire) { // la pierna adelanta respecto al cuerpo (no en el mundo): sin pasarse ni arrastrarse
          pie.t += dt / pie.dur; const u = Math.min(1, pie.t), s = u * u * (3 - 2 * u);
          pie.pos.x = R.position.x + lerp(pie.desde.x, pie.hacia.x, s); pie.pos.z = R.position.z + lerp(pie.desde.z, pie.hacia.z, s);
          const ys = suelo(pie.pos.x, R.position.y, pie.pos.z);
          if (pie.t >= 1) { pie.aire = false; pie.recoloca = false; pie.yawApoyo = yaw; pie.pos.y = ys; if (vel > .65 && R.visible) Bus.emit('hikari:paso', { x: pie.pos.x, y: ys, z: pie.pos.z }); }
          else pie.pos.y = lerp(pie.y0, ys, s) + Math.sin(Math.PI * u) * Math.max(lerp(MARCHA.alzaMin, MARCHA.alzaMax, n), TR.alza * kTrote);
        }
        avance[i] = (pie.pos.x - R.position.x) * fx + (pie.pos.z - R.position.z) * fz;
      }
      bobMarcha = vel > MARCHA.vMin ? (Math.abs(Math.sin(fase * TAU)) - .6) * Math.max(lerp(.015, .05, n), TR.bote * kTrote) : 0;
    } else {
      for (let i = 0; i < 2; i++) { descanso(i, pies[i].pos); pies[i].aire = false; }
      fase = 0;
    }

    // ---------- aplicar el tronco y los brazos (FK) ----------
    const hb = n => B[H[n]];
    const cad = hb('cadera');
    let hipY = CADERA + P.hipY * 1.3 + bob + bobMarcha * P.wIK;
    // la cadera baja si un pie no alcanza su apoyo (pendientes, escalones)
    if (P.wIK > .01) {
      const hipPre = hipY; let tope = 1e9;
      for (let i = 0; i < 2; i++) { const p = pies[i].pos, dx = p.x - (R.position.x + Math.cos(yaw) * .072 * pies[i].lado), dz = p.z - (R.position.z - Math.sin(yaw) * .072 * pies[i].lado), hd = Math.hypot(dx, dz);
        tope = Math.min(tope, p.y + TOBILLO - R.position.y + Math.sqrt(Math.max(0, (L1 + L2) ** 2 * .96 - hd * hd)) + .03); }
      hipY = lerp(hipY, Math.min(hipY, Math.max(tope, hipY - MARCHA.bajaMax)), P.wIK);   // con un pie muy atrás (embestidas) no se hunde del todo
      bajaCadera = damp(bajaCadera, hipY - hipPre, 12, dt); hipY = hipPre + bajaCadera;   // el hundimiento se suaviza: un tirón de la cadera lo hereda el pecho y, con él, la capa
    }
    const pelvYaw = -(avance[0] - avance[1]) * .35 * P.wIK;   // la cadera adelanta el lado de la pierna que va delante
    cad.position.set(P.hipX, hipY, 0); cad.rotation.set(P.lean, pelvYaw, P.roll, 'YXZ');
    hb('columna').rotation.set(P.spine, P.twist * .4 - pelvYaw * .6, -P.roll * .3);
    hb('pecho').rotation.set(P.spine * .6 + Math.sin(tt * 1.7) * .015, P.twist * .6 - pelvYaw * .6, -P.roll * .2);
    const comp = -P.lean * (P.lean < 1 ? .55 : .35);                                  // la cabeza mira al frente
    hb('cuello').rotation.set(P.head * .4 + comp * .4, P.headY * .4, 0); hb('cabeza').rotation.set(P.head * .6 + comp * .6, P.headY * .6, 0);
    const A = [P.aL, P.aR];
    for (let s = 0; s < 2; s++) {
      const sf = s ? 'D' : 'I', sg = s ? -1 : 1; let a = A[s];
      if (P.wIK > .01 && brazosLibres) { const sw = clamp(-avance[s] * 2.2, -1.1, 1.1), n = smooth(.3, 7.6, vel); a = [lerp(a[0], sw * (.6 + .5 * n + TR.brazo * kTrote), P.wIK), lerp(a[1], .1 + .12 * n, P.wIK), lerp(a[2], Math.max(.25 + 1.2 * n, TR.codo * kTrote) + Math.max(0, sw) * .3, P.wIK)]; }
      hb('brazo' + sf).rotation.set(-a[0], 0, sg * (a[1] + .06)); hb('antebrazo' + sf).rotation.set(-a[2], 0, 0); hb('mano' + sf).rotation.set(-.1, 0, 0);
      const l = s ? P.lR : P.lL; hb('muslo' + sf).rotation.set(-l[0], 0, sg * .03); hb('pierna' + sf).rotation.set(l[1], 0, 0); hb('pie' + sf).rotation.set(-l[1] * .35, 0, 0); hb('dedos' + sf).rotation.set(0, 0, 0);
    }
    // ---------- piernas por IK, mezcladas con la pose ----------
    if (P.wIK > .01) {
      R.updateMatrixWorld(true);
      for (let i = 0; i < 2; i++) {
        const pie = pies[i], sf = i ? 'D' : 'I', nrm = normalSuelo(pie.pos.x, pie.pos.y, pie.pos.z, _v);
        const cab = pie.aire ? lerp(.45, -.35, pie.t) : 0;
        _w.set(pie.pos.x, pie.pos.y + TOBILLO, pie.pos.z);
        ikPierna(i, _w, nrm, cab);
        for (const [j, n] of [[0, 'muslo'], [1, 'pierna'], [2, 'pie']]) { const b = hb(n + sf); _q.copy(b.quaternion).slerp(qIK[i][j], P.wIK); b.quaternion.copy(_q); }
        if (pie.aire && pie.t < .3) hb('dedos' + sf).rotation.x = .5 * (1 - pie.t / .3);
      }
    }
    // ---------- brazos por IK hacia el arma ----------
    if (wArma > .01) brazosArma(dt);
    const fuera = desenv && wArma > .35;
    armaMano.visible = fuera && (!!S.armado || !armaId);
    if (armaFunda) for (const m of armaFunda.children) m.visible = !(fuera && m.name !== 'saya');
    if (armaMano.children.length === 0 && armaMano.isMesh) armaMano.material.userData.brillo.value = 1 + (S.carga > 0 ? S.carga * (2.5 + Math.sin(tt * 18)) : 0) + (S.contra ? 1.5 : 0);
    // brillo de las líneas según la luz de Hikari
    uBrillo.value = .55 + .65 * (S.luz !== undefined ? S.luz : 1);
    // alas, aura y estela
    alaV = damp(alaV, S.planeo ? 1 : 0, 7, dt);
    for (const a of alas) { a.material.opacity = alaV * .75; a.scale.y = alaV * .9 + .001; a.rotation.z = Math.sin(tt * 6) * .08 * alaV; a.rotation.y = (a.scale.x > 0 ? -1 : 1) * (.2 + .15 * Math.sin(tt * 4)); a.visible = alaV > .02; }
    aura.opacidad = .1 + .025 * Math.sin(tt * 2.4) + (S.luz !== undefined ? .04 * S.luz : 0);
    // ---------- tela: anclada a la espalda (hueso del pecho) ----------
    R.updateMatrixWorld(true);
    // estela: entre la base y la punta de la hoja mientras golpea
    const Fa = Armas.ficha(armaId), act = !!S.golpe && wArma > .5 && S.fGolpe > S.golpe.t[0] - .04 && S.fGolpe < S.golpe.t[2] - .02;
    _g.set(0, Fa.hoja[0], 0); armaMano.localToWorld(_g); _h.set(0, Fa.hoja[1], 0); armaMano.localToWorld(_h);
    estela.paso(dt, _g, _h, act, S.contra ? 1.8 : 1);
    const pecho = hb('pecho'), anc = [], ancC = [];
    // el ancla va justo detrás del torso: si queda dentro, la colisión y las restricciones pelean y la tela vive estirada
    for (let i = 0; i < capa.C; i++) { const u = i / (capa.C - 1) * 2 - 1; _v.set(u * CAPA.anchoArriba * .5, .085, -(CAPA.torso[1] + CAPA.separa) + CAPA.arco * u * u); pecho.localToWorld(_v); anc.push(_v.clone()); }
    for (let s = 0; s < 2; s++) { _v.set((s ? -1 : 1) * .03, .14, -.07); pecho.localToWorld(_v); ancC.push(_v.clone()); }
    capa.anclar(anc);
    capa.aB = damp(capa.aB, lerp(CAPA.anchoAbajo, CAPA.anchoVuelo, alaV), CAPA.despliegue, dt);
    const dts = Math.min(dt, .033);
    capa.paso(Math.min(dt, .05), -vx * .9, -8, -vz * .9, CAPA.viento + vel * CAPA.vientoVel, colisionCuerpo, CAPA.frec + vel * CAPA.frecVel);
    for (let s = 0; s < 2; s++) { const t = cintas[s], aa = Array.from({length:t.C}, (_,i) => {const p=ancC[s].clone();p.x+=(s?-1:1)*i/(t.C-1)*.02;return p;}); t.anclar(aa); t.paso(dts, -vx * 1.4, -3.5, -vz * 1.4, .6, null); }
    marcarLlamas(pecho);
    if (farol && farol.visible) Gente.colgar(farol, vel, tt);
  }
  /* las llamas que quedan brillan sobre la capa, un poco por fuera de la tela (lado contrario al pecho) */
  const mlP = new THREE.Vector3(), mlU = new THREE.Vector3(), mlV = new THREE.Vector3(), mlT = new THREE.Vector3(), mlC = new THREE.Vector3(), mlCentro = new THREE.Vector3();
  function puntoCapa(i, j, v) {   // interpolación bilineal: símbolos adheridos a la tela, incluso al plegarse
    const p = capa.p, C = capa.C, i0 = clamp(Math.floor(i),0,C-2), j0 = clamp(Math.floor(j),0,capa.R-2), f = clamp(i-i0,0,1), t = clamp(j-j0,0,1), a = (j0*C+i0)*3, b=a+C*3;
    return v.set(...[0,1,2].map(k => lerp(lerp(p[a+k],p[a+3+k],f),lerp(p[b+k],p[b+3+k],f),t)));
  }
  function marcarLlamas(pecho) {
    pecho.getWorldPosition(mlCentro);
    LLAMAS_CAPA.filas.forEach((j, k) => {
      const i=LLAMAS_CAPA.columna;
      const h = marcasLlama[k]; h.visible = k < nLlamas && R.visible; if (!h.visible) return;
      puntoCapa(i, j, mlP);
      puntoCapa(i + .5, j, mlU).sub(puntoCapa(i - .5, j, mlT));          // a lo ancho
      puntoCapa(i, j + 1, mlV).sub(puntoCapa(i, j - 1, mlT));            // a lo largo
      mlU.cross(mlV).normalize(); if (mlU.dot(mlT.copy(mlP).sub(mlCentro)) < 0) mlU.negate();   // hacia fuera del cuerpo
      h.position.copy(mlP).addScaledVector(mlU, LLAMAS_CAPA.fuera);
      mlT.copy(mlU); puntoCapa(i+.5,j,mlV).sub(puntoCapa(i-.5,j,mlC)).normalize().negate(); mlC.crossVectors(mlT,mlV).normalize();
      _m.makeBasis(mlV,mlC,mlT); h.quaternion.setFromRotationMatrix(_m);
    });
  }
  function llamas(n) { nLlamas = n; }
  /* la capa no atraviesa la espalda ni la cadera: el torso es una elipse y la capa se ciñe a ella; además el centro
     de cada fila va un poco hacia atrás y los bordes hacia delante, para que conserve la sección curva (no una lámina) */
  const CURVA_MEDIA = Array.from({length:HIKARI_DISENO.capa.cols},(_,i)=>i).reduce((a, i) => { const u = i / (HIKARI_DISENO.capa.cols-1) * 2 - 1; return a + (1 - u * u) / HIKARI_DISENO.capa.cols; }, 0);
  /* los sesgos de forma de colisionCuerpo se aplican en cada pasada de la tela: con más pasadas por segundo (hz × iter)
     que las 180 de antes (3 por fotograma a 60) valen lo mismo por segundo, no más */
  const PASADAS = CAPA.hz * CAPA.iter, CURVA_IT = CAPA.curva * 180 / PASADAS, ANCHO_IT = 1 - Math.pow(1 - CAPA.conservarAncho, 180 / PASADAS);
  function colisionCuerpo(p, k) {
    const pe = B[H.pecho]; _v.set(p[k], p[k + 1], p[k + 2]); pe.worldToLocal(_v);
    const u = (k / 3) % capa.C / (capa.C-1) * 2 - 1, fila = Math.floor(k / 3 / capa.C) / (capa.R - 1);
    const ancho = lerp(capa.aT, capa.aB, Math.sin(fila * Math.PI * .5));
    _v.x = lerp(_v.x, u * ancho * .5, ANCHO_IT); // curvatura lateral suave, con libertad para ondear
    _v.z -= CURVA_IT * (1 - u * u - CURVA_MEDIA);   // sin empuje neto: solo cambia la forma de la fila
    if (_v.y < .12 && _v.y > -.52) _v.z = Math.min(_v.z, -CAPA.torso[1]);
    if (_v.y < .12 && _v.y > -.42) { const [a, b] = CAPA.torso, e = Math.hypot(_v.x / a, _v.z / b); if (e < 1 && _v.z < .05) { const k2 = 1 / Math.max(e, 1e-3); _v.x *= k2; _v.z *= k2; } }
    pe.localToWorld(_v); p[k] = _v.x; p[k + 1] = _v.y; p[k + 2] = _v.z;
  }
  function mover(x, y, z, yaw, dt) { R.position.set(x, y, z); R.rotation.y = dt ? angDamp(R.rotation.y, yaw, 18, dt) : yaw; }
  /* la grieta: segmentos finos pegados a la superficie de la máscara (en el espacio del modelo, llevados al hueso de la
     cabeza); se ven los primeros según grieta(k) con el rango de dibujo (una sola llamada) */
  let grietaM = null, nGrieta = 0;
  function crearGrieta() {
    const zS = (x, y) => .029 + .095 * Math.sqrt(Math.max(.05, 1 - (x / .115) ** 2 - ((y - 1.065) / .16) ** 2));
    const seg = [], tramo = P => { for (let i = 1; i < P.length; i++) seg.push([P[i - 1], P[i]]); }; tramo(GRIETA.trazo); tramo(GRIETA.rama);
    const geos = seg.map(([a, b]) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), g = new THREE.BoxGeometry(L + GRIETA.ancho, GRIETA.ancho, .002); g.rotateZ(Math.atan2(b[1] - a[1], b[0] - a[0])); const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; g.translate(mx, my, zS(mx, my)); return g; });
    const geo = fusionar(geos.map(g => { g.deleteAttribute('uv'); return g; })); geo.applyMatrix4(malla.skeleton.boneInverses[H.cabeza]);
    grietaM = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: GRIETA.color, fog: false })); nGrieta = seg.length; grietaM.visible = false; B[H.cabeza].add(grietaM);
  }
  function grieta(k) { const n = Math.round(clamp(k, 0, 1) * nGrieta); grietaM.visible = n > 0; grietaM.geometry.setDrawRange(0, n * 36); }
  /* el farol de Tsuru: cuelga de la cintura (lo crea la primera vez); v: si lo lleva */
  let farol = null;
  function llevaFarol(v) { if (v && !farol) { farol = Gente.farol(FAROL_HIKARI.escala); B[H.cadera].add(farol); farol.position.fromArray(FAROL_HIKARI.pos); } if (farol) farol.visible = !!v; }
  function reiniciarTela() { capa.listo = false; cintas.forEach(c => c.listo = false); listo = false; }
  /* mostrar u ocultar a Hikari entera: la capa, las cintas, las marcas de llama y la estela cuelgan de la escena, no de R;
     al volver a verse, la tela se recoloca en la espalda */
  function mostrar(v) {
    if (v && !R.visible) reiniciarTela();
    R.visible = capa.mesh.visible = v; cintas.forEach(c => c.mesh.visible = v); marcasLlama.forEach((h, k) => h.visible = v && k < nLlamas);
    if (!v && estela) estela.mesh.visible = false;
  }
  // Reinicio determinista para generar clips portables y revisar poses sin heredar la anterior.
  function reiniciarAnimacion() {
    fase = tt = alaV = velPrev = acel = yawPrev = giroV = bob = bobV = miraY = 0; sueloPrev = true;
    for (const k of Object.keys(P)) Array.isArray(P[k]) ? P[k].fill(0) : P[k] = 0;
    HUESOS.forEach((h,i) => { B[i].position.set(h[2],h[3],h[4]); B[i].quaternion.identity(); });
    reiniciarTela();
  }
  return { crear, animar, mover, mostrar, llevaFarol, grieta, equipar, reiniciarTela, reiniciarAnimacion, llamas, material, root: R, MARCHA,
    get capa() { return capa; }, get modelo() { return { malla, huesos: B, definicion: HUESOS, alas, grieta: grietaM }; },
    _marcha: () => ({ fase, pies: pies.map(p => ({ aire: p.aire, t: +p.t.toFixed(2), dur: +p.dur.toFixed(3), x: +(p.pos.x - R.position.x).toFixed(2), z: +(p.pos.z - R.position.z).toFixed(2) })) }),
    /* para las pruebas: cuánto se cruza cada pie (lat < 0: al lado contrario), su distancia a la cadera sobre lo que alcanza la pierna y el giro de cada muslo */
    _piernas: () => pies.map((p, i) => { const yaw = R.rotation.y, rx = Math.cos(yaw), rz = -Math.sin(yaw), px = p.pos.x - R.position.x, pz = p.pos.z - R.position.z; return { aire: p.aire, lat: (px * rx + pz * rz) * p.lado, ext: Math.hypot(p.pos.x - (R.position.x + rx * .072 * p.lado), p.pos.z - (R.position.z + rz * .072 * p.lado)) / (L1 + L2), q: B[H['muslo' + (i ? 'D' : 'I')]].quaternion.toArray() }; }) };
})();
