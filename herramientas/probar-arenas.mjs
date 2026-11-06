// Arenas y presencia de los guardianes. --logica funciona sin dependencias ni navegador.
// --geometria usa Three r128 en Node (CDN del juego o --three ruta), sin abrir navegador.
// Sin esa opción abre Edge; --calidad alta|media|baja y --salida siguen las otras pruebas.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = f => fs.readFileSync(path.join(raiz, f), 'utf8');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const pruebas = [];
function probar(nombre, fn) {
  try { const evidencia = fn(); pruebas.push({ nombre, pasa: true, evidencia }); }
  catch (e) { pruebas.push({ nombre, pasa: false, error: e.stack }); }
}
function tramo(codigo, desde, hasta) {
  const a = codigo.indexOf(desde), b = codigo.indexOf(hasta, a + desde.length);
  assert(a >= 0 && b > a, 'No se encuentra el tramo de prueba: ' + desde);
  return codigo.slice(a, b);
}

/* Sustitutos mínimos de dibujo: la lógica usa el terreno y los sólidos reales, sin GPU. */
class Vector {
  constructor(x = 0, y = 0, z = 0) { this.set(x, y, z); }
  set(x, y, z) { Object.assign(this, { x, y, z }); return this; }
}
class Grupo {
  constructor() { this.children = []; this.position = new Vector(); }
  add(o) { this.children.push(o); o.parent = this; }
  remove(o) { this.children = this.children.filter(c => c !== o); o.parent = null; }
}
class Geometria {
  constructor() { this.attributes = {}; }
  setAttribute(k, a) { this.attributes[k] = a; }
  computeBoundingSphere() {}
  dispose() { this.eliminada = true; }
}
const THREE = {
  Vector3: Vector, Quaternion: class {}, Euler: class {}, Matrix4: class {}, Group: Grupo,
  BufferGeometry: Geometria,
  Float32BufferAttribute: class { constructor(a, n) { this.array = a; this.count = a.length / n; } },
  MeshBasicMaterial: class { constructor(o) { Object.assign(this, o); } dispose() { this.eliminado = true; } },
  Mesh: class { constructor(geometry, material) { Object.assign(this, { geometry, material, castShadow: false }); } }
};
const contexto = vm.createContext({ console, THREE });
const ejecutar = s => vm.runInContext(s, contexto);
const nucleo = leer('js/00-nucleo.js'), terreno = leer('js/02-terreno.js'), jefes = leer('js/11-jefes.js');
ejecutar(tramo(nucleo, 'const TAU', '/* ---------- color'));
ejecutar(tramo(terreno, 'const CHUNK', '/* ---------- caminos'));
ejecutar(tramo(terreno, 'const _segChunk', 'function pesoCamino'));
ejecutar(tramo(jefes, 'const ARENAS', 'Object.assign(ITEMS'));
ejecutar(tramo(leer('js/04-estructuras.js'), 'const Sol =', '/* faro:'));
ejecutar(`
  for (const s of SITIOS) s.h = Math.max(2.4, alturaNatural(s.x, s.z));
  prepararCuevas(); trazarCaminos();
  const ZONAS_LIBRES = [], Estr = { tickers: [] }, U = { uT: { value: 0 } };
  const lin = () => ({ multiplyScalar() { return this; } });
  const Sis = { ST: { jefes: { musgoso: { rec: {}, got: 0, der: false } } } };
  const PK = [], scene = { add() {} }, halo = () => ({ position: new THREE.Vector3() });
  const st = () => Sis.ST.jefes.musgoso;
`);
// Se abre una puerta de inspección solo en la copia evaluada, sin cambiar la API del juego.
const arenas = leer('js/31-arenas.js');
assert(arenas.includes('return { vestir, crearLinterna,'));
ejecutar(arenas.replace('return { vestir, crearLinterna,', 'return { crearRamalMusgoso, sembrarPiedrasMusgoso, piedraVisible, juntoAlCamino, muestra, libre, pistaArena, vestir, crearLinterna,'));
ejecutar('const ar = ArenasGolem({ PK, RECS: [], LUCES: [], st, halo });');
ejecutar(leer('js/22-golems.js'));

