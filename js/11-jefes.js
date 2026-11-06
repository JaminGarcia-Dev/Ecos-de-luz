/* === Ecos de Luz · 11-jefes.js ===
   Gólems guardianes de los cinco biomas: datos (JEFES, ATQ, EQUILIBRIO), activación por exploración,
   estados, IA de combate, fases al 66 % y 33 %, puntos débiles, equilibrio, tambaleo, aturdimiento y
   purificación con el haz, canalización y puntos de luz (checkpoints). El arte y la animación están en
   22-golems.js; los ataques, en 23-ataques-golem.js; el haz de luz, en 21-combate.js. */
"use strict";

// Arenas: se registran como SITIOS para que el terreno quede llano (antes de generar el mundo)
const ARENAS = { musgoso: { x: 118, z: -26 }, escarcha: { x: 154, z: -264 }, arena: { x: 246, z: 164 }, marea: { x: -174, z: 296 }, cerezo: { x: -152, z: -62 } };
const R_ARENA = 24;
for (const id in ARENAS) SITIOS.push({ id: 'arena_' + id, x: ARENAS[id].x, z: ARENAS[id].z, r1: 27, r2: 46 });

Object.assign(ITEMS, {
  piedra: { nom: 'Piedra Ancestral', tipo: 'mat', ic: 'piedra', desc: 'Late con musgo antiguo. Llévala al Altar de Musgo de la Pradera.' },
  glifo: { nom: 'Glifo del Sol', tipo: 'mat', ic: 'sol', desc: 'Colócalo en una columna rota de la arena del desierto.' },
  perlaMarea: { nom: 'Perla de Marea', tipo: 'mat', ic: 'perla', desc: 'Lánzala al Estanque Sagrado de los Lagos de Marea.' },
  semilla: { nom: 'Semilla Espiritual', tipo: 'mat', ic: 'brote', desc: 'Plántala en un cerezo marchito.' },
  nucleo_tierra: { nom: 'Núcleo de Musgo', tipo: 'mat', ic: 'nucleo', desc: 'Recuerdo de Bruno, el guardián que se liberó.' },
  nucleo_nieve: { nom: 'Núcleo de Escarcha', tipo: 'mat', ic: 'nucleo', desc: 'Recuerdo de Alba, el guardián que se liberó.' },
  nucleo_arena: { nom: 'Núcleo de Arena', tipo: 'mat', ic: 'nucleo', desc: 'Recuerdo de Inés, el guardián que se liberó.' },
  nucleo_marea: { nom: 'Núcleo de Marea', tipo: 'mat', ic: 'nucleo', desc: 'Recuerdo de León, el guardián que se liberó.' },
  nucleo_cerezo: { nom: 'Núcleo del Cerezo', tipo: 'mat', ic: 'nucleo', desc: 'Recuerdo de Vera, el guardián que se liberó.' },
  manto_guardian: { nom: 'Manto del Guardián', tipo: 'manto', tint: 0xb8f0c8, perk: { hp: .15, dmg: .15 }, ic: 'escudo', desc: 'Por purificar a los cinco gólems: +15 % de vida y +15 % de daño.' }
});

const JEFES = {
  musgoso: { nom: 'Gólem Musgoso', sub: 'Guardián del Bioma de Tierra', ic: 'hoja', alto: 6, osc: 300, vel: 2.2, fases: 2, dmg: 1,
    estilo: { piel: 0x8d8a80, sec: 0x5f8a3a, ojo: 0x9dff7a, calma: 0xc4c0b2, geo: 'roca', aspecto: 'roca' }, equilibrio: 120, activ: { tipo: 'altar', item: 'piedra', n: 3 },
    ataques: { 1: ['onda', 'lluvia', 'embestida'], 2: ['onda', 'lluvia', 'embestida', 'embestida'] }, dif: 1, xp: 350, rec: [['nucleo_tierra', 1], ['esencia', 2]],
    desc: 'Un coloso de roca y musgo duerme en la Pradera del Alba. Es lento pero casi imparable: lee sus golpes y esquiva a tiempo. Recomendado: nivel 3.',
    txt: ['Reúne 3 Piedras Ancestrales en la Pradera del Alba', 'Colócalas en el Altar de Musgo de su arena ({interactuar})', 'Purifícalo: arranca su musgo y haz que se estrelle contra un pilar', 'Mantén E junto a su núcleo para canalizar la luz'] },
  escarcha: { nom: 'Gólem de Escarcha', sub: 'Guardián del Bioma de Nieve', ic: 'copo', alto: 5.5, osc: 450, vel: 2.4, fases: 3, dmg: 1.1,
    estilo: { piel: 0x9fd8ff, sec: 0xe8f8ff, ojo: 0x4fb8ff, calma: 0xe2f4ff, geo: 'cristal', aspecto: 'cristal', trans: true, sinCabeza: true }, equilibrio: 140, activ: { tipo: 'balizas', n: 4 },
    ataques: { 1: ['aliento', 'estacas'], 2: ['aliento', 'estacas', 'onda'], 3: ['aliento', 'estacas', 'onda'] }, dif: 2, xp: 450, rec: [['nucleo_nieve', 1], ['te', 3]],
    desc: 'Un gigante de hielo sin cabeza aguarda en las Cumbres de Kiri. El frío se vuelve más agresivo cuanto más dura la pelea. Recomendado: nivel 5.',
    txt: ['Enciende las 4 Balizas de Hielo de Kiri (mantén E, pulso o haz)', 'Entra en su arena helada: el guardián despertará', 'Purifícalo: golpea 3 veces su núcleo azul tras las estacas', 'Mantén E junto a su núcleo para canalizar la luz'] },
  arena: { nom: 'Gólem de Arena', sub: 'Guardián del Bioma del Desierto', ic: 'duna', alto: 5, osc: 550, vel: 2.6, fases: 3, dmg: 1.2,
    estilo: { piel: 0xf2e4cc, sec: 0x5a4636, ojo: 0x5fc8ff, calma: 0xfff4e0, geo: 'roca', aspecto: 'arenisca' }, equilibrio: 150, activ: { tipo: 'columnas', item: 'glifo', n: 3 },
    ataques: { 1: ['garras', 'tormenta'], 2: ['garras', 'tormenta', 'lluvia'], 3: ['garras', 'tormenta', 'movedizas'] }, dif: 2, xp: 550, rec: [['nucleo_arena', 1], ['esencia', 3]],
    desc: 'Un coloso de arenisca unido por cadenas antiguas controla las tormentas de las Dunas. Recomendado: nivel 6.',
    txt: ['Reúne los 3 Glifos del Sol de las cimas de las pirámides', 'Colócalos en las 3 columnas rotas de su arena ({interactuar})', 'Purifícalo: rompe las dos cadenas que unen su cuerpo', 'Mantén E junto a su núcleo para canalizar la luz'] },
  marea: { nom: 'Gólem de Marea', sub: 'Guardián del Bioma de Agua', ic: 'ola', alto: 4.5, osc: 600, vel: 3.2, fases: 3, dmg: 1.25,
    estilo: { piel: 0x2fbf8f, sec: 0xd9a441, ojo: 0xd8fff0, calma: 0x9ff4dc, geo: 'agua', aspecto: 'agua', trans: true, sinPiernas: true }, equilibrio: 130, activ: { tipo: 'estanque', item: 'perlaMarea', n: 1 },
    ataques: { 1: ['cascada', 'torbellino'], 2: ['cascada', 'proyectiles', 'torbellino'], 3: ['cascada', 'proyectiles'] }, dif: 3, xp: 600, rec: [['nucleo_marea', 1], ['onigiri', 3], ['te', 2]],
    desc: 'Un espíritu de agua esmeralda con brazaletes dorados. Rápido y cambiante. Recomendado: nivel 7.',
    txt: ['Bucea en lo más hondo de la laguna para encontrar la Perla de Marea', 'Lánzala al Estanque Sagrado de su arena ({interactuar})', 'Purifícalo: destruye sus dos brazaletes dorados', 'Mantén E junto a su núcleo para canalizar la luz'] },
  cerezo: { nom: 'Gólem del Cerezo', sub: 'Guardián del Bioma del Cerezo', ic: 'flor', alto: 4, osc: 650, vel: 3.4, fases: 3, dmg: 1.3,
    estilo: { piel: 0x6b4a2f, sec: 0xf29bb9, ojo: 0x6fd8ff, calma: 0x9a7a5a, geo: 'madera', aspecto: 'madera', delgado: true }, equilibrio: 140, activ: { tipo: 'arboles', item: 'semilla', n: 3 },
    ataques: { 1: ['petalos', 'raices'], 2: ['petalos', 'raices', 'combo'], 3: ['petalos', 'raices', 'combo'] }, dif: 3, xp: 650, rec: [['nucleo_cerezo', 1], ['esencia', 3]],
    desc: 'Un guardián de madera envuelto en hojas rosadas protege el bosque sagrado. El más rápido y elegante. Recomendado: nivel 8.',
    txt: ['Reúne 3 Semillas Espirituales (una está en la Gruta de las Luciérnagas)', 'Plántalas en los 3 cerezos marchitos de su arena ({interactuar})', 'Purifícalo: quema su manto de hojas con el haz y rompe sus cristales', 'Mantén E junto a su núcleo para canalizar la luz'] }
};
const FASE_TXT = { musgoso: { 2: 'El musgo lo regenera: arráncalo' }, escarcha: { 2: 'Ventisca: busca el calor de las fogatas', 3: 'Armadura de cristal: rómpela cuerpo a cuerpo' },
  arena: { 2: 'Se desarma: rompe sus cadenas', 3: 'Arenas movedizas: ve hacia las columnas' }, marea: { 2: 'Solo sus brazaletes son vulnerables', 3: 'Diluvio: sube a las plataformas' },
  cerezo: { 2: 'Invoca una espada de cristal', 3: 'Florece: se cura y acelera' } };

