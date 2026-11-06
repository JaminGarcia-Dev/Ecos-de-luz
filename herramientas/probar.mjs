// Ecos de Luz · banco de pruebas con Edge sin pantalla (GPU real si está disponible).
// Uso: node probar.mjs [--calidad alta|media|baja] [--salida carpeta] [--escenas a,b] [--ancho 1920 --alto 1080] [--sin-fps]
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const flag = k => process.argv.includes('--' + k);
const CALIDAD = arg('calidad', 'alta'), SALIDA = path.resolve(arg('salida', path.join(process.env.TEMP || '/tmp', 'ecos-pruebas', 'salida')));
const ANCHO = +arg('ancho', 1920), ALTO = +arg('alto', 1080);

// escenas: nombre, posición, cámara (giro, inclinación, distancia)
const ESCENAS = [
  { n: 'faro', x: 0, z: 30, yaw: Math.PI, pitch: .25, dist: 7 },
  { n: 'pradera', x: 60, z: -40, yaw: 2.4, pitch: .2, dist: 6.5 },
  { n: 'aldea', x: -80, z: 50, yaw: 4.2, pitch: .2, dist: 7 },
  { n: 'sakura', x: -240, z: -200, yaw: 2.2, pitch: .2, dist: 6.5 },
  { n: 'kiri', x: 250, z: -170, yaw: .6, pitch: .18, dist: 7 },
  { n: 'dunas', x: 220, z: 230, yaw: 4.2, pitch: .2, dist: 7 },
  { n: 'lagos', x: -220, z: 240, yaw: 5.2, pitch: .22, dist: 7 },
  { n: 'gruta', cueva: 1, yaw: 0, pitch: .25, dist: 5 },
  { n: 'cristal', cueva: 0, yaw: 2, pitch: .25, dist: 5 }
];

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  const f = path.join(RAIZ, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const PUERTO = srv.address().port;

const navegador = await chromium.launch({
  executablePath: EDGE, headless: true,
  args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--disable-gpu-vsync', '--disable-frame-rate-limit', '--autoplay-policy=no-user-gesture-required']
});
const pag = await navegador.newPage({ viewport: { width: ANCHO, height: ALTO }, deviceScaleFactor: 1 });
await pag.route('**/favicon.ico', r => r.fulfill({ status: 204 }));
const errores = [];
pag.on('pageerror', e => errores.push('pageerror: ' + e.message));
pag.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });
await pag.addInitScript(c => { try { localStorage.removeItem('ecos2_partida'); localStorage.removeItem('ecos3_luna_partida'); localStorage.setItem('ecos2_ajustes', JSON.stringify({ calidad: c })); } catch (e) { } }, CALIDAD);
if (flag('sin-env')) await pag.addInitScript(() => addEventListener('DOMContentLoaded', () => { THREE.PMREMGenerator.prototype.fromScene = () => ({ texture: null, dispose() { } }); }));
if (flag('programas')) pag.on('load', () => { });
// --perfil: mide cada paso del arranque envolviendo sus funciones
if (flag('perfil')) await pag.addInitScript(() => addEventListener('DOMContentLoaded', () => {
  window.__perfil = [];
  const env = (o, k, n) => { const f = o[k]; o[k] = function () { const t = performance.now(), r = f.apply(this, arguments); window.__perfil.push([n, performance.now() - t, t]); return r; }; };
  for (const k of ['generarMapa', 'crearAgua', 'prepararCuevas', 'trazarCaminos', 'texRuido', 'crearMaterialSuelo']) env(window, k, k);
  for (const [o, n] of [[Atmosfera, 'Atmosfera'], [Flora, 'Flora'], [Estr, 'Estr'], [Hikari, 'Hikari'], [Fauna, 'Fauna'], [Sis, 'Sis'], [Jefes, 'Jefes'], [Render, 'Render'], [Texturas, 'Texturas']])
    for (const k of ['crear', 'init', 'iniciar', 'forzar']) if (typeof o[k] === 'function') env(o, k, n + '.' + k);
  const rc0 = Render.crear; Render.crear = function () { const r = rc0.apply(this, arguments); env(renderer, 'compile', 'renderer.compile'); return r; };
  const rd0 = Render.dibujar; let nd = 0; Render.dibujar = function () { const t = performance.now(), r = rd0.apply(this, arguments); if (nd++ < 3) window.__perfil.push(['dibujar' + nd, performance.now() - t, t]); return r; };
  const ac = window.actualizarChunks; let tc = 0; window.actualizarChunks = function () { const t = performance.now(), r = ac.apply(this, arguments); tc += performance.now() - t; window.__perfil.chunks = tc; return r; };
}));

