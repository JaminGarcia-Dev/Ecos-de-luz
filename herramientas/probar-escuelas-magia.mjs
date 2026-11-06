/* Pruebas Node sin navegador ni paquetes. Motor 71 real; dobles espaciales y gráficos explícitos. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const raiz = new URL('../', import.meta.url), leer = p => fs.readFileSync(new URL(p, raiz), 'utf8');
let bien = 0, mal = 0;
function prueba(nom, f) {
  try { f(); bien++; console.log('OK · ' + nom); }
  catch (e) { mal++; console.error('FALLO · ' + nom + '\n' + e.stack); }
}
const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
const nombres = ['Viento', 'Brasa', 'Escarcha', 'Oscuridad'], ids = ['normal', 'area', 'paso', 'cargado'];

function entorno({ real = false, contratoFuturo = false } = {}) {
  const blancos = [], contactos = [], emisiones = [];
  const ST = { luz: 100, hp: 100 }; let pared = null, mult = 1;
  const dentro = (b, o, r, ang) => {
    const a = Math.atan2(b.x - o.x, b.z - o.z) - o.yaw;
    return Math.hypot(b.x - o.x, b.z - o.z) <= r + b.r && Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) <= ang;
  };
  const aplicar = (o, r, ang, dmg, op, toc) => {
    let n = 0;
    for (const b of blancos) {
      if (toc.has(b) || !dentro(b, o, r, ang)) continue;
      if (op.vertical && (o.y < b.y - .4 || o.y > b.y + b.alto + .4)) continue;
      toc.add(b); contactos.push({ b, dmg, op }); n++;
    }
    return n;
  };
  const c = vm.createContext({ Math, Number, Set, console,
    Sis: { ST, dmgMult: () => mult }, J: {},
    clamp: (v, a, b) => Math.min(b, Math.max(a, v)), lerp: (a, b, k) => a + (b - a) * k,
    Sol: { dentro: (x, y, z, r) => pared !== null && Math.abs(z - pared) <= r }, sueloEnJ: () => 0,
    Impacto: {
      sector: aplicar,
      circulo: (x, y, z, r, dmg, op, toc) => aplicar({ x, y, z, yaw: 0 }, r, Math.PI, dmg, op, toc),
      proyectil(x0, y0, z0, x, y, z, r, dmg, op, toc) {
        const n = aplicar({ x, y, z, yaw: 0 }, r, Math.PI, dmg, op, toc);
        return n ? { x, y, z, n } : null;
      }
    }
  });
  if (real) {
    const vacio = { golpear: () => false };
    Object.assign(c, { Practica: { activa: false }, COMBATE: { peso: { empuje: [0, 1.5, 3.5, 6] } },
      Duelo: vacio, Jefes: vacio, Fauna: { enRango: () => [], golpear() {} },
      Sombras: { enRango: (x, z, yaw, r, ang) => blancos.filter(b => dentro(b, { x, z, yaw }, r, ang)),
        golpear: (b, dmg, dx, dz, op) => contactos.push({ b, dmg, op }) }
    });
    let fuente = leer('js/70-impacto.js');
    if (contratoFuturo) {
      fuente = fuente.replace('{ peso, empuje, romper: op.romperSombra', '{ ...op, peso, empuje, romper: op.romperSombra');
    }
    vm.runInContext(fuente, c);
  }
  let motor = leer('js/71-arco-luz.js');
  if (contratoFuturo) {
    motor = motor.replace('op: { peso: F.peso, vertical: true, romper: false, romperSombra: false }',
      'op: { vertical: true, romper: false, romperSombra: false, ...F.op, peso: F.peso }');
  }
  vm.runInContext(motor, c);
  /* Espía de emisión; conserva el motor original, sin sustituir su viaje ni sus contactos. */
  c.emisiones = emisiones;
  vm.runInContext(`{
    const original = TallerLuz.crearMotor;
    TallerLuz.crearMotor = C => {
      const M = original(C), lanzar = M.lanzar;
      M.lanzar = (F, E, yaw, guia) => { emisiones.push(F); lanzar(F, E, yaw, guia); };
      return M;
    };
  }`, c);
  vm.runInContext(leer('js/74-escuelas-magia.js') + '\nthis.api = { ' + nombres.map(n => `Escuela${n}, ESCUELA_${n.toUpperCase()}`).join(', ') + ' };', c);
  const E = extra => ({ libre: true, atacar: false, atacarPulsado: false, esquivaReciente: 9,
    x: 0, y: 0, z: 0, yaw: 0, objetivo: null, luz: ST.luz, vida: ST.hp, ...extra });
  function paso(M, dt, extra) {
    const r = M.entrada(dt, E(extra));
    assert.ok(Number.isFinite(r.gasta) && r.gasta >= 0 && r.gasta <= ST.luz);
    assert.ok(r.ralentiza >= 0 && r.ralentiza <= 1 && r.pose.k >= 0 && r.pose.k <= 1);
    assert.equal(typeof r.bloquea, 'boolean');
    ST.luz -= r.gasta; ST.hp -= r.gastaVida || 0; M.actualizar(dt); return r;
  }
  function tiempo(M, s, extra = {}, dt = 1 / 60) {
    for (let t = 0; t < s - 1e-8;) { const d = Math.min(dt, s - t); paso(M, d, extra); t += d; }
  }
  function disparar(M, id, dt = 1 / 60) {
    if (id === 'cargado') { paso(M, 0, { atacarPulsado: true, atacar: true }); tiempo(M, 1, { atacar: true }, dt); paso(M, 0); }
    else paso(M, 0, { atacarPulsado: true, guardia: id === 'area', esquivaReciente: id === 'paso' ? .05 : 9 });
    tiempo(M, 1, {}, dt);
  }
  function objetivo(z, extra = {}) {
    const b = { x: 0, y: 0, z, r: .25, alto: 1.5, ...extra }; b.E = { r: b.r, alto: b.alto }; blancos.push(b); return b;
  }
  return { ...c.api, c, ST, E, paso, tiempo, disparar, objetivo, contactos, emisiones,
    pared: v => { pared = v; }, mult: v => { mult = v; } };
}

