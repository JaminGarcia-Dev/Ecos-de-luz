/* === Ecos de Luz · 16-plantas.js ===
   Modelos procedurales de vegetación y rocas (sin archivos):
   · Árboles por especie: un esqueleto (tronco, ramas, ramitas y puntos de hoja) del que salen
     tres niveles de detalle; las hojas son tarjetas del atlas de Texturas con normales esféricas.
   · Matas de hierba, arbustos y rocas.
   · Materiales: corteza con textura y relieve, hojas con alfa a cobertura, luz que las atraviesa,
     nieve en los pinos y viento en tres escalas (árbol, rama y hoja). Rocas triplanares con
     musgo, nieve o arena encima según el bioma. */
"use strict";

const Plantas = (() => {
  const TAU2 = Math.PI * 2;
  /* especies: forma, tamaño, ramaje, hojas (celda del atlas) y colores (lineales); transl: color de la luz que
     atraviesa las hojas a contraluz; transN: cuánto pierde esa luz el tono del sol (0–1) */
  const ESPECIES = {
    cerezo: { forma: 'copa', alto: 6, fuste: .3, lider: .55, tronco: .2, ramas: 6, apertura: 1.12, largoRama: .52, curva: -.03, ramitas: 4, hojas: 240, tamHoja: 1.05, atlas: 'flor', corteza: 'corteza', tCorteza: [.3, .2, .18], transl: [.78, .42, .62], transN: .6 },
    arce: { forma: 'copa', alto: 7.5, fuste: .34, lider: .82, tronco: .24, ramas: 7, apertura: .82, largoRama: .43, curva: .1, ramitas: 4, hojas: 270, tamHoja: 1.1, atlas: 'anchas', corteza: 'corteza', tCorteza: [.34, .3, .26], transl: [.55, .8, .2] },
    pino: { forma: 'conifera', alto: 11, tronco: .24, inicio: 2.1, verticilo: .72, largoMax: 2.8, tamHoja: 1.25, fhMin: [1, .5, .22], atlas: 'agujas', corteza: 'cortezaPino', tCorteza: [.55, .44, .4], transl: [.3, .5, .25], nieve: true },
    // palmera: frondas arqueadas (nervio y hojas en V a los dos lados); pliegue: ángulo de la V; caida: cuánto se doblan
    palmera: { forma: 'palmera', alto: 7.2, tronco: .19, frondas: 14, largoFronda: 3.6, porFronda: 4, pliegue: .55, caida: .2, tamHoja: 1.15, fhMin: [1, .4, .16], atlas: 'largas', corteza: 'corteza', tCorteza: [.7, .6, .45], transl: [.55, .75, .2] },
    bambu: { forma: 'bambu', alto: 7.5, tallos: 7, tronco: .06, tamHoja: .62, atlas: 'largas', corteza: 'corteza', tCorteza: [.36, .55, .18], transl: [.5, .75, .2] },
    arbusto: { forma: 'arbusto', alto: 1.1, hojas: 46, tamHoja: .62, atlas: 'anchas', corteza: 'corteza', tCorteza: [.3, .24, .2], transl: [.5, .75, .2] }
  };
  /* niveles de detalle: lados del tronco, de las ramas y de las ramitas, fracción y escala de las hojas */
  const DET = [
    { lt: 9, lr: 5, lm: 3, fh: 1, eh: 1, ramas: true },
    { lt: 6, lr: 4, lm: 0, fh: .3, eh: 1.7, ramas: true },
    { lt: 4, lr: 0, lm: 0, fh: .075, eh: 3.3, ramas: false }
  ];

  /* ---------- constructor de mallas ---------- */
  class Malla {
    constructor() { this.p = []; this.n = []; this.uv = []; this.c = []; this.v = []; this.i = []; }
    vert(p, n, u, v, c, w) { this.p.push(p.x, p.y, p.z); this.n.push(n.x, n.y, n.z); this.uv.push(u, v); this.c.push(c[0], c[1], c[2]); this.v.push(w[0], w[1], w[2], w[3]); return this.p.length / 3 - 1; }
    geo() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
      g.setAttribute('aViento', new THREE.Float32BufferAttribute(this.v, 4)); g.setIndex(this.i); g.computeBoundingSphere(); return g;
    }
  }
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const _t = V3(), _b = V3(), _q = V3(), _d = V3();
  /* tubo a lo largo de una polilínea (marcos por transporte paralelo); uv de corteza en metros */
  function tubo(M, pts, rad, lados, col, flex, fase) {
    const n = pts.length, base = M.p.length / 3, largo = [0];
    for (let k = 1; k < n; k++) largo.push(largo[k - 1] + pts[k].distanceTo(pts[k - 1]));
    const L = largo[n - 1] || 1, rep = Math.max(1, Math.round(TAU2 * (rad[0] + rad[n - 1]) * .5 / .55));
    const nr = V3(0, 0, 1);
    for (let k = 0; k < n; k++) {
      _t.subVectors(pts[Math.min(k + 1, n - 1)], pts[Math.max(k - 1, 0)]).normalize();
      if (k === 0 && Math.abs(_t.z) > .9) nr.set(1, 0, 0);
      nr.addScaledVector(_t, -nr.dot(_t)).normalize(); _b.crossVectors(_t, nr);
      const s = largo[k] / L, fl = lerp(flex[0], flex[1], s), ao = lerp(col[3], 1, Math.min(1, s * 1.6 + .2));
      const c = [col[0] * ao, col[1] * ao, col[2] * ao];
      for (let a = 0; a <= lados; a++) {
        const an = a / lados * TAU2; _d.copy(nr).multiplyScalar(Math.cos(an)).addScaledVector(_b, Math.sin(an));
        M.vert(_q.copy(pts[k]).addScaledVector(_d, rad[k]), _d, a / lados * rep, largo[k] / .55, c, [fl, fase, 0, 0]);
      }
    }
    for (let k = 0; k < n - 1; k++) for (let a = 0; a < lados; a++) {
      const i0 = base + k * (lados + 1) + a, i1 = i0 + 1, i2 = i0 + lados + 1, i3 = i2 + 1;
      M.i.push(i0, i1, i2, i1, i3, i2);
    }
  }
  /* tarjeta de hojas: la base (ramita del atlas) queda junto a la rama y la normal mezcla la de la tarjeta con la esférica de la copa */
  function tarjeta(M, c, nrm, arriba, tam, celda, col, flex, fase, centro, esf) {
    const v = arriba.clone().addScaledVector(nrm, -arriba.dot(nrm)); if (v.lengthSq() < 1e-6) v.set(1, 0, 0); v.normalize();
    const u = V3().crossVectors(v, nrm).normalize(), h = tam / 2, u0 = celda[0] * .5, v0 = celda[1] * .5, base = M.p.length / 3;
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const p = c.clone().addScaledVector(u, a * h).addScaledVector(v, b * h);
      const ns = p.clone().sub(centro).normalize(), nn = nrm.clone().multiplyScalar(1 - esf).addScaledVector(ns, esf).normalize();
      M.vert(p, nn, u0 + (a * .5 + .5) * .5, v0 + (b * .5 + .5) * .5, col, [flex, fase, 1, 0]);
    }
    M.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  function puntoEn(pts, s) { const f = clamp(s, 0, 1) * (pts.length - 1), i = Math.min(Math.floor(f), pts.length - 2); return pts[i].clone().lerp(pts[i + 1], f - i); }
  function dirEn(pts, s) { const f = clamp(s, 0, 1) * (pts.length - 1), i = Math.min(Math.floor(f), pts.length - 2); return pts[i + 1].clone().sub(pts[i]).normalize(); }
  function perp(eje, R) { const a = V3(R() - .5, R() - .5, R() - .5); a.addScaledVector(eje, -a.dot(eje)); return a.lengthSq() < 1e-6 ? V3(1, 0, 0) : a.normalize(); }

  /* ---------- esqueletos (uno por especie; los niveles de detalle salen del mismo) ---------- */
  function esqCopa(e, R) {
    const S = { troncos: [], ramas: [], ramitas: [], hojas: [] }, alto = e.alto, largoT = alto * e.lider;
    const inc = V3((R() - .5) * .25, 1, (R() - .5) * .25).normalize(), tr = [], rr = [];
    for (let k = 0; k <= 8; k++) { const t = k / 8; tr.push(V3(inc.x * t * largoT + Math.sin(t * 3) * .12 * t, t * largoT, inc.z * t * largoT + Math.cos(t * 2.3) * .1 * t)); rr.push(e.tronco * (1 - t * .62) * (k === 0 ? 1.35 : 1)); }
    S.troncos.push({ pts: tr, rad: rr, flex: [0, .3] });
    const porRamita = Math.max(2, Math.round(e.hojas / (e.ramas * (e.ramitas + 1))));
    for (let k = 0; k < e.ramas; k++) {
      const t = lerp(e.fuste, .93, k / Math.max(1, e.ramas - 1)), b = puntoEn(tr, t), az = k * 2.39996 + R() * .5, ap = e.apertura * (1 - .22 * t) + (R() - .5) * .2;
      const dir = V3(Math.sin(ap) * Math.cos(az), Math.cos(ap), Math.sin(ap) * Math.sin(az));
      const L = alto * e.largoRama * (1.1 - .45 * (t - e.fuste) / (1 - e.fuste)) * (.85 + R() * .3), pts = [b], rad = [e.tronco * (1 - t * .62) * .62];
      for (let s = 1; s <= 6; s++) { dir.y += e.curva; dir.x += (R() - .5) * .16; dir.z += (R() - .5) * .16; dir.normalize(); pts.push(pts[s - 1].clone().addScaledVector(dir, L / 6)); rad.push(lerp(rad[0], .025, s / 6)); }
      S.ramas.push({ pts, rad, flex: [.3, .8], fase: R() });
      for (let j = 0; j < e.ramitas; j++) {
        const s = .35 + .6 * (j + R() * .5) / e.ramitas, bp = puntoEn(pts, s), eje = dirEn(pts, s);
        const d2 = eje.clone().multiplyScalar(.6).addScaledVector(perp(eje, R), .8).normalize(); d2.y += .25; d2.normalize();
        const L2 = L * .45 * (1 - s * .35), p2 = [bp, bp.clone().addScaledVector(d2, L2 * .5).add(V3(0, L2 * .06, 0)), bp.clone().addScaledVector(d2, L2)];
        const fase = R(); S.ramitas.push({ pts: p2, rad: [.025, .015, .006], flex: [.6, 1], fase });
        for (let q = 0; q < porRamita; q++) S.hojas.push({ p: puntoEn(p2, .3 + .7 * (q + R() * .6) / porRamita).add(V3(R() - .5, R() - .5, R() - .5).multiplyScalar(.35)), dir: d2.clone(), flex: .95, fase });
      }
      for (let q = 0; q < porRamita; q++) S.hojas.push({ p: pts[6].clone().add(V3(R() - .5, R() * .5, R() - .5).multiplyScalar(.7)), dir: dir.clone(), flex: .9, fase: R() });
    }
    return S;
  }
  function esqConifera(e, R) {
    const S = { troncos: [], ramas: [], ramitas: [], hojas: [] }, alto = e.alto, tr = [], rr = [];
    for (let k = 0; k <= 10; k++) { const t = k / 10; tr.push(V3(Math.sin(t * 2.1) * .05, t * alto, Math.cos(t * 1.7) * .05 - .05)); rr.push(e.tronco * (1 - t * .9) * (k === 0 ? 1.3 : 1)); }
    S.troncos.push({ pts: tr, rad: rr, flex: [0, .45] });
    let giro = 0;
    for (let y = e.inicio; y < alto - .5; y += e.verticilo * (.85 + R() * .3)) {
      const n = 5 + Math.floor(R() * 2), alt = y / alto; giro += .7;
      for (let k = 0; k < n; k++) {
        const az = giro + k / n * TAU2 + (R() - .5) * .3, L = e.largoMax * Math.pow(1 - alt, .85) * (.85 + R() * .3) + .3;
        const dir = V3(Math.cos(az), -.18 - .2 * (1 - alt), Math.sin(az)).normalize(), b = puntoEn(tr, alt), pts = [b];
        for (let s = 1; s <= 3; s++) { dir.y += .07; dir.normalize(); pts.push(pts[s - 1].clone().addScaledVector(dir, L / 3)); }
        const fase = R(); S.ramas.push({ pts, rad: [.055 * (1 - alt * .6), .035, .02, .008], flex: [.25 + alt * .4, .9], fase });
        const nh = Math.max(3, Math.round(L / .34));
        for (let q = 0; q < nh; q++) S.hojas.push({ p: puntoEn(pts, .25 + .75 * (q + .5) / nh).add(V3(0, .05, 0)), dir: dir.clone(), plano: true, flex: .85, fase });
      }
    }
    for (let q = 0; q < 4; q++) S.hojas.push({ p: V3((R() - .5) * .3, alto - .3 - q * .35, (R() - .5) * .3), dir: V3((R() - .5) * .4, 1, (R() - .5) * .4).normalize(), flex: 1, fase: R() });
    return S;
  }
  function esqPalmera(e, R) {
    const S = { troncos: [], ramas: [], ramitas: [], hojas: [] }, alto = e.alto, tr = [], rr = [], az = R() * TAU2, lean = 1.1 + R() * .6;
    for (let k = 0; k <= 10; k++) { const t = k / 10; tr.push(V3(Math.cos(az) * lean * t * t, t * alto, Math.sin(az) * lean * t * t)); rr.push(e.tronco * (1.2 - t * .32) * (k === 0 ? 1.3 : 1)); }
    S.troncos.push({ pts: tr, rad: rr, flex: [0, .55] });
    const cima = tr[10], arriba = V3(0, 1, 0);
    for (let k = 0; k < e.frondas; k++) {
      // tres capas: las jóvenes suben, las viejas cuelgan
      const capa = k % 3, a = k / e.frondas * TAU2 + R() * .3, fase = R(), L = e.largoFronda * (capa === 0 ? .7 : 1) * (.85 + R() * .3);
      const dir = V3(Math.cos(a), [1.2, .45, .05][capa] + (R() - .5) * .25, Math.sin(a)).normalize(), pts = [cima.clone()];
      for (let s = 1; s <= 5; s++) { dir.y -= e.caida * (1 + capa * .5); dir.normalize(); pts.push(pts[s - 1].clone().addScaledVector(dir, L / 5)); }
      S.ramas.push({ pts, rad: [.07, .05, .036, .024, .014, .006], flex: [.5, .95], fase });
      for (let q = 0; q < e.porFronda; q++) {
        const s = .18 + .8 * (q + .5) / e.porFronda, p = puntoEn(pts, s), eje = dirEn(pts, s);
        const lado = V3().crossVectors(eje, arriba).normalize(), sube = V3().crossVectors(lado, eje).normalize(), tam = 1 - .35 * s;
        for (const sg of [-1, 1]) {
          const w = lado.clone().multiplyScalar(sg * Math.cos(e.pliegue)).addScaledVector(sube, -Math.sin(e.pliegue) * .6).normalize();
          S.hojas.push({ p, dir: eje.clone(), w, n: V3().crossVectors(eje, w).normalize(), flex: .7 + s * .25, fase, tam });
        }
      }
    }
    return S;
  }
  function esqBambu(e, R) {
    const S = { troncos: [], ramas: [], ramitas: [], hojas: [] };
    for (let k = 0; k < e.tallos; k++) {
      const a = R() * TAU2, d = R() * .55, h = e.alto * (.75 + R() * .35), lx = (R() - .5) * .35, lz = (R() - .5) * .35, pts = [], rad = [];
      for (let s = 0; s <= 12; s++) { const t = s / 12; pts.push(V3(Math.cos(a) * d + lx * t * t * h * .15, t * h, Math.sin(a) * d + lz * t * t * h * .15)); rad.push(e.tronco * (1 - t * .45)); }
      S.troncos.push({ pts, rad, flex: [0, 1], nudos: true });
      for (let j = 0; j < 7; j++) {
        const s = .45 + .55 * j / 7, b = puntoEn(pts, s), dir = perp(V3(0, 1, 0), R); dir.y = .45; dir.normalize(); const fase = R();
        S.ramitas.push({ pts: [b, b.clone().addScaledVector(dir, .55)], rad: [.012, .005], flex: [.6, 1], fase });
        for (let q = 0; q < 2; q++) S.hojas.push({ p: b.clone().addScaledVector(dir, .35 + q * .25), dir: dir.clone().add(V3(0, -.3, 0)).normalize(), flex: 1, fase });
      }
    }
    return S;
  }
  function esqArbusto(e, R) {
    const S = { troncos: [], ramas: [], ramitas: [], hojas: [] };
    for (let k = 0; k < 4; k++) { const a = k / 4 * TAU2 + R(), d = V3(Math.cos(a) * .5, 1, Math.sin(a) * .5).normalize(); S.ramas.push({ pts: [V3(0, 0, 0), d.clone().multiplyScalar(.45), d.clone().multiplyScalar(.85)], rad: [.03, .02, .008], flex: [0, .5], fase: R() }); }
    for (let q = 0; q < e.hojas; q++) {
      const a = R() * TAU2, el = R() * 1.3, r = .55 + R() * .4, p = V3(Math.cos(a) * Math.sin(el) * r, .25 + Math.cos(el) * r * .75, Math.sin(a) * Math.sin(el) * r);
      S.hojas.push({ p, dir: p.clone().normalize(), flex: .7, fase: R() });
    }
    return S;
  }
  const ESQ = { copa: esqCopa, conifera: esqConifera, palmera: esqPalmera, bambu: esqBambu, arbusto: esqArbusto };

  /* ---------- mallas de una especie en un nivel de detalle ---------- */
  function construir(e, S, det, R) {
    const D = DET[det], Mc = new Malla(), Mh = new Malla(), tc = e.tCorteza;
    for (const t of S.troncos) {
      if (t.nudos && det < 2) { // bambú: anillos oscuros en los nudos
        const col = [tc[0], tc[1], tc[2], .7]; tubo(Mc, t.pts, t.rad, Math.max(3, D.lt - 3), col, t.flex, 0);
      } else tubo(Mc, t.pts, t.rad, t.nudos ? 3 : D.lt, [tc[0], tc[1], tc[2], .55], t.flex, 0);
    }
    if (D.ramas) for (const r of S.ramas) tubo(Mc, r.pts, r.rad, D.lr, [tc[0], tc[1], tc[2], .75], r.flex, r.fase);
    if (D.lm) for (const r of S.ramitas) tubo(Mc, r.pts, r.rad, D.lm, [tc[0], tc[1], tc[2], .8], r.flex, r.fase);
    // hojas: subconjunto repartido (mismo orden para todos los niveles) y más grandes cuanto menos haya
    const fh = e.fhMin ? e.fhMin[det] : D.fh, H = S.hojas, n = Math.max(6, Math.round(H.length * fh)), paso = H.length / n;
    const centro = V3(); for (const h of H) centro.add(h.p); centro.multiplyScalar(1 / H.length);
    let radio = 0; for (const h of H) radio = Math.max(radio, h.p.distanceTo(centro));
    const celda = Texturas.ATLAS[e.atlas], Rh = rng(det * 31 + 7);
    for (let k = 0; k < n; k++) {
      const h = H[Math.floor(k * paso)], tam = e.tamHoja * (e.fhMin ? Math.sqrt(1 / fh) : D.eh) * (h.tam || 1) * (.85 + Rh() * .3);
      const ex = h.p.clone().sub(centro).normalize();
      const nrm = h.n ? h.n.clone() : h.plano ? V3(0, 1, 0).addScaledVector(ex, .35).add(V3(Rh() - .5, 0, Rh() - .5).multiplyScalar(.4)).normalize()
        : ex.clone().add(V3(Rh() - .5, Rh() - .5, Rh() - .5).multiplyScalar(.9)).normalize();
      const ao = .5 + .5 * clamp(h.p.distanceTo(centro) / (radio || 1), 0, 1) * (.7 + .3 * clamp((h.p.y - centro.y) / (radio || 1) + .5, 0, 1));
      // hoja con w (palmera): la tarjeta sale del nervio hacia ese lado
      const c = h.w ? h.p.clone().addScaledVector(h.w, tam * .45) : h.p.clone().addScaledVector(h.dir, tam * .38);
      tarjeta(Mh, c, nrm, h.dir, tam, celda, [ao, ao, ao], h.flex, h.fase, centro, e.forma === 'conifera' ? .45 : .7);
    }
    return { corteza: Mc.geo(), hojas: Mh.geo(), alto: e.alto, radio };
  }
  /* modelos de una especie: [cerca, medio, lejos] */
  function especie(nombre, semilla) {
    const e = ESPECIES[nombre], S = ESQ[e.forma](e, rng(semilla || 1234));
    return [0, 1, 2].map(d => construir(e, S, d));
  }

  /* ---------- hierba, rocas ---------- */
  function mata(n, alto, semilla) {
    const R = rng(semilla), M = new Malla(), nn = V3();
    for (let b = 0; b < n; b++) {
      const a = R() * TAU2, rr = Math.sqrt(R()) * .24, ox = Math.cos(a) * rr, oz = Math.sin(a) * rr;
      const h = alto * (.45 + R() * .6), w = .018 + R() * .016, yaw = R() * TAU2, inc = .15 + R() * .45, di = R() * TAU2, tono = .85 + R() * .3;
      const fx = Math.cos(yaw), fz = Math.sin(yaw), base = M.p.length / 3; nn.set(-fz * .45, .9, fx * .45).normalize();
      for (let s = 0; s <= 4; s++) {
        const t = s / 4, y = t * h, l = inc * t * t * h, cx = ox + Math.cos(di) * l, cz = oz + Math.sin(di) * l, ww = w * (1 - t * .85), c = (.25 + .75 * Math.pow(t, .8)) * tono;
        if (s < 4) { M.vert(V3(cx - fx * ww, y, cz - fz * ww), nn, 0, t, [c, c, c], [0, 0, 0, 0]); M.vert(V3(cx + fx * ww, y, cz + fz * ww), nn, 1, t, [c, c, c], [0, 0, 0, 0]); }
        else M.vert(V3(cx, y, cz), nn, .5, 1, [c, c, c], [0, 0, 0, 0]);
      }
      for (let s = 0; s < 3; s++) { const i = base + s * 2; M.i.push(i, i + 1, i + 2, i + 1, i + 3, i + 2); }
      M.i.push(base + 6, base + 7, base + 8);
    }
    return M.geo();
  }
  function roca(semilla, det) {
    const g = icoSuave(1, det === undefined ? 3 : det), p = g.attributes.position, s = semilla * 3.17;
    const N = (x, y, z) => (Ruido.n2(x + s, y - s) + Ruido.n2(y + s * .7, z) + Ruido.n2(z - s, x * .9)) / 3;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const d = 1 + .32 * N(x * 1.1, y * 1.1, z * 1.1) + .13 * N(x * 2.7, y * 2.7, z * 2.7) + .05 * N(x * 6.3, y * 6.3, z * 6.3);
      x *= d; y *= d * .72; z *= d;
      if (y < -.25) y = -.25 + (y + .25) * .15;
      p.setXYZ(i, x, y + .2, z);
    }
    g.computeVertexNormals();
    g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(p.count * 2), 2));
    return g;
  }

  /* ---------- materiales ---------- */
  const GLSL_VIENTO = `
uniform float uT; uniform float uViento; attribute vec4 aViento;
vec3 viento(vec3 p, vec3 base){
  float t = uT, ph = dot(base.xz, vec2(.071, .053)), raf = .55 + .45*sin(t*.42 + base.x*.013 + base.z*.011);
  float s1 = sin(t*1.05 + ph)*.65 + sin(t*1.73 + ph*1.7)*.35, s2 = sin(t*2.7 + aViento.y*6.2832 + ph), f = aViento.x;
  p.xz += vec2(.8, .6)*(s1*.11*f*f + s2*.045*f)*raf*uViento;
  p += vec3(sin(t*6.3 + aViento.y*40. + p.y*3.), sin(t*7.1 + aViento.y*37.)*.6, cos(t*5.7 + aViento.y*29.))*.028*aViento.z*raf*uViento;
  return p;
}`;
  const VIENTO = '#include <begin_vertex>\n#ifdef USE_INSTANCING\ntransformed = viento(transformed, vec3(instanceMatrix[3]));\n#else\ntransformed = viento(transformed, vec3(0.));\n#endif';
  // perturbación de la normal sin tangentes (como perturbNormal2Arb de three)
  const GLSL_PERTURBAR = `
vec3 perturbar(vec3 eye, vec3 n, vec3 m, vec2 uv){
  vec3 q0 = dFdx(eye), q1 = dFdy(eye); vec2 s0 = dFdx(uv), s1 = dFdy(uv);
  vec3 q1p = cross(q1, n), q0p = cross(n, q0), T = q1p*s0.x + q0p*s1.x, B = q1p*s0.y + q0p*s1.y;
  float det = max(dot(T, T), dot(B, B)), k = det == 0. ? 0. : inversesqrt(det);
  return normalize(T*(m.x*k) + B*(m.y*k) + n*m.z);
}`;
  function comun(sh) { Atmosfera.inyectar(sh); sh.uniforms.uT = U.uT; sh.uniforms.uViento = U.uViento; }
  const cache = {};
  function matCorteza(capa) {
    if (cache['c' + capa]) return cache['c' + capa];
    // la capa es un uniforme: todas las cortezas comparten programa
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }), uCapa = { value: Texturas.CAPA[capa] };
    m.onBeforeCompile = sh => {
      comun(sh); Texturas.usar(sh); sh.uniforms.uCapa = uCapa;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + GLSL_VIENTO + '\nvarying vec2 vUvC;').replace('#include <begin_vertex>', VIENTO + '\nvUvC = uv;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + Texturas.GLSL + '\nuniform float uCapa; varying vec2 vUvC;\n' + GLSL_PERTURBAR)
        .replace('#include <map_fragment>', 'vec4 cA = sueloA(vUvC, uCapa), cB = sueloB(vUvC, uCapa); diffuseColor.rgb *= cA.rgb;')
        .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = cA.a;')
        .replace('#include <normal_fragment_maps>', 'normal = perturbar(-vViewPosition, normal, normalize(vec3(cB.xy*1.3, 1.)), vUvC);')
        .replace('#include <aomap_fragment>', 'reflectedLight.indirectDiffuse *= cB.w; reflectedLight.indirectSpecular *= cB.w;');
    };
    m.customProgramCacheKey = () => 'corteza';
    return (cache['c' + capa] = m);
  }
  /* hojas: luz por vértice (las normales ya son suaves, esféricas de la copa) para que el
     relleno de muchas tarjetas superpuestas sea barato; sombras, niebla y alfa por píxel.
     Ambas caras reciben la misma luz; la translucidez añade el sol que atraviesa la copa. */
  /* parte de la luz que atraviesa la copa que sobrevive a la sombra de las propias hojas (a contraluz, las hojas que
     se ven están a la sombra de las de delante: sin esto la translucidez se perdía y la copa quedaba casi negra) */
  const TRANSL_SOMBRA = .55;
  function matHojas(nombre) {
    if (cache['h' + nombre]) return cache['h' + nombre];
    const e = ESPECIES[nombre], m = new THREE.MeshLambertMaterial({ map: Texturas.hojas, vertexColors: true, side: THREE.DoubleSide, alphaTest: .5 });
    m.alphaToCoverage = true;
    const uTransl = { value: new THREE.Color(e.transl[0], e.transl[1], e.transl[2]) }, uTranslN = { value: e.transN || 0 }, uNieve = { value: e.nieve ? .6 : 0 };
    m.onBeforeCompile = sh => {
      // translucidez y nieve son uniformes: todas las hojas comparten programa
      comun(sh); sh.uniforms.uTransl = uTransl; sh.uniforms.uTranslN = uTranslN; sh.uniforms.uNieve = uNieve;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + GLSL_VIENTO + '\nuniform vec3 uTransl; uniform float uTranslN; varying float vArriba; varying vec3 vTranslH;')
        .replace('#include <begin_vertex>', VIENTO + '\nvArriba = objectNormal.y;')
        .replace('#include <lights_lambert_vertex>', `#include <lights_lambert_vertex>
vTranslH = vec3(0.);
#if NUM_DIR_LIGHTS > 0
// translucidez (aparte: se suma después de la sombra). transN: pierde parte del tono del sol y toma el de la hoja
vec3 luzT = mix(directLightColor_Diffuse, vec3(dot(directLightColor_Diffuse, vec3(.2126, .7152, .0722))), uTranslN);
vTranslH = luzT*uTransl*(pow(clamp(dot(geometry.viewDir, -directLight.direction), 0., 1.), 3.)*.3 + .05);
#endif
#ifdef DOUBLE_SIDED
vLightBack = vLightFront; vIndirectBack = vIndirectFront;
#endif`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uNieve; varying float vArriba; varying vec3 vTranslH;')
        .replace('reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();', 'float sombraH = getShadowMask();\nreflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * sombraH;\n'
          + 'reflectedLight.directDiffuse += vTranslH*BRDF_Diffuse_Lambert( diffuseColor.rgb )*mix(' + TRANSL_SOMBRA.toFixed(2) + ', 1., sombraH);')
        .replace('#include <alphatest_fragment>', 'diffuseColor.a = clamp((diffuseColor.a - .5)/max(fwidth(diffuseColor.a), 1e-4) + .5, 0., 1.);\nif (diffuseColor.a < .02) discard;'
          + '\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(.82, .86, .93), smoothstep(.55, .95, vArriba)*uNieve);');
    };
    m.customProgramCacheKey = () => 'hojas';
    return (cache['h' + nombre] = m);
  }
  function profHojas() {
    if (cache.ph) return cache.ph;
    const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: Texturas.hojas, alphaTest: .5 });
    m.onBeforeCompile = sh => { comun(sh); sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + GLSL_VIENTO).replace('#include <begin_vertex>', VIENTO); };
    m.customProgramCacheKey = () => 'profHojas';
    return (cache.ph = m);
  }
  function matHierba() {
    if (cache.hierba) return cache.hierba;
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    m.onBeforeCompile = sh => {
      comun(sh); sh.uniforms.uJug = U.uJug;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT; uniform vec3 uJug; uniform float uViento;')
        .replace('#include <project_vertex>', `
vec4 ip = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
ip = instanceMatrix * ip;
#endif
float hb = clamp(position.y/.6, 0., 1.), hb2 = hb*hb;
float raf = .5 + .5*sin(dot(ip.xz, vec2(.09, .06)) - uT*1.6);
vec2 ws = vec2(.8, .6)*(raf*.22 + .06) + vec2(sin(uT*2.1 + ip.x*.8 + ip.z*.5), cos(uT*1.7 + ip.x*.6 - ip.z*.9))*.045;
ip.xz += ws*hb2*uViento;
vec2 dj = ip.xz - uJug.xz; float dl = length(dj), em = max(0., 1.1 - dl)*step(abs(ip.y - uJug.y), 1.5);
ip.xz += dj/(dl + .001)*em*hb*.7; ip.y -= em*hb*.25;
vec4 mvPosition = modelViewMatrix * ip;
gl_Position = projectionMatrix * mvPosition;`)
        .replace('#include <lights_lambert_vertex>', `#include <lights_lambert_vertex>
#if NUM_DIR_LIGHTS > 0
{ vec3 tr = directLightColor_Diffuse*.3*pow(clamp(dot(geometry.viewDir, -directLight.direction), 0., 1.), 3.)*hb;
  vLightFront += tr;
  #ifdef DOUBLE_SIDED
  vLightBack += tr;
  #endif
}
#endif`);
    };
    m.customProgramCacheKey = () => 'hierba2';
    return (cache.hierba = m);
  }
  /* rocas: roca o arenisca triplanar; encima musgo, nieve o arena según el bioma (mapa tBio) */
  function matRoca() {
    if (cache.roca) return cache.roca;
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
    m.onBeforeCompile = sh => {
      comun(sh); Texturas.usar(sh); sh.uniforms.tBio = U.tBio; sh.uniforms.tDet = U.tDet;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform sampler2D tBio; varying vec3 vWPr; varying vec3 vWNr; varying vec4 vBioR;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
vec4 wpR = vec4(transformed, 1.); vec3 nR = objectNormal, ipR = vec3(0.);
#ifdef USE_INSTANCING
wpR = instanceMatrix*wpR; nR = mat3(instanceMatrix)*nR; ipR = vec3(instanceMatrix[3]);
#endif
wpR = modelMatrix*wpR; vWPr = wpR.xyz; vWNr = normalize(mat3(modelMatrix)*nR);
vBioR = texture2D(tBio, (ipR.xz + 500.)/1000.);`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + Texturas.GLSL + '\nuniform sampler2D tDet; varying vec3 vWPr; varying vec3 vWNr; varying vec4 vBioR;')
        .replace('#include <map_fragment>', `
vec3 Nr = normalize(vWNr), tw = triPesos(Nr);
float cr = vBioR.g > .5 ? 7. : 3.; vec2 ux = vWPr.zy/2.4, uy = vWPr.xz/2.4, uz = vWPr.xy/2.4;
vec4 A, bx, by, bz; triplanar(ux, uy, uz, tw, cr, A, bx, by, bz);
vec3 nx = vec3(bx.xy + Nr.zy, Nr.x), ny = vec3(by.xy + Nr.xz, Nr.y), nz = vec3(bz.xy + Nr.xy, Nr.z);
vec3 nRoca = normalize(nx.zyx*tw.x + ny.xzy*tw.y + nz*tw.z); float aoR = bx.w*tw.x + by.w*tw.y + bz.w*tw.z;
float cc = vBioR.r > .45 ? 4. : (vBioR.g > .5 ? 5. : 1.), cant = vBioR.r > .45 ? 1. : (vBioR.g > .5 ? .7 : .55 + .35*vBioR.a);
float cub = smoothstep(.5, .8, nRoca.y + (texture2D(tDet, vWPr.xz*.3).g - .5)*.5)*cant;
vec4 Ac = sueloA(uy*1.1, cc);
vec3 albR = mix(A.rgb, Ac.rgb, cub); float rugR = mix(A.a, Ac.a, cub);
diffuseColor.rgb *= albR;`)
        .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = rugR;')
        .replace('#include <normal_fragment_maps>', 'normal = normalize((viewMatrix*vec4(normalize(mix(nRoca, Nr, cub*.6)), 0.)).xyz);')
        .replace('#include <aomap_fragment>', 'reflectedLight.indirectDiffuse *= aoR; reflectedLight.indirectSpecular *= aoR;');
    };
    m.customProgramCacheKey = () => 'roca2';
    return (cache.roca = m);
  }

  return { ESPECIES, especie, mata, roca, matCorteza, matHojas, profHojas, matHierba, matRoca };
})();
