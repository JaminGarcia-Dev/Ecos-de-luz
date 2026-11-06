// Prólogo dirigido: capturas, contacto, presupuesto y restauración. Ejecutar en alta, media y baja.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), calidad = arg('calidad', 'alta');
const salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-prologo/' + calidad));
fs.mkdirSync(salida, { recursive: true });
const servidor = http.createServer((q, r) => {
  const f = path.resolve(raiz, '.' + decodeURIComponent(q.url.split('?')[0] === '/' ? '/index.html' : q.url.split('?')[0]));
  if (!f.startsWith(raiz + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html');
  fs.createReadStream(f).pipe(r);
}).listen(0);
await new Promise(r => servidor.once('listening', r));
const navegador = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const pagina = await navegador.newPage({ viewport: { width: 1600, height: 900 } }), pruebas = [], errores = [];
await pagina.addInitScript(calidad => localStorage.setItem('ecos2_ajustes', JSON.stringify({ calidad, maestro: 0 })), calidad);
await pagina.route('**/favicon.ico', r => r.fulfill({ status: 204 }));
pagina.on('pageerror', e => errores.push(e.message));
pagina.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
const comprobar = (nombre, pasa, evidencia) => {
  pruebas.push({ nombre, pasa: !!pasa, evidencia });
  if (!pasa) throw Error(nombre + ': ' + JSON.stringify(evidencia));
};
const foto = async nombre => {
  await pagina.evaluate(() => render());
  await pagina.screenshot({ path: path.join(salida, nombre + '.png') });
};
// Cada paso pasa por el bucle real; la pausa de impacto también debe funcionar con el reloj simulado.
const ir = (plano, t) => pagina.evaluate(([plano, t]) => {
  let n = 0;
  while (Cin.activa && Cin.plano() < plano && n++ < 8000) __ecos.sim(1, 1 / 60);
  while (Cin.activa && Cin.plano() === plano && Cin.estadoPlano().t < t - 1e-8 && n++ < 8000) {
    __ecos.sim(1, Math.min(1 / 60, t - Cin.estadoPlano().t));
  }
  if (!Cin.activa || Cin.plano() !== plano || Math.abs(Cin.estadoPlano().t - t) > .0001) throw Error('No se alcanzó el instante solicitado');
  return { plano: Cin.estadoPlano(), efecto: EscenasInicio.estado() };
}, [plano, t]);
const iniciar = () => pagina.evaluate(() => {
  while (UI.dlg) UI.saltarDialogo();
  G.estado = 'intro'; Sis.ST.inicio.prologo = false; window.__cierres = 0; window.__restaurado = null;
  window.__entrada = __capturar();
  window.__funciones = { taso: Tasogare.actualizar, obra: Estr.actualizar, musica: MusicaInicio.actualizar, texto: UI.subtitulo };
  Cin.intro(() => {
    __cierres++; __restaurado = __capturar();
    window.__funcionesRestauradas = Tasogare.actualizar === __funciones.taso && Estr.actualizar === __funciones.obra &&
      MusicaInicio.actualizar === __funciones.musica && UI.subtitulo === __funciones.texto;
    G.estado = 'juego';
  });
});
const restauracion = () => pagina.evaluate(() => {
  const antes = __entrada, despues = __restaurado, diferencias = [];
  if (!despues) return { diferencias: ['Falta cierre'] };
  // El disco rojo y el progreso son el resultado narrativo. El resto del estado temporal vuelve a su entrada.
  for (const k of Object.keys(antes)) if (JSON.stringify(antes[k]) !== JSON.stringify(despues[k])) diferencias.push(k);
  const grupo = scene.getObjectByName('Prologo_Luna'), fx = EscenasInicio.estado().hilo;
  return { diferencias, funciones: __funcionesRestauradas, cierres: __cierres, grupoOculto: !grupo.visible,
    limpio: fx.halos === 0 && fx.luz === 0 && fx.polvo === 0 && !fx.visible,
    prologo: Sis.ST.inicio.prologo, luna: Atmosfera.aparienciaLunar };
});
const exigirRestauracion = async nombre => {
  const r = await restauracion();
  comprobar(nombre, !r.diferencias.length && r.funciones && r.cierres === 1 && r.grupoOculto && r.limpio && r.prologo && r.luna === 1, r);
};
try {
  await pagina.goto(`http://localhost:${servidor.address().port}/${archivo}`, { timeout: 180000 });
  await pagina.waitForFunction(() => window.__ecos && G.estado === 'portada', null, { timeout: 120000 });
  await pagina.evaluate(() => {
    __ecos.manual(true); __ecos.empezarRapido(true);
    window.__capturar = () => {
      const C = Estr.corazon, L = Estr.corazonLuz, R = Tasogare.root, M = Tasogare.modelo;
      return { cam: [camera.fov, ...camera.position.toArray(), ...camera.quaternion.toArray()],
        ajustes: [Render.ajustes.foco, Render.ajustes.colorLugar, Render.ajustes.desenfoqueObj],
        descriptor: Object.getOwnPropertyDescriptor(Render.ajustes, 'desenfoqueObj').writable,
        cristal: [C.geometry.uuid, C.visible, ...C.scale.toArray(), ...C.quaternion.toArray(), ...C.material.color.toArray()],
        haloCorazon: [L.opacidad, ...L.scale.toArray(), ...L.color.toArray(), Estr.brillo],
        taso: [R.visible, ...R.position.toArray(), ...R.quaternion.toArray(), Tasogare.capa.mesh.visible, M.punta.visible],
        huesos: M.huesos.map(b => [...b.position.toArray(), ...b.quaternion.toArray()]), canales: Tasogare.efectos(),
        capa: [Tasogare.capa.aB, Tasogare.capa.listo, Array.from(Tasogare.capa.p), Array.from(Tasogare.capa.q)],
        actores: [Hikari.root.visible, Lumi.grupo.visible, Object.values(Sis.npcs).map(n => n.g.visible)], lamp: Cin.lamp,
        entorno: ENTORNO.e, interior: ENTORNO.interior, entradaMusica: MUSICA_INICIO.entrada };
    };
  });
  await iniciar();
  comprobar('Nueve planos y 110 s', await pagina.evaluate(() => Cin.estadoPlano().total === 110 && EscenasInicio.planos === 9), null);
  let r = await ir(4, 7); await foto('P5-7s');
  comprobar('Akari visible e hilo continuo en P5', await pagina.evaluate(() => scene.getObjectByName('Akari_prologo').visible) && r.efecto.hilo.visible, r);
  await ir(5, 2.9); await foto('P6-2_90s');
  const antes = await pagina.evaluate(() => ({ raiz: Tasogare.root.position.toArray(), cam: camera.position.toArray() }));
  r = await ir(5, 3.05); await foto('P6-3_05s');
  comprobar('El metal alcanza la cinta a 3 s (error < 3 cm)', r.efecto.hilo.roto && r.efecto.errorContacto < .03, r.efecto);
  const retenido = await pagina.evaluate(() => ({
    cam: camera.position.toArray(), pose: Tasogare.modelo.huesos.map(b => b.quaternion.toArray()),
    hilo: scene.getObjectByName('HiloLuz').children.filter(h => h instanceof Halo).map(h => [h.opacidad, ...h.position.toArray()])
  }));
  await pagina.evaluate(() => __ecos.sim(1, .005));
  const retenido2 = await pagina.evaluate(() => ({
    cam: camera.position.toArray(), pose: Tasogare.modelo.huesos.map(b => b.quaternion.toArray()),
    hilo: scene.getObjectByName('HiloLuz').children.filter(h => h instanceof Halo).map(h => [h.opacidad, ...h.position.toArray()])
  }));
  comprobar('Hit-stop conserva pose, cámara y halos sin parar el reloj', JSON.stringify(retenido) === JSON.stringify(retenido2), null);
  r = await ir(5, 3.5); await foto('P6-3_50s');
  comprobar('El corte conserva la raíz sobre su apoyo', await pagina.evaluate(p => Tasogare.root.position.toArray().every((v, i) => Math.abs(v - p[i]) < 1e-7), antes.raiz), null);
  r = await ir(5, 3.86);
  comprobar('No queda hilo después de 3,85 s', !r.efecto.hilo.visible, r.efecto);
  await ir(5, 4.9);
  comprobar('Akari sigue visible antes de la dispersión', await pagina.evaluate(() => {
    const g = scene.getObjectByName('Akari_prologo'); let visible = false;
    g.traverse(o => { if (o.isSkinnedMesh && o.visible && o.material.opacity > .95) visible = true; }); return g.visible && visible;
  }), null);
  await ir(6, .7); await foto('P7-0_70s');
  await ir(6, 2); await foto('P7-2s');
  const fr = await pagina.evaluate(() => {
    const g = scene.getObjectByName('Prologo_Luna');
    return g.children.filter(o => o instanceof Halo && o.opacidad > .8).length;
  });
  comprobar('Cuatro fragmentos con sus cuatro núcleos', fr === 8, fr);
  await ir(7, 6); await foto('P8-6s');
  comprobar('Disco rojo sin asedio y desenfoque dirigido a cero', await pagina.evaluate(() => Atmosfera.aparienciaLunar === 1 && Atmosfera.nivelRojo === 0 && Render.ajustes.desenfoqueObj === 0), null);
  await pagina.evaluate(() => { let n = 0; while (Cin.activa && n++ < 1500) __ecos.sim(1, 1 / 60); });
  await exigirRestauracion('Restauración completa al terminar');
  // Reproducir el corte dos veces debe reconstruir sus objetos y producir el mismo resultado.
  await iniciar(); await ir(5, 3.5);
  const primero = await pagina.evaluate(() => EscenasInicio.estado());
  await pagina.evaluate(() => Cin.repetir()); await ir(5, 3.5);
  const segundo = await pagina.evaluate(() => EscenasInicio.estado());
  comprobar('Repetir reconstruye el corte sin duplicar efectos ni cierre', Math.abs(primero.errorContacto - segundo.errorContacto) < .01 &&
    JSON.stringify(primero.hilo) === JSON.stringify(segundo.hilo) && await pagina.evaluate(() => __cierres === 0), { primero, segundo });
  // Pausar detiene el tiempo del plano y sus efectos. Las utilidades no usan tiempo real ni setTimeout.
  const pausa = await pagina.evaluate(() => {
    UI.pausado = true; const t = Cin.estadoPlano().t, estado = EscenasInicio.estado(); __ecos.sim(12, 1 / 60);
    const bien = t === Cin.estadoPlano().t && JSON.stringify(estado) === JSON.stringify(EscenasInicio.estado()); UI.pausado = false; return bien;
  });
  comprobar('Pausa conserva reloj y efectos', pausa, null);
  await pagina.evaluate(() => { KEY.Space = true; __ecos.sim(22, .05); KEY.Space = false; });
  await exigirRestauracion('Restauración al omitir después de repetir');
  // Barrido por todos los fotogramas para medir picos, sin confundir el lote global con el presupuesto de la escena.
  await iniciar();
  const picos = await pagina.evaluate(() => {
    const pico = { halos: 0, luz: 0, polvo: 0 }, presupuesto = EscenasInicio.estado().hilo;
    let n = 0;
    while (Cin.activa && n++ < 8000) {
      __ecos.sim(1, 1 / 60); const e = EscenasInicio.estado().hilo, g = scene.getObjectByName('Prologo_Luna'); let halos = 0;
      g.traverse(o => { if (!(o instanceof Halo) || o.opacidad <= 0) return; let a = o; while (a && a.visible && a !== scene) a = a.parent; if (a === scene) halos++; });
      pico.halos = Math.max(pico.halos, halos); pico.luz = Math.max(pico.luz, e.luz); pico.polvo = Math.max(pico.polvo, e.polvo);
    }
    const lote = scene.children.find(o => o.isMesh && o.geometry.attributes.iCol);
    return { pico, presupuesto, capacidad: lote.geometry.attributes.iCol.count, n };
  });
  comprobar('Halos y partículas dentro del presupuesto de calidad', picos.pico.halos <= picos.presupuesto.limite &&
    picos.pico.luz <= picos.presupuesto.maxLuz && picos.pico.polvo <= picos.presupuesto.maxPolvo && picos.capacidad >= 4096, picos);
  await exigirRestauracion('Restauración después del barrido completo');
  // Omitir desde cualquiera de los nueve planos: mismo cierre, sin restos ni métodos sustituidos.
  for (let i = 0; i < 9; i++) {
    await iniciar(); await ir(i, i === 5 ? 3.5 : i === 6 ? 2 : .7);
    await pagina.evaluate(() => { KEY.Space = true; __ecos.sim(22, .05); KEY.Space = false; });
    await exigirRestauracion('Restauración al omitir P' + (i + 1));
  }
  comprobar('Cero errores de consola', errores.length === 0, errores);
} catch (e) {
  errores.push(e.stack || e.message); process.exitCode = 1;
  try { await foto('error'); } catch {}
} finally {
  fs.writeFileSync(path.join(salida, 'resultado.json'), JSON.stringify({ archivo, calidad, pruebas, errores }, null, 2));
  console.log(JSON.stringify({ archivo, calidad, correctas: pruebas.filter(p => p.pasa).length, total: pruebas.length, errores }, null, 2));
  await navegador.close(); await new Promise(r => servidor.close(r));
}
