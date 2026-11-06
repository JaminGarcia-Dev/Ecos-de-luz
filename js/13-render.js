/* === Ecos de Luz · 13-render.js ===
   Renderizador y tubería HDR: escena en coma flotante con MSAA, bloom por mips,
   exposición automática en GPU, tono ACES, gradación de color, viñeta y tramado.
   Resolución dinámica para sostener 60 FPS. En calidad baja se dibuja directo. */
"use strict";

const Render = (() => {
  const OBJ_MS = 1000 / 60;                       // presupuesto de un fotograma
  const ESCALAS = [1, .9, .8, .7, .6, .5];       // escalas de resolución interna
  const PIX_MAX = { alta: 2560 * 1440, media: 1920 * 1080, baja: 1600 * 900 };
  const NIVELES_BLOOM = 6;
  // aspecto final: lo modula Atmosfera según el momento del día
  const A = {
    exposicion: 1, clave: .2, adaptacion: .55, expMin: .55, expMax: 2.6,
    bloom: .15, umbral: 1.2, rodilla: .6,
    saturacion: 1, contraste: 1.04, balance: new THREE.Vector3(1, 1, 1), vineta: .3,
    // rayos de sol (los pone Atmosfera según la hora) y desenfoque de profundidad (cinemáticas y portada: foco en m)
    rayos: 0, solDir: new THREE.Vector3(0, 1, 0), rayosCol: new THREE.Vector3(1, .85, .6), foco: 30, desenfoque: 0, desenfoqueObj: 0,
    // color del lugar (Atmosfera: región y fragmentos devueltos); colorLugar 0 lo apaga (intro y portada)
    satLugar: 1, balLugar: new THREE.Vector3(1, 1, 1), colorLugar: 1, cine: 0, cineObj: 0
  };
  /* ao: oclusión ambiental (solo alta) a media resolución: radio (m), tomas, fuerza, sesgo (m) y distancia (m) a la que
     se desvanece · rayos (alta y media) a 1/4: tomas y caída de cada una · dof: radio del desenfoque (píxeles a media
     resolución), rango de foco (fracción de la distancia) y velocidad con que entra y sale */
  const EFECTOS = { ao: { radio: 1.4, tomas: 10, fuerza: .9, sesgo: .04, lejos: 80 }, rayos: { tomas: 40, caida: .97 }, dof: { radio: 5, rango: .6, vel: 2.5 },
    /* aspecto de película en las cinemáticas (A.cineObj): grano (más en las sombras), viñeta extra, sombras hacia el azul y
       luces hacia el ámbar (gradación), un poco más de contraste, velocidad con que entra y resolución mínima */
    cine: { grano: .032, vineta: .28, sombras: [.94, .98, 1.06], luces: [1.05, 1.0, .93], contraste: 1.06, vel: 1.5, escalaMin: .8 } };
  let hdr = false, rtEscena = null, mips = [], rtLum = null, rtExp = [], iExp = 0, rtAO = null, rtAO2 = null, rtRayos = null, rtDof = null, blanco = null;
  const _sol = new THREE.Vector3(), _cd = new THREE.Vector3(), _bal = new THREE.Vector3(), _uno = new THREE.Vector3(1, 1, 1);
  let rtCopia = null, aguaRef = null;
  let escQ, camQ, quad;
  const M = {};
  let pr = 1, iEscala = 0;
  // resolución dinámica: media móvil del tiempo por fotograma y sondeo prudente hacia arriba
  let tPrev = 0, ema = OBJ_MS, tEval = 0, tSondeo = 8000, tDesdeCambio = 0, nMalos = 0, subio = false;
  const RES = { fps: 60, ms: OBJ_MS, escala: 1 };
  const VIGILA = { tope: 100, pausa: 2000 };   // ms: recorte de un fotograma largo y pausa que no se mide

  const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
  const GLSL_MUESTRA = `uniform sampler2D tEnt; uniform vec2 uTexel; varying vec2 vUv;
vec3 m(vec2 o){ return texture2D(tEnt, vUv + o*uTexel).rgb; }`;
  // muestreo de 13 tomas (Jimenez 2014); el primer nivel usa media de Karis contra destellos
  const FRAG_PRE = GLSL_MUESTRA + `
uniform float uUmbral, uRodilla;
float kw(vec3 c){ return 1./(1. + max(c.r, max(c.g, c.b))); }
void main(){
  vec3 a=m(vec2(-2.,2.)), b=m(vec2(0.,2.)), c=m(vec2(2.,2.)), d=m(vec2(-2.,0.)), e=m(vec2(0.)), f=m(vec2(2.,0.));
  vec3 g=m(vec2(-2.,-2.)), h=m(vec2(0.,-2.)), i=m(vec2(2.,-2.)), j=m(vec2(-1.,1.)), k=m(vec2(1.,1.)), l=m(vec2(-1.,-1.)), n=m(vec2(1.,-1.));
  vec3 g0=(j+k+l+n)*.25, g1=(a+b+d+e)*.25, g2=(b+c+e+f)*.25, g3=(d+e+g+h)*.25, g4=(e+f+h+i)*.25;
  float w0=kw(g0)*.5, w1=kw(g1)*.125, w2=kw(g2)*.125, w3=kw(g3)*.125, w4=kw(g4)*.125;
  vec3 r = (g0*w0 + g1*w1 + g2*w2 + g3*w3 + g4*w4)/(w0+w1+w2+w3+w4);
  r = min(r, vec3(64.));
  float br = max(r.r, max(r.g, r.b));
  float s = clamp(br - uUmbral + uRodilla, 0., 2.*uRodilla); s = s*s/(4.*uRodilla + 1e-4);
  r *= max(s, br - uUmbral)/max(br, 1e-4);
  gl_FragColor = vec4(r, 1.);
}`;
  const FRAG_BAJA = GLSL_MUESTRA + `
void main(){
  vec3 a=m(vec2(-2.,2.)), b=m(vec2(0.,2.)), c=m(vec2(2.,2.)), d=m(vec2(-2.,0.)), e=m(vec2(0.)), f=m(vec2(2.,0.));
  vec3 g=m(vec2(-2.,-2.)), h=m(vec2(0.,-2.)), i=m(vec2(2.,-2.)), j=m(vec2(-1.,1.)), k=m(vec2(1.,1.)), l=m(vec2(-1.,-1.)), n=m(vec2(1.,-1.));
  gl_FragColor = vec4(e*.125 + (a+c+g+i)*.03125 + (b+d+f+h)*.0625 + (j+k+l+n)*.125, 1.);
}`;
  const FRAG_SUBE = GLSL_MUESTRA + `
uniform float uPeso;
void main(){
  vec3 r = m(vec2(-1.,1.)) + 2.*m(vec2(0.,1.)) + m(vec2(1.,1.)) + 2.*m(vec2(-1.,0.)) + 4.*m(vec2(0.)) + 2.*m(vec2(1.,0.)) + m(vec2(-1.,-1.)) + 2.*m(vec2(0.,-1.)) + m(vec2(1.,-1.));
  gl_FragColor = vec4(r*uPeso/16., 1.);
}`;
  // luminancia media logarítmica con medición ponderada al centro
  // 5×5 tomas desplazadas cada fotograma; la adaptación suaviza el resultado
  const FRAG_LUM = `uniform sampler2D tEnt; uniform vec2 uDesp; varying vec2 vUv;
void main(){
  float s = 0., w = 0.;
  for (int i = 0; i < 5; i++) for (int j = 0; j < 5; j++) {
    vec2 q = (vec2(float(i), float(j)) + uDesp)/5.; vec2 uv = mix(vec2(.06), vec2(.94), q);
    float p = 1.5 - length(q - .5); vec3 c = texture2D(tEnt, uv).rgb;
    s += p*log(max(dot(c, vec3(.2126, .7152, .0722)), 1e-4)); w += p;
  }
  gl_FragColor = vec4(exp(s/w), 0., 0., 1.);
}`;
  const FRAG_ADAPTA = `uniform sampler2D tLum, tPrev; uniform float uDt, uClave, uFuerza, uMin, uMax; varying vec2 vUv;
void main(){
  float lum = texture2D(tLum, vec2(.5)).r;
  float obj = clamp(pow(uClave/max(lum, 1e-4), uFuerza), uMin, uMax);
  float prev = texture2D(tPrev, vec2(.5)).r;
  if (!(prev > 0.) || prev > 100.) prev = obj;
  float v = prev + (obj - prev)*(1. - exp(-uDt*(obj < prev ? 2.6 : 1.1)));
  if (!(v > 0.) || v > 100.) v = 1.;
  gl_FragColor = vec4(v, 0., 0., 1.);
}`;
  // posición en el espacio de la cámara desde la profundidad; ruido de gradiente intercalado para girar las tomas
  const GLSL_PROF = `uniform sampler2D tProf; uniform mat4 uProjInv;
vec3 posV(vec2 uv){ float d = texture2D(tProf, uv).r; vec4 p = uProjInv*vec4(vec3(uv, d)*2. - 1., 1.); return p.xyz/p.w; }
float ign(vec2 p){ return fract(52.9829189*fract(dot(p, vec2(.06711056, .00583715)))); }`;
  // oclusión ambiental (Alchemy): tomas en espiral en un disco del tamaño de 'radio' metros; normal desde la profundidad
  const FRAG_AO = GLSL_PROF + `
uniform vec2 uTexel, uEsc; uniform float uRadio, uFuerza, uSesgo, uLejos; varying vec2 vUv;
void main(){
  float d = texture2D(tProf, vUv).r;
  if (d >= .99999) { gl_FragColor = vec4(1., 1e4, 0., 1.); return; }
  vec3 P = posV(vUv); float dist = -P.z;
  if (dist > uLejos) { gl_FragColor = vec4(1., dist, 0., 1.); return; }
  vec3 pr = posV(vUv + vec2(uTexel.x, 0.)) - P, pl = P - posV(vUv - vec2(uTexel.x, 0.));
  vec3 pu = posV(vUv + vec2(0., uTexel.y)) - P, pd = P - posV(vUv - vec2(0., uTexel.y));
  vec3 N = normalize(cross(abs(pr.z) < abs(pl.z) ? pr : pl, abs(pu.z) < abs(pd.z) ? pu : pd));
  float a0 = ign(gl_FragCoord.xy)*6.2831853, occ = 0., R2 = uRadio*uRadio;
  vec2 rUV = uEsc*uRadio/dist;
  for (int i = 0; i < ${EFECTOS.ao.tomas}; i++) {
    float t = (float(i) + .5)/${EFECTOS.ao.tomas}., an = a0 + float(i)*2.399963;
    vec3 v = posV(vUv + vec2(cos(an), sin(an))*rUV*t) - P; float vv = dot(v, v);
    occ += max(0., dot(v, N) - uSesgo*dist*.02)/(vv + .01)*max(0., 1. - vv/(4.*R2));
  }
  float ao = clamp(1. - uFuerza*2.*uRadio*occ/${EFECTOS.ao.tomas}., 0., 1.);
  gl_FragColor = vec4(mix(ao, 1., smoothstep(uLejos*.6, uLejos, dist)), dist, 0., 1.);
}`;
  // suavizado que respeta los bordes: 3 × 3 tomas separadas 2 píxeles, con peso según la diferencia de distancia
  const FRAG_AO_SUAVE = `uniform sampler2D tAO; uniform vec2 uTexel; varying vec2 vUv;
void main(){
  vec2 c = texture2D(tAO, vUv).rg; float s = 0., w = 0.;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 q = texture2D(tAO, vUv + vec2(float(i), float(j))*uTexel*2.).rg;
    float k = 1./(1. + abs(q.g - c.g)*8./max(c.g, 1.)); s += q.r*k; w += k;
  }
  gl_FragColor = vec4(s/w, c.g, 0., 1.);
}`;
  // rayos de sol: desde cada píxel hacia el sol, se suma el cielo visible (profundidad máxima) con una caída
  const FRAG_RAYOS = `uniform sampler2D tEscena, tProf; uniform vec2 uSol; uniform float uCaida; varying vec2 vUv;
float ign(vec2 p){ return fract(52.9829189*fract(dot(p, vec2(.06711056, .00583715)))); }
float cielo(vec2 uv){
  if (uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1. || texture2D(tProf, uv).r < .99999) return 0.;
  return min(dot(texture2D(tEscena, uv).rgb, vec3(.2126, .7152, .0722)), 6.);
}
void main(){
  vec2 paso = (uSol - vUv)/${EFECTOS.rayos.tomas}.; vec2 uv = vUv + paso*ign(gl_FragCoord.xy); float peso = 1., s = 0.;
  for (int i = 0; i < ${EFECTOS.rayos.tomas}; i++) { s += cielo(uv)*peso; peso *= uCaida; uv += paso; }
  gl_FragColor = vec4(vec3(s/${EFECTOS.rayos.tomas}.), 1.);
}`;
  // desenfoque de profundidad: disco de 16 tomas a media resolución; cada toma pesa según su propio desenfoque
  // (lo enfocado no se derrama sobre el fondo). En alfa queda el desenfoque del píxel
  const FRAG_DOF = GLSL_PROF + `
uniform sampler2D tEscena; uniform vec2 uTexel; uniform float uFoco, uRango, uRadioD; varying vec2 vUv;
float coc(vec2 uv){ float d = texture2D(tProf, uv).r; float z = d >= .99999 ? 1e4 : -posV(uv).z; return clamp(abs(z - uFoco)/(uFoco*uRango), 0., 1.); }
void main(){
  float c0 = coc(vUv), a0 = ign(gl_FragCoord.xy)*6.2831853; vec3 s = texture2D(tEscena, vUv).rgb; float w = 1.;
  for (int i = 0; i < 16; i++) {
    float t = (float(i) + .5)/16., an = a0 + float(i)*2.399963; vec2 uv = vUv + vec2(cos(an), sin(an))*sqrt(t)*uRadioD*uTexel;
    float c = coc(uv), k = smoothstep(sqrt(t) - .2, sqrt(t), max(c, c0)); s += texture2D(tEscena, uv).rgb*k; w += k;
  }
  gl_FragColor = vec4(s/w, c0);
}`;
  const FRAG_FINAL = `uniform sampler2D tEscena, tBloom, tExp, tAO, tRayos, tDof; uniform float uBloom, uExpo, uSat, uCon, uVin, uAO, uRayos, uDof, uCine, uGrano, uT; uniform vec3 uBal, uRayosCol, uSomb, uLuz; varying vec2 vUv;
vec3 acesFit(vec3 v){ vec3 a = v*(v + .0245786) - .000090537; vec3 b = v*(.983729*v + .432951) + .238081; return a/b; }
vec3 aces(vec3 c){
  const mat3 ENT = mat3(vec3(.59719, .07600, .02840), vec3(.35458, .90834, .13383), vec3(.04823, .01566, .83777));
  const mat3 SAL = mat3(vec3(1.60475, -.10208, -.00327), vec3(-.53108, 1.10813, -.07276), vec3(-.07367, -.00605, 1.07602));
  return clamp(SAL*acesFit(ENT*c), 0., 1.);
}
vec3 aSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(c, vec3(1./2.4)) - .055, step(.0031308, c)); }
float azar(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)))*43758.5453); }
void main(){
  vec3 c = texture2D(tEscena, vUv).rgb;
  if (uDof > 0.) { vec4 b = texture2D(tDof, vUv); c = mix(c, b.rgb, smoothstep(.15, .7, b.a)*uDof); }
  if (uAO > 0.) c *= mix(1., texture2D(tAO, vUv).r, uAO);
  c += texture2D(tBloom, vUv).rgb*uBloom;
  if (uRayos > 0.) c += texture2D(tRayos, vUv).r*uRayosCol*uRayos;
  c *= uBal * uExpo * texture2D(tExp, vec2(.5)).r / .6;
  c = aSRGB(aces(c));
  float l = dot(c, vec3(.2126, .7152, .0722));
  c = clamp(mix(vec3(l), c, uSat), 0., 1.);
  c = clamp((c - .5)*uCon + .5, 0., 1.);
  if (uCine > 0.) {   // película: tonos partidos, grano que se mueve (más en las sombras) y viñeta más marcada
    float lc = dot(c, vec3(.2126, .7152, .0722));
    c = mix(c, clamp(c*mix(uSomb, uLuz, smoothstep(.15, .75, lc)), 0., 1.), uCine);
    float g = azar(floor(gl_FragCoord.xy/1.5) + fract(uT*24.)*vec2(97.3, 41.7)) - .5;
    c = clamp(c + g*uGrano*uCine*mix(1.1, .5, lc), 0., 1.);
  }
  vec2 d = vUv - .5; c *= mix(1., smoothstep(.9, .2, length(d*vec2(1.25, 1.))), uVin);
  c += (azar(gl_FragCoord.xy) + azar(gl_FragCoord.xy + 17.3) - 1.)/255.;
  gl_FragColor = vec4(c, 1.);
}`;

  function material(frag, uniforms, aditivo) {
    const m = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, toneMapped: false });
    if (aditivo) { m.transparent = true; m.blending = THREE.CustomBlending; m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneFactor; m.blendEquation = THREE.AddEquation; }
    return m;
  }
  function rt(w, h, opc) {
    return new THREE.WebGLRenderTarget(w, h, Object.assign({ type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false }, opc));
  }
  function pase(mat, destino) { quad.material = mat; renderer.setRenderTarget(destino); renderer.render(escQ, camQ); }

  function crear() {
    hdr = !!CAL.hdr;
    renderer = new THREE.WebGLRenderer({ antialias: !hdr, powerPreference: 'high-performance', stencil: false });
    if (hdr && !(renderer.capabilities.isWebGL2 && renderer.extensions.get('EXT_color_buffer_float'))) hdr = false;
    renderer.info.autoReset = false;
    // sin comprobación síncrona de cada shader el navegador los compila en paralelo; ?depurar la activa
    renderer.debug.checkShaderErrors = /[?&]depurar/.test(location.search);
    renderer.outputEncoding = hdr ? THREE.LinearEncoding : THREE.sRGBEncoding;
    renderer.toneMapping = hdr ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = CAL.sombra > 0; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (hdr) {
      escQ = new THREE.Scene(); camQ = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
      quad = new THREE.Mesh(g); quad.frustumCulled = false; escQ.add(quad);
      M.pre = material(FRAG_PRE, { tEnt: { value: null }, uTexel: { value: new THREE.Vector2() }, uUmbral: { value: A.umbral }, uRodilla: { value: A.rodilla } });
      M.baja = material(FRAG_BAJA, { tEnt: { value: null }, uTexel: { value: new THREE.Vector2() } });
      M.sube = material(FRAG_SUBE, { tEnt: { value: null }, uTexel: { value: new THREE.Vector2() }, uPeso: { value: 1 } }, true);
      M.lum = material(FRAG_LUM, { tEnt: { value: null }, uDesp: { value: new THREE.Vector2(.5, .5) } });
      M.adapta = material(FRAG_ADAPTA, { tLum: { value: null }, tPrev: { value: null }, uDt: { value: 0 }, uClave: { value: A.clave }, uFuerza: { value: A.adaptacion }, uMin: { value: A.expMin }, uMax: { value: A.expMax } });
      blanco = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat); blanco.needsUpdate = true;
      const prof = () => ({ tProf: { value: null }, uProjInv: { value: new THREE.Matrix4() } });
      M.ao = material(FRAG_AO, Object.assign(prof(), { uTexel: { value: new THREE.Vector2() }, uEsc: { value: new THREE.Vector2() }, uRadio: { value: EFECTOS.ao.radio }, uFuerza: { value: EFECTOS.ao.fuerza }, uSesgo: { value: EFECTOS.ao.sesgo }, uLejos: { value: EFECTOS.ao.lejos } }));
      M.aoSuave = material(FRAG_AO_SUAVE, { tAO: { value: null }, uTexel: { value: new THREE.Vector2() } });
      M.rayos = material(FRAG_RAYOS, { tEscena: { value: null }, tProf: { value: null }, uSol: { value: new THREE.Vector2() }, uCaida: { value: EFECTOS.rayos.caida } });
      M.dof = material(FRAG_DOF, Object.assign(prof(), { tEscena: { value: null }, uTexel: { value: new THREE.Vector2() }, uFoco: { value: 30 }, uRango: { value: EFECTOS.dof.rango }, uRadioD: { value: EFECTOS.dof.radio } }));
      M.final = material(FRAG_FINAL, { tEscena: { value: null }, tBloom: { value: null }, tExp: { value: null }, tAO: { value: blanco }, tRayos: { value: blanco }, tDof: { value: blanco }, uCine: { value: 0 }, uGrano: { value: 0 }, uT: { value: 0 }, uSomb: { value: new THREE.Vector3(1, 1, 1) }, uLuz: { value: new THREE.Vector3(1, 1, 1) }, uBloom: { value: A.bloom }, uExpo: { value: 1 }, uSat: { value: 1 }, uCon: { value: 1 }, uVin: { value: A.vineta }, uBal: { value: new THREE.Vector3(1, 1, 1) }, uAO: { value: 0 }, uRayos: { value: 0 }, uRayosCol: { value: A.rayosCol }, uDof: { value: 0 } });
      rtLum = rt(1, 1); rtExp = [rt(1, 1), rt(1, 1)];
    }
    $('juego').appendChild(renderer.domElement);
    redimensionar();
    return renderer;
  }

  /* precompilación en paralelo: three compila cada programa y espera a que termine antes de pasar al
     siguiente (unos 0,4 s cada uno en frío). Aquí se lanzan todos a la vez en un renderer de usar y tirar
     (KHR_parallel_shader_compile) sin esperar a ninguno; el compile() del renderer de verdad los encuentra
     después en la caché de programas del navegador. grupos: [{ escena, cam }] o [{ materiales, codificacion }]
     (materiales de pantalla completa; la codificación es la del destino en el que se dibujan). Añade los
     del posprocesado. Llama a prog(0..1) mientras espera. */
  async function precompilar(grupos, prog) {
    let r2;
    try { r2 = new THREE.WebGLRenderer({ canvas: document.createElement('canvas'), antialias: false, powerPreference: 'high-performance', stencil: false }); } catch (e) { return; }
    const gl = r2.getContext(), ext = r2.capabilities.isWebGL2 && gl.getExtension('KHR_parallel_shader_compile');
    if (!ext) { r2.dispose(); return; }
    // los ajustes que cambian el código de los shaders, iguales que en el principal
    r2.toneMapping = renderer.toneMapping; r2.physicallyCorrectLights = renderer.physicallyCorrectLights;
    r2.shadowMap.enabled = renderer.shadowMap.enabled; r2.shadowMap.type = renderer.shadowMap.type; r2.debug.checkShaderErrors = false;
    // three pide la lista de uniformes nada más enlazar (eso espera al compilador): este renderer no dibuja, así que no la necesita
    const leer = gl.getProgramParameter.bind(gl);
    gl.getProgramParameter = (p, k) => k === gl.ACTIVE_UNIFORMS || k === gl.ACTIVE_ATTRIBUTES ? 0 : leer(p, k);
    const geo = new THREE.PlaneGeometry(2, 2), camP = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const plano = mats => { const e = new THREE.Scene(); for (const m of mats) { const q = new THREE.Mesh(geo, m); q.frustumCulled = false; e.add(q); } return e; };
    try {
      for (const g of grupos.concat(hdr ? [{ materiales: Object.values(M) }] : [])) {
        r2.outputEncoding = g.codificacion !== undefined ? g.codificacion : renderer.outputEncoding;
        if (g.escena) r2.compile(g.escena, g.cam); else r2.compile(plano(g.materiales), camP);
      }
    } catch (e) { }
    const progs = r2.info.programs.map(q => q.program), t0 = performance.now();
    for (;;) {
      const listos = progs.filter(p => leer(p, ext.COMPLETION_STATUS_KHR)).length; if (prog) prog(listos / Math.max(1, progs.length));
      if (listos >= progs.length || gl.isContextLost() || performance.now() - t0 > 30000) break;
      await new Promise(r => setTimeout(r, 40));
    }
    geo.dispose(); r2.dispose(); r2.forceContextLoss();
  }

  function redimensionar() {
    const w = innerWidth, h = innerHeight, tope = PIX_MAX[AJUSTES.calidad] || PIX_MAX.alta;
    pr = Math.min(devicePixelRatio || 1, CAL.pr, Math.sqrt(tope / (w * h)));
    const e = ESCALAS[iEscala];
    renderer.setPixelRatio(hdr ? pr : pr * e); renderer.setSize(w, h);
    if (camera) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
    if (!hdr) return;
    const W = Math.max(1, Math.round(w * pr * e)), H = Math.max(1, Math.round(h * pr * e));
    if (rtEscena) rtEscena.dispose();
    const msaa = CAL.msaa | 0;
    rtEscena = msaa > 0 && THREE.WebGLMultisampleRenderTarget
      ? new THREE.WebGLMultisampleRenderTarget(W, H, { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true, stencilBuffer: false })
      : rt(W, H, { depthBuffer: true });
    if (rtEscena.isWebGLMultisampleRenderTarget) rtEscena.samples = msaa;
    // la profundidad queda en una textura (el antialias la copia al resolver) para la oclusión, los rayos y el desenfoque
    rtEscena.depthTexture = new THREE.DepthTexture(W, H, THREE.UnsignedIntType); rtEscena.depthTexture.format = THREE.DepthFormat;
    for (const r of [rtAO, rtAO2, rtRayos, rtDof]) if (r) r.dispose();
    const W2 = Math.max(1, W >> 1), H2 = Math.max(1, H >> 1);
    rtAO = CAL.ao ? rt(W2, H2) : null; rtAO2 = CAL.ao ? rt(W2, H2) : null;
    rtRayos = CAL.rayos ? rt(Math.max(1, W >> 2), Math.max(1, H >> 2)) : null;
    rtDof = rt(W2, H2);
    if (aguaRef) prepararCopia(W, H);
    for (const m of mips) m.dispose();
    mips = [];
    // el bloom empieza a 1/2 (alta) o 1/4 (media) de la resolución: el filtro de entrada es el paso más caro
    const ini = CAL.bloom || 1; let mw = Math.max(1, W >> ini), mh = Math.max(1, H >> ini);
    for (let i = 0; i < NIVELES_BLOOM + 1 - ini; i++) { mips.push(rt(mw, mh)); mw = Math.max(1, mw >> 1); mh = Math.max(1, mh >> 1); }
  }

  /* resolución dinámica: baja un paso si el fotograma se pasa del presupuesto
     de forma sostenida; sube con cautela y espera más tras cada intento fallido */
  function vigilar(ahora) {
    const dt0 = ahora - tPrev; tPrev = ahora;
    // las pausas de verdad (pestaña oculta, carga) no cuentan; un fotograma largo cuenta recortado: así un tirón
    // aislado apenas mueve la media, pero un equipo que va siempre lento sí se mide (antes se descartaba entero)
    if (dt0 <= 0 || dt0 > VIGILA.pausa || document.hidden || G.manual || G.estado === 'carga') return;
    const dt = Math.min(dt0, VIGILA.tope);
    ema += (dt - ema) * .05; tEval += dt0; tDesdeCambio += dt0;
    RES.ms = ema; RES.fps = 1000 / ema; RES.escala = ESCALAS[iEscala];
    if (tEval < 1000) return; tEval = 0;
    // en las cinemáticas la resolución no baja de EFECTOS.cine.escalaMin (ni de la de la calidad): se ve nítida
    const emin = A.cineObj > 0 ? Math.max(CAL.escalaMin, EFECTOS.cine.escalaMin) : CAL.escalaMin, minimo = ESCALAS.indexOf(emin) >= 0 ? ESCALAS.indexOf(emin) : ESCALAS.length - 1;
    if (iEscala > minimo) { iEscala = minimo; tDesdeCambio = 0; redimensionar(); return; }
    if (ema > OBJ_MS * 1.08) {
      if (++nMalos >= 2 && iEscala < minimo) {
        if (subio && tDesdeCambio < 5000) tSondeo = Math.min(tSondeo * 2, 64000); // la subida no aguantó
        iEscala++; nMalos = 0; tDesdeCambio = 0; subio = false; redimensionar();
      }
    } else {
      nMalos = 0;
      if (iEscala > 0 && ema < OBJ_MS * 1.02 && tDesdeCambio > tSondeo) { iEscala--; tDesdeCambio = 0; subio = true; redimensionar(); }
    }
  }

  let tAnt = 0;
  function dibujar() {
    const ahora = performance.now(), dtExp = tAnt ? Math.min(.1, (ahora - tAnt) / 1000) : 0; tAnt = ahora; vigilar(ahora);
    renderer.info.reset();
    if (!hdr) { renderer.toneMappingExposure = A.exposicion; renderer.setRenderTarget(null); renderer.render(scene, camera); return; }
    renderer.autoClear = true; renderer.setRenderTarget(rtEscena); renderer.render(scene, camera);
    renderer.autoClear = false;
    efectos(dtExp);
    // bloom: bajada con umbral y subida acumulativa
    let src = rtEscena;
    for (let i = 0; i < mips.length; i++) {
      // las tomas del filtro de entrada se separan en proporción si salta de golpe más de un nivel
      const m = i === 0 ? M.pre : M.baja, k = i === 0 ? (1 << ((CAL.bloom || 1) - 1)) : 1; m.uniforms.tEnt.value = src.texture; m.uniforms.uTexel.value.set(k / src.width, k / src.height);
      if (i === 0) { m.uniforms.uUmbral.value = A.umbral; m.uniforms.uRodilla.value = A.rodilla; }
      pase(m, mips[i]); src = mips[i];
    }
    for (let i = mips.length - 2; i >= 0; i--) {
      const s = mips[i + 1]; M.sube.uniforms.tEnt.value = s.texture; M.sube.uniforms.uTexel.value.set(1 / s.width, 1 / s.height);
      M.sube.uniforms.uPeso.value = 1; pase(M.sube, mips[i]);
    }
    // exposición automática (todo en GPU, sin leer píxeles)
    M.lum.uniforms.tEnt.value = rtEscena.texture; M.lum.uniforms.uDesp.value.set(Math.random(), Math.random()); pase(M.lum, rtLum);
    const a = rtExp[iExp], b = rtExp[1 - iExp]; iExp = 1 - iExp;
    const u = M.adapta.uniforms; u.tLum.value = rtLum.texture; u.tPrev.value = a.texture; u.uDt.value = dtExp;
    u.uClave.value = A.clave; u.uFuerza.value = A.adaptacion; u.uMin.value = A.expMin; u.uMax.value = A.expMax;
    pase(M.adapta, b);
    const f = M.final.uniforms;
    f.tEscena.value = rtEscena.texture; f.tBloom.value = mips[0].texture; f.tExp.value = b.texture;
    const CI = EFECTOS.cine; A.cine += (A.cineObj - A.cine) * Math.min(1, CI.vel * dtExp);
    f.uCine.value = A.cine; f.uGrano.value = CI.grano; f.uT.value = ahora / 1000; f.uSomb.value.fromArray(CI.sombras); f.uLuz.value.fromArray(CI.luces);
    f.uBloom.value = A.bloom; f.uExpo.value = A.exposicion; f.uCon.value = A.contraste * lerp(1, CI.contraste, A.cine); f.uVin.value = A.vineta + CI.vineta * A.cine;
    f.uSat.value = A.saturacion * lerp(1, A.satLugar, A.colorLugar); _bal.copy(_uno).lerp(A.balLugar, A.colorLugar); f.uBal.value.copy(A.balance).multiply(_bal);
    f.uAO.value = rtAO ? 1 : 0; f.tAO.value = rtAO ? rtAO.texture : blanco;
    f.tRayos.value = rtRayos ? rtRayos.texture : blanco; f.uDof.value = A.desenfoque; f.tDof.value = rtDof.texture;
    pase(M.final, null);
    renderer.autoClear = true;
  }

  /* reflejos en el agua: justo antes de dibujarla se copian el color y la profundidad de lo ya dibujado (sin el agua)
     y su shader busca en esa copia lo que refleja (faro, torii, árboles). Una copia por fotograma, sin volver a dibujar */
  function prepararCopia(W, H) {
    if (rtCopia) rtCopia.dispose();
    rtCopia = rt(W, H, { depthBuffer: true }); rtCopia.depthTexture = new THREE.DepthTexture(W, H, THREE.UnsignedIntType); rtCopia.depthTexture.format = THREE.DepthFormat;
    const prev = renderer.getRenderTarget(); renderer.setRenderTarget(rtCopia); renderer.setRenderTarget(prev);   // crea su framebuffer
    const u = aguaRef.material.uniforms; u.tCopia.value = rtCopia.texture; u.tCopiaProf.value = rtCopia.depthTexture;
  }
  function reflejos(agua) {
    if (!hdr || !CAL.reflejos || !renderer.capabilities.isWebGL2) return false;
    aguaRef = agua; const u = agua.material.uniforms;
    Object.assign(u, { tCopia: { value: null }, tCopiaProf: { value: null }, uProjAgua: { value: new THREE.Matrix4() }, uCerca: { value: .25 }, uLejosC: { value: 1500 } });
    agua.material.defines = Object.assign(agua.material.defines || {}, { SSR: 1 }); agua.material.needsUpdate = true;
    prepararCopia(rtEscena.width, rtEscena.height);
    agua.onBeforeRender = (r, esc, cam) => {
      if (esc !== scene || r.getRenderTarget() !== rtEscena) return;
      const gl = r.getContext(), P = r.properties, src = P.get(rtEscena), dst = P.get(rtCopia), fuente = src.__webglMultisampledFramebuffer || src.__webglFramebuffer;
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fuente); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dst.__webglFramebuffer);
      gl.blitFramebuffer(0, 0, rtEscena.width, rtEscena.height, 0, 0, rtCopia.width, rtCopia.height, gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT, gl.NEAREST);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fuente);
      u.uProjAgua.value.copy(cam.projectionMatrix); u.uCerca.value = cam.near; u.uLejosC.value = cam.far;
    };
    return true;
  }

  /* oclusión ambiental, rayos de sol y desenfoque, con la profundidad de la escena */
  function efectos(dt) {
    const prof = rtEscena.depthTexture, pi = camera.projectionMatrixInverse, P = camera.projectionMatrix.elements;
    if (rtAO) {
      const u = M.ao.uniforms, E = EFECTOS.ao; u.uRadio.value = E.radio; u.uFuerza.value = E.fuerza; u.uSesgo.value = E.sesgo; u.uLejos.value = E.lejos; u.tProf.value = prof; u.uProjInv.value.copy(pi); u.uTexel.value.set(1 / rtEscena.width, 1 / rtEscena.height); u.uEsc.value.set(P[0] * .5, P[5] * .5);
      pase(M.ao, rtAO2); M.aoSuave.uniforms.tAO.value = rtAO2.texture; M.aoSuave.uniforms.uTexel.value.set(1 / rtAO2.width, 1 / rtAO2.height); pase(M.aoSuave, rtAO);
    }
    // rayos: el sol en la pantalla; se apagan si queda detrás de la cámara
    M.final.uniforms.uRayos.value = 0;
    if (rtRayos && A.rayos > 0) {
      camera.getWorldDirection(_cd); const frente = A.solDir.dot(_cd);
      if (frente > 0) {
        _sol.copy(A.solDir).multiplyScalar(1000).add(camera.position).project(camera);
        const u = M.rayos.uniforms; u.uCaida.value = EFECTOS.rayos.caida; u.tEscena.value = rtEscena.texture; u.tProf.value = prof; u.uSol.value.set(_sol.x * .5 + .5, _sol.y * .5 + .5);
        pase(M.rayos, rtRayos); M.final.uniforms.uRayos.value = A.rayos * smooth(0, .35, frente);
      }
    }
    // desenfoque: entra y sale poco a poco (A.desenfoqueObj lo piden las cinemáticas y la portada)
    A.desenfoque += (A.desenfoqueObj - A.desenfoque) * Math.min(1, EFECTOS.dof.vel * dt);
    if (A.desenfoque > .01) {
      const u = M.dof.uniforms; u.uRango.value = EFECTOS.dof.rango; u.uRadioD.value = EFECTOS.dof.radio; u.tProf.value = prof; u.uProjInv.value.copy(pi); u.tEscena.value = rtEscena.texture; u.uTexel.value.set(1 / rtDof.width, 1 / rtDof.height); u.uFoco.value = Math.max(1, A.foco);
      pase(M.dof, rtDof);
    }
  }

  /* lectura de la luminancia media y la exposición (solo para pruebas y ajustes) */
  function depurar() {
    if (!hdr) return null;
    const h2f = h => { const s = h >> 15, e = (h >> 10) & 31, f = h & 1023; return (s ? -1 : 1) * (e ? Math.pow(2, e - 15) * (1 + f / 1024) : Math.pow(2, -14) * f / 1024); };
    const leer = t => { const b = new Uint16Array(4); renderer.readRenderTargetPixels(t, 0, 0, 1, 1, b); return h2f(b[0]); };
    return { lum: leer(rtLum), exposicion: leer(rtExp[iExp]), escala: ESCALAS[iEscala] };
  }

  return { crear, redimensionar, dibujar, depurar, precompilar, reflejos, ajustes: A, medida: RES, EFECTOS, get hdr() { return hdr; } };
})();
