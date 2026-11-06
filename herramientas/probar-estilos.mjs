/* Pruebas de estilos sin navegador, red ni paquetes externos. Ejecutar desde cualquier carpeta. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const raiz = new URL('../', import.meta.url);
const leer = ruta => fs.readFileSync(new URL(ruta, raiz), 'utf8');
let bien = 0, mal = 0;
function prueba(nombre, f) {
  try { f(); bien++; console.log('OK · ' + nombre); }
  catch (e) { mal++; console.error('FALLO · ' + nombre + '\n' + e.stack); }
}
const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} ≠ ${b}`);

/* Doble espacial: conserva identidad de objetivos, altura, radio y el contrato del primer contacto. */
function entorno(real = false) {
  const blancos = [], contactos = [], llamadas = [];
  const objetivo = (z, extra = {}) => { const o = { x: 0, y: 0, z, r: .25, alto: 1.5, ...extra }; blancos.push(o); return o; };
  const aplicar = (o, r, ang, dmg, op, toc) => {
    llamadas.push({ dmg, op, toc }); let n = 0;
    for (const b of blancos) {
      const d = Math.hypot(o.x - b.x, o.z - b.z), a = Math.atan2(b.x - o.x, b.z - o.z) - o.yaw;
      if (toc.has(b) || d > r + b.r || Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) > ang) continue;
      if (op.vertical && (o.y < b.y - .4 || o.y > b.y + b.alto + .4)) continue;
      toc.add(b); contactos.push({ b, dmg, peso: op.peso }); n++;
    }
    return n;
  };
  const ST = { luz: 100, hp: 100 }, J = { x: 0, y: 0, z: 0, yaw: 0, vivo: true };
  let pared = null, mult = 1;
  const contexto = vm.createContext({
    Math, Number, Set, console, Sis: { ST, dmgMult: () => mult }, J, FX: { rafaga() {}, emit() {} }, Halo: class {}, scene: {},
    clamp: (v, a, b) => Math.min(b, Math.max(a, v)), lerp: (a, b, k) => a + (b - a) * k, rnd: (a, b) => (a + b) / 2,
    Sol: { dentro: (x, y, z, r) => pared !== null && Math.abs(z - pared) <= r + .005 }, sueloEnJ: () => 0,
    Impacto: {
      sector: aplicar,
      circulo: (x, y, z, r, dmg, op, toc) => aplicar({ x, y, z, yaw: 0 }, r, Math.PI, dmg, op, toc),
      proyectil(x0, y0, z0, x1, y1, z1, r, dmg, op, toc) {
        const n = aplicar({ x: x1, y: y1, z: z1, yaw: Math.atan2(x1 - x0, z1 - z0) }, r, Math.PI, dmg, op, toc);
        return n ? { x: x1, y: y1, z: z1, n } : null;
      }
    }
  });
  if (real) {
    const vacio = { golpear: () => false };
    Object.assign(contexto, {
      Practica: { activa: false }, COMBATE: { peso: { empuje: [0, 1.5, 3.5, 6] } }, Duelo: vacio, Jefes: vacio,
      Fauna: { enRango: () => [], golpear() {} },
      Sombras: {
        enRango: (x, z, yaw, r, ang) => blancos.filter(b => {
          const a = Math.atan2(b.x - x, b.z - z) - yaw;
          return Math.hypot(x - b.x, z - b.z) <= r + b.r && Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) <= ang;
        }),
        golpear: (b, dmg, dx, dz, op) => contactos.push({ b, dmg, peso: op.peso })
      }
    });
    vm.runInContext(leer('js/70-impacto.js'), contexto);
  }
  vm.runInContext(leer('js/71-arco-luz.js') + '\n' + leer('js/72-escuela-luz.js') + '\nthis.api = { ArcoLuz, EscuelaLuz, ARCO, ESCUELA_LUZ };', contexto);
  const E = extra => ({ libre: true, atacar: false, atacarPulsado: false, esquivaReciente: 9, x: 0, y: 0, z: 0, yaw: 0, objetivo: null, luz: ST.luz, ...extra });
  function paso(M, dt, extra) {
    const r = M.entrada(dt, E(extra));
    assert.ok(r.gasta >= 0 && r.gasta <= ST.luz); assert.ok(r.ralentiza >= 0 && r.ralentiza <= 1);
    ST.luz -= r.gasta; M.actualizar(dt); return r;
  }
  function tiempo(M, s, extra = {}, dt = 1 / 60) {
    let t = 0;
    while (t < s - 1e-9) { const d = Math.min(dt, s - t); paso(M, d, extra); t += d; }
  }
  function disparar(M, tipo, dt = 1 / 60) {
    if (tipo === 'tensado' || tipo === 'lanza') {
      paso(M, dt, { atacar: true, atacarPulsado: true }); tiempo(M, 1, { atacar: true }, dt); paso(M, dt);
    } else paso(M, dt, { atacarPulsado: true, guardia: tipo === 'abanico' || tipo === 'rafaga', esquivaReciente: tipo === 'marca' ? .05 : 9 });
    tiempo(M, .9, {}, dt);
  }
  return { ...contexto.api, contexto, ST, J, E, paso, tiempo, disparar, objetivo, contactos, llamadas, pared: z => { pared = z; }, mult: n => { mult = n; } };
}

