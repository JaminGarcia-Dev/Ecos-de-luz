/* === Ecos de Luz · 62-isla-yoake.js ===
   Obra de Yoake. Claude conecta llegada, habitantes e interacciones en el capítulo 4.
   Cargar después de 34-piezas.js. crear() espera a que los sitios tengan su altura.
   puntos usa la altura del apoyo de los pies, también en pasarelas y plataformas.
   La barca mira hacia +z, con el origen en el fondo del casco; no se añade a scene. */
"use strict";

const ISLA_YOAKE = {
  color: { madera: 0x89735c, roca: 0x56636b, arena: 0xd5c7a5, tejado: 0x3a4f5e,
    tierra: 0x796349, humeda: 0x50483a, verde: 0x859879, agua: 0x628e99,
    luz: 0xffd895, humo: 0x9ba6a3 },
  obra: { losa: .18, poste: .13, baranda: 1.05, margen: .12, segmentos: 8,
    remateBaranda: .08, grosorBaranda: .06, junta: .02, aguaEspesor: .025,
    techoVuelo: 3.2, techoProporcion: .8, techoSori: .12, techoBaja: .1 },
  cobertizo: { postesX: 1.7, postesZ: 1.3, alto: 2.4, bancoZ: -.85,
    bancoAncho: 3.2, bancoFondo: .8, bancoY: .55, bancoAlto: .1 },
  escalinata: { zancaAncho: .44, zancaSeparacion: .22, zancaAlto: .55 },
  muelle: { largo: 18, ancho: 3, giro: Math.PI * .75, pilotesCada: 3,
    atraque: 15.5, cobertizo: [-4.5, -2], sora: [-2.8, 1] },
  refugio: { patio: 25, casa: [6, 8, 3.3], comun: [12, 9, 3.8],
    casas: [[-18, -9, Math.PI / 2], [-18, 9, Math.PI / 2],
      [18, -9, -Math.PI / 2], [18, 9, -Math.PI / 2],
      [-9, 19, Math.PI], [9, 19, Math.PI]], comunZ: -19,
    zocalo: .55, galeria: .65, escalon: .2, huella: .45, puerta: 2.2,
    muro: .18, cama: [1.3, .28, 2.1], chimenea: [-4, 2], chimeneaAlto: 7.5,
    chimeneaAncho: 1.2, chimeneaFondo: 1, zocaloVuelo: .7, galeriaVuelo: .3,
    galeriaFondo: 1.3, galeriaZ: .75, escalonZ: 1.6, escalonY: .18,
    escalonAlto: .1, escalonAncho: .4, escalonFondo: .5, escaleraZ: 1.4, escaleraMuestraZ: 2,
    escaleraMin: 3, mesa: [3, .75, 1.3], chiyoX: -2, sayo: [5, -4],
    banco: [3, .45, .65], leñaX: .35, leñaAncho: .4, leñaFondo: 1.8, leñaAlto: 1.2 },
  huertos: { ancho: 6, largo: 10, centros: [-8, 0, 8], alto: .26,
    filas: 7, matas: 6, paso: .8, entrada: 2.2, seco: 2, frente: 5.5,
    mataRadio: .18, mataY: .22, humedaEspesor: .03, humedaY: .01,
    aiko: [-4, 6.5], taku: [10, 7.5], acceso: 1 },
  cisterna: { lado: 5, alto: 1.5, pared: .3, nivel: 1.1,
    palanca: [3.5, 2.5], salida: [0, 2.5], canal: .8, borde: .12,
    altoCanal: .28, paso: 2, caida: .012, lote: 8, agua: .12,
    tejadilloPostes: 2, tejadilloAlto: 2, tejadilloZ: -1, tejadilloExtra: 1,
    tejadilloCumbre: 1.1, canalonY: 1.8, canalonZ: 1.5, canalonFondo: .3,
    palancaY: 1, palancaAlto: .65, palancaGiro: .6, acceso: 1,
    tablaAlto: .65, tablaSube: .4 },
  torre: { alto: 8, lado: 6.4, anchoEscalera: 2.1, ejeEscalera: 1.35,
    peldaños: 20, huella: .38, inicio: 3.2, descanso: 2,
    lamparaY: 1.3, radioLampara: .45, halo: 7, postigo: .95,
    bandera: [-2.4, 1, -2.4], mastil: 2.8, banderaAncho: 1.2,
    banderaAlto: .65, banderaGrosor: .03, postesCada: 4,
    cajaAncho: 1.1, cajaAlto: 1, cajaPostes: .5, cristalDetalle: 1,
    tejadoLado: 1.8, tejadoAlto: .65, postigoAlto: 1,
    postigoGrosor: .08, acceso: 1, renSeparacion: 2, lamparaAcceso: 1.4 },
  mirador: { ancho: 7, largo: 6, entrada: 2.4 },
  cala: { ancho: 4, largo: 9, traviesas: 7, separacion: 1.2,
    traviesaFondo: .25, carril: .3, barcaSol: [.65, 1.9, .8], cobertizoX: -5, acceso: 1 },
  barca: { largo: 7, ancho: 2.2, alto: .85, original: [1.25, .55, 3.8],
    bancos: [-2.1, -.7, .7, 2.1], bancoOriginal: [1.05, .07, .32], bancoAncho: 1.5, bancoAlto: .07,
    bancoFondo: .32, asiento: .86 },
  anim: { bandera: .12, viento: 1.7, humo: 4, periodoHumo: 5,
    humoSube: 2.1, humoDeriva: .65, humoEscala: .32, humoCrece: .7,
    lamparaPulso: .06, lamparaVel: 2, lamparaBrillo: .65,
    aguaOscila: .008, aguaVel: 1.2, respuesta: 5, humoCorte: .95 },
  epilogo: { cestaRadio: .32, cestaAlto: .38, pedestal: .45, cargaLado: .7, cargaY: .55,
    cestaSeparacion: 3, senalRadio: .85, senalAlto: 1.5, mesaPlato: .18, memoria: [3, 9.5], momo: [5, -2.2] }
};

