/* Potencia permanente y presupuesto regional. El perfil se captura al nacer el
   encuentro; nunca consulta el nivel en medio de un ataque. Sin multiplicar velocidad. */
"use strict";
const PROGRESION_ENEMIGA = {
  pesos: { nivel: .6, equipo: .25, mejoras: .15 },
  limites: { pradera: .2, sakura: .45, marea: .65, duna: .8, kiri: 1, faro: 1, practica: 1 },
  crecimiento: { vida: .25, daño: .15, equilibrio: .2 },
  armas: { katana: 1 / 3, escuela: 1 / 3, naginata: 2 / 3, arco: 2 / 3, escuela_viento: 2 / 3, escuela_brasa: 1, escuela_escarcha: 1, escuela_oscuridad: 1, odachi: 1 },
  rangos: [.35, .7]
};
const ProgresionEnemiga = (() => {
  const C = PROGRESION_ENEMIGA;
  const numero = (v, defecto = 0) => Number.isFinite(v) ? v : defecto;
  function componentes(s) {
    const h = s.historialPoder || {}, inv = s.inv || {};
    const equipo = Math.max(numero(h.equipo), ...Object.entries(C.armas).map(([id, k]) => inv[id] > 0 || s.eq && s.eq.arma === id ? k : 0));
    const mejoras = Math.max(numero(h.mejoras), ['vida', 'capa', 'manto'].reduce((n, id) => n + clamp(numero((s.mejoras || {})[id]), 0, 3), 0) / 9);
    return { nivel: clamp((numero(s.nivel, 1) - 1) / 9, 0, 1), equipo: clamp(equipo, 0, 1), mejoras: clamp(mejoras, 0, 1) };
  }
  function registrar(s) { const p = componentes(s); s.historialPoder = { equipo: p.equipo, mejoras: p.mejoras }; }
  function region(x, z) { return ['pradera', 'sakura', 'kiri', 'duna', 'marea'][biomaDe(x, z)] || 'pradera'; }
  function capturar(lugar, s = Sis.ST) {
    const p = componentes(s), potencia = Math.min(C.limites[lugar] ?? C.limites.pradera, p.nivel * C.pesos.nivel + p.equipo * C.pesos.equipo + p.mejoras * C.pesos.mejoras);
    return Object.freeze({ region: lugar, potencia, rango: potencia >= C.rangos[1] ? 2 : potencia >= C.rangos[0] ? 1 : 0,
      vida: (1 + C.crecimiento.vida * potencia) * dificultad().vida, daño: 1 + C.crecimiento.daño * potencia, equilibrio: (1 + C.crecimiento.equilibrio * potencia) * dificultad().equilibrio,   // la dificultad se fija al nacer el encuentro; el daño se aplica al recibirlo (Combate.recibir)
     
      fuente: Object.freeze(p) });
  }
  function sombra(base, perfil) {
    const copiar = o => {
      if (!o || typeof o !== 'object') return o;
      if (Array.isArray(o)) return o.map(copiar);
      return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, k === 'daño' && typeof v === 'number' ? v * perfil.daño : copiar(v)]));
    };
    const e = copiar(base); e.animo = Math.round(base.animo * perfil.vida);
    if (e.equilibrio) e.equilibrio.max *= perfil.equilibrio;
    return e;
  }
  return { componentes, registrar, region, capturar, sombra };
})();
