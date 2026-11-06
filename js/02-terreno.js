/* === Ecos de Luz · 02-terreno.js ===
   Biomas, relieve, caminos, cuevas excavadas, chunks con niveles de detalle (el agua está en 30-agua.js),
   material de suelo procedural, agua, cielo dinámico y mapa del mundo. */
"use strict";

const CHUNK = 80, NIVEL_AGUA = 0, RADIO_ISLA = 445, LIMITE = 476;
const BIOMAS = [
  { nom: 'Pradera del Alba', ic: 'sol', c: [0, 0], k: 1.9, mapa: [126, 158, 84] },
  { nom: 'Bosque de Sakura', ic: 'flor', c: [-270, -240], k: 1, mapa: [196, 150, 168] },
  { nom: 'Cumbres de Kiri', ic: 'montana', c: [270, -262], k: 1, mapa: [214, 224, 236] },
  { nom: 'Dunas del Sol Dormido', ic: 'duna', c: [272, 256], k: 1, mapa: [222, 188, 128] },
  { nom: 'Lagos de Marea', ic: 'ola', c: [-262, 262], k: 1, mapa: [104, 150, 112] }
];
/* lugares con suelo nivelado: r1 plano total, r2 fin de la transición */
const SITIOS = [
  { id: 'faro', x: 0, z: 0, r1: 25, r2: 48 },
  { id: 'aldea', x: -104, z: 64, r1: 30, r2: 50 },
  { id: 'mirador', x: 74, z: 80, r1: 9, r2: 22 },
  { id: 'petalo', x: -252, z: -205, r1: 18, r2: 34 },
  { id: 'escarcha', x: 270, z: -190, r1: 19, r2: 34 },
  { id: 'duna', x: 246, z: 232, r1: 20, r2: 36 },
  { id: 'muelle', x: -150, z: 152, r1: 8, r2: 18 },
  { id: 'pir1', x: 204, z: 262, r1: 16, r2: 28 },
  { id: 'pir2', x: 292, z: 200, r1: 16, r2: 28 },
  { id: 'pir3', x: 226, z: 298, r1: 16, r2: 28 },
  // isla Yoake (capítulo 4): coordenadas de la entrega de ChatGPT, desde el centro de la isla (norte = −z)
  { id: 'yoakeRefugio', x: -1100 + 35, z: 1000 - 25, r1: 20, r2: 32 },
  { id: 'yoakeEmbarcadero', x: -1100 + 150, z: 1000 - 118, r1: 9, r2: 18 },   // en la orilla de la ensenada nordeste
  { id: 'yoakeHuertos', x: -1100 - 30, z: 1000 + 25, r1: 14, r2: 24 },
  { id: 'yoakeCisterna', x: -1100 - 70, z: 1000 - 45, r1: 7, r2: 14 },
  { id: 'yoakeSenal', x: -1100 + 100, z: 1000 - 130, r1: 6, r2: 13 },
  { id: 'yoakeMirador', x: -1100 + 145, z: 1000 - 25, r1: 6, r2: 12 },
  { id: 'yoakeCala', x: -1100 - 135, z: 1000 + 80, r1: 8, r2: 16 }
];
/* islas más allá del Velo (PLAN_FUSION.md, capítulo 4): centro, semiejes de la elipse de la costa (m), bioma que manda en
   ellas y lomas (centro relativo, altura, radio). Lejos de la isla principal: solo se llega en barca */
const ISLAS = [
  { id: 'yoake', nom: 'Isla de Yoake', ic: 'ola', x: -1100, z: 1000, rx: 190, rz: 210, bioma: 0, base: 3.5, lomas: [[-60, -50, 8, 45], [140, -30, 20, 30], [95, -128, 12, 22]] }
];
/* ¿en qué isla extra está (x, z)? (con margen de mar alrededor) */
function islaEn(x, z, margen) { const m = 1 + (margen || .35); for (const I of ISLAS) if (Math.abs(x - I.x) < I.rx * m && Math.abs(z - I.z) < I.rz * m) return I; return null; }
/* región con nombre (para el rótulo al entrar): una isla extra o el bioma de la isla principal */
function regionDe(x, z) { return islaEn(x, z, .1) || BIOMAS[biomaDe(x, z)]; }
/* tierra a la que pertenece un punto: una isla extra o la principal (centro y radio, para la corriente que devuelve a la orilla) */
const _tierraPrincipal = { x: 0, z: 0, r: 0 };
function tierraDe(x, z) { const I = islaEn(x, z, 1.2); if (I) return { x: I.x, z: I.z, r: Math.max(I.rx, I.rz) }; _tierraPrincipal.r = RADIO_ISLA; return _tierraPrincipal; }
function alturaIsla(I, x, z) {
  const dx = (x - I.x) / I.rx, dz = (z - I.z) / I.rz, d = Math.sqrt(dx * dx + dz * dz) + .1 * Ruido.n2(x * .006 + 7, z * .006 - 3);
  let h = 1.5 + I.base * smooth(.95, .55, d) + 2.2 * Ruido.n2(x * .02 + 4, z * .02 - 9);
  for (const [lx, lz, alto, r] of I.lomas) { const ex = x - I.x - lx, ez = z - I.z - lz; h += alto * Math.exp(-(ex * ex + ez * ez) / (2 * r * r)); }
  return lerp(-20 + 3 * Ruido.n2(x * .01, z * .01), h, smooth(1.04, .9, d));
}
const sitio = id => SITIOS.find(s => s.id === id);
/* oasis de las Dunas: la tierra baja hasta el agua (orilla a unos 21 m del centro); hasta r crecen palmeras y juncos */
const OASIS = { x: 186, z: 152, r: 42, orilla: 21 };
/* cima de Kiri: losa de piedra donde posarse en lo más alto de la aguja (se busca el punto más alto cerca de x, z),
   con un santuario pequeño, un mojón de piedras y un farol */
