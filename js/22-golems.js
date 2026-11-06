/* === Ecos de Luz · 22-golems.js ===
   Arte de los gólems guardianes (la lógica está en 11-jefes.js y los ataques en 23-ataques-golem.js):
   · Material de piedra, arenisca, hielo, agua o madera con las capas de 15-texturas.js proyectadas en
     el espacio del objeto, relieve, y vetas de corrupción que laten (violeta) y se calman al purificarlo.
   · Cuerpo articulado de bloques: pelvis, tronco, cabeza, brazos (hombro, codo, puño) y piernas con IK
     de dos huesos y pisadas que se apoyan en el suelo de la arena.
   · Animación con peso (anticipación lenta, golpe rápido, seguimiento y recuperación), reacciones a los
     golpes, tambaleo, aturdimiento de rodillas y reposo.
   · Efectos: impactos según el material, pisadas, aviso de parada, despertar y purificación.
   Arte sustituible: cada pieza se construye en su propia función. */
"use strict";

/* aspecto de cada material: capas de Texturas (null = sin textura), escala, relieve, rugosidad máxima,
   transparencia, brillo de borde, abollado de los bloques, caras planas, color de las astillas y luz
   (multiplica el color de la ficha para compensar lo oscura que es cada textura). agua: la superficie fluye hacia abajo
   (flujo, m/s) y deja ver el cielo refractado y teñido (refracta: cuánto) en vez de parecer pompas transparentes */
const ASPECTO_GOLEM = {
  roca: { capa: 'roca', capa2: 'musgo', cub: .85, esc: .7, relieve: .05, rugo: 1, transp: 0, fresnel: 0, abo: .17, facetas: false, astillas: 0x8a8478, luz: 2.3 },
  arenisca: { capa: 'arenisca', capa2: 'arena', cub: .55, esc: .55, relieve: .05, rugo: 1, transp: 0, fresnel: 0, abo: .13, facetas: false, astillas: 0xc9a77a, luz: 1.1 },
  cristal: { capa: 'nieve', capa2: null, cub: 0, esc: 1.2, relieve: .02, rugo: .14, transp: .86, fresnel: 1.4, abo: .06, facetas: true, astillas: 0xdff4ff, luz: 1.3 },
  agua: { capa: null, capa2: null, cub: 0, esc: 1, relieve: .1, rugo: .05, transp: .8, fresnel: 1.6, abo: .035, facetas: false, astillas: 0x9ff4e0, luz: 1.2, agua: { refracta: .85, flujo: 1.3 } },
  madera: { capa: 'corteza', capa2: 'musgo', cub: .3, esc: 1.5, relieve: .05, rugo: .95, transp: 0, fresnel: 0, abo: .09, facetas: false, astillas: 0xc48a5a, luz: 2.8 }
};
/* tiempos y fuerzas de la animación */
const ANIM_GOLEM = { paso: { dur: .5, alto: .09, umbral: .16, sube: .3, cadera: .35, maxBaja: .25, maxSube: .15, inclina: .4 }, giro: { combate: 3 }, reaccion: { dur: .45, fuerza: .3 }, calma: 2.5, venas: { corrupto: 2.2, calmo: .7 },
  presencia: { dur: .5, pulso: .28, borde: .9, junta: .13, destello: .65, frio: 0x8fb9dc, tinte: .13, halo: .19 } };