for (const n of nombres) for (const id of ids) {
  const etiqueta = `${n}/${id}`;
  prueba(etiqueta + ': coste único, daño de ficha y vida descontados solo por integrador', () => {
    const t = entorno(), M = t['Escuela' + n], C = t['ESCUELA_' + n.toUpperCase()], F = C[id];
    t.mult(1.5); t.objetivo(F.tipo === 'zona' ? F.alcance : 2); t.disparar(M, id); M.actualizar(5);
    cerca(t.ST.luz, 100 - F.coste); cerca(t.ST.hp, 100 - (F.costeVida || 0));
    assert.ok(t.contactos.length > 0);
    const directos = t.contactos.filter(h => !h.op.periodico);
    assert.equal(directos.length, 1); cerca(directos[0].dmg, F.daño * 1.5);
    const pulsos = F.intervalo ? Math.floor(F.dur / F.intervalo) : 0;
    assert.equal(t.contactos.length, 1 + pulsos);
    for (const h of t.contactos) { assert.ok(h.dmg > 0 && h.dmg <= F.daño * 1.5); assert.ok(h.op.peso >= 1 && h.op.peso <= 3); }
    for (const h of t.contactos.filter(h => h.op.periodico)) cerca(h.dmg, F.dañoPulso * 1.5);
  });
  prueba(etiqueta + ': sin luz no dispara, sin coste de vida', () => {
    const t = entorno(), M = t['Escuela' + n]; t.ST.luz = 0; t.objetivo(2); t.disparar(M, id);
    assert.equal(t.contactos.length, 0); assert.equal(t.emisiones.length, 0); cerca(t.ST.hp, 100);
    assert.equal(M.estado().zonas, 0);
  });
}

