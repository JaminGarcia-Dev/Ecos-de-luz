/* === Ecos de Luz · 67-duelo-luna.js ===
   Combate físico de C7. Claude conecta capítulo, actualizar(dt,J), barra,
   interacción y muestras. No registra misiones ni sustituye el final.
   empezar({x,y,z}) recibe el suelo de una plaza plana de radio plaza.radio.
   El integrador llama LunaRoja.actualizar(dt) UNA vez por fotograma.
   Sis.ST.dueloLuna = { etapa, golpes:[4], vencida, liberada }. Conserva anclajes;
   vida/equilibrio/avisos vuelven al inicio de etapa al caer, salir o cargar.
   El arma y su onda entran por 21. pulso queda disponible al integrador, como Lumi.
   Canalización con el temporizador del juego, después de ganar el combate.
   Sin víctimas nuevas, recompensas, cambios de cielo ni liberación de la Dorada aquí. */
"use strict";

const DUELO_LUNA = {
  plaza: { radio: 11, lejos: 16, desnivel: 4, combate: 3, entrada: 1.8 },
  etapas: {
    1: { vida: 0, golpesAnclaje: 4, dañoMult: 1, avisoMult: 1,
      ataques: ['barrido', 'lluvia', 'zona', 'mano', 'zona'] },
    2: { vida: 480, equilibrio: 60, dañoMult: 1, avisoMult: 1,
      ataques: ['mano', 'arco', 'barrido', 'mano', 'arco'] },
    3: { vida: 320, equilibrio: 48, dañoMult: 1.1, avisoMult: 1,
      ataques: ['cierre', 'mano', 'lluvia', 'barrido'] }
  },
  anclaje: { alto: 1.1, radio: .65, baseRadio: 1.05, baseAlto: .16,
    alturaGolpe: 1.8, margenAngulo: .2, separacion: .24, hazPorGolpe: .7,
    cubierta: 2, halo: 2, progresoRadio: .9, progresoPunto: .10 },
  cuerpo: { radio: 1.45, solRadio: 1.2, alto: 4.8, bajo: .2, armaAlto: 1.1,
    hazAlto: 2.1, hazRadio: 1.6, hazDaño: 24, dañoNormal: .7,
    dañoVentana: 1, dañoAturdida: 1.35, separacion: .16,
    equilibrioGolpe: 10, peso: [0, .7, 1, 1.5], contra: 1.5,
    equilibrioHaz: 12, equilibrioPulso: 16, aturdida: 4 },
  haz: { coste: 8 },
  barrido: { nombre: 'Barrido del manto', pose: 'barrido', aviso: 1.8,
    dur: .42, ventana: 2.5, radio: 8, arco: Math.PI * 1.4, alto: .9,
    ancho: .16, daño: 20, imparable: true, sonido: 'acecho' },
  lluvia: { nombre: 'Lluvia retenida', pose: 'extraer', aviso: 1.5,
    dur: .3, ventana: 3, radio: 1.6, separacion: 4, daño: 16,
    imparable: true, sonido: 'cristal' },
  zona: { nombre: 'Zona de extracción', pose: 'extraer', aviso: 2,
    dur: .5, ventana: 3, radio: 2.3, daño: 0, luz: 20,
    imparable: true, sonido: 'acecho' },
  mano: { nombre: 'Mano que exige', pose: 'golpe', aviso: 1.6,
    dur: .32, ventana: 3, ancho: 3, largo: 7, daño: 24,
    imparable: false, sonido: 'latido' },
  arco: { nombre: 'Arco retenido', pose: 'barrido', aviso: 1.5,
    dur: .42, ventana: 2.5, ancho: 1.8, largo: 10, alto: 3,
    daño: 20, imparable: false, sonido: 'sombraLanza' },
  cierre: { nombre: 'Cerrar la salida', pose: 'extraer', aviso: 3,
    dur: .4, ventana: 3, ancho: 3.4, largo: 10, daño: 18, luz: 24,
    interrumpir: 3, pesado: 3, pulsos: 3,
    imparable: true, sonido: 'pulso' },
  impacto: { radioJugador: .3, alto: 1.8 },
  reserva: { canal: 3, radio: 3.2, alto: .7, halo: 3.5 },
  arte: { oscuro: 0x211c2d, rojo: 0xff4637, blanco: 0xffedbf,
    segmentos: 48, lados: 16, suelo: .035, capa: .008, contorno: 1.07,
    opacidad: [.25, .8], halo: [.3, .85], etiquetaAlto: 2.3, etiquetaAncho: 1,
    etiqueta: { tamaño: 128, fondo: '#211c2d', tinta: '#ffedbf', fuente: 84, textoY: 94 },
    puntoLados: [8, 6], arcoInterior: .7, fragmentos: 36, velocidad: 4,
    dur: .9, tamaño: .18, brillo: 1.6 }
};

