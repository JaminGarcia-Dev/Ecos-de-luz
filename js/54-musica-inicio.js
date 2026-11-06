/* Generador anterior a la fase 24, recuperado del ZIP original (solo lectura).
   Conserva escalas, instrumentos, contorno y pausas de las frases. La mezcla y sus
   envolventes son nuevas: un bus propio permite bajar música y cola juntas. */
"use strict";
const MUSICA_INICIO = {
  nivelOriginal: .68, nivelExplorar: .38, nivelKoto: .17, dialogo: .25, pausa: .12,
  entrada: 1.4, salida: 2.2, descanso: [14, 24], frase: [14, 23],
  /* con peligro la música baja a 'peligro' y sale en ~1,2 s (3 × tauPeligro); al leer, en ~0,6 s; nivel del acompañamiento sostenido [calma, peligro] */
  peligro: .32, tauPeligro: .4, tauLectura: .22, pad: [.045, .018],
  combate: {
    umbralEntrada: .4, umbralSalida: .25, umbralJefe: .85,
    nivel: .68, nivelJefe: .85, maxAumentoDb: 3, margenRuido: 2,
    tauEntrada: .3, tauSalida: .45, tauPausa: .04,
    anticipacion: .18, margen: .025, segundosMinuto: 60, subdivision: 2, tempoJefe: 1.12,
    taikos: [1, 0, 0, 0, .65, 0, 0, 0], taikosJefe: [1, 0, 0, .35, .75, 0, .5, 0],
    ostinato: [0, null, 2, null, 0, null, 1, null], ostinatoJefe: [0, 2, 0, 3, 0, 2, 1, 2],
    acentos: [1, .65, .8, .65, .9, .65, .8, .65], transposicionKoto: -12,
    taiko: { agudo: 130, grave: 52, caida: .09, ataque: .006, cola: .24, nivel: .15,
      ruidoFrecuencia: 760, ruidoAtaque: .003, ruidoCola: .035, ruidoNivel: .025, ruidoQ: .5 },
    koto: { ataque: .004, cola: .14, nivel: .085, armonico: 2.003, nivelArmonico: .22,
      colaArmonico: .065, ruidoMultiplo: 3, ruidoAtaque: .002, ruidoCola: .025, ruidoNivel: .12, ruidoQ: 2 }
  },
  escalas: { yo: [0, 2, 5, 7, 9], in: [0, 1, 5, 7, 8] },
  regiones: [
    { raiz: 62, esc: 'yo', ritmo: 1, pad: [0, 7, 12], tempoCombate: 88 },
    { raiz: 64, esc: 'in', ritmo: .9, pad: [0, 7, 12], tempoCombate: 84 },
    { raiz: 57, esc: 'in', ritmo: 1.7, pad: [0, 7, 15], tempoCombate: 92 },
    { raiz: 60, esc: 'yo', ritmo: 1.15, pad: [0, 7, 14], tempoCombate: 86 },
    { raiz: 65, esc: 'yo', ritmo: 1.1, pad: [0, 7, 12], tempoCombate: 80 },
    { raiz: 50, esc: 'in', ritmo: 2.4, pad: [0, 7, 12], tempoCombate: 76 }
  ]
};
const MusicaInicio = (() => {
  const C = MUSICA_INICIO, nodos = new Set();
  let ctx, bus, fondo, ritmo, seco, rev, ruido, tSig = 0, tPad = 0, tShaku = 0, nota = 4;
  let activo = false, original = false, pausado = false, destino = -1, hasta = 0, descansar = 0, frases = 0;
  let combatiendo = false, jefe = false, destinoRitmo = 0, tauRitmo = 0, destinoFondo = 1, tCombate = 0, pasoCombate = 0, pasosCombate = 0;
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function iniciar(contexto, canal) {
    if (ctx) return; ctx = contexto;
    bus = ctx.createGain(); bus.gain.value = 0; bus.connect(canal);
    // Fondo y pulso comparten el bus de diálogo/silencio/pausa. Solo el fondo baja con peligro.
    fondo = ctx.createGain(); fondo.connect(bus);
    ritmo = ctx.createGain(); ritmo.gain.value = 0; ritmo.connect(bus);
    seco = ctx.createGain(); seco.connect(fondo);
    rev = ctx.createConvolver(); const n = Math.floor(ctx.sampleRate * 2.6), ir = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); }
    rev.buffer = ir; const cola = ctx.createGain(); cola.gain.value = .55; rev.connect(cola); cola.connect(fondo);
    ruido = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function seguir(n, t, dur, extras = []) {
    nodos.add(n); n.onended = () => { n.disconnect(); extras.forEach(x => x.disconnect()); nodos.delete(n); };
    n.start(t); n.stop(t + dur + .1);
  }
  function enviar(g, cantidad, canal = seco) { g.connect(canal); if (cantidad) { const r = ctx.createGain(); r.gain.value = cantidad; g.connect(r); r.connect(rev); return r; } return null; }
  function tono(f, t, a, d, v, tipo = 'sine', sala = 0, canal = seco) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = tipo; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d);
    o.connect(g); const r = enviar(g, sala, canal); seguir(o, t, a + d, [g, ...(r ? [r] : [])]);
  }
  function soplo(f, t, a, d, v, q, canal = seco) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = ruido; s.loop = true;
    fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q;
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d);
    s.connect(fl); fl.connect(g); enviar(g, 0, canal); seguir(s, t, a + d, [fl, g]);
  }
  function koto(f, t, v) {
    tono(f, t, .004, 2.2, v, 'triangle', .7);
    tono(f * 2.003, t, .004, .9, v * .35);
    soplo(f * 3, t, .002, .06, v * .5, 2);
  }
  function taiko(t, acento) {
    const T = C.combate.taiko, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(T.agudo, t); o.frequency.exponentialRampToValueAtTime(T.grave, t + T.caida);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(T.nivel * acento, t + T.ataque);
    g.gain.exponentialRampToValueAtTime(.0001, t + T.ataque + T.cola);
    o.connect(g); enviar(g, 0, ritmo); seguir(o, t, T.ataque + T.cola, [g]);
    soplo(T.ruidoFrecuencia, t, T.ruidoAtaque, T.ruidoCola, T.ruidoNivel * acento, T.ruidoQ, ritmo);
  }
  function kotoApagado(f, t, acento) {
    const K = C.combate.koto, v = K.nivel * acento;
    tono(f, t, K.ataque, K.cola, v, 'triangle', 0, ritmo);
    tono(f * K.armonico, t, K.ataque, K.colaArmonico, v * K.nivelArmonico, 'sine', 0, ritmo);
    soplo(f * K.ruidoMultiplo, t, K.ruidoAtaque, K.ruidoCola, v * K.ruidoNivel, K.ruidoQ, ritmo);
  }
  function nivelCombate(v, tau) {
    if (v === destinoRitmo && tau === tauRitmo) return;
    destinoRitmo = v; tauRitmo = tau; ritmo.gain.setTargetAtTime(v, ctx.currentTime, tau);
  }
  function actualizarCombate(E, M, esc, t, detenido) {
    const B = C.combate, antes = combatiendo, valor = E.combate || 0;
    const permitido = activo && !original && !E.escena && !E.dialogo && !E.silencio && !detenido && ctx.state === 'running';
    combatiendo = permitido && valor > (antes ? B.umbralSalida : B.umbralEntrada);
    jefe = combatiendo && valor >= B.umbralJefe;
    // Presupuesto de pico seco: suma conservadora de los dos instrumentos, sin cola de sala.
    // Las envolventes acaban antes de la siguiente corchea, incluso al tempo de jefe.
    const pico = B.taiko.nivel + B.taiko.ruidoNivel * B.margenRuido + B.koto.nivel * (1 + B.koto.nivelArmonico + B.koto.ruidoNivel * B.margenRuido);
    // También reserva margen al venir del nivel más alto de portada/prólogo.
    const techo = C.nivelKoto * Math.pow(10, B.maxAumentoDb / 20) / pico * C.nivelExplorar / Math.max(C.nivelExplorar, bus.gain.value);
    const tau = detenido ? B.tauPausa : E.dialogo ? C.tauLectura : combatiendo ? B.tauEntrada : B.tauSalida;
    nivelCombate(combatiendo ? Math.min(jefe ? B.nivelJefe : B.nivel, techo) : 0, tau);
    if (!combatiendo) { tCombate = 0; return; }
    if (!antes || tCombate < t) { tCombate = t + B.margen; pasoCombate = 0; }
    const paso = B.segundosMinuto / (M.tempoCombate * (jefe ? B.tempoJefe : 1) * B.subdivision);
    const golpes = jefe ? B.taikosJefe : B.taikos, notas = jefe ? B.ostinatoJefe : B.ostinato;
    // Ventana corta sobre el reloj de audio: no se reproducen golpes atrasados ni se usan temporizadores.
    while (tCombate < t + B.anticipacion) {
      const acento = golpes[pasoCombate % golpes.length], grado = notas[pasoCombate % notas.length];
      if (acento) taiko(tCombate, acento);
      if (grado !== null) kotoApagado(hz(M.raiz + B.transposicionKoto + esc[grado % esc.length]), tCombate, B.acentos[pasoCombate % B.acentos.length]);
      pasoCombate++; pasosCombate++; tCombate += paso;
    }
  }
  function shaku(f, t, dur, v) {
    const o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain();
    o.frequency.setValueAtTime(f * .985, t); o.frequency.exponentialRampToValueAtTime(f, t + .25);
    lfo.frequency.value = 5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * .012, t + dur * .7); lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + .5); g.gain.setValueAtTime(v, t + dur - .8); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); const r = enviar(g, .8); seguir(o, t, dur, [g, r]); seguir(lfo, t, dur, [lg]);
    soplo(f * 2, t, .4, dur - .4, v * .35, 6);
  }
  function pad(fs, t, dur, v, filtro) {
    for (const f of fs) for (const det of [-6, 6]) {
      const o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; fl.type = 'lowpass'; fl.frequency.value = filtro;
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + dur * .4); g.gain.linearRampToValueAtTime(.0001, t + dur);
      o.connect(fl); fl.connect(g); const r = enviar(g, .5); seguir(o, t, dur, [fl, g, r]);
    }
  }
  function nivel(v, tau) { if (Math.abs(v - destino) < .0001) return; destino = v; bus.gain.setTargetAtTime(v, ctx.currentTime, tau); }
  function pausar(v) {
    if (pausado === v) return; pausado = v;
    if (ctx && v) {
      nivel(destino > 0 ? C.pausa * destino : 0, .2);
      combatiendo = false; jefe = false; tCombate = 0; nivelCombate(0, C.combate.tauPausa);
    }
  }
  function actualizar(dt, E) {
    if (!ctx) return;
    const t = ctx.currentTime, antes = activo;
    original = !!E.portada || E.escena === 'intro';
    activo = true;   // koto y flauta suenan en todo el juego
    const detenido = pausado || document.hidden;
    const peligro = !original && ((E.peligro || 0) > .2 || (E.combate || 0) > .4 || E.escena === 'huidaInicio');
    const lectura = E.dialogo;
    const v = !activo || E.silencio ? 0 : (original ? C.nivelOriginal : C.nivelExplorar) * (lectura ? C.dialogo : 1) * (detenido ? C.pausa : 1);
    nivel(v, activo ? (lectura ? C.tauLectura : C.entrada) : C.salida);
    const f = peligro ? C.peligro : 1;
    if (f !== destinoFondo) { destinoFondo = f; fondo.gain.setTargetAtTime(f, t, peligro ? C.tauPeligro : C.entrada); }
    const M = C.regiones[original ? 0 : E.interior > .5 ? 5 : clamp(E.bioma || 0, 0, 4)], esc = C.escalas[M.esc];
    actualizarCombate(E, M, esc, t, detenido);
    if (!activo || detenido || ctx.state !== 'running') return;
    if (!antes) { tSig = t + .1; tPad = t; tShaku = t; hasta = t + rnd(...C.frase); descansar = 0; }
    // El prólogo conserva el mismo generador de la portada, sin reiniciar por plano.
    // En juego, las frases descansan para dejar oír el entorno y las señales.
    if (!original && !peligro && t > hasta && !descansar) descansar = t + rnd(...C.descanso);
    if (descansar && t > descansar) { descansar = 0; hasta = t + rnd(...C.frase); }
    const fraseActiva = original || !descansar && !peligro;
    if (fraseActiva && t > tSig - .05) {
      if (tSig < t) tSig = t + .1;
      const frase = rndi(2, 5); let tt = tSig;
      for (let i = 0; i < frase; i++) {
        nota = clamp(nota + pick([-2, -1, -1, 0, 1, 1, 2]), 0, 9);
        koto(hz(M.raiz + esc[nota % 5] + 12 * Math.floor(nota / 5)), tt, C.nivelKoto * (.7 + Math.random() * .5));
        tt += (.45 + Math.random() * .5) * M.ritmo * (Math.random() < .25 ? 1.8 : 1);
      }
      frases++; tSig = tt + (1.6 + Math.random() * 3.2) * M.ritmo;
    }
    if ((original || !descansar) && t > tPad - 1) {
      const dur = 11 * M.ritmo; pad(M.pad.map(p => hz(M.raiz + p - 24)), Math.max(t, tPad), dur, C.pad[peligro ? 1 : 0], 380 + 700 * (E.luz || 0));
      tPad = Math.max(t, tPad) + dur * .8;
    }
    // Probabilidad equivalente a .004 por fotograma a 60 Hz; no cambia con los FPS.
    if (fraseActiva && t > tShaku && Math.random() < 1 - Math.pow(.996, dt * 60)) { shaku(hz(M.raiz + esc[rndi(1, 4)]), t + .1, 4 + Math.random() * 3, .09); tShaku = t + 14 + Math.random() * 12; }
  }
  return { iniciar, actualizar, pausar, depurar: () => ({ activo, original, pausado,
    nivel: bus ? bus.gain.value * fondo.gain.value : 0, destino: destino * destinoFondo,
    frases, nodos: nodos.size, descanso: !!descansar,
    combate: { activo: combatiendo, jefe, destino: destinoRitmo, nivel: ritmo ? ritmo.gain.value : 0, pasos: pasosCombate, proximo: tCombate } }) };
})();
