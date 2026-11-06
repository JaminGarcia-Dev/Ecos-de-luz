/* === Ecos de Luz · 36-tasogare.js ===
   Tasogare, el Guardián del Ocaso (rediseño de la historia, fase 18): el último guardián del faro, que partió el cristal
   para salvar a Akari. Espejo de Hikari: lleva su misma máscara, pero negra y partida en diagonal, con un ojo rojo que
   brilla por la grieta. Mide 2,4 m (Hikari, 1,15): se le ve siempre desde abajo. Kimono negro hasta el suelo con el
   bajo en jirones, capucha con punta (como la de Hikari), placa de pecho y hombreras de láminas, una capa larga que suelta brasas y se abre como alas oscuras cuando habla
   (rima con las alas de luz de Hikari) y la Hoja del Ocaso, la mitad rota de su katana (la otra mitad es la Katana del
   Alba). Este módulo da el modelo y su animación por poses para las cinemáticas y, más adelante, el duelo final.
   Fase 26: geometría y rig separados en 48-tasogare-modelo.js, ojo izquierdo rojo (+X), arma independiente,
   mangas y faldones articulados, y capa física con un patrón fijo de roturas. El shader amplía el de Hikari
   con emisiones separadas y se precompila al arrancar. GLB y fuente Blender en modelos/tasogare. */
"use strict";