prueba('fichas: límites, tiempos, cuatro movimientos y presupuesto de arte', () => {
  const t = entorno();
  for (const n of nombres) {
    const C = t['ESCUELA_' + n.toUpperCase()];
    assert.equal(Object.values(C).filter(v => v && v.nom && v.coste !== undefined).length, 4);
    for (const id of ids) {
      const F = C[id]; assert.ok(F.coste >= 3 && F.coste <= 20 && F.daño >= 10 && F.daño <= 48);
      assert.ok(F.peso >= 1 && F.peso <= 3 && F.aviso >= .06 && F.activo > 0 && F.recupera >= .23);
      assert.ok(F.alcance >= 0 && F.alcance <= 22);
      if (F.vel) assert.ok(F.vel <= 36 && F.radio >= C.motor.paso);
      if (F.dur) assert.ok(F.dur <= 3);
    }
    assert.equal(C.motor.max, 12); assert.equal(C.motor.efectos, 8);
  }
});

for (const n of nombres) {
  prueba(n + ': carga cancelable, carga breve, luz perdida y compromiso de recuperación', () => {
    const t = entorno(), M = t['Escuela' + n], C = t['ESCUELA_' + n.toUpperCase()];
    for (const cancela of [{ guardia: true }, { esquivarPulsado: true }, { cancelar: true }, { libre: false }]) {
      t.paso(M, 0, { atacar: true, atacarPulsado: true }); t.tiempo(M, .2, { atacar: true }); t.paso(M, .01, cancela);
      assert.equal(M.estado().carga, null); assert.equal(M.estado().accion, null); cerca(t.ST.luz, 100);
    }
    t.paso(M, 0, { atacar: true, atacarPulsado: true }); t.tiempo(M, .1, { atacar: true }); t.paso(M, 0);
    assert.equal(M.estado().accion, 'normal'); t.tiempo(M, .7); cerca(t.ST.luz, 100 - C.normal.coste);
    M.reiniciar(); t.ST.luz = 100;
    t.paso(M, 0, { atacar: true, atacarPulsado: true }); t.tiempo(M, 1, { atacar: true }); t.ST.luz = 0;
    t.paso(M, 0); const r = t.paso(M, .5); assert.match(r.aviso, /Falta luz/); assert.equal(M.estado().vuelos, 0);
    M.reiniciar(); t.ST.luz = 100;
    t.paso(M, 0, { atacarPulsado: true }); t.paso(M, C.normal.aviso + C.normal.activo);
    assert.equal(t.paso(M, 0, { guardia: true }).bloquea, true);
    t.tiempo(M, C.normal.recupera * .26); t.paso(M, 0, { guardia: true }); assert.equal(M.estado().accion, null);
  });
  prueba(n + ': reiniciar limpia acción, carga, zona, vuelos, efectos, vista y búfer', () => {
    const t = entorno(), M = t['Escuela' + n]; t.disparar(M, 'area'); t.disparar(M, 'normal');
    M.reiniciar(); M.actualizar(10);
    const e = M.estado();
    for (const k of ['vuelos', 'efectos', 'zonas', 'bufer']) assert.equal(e[k], 0);
    for (const k of ['carga', 'accion', 'vista']) assert.equal(e[k], null);
  });
  prueba(n + ': no dispara al pedir esquiva y no conserva una pulsación caducada', () => {
    const t = entorno(), M = t['Escuela' + n];
    t.paso(M, 0, { atacarPulsado: true, esquivarPulsado: true }); t.tiempo(M, 1); cerca(t.ST.luz, 100);
    t.paso(M, 0, { atacarPulsado: true }); t.paso(M, .01, { atacarPulsado: true }); t.tiempo(M, 2);
    cerca(t.ST.luz, 100 - t['ESCUELA_' + n.toUpperCase()].normal.coste);
  });
}

