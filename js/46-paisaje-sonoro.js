/* Sonido de juego: entorno continuo (ambiente) y foley. La música es el koto y la flauta de 54-musica-inicio.js;
   desde la fusión no hay temas orquestales. Las muestras comprimidas están en 45-audio-recursos.js; fuentes y cambios en AUDIO_LICENCIAS.md.
   No descarga durante la partida; la decodificación es asíncrona. */
"use strict";
const PAISAJE_AUDIO = {
  cruceAmbiente: 1.8, pausa: .18, ambiente: .7,
  vocesMax: 18,
  /* envolvente de cada muestra (s): entrada y cola final, sin cortes secos (guía sonora del piloto, regla 6);
     en una escena el ambiente sigue sonando un poco más bajo y cambia con calma (regla 5) */
  ataque: .01, cola: .15, escenaAmbiente: .8, tauAmbiente: 1,
  pasos: { tierra: .52, piedra: .42, nieve: .6, madera: .46 },
  suelo: { margen: .15, alto: .4 }
};

const PaisajeSonoro = (() => {
  const C = PAISAJE_AUDIO;
  const buffers = new Map(), pendientes = new Map(), fallos = new Set();
  const efectosVivos = new Set(), ambientes = {}, variantes = {};
  let ctx, buses, mezclaA, preparado = false, pausado = false, tAve = 0, tGrillo = 0, tTela = 0;

  async function cargar(id) {
    if (buffers.has(id)) return buffers.get(id);
    if (pendientes.has(id)) return pendientes.get(id);
    if (!AUDIO_RECURSOS[id] || fallos.has(id)) return null;
    const p = (async () => {
      try {
        const bin = atob(AUDIO_RECURSOS[id]), bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const b = await ctx.decodeAudioData(bytes.buffer); buffers.set(id, b); return b;
      } catch (e) { fallos.add(id); console.warn('Audio no disponible:', id, e.message); return null; }
      finally { pendientes.delete(id); }
    })();
    pendientes.set(id, p); return p;
  }
  function iniciar(contexto, canales) {
    if (ctx) return;
    ctx = contexto; buses = canales;
    mezclaA = ctx.createGain(); mezclaA.gain.value = 1; mezclaA.connect(buses.ambiente);
    Promise.all(Object.keys(AUDIO_RECURSOS).map(cargar)).then(() => { preparado = true; });
  }
  function tramoAmbiente(a, inicio, offset = 0) {
    const s = ctx.createBufferSource(), g = ctx.createGain(), dur = a.b.duration - offset, cruce = Math.min(C.cruceAmbiente, dur / 3);
    s.buffer = a.b; s.connect(g); g.connect(a.g);
    g.gain.setValueAtTime(0, inicio); g.gain.linearRampToValueAtTime(1, inicio + cruce);
    g.gain.setValueAtTime(1, inicio + dur - cruce); g.gain.linearRampToValueAtTime(0, inicio + dur);
    const o = { s, g }; a.tramos.add(o); s.onended = () => { s.disconnect(); g.disconnect(); a.tramos.delete(o); };
    s.start(inicio, offset); s.stop(inicio + dur + .01); a.siguiente = inicio + dur - cruce;
  }
  function ambiente(id, nivel) {
    const b = buffers.get(id); if (!b) return;
    let a = ambientes[id];
    if (!a && nivel > .001) { const g = ctx.createGain(); g.gain.value = 0; g.connect(mezclaA); a = ambientes[id] = { b, g, nivel: -1, siguiente: 0, tramos: new Set() }; }
    if (!a) return;
    const t = ctx.currentTime;
    if (Math.abs(nivel - a.nivel) > .001) { a.nivel = nivel; a.g.gain.setTargetAtTime(nivel, t, .85); }
    // Se solapan las colas, sin unir a fuerza extremos distintos de una grabación.
    if (nivel > .001 && a.siguiente < t + .3) tramoAmbiente(a, Math.max(t, a.siguiente), !a.tramos.size ? Math.random() * Math.max(0, b.duration - C.cruceAmbiente * 3) : 0);
  }
  function muestra(id, volumen, opciones = {}) {
    const b = buffers.get(id); if (!b || !ctx || ctx.state !== 'running') return false;
    if (efectosVivos.size >= C.vocesMax) return true;
    const s = ctx.createBufferSource(), g = ctx.createGain(), t = ctx.currentTime; s.buffer = b;
    s.playbackRate.value = opciones.tono || rnd(.96, 1.04);
    const largo = b.duration / s.playbackRate.value;
    const ataque = Math.min(C.ataque, largo / 4), cola = Math.min(C.cola, largo / 4);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volumen, t + ataque);
    g.gain.setValueAtTime(volumen, t + Math.max(ataque, largo - cola)); g.gain.linearRampToValueAtTime(0, t + largo);
    s.connect(g); let espacial = null;
    const canal = opciones.ambiente ? mezclaA : buses.efectos;
    if (opciones.pos) {
      const P = AUDIO.posicional; espacial = ctx.createPanner(); espacial.panningModel = 'equalpower'; espacial.distanceModel = 'inverse';
      espacial.refDistance = P.ref; espacial.maxDistance = P.max; espacial.rolloffFactor = P.caida;
      espacial.positionX.value = opciones.pos.x; espacial.positionY.value = opciones.pos.y; espacial.positionZ.value = opciones.pos.z;
      g.connect(espacial); espacial.connect(canal);
    } else if (opciones.pan !== undefined) {
      espacial = ctx.createStereoPanner(); espacial.pan.value = opciones.pan; g.connect(espacial); espacial.connect(canal);
    } else g.connect(canal);
    if (!opciones.ambiente && buses.sala) (espacial || g).connect(buses.sala);
    const o = { s, g }; efectosVivos.add(o);
    s.onended = () => { s.disconnect(); g.disconnect(); if (espacial) espacial.disconnect(); efectosVivos.delete(o); };
    s.start(); return true;
  }
  function variante(base, n = 3) {
    const anterior = variantes[base], i = anterior === undefined ? rndi(0, n - 1) : (anterior + rndi(1, n - 1)) % n;
    variantes[base] = i; return base + '-' + i;
  }
  function superficie(base, p) {
    if (!p) return base;
    const m = Estr.muelleSonido, S = C.suelo;
    if (m && Math.abs(p.y - m.y) < S.alto) {
      const dx = p.x - m.x, dz = p.z - m.z, a = dx * Math.sin(m.ang) + dz * Math.cos(m.ang), l = dx * Math.cos(m.ang) - dz * Math.sin(m.ang);
      if (Math.abs(l) < m.ancho * .5 + S.margen && a > -1.5 && a < m.largo - 1.5) return 'madera';
    }
    if (enCueva(p.x, p.y + .8, p.z)) return 'piedra';
    const s = Sol.suelo(p.x, p.z, p.y + S.alto);
    if (Math.abs(s - p.y) < S.alto && s > altura(p.x, p.z) + S.margen) return 'piedra';
    return base;
  }
  function efecto(n, o = {}) {
    if (!preparado) return false;
    const p = o.peso || 1, v = o.vol === undefined ? 1 : o.vol;
    const tocar = (id, nivel, extra) => muestra(id, nivel * v, { pos: o.pos, ...extra });
    switch (n) {
      case 'paso': { const material = superficie(o.sup, o.suelo), sup = ['nieve','piedra','madera'].includes(material) ? material : 'tierra'; return tocar(variante('paso-' + sup), C.pasos[sup], { pan: rnd(-.12, .12), tono: rnd(.92, 1.06) }); }
      case 'corte': tocar(variante('tela', 2), .18); return tocar(variante('corte', 2), .42, { tono: 1 / Math.sqrt(p) });
      case 'golpe': return tocar(variante('impacto-suave'), .65 + Math.min(p, 3) * .08, { tono: 1 / Math.sqrt(p) });
      case 'bloqueo': return tocar(variante('impacto-metal'), .5);
      case 'parada': tocar('campana', .17, { tono: 1.35 }); return tocar(variante('impacto-metal'), .56, { tono: 1.15 });
      case 'rota': return tocar(variante('impacto-piedra'), .6);
      case 'herido': case 'derribo': return tocar(variante('impacto-suave'), .72, { tono: .72 });
      case 'aterrizar': tocar(variante('tela', 2), .2); return tocar(variante('paso-tierra'), .6, { tono: .8 });
      case 'salto': case 'doble': case 'planeo': case 'esquiva': return tocar(variante('tela', 2), n === 'esquiva' ? .42 : .24);
      case 'ui': return tocar('objeto', .18, { tono: 1.2 });
      case 'ui2': return tocar('cofre', .2, { tono: 1.1 });
      case 'error': return tocar('objeto', .2, { tono: .7 });
      case 'cofre': tocar('cofre', .45); return tocar('campana', .12, { tono: 1.5 });
      case 'recoger': return tocar('campana', .16, { tono: rnd(1.3, 1.65) });
      case 'sombraRompe': tocar(variante('cristal'), .3); return false; // conserva la pequeña nota de luz
      case 'quiebre': tocar(variante('cristal'), .5); return false;
      default: return false;
    }
  }
  function actualizar(dt, E) {
    if (!ctx) return;
    const t = ctx.currentTime, pausa = pausado || document.hidden ? C.pausa : 1;
    mezclaA.gain.setTargetAtTime(C.ambiente * pausa * (E.escena ? C.escenaAmbiente : 1), t, pausa < 1 ? .2 : C.tauAmbiente);
    const exterior = 1 - clamp(E.interior || 0, 0, 1), vivo = exterior * (E.peligro > .2 || E.combate > .4 ? .2 : 1);
    ambiente('bosque', vivo * (!E.noche && [0,1,4].includes(E.bioma) ? .58 : 0));
    ambiente('orilla', exterior * clamp(E.agua || 0, 0, 1) * .85);
    if (!E.escena && !pausado && !document.hidden && preparado) {
      if (vivo > .2 && !E.noche && [0,1,4].includes(E.bioma) && t > tAve) { tAve = t + rnd(7, 15); muestra(variante('ave', 2), .32 * vivo, { ambiente: true, pan: rnd(-.65, .65) }); }
      if (vivo > .2 && E.noche && [0,1,4].includes(E.bioma) && t > tGrillo) { tGrillo = t + rnd(3, 7); muestra('grillos', .4 * vivo, { ambiente: true, pan: rnd(-.4, .4) }); }
      if (E.planeo && t > tTela) { tTela = t + rnd(1.4, 2.4); muestra(variante('tela', 2), .08, { ambiente: true }); }
    }
  }
  function pausar(v) {
    if (pausado === v) return;
    pausado = v;
    if (!ctx || !v) return;
    mezclaA.gain.setTargetAtTime(C.ambiente * C.pausa, ctx.currentTime, .2);
  }
  function creditos() {
    return '<div class="grupoT">Sonido</div><div style="font-size:13px;line-height:1.7">' +
      'Música: koto y flauta generados en el juego. ' +
      'Foley: <a href="https://kenney.nl/assets/rpg-audio" target="_blank" rel="noopener">Kenney</a> (CC0). Ambiente: deadrobotmusic y RandomMind (CC0). ' +
      'Aves y grillos: <a href="https://opengameart.org/content/ambient-bird-cricket-and-frog" target="_blank" rel="noopener">Blender Foundation / Yo Frankie!</a>, ' +
      '<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>; conversión y ajuste de nivel.</div>';
  }
  return { iniciar, actualizar, efecto, superficie, pausar, creditos, get preparado() { return preparado; }, get musical() { return MusicaInicio.depurar().activo; },
    depurar: () => ({ tema: '', temasVivos: 0, muestras: buffers.size, pendientes: pendientes.size, fallos: [...fallos], voces: efectosVivos.size,
      ambientes: Object.fromEntries(Object.entries(ambientes).map(([id, a]) => [id, { nivel: a.nivel, tramos: a.tramos.size, siguiente: a.siguiente }])),
      bytesDecodificados: [...buffers.values()].reduce((s, b) => s + b.length * b.numberOfChannels * 4, 0) }) };
})();
