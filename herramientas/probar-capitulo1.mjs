// Capítulo 1 (El Pétalo) de punta a punta: misión, katana, semillas, gólem, faroles, recuerdo, fragmento y paso al capítulo 2.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-capitulo1'));
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
const paso = () => p.evaluate(() => { const m = Sis.ST.mis.c1_petalo; return m ? (m.e === 'hecha' ? 99 : m.p) : -1; });
const ofrece = () => p.evaluate(() => { const o = mejorInteract(J); return o && o.txt; });
const usar = () => p.evaluate(() => { const o = mejorInteract(J); if (o) o.fn(); return o && o.txt; });
const cerrarDialogo = async () => { await sim(2); await p.evaluate(() => { if (UI.dlg) UI.saltarDialogo(); }); await sim(2); };
const ir = async (x, z) => { await p.evaluate(([x, z]) => { __ecos.tele(x, z); J.vx = J.vz = 0; }, [x, z]); await sim(20); };
const junto = async (fn, a) => { const [x, z] = await p.evaluate(fn, a); await ir(x, z); };
try {
  await cargar();
  await p.evaluate(() => {
    __ecos.empezarRapido(true); const s = Sis.ST.inicio;
    Object.assign(s, { prologo: true, nombre: true, hinode: true, momo: true, tsuru: true, hoja: true, rumbo: true, fin: true, registroPetalo: true });
    Sis.ST.mis = { inicio_luna: { e: 'hecha', p: 6, c: 0 }, registro_petalo: { e: 'hecha', p: 1, c: 0 } }; Sis.ST.seg = null; delete Sis.ST.capitulo; Sis.guardar();
  });
  await cargar(); await p.locator('#btnContinuar').click(); await p.waitForFunction(() => G.estado === 'juego', null, { timeout: 30000 }); await sim(2);
  comprobar('Una partida que terminó el registro entra en el capítulo 1 con su misión', await p.evaluate(() => Sis.ST.capitulo === 1 && Sis.ST.mis.c1_petalo && Sis.ST.mis.c1_petalo.e === 'activa'));
  // C1A · altar
  await junto(() => [Estr.altar.petalo.x + 2, Estr.altar.petalo.z + 2]);
  comprobar('El altar ofrece examinarlo', /Examinar el altar/.test(await ofrece()), await ofrece());
  await usar(); comprobar('Abre la conversación del altar', await p.evaluate(() => UI.dlg && UI.dlg.lineas[0].id === 'CPA01')); await cerrarDialogo();
  comprobar('Examinar el altar avanza la misión y deja nota', await paso() === 1 && await p.evaluate(() => Sis.ST.inicio.notas.some(n => n.id === 'c1_altar')), await paso());
  // C1B · mural
  await junto(() => { const m = Estr.murales.find(m => m.k === 4); return [m.x + 1.5, m.z + 1.5]; });
  comprobar('El mural ofrece la comparación', /Comparar el mural/.test(await ofrece()), await ofrece());
  await usar(); await cerrarDialogo(); await sim(10);
  comprobar('Comparar el mural avanza y Lumi habla de la katana', await paso() === 2 && await p.evaluate(() => UI.dlg && UI.dlg.lineas[0].id === 'CPK01'), await paso());
  await cerrarDialogo();
  // katana
  await junto(() => [Estr.katana.x + 1, Estr.katana.z + 1]);
  comprobar('La Katana del Alba se puede tomar', /Katana del Alba/.test(await ofrece()), await ofrece());
  await usar(); await sim(4);
  comprobar('Tomar la katana avanza la misión y la equipa', await paso() === 3 && await p.evaluate(() => Sis.tiene('katana') && Sis.ST.eq.arma === 'katana'), await paso());
  // semillas y gólem
  await p.evaluate(() => Sis.dar('semilla', 3, true)); await sim(30);
  comprobar('Reunir tres semillas avanza a la arena', await paso() === 4, await paso());
  await junto(() => [ARENAS.cerezo.x + 10, ARENAS.cerezo.z]); await sim(5); await cerrarDialogo();
  const planta = await p.evaluate(() => { for (let a = 0; a < 6.3; a += .2) { __ecos.tele(ARENAS.cerezo.x + Math.cos(a) * 14, ARENAS.cerezo.z + Math.sin(a) * 14); const o = Jefes.interactuable(J); if (o && /Plantar/.test(o.txt)) return o.txt; } return null; });
  comprobar('Los cerezos marchitos aceptan semillas', !!planta, planta);
  for (const e of ['pelea', 'purificado', 'canal']) await p.evaluate(e => Sis.evento('jefe:cerezo:' + e), e);
  comprobar('Los eventos del gólem llevan la misión hasta los faroles', await paso() === 7, await paso());
  // faroles: con el oni vencido, se encienden en orden
  await p.evaluate(() => { Sis.ST.onis = { petalo: 1 }; }); await junto(() => [Estr.faroles[0].x + 1, Estr.faroles[0].z + 1]); await sim(10); await cerrarDialogo();
  for (const i of [0, 1, 2]) { await junto(i => [Estr.faroles[i].x + .8, Estr.faroles[i].z + .8], i); const t = await usar(); comprobar('Farol ' + (i + 1) + ' se enciende', /Encender farol/.test(t), t); }
  await p.waitForTimeout(1200); await sim(5);
  comprobar('El reto deja el fragmento en el altar sin concederlo', await paso() === 8 && await p.evaluate(() => Sis.ST.retos.petalo && !Sis.ST.frag[0]), await paso());
  // C1F · recuerdo e integración
  await junto(() => [Estr.altar.petalo.x + 2, Estr.altar.petalo.z + 2]); await cerrarDialogo();
  comprobar('El altar ofrece tocar el fragmento', /Tocar el fragmento/.test(await ofrece()), await ofrece());
  await usar(); await p.waitForFunction(() => Cin.activa && Cin.tipo === 'recuerdo', null, { timeout: 60000 });
  await sim(150); await foto('01-recuerdo');
  comprobar('El recuerdo muestra la voz de la niña', await p.evaluate(() => $('subtitulo').textContent.includes('Quiero volver a casa')));
  await sim(60 * 24);
  comprobar('Al terminar el recuerdo el fragmento queda integrado y Hikari lo cuenta', await p.evaluate(() => !Cin.activa && Sis.ST.frag[0] && UI.dlg && UI.dlg.lineas[0].id === 'CPR02'));
  await cerrarDialogo(); comprobar('Integrar el fragmento lleva a Tsuru', await paso() === 9, await paso());
  // C1G · Tsuru
  await junto(() => [PatioInicio.puntos.tsuru.x + 1.5, PatioInicio.puntos.tsuru.z + 1.5]);
  comprobar('Tsuru ofrece la conversación del capítulo', /Contar a Tsuru/.test(await ofrece()), await ofrece());
  await usar(); await cerrarDialogo(); await sim(5);
  comprobar('El capítulo 1 termina y abre el 2', await paso() === 99 && await p.evaluate(() => Sis.ST.capitulo === 2 && Campana.abierta(4)), await p.evaluate(() => Sis.ST.capitulo));
  comprobar('El diario conserva las notas del capítulo', await p.evaluate(() => ['c1_altar', 'c1_mural', 'c1_katana', 'c1_recuerdo', 'c1_tsuru'].every(id => Sis.ST.inicio.notas.some(n => n.id === id))));
  await p.evaluate(() => Sis.guardar()); await cargar(); await p.locator('#btnContinuar').click(); await p.waitForFunction(() => G.estado === 'juego'); await sim(2);
  comprobar('El progreso del capítulo se conserva al recargar', await p.evaluate(() => Sis.ST.capitulo === 2 && Sis.ST.frag[0] && Sis.ST.mis.c1_petalo.e === 'hecha'));
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) {
  errores.push(e.stack || e.message);
  try { await foto('error'); console.log(await p.evaluate(() => ({ cap: Sis.ST.capitulo, mis: Sis.ST.mis, dlg: UI.dlg && UI.dlg.lineas.map(l => l.id), cin: Cin.activa && Cin.tipo, J: { x: J.x, z: J.z } }))); } catch {}
}
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
