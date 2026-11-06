/* === Ecos de Luz · 24-arquitectura.js ===
   Arte de las construcciones (la disposición y los sólidos están en 04-estructuras.js):
   · Material de obra: cada vértice lleva una clase (piedra, madera, enlucido, teja, laca, arenisca,
     metal, roca o corteza) que elige una capa de 15-texturas.js; la textura se proyecta en el mundo
     (las tejas siguen la pendiente del tejado) y se usa como detalle sobre el color de cada pieza.
   · Piezas: torii con viga curva, farol de piedra, casa de madera y enlucido con tejado de teja,
     zorro guardián, barandillas y las piezas comunes de templo. Las piezas de cada lugar (muelle, aldea, Duna,
     Marea, árbol seco) están en 34-piezas.js. Arte sustituible: cada pieza en su propia función. */
"use strict";

/* clases de material: capa de Texturas, metros por repetición, cuánto se nota la textura, rugosidad y metal */
const OBRA = {
  piedra: { id: 0, capa: 'sillar', esc: 2.4, contraste: .9, rug: .9, metal: 0 },
  madera: { id: 1, capa: 'tablas', esc: 2.2, contraste: .85, rug: .75, metal: 0 },
  enlucido: { id: 2, capa: 'enlucido', esc: 3.5, contraste: .8, rug: .9, metal: 0 },
  teja: { id: 3, capa: 'teja', esc: 1.8, contraste: .9, rug: .6, metal: 0 },
  laca: { id: 4, capa: 'tablas', esc: 3.2, contraste: .3, rug: .38, metal: 0 },
  arenisca: { id: 5, capa: 'arenisca', esc: 4, contraste: .85, rug: .9, metal: 0 },
  metal: { id: 6, capa: null, esc: 1, contraste: 0, rug: .32, metal: 1 },
  roca: { id: 7, capa: 'roca', esc: 6, contraste: .9, rug: .85, metal: 0 },
  corteza: { id: 8, capa: 'corteza', esc: 1.6, contraste: .9, rug: .9, metal: 0 },
  tallada: { id: 9, capa: 'roca', esc: 1.3, contraste: .55, rug: .85, metal: 0 },      // piedra tallada: faroles y estatuas
  tela: { id: 10, capa: null, esc: 1, contraste: 0, rug: .95, metal: 0 }               // toldos, redes y cuerdas
};

