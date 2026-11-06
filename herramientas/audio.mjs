// Ecos de Luz · análisis de la mezcla de audio sin escucharla: nivel (RMS) y pico a la salida (tras el compresor y el
// limitador), cuánto trabaja el limitador y si aparecen valores rotos, en varias situaciones de juego y, en algunas,
// con cada capa sola (música, efectos, ambiente). No sustituye a escucharla, pero detecta saturación, capas que
// tapan a otras y una mezcla demasiado floja. Referencia: explorar en torno a −20/−26 dBFS RMS, picos por debajo de 0.
// Uso: node audio.mjs [--salida carpeta] [--muestras] [--breve] [--estados] [--campana anterior] [--raiz copia-anterior]
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : process.argv[i + 1]; };
const RAIZ = path.resolve(arg('raiz', path.join(path.dirname(fileURLToPath(import.meta.url)), '..')));
const SALIDA = path.resolve(arg('salida', path.join(process.env.TEMP || '/tmp', 'ecos-pruebas', 'salida-audio'))), MUESTRAS = process.argv.includes('--muestras'), BREVE = process.argv.includes('--breve');
fs.mkdirSync(SALIDA, { recursive: true });
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const srv = http.createServer((q, r) => {
  const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(0);
const nav = await chromium.launch({ executablePath: EDGE, headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const p = await nav.newPage({ viewport: { width: 1280, height: 720 } }); const errores = []; p.on('pageerror', e => errores.push(e.message));
await p.addInitScript(() => {
  localStorage.clear(); localStorage.setItem('ecos2_ajustes', JSON.stringify({ calidad: 'baja' }));
  // engancha un analizador a lo que llega al altavoz y guarda el último compresor (el limitador)
  const con = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d, ...r) {
    if (d instanceof AudioDestinationNode) { const c = this.context; if (!c.__an) { c.__an = c.createAnalyser(); c.__an.fftSize = 2048; window.__an = c.__an; c.__grabar = c.createMediaStreamDestination(); window.__destinoGrabacion = c.__grabar; } con.call(this, c.__an); con.call(this, c.__grabar); }
    if (this instanceof DynamicsCompressorNode) window.__comp = this;
    return con.call(this, d, ...r);
  };
  window.__medir = ms => new Promise(res => {
    const a = window.__an, b = new Float32Array(a.fftSize); let s = 0, n = 0, pico = 0, red = 0, rotos = 0;
    const id = setInterval(() => { a.getFloatTimeDomainData(b); for (const v of b) { if (!isFinite(v)) { rotos++; continue; } s += v * v; n++; pico = Math.max(pico, Math.abs(v)); } red = Math.min(red, window.__comp ? window.__comp.reduction : 0); }, 40);
    setTimeout(() => { clearInterval(id); const db = x => x > 0 ? 20 * Math.log10(x) : -99; res({ rms: +db(Math.sqrt(s / Math.max(1, n))).toFixed(1), pico: +db(pico).toFixed(1), lim: +red.toFixed(1), rotos }); }, ms);
  });
  window.__grabar = ms => new Promise(res => {
    const partes = [], r = new MediaRecorder(window.__destinoGrabacion.stream, { mimeType: 'audio/webm;codecs=opus' });
    r.ondataavailable = e => partes.push(e.data);
    r.onstop = async () => res(Array.from(new Uint8Array(await new Blob(partes).arrayBuffer())));
    r.start(); setTimeout(() => r.stop(), ms);
  });
});
await p.goto(`http://localhost:${srv.address().port}/index.html?campana=${arg('campana', 'luna')}`, { timeout: 180000 });
await p.waitForFunction(() => window.__ecos && __ecos.estado() === 'portada', null, { timeout: 180000 });
await p.evaluate(() => { __ecos.empezarRapido(true); __ecos.Sis.ST.hp = 9999; __ecos.Sis.hpMax = () => 9999;
  if (typeof Campana !== 'undefined') Object.assign(Sis.ST.inicio, { nombre: true, hinode: true, momo: true, tsuru: true, hoja: true, rumbo: true, fin: true }); });
await p.waitForTimeout(1500);
if (await p.evaluate(() => typeof PaisajeSonoro !== 'undefined')) await p.waitForFunction(() => PaisajeSonoro.preparado && PaisajeSonoro.musical, null, { timeout: 30000 });
// cada capa sola, con sus volúmenes por defecto
const capas = async () => {
  const o = {};
  for (const [k, aj] of [['todo', null], ['música', { musica: .55, efectos: 0, ambiente: 0 }], ['efectos', { musica: 0, efectos: .8, ambiente: 0 }], ['ambiente', { musica: 0, efectos: 0, ambiente: .8 }]]) {
    await p.evaluate(aj => { window.__aj0 = window.__aj0 || { ...AJUSTES }; Object.assign(AJUSTES, aj || window.__aj0); Sonido.volumen(); }, aj);
    await p.waitForTimeout(400); o[k] = await p.evaluate(() => __medir(3500));
  }
  await p.evaluate(() => { Object.assign(AJUSTES, window.__aj0); Sonido.volumen(); });
  return o;
};
const situaciones = {
  'pradera, día': () => p.evaluate(() => { __ecos.Sis.eMundo = () => 1; __ecos.tele(60, -40); }),
  'pradera, noche': () => p.evaluate(() => { __ecos.Sis.eMundo = () => 0; __ecos.tele(60, -40); }),
  'gruta': () => p.evaluate(() => { __ecos.Sis.eMundo = () => 1; const c = CUEVAS[1], q = c.pts[Math.floor(c.pts.length * .75)]; __ecos.tele(q.x, q.z); __ecos.J.y = q.y + .05; }),
  'eco del faro': () => p.evaluate(() => { __ecos.Sis.eMundo = () => 1; __ecos.tele(0, 11); }),
  'lobos': () => p.evaluate(() => { __ecos.tele(-30, 40); const J = __ecos.J; window.__intv = setInterval(() => { J.combate = 3; __ecos.Sis.ST.hp = 9999; if (!window.__lobos) { window.__lobos = [0, 2].map(k => { const a = __ecos.Fauna.crear('lobo', J.x + Math.sin(k) * 4, J.z + Math.cos(k) * 4, {}); a.estado = 'agresivo'; a.prov = true; return a; }); } if (Math.random() < .3) KEYP.Mouse0 = true; }, 100); }),
  'gólem': () => p.evaluate(() => { clearInterval(window.__intv); for (const a of window.__lobos || []) { a.estado = 'huir'; a.x += 300; } const Je = __ecos.Jefes, B = Je.lista.musgoso; __ecos.tele(B.A.x + 14, B.A.z + 2); Je.despertar(B); window.__intv = setInterval(() => { __ecos.Sis.ST.hp = 9999; __ecos.J.inv = 9; if (Math.random() < .3) KEYP.Mouse0 = true; }, 100); }),
  'diálogo': () => p.evaluate(() => { clearInterval(window.__intv); try { __ecos.Jefes.reiniciar(__ecos.Jefes.lista.musgoso); } catch (e) { } __ecos.tele(-80, 50); UI.dialogo('Abuela Tsuru', ['Hace mucho, este valle brillaba como el alba.', 'Busca los fragmentos, pequeña luz.', 'El faro te espera.'], null, GUION.voces.tsuru); })
};
const filas = [];
for (const [n, f] of Object.entries(situaciones)) {
  if (BREVE && ['eco del faro', 'gólem'].includes(n)) continue;
  await f(); await p.waitForTimeout(2500);
  if (MUESTRAS) {
    const datos = await p.evaluate(() => __grabar(8000)), nombre = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-');
    fs.writeFileSync(path.join(SALIDA, nombre + '.webm'), Buffer.from(datos)); console.log('Grabado:', nombre);
  }
  const c = !BREVE && ['pradera, día', 'lobos', 'gólem'].includes(n) ? await capas() : { todo: await p.evaluate(() => __medir(3500)) };
  for (const [k, v] of Object.entries(c)) filas.push({ situación: n, capa: k, 'RMS dBFS': v.rms, 'pico dBFS': v.pico, 'limitador dB': v.lim, rotos: v.rotos });
}
if (process.argv.includes('--estados')) {
  await p.evaluate(() => { clearInterval(window.__intv); __ecos.manual(true); });
  for (const [nombre, esperado, control] of [
    ['portada', 'hogar', { portada: true }], ['exploración', 'calma', {}], ['acecho', 'misterio', { peligro: 1 }],
    ['combate musical', 'combate', { combate: 1 }], ['prólogo: festival', 'hogar', { escena: 'intro', plano: 1 }],
    ['prólogo: quiebra', 'misterio', { escena: 'intro', plano: 5 }], ['renacer', 'renacer', { escena: 'final', plano: 4 }]
  ]) {
    await p.evaluate(control => {
      clearInterval(window.__audioEstado);
      window.__audioEstado = setInterval(() => Sonido.actualizar(1 / 30, 0, 0, false, 0, 15, 0, control), 1000 / 30);
    }, control);
    await p.waitForFunction(({ id, control }) => {
      if (typeof MusicaInicio !== 'undefined') {
        const m = MusicaInicio.depurar();
        if (control.portada || control.escena === 'intro') return m.activo && m.original;
        return m.activo && !m.original && !PaisajeSonoro.depurar().tema;
      }
      return PaisajeSonoro.depurar().tema === id && PaisajeSonoro.depurar().solicitud === id;
    }, { id: esperado, control }, { timeout: 15000 });
    await p.waitForTimeout(3100);
    if (nombre === 'renacer') await p.evaluate(() => Sonido.sfx('amanecer'));
    const v = await p.evaluate(() => __medir(2000)); filas.push({ situación: nombre, capa: 'partitura', 'RMS dBFS': v.rms, 'pico dBFS': v.pico, 'limitador dB': v.lim, rotos: v.rotos });
    console.log('Estado validado:', nombre, esperado);
  }
  await p.evaluate(() => clearInterval(window.__audioEstado));
}
await p.evaluate(() => { Object.assign(AJUSTES, { musica: 0, efectos: 0, ambiente: 0, voz: 0 }); Sonido.volumen(); });
await p.waitForTimeout(800);
const silencio = await p.evaluate(() => __medir(1500));
const biblioteca = await p.evaluate(() => typeof PaisajeSonoro !== 'undefined' ? PaisajeSonoro.depurar() : null);
fs.writeFileSync(path.join(SALIDA, 'mezcla.json'), JSON.stringify({ filas, silencio, biblioteca, errores }, null, 2));
console.table(filas);
const mal = filas.filter(f => f['pico dBFS'] > -.3 || f.rotos);
console.log(mal.length ? 'AVISO: saturación o valores rotos en ' + mal.map(f => f.situación + '/' + f.capa).join(', ') : 'Sin saturación ni valores rotos');
console.log(errores.length ? 'ERRORES:\n' + [...new Set(errores)].join('\n') : 'Sin errores de consola');
console.log('Silenciar música, efectos, ambiente y voz:', silencio);
if (biblioteca) console.log('Biblioteca:', biblioteca);
if (mal.length || errores.length || silencio.pico > -65 || biblioteca && biblioteca.fallos.length) process.exitCode = 1;
await nav.close(); srv.close();
