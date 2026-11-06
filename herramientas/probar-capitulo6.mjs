// Capítulo 6 (Kiri) de punta a punta: gruta, emboscada, Gólem de Escarcha, cristales, identidad, registro de Kiri, traición y ataduras de Lumi.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-capitulo6'));
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
const paso = () => p.evaluate(() => { const m = Sis.ST.mis.c6_kiri; return m ? (m.e === 'hecha' ? 99 : m.p) : -1; });
const ofrece = () => p.evaluate(() => { const o = mejorInteract(J); return o && o.txt; });
const usar = () => p.evaluate(() => { const o = mejorInteract(J); if (o) o.fn(); return o && o.txt; });
const cerrarDialogo = async () => { await sim(2); await p.evaluate(() => { if (UI.dlg) UI.saltarDialogo(); }); await sim(2); };
const ir = async (x, z) => { await p.evaluate(([x, z]) => { __ecos.tele(x, z); J.vx = J.vz = 0; }, [x, z]); await sim(20); };
const junto = async (fn, a) => { const [x, z] = await p.evaluate(fn, a); await ir(x, z); };
const enPunto = async (fn, dy) => { const [x, y, z] = await p.evaluate(fn); await p.evaluate(([x, y, z, dy]) => { __ecos.tele(x, z); if (y !== undefined && y !== null) { J.y = sueloEnJ(x, y + (dy || 1.5), z); G.sy = J.y + 1.4; } J.vx = J.vz = J.vy = 0; }, [x, y, z, dy]); await sim(20); };
const hastaCin = async (tipo, max) => { for (let i = 0; i < (max || 60); i++) { if (await p.evaluate(t => Cin.activa && Cin.tipo === t, tipo)) return true; await sim(30); } return false; };
const hastaFinCin = async () => { for (let i = 0; i < 200; i++) { if (!(await p.evaluate(() => Cin.activa))) return true; await sim(60); } return false; };
const enGruta = async (fn) => { const [x, z] = await p.evaluate(fn); await p.evaluate(([x, z]) => { __ecos.tele(x, z); J.y = sueloEnJ(x, CUEVAS[1].cy + 2, z); J.vx = J.vz = J.vy = 0; G.sy = J.y + 1.4; }, [x, z]); await sim(20); };
try {
  await cargar();
  await p.evaluate(() => {
    __ecos.empezarRapido(true); const s = Sis.ST.inicio;
    Object.assign(s, { prologo: true, nombre: true, hinode: true, momo: true, tsuru: true, hoja: true, rumbo: true, fin: true, registroPetalo: true, postigo: true });
    Sis.ST.mis = { inicio_luna: { e: 'hecha', p: 6, c: 0 }, registro_petalo: { e: 'hecha', p: 1, c: 0 }, c1_petalo: { e: 'hecha', p: 10, c: 0 }, c2_marea: { e: 'hecha', p: 12, c: 0 }, c3_duna: { e: 'hecha', p: 9, c: 0 }, c4_velo: { e: 'hecha', p: 11, c: 0 }, c5_tasogare: { e: 'hecha', p: 11, c: 0 } };
    Sis.ST.capitulo = 6; Sis.ST.frag[0] = Sis.ST.frag[1] = Sis.ST.frag[2] = true; Object.assign(Sis.ST.retos, { petalo: true, marea: true, duna: true }); Sis.dar('katana', 1, true); Sis.ST.eq.arma = 'katana';
    Sis.ST.cieloRojo = true; Sis.perder('tsuru', 'momo'); Sis.dar('farol', 1, true);
    Sis.ST.onis = { petalo: 1, marea: 1, duna: 1, escarcha: 1 }; Sis.ST.inicio.cap = { emisor: true, agua: true, senal: true, momoCapturada: true, momoRescatada: true }; Sis.ST.seg = null; Sis.guardar();
  });
  await cargar(); await p.locator('#btnContinuar').click(); await p.waitForFunction(() => G.estado === 'juego', null, { timeout: 30000 }); await sim(60);
  comprobar('El capítulo 6 revela su misión y abre Kiri', await p.evaluate(() => Sis.ST.mis.c6_kiri && Sis.ST.mis.c6_kiri.e === 'activa' && Campana.abierta(2)));
  await enGruta(() => { const s = EscenarioCapitulos.puntos.sayo; return [s.x + 1, s.z + 1]; });
  comprobar('En la gruta se ordenan las pruebas', /Ordenar las pruebas/.test(await ofrece()), await ofrece());
  await usar(); await cerrarDialogo(); comprobar('Acordar la ruta lleva a Kiri', await paso() === 1, await paso());
  await junto(() => { const A = ARENAS.escarcha, d = Math.hypot(A.x, A.z); return [A.x - A.x / d * 60, A.z - A.z / d * 60]; }); await sim(10);
  await junto(() => { const A = ARENAS.escarcha, d = Math.hypot(A.x, A.z); return [A.x - A.x / d * 40, A.z - A.z / d * 40]; }); await sim(30);
  comprobar('En el paso acordado a solas espera una emboscada', await p.evaluate(() => Sis.ST.inicio.cap.emboscada && Sombras.lista.length >= 2 && Sis.ST.inicio.notas.some(n => n.id === 'c6_emboscada')));
  await foto('01-emboscada');
  await p.evaluate(() => { for (const s of Sombras.lista.slice()) Sombras.quitar(s); });
  await junto(() => [ARENAS.escarcha.x + 10, ARENAS.escarcha.z]); await sim(10);
  comprobar('Superar el paso lleva a las balizas', await paso() === 2, await paso());
  for (const e of ['pelea', 'purificado', 'canal']) await p.evaluate(e => Sis.evento('jefe:escarcha:' + e), e);
  comprobar('El guardián calmado lleva a los cristales', await paso() === 5, await paso());
  await p.evaluate(() => { Sis.ST.retos.escarcha = true; }); await sim(10);
  comprobar('Resolver los cristales deja el fragmento', await paso() === 6, await paso());
  await enPunto(() => { const a = Estr.altar.escarcha; return [a.x + 1.6, a.y - 2, a.z + 1.6]; }); await cerrarDialogo();
  comprobar('El altar ofrece tocar el fragmento', /Tocar el fragmento/.test(await ofrece()), await ofrece());
  await usar(); comprobar('Empieza el recuerdo', await hastaCin('recuerdo', 60));
  await sim(60 * 17.5); await foto('02-padre'); await hastaFinCin(); await sim(10);
  comprobar('Hikari se reconoce como Akari', await p.evaluate(() => Sis.ST.frag[3] && UI.dlg && UI.dlg.lineas[0].id === 'C6M02' && UI.dlg.lineas.some(l => l.id === 'C6M05'))); await cerrarDialogo();
  comprobar('La identidad lleva a la cima', await paso() === 7, await paso());
  await enPunto(() => { const c = Estr.cima; return [c.x + .6, c.y, c.z + .6]; }, .5);
  comprobar('En la cima se lee el registro', /registro de Kiri/.test(await ofrece()), await ofrece());
  await usar(); await cerrarDialogo(); comprobar('El registro lleva a la arena', await paso() === 8, await paso());
  await junto(() => [ARENAS.escarcha.x + 8, ARENAS.escarcha.z]); await sim(10);
  comprobar('En la arena, Lumi confiesa', await p.evaluate(() => UI.dlg && UI.dlg.lineas[0].id === 'C6L01' && UI.dlg.lineas.some(l => l.id === 'C6L07'))); await cerrarDialogo(); await sim(10);
  comprobar('La Luna toma a Lumi y empieza el combate', await paso() === 9 && await p.evaluate(() => LumiEnlaces.activo), await paso());
  await sim(120); await foto('03-ataduras');
  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 120 && (await p.evaluate(() => LumiEnlaces.rotos)) === i; k++) {
      await p.evaluate(i => { const A = ARENAS.escarcha, B = LUMI_ENLACES.bases.posiciones[i], x = A.x + B[0] * .8, z = A.z + B[1] * .8; __ecos.tele(x, z); J.vx = J.vz = 0; const y = J.y; LumiEnlaces.golpear({ x, y, z, yaw: Math.atan2(A.x + B[0] - x, A.z + B[1] - z) }, 4, Math.PI, 60, { peso: 1 }); }, i);
      await sim(20);
    }
    comprobar('Se rompe la atadura ' + (i + 1), await p.evaluate(i => LumiEnlaces.rotos > i, i), await p.evaluate(() => LumiEnlaces.rotos));
  }
  for (let k = 0; k < 20 && await p.evaluate(() => LumiEnlaces.activo); k++) await sim(30);
  comprobar('Romper las tres ataduras libera a Lumi', await p.evaluate(() => !LumiEnlaces.activo) && await paso() >= 10, await paso());
  await sim(30); comprobar('Lumi admite su elección sin pedir perdón', await p.evaluate(() => UI.dlg && UI.dlg.lineas[0].id === 'C6S01' && UI.dlg.lineas.some(l => l.id === 'C6S05'))); await cerrarDialogo(); await sim(5);
  comprobar('El capítulo 6 termina y abre el 7', await paso() === 99 && await p.evaluate(() => Sis.ST.capitulo === 7), await p.evaluate(() => Sis.ST.capitulo));
  comprobar('El diario conserva las notas del capítulo', await p.evaluate(() => ['c6_emboscada', 'c6_identidad', 'c6_registro', 'c6_traicion', 'c6_libre'].every(id => Sis.ST.inicio.notas.some(n => n.id === id))));
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) {
  errores.push(e.stack || e.message);
  try { await foto('error'); console.log(await p.evaluate(() => ({ cap: Sis.ST.capitulo, mis: Sis.ST.mis.c6_kiri, dlg: UI.dlg && UI.dlg.lineas.map(l => l.id), cin: Cin.activa && Cin.tipo, J: { x: J.x, y: J.y, z: J.z }, ofrece: (mejorInteract(J) || {}).txt, lumi: typeof LumiEnlaces !== 'undefined' && { act: LumiEnlaces.activo, rotos: LumiEnlaces.rotos } }))); } catch {}
}
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