prueba('los ocho movimientos conservan su ficha y sus límites', () => {
  const t = entorno();
  const esperado = [
    [t.ARCO, 'rapido', 3, 14, 1, .10, .04, .26], [t.ARCO, 'tensado', 10, 32, 2, .08, .06, .36],
    [t.ARCO, 'abanico', 12, 8, 1, .18, .10, .42], [t.ARCO, 'marca', 5, 18, 1, .06, .04, .30],
    [t.ESCUELA_LUZ, 'orbe', 5, 12, 1, .12, .06, .32], [t.ESCUELA_LUZ, 'rafaga', 16, 22, 2, .20, .12, .42],
    [t.ESCUELA_LUZ, 'escudo', 10, 0, 2, .08, .30, .42], [t.ESCUELA_LUZ, 'lanza', 20, 42, 3, .16, .08, .50]
  ];
  for (const [C, id, ...valores] of esperado) {
    const f = C[id];
    ['coste', 'daño', 'peso', 'aviso', 'activo', 'recupera'].forEach((k, i) => cerca(f[k], valores[i]));
    assert.ok(f.coste > 0 && f.coste <= 20 && f.peso >= 1 && f.peso <= 3);
    if (f.vel) assert.ok(f.vel > 0 && f.vel <= 42 && f.alcance <= 30 && f.radio >= C.motor.paso);
  }
});

for (const [modulo, tipos] of [['ArcoLuz', ['rapido', 'tensado', 'abanico', 'marca']], ['EscuelaLuz', ['orbe', 'rafaga', 'lanza']]]) {
  for (const id of tipos) {
    prueba(`${modulo}/${id}: cobra una vez y aplica el multiplicador de daño`, () => {
      const t = entorno(), M = t[modulo], f = (modulo === 'ArcoLuz' ? t.ARCO : t.ESCUELA_LUZ)[id];
      t.mult(1.5); t.objetivo(2); t.disparar(M, id);
      cerca(t.ST.luz, 100 - f.coste); assert.ok(t.contactos.length > 0);
      for (const c of t.contactos) { cerca(c.dmg, f.daño * 1.5); assert.equal(c.peso, f.peso); }
      assert.equal(t.ST.hp, 100);
    });
    prueba(`${modulo}/${id}: sin luz no lanza ni daña`, () => {
      const t = entorno(), M = t[modulo]; t.ST.luz = 0; t.objetivo(2);
      const r = t.paso(M, 1 / 60, { atacarPulsado: true, guardia: id === 'abanico' || id === 'rafaga' });
      assert.match(r.aviso, /\{atacar\}/); t.disparar(M, id);
      assert.equal(t.ST.luz, 0); assert.equal(t.contactos.length, 0); assert.equal(M.estado().vuelos, 0);
    });
  }
}

