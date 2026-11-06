/* === Ecos de Luz · 32-cuevas.js ===
   Interiores de las cuevas (separados de 04-estructuras.js): túnel y cámara de roca con el material de obra,
   estalactitas y estalagmitas, cristales que brillan, luciérnagas, los cristales de memoria de la Cueva de Cristal con
   su altar, y una sola luz que va a la cueva en la que está Hikari. El trazado y el excavado del terreno están en
   02-terreno.js (CUEVAS); lo que se registra para el juego (cuevaInfo, cristalesMem, altar de Escarcha, tickers) va
   en Estr. Estr.init llama a Cuevas.crear(grupo, Estr) y Estr.actualizar a Cuevas.actualizar. */
"use strict";

const CUEVA_TONO = .55;   // oscurece la roca de las cuevas (la textura de roca ya aporta el detalle)
/* luz de las cuevas: color de cada una, intensidad dentro, alcance (m) y caída. Es una sola luz que va a la cueva
   en la que está Hikari: cada luz de la escena cuesta en todos los píxeles, aunque esté apagada */
const LUZ_CUEVA = { colores: [0x7fd8ff, 0xb8ff8a], intensidad: 2.4, alcance: 38, caida: 1.6 };

/* pórtico de las bocas: holgura del arco sobre el radio del túnel, grosor de la roca, dónde va (m desde la boca, hacia
   dentro) el arco y el saliente, y medidas del saliente (alto y fondo en semiejes; alzado: hueco sobre el techo del túnel) */
const PORTICO = { holgura: .5, grosor: 1.3, arcoS: -.3, salienteS: 1.8, alto: 2.4, fondo: 4.8, alzado: .4, ancho: 1.2, color: 0x8a8780 };   // color: roca del exterior (como la del terreno)

/* decoración de las cuevas, fuera del paso: en la cámara nada a menos de libreCentro m del centro (el altar y el anillo
   del reto quedan despejados) y hasta borde·Rc, en racimos (cuántos y su anchura en rad) que dejan libres la boca del
   túnel y el cofre (hueco, rad); en el túnel, a un lado, entre libreTunel y ladoTunel (fracción de R desde el eje),
   apoyada en el suelo; sobre el paso, las estalactitas no bajan de techoLibre m. Sólidos finos para todas las
   estalagmitas y los cristales de la cámara; en el túnel se conserva la reserva anterior hasta D06 */
const CUEVA_DECO = { libreCentro: 9.5, borde: .92, racimos: 5, anchoRacimo: .35, hueco: .5, libreTunel: .55, ladoTunel: .88, techoLibre: 3.2, solidoTunelEsc: 1.2, solidoTunelR: .5 };

