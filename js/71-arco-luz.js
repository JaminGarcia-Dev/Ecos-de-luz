/* === Ecos de Luz · 71-arco-luz.js ===
   Arco de luz y taller compartido de proyectiles. Scripts clásicos; cargar después de Impacto.
   entrada cobra por su resultado, nunca escribe Sis.ST. actualizar solo termina vuelos y efectos.
   Arte sustituible, sin texturas ni shaders propios. La lógica no necesita crear ni THREE. */
"use strict";

const ARCO = {
  rapido: { nom: 'Disparo rápido', coste: 3, daño: 14, peso: 1, aviso: .10, activo: .04, recupera: .26, alcance: 22, vel: 30, radio: .13, perfora: false },
  tensado: { nom: 'Tiro tensado', coste: 10, daño: 32, peso: 2, carga: .75, aviso: .08, activo: .06, recupera: .36, alcance: 30, vel: 42, radio: .16, perfora: true },
  abanico: { nom: 'Tres luces', coste: 12, daño: 8, peso: 1, aviso: .18, activo: .10, recupera: .42, alcance: 7, vel: 22, radio: .16, flechas: 3, ang: .24, perfora: false },
  marca: { nom: 'Flecha de marca', coste: 5, daño: 18, peso: 1, aviso: .06, activo: .04, recupera: .30, alcance: 18, vel: 34, radio: .14, perfora: false, huella: .65 },
  entrada: { trasEsquiva: .30, bufer: .16, marchaApunta: .45, marchaDisparo: .65, cargaMax: 2, recuperacionObligada: .5 },
  motor: { elemento: 'luz', arco: true, max: 12, efectos: 8, paso: .12, alto: .78, epsilon: .00001, contactos: 32, guia: 16, durEfecto: .22,
    color: 0xffe9a8, secundario: 0x9ffff0, grosor: .055, largo: .70, punta: .16, lados: 6, opacidad: .8, tamañoEfecto: .32,
    arcoAlto: .55, arcoAncho: .2, arcoTubo: .034, arcoTramos: 12, cuerda: .009, abanicoAng: .90, opacidadArea: .18 }
};

