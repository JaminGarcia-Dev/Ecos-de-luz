/* === Ecos de Luz · 72-escuela-luz.js ===
   Escuela ofensiva de luz: orbe, abanico cercano, escudo y lanza cargada.
   Cargar después de 71-arco-luz.js (TallerLuz). No equipa un arma ni usa el haz o el Pulso.
   defender consulta una parada; Combate aplica el resultado y descuenta su coste de inmediato. */
"use strict";

const ESCUELA_LUZ = {
  orbe: { nom: 'Orbe guiado', coste: 5, daño: 12, peso: 1, aviso: .12, activo: .06, recupera: .32, alcance: 9, vel: 16, radio: .22, guia: 4, perfora: false, forma: 'orbe' },
  rafaga: { nom: 'Abanico de luz', coste: 16, daño: 22, peso: 2, aviso: .20, activo: .12, recupera: .42, alcance: 3.6, ang: .90 },
  escudo: { nom: 'Escudo de luz', coste: 10, daño: 0, peso: 2, aviso: .08, activo: .30, recupera: .42, radio: 1.05, ang: 1.10, espera: .60 },
  lanza: { nom: 'Lanza de luz', coste: 20, daño: 42, peso: 3, carga: .90, aviso: .16, activo: .08, recupera: .50, alcance: 26, vel: 38, radio: .30, perfora: false, largoVis: 1.8, anchoVis: .11, puntaVis: .35 },
  entrada: { bufer: .16, marchaCanaliza: .30, marchaDisparo: .55, marchaEscudo: .40, cargaMax: 2 },
  motor: { ...ARCO.motor, elemento: 'luz', arco: false, color: 0x9ffff0, secundario: 0xfff0b0, grosor: .14, largo: .24, punta: .12,
    palmaRadio: .09, palmaAlto: .10, aroRadio: .16, aroTubo: .012 }
};

