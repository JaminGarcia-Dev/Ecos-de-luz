// Fase 1 de PLAN_JUEGO: velocidades 3,2 / 6,8 m/s, subpasos de colisión (paredes finas contra carrera y esquiva con tirones) y límite al fijar un enemigo.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-fase1'));
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
  await p.evaluate(() => { __ecos.empezarRapido(true); Sis.ST.capitulo = 7; Sis.dar('katana', 1, true); Sis.ST.eq.arma = 'katana'; });
  await sim(30); for (let i = 0; i < 6; i++) { await p.evaluate(() => { while (UI.dlg) UI.saltarDialogo(); }); await sim(20); }
  const carril = [60, -100];   // carril de la pradera: baja ~1 m en 6 m, sin árboles ni obra
  const prep = () => p.evaluate(([cx, cz]) => { __ecos.tele(cx, cz); J.vx = J.vz = 0; J.yaw = J.camYaw = Math.PI / 2; __ecos.tecla('KeyW', false); __ecos.tecla('ShiftLeft', false); J.rodando = 0; while (UI.dlg) UI.saltarDialogo(); }, carril);
  // (las velocidades 3,2 y 6,8 m/s las mide probar-locomocion.mjs sin el efecto del terreno)
    // 2. paredes finas: de espesor .03 a .2 m, cruzando a la carrera y esquivando, con fotogramas de 1/60, 1/30 y 0,05 s
  for (const esp of [.03, .1, .2]) for (const dt of [1 / 60, 1 / 30, .05]) for (const modo of ['correr', 'esquiva']) {
    await prep();
    const r = await p.evaluate(({ esp, dt, modo }) => {
      const x0 = J.x, z0 = J.z, y = J.y, mur = Sol.add(x0 + 6, z0, esp / 2, 6, 0, y - 8, y + 6);
      __ecos.tecla('KeyW', true); __ecos.tecla('ShiftLeft', true); J.camYaw = Math.PI / 2;
      let cruzo = false, xMax = -1e9; const tr = [];
      for (let i = 0; i < 80; i++) {
        if (modo === 'esquiva' && i % 12 === 0) { J.rodando = 0; __ecos.tecla('KeyV', true); } else __ecos.tecla('KeyV', false);
        Sis.ST.luz = 0; __ecos.sim(1, dt); xMax = Math.max(xMax, J.x); if (J.x > x0 + 6 + esp / 2 + .05) cruzo = true; if (i % 4 === 0) tr.push([+(J.x - x0).toFixed(1), +(J.z - z0).toFixed(1), +(J.y - y).toFixed(1), !!J.trepa, !!J.aupa]);
      }
      mur.on = false; __ecos.tecla('KeyV', false); return { cruzo, xMax: +(xMax - x0).toFixed(2), x0, z0, tr: cruzo ? tr : undefined };
    }, { esp, dt, modo });
    comprobar(`Pared de ${esp * 100} cm, ${modo}, fotograma de ${(dt * 1000).toFixed(0)} ms: no se atraviesa`, !r.cruzo, r);
  }
  // 3. con un enemigo fijado, el límite es 2,6 / 5
  await prep();
  await p.evaluate(() => { Sombras.crear('escudo', J.x + 6, J.z, null); __ecos.sim(90, 1 / 60); });   // deja que la Sombra brote
  await p.evaluate(() => { for (let i = 0; i < 12 && !Combate.fijado; i++) { __ecos.tecla('KeyZ', true); __ecos.sim(2, 1 / 60); __ecos.tecla('KeyZ', false); __ecos.sim(6, 1 / 60); } __ecos.tecla('KeyW', true); __ecos.tecla('ShiftLeft', true); });
  await sim(40);
  const fij = await p.evaluate(() => ({ fijado: Combate.fijado, v: J.vel }));
  comprobar('Fijando a un enemigo, la carrera baja a unos 5 m/s (no a los 6,8 libres)', fij.fijado && fij.v <= 5.5, fij);
  await p.evaluate(() => { for (const s of Sombras.lista.slice()) Sombras.quitar(s); __ecos.tecla('KeyW', false); __ecos.tecla('ShiftLeft', false); });
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) { errores.push(e.stack || e.message); }
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
