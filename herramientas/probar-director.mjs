// Lógica del director y ciclos de las Sombras. Node, sin DOM ni navegador.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const codigo = fs.readFileSync(new URL('../js/69-director-combate.js', import.meta.url), 'utf8');
const sombras = fs.readFileSync(new URL('../js/35-sombras.js', import.meta.url), 'utf8');
const variantes = fs.readFileSync(new URL('../js/75-variantes-sombra.js', import.meta.url), 'utf8');
let pruebas = 0, fallos = 0;
function probar(nombre, fn) {
  pruebas++;
  try { fn(); console.log('OK · ' + nombre); }
  catch (error) { fallos++; console.error('FALLO · ' + nombre + '\n' + error.stack); }
}
function director(modo = 'exigente', sinAjustes = false) {
  const contexto = vm.createContext(sinAjustes ? {} : { AJUSTES: { dificultad: modo } });
  vm.runInContext(codigo, contexto);
  return vm.runInContext('DirectorCombate', contexto);
}
const reserva = (impacto = .5, total = 5, extra = {}) => ({ total, impactos: [impacto], ...extra });

for (const [modo, puntos] of [['sereno', 1], ['exigente', 2], ['intenso', 3]]) {
  probar('Presupuesto en ' + modo, () => assert.equal(director(modo).presupuesto, puntos));
  probar('Ataque pesado posible en ' + modo, () => {
    const D = director(modo);
    assert.equal(D.pedir('pesado', 2, reserva()), true);
    D.actualizar(.3);
    assert.equal(D.pedir('otro', 2, reserva()), false);
  });
}
probar('Exigente por defecto sin AJUSTES y ante un valor desconocido', () => {
  assert.equal(director(undefined, true).presupuesto, 2);
  assert.equal(director('desconocido').presupuesto, 2);
});
probar('Sereno solo permite un ligero', () => {
  const D = director('sereno'); assert.equal(D.pedir('a', 1, 5), true); D.actualizar(.3);
  assert.equal(D.pedir('b', 1, 4), false);
});
probar('Exigente admite dos ligeros y veta un tercero', () => {
  const D = director(); assert.equal(D.pedir('a', 1, reserva(.5)), true); D.actualizar(.3);
  assert.equal(D.pedir('b', 1, reserva(.5)), true); D.actualizar(.3);
  assert.equal(D.pedir('c', 1, reserva(.5)), false);
});
probar('Intenso admite pesado y ligero, con máximo dos atacantes', () => {
  const D = director('intenso'); assert.equal(D.pedir('a', 2, reserva(.5)), true); D.actualizar(.3);
  assert.equal(D.pedir('b', 1, reserva(.5)), true); D.actualizar(.3);
  assert.equal(D.pedir('c', 1, reserva(.5)), false);
  D.reiniciar(); D.pedir('a', 1, reserva(.5)); D.actualizar(.3); D.pedir('b', 1, reserva(.5)); D.actualizar(.3);
  assert.equal(D.pedir('c', 1, reserva(.5)), false);
});
probar('Avisos separados por al menos 0,30 s, incluso tras liberar', () => {
  const D = director(); D.pedir('a', 1, reserva()); D.liberar('a'); D.actualizar(.299);
  assert.equal(D.pedir('b', 1, reserva()), false); D.actualizar(.001);
  assert.equal(D.pedir('b', 1, reserva()), true);
});
probar('Dos avisos espaciados no permiten impactos separados solo 0,10 s', () => {
  const D = director(); D.pedir('a', 1, reserva(1)); D.actualizar(.3);
  assert.equal(D.pedir('b', 1, reserva(.6)), false);
  assert.equal(D.pedir('b', 1, reserva(.45)), true);
});
probar('Se conserva el margen de un impacto pasado al liberar', () => {
  const D = director(); D.pedir('a', 1, reserva(.5)); D.actualizar(.5); D.liberar('a'); D.actualizar(.15);
  assert.equal(D.pedir('b', 1, reserva(.05)), false);
  assert.equal(D.pedir('b', 1, reserva(.10)), true);
});
probar('Una secuencia reserva sus avisos e impactos futuros', () => {
  const D = director('intenso');
  assert.equal(D.pedir('secuencia', 2, { total: 4, avisos: [0, 1.38], impactos: [.85, 1.78] }), true);
  D.actualizar(1.2);
  assert.equal(D.pedir('b', 1, reserva(.9)), false);
  D.actualizar(.5);
  assert.equal(D.pedir('b', 1, reserva(.1)), false);
  assert.equal(D.pedir('b', 1, reserva(.5)), true);
});
probar('Retención de 0,20 s tras interrupción, sin liberación anticipada', () => {
  const D = director(); D.pedir('a', 2, reserva(1)); D.actualizar(.4); D.interrumpido('a'); D.liberar('a');
  D.actualizar(.199); assert.equal(D.pedir('b', 2, reserva()), false);
  D.interrumpido('a'); D.actualizar(.001); assert.equal(D.pedir('b', 2, reserva()), true);
});
probar('La interrupción cancela los impactos futuros y no concede otro permiso al mismo atacante', () => {
  const D = director(); D.pedir('a', 2, reserva(1)); D.actualizar(.4); D.interrumpido('a');
  assert.equal(D.pedir('a', 2, reserva()), false); D.actualizar(.2);
  assert.equal(D.pedir('b', 2, reserva(.4)), true);
});
probar('Repetir una petición concedida no duplica ni prolonga el permiso', () => {
  const D = director(); assert.equal(D.pedir('a', 2, 1), true); D.actualizar(.4);
  assert.equal(D.pedir('a', 2, 5), true); D.actualizar(.6);
  assert.equal(D.pedir('b', 2, reserva(.5)), true);
});
probar('Un permiso de esquirla dura los dos segundos de vuelo', () => {
  const D = director(); D.pedir('esquirla', 1, 2); D.actualizar(1.999);
  assert.equal(D.pedir('pesado', 2, reserva()), false); D.actualizar(.001);
  assert.equal(D.pedir('pesado', 2, reserva()), true);
});
probar('Jefe ligero permite un acompañante ligero y veta uno pesado', () => {
  const D = director('intenso'); D.pedir('jefe', 1, reserva(.5, 5, { jefe: true })); D.actualizar(.3);
  assert.equal(D.pedir('pesado', 2, reserva(.5)), false);
  assert.equal(D.pedir('ligero', 1, reserva(.5)), true);
});
probar('El veto del jefe funciona también si pide después de un acompañante pesado', () => {
  const D = director('intenso'); D.pedir('pesado', 2, reserva(.5)); D.actualizar(.3);
  assert.equal(D.pedir('jefe', 1, reserva(.5, 5, { jefe: true })), false);
});
probar('Gran zona del jefe excluye acompañantes en ambos órdenes', () => {
  const D = director('intenso'); D.pedir('jefe', 2, reserva(.5, 5, { jefe: true, zonaGrande: true })); D.actualizar(.3);
  assert.equal(D.pedir('acompañante', 1, reserva(.5)), false);
  D.reiniciar(); D.pedir('acompañante', 1, reserva(.5)); D.actualizar(.3);
  assert.equal(D.pedir('jefe', 2, reserva(.5, 5, { jefe: true, zonaGrande: true })), false);
});
probar('Reiniciar borra presupuesto ocupado y agendas', () => {
  const D = director(); D.pedir('a', 2, reserva()); D.interrumpido('a'); D.reiniciar();
  assert.equal(D.pedir('b', 2, reserva()), true);
});
probar('Valores inválidos no reservan ni alteran el reloj', () => {
  const D = director();
  for (const coste of [0, -1, 1.5, 3, NaN]) assert.equal(D.pedir('a', coste, 1), false);
  for (const total of [0, -1, NaN, Infinity]) assert.equal(D.pedir('a', 1, total), false);
  assert.equal(D.pedir('a', 1, { total: 1, impactos: [2] }), false);
  assert.equal(D.pedir('a', 1, { total: 1, impactos: [.5], avisos: [.1] }), false);
  D.actualizar(NaN); D.actualizar(-1); assert.equal(D.pedir('a', 2, 1), true);
});

