/* === Ecos de Luz · 03-flora.js ===
   Vegetación determinista por chunk e instancias con tres niveles de detalle (los modelos
   salen de Plantas), hierba densa en dos anillos que se aparta al pasar, flores y
   partículas ambientales por bioma. */
"use strict";

/* niveles de detalle de árboles y rocas que dan sombra: solo el cercano (el segundo empieza más allá del área con
   sombra; dibujarlo en la sombra costaba hasta 50 ms de GPU cada vez que se rehace la sombra guardada) */
const SOMBRA_NIVELES = 1;
const ZONAS_LIBRES = []; // {x,z,r,rHierba}: sin vegetación (estructuras); la hierba llega hasta rHierba (si no, hasta r)
const Flora = (() => {
  const inst = {};
  let matVeg, matCristal, hierba, hierbaLejos, flores, part;
  let ux = 1e9, uz = 1e9, hx = 1e9, hz = 1e9;

  /* --- modelos sencillos que se conservan (cactus, juncos, nenúfares, cristales, flores) --- */
  function geoCactus() {
    const c = 0x4c7a45, P = [pieza(new THREE.CylinderGeometry(.34, .38, 3.4, 12, 3), c, { y: 1.7, var: .1, ao: .3 }), pieza(new THREE.SphereGeometry(.34, 12, 5, 0, TAU, 0, Math.PI / 2), c, { y: 3.4 })];
    [[1, 1.5, 1.1], [-1, 1.9, .8]].forEach(([s, y, h]) => {
      P.push(pieza(new THREE.CylinderGeometry(.2, .2, .8, 9), c, { x: s * .45, y, rz: Math.PI / 2 }));
      P.push(pieza(new THREE.CylinderGeometry(.2, .22, h, 9), c, { x: s * .82, y: y + h / 2, var: .1 }));
      P.push(pieza(new THREE.SphereGeometry(.2, 9, 4, 0, TAU, 0, Math.PI / 2), c, { x: s * .82, y: y + h }));
    });
    return fusionar(P);
  }
  function geoJunco() {
    const P = [], r = rng(31);
    for (let k = 0; k < 9; k++) {
      const a = r() * TAU, d = r() * .4, h = 1.2 + r() * .8;
      P.push(pieza(new THREE.CylinderGeometry(.012, .03, h, 4), 0x6f8f3e, { x: Math.cos(a) * d, y: h / 2, z: Math.sin(a) * d, rz: (r() - .5) * .3, rx: (r() - .5) * .3 }));
      if (k % 3 === 0) P.push(pieza(new THREE.CylinderGeometry(.045, .045, .28, 5), 0x5a3b22, { x: Math.cos(a) * d, y: h - .1, z: Math.sin(a) * d }));
    }
    return fusionar(P);
  }
  function geoNenufar() {
    const g = new THREE.CircleGeometry(.62, 12, .3, TAU - .5); g.rotateX(-Math.PI / 2);
    const P = [pieza(g, 0x3f7a3a, { y: .04, var: .15 })];
    for (let k = 0; k < 6; k++) P.push(pieza(new THREE.ConeGeometry(.08, .26, 4), 0xf7c9dc, { x: .18 + Math.cos(k) * .06, y: .14, z: .1 + Math.sin(k) * .06, rx: Math.cos(k) * .6, rz: Math.sin(k) * .6 }));
    return fusionar(P);
  }
  function geoCristal() {
    const P = [], r = rng(4);
    for (let k = 0; k < 5; k++) {
      const h = .8 + r() * 1.6, a = r() * TAU;
      const g = new THREE.CylinderGeometry(0, .2 + r() * .12, h, 6); g.translate(0, h / 2, 0);
      P.push(pieza(g, 0xbfefff, { x: Math.cos(a) * .3, z: Math.sin(a) * .3, rx: (r() - .5) * .8, rz: (r() - .5) * .8 }));
    }
    return fusionar(P);
  }
  function geoFlor() {
    const P = [pieza(new THREE.CylinderGeometry(.01, .015, .34, 3), 0x3f6e2a, { y: .17 })];
    for (let k = 0; k < 5; k++) { const g = new THREE.CircleGeometry(.06, 5); g.rotateX(-Math.PI / 2 + .35); g.translate(0, 0, .055); P.push(pieza(g, 0xffffff, { y: .35, ry: k * TAU / 5 })); }
    P.push(pieza(new THREE.SphereGeometry(.03, 5, 3), 0xffe27a, { y: .37 }));
    const g = fusionar(P), n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0); return g;
  }
  function viento(m) {
    m.onBeforeCompile = sh => {
      Atmosfera.inyectar(sh);
      sh.uniforms.uT = U.uT; sh.uniforms.uViento = U.uViento;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT; uniform float uViento;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
#ifdef USE_INSTANCING
 vec3 ipos = vec3(instanceMatrix[3]);
 float sw = sin(uT*1.25 + ipos.x*.13 + ipos.z*.17)*.6 + sin(uT*2.3 + ipos.x*.31 - ipos.z*.2)*.25;
 float hf = max(transformed.y - 1.1, 0.);
 transformed.x += sw*.032*hf*uViento; transformed.z += sw*.022*hf*uViento;
#endif`);
    };
  }

  /* --- tipos de vegetación: modelo, distancias de detalle (m, se multiplican por CAL.rcMul),
         capacidad por nivel (0 = sin ese nivel), radio de colisión y alto (rocas, cactus y cristales; los árboles
         toman el de su especie) por unidad de escala --- */
  const TIPOS = {
    cerezo: { especie: 'cerezo', dist: [42, 125], cap: [500, 1800, 4200], col: .45 },
    arce: { especie: 'arce', dist: [42, 125], cap: [500, 1800, 4200], col: .5 },
    pino: { especie: 'pino', dist: [46, 130], cap: [500, 2000, 5200], col: .4 },
    palmera: { especie: 'palmera', dist: [40, 120], cap: [200, 600, 900], col: .35 },
    bambu: { especie: 'bambu', dist: [36, 110], cap: [300, 1000, 2400], col: .9 },
    arbusto: { especie: 'arbusto', dist: [30, 95], cap: [900, 2600, 0], col: 0 },
    roca: { roca: 3, dist: [60, 150], cap: [1200, 2600, 0], col: .85, alto: 1.2 },
    rocaN: { roca: 8, dist: [60, 150], cap: [800, 1600, 0], col: .85, alto: 1.2 },
    pena: { roca: 11, dist: [80, 210], cap: [300, 700, 1600], col: .9, alto: 1.2 },
    cactus: { geo: geoCactus, dist: [170], cap: [600], col: .4, alto: 3.6 },
    junco: { geo: geoJunco, dist: [100], cap: [1800], col: 0 },
    nenufar: { geo: geoNenufar, dist: [110], cap: [1600], col: 0 },
    cristal: { geo: geoCristal, cristal: true, dist: [160], cap: [400], col: .5, alto: 1.6 }
  };
  /* una malla instanciada vacía sigue costando una llamada de dibujo (y otra por sombra): se oculta mientras no tenga nada */
  function malla(geo, mat, cap, sombra, prof) {
    const m = new THREE.InstancedMesh(geo, mat, cap); m.setColorAt(0, new THREE.Color(1, 1, 1));
    m.count = 0; m.visible = false; m.frustumCulled = false; m.castShadow = !!sombra; m.receiveShadow = true; if (sombra) m.layers.set(CAPAS.estatica);
    if (prof) m.customDepthMaterial = prof;
    scene.add(m); return m;
  }
  function crearTipo(nombre, cfg) {
    const niveles = [], d = cfg.dist.map(v => v * (CAL.rcMul || 1));
    const umbral = i => i < d.length ? d[i] : CAL.vista;
    if (cfg.especie) {
      const mods = Plantas.especie(cfg.especie, nombre.length * 977 + 13), e = Plantas.ESPECIES[cfg.especie];
      const mc = Plantas.matCorteza(e.corteza), mh = Plantas.matHojas(cfg.especie), ph = Plantas.profHojas();
      mods.forEach((mo, i) => { if (cfg.cap[i]) niveles.push({ d2: umbral(i) ** 2, cap: cfg.cap[i], k: 0, mallas: [malla(mo.corteza, mc, cfg.cap[i], i < SOMBRA_NIVELES), malla(mo.hojas, mh, cfg.cap[i], i < SOMBRA_NIVELES, ph)] }); });
    } else if (cfg.roca) {
      const mr = Plantas.matRoca();
      [3, 1, 0].forEach((det, i) => { if (cfg.cap[i]) niveles.push({ d2: umbral(i) ** 2, cap: cfg.cap[i], k: 0, mallas: [malla(Plantas.roca(cfg.roca, det), mr, cfg.cap[i], i < SOMBRA_NIVELES)] }); });
    } else niveles.push({ d2: umbral(0) ** 2, cap: cfg.cap[0], k: 0, mallas: [malla(cfg.geo(), cfg.cristal ? matCristal : matVeg, cfg.cap[0], !cfg.cristal)] });
    // alto del colisionador (m con escala 1): los árboles, el de su especie; al planear por encima no se choca
    inst[nombre] = { niveles, col: cfg.col, alto: cfg.especie ? Plantas.ESPECIES[cfg.especie].alto : cfg.alto || 0 };
  }

  function init() {
    matVeg = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .82, side: THREE.DoubleSide }); viento(matVeg);
    matCristal = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .15, metalness: .1, emissive: 0x3fb8ff, emissiveIntensity: .7, transparent: true, opacity: .88 });
    for (const t in TIPOS) crearTipo(t, TIPOS[t]);
    const mH = Plantas.matHierba();
    hierba = malla(Plantas.mata(11, .55, 5), mH, 9000, false);
    hierbaLejos = malla(Plantas.mata(7, .62, 9), mH, 9000, false);
    flores = malla(geoFlor(), mH, 2500, false);
    crearParticulas();
  }

  /* --- reparto determinista por chunk ---
     registro de 10 valores: x, y, z, giro, escala, inclinación x, inclinación z, r, g, b */
  const REG = 10;
  const TINTE = {
    arbP: [[.95, 1, .9], [1.05, 1, .85], [.88, .98, .92]], arbL: [[.8, 1.05, .9], [.9, 1.08, .8]],
    arbustoP: [1, 1, 1], arbustoS: [1.04, .96, 1], arbustoN: [.85, .9, .95], arbustoD: [1.2, 1, .62], arbustoL: [.9, 1.05, .9],
    rocaP: [1, 1, 1], rocaS: [1, .97, .97], rocaD: [1.12, .96, .82], rocaL: [.9, .95, .92]
  };
  /* ¿se puede plantar aquí? Los árboles, rocas y arbustos se apartan de todo el lugar (r2); la hierba solo de su
     núcleo (r1) y de rHierba, para que alrededor de las construcciones no quede el suelo pelado */
  function libre(x, z, hierba) {
    for (const s of SITIOS) if (Math.hypot(x - s.x, z - s.z) < (hierba ? s.r1 : s.r2 + 2)) return false;
    for (const q of ZONAS_LIBRES) if (Math.hypot(x - q.x, z - q.z) < (hierba && q.rHierba !== undefined ? q.rHierba : q.r)) return false;
    for (const c of CUEVAS) if (c.pts && Math.hypot(x - c.bx, z - c.bz) < 18) return false;
    return true;
  }
  function generarChunk(ch) {
    const R = rng(ch.i * 7919 + ch.j * 104729 + 99), V = {}, col = [];
    const segs = _segChunk.get(ch.k);
    const add = (t, x, y, z, rot, e, c, ix, iz) => {
      (V[t] = V[t] || []).push(x, y, z, rot, e, ix || 0, iz || 0, c[0], c[1], c[2]);
      if (inst[t] && inst[t].col) col.push({ x, z, r: inst[t].col * e, y0: y, y1: y + inst[t].alto * e });
    };
    // las rocas se asientan en la ladera: se hunden según la pendiente y se inclinan con ella
    const roca = (t, x, h, z, rot, e, c) => {
      const gx = altura(x + 1, z) - h, gz = altura(x, z + 1) - h, s = Math.hypot(gx, gz);
      add(t, x, h - (.12 + Math.min(s, 1.6) * .55) * e, z, rot, e, c, Math.atan(gz) * .6, -Math.atan(gx) * .6);
    };
    const x0 = ch.i * CHUNK, z0 = ch.j * CHUNK, uno = [1, 1, 1];
    for (let k = 0; k < 190; k++) {
      const x = x0 + R() * CHUNK, z = z0 + R() * CHUNK, rr = R(), rot = R() * TAU, ev = .75 + R() * .55;
      if (Math.hypot(x, z) > RADIO_ISLA + 30 && !islaEn(x, z, .1)) continue;
      if (!libre(x, z)) continue;
      const h = altura(x, z);
      const s = Math.hypot(altura(x + 1, z) - h, altura(x, z + 1) - h);
      const w = pesos(x, z); let u = R(), b = 0; for (b = 0; b < 4; b++) { u -= w[b]; if (u <= 0) break; }
      const bosque = .5 + .5 * Ruido.n2(x * .012 + b * 7, z * .012);
      if (pesoCamino(x, z, segs) > .25) continue;
      const dOasis = Math.hypot(x - OASIS.x, z - OASIS.z);
      if (h < -.15) {
        if ((b === 4 || dOasis < OASIS.orilla) && h > -2.6 && rr < .4) add('nenufar', x, 0, z, rot, .8 + R() * .7, [.9 + R() * .2, 1, .9]);
        continue;
      }
      if (h < 1.1) {
        if ((b === 4 || b === 1) && rr < .5) add('junco', x, h - .05, z, rot, ev, uno);
        else if ((b === 3 || dOasis < OASIS.r) && rr < .35) add('palmera', x, h - .1, z, rot, ev, uno);
        else if (dOasis < OASIS.r && rr < .8) add('junco', x, h - .05, z, rot, ev, uno);
        continue;
      }
      if (s > .95) { if (rr < .35 && s < 1.6) roca(b === 2 ? 'rocaN' : 'roca', x, h, z, rot, ev * 1.4, TINTE['roca' + 'PSNDL'[b]] || uno); continue; }
      if (b === 0) {
        if (rr < .13 * bosque) add('arce', x, h - .1, z, rot, ev, pick(TINTE.arbP));
        else if (rr < .26) add('arbusto', x, h - .05, z, rot, ev, TINTE.arbustoP);
        else if (rr < .31) roca('roca', x, h, z, rot, ev * .8, TINTE.rocaP);
        else if (rr < .318) roca('pena', x, h, z, rot, ev * 2.8, uno);
      } else if (b === 1) {
        const grove = Ruido.n2(x * .02 + 4, z * .02) > .32;
        if (grove && rr < .45) add('bambu', x, h - .1, z, rot, ev, uno);
        else if (rr < .3 * bosque) add('cerezo', x, h - .1, z, rot, ev, [1, .96 + R() * .08, .97 + R() * .06]);
        else if (rr < .42) add('arbusto', x, h - .05, z, rot, ev, TINTE.arbustoS);
        else if (rr < .46) roca('roca', x, h, z, rot, ev * .8, TINTE.rocaS);
      } else if (b === 2) {
        if (h < 92 && rr < .3 * bosque) add('pino', x, h - .1, z, rot, ev * 1.1, [.95 + R() * .1, 1, 1]);
        else if (rr < .4) roca('rocaN', x, h, z, rot, ev, uno);
        else if (rr < .43) add('cristal', x, h - .1, z, rot, ev, uno);
        else if (rr < .47) add('arbusto', x, h - .05, z, rot, ev * .7, TINTE.arbustoN);
      } else if (b === 3) {
        if (dOasis < OASIS.r && rr < .5) add('palmera', x, h - .1, z, rot, ev, uno);
        else if (rr < .055) add('cactus', x, h - .1, z, rot, ev, uno);
        else if (rr < .09) roca('pena', x, h, z, rot, ev * 3.2, TINTE.rocaD);
        else if (rr < .16) add('arbusto', x, h - .05, z, rot, ev * .6, TINTE.arbustoD);
        else if (rr < .19) roca('roca', x, h, z, rot, ev, TINTE.rocaD);
      } else {
        if (rr < .14 * bosque) add('arce', x, h - .1, z, rot, ev * 1.1, pick(TINTE.arbL));
        else if (rr < .3) add('arbusto', x, h - .05, z, rot, ev, TINTE.arbustoL);
        else if (rr < .35) roca('roca', x, h, z, rot, ev * .9, TINTE.rocaL);
      }
    }
    ch.veg = V; ch.col = col;
  }
  /* hierba: rejilla fina (0,62 m) por chunk cercano; colores lineales como el suelo */
  const PASO_H = .68, CERCA_H = 11;
  /* la hierba de un trozo se genera por filas (HIERBA.filas por paso), HIERBA.ms por fotograma: de golpe costaba hasta 60 ms */
  const HIERBA = { ms: 3, cine: 6, filas: 6 };
  let hierbaEnCurso = null;
  function* generarHierba(ch) {
    const R = rng(ch.i * 31 + ch.j * 17 + 5), G = [], F = [], n = Math.floor(CHUNK / PASO_H), M = ch.M, Nn = ch.n + 1;
    const flr = [[1, .95, .9], [1, .85, .3], [.95, .5, .7], [.55, .6, 1], [.9, .22, .2]];
    for (let j = 0; j < n; j++) { if (j % HIERBA.filas === HIERBA.filas - 1) yield; for (let i = 0; i < n; i++) {
      const x = ch.i * CHUNK + (i + R()) * PASO_H, z = ch.j * CHUNK + (j + R()) * PASO_H;
      const vi = Math.round((x - ch.i * CHUNK) / ch.paso), vj = Math.round((z - ch.j * CHUNK) / ch.paso), vk = (vj * Nn + vi) * 4;
      const bS = ch.bioV[vk], bN = ch.bioV[vk + 1], bD = ch.bioV[vk + 2], bL = ch.bioV[vk + 3], bP = Math.max(0, 1 - bS - bN - bD - bL);
      const dens = bP + bS * .9 + bL * .85 + bD * .08;
      if (R() > dens || bN > .45) continue;
      if (ch.camV[vj * Nn + vi] > .3) continue;
      const y = alturaChunk(ch, x, z);
      if (y < .35) continue;
      const fx = (x - ch.i * CHUNK) / ch.paso + 1, fz = (z - ch.j * CHUNK) / ch.paso + 1, ii = Math.floor(fx), jj = Math.floor(fz);
      const sl = Math.hypot(ch.H[jj * M + ii + 1] - ch.H[jj * M + ii], ch.H[(jj + 1) * M + ii] - ch.H[jj * M + ii]) / ch.paso;
      if (sl > .6) continue;
      if (!libre(x, z, true)) continue;
      const g = .85 + R() * .3;
      const tr = (.2 * bP + .24 * bS + .5 * bD + .17 * bL) * 1.6, tg = (.36 * bP + .38 * bS + .42 * bD + .34 * bL) * 1.6, tb = (.09 * bP + .14 * bS + .2 * bD + .1 * bL) * 1.6;
      const seco = smooth(.2, .7, Ruido.n2(x * .05, z * .05)) * .35;   // matas secas
      G.push(x, y - .03, z, R() * TAU, (.75 + R() * .6) * (bD > .5 ? .7 : 1), (lerp(tr, .62, seco) * g) ** 2.2, (lerp(tg, .55, seco) * g) ** 2.2, (lerp(tb, .22, seco) * g) ** 2.2);
      if ((bP + bS) > .6 && R() < .025) {
        const c = bS > bP && R() < .5 ? flr[4] : pick(flr);
        F.push(x + .3, y - .03, z + .2, R() * TAU, .8 + R() * .5, c[0] ** 2.2, c[1] ** 2.2, c[2] ** 2.2);
      }
    } }
    ch.hierba = new Float32Array(G); ch.flores = new Float32Array(F);
  }
  /* avanza la hierba pendiente de los trozos cercanos; al acabar uno, la hierba visible se rehace */
  function avanzarHierba(ms) {
    if (!(CAL.hierba > 0)) return;
    const t0 = performance.now();
    while (performance.now() - t0 < ms) {
      if (!hierbaEnCurso) { let ch = null; for (const c of CH.values()) if (c.lod === 0 && !c.hierba && c.bioV && c.d <= CAL.hierba + 4) { ch = c; break; } if (!ch) return; hierbaEnCurso = { ch, it: generarHierba(ch) }; }
      if (hierbaEnCurso.it.next().done) { hierbaEnCurso = null; hx = Infinity; }
    }
  }

  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _qq = new THREE.Quaternion(), _s = new THREE.Vector3(), _col = new THREE.Color(), _eu = new THREE.Euler(0, 0, 0, 'YXZ');
  /* rehacer las instancias cuando Hikari se aleja o cambian los trozos: se hace por tipos, REFRESCO.ms por fotograma
     (todo de golpe costaba 25–30 ms); cada tipo se rehace entero, así que nunca se ve medio cambiado. Al acabar se avisa
     (la sombra guardada de lo estático se rehace) */
  const REFRESCO = { ms: 3, cine: 9 };   // ms por fotograma; en las cinemáticas, más (la cámara va rápida)
  let refresco = null;
  function refrescar(px, pz) { ux = px; uz = pz; refresco = { px, pz, tipos: Object.keys(inst) }; }
  function avanzarRefresco(ms) {
    const t0 = performance.now();
    while (refresco && refresco.tipos.length && performance.now() - t0 < ms) refrescarTipo(refresco.tipos.shift(), refresco.px, refresco.pz);
    if (refresco && !refresco.tipos.length) { refresco = null; Bus.emit('sombraEstatica'); }
  }
  function refrescarTipo(t, px, pz) {
    const I = inst[t], niv = I.niveles, V2 = CAL.vista * CAL.vista; for (const N of niv) N.k = 0;
    for (const ch of CH.values()) {
      if (!ch.veg || ch.lod < 0 || !ch.veg[t]) continue;
      const a = ch.veg[t];
      for (let k = 0; k < a.length; k += REG) {
        const dx = a[k] - px, dz = a[k + 2] - pz, d2 = dx * dx + dz * dz;
        if (d2 > V2) continue;
        let L = 0; while (L < niv.length && d2 > niv[L].d2) L++;
        if (L >= niv.length) continue;
        const N = niv[L]; if (N.k >= N.cap) continue;
        _p.set(a[k], a[k + 1], a[k + 2]); _eu.set(a[k + 5], a[k + 3], a[k + 6]); _qq.setFromEuler(_eu); _s.setScalar(a[k + 4]);
        _m.compose(_p, _qq, _s); _col.setRGB(a[k + 7], a[k + 8], a[k + 9]);
        for (const m of N.mallas) { m.setMatrixAt(N.k, _m); m.setColorAt(N.k, _col); }
        N.k++;
      }
    }
    for (const N of niv) for (const m of N.mallas) {
      m.count = N.k; m.visible = N.k > 0; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }
  /* hierba en dos anillos: matas densas cerca y la mitad, más anchas, hasta CAL.hierba */
  function refrescarHierba(px, pz) {
    hx = px; hz = pz;
    const R = CAL.hierba; let n = 0, nl = 0, nf = 0, alt = 0;
    if (R > 0) for (const ch of CH.values()) {
      if (ch.lod !== 0 || ch.d > R + 4) continue;
      if (!ch.hierba) continue;   // se está generando (avanzarHierba)
      const H = ch.hierba;
      for (let k = 0; k < H.length; k += 8) {
        const dx = H[k] - px, dz = H[k + 2] - pz, d = Math.sqrt(dx * dx + dz * dz);
        if (d > R) continue;
        let m, i;
        if (d < CERCA_H) { if (n >= 9000) continue; m = hierba; i = n++; }
        else { if ((alt++ & 1) || nl >= 9000) continue; m = hierbaLejos; i = nl++; }
        _p.set(H[k], H[k + 1], H[k + 2]); _qq.setFromAxisAngle(UP, H[k + 3]); _s.setScalar(H[k + 4] * smooth(R, R - 9, d) * (d < CERCA_H ? 1 : 1.25));
        m.setMatrixAt(i, _m.compose(_p, _qq, _s)); m.setColorAt(i, _col.setRGB(H[k + 5], H[k + 6], H[k + 7]));
      }
      const Fl = ch.flores;
      for (let k = 0; k < Fl.length; k += 8) {
        const dx = Fl[k] - px, dz = Fl[k + 2] - pz, d = Math.sqrt(dx * dx + dz * dz);
        if (d > R || nf >= 2500) continue;
        _p.set(Fl[k], Fl[k + 1], Fl[k + 2]); _qq.setFromAxisAngle(UP, Fl[k + 3]); _s.setScalar(Fl[k + 4] * smooth(R, R - 9, d));
        flores.setMatrixAt(nf, _m.compose(_p, _qq, _s)); flores.setColorAt(nf, _col.setRGB(Fl[k + 5], Fl[k + 6], Fl[k + 7])); nf++;
      }
    }
    for (const [m, c] of [[hierba, n], [hierbaLejos, nl], [flores, nf]]) { m.count = c; m.visible = c > 0; m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
  }
  function colisionadores(x, z, r, out) {
    out.length = 0;
    const ci = Math.floor(x / CHUNK), cj = Math.floor(z / CHUNK);
    for (let i = ci - 1; i <= ci + 1; i++) for (let j = cj - 1; j <= cj + 1; j++) {
      const ch = CH.get(i * 100 + j); if (!ch || !ch.col) continue;
      for (const c of ch.col) if (Math.abs(c.x - x) < r + c.r && Math.abs(c.z - z) < r + c.r) out.push(c);
    }
    return out;
  }

  /* --- partículas ambientales --- */
  const NP = 420; let pPos, pVel, pTipo = -1;
  const ESTILOS = [
    { col: [1, .9, .55], tam: .09, forma: 0, brillo: .6, cae: -.05, deriva: .3 },
    { col: [1, .72, .82], tam: .16, forma: 1, brillo: 0, cae: -.55, deriva: .9 },
    { col: [.95, .97, 1], tam: .11, forma: 0, brillo: 0, cae: -1.3, deriva: .35 },
    { col: [.95, .82, .6], tam: .07, forma: 0, brillo: 0, cae: .02, deriva: 2.2 },
    { col: [.85, 1, .5], tam: .12, forma: 0, brillo: 1, cae: 0, deriva: .4 },
    { col: [.6, .9, 1], tam: .1, forma: 0, brillo: 1, cae: .05, deriva: .2 }
  ];
  function crearParticulas() {
    const g = new THREE.BufferGeometry(); pPos = new Float32Array(NP * 3); pVel = new Float32Array(NP * 4);
    const f = new Float32Array(NP); for (let i = 0; i < NP; i++) { f[i] = Math.random(); pPos[i * 3 + 1] = -999; }
    g.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); g.setAttribute('aF', new THREE.BufferAttribute(f, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uT: U.uT, uTam: { value: .1 }, uCol: { value: new THREE.Color() }, uForma: { value: 0 }, uBrillo: { value: 0 } },
      vertexShader: 'attribute float aF; uniform float uTam; varying float vF; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*mv; gl_PointSize = uTam*(.6+.8*fract(aF*7.3))*420./-mv.z; vF = aF; }',
      fragmentShader: `uniform vec3 uCol; uniform float uForma; uniform float uT; uniform float uBrillo; varying float vF;
void main(){ vec2 c = gl_PointCoord-.5; float an = vF*6.28 + uT*(.4+vF);
 vec2 r = vec2(c.x*cos(an)-c.y*sin(an), c.x*sin(an)+c.y*cos(an));
 float d = length(r*vec2(1., 1.+uForma*1.7)); float a = smoothstep(.5,.15,d);
 float tw = mix(1., .35+.65*pow(.5+.5*sin(uT*2.6+vF*40.),2.), uBrillo);
 if(a*tw < .02) discard;
 gl_FragColor = vec4(uCol*(1.+uBrillo*2.5), a*tw*.9);
 #include <encodings_fragment>
}`
    });
    part = new THREE.Points(g, m); part.frustumCulled = false; scene.add(part);
  }
  function actualizarParticulas(dt, tipo, cx, cy, cz) {
    const E = ESTILOS[tipo], u = part.material.uniforms;
    if (tipo !== pTipo) { pTipo = tipo; for (let i = 0; i < NP; i++) pPos[i * 3 + 1] = -999; u.uForma.value = E.forma; }
    u.uTam.value = damp(u.uTam.value, E.tam, 2, dt); u.uBrillo.value = damp(u.uBrillo.value, E.brillo, 2, dt);
    u.uCol.value.lerp(linArr(E.col), 1 - Math.exp(-2 * dt));
    const t = U.uT.value, A = 30;
    for (let i = 0; i < NP; i++) {
      let x = pPos[i * 3], y = pPos[i * 3 + 1], z = pPos[i * 3 + 2];
      if (y < cy - 14 || y > cy + 22 || Math.abs(x - cx) > A || Math.abs(z - cz) > A) {
        x = cx + (Math.random() * 2 - 1) * A; z = cz + (Math.random() * 2 - 1) * A;
        y = E.cae < -.2 ? cy + 4 + Math.random() * 16 : cy - 3 + Math.random() * 9;
        pVel[i * 4] = Math.random() * TAU; pVel[i * 4 + 1] = .5 + Math.random();
      }
      const ph = pVel[i * 4], sp = pVel[i * 4 + 1];
      x += (Math.sin(t * .7 * sp + ph) * E.deriva + (tipo === 3 ? 1.6 : .2)) * dt;
      z += Math.cos(t * .6 * sp + ph * 1.3) * E.deriva * dt;
      y += (E.cae * sp + (E.brillo ? Math.sin(t * sp + ph) * .4 : 0)) * dt;
      pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
    }
    part.geometry.attributes.position.needsUpdate = true;
  }

  function actualizar(dt, px, pz, cine) {
    if (chunksCambiaron || Math.hypot(px - ux, pz - uz) > 14) { chunksCambiaron = false; refrescar(px, pz); }
    avanzarRefresco(cine ? REFRESCO.cine : REFRESCO.ms); avanzarHierba(cine ? HIERBA.cine : HIERBA.ms);
    if (Math.hypot(px - hx, pz - hz) > 3.5) refrescarHierba(px, pz);
  }
  function forzar(px, pz) { refrescar(px, pz); avanzarRefresco(Infinity); avanzarHierba(Infinity); refrescarHierba(px, pz); }
  return { init, generarChunk, actualizar, forzar, colisionadores, actualizarParticulas, inst, geoCristal, get matCristal() { return matCristal; } };
})();
