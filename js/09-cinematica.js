/* === Ecos de Luz · 09-cinematica.js ===
   Prólogo que cuenta la Noche de la Ofrenda (8 planos), visión de los cuatro santuarios, cinemáticas cortas al
   recuperar un fragmento y al purificar un gólem. Las escenas del rediseño de la historia (Mirador, huida, Noche Roja,
   robo, verdad y el final con el renacer y el epílogo) están en 39-escenas.js, que usa C.util.
   Se puede saltar manteniendo Espacio. Los textos están en GUION (26-guion.js). */
"use strict";
const KEY = {};
const IDLE = { vel: 0, suelo: true, agachado: false, giro: 0, vy: 0, planeo: false, nada: false, recoger: 0, acariciar: 0, herido: 0, pulso: 0, cargando: 0, rodando: 0, combate: 0, armado: false, atq: null, hablando: false, luz: .6, vx: 0, vz: 0 };

const Cin = (() => {
  const C = { activa: false, tipo: '', lamp: null };
  /* rutas de la cámara de cada cinemática (x, z): se cargan antes de empezar (precargarRuta, 10-juego.js) */
  C.RUTAS = { intro: [[-170, 150], [-130, 111], [-90, 72], [0, 34], [40, 50], [60, 0], [-134, 98], [-82, 58], [-40, -60], [0, 14]] };
  let shots = null, i = 0, t = 0, fin = null, hold = 0, frags = [], restos = [], flash = false, partes = 0;
  C.plano = () => i; // la música puede seguir el momento de la escena sin duplicar sus tiempos
  // la cámara de las cinemáticas enfoca el punto al que mira (desenfoque de profundidad de Render)
  const cam = (px, py, pz, lx, ly, lz) => { camera.position.set(px, py, pz); camera.lookAt(lx, ly, lz); Render.ajustes.foco = Math.hypot(lx - px, ly - py, lz - pz); };
  const suave = x => x * x * (3 - 2 * x), L = lerp;
  const yF = () => Estr.yFaro;

  /* tiempo de lectura: una frase (aunque dure varios planos seguidos) se ve al menos cps letras por segundo más un margen;
     si no da tiempo, esos planos se alargan en proporción */
  const LECTURA = { cps: 15, margen: 1.4 };
  function darTiempo(lista) {
    for (let a = 0; a < lista.length;) {
      let b = a, total = 0; while (b < lista.length && lista[b].txt && lista[b].txt === lista[a].txt) total += lista[b++].dur;
      if (b === a) { a++; continue; }
      const falta = lista[a].txt.length / LECTURA.cps + LECTURA.margen; if (falta > total) for (let k = a; k < b; k++) lista[k].dur *= falta / total;
      a = b;
    }
    return lista;
  }
  /* si el HUD estaba a la vista al empezar una escena, vuelve al terminarla (UI.cine lo oculta y no lo devuelve); las escenas que lo quieren oculto lo apagan en su cierre */
  let hudAntes = false;
  function arrancar(lista, cb, tipo, saltable) {
    hudAntes = UI.hudOn || hudAntes && C.activa; shots = darTiempo(lista); i = 0; t = 0; fin = cb; hold = 0; C.activa = true; C.tipo = tipo; UI.cine(true); $('saltar').classList.toggle('oculto', saltable === false); entrar();
  }
  function entrar() { const s = shots[i]; t = 0; UI.subtitulo(s.txt || null); if (s.in) s.in(); }
  function terminar() {
    Bus.emit('narrativa:terminar', { escena: C.tipo });
    UI.subtitulo(null); UI.tituloCine(false); UI.cine(false); if (hudAntes) { UI.hud(true); hudAntes = false; } $('saltar').classList.add('oculto'); C.activa = false; C.pose = null; for (const f of frags.concat(restos)) scene.remove(f); frags = []; restos = []; shots = null;
    if (+$('fundido').style.opacity > 0) UI.fundido(0, 400);
    const cb = fin; fin = null; if (cb) cb();
  }
  /* repetir el plano: si ya fundía a negro, vuelve la imagen; entrar() pone el texto y vuelve a ejecutar su in() */
  C.repetir = () => {
    if (!shots) return; const s = shots[i]; hold = 0;
    if (s.fundido) { s.fundido = false; UI.fundido(0, 400); }
    entrar(); Bus.emit('narrativa:repetir', { tipo: C.tipo, plano: i });
  };
  C.avanzar = () => {
    if (!shots) return; const s = shots[i]; s.f(1, s.dur, 0); if (s.out) s.out(); i++;
    if (i >= shots.length) terminar(); else { entrar(); UI.fundido(0, 400); }
  };
  C.estadoPlano = () => shots ? { i, t, dur: shots[i].dur, total: shots.reduce((n, s) => n + s.dur, 0) } : null;
  C.actualizar = function (dt) {
    if (!shots || UI.pausado) return;
    if (KEYP.KeyR) { C.repetir(); return; }
    if (KEYP.KeyE) { C.avanzar(); return; }
    if (KEY.Space) hold += dt; else hold = 0; if (hold > 1) { hold = 0; const s = shots[i]; if (s.out) s.out(); terminar(); return; }
    t += dt; const s = shots[i], u = clamp(t / s.dur, 0, 1); s.f(u, t, dt);
    // un plano con 'fundir' acaba en negro y el siguiente aparece desde él
    if (s.fundir && !s.fundido && t >= s.dur - s.fundir) { s.fundido = true; UI.fundido(1, s.fundir * 1000); }
    if (t >= s.dur) { if (s.out) s.out(); i++; if (i >= shots.length) terminar(); else { entrar(); if (s.fundido) UI.fundido(0, 700); } }
    if (Hikari.root.visible) Hikari.animar(dt, C.pose || IDLE);   // C.pose: estado de animación de Hikari que pide la escena
    FX.actualizar(dt);
  };

  /* ---------- INTRO ---------- */
  /* haz del faro: halos alargados apilados sobre el sōrin (cuántos, separación en m, ancho abajo y arriba, estirado
     vertical, opacidad); corazon: brillo del corazón del faro encendido; luces: brillo de ventanas y faroles a oscuras; gris:
     saturación del mundo sin luz; color: la que tiene al acabar el título (vuelve un poco con Hikari); temblor de la
     cámara al quebrarse la luz (m); fundido: s de negro entre planos; suelo: altura mínima de la cámara sobre el terreno */
  const INTRO = { haz: { n: 26, paso: 5, escala: [8, 3], estira: 3.2, opacidad: .3 }, corazon: .45, luces: .3, gris: .22, color: .65, temblor: .5, fundido: .5, suelo: 4 };
  const ease = x => x * x * x * (x * (x * 6 - 15) + 10);
  const camAlta = (px, py, pz, lx, ly, lz) => cam(px, Math.max(py, altura(px, pz) + INTRO.suelo), pz, lx, ly, lz);
  /* ---------- PRÓLOGO: la Noche de la Ofrenda (rediseño de la historia) ----------
     Escenario: la escalinata sur del faro (de la plaza, a +1,15 m, a la terraza, a +4,15 m, z de 10,3 a 5,8) y la plaza.
     Akari (niña con la máscara de Hikari) sube con Tasogare a su lado; Kaito mira desde abajo; el pueblo canta.
     Arriba, la luz de Akari fluye hacia la puerta del faro; Tasogare corta ese hilo: el cristal estalla en cuatro
     fragmentos, su hoja se parte (la punta vuela hacia el Mirador: será la Katana del Alba), la oscuridad baja por la
     pagoda, Akari se deshace en luz (de lejos) y de esa luz nace Hikari al pie de la escalinata.
     PROLOGO: alturas de la terraza y de la plaza sobre el sitio, z de los actores, farolillos que suben, humo y ritmo */
  const PROLOGO = { terraza: 4.15, plaza: 1.15, zAkari: 5.6, zTaso: [11.8, 6.1], xTaso: 1.15, zKaito: 13.2, xKaito: -1.9, vAkari: .85,
    farolillos: { n: 26, sube: [.6, 1.2], color: 0xffb060 }, humo: { porSeg: 70, color: 0x0b0709, brasas: 0xff3a1e }, corte: 1.15, levita: .75 };
  /* máscara de Akari (la de Hikari: marfil, líneas de oro y ojos que brillan), en el hueso de la cabeza */
  function mascaraAkari(o) {
    const P = [pieza(new THREE.SphereGeometry(.138, 16, 10, -Math.PI * .42, Math.PI * .84, Math.PI * .14, Math.PI * .66), 0xf2efe6, { y: .09, z: .02, sz: 1.05 }),
      pieza(new THREE.BoxGeometry(.008, .05, .006), 0xd9a441, { y: .175, z: .14, rx: -.5 }), pieza(new THREE.BoxGeometry(.06, .007, .006), 0xd9a441, { y: .145, z: .152, rx: -.3 })];
    for (const s of [-1, 1]) P.push(pieza(new THREE.BoxGeometry(.045, .01, .008), 0x5ff2e0, { x: .045 * s, y: .1, z: .158, ry: -.35 * s }));
    const m = new THREE.Mesh(fusionar(P), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 }));
    o.g.getObjectByName('cabeza').add(m); return m;
  }
  C.intro = function (cb) {
    const S = sitio('faro'), y = S.h, A = sitio('aldea'), Q = PROLOGO, sat = v => { Render.ajustes.saturacion = v; }; Render.ajustes.colorLugar = 0;
    const yT = y + Q.terraza, yP = y + Q.plaza; Atmosfera.rojo(0);
    Hikari.mostrar(false); Lumi.grupo.visible = false;
    const destinos = [sitio('petalo'), sitio('duna'), { x: -246, z: 232 }, sitio('escarcha')], corazon = Estr.corona.y - .6;
    // el faro encendido: corazón brillante y un haz de luz hacia el cielo (k: 1 encendido, 0 apagado)
    const haz = [], base = y + Estr.cimaFaro, H = INTRO.haz;
    for (let k = 0; k < H.n; k++) { const h = new Halo(0xfff0c0, 0); h.position.set(0, base + k * H.paso, 0); scene.add(h); haz.push(h); restos.push(h); }
    const luzFaro = (k, tt) => {
      Estr.brillo = k; Estr.corazonLuz.opacidad = INTRO.corazon * Math.min(k, 2); Estr.corazon.material.color.setHex(k > .5 ? 0xfff2c8 : 0x555a78);
      haz.forEach((h, j) => { const f = j / (H.n - 1); h.opacidad = Math.min(k, 1) * H.opacidad * Math.pow(1 - f, 1.4) * (.85 + .15 * Math.sin(tt * 3 - j * .5)); const w = L(H.escala[0], H.escala[1], f) * (.8 + .2 * Math.min(k, 1)); h.scale.set(w, w * H.estira, 1); });
    };
    const luces = k => { if (Estr.luzMesh) Estr.luzMesh.material.color.setScalar(k); };
    // actores: Akari, Kaito y Tasogare (al pie de la escalinata)
    const akari = Gente.crear({ nombre: '', nino: true, alto: 1.2, kimono: 0xf4f0e6, obi: 0xb7332d, pelo: 0x161212, rutina: { tipo: 'pasear', puntos: [[0, 0]], vel: Q.vAkari }, gesto: 'sereno' });
    akari.g.position.set(0, yP, 11.4); akari.g.rotation.y = Math.PI; scene.add(akari.g); restos.push(akari.g); mascaraAkari(akari);
    const kaito = Gente.crear({ nombre: '', alto: 1.6, kimono: 0x3f6f8a, obi: 0x1d2a3a, pelo: 0x2a1d1a, moño: false, rutina: { tipo: 'quieto' }, gesto: 'añoranza' });
    kaito.g.position.set(Q.xKaito, yP, Q.zKaito); kaito.g.rotation.y = Math.PI - .15; scene.add(kaito.g); restos.push(kaito.g);
    Tasogare.mostrar(true); Tasogare.hojaEntera(true); Tasogare.pose('empuñar'); Tasogare.abrirAlas(0);
    let tz = Q.zTaso[0], ty = yP, tyaw = Math.PI; Tasogare.colocar(Q.xTaso, ty, tz, tyaw);
    const brilloAkari = new Halo(0xfff0c0, 0); brilloAkari.scale.set(2.6, 2.6, 1); scene.add(brilloAkari); restos.push(brilloAkari);
    const luzAkari = k => { const g = akari.g.position; brilloAkari.position.set(g.x, g.y + .75, g.z); brilloAkari.opacidad = k * (.8 + .2 * Math.sin(U.uT.value * 6)); };
    const actores = dt => { akari.actualizar(dt, 0, -999); if (kaito.g.visible) kaito.actualizar(dt, 0, -999); };
    // farolillos de papel que suben al cielo durante el festival
    const faro_ = [];
    const soltarFarolillos = () => { for (let k = 0; k < Q.farolillos.n; k++) { const h = new Halo(Q.farolillos.color, 0); const a = Math.random() * TAU, r = rnd(14, 26); h.position.set(Math.cos(a) * r, yP + rnd(0, 6), Math.sin(a) * r); h.userData = { v: rnd(Q.farolillos.sube[0], Q.farolillos.sube[1]), f: Math.random() * 6 }; h.scale.set(1.9, 2.2, 1); scene.add(h); restos.push(h); faro_.push(h); } };
    const moverFarolillos = (dt, tt, k) => { for (const h of faro_) { h.position.y += h.userData.v * dt; h.position.x += Math.sin(tt * .7 + h.userData.f) * .15 * dt; h.opacidad = k * (.75 + .25 * Math.sin(tt * 5 + h.userData.f)); } };
    // hilo de luz de Akari hacia la puerta del faro (chispas que fluyen) y la punta de la hoja en vuelo
    const hilo = (n, k) => { for (let i = 0; i < n; i++) { const g = akari.g.position, u = Math.random(); FX.emit(L(g.x, 0, u) + rnd(-.12, .12), L(g.y + 1, yT + 1.6, u) + rnd(-.12, .12), L(g.z, 4.4, u), 0, rnd(.6, 1.6) * k, -rnd(.8, 1.6) * k, .8, .2, 0xffe2a0, 1); } };
    let punta = null, puntaT = 0, puntaIni = null; const MIRADOR = sitio('mirador');
    // humo de la oscuridad: baja por los aleros de la pagoda
    const humo = dt => { const n = Math.round(Q.humo.porSeg * dt * (.7 + Math.random() * .6)); for (let i = 0; i < n; i++) { const a = Math.random() * TAU, nivel = Math.random(), r = L(8, 5, nivel), hy = L(y + 7.5, y + 19, nivel); FX.humo(Math.cos(a) * r, hy, Math.sin(a) * r, Math.cos(a) * rnd(.4, 1.4), -rnd(1, 2.6), Math.sin(a) * rnd(.4, 1.4), rnd(2.2, 3.6), rnd(2.4, 4), Q.humo.color, .85); if (Math.random() < .2) FX.emit(Math.cos(a) * r, hy, Math.sin(a) * r, Math.cos(a) * .6, -rnd(.5, 1.5), Math.sin(a) * .6, 1.6, .16, Q.humo.brasas, .9); } };
    const lista = [
      // 1. el valle al alba: a ras de la pradera, hacia el faro y su haz
      { dur: 9, txt: GUION.intro[0], fundir: INTRO.fundido, in() { aplicarEntorno(1, 0); },
        f(u, tt, dt) { aplicarEntorno(1, 0); luzFaro(1, tt); actores(dt); const q = ease(u); camAlta(L(-170, -90, q), L(46, 52, q), L(150, 72, q), 0, y + L(18, 24, q), 0); } },
      // 2. el festival: el pueblo canta ante la pagoda y suben los farolillos; la cámara pasa tras ellos y sube
      { dur: 10, txt: GUION.intro[1], in() { aplicarEntorno(.8, 0); soltarFarolillos(); },
        f(u, tt, dt) { aplicarEntorno(.8, 0); luzFaro(1, tt); actores(dt); Ecos.forzar('canto', 1); moverFarolillos(dt, tt, Math.min(1, tt)); const q = ease(u), a = 1.35 + q * .6, r = L(34, 28, q); camAlta(Math.cos(a) * r, y + L(2.6, 15, q), Math.sin(a) * r, 0, y + L(2, 18, q), 10 * (1 - q)); } },
      // 3. «Aquel año, la elegida fue Akari»: cámara baja; ella sube la escalinata y el guardián a su lado; Kaito mira desde abajo
      { dur: 10, txt: GUION.intro[2], in() { akari.ir(0, Q.zAkari, Q.vAkari); Tasogare.caminar(.7); },
        f(u, tt, dt) {
          aplicarEntorno(.75, 0); luzFaro(1, tt); Ecos.forzar('canto', 1); moverFarolillos(dt, tt + 10, 1); actores(dt);
          const k = clamp((tt - .5) / 6.5, 0, 1); tz = L(Q.zTaso[0], Q.zTaso[1], k); ty = sueloEnJ(Q.xTaso, ty + .3, tz); Tasogare.colocar(Q.xTaso, ty, tz, Math.PI); if (k >= 1) Tasogare.caminar(0);
          const q = ease(u); cam(L(.9, 2.2, q), yP + L(1.1, 1.6, q), L(17.5, 15.5, q), L(0, .3, q), L(yP + 2.6, yT + 1.3, q), L(10, 6, q)); Render.ajustes.foco = Math.hypot(akari.g.position.z - camera.position.z, akari.g.position.y + 1 - camera.position.y);
        } },
      // 4a. silencio: arriba, la luz tira de Akari hacia el faro; el cristal brilla más que nunca
      { dur: 5, txt: null, in() { Sonido.sfx('latido'); },
        f(u, tt, dt) {
          aplicarEntorno(.7, 0); luzFaro(1 + u * .8, tt); Ecos.forzar('canto', Math.max(0, 1 - u * 1.5)); moverFarolillos(dt, tt + 20, 1); actores(dt);
          akari.g.position.y = yT + Q.levita * suave(clamp(u * 1.3, 0, 1)); hilo(Math.round(dt * 110), 1); luzAkari(suave(u) * .9);
          const q = ease(u); cam(L(-4.4, -3.2, q), yT + L(1.1, 1.5, q), L(8.6, 7.6, q), L(0, .2, q), yT + L(1.1, 1.5, q), Q.zAkari - .2);   // desde el oeste: el guardián queda detrás de ella
        } },
      // 4b. primer plano: la mano del guardián se cierra sobre la empuñadura
      { dur: 4, txt: null, in() { setTimeout(() => Sonido.sfx('latido'), 1700); },
        f(u, tt, dt) {
          aplicarEntorno(.7, 0); luzFaro(1.8, tt); actores(dt); akari.g.position.y = yT + Q.levita; hilo(Math.round(dt * 110), 1); luzAkari(.9);
          if (tt > 1.9) Tasogare.pose('guardia', 3);
          const m = Tasogare.hueso('manoD').getWorldPosition(new THREE.Vector3()); cam(m.x + L(1.15, .95, u), m.y + L(-.05, .05, u), m.z - .45, m.x - .25, m.y - .15, m.z + .1);   // de lado, entre él y la puerta
        } },
      // 5. «Él dijo que no»: alza la espada y corta el hilo; el cristal estalla y la hoja se parte
      { dur: 8, txt: GUION.intro[3], in() { flash = false; Tasogare.pose('alzar', 9); },
        f(u, tt, dt) {
          aplicarEntorno(.7, 0); actores(dt);
          if (!flash && tt > Q.corte - .25) Tasogare.pose('corte');
          if (!flash && tt > Q.corte) {
            flash = true; UI.destello(.95, 90); setTimeout(() => UI.destello(0, 1500), 140); Sonido.sfx('trueno'); Sonido.sfx('fragmento'); Mando.vibrar(1, .8, 400);
            const g = akari.g.position; FX.rafaga(g.x + .4, g.y + 1.6, g.z - .5, 70, 9, 1.6, .4, 0xfff0c0, 1); FX.rafaga(0, corazon, 0, 90, 16, 2, .5, 0xfff0c0, 2);
            punta = Tasogare.romperHoja(); puntaIni = punta.position.clone(); puntaT = 0;
            frags = destinos.map((d, k) => { const s = new Halo(Estr.COL_FRAG[k]); s.scale.set(7, 7, 1); s.position.set(0, corazon, 0); scene.add(s); return s; });
          }
          const tc = tt - Q.corte, kTem = flash ? Math.max(0, 1 - tc / 1.2) * INTRO.temblor : 0;
          luzFaro(flash ? Math.max(0, 1.8 - tc * 2.5) : 1.8, tt); if (!flash) hilo(Math.round(dt * 70), 1);
          akari.g.position.y = flash ? yT + Q.levita * Math.max(0, 1 - tc * 1.6) : yT + Q.levita; luzAkari(flash ? Math.max(.25, .9 - tc) : .9);
          if (flash && tc > 1.6) Tasogare.pose('reposo', 2);
          if (punta) { puntaT += dt; const e = Math.min(1, puntaT / 3.2), my = altura(MIRADOR.x, MIRADOR.z) + 1; punta.position.set(L(puntaIni.x, MIRADOR.x, e), L(puntaIni.y, my, e) + Math.sin(e * Math.PI) * 30, L(puntaIni.z, MIRADOR.z, e)); punta.rotation.x += dt * 14; FX.emit(punta.position.x, punta.position.y, punta.position.z, 0, 0, 0, .6, .25, 0xdff8ff, .9); if (e >= 1) { scene.remove(punta); punta = null; } }
          if (flash) frags.forEach((f, k) => { const e = clamp((tc - .3) / 6, 0, 1), d = destinos[k], ex = d.x, ez = d.z, ey = altura(ex, ez) + 4, q2 = suave(e); f.position.set(L(0, ex, q2), L(corazon, ey, q2) + Math.sin(q2 * Math.PI) * 70, L(0, ez, q2)); f.scale.setScalar(7 * (1 - e * .4)); FX.emit(f.position.x, f.position.y, f.position.z, rnd(-1, 1), rnd(-1, 1), rnd(-1, 1), 1.3, .5, Estr.COL_FRAG[k], .9); });
          const q = ease(clamp(tc / 4, 0, 1)), sube = flash ? q : 0;
          cam(L(5.2, 9, sube) + rnd(-kTem, kTem), L(yP + 2.4, y + 14, sube) + rnd(-kTem, kTem), L(15.5, 30, sube), L(.6, 0, sube), L(yT + 1.6, corazon + 6, sube), L(5.6, 0, sube));
        } },
      // 6. «Y la oscuridad que el faro contenía entró en el valle»: el humo baja por la pagoda, se apagan las luces y el
      //    color; Akari se deshace en luz (de lejos); el guardián, de espaldas, mira el valle con su ojo rojo
      { dur: 10, txt: GUION.intro[4], fundir: INTRO.fundido, in() { for (const f of frags) scene.remove(f); frags = []; kaito.g.visible = false; Tasogare.pose('reposo'); },
        f(u, tt, dt) {
          const k = suave(clamp(u * 1.3, 0, 1)); aplicarEntorno(L(.6, -1, k), 0); sat(L(1, INTRO.gris, k)); luces(L(1, INTRO.luces, k)); luzFaro(0, tt); Ecos.forzar('canto', 0); humo(dt); actores(dt);
          const g = akari.g, d = clamp((tt - 2.2) / 3, 0, 1);   // Akari se deshace en motas de luz
          if (d > 0 && d < 1) { g.scale.setScalar(1 - suave(d) * .999); for (let i = 0; i < Math.round(dt * 90); i++) FX.emit(g.position.x + rnd(-.3, .3), g.position.y + rnd(0, 1.2) * (1 - d), g.position.z + rnd(-.3, .3), rnd(-.2, .2), rnd(.3, 1), rnd(-.2, .2), 2.2, .18, 0xfff0c0, .9); }
          g.visible = d < 1; luzAkari(d < 1 ? .25 + .6 * Math.sin(d * Math.PI) : 0);
          if (tt > 5.4) { Tasogare.colocar(Q.xTaso, ty, Q.zTaso[1], L(Math.PI, 0, suave(clamp((tt - 5.4) / 1.6, 0, 1)))); if (tt > 6.4) Tasogare.pose('mirarAtras', 2.5); }
          if (tt < 5.6) { const q = ease(tt / 5.6); camAlta(L(-14, -9, q), yP + L(3.5, 5, q), L(28, 22, q), 0, L(yT + 6, yT + 1, q), L(2, 5.6, q)); }
          else { const q = ease((tt - 5.6) / 4.4); cam(L(-3.2, -2.6, q), yT + L(2.6, 2.3, q), 5.05, L(.5, .7, q), yT + L(2.0, 2.1, q), L(8.2, 8, q)); }   // tras su hombro derecho, en la terraza (la pared está en z 4,5)
        } },
      // 7. «De lo último que quedaba de ella… despertaste tú»: sus motas bajan la escalinata y nace Hikari con su máscara
      { dur: 9, txt: GUION.intro[5], in() { Tasogare.mostrar(false); partes = 0; Hikari.mover(0, y + 1.2, 14, 0); Hikari.reiniciarTela(); Hikari.root.scale.setScalar(.001); aplicarEntorno(-1, 0); sat(INTRO.gris); luces(INTRO.luces); },
        f(u, tt, dt) {
          aplicarEntorno(-1, 0); sat(INTRO.gris); luces(INTRO.luces); const hy = y + 1.2, q = ease(u), a = Math.PI / 2 + 1.0 - q * .45, r = L(11, 8, q);
          cam(Math.cos(a) * r, hy + L(2.4, 1.5, q), 14 + Math.sin(a) * r, 0, hy + 1.1, 14);
          C.lamp = { x: 0, y: hy + 2.2, z: 14.8, i: clamp((tt - 2.4) / 2, 0, 1) * 2.4 };
          if (tt < 3.4) for (let k = 0; k < Math.round(dt * 160); k++) { const e = Math.random(); FX.emit(rnd(-.6, .6), L(yT + 1, hy + 1, e), L(Q.zAkari, 14, e), rnd(-.3, .3), -rnd(.5, 1.6), rnd(1, 2.4), 1.4, .17, 0xfff0c0, .85); }
          if (tt > 2.6) { Hikari.mostrar(true); const kk = clamp((tt - 2.6) / 1.6, 0, 1); Hikari.root.scale.setScalar(.001 + suave(kk)); if (!partes) { partes = 1; Sonido.sfx('nivel'); FX.rafaga(0, hy + 1, 14, 60, 6, 1.4, .35, 0x9ffff0, 1); } }
        } },
      // 8. título: Hikari se vuelve hacia el faro, la cámara sube tras ella y vuelve algo de color
      { dur: 11, txt: null, in() { UI.tituloCine(true, GUION.intro[6]); Sonido.sfx('amanecer'); Lumi.grupo.visible = true; Lumi.teletransportar(1.5, y + 1.5, 15.5); },
        f(u, tt, dt) { const q = ease(u); aplicarEntorno(-.8 + u * .25, 0); sat(L(INTRO.gris, INTRO.color, q)); luces(L(INTRO.luces, .8, q)); const hy = y + 1.2; Hikari.root.scale.setScalar(1); Hikari.mover(0, hy, 14, L(0, Math.PI, suave(clamp(u * 3, 0, 1)))); C.lamp = { x: 0, y: hy + 2.2, z: 15, i: 2.4 }; cam(L(10, 4, q), hy + L(2.6, 3.8, q), L(34, 37, q), 0, y + L(14, 26, q), 0); Lumi.actualizar(dt, 0, hy, 14, Math.PI, null, 0); if (Math.random() < dt * 12) FX.emit(rnd(-3, 3), hy + rnd(0, 3), 14 + rnd(-3, 3), 0, rnd(.3, 1), 0, 2, .16, 0x9ffff0, .7); },
        out() { UI.tituloCine(false); C.lamp = null; } }
    ];
    arrancar(lista, () => {
      C.lamp = null; Hikari.root.scale.setScalar(1); Hikari.mostrar(true); Estr.refrescarCorazon(); luces(1); Render.ajustes.colorLugar = 1; Ecos.forzar('canto', 0);
      Tasogare.mostrar(false); Tasogare.hojaEntera(false); if (punta) { scene.remove(punta); punta = null; }
      if (cb) cb();
    }, 'intro');
  };

  /* ---------- GUARDIÁN PURIFICADO (3 s): cede la coraza y dice su frase; la cámara lo rodea ---------- */
  C.purificado = function (B, cb) {
    UI.hud(false);
    const lista = [{ dur: 3, txt: (GUION.guardianes[B.id] || {}).frase, f(u, tt, dt) { const r = B.D.alto * 2.4, an = B.yaw + .8 + u * 1.1; cam(B.x + Math.sin(an) * r, B.A.y + B.D.alto * L(.5, .9, u), B.z + Math.cos(an) * r, B.x, B.A.y + B.D.alto * .45, B.z); Golems.animar(B, dt); } }];
    arrancar(lista, () => { UI.hud(true); if (cb) cb(); }, 'purificado');
  };

  /* ---------- LIBERACIÓN DEL GUARDIÁN (16 s): la atadura se abre, el espíritu asciende y comparte un hilo de luz con Hikari ---------- */
  const LIBERACION = { hilo: [.1, .85] };
  C.liberarGuardian = function (B, cb) {
    UI.hud(false);
    const G = GUION.guardianes[B.id] || {}, Hk = (G.liberacion || {})['GF-LIB-P5'], cx = () => B.x, cy = () => B.A.y + B.D.alto * .75;
    const orbita = (u, a0, da, k0, k1) => { const r = B.D.alto * 2.2, an = B.yaw + a0 + u * da; cam(B.x + Math.sin(an) * r, B.A.y + B.D.alto * L(k0, k1, u), B.z + Math.cos(an) * r, B.x, B.A.y + B.D.alto * .5, B.z); };
    const lista = [
      { dur: 3, f(u, tt, dt) { orbita(u, 1.9, .5, .55, .6); Golems.animar(B, dt); } },
      { dur: 3, txt: G.despedida, in() { Golems.ascenso(B); Sonido.sfx('amanecer'); }, f(u, tt, dt) { orbita(u, 2.4, .5, .6, .8); Golems.animar(B, dt); } },
      { dur: 4, f(u, tt, dt) {
          orbita(u, 2.9, .45, .8, .9); Golems.animar(B, dt);
          const k = suave(clamp((u - LIBERACION.hilo[0]) / (LIBERACION.hilo[1] - LIBERACION.hilo[0]), 0, 1)), hx = L(cx(), J.x, k), hz = L(B.z, J.z, k), hy = L(cy() + 6 * Math.sin(k * Math.PI), J.y + 1.2, k);
          if (Math.random() < dt * 90) FX.emit(hx + rnd(-.1, .1), hy, hz + rnd(-.1, .1), rnd(-.3, .3), rnd(0, .6), rnd(-.3, .3), .9, .28, 0xfff0b0, .9);
        } },
      { dur: 3, txt: Hk, in() { FX.rafaga(J.x, J.y + 1.2, J.z, 40, 3, 1, .22, 0xfff0b0, 2); Sonido.sfx('fragmento'); }, f(u, tt, dt) { cam(J.x + Math.sin(J.yaw + .9) * 3.4, J.y + 1.5, J.z + Math.cos(J.yaw + .9) * 3.4, J.x, J.y + 1.2, J.z); Golems.animar(B, dt); } },
      { dur: 3, f(u, tt, dt) { orbita(u, 3.3, .3, .5, .45); Golems.animar(B, dt); } }
    ];
    arrancar(lista, () => { UI.hud(true); if (cb) cb(); }, 'guardianLibre');
  };

  /* utilidades para las escenas de 39-escenas.js: arrancar una lista de planos, colocar la cámara (y el foco), suavizado,
     apuntar algo que se quita al terminar la escena, la máscara de Akari para un doble y la altura del faro */
  C.util = { arrancar, cam, suave, resto: o => restos.push(o), mascaraAkari, yF };
  /* dirección local: el reloj y la lectura siguen durante la retención; la escena conserva cámara, actores y efectos.
     Se mide con el reloj del plano, por lo que pausa, simulación y repetición no dependen de temporizadores reales. */
  let retenerHasta = 0;
  C.util.congelar = s => { retenerHasta = s > 0 ? t + s : 0; };
  C.util.congelado = () => retenerHasta > 0 && t < retenerHasta - 1e-8;
  C.util.sacudida = (amp, dur, hz, tiempo, radianes) => {
    if (tiempo < 0 || tiempo >= dur || AJUSTES.sacudida === false) return;
    const k = (1 - tiempo / dur) ** 2, a = tiempo * hz * TAU;
    camera.position.x += Math.sin(a) * amp * k;
    camera.position.y += Math.sin(a * 1.37) * amp * k;
    camera.rotateZ(Math.sin(a * .83) * (radianes || 0) * k);
  };
  /* sustitución reversible para escenas que dirigen una animación también actualizada por el bucle general */
  C.util.sustituir = (objeto, clave, valor) => {
    const anterior = objeto[clave]; objeto[clave] = valor;
    return () => { objeto[clave] = anterior; };
  };
  /* render() escribe el desenfoque general después del plano. Este acceso temporal conserva el valor dirigido
     sin modificar el render ni las otras escenas; restaurar devuelve exactamente el descriptor anterior. */
  C.util.desenfoquePlano = inicial => {
    const ajustes = Render.ajustes, descriptor = Object.getOwnPropertyDescriptor(ajustes, 'desenfoqueObj');
    let valor = inicial;
    Object.defineProperty(ajustes, 'desenfoqueObj', { configurable: true, enumerable: true, get: () => valor, set() {} });
    return { poner(v) { valor = v; }, restaurar() { Object.defineProperty(ajustes, 'desenfoqueObj', descriptor); } };
  };
  /* Cierres narrativos persistentes: la representación se puede reconstruir sin volver a conceder el hecho. */
  C.util.finalizarUnaVez = (id, confirmar) => {
    const cap = Sis.ST.inicio.cap || (Sis.ST.inicio.cap = {}), marcas = cap.montajes || (cap.montajes = {});
    if (marcas[id]) return false;
    marcas[id] = true; confirmar(); Sis.guardar(); return true;
  };
  C.util.azarPlano = (semilla, i) => {
    let n = (semilla + Math.imul(i + 1, 374761393)) | 0;
    n = Math.imul(n ^ n >>> 13, 1274126177); return ((n ^ n >>> 16) >>> 0) / 4294967296;
  };
  /* Los sonidos existentes no devuelven una voz. Capturar solo sus fuentes creadas sincrónicamente permite
     detenerlas al pausar o repetir, conservando sus buses, volumen y muestras. No quedan prototipos sustituidos. */
  C.util.audioPlano = () => {
    const fuentes = new Set(); let pendientes = [], reloj = 0, parado = false;
    const detener = () => { fuentes.forEach(s => { try { s.stop(); } catch (e) {} }); fuentes.clear(); };
    const tocar = (nombre, opciones) => {
      const cambios = [];
      for (const clase of [window.AudioBufferSourceNode, window.OscillatorNode]) {
        if (!clase) continue;
        const proto = clase.prototype, antes = proto.start, descriptor = Object.getOwnPropertyDescriptor(proto, 'start');
        proto.start = function () { fuentes.add(this); return antes.apply(this, arguments); };
        cambios.push(() => { if (descriptor) Object.defineProperty(proto, 'start', descriptor); else delete proto.start; });
      }
      try { Sonido.sfx(nombre, opciones); } finally { cambios.reverse().forEach(f => f()); }
    };
    const pausar = Sonido.pausar, restaurar = C.util.sustituir(Sonido, 'pausar', v => {
      const p = v || document.hidden;
      if (p && !parado) detener();
      if (!p && parado) pendientes.forEach(e => { if (e.hecho && reloj - e.t < .15) tocar(e.nombre, e.opciones); });
      parado = p; pausar(v);
    });
    return {
      entrar(lista) { detener(); reloj = 0; pendientes = (lista || []).map(e => ({ t: e[0], nombre: e[1], opciones: e[2] || { vol: .35 }, hecho: false })); },
      actualizar(t, dt) { reloj = t; if (parado || dt <= 0) return;
        pendientes.forEach(e => { if (!e.hecho && t + 1e-8 >= e.t) { e.hecho = true; tocar(e.nombre, e.opciones); } }); },
      tocar(nombre, opciones) { if (!parado) tocar(nombre, opciones); },
      cerrar() { detener(); pendientes = []; restaurar(); }
    };
  };
  /* Instancia local de dirección. Cada entrada rehace su instantánea y cada emisión usa nacimiento absoluto.
     Solo un HiloLuz por montaje: sus límites incluyen cinta, ondas, trayectos, motas y humo de todos los emisores. */
  const montajes = new Map();
  C.util.montaje = (id, semilla) => {
    let recurso = montajes.get(id);
    if (recurso && recurso.calidad !== AJUSTES.calidad) {
      scene.remove(recurso.g); recurso.g.traverse(o => { if (o.isPoints) o.geometry.dispose(); if (o instanceof Halo) Halo.activos.delete(o); });
      recurso = null;
    }
    if (!recurso) {
      const g = new THREE.Group(); g.name = 'Montaje_' + id; scene.add(g);
      recurso = { g, hilo: new HiloLuz(g), calidad: AJUSTES.calidad }; montajes.set(id, recurso);
    }
    const { g, hilo } = recurso, ajustes = Render.ajustes, cor = Estr.corazon, luz = Estr.corazonLuz;
    const inicial = { fov: camera.fov, posicion: camera.position.clone(), giro: camera.quaternion.clone(), lamp: C.lamp,
      ajustes: Object.assign({}, ajustes), corPos: cor.position.clone(), corEsc: cor.scale.clone(), corGiro: cor.quaternion.clone(),
      corGeo: cor.geometry, corColor: cor.material.color.clone(), corVisible: cor.visible, brillo: Estr.brillo,
      luzEsc: luz.scale.clone(), luzAlfa: luz.opacidad, luzColor: luz.color.clone(), pose: C.pose,
      entorno: ENTORNO.e, interior: ENTORNO.interior, hVisible: Hikari.root.visible, lVisible: Lumi.grupo.visible };
    const restauradores = [], contadores = {}, foco = C.util.desenfoquePlano(0), audio = C.util.audioPlano();
    const animarHikari = Hikari.animar, animarTaso = Tasogare.actualizar;
    restauradores.push(C.util.sustituir(Hikari, 'animar', () => {}), C.util.sustituir(Tasogare, 'actualizar', () => {}));
    const animarObra = Estr.actualizar, corGiro = cor.quaternion.clone(), corEsc = cor.scale.clone(), luzEsc = luz.scale.clone();
    restauradores.push(C.util.sustituir(Estr, 'actualizar', function () {
      corGiro.copy(cor.quaternion); corEsc.copy(cor.scale); luzEsc.copy(luz.scale);
      const alfa = luz.opacidad, brillo = Estr.brillo;
      animarObra.apply(Estr, arguments); cor.quaternion.copy(corGiro); cor.scale.copy(corEsc); luz.scale.copy(luzEsc);
      luz.opacidad = alfa; Estr.brillo = brillo;
    }));
    const fundido = UI.fundido;
    // Cin sigue indicando entradas y repeticiones. La opacidad de salida la escribe el reloj del plano.
    restauradores.push(C.util.sustituir(UI, 'fundido', alfa => { if (alfa === 0 && C.activa) fundido(0, 0); }));
    fundido(0, 0);
    const musica = MusicaInicio.actualizar;
    restauradores.push(C.util.sustituir(MusicaInicio, 'actualizar', (dt, e) => {
      const silencio = id === 'perdidaTsuru' ? plano >= 1 : id === 'muerteTasogare' ? true : plano === 0 && tiempo < 7;
      musica(dt, { ...e, silencio: e.silencio || silencio });
    }));
    let cerrado = false, plano = -1, tiempo = 0, texto = null;
    const datos = { contacto: false, errorContacto: null, emitidas: {}, estilo: null };
    g.visible = true; hilo.limpiar(); UI.hud(false);
    const M = { g, hilo, datos, inicial,
      sustituir(obj, clave, v) { const f = C.util.sustituir(obj, clave, v); restauradores.push(f); return f; },
      lente(fov) { camera.fov = fov; camera.updateProjectionMatrix(); },
      fundir(t, desde, hasta) { fundido(smooth(desde, hasta, t), 0); },
      sonar(nombre, opciones) { audio.tocar(nombre, opciones); },
      posarHikari(estado, dt) { animarHikari(dt, Object.assign({}, IDLE, estado)); },
      posarTasogare(a, b, k) { Tasogare.mezclar(a, b, k); animarTaso(0); },
      alEntrar(k, sonidos) {
        plano = k; tiempo = 0; texto = null; datos.contacto = false; datos.errorContacto = null; datos.emitidas = {};
        datos.planoId = (id === 'perdidaTsuru' ? 'TS' : id === 'muerteTasogare' ? 'TA' : 'LI') + '-P' + (k + 1);
        for (const clave of Object.keys(contadores)) delete contadores[clave];
        hilo.limpiar(); C.util.congelar(0); audio.entrar(sonidos); Hikari.reiniciarAnimacion();
        Bus.emit('narrativa:plano', { escena: id, plano: k });
      },
      texto(idLinea, desde, t) {
        const l = GUION.inicio.lineas[idLinea], nuevo = t >= desde && l ? l.nombre + ' · ' + l.texto : null;
        if (nuevo !== texto) { texto = nuevo; UI.subtitulo(nuevo); }
      },
      paso(t, dt) { tiempo = t; hilo.tiempo = t; },
      efectos(t, dt) { hilo.actualizar(t, dt); audio.actualizar(t, dt); },
      motas(clave, centro, t, desde, hasta, n, op) {
        op = op || {}; const objetivo = t < desde ? 0 : hasta > desde ? Math.min(n, Math.floor((t - desde) / (hasta - desde) * n + 1e-8)) : n;
        let i = contadores[clave] || 0;
        for (; i < objetivo; i++) {
          const nace = desde + (hasta - desde) * (i + 1) / n, r = j => C.util.azarPlano(semilla + plano * 101 + clave.length * 17, i * 11 + j);
          const vida = lerp(op.vidaMin || .8, op.vidaMax || 1.3, r(0));
          if (t - nace >= vida) continue;
          hilo.tiempo = nace;
          const a = r(1) * TAU, vel = lerp(op.velMin || .3, op.velMax || .7, r(2));
          const emitir = op.polvo ? hilo.polvo.bind(hilo) : hilo.emitir.bind(hilo);
          emitir(centro.x + (r(3) - .5) * (op.ancho || .6), centro.y + r(4) * (op.alto || 1.4), centro.z + (r(5) - .5) * (op.ancho || .6),
            Math.cos(a) * vel * .4, vel * .916515, Math.sin(a) * vel * .4, vida, op.tam || .08, op.color || 0xffe0a8, op.alfa || .8);
        }
        contadores[clave] = objetivo; datos.emitidas[clave] = objetivo; hilo.tiempo = t;
      },
      cerrar() {
        if (cerrado) return false; cerrado = true; audio.cerrar(); hilo.limpiar(); g.visible = false; C.util.congelar(0);
        restauradores.reverse().forEach(f => f()); foco.restaurar();
        Object.assign(ajustes, inicial.ajustes); C.lamp = inicial.lamp; C.pose = inicial.pose;
        camera.fov = inicial.fov; camera.position.copy(inicial.posicion); camera.quaternion.copy(inicial.giro); camera.updateProjectionMatrix();
        cor.position.copy(inicial.corPos); cor.scale.copy(inicial.corEsc); cor.quaternion.copy(inicial.corGiro); cor.geometry = inicial.corGeo;
        cor.material.color.copy(inicial.corColor); cor.visible = inicial.corVisible; Estr.brillo = inicial.brillo;
        luz.scale.copy(inicial.luzEsc); luz.opacidad = inicial.luzAlfa; luz.color.copy(inicial.luzColor);
        aplicarEntorno(inicial.entorno, inicial.interior); Hikari.mostrar(inicial.hVisible); Lumi.grupo.visible = inicial.lVisible; UI.hud(true);
        fundido(0, 400); return true;
      },
      estado() { return { id, plano, tiempo, cerrado, ...datos, emitidas: { ...datos.emitidas }, hilo: hilo.estado() }; }
    };
    recurso.estado = M.estado; C.util.estadoMontaje = () => M.estado(); return M;
  };
  /* Pose rígida de un doble. El tiempo aleatorio de Gente nunca dirige estas acciones. */
  C.util.posarDoble = (n, posicion, yaw, gesto, paso) => {
    const g = n.g; g.position.copy(posicion); g.rotation.set(0, yaw, 0);
    const rotar = (nombre, x, y, z) => { const b = g.getObjectByName(nombre); if (b) b.rotation.set(x || 0, y || 0, z || 0); };
    rotar('cadera'); rotar('columna'); rotar('pecho'); rotar('cabeza', .08);
    rotar('brazoI', -.08, 0, -.12); rotar('antebrazoI', -.2); rotar('brazoD', -.08, 0, .12); rotar('antebrazoD', -.2);
    if (gesto === 'proteger') { rotar('brazoI', -2.1, 0, -.15); rotar('antebrazoI', -.25); rotar('brazoD', -1.2, 0, .15); }
    if (gesto === 'vacio' || gesto === 'aro') { rotar('brazoD', -1.3, 0, .08); rotar('antebrazoD', -.08); }
    if (gesto === 'resistir') { rotar('brazoI', -1.1, 0, -.1); rotar('brazoD', -1.1, 0, .1); rotar('columna', .18); }
    const marcha = paso === undefined ? 0 : Math.sin(paso) * .24;
    rotar('musloI', marcha); rotar('musloD', -marcha); rotar('piernaI', Math.max(0, -marcha) * 1.4); rotar('piernaD', Math.max(0, marcha) * 1.4);
    g.updateMatrixWorld(true);
  };
  /* Sin clones de materiales ni variantes de shader: el desvanecido ordinario de three r128 conserva volumen y apoyo. */
  C.util.desvanecer = (raices, excluir) => {
    const materiales = new Map(), halos = [];
    for (const raiz of raices) raiz.traverse(o => {
      if (excluir && excluir.getObjectById(o.id)) return;
      if (o instanceof Halo) halos.push({ o, alfa: o.opacidad });
      if (o.isMesh) for (const m of [].concat(o.material)) {
      if (!materiales.has(m)) materiales.set(m, { opacity: m.opacity, transparent: m.transparent, depthWrite: m.depthWrite });
    } });
    return {
      poner(k) { materiales.forEach((v, m) => { m.transparent = k < 1 || v.transparent; m.opacity = v.opacity * k; m.depthWrite = k >= 1 && v.depthWrite; });
        halos.forEach(v => v.o.opacidad = v.alfa * k); },
      restaurar() { materiales.forEach((v, m) => Object.assign(m, v)); halos.forEach(v => v.o.opacidad = v.alfa); }
    };
  };
  /* Dirigir el modelo del estilo equipado, sin equipar ni llamar al contrato de daño. El trayecto termina en mundo. */
  C.util.gestoEquipado = (M, origen, objetivo) => {
    const id = Sis.ST.eq.arma, ficha = ITEMS[id] || {}, estilo = ficha.estilo || 'cuerpo';
    const distancia = estilo === 'arco' || estilo === 'luz', mano = Hikari.root.getObjectByName('manoD');
    const modelo = estilo === 'arco' ? ArcoLuz.modelo() : estilo === 'luz' ? EscuelaLuz.modelo() : Armas.modelo(id);
    const ocultos = mano.children.filter(o => !o.isBone).map(o => ({ o, visible: o.visible }));
    M.g.add(modelo); modelo.visible = false; M.datos.estilo = estilo;
    const p = new THREE.Vector3(), punta = new THREE.Vector3(), dir = new THREE.Vector3(), eje = new THREE.Vector3(0, 1, 0);
    const arranque = origen.clone(), llegada = origen.clone(), yaw = Math.atan2(objetivo.x - origen.x, objetivo.z - origen.z);
    // Calibrar el apoyo en la pose de contacto; la punta física queda en la silueta, sin alargar el arma.
    const pose = () => {
      M.posarHikari({ tender: 1 }, 0);
      Hikari.root.getObjectByName('brazoD').rotation.set(-1.95, 0, .08);
      Hikari.root.getObjectByName('antebrazoD').rotation.set(-.25, 0, 0); Hikari.root.updateMatrixWorld(true);
      mano.getWorldPosition(p);
    };
    Hikari.mover(origen.x, origen.y, origen.z, yaw); pose();
    const largo = Armas.ficha(id).hoja[1], dy = objetivo.y - p.y;
    if (!distancia) {
      const horizontal = Math.sqrt(Math.max(.01, largo * largo - dy * dy));
      llegada.x += objetivo.x - p.x - Math.sin(yaw) * horizontal;
      llegada.z += objetivo.z - p.z - Math.cos(yaw) * horizontal;
    }
    return {
      actualizar(t, dt) {
        const acerca = smooth(.7, 1.12, t), q = smooth(.7, 1.2, t);
        Hikari.mover(lerp(arranque.x, llegada.x, acerca), origen.y, lerp(arranque.z, llegada.z, acerca), yaw); pose();
        ocultos.forEach(v => v.o.visible = false); modelo.visible = t >= .15 && t <= 1.65;
        modelo.position.copy(p);
        if (distancia) {
          modelo.rotation.set(0, yaw, 0);
          if (t >= .7 && t <= 1.32) {
            punta.lerpVectors(p, objetivo, q);
            const cola = estilo === 'arco' ? M.hilo.v.lerpVectors(p, objetivo, Math.max(0, q - .14)) : p;
            M.hilo.segmento(M.hilo.rastro[0], cola, punta, estilo === 'arco' ? .055 : .12, .7);
            M.hilo.flash.position.copy(punta); M.hilo.flash.scale.setScalar(.12); M.hilo.flash.opacidad = .8;
          }
        } else {
          dir.subVectors(objetivo, p).normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), lerp(-1.0, 0, q));
          modelo.quaternion.setFromUnitVectors(eje, dir); punta.copy(p).addScaledVector(dir, largo);
          if (t >= .7 && t < 1.25) M.hilo.estela(p, punta);
        }
        if (t >= 1.2 && t <= 1.32) M.datos.errorContacto = punta.distanceTo(objetivo);
      },
      cerrar() { ocultos.forEach(v => v.o.visible = v.visible); if (modelo.parent) modelo.parent.remove(modelo); modelo.traverse(o => { if (o.isMesh) o.geometry.dispose(); }); }
    };
  };
  /* Estado visual de consulta. Las funciones públicas no ofrecen escenas sin su marca de cierre. */
  C.util.guardarObjeto = objeto => {
    const nodos = []; objeto.traverse(o => nodos.push({ o, p: o.position.clone(), q: o.quaternion.clone(), s: o.scale.clone(), v: o.visible,
      alfa: o instanceof Halo ? o.opacidad : null }));
    return () => nodos.forEach(v => { v.o.position.copy(v.p); v.o.quaternion.copy(v.q); v.o.scale.copy(v.s); v.o.visible = v.v;
      if (v.alfa !== null) v.o.opacidad = v.alfa; });
  };
  C.util.liberarDoble = n => {
    const materiales = new Set(), farol = n.farol;
    n.g.traverse(o => {
      if (o instanceof Halo) Halo.activos.delete(o);
      if (o.isMesh) { o.geometry.dispose(); if (!farol || !farol.getObjectById(o.id)) [].concat(o.material).forEach(m => materiales.add(m)); }
      if (o.isSprite) { if (o.material.map) o.material.map.dispose(); materiales.add(o.material); }
    });
    materiales.forEach(m => m.dispose()); if (n.g.parent) n.g.parent.remove(n.g);
  };
  /* Reloj seguro y cola persistente. No protege del combate: solo cuenta tiempo con control y sin peligro.
     Se instala una vez y siempre consulta Sis.ST, también tras nueva partida o cargar. */
  let resguardoInstalado = false;
  C.util.instalarResguardo = () => {
    if (resguardoInstalado) return; resguardoInstalado = true;
    const estado = () => Sis.ST.avisos || (Sis.ST.avisos = { restante: 0, pendientes: [], mostrados: [] });
    const retenido = () => (Sis.ST.avisos && Sis.ST.avisos.restante > 0) ||
      C.activa && ['perdidaTsuru', 'muerteTasogare', 'liberacion'].includes(C.tipo);
    let rotulo = null;
    const ocultarRotulo = () => { if (rotulo === null) rotulo = $('banner').style.visibility; $('banner').style.visibility = 'hidden'; };
    const devolverRotulo = () => { if (rotulo !== null) { $('banner').style.visibility = rotulo; rotulo = null; } };
    const cine = UI.cine, ocupada = UI.ocupada;
    UI.cine = v => { cine(v); if (retenido()) ocultarRotulo(); };
    UI.ocupada = () => retenido() ? !!UI.dlg || UI.pausado || C.activa || +$('fundido').style.opacity > .05 : ocupada();
    const originales = {};
    for (const metodo of ['banner', 'item', 'aviso', 'nivel', 'diarioNuevo']) {
      originales[metodo] = UI[metodo];
      UI[metodo] = function () {
        const args = Array.from(arguments);
        if (!retenido() || metodo === 'aviso' && ['error', 'peligro'].includes(args[1])) return originales[metodo].apply(UI, args);
        ocultarRotulo();
        const e = estado(), id = metodo + ':' + JSON.stringify(args);
        if (!e.pendientes.some(v => v.id === id)) e.pendientes.push({ id, metodo, args });
      };
    }
    let flashMotas = null;
    const restaurarMotas = () => {
      if (!flashMotas) return;
      $('motasMas').style.visibility = flashMotas.visibilidad;
      const ico = $('motas').querySelector('.ico'); if (ico) ico.style.animation = flashMotas.animacion;
      flashMotas = null;
    };
    Bus.on('motas', d => {
      if (!retenido() || d.n <= 0) { restaurarMotas(); return; }
      const ico = $('motas').querySelector('.ico');
      if (!flashMotas) flashMotas = { visibilidad: $('motasMas').style.visibility, animacion: ico ? ico.style.animation : '' };
      $('motasMas').style.visibility = 'hidden'; if (ico) ico.style.animation = 'none';
      const e = estado(); let aviso = e.pendientes.find(v => v.id === 'motas:silencio');
      if (!aviso) { aviso = { id: 'motas:silencio', metodo: 'aviso', args: ['', 'conteo'], cantidad: 0 }; e.pendientes.push(aviso); }
      aviso.cantidad += d.n; aviso.args[0] = '+' + aviso.cantidad + ' motas';
    });
    const sfx = Sonido.sfx;
    Sonido.sfx = function (nombre) { if (retenido() && ['recoger', 'nivel', 'mision', 'fragmento'].includes(nombre)) return;
      return sfx.apply(Sonido, arguments); };
    const actualizar = Sis.actualizar; let salida = 0, guardado = 0;
    Sis.actualizar = function (dt, jugador) {
      const resultado = actualizar.apply(Sis, arguments), e = Sis.ST.avisos;
      if (!e) { restaurarMotas(); devolverRotulo(); return resultado; }
      if (retenido()) ocultarRotulo(); else devolverRotulo();
      const peligro = !jugador || !jugador.vivo || jugador.combate > 0 ||
        Sombras.lista.some(s => s.estado !== 'romper' && Math.hypot(s.x - jugador.x, s.z - jugador.z) <= 30) || Sombras.esquirlas.length > 0 ||
        Cazadores.lista.some(s => ['alerta', 'ataque', 'aviso', 'disparo', 'picado'].includes(s.estado));
      const libre = !C.activa && !UI.dlg && !UI.pausado && G.estado === 'juego' && $('creditos').classList.contains('oculto');
      if (!libre || peligro) { salida = 0; return resultado; }
      const anterior = e.restante; e.restante = Math.max(0, e.restante - dt); salida += dt; guardado += dt;
      if (e.restante === 0) restaurarMotas();
      if (anterior > 0 && e.restante === 0) Sis.guardar();
      if (guardado >= 1 && e.restante > 0) { guardado = 0; Sis.guardar(); }
      if (e.restante === 0 && salida >= .8 && e.pendientes.length) {
        const aviso = e.pendientes.shift(); originales[aviso.metodo].apply(UI, aviso.args); e.mostrados.push(aviso.id);
        salida = 0; Sis.guardar();
      }
      return resultado;
    };
    C.util.silencioPerdida = () => { const e = estado(); e.restante = Math.max(20, e.restante); salida = 0; ocultarRotulo(); };
  };
  return C;
})();
