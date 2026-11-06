/* === Ecos de Luz · 25-gente.js ===
   Habitantes del valle (NPC): cuerpo con esqueleto generado por código (kimono con mangas anchas, obi,
   cuello, pelo con moño, sombrero, barba, bastón y prendas opcionales), animación procedural (respirar, mirar a Hikari,
   gesticular al hablar, andar, sentarse) y rutinas según su ficha (pasear, jugar, pescar, vigilar,
   meditar). También da cuerpo a los ecos del pasado (27-ecos.js): figuras de luz que repiten una acción
   (cantar, ofrecer, pescar, señalar, jugar, caminar). Los datos de cada personaje están en 07-sistemas.js
   (crearNPCs). Mantiene la interfaz que usa
   07-sistemas.js: { g, nombre, id, sig, h, actualizar(dt, px, pz) }. Arte sustituible: cuerpo y accesorios
   se construyen en sus propias funciones. */
"use strict";

/* números de la animación y de las rutinas (m, s, m/s) */
const GENTE = {
  vel: { andar: 1.0, despacio: .55, correr: 2.4 }, zancada: .55, giro: 4,
  mirar: 9,            // distancia a la que siguen a Hikari con la mirada
  atender: 4.2,        // a esta distancia dejan lo que hacen y se giran hacia Hikari
  despertar: 5,        // Taiyo deja de meditar si Hikari se acerca más
  pausa: [3, 7], piel: 0xe9c6a0,
  parpadeo: [2, 5.5],  // segundos entre parpadeos
  labio: 0x7a3a36,
  rasgoEco: 4,         // brillo de ojos, cejas y boca de los ecos frente al resto de su cuerpo
  animacion: { cuerpo: 7, brazos: 9, cabeza: 5, giro: .045, balanceo: .025, ribete: 0xf0dfb6 }
};
/* farol de mano de la Abuela Tsuru (luego de Hikari): alto y ancho (m), colores de la madera, el papel y la brasa,
   brillo del papel, tamaño y opacidad del halo de la brasa y vaivén al andar (rad) */
const FAROL = { alto: .26, ancho: .15, madera: 0x3a2616, papel: 0xf3dfb8, brasa: 0xffa04a, brillo: 1.1, halo: .55, haloOp: .6, vaiven: .25 };
/* gestos de la cara: sonrisa (−1 triste … 1 alegre), ojos abiertos (0–1), cejas (−1 bajas … 1 alzadas),
   fruncido (cejas inclinadas hacia dentro) y boca abierta (0–1). Cada habitante o eco tiene uno de base según
   su rutina (o el de su ficha, cfg.gesto); al saludar y al hablar cambian solos */
const GESTOS = {
  neutro: { sonrisa: .15, ojos: 1, cejas: 0, frunce: 0, boca: 0 },
  sereno: { sonrisa: .35, ojos: .4, cejas: -.1, frunce: 0, boca: 0 },
  serio: { sonrisa: -.3, ojos: .9, cejas: -.45, frunce: .3, boca: 0 },
  alegre: { sonrisa: .9, ojos: 1, cejas: .45, frunce: -.1, boca: .15 },
  canta: { sonrisa: .25, ojos: .55, cejas: .35, frunce: -.1, boca: .5, canta: true },
  añoranza: { sonrisa: -.1, ojos: .8, cejas: .4, frunce: -.35, boca: 0 },
  llanto: { sonrisa: -.85, ojos: .25, cejas: .6, frunce: -.6, boca: .25 }
};
const GESTO_DE = { meditar: 'sereno', vigilar: 'serio', jugar: 'alegre', pescar: 'neutro', pasear: 'neutro', cantar: 'canta', ofrecer: 'sereno', señalar: 'añoranza', caminar: 'sereno' };

