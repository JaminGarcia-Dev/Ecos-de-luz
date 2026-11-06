/* Cinemáticas de los capítulos (PLAN_FUSION.md), con el motor de planos de Cin (09-cinematica.js) y sus utilidades.
   Capítulo 4: la pérdida de Tsuru (la escena de 39-escenas.js sin el robo), la travesía en la barca de Kaito entre la isla
   y Yoake, y la captura de Momo en el muelle. La barca y los puntos de Yoake son de 62-isla-yoake.js. */
"use strict";
/* travesía: segundos de cada tramo; distancia (m) que se aleja del muelle antes de girar hacia Yoake; radio del Velo
   alrededor de la isla principal; dónde aparece la barca al salir de la niebla (m desde el embarcadero de Yoake, hacia el
   mar abierto) y velocidad; humo rojo de la frontera; altura de la barca sobre el agua */
const TRAVESIA = { dur: [9, 8, 9, 7], salida: 40, velo: 470, llegada: 60, humo: 90, flota: .25, muelle: 3, sobreTierra: 2.5, delante: 12, pasajeros: ['kaito', 'yuki', 'momo'] };   // muelle: altura a la que se busca la tabla del muelle al volver
/* captura de Momo: dónde está ella respecto a Kaito (m), segundos de cada plano y humo con el que se va Tasogare */
/* muerte de Tasogare (capítulo 5): segundos de cada plano; dónde está él respecto al cierre (m); cuándo se apaga (s del
   tercer plano) y luz que suelta al deshacerse */
const FIN_TASOGARE = { dur: [8, 8, 12, 10, 7], lado: .3, apaga: [2.4, 5.5], luz: 0xffe0a8 };
/* capítulo 7: dónde toma cuerpo la Luna Roja (m desde el faro, hacia el sur de la plaza); segundos de los planos de la
   encarnación y de la liberación; tamaño de Lumi al quedar como luciérnaga; altura de la Dorada sobre la corona */
const LUNA_ESCENA = { plaza: 18, encarna: [5, 5, 5, 4], libera: [10, 16, 19], luciernaga: .35, dorada: 4 };
const CAPTURA_MOMO = { momo: 6, tasogare: 2, camara: [4.5, 1.6], dur: [7, 6], humo: 70 };   // m desde Kaito hacia la orilla; cámara de lado (m, altura)

