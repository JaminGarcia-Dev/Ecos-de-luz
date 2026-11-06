/* === Ecos de Luz · 33-santuarios.js ===
   Los cuatro santuarios de los fragmentos (separados de 04-estructuras.js): del Pétalo (salón, zorros, faroles
   numerados del reto), de Escarcha (plataforma con espigas de hielo y la puerta de la Cueva de Cristal), de la Duna
   (templo escalonado, pirámides con escalinata y el campamento del oasis) y de la Marea (pabellón sobre el agua, torii y
   perlas); y la losa de la cima de Kiri. Estr.init llama a Santuarios.crear con sus utilidades de obra (ini, fin, bx, cy,
   sol…): la geometría va a las mismas zonas de obra que el resto, y lo que el juego necesita (altares, perlas,
   pirámides, cima) se guarda en Estr. */
"use strict";

/* pirámides escalonadas de las Dunas: gradas (alto th, cada una 2 m más estrecha por lado), cornisa en el borde de cada
   grada, escalinata por la cara que mira al santuario y pedestal del glifo en la cima */
const PIRAMIDE = { gradas: 5, th: 1.3, base: 22, cornisa: .16, escalones: 13, anchoEsc: 3.2, pedestal: .45 };
/* campamento del oasis: en la orilla que mira al faro (toldo, alfombra, vasijas, farol y losas que bajan al agua) */
const CAMPAMENTO = { d: 25, toldo: [3.4, 2.8, 2.5], losas: 4 };

