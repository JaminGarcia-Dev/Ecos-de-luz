/* === Ecos de Luz · 35-sombras.js ===
   Las Sombras: la oscuridad que el faro contenía (rediseño de la historia, fase 17). Son los enemigos comunes: se
   destruyen y sueltan la luz que robaron (motas de luz rescatada). Aquí van sus fichas (SOMBRAS), las zonas donde
   brotan (ZONAS_SOMBRA), la IA de grupo (se turnan para atacar), el arte (tinta con el borde rojo y ojos que arden),
   las esquirlas de la lanzadora y la rotura. Cuatro comportamientos (ia): 'salto' (rastrera: acecha en círculo y salta),
   'escudo' (avanza tras un farol apagado que para los golpes de frente y golpea de cerca), 'lanza' (guarda la
   distancia y lanza esquirlas; una parada las devuelve) y 'oni' (élite que guarda cada santuario: armadura de tinta y
   equilibrio como los gólems; roto, se arrodilla y se remata). El combate (21-combate.js) las golpea, las fija como
   objetivo y las aturde con la parada y el pulso; el daño a Hikari llega por 'dañoJugador' con { s } o { esq }.
   Brotan solo cuando Hikari ya lleva la Katana del Alba; al tomarla, un grupo brota en el Mirador. */
"use strict";

/* fichas. Comunes: ia, ánimo (vida), daño, velocidad (m/s), radio y alto (m), motas que sueltan, aviso antes de
   atacar (s), recuperación tras atacar (s), espera entre ataques (s), cuánto más les hace el pulso y dónde van los
   ojos (alto y adelanto, m). Por ia: salto { dur, alto, alcance } y órbita (m) de la rastrera; golpe { alcance, arco }
   y guardia { arco (rad) } del escudo; esquirla { vel, vida (s), radio, daño devuelta } y distancia [mín, máx] (y huye
   por debajo de huye m) de la lanzadora */
const SOMBRAS = {
  rastrera: { ia: 'salto', animo: 22, daño: 8, vel: 4.8, rodea: 2.4, r: .45, alto: .7, motas: 3, aviso: .50, recupera: .7, espera: [1.2, 2.6], pulso: 2, ojos: [.52, .74],
    salto: { dur: .40, alto: 1.1, alcance: 4.5 }, orbita: [3.2, 4.8] },
  escudo: { ia: 'escudo', animo: 34, daño: 10, vel: 2.6, r: .55, alto: 1.4, motas: 5, aviso: .65, recupera: .9, espera: [1.3, 2.4], pulso: 1, ojos: [1.22, .2],
    golpe: { alcance: 2, arco: 1.6, activo: .15 }, guardia: { arco: 130 * Math.PI / 180, giro: 120 * Math.PI / 180 }, orbita: [1.7, 2.2] },
  lanzadora: { ia: 'lanza', animo: 18, daño: 7, vel: 2.4, r: .4, alto: 1.5, motas: 4, aviso: .65, recupera: .85, espera: [1.8, 3], pulso: 1.5, ojos: [1.36, .16],
    esquirla: { vel: 12, vida: 2, r: .18, devuelta: 24 }, distancia: [8, 12], huye: 5, retirada: { distancia: 1, espera: 3 } },
  /* oni: armadura (parte del daño que recibe mientras no está roto), equilibrio { max, por golpe según su peso, por
     parada (fracción), por pulso, recuperación por segundo tras espera (s) y cuánto dura roto (s) }, golpes: mazazo (de
     frente, se puede parar) y barrido (alrededor, no se para: se salta o se esquiva), guarda (m: despierta) y correa (m:
     vuelve a su puesto y se cura) */
  oni: { ia: 'oni', animo: 240, daño: 18, vel: 2.4, r: .95, alto: 2.7, motas: 25, aviso: .85, recupera: 1.1, espera: [1.4, 2.6], pulso: 1, ojos: [2.28, .42],
    armadura: .25, equilibrio: { max: 90, golpe: 8, peso: [0, .6, 1, 1.6], parada: .35, pulso: 12, recupera: 10, espera: 3, roto: 3 },
    golpes: { mazazo: { alcance: 3.2, arco: 1.5, daño: 18, aviso: .85, activo: .18, recupera: 1.1 }, barrido: { radio: 3.3, daño: 14, aviso: .7, activo: .22, recupera: 1.2 } }, guarda: 18, correa: 30 }
};
/* ficha preparada para encuentros futuros. Comparte arte y equilibrio; no aparece en zonas ni guardias */
SOMBRAS.oniAvanzado = Object.assign({}, SOMBRAS.oni, { recupera: 1.3, secuencia: { pausa: .35, aviso: .40, recupera: 1.3 } });
/* onis que guardan los santuarios (rediseño: «santuario tomado por Sombras»): uno por santuario, en el camino de llegada
   (buscados sobre el terreno: llano y en tierra firme; en Escarcha, en el borde de la plataforma). Aparecen con la katana
   y mientras no se haya recuperado ese fragmento; vencido, queda en Sis.ST.onis */
const GUARDIAS_ONI = [
  { id: 'petalo', frag: 0, nom: 'Santuario del Pétalo', x: -219, z: -178 }, { id: 'duna', frag: 1, nom: 'Santuario de la Duna', x: 210, z: 198 },
  { id: 'marea', frag: 2, nom: 'Santuario de la Marea', x: -189, z: 178 }, { id: 'escarcha', frag: 3, nom: 'Santuario de Escarcha', x: 257, z: -181 }
];
/* estados de las escuelas de magia (op.lenta, op.durLenta, op.sujeta): tope de lentitud (fracción de la marcha), duración máxima de la lentitud y de la sujeción (s) y espera entre sujeciones (comunes y élites); los jefes no se congelan ni se desplazan */
const ESTADOS_SOMBRA = { lentaMax: .5, durLenta: 3, sujeta: 1.6, esperaSujeta: 4, esperaSujetaElite: 5 };
/* comunes: cuántas atacan a la vez, a qué diferencia de altura pueden atacar cuerpo a cuerpo (m), a qué distancia notan a Hikari, a cuál la dejan (desde su zona), segundos hasta
   que una zona limpia vuelve a llenarse, duraciones de brotar, romperse, herida, aturdimiento y guardia rota,
   aturdimiento del pulso, retraso de la emboscada del Mirador, cuánto más que su radio se apartan de Hikari (m), con qué parte de su velocidad
   rodean un sólido que las frena y colores */
const SOMBRAS_CFG = { atacantes: 2, altoAtaque: 2.4, aggro: 16, correa: 34, regenera: 240, brotar: .8, romper: .55, herido: .3, aturdido: 1.6, guardiaRota: 1.3, pulsoAturde: .7, emboscada: 2.2, separaJ: .35, rodear: .8,
  movimiento: { acelera: 12, frena: 16, espera: [1.8, 2.4], fijaAviso: .18, correccion: 15 * Math.PI / 180, atasco: .55, avanceMin: .04, lateral: 1.5, anticipaLanza: .25 },
  // m a los que aparece, desaparece (lejos) y se ve su barra
  oni: { aparece: 60, desaparece: 90, barra: 26 },
  // Sombras comunes que hay que romper antes de que despierte el primer oni guardián (la emboscada de la katana son tres)
  practica: { rotas: 3 },
  // con el cielo rojo: tipos de más en cada zona y fracción del tiempo en volver
  rojo: { extra: ['rastrera'], regenera: .5 },
  color: { cuerpo: 0x0a0910, lomo: 0x1c0b10, esquirla: 0x5a1210, hierro: 0x24222a, borde: 0xff3a2a, ojos: 0xff4a32, brasa: 0xff6a3a, luz: 0xffd27a } };
/* zonas: centro, radio y qué brota (de fácil a difícil: la Pradera solo rastreras; el escudo desde Sakura, la
   lanzadora desde los Lagos). Buscadas sobre el terreno: tierra firme y casi llana en 12 m, a más de 25 m de los
   lugares nivelados, 35 m de los descubribles, 45 m de las arenas y 30 m de las bocas de las cuevas */
const ZONAS_SOMBRA = [
  // Pradera
  { x: 40, z: -90, r: 9, tipos: ['rastrera', 'rastrera', 'rastrera'] }, { x: -21, z: 94, r: 9, tipos: ['rastrera', 'rastrera', 'rastrera', 'rastrera'] },
  // Sakura
  { x: -278, z: -150, r: 9, tipos: ['rastrera', 'rastrera', 'escudo'] }, { x: -175, z: -219, r: 9, tipos: ['rastrera', 'rastrera', 'rastrera', 'escudo'] },
  // Lagos
  { x: -183, z: 187, r: 9, tipos: ['rastrera', 'escudo', 'lanzadora'] },
  // Dunas
  { x: 209, z: 99, r: 10, tipos: ['rastrera', 'rastrera', 'lanzadora', 'lanzadora'] },
  // Kiri
  { x: 289, z: -132, r: 10, tipos: ['escudo', 'escudo', 'lanzadora', 'rastrera'] }
];