probar('Las tres piedras quedan visibles sobre terreno de Pradera y a menos de 35 m del camino', () => {
  ejecutar('ar.sembrarPiedrasMusgoso()');
  const puntos = ejecutar('Estr.piedrasMusgoso.map(p => ({ ...p, distancia: ar.juntoAlCamino(p.x, p.z).d, visible: ar.piedraVisible(p.x, p.z) }))');
  assert.equal(puntos.length, 3); assert(puntos.every(p => p.visible && p.distancia < 35));
  return JSON.parse(JSON.stringify(puntos));
});
probar('Un sólido que cubre el ancla hace que la piedra busque un punto próximo y libre', () => {
  ejecutar('Sol.col(64, 12, .3, altura(64, 12), altura(64, 12) + 2); ar.sembrarPiedrasMusgoso();');
  const p = ejecutar('Estr.piedrasMusgoso[0]');
  assert(Math.hypot(p.x - 64, p.z - 12) > .9); assert(Math.hypot(p.x - 64, p.z - 12) <= 3.01);
  assert(ejecutar('ar.piedraVisible(Estr.piedrasMusgoso[0].x, Estr.piedrasMusgoso[0].z)'));
  ejecutar('Sol.cols.length = 0');
});
probar('Con p1 ya recogida se reconstruyen solo p0 y p2, sin alterar el progreso', () => {
  ejecutar("PK.length = 0; st().rec = { p1: 1 }; st().got = 1; ar.sembrarPiedrasMusgoso();");
  assert.equal(ejecutar("PK.map(p => p.pid).join(',')"), 'p0,p2'); assert.equal(ejecutar('st().got'), 1);
});
probar('Las reservas de vegetación cubren todas las anclas y su búsqueda', () => {
  assert(ejecutar('PIEDRAS_MUSGOSO.anclas.every(([x,z]) => ZONAS_LIBRES.some(q => q.x === x && q.z === z && q.r >= PIEDRAS_MUSGOSO.busca + 4))'));
});
probar('El ramal parte del altar y cruza el camino con dos mallas sin sólidos ni sombra', () => {
  ejecutar(`const de = { x: -118 / Math.hypot(118,26), z: 26 / Math.hypot(118,26) };
    const B = { id: 'musgoso', deco: new THREE.Group(), altar: { x: 118 + de.x * 18, z: -26 + de.z * 18 } };
    ar.crearRamalMusgoso(B);`);
  assert.equal(ejecutar('B.ramalSello.mallas.length'), 2);
  assert(ejecutar('B.ramalSello.mallas.every(o => !o.m.castShadow)'));
  assert.equal(ejecutar('Sol.cols.length + Sol.cajas.length'), 0);
  assert(ejecutar('ar.juntoAlCamino(54,39).d < 2'));
});
probar('Purificar inicia un fundido de 1,2 s y libera las dos geometrías y materiales', () => {
  ejecutar('const restos = B.ramalSello.mallas; st().der = true; U.uT.value = .6; Estr.tickers[0](.6);');
  assert(ejecutar('B.ramalSello.t >= .599 && B.ramalSello.t <= .601'));
  assert(ejecutar('restos.every(o => o.m.material.opacity > 0 && o.m.material.opacity < o.opacidad * .51)'));
  ejecutar('U.uT.value = 1.2; Estr.tickers[0](1.2);');
  assert.equal(ejecutar('B.ramalSello'), null);
  assert(ejecutar('restos.every(o => o.m.geometry.eliminada && o.m.material.eliminado)'));
});
probar('Una partida con der ya cumplido no construye el ramal', () => {
  ejecutar('ar.crearRamalMusgoso(B)'); assert.equal(ejecutar('B.ramalSello'), null); assert.equal(ejecutar('B.deco.children.length'), 0);
});
probar('Pausa: repetir el mismo tiempo de Estr no adelanta el fundido', () => {
  ejecutar('st().der = false; ar.crearRamalMusgoso(B); st().der = true; Estr.tickers[0](1.2); Estr.tickers[0](1.2);');
  assert.equal(ejecutar('B.ramalSello.t'), 0);
});
probar('Se informa la migración de posiciones p0–p2, con las coordenadas anteriores reales', () => {
  const anteriores = ejecutar('ar.muestra(901, 118, -26, 45, 150, (x,z) => biomaDe(x,z) === 0 && altura(x,z) > 2.5 && pendiente(x,z) < .7 && ar.libre(x,z), 3)');
  return JSON.parse(JSON.stringify({ antes: anteriores, despues: ejecutar('PIEDRAS_MUSGOSO.anclas') }));
});
probar('Las cinco pistas exponen un punto de lectura separado 2,2 m de su obra', () => {
  ejecutar(`const k = { marca: () => 0, mover() {} }; const Arquitectura = { pistaGuardian() {} };
    for (const id in ARENAS) { const A = ARENAS[id]; ar.pistaArena({ id, A }, k, Math.atan2(-A.x,-A.z)); }`);
  const pistas = ejecutar('Estr.pistasGuardian');
  assert.equal(Object.keys(pistas).length, 5);
  assert(Object.values(pistas).every(p => Math.abs(Math.hypot(p.x - p.obra.x, p.z - p.obra.z) - 2.2) < 1e-8 && Number.isFinite(p.y)));
  return JSON.parse(JSON.stringify(pistas));
});
probar('Dormido y despertar antes del peso conservan presencia 0', () => {
  ejecutar("const go = { estado: 'dormido', x: 0, z: 0, solido: false }; Golems.presencia(go, 1);");
  assert.equal(ejecutar('Golems.presencia(go)'), 0);
  ejecutar("go.estado = 'despertar'; Golems.presencia(go, .79)"); assert.equal(ejecutar('Golems.presencia(go)'), 0);
});
probar('Tomar peso suaviza la presencia durante 0,5 s y da un único pulso corto', () => {
  ejecutar('go.solido = true; Golems.presencia(go, .14)');
  assert(ejecutar('go.G.presencia > 0 && go.G.presencia < 1 && go.G.pesoT > 0'));
  ejecutar('Golems.presencia(go, .11)'); assert(Math.abs(ejecutar('go.G.presencia') - .5) < 1e-8);
  ejecutar('Golems.presencia(go, .25)'); assert.equal(ejecutar('go.G.presencia'), 1); assert.equal(ejecutar('go.G.pesoT'), 0);
  ejecutar("go.estado = 'fase'; Golems.presencia(go, 1)"); assert.equal(ejecutar('go.G.pesoT'), 0);
});
probar('Purificado pierde la presencia incluso con la bandera antigua; la calma conserva su objetivo', () => {
  ejecutar("go.estado = 'purificado'; Golems.calma(go); Golems.presencia(go, .5)");
  assert.equal(ejecutar('go.G.presencia'), 0); assert.equal(ejecutar('go.G.calmaObj'), 1); assert.equal(ejecutar('go.solido'), true);
});
probar('Reconstrucción inmediata y dt cero no generan destellos ni avanzan la transición', () => {
  ejecutar("go.estado = 'combate'; Golems.presencia(go, 0, true)"); assert.equal(ejecutar('go.G.presencia'), 1); assert.equal(ejecutar('go.G.pesoT'), 0);
  ejecutar("go.estado = 'calmo'; Golems.presencia(go, 0)"); assert.equal(ejecutar('go.G.presencia'), 1);
  ejecutar('Golems.presencia(go, 0, true)'); assert.equal(ejecutar('go.G.presencia'), 0);
});

