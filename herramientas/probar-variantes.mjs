// Fase 7. Ejecuta las IA y el director reales sin DOM ni navegador.
// Importar el mundo también ejecuta las 48 regresiones del director.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { mundo } from './probar-director.mjs';

let pruebas = 0, fallos = 0;
const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
function probar(nombre, fn) {
  pruebas++;
  try { fn(); console.log('OK · ' + nombre); }
  catch (e) { fallos++; console.error('FALLO · ' + nombre + '\n' + e.stack); }
}
const fichas = [
  ['espejo', 'luz', .7, 2], ['devoradora', 'oscuridad', .7, 2.6], ['escoria', 'brasa', .72, 2],
  ['alada', 'brasa', .72, 3], ['lanzadoraEscarcha', 'escarcha', .7, 10], ['oniAnclado', 'viento', .7, 3]
];
const elementos = ['luz', 'viento', 'brasa', 'escarcha', 'oscuridad'];
const daño = (M, s, op, ux = 0, uz = -1) => {
  const antes = s.animo;
  M.S.golpear(s, 10, ux, uz, { vertical: true, ...op });
  return antes - s.animo;
};
for (const [tipo, elemento, recibe, distancia] of fichas) {
  probar(tipo + ': ficha completa y materiales precalentables', () => {
    const M = mundo(), s = M.crear(tipo, distancia), E = s.E;
    for (const n of ['animo', 'daño', 'vel', 'r', 'alto', 'motas', 'aviso', 'recupera', 'coste']) assert.ok(E[n] > 0, n);
    assert.equal(E.ojos.length, 2); assert.equal(E.espera.length, 2);
    assert.ok(E.color && E.sonidoAviso && E.pista); assert.ok(M.S.muestras().children.length >= 20);
  });
  probar(tipo + ': reduce solo su elemento; no cura ni devuelve daño', () => {
    for (const e of elementos) {
      const M = mundo(), s = M.crear(tipo, distancia), armadura = s.E.armadura || 1;
      cerca(daño(M, s, { elemento: e }), 10 * armadura * (e === elemento ? recibe : 1));
      assert.equal(M.eventos.filter(e => e.tipo === 'dañoJugador').length, 0);
      assert.ok(s.animo < s.E.animo);
    }
  });
  probar(tipo + ': recuperación y parada retiran la resistencia elemental', () => {
    const M = mundo(), s = M.crear(tipo, distancia); s.estado = 'recuperar';
    cerca(daño(M, s, { elemento }), 10 * (s.E.armadura || 1));
    M.S.desviar(s, 0, -1);
    cerca(daño(M, s, { elemento }), 10 * (s.E.armadura || 1));
  });
  probar(tipo + ': el factor de daño protegido equivale a +25–60 %', () => {
    const factor = 1 / recibe;
    assert.ok(factor >= 1.25 && factor <= 1.6);
  });
  for (const dificultad of ['sereno', 'exigente', 'intenso']) {
    probar(tipo + ': reserva el coste correcto en ' + dificultad, () => {
      const M = mundo(.8, { dificultad }), s = M.crear(tipo, distancia), D = M.D, llamadas = [];
      const pedir = D.pedir;
      D.pedir = (...args) => { llamadas.push(args); return pedir(...args); };
      M.paso(); assert.equal(s.estado, 'aviso'); assert.equal(llamadas[0][1], s.E.coste);
      const plan = llamadas[0][2]; assert.equal(plan.avisos[0], 0); assert.ok(plan.impactos.every(t => t <= plan.total));
      D.actualizar(.3);
      const otro = D.pedir('otro', 1, { total: 5, impactos: [4] });
      assert.equal(otro, D.presupuesto > s.E.coste);
    });
    probar(tipo + ': sin permiso no anuncia ni daña en ' + dificultad, () => {
      const M = mundo(.8, { dificultad }), s = M.crear(tipo, distancia), pedir = M.D.pedir, intentos = [];
      M.D.pedir = (...args) => { intentos.push(args); return args[0] === s ? false : pedir(...args); };
      for (let i = 0; i < 120; i++) M.paso();
      assert.ok(intentos.some(a => a[0] === s)); assert.equal(s.permiso, false);
      assert.equal(s.estado, 'acechar'); assert.equal(M.eventos.filter(e => e.tipo === 'dañoJugador').length, 0);
    });
  }
  probar(tipo + ': recupera el ciclo completo después de fallar', () => {
    const M = mundo(), s = M.crear(tipo, distancia); M.paso();
    M.c.J.x = 100; M.hasta(() => s.estado === 'recuperar');
    const inicio = M.tiempo, tiempo = s.E.secuencia ? s.E.secuencia.recupera : s.E.recupera;
    M.hasta(() => s.estado !== 'recuperar'); assert.ok(M.tiempo - inicio >= tiempo - .011);
    assert.equal(M.eventos.filter(e => e.tipo === 'dañoJugador').length, 0);
  });
  probar(tipo + ': pulso, rotura y retirada limpian sus permisos', () => {
    const M = mundo(), s = M.crear(tipo, distancia); M.paso();
    if (tipo === 'alada') { s.y = .25; s.estado = 'recuperar'; }
    const antes = s.animo; M.S.pulso(s.x, s.z, 2, 1); assert.ok(s.animo < antes);
    M.S.romper(s); assert.equal(s.estado, 'romper'); M.S.quitar(s);
    assert.ok(!M.S.lista.includes(s)); assert.equal(M.D.pedir('limpio', 2, 1), true);
  });
}

