/* === Ecos de Luz · 43-duelo-espiral.js ===
   El duelo con Tasogare, fase 2: «Ocaso», en la espiral del faro (rediseño de la historia, fase 21). La espiral está en
   sombra: sus plataformas apenas se ven y no se pisan hasta que el haz de Hikari las ilumina (se llenan de luz, duran
   unos segundos al cortarlo y la que pisa no se apaga). En esta fase el haz gasta luz, la misma que el pulso, y con el haz
   no se para ni se golpea: hay que decidir cuándo cortarlo. Tasogare, en la última plataforma, invoca Sombras fijas en las
   plataformas de más arriba; un Cazador invocado ronda el faro y su ojo devora la luz de las plataformas que barre. Al
   llegar junto a él, se retira al cristal (aviso 'duelo2Fin'). Lo lanza un paso de misión con empieza: 'duelo2'.
   Números en DUELO_ESPIRAL; textos en GUION.duelo. */
"use strict";

/* luz de las plataformas (cuánto sube por s con el haz, cuánto baja por s, s que dura al cortar el haz, radio que toca el
   haz); coste del haz (luz por s; con el haz, además, la luz no se recupera); Sombras (cada cuántos s, cuántas a la vez, tipos, cuántas plataformas por delante de
   Hikari, s hasta la primera); el Cazador invocado (radio y altura de su ronda, velocidad, cuánta luz devora por s, ancho
   y largo de su haz para devorarla, y hacia dónde mira: barre la espiral, a qué altura sobre el faro, cuánto se aparta del
   centro y cuánto sube y baja); a qué distancia de Tasogare acaba la fase */
const DUELO_ESPIRAL = {
  luz: { sube: 2.4, baja: .5, queda: 2.5, radio: 1.9 },
  haz: { coste: 12 },
  sombras: { cada: 7, max: 2, tipos: ['lanzadora', 'lanzadora', 'escudo'], delante: [2, 4], primera: 4 },
  cazador: { id: 'faro', nom: 'Cazador del Ocaso', radio: 27, alto: [13, 17], vel: 7, come: 1.8, ancho: 2.2, largo: 34, mira: { alto: 10, radio: 10, sube: 6 } },
  fin: 3.2
};

