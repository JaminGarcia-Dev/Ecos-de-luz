/* === Ecos de Luz · 66-lumi-enlaces.js ===
   C6F: tres ataduras de la Luna. Claude conecta script, capítulo, HUD y misión.
   Cargar después de 21, 24 y 35. empezar recibe el suelo del centro de una arena
   plana y despejada. Lumi conserva su modelo; solo los nudos reciben aplicaciones.
   Progreso serializable en Sis.ST.lumiEnlaces: golpes[3] y liberada. Las ventanas
   y los avisos se reinician al reintentar; las rupturas confirmadas no se repiten.
   pulso queda disponible para el integrador; no se registra ningún paso de misión. */
"use strict";

const LUMI_ENLACES = {
  arena: { radio: 11, lejos: 16, desnivel: 4, combate: 3 },
  bases: { posiciones: [[-6, 0], [6, 0], [0, -6]], radio: 1.35, alto: .18, segmentos: 24 },
  nudo: { golpes: 4, alto: 1.15, radio: .65, margenAngulo: .2, alturaGolpe: 2,
    altoArma: 1.1, separacionGolpes: .24, hazPorGolpe: .7, hazRadio: .8, hazCoste: 8,
    halo: 2.3, haloCerrado: .3, haloAbierto: .85, haloProgreso: .25 },
  lumi: { alto: 4.3, libre: 1.8, descenso: 1.5, temblor: 1, cuerda: .055, lados: 6 },
  ventanas: { entrada: 1.5, recuperacion: 3.2, entreEnlaces: 2 },
  franja: { aviso: 1.3, duracion: .35, ancho: 1.8, largo: 20, daño: 14 },
  sector: { aviso: 1.3, duracion: .7, radio: 17, arco: Math.PI * .6, grosor: .12, daño: 16 },
  discos: { aviso: 1.5, duracion: .35, radio: 1.7, separacion: 4, daño: 14 },
  impacto: { radioJugador: .3, altura: 1.8 },
  aviso: { altura: .025, capa: .008, contorno: 1.06, opacidad: [.25, .7], segmentos: 48 },
  rotura: { particulas: 36, velocidad: 4, duracion: .9, tamaño: .2, brillo: 1.6 },
  arte: { oscuro: 0x211c2d, rojo: 0xff4637, claro: 0xffedbf,
    libre: 0xffedbf, segmentosNudo: 1, anchoEtiqueta: 2.2,
    altoEtiqueta: 1.6, progresoRadio: .88, progresoPunto: .09, segmentosPunto: [8, 6],
    etiqueta: { tamaño: 256, fondo: '#211c2d', tinta: '#ffedbf', trazo: 10,
      circuloY: 72, circuloRadio: 42, barrasX: [99, 157], barrasY: [28, 112],
      triangulo: [[128, 23], [177, 109], [79, 109]],
      numeroY: 184, numeroFuente: 64, progresoY: 232, progresoFuente: 28 } }
};