const CIMA_KIRI = { x: 220, z: -316, busca: 8, losa: 2.6, hondo: 7 };
/* cofre: dónde está el cofre de la cámara (m desde su centro). En la de Cristal, al fondo: a 6,5 m del cristal del
   reto más cercano, para que «Abrir cofre» y «Tocar el cristal» no se pisen; la decoración deja su sitio libre */
const CUEVAS = [
  { id: 'cristal', nom: 'Cueva de Cristal', sitio: 'escarcha', dir: [.25, -.968], d0: 15, largo: 46, R: 4.4, Rc: 12, baja: 4, curva: 3, tono: 0x6f86a8, cofre: [0, -9.2] },
  { id: 'luciernagas', nom: 'Gruta de las Luciérnagas', x: -205, z: -282, dir: [0, -1], d0: 0, largo: 36, R: 4.0, Rc: 10, baja: 3, curva: -4, tono: 0x6d6a52, cofre: [-6, 3] }
];
const CAMINOS = [];
let _cuevasListas = false;

/* ---------- biomas ---------- */
/* dominios: alrededor de algunos lugares manda un bioma (radio r en m, con la transición en la mitad exterior), para que
   el desierto no invada, por ejemplo, las ruinas del Mirador de la Pradera. lomas: elevaciones suaves (alto en m, radio
   en m) que se suman al relieve de la Pradera */
const DOMINIOS = [{ x: 74, z: 80, r: 75, b: 0 }, { x: 116, z: -48, r: 85, b: 0 }];   // Mirador · arena del Gólem Musgoso y Círculo de piedras
const LOMAS = [{ x: 74, z: 80, alto: 14, r: 38 }];
const _pw = new Float32Array(5), _pd = new Float32Array(5);
function pesos(x, z) {
  const I = islaEn(x, z); if (I) { _pw.fill(0); _pw[I.bioma] = 1; return _pw; }   // una isla extra tiene un solo bioma
  const wx = x + 75 * Ruido.n2(x * .0024 + 11.3, z * .0024 - 7.1), wz = z + 75 * Ruido.n2(x * .0024 - 3.7, z * .0024 + 19.9);
  let dm = 1e9;
  for (let i = 0; i < 5; i++) { const b = BIOMAS[i], dx = wx - b.c[0], dz = wz - b.c[1], d = Math.sqrt(dx * dx + dz * dz) * b.k; _pd[i] = d; }
  for (const q of DOMINIOS) { const d = Math.hypot(x - q.x, z - q.z); if (d < q.r) _pd[q.b] -= 400 * (1 - smooth(q.r * .5, q.r, d)); }
  for (let i = 0; i < 5; i++) if (_pd[i] < dm) dm = _pd[i];
  let s = 0;
  for (let i = 0; i < 5; i++) { const w = Math.exp(-(_pd[i] - dm) / 24); _pw[i] = w; s += w; }
  for (let i = 0; i < 5; i++) _pw[i] /= s;
  return _pw;
}
function biomaDe(x, z) { const w = pesos(x, z); let m = 0; for (let i = 1; i < 5; i++) if (w[i] > w[m]) m = i; return m; }

/* ---------- relieve por bioma ---------- */
function hPradera(x, z) {
  let h = 6.5 + 6 * fbm(x * .0055, z * .0055, 4) + 1.6 * Ruido.n2(x * .028, z * .028) + 17 * Math.exp(-(x * x + z * z) / 5200);
  for (const l of LOMAS) h += l.alto * Math.exp(-((x - l.x) ** 2 + (z - l.z) ** 2) / (l.r * l.r));
  return h;
}
function hSakura(x, z) {
  let h = 11 + 15 * fbm(x * .0042 + 3.1, z * .0042, 5) + 4.5 * Ruido.n2(x * .019, z * .019);
  h += 30 * Math.exp(-((x + 205) ** 2 + (z + 318) ** 2) / 2600);
  const rv = Math.abs(Ruido.n2(x * .0031 + 40, z * .0031 + 40) + .22 * Ruido.n2(x * .011, z * .011));
  return lerp(h, -2.4, 1 - smooth(.022, .085, rv));
}
function hNieve(x, z) {
  const rd = ridged(x * .0034 + 9, z * .0034 - 4, 5);
  let h = 16 + 100 * rd * rd + 9 * fbm(x * .011, z * .011, 3);
  h += 105 * Math.exp(-((x - 322) ** 2 + (z + 322) ** 2) / 5200);
  const lg = Math.exp(-((x - 186) ** 2 + (z + 160) ** 2) / 2600);
  return lerp(h, -2.5, clamp(lg * 1.4, 0, 1));
}
function hDesierto(x, z) {
  const dn = 1 - Math.abs(Math.sin(x * .043 + z * .017 + 2.6 * fbm(x * .0037, z * .0037, 3)));
  let h = 5.5 + 8.5 * dn * dn * dn + 3.5 * fbm(x * .008, z * .008, 3);
  const mesa = smooth(.3, .36, fbm(x * .0029 + 70, z * .0029 + 30, 3));
  h += mesa * (26 + 3 * Ruido.n2(x * .04, z * .04));
  const oa = Math.exp(-((x - OASIS.x) ** 2 + (z - OASIS.z) ** 2) / 700);
  return lerp(h, -2, clamp(oa * 1.5, 0, 1));
}
function hLagos(x, z) {
  let h = 3.2 + 4.5 * fbm(x * .0058 + 20, z * .0058 - 20, 4);
  h -= 9 * smooth(-.02, .28, fbm(x * .0052 - 33, z * .0052 + 12, 3));
  h += 1.3 * Ruido.n2(x * .04, z * .04);
  const lm = Math.exp(-((x + 246) ** 2 + (z - 232) ** 2) / 1900);
  return lerp(h, -4, clamp(lm * 1.6, 0, 1));
}
const FN_B = [hPradera, hSakura, hNieve, hDesierto, hLagos];
const _pc = new Float32Array(5);
function alturaNatural(x, z) {
  const I = islaEn(x, z); if (I) return alturaIsla(I, x, z);
  const w = pesos(x, z); _pc.set(w);
  let h = 0;
  for (let i = 0; i < 5; i++) if (_pc[i] > .002) h += _pc[i] * FN_B[i](x, z);
  const r = Math.sqrt(x * x + z * z) + 28 * Ruido.n2(x * .0042 + 50, z * .0042 - 50) + 9 * Ruido.n2(x * .02, z * .02);
  const tierra = smooth(RADIO_ISLA + 14, RADIO_ISLA - 58, r);
  return lerp(-20 + 3 * Ruido.n2(x * .01, z * .01), h, tierra);
}
function alturaBase(x, z) {
  let h = alturaNatural(x, z);
  for (let i = 0; i < SITIOS.length; i++) {
    const s = SITIOS[i], dx = x - s.x, dz = z - s.z, d2 = dx * dx + dz * dz;
    if (d2 < s.r2 * s.r2) h = lerp(s.h, h, smooth(s.r1, s.r2, Math.sqrt(d2)));
  }
  return h;
}
function altura(x, z) { const h = alturaBase(x, z); return _cuevasListas ? excavar(x, z, h) : h; }
function pendiente(x, z) { const a = altura(x - .6, z), b = altura(x + .6, z), c = altura(x, z - .6), d = altura(x, z + .6); return Math.hypot(b - a, d - c) / 1.2; }

