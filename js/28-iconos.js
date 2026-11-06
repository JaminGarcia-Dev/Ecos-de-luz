/* === Ecos de Luz · 28-iconos.js ===
   Iconos de la interfaz dibujados en SVG (objetos, habilidades, rótulos, lugares, regiones y nivel). Toman el color
   del texto que los rodea (currentColor) y el tamaño de su letra (1em). Sustituyen a los antiguos kanji: todo el
   juego está en español. Arte sustituible: cada icono es un trazado en una cuadrícula de 24 × 24; para cambiarlo
   basta con cambiar su trazado aquí. En el HTML, un elemento con data-ico="nombre" recibe su icono al arrancar. */
"use strict";

/* trazados (línea de 1,8 px; las partes con class="r" van rellenas) */
const ICONOS = {
  // luz, nivel y avisos
  llama: '<path class="r" d="M12 3c.6 3.2 4.5 4.8 4.5 9.6a4.5 4.5 0 0 1-9 0c0-2.4 1.2-3.8 2.4-4.8 0 2 .8 3.2 2 3.4C11.2 8.8 10.8 6 12 3z"/>',
  mota: '<path d="M10 4c.6 3.4 1.9 4.7 5.3 5.3-3.4.6-4.7 1.9-5.3 5.3-.6-3.4-1.9-4.7-5.3-5.3 3.4-.6 4.7-1.9 5.3-5.3z"/><circle class="r" cx="17.5" cy="16.5" r="1.7"/><circle class="r" cx="14" cy="20" r="1.1"/>',
  luz: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  nivel: '<path d="M12 19V5M6 11l6-6 6 6M5 21h14"/>',
  hecho: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>',
  pureza: '<path d="M11 3c.8 4.5 2.5 6.2 7 7-4.5.8-6.2 2.5-7 7-.8-4.5-2.5-6.2-7-7 4.5-.8 6.2-2.5 7-7z"/><path d="M19 16v5M16.5 18.5h5"/>',
  // habilidades
  esquiva: '<path d="m13 6 6 6-6 6M19 12H9M3.5 9h3M2.5 12h3M3.5 15h3"/>',
  pulso: '<circle cx="12" cy="12" r="2.5"/><path d="M8 8a5.7 5.7 0 0 0 0 8M16 8a5.7 5.7 0 0 1 0 8M5 5a9.9 9.9 0 0 0 0 14M19 5a9.9 9.9 0 0 1 0 14"/>',
  escudo: '<path d="m12 3 7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M12 7v10"/>',
  lumi: '<circle class="r" cx="12" cy="14" r="2.2"/><path d="M12 12c-2-4-6-5-8-3 1 3 4 4 8 3zM12 12c2-4 6-5 8-3-1 3-4 4-8 3zM12 18v2.5M9 19.5 8 21M15 19.5l1 1.5"/>',
  salto: '<path d="m7 11 5-5 5 5M7 18l5-5 5 5"/>',
  alas: '<path d="M12 11c-3-4-6-5-9-4 1 4 4 6 9 5zM12 11c3-4 6-5 9-4-1 4-4 6-9 5zM12 12v8"/>',
  golpe: '<path d="M4 19C8 9 14 6 20 5"/><path d="M14 4h6v6"/>',
  farol: '<path d="M9.5 5a2.5 2.5 0 0 1 5 0"/><path d="M7.5 7.5h9M7.5 18.5h9M10 21h4"/><rect x="8.5" y="7.5" width="7" height="11" rx="1"/><circle class="r" cx="12" cy="13" r="1.8"/>',
  // armas y equipo
  espada: '<path d="M20 3c-3 1-8 5.5-12.5 11"/><path d="m5.5 12.5 6 6M8.5 15.5 3.5 20.5"/>',
  lanza: '<path d="M3.5 20.5 15 9"/><path d="M15 9c.8-3 3-5.2 6-6-.8 3-3 5.2-6 6z"/><path d="m11 11.5 1.5 1.5"/>',
  arco: '<path d="M6 3c7 3 7 15 0 18"/><path d="M6 12h14"/><path d="m16 9 4 3-4 3"/>',
  palma: '<circle cx="12" cy="9" r="3"/><path d="M5 21c0-4 3-6 7-6s7 2 7 6"/><path d="M12 2v2M4.5 5l1.5 1.5M19.5 5 18 6.5"/>',
  espadon: '<path d="m21 3-2.5 5.5-8.5 8.5-3-3 8.5-8.5z"/><path d="m5.5 13 5.5 5.5M8 16l-4.5 4.5"/>',
  manto: '<path d="M9 4h6l2 3-2.5 1.5L19 20H5l4.5-11.5L7 7z"/><path d="M12 8.5V20"/>',
  mascara: '<path d="m5 3.5 4 4.5h6l4-4.5V12c0 4.5-3 8.5-7 8.5S5 16.5 5 12z"/><path d="m8.5 12.5 2 1M15.5 12.5l-2 1M11 17h2"/>',
  // consumibles
  taza: '<path d="M5 10h11v3.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M9 3c-1 1.5 1 2.5 0 4.5M13 3c-1 1.5 1 2.5 0 4.5"/>',
  arroz: '<path d="M12 4c-1.5 0-8 11-8 13a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3c0-2-6.5-13-8-13z"/><path class="r" d="M9 15h6v5H9z"/>',
  estrella: '<path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6l-5.4 2.9 1.2-6-4.5-4.2 6.1-.7z"/>',
  // materiales
  pelaje: '<path d="M4 18c2-5 4-8 8-10M8 19c2-4 4-7 8-9M12 20c2-4 4-6 8-8"/>',
  hoja: '<path d="M5 19C5 10 11 5 20 4c-1 9-6 15-15 15z"/><path d="m5 19 8-8"/>',
  colmillo: '<path d="M8 4h8c0 6-2 12-4 16-2-4-4-10-4-16z"/>',
  carne: '<ellipse cx="14.5" cy="9.5" rx="6" ry="4.5" transform="rotate(-40 14.5 9.5)"/><path d="m10.5 13.5-5 5M3.5 17l3.5 3.5"/>',
  garra: '<path d="M6 20c0-6 2-11 6-14M11 20c0-5 2-9 6-11M16 20c0-4 1.5-6 4-7"/>',
  gota: '<path d="M12 3c3 4.5 6 8 6 11a6 6 0 0 1-12 0c0-3 3-6.5 6-11z"/>',
  escama: '<path d="M12 4c4 0 7 3 7 7 0 5-4 8-7 9-3-1-7-4-7-9 0-4 3-7 7-7z"/><path d="M8 11c2-2 6-2 8 0M9 15c1.7-1.5 4.3-1.5 6 0"/>',
  aguijon: '<path d="M4 20 15.5 8.5"/><path d="m15.5 8.5 4.5-4.5-1 5.5z"/>',
  pluma: '<path d="M20 4C11 4 6 10 5 19"/><path d="M20 4c0 8-5 13-13 13M5 19l-1.5 1.5"/>',
  concha: '<path d="M12 20 4 10a8 6 0 0 1 16 0z"/><path d="M12 20V6M12 20 8 7M12 20l4-13"/>',
  flor: '<circle cx="12" cy="12" r="2"/><path d="M12 10c-2-3-1-6 0-7 1 1 2 4 0 7zM14 11.4c2.8-2.2 5.7-1.6 6.7-.9-.6 1.1-3.3 2.5-6.7.9zM13.2 14c1.3 3.4.1 6.1-.8 6.9-.8-1-1.6-4 .8-6.9zM10.8 14c-1.3 3.4-.1 6.1.8 6.9.8-1 1.6-4-.8-6.9zM10 11.4C7.2 9.2 4.3 9.8 3.3 10.5c.6 1.1 3.3 2.5 6.7.9z"/>',
  perla: '<circle cx="12" cy="12" r="7"/><path d="M9 9.5a3 3 0 0 1 3-2"/>',
  cana: '<path d="M4 20 18 4"/><path d="M18 4v9"/><path d="M18 13a2 2 0 1 1-2 2"/>',
  piedra: '<path d="m5 17 2-8 5-4 6 3 2 9z"/><path d="m9 10 3 3 4-2"/>',
  brote: '<path d="M12 20v-8"/><path d="M12 12C12 8 9 6 5 6c0 4 3 6 7 6zM12 14c0-3 3-5 7-5 0 3-3 5-7 5z"/>',
  nucleo: '<path d="m12 3 7 9-7 9-7-9z"/><path d="M5 12h14M12 3v18"/>',
  // lugares y regiones
  lugar: '<path d="M12 21c-4-4.5-6-8-6-11a6 6 0 0 1 12 0c0 3-2 6.5-6 11z"/><circle cx="12" cy="10" r="2"/>',
  faro: '<path d="m9 21 1.5-12h3L15 21z"/><path d="M8 21h8M9.5 9h5l-.5-3h-4zM4 7l4 1M20 7l-4 1"/>',
  torii: '<path d="M3 6c6 1 12 1 18 0M5 9.5h14M7 6v15M17 6v15"/>',
  casa: '<path d="m3 11 9-6 9 6"/><path d="M5 10v10h14V10M10 20v-5h4v5"/>',
  columna: '<path d="M6 21h12M7 18h10M8 18V8M16 18V8M12 18V8M6 8h12l-1-3H7z"/>',
  cueva: '<path d="M3 20c1-8 4-14 9-14s8 6 9 14z"/><path d="M9 20c0-4 1.5-7 3-7s3 3 3 7"/>',
  ola: '<path d="M3 15c2 0 3-2 4.5-2S10 15 12 15s3-2 4.5-2 2.5 2 4.5 2M3 19c2 0 3-2 4.5-2S10 19 12 19s3-2 4.5-2 2.5 2 4.5 2M8 10c0-3 2-5 5-5 2 0 3 1 3 3-1-1-3-1-4 0"/>',
  montana: '<path d="m3 20 6-11 3 4 3-6 6 13z"/><path d="m13.5 10 1.5 2 1.5-1"/>',
  duna: '<path d="M3 18c3-4 6-6 9-6s6 2 9 6M8 13c1.5-3 3-4.5 5-4.5"/><circle cx="17.5" cy="6" r="2"/>',
  copo: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M10 5l2 2 2-2M10 19l2-2 2 2"/>',
  palmera: '<path d="M12 21V10"/><path d="M12 10c-2-3-5-3-8-1M12 10c2-3 5-3 8-1M12 10c-1-3-3-5-6-5M12 10c1-3 3-5 6-5"/>',
  sol: '<circle cx="12" cy="12" r="5"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5"/>',
  // botones del mando que no tienen letra: Vista (dos cuadrados) y Menú (tres rayas), como se ven en el mando
  botonVista: '<rect x="3.5" y="8.5" width="11" height="11" rx="2"/><path d="M9.5 8.5V6a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 20.5 6v8a1.5 1.5 0 0 1-1.5 1.5h-4.5"/>',
  botonMenu: '<path d="M5 7h14M5 12h14M5 17h14"/>',
  // portada
  mando:'<path d="M7.5 8h9a4.5 4.5 0 0 1 4.3 5.8l-1 3.3a2.4 2.4 0 0 1-4 .9L14 16h-4l-1.8 2a2.4 2.4 0 0 1-4-.9l-1-3.3A4.5 4.5 0 0 1 7.5 8z"/><path d="M7.5 10.5v3M6 12h3"/><circle class="r" cx="15.5" cy="11" r="1"/><circle class="r" cx="17.5" cy="13" r="1"/>',
  ajustes: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9M4 12h5M13 12h7"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/><circle cx="11" cy="12" r="2"/>'
};

const Iconos = {
  /* el SVG de un icono (si no existe, un punto); clase opcional para el CSS */
  svg(nombre, clase) {
    return `<svg class="ico${clase ? ' ' + clase : ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[nombre] || '<circle class="r" cx="12" cy="12" r="3"/>'}</svg>`;
  },
  /* rellena los elementos con data-ico (una vez, al arrancar la interfaz) */
  poner(raiz) { (raiz || document).querySelectorAll('[data-ico]').forEach(e => { e.innerHTML = Iconos.svg(e.dataset.ico); }); }
};