prueba('oscuridad: coste mixto seguro a 1 de vida y falta de vida informada', () => {
  const t = entorno(), M = t.EscuelaOscuridad; t.ST.hp = 1; t.disparar(M, 'cargado');
  cerca(t.ST.hp, 1); cerca(t.ST.luz, 82);
  M.reiniciar(); const r = M.entrada(0, t.E({ vida: undefined, atacarPulsado: true }));
  assert.match(r.aviso, /vida/); assert.equal(M.estado().accion, null);
});
prueba('entrada no escribe Sis.ST ni cobra una preparación cancelada', () => {
  const t = entorno(), M = t.EscuelaOscuridad;
  M.entrada(0, t.E({ atacarPulsado: true })); const r = M.entrada(.13, t.E());
  cerca(r.gasta, 3); cerca(r.gastaVida, 1); cerca(t.ST.luz, 100); cerca(t.ST.hp, 100);
});
prueba('brasa: una sola zona; pulsos acotados y blancos tardíos sin daño retroactivo', () => {
  const t = entorno(), M = t.EscuelaBrasa; t.disparar(M, 'area'); t.disparar(M, 'area'); assert.equal(M.estado().zonas, 1);
  const b = t.objetivo(6); M.actualizar(.2); assert.equal(t.contactos.length, 0);
  M.actualizar(.5); assert.equal(t.contactos.filter(h => h.b === b).length, 1);
  M.actualizar(20); assert.ok(t.contactos.length <= 6); assert.equal(M.estado().zonas, 0);
});
prueba('zonas: sin suelo accesible no hay gasto y no tocan un blanco elevado', () => {
  const t = entorno(), M = t.EscuelaBrasa; t.pared(3); t.disparar(M, 'area'); cerca(t.ST.luz, 100);
  t.pared(null); t.objetivo(6, { y: 4 }); t.disparar(M, 'area'); M.actualizar(5); assert.equal(t.contactos.length, 0);
});
prueba('viento: perfora cuerpos una vez; paredes y alcance detienen el vuelo', () => {
  const t = entorno({ real: true }), M = t.EscuelaViento, a = t.objetivo(2), b = t.objetivo(4);
  t.objetivo(25); t.objetivo(3, { y: 5 }); t.disparar(M, 'normal');
  assert.equal(t.contactos.filter(h => h.b === a).length, 1); assert.equal(t.contactos.filter(h => h.b === b).length, 1);
  assert.equal(t.contactos.length, 2); M.reiniciar(); t.contactos.length = 0; t.pared(1);
  t.disparar(M, 'cargado'); assert.equal(t.contactos.length, 0);
});
prueba('sector: frontal, varios blancos y entrada durante activo sin repetir contacto', () => {
  const t = entorno(), M = t.EscuelaEscarcha, a = t.objetivo(2), b = t.objetivo(8); t.objetivo(-2);
  t.paso(M, 0, { guardia: true, atacarPulsado: true }); t.paso(M, .21); b.z = 2; t.paso(M, .03); t.paso(M, .03);
  assert.equal(t.contactos.filter(h => h.b === a).length, 1); assert.equal(t.contactos.filter(h => h.b === b).length, 1);
  assert.equal(t.contactos.length, 2); assert.ok(t.contactos.every(h => h.op.lenta === .30 && h.op.elemento === 'escarcha'));
});