async function geometria() {
  const dibujo = new Proxy({ measureText: () => ({ width: 100 }), createLinearGradient: () => ({ addColorStop() {} }) }, { get: (t, k) => t[k] || (() => {}) });
  const c = vm.createContext({ console, localStorage: { getItem: () => null }, document: { createElement: () => ({ width: 1, height: 1, getContext: () => dibujo }) } });
  const run = s => vm.runInContext(s, c);
  const three = arg('three', null);
  if (three) run(fs.readFileSync(three, 'utf8'));
  else {
    const url = /src="([^"]*three\.min\.js)"/.exec(leer('index.html'))[1], r = await fetch(url);
    assert(r.ok, 'No se pudo leer Three r128'); run(await r.text());
  }
  run(leer('js/00-nucleo.js')); run(leer('js/02-terreno.js'));
  run(`scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(); TEX.halo = texHalo();
    const ZONAS_LIBRES = [], Texturas = { CAPA: {}, medio: [] }, GUION_INICIO = {}, ITEMS = {}, MIS = [], Q = {}, LUGARES = [];
    const Cuevas = { crear() {}, actualizar() {} }, AtaquesGolem = () => ({}), FX = { emit() {}, rafaga() {} }, Sonido = { sfx() {} };
    const Sis = { ST: { jefes: {} }, J: null, darDon() {} };`);
  for (const f of ['26-guion', '24-arquitectura', '34-piezas', '33-santuarios', '04-estructuras', '11-jefes', '22-golems', '31-arenas']) run(leer('js/' + f + '.js'));
  run('for (const s of SITIOS) s.h = Math.max(2.4, alturaNatural(s.x, s.z)); prepararCuevas(); trazarCaminos(); Estr.init(); Jefes.iniciar();');
  probar('Geometría r128: las cinco anclas quedan fuera de la obra completa', () => {
    assert(run('Object.values(Estr.pistasGuardian).every(p => !Sol.dentro(p.x, p.y + .8, p.z, .35))'));
  });
  probar('Geometría r128: ninguna piedra cae dentro de la obra completa', () => {
    assert(run('Estr.piedrasMusgoso.every(p => ![.3, 1, 1.7].some(d => Sol.dentro(p.x, altura(p.x,p.z) + d, p.z, .65)))'));
  });
  probar('Geometría r128: todos los vértices nuevos a altura de cuerpo tienen sólido fino', () => {
    const evidencia = run(`(() => {
      const resultados = [];
      for (const id in Estr.pistasGuardian) {
        const o = Arquitectura.construir(k => Arquitectura.pistaGuardian(k,id)); let n = 0, fuera = 0;
        const cubre = v => o.sol.some(s => {
          if (v.y < s.y0 - .06 || v.y > s.y1 + .06) return false;
          if (s.circ) return Math.hypot(v.x-s.x,v.z-s.z) <= s.r+.06;
          const co=Math.cos(s.ry),si=Math.sin(s.ry),dx=v.x-s.x,dz=v.z-s.z;
          return Math.abs(dx*co-dz*si) <= s.hx+.06 && Math.abs(dx*si+dz*co) <= s.hz+.06;
        });
        o.g.traverse(m => { if (!m.isMesh) return; const a=m.geometry.attributes.position;
          for(let i=0;i<a.count;i++) {const v=new THREE.Vector3().fromBufferAttribute(a,i);if(v.y<.25||v.y>1.7)continue;n++;if(!cubre(v))fuera++;}
          m.geometry.dispose();
        });
        resultados.push({id,vertices:n,fuera,finos:o.sol.every(s=>s.fina)});
      }
      return resultados;
    })()`);
    assert(evidencia.every(p => p.fuera === 0 && p.finos)); return JSON.parse(JSON.stringify(evidencia));
  });
  probar('Geometría r128: los cinco modelos animan presencia, juntas y calma', () => {
    const evidencia = run(`Object.values(Jefes.lista).map(B => {
      B.solido=true;B.estado='combate';for(let i=0;i<30;i++)Golems.animar(B,1/60);const peso=Golems.presencia(B);
      B.estado='purificado';Golems.calma(B);for(let i=0;i<30;i++)Golems.animar(B,1/60);
      return {id:B.id,peso,traspasable:Golems.presencia(B),juntas:B.M.presenciaHalos.length,calma:B.G.calmaK};
    })`);
    assert(evidencia.every(p => p.peso > .999 && p.traspasable < .001 && p.calma > 0 && p.juntas <= 8)); return JSON.parse(JSON.stringify(evidencia));
  });
}