const EscuelaLuz = (() => {
  const C = ESCUELA_LUZ, M = TallerLuz.crearMotor(C.motor);
  let carga = null, accion = null, bufer = 0, espera = 0, guardiaAntes = false, ultimaE = null, muestraModelo = null;
  function empezar(id) {
    accion = { id, F: C[id], t: 0, lanzado: false, toc: new Set(), yaw: null, parado: false };
    carga = null;
  }
  function avanzar(dt, E, R) {
    const A = accion, F = A.F, antes = A.t; A.t += dt;
    R.yaw = A.yaw === null ? TallerLuz.rumbo(E) : A.yaw;
    if (A.id !== 'escudo' && !A.lanzado && A.t >= F.aviso) {
      if (E.luz < F.coste || (A.id !== 'rafaga' && !M.haySitio(1))) {
        R.aviso = E.luz < F.coste ? TallerLuz.falta() : 'Espera a que llegue la luz de {atacar}.';
        accion = null; return;
      }
      A.yaw = R.yaw; A.lanzado = true; A.daño = F.daño * Sis.dmgMult(); R.gasta = F.coste;
      if (A.id === 'rafaga') {
        M.chispa(E.x + Math.sin(A.yaw) * F.alcance, E.y + C.motor.alto, E.z + Math.cos(A.yaw) * F.alcance);
      } else M.lanzar(F, E, A.yaw, A.id === 'orbe');
    }
    const finActivo = F.aviso + F.activo;
    if (A.id === 'rafaga' && A.lanzado && A.t >= F.aviso && antes < finActivo) {
      const o = { x: E.x, y: E.y + C.motor.alto, z: E.z, yaw: A.yaw };
      Impacto.sector(o, F.alcance, F.ang, A.daño, { peso: F.peso, vertical: true, romperSombra: false }, A.toc);
    }
    R.bloquea = A.t < finActivo;
    R.ralentiza = A.id === 'escudo' ? C.entrada.marchaEscudo : C.entrada.marchaDisparo;
    R.pose = { nombre: 'luz_' + A.id, k: clamp(A.t / (finActivo + F.recupera), 0, 1) };
    if (A.id === 'escudo' && A.t >= F.aviso && A.t < finActivo && !A.parado) M.ver('escudo', E, F);
    if (A.id === 'rafaga' && A.lanzado && A.t < finActivo) M.ver('abanico', E, F);
    if (A.t >= finActivo + F.recupera) accion = null;
  }
  /* E.guardia/Pulsada y E.esquivarPulsado son acciones, nunca códigos de teclado o mando. */
  function entrada(dt, E) {
    const R = TallerLuz.salida(); dt = Math.max(0, dt); M.ver(null); M.guiar(E.objetivo);
    const pulsada = E.guardiaPulsada === undefined ? !!E.guardia && !guardiaAntes : E.guardiaPulsada;
    guardiaAntes = !!E.guardia; ultimaE = { ...E };
    espera = Math.max(0, espera - dt); bufer = Math.max(0, bufer - dt);
    if (!E.libre || E.cancelar) { carga = accion = null; bufer = 0; return R; }
    if (E.atacarPulsado) bufer = C.entrada.bufer;
    const abanico = E.guardia && bufer > 0;
    if (accion && (pulsada || E.esquivarPulsado) && accion.t >= accion.F.aviso + accion.F.activo) accion = null;
    if (accion && accion.id === 'escudo' && abanico && !accion.parado) accion = null;
    if (accion) { avanzar(dt, E, R); return R; }
    if (carga !== null) {
      if (E.guardia || E.esquivarPulsado) { carga = null; bufer = 0; return R; }
      carga = Math.min(C.entrada.cargaMax, carga + dt);
      if (!E.atacar) { empezar(carga >= C.lanza.carga ? 'lanza' : 'orbe'); avanzar(0, E, R); }
      else {
        R.ralentiza = C.entrada.marchaCanaliza; R.yaw = TallerLuz.rumbo(E);
        R.pose = { nombre: 'luz_canaliza', k: clamp(carga / C.lanza.carga, 0, 1) };
        M.ver('guia', E, C.lanza);
      }
      return R;
    }
    if (bufer > 0) {
      bufer = 0; const id = abanico ? 'rafaga' : 'orbe';
      if (E.luz < C[id].coste) { R.aviso = TallerLuz.falta(); return R; }
      if (!abanico && E.atacar) { carga = 0; R.ralentiza = C.entrada.marchaCanaliza; R.pose = { nombre: 'luz_canaliza', k: 0 }; R.yaw = TallerLuz.rumbo(E); }
      else { empezar(id); avanzar(0, E, R); }
    } else if (pulsada && espera === 0 && !E.esquivarPulsado) {
      empezar('escudo'); espera = C.escudo.aviso + C.escudo.activo + C.escudo.recupera + C.escudo.espera;
      avanzar(0, E, R);
    }
    return R;
  }
  /* No recibe eventos por su cuenta ni cambia hp, luz, invulnerabilidad o ataques enemigos.
     Llamar antes de la guardia común, después de descartar esquiva, caída y daño ya evitado.
     Si bloquea, descontar gasta y ejecutar la desviación de la parada común una sola vez. */
  function defender(e, luz) {
    const R = { gasta: 0, bloquea: false, parada: false, aviso: null }, A = accion, F = C.escudo;
    if (!A || A.id !== 'escudo' || A.parado || !ultimaE || A.t < F.aviso || A.t >= F.aviso + F.activo) return R;
    if (e.caida || e.imparable || !Number.isFinite(e.x) || !Number.isFinite(e.z)) return R;
    const yaw = TallerLuz.rumbo(ultimaE), frente = Math.atan2(e.x - ultimaE.x, e.z - ultimaE.z);
    const dif = Math.atan2(Math.sin(frente - yaw), Math.cos(frente - yaw));
    if (Math.abs(dif) > F.ang) return R;
    if (luz < F.coste) {
      R.aviso = 'Falta luz para {guardia}. Aléjate con {esquivar}.';
      A.parado = true; A.t = F.aviso + F.activo; M.ver(null); return R;
    }
    A.parado = true; A.t = F.aviso + F.activo;
    R.gasta = F.coste; R.bloquea = R.parada = true;
    M.ver(null); M.chispa(ultimaE.x, ultimaE.y + C.motor.alto, ultimaE.z);
    return R;
  }
  function modelo() {
    const g = new THREE.Group(), F = C.motor, mat = M.material(F.color);
    const orbe = new THREE.Mesh(new THREE.SphereGeometry(F.palmaRadio, F.lados * 2, F.lados), mat);
    orbe.position.y = F.palmaAlto; g.add(orbe);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(F.aroRadio, F.aroTubo, F.lados, F.arcoTramos), mat);
    aro.rotation.x = Math.PI / 2; aro.position.y = F.palmaAlto; g.add(aro);
    g.name = 'guia_luz'; return g;
  }
  function crear(escena) { M.crear(escena); if (!muestraModelo) muestraModelo = modelo(); }
  function reiniciar() { carga = accion = null; bufer = espera = 0; guardiaAntes = false; ultimaE = null; M.reiniciar(); }
  return { id: 'luz', nom: 'Escuela de luz', entrada, actualizar: M.actualizar, reiniciar, crear, modelo, defender,
    muestras: () => M.muestras().concat(muestraModelo ? [muestraModelo] : []),
    estado: () => ({ ...M.estado(), carga, accion: accion ? accion.id : null, bufer, espera }) };
})();
