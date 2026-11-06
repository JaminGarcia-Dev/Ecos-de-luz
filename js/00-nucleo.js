/* === Ecos de Luz · 00-nucleo.js ===
   Utilidades, azar con semilla, ruido simplex, texturas procedurales,
   fusión de geometrías, ajustes de calidad y bus de eventos.
   Scripts clásicos: el orden de carga en index.html importa. */
"use strict";

const $ = id => document.getElementById(id);
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const rnd = (a, b) => a + Math.random() * (b - a);
const rndi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const angDif = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU; return d; };
const angDamp = (a, b, k, dt) => a + angDif(a, b) * (1 - Math.exp(-k * dt));
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const hyp = Math.hypot;

function rng(s) {
  return function () {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hash2(x, z, s) {
  let h = Math.imul((x | 0) + (s | 0) * 7919, 374761393) ^ Math.imul(z | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* ---------- ruido simplex 2D ---------- */
const Ruido = (() => {
  const gx = [1, -1, 1, -1, 1, -1, 0, 0], gy = [1, 1, -1, -1, 0, 0, 1, -1];
  const p = new Uint8Array(512), r = rng(20260601), b = [];
  for (let i = 0; i < 256; i++) b[i] = i;
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; }
  for (let i = 0; i < 512; i++) p[i] = b[i & 255];
  const F2 = .5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
  function n2(x, y) {
    const s = (x + y) * F2, i = Math.floor(x + s), j = Math.floor(y + s), t = (i + j) * G2;
    const x0 = x - i + t, y0 = y - j + t, i1 = x0 > y0 ? 1 : 0, j1 = 1 - i1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255; let n = 0, q, g;
    q = .5 - x0 * x0 - y0 * y0; if (q > 0) { g = p[ii + p[jj]] & 7; q *= q; n += q * q * (gx[g] * x0 + gy[g] * y0); }
    q = .5 - x1 * x1 - y1 * y1; if (q > 0) { g = p[ii + i1 + p[jj + j1]] & 7; q *= q; n += q * q * (gx[g] * x1 + gy[g] * y1); }
    q = .5 - x2 * x2 - y2 * y2; if (q > 0) { g = p[ii + 1 + p[jj + 1]] & 7; q *= q; n += q * q * (gx[g] * x2 + gy[g] * y2); }
    return 70 * n;
  }
  return { n2 };
})();
function fbm(x, z, o) { let s = 0, a = .5, f = 1, n = 0; for (let i = 0; i < o; i++) { s += a * Ruido.n2(x * f, z * f); n += a; a *= .5; f *= 2.03; } return s / n; }
function ridged(x, z, o) {
  let s = 0, a = .5, f = 1, n = 0, w = 1;
  for (let i = 0; i < o; i++) { let r = 1 - Math.abs(Ruido.n2(x * f, z * f)); r *= r * w; w = clamp(r * 1.6, 0, 1); s += a * r; n += a; a *= .5; f *= 2.1; }
  return s / n;
}

/* ---------- color ---------- */
const _c = new THREE.Color();
function lin(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function linArr(a) { return new THREE.Color(Math.pow(a[0], 2.2), Math.pow(a[1], 2.2), Math.pow(a[2], 2.2)); }

/* ---------- texturas procedurales ---------- */
function texRuido(N) {
  const d = new Uint8Array(N * N * 4), r = rng(777);
  const lat = f => { const g = new Float32Array(f * f); for (let i = 0; i < g.length; i++) g[i] = r(); return g; };
  const sm = (g, f, u, v) => {
    const x = u * f, y = v * f, xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const x0 = xi % f, y0 = yi % f, x1 = (x0 + 1) % f, y1 = (y0 + 1) % f;
    const sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf);
    const a = g[y0 * f + x0], b = g[y0 * f + x1], c = g[y1 * f + x0], e = g[y1 * f + x1];
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + e) * sx * sy;
  };
  const canal = (oct, cresta) => {
    const L = oct.map(o => [lat(o[0]), o[0], o[1]]);
    return (u, v) => { let s = 0, n = 0; for (const [g, f, a] of L) { let q = sm(g, f, u, v); if (cresta) q = 1 - Math.abs(q * 2 - 1); s += q * a; n += a; } return s / n; };
  };
  const C = [canal([[8, .35], [16, .3], [32, .2], [64, .15]]), canal([[4, .5], [8, .3], [16, .2]]),
    canal([[6, .5], [12, .3], [24, .2]], true), canal([[2, .6], [4, .4]])];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N, v = y / N, k = (y * N + x) * 4;
    for (let c = 0; c < 4; c++) d[k + c] = clamp((C[c](u, v) - .5) * 2.1 + .5, 0, 1) * 255 | 0;
  }
  const t = new THREE.DataTexture(d, N, N, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true;
  return t;
}
function texGradiente(paradas, alto) {
  alto = alto || 64; const d = new Uint8Array(alto * 4);
  for (let i = 0; i < alto; i++) {
    const t = i / (alto - 1); let k = 0;
    while (k < paradas.length - 2 && t > paradas[k + 1][0]) k++;
    const a = paradas[k], b = paradas[k + 1], u = clamp((t - a[0]) / (b[0] - a[0] || 1), 0, 1);
    _c.setHex(a[1]); const r0 = _c.r, g0 = _c.g, b0 = _c.b; _c.setHex(b[1]);
    d[i * 4] = lerp(r0, _c.r, u) * 255; d[i * 4 + 1] = lerp(g0, _c.g, u) * 255; d[i * 4 + 2] = lerp(b0, _c.b, u) * 255; d[i * 4 + 3] = 255;
  }
  const t = new THREE.DataTexture(d, 1, alto, THREE.RGBAFormat);
  t.magFilter = t.minFilter = THREE.LinearFilter; t.encoding = THREE.sRGBEncoding; t.needsUpdate = true;
  return t;
}
function texHalo(N, dura) {
  N = N || 64; const d = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = (x + .5) / N * 2 - 1, dy = (y + .5) / N * 2 - 1, r = Math.sqrt(dx * dx + dy * dy);
    const a = dura ? clamp(1 - r, 0, 1) ** 1.2 : Math.exp(-r * r * 5) * (1 - smooth(.85, 1, r));
    const k = (y * N + x) * 4; d[k] = d[k + 1] = d[k + 2] = 255; d[k + 3] = a * 255;
  }
  const t = new THREE.DataTexture(d, N, N, THREE.RGBAFormat);
  t.magFilter = t.minFilter = THREE.LinearFilter; t.needsUpdate = true; return t;
}

/* ---------- geometría: piezas con color y fusión ---------- */
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v3 = new THREE.Vector3(), _s3 = new THREE.Vector3();
function pieza(geo, hex, o) {
  o = o || {};
  const g = geo.index ? geo : geo;
  _e.set(o.rx || 0, o.ry || 0, o.rz || 0);
  _q.setFromEuler(_e);
  _s3.set(o.sx !== undefined ? o.sx : (o.s || 1), o.sy !== undefined ? o.sy : (o.s || 1), o.sz !== undefined ? o.sz : (o.s || 1));
  _m4.compose(_v3.set(o.x || 0, o.y || 0, o.z || 0), _q, _s3);
  if (o.antes) o.antes(g);
  g.applyMatrix4(_m4);
  const p = g.attributes.position, n = p.count, col = new Float32Array(n * 3);
  const base = lin(hex), vr = o.var || 0, ao = o.ao || 0;
  let y0 = Infinity, y1 = -Infinity;
  if (ao) for (let i = 0; i < n; i++) { const y = p.getY(i); if (y < y0) y0 = y; if (y > y1) y1 = y; }
  for (let i = 0; i < n; i++) {
    let f = 1;
    if (vr) f *= 1 + vr * Ruido.n2(p.getX(i) * 2.3 + 7, p.getZ(i) * 2.3 + p.getY(i) * 1.7);
    if (ao) f *= 1 - ao + ao * smooth(y0, y1, p.getY(i));
    col[i * 3] = base.r * f; col[i * 3 + 1] = base.g * f; col[i * 3 + 2] = base.b * f;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  return g;
}
function fusionar(geos) {
  let nv = 0, ni = 0;
  for (const g of geos) { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), uv = new Float32Array(nv * 2);
  const idx = nv > 65000 ? new Uint32Array(ni) : new Uint16Array(ni);
  let ov = 0, oi = 0;
  for (const g of geos) {
    const p = g.attributes.position, c = p.count;
    pos.set(p.array.subarray(0, c * 3), ov * 3);
    if (g.attributes.normal) nor.set(g.attributes.normal.array.subarray(0, c * 3), ov * 3);
    if (g.attributes.color) col.set(g.attributes.color.array.subarray(0, c * 3), ov * 3); else col.fill(1, ov * 3, (ov + c) * 3);
    if (g.attributes.uv) uv.set(g.attributes.uv.array.subarray(0, c * 2), ov * 2);
    if (g.index) { const ia = g.index.array; for (let k = 0; k < ia.length; k++) idx[oi++] = ia[k] + ov; }
    else for (let k = 0; k < c; k++) idx[oi++] = ov + k;
    ov += c; g.dispose();
  }
  const r = new THREE.BufferGeometry();
  r.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  r.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  r.setAttribute('color', new THREE.BufferAttribute(col, 3));
  r.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  r.setIndex(new THREE.BufferAttribute(idx, 1));
  r.computeBoundingSphere(); r.computeBoundingBox();
  return r;
}
/* desplaza vértices con ruido (rocas, copas) */
function abollar(g, k, f, semilla) {
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), l = Math.hypot(x, y, z) || 1;
    const d = 1 + k * Ruido.n2(x * f + semilla, z * f - y * f * .7 + semilla * 1.3) + k * .5 * Ruido.n2(y * f * 2.1 + semilla, x * f * 2.1);
    p.setXYZ(i, x * d, y * d, z * d);
  }
  g.computeVertexNormals(); return g;
}
/* el icosaedro de three no es indexado; lo indexamos para que las normales suavicen */
function icoSuave(r, det) {
  const g = new THREE.IcosahedronGeometry(r, det), p = g.attributes.position, mapa = new Map(), pos = [], idx = [];
  for (let i = 0; i < p.count; i++) {
    const k = Math.round(p.getX(i) * 1e4) + ',' + Math.round(p.getY(i) * 1e4) + ',' + Math.round(p.getZ(i) * 1e4);
    let j = mapa.get(k);
    if (j === undefined) { j = pos.length / 3; mapa.set(k, j); pos.push(p.getX(i), p.getY(i), p.getZ(i)); }
    idx.push(j);
  }
  g.dispose();
  const r2 = new THREE.BufferGeometry();
  r2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  r2.setIndex(idx); r2.computeVertexNormals(); return r2;
}