const IslaYoake = (() => {
  const C = ISLA_YOAKE, P = C.color, O = C.obra;
  const puntos = {}, barca = { grupo: new THREE.Group(), colocar };
  const moviles = new THREE.Group(), aguas = [], humos = [];
  let creada = false, bandera, postigo, brillo, luz, compuerta, tablaAgua, bancalHumedo;
  let giroSenal = 0;
  let aguaAnterior = null, senalAnterior = null;
  let epCreado = false, senalEp, cestaEp, cestaEntregada, mesaEp, nombresEp, rumboEp = 0;
  barca.grupo.name = 'Yoake · barca de ocho plazas'; barca.grupo.visible = false;
  moviles.name = 'Yoake · viento, humo, agua y señal';

  function colocar(x, y, z, giro) {
    barca.grupo.position.set(x, y, z); barca.grupo.rotation.y = giro;
  }
  function local(S, x, z, y, giro) {
    const a = giro || 0, c = Math.cos(a), s = Math.sin(a);
    return { x: S.x + x * c + z * s, y: y === undefined ? S.h : y,
      z: S.z - x * s + z * c };
  }
  function punto(id, S, x, z, y, giro) {
    puntos[id] = local(S, x, z, y, giro); return puntos[id];
  }
  /* Las ventanas de las piezas existentes usan el material de obra y un color claro.
     No pedimos su malla emisiva: construir() crearía otro material al llegar aquí. */
  function obra(fn) {
    return Arquitectura.construir(k => fn(Object.assign({}, k, {
      Lz: g => k.A(g, 'tela')
    })));
  }
  function poner(nombre, S, fn, x, z, y, giro) {
    const p = local(S, x || 0, z || 0, y), o = obra(fn);
    o.g.name = 'Yoake · ' + nombre; o.g.position.set(p.x, p.y, p.z);
    o.g.rotation.y = giro || 0;
    o.g.traverse(m => m.layers.set(CAPAS.estatica));
    scene.add(o.g); Arquitectura.ponerSolidos(o, p.x, p.y, p.z, giro || 0);
    return o.g;
  }
  function movil(nombre, fn, p) {
    const o = obra(fn); o.g.name = 'Yoake · ' + nombre;
    if (p) o.g.position.set(p.x, p.y, p.z);
    o.g.traverse(m => { m.castShadow = false; });
    moviles.add(o.g); return o.g;
  }
  function losa(k, w, d, x, y, z, color, clase) {
    k.bx(w, O.losa, d, color || P.madera, x, y - O.losa, z, { clase: clase || 'madera' });
    k.sol(x, z, w / 2, d / 2, y - O.losa, y);
  }
  function poste(k, x, z, y0, y1) {
    k.cy(O.poste, O.poste, y1 - y0, O.segmentos, P.madera, x, y0, z, { clase: 'madera' });
    k.solC(x, z, O.poste, y0, y1, { fina: true });
  }
  function baranda(k, w, d, y, opciones) {
    Arquitectura.barandal(k, w, d, y, P.madera, Object.assign({ alto: O.baranda }, opciones));
  }
  function escalonesCasa(k, d, y0, y1, ancho, n) {
    const R = C.refugio;
    Arquitectura.escalinata(k, 0, d, y0, y1, ancho, n, P.roca, R.huella);
  }
  function cobertizo(k) {
    Arquitectura.cobertizo(k);
  }
  function amarre(k, x, z) {
    const m = k.marca(); Arquitectura.amarre(k, 1); k.mover(m, x, 0, z, 0);
  }
  function embarcadero() {
    const S = sitio('yoakeEmbarcadero'), M = C.muelle, y = S.h + O.losa;
    poner('embarcadero', S, k => {
      losa(k, M.ancho, M.largo, 0, 0, M.largo / 2);
      for (let z = 0; z <= M.largo; z += M.pilotesCada) for (const s of [-1, 1]) {
        const x = s * (M.ancho / 2 - O.poste), p = local(S, x, z, y, M.giro);
        poste(k, x, z, Math.min(-O.losa, altura(p.x, p.z) - y - O.losa), 0);
      }
      baranda(k, M.ancho, M.largo, 0, { z: M.largo / 2, lados: [3] });
      amarre(k, M.ancho / 2 - O.poste, M.largo - M.pilotesCada);
      amarre(k, M.ancho / 2 - O.poste, M.largo - O.margen);
    }, 0, 0, y, M.giro);
    const techo = local(S, ...M.cobertizo, S.h, M.giro);
    poner('cobertizo del embarcadero', { x: techo.x, z: techo.z, h: S.h }, cobertizo, 0, 0, S.h, M.giro);
    punto('embarcadero', S, 0, M.atraque, y, M.giro);
    punto('sora', S, ...M.sora, S.h, M.giro);
  }
  /* Dos interiores: la casa común y la primera vivienda. La puerta queda libre.
     Las otras cinco viviendas reutilizan la casa de Hinode sin cambiar su pieza. */
  function casaAbierta(k, w, d, h, comun) {
    const R = C.refugio, b = R.zocalo, e = R.muro, paso = R.puerta;
    k.bx(w + R.zocaloVuelo, b, d + R.zocaloVuelo, P.roca, 0, 0, 0, { clase: 'piedra' });
    k.sol(0, 0, (w + R.zocaloVuelo) / 2, (d + R.zocaloVuelo) / 2, 0, b);
    for (const x of [-w / 2, w / 2]) {
      k.bx(e, h, d, P.arena, x, b, 0, { clase: 'enlucido' });
      k.sol(x, 0, e / 2, d / 2, b, b + h, { fina: true });
    }
    k.bx(w, h, e, P.arena, 0, b, -d / 2, { clase: 'enlucido' });
    k.sol(0, -d / 2, w / 2, e / 2, b, b + h, { fina: true });
    for (const s of [-1, 1]) {
      const ancho = (w - paso) / 2, x = s * (w + paso) / 4;
      k.bx(ancho, h, e, P.arena, x, b, d / 2, { clase: 'enlucido' });
      k.sol(x, d / 2, ancho / 2, e / 2, b, b + h, { fina: true });
      for (const z of [-d / 2, d / 2]) poste(k, s * w / 2, z, b, b + h);
      poste(k, s * paso / 2, d / 2, b, b + h);
    }
    k.bx(paso, e, e, P.madera, 0, b + h - e, d / 2, { clase: 'madera' });
    k.techo(w + O.techoVuelo, d + O.techoVuelo, h * O.techoProporcion, P.tejado,
      0, b + h - O.techoBaja, 0, { sori: O.techoSori });
    losa(k, w + R.galeriaVuelo, R.galeriaFondo, 0, R.galeria, d / 2 + R.galeriaZ);
    const cama = (x, z) => {
      const [cw, ch, cd] = R.cama;
      k.bx(cw, ch, cd, P.madera, x, b, z, { clase: 'madera' });
      k.bx(cw, O.margen, cd, P.arena, x, b + ch, z, { clase: 'tela' });
      k.sol(x, z, cw / 2, cd / 2, b, b + ch + O.margen);
    };
    for (const x of [-w / 2 + R.cama[0], w / 2 - R.cama[0]]) cama(x, -d / 4);
    if (comun) {
      const [mw, mh, md] = R.mesa;
      k.bx(mw, mh, md, P.madera, 0, b, -d / 4, { clase: 'madera' });
      k.sol(0, -d / 4, mw / 2, md / 2, b, b + mh);
      const [x, z] = R.chimenea;
      k.bx(R.chimeneaAncho, R.chimeneaAlto, R.chimeneaFondo, P.roca, x, b, z, { clase: 'piedra' });
      k.sol(x, z, R.chimeneaAncho / 2, R.chimeneaFondo / 2, b, b + R.chimeneaAlto, { fina: true });
    }
  }
  function refugio() {
    const S = sitio('yoakeRefugio'), R = C.refugio;
    const vivienda = (x, z, giro, comun, abierta) => {
      const [w, d, h] = comun ? R.comun : R.casa, p = local(S, x, z);
      let y = S.h;
      // El borde de la terraza deja de ser plano. El zócalo cubre el desnivel.
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const q = local(p, sx * (w + R.zocaloVuelo) / 2, sz * (d + R.zocaloVuelo) / 2, 0, giro);
        y = Math.max(y, altura(q.x, q.z));
      }
      poner(comun ? 'casa común' : 'vivienda', S, k => {
        const bajo = Math.min(S.h, altura(p.x, p.z)) - y - O.losa;
        k.bx(w + R.zocaloVuelo, -bajo, d + R.zocaloVuelo, P.roca, 0, bajo, 0, { clase: 'piedra' });
        k.sol(0, 0, (w + R.zocaloVuelo) / 2, (d + R.zocaloVuelo) / 2, bajo, 0);
        if (abierta) casaAbierta(k, w, d, h, comun);
        else {
          Arquitectura.casa(k, w, d, h, P.arena, P.tejado, { noren: P.verde });
        }
        const fuera = local(p, 0, d / 2 + R.escaleraMuestraZ, y, giro);
        escalonesCasa(k, d / 2 + R.escaleraZ,
          altura(fuera.x, fuera.z) - y, R.galeria, R.puerta,
          Math.max(R.escaleraMin, Math.ceil((y + R.galeria - altura(fuera.x, fuera.z)) / R.escalon)));
      }, x, z, y, giro);
      if (comun) {
        punto('casaComun', S, x, z + d / 2 + R.galeriaZ, y + R.galeria);
        punto('chiyo', S, x + R.chiyoX, z + d / 2 + R.galeriaZ, y + R.galeria);
        punto('epMesa', S, x, z - d / 4 + 1.6, y + R.zocalo);
        punto('mesaServida', S, x, z - d / 4, y + R.zocalo + R.mesa[1]);
        const chimenea = local(S, x + R.chimenea[0], z + R.chimenea[1], y + R.zocalo + R.chimeneaAlto);
        for (let i = 0; i < C.anim.humo; i++) {
          const m = movil('humo de cocina', k => k.A(pieza(new THREE.IcosahedronGeometry(1, 0), P.humo, {}), 'tela'), chimenea);
          humos.push({ m, x: chimenea.x, y: chimenea.y, z: chimenea.z, fase: i / C.anim.humo });
        }
      }
    };
    R.casas.forEach(([x, z, giro], i) => vivienda(x, z, giro, false, i === 0));
    vivienda(0, R.comunZ, 0, true, true);
    punto('refugio', S, 0, 0); punto('sayo', S, ...R.sayo);
    punto('momoSegura', S, ...C.epilogo.momo);
    poner('banco del patio', S, k => {
      const [w, h, d] = R.banco;
      k.bx(w, h, d, P.madera, 0, 0, 0, { clase: 'madera' });
      k.sol(0, 0, w / 2, d / 2, 0, h);
    }, -R.patio / 4, 0);
  }
  function huertos() {
    const S = sitio('yoakeHuertos'), H = C.huertos;
    poner('tres bancales', S, k => {
      H.centros.forEach((x, i) => {
        const m = k.marca();
        k.bx(H.ancho, H.alto, H.largo, P.tierra, 0, 0, 0, { clase: 'tela' });
        k.sol(0, 0, H.ancho / 2, H.largo / 2, 0, H.alto);
        Arquitectura.valla(k, H.ancho + 1, H.largo + 1, H.entrada);
        for (let f = 0; f < H.filas; f++) {
          const z = -H.largo / 2 + (f + .5) * H.largo / H.filas;
          k.bx(H.ancho - O.margen, O.margen, H.paso, P.tierra, 0, H.alto, z, { clase: 'tela' });
          if (i !== H.seco) for (let n = 0; n < H.matas; n++)
            k.A(pieza(new THREE.IcosahedronGeometry(H.mataRadio, 0), P.verde,
              { x: (n - (H.matas - 1) / 2) * H.paso, y: H.alto + H.mataY, z }), 'tela');
        }
        k.mover(m, x, 0, 0, 0);
      });
    });
    const seco = H.centros[H.seco];
    bancalHumedo = movil('tierra regada', k => k.bx(H.ancho - O.margen, H.humedaEspesor, H.largo - O.margen,
      P.humeda, 0, H.alto + H.humedaY, 0, { clase: 'tela' }), local(S, seco, 0));
    punto('bancal', S, seco, H.frente + H.acceso);
    punto('aiko', S, ...H.aiko); punto('taku', S, ...H.taku);
  }
  function aguaCanal(S, segmentos, nombre) {
    const D = C.cisterna;
    const m = movil(nombre, k => segmentos.forEach(([a, b]) => {
      const dx = b.x - a.x, dz = b.z - a.z, largo = Math.hypot(dx, dz), dy = b.y - a.y;
      k.bx(D.canal, O.aguaEspesor, largo, P.agua, (a.x + b.x) / 2, (a.y + b.y) / 2 + D.agua,
        (a.z + b.z) / 2, { clase: 'tela', ry: Math.atan2(dx, dz),
          antes: g => { const q = g.attributes.position; for (let i = 0; i < q.count; i++) q.setY(i, q.getY(i) + q.getZ(i) * dy / largo); } });
    }), local(S, 0, 0));
    aguas.push(m); return m;
  }
  /* Canal por gravedad. Se calcula una sola vez, desde la salida hacia atrás:
     así ningún tramo sube y el lecho queda por encima del relieve intermedio. */
  function canal(S, destino, nombre) {
    const D = C.cisterna, dx = destino.x - S.x, dz = destino.z - S.z;
    const n = Math.ceil(Math.hypot(dx, dz) / D.paso), v = [];
    for (let i = 0; i <= n; i++) {
      const f = i / n, x = dx * f, z = dz * f;
      v.push({ x, z, y: i === n ? destino.y - S.h : altura(S.x + x, S.z + z) - S.h + O.margen });
    }
    for (let i = n - 1; i >= 0; i--) v[i].y = Math.max(v[i].y, v[i + 1].y + D.caida);
    const tramos = v.slice(1).map((b, i) => [v[i], b]), superficies = [];
    for (let i = 0; i < tramos.length; i += D.lote) {
      const lote = tramos.slice(i, i + D.lote);
      poner(nombre, S, k => lote.forEach(([a, b]) => {
        const m = k.marca(), largo = Math.hypot(b.x - a.x, b.z - a.z), dy = b.y - a.y;
        const inclinar = g => { const q = g.attributes.position; for (let j = 0; j < q.count; j++) q.setY(j, q.getY(j) + q.getZ(j) * dy / largo); };
        k.bx(D.canal + 2 * D.borde, O.margen, largo, P.roca, 0, -O.margen, 0, { clase: 'piedra', antes: inclinar });
        for (const s of [-1, 1]) k.bx(D.borde, D.altoCanal, largo, P.roca,
          s * (D.canal + D.borde) / 2, 0, 0, { clase: 'piedra', antes: inclinar });
        k.sol(0, 0, D.canal / 2 + D.borde, largo / 2, -O.margen - Math.abs(dy) / 2,
          D.altoCanal + Math.abs(dy) / 2);
        k.mover(m, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, Math.atan2(b.x - a.x, b.z - a.z));
      }));
      superficies.push(aguaCanal(S, lote, nombre + ' · agua'));
    }
    return superficies;
  }
  let riegoSeco = [], riegoLleno = [];
  function cisterna() {
    const S = sitio('yoakeCisterna'), H = sitio('yoakeHuertos'), D = C.cisterna;
    poner('cisterna de lluvia', S, k => {
      losa(k, D.lado, D.lado, 0, 0, 0, P.roca, 'piedra');
      for (let lado = 0; lado < 4; lado++) {
        const m = k.marca(), salida = lado === 0;
        for (const s of salida ? [-1, 1] : [0]) {
          const ancho = salida ? (D.lado - D.canal) / 2 : D.lado;
          const x = salida ? s * (D.lado + D.canal) / 4 : 0;
          k.bx(ancho, D.alto, D.pared, P.roca, x, 0, D.lado / 2, { clase: 'piedra' });
          k.sol(x, D.lado / 2, ancho / 2, D.pared / 2, 0, D.alto, { fina: true });
        }
        k.mover(m, 0, 0, 0, lado * Math.PI / 2);
      }
      // Recogida de lluvia desde un tejadillo y su canalón, junto al depósito.
      for (const x of [-D.tejadilloPostes, D.tejadilloPostes]) poste(k, x, D.tejadilloZ, 0, D.alto + D.tejadilloAlto);
      k.techo(D.lado + D.tejadilloExtra, D.lado, D.tejadilloCumbre, P.tejado,
        0, D.alto + D.tejadilloAlto, D.tejadilloZ, { sori: O.techoSori });
      k.bx(D.lado, O.margen, D.canalonFondo, P.madera, 0, D.alto + D.canalonY, D.canalonZ, { clase: 'madera' });
      poste(k, D.palanca[0], D.palanca[1], 0, D.palancaY + O.margen);
      // La palanca barre este espacio al girar; el apoyo no se mueve.
      k.sol(D.palanca[0], D.palanca[1], D.palancaAlto / 2, O.margen,
        D.palancaY, D.palancaY + D.palancaAlto, { fina: true });
      k.sol(0, D.lado / 2, D.canal / 2, D.borde / 2, 0, D.alto, { fina: true });
    });
    movil('agua almacenada', k => k.bx(D.lado - D.pared, O.aguaEspesor, D.lado - D.pared,
      P.agua, 0, D.nivel, 0, { clase: 'tela' }), local(S, 0, 0));
    const salida = local(S, ...D.salida), junta = local(H, 0, -C.huertos.frente - 1, H.h + D.altoCanal);
    const comun = canal({ x: salida.x, z: salida.z, h: S.h }, junta, 'canal de la cisterna');
    riegoLleno = canal({ x: junta.x, z: junta.z, h: H.h }, local(H, C.huertos.centros[0], -C.huertos.frente, H.h + O.margen), 'riego inicial');
    riegoSeco = canal({ x: junta.x, z: junta.z, h: H.h }, local(H, C.huertos.centros[C.huertos.seco], -C.huertos.frente, H.h + O.margen), 'riego del bancal seco');
    // El tramo común siempre lleva agua; solo cambia la derivación elegida.
    comun.forEach(m => { m.visible = true; });
    const palanca = local(S, ...D.palanca);
    compuerta = movil('palanca de reparto', k => k.bx(O.margen, D.palancaAlto, O.margen, P.madera,
      0, 0, 0, { clase: 'madera' }), { x: palanca.x, y: S.h + D.palancaY, z: palanca.z });
    tablaAgua = movil('compuerta de agua', k => k.bx(D.canal, D.tablaAlto, D.borde,
      P.madera, 0, 0, 0, { clase: 'madera' }), local(S, 0, D.lado / 2, S.h + D.agua));
    punto('compuerta', S, D.palanca[0] + D.acceso, D.palanca[1]);
  }
  function torre() {
    const S = sitio('yoakeSenal'), T = C.torre, run = T.peldaños * T.huella;
    const final = T.inicio + run, ancho = T.anchoEscalera, eje = T.ejeEscalera;
    giroSenal = Math.atan2(puntos.embarcadero.x - S.x, puntos.embarcadero.z - S.z);
    poner('torre de señal y escalera', S, k => {
      losa(k, T.lado, T.lado, 0, T.alto, 0);
      for (const x of [-T.lado / 2 + O.poste, T.lado / 2 - O.poste])
        for (const z of [-T.lado / 2 + O.poste, T.lado / 2 - O.poste]) poste(k, x, z, 0, T.alto);
      baranda(k, T.lado, T.lado, T.alto, { lados: [1, 2, 3] });
      // La abertura del rellano coincide con el último peldaño de la escalera derecha.
      const hueco = ancho + 2 * O.margen;
      for (const [a, b] of [[-T.lado / 2, eje - hueco / 2], [eje + hueco / 2, T.lado / 2]])
        baranda(k, b - a, O.margen, T.alto, { x: (a + b) / 2, z: T.lado / 2, lados: [2] });
      // Reutilizamos escalinata con peldaños de madera delgados, sin macizo invisible debajo.
      const escalera = (x, z, lado, y0, y1) => {
        const m = k.marca(), madera = Object.assign({}, k, {
          bx: (w, h, d, hex, px, py, pz, o) => k.bx(w, o && o.antes ? h : Math.min(h, O.losa), d, P.madera,
            px, py + (o && o.antes ? 0 : Math.max(0, h - O.losa)), pz, Object.assign({}, o, { clase: 'madera' })),
          sol: (px, pz, hx, hz, bajo, alto, o) => k.sol(px, pz, hx, hz, o && o.fina ? bajo : alto - O.losa, alto, o)
        });
        Arquitectura.escalinata(madera, lado, 0, y0, y1, ancho, T.peldaños, P.madera, T.huella);
        k.mover(m, x, 0, z, 0);
        for (let i = 0; i < T.peldaños; i++) {
          const top = y0 + (i + 1) * (y1 - y0) / T.peldaños;
          const pz = z + (lado === 0 ? 1 : -1) * (T.peldaños - i - .5) * T.huella;
          for (const s of [-1, 1]) {
            const px = x + s * (ancho / 2 + O.margen);
            k.bx(O.remateBaranda, O.remateBaranda, T.huella + O.junta, P.madera,
              px, top + O.baranda - O.remateBaranda, pz, { clase: 'madera' });
            k.sol(px, pz, O.remateBaranda / 2, (T.huella + O.junta) / 2,
              top + O.baranda - O.remateBaranda, top + O.baranda, { fina: true });
            if (i % T.postesCada === 0) poste(k, px, pz, top - O.losa, top + O.baranda);
          }
        }
      };
      escalera(-eje, final, 2, 0, T.alto / 2);
      escalera(eje, T.inicio, 0, T.alto / 2, T.alto);
      losa(k, T.lado, T.descanso, 0, T.alto / 2, final + T.descanso / 2);
      baranda(k, T.lado, T.descanso, T.alto / 2, { z: final + T.descanso / 2, lados: [0, 1, 3] });
      for (const x of [-T.lado / 2 + O.poste, T.lado / 2 - O.poste])
        poste(k, x, final + T.descanso - O.poste, altura(S.x + x, S.z + final + T.descanso) - S.h, T.alto / 2);
      // Caja de la lámpara; el frente mira hacia el atraque.
      const caja = k.marca();
      k.bx(T.cajaAncho, T.lamparaY, T.cajaAncho, P.roca, 0, T.alto, 0, { clase: 'piedra' });
      k.sol(0, 0, T.cajaAncho / 2, T.cajaAncho / 2, T.alto, T.alto + T.lamparaY + T.cajaAlto, { fina: true });
      // El postigo abierto queda fuera de la caja; reservamos su barrido con un sólido fino.
      k.sol(-T.cajaPostes, T.cajaPostes + T.postigo / 2, O.grosorBaranda,
        T.postigo / 2, T.alto + T.lamparaY, T.alto + T.lamparaY + T.cajaAlto, { fina: true });
      for (const x of [-T.cajaPostes, T.cajaPostes]) for (const z of [-T.cajaPostes, T.cajaPostes])
        poste(k, x, z, T.alto + T.lamparaY, T.alto + T.lamparaY + T.cajaAlto);
      k.techo(T.tejadoLado, T.tejadoLado, T.tejadoAlto, P.tejado,
        0, T.alto + T.lamparaY + T.cajaAlto, 0, { sori: O.techoSori });
      k.mover(caja, 0, 0, 0, giroSenal);
      poste(k, T.bandera[0], T.bandera[2], T.alto, T.alto + T.mastil);
    });
    punto('torre', S, -eje, T.inicio - T.acceso);
    punto('ren', S, -eje - T.renSeparacion, T.inicio - T.acceso);
    punto('lampara', S, T.lamparaAcceso, 0, S.h + T.alto);
    const centro = local(S, 0, 0, S.h + T.alto + T.lamparaY + T.cajaAlto / 2);
    luz = movil('cristal de la lámpara', k => k.A(pieza(new THREE.IcosahedronGeometry(T.radioLampara, T.cristalDetalle), P.luz, {}), 'tela'), centro);
    brillo = new Halo(P.luz, 0); brillo.scale.set(T.halo, T.halo, 1);
    brillo.position.copy(luz.position); moviles.add(brillo);
    const bisagra = local(S, -T.cajaPostes, T.cajaPostes, centro.y, giroSenal);
    postigo = movil('postigo de la señal', k => k.bx(T.postigo, T.postigoAlto, T.postigoGrosor, P.madera,
      T.postigo / 2, -T.postigoAlto / 2, 0, { clase: 'madera' }), bisagra);
    postigo.rotation.y = giroSenal;
    bandera = movil('bandera del refugio', k => k.bx(T.banderaAncho, T.banderaAlto, T.banderaGrosor, P.arena,
      T.banderaAncho / 2, 0, 0, { clase: 'tela' }), local(S, T.bandera[0], T.bandera[2], S.h + T.alto + T.mastil - T.bandera[1]));
  }
  function mirador() {
    const S = sitio('yoakeMirador'), M = C.mirador;
    poner('mirador', S, k => {
      losa(k, M.ancho, M.largo, 0, O.losa, 0);
      baranda(k, M.ancho, M.largo, O.losa, { lados: [1, 2, 3] });
      baranda(k, M.ancho, M.largo, O.losa, { lados: [0], hueco: M.entrada });
    });
    punto('mirador', S, 0, -M.largo / 2 + M.entrada / 2, S.h + O.losa);
  }
  function cala() {
    const S = sitio('yoakeCala'), V = C.cala;
    poner('varadero de la cala', S, k => {
      for (let i = 0; i < V.traviesas; i++) {
        const z = (i - (V.traviesas - 1) / 2) * V.separacion;
        losa(k, V.ancho, V.traviesaFondo, 0, O.losa, z);
      }
      for (const s of [-1, 1]) losa(k, V.carril, V.largo, s * V.ancho / 3, O.losa, 0);
      const m = k.marca(); Arquitectura.barca(k, 1); k.mover(m, 0, O.losa, 0, 0);
      k.sol(0, 0, V.barcaSol[0], V.barcaSol[1], O.losa, O.losa + V.barcaSol[2]);
    });
    poner('cobertizo del varadero', S, cobertizo, V.cobertizoX, 0);
    punto('cala', S, 0, V.largo / 2 + V.acceso);
  }
  function construirBarca() {
    const B = C.barca, o = obra(k => {
      // Mismo casco y remos que Kaito; escalado por eje, con cuatro bancos de dos plazas.
      const casco = obra(q => Arquitectura.barca(Object.assign({}, q, {
        bx: (w, h, d, ...args) => {
          if (w === B.bancoOriginal[0] && h === B.bancoOriginal[1] && d === B.bancoOriginal[2]) return;
          q.bx(w, h, d, ...args);
        }
      }), 1));
      const g = casco.g.children[0].geometry.clone();
      g.scale(B.ancho / B.original[0], B.alto / B.original[1], B.largo / B.original[2]);
      k.A(g, 'madera'); casco.g.children[0].geometry.dispose();
      B.bancos.forEach(z => k.bx(B.bancoAncho, B.bancoAlto, B.bancoFondo, P.madera,
        0, B.asiento, z, { clase: 'madera' }));
    });
    barca.grupo.add(o.g);
    // Sin sólidos mundiales: Claude mueve grupo y pasajeros durante la travesía.
  }
  /* ---------- piezas del epílogo: apoyos fuera del paso y objetos móviles sin sombra estática ---------- */
  function apoyoEpilogo(nombre, p, radio, alto) {
    poner(nombre, { x: p.x, z: p.z, h: p.y }, k => {
      k.cy(radio, radio, C.epilogo.pedestal, O.segmentos, P.madera, 0, 0, 0, { clase: 'madera' });
      k.solC(0, 0, radio, 0, alto, { fina: true });
    });
  }
  function cesta(k) {
    const E = C.epilogo;
    k.cy(E.cestaRadio, E.cestaRadio * .8, E.cestaAlto, O.segmentos, P.madera, 0, 0, 0, { clase: 'madera' });
    for (const x of [-E.cestaRadio, E.cestaRadio]) k.bx(.05, .3, .05, P.madera, x, E.cestaAlto, 0, { clase: 'madera' });
    k.bx(E.cestaRadio * 2, .05, .05, P.madera, 0, E.cestaAlto + .3, 0, { clase: 'madera' });
    k.bx(.42, .08, .4, P.verde, 0, E.cestaAlto, 0, { clase: 'tela' });
  }
  function suministroEpilogo() {
    const E = C.epilogo, S = sitio('yoakeEmbarcadero');
    const p = local(S, ...C.muelle.cobertizo, S.h, C.muelle.giro);
    // Junto al cobertizo, sin ocupar las tablas de desembarco.
    p.x -= E.cestaSeparacion; p.y = altura(p.x, p.z);
    puntos.epCesta = { x: p.x, y: p.y, z: p.z + 1.2 };
    apoyoEpilogo('apoyo de provisiones', p, E.cestaRadio + .05, E.pedestal + E.cestaAlto + .35);
    cestaEp = movil('cesta de provisiones', cesta, { x: p.x, y: p.y + E.pedestal, z: p.z });
    const H = puntos.aiko, d = { x: H.x + 2, z: H.z, y: altura(H.x + 2, H.z) };
    puntos.epEntrega = { x: d.x, y: d.y, z: d.z + 1.2 };
    apoyoEpilogo('apoyo junto al canal', d, E.cestaRadio + .05, E.pedestal + E.cestaAlto + .35);
    cestaEntregada = movil('cesta entregada a los Mori', cesta, { x: d.x, y: d.y + E.pedestal, z: d.z });
  }
  function senalEpilogo() {
    const E = C.epilogo, r = puntos.ren, p = { x: r.x - 2, z: r.z, y: altura(r.x - 2, r.z) };
    puntos.epSenal = { x: p.x, y: p.y, z: p.z + 1.4 };
    poner('poste de la señal ambiental', { x: p.x, z: p.z, h: p.y }, k => {
      poste(k, 0, 0, 0, E.senalAlto);
      // Cubre también el barrido de la flecha. El sólido fino deja libre la escalera de la torre.
      k.solC(0, 0, E.senalRadio, E.senalAlto - .2, E.senalAlto + .2, { fina: true });
    });
    senalEp = movil('flecha de entrada', k => {
      k.bx(.16, .12, 1.3, P.luz, 0, E.senalAlto, 0, { clase: 'madera' });
      for (const s of [-1, 1]) k.bx(.12, .12, .5, P.luz, s * .16, E.senalAlto, .48, { clase: 'madera', ry: s * .7 });
    }, p);
    rumboEp = Math.atan2(puntos.embarcadero.x - p.x, puntos.embarcadero.z - p.z);
  }
  function mesaEpilogo() {
    const p = puntos.mesaServida, E = C.epilogo;
    // Los platos y las tazas quedan sobre la mesa existente, dentro de su proyección sólida.
    poner('borde de la mesa preparada', { x: p.x, z: p.z, h: p.y }, k => {
      k.sol(0, 0, C.refugio.mesa[0] / 2, C.refugio.mesa[2] / 2, 0, .16, { fina: true });
    });
    mesaEp = movil('sitios preparados', k => {
      k.bx(2.7, .02, 1.15, P.arena, 0, .01, 0, { clase: 'tela' });
      for (const x of [-.9, 0, .9]) {
        k.cy(E.mesaPlato, E.mesaPlato, .04, O.segmentos, P.roca, x, .03, .23, { clase: 'piedra' });
        k.cy(.09, .07, .12, O.segmentos, P.roca, x, .03, -.25, { clase: 'piedra' });
      }
    }, p);
  }
  function memoriaEpilogo() {
    const S = sitio('yoakeHuertos'), p = local(S, ...C.epilogo.memoria);
    punto('momoSegura', S, 0, 8.5); punto('sayoSegura', S, 1.6, 8.5); punto('aikoSegura', S, -1.6, 8.5);
    p.y = altura(p.x, p.z); puntos.epMemoria = { x: p.x, y: p.y, z: p.z + 1.2 };
    poner('mesa de memoria', { x: p.x, z: p.z, h: p.y }, k => {
      k.bx(1.8, .8, .8, P.madera, 0, 0, 0, { clase: 'madera' });
      k.sol(0, 0, .9, .4, 0, 1.65, { fina: true });
    });
    const lienzo = document.createElement('canvas'); lienzo.width = 512; lienzo.height = 512;
    const ctx = lienzo.getContext('2d'); ctx.fillStyle = '#eee0b7'; ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#493f38'; ctx.font = '26px sans-serif';
    ['Nao · Rui · Tsuru', 'Vera · injertadora', 'León · calafate', 'Inés · copista', 'Bruno · cantero', 'Alba · cuidadora de refugios'].forEach((s, i) => ctx.fillText(s, 18, 50 + i * 76));
    const tex = new THREE.CanvasTexture(lienzo); tex.encoding = THREE.sRGBEncoding;
    nombresEp = new THREE.Mesh(new THREE.PlaneGeometry(1.65, .8), new THREE.MeshLambertMaterial({ map: tex }));
    nombresEp.name = 'Yoake · nombres y oficios'; nombresEp.position.set(p.x, p.y + 1.23, p.z + .02); moviles.add(nombresEp);
  }
  function crearEpilogo() {
    if (epCreado) return;
    suministroEpilogo(); senalEpilogo(); mesaEpilogo(); memoriaEpilogo(); epCreado = true;
    Bus.emit('sombraEstatica');
  }
  function actualizarEpilogo(dt, J) {
    if (!epCreado) return;
    const e = (Sis.ST.inicio.cap || {}).ep7 || {};
    const carga = !!e.cesta && !e.suministros;
    cestaEp.visible = !e.suministros; cestaEntregada.visible = !!e.suministros;
    if (carga && J) {
      const E = C.epilogo;
      cestaEp.position.set(J.x + Math.cos(J.yaw || 0) * E.cargaLado, J.y + E.cargaY, J.z - Math.sin(J.yaw || 0) * E.cargaLado);
      cestaEp.rotation.y = J.yaw || 0;
      cestaEp.visible = !Cin.activa;
    }
    mesaEp.visible = !!e.mesa; nombresEp.visible = !!e.memoria;
    senalEp.rotation.y = damp(senalEp.rotation.y, rumboEp + (e.senal ? 0 : Math.PI / 2), C.anim.respuesta, dt);
  }
  function crear() {
    if (creada) return;
    embarcadero(); refugio(); huertos(); cisterna(); torre(); mirador(); cala(); construirBarca();
    scene.add(moviles); creada = true; actualizar(0, 0);
    Bus.emit('sombraEstatica');
  }
  function actualizar(dt, t) {
    if (!creada) return;
    const A = C.anim, cap = Sis.ST.inicio && Sis.ST.inicio.cap;
    const agua = !!cap && cap.agua === true, senal = !!cap && cap.senal === true;
    if (agua !== aguaAnterior) {
      riegoSeco.forEach(m => { m.visible = agua; });
      riegoLleno.forEach(m => { m.visible = !agua; });
      bancalHumedo.visible = agua; aguaAnterior = agua;
    }
    if (senal !== senalAnterior) { luz.visible = senal; brillo.visible = senal; senalAnterior = senal; }
    compuerta.rotation.z = damp(compuerta.rotation.z, agua ? -C.cisterna.palancaGiro : C.cisterna.palancaGiro, A.respuesta, dt);
    tablaAgua.children[0].position.y = damp(tablaAgua.children[0].position.y,
      agua ? C.cisterna.tablaSube : 0, A.respuesta, dt);
    postigo.rotation.y = damp(postigo.rotation.y, giroSenal - (senal ? Math.PI / 2 : 0), A.respuesta, dt);
    brillo.opacidad = senal ? A.lamparaBrillo + A.lamparaPulso * Math.sin(t * A.lamparaVel) : 0;
    bandera.rotation.y = A.bandera * Math.sin(t * A.viento);
    // Cada superficie conserva su cota propia; la oscilación se aplica al grupo interior.
    aguas.forEach(m => { m.children[0].position.y = A.aguaOscila * Math.sin(t * A.aguaVel); });
    for (const h of humos) {
      const f = (t / A.periodoHumo + h.fase) % 1;
      h.m.position.set(h.x + f * A.humoDeriva, h.y + f * A.humoSube, h.z);
      h.m.scale.setScalar(A.humoEscala + Math.sin(f * Math.PI) * A.humoCrece);
      h.m.visible = f < A.humoCorte;
    }
  }
  return { crear, actualizar, crearEpilogo, actualizarEpilogo, puntos, barca };
})();
