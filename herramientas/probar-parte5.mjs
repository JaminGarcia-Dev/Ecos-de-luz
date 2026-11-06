// Encuentro real, integridad de guardados y perfil fijo; Edge con GPU y tiempo simulado.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-parte5/combate')), archivo = arg('archivo', 'index.html'), calidad = arg('calidad', 'alta');
fs.mkdirSync(salida, { recursive: true });
const srv = http.createServer((q, r) => { const f = path.resolve(raiz, '.' + decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(raiz + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html'); fs.createReadStream(f).pipe(r); }).listen(0);
await new Promise(r => srv.once('listening', r));
const nav = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const ctx = await nav.newContext({ viewport: { width: 1920, height: 1080 } });
await ctx.addInitScript(calidad => { localStorage.setItem('ecos2_ajustes', JSON.stringify({ calidad, maestro: 0 })); }, calidad);
const p = await ctx.newPage(), errores = [], pruebas = []; let rendimiento = null;
const DUELO_DANO = 14;
p.on('pageerror', e => errores.push(e.message)); p.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
await p.route('**/favicon.ico', r => r.fulfill({ status: 204 }));
const comprobar = (nombre, pasa, evidencia) => { pruebas.push({ nombre, pasa: !!pasa, evidencia }); if (!pasa) throw Error(nombre + ': ' + JSON.stringify(evidencia)); };
const sim = (n, dt = 1 / 60) => p.evaluate(([n, dt]) => __ecos.sim(n, dt), [n, dt]);
const foto = async nombre => { await p.evaluate(() => render()); await p.screenshot({ path: path.join(salida, nombre + '.png') }); };
try {
  await p.goto(`http://localhost:${srv.address().port}/${archivo}`, { timeout: 180000 }); await p.waitForFunction(() => window.__ecos && G.estado === 'portada', null, { timeout: 180000 });
  await p.evaluate(() => { __ecos.manual(true); window.__saveLuna = JSON.stringify({ campana: 'luna', inicio: { version: 1 }, marca: 'conservar luna' }); window.__saveAnt = JSON.stringify({ marca: 'conservar anterior', nivel: 8 }); localStorage.setItem('ecos3_luna_partida', __saveLuna); localStorage.setItem('ecos2_partida', __saveAnt); });
  await p.locator('#btnPractica').click(); await p.waitForFunction(() => Practica.activa && G.estado === 'juego'); await sim(2);
  comprobar('Práctica accesible desde portada sin prólogo', await p.evaluate(() => Practica.activa && !Cin.activa && J.y === PRACTICA.centro.y));
  comprobar('Entrar no borra las dos campañas', await p.evaluate(() => localStorage.getItem('ecos3_luna_partida') === __saveLuna && localStorage.getItem('ecos2_partida') === __saveAnt));
  await foto('01-practica');
  const niveles = [];
  for (const nivel of [1, 5, 10]) {
    const d = await p.evaluate(nivel => { Practica.elegir(nivel); Practica.reiniciar(); __ecos.sim(2, 1 / 60); return { jugador: { nivel: Sis.ST.nivel, hp: Sis.hpMax(), daño: Sis.arma().dmg * Sis.dmgMult() }, enemigo: Duelo.depurar(), perfil: Practica.depurar().perfil }; }, nivel);
    niveles.push(d);
    comprobar('Perfil de nivel ' + nivel + ' aplicado al reiniciar', d.jugador.nivel === nivel && d.enemigo.golpesMax === (nivel === 1 ? 1 : nivel === 5 ? 2 : 3), d);
  }
  comprobar('Mejorar a Hikari también fortalece al rival', niveles[2].jugador.daño > niveles[0].jugador.daño && niveles[2].enemigo.vidaMax > niveles[0].enemigo.vidaMax && niveles[2].perfil.daño > niveles[0].perfil.daño, niveles);
  const fijos = await p.evaluate(() => { const antes = Duelo.depurar(); Sis.ST.nivel = 1; Practica.elegir(1); const despues = Duelo.depurar(); return { antes, despues, siguiente: Practica.depurar().siguiente }; });
  comprobar('Ni nivel ni selección cambian un enemigo ya presente', fijos.antes.vidaMax === fijos.despues.vidaMax && fijos.antes.perfil.potencia === fijos.despues.perfil.potencia && fijos.siguiente === 1, fijos);
  const regiones = await p.evaluate(() => { const s = { nivel: 10, inv: { katana: 1, odachi: 1 }, eq: { arma: 'katana' }, mejoras: { vida: 3, capa: 3, manto: 3 } }; const alta = ProgresionEnemiga.capturar('faro', s), inicial = ProgresionEnemiga.capturar('pradera', s); ProgresionEnemiga.registrar(s); delete s.inv.odachi; const cambio = ProgresionEnemiga.capturar('faro', s); return { alta, inicial, cambio }; });
  comprobar('La región inicial mantiene un límite inferior', regiones.inicial.potencia <= .2 && regiones.alta.potencia > .9 && regiones.inicial.vida < regiones.alta.vida, regiones);
  comprobar('Quitar el equipo avanzado no abarata la captura', regiones.cambio.potencia === regiones.alta.potencia, regiones);
  comprobar('Crecimiento acotado y sin subir velocidad o recortar avisos', regiones.alta.vida <= 1.25 && regiones.alta.daño <= 1.15 && regiones.alta.equilibrio <= 1.2 && sinEscalaDeTiempos(regiones.alta), regiones.alta);
  // Un ataque se sigue desde el aviso real: colocar la cápsula en el arco sin invulnerabilidad.
  const impacto = await p.evaluate(() => {
    Practica.reiniciar(); const poner = () => { const d = Duelo.depurar(); J.x = Duelo.x + Math.sin(d.yaw) * 2.5; J.z = Duelo.z + Math.cos(d.yaw) * 2.5; J.y = PRACTICA.centro.y; J.vx = J.vz = 0; J.inv = 0; };
    let n = 0; while (Duelo.fase !== 'aviso' && n++ < 500) __ecos.sim(1, 1 / 60);
    while (Duelo.fase !== 'corte' && n++ < 700) { poner(); __ecos.sim(1, 1 / 60); }
    const inicio = { hp: Sis.ST.hp, t: Duelo.depurar().t }; let min = Sis.ST.hp;
    for (let i = 0; i < 8; i++) { poner(); __ecos.sim(1, 1 / 60); min = Math.min(min, Sis.ST.hp); }
    const antes = { hp: Sis.ST.hp, t: Duelo.depurar().t };
    while (Duelo.fase === 'corte' && n++ < 800) { poner(); __ecos.sim(1, 1 / 60); }
    return { inicio, antes, min, despues: Sis.ST.hp, estado: Duelo.depurar() };
  });
  comprobar('El daño espera al gesto activo, no llega al comenzar el corte', impacto.inicio.hp === impacto.antes.hp && impacto.antes.t > 0 && impacto.despues < impacto.antes.hp, impacto);
  await foto('02-corte-y-recuperacion');
  const parada = await p.evaluate(() => {
    Practica.reiniciar(); let n = 0;
    const poner = () => { const d = Duelo.depurar(); J.x = Duelo.x + Math.sin(d.yaw) * 2.5; J.z = Duelo.z + Math.cos(d.yaw) * 2.5; J.yaw = d.yaw + Math.PI; J.vx = J.vz = 0; J.inv = 0; };
    while (Duelo.fase !== 'aviso' && n++ < 500) __ecos.sim(1, 1 / 60);
    while (!(Duelo.fase === 'corte' && Duelo.depurar().t >= .08) && n++ < 750) { poner(); __ecos.sim(1, 1 / 60); }
    const hp = Sis.ST.hp; KEY.KeyR = KEYP.KeyR = true;
    for (let i = 0; i < 12; i++) { poner(); __ecos.sim(1, 1 / 60); }
    KEY.KeyR = false; return { hp, despues: Sis.ST.hp, paradas: Practica.depurar().paradas, eq: Duelo.eq, max: Duelo.depurar().eqMax, contra: J.contra };
  });
  comprobar('La parada a tiempo protege y abre contraataque', parada.hp === parada.despues && parada.paradas === 1 && parada.eq < parada.max && parada.contra > 0, parada);
  const defensa = await p.evaluate(() => {
    const ejecutar = rodar => {
      Practica.reiniciar(); let n = 0;
      const poner = () => { const d = Duelo.depurar(); J.x = Duelo.x + Math.sin(d.yaw) * 2.5; J.z = Duelo.z + Math.cos(d.yaw) * 2.5; J.yaw = d.yaw + Math.PI; J.inv = 0; J.vx = J.vz = 0; };
      while (Duelo.fase !== 'aviso' && n++ < 500) __ecos.sim(1, 1 / 60);
      if (!rodar) { KEY.KeyR = KEYP.KeyR = true; }
      while (!(Duelo.fase === 'corte' && Duelo.depurar().t >= .1) && n++ < 750) { poner(); __ecos.sim(1, 1 / 60); }
      const hp = Sis.ST.hp;
      if (rodar) KEYP.KeyV = true;
      for (let i = 0; i < 14; i++) __ecos.sim(1, 1 / 60);
      KEY.KeyR = false;
      return { hp, despues: Sis.ST.hp, paradas: Practica.depurar().paradas, rodando: J.rodando };
    }; return { guardia: ejecutar(false), esquiva: ejecutar(true) };
  });
  comprobar('Mantener guardia reduce daño sin regalar una parada', defensa.guardia.despues < defensa.guardia.hp && defensa.guardia.hp - defensa.guardia.despues < DUELO_DANO && defensa.guardia.paradas === 0, defensa.guardia);
  comprobar('La esquiva realizada antes del impacto evita el golpe', defensa.esquiva.hp === defensa.esquiva.despues && defensa.esquiva.rodando > 0, defensa.esquiva);
  const ataque = await p.evaluate(() => {
    Practica.reiniciar(); let n = 0;
    while (Duelo.fase !== 'recupera' && n++ < 800) { J.inv = 5; __ecos.sim(1, 1 / 60); }
    J.x = Duelo.x; J.z = Duelo.z - 1.2; J.yaw = J.camYaw = 0; J.vx = J.vz = 0;
    const hp = Duelo.vida; KEY.Mouse0 = false; KEYP.Mouse0 = true; __ecos.sim(25, 1 / 60);
    return { antes: hp, despues: Duelo.vida, posicion: [J.x, J.y, J.z] };
  });
  comprobar('Un ataque real de Hikari daña durante la recuperación', ataque.despues < ataque.antes && ataque.posicion.every(Number.isFinite), ataque);
  const arma = await p.evaluate(() => {
    Practica.elegir(10); Practica.reiniciar(); __ecos.sim(110, 1 / 60); KEYP.KeyZ = true; __ecos.sim(1, 1 / 60); Combate._probar('cargado');
    const inicial = { avance: J.atq.avance, dur: J.atq.dur, fijado: Combate.fijado }; let max = 0;
    for (let i = 0; i < 60; i++) { J.inv = 5; __ecos.sim(1, 1 / 60); max = Math.max(max, J.vel); }
    return { inicial, max, finito: [J.x, J.z, J.vx, J.vz].every(Number.isFinite) };
  });
  comprobar('Fijar a Tasogare produce un avance finito y limitado', arma.inicial.fijado && Number.isFinite(arma.inicial.avance) && arma.inicial.avance <= 1.8 && arma.max <= 4.81 && arma.finito, arma);
  const apoyo = await p.evaluate(() => {
    Practica.reiniciar(); Duelo.detener(); let pasos = 0; Bus.on('hikari:paso', () => pasos++); KEY.KeyW = KEY.ShiftLeft = true; __ecos.sim(120, 1 / 60); KEY.KeyW = KEY.ShiftLeft = false;
    const moviendo = pasos; __ecos.sim(120, 1 / 60); const quieto = pasos; __ecos.sim(120, 1 / 60);
    return { moviendo, quieto, final: pasos, velocidad: J.vel };
  });
  comprobar('Los apoyos producen pasos y el reposo deja de producirlos', apoyo.moviendo > 3 && apoyo.final === apoyo.quieto && apoyo.velocidad < .01, apoyo);
  await p.evaluate(() => { Practica.reiniciar(); }); await sim(150); await foto('03-nivel-diez');
  const huesos = await p.evaluate(() => { let max = 0, previo = Tasogare.modelo.huesos.map(b => b.quaternion.clone()), mal = false;
    for (let i = 0; i < 600; i++) { J.inv = 5; __ecos.sim(1, 1 / 60); Tasogare.modelo.huesos.forEach((b, k) => { max = Math.max(max, previo[k].angleTo(b.quaternion)); mal ||= ![b.position.x, b.position.y, b.position.z, b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w].every(Number.isFinite); previo[k].copy(b.quaternion); }); }
    return { max, mal }; });
  comprobar('Las poses de Tasogare permanecen finitas y sin saltos grandes', !huesos.mal && huesos.max < 1, huesos);
  const anclaje = await p.evaluate(() => {
    Tasogare.pose('alzar', 0, true); Tasogare.actualizar(1 / 60); const m = Tasogare.modelo.malla, mano = Tasogare.hueso('manoD');
    m.skeleton.update(); const pos = m.geometry.attributes.position, indices = m.geometry.attributes.skinIndex, pesos = m.geometry.attributes.skinWeight;
    const id = m.skeleton.bones.indexOf(mano), centro = new THREE.Vector3(), v = new THREE.Vector3(); let n = 0;
    for (let i = 0; i < pos.count; i++) if (indices.getX(i) === id && pesos.getX(i) > .9) { v.fromBufferAttribute(pos, i); m.boneTransform(i, v); m.localToWorld(v); centro.add(v); n++; }
    centro.divideScalar(Math.max(n, 1)); const base = mano.getWorldPosition(new THREE.Vector3());
    return { vertices: n, distancia: centro.distanceTo(base), arma: Tasogare.modelo.arma.parent === mano, materiales: m.material !== Tasogare.modelo.arma.material && m.material.skinning && !Tasogare.modelo.arma.material.skinning };
  });
  comprobar('La espada y los vértices de la mano siguen el mismo hueso', anclaje.vertices > 0 && anclaje.distancia < .2 && anclaje.arma && anclaje.materiales, anclaje);
  await p.evaluate(() => { UI.abrir('ajustes'); }); await foto('04-niveles-y-reinicio');
  await p.locator('[data-act="practicaNivel"][data-v="5"]').click(); await p.locator('[data-act="practicaReiniciar"]').click(); await sim(2);
  comprobar('Controles del menú aplican el nivel solo al reiniciar', await p.evaluate(() => !UI.pausado && Practica.depurar().nivel === 5 && Sis.ST.nivel === 5));
  const victoria = await p.evaluate(() => { Duelo.golpear({ x: Duelo.x, y: PRACTICA.centro.y, z: Duelo.z, yaw: 0 }, 10, Math.PI, 9999, { peso: 3 }); return { resultado: Practica.depurar().resultado, pausa: UI.pausado, activo: Duelo.activo, historia: Sis.ST.mis }; });
  comprobar('Ganar abre reinicio y no avanza una misión del argumento', victoria.resultado === 'Encuentro superado' && victoria.pausa && !victoria.activo && !Object.keys(victoria.historia).length, victoria);
  const derrota = await p.evaluate(() => { Practica.reiniciar(); J.inv = 0; Combate.recibir({ dmg: 9999 }); return { resultado: Practica.depurar().resultado, pausa: UI.pausado, vivo: J.vivo }; });
  comprobar('Perder ofrece reintento sin reaparición de campaña', derrota.resultado === 'Inténtalo de nuevo' && derrota.pausa && derrota.vivo, derrota);
  const limites = await p.evaluate(() => { Practica.reiniciar(); J.x = 100; J.y = 220; __ecos.sim(1, 1 / 60); return { x: J.x, y: J.y, z: J.z, activo: Practica.activa }; });
  comprobar('Salir del círculo devuelve a la práctica sin caer al valle', limites.activo && limites.y === 240 && Math.hypot(limites.x - 60, limites.z - 60) < 15, limites);
  const sombra = await p.evaluate(() => {
    Sis.ST.nivel = 1; Sis.ST.inv = {}; Sis.ST.mejoras = {}; Sis.ST.historialPoder = {}; Sis.ST.eq.arma = null;
    const s = Sombras.crear('rastrera', 100, 100, null, { y: 240 }), datos = { animo: s.E.animo, daño: s.E.daño, perfil: s.perfil };
    Sis.ST.nivel = 10; Sis.ST.inv.odachi = 1; Sis.ST.mejoras = { vida: 3, capa: 3, manto: 3 };
    return { antes: datos, despues: { animo: s.E.animo, daño: s.E.daño, perfil: s.perfil }, nuevo: ProgresionEnemiga.capturar(s.perfil.region), velocidad: s.E.vel === SOMBRAS.rastrera.vel };
  });
  comprobar('Una Sombra conserva sus atributos tras mejorar Hikari', sombra.antes.animo === sombra.despues.animo && sombra.antes.daño === sombra.despues.daño && sombra.nuevo.potencia > sombra.antes.perfil.potencia && sombra.velocidad, sombra);
  const mando = await p.evaluate(() => {
    Practica.reiniciar(); UI.abrir('ajustes');
    const pad = { connected: true, id: 'Xbox de prueba', axes: [0, 0, 0, 0], buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })) };
    navigator.getGamepads = () => [pad]; pad.buttons[1].pressed = true; __ecos.sim(1, 1 / 60); pad.buttons[1].pressed = false; __ecos.sim(1, 1 / 60);
    return { cerrado: !UI.pausado, texto: UI.teclas('Fijar: {fijar} · esquiva: {esquivar}') };
  });
  comprobar('El mando reanuda la práctica y muestra sus controles', mando.cerrado && mando.texto.includes('R3') && mando.texto.includes('B'), mando);
  await p.evaluate(() => { Practica.reiniciar(); __ecos.sim(2000, 1 / 60); Sis.guardar(); });
  comprobar('El autoguardado y el guardado manual ignoran la práctica', await p.evaluate(() => localStorage.getItem('ecos3_luna_partida') === __saveLuna && localStorage.getItem('ecos2_partida') === __saveAnt));
  if (process.argv.includes('--rendimiento')) {
    await p.evaluate(() => { Practica.reiniciar(); J.inv = 99; __ecos.manual(false); }); await p.waitForTimeout(2500);
    rendimiento = await p.evaluate(() => new Promise(res => { let n = 0, peor = 0, anterior = performance.now(), inicio = anterior; const f = t => { peor = Math.max(peor, t - anterior); anterior = t; n++; if (t - inicio < 3000) requestAnimationFrame(f); else { __ecos.manual(true); res({ fps: n * 1000 / (t - inicio), peorMs: peor, ancho: innerWidth, alto: innerHeight, calidad: AJUSTES.calidad }); } }; requestAnimationFrame(f); }));
  }
  const semillas = await p.evaluate(() => ({ luna: __saveLuna, anterior: __saveAnt })); await p.evaluate(() => UI.abrir('ajustes')); await p.locator('#btnSalir').click();
  await p.waitForFunction(() => window.__ecos && G.estado === 'portada', null, { timeout: 120000 });
  // al arrancar, la migración de las secundarias (07-sistemas.js) normaliza y vuelve a guardar la partida de la campaña: se comprueba que sigue siendo la suya (su marca) y que la anterior no se toca
  comprobar('Salir vuelve a portada conservando ambas partidas', await p.evaluate(s => { const B = JSON.parse(localStorage.getItem('ecos3_luna_partida') || '{}'); return B.marca === 'conservar luna' && B.campana === 'luna' && localStorage.getItem('ecos2_partida') === s.anterior && !Practica.activa; }, semillas));
  await p.evaluate(() => { __ecos.manual(true); __ecos.empezarRapido(true); __ecos.tele(0, 15); });
  const golem = await p.evaluate(() => {
    Duelo.detener(); Sis.ST.nivel = 10; Sis.ST.inv.odachi = 1; const b = Jefes.lista.musgoso; Jefes.despertar(b);
    const antes = { vida: b.oscMax, eq: b.eqMax, daño: b.dmgF(), perfil: b.perfil };
    Sis.ST.nivel = 1; Sis.ST.inv = {}; return { antes, despues: { vida: b.oscMax, eq: b.eqMax, daño: b.dmgF() }, base: { vida: b.D.osc, eq: b.D.equilibrio } };
  });
  comprobar('El gólem captura vida y equilibrio sin recalcularlos durante la pelea', golem.antes.vida > golem.base.vida && golem.antes.eq > golem.base.eq && golem.antes.vida === golem.despues.vida && golem.antes.eq === golem.despues.eq && golem.antes.daño === golem.despues.daño, golem);
  const audio = await p.evaluate(() => { Practica.comenzar(); UI.cerrar(); __ecos.sim(5, 1 / 60); return { musica: MusicaInicio.depurar(), tema: PaisajeSonoro.depurar().tema }; });
  comprobar('La práctica conserva su audio contenido', audio.musica.activo && !audio.musica.original && audio.tema === '', audio);
} catch (e) { errores.push(e.stack); try { await foto('error'); } catch {} }
fs.writeFileSync(path.join(salida, 'resultado.json'), JSON.stringify({ archivo, calidad, pruebas, rendimiento, errores }, null, 2));
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(p => p.pasa).length, pruebas: pruebas.length, rendimiento, errores }, null, 2));
if (errores.length || pruebas.some(p => !p.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
function sinEscalaDeTiempos(perfil) { return !('velocidad' in perfil) && !('aviso' in perfil); }