/* ---------- mallas con esqueleto hechas por código (skinning) ----------
   Cada vértice lleva color, rugosidad, brillo (aMat) y hasta dos huesos con peso. */
class Piel {
  constructor() { this.p = []; this.c = []; this.m = []; this.si = []; this.sw = []; this.i = []; }
  vert(x, y, z, col, rug, emis, pw) {
    this.p.push(x, y, z); this.c.push(col.r, col.g, col.b); this.m.push(rug, emis);
    this.si.push(pw[0], pw[2] || 0, 0, 0); this.sw.push(pw[1], pw[3] || 0, 0, 0); return this.p.length / 3 - 1;
  }
  /* anillos a lo largo de una polilínea; s: [{p: Vector3, rx, ry}] (rx lateral, ry hacia arriba) */
  tubo(secs, lados, colFn, rug, emis, pesoFn, tapas) {
    const base = this.p.length / 3, t = new THREE.Vector3(), X = new THREE.Vector3(), Y = new THREE.Vector3(), q = new THREE.Vector3(), arriba = new THREE.Vector3();
    secs.forEach((s, k) => {
      t.subVectors(secs[Math.min(k + 1, secs.length - 1)].p, secs[Math.max(k - 1, 0)].p).normalize();
      arriba.set(0, Math.abs(t.y) > .9 ? 0 : 1, Math.abs(t.y) > .9 ? 1 : 0); X.crossVectors(arriba, t).normalize(); Y.crossVectors(t, X);
      for (let a = 0; a <= lados; a++) {
        const an = a / lados * TAU; q.copy(s.p).addScaledVector(X, Math.cos(an) * s.rx).addScaledVector(Y, Math.sin(an) * s.ry);
        this.vert(q.x, q.y, q.z, colFn(q.x, q.y, q.z, Math.sin(an), k), rug, emis, pesoFn(q.x, q.y, q.z));
      }
    });
    for (let k = 0; k < secs.length - 1; k++) for (let a = 0; a < lados; a++) {
      const i0 = base + k * (lados + 1) + a, i1 = i0 + 1, i2 = i0 + lados + 1, i3 = i2 + 1; this.i.push(i0, i1, i2, i1, i3, i2);
    }
    if (tapas) for (const [k, ini] of [[0, true], [secs.length - 1, false]]) {
      const s = secs[k], c = this.vert(s.p.x, s.p.y, s.p.z, colFn(s.p.x, s.p.y, s.p.z, 0, k), rug, emis, pesoFn(s.p.x, s.p.y, s.p.z));
      for (let a = 0; a < lados; a++) { const i0 = base + k * (lados + 1) + a; ini ? this.i.push(c, i0 + 1, i0) : this.i.push(c, i0, i0 + 1); }
    }
  }
  /* elipsoide (o parte: v0..v1 de arriba abajo, filtro por ángulo) */
  elip(cx, cy, cz, rx, ry, rz, su, sv, colFn, rug, emis, pesoFn, v0 = 0, v1 = 1, filtro = null) {
    const base = this.p.length / 3, nu = su + 1;
    for (let j = 0; j <= sv; j++) {
      const th = lerp(v0, v1, j / sv) * Math.PI, sy = Math.cos(th), r = Math.sin(th);
      for (let a = 0; a < nu; a++) { const an = a / su * TAU, x = cx + Math.cos(an) * r * rx, y = cy + sy * ry, z = cz + Math.sin(an) * r * rz; this.vert(x, y, z, colFn(x, y, z, sy), rug, emis, pesoFn(x, y, z)); }
    }
    for (let j = 0; j < sv; j++) for (let a = 0; a < su; a++) {
      if (filtro && !filtro(a / su * TAU, lerp(v0, v1, (j + .5) / sv))) continue;
      const i0 = base + j * nu + a, i1 = i0 + 1, i2 = i0 + nu, i3 = i2 + 1; this.i.push(i0, i1, i2, i1, i3, i2);
    }
  }
  geo() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setAttribute('aMat', new THREE.Float32BufferAttribute(this.m, 2));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(this.si, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(this.sw, 4));
    g.setIndex(this.i); g.computeVertexNormals(); g.computeBoundingSphere(); return g;
  }
}
/* peso repartido entre dos huesos a lo largo de una coordenada: a en s ≥ s1, b en s ≤ s0 */
const pesoEntre = (a, b, s, s0, s1) => { const t = smooth(s0, s1, s); return t >= 1 ? [a, 1] : t <= 0 ? [b, 1] : [a, t, b, 1 - t]; };
/* IK de dos huesos en reposo verticales (apuntan a -Y). Orienta sup e inf para que el extremo
   llegue a 'objetivo' (mundo); 'polo' (espacio del padre de sup) es hacia dónde se dobla la articulación. */