const Arquitectura = (() => {
  const LISTA = Object.values(OBRA).sort((a, b) => a.id - b.id), N = LISTA.length;
  const V = () => new THREE.Vector3();

  /* clase según el color (sRGB) de una pieza que no la declara */
  const _c = new THREE.Color(), _hsl = {};
  function clasificar(lr, lg, lb) {
    _c.setRGB(lr, lg, lb).convertLinearToSRGB().getHSL(_hsl); const h = _hsl.h, s = _hsl.s, l = _hsl.l;
    if (l < .15 && s < .25) return OBRA.laca.id;                                     // laca negra
    if (s > .45 && (h < .045 || h > .94)) return OBRA.laca.id;                        // laca roja
    if (l > .8) return OBRA.enlucido.id;                                             // muros claros
    if (h > .06 && h < .17 && s > .6 && l < .6) return OBRA.metal.id;                // oro
    if (h > .06 && h < .17 && s > .35 && l > .5) return OBRA.arenisca.id;           // arena
    if (h < .12 && s > .2 && l < .5) return OBRA.madera.id;                          // madera oscura
    return OBRA.piedra.id;
  }

  /* ---------- material ---------- */
  let mat = null;
  function material() {
    if (mat) return mat;
    mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, side: THREE.DoubleSide });
    const C = Texturas.CAPA, u = {
      uCapaO: { value: LISTA.map(o => (o.capa ? C[o.capa] : -1)) }, uEscO: { value: LISTA.map(o => 1 / o.esc) }, uConO: { value: LISTA.map(o => o.contraste) },
      uRugO: { value: LISTA.map(o => o.rug) }, uMetO: { value: LISTA.map(o => o.metal) }, uMedioO: { value: Texturas.medio.length ? Texturas.medio : [V()] }, uRelO: { value: .045 }
    };
    mat.onBeforeCompile = sh => {
      Atmosfera.inyectar(sh); Texturas.usar(sh); Object.assign(sh.uniforms, u);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aClase; varying float vCl; varying vec3 vWPo; varying vec3 vWNo; varying vec2 vUvO;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvCl = aClase; vWPo = (modelMatrix*vec4(transformed, 1.)).xyz; vWNo = normalize(mat3(modelMatrix)*objectNormal); vUvO = uv;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
${Texturas.GLSL}
uniform float uCapaO[${N}], uEscO[${N}], uConO[${N}], uRugO[${N}], uMetO[${N}], uRelO; uniform vec3 uMedioO[${Texturas.medio.length || 1}];
varying float vCl; varying vec3 vWPo; varying vec3 vWNo; varying vec2 vUvO;
vec3 relieveO(vec3 sp, vec3 n, float h, float k){
  vec3 dx = dFdx(sp), dy = dFdy(sp); float hx = dFdx(h)*k, hy = dFdy(h)*k;
  vec3 r1 = cross(dy, n), r2 = cross(n, dx); float det = dot(dx, r1);
  return normalize(abs(det)*n - sign(det)*(hx*r1 + hy*r2));
}`)
        .replace('#include <map_fragment>', `
int ci = int(vCl + .01); bool vertical = fract(vCl) > .25;
float cpO = uCapaO[ci], esO = uEscO[ci], conO = uConO[ci], hO = .5, aoO = 1., rugO = uRugO[ci];
if (cpO > -.5) {
  vec4 Ao, Bo;
  if (ci == 3) { vec2 t = vUvO*esO; Ao = sueloA(t, cpO); Bo = sueloB(t, cpO); }        // teja: coordenadas del tejado
  else {
    vec3 tw = triPesos(normalize(vWNo));
    vec2 ux = vWPo.zy*esO, uy = vWPo.xz*esO, uz = vWPo.xy*esO;
    if (vertical) { ux = ux.yx; uz = uz.yx; }                                            // vetas a lo largo de los postes
    vec4 bx, by, bz; triplanar(ux, uy, uz, tw, cpO, Ao, bx, by, bz); Bo = bx*tw.x + by*tw.y + bz*tw.z;
  }
  vec3 det = Ao.rgb/max(uMedioO[int(cpO + .01)], vec3(.015));
  diffuseColor.rgb *= mix(vec3(1.), det, conO);
  hO = Bo.z; aoO = mix(1., Bo.w, conO); rugO = mix(rugO, Ao.a, .5*conO);
}`)
        .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = rugO;')
        .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = uMetO[ci];')
        .replace('#include <normal_fragment_maps>', 'normal = relieveO(-vViewPosition, normal, hO, uRelO*conO);')
        .replace('#include <aomap_fragment>', 'reflectedLight.indirectDiffuse *= aoO; reflectedLight.indirectSpecular *= aoO;');
    };
    mat.customProgramCacheKey = () => 'obra';
    return mat;
  }

  /* ---------- geometría ---------- */
  /* pone la clase a una geometría (todas sus caras); vertical: vetas a lo largo de Y (postes). Sin nombre, una
     geometría que ya trae clases (un tejado con su madera) las conserva */
  function clase(g, nombre, vertical) {
    if ((nombre === undefined || nombre === null) && g.attributes.aClase) return g;
    const n = g.attributes.position.count, a = new Float32Array(n);
    let id; if (nombre === undefined || nombre === null) { const c = g.attributes.color; id = c ? clasificar(c.getX(0), c.getY(0), c.getZ(0)) : 0; } else id = OBRA[nombre].id;
    if (vertical && (id === OBRA.madera.id || id === OBRA.laca.id)) id += .5;
    a.fill(id); g.setAttribute('aClase', new THREE.BufferAttribute(a, 1)); return g;
  }
  /* geometría suelta (sin colores por vértice) lista para el material de obra */
  function preparar(g, nombre, hex, vertical) {
    const n = g.attributes.position.count, c = new Float32Array(n * 3), l = lin(hex);
    for (let i = 0; i < n; i++) { c[i * 3] = l.r; c[i * 3 + 1] = l.g; c[i * 3 + 2] = l.b; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); return clase(g, nombre, vertical);
  }
  /* une geometrías conservando posición, normal, color, uv y clase */
  function fusionarObra(geos) {
    let nv = 0, ni = 0; for (const g of geos) { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), cl = new Float32Array(nv), idx = nv > 65000 ? new Uint32Array(ni) : new Uint16Array(ni);
    let ov = 0, oi = 0;
    for (const g of geos) {
      const p = g.attributes.position, c = p.count; if (!g.attributes.normal) g.computeVertexNormals(); if (!g.attributes.aClase) clase(g);
      pos.set(p.array.subarray(0, c * 3), ov * 3); nor.set(g.attributes.normal.array.subarray(0, c * 3), ov * 3);
      if (g.attributes.color) col.set(g.attributes.color.array.subarray(0, c * 3), ov * 3); else col.fill(1, ov * 3, (ov + c) * 3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array.subarray(0, c * 2), ov * 2);
      cl.set(g.attributes.aClase.array.subarray(0, c), ov);
      if (g.index) { const ia = g.index.array; for (let k = 0; k < ia.length; k++) idx[oi++] = ia[k] + ov; } else for (let k = 0; k < c; k++) idx[oi++] = ov + k;
      ov += c; g.dispose();
    }
    const r = new THREE.BufferGeometry();
    r.setAttribute('position', new THREE.BufferAttribute(pos, 3)); r.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); r.setAttribute('color', new THREE.BufferAttribute(col, 3));
    r.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); r.setAttribute('aClase', new THREE.BufferAttribute(cl, 1)); r.setIndex(new THREE.BufferAttribute(idx, 1)); r.computeBoundingSphere();
    return r;
  }
  /* ---------- tejados ---------- */
  /* malla: anillos y tramos por lado; curva: exponente del faldón; sori: cuánto se levantan las esquinas (× alto);
     vuelo: cuánto salen las esquinas; grosor del canto, alcance del sofito de madera (fracción del faldón) y radio de
     las limas, en m para un tejado de 9 m de lado (se escalan con él); corte: hasta dónde llega el faldón en un tejado
     irimoya; hastial: pendiente del tejado a dos aguas de encima (alto / medio ancho); vueloHastial en m */
  const TEJADO = { anillos: 9, porLado: 6, curva: 1.6, sori: .3, vuelo: .06, grosor: .16, sofito: .42, lima: .1, corte: .5, hastial: 1.05, vueloHastial: .4, madera: 0x3b2a22, tsuma: 0xe9dfc9, oro: 0xd9a441 };
  const oscurecer = (hex, k) => new THREE.Color(hex).multiplyScalar(k).getHex();
  function malla(pos, idx, uv) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  const tubo = (pts, r, hex, cl, o) => clase(pieza(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(6, pts.length * 2), r, 5, false), hex, o || {}), cl);
  /* tejado a cuatro aguas (w × d en planta, alto h) con esquinas levantadas, canto, sofito de madera, limas y cumbrera.
     o.sori: otro levantamiento de las esquinas. o.hastial: irimoya (el faldón se corta y encima va un tejado a dos aguas con frontón de enlucido). Devuelve una
     geometría con sus clases (teja, madera, enlucido, metal) y coordenadas de teja (u a lo largo, v cuesta abajo) */
  function tejado(w, d, h, hex, x, y, z, o) {
    o = o || {};
    const T = TEJADO, m = Math.min(w, d), ex = (w - m) / 2, ez = (d - m) / 2, S = T.porLado, R = T.anillos;
    const sori = o.sori !== undefined ? o.sori : T.sori, e = clamp(m / 9, .15, 1.3), r0 = o.hastial ? T.corte : 0, gro = T.grosor * e, oscuro = oscurecer(hex, .55), largo = Math.hypot(m / 2, h);
    const per = []; for (let l = 0; l < 4; l++) for (let s = 0; s < S; s++) { const f = -1 + 2 * s / S; per.push(l === 0 ? [f, -1] : l === 1 ? [1, f] : l === 2 ? [-f, 1] : [-1, -f]); }
    const NP = per.length, radios = []; for (let i = 0; i <= R; i++) radios.push(1 - (1 - r0) * i / R);
    const punto = (px, pz, r) => {
      const q = Math.abs(px * pz), k = smooth(.45, 1, r), fl = 1 + T.vuelo * q * k;
      return [px * (r * m / 2 + ex) * fl, h * Math.pow(1 - r, T.curva) + h * sori * q * q * q * k, pz * (r * m / 2 + ez) * fl];
    };
    const partes = [];
    // faldón (con un anillo más bajo el alero: el canto)
    const pos = [], uv = [], idx = [];
    const anillo = (r, dy) => { for (const [px, pz] of per) { const p = punto(px, pz, r); pos.push(p[0], p[1] + dy, p[2]); uv.push(Math.abs(px) === 1 && Math.abs(pz) !== 1 ? p[2] : p[0], (1 - r) * largo + (dy ? .25 : 0)); } };
    anillo(1, -gro); for (const r of radios) anillo(r, 0);
    for (let i = 0; i < radios.length; i++) for (let j = 0; j < NP; j++) { const a = i * NP + j, b = i * NP + (j + 1) % NP; idx.push(a, a + NP, b, b, a + NP, b + NP); }
    partes.push(clase(pieza(malla(pos, idx, uv), hex, { var: .06, ao: .22 }), 'teja'));
    // sofito: la cara de abajo del alero, de madera
    { const ps = [], is = [], NS = 3;
      for (let i = 0; i <= NS; i++) { const r = 1 - (1 - r0) * T.sofito * i / NS; for (const [px, pz] of per) { const p = punto(px, pz, r); ps.push(p[0], p[1] - gro, p[2]); } }
      for (let i = 0; i < NS; i++) for (let j = 0; j < NP; j++) { const a = i * NP + j, b = i * NP + (j + 1) % NP; is.push(a, b, a + NP, b, b + NP, a + NP); }
      partes.push(clase(pieza(malla(ps, is), T.madera, { var: .1 }), 'madera')); }
    // limas: de cada esquina hasta la cumbre
    for (let l = 0; l < 4; l++) { const [px, pz] = per[l * S]; partes.push(tubo(radios.map(r => { const p = punto(px, pz, r); return new THREE.Vector3(p[0], p[1] + gro * .35, p[2]); }), T.lima * e, oscuro, 'teja')); }
    if (!o.hastial) {
      if (ex + ez > .01) {   // cumbrera con sus remates (onigawara)
        const lx = ex > ez ? 2 * ex : 0, lz = ez > ex ? 2 * ez : 0;
        partes.push(clase(pieza(new THREE.BoxGeometry(lx + .3 * e, .24 * e, lz + .3 * e), oscuro, { y: h + .06 * e }), 'teja'));
        for (const s of [-1, 1]) partes.push(clase(pieza(new THREE.BoxGeometry(.36 * e, .5 * e, .36 * e), oscuro, { x: s * (lx / 2), y: h + .2 * e, z: s * (lz / 2) }), 'teja'));
      } else partes.push(clase(pieza(new THREE.CylinderGeometry(.16 * e, .3 * e, .3 * e, 8), oscuro, { y: h + .1 * e }), 'teja'));
    } else {
      // irimoya: tejado a dos aguas sobre el corte del faldón, con el caballete a lo largo del lado largo
      const largoX = w >= d, yb = h * Math.pow(1 - r0, T.curva), gA = r0 * m / 2 + (largoX ? ex : ez), gB = r0 * m / 2 + (largoX ? ez : ex);
      const hg = gB * T.hastial, ov = T.vueloHastial * e, A2 = gA + ov, B2 = gB + ov * .8, yAt = t => yb + hg * Math.pow(1 - Math.min(1, t), 1.25);
      const gira = g => { if (!largoX) g.rotateY(Math.PI / 2); return g; }, NT = 6, NA = 4;
      const pg = [], ig = [], ug = [];
      for (const s of [-1, 1]) {
        const o0 = pg.length / 3;
        for (let i = 0; i <= NT; i++) { const t = i / NT; for (let j = 0; j <= NA; j++) { const a = -A2 + 2 * A2 * j / NA; pg.push(a, yAt(t), s * B2 * t); ug.push(a, t * Math.hypot(B2, hg)); } }
        for (let i = 0; i < NT; i++) for (let j = 0; j < NA; j++) { const a = o0 + i * (NA + 1) + j; ig.push(a, a + NA + 1, a + 1, a + 1, a + NA + 1, a + NA + 2); }
      }
      partes.push(gira(clase(pieza(malla(pg, ig, ug), hex, { var: .06 }), 'teja')));
      // frontones (tsuma) de enlucido con su viga y los tablones del borde (hafu), cumbrera y colgante dorado (gegyo)
      const pt = [], it = [];
      for (const s of [-1, 1]) { const o0 = pt.length / 3; for (let j = 0; j <= 8; j++) { const b = -gB + 2 * gB * j / 8; pt.push(s * (gA - .05 * e), yb - .1 * e, b, s * (gA - .05 * e), yAt(Math.abs(b) / B2), b); } for (let j = 0; j < 8; j++) { const a = o0 + j * 2; it.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
      partes.push(gira(clase(pieza(malla(pt, it), o.tsuma || T.tsuma, { var: .05 }), 'enlucido')));
      for (const s of [-1, 1]) {
        partes.push(gira(clase(pieza(new THREE.BoxGeometry(.14 * e, .2 * e, 2 * gB), T.madera, { x: s * gA, y: yb + .02 }), 'madera')));
        const borde = []; for (let j = 0; j <= 8; j++) { const b = -B2 + 2 * B2 * j / 8; borde.push(new THREE.Vector3(s * A2, yAt(Math.abs(b) / B2) + .05 * e, b)); }
        partes.push(gira(tubo(borde, .11 * e, T.madera, 'madera')));
        partes.push(gira(clase(pieza(new THREE.BoxGeometry(.1 * e, .45 * e, .55 * e), T.oro, { x: s * A2, y: yb + hg - .32 * e }), 'metal')));
        partes.push(gira(clase(pieza(new THREE.BoxGeometry(.4 * e, .5 * e, .42 * e), oscuro, { x: s * A2, y: yb + hg + .2 * e }), 'teja')));
      }
      partes.push(gira(clase(pieza(new THREE.BoxGeometry(2 * A2, .26 * e, .32 * e), oscuro, { y: yb + hg + .08 * e }), 'teja')));
    }
    const g = fusionarObra(partes); g.translate(x, y, z); return g;
  }

  /* ---------- muros, ménsulas y barandas (faro, templos y pabellones) ---------- */
  /* lado s de una planta w × d centrada en (cx, cz) (0: +z, 1: +x, 2: −z, 3: −x): giro, medio largo L y punto a
     'a' m a lo largo del lado y 'off' m por fuera de su cara */
  const GIROS = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  function lado(s, w, d, cx, cz) {
    const ry = GIROS[s], tx = Math.cos(ry), tz = -Math.sin(ry), nx = Math.sin(ry), nz = Math.cos(ry), L = s % 2 ? d / 2 : w / 2, D = s % 2 ? w / 2 : d / 2;
    return { ry, L, p: (a, off) => [(cx || 0) + tx * a + nx * (D + off), (cz || 0) + tz * a + nz * (D + off)] };
  }
  /* poste: radio; zócalo de tablas, viga (nuki) y cabeza (franja bajo el alero), en m; vanos por lado (en el lado
     largo); listones de cada ventana; celosía de las puertas (columnas × filas) */
  const MURO = { poste: .17, zocalo: .85, viga: .15, cabeza: .55, vanos: 3, listones: 7, celosia: [4, 7], madera: 0x4a3226, oscura: 0x2e2018, luz: 0xffe2a8, enlucido: 0xf1e8d6 };
  /* muro de entramado (w × d, alto h): enlucido entre postes, zócalo, vigas y en cada vano una ventana de listones
     o, en el central de los lados de o.puertas, una puerta de papel con celosía; ventanas y puertas brillan */
  function muro(K, w, d, h, o) {
    o = o || {}; const M = MURO, cx = o.x || 0, cz = o.z || 0, y0 = o.y || 0, poste = o.poste || 0xb7332d, luz = o.luz || M.luz, puertas = o.puertas || [];
    K.bx(w - .04, h, d - .04, o.muro || M.enlucido, cx, y0, cz, { clase: 'enlucido', ao: .12 });
    K.bx(w + .03, M.zocalo, d + .03, M.madera, cx, y0, cz, { clase: 'madera' });
    for (let s = 0; s < 4; s++) {
      const L = lado(s, w, d, cx, cz), n = Math.max(1, Math.round((o.vanos || M.vanos) * 2 * L.L / Math.max(w, d))), paso = 2 * L.L / n;
      const B = (bw, bh, bt, hex, a, off, y, cl) => { const [x, z] = L.p(a, off); K.bx(bw, bh, bt, hex, x, y, z, { ry: L.ry, clase: cl }); };
      const Gl = (bw, bh, a, off, y) => { const [x, z] = L.p(a, off); K.Lz(pieza(new THREE.BoxGeometry(bw, bh, .05), luz, { x, y: y + bh / 2, z, ry: L.ry })); };
      for (let i = s % 2 ? 1 : 0; i <= (s % 2 ? n - 1 : n); i++) { const [x, z] = L.p(-L.L + i * paso, 0); K.cy(M.poste, M.poste, h, 10, poste, x, y0, z); }
      const cv = o.claseViga || 'laca'; B(2 * L.L + .1, M.viga, .1, poste, 0, .06, y0 + M.zocalo, cv); B(2 * L.L + .1, M.viga, .1, poste, 0, .06, y0 + h - M.cabeza, cv);
      B(2 * L.L + .3, .22, .16, M.oscura, 0, .07, y0 + h - .22, 'madera');
      for (let j = 0; j < n; j++) {
        const a = -L.L + (j + .5) * paso, bw = paso - 2 * M.poste - .1, central = n % 2 ? j === (n - 1) / 2 : j === n / 2 - 1 || j === n / 2;
        if (central && puertas.includes(s)) {
          const ph = h - M.cabeza - .06, pw = bw * .9; Gl(pw, ph, a, .03, y0);
          for (let k = 1; k < M.celosia[0]; k++) B(.04, ph, .05, M.oscura, a - pw / 2 + k * pw / M.celosia[0], .07, y0, 'madera');
          for (let k = 1; k <= M.celosia[1]; k++) B(pw, .04, .05, M.oscura, a, .07, y0 + k * ph / (M.celosia[1] + 1), 'madera');
          for (const sd of [-1, 1]) B(.09, ph, .09, M.oscura, a + sd * pw / 2, .07, y0, 'madera');
        } else {
          const hv = h - M.cabeza - M.zocalo, vh = Math.min(1.1, hv * .55), vy = y0 + M.zocalo + (hv - vh) / 2, vw = bw * .62; Gl(vw, vh, a, .03, vy);
          for (let k = 0; k < M.listones; k++) B(.05, vh, .06, M.oscura, a - vw / 2 + (k + .5) * vw / M.listones, .07, vy, 'madera');
          B(vw + .2, .07, .12, M.oscura, a, .07, vy - .07, 'madera'); B(vw + .2, .07, .12, M.oscura, a, .07, vy + vh, 'madera');
        }
      }
    }
  }
  /* ménsulas (tokyō) sobre cada poste, bajo el alero: dado, brazo, dado y brazo largo hacia fuera, con el extremo
     pintado; n: vanos del lado largo; e: escala (alto total 0,89 × e desde y) */
  function mensulas(K, w, d, y, n, hex, e, o) {
    o = o || {}; e = e || 1;
    for (let s = 0; s < 4; s++) {
      const L = lado(s, w, d, o.x, o.z), nv = Math.max(1, Math.round(n * 2 * L.L / Math.max(w, d))), paso = 2 * L.L / nv;
      for (let i = 0; i <= nv; i++) {
        const a = -L.L + i * paso, B = (bw, bh, bt, off, yy, c) => { const [x, z] = L.p(a, off); K.bx(bw, bh, bt, c || hex, x, yy, z, { ry: L.ry, clase: 'laca' }); };
        B(.38 * e, .24 * e, .38 * e, 0, y); B(.2 * e, .16 * e, .9 * e, .3 * e, y + .24 * e); B(.3 * e, .18 * e, .3 * e, .68 * e, y + .4 * e);
        B(.18 * e, .15 * e, 1.3 * e, .55 * e, y + .58 * e); B(.28 * e, .16 * e, .28 * e, 1.1 * e, y + .73 * e, 0xf2e6c8);
      }
    }
  }
  /* baranda alrededor de una planta w × d a la altura y: pasamanos, larguero y balaustres, con remates dorados
     (giboshi) en los extremos. o.hueco: paso libre en el centro de cada lado; o.lados: qué lados la llevan */
  function barandal(K, w, d, y, hex, o) {
    o = o || {}; const hueco = o.hueco || 0, alto = o.alto || .72;
    for (const s of (o.lados || [0, 1, 2, 3])) {
      const L = lado(s, w, d, o.x, o.z), tramos = hueco ? [[-L.L, -hueco / 2], [hueco / 2, L.L]] : [[-L.L, L.L]];
      for (const [a0, a1] of tramos) {
        const lg = a1 - a0, am = (a0 + a1) / 2, B = (bw, bh, bt, a, yy) => { const [x, z] = L.p(a, 0); K.bx(bw, bh, bt, hex, x, yy, z, { ry: L.ry, clase: 'laca' }); };
        B(lg + .08, .08, .1, am, y + alto - .08); B(lg, .05, .06, am, y + alto * .45);
        { const [x0, z0] = L.p(a0, 0), [x1, z1] = L.p(a1, 0); K.sol((x0 + x1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0) / 2 + .065, Math.abs(z1 - z0) / 2 + .065, y, y + alto + .1, { fina: true }); }   // no se atraviesa (el hueco queda libre)
        const nb = Math.max(1, Math.round(lg / 1.1)); for (let k = 0; k <= nb; k++) B(.09, alto, .09, a0 + k * lg / nb, y);
        for (const a of [a0, a1]) { const [x, z] = L.p(a, 0); K.bx(.13, alto + .1, .13, hex, x, y, z, { clase: 'laca' }); K.A(pieza(new THREE.SphereGeometry(.09, 8, 6), TEJADO.oro, { x, y: y + alto + .16, z, sy: 1.3 }), 'metal'); }
      }
    }
  }
  /* escalinata en el lado s de una planta cuadrada de medio lado D: de y0 (fuera) a y1 (junto a la cara) en n peldaños
     de ancho 'ancho' y huella h, con zancas de piedra; cada peldaño es un sólido que se pisa */
  function escalinata(K, s, D, y0, y1, ancho, n, hex, huella) {
    huella = huella || .45; const L = lado(s, 2 * D, 2 * D), alto = (y1 - y0) / n, run = n * huella, ang = Math.atan2(y1 - y0, run);
    for (let k = 0; k < n; k++) {
      const [x, z] = L.p(0, (n - k - .5) * huella), top = y0 + (k + 1) * alto;
      K.bx(ancho, top - y0, huella + .02, hex, x, y0, z, { ry: L.ry, clase: 'piedra', var: .12 });
      if (s % 2) K.sol(x, z, (huella + .02) / 2, ancho / 2, y0, top); else K.sol(x, z, ancho / 2, (huella + .02) / 2, y0, top);
    }
    // Zancas por fragmentos de hasta 0,15 m: el recorte conserva su pendiente y sus extremos.
    const sn = Math.sin(L.ry), cs = Math.cos(L.ry), eje = v => v.x * sn + v.z * cs;
    const cortar = (pol, limite, signo) => {
      const out = [];
      for (let i = 0; i < pol.length; i++) {
        const a = pol[i], b = pol[(i + 1) % pol.length], da = signo * (eje(a) - limite), db = signo * (eje(b) - limite);
        if (da >= 0) out.push(a);
        if ((da >= 0) !== (db >= 0)) out.push(a.clone().lerp(b, da / (da - db)));
      }
      return out;
    };
    for (const sd of [-1, 1]) {
      const [x, z] = L.p(sd * (ancho / 2 + .22), run / 2);
      const g = K.bx(.44, .55, Math.hypot(run, y1 - y0) + .3, oscurecer(hex, .85), x, (y0 + y1) / 2 - .02, z, { ry: L.ry, clase: 'piedra', antes: g => g.rotateX(ang) });
      const p = g.attributes.position, ind = g.index, vertices = Array.from({ length: p.count }, (_, i) => new THREE.Vector3().fromBufferAttribute(p, i));
      const t0 = Math.min(...vertices.map(eje)), t1 = Math.max(...vertices.map(eje)), n = Math.ceil((t1 - t0) / .15);
      for (let j = 0; j < n; j++) {
        const bajo = t0 + (t1 - t0) * j / n, alto = t0 + (t1 - t0) * (j + 1) / n, caja = new THREE.Box3();
        for (let i = 0; i < (ind ? ind.count : p.count); i += 3) {
          const tri = [0, 1, 2].map(k => vertices[ind ? ind.getX(i + k) : i + k]);
          for (const v of cortar(cortar(tri, bajo, 1), alto, -1)) caja.expandByPoint(v);
        }
        if (!caja.isEmpty()) { const a = caja.min, b = caja.max; K.sol((a.x + b.x) / 2, (a.z + b.z) / 2, (b.x - a.x) / 2, (b.z - a.z) / 2, a.y, b.y, { fina: true }); }
      }
    }
  }

  /* ---------- remates y detalles de santuario ---------- */
  /* sōrin: remate de la pagoda sobre la cumbre (y): basa, cuenco, loto, mástil con nueve anillos, llama de agua
     calada en cruz y joya; alto ≈ 6,9 × e */
  function sorin(K, e, y, oro) {
    oro = oro || TEJADO.oro; const M = (g, o) => K.A(pieza(g, oro, o), 'metal');
    K.bx(1.1 * e, .45 * e, 1.1 * e, 0x4f4a42, 0, y, 0, { clase: 'metal' });
    M(new THREE.SphereGeometry(.5 * e, 14, 6, 0, TAU, 0, Math.PI / 2), { y: y + .45 * e, sy: .8 });
    K.cy(.5 * e, .18 * e, .3 * e, 12, oro, 0, y + .82 * e, 0, { clase: 'metal' });
    K.cy(.07 * e, .09 * e, 4.6 * e, 8, oro, 0, y + 1.1 * e, 0, { clase: 'metal' });
    for (let i = 0; i < 9; i++) { const r = (.5 - i * .025) * e; K.cy(r, r, .09 * e, 16, oro, 0, y + (1.35 + i * .34) * e, 0, { clase: 'metal' }); }
    const llama = [[0, 0], [.28, .12], [.45, .4], [.36, .7], [.5, .95], [.28, 1.1], [.32, 1.3], [.12, 1.24], [0, 1.45]], sh = new THREE.Shape();
    llama.forEach(([px, py], i) => i ? sh.lineTo(px, py) : sh.moveTo(px, py)); for (let i = llama.length - 2; i > 0; i--) sh.lineTo(-llama[i][0], llama[i][1]);
    for (let k = 0; k < 4; k++) M(new THREE.ShapeGeometry(sh), { y: y + 4.45 * e, s: e, ry: k * Math.PI / 4 });
    M(new THREE.SphereGeometry(.17 * e, 10, 8), { y: y + 6.05 * e }); M(new THREE.SphereGeometry(.2 * e, 10, 8), { y: y + 6.45 * e, sy: 1.3 });
    M(new THREE.ConeGeometry(.08 * e, .3 * e, 8), { y: y + 6.82 * e });
  }
  /* farolillo de papel (chōchin) colgado en (x, y, z): cuerpo que brilla, tapas y cordón negros */
  function chochin(K, x, y, z, hex, e) {
    e = e || 1; K.Lz(pieza(new THREE.SphereGeometry(.28 * e, 12, 8), hex || 0xff8a4a, { x, y, z, sy: 1.35 }));
    for (const dy of [.34, -.42]) K.cy(.16 * e, .16 * e, .08 * e, 10, 0x1d1d22, x, y + dy * e, z, { clase: 'laca' });
    K.bx(.02, .45 * e, .02, 0x1d1d22, x, y + .42 * e, z, { clase: 'laca' });
  }
  /* shimenawa: cuerda sagrada combada (largo L a lo largo de x, en z) con tiras de papel en zigzag (shide) */
  function shimenawa(K, L, comba, y, z, x0) {
    x0 = x0 || 0; const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(x0 - L / 2, y, z), new THREE.Vector3(x0, y - comba * 2, z), new THREE.Vector3(x0 + L / 2, y, z));
    for (const [r, dy] of [[.13, 0], [.08, .1]]) K.A(pieza(new THREE.TubeGeometry(c, 18, r, 6, false), 0xd9c690, { y: dy }), 'tela');
    for (let k = 0; k < 4; k++) { const p = c.getPoint((k + 1) / 5); for (let q = 0; q < 3; q++) K.bx(.16, .2, .015, 0xf6f3ea, p.x + (q % 2 ? .06 : -.06), p.y - .34 - q * .19, p.z + .02, { clase: 'tela' }); }
  }
  /* guirnalda: cuerda combada de (x0, y0, z0) a (x1, y1, z1) con n farolillos de colores alternos */
  function guirnalda(K, x0, y0, z0, x1, y1, z1, n, comba) {
    const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3((x0 + x1) / 2, (y0 + y1) / 2 - 2 * (comba || .7), (z0 + z1) / 2), new THREE.Vector3(x1, y1, z1));
    K.A(pieza(new THREE.TubeGeometry(c, 20, .025, 4, false), 0x2a2622, {}), 'tela');
    for (let k = 1; k <= n; k++) { const p = c.getPoint(k / (n + 1)); chochin(K, p.x, p.y - .45, p.z, k % 2 ? 0xff8a4a : 0xffd27a, .62); }
  }
  /* caja de ofrendas (saisen) con su enrejado */
  function saisen(K, x, y, z) {
    K.bx(1.5, .65, .7, 0x5a3a28, x, y, z, { clase: 'madera' }); for (let k = 0; k < 6; k++) K.bx(1.4, .05, .06, 0x2e2018, x, y + .66, z - .27 + k * .108, { clase: 'madera' });
    K.sol(x, z, .75, .35, y, y + .7);
  }
  /* altar o pedestal de piedra tallada (alto total 'alto', radio × r): basa octogonal, fuste, capitel y cuenco de loto */
  function altar(K, hex, alto, r) {
    alto = alto || 1.25; r = r || 1; const k = alto / 1.25, os = oscurecer(hex, .8), T = { clase: 'tallada' };
    K.solC(0, 0, 1.22 * r, 0, .2 * k, { fina: true }); K.solC(0, 0, 1.05 * r, .2 * k, .35 * k, { fina: true });
    K.solC(0, 0, .70 * r, .35 * k, .85 * k, { fina: true }); K.solC(0, 0, .90 * r, .85 * k, 1.25 * k, { fina: true });
    K.cy(1.1 * r, 1.22 * r, .2 * k, 8, os, 0, 0, 0, T); K.cy(.95 * r, 1.05 * r, .15 * k, 8, hex, 0, .2 * k, 0, T);
    K.cy(.6 * r, .7 * r, .5 * k, 8, hex, 0, .35 * k, 0, T); K.cy(.9 * r, .66 * r, .14 * k, 8, hex, 0, .85 * k, 0, T);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; K.A(pieza(new THREE.SphereGeometry(.2 * r, 8, 6), hex, { x: Math.cos(a) * .66 * r, y: 1.06 * k, z: Math.sin(a) * .66 * r, sx: .9, sy: .55, sz: .45, ry: -a }), 'tallada'); }
    K.cy(.72 * r, .7 * r, .12 * k, 16, 0x3b3a42, 0, 1.13 * k, 0, T);
  }
  /* obra suelta (fuera de 04-estructuras): fn recibe las mismas utilidades que las piezas; devuelve un grupo
     con una malla de obra y, si hay piezas que brillan, otra emisiva. Los sólidos que piden las piezas (sol, solC) se
     guardan en 'sol' y se mueven con ellas; ponerSolidos los registra en Sol donde quede la obra */
  function construir(fn) {
    const lA = [], lL = [], lS = [];
    const k = {
      A: (g, c, v) => { clase(g, c, v); lA.push(g); return g; }, Lz: g => { lL.push(g); return g; },
      bx: (w, h, d, hex, x, y, z, o) => k.A(pieza(new THREE.BoxGeometry(w, h, d), hex, Object.assign({ x, y: y + h / 2, z, ao: .2, var: .08 }, o)), o && o.clase),
      cy: (rt, rb, h, seg, hex, x, y, z, o) => k.A(pieza(new THREE.CylinderGeometry(rt, rb, h, seg), hex, Object.assign({ x, y: y + h / 2, z, var: .08 }, o)), o && o.clase, true),
      glowBx: (w, h, d, hex, x, y, z) => k.Lz(pieza(new THREE.BoxGeometry(w, h, d), hex, { x, y: y + h / 2, z })),
      techo: (w, d, h, hex, x, y, z, o) => { const g = tejado(w, d, h, hex, x, y, z, o); lA.push(g); return g; },
      roca: (w, h, d, hex, x, y, z, semilla, c, ry) => k.A(pieza(abollar(icoSuave(.5, 1), .14, 2.2, semilla || 1), hex, { x, y, z, sx: w, sy: h, sz: d, ry: ry || 0, var: .15, ao: .3 }), c || 'roca'),
      sol: (x, z, hx, hz, y0, y1, o) => lS.push({ x, z, hx, hz, ry: o && o.ry || 0, y0, y1, fina: !!(o && o.fina) }), solC: (x, z, r, y0, y1, o) => lS.push({ circ: true, x, z, r, y0, y1, fina: !!(o && o.fina) }),
      // piezas armadas en el origen (como las de 04-estructuras) que se llevan a su sitio
      // (desde: índice en la lista de obra, o la marca de k.marca(), que también lleva las piezas que brillan y los sólidos; ry: giro)
      lista: () => lA, marca: () => ({ a: lA.length, l: lL.length, s: lS.length }),
      mover: (desde, x, y, z, ry) => {
        const ia = typeof desde === 'number' ? desde : desde.a, il = typeof desde === 'number' ? lL.length : desde.l, is = typeof desde === 'number' ? lS.length : desde.s;
        for (const [l, i0] of [[lA, ia], [lL, il]]) for (let i = i0; i < l.length; i++) { if (ry) l[i].rotateY(ry); l[i].translate(x, y, z); }
        const c = Math.cos(ry || 0), sn = Math.sin(ry || 0);
        for (let i = is; i < lS.length; i++) { const s = lS[i], sx = s.x; s.x = x + sx * c + s.z * sn; s.z = z - sx * sn + s.z * c; s.y0 += y; s.y1 += y; if (!s.circ) s.ry += ry || 0; }
      }
    };
    fn(k);
    const g = new THREE.Group(); let luz = null;
    if (lA.length) { const m = new THREE.Mesh(fusionarObra(lA), material()); m.castShadow = true; m.receiveShadow = true; g.add(m); }
    if (lL.length) { luz = new THREE.Mesh(fusionar(lL), new THREE.MeshBasicMaterial({ vertexColors: true, fog: true })); g.add(luz); }
    return { g, luz, sol: lS };
  }
  /* registra en Sol los sólidos de una obra de construir, con la obra en (x, y, z) y girada ry (por defecto, donde se armó) */
  function ponerSolidos(o, x, y, z, ry) {
    x = x || 0; y = y || 0; z = z || 0; ry = ry || 0; const c = Math.cos(ry), sn = Math.sin(ry);
    for (const s of o.sol || []) {
      const wx = x + s.x * c + s.z * sn, wz = z - s.x * sn + s.z * c;
      const so = s.circ ? Sol.col(wx, wz, s.r, y + s.y0, y + s.y1) : Sol.add(wx, wz, s.hx, s.hz, s.ry + ry, y + s.y0, y + s.y1); if (s.fina) so.fina = true;
    }
  }
  /* farol de los puntos de luz: basa de piedra, poste de madera, celosía y tejadillo (la caja de papel la pone 11-jefes.js) */
  function linterna() {
    return construir(k => {
      const m = 0x4a3226, o = 0x3b2a22;
      k.bx(.72, .26, .72, 0x7d7c76, 0, 0, 0, { clase: 'piedra' }); k.cy(.09, .11, 1.42, 8, m, 0, .26, 0);
      k.bx(.66, .07, .66, o, 0, 1.62, 0);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx(.05, .6, .05, o, sx * .28, 1.68, sz * .28);
      for (const s of [-1, 1]) for (const t of [-.09, .09]) { k.bx(.03, .56, .03, o, t, 1.7, s * .285); k.bx(.03, .56, .03, o, s * .285, 1.7, t); }
      for (const s of [-1, 1]) { k.bx(.6, .03, .03, o, 0, 1.97, s * .285); k.bx(.03, .03, .6, o, s * .285, 1.97, 0); }
      k.bx(.7, .06, .7, o, 0, 2.28, 0); k.techo(1.05, 1.05, .34, 0x2f3552, 0, 2.33, 0);
      k.A(pieza(new THREE.SphereGeometry(.07, 8, 6), 0xd9a441, { y: 2.72 }), 'metal');
    });
  }

  /* ---------- piezas (K: utilidades de 04-estructuras: bx, cy, glowBx, techo, A, Lz, sol, solC) ---------- */
  /* viga curva: caja de L×a×p con los extremos levantados 'sori' (kasagi del torii) */
  function vigaCurva(L, a, p, sori, hex, x, y, z) {
    const g = new THREE.BoxGeometry(L, a, p, 24, 1, 1), q = g.attributes.position;
    for (let i = 0; i < q.count; i++) { const t = q.getX(i) / (L / 2); q.setY(i, q.getY(i) * (1 + .25 * t * t) + sori * t * t * Math.abs(t)); }
    g.computeVertexNormals(); return pieza(g, hex, { x, y: y + a / 2, z, var: .05 });
  }
  function torii(K, esc, hex) {
    const w = 3.4 * esc, h = 4.6 * esc, negro = 0x1d1d22;
    for (const s of [-1, 1]) {
      K.cy(.2 * esc, .24 * esc, h, 12, hex, s * w / 2, 0, 0); K.solC(s * w / 2, 0, .3 * esc, 0, h, { fina: true }); K.solC(s * w / 2, 0, .46 * esc, -.04 * esc, .10 * esc, { fina: true });
      K.cy(.3 * esc, .3 * esc, .32 * esc, 12, negro, s * w / 2, 0, 0); K.cy(.42 * esc, .46 * esc, .14 * esc, 8, 0x8a8a84, s * w / 2, -.04 * esc, 0, { clase: 'piedra' });   // basa
      K.cy(.25 * esc, .25 * esc, .1 * esc, 12, negro, s * w / 2, h - .62 * esc, 0);                                                             // anillo bajo la viga
    }
    K.bx(w + .8 * esc, .24 * esc, .3 * esc, hex, 0, h - 1.05 * esc, 0);                                                                      // nuki
    for (const s of [-1, 1]) K.bx(.1 * esc, .26 * esc, .34 * esc, negro, s * (w / 2 + .3 * esc), h - 1.06 * esc, 0);                        // cuñas
    K.bx(.3 * esc, .84 * esc, .26 * esc, hex, 0, h - .8 * esc, 0); K.bx(.62 * esc, .46 * esc, .08 * esc, negro, 0, h - .66 * esc, .17 * esc); // poste central y placa
    K.bx(w + 1.3 * esc, .26 * esc, .42 * esc, hex, 0, h, 0);                                                                                 // shimaki
    K.A(vigaCurva(w + 2.6 * esc, .3 * esc, .58 * esc, .32 * esc, negro, 0, h + .26 * esc, 0), 'laca');                                      // kasagi curvo
  }
  /* farol de piedra hexagonal: basa, fuste, plataforma, caja de luz con ventanas, tejadillo curvo y joya
     (apagado: sin luz propia, para los faroles que se encienden en el juego) */
  function toro(K, esc, brasa, apagado) {
    const p = 0x9a9a92, e = esc, luz = brasa || 0xffc977;
    K.cy(.52 * e, .62 * e, .22 * e, 6, p, 0, 0, 0, { clase: 'tallada' }); K.cy(.42 * e, .52 * e, .1 * e, 6, p, 0, .22 * e, 0, { clase: 'tallada' });
    K.cy(.15 * e, .19 * e, 1.05 * e, 10, p, 0, .32 * e, 0, { clase: 'tallada' }); K.cy(.18 * e, .18 * e, .06 * e, 10, p, 0, .8 * e, 0, { clase: 'tallada' });
    K.cy(.42 * e, .3 * e, .16 * e, 6, p, 0, 1.37 * e, 0, { clase: 'tallada' });
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + TAU / 12; K.bx(.09 * e, .5 * e, .09 * e, p, Math.cos(a) * .27 * e, 1.53 * e, Math.sin(a) * .27 * e, { clase: 'tallada' }); }
    if (!apagado) K.Lz(pieza(new THREE.CylinderGeometry(.25 * e, .25 * e, .44 * e, 6), luz, { y: 1.78 * e }));
    const g = new THREE.CylinderGeometry(.06 * e, .62 * e, .38 * e, 6, 3), q = g.attributes.position;
    for (let i = 0; i < q.count; i++) { const r = Math.hypot(q.getX(i), q.getZ(i)), t = r / (.62 * e); q.setY(i, q.getY(i) + Math.pow(t, 6) * .14 * e); }
    g.computeVertexNormals(); K.A(pieza(g, p, { y: 2.22 * e, var: .1, ao: .2 }), 'tallada');
    K.cy(.08 * e, .1 * e, .1 * e, 8, p, 0, 2.4 * e, 0, { clase: 'tallada' }); K.A(pieza(new THREE.SphereGeometry(.11 * e, 10, 8), p, { y: 2.6 * e, sy: 1.2 }), 'tallada');
    K.A(pieza(new THREE.ConeGeometry(.05 * e, .14 * e, 8), p, { y: 2.76 * e }), 'tallada');
    K.solC(0, 0, .62 * e, 0, .32 * e, { fina: true }); K.solC(0, 0, .19 * e, .32 * e, 1.37 * e, { fina: true });
    K.solC(0, 0, .42 * e, 1.37 * e, 2.03 * e, { fina: true }); K.solC(0, 0, .62 * e, 2.03 * e, 2.50 * e, { fina: true });
    K.solC(0, 0, .12 * e, 2.50 * e, 2.83 * e, { fina: true });
  }
  const CASA = { sori: .12 };   // las casas, con las esquinas del tejado menos levantadas que templos y pagoda
  /* casa de pueblo (minka): zócalo de piedra, entramado de madera, paños de enlucido, puertas de papel con luz,
     galería de tablas (engawa), tejado de teja (o.irimoya: con frontón) y la vida de la casa: cortina (noren) en la
     puerta, farolillo, barril y leña */
  function casa(K, w, d, h, colMuro, tej, o) {
    o = o || {};
    const madera = 0x4a3226, oscura = 0x3b2a22, alto = .55;
    K.bx(w + .7, alto, d + .7, 0x6b6a66, 0, 0, 0, { clase: 'piedra' });
    // cuerpo de entramado: postes, zócalo de tablas, vigas, ventanas de listones en los cuatro lados y la puerta de papel delante
    muro(K, w, d, h, { y: alto, poste: madera, puertas: [0], luz: 0xffe2b0, muro: colMuro, claseViga: 'madera' });
    const pw = (w / MURO.vanos - 2 * MURO.poste - .1) * .9, ph = h - MURO.cabeza - .06;   // la puerta que pone muro()
    // galería de tablas delante, con su escalón
    K.bx(w + .3, .12, 1.3, 0x7a5a3e, 0, alto - .02, d / 2 + .75, { clase: 'madera' }); K.bx(w * .4, .1, .5, 0x6e4e36, 0, .18, d / 2 + 1.6, { clase: 'madera' });
    for (const x of [-w / 2, 0, w / 2]) K.cy(.07, .07, alto, 6, madera, x, 0, d / 2 + 1.3);
    // tejado con aleros amplios
    K.techo(w + 3.2, d + 3.2, h * .8, tej, 0, alto + h - .1, 0, { hastial: !!o.irimoya, sori: CASA.sori });
    // noren de tres paños sobre la puerta, farolillo en la esquina, barril y leña junto a la pared
    K.bx(pw + .3, .05, .05, oscura, 0, alto + ph + .02, d / 2 + .16, { clase: 'madera' });
    for (let k = 0; k < 3; k++) K.bx(pw / 3 - .04, .78, .03, o.noren || 0x2f3f6e, -pw / 3 + k * pw / 3, alto + ph - .76, d / 2 + .16, { clase: 'tela' });
    chochin(K, w / 2 - .25, alto + h - .75, d / 2 + 1.05, 0xff8a4a, .85);
    K.cy(.32, .29, .78, 12, 0x6b4a32, -w / 2 + .35, 0, d / 2 + 2.1, { clase: 'madera' }); for (const yy of [.12, .6]) K.cy(.335, .335, .05, 12, 0x2a2622, -w / 2 + .35, yy, d / 2 + 2.1, { clase: 'metal' }); K.solC(-w / 2 + .35, d / 2 + 2.1, .34, 0, .8, { fina: true });
    for (let k = 0; k < 7; k++) K.cy(.09, .09, 1.2, 7, 0x7a5a3e, -w / 2 - .32 - (k % 3) * .02, .12 + Math.floor(k / 2.4) * .18, -d / 4 + (k % 3) * .2 - .2, { rx: Math.PI / 2, clase: 'corteza' });
    K.sol(-w / 2 - .34, -d / 4, .11, .80, .63, 1.17, { fina: true });
    K.sol(0, 0, w / 2 + .17, d / 2 + .17, .55, .55 + h, { fina: true }); K.sol(0, 0, (w + .7) / 2, (d + .7) / 2, 0, .55, { fina: true });
    K.sol(0, d / 2 + .75, (w + .3) / 2, .65, .53, .65); K.sol(0, d / 2 + 1.6, w * .2, .25, .18, .28);
  }
  /* zorro guardián de piedra sentado sobre su pedestal, con babero rojo */
  function zorro(K, s) {
    const p = 0x9a9a92;
    K.bx(1.5, .5, 1.2, 0x7d7c76, 0, 0, 0, { clase: 'piedra' }); K.bx(1.2, .55, .95, 0x8a8a84, 0, .5, 0, { clase: 'piedra' });
    K.A(pieza(new THREE.SphereGeometry(.42, 12, 10), p, { y: 1.45, z: -.1, sx: .85, sy: 1.15, sz: 1.05, var: .08 }), 'tallada');        // cuerpo
    K.A(pieza(new THREE.SphereGeometry(.26, 12, 10), p, { y: 1.85, z: .12, sx: .9, sy: 1.1 }), 'tallada');                                 // pecho
    K.A(pieza(new THREE.SphereGeometry(.24, 12, 10), p, { y: 2.3, z: .14 }), 'tallada');                                                    // cabeza
    K.A(pieza(new THREE.ConeGeometry(.12, .34, 8), p, { y: 2.24, z: .42, rx: Math.PI / 2 - .2 }), 'tallada');                              // hocico
    for (const e of [-1, 1]) { K.A(pieza(new THREE.ConeGeometry(.09, .3, 4), p, { x: e * .14, y: 2.58, z: .1, rz: -e * .25 }), 'tallada'); K.A(pieza(new THREE.CylinderGeometry(.06, .07, .55, 6), p, { x: e * .18, y: 1.32, z: .26 }), 'tallada'); }
    const cola = new THREE.TorusGeometry(.32, .11, 8, 14, Math.PI * 1.2); K.A(pieza(cola, p, { x: s * .32, y: 1.55, z: -.32, ry: Math.PI / 2, rz: -.6 }), 'tallada');
    K.A(pieza(new THREE.ConeGeometry(.3, .32, 12, 1, true), 0xb7332d, { y: 1.92, z: .14, rx: .15 }), 'laca');                             // babero
    K.solC(0, 0, .8, 0, 2.8);
  }
  /* barandilla cuadrada alrededor de un piso (lado L, a la altura y) */
  function barandilla(K, L, y, hex) {
    const n = Math.max(3, Math.round(L / 1.1));
    for (const s of [-1, 1]) {
      K.sol(0, s * L / 2, L / 2 + .04, .04, y, y + .70, { fina: true }); K.sol(s * L / 2, 0, .04, L / 2 + .04, y, y + .70, { fina: true });
      K.bx(L, .08, .08, hex, 0, y + .62, s * L / 2); K.bx(.08, .08, L, hex, s * L / 2, y + .62, 0);
      K.bx(L, .05, .05, hex, 0, y + .3, s * L / 2); K.bx(.05, .05, L, hex, s * L / 2, y + .3, 0);
      for (let k = 0; k <= n; k++) { const t = -L / 2 + k * L / n; K.bx(.07, .66, .07, hex, t, y, s * L / 2); K.bx(.07, .66, .07, hex, s * L / 2, y, t); }
    }
  }

  return { material, clase, preparar, fusionar: fusionarObra, clasificar, tejado, construir, ponerSolidos, linterna, vigaCurva, torii, toro, casa, zorro, barandilla, OBRA,
    muro, mensulas, barandal, escalinata, sorin, chochin, shimenawa, saisen, altar, guirnalda };   // las piezas de cada lugar las añade 34-piezas.js
})();