/* proporciones (m), colores y animación. poses: giro (x, y, z en rad) de cada hueso; bajar: cuánto baja la cadera */
const TASOGARE = {
  alto: 2.4, color: { negro: 0x141216, carbon: 0x2b272d, laca: 0x1e0f12, hierro: 0x3a3842, cordon: 0x8a1a14, mascara: 0xb8b0a4, oro: 0x6a5328, ojo: 0xff3a24, grieta: 0xff4a28, pelo: 0x3c383c, hoja: 0x1a181e },
  capa: { cols: TASOGARE_DISENO.capa.cols, filas: TASOGARE_DISENO.capa.filas, largo: TASOGARE_DISENO.capa.largo, ancho: [TASOGARE_DISENO.capa.arriba,TASOGARE_DISENO.capa.abajo], viento: .6, frec: 1.6, brasas: 7, alasAncho: .75, alasAlto: .4 },
  giro: 6, giroCorte: 14, respirar: .035, marcha: { zancada: 1.15, alza: .15, apoyo: .58, respuesta: 7 },
  poses: {
    reposo: { brazoI: [.05, 0, .10], antebrazoI: [-.2, 0, 0], brazoD: [-.12, 0, -.10], antebrazoD: [-.25, 0, 0], manoD: [.3, 0, 0], pecho: [.04, 0, 0], cabeza: [.06, 0, 0] },
    guardia: { brazoD: [-1.2, -.3, .25], antebrazoD: [-.5, 0, 0], manoD: [-.2, 0, 0], brazoI: [-.5, .2, -.25], antebrazoI: [-.8, 0, 0], pecho: [.1, -.25, 0], musloI: [-.3, 0, 0], piernaI: [.25, 0, 0], musloD: [.2, 0, 0] },
    alzar: { brazoD: [-2.9, 0, .25], antebrazoD: [-.25, 0, 0], manoD: [-.4, 0, 0], brazoI: [-2.7, 0, -.35], antebrazoI: [-.6, 0, 0], pecho: [-.15, 0, 0], cabeza: [-.25, 0, 0] },
    corte: { brazoD: [-.7, .5, -.35], antebrazoD: [-.15, 0, 0], manoD: [.2, 0, 0], brazoI: [-.6, -.4, .2], antebrazoI: [-.3, 0, 0], pecho: [.35, .45, 0], columna: [.15, .2, 0], musloD: [-.4, 0, 0], piernaD: [.5, 0, 0], musloI: [.25, 0, 0] },
    empuñar: { brazoD: [-.35, -.1, .15], antebrazoD: [-.85, 0, 0], manoD: [.75, 0, 0], brazoI: [.05, 0, -.12], antebrazoI: [-.2, 0, 0], pecho: [.06, 0, 0], cabeza: [.12, 0, 0] },
    mirarAtras: { brazoI: [.05, 0, -.12], antebrazoI: [-.2, 0, 0], brazoD: [-.12, 0, .1], antebrazoD: [-.25, 0, 0], manoD: [.3, 0, 0], cuello: [0, -.35, 0], cabeza: [.05, -.75, 0], pecho: [.04, -.15, 0] },
    hablar: { brazoI: [-1.1, 0, -.75], antebrazoI: [-.25, 0, 0], manoI: [0, 0, .3], brazoD: [-.12, 0, .1], antebrazoD: [-.25, 0, 0], manoD: [.3, 0, 0], cabeza: [-.12, 0, 0], pecho: [-.06, 0, 0] },
    rodillas: { musloI: [-1.5, 0, -.1], piernaI: [1.55, 0, 0], musloD: [.1, 0, .1], piernaD: [1.9, 0, 0], pieD: [-.8, 0, 0], columna: [.25, 0, 0], pecho: [.3, 0, 0], cabeza: [.45, 0, 0], brazoD: [-.9, 0, .15], antebrazoD: [-.2, 0, 0], brazoI: [-.3, 0, -.3], antebrazoI: [-1.0, 0, 0], bajar: .55 },
    // sentado sobre los talones (seiza), con las manos en los muslos y la hoja cruzada sobre las rodillas; base: pose de la que parte
    sentado: { musloI: [-1.25, 0, -.08], piernaI: [2.75, 0, 0], pieI: [1.5, 0, 0], musloD: [-1.25, 0, .08], piernaD: [2.75, 0, 0], pieD: [1.5, 0, 0], columna: [.08, 0, 0], pecho: [.1, 0, 0], cabeza: [.2, 0, 0],
      brazoI: [-.45, 0, -.12], antebrazoI: [-.85, 0, 0], manoI: [.2, 0, 0], brazoD: [-.45, 0, .12], antebrazoD: [-.85, 0, 0], manoD: [-.3, 0, 0], bajar: .87 },
    sentadoMira: { base: 'sentado', columna: [.08, -.2, 0], pecho: [.1, -.35, 0], cuello: [.05, -.45, 0], cabeza: [0, -.85, 0] }
  }
};
// una pose con 'base' parte de otra y cambia solo algunos huesos
TASOGARE.poses.recibir={base:'guardia',columna:[-.15,0,.08],pecho:[-.22,.12,.12],cabeza:[.2,0,-.1],brazoI:[-.7,0,.15]};
TASOGARE.poses.entregar={base:'rodillas',pecho:[.12,0,0],cabeza:[.28,0,0],brazoI:[-1.15,0,.2],antebrazoI:[-.7,0,0],manoI:[-.25,0,-.2]};
for (const n in TASOGARE.poses) { const P = TASOGARE.poses[n]; if (P.base) { TASOGARE.poses[n] = Object.assign({}, TASOGARE.poses[P.base], P); delete TASOGARE.poses[n].base; } }