const _ik = { a: new THREE.Vector3(), d: new THREE.Vector3(), f: new THREE.Vector3(), s: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(), w: new THREE.Vector3(), m: new THREE.Matrix4(), q: new THREE.Quaternion(), X: new THREE.Vector3(), Y: new THREE.Vector3(), Z: new THREE.Vector3() };
function ikDosHuesos(sup, inf, objetivo, polo, L1, L2, qSup, qInf) {
  const K = _ik, padre = sup.parent;
  K.a.copy(objetivo); padre.worldToLocal(K.a);
  K.d.subVectors(K.a, sup.position); let d = K.d.length(); const dmax = (L1 + L2) * .995;
  if (d > dmax) { K.d.multiplyScalar(dmax / d); d = dmax; } if (d < (L1 + L2) * .12) { K.d.set(0, -1, 0); d = (L1 + L2) * .12; }
  K.d.normalize();
  K.s.crossVectors(K.d, polo).normalize(); K.f.crossVectors(K.s, K.d).normalize();
  const al = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  K.b.copy(K.d).multiplyScalar(Math.cos(al)).addScaledVector(K.f, Math.sin(al));             // primer hueso
  K.c.copy(sup.position).addScaledVector(K.b, L1);                                          // articulación
  K.w.copy(sup.position).addScaledVector(K.d, d).sub(K.c).normalize();                       // segundo hueso
  // el marco de cada hueso mira siempre hacia +Z del padre (el frente del cuerpo), se doble hacia donde se doble
  const base = (out, dir) => { K.Y.copy(dir).negate(); K.Z.set(0, 0, 1).addScaledVector(dir, -dir.z).normalize(); K.X.crossVectors(K.Y, K.Z); K.m.makeBasis(K.X, K.Y, K.Z); return out.setFromRotationMatrix(K.m); };
  base(qSup, K.b); base(K.q, K.w); qInf.copy(qSup).invert().multiply(K.q);
}