/* ---------- cuevas: trazado, excavado y volumen interior ---------- */
function prepararCuevas() {
  for (const c of CUEVAS) {
    let bx = c.x, bz = c.z;
    if (c.sitio) { const s = sitio(c.sitio); bx = s.x + c.dir[0] * c.d0; bz = s.z + c.dir[1] * c.d0; }
    const y0 = alturaBase(bx, bz), n = Math.ceil(c.largo / 2);
    c.pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, s = t * c.largo, lat = Math.sin(t * 3.1) * c.curva;
      c.pts.push({ x: bx + c.dir[0] * s - c.dir[1] * lat, z: bz + c.dir[1] * s + c.dir[0] * lat, y: y0 - c.baja * smooth(0, 1, t), s });
    }
    const u = c.pts[c.pts.length - 1];
    c.cx = u.x + c.dir[0] * c.Rc * .8; c.cz = u.z + c.dir[1] * c.Rc * .8; c.cy = u.y; c.y0 = y0;
    c.bx = bx; c.bz = bz;
    c.mx = (bx + c.cx) / 2; c.mz = (bz + c.cz) / 2; c.mr = c.largo / 2 + c.Rc + 46;
  }
  _cuevasListas = true;
}
const _pq = { d: 0, s: 0, fy: 0 };
function proyCueva(c, x, z) {
  let best = 1e9, bs = 0, bfy = 0; const P = c.pts;
  for (let i = 0; i < P.length - 1; i++) {
    const a = P[i], b = P[i + 1], ex = b.x - a.x, ez = b.z - a.z, L2 = ex * ex + ez * ez;
    let t = ((x - a.x) * ex + (z - a.z) * ez) / L2;
    t = i === 0 ? Math.min(t, 1) : clamp(t, 0, 1);
    const px = a.x + ex * t, pz = a.z + ez * t, d = Math.hypot(x - px, z - pz);
    if (d < best) { best = d; bs = a.s + (b.s - a.s) * t; bfy = a.y + (b.y - a.y) * clamp(t, 0, 1); }
  }
  _pq.d = best; _pq.s = bs; _pq.fy = bfy; return _pq;
}
/* boca de las cuevas: la loma de encima sube desde 'rampa' m antes de la boca hasta 'dentro' m pasada */
const BOCA = { rampa: 8, dentro: 1.5 };
function excavar(x, z, h) {
  for (const c of CUEVAS) {
    if (Math.abs(x - c.mx) > c.mr || Math.abs(z - c.mz) > c.mr) continue;
    const q = proyCueva(c, x, z);
    // la loma sobre el túnel empieza a subir unos metros antes de la boca (antes subía de golpe en ella y dejaba un
    // escalón vertical de ~10 m a los lados); delante, una explanada a la altura de la entrada
    const tu = (1 - smooth(c.R + 1.5, c.R + 15, q.d)) * smooth(-BOCA.rampa, BOCA.dentro, q.s);
    if (tu > 0) h = Math.max(h, lerp(h, Math.max(q.fy, c.y0 - c.baja) + c.R * 1.55 + 3.5, tu));
    if (q.s < 0 && q.s > -30) { const t = (1 - smooth(c.R * .8, c.R + 7, q.d)) * (1 - smooth(6, 30, -q.s)); if (t > 0) h = lerp(h, Math.min(h, c.y0), t); }
    const dc = Math.hypot(x - c.cx, z - c.cz);
    if (dc < c.Rc + 16) { const t = 1 - smooth(c.Rc + 1, c.Rc + 16, dc); h = Math.max(h, lerp(h, c.cy + c.Rc * 1.45 + 4, t)); }
  }
  return h;
}
/* ¿el terreno tiene aquí el hueco de la boca de una cueva? m: margen (los faldones de los trozos se quitan también junto al hueco) */
function huecoCueva(x, z, m) {
  m = m || 0;
  for (const c of CUEVAS) {
    if (Math.abs(x - c.bx) > 16 + m || Math.abs(z - c.bz) > 16 + m) continue;
    const q = proyCueva(c, x, z);
    if (q.s > -1.8 - m && q.s < 4.5 + m && q.d < c.R + 1.3 + m) return true;
  }
  return false;
}
/* devuelve {suelo, techo, cueva, eje:{x,z,d}} si el punto está dentro de una cueva */
const _ec = { suelo: 0, techo: 0, c: null, d: 0, s: 0, enCamara: false, ax: 0, az: 0 };
function enCueva(x, y, z) {
  for (const c of CUEVAS) {
    if (Math.abs(x - c.mx) > c.mr || Math.abs(z - c.mz) > c.mr) continue;
    const dc = Math.hypot(x - c.cx, z - c.cz);
    if (dc < c.Rc * .96 && y < c.cy + c.Rc * 1.3 && y > c.cy - 3) {
      _ec.suelo = c.cy; _ec.techo = c.cy + c.Rc * 1.25; _ec.c = c; _ec.d = dc; _ec.enCamara = true; _ec.ax = c.cx; _ec.az = c.cz; return _ec;
    }
    const q = proyCueva(c, x, z);
    if (q.s > -1.4 && q.s < c.largo + 2 && q.d < c.R * .96 && y < q.fy + c.R * 1.5 && y > q.fy - 3) {
      _ec.suelo = q.fy; _ec.techo = q.fy + c.R * 1.4; _ec.c = c; _ec.d = q.d; _ec.s = q.s; _ec.enCamara = false; return _ec;
    }
  }
  return null;
}

