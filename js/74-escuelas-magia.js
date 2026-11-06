/* === Ecos de Luz · 74-escuelas-magia.js ===
   Cuatro escuelas; una ranura ofensiva. TallerLuz conserva todo el viaje de proyectiles.
   Contrato con las Sombras (fase 7; coordinar con quien integra 35):
   op.elemento = 'viento' | 'brasa' | 'escarcha' | 'oscuridad'; op.movimiento = id de ficha.
   op.empuje = impulso según el contrato 70, nunca teletransporte; op.perfora atraviesa cuerpos, no defensas.
   op.romper / romperSombra = presión de rotura, no anula la protección posterior de 4 s.
   op.lenta = fracción de locomoción retirada; op.durLenta = segundos. No altera avisos ya iniciados.
   op.sujeta = segundos; élites: como máximo una sujeción cada 5 s; jefes: solo daño y peso.
   op.suelo = zona a ras del suelo; op.periodico = pulso de quemadura; nunca sumar estados de varias zonas.
   op.ocluir = comprobar línea libre desde el origen del impacto antes de alcanzar cada objetivo de área.
   op.origen = { x, y, z }, añadido por 70 al reenviar; el receptor lo usa con ocluir.
   Oni anclado lee elemento/empuje: resiste desplazamiento; daño de viento x.75 mientras está anclado.
   Escoria lee elemento/periodico: brasa x.70 con cubierta; x1 en junta/rotura.
   Alada lee suelo: solo toca si su altura intersecta la zona; aterrizaje siempre alcanzable.
   Lanzadora de escarcha lee elemento/lenta: daño x.70 con cubierta y lenta x.5; x1 al recuperar.
   Oni lee lenta/sujeta/romper: lenta x.5 y sujeción limitada; conserva daño y presión de rotura.
   Devoradora lee elemento/sujeta: oscuridad x.70 con pecho cerrado; x1 durante 1.4 s tras absorción.
   Nunca inmunidad al daño, curación al recibirlo ni resistencia >50 %. Metas: +25..60 % de tiempo.
   IMPORTANTE: 70 actual filtra estos campos; 71 actual no copia F.op. Cambios exactos en la entrega.
   Este archivo no parchea globales ni registra listeners. Los estados los aplica el receptor común.
   entrada devuelve costes, incluido gastaVida en oscuridad; el integrador los descuenta antes de actualizar. */
"use strict";

const ESCUELAS_MAGIA_CFG = {
  entrada: { bufer: .16, trasEsquiva: .30, cargaMax: 2, recuperacionObligada: .25, vidaMin: 1 },
  zona: { max: 1, pasoVista: .12, radioVista: .06, alto: .12, desnivelMax: 2.5, epsilon: .000001,
    lados: 24, opacidad: .20, aroInterior: .86, modeloRadio: .14, modeloTubo: .018, modeloAlto: .10, tintaColor: 0x302a3e, tintaOpacidad: .85 },
  motor: { ...ARCO.motor, max: 12, efectos: 8, palmaRadio: .08, palmaAlto: .10 }
};

const ESCUELA_VIENTO = {
  id: 'viento', nom: 'Escuela de viento', marcha: .95, canaliza: .80,
  normal: { nom: 'Cuchilla de aire', coste: 4, daño: 13, peso: 1, aviso: .10, activo: .06, recupera: .26, alcance: 18, vel: 28, radio: .24, empuje: 3, tipo: 'proyectil', perfora: true },
  area: { nom: 'Frente de viento', coste: 12, daño: 18, peso: 2, aviso: .15, activo: .12, recupera: .38, alcance: 4, ang: .80, empuje: 6, tipo: 'sector' },
  paso: { nom: 'Corte al paso', coste: 6, daño: 16, peso: 1, aviso: .06, activo: .05, recupera: .23, alcance: 14, vel: 32, radio: .24, empuje: 3.5, tipo: 'proyectil', perfora: true },
  cargado: { nom: 'Corte de presión', coste: 18, daño: 40, peso: 3, carga: .55, aviso: .10, activo: .08, recupera: .42, alcance: 22, vel: 36, radio: .30, empuje: 6, tipo: 'proyectil', perfora: true },
  motor: { ...ESCUELAS_MAGIA_CFG.motor, color: 0xbdeee0, secundario: 0xccefff, grosor: .12, largo: 1.2, punta: .10 }
};

