/* === Ecos de Luz · 75-variantes-sombra.js ===
   Catálogo de fase 7. Amplía Sombras: mismas puertas de daño, parada, pulso y permisos.
   Las resistencias son parciales. Recuperar o perder la postura abre el cuerpo entero. */
"use strict";

(() => {
  const S = Sombras, V = S.variantes, C = SOMBRAS_CFG;
  Object.assign(SOMBRAS, {
    espejo: { ia: 'escudo', animo: 34, daño: 10, vel: 2.6, r: .55, alto: 1.5, motas: 5, aviso: .8, recupera: 1, espera: [1.4, 2.4], pulso: 1, ojos: [1.3, .24], coste: 1,
      golpe: { alcance: 2, arco: 1.6, activo: .16 }, guardia: { arco: 130 * Math.PI / 180, giro: 90 * Math.PI / 180 }, orbita: [1.9, 2.6],
      defensa: { elemento: 'luz', recibe: .7, frontal: true }, sonidoAviso: 'cristal', sonidoDefensa: 'tick',
      color: { cuerpo: 0x121220, lomo: 0xa5a9bd, ojos: 0xffe3af },
      pista: 'El rombo protege el frente. Rodea a la Sombra o golpea cuando se abra.' },
    devoradora: { ia: 'devora', animo: 36, daño: 10, vel: 2.7, r: .55, alto: 1.6, motas: 5, aviso: .9, recupera: 1.4, espera: [1.5, 2.7], pulso: 1.5, ojos: [1.3, .25], coste: 1,
      golpe: { alcance: 2.6, arco: Math.PI * 2, activo: .2 }, orbita: [2.4, 3.2], defensa: { elemento: 'oscuridad', recibe: .7 }, sonidoAviso: 'acecho', sonidoDefensa: 'gruñido',
      color: { cuerpo: 0x140e20, lomo: 0x634278, ojos: 0xd5a5f2 },
      pista: 'La devoradora cierra sus costillas. Su cuerpo se abre después de la descarga.' },
    escoria: { ia: 'escudo', animo: 40, daño: 12, vel: 1.9, r: .65, alto: 1.6, motas: 6, aviso: .9, recupera: 1.2, espera: [1.7, 2.8], pulso: 1, ojos: [1.36, .26], coste: 2,
      golpe: { alcance: 2.3, arco: 1.8, activo: .22 }, guardia: { arco: 120 * Math.PI / 180, giro: 80 * Math.PI / 180 }, orbita: [2, 2.6],
      defensa: { elemento: 'brasa', recibe: .72, perforada: .8 }, sonidoAviso: 'avisoAtaque', sonidoDefensa: 'bloqueo',
      color: { cuerpo: 0x201710, lomo: 0x80583b, ojos: 0xffb05c },
      pista: 'La escoria atenúa la brasa. Castiga la abertura después de su golpe.' },
    alada: { ia: 'alada', animo: 28, daño: 11, vel: 4, r: .6, alto: 1.1, motas: 6, aviso: .9, recupera: 1.4, espera: [1.4, 2.2], pulso: 1, ojos: [.8, .24], coste: 2,
      golpe: { alcance: 1.6, arco: 1.8, activo: .22 }, picado: { dur: .8, vel: 7 }, vuelo: { alto: 3.1, suelo: .25, maximo: 5, ascenso: 4, descenso: .3 },
      defensa: { elemento: 'brasa', recibe: .72 }, sonidoAviso: 'sombraLanza', sonidoDefensa: 'sombraBrota',
      color: { cuerpo: 0x1b1014, lomo: 0xc07850, ojos: 0xffcf9c },
      pista: 'La alada baja antes de atacar. Tras el picado queda al alcance.' },
    lanzadoraEscarcha: { ia: 'lanza', animo: 24, daño: 8, vel: 2.2, r: .45, alto: 1.6, motas: 5, aviso: .8, recupera: 1.05, espera: [2, 3.2], pulso: 1.5, ojos: [1.4, .18], coste: 1,
      esquirla: { vel: 11, vida: 2, r: .2, devuelta: 26 }, distancia: [7, 11], huye: 4, retirada: { distancia: 1, espera: 3.4 },
      defensa: { elemento: 'escarcha', recibe: .7, perforada: .8 }, sonidoAviso: 'cristal', sonidoDefensa: 'tick',
      color: { cuerpo: 0x0e1722, lomo: 0x62969e, esquirla: 0xa4e4ef, ojos: 0xc0f5ff },
      pista: 'Las placas atenúan la escarcha. Devuelve su esquirla o ataca al bajar el brazo.' },
    oniAnclado: Object.assign({}, SOMBRAS.oniAvanzado, { nom: 'Oni anclado', arte: 'oniAnclado', coste: 2,
      defensa: { elemento: 'viento', recibe: .7, equilibrio: .7, empuje: .25 }, sonidoAviso: 'avisoAtaque', sonidoDefensa: 'bloqueo',
      color: { cuerpo: 0x121a17, lomo: 0x6e8777, ojos: 0xb6dfc5 },
      pista: 'El oni anclado golpea dos veces. Espera el segundo golpe o para la maza.' })
  });

  /* arte sustituible. Cuerpos fusionados; solo el rombo y las alas se articulan aparte. */
  const A = V.arteBase;
  Object.assign(V.arte, {
    espejo(k, P) { A.escudo(k, P); },
    espejoCara(k, P) { P.push(pieza(new THREE.OctahedronGeometry(1, 0), 0xc8cbd5, { sx: .42, sy: .55, sz: .06 })); },
    devoradora(k, P) {
      A.escudo(k, P);
      P.push(pieza(new THREE.OctahedronGeometry(.3, 0), k.lomo, { y: 1.05, z: .12, sy: 1.7 }));
    },
    costilla(k, P) { for (let i = 0; i < 3; i++) P.push(pieza(new THREE.ConeGeometry(.06, .5, 4), 0x634278, { y: (i - 1) * .17, z: .15, rz: Math.PI / 2 })); },
    escoria(k, P) {
      A.escudo(k, P);
      for (const lado of [-1, 1]) P.push(pieza(new THREE.OctahedronGeometry(.45, 0), k.lomo, { x: lado * .36, y: 1, sy: 1.35, sz: .6 }));
    },
    alada(k, P) {
      P.push(pieza(new THREE.OctahedronGeometry(.4, 0), k.cuerpo, { y: .5, sx: .65, sy: 1.15, sz: .65 }));
      P.push(pieza(new THREE.OctahedronGeometry(.2, 0), k.lomo, { y: .9, z: .14 }));
      for (const lado of [-1, 1]) P.push(pieza(new THREE.ConeGeometry(.06, .6, 4), k.cuerpo, { x: lado * .18, y: .28, rx: Math.PI }));
    },
    ala(k, P) { P.push(pieza(new THREE.ConeGeometry(.6, 1.65, 3), 0x955f4a, { x: .7, rx: Math.PI / 2, rz: -Math.PI / 2, sy: .1 })); },
    lanzadoraEscarcha(k, P) {
      A.lanzadora(k, P);
      for (const lado of [-1, 1]) P.push(pieza(new THREE.OctahedronGeometry(.24, 0), k.lomo, { x: lado * .24, y: 1.1, sy: 2, sz: .45 }));
    },
    oniAnclado(k, P) {
      A.oni(k, P);
      for (const lado of [-1, 1]) P.push(pieza(new THREE.CylinderGeometry(.34, .5, .38, 5), k.lomo, { x: lado * .34, y: .19, z: .12 }));
    }
  });
  V.iniciar = (s, geometria) => {
    if (s.tipo === 'espejo') {
      s.placas = [-1, 1].map(lado => {
        const m = new THREE.Mesh(geometria('espejoCara'), S.material());
        m.position.set(lado * .12, .95, .5); s.m.add(m); return m;
      });
    }
    if (s.tipo === 'devoradora') s.costillas = [-1, 1].map(lado => {
      const m = new THREE.Mesh(geometria('costilla'), S.materialMate());
      m.position.set(lado * .12, 1, .22); s.m.add(m); return m;
    });
    if (s.E.vuelo) {
      s.baseVuelo = s.y; s.y += s.E.vuelo.alto; s.aireT = 0;
      s.alas = [-1, 1].map(lado => {
        const m = new THREE.Mesh(geometria('ala'), S.material());
        m.position.set(0, .7, 0); m.scale.set(lado, 1, 1); s.m.add(m); return m;
      });
    }
  };

  function abierta(s) { return ['recuperar', 'herido', 'aturdido', 'roto', 'tambaleo', 'volver'].includes(s.estado); }
  function defendiendo(s) { return !abierta(s) && !['brotar', 'romper'].includes(s.estado); }
  V.defensa = (s, dmg, op, ux, uz) => {
    const D = s.E.defensa;
    if (!D || !defendiendo(s)) return { dmg, op };
    const frontal = !D.frontal || (['acechar', 'aviso'].includes(s.estado) && Math.abs(angDif(s.yaw, Math.atan2(-ux, -uz))) < s.E.guardia.arco / 2);
    if (op.elemento !== D.elemento || !frontal) return { dmg, op };
    // Una flecha sigue siendo luz. Perforar cuerpos no elimina el rombo.
    const recibe = op.perfora && !op.arco && D.perforada !== undefined ? D.perforada : D.recibe;
    const ajustada = Object.assign({}, op);
    if (D.equilibrio !== undefined) ajustada.equilibrioSombra = D.equilibrio;
    if (D.empuje !== undefined && op.empuje !== undefined) ajustada.empuje = op.empuje * D.empuje;
    // Señal por contacto, limitada para que un haz no dispare sonidos cada fotograma.
    const ahora = U.uT.value;
    if (s.defensaT === undefined || ahora - s.defensaT >= .22) {
      s.defensaT = ahora;
      const y = s.y + s.E.alto * .6;
      for (const lado of [-1, 1]) FX.rafaga(s.x - ux * s.E.r + lado * .12, y, s.z - uz * s.E.r, 3, .6, .18, .05, s.E.color.lomo, 1);
      Sonido.sfx(s.E.sonidoDefensa, { f: 65, pos: { x: s.x, y, z: s.z } });
      if (!s.defensaAvisada) { s.defensaAvisada = true; UI.aviso(s.E.pista, 'mision'); }
    }
    return { dmg: dmg * recibe, op: ajustada };
  };

  /* alada: la altura real vive en s.y. El cuerpo y los proyectiles usan el mismo volumen.
     No produce daño sin permiso. Si el director la retiene, baja sin atacar a los cinco segundos. */
  function recuperar(s) { s.estado = 'recuperar'; s.t = 0; s.aireT = 0; }
  function actualizarDevoradora(s, dt, J, d, dx, dz, vivo) {
    const E = s.E;
    if (s.estado !== 'acechar') V.mover(s, dt, s.x, s.z, 0);
    switch (s.estado) {
      case 'brotar': if (s.t >= C.brotar) { s.estado = 'acechar'; s.t = 0; } break;
      case 'acechar': {
        V.girar(s, Math.atan2(dx, dz), dt, 4);
        const a = Math.atan2(-dx, -dz) + s.ang * .18;
        V.mover(s, dt, J.x + Math.sin(a) * s.orb, J.z + Math.cos(a) * s.orb, s.esperaPermiso ? s.velEspera : E.vel);
        if (vivo && s.cd <= 0 && d < E.golpe.alcance + E.r && Math.abs(J.y - s.y) < C.altoAtaque) V.pedirAtaque(s, J, d);
        break;
      }
      case 'aviso':
        V.apuntar(s, J, E.aviso, dt);
        if (s.t >= E.aviso) { s.estado = 'golpe'; s.t = 0; V.contacto(s, J, vivo); }
        break;
      case 'golpe':
        if (s.t < E.golpe.activo) V.contacto(s, J, vivo);
        if (s.estado === 'golpe' && s.t >= E.golpe.activo) recuperar(s);
        break;
      case 'recuperar': if (s.t >= E.recupera) { V.liberarAtaque(s); s.estado = 'acechar'; s.t = 0; s.cd = rnd(...E.espera); s.esperaPermiso = false; } break;
      case 'herido': if (s.t >= C.herido) { s.estado = 'acechar'; s.t = 0; s.cd = Math.max(s.cd, .5); } break;
      case 'aturdido': if (s.t >= C.aturdido) recuperar(s); break;
      case 'romper': if (s.t >= C.romper) S.quitar(s); break;
    }
    // Conserva la reacción al golpe y los empujes que no pertenecen a su defensa.
    if (!s.fija) { s.x += s.vx * dt; s.z += s.vz * dt; s.vx *= Math.exp(-6 * dt); s.vz *= Math.exp(-6 * dt); }
    return true;
  }
  V.actualizar = (s, dt, J, d, dx, dz, vivo) => {
    if (s.E.ia === 'devora') return actualizarDevoradora(s, dt, J, d, dx, dz, vivo);
    if (!s.E.vuelo) return false;
    const E = s.E, F = E.vuelo;
    if (s.estado !== 'acechar' && s.estado !== 'picado') V.mover(s, dt, s.x, s.z, 0);
    if (!s.fija) { s.x += s.vx * dt; s.z += s.vz * dt; s.vx *= Math.exp(-6 * dt); s.vz *= Math.exp(-6 * dt); }
    if (s.estado === 'acechar' || s.estado === 'aviso') s.aireT += dt;
    switch (s.estado) {
      case 'brotar': if (s.t >= C.brotar) { s.estado = 'acechar'; s.t = 0; } break;
      case 'acechar': {
        V.girar(s, Math.atan2(dx, dz), dt, 5);
        const r = Math.max(2, d - E.vel * dt), a = Math.atan2(-dx, -dz) + s.ang * .12;
        V.mover(s, dt, J.x + Math.sin(a) * r, J.z + Math.cos(a) * r, s.esperaPermiso ? s.velEspera : E.vel);
        if (vivo && s.cd <= 0 && s.aireT <= F.maximo - E.aviso - E.picado.dur && d < E.picado.vel * E.picado.dur && Math.abs(J.y - s.baseVuelo) < C.altoAtaque && V.pedirAtaque(s, J, d)) break;
        if (s.aireT >= F.maximo - F.descenso) { V.liberarAtaque(s); recuperar(s); }
        break;
      }
      case 'aviso':
        V.apuntar(s, J, E.aviso, dt);
        if (s.t >= E.aviso) {
          s.estado = 'picado'; s.t = 0; s.inicioPicado = s.y; s.saltoU = 0;
          s.recorrido = Math.min(E.picado.vel * E.picado.dur, Math.max(0, Math.hypot(s.objX - s.x, s.objZ - s.z) - .4));
          s.mx = s.mz = 0;
        }
        break;
      case 'picado': {
        const u = Math.min(1, s.t / E.picado.dur), paso = (u - s.saltoU) * s.recorrido;
        if (!s.fija) { s.x += Math.sin(s.yaw) * paso; s.z += Math.cos(s.yaw) * paso; }
        s.saltoU = u;
        s.y = lerp(s.inicioPicado, s.baseVuelo + F.suelo, u);
        if (s.t >= E.picado.dur - E.golpe.activo) V.contacto(s, J, vivo);
        if (s.estado === 'picado' && u >= 1) recuperar(s);
        break;
      }
      case 'recuperar':
        if (s.t >= E.recupera) { V.liberarAtaque(s); s.estado = 'acechar'; s.t = 0; s.aireT = 0; s.cd = rnd(E.espera[0], E.espera[1]); s.esperaPermiso = false; }
        break;
      case 'herido': if (s.t >= C.herido) recuperar(s); break;
      case 'aturdido': if (s.t >= C.aturdido) recuperar(s); break;
      case 'romper': if (s.t >= C.romper) S.quitar(s); break;
    }
    return true;
  };
  V.suelo = (s, dt) => {
    if (!s.E.vuelo) return false;
    const F = s.E.vuelo;
    if (!s.fija) s.baseVuelo = sueloEnJ(s.x, s.baseVuelo + .6, s.z);
    if (s.estado !== 'picado') {
      const bajo = abierta(s) || s.estado === 'romper', objetivo = s.baseVuelo + (bajo ? F.suelo : F.alto);
      const vel = bajo ? F.alto / F.descenso : F.ascenso;
      s.y += clamp(objetivo - s.y, -vel * dt, vel * dt);
    }
    return true;
  };
  V.posar = s => {
    if (s.costillas) s.costillas.forEach((m, i) => { const lado = i ? 1 : -1; m.position.x = lado * (abierta(s) ? .42 : .12); m.rotation.y = lado * (abierta(s) ? 1 : 0); });
    if (s.placas) s.placas.forEach((m, i) => {
      const lado = i ? 1 : -1, abre = !['acechar', 'aviso'].includes(s.estado);
      m.position.x = lado * (abre ? .48 : .12); m.rotation.y = abre ? lado * .9 : 0;
      m.material = abre ? S.materialMate() : S.material();
    });
    if (s.alas) s.alas.forEach((m, i) => { m.rotation.z = (i ? 1 : -1) * (abierta(s) ? .9 : Math.sin(U.uT.value * 7) * .2); });
    if (s.E.vuelo && s.estado === 'picado') s.m.rotation.x = .5;
  };

  /* Mismos emplazamientos, con una variante primero y grupos mixtos después.
     Sustituyen un puesto del grupo al nacer; nunca multiplican el número de atacantes. */
  const reparto = [[], [], [{ tipo: 'espejo', cap: 1, puesto: 2 }], [{ tipo: 'devoradora', cap: 5, puesto: 1 }],
    [{ tipo: 'espejo', cap: 2, puesto: 1 }], [{ tipo: 'escoria', cap: 3, puesto: 2 }, { tipo: 'alada', cap: 3, puesto: 3 }],
    [{ tipo: 'lanzadoraEscarcha', cap: 6, puesto: 2 }, { tipo: 'devoradora', cap: 6, puesto: 1 }]];
  S.zonas.forEach((z, i) => { z.variantes = reparto[i]; ZONAS_SOMBRA[i].variantes = reparto[i]; });
  for (const g of S.guardias) if (g.id === 'marea' || g.id === 'escarcha') {
    g.tipo = 'oniAnclado'; g.cap = g.id === 'marea' ? 2 : 6;
    Object.assign(GUARDIAS_ONI.find(base => base.id === g.id), { tipo: g.tipo, cap: g.cap });
  }
})();
