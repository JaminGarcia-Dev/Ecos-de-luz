/* === Ecos de Luz · 27-ecos.js ===
   Ecos del pasado: figuras de luz de los antiguos habitantes que repiten un momento (cantar al faro, ofrecer
   la luz, pescar con su hija, señalar los fragmentos, jugar bajo el cerezo, subir a Kiri) cuando Hikari se
   acerca, con una sola frase. La primera vez se apuntan en el diario (Sis.ST.ecos) y cuentan para la misión
   «Ecos del pasado». Los datos (sitio —o una posición de Estr, como muelleEco—, figuras, título y frase) están en GUION.ecos (26-guion.js); los
   cuerpos, en 25-gente.js. Pilar 4: el mundo cuenta la historia sin diálogos. */
"use strict";

/* distancias (m), tiempos (s), opacidad y color de los ecos */
const ECOS = { aparecer: 16, desaparecer: 24, alto: 12, fundido: 1.2, opacidad: .5, color: 0x9fe8ff, texto: 6, xp: 20 };

const Ecos = (() => {
  const lista = [];
  let tTexto = 0;
  // suelo bajo un eco: el terreno o lo que haya encima (sobre el agua se busca desde el nivel del agua: el muelle)
  const suelo = (x, z) => Math.max(altura(x, z), Sol.suelo(x, z, Math.max(altura(x, z), NIVEL_AGUA) + 3));

  function crear() {
    for (const E of GUION.ecos) {
      const S = typeof E.lugar === 'string' ? (Estr[E.lugar] || sitio(E.lugar)) : E.lugar, x = S.x + (E.dx || 0), z = S.z + (E.dz || 0), mat = Gente.materialEco(ECOS.color);
      const figs = E.figuras.map(f => {
        const n = Gente.crear({ nombre: '', eco: true, matEco: mat, alto: f.alto || 1.55, nino: f.nino, baston: f.baston, encorvado: f.encorvado, moño: !f.nino, rutina: { tipo: 'eco', accion: f.accion } });
        const px = x + f.x, pz = z + f.z; n.g.position.set(px, suelo(px, pz), pz);
        n.g.rotation.y = f.mira === 'faro' ? Math.atan2(-px, -pz) : f.mira === 'muelle' ? Estr.muelleAng : f.mira !== undefined ? f.mira : Math.random() * TAU;
        n.g.visible = false; scene.add(n.g); return n;
      });
      lista.push({ E, x, z, figs, mat, k: 0, obj: 0, mostrado: false, tMotivo: 0 });
    }
  }
  function actualizar(dt, J) {
    const S = Sis.ST; if (!S.ecos) S.ecos = {}; let kMax = 0;
    for (const e of lista) {
      const d = Math.abs(J.y - (e.figs[0] ? e.figs[0].g.position.y : J.y)) > ECOS.alto || J.combate > 0 ? 1e9 : Math.hypot(J.x - e.x, J.z - e.z);   // muy por encima o por debajo, o en pleno combate, no se nota
      e.obj = d < ECOS.aparecer ? 1 : d > ECOS.desaparecer ? 0 : e.obj;
      e.k = damp(e.k, e.obj, 3 / ECOS.fundido, dt); e.mat.opacity = e.k * ECOS.opacidad;
      const vis = e.k > .01; kMax = Math.max(kMax, e.k);
      for (const f of e.figs) { f.g.visible = vis; if (vis) f.actualizar(dt, J.x, J.z); }
      // su motivo propio (GUION.ecos[].motivo) se repite cada 'cada' segundos mientras se ve
      if (e.k > .3 && e.E.motivo) { e.tMotivo -= dt; if (e.tMotivo <= 0) { const m = e.E.motivo; e.tMotivo = [].concat(m)[0].cada || 9; Sonido.motivo(m, { x: e.x, y: e.figs[0].g.position.y + 1.5, z: e.z }, e.k); } } else e.tMotivo = 0;
      if (vis && Math.random() < dt * 6 * e.k) { const f = pick(e.figs).g.position; FX.emit(f.x + rnd(-.6, .6), f.y + rnd(.2, 1.6), f.z + rnd(-.6, .6), 0, rnd(.2, .6), 0, 1.6, .14, 0xcff6ff, .7); }
      // el recuerdo espera a que no haya un rótulo, un diálogo o un fundido en pantalla (tras la intro: título, región y eco)
      if (e.obj && !e.mostrado && e.k > .5 && !UI.ocupada()) { e.mostrado = true; mostrar(e, S); }
      if (!e.obj && e.k < .05) e.mostrado = false;   // al volver, el recuerdo se repite
    }
    Sonido.coro(kMax);   // coro suave mientras se ve un eco
    if (tTexto > 0) { tTexto -= dt; if (tTexto <= 0 && !Cin.activa) UI.subtitulo(null); }
  }
  function mostrar(e, S) {
    if (Cin.activa) return;
    UI.subtitulo(e.E.texto); tTexto = ECOS.texto; Sonido.sfx('eco', { pos: { x: e.x, y: e.figs[0].g.position.y + 1.5, z: e.z } });
    if (S.ecos[e.E.id]) return;
    S.ecos[e.E.id] = 1; Sis.ganarXP(ECOS.xp); Sis.rescatar(LUZ_RESCATADA.eco); UI.diarioNuevo('Eco: ' + e.E.titulo, e.E.texto); Sonido.sfx('cristal'); Sis.evento('eco'); Sis.guardar();
  }
  /* el eco sin encontrar más cercano (guía de la misión) */
  function cercano(J) { let b = null, bd = 1e9; for (const e of lista) { if (Sis.ST.ecos && Sis.ST.ecos[e.E.id]) continue; const d = Math.hypot(e.x - J.x, e.z - J.z); if (d < bd) { bd = d; b = { x: e.x, z: e.z }; } } return b; }
  /* muestra un eco desde una cinemática (el final reúne a los que cantaban al faro) */
  function forzar(id, k) { const e = lista.find(q => q.E.id === id); if (!e) return; e.k = k; e.mat.opacity = k * ECOS.opacidad; for (const f of e.figs) { f.g.visible = k > .01; f.actualizar(1 / 60, 1e4, 1e4); } }
  return { crear, actualizar, cercano, forzar, lista };
})();
