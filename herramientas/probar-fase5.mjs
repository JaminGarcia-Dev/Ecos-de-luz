// Fase 5 de PLAN_JUEGO (parte de Hikari): dificultades, ventana de parada, esquiva precisa, memoria de órdenes y aviso de derrota.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-fase5'));
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
  const golpe = dif => p.evaluate(dif => {
    AJUSTES.dificultad = dif; J.inv = 0; J.guardia = false; J.vivo = true; Sis.ST.hp = Sis.hpMax(); const h0 = Sis.ST.hp;
    Bus.emit('dañoJugador', { dmg: 10, x: J.x + 1, z: J.z, imparable: true }); const d = h0 - Sis.ST.hp; Sis.ST.hp = Sis.hpMax(); return +d.toFixed(2);
  }, dif);
  const dS = await golpe('sereno'), dE = await golpe('exigente'), dI = await golpe('intenso');
  comprobar('El daño recibido cambia con la dificultad (×0,7 / ×1 / ×1,2)', Math.abs(dS - 7) < .3 && Math.abs(dE - 10) < .3 && Math.abs(dI - 12) < .3, { dS, dE, dI });
  const parar = (dif, t) => p.evaluate(({ dif, t }) => {
    AJUSTES.dificultad = dif; J.inv = 0; J.vivo = true; J.guardia = true; J.guardiaT = t; J.paradaLista = true; J.paradaT = 0; J.yaw = Math.atan2(1, 0); Sis.ST.luz = 50;
    Bus.emit('dañoJugador', { dmg: 10, x: J.x + 1, z: J.z }); const ok = J.paradaT > 0; J.guardia = false; J.paradaT = 0; Sis.ST.hp = Sis.hpMax(); return ok;
  }, { dif, t });
  comprobar('Exigente: parar a 0,15 s de levantar la guardia sí; a 0,20 s ya no', (await parar('exigente', .15)) && !(await parar('exigente', .2)));
  comprobar('Sereno: la ventana de parada es más amplia (0,20 s sí)', await parar('sereno', .2));
  comprobar('Intenso: la ventana de parada es la más corta (0,15 s ya no)', !(await parar('intenso', .15)));
  const esq = (dif, resta) => p.evaluate(({ dif, resta }) => {
    AJUSTES.dificultad = dif; J.vivo = true; J.guardia = false; J.rodando = .1; J.perfecta = false; J.inv = dificultad().invul - resta; Sis.ST.luz = 40; const l0 = Sis.ST.luz;
    Bus.emit('dañoJugador', { dmg: 10, x: J.x + 1, z: J.z }); const g = Sis.ST.luz - l0; J.rodando = 0; J.inv = 0; return +g.toFixed(1);
  }, { dif, resta });
  comprobar('Esquiva precisa desde el principio (sin nivel 7): +4 de luz al esquivar en los primeros 0,1 s', Math.abs((await esq('exigente', .05)) - 4) < .5);
  comprobar('Una esquiva tardía no da luz', (await esq('exigente', .15)) === 0);
  comprobar('La memoria de un ataque pulsado dura 0,16 s', await p.evaluate(() => COMBATE.bufer === .16 && MOV.esquiva.bufer === .15));
  comprobar('La pausa de la parada es de 80 ms y el tope de pausa de impacto 70 ms', await p.evaluate(() => COMBATE.parada.pausa === .08 && Math.max(...COMBATE.peso.pausa) <= .07));
  // la vida y el equilibrio de las Sombras que nacen dependen de la dificultad
  const vida = await p.evaluate(() => { const r = {}; for (const d of ['sereno', 'exigente', 'intenso']) { AJUSTES.dificultad = d; r[d] = +ProgresionEnemiga.capturar('pradera', { nivel: 1, inv: {}, eq: {}, mejoras: {} }).vida.toFixed(3); } AJUSTES.dificultad = 'exigente'; return r; });
  comprobar('La vida de los enemigos nuevos sigue la dificultad (0,9 / 1 / 1,1)', Math.abs(vida.sereno - .9) < .01 && Math.abs(vida.exigente - 1) < .01 && Math.abs(vida.intenso - 1.1) < .01, vida);
  // derrota: avisa de qué pasó y adónde vuelve
  const derrota = await p.evaluate(async () => {
    AJUSTES.dificultad = 'exigente'; const avisos = []; const orig = UI.banner; UI.banner = (t, sub, ...r) => { avisos.push([t, sub]); return orig.call(UI, t, sub, ...r); };
    J.vivo = true; Sis.ST.checkpoint = null; Sis.ST.hp = 1; morir(); await new Promise(r => setTimeout(r, 2000)); __ecos.sim(600, 1 / 60); await new Promise(r => setTimeout(r, 600)); __ecos.sim(300, 1 / 60); UI.banner = orig;
    return { avisos, vivo: J.vivo };
  });
  comprobar('Al caer, un rótulo dice qué pasó, adónde se vuelve y cuántas llamas quedan', derrota.avisos.some(a => /Caíste|Tu luz/.test(a[0]) && /Vuelves/.test(a[1]) && /llamas: \d\/\d/.test(a[1])) && derrota.vivo, derrota);
  await p.evaluate(() => { AJUSTES.dificultad = 'exigente'; });
  // el oni guardián espera a la práctica (tres Sombras comunes rotas) y los consejos salen una sola vez
  const oni = await p.evaluate(async () => {
    const g = Sombras.guardias[0], ST = Sis.ST; ST.frag = [false, false, false, false]; ST.onis = {}; ST.sombrasRotas = 0; ST.consejos = {};
    Sis.dar('katana', 1, true); Cin.activa = false; J.x = g.x + 30; J.z = g.z; J.y = altura(J.x, J.z) + .1;
    __ecos.sim(30, 1 / 60); const antes = !!g.s;
    ST.sombrasRotas = 3; __ecos.sim(30, 1 / 60); const despues = !!g.s;
    const avisos = []; const orig = UI.aviso; UI.aviso = (t, ...r) => { avisos.push(t); return orig.call(UI, t, ...r); };
    J.inv = 0; Bus.emit('dañoJugador', { dmg: 1, x: J.x + 1, z: J.z, s: {} }); Bus.emit('dañoJugador', { dmg: 1, x: J.x + 1, z: J.z, s: {} }); UI.aviso = orig; Sis.ST.hp = Sis.hpMax();
    return { antes, despues, consejos: avisos.filter(a => /esquiva/.test(a)).length };
  });
  comprobar('El oni guardián no despierta sin práctica; con tres Sombras rotas, sí', !oni.antes && oni.despues, oni);
  comprobar('El consejo de esquiva sale una sola vez', oni.consejos === 1, oni);
  // una sola ranura ofensiva: el arma no se cambia con enemigos cerca
  const cambio = await p.evaluate(() => {
    Sis.dar('naginata', 1, true); Sis.equipar('katana'); J.combate = 3; const enCombate = Sis.equipar('naginata'), tras1 = Sis.ST.eq.arma;
    J.combate = 0; const libre = Sis.equipar('naginata'), tras2 = Sis.ST.eq.arma; Sis.equipar('katana'); return { enCombate, tras1, libre, tras2 };
  });
  comprobar('El arma no se cambia en combate; fuera de él, sí', cambio.enCombate === false && cambio.tras1 === 'katana' && cambio.libre === true && cambio.tras2 === 'naginata', cambio);
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) { errores.push(e.stack || e.message); }
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