// Sustitutos de dibujo y mundo. Se ejecuta la IA real y se recoge su dañoJugador.
export function mundo(azar = .8, opciones = {}) {
  const vector = () => ({ x: 0, y: 0, z: 0, set(x, y, z) { Object.assign(this, { x, y, z }); }, setScalar(v) { this.set(v, v, v); } });
  class Nodo {
    constructor(g, m) { this.position = vector(); this.rotation = vector(); this.scale = vector(); this.children = []; this.material = m || {}; this.color = { setHex() {} }; this.visible = true; }
    add(...nodos) { this.children.push(...nodos); }
    rotateX() { return this; }
    getWorldPosition() { return this.position; }
    dispose() {}
  }
  class Material { constructor(datos) { Object.assign(this, datos); } dispose() {} }
  const eventos = [], azarFijo = Object.create(Math); azarFijo.random = () => azar;
  const c = vm.createContext({
    Math: azarFijo, AJUSTES: { dificultad: opciones.dificultad || 'exigente', calidad: opciones.calidad || 'alta' }, THREE: new Proxy({}, { get: (_, k) => k.includes('Material') ? Material : Nodo }), Halo: Nodo,
    scene: { add() {}, remove() {} }, U: { uT: { value: 0 } }, Atmosfera: { inyectar() {} },
    lin: x => x, pieza: () => ({}), fusionar: () => ({}), abollar: () => ({}), icoSuave: () => ({}),
    TAU: Math.PI * 2, NIVEL_AGUA: -10, altura: () => 0, esHielo: () => false, sueloEnJ: () => 0,
    Sol: { empujar: () => false }, empujarArboles() {},
    ProgresionEnemiga: { capturar: () => ({}), region: () => 'pradera', sombra: e => structuredClone(e) },
    Sis: { tiene: () => false, ST: { onis: {}, frag: [] }, rescatar() {}, guardar() {} },
    UI: { dlg: false, aviso() {}, banner() {} }, Cin: { activa: false }, Sonido: { sfx() {} },
    FX: { rafaga() {}, numero() {}, emit() {} }, Bus: { on() {}, emit: (tipo, datos) => eventos.push({ tipo, datos }) },
    J: { x: 0, y: 0, z: 3, vx: 0, vz: 0, vivo: true, rodando: 0 },
    setTimeout: () => { throw Error('El ensayo no debe activar emboscadas'); }
  });
  vm.runInContext(`
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const lerp = (a, b, k) => a + (b - a) * k;
    const rnd = (a, b) => (a + b) / 2;
    const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
    const angDif = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
    const angDamp = (a, b, k, dt) => a + angDif(a, b) * (1 - Math.exp(-k * dt));
    const easeIO = t => t;
  `, c);
  vm.runInContext(codigo, c); vm.runInContext(sombras, c); vm.runInContext(variantes, c);
  const S = vm.runInContext('Sombras', c), D = vm.runInContext('DirectorCombate', c);
  let tiempo = 0;
  function paso(dt = .01) { tiempo += dt; c.U.uT.value = tiempo; S.actualizar(dt, c.J); }
  function hasta(fn, maximo = 1000) { let n = 0; while (!fn() && n++ < maximo) paso(); assert.ok(fn(), 'Estado no alcanzado en ' + maximo + ' pasos'); }
  function crear(tipo, distancia = 3, opciones) {
    c.J.z = distancia;
    const s = S.crear(tipo, 0, 0, null, opciones); s.estado = 'acechar'; s.cd = 0; s.yaw = 0;
    return s;
  }
  return { c, S, D, eventos, crear, paso, hasta, get tiempo() { return tiempo; } };
}
const tipos = [['rastrera', 3, .5, .4, .7], ['escudo', 2, .65, .15, .9], ['lanzadora', 10, .65, 0, .85], ['oni', 3, .85, .18, 1.1]];
for (const [tipo, distancia, aviso, activo, recupera] of tipos) {
  probar(tipo + ': aviso, activo y recuperación completos tras fallar', () => {
    const M = mundo(), s = M.crear(tipo, distancia); M.paso(); assert.equal(s.estado, 'aviso');
    const inicio = M.tiempo; M.hasta(() => s.fijado);
    assert.equal(M.eventos.filter(e => e.tipo === 'dañoJugador').length, 0);
    const blanco = { x: s.objX, z: s.objZ }, yaw = s.yaw; M.c.J.x = 100;
    M.hasta(() => s.estado !== 'aviso');
    assert.equal(s.objX, blanco.x); assert.equal(s.objZ, blanco.z);
    assert.ok(Math.abs(s.yaw - yaw) <= Math.PI / 12 + 1e-8);
    assert.ok(M.tiempo - inicio >= aviso - 1e-8 && M.tiempo - inicio < aviso + .03);
    const finAviso = M.tiempo; M.hasta(() => s.estado === 'recuperar');
    assert.ok(M.tiempo - finAviso >= activo - 1e-8 && M.tiempo - finAviso < activo + .03);
    assert.equal(M.eventos.filter(e => e.tipo === 'dañoJugador').length, 0);
    const inicioRecuperacion = M.tiempo;
    for (let i = 0; i < 20; i++) M.paso();
    const t = s.t; M.S.golpear(s, 1, 1, 0, { peso: 1 });
    assert.equal(s.estado, 'recuperar'); assert.equal(s.t, t);
    M.c.J.x = s.x + 1; M.c.J.z = s.z; M.paso(); assert.equal(s.estado, 'recuperar');
    M.hasta(() => s.estado !== 'recuperar');
    assert.ok(M.tiempo - inicioRecuperacion >= recupera - 1e-8 && M.tiempo - inicioRecuperacion < recupera + .03);
  });
  probar(tipo + ': sin permiso se recoloca y no daña', () => {
    const M = mundo(); M.D.pedir('ocupado', 2, reserva(8, 20));
    const s = M.crear(tipo, distancia);
    for (let i = 0; i < 100; i++) M.paso();
    assert.equal(s.estado, 'acechar'); assert.equal(s.esperaPermiso, true);
    assert.ok(Math.hypot(s.x, s.z) > .1 && Math.hypot(s.x, s.z) <= 2.4 + .01);
    assert.equal(M.eventos.filter(e => e.tipo === 'dañoJugador').length, 0);
  });
}
probar('Barrido del oni: activo de 0,22 s, recuperación de 1,20 s y un contacto', () => {
  const M = mundo(.1), s = M.crear('oni', 2); M.paso(); assert.equal(s.golpe, 'barrido');
  const aviso = M.tiempo; M.hasta(() => s.estado === 'golpe'); assert.ok(M.tiempo - aviso >= .7 - 1e-8);
  const activo = M.tiempo; M.hasta(() => s.estado === 'recuperar'); assert.ok(M.tiempo - activo >= .22 - 1e-8);
  assert.equal(M.eventos.filter(e => e.tipo === 'dañoJugador').length, 1);
  assert.equal(M.eventos.find(e => e.tipo === 'dañoJugador').datos.imparable, true);
  const recuperacion = M.tiempo; M.hasta(() => s.estado === 'acechar'); assert.ok(M.tiempo - recuperacion >= 1.2 - 1e-8);
});
probar('Oni avanzado: dos golpes, pausa de 0,35 s, segundo aviso de 0,40 s y recuperación de 1,30 s', () => {
  const M = mundo(), s = M.crear('oniAvanzado', 3); M.paso();
  M.hasta(() => s.estado === 'pausa'); const pausa = M.tiempo;
  M.hasta(() => s.estado === 'aviso'); assert.equal(s.paso, 2); assert.ok(M.tiempo - pausa >= .35 - 1e-8);
  const segundoAviso = M.tiempo; M.hasta(() => s.estado === 'golpe'); assert.ok(M.tiempo - segundoAviso >= .4 - 1e-8);
  M.hasta(() => s.estado === 'recuperar'); const recuperacion = M.tiempo;
  M.hasta(() => s.estado === 'acechar'); assert.ok(M.tiempo - recuperacion >= 1.3 - 1e-8);
  assert.equal(M.eventos.filter(e => e.tipo === 'dañoJugador').length, 2);
  assert.equal(vm.runInContext("ZONAS_SOMBRA.some(z => z.tipos.includes('oniAvanzado'))", M.c), false);
});
probar('Esquirla mantiene permiso tras recuperar y lo libera al terminar el vuelo', () => {
  const M = mundo(), s = M.crear('lanzadora', 10); M.paso(); M.hasta(() => s.fijado); M.c.J.x = 100;
  M.hasta(() => s.estado === 'recuperar'); M.hasta(() => s.estado === 'acechar');
  assert.equal(M.S.esquirlas.length, 1); assert.equal(M.D.pedir('pesado', 2, reserva(.5)), false);
  M.hasta(() => M.S.esquirlas.length === 0); assert.equal(M.D.pedir('pesado', 2, reserva(.5)), true);
});
probar('Devolver una esquirla libera su amenaza sin esperar a su regreso', () => {
  const M = mundo(), s = M.crear('lanzadora', 10); M.paso(); M.hasta(() => s.fijado); M.c.J.x = 100;
  M.hasta(() => s.estado === 'recuperar'); M.hasta(() => s.estado === 'acechar');
  const e = M.S.esquirlas[0]; M.S.devolver(e);
  assert.equal(e.devuelta, true); assert.equal(M.D.pedir('pesado', 2, reserva(.5)), true);
});
probar('Un pulso cancela la esquirla sin un contacto tardío', () => {
  const M = mundo(), s = M.crear('lanzadora', 10); M.paso(); M.hasta(() => M.S.esquirlas.length > 0);
  const e = M.S.esquirlas[0]; M.S.pulso(e.x, e.z, .2, 0); M.c.J.x = e.x; M.c.J.z = e.z;
  M.paso(); assert.equal(M.S.esquirlas.length, 0);
  assert.equal(M.eventos.filter(e => e.tipo === 'dañoJugador').length, 0);
});
probar('Interrumpir a la lanzadora no libera una esquirla que sigue amenazando', () => {
  const M = mundo(), s = M.crear('lanzadora', 10); M.paso(); M.hasta(() => s.fijado); M.c.J.x = 100;
  M.hasta(() => s.estado === 'recuperar'); M.hasta(() => s.estado === 'acechar');
  M.S.pulso(s.x, s.z, 1, 0); assert.equal(s.estado, 'aturdido');
  assert.equal(M.D.pedir('pesado', 2, reserva(.5)), false);
  const e = M.S.esquirlas[0]; M.S.pulso(e.x, e.z, .2, 0);
  M.D.actualizar(.199); assert.equal(M.D.pedir('pesado', 2, reserva(.5)), false);
  M.D.actualizar(.001); assert.equal(M.D.pedir('pesado', 2, reserva(.5)), true);
});
probar('Interrumpir el aviso real conserva el permiso 0,20 s', () => {
  const M = mundo(), s = M.crear('rastrera', 3); M.paso();
  for (let i = 0; i < 35; i++) M.paso();
  M.S.golpear(s, 1, 1, 0, { peso: 1 }); assert.equal(s.estado, 'herido');
  M.D.actualizar(.199); assert.equal(M.D.pedir('pesado', 2, reserva(.5)), false);
  M.D.actualizar(.001); assert.equal(M.D.pedir('pesado', 2, reserva(.5)), true);
});
probar('Parar el salto al aterrizar conserva el aturdimiento', () => {
  const M = mundo(), s = M.crear('rastrera', 3); M.paso(); M.hasta(() => s.estado === 'salto');
  M.c.Bus.emit = (tipo, datos) => { if (tipo === 'dañoJugador') M.S.desviar(datos.s, 0, -1); };
  M.c.J.x = s.x + Math.sin(s.yaw) * s.recorrido; M.c.J.z = s.z + Math.cos(s.yaw) * s.recorrido;
  M.hasta(() => s.estado === 'aturdido'); assert.equal(s.estado, 'aturdido');
});
probar('Aceleración de 12 y frenado de 16 m/s²', () => {
  const M = mundo(), s = M.crear('rastrera', 12); M.paso(); assert.ok(Math.hypot(s.mx, s.mz) <= .12 + 1e-8);
  for (let i = 0; i < 30; i++) M.paso();
  const antes = Math.hypot(s.mx, s.mz); s.estado = 'recuperar'; s.t = 0; M.paso();
  assert.ok(Math.abs(antes - Math.hypot(s.mx, s.mz) - .16) < 1e-8);
});
probar('El escudo gira como máximo 120 grados por segundo', () => {
  const M = mundo(), s = M.crear('escudo', 10); s.yaw = Math.PI; const antes = s.yaw; M.paso();
  assert.ok(Math.abs(s.yaw - antes) <= 120 * Math.PI / 180 * .01 + 1e-8);
});
probar('La lanzadora solo inicia una retirada de un metro cada tres segundos', () => {
  const M = mundo(), s = M.crear('lanzadora', 2); M.paso(); const destino = { ...s.retirada };
  assert.ok(Math.hypot(destino.x, destino.z) <= 1 + 1e-8);
  for (let i = 0; i < 250; i++) M.paso();
  assert.ok(s.retiradaT > 0); assert.ok(Math.hypot(s.x, s.z - 2) < 3.02);
});
probar('Un atasco cambia el sentido de rodeo sin trasladar a la Sombra', () => {
  const M = mundo(), s = M.crear('rastrera', 12), giro = s.ang;
  M.c.Sol.empujar = p => { p.x = 0; p.z = 0; return true; };
  for (let i = 0; i < 90; i++) M.paso();
  assert.equal(s.x, 0); assert.equal(s.z, 0); assert.equal(s.ang, -giro);
});
probar('Matar a la dueña de una esquirla devuelta no borra las de otra lanzadora', () => {
  const M = mundo(), a = M.crear('lanzadora', 10); M.paso(); M.hasta(() => M.S.esquirlas.length > 0);
  const primera = M.S.esquirlas[0]; M.S.devolver(primera);
  const b = M.S.crear('lanzadora', 5, 0, null); b.estado = 'acechar'; b.cd = 0;
  M.hasta(() => M.S.esquirlas.some(e => e.dueña === b));
  const segunda = M.S.esquirlas.find(e => e.dueña === b);
  primera.x = a.x; primera.y = a.y + a.E.alto * .6; primera.z = a.z;
  a.animo = 1; M.paso();
  assert.equal(a.estado, 'romper'); assert.ok(M.S.esquirlas.includes(segunda));
});
probar('Sombras fijas de Tasogare conservan posición y altura', () => {
  const M = mundo(), s = M.crear('lanzadora', 10, { fija: true, y: 8 }); M.c.J.y = 8;
  s.vx = 10; s.vz = 10;
  for (let i = 0; i < 300; i++) M.paso();
  assert.equal(s.x, 0); assert.equal(s.z, 0); assert.equal(s.y, 8);
  assert.ok(M.eventos.some(e => e.tipo === 'dañoJugador'));
});
probar('Oni conserva equilibrio, rotura, custodia y regreso por correa', () => {
  const M = mundo(), s = M.crear('oni', 3); M.paso();
  M.S.golpear(s, 1, 1, 0, { pulso: true, peso: 1 }); assert.ok(s.eq < s.E.equilibrio.max);
  s.eq = 1; M.S.desviar(s, 0, -1); assert.equal(s.estado, 'roto');
  M.hasta(() => s.estado === 'acechar'); assert.equal(s.eq, s.E.equilibrio.max);
  M.c.J.z = 40; M.paso(); assert.equal(s.estado, 'volver');
  const g = M.S.guardias[0]; g.s = s; s.guardia_ = g; assert.equal(M.S.custodia(g.id), true);
  M.S.romper(s); assert.equal(M.S.custodia(g.id), false); assert.equal(M.c.Sis.ST.onis[g.id], 1);
});
probar('Romper el farol mantiene su aturdimiento', () => {
  const M = mundo(), s = M.crear('escudo', 2); M.paso(); M.S.golpear(s, 1, 0, -1, { romper: true });
  assert.equal(s.guardia, false); assert.equal(s.farol.visible, false); assert.equal(s.estado, 'aturdido');
});
probar('Quitar la última Sombra limpia esquirlas y reinicia el director', () => {
  const M = mundo(), s = M.crear('lanzadora', 10); M.paso(); M.hasta(() => M.S.esquirlas.length > 0);
  M.S.quitar(s); assert.equal(M.S.lista.length, 0); assert.equal(M.S.esquirlas.length, 0);
  assert.equal(M.D.pedir('nuevo', 2, reserva(.5)), true);
});

console.log('\n' + (pruebas - fallos) + '/' + pruebas + ' pruebas correctas.');
process.exitCode = fallos ? 1 : 0;