/* ---------- caminos ---------- */
const _segChunk = new Map();
function trazarCaminos() {
  const rutas = [['faro', 'aldea'], ['faro', 'mirador'], ['faro', 'petalo'], ['faro', 'escarcha'], ['faro', 'duna'], ['aldea', 'muelle']];
  for (const [a, b] of rutas) {
    const A = sitio(a), B = sitio(b), L = Math.hypot(B.x - A.x, B.z - A.z), n = Math.ceil(L / 10), pts = [];
    const nx = -(B.z - A.z) / L, nz = (B.x - A.x) / L, sem = A.x * .1 + B.z * .07;
    for (let i = 0; i <= n; i++) {
      const t = i / n, m = Math.sin(t * Math.PI) * (16 * Ruido.n2(t * 2.4 + sem, sem) + 6 * Ruido.n2(t * 7 + sem, 3));
      pts.push([lerp(A.x, B.x, t) + nx * m, lerp(A.z, B.z, t) + nz * m]);
    }
    CAMINOS.push(pts);
    for (let i = 0; i < pts.length - 1; i++) {
      const s = [pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]];
      const ci0 = Math.floor((Math.min(s[0], s[2]) - 6) / CHUNK), ci1 = Math.floor((Math.max(s[0], s[2]) + 6) / CHUNK);
      const cj0 = Math.floor((Math.min(s[1], s[3]) - 6) / CHUNK), cj1 = Math.floor((Math.max(s[1], s[3]) + 6) / CHUNK);
      for (let ci = ci0; ci <= ci1; ci++) for (let cj = cj0; cj <= cj1; cj++) {
        const k = ci * 100 + cj; if (!_segChunk.has(k)) _segChunk.set(k, []); _segChunk.get(k).push(s);
      }
    }
  }
}
function pesoCamino(x, z, segs) {
  if (!segs) return 0;
  let dm = 99;
  for (const s of segs) {
    const ex = s[2] - s[0], ez = s[3] - s[1], L2 = ex * ex + ez * ez;
    const t = clamp(((x - s[0]) * ex + (z - s[1]) * ez) / L2, 0, 1), d = Math.hypot(x - s[0] - ex * t, z - s[1] - ez * t);
    if (d < dm) dm = d;
  }
  return 1 - smooth(1.1, 2.7, dm + Ruido.n2(x * .3, z * .3) * .5);
}

/* ---------- material del suelo ----------
   Mezcla por altura de las capas de Texturas (hierba, musgo, tierra, roca, nieve, arena,
   barro, arenisca) según bioma, camino, pendiente, altura y orilla. Roca triplanar en
   pendientes, normales de detalle, oclusión por vértice y color medio a lo lejos. */
let MAT_SUELO;
// metros que ocupa cada repetición de textura por capa
const ESCALA_CAPA = [2.6, 2.8, 2.4, 6.5, 4.2, 3.6, 2.4, 9];
/* losas: los caminos se empedran cerca del faro, la aldea y el santuario del Pétalo (sitio, radio en m) con la capa de
   sillares a 'escala' m por repetición */