// misiones de los guardianes (se revelan tras «El Faro dormido»)
for (const id in JEFES) {
  const D = JEFES[id], q = { id: 'g_' + id, nom: D.nom, dif: D.dif, tipo: 's', des: { tras: 'faro' }, desc: D.desc, rec: { xp: D.xp, items: D.rec },
    pasos: ['items', 'pelea', 'purificado', 'canal'].map((e, i) => ({ k: 'ev', ev: 'jefe:' + id + ':' + e, txt: D.txt[i], pos: () => Jefes.guia(id, e) })) };
  MIS.push(q); Q[q.id] = q;
}
// lugares descubribles con viaje rápido (en la entrada de cada arena)
for (const id in ARENAS) {
  const A = ARENAS[id], l = Math.hypot(A.x, A.z), ux = -A.x / l, uz = -A.z / l;
  LUGARES.push({ id: 'arena_' + id, nom: 'Arena del ' + JEFES[id].nom, ic: JEFES[id].ic, x: A.x + ux * (R_ARENA + 16), z: A.z + uz * (R_ARENA + 16), r: 46, xp: 30, viaje: 1 });
}

// ataques: telegrafía (s), activo (s), recuperación (s), daño base, alcance, interrumpible con el pulso (y aturde
// al pararlo con la guardia), imparable (llega del cielo o del suelo: la guardia no lo detiene), pose y brillo
// (destello de aviso antes de un golpe que se puede parar: 0/1 la mano, -1 el cuerpo, 'alterna' en el combo)
/* equilibrio de los gólems: los golpes lo gastan según su peso; al agotarse queda aturdido con el núcleo expuesto.
   Los golpes pesados en pleno aviso y las paradas lo hacen tambalearse (interrumpe el ataque). */
const EQUILIBRIO = { peso: [0, .6, 1, 1.6], contra: 1.5, parada: .35, pulso: 12, recupera: 8, espera: 3, tambaleo: { parada: 1.2, pesado: .8 }, roto: 3.5, avisoBrillo: .32 };

const ATQ = {
  onda: { tele: 1.2, act: 1.3, rec: .8, dmg: 16, rango: 16, int: true, imparable: true, pose: 'golpe' },
  lluvia: { tele: 2.0, act: .5, rec: .6, dmg: 18, int: false, imparable: true, pose: 'alzar' },
  embestida: { tele: 1.5, act: 1.8, rec: .6, dmg: 20, int: true, pose: 'carga', lejos: 7, brillo: -1 },
  aliento: { tele: 1.0, act: 1.0, rec: .6, dmg: 10, int: true, pose: 'aliento', cerca: 13 },
  estacas: { tele: 1.3, act: .9, rec: .9, dmg: 18, int: false, imparable: true, pose: 'golpe' },
  garras: { tele: .9, act: .4, rec: .7, dmg: 18, int: true, pose: 'barrido', cerca: 9, brillo: 1 },
  tormenta: { tele: 1.8, act: 3.0, rec: .8, dmg: 10, int: true, imparable: true, pose: 'girar' },
  movedizas: { tele: 2.0, act: .2, rec: .4, dmg: 0, int: false, imparable: true, pose: 'alzar' },
  cascada: { tele: 1.0, act: 1.7, rec: .7, dmg: 20, int: true, imparable: true, pose: 'alzar' },
  torbellino: { tele: 1.2, act: 5.0, rec: .6, dmg: 6, int: false, imparable: true, pose: 'girar' },
  proyectiles: { tele: .8, act: 2.4, rec: .6, dmg: 12, int: true, pose: 'disparo' },
  petalos: { tele: .8, act: .2, rec: .8, dmg: 14, int: true, pose: 'barrido' },
  raices: { tele: 1.5, act: 1.4, rec: .6, dmg: 12, int: false, imparable: true, pose: 'alzar' },
  combo: { tele: .55, act: 1.8, rec: .8, dmg: 16, int: true, pose: 'combo', cerca: 8, brillo: 'alterna' }
};

/* cada familia de gesto avisa con su sonido (se reconoce el ataque antes de verlo) */
const AVISO_SONIDO = { golpe: 'avisoGolpe', combo: 'avisoGolpe', alzar: 'avisoAlzar', carga: 'avisoCarga', barrido: 'avisoBarrido', girar: 'avisoBarrido', aliento: 'avisoSoplo', disparo: 'avisoSoplo' };