const EscenasCapitulos = (() => {
  const { arrancar, cam, suave, resto } = Cin.util;
  const linea = id => { const l = GUION.inicio.lineas[id]; return l ? l.nombre + ' · ' + l.texto : null; };
  const T = TRAVESIA;

  /* ---------- la pérdida de Tsuru (Noche Roja, tras el asedio) ---------- */
  Cin.util.instalarResguardo();
  Cin.perdidaTsuru = (cb, op) => Cin.robo(cb, op);

  /* ---------- la travesía ---------- */
  /* muelle de Kaito: punto de amarre en su extremo y dirección hacia el mar */
  function amarre() { const k = Estr.npcs.kaito, a = Estr.muelleAng; return { x: k.x + Math.sin(a) * 3, z: k.z + Math.cos(a) * 3, a }; }
  /* el muelle da a una ensenada: sale por la dirección con más agua seguida y, a igualdad, la más cercana al rumbo */
  function alMar(M, rumbo) {
    let mejor = null;
    for (let a = 0; a < TAU; a += TAU / 72) {
      let n = 0; for (let d = 3; d <= T.salida; d += 3) { if (altura(M.x + Math.sin(a) * d, M.z + Math.cos(a) * d) < NIVEL_AGUA - .5) n++; else break; }
      const nota = n - Math.abs(Math.atan2(Math.sin(a - rumbo), Math.cos(a - rumbo))) * .5;
      if (!mejor || nota > mejor.nota) mejor = { a, nota };
    }
    return mejor.a;
  }
  /* tramos de la ruta: [desde, hasta] en el agua; ida: muelle → Velo | (salto) → Yoake */
  function ruta(ida) {
    const M = amarre(), I = ISLAS[0], g = alMar(M, Math.atan2(I.x, I.z)), mar = { x: M.x + Math.sin(g) * T.salida, z: M.z + Math.cos(g) * T.salida };
    const d = Math.hypot(I.x, I.z), velo = { x: I.x / d * T.velo, z: I.z / d * T.velo };
    const E = IslaYoake.puntos.embarcadero, hx = E.x - I.x, hz = E.z - I.z, hd = Math.hypot(hx, hz), fuera = { x: E.x + hx / hd * T.llegada, z: E.z + hz / hd * T.llegada };
    const tramos = [[M, mar], [mar, velo], [fuera, E], [fuera, E]];
    return ida ? tramos : [[E, fuera], [fuera, { x: fuera.x + hx / hd * 30, z: fuera.z + hz / hd * 30 }], [velo, mar], [mar, M]];
  }
  /* pasajeros: dobles de Kaito, Yuki y Momo sentados en la barca (los de la aldea se quedan donde están) */
  function pasajeros(B, conMomo) {
    const lista = [];
    T.pasajeros.forEach((id, i) => {
      if (id === 'momo' && !conMomo) return;
      const n = Gente.crear({ ...FICHAS_NPC[id], nombre: '', rutina: { tipo: 'quieto' } }); n.ocupado = true;
      n.g.position.set(-1.6 + i * 1.3, .2, i % 2 ? .4 : -.4); n.g.rotation.y = Math.PI / 2; B.grupo.add(n.g); lista.push(n);
    });
    return lista;
  }
  function travesia(ida, cb, op) {
    op = op || {};
    const B = IslaYoake.barca, tramos = ruta(ida), dobles = pasajeros(B, ida), y = NIVEL_AGUA + T.flota;
    if (!B.grupo.parent) scene.add(B.grupo); B.grupo.visible = true;
    const est = Object.assign({}, IDLE);
    const lleva = (A, Z, u) => { const x = lerp(A.x, Z.x, u), z = lerp(A.z, Z.z, u), g = Math.atan2(Z.x - A.x, Z.z - A.z); B.colocar(x, y, z, g); Hikari.mover(x + Math.sin(g) * 1.8, y + .5, z + Math.cos(g) * 1.8, g); return { x, z, g }; };
    // cámara detrás y a un lado de la barca, siempre por encima del terreno (junto al muelle hay ladera)
    // del lado de la barca donde el terreno es más bajo (junto al muelle, el del mar)
    const vista = (p, lado, alto, atras) => {
      const pos = l => [p.x - Math.sin(p.g) * atras + Math.cos(p.g) * l, p.z - Math.cos(p.g) * atras - Math.sin(p.g) * l];
      const [ax, az] = pos(lado), [bx, bz] = pos(-lado), [cx, cz] = altura(ax, az) <= altura(bx, bz) ? [ax, az] : [bx, bz];
      cam(cx, Math.max(y + alto, altura(cx, cz) + T.sobreTierra), cz, p.x + Math.sin(p.g) * 6, y + 1, p.z + Math.cos(p.g) * 6);
    };
    const rojo = k => { Atmosfera.rojo(k); aplicarEntorno(k > .5 ? Sis.eMundo() : FUERA_VELO.entorno, 0); };
    const dentro = ida ? [1, 1, 0, 0] : [0, 0, 1, 1];   // ¿cada tramo está dentro del Velo?
    const textos = op.sinTextos ? [null, null, null, null] : ida ? [linea('C4B06'), linea('C4B08'), linea('C4B10'), linea('C4B11')] : [null, linea('C4B08'), null, null];
    if (op.sinRojo) dentro.fill(0);   // con el Velo abierto ya no hay rojo en ningún tramo
    const plano = i => ({ dur: T.dur[i], txt: textos[i], fundir: i === 1 ? 1.5 : 0,
      in() { C_pose(est); if (i === 2) UI.fundido(0, 900); },
      f(u, t, dt) {
        rojo(dentro[i]); const p = lleva(tramos[i][0], tramos[i][1], i === 3 ? suave(u) : u);
        if (i === 1 && Math.random() < dt * T.humo * u) FX.humo(p.x + rnd(-8, 8), y + rnd(0, 6), p.z + rnd(-8, 8), rnd(-1, 1), rnd(.2, .6), rnd(-1, 1), rnd(2, 3.5), rnd(2, 4), 0x5a1410, .5);
        // al salir de un muelle, detrás de la barca hay tierra: la cámara va delante, sobre el agua, y la mira
        if (i === 0) { const cx = p.x + Math.sin(p.g) * T.delante + Math.cos(p.g) * 4, cz = p.z + Math.cos(p.g) * T.delante - Math.sin(p.g) * 4; cam(cx, y + 3.5, cz, p.x, y + 1, p.z); }
        else vista(p, i % 2 ? 6 : -6, i === 3 ? 3 : 4, 9);
      } });
    Lumi.grupo.visible = false;
    arrancar([0, 1, 2, 3].map(plano), () => {
      dobles.forEach(n => B.grupo.remove(n.g)); B.grupo.visible = false; Lumi.grupo.visible = true; C_pose(null);
      const fin = tramos[3][1]; const enYoake = fin === IslaYoake.puntos.embarcadero; Cin.colocarJugador(fin.x, fin.z, enYoake ? 0 : amarre().a + Math.PI, enYoake ? fin.y + 1 : NIVEL_AGUA + T.muelle);
      if (cb) cb();
    }, 'travesia');
  }
  const C_pose = p => { Cin.pose = p; };

  /* ---------- la captura de Momo, al volver al muelle ---------- */
  function capturaMomo(cb) {
    const C = CAPTURA_MOMO, k = Estr.npcs.kaito, a = Estr.muelleAng, px = Math.cos(a), pz = -Math.sin(a);
    // Momo, sobre el tablón del muelle; Tasogare le corta el paso hacia la orilla
    const M = { x: k.x - Math.sin(a) * C.momo, z: k.z - Math.cos(a) * C.momo }, yM = sueloEnJ(M.x, NIVEL_AGUA + 4, M.z);
    const momo = Gente.crear({ ...FICHAS_NPC.momo, nombre: '', rutina: { tipo: 'quieto' } }); momo.ocupado = true; momo.g.position.set(M.x, yM, M.z); scene.add(momo.g); resto(momo.g);
    const lazo = new Halo(0xc0392b, .9); lazo.scale.set(.25, .25, 1); lazo.visible = false; scene.add(lazo); resto(lazo);
    const tx = M.x - Math.sin(a) * C.tasogare, tz = M.z - Math.cos(a) * C.tasogare;
    arrancar([
      { dur: C.dur[0], txt: linea('C4C01'), in() { UI.hud(false); Tasogare.mostrar(true); Tasogare.hojaEntera(false); Tasogare.colocar(tx, sueloEnJ(tx, NIVEL_AGUA + 4, tz), tz, Math.atan2(M.x - tx, M.z - tz)); Tasogare.pose('hablar', 0, true); Tasogare.efectos({ ojo: 1, filo: .6, brasa: .5 }); },
        f(u, t, dt) { momo.actualizar(dt, 1e4, 1e4); cam(M.x + px * C.camara[0], yM + C.camara[1], M.z + pz * C.camara[0], (M.x + tx) / 2, yM + .9, (M.z + tz) / 2); } },
      { dur: C.dur[1], txt: linea('C4C02'), fundir: 1,
        f(u, t, dt) {
          if (t > 2 && momo.g.visible) { momo.g.visible = false; Tasogare.mostrar(false); lazo.position.set(M.x, yM + .3, M.z); lazo.visible = true; Sonido.sfx('disolver'); }
          if (t > 1 && t < 3.2) for (let j = 0; j < Math.round(dt * C.humo); j++) FX.humo(tx + rnd(-1, 1), yM + rnd(-.8, 1.6), tz + rnd(-1, 1), rnd(-.3, .3), rnd(.8, 1.6), rnd(-.3, .3), rnd(1.4, 2.2), rnd(.5, .9), 0x2e2228, .45);
          cam(M.x + px * C.camara[0], yM + C.camara[1], M.z + pz * C.camara[0], (M.x + tx) / 2, yM + .7, (M.z + tz) / 2);
        } }
    ], () => { Tasogare.mostrar(false); UI.hud(true); if (cb) cb(); }, 'capturaMomo');
  }
  /* ---------- la muerte de Tasogare, en lo alto de la espiral ---------- */
  /* El aro conserva su geometría y su material. Abrir su último sector deja una salida visible sin otro dibujo. */
  let aroPresentacion = null;
  function aparato() {
    const A = EscenarioCapitulos.puntos.aro; let aro = null;
    if (!A) return null;
    if (aroPresentacion && aroPresentacion.parent) return aroPresentacion;
    scene.traverse(o => { if (o.userData.brillo && Math.hypot(o.position.x - A.x, o.position.z - A.z) < .01) aro = o; });
    aroPresentacion = aro; return aro;
  }
  function abrirAro(k) {
    const aro = aparato(); if (!aro) return;
    const anillo = aro.children.find(o => o.geometry && o.geometry.type === 'TorusGeometry');
    if (anillo) {
      const lado = Math.cos(aro.rotation.y) * aro.position.x - Math.sin(aro.rotation.y) * aro.position.z;
      anillo.rotation.z = .3 * Math.PI + (lado < 0 ? Math.PI : 0);
      anillo.geometry.setDrawRange(0, Math.floor(anillo.geometry.index.count * (1 - .30 * k) / 6) * 6);
    }
    aro.userData.brillo.opacidad = .5 * (1 - k);
  }
  // Reconstruir la salida abierta al cargar, después de que 61 haya creado el extractor.
  const actualizarEscenario = EscenarioCapitulos.actualizar;
  EscenarioCapitulos.actualizar = function () {
    const resultado = actualizarEscenario.apply(EscenarioCapitulos, arguments);
    if (!Cin.activa && (Sis.ST.inicio.cap || {}).momoRescatada) abrirAro(1);
    return resultado;
  };
  function muerteTasogare(cb, op) {
    op = op || {};
    const c = Sis.ST.inicio.cap || {}, visto = !!(c.montajes && c.montajes.muerteTasogare || c.momoRescatada), consulta = !!op.consulta;
    if (op.consulta && !visto) return false;
    const F = FIN_TASOGARE, A = EscenarioCapitulos.puntos.aro, K = EscenarioCapitulos.puntos.cierre;
    const dx = K.x - A.x, dz = K.z - A.z, d = Math.hypot(dx, dz), ux = dx / d, uz = dz / d;
    const signo = (-uz * A.x + ux * A.z) >= 0 ? 1 : -1, px = -uz * signo, pz = ux * signo;
    const T = new THREE.Vector3(K.x + ux * F.lado, A.y, K.z + uz * F.lado);
    const inicioH = new THREE.Vector3(A.x - ux * .9 + px * 1.25, A.y, A.z - uz * .9 + pz * 1.25);
    const finM = new THREE.Vector3(A.x + px * 1.25, A.y, A.z + pz * 1.25), posM = new THREE.Vector3(A.x, A.y, A.z);
    const cuidaH0 = new THREE.Vector3(A.x - ux * .7 + px * .25, A.y, A.z - uz * .7 + pz * .25);
    const cuidaH1 = finM.clone().add(new THREE.Vector3(-ux * .7, 0, -uz * .7)), posH = cuidaH0.clone();
    const M = Cin.util.montaje('muerteTasogare', 5103), H = M.hilo, p = new THREE.Vector3(), destino = new THREE.Vector3(K.x, K.y + 1.3, K.z);
    const restaurarH = Cin.util.guardarObjeto(Hikari.root), restaurarT = Cin.util.guardarObjeto(Tasogare.root), restaurarCapa = Cin.util.guardarObjeto(Tasogare.capa.mesh);
    const canales = Tasogare.efectos(), jugador = { x: J.x, y: J.y, z: J.z, yaw: J.yaw }, aro = aparato(), apertura = aro.children.find(o => o.geometry && o.geometry.type === 'TorusGeometry').geometry.drawRange.count;
    const originales = scene.children.filter(o => o !== Hikari.root && o !== Tasogare.root && o.getObjectByName('cadera') && o.position.distanceTo(posM) < .1).map(o => ({ o, visible: o.visible }));
    originales.forEach(v => v.o.visible = false);
    const momo = Gente.crear({ ...FICHAS_NPC.momo, nombre: '', rutina: { tipo: 'quieto' } }); momo.g.name = 'Momo_rescate'; M.g.add(momo.g);
    const desvanecer = Cin.util.desvanecer([Tasogare.root, Tasogare.capa.mesh]);
    const objetivo = T.clone().add(new THREE.Vector3(0, 1.4, 0)), pecho = new THREE.Vector3(), haloMomo = new Halo(0xffe0a8, 0); M.g.add(haloMomo);
    let gesto = null, golpe = false, cortado = false;
    const vista = (k, u) => {
      const r = [6.5, 4.5, 5.5, 4, 6][k], alto = [1.6, 1.1, 1.35, .95, 1.4][k];
      cam(A.x + px * (r - (k === 3 ? .5 * u : 0)) - ux, A.y + alto, A.z + pz * r - uz,
        A.x + ux * .45, A.y + .9, A.z + uz * .45);
    };
    const entrada = k => {
      M.alEntrar(k, k === 1 ? [[.6, 'bloqueo', { vol: .12 }], [1, 'koto', { vol: .2 }]] :
        k === 2 ? [[.7, 'corte', { vol: .25 }], [1.2, 'golpe', { peso: .4, vol: .2 }]] : []);
      if (gesto) { gesto.cerrar(); gesto = null; }
      M.lente([50, 44, 48, 42, 50][k]); golpe = cortado = false; haloMomo.opacidad = 0; desvanecer.restaurar();
      Tasogare.reiniciar(); Tasogare.mostrar(k <= 2); Tasogare.colocar(T.x, T.y, T.z, Math.atan2(K.x - T.x, K.z - T.z));
      Tasogare.brillo(1); Tasogare.efectos({ ojo: 1, filo: 1, brasa: .8, brasas: 0 }); Tasogare.hojaEntera(false);
      M.posarTasogare('hablar', 'hablar', 0); abrirAro(k >= 3 ? 1 : 0);
      posM.set(A.x, A.y, A.z); if (k === 4) posM.copy(finM);
      Cin.util.posarDoble(momo, posM, Math.atan2(px, pz), k < 3 ? 'resistir' : 'vacio');
      Hikari.mostrar(true); Hikari.mover(inicioH.x, inicioH.y, inicioH.z, Math.atan2(T.x - inicioH.x, T.z - inicioH.z));
      if (k === 2) gesto = Cin.util.gestoEquipado(M, inicioH, objetivo);
      if (k >= 3) { posH.copy(k === 3 ? cuidaH0 : cuidaH1); Hikari.mover(posH.x, posH.y, posH.z, Math.atan2(ux, uz)); }
      vista(k, 0);
    };
    const planos = F.dur.map((dur, k) => ({ dur, fundir: k === 4 ? 1 : 0,
      in() { entrada(k); },
      f(u, t, dt) {
        if (Cin.util.congelado() && dt > 0) return;
        M.paso(t, dt);
        if (k === 0) {
          M.texto('C5F03', .5, t); M.posarTasogare('hablar', 'empuñar', smooth(5, 8, t));
          Tasogare.root.rotation.y = lerp(Math.atan2(A.x - T.x, A.z - T.z), Math.atan2(K.x - T.x, K.z - T.z), smooth(3, 5, t));
        }
        if (k === 1) { M.texto('C5F04', 1, t); M.posarTasogare('empuñar', 'alzar', .25 * smooth(.6, 1, t)); }
        if ((k === 1 && t >= 1 || k === 2 && t < 1.3) && !cortado) {
          momo.g.getObjectByName('pecho').getWorldPosition(pecho); H.anchoMax = .18; H.tender(pecho, destino, smooth(1, 6, k === 1 ? t : 8));
          H.fase = k === 1 ? 1 : -7; H.longitud = k === 1 ? smooth(1, 1.6, t) : 1;
        }
        if (k === 2 && t >= 1.3 && !cortado) {
          cortado = true; H.evaluar(.35, p); H.cortar(p, { motas: false }); H.activo = false; H.pecho = H.dintel = 0;
        }
        if (k === 2) {
          if (t < 2.4) M.posarTasogare('empuñar', 'hablar', smooth(1.6, 2.4, t) * .3);
          M.motas('contacto', objetivo, t, 1.2, 1.2, 10, { alto: .05, ancho: .05, vidaMin: .2, vidaMax: .4, tam: .04 });
          M.motas('tasogare', T, t, 2.4, 5.5, 80, { vidaMin: .7, vidaMax: 1.2, alto: 2.1 });
          desvanecer.poner(1 - smooth(2.4, 5.5, t)); if (t >= 5.5) { Tasogare.mostrar(false); abrirAro(1); }
          M.texto('C5F06', 6, t);
        }
        if (k === 3) {
          M.texto('C5F07', .5, t); const q = smooth(2, 5, t); posM.lerpVectors(new THREE.Vector3(A.x, A.y, A.z), finM, q);
          posH.lerpVectors(cuidaH0, cuidaH1, q); Hikari.mover(posH.x, posH.y, posH.z, Math.atan2(posM.x - posH.x, posM.z - posH.z));
        }
        Cin.util.posarDoble(momo, posM, Math.atan2(px, pz), k < 3 ? 'resistir' : k === 3 ? 'vacio' : 'quieta', k === 3 && t >= 2 && t < 5 ? (t - 2) * TAU * 1.3 : undefined);
        if (k !== 2) {
          const q = clamp((t - 2) / 3, 0, 1), vel = k === 3 ? 6 * q * (1 - q) / 3 : 0;
          M.posarHikari({ tender: k === 3 ? .8 : 0, vel, vx: px * vel, vz: pz * vel }, dt);
        }
        vista(k, u); M.efectos(t, dt);
        // Los trayectos se dibujan después del lote general del hilo; no se sobrescriben en actualizar().
        if (gesto) { gesto.actualizar(Math.min(t, 1.7), dt); if (t >= 1.7) M.posarHikari({}, dt); }
        if (k === 2 && t >= 1.2 && !golpe) { golpe = true; M.datos.contacto = true; Cin.util.congelar(.05); }
        if (k === 2 && t >= 1.2 && t < 1.3) {
          H.flash.position.copy(objetivo); H.flash.scale.setScalar(.45); H.flash.opacidad = .5 * (1 - smooth(1.2, 1.3, t));
          Cin.util.sacudida(.015, .18, 16, t - 1.25, .001);
        }
        if (k === 3) { momo.g.getObjectByName('pecho').getWorldPosition(pecho); haloMomo.position.copy(pecho); haloMomo.scale.setScalar(.25);
          haloMomo.opacidad = t < 2 ? .2 * Math.max(0, Math.sin(t * Math.PI * 2)) : 0; }
        M.datos.momoFuera = posM.distanceTo(finM) < .05; M.datos.aroAbierto = k >= 3 || k === 2 && t >= 5.5;
        if (k === 4) M.fundir(t, 6, 7);
      }
    }));
    arrancar(planos, () => {
      if (gesto) gesto.cerrar(); if (!M.cerrar()) return;
      desvanecer.restaurar(); restaurarT(); restaurarCapa(); Tasogare.efectos(canales); Tasogare.brillo(1);
      Cin.util.liberarDoble(momo); M.g.remove(haloMomo); Halo.activos.delete(haloMomo);
      if (consulta) {
        originales.forEach(v => v.o.visible = v.visible); abrirAro(c.momoRescatada ? 1 : 0);
        aro.children.find(o => o.geometry && o.geometry.type === 'TorusGeometry').geometry.setDrawRange(0, apertura);
        restaurarH(); Hikari.mover(jugador.x, jugador.y, jugador.z, jugador.yaw);
      } else {
        Cin.util.finalizarUnaVez('muerteTasogare', () => {
          const cap = Sis.ST.inicio.cap; Cin.util.silencioPerdida(); cap.momoRescatada = true;
          if (!cap.oscuridadHeredada) { cap.oscuridadHeredada = true; Sis.dar('escuela_oscuridad', 1, true); UI.banner('Oscuridad heredada', 'Hikari conserva lo que dejó Tasogare.', 'luz', 'mision'); }
          Sis.evento('c5:momo_liberada');
        });
        Tasogare.mostrar(false); abrirAro(1);
        Cin.colocarJugador(finM.x - ux * .7, finM.z - uz * .7, Math.atan2(px, pz), A.y);
        Hikari.reiniciarAnimacion(); M.posarHikari({}, 0); Hikari.mover(J.x, J.y, J.z, J.yaw); Lumi.grupo.position.copy(Lumi.pos);
        if (Sis.npcs.momo) { Sis.npcs.momo.g.position.copy(finM); Sis.npcs.momo.g.visible = true; }
        Sis.guardar();
        if (cb) cb();
      }
      if (consulta && op.consulta && cb) cb();
    }, 'muerteTasogare'); return true;
  }
  /* ---------- la Luna Roja toma cuerpo en la plaza (capítulo 7) ---------- */
  const centroLuna = () => { const S = sitio('faro'); return { x: S.x, y: S.h, z: S.z + LUNA_ESCENA.plaza }; };
  function encarnacion(cb) {
    const L = LUNA_ESCENA, C = centroLuna(), D = L.encarna;
    arrancar([
      { dur: D[0], in() { UI.hud(false); LunaRoja.crear(); LunaRoja.mostrar(false); },
        f(u, t, dt) {
          for (let i = 0; i < Math.round(dt * 80); i++) { const a = Math.random() * TAU, r = 18 * (1 - u) + 2; FX.emit(C.x + Math.cos(a) * r, C.y + rnd(1, 9), C.z + Math.sin(a) * r, -Math.cos(a) * 4, rnd(-.5, .5), -Math.sin(a) * 4, 1.2, .2, 0xff5a3a, .9); }
          if (t > D[0] * .7 && !LunaRoja.root.visible) { LunaRoja.colocar(C.x, C.y, C.z, 0); LunaRoja.etapa(1); LunaRoja.mascara(0); LunaRoja.pose('reposo', 1); LunaRoja.mostrar(true); FX.rafaga(C.x, C.y + 3, C.z, 80, 6, 1.5, .35, 0xff5a3a, 3); Sonido.sfx('trueno'); }
          cam(C.x + 12, C.y + 14, C.z + 16, C.x, C.y + 2.5, C.z);
        } },
      { dur: D[1], txt: linea('C7D01'), f(u, t, dt) { LunaRoja.actualizar(dt); cam(C.x + 3, C.y + 1.4, C.z + 10, C.x, C.y + 3.6, C.z); } },
      { dur: D[2], txt: linea('C7D02'), in() { for (let i = 0; i < 4; i++) LunaRoja.conexion(i, true); }, f(u, t, dt) { LunaRoja.actualizar(dt); cam(C.x - 10, C.y + 6, C.z + 9, C.x, C.y + 3, C.z); } },
      { dur: D[3], txt: linea('C7D03'), f(u, t, dt) { LunaRoja.actualizar(dt); cam(C.x + 6, C.y + 2.2, C.z + 13, C.x, C.y + 3, C.z); } }
    ], () => { UI.hud(true); Cin.colocarJugador(C.x, C.z + 11, Math.PI); if (cb) cb(C); }, 'encarnacion');
  }
  /* ---------- la liberación: la Roja se deshace, Lumi abre la salida y la Dorada queda libre ---------- */
  function liberacion(cb, op) {
    op = op || {};
    const cap = Sis.ST.inicio.cap || {}, visto = !!(cap.montajes && cap.montajes.liberacion || cap.doradaLibre), consulta = !!op.consulta;
    if (op.consulta && !visto) return false;
    const L = LUNA_ESCENA, C = centroLuna(), K = Estr.corona, yD = Estr.cimaFaro + Estr.yFaro + L.dorada;
    const M = Cin.util.montaje('liberacion', 7103), H = M.hilo, lumi0 = consulta ? 1 : Lumi.grupo.scale.x || 1;
    LunaRoja.crear(); LunaDorada.crear();
    const restaurarRoja = Cin.util.guardarObjeto(LunaRoja.root), restaurarDorada = Cin.util.guardarObjeto(LunaDorada.root);
    const restaurarLumi = Cin.util.guardarObjeto(Lumi.grupo), restaurarH = Cin.util.guardarObjeto(Hikari.root);
    const rojo0 = Atmosfera.nivelRojo, luna0 = Atmosfera.aparienciaLunar, cadenas0 = LunaDorada.cadenas(), libre0 = LunaDorada.liberar();
    const jugador = { x: J.x, y: J.y, z: J.z, yaw: J.yaw }, posLumi = Lumi.pos.clone();
    const desvanecer = Cin.util.desvanecer([LunaRoja.root]);
    const PH = new THREE.Vector3(C.x + 1.8, C.y, C.z + 4), mano = new THREE.Vector3(), nucleo = new THREE.Vector3(), p = new THREE.Vector3();
    // El ascenso bordea la fachada sur; el último giro se hace por encima de la corona.
    const camino = [new THREE.Vector3(C.x, C.y + 3, C.z), new THREE.Vector3(C.x, K.y + 4, C.z), new THREE.Vector3(K.x, K.y + 4, K.z + 3)];
    const ruta = new THREE.CatmullRomCurve3(camino, false, 'centripetal');
    const alas = Lumi.grupo.children.filter(o => o.isMesh && o.geometry.type === 'ShapeGeometry'), haloLumi = Lumi.grupo.children.find(o => o instanceof Halo);
    let golpe = false;
    const entrada = k => {
      M.alEntrar(k, k === 0 ? [[2, 'golpe', { peso: .4, vol: .18 }]] : k === 1 ? [[6, 'koto', { vol: .25 }], [11, 'esquiva', { vol: .12 }]] : [[3, 'bloqueo', { vol: .12 }]]);
      M.lente([50, 48, 46][k]); golpe = false; desvanecer.restaurar(); Lumi.grupo.visible = true; Hikari.mostrar(true);
      Hikari.mover(PH.x, PH.y, PH.z, Math.PI); LunaRoja.mostrar(false); LunaDorada.mostrar(false);
      Lumi.grupo.scale.setScalar(k < 2 ? lumi0 : L.luciernaga); Lumi.fijar(null);
      if (k === 0) {
        const punto = DueloLuna.presentarVencida(C); if (!punto) throw Error('La liberación requiere la Roja vencida y su sistema detenido'); nucleo.copy(punto);
      }
      if (k === 1) {
        Lumi.grupo.position.copy(camino[0]); H.seguirRuta(camino); H.inversa = true; H.activo = false; H.anchoMax = .18;
        H.oro.copy(lin(0xd8fff0)); H.nucleo.copy(lin(0xd8fff0)); H.halos.forEach(h => h.color.copy(lin(0xd8fff0)));
      }
      if (k === 2) {
        LunaDorada.colocar(K.x, yD, K.z, 0); LunaDorada.cadenas(1); LunaDorada.liberar(0); LunaDorada.mostrar(true);
        Lumi.grupo.position.set(K.x + 1.8, yD + 1, K.z + 1.5); Atmosfera.rojo(1); Atmosfera.lunaNarrativa(1);
      }
      if (k === 0) cam(C.x + 5, C.y + 2.1, C.z + 7.5, C.x, C.y + 1.8, C.z);
    };
    const planos = L.libera.map((dur, k) => ({ dur, fundir: k === 2 ? 1.5 : 0,
      in() { entrada(k); },
      f(u, t, dt) {
        if (Cin.util.congelado() && dt > 0) return;
        M.paso(t, dt);
        if (k === 0) {
          M.texto('C7F01', .4, t); M.posarHikari({ canal: t >= 1.3 && t < 3 }, dt);
          M.motas('contacto', nucleo, t, 2, 2, 24, { alto: .1, ancho: .1, vidaMin: .2, vidaMax: .4, tam: .05 });
          M.motas('roja', new THREE.Vector3(C.x, C.y + .4, C.z), t, 4, 7, 100, { vidaMin: .8, vidaMax: 1.4, alto: 3 });
          desvanecer.poner(1 - smooth(4, 7, t)); LunaRoja.root.visible = t < 7;
          for (let j = 0; j < 4; j++) LunaRoja.conexion(j, t < 2.2 + j * .4);
          cam(C.x + 5 - .25 * smooth(0, 2, t), C.y + 2.1, C.z + 7.5, C.x, C.y + 1.8, C.z);
          M.efectos(t, dt);
          if (t >= 1.3 && t <= 2.12) {
            Hikari.root.getObjectByName('manoD').getWorldPosition(mano); p.lerpVectors(mano, nucleo, smooth(1.3, 2, t));
            H.segmento(H.rastro[0], mano, p, .10, .8); H.flash.position.copy(p); H.flash.scale.setScalar(t < 2 ? .16 : .6); H.flash.opacidad = .6;
            if (t >= 2) M.datos.errorContacto = p.distanceTo(nucleo);
          }
          if (t >= 2 && !golpe) { golpe = true; M.datos.contacto = true; Cin.util.congelar(.04); }
          Cin.util.sacudida(.02, .20, 16, t - 2.04, .0015);
        }
        if (k === 1) {
          M.texto('C7F02', .5, t); ruta.getPoint(smooth(0, 6, t), p); Lumi.grupo.position.copy(p); Lumi.fijar(p, 0);
          Lumi.grupo.scale.setScalar(lerp(lumi0, L.luciernaga, smooth(11, 13, t)));
          H.activo = t >= 6 && t < 11; H.fase = 6; H.longitud = 1;
          const altura = lerp(C.y + 2.1, K.y + 5, smooth(0, 8, t));
          cam(C.x + 6, altura, C.z + 8, p.x, p.y, p.z);
          M.efectos(t, dt);
          // El halo propio de Lumi también reduce su diámetro, además de heredar la escala de su cuerpo.
          haloLumi.scale.setScalar(lerp(.6 / lumi0, .22 / L.luciernaga, smooth(11, 13, t))); haloLumi.opacidad = .65;
        }
        if (k === 2) {
          const libera = smooth(3, 9, t); LunaDorada.liberar(libera);
          const rojo = 1 - smooth(7, 12, t); Atmosfera.rojo(rojo); Atmosfera.lunaNarrativa(rojo);
          M.motas('reserva', new THREE.Vector3(K.x, yD, K.z), t, 7, 12, 60, { alto: 2, ancho: 3, color: 0xd8fff0 });
          for (let j = 0; j < 4; j++) {
            const lado = j % 2 ? 1 : -1, apertura = new THREE.Vector3(K.x + lado * 2, yD + 1 + Math.floor(j / 2), K.z);
            M.motas('cadena' + j, apertura, t, 3 + j * .8, 3.1 + j * .8, 8, { alto: .1, ancho: .1, vidaMin: .6, vidaMax: 1 });
          }
          const r = 11 + 2 * smooth(9, 15, t); cam(K.x + r * .45, yD + 1.5, K.z + r * .89, K.x, yD + 1.3, K.z);
          Lumi.grupo.position.set(K.x + 1.8, yD + 1 + .05 * Math.sin(t * 2), K.z + 1.5); haloLumi.scale.setScalar(.22 / L.luciernaga);
          M.efectos(t, dt); M.fundir(t, 17.5, 19);
        }
        alas.forEach((a, i) => a.rotation.y = (i ? -1 : 1) * (.5 + .4 * Math.sin(t * 38)));
        M.datos.lumiEscala = Lumi.grupo.scale.x; M.datos.doradaLibre = k === 2 && t >= 9;
      }
    }));
    arrancar(planos, () => {
      if (!M.cerrar()) return; desvanecer.restaurar(); Lumi.fijar(null);
      if (consulta) {
        LunaDorada.cadenas(cadenas0); LunaDorada.liberar(libre0); restaurarDorada(); restaurarRoja(); restaurarLumi(); restaurarH();
        Lumi.teletransportar(posLumi.x, posLumi.y - 2, posLumi.z); Hikari.mover(jugador.x, jugador.y, jugador.z, jugador.yaw);
        Atmosfera.rojo(rojo0); Atmosfera.lunaNarrativa(luna0);
      } else {
        Cin.util.finalizarUnaVez('liberacion', () => {
          const c = Sis.ST.inicio.cap; c.doradaLibre = true; c.lumiLuciernaga = true; Sis.ST.cieloRojo = false;
        });
        LunaRoja.mostrar(false); for (let j = 0; j < 4; j++) LunaRoja.conexion(j, false);
        LunaDorada.liberar(1); LunaDorada.mostrar(false); Lumi.grupo.scale.setScalar(L.luciernaga); Lumi.grupo.visible = true;
        Atmosfera.rojo(0); Atmosfera.lunaNarrativa(0); Cin.colocarJugador(PH.x, PH.z, Math.PI, PH.y);
        Hikari.reiniciarAnimacion(); M.posarHikari({}, 0); Hikari.mover(J.x, J.y, J.z, J.yaw);
        Lumi.teletransportar(PH.x + .8, PH.y + .2, PH.z); Lumi.grupo.position.copy(Lumi.pos); haloLumi.scale.setScalar(1.5); haloLumi.opacidad = .8; Sis.guardar();
        if (cb) cb();
      }
      if (consulta && op.consulta && cb) cb();
    }, 'liberacion'); return true;
  }
  /* ---------- créditos al terminar el recorrido del epílogo: después se sigue jugando en el mundo liberado ---------- */
  function creditos(cb) {
    const html = '<div class="ci"><h2>Ecos de Luz</h2><p>La luz ya no se entrega. El faro guía barcos y guarda los nombres de quienes no volvieron.</p>' +
      '<p>Hikari recuerda que fue Akari, y sigue llamándose Hikari.</p><p style="opacity:.8;margin-top:16px">Gracias por jugar <b>Ecos de Luz</b>.</p>' +
      '<p style="font-size:14px;opacity:.7">El valle y Yoake siguen abiertos: aún quedan murales, ecos, cofres y animales por descubrir.</p>' +
      '<button class="btn principal" id="btnSeguir" style="margin-top:20px">Seguir en el valle</button></div>';
    UI.hud(false); UI.creditos(html);
    $('btnSeguir').onclick = () => { $('creditos').classList.add('oculto'); Sonido.sfx('ui2'); UI.hud(true); if (cb) cb(); };
  }

  Cin.travesia = travesia; Cin.capturaMomo = capturaMomo; Cin.muerteTasogare = muerteTasogare; Cin.encarnacion = encarnacion; Cin.liberacion = liberacion;
  return { travesia, capturaMomo, muerteTasogare, encarnacion, liberacion, centroLuna, creditos };
})();
