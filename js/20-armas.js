/* === Ecos de Luz · 20-armas.js ===
   Armas de Hikari: ficha de combate de cada arma (combo propio, golpe cargado, golpe tras la
   esquiva, poses de reposo y de guardia), trayectoria de la hoja en el espacio del cuerpo (la usan
   la animación de 17-hikari.js y el combate de 21-combate.js), modelos procedurales (hoja curva,
   guarda, empuñadura con cordón, funda) y estelas de luz. Arte sustituible: cada modelo se
   construye en su propia función.
   Ejes del cuerpo: +Z delante, +X izquierda de Hikari, +Y arriba. Las direcciones son
   [giro, alzada] en grados (giro > 0 hacia la derecha de Hikari, alzada > 0 hacia arriba). */
"use strict";

/* Golpes. tajo: la hoja gira de 'de' a 'a' por el camino corto, o 'giro' grados sobre 'eje' (por defecto el vertical:
   giro > 0 barre de derecha a izquierda por delante); estocada: la mano va de mano[0] a mano[1].
   t: [fin de la anticipación, fin del golpe, fin del seguimiento] en fracción de 'dur' (s con vel 1 del arma).
   El golpe solo daña entre t[0] y t[1]. mult: daño · alc: alcance (× el del arma) · peso: 1 ligero, 2 medio, 3 pesado
   avance: metros que avanza al golpear · ang: margen del barrido (rad) · onda: onda de choque al terminar el golpe
   vuelta: grados que gira el cuerpo · salto: impulso hacia arriba (m/s) · baja: cuánto baja la cadera · filo: hacia dónde mira el filo */