const DueloLuna = (() => {
  const D = DUELO_LUNA, v = new THREE.Vector3(), w = new THREE.Vector3();
  let activo = false, etapa = 1, fase = 'fuera', t = 0, vida = 0, eq = 0;
  let centro, estado, grupo, reserva, sol, materiales, ataque = null, emitiendo = null;
  let nudos = [], marcas = [], orden = 0, cd = 0, suspendido = false, pausado = false, jugador = null;
  const ficha = () => D.etapas[etapa];
  const maxGolpes = () => D.etapas[1].golpesAnclaje;
  const rotos = () => estado.golpes.filter(g => g >= maxGolpes()).length;
  const cerca = J => J && centro && Math.hypot(J.x - centro.x, J.z - centro.z) <= D.plaza.lejos && Math.abs(J.y - centro.y) <= D.plaza.desnivel;
  const disponible = () => activo && estado === Sis.ST.dueloLuna && !suspendido &&
    jugador && jugador.vivo && cerca(jugador) && !Cin.activa && !UI.dlg;
  const luchando = () => disponible() && !estado.vencida;
  const ventana = () => fase === 'recupera' || fase === 'aturdida';

  function materialArte() {
    if (materiales) return materiales;
    const basico = (color, opacity) => new THREE.MeshBasicMaterial({ color, fog: false,
      side: THREE.DoubleSide, transparent: opacity !== undefined,
      opacity: opacity === undefined ? 1 : opacity, depthWrite: opacity === undefined });
    materiales = { oscuro: basico(D.arte.oscuro), rojo: basico(D.arte.rojo),
      blanco: basico(D.arte.blanco), aviso: basico(D.arte.blanco, D.arte.opacidad[0]),
      borde: new THREE.LineBasicMaterial({ color: D.arte.blanco, fog: false }) };
    return materiales;
  }
  function etiqueta(i) {
    const E = D.arte.etiqueta, c = document.createElement('canvas'); c.width = c.height = E.tamaño;
    const x = c.getContext('2d'); x.fillStyle = E.fondo; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = E.tinta; x.font = 'bold ' + E.fuente + 'px sans-serif'; x.textAlign = 'center';
    x.fillText(String(i + 1), c.width / 2, E.textoY);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), fog: false, depthWrite: false }));
    s.position.y = D.arte.etiquetaAlto; s.scale.set(D.arte.etiquetaAncho, D.arte.etiquetaAncho, 1); return s;
  }
  function crear() {
    if (grupo) return;
    const M = materialArte(), N = D.anclaje, A = D.arte;
    grupo = new THREE.Group(); grupo.name = 'Duelo Luna Roja'; grupo.visible = false; scene.add(grupo);
    const geos = [new THREE.SphereGeometry(N.radio, A.lados, A.lados), new THREE.BoxGeometry(N.radio, N.radio, N.radio),
      new THREE.TetrahedronGeometry(N.radio), new THREE.OctahedronGeometry(N.radio)];
    nudos = geos.map((geo, i) => {
      const g = new THREE.Group(), nuc = new THREE.Mesh(geo, M.rojo);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(N.baseRadio, N.baseRadio, N.baseAlto, A.lados), M.oscuro);
      base.position.y = N.baseAlto / 2; nuc.position.y = N.alto;
      const halo = new Halo(A.blanco, A.halo[0]); halo.position.y = N.alto; halo.scale.set(N.halo, N.halo, 1);
      g.add(base, nuc, halo, etiqueta(i)); grupo.add(g);
      const puntos = [];
      for (let k = 0; k < maxGolpes(); k++) {
        const a = k / maxGolpes() * Math.PI * 2;
        const p = new THREE.Mesh(new THREE.SphereGeometry(N.progresoPunto, ...A.puntoLados), M.blanco);
        p.position.set(Math.cos(a) * N.progresoRadio, N.alto, Math.sin(a) * N.progresoRadio);
        g.add(p); puntos.push(p);
      }
      return { i, g, nuc, halo, puntos, p: new THREE.Vector3() };
    });
    const limite = new THREE.Mesh(new THREE.RingGeometry(D.plaza.radio - A.capa, D.plaza.radio, A.segmentos).rotateX(-Math.PI / 2), M.blanco);
    limite.position.y = A.suelo; grupo.add(limite);
    reserva = new Halo(A.blanco, A.halo[1]); reserva.position.y = D.reserva.alto;
    reserva.scale.set(D.reserva.halo, D.reserva.halo, 1); reserva.visible = false; grupo.add(reserva);
  }
  function limpiarAtaque() {
    for (const m of marcas) { grupo.remove(m); m.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
    marcas = []; ataque = null; emitiendo = null;
  }
  function fragmentar(p) {
    const A = D.arte; FX.rafaga(p.x, p.y, p.z, A.fragmentos, A.velocidad, A.dur, A.tamaño, A.blanco, A.brillo);
    Sonido.sfx('quiebre', { pos: p });
  }
  function refrescar() {
    for (const n of nudos) {
      const g = estado.golpes[n.i], roto = g >= maxGolpes();
      n.g.visible = etapa === 1; n.nuc.visible = n.halo.visible = !roto;
      n.nuc.material = g >= D.anclaje.cubierta ? materiales.blanco : materiales.rojo;
      n.halo.opacidad = D.arte.halo[0] + (D.arte.halo[1] - D.arte.halo[0]) * g / maxGolpes();
      n.puntos.forEach((p, k) => { p.visible = g > k; p.scale.setScalar(Math.min(1, Math.max(0, g - k))); });
      LunaRoja.conexion(n.i, etapa === 1 && !roto, n.p);
    }
    reserva.visible = estado.vencida && !estado.liberada;
    if (sol) sol.on = activo && !suspendido && !estado.vencida;
  }
  function reiniciarEtapa() {
    limpiarAtaque(); vida = estado.vencida ? 0 : ficha().vida; eq = ficha().equilibrio || 0;
    fase = estado.vencida ? 'vencida' : 'entrada'; t = orden = cd = 0;
    LunaRoja.etapa(etapa); if (etapa === 3) LunaRoja.mascara(1);
    LunaRoja.pose(estado.vencida ? 'caer' : 'reposo'); refrescar();
  }
  function detener() {
    if (grupo) { limpiarAtaque(); grupo.visible = false; }
    if (sol) sol.on = false;
    if (activo) { LunaRoja.mostrar(false); Sis.marcador(null); }
    activo = false; suspendido = pausado = false; fase = 'fuera'; jugador = null;
  }
  function empezar(p) {
    if (!p || ![p.x, p.y, p.z].every(Number.isFinite)) throw new TypeError('DueloLuna.empezar necesita centro {x,y,z}');
    if (activo && estado === Sis.ST.dueloLuna) return;
    detener(); crear(); centro = { x: p.x, y: p.y, z: p.z };
    estado = Sis.ST.dueloLuna || (Sis.ST.dueloLuna = {});
    estado.etapa = [1, 2, 3].includes(estado.etapa) ? estado.etapa : 1;
    estado.golpes = nudos.map((n, i) => clamp(Number(estado.golpes && estado.golpes[i]) || 0, 0, maxGolpes()));
    estado.liberada = !!estado.liberada; estado.vencida = !!estado.vencida || estado.liberada;
    if (estado.vencida) estado.etapa = 3;
    else if (estado.etapa === 1 && rotos() === nudos.length) estado.etapa = 2;
    etapa = estado.etapa;
    if (etapa > 1) estado.golpes.fill(maxGolpes());
    if (estado.liberada) return;
    grupo.position.set(p.x, p.y, p.z); grupo.visible = true;
    LunaRoja.mostrar(true); LunaRoja.colocar(p.x, p.y, p.z, 0);
    // Restablecer destinos de la sesión anterior antes de leer los del modelo.
    nudos.forEach(n => LunaRoja.conexion(n.i, etapa === 1, null));
    LunaRoja.anclajes().forEach((punto, i) => {
      const n = nudos[i]; n.p.set(punto.x, centro.y + D.anclaje.alto, punto.z);
      n.g.position.set(punto.x - centro.x, 0, punto.z - centro.z);
    });
    if (!sol) { sol = Sol.col(p.x, p.z, D.cuerpo.solRadio, p.y, p.y + D.cuerpo.alto); sol.fina = true; }
    Object.assign(sol, { x: p.x, z: p.z, y0: p.y, y1: p.y + D.cuerpo.alto });
    activo = true; jugador = Sis.J; reiniciarEtapa(); Sis.guardar();
  }
  function cambiarEtapa(n) { etapa = estado.etapa = n; reiniciarEtapa(); Sis.guardar(); }
  function vencer() {
    estado.vencida = true; limpiarAtaque(); fase = 'vencida'; t = 0; vida = 0;
    LunaRoja.pose('caer'); fragmentar({ x: centro.x, y: centro.y + D.cuerpo.hazAlto, z: centro.z });
    refrescar(); Sis.marcador(null); Sis.guardar(); Sis.evento('c7:luna_vencida');
  }

  // Fondo oscuro, relleno blanco y contorno: el rojo del cielo no oculta las formas.
  function marca(geo, x, z, yaw, sx, sz) {
    const A = D.arte, g = new THREE.Group(), fondo = new THREE.Mesh(geo, materiales.oscuro);
    fondo.scale.set(A.contorno, 1, A.contorno); g.add(fondo);
    const relleno = new THREE.Mesh(geo.clone(), materiales.aviso); relleno.position.y = A.capa; g.add(relleno);
    const borde = new THREE.LineSegments(new THREE.EdgesGeometry(geo), materiales.borde); borde.position.y = A.capa; g.add(borde);
    g.position.set(x, A.suelo, z); g.rotation.y = yaw; g.scale.set(sx, 1, sz);
    grupo.add(g); marcas.push(g); return g;
  }
  const franja = () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, .5);
  const circulo = () => new THREE.CircleGeometry(1, D.arte.segmentos).rotateX(-Math.PI / 2);
  function avisar(J) {
    const lista = ficha().ataques, k = lista[orden++ % lista.length], Q = D[k];
    const yaw = Math.atan2(J.x - centro.x, J.z - centro.z);
    ataque = { k, Q, yaw, golpe: false, puntos: [], interrupcion: 0, pulsos: 1,
      aviso: Q.aviso * ficha().avisoMult, ventana: Q.ventana };
    const a = ataque; fase = 'aviso'; t = 0; materiales.aviso.opacity = D.arte.opacidad[0];
    LunaRoja.colocar(centro.x, centro.y, centro.z, yaw);
    // Los tiempos de la pose de manos escalan con los del aviso de combate.
    const P = LUNA_ROJA.poses[Q.pose]; LunaRoja.pose(Q.pose, P.aviso ? P.aviso / a.aviso : 1);
    if (k === 'barrido') {
      const geo = new THREE.CircleGeometry(1, D.arte.segmentos, -Math.PI / 2 - Q.arco / 2, Q.arco).rotateX(-Math.PI / 2);
      marca(geo, 0, 0, yaw, Q.radio, Q.radio);
      a.banda = marca(franja(), 0, 0, yaw - Q.arco / 2, Q.ancho, Q.radio); a.banda.visible = false;
    } else if (k === 'lluvia') {
      const x = J.x - centro.x, z = J.z - centro.z, d = Math.hypot(x, z), r = Math.min(d, D.plaza.radio - Q.radio);
      const ux = d > 0 ? x / d : 1, uz = d > 0 ? z / d : 0;
      a.puntos = [{ x: ux * r, z: uz * r }, { x: ux * (r - Q.separacion), z: uz * (r - Q.separacion) }];
      a.puntos.forEach(p => marca(circulo(), p.x, p.z, 0, Q.radio, Q.radio));
    } else if (k === 'zona') {
      const n = nudos.filter(n => estado.golpes[n.i] < maxGolpes()).sort((a, b) =>
        Math.hypot(a.p.x - J.x, a.p.z - J.z) - Math.hypot(b.p.x - J.x, b.p.z - J.z))[0];
      a.anclaje = n.i; a.puntos = [{ x: n.g.position.x, z: n.g.position.z }];
      marca(new THREE.CircleGeometry(1, 4).rotateX(-Math.PI / 2), n.g.position.x, n.g.position.z, 0, Q.radio, Q.radio);
      for (const u of [-.5, 0, .5]) marca(franja(), n.g.position.x + Q.radio * u, n.g.position.z - Q.radio * (1 - Math.abs(u)),
        0, D.arte.capa * 2, Q.radio * 2 * (1 - Math.abs(u)));
    } else {
      marca(franja(), 0, 0, yaw, Q.ancho, Q.largo);
      if (k === 'arco') {
        a.arco = new THREE.Mesh(new THREE.RingGeometry(D.arte.arcoInterior, 1, D.arte.segmentos, 1, 0, Math.PI), materiales.blanco);
        a.arco.scale.set(Q.ancho / 2, Q.alto, 1); a.arco.rotation.y = yaw;
        a.arco.position.y = D.arte.suelo; a.arco.visible = false; grupo.add(a.arco); marcas.push(a.arco);
      } else if (k === 'cierre') for (const lado of [-1, 1]) {
        const d = lado * Q.ancho / 2;
        marca(franja(), Math.cos(yaw) * d, -Math.sin(yaw) * d, yaw, D.arte.capa * 2, Q.largo);
      }
    }
    Sonido.sfx(Q.sonido, { pos: centro });
  }
  function aturdir() {
    limpiarAtaque(); fase = 'aturdida'; t = 0; eq = 0; LunaRoja.pose('aturdida');
    Sonido.sfx('rota', { pos: centro });
  }
  function dentro(J, a, previo, actual) {
    const Q = a.Q, R = D.impacto.radioJugador, dx = J.x - centro.x, dz = J.z - centro.z;
    if (Math.abs(J.y - centro.y) > (a.k === 'barrido' || a.k === 'arco' ? Q.alto : D.impacto.alto)) return false;
    if (a.k === 'lluvia') return a.puntos.some(p => Math.hypot(dx - p.x, dz - p.z) <= Q.radio + R);
    if (a.k === 'zona') { const p = a.puntos[0]; return Math.abs(dx - p.x) + Math.abs(dz - p.z) <= Q.radio + R; }
    if (a.k === 'barrido') {
      const d = Math.hypot(dx, dz), ang = angDif(a.yaw, Math.atan2(dx, dz)), margen = Math.atan2(R + Q.ancho / 2, d);
      return d <= Q.radio + R && ang >= previo - margen && ang <= actual + margen;
    }
    const lateral = dx * Math.cos(a.yaw) - dz * Math.sin(a.yaw), largo = dx * Math.sin(a.yaw) + dz * Math.cos(a.yaw);
    if (a.k === 'arco') return Math.abs(lateral) <= Q.ancho / 2 + R && largo >= previo - R && largo <= actual + R;
    return Math.abs(lateral) <= Q.ancho / 2 + R && largo >= -R && largo <= Q.largo + R;
  }
  function impacto(J, previo, actual) {
    const a = ataque; if (!a || a.golpe || !J.vivo || !dentro(J, a, previo, actual)) return;
    a.golpe = true;
    if (a.Q.luz && !(J.inv > 0)) Sis.ST.luz = Math.max(0, Sis.ST.luz - a.Q.luz);
    if (!(a.Q.daño > 0)) return;
    // Bus es síncrono: solo la parada de ESTE impacto abre su recuperación.
    // No se envía B (gólem), td, s ni otro atacante ajeno al encuentro.
    emitiendo = a;
    try { Bus.emit('dañoJugador', { dmg: a.Q.daño * ficha().dañoMult, x: centro.x, z: centro.z, imparable: a.Q.imparable }); }
    finally { emitiendo = null; }
  }
  Bus.on('parada', () => { if (luchando() && emitiendo && emitiendo === ataque && !emitiendo.Q.imparable) aturdir(); });

  function aplicarAnclaje(n, cantidad) {
    if (!(cantidad > 0) || estado.golpes[n.i] >= maxGolpes()) return 0;
    const antes = estado.golpes[n.i], ahora = estado.golpes[n.i] = Math.min(maxGolpes(), antes + cantidad);
    if (antes < D.anclaje.cubierta && ahora >= D.anclaje.cubierta) Sonido.sfx('cristal', { pos: n.p });
    if (ahora >= maxGolpes()) {
      if (ataque && ataque.k === 'zona' && ataque.anclaje === n.i) { limpiarAtaque(); fase = 'recupera'; t = 0; }
      fragmentar(n.p); const todos = rotos() === nudos.length;
      if (todos) cambiarEtapa(2); else { refrescar(); Sis.guardar(); }
      Sis.evento('c7:anclaje_roto'); if (todos) Sis.evento('c7:anclajes_cortados');
    } else { refrescar(); if (Math.floor(antes) !== Math.floor(ahora)) Sis.guardar(); }
    return 1;
  }
  function aplicarCuerpo(dmg, op) {
    const mult = fase === 'aturdida' ? D.cuerpo.dañoAturdida : ventana() ? D.cuerpo.dañoVentana : D.cuerpo.dañoNormal;
    vida = Math.max(0, vida - dmg * mult);
    if (vida <= 0) {
      if (etapa === 2) { fragmentar(centro); cambiarEtapa(3); Sis.evento('c7:cuerpo_vencido'); }
      else vencer();
      return 1;
    }
    const peso = clamp(Math.floor(op.peso || 1), 1, D.cuerpo.peso.length - 1);
    if (ataque && ataque.k === 'cierre' && fase === 'aviso' && !op.haz) {
      ataque.interrupcion += (op.romper || peso >= 3) ? D.cierre.pesado : 1;
      if (ataque.interrupcion >= D.cierre.interrumpir) { aturdir(); return 1; }
    }
    if (fase !== 'aturdida') {
      eq = Math.max(0, eq - (op.haz ? D.cuerpo.equilibrioHaz * op.dt : op.pulso ? D.cuerpo.equilibrioPulso :
        D.cuerpo.equilibrioGolpe * D.cuerpo.peso[peso] * (op.contra ? D.cuerpo.contra : 1)));
      if (eq <= 0) aturdir();
    }
    return 1;
  }
  function alcanzado(o, p, radio, alc, ang) {
    const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz);
    return d <= alc + radio && (d <= radio || Math.abs(angDif(o.yaw, Math.atan2(dx, dz))) <= ang + Math.atan2(radio, d));
  }
  function golpear(o, alc, ang, dmg, op = {}) {
    if (!luchando() || cd > 0 || !(dmg > 0) || !o) return 0;
    if (etapa === 1) {
      const n = nudos.filter(n => estado.golpes[n.i] < maxGolpes() && Math.abs(o.y + D.cuerpo.armaAlto - n.p.y) <= D.anclaje.alturaGolpe &&
        alcanzado(o, n.p, D.anclaje.radio, alc, ang + D.anclaje.margenAngulo))
        .sort((a, b) => Math.hypot(a.p.x - o.x, a.p.z - o.z) - Math.hypot(b.p.x - o.x, b.p.z - o.z))[0];
      if (!n) return 0;
      aplicarAnclaje(n, 1); cd = D.anclaje.separacion; return 1;
    }
    const alto = o.y + D.cuerpo.armaAlto - centro.y;
    if (alto < D.cuerpo.bajo || alto > D.cuerpo.alto || !alcanzado(o, centro, D.cuerpo.radio, alc, ang)) return 0;
    aplicarCuerpo(dmg, op); cd = D.cuerpo.separacion; return 1;
  }
  function pulso(x, z, r, dmg) {
    if (!luchando() || !(dmg > 0) || !(r >= 0)) return 0;
    if (etapa === 1) {
      let n = 0;
      for (const a of nudos) if (etapa === 1 && Math.hypot(a.p.x - x, a.p.z - z) <= r + D.anclaje.radio) n += aplicarAnclaje(a, 1);
      return n;
    }
    return Math.hypot(centro.x - x, centro.z - z) <= r + D.cuerpo.radio ? aplicarCuerpo(dmg, { pulso: true }) : 0;
  }
  function tocaHaz(p, radio) {
    w.copy(p).sub(Haz.o); const s = clamp(w.dot(Haz.d), 0, Haz.t);
    w.copy(Haz.o).addScaledVector(Haz.d, s); return p.distanceTo(w) <= radio;
  }
  function actualizarHaz(dt) {
    if (!Haz.on || !(Haz.t > 0) || !(Sis.ST.luz > 0)) return;
    let n = null;
    if (etapa === 1) {
      n = nudos.filter(n => estado.golpes[n.i] < maxGolpes() && tocaHaz(n.p, D.anclaje.radio))
        .sort((a, b) => a.p.distanceToSquared(Haz.o) - b.p.distanceToSquared(Haz.o))[0];
      if (!n) return;
    } else { v.set(centro.x, centro.y + D.cuerpo.hazAlto, centro.z); if (!tocaHaz(v, D.cuerpo.hazRadio)) return; }
    const uso = Math.min(dt, Sis.ST.luz / D.haz.coste); Sis.ST.luz = Math.max(0, Sis.ST.luz - uso * D.haz.coste);
    if (n) aplicarAnclaje(n, uso / D.anclaje.hazPorGolpe);
    else aplicarCuerpo(D.cuerpo.hazDaño * uso, { haz: true, dt: uso });
  }

  function actualizar(dt, J) {
    if (!activo) return;
    if (estado !== Sis.ST.dueloLuna) { detener(); return; }
    if (!Number.isFinite(dt) || !(dt > 0) || !J) return;
    jugador = J;
    if (!J.vivo || !cerca(J)) {
      if (!suspendido) { reiniciarEtapa(); suspendido = true; refrescar(); Sis.marcador(null); }
      return;
    }
    if (Cin.activa || UI.dlg) {
      // El modelo también actúa en escenas. Descartar el golpe, conservar vida y
      // volver a anunciarlo al recuperar control evita una pose ya consumida.
      if (!pausado) {
        limpiarAtaque(); fase = estado.vencida ? 'vencida' : 'entrada'; t = 0;
        LunaRoja.pose(estado.vencida ? 'caer' : 'reposo'); Sis.marcador(null); pausado = true;
      }
      return;
    }
    if (pausado) { pausado = false; if (eq <= 0) eq = ficha().equilibrio || 0; }
    if (suspendido) { suspendido = false; reiniciarEtapa(); }
    if (estado.vencida) return;
    J.combate = Math.max(J.combate || 0, D.plaza.combate); cd = Math.max(0, cd - dt);
    // Subpasos temporales: un dt grande no salta un aviso ni duplica impactos.
    let restante = dt;
    while (restante > 0 && luchando()) {
      const a = ataque, limite = fase === 'entrada' ? D.plaza.entrada : fase === 'aviso' ? a.aviso :
        fase === 'ataque' ? a.Q.dur : fase === 'aturdida' ? D.cuerpo.aturdida : a ? a.ventana : D.zona.ventana;
      const paso = Math.min(restante, Math.max(0, limite - t)), previo = t, faseAntes = fase;
      t += paso; restante -= paso;
      if (fase === 'aviso') {
        materiales.aviso.opacity = D.arte.opacidad[0] + (D.arte.opacidad[1] - D.arte.opacidad[0]) * t / a.aviso;
        if (a.k === 'cierre') {
          const pulsos = Math.min(D.cierre.pulsos, 1 + Math.floor(t / a.aviso * D.cierre.pulsos));
          while (a.pulsos < pulsos) { a.pulsos++; Sonido.sfx('pulso', { pos: centro }); }
          marcas.slice(1).forEach((m, i) => { const d = (i === 0 ? -1 : 1) * a.Q.ancho / 2 * (1 - t / a.aviso);
            m.position.x = Math.cos(a.yaw) * d; m.position.z = -Math.sin(a.yaw) * d; });
        }
      } else if (fase === 'ataque') {
        if (a.k === 'barrido') {
          const a0 = -a.Q.arco / 2 + a.Q.arco * previo / a.Q.dur, a1 = -a.Q.arco / 2 + a.Q.arco * t / a.Q.dur;
          a.banda.rotation.y = a.yaw + a1; impacto(J, a0, a1);
        } else if (a.k === 'arco') {
          const inicio = a.Q.largo * previo / a.Q.dur, fin = a.Q.largo * t / a.Q.dur;
          a.arco.position.set(Math.sin(a.yaw) * fin, D.arte.suelo, Math.cos(a.yaw) * fin);
          impacto(J, inicio, fin);
        } else impacto(J, 0, 0);
      }
      if (!luchando()) break;
      if (fase === faseAntes) actualizarHaz(paso);
      if (!luchando() || fase !== faseAntes) continue;
      if (t < limite) break;
      t = 0;
      if (fase === 'entrada' || fase === 'recupera' || fase === 'aturdida') {
        if (fase === 'aturdida') eq = ficha().equilibrio;
        limpiarAtaque(); avisar(J);
      } else if (fase === 'aviso') {
        fase = 'ataque'; Sonido.sfx('chispa', { pos: centro });
        if (a.banda) a.banda.visible = true; if (a.arco) a.arco.visible = true;
        if (a.k !== 'barrido') impacto(J, 0, 0);
      } else if (fase === 'ataque') {
        const rec = a.ventana; limpiarAtaque(); ataque = { ventana: rec }; fase = 'recupera';
        if (a.Q.pose === 'extraer' || a.k === 'arco') LunaRoja.pose('aturdida');
      }
    }
    if (!luchando()) return;
    if (etapa === 1) Sis.marcador({ txt: 'Anclajes cortados · ' + rotos() + '/4 · {haz} o {atacar}',
      frac: estado.golpes.reduce((a, b) => a + b, 0) / (nudos.length * maxGolpes()) });
    else Sis.marcador({ txt: ataque && fase === 'aviso' && ataque.k === 'cierre' ?
      'Cerrar la salida · interrumpe con {atacar}' : fase === 'aturdida' ? 'Núcleo expuesto · {atacar} o {haz}' :
        'La Luna Roja · etapa ' + etapa + (fase === 'aviso' ? ' · ' + ataque.Q.nombre : ventana() ? ' · Aprovecha la apertura' : ''),
      frac: vida / ficha().vida });
  }
  function liberar(J, guardado) {
    if (!disponible() || estado !== guardado || !estado.vencida || estado.liberada || !interactuable(J)) return;
    estado.liberada = true; Sis.guardar(); detener();
    Sis.evento('c7:reserva_liberada'); Bus.emit('lunaVencida');
  }
  function interactuable(J) {
    if (!disponible() || !estado.vencida || estado.liberada || !J || !J.vivo || !cerca(J) ||
      Math.hypot(J.x - centro.x, J.z - centro.z) > D.reserva.radio || Math.abs(J.y - centro.y) > D.impacto.alto) return null;
    const guardado = estado;
    return { txt: 'Canalizar la luz cautiva · mantén {interactuar}', fn: () => liberar(J, guardado),
      x: centro.x, z: centro.z, canal: D.reserva.canal };
  }
  function barra(J) {
    if (!disponible() || !cerca(J) || estado.liberada) return null;
    return { jefe: true, nom: 'La Luna Roja', ani: etapa === 1 ? nudos.length * maxGolpes() - estado.golpes.reduce((a, b) => a + b, 0) : vida,
      aniMax: etapa === 1 ? nudos.length * maxGolpes() : ficha().vida,
      eq: etapa === 1 ? 1 : clamp(eq / ficha().equilibrio, 0, 1) };
  }
  function muestras() {
    crear(); const g = new THREE.Group(); g.name = 'Duelo Luna muestras';
    for (const m of Object.values(materiales)) g.add(m.isLineBasicMaterial ?
      new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), m) : new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m));
    const s = nudos[0].g.children.find(o => o.isSprite); g.add(new THREE.Sprite(s.material));
    g.visible = false; return g;
  }
  /* Solo presentación tras canalizar: no llama empezar(), no cambia vida, guardado, IA, sólidos ni daño. */
  function presentarVencida(C) {
    if (activo || !Sis.ST.dueloLuna || !Sis.ST.dueloLuna.vencida) return null;
    LunaRoja.crear(); LunaRoja.colocar(C.x, C.y, C.z, 0); LunaRoja.etapa(3); LunaRoja.mascara(1);
    for (let i = 0; i < 4; i++) LunaRoja.conexion(i, false);
    LunaRoja.mostrar(true); LunaRoja.pose('caer', 1);
    if (!presentarVencida.instantanea) {
      LunaRoja.actualizar(2); const nodos = [];
      LunaRoja.root.traverse(o => { if (o.isBone || o instanceof Halo) nodos.push({ o, p: o.position.clone(), q: o.quaternion.clone(), s: o.scale.clone(), alfa: o.opacidad }); });
      presentarVencida.instantanea = nodos;
    } else presentarVencida.instantanea.forEach(v => {
      v.o.position.copy(v.p); v.o.quaternion.copy(v.q); v.o.scale.copy(v.s); if (v.alfa !== undefined) v.o.opacidad = v.alfa;
    });
    LunaRoja.root.updateMatrixWorld(true);
    return LunaRoja.hueso('nucleo').getWorldPosition(new THREE.Vector3());
  }
  return { empezar, detener, actualizar, presentarVencida, get activo() { return activo; }, get etapa() { return etapa; },
    golpear, pulso, interactuable, barra, muestras };
})();