const ESCUELA_BRASA = {
  id: 'brasa', nom: 'Escuela de brasa', marcha: .55, canaliza: .35,
  normal: { nom: 'Ascua', coste: 4, daño: 12, peso: 1, aviso: .12, activo: .06, recupera: .32, alcance: 10, vel: 18, radio: .24, empuje: 1, tipo: 'proyectil', forma: 'orbe', perfora: false },
  area: { nom: 'Sello ardiente', coste: 18, daño: 16, peso: 2, aviso: .40, activo: .10, recupera: .45, alcance: 6, radio: 1.8, dur: 3, intervalo: .5, dañoPulso: 3, empuje: 0, tipo: 'zona' },
  paso: { nom: 'Rastro de brasa', coste: 8, daño: 10, peso: 1, aviso: .08, activo: .08, recupera: .30, alcance: 0, radio: 1.3, dur: 2, intervalo: .5, dañoPulso: 2, empuje: 0, tipo: 'zona' },
  cargado: { nom: 'Estallido', coste: 20, daño: 48, peso: 3, carga: .75, aviso: .16, activo: .10, recupera: .50, alcance: 8, radio: 1.8, dur: .20, empuje: 3.5, tipo: 'zona' },
  motor: { ...ESCUELAS_MAGIA_CFG.motor, color: 0xffb65c, secundario: 0xff7036, grosor: .12, largo: .30 }
};

const ESCUELA_ESCARCHA = {
  id: 'escarcha', nom: 'Escuela de escarcha', marcha: .65, canaliza: .40,
  normal: { nom: 'Aguja fría', coste: 4, daño: 14, peso: 1, aviso: .10, activo: .06, recupera: .29, alcance: 12, vel: 24, radio: .24, empuje: 1, lenta: .15, durLenta: 1, tipo: 'proyectil', perfora: false },
  area: { nom: 'Abanico frío', coste: 12, daño: 22, peso: 2, aviso: .20, activo: .12, recupera: .40, alcance: 3.5, ang: .65, empuje: 1, lenta: .30, durLenta: 2, tipo: 'sector' },
  paso: { nom: 'Huella fría', coste: 10, daño: 18, peso: 2, aviso: .10, activo: .08, recupera: .32, alcance: 0, radio: 1.6, dur: 2, empuje: 0, lenta: .25, durLenta: 2, tipo: 'zona' },
  cargado: { nom: 'Quiebre de hielo', coste: 18, daño: 44, peso: 3, carga: .65, aviso: .12, activo: .08, recupera: .45, alcance: 14, vel: 28, radio: .30, empuje: 3.5, lenta: .30, durLenta: 2, romper: true, tipo: 'proyectil', perfora: false },
  motor: { ...ESCUELAS_MAGIA_CFG.motor, color: 0xafdfff, secundario: 0xe4f5ff, grosor: .09, largo: .65, punta: .25 }
};

