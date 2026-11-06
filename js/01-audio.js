/* === Ecos de Luz · 01-audio.js ===
   Mezcla WebAudio: música original e interactiva en 54-musica-inicio.js y foley en 46-paisaje-sonoro.js,
   viento, magia, motivos de los ecos y voces suaves sintetizados. Reverberación por canal para
   respetar los ajustes de volumen. Números en AUDIO y PAISAJE_AUDIO. */
"use strict";
/* Ganancia de salida, volúmenes de canal y alcance posicional. La mezcla se comprueba con herramientas/audio.mjs;
   las grabaciones de revisión permiten valorar la composición y el balance además de sus niveles. */
const AUDIO = { salida: 1.6, limite: -3, musica: .9, ambiente: .65, locucion: .65, sala: .38, coro: .035, motivo: .065, posicional: { ref: 5, max: 90, caida: 1.1 }, voz: .028 };

const Sonido = (() => {
  let ctx, master, gM, gE, gA, gV, rev, revM, revA, ruido, listo = false, tVoz = 0, pausado = false;
  let viento, vientoG, vientoF, aguaG;
  let salaG, coroG = null, coroK = 0, tGota = 0, salida = null, padF = 520;
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function iniciar() {
    if (listo) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = AUDIO.salida;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 2.5; comp.knee.value = 18; comp.attack.value = .008; comp.release.value = .25;
    const lim = ctx.createDynamicsCompressor(); lim.threshold.value = AUDIO.limite; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = .001; lim.release.value = .12;
    master.connect(comp); comp.connect(lim); lim.connect(ctx.destination);
    gM = ctx.createGain(); gE = ctx.createGain(); gA = ctx.createGain(); gV = ctx.createGain();
    gM.connect(master); gE.connect(master); gA.connect(master); gV.connect(master);
    const L = ctx.sampleRate * 2.6, ir = ctx.createBuffer(2, L, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 2.6); }
    const sala = destino => { const r = ctx.createConvolver(), g = ctx.createGain(); r.buffer = ir; g.gain.value = .32; r.connect(g); g.connect(destino); return r; };
    rev = sala(gE); revM = sala(gM); revA = sala(gA);
    salaG = ctx.createGain(); salaG.gain.value = 0; salaG.connect(rev); // envío antes del volumen de efectos, sin realimentación
    ruido = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // viento continuo
    viento = ctx.createBufferSource(); viento.buffer = ruido; viento.loop = true;
    vientoF = ctx.createBiquadFilter(); vientoF.type = 'bandpass'; vientoF.frequency.value = 500; vientoF.Q.value = .6;
    vientoG = ctx.createGain(); vientoG.gain.value = 0;
    viento.connect(vientoF); vientoF.connect(vientoG); vientoG.connect(gA); viento.start();
    const ag = ctx.createBufferSource(); ag.buffer = ruido; ag.loop = true;
    const af = ctx.createBiquadFilter(); af.type = 'lowpass'; af.frequency.value = 700;
    aguaG = ctx.createGain(); aguaG.gain.value = 0; ag.connect(af); af.connect(aguaG); aguaG.connect(gA); ag.start();
    listo = true; volumen(); PaisajeSonoro.iniciar(ctx, { musica: gM, efectos: gE, ambiente: gA, sala: salaG });
    MusicaInicio.iniciar(ctx, gM);   // gV queda para una locución futura (el juego va solo con subtítulos)
  }
  function volumen() {
    if (!listo) return;
    const t = ctx.currentTime;
    for (const [n, v] of [[master, AUDIO.salida * (AJUSTES.maestro !== undefined ? AJUSTES.maestro : 1)], [gM, AJUSTES.musica * AUDIO.musica], [gE, AJUSTES.efectos], [gA, (AJUSTES.ambiente !== undefined ? AJUSTES.ambiente : .8) * AUDIO.ambiente], [gV, (AJUSTES.voz === undefined ? .8 : AJUSTES.voz) * AUDIO.locucion]]) n.gain.setTargetAtTime(v, t, .04);
  }
  function env(g, t, a, d, v) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }
  function tono(f, t, o) {
    o = o || {}; const os = ctx.createOscillator(), g = ctx.createGain();
    os.type = o.tipo || 'sine'; os.frequency.setValueAtTime(f, t); if (o.f2) os.frequency.exponentialRampToValueAtTime(o.f2, t + (o.a || .005) + (o.d || .3));
    const destino = o.dest || salida || gE;
    env(g, t, o.a || .005, o.d || .3, o.v || .2); os.connect(g); g.connect(destino);
    if (o.rev) { const r = ctx.createGain(); r.gain.value = o.rev; g.connect(r); r.connect(destino === gM ? revM : destino === gA ? revA : rev); }
    if (destino !== gM && destino !== gA) g.connect(salaG);
    os.start(t); os.stop(t + (o.a || .005) + (o.d || .3) + .05);
  }
  function soplo(t, o) {
    const s = ctx.createBufferSource(); s.buffer = ruido; s.loop = true; const f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = o.tipo || 'bandpass'; f.frequency.setValueAtTime(o.fr || 1000, t); if (o.fr2) f.frequency.exponentialRampToValueAtTime(o.fr2, t + (o.a || .005) + (o.d || .2)); f.Q.value = o.q || 1;
    const destino = o.dest || salida || gE;
    env(g, t, o.a || .005, o.d || .2, o.v || .2); s.connect(f); f.connect(g); g.connect(destino); if (destino !== gM && destino !== gA) g.connect(salaG); s.start(t, Math.random()); s.stop(t + (o.a || .005) + (o.d || .2) + .05);
  }
  /* --- instrumentos --- */
  function koto(f, t, v) {
    tono(f, t, { tipo: 'triangle', a: .004, d: 2.2, v: v, dest: gM, rev: .7 });
    tono(f * 2.003, t, { tipo: 'sine', a: .004, d: .9, v: v * .35, dest: gM });
    soplo(t, { fr: f * 3, q: 2, a: .002, d: .06, v: v * .5, dest: gM });
  }
  function pad(fs, t, dur, v) {
    for (const f of fs) for (const det of [-6, 6]) {
      const o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; fl.type = 'lowpass'; fl.frequency.value = padF;
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + dur * .4); g.gain.linearRampToValueAtTime(.0001, t + dur);
      o.connect(fl); fl.connect(g); g.connect(gM); const r = ctx.createGain(); r.gain.value = .5; g.connect(r); r.connect(revM);
      o.start(t); o.stop(t + dur + .1);
    }
  }
  /* coro de los ecos: vocales suaves con vibrato (se crea la primera vez que hace falta) */
  function crearCoro() {
    coroG = ctx.createGain(); coroG.gain.value = 0; const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = 850; fl.Q.value = 2.5; fl.connect(coroG); coroG.connect(gM);
    const r = ctx.createGain(); r.gain.value = 1; coroG.connect(r); r.connect(revM);
    for (const n of [62, 66, 69, 74]) { const o = ctx.createOscillator(), l = ctx.createOscillator(), lg = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = hz(n); l.frequency.value = 4.6 + Math.random(); lg.gain.value = hz(n) * .008; l.connect(lg); lg.connect(o.frequency); o.connect(fl); o.start(); l.start(); }
  }
  function coro(k) { if (!listo) return; if (!coroG && k > .01) crearCoro(); coroK = k; }
  /* sonido posicional: un panoramizador por efecto, atenuado con la distancia */
  const _p = new THREE.Vector3(), _f = new THREE.Vector3();
  function panner(p) {
    const P = AUDIO.posicional, n = ctx.createPanner(); n.panningModel = 'equalpower'; n.distanceModel = 'inverse'; n.refDistance = P.ref; n.maxDistance = P.max; n.rolloffFactor = P.caida;
    if (n.positionX) { n.positionX.value = p.x; n.positionY.value = p.y; n.positionZ.value = p.z; } else n.setPosition(p.x, p.y, p.z);
    n.connect(gE); return n;
  }
  function oyente(cam) {
    if (!listo) return; const L = ctx.listener; cam.getWorldPosition(_p); cam.getWorldDirection(_f);
    if (L.positionX) { L.positionX.value = _p.x; L.positionY.value = _p.y; L.positionZ.value = _p.z; L.forwardX.value = _f.x; L.forwardY.value = _f.y; L.forwardZ.value = _f.z; L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0; }
    else { L.setPosition(_p.x, _p.y, _p.z); L.setOrientation(_f.x, _f.y, _f.z, 0, 1, 0); }
  }
  /* voz silabeada de un habitante (p: base en semitonos, timbre y formante) */
  function voz(p) {
    if (!listo) return; p = p || { base: 62, formante: 1100 }; const t = ctx.currentTime;
    if (t < tVoz) return; tVoz = t + .09;
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(hz(p.base + rnd(-1.5, 1.5)), t); o.frequency.linearRampToValueAtTime(hz(p.base + rnd(-1, 1)), t + .09);
    f.type = 'lowpass'; f.frequency.value = p.formante || 1100; f.Q.value = .7; env(g, t, .015, .09, AUDIO.voz); o.connect(f); f.connect(g); g.connect(gE); o.start(t); o.stop(t + .12);
  }

  /* --- bucle musical y ambiente: llamar cada fotograma --- */
  function actualizar(dt, bioma, interior, noche, vel, altura, agua, ctrl) {
    if (!listo) return; const t = ctx.currentTime;
    const estado = { bioma, interior, noche, vel, altura, agua, ...ctrl };
    PaisajeSonoro.actualizar(dt, estado); MusicaInicio.actualizar(dt, estado);
    // El piloto deja respirar al entorno; la portada y la apertura recuperan el generador anterior.
    padF = 380 + 700 * (ctrl && ctrl.luz || 0);
    salaG.gain.value = damp(salaG.gain.value, interior * AUDIO.sala, 2, dt);
    if (coroG) coroG.gain.value = damp(coroG.gain.value, coroK * AUDIO.coro, 1.5, dt);
    // viento y agua
    vientoG.gain.value = damp(vientoG.gain.value, (.008 + .035 * smooth(8, 70, altura) + .05 * smooth(6, 16, vel)) * (1 - interior * .85) * (bioma === 2 ? 1.6 : 1), 1.5, dt);
    vientoF.frequency.value = 350 + 700 * smooth(0, 90, altura) + (bioma === 3 ? 400 : 0);
    aguaG.gain.value = damp(aguaG.gain.value, agua * .015 * (.55 + .45 * Math.sin(t * .4)), 2, dt); // apoyo grave bajo la grabación de la orilla
    // Aves y grillos usan grabaciones; en las cuevas quedan gotas espaciadas.
    if (interior > .5 && t > tGota) { tGota = t + .7 + Math.random() * 2.6; const f = hz(rndi(86, 98)); tono(f, t, { a: .001, d: .12, v: .05, f2: f * .7, rev: 1.4, dest: gA }); }
  }
  /* --- efectos --- */
  function sfx(n, o) {
    if (!listo) return; const t = ctx.currentTime; o = o || {};
    if (o.pos) { const L = ctx.listener, lx = L.positionX ? L.positionX.value : 0, lz = L.positionZ ? L.positionZ.value : 0; if (Math.hypot(o.pos.x - lx, o.pos.z - lz) > AUDIO.posicional.max) return; }
    if (PaisajeSonoro.efecto(n, o)) return;
    if (o.pos) salida = panner(o.pos);
    switch (n) {
      case 'corte': { const p = o.peso || 1; soplo(t, { fr: 3600 / p, fr2: 700 / p, q: .8, a: .005, d: .12 + p * .05, v: .2 + (o.fuerza || 0) * .1 }); tono(200 / p, t, { f2: 90 / p, d: .1, v: .1, tipo: 'triangle' }); break; }
      case 'golpe': { const p = o.peso || 1; tono(180 - p * 25, t, { f2: 55 - p * 8, d: .18 + p * .06, v: .3 + p * .05, tipo: 'sine' }); soplo(t, { fr: 1100 - p * 200, q: .6, a: .002, d: .08 + p * .03, v: .22 + p * .04 }); break; }
      case 'guardia': soplo(t, { fr: 900, fr2: 1600, q: 1, a: .01, d: .12, v: .05 }); break;
      case 'bloqueo': tono(620, t, { f2: 380, d: .16, v: .14, tipo: 'triangle' }); tono(1240, t, { d: .25, v: .05, rev: .4 }); soplo(t, { fr: 2400, q: 1.5, a: .002, d: .08, v: .16, tipo: 'highpass' }); break;
      case 'parada': [0, 7, 12].forEach((k, i) => tono(hz(84 + k), t + i * .03, { a: .002, d: .6, v: .1, rev: 1 })); tono(1500, t, { f2: 900, d: .12, v: .1, tipo: 'triangle' }); soplo(t, { fr: 3000, q: 2, a: .002, d: .1, v: .14, tipo: 'highpass' }); break;
      case 'rota': tono(400, t, { f2: 120, d: .4, v: .16, tipo: 'sawtooth' }); soplo(t, { fr: 1800, fr2: 300, q: .7, a: .003, d: .3, v: .18 }); break;
      case 'derribo': soplo(t, { fr: 260, q: .5, a: .004, d: .3, v: .3, tipo: 'lowpass' }); tono(90, t, { f2: 45, d: .3, v: .2 }); break;
      case 'recoger': [0, 4, 7, 12].forEach((k, i) => tono(hz(79 + k), t + i * .06, { a: .003, d: .35, v: .09, rev: .6 })); break;
      case 'chispa': tono(hz(88), t, { a: .003, d: .3, v: .07, rev: .8 }); tono(hz(95), t + .07, { a: .003, d: .35, v: .06, rev: .8 }); break;
      case 'nivel': [0, 4, 7, 12, 16, 19, 24].forEach((k, i) => tono(hz(67 + k), t + i * .1, { tipo: 'triangle', a: .005, d: .9, v: .12, rev: .8 })); break;
      case 'mision': [0, 7, 12].forEach((k, i) => tono(hz(72 + k), t + i * .14, { a: .01, d: 1.2, v: .1, rev: 1 })); break;
      case 'fragmento': [0, 5, 7, 12, 17, 19, 24, 28].forEach((k, i) => tono(hz(60 + k), t + i * .16, { tipo: 'triangle', a: .01, d: 2, v: .13, rev: 1.2 })); pad([hz(48), hz(55), hz(60), hz(67)], t, 6, .08); break;
      case 'paso': { const nieve = o.sup === 'nieve', arena = o.sup === 'arena'; soplo(t, { fr: nieve ? 1800 : arena ? 1200 : 700, q: .7, a: .003, d: nieve ? .12 : .07, v: (nieve ? .06 : .045) * (o.vol || 1), tipo: arena ? 'highpass' : 'bandpass' }); break; }
      case 'salto': tono(260, t, { f2: 520, d: .14, v: .08, tipo: 'sine' }); break;
      case 'doble': tono(420, t, { f2: 900, d: .18, v: .1, rev: .4 }); break;
      case 'aterrizar': soplo(t, { fr: 300, q: .6, a: .003, d: .15, v: .18 * (o.vol || 1), tipo: 'lowpass' }); break;
      case 'planeo': soplo(t, { fr: 1100, fr2: 1800, q: 1, a: .15, d: .5, v: .05 }); break;
      case 'chapuzon': soplo(t, { fr: 600, fr2: 2200, q: .7, a: .01, d: .45, v: .22 }); tono(140, t, { f2: 60, d: .3, v: .15 }); break;
      case 'esquiva': soplo(t, { fr: 500, fr2: 2400, q: 1.2, a: .01, d: .25, v: .16 }); break;
      case 'gruñido': tono(o.f || 90, t, { tipo: 'sawtooth', a: .04, d: .45, v: .09, f2: (o.f || 90) * .7 }); break;
      case 'alerta': tono(hz(76), t, { a: .005, d: .25, v: .08, f2: hz(70) }); break;
      case 'acecho': soplo(t, { fr: 430, fr2: 900, q: 1.4, a: .14, d: .65, v: .11 }); break;
      // avisos de los ataques de los gólems, uno por familia de gesto: golpe grave, algo que se alza, carga que rueda, barrido de aire y soplo
      case 'avisoGolpe': tono(hz(40), t, { f2: hz(33), tipo: 'sine', a: .02, d: .5, v: .12 }); soplo(t, { fr: 220, fr2: 140, q: 1, a: .04, d: .4, v: .09, tipo: 'lowpass' }); break;
      case 'avisoAlzar': tono(hz(52), t, { f2: hz(76), tipo: 'triangle', a: .06, d: .7, v: .07 }); soplo(t, { fr: 500, fr2: 1500, q: 1.5, a: .12, d: .6, v: .06 }); break;
      case 'avisoCarga': tono(hz(36), t, { f2: hz(48), tipo: 'sawtooth', a: .1, d: .8, v: .06 }); soplo(t, { fr: 120, fr2: 360, q: .8, a: .15, d: .7, v: .1, tipo: 'lowpass' }); break;
      case 'avisoBarrido': soplo(t, { fr: 600, fr2: 2600, q: 2, a: .03, d: .45, v: .12 }); tono(hz(60), t, { f2: hz(80), a: .02, d: .3, v: .04 }); break;
      case 'avisoSoplo': soplo(t, { fr: 1400, fr2: 3200, q: 3, a: .02, d: .5, v: .1 }); tono(hz(72), t, { f2: hz(70), tipo: 'sine', a: .03, d: .35, v: .04 }); break;
      case 'avisoAtaque': soplo(t, { fr: 700, fr2: 2100, q: 2, a: .025, d: .28, v: .1 }); tono(180, t, { f2: 340, a: .035, d: .22, v: .055 }); break;
      case 'herido': tono(220, t, { f2: 110, d: .35, v: .2, tipo: 'sawtooth' }); soplo(t, { fr: 400, q: .5, a: .003, d: .2, v: .2, tipo: 'lowpass' }); break;
      case 'pulso': tono(hz(55), t, { f2: hz(79), a: .01, d: 1.1, v: .22, rev: 1 }); soplo(t, { fr: 400, fr2: 3000, q: .9, a: .05, d: .9, v: .14 }); break;
      case 'calmar': [0, 7, 12, 16].forEach((k, i) => tono(hz(69 + k), t + i * .09, { a: .01, d: 1.2, v: .08, rev: 1 })); break;
      case 'acariciar': tono(hz(84), t, { a: .02, d: .5, v: .06, rev: .8 }); break;
      case 'ui': tono(hz(84), t, { a: .002, d: .08, v: .05 }); break;
      case 'ui2': tono(hz(79), t, { a: .002, d: .1, v: .05 }); tono(hz(86), t + .05, { a: .002, d: .1, v: .04 }); break;
      case 'error': tono(150, t, { f2: 110, d: .2, v: .1, tipo: 'square' }); break;
      case 'farol': tono(hz(72 + (o.k || 0) * 4), t, { tipo: 'triangle', a: .005, d: 1.4, v: .16, rev: 1 }); break;
      case 'cristal': tono(hz(74 + (o.k || 0) * 3), t, { a: .004, d: 1.5, v: .18, rev: 1.2 }); tono(hz(86 + (o.k || 0) * 3), t, { a: .004, d: 1, v: .05, rev: 1 }); break;
      case 'tick': tono(hz(96), t, { a: .001, d: .04, v: .05 }); break;
      case 'cofre': [0, 4, 7, 11, 14].forEach((k, i) => tono(hz(72 + k), t + i * .08, { a: .005, d: .6, v: .09, rev: .7 })); break;
      case 'amanecer': pad([hz(48), hz(55), hz(60), hz(64), hz(67)], t, 14, .1); [0, 4, 7, 12, 16, 19, 24, 28].forEach((k, i) => tono(hz(60 + k), t + i * .5, { tipo: 'triangle', a: .02, d: 3, v: .12, rev: 1.4 })); break;
      case 'trueno': soplo(t, { fr: 200, q: .4, a: .05, d: 1.5, v: .3, tipo: 'lowpass' }); break;
      // Sombras: brotan con un soplo grave, sisean al saltar y se quiebran con un chasquido y una nota de luz
      case 'quiebre': soplo(t, { fr: 5200, fr2: 1400, q: .9, a: .002, d: .5, v: .3 }); [0, 5, 9, 14, 19].forEach((k, i) => tono(hz(91 + k), t + .03 + i * .045, { a: .002, d: .5, v: .05, rev: 1 })); tono(70, t, { f2: 40, tipo: 'sawtooth', a: .01, d: .6, v: .12 }); break;
      case 'latido': [0, .26].forEach((d, i) => tono(52 - i * 4, t + d, { f2: 38, tipo: 'sine', a: .01, d: .3, v: .42 - i * .1 })); break;
      case 'cazadorGrito': soplo(t, { fr: 2400, fr2: 700, q: 2.5, a: .02, d: .9, v: .2 }); tono(110, t, { f2: 55, tipo: 'sawtooth', a: .05, d: 1.1, v: .1 }); tono(hz(81), t + .05, { f2: hz(69), tipo: 'triangle', a: .03, d: .8, v: .05, rev: 1.2 }); break;   // el Cazador te ha visto
      case 'koto': tono(hz(69), t, { tipo: 'triangle', a: .004, d: 2.6, v: .16, rev: 1.6 }); tono(hz(81), t + .01, { tipo: 'sine', a: .004, d: 1.4, v: .05, rev: 1.6 }); break;   // una sola nota de koto
      case 'tormenta': soplo(t, { fr: 260, fr2: 45, q: .5, a: .02, d: 2.8, v: .55, tipo: 'lowpass' }); tono(46, t, { f2: 31, tipo: 'sine', a: .04, d: 2.4, v: .28 }); soplo(t + .05, { fr: 1800, fr2: 300, q: .7, a: .005, d: .35, v: .12, tipo: 'lowpass' }); break;   // la tormenta roja del faro
      case 'disolver': soplo(t, { fr: 900, fr2: 140, q: .6, a: .25, d: 2.2, v: .26, tipo: 'lowpass' }); tono(58, t + .1, { f2: 41, tipo: 'sine', a: .3, d: 2, v: .14 }); tono(hz(74), t + .5, { a: .05, d: 1.6, v: .03, rev: 1.4 }); break;
      case 'sombraBrota': soplo(t, { fr: 160, fr2: 420, q: .7, a: .08, d: .55, v: .22, tipo: 'lowpass' }); tono(70, t, { f2: 52, tipo: 'sawtooth', a: .05, d: .5, v: .06 }); break;
      case 'sombraSalto': soplo(t, { fr: 2800, fr2: 900, q: 2.5, a: .02, d: .3, v: .12 }); break;
      case 'sombraLanza': soplo(t, { fr: 1800, fr2: 4200, q: 3, a: .01, d: .2, v: .1 }); tono(hz(64), t, { f2: hz(76), tipo: 'sawtooth', a: .01, d: .15, v: .04 }); break;
      case 'sombraRompe': soplo(t, { fr: 3200, fr2: 600, q: 1.4, a: .002, d: .22, v: .16 }); tono(hz(86), t + .05, { a: .004, d: .6, v: .05, rev: .9 }); break;
      case 'eco': [0, 7, 12, 19].forEach((k, i) => tono(hz(74 + k), t + i * .12, { a: .02, d: 1.6, v: .05, rev: 1.4 })); break;
    }
    salida = null;
  }
  /* motivo propio de un eco (GUION.ecos[].motivo, o una lista de ellos): notas en semitonos, timbre, paso entre
     notas y duración (s). Suena desde pos, con más volumen cuanto más visible es el eco (k) */
  const TIMBRES = {
    voz(f, t, v, d) { const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), r = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = f; fl.type = 'bandpass'; fl.frequency.value = 780; fl.Q.value = 3; env(g, t, .18, d, v * .9); r.gain.value = 1.1; o.connect(fl); fl.connect(g); g.connect(salida || gE); g.connect(r); r.connect(rev); o.start(t); o.stop(t + d + .3); },
    campana(f, t, v, d) { tono(f, t, { a: .003, d: d, v: v, rev: 1.2 }); tono(f * 2.76, t, { a: .003, d: d * .5, v: v * .3, rev: .8 }); tono(f * 5.4, t, { a: .002, d: d * .2, v: v * .12 }); },
    flauta(f, t, v, d) { tono(f, t, { a: .09, d: d, v: v, rev: 1 }); soplo(t, { fr: f * 2, q: 3, a: .08, d: d * .6, v: v * .25 }); },
    trompa(f, t, v, d) { tono(f, t, { tipo: 'triangle', a: .18, d: d, v: v, rev: 1.1 }); tono(f * 2, t, { a: .25, d: d * .8, v: v * .25 }); },
    punteo(f, t, v, d) { tono(f, t, { tipo: 'triangle', a: .003, d: d, v: v, rev: .8 }); tono(f * 2, t, { a: .003, d: d * .5, v: v * .3 }); },
    agua(f, t, v, d) { tono(f, t, { a: .002, d: d, v: v * .7, f2: f * 1.6, rev: .9 }); soplo(t, { fr: 600, q: .7, a: .01, d: d, v: v * .3, tipo: 'lowpass' }); },
    pasos(f, t, v, d) { soplo(t, { fr: 320, q: .8, a: .002, d: .07, v: v * 1.4, tipo: 'lowpass' }); }
  };
  function motivo(m, pos, k) {
    if (!listo || !m || k < .05) return; const L = ctx.listener, lx = L.positionX ? L.positionX.value : 0, lz = L.positionZ ? L.positionZ.value : 0;
    if (Math.hypot(pos.x - lx, pos.z - lz) > AUDIO.posicional.max) return;
    const t = ctx.currentTime + .03, v = AUDIO.motivo * k;
    // una nota null es un silencio
    for (const q of [].concat(m)) { salida = panner(pos); const T = TIMBRES[q.timbre] || TIMBRES.campana; q.notas.forEach((n, i) => { if (n !== null) T(hz(n), t + i * q.paso, v * (q.vol || 1), q.dur); }); }
    salida = null;
  }

  function pausar(v) { pausado = v; if (!listo) return; const parar = v || document.hidden; PaisajeSonoro.pausar(parar); MusicaInicio.pausar(parar); }
  document.addEventListener('visibilitychange', () => pausar(pausado));
  return { iniciar, volumen, actualizar, sfx, oyente, voz, coro, motivo, pausar, get listo() { return listo; }, get t() { return ctx ? ctx.currentTime : 0; }, koto: (f, t, v) => listo && koto(f, t || ctx.currentTime, v || .15), pad: (a, d, v) => listo && pad(a, ctx.currentTime, d, v) };
})();
