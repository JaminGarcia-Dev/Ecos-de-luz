// Guardianes del Faro: solidez solo en combate, purificación, liberación y dones.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-guardianes'));
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
  await p.evaluate(() => { __ecos.empezarRapido(true); Sis.ST.capitulo = 7; Sis.dar('katana', 1, true); });
  await sim(30); await p.evaluate(() => { while (UI.dlg) UI.saltarDialogo(); });
  const B = 'Jefes.lista.cerezo';
  // traspasable dormido
  const dorm = await p.evaluate(() => { const B = Jefes.lista.cerezo; J.x = B.x + .3; J.z = B.z; J.y = B.A.y + .1; J.vx = J.vz = 0; Jefes.actualizar && 0; const x0 = J.x; __ecos.sim(20, 1 / 60); return { estado: B.estado, mov: Math.hypot(J.x - x0, 0) }; });
  comprobar('Dormido, el gólem se atraviesa: no aparta a Hikari', dorm.estado === 'dormido' && dorm.mov < .05, dorm);
  // despierta: 0,8 s sin cuerpo, luego la aparta sin saltos
  const desp = await p.evaluate(() => {
    const B = Jefes.lista.cerezo; Sis.ST.inv = Sis.ST.inv || {}; J.x = B.x + .3; J.z = B.z; J.y = B.A.y + .1; Jefes.despertar(B);
    const res = { t: [], saltoMax: 0, solidoAntes: false }; let px = J.x, pz = J.z;
    for (let i = 0; i < 90; i++) { __ecos.sim(1, 1 / 60); const d = Math.hypot(J.x - B.x, J.z - B.z); if (B.t < .7) res.solidoAntes = res.solidoAntes || B.solido; res.saltoMax = Math.max(res.saltoMax, Math.hypot(J.x - px, J.z - pz)); px = J.x; pz = J.z; if (i === 40 || i === 89) res.t.push([+B.t.toFixed(2), +d.toFixed(2), B.solido]); }
    res.rad = B.rad; return res;
  });
  comprobar('Al despertar tarda 0,8 s en tomar peso y aparta a Hikari sin saltos (≤ 14 m/s)', !desp.solidoAntes && desp.saltoMax <= 14 / 60 + .02 && desp.t[1][1] >= desp.rad + .4, desp);
  // el gólem en combate pide permiso al director y avisa con el sonido de su familia de gesto
  const av = await p.evaluate(() => {
    const B = Jefes.lista.marea, S = Sis.ST, nombres = [], o = Sonido.sfx; Sonido.sfx = (n, ...r) => { nombres.push(n); return o.call(Sonido, n, ...r); };
    J.x = B.x + 12; J.z = B.z; J.y = B.A.y + .1; Jefes.despertar(B); J.inv = 999; S.hp = Sis.hpMax(); let ataques = 0, antes = null;
    for (let i = 0; i < 1500; i++) { __ecos.sim(1, 1 / 60); J.inv = 999; S.hp = Sis.hpMax(); if (B.atq && B.atq !== antes) { ataques++; antes = B.atq; } }
    Sonido.sfx = o; Jefes.reiniciar(B, 'muerte');
    return { ataques, avisos: [...new Set(nombres.filter(n => /^aviso/.test(n) || n === 'alerta'))] };
  });
  comprobar('El gólem ataca con permiso del director y cada ataque avisa con su sonido', av.ataques >= 2 && av.avisos.length >= 1 && !av.avisos.includes('alerta'), av);
  // purificar y canalizar: escena, don y estado
  const lib = await p.evaluate(async () => {
    const B = Jefes.lista.cerezo, S = Sis.ST, ev = []; const o = Sis.evento; Sis.evento = e => { ev.push(e); return o.call(Sis, e); };
    Jefes.purificar(B); const tipo1 = Cin.tipo; __ecos.sim(260, 1 / 60); const tras1 = { act: Cin.activa, estado: B.estado };
    Jefes.canalizar(B); const tipo2 = Cin.tipo; let n = 0; while (Cin.activa && n < 1500) { __ecos.sim(10, 1 / 60); n += 10; }
    Sis.evento = o; return { tipo1, tras1, tipo2, frames: n, don: Sis.don('cerezo'), can: S.jefes.cerezo.can, ev: ev.filter(e => /cerezo/.test(e)), act: Cin.activa };
  });
  comprobar('Purificar: escena corta; canalizar: liberación de unos 16 s; llega el don y el evento una vez', lib.tipo1 === 'purificado' && lib.tipo2 === 'guardianLibre' && lib.frames >= 800 && lib.frames <= 1100 && lib.don && lib.can && lib.ev.filter(e => /canal/.test(e)).length === 1 && !lib.act, lib);
  // la semilla de la cueva: desde la loma, la guía lleva a la boca; dentro, a la semilla
  const guia = await p.evaluate(() => {
    const pk = Jefes.PK.find(q => q.id === 'cerezo' && q.pid === 's0'), c = CUEVAS[1], boca = c.pts[0]; pk.on = true; Jefes.st('cerezo').got = 0;
    // todas las demás semillas ya recogidas: la más cercana es la de la cueva
    for (const q of Jefes.PK) if (q.id === 'cerezo' && q !== pk) q.on = false;
    J.x = pk.x; J.z = pk.z; J.y = altura(pk.x, pk.z) + .5; const arriba = Jefes.guia('cerezo', 'items');
    J.y = pk.y - .9; const dentro = Jefes.guia('cerezo', 'items');
    return { subterranea: pk.y < altura(pk.x, pk.z) - 3, arriba, dentro, boca: { x: boca.x, z: boca.z }, pk: { x: pk.x, z: pk.z } };
  });
  comprobar('Desde la loma, la guía de la semilla de la cueva lleva a su boca; dentro, a la semilla', guia.subterranea && Math.hypot(guia.arriba.x - guia.boca.x, guia.arriba.z - guia.boca.z) < .1 && Math.hypot(guia.dentro.x - guia.pk.x, guia.dentro.z - guia.pk.z) < .1, guia);
  // el recuerdo del rito (al integrar el fragmento del Pétalo) devuelve el HUD: mapa, brújula y misión
  const hud = await p.evaluate(() => {
    while (UI.dlg) UI.saltarDialogo(); if (Cin.activa) { for (let i = 0; i < 400 && Cin.activa; i++) __ecos.sim(10, 1 / 60); }
    UI.hud(true); const antes = !document.getElementById('hud').classList.contains('oculto');
    Cin.recuerdo(() => { }, 0); const durante = !document.getElementById('hud').classList.contains('oculto'); for (let i = 0; i < 300 && Cin.activa; i++) __ecos.sim(10, 1 / 60);
    return { antes, durante, despues: !document.getElementById('hud').classList.contains('oculto'), activa: Cin.activa };
  });
  comprobar('Tras el recuerdo del rito, el HUD vuelve (mapa, brújula, misión)', hud.antes && !hud.durante && hud.despues && !hud.activa, hud);
  const dones = await p.evaluate(() => { Sis.darDon('marea'); Sis.darDon('musgoso'); return { nado: Sis.donMult('marea'), planeo: Sis.donMult('musgoso'), otro: Sis.donMult('arena'), repite: Sis.darDon('marea') }; });
  comprobar('Los dones abaratan el nado y el planeo un 3 % y no se repiten', dones.nado === .97 && dones.planeo === .97 && dones.otro === 1 && dones.repite === false, dones);
  await p.evaluate(() => { const B = Jefes.lista.marea; J.x = B.x + 7; J.z = B.z; J.y = B.A.y + .1; Jefes.purificar(B); __ecos.sim(200, 1 / 60); J.x = B.x + 7; J.z = B.z; J.y = B.A.y + .1; Jefes.canalizar(B); __ecos.sim(400, 1 / 60); });
  await foto('liberacion-hilo'); await p.evaluate(() => __ecos.sim(100, 1 / 60)); await foto('liberacion-hikari');
  await p.evaluate(() => { while (Cin.activa) __ecos.sim(30, 1 / 60); });
  await p.evaluate(() => { const B = Jefes.lista.cerezo; J.x = B.x + 8; J.z = B.z; J.y = B.A.y + .1; J.yaw = -Math.PI / 2; J.camYaw = J.yaw; });
  await sim(5); await foto('cerezo-liberado');
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) { errores.push(e.stack || e.message); }
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
