// Reproduce una partida anterior al arreglo y llega al atril con movimiento real.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-registro/modular'));
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
const foto = async nombre => { await p.evaluate(() => { UI.fundido(0, 0); render(); }); await p.waitForTimeout(250); await p.screenshot({ path: path.join(salida, nombre + '.png') }); };
try {
  await cargar();
  await p.evaluate(() => {
    __ecos.empezarRapido(true); const s = Sis.ST.inicio;
    Object.assign(s, { prologo: true, nombre: true, hinode: true, momo: true, tsuru: true, hoja: true, rumbo: true, fin: true }); delete s.registroPetalo;
    s.notas = [{ id: 'previa', titulo: 'Nota conservada', texto: 'No borrar' }];
    Sis.ST.mis = { inicio_luna: { e: 'hecha', p: 6, c: 0 }, registro_petalo: { e: 'activa', p: 0, c: 0 } }; Sis.ST.seg = 'registro_petalo'; Sis.ST.xp = 37; Sis.ST.inv.onigiri = 2;
    localStorage.setItem('ecos2_partida', 'historia anterior intacta'); Sis.guardar();
  });
  await cargar(); await p.locator('#btnContinuar').click(); await p.waitForFunction(() => G.estado === 'juego', null, { timeout: 30000 });
  comprobar('Continuar acepta el guardado anterior sin reiniciar progreso', await p.evaluate(() => !Sis.ST.inicio.registroPetalo && Sis.ST.inicio.rumbo && Sis.ST.xp === 37 && Sis.ST.inicio.notas[0].id === 'previa'));
  const objetivo = await p.evaluate(() => { const o = Sis.objetivo(), r = Estr.registroPetalo, t = sitio('petalo'); return { objetivo: { x: o.x, z: o.z, txt: o.txt }, atril: { x: r.x, y: r.y, z: r.z }, centro: { x: t.x, z: t.z } }; });
  comprobar('El marcador señala el atril exterior y no el centro cerrado', Math.hypot(objetivo.objetivo.x - objetivo.atril.x, objetivo.objetivo.z - objetivo.atril.z) < .01 && Math.hypot(objetivo.objetivo.x - objetivo.centro.x, objetivo.objetivo.z - objetivo.centro.z) > 5 && objetivo.objetivo.txt.includes('exterior'), objetivo);
  await p.evaluate(() => {
    const s = sitio('petalo'), a = Estr.registroPetalo.giro;
    const x = s.x + 1.4 * Math.cos(a) + 8.2 * Math.sin(a), z = s.z - 1.4 * Math.sin(a) + 8.2 * Math.cos(a);
    __ecos.tele(x, z); J.camYaw = J.yaw = a + Math.PI; J.camPitch = .3; __ecos.tecla('KeyW', true);
  });
  await sim(85); await p.evaluate(() => __ecos.tecla('KeyW', false)); await sim(18);
  const llegada = await p.evaluate(() => { const r = Estr.registroPetalo; return { p: { x: J.x, y: J.y, z: J.z }, distancia: Math.hypot(J.x - r.x, J.z - r.z), altura: J.y - sitio('petalo').h, prompt: Sis.interactuable(J)?.txt, dentro: Sol.dentro(J.x, J.y + .7, J.z, .2) }; });
  comprobar('Se llega caminando por la escalinata, sin entrar ni atravesar sólidos', llegada.distancia < 2.1 && llegada.altura >= 0 && !llegada.dentro && /registro/.test(llegada.prompt), llegada);
  const antesLectura = await p.evaluate(() => ({ xp: Sis.ST.xp, inv: JSON.stringify(Sis.ST.inv), frag: JSON.stringify(Sis.ST.frag), nivel: Sis.ST.nivel }));
  await foto('01-atril-accesible'); await p.keyboard.press('e'); await sim(1);
  comprobar('E abre cuatro páginas de registro con lectura manual', await p.evaluate(() => UI.dlg?.lineas.length === 4 && UI.dlg.lineas[0].id === 'RP01' && Sis.ST.mis.registro_petalo.e === 'activa'));
  await sim(700); await p.keyboard.press('e'); await sim(1);
  comprobar('Las páginas contienen el asiento de Nao sin revelar identidades', await p.evaluate(() => UI.dlg.i === 1 && UI.dlg.lineas[1].texto.includes('Nao') && !UI.dlg.lineas.some(l => /usurpadora|eres Akari|tu padre/.test(l.texto))));
  await foto('02-asiento-de-nao'); await p.evaluate(() => Sis.guardar());
  await cargar(); await p.locator('#btnContinuar').click(); await p.waitForFunction(() => G.estado === 'juego' && UI.dlg, null, { timeout: 30000 });
  comprobar('Una lectura guardada continúa en la misma página', await p.evaluate(() => UI.dlg.i === 1 && Sis.ST.inicio.dialogo.id === 'registroPetalo'));
  for (let i = 0; i < 3; i++) { await sim(950); await p.keyboard.press('e'); await sim(1); }
  comprobar('Terminar la lectura completa la misión y abre el capítulo 1', await p.evaluate(() => !UI.dlg && Sis.ST.inicio.registroPetalo && Sis.ST.mis.registro_petalo.e === 'hecha' && Sis.ST.capitulo === 1 && Sis.ST.seg === 'c1_petalo'));
  comprobar('El diario guarda procedencia e inferencias sin borrar notas previas', await p.evaluate(() => Sis.ST.inicio.notas.some(n => n.id === 'previa') && Sis.ST.inicio.notas.filter(n => n.id === 'registroPetalo').length === 1 && Piloto.diario().includes('todavía no prueba')));
  comprobar('Leer no entrega un fragmento ni cambia inventario o XP', await p.evaluate(s => JSON.stringify(Sis.ST.frag) === s.frag && Sis.ST.xp === s.xp && JSON.stringify(Sis.ST.inv) === s.inv && Sis.ST.nivel === s.nivel, antesLectura), antesLectura);
  await p.evaluate(() => Piloto.conversar('registroPetalo')); await p.evaluate(() => UI.saltarDialogo()); await sim(1);
  comprobar('Releer no duplica notas ni recompensas', await p.evaluate(s => Sis.ST.inicio.notas.filter(n => n.id === 'registroPetalo').length === 1 && Sis.ST.xp === s.xp && Sis.ST.mis.registro_petalo.e === 'hecha', antesLectura));
  await cargar(); await p.locator('#btnContinuar').click(); await p.waitForFunction(() => G.estado === 'juego'); await sim(1);
  comprobar('La misión completada permanece completada al recargar', await p.evaluate(() => Sis.ST.inicio.registroPetalo && Sis.ST.mis.registro_petalo.e === 'hecha' && Sis.ST.capitulo === 1));
  const mando = await p.evaluate(() => {
    const r = Estr.registroPetalo; J.x = r.acceso.x; J.z = r.acceso.z; J.y = sueloEnJ(J.x, r.y + 1, J.z); J.vx = J.vz = 0;
    const pad = { connected: true, id: 'Xbox prueba', axes: [0, 0, 0, 0], buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })) };
    navigator.getGamepads = () => [pad]; pad.buttons[3].pressed = true; __ecos.sim(1, 1 / 60); pad.buttons[3].pressed = false; __ecos.sim(1, 1 / 60); return { id: UI.dlg?.lineas[0].id, tecla: UI.teclas('{interactuar}') };
  });
  comprobar('Y del mando permite consultar de nuevo el registro', mando.id === 'RP01' && mando.tecla === 'Y', mando);
  await p.evaluate(() => UI.saltarDialogo());
  comprobar('La historia anterior no se modifica', await p.evaluate(() => localStorage.getItem('ecos2_partida') === 'historia anterior intacta'));
  await p.evaluate(() => {
    Sis.ST.inicio.fin = false; Sis.ST.inicio.registroPetalo = false;
    Sis.ST.mis = { inicio_luna: { e: 'activa', p: 5, c: 0 } }; Sis.ST.seg = 'inicio_luna';
    const r = Estr.registroPetalo; J.x = r.acceso.x; J.z = r.acceso.z; J.y = sueloEnJ(J.x, r.y + 1, J.z);
  }); await sim(1);
  comprobar('Llegar por otra ruta también desbloquea la misión del registro', await p.evaluate(() => Sis.ST.inicio.fin && Sis.ST.mis.registro_petalo.e === 'activa'));
  await foto('03-registro-y-objetivo');
} catch (e) { errores.push(e.stack); try { await foto('error'); } catch {} }
fs.writeFileSync(path.join(salida, 'resultado.json'), JSON.stringify({ archivo, pruebas, errores }, null, 2));
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(p => p.pasa).length, pruebas: pruebas.length, errores }, null, 2));
if (errores.length || pruebas.some(p => !p.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
