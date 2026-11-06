// Capítulo 4 (Fuera del Velo) de punta a punta: Noche Roja, asedio, pérdida de Tsuru, travesía, Yoake, regreso y captura de Momo.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-capitulo4'));
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
const paso = () => p.evaluate(() => { const m = Sis.ST.mis.c4_velo; return m ? (m.e === 'hecha' ? 99 : m.p) : -1; });
const ofrece = () => p.evaluate(() => { const o = mejorInteract(J); return o && o.txt; });
const usar = () => p.evaluate(() => { const o = mejorInteract(J); if (o) o.fn(); return o && o.txt; });
const cerrarDialogo = async () => { await sim(2); await p.evaluate(() => { if (UI.dlg) UI.saltarDialogo(); }); await sim(2); };
const ir = async (x, z) => { await p.evaluate(([x, z]) => { __ecos.tele(x, z); J.vx = J.vz = 0; }, [x, z]); await sim(20); };
const junto = async (fn, a) => { const [x, z] = await p.evaluate(fn, a); await ir(x, z); };
const enPunto = async (fn, dy) => { const [x, y, z] = await p.evaluate(fn); await p.evaluate(([x, y, z, dy]) => { __ecos.tele(x, z); if (y !== undefined && y !== null) { J.y = sueloEnJ(x, y + (dy || 1.5), z); G.sy = J.y + 1.4; } J.vx = J.vz = J.vy = 0; }, [x, y, z, dy]); await sim(20); };
const hastaCin = async (tipo, max) => { for (let i = 0; i < (max || 60); i++) { if (await p.evaluate(t => Cin.activa && Cin.tipo === t, tipo)) return true; await sim(30); } return false; };
const hastaFinCin = async () => { for (let i = 0; i < 200; i++) { if (!(await p.evaluate(() => Cin.activa))) return true; await sim(60); } return false; };
try {
  await cargar();
  await p.evaluate(() => {
    __ecos.empezarRapido(true); const s = Sis.ST.inicio;
    Object.assign(s, { prologo: true, nombre: true, hinode: true, momo: true, tsuru: true, hoja: true, rumbo: true, fin: true, registroPetalo: true, postigo: true });
    Sis.ST.mis = { inicio_luna: { e: 'hecha', p: 6, c: 0 }, registro_petalo: { e: 'hecha', p: 1, c: 0 }, c1_petalo: { e: 'hecha', p: 10, c: 0 }, c2_marea: { e: 'hecha', p: 12, c: 0 }, c3_duna: { e: 'hecha', p: 9, c: 0 } };
    Sis.ST.capitulo = 4; Sis.ST.frag[0] = Sis.ST.frag[1] = Sis.ST.frag[2] = true; Object.assign(Sis.ST.retos, { petalo: true, marea: true, duna: true }); Sis.dar('katana', 1, true); Sis.ST.eq.arma = 'katana';
    Sis.ST.onis = { petalo: 1, marea: 1, duna: 1 }; Sis.ST.inicio.cap = { emisor: true }; Sis.ST.seg = null; Sis.guardar();
  });
  await cargar(); await p.locator('#btnContinuar').click(); await p.waitForFunction(() => G.estado === 'juego', null, { timeout: 30000 }); await sim(2);
  comprobar('El capítulo 4 revela su misión y crea Yoake', await p.evaluate(() => Sis.ST.mis.c4_velo && Sis.ST.mis.c4_velo.e === 'activa' && !!IslaYoake.puntos.embarcadero));
  // Noche Roja y asedio
  await ir(-104, 80); await sim(30);
  comprobar('Al volver a Hinode empieza la Noche Roja', await hastaCin('nocheRoja'));
  await foto('01-noche-roja'); await hastaFinCin(); await sim(10);
  comprobar('Tras la escena empieza el asedio', await paso() === 1 && await p.evaluate(() => Asedio.activo && Sis.ST.cieloRojo), await paso());
  await sim(200); await foto('02-asedio');
  for (let i = 0; i < 40 && await p.evaluate(() => Asedio.activo); i++) { await p.evaluate(() => { for (const s of Sombras.lista.slice()) Sombras.quitar(s); }); await sim(240); }
  comprobar('Vencer las tres oleadas termina el asedio', await p.evaluate(() => !Asedio.activo));
  comprobar('Al abrir la salida, la escena de Tsuru espera en la plaza', await paso() === 2, await paso());
  // pérdida de Tsuru
  await ir(-104, 70); comprobar('Empieza la pérdida de Tsuru, sin robo', await hastaCin('perdidaTsuru'));
  comprobar('Seis planos de Tsuru en 45 s', await p.evaluate(() => Cin.estadoPlano().total === 45));
  await sim(60 * 14.3); await foto('03-tsuru'); await hastaFinCin(); await sim(10);
  comprobar('Tsuru se pierde, Hikari lleva su farol y ningún fragmento se roba', await p.evaluate(() => Sis.ST.ausentes.tsuru && Sis.tiene('farol') === 1 && Sis.ST.inicio.cap.montajes.perdidaTsuru && Sis.ST.avisos.restante > 19 && Sis.ST.robado === null && Sis.ST.frag.filter(Boolean).length === 3));
  comprobar('Yuki y Momo hablan de la pérdida', await p.evaluate(() => UI.dlg && UI.dlg.lineas[0].id === 'C4T04')); await cerrarDialogo();
  // muelle y travesía
  await junto(() => { const k = Sis.npcs.kaito.g.position; return [k.x + 1.5, k.z + 1.5]; }); await sim(10); await cerrarDialogo();
  comprobar('Llegar al muelle avanza a la barca', await paso() === 4, await paso());
  comprobar('Kaito ofrece subir a la barca', /Subir a la barca/.test(await ofrece()), await ofrece());
  await usar(); await cerrarDialogo();
  comprobar('Empieza la travesía', await hastaCin('travesia', 10));
  await sim(60 * 12); await foto('04-velo'); await sim(60 * 9); await foto('05-llegada'); await hastaFinCin(); await sim(20);
  comprobar('La barca deja a Hikari en Yoake, sin cielo rojo', await paso() === 5 && await p.evaluate(() => !!islaEn(J.x, J.z) && Sis.ST.inicio.cap.enYoake && Atmosfera.nivelRojo < .5), await p.evaluate(() => ({ p: Sis.ST.mis.c4_velo, J: { x: J.x, z: J.z }, rojo: Atmosfera.nivelRojo })));
  await foto('06-yoake');
  // refugio
  await enPunto(() => { const a = IslaYoake.puntos.aiko; return [a.x + 1.2, a.y, a.z + 1.2]; });
  comprobar('Aiko recibe en el refugio', /Hablar con Aiko/.test(await ofrece()), await ofrece());
  await usar(); comprobar('La recepción incluye lo que dejó escrito Tsuru', await p.evaluate(() => UI.dlg && UI.dlg.lineas.some(l => l.id === 'C4R06'))); await cerrarDialogo(); await foto('07-refugio');
  comprobar('Conocer el refugio lleva a la compuerta', await paso() === 6, await paso());
  await enPunto(() => { const c = IslaYoake.puntos.compuerta; return [c.x + .8, c.y, c.z + .8]; });
  comprobar('La compuerta se puede orientar', /compuerta/.test(await ofrece()), await ofrece()); await usar(); await sim(5);
  comprobar('Repartir el agua lleva a la torre', await paso() === 7, await paso());
  await enPunto(() => { const t = IslaYoake.puntos.torre; return [t.x + 2, t.y, t.z + 2]; }); await sim(10);
  comprobar('Ren explica la lámpara al pie de la torre', await p.evaluate(() => UI.dlg && UI.dlg.lineas[0].id === 'C4R14')); await cerrarDialogo();
  await enPunto(() => { const l = IslaYoake.puntos.lampara; return [l.x + .6, l.y, l.z + .6]; }, .3);
  comprobar('Arriba de la torre se libera el postigo', /postigo de la lámpara/.test(await ofrece()), await ofrece()); await usar(); await sim(5);
  comprobar('La señal lleva al mirador', await paso() === 8, await paso());
  await sim(10); comprobar('Tras la señal, Ren y Hikari ensayan el arco y se concede', await p.evaluate(() => !!UI.dlg && UI.dlg.lineas[0].id === 'F6A01'), await p.evaluate(() => UI.dlg && UI.dlg.lineas[0].id)); await cerrarDialogo();
  comprobar('El arco de luz queda en el zurrón', await p.evaluate(() => Sis.tiene('arco')) === 1);
  await enPunto(() => { const m = IslaYoake.puntos.mirador; return [m.x, m.y, m.z]; });
  comprobar('El mirador ofrece mirar el amanecer', /amanecer/.test(await ofrece()), await ofrece()); await usar(); await cerrarDialogo(); await foto('08-mirador');
  comprobar('Decidir volver lleva al embarcadero', await paso() === 9, await paso());
  await enPunto(() => { const e = IslaYoake.puntos.embarcadero; return [e.x, e.y, e.z]; });
  comprobar('El embarcadero ofrece volver a la barca', /Volver a la barca/.test(await ofrece()), await ofrece()); await usar(); await cerrarDialogo();
  comprobar('Empieza la travesía de vuelta', await hastaCin('travesia', 10)); await hastaFinCin(); await sim(20);
  comprobar('De vuelta en el muelle llega la captura de Momo', await hastaCin('capturaMomo', 20), await p.evaluate(() => ({ p: Sis.ST.mis.c4_velo, J: { x: J.x, z: J.z } })));
  await sim(60 * 4); await foto('09-captura'); await hastaFinCin(); await sim(5);
  comprobar('Yuki cuenta la captura y Hikari encuentra el lazo', await p.evaluate(() => UI.dlg && UI.dlg.lineas[0].id === 'C4C03')); await cerrarDialogo(); await sim(5);
  comprobar('El capítulo 4 termina y abre el 5', await paso() === 99 && await p.evaluate(() => Sis.ST.capitulo === 5 && Sis.ST.inicio.cap.momoCapturada), await p.evaluate(() => Sis.ST.capitulo));
  comprobar('El diario conserva las notas del capítulo', await p.evaluate(() => ['c4_perdida', 'c4_refugio', 'c4_mirador', 'c4_captura'].every(id => Sis.ST.inicio.notas.some(n => n.id === id))));
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) {
  errores.push(e.stack || e.message);
  try { await foto('error'); console.log(await p.evaluate(() => ({ cap: Sis.ST.capitulo, mis: Sis.ST.mis.c4_velo, dlg: UI.dlg && UI.dlg.lineas.map(l => l.id), cin: Cin.activa && Cin.tipo, J: { x: J.x, y: J.y, z: J.z }, ofrece: (mejorInteract(J) || {}).txt }))); } catch {}
}
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
