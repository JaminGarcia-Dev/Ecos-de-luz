/* === Ecos de Luz · 64-luna-roja.js ===
   Arte y actuación de la usurpadora física. Frente +Z; izquierda anatómica +X.
   Un cuerpo con esqueleto, placas rígidas pegadas a huesos y el material de Hikari.
   Sin IA, daño, colisiones ni progreso: esos estados los dirige el combate.
   Integración: crear durante la carga, añadir muestras() a la escena de compilación
   y llamar actualizar(dt) también en las escenas. Una unidad equivale a un metro.
   pose(nombre, vel=1): vel es un multiplicador temporal. El impacto empieza en
   poses[nombre].aviso/vel y acaba en (aviso+golpe)/vel; no emite eventos de daño.
   etapa(3) desprende una pieza en rotura.duracion segundos; mascara(k) fija la rotura.
   conexion(i, visible, punto?): i=0..3, punto es {x,y,z} en mundo; null restaura
   el destino relativo. hueso(nombre) devuelve un THREE.Bone (getWorldPosition).
   Las muestras comparten geometría/material: retirarlas sin liberar esos recursos. */
"use strict";

const LUNA_ROJA = {
  altura: 5, alturaBase: 5,
  color: { nacar: 0xfff3df, oro: 0xd8ad52, cuerpo: 0x382736, placa: 0x705365,
    sombra: 0x160f20, grieta: 0xf04452, disco: 0x8c2637, aviso: 0xfff0cb },
  material: { borde: .24, relleno: .18, exponente: 3, metal: .18, rugo: .78,
    nacar: .38, oro: .46, emision: 1, rojo: 1.2, blanco: .55, dorado: .32,
    colorBorde: [.78, .055, .085] }, // RGB lineal, como el perfil de Hikari.
  detalle: { arco: 60, disco: 96, ancho: 4, anchoDisco: 7, mascara: 24,
    mascaraRadial: 12, cilindro: 8, esfera: 16, esferaFilas: 10, trazo: 12, trazoLados: 4,
    manto: 64 },
  anim: { mezcla: .3, anticipa: .5, respirar: .012, respirarFrec: 1.25, manto: .012, mantoFrec: .8,
    discoVel: .07, haloMano: .18, haloNucleo: .19, haloVelo: .055, pulso: .12,
    pulsoFrec: 2.3, velocidadMin: .05, velocidadMax: 8 },
  rotura: { separa: .22, desplaza: .9, giro: 1.35, empiezaCaida: .12,
    baseGrieta: .018, anchoGrieta: .025, duracion: .9 },
  disco: { radio: 1.08, ancho: .25, fondo: .15, inicio: -.12, arco: 1.52 * Math.PI,
    ribete: .04, rojo: .045 },
  mantos: { radio: .66, ancho: .39, fondo: .28, inicio: -.63*Math.PI, arco: Math.PI * 1.26,
    ribete: .045, rojo: .022, escalaFilas: 1, giroFilas: 0 },
  // Perfil cerrado de campana: y, semiancho, fondo. Tres faldones solapados.
  campana: { pliegue: .035, perfiles: [
    [[.12,1.45,1.03],[.24,1.44,1.02],[1.10,1.30,.88],[1.90,.96,.66]],
    [[1.55,1.24,.85],[1.67,1.23,.84],[2.48,.98,.69],[3.00,.74,.55]],
    [[2.66,1.04,.73],[2.78,1.03,.72],[3.60,.84,.57],[4.12,.48,.39]] ] },
  velo: { centro: 2.65 },
  conexion: { radio: .028, minimo: .001,
    destinos: [[-4.2, .16, 2.9], [4.2, .16, 2.9], [-4.2, .16, -2.9], [4.2, .16, -2.9]],
    origenes: [[-.38, .32, -.32], [.38, .32, -.32], [-.38, -.18, -.32], [.38, -.18, -.32]] },
  // Coordenadas locales del rig. La cabeza llega a 5 m; el disco sobresale por detrás.
  rig: [ ['base', null, 0, 0, 0], ['cadera', 'base', 0, 2.05, 0],
    ['pecho', 'cadera', 0, 1.35, 0], ['cabeza', 'pecho', 0, 1.20, .015],
    ['nucleo', 'pecho', 0, -.30, .77], ['disco', 'cabeza', 0, 0, -.57],
    ['brazoI', 'pecho', 1.02, .43, .15], ['antebrazoI', 'brazoI', 0, -1.08, 0],
    ['manoI', 'antebrazoI', 0, -1.02, 0], ['brazoD', 'pecho', -1.02, .43, .15],
    ['antebrazoD', 'brazoD', 0, -1.08, 0], ['manoD', 'antebrazoD', 0, -1.02, 0],
    ['musloI', 'cadera', .38, -.05, 0], ['piernaI', 'musloI', 0, -.95, 0],
    ['pieI', 'piernaI', 0, -.90, 0], ['musloD', 'cadera', -.38, -.05, 0],
    ['piernaD', 'musloD', 0, -.95, 0], ['pieD', 'piernaD', 0, -.90, 0],
    ['velo', 'base', 0, 0, 0] ],
  forma: {
    pelvis: [.65, .35, .48], torso: [.84, .83, .56], cuello: [.21, .48, .22],
    cabeza: [.35, .39, .31], palma: [.31, .23, .19],
    brazo: [.32, 1.08, .30], antebrazo: [.30, 1.02, .28],
    muslo: [.24, .95, .23], pierna: [.18, .90, .18], pie: [.25, .12, .40],
    dedos: 4, dedoAncho: .12, dedoLargo: .29, dedoFondo: .16, dedoPaso: .15,
    pulgar: [.16, .29, .19], nucleo: [.16, .27, .10],
    ojoX: .13, ojoY: .04, ojoZ: .307, ojo: [.15, .035, .025],
    mascaraX: .37, mascaraY: .40, mascaraZ: .25, mascaraFrente: .24,
    mascaraOndula: .012, mascaraFase: 13, piezasMascara: 4,
    grietaPuntos: [[-.04,.38], [.025,.23], [-.018,.11], [.035,-.05], [-.045,-.19], [0,-.36]],
    grietaTorso: [[-.22,.56,.59], [.07,.25,.65], [-.08,-.08,.72], [.12,-.58,.77]],
    mantoX: .64, mantoY: .43, mantoZ: .03, filasManto: 3, pasoManto: .70,
    manoHalo: .9, nucleoHalo: .8, veloHalo: 5.4,
    juntaDedos: -.40, pieZ: .12, dedoZ: .025, pulgarX: -.32, pulgarY: -.22,
    pechoY: .66, brazoY: -.54, antebrazoY: -.51,
    musloY: -.475, piernaY: -.45, pieY: -.03,
    rojoZ: .012, oroZ: .006, mascarillaGiro: .10, nucleoGiro: Math.PI / 4 },
  apoyos: { pieY: .18, pieZ: .24, polo: [0,0,1], manoGolpe: [-.95,.17,.95],
    manoBarrido: [.35,1.20,1.05], palmaGolpe: -Math.PI/2 },
  poses: {
    reposo: { dur: .6, postura: { brazoI: [0,0,.32], brazoD: [0,0,-.32],
      antebrazoI: [-.24,0,0], antebrazoD: [-.24,0,0] } },
    barrido: { aviso: 1.8, golpe: .42, recupera: 2.5,
      prepara: { pecho: [0,-.50,0], brazoD: [.45,.30,-1.15], antebrazoD: [-.35,0,0], manoD: [0,0,-.35] },
      impacto: { bajar: .80, pecho: [.65,.50,0], brazoD: [-.6,-.35,.72], antebrazoD: [-.25,0,0], manoD: [0,.4,0] },
      descansa: { bajar: .72, pecho: [.60,.35,0], brazoD: [-.45,0,.35], antebrazoD: [-.15,0,0] } },
    golpe: { aviso: 1.6, golpe: .32, recupera: 3,
      prepara: { pecho: [-.22,0,0], brazoD: [-2.75,0,-.25], antebrazoD: [-.35,0,0], manoD: [-.45,0,0] },
      impacto: { bajar: 1.75, pecho: [1.20,0,0], brazoD: [-.38,0,.40], antebrazoD: [-.12,0,0], manoD: [-.8,0,0] },
      descansa: { bajar: 1.72, pecho: [1.15,0,0], brazoD: [-.35,0,.40], antebrazoD: [-.16,0,0] } },
    extraer: { dur: 2, postura: { pecho: [-.12,0,0], cabeza: [-.26,0,0],
      brazoI: [-2.55,0,.40], brazoD: [-2.55,0,-.40], antebrazoI: [-.3,0,0], antebrazoD: [-.3,0,0] } },
    aturdida: { dur: .42, postura: { bajar: .65, pecho: [.72,0,.10], cabeza: [.3,0,-.18],
      brazoI: [-.32,0,.32], brazoD: [-.4,0,-.4], musloI: [-.65,0,0], musloD: [-.65,0,0],
      piernaI: [1.1,0,0], piernaD: [1.1,0,0] } },
    caer: { dur: 2.4, postura: { bajar: 1.85, pecho: [.86,0,.12], cabeza: [.3,0,0],
      musloI: [-1.35,0,0], musloD: [-1.35,0,0], piernaI: [2.3,0,0], piernaD: [2.3,0,0],
      brazoI: [-.65,0,.65], brazoD: [-.65,0,-.65], antebrazoI: [-.3,0,0], antebrazoD: [-.3,0,0] } }
  }
};