const Golems = (() => {
  const V = () => new THREE.Vector3(), _v = V(), _w = V(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler(), _s = V(), _m = new THREE.Matrix4();
  const A_ = ANIM_GOLEM;

  /* ---------- material (un solo programa para todos los gólems) ---------- */
  const GLSL_G = `
uniform float uCapa, uCapa2, uCub, uEsc, uRelieve, uRugo, uFresnel, uRunaI, uFlash, uVena, uTg;
uniform vec3 uTinte, uRuna;
varying vec3 vPO; varying vec3 vNO;
float hgG(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7)))*43758.5453); }
float vnG(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3. - 2.*f);
  return mix(mix(mix(hgG(i), hgG(i + vec3(1., 0., 0.)), f.x), mix(hgG(i + vec3(0., 1., 0.)), hgG(i + vec3(1., 1., 0.)), f.x), f.y),
             mix(mix(hgG(i + vec3(0., 0., 1.)), hgG(i + vec3(1., 0., 1.)), f.x), mix(hgG(i + vec3(0., 1., 1.)), hgG(i + vec3(1., 1., 1.)), f.x), f.y), f.z); }
vec3 relieveG(vec3 sp, vec3 n, float h, float k){
  vec3 dx = dFdx(sp), dy = dFdy(sp); float hx = dFdx(h)*k, hy = dFdy(h)*k;
  vec3 r1 = cross(dy, n), r2 = cross(n, dx); float det = dot(dx, r1);
  return normalize(abs(det)*n - sign(det)*(hx*r1 + hy*r2));
}`;
  /* compartidas: uniformes de otro material de gólem (el cuerpo con esqueleto y sus piezas sueltas cambian a la vez) */
  function material(asp, tinte, compartidas) {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, transparent: asp.transp > 0, opacity: asp.transp || 1 });
    const C = Texturas.CAPA, u = compartidas || {
      uCapa: { value: asp.capa ? C[asp.capa] : -1 }, uCapa2: { value: asp.capa2 ? C[asp.capa2] : -1 }, uCub: { value: asp.cub }, uEsc: { value: asp.esc }, uRelieve: { value: asp.relieve },
      uRugo: { value: asp.rugo }, uFresnel: { value: asp.fresnel }, uRunaI: { value: A_.venas.corrupto }, uFlash: { value: 0 }, uVena: { value: 1.6 }, uTg: { value: 0 },
      uTinte: { value: new THREE.Color().copy(tinte) }, uRuna: { value: new THREE.Color(.75, .22, 1.3) },
      uAgua: { value: asp.agua ? asp.agua.refracta : 0 }, uFlujo: { value: asp.agua ? asp.agua.flujo : 0 }
    };
    m.onBeforeCompile = sh => {
      Atmosfera.inyectar(sh); Texturas.usar(sh); Object.assign(sh.uniforms, u); sh.uniforms.uT = U.uT;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vPO; varying vec3 vNO;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvPO = position; vNO = normal;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + Texturas.GLSL + GLSL_G + '\nuniform float uT, uAgua, uFlujo;')
        .replace('#include <map_fragment>', `
vec3 Ng = normalize(vNO), twg = triPesos(Ng);
vec2 gx = vPO.zy*uEsc, gy = vPO.xz*uEsc, gz = vPO.xy*uEsc;
vec4 Ag = vec4(1., 1., 1., uRugo); float hG = .5;
if (uCapa > -.5) { vec4 bxG, byG, bzG; triplanar(gx, gy, gz, twg, uCapa, Ag, bxG, byG, bzG); hG = bxG.z*twg.x + byG.z*twg.y + bzG.z*twg.z; }
if (uCapa2 > -.5) { float cb = smoothstep(.35, .75, Ng.y + (vnG(vPO*2.3) - .5)*.7)*uCub; Ag = mix(Ag, sueloA(gy*1.3, uCapa2), cb); hG = mix(hG, sueloB(gy*1.3, uCapa2).z, cb); }
// agua: ondas que bajan por el cuerpo (relieve animado)
if (uAgua > 0.) hG = vnG(vPO*2.2 + vec3(0., uT*uFlujo, 0.))*.6 + vnG(vPO*5.1 + vec3(1.7, uT*uFlujo*1.8, 0.))*.4;
diffuseColor.rgb *= Ag.rgb*uTinte;
float rugG = min(Ag.a, uRugo);
float vg = abs(vnG(vPO*uVena) - .5)*2., venaG = (1. - smoothstep(.0, .1, vg))*smoothstep(.25, .65, vnG(vPO*uVena*.4 + 7.));`)
        .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = rugG;')
        .replace('#include <normal_fragment_maps>', 'normal = relieveG(-vViewPosition, normal, hG, uRelieve);')
        .replace('#include <emissivemap_fragment>', `float frG = pow(1. - abs(dot(normal, normalize(vViewPosition))), 3.);
totalEmissiveRadiance += uRuna*venaG*uRunaI*(.7 + .3*sin(uT*2.2 + vPO.y*2.5)) + vec3(uFlash) + uTinte*frG*uFresnel*.35;
#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
// agua: el cielo visto a través del cuerpo (refractado con el índice del agua) y teñido por su color
if (uAgua > 0.) { vec3 iW = inverseTransformDirection(normalize(-vViewPosition), viewMatrix), nW = inverseTransformDirection(normal, viewMatrix);
  totalEmissiveRadiance += textureCubeUV(envMap, refract(iW, nW, 1./1.33), .3).rgb*envMapIntensity*mix(vec3(1.), uTinte, .65)*uAgua*(1. - frG); }
#endif`);
    };
    m.customProgramCacheKey = () => 'golem'; m.userData.u = u;
    return m;
  }

  /* ---------- constructor de bloques (cantera) ---------- */
  class Cantera {
    constructor(asp) { this.asp = asp; this.p = []; this.c = []; this.i = []; this.n = 0; }
    /* bloque abollado de radios (rx, ry, rz) en (x, y, z) girado rot; o: det, abo, facetas, oscuro (tono) */
    bloque(x, y, z, rx, ry, rz, rot, o) {
      o = o || {}; const a = this.asp, fac = o.facetas !== undefined ? o.facetas : a.facetas;
      const g = fac ? new THREE.IcosahedronGeometry(1, o.det !== undefined ? o.det : 1) : icoSuave(1, o.det !== undefined ? o.det : 2);
      const ab = o.abo !== undefined ? o.abo : a.abo; if (ab > 0) abollar(g, ab, 1.6, 3 + this.n * 7.3);
      _e.set(rot ? rot[0] : 0, rot ? rot[1] : 0, rot ? rot[2] : 0); _m.compose(_v.set(x, y, z), _q.setFromEuler(_e), _s.set(rx, ry, rz)); g.applyMatrix4(_m);
      const p = g.attributes.position, base = this.p.length / 3, k = (o.tono || 1) * (.92 + .16 * ((this.n * 37 % 11) / 11)); this.n++;
      for (let i = 0; i < p.count; i++) { const py = p.getY(i), f = k * (.72 + .28 * smooth(y - ry, y + ry * .6, py)); this.p.push(p.getX(i), py, p.getZ(i)); this.c.push(f, f, f); }
      if (g.index) for (const j of g.index.array) this.i.push(base + j); else for (let j = 0; j < p.count; j++) this.i.push(base + j);
      g.dispose(); return this;
    }
    geometria() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3)); g.setIndex(this.i);
      g.computeVertexNormals(); g.computeBoundingSphere(); return g;
    }
    malla(mat) {
      const m = new THREE.Mesh(this.geometria(), mat); m.castShadow = true; m.receiveShadow = true; return m;
    }
  }
  /* cristal facetado: cada cara con su tono (se lee la forma aunque el material no reciba luz) */
  function cristal(r) {
    const g = new THREE.OctahedronGeometry(r, 1), p = g.attributes.position, c = [], L = new THREE.Vector3(.35, .75, .55).normalize(), a = V(), b = V(), d = V();
    for (let i = 0; i < p.count; i += 3) { a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); d.fromBufferAttribute(p, i + 2); const n = b.sub(a).cross(d.sub(a)).normalize(), k = .45 + .55 * Math.max(0, n.dot(L)) + .15 * ((i / 3) % 2); for (let j = 0; j < 3; j++) c.push(k, k, k); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); return g;
  }
  // las articulaciones son huesos: el cuerpo es una sola malla con esqueleto y cada bloque va entero con su hueso
  const grupo = (padre, x, y, z) => { const g = new THREE.Bone(); g.position.set(x, y, z); padre.add(g); return g; };
  /* cuerpo: une los bloques de cada hueso en una malla con esqueleto (antes, una malla por pieza: unas 15 llamadas
     de dibujo por gólem, el doble con su sombra) */
  function cuerpo(root, piezas, mat) {
    root.updateMatrixWorld(true);
    const huesos = []; root.traverse(o => { if (o.isBone) huesos.push(o); });
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), m4 = new THREE.Matrix4(), P = [], N = [], C = [], I = [], SI = [], SW = [];
    for (const { hueso, c } of piezas) {
      const g = c.geometria(); g.applyMatrix4(m4.multiplyMatrices(inv, hueso.matrixWorld));
      const base = P.length / 3, k = huesos.indexOf(hueso), p = g.attributes.position, n = g.attributes.normal, col = g.attributes.color;
      for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); C.push(col.getX(i), col.getY(i), col.getZ(i)); SI.push(k, 0, 0, 0); SW.push(1, 0, 0, 0); }
      for (const j of g.index.array) I.push(base + j); g.dispose();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SI, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(SW, 4)); g.setIndex(I);
    g.computeBoundingSphere(); g.boundingSphere.radius *= 1.5;   // brazos y piernas se salen de la pose de reposo
    const malla = new THREE.SkinnedMesh(g, mat); malla.castShadow = true; malla.receiveShadow = true; root.add(malla);
    malla.bind(new THREE.Skeleton(huesos), root.matrixWorld); return malla;
  }
  const brilla = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), fog: false });
  const halo = (c, s, op) => { const sp = new Halo(c, op); sp.scale.set(s, s, 1); return sp; };

  /* ---------- modelo ---------- */
  function crear(id) {
    const D = JEFES[id], es = D.estilo, asp = ASPECTO_GOLEM[es.aspecto], E = D.alto / .86, del = es.delgado ? .72 : 1, madera = es.aspecto === 'madera';
    const mat = material(asp, lin(es.piel).multiplyScalar(asp.luz)), matSuelto = material(asp, null, mat.userData.u);   // el suelto, para piezas sin esqueleto
    mat.skinning = true;
    const legL = .36 * E, tH = .34 * E, tW = .42 * E * del, tD = .3 * E * del, hS = .14 * E, up = .28 * E, fo = .26 * E, fr = .11 * E * del, shX = tW * .5 + .06 * E, hipX = .12 * E * del;
    const L1 = legL * .48, L2 = legL * .44;
    const M = { id, E, mat, matSuelto, asp, legL, L1, L2, tH, tW, tD, hipX, debiles: [], manos: [], hombros: [], codos: [], caderas: [], rodillas: [], tobillos: [], extras: [], mats: [mat] };
    // colores en lineal: piel corrupta y calmada, venas (corruptas y calmadas), ojos y núcleo
    M.col = { piel: lin(es.piel).multiplyScalar(asp.luz), calma: lin(es.calma).multiplyScalar(asp.luz), vena: new THREE.Color(.75, .22, 1.3), venaCalma: lin(es.ojo).multiplyScalar(1.4), ojoCalma: lin(es.ojo).multiplyScalar(2), ojoIra: lin(0xff3a6a).multiplyScalar(3), ojoDormido: lin(0x3a2a3a), nucExp: lin(0xfff2b0).multiplyScalar(3), nuc: lin(0x9a4ad8).multiplyScalar(1.6) };
    const root = new THREE.Group(), pelvis = grupo(root, 0, legL, 0), torso = grupo(pelvis, 0, .02 * E, 0);
    Object.assign(M, { root, pelvis, torso });
    const piezas = [], pieza = (padre, fn) => { const c = new Cantera(asp); fn(c); piezas.push({ hueso: padre, c }); };
    // pelvis y tronco
    pieza(pelvis, c => c.bloque(0, 0, 0, tW * .44, .07 * E, tD * .44, [0, .3, 0]));
    pieza(torso, c => {
      c.bloque(0, tH * .55, 0, tW * .5, tH * .55, tD * .5, [0, .2, 0]);
      c.bloque(0, tH * .64, tD * .28, tW * .38, tH * .3, tD * .26, [.15, 0, 0], { tono: 1.05 });          // pecho
      c.bloque(0, tH * .78, -tD * .18, tW * .45, tH * .26, tD * .3, [-.2, 0, 0], { tono: .95 });         // espalda alta
      c.bloque(0, tH * .2, .02 * E, tW * .36, tH * .2, tD * .38, null, { tono: .9 });                    // vientre
      if (madera) for (const s of [-1, 1]) c.bloque(s * tW * .3, tH * .5, tD * .2, tW * .1, tH * .45, tD * .12, [0, 0, s * .15], { tono: .85 });
    });
    // cabeza
    if (!es.sinCabeza) {
      const cab = grupo(torso, 0, tH * 1.02, .02 * E); M.cabeza = cab;
      pieza(cab, c => { c.bloque(0, hS * .45, 0, hS * .6, hS * .5, hS * .56); c.bloque(0, hS * .6, hS * .38, hS * .56, hS * .14, hS * .2, [.2, 0, 0], { tono: .9 }); });
      M.ojos = [-1, 1].map(s => { const o = new THREE.Mesh(new THREE.BoxGeometry(hS * .26, hS * .07, hS * .06), brilla(.2, .1, .2)); o.position.set(s * hS * .22, hS * .45, hS * .55); o.rotation.z = -s * .2; cab.add(o); return o; });
    } else M.ojos = [-1, 1].map(s => { const o = new THREE.Mesh(new THREE.BoxGeometry(.06 * E, .02 * E, .02 * E), brilla(.2, .1, .2)); o.position.set(s * tW * .18, tH * .95, tD * .52); torso.add(o); return o; });
    // brazos: hombro → codo → puño
    for (let s = 0; s < 2; s++) {
      const sg = s ? -1 : 1, h = grupo(torso, sg * shX, tH * .88, 0); M.hombros[s] = h;
      pieza(h, c => { c.bloque(sg * .02 * E, .03 * E, 0, .11 * E * del, .09 * E, .11 * E * del, [0, 0, sg * .3], { tono: 1.08 }); c.bloque(0, -up * .5, 0, .085 * E * del, up * .52, .085 * E * del); });
      const co = grupo(h, 0, -up, 0); M.codos[s] = co;
      pieza(co, c => { c.bloque(0, -.01 * E, 0, .075 * E * del, .06 * E, .075 * E * del, null, { tono: .9 }); c.bloque(0, -fo * .5, 0, .08 * E * del, fo * .5, .08 * E * del); });
      const ma = grupo(co, 0, -fo, 0); M.manos[s] = ma;
      pieza(ma, c => { c.bloque(0, -fr * .55, 0, fr * 1.05, fr * .9, fr * 1.05, null, { tono: madera ? .8 : 1 }); for (let k = 0; k < 3; k++) c.bloque((k - 1) * fr * .55, -fr * 1.3, fr * .35, fr * .3, fr * .38, fr * .3, null, { tono: .9, det: 1 }); });
    }
    // piernas (con IK) o columna de agua
    if (!es.sinPiernas) for (let s = 0; s < 2; s++) {
      const sg = s ? -1 : 1, ca = grupo(pelvis, sg * hipX, 0, 0), ro = grupo(ca, 0, -L1, 0), to = grupo(ro, 0, -L2, 0);
      Object.assign(ca.userData, { L: L1 }); M.caderas[s] = ca; M.rodillas[s] = ro; M.tobillos[s] = to;
      pieza(ca, c => c.bloque(0, -L1 * .5, 0, .1 * E * del, L1 * .56, .1 * E * del));
      pieza(ro, c => { c.bloque(0, 0, .015 * E, .08 * E * del, .065 * E, .08 * E * del, null, { tono: 1.08 }); c.bloque(0, -L2 * .5, 0, .09 * E * del, L2 * .55, .09 * E * del); });
      pieza(to, c => { c.bloque(0, -.025 * E, .04 * E, .12 * E * del, .05 * E, .16 * E * del, null, { tono: .9 }); });
    } else {
      const cas = new THREE.Mesh(new THREE.CylinderGeometry(tW * .3, tW * .62, legL * 1.1, 18, 4, true), matSuelto); cas.position.y = -legL * .45; pelvis.add(cas); M.cascada = cas;
      const esp = halo(0xcffff0, tW * 2.2, .35); esp.position.y = -legL * .95; pelvis.add(esp);
    }
    // núcleo: cristal facetado que brilla (violeta corrupto, dorado expuesto)
    const n = new THREE.Mesh(cristal(.085 * E), new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })); n.position.set(0, tH * .58, tD * .5 + .01 * E); n.scale.z = .7; torso.add(n); M.nucleo = n;
    const nh = halo(0xffe9a8, .9 * E, 0); n.add(nh); M.nucleoHalo = nh;
    M.brillo = halo(0xfff6d8, .5 * E, 0); M.brillo.visible = false; root.add(M.brillo);
    M.cuerpo = cuerpo(root, piezas, mat);
    puntosDebiles(id, M, matSuelto, { E, tH, tW, tD, up, fo, fr, legL, L1, del, hipX });
    crearPresencia(M);
    root.traverse(o => { if (o.isMesh && o.material && o.material.isMeshBasicMaterial) o.castShadow = false; });
    return M;
  }
  /* puntos débiles de cada gólem (los usa 11-jefes.js: tipo, malla, radio y aguante) */
  function puntosDebiles(id, M, mat, d) {
    const { E, tH, tW, tD, fo, legL, L1 } = d;
    const dbl = (tipo, m, r, hp, extra) => { const w = Object.assign({ tipo, mesh: m, r, hp, max: hp, roto: false }, extra || {}); M.debiles.push(w); return w; };
    if (id === 'musgoso') {
      const mm = material(ASPECTO_GOLEM.roca, lin(0x6fa04a)); mm.userData.u.uCub.value = 1; mm.userData.u.uRuna.value.setRGB(.4, 1.2, .3); mm.userData.u.uRunaI.value = .8; M.mats.push(mm);
      [[M.hombros[0], 0, .1 * E, 0], [M.hombros[1], 0, .1 * E, 0], [M.torso, 0, tH * .7, -tD * .5], [M.caderas[1], 0, -L1 * .35, .08 * E]].forEach(p => {
        const c = new Cantera(ASPECTO_GOLEM.roca); c.bloque(0, 0, 0, .12 * E, .07 * E, .12 * E, null, { abo: .3 }); c.bloque(.05 * E, .04 * E, .02 * E, .06 * E, .05 * E, .06 * E, null, { abo: .3 });
        const m = c.malla(mm); m.position.set(p[1], p[2], p[3]); p[0].add(m); dbl('musgo', m, .14 * E, 30);
      });
    }
    if (id === 'escarcha') {
      dbl('nucleo', M.nucleo, .13 * E, 1e9, { golpes: 0 });
      const am = material(ASPECTO_GOLEM.cristal, lin(0xe8f8ff)); am.opacity = .35; am.userData.u.uFresnel.value = 2.5; am.userData.u.uRunaI.value = 0; M.mats.push(am);
      const c = new Cantera(ASPECTO_GOLEM.cristal); c.bloque(0, tH * .55, 0, tW * .72, tH * .7, tD * .82, null, { det: 1, abo: .12 }); const sh = c.malla(am); sh.castShadow = false; sh.visible = false; M.torso.add(sh); M.armadura = sh;
      for (const s of [0, 1]) { const c2 = new Cantera(ASPECTO_GOLEM.cristal); for (let k = 0; k < 4; k++) c2.bloque((k - 1.5) * .04 * E, .13 * E + (k % 2) * .03 * E, (k - 1.5) * .02 * E, .028 * E, .14 * E, .028 * E, [(k - 1.5) * .25, 0, (s ? 1 : -1) * (.3 + k * .12)], { det: 0, abo: 0 }); M.hombros[s].add(c2.malla(mat)); }
    }
    if (id === 'arena') {
      const cm = new THREE.MeshStandardMaterial({ color: lin(0x4a3a2c), metalness: .85, roughness: .45 }), tg = new THREE.TorusGeometry(.04 * E, .013 * E, 6, 12);
      for (let s = 0; s < 2; s++) {
        const sg = s ? -1 : 1, gch = grupo(M.torso, sg * d.hipX * 1.6, .02 * E, tD * .46);
        for (let k = 0; k < 5; k++) { const l = new THREE.Mesh(tg, cm); l.position.y = .03 * E - k * .055 * E; l.rotation.y = k % 2 ? Math.PI / 2 : 0; l.castShadow = true; gch.add(l); }
        dbl('cadena', gch, .12 * E, 40);
      }
      for (let k = 0; k < 6; k++) { const c = new Cantera(ASPECTO_GOLEM.arenisca); c.bloque(0, 0, 0, .05 * E, .045 * E, .05 * E); const r = c.malla(mat); M.root.add(r); M.extras.push({ m: r, a: k / 6 * TAU, rad: .55 * E, y: .45 * E + k * .06 * E, v: .6 }); }
    }
    if (id === 'marea') {
      const oro = new THREE.MeshStandardMaterial({ color: lin(0xd9a441), metalness: 1, roughness: .28 }), gm = brilla(.6, 2.2, 2), tg = new THREE.TorusGeometry(.085 * E, .028 * E, 10, 22);
      for (let s = 0; s < 2; s++) {
        const b = new THREE.Mesh(tg, oro); b.rotation.x = Math.PI / 2; b.position.y = -fo * .45; b.castShadow = true; M.codos[s].add(b);
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(.035 * E), gm); gem.position.set(0, .09 * E, 0); b.add(gem);
        const cabo = Arquitectura.construir(k => Arquitectura.caboGuardian(k)).g;
        cabo.position.set(.07 * E, .085 * E, 0); cabo.rotation.x = -Math.PI / 2;
        cabo.traverse(o => { if (o.isMesh) o.castShadow = false; }); b.add(cabo);
        dbl('brazalete', b, .12 * E, 50);
      }
    }
    if (id === 'cerezo') {
      const hm = new THREE.MeshStandardMaterial({ vertexColors: true, emissive: lin(0x7a2a4a), emissiveIntensity: .3, roughness: .7, side: THREE.DoubleSide }), gh = grupo(M.torso, 0, tH * .92, 0);
      const pg = new THREE.CircleGeometry(.05 * E, 7); pg.scale(1, .55, 1); pg.translate(0, .02 * E, 0);
      const hojas = []; for (let k = 0; k < 70; k++) { const a = k * 2.399, r = tW * (.25 + .5 * ((k * 37) % 17) / 17), g2 = pg.clone(); g2.rotateX(-1.1 + (k % 5) * .25); g2.rotateY(a + (k % 3)); g2.translate(Math.cos(a) * r, (k % 6) * .025 * E - .03 * E, Math.sin(a) * r * 1.15); hojas.push(g2); }
      const l = new THREE.Mesh(fusionar(hojas.map(h => pieza(h, (k => [0xf6a8c8, 0xf29bb9, 0xffc8dc, 0xe888aa][k % 4])(hojas.indexOf(h)), {}))), hm); l.castShadow = true; gh.add(l);
      M.hojas = gh; dbl('hojas', gh, .32 * E, 70);
      const cm = brilla(.5, 1.6, 2.6);
      for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(.08 * E), cm); c.scale.y = 1.8; M.root.add(c); const ex = { m: c, a: k / 3 * TAU, rad: .6 * E, y: .72 * E, v: .9 }; M.extras.push(ex); dbl('cristal', c, .12 * E, 25, { ex }); }
    }
  }

  /* ---------- animación ---------- */
  /* resplandor de las juntas pegado a sus huesos; todo entra en el lote de Halo */
  function crearPresencia(M) {
    M.presenciaHalos = []; M.presenciaColor = lin(A_.presencia.frio).multiplyScalar(1.5);
    const junta = (hueso, x, y, z) => {
      const h = halo(M.presenciaColor, M.E * A_.presencia.halo, A_.presencia.junta);
      h.position.set(x, y, z); hueso.add(h); M.presenciaHalos.push(h);
    };
    junta(M.pelvis, 0, .04 * M.E, M.tD * .48); junta(M.torso, 0, M.tH * .92, M.tD * .48);
    for (const h of M.hombros) junta(h, 0, .04 * M.E, .09 * M.E);
    for (const h of M.codos) junta(h, 0, 0, .08 * M.E);
    for (const h of M.rodillas) junta(h, 0, 0, .08 * M.E);
    M.materialesPresencia = [...M.mats, M.matSuelto].map(m => ({ u: m.userData.u, borde: m.userData.u.uFresnel.value }));
  }
  // La física decide B.solido; los estados de reposo descartan la bandera antigua al purificar.
  const conPeso = B => !!B.solido && B.estado !== 'dormido' && B.estado !== 'purificado' && B.estado !== 'calmo';
  const T0 = () => ({ y: 0, lean: 0, roll: 0, twist: 0, bend: 0, head: 0, headY: 0, h: [[.12, .12, 0], [.12, .12, 0]], c: [-.25, -.25] });
  function estadoAnim(B) {
    if (B.G) return B.G;
    const P = T0();
    B.G = { P, pies: [0, 1].map(() => ({ pos: V(), desde: V(), hacia: V(), t: 1, aire: false })), listo: false, px: B.x, pz: B.z, vel: 0, reac: 0, rx: 0, rz: 0, calmaK: 0, calmaObj: 0, brilloT: 0, brilloS: 0, qS: new THREE.Quaternion(), qI: new THREE.Quaternion(),
      presencia: conPeso(B) ? 1 : 0, presenciaT: conPeso(B) ? 1 : 0, pesoObj: conPeso(B), pesoT: 0 };
    return B.G;
  }
  /* lectura común 0…1; animar la actualiza, sin dt solo consulta; inmediato reconstruye sin destello */
  function presencia(B, dt, inmediato) {
    const G = estadoAnim(B), C = A_.presencia, solido = conPeso(B), objetivo = solido ? 1 : 0;
    if (inmediato) { G.presencia = G.presenciaT = objetivo; G.pesoObj = solido; G.pesoT = 0; return objetivo; }
    if (!(dt > 0)) return G.presencia;
    if (solido && !G.pesoObj) G.pesoT = C.pulso;
    if (!solido) G.pesoT = 0;
    G.pesoObj = solido; G.pesoT = Math.max(0, G.pesoT - dt);
    G.presenciaT += clamp(objetivo - G.presenciaT, -dt / C.dur, dt / C.dur);
    G.presencia = smooth(0, 1, G.presenciaT); return G.presencia;
  }
  /* pose objetivo según el estado y el ataque (fase p: 0-1 aviso, 1-2 golpe, 2-3 recuperación) */
  function poseObjetivo(B, G, T, t) {
    const M = B.M, E = M.E, es = B.estado, a = B.atq, mov = Math.min(1, G.vel / 1.5);
    T.y = Math.sin(t * 1.3 + B.A.x) * .008 * E;                                 // respiración
    if (es === 'combate') { T.lean = .1; T.h = [[-.35, .2, 0], [-.35, .2, 0]]; T.c = [-.7, -.7]; T.y -= .03 * E; }
    if (mov > .05) { const s = Math.sin(t * 3.2 * (1 + mov)); T.h[0][0] += s * .35 * mov; T.h[1][0] -= s * .35 * mov; T.lean += .08 * mov; T.roll = s * .04 * mov; }
    if (es === 'dormido') { T.y = -.32 * E; T.lean = .65; T.h = [[-.6, .25, 0], [-.55, .25, 0]]; T.c = [-1, -1]; T.head = .5; }
    else if (es === 'despertar') { const k = clamp(B.t / 3.2, 0, 1), e = k * k * (3 - 2 * k); T.y = -E * .9 * (1 - e) - .1 * E * Math.sin(k * Math.PI); T.h = [[-2.6 * Math.sin(k * Math.PI), .6, 0], [-2.6 * Math.sin(k * Math.PI), .6, 0]]; T.lean = -.25 * Math.sin(k * Math.PI); T.head = -.4 * Math.sin(k * Math.PI); }
    else if (es === 'fase') { T.h = [[-.5, 1.3, 0], [-.5, 1.3, 0]]; T.c = [-.4, -.4]; T.lean = -.35; T.head = -.5; T.y += Math.sin(t * 40) * .01 * E; }
    else if (es === 'tambaleo') { const w = Math.sin(t * 9); T.lean = -.35 + w * .08; T.roll = w * .1; T.h = [[-1.7, .9 + w * .2, 0], [-1.5, .9 - w * .2, 0]]; T.c = [-.4, -.4]; T.head = -.35; T.y = -.07 * E; }
    else if (es === 'aturdido') { T.y = -.27 * E; T.lean = .6; T.h = [[.25, .12, 0], [.2, .12, 0]]; T.c = [-.3, -.3]; T.head = .55; }
    else if (es === 'purificado' || es === 'calmo') { T.y = -.3 * E; T.lean = .35; T.h = [[-.55, .2, 0], [-.55, .2, 0]]; T.c = [-1.1, -1.1]; T.head = .25; }
    else if (a) {
      const p = a.fase === 'tele' ? a.t / a.A.tele : a.fase === 'act' ? 1 + a.t / a.A.act : 2 + a.t / a.A.rec, pose = a.A.pose;
      const sube = easeIO(clamp(p, 0, 1)), golpe = clamp((p - 1) * 5, 0, 1), vuelve = smooth(2, 3, p);   // golpe: la primera quinta parte del ataque activo
      if (pose === 'golpe') { T.h[1] = [lerp(lerp(-.35, -2.9, sube), -.25, golpe), lerp(.2, .35, sube), 0]; T.c[1] = lerp(-.3, -.1, golpe); T.lean = lerp(lerp(.1, -.2, sube), .45, golpe); T.twist = lerp(.3 * sube, -.15, golpe); T.y -= .08 * E * golpe; }
      else if (pose === 'alzar') { const x = lerp(lerp(-.35, -3, sube), -.3, golpe); T.h = [[x, .35, 0], [x, .35, 0]]; T.c = [-.2, -.2]; T.lean = lerp(lerp(.1, -.25, sube), .5, golpe); T.y -= .1 * E * golpe; T.head = lerp(-.3 * sube, .3, golpe); }
      else if (pose === 'carga') { T.lean = .6; T.h = [[.7, .3, 0], [.7, .3, 0]]; T.c = [-.9, -.9]; T.head = -.2; }
      else if (pose === 'aliento') { T.lean = p < 1 ? -.3 * sube : .3; T.h = [[-1, .9, 0], [-1, .9, 0]]; T.head = p < 1 ? -.3 * sube : .2; }
      else if (pose === 'barrido') { if (p < 1) { T.twist = .9 * sube; T.h[1] = [-1.2, 1.3 * sube, 0]; T.lean = .05; } else { T.twist = lerp(.9, -.95, golpe); T.h[1] = [-1.4, lerp(1.3, .5, golpe), 0]; T.lean = .3 * golpe; } T.c[1] = -.2; }
      else if (pose === 'girar') { T.h = [[-.25, 1.45, 0], [-.25, 1.45, 0]]; T.c = [-.1, -.1]; }
      else if (pose === 'disparo') { const i = (a.d.n || 0) % 2; T.h = [[-1.5, .15, 0], [-1.5, .15, 0]]; T.h[i][0] = -1.65; T.c = [-.1, -.1]; T.lean = .1; }
      else if (pose === 'combo') { const i = a.fase === 'act' ? (a.d.swing || 0) : 0, ph = a.fase === 'act' ? (a.t % .6) / .6 : p, lado = i % 2; const g = clamp(ph * 4, 0, 1); T.h[lado] = [lerp(-2.5, -.4, a.fase === 'act' ? g : 0), .3, 0]; T.c[lado] = -.15; T.twist = (lado ? -1 : 1) * (a.fase === 'act' ? lerp(.5, -.5, g) : .5 * p); T.lean = a.fase === 'act' ? .35 * g : .05; }
      if (vuelve > 0) { const R = T0(); R.lean = .1; R.h = [[-.35, .2, 0], [-.35, .2, 0]]; R.c = [-.7, -.7]; mezclar(T, R, vuelve); }
    }
    // reacción a un golpe: se dobla en la dirección del empuje
    if (G.reac > 0) { const k = Math.sin(Math.min(1, G.reac) * Math.PI) * A_.reaccion.fuerza; T.lean += G.rz * k; T.roll -= G.rx * k * .7; T.head += .4 * k; T.y -= .03 * E * k; }
    // la cabeza sigue a Hikari durante la pelea
    const J = Sis.J; if (J && (es === 'combate' || es === 'fase')) T.headY = clamp(angDif(B.yaw + B.spin, Math.atan2(J.x - B.x, J.z - B.z)), -.8, .8);
  }
  function mezclar(T, R, k) { for (const f of ['y', 'lean', 'roll', 'twist', 'bend', 'head', 'headY']) T[f] = lerp(T[f], R[f], k); for (let s = 0; s < 2; s++) { for (let i = 0; i < 3; i++) T.h[s][i] = lerp(T.h[s][i], R.h[s][i], k); T.c[s] = lerp(T.c[s], R.c[s], k); } }

  function animar(B, dt) {
    const M = B.M, E = M.E, G = estadoAnim(B), t = U.uT.value, a = B.atq;
    const peso = presencia(B, dt), C = A_.presencia, tenue = 1 - peso, destello = Math.sin(G.pesoT / C.pulso * Math.PI);
    dt = Math.min(dt, .05);
    // velocidad real del cuerpo (para las piernas y el balanceo)
    const vx = (B.x - G.px) / Math.max(dt, 1e-3), vz = (B.z - G.pz) / Math.max(dt, 1e-3); G.px = B.x; G.pz = B.z;
    G.vel = damp(G.vel, Math.min(Math.hypot(vx, vz), 20), 6, dt);
    const T = T0(); poseObjetivo(B, G, T, t);
    const P = G.P, k = 1 - Math.exp(-(a && a.fase === 'act' ? 18 : a && a.fase === 'tele' ? 7 : 6) * dt);
    for (const f of ['y', 'lean', 'roll', 'twist', 'bend', 'head', 'headY']) P[f] += (T[f] - P[f]) * k;
    for (let s = 0; s < 2; s++) { for (let i = 0; i < 3; i++) P.h[s][i] += (T.h[s][i] - P.h[s][i]) * k; P.c[s] += (T.c[s] - P.c[s]) * k; }
    G.reac = Math.max(0, G.reac - dt / A_.reaccion.dur);
    // cuerpo
    const flo = M.cascada ? .35 + Math.sin(t * 2) * .15 : 0;
    M.root.position.set(B.x, B.A.y + flo, B.z); M.root.rotation.y = B.yaw + B.spin;
    M.pelvis.position.y = M.legL + P.y; M.pelvis.rotation.set(P.lean * .35, 0, P.roll);
    M.torso.rotation.set(P.lean * .65 + P.bend, P.twist, P.roll * .5);
    if (M.cabeza) M.cabeza.rotation.set(P.head, P.headY, 0);
    for (let s = 0; s < 2; s++) {
      const sg = s ? -1 : 1; M.hombros[s].rotation.set(P.h[s][0], P.h[s][2], sg * P.h[s][1]); M.codos[s].rotation.x = P.c[s];
      M.hombros[s].position.x = sg * (M.tW * .5 + .06 * E + (B.desarme && B.estado !== 'calmo' && B.estado !== 'purificado' ? .12 * E + Math.sin(t * 3 + s) * .04 * E : 0));
    }
    for (const ex of M.extras) { ex.a += dt * ex.v; ex.m.position.set(Math.cos(ex.a) * ex.rad, ex.y + Math.sin(t * 2 + ex.a) * .1 * E, Math.sin(ex.a) * ex.rad); ex.m.rotation.y += dt; }
    if (M.cascada) { M.cascada.rotation.y += dt * 1.5; M.cascada.scale.set(1 + Math.sin(t * 3) * .04, 1, 1 + Math.cos(t * 3) * .04); if (Math.random() < dt * 20) FX.emit(B.x + rnd(-1.5, 1.5), B.A.y + .3, B.z + rnd(-1.5, 1.5), rnd(-1, 1), rnd(.5, 2), rnd(-1, 1), .7, .35, 0xcffff0, .8); }
    // piernas: pies apoyados con IK
    if (M.caderas.length) piernas(B, G, vx, vz, dt);
    // materiales: destello, venas y calma
    G.calmaK = damp(G.calmaK, G.calmaObj, 1 / A_.calma * 3, dt);
    const u = M.mat.userData.u, ck = G.calmaK, fight = B.estado !== 'dormido' && B.estado !== 'purificado' && B.estado !== 'calmo';
    u.uFlash.value = Math.max(0, u.uFlash.value - dt * 1.2, destello * .1);
    u.uTinte.value.copy(M.col.piel).lerp(M.col.calma, ck);
    u.uTinte.value.lerp(M.presenciaColor, tenue * C.tinte);
    u.uRuna.value.copy(M.col.vena).lerp(M.col.venaCalma, ck);
    u.uRunaI.value = lerp(fight ? A_.venas.corrupto : B.estado === 'dormido' ? .5 : A_.venas.corrupto * .6, A_.venas.calmo, ck);
    for (const m of M.materialesPresencia) m.u.uFresnel.value = m.borde + tenue * C.borde + destello * C.destello;
    for (const h of M.presenciaHalos) {
      h.opacidad = tenue * C.junta * (.85 + .15 * Math.sin(t * 1.8)) + destello * C.destello;
      h.visible = h.opacidad > .001;
    }
    const S = Jefes.st(B.id), ojo = ck > .5 ? M.col.ojoCalma : (S.inv || fight) ? M.col.ojoIra : M.col.ojoDormido;
    for (const o of M.ojos) o.material.color.copy(ojo);
    const exp = B.estado === 'aturdido' || B.estado === 'purificado' || (B.id === 'escarcha' && B.expuesto > 0);
    M.nucleo.material.color.copy(exp ? M.col.nucExp : M.col.nuc); M.nucleoHalo.opacidad = exp ? .8 + Math.sin(t * 8) * .2 : 0;
    M.nucleo.rotation.y += dt * (exp ? 2.5 : .8);
    // aviso de parada: destello en la mano que va a golpear
    if (G.brilloT > 0) { G.brilloT -= dt; const m = M.brillo; m.visible = true; const p = G.brilloS < 0 ? M.nucleo : M.manos[G.brilloS]; p.getWorldPosition(_v); M.root.worldToLocal(_v); m.position.copy(_v); const f = Math.sin(clamp(G.brilloT / .35, 0, 1) * Math.PI); m.scale.setScalar(E * (.25 + .55 * f)); m.opacidad = f; m.giro = t * 3; }
    else M.brillo.visible = false;
  }

  /* pies: cada uno se queda en el suelo hasta que se aleja de su sitio; entonces da un paso pesado. Cada pie se
     apoya a la altura real del suelo bajo él (terreno o sólido) y la pelvis baja y se inclina con el desnivel
     (paso.sube: altura (×E) a la que busca sólidos; cadera: cuánto baja por la diferencia entre los pies) */
  function piernas(B, G, vx, vz, dt) {
    const M = B.M, E = M.E, yaw = B.yaw + B.spin, c = Math.cos(yaw), s = Math.sin(yaw), suelo = B.A.y, P = A_.paso;
    const alto = (x, z) => Math.max(altura(x, z), Sol.suelo(x, z, suelo + P.sube * E));
    const sitio = (i, out) => { const x = (i ? -1 : 1) * M.hipX; out.set(B.x + x * c, 0, B.z - x * s); out.y = alto(out.x, out.z); return out; };
    if (!G.listo || G.pies.some(p => Math.hypot(p.pos.x - B.x, p.pos.z - B.z) > 3 * E)) { G.pies.forEach((p, i) => { sitio(i, p.pos); p.aire = false; p.t = 1; }); G.listo = true; }
    const quieto = B.estado === 'dormido' || B.estado === 'purificado' || B.estado === 'calmo' || B.estado === 'aturdido';
    for (let i = 0; i < 2; i++) {
      const p = G.pies[i], otro = G.pies[1 - i];
      sitio(i, _v); _v.x += vx * .25; _v.z += vz * .25; _v.y = alto(_v.x, _v.z);
      if (!p.aire && !otro.aire && !quieto && Math.hypot(_v.x - p.pos.x, _v.z - p.pos.z) > P.umbral * E && (Math.hypot(_v.x - p.pos.x, _v.z - p.pos.z) >= Math.hypot(_w.copy(sitio(1 - i, _w)).x - otro.pos.x, _w.z - otro.pos.z))) {
        p.aire = true; p.t = 0; p.desde.copy(p.pos); p.hacia.copy(_v); p.dur = P.dur * Math.sqrt(E / 6) / (1 + Math.min(1, G.vel / 4));
      }
      if (p.aire) {
        p.t += dt / p.dur; const u = Math.min(1, p.t), e = u * u * (3 - 2 * u); p.hacia.copy(_v);
        p.pos.lerpVectors(p.desde, p.hacia, e); p.pos.y += Math.sin(Math.PI * u) * P.alto * E;
        if (p.t >= 1) { p.aire = false; p.pos.y = p.hacia.y; pisada(B, p.pos.x, p.pos.z); }
      }
    }
    // desnivel: la pelvis sigue la media de los pies, baja con la diferencia y se inclina hacia el pie más bajo
    const h0 = (G.pies[0].aire ? G.pies[0].hacia.y : G.pies[0].pos.y) - suelo, h1 = (G.pies[1].aire ? G.pies[1].hacia.y : G.pies[1].pos.y) - suelo;
    G.dy = damp(G.dy || 0, clamp((h0 + h1) / 2 - Math.abs(h0 - h1) * P.cadera, -P.maxBaja * E, P.maxSube * E), 6, dt);
    G.droll = damp(G.droll || 0, clamp((h0 - h1) / (2 * M.hipX) * P.inclina, -.25, .25), 6, dt);
    M.root.position.y += G.dy; M.pelvis.rotation.z += G.droll;
    M.root.updateMatrixWorld(true);
    for (let i = 0; i < 2; i++) {
      const p = G.pies[i]; _w.set(p.pos.x, p.pos.y + .05 * E, p.pos.z);
      ikDosHuesos(M.caderas[i], M.rodillas[i], _w, _POLO, M.L1, M.L2, G.qS, G.qI);
      M.caderas[i].quaternion.copy(G.qS); M.rodillas[i].quaternion.copy(G.qI);
      // el pie queda plano y mirando hacia donde mira el cuerpo
      M.caderas[i].updateMatrixWorld(true); M.rodillas[i].getWorldQuaternion(_q); _q2.setFromAxisAngle(_Y, yaw); M.tobillos[i].quaternion.copy(_q.invert().multiply(_q2));
    }
  }
  const _POLO = new THREE.Vector3(0, 0, 1), _Y = new THREE.Vector3(0, 1, 0);

  /* ---------- efectos ---------- */
  function pisada(B, x, z) {
    const E = B.M.E, J = Sis.J, d = J ? Math.hypot(J.x - x, J.z - z) : 99, c = B.M.asp.astillas;
    if (B.M.cascada) return;
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; FX.emit(x + Math.cos(a) * .4 * E / 6, B.A.y + .1, z + Math.sin(a) * .4 * E / 6, Math.cos(a) * 2, rnd(.3, 1), Math.sin(a) * 2, .7, .35 * E / 6, B.estado === 'dormido' ? c : 0xb8ab94, .55); }
    if (d < 30 && J) { J.shake = Math.max(J.shake, .35 * (1 - d / 30) * E / 6); if (d < 22) Sonido.sfx('aterrizar', { vol: 1.4, pos: { x, y: B.A.y, z } }); }
  }
  /* golpe recibido en (x, y, z) desde la dirección (dx, dz) con un peso de 1 a 3 */
  function golpe(B, dx, dz, peso, x, y, z) {
    const G = estadoAnim(B), M = B.M, yaw = B.yaw + B.spin, l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l;
    G.reac = Math.min(1.3, (G.reac > .3 ? G.reac : 0) + .35 + .2 * (peso || 1)); G.rz = ux * Math.sin(yaw) + uz * Math.cos(yaw); G.rx = ux * Math.cos(yaw) - uz * Math.sin(yaw);
    M.mat.userData.u.uFlash.value = .06 + .04 * (peso || 1);
    if (x !== undefined) { const c = M.asp.astillas; FX.rafaga(x, y, z, 8 + 6 * (peso || 1), 3 + peso, .5, .14 * M.E / 6 + .08, c, 1); if (B.id === 'cerezo') FX.rafaga(x, y + .5, z, 6, 2, 1, .12, 0xf6a8c8, 1); }
  }
  /* destello de aviso antes de un golpe que se puede parar (s: mano 0/1, -1 el cuerpo) */
  function brillo(B, s) { const G = estadoAnim(B); G.brilloT = .35; G.brilloS = s; Sonido.sfx('chispa'); }
  /* purificación: el color vuelve poco a poco (o de golpe al cargar la partida) */
  function calma(B, inmediato) {
    const G = estadoAnim(B); G.calmaObj = 1; if (inmediato) G.calmaK = 1;
  }
  function pilar(B) {
    const E = B.M.E, g = new THREE.CylinderGeometry(.16 * E, .26 * E, 60, 16, 1, true), m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.4, .9), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    m.position.set(B.x, B.A.y + 30, B.z); m.frustumCulled = false; scene.add(m);
    let t = 0; const paso = () => { t += 1 / 60; m.material.opacity = Math.sin(Math.min(1, t / 4) * Math.PI) * .45; m.scale.set(1 + t * .15, 1, 1 + t * .15); if (t < 4) requestAnimationFrame(paso); else { scene.remove(m); g.dispose(); m.material.dispose(); } };
    paso();
    for (let k = 0; k < 60; k++) FX.emit(B.x + rnd(-1, 1) * E * .3, B.A.y + rnd(0, E), B.z + rnd(-1, 1) * E * .3, rnd(-1, 1), rnd(2, 6), rnd(-1, 1), 2.2, .35, k % 3 ? 0x2a0f3a : 0xffe9a8, .8);
  }
  function despertar(B) { const E = B.M.E; for (let k = 0; k < 40; k++) { const a = Math.random() * TAU, r = rnd(.5, 1.6) * E * .35; FX.emit(B.x + Math.cos(a) * r, B.A.y + .2, B.z + Math.sin(a) * r, Math.cos(a) * 3, rnd(2, 7), Math.sin(a) * 3, 1.4, .45 * E / 6, B.M.asp.astillas, .8); } }

  /* el único ascenso: la luz del guardián sube (lo lanza la liberación, no la purificación) */
  return { crear, animar, presencia, golpe, brillo, calma, despertar, pisada, ascenso: pilar };
})();
