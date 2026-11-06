// Fase 2 de PLAN_JUEGO: nado normal gratis, nado rápido con gasto de luz como el planeo, sin regeneración durante el sprint, agotamiento y rearme, y entrada al agua sin parpadeo.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-fase2'));
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
  await p.evaluate(() => { __ecos.empezarRapido(true); Sis.ST.capitulo = 7; });
  await sim(30); for (let i = 0; i < 6; i++) { await p.evaluate(() => { while (UI.dlg) UI.saltarDialogo(); }); await sim(20); }
  // mar abierto al oeste de la costa del muelle: profundo y sin obra
  const mar = await p.evaluate(() => {
    const k = Estr.npcs.kaito;   // el punto de mar más cercano a Kaito con 40 m de agua profunda alrededor en línea recta hacia el oeste
    for (let r = 20; r < 300; r += 4) for (let q = 0; q < 24; q++) {
      const an = q / 24 * TAU, x = k.x + Math.cos(an) * r, z = k.z + Math.sin(an) * r; let ok = altura(x, z) < NIVEL_AGUA - 5;
      for (let d = 0; d <= 40 && ok; d += 4) if (altura(x + d, z) > NIVEL_AGUA - 3) ok = false;
      if (ok) return { x, z, yaw: Math.PI / 2 };
    }
    return null;
  });
  comprobar('Hay mar profundo para probar', !!mar, mar);
  const prep = luz => p.evaluate(({ m, luz }) => { while (UI.dlg) UI.saltarDialogo(); __ecos.tele(m.x, m.z); J.y = NIVEL_AGUA - .4; J.vx = J.vz = 0; J.yaw = J.camYaw = m.yaw; J.nadoBloq = false; J.nadoLibre = true; J.nadoRapidoAnt = false; __ecos.tecla('KeyW', false); __ecos.tecla('ShiftLeft', false); Sis.ST.luz = luz === undefined ? Sis.luzMax() : luz; J.tNadoRegen = 9; __ecos.sim(20, 1 / 60); }, { m: mar, luz });
  const medir = (frames, rapido) => p.evaluate(({ frames, rapido }) => {
    __ecos.tecla('KeyW', true); __ecos.tecla('ShiftLeft', !!rapido);
    const l0 = Sis.ST.luz, x0 = J.x, z0 = J.z; let vmax = 0; __ecos.sim(frames, 1 / 60); vmax = J.vel;
    return { nada: J.nada, v: +vmax.toFixed(2), gasto: +(l0 - Sis.ST.luz).toFixed(2), luz: +Sis.ST.luz.toFixed(1), rapido: J.nadoRapido, metros: +Math.hypot(J.x - x0, J.z - z0).toFixed(1) };
  }, { frames, rapido });
  await prep();
  comprobar('Hikari nada en mar abierto', await p.evaluate(() => J.nada), await p.evaluate(() => ({ y: J.y, n: J.nada })));
  const n1 = await medir(90, false);
  comprobar('Nado normal a 3,6 m/s y sin gastar luz', Math.abs(n1.v - 3.6) < .3 && n1.gasto <= 0, n1);
  await prep();
  const r1 = await medir(30, true); const r2 = await medir(60, true);
  comprobar('Nado rápido a 6,8 m/s', Math.abs(r2.v - 6.8) < .5 && r2.rapido, r2);
  const costePlaneo = await p.evaluate(() => (Sis.planeoPlus() ? MOV.planeo.costeMejor : MOV.planeo.coste) * Sis.planeoMult().coste);
  const s90 = Math.round(1.5 * costePlaneo * 100) / 100;
  comprobar('El nado rápido gasta lo mismo por segundo que el planeo', Math.abs((r1.gasto + r2.gasto) - s90) < .8, { gastado: +(r1.gasto + r2.gasto).toFixed(2), esperado: s90, costePlaneo });
  // sin regeneración mientras dura
  await prep(60); const r3 = await medir(60, true);
  comprobar('Durante el sprint no se regenera luz', r3.gasto >= costePlaneo * .9, r3);
  // aviso de poca luz
  await prep(24); const avisos = await p.evaluate(() => { let n = 0; const orig = UI.aviso; UI.aviso = (t, ...r) => { if (/poca luz/.test(t)) n++; return orig.call(UI, t, ...r); }; __ecos.tecla('KeyW', true); __ecos.tecla('ShiftLeft', true); __ecos.sim(120, 1 / 60); UI.aviso = orig; return n; });
  comprobar('Avisa una sola vez de que queda poca luz', avisos === 1, avisos);
  // agotarse: vuelve al nado normal y exige soltar {correr}
  await prep(2); await p.evaluate(() => { __ecos.tecla('KeyW', true); __ecos.tecla('ShiftLeft', true); __ecos.sim(30, 1 / 60); });
  comprobar('Con menos de 12 de luz no arranca el sprint', await p.evaluate(() => !J.nadoRapido && J.vel < 4.2), await p.evaluate(() => ({ luz: Sis.ST.luz, v: J.vel })));
  await prep(13); await p.evaluate(() => { __ecos.tecla('KeyW', true); __ecos.tecla('ShiftLeft', true); __ecos.sim(120, 1 / 60); });
  const agot = await p.evaluate(() => ({ luz: +Sis.ST.luz.toFixed(1), bloq: J.nadoBloq, rapido: J.nadoRapido, v: +J.vel.toFixed(2) }));
  comprobar('Al agotarse la luz baja al nado normal', agot.bloq && !agot.rapido && agot.v < 4.2, agot);
  await p.evaluate(() => { Sis.ST.luz = 40; __ecos.sim(30, 1 / 60); });
  comprobar('Con {correr} aún pulsado no rearma el sprint aunque haya luz', await p.evaluate(() => !J.nadoRapido), await p.evaluate(() => J.nadoBloq));
  await p.evaluate(() => { __ecos.tecla('ShiftLeft', false); __ecos.sim(10, 1 / 60); __ecos.tecla('ShiftLeft', true); __ecos.sim(20, 1 / 60); });
  comprobar('Soltando {correr} y con luz suficiente, se rearma', await p.evaluate(() => J.nadoRapido), await p.evaluate(() => ({ b: J.nadoBloq, l: Sis.ST.luz })));
  // regeneración tras esperar sin sprint
  await prep(30); await p.evaluate(() => { __ecos.tecla('KeyW', false); __ecos.tecla('ShiftLeft', false); __ecos.sim(30, 1 / 60); });
  const l1 = await p.evaluate(() => Sis.ST.luz); await p.evaluate(() => __ecos.sim(120, 1 / 60)); const l2 = await p.evaluate(() => Sis.ST.luz);
  comprobar('Nadando normal la luz vuelve poco a poco', l2 > l1 + 5, { l1, l2 });
  // histéresis: cruzar la orilla despacio no alterna nado y suelo
  const orilla = await p.evaluate(() => {
    const k = Estr.npcs.kaito, a = Estr.muelleAng; const dx = Math.sin(a + 1.2), dz = Math.cos(a + 1.2); let px = k.x, pz = k.z;
    let mejor = null; for (let d = 0; d < 400; d += 1) { const x = k.x + dx * d, z = k.z + dz * d; if (altura(x, z) < NIVEL_AGUA - .3) { mejor = { x, z, dx, dz }; break; } } return mejor;
  });
  if (orilla) {
    const cambios = await p.evaluate(({ o }) => {
      __ecos.tele(o.x - o.dx * 6, o.z - o.dz * 6); J.vx = J.vz = 0; J.yaw = J.camYaw = Math.atan2(o.dx, o.dz); __ecos.tecla('KeyW', true); __ecos.tecla('ShiftLeft', false);
      let c = 0, ant = J.nada; for (let i = 0; i < 900; i++) { __ecos.sim(1, 1 / 60); if (J.nada !== ant) { c++; ant = J.nada; } if (i > 300 && J.nada && Math.hypot(J.x - o.x, J.z - o.z) > 16) break; } __ecos.tecla('KeyW', false); return c;
    }, { o: orilla });
    comprobar('Al entrar en el agua por una orilla, el modo nado cambia una sola vez', cambios <= 1, cambios);
  }
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) { errores.push(e.stack || e.message); }
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