const Jefes = (() => {
  const B_ = {}, LUCES = [], PK = [], RECS = [], geos = {}, decGeo = {};
  const FIGHT = { despertar: 1, combate: 1, fase: 1, aturdido: 1, tambaleo: 1 };
  /* solo es sólido mientras lucha: al despertar tarda `formacion` s en tomar peso y aparta a Hikari a `empuje` m/s (sin saltos) */
  const SOLIDEZ = { formacion: .8, empuje: 14 };
  const esSolido = B => B.estado === 'despertar' ? B.t >= SOLIDEZ.formacion : !!FIGHT[B.estado];
  const _v = new THREE.Vector3();
  let activo = null, tSync = 0;
  const st = id => { const S = Sis.ST; if (!S.jefes) S.jefes = {}; return S.jefes[id] || (S.jefes[id] = { rec: {}, got: 0, slots: {}, inv: false, visto: false, der: false, can: false }); };
  const dirE = id => { const A = ARENAS[id], l = Math.hypot(A.x, A.z) || 1; return { x: -A.x / l, z: -A.z / l }; };
  const std = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .85, flatShading: true }, o || {}));
  const mesh = (g, m, x, y, z) => { const o = new THREE.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); o.castShadow = true; return o; };
  const halo = (c, s, op) => { const sp = new Halo(c, op === undefined ? .8 : op); sp.scale.set(s, s, 1); return sp; };
  function bloque(geo, w, h, d, mat, seed) {
    let g;
    if (geo === 'roca') g = abollar(icoSuave(.5, 1), .14, 2.2, seed);
    else if (geo === 'cristal') g = new THREE.IcosahedronGeometry(.5, 0);
    else if (geo === 'agua') g = new THREE.IcosahedronGeometry(.5, 1);
    else g = new THREE.CylinderGeometry(.42, .5, 1, 7);
    const m = new THREE.Mesh(g, mat); m.scale.set(w, h, d); m.castShadow = true; return m;
  }

  /* ---------- telegrafía en el suelo ---------- */
  function decal(B, tipo, x, z, o) {
    let g = decGeo[tipo]; if (tipo === 'sector') g = new THREE.CircleGeometry(1, 24, -o.ang / 2, o.ang).rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: o.color || 0xff2a2a, transparent: true, opacity: .4, depthWrite: false, side: THREE.DoubleSide, fog: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.position.set(x, B.A.y + .12, z); m.renderOrder = 3; m.userData.sector = tipo === 'sector';
    if (tipo === 'rect') { m.rotation.y = o.yaw; m.scale.set(o.w, 1, o.len); } else if (tipo === 'sector') { m.rotation.y = o.yaw - Math.PI / 2; m.scale.setScalar(o.r); } else m.scale.setScalar(o.r);
    scene.add(m); B.decs.push(m); return m;
  }
  const quitarMalla = m => { scene.remove(m); if (m.material && m.material.dispose && !m.userData.compartido) m.material.dispose(); if (m.userData.sector) m.geometry.dispose(); };
  function limpiarDecals(B) { for (const m of B.decs) quitarMalla(m); B.decs.length = 0; }
  function limpiarTemp(B) { for (const m of B.temp) scene.remove(m); B.temp.length = 0; }
  function limpiarTodo(B) {
    limpiarDecals(B); limpiarTemp(B); for (const p of B.proy) scene.remove(p.m); B.proy.length = 0; for (const z of B.zonas) quitarMalla(z.dec); B.zonas.length = 0;
    DirectorCombate.liberar(B); B.atq = null; B.yaw += B.spin; B.spin = 0; if (B.diluvioMesh) B.diluvioMesh.visible = false; B.ventisca = 0; B.diluvio = 0; B.vt = 0;
  }
  const dentro = (B, x, z) => { const dx = x - B.A.x, dz = z - B.A.z, r = Math.hypot(dx, dz), m = R_ARENA - 2; return r > m ? { x: B.A.x + dx / r * m, z: B.A.z + dz / r * m } : { x, z }; };
  const enSector = (B, yaw, r, ang, J) => Math.hypot(J.x - B.x, J.z - B.z) < r + .4 && Math.abs(angDif(yaw, Math.atan2(J.x - B.x, J.z - B.z))) < ang / 2;
  /* daño a Hikari; el combate decide si lo detiene la guardia o una parada (21-combate.js) */
  function herir(B, base, empuje, proy) {
    const J = Sis.J; if (!J.vivo) return; const dm = base * B.dmgF(), A = B.atq && B.atq.A;
    const e = { dmg: dm, B, int: !!(A && A.int), imparable: !!(A && A.imparable), proy: !!proy };
    if (empuje !== false) { e.x = B.x; e.z = B.z; }
    Bus.emit('dañoJugador', e); Mando.vibrar(.8, .6, 250);
  }
  function disparar(B, o, t, v, tipo) {
    const dx = t.x - o.x, dy = t.y - o.y, dz = t.z - o.z, d = Math.hypot(dx, dy, dz) || 1, pet = tipo === 'petalo';
    const m = new THREE.Mesh(pet ? geos.petalo : geos.orbe, pet ? B.mt.petalo : B.mt.orbe); m.position.copy(o); scene.add(m);
    B.proy.push({ m, vx: dx / d * v, vy: dy / d * v, vz: dz / d * v, t: 2.6, dmg: pet ? 13 : 10 });
  }
  function proyectiles(B, dt, J) {
    for (let i = B.proy.length - 1; i >= 0; i--) {
      const p = B.proy[i], q = p.m.position; p.t -= dt; q.x += p.vx * dt; q.y += p.vy * dt; q.z += p.vz * dt; p.m.rotation.x += dt * 6; p.m.rotation.y += dt * 4;
      let fuera = p.t <= 0 || q.y < B.A.y - .4;
      if (!fuera && Math.hypot(q.x - J.x, q.y - (J.y + 1), q.z - J.z) < 1.15) { herir(B, p.dmg, true, true); fuera = true; }
      if (fuera) { scene.remove(p.m); B.proy.splice(i, 1); }
    }
  }
  function zona(B, x, z, r, t, o) {
    const dec = decal(B, 'disco', x, z, { r, color: o.color }); B.decs.splice(B.decs.indexOf(dec), 1);
    B.zonas.push(Object.assign({ x, z, r, t, dec, tick: 0 }, o));
  }
  function zonas(B, dt, J) {
    for (let i = B.zonas.length - 1; i >= 0; i--) {
      const zo = B.zonas[i]; zo.t -= dt; zo.dec.material.opacity = Math.min(.45, zo.t * .5);
      if (Math.hypot(J.x - zo.x, J.z - zo.z) < zo.r && J.y - B.A.y < 1) { if (zo.lento) J.lento = .3; zo.tick -= dt; if (zo.dps && zo.tick <= 0) { zo.tick = .5; herir(B, zo.dps * .5, false); } }
      if (zo.t <= 0) { quitarMalla(zo.dec); B.zonas.splice(i, 1); }
    }
  }

  /* ---------- ataques (23-ataques-golem.js) y arenas con sus objetos (31-arenas.js) ---------- */
  let AT = null, AR = null;

  /* ---------- habilidades pasivas por fase ---------- */
  function pasivas(B, dt, J) {
    if (B.estado !== 'combate' && B.estado !== 'aturdido') return;
    const id = B.id;
    if (id === 'musgoso' && B.fase >= 2 && B.estado === 'combate') {
      const vivos = B.M.debiles.filter(w => !w.roto);
      if (vivos.length) { B.osc = Math.min(B.oscMax * .66, B.osc + 4 * vivos.length * dt); if (Math.random() < dt * 6) { const p = pick(vivos).mesh.getWorldPosition(_v); FX.emit(p.x, p.y, p.z, rnd(-.5, .5), rnd(.5, 1.5), rnd(-.5, .5), 1, .3, 0x9dff7a, .9); } }
    }
    if (id === 'escarcha') {
      B.expuesto = Math.max(0, B.expuesto - dt);
      if (B.fase >= 2) {
        B.vt += dt;
        if (B.ventisca > 0) {
          B.ventisca -= dt; const cerca = RECS.some(rc => rc.tipo === 'fogata' && rc.lit > 0 && Math.hypot(J.x - rc.x, J.z - rc.z) < 5.5);
          B.frio = cerca ? 0 : B.frio + dt; if (B.frio > 1) { B.frio = 0; herir(B, 5, false); }
          if (B.ventisca <= 0) { B.vt = 0; UI.aviso('La ventisca amaina', 'conteo'); }
        } else if (B.vt > 20) { B.ventisca = 12; UI.aviso('¡Ventisca! Enciende una fogata (haz, pulso o mantén E) y quédate cerca', 'error'); Sonido.sfx('alerta'); }
      }
      if (B.fase >= 3 && B.armadura <= 0) { B.tArm -= dt; if (B.tArm <= 0) { B.armadura = 90; UI.aviso('Se cubre de cristal: rómpelo cuerpo a cuerpo', 'error'); } }
      B.M.armadura.visible = B.armadura > 0;
    }
    if (id === 'marea' && B.fase >= 3) {
      B.vt += dt;
      if (B.diluvio > 0) {
        B.diluvio -= dt; const h = Math.min(1, (15 - B.diluvio) / 2) * Math.min(1, B.diluvio / 1.5); B.diluvioMesh.visible = true; B.diluvioMesh.position.y = B.A.y - .5 + 1.35 * h;
        if (J.y < B.A.y + .8 && Math.hypot(J.x - B.A.x, J.z - B.A.z) < R_ARENA && h > .5) { B.agua += dt; if (B.agua > 1) { B.agua = 0; herir(B, 6, false); } }
        if (B.diluvio <= 0) { B.vt = 0; B.diluvioMesh.visible = false; }
      } else if (B.vt > 18) { B.diluvio = 15; UI.aviso('¡Diluvio! Sube a las plataformas de piedra', 'error'); Sonido.sfx('chapuzon'); }
    }
    if (id === 'arena') B.desarme = B.fase >= 2;
  }

  /* ---------- daño, puntos débiles y estados ---------- */
  function dañar(B, cant, fuente) {
    if (B.estado !== 'combate' && B.estado !== 'aturdido' && B.estado !== 'tambaleo') return 0;
    const at = B.estado === 'aturdido', debil = fuente === 'debil';
    let mult = B.multT > 0 ? B.multV : 1;
    if (at) mult *= 1.5;
    if (B.id === 'marea' && B.fase === 2 && !at && !debil) mult = 0;
    if (B.id === 'escarcha' && B.armadura > 0 && !at) {
      if (fuente === 'melee') { B.armadura -= cant; if (B.armadura <= 0) { B.tArm = 16; B.M.armadura.visible = false; Sonido.sfx('cristal'); FX.rafaga(B.x, B.A.y + B.D.alto * .55, B.z, 40, 6, 1, .35, 0xe8f8ff); UI.aviso('¡Armadura de cristal rota!', 'conteo'); } }
      mult *= fuente === 'melee' ? .25 : 0;
    }
    if (B.id === 'cerezo' && !at && B.M.debiles.some(w => w.tipo === 'hojas' && !w.roto)) mult *= .7;
    const v = cant * mult;
    if (v <= 0) { if (fuente === 'melee') { FX.numero('inmune', B.x, B.A.y + B.D.alto, B.z, '#9fb8c8'); Sonido.sfx('cristal'); } return 0; }
    B.osc -= v; B.flash = .12;
    FX.numero(String(Math.round(v)), B.x + rnd(-1, 1), B.A.y + B.D.alto * .8, B.z + rnd(-1, 1), mult > 1.2 ? '#ffd27a' : '#ffffff');
    if (B.osc <= 0) { purificar(B); return v; }
    const f = B.osc / B.oscMax, nf = (B.D.fases >= 3 && f <= .33) ? 3 : (B.D.fases >= 2 && f <= .66) ? 2 : 1;
    if (nf > B.fase) subirFase(B, nf);
    return v;
  }
  function dañarDebil(B, w, cant, fuente) {
    if (w.roto) return false; const at = B.estado === 'aturdido';
    if (w.tipo === 'nucleo') {
      if (at) return false;
      if (B.expuesto <= 0) { if (fuente === 'melee') { FX.numero('protegido', B.x, B.A.y + B.D.alto, B.z, '#9fd8ff'); Sonido.sfx('cristal'); } return false; }
      if (fuente === 'haz') { w.acum = (w.acum || 0) + cant; if (w.acum < 6) return true; w.acum = 0; }
      w.golpes++; Sonido.sfx('cristal'); UI.aviso('Núcleo ' + w.golpes + '/3', 'conteo');
      if (w.golpes >= 3) { w.golpes = 0; B.expuesto = 0; aturdir(B, 4); } return true;
    }
    w.hp -= cant * (fuente === 'haz' && (w.tipo === 'musgo' || w.tipo === 'hojas') ? 2.5 : 1);
    if (w.hp <= 0) romper(B, w); return true;
  }
  function romper(B, w) {
    w.roto = true; w.mesh.visible = false; const p = w.mesh.getWorldPosition(_v);
    FX.rafaga(p.x, p.y, p.z, 26, 5, .9, .35, { musgo: 0x9dff7a, cadena: 0x8a7a6a, brazalete: 0xffd27a, hojas: 0xf29bb9, cristal: 0x7fd8ff }[w.tipo]); Sonido.sfx('cristal');
    const vivos = t => B.M.debiles.filter(x => x.tipo === t && !x.roto).length;
    if (w.tipo === 'musgo') { B.multT = 6; B.multV = 1.5; UI.aviso('Musgo arrancado: recibe más daño durante 6 s', 'conteo'); }
    else if (w.tipo === 'cadena' && !vivos('cadena')) { UI.aviso('¡Cadenas rotas! Sus piezas caen', 'conteo'); aturdir(B, 5); }
    else if (w.tipo === 'brazalete' && !vivos('brazalete')) { UI.aviso('¡Brazaletes destruidos! Pierde su forma', 'conteo'); B.multT = 6; B.multV = 2; aturdir(B, 6); }
    else if (w.tipo === 'hojas') { B.multT = 10; B.multV = 1.5; UI.aviso('Su manto de hojas arde: el tronco queda al descubierto', 'conteo'); aturdir(B, 3); }
    else if (w.tipo === 'cristal') { B.cristRotos++; UI.aviso('Cristal roto: su energía se debilita', 'conteo'); if (B.cristRotos >= 3) aturdir(B, 4); }
  }
  function restaurarDebiles(B, todos) {
    for (const w of B.M.debiles) if (todos || w.tipo === 'cadena' || w.tipo === 'brazalete') { w.roto = false; w.hp = w.max; w.golpes = 0; w.mesh.visible = true; }
    if (todos) B.cristRotos = 0;
  }
  /* equilibrio: lo gastan los golpes (más los pesados) y las paradas; se recupera si no lo golpean */
  function desequilibrar(B, v) {
    if (B.estado !== 'combate' && B.estado !== 'tambaleo') return;
    B.eq = Math.max(0, B.eq - v); B.tEq = 0;
    if (B.eq <= 0) { B.eq = B.eqMax; UI.aviso('¡Pierde el equilibrio! Su núcleo queda expuesto', 'conteo'); aturdir(B, EQUILIBRIO.roto); }
  }
  /* tambaleo corto: interrumpe el ataque en curso */
  function tambalear(B, s) {
    if (B.estado !== 'combate') return;
    DirectorCombate.interrumpido(B); limpiarDecals(B); limpiarTemp(B); B.atq = null; B.yaw += B.spin; B.spin = 0; B.estado = 'tambaleo'; B.t = 0; B.dur = s; B.cd = .6;
    Sonido.sfx('golpe', { peso: 3 }); Sis.J.shake = Math.max(Sis.J.shake, .6);
  }
  /* parada de Hikari (21-combate.js): gasta equilibrio y, si el ataque es interrumpible, lo hace tambalearse */
  function parada(B, e) {
    if (!FIGHT[B.estado]) return;
    if (e.int && !e.proy) { tambalear(B, EQUILIBRIO.tambaleo.parada); UI.aviso('¡Parada! El guardián se tambalea', 'conteo'); }
    desequilibrar(B, B.eqMax * EQUILIBRIO.parada * (e.proy ? .3 : 1));
    Golems.golpe(B, B.x - Sis.J.x, B.z - Sis.J.z, 3);
  }
  function aturdir(B, s) {
    if (!FIGHT[B.estado] || B.estado === 'fase') return;
    DirectorCombate.interrumpido(B); limpiarDecals(B); limpiarTemp(B); B.atq = null; B.yaw += B.spin; B.spin = 0; B.estado = 'aturdido'; B.t = 0; B.dur = s;
    if (!B.avisoAt) { B.avisoAt = 1; UI.aviso('¡Aturdido! Apunta el haz de luz a su núcleo ({haz})', 'mision'); }
    Sonido.sfx('cristal'); Mando.vibrar(.6, .9, 300);
  }
  function subirFase(B, nf) {
    DirectorCombate.interrumpido(B); limpiarDecals(B); limpiarTemp(B); B.atq = null; B.yaw += B.spin; B.spin = 0;
    B.fase = nf; B.estado = 'fase'; B.t = 0; UI.banner(B.D.nom, 'Fase ' + nf + ' · ' + FASE_TXT[B.id][nf], B.D.ic, 'mision'); Sonido.sfx('trueno'); Sis.J.shake = 1; Mando.vibrar(1, 1, 500);
    if (B.id === 'escarcha' && nf === 3) B.armadura = 90;
    if (B.id === 'cerezo' && nf === 3) { if (B.cristRotos < 3) B.osc = Math.min(B.oscMax * .43, B.osc + B.oscMax * .1); B.velMul = 1.3; for (const w of B.M.debiles) if (w.tipo === 'hojas') { w.roto = false; w.hp = w.max; w.mesh.visible = true; } }
  }
  function despertar(B) {
    const S = st(B.id); limpiarTodo(B); restaurarDebiles(B, true);
    B.perfil = ProgresionEnemiga.capturar(ProgresionEnemiga.region(B.A.x, B.A.z)); B.oscMax = B.D.osc * B.perfil.vida;
    B.eqMax = B.D.equilibrio * B.perfil.equilibrio; Golems.despertar(B); B.eq = B.eqMax; B.tEq = 0;
    B.estado = 'despertar'; B.t = 0; B.solido = false; B.osc = B.oscMax; B.fase = 1; B.x = B.A.x; B.z = B.A.z; B.armadura = 0; B.tArm = 0; B.velMul = 1; B.expuesto = 0; B.avisoAt = 0;
    S.visto = true; activo = B; Sis.J.inv = Math.max(Sis.J.inv, 4.2);
    UI.banner(B.D.nom, B.D.sub, B.D.ic, 'mision'); Sonido.sfx('trueno'); Mando.vibrar(.9, .6, 700); Sis.evento('jefe:' + B.id + ':pelea');
  }
  function purificar(B) {
    const S = st(B.id); limpiarTodo(B); B.estado = 'purificado'; B.solido = false; B.t = 0; S.der = true; if (activo === B) activo = null; calma(B); Golems.calma(B);
    Cin.purificado(B, () => { const L = GUION.guardianes[B.id].liberacion; UI.banner(L.aviso, L['GF-LIB-P1'], 'pureza', 'fragmento'); });
    Sonido.sfx('fragmento'); FX.rafaga(B.x, B.A.y + B.D.alto * .6, B.z, 90, 9, 1.6, .5, 0xffe9a8, 2); Mando.vibrar(1, 1, 700);
    Sis.evento('jefe:' + B.id + ':purificado'); Sis.guardar();
  }
  function canalizar(B) {
    const S = st(B.id), SS = Sis.ST; S.can = true; B.estado = 'calmo'; B.M.nucleo.visible = false;
    // el único ascenso del guardián (Cin.liberarGuardian): al terminar o saltar la escena llegan la recuperación, el don y el manto, una sola vez
    Cin.liberarGuardian(B, () => {
      SS.hp = Sis.hpMax(); SS.luz = Sis.luzMax(); FX.rafaga(B.x, B.A.y + 2, B.z, 40, 5, 2, .3, 0xfff0b0, 2);
      const G = (GUION.guardianes[B.id] || {}).don;
      if (Sis.darDon(B.id) && G) UI.banner('Luz compartida', G.nom + ' · ' + G.txt, 'luz', 'fragmento');
      Sis.evento('jefe:' + B.id + ':canal');
      if (!SS.jefesManto && Object.keys(JEFES).every(k => st(k).can)) { SS.jefesManto = 1; Sis.dar('manto_guardian', 1); UI.banner('Los cinco guardianes descansan', 'Recibes el Manto del Guardián', 'escudo', 'mision'); }
      Sis.guardar();
    });
  }
  function calma(B) { if (B.M.armadura) B.M.armadura.visible = false; }
  function reiniciar(B, motivo) {
    limpiarTodo(B); restaurarDebiles(B, true); B.estado = 'dormido'; B.solido = false; B.t = 0; B.osc = B.oscMax; B.fase = 1; B.x = B.A.x; B.z = B.A.z; B.armadura = 0; B.velMul = 1; B.expuesto = 0; B.lejos = 0;
    if (B.M.armadura) B.M.armadura.visible = false; if (activo === B) activo = null;
    if (motivo === 'retirada') UI.aviso('El guardián vuelve a dormir. Regresa a su arena para enfrentarlo', 'conteo');
  }
  function invocar(B, msg) { const S = st(B.id); S.inv = true; UI.aviso(msg || 'El suelo tiembla… el guardián despierta', 'mision'); Sonido.sfx('trueno'); if (B.altar) B.altar.gemas.forEach(g => g.material.color.setHex(0x9dff7a)); Sis.guardar(); }
  function encender(rc, silencio) {
    if (rc.tipo === 'fogata') { if (rc.lit <= 0 && !silencio) { Sonido.sfx('farol'); UI.aviso('Fogata encendida: su calor te protege de la ventisca', 'conteo'); } rc.lit = 30 + (Sis.don('escarcha') ? Sis.DONES.escarcha.fogata : 0); return; }
    const S = st('escarcha'); rc.mat.emissiveIntensity = 1.4; rc.halo.opacidad = .9; if (S.slots[rc.i]) return;
    S.slots[rc.i] = 1; S.got = Object.keys(S.slots).length; Sonido.sfx('cristal'); FX.rafaga(rc.x, rc.y + .8, rc.z, 24, 4, 1, .3, 0x9ff0ff); UI.aviso('Baliza de hielo ' + S.got + '/4', 'conteo');
    if (S.got >= 4) invocar(B_.escarcha, 'Las cuatro balizas brillan: el Gólem de Escarcha espera en su arena helada'); Sis.guardar();
  }
  function llenarSlot(B, sl, silencio) {
    const S = st(B.id); S.slots[sl.i] = 1;
    if (sl.gl) { sl.gl.material.color.setHex(0xffc94a); sl.h.opacidad = .8; } if (sl.flor) sl.flor.visible = true;
    if (silencio) return; Sonido.sfx('recoger'); FX.rafaga(sl.x, B.A.y + 3, sl.z, 24, 4, 1, .3, sl.flor ? 0xff9ccf : 0xffc94a);
    const n = Object.keys(S.slots).length; UI.aviso((sl.flor ? 'Cerezos en flor ' : 'Glifos colocados ') + n + '/3', 'conteo'); if (n >= 3) invocar(B);
  }
  function fijarPunto(l) { Sis.ST.checkpoint = { id: l.id, x: l.x, z: l.z }; Bus.emit('avivar'); Sonido.sfx('farol'); FX.rafaga(l.x, l.y + 2, l.z, 30, 3, 1, .3, 0xffe39a); UI.aviso('Punto de luz creado: aquí reaparecerás', 'mision'); Sis.guardar(); }

  /* ---------- IA de combate ---------- */
  function limitar(B) {
    const ax = B.x - B.A.x, az = B.z - B.A.z, r = Math.hypot(ax, az), m = R_ARENA - 3; if (r > m) { B.x = B.A.x + ax / r * m; B.z = B.A.z + az / r * m; }
    for (const p of B.pilares) { const px = B.x - p.x, pz = B.z - p.z, pd = Math.hypot(px, pz), mm = p.r + B.rad * .8; if (pd < mm && pd > .01) { B.x = p.x + px / pd * mm; B.z = p.z + pz / pd * mm; } }
  }
  function elegirAtaque(B, d) {
    let lista = B.D.ataques[B.fase].filter(k => { const A = ATQ[k]; return !(A.cerca && d > A.cerca) && !(A.lejos && d < A.lejos); });
    if (!lista.length) lista = B.D.ataques[B.fase];
    const u = B.ult; if (u.length >= 2 && u[u.length - 1] === u[u.length - 2]) { const f = lista.filter(k => k !== u[u.length - 1]); if (f.length) lista = f; }
    const k = pick(lista), A = ATQ[k];
    // el director reparte los ataques: el jefe pide su permiso antes del aviso (pesado si es de zona o fuerte); sin él, espera un instante
    const zonaGrande = !!A.imparable;
    if (!DirectorCombate.pedir(B, zonaGrande || A.dmg >= 18 ? DIRECTOR.pesado : DIRECTOR.ligero, { total: A.tele + A.act + A.rec, impactos: [A.tele], avisos: [0], jefe: true, zonaGrande })) { B.cd = .35; return; }
    u.push(k); if (u.length > 4) u.shift();
    B.atq = { k, A, t: 0, fase: 'tele', d: {} }; if (AT[k].ini) AT[k].ini(B, B.atq, Sis.J); Sonido.sfx(AVISO_SONIDO[ATQ[k].pose] || 'alerta', { pos: { x: B.x, y: B.A.y + 2, z: B.z } });
  }
  function correrAtaque(B, dt, J) {
    const a = B.atq, f = AT[a.k]; a.t += dt;
    if (a.fase === 'tele') {
      if (f.tele) f.tele(B, a, dt, J); if (B.atq !== a) return;
      for (const m of B.decs) m.material.opacity = .38 + .24 * Math.sin(a.t * 14);
      const br = a.A.brillo; if (br !== undefined && !a.brilloV && a.t >= a.A.tele - EQUILIBRIO.avisoBrillo) { a.brilloV = 1; Golems.brillo(B, br === 'alterna' ? 1 : br); }
      if (a.t >= a.A.tele) { a.fase = 'act'; a.t = 0; if (f.act0) f.act0(B, a, J); }
    } else if (a.fase === 'act') {
      if (a.A.brillo === 'alterna') for (const tg of [.6, 1.2]) if (a.t >= tg - EQUILIBRIO.avisoBrillo && (a.brilloN || 0) < (tg > 1 ? 2 : 1)) { a.brilloN = (a.brilloN || 0) + 1; Golems.brillo(B, a.brilloN % 2 ? 0 : 1); }
      if (f.act) f.act(B, a, dt, J); if (B.atq !== a) return;
      if (a.t >= a.A.act || a.fin) { a.fase = 'rec'; a.t = 0; if (f.fin) f.fin(B, a); limpiarDecals(B); }
    } else if (a.t >= a.A.rec) { DirectorCombate.liberar(B); B.atq = null; B.cd = [2.3, 1.8, 1.4][B.fase - 1] * (B.velMul > 1 ? .8 : 1); limpiarTemp(B); }
  }
  function combate(B, dt, J, d) {
    if (B.atq) { B.mov = 0; correrAtaque(B, dt, J); return; }
    B.yaw = angDamp(B.yaw, Math.atan2(J.x - B.x, J.z - B.z), 3, dt);
    const pref = B.rad + 3, vel = B.D.vel * B.velMul * (1 + .1 * (B.fase - 1));
    if (d > pref) { const k = Math.min(1, (d - pref) / 2); B.x += Math.sin(B.yaw) * vel * k * dt; B.z += Math.cos(B.yaw) * vel * k * dt; B.mov = k; } else B.mov = 0;
    limitar(B); B.cd -= dt; if (B.cd <= 0 && J.vivo) elegirAtaque(B, d);
  }
  function actualizarJefe(B, dt, J) {
    const S = st(B.id); B.t += dt; B.flash = Math.max(0, B.flash - dt); B.multT = Math.max(0, B.multT - dt);
    const d = Math.hypot(J.x - B.x, J.z - B.z);
    if (B.estado === 'dormido') { if (S.inv && !S.der && J.vivo && !Cin.activa && Math.hypot(J.x - B.A.x, J.z - B.A.z) < R_ARENA - 1) despertar(B); }
    else if (B.estado === 'despertar') { if (Math.random() < dt * 30) FX.emit(B.x + rnd(-3, 3), B.A.y + .2, B.z + rnd(-3, 3), rnd(-1, 1), rnd(1, 4), rnd(-1, 1), 1.2, .5, 0x8a7a6a, .8); J.shake = Math.max(J.shake, .25); if (B.t > 4.2) { B.estado = 'combate'; B.t = 0; B.cd = 1.2; } }
    else if (B.estado === 'fase') { if (B.t > 2.2) { B.estado = 'combate'; B.t = 0; B.cd = .8; } }
    else if (B.estado === 'aturdido') { if (B.t > B.dur) { B.estado = 'combate'; B.t = 0; B.cd = .8; restaurarDebiles(B, false); } }
    else if (B.estado === 'tambaleo') { const k = Math.max(0, 1 - B.t / .4); B.x -= Math.sin(B.yaw) * k * 2 * dt; B.z -= Math.cos(B.yaw) * k * 2 * dt; limitar(B); if (B.t > B.dur) { B.estado = 'combate'; B.t = 0; } }
    else if (B.estado === 'combate') combate(B, dt, J, d);
    if (FIGHT[B.estado]) {
      B.tEq += dt; if (B.tEq > EQUILIBRIO.espera && B.estado === 'combate') B.eq = Math.min(B.eqMax, B.eq + EQUILIBRIO.recupera * dt);
      pasivas(B, dt, J); zonas(B, dt, J); proyectiles(B, dt, J);
      if (esSolido(B)) {
        if (!B.solido) { B.solido = true; Sonido.sfx('aterrizar', { vol: 1.6 }); J.shake = Math.max(J.shake, .6); const SS = Sis.ST; SS.consejos = SS.consejos || {}; if (!SS.consejos.peso) { SS.consejos.peso = 1; UI.aviso('Su cuerpo toma peso al despertar', 'conteo'); } }
        const dx = J.x - B.x, dz = J.z - B.z, dd = Math.hypot(dx, dz);
        if (dd < B.rad + .5 && J.y < B.A.y + B.D.alto * .8) { const paso = Math.min(B.rad + .5 - dd, SOLIDEZ.empuje * dt), ux = dd > .01 ? dx / dd : 0, uz = dd > .01 ? dz / dd : 1; J.x += ux * paso; J.z += uz * paso; }
      }
      if (Math.hypot(J.x - B.A.x, J.z - B.A.z) > R_ARENA + 20) { B.lejos += dt; if (B.lejos > 2) reiniciar(B, 'retirada'); } else B.lejos = 0;
      if (Math.random() < dt * 8) FX.emit(B.x + rnd(-1.5, 1.5), B.A.y + rnd(.5, B.D.alto), B.z + rnd(-1.5, 1.5), 0, rnd(.3, 1), 0, 1.4, .5, 0x3a1f4f, .7);
    }
    Golems.animar(B, dt);
  }

  /* ---------- interacción, golpes del jugador, pulso y haz ---------- */
  function interactuable(J) {
    let best = null, bd = 1e9;
    const cand = (x, z, r, txt, fn, canal) => { const d = Math.hypot(J.x - x, J.z - z); if (d < r && d < bd) { bd = d; best = { txt, fn, x, z, canal }; } };
    for (const id in B_) {
      const B = B_[id], S = st(id), D = B.D;
      if (FIGHT[B.estado]) { if (id === 'escarcha') for (const rc of RECS) if (rc.tipo === 'fogata' && rc.lit <= 0) cand(rc.x, rc.z, 3, 'Encender la fogata', () => encender(rc), .6); continue; }
      if (!S.inv) {
        if (B.altar) { const t = Sis.tiene('piedra'); cand(B.altar.x, B.altar.z, 4, t >= 3 ? 'Colocar las 3 Piedras Ancestrales' : 'Altar de Musgo · Piedras Ancestrales ' + t + '/3', () => { if (Sis.tiene('piedra') >= 3) { Sis.quitar('piedra', 3); invocar(B); } else UI.aviso('Necesitas 3 Piedras Ancestrales de la Pradera del Alba'); }); }
        for (const sl of B.slots) if (!S.slots[sl.i]) { const it = D.activ.item, nom = ITEMS[it].nom, col = D.activ.tipo === 'columnas';
          cand(sl.x, sl.z, 3.6, Sis.tiene(it) ? (col ? 'Colocar el ' : 'Plantar la ') + nom : (col ? 'Columna rota · necesita un ' : 'Cerezo marchito · necesita una ') + nom, () => { if (!Sis.tiene(it)) { UI.aviso('Te falta: ' + nom); return; } Sis.quitar(it, 1); llenarSlot(B, sl); }); }
        if (B.estanque) cand(B.estanque.x, B.estanque.z, 7, Sis.tiene('perlaMarea') ? 'Lanzar la Perla de Marea al estanque' : 'Estanque Sagrado · necesita la Perla de Marea', () => { if (Sis.tiene('perlaMarea')) { Sis.quitar('perlaMarea', 1); invocar(B); } else UI.aviso('La Perla de Marea descansa en lo más hondo de la laguna. Bucea ({agacharse}) para encontrarla'); });
      }
      if (S.der && !S.can) cand(B.x, B.z, B.rad + 4.5, 'Canalizar junto al núcleo de ' + D.nom, () => canalizar(B), 3);
    }
    const se = st('escarcha'); for (const rc of RECS) if (rc.tipo === 'baliza' && !se.slots[rc.i]) cand(rc.x, rc.z, 3.2, 'Encender la baliza de hielo', () => encender(rc), 1);
    const cp = Sis.ST.checkpoint; for (const l of LUCES) if (!cp || cp.id !== l.id) cand(l.x, l.z, 3, 'Crear un punto de luz', () => fijarPunto(l), 1.2);
      else if (Llamas.n < LLAMAS.max) cand(l.x, l.z, 3, 'Avivar tus llamas', () => Bus.emit('avivar'), 1.2);   // en el punto de luz actual
    return best;
  }
  /* golpe de Hikari: o = { peso (1-3), contra } (21-combate.js) */
  function golpear(J, alc, ang, dmg, o) {
    const B = activo; if (!B || (B.estado !== 'combate' && B.estado !== 'aturdido' && B.estado !== 'tambaleo')) return 0;
    const peso = (o && o.peso) || 1;
    const ox = J.x, oy = J.y + 1, oz = J.z; let mejor = null, md = 1e9; B.M.root.updateMatrixWorld(true);
    for (const w of B.M.debiles) { if (w.roto) continue; const p = w.mesh.getWorldPosition(_v), d = Math.hypot(p.x - ox, p.y - oy, p.z - oz); if (d > alc + w.r + 1.3) continue; if (d > 1.5 && Math.abs(angDif(J.yaw, Math.atan2(p.x - ox, p.z - oz))) > ang + .5) continue; if (d < md) { md = d; mejor = w; } }
    let hit = 0;
    let px = 0, py = 0, pz = 0;
    if (mejor && dañarDebil(B, mejor, dmg, 'melee')) { hit = 1; dañar(B, dmg * .5, 'debil'); mejor.mesh.getWorldPosition(_v); px = _v.x; py = _v.y; pz = _v.z; }
    else { const d = Math.hypot(B.x - ox, B.z - oz); if (d < alc + B.rad + .4 && (d < B.rad + 1 || Math.abs(angDif(J.yaw, Math.atan2(B.x - ox, B.z - oz))) < ang + .4)) { dañar(B, dmg, 'melee'); hit = 1; const l = d || 1; px = B.x - (B.x - ox) / l * B.rad; py = oy + .3; pz = B.z - (B.z - oz) / l * B.rad; } }
    if (hit) {
      Mando.vibrar(.5, .3, 90); Golems.golpe(B, B.x - ox, B.z - oz, peso, px, py, pz);
      if (peso >= 3 && B.atq && B.atq.fase === 'tele' && B.atq.A.int) { tambalear(B, EQUILIBRIO.tambaleo.pesado); UI.aviso('¡Golpe pesado! Interrumpes su ataque', 'conteo'); }
      desequilibrar(B, dmg * EQUILIBRIO.peso[peso] * (o && o.contra ? EQUILIBRIO.contra : 1));
    }
    return hit;
  }
  function pulso(J, r, dmg) {
    for (const rc of RECS) if (Math.hypot(J.x - rc.x, J.z - rc.z) < 7 && Math.abs(J.y - rc.y) < 5) encender(rc);
    const B = activo; if (!B || !FIGHT[B.estado]) return; const d = Math.hypot(J.x - B.x, J.z - B.z); if (d > r + B.rad) return;
    if (B.atq && B.atq.fase === 'tele' && B.atq.A.int && d < 12 + B.rad) { UI.aviso('¡Ataque interrumpido!', 'conteo'); aturdir(B, 1.6); }
    dañar(B, dmg * .5, 'pulso'); desequilibrar(B, EQUILIBRIO.pulso);
    for (const w of B.M.debiles) if (!w.roto && (w.tipo === 'musgo' || w.tipo === 'hojas' || w.tipo === 'cristal')) { const p = w.mesh.getWorldPosition(_v); if (Math.hypot(p.x - J.x, p.z - J.z) < 7) dañarDebil(B, w, dmg * .6, 'pulso'); }
  }
  function esferas() {
    const L = [];
    for (const rc of RECS) { if (rc.tipo === 'baliza' && st('escarcha').slots[rc.i]) continue; if (rc.tipo === 'fogata' && !(activo && activo.id === 'escarcha')) continue; L.push({ tipo: 'receptor', rc, x: rc.x, y: rc.y, z: rc.z, r: rc.r }); }
    const B = activo;
    if (B && FIGHT[B.estado]) {
      B.M.root.updateMatrixWorld(true);
      for (const w of B.M.debiles) if (!w.roto) { const p = w.mesh.getWorldPosition(new THREE.Vector3()); L.push({ tipo: 'debil', B, w, x: p.x, y: p.y, z: p.z, r: w.r * 1.25 }); }
      if (B.estado === 'aturdido') { const p = B.M.nucleo.getWorldPosition(new THREE.Vector3()); L.push({ tipo: 'nucleo', B, x: p.x, y: p.y, z: p.z, r: B.M.E * .17 }); }
      L.push({ tipo: 'cuerpo', B, x: B.x, y: B.A.y + B.D.alto * .5, z: B.z, r: B.rad * 1.15 + .3 });
    }
    return L;
  }
  function rayo(o, d, max) {
    let best = null, bt = max;
    for (const s of esferas()) { const cx = s.x - o.x, cy = s.y - o.y, cz = s.z - o.z, t = cx * d.x + cy * d.y + cz * d.z; if (t < 0) continue; const q = cx * cx + cy * cy + cz * cz - t * t, r2 = s.r * s.r; if (q > r2) continue; const th = Math.max(0, t - Math.sqrt(r2 - q)); if (th < bt) { bt = th; best = s; } }
    for (let s = 1; s < bt; s += .8) { const x = o.x + d.x * s, y = o.y + d.y * s, z = o.z + d.z * s; if (y < altura(x, z)) { bt = s; best = null; break; } }
    return { s: best, t: bt };
  }
  function hazImpacto(hit, dt) {
    const s = hit && hit.s; if (!s) return; const dps = 10 * Sis.dmgMult();
    if (s.tipo === 'receptor') { s.rc.carga += dt; if (s.rc.carga > .7) { s.rc.carga = 0; encender(s.rc); } return; }
    // el haz expone y rompe defensas (hojas, musgo, carga del núcleo) pero no resta vida al gólem: eso es de los golpes, flechas y magia (Impacto)
    const B = s.B;
    if (s.tipo === 'debil') dañarDebil(B, s.w, dps * dt, 'haz');
  }

  /* ---------- guía, sincronía con misiones y ciclo ---------- */
  function guia(id, etapa) {
    const B = B_[id], S = st(id), J = Sis.J || { x: 0, z: 0 }; if (!B) return null;
    if (etapa === 'items' && S.got < B.D.activ.n) {
      let b = null, bd = 1e9; for (const p of PK) if (p.on && p.id === id) { const d = Math.hypot(p.x - J.x, p.z - J.z); if (d < bd) { bd = d; b = p; } }
      if (id === 'escarcha') for (const rc of RECS) if (rc.tipo === 'baliza' && !S.slots[rc.i]) { const d = Math.hypot(rc.x - J.x, rc.z - J.z); if (d < bd) { bd = d; b = rc; } }
      // una semilla en el fondo de una cueva, con Hikari por encima (en la loma): la guía lleva a la boca, no al punto de arriba que no enseña nada
      if (b && b.pid && b.y < altura(b.x, b.z) - 3 && J.y > b.y + 3) { const c = CUEVAS.find(q => Math.hypot(q.cx - b.x, q.cz - b.z) < q.Rc + 4); if (c && c.pts && c.pts[0]) return { x: c.pts[0].x, z: c.pts[0].z }; }
      if (b) return { x: b.x, z: b.z };
    }
    if (etapa === 'items' || etapa === 'pelea') { if (B.altar && !S.inv) return { x: B.altar.x, z: B.altar.z }; for (const sl of B.slots) if (!S.slots[sl.i]) return { x: sl.x, z: sl.z }; }
    return { x: B.x, z: B.z };
  }
  function sincronizar() {
    const S = Sis.ST; if (!S.mis) return;
    for (const id in JEFES) {
      const qid = 'g_' + id; if (!S.mis[qid] && S.mis.faro && S.mis.faro.e === 'hecha') Sis.revelar(qid);
      const m = S.mis[qid]; if (!m || m.e !== 'activa') continue; const s = st(id);
      if (s.got >= JEFES[id].activ.n || s.inv) Sis.evento('jefe:' + id + ':items'); if (s.visto) Sis.evento('jefe:' + id + ':pelea');
      if (s.der) Sis.evento('jefe:' + id + ':purificado'); if (s.can) Sis.evento('jefe:' + id + ':canal');
    }
  }
  function iniciar() {
    AT = AtaquesGolem({ decal, herir, zona, disparar, dentro, enSector, limitar, aturdir, geos });
    AR = ArenasGolem({ RECS, PK, LUCES, st, dirE, std, mesh, halo, bloque, encender });
    geos.roca = abollar(icoSuave(1, 1), .3, 1.4, 7); geos.pincho = new THREE.ConeGeometry(.45, 2.4, 6); geos.orbe = new THREE.SphereGeometry(.42, 12, 8); geos.petalo = new THREE.OctahedronGeometry(.32); geos.caja = new THREE.BoxGeometry(1, 1, 1);
    decGeo.disco = new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2); decGeo.anillo = new THREE.RingGeometry(.86, 1, 48).rotateX(-Math.PI / 2); decGeo.rect = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    for (const id in JEFES) {
      const D = JEFES[id], A = { x: ARENAS[id].x, z: ARENAS[id].z, y: sitio('arena_' + id).h }, M = Golems.crear(id), de = dirE(id);
      scene.add(M.root);
      const B = { id, D, A, M, x: A.x, z: A.z, yaw: Math.atan2(de.x, de.z), estado: 'dormido', t: 0, osc: D.osc, oscMax: D.osc, eqMax: D.equilibrio, fase: 1, atq: null, cd: 1, ult: [], decs: [], temp: [], proy: [], zonas: [],
        rad: M.E * (id === 'marea' ? .2 : .22), eq: D.equilibrio, tEq: 0, mov: 0, paso: 0, spin: 0, flash: 0, multT: 0, multV: 1, expuesto: 0, armadura: 0, tArm: 0, vt: 0, ventisca: 0, diluvio: 0, frio: 0, agua: 0, cristRotos: 0, lejos: 0, velMul: 1, P: null };
      B.mt = { roca: std(0x8a8478), pincho: std(D.estilo.piel, { transparent: !!D.estilo.trans, opacity: .92 }), raiz: std(0x5a3a22), orbe: new THREE.MeshBasicMaterial({ color: 0x9ffff0 }), petalo: new THREE.MeshBasicMaterial({ color: 0xff9ccf, side: THREE.DoubleSide }),
        ola: new THREE.MeshStandardMaterial({ color: 0x5fe0d0, transparent: true, opacity: .55, roughness: .1, emissive: 0x1f6a60, emissiveIntensity: .4 }) };
      B.dmgF = () => D.dmg * (B.perfil ? B.perfil.daño : 1) * (1 + .12 * (B.fase - 1)) * (id === 'cerezo' ? 1 - .15 * B.cristRotos : 1);
      AR.vestir(B); B_[id] = B; AR.crearLinterna('arena_' + id, A.x + de.x * (R_ARENA + 9), A.z + de.z * (R_ARENA + 9));
      const S = st(id); for (const sl of B.slots) if (S.slots[sl.i]) llenarSlot(B, sl, true);
      if (B.altar && S.inv) B.altar.gemas.forEach(g => g.material.color.setHex(0x9dff7a));
      if (S.der) { calma(B); Golems.calma(B, true); B.estado = S.can ? 'calmo' : 'purificado'; if (S.can) { M.nucleo.visible = false; Sis.darDon(id); } }
      Golems.animar(B, .016);
    }
    AR.lucesDelMundo(); AR.sembrarItems();
  }
  function actualizar(dt, J) {
    AR.actualizar(dt, J);
    for (const id in B_) { const B = B_[id], d = Math.hypot(J.x - B.x, J.z - B.z); B.M.root.visible = d < 260; if (d < 260 || FIGHT[B.estado]) actualizarJefe(B, dt, J); }
    tSync -= dt; if (tSync <= 0) { tSync = 1; sincronizar(); }
  }
  function postAmbiente() {
    const B = activo, J = Sis.J; if (!B || B.ventisca <= 0 || !scene.fog) return;
    scene.fog.density = Math.max(scene.fog.density * 3, .022); scene.fog.color.setRGB(.82, .88, .95);
    if (Math.random() < .6) FX.emit(J.x + rnd(-14, 14), J.y + rnd(2, 9), J.z + rnd(-14, 14), rnd(4, 9), rnd(-2, -1), rnd(-2, 2), 1.2, .18, 0xffffff, .8);
  }
  const enCombate = () => !!activo && !!FIGHT[activo.estado];
  function barra() { const B = activo; if (!enCombate()) return null; return { jefe: true, nom: B.D.nom + ' · Fase ' + B.fase + (B.estado === 'aturdido' ? ' · ¡ATURDIDO!' : '') + (B.armadura > 0 ? ' · armadura' : ''), estado: '', ani: Math.max(0, B.osc), aniMax: B.oscMax, eq: B.eq / B.eqMax }; }
  function alMorir() { for (const id in B_) if (FIGHT[B_[id].estado]) reiniciar(B_[id], 'muerte'); }
  function forzar(id, k) { const B = B_[id]; limpiarDecals(B); limpiarTemp(B); B.atq = { k, A: ATQ[k], t: 0, fase: 'tele', d: {} }; if (AT[k].ini) AT[k].ini(B, B.atq, Sis.J); }
  return { forzar, iniciar, actualizar, interactuable, golpear, parada, pulso, rayo, hazImpacto, barra, enCombate, alMorir, postAmbiente, guia, st, despertar, purificar, canalizar, aturdir, reiniciar, dañar, lista: B_, RECS, PK, LUCES, get activo() { return activo; } };
})();
