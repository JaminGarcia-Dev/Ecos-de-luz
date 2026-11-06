/* === Ecos de Luz · 39-escenas.js ===
   Escenas de la Noche Roja y de la pérdida de Tsuru. Cin.robo conserva el acceso histórico al montaje de la pérdida,
   cuya identidad es perdidaTsuru. No roba fragmentos. Dirección local con Cin.util y HiloLuz. */
"use strict";

(() => {
  const C = Cin, { arrancar, cam, suave, resto, yF } = Cin.util, L = lerp;

  /* ---------- LA NOCHE ROJA: el cielo se vuelve rojo sobre Hinode, brotan Sombras y Tasogare habla desde el torii ----------
     Luego se juega el asedio (37-asedio.js) y después Cin.perdidaTsuru.
     NOCHE_ROJA_ESCENA: hora (entorno de noche), a cuántos m del torii queda Hikari, Sombras que brotan alrededor de la plaza
     (cuántas, entre qué radios, cada cuántos s y distancia mínima a la cámara),
     luz que queda en las ventanas y resplandor detrás de Tasogare sobre el torii (para recortar su silueta) */
  const NOCHE_ROJA_ESCENA = { noche: -.7, hikari: 7, sombras: { n: 7, radio: [6, 14], cada: .6, lejosCam: 6 }, luces: .12, contraluz: { color: 0xff3a24, opacidad: .45, tam: 7 } };
  const lucesAldea = k => { if (Estr.luzMesh) Estr.luzMesh.material.color.setScalar(k); };
  /* Sombras de escena (no pelean): humo que sube del suelo y dos ojos rojos que miran a un punto. SOMBRA_VIS: tamaño de los
     ojos, s que tardan en salir y humo por segundo; s.k (0…1) las desvanece; tam: su tamaño (las del cerco a Momo, más pequeñas) */
  const SOMBRA_VIS = { ojos: .32, sube: 1, humo: 24 };
  function sombraVis(x, z, mx, mz, tam) {
    const y = altura(x, z), ojos = [new Halo(0xff3a24, 0), new Halo(0xff3a24, 0)];
    ojos.forEach(o => { o.scale.set(SOMBRA_VIS.ojos, SOMBRA_VIS.ojos, 1); scene.add(o); resto(o); }); Sonido.sfx('sombraBrota', { pos: { x, y, z } });
    return { x, z, y, t: 0, ojos, yaw: Math.atan2(mx - x, mz - z), k: 1, tam: tam || 1 };
  }
  function moverSombrasVis(lista, dt) {
    for (const s of lista) {
      s.t += dt; const k = smooth(0, SOMBRA_VIS.sube, s.t), h = L(-.3, 1.05, k), lx = Math.cos(s.yaw) * .09, lz = -Math.sin(s.yaw) * .09;
      s.ojos.forEach((o, j) => { const sg = j ? 1 : -1; o.position.set(s.x + lx * sg + Math.sin(s.yaw) * .2, s.y + h, s.z + lz * sg + Math.cos(s.yaw) * .2); o.opacidad = k * .95 * s.k; });
      if (s.k > .05 && Math.random() < dt * SOMBRA_VIS.humo * s.k * s.tam) FX.humo(s.x + rnd(-.35, .35) * s.tam, s.y + rnd(0, h + .2), s.z + rnd(-.35, .35) * s.tam, rnd(-.1, .1), rnd(.3, .8), rnd(-.1, .1), rnd(1, 1.8), rnd(.5, .9) * s.tam, 0x0b0709, .8);
    }
  }
  C.nocheRoja = function (cb) {
    const N = NOCHE_ROJA_ESCENA, S = sitio('aldea'), T = Estr.toriiHinode, dl = Math.hypot(T.x - S.x, T.z - S.z), dx = (T.x - S.x) / dl, dz = (T.z - S.z) / dl;
    const H = [T.x - dx * N.hikari, T.z - dz * N.hikari], yawH = Math.atan2(dx, dz), yH = sueloEnJ(H[0], S.h + 3, H[1]), yTop = T.y + T.alto + .1;
    const ocultos = Object.values(Sis.npcs).filter(n => n.g.visible && Math.hypot(n.g.position.x - S.x, n.g.position.z - S.z) < 45); ocultos.forEach(n => n.g.visible = false);
    UI.hud(false); UI.fundido(1, 0); C.colocarJugador(H[0], H[1], yawH); Hikari.mostrar(true); Hikari.mover(H[0], yH, H[1], yawH); Lumi.grupo.visible = false;
    Sis.ST.cieloRojo = true; let sombras = [];
    const lista = [
      // 1. Hinode de noche: el cielo pasa de negro a rojo y las nubes se encienden en carmesí
      { dur: 6, txt: null, in() { UI.fundido(0, 1200); Atmosfera.rojo(0); Sonido.sfx('latido'); },
        f(u, tt, dt) { Atmosfera.rojo(smooth(.6, 5.2, tt)); aplicarEntorno(N.noche, 0); const q = suave(u); cam(S.x - dx * L(26, 22, q), S.h + L(13, 11, q), S.z - dz * L(26, 22, q), T.x, T.y + L(8, 12, q), T.z); } },
      // 2. brotan Sombras alrededor de la plaza y las luces de la aldea se apagan
      { dur: 6, txt: null, in() { sombras = []; },
        f(u, tt, dt) {
          aplicarEntorno(N.noche, 0); lucesAldea(L(1, N.luces, smooth(.5, 4.5, tt)));
          const n = Math.min(N.sombras.n, Math.floor(tt / N.sombras.cada) + 1); const px = -dz, pz = dx, cx = S.x + px * 9 - dx * 3, cz = S.z + pz * 9 - dz * 3;
          while (sombras.length < n) { let x, z, k = 0; do { const a = sombras.length / N.sombras.n * TAU + .4 + k * .5, r = rnd(N.sombras.radio[0], N.sombras.radio[1]); x = S.x + Math.cos(a) * r; z = S.z + Math.sin(a) * r; k++; } while (Math.hypot(x - cx, z - cz) < N.sombras.lejosCam && k < 8); sombras.push(sombraVis(x, z, H[0], H[1])); }
          moverSombrasVis(sombras, dt); cam(cx, S.h + 1.7, cz, S.x - px * 2 + dx * 4, S.h + 1.2, S.z - pz * 2 + dz * 4);
        } },
      // 3. Tasogare, de pie sobre el torii de la entrada, con la capa abierta como alas
      { dur: 8, txt: GUION.tasogare.nocheRoja, in() { Tasogare.mostrar(true); Tasogare.hojaEntera(false); Tasogare.colocar(T.x, yTop, T.z, Math.atan2(H[0] - T.x, H[1] - T.z)); Tasogare.pose('hablar', 0, true); Tasogare.abrirAlas(1); Sonido.sfx('latido');
          const C = N.contraluz, h = new Halo(C.color, C.opacidad); h.scale.set(C.tam, C.tam, 1); h.position.set(T.x + dx * .8, yTop + 1.5, T.z + dz * .8); scene.add(h); resto(h); },
        f(u, tt, dt) { aplicarEntorno(N.noche, 0); lucesAldea(N.luces); moverSombrasVis(sombras, dt); const q = suave(u), px = -dz, pz = dx; cam(T.x - dx * L(6.6, 6, q) + px * .3, T.y + .6, T.z - dz * L(6.6, 6, q) + pz * .3, T.x, yTop + 1.5, T.z); } }   // desde debajo del torii: él y el cielo rojo
    ];
    // sigue el asedio (la misión lo lanza): la noche y las luces bajas siguen; Tasogare se queda en el torii
    const fin = () => { Atmosfera.rojo(1); ocultos.forEach(n => n.g.visible = true); Lumi.grupo.visible = true; Hikari.mostrar(true); UI.hud(true); if (cb) cb(); };
    arrancar(lista, fin, 'nocheRoja');
  };
  /* ---------- LA PÉRDIDA DE TSURU: seis planos, 45 s; el nombre robo solo conserva el acceso histórico ---------- */
  /* ¿se ve b desde a sin atravesar una construcción? (a y b: [x, y, z]) */
  const vistaLibre = (a, b) => { for (let i = 1; i < 10; i++) { const t = i / 10; if (Sol.dentro(L(a[0], b[0], t), L(a[1], b[1], t), L(a[2], b[2], t), .15)) return false; } return true; };
  /* primer punto alrededor de (cx, cz), a alguna de las distancias, a la altura y, libre con margen m y (si se da) con vista
     a 'mira'; empieza a buscar en el ángulo a0 */
  function sitioLibre(cx, cz, radios, y, m, mira, a0) {
    for (const r of radios) for (let k = 0; k < 24; k++) { const a = (a0 || 0) + (k % 2 ? 1 : -1) * Math.ceil(k / 2) / 24 * TAU, x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r;
      if (Sol.dentro(x, y, z, m) || (mira && !vistaLibre([x, y, z], mira))) continue; return { x, z, a }; }
    return { x: cx + Math.sin(a0 || 0) * radios[0], z: cz + Math.cos(a0 || 0) * radios[0], a: a0 || 0 };
  }
  C.robo = function (cb, op) {
    op = op || {};
    const cap = Sis.ST.inicio.cap || {}, visto = !!(cap.montajes && cap.montajes.perdidaTsuru || Sis.ST.ausentes.tsuru), consulta = !!op.consulta;
    if (op.consulta && !visto) return false;
    const M = C.util.montaje('perdidaTsuru', 4103), H = M.hilo, S = sitio('aldea'), ct = Estr.npcs.tsuru;
    const centro = sitioLibre(S.x, S.z, [6, 7.5, 9], S.h + .8, 3.2, null, Math.atan2(ct.x - S.x, ct.z - S.z));
    const yaw = centro.a, ux = Math.sin(yaw), uz = Math.cos(yaw), px = Math.cos(yaw), pz = -Math.sin(yaw);
    const punto = (x, z) => { const a = centro.x + px * x + ux * z, b = centro.z + pz * x + uz * z; return new THREE.Vector3(a, sueloEnJ(a, S.h + 3, b), b); };
    const PM = punto(0, 0), PT = punto(0, 1.2), PA = punto(0, 3.6), PY = punto(-1.2, -4), PH = punto(1.5, -.3), salida = punto(0, -2);
    const restaurarH = C.util.guardarObjeto(Hikari.root), jugador = { x: J.x, y: J.y, z: J.z, yaw: J.yaw };
    const ocultos = ['tsuru', 'momo', 'yuki'].map(id => Sis.npcs[id]).filter(Boolean).map(n => ({ n, visible: n.g.visible }));
    ocultos.forEach(v => v.n.g.visible = false);
    const doble = id => {
      const n = Gente.crear({ ...FICHAS_NPC[id], nombre: '', rutina: { tipo: 'quieto' } });
      n.g.name = id + '_montaje'; n.ocupado = true; n.g.traverse(o => { if (o.isSprite) o.visible = false; }); M.g.add(n.g); return n;
    };
    const tsuru = doble('tsuru'), momo = doble('momo'), yuki = doble('yuki'), farol = tsuru.farol;
    const padreFarol = farol.parent, farolPos = farol.position.clone(), farolEsc = farol.scale.clone(), farolGiro = farol.quaternion.clone();
    const desvanecer = C.util.desvanecer([tsuru.g], farol);
    const cuerpo = pieza(new THREE.SphereGeometry(.35, 10, 8), 0x17121f, { y: .65, sy: 1.8 });
    const brazo = pieza(new THREE.CylinderGeometry(.09, .09, 2.0, 6), 0x17121f, { y: 1, z: 1.35, rx: Math.PI / 2 });
    const geo = fusionar([cuerpo, brazo]), base = geo.attributes.position.array.slice(), at = geo.attributes.position;
    // Mismo programa de Sombras, con su uniforme de tiempo ligado al plano para retener y repetir la silueta.
    const tinta = Sombras.materialMate(), material = tinta.clone(), relojSombra = { value: 0 };
    material.onBeforeCompile = sh => { tinta.onBeforeCompile(sh); sh.uniforms.uT = relojSombra; };
    material.customProgramCacheKey = tinta.customProgramCacheKey;
    const sombra = new THREE.Mesh(geo, material); sombra.name = 'Sombra_atacante'; M.g.add(sombra);
    const ojos = [new Halo(0xff3a24, .7), new Halo(0xff3a24, .7)]; ojos.forEach(h => { h.scale.setScalar(.13); M.g.add(h); });
    const posT = PT.clone(), posM = PM.clone(), posH = PH.clone(), farolSuelo = PT.clone(), golpe = PT.clone().add(new THREE.Vector3(0, 1, 0));
    sombra.position.copy(PA); sombra.rotation.y = yaw + Math.PI; sombra.updateMatrixWorld(true);
    const destinoAtaque = sombra.worldToLocal(golpe.clone()), puntaAtaque = new THREE.Vector3();
    const giroCaida = new THREE.Quaternion(); let solto = false, recogido = false, pulso = false, golpeFarol = false, yCaida = PT.y;
    const lente = [50, 46, 50, 44, 42, 48], dur = [6, 7, 8, 9, 9, 6];
    const sonidos = [[[.7, 'paso', { sup: 'madera', vol: .25 }]], [[1, 'paso', { vol: .25 }]],
      [[.6, 'corte', { vol: .25 }], [1.2, 'golpe', { peso: .4, vol: .2 }], [3.5, 'koto', { vol: .25 }]],
      [], [[4.6, 'esquiva', { vol: .15 }]], []];
    const colocarFarol = () => {
      padreFarol.add(farol); farol.position.copy(farolPos); farol.scale.copy(farolEsc); farol.quaternion.copy(farolGiro); farol.visible = true;
    };
    const soltar = () => {
      tsuru.g.updateMatrixWorld(true); farol.getWorldPosition(farolSuelo);
      const q = farol.getWorldQuaternion(new THREE.Quaternion()), s = farol.getWorldScale(new THREE.Vector3());
      M.g.add(farol); farol.position.copy(farolSuelo); farol.quaternion.copy(q); giroCaida.copy(q); farol.scale.copy(s); solto = true;
      yCaida = sueloEnJ(farolSuelo.x, PT.y + 2, farolSuelo.z) + FAROL.alto + .05;
    };
    const camaras = dur.map((_, k) => {
      const dist = [7, 5, 5.5, 4.8, 3.5, 5][k], alto = [1.5, 1.2, 1.25, 1.2, .85, 1.2][k];
      const objetivo = k === 4 ? PT : punto(0, .65);
      const c = sitioLibre(objetivo.x, objetivo.z, [dist, dist + .5], objetivo.y + alto, .3, [objetivo.x, objetivo.y + .8, objetivo.z], yaw + Math.PI / 2);
      return { c, objetivo, alto, dist: Math.hypot(c.x - objetivo.x, c.z - objetivo.z) };
    });
    const vista = (k, u) => {
      const { c, objetivo, alto, dist } = camaras[k], q = 1 + (k === 5 ? u * .4 : k === 1 ? -u * .4 : 0) / dist;
      cam(objetivo.x + (c.x - objetivo.x) * q, objetivo.y + alto, objetivo.z + (c.z - objetivo.z) * q, objetivo.x, objetivo.y + .75, objetivo.z);
    };
    const entrada = k => {
      M.alEntrar(k, sonidos[k]); M.lente(lente[k]); solto = recogido = pulso = golpeFarol = false;
      desvanecer.restaurar(); tsuru.g.visible = k <= 3; sombra.visible = k <= 3; colocarFarol();
      posT.copy(k === 0 ? punto(-1.6, .5) : PT); posM.copy(k >= 2 ? salida : PM); posH.copy(k >= 5 ? punto(.7, -.6) : PH);
      C.util.posarDoble(tsuru, posT, yaw, k > 0 ? 'proteger' : 'quieta');
      C.util.posarDoble(momo, posM, yaw, k >= 4 ? 'vacio' : 'quieta'); C.util.posarDoble(yuki, PY, yaw, 'vacio');
      Hikari.mostrar(true); Hikari.llevaFarol(k >= 5); Hikari.mover(posH.x, posH.y, posH.z, yaw);
      if (k >= 4) { soltar(); farol.position.y = yCaida; farol.quaternion.identity(); farol.visible = k === 4; }
      if (k >= 5) recogido = true;
      if (k === 3) { H.tiempo = -4.5; H.onda(golpe, new THREE.Vector3(0, 1, 0), { desde: .4, hasta: 4, dur: .8 }); H.tiempo = 0; }
      vista(k, 0);
    };
    const planos = dur.map((d, k) => ({ dur: d, fundir: k === 5 ? 1 : 0,
      in() { entrada(k); },
      f(u, t, dt) {
        if (C.util.congelado() && dt > 0) return;
        M.paso(t, dt); relojSombra.value = t; aplicarEntorno(NOCHE_ROJA_ESCENA.noche, 0);
        if (k === 0) M.texto('C4T01', .4, t);
        if (k === 1) { M.texto('C4T02', .5, t); posT.lerpVectors(punto(-1.6, .5), PT, smooth(0, 3, t)); posM.lerpVectors(PM, salida, smooth(4, 7, t)); }
        C.util.posarDoble(tsuru, posT, yaw, k >= 1 ? 'proteger' : 'quieta', k === 1 && t < 3 ? t * TAU * 1.3 : undefined);
        C.util.posarDoble(momo, posM, yaw, k >= 4 && t >= .8 ? 'vacio' : 'quieta', k === 1 && t > 4 ? (t - 4) * TAU * 1.3 : undefined);
        if (k === 2 && t >= 1.2) tsuru.g.getObjectByName('columna').rotation.x = .10;
        const retroceso = k === 3 ? smooth(0, 2, t) * 2.5 : 0;
        sombra.position.copy(PA).addScaledVector(new THREE.Vector3(ux, 0, uz), retroceso); sombra.rotation.y = yaw + Math.PI;
        const ataque = k === 2 ? smooth(.6, 1.2, t) * (1 - smooth(1.32, 1.7, t)) : 0;
        for (let j = 0; j < base.length; j += 3) {
          const brazo = base[j + 2] > .4, tramo = (base[j + 2] - .4) / 1.95;
          at.array[j] = base[j]; at.array[j + 1] = base[j + 1] + (brazo ? tramo * ataque * (destinoAtaque.y - 1) : 0);
          at.array[j + 2] = brazo ? .4 + tramo * ataque * (destinoAtaque.z - .4) : base[j + 2];
        }
        at.needsUpdate = true;
        ojos.forEach((h, j) => { h.position.copy(sombra.position).add(new THREE.Vector3(px * (j ? .09 : -.09), .9, pz * (j ? .09 : -.09))); h.opacidad = sombra.visible ? .7 : 0; });
        if (k === 0) M.motas('humo', PA, t, 0, 6, 48, { polvo: true, color: 0x211c2d, vidaMax: 1, alto: .5, tam: .3 });
        if (k === 2 && t >= 1.2 && !M.datos.contacto) {
          sombra.updateMatrixWorld(true); puntaAtaque.copy(destinoAtaque).applyMatrix4(sombra.matrixWorld);
          M.datos.contacto = true; M.datos.errorContacto = puntaAtaque.distanceTo(golpe); C.util.congelar(.04);
        }
        if (k === 2 && t >= 3.5 && !pulso) { pulso = true; H.onda(golpe, new THREE.Vector3(0, 1, 0), { desde: .4, hasta: 4, dur: .8 }); }
        if (k === 2) M.motas('pulso', golpe, t, 3.5, 3.65, 32, { alto: .05, ancho: .2, velMax: .7, color: 0xffe2b0 });
        if (k === 3) {
          M.motas('tsuru', PT, t, 2, 5, 72, { color: 0xffe2b0 }); desvanecer.poner(1 - smooth(2, 5, t));
          if (t >= 5 && !solto) soltar(); tsuru.g.visible = t < 5;
          if (solto) {
            const cae = Math.max(0, t - 5); farol.position.copy(farolSuelo); farol.position.y = Math.max(yCaida, farolSuelo.y - 4.9 * cae * cae);
            farol.quaternion.copy(giroCaida).slerp(new THREE.Quaternion(), smooth(5, 6, t));
            if (farol.position.y <= yCaida && !golpeFarol) { golpeFarol = true; if (dt > 0) M.sonar('golpe', { peso: .2, vol: .15 }); }
          }
          M.datos.farolEnSuelo = solto && farol.position.y <= yCaida;
        }
        if (k === 4) {
          M.texto('C4T03', .8, t); const c = smooth(0, 4, t); posH.lerpVectors(PH, punto(.7, .6), c);
          if (t >= 4.6) { recogido = true; farol.visible = false; Hikari.llevaFarol(true); }
        }
        if (farol.userData.brasa) { farol.userData.brasa.scale.setScalar(k >= 3 ? .55 : lerp(.55, .8, k === 1 ? smooth(3, 4, t) : k >= 2 ? 1 : 0)); farol.userData.brasa.opacidad = .6; }
        const qH = clamp(t / 4, 0, 1), pasoH = k === 4 ? 6 * qH * (1 - qH) / 4 : 0, finH = punto(.7, .6);
        const vx = (finH.x - PH.x) * pasoH, vz = (finH.z - PH.z) * pasoH;
        Hikari.mover(posH.x, posH.y, posH.z, yaw + Math.PI); M.posarHikari({ vel: Math.hypot(vx, vz), vx, vz,
          recoger: k === 4 && t >= 4 && t < 5 ? Math.sin((t - 4) * Math.PI) : 0, tender: k === 5 ? .7 : 0 }, dt);
        vista(k, u); M.efectos(t, dt); if (k === 5) M.fundir(t, 5, 6);
        M.datos.recogido = recogido; M.datos.tsuruVisible = tsuru.g.visible;
      }
    }));
    arrancar(planos, () => {
      if (!M.cerrar()) return;
      desvanecer.restaurar(); ocultos.forEach(v => v.n.g.visible = v.visible);
      for (const n of [tsuru, momo, yuki]) C.util.liberarDoble(n);
      if (farol.parent) farol.parent.remove(farol); farol.traverse(o => { if (o.isMesh) o.geometry.dispose(); if (o instanceof Halo) Halo.activos.delete(o); });
      M.g.remove(sombra); geo.dispose(); material.dispose(); ojos.forEach(h => { M.g.remove(h); Halo.activos.delete(h); });
      if (consulta) { restaurarH(); Hikari.mover(jugador.x, jugador.y, jugador.z, jugador.yaw); Hikari.llevaFarol(!!Sis.tiene('farol')); }
      else {
        C.util.finalizarUnaVez('perdidaTsuru', () => {
          C.util.silencioPerdida(); if (!Sis.tiene('farol')) Sis.dar('farol', 1, true);
          if (!Sis.ST.ausentes.tsuru) Sis.perder('tsuru', 'momo');
          // Compatibilidad de 37: solo cierra la noche del asedio. No roba inventario ni cambia la identidad.
          Bus.emit('roboFin', { escena: 'perdidaTsuru' }); Bus.emit('perdidaTsuruFin');
        });
        Hikari.reiniciarAnimacion(); M.posarHikari({}, 0); Hikari.llevaFarol(true);
        C.colocarJugador(salida.x, salida.z, yaw + Math.PI, salida.y); Hikari.mover(J.x, J.y, J.z, J.yaw); Lumi.grupo.position.copy(Lumi.pos); Atmosfera.rojo(1);
        Sis.guardar(); if (cb) cb();
      }
      if (consulta && op.consulta && cb) cb();
    }, 'perdidaTsuru');
    return true;
  };
})();