/* ---------- textos 3D (sprites) ---------- */
function etiqueta(txt, o) {
  o = o || {};
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const x = c.getContext('2d');
  x.font = (o.peso || 700) + ' ' + (o.tam || 54) + 'px "Shippori Mincho", Georgia, serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.shadowColor = 'rgba(0,0,0,.85)'; x.shadowBlur = 14;
  x.fillStyle = o.color || '#ffe6ad'; x.fillText(txt, 256, 64);
  const t = new THREE.CanvasTexture(c);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: o.prof !== false, fog: false }));
  const a = o.ancho || 4; s.scale.set(a, a / 4, 1); return s;
}

/* ---------- halos: brillos aditivos (TEX.halo) siempre de cara a la cámara ----------
   Se usan como un sprite: posición y escala del nodo, más color, opacidad y giro (en el plano de la pantalla).
   Todos los que están en la escena se pintan en un solo lote instanciado: una llamada de dibujo en vez de una
   por halo. Halo.lote(escena) crea el lote; se rellena justo antes de dibujar, con las matrices ya al día.
   cap: halos que caben de inicio (crece si hace falta) · orden: renderOrder (tras el agua y las estelas) */
const HALO_LOTE = { cap: 256, orden: 4 };
class Halo extends THREE.Object3D {
  constructor(color, opacidad) {
    super();
    this.color = new THREE.Color(color === undefined ? 0xffffff : color);
    this.opacidad = opacidad === undefined ? 1 : opacidad; this.giro = 0;
    this.addEventListener('added', Halo.alta);
  }
  static alta(e) { Halo.activos.add(e.target); }
  static lote(escena) {
    const geo = new THREE.InstancedBufferGeometry(), plano = new THREE.PlaneGeometry(1, 1);
    geo.setIndex(plano.index); geo.setAttribute('position', plano.attributes.position); geo.setAttribute('uv', plano.attributes.uv);
    let cap = 0, aPos, aTam, aCol;
    const reservar = n => {
      const viejo = cap ? [aPos, aTam, aCol] : null; if (cap) geo.dispose(); cap = n;
      const at = k => new THREE.InstancedBufferAttribute(new Float32Array(n * k), k).setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('iPos', aPos = at(3)); geo.setAttribute('iTam', aTam = at(3)); geo.setAttribute('iCol', aCol = at(4));
      if (viejo) [aPos, aTam, aCol].forEach((a, i) => a.array.set(viejo[i].array));
    };
    reservar(HALO_LOTE.cap);
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: TEX.halo } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec3 iPos; attribute vec3 iTam; attribute vec4 iCol; varying vec2 vUv; varying vec4 vCol;
void main() {
  vUv = uv; vCol = iCol;
  vec4 mv = viewMatrix * vec4(iPos, 1.);
  vec2 p = position.xy * iTam.xy; float c = cos(iTam.z), s = sin(iTam.z);
  mv.xy += vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  gl_Position = projectionMatrix * mv;
}`,
      fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying vec4 vCol;
void main() {
  gl_FragColor = vec4(vCol.rgb, vCol.a * texture2D(map, vUv).a);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}`
    });
    const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.renderOrder = HALO_LOTE.orden; m.visible = false; escena.add(m);
    // se pinta un halo si está en la escena, visible él y todos sus padres, y con opacidad
    const llenar = () => {
      let n = 0;
      for (const h of Halo.activos) {
        if (!h.parent) { Halo.activos.delete(h); continue; }
        if (h.opacidad <= 0) continue;
        let o = h; while (o && o.visible && o !== escena) o = o.parent;
        if (o !== escena) continue;
        if (n >= cap) reservar(cap * 2);
        const e = h.matrixWorld.elements, i3 = n * 3, i4 = n * 4;
        aPos.array[i3] = e[12]; aPos.array[i3 + 1] = e[13]; aPos.array[i3 + 2] = e[14];
        aTam.array[i3] = Math.hypot(e[0], e[1], e[2]); aTam.array[i3 + 1] = Math.hypot(e[4], e[5], e[6]); aTam.array[i3 + 2] = h.giro;
        aCol.array[i4] = h.color.r; aCol.array[i4 + 1] = h.color.g; aCol.array[i4 + 2] = h.color.b; aCol.array[i4 + 3] = h.opacidad;
        n++;
      }
      geo.instanceCount = n; m.visible = n > 0; if (!n) return;
      for (const a of [aPos, aTam, aCol]) { a.updateRange.count = n * a.itemSize; a.needsUpdate = true; }
    };
    const previo = escena.onBeforeRender;
    escena.onBeforeRender = function () { previo.apply(this, arguments); llenar(); };
    return m;
  }
}
Halo.activos = new Set();