const ESCUELA_OSCURIDAD = {
  id: 'oscuridad', nom: 'Escuela de oscuridad', marcha: .60, canaliza: .35,
  normal: { nom: 'Hebra de tinta', coste: 3, costeVida: 1, daño: 15, peso: 1, aviso: .12, activo: .06, recupera: .32, alcance: 7, vel: 18, radio: .24, empuje: 0, tipo: 'proyectil', perfora: false },
  area: { nom: 'Pozo contenido', coste: 14, costeVida: 2, daño: 28, peso: 2, aviso: .35, activo: .10, recupera: .50, alcance: 5, radio: 2, dur: 2.5, empuje: 0, lenta: .20, durLenta: 1.2, tipo: 'zona' },
  paso: { nom: 'Nudo breve', coste: 10, costeVida: 1, daño: 22, peso: 2, aviso: .12, activo: .08, recupera: .40, alcance: 4.5, ang: .35, empuje: 0, sujeta: .45, tipo: 'sector' },
  cargado: { nom: 'Ruptura de tinta', coste: 18, costeVida: 3, daño: 46, peso: 3, carga: .65, aviso: .14, activo: .08, recupera: .48, alcance: 9, vel: 22, radio: .30, empuje: 1.5, tipo: 'proyectil', perfora: true },
  motor: { ...ESCUELAS_MAGIA_CFG.motor, color: 0xa27b87, secundario: 0xf06a43, grosor: .10, largo: .80, punta: .12 }
};