probar('Espejo: flanco y recuperación reciben luz entera; frente recibe 70 %', () => {
  const M = mundo(), s = M.crear('espejo', 2);
  cerca(daño(M, s, { elemento: 'luz' }, 0, 1), 10);
  s.estado = 'acechar'; cerca(daño(M, s, { elemento: 'luz', arco: true, perfora: true }), 7);
  s.estado = 'recuperar'; cerca(daño(M, s, { elemento: 'luz' }), 10);
  assert.equal(s.farol, undefined); assert.equal(s.placas.length, 2);
});
probar('Espejo: el rombo se abre y el contacto da puntos y sonido propios', () => {
  const M = mundo(), s = M.crear('espejo', 2), sonidos = [], puntos = [];
  M.c.Sonido.sfx = (...a) => sonidos.push(a); M.c.FX.rafaga = (...a) => puntos.push(a);
  daño(M, s, { elemento: 'luz' }); assert.ok(sonidos.some(a => a[0] === 'tick'));
  assert.equal(puntos.filter(a => a[3] === 3).length, 2);
  s.estado = 'recuperar'; M.paso(); assert.ok(Math.abs(s.placas[0].position.x) > .4);
});
probar('Escoria y escarcha: perforación recibe 80 %; una flecha no elude la cubierta', () => {
  for (const [tipo, elemento] of [['escoria', 'brasa'], ['lanzadoraEscarcha', 'escarcha']]) {
    const M = mundo(), s = M.crear(tipo, 2);
    cerca(daño(M, s, { elemento, perfora: true }), 8);
    s.estado = 'acechar'; cerca(daño(M, s, { elemento, perfora: true, arco: true }), 10 * s.E.defensa.recibe);
  }
});
probar('Oni anclado: viento reduce presión al 70 %, conserva op y admite rotura', () => {
  const M = mundo(), s = M.crear('oniAnclado', 3), op = { elemento: 'viento', empuje: 8, peso: 2, contra: true }, copia = { ...op };
  const a = M.S.variantes.defensa(s, 10, op, 0, -1); cerca(a.op.empuje, 2); assert.deepEqual(op, copia);
  const antes = s.eq; daño(M, s, op); cerca(antes - s.eq, 8 * 1 * 1.5 * .7);
  s.estado = 'roto'; cerca(daño(M, s, op), 10);
});
probar('Oni anclado: dos impactos, segundo aviso y recuperación de 1,30 s', () => {
  const M = mundo(), s = M.crear('oniAnclado', 3), planes = [], pedir = M.D.pedir;
  M.D.pedir = (...args) => { planes.push(args); return pedir(...args); };
  M.paso(); assert.equal(planes[0][2].impactos.length, 2); assert.equal(planes[0][2].avisos.length, 2);
  M.hasta(() => s.estado === 'golpe');
  M.c.J.x = s.x; M.c.J.z = s.z + 1;
  M.hasta(() => s.estado === 'pausa'); const pausa = M.tiempo;
  M.hasta(() => s.estado === 'aviso' && s.paso === 2); assert.ok(M.tiempo - pausa >= .35 - 1e-7);
  const aviso = M.tiempo; M.hasta(() => s.estado === 'golpe'); assert.ok(M.tiempo - aviso >= .4 - 1e-7);
  M.hasta(() => s.estado === 'recuperar'); const inicio = M.tiempo;
  M.hasta(() => s.estado === 'acechar'); assert.ok(M.tiempo - inicio >= 1.3 - 1e-7);
  assert.equal(M.eventos.filter(e => e.tipo === 'dañoJugador').length, 2);
});
probar('Oni anclado: la parada del primer golpe cancela el segundo', () => {
  const M = mundo(), s = M.crear('oniAnclado', 3); M.paso(); M.hasta(() => s.estado === 'golpe');
  M.S.desviar(s, 0, -1); assert.equal(s.segundo, false); assert.equal(s.estado, 'tambaleo');
  M.D.actualizar(.199); assert.equal(M.D.pedir('otro', 2, 1), false);
  M.D.actualizar(.001); assert.equal(M.D.pedir('otro', 2, 1), true);
});
probar('Devoradora: absorción de 0,90 s, una descarga parable y pecho abierto 1,40 s', () => {
  const M = mundo(), s = M.crear('devoradora', 2.6); M.paso();
  const inicio = M.tiempo; M.hasta(() => s.estado === 'golpe'); assert.ok(M.tiempo - inicio >= .9 - 1e-7);
  assert.equal(M.eventos.filter(e => e.tipo === 'dañoJugador').length, 1);
  M.hasta(() => s.estado === 'recuperar'); M.paso(); assert.ok(Math.abs(s.costillas[0].position.x) > .4);
});

