/* Montaje del prólogo y presentación del peligro. Reutiliza el motor de planos de Cin. */
"use strict";
const EscenasInicio = (() => {
  const { cam, suave, mascaraAkari } = Cin.util;
  /* nueve planos: rito, extracción, corte, fractura, luna y elipsis; P4–P8 son los índices 3–7 */
  const DURACIONES = [10, 14, 14, 14, 14, 10, 10, 12, 12];
  /* rótulo del último plano (AP06): aparece en 'desde' s y queda entero a la vista antes del fundido final de 'fundir' s */
  const ROTULO = { desde: 5, fundir: 1.5 };
  /* fractura: corte en P6; dispersión [empieza, malla oculta, acaba] y partículas/s;
     fragmentos: salida en P7, distancia y arco (m); luna: cambio de color en P8 */
  const FRACTURA = { corte: 3, dispersa: [5, 8, 8], particulas: 40, fragmentos: { sale: [1, 6], dist: 14, arco: 5 }, luna: [1, 5] };
  /* hora del prólogo en la escala de Atmosfera.FASES (-1 noche cerrada, 0 alba, 1 mediodía): el rito es de noche y
     la fractura la oscurece más; tres meses después, amanece. luz: lámpara de escena sobre el rito (altura, intensidad) */
  const NOCHE = { panorama: -.55, rito: -.7, fractura: [-.7, -.9], despues: .1, luz: { alto: 4.5, i: 1.6 } };
  // Pétalo, Duna, Marea, Escarcha.
  const COLOR_FRAGMENTO = [0xffc1d6, 0xffcb83, 0x9bdfff, 0xbbc9ff];
  const VERTICES_RESTO = [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, 1, 1, 1, -1, -1, -1, -1, 1,
    1, 1, 1, -1, 1, -1, 1, -1, -1, -1, -1, 1, 1, -1, -1, -1, 1, -1];
  const SONIDOS_PROLOGO = {
    3: [[.2, 'koto'], [11, 'paso'], [12, 'guardia']],
    4: [[.8, 'farol'], ...Array.from({ length: 11 }, (_, i) => [1.6 + i * 1.2, 'koto']), [9, 'guardia']],
    5: [[2.82, 'guardia'], [3, 'corte'], [3, 'tick'], [3.6, 'rota']],
    6: [[1, 'quiebre'], [1, 'guardia'], [1.08, 'guardia'], [1.16, 'guardia'], [1.24, 'guardia']],
    7: [[7, 'koto']]
  };
  let actores = null, sonidos = new Set();
  Bus.on('narrativa:repetir', () => sonidos.clear());
  function libre(p, mirar) {
    const distancia = Math.hypot(p.x - mirar.x, p.z - mirar.z), angulo = Math.atan2(p.x - mirar.x, p.z - mirar.z);
    const candidatos = [0, .45, -.45, .9, -.9, 1.4, -1.4, Math.PI];
    for (const alto of [0, 1.2, 2.4]) for (const giro of candidatos) {
      const a = angulo + giro, q = { x: mirar.x + Math.sin(a) * distancia, y: p.y + alto, z: mirar.z + Math.cos(a) * distancia };
      let tapa = false;
      for (let u = 0; u < .94; u += .075) {
        const x = lerp(q.x, mirar.x, u), y = lerp(q.y, mirar.y, u), z = lerp(q.z, mirar.z, u);
        if (y < altura(x, z) + .2 || Sol.dentro(x, y, z, .22)) { tapa = true; break; }
      }
      if (!tapa) return q;
    }
    return { ...p, y: Math.max(p.y, altura(p.x, p.z) + 4) };
  }
  function vista(px, py, pz, lx, ly, lz) {
    const p = libre({ x: px, y: py, z: pz }, { x: lx, y: ly, z: lz }); cam(p.x, p.y, p.z, lx, ly, lz);
  }
  function vistaLunar(x, y, z, alturaFaro) {
    const luna = Atmosfera.UA.uLunaDir.value, radio = Math.hypot(x, z), horizontal = Math.hypot(luna.x, luna.z);
    const px = -luna.x / horizontal * radio, pz = -luna.z / horizontal * radio;
    const direccion = _luna.set(-px, alturaFaro - y, -pz).normalize().add(luna).normalize();
    cam(px, y, pz, px + direccion.x * 150, y + direccion.y * 150, pz + direccion.z * 150);
  }
  /* 0,06 m hacia delante, en el espacio del personaje, desde el pecho ya posado (no desde su raíz). */
  const _o = new THREE.Vector3(), _d = new THREE.Vector3(), _frente = new THREE.Vector3();
  const _q = new THREE.Quaternion(), _luna = new THREE.Vector3();
  function anclar(A, y, esfuerzo) {
    A.akari.g.updateMatrixWorld(true); A.pecho.getWorldPosition(_o); A.akari.g.getWorldQuaternion(_q);
    _frente.set(0, 0, .06).applyQuaternion(_q); _o.add(_frente); _d.set(0, y + 6.3, 4.69);
    A.hilo.tender(_o, _d, esfuerzo);
  }
  function preparar() {
    if (actores) return;
    const g = new THREE.Group(); scene.add(g);
    const akari = Gente.crear({ nombre: '', nino: true, alto: 1.15, kimono: 0xe9e0c8, obi: 0x9b302c, pelo: 0xe6ddc9, rutina: { tipo: 'pasear', puntos: [[0, 0]], vel: .4 } });
    akari.ocupado = true;
    const mascara = mascaraAkari(akari); mascara.scale.setScalar(1.4); mascara.position.set(0, .015, .065);
    const cabeza = akari.g.getObjectByName('cabeza'), tela = new THREE.MeshLambertMaterial({ color: 0xe9e0c8, side: THREE.DoubleSide });
    const capucha = new THREE.Mesh(new THREE.SphereGeometry(.245, 16, 12, Math.PI * .85, Math.PI * 1.3), tela);
    capucha.position.set(0, .13, .015); cabeza.add(capucha);
    akari.g.name = 'Akari_prologo'; g.name = 'Prologo_Luna'; g.add(akari.g);
    akari.g.traverse(o => { if (o.isMesh) o.material.transparent = true; });
    const vecinos = [FICHAS_NPC.tsuru, FICHAS_NPC.kaito, FICHAS_NPC.taiyo].map(f => {
      const n = Gente.crear({ ...f, nombre: '', rutina: { tipo: 'quieto' } }); g.add(n.g); return n;
    });
    const fragmentos = [];
    for (let i = 0; i < 4; i++) { const h = new Halo(COLOR_FRAGMENTO[i], 0); h.scale.set(1.8, 1.8, 1); g.add(h); fragmentos.push(h); }
    for (const h of fragmentos) h.color.convertSRGBToLinear();
    const nucleos = fragmentos.map(h => { const n = new Halo(h.color, 0); n.scale.setScalar(.22); g.add(n); return n; });
    const envoltura = new Halo(lin(0xfff3ce), 0); g.add(envoltura);
    const hilo = new HiloLuz(g), pecho = akari.g.getObjectByName('pecho');
    const geoCorazon = Estr.corazon.geometry.clone(), corazonBase = geoCorazon.attributes.position.array.slice();
    const verticesCorazon = geoCorazon.attributes.position.count, restosCorazon = AJUSTES.calidad === 'baja' ? 4 : AJUSTES.calidad === 'media' ? 6 : 8;
    const posiciones = new Float32Array(corazonBase.length + restosCorazon * VERTICES_RESTO.length); posiciones.set(corazonBase);
    geoCorazon.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
    for (const clave of ['normal', 'uv']) if (geoCorazon.attributes[clave]) {
      const anterior = geoCorazon.attributes[clave], datos = new Float32Array(posiciones.length / 3 * anterior.itemSize);
      datos.set(anterior.array); geoCorazon.setAttribute(clave, new THREE.BufferAttribute(datos, anterior.itemSize));
    }
    geoCorazon.attributes.position.setUsage(THREE.DynamicDrawUsage);
    geoCorazon.computeBoundingSphere(); geoCorazon.boundingSphere.radius += .4;
    actores = { g, akari, vecinos, fragmentos, nucleos, envoltura, hilo, pecho, geoCorazon,
      corazonBase, verticesCorazon, restosCorazon, contacto: new THREE.Vector3(), errorContacto: 0 };
    g.visible = false;
  }
  function intro(cb) {
    preparar(); const A = actores, S = sitio('faro'), y = S.h, H = A.hilo, C = Estr.corazon, CL = Estr.corazonLuz, F = FRACTURA;
    const ajustes = Render.ajustes, modelo = Tasogare.modelo, animarTaso = Tasogare.actualizar, animarObra = Estr.actualizar;
    const inicial = { fov: camera.fov, cam: camera.position.clone(), giroCam: camera.quaternion.clone(), foco: ajustes.foco,
      colorLugar: ajustes.colorLugar, entorno: ENTORNO.e, interior: ENTORNO.interior, entradaMusica: MUSICA_INICIO.entrada,
      lamp: Cin.lamp, hikari: Hikari.root.visible, lumi: Lumi.grupo.visible,
      corGeo: C.geometry, corEsc: C.scale.clone(), corGiro: C.quaternion.clone(), corColor: C.material.color.clone(),
      corVisible: C.visible, luzEsc: CL.scale.clone(), luzAlfa: CL.opacidad, luzColor: CL.color.clone(), brillo: Estr.brillo,
      tasoPos: Tasogare.root.position.clone(), tasoGiro: Tasogare.root.quaternion.clone(), tasoVisible: Tasogare.visible,
      capaVisible: Tasogare.capa.mesh.visible, canales: Tasogare.efectos(), punta: modelo.punta.visible,
      capaP: Tasogare.capa.p.slice(), capaQ: Tasogare.capa.q.slice(), capaAncho: Tasogare.capa.aB, capaLista: Tasogare.capa.listo,
      huesos: modelo.huesos.map(b => ({ p: b.position.clone(), q: b.quaternion.clone() })) };
    const ocultos = Object.values(Sis.npcs).filter(n => n.g.visible); ocultos.forEach(n => n.g.visible = false);
    const foco = Cin.util.desenfoquePlano(0), restaurarTaso = Cin.util.sustituir(Tasogare, 'actualizar', () => {});
    const corGiro = C.quaternion.clone(), corEsc = C.scale.clone(), luzEsc = CL.scale.clone();
    // Estr.actualizar anima estos dos objetos después de Cin. Se conserva la dirección del plano al volver del bucle.
    const restaurarObra = Cin.util.sustituir(Estr, 'actualizar', function () {
      corGiro.copy(C.quaternion); corEsc.copy(C.scale); luzEsc.copy(CL.scale);
      animarObra.apply(Estr, arguments); C.quaternion.copy(corGiro); C.scale.copy(corEsc); CL.scale.copy(luzEsc);
    });
    const musica = MusicaInicio.actualizar;
    const restaurarMusica = Cin.util.sustituir(MusicaInicio, 'actualizar', (dt, estado) => {
      MUSICA_INICIO.entrada = Cin.plano() === 3 ? .4 : inicial.entradaMusica;
      if (Cin.activa && Cin.tipo === 'intro' && Cin.plano() >= 3 && Cin.plano() <= 7) estado.silencio = true;
      musica(dt, estado);
    });
    const ap07 = GUION.inicio.lineas.AP07.nombre + ' · ' + GUION.inicio.lineas.AP07.texto, subtitulo = UI.subtitulo;
    let ultimoTexto = null;
    const restaurarTexto = Cin.util.sustituir(UI, 'subtitulo', txt => {
      if (Cin.activa && Cin.plano() === 7 && txt === ap07 && ultimoTexto === txt) return;
      ultimoTexto = txt; subtitulo(txt);
    });
    const sueloAkari = sueloEnJ(0, y + 5, 6.5), baseFilo = new THREE.Vector3(), puntaFilo = new THREE.Vector3();
    const contacto = A.contacto, objetivo = new THREE.Vector3(), centro = C.position.clone(), normal = new THREE.Vector3();
    const tasoYaw = -Math.PI / 2, tasoSitio = new THREE.Vector3(1.2, sueloEnJ(1.2, y + 5, 6.1), 6.1), filoLocal = new THREE.Vector3();
    const colorSano = lin(0xfff3ce), colorRoto = lin(0x777783), puntos = [new THREE.Vector3(0, y + 6.3, 4.69)];
    let nivelY = 4.1;
    FARO.niveles.forEach((n, i) => {
      const z = n.w / 2 + .19, alero = (n.w + 5.2 - i * .3) / 2 + .08;
      if (i) puntos.push(new THREE.Vector3(.14, Math.max(puntos[puntos.length - 1].y + .05, y + nivelY + .12), z));
      puntos.push(new THREE.Vector3(-.12, y + nivelY + n.h - .45, z),
        new THREE.Vector3(.16, y + nivelY + n.h + .12, alero),
        new THREE.Vector3(-.10, y + nivelY + n.h + 1.7, z));
      nivelY += n.h + .3;
    });
    // El último piso está abierto: la avería entra por el travesaño sur y llega al cristal visible.
    puntos.splice(puntos.length - 3, 3, new THREE.Vector3(.12, centro.y - .7, 2.6), centro.clone());
    let cortado = false, onda = false, roto = false, polvoI = 0, dispersaI = 0, polvoCorI = 0, terminado = false;
    let contactoU = .62;
    A.g.visible = true; A.akari.g.visible = true; A.akari.g.position.set(0, y + 1.15, 12); A.akari.g.rotation.y = Math.PI;
    A.akari.g.scale.setScalar(1); A.akari.accion.inclina = 0;
    A.vecinos.forEach((n, i) => { n.ocupado = true; n.g.visible = true; n.g.position.set(-3.5 + i * 3.4, y + 1.15, 17 + (i % 2) * 2); n.g.rotation.y = Math.PI; });
    H.limpiar(); A.fragmentos.forEach(h => h.opacidad = 0); A.nucleos.forEach(h => h.opacidad = 0); A.envoltura.opacidad = 0;
    Hikari.mostrar(false); Lumi.grupo.visible = false; Tasogare.mostrar(true); Tasogare.hojaEntera(false);
    Tasogare.colocar(1.2, y + 1.15, 10, Math.PI); Tasogare.pose('reposo', 0, true); Tasogare.caminar(0);
    Tasogare.efectos({ ojo: 0, filo: .5, brasa: .3, brasas: 0 });
    ajustes.colorLugar = 0; C.geometry = A.geoCorazon;
    Atmosfera.lunaNarrativa(0); Cin.lamp = { x: 0, y: y + NOCHE.luz.alto, z: 9, i: NOCHE.luz.i };
    const lente = valor => { if (camera.fov !== valor) { camera.fov = valor; camera.updateProjectionMatrix(); } };
    const azar = i => { const v = Math.sin(i * 127.1 + 91.7) * 43758.5453; return v - Math.floor(v); };
    const filo = () => {
      modelo.arma.updateWorldMatrix(true, false);
      baseFilo.set(.056, -.23, .049).applyMatrix4(modelo.arma.matrixWorld);
      puntaFilo.set(.024, -.966, .049).applyMatrix4(modelo.arma.matrixWorld);
    };
    const dirigirTaso = (a, b, k, dt) => { Tasogare.mezclar(a, b, clamp(k, 0, 1)); animarTaso(dt); };
    const posarAkari = (esfuerzo, mano, dt) => {
      A.akari.actualizar(dt, 999, 999); const g = A.akari.g;
      g.position.set(0, sueloAkari, 6.5); g.rotation.y = Math.PI;
      // Dirección absoluta sobre el rig: mano sobre el kimono, apoyo estable y ninguna caída al interrumpir el flujo.
      g.getObjectByName('cadera').rotation.x = esfuerzo * .4;
      g.getObjectByName('columna').rotation.x = esfuerzo * .35;
      A.pecho.rotation.set(esfuerzo * .25, 0, 0);
      g.getObjectByName('brazoD').rotation.set(-.85 * mano, 0, -.18 * mano);
      g.getObjectByName('antebrazoD').rotation.set(-1.8 * mano, 0, 0);
      g.updateMatrixWorld(true);
    };
    const cristal = (t, fractura) => {
      const contraccion = fractura ? 1 - .12 * smooth(0, .65, t) : 1;
      C.scale.copy(inicial.corEsc).multiplyScalar(contraccion); C.quaternion.copy(inicial.corGiro);
      C.rotateY((fractura ? Math.min(t, .65) : t) * .4);
      const posicion = A.geoCorazon.attributes.position, datos = A.corazonBase, apertura = fractura ? .08 * smooth(.65, 1, t) + .12 * smooth(1, 1.3, t) : 0;
      // Octaedro no indexado: cada cara pertenece a un sector. Tres separaciones reales sin materiales adicionales.
      for (let j = 0; j < A.verticesCorazon; j += 3) {
        const v = j * 3, a = Math.atan2(datos[v] + datos[v + 3] + datos[v + 6], datos[v + 2] + datos[v + 5] + datos[v + 8]);
        const sector = Math.floor((a + Math.PI) / (TAU / 3)), dir = sector * TAU / 3 + Math.PI / 3;
        for (let p = 0; p < 3; p++) {
          const k = v + p * 3; posicion.array[k] = datos[k] + Math.sin(dir) * apertura;
          posicion.array[k + 1] = datos[k + 1] + (sector === 1 ? .08 : -.04) * smooth(1, 1.3, t);
          posicion.array[k + 2] = datos[k + 2] + Math.cos(dir) * apertura;
        }
      }
      // Restos grises en la misma geometría y con el material del corazón; no añaden dibujos ni programas.
      for (let i = 0; i < A.restosCorazon; i++) {
        const edad = t - 1.3, vivo = fractura && edad >= 0 && edad < 1, a = i * 2.39996;
        const radio = .18 + Math.min(.4, Math.max(0, edad) * .4), tam = vivo ? (.06 + .10 * azar(i + 42)) / 2.8 : 0;
        for (let j = 0; j < VERTICES_RESTO.length; j += 3) {
          const k = datos.length + i * VERTICES_RESTO.length + j;
          posicion.array[k] = (vivo ? Math.cos(a) * radio : 0) + VERTICES_RESTO[j] * tam;
          posicion.array[k + 1] = (vivo ? -.35 * edad * edad : 0) + VERTICES_RESTO[j + 1] * tam;
          posicion.array[k + 2] = (vivo ? Math.sin(a) * radio : 0) + VERTICES_RESTO[j + 2] * tam;
        }
      }
      posicion.needsUpdate = true;
      const pulso = t < .25 ? Math.sin(t / .25 * Math.PI) : t < .43 ? Math.sin((t - .25) / .18 * Math.PI) : t < .55 ? Math.sin((t - .43) / .12 * Math.PI) : 0;
      CL.scale.setScalar((fractura ? 3.2 : 2.5) * contraccion * (1 + .08 * pulso));
      CL.opacidad = fractura ? lerp(.65 + .12 * pulso, .12, smooth(1, 2.5, t)) : .45;
      C.material.color.copy(fractura && t >= 1.3 ? colorRoto : colorSano);
    };
    const ubicarRito = () => {
      A.akari.ir(0, 6.5, .4); A.akari.g.position.set(0, sueloAkari, 6.5); A.akari.g.rotation.y = Math.PI;
      A.akari.g.scale.setScalar(1); A.akari.g.visible = true;
      Tasogare.colocar(tasoSitio.x, tasoSitio.y, tasoSitio.z, tasoYaw); Tasogare.caminar(0);
    };
    const calibrar = () => {
      // Calibración antes de mover el filo: pies fijos durante P6. Elegir altura, pose y punto de hoja reales.
      H.tiempo = 3; posarAkari(.22, 1, 0); anclar(A, y, 1);
      let menor = Infinity, mejorS = .5, mejorU = .62, mejorF = .5;
      for (let u = .35; u <= .85; u += .025) {
        dirigirTaso('guardia', 'corte', u, 0); filo();
        for (let f = .2; f <= .9; f += .1) {
          filoLocal.lerpVectors(baseFilo, puntaFilo, f);
          for (let j = 20; j <= 80; j++) {
            H.evaluar(j / 100, objetivo);
            const x = tasoSitio.x + objetivo.x - filoLocal.x, z = tasoSitio.z + objetivo.z - filoLocal.z;
            const suelo = sueloEnJ(x, y + 5, z), error = Math.abs(objetivo.y - filoLocal.y - suelo + tasoSitio.y) + Math.abs(u - .62) * .001;
            if (error < menor) { menor = error; mejorS = j / 100; mejorU = u; mejorF = f; }
          }
        }
      }
      contactoU = mejorU; dirigirTaso('guardia', 'corte', contactoU, 0); filo();
      filoLocal.lerpVectors(baseFilo, puntaFilo, mejorF); H.evaluar(mejorS, objetivo);
      // Ajuste estático del apoyo completo, nunca un desplazamiento de la raíz durante la aceleración.
      tasoSitio.x += objetivo.x - filoLocal.x; tasoSitio.z += objetivo.z - filoLocal.z;
      tasoSitio.y = sueloEnJ(tasoSitio.x, y + 5, tasoSitio.z);
      Tasogare.colocar(tasoSitio.x, tasoSitio.y, tasoSitio.z, tasoYaw);
      dirigirTaso('empuñar', 'empuñar', 0, 0);
    };
    const entrada = k => {
      sonidos.clear(); H.limpiar(); Cin.util.congelar(0); foco.poner(0); A.envoltura.opacidad = 0;
      A.fragmentos.forEach(h => h.opacidad = 0); A.nucleos.forEach(h => h.opacidad = 0);
      cortado = onda = roto = false; polvoI = dispersaI = polvoCorI = 0;
      Tasogare.efectos({ ojo: 0, filo: .5, brasa: .3, brasas: 0 });
      A.akari.accion.inclina = 0; A.vecinos.forEach(n => { n.accion.alza = n.accion.inclina = 0; });
      A.akari.g.traverse(o => { if (o.isMesh) { o.visible = true; o.material.opacity = 1; } });
      if (k <= 2) {
        lente(inicial.fov); A.akari.g.visible = true; A.akari.g.position.set(0, y + 1.15, 12); A.akari.g.rotation.y = Math.PI;
        A.akari.ir(0, k === 2 ? 6.5 : 12, .4); Tasogare.pose('reposo', 0, true);
      } else ubicarRito();
      if (k >= 3 && k <= 5) {
        tasoSitio.set(1.2, sueloEnJ(1.2, y + 5, 6.1), 6.1); ubicarRito(); calibrar(); H.limpiar();
      }
      if (k >= 6) A.akari.g.visible = false;
      Atmosfera.lunaNarrativa(k === 8 ? 1 : 0); cristal(0, k >= 6);
      if (k >= 7) cristal(10, true);
      if (k === 8) lente(inicial.fov);
    };
    const plano = (k, texto, f) => ({ dur: DURACIONES[k], txt: texto ? GUION.inicio.lineas[texto].nombre + ' · ' + GUION.inicio.lineas[texto].texto : null,
      in() { entrada(k); Bus.emit('narrativa:plano', { escena: 'intro', plano: k, linea: texto }); },
      f(u, t, dt) {
        if (k === 5 && Cin.util.congelado()) return;
        H.tiempo = t;
        if (k < 3) A.akari.actualizar(dt, 999, 999);
        A.vecinos.forEach(n => n.actualizar(dt, 999, 999));
        f(suave(u), t, dt); H.actualizar(t, dt);
        // Se indexan los acontecimientos, no el nombre del sonido: las cuatro separaciones son distintas.
        if (dt > 0) (SONIDOS_PROLOGO[k] || []).forEach(([cuando, efecto], i) => {
          if (t + 1e-8 >= cuando && !sonidos.has(i)) { sonidos.add(i); Sonido.sfx(efecto, { pos: { x: 0, y: y + 6, z: 6.5 }, vol: .45 }); }
        });
      }
    });
    const planos = [
      plano(0, 'AP01', u => {
        aplicarEntorno(NOCHE.panorama, 0); vistaLunar(lerp(-64, -49, u), y + lerp(11, 14, u), lerp(112, 98, u), y + 18);
      }),
      plano(1, 'AP02', u => {
        aplicarEntorno(NOCHE.rito, 0); vista(lerp(7.5, 6.5, u), y + 3.4, lerp(23, 21, u), 0, y + 2, 12);
      }),
      plano(2, 'AP03', (u, t, dt) => {
        const p = A.akari.g.position;
        Tasogare.colocar(1.2, sueloEnJ(1.2, y + 5, p.z + .6), p.z + .6, Math.PI); Tasogare.caminar(p.z > 6.6 ? .4 : 0); animarTaso(dt);
        vista(lerp(-3, -2.5, u), p.y + 1.9, p.z + 7, 0, p.y + .9, p.z);
      }),
      plano(3, null, (u, t, dt) => {
        lente(48); aplicarEntorno(NOCHE.rito, 0); posarAkari(0, 0, dt);
        dirigirTaso('reposo', 'empuñar', smooth(10, 14, t), dt);
        Tasogare.hueso('cabeza').rotation.y = lerp(-.12, .16, smooth(7, 10, t));
        anclar(A, y, 0); H.longitud = -1; H.pecho = lerp(.18, .35, smooth(4, 7, t)); H.dintel = lerp(.18, .35, smooth(4.25, 7.25, t));
        A.vecinos[1].accion.inclina = .2 * (1 - smooth(10, 12, t));
        const p = A.akari.g.position, d = 5.5 - .35 * u;
        vista(-d * .94, p.y + 1.5, p.z + d * .342, .3, p.y + 1.1, 5.8);
      }),
      plano(4, 'AP04', (u, t, dt) => {
        lente(42); aplicarEntorno(NOCHE.rito, 0);
        const esfuerzo = smooth(7, 9, t), inclinacion = .22 * smooth(7, 11, t) - .04 * smooth(11, 14, t);
        posarAkari(inclinacion, smooth(7, 10, t), dt); dirigirTaso('empuñar', 'empuñar', 0, dt);
        anclar(A, y, esfuerzo); H.fase = .95; H.longitud = t < .8 ? -1 : smooth(.8, 1.6, t); H.pecho = t < .8 ? .3 : -1; H.dintel = t < 1.6 ? .25 : -1;
        Cin.lamp.i = lerp(1.6, 2.1, esfuerzo);
        const p = A.akari.g.position;
        vista(-3.8 * .94 + .3 * u, p.y + 1.05, p.z + 3.8 * .342, .25, p.y + 1.05, 5.65);
      }),
      plano(5, 'AP05', (u, t, dt) => {
        lente(50); aplicarEntorno(NOCHE.rito, 0);
        const p = A.akari.g.position;
        posarAkari(.22 * (1 - smooth(4, 5, t)), 1 - smooth(4, 5, t), dt);
        const golpe = t < 2.85 ? 0 : contactoU * smooth(2.85, 3, t) + (1 - contactoU) * smooth(3.06, 3.18, t);
        if (t < 2.85) dirigirTaso('empuñar', 'guardia', smooth(2.35, 2.85, t), dt);
        else if (t <= 3.55) dirigirTaso('guardia', 'corte', golpe, dt);
        else dirigirTaso('corte', 'reposo', smooth(3.55, 5.2, t), dt);
        if (!cortado) anclar(A, y, 1);
        filo();
        if (t >= 2.9 && t <= 3.18 && dt > 0) H.estela(baseFilo, puntaFilo);
        if (t + 1e-8 >= 3 && !cortado) {
          cortado = true;
          // Evaluar exactamente el metal y la curva de t=3 aunque el fotograma cruce el contacto.
          H.tiempo = 3; dirigirTaso('guardia', 'corte', contactoU, 0); filo();
          A.errorContacto = H.cruce(baseFilo, puntaFilo, contacto); H.cortar(contacto); H.tiempo = t;
          if (dt > 0) Cin.util.congelar(.06);
        }
        if (t + 1e-8 >= 3.06 && !onda) {
          onda = true; normal.subVectors(puntaFilo, baseFilo).cross(_frente).normalize();
          H.tiempo = 3.06; H.onda(contacto, normal); H.tiempo = t;
        }
        if (t >= 3.8 && t <= 9.5 && dt > 0) while (polvoI < Math.floor((t - 3.8) * 12)) {
          const i = polvoI++, alcanzadas = Math.max(1, Math.floor((puntos.length - 1) * .90 * smooth(3.6, 10, t)));
          const junta = puntos[1 + Math.floor(azar(i + 52) * alcanzadas)];
          H.polvo(junta.x, junta.y, junta.z + .06, (azar(i) - .5) * .25, -.15, .10, .6 + .4 * azar(i + 100), .08 + .08 * azar(i + 200), 0x938a80, .25);
        }
        const d = smooth(F.dispersa[0], F.dispersa[2], t); A.akari.g.visible = t < F.dispersa[1];
        A.envoltura.position.copy(p).y += .7; A.envoltura.scale.set(1.1 + d * .6, 1.6 + d * .4, 1);
        A.envoltura.opacidad = t < 5 ? .12 * Math.exp(-((t - 4.5) ** 2) / .04) : .65 * Math.sin(d * Math.PI);
        // La forma se disuelve erguida; no se reduce ni cae. La pulsación de recuperación precede a la dispersión.
        A.akari.g.traverse(o => { if (o.isMesh) o.material.opacity = 1 - d; });
        if (t >= 8) H.pecho = 0;
        if (t >= 5 && t <= 8 && dt > 0) while (dispersaI < Math.floor((t - 5) * 40)) {
          const i = dispersaI++, a = azar(i) * TAU;
          H.emitir(p.x + Math.cos(a) * .25, p.y + .1 + azar(i + 2) * 1.1, p.z + Math.sin(a) * .25,
            Math.cos(a) * .35, .4 + azar(i + 3) * .5, Math.sin(a) * .35, .8 + azar(i + 4) * .6, .06 + azar(i + 5) * .04, 0xfff3ce, .75);
        }
        const reaccion = smooth(3.6, 4.1, t); A.vecinos[0].g.getObjectByName('brazoD').rotation.x = -1.1 * reaccion;
        A.vecinos[1].g.position.z = 19 + .35 * reaccion;
        vista(p.x - 4.8, p.y + 1.7, p.z + 2, .45, lerp(p.y + 1.25, y + 13, smooth(8, 10, t)), 5.7);
        Cin.util.sacudida(.025, .3, 16, t - 3.06, .12 * Math.PI / 180);
        camera.updateMatrixWorld(true); H.grieta(puntos, .90 * smooth(3.6, 10, t));
      }),
      plano(6, 'AP07', (u, t, dt) => {
        lente(52); aplicarEntorno(NOCHE.fractura[0], 0); cristal(t, true);
        if (t + 1e-8 >= 1 && !roto) {
          roto = true;
          if (dt > 0) for (let i = 0; i < 28; i++) {
            const a = i * 2.39996;
            H.emitir(centro.x, centro.y, centro.z, Math.cos(a) * 1.7, Math.sin(a * 1.7) * 1.5, Math.sin(a) * 1.7, .5 + i % 5 * .1, .05 + i % 6 * .01, 0xfff3ce, .85);
          }
        }
        const e = smooth(F.fragmentos.sale[0], F.fragmentos.sale[1], t);
        A.fragmentos.forEach((h, i) => {
          const a = i * Math.PI / 2, n = A.nucleos[i]; h.opacidad = n.opacidad = t < 1 ? 0 : .9;
          h.scale.setScalar(lerp(.7, 1.1, e)); n.scale.setScalar(lerp(.18, .26, e));
          h.position.set(centro.x + Math.sin(a) * F.fragmentos.dist * e, centro.y + Math.sin(e * Math.PI) * F.fragmentos.arco + e * 2, centro.z - Math.cos(a) * F.fragmentos.dist * e); n.position.copy(h.position);
        });
        if (t >= 1.3 && t <= 3 && dt > 0) while (polvoCorI < Math.floor(24 * smooth(1.3, 3, t))) {
          const i = polvoCorI++, a = i * 2.39996;
          H.polvo(centro.x + Math.cos(a) * .8, centro.y, centro.z + Math.sin(a) * .8, Math.cos(a) * .2, -.2, Math.sin(a) * .2, .8 + .4 * azar(i), .12 + .13 * azar(i + 9), 0x938a80, .25);
        }
        const sube = smooth(1.5, 6, t), radio = lerp(27, 24, sube), a = Math.PI / 8;
        vista(-Math.sin(a) * radio, lerp(sueloAkari + 5, centro.y + 8, sube), Math.cos(a) * radio, 0, lerp((y + 4 + centro.y) / 2, centro.y, sube), 0);
        Cin.util.sacudida(.045, .35, 16, t - 1, .18 * Math.PI / 180);
        camera.updateMatrixWorld(true); H.grieta(puntos, lerp(.90, 1, smooth(0, .65, t)));
      }),
      plano(7, 'AP07', (u, t) => {
        lente(40); aplicarEntorno(lerp(NOCHE.fractura[0], NOCHE.fractura[1], u), 0);
        Atmosfera.lunaNarrativa(smooth(F.luna[0], F.luna[1], t)); vistaLunar(36, y + 8, 0, y + 10);
      }),
      plano(8, null, (u, t) => {
        Atmosfera.lunaNarrativa(1); aplicarEntorno(NOCHE.despues, 0); Cin.lamp = null;
        vistaLunar(lerp(-64, -58, u), y + 12, lerp(112, 106, u), y + 18);
        if (t > ROTULO.desde) UI.subtitulo(GUION.inicio.lineas.AP06.texto);
      })
    ];
    planos[8].fundir = ROTULO.fundir;
    Cin.util.arrancar(planos, () => {
      if (terminado) return; terminado = true;
      H.limpiar(); A.g.visible = false; A.envoltura.opacidad = 0;
      A.fragmentos.forEach(h => h.opacidad = 0); A.nucleos.forEach(h => h.opacidad = 0);
      A.akari.g.visible = true; A.akari.g.scale.setScalar(1); A.akari.accion.inclina = 0;
      A.akari.g.traverse(o => { if (o.isMesh) { o.visible = true; o.material.opacity = 1; } });
      A.vecinos.forEach(n => { n.accion.alza = n.accion.inclina = 0; }); ocultos.forEach(n => n.g.visible = true);
      C.geometry = inicial.corGeo; C.scale.copy(inicial.corEsc); C.quaternion.copy(inicial.corGiro); C.visible = inicial.corVisible;
      C.material.color.copy(inicial.corColor); CL.scale.copy(inicial.luzEsc); CL.opacidad = inicial.luzAlfa; CL.color.copy(inicial.luzColor); Estr.brillo = inicial.brillo;
      Tasogare.reiniciar(); Tasogare.colocar(inicial.tasoPos.x, inicial.tasoPos.y, inicial.tasoPos.z); Tasogare.root.quaternion.copy(inicial.tasoGiro);
      modelo.huesos.forEach((b, i) => { b.position.copy(inicial.huesos[i].p); b.quaternion.copy(inicial.huesos[i].q); });
      Tasogare.efectos(inicial.canales); Tasogare.mostrar(inicial.tasoVisible); Tasogare.capa.mesh.visible = inicial.capaVisible; modelo.punta.visible = inicial.punta;
      Tasogare.capa.p.set(inicial.capaP); Tasogare.capa.q.set(inicial.capaQ); Tasogare.capa.aB = inicial.capaAncho; Tasogare.capa.listo = inicial.capaLista;
      Tasogare.root.updateMatrixWorld(true);
      restaurarTaso(); restaurarObra(); restaurarMusica(); restaurarTexto(); foco.restaurar(); Cin.util.congelar(0);
      MUSICA_INICIO.entrada = inicial.entradaMusica;
      ajustes.colorLugar = inicial.colorLugar; ajustes.foco = inicial.foco; Cin.lamp = inicial.lamp;
      aplicarEntorno(inicial.entorno, inicial.interior);
      camera.fov = inicial.fov; camera.position.copy(inicial.cam); camera.quaternion.copy(inicial.giroCam); camera.updateProjectionMatrix();
      Hikari.mostrar(inicial.hikari); Lumi.grupo.visible = inicial.lumi; Atmosfera.lunaNarrativa(1);
      Piloto.prologoFin(); if (cb) cb();
    }, 'intro');
  }
  /* recuerdo del rito al integrar un fragmento (capítulo 1): la niña, el hilo y la luna dorada de cerca, sin el guardián;
     no confirma quién es. Duración de los planos y fundido final en s */
  /* variantes: 0, el del Pétalo (con la voz de la niña); 1, el de la Marea: desde sus manos, el hilo tenso hacia la puerta;
     2, el de la Arena; 3, el de Escarcha: el guardián corta el hilo y ella lo llama («¡Padre!») */
  const RECUERDO = { dur: [8, 8, 6], fundir: 2, particulas: 30, voz: ['CPR01', null, null, 'C6M01'] };
  function recuerdo(cb, variante) {
    const v = variante || 0;
    preparar(); const A = actores, y = sitio('faro').h, R = RECUERDO;
    const ocultos = Object.values(Sis.npcs).filter(n => n.g.visible); ocultos.forEach(n => n.g.visible = false);
    A.g.visible = true; A.vecinos.forEach(n => n.g.visible = false); A.fragmentos.forEach(h => h.opacidad = 0);
    // Quieta en la escalinata, ante la puerta.
    A.akari.g.visible = true; A.akari.g.position.set(0, sueloEnJ(0, y + 6, 6.5) + 1.15, 6.5); A.akari.g.rotation.y = Math.PI; A.akari.ir(0, 6.5, .4);
    Hikari.mostrar(false); Lumi.grupo.visible = false; Tasogare.mostrar(false); Render.ajustes.colorLugar = 0;
    Atmosfera.lunaNarrativa(0); Cin.lamp = { x: 0, y: y + NOCHE.luz.alto, z: 9, i: NOCHE.luz.i };
    const voz = R.voz[v] && GUION.inicio.lineas[R.voz[v]], luz = (dt, k) => { const p = A.akari.g.position; for (let i = 0; i < Math.round(dt * R.particulas * k); i++) FX.emit(p.x + rnd(-.3, .3), p.y + rnd(.3, 1.2), p.z + rnd(-.3, .3), rnd(-.3, .3), rnd(.8, 1.6), rnd(-.3, .3), 1.4, .08, 0xffe6ad, .8); };
    const planos = [
      { dur: R.dur[0], txt: v !== 3 && voz ? voz.nombre + ' · ' + voz.texto : null, f(u, t, dt) {
        aplicarEntorno(NOCHE.rito, 0); A.akari.actualizar(dt, 999, 999); A.akari.accion.inclina = .12; A.hilo.tiempo = t; anclar(A, y, .3); A.hilo.actualizar(t, dt); luz(dt, .5);
        const p = A.akari.g.position;
        // Desde las manos o el encuadre del hilo en el prólogo.
        if (v === 1) vista(p.x + .6, p.y + .7, p.z + 1.3, 0, y + 6.3, 4.8); else vista(lerp(-2.8, -2.4, u), p.y + 1.4, 9, 0, p.y + 1.1, p.z);
      } },
      { dur: R.dur[1], f(u, t, dt) {
        aplicarEntorno(NOCHE.rito, 0); A.akari.actualizar(dt, 999, 999); A.akari.accion.inclina = lerp(.12, .3, u); A.hilo.tiempo = t; anclar(A, y, u); A.hilo.actualizar(t, dt); luz(dt, 1);
        const p = A.akari.g.position;
        if (v === 1) vista(p.x + 1.8, p.y + 1.2, p.z + 1.6, p.x, p.y + .9, p.z); else vista(p.x - 5.2, p.y + 2.2, p.z + 4.6, p.x + .9, p.y + 1.7, p.z - .2);
      } },
      { dur: R.dur[2], fundir: R.fundir, txt: v === 3 && voz ? voz.nombre + ' · ' + voz.texto : null,
        in() { if (v !== 3) return; const p = A.akari.g.position; Tasogare.mostrar(true); Tasogare.hojaEntera(false); Tasogare.colocar(p.x + 1.2, sueloEnJ(p.x + 1.2, y + 5, p.z + .6), p.z + .6, Math.PI); Tasogare.efectos({ ojo: 0, filo: .8, brasa: .3 }); Tasogare.pose('corte', 0, true); },
        f(u, t, dt) {
        aplicarEntorno(NOCHE.rito, 0); A.akari.actualizar(dt, 999, 999); A.hilo.limpiar(); luz(dt, 2); A.akari.g.visible = t < R.dur[2] / 2;
        const p = A.akari.g.position; vista(-2.5, p.y + 1.4, 9.5, 0, p.y + 1.1, p.z);
      } }
    ];
    Cin.util.arrancar(planos, () => {
      A.g.visible = false; A.hilo.limpiar(); A.vecinos.forEach(n => n.g.visible = true); A.akari.accion.inclina = 0;
      ocultos.forEach(n => n.g.visible = true); Render.ajustes.colorLugar = 1; Estr.refrescarCorazon(); Hikari.mostrar(true); Lumi.grupo.visible = true;
      Atmosfera.lunaNarrativa(1); Cin.lamp = null; Tasogare.mostrar(false); if (cb) cb();
    }, 'recuerdo');
  }
  function huida() {
    const desde = { x: J.x, z: J.z, y: J.y }, p = Cazadores.salir('pradera', J.x, J.z, 32);
    const a = Math.atan2(p.x - J.x, p.z - J.z), fx = Math.sin(a), fz = Math.cos(a);
    Cin.util.arrancar([{ dur: 12, txt: GUION.inicio.lineas.HU01.texto,
      f(u, t, dt) {
        cam(desde.x - fx * 5, desde.y + 2.3, desde.z - fz * 5, p.x, p.y, p.z);
        Hikari.mover(desde.x, desde.y, desde.z, a); Lumi.actualizar(dt, desde.x, desde.y, desde.z, a, null, 0);
      }
    }], () => { Cazadores.salir('pradera', null); UI.hud(true); J.camYaw = a; }, 'huidaInicio');
  }
  Cin.intro = intro; Cin.huidaInicio = huida; Cin.recuerdo = recuerdo;
  Cin.RUTAS.intro = [[45, -123], [39, -108], [7, 23], [-4, 11], [-11, 23], [45, -123]];
  return { preparar, libre, planos: DURACIONES.length, duracion: DURACIONES.reduce((a, b) => a + b, 0),
    estado: () => actores ? { hilo: actores.hilo.estado(), errorContacto: actores.errorContacto } : null };
})();
