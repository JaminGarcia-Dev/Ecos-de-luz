/* === Ecos de Luz · 29-portada.js ===
   Pantalla de inicio: la cámara recorre el valle al amanecer en planos que se funden, encima flotan motas de luz y
   pétalos (lienzo 2D), el emblema del faro se dibuja, el título aparece letra a letra y el menú muestra la partida
   guardada. Al elegir, el menú se desvanece antes de pasar al juego. El aspecto está en css/estilos.css (#portada). */
"use strict";

/* hora: momento del día (aplicarEntorno: 0 amanecer, 1 día); planos: cámara desde/hasta (relativa al faro y sobre
   su suelo; con 'sitio', [lateral, alto, avance] desde ese sitio en dirección al faro), punto que se mira (relativo
   al faro) y 'lado': cuánto se aparta la mirada a la izquierda
   para que el faro quede a la derecha, junto al menú; dur: s por plano; fundido: s de negro entre planos; suelo:
   altura mínima de la cámara sobre el terreno; motas y pétalos del lienzo; salida: ms del desvanecido al empezar */
const PORTADA = {
  hora: .07, dur: 15, fundido: 1.1, suelo: 3,
  planos: [
    { desde: [38, 3, 44], hasta: [25, 6, 31], mira: [0, 14, 0], lado: 15 },
    { desde: [72, 36, -50], hasta: [54, 27, -70], mira: [0, 16, 0], lado: 28 },
    { sitio: 'petalo', desde: [0, 2.6, 8], hasta: [0, 3, 21], mira: [0, 20, 0], lado: 26 }
  ],
  motas: 70, petalos: 16, salida: 650
};

