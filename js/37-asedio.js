/* === Ecos de Luz · 37-asedio.js ===
   Asedios por datos (rediseño de la historia): oleadas de Sombras alrededor de un sitio hasta despejarlo. Dos fichas:
   el asedio de Hinode en la Noche Roja (fase 19: de noche, con las luces de la aldea bajas, Tasogare mirando desde el
   torii, Tsuru y Momo escondidos y Yuki defendiendo la plaza con un pulso de luz) y el asalto al faro del acto 3
   (fase 21: la plaza tomada por la oscuridad, con la espiral apagada; al despejarla, baja Tasogare a batirse en duelo,
   42-duelo.js, y luego la espiral es su fase 2, 43-duelo-espiral.js). Cada uno empieza con el aviso 'empieza:<id>' (un
   paso de misión con empieza) y al acabar avisa con su 'fin'. Si Hikari se aleja o cae, la oleada se hunde y espera a que vuelva. Fichas
   en ASEDIOS; textos en GUION[ficha.textos]. */
"use strict";

/* cada asedio: sitio, textos (en GUION) y aviso al acabar; hora (entorno de noche) y luz que queda en las ventanas de la
   aldea (opcional); dónde brotan (m del centro) y a qué distancia se suspende; s antes de la primera oleada y entre
   oleadas; las oleadas (tipos de Sombra); Yuki (dónde se planta respecto al centro, cada cuántos s suelta el pulso, su
   alcance y daño) y quién se esconde (opcional); si Tasogare mira desde el torii de Hinode; y si la espiral del faro
   sigue apagada mientras dura (y durante el duelo de la plaza) */
const ASEDIOS = {
  asedio: {
    sitio: 'aldea', textos: 'asedio', fin: 'asedioFin', noche: -.7, luces: .3, radio: [9, 15], lejos: 45, primera: 2, descanso: 4,
    oleadas: [
      { tipos: ['rastrera', 'rastrera', 'rastrera'] },
      { tipos: ['rastrera', 'rastrera', 'escudo', 'rastrera'] },
      { tipos: ['rastrera', 'escudo', 'lanzadora', 'rastrera', 'lanzadora'] }
    ],
    yuki: { sitio: [3, -2], cada: 6, radio: 5, daño: 6, color: 0xffd27a },
    esconder: ['tsuru', 'momo'], tasogare: 'torii'
  },
  asalto: {
    sitio: 'faro', textos: 'asalto', fin: 'asaltoFin', radio: [11, 19], lejos: 75, primera: 2.5, descanso: 4,
    oleadas: [
      { tipos: ['rastrera', 'rastrera', 'escudo', 'rastrera'] },
      { tipos: ['rastrera', 'escudo', 'lanzadora', 'rastrera', 'lanzadora', 'rastrera'] }
    ],
    espiral: true
  }
};

