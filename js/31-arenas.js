/* === Ecos de Luz · 31-arenas.js ===
   Arenas de los gólems y sus objetos, separados de 11-jefes.js (que lleva fichas, estados, IA y daño):
   · la obra de cada arena (anillo de rocas, pilares, altar, fogatas, columnas, plataformas y árboles secos),
   · las linternas de punto de luz, las balizas de Escarcha y los objetos que despiertan a cada gólem,
   · y su animación por fotograma (objetos que flotan, fogatas y la linterna del punto de luz activo).
   Recibe de Jefes sus listas y utilidades (K), como los ataques de 23-ataques-golem.js. */
"use strict";

/* arena del Gólem de Marea: estanque con bordillo, nenúfares y juncos; plataformas con peldaño y farol (el diluvio
   obliga a subir a ellas: su alto lo comprueba 11-jefes.js); camino de piedras y torii en la entrada */
const ARENA_MAREA = {
  estanque: 5, bordillo: 16, nenufares: 6, juncos: 9, pasos: 6,
  plataforma: { r: 14, lado: 3.6, alto: 1.3, peldaño: 4.8, altoPeldaño: .55, farol: .62 },
  torii: { esc: 1.25, r: R_ARENA + 2.5, color: 0xb7332d }
};
/* arena del Gólem de Arena: columnas de los glifos con capitel (el glifo va encima, a 2,95 m), puerta de arenisca en la
   entrada y, fuera del anillo, ruinas: tambores de columna (alguno caído), lienzos de muro y cabezas de guardián */
const ARENA_SOL = { columna: 2.3, capitel: .3, puerta: R_ARENA + 2.5, ruinas: 9, rRuinas: R_ARENA + 6 };
/* arena del Gólem de Escarcha: fogatas con anillo de piedras y leña, torii de piedra con cuerda sagrada en la entrada,
   espigas de hielo que brillan fuera del anillo y mojones de piedras */
const ARENA_ESCARCHA = { espigas: 7, rEspigas: R_ARENA + 5, mojones: 4, torii: { esc: 1.2, r: R_ARENA + 2.5, color: 0x8a8f99 } };
/* anillo de rocas de cada arena (por defecto, roca gris) */
const ANILLO_ARENA = { arena: { color: 0xc99a60, clase: 'arenisca' } };
/* piedras junto a la subida del Mirador; se conservan p0–p2 para las partidas ya empezadas */
const PIEDRAS_MUSGOSO = { anclas: [[64, 12], [70, 23], [76, 39]], busca: 3, margen: .65, pendiente: .65, camino: 35 };
const RAMAL_MUSGOSO = { via: [[84, -8], [67, 16], [54, 39], [38, 42]], ancho: .8, veta: .055, paso: 1.2, fundido: 1.2, pulso: 2.4, alzaAltar: 1.1, bajaAltar: 3 };
/* distancia hacia la entrada y desvío lateral (m); el ancla de lectura queda delante, fuera de su sólido */
const PISTAS_GUARDIAN = { cerezo: [20, 4], marea: [5.85, 0], arena: [20, 4], musgoso: [20, 4], escarcha: [31, 4] };
// Se reserva también el margen de búsqueda antes de que Flora construya sus trozos.
for (const [x, z] of PIEDRAS_MUSGOSO.anclas) ZONAS_LIBRES.push({ x, z, r: 7, rHierba: 2 });

