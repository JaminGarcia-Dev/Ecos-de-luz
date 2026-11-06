// Ecos de Luz · comparación A/B del coste de GPU entre dos versiones del juego, resistente al ruido del equipo.
// Abre las dos versiones a la vez en el mismo sitio y se turnan cada ~1,4 s (la otra en pausa), así la deriva
// térmica, la batería o los programas en segundo plano afectan a las dos por igual. Mide el tiempo de GPU de
// la escena (EXT_disjoint_timer_query) a resolución fija y da la mediana de cada una.
// Uso: node comparar.mjs <carpeta B> [--a carpeta A] [--sitios "cueva1;x,z,giro;…"] [--rondas 6] [--calidad alta]
//   A es por defecto este proyecto; B suele ser una copia anterior (index.html, css y js). Sitio: cuevaN o x,z,giro.
//   Para calibrar, compara una carpeta consigo misma: la diferencia debería quedar en ±3 %. La página que se abre
//   primero rinde hasta un 15 % más: por eso se mide en dos tandas (abriendo antes A y luego antes B) y se combinan.
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const B = process.argv[2] && !process.argv[2].startsWith('--') ? path.resolve(process.argv[2]) : null;
if (!B) { console.error('Uso: node comparar.mjs <carpeta B> [--a carpeta A] [--sitios "…"] [--rondas 6] [--calidad alta]'); process.exit(1); }
const A = path.resolve(arg('a', RAIZ)), SITIOS = arg('sitios', 'cueva1;0,11,3.64;-80,50,4.2;60,-40,2.4;250,-170,.6').split(';');
const RONDAS = +arg('rondas', 6), CALIDAD = arg('calidad', 'alta');
const CON_TASOGARE = process.argv.includes('--tasogare');
const SIN_EVENTOS_INICIO = process.argv.includes('--sin-eventos-inicio');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const servidor = raiz => http.createServer((q, r) => {
  const f = path.join(raiz, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(0);
const sA = servidor(A), sB = servidor(B);
const nav = await chromium.launch({ executablePath: EDGE, headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-webgl-draft-extensions', '--enable-privileged-webgl-extensions', '--disable-gpu-vsync', '--disable-frame-rate-limit', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'] });
const errores = [];

const abrir = async srv => {
  const ctx = await nav.newContext({ viewport: { width: 1920, height: 1080 } }), p = await ctx.newPage(); p.ctx = ctx;
  p.on('pageerror', e => errores.push(e.message));
  await p.addInitScript(c => { localStorage.clear(); localStorage.setItem('ecos2_ajustes', JSON.stringify({ calidad: c })); }, CALIDAD);
  await p.goto(`http://localhost:${srv.address().port}/index.html`, { timeout: 180000 });
  await p.waitForFunction(() => window.__ecos && __ecos.estado() === 'portada', null, { timeout: 180000 });
  await p.evaluate(sinEventos => {
    CAL.escalaMin = 1; __ecos.empezarRapido(true);   // sin resolución dinámica: las dos a la misma resolución
    if (sinEventos && typeof Campana !== 'undefined') Object.assign(Sis.ST.inicio, { nombre: true, hinode: true, momo: true, tsuru: true, hoja: true, rumbo: true, fin: true });
    const gl = renderer.getContext(), ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    const r0 = renderer.render.bind(renderer), pend = [], G_ = window.__gpu = { t: 0, n: 0 };
    renderer.render = (s, c) => { if (s !== scene || !ext) return r0(s, c); const q = gl.createQuery(); gl.beginQuery(ext.TIME_ELAPSED_EXT, q); r0(s, c); gl.endQuery(ext.TIME_ELAPSED_EXT); pend.push(q); };
    const leer = () => { for (let i = pend.length - 1; i >= 0; i--) { const q = pend[i]; if (gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) { G_.t += gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6; G_.n++; gl.deleteQuery(q); pend.splice(i, 1); } } requestAnimationFrame(leer); };
    leer();
  }, SIN_EVENTOS_INICIO);
  return p;
};
const ir = (p, d) => p.evaluate(({d,tasogare}) => {
  G.manual = false;
  if (d.startsWith('cueva')) { const c = CUEVAS[+d.slice(5)], q = c.pts[Math.floor(c.pts.length * .75)]; __ecos.tele(q.x, q.z); __ecos.J.y = q.y + .05; __ecos.J.vy = 0; __ecos.mirar(Math.atan2(c.dir[0], c.dir[1]), .25, 5); }
  else { const [x, z, y] = d.split(',').map(Number); __ecos.tele(x, z); __ecos.mirar(y, .2, 6.5); }
  if(tasogare){Hikari.mostrar(false);Tasogare.mostrar(true);Tasogare.colocar(J.x,J.y,J.z,J.camYaw);Tasogare.pose('reposo',0,true);Tasogare.abrirAlas(false);}
}, {d,tasogare:CON_TASOGARE});

/* la página que se abre primero rinde más (hasta un 15 %): se mide en dos tandas, una abriendo antes A y otra antes B,
   y se combinan (media geométrica de la proporción de cada tanda) */
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
const res = {};   // sitio → [{ a, b }] por tanda
for (const primeroA of [true, false]) {
  const p1 = await abrir(primeroA ? sA : sB), p2 = await abrir(primeroA ? sB : sA), pA = primeroA ? p1 : p2, pB = primeroA ? p2 : p1;
  for (const s of SITIOS) {
    await ir(pA, s); await ir(pB, s); await pA.waitForTimeout(3000);
    const tA = [], tB = [];
    // el orden se alterna en cada ronda: la versión que se mide justo después de la otra no parte siempre con ventaja
    for (let r = 0; r < RONDAS; r++) for (const [p, q, t] of r % 2 ? [[pB, pA, tB], [pA, pB, tA]] : [[pA, pB, tA], [pB, pA, tB]]) {
      await q.evaluate(() => { G.manual = true; }); await p.evaluate(() => { G.manual = false; });
      await p.waitForTimeout(500); await p.evaluate(() => { __gpu.t = 0; __gpu.n = 0; }); await p.waitForTimeout(900);
      t.push(await p.evaluate(() => __gpu.t / Math.max(1, __gpu.n)));
    }
    (res[s] = res[s] || []).push({ a: med(tA), b: med(tB) });
  }
  await p1.ctx.close(); await p2.ctx.close();
}
const filas = SITIOS.map(s => {
  const [t1, t2] = res[s], k = Math.sqrt(t1.a / t1.b * (t2.a / t2.b));
  return { sitio: s, 'A ms': +((t1.a + t2.a) / 2).toFixed(2), 'B ms': +((t1.b + t2.b) / 2).toFixed(2), 'A frente a B': ((k - 1) * 100).toFixed(1) + ' %', 'por tanda (A antes / B antes)': [t1, t2].map(t => ((t.a / t.b - 1) * 100).toFixed(1)).join(' / ') };
});
console.log(`A: ${A}\nB: ${B}`); console.table(filas);
console.log(errores.length ? 'ERRORES:\n' + [...new Set(errores)].join('\n') : 'Sin errores de consola');
if (arg('salida', null)) { const salida = path.resolve(arg('salida')); fs.mkdirSync(salida, { recursive: true }); fs.writeFileSync(path.join(salida, 'comparacion.json'), JSON.stringify({ A, B, calidad: CALIDAD, rondas: RONDAS, sinEventosInicio: SIN_EVENTOS_INICIO, filas, res, errores }, null, 2)); }
await nav.close(); sA.close(); sB.close();
