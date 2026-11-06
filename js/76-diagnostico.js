/* === Ecos de Luz · 76-diagnostico.js ===
   Detecta que la página se cerró sola (el navegador la recarga si se agota la memoria o cae el proceso de GPU) y deja
   constancia de dónde ocurrió. Cada DIAGNOSTICO.latido s guarda en localStorage el último estado (escena, plano, calidad,
   memoria); un cierre normal (pagehide) lo marca como limpio. Al arrancar, un registro sin marca limpia es una caída:
   tras DIAGNOSTICO.caidasParaBajar seguidas baja un nivel la calidad y avisa en la portada. También recoge la pérdida del
   contexto WebGL. Se carga justo tras 00-nucleo.js, antes de que nada pese. */
"use strict";

const DIAGNOSTICO = { clave: 'ecos_diag', latido: 1.5, caidasParaBajar: 2, orden: ['alta', 'media', 'baja'], historial: 6 };

const Diagnostico = (() => {
  const D = DIAGNOSTICO;
  let reg = null, aviso = null, bajoCalidad = false;
  const leer = () => { try { return JSON.parse(localStorage.getItem(D.clave)); } catch (e) { return null; } };
  const guardar = () => { try { localStorage.setItem(D.clave, JSON.stringify(reg)); } catch (e) { } };

  /* una calidad más baja; devuelve false si ya está en la más baja */
  function bajar() {
    const i = D.orden.indexOf(AJUSTES.calidad); if (i < 0 || i >= D.orden.length - 1) return false;
    AJUSTES.calidad = D.orden[i + 1]; guardarAjustes(); bajoCalidad = true; return true;
  }
  function lugar() {
    try {
      if (typeof Cin !== 'undefined' && Cin.activa) { const e = Cin.estadoPlano && Cin.estadoPlano(); return 'escena «' + Cin.tipo + '»' + (e ? ', plano ' + (e.i + 1) + ' (' + e.t.toFixed(0) + ' s)' : ''); }
      if (typeof G !== 'undefined') return G.estado === 'portada' ? 'pantalla de inicio' : G.estado === 'juego' ? 'partida, capítulo ' + ((Sis.ST && Sis.ST.capitulo) || 0) : 'estado «' + G.estado + '»';
    } catch (e) { }
    return 'carga';
  }
  function latido() {
    try {
      reg.ultT = Date.now(); reg.ult = lugar(); reg.calidad = AJUSTES.calidad;
      if (performance.memory) reg.mem = Math.round(performance.memory.usedJSHeapSize / 1048576);
      if (typeof renderer !== 'undefined' && renderer.info) reg.gl = { geo: renderer.info.memory.geometries, tex: renderer.info.memory.textures, prog: renderer.info.programs ? renderer.info.programs.length : 0, llamadas: renderer.info.render.calls };
      guardar();
    } catch (e) { }
  }
  function iniciar() {
    const previo = leer(), caida = !!previo && previo.limpio === false, hist = previo && previo.historial || [];
    reg = { limpio: false, inicio: Date.now(), caidas: caida ? (previo.caidas || 0) + 1 : 0, historial: hist, calidad: AJUSTES.calidad };
    if (caida) {
      hist.push({ cuando: previo.ultT || previo.inicio, donde: previo.ult || 'carga', calidad: previo.calidad, mem: previo.mem, gl: previo.gl });
      while (hist.length > D.historial) hist.shift();
      const baja = reg.caidas >= D.caidasParaBajar && bajar();
      aviso = 'El juego se cerró solo' + (previo.ult ? ' durante la ' + previo.ult : '') + '.' + (baja ? ' Bajé la calidad a «' + AJUSTES.calidad + '» para que no se repita.' : reg.caidas >= D.caidasParaBajar ? ' Ya estás en la calidad más baja: cierra otras pestañas o programas.' : '');
    }
    guardar(); setInterval(latido, D.latido * 1000);
    window.addEventListener('pagehide', () => { reg.limpio = true; guardar(); });
    window.addEventListener('pageshow', e => { if (e.persisted) { reg.limpio = false; guardar(); } });
  }
  /* el contexto WebGL se perdió (proceso de GPU, controlador o memoria): se anota y se ofrece recargar con menos calidad */
  function vigilar(canvas) {
    canvas.addEventListener('webglcontextlost', e => {
      e.preventDefault(); reg.contexto = (reg.contexto || 0) + 1; reg.ult = 'contexto gráfico perdido en ' + lugar(); guardar();
      const baja = bajar();
      if (typeof UI !== 'undefined') UI.avisoCaida('Se perdió la imagen del juego (la tarjeta gráfica dejó de responder).' + (baja ? ' Bajé la calidad a «' + AJUSTES.calidad + '».' : ''), true);
    });
  }
  /* aviso de la caída anterior, una vez cargada la portada */
  function avisar() { if (aviso && typeof UI !== 'undefined') { UI.avisoCaida(aviso); aviso = null; } }
  const informe = () => JSON.stringify(reg, null, 1);

  iniciar();
  return { vigilar, avisar, informe, bajar, get registro() { return reg; } };
})();
