/* === Ecos de Luz · 70-impacto.js ===
   Contrato común de daño de Hikari: un golpe, una onda, un pulso o un proyectil llegan a todos los objetivos por aquí
   (fauna, Sombras, Tasogare, ataduras de Lumi, Luna Roja y gólems). Un arma o magia nueva no repite la lista de objetivos:
   llama a sector, circulo o proyectil. En la práctica solo cuenta Tasogare.
   o = { x, y, z, yaw } · alc = alcance desde el borde del objetivo (m) · ang = semiángulo (rad; Math.PI = alrededor)
   dmg = daño base · op = { peso 1..3, empuje, contra, romper, romperSombra, vertical }
   toc = Set de lo ya tocado por este ataque (un ataque daña una vez a cada uno) · al(x, y, z) = chispas en cada contacto
   Devuelve cuántos objetivos recibieron daño. */
"use strict";

const Impacto = (() => {
  const _o = { x: 0, y: 0, z: 0, yaw: 0 };
  const varia = d => d * (.92 + Math.random() * .16);
  const dentroAlto = (y, base, alto) => y >= base - .4 && y <= base + alto + .4;

  /* ¿hay un sólido entre el origen de una zona (op.origen) y el cuerpo? Una zona de brasa o de hielo no atraviesa una pared (paso de 0,12 m) */
  function ocluido(a, x, y, z) {
    const dx = x - a.x, dy = y - a.y, dz = z - a.z, n = Math.max(1, Math.ceil(Math.hypot(dx, dy, dz) / .12));
    for (let i = 1; i < n; i++) { const u = i / n; if (Sol.dentro(a.x + dx * u, a.y + dy * u, a.z + dz * u, .06)) return true; }
    return false;
  }
  function sector(o, alc, ang, dmg, op, toc, al) {
    op = op || {}; toc = toc || new Set(); const peso = op.peso || 1, empuje = op.empuje !== undefined ? op.empuje : COMBATE.peso.empuje[peso], vert = !!op.vertical;
    let n = 0;
    if (!Practica.activa) {
      for (const a of Fauna.enRango(o.x, o.z, o.yaw, alc, ang)) {
        if (toc.has(a) || (vert && !dentroAlto(o.y, a.y, (a.m.alto || .6) * a.esc))) continue; toc.add(a);
        const dx = a.x - o.x, dz = a.z - o.z, l = Math.hypot(dx, dz) || 1;
        Fauna.golpear(a, varia(dmg), dx / l, dz / l, J, { peso, empuje }); J.ultimoGolpe = a; J.tGolpe = 4; n++;
        if (al) al(a.x - dx / l * a.E.r * a.esc * .5, a.y + .55 * a.esc, a.z - dz / l * a.E.r * a.esc * .5);
      }
      for (const s of Sombras.enRango(o.x, o.z, o.yaw, alc, ang, { y: o.y, vertical: vert })) {
        if (toc.has(s) || (vert && !dentroAlto(o.y, s.y, s.E.alto)) || (op.ocluir && ocluido(op.origen || o, s.x, s.y + s.E.alto * .5, s.z))) continue; toc.add(s);
        const dx = s.x - o.x, dz = s.z - o.z, l = Math.hypot(dx, dz) || 1;
        Sombras.golpear(s, varia(dmg), dx / l, dz / l, { ...op, vertical: vert, origenY: o.y, origen: { x: o.x, y: o.y, z: o.z }, peso, empuje, romper: op.romperSombra !== undefined ? op.romperSombra : op.romper, contra: op.contra }); n++;
        if (al) al(s.x - dx / l * s.E.r * .5, s.y + .45, s.z - dz / l * s.E.r * .5);
      }
    }
    // los que dan su propio sector: Tasogare siempre; el resto, fuera de la práctica
    const aplica = [[Duelo, { peso, contra: op.contra }]];
    if (!Practica.activa) {
      if (typeof LumiEnlaces !== 'undefined') aplica.push([LumiEnlaces, { peso, contra: op.contra }]);
      if (typeof DueloLuna !== 'undefined') aplica.push([DueloLuna, { peso, contra: op.contra, romper: op.romper }]);
    }
    for (const [M, p] of aplica) { if (toc.has(M)) continue; if (M.golpear(o, alc, ang, dmg, p)) { toc.add(M); n++; } }
    if (!Practica.activa && !toc.has(Jefes) && Jefes.golpear(o, alc, ang, dmg, { peso, contra: op.contra })) {
      toc.add(Jefes); n++; const B = Jefes.activo; if (al) al(lerp(o.x, B.x, .5), o.y + 1.2, lerp(o.z, B.z, .5));
    }
    return n;
  }

  /* alrededor de un punto (ondas de choque) */
  function circulo(x, y, z, r, dmg, op, toc, al) { _o.x = x; _o.y = y; _o.z = z; _o.yaw = 0; return sector(_o, r, Math.PI, dmg, op, toc, al); }

  /* un proyectil que va de (x0, y0, z0) a (x1, y1, z1) con radio r: se prueba cada medio radio del recorrido y se detiene en el primer contacto
     (devuelve null o { x, y, z, n }). La altura cuenta: una flecha que pasa por encima de una Sombra no la toca */
  function proyectil(x0, y0, z0, x1, y1, z1, r, dmg, op, toc, al) {
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz), pasos = Math.max(1, Math.ceil(L / Math.max(.3, r * .5))), yaw = Math.atan2(dx, dz);
    op = Object.assign({ vertical: true }, op);
    for (let i = 1; i <= pasos; i++) {
      const u = i / pasos; _o.x = x0 + dx * u; _o.y = y0 + dy * u; _o.z = z0 + dz * u; _o.yaw = yaw;
      const n = sector(_o, r, Math.PI, dmg, op, toc, al); if (n) return { x: _o.x, y: _o.y, z: _o.z, n };
    }
    return null;
  }

  /* pulso de luz: daño alrededor sin dirección (el de la tecla {pulso}) */
  function pulso(x, z, r, dmg) {
    if (!Practica.activa) { Fauna.pulso(x, z, r, dmg); Sombras.pulso(x, z, r, dmg); Jefes.pulso(J, r, dmg); }
    Duelo.pulso(x, z, r);
  }

  return { sector, circulo, proyectil, pulso };
})();
