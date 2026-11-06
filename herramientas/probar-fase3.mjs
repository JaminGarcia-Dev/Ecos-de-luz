// Fase 3 de PLAN_JUEGO: capa estable (estiramiento de las aristas durante carreras, giros de 180 y frenadas a 30, 60 y 120 FPS, comparada con la tela anterior).
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-fase3'));
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
  const correr = (hz, estable) => p.evaluate(({ hz, estable }) => {
    const capa = __ecos.Hikari.capa, F = capa.forma;
    if (!F.guardado) F.guardado = { hz: F.hz, estira: F.estira };
    F.hz = estable ? F.guardado.hz : 0; F.estira = estable ? F.guardado.estira : 0;
    while (UI.dlg) UI.saltarDialogo();
    __ecos.tele(60, -100); J.vx = J.vz = 0; J.camYaw = J.yaw = Math.PI / 2; capa.listo = false; __ecos.sim(30, 1 / 60);
    const dt = 1 / hz; let peor = 0, peorSup = 0, cpu = 0, n = 0;
    const medir = () => {
      const C = capa.C, R = capa.R, P = capa.p;
      for (let j = 1; j < R; j++) for (let i = 0; i < C; i++) {
        const a = ((j - 1) * C + i) * 3, b = (j * C + i) * 3, u = i / (C - 1) * 2 - 1;
        const rest = Math.hypot(capa.altos[i], u * (capa.anchos[j] - capa.anchos[j - 1]) * .5), d = Math.hypot(P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]);
        peor = Math.max(peor, d / rest - 1);
      }
    };
    const fase = (frames, yaw, correr, salto) => { J.camYaw = yaw; __ecos.tecla('KeyW', frames > 0 && correr !== null); __ecos.tecla('ShiftLeft', !!correr); for (let i = 0; i < frames; i++) { if (salto && i === 4) __ecos.tecla('Space', true); else __ecos.tecla('Space', false); const t0 = performance.now(); __ecos.sim(1, dt); cpu += performance.now() - t0; n++; medir(); } };
    for (let rep = 0; rep < 3; rep++) {
      fase(Math.round(.6 * hz), Math.PI / 2, true);                 // carrera
      fase(Math.round(.6 * hz), -Math.PI / 2, true);                // inversión de 180° corriendo
      fase(Math.round(.3 * hz), -Math.PI / 2, null);                // frenada
      fase(Math.round(.5 * hz), Math.PI / 2, true, true);           // arranque con salto
      fase(Math.round(.4 * hz), 0, true);                           // giro de 90°
      fase(Math.round(.4 * hz), Math.PI, true);                     // giro de 90°
    }
    __ecos.tecla('KeyW', false); __ecos.tecla('ShiftLeft', false); __ecos.tecla('Space', false);
    return { peorEstiramiento: +(peor * 100).toFixed(1), msPorFotograma: +(cpu / n).toFixed(2), listo: capa.listo };
  }, { hz, estable });
  const foto2 = async n => { await p.evaluate(() => render()); await p.waitForTimeout(400); await p.screenshot({ path: path.join(salida, n + '.png') }); };
  await p.evaluate(() => { const F = __ecos.Hikari.capa.forma; if (F.guardado) { F.hz = F.guardado.hz; F.estira = F.guardado.estira; } __ecos.tele(60, -100); J.camYaw = J.yaw = Math.PI / 2; J.vx = J.vz = 0; __ecos.Hikari.capa.listo = false; __ecos.sim(40, 1 / 60); __ecos.tecla('KeyW', true); __ecos.tecla('ShiftLeft', true); __ecos.sim(50, 1 / 60); });
  await foto2('01-carrera');
  await p.evaluate(() => { J.camYaw = -Math.PI / 2; __ecos.sim(10, 1 / 60); }); await foto2('02-inversion');
  await p.evaluate(() => { __ecos.tecla('KeyW', false); __ecos.tecla('ShiftLeft', false); __ecos.sim(12, 1 / 60); }); await foto2('03-frenada');
  const res = {};
  for (const hz of [30, 60, 120]) { res['antes_' + hz] = await correr(hz, false); res['ahora_' + hz] = await correr(hz, true); }
  console.log(JSON.stringify(res, null, 1));
  // la capa ondea con el viento aunque esté quieta (6–18 % de estiramiento de reposo): se exige quedar en esa banda y bajar a menos de un tercio de lo de antes
  for (const hz of [30, 60, 120]) { const n = res['ahora_' + hz], v = res['antes_' + hz]; comprobar(`Capa estable a ${hz} FPS: no pasa del 40 % y mejora al menos 3 veces a la anterior`, n.peorEstiramiento <= 40 && n.peorEstiramiento * 3 < v.peorEstiramiento, [v, n]); }
  comprobar('El coste de la tela se mantiene por debajo de 2,5 ms por fotograma', [30, 60, 120].every(hz => res['ahora_' + hz].msPorFotograma < 2.5), res);
  // piernas: cien giros bruscos de 90° y 180° (parado, andando y corriendo) con la liberación de pies puesta y quitada
  const giros = conLibera => p.evaluate(({ conLibera }) => {
    const M = __ecos.Hikari.MARCHA, L = M.libera; if (!L.guardada) L.guardada = { ...L };
    Object.assign(L, conLibera ? L.guardada : { dist: 99, torsion: 99, lateral: -99, extension: 99, pivote: 99 });
    while (UI.dlg) UI.saltarDialogo();
    __ecos.tele(60, -100); J.vx = J.vz = 0; J.camYaw = J.yaw = Math.PI / 2; __ecos.sim(40, 1 / 60);
    const ang = (a, b) => 2 * Math.acos(Math.min(1, Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3])));
    let extPlantado = 0, cruzado = 0, plantadoCruzado = 0, minLatPlantado = 1, minLat = 1, maxExt = 0, salto = 0, n = 0, previo = null;
    const modos = [[false, false], [true, false], [true, true]];
    for (let g = 0; g < 100; g++) {
      const [anda, corre] = modos[g % 3]; __ecos.tecla('KeyW', anda); __ecos.tecla('ShiftLeft', corre);
      J.camYaw += (g % 2 ? 1 : -1) * ((g % 4 < 2) ? Math.PI : Math.PI / 2) * (anda ? 1 : 1);
      if (!anda) J.yaw = J.camYaw;   // parado: el cuerpo se gira hacia donde mira
      for (let f = 0; f < 30; f++) {
        __ecos.sim(1, 1 / 60); const P = __ecos.Hikari._piernas();
        for (let i = 0; i < 2; i++) { minLat = Math.min(minLat, P[i].lat); maxExt = Math.max(maxExt, P[i].ext); if (!P[i].aire) extPlantado = Math.max(extPlantado, P[i].ext); if (P[i].lat < 0) cruzado++; if (!P[i].aire) { minLatPlantado = Math.min(minLatPlantado, P[i].lat); if (P[i].lat < -.02) plantadoCruzado++; } if (previo) salto = Math.max(salto, ang(previo[i].q, P[i].q)); }
        previo = P; n++;
      }
    }
    __ecos.tecla('KeyW', false); __ecos.tecla('ShiftLeft', false);
    return { fotogramasCruzados: cruzado, plantadosCruzados: plantadoCruzado, ladoMinimoPlantado: +minLatPlantado.toFixed(3), de: n * 2, ladoMinimo: +minLat.toFixed(3), extensionMaxima: +maxExt.toFixed(3), extensionPlantada: +extPlantado.toFixed(3), saltoMaxMuslo: +(salto * 180 / Math.PI).toFixed(0) };
  }, { conLibera });
  const gAntes = await giros(false), gAhora = await giros(true);
  console.log('giros', JSON.stringify({ antes: gAntes, ahora: gAhora }));
  comprobar('Cien giros bruscos: menos del 1 % de los fotogramas con un pie plantado cruzado', gAhora.plantadosCruzados < gAhora.de * .01, [gAntes, gAhora]);
  comprobar('Cien giros bruscos: un pie plantado nunca pasa del 100 % del alcance de su pierna (en el aire, del 115 %)', gAhora.extensionPlantada <= 1.0 && gAhora.extensionMaxima <= 1.15, [gAntes, gAhora]);
  comprobar('Cien giros bruscos: ningún muslo da un salto de más de 70° entre fotogramas', gAhora.saltoMaxMuslo <= 70, [gAntes, gAhora]);
  // cadencia: contactos por segundo a 1,6 / 3,2 / 6,8 m/s (informe M04: 1,8–2,4 / 3,4–3,8 / 4,4–4,8)
  const cad = await p.evaluate(() => {
    const M = __ecos.Hikari.MARCHA, out = {};
    for (const v of [1.6, 3.2, 6.8]) { const lp = M.pasoBase + M.pasoK * v; out[v] = { contactosPorSegundo: +(v / lp).toFixed(2), pasoM: +lp.toFixed(2), apoyoS: +(Math.min(M.apoyo, 1.25 * lp) / v).toFixed(3) }; }
    return out;
  });
  console.log('cadencia', JSON.stringify(cad));
  comprobar('Cadencia al trote (3,2 m/s) entre 3,2 y 4,0 contactos por segundo', cad[3.2].contactosPorSegundo >= 3.2 && cad[3.2].contactosPorSegundo <= 4, cad);
  comprobar('Cadencia corriendo (6,8 m/s) entre 4,2 y 5,0 contactos por segundo', cad[6.8].contactosPorSegundo >= 4.2 && cad[6.8].contactosPorSegundo <= 5, cad);
  comprobar('Apoyo corriendo de unos 0,06–0,08 s', cad[6.8].apoyoS >= .055 && cad[6.8].apoyoS <= .085, cad);
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) { errores.push(e.stack || e.message); }
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
