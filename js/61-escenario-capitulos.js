/* Objetos y figuras de los capítulos (la lógica está en 60-capitulos.js): geometría sencilla y sustituible, una función por
   pieza, con su estado visual sacado de Sis.ST. Cada capítulo crea sus piezas al llegar a él.
   Capítulo 2: emisor lunar con postigo, Sayo, la ilusión que la hace parecer una bestia y la memoria del conejo.
   Capítulo 3: el archivo de Duna (tres atriles y la estela con el esquema de la guardiana). */
"use strict";
/* gruta de las luciérnagas (CUEVAS[1]): dónde están Sayo y el emisor respecto al centro de la cámara (m, a lo largo de
   la cueva y de lado); color de la luz lunar del emisor y altura de su farol; tamaño y humo de la ilusión; recorrido y
   saltos del conejo */
const ESCENARIO_C2 = {
  sayo: { fondo: 1.5, lado: -1.5 }, emisor: { fondo: -1, lado: 3.2 }, luz: 0xff6a52, farol: 1.45,
  ilusion: { ojos: .9, alto: 1.9, humo: 45, ancho: .8, halo: 4.5, haloOp: .35 },
  conejo: { desde: -4, hasta: 5, dur: 2.6, saltos: 5, alto: .35, color: 0xf2f0ff, ojos: 0xffd36a },
  ficha: { nombre: 'Sayo', alto: 1.55, kimono: 0x343f68, obi: 0x6b5a3a, pelo: 0x241e1a,
    manto: 0x343f68, remiendos: 0x596581, colgante: 0xb2a58a,
    farolCerrado: { madera: 0x493f38, postigo: 0x2c3041 }, rutina: { tipo: 'quieto' } }
};
/* archivo de Duna, en la explanada ante la escalinata del santuario (m desde sitio('duna'), +z hacia la escalinata):
   tres atriles mirando al santuario y la estela con el esquema */
const ESCENARIO_C3 = { atriles: [[-4, 15], [0, 16], [4, 15]], estela: [-13, 18] };
/* Yoake: vecinos (fichas de Gente; ropa de la entrega del capítulo 4) en los puntos de 62-isla-yoake.js, y separación (m)
   de quienes llegan en la barca respecto a su punto */
const ESCENARIO_C4 = {
  vecinos: {
    aiko: { nombre: 'Aiko', alto: 1.55, kimono: 0x6e7a4a, obi: 0x8a6a3e, pelo: 0x2a221c },
    taku: { nombre: 'Taku', alto: 1, nino: true, kimono: 0x7f8a52, obi: 0x5e4630, pelo: 0x2a221c },
    ren: { nombre: 'Ren', alto: 1.7, kimono: 0x5a6b7d, obi: 0x3b3f46, pelo: 0x1e1b19 },
    sora: { nombre: 'Sora', alto: 1.45, kimono: 0x6f8193, obi: 0x3b3f46, pelo: 0x1e1b19 },
    chiyo: { nombre: 'Chiyo', alto: 1.35, kimono: 0xd8cfb6, obi: 0x8c7a5a, pelo: 0xd0ccc4 },
    sayo: { ...ESCENARIO_C2.ficha }   // La misma ropa y accesorios que en la gruta.
  },
  junto: 1.6
};
/* extractor de Tasogare junto a la última plataforma de la espiral, sobre una losa propia hacia fuera del faro (lejos de
   los aleros): distancia de la losa a la plataforma y su medio lado (m), radio del aro, a qué lado del aro está el
   cierre (m) y color de su luz */
/* tamaño de Lumi como luciérnaga (capítulo 7 en adelante) */
const ESCENARIO_C7 = { luciernaga: .35, archivos: [-4, 2], propuesta: [-4, -3], paseo: 18 };
const ESCENARIO_C5 = { losa: 3, medio: 1.8, aro: .9, cierre: 1.2, luz: 0xff6a52 };