const Sombras = (() => {
  const C = SOMBRAS_CFG, lista = [], esquirlas = [], zonas = ZONAS_SOMBRA.map(z => Object.assign({ estado: 'libre', t: 0, n: 0 }, z));
  // El catálogo 75 añade fichas, arte, defensas y vuelo antes de crear encuentros.
  const variantes = { arte: {}, iniciar() {}, defensa: (s, dmg, op) => ({ dmg, op }), actualizar: () => false, suelo: () => false, posar() {} };
  let mat = null; const geos = {};

  /* ---------- arte (sustituible): tinta que tiembla y un borde rojo ---------- */
  function material() {
    if (mat) return mat;
    mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8, metalness: 0 });
    const uBorde = { value: lin(C.color.borde) };
    mat.onBeforeCompile = sh => {
      Atmosfera.inyectar(sh); sh.uniforms.uT = U.uT; sh.uniforms.uBorde = uBorde;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;').replace('#include <begin_vertex>', `#include <begin_vertex>
float fase = modelMatrix[3].x*.7 + modelMatrix[3].z*1.3;
transformed.xz += vec2(sin(uT*7. + transformed.y*9. + fase), cos(uT*6. + transformed.y*8. + fase))*.025*smoothstep(.0, .6, transformed.y);
transformed.y += sin(uT*5. + transformed.z*7. + fase)*.015;`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uBorde;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uBorde*pow(1. - abs(dot(normalize(vViewPosition), normal)), 5.)*.55;')
        // tinta mate: casi no refleja el cielo
        .replace('#include <aomap_fragment>', '#include <aomap_fragment>\nreflectedLight.indirectSpecular *= .2; reflectedLight.directSpecular *= .35; reflectedLight.indirectDiffuse *= .5;');
    };
    mat.customProgramCacheKey = () => 'sombra';
    return mat;
  }
  /* la misma tinta, más mate (para cuerpos grandes como los Cazadores): mismo programa, solo cambian uniformes */
  let matMate = null;
  function materialMate() {
    if (matMate) return matMate; const m = material();
    matMate = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, envMapIntensity: .3 }); matMate.onBeforeCompile = m.onBeforeCompile; matMate.customProgramCacheKey = m.customProgramCacheKey;
    return matMate;
  }
  const ARTE = {
    // rastrera: cuerpo bajo y alargado (tinta abollada), cabeza delante, púas en el lomo, jirones de humo atrás y seis patas finas
    rastrera(k, P) {
      P.push(pieza(abollar(icoSuave(1, 2), .22, 2.2, 3), k.cuerpo, { y: .38, sx: .4, sy: .22, sz: .7 }));
      P.push(pieza(abollar(icoSuave(1, 1), .16, 2.4, 5), k.cuerpo, { y: .44, z: .6, sx: .22, sy: .17, sz: .24 }));
      for (let i = 0; i < 3; i++) P.push(pieza(new THREE.ConeGeometry(.07 - i * .012, .8 + i * .2, 5), k.cuerpo, { x: (i - 1) * .14, y: .42 + i * .04, z: -.85 - i * .1, rx: -1.35 - i * .12, ry: (i - 1) * .2 }));
      for (let i = 0; i < 4; i++) P.push(pieza(new THREE.ConeGeometry(.06, .3, 5), k.lomo, { y: .7 - i * .02, z: .3 - i * .2, rx: -.5 }));
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) P.push(pieza(new THREE.ConeGeometry(.035, .5, 4), k.cuerpo, { x: s * .42, y: .3, z: .3 - i * .3, rz: s * (1.05 + i * .1), ry: (i - 1) * .3 * s }));
    },
    // escudo: encorvado y ancho, piernas gruesas, brazos que sujetan el farol (el farol es una malla aparte: se rompe)
    escudo(k, P) {
      P.push(pieza(abollar(icoSuave(1, 2), .2, 2, 7), k.cuerpo, { y: .95, sx: .42, sy: .5, sz: .34, rx: .25 }));
      P.push(pieza(abollar(icoSuave(1, 1), .14, 2.4, 8), k.cuerpo, { y: 1.28, z: .12, sx: .2, sy: .19, sz: .2 }));
      for (const s of [-1, 1]) {
        P.push(pieza(new THREE.ConeGeometry(.13, .62, 6), k.cuerpo, { x: s * .2, y: .3, rx: Math.PI }));
        P.push(pieza(new THREE.ConeGeometry(.08, .7, 5), k.cuerpo, { x: s * .36, y: .8, z: .25, rx: 1.15, rz: -s * .3 }));
      }
      for (let i = 0; i < 3; i++) P.push(pieza(new THREE.ConeGeometry(.07, .9, 5), k.cuerpo, { x: (i - 1) * .16, y: .75, z: -.35, rx: -1.25 }));
      for (let i = 0; i < 5; i++) P.push(pieza(new THREE.ConeGeometry(.05, .28, 5), k.lomo, { x: (i - 2) * .12, y: 1.2 - Math.abs(i - 2) * .06, z: -.22, rx: -.7 }));
    },
    // farol apagado de hierro: caja con barrotes y tejadillo
    farol(k, P) {
      P.push(pieza(new THREE.BoxGeometry(.42, .5, .3), k.hierro, { y: 0 }));
      P.push(pieza(new THREE.ConeGeometry(.34, .2, 4), k.hierro, { y: .34, ry: Math.PI / 4 }));
      for (const s of [-1, 1]) P.push(pieza(new THREE.BoxGeometry(.05, .5, .34), k.lomo, { x: s * .1 }));
    },
    // oni: grande y encorvado, cuernos, brazo izquierdo colgando (el derecho, con la maza, es una malla aparte que gira)
    oni(k, P) {
      P.push(pieza(abollar(icoSuave(1, 2), .16, 1.6, 21), k.cuerpo, { y: 1.65, sx: .75, sy: .82, sz: .55, rx: .2 }));
      P.push(pieza(abollar(icoSuave(1, 2), .12, 2, 22), k.cuerpo, { y: 2.3, z: .3, sx: .34, sy: .3, sz: .32 }));
      for (const s of [-1, 1]) {
        // cuernos
        P.push(pieza(new THREE.ConeGeometry(.09, .55, 6), k.lomo, { x: s * .22, y: 2.62, z: .25, rz: -s * .45, rx: -.2 }));
        // piernas
        P.push(pieza(new THREE.ConeGeometry(.22, 1.05, 6), k.cuerpo, { x: s * .32, y: .5, rx: Math.PI }));
      }
      // brazo izquierdo
      P.push(pieza(new THREE.ConeGeometry(.16, 1.2, 6), k.cuerpo, { x: -.72, y: 1.45, z: .15, rz: .25, rx: .2 }));
      for (let i = 0; i < 5; i++) P.push(pieza(new THREE.ConeGeometry(.08, .45, 5), k.lomo, { x: (i - 2) * .2, y: 2.15 - Math.abs(i - 2) * .12, z: -.42, rx: -.75 }));
      for (let i = 0; i < 3; i++) P.push(pieza(new THREE.ConeGeometry(.1, 1.2 + i * .2, 5), k.cuerpo, { x: (i - 1) * .3, y: 1.3, z: -.5, rx: -1.25 }));
    },
    // brazo derecho con la maza de tinta: el origen es el hombro y cuelga hacia abajo
    maza(k, P) {
      P.push(pieza(new THREE.ConeGeometry(.17, 1.1, 6), k.cuerpo, { y: -.5, rx: Math.PI }));
      P.push(pieza(new THREE.CylinderGeometry(.07, .08, 1, 6), k.hierro, { y: -1.25, z: .25, rx: 1.3 }));
      P.push(pieza(abollar(icoSuave(1, 1), .2, 2.6, 23), k.cuerpo, { y: -1.4, z: .85, sx: .32, sy: .3, sz: .42 }));
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; P.push(pieza(new THREE.ConeGeometry(.06, .3, 4), k.esquirla, { x: Math.cos(a) * .3, y: -1.4 + Math.sin(a) * .26, z: .85, rz: a - Math.PI / 2 })); }
    },
    // lanzadora: alta y flaca, brazos largos, esquirlas rojas clavadas en la espalda
    lanzadora(k, P) {
      P.push(pieza(abollar(icoSuave(1, 2), .18, 2.4, 9), k.cuerpo, { y: 1, sx: .24, sy: .55, sz: .2 }));
      P.push(pieza(abollar(icoSuave(1, 1), .14, 2.4, 10), k.cuerpo, { y: 1.42, z: .06, sx: .15, sy: .17, sz: .15 }));
      for (const s of [-1, 1]) {
        P.push(pieza(new THREE.ConeGeometry(.07, .9, 5), k.cuerpo, { x: s * .12, y: .42, rx: Math.PI }));
        P.push(pieza(new THREE.ConeGeometry(.045, .95, 4), k.cuerpo, { x: s * .3, y: .9, z: .1, rz: -s * .35, rx: .3 }));
      }
      for (let i = 0; i < 5; i++) P.push(pieza(new THREE.ConeGeometry(.045, .5 + (i % 2) * .2, 4), k.esquirla, { x: (i - 2) * .09, y: 1.15 + (i % 2) * .1, z: -.18, rx: -.45 - (i % 3) * .15, rz: (i - 2) * .2 }));
      for (let i = 0; i < 2; i++) P.push(pieza(new THREE.ConeGeometry(.05, .8, 5), k.cuerpo, { x: (i - .5) * .16, y: .7, z: -.2, rx: -1.3 }));
    }
  };
  function geometria(tipo) { if (!geos[tipo]) { const P = []; (ARTE[tipo] || variantes.arte[tipo])(Object.assign({}, C.color, SOMBRAS[tipo] && SOMBRAS[tipo].color), P); geos[tipo] = fusionar(P); } return geos[tipo]; }
  /* malla de muestra para compilar el programa durante la carga (todas comparten material y atributos) */
  function muestras() {
    const g = new THREE.Group(), tipos = new Set(Object.keys(SOMBRAS).map(t => SOMBRAS[t].arte || (t === 'oniAvanzado' ? 'oni' : t)));
    for (const t of new Set([...tipos, 'farol', 'maza', ...Object.keys(variantes.arte)])) g.add(new THREE.Mesh(geometria(t), material()), new THREE.Mesh(geometria(t), materialMate()));
    g.add(marcaSuelo('sector')); g.visible = false; return g;
  }
  /* marcas rojas en el suelo de los golpes del oni (como las de los gólems) */
  const geoMarca = { sector: null, anillo: null };
  function marcaSuelo(tipo) {
    if (!geoMarca.sector) { const a = SOMBRAS.oni.golpes.mazazo.arco; geoMarca.sector = new THREE.CircleGeometry(1, 24, -a / 2, a).rotateX(-Math.PI / 2); geoMarca.anillo = new THREE.RingGeometry(.86, 1, 40).rotateX(-Math.PI / 2); }
    const m = new THREE.Mesh(geoMarca[tipo], new THREE.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: .4, depthWrite: false, side: THREE.DoubleSide, fog: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.renderOrder = 3; m.visible = false; scene.add(m); return m;
  }
  function halo(color, tam) { const h = new Halo(color, .9); h.scale.set(tam, tam, 1); scene.add(h); return h; }

  /* ---------- crear, brotar y romper ---------- */
  /* o (opcional): y, a qué altura brota (sobre una plataforma), y fija: no se mueve de donde brota (en la espiral del faro) */
  function crear(tipo, x, z, zona, o) {
    const perfil = o && o.perfil || zona && zona.perfil || ProgresionEnemiga.capturar(ProgresionEnemiga.region(x, z));
    const E = ProgresionEnemiga.sombra(SOMBRAS[tipo], perfil), m = new THREE.Mesh(geometria(E.arte || (tipo === 'oniAvanzado' ? 'oni' : tipo)), material()); m.castShadow = true; scene.add(m);
    const ojos = [-1, 1].map(() => halo(E.color && E.color.ojos || C.color.ojos, .16)), y = o && o.y !== undefined ? o.y : altura(x, z);
    const s = { tipo, E, m, ojos, zona, x, y, z, fija: !!(o && o.fija), yaw: Math.random() * TAU, vx: 0, vz: 0, mx: 0, mz: 0, animo: E.animo, estado: 'brotar', t: 0, cd: rnd(.4, 1.2), ang: Math.random() < .5 ? 1 : -1, orb: E.orbita ? rnd(E.orbita[0], E.orbita[1]) : 0, golpeo: false, permiso: false, esperaPermiso: false, retiradaT: 0, atascoT: 0 };
    if (E.ia === 'escudo' && !E.defensa) { s.farol = new THREE.Mesh(geometria('farol'), material()); s.farol.position.set(0, .82, .52); m.add(s.farol); s.guardia = true; }
    if (E.ia === 'lanza') s.mano = halo(E.color && E.color.esquirla || C.color.borde, .1);
    if (E.ia === 'oni') {
      s.brazo = new THREE.Group(); s.brazo.position.set(.75, 2.05, .1); m.add(s.brazo); s.brazo.add(new THREE.Mesh(geometria('maza'), material()));
      s.brazo.children[0].castShadow = true; s.eq = E.equilibrio.max; s.eqT = 9; s.post = { x, z }; s.marcas = { sector: marcaSuelo('sector'), anillo: marcaSuelo('anillo') };
    }
    variantes.iniciar(s, geometria);
    s.velEspera = rnd(C.movimiento.espera[0], C.movimiento.espera[1]);
    s.perfil = perfil; lista.push(s); FX.rafaga(x, y + .2, z, 16, 2.5, .7, .2, C.color.brasa, 1); Sonido.sfx('sombraBrota', { pos: { x, y, z } });
    return s;
  }
  function brotar(zona, cx, cz, tipos) {
    zona.perfil = ProgresionEnemiga.capturar(ProgresionEnemiga.region(cx, cz));
    let k = 0;
    for (let i = 0; i < 60 && k < tipos.length; i++) {
      const a = Math.random() * TAU, d = rnd(1.5, zona.r), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (altura(x, z) < NIVEL_AGUA + .2 && !esHielo(x, z)) continue;
      crear(tipos[k], x, z, zona); k++;
    }
    zona.n = k; zona.estado = 'activa';
  }
  function quitar(s) {
    if (!lista.includes(s)) return;
    cancelarEsquirlas(s); DirectorCombate.liberar(s);
    scene.remove(s.m); for (const h of s.ojos) scene.remove(h); if (s.mano) scene.remove(s.mano);
    if (s.marcas) for (const k in s.marcas) { scene.remove(s.marcas[k]); s.marcas[k].material.dispose(); }
    lista.splice(lista.indexOf(s), 1); if (s.zona) s.zona.n--; if (s.guardia_) s.guardia_.s = null;
    if (!lista.length && !esquirlas.length) DirectorCombate.reiniciar();
  }
  /* consejo de combate de una sola vez por partida (Sis.ST.consejos) */
  function aconsejar(id, txt) {
    const ST = Sis.ST; ST.consejos = ST.consejos || {};
    if (ST.consejos[id] || Cin.activa) return;
    ST.consejos[id] = 1; UI.aviso(txt, 'mision');
  }
  Bus.on('dañoJugador', e => { if (e.s) aconsejar('golpe', 'Cada Sombra avisa antes de golpear: esquiva ({esquivar}) cuando brillen sus ojos'); });
  function romper(s) {
    if (s.estado === 'romper') return;
    cancelarEsquirlas(s); interrumpir(s);
    s.estado = 'romper'; s.t = 0;
    FX.rafaga(s.x, s.y + .4, s.z, 26, 3.2, .9, .2, C.color.brasa, 1); FX.rafaga(s.x, s.y + .5, s.z, 18, 2, 1.4, .24, C.color.luz, 2);
    Sonido.sfx('sombraRompe', { pos: { x: s.x, y: s.y, z: s.z } });
    Sis.rescatar(s.E.motas); Bus.emit('sombraRota', { tipo: s.tipo });
    if (!s.guardia_) { const ST = Sis.ST; ST.sombrasRotas = (ST.sombrasRotas || 0) + 1; aconsejar('rota', 'Una parada a tiempo ({guardia} justo antes del golpe) abre a la Sombra y te da luz'); }
    if (s.guardia_) { const ST = Sis.ST; ST.onis = ST.onis || {}; ST.onis[s.guardia_.id] = 1; UI.banner('Oni de sombra vencido', s.guardia_.nom + ' queda libre', 'luz', 'mision'); Sis.guardar(); }
  }
  /* el farol del escudo se quiebra: ya no para nada y queda aturdida un momento */
  function romperGuardia(s) {
    interrumpir(s);
    s.guardia = false; s.farol.visible = false; s.estado = 'aturdido'; s.t = C.aturdido - C.guardiaRota;
    const p = s.farol.getWorldPosition(new THREE.Vector3());
    FX.rafaga(p.x, p.y, p.z, 22, 3.5, .6, .16, 0xc8c0d0, 1); Sonido.sfx('rota'); FX.numero('¡Guardia rota!', s.x, s.y + 1.9, s.z, '#ffd0b0');
  }

  /* ---------- golpes de Hikari ----------
     o: { peso, empuje, romper } — romper: golpe cargado, arma pesada, onda o pulso (quiebran el farol del escudo).
     Devuelve false si no la toca, 'bloqueo' si el farol lo para y true si la daña */
  /* lentitud y sujeción que dejan las escuelas: la lentitud se queda con el valor más alto y vence sola; la sujeción espera su tiempo y no corta un ataque en marcha */
  function estados(s, o) {
    const Q = ESTADOS_SOMBRA;
    if (o.lenta > 0) { s.lentaK = Math.max(s.lentaT > 0 ? s.lentaK : 0, Math.min(Q.lentaMax, o.lenta)); s.lentaT = Math.max(s.lentaT || 0, Math.min(Q.durLenta, o.durLenta || 1)); FX.rafaga(s.x, s.y + s.E.alto * .5, s.z, 5, 1, .35, .1, 0xbfe8ff, 1); }
    if (o.sujeta > 0 && !(s.sujetaEspera > 0)) { s.sujetaT = Math.min(Q.sujeta, o.sujeta); s.sujetaEspera = s.E.ia === 'oni' ? Q.esperaSujetaElite : Q.esperaSujeta; FX.rafaga(s.x, s.y + s.E.alto * .5, s.z, 6, 1, .4, .1, 0x3a2a4a, 1); }
  }
  function golpear(s, dmg, ux, uz, o) {
    if (s.estado === 'romper' || s.estado === 'brotar') return false;
    o = o || {};
    if (s.E.vuelo && !o.vertical && Math.abs((o.origenY !== undefined ? o.origenY : J.y) - s.y) >= C.altoAtaque) return false;
    const ajuste = variantes.defensa(s, dmg, o, ux, uz); dmg = ajuste.dmg; o = ajuste.op;
    estados(s, o);
    if (s.E.ia === 'oni') return golpearOni(s, dmg, ux, uz, o);
    // de frente: el farol
    if (s.guardia && Math.abs(angDif(s.yaw, Math.atan2(-ux, -uz))) < s.E.guardia.arco / 2) {
      if (!o.romper) { FX.rafaga(s.x - ux * .5, s.y + .9, s.z - uz * .5, 12, 3, .3, .12, 0xfff0c0, 1); Sonido.sfx('bloqueo'); s.vx = ux * 1.5; s.vz = uz * 1.5; return 'bloqueo'; }
      romperGuardia(s);
    }
    s.animo -= dmg; FX.numero(String(Math.round(dmg)), s.x, s.y + s.E.alto + .3, s.z, '#ffd0b0'); FX.rafaga(s.x, s.y + s.E.alto * .6, s.z, 8, 2.2, .4, .14, C.color.brasa, 1);
    const emp = o.empuje !== undefined ? o.empuje : 2; s.vx = ux * (emp + 3); s.vz = uz * (emp + 3);
    if (s.animo <= 0) { romper(s); return true; }
    if (!['salto', 'golpe', 'recuperar', 'aturdido'].includes(s.estado)) { interrumpir(s); s.estado = 'herido'; s.t = 0; }
    return true;
  }
  function enRango(x, z, yaw, alc, ang, op) {
    const out = []; for (const s of lista) { if (s.estado === 'romper' || s.estado === 'brotar') continue; if (s.E.vuelo && !(op && op.vertical) && Math.abs((op && op.y !== undefined ? op.y : J.y) - s.y) >= C.altoAtaque) continue; const dx = s.x - x, dz = s.z - z, d = Math.hypot(dx, dz) - s.E.r; if (d > alc) continue; if (Math.abs(angDif(yaw, Math.atan2(dx, dz))) <= ang + .25) out.push(s); }
    return out;
  }
  /* oni: mientras no está roto, la armadura de tinta se queda con casi todo el daño y cada golpe gasta su equilibrio
     (según el peso; un contraataque, más); sin equilibrio queda roto (de rodillas) y recibe el daño entero */
  function golpearOni(s, dmg, ux, uz, o) {
    const E = s.E, Q = E.equilibrio, roto = s.estado === 'roto';
    if (!roto) {
      s.eq -= (o.pulso ? Q.pulso : Q.golpe * Q.peso[o.peso || 1] * (o.contra ? 1.5 : 1)) * (o.equilibrioSombra !== undefined ? o.equilibrioSombra : 1); s.eqT = 0; dmg *= E.armadura;
      // Un golpe pesado durante el aviso lo interrumpe.
      if ((o.peso || 1) >= 3 && (s.estado === 'aviso' || s.estado === 'pausa')) { interrumpir(s); s.estado = 'tambaleo'; s.t = 0; ocultarMarcas(s); }
    }
    s.animo -= dmg; FX.numero(String(Math.round(dmg)), s.x, s.y + E.alto + .3, s.z, roto ? '#fff2b0' : '#c8b8b0'); FX.rafaga(s.x, s.y + E.alto * .6, s.z, 8, 2.2, .4, .14, C.color.brasa, 1);
    if (s.animo <= 0) { ocultarMarcas(s); romper(s); return true; }
    if (!roto && s.eq <= 0) { interrumpir(s); s.estado = 'roto'; s.t = 0; ocultarMarcas(s); Sonido.sfx('rota'); FX.numero('¡Roto!', s.x, s.y + E.alto + .6, s.z, '#fff2b0'); J.shake = Math.max(J.shake || 0, .5); }
    return true;
  }
  function ocultarMarcas(s) { if (s.marcas) for (const k in s.marcas) s.marcas[k].visible = false; }
  function pulso(x, z, r, dmg) {
    for (const s of lista.slice()) {
      if (s.estado === 'romper') continue; const dx = s.x - x, dz = s.z - z, d = Math.hypot(dx, dz) || 1; if (d > r + s.E.r || s.E.vuelo && Math.abs(J.y - s.y) >= C.altoAtaque) continue;
      if (golpear(s, dmg * (s.E.pulso || 1), dx / d, dz / d, { elemento: 'luz', empuje: s.E.ia === 'oni' ? 0 : 6, romper: true, pulso: true }) && s.estado !== 'romper' && s.E.ia !== 'oni') { interrumpir(s); s.estado = 'aturdido'; s.t = C.aturdido - C.pulsoAturde; }
    }
    // El pulso deshace las esquirlas y termina su amenaza al instante.
    for (const e of esquirlas) if (Math.hypot(e.x - x, e.z - z) < r) { e.vida = 0; terminarEsquirla(e); }
  }
  /* parada de Hikari: el salto o el golpe rebota y la Sombra queda aturdida */
  function desviar(s, ux, uz) {
    if (s.estado === 'romper') return;
    interrumpir(s);
    if (s.E.ia === 'oni') { s.eq -= s.E.equilibrio.max * s.E.equilibrio.parada; s.eqT = 0; ocultarMarcas(s); if (s.eq <= 0) { s.estado = 'roto'; Sonido.sfx('rota'); } else s.estado = 'tambaleo'; s.t = 0; return; } s.estado = 'aturdido'; s.t = 0; s.vx = ux * 6; s.vz = uz * 6; s.animo -= s.E.animo * .25; if (s.animo <= 0) romper(s); }

  /* ---------- esquirlas de la lanzadora ---------- */
  function liberarAtaque(s) {
    if (s.esquirlaActiva) return;
    DirectorCombate.liberar(s); s.permiso = false;
  }
  function interrumpir(s) {
    if (s.esquirlaActiva) { s.interrumpidoEnVuelo = true; return; }
    DirectorCombate.interrumpido(s); s.permiso = false; s.segundo = false;
  }
  function terminarEsquirla(e) {
    if (e.terminada) return;
    e.terminada = true; const s = e.dueña; s.esquirlaActiva = false;
    if (s.interrumpidoEnVuelo) { s.interrumpidoEnVuelo = false; interrumpir(s); }
    if (s.estado !== 'recuperar') liberarAtaque(s);
  }
  function cancelarEsquirlas(s) {
    for (let i = esquirlas.length - 1; i >= 0; i--) {
      const e = esquirlas[i]; if (e.dueña !== s) continue;
      e.terminada = true; scene.remove(e.h); esquirlas.splice(i, 1);
    }
    s.esquirlaActiva = false; s.interrumpidoEnVuelo = false;
  }
  function lanzar(s, J) {
    const E = s.E.esquirla, ox = s.x + Math.sin(s.yaw) * .4, oz = s.z + Math.cos(s.yaw) * .4, oy = s.y + 1.25;
    const dy = s.objY + 1 - oy, horizontal = Math.hypot(s.objX - ox, s.objZ - oz), l = Math.hypot(horizontal, dy) || 1;
    s.esquirlaActiva = true;
    esquirlas.push({ x: ox, y: oy, z: oz, vx: Math.sin(s.yaw) * horizontal / l * E.vel, vy: dy / l * E.vel, vz: Math.cos(s.yaw) * horizontal / l * E.vel, vida: Math.min(E.vida, DIRECTOR.vidaEsquirla), dueña: s, ox: s.x, oz: s.z, h: halo(s.E.color && s.E.color.esquirla || C.color.borde, .5), devuelta: false });
    Sonido.sfx('sombraLanza', { pos: { x: ox, y: oy, z: oz } });
  }
  /* parada a tiempo: la esquirla vuelve a quien la lanzó */
  function devolver(e) { terminarEsquirla(e); e.devuelta = true; e.vida = 2.5; e.h.color.setHex(C.color.luz); FX.rafaga(e.x, e.y, e.z, 14, 3, .4, .14, C.color.luz, 1); }
  function actualizarEsquirlas(dt, J) {
    for (let i = esquirlas.length - 1; i >= 0; i--) {
      const e = esquirlas[i], E = e.dueña.E.esquirla, paso = Math.min(dt, Math.max(0, e.vida)), x0 = e.x, y0 = e.y, z0 = e.z;
      e.vida -= dt;
      // vuelve guiada hacia su dueña
      if (e.devuelta) {
        const s = e.dueña, dx = s.x - e.x, dy = s.y + s.E.alto * .6 - e.y, dz = s.z - e.z, l = Math.hypot(dx, dy, dz) || 1, v = E.vel * 1.3;
        e.vx = dx / l * v; e.vy = dy / l * v; e.vz = dz / l * v;
        if (l < .7 && lista.includes(s)) { golpear(s, E.devuelta, dx / l, dz / l, { empuje: 4, romper: true }); e.vida = 0; }
      }
      if (!esquirlas.includes(e)) continue;
      e.x += e.vx * paso; e.y += e.vy * paso; e.z += e.vz * paso;
      // Barrido del trayecto: el radio pequeño no debe saltarse a Hikari entre dos pasos.
      const sx = e.x - x0, sz = e.z - z0, u = clamp(((J.x - x0) * sx + (J.z - z0) * sz) / (sx * sx + sz * sz || 1), 0, 1), y = lerp(y0, e.y, u);
      if (paso > 0 && !e.terminada && !e.devuelta && J.vivo && !Cin.activa && !UI.dlg && Math.hypot(J.x - lerp(x0, e.x, u), J.z - lerp(z0, e.z, u)) < E.r && y > J.y - .2 && y < J.y + 1.9) { e.vida = 0; terminarEsquirla(e); Bus.emit('dañoJugador', { dmg: e.dueña.E.daño, x: e.ox, z: e.oz, esq: e }); }
      if (e.y < altura(e.x, e.z)) e.vida = 0;
      e.h.position.set(e.x, e.y, e.z); e.h.opacidad = .95;
      if (Math.random() < dt * 40) FX.emit(e.x, e.y, e.z, 0, .3, 0, .25, .12, e.devuelta ? C.color.luz : C.color.brasa, .8);
      if (e.vida <= 0) { terminarEsquirla(e); if (!e.devuelta || e.vida > -1) FX.rafaga(e.x, e.y, e.z, 6, 1.5, .25, .1, C.color.brasa, 1); scene.remove(e.h); esquirlas.splice(i, 1); }
    }
  }

  /* ---------- IA ---------- */
  const ATACA = { aviso: 1, salto: 1, golpe: 1, pausa: 1, picado: 1 };
  const atacando = () => lista.filter(s => ATACA[s.estado]).length;
  function mover(s, dt, tx, tz, vel) {
    if (s.fija || dt <= 0) { s.mx = s.mz = 0; return; }
    if (s.sujetaT > 0) vel = 0; else if (s.lentaT > 0) vel *= 1 - s.lentaK;
    const M = C.movimiento, dx = tx - s.x, dz = tz - s.z, d = Math.hypot(dx, dz), v = Math.min(vel, Math.sqrt(2 * M.frena * d), d / dt);
    const vx = d > .01 ? dx / d * v : 0, vz = d > .01 ? dz / d * v : 0, ex = vx - s.mx, ez = vz - s.mz, cambio = Math.hypot(ex, ez);
    const frena = v < Math.hypot(s.mx, s.mz) || s.mx * vx + s.mz * vz < 0, k = Math.min(1, (frena ? M.frena : M.acelera) * dt / (cambio || 1));
    s.mx += ex * k; s.mz += ez * k;
    const nx = s.x + s.mx * dt, nz = s.z + s.mz * dt;
    // No entran en el agua.
    if (altura(nx, nz) < NIVEL_AGUA + .1 && !esHielo(nx, nz)) { s.mx = s.mz = 0; s.ang = -s.ang; return; }
    s.x = nx; s.z = nz;
  }
  function girar(s, objetivo, dt, rapidez) {
    const paso = angDif(s.yaw, objetivo), giro = s.E.guardia ? s.E.guardia.giro * dt : Math.abs(paso) * (1 - Math.exp(-rapidez * dt));
    s.yaw += clamp(paso, -giro, giro);
  }
  function apuntar(s, J, aviso, dt) {
    const M = C.movimiento;
    if (!s.fijado) {
      const adelanto = s.E.ia === 'lanza' ? M.anticipaLanza : 0;
      s.objX = J.x + (J.vx || 0) * adelanto; s.objY = J.y; s.objZ = J.z + (J.vz || 0) * adelanto;
      if (s.t >= aviso - M.fijaAviso) { s.fijado = true; s.correccion = 0; }
    }
    const objetivo = Math.atan2(s.objX - s.x, s.objZ - s.z);
    if (!s.fijado) { girar(s, objetivo, dt, 8); return; }
    const antes = s.yaw; girar(s, objetivo, dt, 8);
    const cambio = clamp(angDif(antes, s.yaw), -(M.correccion - s.correccion), M.correccion - s.correccion);
    s.yaw = antes + cambio; s.correccion += Math.abs(cambio);
  }
  function fichaGolpe(s) {
    const G = s.E.golpes[s.golpe];
    return s.paso === 2 ? Object.assign({}, G, { aviso: s.E.secuencia.aviso }) : G;
  }
  function pedirAtaque(s, J, d) {
    if (s.sujetaT > 0) return false;
    if (s.esquirlaActiva || atacando() >= C.atacantes) { s.esperaPermiso = true; return false; }
    const E = s.E, oni = E.ia === 'oni', G = oni ? E.golpes[s.golpe] : null;
    const aviso = G ? G.aviso : E.aviso, activo = G ? G.activo : E.picado ? E.picado.dur : E.salto ? E.salto.dur : E.golpe ? E.golpe.activo : 0;
    const llegadaSalto = E.salto ? E.salto.dur * clamp((d - E.r - .55) / Math.max(.01, d - .4), 0, 1) : 0;
    const impacto = aviso + (E.esquirla ? Math.max(0, d - .4) / E.esquirla.vel : E.picado ? E.picado.dur - E.golpe.activo : llegadaSalto);
    const impactos = [impacto], avisos = [0];
    let total = aviso + activo + (G ? G.recupera : E.recupera);
    if (E.esquirla) total = aviso + Math.max(E.recupera, DIRECTOR.vidaEsquirla);
    if (oni && E.secuencia) {
      const segundo = aviso + activo + E.secuencia.pausa;
      avisos.push(segundo); impactos.push(segundo + E.secuencia.aviso);
      total = segundo + E.secuencia.aviso + G.activo + E.secuencia.recupera;
    }
    const permitido = DirectorCombate.pedir(s, E.coste || (oni ? DIRECTOR.pesado : DIRECTOR.ligero),
      { total: total + DIRECTOR.margenPermiso, impactos, avisos, jefe: oni, zonaGrande: oni && s.golpe === 'barrido' });
    s.esperaPermiso = !permitido;
    if (!permitido) return false;
    s.permiso = true; s.estado = 'aviso'; s.t = 0; s.fijado = false; s.correccion = 0; s.golpeo = false; s.paso = 1;
    s.segundo = !!(oni && E.secuencia); apuntar(s, J, aviso, 0);
    if (oni) s.marcas[s.golpe === 'barrido' ? 'anillo' : 'sector'].visible = true;
    Sonido.sfx(E.sonidoAviso || 'sombraSalto', { k: -2, pos: { x: s.x, y: s.y, z: s.z } });
    return true;
  }
  /* acechar según su ia: dónde quiere estar y si ya puede atacar. Rodean a Hikari desde donde están (un poco
     adelantadas en su sentido de giro, s.ang = ±1), así nunca cruzan por delante de ella */
  function acechar(s, dt, J, d, dx, dz, vivo) {
    const E = s.E, rumbo = Math.atan2(-dx, -dz), giro = s.ang > 0 ? 1 : -1, espera = s.velEspera;
    if (E.ia === 'lanza') {
      const [dmin, dmax] = E.distancia; let tx, tz;
      if (!s.fija && d < dmin && s.retiradaT <= 0) {
        s.retiradaT = E.retirada.espera; s.retirada = { x: s.x - dx / (d || 1) * E.retirada.distancia, z: s.z - dz / (d || 1) * E.retirada.distancia };
      }
      if (s.retirada) { tx = s.retirada.x; tz = s.retirada.z; if (Math.hypot(tx - s.x, tz - s.z) < .05) s.retirada = null; }
      else {
        // Cerca de Hikari solo se desplaza de lado. La retirada tiene su propio límite.
        const r = d < dmin ? d : clamp(d, dmin, dmax), a = rumbo + giro * .25;
        tx = J.x + Math.sin(a) * r; tz = J.z + Math.cos(a) * r;
      }
      if (!s.fija && (d < C.aggro + 4 || !vivo)) mover(s, dt, tx, tz, Math.min(E.vel, espera));
      return vivo && s.cd <= 0 && d < dmax + 3 && d > (s.fija ? 1 : E.huye);
    }
    if (!vivo) s.orb = E.orbita[1] + 6;
    const a = rumbo + giro * (E.ia === 'escudo' ? .2 : .45), tx = J.x + Math.sin(a) * s.orb, tz = J.z + Math.cos(a) * s.orb;
    const alcance = E.ia === 'escudo' ? E.golpe.alcance + .4 : E.salto.alcance;
    const vel = s.esperaPermiso || s.cd > 0 ? espera : E.ia === 'salto' && d <= alcance ? E.rodea : E.vel;
    if (!s.fija && (d < C.aggro || !vivo)) mover(s, dt, tx, tz, vel);
    // A su altura: no ataca a quien está muy arriba o abajo.
    return vivo && s.cd <= 0 && d < alcance && Math.abs(J.y - s.y) < C.altoAtaque;
  }
  /* contacto único durante la fase activa, también si Hikari entra después del primer paso */
  function contacto(s, J, vivo) {
    if (s.golpeo || !vivo) return;
    const E = s.E, dx = J.x - s.x, dz = J.z - s.z, d = Math.hypot(dx, dz), G = E.ia === 'oni' ? fichaGolpe(s) : E.golpe;
    const barrido = E.ia === 'oni' && s.golpe === 'barrido', alto = E.ia === 'oni' ? J.y - s.y <= .8 && J.y - s.y > -.8 : Math.abs(J.y - s.y) < C.altoAtaque;
    if (alto && (barrido ? d < G.radio + .4 : d < G.alcance + E.r * (E.ia === 'oni' ? .5 : 1) && Math.abs(angDif(s.yaw, Math.atan2(dx, dz))) < G.arco / 2)) {
      s.golpeo = true; Bus.emit('dañoJugador', { dmg: G.daño || E.daño, x: s.x, z: s.z, s, imparable: barrido });
    }
  }
  /* al acabar el aviso: la trayectoria usa el blanco que ya se vio en la pose */
  function atacar(s, J, vivo) {
    const E = s.E;
    if (E.ia === 'salto') { s.estado = 'salto'; s.recorrido = Math.min(E.salto.alcance, Math.max(0, Math.hypot(s.objX - s.x, s.objZ - s.z) - .4)); s.saltoU = 0; s.golpeo = false; }
    else if (E.ia === 'escudo') {
      s.estado = 'golpe'; Sonido.sfx('corte', { peso: 2, pos: { x: s.x, y: s.y, z: s.z } });
    } else { s.estado = 'recuperar'; if (vivo) lanzar(s, J); }
    s.t = 0;
    if (s.estado === 'golpe') contacto(s, J, vivo);
  }
  /* ---------- oni ---------- */
  function actualizarOni(s, dt, J, d, dx, dz, vivo) {
    const E = s.E, Q = E.equilibrio, dPost = Math.hypot(J.x - s.post.x, J.z - s.post.z);
    if (s.estado !== 'roto') { s.eqT += dt; if (s.eqT > Q.espera) s.eq = Math.min(Q.max, s.eq + Q.recupera * dt); }
    switch (s.estado) {
      case 'brotar': if (s.t > C.brotar) { s.estado = 'guardia'; s.t = 0; } break;
      // Mira al camino que viene del faro.
      case 'guardia': s.yaw = angDamp(s.yaw, Math.atan2(-s.post.x, -s.post.z), 2, dt);
        if (vivo && d < E.guarda) { s.estado = 'acechar'; s.t = 0; s.cd = 1; if (!s.avisado && s.guardia_) { s.avisado = true; UI.aviso(E.pista || 'Un oni de sombra guarda el ' + s.guardia_.nom + ': agota su equilibrio y remátalo', 'error'); } }
        break;
      case 'volver': mover(s, dt, s.post.x, s.post.z, E.vel * 1.4); s.yaw = angDamp(s.yaw, Math.atan2(s.post.x - s.x, s.post.z - s.z), 6, dt);
        if (Math.hypot(s.x - s.post.x, s.z - s.post.z) < .6) { s.estado = 'guardia'; s.animo = E.animo; s.eq = Q.max; }
        break;
      case 'acechar':
        s.yaw = angDamp(s.yaw, Math.atan2(dx, dz), 3.5, dt);
        if (!vivo || dPost > E.correa) { liberarAtaque(s); s.estado = 'volver'; break; }
        if (s.cd <= 0 && d < 3.6) {
          // Decide la rama antes de pedir el primer aviso. No reacciona a la defensa de Hikari.
          if (!s.esperaPermiso) s.golpe = d < 2.6 && Math.random() < .4 ? 'barrido' : 'mazazo';
          if (pedirAtaque(s, J, d)) break;
        }
        if (s.esperaPermiso || d <= 2.4) {
          const a = Math.atan2(-dx, -dz) + s.ang * .35, r = Math.max(2.2, d);
          mover(s, dt, J.x + Math.sin(a) * r, J.z + Math.cos(a) * r, s.velEspera);
        } else mover(s, dt, J.x - dx / (d || 1) * 2.2, J.z - dz / (d || 1) * 2.2, E.vel);
        break;
      case 'aviso': {
        const G = fichaGolpe(s); apuntar(s, J, G.aviso, dt);
        if (s.t >= G.aviso) {
          ocultarMarcas(s); s.estado = 'golpe'; s.t = 0; s.golpeo = false; Sonido.sfx('golpe', { peso: 3, pos: { x: s.x, y: s.y, z: s.z } }); J.shake = Math.max(J.shake || 0, .5);
          contacto(s, J, vivo);
          FX.rafaga(s.x + Math.sin(s.yaw) * 1.6, s.y + .2, s.z + Math.cos(s.yaw) * 1.6, 18, 3, .5, .25, C.color.brasa, 1);
        }
        break;
      }
      case 'golpe': {
        const G = fichaGolpe(s);
        if (s.t < G.activo) contacto(s, J, vivo);
        if (s.estado !== 'golpe') break;
        if (s.t >= G.activo) {
          s.estado = s.segundo && s.paso === 1 ? 'pausa' : 'recuperar'; s.t = 0;
          s.recupera = E.secuencia ? E.secuencia.recupera : G.recupera;
        }
        break;
      }
      case 'pausa':
        if (s.t >= E.secuencia.pausa && DirectorCombate.pedir(s, DIRECTOR.pesado,
          { total: E.secuencia.aviso + E.golpes[s.golpe].activo + E.secuencia.recupera + DIRECTOR.margenPermiso,
            impactos: [E.secuencia.aviso], jefe: true, zonaGrande: s.golpe === 'barrido' })) {
          // El segundo aviso ya estaba reservado al elegir la secuencia.
          s.paso = 2; s.estado = 'aviso'; s.t = 0; s.fijado = false; s.correccion = 0; s.golpeo = false;
          apuntar(s, J, E.secuencia.aviso, 0); s.marcas[s.golpe === 'barrido' ? 'anillo' : 'sector'].visible = true;
          Sonido.sfx(E.sonidoAviso || 'sombraSalto', { pos: { x: s.x, y: s.y, z: s.z } });
        }
        break;
      case 'recuperar': if (s.t >= s.recupera) { liberarAtaque(s); s.estado = 'acechar'; s.t = 0; s.cd = rnd(E.espera[0], E.espera[1]); s.esperaPermiso = false; } break;
      case 'tambaleo': if (s.t > .8) { s.estado = 'acechar'; s.t = 0; s.cd = rnd(.6, 1.2); } break;
      case 'roto': if (s.t > Q.roto) { s.estado = 'acechar'; s.t = 0; s.eq = Q.max; s.cd = .8; } break;
      case 'romper': if (s.t > C.romper) { quitar(s); return false; } break;
    }
    // marcas en el suelo, a sus pies y orientadas
    if (s.marcas.sector.visible) { const G = fichaGolpe(s), k = Math.min(1, s.t / G.aviso); s.marcas.sector.position.set(s.x, s.y + .12, s.z); s.marcas.sector.rotation.y = s.yaw - Math.PI / 2; s.marcas.sector.scale.setScalar(G.alcance + E.r * .5); s.marcas.sector.material.opacity = .25 + .35 * k; }
    if (s.marcas.anillo.visible) { const G = fichaGolpe(s), k = Math.min(1, s.t / G.aviso); s.marcas.anillo.position.set(s.x, s.y + .12, s.z); s.marcas.anillo.scale.setScalar(G.radio * (.4 + .6 * k)); s.marcas.anillo.material.opacity = .3 + .35 * k; }
    return true;
  }
  function actualizarUna(s, dt, J) {
    const E = s.E, dx = J.x - s.x, dz = J.z - s.z, d = Math.hypot(dx, dz), vivo = J.vivo && !Cin.activa && !UI.dlg;
    s.t += dt; s.cd -= dt; s.retiradaT -= dt;
    if (s.lentaT > 0) s.lentaT -= dt; if (s.sujetaT > 0) s.sujetaT -= dt; if (s.sujetaEspera > 0) s.sujetaEspera -= dt;
    const xAntes = s.x, zAntes = s.z;
    if (variantes.actualizar(s, dt, J, d, dx, dz, vivo)) { if (lista.includes(s)) { separar(s, J, dt); resolverAtasco(s, dt, xAntes, zAntes); posar(s, dt); } return; }
    if (!['acechar', 'volver', 'salto'].includes(s.estado)) mover(s, dt, s.x, s.z, 0);
    if (E.ia === 'oni') { if (actualizarOni(s, dt, J, d, dx, dz, vivo)) { if (!s.fija) chocar(s, J, dt); resolverAtasco(s, dt, xAntes, zAntes); posar(s, dt); } return; }
    // fija: los golpes no la echan de su plataforma
    if (s.fija) s.vx = s.vz = 0;
    // empuje que se apaga
    if (Math.abs(s.vx) + Math.abs(s.vz) > .01) { s.x += s.vx * dt; s.z += s.vz * dt; s.vx *= Math.exp(-6 * dt); s.vz *= Math.exp(-6 * dt); }
    switch (s.estado) {
      case 'brotar': if (s.t > C.brotar) { s.estado = 'acechar'; s.t = 0; } break;
      case 'acechar':
        girar(s, Math.atan2(dx, dz), dt, 8);
        if (acechar(s, dt, J, d, dx, dz, vivo)) pedirAtaque(s, J, d);
        break;
      case 'aviso': apuntar(s, J, E.aviso, dt); if (s.t >= E.aviso) atacar(s, J, vivo); break;
      case 'salto': {
        const u = Math.min(1, s.t / E.salto.dur), paso = (u - s.saltoU) * s.recorrido;
        if (!s.fija) { s.x += Math.sin(s.yaw) * paso; s.z += Math.cos(s.yaw) * paso; }
        s.saltoU = u; s.mx = s.mz = 0;
        if (!s.golpeo && vivo && Math.hypot(J.x - s.x, J.z - s.z) < E.r + .55 && Math.abs(J.y + .5 - (s.y + 4 * E.salto.alto * u * (1 - u))) < 1.1) { s.golpeo = true; Bus.emit('dañoJugador', { dmg: E.daño, x: s.x, z: s.z, s }); }
        if (s.estado === 'salto' && u >= 1) { s.estado = 'recuperar'; s.t = 0; }
        break;
      }
      case 'golpe':
        if (s.t < E.golpe.activo) contacto(s, J, vivo);
        if (s.estado === 'golpe' && s.t >= E.golpe.activo) { s.estado = 'recuperar'; s.t = 0; }
        break;
      case 'recuperar': if (s.t >= E.recupera) { liberarAtaque(s); s.estado = 'acechar'; s.t = 0; s.cd = rnd(E.espera[0], E.espera[1]); s.esperaPermiso = false; if (Math.random() < .4) s.ang = -s.ang; } break;
      case 'herido': if (s.t > C.herido) { s.estado = 'acechar'; s.t = 0; s.cd = Math.max(s.cd, .5); } break;
      case 'aturdido': if (s.t > C.aturdido) { s.estado = 'acechar'; s.t = 0; s.cd = rnd(.6, 1.4); } break;
      case 'romper': if (s.t > C.romper) { quitar(s); return; } break;
    }
    // separación entre ellas
    separar(s, J, dt);
    resolverAtasco(s, dt, xAntes, zAntes); posar(s, dt);
  }
  function separar(s, J, dt) {
    if (!s.fija) { for (const o of lista) { if (o === s || (s.E.vuelo || o.E.vuelo) && Math.abs(s.y - o.y) >= C.altoAtaque) continue; const ex = s.x - o.x, ez = s.z - o.z, e = Math.hypot(ex, ez), m = s.E.r + o.E.r + .25; if (e > 0 && e < m) { s.x += ex / e * (m - e) * .5; s.z += ez / e * (m - e) * .5; } } chocar(s, J, dt); }
  }
  function resolverAtasco(s, dt, xAntes, zAntes) {
    if (s.fija || s.estado !== 'acechar') { s.atascoT = 0; return; }
    const M = C.movimiento;
    if (Math.hypot(s.mx, s.mz) > M.espera[0] * .5 && Math.hypot(s.x - xAntes, s.z - zAntes) < M.avanceMin * dt) s.atascoT += dt;
    else s.atascoT = 0;
    if (s.atascoT >= M.atasco) { s.atascoT = 0; s.ang = -s.ang; s.mx = s.mz = 0; s.retirada = null; }
  }
  /* como Hikari: fuera de los sólidos y de los árboles, a su altura, y sin meterse en ella mientras no ataca (y no si
     ella rueda: la esquiva las atraviesa). Si un sólido la frena, se desliza de lado (en su sentido de giro, s.ang, mientras acecha)
     para rodearlo en vez de quedarse atascada detrás */
  const _ps = { x: 0, z: 0 };
  function chocar(s, J, dt) {
    const r = s.E.r; _ps.x = s.x; _ps.z = s.z;
    if (J.vivo && !(J.rodando > 0) && !ATACA[s.estado] && Math.abs(J.y - s.y) < 1.6) {
      const ex = _ps.x - J.x, ez = _ps.z - J.z, e = Math.hypot(ex, ez), m = r + C.separaJ;
      if (e > 1e-3 && e < m) { _ps.x = J.x + ex / e * m; _ps.z = J.z + ez / e * m; }
    }
    if (Sol.empujar(_ps, r, s.y) && s.estado === 'acechar') {
      const dx = J.x - _ps.x, dz = J.z - _ps.z, d = Math.hypot(dx, dz) || 1, k = Math.min(s.E.vel * C.rodear, C.movimiento.lateral) * dt * s.ang;
      _ps.x += -dz / d * k; _ps.z += dx / d * k; Sol.empujar(_ps, r, s.y);
    }
    empujarArboles(_ps, r * .8, s.y); s.x = _ps.x; s.z = _ps.z;
  }
  /* suelo y pose (brotar, agacharse al avisar, saltar, golpear con el farol, tambalearse y romperse) */
  function posar(s, dt) {
    const E = s.E; if (!variantes.suelo(s, dt) && !s.fija) s.y = damp(s.y, sueloEnJ(s.x, s.y + .6, s.z), 14, dt);
    let alto = 0, agacha = 1, esc = 1, inclina = 0;
    if (s.estado === 'brotar') { const u = Math.min(1, s.t / C.brotar); alto = -.7 * (1 - easeIO(u)); esc = .4 + .6 * u; }
    else if (s.estado === 'aviso') { agacha = E.ia === 'salto' ? .7 + .05 * Math.sin(s.t * 60) : .9; inclina = E.ia === 'escudo' ? -.3 * Math.min(1, s.t / E.aviso) : 0; }
    else if (s.estado === 'salto') { const u = Math.min(1, s.t / E.salto.dur); alto = 4 * E.salto.alto * u * (1 - u); }
    else if (s.estado === 'golpe') inclina = .45 * Math.sin(Math.min(1, s.t / (E.ia === 'oni' ? fichaGolpe(s).activo : E.golpe.activo)) * Math.PI);
    else if (s.estado === 'romper') { const u = Math.min(1, s.t / C.romper); esc = 1 - u; alto = -.3 * u; }
    else if (s.estado === 'aturdido') agacha = .85;
    // el brazo con la maza: arriba al avisar, cae al golpear; de rodillas cuando está roto
    if (E.ia === 'oni') {
      const G = s.golpe && fichaGolpe(s), k = s.estado === 'aviso' ? Math.min(1, s.t / G.aviso) : 0;
      let rx = s.estado === 'aviso' ? (s.golpe === 'barrido' ? -1.2 * k : -2.6 * k) : s.estado === 'golpe' ? lerp(-2.6, .6, Math.min(1, s.t / G.activo)) : s.estado === 'recuperar' ? .6 * (1 - Math.min(1, s.t / s.recupera)) : 0, rz = s.estado === 'aviso' && s.golpe === 'barrido' ? 1.2 * k : 0;
      s.brazo.rotation.set(rx + Math.sin(U.uT.value * 1.6) * .05, s.estado === 'golpe' && s.golpe === 'barrido' ? -s.t * 18 : 0, rz);
      if (s.estado === 'roto') { alto = -.55; inclina = .45; } else if (s.estado === 'tambaleo') inclina = -.25 + Math.sin(s.t * 14) * .08;
    }
    const t = U.uT.value, paso = s.estado === 'acechar' ? Math.sin(t * (E.ia === 'salto' ? 14 : 8) + s.x) * .03 : 0;
    s.m.position.set(s.x, s.y + alto + paso, s.z); s.m.rotation.set(inclina + (s.estado === 'aturdido' ? Math.sin(t * 9) * .15 : 0), s.yaw, 0); s.m.scale.set(esc, esc * agacha, esc);
    // ojos: arden más al avisar
    const [oy, oz] = E.ojos, fy = s.y + alto + oy * agacha * esc, fx = Math.sin(s.yaw) * oz * esc, fz = Math.cos(s.yaw) * oz * esc, lx = Math.cos(s.yaw) * .08, lz = -Math.sin(s.yaw) * .08;
    const brillo = s.estado === 'aviso' ? 1.6 : s.estado === 'aturdido' || s.estado === 'roto' ? .35 : 1, tam = (s.estado === 'aviso' ? .36 : .22) * esc;
    s.ojos.forEach((h, i) => { const k = i ? 1 : -1; h.position.set(s.x + fx + lx * k, fy, s.z + fz + lz * k); h.scale.set(tam, tam, 1); h.opacidad = .9 * brillo; h.visible = s.estado !== 'romper'; });
    // la lanzadora carga la esquirla en la mano mientras avisa
    if (s.mano) { const u = s.estado === 'aviso' ? Math.min(1, s.t / E.aviso) : 0; s.mano.visible = u > 0; s.mano.position.set(s.x + Math.sin(s.yaw) * .35 + Math.cos(s.yaw) * .3, s.y + 1.3, s.z + Math.cos(s.yaw) * .35 - Math.sin(s.yaw) * .3); s.mano.scale.set(.2 + u * .35, .2 + u * .35, 1); }
    variantes.posar(s, dt);
  }

  /* ---------- zonas ---------- */
  function actualizarZonas(dt, J) {
    const listo = Sis.tiene('katana') && !Cin.activa;
    for (const z of zonas) {
      const d = Math.hypot(J.x - z.x, J.z - z.z);
      if (z.estado === 'limpia') { z.t -= dt * (Sis.ST.cieloRojo ? 1 / C.rojo.regenera : 1); if (z.t <= 0 && d > C.correa + 20) z.estado = 'libre'; }
      else if (z.estado === 'libre') {
        if (listo && J.vivo && d < z.r + C.aggro) {
          const tipos = z.tipos.slice();
          for (const v of z.variantes || []) if ((Sis.ST.capitulo || 0) >= v.cap) tipos[v.puesto] = v.tipo;
          brotar(z, z.x, z.z, Sis.ST.cieloRojo && !z.unaVez ? tipos.concat(C.rojo.extra) : tipos);
        }
      }
      else if (z.estado === 'activa') {
        if (z.n <= 0) { z.estado = z.unaVez ? 'fin' : 'limpia'; z.t = C.regenera; }
        // se hunden si Hikari se aleja
        else if (d > C.correa) { for (const s of lista.slice()) if (s.zona === z) { FX.rafaga(s.x, s.y + .3, s.z, 8, 1.5, .5, .16, C.color.brasa, 1); quitar(s); } z.estado = 'libre'; }
      }
    }
  }
  /* emboscada al tomar la Katana del Alba: un grupo de rastreras brota alrededor del Mirador */
  Bus.on('katanaTomada', p => {
    setTimeout(() => { const z = { x: p.x, z: p.z, r: 7, tipos: ['rastrera', 'rastrera', 'rastrera'], estado: 'libre', t: 0, n: 0, unaVez: true }; zonas.push(z); brotar(z, p.x, p.z, z.tipos); UI.aviso('¡Sombras! La oscuridad que el faro contenía', 'error'); }, C.emboscada * 1000);
  });

  /* onis de guardia: aparecen cerca de su santuario (con la katana y sin ese fragmento) y desaparecen lejos */
  const guardias = GUARDIAS_ONI.map(g => Object.assign({ s: null }, g));
  function actualizarGuardias(J) {
    const ST = Sis.ST, practicado = (ST.sombrasRotas || 0) >= C.practica.rotas || Object.values(ST.frag || {}).some(Boolean);
    const listo = Sis.tiene('katana') && practicado && !Cin.activa;
    for (const g of guardias) {
      const d = Math.hypot(J.x - g.x, J.z - g.z), libre = (ST.onis && ST.onis[g.id]) || ST.frag[g.frag];
      if (!g.s && listo && !libre && d < C.oni.aparece) { g.s = crear(g.tipo && (ST.capitulo || 0) >= g.cap ? g.tipo : 'oni', g.x, g.z, null); g.s.guardia_ = g; g.s.yaw = Math.atan2(-g.x, -g.z); if (!g.avisadoLejos) { g.avisadoLejos = true; UI.aviso('Un oni de sombra guarda el ' + g.nom + '. Golpea fuerte: míralo desde lejos antes de acercarte', 'mision'); } }
      else if (g.s && g.s.estado !== 'romper' && (d > C.oni.desaparece || libre)) quitar(g.s);
    }
  }
  /* ¿un oni guarda todavía este santuario? (los altares no responden mientras tanto) */
  const custodia = id => guardias.some(g => g.id === id && g.s && g.s.estado !== 'romper');
  /* barra del oni más cercano que pelea (la de los gólems: nombre, ánimo y equilibrio) */
  function barra(J) {
    let b = null, bd = C.oni.barra;
    for (const g of guardias) { const s = g.s; if (!s || s.estado === 'guardia' || s.estado === 'volver' || s.estado === 'romper' || s.estado === 'brotar') continue; const d = Math.hypot(s.x - J.x, s.z - J.z); if (d < bd) { bd = d; b = s; } }
    return b && { jefe: true, nom: (b.E.nom || 'Oni de sombra') + (b.estado === 'roto' ? ' · ¡ROTO!' : ''), estado: '', ani: Math.max(0, b.animo), aniMax: b.E.animo, eq: Math.max(0, b.eq) / b.E.equilibrio.max };
  }
  function actualizar(dt, J) {
    DirectorCombate.actualizar(dt);
    actualizarZonas(dt, J); actualizarGuardias(J);
    for (const s of lista.slice()) actualizarUna(s, dt, J);
    actualizarEsquirlas(dt, J);
    // música de combate con Sombras cerca
    if (lista.some(s => s.estado !== 'romper' && Math.hypot(s.x - J.x, s.z - J.z) < C.aggro)) J.combate = Math.max(J.combate || 0, 1.5);
  }
  Object.assign(variantes, { arteBase: ARTE, mover, girar, apuntar, pedirAtaque, liberarAtaque, interrumpir, contacto });
  return { lista, zonas, esquirlas, guardias, variantes, actualizar, golpear, enRango, pulso, desviar, devolver, romper, quitar, muestras, crear, custodia, barra, material, materialMate };
})();