const Gente = (() => {
  /* esqueleto de un adulto de 1,62 m (se escala con el alto de la ficha) */
  const HUESOS = [
    ['cadera', -1, 0, .82, 0], ['columna', 0, 0, .1, 0], ['pecho', 1, 0, .2, 0], ['cuello', 2, 0, .19, 0], ['cabeza', 3, 0, .07, 0],
    ['brazoI', 2, .17, .15, 0], ['antebrazoI', 5, 0, -.27, 0], ['manoI', 6, 0, -.24, 0],
    ['brazoD', 2, -.17, .15, 0], ['antebrazoD', 8, 0, -.27, 0], ['manoD', 9, 0, -.24, 0],
    ['musloI', 0, .09, -.03, 0], ['piernaI', 11, 0, -.38, 0], ['pieI', 12, 0, -.37, 0],
    ['musloD', 0, -.09, -.03, 0], ['piernaD', 14, 0, -.38, 0], ['pieD', 15, 0, -.37, 0]
  ];
  const H = {}; HUESOS.forEach((h, i) => H[h[0]] = i);
  /* huesos de la cara, hijos de la cabeza y colocados en crear() según su tamaño: ojos (parpadear), cejas, comisuras
     y boca. Los rasgos van en la misma malla con esqueleto: expresión sin mallas ni llamadas de dibujo de más */
  const CARA = ['ojoI', 'ojoD', 'cejaI', 'cejaD', 'comisuraI', 'comisuraD', 'boca'];
  CARA.forEach((n, i) => H[n] = HUESOS.length + i);
  const CABEZA_Y = HUESOS.slice(0, 5).reduce((a, h) => a + h[3], 0);   // altura de la cabeza en reposo
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  /* Prendas opcionales de cualquier ficha: manto, remiendos y colgante son colores sRGB.
     farolCerrado es { madera, postigo }. Todo se cose a los huesos de la malla existente:
     mismos atributos, material y programa; sin mallas ni llamadas de dibujo adicionales. */
  function coser(P, geo, color, peso) {
    const a = geo.attributes.position, base = P.p.length / 3, c = lin(color);
    for (let i = 0; i < a.count; i++) { const x = a.getX(i), y = a.getY(i), z = a.getZ(i); P.vert(x, y, z, c, .95, 0, peso(x, y, z)); }
    if (geo.index) for (const i of geo.index.array) P.i.push(base + i);
    else for (let i = 0; i < a.count; i++) P.i.push(base + i);
    geo.dispose();
  }
  /* Panel de tela: el reverso lleva sus propios vértices para conservar las normales y el material de una cara. */
  function panel(P, puntos, color, peso, reverso = false) {
    const c = lin(color), lados = reverso ? [puntos, puntos.slice().reverse()] : [puntos];
    for (const lado of lados) {
      const base = P.p.length / 3;
      for (const [x, y, z] of lado) P.vert(x, y, z, c, .95, 0, peso(x, y, z));
      for (let i = 1; i < lado.length - 1; i++) P.i.push(base, base + i, base + i + 1);
    }
  }
  /* Superficie de viaje abierta al frente. Los cuatro niveles dan cuello, hombros y bajo desigual. */
  const MANTO = [[1.32, .085, .075], [1.245, .29, .17], [1.0, .31, .19], [.84, .33, .205]];
  function superficieRopa(y, a, manto, fuera = 0) {
    const niveles = manto ? MANTO : [[.88, .17, .12], [.7, .19, .14], [.45, .22, .16], [.2, .25, .18]];
    let k = 0; while (k < niveles.length - 2 && y < niveles[k + 1][0]) k++;
    const arriba = niveles[k], abajo = niveles[k + 1], t = clamp((arriba[0] - y) / (arriba[0] - abajo[0]), 0, 1);
    return [Math.sin(a) * (lerp(arriba[1], abajo[1], t) + fuera), y, Math.cos(a) * (lerp(arriba[2], abajo[2], t) + fuera)];
  }
  function manto(P, color) {
    const peso = (x, y) => pesoEntre(H.pecho, H.columna, y, 1.0, 1.22), pasos = 10, abertura = .38;
    const punto = (j, k) => {
      const a = abertura + j / pasos * (TAU - abertura * 2), y = MANTO[k][0] + (k === MANTO.length - 1 ? .012 * Math.cos(j * 2.4) : 0);
      return superficieRopa(y, a, true);
    };
    for (let k = 0; k < MANTO.length - 1; k++) for (let j = 0; j < pasos; j++)
      panel(P, [punto(j, k), punto(j, k + 1), punto(j + 1, k + 1), punto(j + 1, k)], color, peso, true);
    // Capucha bajada: tela plegada en la nuca y hueco oscuro hacia la espalda, sin tapar el rostro.
    const pecho = () => [H.pecho, 1], oscuro = new THREE.Color(color).multiplyScalar(.68).getHex();
    coser(P, new THREE.SphereGeometry(1, 8, 4).scale(.115, .085, .065).translate(0, 1.255, -.16), color, pecho);
    coser(P, new THREE.SphereGeometry(1, 8, 3).scale(.078, .052, .012).translate(0, 1.255, -.222), oscuro, pecho);
  }
  function remiendos(P, color, llevaManto, pesoKimono) {
    const peso = llevaManto ? (x, y) => pesoEntre(H.pecho, H.columna, y, 1.0, 1.22) : pesoKimono;
    const parches = llevaManto ? [[.48, 1.02, .42, .14], [3.6, .9, .48, .14]] : [[.45, .48, .42, .16], [3.6, .62, .48, .16]];
    const punto = (a, y, fuera) => superficieRopa(y, a, llevaManto, fuera);
    for (const [a, y, ancho, alto] of parches) {
      for (let j = 0; j < 2; j++) {
        const a0 = a + ancho * j / 2, a1 = a + ancho * (j + 1) / 2;
        panel(P, [punto(a0, y + alto, .006), punto(a0, y, .006), punto(a1, y, .006), punto(a1, y + alto, .006)], color, peso);
      }
      // Cuatro puntadas grandes y mates; el color es el lino de la ropa de viaje.
      for (let j = 0; j < 4; j++) {
        const aj = a + ancho * (j + .5) / 4;
        panel(P, [punto(aj - .012, y + alto + .009, .008), punto(aj - .012, y + alto - .017, .008),
          punto(aj + .012, y + alto - .017, .008), punto(aj + .012, y + alto + .009, .008)], 0xb2a58a, peso);
      }
    }
  }
  function colgante(P, color) {
    const peso = () => [H.pecho, 1];
    P.tubo([{ p: V(-.045, 1.30, .096), rx: .003, ry: .003 }, { p: V(0, 1.12, .15), rx: .003, ry: .003 },
      { p: V(.045, 1.30, .096), rx: .003, ry: .003 }], 4, () => lin(0x6b5a3a), .95, 0, peso, true);
    // Disco completo, sin cortes ni signos del sello lunar actual.
    coser(P, new THREE.CylinderGeometry(.027, .027, .009, 10).rotateX(Math.PI / 2).translate(0, 1.105, .153), color, peso);
  }
  function farolCerrado(P, colores) {
    const F = colores || {}, madera = F.madera === undefined ? 0x493f38 : F.madera, postigo = F.postigo === undefined ? 0x2c3041 : F.postigo;
    const peso = () => [H.manoI, 1], x = .18, z = .07;
    const caja = (w, h, d, color, dx, y, dz = 0) => coser(P, new THREE.BoxGeometry(w, h, d).translate(x + dx, y, z + dz), color, peso);
    // Caja opaca, tapas, esquinas y postigo con bisagra. Sin papel luminoso ni halo.
    caja(.13, .21, .13, postigo, 0, .58);
    for (const y of [.469, .691]) caja(.16, .012, .16, madera, 0, y);
    for (const s of [-1, 1]) for (const t of [-1, 1]) caja(.013, .21, .013, madera, s * .069, .58, t * .069);
    caja(.108, .18, .009, postigo, 0, .58, .071); caja(.012, .04, .012, madera, -.061, .58, .078);
    // Asa rectangular en la palma: sigue la mano y su balanceo normal al caminar.
    for (const s of [-1, 1]) caja(.009, .045, .009, madera, s * .035, .719);
    caja(.079, .009, .009, madera, 0, .742);
  }

  /* material de los ecos: luz translúcida que brilla más en los bordes (todos los ecos comparten programa) */
  function materialEco(color) {
    const m = new THREE.MeshStandardMaterial({ skinning: true, color: 0x000000, emissive: color, emissiveIntensity: 1, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, roughness: 1 });
    m.vertexColors = true;   // el color de los vértices marca la cara: 1 el cuerpo, GENTE.rasgoEco los rasgos
    m.onBeforeCompile = sh => { Atmosfera.inyectar(sh); sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\nfloat frE = pow(1. - abs(dot(normal, normalize(vViewPosition))), 2.); totalEmissiveRadiance *= (.25 + 1.6*frE)*vColor.r;'); };
    m.customProgramCacheKey = () => 'eco'; return m;
  }

  /* ---------- cuerpo ---------- */
  function cuerpo(cfg) {
    const P = new Piel(), L = h => lin(h), piel = L(GENTE.piel), kim = L(cfg.kimono || 0x6b86a8), obi = L(cfg.obi || 0xd9a441), pelo = L(cfg.pelo !== undefined ? cfg.pelo : 0x2a1d1a);
    const blanco = L(0xeeeae0), oscuro = L(0x2a2420), nino = !!cfg.nino, cab = nino ? 1.25 : 1;
    const tono = c => (x, y, z) => c.clone().multiplyScalar(.92 + .1 * Ruido.n2(x * 30 + z * 9, y * 30));
    const lado = x => (x >= 0 ? 'I' : 'D');
    // piernas (casi ocultas por el kimono) y sandalias
    for (const s of [1, -1]) {
      const sf = s > 0 ? 'I' : 'D', x = .09 * s;
      P.tubo([[.79, .06], [.6, .055], [.42, .048], [.2, .042], [.06, .038]].map(([y, r]) => ({ p: V(x, y, 0), rx: r, ry: r })), 8, tono(oscuro), .9, 0,
        (px, y) => (y > .42 ? pesoEntre(H['muslo' + sf], H['pierna' + sf], y, .38, .46) : pesoEntre(H['pierna' + sf], H['pie' + sf], y, .05, .1)));
      P.elip(x, .025, .045, .045, .025, .1, 8, 4, () => L(0x8a6a4a), .9, 0, () => [H['pie' + sf], 1]);
    }
    // kimono: del hombro al tobillo, más ancho abajo; la falda sigue a los muslos
    const pk = (x, y) => {
      if (y > 1.02) return pesoEntre(H.pecho, H.columna, y, 1.02, 1.12);
      if (y > .8) return pesoEntre(H.columna, H.cadera, y, .86, .96);
      const sf = lado(x), w = smooth(.8, .25, y) * .75 * smooth(.0, .1, Math.abs(x));
      return w < .02 ? [H.cadera, 1] : y > .45 ? [H['muslo' + sf], w, H.cadera, 1 - w] : [H['pierna' + sf], w * .6, H['muslo' + sf], 1 - w * .6];
    };
    P.tubo([[1.3, .1, .08], [1.26, .2, .12], [1.12, .19, .13], [.98, .17, .12], [.88, .17, .12], [.7, .19, .14], [.45, .22, .16], [.2, .25, .18], [.07, .27, .19]]
      .map(([y, rx, ry]) => ({ p: V(0, y, 0), rx, ry: rx, rz: ry })).map(s => ({ p: s.p, rx: s.rx, ry: s.rz })), 16, tono(kim), .85, 0, (x, y) => pk(x, y), true);
    // cuello en V (blanco) y obi con lazo
    P.tubo([[1.31, .07], [1.27, .1]].map(([y, r]) => ({ p: V(0, y, .02), rx: r, ry: r * .8 })), 12, () => blanco, .8, 0, () => [H.pecho, 1]);
    P.tubo([[.94, .18], [.82, .19]].map(([y, r]) => ({ p: V(0, y, 0), rx: r, ry: r * .72 })), 16, tono(obi), .7, 0, () => [H.columna, .6, H.cadera, .4]);
    P.elip(0, .9, -.15, .1, .07, .05, 8, 5, tono(obi), .7, 0, () => [H.columna, 1]);
    // Ribetes y cuello cruzado, en la misma malla: el traje sigue leyéndose a distancia.
    const ribete = obi.clone().lerp(L(GENTE.animacion.ribete), .58);
    P.tubo([[.115, .268], [.085, .272]].map(([y, r]) => ({ p: V(0, y, 0), rx: r, ry: r * .7 })), 16, () => ribete, .85, 0, (x, y) => pk(x, y), true);
    for (const s of [-1, 1]) P.tubo([{ p: V(s * .065, 1.30, .08), rx: .018, ry: .012 }, { p: V(0, 1.16, .138), rx: .018, ry: .012 }], 6, () => blanco, .85, 0, () => [H.pecho, 1], true);
    // mangas anchas (más abiertas en la muñeca) y manos
    for (const s of [1, -1]) {
      const sf = s > 0 ? 'I' : 'D', x = .17 * s;
      P.tubo([[1.27, .075], [1.13, .085], [1.0, .1], [.86, .125], [.78, .13]].map(([y, r]) => ({ p: V(x + (1.27 - y) * .02 * s, y, 0), rx: r, ry: r * 1.15 })), 10, tono(kim), .85, 0,
        (px, y) => pesoEntre(H['brazo' + sf], H['antebrazo' + sf], y, .97, 1.05));
      P.elip(x + .01 * s, .73, .01, .035, .05, .03, 8, 5, () => piel, .7, 0, () => [H['mano' + sf], 1]);
      P.tubo([[.81, .129], [.78, .132]].map(([y, r]) => ({ p: V(x + .01 * s, y, 0), rx: r, ry: r * 1.15 })), 10, () => ribete, .85, 0, () => [H['antebrazo' + sf], 1], true);
    }
    // cabeza: cuello, cara, ojos, nariz y pelo con moño
    P.tubo([[1.38, .045], [1.31, .045]].map(([y, r]) => ({ p: V(0, y, 0), rx: r, ry: r })), 8, () => piel, .7, 0, () => [H.cuello, 1]);
    const yc = 1.47, rc = .1 * cab, pc = () => [H.cabeza, 1];
    P.elip(0, yc, .01, rc, rc * 1.15, rc * 1.05, 14, 10, () => piel, .7, 0, pc);
    P.elip(0, yc - rc * .05, rc * 1.02, rc * .08, rc * .12, rc * .08, 6, 4, () => piel, .7, 0, pc);
    // cara: ojos, cejas y boca sobre la superficie de la cabeza, cada rasgo pesado a su hueso (CARA)
    const sup = (x, y) => .01 + rc * 1.05 * Math.sqrt(Math.max(0, 1 - (x / rc) ** 2 - ((y - yc) / (rc * 1.15)) ** 2));
    const cara = {}, r0 = P.p.length / 3, cejas = cfg.calvo ? oscuro : pelo, labio = L(GENTE.labio);
    for (const s of [1, -1]) {
      const sf = s > 0 ? 'I' : 'D', ex = s * rc * .38, ey = yc + rc * .12, cy = yc + rc * .34;
      cara['ojo' + sf] = [ex, ey, sup(ex, ey)];
      P.elip(ex, ey, sup(ex, ey) - rc * .012, rc * .1, rc * .08, rc * .05, 8, 5, () => oscuro, .4, 0, () => [H['ojo' + sf], 1]);
      cara['ceja' + sf] = [ex, cy, sup(ex, cy)];
      P.tubo([[s * rc * .18, cy - rc * .01], [ex, cy + rc * .025], [s * rc * .58, cy - rc * .02]].map(([x, y]) => ({ p: V(x, y, sup(x, y) + rc * .012), rx: rc * .03, ry: rc * .025 })), 6, () => cejas, .9, 0, () => [H['ceja' + sf], 1], true);
    }
    const by = yc - rc * .44, bw = rc * .2;
    cara.comisuraI = [bw, by, sup(bw, by)]; cara.comisuraD = [-bw, by, sup(-bw, by)]; cara.boca = [0, by, sup(0, by)];
    P.tubo([-1, -.5, 0, .5, 1].map(u => ({ p: V(u * bw, by, sup(u * bw, by) + rc * .006), rx: rc * .022, ry: rc * .022 })), 6, () => labio, .6, 0,
      x => { const w = smooth(.15 * bw, bw, Math.abs(x)); return [H[x >= 0 ? 'comisuraI' : 'comisuraD'], w, H.boca, 1 - w]; }, true);
    const r1 = P.p.length / 3;
    if (!cfg.calvo) {
      P.elip(0, yc + rc * .18, -rc * .08, rc * 1.06, rc * 1.06, rc * 1.08, 14, 8, tono(pelo), .85, 0, pc, 0, .62, an => Math.sin(an) < .35);
      if (cfg.moño !== false) P.elip(0, yc + rc * .95, -rc * .45, rc * .42, rc * .36, rc * .4, 10, 6, tono(pelo), .85, 0, pc);
      if (nino) for (const s of [1, -1]) P.elip(s * rc * .95, yc + rc * .3, -rc * .1, rc * .3, rc * .3, rc * .3, 8, 5, tono(pelo), .85, 0, pc);
    }
    if (cfg.manto !== undefined) manto(P, cfg.manto);
    if (cfg.remiendos !== undefined) remiendos(P, cfg.remiendos, cfg.manto !== undefined, pk);
    if (cfg.colgante !== undefined) colgante(P, cfg.colgante);
    if (cfg.farolCerrado) farolCerrado(P, cfg.farolCerrado);
    // los ecos son luz: el material multiplica su brillo por este color; los rasgos brillan más que la cara (ojos de luz)
    if (cfg.eco) for (let i = 0; i < P.p.length / 3; i++) { const f = i >= r0 && i < r1 ? GENTE.rasgoEco : 1; P.c[i * 3] = P.c[i * 3 + 1] = P.c[i * 3 + 2] = f; }
    return { geo: P.geo(), cara, rc };
  }
  /* farol de mano: marco de madera, papel que brilla y una brasa dentro (halo); el asa queda en el origen y el farol
     cuelga por debajo. Arte sustituible: lo usan la Abuela Tsuru y Hikari */
  let matMarco = null, matPapel = null;
  function farol(esc) {
    const F = FAROL, a = F.ancho, h = F.alto, y0 = -.05 - h / 2, g = new THREE.Group();
    matMarco = matMarco || new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 });
    matPapel = matPapel || new THREE.MeshStandardMaterial({ color: F.papel, emissive: F.brasa, emissiveIntensity: F.brillo, roughness: .9 });
    const P = [pieza(new THREE.BoxGeometry(a, .022, a), F.madera, { y: y0 - h / 2 }), pieza(new THREE.ConeGeometry(a * .78, .06, 4), F.madera, { y: y0 + h / 2 + .03, ry: Math.PI / 4 }),
      pieza(new THREE.TorusGeometry(.035, .007, 5, 10, Math.PI), F.madera, { y: y0 + h / 2 + .055 })];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.push(pieza(new THREE.BoxGeometry(.016, h, .016), F.madera, { x: sx * a * .45, y: y0, z: sz * a * .45 }));
    const marco = new THREE.Mesh(fusionar(P), matMarco), papel = new THREE.Mesh(new THREE.BoxGeometry(a * .84, h * .86, a * .84), matPapel);
    papel.position.y = y0; marco.castShadow = true; g.add(marco, papel);
    const brasa = new Halo(F.brasa, F.haloOp); brasa.scale.set(F.halo, F.halo, 1); brasa.position.y = y0; g.add(brasa);
    g.scale.setScalar(esc); g.userData.brasa = brasa; return g;
  }
  const _qf = new THREE.Quaternion(), _qv = new THREE.Quaternion(), _ex = new THREE.Vector3(1, 0, 0);
  /* el farol cuelga recto del hueso que lo lleva (como si pesara), con un vaivén según la velocidad */
  function colgar(f, vel, t) { f.parent.getWorldQuaternion(_qf).invert(); f.quaternion.copy(_qf).multiply(_qv.setFromAxisAngle(_ex, Math.sin(t * 6) * FAROL.vaiven * clamp(vel / 2, 0, 1))); }
  /* accesorios en los huesos: sombrero, barba, bastón, farol y caña de pescar */
  function accesorios(cfg, hueso, esc) {
    const out = {}, mat = cfg.eco ? cfg.matEco : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 }), cab = cfg.nino ? 1.25 : 1;
    const add = (piezas, b, x, y, z) => { const m = new THREE.Mesh(fusionar(piezas), mat); m.position.set(x, y, z); m.castShadow = true; hueso(b).add(m); return m; };
    if (cfg.sombrero) add([pieza(new THREE.ConeGeometry(.3, .14, 18), cfg.sombrero, { var: .1 }), pieza(new THREE.CylinderGeometry(.06, .06, .05, 8), 0x6b4a2a, { y: -.06 })], 'cabeza', 0, .19 * cab, 0);
    if (cfg.barba) add([pieza(new THREE.ConeGeometry(.07, .22, 8), 0xf2f2f2, { rx: Math.PI, var: .1 }), pieza(new THREE.SphereGeometry(.06, 8, 6), 0xf2f2f2, { y: .07, sx: 1.4, sy: .6 })], 'cabeza', 0, -.06, .07);
    if (cfg.baston) out.baston = add([pieza(new THREE.CylinderGeometry(.018, .022, 1.1 / esc, 6), 0x6b4a2a, { y: -.5 / esc }), pieza(new THREE.SphereGeometry(.03, 6, 5), 0x5a3a20, { y: .05 })], 'manoD', 0, -.03, .02);
    if (cfg.farol && !cfg.eco) { out.farol = farol(1 / esc); hueso('manoI').add(out.farol); out.farol.position.set(0, -.03, .02); }
    if (cfg.rutina && cfg.rutina.accion === 'ofrecer') { out.orbe = new Halo(0xfff0b0, 0); out.orbe.scale.set(.5, .5, 1); out.orbe.position.set(0, 1.02, .34); }
    if (cfg.rutina && (cfg.rutina.tipo === 'pescar' || cfg.rutina.accion === 'pescar')) {
      out.caña = add([pieza(new THREE.CylinderGeometry(.008, .016, 2.6 / esc, 5), 0x8a6a3a, { y: 1.25 / esc })], 'manoD', 0, -.03, .02); out.caña.rotation.x = 1.0;
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
      if (!cfg.eco) { out.sedal = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0xe8e4d8, transparent: true, opacity: .6 })); out.sedal.frustumCulled = false; scene.add(out.sedal);
      out.corcho = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), new THREE.MeshStandardMaterial({ color: 0xd8443a, roughness: .5 })); scene.add(out.corcho); }
    }
    return out;
  }

  /* ---------- un habitante ---------- */
  function crear(cfg) {
    const esc = (cfg.alto || 1.5) / 1.62, g = new THREE.Group(), R = new THREE.Group(); g.add(R); R.scale.setScalar(esc);
    const B = HUESOS.map(h => { const b = new THREE.Bone(); b.name = h[0]; b.position.set(h[2], h[3], h[4]); return b; });
    HUESOS.forEach((h, i) => { if (h[1] >= 0) B[h[1]].add(B[i]); });
    const C = cuerpo(cfg), rc = C.rc;
    for (const n of CARA) { const b = new THREE.Bone(), p = C.cara[n]; b.name = n; b.position.set(p[0], p[1] - CABEZA_Y, p[2]); B[H.cabeza].add(b); B.push(b); }
    const base = {}; for (const n of CARA) base[n] = B[H[n]].position.clone();
    const malla = new THREE.SkinnedMesh(C.geo, cfg.eco ? cfg.matEco : Hikari.material()); malla.add(B[0]); malla.bind(new THREE.Skeleton(B)); malla.castShadow = true; malla.receiveShadow = true;
    malla.geometry.boundingSphere.radius *= 1.6; R.add(malla); if (cfg.eco) malla.castShadow = false;
    const hb = n => B[H[n]], acc = accesorios(cfg, hb, esc), h = cfg.alto || 1.5;
    if (acc.orbe) R.add(acc.orbe);
    const et = etiqueta(cfg.nombre || ' ', { ancho: 2.1, tam: 40, color: '#ffe6ad' }); et.position.y = h + .38; g.add(et);
    const sig = etiqueta('!', { ancho: 1.2, tam: 90, color: '#ffd45a' }); sig.position.y = h + 1.05; sig.visible = false; g.add(sig);
    if (cfg.eco) et.visible = sig.visible = false;
    // los ecos que juegan o caminan usan las rutinas normales; el resto repite su acción en el sitio
    const ac = cfg.rutina && cfg.rutina.accion, R0 = ac === 'jugar' ? { tipo: 'jugar', radio: 2.2, vel: 2.2 } : ac === 'caminar' ? { tipo: 'pasear', puntos: [[0, 0], [3, 1.5]], vel: .45 } : cfg.rutina || { tipo: 'quieto' };
    const S = { t: Math.random() * 9, casa: null, dest: null, pausa: rnd(1, 3), vel: 0, fase: 0, sentado: R0.tipo === 'meditar' ? 1 : 0, reverencia: 0, gesto: 0, mira: 0, miraT: 0, i: 0, salto: 0, tirón: 0,
      parp: rnd(1, 4), parpT: 0, saludo: 0, cerca: false, giro: 0, cara: Object.assign({}, GESTOS.neutro) };
    let gesto = GESTOS[cfg.gesto || GESTO_DE[ac] || GESTO_DE[R0.tipo]] || GESTOS.neutro;
    const P = { lean: 0, roll: 0, hipY: 0, twist: 0, head: 0, headY: 0, aL: [.1, .1, .2], aR: [.1, .1, .2], lL: [0, 0], lR: [0, 0] };
    const o = {
      g, nombre: cfg.nombre, id: cfg.id, sig, h,
      /* cinemáticas: andar hasta (x, z) a vel m/s y quedarse allí (necesita una rutina 'pasear') */
      ocupado: false, hablando: false,   // hablando: en una escena, mueve la boca
      /* escenas: acciones de 0 a 1 que se mezclan con la pose (alza: el farol en alto; llora: las manos a la cara;
         inclina: una reverencia) */
      accion: { alza: 0, llora: 0, inclina: 0 },
      ponerGesto(n) { if (GESTOS[n]) gesto = GESTOS[n]; },
      get farol() { return acc.farol; },
      /* el farol se le cae de la mano: queda en el mundo con su posición y giro (lo devuelve para animarlo) */
      soltarFarol() { const f = acc.farol; if (!f) return null; g.updateMatrixWorld(true); const m = f.matrixWorld.clone(); f.parent.remove(f); scene.add(f); m.decompose(f.position, f.quaternion, f.scale); acc.farol = null; return f; },
      ir(x, z, vel) { S.dest = { x, z }; S.casa = { x, y: g.position.y, z, yaw: g.rotation.y }; R0.vel = vel || GENTE.vel.andar; S.pausa = 99; },
      actualizar(dt, px, pz) {
        dt = Math.min(dt, .05); S.t += dt;
        if (!S.casa) S.casa = { x: g.position.x, y: g.position.y, z: g.position.z, yaw: g.rotation.y };
        const giroAnterior = g.rotation.y;
        const dx = px - g.position.x, dz = pz - g.position.z, d = Math.hypot(dx, dz), habla = o.hablando || !!(UI.dlg && UI.dlg.nombre === cfg.nombre);
        const atiende = !cfg.eco && !o.ocupado && (d < GENTE.atender || habla), aJ = Math.atan2(dx, dz);   // ocupado: en un suceso (el asedio) no se para a mirar a Hikari
        // saludo: al llegar Hikari, sonríe y alza las cejas un momento
        if (!cfg.eco) { if (d < GENTE.atender && !S.cerca) S.saludo = 1; S.cerca = d < GENTE.atender; } S.saludo = Math.max(0, S.saludo - dt * .45);
        // rutina: elegir y seguir destinos
        let quiere = 0;
        if (!atiende && !(o.ocupado && !S.dest) && (R0.tipo === 'pasear' || R0.tipo === 'vigilar' || R0.tipo === 'jugar')) {   // ocupado y sin destino: se queda quieto
          if (!S.dest) { S.pausa -= dt; if (S.pausa <= 0) { S.dest = destino(R0, S); } }
          if (S.dest) {
            const ex = S.dest.x - g.position.x, ez = S.dest.z - g.position.z, l = Math.hypot(ex, ez);
            if (l < .25) { S.dest = null; S.pausa = R0.tipo === 'jugar' ? rnd(.3, 1.5) : rnd(GENTE.pausa[0], GENTE.pausa[1]); if (R0.tipo === 'jugar' && Math.random() < .4) S.salto = 1; }
            else { quiere = R0.vel || GENTE.vel.andar; g.rotation.y = angDamp(g.rotation.y, Math.atan2(ex, ez), GENTE.giro, dt); }
          }
        } else if (atiende) g.rotation.y = angDamp(g.rotation.y, aJ, GENTE.giro, dt);
        else if (R0.tipo === 'pescar' || R0.tipo === 'meditar') g.rotation.y = angDamp(g.rotation.y, S.casa.yaw, 2, dt);
        S.giro = damp(S.giro, angDif(giroAnterior, g.rotation.y) / Math.max(dt, .001), GENTE.animacion.cabeza, dt);
        S.vel = damp(S.vel, quiere, 5, dt);
        if (S.vel > .02) { g.position.x += Math.sin(g.rotation.y) * S.vel * dt; g.position.z += Math.cos(g.rotation.y) * S.vel * dt; g.position.y = damp(g.position.y, suelo(g.position.x, g.position.z, g.position.y), 12, dt); }
        // Taiyo medita de pie; al acercarse Hikari alza la cabeza y la saluda con una reverencia
        if (R0.tipo === 'meditar') { const antes = S.sentado; S.sentado = damp(S.sentado, d < GENTE.despertar || habla ? 0 : 1, 2.2, dt); if (antes > .5 && S.sentado <= .5) S.reverencia = 1; }
        S.reverencia = Math.max(0, (S.reverencia || 0) - dt * .9);
        S.gesto = damp(S.gesto, habla ? 1 : 0, 4, dt); S.salto = Math.max(0, S.salto - dt * 2.2);
        pose(dt, d, aJ - g.rotation.y, habla);
        sig.position.y = h + 1.05 + Math.sin(S.t * 3) * .1; et.visible = !cfg.eco && d < 14; if (et.visible) et.material.opacity = smooth(14, 9, d); sig.visible = !cfg.eco && sig.userData.v && d < 60;
        if (acc.orbe) { acc.orbe.opacidad = cfg.matEco.opacity * 1.6; const k = 1 + .15 * Math.sin(S.t * 3); acc.orbe.scale.set(.5 * k, .5 * k, 1); }
        if (acc.sedal) sedal();
        if (acc.farol && acc.farol.visible) colgar(acc.farol, S.vel, S.t);
      }
    };
    /* siguiente destino de la rutina (puntos relativos a su casa o un círculo para jugar) */
    function destino(Rt, St) {
      if (Rt.tipo === 'jugar') { const a = Math.random() * TAU, r = (Rt.radio || 3) * (.4 + .6 * Math.random()); return { x: St.casa.x + Math.cos(a) * r, z: St.casa.z + Math.sin(a) * r }; }
      const pts = Rt.puntos || [[0, 0]]; St.i = (St.i + 1) % pts.length; return { x: St.casa.x + pts[St.i][0], z: St.casa.z + pts[St.i][1] };
    }
    function suelo(x, z, y) { const s = Sol.suelo(x, z, y + .4); return Math.max(altura(x, z), s); }
    /* pose: andar, respirar, mirar, hablar, sentarse y la postura de cada uno */
    function pose(dt, d, rel, habla) {
      const v = S.vel, n = smooth(.05, GENTE.vel.correr, v), T = { lean: cfg.encorvado || 0, roll: 0, hipY: 0, twist: 0, head: 0, headY: 0, aL: [.08, .12, .25], aR: [.08, .12, .25], lL: [0, .02], lR: [0, .02] };
      // respiración y balanceo del peso
      T.hipY += Math.sin(S.t * 1.6) * .006; T.roll += Math.sin(S.t * .5) * GENTE.animacion.balanceo;
      T.twist = clamp(-S.giro * GENTE.animacion.giro, -.18, .18);
      if (v > .05) {   // andar o correr: zancada según la velocidad
        S.fase = (S.fase + v / GENTE.zancada * dt * .5) % 1; const s = Math.sin(S.fase * TAU), c = Math.cos(S.fase * TAU);
        T.lL = [s * (.35 + .35 * n), Math.max(0, -c) * (.4 + .5 * n) + .05]; T.lR = [-s * (.35 + .35 * n), Math.max(0, c) * (.4 + .5 * n) + .05];
        const brazos = Math.sin(S.fase * TAU - .22);
        T.aL = [-brazos * (.25 + .35 * n), .12, .3 + .5 * n]; T.aR = [brazos * (.25 + .35 * n), .12, .3 + .5 * n];
        T.hipY += (Math.abs(c) - .5) * .025 * (1 + n); T.lean += .04 + .15 * n;
        T.roll += s * GENTE.animacion.balanceo * n;
      }
      if (cfg.baston) { T.aR = [.35 + (v > .05 ? Math.sin(S.fase * TAU) * .15 : 0), .15, .5]; T.lean += .1; }
      if (acc.farol) T.aL = [.3 + (v > .05 ? -Math.sin(S.fase * TAU) * .08 : 0), .12, .8];   // el farol, algo adelantado
      else if (cfg.farolCerrado) T.aL = [.1 + (v > .05 ? -Math.sin(S.fase * TAU) * .04 : 0), .12, .08];   // cerrado: junto al cuerpo, con balanceo leve
      const AC = o.accion;
      if (AC.alza > 0) { const k = AC.alza; T.aL = [lerp(T.aL[0], 2.7, k), lerp(T.aL[1], .15, k), lerp(T.aL[2], .2, k)]; T.head = lerp(T.head, -.35, k); T.lean = lerp(T.lean, -.05, k); }
      if (AC.llora > 0) { const k = AC.llora; T.head = lerp(T.head, .5, k); T.lean += .15 * k; T.roll += Math.sin(S.t * 9) * .02 * k; for (const a of [T.aL, T.aR]) { a[0] = lerp(a[0], 1.25, k); a[2] = lerp(a[2], 1.95, k); } }
      if (AC.inclina > 0) { const k = AC.inclina; T.lean = lerp(T.lean, .65, k); T.head = lerp(T.head, .5, k); }
      // acciones de los ecos
      if (ac === 'cantar') { const k = .5 + .5 * Math.sin(S.t * .9); T.aL = [1.5 + .4 * k, .55, .35]; T.aR = [1.5 + .4 * k, .55, .35]; T.head = -.35; T.lean -= .05; T.roll += Math.sin(S.t * .9) * .03; }
      if (ac === 'ofrecer') { T.aL = [1.05, -.25, 1.0]; T.aR = [1.05, -.25, 1.0]; T.head = .2; T.lean += .08 + .05 * Math.sin(S.t * 1.2); }
      if (ac === 'señalar') { T.aR = [1.85, .15, .05]; T.aL = [.2, .15, .4]; T.head = -.25; T.lean -= .05; }
      if (ac === 'pescar' && cfg.eco) { T.aR = [.95, .05, .45]; T.aL = [.7, -.15, .9]; T.twist = -.15; }
      if (R0.tipo === 'pescar') { T.aR = [.95 + S.tirón * .4, .05, .45]; T.aL = [.7, -.15, .9]; T.twist = -.15; if (Math.random() < dt * .08) S.tirón = 1; S.tirón = Math.max(0, S.tirón - dt * 1.5); }
      if (R0.tipo === 'vigilar' && v < .05) { T.headY = Math.sin(S.t * .4) * .7; T.aL = [-.2, .05, 1.2]; T.aR = [-.2, .05, 1.2]; }   // manos a la espalda, mirando alrededor
      if (S.salto > 0) { T.hipY += Math.sin(S.salto * Math.PI) * .18; T.aL = [2.4, .3, .2]; T.aR = [2.4, .3, .2]; }
      // la cabeza sigue a Hikari si está cerca; al hablar, gestos con la mano y asentir
      if (cfg.eco) { /* los ecos no ven a Hikari: viven su recuerdo */ }
      else if (d < GENTE.mirar) T.headY = clamp(angDif(0, rel), -1, 1);
      else { S.miraT -= dt; if (S.miraT < 0) { S.miraT = rnd(2, 5); S.mira = rnd(-.6, .6); } if (R0.tipo !== 'vigilar') T.headY = S.mira; }
      if (S.gesto > .01) { const k = S.gesto; T.aR = [lerp(T.aR[0], .9 + Math.sin(S.t * 3.1) * .3, k), lerp(T.aR[1], .35 + Math.sin(S.t * 2.3) * .15, k), lerp(T.aR[2], 1.3, k)]; T.head += Math.sin(S.t * 4.2) * .08 * k; }
      // meditación de pie: manos juntas ante el pecho y la cabeza inclinada; reverencia al saludar
      const st = S.sentado;
      if (st > .01) { T.aL = [lerp(T.aL[0], .95, st), lerp(T.aL[1], -.42, st), lerp(T.aL[2], 1.95, st)]; T.aR = [lerp(T.aR[0], .95, st), lerp(T.aR[1], -.42, st), lerp(T.aR[2], 1.95, st)]; T.head = lerp(T.head, .45, st); T.headY *= 1 - st; T.hipY += Math.sin(S.t * .8) * .006 * st; }
      if (S.reverencia > 0) { const k = Math.sin(Math.min(1, S.reverencia) * Math.PI); T.lean += .55 * k; T.head += .25 * k; }
      const A = GENTE.animacion, k = 1 - Math.exp(-A.cuerpo * dt), kb = 1 - Math.exp(-A.brazos * dt), kc = 1 - Math.exp(-A.cabeza * dt);
      for (const f of ['lean', 'roll', 'hipY', 'twist', 'head', 'headY']) P[f] += (T[f] - P[f]) * (f === 'head' || f === 'headY' ? kc : k);
      for (const f of ['aL', 'aR']) for (let i = 0; i < 3; i++) P[f][i] += (T[f][i] - P[f][i]) * kb;
      for (const f of ['lL', 'lR']) for (let i = 0; i < 2; i++) P[f][i] += (T[f][i] - P[f][i]) * kb;
      const hb = n2 => B[H[n2]];
      hb('cadera').position.y = .82 + P.hipY; hb('cadera').rotation.set(P.lean * .4, 0, P.roll);
      hb('columna').rotation.set(P.lean * .35, P.twist * .5, -P.roll * .5); hb('pecho').rotation.set(P.lean * .25 + Math.sin(S.t * 1.6) * .015, P.twist * .5, 0);
      hb('cuello').rotation.set(P.head * .4 - P.lean * .4, P.headY * .4, 0); hb('cabeza').rotation.set(P.head * .6 - P.lean * .3, P.headY * .6, 0);
      for (const [s, sf, a, l] of [[1, 'I', P.aL, P.lL], [-1, 'D', P.aR, P.lR]]) {
        hb('brazo' + sf).rotation.set(-a[0], 0, s * (a[1] + .08)); hb('antebrazo' + sf).rotation.set(-a[2], 0, 0);
        hb('muslo' + sf).rotation.set(-l[0], 0, s * .02); hb('pierna' + sf).rotation.set(l[1], 0, 0); hb('pie' + sf).rotation.set(-l[1] * .3 + l[0] * .2, 0, 0);
      }
      expresion(dt, habla, st);
    }
    /* cara: gesto de base, saludo, habla (o canto) y parpadeo, aplicados a los huesos de la cara */
    function expresion(dt, habla, st) {
      const F = Object.assign({}, gesto);
      if (S.saludo > 0) { const k = Math.sin(Math.min(1, S.saludo) * Math.PI); F.sonrisa = lerp(F.sonrisa, .85, k); F.cejas = lerp(F.cejas, .8, k); F.ojos = Math.max(F.ojos, k); F.frunce = lerp(F.frunce, -.2, k); }
      if (habla) { F.boca = .25 + .45 * Math.abs(Math.sin(S.t * 10.5)) * (.55 + .45 * Math.sin(S.t * 2.7)); F.sonrisa = Math.max(F.sonrisa, .3); F.cejas += .2 * Math.sin(S.t * 1.7); F.ojos = Math.max(F.ojos, .9); }
      else if (F.canta) F.boca = .35 + .35 * (.5 + .5 * Math.sin(S.t * 1.8));
      if (st > .5 || S.reverencia > .2) F.ojos = Math.min(F.ojos, .15);   // medita o hace la reverencia con los ojos cerrados
      const k = 1 - Math.exp(-8 * dt); for (const f of ['sonrisa', 'ojos', 'cejas', 'frunce', 'boca']) S.cara[f] += (F[f] - S.cara[f]) * k;
      let ojos = S.cara.ojos;
      S.parp -= dt; if (S.parp <= 0) { S.parp = rnd(GENTE.parpadeo[0], GENTE.parpadeo[1]); S.parpT = .16; }
      if (S.parpT > 0) { S.parpT -= dt; ojos *= Math.abs(S.parpT / .16 * 2 - 1); }
      const c = S.cara;
      for (const [s, sf] of [[1, 'I'], [-1, 'D']]) {
        const ojo = hb('ojo' + sf), ceja = hb('ceja' + sf), com = hb('comisura' + sf);
        ojo.scale.set(1, Math.max(.06, ojos), 1);
        ceja.position.y = base['ceja' + sf].y + c.cejas * rc * .07; ceja.rotation.z = s * c.frunce * .5;
        com.position.set(base['comisura' + sf].x + s * c.sonrisa * rc * .025, base['comisura' + sf].y + c.sonrisa * rc * .08, base['comisura' + sf].z);
      }
      const b = hb('boca'); b.scale.set(1 - c.boca * .2, 1 + c.boca * 3.2, 1); b.position.y = base.boca.y - c.boca * rc * .03;
    }
    /* sedal de la caña de Kaito hasta el corcho, que flota en el agua */
    const _p = new THREE.Vector3();
    function sedal() {
      g.updateMatrixWorld(true); _p.set(0, 2.6 / esc, 0); acc.caña.localToWorld(_p);
      const fx = _p.x + Math.sin(g.rotation.y) * .6, fz = _p.z + Math.cos(g.rotation.y) * .6, fy = NIVEL_AGUA + .03 + Math.sin(S.t * 2.2) * .02 - S.tirón * .06;
      acc.corcho.position.set(fx, fy, fz);
      const a = acc.sedal.geometry.attributes.position; a.setXYZ(0, _p.x, _p.y, _p.z); a.setXYZ(1, fx, fy, fz); a.needsUpdate = true;
    }
    return o;
  }
  return { crear, materialEco, farol, colgar, HUESOS };
})();