function ArenasGolem(K) {
  const { RECS, PK, LUCES, st, dirE, std, mesh, halo, bloque, encender } = K;
  const ramales = [];
  // Estr también anima durante las escenas; el reloj del mundo se detiene con la pausa.
  let tRamal = U.uT.value;
  Estr.tickers.push(t => { actualizarRamales(Math.max(0, t - tRamal)); tRamal = t; });
  function vestir(B) {
    const A = B.A, id = B.id, g = new THREE.Group(), y = A.y, de = dirE(id), ang0 = Math.atan2(de.x, de.z);
    scene.add(g); B.deco = g; B.pilares = []; B.slots = []; B.plataformas = [];
    const enAng = (a, r) => ({ x: A.x + Math.sin(a) * r, z: A.z + Math.cos(a) * r });
    // obra estática de la arena (una sola malla con el material de obra de 24-arquitectura.js)
    // es estática: su sombra se guarda con la del resto de la obra (capa estática) en vez de dibujarse en cada fotograma
    // Las piezas con sólido propio también chocan.
    const obra = Arquitectura.construir(k => { obraArena(B, k, enAng, ang0); pistaArena(B, k, ang0); }); g.add(obra.g); Arquitectura.ponerSolidos(obra);
    obra.g.traverse(o => { if (o.isMesh && o.castShadow) o.layers.set(CAPAS.estatica); }); Bus.emit('sombraEstatica');
    if (id === 'musgoso') {
      for (let k = 0; k < 4; k++) { const p = enAng(ang0 + Math.PI / 4 + k * Math.PI / 2, 12); Sol.col(p.x, p.z, 1.3, y - 1, y + 5.5); B.pilares.push({ x: p.x, z: p.z, r: 1.3 }); }
      const al = enAng(ang0, R_ARENA - 6); Sol.add(al.x, al.z, 1.3, .8, ang0, y, y + 1).fina = true; Sol.add(al.x, al.z, 1.45, .95, ang0, y + 1, y + 1.18).fina = true;
      B.altar = { x: al.x, z: al.z, gemas: [] };
      for (let k = 0; k < 3; k++) { const ge = mesh(new THREE.OctahedronGeometry(.24), new THREE.MeshBasicMaterial({ color: 0x3a4a30 }), al.x + Math.cos(ang0) * (k - 1) * .75, y + 1.2, al.z - Math.sin(ang0) * (k - 1) * .75); g.add(ge); B.altar.gemas.push(ge); }
      crearRamalMusgoso(B);
    }
    if (id === 'escarcha') {
      const Q = ARENA_ESCARCHA;
      for (let i = 0; i < Q.espigas; i++) { const p = enAng(ang0 + .6 + i / (Q.espigas - 1) * (TAU - 1.2), Q.rEspigas); Sol.col(p.x, p.z, .8, y - 1, y + 4); }
    }
    if (id === 'escarcha') {   // mojones de piedras (sólidos; la obra está en obraArena)
      const Q = ARENA_ESCARCHA; for (let i = 0; i < Q.mojones; i++) { const p = enAng(ang0 + 1.1 + i * 1.35, R_ARENA + 3.5); Sol.col(p.x, p.z, .5, y - 1, y + 1.3); }
    }
    if (id === 'escarcha') for (let k = 0; k < 4; k++) {
      const p = enAng(ang0 + Math.PI / 4 + k * Math.PI / 2, 15);
      // la fogata no se pisa (más alta que un paso); el montón de leña de al lado, sí
      Sol.col(p.x, p.z, 1.2, y - .5, y + .9).fina = true; const l = enAng(ang0 + Math.PI / 4 + k * Math.PI / 2 + .14, 17.3); Sol.col(l.x, l.z, .7, y - .3, y + .4);
      const ll = halo(0xff9a3a, 3.4, 0); ll.position.set(p.x, y + 1.3, p.z); g.add(ll);
      RECS.push({ tipo: 'fogata', jefe: 'escarcha', x: p.x, y: y + 1, z: p.z, r: 1.4, lit: 0, carga: 0, halo: ll });
    }
    // ruinas fuera del anillo (mismo reparto que en obraArena): columnas, muros y tambores caídos
    if (id === 'arena') for (let i = 0; i < ARENA_SOL.ruinas; i++) {
      const S = ARENA_SOL, a = ang0 + .7 + i / (S.ruinas - 1) * (TAU - 1.4), p = enAng(a, S.rRuinas + (i % 3) * 1.6), t = i % 3;
      if (t === 0) { Sol.col(p.x, p.z, .8, y - 1, y - .2 + 1.4 + (i % 4) * .8).fina = true; Sol.col(p.x, p.z, .95, y - .2, y + .05).fina = true; }
      else if (t === 1) Sol.add(p.x, p.z, 2.1, .4, a, y - 1, y - .3 + 1.2 + (i % 2) * .7).fina = true;
      else Sol.add(p.x, p.z, 1.7, .66, a, y - 1, y + 1.11);
    }
    if (id === 'arena') for (let k = 0; k < 3; k++) {
      const p = enAng(ang0 + Math.PI / 3 + k * TAU / 3, 13);
      const gl = mesh(new THREE.BoxGeometry(.75, .75, .14), new THREE.MeshBasicMaterial({ color: 0x5a4a30 }), p.x, y + 2.95, p.z); g.add(gl); const h = halo(0xffc94a, 3, 0); h.position.set(p.x, y + 3, p.z); g.add(h);
      Sol.col(p.x, p.z, 1.3, y, y + .3).fina = true; Sol.col(p.x, p.z, 1.12, y + .3, y + 2.3).fina = true; Sol.col(p.x, p.z, 1.3, y + 2.3, y + 2.6).fina = true; B.slots.push({ i: k, x: p.x, z: p.z, gl, h });
    }
    if (id === 'marea') {
      g.add(mesh(new THREE.CircleGeometry(5, 32).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x2fa8a0, transparent: true, opacity: .85, roughness: .1, emissive: 0x0f5a50, emissiveIntensity: .45 }), A.x, y + .06, A.z));
      B.estanque = { x: A.x, z: A.z };
      const P = ARENA_MAREA.plataforma;
      for (let k = 0; k < 4; k++) {
        const a = ang0 + Math.PI / 4 + k * Math.PI / 2, p = enAng(a, P.r);
        Sol.add(p.x, p.z, P.lado / 2, P.lado / 2, a, y - 1, y + P.alto); Sol.add(p.x, p.z, (P.lado + .16) / 2, (P.lado + .16) / 2, a, y + P.alto - .16, y + P.alto); Sol.add(p.x, p.z, P.peldaño / 2, P.peldaño / 2, a, y - 1, y + P.altoPeldaño);
        B.plataformas.push(p);
      }
      // rocas de musgo junto al bordillo del estanque: bajas, se pisan
      for (let i = 0; i < 3; i++) { const a = ang0 + 1.2 + i * 1.9, d = ARENA_MAREA.estanque + .75; Sol.col(A.x + Math.sin(a) * d, A.z + Math.cos(a) * d, .55, y - .3, y + .55); }
      const agua = mesh(new THREE.CircleGeometry(R_ARENA, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x2fbf9f, transparent: true, opacity: .62, roughness: .1, emissive: 0x0f5a50, emissiveIntensity: .35, depthWrite: false }), A.x, y - .5, A.z);
      agua.castShadow = false; agua.visible = false; g.add(agua); B.diluvioMesh = agua;
    }
    if (id === 'cerezo') for (let k = 0; k < 3; k++) {
      const p = enAng(ang0 + Math.PI / 3 + k * TAU / 3, 14);
      const flor = new THREE.Group(), fm = std(0xf6a8c8, { emissive: 0x7a2a4a, emissiveIntensity: .2 });
      for (let j = 0; j < 6; j++) { const f = bloque('roca', 1.5, 1, 1.5, fm, 140 + j + k * 6); f.position.set(p.x + Math.cos(j) * 1.1, y + 4.3 + (j % 2) * .5, p.z + Math.sin(j) * 1.1); flor.add(f); }
      flor.visible = false; g.add(flor); Sol.col(p.x, p.z, .55, y - 1, y + 4.2); B.slots.push({ i: k, x: p.x, z: p.z, flor });
    }
  }
  function pistaArena(B, k, giro) {
    const [d, lado] = PISTAS_GUARDIAN[B.id], dx = Math.sin(giro), dz = Math.cos(giro);
    const x = B.A.x + dx * d + dz * lado, z = B.A.z + dz * d - dx * lado, y = altura(x, z), m = k.marca();
    Arquitectura.pistaGuardian(k, B.id); k.mover(m, x, y, z, giro);
    if (!Estr.pistasGuardian) Estr.pistasGuardian = {};
    const px = x + dx * 2.2, pz = z + dz * 2.2;
    Estr.pistasGuardian[B.id] = { x: px, y: altura(px, pz), z: pz, obra: { x, y, z, giro } };
  }
  /* cinta oscura y tres vetas sobre el terreno: dos mallas sin sombra, daño ni colisión */
  function crearRamalMusgoso(B) {
    B.ramalSello = null;
    if (st('musgoso').der) return;
    const C = RAMAL_MUSGOSO, nodos = [[B.altar.x, B.altar.z], ...C.via], muestras = [];
    for (let i = 0; i < nodos.length - 1; i++) {
      const a = nodos[i], b = nodos[i + 1], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / C.paso);
      for (let j = 0; j < n; j++) muestras.push([lerp(a[0], b[0], j / n), lerp(a[1], b[1], j / n)]);
    }
    muestras.push(nodos[nodos.length - 1]);
    const cinta = [], vetas = [];
    const tira = (out, a, b, lado, ancho, alza) => {
      const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), nx = -dz / l, nz = dx / l, p = [];
      for (const q of [a, b]) for (const s of [-1, 1]) {
        const x = q[0] + nx * (lado + s * ancho / 2), z = q[1] + nz * (lado + s * ancho / 2);
        const salida = C.alzaAltar * Math.max(0, 1 - Math.hypot(x - B.altar.x, z - B.altar.z) / C.bajaAltar);
        p.push([x, altura(x, z) + alza + salida, z]);
      }
      for (const i of [0, 2, 1, 1, 2, 3]) out.push(...p[i]);
    };
    for (let i = 0; i < muestras.length - 1; i++) {
      const a = muestras[i], b = muestras[i + 1];
      tira(cinta, a, b, 0, C.ancho, .16);
      for (const s of [-1, 0, 1]) tira(vetas, a, b, s * .25, C.veta, .18);
    }
    const g = new THREE.Group(), mallas = [];
    for (const [p, color, opacidad, aditiva] of [[cinta, 0x241225, .78, false], [vetas, 0xa44b45, .7, true]]) {
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.computeBoundingSphere();
      const mat = new THREE.MeshBasicMaterial({ color: lin(color).multiplyScalar(aditiva ? 2 : 1), transparent: true, opacity: opacidad, depthWrite: false, side: THREE.DoubleSide, blending: aditiva ? THREE.AdditiveBlending : THREE.NormalBlending });
      const m = new THREE.Mesh(geo, mat); m.renderOrder = aditiva ? 2 : 1; g.add(m); mallas.push({ m, opacidad });
    }
    B.deco.add(g); B.ramalSello = { g, mallas, apagando: false, t: 0 };
    ramales.push(B);
  }
  function actualizarRamales(dt) {
    for (let i = ramales.length - 1; i >= 0; i--) {
      const B = ramales[i], r = B.ramalSello, C = RAMAL_MUSGOSO;
      if (st('musgoso').der) r.apagando = true;
      if (r.apagando) r.t = Math.min(C.fundido, r.t + dt);
      const k = 1 - r.t / C.fundido, pulso = .83 + .17 * Math.sin(U.uT.value * TAU / C.pulso);
      r.mallas.forEach(({ m, opacidad }) => { m.material.opacity = opacidad * k * pulso; });
      if (r.t >= C.fundido) {
        B.deco.remove(r.g); r.mallas.forEach(({ m }) => { m.geometry.dispose(); m.material.dispose(); }); B.ramalSello = null; ramales.splice(i, 1);
      }
    }
  }
  /* obra estática de cada arena: anillo de rocas, pilares, altar, fogatas, columnas, plataformas y árboles secos */
  function obraArena(B, k, enAng, ang0) {
    const A = B.A, id = B.id, y = A.y;
    const an = ANILLO_ARENA[id] || { color: 0x8f8e88, clase: 'roca' };
    for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; if (Math.cos(a - ang0) > .94) continue; const p = enAng(a, R_ARENA + 1.5); k.roca(1.7, 1.2 + (i % 3) * .5, 1.5, an.color, p.x, y + .35, p.z, 90 + i, an.clase, a); }
    if (id === 'musgoso') {
      for (let i = 0; i < 4; i++) { const p = enAng(ang0 + Math.PI / 4 + i * Math.PI / 2, 12); k.cy(1.1, 1.35, 5.5, 10, 0x8f8e88, p.x, y, p.z, { clase: 'piedra' }); k.roca(2.5, .6, 2.5, 0x6f9a4a, p.x, y + 5.6, p.z, 100 + i, 'roca'); k.cy(1.45, 1.5, .3, 10, 0x7d7c76, p.x, y, p.z, { clase: 'piedra' }); }
      const al = enAng(ang0, R_ARENA - 6); k.bx(2.6, 1, 1.6, 0x5a5550, al.x, y, al.z, { clase: 'piedra', ry: ang0 }); k.bx(2.9, .18, 1.9, 0x4a4844, al.x, y + 1, al.z, { clase: 'piedra', ry: ang0 });
    }
    if (id === 'escarcha') {
      const Q = ARENA_ESCARCHA, T = Q.torii;
      // fogatas: losa, anillo de piedras, leña cruzada y un montón de leña al lado
      for (let i = 0; i < 4; i++) {
        const a = ang0 + Math.PI / 4 + i * Math.PI / 2, p = enAng(a, 15); k.cy(1.3, 1.4, .15, 9, 0x7d7c76, p.x, y - .05, p.z, { clase: 'piedra' });
        for (let j = 0; j < 8; j++) { const b = j / 8 * TAU; k.roca(.5, .35, .45, 0x8f8e88, p.x + Math.cos(b) * .95, y + .2, p.z + Math.sin(b) * .95, 170 + j + i * 8, 'roca', b); }
        for (let j = 0; j < 2; j++) k.A(pieza(new THREE.CylinderGeometry(.14, .14, 1.6, 6), 0x5a3a22, { x: p.x, y: y + .42, z: p.z, rx: Math.PI / 2, rz: j * Math.PI / 2 }), 'madera');
        const l = enAng(a + .14, 17.3);
        for (let j = 0; j < 3; j++) k.A(pieza(new THREE.CylinderGeometry(.13, .13, 1.4, 6), 0x5e4028, { x: l.x, y: y + .14 + (j === 2 ? .24 : 0), z: l.z, rz: Math.PI / 2, ry: a, var: .15 }), 'madera');
      }
      { const p = enAng(ang0, T.r), m = k.marca(); Arquitectura.torii(k, T.esc, T.color); Arquitectura.shimenawa(k, 3.4 * T.esc, .3, 4.6 * T.esc - 1.35 * T.esc, 0); k.mover(m, p.x, y - .05, p.z, ang0); }
      // espigas de hielo (brillan) y mojones de piedras fuera del anillo; la entrada queda libre
      for (let i = 0; i < Q.espigas; i++) {
        const p = enAng(ang0 + .6 + i / (Q.espigas - 1) * (TAU - 1.2), Q.rEspigas), h = 3 + (i % 3) * 1.4, g = new THREE.CylinderGeometry(.2, .85, h, 6, 3); abollar(g, .1, 1, 60 + i);
        k.Lz(pieza(g, 0x9fd8f2, { x: p.x, y: y + h / 2 - .2, z: p.z, var: .1 }));
      }
      for (let i = 0; i < Q.mojones; i++) { const p = enAng(ang0 + 1.1 + i * 1.35, R_ARENA + 3.5); for (let j = 0; j < 3; j++) k.roca(.9 - j * .22, .45, .8 - j * .2, 0x8a8c92, p.x, y + .2 + j * .4, p.z, 190 + i * 3 + j, 'roca', j); }
    }
    if (id === 'arena') {
      const S = ARENA_SOL;
      for (let i = 0; i < 3; i++) {
        const p = enAng(ang0 + Math.PI / 3 + i * TAU / 3, 13);
        k.cy(1.25, 1.3, .3, 12, 0xd9c49a, p.x, y, p.z, { clase: 'arenisca' }); k.cy(1.0, 1.12, S.columna, 12, 0xe2cfa6, p.x, y, p.z, { clase: 'arenisca' });
        k.cy(.98, .98, .14, 12, 0xc9a978, p.x, y + S.columna * .62, p.z, { clase: 'arenisca' });   // anillo tallado
        k.cy(1.3, 1.02, S.capitel, 12, 0xd9c49a, p.x, y + S.columna, p.z, { clase: 'arenisca' });
        k.roca(1.2, .6, 1.1, 0xe2cfa6, p.x + .9, y + .3, p.z + .6, 120 + i, 'arenisca');
      }
      { const p = enAng(ang0, S.puerta), m = k.marca(); Arquitectura.puertaArenisca(k); k.mover(m, p.x, y - .1, p.z, ang0); }
      // ruinas fuera del anillo (la entrada queda libre)
      for (let i = 0; i < S.ruinas; i++) {
        const a = ang0 + .7 + i / (S.ruinas - 1) * (TAU - 1.4), r = S.rRuinas + (i % 3) * 1.6, p = enAng(a, r), t = i % 3;
        if (t === 0) { const h = 1.4 + (i % 4) * .8; k.cy(.7, .78, h, 10, 0xe2cfa6, p.x, y - .2, p.z, { clase: 'arenisca' }); k.cy(.95, .95, .25, 10, 0xd9c49a, p.x, y - .2, p.z, { clase: 'arenisca' }); }
        else if (t === 1) { k.bx(4.2, 1.2 + (i % 2) * .7, .8, 0xd8b27c, p.x, y - .3, p.z, { clase: 'arenisca', ry: a, var: .14 }); k.roca(1, .5, .8, 0xd8b27c, p.x + Math.sin(a) * 1.2, y + .1, p.z + Math.cos(a) * 1.2, 150 + i, 'arenisca'); }
        else { const h = 3.4; k.cy(.66, .66, h, 10, 0xe2cfa6, p.x, y, p.z, { clase: 'arenisca', rz: Math.PI / 2, ry: a, y: y + .45 });   /* tambor caído */ }
      }
      for (const s of [-1, 1]) { const p = enAng(ang0 + s * 2.2, S.rRuinas + 1), m = k.marca(); Arquitectura.cabezaPiedra(k, 1.1); k.mover(m, p.x, y - .7, p.z, ang0 + s * 2.2 + Math.PI); }
    }
    if (id === 'marea') {
      const M = ARENA_MAREA, P = M.plataforma, T = M.torii, rb = M.estanque + .35;
      // bordillo de sillares alrededor del estanque, con alguna roca de musgo
      for (let i = 0; i < M.bordillo; i++) { const a = (i + .5) / M.bordillo * TAU; k.bx(TAU * rb / M.bordillo - .08, .32, .7, 0x8a8984, A.x + Math.sin(a) * rb, y - .1, A.z + Math.cos(a) * rb, { clase: 'piedra', ry: a, var: .12 }); }
      for (let i = 0; i < 3; i++) { const a = ang0 + 1.2 + i * 1.9; k.roca(1.2, .7, 1, 0x6f8a5a, A.x + Math.sin(a) * (rb + .4), y + .2, A.z + Math.cos(a) * (rb + .4), 130 + i, 'roca', a); }
      // nenúfares sobre el agua (el centro queda libre: de ahí sale el gólem)
      for (let i = 0; i < M.nenufares; i++) { const a = i / M.nenufares * TAU + .4, d = 3.1 + (i % 3) * .5, m = k.marca(); Arquitectura.nenufar(k, i % 2 === 0); k.mover(m, A.x + Math.sin(a) * d, y + .08, A.z + Math.cos(a) * d); }
      // juncos en matas junto al bordillo
      for (let i = 0; i < M.juncos; i++) {
        const a = ang0 + .5 + i / M.juncos * (TAU - 1), d = rb + .75, cx = A.x + Math.sin(a) * d, cz = A.z + Math.cos(a) * d;
        for (let j = 0; j < 6; j++) { const b = j * 2.4 + i, l = .9 + (j % 3) * .3; k.A(pieza(new THREE.ConeGeometry(.035, l, 4), j % 2 ? 0x5f7f3a : 0x7a8a46, { x: cx + Math.cos(b) * .2, y: y + l / 2 - .05, z: cz + Math.sin(b) * .2, rx: Math.sin(b) * .2, rz: Math.cos(b) * .2 }), 'tela'); }
      }
      // plataformas de sillería: peldaño, cuerpo, losa con canto y un farol de piedra en la esquina de fuera
      for (let i = 0; i < 4; i++) {
        const a = ang0 + Math.PI / 4 + i * Math.PI / 2, p = enAng(a, P.r), f = enAng(a, P.r + P.lado / 2 - .45);
        k.bx(P.peldaño, P.altoPeldaño + .2, P.peldaño, 0x7d7c76, p.x, y - .2, p.z, { clase: 'piedra', ry: a, ao: .3 });
        k.bx(P.lado - .1, P.alto - .16, P.lado - .1, 0x8f8e88, p.x, y, p.z, { clase: 'piedra', ry: a });
        k.bx(P.lado + .16, .16, P.lado + .16, 0x9a9992, p.x, y + P.alto - .16, p.z, { clase: 'piedra', ry: a });
        const m = k.marca(); Arquitectura.toro(k, P.farol); k.mover(m, f.x, y + P.alto, f.z, a);
      }
      // camino de piedras desde la entrada hasta el estanque y torii en la boca del anillo
      for (let i = 0; i < M.pasos; i++) { const d = rb + 2.6 + i * (T.r - rb - 4) / (M.pasos - 1), p = enAng(ang0 + (i % 2 ? .05 : -.05), d); k.cy(.62, .7, .14, 9, 0x8a8984, p.x, y - .04, p.z, { clase: 'piedra', ry: i }); }
      { const p = enAng(ang0, T.r), m = k.marca(); Arquitectura.torii(k, T.esc, T.color); k.mover(m, p.x, y - .05, p.z, ang0); }
    }
    if (id === 'cerezo') for (let i = 0; i < 3; i++) {
      const p = enAng(ang0 + Math.PI / 3 + i * TAU / 3, 14);
      // cerezo marchito: la obra suelta se arma en el origen; se desplaza a su sitio al terminar
      const m = k.marca(); Arquitectura.arbolSeco(k, 7.5, 160 + i * 7); k.mover(m, p.x, y, p.z);
    }
  }
  function crearLinterna(id, x, z) {
    const h0 = altura(x, z); if (h0 < .6) return; const y = Math.max(h0, Sol.suelo(x, z, h0 + 1.5)), g = Arquitectura.linterna().g; g.position.set(x, y, z); scene.add(g);
    Sol.add(x, z, .36, .36, 0, y, y + .26).fina = true; Sol.col(x, z, .11, y + .26, y + 1.62).fina = true; Sol.add(x, z, .35, .35, 0, y + 1.62, y + 2.34).fina = true;   // el farol de piedra no se atraviesa (se canaliza desde 3 m) ni se trepa
    const caja = mesh(new THREE.BoxGeometry(.5, .52, .5), new THREE.MeshStandardMaterial({ color: 0xfff0c8, emissive: 0xffd27a, emissiveIntensity: .25, roughness: .6 }), 0, 1.95, 0); g.add(caja);
    const h = halo(0xffe39a, 3.6, .15); h.position.y = 1.95; g.add(h);
    LUCES.push({ id, x, z, y, caja, h });
  }
  function tierraHacia(x, z, d) { const l = Math.hypot(x, z) || 1, ux = -x / l, uz = -z / l; for (let s = d; s < d + 70; s += 2) { const px = x + ux * s, pz = z + uz * s; if (altura(px, pz) > 1.5 && pendiente(px, pz) < .8) return { x: px, z: pz }; } return null; }
  function crearBaliza(i, x, z) {
    const y = altura(x, z), g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    const mat = std(0x9fd8ff, { transparent: true, opacity: .88, emissive: 0x3f78a8, emissiveIntensity: .15, roughness: .2 });
    g.add(mesh(new THREE.CylinderGeometry(.9, 1.1, .5, 6), std(0x8f8e88), 0, .25, 0)); g.add(mesh(new THREE.CylinderGeometry(.3, .55, 2.6, 6), mat, 0, 1.8, 0)); g.add(mesh(new THREE.OctahedronGeometry(.5), mat, 0, 3.4, 0));
    const h = halo(0x7fd8ff, 5, 0); h.position.y = 3.4; g.add(h); Sol.col(x, z, 1.1, y, y + .5).fina = true; Sol.col(x, z, .6, y + .5, y + 3.9).fina = true;
    const rc = { tipo: 'baliza', jefe: 'escarcha', i, x, y: y + 2.6, z, r: 1.5, carga: 0, mat, halo: h }; RECS.push(rc); if (st('escarcha').slots[i]) encender(rc, true);
  }
  function crearPick(id, pid, item, x, y, z, color) {
    if (st(id).rec[pid]) return; const s = halo(color, 2.3, .9), n = halo(0xffffff, .75, 1); s.position.set(x, y, z); n.position.set(x, y, z); scene.add(s); scene.add(n);
    PK.push({ id, pid, item, x, y, z, s, n, on: true, f: Math.random() * 6 });
  }
  function muestra(seed, cx, cz, dmin, dmax, cond, n) {
    const r = rng(seed), out = []; let i = 0;
    while (out.length < n && i++ < 5000) { const a = r() * TAU, d = dmin + r() * (dmax - dmin), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (Math.hypot(x, z) > 420 || !cond(x, z)) continue; if (out.some(p => Math.hypot(p.x - x, p.z - z) < 28)) continue; out.push({ x, z }); }
    return out;
  }
  const libre = (x, z) => !SITIOS.some(s => Math.hypot(x - s.x, z - s.z) < s.r1 + 4) && !CUEVAS.some(c => Math.hypot(x - c.bx, z - c.bz) < 25);
  /* punto más cercano del camino faro–Mirador, para limitar y comprobar la lectura de las piedras */
  function juntoAlCamino(x, z) {
    const camino = CAMINOS[1]; let mejor = null, distancia = Infinity;
    for (let i = 1; i < camino.length; i++) {
      const a = camino[i - 1], b = camino[i], dx = b[0] - a[0], dz = b[1] - a[1], t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz), 0, 1);
      const px = a[0] + dx * t, pz = a[1] + dz * t, d = Math.hypot(x - px, z - pz);
      if (d < distancia) { distancia = d; mejor = { x: px, z: pz, d }; }
    }
    return mejor;
  }
  function piedraVisible(x, z) {
    const C = PIEDRAS_MUSGOSO, y = altura(x, z), p = juntoAlCamino(x, z);
    if (!p || p.d > C.camino || y < 2.5 || biomaDe(x, z) !== 0 || pendiente(x, z) > C.pendiente) return false;
    for (const dy of [.3, 1, 1.7]) if (Sol.dentro(x, y + dy, z, C.margen)) return false;
    const desde = altura(p.x, p.z) + 1.4, n = Math.ceil(p.d / .5);
    for (let i = 1; i <= n; i++) {
      const t = i / n, px = lerp(p.x, x, t), pz = lerp(p.z, z, t), py = lerp(desde, y + 1, t);
      if (py < altura(px, pz) + .2 || Sol.dentro(px, py, pz, .15)) return false;
    }
    return true;
  }
  function sembrarPiedrasMusgoso() {
    Estr.piedrasMusgoso = PIEDRAS_MUSGOSO.anclas.map(([ax, az], i) => {
      let p = null;
      for (let r = 0; r <= PIEDRAS_MUSGOSO.busca && !p; r += .5) for (let j = 0; j < (r ? 16 : 1); j++) {
        const x = ax + Math.cos(j * TAU / 16) * r, z = az + Math.sin(j * TAU / 16) * r;
        if (piedraVisible(x, z)) { p = { x, y: altura(x, z) + 1, z, pid: 'p' + i }; break; }
      }
      if (!p) throw new Error('Piedra del Musgoso sin acceso visible: p' + i);
      crearPick('musgoso', p.pid, 'piedra', p.x, p.y, p.z, 0x9fe07a); return p;
    });
  }
  function sembrarItems() {
    const E0 = ARENAS.escarcha, C0 = ARENAS.cerezo;
    sembrarPiedrasMusgoso();
    muestra(902, E0.x, E0.z, 38, 90, (x, z) => biomaDe(x, z) === 2 && altura(x, z) > 3 && pendiente(x, z) < .9 && libre(x, z), 4).forEach((p, i) => crearBaliza(i, p.x, p.z));
    Estr.piramides.forEach((p, i) => crearPick('arena', 'g' + i, 'glifo', p.x + .8, p.top + 1.1, p.z, 0xffc94a));
    let hondo = null;
    for (let x = -290; x <= -200; x += 3) for (let z = 190; z <= 275; z += 3) { const h = altura(x, z); if (h > -2.6 || Estr.perlas.some(q => Math.hypot(q.x - x, q.z - z) < 9)) continue; if (!hondo || h < hondo.h) hondo = { x, z, h }; }
    if (hondo) crearPick('marea', 'p0', 'perlaMarea', hondo.x, hondo.h + .8, hondo.z, 0x5ff2e0);
    const c1 = CUEVAS[1]; crearPick('cerezo', 's0', 'semilla', c1.cx - 3, c1.cy + 1.2, c1.cz + 4, 0xff9ccf);
    muestra(905, C0.x, C0.z, 45, 170, (x, z) => biomaDe(x, z) === 1 && altura(x, z) > 2.5 && pendiente(x, z) < .8 && libre(x, z), 2).forEach((p, i) => crearPick('cerezo', 's' + (i + 1), 'semilla', p.x, altura(p.x, p.z) + 1, p.z, 0xff9ccf));
  }
  function actualizarPicks(J) {
    const t = U.uT.value;
    for (const p of PK) {
      if (!p.on) continue; const d = Math.hypot(p.x - J.x, p.z - J.z), vis = d < 170; p.s.visible = p.n.visible = vis; if (!vis) continue;
      const k = 1 + .2 * Math.sin(t * 3 + p.f); p.s.scale.set(2.3 * k, 2.3 * k, 1); p.s.position.y = p.n.position.y = p.y + Math.sin(t * 1.7 + p.f) * .2;
      if (d < 2.3 && Math.abs(p.y - (J.y + .9)) < 3.4) {
        p.on = false; scene.remove(p.s); scene.remove(p.n); const S = st(p.id), n = JEFES[p.id].activ.n; S.rec[p.pid] = 1; S.got++;
        Sis.dar(p.item, 1); Sonido.sfx('recoger'); FX.rafaga(p.x, p.y, p.z, 18, 3, .8, .25, 0xffffff); UI.aviso(ITEMS[p.item].nom + ' ' + Math.min(S.got, n) + '/' + n, 'conteo'); Sis.guardar();
      }
    }
  }
  /* linternas de punto de luz fuera de las arenas: junto al faro y en el camino de cada lugar */
  // [id, x, z, distancia hacia el faro, desvío a un lado del camino]
  const LINTERNAS = [['l_aldea', -104, 64, 30], ['l_petalo', -252, -205, 22], ['l_escarcha', 270, -190, 22], ['l_duna', 246, 232, 24, 4.5], ['l_lago', -246, 232, 34]];
  function lucesDelMundo() {
    crearLinterna('l_faro', 7, 17);
    for (const [lid, x, z, d, lado] of LINTERNAS) { const p = tierraHacia(x, z, d); if (!p) continue; const l = Math.hypot(x, z) || 1; crearLinterna(lid, p.x - z / l * (lado || 0), p.z + x / l * (lado || 0)); }
  }
  /* cada fotograma: objetos que flotan y se recogen, fogatas de Escarcha y la linterna del punto de luz activo */
  function actualizar(dt, J) {
    actualizarPicks(J);
    const t = U.uT.value;
    for (const rc of RECS) if (rc.tipo === 'fogata') { rc.lit = Math.max(0, rc.lit - dt); rc.halo.opacidad = rc.lit > 0 ? .75 + Math.sin(t * 9 + rc.x) * .15 : 0; if (rc.lit > 0 && Math.random() < dt * 20) FX.emit(rc.x + rnd(-.3, .3), rc.y + .2, rc.z + rnd(-.3, .3), 0, rnd(1, 2.2), 0, .8, .25, 0xff9a3a, .9); }
    const cp = Sis.ST.checkpoint; for (const l of LUCES) { const on = !!cp && cp.id === l.id; l.h.opacidad = damp(l.h.opacidad, on ? .95 : .15, 3, dt); l.caja.material.emissiveIntensity = on ? 1.5 : .25; }
  }
  return { vestir, crearLinterna, lucesDelMundo, sembrarItems, actualizar };
}