for (const real of [false, true]) {
  prueba(`rápido se detiene; tensado perfora y no repite objetivos (${real ? 'Impacto real' : 'doble'})`, () => {
    const t = entorno(real), M = t.ArcoLuz, a = t.objetivo(3), b = t.objetivo(5);
    for (const o of [a, b]) { o.E = { r: o.r, alto: o.alto }; }
    t.disparar(M, 'rapido'); assert.equal(t.contactos.filter(c => c.b === a).length, 1); assert.equal(t.contactos.filter(c => c.b === b).length, 0);
    M.reiniciar(); t.contactos.length = 0; t.disparar(M, 'tensado');
    assert.equal(t.contactos.filter(c => c.b === a).length, 1); assert.equal(t.contactos.filter(c => c.b === b).length, 1);
    M.actualizar(4); assert.equal(t.contactos.length, 2);
  });
}

prueba('cada flecha del abanico tiene su propio toc; máximo tres contactos por objetivo', () => {
  const t = entorno(); const a = t.objetivo(.5, { r: 2 }); t.disparar(t.ArcoLuz, 'abanico');
  assert.equal(t.contactos.filter(c => c.b === a).length, 3);
  const registros = new Set(t.llamadas.map(l => l.toc)); assert.equal(registros.size, 3);
});

prueba('el coste se entrega al integrador; entrada no escribe el estado de Hikari', () => {
  const t = entorno(), M = t.ArcoLuz;
  M.entrada(0, t.E({ atacarPulsado: true })); const r = M.entrada(.11, t.E());
  assert.equal(r.gasta, 3); assert.equal(t.ST.luz, 100); assert.equal(t.ST.hp, 100);
});

for (const modulo of ['ArcoLuz', 'EscuelaLuz']) {
  prueba(`${modulo}: perder luz mientras carga no permite disparar`, () => {
    const t = entorno(), M = t[modulo]; t.paso(M, .01, { atacar: true, atacarPulsado: true });
    t.tiempo(M, 1, { atacar: true }); t.ST.luz = 0;
    t.paso(M, .01); const r = t.paso(M, .20); assert.match(r.aviso, /Falta luz/);
    assert.equal(M.estado().vuelos, 0); assert.equal(t.ST.luz, 0);
  });
  prueba(`${modulo}: cancelar la preparación no cobra y reiniciar limpia vuelo, carga, efectos y búfer`, () => {
    const t = entorno(), M = t[modulo];
    t.paso(M, .01, { atacarPulsado: true, atacar: true }); t.paso(M, .10, { cancelar: true });
    assert.equal(M.estado().carga, null); assert.equal(t.ST.luz, 100);
    t.paso(M, .01, { atacarPulsado: true }); t.paso(M, .20);
    assert.ok(M.estado().vuelos > 0); M.reiniciar(); M.actualizar(3);
    const s = M.estado(); assert.equal(s.vuelos, 0); assert.equal(s.efectos, 0); assert.equal(s.carga, null); assert.equal(s.accion, null); assert.equal(s.bufer, 0); assert.equal(s.vista, null);
  });
  prueba(`${modulo}: el vuelo termina sin recibir entrada y respeta alcance y altura`, () => {
    const t = entorno(), M = t[modulo]; t.objetivo(35); t.objetivo(2, { y: 5 });
    t.paso(M, .01, { atacarPulsado: true }); t.paso(M, .20); M.actualizar(5);
    assert.equal(M.estado().vuelos, 0); assert.equal(t.contactos.length, 0);
  });
}

prueba('búfer acotado: recuerda una orden al terminar; una orden caducada no reaparece', () => {
  const t = entorno(), M = t.ArcoLuz;
  t.paso(M, .01, { atacarPulsado: true }); t.tiempo(M, .31);
  t.paso(M, .01, { atacarPulsado: true }); t.tiempo(M, .30); cerca(t.ST.luz, 94);
  M.reiniciar(); t.ST.luz = 100;
  t.paso(M, .01, { atacarPulsado: true }); t.paso(M, .03, { atacarPulsado: true }); t.tiempo(M, 1); cerca(t.ST.luz, 97);
});

prueba('arco: la primera mitad de recuperación impide cancelar a defensa', () => {
  const t = entorno(), M = t.ArcoLuz;
  t.paso(M, .01, { atacarPulsado: true }); let r = t.paso(M, .15);
  assert.equal(r.bloquea, true); r = t.paso(M, .01, { guardia: true });
  assert.equal(r.bloquea, true); assert.equal(M.estado().accion, 'rapido');
  t.paso(M, .12); t.paso(M, .01, { guardia: true }); assert.equal(M.estado().accion, null);
});

