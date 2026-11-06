// Fase 4 de PLAN_JUEGO: trepa con intención, obra marcada no escalable, aupar hasta 0,95 m, terreno trepable solo en Sakura, Kiri y Dunas, y habitantes que no se atraviesan.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-fase4'));
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
  // un muro de 4 m en el carril llano de la pradera; {fina} = obra marcada, si no, roca
  const empujar = ({ alto, fina, salto, luz }) => p.evaluate(({ alto, fina, salto, luz }) => {
    while (UI.dlg) UI.saltarDialogo();
    __ecos.tele(60, -100); J.vx = J.vz = 0; J.yaw = J.camYaw = Math.PI / 2; __ecos.sim(30, 1 / 60);
    const x0 = J.x, z0 = J.z, y0 = J.y, suelo = altura(x0 + 2.6, z0), mur = Sol.add(x0 + 3, z0, .4, 6, 0, suelo - 6, suelo + alto);   // el alto se mide desde el suelo junto al muro (la pradera baja hacia él)
    if (fina) mur.fina = true;
    __ecos.tecla('KeyW', true); __ecos.tecla('ShiftLeft', false); let trepo = false, aupo = false, ymax = 0;
    for (let i = 0; i < 150; i++) {
      Sis.ST.luz = luz === undefined ? Sis.luzMax() : luz; __ecos.tecla('Space', !!salto && i > 40);
      __ecos.sim(1, 1 / 60); if (J.trepa) trepo = true; if (J.aupa) aupo = true; ymax = Math.max(ymax, J.y - y0);
    }
    const x = +(J.x - x0).toFixed(1); mur.on = false; __ecos.tecla('KeyW', false); __ecos.tecla('Space', false); __ecos.sim(40, 1 / 60);
    return { trepo, aupo, subio: +ymax.toFixed(1), x };
  }, { alto, fina, salto, luz });
  let r = await empujar({ alto: 12, fina: true, salto: true });
  comprobar('Una pared de obra marcada (casa, templo) no se trepa ni con {saltar} mantenido', !r.trepo && !r.aupo && r.subio < 4.4 && r.x < 3.3, r);
  r = await empujar({ alto: 12, fina: false, salto: false });
  comprobar('Una roca alta no se trepa solo empujando', !r.trepo && r.subio < 4.4 && r.x < 3.3, r);
  r = await empujar({ alto: 12, fina: false, salto: true });
  comprobar('Una roca alta se trepa con {saltar} mantenido contra ella', r.trepo, r);
  r = await empujar({ alto: 12, fina: false, salto: true, luz: 0 });
  comprobar('Sin luz no se trepa', !r.trepo, r);
  r = await empujar({ alto: .7, fina: false, salto: false });
  comprobar('Un resalte de 0,7 m se aupa solo con empujar', r.aupo || r.subio >= .6, r);
  r = await empujar({ alto: 1.3, fina: false, salto: false });
  comprobar('Un resalte de 1,3 m ya no se aupa: hace falta trepar', !r.aupo && !r.trepo, r);
  r = await empujar({ alto: .7, fina: true, salto: false });
  comprobar('Un resalte bajo de obra marcada no se aupa', !r.aupo, r);
  // terreno: pendiente trepable en la pradera frente a Kiri
  const terreno = (x, z, dirx, dirz, b) => p.evaluate(({ x, z, dirx, dirz, b }) => {
    while (UI.dlg) UI.saltarDialogo();
    __ecos.tele(x, z); J.vx = J.vz = 0; J.camYaw = J.yaw = Math.atan2(dirx, dirz); __ecos.sim(20, 1 / 60); __ecos.tecla('KeyW', true); let trepo = false;
    for (let i = 0; i < 160; i++) { Sis.ST.luz = Sis.luzMax(); __ecos.tecla('Space', true); __ecos.sim(1, 1 / 60); if (J.trepa && !trepo && biomaDe(J.x, J.z) === b && biomaDe(J.x + dirx * .6, J.z + dirz * .6) === b) trepo = J.trepa.tipo + '@' + Math.round(J.x) + ',' + Math.round(J.z); }
    __ecos.tecla('KeyW', false); __ecos.tecla('Space', false); __ecos.sim(40, 1 / 60); return { trepo, bioma: J.bioma };
  }, { x, z, dirx, dirz, b });
  // busca una pendiente fuerte de cada bioma permitido y de uno no permitido
  const sitios = await p.evaluate(() => { const s = {}; for (let x = -470; x <= 470; x += 4) for (let z = -470; z <= 470; z += 4) { if (altura(x, z) < 1 || Math.hypot(x, z) > RADIO_ISLA) continue; const q = pendiente(x, z); if (q > 2.2) { const b = biomaDe(x, z); if (!s[b]) { const g = [altura(x + .5, z) - altura(x - .5, z), altura(x, z + .5) - altura(x, z - .5)], l = Math.hypot(g[0], g[1]) || 1; s[b] = { x: x + g[0] / l * -4, z: z + g[1] / l * -4, dx: g[0] / l, dz: g[1] / l }; } } } return s; });
  console.log('sitios con pendiente', JSON.stringify(Object.keys(sitios)));
  for (const b of Object.keys(sitios)) { const S0 = sitios[b]; const t = await terreno(S0.x, S0.z, S0.dx, S0.dz, +b); const permitido = [1, 2, 3].includes(+b); console.log('bioma', b, JSON.stringify(t)); if (permitido) comprobar(`Bioma ${b}: el terreno empinado se trepa con intención `, !!t.trepo, t); else comprobar(`Bioma ${b} (aldeas y lagos): el terreno no se trepa`, !t.trepo, t); }
  // habitantes: no se atraviesan
  const gente = await p.evaluate(() => {
    const ids = Object.keys(Sis.npcs).filter(id => Sis.npcs[id].g.visible && !Sis.ST.ausentes[id]); const id = ids.includes('yuki') ? 'yuki' : ids[0]; const q = Sis.npcs[id].g.position;
    __ecos.tele(q.x - 8, q.z); J.vx = J.vz = 0; J.camYaw = J.yaw = Math.PI / 2; __ecos.sim(20, 1 / 60); __ecos.tecla('KeyW', true); __ecos.tecla('ShiftLeft', true);
    let dmin = 1e9; for (let i = 0; i < 150; i++) { q.x += 0; __ecos.sim(1, 1 / 60); dmin = Math.min(dmin, Math.hypot(J.x - q.x, J.z - q.z)); }
    __ecos.tecla('KeyW', false); __ecos.tecla('ShiftLeft', false); return { id, distanciaMinima: +dmin.toFixed(2) };
  });
  comprobar('Corriendo contra un habitante, Hikari no lo atraviesa (distancia mínima de 0,6 m)', gente.distanciaMinima >= .6, gente);
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) { errores.push(e.stack || e.message); }
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
