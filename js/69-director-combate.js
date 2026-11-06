/* === Ecos de Luz · 69-director-combate.js ===
   Permisos de ataque y agenda de avisos e impactos. Solo usa tiempo de juego.
   Un permiso numérico vence tras duracion segundos y prevé el impacto al final.
   Para una IA: duracion = { total, impactos: [segundos], avisos: [segundos], jefe, zonaGrande }.
   Los tiempos son relativos a la petición. El primer aviso empieza al concederla.
   Un jefe debe pedir su permiso antes de mostrar el aviso, igual que sus acompañantes. */
"use strict";

const DIRECTOR = {
  presupuestos: { sereno: 1, exigente: 2, intenso: 3 }, dificultad: 'exigente',
  atacantes: 2, ligero: 1, pesado: 2, separaAvisos: .30, separaImpactos: .25,
  retencion: .20, vidaEsquirla: 2, margenPermiso: .25, acompanantes: 1, precision: 1e-8
};

const DirectorCombate = (() => {
  const permisos = new Map(), avisos = [], impactos = [];
  let tiempo = 0;
  const dificultad = () => typeof AJUSTES !== 'undefined' && AJUSTES &&
    Object.prototype.hasOwnProperty.call(DIRECTOR.presupuestos, AJUSTES.dificultad) ? AJUSTES.dificultad : DIRECTOR.dificultad;
  const presupuesto = () => DIRECTOR.presupuestos[dificultad()];
  const cerca = (a, b, margen) => Math.abs(a - b) + DIRECTOR.precision < margen;
  function borrarFuturos(quien) {
    for (const agenda of [avisos, impactos]) {
      for (let i = agenda.length - 1; i >= 0; i--) if (agenda[i].quien === quien && agenda[i].t > tiempo) agenda.splice(i, 1);
    }
  }
  function pedir(quien, coste, duracion) {
    if (quien == null || (coste !== DIRECTOR.ligero && coste !== DIRECTOR.pesado)) return false;
    const anterior = permisos.get(quien);
    if (anterior) return !anterior.interrumpido;
    const D = typeof duracion === 'number' ? { total: duracion, impactos: [duracion] } : duracion;
    if (!D || !Number.isFinite(D.total) || D.total <= 0) return false;
    const llegadas = D.impactos || [D.total], comienzos = D.avisos || [0];
    if (!Array.isArray(llegadas) || !llegadas.length || !Array.isArray(comienzos) || comienzos[0] !== 0) return false;
    if (llegadas.concat(comienzos).some(t => !Number.isFinite(t) || t < 0 || t > D.total)) return false;
    const puntos = presupuesto(), cargo = Math.min(coste, puntos), jefe = !!D.jefe, zonaGrande = !!D.zonaGrande;
    let usados = 0, acompanantes = 0;
    for (const p of permisos.values()) {
      usados += Math.min(p.coste, puntos);
      if (!p.jefe) acompanantes += Math.min(p.coste, puntos);
    }
    if (usados + cargo > puntos || permisos.size >= DIRECTOR.atacantes) return false;
    const jefes = Array.from(permisos.values()).filter(p => p.jefe);
    if (!jefe && jefes.length && (jefes.some(p => p.zonaGrande) || acompanantes + cargo > DIRECTOR.acompanantes)) return false;
    if (jefe && (zonaGrande ? acompanantes > 0 : acompanantes > DIRECTOR.acompanantes)) return false;
    for (const [nuevos, agenda, margen] of [[comienzos, avisos, DIRECTOR.separaAvisos], [llegadas, impactos, DIRECTOR.separaImpactos]]) {
      for (let i = 0; i < nuevos.length; i++) {
        if (agenda.some(e => cerca(tiempo + nuevos[i], e.t, margen))) return false;
        for (let j = 0; j < i; j++) if (cerca(nuevos[i], nuevos[j], margen)) return false;
      }
    }
    // En Sereno, un ataque pesado ocupa el único punto. Nunca se veta el oni.
    permisos.set(quien, { coste, jefe, zonaGrande, hasta: tiempo + D.total, interrumpido: false });
    for (const t of comienzos) avisos.push({ quien, t: tiempo + t });
    for (const t of llegadas) impactos.push({ quien, t: tiempo + t });
    return true;
  }
  function liberar(quien) {
    const p = permisos.get(quien);
    if (p && p.interrumpido && tiempo + DIRECTOR.precision < p.hasta) return;
    permisos.delete(quien); borrarFuturos(quien);
  }
  function interrumpido(quien) {
    const p = permisos.get(quien); if (!p || p.interrumpido) return;
    p.interrumpido = true; p.hasta = tiempo + DIRECTOR.retencion; borrarFuturos(quien);
  }
  function actualizar(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    tiempo += dt;
    for (const [quien, p] of permisos) if (tiempo + DIRECTOR.precision >= p.hasta) { permisos.delete(quien); borrarFuturos(quien); }
    for (const [agenda, margen] of [[avisos, DIRECTOR.separaAvisos], [impactos, DIRECTOR.separaImpactos]]) {
      for (let i = agenda.length - 1; i >= 0; i--) if (agenda[i].t + margen < tiempo) agenda.splice(i, 1);
    }
  }
  function reiniciar() { permisos.clear(); avisos.length = impactos.length = 0; tiempo = 0; }
  return { pedir, liberar, interrumpido, actualizar, reiniciar, get presupuesto() { return presupuesto(); } };
})();