const Santuarios = (() => {
  let G, E, ini, fin, A, Lz, bx, cy, glowBx, techo, sol, solC, K, aMundo, torii, torou, rocaGeo;
  function crear(H) {
    ({ G, E, ini, fin, A, Lz, bx, cy, glowBx, techo, sol, solC, K, aMundo, torii, torou, rocaGeo } = H);
    santuarioPetalo(); santuarioEscarcha(); santuarioDuna(); santuarioMarea(); cimaKiri();
  }
  function santuarioPetalo() {
    const S = sitio('petalo'), y = S.h, ang = Math.atan2(205, 252) + Math.PI; // mira hacia el faro
    const hx = Math.cos(Math.atan2(-S.z, -S.x)), hz = Math.sin(Math.atan2(-S.z, -S.x)); // dirección hacia el faro
    const rot = Math.atan2(hx, hz);
    // salón: basamento con escalinata, galería con baranda, muro de entramado con la puerta de papel al frente, ménsulas,
    // tejado irimoya, caja de ofrendas, cuerda sagrada sobre la puerta y farolillos bajo el alero
    ini(); bx(14, .8, 11, 0x8e8d86, 0, 0, 0, { var: .15, clase: 'piedra' }); bx(14.4, .16, 11.4, 0x9a9992, 0, .66, 0, { clase: 'piedra' }); sol(0, 0, 7, 5.5, 0, .8, { fina: true }); sol(0, 0, 7.2, 5.7, .66, .82, { fina: true }); sol(0, -.3, 6.9, 5.4, .8, .94);
    Arquitectura.escalinata(K, 0, 5.5, 0, .8, 4, 3, 0x8e8d86);
    bx(13.8, .14, 10.8, 0x7a5a3e, 0, .8, -.3, { clase: 'madera' }); Arquitectura.barandal(K, 13.6, 10.6, .94, 0xb7332d, { z: -.3, hueco: 4.2, lados: [0] });
    Arquitectura.barandal(K, 13.6, 10.6, .94, 0xb7332d, { z: -.3, hueco: 3.2, lados: [1, 2, 3] });
    Arquitectura.muro(K, 11, 8, 4.2, { y: .8, z: -.3, poste: 0xb7332d, puertas: [0], luz: 0xffcf8a });
    Arquitectura.mensulas(K, 11, 8, 4.24, 3, 0xb7332d, .85, { z: -.3 });
    bx(11.5, .3, 8.6, 0x3b2a22, 0, 5, -.3, { clase: 'madera' }); sol(0, -.3, 5.75, 4.3, 5, 5.3, { fina: true }); techo(15.5, 12.5, 4, 0x6a3e4a, 0, 5.2, -.3, { hastial: true });
    Arquitectura.saisen(K, 0, .8, 4.95); Arquitectura.shimenawa(K, 4.2, .35, 4.45, 3.95);
    for (const sx of [-1, 1]) Arquitectura.chochin(K, sx * 3.7, 4.3, 5.0, 0xff8a4a);
    sol(0, -.3, 5.67, 4.17, .8, 5, { fina: true }); fin(S.x, y, S.z, rot);
    // Archivo público en la galería exterior: se lee desde la escalinata, sin entrar en el salón sólido.
    // La baranda delantera está en z=5: el atril queda fuera, sobre la cornisa.
    const lx = 2.7, lz = 5.42;
    ini();
    bx(.62, .12, .52, 0x5d3f2d, lx, .8, lz, { clase: 'madera' });
    bx(.14, .64, .14, 0x5d3f2d, lx, .92, lz, { clase: 'madera' });
    bx(.95, .08, .64, 0x6d4933, lx, 1.56, lz, { clase: 'madera', rx: .16 });
    bx(.88, .06, .57, 0x733c32, lx, 1.64, lz, { clase: 'laca', rx: .16 });
    for (const s of [-1, 1]) {
      bx(.39, .035, .5, 0xeee0b7, lx + s * .2, 1.705, lz, { clase: 'enlucido', rx: .16, rz: s * -.08 });
      for (let j = 0; j < 4; j++) bx(.24, .006, .009, 0x715b4a, lx + s * .2, 1.733 - j * .008, lz - .15 + j * .09, { clase: 'madera' });
    }
    sol(lx, lz, .5, .35, .8, 1.8, { fina: true }); fin(S.x, y, S.z, rot);
    const p = aMundo(S.x, S.z, rot, lx, lz), acceso = aMundo(S.x, S.z, rot, 1.5, 6.1);
    const halo = new Halo(0x90e8d4, .4); halo.position.set(p.x, y + 2.05, p.z); halo.scale.set(.7, .7, 1); G.add(halo);
    E.registroPetalo = { ...p, y: y + .8, giro: rot, acceso: { ...acceso, y }, halo };
    // senbon torii hacia el faro
    for (let i = 0; i < 9; i++) { const d = 13 + i * 3.6; torii(S.x + hx * d, S.z + hz * d, rot, 1.1, 0xb7332d); }
    // zorro de piedra
    for (const s of [-1, 1]) { ini(); Arquitectura.zorro(K, s); fin(S.x + hx * 9 - hz * s * 4.2, y, S.z + hz * 9 + hx * s * 4.2, rot); }
    // tres faroles del acertijo
    const num = ['1', '2', '3'];
    for (let i = 0; i < 3; i++) {
      const a = rot + (i - 1) * .85, d = 17, px = S.x + Math.sin(a) * d * 0 + Math.cos(Math.atan2(hz, hx) + (i - 1) * .9) * 14, pz = S.z + Math.sin(Math.atan2(hz, hx) + (i - 1) * .9) * 14;
      ini(); Arquitectura.toro(K, 1.5, 0, true); fin(px, altura(px, pz), pz, 0);
      const py = altura(px, pz);
      const l = new THREE.Mesh(new THREE.CylinderGeometry(.36, .36, .64, 6), new THREE.MeshBasicMaterial({ color: 0x4a4458, fog: false })); l.position.set(px, py + 2.67, pz); G.add(l);
      const et = etiqueta(num[i], { color: '#ffd9a0', ancho: 2.2, tam: 78 }); et.position.set(px, py + 4.4, pz); G.add(et);
      const hl = new Halo(0xffb066, 0); hl.scale.set(7, 7, 1); hl.position.copy(l.position); G.add(hl);
      E.faroles.push({ i, x: px, z: pz, y: py + 1.6, mesh: l, halo: hl, on: false });
    }
    E.altar.petalo = { x: S.x + hx * -2, z: S.z + hz * -2 - 0, y, nom: 'Altar del Pétalo' };
    ini(); Arquitectura.altar(K, 0x8e8d86); fin(S.x + hx * 5.2, y + .8, S.z + hz * 5.2, 0);
    E.altar.petalo = { x: S.x + hx * 5.2, z: S.z + hz * 5.2, y: y + .8 + 2.1, nom: 'Altar del Pétalo' };
    E.npcs.kitsune = { x: S.x + hx * 9 - hz * 4.2, z: S.z + hz * 9 + hx * 4.2 };
  }
  function santuarioEscarcha() {
    const S = sitio('escarcha'), y = S.h;
    // la losa se pisa: columna de 0,78 m (menos de 1,2 m, cuenta como suelo); su borde, 0,58 m sobre la nieve, se sube
    // andando (MOV.paso). Radio 12,2: el canto inclinado (de 12 a 13 m) no se pisa
    ini(); cy(12, 13, .8, 28, 0xaebfd2, 0, 0, 0, { var: .18 }); solC(0, 0, 12.2, 0, .78); fin(S.x, y - .2, S.z, 0);
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * TAU + .2, d = 11, h = 4 + (i % 3) * 2.2; ini();
      const g = new THREE.CylinderGeometry(.2, .9, h, 6, 3); abollar(g, .1, 1, i);
      Lz(pieza(g, 0x9fd8f2, { y: h / 2, var: .1 })); solC(0, 0, .9, 0, h);
      fin(S.x + Math.cos(a) * d, y + .4, S.z + Math.sin(a) * d, 0);
    }
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + Math.PI / 4; ini(); cy(.5, .6, .9, 8, 0x5b6a82, 0, 0, 0); glowBx(.6, .4, .6, 0x66c8ff, 0, .95, 0); solC(0, 0, .6, 0, 1.4); fin(S.x + Math.cos(a) * 6.5, y + .3, S.z + Math.sin(a) * 6.5, 0); }
    ini(); for (const s of [-1, 1]) { cy(.9, 1.1, 8, 8, 0x6b7a92, s * 5.5, 0, 0, { var: .15, clase: 'tallada' }); cy(1.5, 1.6, .5, 8, 0x56637a, s * 5.5, 0, 0, { clase: 'piedra' }); }
    bx(13.4, .75, 1.1, 0x6b7a92, 0, 6.4, 0, { var: .12, clase: 'tallada' }); A(Arquitectura.vigaCurva(16, 1, 2, .9, 0x56637a, 0, 8, 0), 'tallada'); Arquitectura.shimenawa(K, 9, .6, 6.1, .75);
    for (const s of [-1, 1]) { solC(s * 5.5, 0, 1.1, 0, 8, { fina: true }); solC(s * 5.5, 0, 1.6, 0, .5, { fina: true }); }
    sol(0, 0, 6.7, .55, 6.4, 7.15, { fina: true });
    const c = CUEVAS[0], dx = c.dir[0], dz = c.dir[1], gx = c.bx - dx * 3.5, gz = c.bz - dz * 3.5;
    fin(gx, altura(gx, gz) - .3, gz, Math.atan2(dx, dz));   // sobre el suelo delante de la boca (no sobre la ladera de encima)
  }
  function santuarioDuna() {
    const S = sitio('duna'), y = S.h;
    ini(); for (let t = 0; t < 4; t++) { const w = 22 - t * 5, h = 1.5; bx(w, h, w * .8, t % 2 ? 0xdcb77f : 0xcfa56c, 0, t * h, 0, { var: .12 }); sol(0, 0, w / 2, w * .4, t * h, (t + 1) * h, { fina: true }); }
    for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) { cy(.6, .7, 5.5, 10, 0xe6c58f, sx * 8.5, 0, -3 + k * 3.2, { var: .1 }); solC(sx * 8.5, -3 + k * 3.2, .7, 0, 5.5, { fina: true }); } 
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { cy(.3, .36, 3.2, 10, 0xe6c58f, sx * 2.6, 6, sz * 1.9, { clase: 'arenisca' }); solC(sx * 2.6, sz * 1.9, .36, 6, 9.2, { fina: true }); }
    bx(4.2, 3.2, 3, 0xd8b27c, 0, 6, -.2, { clase: 'arenisca' }); glowBx(1.3, 2.2, .08, 0xffc66a, 0, 6, 1.32); bx(1.7, .25, .3, 0xe6c58f, 0, 8.2, 1.36, { clase: 'arenisca' });
    bx(6.2, .4, 4.6, 0xe0bd86, 0, 9.2, 0, { clase: 'arenisca' }); bx(5.4, .35, 3.8, 0xd2aa72, 0, 9.6, 0, { clase: 'arenisca' }); bx(4.4, .3, 2.8, 0xe0bd86, 0, 9.95, 0, { clase: 'arenisca' });
    cy(1.05, 1.05, .2, 24, 0xd9a441, 0, 11.2, -.1, { rx: Math.PI / 2, clase: 'metal' }); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; bx(.1, .55, .08, 0xd9a441, Math.cos(a) * 1.45, 11.03 + Math.sin(a) * 1.45, -.1, { rz: a - Math.PI / 2, clase: 'metal' }); }
    sol(0, 0, 3.1, 2.3, 9.2, 9.6, { fina: true }); sol(0, 0, 2.7, 1.9, 9.6, 9.95, { fina: true }); sol(0, 0, 2.2, 1.4, 9.95, 10.25, { fina: true });
    sol(0, -.2, 2.1, 1.5, 6, 9.2, { fina: true }); Arquitectura.escalinata(K, 0, 2.8, 0, 6, 2.4, 20, 0xcfa56c, .4); fin(S.x, y, S.z, 0);
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + Math.PI / 4; ini(); const h = 7 + (i % 2) * 2; A(pieza(new THREE.CylinderGeometry(.3, 1.1, h, 4), 0xc99a60, { y: h / 2, ry: Math.PI / 4, var: .1 })); Lz(pieza(new THREE.ConeGeometry(.3, .7, 4), 0xffd47a, { y: h + .3, ry: Math.PI / 4 })); solC(0, 0, 1, 0, h); fin(S.x + Math.cos(a) * 16, y, S.z + Math.sin(a) * 16, 0); }
    E.altar.duna = { x: S.x + 4.6, z: S.z + 7.8, y: y + 1.5 + 2.1, nom: 'Altar de la Duna' };
    ini(); Arquitectura.altar(K, 0xcfa56c); fin(S.x + 4.6, y + 1.5, S.z + 7.8, 0);
    // reloj de sol, cabezas de guardianes medio enterradas, toldos sobre las columnas, vasijas junto al altar y una puerta en el camino al faro
    ini(); Arquitectura.relojSol(K); fin(S.x - 7, altura(S.x - 7, S.z + 15), S.z + 15, .3);
    for (const s of [-1, 1]) { const x = S.x + s * 14.5, z = S.z + 11; ini(); Arquitectura.cabezaPiedra(K, 1.3); fin(x, altura(x, z) - .9, z, s * .45); }
    for (const sx of [-1, 1]) { ini(); Arquitectura.toldo(K, 2.4, 8.4, 4.4, sx > 0 ? 0xb5452e : 0x2f5f8a); fin(S.x + sx * 8.5, y + 1.5, S.z + .2, 0); }
    for (const [vx, vz, e] of [[2.9, 7.5, 1.1], [6.3, 7.6, .9], [5.9, 8.4, .7]]) { ini(); Arquitectura.vasija(K, e); fin(S.x + vx, y + 1.5, S.z + vz, vx); }
    { const l = Math.hypot(S.x, S.z), dx = -S.x / l, dz = -S.z / l, x = S.x + dx * 30, z = S.z + dz * 30; ini(); Arquitectura.puertaArenisca(K); fin(x, altura(x, z), z, Math.atan2(dx, dz)); ZONAS_LIBRES.push({ x, z, r: 6 }); }
    // pirámides escalonadas: la escalinata mira al santuario; el glifo flota sobre un pedestal en la cima
    E.piramides = [];
    ['pir1', 'pir2', 'pir3'].forEach(id => {
      const P = sitio(id), Q = PIRAMIDE, alto = Q.gradas * Q.th, cima = Q.base / 2 - (Q.gradas - 1) * 2; ini();
      for (let t = 0; t < Q.gradas; t++) {
        const w = Q.base - t * 4, h = t === 0 ? Q.th + 5 : Q.th, yy = t === 0 ? -5 : t * Q.th, c = t % 2 ? 0xe0bd86 : 0xd2aa72;
        bx(w, h - Q.cornisa, w, c, 0, yy, 0, { var: .1, ao: .1, clase: 'arenisca' }); bx(w + .3, Q.cornisa, w + .3, new THREE.Color(c).multiplyScalar(.82).getHex(), 0, yy + h - Q.cornisa, 0, { clase: 'arenisca' });
        sol(0, 0, w / 2, w / 2, yy, yy + h, { fina: true }); sol(0, 0, w / 2 + .15, w / 2 + .15, yy + h - Q.cornisa, yy + h, { fina: true });
      }
      // la escalinata pasa por los bordes de las gradas: llega al suelo 2 m fuera de la base
      Arquitectura.escalinata(K, 0, cima, 0, alto, Q.anchoEsc, Q.escalones, 0xcfa56c, (Q.base / 2 + 2 - cima) / Q.escalones);
      const ry = Math.atan2(sitio('duna').x - P.x, sitio('duna').z - P.z); fin(P.x, P.h, P.z, ry);
      for (const s of [-1, 1]) { const p = aMundo(P.x, P.z, ry, s * (cima - .7), cima - .7); ini(); Arquitectura.toro(K, .7); fin(p.x, P.h + alto, p.z, ry); }   // faroles a los lados de la escalinata
      E.piramides.push({ x: P.x, z: P.z, top: P.h + alto });
      ini(); cy(.42, .5, Q.pedestal, 8, 0xe9c779, 0, 0, 0, { clase: 'tallada' }); cy(.55, .55, .1, 8, 0xd2aa72, 0, Q.pedestal, 0, { clase: 'tallada' }); solC(0, 0, .5, 0, Q.pedestal); solC(0, 0, .55, Q.pedestal, Q.pedestal + .1); fin(P.x + .8, P.h + alto, P.z, 0);
    });
    campamentoOasis();
  }
  function campamentoOasis() {
    const C = CAMPAMENTO, l = Math.hypot(OASIS.x, OASIS.z), ux = -OASIS.x / l, uz = -OASIS.z / l, x = OASIS.x + ux * C.d, z = OASIS.z + uz * C.d, ry = Math.atan2(-ux, -uz), y = altura(x, z);
    ini(); const [w, d, h] = C.toldo;
    Arquitectura.toldo(K, w, d, h, 0xb5452e); bx(w - .6, .03, d - .6, 0x8a3a2a, 0, .02, 0, { clase: 'tela' }); bx(w - 1.2, .035, d - 1.2, 0xd9a441, 0, .03, 0, { clase: 'tela' });
    for (const s of [-1, 1]) cy(.18, .2, 1.6, 7, 0x6b4a32, s * .9, .2, -d / 2 - .7, { clase: 'madera', rz: Math.PI / 2 });   // troncos de palmera como banco
    fin(x, y, z, ry);
    for (const [vx, vz, e] of [[1.9, -1, 1], [2.3, -.3, .75], [-1.9, 1.1, .85]]) { const p = aMundo(x, z, ry, vx, vz); ini(); Arquitectura.vasija(K, e); fin(p.x, altura(p.x, p.z), p.z, vx); }
    // losas que bajan hasta el agua, hacia el centro del oasis
    for (let i = 0; i < C.losas; i++) { const k = C.d - 3.2 - i * 1.6, lx = OASIS.x + ux * k, lz = OASIS.z + uz * k, ly = Math.max(NIVEL_AGUA - .15, altura(lx, lz)); ini(); bx(1.6, .45, 1.2, 0xcfb08a, 0, -.32, 0, { clase: 'arenisca' }); sol(0, 0, .8, .6, -.4, .13); fin(lx, ly, lz, ry + i * .12); }
    const fx = x + uz * 3.2, fz = z - ux * 3.2; torou(fx, fz, .8);
    ZONAS_LIBRES.push({ x, z, r: 5.5, rHierba: 3 });
  }
  function santuarioMarea() {
    const cx = -246, cz = 232, y0 = 1.9;
    ini(); bx(12, .5, 12, 0x6e4e36, 0, 0, 0, { var: .15 }); sol(0, 0, 6, 6, -.5, .5);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { cy(.3, .3, 9, 8, 0x5a3b26, sx * 5.5, -8, sz * 5.5); solC(sx * 5.5, sz * 5.5, .3, -8, 1, { fina: true }); }
    Arquitectura.muro(K, 8.4, 8.4, 3.2, { y: .5, poste: 0xb7332d, puertas: [1, 2], luz: 0x9ff3e4, muro: 0xf0e6d0 });
    Arquitectura.barandal(K, 11.7, 11.7, .5, 0xb7332d, { lados: [0, 3] }); Arquitectura.mensulas(K, 8.4, 8.4, 3.08, 3, 0xb7332d, .7);
    bx(9, .25, 9, 0x3b2a22, 0, 3.7, 0, { clase: 'madera' }); sol(0, 0, 4.5, 4.5, 3.7, 3.95, { fina: true }); techo(13, 13, 3, 0x2f4f66, 0, 3.9, 0); A(pieza(new THREE.SphereGeometry(.4, 8, 6), 0xd9a441, { y: 7.2 }), 'metal');
    sol(0, 0, 4.3, 4.3, .5, 4, { fina: true });
    fin(cx, y0, cz, 0);
    // pasarela hacia la orilla, en dirección al faro
    let dx = 246, dz = -232, L = Math.hypot(dx, dz); dx /= L; dz /= L; let py = y0; const rot = Math.atan2(dx, dz);
    for (let d = 8; d < 90; d += 3) {
      const x = cx + dx * d, z = cz + dz * d, h = altura(x, z); if (h > py + .1 && d > 20) break;
      py = clamp(Math.max(1.5, h + .1), py - .5, py + .5);
      ini(); bx(2.4, .3, 3.2, 0x7a5a3e, 0, -.3, 0, { var: .15 }); sol(0, 0, 1.2, 1.6, -.4, 0); for (const s of [-1, 1]) { bx(.14, 1, .14, 0x4a3226, s * 1.15, 0, 0); sol(s * 1.15, 0, .07, .07, 0, 1, { fina: true }); } fin(x, py, z, rot);
      if (Math.floor(d / 3) % 3 === 0) { ini(); for (const s of [-1, 1]) { cy(.12, .12, 6, 6, 0x5a3b26, s, -5.7, 0); solC(s, 0, .12, -5.7, .3, { fina: true }); } fin(x, py, z, rot); }
    }
    // un torii dentro del agua que cruza la pasarela, faroles sobre rocas, nenúfares y campanillas bajo el alero
    { const x = cx + dx * 15, z = cz + dz * 15; ini(); Arquitectura.torii(K, 1.8, 0xb7332d); fin(x, altura(x, z), z, rot); }
    let semilla = 11; const r = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
    for (const a of [.6, 2.2, 3.9, 5.3]) {
      const x = cx + Math.cos(a) * 10, z = cz + Math.sin(a) * 10; if (altura(x, z) > -.3) continue;
      ini(); A(pieza(abollar(icoSuave(1, 2), .15, 1, a * 7), 0x6e6d70, { y: -.25, sx: 1.4, sy: .9, sz: 1.2, var: .15 }), 'roca'); Arquitectura.toro(K, .7); fin(x, NIVEL_AGUA + .4, z, a);
    }
    for (let k = 0, n = 0; k < 80 && n < 26; k++) {
      const a = r() * TAU, d = 7 + r() * 16, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (altura(x, z) > -.25) continue;
      ini(); Arquitectura.nenufar(K, n % 3 === 0); fin(x, NIVEL_AGUA + .06, z, r() * TAU); n++;
    }
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + Math.PI / 4, e = k % 2 ? 6.2 : 8.6; ini(); Arquitectura.campanilla(K, .45 + (k % 3) * .1); fin(cx + Math.cos(a) * e * .72, y0 + 3.85, cz + Math.sin(a) * e * .72, 0); }
    E.altar.marea = { x: cx, z: cz, y: y0 + .5 + 1.6, nom: 'Altar de la Marea' };
    ini(); Arquitectura.altar(K, 0x9db7b0); fin(cx, y0 + .5, cz, 0);
    ZONAS_LIBRES.push({ x: cx, z: cz, r: 36 });
    E.perlas = [[-262, 244], [-232, 246], [-270, 222], [-226, 224], [-246, 204]].map(p => ({ x: p[0], z: p[1] }));
  }
  function cimaKiri() {
    const C = CIMA_KIRI; let cx = C.x, cz = C.z, h = altura(cx, cz);
    for (let dx = -C.busca; dx <= C.busca; dx += .5) for (let dz = -C.busca; dz <= C.busca; dz += .5) { const a = altura(C.x + dx, C.z + dz); if (a > h) { h = a; cx = C.x + dx; cz = C.z + dz; } }
    // corona de roca natural (abollada, del color de la aguja) con una losa encima
    ini(); rocaGeo(abollar(new THREE.CylinderGeometry(C.losa + .3, .3, C.hondo, 9, 4), .2, 1.1, 77), 0x9a8f80, { y: -C.hondo / 2 + .3 }); cy(C.losa, C.losa + .05, .18, 9, 0x8e9098, 0, .3, 0, { clase: 'piedra' });
    solC(0, 0, C.losa, .3, .48); solC(0, 0, C.losa * .8, -C.hondo, .3);   // la losa se pisa (un sólido alto no cuenta como suelo); debajo, la roca
    const ry = Math.atan2(-cx, -cz); fin(cx, h, cz, ry);   // el santuario mira al faro
    E.cima = { x: cx, y: h + .48, z: cz };
    const p = aMundo(cx, cz, ry, 0, -1); ini(); Arquitectura.hokora(K); fin(p.x, h + .48, p.z, ry);
    for (let i = 0; i < 3; i++) { const q = aMundo(cx, cz, ry, 1.5, .6); ini(); rocaGeo(abollar(icoSuave(1, 1), .1, 1.2, 30 + i), 0x8a8c92, { y: .2 + i * .42, sx: .55 - i * .12, sy: .3, sz: .5 - i * .1, ry: i }); fin(q.x, h + .48, q.z, 0); }
    const f = aMundo(cx, cz, ry, -1.6, .7); ini(); Arquitectura.toro(K, .55); fin(f.x, h + .48, f.z, ry);
  }
  return { crear };
})();