const t0 = Date.now();
const destinoPrueba = new URL(arg('archivo', 'index.html'), `http://localhost:${PUERTO}/`);
if (!flag('sin-depurar')) destinoPrueba.searchParams.set('depurar', '');
if (arg('campana', null)) destinoPrueba.searchParams.set('campana', arg('campana'));
await pag.goto(destinoPrueba.href);
await pag.waitForFunction(() => window.__ecos && __ecos.estado() === 'portada', null, { timeout: 120000 });
const tCarga = (Date.now() - t0) / 1000;
const gpu = await pag.evaluate(() => { const gl = renderer.getContext(), e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : '?'; });
console.log(`GPU: ${gpu}\nCalidad: ${CALIDAD} · ${ANCHO}x${ALTO} · carga ${tCarga.toFixed(1)} s`);

if (flag('perfil')) console.log('Arranque:', await pag.evaluate(() => window.__perfil.map(([n, t, i]) => `${n} ${t.toFixed(0)} (@${(i/1000).toFixed(1)}s)`).join(' · ') + ` · fin ${(performance.now()/1000).toFixed(1)}s` + ` · chunks ${(window.__perfil.chunks || 0).toFixed(0)} ms`));
if (flag('perfil')) console.log('altura() ×100k:', await pag.evaluate(() => { const t0 = performance.now(); let s = 0; for (let i = 0; i < 1e5; i++) s += altura((i % 400) - 200, (i / 400 | 0) - 125); return (performance.now() - t0).toFixed(0) + ' ms'; }));
if (flag('perfil')) console.log('PROGRAMAS:', await pag.evaluate(() => { const p = renderer.info.programs; const c = {}; for (const q of p) { const k = q.name || q.cacheKey.split(',')[0]; c[k] = (c[k] || 0) + 1; } return p.length + ' → ' + JSON.stringify(c); }));
fs.mkdirSync(SALIDA, { recursive: true });
// --texturas: guarda el mosaico de las texturas procedurales (requiere ?depurar)
if (flag('texturas')) {
  const url = await pag.evaluate(() => Texturas.volcar());
  if (url) { fs.writeFileSync(path.join(SALIDA, 'texturas.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('Texturas guardadas en', path.join(SALIDA, 'texturas.png')); }
}
// --intro: nueva partida con la cinemática completa; FPS por tramos y capturas
if (flag('intro')) {
  await pag.evaluate(() => empezar(true));
  const tramos = [];
  for (let s = 0; s < 62; s += 4) {
    const m = await pag.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(); let u = t0, p = 0; const f = () => { const t = performance.now(); p = Math.max(p, t - u); u = t; n++; if (t - t0 < 3000) requestAnimationFrame(f); else r({ fps: n * 1000 / (t - t0), p }); }; requestAnimationFrame(f); }));
    await pag.screenshot({ path: path.join(SALIDA, `intro-${String(s).padStart(2, '0')}.png`) });
    tramos.push({ s, fps: +m.fps.toFixed(0), 'peor ms': +m.p.toFixed(1), estado: await pag.evaluate(() => __ecos.estado()) });
    await pag.waitForTimeout(1000);
  }
  console.table(tramos);
  console.log(errores.length ? 'ERRORES:\n' + [...new Set(errores)].join('\n') : 'Sin errores de consola');
  await navegador.close(); srv.close(); process.exit(0);
}
await pag.evaluate(() => { __ecos.empezarRapido(true); Sis.ST.capitulo = CAPITULOS.length - 1; });   // todas las regiones abiertas: el Velo no aparta la cámara de las escenas
// Medición de la escena sin diálogos automáticos que cambien la cámara solicitada por el banco.
if (flag('sin-eventos-inicio')) await pag.evaluate(() => {
  Object.assign(Sis.ST.inicio, { nombre: true, hinode: true, momo: true, tsuru: true, hoja: true, rumbo: true, fin: true });
});
if (flag('audio')) {
  await pag.waitForFunction(() => PaisajeSonoro.preparado && PaisajeSonoro.musical, null, { timeout: 30000 });
  const audio = await pag.evaluate(() => {
    const m = Estr.muelleSonido, c = CUEVAS[0], q = c.pts[Math.floor(c.pts.length * .75)];
    const madera = PaisajeSonoro.superficie('tierra', { x: m.x + Math.sin(m.ang) * 24, y: m.y, z: m.z + Math.cos(m.ang) * 24 });
    const cueva = PaisajeSonoro.superficie('nieve', q);
    return { ...PaisajeSonoro.depurar(), madera, cueva, creditos: PaisajeSonoro.creditos().includes('CC BY 4.0') };
  });
  console.log('Audio:', JSON.stringify(audio));
  if (audio.fallos.length || audio.madera !== 'madera' || audio.cueva !== 'piedra' || !audio.creditos) errores.push('La revisión de audio y superficies no pasó');
}
// --e fuerza el momento del día (-1 noche · 0 alba · 1 día pleno)
const E = arg('e', null), PREF = `${CALIDAD}${E !== null ? '-e' + E : ''}`;
if (E !== null) await pag.evaluate(e => { __ecos.Sis.eMundo = () => e; }, +E);
const filtro = arg('escenas', null), lista = filtro ? ESCENAS.filter(e => filtro.split(',').includes(e.n)) : ESCENAS;
const filas = [];
for (const e of lista) {
  await pag.evaluate(e => {
    if (e.cueva !== undefined) { // dentro del túnel, mirando hacia la cámara de la cueva
      const c = CUEVAS[e.cueva], q = c.pts[Math.floor(c.pts.length * .75)];
      __ecos.tele(q.x, q.z); __ecos.J.y = q.y + .05; __ecos.J.vy = 0; e.yaw = Math.atan2(c.dir[0], c.dir[1]);
    } else __ecos.tele(e.x, e.z);
    __ecos.mirar(e.yaw, e.pitch, e.dist);
  }, e);
  if(flag('tasogare'))await pag.evaluate(()=>{Hikari.mostrar(false);Tasogare.mostrar(true);Tasogare.colocar(J.x,J.y,J.z,J.camYaw);Tasogare.pose('reposo',0,true);Tasogare.abrirAlas(false);});
  await pag.waitForTimeout(2500); // deja cargar chunks y vegetación
  let m = { fps: 0, peor: 0 };
  if (!flag('sin-fps')) m = await pag.evaluate(() => new Promise(r => {
    let n = 0; const t0 = performance.now(); let ult = t0, peor = 0;
    const f = () => { const t = performance.now(); peor = Math.max(peor, t - ult); ult = t; n++; if (t - t0 < 3000) requestAnimationFrame(f); else r({ fps: n * 1000 / (t - t0), peor }); };
    requestAnimationFrame(f);
  }));
  // Render acumula la información de todo el fotograma (escena y pases)
  const info = await pag.evaluate(() => new Promise(r => requestAnimationFrame(() => r({ tri: renderer.info.render.triangles, llamadas: renderer.info.render.calls }))));
  await pag.screenshot({ path: path.join(SALIDA, `${PREF}-${e.n}.png`) });
  const dep = await pag.evaluate(() => { try { return Render.depurar(); } catch (er) { return { error: er.message }; } });
  filas.push({ escena: e.n, fps: +m.fps.toFixed(0), 'peor ms': +m.peor.toFixed(1), triángulos: info.tri, llamadas: info.llamadas, lum: dep && dep.lum !== undefined ? +dep.lum.toFixed(3) : '-', exp: dep && dep.exposicion !== undefined ? +dep.exposicion.toFixed(2) : (dep && dep.error) || '-' });
}
console.table(filas);
console.log(errores.length ? 'ERRORES:\n' + [...new Set(errores)].join('\n') : 'Sin errores de consola');
await navegador.close(); srv.close();
