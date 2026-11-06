/* === Ecos de Luz · 06-fauna.js ===
   Comportamiento de los animales (los modelos y su animación están en 19-animales.js).
   Huidizos (ciervo, conejo, zorro, lagarto, pato) y defensivos (jabalí, lobo, oso, escorpión,
   cangrejo) que SOLO atacan si los golpeas; si te acercas, los defensivos avisan (el oso se
   yergue, el jabalí escarba, el lobo se agacha y gruñe). Viven en rebaños que pastan, pasean,
   se echan a descansar y huyen juntos. No mueren: al agotarse su ánimo se calman. */
"use strict";

/* especies: tipo, ánimo, velocidad, radio, medidas del modelo, colores, marcha, rebaño [mín, máx],
   amenaza (cómo avisan los defensivos) y ofrenda */
const ESPECIES = {
  ciervo: { nom: 'Ciervo', tipo: 'huidizo', ani: 40, vel: 6.8, r: .7, forma: 'cuad', len: 1.3, w: .27, bh: .5, leg: .85, hr: .14, cuello: 1.35, cuelloAng: 52, colaCaida: .3, col: 0xa8764a, vie: 0xeadcc0, pata: 0x6b4a2e, pezuna: 1, orej: 'p', cuernos: 1, cola: .12, colaAlerta: 1, xp: 18, ofrenda: ['pelaje', 'pelaje', 'hierba'], det: 15, rebano: [2, 4], echarse: .25 },
  conejo: { nom: 'Conejo', tipo: 'huidizo', ani: 14, vel: 7.5, r: .35, forma: 'cuad', marcha: 'salto', len: .5, w: .14, bh: .24, leg: .16, hr: .09, cuello: .45, cuelloAng: 35, cabeza: 1.15, colaCaida: -.4, col: 0xc9b79a, vie: 0xf4efe6, pata: 0xaa9a7e, orej: 'l', cola: .06, xp: 8, ofrenda: ['hierba'], det: 11, rebano: [1, 3] },
  zorro: { nom: 'Zorro', tipo: 'huidizo', ani: 24, vel: 7.2, r: .5, forma: 'cuad', len: .85, w: .17, bh: .3, leg: .36, hr: .11, cuello: .75, cuelloAng: 28, colaTupida: 1.6, colaCaida: .5, col: 0xd9762f, vie: 0xf7ead8, pata: 0x3a2a22, orej: 'p', cola: .5, hocico: .15, xp: 14, ofrenda: ['pelaje'], det: 14, olfatea: 1, echarse: .3 },
  zorroA: { nom: 'Zorro ártico', tipo: 'huidizo', ani: 24, vel: 7.2, r: .5, forma: 'cuad', len: .85, w: .17, bh: .3, leg: .36, hr: .11, cuello: .75, cuelloAng: 28, colaTupida: 1.6, colaCaida: .5, col: 0xf1f3f8, vie: 0xffffff, pata: 0xdfe3ea, orej: 'p', cola: .5, hocico: .15, xp: 16, ofrenda: ['pelaje'], det: 14, olfatea: 1, echarse: .3 },
  lagarto: { nom: 'Lagarto de arena', tipo: 'huidizo', ani: 12, vel: 6.5, r: .4, forma: 'cuad', marcha: 'reptil', len: .7, w: .1, bh: .13, leg: .12, hr: .07, cuello: .3, cuelloAng: 5, colaCaida: .05, cabeza: .9, col: 0xc9a05a, vie: 0xe8d29a, pata: 0xa8803f, orej: '', cola: .6, xp: 8, ofrenda: ['escama'], det: 10 },
  pato: { nom: 'Pato de laguna', tipo: 'huidizo', ani: 12, vel: 4.5, r: .4, forma: 'ave', xp: 8, ofrenda: ['pluma'], det: 12, agua: true, rebano: [2, 4] },
  tortuga: { nom: 'Tortuga de marea', tipo: 'tranquilo', ani: 30, vel: 1.2, r: .8, forma: 'tortuga', xp: 12, ofrenda: ['concha'], det: 0 },
  jabali: { nom: 'Jabalí', tipo: 'defensivo', ani: 60, vel: 4.2, vAtq: 11, r: .75, forma: 'cuad', len: 1.2, w: .36, bh: .55, leg: .42, hr: .2, cuello: .3, cuelloAng: 6, cuelloGrueso: 1.4, cabeza: 1.15, colaCaida: .6, col: 0x5a4636, vie: 0x7a6248, pata: 0x2c2218, pezuna: 1, orej: 'p', colmillos: 1, cola: .1, hocico: .08, xp: 35, ofrenda: ['colmillo', 'carne'], det: 0, ataque: 'embestida', dmg: 14, gruñido: 80, rebano: [2, 3], amenaza: 'escarbar', olfatea: 1, echarse: .2,
    perfil: [[-.5, .3, .28, .05], [-.45, .72, .66, .03], [-.33, .9, .86, 0], [-.15, .94, .92, 0], [.05, 1, 1, 0], [.25, 1.06, 1.1, .02], [.38, .96, 1, .04], [.47, .66, .7, .06], [.52, .3, .34, .08]] },
  lobo: { nom: 'Lobo', tipo: 'defensivo', ani: 50, vel: 5.4, vAtq: 10, r: .65, forma: 'cuad', len: 1.2, w: .24, bh: .46, leg: .5, hr: .15, cuello: .62, cuelloAng: 22, cuelloGrueso: 1.15, colaTupida: 1.25, colaCaida: .95, col: 0x9a9ea8, vie: 0xe8eaee, pata: 0x6a6f78, orej: 'p', cola: .5, hocico: .13, xp: 40, ofrenda: ['pelaje', 'colmillo'], det: 0, ataque: 'embestida', dmg: 10, gruñido: 110, rebano: [2, 3], amenaza: 'agacharse', olfatea: 1, echarse: .3 },
  oso: { nom: 'Oso', tipo: 'defensivo', aguante: 3, ani: 130, vel: 3.6, vAtq: 7.5, r: 1.1, forma: 'cuad', len: 1.7, w: .55, bh: .85, leg: .55, hr: .27, cuello: .38, cuelloAng: 10, cuelloGrueso: 1.5, cabeza: 1.3, muslo: 1.35, colaCaida: .3, col: 0x4a382c, vie: 0x6a5240, pata: 0x2a1f18, orej: 'r', cola: .08, hocico: .05, xp: 90, ofrenda: ['garra', 'pelaje', 'miel'], det: 0, ataque: 'zarpazo', dmg: 22, gruñido: 60, amenaza: 'erguirse', echarse: .2,
    perfil: [[-.5, .32, .3, .05], [-.45, .78, .72, .03], [-.33, .98, .9, 0], [-.15, .96, .9, 0], [.05, .98, .96, .02], [.25, 1.04, 1.12, .06], [.38, .92, 1.02, .06], [.47, .62, .66, .08], [.52, .28, .32, .1]] },
  escorpion: { nom: 'Escorpión', tipo: 'defensivo', aguante: 1, ani: 28, vel: 3.2, vAtq: 8, r: .5, forma: 'art', col: 0x8a5a2e, xp: 22, ofrenda: ['aguijon'], det: 0, ataque: 'picadura', dmg: 8, gruñido: 300, amenaza: 'pinzas' },
  cangrejo: { nom: 'Cangrejo', tipo: 'defensivo', aguante: 1, ani: 22, vel: 3, vAtq: 7, r: .4, forma: 'art', col: 0xd0553a, xp: 16, ofrenda: ['concha'], det: 0, ataque: 'pinza', dmg: 6, gruñido: 400, amenaza: 'pinzas', rebano: [1, 3] }
};
const BIOMA_FAUNA = [
  [['ciervo', 4], ['conejo', 4], ['jabali', 2], ['zorro', 1]],
  [['ciervo', 3], ['conejo', 3], ['jabali', 2], ['zorro', 3]],
  [['zorroA', 4], ['lobo', 2], ['conejo', 2], ['oso', .5]],
  [['lagarto', 5], ['escorpion', 3], ['conejo', .5]],
  [['pato', 5], ['cangrejo', 3], ['tortuga', 3], ['conejo', 1]]
];
const NOMBRADOS = [
  { id: 'colmillo', sp: 'jabali', nom: 'Colmillo de Bruma', x: 95, z: -92, esc: 1.5, col: 0x3b2c2c, ani: 120, dmg: 18, xp: 120 },
  { id: 'lobo1', sp: 'lobo', nom: 'Lobo blanco', x: 330, z: -150, esc: 1.15, grupo: 'manada', xp: 70 },
  { id: 'lobo2', sp: 'lobo', nom: 'Lobo blanco', x: 338, z: -141, esc: 1.1, grupo: 'manada', xp: 70 },
  { id: 'lobo3', sp: 'lobo', nom: 'Lobo blanco', x: 322, z: -140, esc: 1.2, grupo: 'manada', xp: 70 },
  { id: 'kuma', sp: 'oso', nom: 'Kuma, el oso del glaciar', x: 262, z: -292, esc: 1.5, col: 0x6a6f7c, ani: 260, dmg: 26, xp: 260 }
];
/* tiempos y distancias del comportamiento */
/* detalle según la distancia al jugador: sombra propia y animación a mitad de frecuencia */
const LOD_FAUNA = { sombra: 40, mitad: 60 };
const CONDUCTA = { pasear: [3, 8], quieto: [2, 6], tumbado: [8, 20], amenaza: 7, amenazaDur: [2.5, 4], rebanoRadio: 7, contagio: [.15, .6], vuelo: { alto: 3.2, vel: 9, dur: 3.2 }, rodeo: { giro: 3, max: 2.2, olvido: .8, paciencia: 3 },
  // turnos: solo un animal ataca a la vez; los demás esperan rodeando a Hikari a 'anillo' m más allá de su alcance, con 'pausa' s entre ataques
  turno: { anillo: 1.6, pausa: .45, giro: .5, vel: .45 } };

