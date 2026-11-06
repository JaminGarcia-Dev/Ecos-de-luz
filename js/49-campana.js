/* Campaña única (canon 2.0, PLAN_FUSION.md): capítulos, regiones abiertas y límite del Velo.
   Un solo guardado; las partidas de la historia anterior (ecos2_partida) ya no se leen. */
"use strict";
/* capítulos: regiones abiertas (índices de BIOMAS: 0 pradera, 1 Sakura, 2 Kiri, 3 dunas, 4 lagos; 'isla', la isla nueva
   del capítulo 4) y sistemas de la historia anterior que funcionan en él ('mundo': katana, murales, retos, cofres y
   animales en Sis.interactuable). Un capítulo acaba con su evento 'fin'. */
const MUNDO = ['mundo', 'jefes', 'sombras', 'ecos'];
const CAPITULOS = [
  { nom: 'La noche que rompió el faro', regiones: [0, 1], sistemas: [], fin: 'inicio:registro_completo' },
  { nom: 'El pueblo que llama honor a la pérdida', regiones: [0, 1], sistemas: MUNDO, fin: 'c1:testimonio_compartido' },
  { nom: 'La orilla de los que faltan', regiones: [0, 1, 4], sistemas: MUNDO, fin: 'c2:pruebas_compartidas' },
  { nom: 'Los nombres bajo la arena', regiones: [0, 1, 4, 3], sistemas: MUNDO, fin: 'c3:pruebas_compartidas' },
  { nom: 'Fuera del Velo', regiones: [0, 1, 4, 3, 'isla'], sistemas: [...MUNDO, 'asedio'], fin: 'c4:momo_capturada' },
  { nom: 'Lo que un padre llama salvar', regiones: [0, 1, 4, 3, 'isla'], sistemas: [...MUNDO, 'duelo'], fin: 'c5:despues' },
  { nom: 'La memoria que no devuelve a nadie', regiones: [0, 1, 4, 3, 'isla', 2], sistemas: [...MUNDO, 'lumi'], fin: 'c6:regreso_acordado' },
  { nom: 'La luz que ya no se entrega', regiones: [0, 1, 4, 3, 'isla', 2], sistemas: [...MUNDO, 'asedio', 'luna'], fin: null }
];
/* límite del Velo: cada cuánto (s) puede repetirse el aviso al tocar una región cerrada */
const VELO = { aviso: 6 };

const Campana = (() => {
  const clave = 'ecos3_luna_partida';
  let ultimo = null, tAviso = 0;
  function inicio() { return { version: 1, prologo: false, nombre: false, hinode: false, momo: false, tsuru: false, hoja: false, rumbo: false, fin: false, postigo: false, farol: false, testimonio: false, huida: false, tutorial: {}, notas: [], dialogo: null }; }
  const capitulo = () => (Sis.ST && Sis.ST.capitulo) || 0;
  const ficha = () => CAPITULOS[Math.min(capitulo(), CAPITULOS.length - 1)];
  const usa = sistema => ficha().sistemas.includes(sistema);
  const abierta = region => ficha().regiones.includes(region);
  /* partidas guardadas antes de la fusión: si ya leyeron el registro del Pétalo, empiezan en el capítulo 1 */
  function migrar(ST, guardado) { if (guardado.capitulo === undefined) ST.capitulo = ST.inicio && ST.inicio.registroPetalo ? 1 : 0; }
  /* un evento de misión que cierra el capítulo abre el siguiente */
  function evento(nom) {
    const f = ficha(); if (!f.fin || nom !== f.fin || capitulo() >= CAPITULOS.length - 1) return;
    Sis.ST.capitulo = capitulo() + 1; Bus.emit('capitulo', Sis.ST.capitulo);
  }
  /* el Velo: en una región que aún no ha abierto su capítulo, Hikari vuelve al último punto abierto */
  function limitar(J, dt) {
    tAviso -= dt;
    if (abierta(biomaDe(J.x, J.z))) { ultimo = { x: J.x, z: J.z }; return; }
    if (!ultimo) return;
    J.x = ultimo.x; J.z = ultimo.z; J.vx = J.vz = 0;
    if (tAviso <= 0) { tAviso = VELO.aviso; UI.aviso(GUION_INICIO.velo, 'error'); }
  }
  return { id: 'luna', clave, inicio, capitulo, ficha, usa, abierta, migrar, evento, limitar, compatible: s => s.campana === 'luna' && s.inicio && s.inicio.version === 1 };
})();