const LunaRoja = (() => {
  const T = LUNA_ROJA, F = T.forma, D = T.detalle, R = new THREE.Group();
  R.name = 'Luna_Roja'; R.visible = false;
  const B = {}, lista = [], indices = {}, mantos = [], fragmentos = [], conexiones = [], halos = [];
  const sectoresMascara = [-Math.PI/2, Math.PI/2, 5*Math.PI/6, 7*Math.PI/6, 3*Math.PI/2];
  const uBrillo = { value: T.material.emision }, v = new THREE.Vector3(), w = new THREE.Vector3();
  const eje = new THREE.Vector3(0, 1, 0), e = new THREE.Euler();
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qc = new THREE.Quaternion();
  const qSup = new THREE.Quaternion(), qInf = new THREE.Quaternion(), qMano = new THREE.Quaternion();
  const polo = new THREE.Vector3(...T.apoyos.polo), animados = [];
  let malla, mat, tiempo = 0, relojPose = 0, nombrePose = 'reposo', velocidad = 1;
  let numeroEtapa = 1, rotura = 0, roturaObjetivo = 0, desdeBajar = 0, bajar = 0, grietas;
  const desde = [], colores = {};
  for (const n in T.color) colores[n] = lin(T.color[n]);
  function hueso(n) { return B[n]; }
  function nuevoHueso(n, padre, x, y, z) {
    const b = new THREE.Bone(); b.name = n; b.position.set(x, y, z);
    indices[n] = lista.length; lista.push(b); B[n] = b;
    (padre ? B[padre] : R).add(b); return b;
  }
  // Copiar una pieza transformada al reposo del esqueleto; nunca crear una malla por placa.
  function agregar(c, g, n, color, rugo = T.material.rugo, emision = 0) {
    g.applyMatrix4(B[n].matrixWorld);
    const p = g.attributes.position, base = c.p.length / 3, col = colores[color];
    for (let i = 0; i < p.count; i++) c.vert(p.getX(i), p.getY(i), p.getZ(i), col, rugo, emision, [indices[n], 1]);
    if (g.index) for (const j of g.index.array) c.i.push(base + j);
    else for (let i = 0; i < p.count; i++) c.i.push(base + i);
    g.dispose();
  }
  function caja(c, n, xyz, tam, color, giro = 0, emision = 0) {
    const g = new THREE.BoxGeometry(...tam); g.rotateZ(giro); g.translate(...xyz);
    agregar(c, g, n, color, T.material.rugo, emision);
  }
  function cristal(c, n, xyz, tam, color, emision = 0) {
    const g = new THREE.OctahedronGeometry(1, 1); g.scale(...tam); g.translate(...xyz);
    agregar(c, g, n, color, T.material.rugo, emision);
  }
  // Segmento de anillo extruido: caras planas, abertura real y extremos cerrados.
  function arco(radio, ancho, fondo, inicio, longitud, nu, nv) {
    const p = [], ix = [], fila = nu + 1, capa = fila * (nv + 1);
    for (const z of [-fondo / 2, fondo / 2]) for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
      const a = inicio + longitud * i / nu, r = radio - ancho * j / nv;
      p.push(Math.cos(a) * r, Math.sin(a) * r, z);
    }
    const quad = (a,b,c,d) => ix.push(a,b,c,b,d,c);
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = j * fila + i; quad(a,a+fila,a+1,a+fila+1);
      quad(a+capa,a+1+capa,a+fila+capa,a+fila+1+capa);
    }
    for (let i = 0; i < nu; i++) {
      quad(i,i+1,i+capa,i+1+capa);
      const a = nv * fila + i; quad(a,a+capa,a+1,a+capa+1);
    }
    for (let j = 0; j < nv; j++) {
      const a = j * fila, b = a + nu;
      quad(a,a+capa,a+fila,a+fila+capa); quad(b,b+fila,b+capa,b+fila+capa);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(p,3)); g.setIndex(ix); return g;
  }
  function placaLunar(c, n, K, segmentos, ancho) {
    const disco = n === 'disco';
    agregar(c, arco(K.radio,K.ancho,K.fondo,K.inicio,K.arco,segmentos,ancho), n,
      disco ? 'disco' : 'placa',T.material.rugo,disco ? .42 : 0);
    const oro = arco(K.radio,K.ribete,K.fondo,K.inicio,K.arco,segmentos,1); oro.translate(0,0,F.oroZ);
    agregar(c,oro,n,'oro',T.material.oro,T.material.dorado);
    const rojo = arco(K.radio-K.ancho,K.rojo,K.fondo,K.inicio,K.arco,segmentos,1); rojo.translate(0,0,F.rojoZ);
    agregar(c,rojo,n,'grieta',T.material.rugo,T.material.rojo);
  }
  function trazo(c, n, puntos, radio, color, emision) {
    const curva = new THREE.CatmullRomCurve3(puntos.map(p => new THREE.Vector3(...p)));
    agregar(c,new THREE.TubeGeometry(curva,D.trazo,radio,D.trazoLados,false),n,color,T.material.rugo,emision);
  }
  function halo(n, color, tam, opacidad, xyz) {
    const h = new Halo(T.color[color],opacidad); h.scale.set(tam,tam,1);
    if (xyz) h.position.fromArray(xyz); B[n].add(h); halos.push(h); return h;
  }
  function crearManto(c) {
    // Volúmenes completos, también por detrás. Los ribetes pertenecen a la coraza.
    // El faldón inferior permanece junto al suelo; el superior sigue al pecho.
    T.campana.perfiles.forEach((perfil,k) => {
      const n = 'campana'+k, origen = B[n].getWorldPosition(new THREE.Vector3());
      for (let j = 0; j < perfil.length-1; j++) {
        const base = c.p.length/3;
        for (let fila = j; fila <= j+1; fila++) for (let i = 0; i <= D.manto; i++) {
          const a = i/D.manto*Math.PI*2, [y,rx,rz] = perfil[fila];
          const pliegue = 1+T.campana.pliegue*Math.cos(a*12);
          const col = colores[j === 0 ? 'oro' : (k === 1 ? 'cuerpo' : 'placa')];
          c.vert(Math.cos(a)*rx*pliegue, y+.10*Math.cos(a)**2,
            Math.sin(a)*rz*pliegue, col,j === 0 ? T.material.oro : T.material.rugo,
            j === 0 ? .12 : 0,[indices[n],1]);
        }
        for (let i = 0; i < D.manto; i++) {
          const a = base+i, b = a+D.manto+1;
          c.i.push(a,b,a+1,a+1,b,b+1);
        }
      }
      // Tapar arriba evita ver el interior al alzar la cámara o inclinar el pecho.
      const [y,rx,rz] = perfil[perfil.length-1];
      const tapa = new THREE.ConeGeometry(1,.12,D.manto);
      tapa.scale(rx,1,rz); tapa.translate(-origen.x,y+.06-origen.y,-origen.z);
      agregar(c,tapa,n,'cuerpo');
    });
  }
  function superficieMascara(x,y) {
    return F.mascaraFrente+F.mascaraZ*Math.sqrt(Math.max(0,1-(x/F.mascaraX)**2-(y/F.mascaraY)**2));
  }
  function crearMascara(c) {
    const rangos = [];
    for (let k = 0; k < F.piezasMascara; k++) {
      const n = 'mascara'+k, b = nuevoHueso(n,'cabeza',0,0,0); fragmentos.push(b); R.updateMatrixWorld(true);
      const g = new THREE.BufferGeometry(), p = [], ix = [];
      for (let j = 0; j <= D.mascaraRadial; j++) for (let i = 0; i <= D.mascara; i++) {
        const r = j / D.mascaraRadial, a = lerp(sectoresMascara[k],sectoresMascara[k+1],i/D.mascara);
        const dentado = F.mascaraOndula * Math.sin(r * F.mascaraFase) * r;
        p.push(Math.cos(a)*F.mascaraX*r + dentado, Math.sin(a)*F.mascaraY*r,
          F.mascaraFrente + F.mascaraZ * Math.sqrt(1-r*r));
      }
      for (let j = 0; j < D.mascaraRadial; j++) for (let i = 0; i < D.mascara; i++) {
        const a = j*(D.mascara+1)+i, b = a+D.mascara+1; ix.push(a,b,a+1,a+1,b,b+1);
      }
      g.setAttribute('position',new THREE.Float32BufferAttribute(p,3)); g.setIndex(ix);
      agregar(c,g,n,'nacar',T.material.nacar,.14);
      const ribete = arco(F.mascaraX,.035,.045,sectoresMascara[k],sectoresMascara[k+1]-sectoresMascara[k],D.mascara,1);
      ribete.scale(1,F.mascaraY/F.mascaraX,1); ribete.translate(0,0,F.mascaraFrente);
      agregar(c,ribete,n,'oro',T.material.oro,T.material.dorado);
      const inicio = c.m.length;
      // Cada grieta cae con su placa. No quedan trazos suspendidos ante el rostro.
      const a = lerp(sectoresMascara[k],sectoresMascara[k+1],.46);
      const puntos = [0,.25,.52,.74,.96].map((r,i) => {
        const ang = a+(i%2 ? .12 : -.06), x = Math.cos(ang)*F.mascaraX*r, y = Math.sin(ang)*F.mascaraY*r;
        return [x,y,superficieMascara(x,y)+.012];
      });
      trazo(c,n,puntos,T.rotura.baseGrieta,'grieta',T.material.rojo);
      rangos.push({ inicio, fin: c.m.length });
    }
    const n = 'grietasMascara'; nuevoHueso(n,'cabeza',0,0,0); R.updateMatrixWorld(true);
    // Rostro de sombra, con grietas propias detrás de la superficie nacarada.
    const cara = F.grietaPuntos.map(([x,y]) => [x,y,
      F.cabeza[2]*Math.sqrt(Math.max(0,1-(x/F.cabeza[0])**2-(y/F.cabeza[1])**2))+.014]);
    trazo(c,n,cara,T.rotura.anchoGrieta,'grieta',T.material.rojo);
    for (const s of [-1,1]) trazo(c,n,[[s*.04,.14,.30],[s*.17,.20,.24],[s*.23,.12,.23]],
      .018,'grieta',T.material.rojo);
    grietas = rangos;
  }
  function crear() {
    if (malla) return R;
    for (const h of T.rig) nuevoHueso(...h);
    nuevoHueso('campana0','base',0,0,0);
    nuevoHueso('campana1','cadera',0,0,0);
    nuevoHueso('campana2','pecho',0,0,0);
    for (const s of ['I','D']) for (let j = 0; j < F.filasManto; j++) {
      const signo = s === 'I' ? 1 : -1, n = 'manto'+s+j;
      const b = nuevoHueso(n,'pecho',signo*F.mantoX,F.mantoY-j*F.pasoManto,F.mantoZ);
      mantos.push({ b, signo, fila: j });
    }
    for (let i = 0; i < T.conexion.destinos.length; i++) {
      nuevoHueso('conexion'+i,'base',0,0,0);
      conexiones.push({ visible: true, destino: null });
    }
    R.updateMatrixWorld(true); const c = new Piel();
    crearManto(c);
    cristal(c,'cadera',[0,0,0],F.pelvis,'cuerpo');
    cristal(c,'pecho',[0,0,0],F.torso,'cuerpo');
    cristal(c,'pecho',[0,F.pechoY,0],F.cuello,'sombra');
    const cab = new THREE.SphereGeometry(1,D.esfera,D.esferaFilas); cab.scale(...F.cabeza);
    agregar(c,cab,'cabeza','sombra');
    cristal(c,'nucleo',[0,0,0],F.nucleo,'aviso',T.material.blanco);
    trazo(c,'pecho',F.grietaTorso,T.rotura.anchoGrieta,'grieta',T.material.rojo);
    for (const s of ['I','D']) {
      const signo = s === 'I' ? 1 : -1;
      caja(c,'brazo'+s,[0,F.brazoY,0],F.brazo,'placa');
      caja(c,'antebrazo'+s,[0,F.antebrazoY,0],F.antebrazo,'cuerpo');
      cristal(c,'mano'+s,[0,-F.palma[1],0],F.palma,'nacar');
      for (let i = 0; i < F.dedos; i++) caja(c,'mano'+s,[(i-(F.dedos-1)/2)*F.dedoPaso,F.juntaDedos-F.dedoLargo/2,F.dedoZ],
        [F.dedoAncho,F.dedoLargo,F.dedoFondo],'nacar',signo*F.mascarillaGiro);
      caja(c,'mano'+s,[signo*F.pulgarX,F.pulgarY,F.dedoZ],F.pulgar,'oro',-signo*F.mascarillaGiro);
      caja(c,'muslo'+s,[0,F.musloY,0],F.muslo,'cuerpo');
      caja(c,'pierna'+s,[0,F.piernaY,0],F.pierna,'placa');
      cristal(c,'pie'+s,[0,F.pieY,F.pieZ],F.pie,'oro');
      caja(c,'cabeza',[signo*F.ojoX,F.ojoY,F.ojoZ],F.ojo,'grieta',-signo*F.mascarillaGiro,T.material.rojo);
      halo('mano'+s,'aviso',F.manoHalo,0,[0,-F.palma[1],0]);
    }
    placaLunar(c,'disco',T.disco,D.disco,D.anchoDisco);
    // Solo dos hombreras. Conservar los otros huesos mantiene hueso(nombre) compatible.
    for (const m of mantos) if (m.fila === 0) placaLunar(c,m.b.name,T.mantos,D.arco,D.ancho);
    crearMascara(c);
    // Sin jaula de anillos: la etapa 1 conserva el halo y las cuatro conexiones.
    for (let i = 0; i < conexiones.length; i++) {
      const g = new THREE.CylinderGeometry(T.conexion.radio,T.conexion.radio,1,D.cilindro); g.translate(0,.5,0);
      agregar(c,g,'conexion'+i,'aviso',T.material.oro,T.material.blanco);
    }
    mat = Hikari.material(T.material.borde,uBrillo,{ borde:T.material.borde, relleno:T.material.relleno,
      exponente:T.material.exponente, color:T.material.colorBorde });
    mat.name = 'Luna_Roja_material_Hikari'; mat.side = THREE.DoubleSide; mat.metalness = T.material.metal;
    malla = new THREE.SkinnedMesh(c.geo(),mat); malla.name = 'Luna_Roja_cuerpo';
    // El rig se conserva en el grupo; bindMatrix e inversas están en su reposo local.
    R.add(malla); malla.bind(new THREE.Skeleton(lista)); malla.frustumCulled = false;
    malla.castShadow = true; malla.receiveShadow = true;
    halo('nucleo','aviso',F.nucleoHalo,T.anim.haloNucleo);
    halo('velo','oro',F.veloHalo,T.anim.haloVelo,[0,T.velo.centro,0]);
    for (let i = 0; i < lista.length; i++) {
      const b = lista[i]; desde.push(b.quaternion.clone());
      if (T.rig.some(h => h[0] === b.name) && !['velo','disco','base'].includes(b.name)) animados.push(i);
    }
    R.scale.setScalar(T.altura/T.alturaBase); scene.add(R);
    const roturaInicial = rotura, objetivoInicial = roturaObjetivo;
    etapa(numeroEtapa); aplicarMascara(roturaInicial); roturaObjetivo = objetivoInicial;
    aplicarPose(); apoyar(0); actualizarConexiones(); return R;
  }
  function mostrar(v) { crear(); R.visible = !!v; if (v) { R.updateMatrixWorld(true); actualizarConexiones(); } }
  function colocar(x,y,z,giro) {
    crear(); R.position.set(x,y,z); if (giro !== undefined) R.rotation.y = giro;
    R.updateMatrixWorld(true); actualizarConexiones();
  }
  // Cada llamada reinicia la pose. vel multiplica sus tiempos, incluidos aviso y recuperación.
  // Los ataques terminan en reposo; extraer, aturdida y caer sostienen su postura final.
  function pose(nombre,vel = 1) {
    if (!Object.prototype.hasOwnProperty.call(T.poses,nombre)) return false;
    crear(); nombrePose = nombre; relojPose = 0;
    velocidad = Number.isFinite(vel) ? clamp(vel,T.anim.velocidadMin,T.anim.velocidadMax) : 1;
    for (let i = 0; i < lista.length; i++) desde[i].copy(lista[i].quaternion);
    desdeBajar = bajar; return true;
  }
  function etapa(n) {
    if (![1,2,3].includes(n)) return numeroEtapa;
    numeroEtapa = n;
    if (malla) {
      B.velo.scale.setScalar(n === 1 ? 1 : 0);
      if (n !== 3) mascara(0);
      roturaObjetivo = n === 3 ? 1 : 0;
      actualizarConexiones();
    } else { if (n !== 3) rotura = 0; roturaObjetivo = n === 3 ? 1 : 0; }
    return numeroEtapa;
  }
  function mascara(k) {
    if (!Number.isFinite(k)) return rotura;
    roturaObjetivo = clamp(k,0,1); return aplicarMascara(roturaObjetivo);
  }
  function aplicarMascara(k) {
    rotura = k; if (!malla) return rotura;
    R.updateMatrixWorld(true);
    for (let i = 0; i < fragmentos.length; i++) {
      const b = fragmentos[i], a = (sectoresMascara[i]+sectoresMascara[i+1])/2;
      const caida = smooth(T.rotura.empiezaCaida,1,rotura);
      b.position.set(Math.cos(a)*T.rotura.separa*rotura,Math.sin(a)*T.rotura.separa*rotura,F.rojoZ*rotura);
      b.rotation.set(0,0,0); b.scale.setScalar(1);
      if (i === 0) { // Media máscara grande: cae hasta el suelo y permanece visible.
        v.copy(b.position); B.cabeza.localToWorld(v); R.worldToLocal(v);
        v.x += T.rotura.desplaza*caida; v.y = lerp(v.y,.04,caida); v.z += .8*caida;
        R.localToWorld(v); B.cabeza.worldToLocal(v); b.position.copy(v);
        B.cabeza.getWorldQuaternion(qa); R.getWorldQuaternion(qb);
        qc.setFromEuler(e.set(-1.05*caida,0,-T.rotura.giro*caida));
        qb.premultiply(qa.invert()).multiply(qc); b.quaternion.slerp(qb,caida);
      } else {
        // Los restos se abren hacia los laterales: ojos y grietas quedan expuestos.
        b.position.x -= .20*caida; b.position.z -= .15*caida;
        b.rotation.y = -.8*caida; b.scale.setScalar(1-.45*caida);
      }
    }
    const a = malla.geometry.attributes.aMat;
    for (const rango of grietas) for (let i = rango.inicio/2; i < rango.fin/2; i++) a.setY(i,T.material.rojo*(1+rotura*.5));
    a.needsUpdate = true; R.updateMatrixWorld(true); return rotura;
  }
  // Copias en coordenadas del mundo, en orden I frontal, D frontal, I posterior, D posterior.
  // Un destino explícito de conexion() queda fijo en mundo; los predeterminados siguen la figura.
  function anclajes() {
    crear(); R.updateMatrixWorld(true);
    return T.conexion.destinos.map((p,i) => conexiones[i].destino ? conexiones[i].destino.clone() : R.localToWorld(new THREE.Vector3(...p)));
  }
  function conexion(i,visible,punto) {
    crear(); if (!Number.isInteger(i) || !conexiones[i]) return false;
    const c = conexiones[i]; c.visible = !!visible;
    if (punto !== undefined) c.destino = punto === null ? null : new THREE.Vector3(punto.x,punto.y,punto.z);
    R.updateMatrixWorld(true); actualizarConexiones(); return true;
  }
  function actualizarConexiones() {
    for (let i = 0; i < conexiones.length; i++) {
      const b = B['conexion'+i], c = conexiones[i];
      if (!c.visible || numeroEtapa !== 1) { b.scale.setScalar(0); continue; }
      v.fromArray(T.conexion.origenes[i]); B.pecho.localToWorld(v); R.worldToLocal(v);
      if (c.destino) { w.copy(c.destino); R.worldToLocal(w); } else w.fromArray(T.conexion.destinos[i]);
      b.position.copy(v); w.sub(v); const largo = w.length();
      b.quaternion.setFromUnitVectors(eje,w.multiplyScalar(1/Math.max(largo,T.conexion.minimo)));
      b.scale.set(1,largo,1);
    }
    R.updateMatrixWorld(true);
  }
  function giroPostura(out,P,n) { const r = P[n]; return r ? out.setFromEuler(e.set(r[0],r[1],r[2])) : out.identity(); }
  function aplicarPose() {
    const P = T.poses[nombrePose], reposo = T.poses.reposo.postura, t = relojPose;
    // El torso anuncia el ataque; los brazos cargan en los últimos 0,5 s del aviso.
    // Se conservan los tiempos de impacto que consulta el director del combate.
    let a = reposo, b = P.postura || P.prepara;
    let u = smooth(0,P.dur || Math.min(P.aviso,T.anim.anticipa),t), inicio = true;
    if (P.aviso && t > P.aviso) {
      inicio = false;
      if (t < P.aviso+P.golpe) { a=P.prepara; b=P.impacto; u=smooth(0,P.golpe,t-P.aviso); }
      else if (t < P.aviso+P.golpe+P.recupera) {
        a=P.impacto; b=P.descansa; u=smooth(0,T.anim.mezcla,t-P.aviso-P.golpe);
      } else { a=P.descansa; b=reposo; u=smooth(0,T.anim.mezcla,t-P.aviso-P.golpe-P.recupera); }
    }
    for (const i of animados) {
      const n = lista[i].name;
      giroPostura(qb,b[n] ? b : reposo,n);
      if (inicio) qa.copy(desde[i]); else giroPostura(qa,a[n] ? a : reposo,n);
      const carga = inicio && P.aviso && /^(brazo|antebrazo|mano)/.test(n)
        ? smooth(Math.max(0,P.aviso-T.anim.anticipa),P.aviso,t) : u;
      lista[i].quaternion.copy(qa).slerp(qb,carga);
    }
    bajar = lerp(inicio ? desdeBajar : (a.bajar || 0),b.bajar || 0,u);
    B.cadera.position.y = T.rig[1][3]-bajar;
    B.campana1.position.y = bajar*.55;
    const peso = nombrePose === 'caer' ? 1-smooth(0,P.dur,t) : 1;
    B.pecho.quaternion.multiply(qc.setFromEuler(e.set(Math.sin(tiempo*T.anim.respirarFrec)*T.anim.respirar*peso,0,0)));
    for (const m of mantos) {
      m.b.rotation.set(0,m.signo*(Math.sin(tiempo*T.anim.mantoFrec+m.fila)*T.anim.manto),
        m.signo*(m.fila*T.mantos.giroFilas+Math.sin(tiempo*T.anim.mantoFrec+m.fila)*T.anim.manto));
      m.b.scale.set(m.signo*T.mantos.escalaFilas**m.fila,T.mantos.escalaFilas**m.fila,1);
    }
    // El disco se mantiene tras el rostro sin girar como un aro suelto.
    B.disco.rotation.z = Math.sin(tiempo*T.anim.discoVel)*.08;
    B.nucleo.rotation.z = F.nucleoGiro;
    const aviso = P.aviso && t < P.aviso ? Math.sin(Math.PI*t/P.aviso) : nombrePose === 'extraer' ? 1 : 0;
    halos[0].opacidad = (nombrePose === 'extraer' ? aviso : 0)*T.anim.haloMano;
    halos[1].opacidad = aviso*T.anim.haloMano;
    halos[2].opacidad = T.anim.haloNucleo*(1+Math.sin(tiempo*T.anim.pulsoFrec)*T.anim.pulso);
    R.updateMatrixWorld(true);
  }
  function apoyar(pesoMano) {
    if (nombrePose !== 'caer') for (const s of ['I','D']) {
      v.set((s === 'I' ? 1 : -1)*T.rig[12][2],T.apoyos.pieY,T.apoyos.pieZ); R.localToWorld(v);
      ikDosHuesos(B['muslo'+s],B['pierna'+s],v,polo,F.muslo[1],F.pierna[1],qSup,qInf);
      B['muslo'+s].quaternion.copy(qSup); B['pierna'+s].quaternion.copy(qInf);
      B['pierna'+s].getWorldQuaternion(qc); R.getWorldQuaternion(qb);
      B['pie'+s].quaternion.copy(qc.invert().multiply(qb));
    }
    if (pesoMano > 0) {
      v.fromArray(nombrePose === 'golpe' ? T.apoyos.manoGolpe : T.apoyos.manoBarrido); R.localToWorld(v);
      ikDosHuesos(B.brazoD,B.antebrazoD,v,polo,F.brazo[1],F.antebrazo[1],qSup,qInf);
      B.brazoD.quaternion.slerp(qSup,pesoMano); B.antebrazoD.quaternion.slerp(qInf,pesoMano);
      if (nombrePose === 'golpe') {
        B.antebrazoD.getWorldQuaternion(qc); R.getWorldQuaternion(qb);
        qMano.setFromEuler(e.set(T.apoyos.palmaGolpe,0,0));
        B.manoD.quaternion.slerp(qc.invert().multiply(qb).multiply(qMano),pesoMano);
      }
    }
    R.updateMatrixWorld(true);
  }
  function actualizar(dt) {
    if (!malla || !R.visible || !Number.isFinite(dt) || dt <= 0) return;
    // No hay temporizadores externos: dt=0 conserva también la anticipación al pausar.
    tiempo += dt; relojPose += dt*velocidad;
    if (rotura !== roturaObjetivo) aplicarMascara(rotura + Math.sign(roturaObjetivo-rotura)*Math.min(Math.abs(roturaObjetivo-rotura),dt/T.rotura.duracion));
    aplicarPose();
    const P = T.poses[nombrePose];
    const pesoMano = P.aviso ? smooth(P.aviso,P.aviso+P.golpe,relojPose)*
      (1-smooth(P.aviso+P.golpe+P.recupera,P.aviso+P.golpe+P.recupera+T.anim.mezcla,relojPose)) : 0;
    apoyar(pesoMano);
    // Actualizar también al sostener la rotura: el fragmento caído sigue en el suelo.
    if (rotura > 0) aplicarMascara(rotura);
    actualizarConexiones();
  }
  function muestras() {
    crear();
    // Geometría y número de huesos idénticos: cubre color, aMat, skinning y sombras.
    // Rig independiente para que compilar la muestra no mueva la figura ni sus halos.
    const g = new THREE.Group(), s = new THREE.SkinnedMesh(malla.geometry,mat), huesos = lista.map(() => new THREE.Bone());
    s.add(...huesos); s.bind(new THREE.Skeleton(huesos)); s.castShadow = s.receiveShadow = true;
    s.frustumCulled = false; g.add(s); g.name = 'Luna_Roja_muestras'; g.visible = false; return g;
  }
  return { crear, mostrar, colocar, actualizar, pose, etapa, mascara, anclajes, conexion, hueso, muestras,
    get root() { return R; } };
})();