const Fauna = (() => {
  const lista = [], grupo = new THREE.Group(); let tAcum = 0, anillo, reloj = 0;
  const turno = { a: null, libre: 0 };   // quién ataca ahora y desde cuándo puede atacar otro (reloj)

  /* ---------- ciclo de vida ---------- */
  function iniciar() {
    scene.add(grupo);
    anillo = new THREE.Mesh(new THREE.RingGeometry(.9, 1.1, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff4a3a, transparent: true, opacity: .0, depthWrite: false, side: THREE.DoubleSide, fog: false })); anillo.visible = false; scene.add(anillo);
  }
  function crear(sp, x, z, op) {
    op = op || {}; const E = ESPECIES[sp], m = Animales.crear(E, op.col), sc = op.esc || 1 + rnd(-.08, .1);
    m.g.scale.setScalar(sc); grupo.add(m.g);
    const a = { sp, E, m, x, z, y: altura(x, z), yaw: rnd(0, TAU), estado: 'idle', t: rnd(0, 4), vx: 0, vz: 0, ani: op.ani || E.ani, aniMax: op.ani || E.ani, prov: false, home: { x, z }, esc: sc, atq: 0, cd: 0, nom: op.nom || E.nom, id: op.id || null, grupo: op.grupo || null, dmg: op.dmg || E.dmg, xpv: op.xp || E.xp, calma: 0, conf: 0, golpeT: 0, nombrado: !!op.id, rebano: op.rebano || null, alto: 0, contagio: 0 };
    const hs = m.alto * sc + .7;
    const sg = etiqueta('!', { ancho: 1, tam: 90, color: '#ffd45a' }); sg.position.y = m.alto + .7 / sc; sg.visible = false; m.g.add(sg); a.sig = sg;
    const co = etiqueta('♥', { ancho: 1, tam: 90, color: '#ff8fb8' }); co.position.y = sg.position.y; co.visible = false; m.g.add(co); a.cor = co; a.hs = hs;
    if (a.rebano) a.rebano.miembros.push(a);
    lista.push(a); return a;
  }
  function quitar(a) {
    grupo.remove(a.m.g); a.m.g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.skeleton) o.skeleton.dispose(); });
    const i = lista.indexOf(a); if (i >= 0) lista.splice(i, 1);
    if (a.rebano) { const r = a.rebano; r.miembros = r.miembros.filter(b => b !== a); if (r.lider === a) r.lider = r.miembros[0] || null; }
  }
  function pesoEspecie(b) { const t = BIOMA_FAUNA[b], tot = t.reduce((s, q) => s + q[1], 0); let u = Math.random() * tot; for (const q of t) { u -= q[1]; if (u <= 0) return q[0]; } return t[0][0]; }
  function puntoValido(sp, x, z) {
    const E = ESPECIES[sp], h = altura(x, z);
    if (Math.hypot(x, z) > RADIO_ISLA - 20) return false;
    for (const s of SITIOS) if (Math.hypot(x - s.x, z - s.z) < s.r1 + 4 && s.id !== 'faro' || (s.id === 'faro' && Math.hypot(x, z) < 20)) return false;
    if (E.agua) return h < -.3 && h > -3.5; if (sp === 'cangrejo') return h > -.2 && h < 1; if (sp === 'tortuga') return h > -2 && h < 1.2;
    if (h < .8 || pendiente(x, z) > .7) return false; if (enCueva(x, h + 1, z)) return false;
    for (const c of CUEVAS) if (Math.hypot(x - c.mx, z - c.mz) < c.mr) return false; return true;
  }
  /* aparecen rebaños fuera de la vista; los miembros siguen a un líder */
  function llenar(px, pz, objetivo) {
    if (lista.filter(a => !a.nombrado).length >= objetivo) return;
    for (let k = 0; k < 6; k++) {
      const an = rnd(0, TAU), d = rnd(55, 110), x = px + Math.cos(an) * d, z = pz + Math.sin(an) * d;
      const b = biomaDe(x, z), sp = pesoEspecie(b); if (!puntoValido(sp, x, z)) continue;
      const E = ESPECIES[sp], n = E.rebano ? rndi(E.rebano[0], E.rebano[1]) : 1, reb = n > 1 ? { lider: null, miembros: [] } : null;
      for (let i = 0; i < n; i++) { const px2 = x + rnd(-3, 3), pz2 = z + rnd(-3, 3); if (!puntoValido(sp, px2, pz2)) continue; const a = crear(sp, px2, pz2, { rebano: reb }); if (reb && !reb.lider) reb.lider = a; if (reb) a.offset = { x: rnd(-3.5, 3.5), z: rnd(-3.5, 3.5) }; }
      return;
    }
  }
  const nomObjs = {};
  function gestionarNombrados(px, pz) {
    for (const n of NOMBRADOS) {
      const d = Math.hypot(px - n.x, pz - n.z), est = nomObjs[n.id] || (nomObjs[n.id] = { a: null, hecho: false });
      if (est.hecho && !est.a) continue;
      if (!est.a && d < 150) { est.a = crear(n.sp, n.x, n.z, n); est.a.estadoCalmado = false; }
      else if (est.a && d > 230 && !est.a.prov) { quitar(est.a); est.a = null; }
    }
  }

  /* ---------- IA ---------- */
  function ruido(J) { return (J.agachado ? .3 : J.vel > 5.4 ? 1.5 : J.vel > .6 ? .8 : .35) * (J.mascara ? .65 : 1); }
  function mover(a, dt, tx, tz, vel, giro) {
    const dx = tx - a.x, dz = tz - a.z, d = Math.hypot(dx, dz) || 1, ya = Math.atan2(dx, dz);
    a.yaw = angDamp(a.yaw, ya, giro || 8, dt);
    const v = vel * Math.min(1, d / .5 + .2) * (Math.abs(angDif(a.yaw, ya)) > 1.2 ? .3 : 1);
    // acelera y frena con suavidad (no cambia de velocidad de golpe)
    const k = 1 - Math.exp(-5 * dt); a.vx += (Math.sin(a.yaw) * v - a.vx) * k; a.vz += (Math.cos(a.yaw) * v - a.vz) * k;
  }
  /* rodeo (al huir y al pasear): si choca, va girando el rumbo hacia un lado hasta sortear el obstáculo y luego lo
     olvida; devuelve el giro (rad) y cuenta el tiempo atascado (a.atasco) para rendirse tras CONDUCTA.rodeo.paciencia */
  function rodeo(a, dt) {
    const R = CONDUCTA.rodeo;
    if (a.bloqueado) { a.rodeoS = a.rodeoS || (Math.random() < .5 ? -1 : 1); a.rodeo = clamp((a.rodeo || 0) + a.rodeoS * R.giro * dt, -R.max, R.max); a.atasco = (a.atasco || 0) + dt; }
    else { a.atasco = 0; if (a.rodeo) { a.rodeo *= Math.exp(-R.olvido * dt); if (Math.abs(a.rodeo) < .05) a.rodeo = a.rodeoS = 0; } }
    return a.rodeo || 0;
  }
  function frenar(a, dt) { const k = 1 - Math.exp(-6 * dt); a.vx -= a.vx * k; a.vz -= a.vz * k; }
  function pasoSeguro(a, dt) {
    a.bloqueado = false;   // la conducta lee el resultado del fotograma anterior
    if (Math.abs(a.vx) + Math.abs(a.vz) < 1e-3) return false;   // quieto: nada que comprobar
    const nx = a.x + a.vx * dt, nz = a.z + a.vz * dt, E = a.E, h = altura(nx, nz), vuela = a.alto > .5;
    const okAgua = vuela || (E.agua ? (h < -.2 && h > -4) : a.sp === 'cangrejo' || a.sp === 'tortuga' ? (h > -2 && h < 1.8) : (h > .4 && pendiente(nx, nz) < 1.1));
    const dc = Math.hypot(nx, nz) < RADIO_ISLA - 8, enC = enCueva(nx, h + 1, nz);
    if (okAgua && dc && !enC) { a.x = nx; a.z = nz; } else { a.vx = a.vz = 0; a.bloqueado = true; }
    for (const c of Sol.cols) if (Math.hypot(a.x - c.x, a.z - c.z) < c.r + a.E.r && c.on) { const d = Math.hypot(a.x - c.x, a.z - c.z) || 1; a.x = c.x + (a.x - c.x) / d * (c.r + a.E.r); a.z = c.z + (a.z - c.z) / d * (c.r + a.E.r); }
  }
  /* el miedo se contagia al rebaño con un pequeño retraso */
  function alarmar(a) { if (!a.rebano) return; for (const b of a.rebano.miembros) if (b !== a && !b.prov && (b.estado !== 'huir' && b.estado !== 'calmado')) b.contagio = rnd(CONDUCTA.contagio[0], CONDUCTA.contagio[1]); }
  function huirDe(a, dur) { a.estado = 'huir'; a.t = dur || rnd(3, 6); if (a.sp === 'pato') a.tVuelo = CONDUCTA.vuelo.dur; alarmar(a); }
  function actualizar(dt, J) {
    tAcum += dt; reloj += dt;
    if (J.vivo !== false) { gestionarNombrados(J.x, J.z); if (tAcum > .6) { tAcum = 0; llenar(J.x, J.z, 16); } }
    const rj = ruido(J), C = CONDUCTA; let mejorProv = null, dMejor = 99;
    for (let i = lista.length - 1; i >= 0; i--) {
      const a = lista[i], E = a.E, dx = J.x - a.x, dz = J.z - a.z, dist = Math.hypot(dx, dz);
      if (dist > 190 && !a.prov && !a.nombrado) { quitar(a); continue; }
      a.t -= dt; a.cd -= dt; a.golpeT = Math.max(0, a.golpeT - dt);
      a.sig.visible = a.estado === 'alerta' || a.estado === 'amenaza' || (a.estado === 'atacar' && a.atq > 0); a.cor.visible = a.estado === 'curioso' || a.estado === 'calmado' || a.petT > 0; if (a.petT > 0) a.petT -= dt;
      if (a.contagio > 0) { a.contagio -= dt; if (a.contagio <= 0 && E.tipo === 'huidizo' && !a.prov && a.estado !== 'calmado') huirDe(a); }
      const R = a.rebano, lider = R && R.lider && R.lider !== a && lista.includes(R.lider) ? R.lider : null;
      switch (a.estado) {
        case 'idle': case 'pastar': {
          frenar(a, dt);
          // pastando avanza un paso de vez en cuando
          if (a.estado === 'pastar' && Math.sin(tAcum * .9 + a.yaw * 3) > .93) { a.vx = Math.sin(a.yaw) * .4; a.vz = Math.cos(a.yaw) * .4; }
          if (lider && Math.hypot(lider.x + (a.offset ? a.offset.x : 0) - a.x, lider.z + (a.offset ? a.offset.z : 0) - a.z) > C.rebanoRadio) { a.estado = 'pasear'; a.t = 6; a.dest = null; break; }
          if (a.t <= 0) {
            const u = Math.random();
            if (E.echarse && u < E.echarse && a.estado !== 'pastar') { a.estado = 'tumbado'; a.t = rnd(C.tumbado[0], C.tumbado[1]); }
            else if (u < .6 && E.vel > 0 && !lider) { a.estado = E.olfatea && Math.random() < .5 ? 'olfatear' : 'pasear'; a.t = rnd(C.pasear[0], C.pasear[1]); const an = rnd(0, TAU), d = rnd(4, 14); a.dest = { x: a.home.x + Math.cos(an) * d, z: a.home.z + Math.sin(an) * d }; }
            else { a.estado = E.tipo !== 'defensivo' || E.olfatea ? (Math.random() < .55 ? 'pastar' : 'idle') : 'idle'; a.t = rnd(C.quieto[0], C.quieto[1]); }
          }
          break;
        }
        case 'pasear': case 'olfatear': {
          // los seguidores van hacia el líder con su propio sitio en el rebaño
          if (lider) { a.dest = { x: lider.x + (a.offset ? a.offset.x : 0), z: lider.z + (a.offset ? a.offset.z : 0) }; if (lider.estado === 'idle' || lider.estado === 'pastar' || lider.estado === 'tumbado') { if (Math.hypot(a.dest.x - a.x, a.dest.z - a.z) < 2.5) { a.estado = lider.estado === 'tumbado' ? 'tumbado' : 'pastar'; a.t = rnd(3, 8); break; } } }
          if (!a.dest) { a.estado = 'idle'; a.t = 1; break; }
          // hacia el destino; si choca, lo rodea (como al huir) y solo se rinde tras un rato atascado
          const ro = rodeo(a, dt), ex = a.dest.x - a.x, ez = a.dest.z - a.z, dd = Math.hypot(ex, ez), an = Math.atan2(ex, ez) + ro, lejos = Math.max(dd, 2);
          mover(a, dt, a.x + Math.sin(an) * lejos, a.z + Math.cos(an) * lejos, E.vel * (a.estado === 'olfatear' ? .22 : lider ? .42 : .32), 3);
          if ((!lider && (a.t <= 0 || dd < 1)) || a.atasco > C.rodeo.paciencia) { a.estado = 'idle'; a.t = rnd(2, 5); a.rodeo = a.rodeoS = a.atasco = 0; }
          break;
        }
        case 'tumbado': { frenar(a, dt); if (a.t <= 0 || (lider && lider.estado !== 'tumbado' && lider.estado !== 'idle' && lider.estado !== 'pastar')) { a.estado = 'idle'; a.t = rnd(2, 4); } break; }
        case 'alerta': { frenar(a, dt); a.yaw = angDamp(a.yaw, Math.atan2(dx, dz), 8, dt); if (a.t <= 0) { if (dist < (E.det || 12) * rj * 1.1) huirDe(a); else { a.estado = 'idle'; a.t = 2; } } break; }
        case 'huir': {
          // se aleja del jugador; el rebaño huye junto (cohesión hacia su centro)
          // si choca, rodea el obstáculo (rodeo)
          let an = Math.atan2(-dx, -dz) + rodeo(a, dt) + Math.sin(tAcum * 3 + a.yaw) * (a.sp === 'conejo' ? .9 : .35);
          if (R && R.miembros.length > 1) { let cx = 0, cz = 0; for (const b of R.miembros) { cx += b.x; cz += b.z; } cx /= R.miembros.length; cz /= R.miembros.length; const dc = Math.hypot(cx - a.x, cz - a.z); if (dc > 4) an = Math.atan2(Math.sin(an) + (cx - a.x) / dc * .5, Math.cos(an) + (cz - a.z) / dc * .5); }
          if (a.sp === 'pato' && a.tVuelo > 0) { a.tVuelo -= dt; a.alto = damp(a.alto, C.vuelo.alto, 1.5, dt); mover(a, dt, a.x + Math.sin(an) * 10, a.z + Math.cos(an) * 10, C.vuelo.vel, 4); }
          else mover(a, dt, a.x + Math.sin(an) * 10, a.z + Math.cos(an) * 10, E.vel, 10);
          if (a.t <= 0 && dist > 28) { a.estado = 'idle'; a.t = rnd(2, 5); a.prov = false; a.home = { x: a.x, z: a.z }; } else if (a.t <= 0) a.t = 1.5;
          break;
        }
        case 'curioso': {
          if (J.vel > .9 || !J.agachado) { a.estado = 'alerta'; a.t = .5; a.conf = 0; break; }
          if (dist > 1.7) mover(a, dt, J.x, J.z, E.vel * .22, 4); else { frenar(a, dt); a.yaw = angDamp(a.yaw, Math.atan2(dx, dz), 5, dt); }
          a.curiosoDist = dist; break;
        }
        case 'amenaza': {   // aviso: no ataca si no le golpean
          frenar(a, dt); a.yaw = angDamp(a.yaw, Math.atan2(dx, dz), 4, dt);
          if (a.t <= 0) { a.estado = dist < C.amenaza ? 'amenaza' : 'idle'; a.t = dist < C.amenaza ? rnd(C.amenazaDur[0], C.amenazaDur[1]) : rnd(2, 4); if (a.estado === 'amenaza') Sonido.sfx('gruñido', { pos: { x: a.x, y: a.y + 1, z: a.z }, f: E.gruñido || 90 }); }
          break;
        }
        case 'agresivo': {
          if (J.vivo === false) { a.estado = 'huir'; a.t = 3; a.prov = false; break; }
          const reach = E.ataque === 'zarpazo' ? 2.6 : 2.2, alc = reach + a.E.r * a.esc, T = C.turno;
          // si otro está atacando (o acaba de hacerlo), espera su turno rodeando a Hikari sin acercarse
          const espera = (turno.a && turno.a !== a && turno.a.estado === 'atacar') || reloj < turno.libre;
          if (espera && dist < alc + T.anillo + 1.5) {
            a.rodeoS = a.rodeoS || (Math.random() < .5 ? -1 : 1); const an = Math.atan2(-dx, -dz) + a.rodeoS * T.giro, r = alc + T.anillo;
            mover(a, dt, J.x + Math.sin(an) * r, J.z + Math.cos(an) * r, E.vel * T.vel, 6);
          }
          else if (dist > alc) mover(a, dt, J.x, J.z, E.vel * (a.esc > 1.3 ? 1.5 : 1.7), 9);
          else { frenar(a, dt); a.yaw = angDamp(a.yaw, Math.atan2(dx, dz), 12, dt); }
          if (!espera && dist < alc + .6 && a.cd <= 0) { a.estado = 'atacar'; a.atq = .7; a.fasea = 0; a.vx = a.vz = 0; turno.a = a; Sonido.sfx('gruñido', { pos: { x: a.x, y: a.y + 1, z: a.z }, f: E.gruñido || 90 }); }
          if (dist > 45) { a.estado = 'huir'; a.t = 3; a.prov = false; a.ani = Math.min(a.aniMax, a.ani + 20); }
          break;
        }
        case 'atacar': {
          a.atq -= dt;
          if (a.fasea === 0) { a.yaw = angDamp(a.yaw, Math.atan2(dx, dz), 6, dt); a.vx = a.vz = 0; if (a.atq <= 0) { a.fasea = 1; a.atq = .38; a.lx = Math.sin(a.yaw); a.lz = Math.cos(a.yaw); a.dañó = false; Sonido.sfx('esquiva'); } }
          else {
            const v = E.vAtq || 9; a.vx = a.lx * v * (E.ataque === 'zarpazo' ? .35 : 1); a.vz = a.lz * v * (E.ataque === 'zarpazo' ? .35 : 1);
            if (!a.dañó && dist < a.E.r * a.esc + .9 + (E.ataque === 'zarpazo' ? 1.0 : 0)) { a.dañó = true; Bus.emit('dañoJugador', { dmg: a.dmg, x: a.x, z: a.z, a, veneno: E.ataque === 'picadura' }); }
            if (a.estado !== 'atacar') break;   // una parada de Hikari lo ha aturdido
            if (a.atq <= 0) { a.estado = 'agresivo'; a.cd = rnd(1.2, 2.0); a.vx = a.vz = 0; turno.libre = reloj + C.turno.pausa; }
          }
          break;
        }
        case 'aturdido': {   // tras un golpe pesado o una parada: se tambalea y no ataca
          frenar(a, dt);
          if (a.t <= 0) { if (a.E.tipo === 'defensivo' && a.prov) { a.estado = 'agresivo'; a.cd = rnd(.5, 1); } else huirDe(a, 4); }
          break;
        }
        case 'calmado': {
          frenar(a, dt); a.calma -= dt; if (a.calma <= 0) { a.estado = 'idle'; a.t = 3; a.ani = a.aniMax; a.prov = false; }
          if (Math.random() < dt * 5) FX.emit(a.x + rnd(-.5, .5), a.y + 1 + rnd(0, 1), a.z + rnd(-.5, .5), 0, .5, 0, 1.2, .14, 0xffa8c8, .8);
          break;
        }
      }
      if (a.estado !== 'huir' || !(a.tVuelo > 0)) a.alto = damp(a.alto, 0, 2, dt);
      // percepción: los huidizos oyen al jugador; los defensivos avisan si se acerca demasiado
      if (!a.prov && (a.estado === 'idle' || a.estado === 'pastar' || a.estado === 'pasear' || a.estado === 'olfatear' || a.estado === 'tumbado') && J.vivo !== false) {
        if (E.tipo === 'huidizo') {
          const det = E.det * rj * (a.estado === 'tumbado' ? .7 : 1);
          if (dist < det) {
            if (J.agachado && J.vel < .6 && dist < 11) { a.conf += dt; if (a.conf > 2.4) { a.estado = 'curioso'; a.conf = 0; } }
            else { a.estado = 'alerta'; a.t = rnd(.5, 1); Sonido.sfx('alerta'); a.conf = 0; alarmar(a); }
          } else a.conf = Math.max(0, a.conf - dt);
        } else if (E.tipo === 'defensivo') {
          if (dist < C.amenaza * (J.agachado ? .6 : 1) && E.amenaza) { a.estado = 'amenaza'; a.t = rnd(C.amenazaDur[0], C.amenazaDur[1]); Sonido.sfx('gruñido', { pos: { x: a.x, y: a.y + 1, z: a.z }, f: E.gruñido || 90 }); }
          else if (dist < 12) a.yaw = angDamp(a.yaw, Math.atan2(dx, dz), 2, dt);
        }
      }
      if (a.empT > 0) { const k = a.empT / .25; a.vx = a.empX * k; a.vz = a.empZ * k; a.empT -= dt; }   // empuje de un golpe
      const movido = pasoSeguro(a, dt) !== false;
      if (movido || a.ty === undefined) a.ty = altura(a.x, a.z);
      let ty = a.ty; if (E.agua || a.sp === 'tortuga') ty = Math.max(ty, NIVEL_AGUA - .02 + (a.sp === 'tortuga' ? .02 : 0)); if (a.sp === 'cangrejo') ty = Math.max(ty, NIVEL_AGUA - .05);
      a.y = damp(a.y, ty, 14, dt);
      animar(a, dt, J, dist);
      if (a.prov && a.ani < a.aniMax) { const d = Math.hypot(J.x - a.x, J.z - a.z); if (d < dMejor) { dMejor = d; mejorProv = a; } }
    }
    const atq = lista.find(a => a.estado === 'atacar' && a.fasea === 0);
    if (atq) { anillo.visible = true; anillo.position.set(atq.x, atq.y + .06, atq.z); const k = 1 - atq.atq / .7; anillo.scale.setScalar((atq.E.r * atq.esc + 1) * (1.3 - .3 * k)); anillo.material.opacity = .3 + .5 * k; } else anillo.visible = false;
    return mejorProv;
  }
  const ctx = { jx: 0, jz: 0 };
  /* lejos la animación se actualiza uno de cada dos fotogramas con el tiempo acumulado y no proyecta sombra */
  function animar(a, dt, J, dist) {
    const sombra = dist < LOD_FAUNA.sombra;
    if (a.sombra !== sombra) { a.sombra = sombra; a.m.g.traverse(o => { if (o.isMesh) o.castShadow = sombra; }); }
    a.dtA = (a.dtA || 0) + dt; a.cuadro = (a.cuadro || 0) + 1;
    if (dist > LOD_FAUNA.mitad && (a.cuadro & 1)) return;
    ctx.jx = J.x; ctx.jz = J.z;
    a.m.actualizar(a, a.dtA, ctx); a.dtA = 0;
    const gp = a.golpeT > 0 ? 1 + Math.sin(a.golpeT * 60) * .05 : 1; a.m.g.scale.setScalar(a.esc * gp);
  }

  /* ---------- interacción con el jugador ---------- */
  /* o: { peso (1 ligero … 3 pesado), empuje (m/s) }; si el peso supera su aguante, el animal se tambalea */
  function golpear(a, dmg, dirx, dirz, J, o) {
    const E = a.E, peso = o && o.peso || 1; a.golpeT = .25; a.ani -= dmg;
    a.empX = dirx * (o && o.empuje || 1.5); a.empZ = dirz * (o && o.empuje || 1.5); a.empT = .25; FX.numero(String(Math.round(dmg)), a.x, a.y + a.hs, a.z, '#fff3c4'); FX.rafaga(a.x, a.y + .8 * a.esc, a.z, 8, 2.4, .45, .16, 0xffe9a8);
    a.prov = true; a.conf = 0;
    if (a.ani <= 0) { calmar(a); return true; }
    const tambalea = peso >= aguante(a);   // un golpe con más peso que su aguante interrumpe su ataque
    if (tambalea) aturdir(a, .3 + .25 * peso);
    if (E.tipo === 'defensivo') {
      if (!tambalea && a.estado !== 'atacar' && a.estado !== 'aturdido') { a.estado = 'agresivo'; a.cd = .4; }
      if (a.grupo) for (const b of lista) if (b !== a && b.grupo === a.grupo && b.estado !== 'calmado') { b.prov = true; b.estado = 'agresivo'; b.cd = rnd(.3, 1); }
      if (a.rebano) for (const b of a.rebano.miembros) if (b !== a && b.estado !== 'calmado' && b.estado !== 'agresivo') { b.estado = 'amenaza'; b.t = 3; }
    } else if (!tambalea) huirDe(a, E.tipo === 'huidizo' ? rnd(4, 7) : 4);
    Sonido.sfx('gruñido', { pos: { x: a.x, y: a.y + 1, z: a.z }, f: (E.gruñido || 200) * (tambalea ? 1.4 : 1.2) });
    return false;
  }
  const aguante = a => (a.E.aguante || (a.E.tipo === 'defensivo' ? 2 : 1)) + (a.esc > 1.3 ? 1 : 0);
  function aturdir(a, s) { a.estado = 'aturdido'; a.t = s; a.atq = 0; a.vx = a.vz = 0; }
  /* parada de Hikari: el animal sale despedido, se tambalea y se calma un poco */
  function desviar(a, dur, calma, dirx, dirz) {
    a.ani -= a.aniMax * calma; a.golpeT = .2; a.empX = dirx * 4; a.empZ = dirz * 4; a.empT = .3; a.prov = true;
    FX.numero('✦', a.x, a.y + a.hs, a.z, '#a8fff2');
    if (a.ani <= 0) calmar(a); else aturdir(a, dur);
  }
  function calmar(a) {
    a.estado = 'calmado'; a.calma = 22; a.prov = false; a.vx = a.vz = 0; FX.rafaga(a.x, a.y + 1, a.z, 26, 3, 1.2, .22, 0xffa8c8, 1);
    Sonido.sfx('calmar'); Bus.emit('calmado', { a, sp: a.sp, id: a.id, grupo: a.grupo, nom: a.nom, x: a.x, z: a.z, y: a.y, xp: a.xpv, ofrenda: a.E.ofrenda });
    if (a.id && nomObjs[a.id]) nomObjs[a.id].hecho = true;
  }
  function pulso(x, z, r, dmg) {
    let n = 0; for (const a of lista) { if (a.estado === 'calmado') continue; const d = Math.hypot(a.x - x, a.z - z); if (d < r + a.E.r) { if (a.prov || a.estado === 'agresivo') { a.ani -= dmg; FX.numero('✦' + Math.round(dmg), a.x, a.y + 2, a.z, '#a8fff2'); n++; if (a.ani <= 0) calmar(a); else if (a.E.tipo === 'defensivo') { a.estado = 'agresivo'; a.cd = 1; } } else if (a.E.tipo !== 'defensivo') huirDe(a, 3); } }
    return n;
  }
  function enRango(x, z, yaw, alc, ang) {
    const out = []; for (const a of lista) { if (a.estado === 'calmado') continue; const dx = a.x - x, dz = a.z - z, d = Math.hypot(dx, dz) - a.E.r * a.esc; if (d > alc) continue; const da = Math.abs(angDif(yaw, Math.atan2(dx, dz))); if (da < ang || d < .8) out.push(a); } return out;
  }
  function acariciable(x, z) {
    let best = null, bd = 2.6; for (const a of lista) { if (a.prov) continue; const ok = a.estado === 'curioso' || a.estado === 'calmado' || a.sp === 'tortuga' && a.estado !== 'huir'; if (!ok) continue; const d = Math.hypot(a.x - x, a.z - z) - a.E.r * a.esc; if (d < bd) { bd = d; best = a; } } return best;
  }
  function acariciar(a) { a.petT = 2; Sonido.sfx('acariciar'); FX.rafaga(a.x, a.y + 1 * a.esc, a.z, 14, 1.5, 1, .18, 0xffa8c8, 1); Bus.emit('acariciado', { a, sp: a.sp }); if (a.estado === 'curioso') { a.estado = 'idle'; a.t = 5; } }
  return { crear, iniciar, actualizar, golpear, desviar, calmar, pulso, enRango, acariciable, acariciar, lista, nomObjs, get a() { return lista; } };
})();