const LumiEnlaces = (() => {
  const D = LUMI_ENLACES, nombres = ['circulo', 'barras', 'triangulo'];
  const formas = ['Círculo', 'Dos barras', 'Triángulo'];
  const arriba = new THREE.Vector3(0, 1, 0), v = new THREE.Vector3(), w = new THREE.Vector3();
  let activo = false, fase = 'fuera', t = 0, centro = null, estado = null;
  let grupo = null, nudos = [], marcas = [], ataque = null, enfriamiento = 0, suspendido = false;
  let posicionLumi = new THREE.Vector3(), materiales = null;
  const rotos = () => estado ? estado.golpes.filter(g => g >= D.nudo.golpes).length : 0;
  const indice = () => estado ? estado.golpes.findIndex(g => g < D.nudo.golpes) : -1;
  const abierto = () => activo && !suspendido && fase === 'recupera';

  function materialesArte() {
    if (materiales) return materiales;
    const basico = (color, opacidad) => new THREE.MeshBasicMaterial({ color, fog: false,
      side: THREE.DoubleSide, transparent: opacidad !== undefined,
      opacity: opacidad === undefined ? 1 : opacidad, depthWrite: opacidad === undefined });
    materiales = { rojo: basico(D.arte.rojo), oscuro: basico(D.arte.oscuro),
      claro: basico(D.arte.claro), aviso: basico(D.arte.rojo, D.aviso.opacidad[0]),
      borde: new THREE.LineBasicMaterial({ color: D.arte.claro, fog: false }) };
    return materiales;
  }

  // Número y forma sobre fondo oscuro: legibles también en la nieve y sin color.
  function pintarEtiqueta(n, golpes) {
    const c = n.canvas, x = c.getContext('2d'), a = c.width, E = D.arte.etiqueta;
    x.clearRect(0, 0, a, a); x.fillStyle = E.fondo; x.fillRect(0, 0, a, a);
    x.strokeStyle = E.tinta; x.lineWidth = E.trazo; x.beginPath();
    if (n.i === 0) x.arc(a / 2, E.circuloY, E.circuloRadio, 0, Math.PI * 2);
    else if (n.i === 1) for (const bx of E.barrasX) { x.moveTo(bx, E.barrasY[0]); x.lineTo(bx, E.barrasY[1]); }
    else { E.triangulo.forEach((p, i) => i === 0 ? x.moveTo(p[0], p[1]) : x.lineTo(p[0], p[1])); x.closePath(); }
    x.stroke(); x.fillStyle = E.tinta; x.textAlign = 'center';
    x.font = 'bold ' + E.numeroFuente + 'px sans-serif'; x.fillText(String(n.i + 1), a / 2, E.numeroY);
    x.font = 'bold ' + E.progresoFuente + 'px sans-serif'; x.fillText(Math.floor(golpes) + '/' + D.nudo.golpes, a / 2, E.progresoY);
    n.etiqueta.material.map.needsUpdate = true; n.etiquetados = Math.floor(golpes);
  }

  function crearNudo(i) {
    const m = materialesArte(), g = new THREE.Group(), B = D.bases, N = D.nudo;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(B.radio, B.radio, B.alto, B.segmentos), m.oscuro);
    base.position.y = B.alto / 2; g.add(base);
    const nudo = new THREE.Mesh(new THREE.OctahedronGeometry(N.radio, D.arte.segmentosNudo), m.rojo);
    nudo.position.y = B.alto + N.alto; g.add(nudo);
    const halo = new Halo(D.arte.rojo, N.haloCerrado); halo.scale.set(N.halo, N.halo, 1); halo.position.copy(nudo.position); g.add(halo);
    const cuerda = new THREE.Mesh(new THREE.CylinderGeometry(D.lumi.cuerda, D.lumi.cuerda, 1, D.lumi.lados), m.rojo); g.add(cuerda);
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = D.arte.etiqueta.tamaño;
    const etiqueta = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), fog: false, depthWrite: false }));
    etiqueta.position.set(0, nudo.position.y + D.arte.altoEtiqueta, 0);
    etiqueta.scale.set(D.arte.anchoEtiqueta, D.arte.anchoEtiqueta, 1); g.add(etiqueta);
    const puntos = [];
    for (let k = 0; k < N.golpes; k++) {
      const a = k / N.golpes * Math.PI * 2;
      const p = new THREE.Mesh(new THREE.SphereGeometry(D.arte.progresoPunto, ...D.arte.segmentosPunto), m.claro);
      p.position.set(Math.cos(a) * D.arte.progresoRadio, nudo.position.y, Math.sin(a) * D.arte.progresoRadio);
      g.add(p); puntos.push(p);
    }
    const n = { i, g, nudo, halo, cuerda, etiqueta, canvas, puntos, etiquetados: -1, sol: null };
    pintarEtiqueta(n, 0); return n;
  }

  function crear() {
    if (grupo) return;
    grupo = new THREE.Group(); grupo.name = 'Lumi: ataduras de la Luna'; grupo.visible = false;
    for (let i = 0; i < nombres.length; i++) { const n = crearNudo(i); nudos.push(n); grupo.add(n.g); }
    scene.add(grupo);
  }

  function ocultarAtaque() {
    for (const m of marcas) { grupo.remove(m); m.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
    marcas = []; ataque = null;
  }

  function detener() {
    if (grupo) { ocultarAtaque(); grupo.visible = false; }
    for (const n of nudos) if (n.sol) n.sol.on = false;
    if (activo) { Lumi.fijar(null); Sis.marcador(null); }
    activo = false; fase = 'fuera'; suspendido = false; enfriamiento = 0;
  }

  function empezar(p) {
    if (!p || ![p.x, p.y, p.z].every(Number.isFinite)) throw new TypeError('LumiEnlaces.empezar necesita centro {x, y, z}');
    if (activo && estado === Sis.ST.lumiEnlaces) return;
    detener(); crear(); centro = { x: p.x, y: p.y, z: p.z };
    // Un solo estado guardado. No almacenar referencias a mallas ni tiempos de ataques.
    estado = Sis.ST.lumiEnlaces || (Sis.ST.lumiEnlaces = { golpes: [0, 0, 0], liberada: false });
    estado.golpes = nombres.map((_, i) => clamp(Number(estado.golpes && estado.golpes[i]) || 0, 0, D.nudo.golpes));
    if (estado.liberada) return;
    grupo.position.set(centro.x, centro.y, centro.z); grupo.visible = true;
    for (const n of nudos) {
      const b = D.bases.posiciones[n.i]; n.g.position.set(b[0], 0, b[1]);
      // Bases bajas que se pisan. El nudo y su cuerda son luz, sin pared corporal.
      if (!n.sol) n.sol = Sol.col(centro.x + b[0], centro.z + b[1], D.bases.radio, centro.y, centro.y + D.bases.alto);
      Object.assign(n.sol, { x: centro.x + b[0], z: centro.z + b[1], y0: centro.y, y1: centro.y + D.bases.alto, on: true });
      pintarEtiqueta(n, estado.golpes[n.i]);
    }
    activo = true; fase = rotos() === nombres.length ? 'baja' : 'entrada'; t = 0;
    posicionLumi.set(centro.x, centro.y + D.lumi.alto, centro.z);
    Lumi.fijar(posicionLumi, D.lumi.temblor); Lumi.grupo.position.copy(posicionLumi); Lumi.grupo.visible = true;
    refrescarArte(); Sis.guardar();
  }

  function refrescarArte() {
    const vigente = indice();
    for (const n of nudos) {
      const g = estado.golpes[n.i], roto = g >= D.nudo.golpes;
      n.nudo.visible = n.cuerda.visible = n.halo.visible = !roto;
      n.nudo.material = n.i === vigente && abierto() ? materiales.claro : materiales.rojo;
      n.halo.opacidad = (n.i === vigente && abierto() ? D.nudo.haloAbierto : D.nudo.haloCerrado) + (g % 1) * D.nudo.haloProgreso;
      if (n.etiquetados !== Math.floor(g)) pintarEtiqueta(n, g);
      for (let k = 0; k < n.puntos.length; k++) n.puntos[k].visible = g >= k + 1;
      // La cuerda termina en el grupo real de Lumi, incluso durante el descenso.
      v.set(Lumi.grupo.position.x - centro.x - n.g.position.x,
        Lumi.grupo.position.y - centro.y, Lumi.grupo.position.z - centro.z - n.g.position.z);
      w.copy(v).sub(n.nudo.position); const largo = w.length();
      n.cuerda.position.copy(n.nudo.position).addScaledVector(w, .5);
      n.cuerda.scale.set(1, largo, 1);
      if (largo > 0) n.cuerda.quaternion.setFromUnitVectors(arriba, w.normalize());
    }
  }

  // Las marcas reutilizan MeshBasicMaterial y las cuerdas, Halo; sin shaders nuevos.
  function marca(geo, x, z, yaw, sx, sz) {
    const m = materialesArte(), g = new THREE.Group();
    const fondo = new THREE.Mesh(geo, m.oscuro); fondo.scale.set(D.aviso.contorno, 1, D.aviso.contorno); g.add(fondo);
    const relleno = new THREE.Mesh(geo.clone(), m.aviso); relleno.position.y = D.aviso.capa; g.add(relleno);
    const borde = new THREE.LineSegments(new THREE.EdgesGeometry(geo), m.borde); borde.position.y = D.aviso.capa; g.add(borde);
    g.position.set(x, D.bases.alto + D.aviso.altura, z); g.rotation.y = yaw;
    g.scale.set(sx, 1, sz); grupo.add(g); marcas.push(g); return g;
  }

  const geoFranja = () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, .5);
  function avisar(J) {
    const i = indice(), b = D.bases.posiciones[i], dx = J.x - centro.x - b[0], dz = J.z - centro.z - b[1];
    const yaw = Math.atan2(dx, dz), Q = [D.franja, D.sector, D.discos][i];
    ataque = { i, x: b[0], z: b[1], yaw, golpe: false, Q, discos: [], barrido: null };
    fase = 'aviso'; t = 0;
    if (i === 0) marca(geoFranja(), b[0], b[1], yaw, Q.ancho, Q.largo);
    else if (i === 1) {
      const geo = new THREE.CircleGeometry(1, D.aviso.segmentos, -Math.PI / 2 - Q.arco / 2, Q.arco).rotateX(-Math.PI / 2);
      marca(geo, b[0], b[1], yaw, Q.radio, Q.radio);
      ataque.barrido = marca(geoFranja(), b[0], b[1], yaw - Q.arco / 2, Q.grosor, Q.radio);
      ataque.barrido.visible = false;
    } else {
      // Ambos centros se fijan al avisar. El segundo queda hacia el interior.
      const px = J.x - centro.x, pz = J.z - centro.z, d = Math.hypot(px, pz);
      const limite = D.arena.radio - Q.radio;
      const r = Math.min(d, limite), ux = d > 0 ? px / d : 1, uz = d > 0 ? pz / d : 0;
      const segundo = r - Q.separacion;
      ataque.discos = [{ x: ux * r, z: uz * r }, { x: ux * segundo, z: uz * segundo }];
      for (const p of ataque.discos) marca(new THREE.CircleGeometry(1, D.aviso.segmentos).rotateX(-Math.PI / 2), p.x, p.z, 0, Q.radio, Q.radio);
    }
    Sonido.sfx('latido');
  }

  function impacto(J, anterior, actual) {
    const a = ataque; if (!a || a.golpe || !J.vivo) return;
    if (J.y < centro.y - D.impacto.altura || J.y > centro.y + D.impacto.altura) return;
    const dx = J.x - centro.x - a.x, dz = J.z - centro.z - a.z, radio = D.impacto.radioJugador;
    let dentro = false;
    if (a.i === 0) {
      const lateral = dx * Math.cos(a.yaw) - dz * Math.sin(a.yaw), largo = dx * Math.sin(a.yaw) + dz * Math.cos(a.yaw);
      dentro = Math.abs(lateral) <= a.Q.ancho / 2 + radio && largo >= -radio && largo <= a.Q.largo + radio;
    } else if (a.i === 1) {
      const d = Math.hypot(dx, dz), ang = angDif(a.yaw, Math.atan2(dx, dz));
      const margen = Math.atan2(radio + a.Q.grosor / 2, d);
      dentro = d <= a.Q.radio + radio && ang >= anterior - margen && ang <= actual + margen;
    } else dentro = a.discos.some(p => Math.hypot(J.x - centro.x - p.x, J.z - centro.z - p.z) <= a.Q.radio + radio);
    // Una aplicación por ataque, incluidos los dos discos y una esquiva invulnerable.
    // Combate.recibir decide invulnerabilidad, guardia y reacciones como con Sombras.
    if (dentro) { a.golpe = true; Bus.emit('dañoJugador', { dmg: a.Q.daño, x: centro.x + a.x, z: centro.z + a.z, imparable: true }); }
  }

  function aplicar(cantidad) {
    const i = indice(); if (!abierto() || i < 0 || cantidad <= 0) return 0;
    const antes = estado.golpes[i], g = estado.golpes[i] = Math.min(D.nudo.golpes, antes + cantidad);
    if (g >= D.nudo.golpes) {
      const n = nudos[i], R = D.rotura;
      ocultarAtaque(); fase = rotos() === nombres.length ? 'baja' : 'entrada';
      t = 0; enfriamiento = 0;
      FX.rafaga(centro.x + n.g.position.x, centro.y + D.bases.alto + D.nudo.alto, centro.z + n.g.position.z,
        R.particulas, R.velocidad, R.duracion, R.tamaño, D.arte.libre, R.brillo);
      Sonido.sfx('rota'); refrescarArte();
      Sis.evento('c6:enlace_' + nombres[i] + '_roto'); Sis.guardar();
    } else if (Math.floor(antes) !== Math.floor(g)) { Sonido.sfx('chispa'); Sis.guardar(); }
    return 1;
  }

  function golpear(o, alc, ang, dmg, op) {
    if (!abierto() || enfriamiento > 0 || !(dmg > 0)) return 0;
    const i = indice(); if (i < 0) return 0;
    const n = nudos[i], dx = centro.x + n.g.position.x - o.x, dz = centro.z + n.g.position.z - o.z;
    const d = Math.hypot(dx, dz), ny = centro.y + D.bases.alto + D.nudo.alto;
    if (d > alc + D.nudo.radio || Math.abs(o.y + D.nudo.altoArma - ny) > D.nudo.alturaGolpe) return 0;
    if (d > D.nudo.radio && Math.abs(angDif(o.yaw, Math.atan2(dx, dz))) > ang + D.nudo.margenAngulo) return 0;
    const resultado = aplicar(1); enfriamiento = D.nudo.separacionGolpes; refrescarArte(); return resultado;
  }

  function pulso(x, z, r, dmg) {
    if (!abierto() || enfriamiento > 0 || !(dmg > 0)) return 0;
    const i = indice(); if (i < 0) return 0; const n = nudos[i];
    if (Math.hypot(centro.x + n.g.position.x - x, centro.z + n.g.position.z - z) > r + D.nudo.radio) return 0;
    const resultado = aplicar(1); enfriamiento = D.nudo.separacionGolpes; refrescarArte(); return resultado;
  }

  function actualizarHaz(dt) {
    if (!abierto() || !Haz.on || !(Haz.t > 0) || !(Sis.ST.luz > 0)) return;
    const i = indice(); if (i < 0) return; const n = nudos[i];
    v.set(centro.x + n.g.position.x, centro.y + D.bases.alto + D.nudo.alto, centro.z + n.g.position.z);
    w.copy(v).sub(Haz.o); const s = clamp(w.dot(Haz.d), 0, Haz.t);
    w.copy(Haz.o).addScaledVector(Haz.d, s);
    if (v.distanceTo(w) > D.nudo.hazRadio) return;
    const uso = Math.min(dt, Sis.ST.luz / D.nudo.hazCoste);
    Sis.ST.luz = Math.max(0, Sis.ST.luz - uso * D.nudo.hazCoste);
    aplicar(uso / D.nudo.hazPorGolpe);
  }

  function liberar() {
    // Guardar antes de avisar: un receptor puede iniciar una escena o guardar.
    estado.liberada = true; Sis.guardar(); detener();
    Bus.emit('lumiLiberada'); Sis.evento('c6:lumi_liberada');
  }

  function actualizar(dt, J) {
    if (!activo || !(dt > 0) || !J) return;
    if (estado !== Sis.ST.lumiEnlaces) { detener(); return; }
    const cerca = Math.hypot(J.x - centro.x, J.z - centro.z) <= D.arena.lejos && Math.abs(J.y - centro.y) < D.arena.desnivel;
    if (!J.vivo || !cerca || Cin.activa) {
      // Reintentar no repite rupturas ni deja caer daño pendiente sobre Hikari.
      if (!suspendido) { ocultarAtaque(); t = 0; if (fase !== 'baja') fase = 'entrada'; Sis.marcador(null); }
      suspendido = true; refrescarArte(); return;
    }
    suspendido = false; J.combate = Math.max(J.combate || 0, D.arena.combate);
    if (fase !== 'baja') Lumi.fijar(posicionLumi, D.lumi.temblor);
    enfriamiento = Math.max(0, enfriamiento - dt);
    const anterior = t; t += dt;
    if (fase === 'baja') {
      const u = Math.min(1, t / D.lumi.descenso), suave = u * u * (3 - 2 * u);
      posicionLumi.set(centro.x, centro.y + D.lumi.alto + (D.lumi.libre - D.lumi.alto) * suave, centro.z);
      Lumi.fijar(posicionLumi, D.lumi.temblor * (1 - u)); Lumi.grupo.position.copy(posicionLumi);
      if (u >= 1) { liberar(); return; }
    } else if (fase === 'entrada') {
      const espera = rotos() > 0 ? D.ventanas.entreEnlaces : D.ventanas.entrada;
      if (t >= espera) avisar(J);
    } else if (fase === 'aviso') {
      materiales.aviso.opacity = D.aviso.opacidad[0] + (D.aviso.opacidad[1] - D.aviso.opacidad[0]) * Math.min(1, t / ataque.Q.aviso);
      if (t >= ataque.Q.aviso) {
        fase = 'ataque'; t = 0; materiales.aviso.opacity = D.aviso.opacidad[1]; Sonido.sfx('chispa');
        if (ataque.i === 1) ataque.barrido.visible = true;
        else impacto(J, 0, 0);
      }
    } else if (fase === 'ataque') {
      if (ataque.i === 1) {
        const Q = ataque.Q, a0 = -Q.arco / 2 + Q.arco * Math.min(1, anterior / Q.duracion), a1 = -Q.arco / 2 + Q.arco * Math.min(1, t / Q.duracion);
        ataque.barrido.rotation.y = ataque.yaw + a1; impacto(J, a0, a1);
      }
      if (t >= ataque.Q.duracion) { ocultarAtaque(); fase = 'recupera'; t = 0; }
    } else if (fase === 'recupera') {
      actualizarHaz(Math.min(dt, Math.max(0, D.ventanas.recuperacion - anterior)));
      if (fase === 'recupera' && t >= D.ventanas.recuperacion) avisar(J);
    }
    refrescarArte();
    const i = indice();
    if (i >= 0) Sis.marcador({ txt: 'Rompe las ataduras · ' + rotos() + '/' + nombres.length + ' · ' + (i + 1) + ': ' + formas[i] +
      (abierto() ? ' · {haz} o {atacar}' : ' · Espera la apertura'), frac: estado.golpes[i] / D.nudo.golpes });
  }

  // No se rompe por interacción: hay que usar el arma o el haz durante la ventana.
  function interactuable(J) { return null; }
  function barra(J) {
    if (!activo || suspendido || !J || Math.hypot(J.x - centro.x, J.z - centro.z) > D.arena.lejos) return null;
    return { jefe: true, nom: 'Ataduras de la Luna', ani: nombres.length - rotos(), aniMax: nombres.length };
  }
  function muestras() {
    const g = new THREE.Group(), m = materialesArte();
    g.add(new THREE.Mesh(new THREE.OctahedronGeometry(D.nudo.radio, D.arte.segmentosNudo), m.rojo),
      new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m.aviso),
      new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m.oscuro),
      new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m.claro));
    g.visible = false; return g;
  }
  return { empezar, detener, actualizar, get activo() { return activo; }, get rotos() { return rotos(); },
    golpear, pulso, interactuable, barra, muestras };
})();