const Cuevas = (() => {
  let G = null, E = null;
  /* ángulos de los racimos de la cámara: repartidos alrededor, lejos de la boca del túnel y del cofre */
  function racimosCamara(c, r) {
    const D = CUEVA_DECO, e = c.pts[c.pts.length - 1], libres = [Math.atan2(e.z - c.cz, e.x - c.cx)];
    if (c.cofre) libres.push(Math.atan2(c.cofre[1], c.cofre[0]));
    const a0 = r() * TAU, cand = [];
    for (let k = 0; k < 12; k++) { const a = a0 + k / 12 * TAU; if (libres.every(b => Math.abs(angDif(a, b)) > D.hueco + D.anchoRacimo)) cand.push(a); }
    const paso = cand.length / D.racimos; return Array.from({ length: Math.min(D.racimos, cand.length) }, (_, i) => cand[Math.floor(i * paso)]);
  }
  function construirCueva(c) {
    const P = c.pts, N = P.length, seg = 14, pos = [], col = [], idx = [], base = lin(c.tono).multiplyScalar(CUEVA_TONO);
    const tangente = i => { const a = P[Math.max(i - 1, 0)], b = P[Math.min(i + 1, N - 1)], l = Math.hypot(b.x - a.x, b.z - a.z); return [(b.x - a.x) / l, (b.z - a.z) / l]; };
    const tint = (x, y, z) => { const n = .75 + .5 * Ruido.n2(x * .35, z * .35 + y * .3); return [base.r * n, base.g * n, base.b * n]; };
    for (let i = 0; i < N; i++) {
      const p = P[i], t = tangente(i), px = -t[1], pz = t[0], R = c.R * (i === 0 ? 1.0 : 1);
      for (let k = 0; k < seg; k++) {
        const a = k / seg * TAU, rr = R * (1 + .2 * Ruido.n2(i * .6 + 3, k * 1.1 + c.R)), lx = Math.cos(a) * rr * 1.02, ly = Math.sin(a) * R * 1.0;
        let yy = p.y + R * .4 + ly; if (yy < p.y) yy = p.y + .03 * Ruido.n2(i * .8, k);
        const x = p.x + px * lx, z = p.z + pz * lx; pos.push(x, yy, z); const q = tint(x, yy, z); col.push(q[0], q[1], q[2]);
      }
    }
    for (let i = 0; i < N - 1; i++) for (let k = 0; k < seg; k++) { const a = i * seg + k, b = i * seg + (k + 1) % seg, d = (i + 1) * seg + k, e = (i + 1) * seg + (k + 1) % seg; idx.push(a, d, b, b, d, e); }
    const gt = new THREE.BufferGeometry(); gt.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gt.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); gt.setIndex(idx); gt.computeVertexNormals();
    // cámara: media esfera con suelo; se abre la boca del túnel
    const sg = new THREE.SphereGeometry(c.Rc, 30, 14, 0, TAU, 0, Math.PI / 2), sp = sg.attributes.position, sc = [];
    for (let i = 0; i < sp.count; i++) {
      const x = sp.getX(i), y = sp.getY(i), z = sp.getZ(i), n = 1 + .13 * Ruido.n2(x * .25 + c.cx, z * .25 + y * .2) + .06 * Ruido.n2(x * .9, z * .9 + y * .8);
      sp.setXYZ(i, x * n, y * 1.25 * n, z * n); const q = tint(x + c.cx, y, z + c.cz); sc.push(q[0], q[1], q[2]);
    }
    sg.setAttribute('color', new THREE.Float32BufferAttribute(sc, 3)); sg.translate(c.cx, c.cy, c.cz);
    const sidx = sg.index.array, keep = [], ex = c.pts[N - 1].x, ez = c.pts[N - 1].z, dl = Math.hypot(c.dir[0], c.dir[1]), dx = c.dir[0] / dl, dz = c.dir[1] / dl;
    for (let i = 0; i < sidx.length; i += 3) {
      let mx = 0, my = 0, mz = 0; for (let k = 0; k < 3; k++) { mx += sp.getX(sidx[i + k]) / 3; my += sp.getY(sidx[i + k]) / 3; mz += sp.getZ(sidx[i + k]) / 3; }
      const rx = mx - ex, rz = mz - ez, lat = Math.abs(rx * -dz + rz * dx), fw = (mx - c.cx) * dx + (mz - c.cz) * dz;
      if (fw < -c.Rc * .35 && lat < c.R * 1.25 && my < c.cy + c.R * 1.7) continue; keep.push(sidx[i], sidx[i + 1], sidx[i + 2]);
    }
    sg.setIndex(keep); sg.computeVertexNormals();
    const fl = new THREE.CircleGeometry(c.Rc * .97, 28); fl.rotateX(-Math.PI / 2); fl.translate(c.cx, c.cy + .01, c.cz); const fc = []; for (let i = 0; i < fl.attributes.position.count; i++) { const q = tint(fl.attributes.position.getX(i), 0, fl.attributes.position.getZ(i)); fc.push(q[0] * .8, q[1] * .8, q[2] * .8); } fl.setAttribute('color', new THREE.Float32BufferAttribute(fc, 3));
    const partes = [gt, sg, fl];
    // decoración: el paso queda libre (CUEVA_DECO). Estalactitas sobre el túnel y la cámara; estalagmitas y cristales a
    // un lado del túnel, apoyados en su suelo, o en racimos contra la pared de la cámara
    const r = rng(c.R * 100 + 3), D = CUEVA_DECO, rac = racimosCamara(c, r);
    const aUnLado = () => { const i = 1 + Math.floor(r() * (N - 2)), p = P[i], t = tangente(i), off = (r() < .5 ? -1 : 1) * c.R * lerp(D.libreTunel, D.ladoTunel, r()); return { x: p.x - t[1] * off, z: p.z + t[0] * off, y: p.y }; };
    const enRacimo = () => { const a = rac[Math.floor(r() * rac.length)] + (r() - .5) * 2 * D.anchoRacimo, d = lerp(D.libreCentro, c.Rc * D.borde, Math.sqrt(r())); return { x: c.cx + Math.cos(a) * d, z: c.cz + Math.sin(a) * d, y: c.cy }; };
    for (let n = 0; n < 60; n++) {
      const tunel = n < 34, h = .8 + r() * 2.2, w = .2 + r() * .35; let x, z, yt, yb;
      if (tunel) { const i = 1 + Math.floor(r() * (N - 2)), p = P[i], t = tangente(i); const off = (r() - .5) * c.R * 1.4; x = p.x - t[1] * off; z = p.z + t[0] * off; yb = p.y; yt = p.y + c.R * 1.3 - Math.abs(off) * .4; }
      else { const a = r() * TAU, d = 3 + r() * (c.Rc * .85 - 3); x = c.cx + Math.cos(a) * d; z = c.cz + Math.sin(a) * d; yb = c.cy; yt = c.cy + c.Rc * 1.2 * Math.sqrt(Math.max(0, 1 - (d / c.Rc) ** 2)); }
      const hc = Math.min(h, yt + .2 - yb - D.techoLibre);   // la punta no baja de techoLibre sobre el suelo
      if (hc > .5) partes.push(pieza(new THREE.ConeGeometry(w, hc, 6), c.tono, { x, y: yt - hc / 2 + .2, z, rx: Math.PI, var: .2 }));
      if (r() < .6) {   // estalagmita, con su sólido fino
        const q = tunel ? aUnLado() : enRacimo(), hs = h * .8, rs = w * 1.2;
        partes.push(pieza(new THREE.ConeGeometry(rs, hs, 6), c.tono, { x: q.x, y: q.y + hs / 2, z: q.z, var: .2 })); Sol.col(q.x, q.z, rs, q.y, q.y + hs).fina = true;
      }
    }
    for (const p of partes) Arquitectura.clase(p, 'roca');
    portico(c, partes);
    const m = new THREE.Mesh(Arquitectura.fusionar(partes), Arquitectura.material());
    m.receiveShadow = false; G.add(m);
    c.mesh = m;
    // cristales luminosos: con el material de los de fuera (03-flora.js, misma malla instanciada: sin programa nuevo); el
    // tono de cada cueva va en el color de instancia. Treinta a los lados del túnel y el resto en los racimos de la cámara
    const gc = Flora.geoCristal(), colC = c.id === 'cristal' ? new THREE.Color(1, 1, 1) : lin(0xb8ff8a);
    const ci = new THREE.InstancedMesh(gc, Flora.matCristal, 70); ci.receiveShadow = true; let nc = 0; const mm = new THREE.Matrix4(), qq = new THREE.Quaternion();
    for (let n = 0; n < 70; n++) {
      const q = n < 30 ? aUnLado() : enRacimo(), esc = .9 + r() * 1.3;
      qq.setFromEuler(new THREE.Euler((r() - .5) * .5, r() * TAU, (r() - .5) * .5)); mm.compose(new THREE.Vector3(q.x, q.y, q.z), qq, new THREE.Vector3().setScalar(esc)); ci.setMatrixAt(nc, mm); ci.setColorAt(nc++, colC);
      // La envolvente completa cierra los dos túneles. Su redistribución depende de D06.
      if (n < 30) { if (esc > D.solidoTunelEsc) Sol.col(q.x, q.z, D.solidoTunelR * esc, q.y, q.y + 2 * esc).fina = true; }
      else {
        const p = gc.attributes.position, v = new THREE.Vector3(); let rMax = 0, yMin = Infinity, yMax = -Infinity;
        for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(mm); rMax = Math.max(rMax, Math.hypot(v.x - q.x, v.z - q.z)); yMin = Math.min(yMin, v.y); yMax = Math.max(yMax, v.y); }
        Sol.col(q.x, q.z, rMax, yMin, yMax).fina = true;
      }
    }
    ci.count = nc; ci.frustumCulled = false; G.add(ci);
    if (c.id === 'luciernagas') {
      const gp = new Float32Array(300 * 3); for (let i = 0; i < 300; i++) { const a = r() * TAU, d = r() * c.Rc * .9; let x = c.cx + Math.cos(a) * d, z = c.cz + Math.sin(a) * d, y = c.cy + 2 + r() * (c.Rc * .9); if (i < 100) { const q = P[1 + Math.floor(r() * (N - 2))]; x = q.x + (r() - .5) * c.R; z = q.z + (r() - .5) * c.R; y = q.y + 1 + r() * c.R; } gp[i * 3] = x; gp[i * 3 + 1] = y; gp[i * 3 + 2] = z; }
      const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(gp, 3));
      const pts = new THREE.Points(gg, new THREE.PointsMaterial({ size: .5, color: 0xcfff8a, map: TEX.halo, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); pts.frustumCulled = false; G.add(pts); E.tickers.push(t => { pts.material.opacity = .65 + .35 * Math.sin(t * 1.7); pts.rotation.y = Math.sin(t * .1) * .02; });
    }
    const centro = { x: c.cx, y: c.cy + 3, z: c.cz };
    E.cuevaInfo[c.id] = centro;
  }
  function cristalesMemoria() {
    const c = CUEVAS[0], cols = [0xff9fd0, 0xffd36a, 0x7fe8ff, 0xb59cff];
    cols.forEach((hx, i) => {
      const a = i / 4 * TAU + Math.PI / 4, x = c.cx + Math.cos(a) * 6.2, z = c.cz + Math.sin(a) * 6.2;
      // en reposo, su color apagado sobre el gris (RETO_CRISTALES.reposo): se distinguen de la decoración sin sonar
      const reposo = new THREE.Color(0x3b3f56).lerp(new THREE.Color(hx), RETO_CRISTALES.reposo).getHex();
      const g = new THREE.Mesh(new THREE.ConeGeometry(.7, 3, 6), new THREE.MeshBasicMaterial({ color: reposo, fog: true })); g.position.set(x, c.cy + 1.5, z); G.add(g);
      const h = new Halo(hx, RETO_CRISTALES.haloReposo); h.scale.set(7, 7, 1); h.position.set(x, c.cy + 2, z); G.add(h);
      Sol.col(x, z, .8, c.cy, c.cy + 3).fina = true;
      E.cristalesMem.push({ i, x, z, y: c.cy + 1.8, mesh: g, halo: h, hex: hx, reposo });
    });
    const obra = Arquitectura.construir(k => Arquitectura.altar(k, 0x5b6a82, 1.25, 1.15)), al = obra.g; al.position.set(c.cx, c.cy, c.cz); G.add(al); Arquitectura.ponerSolidos(obra, c.cx, c.cy, c.cz, 0);
    E.altar.escarcha = { x: c.cx, z: c.cz, y: c.cy + 1.3 + 2.1, nom: 'Altar de Escarcha' };
  }

  /* pórtico de roca en la boca: un arco que enmarca la entrada, sus jambas hasta el suelo y un saliente encima que tapa
     el hueco del terreno sobre los primeros metros del túnel (si no, desde fuera se veía el techo del túnel). Las jambas
     tienen sólido (no se atraviesan). Números en PORTICO */
  function portico(c, partes) {
    const roca = g => Arquitectura.clase(g, 'roca');
    const P = PORTICO, dl = Math.hypot(c.dir[0], c.dir[1]), dx = c.dir[0] / dl, dz = c.dir[1] / dl, ry = Math.atan2(dx, dz), R = c.R, yc = c.y0 + R * .4;
    const en = (s, lat) => [c.bx + dx * s - dz * lat, c.bz + dz * s + dx * lat], semilla = c.R * 31;
    const arco = abollar(new THREE.TorusGeometry(R + P.holgura, P.grosor, 8, 18, Math.PI), .22, .7, semilla);
    let [x, z] = en(P.arcoS, 0); partes.push(roca(pieza(arco, P.color, { x, y: yc, z, ry, var: .2, ao: .2 })));
    for (const sd of [-1, 1]) { [x, z] = en(P.arcoS, sd * (R + P.holgura)); const h = yc - c.y0 + 1.2; Sol.col(x, z, P.grosor * .95, c.y0 - 1, c.y0 + h); partes.push(roca(pieza(abollar(icoSuave(1, 2), .2, .9, semilla + sd), P.color, { x, y: c.y0 + h / 2 - 1, z, sx: P.grosor * 1.1, sy: h / 2 + .4, sz: P.grosor * 1.2, ry, var: .2, ao: .25 }))); }
    [x, z] = en(P.salienteS, 0); partes.push(roca(pieza(abollar(icoSuave(1, 2), .15, .6, semilla + 7), P.color, { x, y: yc + R + P.alzado + P.alto, z, sx: R + P.holgura + P.grosor + P.ancho, sy: P.alto, sz: P.fondo, ry, var: .2, ao: .3 })));
  }
  function crear(grupo, estr) {
    G = grupo; E = estr;
    for (const c of CUEVAS) construirCueva(c);
    cristalesMemoria();
    E.luzCueva = new THREE.PointLight(LUZ_CUEVA.colores[0], 0, LUZ_CUEVA.alcance, LUZ_CUEVA.caida); E.luzCueva.position.set(0, -50, 0); scene.add(E.luzCueva);
  }
  /* la luz va a la cueva en la que está Hikari (a la cámara si está en ella, si no, al tramo de túnel) y sube con lo dentro que está */
  const P_IDX = (c, s) => Math.round(s / (c.largo / (c.pts.length - 1)));
  function actualizar(dt, px, pz, interior) {
    const L = E.luzCueva, i = interior > .01 ? CUEVAS.findIndex(c => Math.hypot(px - c.mx, pz - c.mz) < c.mr + 20) : -1;
    if (i >= 0) {
      const c = CUEVAS[i], q = proyCueva(c, px, pz), sa = clamp(q.s, 0, c.largo), dc = Math.hypot(px - c.cx, pz - c.cz);
      if (dc < c.Rc + 6) L.position.set(c.cx, c.cy + 5, c.cz); else { const k = Math.min(P_IDX(c, sa), c.pts.length - 1); const p = c.pts[k]; L.position.set(p.x, p.y + c.R * .7, p.z); }
      L.color.setHex(LUZ_CUEVA.colores[i % LUZ_CUEVA.colores.length]); L.intensity = damp(L.intensity, LUZ_CUEVA.intensidad * interior, 3, dt);
    } else L.intensity = damp(L.intensity, 0, 4, dt);
  }
  return { crear, actualizar };
})();