for (const calidad of ['alta', 'media', 'baja']) {
  probar('Alada en ' + calidad + ': picado, altura real y aterrizaje accesible', () => {
    const M = mundo(.8, { calidad }), s = M.crear('alada', 3); cerca(s.y, 3.1);
    assert.ok(!M.S.enRango(0, 0, 0, 10, Math.PI).includes(s));
    assert.equal(M.S.golpear(s, 10, 0, -1), false);
    const antes = s.animo; M.S.pulso(s.x, s.z, 3, 10); cerca(s.animo, antes);
    M.paso(); M.hasta(() => s.estado === 'picado');
    M.hasta(() => s.estado === 'recuperar'); cerca(s.y, .25);
    assert.ok(M.S.enRango(0, 0, 0, 10, Math.PI).includes(s));
    const inicio = M.tiempo; M.hasta(() => s.estado === 'acechar'); assert.ok(M.tiempo - inicio >= 1.4 - .001);
    assert.ok(M.eventos.filter(e => e.tipo === 'dañoJugador').length <= 1);
  });
}
probar('Alada: no pica hacia Hikari fuera del límite vertical', () => {
  const M = mundo(), s = M.crear('alada', 3); M.c.J.y = 4;
  for (let i = 0; i < 300; i++) M.paso();
  assert.ok(!['aviso', 'picado'].includes(s.estado)); assert.equal(M.eventos.length, 0);
});
probar('Alada: espera de permiso limitada a cinco segundos; aterriza sin daño', () => {
  const M = mundo(), s = M.crear('alada', 3); M.D.pedir = () => false;
  for (let i = 0; i < 500; i++) M.paso();
  assert.equal(s.estado, 'recuperar'); cerca(s.y, .25); assert.equal(M.eventos.length, 0);
});
probar('Alada: contacto del picado siempre dentro de altoAtaque y una sola vez', () => {
  const M = mundo(), s = M.crear('alada', 3), daños = [];
  M.c.Bus.emit = (tipo, e) => { if (tipo === 'dañoJugador') daños.push({ y: s.y, e }); };
  M.paso(); M.hasta(() => s.estado === 'recuperar');
  assert.equal(daños.length, 1); assert.ok(Math.abs(daños[0].y - M.c.J.y) < 2.4);
});
probar('Alada: la parada del picado conserva el aturdimiento', () => {
  const M = mundo(), s = M.crear('alada', 3);
  M.c.Bus.emit = (tipo, e) => { if (tipo === 'dañoJugador') M.S.desviar(e.s, 0, -1); };
  M.paso(); M.hasta(() => s.estado === 'aturdido'); assert.equal(s.permiso, false);
});
probar('Alada: impactos verticales reales de 70 con el contrato propuesto para Claude', () => {
  const M = mundo(), s = M.crear('alada', 3);
  Object.assign(M.c, { Practica: { activa: false }, COMBATE: { peso: { empuje: [0, 2, 3, 4] } },
    Fauna: { enRango: () => [] }, Duelo: { golpear: () => false }, Jefes: { golpear: () => false } });
  let codigo = fs.readFileSync(new URL('../js/70-impacto.js', import.meta.url), 'utf8');
  // Adaptación solo en memoria: el archivo 70 queda intacto. Es el texto de «Para Claude».
  codigo = codigo.replace('Sombras.enRango(o.x, o.z, o.yaw, alc, ang)', 'Sombras.enRango(o.x, o.z, o.yaw, alc, ang, { y: o.y, vertical: vert })');
  codigo = codigo.replace('{ peso, empuje, romper: op.romperSombra', '{ ...op, vertical: vert, origenY: o.y, peso, empuje, romper: op.romperSombra');
  vm.runInContext(codigo, M.c); const I = vm.runInContext('Impacto', M.c);
  const antes = s.animo;
  assert.equal(I.proyectil(-2, .2, 0, 2, .2, 0, .3, 10, { elemento: 'brasa' }), null); cerca(s.animo, antes);
  assert.equal(I.proyectil(-2, 6, 0, 2, 6, 0, .3, 10, { elemento: 'brasa' }), null); cerca(s.animo, antes);
  assert.ok(I.proyectil(-2, 3.5, 0, 2, 3.5, 0, .3, 10, { elemento: 'brasa' })); cerca(antes - s.animo, 10 * 1.048 * .72);
});