const DueloEspiral = (() => {
  const D = DUELO_ESPIRAL, _w = new THREE.Vector3();
  let activo = false, luz = null, queda = null, tSombra = 0, zona = null, cazador = null, tPose = 0, iSombra = 0;
  const P = () => Estr.espiral;
  /* distancia de un punto a un segmento (origen, dirección unitaria, largo) */
  function distSeg(p, o, d, t) { _w.set(p.x - o.x, p.y - o.y, p.z - o.z); const s = clamp(_w.dot(d), 0, t); return Math.hypot(p.x - (o.x + d.x * s), p.y - (o.y + d.y * s), p.z - (o.z + d.z * s)); }
  function humo(x, y, z) { for (let i = 0; i < 50; i++) FX.humo(x + rnd(-.7, .7), y + rnd(0, 2.6), z + rnd(-.7, .7), rnd(-.4, .4), rnd(.8, 1.8), rnd(-.4, .4), rnd(1.4, 2.4), rnd(.5, 1), 0x2e2228, .45); }
  function empezar() {
    if (activo) return; activo = true; const N = P().length; luz = new Array(N).fill(0); queda = new Array(N).fill(0);
    Estr.luzEspiral = luz; Estr.mostrarEspiral(true); zona = { estado: 'activa', n: 0 }; tSombra = D.sombras.primera; iSombra = 0;
    // Tasogare, en la última plataforma, de cara al valle
    const T = P()[N - 1]; Tasogare.mostrar(true); Tasogare.hojaEntera(false); Tasogare.brillo(1); Tasogare.colocar(T.x, T.y, T.z, Math.atan2(T.x, T.z)); Tasogare.pose('reposo', 0, true); Tasogare.abrirAlas(1);
    humo(T.x, T.y, T.z); Sonido.sfx('trueno');
    // el Cazador invocado ronda el faro: barre la espiral, no se lanza, y su ojo devora la luz
    const S = sitio('faro'), C = D.cazador, ruta = []; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ruta.push([S.x + Math.cos(a) * C.radio, S.z + Math.sin(a) * C.radio]); }
    cazador = Cazadores.invocar({ id: C.id, nom: C.nom, ruta, alto: C.alto, vel: C.vel, fase: 0, soloMira: true, mira: { x: S.x, y: Estr.yFaro + C.mira.alto, z: S.z, radio: C.mira.radio, alto: C.mira.sube } });
    UI.aviso(GUION.duelo.espiral, 'mision');
  }
  function terminar() {
    activo = false; Estr.luzEspiral = null; Estr.mostrarEspiral(true);
    for (const s of Sombras.lista.slice()) if (s.zona === zona) Sombras.quitar(s);
    Cazadores.retirar(D.cazador.id); cazador = null;
    const T = P()[P().length - 1]; humo(T.x, T.y, T.z); FX.rafaga(T.x, T.y + 1.4, T.z, 30, 2.2, 1.4, .16, 0xff4a24, 1.4); Sonido.sfx('disolver', { pos: { x: T.x, y: T.y, z: T.z } });
    Tasogare.mostrar(false); Tasogare.abrirAlas(0); Sis.marcador(null); UI.aviso(GUION.duelo.espiralFin, 'mision'); Bus.emit('duelo2Fin');
  }
  /* invoca una Sombra fija unas plataformas por delante de Hikari; un hilo rojo va de Tasogare a ella */
  function invocar(desde) {
    const N = P().length, S = D.sombras, k = clamp(desde + rndi(S.delante[0], S.delante[1]), 1, N - 2), p = P()[k], T = P()[N - 1];
    Sombras.crear(S.tipos[iSombra++ % S.tipos.length], p.x, p.z, zona, { y: p.y, fija: true }); zona.n++;
    Tasogare.pose('alzar', 8); tPose = 1.2; Sonido.sfx('sombraBrota', { pos: { x: p.x, y: p.y, z: p.z } });
    for (let i = 0; i < 24; i++) { const u = i / 23; FX.emit(lerp(T.x, p.x, u), lerp(T.y + 2.4, p.y + 1, u), lerp(T.z, p.z, u), 0, .2, 0, .9, .18, 0xff3a24, .9); }
  }
  function actualizar(dt, J) {
    if (!activo) return;
    const S = Sis.ST, N = P().length, L = D.luz;
    // la plataforma que pisa Hikari no se apaga
    let pisa = -1; for (let k = 0; k < N; k++) { const p = P()[k]; if (Math.hypot(J.x - p.x, J.z - p.z) < L.radio && Math.abs(J.y - p.y) < 1.2) { pisa = k; break; } }
    // el haz llena de luz lo que toca, y gasta la de Hikari
    const haz = Haz.on; if (haz) S.luz = Math.max(0, S.luz - D.haz.coste * dt);
    const ojo = cazador && cazador.k >= 1 && cazador.dir ? cazador.ojo.position : null;
    for (let k = 0; k < N; k++) {
      const p = P()[k];
      if (haz && distSeg(p, Haz.o, Haz.d, Haz.t) < L.radio) { luz[k] = Math.min(1, luz[k] + L.sube * dt); queda[k] = L.queda; }
      else if (k === pisa) { luz[k] = Math.max(luz[k], .9); queda[k] = L.queda; }
      else if (queda[k] > 0) queda[k] -= dt;
      else luz[k] = Math.max(0, luz[k] - L.baja * dt);
      if (ojo && k !== pisa && distSeg(p, ojo, cazador.dir, D.cazador.largo) < D.cazador.ancho) { luz[k] = Math.max(0, luz[k] - D.cazador.come * dt); queda[k] = 0; }   // el ojo del Cazador devora la luz
    }
    // Tasogare invoca Sombras por delante de ella
    const vivas = Sombras.lista.filter(s => s.zona === zona && s.estado !== 'romper').length;
    tSombra -= dt; if (tSombra <= 0 && J.vivo) { tSombra = D.sombras.cada; if (vivas < D.sombras.max) invocar(Math.max(0, pisa)); }
    tPose -= dt; if (tPose < 0 && tPose > -dt * 1.5) Tasogare.pose('reposo', 3);
    Sis.marcador({ txt: GUION.duelo.espiralMarca });
    J.combate = Math.max(J.combate || 0, 2);
    // arriba, junto a él: se retira al cristal
    const T = P()[N - 1]; if (J.vivo && Math.hypot(J.x - T.x, J.z - T.z) < D.fin && J.y > T.y - 1.5) terminar();
  }
  Bus.on('empieza:duelo2', empezar);
  return { actualizar, get activo() { return activo; }, get luz() { return luz; } };
})();
