// Capítulo 7 y epílogo: plan, evacuación, corona, encarnación, combate final en tres etapas, canalización, liberación de la Dorada, Yoake y créditos.
import vm from 'node:vm';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Verifica lógica y guardados con Node, sin arrancar Edge ni necesitar Playwright.
if (process.argv.includes('--sin-navegador')) { probarSinNavegador(); process.exit(process.exitCode || 0); }
const { chromium } = await import('playwright-core');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-capitulo7'));
fs.mkdirSync(salida, { recursive: true });
const srv = http.createServer((q, r) => { const f = path.resolve(raiz, '.' + decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(raiz + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html'); fs.createReadStream(f).pipe(r); }).listen(0);
await new Promise(r => srv.once('listening', r));
const nav = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const p = await nav.newPage({ viewport: { width: 1600, height: 900 } }), errores = [], pruebas = [];
await p.addInitScript(() => localStorage.setItem('ecos2_ajustes', JSON.stringify({ calidad: 'alta', maestro: 0 })));
await p.route('**/favicon.ico', r => r.fulfill({ status: 204 })); p.on('pageerror', e => errores.push(e.message)); p.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
const url = `http://localhost:${srv.address().port}/${archivo}`;
const comprobar = (nombre, pasa, evidencia) => { pruebas.push({ nombre, pasa: !!pasa, evidencia }); if (!pasa) throw Error(nombre + ': ' + JSON.stringify(evidencia)); };
const cargar = async () => { await p.goto(url, { timeout: 180000 }); await p.waitForFunction(() => window.__ecos && G.estado === 'portada', null, { timeout: 120000 }); await p.evaluate(() => __ecos.manual(true)); };
const sim = n => p.evaluate(n => __ecos.sim(n, 1 / 60), n);
const foto = async nombre => { await p.evaluate(() => render()); await p.waitForTimeout(500); await p.screenshot({ path: path.join(salida, nombre + '.png') }); };
const paso = () => p.evaluate(() => { const m = Sis.ST.mis.c7_luna; return m ? (m.e === 'hecha' ? 99 : m.p) : -1; });
const ofrece = () => p.evaluate(() => { const o = mejorInteract(J); return o && o.txt; });
const usar = () => p.evaluate(() => { const o = mejorInteract(J); if (o) o.fn(); return o && o.txt; });
const cerrarDialogo = async () => { await sim(2); await p.evaluate(() => { if (UI.dlg) UI.saltarDialogo(); }); await sim(2); };
const ir = async (x, z) => { await p.evaluate(([x, z]) => { __ecos.tele(x, z); J.vx = J.vz = 0; }, [x, z]); await sim(20); };
const junto = async (fn, a) => { const [x, z] = await p.evaluate(fn, a); await ir(x, z); };
const enPunto = async (fn, dy, a) => { const [x, y, z] = await p.evaluate(fn, a); await p.evaluate(([x, y, z, dy]) => { __ecos.tele(x, z); if (y !== undefined && y !== null) { J.y = sueloEnJ(x, y + (dy || 1.5), z); G.sy = J.y + 1.4; } J.vx = J.vz = J.vy = 0; }, [x, y, z, dy]); await sim(20); };
const hastaCin = async (tipo, max) => { for (let i = 0; i < (max || 60); i++) { if (await p.evaluate(t => Cin.activa && Cin.tipo === t, tipo)) return true; await sim(30); } return false; };
const hastaFinCin = async () => { for (let i = 0; i < 200; i++) { if (!(await p.evaluate(() => Cin.activa))) return true; await sim(60); } return false; };
const pasoEp = () => p.evaluate(() => { const m = Sis.ST.mis.ep7_amanecer; return m ? (m.e === 'hecha' ? 99 : m.p) : -1; });
try {
  await cargar();
  await p.evaluate(() => {
    __ecos.empezarRapido(true); const s = Sis.ST.inicio;
    Object.assign(s, { prologo: true, nombre: true, hinode: true, momo: true, tsuru: true, hoja: true, rumbo: true, fin: true, registroPetalo: true, postigo: true });
    const h = (p) => ({ e: 'hecha', p, c: 0 });
    Sis.ST.mis = { inicio_luna: h(6), registro_petalo: h(1), c1_petalo: h(10), c2_marea: h(12), c3_duna: h(9), c4_velo: h(11), c5_tasogare: h(11), c6_kiri: h(11) };
    Sis.ST.capitulo = 7; Sis.ST.frag = [true, true, true, true]; Object.assign(Sis.ST.retos, { petalo: true, marea: true, duna: true, escarcha: true }); Sis.dar('katana', 1, true); Sis.ST.eq.arma = 'katana';
    Sis.ST.cieloRojo = true; Sis.perder('tsuru', 'momo'); Sis.dar('farol', 1, true);
    Sis.ST.onis = { petalo: 1, marea: 1, duna: 1, escarcha: 1 }; Sis.ST.inicio.cap = { emisor: true, agua: true, senal: true, momoCapturada: true, momoRescatada: true, lumiInforma: true }; Sis.ST.seg = null; Sis.guardar();
  });
  await cargar(); await p.locator('#btnContinuar').click(); await p.waitForFunction(() => G.estado === 'juego', null, { timeout: 30000 }); await sim(60);
  comprobar('El capítulo 7 revela su misión', await p.evaluate(() => Sis.ST.mis.c7_luna && Sis.ST.mis.c7_luna.e === 'activa'));
  comprobar('Momo está a salvo en Yoake con Sayo y Aiko, sin un punto fantasma en Hinode', await p.evaluate(() => {
    const m = Sis.npcs.momo, v = EscenarioCapitulos.vecinos, q = m.g.position;
    return m.ocupado && m.g.visible && islaEn(q.x, q.z) && PatioInicio.puntos.momo === q
      && q.distanceTo(v.sayo.g.position) < 5 && q.distanceTo(v.aiko.g.position) < 5;
  }));
  await ir(0, 45); await sim(20);
  comprobar('Al pie del faro se acuerda el plan', await p.evaluate(() => UI.dlg && UI.dlg.lineas[0].id === 'C7A01')); await cerrarDialogo(); await sim(5);
  comprobar('El plan lanza la evacuación', await paso() === 1 && await p.evaluate(() => Asedio.activo), await paso());
  await ir(0, 18);
  for (let i = 0; i < 40 && await p.evaluate(() => Asedio.activo); i++) { await p.evaluate(() => { for (const s of Sombras.lista.slice()) Sombras.quitar(s); }); await sim(240); }
  comprobar('Despejar la plaza termina la evacuación', await paso() === 2, await paso());
  await junto(() => { const k = Sis.npcs.kaito.g.position; return [k.x + 1.2, k.z + 1.2]; }); await sim(5);
  comprobar('Kaito confirma la evacuación', /Confirmar con Kaito/.test(await ofrece()), await ofrece()); await usar(); await cerrarDialogo();
  comprobar('Los niños a salvo llevan a la corona', await paso() === 3, await paso());
  await enPunto(() => { const a = EscenarioCapitulos.puntos.aro; return [a.x + .3, a.y, a.z + .3]; }, .5); await sim(10); await cerrarDialogo();
  await enPunto(() => { const c = EscenarioCapitulos.puntos.cierre; return [c.x + .5, c.y, c.z + .5]; }, .5);
  comprobar('En la corona se invierte el conducto', /Invertir el conducto/.test(await ofrece()), await ofrece());
  await usar(); comprobar('La Luna Roja toma cuerpo', await hastaCin('encarnacion', 10));
  await sim(60 * 7); await foto('01-encarnacion'); await hastaFinCin(); await sim(20);
  comprobar('Empieza el combate final', await paso() === 4 && await p.evaluate(() => DueloLuna.activo && DueloLuna.etapa === 1), await paso());
  await sim(90); await foto('02-anclajes');
  // etapa 1: cortar los cuatro anclajes a golpes
  for (let k = 0; k < 200 && await p.evaluate(() => DueloLuna.etapa === 1 && DueloLuna.activo); k++) {
    await p.evaluate(() => { const C = EscenasCapitulos.centroLuna(), A = LunaRoja.anclajes(); for (const a of A) { const dx = C.x - a.x, dz = C.z - a.z, d = Math.hypot(dx, dz) || 1, x = a.x + dx / d * 1.2, z = a.z + dz / d * 1.2; __ecos.tele(x, z); J.vx = J.vz = 0; DueloLuna.golpear({ x, y: C.y, z, yaw: Math.atan2(a.x - x, a.z - z) }, 3, Math.PI, 40, { peso: 1 }); __ecos.sim(18, 1 / 60); } });
  }
  comprobar('Cortar los cuatro anclajes deja el cuerpo al alcance', await p.evaluate(() => DueloLuna.etapa >= 2), await p.evaluate(() => ({ e: DueloLuna.etapa, st: Sis.ST.dueloLuna })));
  await foto('03-cuerpo');
  for (let k = 0; k < 400 && await p.evaluate(() => DueloLuna.activo && !(Sis.ST.dueloLuna && Sis.ST.dueloLuna.vencida)); k++) {
    await p.evaluate(() => { const C = EscenasCapitulos.centroLuna(), x = C.x, z = C.z + 2.4; __ecos.tele(x, z); J.vx = J.vz = 0; DueloLuna.golpear({ x, y: C.y, z, yaw: Math.PI }, 3.5, Math.PI, 60, { peso: 2 }); __ecos.sim(20, 1 / 60); });
  }
  comprobar('Romper la máscara y vencerla', await p.evaluate(() => Sis.ST.dueloLuna && Sis.ST.dueloLuna.vencida) && await paso() >= 5, await p.evaluate(() => ({ e: DueloLuna.etapa, st: Sis.ST.dueloLuna, p: Sis.ST.mis.c7_luna })));
  await foto('04-mascara');
  await p.evaluate(() => { const C = EscenasCapitulos.centroLuna(); __ecos.tele(C.x, C.z + 2.2); J.vx = J.vz = 0; }); await sim(30); await cerrarDialogo();
  comprobar('Tras vencer se puede canalizar la luz cautiva', /Canalizar/.test(await ofrece()), await ofrece());
  await p.evaluate(() => __ecos.tecla('KeyE', true)); await sim(60 * 3.6); await p.evaluate(() => __ecos.tecla('KeyE', false)); await sim(10);
  comprobar('Canalizar libera la reserva y llega la liberación', await hastaCin('liberacion', 20), await p.evaluate(() => ({ p: Sis.ST.mis.c7_luna, st: Sis.ST.dueloLuna })));
  comprobar('Tres planos de liberación en 45 s y sistema del duelo detenido', await p.evaluate(() => Cin.estadoPlano().total === 45 && !DueloLuna.activo));
  await sim(60 * 31.5); await foto('05-dorada'); await hastaFinCin(); await sim(10);
  comprobar('La Dorada es libre, Lumi es una luciérnaga y el cielo deja de ser rojo', await p.evaluate(() => Sis.ST.inicio.cap.doradaLibre && Sis.ST.inicio.cap.lumiLuciernaga && !Sis.ST.cieloRojo && Math.abs(Lumi.grupo.scale.x - .35) < 1e-8 && !LunaRoja.root.visible));
  comprobar('La Dorada no promete devolver a los muertos', await p.evaluate(() => UI.dlg && UI.dlg.lineas.some(l => l.id === 'C7F07'))); await cerrarDialogo(); await sim(10);
  comprobar('Termina el combate y empieza el epílogo', await paso() === 99 && await pasoEp() === 0, await pasoEp());
  // Epílogo: tareas reales y un orden distinto al del diario.
  const puntoEp = id => enPunto(id => { const q = IslaYoake.puntos[id]; return [q.x, q.y, q.z]; }, undefined, id);
  const tareaEp = async (id, texto) => {
    await puntoEp(id); comprobar('Interacción de ' + id, texto.test(await ofrece()) && /\{interactuar\}/.test(await ofrece()), await ofrece());
    await usar(); await cerrarDialogo(); await sim(5);
  };
  await tareaEp('epPropuesta', /Colocar la propuesta/);
  comprobar('La propuesta se publica fuera de orden y aún faltan los archivos', await pasoEp() === 0 && await p.evaluate(() => Sis.ST.inicio.cap.ep7.propuesta && scene.getObjectByName('Epílogo · propuesta pública').visible));
  await tareaEp('epArchivos', /Abrir los archivos/);
  comprobar('Abrir los archivos reconcilia también la propuesta', await pasoEp() === 2 && await p.evaluate(() => scene.getObjectByName('Epílogo · archivos abiertos').visible), await pasoEp());
  await puntoEp('epViaje'); await sim(5);
  comprobar('Kaito ofrece el viaje a Yoake', /Viajar con Kaito/.test(await ofrece()), await ofrece()); await usar(); await cerrarDialogo();
  comprobar('La travesía del epílogo cruza sin rojo', await hastaCin('travesia', 10));
  comprobar('La barca lleva dos pasajeros y Momo permanece en Yoake', await p.evaluate(() => IslaYoake.barca.grupo.children.length === 3 && islaEn(Sis.npcs.momo.g.position.x, Sis.npcs.momo.g.position.z)));
  await sim(60 * 6); await foto('06-travesia-libre'); await hastaFinCin(); await sim(20);
  comprobar('Llegada a Yoake', await pasoEp() === 3 && await p.evaluate(() => !!islaEn(J.x, J.z) && Sis.ST.inicio.cap.ep7.yoake), await pasoEp());
  comprobar('Momo no vuelve a embarcar en el epílogo', await p.evaluate(() => Sis.npcs.momo.ocupado && islaEn(Sis.npcs.momo.g.position.x, Sis.npcs.momo.g.position.z)));
  await cerrarDialogo();
  await tareaEp('epMesa', /Preparar un sitio/);
  comprobar('La mesa queda servida', await p.evaluate(() => scene.getObjectByName('Yoake · sitios preparados').visible));
  await tareaEp('epCesta', /Recoger la cesta/);
  comprobar('La cesta viaja junto a Hikari', await p.evaluate(() => { const c = scene.getObjectByName('Yoake · cesta de provisiones'); return c.visible && Math.hypot(c.position.x - J.x, c.position.z - J.z) < 1; }));
  await p.evaluate(() => Sis.guardar()); await cargar(); await p.locator('#btnContinuar').click(); await p.waitForFunction(() => G.estado === 'juego'); await sim(30);
  comprobar('Cargar a mitad conserva tareas, posición segura y cesta transportada', await pasoEp() === 3 && await p.evaluate(() => {
    const e = Sis.ST.inicio.cap.ep7, c = scene.getObjectByName('Yoake · cesta de provisiones');
    return e.propuesta && e.archivos && e.yoake && e.mesa && e.cesta && !e.suministros && islaEn(J.x, J.z)
      && c.visible && Math.hypot(c.position.x - J.x, c.position.z - J.z) < 1 && scene.getObjectByName('Yoake · sitios preparados').visible;
  }));
  await puntoEp('epMemoria'); comprobar('Sayo y Momo ofrecen colocar los nombres', /Colocar los nombres/.test(await ofrece()), await ofrece()); await usar();
  comprobar('El memorial conserva nombres y oficios de los custodios', await p.evaluate(() => ['GF-EP-NOMBRES', 'GF-EP-01'].every(id => UI.dlg.lineas.some(l => l.id === id)))); await cerrarDialogo(); await sim(5);
  comprobar('Los nombres quedan visibles antes de entregar la cesta', await p.evaluate(() => scene.getObjectByName('Yoake · nombres y oficios').visible && !Sis.ST.inicio.cap.ep7.suministros));
  await puntoEp('epSenal'); const giroAntes = await p.evaluate(() => scene.getObjectByName('Yoake · flecha de entrada').rotation.y);
  await tareaEp('epSenal', /Orientar la señal/); await sim(120);
  comprobar('La señal gira hacia el embarcadero y reconcilia la recogida', await pasoEp() === 5 && await p.evaluate(a => {
    const s = scene.getObjectByName('Yoake · flecha de entrada'), E = IslaYoake.puntos.embarcadero;
    const rumbo = Math.atan2(E.x - s.position.x, E.z - s.position.z);
    return Math.abs(Math.atan2(Math.sin(s.rotation.y - rumbo), Math.cos(s.rotation.y - rumbo))) < .03 && Math.abs(s.rotation.y - a) > .2;
  }, giroAntes), await pasoEp());
  await tareaEp('epEntrega', /Dejar la cesta/);
  comprobar('Entregar la cesta la deja en los huertos y reconcilia mesa y memoria', await pasoEp() === 8 && await p.evaluate(() => !scene.getObjectByName('Yoake · cesta de provisiones').visible && scene.getObjectByName('Yoake · cesta entregada a los Mori').visible), await pasoEp());
  await enPunto(() => { const m = IslaYoake.puntos.mirador; return [m.x, m.y, m.z]; });
  comprobar('En el mirador, Momo pregunta por su nombre', /mirador/.test(await ofrece()), await ofrece());
  await usar(); comprobar('Hikari elige seguir llamándose Hikari', await p.evaluate(() => UI.dlg && UI.dlg.lineas.some(l => l.id === 'EP7M05'))); await cerrarDialogo(); await foto('07-mirador');
  comprobar('Se puede terminar el recorrido', /Terminar este recorrido/.test(await ofrece()), await ofrece()); await usar(); await sim(5);
  comprobar('Aparecen los créditos', await p.evaluate(() => !$('creditos').classList.contains('oculto'))); await foto('08-creditos');
  comprobar('Abrir los créditos no cierra ni reinicia el recorrido', await pasoEp() === 9 && await p.evaluate(() => !Sis.ST.inicio.cap.ep7.fin && Sis.ST.inicio.cap.ep7.mesa && Sis.ST.inicio.cap.ep7.memoria));
  await p.locator('#btnSeguir').click(); await sim(5);
  comprobar('Tras los créditos se sigue jugando y el epílogo queda cerrado', await p.evaluate(() => $('creditos').classList.contains('oculto') && G.estado === 'juego') && await pasoEp() === 99, await pasoEp());
  await p.evaluate(() => Sis.guardar()); await cargar(); await p.locator('#btnContinuar').click(); await p.waitForFunction(() => G.estado === 'juego'); await sim(30);
  comprobar('Al recargar, la luna sigue dorada y Lumi sigue siendo luciérnaga', await p.evaluate(() => Atmosfera.aparienciaLunar === 0 && Lumi.grupo.scale.x < .5 && !Sis.ST.cieloRojo));
  comprobar('Al continuar permanecen las obras y Momo vuelve con Sayo y Aiko', await pasoEp() === 99 && await p.evaluate(() => {
    const q = Sis.npcs.momo.g.position, v = EscenarioCapitulos.vecinos;
    return scene.getObjectByName('Yoake · sitios preparados').visible && scene.getObjectByName('Yoake · nombres y oficios').visible
      && Sis.ST.inicio.cap.ep7.fin && q.distanceTo(v.sayo.g.position) < 5 && q.distanceTo(v.aiko.g.position) < 5;
  }));
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) {
  errores.push(e.stack || e.message);
  try { await foto('error'); console.log(await p.evaluate(() => ({ cap: Sis.ST.capitulo, mis: Sis.ST.mis.c7_luna, ep: Sis.ST.mis.ep7_amanecer, dlg: UI.dlg && UI.dlg.lineas.map(l => l.id), cin: Cin.activa && Cin.tipo, J: { x: J.x, y: J.y, z: J.z }, ofrece: (mejorInteract(J) || {}).txt, luna: { act: DueloLuna.activo, etapa: DueloLuna.etapa, st: Sis.ST.dueloLuna } }))); } catch {}
}
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();

function probarSinNavegador() {
  const pruebas = [], comprobar = (nombre, pasa) => {
    pruebas.push({ nombre, pasa: !!pasa }); if (!pasa) throw Error(nombre);
  };
  const fuente = n => fs.readFileSync(path.join(raiz, 'js', n), 'utf8');
  function sesion(partida) {
    const contexto = vm.createContext({ partida, console, setTimeout });
    const ejecutar = codigo => vm.runInContext(codigo, contexto);
    ejecutar(`
      var GUION_INICIO = { lineas: {}, bloques: {}, misiones: [] };
      var oyentes = {}, Bus = { on: (id, fn) => (oyentes[id] || (oyentes[id] = [])).push(fn), emit: (id, dato) => (oyentes[id] || []).forEach(fn => fn(dato)) };
      var guardado, ultimoBloque = null, cerrarCreditos = null, viajeros, fallaViaje = false, eventos = [];
      var puntos = Object.fromEntries(['epArchivos', 'epPropuesta', 'epSenal', 'embarcadero', 'epCesta', 'epEntrega', 'epMesa', 'epMemoria', 'mirador'].map((id, i) => [id, { x: i * 20, y: 0, z: 0 }]));
      var IslaYoake = { puntos }, EscenarioCapitulos = { puntos: {} }, Estr = { altar: {} }, Ecos = { lista: [] };
      var TRAVESIA = { pasajeros: ['kaito', 'yuki', 'momo'] };
      var Cin = { activa: false, travesia: (ida, fn, op) => { viajeros = { lista: [...TRAVESIA.pasajeros], ida, op }; if (fallaViaje) throw Error('viaje de prueba'); fn(); } };
      var Piloto = { conversar: id => { ultimoBloque = id; }, nota() {}, alCaminar: () => true };
      var Campana = { capitulo: () => 7 }, Sonido = { sfx() {} }, UI = {}, CAPITULOS = {};
      var EscenasCapitulos = { creditos: fn => { cerrarCreditos = fn; } };
      var Sis = {
        ST: partida || { inicio: { cap: {}, momo: true, tsuru: true }, mis: Object.fromEntries(['c1_petalo', 'c2_marea', 'c3_duna', 'c4_velo', 'c5_tasogare', 'c6_kiri', 'c7_luna'].map(id => [id, { e: 'hecha', p: 99, c: 0 }])) },
        npcs: { kaito: { g: { position: { x: 500, y: 0, z: 0 } } }, momo: { g: { position: { x: 900, y: 0, z: 0 } } } },
        evento(ev) { eventos.push(ev); const m = Sis.ST.mis.ep7_amanecer, q = MIS.find(q => q.id === 'ep7_amanecer'); if (m.e === 'activa' && q.pasos[m.p].ev === ev) { m.p++; if (m.p === q.pasos.length) m.e = 'hecha'; } },
        guardar() { guardado = JSON.stringify(Sis.ST); }, encargo: () => false, npcDe: id => id
      };
      if (!Sis.ST.mis.ep7_amanecer) Sis.ST.mis.ep7_amanecer = { e: 'activa', p: 0, c: 0 };
      puntos.epViaje = Sis.npcs.kaito.g.position;
      var J = { x: 0, y: 0, z: 0, suelo: true }, sitio = () => ({ x: 0, h: 0, z: 0 });
    `);
    ejecutar(fuente('59-guion-capitulos.js'));
    ejecutar('var MIS = GUION_INICIO.misiones;');
    ejecutar(fuente('60-capitulos.js'));
    ejecutar(`
      function ofertas(id) {
        Object.assign(J, id === 'viaje' ? Sis.npcs.kaito.g.position : puntos[id]);
        const lista = [];
        Capitulos.candidatos(J, (p, r, txt, fn) => { if (p && !(Math.abs(J.y - p.y) > 3) && Math.hypot(J.x - p.x, J.z - p.z) < r) lista.push({ txt, fn }); });
        return lista;
      }
      function hacer(id) {
        const o = ofertas(id)[0]; if (!o) throw Error('Sin interacción: ' + id);
        o.fn(); if (ultimoBloque) { const b = ultimoBloque; ultimoBloque = null; Bus.emit('conversacion', b); }
        Capitulos.actualizar(0, J);
      }
    `);
    return ejecutar;
  }
  try {
    let evaluar = sesion();
    for (const id of ['epArchivos', 'epPropuesta', 'epSenal', 'epCesta', 'epMesa', 'epMemoria', 'viaje']) {
      comprobar('Ofrece ' + id + ' con acción adaptable', evaluar(`ofertas('${id}').some(o => o.txt.includes('{interactuar}'))`));
    }
    comprobar('La entrega requiere recoger la cesta', evaluar("ofertas('epEntrega').length === 0"));
    comprobar('El mirador espera al memorial', evaluar("ofertas('mirador').length === 0"));
    evaluar("hacer('epMesa'); hacer('epMemoria'); hacer('epPropuesta'); hacer('viaje'); hacer('epCesta');");
    comprobar('Las tareas fuera de orden esperan a los archivos', evaluar('Sis.ST.mis.ep7_amanecer.p === 0 && Sis.ST.inicio.cap.ep7.mesa && Sis.ST.inicio.cap.ep7.memoria && Sis.ST.inicio.cap.ep7.cesta'));
    comprobar('La cesta emite y guarda su propio evento', evaluar("eventos.includes('ep7:cesta_recogida') && JSON.parse(guardado).inicio.cap.ep7.cesta"));
    comprobar('La travesía no lleva a Momo y conserva los pasajeros de C4', evaluar("!viajeros.lista.includes('momo') && TRAVESIA.pasajeros.includes('momo') && viajeros.op.sinRojo"));
    comprobar('GF-EP-NOMBRES y GF-EP-01 siguen en el memorial', evaluar("['GF-EP-NOMBRES', 'GF-EP-01'].every(id => GUION_INICIO.bloques.ep7_memoria.includes(id))"));
    comprobar('La confirmación de C7 deja a Momo a salvo en la isla', evaluar("GUION_INICIO.bloques.c7_evacuacion.includes('GF-C7-SEG01') && !GUION_INICIO.lineas.C7B04.texto.includes('Momo') && GUION_INICIO.lineas['GF-C7-SEG01'].texto.includes('a salvo en la isla')"));
    evaluar = sesion(JSON.parse(evaluar('guardado')));
    comprobar('Cargar a mitad conserva cesta, mesa, memorial y propuesta', evaluar('Sis.ST.inicio.cap.ep7.cesta && Sis.ST.inicio.cap.ep7.mesa && Sis.ST.inicio.cap.ep7.memoria && Sis.ST.inicio.cap.ep7.propuesta && !Sis.ST.inicio.cap.ep7.suministros'));
    comprobar('Al cargar no se puede recoger otra cesta', evaluar("ofertas('epCesta').length === 0 && ofertas('epEntrega').length === 1"));
    evaluar("hacer('epArchivos');");
    comprobar('Reconcilia la propuesta y el viaje guardados', evaluar('Sis.ST.mis.ep7_amanecer.p === 3'));
    evaluar("hacer('epSenal');");
    comprobar('Reconcilia la recogida fuera de orden', evaluar('Sis.ST.mis.ep7_amanecer.p === 5'));
    evaluar("hacer('epEntrega');");
    comprobar('Reconcilia mesa y memorial, sin combate', evaluar('Sis.ST.mis.ep7_amanecer.p === 8'));
    evaluar("Bus.emit('conversacion', 'ep7_entrega');");
    comprobar('Repetir una conversación no duplica su evento', evaluar("eventos.filter(e => e === 'ep7:suministros_entregados').length === 1"));
    evaluar("hacer('mirador'); hacer('mirador');");
    comprobar('Abrir créditos deja ep7:fin pendiente', evaluar("Sis.ST.mis.ep7_amanecer.p === 9 && !Sis.ST.inicio.cap.ep7.fin && typeof cerrarCreditos === 'function'"));
    evaluar('Sis.guardar();'); evaluar = sesion(JSON.parse(evaluar('guardado')));
    evaluar('Capitulos.actualizar(0, J);');
    comprobar('Cargar con créditos pendientes conserva el último paso abierto', evaluar("Sis.ST.mis.ep7_amanecer.p === 9 && !Sis.ST.inicio.cap.ep7.fin && cerrarCreditos === null"));
    evaluar("hacer('mirador');");
    evaluar('cerrarCreditos();');
    comprobar('Seguir en el valle cierra ep7:fin sin reiniciar tareas', evaluar("Sis.ST.mis.ep7_amanecer.e === 'hecha' && Sis.ST.inicio.cap.ep7.fin && Sis.ST.inicio.cap.ep7.mesa && Sis.ST.inicio.cap.ep7.suministros"));
    evaluar('cerrarCreditos();');
    comprobar('Repetir el cierre no duplica ep7:fin', evaluar("eventos.filter(e => e === 'ep7:fin').length === 1"));
    evaluar = sesion(JSON.parse(evaluar('guardado')));
    evaluar('Capitulos.actualizar(0, J);');
    comprobar('El cierre permanece después de cargar', evaluar("Sis.ST.mis.ep7_amanecer.e === 'hecha' && Sis.ST.inicio.cap.ep7.fin"));
    evaluar("hacer('embarcadero');");
    comprobar('Se puede volver a Hinode después de los créditos', evaluar('!Sis.ST.inicio.cap.enYoake && viajeros.ida === false'));
    evaluar('fallaViaje = true;');
    try { evaluar("hacer('viaje');"); } catch {}
    comprobar('Un fallo de viaje tampoco altera los pasajeros de C4', evaluar("TRAVESIA.pasajeros.includes('momo')"));
    for (let p = 0; p <= 4; p++) {
      const vieja = { inicio: { cap: {} }, mis: { c7_luna: { e: 'hecha', p: 7 }, ep7_amanecer: { e: 'activa', p, c: 0 } } };
      const antigua = sesion(vieja);
      antigua("ofertas('epArchivos');");
      comprobar('Migra partida antigua en paso ' + p, antigua(`Sis.ST.inicio.cap.ep7.version === 1 && !!Sis.ST.inicio.cap.ep7.archivos === ${p > 0} && !!Sis.ST.inicio.cap.ep7.memoria === ${p > 2} && !Sis.ST.inicio.cap.ep7.mesa && Sis.ST.mis.ep7_amanecer.p === 0`));
    }
    const finalAntiguo = sesion({ inicio: { cap: {} }, mis: { c7_luna: { e: 'hecha', p: 7 }, ep7_amanecer: { e: 'hecha', p: 5 } } });
    finalAntiguo("ofertas('mirador');");
    comprobar('Una partida antigua terminada conserva su cierre', finalAntiguo("Sis.ST.mis.ep7_amanecer.e === 'hecha' && Sis.ST.inicio.cap.ep7.fin"));
  } catch (e) { console.error(e.stack); process.exitCode = 1; }
  console.log(JSON.stringify({ modo: 'sin navegador', correctas: pruebas.filter(p => p.pasa).length, pruebas: pruebas.length, detalle: pruebas }, null, 1));
}