prueba('el tensado no atraviesa paredes finas y la guía desaparece al soltar', () => {
  const t = entorno(), M = t.ArcoLuz; t.pared(2); t.objetivo(3);
  t.disparar(M, 'tensado'); assert.equal(t.contactos.length, 0); assert.equal(M.estado().vuelos, 0); assert.equal(M.estado().vista, null);
});

prueba('el orbe guía su altura hacia el punto fijado', () => {
  const t = entorno(), M = t.EscuelaLuz, b = t.objetivo(5, { y: 3, alto: .5 });
  t.paso(M, .01, { atacarPulsado: true, objetivo: { x: 0, y: 3.25, z: 5 } });
  t.tiempo(M, .8, { objetivo: { x: 0, y: 3.25, z: 5 } }); assert.equal(t.contactos.filter(c => c.b === b).length, 1);
});

prueba('el orbe sigue las nuevas coordenadas de fijación durante su vuelo', () => {
  const t = entorno(), M = t.EscuelaLuz, b = t.objetivo(5);
  t.paso(M, .01, { atacarPulsado: true, objetivo: { x: 0, y: .78, z: 5 } });
  t.paso(M, .12, { objetivo: { x: 0, y: .78, z: 5 } }); b.x = .8;
  t.tiempo(M, .5, { objetivo: { x: .8, y: .78, z: 5 } });
  assert.equal(t.contactos.filter(c => c.b === b).length, 1);
});

prueba('el abanico de luz cubre varios blancos una sola vez; no es un Pulso circular', () => {
  const t = entorno(), M = t.EscuelaLuz, a = t.objetivo(2), b = t.objetivo(2, { x: 1 }), c = t.objetivo(-2);
  t.disparar(M, 'rafaga'); assert.equal(t.contactos.filter(h => h.b === a).length, 1); assert.equal(t.contactos.filter(h => h.b === b).length, 1); assert.equal(t.contactos.filter(h => h.b === c).length, 0);
});

prueba('el abanico alcanza a quien entra durante su fase activa sin repetir daño', () => {
  const t = entorno(), M = t.EscuelaLuz, b = t.objetivo(8);
  t.paso(M, .01, { atacarPulsado: true, guardia: true }); t.paso(M, .21);
  assert.equal(t.contactos.length, 0); b.z = 2; t.paso(M, .02); t.paso(M, .02);
  assert.equal(t.contactos.filter(c => c.b === b).length, 1);
});

prueba('doce proyectiles contra seis objetivos conservan sus registros independientes', () => {
  const t = entorno(); for (let z = 2; z <= 12; z += 2) t.objetivo(z);
  const M = vm.runInContext('TallerLuz.crearMotor(ARCO.motor)', t.contexto);
  for (let i = 0; i < 12; i++) { assert.ok(M.haySitio(1)); M.lanzar(t.ARCO.tensado, t.E(), 0); }
  assert.equal(M.haySitio(1), false); M.actualizar(1);
  assert.equal(t.contactos.length, 72); assert.equal(M.estado().vuelos, 0);
});