probar('Zonas: capítulos 0–7 progresivos; Pradera solo rastreras; grupos estables', () => {
  for (let cap = 0; cap <= 7; cap++) for (let i = 0; i < 7; i++) {
    const M = mundo(), z = M.S.zonas[i];
    M.c.Sis.ST.capitulo = cap; M.c.Sis.tiene = () => true;
    M.c.J.x = z.x; M.c.J.z = z.z; M.paso();
    const tipos = M.S.lista.filter(s => s.zona === z).map(s => s.tipo), esperados = [...z.tipos];
    for (const v of z.variantes) if (cap >= v.cap) esperados[v.puesto] = v.tipo;
    assert.deepEqual(Array.from(tipos), esperados); if (i < 2) assert.ok(tipos.every(t => t === 'rastrera'));
    assert.equal(tipos.length, z.tipos.length);
  }
});
probar('Guardias: Pétalo y Duna conservan oni; Marea y Kiri habilitan anclado', () => {
  for (const cap of [1, 2, 3, 5, 6, 7]) for (let i = 0; i < 4; i++) {
    const M = mundo(), g = M.S.guardias[i];
    M.c.Sis.ST.capitulo = cap; M.c.Sis.ST.sombrasRotas = 3; M.c.Sis.tiene = () => true;
    M.c.J.x = g.x; M.c.J.z = g.z; M.paso();
    assert.equal(g.s.tipo, g.tipo && cap >= g.cap ? 'oniAnclado' : 'oni');
    assert.equal(M.S.custodia(g.id), true); M.S.romper(g.s);
    assert.equal(M.c.Sis.ST.onis[g.id], 1); assert.equal(M.S.custodia(g.id), false);
  }
});
probar('Cielo rojo: conserva una rastrera extra sin adelantar variantes', () => {
  const M = mundo(), z = M.S.zonas[5];
  M.c.Sis.ST.capitulo = 2; M.c.Sis.ST.cieloRojo = true; M.c.Sis.tiene = () => true;
  M.c.J.x = z.x; M.c.J.z = z.z; M.paso();
  assert.equal(M.S.lista.filter(s => s.zona === z).length, z.tipos.length + 1);
  assert.ok(!M.S.lista.some(s => s.tipo === 'alada' || s.tipo === 'escoria'));
});

for (const dt of [1 / 120, 1 / 60, 1 / 30, .05]) {
  probar('Alada: ciclo y contacto único con paso de ' + dt.toFixed(4) + ' s', () => {
    const M = mundo(), s = M.crear('alada', 3); let n = 0;
    while (s.estado !== 'recuperar' && n++ < 1000) M.paso(dt);
    assert.equal(s.estado, 'recuperar'); cerca(s.y, .25);
    assert.equal(M.eventos.filter(e => e.tipo === 'dañoJugador').length, 1);
    const inicio = M.tiempo;
    while (s.estado === 'recuperar') M.paso(dt);
    assert.ok(M.tiempo - inicio >= 1.4 - 1e-7);
  });
}
probar('Progresión real: escala las seis fichas sin alterar sus defensas ni secuencias', () => {
  const M = mundo();
  M.c.dificultad = () => ({ vida: 1, equilibrio: 1 }); M.c.biomaDe = () => 0;
  vm.runInContext(fs.readFileSync(new URL('../js/57-progresion-enemiga.js', import.meta.url), 'utf8'), M.c);
  const P = vm.runInContext('ProgresionEnemiga', M.c), perfil = P.capturar('kiri', { nivel: 10, inv: { odachi: 1 }, mejoras: { vida: 3, capa: 3, manto: 3 } });
  for (const [tipo, elemento, recibe, distancia] of fichas) {
    const base = vm.runInContext('SOMBRAS.' + tipo, M.c), s = M.crear(tipo, distancia, { perfil });
    assert.equal(s.E.animo, Math.round(base.animo * perfil.vida)); cerca(s.E.vel, base.vel);
    cerca(s.E.defensa.recibe, recibe); assert.equal(s.E.defensa.elemento, elemento);
    assert.equal(s.E.coste, base.coste);
    if (tipo === 'oniAnclado') { cerca(s.E.equilibrio.max, base.equilibrio.max * perfil.equilibrio); cerca(s.E.secuencia.aviso, .4); }
  }
});

console.log('\nVariantes: ' + (pruebas - fallos) + '/' + pruebas + ' pruebas correctas.');
process.exitCode = process.exitCode || (fallos ? 1 : 0);
