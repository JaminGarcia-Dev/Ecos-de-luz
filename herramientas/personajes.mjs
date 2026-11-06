// Capturas comparables y revisión de animación de personajes con la GPU real.
// node herramientas/personajes.mjs [--raiz copia-anterior] [--salida carpeta] [--calidad alta|media|baja]
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : process.argv[i + 1]; };
const raiz = path.resolve(arg('raiz', path.join(path.dirname(fileURLToPath(import.meta.url)), '..')));
const salida = path.resolve(arg('salida', path.join(process.env.TEMP || '/tmp', 'ecos-pruebas', 'salida-personajes/despues')));
const calidad = arg('calidad', 'alta'), errores = [], resultado = { calidad, capturas: [], animaciones: [] };
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const servidor = http.createServer((req, res) => {
  const f = path.resolve(raiz, '.' + decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (path.relative(raiz, f).startsWith('..') || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => servidor.listen(0, '127.0.0.1', r));
fs.mkdirSync(salida, { recursive: true });
let navegador;
try {
  navegador = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true,
    args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--disable-gpu-vsync', '--disable-frame-rate-limit', '--autoplay-policy=no-user-gesture-required'] });
  const pagina = await navegador.newPage({ viewport: { width: 1600, height: 1000 } });
  pagina.on('pageerror', e => { errores.push(e.message); console.error(e.message); });
  pagina.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
  await pagina.route('**/favicon.ico', r => r.fulfill({ status: 204 }));
  await pagina.addInitScript(c => { localStorage.clear(); localStorage.setItem('ecos2_ajustes', JSON.stringify({ calidad: c })); }, calidad);
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/index.html?depurar`);
  await pagina.waitForFunction(() => window.__ecos && __ecos.estado() === 'portada', null, { timeout: 180000 });
  resultado.gpu = await pagina.evaluate(() => { const gl = renderer.getContext(), ex = gl.getExtension('WEBGL_debug_renderer_info'); return ex ? gl.getParameter(ex.UNMASKED_RENDERER_WEBGL) : 'desconocida'; });
  console.log('Carga terminada:', resultado.gpu);
  await pagina.evaluate(() => { __ecos.empezarRapido(true); Sis.eMundo = () => 0; __ecos.tele(0, 26); });
  await pagina.waitForTimeout(3500);
  await pagina.evaluate(() => { __ecos.manual(true); UI.hud(false); UI.fundido(0, 0); Lumi.grupo.visible = false; });
  await pagina.addStyleTag({ content: '#banner,#aviso,#subtitulo,#interactuar { visibility:hidden !important; }' });
  const captura = async (nombre, datos) => {
    await pagina.evaluate(datos => {
      const p = Hikari.root.position;
      if (datos.tipo === 'hikari') {
        Hikari.mostrar(true); Hikari.root.rotation.y = 0;
        Hikari.reiniciarTela();
        for (let i = 0; i < 120; i++) Hikari.animar(1 / 60, { suelo: !datos.planeo, planeo: !!datos.planeo, luz: 1, giro: 0, vy: 0, vel: datos.planeo ? 6 : 0, vz: datos.planeo ? 6 : 0 });
        const a = datos.detras ? Math.PI : .35;
        camera.position.set(p.x + Math.sin(a) * 2.5, p.y + 1.1, p.z + Math.cos(a) * 2.5);
        camera.lookAt(p.x, p.y + .65, p.z);
      } else if (datos.tipo === 'habitantes') {
        Hikari.mostrar(false);
        window.__modelosRevision = Object.entries(FICHAS_NPC).map(([id, cfg], i) => {
          const n = Gente.crear({ ...cfg, nombre: '', rutina: { tipo: 'quieto' } });
          n.g.position.set(p.x + (i - 2) * .95, p.y, p.z); scene.add(n.g);
          for (let j = 0; j < 90; j++) n.actualizar(1 / 60, p.x + (i - 2) * .95, p.z + 4);
          return n;
        });
        camera.position.set(p.x + .15, p.y + 1.45, p.z + 5); camera.lookAt(p.x, p.y + .85, p.z);
      } else {
        Hikari.mostrar(false);
        for (const n of window.__modelosRevision || []) n.g.visible = false;
        Tasogare.mostrar(true); Tasogare.colocar(p.x, p.y, p.z, 0); Tasogare.pose('reposo', 6, true);
        for (let j = 0; j < 90; j++) Tasogare.actualizar(1 / 60);
        camera.position.set(p.x + 2, p.y + 1.7, p.z + 4); camera.lookAt(p.x, p.y + 1.2, p.z);
      }
      camera.updateMatrixWorld(true); seguirLuces(p.x, p.y, p.z); Render.dibujar();
    }, datos);
    await pagina.screenshot({ path: path.join(salida, nombre + '.png') }); resultado.capturas.push(nombre);
  };
  await captura('hikari-frente', { tipo: 'hikari' });
  await captura('hikari-capa', { tipo: 'hikari', detras: true });
  await pagina.evaluate(() => aplicarEntorno(-1, 0));
  await captura('hikari-noche', { tipo: 'hikari' });
  await pagina.evaluate(() => aplicarEntorno(0, 0));
  await captura('habitantes', { tipo: 'habitantes' });
  await captura('tasogare', { tipo: 'tasogare' });
  resultado.animaciones = await pagina.evaluate(() => {
    Tasogare.mostrar(false); Hikari.mostrar(true);
    const p = Hikari.root.position.clone();
    const estados = [ ['reposo', {}], ['marcha', { suelo: true, vel: MOV.vel.andar, vz: MOV.vel.andar }], ['carrera', { suelo: true, vel: MOV.vel.correr, vz: MOV.vel.correr }],
      ['salto', { suelo: false, vy: 5 }], ['planeo', { suelo: false, planeo: true, vel: 6, vz: 6, giro: .5 }],
      ['aterrizaje', { suelo: true, impacto: 8 }], ['guardia', { guardia: true, armaFuera: true, armado: true }],
      ['canalizar', { canal: true }], ['esquiva', { suelo: false, rodando: .5 }], ['herido', { herido: .5 }], ['derrota', { derribo: .5 }] ];
    const revisar = () => {
      let valido = true;
      Hikari.root.traverse(o => {
        if (![...o.position.toArray(), ...o.quaternion.toArray()].every(Number.isFinite)) valido = false;
        if (o.geometry && !o.geometry.attributes.position.array.every(Number.isFinite)) valido = false;
      });
      return valido && Hikari.capa.p.every(Number.isFinite);
    };
    const r = estados.map(([nombre, estado]) => {
      Hikari.reiniciarTela(); const inicio = performance.now();
      for (let i = 0; i < 120; i++) {
        const t = i / 60; U.uT.value += 1 / 60;
        Hikari.mover(p.x, p.y + (estado.planeo ? 2 : 0), p.z + (estado.vz || 0) * t, 0);
        Hikari.animar(1 / 60, { suelo: true, luz: 1, giro: 0, vy: 0, vel: 0, ...estado });
      }
      return { nombre, valido: revisar(), cpuMs: +( (performance.now() - inicio) / 120).toFixed(3), anchoCapa: +Hikari.capa.aB.toFixed(3) };
    });
    // Una pausa larga y un teletransporte no deben producir tela inválida ni huesos fuera de rango.
    Hikari.mover(p.x + 80, p.y, p.z, Math.PI); Hikari.reiniciarTela();
    Hikari.animar(.5, { suelo: true, luz: 1, giro: 0, vy: 0, vel: 0 });
    r.push({ nombre: 'teletransporte y pausa', valido: revisar() });
    Hikari.mover(p.x, p.y + 2, p.z, 0); Hikari.reiniciarTela();
    for (let i = 0; i < 120; i++) Hikari.animar(1 / 60, { suelo: false, planeo: true, luz: 1, giro: 0, vy: 0, vel: 6, vz: 6 });
    return r;
  });
  await captura('hikari-planeo', { tipo: 'hikari', detras: true, planeo: true });
  resultado.programas = await pagina.evaluate(() => renderer.info.programs.length);
  resultado.prologo = await pagina.evaluate(() => {
    for (const n of window.__modelosRevision || []) scene.remove(n.g);
    let terminado = false, pasos = 0;
    Cin.intro(() => { terminado = true; });
    while (Cin.activa && pasos < 6000) {
      U.uT.value += 1 / 30; Cin.actualizar(1 / 30); pasos++;
      if (pasos % 90 === 0) Render.dibujar();
    }
    return { terminado, segundosSimulados: +(pasos / 30).toFixed(1), camaraValida: camera.position.toArray().every(Number.isFinite) };
  });
  resultado.errores = [...new Set(errores)];
  fs.writeFileSync(path.join(salida, 'resultado.json'), JSON.stringify(resultado, null, 2));
  console.log(JSON.stringify(resultado, null, 2));
  if (errores.length || resultado.animaciones.some(a => !a.valido) || !resultado.prologo.terminado || !resultado.prologo.camaraValida) process.exitCode = 1;
} finally {
  if (navegador) await navegador.close();
  await new Promise(r => servidor.close(r));
}