const ARMAS = {
  mano: {   // sin arma: golpes de palma con luz
    agarre: 'una', pivote: [-.11, .88, .04], radio: [.2, .34], izq: 0, alcance: 1.8, daño: 4, estela: 0x9ffff0, hoja: [0, .16],
    listo: { mano: [-.15, .8, .16], dir: [-25, 55] }, guardia: { mano: [-.07, .92, .2], dir: [-35, 75] },
    combo: [
      { tipo: 'estocada', mano: [[-.14, .84, .02], [-.09, .88, .34]], dir: [0, 10], dur: .32, t: [.3, .5, .7], mult: 1, peso: 1, avance: .3, ang: .45 },
      { de: [75, 20], a: [-45, 5], dur: .34, t: [.3, .52, .7], mult: 1, peso: 1, avance: .3, ang: .3 },
      { tipo: 'estocada', mano: [[-.12, .72, .06], [-.07, 1.0, .3]], dir: [0, 60], dur: .42, t: [.35, .55, .72], mult: 1.4, peso: 1, avance: .5, ang: .5 }
    ],
    cargado: { tipo: 'estocada', mano: [[-.16, .82, -.08], [-.08, .9, .38]], dir: [0, 5], dur: .5, t: [.3, .48, .7], mult: 2.2, alc: 1.3, peso: 2, avance: 1.6, ang: .5 },
    esquiva: { de: [40, -40], a: [-20, 60], dur: .38, t: [.15, .38, .6], mult: 1.3, peso: 1, avance: .8, ang: .4 }
  },
  katana: {   // rápida, a una mano: tajo diagonal, revés, tajo ascendente y estocada; cargado: iai (desenvaine a la carrera)
    agarre: 'una', pivote: [-.12, .9, .02], radio: [.3, .38], izq: -.1, estela: 0x7ffff0, hoja: [.3, .64],
    funda: { hueso: 'cadera', pos: [.12, 0, .12], rot: [-1.87, 0, -.22] },
    listo: { mano: [-.17, .76, .18], dir: [-14, 30] }, guardia: { mano: [-.04, .86, .24], dir: [-16, 68], dos: true },
    combo: [
      { de: [70, 55], a: [-65, -32], dur: .4, t: [.3, .5, .68], mult: 1, peso: 1, avance: .45 },
      { de: [-80, 8], a: [92, -6], dur: .38, t: [.25, .46, .64], mult: 1, peso: 1, avance: .45 },
      { de: [25, -55], a: [-15, 78], dur: .4, t: [.28, .48, .66], mult: 1.15, peso: 1, avance: .4, ang: .4 },
      { tipo: 'estocada', mano: [[-.13, .84, -.06], [-.05, .9, .44]], dir: [0, -4], dur: .52, t: [.38, .52, .74], mult: 1.7, alc: 1.25, peso: 2, avance: 1.1, ang: .28 }
    ],
    cargado: { de: [115, 4], giro: 220, dur: .6, t: [.22, .44, .7], mult: 2.2, alc: 1.3, peso: 2, avance: 3.4, ang: .35 },
    esquiva: { de: [30, -50], a: [-35, 72], dur: .42, t: [.14, .36, .6], mult: 1.35, peso: 1, avance: 1.2, ang: .4 }
  },
  naginata: {   // larga, a dos manos: estocada, barrido amplio y golpe por encima de la cabeza; cargado: remolino
    agarre: 'dos', pivote: [-.13, .7, 0], radio: [.1, .14], izq: .3, estela: 0xa8d8ff, hoja: [1.22, 1.52],
    funda: { hueso: 'pecho', pos: [.2, -.5, -.13], rot: [0, 0, .3] },
    listo: { mano: [-.15, .7, .04], dir: [-10, 20] }, guardia: { mano: [-.12, .76, .1], dir: [-55, 50] },
    combo: [
      { tipo: 'estocada', mano: [[-.16, .68, -.12], [-.1, .74, .18]], dir: [-4, 4], dur: .48, t: [.32, .48, .66], mult: 1, alc: 1.1, peso: 1, avance: .8, ang: .3 },
      { de: [125, 4], giro: 245, dur: .6, t: [.3, .55, .74], mult: 1.1, peso: 2, avance: .4, ang: .3 },
      { de: [0, 140], a: [0, -28], dur: .66, t: [.38, .56, .76], mult: 1.45, alc: 1.05, peso: 2, avance: .7, ang: .32 }
    ],
    cargado: { de: [88, 0], a: [88, 0], filo: [0, 0, 1], vuelta: -420, dur: .85, t: [.3, .74, .86], mult: 2, alc: 1.1, peso: 2, avance: 0, ang: .35 },
    esquiva: { de: [60, -40], a: [-70, 50], dur: .52, t: [.16, .4, .62], mult: 1.3, peso: 2, avance: 1, ang: .35 }
  },
  odachi: {   // enorme, a dos manos y lenta: tajo diagonal, barrido y golpe con onda; cargado: salto con onda grande
    agarre: 'dos', pivote: [-.06, .88, .04], radio: [.26, .34], izq: -.12, estela: 0xffc870, hoja: [.42, .88],
    funda: { hueso: 'pecho', pos: [-.1, .14, -.11], rot: [0, 0, -2.62] },
    listo: { mano: [-.12, .76, .2], dir: [-10, 42] }, guardia: { mano: [-.04, .84, .24], dir: [-8, 74] },
    combo: [
      { de: [50, 82], a: [-55, -42], dur: .5, t: [.42, .6, .78], mult: 1, peso: 2, avance: .5 },
      { de: [-115, 2], giro: -223, dur: .5, t: [.4, .6, .78], mult: 1.1, peso: 2, avance: .5, ang: .3 },
      { de: [0, 125], a: [0, -42], dur: .62, t: [.48, .62, .82], mult: 1.5, peso: 3, avance: .6, onda: { r: 2.6, mult: .6 }, baja: .12 }
    ],
    cargado: { de: [0, 135], a: [0, -46], dur: .7, t: [.42, .6, .82], mult: 2.4, peso: 3, avance: 2.2, salto: 5.5, onda: { r: 4, mult: .8 }, baja: .15 },
    esquiva: { de: [-35, -52], a: [35, 76], dur: .46, t: [.18, .4, .64], mult: 1.35, peso: 2, avance: 1 }
  }
};