/* ---------- fábrica de acciones y zonas; los proyectiles solo los mueve TallerLuz ---------- */
const EscuelasMagia = (() => {
  const G = ESCUELAS_MAGIA_CFG, total = F => F.aviso + F.activo + F.recupera;
  const finCompromiso = F => F.aviso + F.activo + F.recupera * G.entrada.recuperacionObligada;
  function crear(C) {
    const M = TallerLuz.crearMotor(C.motor), zonas = [], artes = [];
    let accion = null, carga = null, bufer = 0, muestraModelo = null, escenaPropia = null;
    function opciones(F, id, periodico = false) {
      return { elemento: C.id, movimiento: id, peso: periodico ? 1 : F.peso, empuje: periodico ? 0 : F.empuje,
        perfora: !!F.perfora, romper: !!F.romper, romperSombra: !!F.romper, vertical: true,
        lenta: F.lenta || 0, durLenta: F.durLenta || 0, sujeta: F.sujeta || 0,
        suelo: F.tipo === 'zona', periodico, ocluir: true };
    }
    function empezar(id) { accion = { id, F: C[id], t: 0, lanzado: false, yaw: null, toc: new Set() }; carga = null; }
    function falta(E, F) {
      if (!Number.isFinite(E.luz) || E.luz < F.coste) return TallerLuz.falta();
      if (F.costeVida && (!Number.isFinite(E.vida) || E.vida < G.entrada.vidaMin)) return 'Falta conocer tu vida para {atacar}.';
      return null;
    }
    /* La selección del centro comprueba sólidos antes del cobro. No simula un proyectil. */
    function centro(E, F, yaw) {
      const d = E.objetivo ? Math.min(F.alcance, Math.hypot(E.objetivo.x - E.x, E.objetivo.z - E.z)) : F.alcance;
      const x = E.x + Math.sin(yaw) * d, z = E.z + Math.cos(yaw) * d;
      const suelo = typeof sueloEnJ === 'function' ? sueloEnJ(x, E.y, z) : E.y;
      if (!Number.isFinite(suelo) || Math.abs(suelo - E.y) > G.zona.desnivelMax) return null;
      const y = suelo + G.zona.alto, origenY = E.y + C.motor.alto;
      const largo = Math.hypot(d, y - origenY), pasos = Math.max(1, Math.ceil(largo / G.zona.pasoVista));
      for (let i = 0; i <= pasos; i++) {
        const u = i / pasos;
        if (typeof Sol !== 'undefined' && Sol.dentro(lerp(E.x, x, u), lerp(origenY, y, u), lerp(E.z, z, u), G.zona.radioVista)) return null;
      }
      return { x, y, z };
    }
    function tocarZona(Z, daño, toc, periodico) {
      Impacto.circulo(Z.x, Z.y, Z.z, Z.F.radio, daño, opciones(Z.F, Z.id, periodico), toc);
    }
    function ponerZona(p, F, id, mult) {
      zonas.length = 0;
      const Z = { ...p, F, id, mult, t: 0, pulso: 0, toc: new Set() };
      zonas.push(Z); tocarZona(Z, F.daño * mult, Z.toc, false);
      M.chispa(p.x, p.y, p.z); dibujarZonas();
    }
    function avanzar(dt, E, R) {
      const A = accion, F = A.F, antes = A.t; A.t += dt;
      R.yaw = A.yaw === null ? TallerLuz.rumbo(E) : A.yaw;
      if (!A.lanzado && A.t >= F.aviso) {
        const aviso = falta(E, F), p = F.tipo === 'zona' ? centro(E, F, R.yaw) : null;
        if (aviso || (F.tipo === 'proyectil' && !M.haySitio(1)) || (F.tipo === 'zona' && !p)) {
          R.aviso = aviso || (F.tipo === 'zona' ? 'Busca suelo libre para {atacar}.' : 'Espera a que termine {atacar}.');
          accion = null; return;
        }
        A.lanzado = true; A.yaw = R.yaw; A.daño = F.daño * Sis.dmgMult(); R.gasta = F.coste;
        if (F.costeVida) R.gastaVida = Math.min(F.costeVida, Math.max(0, E.vida - G.entrada.vidaMin));
        if (F.tipo === 'proyectil') M.lanzar({ ...F, op: opciones(F, A.id) }, E, A.yaw);
        else if (F.tipo === 'zona') ponerZona(p, F, A.id, Sis.dmgMult());
        else M.chispa(E.x, E.y + C.motor.alto, E.z);
      }
      if (F.tipo === 'sector' && A.lanzado && antes < F.aviso + F.activo) {
        Impacto.sector({ x: E.x, y: E.y + C.motor.alto, z: E.z, yaw: A.yaw }, F.alcance, F.ang, A.daño, opciones(F, A.id), A.toc);
        M.ver('abanico', E, F);
      }
      R.bloquea = A.t < finCompromiso(F); R.ralentiza = C.marcha;
      R.pose = { nombre: C.id + '_' + A.id, k: clamp(A.t / total(F), 0, 1) };
      if (A.t >= total(F)) accion = null;
    }
    function entrada(dt, E) {
      const R = TallerLuz.salida(); dt = Math.max(0, dt); M.ver(null);
      if (C.id === 'oscuridad') R.gastaVida = 0;
      bufer = Math.max(0, bufer - dt);
      if (!E.libre || E.cancelar) { carga = accion = null; bufer = 0; return R; }
      if (E.atacarPulsado) bufer = G.entrada.bufer;
      if (accion && (E.guardia || E.esquivarPulsado) && accion.t >= finCompromiso(accion.F)) accion = null;
      if (accion) { avanzar(dt, E, R); return R; }
      if (carga !== null) {
        if (E.guardia || E.esquivarPulsado) { carga = null; bufer = 0; return R; }
        carga = Math.min(G.entrada.cargaMax, carga + dt);
        if (!E.atacar) { empezar(carga >= C.cargado.carga ? 'cargado' : 'normal'); avanzar(0, E, R); }
        else {
          R.ralentiza = C.canaliza; R.yaw = TallerLuz.rumbo(E);
          R.pose = { nombre: C.id + '_canaliza', k: clamp(carga / C.cargado.carga, 0, 1) };
          M.ver(C.cargado.tipo === 'zona' ? 'abanico' : 'guia', E, C.cargado);
        }
        return R;
      }
      /* La esquiva tiene prioridad sobre una orden nueva de ataque. */
      if (E.esquivarPulsado) { bufer = 0; return R; }
      if (bufer > 0) {
        bufer = 0;
        const id = E.guardia ? 'area' : E.esquivaReciente < G.entrada.trasEsquiva ? 'paso' : 'normal';
        const aviso = falta(E, C[id]);
        if (aviso) { R.aviso = aviso; return R; }
        if (id === 'normal' && E.atacar) {
          carga = 0; R.ralentiza = C.canaliza; R.yaw = TallerLuz.rumbo(E); R.pose = { nombre: C.id + '_canaliza', k: 0 };
        } else { empezar(id); avanzar(0, E, R); }
      }
      return R;
    }
    function actualizar(dt) {
      dt = Math.max(0, dt); M.actualizar(dt);
      for (let i = zonas.length - 1; i >= 0; i--) {
        const Z = zonas[i], F = Z.F; Z.t = Math.min(F.dur, Z.t + dt);
        /* Cada pulso tiene su registro. Sin intervalo, un solo contacto por objetivo en toda la zona. */
        if (F.intervalo) {
          const n = Math.floor((Z.t + G.zona.epsilon) / F.intervalo);
          while (Z.pulso < n) { Z.pulso++; tocarZona(Z, F.dañoPulso * Z.mult, new Set(), true); }
        } else tocarZona(Z, F.daño * Z.mult, Z.toc, false);
        if (Z.t >= F.dur) zonas.splice(i, 1);
      }
      dibujarZonas();
    }
    /* ---------- arte sustituible: un aro de suelo y un sello en la palma, sin luces ---------- */
    function dibujarZonas() {
      for (let i = 0; i < artes.length; i++) {
        const m = artes[i], Z = zonas[i]; m.visible = !!Z;
        if (Z) { m.position.set(Z.x, Z.y, Z.z); m.scale.set(Z.F.radio, Z.F.radio, Z.F.radio); }
      }
    }
    function materialTinta() { return new THREE.MeshBasicMaterial({ color: G.zona.tintaColor, transparent: true, opacity: G.zona.tintaOpacidad, depthWrite: false, fog: false }); }
    function modelo() {
      const g = new THREE.Group(), F = G.zona, mat = C.id === 'oscuridad' ? materialTinta() : M.material(C.motor.color);
      const aro = new THREE.Mesh(new THREE.TorusGeometry(F.modeloRadio, F.modeloTubo, C.motor.lados, F.lados), mat);
      aro.rotation.x = Math.PI / 2; aro.position.y = F.modeloAlto; g.add(aro);
      const centro = new THREE.Mesh(new THREE.SphereGeometry(C.motor.palmaRadio, C.motor.lados, C.motor.lados), M.material(C.motor.secundario));
      centro.position.y = F.modeloAlto; g.add(centro); g.name = 'guia_' + C.id; return g;
    }
    function crear(escena) {
      if (escenaPropia) return;
      escenaPropia = escena; M.crear(escena); muestraModelo = modelo();
      const mat = C.id === 'oscuridad' ? materialTinta() : M.material(C.motor.secundario);
      mat.opacity = G.zona.opacidad; mat.side = THREE.DoubleSide;
      for (let i = 0; i < G.zona.max; i++) {
        const m = new THREE.Mesh(new THREE.RingGeometry(G.zona.aroInterior, 1, G.zona.lados), mat);
        m.rotation.x = -Math.PI / 2; m.frustumCulled = false; m.visible = false; escena.add(m); artes.push(m);
      }
      dibujarZonas();
    }
    function reiniciar() { carga = accion = null; bufer = 0; zonas.length = 0; M.reiniciar(); dibujarZonas(); }
    return { id: C.id, nom: C.nom, entrada, actualizar, reiniciar, crear, modelo,
      muestras: () => M.muestras().concat(muestraModelo ? [muestraModelo, ...artes.map(m => { const c = m.clone(); c.visible = true; return c; })] : []),
      estado: () => ({ ...M.estado(), carga, accion: accion ? accion.id : null, bufer, zonas: zonas.length }) };
  }
  return { crear };
})();

const EscuelaViento = EscuelasMagia.crear(ESCUELA_VIENTO);
const EscuelaBrasa = EscuelasMagia.crear(ESCUELA_BRASA);
const EscuelaEscarcha = EscuelasMagia.crear(ESCUELA_ESCARCHA);
const EscuelaOscuridad = EscuelasMagia.crear(ESCUELA_OSCURIDAD);