function prepararEscudo(t) { t.paso(t.EscuelaLuz, 0, { guardia: true }); t.paso(t.EscuelaLuz, .10, { guardia: true }); }
prueba('mantener el escudo sin ataques no gasta ni se rearma solo', () => {
  const t = entorno(); prepararEscudo(t); t.tiempo(t.EscuelaLuz, 3, { guardia: true });
  assert.equal(t.ST.luz, 100); assert.equal(t.EscuelaLuz.estado().accion, null);
});
prueba('escudo: amplía parada, cobra al acertar y no intercepta un segundo golpe', () => {
  const t = entorno(), M = t.EscuelaLuz; prepararEscudo(t); t.paso(M, .18, { guardia: true });
  const r = M.defender({ x: 0, z: 2, dmg: 20 }, t.ST.luz);
  assert.equal(r.bloquea, true); assert.equal(r.parada, true); assert.equal(r.gasta, 10); assert.equal(t.ST.luz, 100);
  t.ST.luz -= r.gasta; assert.equal(M.defender({ x: 0, z: 2 }, t.ST.luz).gasta, 0); assert.equal(t.ST.luz, 90);
});
prueba('escudo: rechaza espalda, caída, imparable, falta de luz y ventana vencida', () => {
  const t = entorno(), M = t.EscuelaLuz; prepararEscudo(t);
  for (const e of [{ x: 0, z: -2 }, { x: 0, z: 2, caida: true }, { x: 0, z: 2, imparable: true }, {}]) assert.equal(M.defender(e, 100).bloquea, false);
  const r = M.defender({ x: 0, z: 2 }, 9); assert.equal(r.bloquea, false); assert.match(r.aviso, /\{guardia\}/); assert.equal(r.gasta, 0);
  M.reiniciar(); prepararEscudo(t); t.paso(M, .30, { guardia: true }); assert.equal(M.defender({ x: 0, z: 2 }, 100).bloquea, false);
});

for (const dt of [1 / 120, 1 / 60, 1 / 30, .05]) {
  prueba(`costes y contactos estables con fotogramas de ${(dt * 1000).toFixed(1)} ms`, () => {
    const t = entorno(), b = t.objetivo(4); t.disparar(t.ArcoLuz, 'tensado', dt);
    cerca(t.ST.luz, 90); assert.equal(t.contactos.filter(c => c.b === b).length, 1);
  });
}

/* Doble gráfico mínimo: comprueba lotes vacíos, creación única y variantes para precompilar. */
prueba('crear/modelo/muestras: objetos gráficos reutilizables y lotes ocultos al vaciar', () => {
  class Nodo {
    constructor() {
      this.children = []; this.visible = true; this.matrix = {}; this.instanceMatrix = {};
      const v = () => ({ x: 0, y: 0, z: 0, set() { return this; } });
      this.position = v(); this.scale = v(); this.rotation = v(); this.quaternion = { set() {}, setFromUnitVectors() {} };
    }
    add(o) { this.children.push(o); } updateMatrix() {} setMatrixAt() {}
  }
  class Malla extends Nodo { constructor(g, m) { super(); this.geometry = g; this.material = m; } }
  class Geo { rotateX() {} rotateZ() {} }
  class Material { constructor(o) { Object.assign(this, o); } }
  const t = entorno();
  t.contexto.THREE = { Object3D: Nodo, Group: Nodo, Vector3: class { set() { return this; } }, Mesh: Malla, InstancedMesh: Malla, MeshBasicMaterial: Material,
    CylinderGeometry: Geo, ConeGeometry: Geo, SphereGeometry: Geo, TorusGeometry: Geo, RingGeometry: Geo, AdditiveBlending: 2, DoubleSide: 2 };
  for (const M of [t.ArcoLuz, t.EscuelaLuz]) {
    assert.equal(M.muestras().length, 0); const escena = new Nodo(); M.crear(escena); M.crear(escena);
    assert.equal(escena.children.length, 5); assert.equal(M.muestras().length, 6); assert.ok(M.modelo() instanceof Nodo);
    t.paso(M, .01, { atacarPulsado: true }); t.paso(M, .2); assert.ok(escena.children.some(o => o.visible));
    M.reiniciar(); assert.ok(escena.children.every(o => !o.visible));
  }
});

prueba('carga HTML en orden y archivos por debajo de 600 líneas', () => {
  const html = leer('index.html');
  assert.match(html, /src="js\/70-impacto.js"><\/script>\s*<script src="js\/71-arco-luz.js"><\/script>\s*<script src="js\/72-escuela-luz.js"><\/script>/);
  for (const f of ['js/71-arco-luz.js', 'js/72-escuela-luz.js', 'herramientas/probar-estilos.mjs']) {
    const s = leer(f), comentario = String.fromCharCode(47, 47);
    assert.ok(s.split('\n').length < 600); assert.ok(!s.split('\n').some(l => l.includes(comentario) && !l.trim().startsWith(comentario)));
  }
});

console.log(`\n${bien}/${bien + mal} pruebas correctas.`);
process.exitCode = mal ? 1 : 0;
