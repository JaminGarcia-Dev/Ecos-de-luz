// Audio real en Edge: continuidad, pausas, carreras de carga y voces optativas.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-parte4/audio'));
fs.mkdirSync(salida, { recursive: true });
const srv = http.createServer((q, r) => {
  const f = path.resolve(raiz, '.' + decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(raiz + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html'); fs.createReadStream(f).pipe(r);
}).listen(0);
await new Promise(r => srv.once('listening', r));
const nav = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true,
  args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const contexto = await nav.newContext({ viewport: { width: 1280, height: 720 } });
await contexto.addInitScript(() => {
  localStorage.clear(); localStorage.setItem('ecos2_ajustes', JSON.stringify({ calidad: 'baja' }));
  const conectar = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d, ...resto) {
    if (d instanceof AudioDestinationNode && !window.__analizador) {
      window.__analizador = this.context.createAnalyser(); __analizador.fftSize = 2048;
      window.__grabacion = this.context.createMediaStreamDestination();
      conectar.call(this, __analizador); conectar.call(this, __grabacion);
    }
    return conectar.call(this, d, ...resto);
  };
  window.__medir = ms => new Promise(res => {
    const b = new Float32Array(__analizador.fftSize); let suma = 0, n = 0, pico = 0, rotos = 0;
    const timer = setInterval(() => { __analizador.getFloatTimeDomainData(b); for (const v of b) { if (!Number.isFinite(v)) rotos++; else { suma += v * v; n++; pico = Math.max(pico, Math.abs(v)); } } }, 20);
    setTimeout(() => { clearInterval(timer); const db = v => v > 0 ? 20 * Math.log10(v) : -99; res({ rms: +db(Math.sqrt(suma / Math.max(1, n))).toFixed(1), pico: +db(pico).toFixed(1), rotos }); }, ms);
  });
  window.__grabar = ms => new Promise(res => { const partes = [], r = new MediaRecorder(__grabacion.stream, { mimeType: 'audio/webm;codecs=opus' }); r.ondataavailable = e => partes.push(e.data); r.onstop = async () => res(Array.from(new Uint8Array(await new Blob(partes).arrayBuffer()))); r.start(); setTimeout(() => r.stop(), ms); });
});
const p = await contexto.newPage(), errores = [], pruebas = [], niveles = [];
p.on('pageerror', e => errores.push(e.message)); p.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
await p.route('**/favicon.ico', r => r.fulfill({ status: 204 }));
const comprobar = (nombre, pasa, evidencia) => { pruebas.push({ nombre, pasa: !!pasa, evidencia }); if (!pasa) throw new Error(nombre + ': ' + JSON.stringify(evidencia)); };
const estado = e => p.evaluate(e => { window.__audioE = e; }, e);
const datos = () => p.evaluate(() => ({ musica: MusicaInicio.depurar(), paisaje: PaisajeSonoro.depurar() }));
const grabar = async (nombre, ms) => { const b = await p.evaluate(ms => __grabar(ms), ms); fs.writeFileSync(path.join(salida, nombre + '.webm'), Buffer.from(b)); };
const medir = async nombre => { const v = await p.evaluate(() => __medir(1800)); niveles.push({ nombre, ...v }); comprobar('Mezcla válida: ' + nombre, !v.rotos && v.pico < -.3, v); return v; };
async function cargar(consulta = '') {
  await p.goto(`http://localhost:${srv.address().port}/${archivo}${consulta}`, { timeout: 180000 });
  await p.waitForFunction(() => window.__ecos && __ecos.estado() === 'portada', null, { timeout: 120000 });
  await p.evaluate(() => { __ecos.manual(true); Sonido.iniciar(); window.__audioE = { portada: true }; window.__audioTimer = setInterval(() => { Sonido.pausar(UI.pausado); const e = __audioE; Sonido.actualizar(1 / 30, e.bioma || 0, e.interior || 0, !!e.noche, e.vel || 0, 20, e.agua || 0, e); }, 1000 / 30); });
  await p.waitForFunction(() => PaisajeSonoro.preparado);
}
try {
  await cargar();
  await p.waitForTimeout(2200); let d = await datos();
  comprobar('Portada recupera generador sin pista cinematográfica', d.musica.original && d.musica.frases > 0 && !d.paisaje.tema && !d.paisaje.temasVivos, d);
  await grabar('01-musica-original', 14000); await medir('portada original');
  const frases = (await datos()).musica.frases;
  for (const plano of [0, 3, 6, 7]) { await estado({ escena: 'intro', plano }); await p.waitForTimeout(120); d = await datos(); comprobar('Continuidad del generador en plano ' + plano, d.musica.original && !d.paisaje.temasVivos && d.musica.frases >= frases, d.musica); }
  await p.evaluate(() => { __ecos.empezarRapido(true); Sis.ST.inicio.nombre = true; });
  await estado({ bioma: 0 }); await p.waitForTimeout(1800); d = await datos();
  comprobar('Exploración usa música contenida y entorno', !d.musica.original && d.musica.activo && d.musica.destino === await p.evaluate(() => MUSICA_INICIO.nivelExplorar) && !d.paisaje.tema, d);
} catch (e) { errores.push(e.stack); }
// El nivel se obtiene del contrato publicado, no de un número duplicado en la prueba.
async function resto() {
  await estado({ bioma: 0, peligro: 1 }); await p.waitForTimeout(300); let d = await datos();
  comprobar('Peligro abre espacio para señales de ataque', d.musica.destino < .2 && !d.paisaje.temasVivos, d.musica);
  await estado({ bioma: 0 });
  await p.evaluate(() => { Piloto.conversar('tsuru'); }); await estado({ bioma: 0, dialogo: true }); await p.waitForTimeout(900); d = await datos();
  comprobar('Leer una conversación baja la música', d.musica.destino < .15, d.musica);
  await p.evaluate(() => { UI.saltarDialogo(); Object.assign(AJUSTES, { musica: 0, efectos: 0, ambiente: .8 }); Sonido.volumen(); }); await estado({ bioma: 0, agua: 1 });
  await p.waitForFunction(() => Object.values(PaisajeSonoro.depurar().ambientes).some(a => a.tramos >= 2), null, { timeout: 36000 }); d = await datos();
  comprobar('El ambiente solapa extremos antes de repetirse', Object.values(d.paisaje.ambientes).some(a => a.tramos >= 2), d.paisaje.ambientes);
  await grabar('03-ambiente-continuo', 5000); await medir('ambiente continuo');
  await estado({ bioma: 0, peligro: 1 });
  await p.evaluate(() => {
    Object.assign(AJUSTES, { musica: .55, efectos: .8, ambiente: .8 }); Sonido.volumen();
    window.__pasosAudio = setInterval(() => Sonido.sfx('paso', { sup: 'tierra' }), 500);
    Sonido.sfx('acecho', { pos: { x: 0, y: 1, z: 8 } });
    setTimeout(() => Sonido.sfx('avisoAtaque'), 2200);
  });
  const fx = grabar('04-pasos-y-aviso', 5000); await p.waitForTimeout(700); await medir('pasos y aviso de ataque'); await fx;
  await p.evaluate(() => clearInterval(__pasosAudio));
  await p.evaluate(() => { Object.assign(AJUSTES, { maestro: 1, musica: 0, efectos: 0, ambiente: 0 }); Sonido.volumen(); });
  await p.waitForTimeout(600); const silencio = await p.evaluate(() => __medir(700)); comprobar('Silenciar música, efectos y ambiente deja salida muda', silencio.pico < -65, silencio);
  await p.evaluate(() => { Object.assign(AJUSTES, { musica: .55, efectos: .8, ambiente: .8, maestro: 0 }); Sonido.volumen(); }); await p.waitForTimeout(400); const maestro = await p.evaluate(() => __medir(600)); comprobar('El volumen maestro silencia todo', maestro.pico < -65, maestro);
  d = await datos(); comprobar('Los recursos de audio se decodifican sin fallos', !d.paisaje.fallos.length, d.paisaje);
  comprobar('Sin temas orquestales en la campaña única', !d.paisaje.temasVivos && !d.paisaje.tema, d.paisaje);
  fs.writeFileSync(path.join(salida, 'recursos.json'), JSON.stringify(d, null, 2));
}
// No continuar con más estados si falla la preparación inicial.
if (!errores.length) { try { await resto(); } catch (e) { errores.push(e.stack); } }
fs.writeFileSync(path.join(salida, 'resultado.json'), JSON.stringify({ archivo, pruebas, niveles, errores }, null, 2));
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, niveles, errores }, null, 2));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