/* ---------- ajustes y calidad ---------- */
const AJUSTES = Object.assign({ calidad: 'alta', sens: 1, invY: false, maestro: 1, musica: .55, efectos: .8, ambiente: .8, voz: .8,fps: false, fov: 62, subtitulos: 'normal', hudDinamico: true, vibracion: true, dificultad: 'exigente' },
  (() => { try { return JSON.parse(localStorage.getItem('ecos2_ajustes') || '{}'); } catch (e) { return {}; } })());
function guardarAjustes() { try { localStorage.setItem('ecos2_ajustes', JSON.stringify(AJUSTES)); } catch (e) { } }
/* hdr: tubería con bloom y exposición automática · msaa: muestras de antialias ·
   sombraR: medio lado (m) del área con sombras · escalaMin: resolución mínima dinámica ·
   bloom: el bloom empieza a 1/2^bloom de la resolución (2 en media: más barato) · ao: oclusión ambiental · rayos: de sol · reflejos: en el agua */
const CALIDADES = {
  alta: { vista: 430, lod: [105, 235], sombra: 2048, sombraR: 70, hierba: 40, hdr: true, msaa: 4, pr: 1.5, rcMul: .85, escalaMin: .7, bloom: 1, ao: true, rayos: true, reflejos: true },
  media: { vista: 340, lod: [85, 190], sombra: 1024, sombraR: 55, hierba: 32, hdr: true, msaa: 2, pr: 1.25, rcMul: .62, escalaMin: .6, bloom: 2, ao: false, rayos: true, reflejos: true },
  baja: { vista: 230, lod: [60, 135], sombra: 0, sombraR: 0, hierba: 0, hdr: false, msaa: 0, pr: 1, rcMul: .45, escalaMin: .5 }
};
let CAL = CALIDADES[AJUSTES.calidad] || CALIDADES.alta;

/* ---------- bus de eventos ---------- */
/* capas de three: lo estático (terreno, vegetación y construcciones) tiene su sombra guardada (14-atmosfera.js);
   la copia de esa sombra solo la ve la cámara de las sombras */
const CAPAS = { estatica: 1, copiaSombra: 2 };

const Bus = {
  h: {},
  on(t, f) { (this.h[t] = this.h[t] || []).push(f); },
  emit(t, d) { const l = this.h[t]; if (l) for (const f of l) f(d); }
};

/* ---------- estado gráfico compartido ---------- */
const U = {
  uT: { value: 0 }, uRest: { value: 0 }, uJug: { value: new THREE.Vector3() },
  tDet: { value: null }, tBio: { value: null }, tProf: { value: null }, uViento: { value: 1 }
};
let scene, camera, renderer, reloj, TEX = {};
const UP = new THREE.Vector3(0, 1, 0);
