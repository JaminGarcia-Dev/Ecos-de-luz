// Recorrido funcional de la campaña nueva, continuidad y convivencia con una partida anterior.
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-parte3/funcional'));
const archivo = arg('archivo', 'index.html'), calidad = arg('calidad', 'alta');
fs.mkdirSync(salida, { recursive: true });
const servidor = http.createServer((req, res) => {
  const f = path.resolve(raiz, '.' + decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!f.startsWith(raiz + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html'); fs.createReadStream(f).pipe(res);
}).listen(0);
await new Promise(r => servidor.once('listening', r));
const url = `http://localhost:${servidor.address().port}/${archivo}`;
const navegador = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true,
  args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const contexto = await navegador.newContext({ viewport: { width: 1600, height: 900 } });
const semillaAnterior = JSON.stringify({ nivel: 3, xp: 17, frag: [false, false, false, false], mis: { despertar: { e: 'hecha', p: 6, c: 0 } }, seg: null, lug: { faro: 1 }, pos: { x: 0, z: 14 }, marcaPrueba: 'conservar sin convertir' });
await contexto.addInitScript(({ semilla, calidad }) => {
  if (!localStorage.getItem('ecos2_partida')) localStorage.setItem('ecos2_partida', semilla);
  localStorage.setItem('ecos2_ajustes', JSON.stringify({ calidad, maestro: 0 }));
}, { semilla: semillaAnterior, calidad });
const pagina = await contexto.newPage(), errores = [], pruebas = [];
await pagina.route('**/favicon.ico', r => r.fulfill({ status: 204 }));
pagina.on('pageerror', e => errores.push(e.message));
pagina.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
function comprobar(nombre, pasa, evidencia) { pruebas.push({ nombre, pasa: !!pasa, evidencia }); if (!pasa) throw new Error(nombre + ': ' + JSON.stringify(evidencia)); }
const cargar = async u => { await pagina.goto(u); await pagina.waitForFunction(() => window.__ecos && __ecos.estado() === 'portada', null, { timeout: 120000 }); await pagina.evaluate(() => __ecos.manual(true)); };
const sim = (n, dt = 1 / 30) => pagina.evaluate(([n, dt]) => __ecos.sim(n, dt), [n, dt]);
const saltar = async () => { await pagina.evaluate(() => UI.saltarDialogo()); await sim(1); };
const foto = async n => { await pagina.evaluate(() => render()); await pagina.waitForTimeout(500); await pagina.screenshot({ path: path.join(salida, n + '.png') }); };
try {
  await cargar(url);
  comprobar('Campaña nueva y guardado propio', await pagina.evaluate(() => Campana.clave === 'ecos3_luna_partida'), 'La partida anterior existe, pero no se importa');
  await pagina.evaluate(() => {
    window.__sonidosPrologo = []; const sfx = Sonido.sfx, oyente = Sonido.oyente;
    Sonido.sfx = (n, o) => { if (Cin.activa && ['farol', 'corte', 'quiebre'].includes(n)) __sonidosPrologo.push(n); return sfx(n, o); };
    Sonido.oyente = cam => { window.__oyenteCine = cam.position.clone(); return oyente(cam); };
    __ecos.empezarRapido(true); G.estado = 'intro'; Sis.ST.inicio.prologo = false;
    Cin.intro(() => { G.estado = 'juego'; UI.hud(true); });
  });
  const tiempo = await pagina.evaluate(() => Cin.estadoPlano().total);
  comprobar('Prólogo de nueve planos y 110 segundos', tiempo === 110 && await pagina.evaluate(() => EscenasInicio.planos === 9), tiempo);
  await sim(90); await foto('01-prologo');
  comprobar('La ceremonia presenta la apariencia dorada', await pagina.evaluate(() => Atmosfera.aparienciaLunar === 0 && Atmosfera.UA.uLunaColor.value.y > Atmosfera.UA.uLunaColor.value.z), null);
  const encuadreLunar = await pagina.evaluate(() => { const p = Atmosfera.UA.uLunaDir.value.clone().multiplyScalar(800).add(camera.position).project(camera); return { x: p.x, y: p.y, z: p.z }; });
  comprobar('La luna aparece dentro del encuadre inicial', Math.abs(encuadreLunar.x) < .95 && Math.abs(encuadreLunar.y) < .75 && encuadreLunar.z < 1, encuadreLunar);
  comprobar('El oído sigue la cámara del prólogo', await pagina.evaluate(() => __oyenteCine.distanceTo(camera.position) < .001), null);
  await pagina.keyboard.press('Escape');
  const antes = await pagina.evaluate(() => ({ t: Cin.estadoPlano().t, mundo: U.uT.value }));
  await sim(90);
  const pausa = await pagina.evaluate(() => ({ pausado: UI.pausado, t: Cin.estadoPlano().t, mundo: U.uT.value }));
  comprobar('Pausa detiene plano y mundo', pausa.pausado && pausa.t === antes.t && pausa.mundo === antes.mundo, pausa);
  await pagina.keyboard.press('Escape'); await pagina.keyboard.press('r'); await sim(1);
  comprobar('Repetir vuelve al principio del plano', await pagina.evaluate(() => Cin.estadoPlano().t === 0), null);
  await pagina.evaluate(() => {
    window.__padIntro = { connected: true, id: 'Xbox de prueba', axes: [0, 0, 0, 0], buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })) };
    navigator.getGamepads = () => [window.__padIntro]; __padIntro.buttons[9].pressed = true;
  }); await sim(1);
  comprobar('Menú del mando pausa el prólogo', await pagina.evaluate(() => UI.pausado), null);
  await pagina.evaluate(() => __padIntro.buttons[9].pressed = false); await sim(1);
  await pagina.evaluate(() => __padIntro.buttons[9].pressed = true); await sim(1);
  comprobar('Menú del mando permite reanudar', await pagina.evaluate(() => !UI.pausado), null);
  await pagina.evaluate(() => __padIntro.buttons[9].pressed = false); await sim(1);
  // Montaje completo con tiempo simulado; no representa la duración de una partida humana.
  await sim(26 * 30); await foto('02-ceremonia');
  comprobar('Cámara de ceremonia fuera de los sólidos', await pagina.evaluate(() => !Sol.dentro(camera.position.x, camera.position.y, camera.position.z, .2)), null);
  await sim(45 * 30); await foto('03-ritual');
  comprobar('Akari avanza por la escalinata', await pagina.evaluate(() => scene.getObjectByName('Akari_prologo').position.z < 7), null);
  await sim(30 * 30); await foto('03b-luna-roja');
  comprobar('La fractura vuelve roja la luna sin activar el asedio', await pagina.evaluate(() => Atmosfera.aparienciaLunar === 1 && Atmosfera.nivelRojo === 0 && !Sis.ST.cieloRojo && Atmosfera.UA.uLunaColor.value.x > Atmosfera.UA.uLunaColor.value.y * 3), null);
  await sim(10 * 30);
  comprobar('Prólogo termina y conserva solo contexto inicial', await pagina.evaluate(() => !Cin.activa && Sis.ST.inicio.prologo && Sis.ST.inicio.notas.find(n => n.id === 'prologo') && !Sis.ST.inicio.nombre), null);
  comprobar('Extracción, corte y fractura suenan una vez en su gesto', await pagina.evaluate(() => JSON.stringify(__sonidosPrologo) === JSON.stringify(['farol', 'corte', 'quiebre'])), await pagina.evaluate(() => __sonidosPrologo));
  await sim(55); // Presentación de Lumi.
  comprobar('Lumi pregunta el nombre antes de usar Hikari', await pagina.evaluate(() => UI.dlg && UI.dlg.lineas[0].id === 'DE01'), null);
  await pagina.evaluate(() => { UI.avanzarDialogo(); UI.avanzarDialogo(); });
  comprobar('Una doble pulsación no omite la pausa de lectura', await pagina.evaluate(() => UI.dlg.i === 0 && UI.dlg.espera > 0), null);
  await sim(200); await pagina.evaluate(() => UI.avanzarDialogo()); await sim(120); await pagina.evaluate(() => UI.avanzarDialogo());
  const pendiente = await pagina.evaluate(() => ({ id: Sis.ST.inicio.dialogo.id, i: Sis.ST.inicio.dialogo.i }));
  comprobar('Conversación registra la intervención pendiente', pendiente.id === 'nombre' && pendiente.i > 0, pendiente);
  await pagina.evaluate(() => Sis.guardar());
  await cargar(url);
  await pagina.click('#btnContinuar');
  await pagina.waitForFunction(() => G.estado === 'juego' && UI.dlg, null, { timeout: 30000 });
  comprobar('Continuar restaura la conversación sin repetir prólogo', await pagina.evaluate(i => !Cin.activa && UI.dlg.i === i && Sis.ST.inicio.dialogo.id === 'nombre', pendiente.i), pendiente);
  await foto('04-lumi'); await saltar();
  comprobar('Saltar presentación acepta el nombre una sola vez', await pagina.evaluate(() => Sis.ST.inicio.nombre && Sis.ST.mis.inicio_luna.p === 1 && Sis.ST.inicio.notas.filter(n => n.id === 'nombre').length === 1), null);
  const posAntes = await pagina.evaluate(() => ({ x: J.x, z: J.z }));
  await pagina.evaluate(() => { __ecos.mirar(Math.atan2(-104 - J.x, 64 - J.z), .35); __ecos.tecla('KeyW', true); }); await sim(30);
  await pagina.evaluate(() => __ecos.tecla('KeyW', false));
  const metros = await pagina.evaluate(p => Math.hypot(J.x - p.x, J.z - p.z), posAntes);
  comprobar('El movimiento real responde después de elegir el nombre', metros > 1, metros);
  await pagina.evaluate(() => { __ecos.tele(-42, 35); G.region = BIOMAS[biomaDe(J.x, J.z)].nom; });
  await pagina.waitForTimeout(5200); await sim(2);
  comprobar('El camino presenta al Cazador', await pagina.evaluate(() => Cin.activa && Cin.tipo === 'huidaInicio'), null);
  await sim(361);
  await pagina.evaluate(() => { const c = Cazadores.lista[0]; window.__antesHuida = { hp: Sis.ST.hp, motas: Sis.ST.motas }; Piloto.reintentarHuida(c); });
  comprobar('Reintento de huida conserva vida y motas', await pagina.evaluate(() => Sis.ST.hp === __antesHuida.hp && Sis.ST.motas === __antesHuida.motas && J.x === -23), null);
  await pagina.evaluate(() => { const p = PatioInicio.puntos.tsuru; __ecos.tele(p.x - 1, p.z - 2); G.region = BIOMAS[biomaDe(J.x, J.z)].nom; }); await sim(2);
  comprobar('Entrar en Hinode resuelve la huida y presenta a Momo', await pagina.evaluate(() => Sis.ST.inicio.hinode && UI.dlg && UI.dlg.lineas[0].id === 'HI01'), null);
  await saltar();
  await pagina.evaluate(() => Piloto.conversar('tsuru')); await sim(40);
  comprobar('Tsuru explica las ofrendas sin confirmar parentescos', await pagina.evaluate(() => UI.dlg.lineas.some(l => l.id === 'TS03') && !UI.dlg.lineas.some(l => /tu padre|eres Akari/.test(l.texto))), null);
  await foto('05-tsuru'); await saltar();
  await pagina.evaluate(() => { const f = PatioInicio.puntos.farol; __ecos.tele(f.x - 1.8, f.z); }); await sim(2);
  let interaccion = await pagina.evaluate(() => Sis.interactuable(J)?.txt);
  comprobar('La pieza del postigo es interactuable desde suelo', /postigo/.test(interaccion), interaccion);
  await pagina.keyboard.press('e'); await sim(1); await saltar();
  await pagina.keyboard.press('e'); await sim(1); await saltar();
  comprobar('Reparación y luz persisten sin crear una ofrenda', await pagina.evaluate(() => Sis.ST.inicio.postigo && Sis.ST.inicio.farol && Sis.ST.frag.every(v => !v) && !Sis.tiene('farol')), null);
  await pagina.evaluate(() => { const p = PatioInicio.puntos.hoja; __ecos.tele(p.x, p.z + 1.9); }); await sim(2);
  interaccion = await pagina.evaluate(() => Sis.interactuable(J)?.txt);
  comprobar('La hoja tiene acceso propio junto a la mesa', /hoja/.test(interaccion), interaccion);
  await pagina.keyboard.press('e'); await sim(1); await saltar();
  comprobar('El registro se puede leer sin cámara temporizada', await pagina.evaluate(() => UI.dlg && UI.dlg.lineas[0].texto.includes('Nao.') && !Sis.ST.inicio.hoja), null);
  await sim(90); await foto('06-registro'); await saltar();
  comprobar('El diario distingue documento y testimonio', await pagina.evaluate(() => Sis.ST.inicio.hoja && Piloto.diario().includes('no explica') && !Sis.ST.inv.farol), null);
  await pagina.evaluate(() => Piloto.conversar('testimonio')); await saltar();
  comprobar('Testimonio reutiliza AP01 sin entregar el farol', await pagina.evaluate(() => Sis.ST.inicio.testimonio && GUION.inicio.lineas.RE06.texto === GUION.inicio.lineas.AP01.texto && !Sis.tiene('farol')), null);
  await pagina.evaluate(() => Piloto.conversar('rumbo')); await saltar();
  comprobar('Primera pista de Lumi y destino concreto', await pagina.evaluate(() => Sis.ST.inicio.rumbo && Sis.ST.inicio.notas.some(n => n.id === 'lumi') && Sis.objetivo().x === -126), null);
  await pagina.evaluate(() => { const p = PatioInicio.puntos.aviso; __ecos.tele(p.x, p.z + 2); }); await sim(2);
  comprobar('El aviso del faro se puede leer desde el suelo', /aviso/.test(await pagina.evaluate(() => Sis.interactuable(J)?.txt)), null);
  await pagina.keyboard.press('e'); await sim(1);
  comprobar('La acusación oficial se identifica por su fuente', await pagina.evaluate(() => UI.dlg?.lineas[0].id === 'AV01' && UI.dlg.lineas[0].nombre.includes('versión oficial')), null);
  await sim(120); await foto('06b-aviso'); await saltar();
  comprobar('El diario guarda la propaganda como afirmación y no como prueba', await pagina.evaluate(() => Sis.ST.inicio.notas.filter(n => n.id === 'aviso').length === 1 && Sis.ST.inicio.notas.find(n => n.id === 'aviso').texto.includes('no demuestra') && Sis.ST.mis.inicio_luna.p === 5), null);
  await pagina.evaluate(() => { __ecos.tele(-126, 27); G.region = BIOMAS[biomaDe(J.x, J.z)].nom; }); await sim(2);
  comprobar('Salir cierra el piloto y orienta hacia el Pétalo', await pagina.evaluate(() => Sis.ST.inicio.fin && Sis.ST.mis.inicio_luna.e === 'hecha' && Sis.objetivo().q === 'Los nombres de la ofrenda'), null);
  await foto('07-sakura');
  const conserva = await pagina.evaluate(() => localStorage.getItem('ecos2_partida'));
  comprobar('El guardado anterior permanece idéntico', conserva === semillaAnterior, conserva);
  // Nueva partida del piloto y llegada directa a Hinode: el tutorial no fuerza volver al faro.
  await pagina.evaluate(() => { __ecos.empezarRapido(true); __ecos.tele(-98, 68); G.region = BIOMAS[biomaDe(J.x, J.z)].nom; }); await sim(50); await saltar(); await sim(2); await saltar();
  await pagina.evaluate(() => Piloto.conversar('tsuru')); await saltar();
  await pagina.evaluate(() => Piloto.conversar('hoja')); await saltar(); await saltar();
  comprobar('Omitir la reparación permite obtener la prueba', await pagina.evaluate(() => Sis.ST.inicio.hoja && !Sis.ST.inicio.postigo && !Sis.ST.inicio.farol && !Sis.ST.inicio.huida), null);
  await pagina.evaluate(() => Piloto.conversar('rumbo')); await saltar();
  await pagina.evaluate(() => { const p = PatioInicio.puntos.tsuru; __ecos.tele(p.x + 1.5, p.z); }); await sim(2);
  await pagina.evaluate(() => { const p = PatioInicio.puntos.tsuru; Piloto.interactuable({ x: p.x, y: p.y, z: p.z }).fn(); });
  comprobar('Preguntas opcionales accesibles', await pagina.evaluate(() => UI.dlg.opciones.length === 5), null);
  await pagina.keyboard.press('ArrowDown'); await sim(1); await pagina.keyboard.press('Enter'); await sim(1);
  comprobar('Teclado elige una pregunta sin cambiar el canon', await pagina.evaluate(() => UI.dlg.lineas[1].id === 'PR02'), null); await saltar();
  await pagina.evaluate(() => {
    window.__padInicio = { connected: true, id: 'Xbox de prueba', axes: [0, 0, 0, 0], buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })) };
    navigator.getGamepads = () => [window.__padInicio];
    Piloto.interactuable({ ...PatioInicio.puntos.tsuru }).fn();
  });
  await sim(1); await pagina.evaluate(() => __padInicio.buttons[0].pressed = true); await sim(1);
  comprobar('Mando selecciona una pregunta', await pagina.evaluate(() => UI.dlg && !UI.dlg.opciones && UI.dlg.lineas[1].id.startsWith('PR')), null);
  await pagina.evaluate(() => __padInicio.buttons[0].pressed = false); await sim(1); await saltar();
  await pagina.evaluate(() => { __ecos.tele(74, 80); }); await sim(120);
  comprobar('Explorar no dispara la identidad ni el final antiguos', await pagina.evaluate(() => !Cin.activa && !Sis.ST.vision && !Sis.ST.final && !Sis.ST.mis.laVerdad && !Sis.ST.mis.alba && !Sis.ST.frag.some(Boolean)), null);
  await cargar(url + '?campana=anterior');
  comprobar('Una sola campaña: el parámetro antiguo se ignora y no hay botón de campaña', await pagina.evaluate(() => Campana.clave === 'ecos3_luna_partida' && GUION_INICIO.misiones.every(q => MIS.includes(q)) && !MIS.some(q => ['despertar', 'faro', 'alba', 'guardian'].includes(q.id)) && !document.getElementById('btnCampana')), null);
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) {
  errores.push(e.stack); try { await foto('error'); console.log(await pagina.evaluate(() => ({ estado: G.estado, inicio: Sis.ST.inicio, dlg: UI.dlg && { i: UI.dlg.i, lineas: UI.dlg.lineas, opciones: !!UI.dlg.opciones }, plano: Cin.estadoPlano() }))); } catch {}
  process.exitCode = 1;
} finally {
  fs.writeFileSync(path.join(salida, 'resultado.json'), JSON.stringify({ archivo, calidad, pruebas, errores }, null, 2));
  console.log(JSON.stringify({ archivo, calidad, pruebas: pruebas.length, correctas: pruebas.filter(p => p.pasa).length, errores }, null, 2));
  await navegador.close(); await new Promise(r => servidor.close(r));
}