const Portada = (() => {
  let t = 0, plano = 0, fundiendo = false, activa = false, cv = null, cx = null, motas = [], brillo = null, tUlt = 0;
  const ease = x => x * x * (3 - 2 * x);

  /* ---------- cámara: planos del valle que se funden a negro (solo mientras la portada se ve) ---------- */
  function camara(dt) {
    const T = U.uT.value; U.uT.value += dt; aplicarEntorno(PORTADA.hora, 0);
    const S = sitio('faro'), P = PORTADA;
    t += dt;
    if (activa && !fundiendo && t > P.dur - P.fundido) { fundiendo = true; UI.fundido(1, P.fundido * 1000); }
    if (t >= P.dur) { t = 0; plano = (plano + 1) % P.planos.length; if (fundiendo) { fundiendo = false; UI.fundido(0, P.fundido * 1000); } }
    const p = P.planos[plano], q = ease(t / P.dur), d = [0, 1, 2].map(k => lerp(p.desde[k], p.hasta[k], q));
    let px = d[0], pz = d[2], o = S;
    if (p.sitio) { o = sitio(p.sitio); const l0 = Math.hypot(o.x, o.z) || 1, ax = -o.x / l0, az = -o.z / l0; px = o.x + ax * d[2] - az * d[0]; pz = o.z + az * d[2] + ax * d[0]; }
    const py = Math.max(o.h + d[1], altura(px, pz) + P.suelo);
    const fx = p.mira[0], fy = S.h + p.mira[1], fz = p.mira[2], l = Math.hypot(fx - px, fz - pz) || 1, dx = (fx - px) / l, dz = (fz - pz) / l;
    camera.position.set(px, py + Math.sin(T * .3) * .15, pz); camera.lookAt(fx + dz * p.lado, fy, fz - dx * p.lado);
    Render.ajustes.foco = Math.hypot(fx - px, fy - py, fz - pz);   // enfocado el faro
    seguirLuces((px + fx) / 2, S.h, (pz + fz) / 2);
    Estr.actualizar(dt, U.uT.value, 0, -999, 0, 0); Flora.actualizarParticulas(dt, 0, camera.position.x, camera.position.y, camera.position.z); FX.actualizar(dt);
    Sonido.actualizar(dt, 0, 0, false, 0, 20, 0, { portada: true });
  }

  /* ---------- lienzo: motas de luz que suben y pétalos que caen ---------- */
  function preparar() {
    cv = $('portadaLuz'); cx = cv.getContext('2d');
    brillo = document.createElement('canvas'); brillo.width = brillo.height = 64;
    const b = brillo.getContext('2d'), g = b.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(.25, 'rgba(255,214,140,.55)'); g.addColorStop(1, 'rgba(255,200,120,0)'); b.fillStyle = g; b.fillRect(0, 0, 64, 64);
    for (let i = 0; i < PORTADA.motas + PORTADA.petalos; i++) motas.push(nueva(i >= PORTADA.motas, true));
    // el título, letra a letra (cada una con su retardo y su brillo)
    const h = document.querySelector('#portada .ptitulo'), txt = h.textContent; h.setAttribute('aria-label', txt);
    h.innerHTML = [...txt].map((c, i) => c === ' ' ? '<span class="esp"></span>' : `<span style="--i:${i}">${c}</span>`).join('');
  }
  function nueva(petalo, azar) {
    return { p: petalo, x: Math.random(), y: azar ? Math.random() : (petalo ? -.05 : 1.05), v: petalo ? rnd(.03, .06) : rnd(.012, .035), r: petalo ? rnd(4, 7) : rnd(5, 16), f: Math.random() * TAU, g: Math.random() * TAU, a: petalo ? rnd(.5, .85) : rnd(.25, .8), c: Math.random() < .25 };
  }
  function dibujar(ahora) {
    if (!activa) return; requestAnimationFrame(dibujar);
    const dt = Math.min(.05, (ahora - (tUlt || ahora)) / 1000); tUlt = ahora;
    const dpr = Math.min(2, devicePixelRatio || 1), W = Math.round(cv.clientWidth * dpr), H = Math.round(cv.clientHeight * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    cx.clearRect(0, 0, W, H);
    for (let i = 0; i < motas.length; i++) {
      const m = motas[i]; m.f += dt * 1.3; m.g += dt * 2;
      if (m.p) { m.y += m.v * dt; m.x += Math.sin(m.f) * .0006 + .0004; if (m.y > 1.05) motas[i] = nueva(true); }
      else { m.y -= m.v * dt; m.x += Math.sin(m.f) * .0004; if (m.y < -.05) motas[i] = nueva(false); }
      const x = m.x * W, y = m.y * H, s = m.r * dpr;
      if (m.p) {
        cx.save(); cx.translate(x, y); cx.rotate(m.g); cx.scale(1, .55 + .45 * Math.sin(m.g * .7)); cx.globalAlpha = m.a;
        cx.fillStyle = '#f6b6cb'; cx.beginPath(); cx.ellipse(0, 0, s, s * .6, 0, 0, TAU); cx.fill(); cx.restore();
      } else {
        cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = m.a * (.6 + .4 * Math.sin(m.f * 2.3));
        if (m.c) cx.filter = 'hue-rotate(140deg)'; cx.drawImage(brillo, x - s, y - s, s * 2, s * 2); if (m.c) cx.filter = 'none';
        cx.globalCompositeOperation = 'source-over';
      }
    }
    cx.globalAlpha = 1;
  }

  /* ---------- mostrar, resumen de la partida y salida ---------- */
  function mostrar(v) {
    const el = $('portada'); el.classList.toggle('oculto', !v); el.classList.remove('sale'); Render.ajustes.colorLugar = v ? 0 : 1;
    if (!cv) preparar();
    if (v) {
      const hay = Sis.hayPartida(); $('btnContinuar').style.display = hay ? '' : 'none';
      if (hay) { const S = Sis.ST; $('pInfo').textContent = (S.mis.ep7_amanecer && S.mis.ep7_amanecer.e === 'hecha' ? 'Epílogo completado' : (Campana.capitulo() ? 'Capítulo ' + Campana.capitulo() : 'Prólogo') + ' · ' + Campana.ficha().nom) + ' · nivel ' + S.nivel; }
      if (!activa) { activa = true; tUlt = 0; requestAnimationFrame(dibujar); }
      // la primera vez, la entrada completa; al volver de Controles o Ajustes, solo un fundido corto
      const cl = el.dataset.vista ? 'vuelve' : 'entra'; el.dataset.vista = 1; requestAnimationFrame(() => el.classList.add(cl));
    } else {
      activa = false; el.classList.remove('entra', 'vuelve');
      if (fundiendo) { fundiendo = false; UI.fundido(0, 200); }
    }
  }
  /* el menú y el título se desvanecen y luego se llama a cb (empezar o continuar) */
  function salir(cb) { const el = $('portada'); if (el.classList.contains('sale')) return; el.classList.add('sale'); Sonido.iniciar(); Sonido.sfx('ui2'); setTimeout(cb, PORTADA.salida); }

  return { camara, mostrar, salir };
})();
