// Diagnóstico de caídas (76-diagnostico.js): detecta cierres sueltos, baja la calidad tras dos y avisa; recoge la pérdida del contexto WebGL.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-diagnostico'));
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
try {
  // 1. cierre limpio: recargar no cuenta como caída
  await cargar();   const limpia = await p.evaluate(() => Diagnostico.registro && { caidas: Diagnostico.registro.caidas, limpio: Diagnostico.registro.limpio });
  comprobar('Primer arranque: sin caídas y registro abierto', limpia && limpia.caidas === 0 && limpia.limpio === false, limpia);
  await p.evaluate(() => { __ecos.manual(false); }); await p.waitForTimeout(2200);
  const latido = await p.evaluate(() => JSON.parse(localStorage.getItem('ecos_diag')));
  comprobar('El latido guarda el lugar, la calidad y la memoria', /pantalla de inicio/.test(latido.ult || '') && latido.calidad && latido.gl && latido.gl.prog > 20, latido);
  await cargar();
  const tras = await p.evaluate(() => ({ caidas: Diagnostico.registro.caidas, visible: !document.getElementById('sugCalidad').classList.contains('oculto') }));
  comprobar('Recargar con normalidad no cuenta como caída ni avisa', tras.caidas === 0 && !tras.visible, tras);
  // 2. caída simulada: antes de la siguiente carga el registro queda sin marca limpia y con una caída previa
  await p.addInitScript(() => { try { const r = JSON.parse(localStorage.getItem('ecos_diag')); if (r && !sessionStorage.getItem('ya')) { sessionStorage.setItem('ya', '1'); r.limpio = false; r.caidas = 1; r.ult = 'escena «intro», plano 5 (21 s)'; localStorage.setItem('ecos_diag', JSON.stringify(r)); } } catch (e) { } });
  await p.goto(url, { timeout: 180000 }); await p.waitForFunction(() => window.__ecos && G.estado === 'portada', null, { timeout: 120000 });
  const caida = await p.evaluate(() => ({ caidas: Diagnostico.registro.caidas, calidad: AJUSTES.calidad, texto: document.getElementById('sugTxt').textContent, visible: !document.getElementById('sugCalidad').classList.contains('oculto'), si: !document.getElementById('btnSugSi').classList.contains('oculto'), hist: Diagnostico.registro.historial.length }));
  comprobar('Dos caídas seguidas: baja a calidad media y avisa dónde ocurrió', caida.caidas === 2 && caida.calidad === 'media' && caida.visible && /se cerró solo/.test(caida.texto) && /plano 5/.test(caida.texto) && /media/.test(caida.texto) && !caida.si && caida.hist >= 1, caida);
  // 3. contexto WebGL perdido
  await p.evaluate(() => { document.getElementById('sugCalidad').classList.add('oculto'); renderer.domElement.dispatchEvent(new Event('webglcontextlost', { cancelable: true })); });
  const ctx = await p.evaluate(() => ({ visible: !document.getElementById('sugCalidad').classList.contains('oculto'), si: !document.getElementById('btnSugSi').classList.contains('oculto'), texto: document.getElementById('sugTxt').textContent, n: Diagnostico.registro.contexto }));
  comprobar('Si se pierde el contexto gráfico: aviso con botón de recargar y anotado', ctx.visible && ctx.si && /imagen/.test(ctx.texto) && ctx.n === 1, ctx);
  comprobar('Sin errores de navegador', !errores.filter(e => !/404/.test(e)).length, errores);
} catch (e) { errores.push(e.stack || e.message); }
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
