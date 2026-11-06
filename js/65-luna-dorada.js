/* === Ecos de Luz · 65-luna-dorada.js ===
   La cautiva y su liberación. Frente +Z; izquierda anatómica +X; unidades en metros.
   Contraste de la Roja: rostro descubierto, disco entero y tela curva con pesos suaves.
   Solo arte y actuación: no modifica misiones, red, luz del mundo ni guardados.
   Integración: crear() durante la carga; añadir muestras() a la escena de compilación.
   mostrar(v), colocar(x,y,z,giro=actual), actualizar(dt en segundos).
   cadenas(k): fija cautiverio 0..1 y cancela la liberación; sin argumento lo consulta.
   liberar(t): progreso ABSOLUTO 0..1, dirigido por la escena; sin argumento lo consulta.
   Repetir, saltar o retroceder t es seguro. actualizar() no avanza ese progreso.
   Estado inicial: cautiva, oculta. El conejo pertenece a la figura, junto al suelo.
   muestras() comparte recursos: retirar su grupo sin liberar geometrías ni materiales. */
"use strict";

const LUNA_DORADA = {
  altura: 4.5, alturaBase: 4.5,
  color: { blanco: 0xfff1cd, luz: 0xffe1a0, tela: 0xd8cbae, rostro: 0xfff5df,
    rasgo: 0xbda46c, conejo: 0xf5f4ea, ojoConejo: 0xd5ad4f,
    cadena: 0x474250, enlace: 0xa6334b },
  material: { borde: .18, relleno: .12, exponente: 3, metal: .08, rugo: .72,
    rostro: .55, oro: .46, emision: 1, apagada: .06, cuerpo: .16, tela: .22,
    disco: .7, conejo: .24, rasgo: .035, enlace: .08, rotura: 1.2,
    opacidadTela: .94, colorBorde: [.92, .72, .40] }, // RGB lineal.
  detalle: { esfera: 20, esferaFilas: 12, pequena: 12, pequenaFilas: 8,
    conejo: 10, conejoFilas: 6, trazo: 10, trazoLados: 4,
    falda: 48, faldaFilas: 20, banda: 10, bandaFilas: 24,
    disco: 48, discoFilas: 12, aro: 80, aroLados: 6,
    eslabon: 12, eslabonLados: 4 },
  rig: [ ['base', null, 0, 0, 0], ['cadera', 'base', 0, 1.9, 0],
    ['pecho', 'cadera', 0, .98, 0], ['cabeza', 'pecho', 0, 1.25, .015],
    ['disco', 'cabeza', 0, 0, -.48],
    ['brazoI', 'pecho', .63, .43, 0], ['codoI', 'brazoI', 0, -.65, 0],
    ['manoI', 'codoI', 0, -.61, 0], ['brazoD', 'pecho', -.63, .43, 0],
    ['codoD', 'brazoD', 0, -.65, 0], ['manoD', 'codoD', 0, -.61, 0],
    ['conejo', 'base', .82, .025, .92] ],
  forma: {
    pelvis: [.48,.45,.34], torso: [.59,.67,.38], cuello: [.18,.28,.18],
    cuelloY: .78, cabeza: [.32,.37,.29], brazo: [.16,.38,.16],
    antebrazo: [.135,.35,.14], palma: [.14,.22,.105],
    brazoY: -.32, codoY: -.30, palmaY: -.16,
    pulgar: [.07,.12,.07], pulgarX: -.115, pulgarY: -.13, pulgarZ: .035,
    pie: [.18,.10,.30], pieX: .27, pieY: .11, pieZ: .18,
    nariz: [.036,.065,.045], narizY: -.025, narizZ: .284,
    ojo: [[.055,.065,.284],[.13,.043,.272],[.20,.065,.235]],
    boca: [[-.075,-.125,.264],[0,-.143,.268],[.075,-.125,.264]],
    trazo: .012, bocaRadio: .009
  },
  tela: {
    pliegue: .035, pliegues: 8, bajoOnda: .025,
    // Semiancho, altura, fondo. La curva forma una túnica continua, sin placas.
    perfil: [[1.02,.12,.64],[1.04,.38,.65],[.86,1.18,.53],
      [.57,2.05,.37],[.54,2.66,.35],[.65,3.18,.40],[.54,3.40,.32]],
    niveles: [.12,1.20,2.30,3.40],
    // Centro del manto lateral: distancia al eje, altura y profundidad.
    banda: [[.64,3.32,-.12],[.98,2.42,-.30],[1.12,1.36,-.36],[1.06,.22,-.20]],
    anchos: [.27,.47,.55,.29], curva: .18, pliegueBanda: .025, plieguesBanda: 3,
    bordeDesde: .82, bordeLuz: .32
  },
  disco: { radio: .98, fondo: .055, aroRadio: .94, aroGrosor: .035,
    perlas: 6, perlaRadio: .026, perlaOrbita: .84, perlaZ: .065,
    halo: 2.65, haloOp: .15 },
  conejo: { cuerpo: [.13,.115,.18], cuerpoY: .14,
    cabeza: [.085,.085,.09], cabezaY: .26, cabezaZ: .13,
    oreja: [.025,.095,.025], orejaX: .035, orejaY: .39, orejaZ: .115,
    orejaGiro: .12, cola: [.065,.065,.065], colaY: .15, colaZ: -.18,
    pata: [.055,.035,.085], pataX: .075, pataY: .035, pataZ: .10,
    ojo: [.012,.014,.012], ojoX: .037, ojoY: .28, ojoZ: .209,
    halo: .64, haloOp: .095, flotar: .012, frecuencia: 1.3 },
  cadena: { cantidad: 12, radio: .078, tubo: .019, ovalX: .8, ovalY: 1.45,
    // Anclajes relativos a root: colocar() lleva también los extremos de la red.
    ramales: [
      { hueso: 'manoI', origen: [0,.015,-.035], destino: [3.1,3.8,-1.5] },
      { hueso: 'manoD', origen: [0,.015,-.035], destino: [-3.1,3.8,-1.5] },
      { hueso: 'cadera', origen: [.43,.18,-.23], destino: [2.5,.36,-2.7] },
      { hueso: 'cadera', origen: [-.43,.18,-.23], destino: [-2.5,.36,-2.7] }
    ],
    minimo: .001, alternar: Math.PI/2, luzCada: 3, luzResto: 1,
    pasoOval: 2, soltarDesde: .035, soltarHasta: .43, desfase: .018,
    deshacer: .24, destello: .26, vuelo: .48, subir: .62, abrir: .42,
    giro: 1.3, halo: .31, haloOp: .38, pulsoInicio: .13
  },
  anim: { respirar: .009, respirarFrec: 1.15, manto: .035, mantoFrec: .85,
    mantoFase: .7, falda: .018, faldaFase: .8, discoVel: .055,
    pulso: .035, pulsoFrec: 1.8, abrirTela: .12,
    luzDesde: .12, luzHasta: .88, erguirDesde: .18, erguirHasta: .88,
    discoDesde: .38, discoHasta: 1, haloRostro: .055, tamRostro: .65,
    caderaCautiva: .13, pechoCautivo: .24, cabezaCautiva: .16,
    brazoLibre: .16, brazoCautivo: .40, codoLibre: -.24, codoCautivo: -.08,
    manoLibre: -.18, manoCautiva: .06, amplitudCautiva: .2 }
};

