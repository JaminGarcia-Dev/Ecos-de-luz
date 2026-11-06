// Fase 6 de PLAN_JUEGO: ranura ofensiva única con el arco de luz y la escuela de luz conectados al combate.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-fase6'));
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
  await p.evaluate(() => { __ecos.empezarRapido(true); Sis.ST.capitulo = 1; Sis.dar('katana', 1, true); Sis.dar('arco', 1, true); Sis.dar('escuela', 1, true); Sis.equipar('katana'); J.combate = 0; });
  await sim(30);
  const nueva = (dx, dz) => p.evaluate(([dx, dz]) => { const s = Sombras.crear('rastrera', J.x + dx, J.z + dz, null, { fija: true }); s.estado = 'idle'; s.t = 0; s.animo = 1000; s.y = J.y; window.__s = (window.__s || []).concat([s]); return window.__s.length - 1; }, [dx, dz]);
  const daño = i => p.evaluate(i => 1000 - window.__s[i].animo, i);
  const limpiar = () => p.evaluate(() => { (window.__s || []).forEach(s => Sombras.quitar(s)); window.__s = []; J.combate = 0; J.estilo = null; ArcoLuz.reiniciar(); EscuelaLuz.reiniciar(); });
  const apunta = () => p.evaluate(() => { while (UI.dlg) UI.saltarDialogo(); J.yaw = Math.PI / 2; J.camYaw = J.yaw; J.vx = J.vz = 0; Sis.ST.luz = Sis.luzMax(); Sis.ST.hp = Sis.hpMax(); });
  const pulsar = async (tecla, frames) => { await p.evaluate(t => __ecos.tecla(t, true), tecla); await sim(1); if (frames > 1) await sim(frames - 1); await p.evaluate(t => __ecos.tecla(t, false), tecla); };
  const equipar = id => p.evaluate(id => { J.combate = 0; return Sis.equipar(id) && Sis.ST.eq.arma; }, id);

  // arco: tiro rápido
  comprobar('El arco se equipa fuera de combate', (await equipar('arco')) === 'arco');
  await apunta(); const a = await nueva(8, 0); const luz0 = await p.evaluate(() => Sis.ST.luz);
  await pulsar('Mouse0', 1); await sim(12);
  const luz1 = await p.evaluate(() => Sis.ST.luz); await sim(50); const da = await daño(a);
  comprobar('Un toque dispara una flecha que daña a la Sombra y cuesta luz', da > 8 && luz1 < luz0, { da, luz0, luz1 });
  await limpiar();

  // arco: tiro tensado perfora
  await apunta(); const b1 = await nueva(6, 0), b2 = await nueva(11, 0);
  await pulsar('Mouse0', 70); await sim(60);
  const d1 = await daño(b1), d2 = await daño(b2);
  comprobar('Mantener y soltar tensa el arco: la flecha atraviesa a las dos Sombras alineadas', d1 > 20 && d2 > 20, { d1, d2 });
  await limpiar();

  // una sola ranura: en combate no se cambia de estilo
  await p.evaluate(() => { J.combate = 3; });
  const bloq = await p.evaluate(() => ({ r: Sis.equipar('escuela'), arma: Sis.ST.eq.arma }));
  comprobar('No se cambia de estilo en combate y solo hay una arma equipada', bloq.r === false && bloq.arma === 'arco', bloq);

  // escuela de luz: orbe y escudo
  comprobar('La escuela de luz se equipa fuera de combate', (await equipar('escuela')) === 'escuela');
  await apunta(); const c = await nueva(6, 0);
  await pulsar('Mouse0', 1); await sim(80);
  const dc = await daño(c);
  comprobar('Un toque suelta un orbe que daña a la Sombra', dc > 5, { dc });
  await limpiar(); await apunta();
  await p.evaluate(() => __ecos.tecla('KeyR', true)); await sim(12);
  const escudo = await p.evaluate(() => { const S = Sis.ST, hp0 = S.hp, l0 = S.luz; J.inv = 0; Bus.emit('dañoJugador', { dmg: 12, x: J.x + 1.2, z: J.z }); return { hp: hp0 - S.hp, luz: +(l0 - S.luz).toFixed(1), parada: J.paradaT > 0 }; });
  await p.evaluate(() => __ecos.tecla('KeyR', false)); await sim(60);
  comprobar('El escudo de luz para un golpe frontal sin daño y gasta luz', escudo.hp === 0 && escudo.luz >= 5 && escudo.parada, escudo);
  await limpiar();

  // el gólem se vence con flechas y orbes; el haz ya no resta su vida
  await limpiar();
  const golem = await p.evaluate(async () => {
    const B = Jefes.lista.cerezo, S = Sis.ST; Sis.equipar('arco'); J.combate = 0; Sis.equipar('arco');
    Sis.ST.inv = Sis.ST.inv || {}; J.x = B.x + 9; J.z = B.z; J.y = B.A.y + .1; Jefes.despertar(B); __ecos.sim(300, 1 / 60);
    J.x = B.x + 9; J.z = B.z; J.y = B.A.y + .1; J.yaw = -Math.PI / 2; J.camYaw = J.yaw; J.inv = 99; S.hp = Sis.hpMax(); S.luz = Sis.luzMax();
    const o0 = B.osc, e0 = B.estado;
    __ecos.tecla('Mouse0', true); __ecos.sim(2, 1 / 60); __ecos.tecla('Mouse0', false); __ecos.sim(60, 1 / 60);
    const dArco = o0 - B.osc;
    Jefes.hazImpacto({ s: { tipo: 'nucleo', B } }, 1); const o1 = B.osc; Jefes.hazImpacto({ s: { tipo: 'cuerpo', B } }, 1);
    return { e0, dArco: +dArco.toFixed(1), haz: +(o1 - B.osc).toFixed(2), oscMax: B.oscMax };
  });
  comprobar('Una flecha daña al gólem en combate y el haz ya no le resta vida', golem.e0 === 'combate' && golem.dArco > 3 && golem.haz === 0, golem);
  // obtención: al cerrar la conversación llegan, una sola vez, y la primera vez que se equipan enseñan su gesto
  const gana = await p.evaluate(() => {
    const S = Sis.ST; delete S.inv.escuela; delete S.inv.arco; S.consejos = {}; S.eq.arma = 'katana'; J.combate = 0;
    const a0 = [!!Sis.tiene('escuela'), !!Sis.tiene('arco')];
    Bus.emit('conversacion', 'c1_forma_luz'); Bus.emit('conversacion', 'c4_forma_arco'); Bus.emit('conversacion', 'c4_forma_arco');
    const a1 = [Sis.tiene('escuela'), Sis.tiene('arco')], avisos = [], o = UI.aviso; UI.aviso = (t, ...r) => { avisos.push(t); return o.call(UI, t, ...r); };
    Sis.equipar('escuela'); Sis.equipar('katana'); Sis.equipar('escuela'); UI.aviso = o; Sis.equipar('katana');
    return { a0, a1, gestos: avisos.filter(t => /orbe/.test(t)).length };
  });
  comprobar('La escuela y el arco se conceden al cerrar su conversación, una vez, y enseñan su gesto una vez', !gana.a0[0] && !gana.a0[1] && gana.a1[0] === 1 && gana.a1[1] === 1 && gana.gestos === 1, gana);
  // las cuatro escuelas de la fase 7: cada una se equipa, dispara y daña; la oscuridad cuesta vida pero nunca mata
  await limpiar();
  for (const [id, mov] of [['escuela_viento', 'viento'], ['escuela_brasa', 'brasa'], ['escuela_escarcha', 'escarcha'], ['escuela_oscuridad', 'oscuridad']]) {
    await p.evaluate(id => { Sis.dar(id, 1, true); J.combate = 0; Sis.equipar(id); }, id);
    await apunta(); const z = await nueva(5, 0); const ini = await p.evaluate(() => ({ hp: Sis.ST.hp, luz: Sis.ST.luz }));
    await pulsar('Mouse0', 1); await sim(14); const mid = await p.evaluate(() => ({ hp: Sis.ST.hp, luz: Sis.ST.luz })); await sim(70);
    const dz = await daño(z), arma = await p.evaluate(() => Sis.ST.eq.arma);
    comprobar('La escuela ' + mov + ' daña a una Sombra y gasta ' + (mov === 'oscuridad' ? 'luz y vida (sin matar)' : 'luz'), arma === id && dz > 3 && mid.luz < ini.luz && (mov !== 'oscuridad' || (mid.hp < ini.hp && mid.hp >= 1)), { arma, dz, ini, mid });
    await limpiar(); await p.evaluate(() => { Sis.ST.hp = Sis.hpMax(); });
  }
  await p.evaluate(() => { J.combate = 0; Sis.equipar('katana'); });
  // estados de las escuelas: lentitud con tope, sujeción con espera y zonas que no atraviesan paredes
  await limpiar(); await apunta();
  const est = await p.evaluate(() => {
    const mk = (dx, dz) => { const s = Sombras.crear('rastrera', J.x + dx, J.z + dz, null, { fija: true }); s.estado = 'idle'; s.animo = 1000; s.y = J.y; return s; };
    const a = mk(3, 0), r = {};
    Sombras.golpear(a, 1, 1, 0, { lenta: .9, durLenta: 9 }); r.lentaK = a.lentaK; r.lentaT = +a.lentaT.toFixed(1);
    Sombras.golpear(a, 1, 1, 0, { sujeta: 5 }); r.sujetaT = +a.sujetaT.toFixed(1); a.sujetaT = 0; Sombras.golpear(a, 1, 1, 0, { sujeta: 5 }); r.sinRepetir = a.sujetaT === 0;
    const b = mk(6, 0), o = { x: J.x, y: J.y + .8, z: J.z }, muro = Sol.add(J.x + 3, J.z, .5, 4, 0, J.y - 1, J.y + 5);
    const tapado = Impacto.circulo(J.x, J.y, J.z, 8, 10, { ocluir: true, origen: o }, new Set()), animoTapado = b.animo;
    muro.on = false; const libre = Impacto.circulo(J.x, J.y, J.z, 8, 10, { ocluir: true, origen: o }, new Set());
    r.tapado = animoTapado === 1000; r.libre = b.animo < 1000; r.n = [tapado, libre];
    window.__s = (window.__s || []).concat([a, b]); return r;
  });
  comprobar('La lentitud tiene tope (0,5) y vence sola; la sujeción espera su tiempo; una pared frena la zona', est.lentaK === .5 && est.lentaT === 3 && est.sujetaT === 1.6 && est.sinRepetir && est.tapado && est.libre, est);
  await limpiar();
  // pose y captura del arco tensado
  await equipar('arco'); await apunta(); await p.evaluate(() => { J.yaw = J.camYaw = Math.PI / 2; });
  await p.evaluate(() => __ecos.tecla('Mouse0', true)); await sim(25);
  await p.evaluate(() => { J.camYaw = Math.PI; J.camDistObj = 3.2; J.camDist = 3.2; J.camPitch = .12; }); await sim(30); await foto('arco-apunta'); await p.evaluate(() => __ecos.tecla('Mouse0', false)); await sim(30);
  await equipar('katana'); const vuelve = await p.evaluate(() => ({ arma: Sis.ST.eq.arma, estilo: J.estilo, vel: J.estiloVel }));
  await sim(2);
  comprobar('Al volver a la katana el estilo se apaga', vuelve.arma === 'katana' && (await p.evaluate(() => J.estilo === null && J.estiloVel === 1)), vuelve);
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) { errores.push(e.stack || e.message); }
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