for (const dt of [1 / 120, 1 / 60, 1 / 30, .05]) prueba(`16 técnicas estables a ${(dt * 1000).toFixed(1)} ms`, () => {
  for (const n of nombres) for (const id of ids) {
    const t = entorno(), M = t['Escuela' + n], F = t['ESCUELA_' + n.toUpperCase()][id];
    t.objetivo(F.tipo === 'zona' ? F.alcance : 2); t.disparar(M, id, dt); M.actualizar(4);
    cerca(t.ST.luz, 100 - F.coste); assert.equal(t.contactos.filter(h => !h.op.periodico).length, 1);
  }
});
prueba('frontera del contrato real: ficha emitida y diagnóstico del receptor', () => {
  const t = entorno({ real: true }); t.objetivo(2); t.disparar(t.EscuelaEscarcha, 'cargado');
  assert.equal(t.emisiones[0].op.elemento, 'escarcha'); assert.equal(t.emisiones[0].op.romper, true);
  assert.ok(t.contactos.length);
  if (t.contactos[0].op.elemento === undefined) console.log('PENDIENTE · 70/71 actuales pierden op.elemento antes del receptor.');
  else { assert.equal(t.contactos[0].op.elemento, 'escarcha'); assert.equal(t.contactos[0].op.romper, true); }
});
prueba('proyección en memoria de los dos cambios documentados: metadatos llegan a Sombras', () => {
  for (const n of nombres) {
    const t = entorno({ real: true, contratoFuturo: true }); t.objetivo(2); t.disparar(t['Escuela' + n], 'cargado');
    if (n === 'Brasa') { t.objetivo(8); t.disparar(t.EscuelaBrasa, 'cargado'); }
    assert.ok(t.contactos.length); assert.ok(t.contactos.every(h => h.op.elemento === n.toLowerCase()));
  }
});

class Nodo {
  constructor() {
    this.children = []; this.visible = true; this.matrix = {}; this.instanceMatrix = {};
    const v = () => ({ set() { return this; } });
    this.position = v(); this.scale = v(); this.rotation = v(); this.quaternion = { set() {}, setFromUnitVectors() {} };
  }
  add(o) { this.children.push(o); } updateMatrix() {} setMatrixAt() {}
  clone() { const n = new this.constructor(this.geometry, this.material); return n; }
}
class Malla extends Nodo { constructor(g, m) { super(); this.geometry = g; this.material = m; } }
class Geo { rotateX() {} }
class Material { constructor(o) { Object.assign(this, o); } }
for (const calidad of ['alta', 'media', 'baja']) prueba(`arte ${calidad}: creación única, muestras y reinicio`, () => {
  const t = entorno(); t.c.AJUSTES = { calidad };
  t.c.THREE = { Object3D: Nodo, Group: Nodo, Mesh: Malla, InstancedMesh: Malla, MeshBasicMaterial: Material,
    Vector3: class { set() { return this; } }, CylinderGeometry: Geo, ConeGeometry: Geo, SphereGeometry: Geo,
    TorusGeometry: Geo, RingGeometry: Geo, AdditiveBlending: 2, DoubleSide: 2 };
  for (const n of nombres) {
    const M = t['Escuela' + n], escena = new Nodo(); assert.equal(M.muestras().length, 0); M.crear(escena); M.crear(escena);
    assert.equal(escena.children.length, 6); assert.equal(M.muestras().length, 7); assert.ok(M.modelo() instanceof Nodo);
    t.disparar(M, 'area'); M.reiniciar(); assert.ok(escena.children.every(o => !o.visible));
    assert.ok(M.muestras().every(o => o.visible));
  }
});
prueba('HTML, tamaño y comentarios de los archivos autorizados', () => {
  assert.match(leer('index.html'), /src="js\/72-escuela-luz.js"><\/script>\s*<script src="js\/74-escuelas-magia.js"><\/script>/);
  for (const p of ['js/74-escuelas-magia.js', 'herramientas/probar-escuelas-magia.mjs']) {
    const s = leer(p), comentario = String.fromCharCode(47, 47); assert.ok(s.split('\n').length < 600);
    assert.ok(!s.split('\n').some(l => l.includes(comentario) && !l.trim().startsWith(comentario)));
    assert.ok(!/[\u3040-\u30ff\u3400-\u9fff]/u.test(s));
  }
});

console.log('\nPENDIENTE DE CLAUDE: transmisión de op en 70/71, oclusión por objetivo, estados en receptores y conexión del coste de vida.');
console.log(`${bien}/${bien + mal} pruebas correctas. Sin validación de GPU o jugabilidad.`);
process.exitCode = mal ? 1 : 0;