async function navegador() {
  const { chromium } = await import('playwright-core');
  const salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-arenas')), calidad = arg('calidad', 'alta');
  fs.mkdirSync(salida, { recursive: true });
  const servidor = http.createServer((q, r) => {
    const f = path.resolve(raiz, '.' + decodeURIComponent(q.url.split('?')[0]));
    if (!f.startsWith(raiz + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
    r.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html'); fs.createReadStream(f).pipe(r);
  }).listen(0);
  await new Promise(r => servidor.once('listening', r));
  let nav;
  try {
    nav = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
    const p = await nav.newPage({ viewport: { width: 1600, height: 900 } }), errores = [];
    p.on('pageerror', e => errores.push(e.message)); p.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
    await p.addInitScript(calidad => localStorage.setItem('ecos2_ajustes', JSON.stringify({ calidad, maestro: 0 })), calidad);
    await p.route('**/favicon.ico', r => r.fulfill({ status: 204 }));
    const url = `http://localhost:${servidor.address().port}/${arg('archivo', 'index.html')}`;
    const cargar = async () => { await p.goto(url, { timeout: 180000 }); await p.waitForFunction(() => window.__ecos && G.estado === 'portada', null, { timeout: 120000 }); await p.evaluate(() => __ecos.manual(true)); };
    const comprobar = (nombre, pasa, evidencia) => { pruebas.push({ nombre, pasa: !!pasa, evidencia }); assert(pasa, nombre + ': ' + JSON.stringify(evidencia)); };
    const foto = async nombre => { await p.evaluate(() => render()); await p.screenshot({ path: path.join(salida, nombre + '.png') }); };
    await cargar(); await p.evaluate(() => __ecos.empezarRapido(true));
    const recogidas = await p.evaluate(() => Estr.piedrasMusgoso.map(p => {
      const y = altura(p.x, p.z); let distancia = Infinity;
      for (let i = 1; i < CAMINOS[1].length; i++) { const a = CAMINOS[1][i - 1], b = CAMINOS[1][i], dx = b[0] - a[0], dz = b[1] - a[1], t = clamp(((p.x - a[0]) * dx + (p.z - a[1]) * dz) / (dx * dx + dz * dz), 0, 1); distancia = Math.min(distancia, Math.hypot(p.x - a[0] - dx * t, p.z - a[1] - dz * t)); }
      return { ...p, distancia, libre: ![.3, 1, 1.7].some(d => Sol.dentro(p.x, y + d, p.z, .65)) };
    }));
    comprobar('Mundo construido: piedras accesibles y próximas al camino', recogidas.length === 3 && recogidas.every(p => p.libre && p.distancia <= 35), recogidas);
    const pistas = await p.evaluate(() => Object.entries(Estr.pistasGuardian).map(([id, p]) => ({ id, ...p, libre: !Sol.dentro(p.x, p.y + .8, p.z, .35) })));
    comprobar('Mundo construido: las cinco anclas están fuera de sólidos', pistas.length === 5 && pistas.every(p => p.libre), pistas);
    const cobertura = await p.evaluate(() => {
      const resultados = [];
      for (const id in Estr.pistasGuardian) {
        const obra = Arquitectura.construir(k => Arquitectura.pistaGuardian(k, id)); let fuera = 0;
        const cubre = v => obra.sol.some(s => {
          if (v.y < s.y0 - .06 || v.y > s.y1 + .06) return false;
          if (s.circ) return Math.hypot(v.x - s.x, v.z - s.z) <= s.r + .06;
          const c = Math.cos(s.ry), sn = Math.sin(s.ry), dx = v.x - s.x, dz = v.z - s.z;
          return Math.abs(dx * c - dz * sn) <= s.hx + .06 && Math.abs(dx * sn + dz * c) <= s.hz + .06;
        });
        obra.g.traverse(o => { if (!o.isMesh) return; const a = o.geometry.attributes.position; for (let i = 0; i < a.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(a, i); if (v.y >= .25 && v.y <= 1.7 && !cubre(v)) fuera++; } o.geometry.dispose(); });
        resultados.push({ id, fuera, finos: obra.sol.every(s => s.fina) });
      }
      return resultados;
    });
    comprobar('Toda la obra nueva a altura de cuerpo tiene sólido fino', cobertura.every(p => p.fuera === 0 && p.finos), cobertura);
    for (const { id, obra: o } of pistas) {
      await p.evaluate(o => { camera.position.set(o.x + Math.sin(o.giro) * 8, o.y + 2, o.z + Math.cos(o.giro) * 8); camera.lookAt(o.x, o.y + .95, o.z); }, o);
      await foto('pista-' + id + '-8m');
    }
    const presencia = await p.evaluate(() => {
      const B = Jefes.lista.musgoso, estados = [];
      B.estado = 'despertar'; B.solido = false; Golems.presencia(B, 0, true);
      estados.push(Golems.presencia(B)); B.solido = true;
      for (let i = 0; i < 15; i++) Golems.animar(B, 1 / 60); estados.push(Golems.presencia(B));
      for (let i = 0; i < 15; i++) Golems.animar(B, 1 / 60); estados.push(Golems.presencia(B));
      B.estado = 'purificado'; Golems.calma(B);
      for (let i = 0; i < 30; i++) Golems.animar(B, 1 / 60); estados.push(Golems.presencia(B));
      return { estados, calma: B.G.calmaK, halos: B.M.presenciaHalos.length };
    });
    comprobar('Modelo real: presencia 0 → 0,5 → 1 → 0 y purificación activa', presencia.estados.every((v, i) => Math.abs(v - [0, .5, 1, 0][i]) < .01) && presencia.calma > 0, presencia);
    const ramal = await p.evaluate(() => {
      const B = Jefes.lista.musgoso, t = U.uT.value, r = B.ramalSello, cantidad = r.mallas.length;
      Sis.ST.jefes.musgoso.der = true;
      U.uT.value = t + .6; Estr.actualizar(.6, U.uT.value, 0, -999, 0, 0);
      const mitad = B.ramalSello.t;
      U.uT.value = t + 1.21; Estr.actualizar(.61, U.uT.value, 0, -999, 0, 0);
      return { cantidad, mitad, eliminado: B.ramalSello === null };
    });
    comprobar('El ramal desaparece con el reloj de Estr, también sin actualizar Jefes', ramal.cantidad <= 2 && Math.abs(ramal.mitad - .6) < .01 && ramal.eliminado, ramal);
    await p.evaluate(() => { Sis.ST.jefes.musgoso.rec.p1 = 1; Sis.ST.jefes.musgoso.got = 1; Sis.guardar(); });
    await cargar();
    const carga = await p.evaluate(() => ({ ramal: !!Jefes.lista.musgoso.ramalSello, piedras: Jefes.PK.filter(p => p.id === 'musgoso').map(p => p.pid), presencia: Golems.presencia(Jefes.lista.musgoso) }));
    comprobar('Recarga: der sin ramal, piedra p1 ausente y cuerpo permeable', !carga.ramal && !carga.piedras.includes('p1') && carga.presencia === 0, carga);
    comprobar('Sin errores de navegador en calidad ' + calidad, !errores.length, errores);
  } finally { if (nav) await nav.close(); await new Promise(r => servidor.close(r)); }
}

if (process.argv.includes('--geometria')) {
  try { await geometria(); }
  catch (e) { pruebas.push({ nombre: 'Prueba de geometría r128', pasa: false, error: e.stack }); }
} else if (!process.argv.includes('--logica')) {
  try { await navegador(); }
  catch (e) { pruebas.push({ nombre: 'Prueba de navegador', pasa: false, error: e.stack }); }
}
console.log(JSON.stringify({ correctas: pruebas.filter(p => p.pasa).length, total: pruebas.length, pruebas }, null, 2));
if (pruebas.some(p => !p.pasa)) process.exitCode = 1;