/* alto (m sobre el agua) hasta el que llega la orilla de barro en los Lagos de Marea (en el resto, 2,2 m de arena) */
const ORILLA_LAGOS = .85;
const LOSAS = { sitios: [['faro', 70], ['aldea', 48], ['petalo', 40]], escala: 2.2 };
function crearMaterialSuelo() {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
  m.onBeforeCompile = sh => {
    Atmosfera.inyectar(sh); Texturas.usar(sh);
    sh.uniforms.tDet = U.tDet; sh.uniforms.uT = U.uT; sh.uniforms.uRest = U.uRest;
    sh.uniforms.uLosas = { value: LOSAS.sitios.map(([id, r]) => { const s = sitio(id); return new THREE.Vector3(s.x, s.z, r); }) };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 aBio;\nattribute float aCam;\nattribute float aOcl;\nvarying vec4 vBio;\nvarying float vCam;\nvarying float vOcl;\nvarying vec3 vWP;\nvarying vec3 vWN;')
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvWN = objectNormal;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = transformed; vBio = aBio; vCam = aCam; vOcl = aOcl;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
${Texturas.GLSL}
uniform sampler2D tDet; uniform float uT; uniform float uRest; uniform vec3 uLosas[${LOSAS.sitios.length}];
const float ORILLA_LAGOS = ${ORILLA_LAGOS.toFixed(2)};
varying vec4 vBio; varying float vCam; varying float vOcl; varying vec3 vWP; varying vec3 vWN;
const float ESC[8] = float[8](${ESCALA_CAPA.map(v => v.toFixed(2)).join(', ')});
vec3 L(vec3 c){ return pow(c, vec3(2.2)); }`)
      .replace('#include <map_fragment>', `
vec2 P = vWP.xz; float H = vWP.y; vec3 Ng = normalize(vWN);
float dist = length(vWP - cameraPosition), cerca = 1. - smoothstep(55., 130., dist), lejos = smoothstep(170., 300., dist);
vec4 nD = texture2D(tDet, P*.0061), nA = texture2D(tDet, P*.031), nB = texture2D(tDet, P*.19);
float pend = 1. - clamp(Ng.y, 0., 1.);
float bS = vBio.x, bN = vBio.y, bD = vBio.z, bL = vBio.w, bP = max(0., 1. - bS - bN - bD - bL);
// pesos de capa: 0 hierba · 1 musgo · 2 tierra · 3 roca · 4 nieve · 5 arena · 6 barro · 7 arenisca
float w[8];
float claro = smoothstep(.6, .86, nA.b);
w[0] = bP*(1. - claro*.6) + bS*.3 + bL*.55; w[1] = bS*.7; w[2] = bP*claro*.6 + bL*.1;
w[3] = 0.; w[4] = bN; w[5] = bD; w[6] = bL*.35; w[7] = 0.;
float cam = vCam*(1. - smoothstep(.3, .5, pend));
for (int i = 0; i < 8; i++) w[i] *= 1. - cam*.9;
// cerca de los lugares habitados el camino es de losas (capa de sillares, aparte del bucle de capas)
float losa = 0.; for (int i = 0; i < ${LOSAS.sitios.length}; i++) losa = max(losa, 1. - smoothstep(uLosas[i].z*.75, uLosas[i].z, length(P - uLosas[i].xy)));
losa *= smoothstep(.35, .6, cam)*(1. - bN);
w[2] += cam*(bP + bS + bL)*1.3*(1. - losa); w[5] += cam*bD*(1. - losa); w[4] += cam*bN*.9;
// orilla: en los lagos (tierra baja) solo una franja de barro junto al agua; el resto es pradera húmeda
float playa = (1. - smoothstep(.4, mix(2.2, ORILLA_LAGOS, bL), H + (nB.r - .5)*mix(1.2, .5, bL)))*(1. - bN);
for (int i = 0; i < 8; i++) w[i] *= 1. - playa*.85;
w[5] += playa*(bP + bS + bD)*1.1; w[6] += playa*bL*1.1;
float nv = smoothstep(58., 80., H + nA.r*16.)*(1. - smoothstep(.45, .7, pend));
float tR = smoothstep(.2, .4, pend + (nA.g - .5)*.2);
for (int i = 0; i < 8; i++) w[i] *= (1. - tR)*(1. - nv);
w[4] += nv*(1. - tR); w[3] = tR*(1. - bD); w[7] = tR*bD;
// muestreo en una pasada: cada capa pesa w·(altura + .15)^4, así la más alta asoma en las transiciones
vec3 tw = triPesos(Ng);
vec3 alb = vec3(0.), nW = vec3(0.); float rug = 0., aoT = 0., suma = 0.;
for (int i = 0; i < 8; i++) {
  if (w[i] < .015) continue;
  float c = float(i);
  if (lejos > .99) { vec4 mm = textureLod(tSueloA, vec3(.5, .5, c), 9.); alb += pow(mm.rgb, vec3(2.2))*w[i]; rug += mm.a*w[i]; aoT += w[i]; suma += w[i]; continue; }
  if ((i == 3 || i == 7) && pend > .2) {          // roca triplanar
    vec2 ux = vWP.zy/ESC[i], uy = P/ESC[i], uz = vWP.xy/ESC[i];
    vec4 A, bx, by, bz; triplanar(ux, uy, uz, tw, c, A, bx, by, bz); vec4 B = bx*tw.x + by*tw.y + bz*tw.z;
    vec3 nx = vec3(bx.xy + Ng.zy, Ng.x), ny = vec3(by.xy + Ng.xz, Ng.y), nz = vec3(bz.xy + Ng.xy, Ng.z);
    float f = w[i]*pow(B.z + .15, 4.);
    nW += f*normalize(nx.zyx*tw.x + ny.xzy*tw.y + nz*tw.z);
    alb += A.rgb*f; rug += A.a*f; aoT += B.w*f; suma += f;
  } else {
    vec2 uv = P/ESC[i];
    vec4 A = sueloA(uv, c), B = cerca > .01 ? sueloB(uv, c) : vec4(0., 0., .5, 1.);
    if (dist < 60.) A.rgb = mix(A.rgb, sueloA(mat2(.8, -.6, .6, .8)*P/(ESC[i]*3.7) + .37, c).rgb, .35);   // segunda escala contra la repetición
    float f = w[i]*pow(B.z + .15, 4.);
    nW += f*vec3(B.x + Ng.x, Ng.y, B.y + Ng.z);
    alb += A.rgb*f; rug += A.a*f; aoT += B.w*f; suma += f;
  }
}
if (losa > .01 && lejos < .99) {
  vec2 uvL = P/${LOSAS.escala.toFixed(1)}; float cS = ${Texturas.CAPA.sillar}.;
  vec4 A = sueloA(uvL, cS), B = cerca > .01 ? sueloB(uvL, cS) : vec4(0., 0., .5, 1.);
  float f = losa*1.6*pow(B.z + .15, 4.)*max(suma, .05)/max(1. - losa, .05);
  nW += f*vec3(B.x + Ng.x, Ng.y, B.y + Ng.z); alb += A.rgb*f; rug += A.a*f; aoT += B.w*f; suma += f;
}
suma = max(suma, 1e-5); alb /= suma; rug /= suma; aoT /= suma;
nW = dot(nW, nW) > 1e-6 ? normalize(mix(Ng, normalize(nW), cerca*(1. - lejos))) : Ng;
// variación grande de tono y brillo
alb *= .82 + .36*nD.r;
alb = mix(alb, alb*vec3(1.12, 1.04, .72), smoothstep(.55, .85, nD.g)*(w[0] + w[1])*.6);
// humedad junto al agua, bajo el agua, cáusticas
float moj = 1. - smoothstep(-.05, .5, H);
alb *= 1. - .4*moj; rug = mix(rug, .25, moj*.85);
float prof = clamp(-H, 0., 14.);
alb = mix(alb, alb*vec3(.55, .75, .8), smoothstep(0., 6., prof));
float cau = texture2D(tDet, P*.31 + vec2(uT*.031, uT*.019)).b*texture2D(tDet, P*.27 - vec2(uT*.022, uT*.016)).g;
alb += L(vec3(.4, .55, .5))*smoothstep(.28, .52, cau)*step(H, -.15)*(1. - smoothstep(0., 7., prof))*(1. - bN)*.6;
// destellos de la nieve
float chispa = step(.997, fract(sin(dot(floor(P*70.), vec2(12.9898, 78.233)))*43758.5453))*w[4]*cerca;
rug = mix(rug, .06, chispa);
// el mundo sin luz pierde color
float lum = dot(alb, vec3(.299, .587, .114));
alb = mix(vec3(lum), alb, .58 + .42*uRest);
diffuseColor.rgb *= alb;
vec3 nTerreno = nW; float aoTerreno = mix(1., aoT, .85*cerca)*vOcl;`)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = rug;')
      .replace('#include <normal_fragment_maps>', 'normal = normalize((viewMatrix*vec4(nTerreno, 0.)).xyz);')
      .replace('#include <aomap_fragment>', 'reflectedLight.indirectDiffuse *= aoTerreno; reflectedLight.indirectSpecular *= aoTerreno; reflectedLight.directDiffuse *= mix(1., aoTerreno, .5);');
  };
  return m;
}

/* ---------- chunks ---------- */
const CH = new Map();
const COLA_CH = [];
let chunksCambiaron = false;
/* oclusión por vértice: concavidad local (vecinos de la malla) y de valle (mapa a 7 m) */
function altMapa(x, z) {
  const N = MAPA.N, A = MAPA.alt, fx = clamp((x + 500) / 1000 * N - .5, 0, N - 1.001), fz = clamp((z + 500) / 1000 * N - .5, 0, N - 1.001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, w = fz - j;
  return lerp(lerp(A[j * N + i], A[j * N + i + 1], u), lerp(A[(j + 1) * N + i], A[(j + 1) * N + i + 1], u), w);
}
function oclusionSuelo(x, z, h, conc, paso) {
  const R = 7, valle = (altMapa(x + R, z) + altMapa(x - R, z) + altMapa(x, z + R) + altMapa(x, z - R)) * .25 - altMapa(x, z);
  return clamp((1 - clamp(conc / paso, 0, 1) * .55) * (1 - clamp(valle / R, 0, .8) * .5), .38, 1);
}
/* un trozo se construye por pasos (generador): actualizarChunks lo avanza unos ms por fotograma en vez de hacerlo de golpe
   (uno de cerca cuesta ~20 ms). filasH / filasV: filas de alturas y de vértices entre pausa y pausa; n: lado de la malla por nivel */
const TROZO = { filasH: 8, filasV: 4, n: [64, 32, 14] };
function* geomChunkPasos(ci, cj, n) {
  const x0 = ci * CHUNK, z0 = cj * CHUNK, paso = CHUNK / n, M = n + 3, N1 = n + 1;
  const H = new Float32Array(M * M);
  for (let j = 0; j < M; j++) { for (let i = 0; i < M; i++) H[j * M + i] = altura(x0 + (i - 1) * paso, z0 + (j - 1) * paso); if (j % TROZO.filasH === TROZO.filasH - 1) yield; }
  const nv = N1 * N1 + 4 * N1;
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), bio = new Float32Array(nv * 4), cam = new Float32Array(nv), ocl = new Float32Array(nv);
  const segs = _segChunk.get(ci * 100 + cj);
  let v = 0;
  for (let j = 0; j <= n; j++) {
   if (j % TROZO.filasV === TROZO.filasV - 1) yield;
   for (let i = 0; i <= n; i++) {
    const x = x0 + i * paso, z = z0 + j * paso, h = H[(j + 1) * M + i + 1];
    const hl = H[(j + 1) * M + i], hr = H[(j + 1) * M + i + 2], hu = H[j * M + i + 1], hd = H[(j + 2) * M + i + 1];
    let nx = hl - hr, ny = 2 * paso, nz = hu - hd; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    pos[v * 3] = x; pos[v * 3 + 1] = h; pos[v * 3 + 2] = z;
    nor[v * 3] = nx; nor[v * 3 + 1] = ny; nor[v * 3 + 2] = nz;
    const w = pesos(x, z); bio[v * 4] = w[1]; bio[v * 4 + 1] = w[2]; bio[v * 4 + 2] = w[3]; bio[v * 4 + 3] = w[4];
    cam[v] = pesoCamino(x, z, segs);
    ocl[v] = oclusionSuelo(x, z, h, (hl + hr + hu + hd) * .25 - h, paso); v++;
   }
  }
  // faldones: bajan el borde para tapar grietas entre niveles de detalle
  const borde = [];
  for (let i = 0; i <= n; i++) borde.push(i);
  for (let j = 0; j <= n; j++) borde.push(j * N1 + n);
  for (let i = n; i >= 0; i--) borde.push(n * N1 + i);
  for (let j = n; j >= 0; j--) borde.push(j * N1);
  const falda = [];
  for (let k = 0; k < borde.length; k++) {
    const s = borde[k];
    if (v >= nv) break;
    pos[v * 3] = pos[s * 3]; pos[v * 3 + 1] = pos[s * 3 + 1] - 3 - paso; pos[v * 3 + 2] = pos[s * 3 + 2];
    nor.copyWithin(v * 3, s * 3, s * 3 + 3); bio.copyWithin(v * 4, s * 4, s * 4 + 4); cam[v] = cam[s]; ocl[v] = ocl[s];
    falda.push(v); v++;
  }
  const idx = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const a = j * N1 + i, b = a + 1, c = a + N1, d = c + 1;
    const mx = x0 + (i + .5) * paso, mz = z0 + (j + .5) * paso;
    if (huecoCueva(mx, mz)) continue;
    idx.push(a, c, b, b, c, d);
  }
  for (let k = 0; k < falda.length - 1; k++) {
    const a = borde[k], b = borde[k + 1], fa = falda[k], fb = falda[k + 1];
    if (a === b) continue;
    if (huecoCueva((pos[a * 3] + pos[b * 3]) / 2, (pos[a * 3 + 2] + pos[b * 3 + 2]) / 2, 3)) continue;   // sin faldón dentro de la boca de una cueva
    idx.push(a, fa, b, b, fa, fb);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, v * 3), 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor.subarray(0, v * 3), 3));
  g.setAttribute('aBio', new THREE.BufferAttribute(bio.subarray(0, v * 4), 4));
  g.setAttribute('aCam', new THREE.BufferAttribute(cam.subarray(0, v), 1));
  g.setAttribute('aOcl', new THREE.BufferAttribute(ocl.subarray(0, v), 1));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return { g, H, M, paso, bio, cam };
}
/* cada trozo guarda la geometría de los niveles que ya construyó (ch.cache): volver a un nivel es instantáneo, sin
   verse el trozo con poco detalle mientras se rehace (sobre todo en las cinemáticas, con la cámara rápida). Al salir el
   trozo de la vista se libera solo el nivel 0 (el pesado); los otros dos son pequeños y se conservan */
function construirChunk(ch, lod, r) {
  const antes = ch.lod;
  if (ch.mesh) scene.remove(ch.mesh);
  (ch.cache = ch.cache || [])[lod] = r;
  const m = new THREE.Mesh(r.g, MAT_SUELO);
  m.receiveShadow = true; m.castShadow = lod === 0; m.matrixAutoUpdate = false; m.layers.set(CAPAS.estatica);
  scene.add(m); ch.mesh = m; ch.lod = lod;
  if (lod === 0) { ch.H = r.H; ch.M = r.M; ch.paso = r.paso; ch.bioV = r.bio; ch.camV = r.cam; ch.n = TROZO.n[lod]; }
  if (!ch.veg) Flora.generarChunk(ch);
  chunksCambiaron = true; if (lod === 0 || antes === 0) Bus.emit('sombraEstatica');   // solo el nivel 0 da sombra
}
function alturaChunk(ch, x, z) {
  const fx = (x - ch.i * CHUNK) / ch.paso + 1, fz = (z - ch.j * CHUNK) / ch.paso + 1;
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, w = fz - j, M = ch.M, H = ch.H;
  const a = H[j * M + i], b = H[j * M + i + 1], c = H[(j + 1) * M + i], d = H[(j + 1) * M + i + 1];
  return lerp(lerp(a, b, u), lerp(c, d, u), w);
}
let trozoEnCurso = null;
function actualizarChunks(px, pz, ms) {
  const V = CAL.vista, C = CHUNK, vistos = new Set(), pend = [];
  const i0 = Math.floor((px - V) / C), i1 = Math.floor((px + V) / C), j0 = Math.floor((pz - V) / C), j1 = Math.floor((pz + V) / C);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    if ((i < -7 || i > 6 || j < -7 || j > 6) && !islaEn((i + .5) * C, (j + .5) * C, .6)) continue;   // isla principal o una isla extra
    const cx = (i + .5) * C, cz = (j + .5) * C;
    const d = Math.hypot(Math.max(Math.abs(px - cx) - C / 2, 0), Math.max(Math.abs(pz - cz) - C / 2, 0));
    if (d > V) continue;
    const k = i * 100 + j; vistos.add(k);
    let ch = CH.get(k);
    if (!ch) { ch = { i, j, k, lod: -1, mesh: null, veg: null, hierba: null }; CH.set(k, ch); }
    let lod = d < CAL.lod[0] ? 0 : d < CAL.lod[1] ? 1 : 2;
    if (ch.lod >= 0 && ch.lod < lod && d < CAL.lod[ch.lod] + 14) lod = ch.lod;
    ch.d = d;
    if (ch.lod !== lod) { if (ch.cache && ch.cache[lod]) construirChunk(ch, lod, ch.cache[lod]); else pend.push({ ch, lod, d }); }
  }
  for (const [k, ch] of CH) if (!vistos.has(k) && ch.mesh) { scene.remove(ch.mesh); if (ch.cache && ch.cache[0]) { ch.cache[0].g.dispose(); ch.cache[0] = null; } ch.mesh = null; ch.lod = -1; chunksCambiaron = true; }
  pend.sort((a, b) => a.d - b.d);
  // avanza el trozo en curso (y los siguientes) hasta gastar ms; el que se ve sigue en su nivel anterior mientras tanto
  const t0 = performance.now();
  while (performance.now() - t0 < ms) {
    if (!trozoEnCurso) { const p = pend.find(q => q.ch.lod !== q.lod); if (!p) break; trozoEnCurso = { ch: p.ch, lod: p.lod, it: geomChunkPasos(p.ch.i, p.ch.j, TROZO.n[p.lod]) }; }
    const r = trozoEnCurso.it.next();
    if (r.done) { const T = trozoEnCurso; trozoEnCurso = null; if (vistos.has(T.ch.k)) construirChunk(T.ch, T.lod, r.value); }
  }
  return pend.length + (trozoEnCurso ? 1 : 0);
}

/* ---------- mapa del mundo (textura de biomas + imagen para el mapa) ---------- */
const MAPA = { N: 256, alt: null, img: null, tam: 512, islas: [] };
/* imágenes de las islas: resolución en píxeles y margen de mar respecto al semieje mayor */
const MAPA_ISLAS = { tam: 256, margen: 1.25 };
function generarMapa() {
  const N = MAPA.N, d = new Uint8Array(N * N * 4), alt = new Float32Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = -500 + (i + .5) * 1000 / N, z = -500 + (j + .5) * 1000 / N, k = j * N + i;
    alt[k] = altura(x, z); const w = pesos(x, z);
    d[k * 4] = w[2] * 255; d[k * 4 + 1] = w[3] * 255; d[k * 4 + 2] = w[4] * 255; d[k * 4 + 3] = w[1] * 255;
  }
  const t = new THREE.DataTexture(d, N, N, THREE.RGBAFormat);
  t.magFilter = t.minFilter = THREE.LinearFilter; t.needsUpdate = true; U.tBio.value = t; MAPA.alt = alt; MAPA.bio = d;
  // profundidad del agua (0 en la orilla, 1 a 12 m o más) para la transparencia y las olas
  const NP = 512, pr = new Uint8Array(NP * NP), ext = RADIO_ISLA + 70;
  for (let j = 0; j < NP; j++) for (let i = 0; i < NP; i++) {
    const x = -500 + (i + .5) * 1000 / NP, z = -500 + (j + .5) * 1000 / NP;
    pr[j * NP + i] = Math.hypot(x, z) > ext ? 255 : clamp(-altura(x, z) / 12, 0, 1) * 255;
  }
  const tp = new THREE.DataTexture(pr, NP, NP, renderer.capabilities.isWebGL2 ? THREE.RedFormat : THREE.LuminanceFormat);
  tp.magFilter = tp.minFilter = THREE.LinearFilter; tp.needsUpdate = true; U.tProf.value = tp;
  const cv = imagenMapa(alt, d, N, MAPA.tam), cx = cv.getContext('2d'), S = MAPA.tam;
  cx.strokeStyle = 'rgba(120,86,52,.85)'; cx.lineWidth = 2; cx.setLineDash([5, 4]);
  for (const c of CAMINOS) { cx.beginPath(); c.forEach((p, i) => { const X = (p[0] + 500) / 1000 * S, Y = (p[1] + 500) / 1000 * S; i ? cx.lineTo(X, Y) : cx.moveTo(X, Y); }); cx.stroke(); }
  cx.setLineDash([]);
  MAPA.img = cv;
  MAPA.islas = ISLAS.map(I => {
    const N = MAPA_ISLAS.tam, lado = 2 * Math.max(I.rx, I.rz) * MAPA_ISLAS.margen, x0 = I.x - lado / 2, z0 = I.z - lado / 2;
    const alt = new Float32Array(N * N), bio = new Uint8Array(N * N * 4), canal = [null, 3, 0, 1, 2][I.bioma];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const k = j * N + i; alt[k] = altura(x0 + (i + .5) * lado / N, z0 + (j + .5) * lado / N);
      if (canal !== null) bio[k * 4 + canal] = 255;
    }
    // normaliza el sombreado a los mismos metros por muestra que el continente
    return { img: imagenMapa(alt, bio, N, N, (1000 / MAPA.N) / (lado / N)), x0, z0, lado };
  });
}
/* paleta, costa, hielo y sombreado comunes a todas las imágenes del mapa */
function imagenMapa(alt, d, N, S, relieve = 1) {
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const cx = cv.getContext('2d'), im = cx.createImageData(S, S);
  const A = (i, j) => alt[clamp(j, 0, N - 1) * N + clamp(i, 0, N - 1)];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const fi = x / S * N, fj = y / S * N, i = Math.floor(fi), j = Math.floor(fj);
    const h = A(i, j), hx = (A(i + 1, j) - A(i - 1, j)) * relieve, hz = (A(i, j + 1) - A(i, j - 1)) * relieve;
    const k = j * N + i, w1 = d[k * 4 + 3] / 255, w2 = d[k * 4] / 255, w3 = d[k * 4 + 1] / 255, w4 = d[k * 4 + 2] / 255, w0 = Math.max(0, 1 - w1 - w2 - w3 - w4);
    let r = 0, g = 0, b = 0; const W = [w0, w1, w2, w3, w4];
    for (let q = 0; q < 5; q++) { r += BIOMAS[q].mapa[0] * W[q]; g += BIOMAS[q].mapa[1] * W[q]; b += BIOMAS[q].mapa[2] * W[q]; }
    const sh = clamp(1 + (-hx * .55 - hz * .35) * .09, .55, 1.35);
    r *= sh; g *= sh; b *= sh;
    if (h > 60) { const s = smooth(60, 85, h); r = lerp(r, 236, s); g = lerp(g, 240, s); b = lerp(b, 248, s); }
    if (h < 0 && !(w2 > .5)) { const p = clamp(-h / 16, 0, 1); r = lerp(96, 22, p); g = lerp(160, 58, p); b = lerp(178, 98, p); }
    else if (h < 0) { r = 196; g = 220; b = 236; }
    else if (h < 1.2) { r = lerp(r, 214, .5); g = lerp(g, 196, .5); b = lerp(b, 150, .5); }
    const o = (y * S + x) * 4; im.data[o] = r; im.data[o + 1] = g; im.data[o + 2] = b; im.data[o + 3] = 255;
  }
  cx.putImageData(im, 0, 0);
  return cv;
}
function sueloEn(x, z) { return altura(x, z); }
function esHielo(x, z) { const w = pesos(x, z); return w[2] > .5; }
/* el agua de Kiri está helada (30-agua.js la pinta como hielo): se anda por encima, a esta altura sobre el agua */
const HIELO_SUELO = .03;
