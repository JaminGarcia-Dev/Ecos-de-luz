/* === Ecos de Luz · 19-animales.js ===
   Modelos y animación de la fauna (el comportamiento está en 06-fauna.js).
   · Cuadrúpedos con esqueleto generados desde las medidas de cada especie: cuerpo, cuello,
     cabeza con hocico, ojos, orejas, astas o colmillos, cola de dos segmentos y cuatro patas.
     Locomoción con apoyo real (IK): paso, trote, galope y salto; cuerpo inclinado según el
     terreno, lomo que se flexiona al galopar, cabeza que acompaña el paso o mira al jugador,
     orejas y cola según el estado, respiración, echarse, ponerse de pie (oso) y escarbar (jabalí).
   · Pato (nada, sumerge la cabeza y vuela al huir), tortuga (esconde la cabeza) y artrópodos
     (patas alternas, pinzas y cola articulada del escorpión; el cangrejo anda de lado). */
"use strict";

const Animales = (() => {
  /* echado o erguido, el cuerpo sigue la pendiente como mucho estos rad (antes, en una ladera fuerte quedaba volcado) */
  const INCLINA_QUIETO = .2;
  /* marchas: desfase de cada pata [delantera izq., delantera der., trasera izq., trasera der.],
     fracción de apoyo, frecuencia base (patas de 0,6 m), alcance del apoyo en largos de pata y flexión del lomo */
  const MARCHAS = {
    paso: { off: [.25, .75, 0, .5], apoyo: .66, f: 1.0, alc: 1.1, flex: 0 },
    trote: { off: [0, .5, .5, 0], apoyo: .45, f: 1.55, alc: 1.2, flex: .03 },
    galope: { off: [.55, .65, 0, .1], apoyo: .3, f: 2.0, alc: 1.45, flex: .12 },
    salto: { off: [.5, .55, 0, .04], apoyo: .3, f: 2.1, alc: 2.4, flex: .28 }
  };
  let matPiel, matRig;
  /* material compartido: color y rugosidad por vértice y un halo suave de pelaje a contraluz */
  function material() {
    if (matPiel) return matPiel;
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, skinning: true, roughness: 1, metalness: 0 });
    m.onBeforeCompile = sh => {
      Atmosfera.inyectar(sh);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aMat; varying vec2 vMat;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMat = aMat;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vMat;')
        .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vMat.x;')
        .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance += vColor*vMat.y;')
        .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\nreflectedLight.indirectDiffuse *= 1. + pow(1. - saturate(dot(geometry.normal, geometry.viewDir)), 2.5)*1.3;');
    };
    m.customProgramCacheKey = () => 'animal';
    return (matPiel = m);
  }
  const rig = () => matRig || (matRig = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 }));
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler();

  /* ================= cuadrúpedos ================= */
  function cuadrupedo(E, colBase) {
    const L = E.len, w = E.w, bh = E.bh, leg = E.leg, hr = E.hr, cola = Math.max(E.cola || .1, .08);
    const reptil = E.marcha === 'reptil', saltador = E.marcha === 'salto';
    const Y0 = leg + bh * .5, jy = leg + bh * .12, L1 = jy * .51, L2 = jy * .51;
    const zF = L * .27, zH = -L * .27, xL = w * (reptil ? .9 : .62), xPie = reptil ? w * 2.1 : xL * .95;
    const ang = (E.cuelloAng === undefined ? 46 : E.cuelloAng) * Math.PI / 180, nl = hr * 2.6 * (E.cuello || 1), cuelloDir = V(0, Math.sin(ang), Math.cos(ang));
    const kc = E.cabeza || 1, grueso = E.cuelloGrueso || 1, caida = E.colaCaida === undefined ? .35 : E.colaCaida;
    // ---- esqueleto ----
    const defs = [
      ['cadera', -1, 0, Y0, zH], ['lomo', 0, 0, 0, -zH], ['pecho', 1, 0, 0, zF], ['cuello', 2, 0, bh * .28, L * .16], ['cabeza', 3, 0, nl * cuelloDir.y, nl * cuelloDir.z],
      ['orejaI', 4, hr * .5, hr * .85, hr * .2], ['orejaD', 4, -hr * .5, hr * .85, hr * .2], ['colaA', 0, 0, bh * .22, -(L * .5 + zH)], ['colaB', 7, 0, -cola * .25, -cola * .48],
      ['hombroI', 2, xL, jy - Y0, 0], ['codoI', 9, 0, -L1, 0], ['manoI', 10, 0, -L2, 0], ['hombroD', 2, -xL, jy - Y0, 0], ['codoD', 12, 0, -L1, 0], ['manoD', 13, 0, -L2, 0],
      ['musloI', 0, xL, jy - Y0, 0], ['rodI', 15, 0, -L1, 0], ['pataI', 16, 0, -L2, 0], ['musloD', 0, -xL, jy - Y0, 0], ['rodD', 18, 0, -L1, 0], ['pataD', 19, 0, -L2, 0]
    ];
    const B = {}, huesos = [];
    defs.forEach((d, i) => { const b = new THREE.Bone(); b.name = d[0]; b.position.set(d[2], d[3], d[4]); huesos.push(b); B[d[0]] = i; if (d[1] >= 0) huesos[d[1]].add(b); });
    // posición de reposo (mundo del animal) de cada hueso
    const W = {}; huesos[0].updateMatrixWorld(true); huesos.forEach((b, i) => { W[b.name] = b.getWorldPosition(new THREE.Vector3()); });
    // ---- malla ----
    const P = new Piel(), cB = lin(colBase || E.col), cV = lin(E.vie || E.col), cP = lin(E.pata || E.col), oscuro = lin(0x141210);
    const ruido = (x, y, z) => .9 + .2 * Ruido.n2(x * 9 + z * 5, y * 9 - z * 3);
    const pelo = (x, y, z, sa) => { const c = cB.clone(); if (sa < -.3) c.lerp(cV, smooth(-.3, -.8, sa)); else if (sa > .55) c.multiplyScalar(.84); return c.multiplyScalar(ruido(x, y, z)); };
    // cuerpo: perfil [z/L, ancho, alto, desplazamiento vertical]
    const perfil = E.perfil || [[-.5, .3, .3, .08], [-.45, .76, .72, .05], [-.33, .98, .92, 0], [-.15, .94, .88, 0], [.05, .92, .9, -.02], [.25, 1.02, 1.06, -.05], [.38, .9, .95, 0], [.47, .6, .62, .08], [.52, .26, .32, .12]];
    const pTorso = (x, y, z) => z > .05 * L ? pesoEntre(B.pecho, B.lomo, z, .08 * L, .26 * L) : pesoEntre(B.lomo, B.cadera, z, -.2 * L, 0);
    P.tubo(perfil.map(s => ({ p: V(0, Y0 + s[3] * bh, s[0] * L), rx: s[1] * w, ry: s[2] * bh * .5 })), 16, pelo, .9, 0, pTorso, true);
    // cuello
    const cb = V(0, Y0 + bh * .15, zF + L * .1), ch = W.cabeza;
    const pCuello = (x, y, z) => y > ch.y - hr * .6 ? pesoEntre(B.cabeza, B.cuello, y, ch.y - hr * .6, ch.y - hr * .1) : pesoEntre(B.cuello, B.pecho, y, cb.y + nl * .1, cb.y + nl * .35);
    P.tubo([0, .25, .5, .75, 1].map(t => ({ p: cb.clone().lerp(ch, t), rx: lerp(w * .55 * grueso, hr * .62 * kc, t), ry: lerp(bh * .34 * grueso, hr * .7 * kc, t) })), 12, pelo, .9, 0, pCuello);
    // cabeza: cráneo, hocico, nariz, ojos
    const pCab = () => [B.cabeza, 1], hoc = E.hocico || 0, largoH = hr * (1.5 + hoc * 6);
    P.elip(ch.x, ch.y + hr * .15 * kc, ch.z + hr * .32 * kc, hr * .78 * kc, hr * .8 * kc, hr * .98 * kc, 14, 10, pelo, .9, 0, pCab);
    P.tubo([0, .5, 1].map(t => ({ p: V(0, ch.y + hr * (.05 - .2 * t), ch.z + hr * .9 + largoH * t), rx: hr * lerp(.56, .3, t), ry: hr * lerp(.5, .28, t) })), 12, (x, y, z, sa, k) => cB.clone().lerp(cV, k / 2 * .8), .85, 0, pCab, true);
    P.elip(0, ch.y - hr * .14, ch.z + hr * .92 + largoH, hr * .16, hr * .13, hr * .1, 8, 6, () => oscuro, .3, 0, pCab);
    for (const s of [1, -1]) P.elip(s * hr * .5, ch.y + hr * .32, ch.z + hr * .95, hr * .12, hr * .12, hr * .1, 8, 6, () => oscuro, .12, 0, pCab);
    // orejas
    for (const s of [1, -1]) {
      const o = W[s > 0 ? 'orejaI' : 'orejaD'], pO = () => [B[s > 0 ? 'orejaI' : 'orejaD'], 1], ti = E.orej;
      if (ti === 'p') P.tubo([0, .5, 1].map(t => ({ p: V(o.x + s * hr * .15 * t, o.y + hr * 1.05 * t, o.z - hr * .1 * t), rx: hr * lerp(.3, .03, t), ry: hr * lerp(.14, .02, t) })), 8, () => cB, .9, 0, pO);
      if (ti === 'l') P.tubo([0, .4, .8, 1].map(t => ({ p: V(o.x + s * hr * .25 * t, o.y + hr * 3.1 * t, o.z - hr * .5 * t), rx: hr * lerp(.3, .12, t) * (t > .9 ? .5 : 1), ry: hr * .1 })), 8, (x, y, z, sa) => sa > 0 ? cB : lin(0xe8b4bc), .9, 0, pO);
      if (ti === 'r') P.elip(o.x, o.y + hr * .15, o.z, hr * .3, hr * .28, hr * .14, 8, 6, () => cB, .9, 0, pO);
    }
    if (E.cuernos) for (const s of [1, -1]) {   // astas: tronco y tres puntas
      const b0 = V(s * hr * .38, ch.y + hr * .85, ch.z + hr * .2), cA = () => lin(0xd8cdb0), pc = () => [B.cabeza, 1];
      const pts = [b0, b0.clone().add(V(s * hr * .5, hr * 1.4, -hr * .35)), b0.clone().add(V(s * hr * 1.2, hr * 2.6, -hr * .5)), b0.clone().add(V(s * hr * 1.5, hr * 3.6, -hr * .1))];
      P.tubo(pts.map((p, i) => ({ p, rx: hr * lerp(.09, .035, i / 3), ry: hr * lerp(.09, .035, i / 3) })), 6, cA, .6, 0, pc);
      for (const [k, dv] of [[1, V(s * hr * .1, hr * 1.1, hr * .6)], [2, V(s * hr * .5, hr * 1.2, hr * .5)]]) P.tubo([{ p: pts[k], rx: hr * .05, ry: hr * .05 }, { p: pts[k].clone().add(dv), rx: hr * .02, ry: hr * .02 }], 5, cA, .6, 0, pc);
    }
    if (E.colmillos) for (const s of [1, -1]) P.tubo([{ p: V(s * hr * .3, ch.y - hr * .15, ch.z + hr * .9 + largoH * .7), rx: hr * .06, ry: hr * .06 }, { p: V(s * hr * .42, ch.y + hr * .2, ch.z + hr * .9 + largoH * .8), rx: hr * .02, ry: hr * .02 }], 5, () => lin(0xf2ead6), .4, 0, pCab);
    // patas: articulación, músculo arriba, pezuña o zarpa abajo
    for (const [sup, inf, pie, cuerpo] of [['hombroI', 'codoI', 'manoI', 'pecho'], ['hombroD', 'codoD', 'manoD', 'pecho'], ['musloI', 'rodI', 'pataI', 'cadera'], ['musloD', 'rodD', 'pataD', 'cadera']]) {
      const j = W[sup], tras = cuerpo === 'cadera', gro = (saltador && tras ? 1.5 : 1) * (E.muslo || 1);
      const ys = [j.y + bh * .1, j.y, j.y - L1 * .5, j.y - L1, j.y - L1 - L2 * .5, leg * .1, leg * .02];
      const rs = [w * .34 * gro, w * .3 * gro, w * .19 * gro, w * .13, w * .115, w * .1, w * .11];
      const pP = (x, y, z) => y > j.y - L1 * .6 ? (y > j.y - bh * .05 ? [B[sup], .65, B[cuerpo], .35] : [B[sup], 1]) : y > j.y - L1 - L2 * .1 ? pesoEntre(B[sup], B[inf], y, j.y - L1 - L2 * .08, j.y - L1 * .7) : pesoEntre(B[inf], B[pie], y, leg * .03, leg * .14);
      P.tubo(ys.map((y, i) => ({ p: V(j.x, y, j.z + (tras && i < 3 ? -w * .1 * gro : 0)), rx: rs[i], ry: rs[i] * (i < 3 ? 1.15 : 1) })), 10, (x, y, z) => y < leg * .35 ? cP.clone().multiplyScalar(ruido(x, y, z)) : pelo(x, y, z, 0), .9, 0, pP);
      P.elip(j.x, leg * .045, j.z + w * .06, w * .14, leg * .055 + .01, w * .2, 8, 5, () => E.pezuna ? oscuro : cP, .5, 0, () => [B[pie], 1]);
    }
    // cola
    const c0 = W.colaA, pc = (x, y, z) => pesoEntre(B.colaA, B.colaB, -z, -c0.z + cola * .25, -c0.z + cola * .55);
    const tupida = E.colaTupida || 1;
    P.tubo([0, .3, .6, 1].map(t => ({ p: V(0, c0.y - cola * .55 * t * t, c0.z - cola * .85 * t), rx: cola * .2 * tupida * Math.sin(Math.PI * (.2 + t * .7)) + .012, ry: cola * .2 * tupida * Math.sin(Math.PI * (.2 + t * .7)) + .012 })), 9,
      (x, y, z, sa, k) => k === 3 && cola > .3 ? cV : pelo(x, y, z, sa), .95, 0, pc, true);
    const geo = P.geo(); geo.computeBoundingSphere(); geo.boundingSphere.radius *= 1.5;   // margen para las poses (echarse, erguirse)
    const malla = new THREE.SkinnedMesh(geo, material());
    malla.add(huesos[0]); malla.bind(new THREE.Skeleton(huesos)); malla.castShadow = true; malla.receiveShadow = true;
    const g = new THREE.Group(); g.add(malla);
    const hb = n => huesos[B[n]];
    // ---- animación ----
    const patas = [['hombroI', 'codoI', 'manoI', 1, xPie, zF], ['hombroD', 'codoD', 'manoD', 1, -xPie, zF], ['musloI', 'rodI', 'pataI', -1, xPie, zH], ['musloD', 'rodD', 'pataD', -1, -xPie, zH]]
      .map(p => ({ sup: hb(p[0]), inf: hb(p[1]), pie: hb(p[2]), polo: V(0, 0, p[3]), rx: p[4], rz: p[5], pos: V(), rest: V(), yDest: 0, desde: V(), hacia: V(), aire: false, t: 1, dur: .2, y0: 0, pPrev: 0, qS: new THREE.Quaternion(), qI: new THREE.Quaternion() }));
    const S = { fase: 0, listo: false, ult: V(), wF: 1, wH: 1, cX: 0, cY: 0, kX: 0, colaX: .3, colaY: 0, orejaX: 0, alto: 0, pitch: 0, roll: 0, tt: Math.random() * 10, rasca: 0, rX: NaN, rZ: NaN, rYaw: NaN };
    const descanso = (p, a, out) => { const c = Math.cos(a.yaw), s = Math.sin(a.yaw), x = p.rx * a.esc, z = p.rz * a.esc; out.set(a.x + x * c + z * s, 0, a.z - x * s + z * c); out.y = altura(out.x, out.z); return out; };
    const empezar = (p, a, dur) => { p.aire = true; p.t = 0; p.dur = dur; p.desde.set(p.pos.x - a.x, 0, p.pos.z - a.z); p.y0 = p.pos.y; };
    const PLEG = { F: [.9, -2.3], H: [-1.2, 2.5] };   // patas recogidas al echarse
    function actualizar(a, dt, ctx) {
      dt = Math.min(dt, .05); S.tt += dt;
      g.position.set(a.x, a.y, a.z); g.rotation.y = a.yaw;
      if (!S.listo || _v.set(a.x, a.y, a.z).distanceTo(S.ult) > 3) { patas.forEach(p => { descanso(p, a, p.pos); p.aire = false; }); S.listo = true; }
      S.ult.set(a.x, a.y, a.z);
      const est = a.estado, vel = Math.hypot(a.vx, a.vz), v = vel / a.esc, mx = E.vel;
      const echado = est === 'calmado' || est === 'tumbado', erguido = est === 'amenaza' && E.amenaza === 'erguirse';
      // marcha según la velocidad
      const nombre = saltador ? (v > .3 ? 'salto' : 'paso') : reptil ? 'trote' : v < .3 * mx ? 'paso' : v < .66 * mx ? 'trote' : 'galope', M = MARCHAS[nombre];
      const largo = L1 + L2, f = Math.max(M.f * Math.sqrt(.6 / largo) * (reptil ? 1.6 : 1), v * M.apoyo / (largo * M.alc));
      if (v > .05) S.fase = (S.fase + f * dt) % 1;
      if (a.x !== S.rX || a.z !== S.rZ || a.yaw !== S.rYaw) { patas.forEach(p => descanso(p, a, p.rest)); S.rX = a.x; S.rZ = a.z; S.rYaw = a.yaw; }   // quieto: reaprovecha las alturas
      patas.forEach((p, i) => {
        const fz = (S.fase + M.off[i]) % 1;
        if (v > .05) {
          const cruza = (p.pPrev < M.apoyo && fz >= M.apoyo) || (fz < p.pPrev && fz >= M.apoyo);
          if (cruza && !p.aire) { empezar(p, a, (1 - M.apoyo) / f); const m = p.dur + M.apoyo / f * .5; p.yDest = altura(p.rest.x + a.vx * m, p.rest.z + a.vz * m); }
          if (p.aire) { const m = M.apoyo / f * .5; p.hacia.set(p.rest.x - a.x + a.vx * m, 0, p.rest.z - a.z + a.vz * m); }
        } else if (!p.aire && !patas.some(q => q.aire)) {
          if (p.rest.distanceTo(p.pos) > .15 * a.esc * leg + .04) { empezar(p, a, .22); p.hacia.set(p.rest.x - a.x, 0, p.rest.z - a.z); p.yDest = p.rest.y; }
        }
        p.pPrev = fz;
        if (p.aire) {
          p.t += dt / p.dur; const u = Math.min(1, p.t), s = u * u * (3 - 2 * u);
          p.pos.x = a.x + lerp(p.desde.x, p.hacia.x, s); p.pos.z = a.z + lerp(p.desde.z, p.hacia.z, s);
          if (p.t >= 1) { p.aire = false; p.pos.y = altura(p.pos.x, p.pos.z); } else p.pos.y = lerp(p.y0, p.yDest, s) + Math.sin(Math.PI * u) * leg * a.esc * (.18 + .12 * smooth(.5, 1, v / mx));
        }
      });
      // inclinación del cuerpo según el terreno bajo las patas (echado o erguido, con tope: en una ladera fuerte no se vuelca)
      const h = patas.map(p => p.rest.y), dz = (zF - zH) * a.esc, dx = 2 * xPie * a.esc, tope = echado || erguido ? INCLINA_QUIETO : Math.PI;
      S.pitch = damp(S.pitch, clamp(Math.atan2((h[2] + h[3] - h[0] - h[1]) / 2, dz), -tope, tope), 6, dt);
      S.roll = damp(S.roll, clamp(Math.atan2((h[1] + h[3] - h[0] - h[2]) / 2, dx) * .6, -tope, tope), 6, dt);
      // objetivos de pose según el estado
      let cX = 0, cY = 0, alto = 0, extra = 0, orejaX = Math.sin(S.tt * .7) > .97 ? .5 : 0, colaX = caida, colaY = Math.sin(S.tt * 1.8) * .15, fTarget = 1, hTarget = 1;
      const aJ = ctx ? clamp(angDif(a.yaw, Math.atan2(ctx.jx - a.x, ctx.jz - a.z)), -1.1, 1.1) : 0;
      if (est === 'pastar') { cX = 1.05; extra = .3 + Math.sin(S.tt * 9) * .05; colaY = Math.sin(S.tt * 2.6) * .25; }
      if (est === 'alerta' || est === 'curioso') { cX = est === 'alerta' ? -.4 : -.1; cY = aJ; orejaX = -.35; if (est === 'alerta' && E.colaAlerta) colaX = -1.1; }
      if (est === 'curioso') colaY = Math.sin(S.tt * 11) * .55;
      if (est === 'huir') { cX = .15; orejaX = .9; colaX = E.colaAlerta ? -1 : .1; }
      if (est === 'agresivo' || est === 'amenaza') { cX = .3; cY = aJ; orejaX = .8; colaX = .1; alto = -.06 * bh; }
      if (est === 'aturdido') { cX = .4; cY = Math.sin(S.tt * 9) * .45; orejaX = .7; colaX = .7; alto = -.1 * bh; }   // sacude la cabeza, aturdido
      if (est === 'olfatear') { cX = .8; cY = Math.sin(S.tt * 3) * .4; }
      if (est === 'atacar') { cY = aJ * .5; if (a.fasea === 0) { alto = -.12 * bh; S.pitch -= .1 * dt * 10; } else { cX = .25; } }
      if (echado) { alto = -(Y0 - bh * .5 - leg * .12); fTarget = hTarget = 0; cX = -.1; colaX = caida + .5; }
      if (erguido) { fTarget = 0; cX = -.6; cY = aJ; }
      if (v > .05) cX += Math.sin(S.fase * TAU * 2) * (nombre === 'paso' ? .07 : .04);
      S.wF = damp(S.wF, fTarget, 5, dt); S.wH = damp(S.wH, hTarget, 5, dt); S.alto = damp(S.alto, alto, 5, dt);
      S.cX = damp(S.cX, cX, 5, dt); S.cY = damp(S.cY, cY, 6, dt); S.kX = damp(S.kX, extra, 6, dt); S.orejaX = damp(S.orejaX, orejaX, 9, dt); S.colaX = damp(S.colaX, colaX, 5, dt); S.colaY = damp(S.colaY, colaY, 6, dt);
      // tronco
      const flex = M.flex * Math.sin(S.fase * TAU) * smooth(.05, .5, v);
      const bob = v > .05 ? -Math.abs(Math.sin(S.fase * TAU * (nombre === 'trote' ? 2 : 1))) * leg * .05 : Math.sin(S.tt * 2.2) * .004;
      const cad = huesos[0], ergue = S.wF < .99 && erguido ? 1 - S.wF : 0;
      cad.position.set(0, Y0 + S.alto + bob + ergue * L * .22, zH); cad.rotation.set(S.pitch - ergue * 1.15, 0, S.roll + (reptil ? Math.sin(S.fase * TAU) * .12 : 0), 'YXZ');
      hb('lomo').rotation.set(flex + Math.sin(S.tt * 2.2) * .01, reptil ? Math.sin(S.fase * TAU) * .25 : 0, 0);
      hb('pecho').rotation.set(-flex * .6 + ergue * .3, reptil ? -Math.sin(S.fase * TAU) * .3 : 0, 0);
      hb('cuello').rotation.set(S.cX * .7, S.cY * .45, 0); hb('cabeza').rotation.set(S.cX * .3 + S.kX + ergue * .5, S.cY * .55, 0);
      // orejaX > 0 las echa atrás, < 0 adelante; colaX > 0 la baja, < 0 la levanta
      hb('orejaI').rotation.set(-S.orejaX, 0, -.2 - Math.max(0, S.orejaX) * .3); hb('orejaD').rotation.set(-S.orejaX, 0, .2 + Math.max(0, S.orejaX) * .3);
      hb('colaA').rotation.set(-S.colaX, S.colaY, 0); hb('colaB').rotation.set(-S.colaX * .4 - .15, S.colaY * 1.3, 0);
      // patas: pose plegada o erguida (FK) mezclada con el apoyo (IK)
      g.updateMatrixWorld(true);
      // la cadera baja si alguna pata no alcanza el suelo
      let baja = 0;
      patas.forEach(p => { p.sup.getWorldPosition(_v); baja = Math.max(baja, (_v.y - (p.pos.y + .01)) - largo * a.esc * .97); });
      if (baja > 0 && S.wH > .5) { cad.position.y -= baja / a.esc; g.updateMatrixWorld(true); }
      patas.forEach((p, i) => {
        const del = i < 2, wIK = del ? S.wF : S.wH, ple = del ? PLEG.F : PLEG.H;
        let px = ple[0], ix = ple[1];
        if (erguido && del) { px = -.7 + Math.sin(S.tt * 3 + i) * .1; ix = -.6; }
        p.sup.rotation.set(px, 0, 0); p.inf.rotation.set(ix, 0, 0); p.pie.rotation.set(0, 0, 0);
        if (wIK > .01) {
          _w.copy(p.pos); _w.y += leg * .02 * a.esc;
          if (est === 'amenaza' && E.amenaza === 'escarbar' && i === 0) { const k = Math.sin(S.tt * 9); _w.x += Math.sin(a.yaw) * k * .2 * a.esc; _w.z += Math.cos(a.yaw) * k * .2 * a.esc; _w.y += Math.max(0, k) * .06; }
          ikDosHuesos(p.sup, p.inf, _w, p.polo, L1, L2, p.qS, p.qI);
          p.sup.quaternion.slerp(p.qS, wIK); p.inf.quaternion.slerp(p.qI, wIK);
          if (p.aire) p.pie.rotation.x = (del ? 1 : -1) * Math.sin(Math.PI * p.t) * .6;
        }
      });
    }
    return { g, tipo: 'cuad', actualizar, alto: Y0 + bh * .5 + nl * .7 };
  }

  /* ================= pato ================= */
  function ave(E) {
    const g = new THREE.Group(), cuerpo = new THREE.Group(); g.add(cuerpo);
    cuerpo.add(new THREE.Mesh(fusionar([
      pieza(new THREE.SphereGeometry(1, 16, 12), 0x9a958a, { y: .2, sx: .21, sy: .15, sz: .34, ao: .25, var: .06 }),
      pieza(new THREE.SphereGeometry(1, 12, 8), 0x7a4a2e, { y: .22, z: .2, sx: .17, sy: .14, sz: .13 }),
      pieza(new THREE.ConeGeometry(.12, .26, 8), 0x2a2a2a, { y: .27, z: -.38, rx: -1.75, sz: .5 }),
      pieza(new THREE.SphereGeometry(1, 10, 8), 0x3a3a3a, { y: .12, sx: .17, sy: .07, sz: .26 })]), rig()));
    const cuello = new THREE.Group(); cuello.position.set(0, .3, .25); cuerpo.add(cuello);
    cuello.add(new THREE.Mesh(fusionar([pieza(new THREE.CylinderGeometry(.055, .07, .2, 10), 0x1f5a48, { y: .08 }), pieza(new THREE.TorusGeometry(.06, .012, 6, 14), 0xf2f2ee, { y: .0, rx: Math.PI / 2 }),
      pieza(new THREE.SphereGeometry(.085, 12, 10), 0x1f5a48, { y: .2, z: .03, sz: 1.2 }), pieza(new THREE.BoxGeometry(.06, .025, .11), 0xe8b22c, { y: .19, z: .14, var: .05 }),
      pieza(new THREE.SphereGeometry(.014, 6, 5), 0x080808, { x: .05, y: .23, z: .07 }), pieza(new THREE.SphereGeometry(.014, 6, 5), 0x080808, { x: -.05, y: .23, z: .07 })]), rig()));
    const alas = [];
    for (const s of [-1, 1]) {
      const a = new THREE.Group(); a.position.set(s * .17, .26, .02); cuerpo.add(a);
      a.add(new THREE.Mesh(fusionar([pieza(new THREE.SphereGeometry(1, 10, 6), 0x857f72, { x: s * .12, sx: .17, sy: .03, sz: .26 }), pieza(new THREE.BoxGeometry(.05, .012, .1), 0x2a4a9a, { x: s * .14, y: .02, z: -.05 })]), rig())); alas.push(a);
    }
    const S = { tt: Math.random() * 9, inc: 0 };
    function actualizar(a, dt) {
      S.tt += dt; g.position.set(a.x, a.y + (a.alto || 0), a.z); g.rotation.y = a.yaw;
      // al pastar: en el agua mete la cabeza (cola arriba); en tierra picotea el suelo a golpes cortos
      const vuela = (a.alto || 0) > .15, pasta = a.estado === 'pastar' && !vuela, agua = altura(a.x, a.z) < NIVEL_AGUA - .05, sumerge = pasta && agua, pica = pasta && !agua;
      const golpe = pica ? Math.pow(Math.max(0, Math.sin(S.tt * 6.5)), 4) : 0;
      S.inc = damp(S.inc, vuela ? -.15 : sumerge ? 1.15 : pica ? .3 + .25 * golpe : 0, pica ? 14 : 4, dt);
      cuerpo.rotation.x = S.inc; cuerpo.position.y = vuela ? 0 : Math.sin(S.tt * 1.6) * .015 - .07;
      cuello.rotation.x = sumerge ? .9 : pica ? .55 + .75 * golpe : vuela ? .5 : Math.sin(S.tt * .8) * .1;
      cuello.rotation.y = !vuela && a.estado === 'alerta' ? Math.sin(S.tt * 3) * .5 : 0;
      alas.forEach((al, i) => { al.rotation.z = (i ? 1 : -1) * (vuela ? Math.sin(S.tt * 24) * .95 : .05); });
    }
    return { g, tipo: 'ave', actualizar, alto: .6 };
  }

  /* ================= tortuga ================= */
  function tortuga() {
    const g = new THREE.Group(), cuerpo = new THREE.Group(); g.add(cuerpo);
    const placas = [pieza(new THREE.SphereGeometry(1, 18, 10, 0, TAU, 0, Math.PI / 2), 0x4f6a3e, { y: .12, sx: .62, sy: .42, sz: .78, var: .18, ao: .4 }), pieza(new THREE.CylinderGeometry(.56, .6, .08, 16), 0xc9bc8e, { y: .1, sz: 1.3 })];
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; placas.push(pieza(new THREE.CylinderGeometry(.13, .15, .03, 6), 0x3a4f2e, { x: Math.cos(a) * .3, y: .44, z: Math.sin(a) * .38, rx: Math.sin(a) * .5, rz: -Math.cos(a) * .5, ry: i })); }
    placas.push(pieza(new THREE.CylinderGeometry(.15, .15, .03, 6), 0x3a4f2e, { y: .54 }));
    cuerpo.add(new THREE.Mesh(fusionar(placas), rig()));
    const cab = new THREE.Group(); cab.position.set(0, .2, .62); cuerpo.add(cab);
    cab.add(new THREE.Mesh(fusionar([pieza(new THREE.CylinderGeometry(.08, .1, .25, 8), 0x8fa262, { z: .1, rx: Math.PI / 2 }), pieza(new THREE.SphereGeometry(.11, 10, 8), 0x8fa262, { z: .25, y: .03, sz: 1.2 }), pieza(new THREE.SphereGeometry(.018, 6, 5), 0x0a0a0a, { x: .07, y: .07, z: .3 }), pieza(new THREE.SphereGeometry(.018, 6, 5), 0x0a0a0a, { x: -.07, y: .07, z: .3 })]), rig()));
    const patas = [];
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const p = new THREE.Group(); p.position.set(sx * .42, .1, sz * .42); cuerpo.add(p); p.add(new THREE.Mesh(fusionar([pieza(new THREE.SphereGeometry(1, 8, 6), 0x8fa262, { x: sx * .08, sx: .16, sy: .07, sz: .11 })]), rig())); patas.push(p); }
    const S = { tt: 0, fase: 0, esc: 1 };
    function actualizar(a, dt) {
      S.tt += dt; const v = Math.hypot(a.vx, a.vz); S.fase += v * dt * 5;
      g.position.set(a.x, a.y, a.z); g.rotation.y = a.yaw;
      const esconde = a.estado === 'alerta' || a.estado === 'huir' || a.estado === 'atacar' || a.golpeT > 0;
      S.esc = damp(S.esc, esconde ? .15 : 1, 6, dt); cab.scale.setScalar(Math.max(S.esc, .01)); cab.position.z = .4 + .22 * S.esc;
      patas.forEach((p, i) => { p.rotation.y = Math.sin(S.fase + (i % 3 ? Math.PI : 0)) * .45 * smooth(0, .4, v); p.scale.setScalar(esconde ? .6 : 1); });
      cuerpo.rotation.z = Math.sin(S.fase) * .03; cab.rotation.x = Math.sin(S.tt * .6) * .1;
    }
    return { g, tipo: 'tortuga', actualizar, alto: .6 };
  }

  /* ================= escorpión y cangrejo ================= */
  function artropodo(E) {
    const esc = E.nom === 'Escorpión', g = new THREE.Group(), cuerpo = new THREE.Group(); g.add(cuerpo);
    if (!esc) cuerpo.rotation.y = Math.PI / 2;   // el cangrejo anda de lado
    const c = E.col, oscuro = new THREE.Color(c).multiplyScalar(.6).getHex();
    cuerpo.add(new THREE.Mesh(fusionar(esc
      ? [pieza(new THREE.SphereGeometry(1, 14, 8), c, { y: .16, sx: .2, sy: .09, sz: .32, ao: .3, var: .1 }), pieza(new THREE.SphereGeometry(1, 10, 6), c, { y: .17, z: .26, sx: .16, sy: .08, sz: .12 })]
      : [pieza(new THREE.SphereGeometry(1, 16, 8), c, { y: .17, sx: .32, sy: .12, sz: .24, ao: .3, var: .12 }), pieza(new THREE.CylinderGeometry(.015, .015, .12, 5), c, { x: .07, y: .3, z: .18 }), pieza(new THREE.CylinderGeometry(.015, .015, .12, 5), c, { x: -.07, y: .3, z: .18 }),
        pieza(new THREE.SphereGeometry(.03, 6, 5), 0x111111, { x: .07, y: .36, z: .18 }), pieza(new THREE.SphereGeometry(.03, 6, 5), 0x111111, { x: -.07, y: .36, z: .18 })]), rig()));
    const patas = [];
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) {
      const p = new THREE.Group(); p.position.set(s * (esc ? .16 : .26), .15, -.14 + k * .1); cuerpo.add(p);
      p.add(new THREE.Mesh(fusionar([pieza(new THREE.CylinderGeometry(.018, .022, .2, 5), c, { x: s * .09, y: .03, rz: s * 1.2 }), pieza(new THREE.CylinderGeometry(.012, .018, .2, 5), oscuro, { x: s * .2, y: -.06, rz: s * .35 })]), rig()));
      patas.push({ g: p, s, k });
    }
    const pinzas = [];
    for (const s of [-1, 1]) {
      const p = new THREE.Group(); p.position.set(s * (esc ? .14 : .26), .17, esc ? .32 : .2); cuerpo.add(p);
      const fija = new THREE.Mesh(fusionar([pieza(new THREE.CylinderGeometry(.03, .035, .2, 6), c, { z: .09, rx: Math.PI / 2 }), pieza(new THREE.SphereGeometry(1, 10, 7), c, { z: .24, sx: .08, sy: .05, sz: .1 })]), rig());
      const movil = new THREE.Group(); movil.position.set(0, 0, .3); movil.add(new THREE.Mesh(fusionar([pieza(new THREE.ConeGeometry(.035, .14, 5), oscuro, { z: .06, rx: Math.PI / 2, x: s * .02 })]), rig()));
      p.add(fija); p.add(movil); p.rotation.y = s * -.4; pinzas.push({ p, movil, s });
    }
    const cola = [];
    if (esc) { let padre = cuerpo, z = -.3; for (let k = 0; k < 6; k++) { const s = new THREE.Group(); s.position.set(0, k ? .02 : .2, k ? -.1 : z); padre.add(s); s.add(new THREE.Mesh(fusionar([k < 5 ? pieza(new THREE.SphereGeometry(1, 8, 6), c, { z: -.05, sx: .06 - k * .006, sy: .05, sz: .07 }) : pieza(new THREE.ConeGeometry(.035, .12, 6), 0x2a1a0a, { z: -.06, rx: -2.2 })]), rig())); cola.push(s); padre = s; } }
    const S = { tt: Math.random() * 6, fase: 0 };
    function actualizar(a, dt) {
      S.tt += dt; const v = Math.hypot(a.vx, a.vz); S.fase += v * dt * 9;
      g.position.set(a.x, a.y, a.z); g.rotation.y = a.yaw;
      const mov = smooth(0, .3, v);
      patas.forEach(p => { const par = (p.k + (p.s > 0 ? 0 : 1)) % 2, f = Math.sin(S.fase + par * Math.PI); p.g.rotation.y = f * .35 * mov; p.g.rotation.z = Math.max(0, Math.cos(S.fase + par * Math.PI)) * .3 * mov * p.s; });
      const tension = a.estado === 'alerta' || a.estado === 'agresivo' || a.estado === 'atacar' || a.estado === 'amenaza';
      pinzas.forEach(pz => { pz.movil.rotation.y = pz.s * (tension ? .4 + .3 * Math.sin(S.tt * 12) : .1 + .05 * Math.sin(S.tt * 2)); pz.p.rotation.x = tension ? -.3 : 0; });
      cola.forEach((s, k) => { s.rotation.x = -(tension ? .62 : .42) - (a.estado === 'atacar' && a.fasea === 1 ? .4 * Math.sin(S.tt * 30) : 0) + Math.sin(S.tt * 2 + k) * .03; });
      cuerpo.position.y = Math.sin(S.fase * 2) * .01 * mov;
    }
    return { g, tipo: 'art', actualizar, alto: .5 };
  }

  /* mallas mínimas con los materiales de los animales para compilarlos durante la carga
     (los animales aparecen después y, si no, el primero visible congela la imagen ~0,5 s) */
  function muestras() {
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, .01, 0, .01, 0, 0], 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(new Array(9).fill(1), 3));   // con color: la clave del programa depende de él
    const h = new THREE.Bone(), s = new THREE.SkinnedMesh(geo, material()); s.add(h); s.bind(new THREE.Skeleton([h]));
    const g = new THREE.Group(); g.add(s, new THREE.Mesh(geo, rig())); g.visible = false; return g;
  }
  function crear(E, col) { return E.forma === 'cuad' ? cuadrupedo(E, col) : E.forma === 'ave' ? ave(E) : E.forma === 'tortuga' ? tortuga(E) : artropodo(E); }
  return { crear, muestras, MARCHAS };
})();