const Asedio = (() => {
  let F = null, activo = false, noche = false, ola = 0, fase = 'fuera', t = 0, zona = null, tYuki = 0;
  const centro = () => sitio(F.sitio), textos = () => GUION[F.textos];
  const luces = k => { if (Estr.luzMesh) Estr.luzMesh.material.color.setScalar(k); };
  /* Tasogare mira desde lo alto del torii de la entrada de Hinode */
  function tasogareMira(S) {
    const T = Estr.toriiHinode, x = T.x, y = T.y + T.alto + .1, z = T.z;
    Tasogare.mostrar(true); Tasogare.hojaEntera(false); Tasogare.colocar(x, y, z, Math.atan2(S.x - x, S.z - z)); Tasogare.pose('reposo', 0, true); Tasogare.abrirAlas(0);
  }
  function empezar(id) {
    if (activo) return; F = ASEDIOS[id]; activo = true; noche = F.noche !== undefined; ola = 0; fase = 'descanso'; t = F.primera; tYuki = F.yuki ? F.yuki.cada : 0;
    if (F.luces !== undefined) luces(F.luces);
    for (const n of F.esconder || []) if (Sis.npcs[n]) Sis.npcs[n].g.visible = false;
    // Yuki se planta en la plaza (ocupada: no se para a hablar) y vigila alrededor
    const S = centro(), y = F.yuki && Sis.npcs.yuki; if (y) { const x = S.x + F.yuki.sitio[0], z = S.z + F.yuki.sitio[1]; y.g.position.set(x, altura(x, z), z); y.ir(x, z, GENTE.vel.correr); y.ocupado = true; }
    if (F.espiral) Estr.mostrarEspiral(false);   // la espiral no se enciende hasta despejar la plaza
    if (F.tasogare === 'torii') tasogareMira(S);
    UI.aviso(textos().empieza, 'error');
  }
  /* una oleada: sus Sombras brotan repartidas alrededor del sitio (no en el agua) */
  function lanzar() {
    const S = centro(), O = F.oleadas[ola], n = O.tipos.length; zona = { x: S.x, z: S.z, r: F.radio[1], tipos: O.tipos, estado: 'activa', n: 0, unaVez: true };
    O.tipos.forEach((tipo, i) => {
      let x, z, k = 0; do { const a = (i + Math.random() * .6) / n * TAU, r = rnd(F.radio[0], F.radio[1]); x = S.x + Math.cos(a) * r; z = S.z + Math.sin(a) * r; } while ((altura(x, z) < NIVEL_AGUA + .2 || Sol.dentro(x, altura(x, z) + .8, z, .3)) && ++k < 10);
      Sombras.crear(tipo, x, z, zona); zona.n++;
    });
    fase = 'ola'; Sonido.sfx('latido'); UI.aviso(textos().ola.replace('{n}', ola + 1).replace('{m}', F.oleadas.length), 'error');
  }
  /* Hikari se fue o cayó: la oleada se hunde en el suelo y se repetirá */
  function hundir() { if (!zona) return; for (const s of Sombras.lista.slice()) if (s.zona === zona) { FX.rafaga(s.x, s.y + .3, s.z, 8, 1.5, .5, .16, SOMBRAS_CFG.color.brasa, 1); Sombras.quitar(s); } zona = null; }
  function acabar() {
    activo = false; fase = 'fuera'; zona = null; Sis.marcador(null);
    const y = F.yuki && Sis.npcs.yuki, c = Estr.npcs.yuki; if (y) { y.ocupado = false; if (c) y.ir(c.x, c.z); }
    for (const n of F.esconder || []) if (Sis.npcs[n]) Sis.npcs[n].g.visible = true;
    UI.aviso(textos().fin, 'mision'); Bus.emit(F.fin);
  }
  function actualizar(dt, J) {
    if (((activo && F.espiral) || Duelo.activo) && Estr.espiral[0] && Estr.espiral[0].m.visible) Estr.mostrarEspiral(false);   // apagada hasta despejar la plaza y vencer en el duelo (también al cargar)
    if (!activo) return;
    const S = centro(), d = Math.hypot(J.x - S.x, J.z - S.z), N = F.oleadas.length, T = textos();
    if (d > F.lejos || !J.vivo) { if (fase !== 'espera') { hundir(); fase = 'espera'; } Sis.marcador({ txt: T.vuelve }); return; }
    if (fase === 'espera') { fase = 'descanso'; t = F.primera; }
    if (fase === 'descanso') { t -= dt; Sis.marcador({ txt: T.marcador.replace('{n}', ola + 1).replace('{m}', N), frac: 1 }); if (t <= 0) lanzar(); return; }
    // en plena oleada: cuántas quedan; al caer la última, la siguiente o el final
    const vivas = Sombras.lista.filter(s => s.zona === zona && s.estado !== 'romper').length, total = F.oleadas[ola].tipos.length;
    Sis.marcador({ txt: T.marcador.replace('{n}', ola + 1).replace('{m}', N) + ' · ' + vivas, frac: vivas / total });
    if (zona.n <= 0) { ola++; zona = null; if (ola >= N) acabar(); else { fase = 'descanso'; t = F.descanso; } return; }
    // Yuki: un pulso de luz cuando una Sombra se le acerca
    const Y = F.yuki && Sis.npcs.yuki; tYuki -= dt;
    if (Y && tYuki <= 0) { const p = Y.g.position, Q = F.yuki; if (Sombras.lista.some(s => s.zona === zona && Math.hypot(s.x - p.x, s.z - p.z) < Q.radio)) { Sombras.pulso(p.x, p.z, Q.radio, Q.daño); FX.rafaga(p.x, p.y + 1, p.z, 30, 4, .7, .22, Q.color, 2); Sonido.sfx('pulso', { pos: { x: p.x, y: p.y, z: p.z } }); tYuki = Q.cada; } }
  }
  /* la noche del asedio: el entorno (para aplicarEntorno) mientras dura, hasta que acaba el robo */
  const entorno = e => noche ? ASEDIOS.asedio.noche : e;
  for (const id in ASEDIOS) Bus.on('empieza:' + id, () => empezar(id));
  Bus.on('roboFin', () => { noche = false; luces(1); });
  return { actualizar, entorno, get activo() { return activo; }, get oleada() { return ola; }, get zona() { return zona; } };
})();