const EscenarioCapitulos = (() => {
  const E = ESCENARIO_C2, puntos = {}, creados = {};
  const vecinos = {}, situados = {};
  let aro = null, momoAro = null, hiloAro = null;
  let tapaArchivo, hojasArchivo, propuestaPublica;
  let g = null, postigo, luz, nucleo, brillo, sayo = null, ojos = [], conejo = null, tConejo = -1;
  const mate = (color, o) => new THREE.MeshLambertMaterial(Object.assign({ color }, o || {}));
  function caja(w, h, d, mat, x, y, z, padre) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; (padre || g).add(m); return m; }
  /* punto de la cámara de la gruta: 'fondo' a lo largo de la cueva, 'lado' en perpendicular */
  function enGruta(fondo, lado) { const c = CUEVAS[1], [dx, dz] = c.dir; return { x: c.cx + dx * fondo - dz * lado, z: c.cz + dz * fondo + dx * lado, y: c.cy }; }

  /* ---------- capítulo 2 ---------- */
  /* emisor lunar: poste, farol con la luz roja de la red y un postigo lateral que se puede asegurar */
  function emisor(P) {
    const madera = mate(0x3b2f2a), hierro = mate(0x4a4458);
    caja(.16, E.farol - .3, .16, madera, P.x, P.y + (E.farol - .3) / 2, P.z);
    caja(.5, .62, .5, hierro, P.x, P.y + E.farol, P.z);
    nucleo = caja(.36, .44, .52, mate(E.luz, { emissive: E.luz }), P.x, P.y + E.farol, P.z);
    luz = new Halo(E.luz, .9); luz.scale.set(3.2, 3.2, 1); luz.position.set(P.x, P.y + E.farol, P.z + .4); g.add(luz);
    postigo = new THREE.Group(); postigo.position.set(P.x + .27, P.y + E.farol, P.z + .25); g.add(postigo);
    caja(.03, .58, .5, madera, 0, 0, -.25, postigo);
    // la media luna cortada del sello, sobre el farol
    const sello = new THREE.Mesh(new THREE.TorusGeometry(.16, .035, 6, 16, Math.PI * 1.3), mate(0xb8a36a)); sello.position.set(P.x, P.y + E.farol + .45, P.z + .26); g.add(sello);
    Sol.add(P.x, P.z, .3, .3, 0, P.y, P.y + E.farol + .6).fina = true;
  }
  /* la bestia que se ve bajo el emisor: humo oscuro, resplandor rojo y dos ojos donde está Sayo */
  function ilusion(P) {
    const I = E.ilusion; brillo = new Halo(E.luz, 0); brillo.scale.set(I.halo, I.halo, 1); brillo.position.set(P.x, P.y + I.alto * .6, P.z); g.add(brillo);
    ojos = [new Halo(0xff3a24, 0), new Halo(0xff3a24, 0)]; ojos.forEach(o => { o.scale.set(I.ojos, I.ojos, 1); g.add(o); }); puntos.ilusion = P;
  }
  /* el conejo espiritual: cuerpo, cabeza y orejas blancas translúcidas, con ojos dorados */
  function crearConejo() {
    const C = E.conejo, m = mate(C.color, { emissive: 0x555566, transparent: true, opacity: .75 }), q = new THREE.Group();
    const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 8), m); cuerpo.scale.set(1, .85, 1.3); cuerpo.position.y = .15; q.add(cuerpo);
    const cabeza = new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 8), m); cabeza.position.set(0, .3, .17); q.add(cabeza);
    for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.CylinderGeometry(.025, .035, .2, 6), m); o.position.set(s * .045, .45, .14); o.rotation.x = -.25; q.add(o); }
    for (const s of [-1, 1]) { const h = new Halo(C.ojos, .9); h.scale.set(.06, .06, 1); h.position.set(s * .05, .32, .26); q.add(h); }
    q.visible = false; g.add(q); return q;
  }
  function crear2() {
    puntos.sayo = enGruta(E.sayo.fondo, E.sayo.lado); puntos.emisor = enGruta(E.emisor.fondo, E.emisor.lado);
    emisor(puntos.emisor); ilusion(puntos.sayo); conejo = crearConejo();
    const S = puntos.sayo; sayo = Gente.crear(E.ficha); sayo.ocupado = true;
    // quieta sobre el suelo de la cueva: Gente solo recalcula la altura al andar
    sayo.g.position.set(S.x, S.y, S.z); sayo.ir(S.x, S.z); scene.add(sayo.g);
    sayo.g.rotation.y = Math.atan2(puntos.emisor.x - S.x, puntos.emisor.z - S.z);
  }
  function actualizar2(dt, J, t) {
    const s = Sis.ST.inicio.cap || {}, cubierto = !!s.emisor, P = puntos.ilusion, I = E.ilusion;
    postigo.rotation.y = cubierto ? 0 : .9 + Math.sin(t * 1.7) * .15; luz.opacidad = cubierto ? 0 : .8 + Math.sin(t * 3) * .1; nucleo.visible = !cubierto; brillo.opacidad = cubierto ? 0 : I.haloOp;
    sayo.g.visible = cubierto && Campana.capitulo() < 4; if (sayo.g.visible && J) sayo.actualizar(dt, J.x, J.z);   // desde el capítulo 4, Sayo está en Yoake
    ojos.forEach((o, j) => { o.position.set(P.x + (j ? 1 : -1) * .14, P.y + I.alto, P.z); o.opacidad = cubierto ? 0 : .95; });
    if (!cubierto && Math.random() < dt * I.humo) FX.humo(P.x + rnd(-I.ancho, I.ancho), P.y + rnd(0, I.alto), P.z + rnd(-I.ancho, I.ancho), rnd(-.1, .1), rnd(.3, .7), rnd(-.1, .1), rnd(1, 1.6), rnd(.6, 1), 0x0b0709, .8);
    if (tConejo >= 0) {
      const C = E.conejo, u = (tConejo += dt) / C.dur, e = puntos.emisor, [dx, dz] = CUEVAS[1].dir, l = lerp(C.desde, C.hasta, Math.min(u, 1));
      conejo.position.set(e.x - dz * l + dx * 1.5, e.y + Math.abs(Math.sin(u * Math.PI * C.saltos)) * C.alto, e.z + dx * l + dz * 1.5); conejo.rotation.y = Math.atan2(-dz, dx);
      if (u >= 1) { FX.rafaga(conejo.position.x, conejo.position.y + .2, conejo.position.z, 24, 1.5, 1, .12, 0xfff3c8, 1); conejo.visible = false; tConejo = -2; }
    }
  }

  /* ---------- capítulo 3 ---------- */
  /* atril de piedra y madera con un libro abierto, girado hacia el santuario */
  function atril(x, z, y) {
    const madera = mate(0x6d4933), piedra = mate(0xcfa56c), papel = mate(0xeee0b7);
    caja(.5, .9, .4, piedra, x, y + .45, z); const tapa = caja(.9, .08, .6, madera, x, y + .98, z); tapa.rotation.x = -.18;
    const hoja = caja(.8, .02, .52, papel, x, y + 1.03, z); hoja.rotation.x = -.18;
    Sol.add(x, z, .45, .31, 0, y, y + 1.12).fina = true;
  }
  /* estela con el esquema: la Dorada (disco completo y conejo), la Roja (media luna cortada) y la guardiana sobre su
     plataforma con cuatro conexiones al faro */
  function estela(x, z, y) {
    const lienzo = document.createElement('canvas'); lienzo.width = 512; lienzo.height = 640;
    const c = lienzo.getContext('2d'); c.fillStyle = '#d9bf8c'; c.fillRect(0, 0, 512, 640); c.strokeStyle = '#5a3b22'; c.fillStyle = '#5a3b22'; c.lineWidth = 6;
    c.beginPath(); c.arc(130, 110, 60, 0, Math.PI * 2); c.stroke();                        // disco completo
    c.beginPath(); c.ellipse(130, 205, 26, 16, 0, 0, Math.PI * 2); c.fill(); c.fillRect(140, 172, 8, 26); c.fillRect(126, 172, 8, 26);   // conejo
    c.strokeStyle = '#8e2a22'; c.beginPath(); c.arc(380, 110, 60, Math.PI * .35, Math.PI * 1.65); c.stroke();   // media luna cortada
    c.beginPath(); c.moveTo(352, 70); c.lineTo(392, 118); c.lineTo(366, 150); c.stroke();                         // su grieta
    c.strokeStyle = '#5a3b22'; c.fillRect(196, 560, 120, 18);                                                   // plataforma
    c.beginPath(); c.arc(256, 380, 34, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.moveTo(256, 414); c.lineTo(256, 520); c.moveTo(216, 470); c.lineTo(296, 470); c.moveTo(256, 520); c.lineTo(226, 560); c.moveTo(256, 520); c.lineTo(286, 560); c.stroke();
    c.lineWidth = 3; for (const [dx, dy] of [[-180, -60], [-160, 60], [160, 60], [180, -60]]) { c.beginPath(); c.setLineDash([12, 10]); c.moveTo(256, 450); c.lineTo(256 + dx, 450 + dy); c.stroke(); }
    c.setLineDash([]);
    const tex = new THREE.CanvasTexture(lienzo); tex.encoding = THREE.sRGBEncoding;
    caja(1.7, 2.6, .35, mate(0xb08a58), x, y + 1.3, z);
    const cara = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.88), mate(0xffffff, { map: tex })); cara.position.set(x, y + 1.45, z + .18); g.add(cara);
    Sol.add(x, z, .85, .2, 0, y, y + 2.6).fina = true;
  }
  function crear3() {
    const S = sitio('duna'), C = ESCENARIO_C3;
    puntos.atriles = C.atriles.map(([dx, dz]) => { const x = S.x + dx, z = S.z + dz, y = altura(x, z); atril(x, z, y); return { x, z, y }; });
    puntos.archivo = puntos.atriles[1];
    marcaArchivo(puntos.archivo);
    const [ex, ez] = C.estela, x = S.x + ex, z = S.z + ez; estela(x, z, altura(x, z)); puntos.estela = { x, z };
  }
  /* la misma firma que aparece junto a la mano de la arena, sobre el frente del atril central */
  function marcaArchivo(P) {
    const obra = Arquitectura.construir(k => Arquitectura.marcaCopista(k, .6));
    obra.g.position.set(P.x, P.y + .36, P.z + .23);
    obra.g.traverse(o => { if (o.isMesh) o.castShadow = false; }); g.add(obra.g);
    // El relieve queda dentro del sólido del atril; se lee desde fuera.
    puntos.marcaCopista = { x: P.x, y: altura(P.x, P.z + 1.2), z: P.z + 1.2 };
  }

  /* ---------- capítulo 4 ---------- */
  function crear4() {
    IslaYoake.crear(); const P = IslaYoake.puntos;
    for (const id in ESCENARIO_C4.vecinos) {
      const p = P[id]; if (!p) continue;
      const n = Gente.crear({ ...ESCENARIO_C4.vecinos[id], rutina: { tipo: 'quieto' } }); n.ocupado = true;
      n.g.position.set(p.x, p.y, p.z); n.ir(p.x, p.z); scene.add(n.g); vecinos[id] = n;
    }
  }
  /* un habitante de la isla principal en un punto (o de vuelta a su sitio de siempre si lugar es null) */
  function situar(id, lugar, clave) {
    const n = Sis.npcs[id]; if (!n || situados[id] === clave) return; situados[id] = clave;
    if (!lugar) { n.ocupado = id === 'momo' || id === 'tsuru'; const c = id === 'momo' ? PatioInicio.puntos.momo : Estr.npcs[id]; if (c) { n.g.position.set(c.x, c.y !== undefined ? c.y : altura(c.x, c.z), c.z); n.ir(c.x, c.z); } return; }
    n.ocupado = true; n.g.position.set(lugar.x, lugar.y, lugar.z); n.ir(lugar.x, lugar.z);
  }
  /* dónde están Momo, Yuki y Kaito en cada momento del capítulo 4 (y Momo, ausente desde su captura hasta el rescate) */
  function colocar4(J, dt) {
    const c = Sis.ST.inicio.cap || {}, p = Capitulos.paso('c4_velo'), P = IslaYoake.puntos, k = Estr.npcs.kaito, d = ESCENARIO_C4.junto;
    const muelle = o => ({ x: k.x + o, z: k.z - o, y: sueloEnJ(k.x + o, NIVEL_AGUA + 4, k.z - o) }), cerca = (q, o) => q && { x: q.x + o, z: q.z + o, y: q.y };
    colocarMomo(c, p);
    if (c.enYoake) { situar('yuki', cerca(P.refugio, -d), 'isla'); situar('kaito', cerca(P.embarcadero, -d), 'isla'); }
    else if (p === 3 || p === 4 || p === 10) { situar('yuki', muelle(-d), 'muelle'); situar('kaito', null, 'casa'); }
    else { situar('yuki', null, 'casa'); situar('kaito', null, 'casa'); }
    if (J) for (const id in vecinos) vecinos[id].actualizar(dt, J.x, J.z);
  }

  /* ---------- capítulo 5 ---------- */
  /* el extractor: aro vertical de hierro con luz roja, pie y un cierre lateral con palanca; Momo dentro */
  function crear5() {
    const C = ESCENARIO_C5, L = Estr.espiral[Estr.espiral.length - 1], d = Math.hypot(L.x, L.z), ux = L.x / d, uz = L.z / d;
    const A = { x: L.x + ux * C.losa, y: L.y, z: L.z + uz * C.losa }, px = -uz, pz = ux;
    // la losa: piedra oscura que se pisa, a la altura de la última plataforma
    caja(C.medio * 2, .4, C.medio * 2, mate(0x2e2a33), A.x, A.y - .2, A.z); Sol.add(A.x, A.z, C.medio, C.medio, 0, A.y - .4, A.y);
    puntos.aro = A; puntos.cierre = { x: A.x + px * C.cierre, y: A.y, z: A.z + pz * C.cierre };
    aro = new THREE.Group(); aro.position.set(A.x, A.y, A.z); aro.rotation.y = Math.atan2(px, pz); g.add(aro);
    const hierro = mate(0x3a3540), anillo = new THREE.Mesh(new THREE.TorusGeometry(C.aro, .07, 8, 28), hierro); anillo.position.y = C.aro + .15; aro.add(anillo);
    caja(.5, .15, .5, hierro, 0, .07, 0, aro);
    const brillo = new Halo(C.luz, .5); brillo.scale.set(2.4, 2.4, 1); brillo.position.y = C.aro + .15; aro.add(brillo); aro.userData.brillo = brillo;
    const P = puntos.cierre; caja(.25, 1.1, .25, hierro, P.x, P.y + .55, P.z); caja(.08, .5, .08, mate(0xb8a36a), P.x, P.y + 1.3, P.z);
    Sol.add(P.x, P.z, .125, .125, 0, P.y, P.y + 1.1).fina = true; Sol.add(P.x, P.z, .04, .04, 0, P.y + 1.05, P.y + 1.55).fina = true;
    momoAro = Gente.crear({ ...FICHAS_NPC.momo, nombre: '', rutina: { tipo: 'quieto' } }); momoAro.ocupado = true;
    momoAro.g.position.set(A.x, A.y, A.z); momoAro.ir(A.x, A.z); scene.add(momoAro.g);
  }
  function actualizar5(dt, J) {
    const c = Sis.ST.inicio.cap || {}, libre = !!c.momoRescatada;
    momoAro.g.visible = !libre; aro.userData.brillo.opacidad = libre ? 0 : .5;
    if (!libre && J && Math.hypot(J.x - puntos.aro.x, J.z - puntos.aro.z) < 25) momoAro.actualizar(dt, J.x, J.z);
  }
  /* Momo según la historia: en casa, en el muelle o en Yoake (capítulo 4), capturada hasta el rescate y, después, en Yoake */
  function colocarMomo(c, p4) {
    const momo = Sis.npcs.momo, P = IslaYoake.puntos, d = ESCENARIO_C4.junto, k = Estr.npcs.kaito;
    const cerca = (q, o) => q && { x: q.x + o, z: q.z + o, y: q.y }, muelle = o => ({ x: k.x + o, z: k.z - o, y: sueloEnJ(k.x + o, NIVEL_AGUA + 4, k.z - o) });
    if (Campana.capitulo() >= 7) {
      if (momo) { momo.g.visible = true; momo.ocupado = true; }
      const e = c.ep7 || {}, M = P.mirador, J = Sis.J;
      const paseo = e.memoria && !e.fin && J && islaEn(J.x, J.z) && Math.hypot(J.x - M.x, J.z - M.z) < ESCENARIO_C7.paseo;
      situar('momo', paseo ? cerca(M, d) : P.momoSegura, paseo ? 'mirador7' : 'yoake7');
    }
    else if (c.momoRescatada) { if (momo) momo.g.visible = true; situar('momo', cerca(P.chiyo, d), 'isla'); }
    else if (c.momoCapturada) { if (momo) momo.g.visible = false; situados.momo = 'capturada'; }
    else if (c.enYoake) situar('momo', cerca(P.chiyo, d), 'isla');
    else if (p4 === 3 || p4 === 4) situar('momo', muelle(d), 'muelle');
    else situar('momo', null, 'casa');
  }

  /* ---------- capítulo 7 ---------- */
  /* archivos de Taiyō en Hinode: caja abierta y hojas consultables después de la interacción */
  function archivosEpilogo(p) {
    const madera = mate(0x6d4933), papel = mate(0xeee0b7);
    caja(1.3, .85, .8, madera, p.x, p.y + .425, p.z);
    hojasArchivo = caja(1.1, .04, .66, papel, p.x, p.y + .88, p.z);
    hojasArchivo.name = 'Epílogo · archivos abiertos';
    tapaArchivo = new THREE.Group(); tapaArchivo.position.set(p.x, p.y + .92, p.z - .4); g.add(tapaArchivo);
    caja(1.3, .08, .8, madera, 0, 0, .4, tapaArchivo);
    Sol.add(p.x, p.z, .68, .44, 0, p.y, p.y + 1.8).fina = true;
  }
  function tableroEpilogo(p) {
    const madera = mate(0x6d4933);
    caja(1.6, 1.15, .12, madera, p.x, p.y + 1.1, p.z);
    for (const x of [-.6, .6]) caja(.1, 1.2, .1, madera, p.x + x, p.y + .6, p.z);
    propuestaPublica = caja(1.4, .95, .02, mate(0xeee0b7), p.x, p.y + 1.1, p.z + .08);
    propuestaPublica.name = 'Epílogo · propuesta pública';
    // Renglones visibles; la propuesta se lee en EP7Y01–04.
    for (let i = 0; i < 4; i++) caja(1.1, .025, .01, madera, p.x, p.y + .8 + i * .2, p.z + .1, propuestaPublica);
    // Los renglones son locales a la hoja móvil.
    propuestaPublica.children.forEach((o, i) => o.position.set(0, -.3 + i * .2, .02));
    Sol.add(p.x, p.z, .82, .12, 0, p.y, p.y + 1.7).fina = true;
  }
  function crear7() {
    IslaYoake.crearEpilogo();
    // El punto de conversación del piloto consulta al mismo NPC. Al empezar otra partida recupera su punto inicial.
    let puntoInicial = PatioInicio.puntos.momo;
    Object.defineProperty(PatioInicio.puntos, 'momo', {
      configurable: true, enumerable: true,
      get() { return Campana.capitulo() >= 7 && Sis.npcs.momo ? Sis.npcs.momo.g.position : puntoInicial; },
      set(p) { puntoInicial = p; }
    });
    const T = sitio('aldea'), C = ESCENARIO_C7;
    const enHinode = (id, d, pieza) => {
      const p = { x: T.x + d[0], z: T.z + d[1] }; p.y = altura(p.x, p.z); pieza(p);
      IslaYoake.puntos[id] = { x: p.x, y: p.y, z: p.z + 1.4 };
    };
    enHinode('epArchivos', C.archivos, archivosEpilogo); enHinode('epPropuesta', C.propuesta, tableroEpilogo);
    Bus.emit('sombraEstatica');
  }
  /* Kaito y Yuki esperan la evacuación en la plaza del faro; tras la liberación, Lumi es una luciérnaga */
  function actualizar7() {
    const c = Sis.ST.inicio.cap || {}, p = Capitulos.paso('c7_luna'), S = sitio('faro'), d = ESCENARIO_C4.junto, P = IslaYoake.puntos;
    // El rescate ya ocurrió. No queda un doble de Momo en el extractor ni vuelve a embarcar.
    c.momoRescatada = true;
    if (p >= 0 && p <= 2) {
      situar('kaito', { x: S.x + 6, z: S.z + 26, y: S.h }, 'plaza'); situar('yuki', { x: S.x - 6, z: S.z + 26, y: S.h }, 'plaza');
      situar('taiyo', { x: S.x + 9, z: S.z + 30, y: S.h }, 'plan7');
    }
    else {
      const muelle = P.embarcadero;
      const a = ISLA_YOAKE.muelle.giro;
      situar('kaito', c.enYoake ? { x: muelle.x - Math.sin(a) * d, y: muelle.y, z: muelle.z - Math.cos(a) * d } : null, c.enYoake ? 'isla7' : 'casa');
      const Y = P.epPropuesta;
      situar('yuki', p === 99 ? { x: Y.x - 2, y: Y.y, z: Y.z } : null, p === 99 ? 'tablero7' : 'casa');
      const A = P.epArchivos;
      situar('taiyo', p === 99 ? { x: A.x - 2, y: A.y, z: A.z } : null, p === 99 ? 'archivos7' : 'casa');
    }
    if (Sis.npcs.kaito) P.epViaje = Sis.npcs.kaito.g.position;
    for (const id of ['sayo', 'aiko', 'chiyo']) {
      const n = vecinos[id], q = id === 'chiyo' ? { x: P.epMesa.x - 2, y: P.epMesa.y, z: P.epMesa.z } : P[id === 'sayo' ? 'sayoSegura' : 'aikoSegura'];
      if (n && situados['vecino_' + id] !== 'yoake7') { n.g.position.set(q.x, q.y, q.z); n.ir(q.x, q.z); n.ocupado = true; situados['vecino_' + id] = 'yoake7'; }
    }
    const e = c.ep7 || {};
    tapaArchivo.rotation.x = e.archivos ? -Math.PI / 2 : 0; hojasArchivo.visible = !!e.archivos;
    propuestaPublica.visible = !!e.propuesta;
    if (tapaArchivo.userData.abierta !== !!e.archivos || propuestaPublica.userData.colocada !== !!e.propuesta) {
      tapaArchivo.userData.abierta = !!e.archivos; propuestaPublica.userData.colocada = !!e.propuesta; Bus.emit('sombraEstatica');
    }
    if (c.lumiLuciernaga && !Cin.activa) Lumi.grupo.scale.setScalar(ESCENARIO_C7.luciernaga);
  }

  /* el conejo cruza una vez junto al emisor y se deshace en luz */
  function cruzarConejo() { if (conejo && tConejo === -1) { tConejo = 0; conejo.visible = true; } }
  function actualizar(dt, J, t) {
    const n = Campana.capitulo();
    if (n >= 2 && !creados[2]) { if (!g) { g = new THREE.Group(); scene.add(g); } crear2(); creados[2] = true; Bus.emit('sombraEstatica'); }
    if (n >= 3 && !creados[3]) { if (!g) { g = new THREE.Group(); scene.add(g); } crear3(); creados[3] = true; Bus.emit('sombraEstatica'); }
    if (n >= 4 && !creados[4]) { crear4(); creados[4] = true; }
    if (creados[2]) actualizar2(dt, J, t);
    if (n >= 5 && !creados[5]) { crear5(); creados[5] = true; }
    if (n >= 7 && !creados[7]) { crear7(); creados[7] = true; }
    if (creados[4]) { IslaYoake.actualizar(dt, t); if (n === 4) colocar4(J, dt); else { colocarMomo(Sis.ST.inicio.cap || {}, -1); if (J) for (const id in vecinos) vecinos[id].actualizar(dt, J.x, J.z); } }
    if (creados[5]) actualizar5(dt, J);
    if (n >= 7) { actualizar7(); IslaYoake.actualizarEpilogo(dt, J); }
  }
  return { actualizar, cruzarConejo, puntos, vecinos, get sayo() { return sayo; } };
})();
