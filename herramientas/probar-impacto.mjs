// Contrato de impacto común (70-impacto.js): sector, círculo y proyectil.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-impacto'));
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
  await cargar();
  await p.evaluate(() => { __ecos.empezarRapido(true); Sis.ST.capitulo = 1; Sis.dar('katana', 1, true); Sis.ST.eq.arma = 'katana'; });
  await sim(30);
  const dmg = await p.evaluate(() => {
    const res = {}, nueva = (dx, dz) => { const s = Sombras.crear('rastrera', J.x + dx, J.z + dz, null); s.estado = 'idle'; s.t = 0; s.animo = 1000; return s; };
    const o = { x: J.x, y: J.y, z: J.z, yaw: Math.atan2(1, 0) };
    let s = nueva(2, 0); const toc = new Set();
    res.sector = Impacto.sector(o, 3, .6, 10, { peso: 1 }, toc); res.tras1 = 1000 - s.animo;
    res.repite = Impacto.sector(o, 3, .6, 10, { peso: 1 }, toc); res.tras2 = 1000 - s.animo;
    const detras = nueva(-2, 0); res.detras = Impacto.sector(o, 3, .6, 10, { peso: 1 }, new Set([s])); res.detrasDaño = 1000 - detras.animo;
    const c = nueva(0, 2); res.circulo = Impacto.circulo(J.x, J.y, J.z, 4, 10, { peso: 3 }, new Set()); res.circuloDaño = 1000 - c.animo;
    const p1 = nueva(0, -6); res.alto = Impacto.proyectil(J.x, p1.y + 6, J.z - 12, J.x, p1.y + 6, J.z + 0, .3, 10, {}, new Set()); res.altoDaño = 1000 - p1.animo;
    res.bajo = Impacto.proyectil(J.x, p1.y + .5, J.z - 12, J.x, p1.y + .5, J.z + 0, .3, 10, {}, new Set()); res.bajoDaño = 1000 - p1.animo;
    return res;
  });
  comprobar('Un sector daña a lo que tiene delante, una sola vez por ataque', dmg.sector === 1 && dmg.tras1 > 5 && dmg.repite === 0 && dmg.tras2 === dmg.tras1, dmg);
  comprobar('Un sector no daña a lo que queda a la espalda', dmg.detras === 0 && dmg.detrasDaño === 0, dmg);
  comprobar('El círculo daña alrededor', dmg.circulo >= 1 && dmg.circuloDaño > 5, dmg);
  comprobar('Un proyectil por encima de la Sombra no la toca; a su altura, sí', dmg.alto === null && dmg.altoDaño === 0 && dmg.bajo && dmg.bajoDaño > 5, dmg);
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) { errores.push(e.stack || e.message); }
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