const Tasogare = (() => {
  const T = TASOGARE, V = (x, y, z) => new THREE.Vector3(x, y, z);
  /* esqueleto en reposo (de pie, brazos colgando, mirando a +z): [nombre, padre, x, y, z] */
  const HUESOS = ModeloTasogare.rig();
  const H = {}; HUESOS.forEach((h, i) => H[h[0]] = i);
  const R = new THREE.Group(), B = [], uBrillo = { value: 1 };
  let brillo = 1;   // 1 normal; hacia 0 se apaga como una brasa (el final)
  let malla = null, capa = null, ojo = null, poseAct = 'reposo', rapidez = T.giro, alas = 0, alasObj = 0, andar = 0, fase = 0, t = 0, bajar = 0;
  const qObj = {};
  let mezcla = null, andarObj = 0, pesoIK = 0;
  const pies = [-1, 1].map(lado => ({ lado, pos: V(0, 0, 0), desde: V(0, 0, 0), hacia: V(0, 0, 0), aire: false, listo: false }));
  const qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), qSup = new THREE.Quaternion(), qInf = new THREE.Quaternion(), polo = V(0, 0, 1), ideal = V(0, 0, 0);
  const canales = { ojo:1, filo:1, brasa:1, brasas:1, oscuridad:0 }, uCanales={value:new THREE.Vector3(1,1,1)}, uSombra={value:0};
  let arma = null;
  function material() {
    const m=Hikari.material(ASPECTO_PERSONAJES.ocaso.borde,uBrillo,ASPECTO_PERSONAJES.ocaso),compilar=m.onBeforeCompile;
    m.name='Tasogare_material';m.side=THREE.DoubleSide;m.map=ModeloTasogare.atlas();
    m.onBeforeCompile=sh=>{
      compilar(sh);sh.uniforms.uTasCanales=uCanales;sh.uniforms.uTasSombra=uSombra;
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aCanal; varying float vCanal;').replace('vMat = aMat;','vMat = aMat; vCanal = aCanal;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uTasCanales; uniform float uTasSombra; varying float vCanal;')
        .replace('vMat.y*uBrillo','vMat.y*uBrillo*(vCanal < .5 ? 1. : vCanal < 1.5 ? uTasCanales.x : vCanal < 2.5 ? uTasCanales.y : uTasCanales.z)')
        .replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb *= mix(1., .3, uTasSombra);');
    };
    m.customProgramCacheKey=()=> 'tasogare-canales';return m;
  }

  /* ---------- modelo ---------- */
  function malla_() { return ModeloTasogare.crear(H); }

  /* ---------- capa: tela larga que suelta brasas; se abre en alas al hablar ---------- */
  function crearCapa() {
    const K = T.capa;
    capa = new Tela(K.cols, K.filas, K.largo, K.ancho[0], K.ancho[1], ModeloTasogare.colorCapa,
      { emissive: 0x2a0604, emissiveIntensity: .2, roughness: .95, map:ModeloTasogare.atlas() });
    for(let i=0;i<K.cols;i++)capa.altos[i]=(K.largo-TASOGARE_DISENO.capa.dientes[i])/(K.filas-1);
    ModeloTasogare.rasgarCapa(capa.geo);capa.mesh.name='Capa_desgarrada';
    capa.mesh.castShadow = true; scene.add(capa.mesh);
  }
  const _a = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
  function anclas() {   // fila de arriba: entre los hombros, por detrás; con alas, se abre hacia los lados y arriba
    const K = T.capa, pecho = B[H.pecho], out = [];
    for (let i = 0; i < K.cols; i++) {
      const u = i / (K.cols - 1) * 2 - 1;
      _a.set(u * (TASOGARE_DISENO.capa.arriba*.5 + K.alasAncho * alas), .29 + K.alasAlto * alas * Math.abs(u), -.30 - .12 * alas + .06 * u * u); pecho.localToWorld(_a); out.push(_a.clone());
    }
    return out;
  }
  /* la tela no atraviesa el cuerpo: cilindro elíptico alrededor del tronco */
  function cuerpo(p, k) {
    const dx = p[k] - R.position.x, dz = p[k + 2] - R.position.z, y = p[k + 1] - R.position.y, c = Math.cos(-R.rotation.y), s = Math.sin(-R.rotation.y);
    if (y < .5 || y > 2.05) return;
    const lx = dx * c + dz * s, lz = -dx * s + dz * c, e = Math.hypot(lx / .52, lz / .4);
    if (e < 1) { const f = 1 / Math.max(e, 1e-3), nx = lx * f, nz = lz * f; p[k] = R.position.x + nx * c - nz * s; p[k + 2] = R.position.z + nx * s + nz * c; }
  }

  /* la otra mitad de la hoja (la que será la Katana del Alba): unida a la mano hasta que se rompe */
  let punta = null;
  function crearPunta() {
    const C = T.color, g = fusionar([pieza(new THREE.BoxGeometry(.012, .55, .05), C.hoja, { y: -1.215, z: .05 }), pieza(new THREE.BoxGeometry(.014, .52, .006), 0xd8e0e8, { y: -1.2, z: .077 }), pieza(new THREE.ConeGeometry(.026, .1, 4), C.hoja, { y: -1.54, z: .05, rx: Math.PI, sz: .4 })]);
    punta = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: .3, metalness: .4 })); punta.castShadow = true; punta.visible = false;
    B[H.manoD].add(punta);
  }
  // Compatibilidad narrativa: prepara el fragmento, pero nunca rellena la fractura del arma normal.
  function hojaEntera(v) { punta.visible = false; if (v && punta.parent !== B[H.manoD]) { if(punta.parent)punta.parent.remove(punta); B[H.manoD].add(punta); punta.position.set(0, 0, 0); punta.quaternion.identity(); } }
  /* la hoja se parte: la punta se suelta en el mundo (con su posición y giro) y la devuelve para que la animen */
  function romperHoja() { R.updateMatrixWorld(true); punta.updateMatrixWorld(true); const m = punta.matrixWorld.clone(); punta.parent.remove(punta); scene.add(punta); m.decompose(punta.position, punta.quaternion, punta.scale); punta.visible=true; return punta; }
  function crear() {
    const geo = malla_();
    for (const h of HUESOS) { const b = new THREE.Bone(); b.name = h[0]; b.position.set(h[2], h[3], h[4]); B.push(b); }
    HUESOS.forEach((h, i) => { if (h[1] >= 0) B[h[1]].add(B[i]); });
    malla = new THREE.SkinnedMesh(geo, material()); malla.name='Tasogare_cuerpo';R.name='Tasogare';malla.add(B[0]); malla.bind(new THREE.Skeleton(B));
    malla.castShadow = true; malla.receiveShadow = true; malla.frustumCulled = false; R.add(malla);
    ojo = new Halo(T.color.ojo, .55); ojo.scale.set(.13, .13, 1); ojo.position.fromArray(TASOGARE_DISENO.ojoIzquierdo);ojo.position.applyMatrix4(malla.skeleton.boneInverses[H.cabeza]); B[H.cabeza].add(ojo);
    const materialArma=material();materialArma.skinning=false;
    arma=new THREE.Mesh(ModeloTasogare.espada(),materialArma);arma.name='Hoja_del_Ocaso';arma.rotation.z=-.22;arma.castShadow=true;B[H.manoD].add(arma);
    const ancla=new THREE.Object3D();ancla.name='Ancla_espada';B[H.manoD].add(ancla);
    const emisor=new THREE.Object3D();emisor.name='Emisor_brasas';emisor.position.set(0,.2,-.3);B[H.pecho].add(emisor);
    crearPunta(); crearCapa(); R.visible = false; capa.mesh.visible = false; scene.add(R);
    for (const b of HUESOS) qObj[b[0]] = new THREE.Quaternion();
    return R;
  }

  /* ---------- control (cinemáticas y, más adelante, el duelo) ---------- */
  function mostrar(v) { R.visible = !!v; capa.mesh.visible = !!v; if (v) capa.listo = false; }
  /* llevarlo a (x, y, z) mirando a yaw; la capa solo se recoloca si salta lejos (al andar o girar sigue su vuelo) */
  function colocar(x, y, z, yaw) { const lejos = Math.hypot(x - R.position.x, y - R.position.y, z - R.position.z) > 1; R.position.set(x, y, z); if (yaw !== undefined) R.rotation.y = yaw; R.updateMatrixWorld(true); if (lejos) { capa.listo = false; pies.forEach(p => p.listo = false); } }
  /* cambia de pose a la velocidad vel (o la de T); ya: sin transición (al empezar un plano) */
  function pose(nombre, vel, ya) {
    const P = T.poses[nombre]; if (!P) return; mezcla = null; poseAct = nombre; rapidez = vel || (nombre === 'corte' ? T.giroCorte : T.giro);
    if (ya) { for (const h of HUESOS) { const r = P[h[0]] || [0, 0, 0]; B[H[h[0]]].quaternion.setFromEuler(_e.set(r[0], r[1], r[2])); } bajar = P.bajar || 0; B[H.cadera].position.y = HUESOS[0][3] - bajar; capa.listo = false; }
  }
  function abrirAlas(v) { alasObj = clamp(Number(v), 0, 1); }
  function caminar(v) { andarObj = Math.max(0, v); }
  function mezclar(a, b, u) { if (!T.poses[a] || !T.poses[b]) return; mezcla = { a, b, u: clamp(u, 0, 1) }; rapidez = T.giroCorte; }
  function apoyarPies(dt) {
    pesoIK = damp(pesoIK, !mezcla && ['reposo', 'guardia', 'hablar', 'mirarAtras'].includes(poseAct) ? 1 : 0, 9, dt);
    if (pesoIK < .01) { pies.forEach(p => p.listo = false); return; }
    R.updateMatrixWorld(true);
    pies.forEach((pie, i) => {
      const s = i ? 'I' : 'D', p = (fase / TAU + i * .5) % 1, volar = andar > .08 && p >= T.marcha.apoyo;
      ideal.set(pie.lado * .17, .08, 0); R.localToWorld(ideal);
      if (!pie.listo || pie.pos.distanceTo(ideal) > 1.2) { pie.pos.copy(ideal); pie.aire = false; pie.listo = true; }
      if (volar) {
        if (!pie.aire) { pie.desde.copy(pie.pos); pie.aire = true; }
        const u = (p - T.marcha.apoyo) / (1 - T.marcha.apoyo), k = smooth(0, 1, u);
        pie.hacia.copy(ideal); pie.hacia.x += Math.sin(R.rotation.y) * andar * .12; pie.hacia.z += Math.cos(R.rotation.y) * andar * .12;
        pie.hacia.y = sueloEnJ(pie.hacia.x, R.position.y + 1.3, pie.hacia.z) + .08;
        pie.pos.lerpVectors(pie.desde, pie.hacia, k); pie.pos.y += Math.sin(u * Math.PI) * T.marcha.alza;
      } else {
        if (pie.aire) { pie.pos.copy(pie.hacia); pie.aire = false; }
        if (andar < .08) pie.pos.lerp(ideal, 1 - Math.exp(-5 * dt));
        pie.pos.y = sueloEnJ(pie.pos.x, R.position.y + 1.3, pie.pos.z) + .08;
      }
      ikDosHuesos(B[H['muslo' + s]], B[H['pierna' + s]], pie.pos, polo, .55, .55, qSup, qInf);
      B[H['muslo' + s]].quaternion.slerp(qSup, pesoIK); B[H['pierna' + s]].quaternion.slerp(qInf, pesoIK);
      B[H['pierna' + s]].getWorldQuaternion(qA); qA.invert().multiply(R.quaternion); B[H['pie' + s]].quaternion.slerp(qA, pesoIK);
    });
  }

  function actualizar(dt) {
    if (!R.visible) return;
    t += dt; const P = T.poses[poseAct], k = 1 - Math.exp(-rapidez * dt);
    andar = damp(andar, andarObj, T.marcha.respuesta, dt);
    alas = damp(alas, alasObj, 3, dt); bajar = damp(bajar, P.bajar || 0, 5, dt); fase = (fase + dt * andar * Math.PI / T.marcha.zancada) % TAU;
    for (const h of HUESOS) {
      const n = h[0], r = P[n] || [0, 0, 0]; let rx = r[0], rz = r[2];
      if (andar > .05) {   // al andar: piernas y brazos alternos
        const s = Math.sin(fase) * Math.min(1, andar);
        if (n === 'musloI') rx += -s * .45; if (n === 'musloD') rx += s * .45;
        if (n === 'piernaI') rx += Math.max(0, s) * .6; if (n === 'piernaD') rx += Math.max(0, -s) * .6;
        if (n === 'brazoI') rx += s * .25;
      }
      if (n === 'pecho') rx += Math.sin(t * 1.3) * T.respirar;
      _e.set(rx, r[1], rz); qObj[n].setFromEuler(_e);
      if (mezcla) { const a = T.poses[mezcla.a][n] || [0, 0, 0], b = T.poses[mezcla.b][n] || [0, 0, 0]; qA.setFromEuler(_e.set(...a)); qB.setFromEuler(_e.set(...b)); qObj[n].copy(qA).slerp(qB, mezcla.u); }
      if (mezcla) B[H[n]].quaternion.copy(qObj[n]); else B[H[n]].quaternion.slerp(qObj[n], k);
    }
    B[H.cadera].position.y = HUESOS[0][3] - bajar + (andar > .05 ? Math.abs(Math.sin(fase)) * .04 : 0);
    apoyarPies(dt);
    // Mangas y faldones: oscilación limitada y despliegue al arrodillarse, con longitudes de hueso constantes.
    for(const s of ['I','D']){
      B[H['manga'+s]].rotation.x=.045*Math.sin(t*1.7+(s==='I'?0:1))-.08*alas;
      B[H['mangaPunta'+s]].rotation.x=.065*Math.sin(t*1.7-1);
      for(const atras of [false,true]){
        const n=s+(atras?'T':'F'),f=B[H['faldon'+n]],fp=B[H['faldonPunta'+n]],sentar=smooth(.25,.8,bajar);
        f.rotation.x=lerp(B[H['muslo'+s]].rotation.x*.6+(atras?.035:-.025)*Math.sin(t*1.1),atras?1.32:-1.32,sentar);
        fp.rotation.x=lerp(-B[H['pierna'+s]].rotation.x*.1,atras?-.10:.10,sentar);
      }
    }
    ojo.opacidad = (.45 + .12 * Math.sin(t * 3.1)) * brillo * canales.ojo; uBrillo.value = brillo;
    uCanales.value.set(canales.ojo,canales.filo,canales.brasa);uSombra.value=canales.oscuridad;
    capa.mesh.material.emissiveIntensity=.2*brillo*canales.brasa;
    R.updateMatrixWorld(true);
    // capa
    const K = T.capa, dts = Math.min(dt, .033);
    capa.aB=damp(capa.aB,lerp(TASOGARE_DISENO.capa.abajo,TASOGARE_DISENO.capa.vuelo,alas),4,dt);
    capa.anclar(anclas()); capa.paso(dts, Math.sin(t * .7) * .6, alas > .3 ? -3 : -8, -Math.cos(R.rotation.y) * 1.2, K.viento + alas * 1.4, cuerpo, K.frec);
    // brasas que se desprenden del borde de la capa
    if (Math.random() < dt * K.brasas * canales.brasas * brillo) { const p = capa.p, i = ((K.filas - 1) * K.cols + Math.floor(Math.random() * K.cols)) * 3; FX.emit(p[i], p[i + 1], p[i + 2], rnd(-.2, .2), rnd(.3, .9), rnd(-.2, .2), 1.6, .14, 0xff5a2a, .7); }
  }
  function efectos(v){if(v)for(const k in canales)if(v[k]!==undefined)canales[k]=clamp(v[k],0,k==='oscuridad'?1:3);return {...canales};}
  function reiniciar(){t=fase=alas=alasObj=andar=andarObj=bajar=pesoIK=0;mezcla=null;pies.forEach(p=>p.listo=false);poseAct='reposo';rapidez=T.giro;HUESOS.forEach((h,i)=>{B[i].position.set(h[2],h[3],h[4]);B[i].quaternion.identity();});capa.listo=false;}
  return { crear, hojaEntera, romperHoja, mostrar, colocar, pose, mezclar, abrirAlas, caminar, actualizar, efectos, reiniciar, brillo: k => { brillo = k; }, root: R, get visible() { return R.visible; }, get capa() { return capa; }, hueso: n => B[H[n]],
    get modelo(){return {malla,huesos:B,definicion:HUESOS,arma,punta};} };
})();