const LunaDorada = (() => {
  const T = LUNA_DORADA, F = T.forma, D = T.detalle, R = new THREE.Group();
  R.name = 'Luna_Dorada'; R.visible = false;
  const B = {}, indices = {}, lista = [], faldones = [], mantos = [], eslabones = [];
  const colores = {}, uBrillo = { value: T.material.apagada };
  for (const n in T.color) colores[n] = lin(T.color[n]);
  const v = new THREE.Vector3(), w = new THREE.Vector3(), direccion = new THREE.Vector3();
  const eje = new THREE.Vector3(0,1,0);
  const giro = new THREE.Quaternion(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let malla, tela, mat, matTela, haloDisco, haloRostro, haloConejo;
  let tiempo = 0, cautiverio = 1, progreso = 0, enLiberacion = false;

  function nuevoHueso(n, padre, x, y, z) {
    const b = new THREE.Bone(); b.name = n; b.position.set(x,y,z);
    indices[n] = lista.length; lista.push(b); B[n] = b;
    (padre ? B[padre] : R).add(b); return b;
  }
  function agregar(c,g,n,color,rugo = T.material.rugo,emision = T.material.cuerpo) {
    g.applyMatrix4(B[n].matrixWorld);
    const p = g.attributes.position, base = c.p.length/3;
    for (let i = 0; i < p.count; i++) c.vert(p.getX(i),p.getY(i),p.getZ(i),
      colores[color],rugo,emision,[indices[n],1]);
    if (g.index) for (const j of g.index.array) c.i.push(base+j);
    else for (let i = 0; i < p.count; i++) c.i.push(base+i);
    g.dispose();
  }
  function elipsoide(c,n,xyz,tam,color,emision = T.material.cuerpo,pequeno = true,rotZ = 0) {
    const g = new THREE.SphereGeometry(1,pequeno ? D.pequena : D.esfera,
      pequeno ? D.pequenaFilas : D.esferaFilas);
    g.scale(...tam); g.rotateZ(rotZ); g.translate(...xyz);
    agregar(c,g,n,color,T.material.rugo,emision);
  }
  function trazo(c,puntos,radio) {
    const curva = new THREE.CatmullRomCurve3(puntos.map(p => new THREE.Vector3(...p)));
    agregar(c,new THREE.TubeGeometry(curva,D.trazo,radio,D.trazoLados,false),
      'cabeza','rasgo',T.material.rostro,T.material.rasgo);
  }
  function halo(padre,color,tam,xyz) {
    // Halo recibe también color lineal; no convertir otra vez en el lote.
    const h = new Halo(colores[color],0); h.scale.set(tam,tam,1);
    if (xyz) h.position.fromArray(xyz); padre.add(h); return h;
  }
  function crearCuerpo(c) {
    elipsoide(c,'cadera',[0,0,0],F.pelvis,'blanco',T.material.cuerpo,false);
    elipsoide(c,'pecho',[0,0,0],F.torso,'blanco',T.material.cuerpo,false);
    elipsoide(c,'pecho',[0,F.cuelloY,0],F.cuello,'rostro');
    elipsoide(c,'cabeza',[0,0,0],F.cabeza,'rostro',T.material.cuerpo,false);
    elipsoide(c,'cabeza',[0,F.narizY,F.narizZ],F.nariz,'rostro');
    // Los rasgos siguen el volumen de la cara. No hay cubierta ni borde de máscara.
    for (const signo of [-1,1]) trazo(c,F.ojo.map(([x,y,z]) => [signo*x,y,z]),F.trazo);
    trazo(c,F.boca,F.bocaRadio);
    for (const s of ['I','D']) {
      const signo = s === 'I' ? 1 : -1;
      elipsoide(c,'brazo'+s,[0,F.brazoY,0],F.brazo,'blanco');
      elipsoide(c,'codo'+s,[0,F.codoY,0],F.antebrazo,'blanco');
      elipsoide(c,'mano'+s,[0,F.palmaY,0],F.palma,'rostro');
      elipsoide(c,'mano'+s,[signo*F.pulgarX,F.pulgarY,F.pulgarZ],F.pulgar,'rostro');
      elipsoide(c,'base',[signo*F.pieX,F.pieY,F.pieZ],F.pie,'blanco');
    }
  }
  function crearDisco(c) {
    const K = T.disco;
    const g = new THREE.SphereGeometry(1,D.disco,D.discoFilas);
    g.scale(K.radio,K.radio,K.fondo);
    agregar(c,g,'disco','blanco',T.material.oro,T.material.disco);
    agregar(c,new THREE.TorusGeometry(K.aroRadio,K.aroGrosor,D.aroLados,D.aro),
      'disco','luz',T.material.oro,T.material.disco);
    // Seis relieves redondos permiten leer el giro lento de un disco completo.
    for (let i = 0; i < K.perlas; i++) {
      const a = i/K.perlas*Math.PI*2;
      const g = new THREE.SphereGeometry(K.perlaRadio,D.conejo,D.conejoFilas);
      g.translate(Math.cos(a)*K.perlaOrbita,Math.sin(a)*K.perlaOrbita,K.perlaZ);
      agregar(c,g,'disco','luz',T.material.oro,T.material.disco);
    }
  }
  function crearConejo(c) {
    const K = T.conejo;
    const pieza = (xyz,tam,color = 'conejo',rotZ = 0) => {
      const g = new THREE.SphereGeometry(1,D.conejo,D.conejoFilas);
      g.scale(...tam); g.rotateZ(rotZ); g.translate(...xyz);
      agregar(c,g,'conejo',color,T.material.rugo,T.material.conejo);
    };
    pieza([0,K.cuerpoY,0],K.cuerpo); pieza([0,K.cabezaY,K.cabezaZ],K.cabeza);
    pieza([0,K.colaY,K.colaZ],K.cola);
    for (const signo of [-1,1]) {
      pieza([signo*K.orejaX,K.orejaY,K.orejaZ],K.oreja,'conejo',-signo*K.orejaGiro);
      pieza([signo*K.pataX,K.pataY,K.pataZ],K.pata);
      pieza([signo*K.ojoX,K.ojoY,K.ojoZ],K.ojo,'ojoConejo');
    }
  }
  function pesosAltura(y) {
    const niveles = T.tela.niveles;
    let j = 0;
    while (j < niveles.length-2 && y > niveles[j+1]) j++;
    const u = clamp((y-niveles[j])/(niveles[j+1]-niveles[j]),0,1);
    return [indices['falda'+j],1-u,indices['falda'+(j+1)],u];
  }
  function crearTela(c) {
    const K = T.tela, perfil = new THREE.CatmullRomCurve3(K.perfil.map(p => new THREE.Vector3(...p)));
    for (let j = 0; j <= D.faldaFilas; j++) {
      const p = perfil.getPoint(j/D.faldaFilas);
      for (let i = 0; i <= D.falda; i++) {
        const a = i/D.falda*Math.PI*2, onda = 1+K.pliegue*Math.cos(a*K.pliegues);
        const y = p.y + K.bajoOnda*Math.sin(a*K.pliegues)*(1-j/D.faldaFilas);
        c.vert(Math.cos(a)*p.x*onda,y,Math.sin(a)*p.z*onda,colores.blanco,
          T.material.rugo,T.material.tela,pesosAltura(y));
      }
    }
    for (let j = 0; j < D.faldaFilas; j++) for (let i = 0; i < D.falda; i++) {
      const a = j*(D.falda+1)+i, b = a+D.falda+1;
      c.i.push(a,b,a+1,a+1,b,b+1);
    }
    const curva = new THREE.CatmullRomCurve3(K.banda.map(p => new THREE.Vector3(...p)));
    for (const signo of [-1,1]) {
      const base = c.p.length/3, lado = signo === 1 ? 'I' : 'D';
      for (let j = 0; j <= D.bandaFilas; j++) {
        const u = j/D.bandaFilas, p = curva.getPoint(u), fila = u*(K.banda.length-1);
        const k = Math.min(Math.floor(fila),K.banda.length-2), f = fila-k;
        const ancho = lerp(K.anchos[k],K.anchos[k+1],f);
        for (let i = 0; i <= D.banda; i++) {
          const a = i/D.banda*2-1, borde = Math.abs(a) > K.bordeDesde;
          c.vert(signo*(p.x+a*ancho),p.y,
            p.z+K.curva*a*a+K.pliegueBanda*Math.cos(a*Math.PI*K.plieguesBanda),
            colores[borde ? 'luz' : 'tela'],T.material.rugo,
            borde ? K.bordeLuz : T.material.tela,
            [indices['manto'+lado+k],1-f,indices['manto'+lado+(k+1)],f]);
        }
      }
      for (let j = 0; j < D.bandaFilas; j++) for (let i = 0; i < D.banda; i++) {
        const a = base+j*(D.banda+1)+i, b = a+D.banda+1;
        if (signo === 1) c.i.push(a,a+1,b,a+1,b+1,b);
        else c.i.push(a,b,a+1,a+1,b,b+1);
      }
    }
  }
  function crearCadenas(c) {
    const K = T.cadena;
    for (let r = 0; r < K.ramales.length; r++) for (let j = 0; j < K.cantidad; j++) {
      const b = B['cadena'+r+'_'+j], color = j%K.luzCada === K.luzResto ? 'enlace' : 'cadena';
      const g = new THREE.TorusGeometry(K.radio,K.tubo,D.eslabonLados,D.eslabon);
      g.scale(K.ovalX,K.ovalY,1);
      const inicio = c.p.length/3;
      agregar(c,g,b.name,color,T.material.rugo,color === 'enlace' ? T.material.enlace : 0);
      eslabones.push({ b, r, j, color, inicio, fin: c.p.length/3,
        halo: halo(B.base,'luz',K.halo), mezcla: -1 });
    }
  }
  function crear() {
    if (malla) return R;
    for (const h of T.rig) nuevoHueso(...h);
    T.tela.niveles.forEach((y,i) => {
      const padre = i === 0 ? 'base' : 'cadera', origen = i === 0 ? 0 : T.rig[1][3];
      const b = nuevoHueso('falda'+i,padre,0,y-origen,0);
      faldones.push({ b, y: b.position.y, i });
    });
    for (const signo of [-1,1]) T.tela.banda.forEach(([x,y,z],i) => {
      const b = nuevoHueso('manto'+(signo === 1 ? 'I' : 'D')+i,'pecho',signo*x,
        y-T.rig[1][3]-T.rig[2][3],z);
      mantos.push({ b, x: b.position.x, z, signo, i });
    });
    for (let r = 0; r < T.cadena.ramales.length; r++) for (let j = 0; j < T.cadena.cantidad; j++)
      nuevoHueso('cadena'+r+'_'+j,'base',0,0,0);
    R.updateMatrixWorld(true);
    const c = new Piel(), ct = new Piel();
    crearCuerpo(c); crearDisco(c); crearConejo(c); crearCadenas(c); crearTela(ct);
    const perfil = { borde:T.material.borde, relleno:T.material.relleno,
      exponente:T.material.exponente, color:T.material.colorBorde };
    mat = Hikari.material(T.material.borde,uBrillo,perfil);
    mat.name = 'Luna_Dorada_material_Hikari'; mat.metalness = T.material.metal;
    mat.side = THREE.DoubleSide;
    matTela = Hikari.material(T.material.borde,uBrillo,perfil);
    matTela.name = 'Luna_Dorada_tela_Hikari'; matTela.side = THREE.DoubleSide;
    matTela.metalness = T.material.metal; matTela.transparent = true;
    matTela.opacity = T.material.opacidadTela; matTela.depthWrite = false;
    malla = new THREE.SkinnedMesh(c.geo(),mat); malla.name = 'Luna_Dorada_cuerpo';
    tela = new THREE.SkinnedMesh(ct.geo(),matTela); tela.name = 'Luna_Dorada_tela';
    const esqueleto = new THREE.Skeleton(lista);
    R.add(malla,tela); malla.bind(esqueleto); tela.bind(esqueleto);
    for (const m of [malla,tela]) {
      m.frustumCulled = false; m.castShadow = m.receiveShadow = true;
    }
    haloDisco = halo(B.disco,'luz',T.disco.halo);
    haloRostro = halo(B.cabeza,'blanco',T.anim.tamRostro,[0,0,F.narizZ]);
    haloConejo = halo(B.conejo,'luz',T.conejo.halo,[0,T.conejo.cuerpoY,0]);
    R.scale.setScalar(T.altura/T.alturaBase); scene.add(R);
    aplicar(); return R;
  }
  function mostrar(v) { crear(); R.visible = !!v; }
  function colocar(x,y,z,giro) {
    crear(); R.position.set(x,y,z); if (giro !== undefined) R.rotation.y = giro;
    R.updateMatrixWorld(true);
  }
  function cadenas(k) {
    if (!Number.isFinite(k)) return cautiverio;
    cautiverio = clamp(k,0,1); progreso = 1-cautiverio; enLiberacion = false;
    if (malla) aplicar(); return cautiverio;
  }
  function liberar(t) {
    if (!Number.isFinite(t)) return progreso;
    progreso = clamp(t,0,1); enLiberacion = true;
    cautiverio = 1-smooth(T.anim.erguirDesde,T.anim.erguirHasta,progreso);
    if (malla) aplicar(); return progreso;
  }
  function pintarEslabon(s,mezcla) {
    if (s.mezcla === mezcla) return;
    s.mezcla = mezcla;
    const a = malla.geometry.attributes, origen = colores[s.color], luz = colores.luz;
    const emision = lerp(s.color === 'enlace' ? T.material.enlace : 0,T.material.rotura,mezcla);
    for (let i = s.inicio; i < s.fin; i++) {
      a.color.setXYZ(i,lerp(origen.r,luz.r,mezcla),lerp(origen.g,luz.g,mezcla),lerp(origen.b,luz.b,mezcla));
      a.aMat.setY(i,emision);
    }
    a.color.needsUpdate = a.aMat.needsUpdate = true;
  }
  function actualizarCadenas() {
    const K = T.cadena;
    for (let r = 0; r < K.ramales.length; r++) {
      const ramal = K.ramales[r];
      v.fromArray(ramal.origen); B[ramal.hueso].localToWorld(v); R.worldToLocal(v);
      w.fromArray(ramal.destino).sub(v);
      const paso = w.length()/(K.cantidad-1);
      giro.setFromUnitVectors(eje,direccion.copy(w).normalize());
      for (let j = 0; j < K.cantidad; j++) {
        const s = eslabones[r*K.cantidad+j], u = j/(K.cantidad-1);
        const inicio = lerp(K.soltarDesde,K.soltarHasta,u)+r*K.desfase;
        const rotura = enLiberacion ? smooth(inicio,inicio+K.deshacer,progreso) : 0;
        const destello = enLiberacion ? smooth(inicio,inicio+K.pulsoInicio,progreso)*
          (1-smooth(inicio+K.deshacer,inicio+K.deshacer+K.destello,progreso)) : 0;
        s.b.position.copy(v).addScaledVector(w,u);
        s.b.position.x += Math.sign(ramal.destino[0])*K.abrir*rotura;
        s.b.position.y += K.subir*rotura;
        s.b.position.z += K.vuelo*rotura;
        s.b.quaternion.copy(giro).multiply(q.setFromEuler(e.set(rotura*K.giro,j%2*K.alternar,0)));
        const presencia = enLiberacion ? 1-rotura : cautiverio;
        // Se mantienen enlazados aunque cambie la distancia a la muñeca al inclinarse.
        s.b.scale.set(presencia,presencia*paso/Math.max(K.radio*K.ovalY*K.pasoOval,K.minimo),presencia);
        // El halo no hereda la escala que se deshace: las motas quedan en la red.
        s.halo.position.copy(s.b.position); s.halo.opacidad = destello*K.haloOp;
        pintarEslabon(s,Math.max(destello,rotura));
      }
    }
  }
  function aplicar() {
    const A = T.anim, libre = 1-cautiverio;
    const luz = enLiberacion ? smooth(A.luzDesde,A.luzHasta,progreso) : libre;
    const disco = enLiberacion ? smooth(A.discoDesde,A.discoHasta,progreso) : libre;
    const amplitud = lerp(A.amplitudCautiva,1,libre);
    const pulso = 1+Math.sin(tiempo*A.pulsoFrec)*A.pulso*libre;
    uBrillo.value = lerp(T.material.apagada,T.material.emision,luz)*pulso;
    B.cadera.rotation.x = A.caderaCautiva*cautiverio;
    B.pecho.rotation.x = A.pechoCautivo*cautiverio+Math.sin(tiempo*A.respirarFrec)*A.respirar*amplitud;
    B.cabeza.rotation.x = A.cabezaCautiva*cautiverio;
    B.disco.rotation.z = tiempo*A.discoVel*amplitud;
    for (const lado of ['I','D']) {
      const signo = lado === 'I' ? 1 : -1;
      B['brazo'+lado].rotation.z = signo*lerp(A.brazoLibre,A.brazoCautivo,cautiverio);
      B['codo'+lado].rotation.x = lerp(A.codoLibre,A.codoCautivo,cautiverio);
      B['mano'+lado].rotation.z = signo*lerp(A.manoLibre,A.manoCautiva,cautiverio);
    }
    for (const f of faldones) {
      const onda = Math.sin(tiempo*A.mantoFrec-f.i*A.faldaFase)*A.falda*amplitud;
      f.b.rotation.set(onda,0,onda);
    }
    for (const m of mantos) {
      const onda = Math.sin(tiempo*A.mantoFrec-m.i*A.mantoFase)*A.manto*amplitud;
      m.b.position.x = m.x+m.signo*A.abrirTela*libre*m.i;
      m.b.position.z = m.z+onda*m.i;
      m.b.rotation.set(onda,0,m.signo*onda);
    }
    B.conejo.position.y = T.rig[T.rig.length-1][3]+
      (1+Math.sin(tiempo*T.conejo.frecuencia))*T.conejo.flotar;
    haloDisco.opacidad = T.disco.haloOp*disco*pulso;
    haloRostro.opacidad = A.haloRostro*luz;
    haloConejo.opacidad = T.conejo.haloOp*luz;
    R.updateMatrixWorld(true); actualizarCadenas(); R.updateMatrixWorld(true);
  }
  function actualizar(dt) {
    if (!malla || !R.visible || !Number.isFinite(dt) || dt <= 0) return;
    tiempo += dt; aplicar();
  }
  function muestras() {
    crear();
    // Copia independiente del rig; conserva ambas variantes Hikari y sus sombras.
    const g = new THREE.Group(), huesos = lista.map(b => {
      const h = new THREE.Bone(); h.name = b.name; h.position.copy(b.position);
      h.quaternion.copy(b.quaternion); h.scale.copy(b.scale); return h;
    });
    lista.forEach((b,i) => (b.parent && b.parent.isBone ? huesos[indices[b.parent.name]] : g).add(huesos[i]));
    const esqueleto = new THREE.Skeleton(huesos,malla.skeleton.boneInverses.map(m => m.clone()));
    for (const original of [malla,tela]) {
      const s = new THREE.SkinnedMesh(original.geometry,original.material);
      g.add(s); s.bind(esqueleto,original.bindMatrix); s.frustumCulled = false;
      s.castShadow = original.castShadow; s.receiveShadow = original.receiveShadow;
    }
    g.name = 'Luna_Dorada_muestras'; g.visible = false; return g;
  }
  return { crear, mostrar, colocar, actualizar, liberar, cadenas, muestras,
    get root() { return R; } };
})();