/* ---------- taller compartido: cada estilo conserva su propio lote y sus propios vuelos ---------- */
const TallerLuz = (() => {
  const rumbo = E => E.objetivo ? Math.atan2(E.objetivo.x - E.x, E.objetivo.z - E.z) : E.yaw;
  const salida = () => ({ gasta: 0, ralentiza: 1, bloquea: false, yaw: null, pose: { nombre: 'reposo', k: 0 } });
  const falta = () => 'Falta luz. Suelta {atacar} y espera.';
  function crearMotor(C) {
    const vuelos = [], efectos = [];
    let lote, puntas, guia, aro, escudo, matriz, vector, arriba, muestrasVis = [], vista = null;
    const haySitio = n => vuelos.length + n <= C.max;
    function chispa(x, y, z, dur) {
      if (efectos.length >= C.efectos) efectos.shift();
      efectos.push({ x, y, z, t: 0, dur: dur || C.durEfecto });
    }
    function direccion(E, yaw, F) {
      const dx = Math.sin(yaw), dz = Math.cos(yaw), h = E.objetivo ? Math.hypot(E.objetivo.x - E.x, E.objetivo.z - E.z) : 0;
      const dy = h > C.epsilon ? (E.objetivo.y - E.y - C.alto) / h : 0, l = Math.hypot(dx, dy, dz);
      return { dx: dx / l, dy: dy / l, dz: dz / l, x: E.x, y: E.y + C.alto, z: E.z, F };
    }
    function lanzar(F, E, yaw, objetivoGuia) {
      const p = direccion(E, yaw, F);
      Object.assign(p, { recorrido: 0, toc: new Set(), daño: F.daño * Sis.dmgMult(), objetivo: objetivoGuia && E.objetivo ? { ...E.objetivo } : null,
        op: { elemento: C.elemento || 'luz', arco: !!C.arco, perfora: !!F.perfora, vertical: true, romper: false, romperSombra: false, ...F.op, peso: F.peso } });
      vuelos.push(p);
    }
    function guiar(objetivo) {
      if (!objetivo) return;
      for (const p of vuelos) if (p.F.guia && p.objetivo) Object.assign(p.objetivo, objetivo);
    }
    function obstaculo(x, y, z, r) {
      if (typeof Sol !== 'undefined' && Sol.dentro(x, y, z, r)) return true;
      if (typeof sueloEnJ === 'function' && y - r <= sueloEnJ(x, y, z)) return true;
      return false;
    }
    function viajar(p, dt) {
      const F = p.F;
      if (p.objetivo && F.guia) {
        const dx = p.objetivo.x - p.x, dy = p.objetivo.y - p.y, dz = p.objetivo.z - p.z, l = Math.hypot(dx, dy, dz);
        if (l > C.epsilon) {
          const k = 1 - Math.exp(-F.guia * dt);
          p.dx = lerp(p.dx, dx / l, k); p.dy = lerp(p.dy, dy / l, k); p.dz = lerp(p.dz, dz / l, k);
          const n = Math.hypot(p.dx, p.dy, p.dz) || 1; p.dx /= n; p.dy /= n; p.dz /= n;
        }
      }
      const distancia = Math.min(F.vel * dt, F.alcance - p.recorrido), pasos = Math.max(1, Math.ceil(distancia / C.paso)), paso = distancia / pasos;
      for (let i = 0; i < pasos; i++) {
        const x = p.x + p.dx * paso, y = p.y + p.dy * paso, z = p.z + p.dz * paso;
        if (obstaculo(p.x, p.y, p.z, F.radio) || obstaculo(x, y, z, F.radio)) { chispa(p.x, p.y, p.z); return false; }
        let contacto, n = 0;
        do {
          contacto = Impacto.proyectil(p.x, p.y, p.z, x, y, z, F.radio, p.daño, p.op, p.toc);
          if (contacto) {
            chispa(contacto.x, contacto.y, contacto.z, F.huella);
            if (!F.perfora) return false;
          }
          n++;
        } while (contacto && n < C.contactos);
        p.x = x; p.y = y; p.z = z; p.recorrido += paso;
      }
      return p.recorrido < F.alcance - C.epsilon;
    }
    function actualizar(dt) {
      dt = Math.max(0, dt);
      for (let i = efectos.length - 1; i >= 0; i--) { efectos[i].t += dt; if (efectos[i].t >= efectos[i].dur) efectos.splice(i, 1); }
      for (let i = vuelos.length - 1; i >= 0; i--) if (!viajar(vuelos[i], dt)) vuelos.splice(i, 1);
      dibujar();
    }
    /* ---------- arte sustituible: dos lotes para flechas, puntos de guía y luz residual ---------- */
    function material(color) { return new THREE.MeshBasicMaterial({ color, transparent: true, opacity: C.opacidad, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }); }
    function crear(escena) {
      if (lote) return;
      matriz = new THREE.Object3D(); vector = new THREE.Vector3(); arriba = new THREE.Vector3(0, 0, 1);
      const g = new THREE.CylinderGeometry(1, 1, 1, C.lados); g.rotateX(Math.PI / 2);
      const p = new THREE.ConeGeometry(1, 1, C.lados); p.rotateX(Math.PI / 2);
      const b = new THREE.SphereGeometry(1, C.lados, C.lados), m = material(C.color), s = material(C.secundario);
      lote = new THREE.InstancedMesh(g, m, C.max + C.efectos); puntas = new THREE.InstancedMesh(p, m, C.max);
      guia = new THREE.InstancedMesh(b, s, C.guia + C.max);
      const area = material(C.secundario); area.opacity = C.opacidadArea; area.side = THREE.DoubleSide;
      aro = new THREE.Mesh(new THREE.RingGeometry(.8, 1, C.lados * 4, 1, Math.PI / 2 - C.abanicoAng, C.abanicoAng * 2), area);
      aro.rotation.x = Math.PI / 2;
      escudo = new THREE.Mesh(b, area);
      for (const o of [lote, puntas, guia, aro, escudo]) { o.frustumCulled = false; o.visible = false; escena.add(o); }
      muestrasVis = [new THREE.InstancedMesh(g, m, 1), new THREE.InstancedMesh(p, m, 1), new THREE.InstancedMesh(b, s, 1), new THREE.Mesh(aro.geometry, area), new THREE.Mesh(b, area)];
      for (const o of muestrasVis) o.frustumCulled = false;
      dibujar();
    }
    function poner(m, i, x, y, z, sx, sy, sz, d) {
      matriz.position.set(x, y, z); matriz.scale.set(sx, sy, sz);
      matriz.quaternion.set(0, 0, 0, 1);
      if (d) matriz.quaternion.setFromUnitVectors(arriba, vector.set(d.dx, d.dy, d.dz));
      matriz.updateMatrix(); m.setMatrixAt(i, matriz.matrix);
    }
    function contar(m, n) { m.count = n; m.visible = n > 0; if (n) m.instanceMatrix.needsUpdate = true; }
    function dibujar() {
      if (!lote) return;
      let n = 0, ng = 0;
      for (const p of vuelos) {
        if (p.F.forma === 'orbe') { poner(guia, ng++, p.x, p.y, p.z, p.F.radio, p.F.radio, p.F.radio); continue; }
        const largo = p.F.largoVis || C.largo, ancho = p.F.anchoVis || C.grosor, punta = p.F.puntaVis || C.punta;
        poner(lote, n, p.x, p.y, p.z, ancho, ancho, largo, p);
        poner(puntas, n, p.x + p.dx * largo / 2, p.y + p.dy * largo / 2, p.z + p.dz * largo / 2, ancho * 2, ancho * 2, punta, p); n++;
      }
      contar(puntas, n);
      for (const e of efectos) { const k = C.tamañoEfecto * (1 - e.t / e.dur); poner(lote, n++, e.x, e.y, e.z, k, k, k); }
      contar(lote, n);
      aro.visible = escudo.visible = false;
      if (vista) {
        const E = vista.E, F = vista.F;
        if (vista.tipo === 'guia') {
          const p = direccion(E, rumbo(E), F);
          let libreHasta = 0;
          for (let i = 1; i <= C.guia; i++) {
            const d = F.alcance * i / C.guia;
            let tapada = false;
            while (libreHasta < d) {
              libreHasta = Math.min(d, libreHasta + C.paso);
              if (obstaculo(p.x + p.dx * libreHasta, p.y + p.dy * libreHasta, p.z + p.dz * libreHasta, F.radio)) { tapada = true; break; }
            }
            if (tapada) break;
            poner(guia, ng++, p.x + p.dx * d, p.y + p.dy * d, p.z + p.dz * d, C.grosor, C.grosor, C.grosor);
          }
        } else {
          const o = vista.tipo === 'escudo' ? escudo : aro;
          o.visible = true; o.position.set(E.x, E.y + C.alto, E.z); o.rotation.y = rumbo(E);
          const r = F.alcance || F.radio; o.scale.set(r, r, r);
        }
      }
      contar(guia, ng);
    }
    function ver(tipo, E, F) { vista = tipo ? { tipo, E: { ...E }, F } : null; dibujar(); }
    function reiniciar() { vuelos.length = efectos.length = 0; vista = null; dibujar(); }
    return { crear, actualizar, reiniciar, lanzar, guiar, haySitio, chispa, ver, material, muestras: () => muestrasVis.slice(),
      estado: () => ({ vuelos: vuelos.length, efectos: efectos.length, vista: vista ? vista.tipo : null }) };
  }
  return { rumbo, salida, falta, crearMotor };
})();

