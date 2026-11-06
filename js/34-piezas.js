/* === Ecos de Luz · 34-piezas.js ===
   Piezas de cada lugar (separadas de 24-arquitectura.js, que lleva el material, los tejados, las piezas comunes de
   templo y Arquitectura.construir): muelle de Kaito, alrededores de la aldea, árbol seco de la arena del Cerezo,
   santuario de la Duna y santuario de la Marea. Se añaden a Arquitectura, así que se usan igual que las comunes
   (Arquitectura.barca(K, 1)…); K son las utilidades de obra (bx, cy, A, Lz, techo, sol, solC). */
"use strict";

Object.assign(Arquitectura, (() => {
  /* ---------- muelle: barca, amarres, cobertizo, red, carga y farol ---------- */
  const MAD = 0x7a5a3e, MAD_OSC = 0x4a3226, CUERDA = 0xc9b48a;
  /* barca de pesca (proa hacia +z): casco ahusado de tablas, interior, bancada y dos remos */
  function barca(K, e) {
    e = e || 1; const g = new THREE.BoxGeometry(1.25 * e, .55 * e, 3.8 * e, 2, 2, 10), q = g.attributes.position;
    for (let i = 0; i < q.count; i++) { const z = q.getZ(i) / (1.9 * e), y = q.getY(i); q.setX(i, q.getX(i) * (1 - .85 * z * z) * (y < 0 ? .72 : 1)); q.setY(i, y + z * z * .3 * e * (y > 0 ? 1 : .35)); }
    g.computeVertexNormals(); K.A(pieza(g, MAD_OSC, { y: .28 * e, var: .1 }), 'madera');
    K.bx(.85 * e, .04 * e, 2.6 * e, MAD, 0, .5 * e, 0, { clase: 'madera' });                       // interior
    K.bx(1.05 * e, .07 * e, .32 * e, MAD, 0, .62 * e, -.2 * e, { clase: 'madera' });                // bancada
    for (const s of [-1, 1]) { K.cy(.03 * e, .03 * e, 2.4 * e, 6, MAD, s * .45 * e, .62 * e, .3 * e, { rx: Math.PI / 2 - .12, rz: s * .1, clase: 'madera' }); K.bx(.16 * e, .02 * e, .5 * e, MAD, s * .48 * e, .7 * e, 1.5 * e, { clase: 'madera' }); }
  }
  /* poste de amarre con un rollo de cuerda */
  function amarre(K, e) {
    e = e || 1; K.cy(.15 * e, .18 * e, .9 * e, 8, MAD_OSC, 0, 0, 0, { clase: 'madera' }); K.cy(.19 * e, .17 * e, .08 * e, 8, MAD_OSC, 0, .9 * e, 0, { clase: 'madera' });
    K.A(pieza(new THREE.TorusGeometry(.22 * e, .045 * e, 6, 14), CUERDA, { y: .45 * e, rx: Math.PI / 2 }), 'tela'); K.solC(0, 0, .19 * e, 0, .98 * e, { fina: true }); K.solC(0, 0, .265 * e, .405 * e, .495 * e, { fina: true });
  }
  /* cobertizo del pescador: cuatro postes, pared trasera de tablas, banco y tejado */
  function cobertizo(K) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { K.cy(.1, .12, 2.4, 8, MAD_OSC, sx * 1.7, 0, sz * 1.3, { clase: 'madera' }); K.solC(sx * 1.7, sz * 1.3, .12, 0, 2.4, { fina: true }); }
    K.bx(3.6, 2.3, .12, MAD, 0, 0, -1.35, { clase: 'madera' }); K.bx(3.2, .1, .8, MAD, 0, .55, -.85, { clase: 'madera' });
    K.techo(4.6, 3.8, 1.1, 0x4a3f55, 0, 2.4, 0); K.sol(0, -1.35, 1.8, .1, 0, 2.3, { fina: true }); K.sol(0, -.85, 1.6, .4, .55, .65);
  }
  /* red tendida a secar entre dos postes (malla de cuerdas que cuelga) */
  function red(K) {
    for (const s of [-1, 1]) { K.cy(.07, .08, 2.6, 6, MAD_OSC, s * 1.8, 0, 0, { clase: 'madera' }); K.solC(s * 1.8, 0, .12, 0, 2.6, { fina: true }); }
    K.sol(0, 0, 1.75, .06, .1, 2.4, { fina: true });   // la red tendida no se atraviesa
    K.bx(3.8, .07, .07, MAD_OSC, 0, 2.45, 0, { clase: 'madera' });
    for (let i = 0; i <= 8; i++) { const x = -1.6 + i * .4, caida = .35 * Math.sin(i / 8 * Math.PI); K.bx(.025, 1.6 - caida, .025, CUERDA, x, .8 + caida, 0, { clase: 'tela' }); }
    for (let j = 0; j < 5; j++) K.bx(3.2, .025, .025, CUERDA, 0, .9 + j * .32, 0, { clase: 'tela', antes: g => { const q = g.attributes.position; for (let i = 0; i < q.count; i++) q.setY(i, q.getY(i) - .3 * Math.sin((q.getX(i) / 3.2 + .5) * Math.PI) * (1 - j / 5)); } });
  }
  /* carga del muelle: cajas apiladas y un barril con aros */
  function carga(K) {
    K.bx(.7, .55, .7, MAD, 0, 0, 0, { clase: 'madera', ry: .2 }); K.bx(.6, .5, .6, MAD, .15, .55, .05, { clase: 'madera', ry: -.3 }); K.bx(.6, .45, .55, MAD, .9, 0, .2, { clase: 'madera' });
    K.cy(.3, .3, .8, 12, 0x6b4a32, -.9, 0, .3, { clase: 'madera' }); for (const y of [.12, .62]) K.cy(.315, .315, .06, 12, 0x2a2622, -.9, y, .3, { clase: 'metal' });
    K.sol(.3, .1, .9, .6, 0, 1.05); K.solC(-.9, .3, .32, 0, .8);
  }

  /* ---------- alrededores de la aldea: huerto, valla de bambú y santuario de camino ---------- */
  const TIERRA = 0x5a4632, BAMBU = 0xa8a25c;
  /* huerto de w × d: caballones de tierra con matas de verdura y una valla de bambú con entrada (lado +z) */
  function huerto(K, w, d, semilla) {
    const r = rng(semilla || 1), filas = Math.max(2, Math.floor(d / 1.1));
    K.bx(w + .4, .08, d + .4, 0x4a3a2a, 0, 0, 0, { clase: 'tela', var: .25 });
    for (let i = 0; i < filas; i++) {
      const z = -d / 2 + (i + .5) * d / filas;
      K.bx(w - .3, .22, .55, TIERRA, 0, .04, z, { clase: 'tela', var: .3 });
      for (let x = -w / 2 + .5; x < w / 2 - .3; x += .55 + r() * .25) {
        const verde = pick([0x4f7a32, 0x5d8a3a, 0x6f9440, 0x3f6a2e]), t = .18 + r() * .14;
        K.A(pieza(abollar(icoSuave(t, 1), .18, 4, x * 9 + z), verde, { x: x + (r() - .5) * .15, y: .3 + t * .55, z: z + (r() - .5) * .12, sy: .75 + r() * .3, var: .25 }), 'tela');
      }
    }
    valla(K, w + 1, d + 1, 2.2);
    K.sol(0, 0, w / 2 + .5, d / 2 + .5, 0, .3);
  }
  /* valla de bambú alrededor de un rectángulo w × d con hueco de 'paso' m en el lado +z: postes y dos travesaños */
  function valla(K, w, d, paso) {
    const tramo = (x0, z0, x1, z1) => {
      const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 1.2)), ry = Math.atan2(x1 - x0, z1 - z0);
      for (let k = 0; k <= n; k++) { const t = k / n; K.cy(.045, .05, 1.05, 6, BAMBU, x0 + (x1 - x0) * t, 0, z0 + (z1 - z0) * t, { clase: 'madera' }); }
      for (const y of [.42, .88]) K.bx(.04, .04, L, BAMBU, (x0 + x1) / 2, y, (z0 + z1) / 2, { ry, clase: 'madera' });
      // la valla no se atraviesa: una pared fina por tramo (los tramos van a lo largo de x o de z; el paso queda libre)
      K.sol((x0 + x1) / 2, (z0 + z1) / 2, Math.max(Math.abs(x1 - x0) / 2, .08), Math.max(Math.abs(z1 - z0) / 2, .08), 0, 1.05, { fina: true });
    };
    const W = w / 2, Dd = d / 2, h = (paso || 0) / 2;
    tramo(-W, -Dd, W, -Dd); tramo(-W, -Dd, -W, Dd); tramo(W, -Dd, W, Dd);
    if (h > 0) { tramo(-W, Dd, -h, Dd); tramo(h, Dd, W, Dd); } else tramo(-W, Dd, W, Dd);
  }
  /* santuario de camino (hokora): basa de piedra, casita de madera con tejadillo, ofrenda y cuerda sagrada */
  function hokora(K) {
    K.bx(1.4, .4, 1.2, 0x8a8a84, 0, 0, 0, { clase: 'piedra' }); K.bx(1.1, .25, .9, 0x9a9992, 0, .4, 0, { clase: 'piedra' });
    K.bx(.8, .75, .65, 0x6b4a32, 0, .65, 0, { clase: 'madera' }); K.Lz(pieza(new THREE.BoxGeometry(.4, .4, .03), 0xffd58a, { y: .95, z: .34 }));
    K.techo(1.3, 1.1, .45, 0x3a4f5e, 0, 1.38, 0);
    Arquitectura.shimenawa(K, .9, .06, 1.33, .4);
    K.A(pieza(new THREE.SphereGeometry(.09, 8, 6), 0xf2efe6, { x: -.22, y: .5, z: .62 }), 'tela'); K.A(pieza(new THREE.SphereGeometry(.09, 8, 6), 0xf2efe6, { x: .22, y: .5, z: .62 }), 'tela');
    K.solC(0, 0, .75, 0, 1.6);
  }

  /* ---------- árbol seco (cerezos marchitos de la arena del Cerezo) ---------- */
  /* tronco algo torcido que se abre en ramas que se dividen (niveles de ARBOL_SECO); todo en la malla de obra */
  const ARBOL_SECO = { niveles: 3, ramas: 3, abre: .62, acorta: .68, adelgaza: .62, color: 0x3e322b };
  const _y = new THREE.Vector3(0, 1, 0);
  function arbolSeco(K, alto, semilla) {
    const r = rng(semilla || 1), A = ARBOL_SECO;
    const rama = (x, y, z, d, largo, grueso, nivel) => {
      const g = new THREE.CylinderGeometry(grueso * A.adelgaza, grueso, largo, 6, 2); g.translate(0, largo / 2, 0);
      g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(_y, d)));
      K.A(pieza(g, A.color, { x, y, z, var: .15 }), 'corteza', true);
      if (nivel >= A.niveles) return;
      const fx = x + d.x * largo, fy = y + d.y * largo, fz = z + d.z * largo, n = nivel === 0 ? A.ramas : 2 + (r() < .5 ? 1 : 0);
      for (let k = 0; k < n; k++) {
        const a = k / n * TAU + r() * 1.2, e = A.abre * (.7 + r() * .6), nd = new THREE.Vector3(Math.cos(a) * Math.sin(e), Math.cos(e), Math.sin(a) * Math.sin(e)).lerp(d, .35).normalize();
        rama(fx, fy, fz, nd, largo * A.acorta * (.8 + r() * .4), grueso * A.adelgaza, nivel + 1);
      }
    };
    rama(0, -.2, 0, new THREE.Vector3((r() - .5) * .2, 1, (r() - .5) * .2).normalize(), alto * .55, alto * .07, 0);
    K.solC(0, 0, alto * .09, 0, alto * .6);
  }

  /* ---------- santuario de la Duna: reloj de sol, cabezas, toldos, puerta y vasijas ---------- */
  const AREN = 0xd2aa72, AREN_C = 0xe6c58f, ORO = 0xd9a441;
  /* reloj de sol: disco de arenisca, gnomon triangular y marcas de las horas */
  function relojSol(K) {
    K.cy(2.1, 2.3, .35, 28, AREN, 0, 0, 0, { clase: 'arenisca' }); K.cy(1.9, 1.9, .05, 28, AREN_C, 0, .35, 0, { clase: 'arenisca' });
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; K.bx(.08, .06, .35, 0x8a6a4a, Math.cos(a) * 1.65, .38, Math.sin(a) * 1.65, { ry: -a + Math.PI / 2, clase: 'arenisca' }); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -.9, 0, 0, .9, 0, 1.5, -.9, .05, 0, -.9, .05, 0, .9, .05, 1.5, -.9], 3));
    g.setIndex([0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 0, 2, 5, 0, 5, 3, 1, 4, 5, 1, 5, 2]); g.computeVertexNormals();
    K.A(pieza(g, ORO, { y: .4 }), 'metal'); K.solC(0, 0, 2.2, 0, .4);
    for (let i = 0; i < 6; i++) K.sol(.025, -.15 * i, .025, .9 - .15 * i, .4 + .25 * i, .65 + .25 * i, { fina: true });
  }
  /* cabeza de piedra de un guardián, medio enterrada en la arena */
  function cabezaPiedra(K, e) {
    e = e || 1; K.A(pieza(abollar(icoSuave(1, 2), .06, 1.4, 7), AREN, { y: .7 * e, sx: 1.25 * e, sy: 1.6 * e, sz: 1.3 * e, var: .1 }), 'tallada');
    K.bx(1.6 * e, .22 * e, .35 * e, AREN, 0, 1.25 * e, 1.05 * e, { clase: 'tallada', rx: -.15 });                    // cejas
    K.bx(.3 * e, .7 * e, .35 * e, AREN, 0, .55 * e, 1.22 * e, { clase: 'tallada', rx: .15 });                        // nariz
    for (const s of [-1, 1]) K.bx(.42 * e, .08 * e, .1 * e, 0x5a4632, s * .42 * e, 1.07 * e, 1.13 * e, { clase: 'tallada' });   // ojos cerrados
    K.bx(.7 * e, .1 * e, .2 * e, 0x8a6a4a, 0, .2 * e, 1.15 * e, { clase: 'tallada' });                               // boca
    K.solC(0, 0, 1.25 * e, -1, 2 * e);
  }
  /* toldo de tela sobre dos filas de postes (algo combado) */
  function toldo(K, w, d, h, hex) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { K.cy(.06, .07, h, 6, MAD_OSC, sx * w / 2, 0, sz * d / 2, { clase: 'madera' }); K.solC(sx * w / 2, sz * d / 2, .07, 0, h, { fina: true }); }
    K.bx(w, .03, d, hex, 0, h - .05, 0, { clase: 'tela', antes: g => { const q = g.attributes.position; for (let i = 0; i < q.count; i++) q.setY(i, q.getY(i) - .25 * (1 - (2 * q.getX(i) / w) ** 2)); } });
  }
  /* puerta de arenisca en el camino: dos pilares, dintel y disco solar dorado */
  function puertaArenisca(K) {
    for (const s of [-1, 1]) { K.bx(1.3, 6, 1.3, AREN, s * 3, 0, 0, { clase: 'arenisca' }); K.bx(1.6, .4, 1.6, AREN_C, s * 3, 0, 0, { clase: 'arenisca' }); K.sol(s * 3, 0, .65, .65, 0, 6, { fina: true }); K.sol(s * 3, 0, .8, .8, 0, .4, { fina: true }); }
    K.bx(8.2, 1, 1.6, AREN_C, 0, 6, 0, { clase: 'arenisca' }); K.bx(7.2, .4, 1.4, AREN, 0, 7, 0, { clase: 'arenisca' });
    K.sol(0, 0, 4.1, .8, 6, 7, { fina: true }); K.sol(0, 0, 3.6, .7, 7, 7.4, { fina: true });
    K.cy(.8, .8, .2, 20, ORO, 0, 6.5, .85, { rx: Math.PI / 2, clase: 'metal' });
  }
  /* vasija de barro (torno) */
  function vasija(K, e) {
    e = e || 1; const perfil = [[0, 0], [.22, 0], [.35, .2], [.4, .45], [.3, .72], [.17, .8], [.2, .9], [.16, .92]].map(([r, y]) => new THREE.Vector2(r * e, y * e));
    K.A(pieza(new THREE.LatheGeometry(perfil, 12), 0xb4643e, { var: .12 }), 'arenisca'); K.solC(0, 0, .4 * e, 0, .9 * e);
  }

  /* ---------- santuario de la Marea: nenúfares y campanillas (el torii y los faroles son piezas comunes) ---------- */
  function nenufar(K, flor) {
    K.cy(.55, .55, .03, 12, 0x3f6e3a, 0, 0, 0, { clase: 'tela', var: .15 });
    if (flor) { for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; K.A(pieza(new THREE.SphereGeometry(.12, 6, 4), 0xf2b8cf, { x: Math.cos(a) * .1, y: .1, z: Math.sin(a) * .1, sx: .7, sy: 1.1, rz: Math.cos(a) * .5, rx: -Math.sin(a) * .5 }), 'tela'); } K.A(pieza(new THREE.SphereGeometry(.06, 6, 4), 0xffd47a, { y: .12 }), 'tela'); }
  }
  function campanilla(K, largo) {
    K.bx(.012, largo, .012, CUERDA, 0, -largo, 0, { clase: 'tela' }); K.cy(.05, .08, .16, 8, 0xb08d57, 0, -largo - .16, 0, { clase: 'metal' }); K.bx(.08, .14, .01, 0xe9dfc9, 0, -largo - .34, 0, { clase: 'tela' });
  }

  /* ---------- oficios de los guardianes: relieves grandes, sin letras ---------- */
  const PISTA = { fondo: 0x49545c, relieve: 0xd8d4bb, verde: 0x90ac63, marca: 0xe3bc72 };
  function trazoGuardian(K, pts, r, color, clase) {
    const curva = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
    K.A(pieza(new THREE.TubeGeometry(curva, pts.length * 3, r, 5, false), color), clase || 'tallada');
  }
  /* marca de copista repetida junto al archivo: dos hojas y un trazo diagonal de cálamo */
  function marcaCopista(K, e) {
    e = e || 1;
    const tr = p => trazoGuardian(K, p.map(q => q.map(v => v * e)), .045 * e, PISTA.marca);
    tr([[-.3, 0, 0], [-.3, .48, 0], [.12, .48, 0]]);
    tr([[-.16, -.12, 0], [.3, -.12, 0], [.3, .32, 0]]);
    tr([[-.24, -.14, .03], [.32, .5, .03]]);
  }
  /* palma, cuatro dedos curvos y pulgar: la mano se extiende hacia el centro de la escena */
  function manoRelieve(K, x, y, z, lado) {
    const c = PISTA.relieve;
    K.A(pieza(new THREE.SphereGeometry(.28, 10, 6), c, { x, y, z, sy: .85, sz: .25 }), 'tallada');
    for (let i = 0; i < 4; i++) {
      const dy = .2 - i * .135, l = i === 0 || i === 3 ? .46 : .57;
      trazoGuardian(K, [[x + lado * .14, y + dy, z], [x + lado * .38, y + dy, z + .01], [x + lado * l, y + dy - .08, z]], .055, c);
    }
    trazoGuardian(K, [[x - lado * .08, y - .16, z], [x + lado * .04, y - .38, z], [x + lado * .27, y - .32, z]], .075, c);
  }
  /* cabo corto para los brazaletes existentes: cuerda y sello cortado como el del emisor */
  function caboGuardian(K) {
    trazoGuardian(K, [[0, 0, 0], [.08, -.2, .04], [.02, -.48, .02]], .035, CUERDA, 'tela');
    K.cy(.22, .22, .06, 12, 0x46373a, .02, -.62, .02, { rx: Math.PI / 2, clase: 'laca' });
    K.A(pieza(new THREE.TorusGeometry(.16, .035, 6, 16, Math.PI * 1.3), 0xb8a36a, { x: .02, y: -.59, z: .065 }), 'metal');
    trazoGuardian(K, [[-.055, -.73, .07], [.065, -.59, .07], [-.035, -.47, .07]], .022, 0xb8a36a, 'metal');
  }
  function pistaGuardian(K, id) {
    const C = PISTA, fina = { fina: true };
    if (id === 'marea') {
      // Dos vueltas enlazadas y el cabo rematado: un nudo de trabajo, junto al bordillo.
      for (const s of [-1, 1]) trazoGuardian(K, [[s * .1, .2, .48], [s * .65, .26, .32], [s * .55, .58, -.12], [s * .12, .54, .05], [s * .1, .2, .48]], .085, CUERDA, 'tela');
      trazoGuardian(K, [[-.7, .15, -.35], [-.2, .4, .1], [.25, .28, .3], [.8, .06, .55]], .07, CUERDA, 'tela');
      K.sol(0, .1, .88, .65, 0, .7, fina); return;
    }
    if (id === 'musgoso') {
      // Apoyo remendado: la junta clara atraviesa sillares de dos épocas.
      for (let i = 0; i < 3; i++) for (const s of [-1, 1]) K.bx(.85, .35, .75, s < 0 ? 0x777e78 : 0xaaa99b, s * .45, i * .36, 0, { clase: 'piedra' });
      K.bx(.09, 1.08, .04, C.relieve, 0, 0, .395, { clase: 'enlucido' });
      trazoGuardian(K, [[-.55, .28, .42], [-.28, .75, .42], [-.02, .28, .42]], .045, C.marca);
      trazoGuardian(K, [[-.6, .48, .42], [.02, .48, .42]], .04, C.marca);
      K.bx(.3, .7, .25, 0xa1abb1, 1.08, .08, .1, { clase: 'metal', rz: -.2, antes: g => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setX(i, p.getX(i) * .08); } });
      K.sol(0, 0, .9, .44, 0, 1.08, fina); K.sol(1.08, .1, .25, .18, 0, .85, fina); return;
    }
    // La cara mira hacia +z; su relieve mide casi dos metros y contrasta con la piedra oscura.
    K.bx(2.6, 1.9, .34, C.fondo, 0, -.12, 0, { clase: 'tallada' });
    K.sol(0, .07, 1.32, .3, -.12, 1.83, fina);
    if (id === 'cerezo') {
      manoRelieve(K, -.62, 1.16, .25, 1);
      trazoGuardian(K, [[.6, .3, .25], [.62, .65, .25], [.5, .88, .25]], .045, C.verde);
      for (const s of [-1, 1]) K.A(pieza(new THREE.SphereGeometry(.18, 8, 5), C.verde, { x: .62 + s * .16, y: .68, z: .26, sy: .45, sz: .3, rz: s * .45 }), 'tela');
      // Disco de mantenimiento y herramienta de injerto clavada, con la misma marca en el mango.
      K.A(pieza(new THREE.TorusGeometry(.22, .035, 6, 18), C.marca, { x: -.4, y: .38, z: .22 }), 'metal');
      K.bx(.12, .82, .12, MAD, -1.04, 1.55, 0, { clase: 'madera', rz: -.12 });
      K.A(pieza(new THREE.ConeGeometry(.15, .5, 3), 0xa1abb1, { x: -.97, y: 1.56, rx: Math.PI }), 'metal');
      K.A(pieza(new THREE.TorusGeometry(.045, .015, 5, 10), C.marca, { x: -1.08, y: 2.1, z: .075 }), 'metal');
      K.sol(-1.05, 0, .2, .18, 1.4, 2.4, fina);
    }
    if (id === 'arena') {
      for (let i = 0; i < 3; i++) K.bx(.72, .64, .035, 0xeee0b7, .38 + i * .08, .32 + i * .08, .24 + i * .04, { clase: 'tela', rz: -.12 + i * .1 });
      manoRelieve(K, -.45, 1.25, .26, 1);
      const m = K.marca(); marcaCopista(K, .65); K.mover(m, -.62, .37, .24);
    }
    if (id === 'escarcha') {
      // Nicho abierto: paredes pequeñas y dintel, sin cerrar el hueco que guarda la lámpara.
      for (const s of [-1, 1]) { K.bx(.25, 2.05, .95, 0x8999a6, s * 1.18, -.12, .25, { clase: 'piedra' }); K.sol(s * 1.18, .25, .125, .475, -.12, 1.93, fina); }
      K.bx(2.6, .2, .95, 0xa8b3b9, 0, 1.86, .25, { clase: 'piedra' }); K.sol(0, .25, 1.3, .475, 1.86, 2.06, fina);
      manoRelieve(K, -.72, 1.12, .27, 1); manoRelieve(K, .72, 1.12, .27, -1);
      K.bx(.38, .12, .32, MAD_OSC, 0, .38, .5, { clase: 'madera' }); K.glowBx(.24, .36, .2, 0xffcc7a, 0, .5, .5); K.bx(.38, .1, .32, MAD_OSC, 0, .86, .5, { clase: 'madera' });
      K.sol(0, .5, .21, .18, .38, .96, fina);
    }
  }

  return { huerto, valla, hokora, arbolSeco, barca, amarre, cobertizo, red, carga, relojSol, cabezaPiedra, toldo, puertaArenisca, vasija, nenufar, campanilla, pistaGuardian, marcaCopista, caboGuardian };
})());
