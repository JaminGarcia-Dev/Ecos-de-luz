// Ecos de Luz · sonda de sólidos: busca obra que se atraviesa.
// Recorre todas las mallas con el material de obra (24-arquitectura.js) y toma sus vértices a la altura del cuerpo
// (de 0,25 a 1,7 m sobre el suelo o el agua, fuera de las cuevas). Los que no están dentro de ningún sólido de Sol
// (con 0,25 m de margen) se juntan en grupos por cercanía. Un grupo sin ningún sólido en su contorno es obra que
// se atraviesa entera; uno «parcial» suele ser un detalle de algo que ya choca (aleros, barandas, adornos).
// Lo que se atraviesa a propósito (nenúfares, juncos, telas) también sale: hay que mirarlo con ?solidos en la URL.
// Uso: node solidos.mjs [--min 15] [--todos]   (--todos: también los parciales)
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const MIN = +arg('min', 15), TODOS = process.argv.includes('--todos');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const srv = http.createServer((q, r) => {
  const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(0);
const nav = await chromium.launch({ executablePath: EDGE, headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const p = await nav.newPage({ viewport: { width: 1280, height: 720 } }), errores = [];
p.on('pageerror', e => errores.push(e.message));
await p.addInitScript(() => { localStorage.clear(); localStorage.setItem('ecos2_ajustes', JSON.stringify({ calidad: 'baja' })); });
await p.goto(`http://localhost:${srv.address().port}/index.html`, { timeout: 180000 });
await p.waitForFunction(() => window.__ecos && __ecos.estado() === 'portada', null, { timeout: 180000 });

const r = await p.evaluate(MIN => {
  __ecos.empezarRapido(true);
  const mat = Arquitectura.material(), v = new THREE.Vector3(), celdas = new Map(); let total = 0, cubiertos = 0;
  scene.traverse(o => {
    if (!o.isMesh || o.material !== mat || !o.visible) return; o.updateMatrixWorld(true);
    const P = o.geometry.attributes.position;
    for (let i = 0; i < P.count; i += 2) {
      v.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld);
      const h = v.y - Math.max(altura(v.x, v.z), NIVEL_AGUA - .4);
      if (h < .25 || h > 1.7 || enCueva(v.x, v.y, v.z) || enCueva(v.x, v.y + 1, v.z)) continue;
      total++; if (Sol.dentro(v.x, v.y, v.z, .25)) { cubiertos++; continue; }
      const k = Math.floor(v.x / 3) + ',' + Math.floor(v.z / 3); let c = celdas.get(k); if (!c) celdas.set(k, c = { n: 0, x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9, y0: 9, y1: 0 });
      c.n++; c.x0 = Math.min(c.x0, v.x); c.x1 = Math.max(c.x1, v.x); c.z0 = Math.min(c.z0, v.z); c.z1 = Math.max(c.z1, v.z); c.y0 = Math.min(c.y0, h); c.y1 = Math.max(c.y1, h);
    }
  });
  const vistos = new Set(), grupos = [], dentro = (s, g) => s.on && s.x + s.r > g.x0 - .5 && s.x - s.r < g.x1 + .5 && s.z + s.r > g.z0 - .5 && s.z - s.r < g.z1 + .5;
  for (const [k, c] of celdas) {
    if (vistos.has(k) || c.n < 6) continue; const cola = [k], g = { n: 0, x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9, y0: 9, y1: 0 }; vistos.add(k);
    while (cola.length) {
      const q = cola.pop(), d = celdas.get(q); g.n += d.n; g.x0 = Math.min(g.x0, d.x0); g.x1 = Math.max(g.x1, d.x1); g.z0 = Math.min(g.z0, d.z0); g.z1 = Math.max(g.z1, d.z1); g.y0 = Math.min(g.y0, d.y0); g.y1 = Math.max(g.y1, d.y1);
      const [a, b] = q.split(',').map(Number); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const kk = (a + i) + ',' + (b + j), e = celdas.get(kk); if (e && e.n >= 6 && !vistos.has(kk)) { vistos.add(kk); cola.push(kk); } }
    }
    if (g.n < MIN) continue;
    const cx = (g.x0 + g.x1) / 2, cz = (g.z0 + g.z1) / 2; let lug = '', ld = 1e9; for (const l of LUGARES) { const d = Math.hypot(l.x - cx, l.z - cz); if (d < ld) { ld = d; lug = l.nom; } }
    grupos.push({ sol: Sol.cajas.filter(s => dentro(s, g)).length + Sol.cols.filter(s => dentro(s, g)).length, n: g.n, c: [Math.round(cx), Math.round(cz)], tam: [+(g.x1 - g.x0).toFixed(1), +(g.z1 - g.z0).toFixed(1)], alto: [+g.y0.toFixed(1), +g.y1.toFixed(1)], cerca: lug + ' (' + Math.round(ld) + ' m)' });
  }
  grupos.sort((a, b) => (a.sol > 0) - (b.sol > 0) || b.n - a.n);
  return { total, cubiertos, grupos };
}, MIN);

console.log(`Vértices a la altura del cuerpo: ${r.total} · dentro de un sólido: ${r.cubiertos} · fuera: ${r.total - r.cubiertos}`);
for (const g of r.grupos) if (!g.sol || TODOS) console.log(`${g.sol ? 'parcial (' + g.sol + ')' : 'SIN SÓLIDO'} · ${g.n} vértices · en ${g.c.join(', ')} · ${g.tam.join(' × ')} m · de ${g.alto[0]} a ${g.alto[1]} m · ${g.cerca}`);
console.log(errores.length ? 'Errores: ' + errores.join(' | ') : 'Sin errores');
await nav.close(); srv.close();