const ArcoLuz = (() => {
  const C = ARCO, M = TallerLuz.crearMotor(C.motor);
  let carga = null, accion = null, bufer = 0, muestraModelo = null;
  function empezar(id) { accion = { id, F: C[id], t: 0, lanzado: false, yaw: null }; carga = null; }
  function avanzar(dt, E, R) {
    const A = accion, F = A.F; A.t += dt;
    if (!A.lanzado) {
      R.yaw = TallerLuz.rumbo(E);
      if (A.t >= F.aviso) {
        const n = F.flechas || 1;
        if (E.luz < F.coste || !M.haySitio(n)) {
          R.aviso = E.luz < F.coste ? TallerLuz.falta() : 'Espera a que llegue la luz de {atacar}.';
          accion = null; return;
        }
        A.yaw = R.yaw; A.lanzado = true; R.gasta = F.coste;
        for (let i = 0; i < n; i++) M.lanzar(F, E, A.yaw + (i - (n - 1) / 2) * (F.ang || 0));
      }
    } else R.yaw = A.yaw;
    R.pose = { nombre: 'arco_' + A.id, k: clamp(A.t / (F.aviso + F.activo + F.recupera), 0, 1) };
    R.ralentiza = C.entrada.marchaDisparo;
    R.bloquea = A.t < F.aviso + F.activo + F.recupera * C.entrada.recuperacionObligada;
    if (A.t >= F.aviso + F.activo + F.recupera) accion = null;
  }
  /* E.guardia permite el abanico; E.cancelar interrumpe una acción por golpe, escena o esquiva aceptada. */
  function entrada(dt, E) {
    const R = TallerLuz.salida(); dt = Math.max(0, dt); M.ver(null);
    bufer = Math.max(0, bufer - dt);
    if (!E.libre || E.cancelar) { carga = accion = null; bufer = 0; return R; }
    if (E.atacarPulsado) bufer = C.entrada.bufer;
    if (accion && (E.guardia || E.esquivarPulsado) && accion.t >= accion.F.aviso + accion.F.activo + accion.F.recupera * C.entrada.recuperacionObligada) accion = null;
    if (accion) { avanzar(dt, E, R); return R; }
    if (carga !== null) {
      if (E.guardia || E.esquivarPulsado) { carga = null; bufer = 0; return R; }
      carga = Math.min(C.entrada.cargaMax, carga + dt);
      if (!E.atacar) { empezar(carga >= C.tensado.carga ? 'tensado' : 'rapido'); avanzar(0, E, R); }
      else {
        R.ralentiza = C.entrada.marchaApunta; R.yaw = TallerLuz.rumbo(E);
        R.pose = { nombre: 'arco_apunta', k: clamp(carga / C.tensado.carga, 0, 1) };
        M.ver('guia', E, C.tensado);
      }
      return R;
    }
    if (bufer > 0) {
      bufer = 0;
      const id = E.guardia ? 'abanico' : E.esquivaReciente < C.entrada.trasEsquiva ? 'marca' : 'rapido';
      if (E.luz < C[id].coste) { R.aviso = TallerLuz.falta(); return R; }
      if (id === 'rapido' && E.atacar) { carga = 0; R.ralentiza = C.entrada.marchaApunta; R.pose = { nombre: 'arco_apunta', k: 0 }; R.yaw = TallerLuz.rumbo(E); }
      else { empezar(id); avanzar(0, E, R); }
    }
    return R;
  }
  /* empuñadura en el origen; +Y arriba, +Z dirección del disparo */
  function modelo() {
    const g = new THREE.Group(), F = C.motor, mat = M.material(F.color);
    const geo = new THREE.TorusGeometry(F.arcoAlto, F.arcoTubo, F.lados, F.arcoTramos, Math.PI);
    geo.rotateZ(-Math.PI / 2);
    const arco = new THREE.Mesh(geo, mat); arco.scale.x = F.arcoAncho / F.arcoAlto; g.add(arco);
    const cuerda = new THREE.Mesh(new THREE.CylinderGeometry(F.cuerda, F.cuerda, F.arcoAlto * 2, F.lados), mat); g.add(cuerda);
    g.name = 'arco_luz'; return g;
  }
  function crear(escena) { M.crear(escena); if (!muestraModelo) muestraModelo = modelo(); }
  function reiniciar() { carga = accion = null; bufer = 0; M.reiniciar(); }
  return { id: 'arco', nom: 'Arco de luz', entrada, actualizar: M.actualizar, reiniciar, crear, modelo,
    muestras: () => M.muestras().concat(muestraModelo ? [muestraModelo] : []),
    estado: () => ({ ...M.estado(), carga, accion: accion ? accion.id : null, bufer }) };
})();