const Armas = (() => {
  const RAD = Math.PI / 180, V = () => new THREE.Vector3();
  /* estilos de distancia y de luz (71-arco-luz.js, 72-escuela-luz.js): no tienen combos, solo la pose de la mano; apunta: brazo estirado al frente */
  ARMAS.arco = Object.assign({}, ARMAS.mano, { estela: 0xffe9a8, combo: [], listo: { mano: [-.17, .72, .2], dir: [-20, 40] }, apunta: { mano: [-.1, 1.22, .42], dir: [0, 4] } });
  for (const id of ['escuela', 'escuela_viento', 'escuela_brasa', 'escuela_escarcha', 'escuela_oscuridad']) ARMAS[id] = Object.assign({}, ARMAS.mano, { estela: 0x9ffff0, combo: [], listo: { mano: [-.15, .78, .2], dir: [-20, 50] }, apunta: { mano: [-.08, 1.12, .38], dir: [0, 10] } });
  const ficha = id => ARMAS[id] || ARMAS.mano;

  /* ---------- trayectoria de la hoja ---------- */
  function dirDe(gp, out) { const y = gp[0] * RAD, p = gp[1] * RAD; return out.set(-Math.sin(y) * Math.cos(p), Math.sin(p), Math.cos(y) * Math.cos(p)); }
  const perp = (d, ref, out) => { out.copy(ref).addScaledVector(d, -ref.dot(d)); if (out.lengthSq() < 1e-8) out.set(1, 0, 0).addScaledVector(d, -d.x); return out.normalize(); };
  const CACHE = new WeakMap(), _ref = V(), _o2 = { G: V(), D: V(), F: V() };
  function datos(g) {   // rotación del tajo: dirección inicial, eje y ángulo
    let d = CACHE.get(g); if (d) return d;
    const dA = dirDe(g.de, V()); let eje, ang;
    if (g.giro) { const e = g.eje || [0, 1, 0]; eje = new THREE.Vector3(e[0], e[1], e[2]).normalize(); ang = g.giro * RAD; }
    else { const dB = dirDe(g.a, V()); eje = V().crossVectors(dA, dB); const s = eje.length(); ang = Math.atan2(s, dA.dot(dB)); if (s < 1e-5) eje.set(0, 1, 0); else eje.multiplyScalar(1 / s); }
    d = { dA, eje, ang }; CACHE.set(g, d); return d;
  }
  const ANTIC = .12, SIGUE = .1;   // la hoja retrocede antes del golpe y sigue un poco después
  /* avance del arco: < 0 anticipación, 0..1 golpe (rápido al principio), > 1 seguimiento */
  function arco(g, f) {
    const t = g.t;
    if (f < t[0]) return -ANTIC * easeIO(f / t[0]);   // (con ángulos negativos el arco recorre el giro al revés)
    if (f < t[1]) return -ANTIC + (1 + ANTIC) * (1 - Math.pow(1 - (f - t[0]) / (t[1] - t[0]), 2.2));
    if (f < t[2]) return 1 + SIGUE * Math.sin((f - t[1]) / (t[2] - t[1]) * Math.PI / 2);
    return 1 + SIGUE;
  }
  function estatica(F, p, o) {
    o.G.set(p.mano[0], p.mano[1], p.mano[2]); dirDe(p.dir, o.D); perp(o.D, _ref.set(0, -.4, 1), o.F);
    o.giro = 0; o.inclina = 0; o.baja = 0; o.exacto = false; o.dos = F.agarre === 'dos' || !!p.dos; o.izq = F.izq;
    return o;
  }
  /* pose del arma en el espacio del cuerpo: G empuñadura, D hacia la punta, F hacia el filo; giro del tronco,
     inclinación, bajada de la cadera, si va a dos manos y si sigue exactamente la trayectoria (golpe) */
  function pose(id, g, f, modo, o) {
    const F = ficha(id);
    if (!g) return estatica(F, F[modo] || F.listo, o);
    const t = g.t, peso = g.peso || 1;
    let avance;
    if (g.tipo === 'estocada') {
      const u = f < t[0] ? 0 : f < t[1] ? 1 - Math.pow(1 - (f - t[0]) / (t[1] - t[0]), 2.4) : 1, a = g.mano[0], b = g.mano[1];
      o.G.set(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
      if (f < t[0]) o.G.z -= .05 * easeIO(f / t[0]);
      dirDe(g.dir, o.D); perp(o.D, _ref.set(0, -1, .1), o.F); avance = u;
    } else {
      const th = arco(g, f), d = datos(g), r = g.radio || F.radio, piv = g.pivote || F.pivote;
      o.D.copy(d.dA).applyAxisAngle(d.eje, d.ang * th);
      if (g.filo) o.F.set(g.filo[0], g.filo[1], g.filo[2]); else o.F.crossVectors(d.eje, o.D);
      perp(o.D, o.F.lengthSq() > 1e-6 ? o.F : _ref.set(0, 0, 1), o.F);
      o.G.set(piv[0], piv[1], piv[2]).addScaledVector(o.D, lerp(r[0], r[1], clamp(th, 0, 1)));
      avance = clamp(th, 0, 1);
    }
    const h = Math.hypot(o.D.x, o.D.z);
    o.giro = h > .3 ? clamp(Math.atan2(o.D.x, o.D.z) * .45, -.9, .9) : 0;
    o.inclina = (g.inclina !== undefined ? g.inclina : .08 * peso) * Math.sin(avance * Math.PI) + (f >= t[0] && f < t[2] ? .04 * peso : 0);
    o.baja = (g.baja || 0) * smooth(t[0], t[1], f) * (1 - smooth(t[2], 1, f));
    o.exacto = f >= t[0] && f < t[1]; o.dos = F.agarre === 'dos'; o.izq = F.izq;
    if (f > t[2]) {   // recuperación: vuelve a la pose de reposo
      const k = easeIO((f - t[2]) / (1 - t[2])); estatica(F, F.listo, _o2);
      o.G.lerp(_o2.G, k); o.D.lerp(_o2.D, k).normalize(); perp(o.D, o.F.lerp(_o2.F, k), o.F); o.giro *= 1 - k; o.inclina *= 1 - k;
    }
    return o;
  }
  const _p = { G: V(), D: V(), F: V() };
  /* hacia dónde apunta la hoja (rad, > 0 a la derecha de Hikari) en el momento f: lo usa el barrido del combate */
  function giroHoja(id, g, f) {
    pose(id, g, f, 'listo', _p); const h = Math.hypot(_p.D.x, _p.D.z);
    if (h > .25) return Math.atan2(-_p.D.x, _p.D.z);
    return g.tipo === 'estocada' ? g.dir[0] * RAD : ((g.de[0] + (g.a ? g.a[0] : g.de[0])) / 2) * RAD;
  }

  /* ---------- modelos ---------- */
  let matN = 0;
  /* material de las armas: color, rugosidad, metal y brillo por vértice (aMat); un solo programa para todas */
  function material() {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 1 }), u = { value: 1 };
    m.onBeforeCompile = sh => {
      Atmosfera.inyectar(sh); sh.uniforms.uBrilloArma = u;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 aMat; varying vec3 vMat;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMat = aMat;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uBrilloArma; varying vec3 vMat;')
        .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vMat.x;')
        .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = vMat.y;')
        .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance += vColor * vMat.z * uBrilloArma;');
    };
    m.customProgramCacheKey = () => 'arma'; m.userData.brillo = u; matN++;
    return m;
  }
  /* constructor de mallas con color y material por vértice: [rugosidad, metal, brillo] */
  class Forja {
    constructor() { this.p = []; this.c = []; this.m = []; this.i = []; }
    v(x, y, z, c, m) { this.p.push(x, y, z); this.c.push(c.r, c.g, c.b); this.m.push(m[0], m[1], m[2]); return this.p.length / 3 - 1; }
    /* torno alrededor de Y; perfil [[radio, y, color?], ...] de abajo arriba; o: sx, sz (sección elíptica), dz(y) (curva) */
    torno(perfil, lados, col, mat, o) {
      o = o || {}; const base = this.p.length / 3, sx = o.sx || 1, sz = o.sz || 1;
      for (const [r, y, c] of perfil) for (let a = 0; a <= lados; a++) { const an = a / lados * TAU; this.v(Math.cos(an) * r * sx, y, (o.dz ? o.dz(y) : 0) + Math.sin(an) * r * sz, c || (typeof col === 'function' ? col(an, y) : col), mat); }
      for (let k = 0; k < perfil.length - 1; k++) for (let a = 0; a < lados; a++) { const i0 = base + k * (lados + 1) + a, i1 = i0 + 1, i2 = i0 + lados + 1, i3 = i2 + 1; this.i.push(i0, i2, i1, i1, i2, i3); }
    }
    /* hoja curva a lo largo de +Y (filo hacia +Z, lomo hacia -Z): cada cara con sus vértices para aristas nítidas */
    hoja(y0, L, w0, w1, e, curva, punta, acero, filo, brillo) {
      const N = 22, aris = [];
      for (let k = 0; k <= N; k++) {
        const s = k / N, y = y0 + s * L, zc = -curva * s * s, w = lerp(w0, w1, s), q = s > 1 - punta ? (s - (1 - punta)) / punta : 0;
        const zl = zc - w * .45, zf = lerp(zc + w * .5, zl, Math.pow(q, 1.6)), zs = lerp(zc + w * .06, zl, q), ee = lerp(e, e * .6, s) * (1 - q);
        aris.push([[0, zf, 1], [ee * .5, zs, 0], [ee * .42, zl, 0], [-ee * .42, zl, 0], [-ee * .5, zs, 0]].map(p => [p[0], y, p[1], p[2]]));
      }
      for (let c = 0; c < 5; c++) {   // cinco caras: filo-shinogi, shinogi-lomo, lomo, y las otras dos
        const base = this.p.length / 3;
        for (let k = 0; k <= N; k++) for (const j of [c, (c + 1) % 5]) { const p = aris[k][j], esFilo = p[3] === 1; this.v(p[0], p[1], p[2], esFilo ? filo : acero, esFilo ? [.16, .95, brillo] : [.24, .9, 0]); }
        for (let k = 0; k < N; k++) { const a = base + k * 2, b = a + 1, cc = a + 2, d = a + 3; this.i.push(a, b, cc, b, d, cc); }
      }
    }
    caja(sx, sy, sz, x, y, z, col, mat) { const g = new THREE.BoxGeometry(sx, sy, sz); g.translate(x, y, z); this.geo3(g, col, mat); }
    geo3(g, col, mat) {
      const p = g.attributes.position, base = this.p.length / 3;
      for (let k = 0; k < p.count; k++) this.v(p.getX(k), p.getY(k), p.getZ(k), col, mat);
      for (const k of g.index.array) this.i.push(base + k); g.dispose();
    }
    malla() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
      g.setAttribute('aMat', new THREE.Float32BufferAttribute(this.m, 3)); g.setIndex(this.i); g.computeVertexNormals(); g.computeBoundingSphere();
      const m = new THREE.Mesh(g, material()); m.castShadow = true; return m;
    }
  }
  const L = h => lin(h);
  const MAT = { laca: [.35, 0, 0], oro: [.3, 1, .05], hierro: [.5, .8, 0], cordon: [.85, 0, 0], madera: [.55, 0, 0] };
  /* empuñadura con cordón en espiral (de y0 a y1, hacia abajo) */
  function mango(Fo, y0, y1, r, cordon, piel) {
    const n = Math.max(6, Math.round(Math.abs(y1 - y0) / .012)), perfil = [];
    for (let k = 0; k <= n; k++) { const y = lerp(y1, y0, k / n); perfil.push([r * (1 - .06 * Math.sin(k / n * Math.PI)), y]); }
    Fo.torno(perfil, 10, (an, y) => (Math.sin(an * 2 + y * 170) * Math.sin(an * 2 - y * 170) > .1 ? piel : cordon), MAT.cordon, { sx: .85 });
  }
  /* guarda (tsuba): disco elíptico con borde dorado */
  function guarda(Fo, y, r, grosor, hierro, oro) {
    Fo.torno([[0, y - grosor / 2], [r, y - grosor / 2], [r, y - grosor / 2], [r, y + grosor / 2], [r, y + grosor / 2], [0, y + grosor / 2]], 18, hierro, MAT.hierro, { sx: .82 });
    Fo.torno([[r * .98, y - grosor * .6], [r * 1.05, y - grosor * .6], [r * 1.05, y + grosor * .6], [r * .98, y + grosor * .6]], 18, oro, MAT.oro, { sx: .82 });
  }
  function katana(conHoja) {
    const Fo = new Forja(), acero = L(0xc9d2dc), filo = L(0xeef8ff), oro = L(0xd9a441), hierro = L(0x2a2c38);
    if (conHoja) Fo.hoja(.045, .6, .026, .021, .0065, .022, .1, acero, filo, .7);
    Fo.torno([[.0, .028], [.011, .028], [.011, .028], [.012, .052], [.012, .052], [0, .052]], 8, oro, MAT.oro, { sz: 1.3 });   // habaki
    guarda(Fo, .02, .034, .006, hierro, oro);
    mango(Fo, .014, -.17, .0125, L(0x1d1d3a), L(0xe8e2d4));
    Fo.torno([[0, -.186], [.012, -.186], [.0135, -.17], [.0135, -.17], [0, -.17]], 10, oro, MAT.oro, { sx: .85 });  // kashira
    return Fo.malla();
  }
  function odachi(conHoja) {
    const Fo = new Forja(), acero = L(0xd4d8dc), filo = L(0xfff2d8), oro = L(0xe0a83a), hierro = L(0x3a2a1a);
    if (conHoja) Fo.hoja(.05, .82, .031, .024, .0075, .03, .09, acero, filo, .8);
    Fo.torno([[0, .032], [.013, .032], [.013, .032], [.014, .058], [.014, .058], [0, .058]], 8, oro, MAT.oro, { sz: 1.3 });
    guarda(Fo, .024, .046, .008, hierro, oro);
    mango(Fo, .016, -.27, .014, L(0x7a1d2a), L(0xf2e6c8));
    Fo.torno([[0, -.29], [.014, -.29], [.015, -.27], [.015, -.27], [0, -.27]], 10, oro, MAT.oro, { sx: .85 });
    return Fo.malla();
  }
  function naginata(funda) {
    const Fo = new Forja(), acero = L(0xd0dce6), filo = L(0xe6f6ff), oro = L(0xc9a24a), laca = L(0x1a2a44), negro = L(0x14141c);
    // asta lacada con anillos y regatón de metal
    const asta = [[0, -.2, laca], [.017, -.2, laca]];
    for (let y = -.16; y < 1.1; y += .3) asta.push([.017, y, laca], [.0175, y + .004, oro], [.0175, y + .016, oro], [.017, y + .02, laca]);
    asta.push([.016, 1.12, laca], [0, 1.12, laca]); Fo.torno(asta, 10, laca, MAT.laca);
    Fo.torno([[0, -.25], [.012, -.25], [.018, -.18], [.018, -.18], [0, -.18]], 10, oro, MAT.oro);
    guarda(Fo, 1.125, .03, .006, L(0x2a2c38), oro);
    if (funda) Fo.torno([[0, 1.13], [.022, 1.13], [.026, 1.2], [.026, 1.44], [.012, 1.53], [0, 1.54]], 10, negro, MAT.laca, { sx: .6, sz: 1.4, dz: y => -.04 * ((y - 1.13) / .4) ** 2 });
    else Fo.hoja(1.13, .4, .034, .03, .007, .045, .22, acero, filo, .7);
    return Fo.malla();
  }
  /* modelo en la mano: empuñadura en el origen y la hoja hacia +Y (filo hacia +Z) */
  function modelo(id) {
    if (id === 'katana') return katana(true);
    if (id === 'odachi') return odachi(true);
    if (id === 'naginata') return naginata(false);
    // el arco se arma con +Y arriba y +Z al frente; aquí la punta del arma es +Y: se gira para que los brazos del arco queden de lado
    if (id === 'arco') { const w = new THREE.Group(), m = ArcoLuz.modelo(); m.rotation.x = -Math.PI / 2; w.add(m); return w; }
    const escuela = { escuela: EscuelaLuz, escuela_viento: EscuelaViento, escuela_brasa: EscuelaBrasa, escuela_escarcha: EscuelaEscarcha, escuela_oscuridad: EscuelaOscuridad }[id];
    if (escuela) return escuela.modelo();
    return new THREE.Group();   // sin arma: solo un punto de anclaje para la estela
  }
  /* funda: la vaina (y el mango, que se oculta al desenvainar); la naginata se lleva entera a la espalda */
  function funda(id) {
    const gr = new THREE.Group();
    if (id === 'naginata') { const m = naginata(true); m.name = 'todo'; gr.add(m); return gr; }
    const lar = id === 'odachi' ? .86 : .64, curva = id === 'odachi' ? .03 : .022, col = L(id === 'odachi' ? 0x3a1a22 : 0x1d1d3a), oro = L(0xd9a441);
    const Fo = new Forja(), y0 = .028, dz = y => -curva * ((y - y0) / lar) ** 2, perfil = [[0, y0, oro], [.017, y0, oro], [.017, y0 + .018, oro], [.016, y0 + .02, col]];
    for (let k = 1; k < 8; k++) perfil.push([.016 - k * .0004, y0 + lar * k / 8, col]);
    perfil.push([.0125, y0 + lar - .02, col], [.0135, y0 + lar - .018, oro], [.0125, y0 + lar + .012, oro], [0, y0 + lar + .014, oro]);
    Fo.torno(perfil, 12, col, MAT.laca, { sx: .55, sz: 1.05, dz });
    const saya = Fo.malla(); saya.name = 'saya'; gr.add(saya);
    const m = id === 'odachi' ? odachi(false) : katana(false); m.name = 'mango'; gr.add(m);
    return gr;
  }

  /* ---------- estela de luz: cinta entre la base y la punta de la hoja ---------- */
  const _a = V(), _b = V(), _c = V(), _d = V();
  const cr = (out, p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return out.set(
    .5 * (2 * p1.x + (p2.x - p0.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (3 * p1.x - p0.x - 3 * p2.x + p3.x) * t3),
    .5 * (2 * p1.y + (p2.y - p0.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (3 * p1.y - p0.y - 3 * p2.y + p3.y) * t3),
    .5 * (2 * p1.z + (p2.z - p0.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (3 * p1.z - p0.z - 3 * p2.z + p3.z) * t3)); };
  class Estela {
    constructor(color, max) {
      this.max = max || 64; this.vida = .14; this.col = new THREE.Color(color); this.fuerza = 1.6; this.SUB = 4;
      this.s = []; this.libre = []; for (let i = 0; i < this.max; i++) this.libre.push({ b: V(), p: V(), e: 0 });
      this.h = [];   // últimas muestras reales (base, punta) para interpolar
      for (let i = 0; i < 3; i++) this.h.push({ b: V(), p: V() }); this.nh = 0;
      // tres filas por muestra: base (apagada), borde interior y punta (brillante)
      const g = new THREE.BufferGeometry(); this.pos = new Float32Array(this.max * 9); this.cols = new Float32Array(this.max * 9);
      g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
      g.setAttribute('color', new THREE.BufferAttribute(this.cols, 3).setUsage(THREE.DynamicDrawUsage));
      const idx = []; for (let i = 0; i < this.max - 1; i++) for (let f = 0; f < 2; f++) { const a = i * 3 + f; idx.push(a, a + 1, a + 3, a + 1, a + 4, a + 3); } g.setIndex(idx);
      this.mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      this.mesh.frustumCulled = false; this.mesh.visible = false; this.mesh.renderOrder = 3;
    }
    meter(b, p, e) { const o = this.libre.pop() || this.s.shift(); o.b.copy(b); o.p.copy(p); o.e = e; this.s.push(o); }
    /* base y punta en el mundo; activo: la hoja está golpeando; fuerza: brillo (contraataque, carga) */
    paso(dt, base, punta, activo, fuerza) {
      for (const o of this.s) o.e += dt;
      while (this.s.length && this.s[0].e > this.vida) this.libre.push(this.s.shift());
      if (activo) {
        const h = this.h; h.push(h.shift()); h[2].b.copy(base); h[2].p.copy(punta); this.nh = Math.min(3, this.nh + 1);
        if (this.nh === 1) this.meter(base, punta, 0);
        else {   // Catmull-Rom del último tramo, con el siguiente punto extrapolado
          const p0 = this.nh > 2 ? h[0] : h[1], p1 = h[1], p2 = h[2];
          _c.copy(p2.b).multiplyScalar(2).sub(p1.b); _d.copy(p2.p).multiplyScalar(2).sub(p1.p);
          for (let k = 1; k <= this.SUB; k++) { const t = k / this.SUB; this.meter(cr(_a, p0.b, p1.b, p2.b, _c, t), cr(_b, p0.p, p1.p, p2.p, _d, t), dt * (1 - t)); }
        }
      } else this.nh = 0;
      const n = this.s.length; this.mesh.visible = n >= 2; if (n < 2) return;
      const c = this.col, F = this.fuerza * (fuerza || 1);
      for (let i = 0; i < n; i++) {
        const o = this.s[i], u = Math.max(0, 1 - o.e / this.vida), k = u * u * F, j = i * 9, ki = k * .22;
        this.pos[j] = o.b.x; this.pos[j + 1] = o.b.y; this.pos[j + 2] = o.b.z; this.pos[j + 6] = o.p.x; this.pos[j + 7] = o.p.y; this.pos[j + 8] = o.p.z;
        this.pos[j + 3] = lerp(o.b.x, o.p.x, .82); this.pos[j + 4] = lerp(o.b.y, o.p.y, .82); this.pos[j + 5] = lerp(o.b.z, o.p.z, .82);
        this.cols[j] = 0; this.cols[j + 1] = 0; this.cols[j + 2] = 0; this.cols[j + 3] = c.r * ki; this.cols[j + 4] = c.g * ki; this.cols[j + 5] = c.b * ki; this.cols[j + 6] = c.r * k; this.cols[j + 7] = c.g * k; this.cols[j + 8] = c.b * k;
      }
      const g = this.mesh.geometry; g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; g.setDrawRange(0, (n - 1) * 12);
    }
    liberar() { this.mesh.geometry.dispose(); this.mesh.material.dispose(); }
  }

  return { ficha, pose, giroHoja, dirDe, modelo, funda, Estela, get materiales() { return matN; } };
})();
