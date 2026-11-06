/* === Ecos de Luz · 14-atmosfera.js ===
   Cielo físico (dispersión de Rayleigh, Mie y ozono precalculada en una tabla),
   nubes, estrellas y luna, perspectiva aérea y bruma baja para todos los materiales,
   sol y luna como luz principal con sombras estables, y luz ambiental del cielo (IBL).
   El momento del día depende del progreso (e: -1 noche · 0 alba · 1 día pleno).

   Nota de arquitectura: este módulo sustituye los trozos de niebla de three.js y
   engancha Material.prototype.onBeforeCompile para dar sus uniformes a todos los
   materiales. Un material con onBeforeCompile propio debe llamar a Atmosfera.inyectar(sh). */
"use strict";

const ENTORNO = { e: 0, interior: 0 };

const Atmosfera = (() => {
  /* ---------- datos ---------- */
  const E_SOL = 3.3, E_LUNA = .2, K_LUT = 3.2, AZ_SOL = -.75;
  const LUNA = { az: AZ_SOL + Math.PI * .85, elev: 38 };
  const LUNA_NARRATIVA = { dorada: [1.12, .82, .34], roja: [1.18, .1, .055], haloDorado: [.7, .44, .16], haloRojo: [.72, .08, .04], minimo: .85 };
  let lunaNarrativaAct = null;
  const ALT_NUBES = 1.6;            // km
  const BRUMA = { base: 1.5, caida: .11, frente: .5 };
  // halo del sol en la niebla: el brillo del cielo junto al sol viene de kilómetros de aire; lo que está más cerca
  // de "cerca" m no lo recibe (solo la luz del sol que dispersa la bruma) y lo que está más lejos de "lejos", entero
  const HALO = { cerca: 40, lejos: 450 };
  const HAZE_CAIDA = 1 / 180;
  const RAYOS_SOL = { fuerza: .38, mediodia: .55 };
  /* color de cada región (balance de blancos y saturación: pradera, Sakura, Kiri, dunas, Marea). Una región sin su
     fragmento se ve con 'sinFragmento' de saturación (y su suelo, con el color apagado: U.uRest); la pradera, según
     cuántos van. El color vuelve en 'vuelve' s.
     fragDe: el fragmento de cada región (orden de ST.frag: pétalo, duna, marea, escarcha) */
  const COLOR_REGION = {
    tinte: [[1.02, 1, .97], [1.04, .98, 1.02], [.95, .99, 1.06], [1.07, 1, .9], [.96, 1.01, 1.03]],
    sat: [1, 1.08, .94, 1.04, 1.05], sinFragmento: .9, vuelve: 3, fragDe: [null, 0, 3, 1, 2]
  };
  let fragColor = [false, false, false, false]; const colorReg = [0, 0, 0, 0, 0], _pr = [0, 0, 0, 0, 0];
  Bus.on('fragmentos', f => { fragColor = f.slice(); });   // intensidad de los rayos de sol al amanecer y cuánto bajan a mediodía
  const INTERIOR_SIN_SOMBRA = .97;  // dentro de una cueva el sol no llega: su mapa de sombras deja de dibujarse (~1 ms de GPU)
  // fases del día según el progreso; se interpolan
  const FASES = [
    { e: -1, elev: -9, mie: 1.2, cob: .4, dens: .8, haze: .0012, bruma: .0035, sat: .62, bal: [.86, .95, 1.18], amb: [.02, .03, .055], noche: 1, clave: .07, bloom: .2 },
    { e: 0, elev: 3.5, mie: 1.7, cob: .48, dens: .85, haze: .0017, bruma: .006, sat: .9, bal: [1.02, 1, .97], amb: [.2, .19, .25], noche: 0, clave: .16, bloom: .16 },
    { e: .5, elev: 14, mie: 1.35, cob: .42, dens: .75, haze: .0013, bruma: .0035, sat: .98, bal: [1.01, 1, .98], amb: [.36, .42, .55], noche: 0, clave: .2, bloom: .14 },
    { e: 1, elev: 36, mie: 1, cob: .36, dens: .7, haze: .0009, bruma: .0012, sat: 1.04, bal: [1, 1, 1], amb: [.45, .55, .72], noche: 0, clave: .22, bloom: .13 }
  ];
  /* cielo rojo (rediseño: desde la Noche Roja hasta el final), un segundo eje encima de la hora: color del cielo (la
     tabla pasa a su luminancia por este color: cielo, bruma, reflejos y luz ambiental a la vez), color e intensidad
     del sol, luz de la luna, color de la noche y de las nubes de noche (se encienden en carmesí), luz ambiental (hemisferio), más nubes, más bruma y perspectiva aérea, saturación, balance y clave de la exposición (más oscuro);
     entra: s que tarda en teñirse del todo; paso: cuánto debe cambiar para rehacer la tabla */
  const CIELO_ROJO = { cielo: [1.6, .36, .28], sol: [1.1, .42, .3], luz: .65, luna: [1, .42, .36], noche: [.05, .008, .006], nubesNoche: 4, amb: [1, .38, .34],
    nubes: { cob: .28, dens: .3 }, bruma: 1.4, haze: 1.3, sat: .88, bal: [1.03, .95, .95], clave: .8, entra: 25, paso: 1 / 256 };
  let rojoAct = 0, rojoTabla = NaN;
  /* nivel de rojo (0…1): con dt se acerca a k a la velocidad de 'entra'; sin dt, salta a k */
  function rojo(k, dt) { rojoAct = dt === undefined ? clamp(k, 0, 1) : rojoAct + clamp(k - rojoAct, -dt / CIELO_ROJO.entra, dt / CIELO_ROJO.entra); }

  /* ---------- uniformes compartidos por todos los materiales ---------- */
  const UA = {
    uCieloLUT: { value: null }, uLUTk: { value: 1 }, uSolDir: { value: new THREE.Vector3(0, 1, 0) }, uSolRad: { value: new THREE.Vector3() },
    uLuzDir: { value: new THREE.Vector3(0, 1, 0) }, uLuzCol: { value: new THREE.Vector3(1, 1, 1) }, uPenumbra: { value: 0 },
    uLunaDir: { value: new THREE.Vector3() }, uLunaK: { value: 0 }, uNoche: { value: 0 },
    uLunaColor: { value: new THREE.Vector3(.88, .9, 1) }, uLunaHalo: { value: new THREE.Vector3(.45, .55, .8) },
    uNubes: { value: new THREE.Vector4(.4, .8, 0, ALT_NUBES) }, uLuzNubes: { value: new THREE.Vector3() }, uLuzNubesDir: { value: new THREE.Vector3(0, 1, 0) },
    uRuido: { value: null }, uTiempo: U.uT,
    uAtm: { value: new THREE.Vector4(.002, HAZE_CAIDA, 1, 1) }, uBruma: { value: new THREE.Vector4(.005, BRUMA.caida, BRUMA.base, BRUMA.frente) },
    uMatCam: { value: new THREE.Matrix4() }, uEnvK: { value: 1 }
  };

  // Apariencia del disco y su halo; no activa el asedio ni tiñe el cielo entero.
  // null conserva exactamente la paleta de la campaña anterior; 0 dorada, 1 roja.
  function lunaNarrativa(k) {
    const valor = k === null ? null : clamp(k, 0, 1);
    if (valor === lunaNarrativaAct) return;
    lunaNarrativaAct = valor;
    if (valor === null) { UA.uLunaColor.value.set(.88, .9, 1); UA.uLunaHalo.value.set(.45, .55, .8); return; }
    const P = LUNA_NARRATIVA;
    UA.uLunaColor.value.set(...P.dorada).lerp(new THREE.Vector3(...P.roja), valor);
    UA.uLunaHalo.value.set(...P.haloDorado).lerp(new THREE.Vector3(...P.haloRojo), valor);
  }
  lunaNarrativa(1);

  /* ---------- GLSL compartido ---------- */
  THREE.ShaderChunk.atmosfera_pars = `
#ifndef ATM_PARS
#define ATM_PARS
uniform sampler2D uCieloLUT; uniform float uLUTk; uniform vec3 uSolDir; uniform vec3 uLuzDir; uniform vec3 uLuzCol;
uniform vec4 uAtm; uniform vec4 uBruma; uniform float uNoche;
const float A_PI = 3.14159265;
vec3 cieloLUT(vec3 d){
  vec2 sh = uSolDir.xz; float ls = length(sh); sh = ls > 1e-4 ? sh/ls : vec2(1., 0.);
  vec2 dh = d.xz; float ld = length(dh); dh = ld > 1e-4 ? dh/ld : sh;
  float u = acos(clamp(dot(dh, sh), -1., 1.))/A_PI;
  float lat = asin(clamp(d.y, -1., 1.));
  float v = .5 + .5*sign(lat)*sqrt(abs(lat)/(A_PI*.5));
  return texture2D(uCieloLUT, vec2(u, v)).rgb*uLUTk;
}
float faseHG(float mu, float g){ float g2 = g*g; return (1. - g2)/(4.*A_PI*pow(1. + g2 - 2.*g*mu, 1.5)); }
#endif`;
  THREE.ShaderChunk.atmosfera_nubes = `
#ifndef ATM_NUBES
#define ATM_NUBES
uniform sampler2D uRuido; uniform vec4 uNubes; uniform float uTiempo; uniform vec3 uLuzNubes; uniform vec3 uLuzNubesDir;
float densidadNube(vec2 p){
  vec2 v = vec2(uTiempo*.0042, uTiempo*.0017);
  float base = texture2D(uRuido, p*.031 + v*.25).a;
  float n = texture2D(uRuido, p*.11 + v).g*.5 + texture2D(uRuido, p*.29 - v*1.4).r*.3 + texture2D(uRuido, p*.83 + v*2.2).b*.2;
  float cob = uNubes.x + (base - .5)*.6;
  return smoothstep(1. - cob, 1.32 - cob, n*.72 + base*.28);
}
/* capa de nubes: color y opacidad vistos desde ro (m) en la dirección d */
vec4 nubes(vec3 ro, vec3 d, vec3 fondo){
  if (d.y < .012) return vec4(0.);
  float t = (uNubes.w - ro.y*.001)/d.y;
  vec2 p = ro.xz*.001 + d.xz*t;
  float de = densidadNube(p);
  if (de < .005) return vec4(0.);
  vec2 hs = uLuzNubesDir.xz/max(uLuzNubesDir.y, .1); hs /= max(1., length(hs));
  float od = (de*.5 + densidadNube(p + hs*.06) + .7*densidadNube(p + hs*.18))*uNubes.y*2.4;
  float mu = dot(d, uLuzNubesDir);
  float fase = (.7*faseHG(mu, .62) + .3*faseHG(mu, -.2))*4.*A_PI;
  vec3 amb = cieloLUT(vec3(0., 1., 0.))*1.5 + fondo*.25;
  vec3 col = uLuzNubes*exp(-od)*fase*(1. - exp(-de*4.))*1.15 + amb*(1. - .5*de);
  float a = (1. - exp(-de*uNubes.y*5.))*smoothstep(.012, .09, d.y);
  float lejos = 1. - exp(-t*.05);
  return vec4(mix(col, fondo, lejos*.85), a*(1. - lejos*.45));
}
/* versión barata para reflejos */
vec4 nubesReflejo(vec3 ro, vec3 d, vec3 fondo){
  if (d.y < .012) return vec4(0.);
  float t = (uNubes.w - ro.y*.001)/d.y; float de = densidadNube(ro.xz*.001 + d.xz*t);
  vec3 col = uLuzNubes*.6 + cieloLUT(vec3(0., 1., 0.))*1.5;
  float lejos = 1. - exp(-t*.05);
  return vec4(mix(col, fondo, lejos*.85), (1. - exp(-de*uNubes.y*4.))*smoothstep(.012, .09, d.y)*(1. - lejos*.45));
}
#endif`;
  // niebla: bruma baja y perspectiva aérea con el color del cielo; la niebla clásica
  // (cuevas, bajo el agua, ventisca) se suma encima
  const GLSL_NIEBLA = `
vec3 nieblaColor(vec3 c){
#ifdef TONE_MAPPING
  c = toneMapping(c);
#endif
  return linearToOutputTexel(vec4(c, 1.)).rgb;
}
uniform mat4 uMatCam;
vec3 aplicarNiebla(vec3 col){
  // posición de la cámara desde uMatCam: three no envía cameraPosition a los materiales Lambert (las hojas), y
  // allí valía (0,0,0): su niebla se medía desde el centro del mapa
  vec3 camN = uMatCam[3].xyz, rd = vNieblaW - camN; float dist = max(length(rd), 1e-3); rd /= dist;
  if (uAtm.z > 0.) {
    float dy = rd.y*dist, yc = camN.y;
    float k1 = uAtm.y, x1 = clamp(k1*dy, -80., 80.); float i1 = abs(x1) > 1e-3 ? (1. - exp(-x1))/x1 : 1.;
    float tH = exp(-uAtm.x*exp(-k1*max(yc, 0.))*dist*i1);
    float k2 = uBruma.y, x2 = clamp(k2*dy, -80., 80.); float i2 = abs(x2) > 1e-3 ? (1. - exp(-x2))/x2 : 1.;
    float tB = exp(-min(uBruma.x*exp(-k2*(yc - uBruma.z))*dist*i2, 30.));
    vec2 sh = normalize(uSolDir.xz + vec2(1e-5)); float lh = length(rd.xz);
    vec3 dLado = vec3(-sh.y*lh, rd.y, sh.x*lh), dN = normalize(mix(dLado, rd, smoothstep(${HALO.cerca.toFixed(1)}, ${HALO.lejos.toFixed(1)}, dist)));
    vec3 cH = cieloLUT(normalize(vec3(dN.x, max(dN.y, .02), dN.z)));
    vec3 cB = cH*1.08 + uLuzCol*faseHG(dot(rd, uLuzDir), .6)*uBruma.w;
    tH = mix(1., tH, uAtm.z); tB = mix(1., tB, uAtm.z);
    col = mix(nieblaColor(cB), col, tB);
    col = mix(nieblaColor(cH), col, tH);
  }
#ifdef FOG_EXP2
  float fl = 1. - exp(-fogDensity*fogDensity*fogDepth*fogDepth);
#else
  float fl = smoothstep(fogNear, fogFar, fogDepth);
#endif
  return mix(col, fogColor, fl*uAtm.w);
}`;
  THREE.ShaderChunk.fog_pars_vertex = '#ifdef USE_FOG\nvarying float fogDepth;\nvarying vec3 vNieblaW;\nuniform mat4 uMatCam;\n#endif';
  THREE.ShaderChunk.fog_vertex = '#ifdef USE_FOG\nfogDepth = - mvPosition.z;\nvNieblaW = (uMatCam * vec4(mvPosition.xyz, 1.)).xyz;\n#endif';
  THREE.ShaderChunk.fog_pars_fragment = '#ifdef USE_FOG\nuniform vec3 fogColor;\nvarying float fogDepth;\nvarying vec3 vNieblaW;\n#ifdef FOG_EXP2\nuniform float fogDensity;\n#else\nuniform float fogNear;\nuniform float fogFar;\n#endif\n#include <atmosfera_pars>\n' + GLSL_NIEBLA + '\n#endif';
  THREE.ShaderChunk.fog_fragment = '#ifdef USE_FOG\ngl_FragColor.rgb = aplicarNiebla(gl_FragColor.rgb);\n#endif';

  /* reflejo del cielo en superficies rugosas: desde esta rugosidad three ya lo lee del nivel más difuminado, que
     es casi la luz difusa del cielo; se reutiliza esa en vez de leer la textura otra vez (−10–15 % de GPU en
     las vistas con mucho suelo o piedra, sin diferencia visible) */
  const IBL_RUGOSO = .7;
  const RADIANCIA = 'radiance += getLightProbeIndirectRadiance( geometry.viewDir, geometry.normal, material.specularRoughness, maxMipLevel );';
  const MAPAS = THREE.ShaderChunk.lights_fragment_maps.includes(RADIANCIA)
    ? THREE.ShaderChunk.lights_fragment_maps.replace(RADIANCIA, `if ( material.specularRoughness < ${IBL_RUGOSO.toFixed(2)} ) ${RADIANCIA} else radiance += iblIrradiance * RECIPROCAL_PI;`)
    : '#include <lights_fragment_maps>';
  /* gancho global: uniformes compartidos y control de la luz ambiental del cielo */
  function inyectar(sh) {
    Object.assign(sh.uniforms, UA);
    if (sh.fragmentShader.includes('#include <lights_fragment_maps>'))
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uEnvK;')
        .replace('#include <lights_fragment_maps>', () => MAPAS + '\n#if defined( STANDARD ) && defined( USE_ENVMAP )\niblIrradiance *= uEnvK; radiance *= uEnvK;\n#endif');
  }
  THREE.Material.prototype.onBeforeCompile = function (sh) { inyectar(sh); };

  /* ---------- tabla del cielo (vista desde el suelo, relativa al sol) ---------- */
  const FRAG_LUT = `uniform vec3 uSol; uniform float uMieK; uniform vec3 uMulti; uniform vec3 uNocheCol; uniform float uE; uniform vec4 uRojo; varying vec2 vUv;
const float PI = 3.14159265, RG = 6360., RT = 6420., ALT = .15;
const vec3 BR = vec3(5.802e-3, 13.558e-3, 33.1e-3), BO = vec3(.65e-3, 1.881e-3, .085e-3);
const float BM = 3.996e-3, BMA = .444e-3;
vec2 esfera(vec3 o, vec3 d, float r){ float b = dot(o, d), c = dot(o, o) - r*r, h = b*b - c; if (h < 0.) return vec2(-1.); h = sqrt(h); return vec2(-b - h, -b + h); }
vec3 dens(float h){ return vec3(exp(-h/8.), exp(-h/1.2), max(0., 1. - abs(h - 25.)/15.)); }
vec3 ext(vec3 d){ return BR*d.x + vec3((BM + BMA)*uMieK*d.y) + BO*d.z; }
vec3 transSol(vec3 p){
  if (esfera(p, uSol, RG).x > 0.) return vec3(0.);
  float L = esfera(p, uSol, RT).y, ds = L/4.; vec3 od = vec3(0.);
  for (int i = 0; i < 4; i++) { vec3 q = p + uSol*ds*(float(i) + .5); od += ext(dens(length(q) - RG))*ds; }
  return exp(-od);
}
void main(){
  float az = vUv.x*PI, lv = vUv.y*2. - 1., lat = sign(lv)*lv*lv*PI*.5;
  vec3 sh = vec3(uSol.x, 0., uSol.z); sh = length(sh) > 1e-4 ? normalize(sh) : vec3(1., 0., 0.);
  vec3 sp = vec3(-sh.z, 0., sh.x);
  vec3 d = normalize(cos(lat)*(cos(az)*sh + sin(az)*sp) + vec3(0., sin(lat), 0.));
  vec3 o = vec3(0., RG + ALT, 0.);
  float tMax = esfera(o, d, RT).y, tg = esfera(o, d, RG).x; if (tg > 0.) tMax = tg;
  float mu = dot(d, uSol), pR = 3./(16.*PI)*(1. + mu*mu);
  const float g = .8; float pM = 3./(8.*PI)*((1. - g*g)*(1. + mu*mu))/((2. + g*g)*pow(1. + g*g - 2.*g*mu, 1.5));
  vec3 L = vec3(0.), T = vec3(1.); float t0 = 0.;
  for (int i = 0; i < 20; i++) {
    float t1 = tMax*pow((float(i) + 1.)/20., 2.), dt = t1 - t0, tm = .5*(t0 + t1); t0 = t1;
    vec3 p = o + d*tm, dn = dens(length(p) - RG), e = ext(dn);
    vec3 sR = BR*dn.x, sM = vec3(BM*uMieK*dn.y);
    vec3 sc = (sR*pR + sM*pM)*transSol(p) + (sR + sM)*uMulti;
    vec3 tr = exp(-e*dt);
    L += T*sc*(1. - tr)/max(e, vec3(1e-7)); T *= tr;
  }
  L = mix(L, vec3(dot(L, vec3(.3, .5, .2)))*uRojo.rgb, uRojo.a);   // cielo rojo: la luminancia, con su color
  gl_FragColor = vec4(L*uE + uNocheCol, 1.);
}`;
  const FRAG_CIELO = `uniform vec3 uSolRad; uniform vec3 uLunaDir; uniform float uLunaK; uniform vec3 uLunaColor; uniform vec3 uLunaHalo; varying vec3 vD;
#include <atmosfera_pars>
#include <atmosfera_nubes>
float azar3(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719)))*43758.5453); }
void main(){
  vec3 d = normalize(vD);
  vec3 col = cieloLUT(normalize(vec3(d.x, max(d.y, 0.) + 1e-4, d.z)));
  col *= mix(1., .55, smoothstep(0., -.25, d.y));
  if (uNoche > .01 && d.y > 0.) {
    vec3 q = d*240., c = floor(q), f = fract(q) - .5; float h = azar3(c);
    if (h > .984) {
      vec3 o = vec3(fract(h*13.1), fract(h*71.7), fract(h*37.3)) - .5;
      float b = pow((h - .984)/.016, 5.)*5. + .35, tw = .72 + .28*sin(uTiempo*(1.7 + h*4.) + h*90.);
      vec3 sc = mix(vec3(1., .8, .62), vec3(.72, .82, 1.), fract(h*91.));
      col += sc*b*tw*smoothstep(.3, .0, length(f - o*.4))*uNoche*smoothstep(0., .12, d.y);
    }
    // vía láctea: coordenadas a lo largo de la banda (2 repeticiones exactas, sin costura)
    vec3 eje = normalize(vec3(.35, .25, .9)), b1 = normalize(cross(eje, vec3(0., 1., 0.))), b2 = cross(eje, b1);
    float lon = atan(dot(d, b1), dot(d, b2))/(2.*A_PI)*2., la = dot(d, eje);
    float nv = texture2D(uRuido, vec2(lon, la*1.6)).g*texture2D(uRuido, vec2(lon*5., la*6.) + .37).r;
    col += vec3(.5, .56, .8)*exp(-la*la*14.)*nv*.07*uNoche*smoothstep(0., .2, d.y);
  }
  float ml = dot(d, uLunaDir), xl = (1. - ml)/1.4e-4;
  if (xl < 1.) col = mix(col, uLunaColor*(.6 + .4*texture2D(uRuido, (d.xz - uLunaDir.xz)*28. + .5).r)*uLunaK, smoothstep(1., .82, xl));
  col += uLunaHalo*uLunaK*.035*exp(-(1. - ml)*600.)*step(0., d.y);
  float mu = dot(d, uSolDir), xs = (1. - mu)/3.8e-5;
  if (xs < 1.) col += uSolRad*smoothstep(1., .86, xs)*(1. - .6*(1. - sqrt(1. - xs)))*24.*step(-.01, d.y);
  vec4 nu = nubes(cameraPosition, d, col); col = mix(col, nu.rgb, nu.a);
  gl_FragColor = vec4(col, 1.);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}`;

  /* ---------- transmitancia del sol en la CPU (color de la luz directa) ---------- */
  const RG = 6360, RT = 6420, BR = [5.802e-3, 13.558e-3, 33.1e-3], BO = [.65e-3, 1.881e-3, .085e-3], BM = 3.996e-3, BMA = .444e-3;
  function transmitancia(sy, mieK, out) {
    const y0 = RG + .15, cy = Math.max(sy, .012), cx = Math.sqrt(1 - cy * cy);
    const b = y0 * cy, t = -b + Math.sqrt(b * b - (y0 * y0 - RT * RT)), N = 40, ds = t / N;
    let r = 0, g = 0, bb = 0;
    for (let i = 0; i < N; i++) {
      const s = (i + .5) * ds, h = Math.hypot(cx * s, y0 + cy * s) - RG;
      const dR = Math.exp(-h / 8), dM = Math.exp(-h / 1.2) * (BM + BMA) * mieK, dO = Math.max(0, 1 - Math.abs(h - 25) / 15);
      r += (BR[0] * dR + dM + BO[0] * dO) * ds; g += (BR[1] * dR + dM + BO[1] * dO) * ds; bb += (BR[2] * dR + dM + BO[2] * dO) * ds;
    }
    out[0] = Math.exp(-r); out[1] = Math.exp(-g); out[2] = Math.exp(-bb); return out;
  }

  /* ---------- estado ---------- */
  let lutRT, lutEsc, lutCam, lutMat, cielo, escEnv, pmrem, envRT = null, sol, hemi;
  let eAct = NaN, envPend = true, tEnv = -1e9;
  const F = { cur: null }, T = [0, 0, 0], TN = [0, 0, 0];
  const _r = new THREE.Vector3(), _u = new THREE.Vector3(), _c = new THREE.Vector3();

  /* ---------- sombra de lo estático guardada ----------
     Terreno, vegetación y construcciones (capa CAPAS.estatica) se dibujan en un mapa de sombra aparte solo cuando
     hace falta: el centro de la sombra se movió, cambió el sol o cambiaron los trozos o la vegetación (evento
     'sombraEstatica'). Cada fotograma ese mapa se copia al de verdad con un cuadro a pantalla completa (capa
     CAPAS.copiaSombra) y encima se dibuja solo lo que se mueve. El centro de la sombra no sigue a Hikari paso a paso:
     se recoloca cuando ella se aleja SOMBRA.recentro m (así lo guardado sigue valiendo mientras tanto) */
  const SOMBRA = { recentro: 12 };
  let cacheRT = null, cacheValida = false, centroLuz = new THREE.Vector3(), copiaSombra = null, centroSombra = null, dirSombra = new THREE.Vector3();
  function prepararSombraGuardada() {
    const camEst = new THREE.Camera(), camDin = new THREE.Camera();
    camEst.layers.set(CAPAS.estatica); camDin.layers.set(0); camDin.layers.enable(CAPAS.copiaSombra);
    const prof = new THREE.ShaderMaterial({
      uniforms: { tCache: { value: null }, uTam: { value: new THREE.Vector2(CAL.sombra, CAL.sombra) } },
      vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader: `#include <packing>
uniform sampler2D tCache; uniform vec2 uTam;
void main(){ vec4 c = texture2D(tCache, gl_FragCoord.xy/uTam); gl_FragColor = c; gl_FragDepthEXT = unpackRGBAToDepth(c); }`
    });
    copiaSombra = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    copiaSombra.frustumCulled = false; copiaSombra.castShadow = true; copiaSombra.layers.set(CAPAS.copiaSombra); copiaSombra.customDepthMaterial = prof;
    scene.add(copiaSombra); scene.children.unshift(scene.children.pop());   // la copia va la primera: lo que se mueve se dibuja encima
    Bus.on('sombraEstatica', () => { cacheValida = false; });
    const sm = renderer.shadowMap, original = sm.render.bind(sm);
    sm.render = (luces, esc, cam) => {
      if (esc !== scene || !sm.enabled || (!sm.autoUpdate && !sm.needsUpdate)) return original(luces, esc, cam);
      const sh = sol.shadow;
      if (!sh.map) { sm.needsUpdate = true; original(luces, esc, camDin); }                 // la primera vez three crea el mapa
      if (!cacheRT) { cacheRT = sh.map.clone(); prof.uniforms.tCache.value = cacheRT.texture; }
      if (!cacheValida) { const real = sh.map; sh.map = cacheRT; sm.needsUpdate = true; original(luces, esc, camEst); sh.map = real; cacheValida = true; }
      sm.needsUpdate = true; original(luces, esc, camDin);
    };
  }
  const grado = d => d * Math.PI / 180;
  const dirDe = (az, elev, out) => out.set(Math.cos(elev) * Math.cos(az), Math.sin(elev), Math.cos(elev) * Math.sin(az)).normalize();

  function fase(e) {
    let k = 0; while (k < FASES.length - 2 && e > FASES[k + 1].e) k++;
    const A = FASES[k], B = FASES[k + 1], t = clamp((e - A.e) / (B.e - A.e), 0, 1), o = {};
    for (const q in A) o[q] = Array.isArray(A[q]) ? A[q].map((v, i) => lerp(v, B[q][i], t)) : lerp(A[q], B[q], t);
    return o;
  }

  function crear() {
    UA.uRuido.value = TEX.det; UA.uMatCam.value = camera.matrixWorld;
    const flot = renderer.capabilities.isWebGL2 && !!renderer.extensions.get('EXT_color_buffer_float');
    lutRT = new THREE.WebGLRenderTarget(256, 128, { type: flot ? THREE.HalfFloatType : THREE.UnsignedByteType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false });
    lutRT.texture.wrapS = lutRT.texture.wrapT = THREE.ClampToEdgeWrapping;
    UA.uCieloLUT.value = lutRT.texture; UA.uLUTk.value = flot ? 1 : 8;
    lutMat = new THREE.ShaderMaterial({
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: FRAG_LUT, depthTest: false, depthWrite: false, toneMapped: false,
      uniforms: { uSol: { value: new THREE.Vector3() }, uMieK: { value: 1 }, uMulti: { value: new THREE.Vector3() }, uNocheCol: { value: new THREE.Vector3() }, uE: { value: 1 }, uRojo: { value: new THREE.Vector4(1, 1, 1, 0) } }
    });
    lutEsc = new THREE.Scene(); lutCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lutMat); q.frustumCulled = false; lutEsc.add(q);

    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { uSolRad: UA.uSolRad, uLunaDir: UA.uLunaDir, uLunaK: UA.uLunaK, uLunaColor: UA.uLunaColor, uLunaHalo: UA.uLunaHalo },
      vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix*modelViewMatrix*vec4(position, 1.); gl_Position = p.xyww; }',
      fragmentShader: FRAG_CIELO
    });
    const geo = new THREE.SphereGeometry(900, 48, 24);
    // se dibuja después de lo opaco: la prueba de profundidad descarta el cielo tapado y no se sombrea
    cielo = new THREE.Mesh(geo, m); cielo.renderOrder = 1; cielo.frustumCulled = false; scene.add(cielo);
    escEnv = new THREE.Scene(); const ce = new THREE.Mesh(geo, m); ce.frustumCulled = false; escEnv.add(ce);
    pmrem = new THREE.PMREMGenerator(renderer);

    hemi = new THREE.HemisphereLight(0, 0, 1); scene.add(hemi);
    sol = new THREE.DirectionalLight(0xffffff, 1);
    sol.castShadow = CAL.sombra > 0;
    if (CAL.sombra) {
      sol.shadow.mapSize.set(CAL.sombra, CAL.sombra);
      const sc = sol.shadow.camera, R = CAL.sombraR; sc.left = -R; sc.right = R; sc.top = R; sc.bottom = -R; sc.near = 1; sc.far = 420;
      sol.shadow.bias = -.00035; sol.shadow.normalBias = .03;
    }
    scene.add(sol); scene.add(sol.target);
    if (CAL.sombra) prepararSombraGuardada();
    scene.fog = new THREE.FogExp2(0x000000, 0);
    aplicar(1, 0); regenerarEnv();
  }

  function regenerarLUT(f) {
    const u = lutMat.uniforms;
    u.uSol.value.copy(UA.uSolDir.value); u.uMieK.value = f.mie; u.uE.value = E_SOL * K_LUT / UA.uLUTk.value;
    const sy = Math.max(UA.uSolDir.value.y, 0), tw = smooth(-.16, .05, UA.uSolDir.value.y);
    transmitancia(Math.max(sy, .02), f.mie, TN);
    u.uMulti.value.set(TN[0], TN[1], TN[2]).multiplyScalar(.05 * tw);
    const r = f.rojo, N = CIELO_ROJO.noche;
    u.uNocheCol.value.set(lerp(.0025, N[0], r), lerp(.004, N[1], r), lerp(.009, N[2], r)).multiplyScalar(f.noche / UA.uLUTk.value);
    u.uRojo.value.set(CIELO_ROJO.cielo[0], CIELO_ROJO.cielo[1], CIELO_ROJO.cielo[2], r);
    const prev = renderer.getRenderTarget(); renderer.setRenderTarget(lutRT); renderer.render(lutEsc, lutCam); renderer.setRenderTarget(prev);
  }
  function regenerarEnv() {
    const nuevo = pmrem.fromScene(escEnv, 0, .1, 1000);
    scene.environment = nuevo.texture; if (envRT) envRT.dispose(); envRT = nuevo; envPend = false; tEnv = performance.now();
  }

  /* fija cielo, luces, niebla y aspecto para el progreso e y el factor de interior */
  function aplicar(e, interior) {
    ENTORNO.e = e; ENTORNO.interior = interior;
    if (e !== eAct || Math.abs(rojoAct - rojoTabla) >= CIELO_ROJO.paso || (rojoAct !== rojoTabla && (rojoAct === 0 || rojoAct === 1))) {
      eAct = e; rojoTabla = rojoAct; const f = F.cur = fase(e), R = CIELO_ROJO, r = f.rojo = smooth(0, 1, rojoAct);
      // cielo rojo: más nubes y bruma, menos saturación y balance cálido (encima de la hora)
      f.cob += R.nubes.cob * r; f.dens += R.nubes.dens * r; f.haze *= lerp(1, R.haze, r); f.bruma *= lerp(1, R.bruma, r); f.sat *= lerp(1, R.sat, r); f.clave *= lerp(1, R.clave, r);
      for (let i = 0; i < 3; i++) { f.bal[i] *= lerp(1, R.bal[i], r); f.amb[i] *= lerp(1, R.amb[i], r); }
      const es = grado(f.elev); dirDe(AZ_SOL, es, UA.uSolDir.value); dirDe(LUNA.az, grado(LUNA.elev), UA.uLunaDir.value);
      transmitancia(Math.sin(Math.max(es, grado(.5))), f.mie, T);
      for (let i = 0; i < 3; i++) T[i] *= lerp(1, R.sol[i] * R.luz, r);   // sol rojo y algo más débil
      const vs = smooth(grado(-2.2), grado(1.2), es), vl = smooth(grado(-3), grado(-7), es);
      UA.uSolRad.value.set(T[0], T[1], T[2]).multiplyScalar(E_SOL * vs);
      UA.uNoche.value = f.noche; UA.uLunaK.value = Math.max(lunaNarrativaAct === null ? .3 : LUNA_NARRATIVA.minimo, lerp(.3, 3.2, f.noche));
      const lu = [lerp(.62, R.luna[0], r), lerp(.72, R.luna[1], r), lerp(1, R.luna[2], r)];   // luz de la luna (roja con el cielo rojo)
      // luz principal: el sol de día y la luna de noche (se cruzan cuando ambas valen casi cero)
      if (es > grado(-2.5)) { UA.uLuzDir.value.copy(UA.uSolDir.value); UA.uLuzCol.value.copy(UA.uSolRad.value); }
      else { UA.uLuzDir.value.copy(UA.uLunaDir.value); UA.uLuzCol.value.set(lu[0], lu[1], lu[2]).multiplyScalar(E_LUNA * vl); }
      // luz que llega a las nubes: siguen iluminadas un poco después de ponerse el sol
      const vn = smooth(grado(-6), grado(0), es);
      if (vn > .01) { UA.uLuzNubesDir.value.copy(UA.uSolDir.value); UA.uLuzNubes.value.set(T[0], T[1], T[2]).multiplyScalar(E_SOL * vn); }
      else { UA.uLuzNubesDir.value.copy(UA.uLunaDir.value); UA.uLuzNubes.value.set(lu[0], lu[1], lu[2]).multiplyScalar(E_LUNA * 1.5 * vl * lerp(1, R.nubesNoche, r)); }
      UA.uNubes.value.set(f.cob, f.dens, 0, ALT_NUBES);
      UA.uAtm.value.x = f.haze; UA.uBruma.value.x = f.bruma;
      const A = Render.ajustes;
      A.saturacion = f.sat; A.balance.set(f.bal[0], f.bal[1], f.bal[2]); A.clave = f.clave; A.bloom = f.bloom;
      // rayos de sol: más fuertes con el sol bajo, suaves a mediodía y nada de noche; del color de la luz del sol
      UA.uPenumbra.value = 1 - smooth(-2, 14, f.elev);   // faroles que se notan en el suelo al amanecer y de noche
      A.solDir.copy(UA.uSolDir.value); A.rayos = RAYOS_SOL.fuerza * smooth(-1, 3, f.elev) * (1 - RAYOS_SOL.mediodia * smooth(12, 40, f.elev));
      const sr = UA.uSolRad.value, sm = Math.max(sr.x, sr.y, sr.z, 1e-6); A.rayosCol.set(sr.x / sm, sr.y / sm, sr.z / sm);
      regenerarLUT(f); envPend = true;
    }
    const f = F.cur, k = 1 - interior;
    sol.position.copy(UA.uLuzDir.value);
    const lc = UA.uLuzCol.value, li = Math.max(lc.x, lc.y, lc.z, 1e-6);
    sol.color.setRGB(lc.x / li, lc.y / li, lc.z / li); sol.intensity = li * (1 - interior * .97);
    // el hemisferio da luz de cielo a los materiales sin IBL y el rebote del suelo a todos
    hemi.color.setRGB(f.amb[0], f.amb[1], f.amb[2]).multiplyScalar(.45 * k);
    const sub = Math.max(UA.uLuzDir.value.y, 0) * .1 * k;
    hemi.groundColor.setRGB(.3 * lc.x * sub + f.amb[0] * .25 * k, .26 * lc.y * sub + f.amb[1] * .25 * k, .2 * lc.z * sub + f.amb[2] * .25 * k);
    hemi.intensity = 1;
    UA.uEnvK.value = 1 - interior * .9;
    renderer.shadowMap.autoUpdate = interior < INTERIOR_SIN_SOMBRA;
    scene.fog.color.setRGB(.01, .012, .02); scene.fog.density = .03 * interior;
  }

  /* color del lugar: mezcla de las regiones según dónde está la cámara, con el de las que ya recuperaron su fragmento */
  let tColor = performance.now();
  function colorLugar(x, z) {
    const ahora = performance.now(), dt = Math.min(.1, (ahora - tColor) / 1000); tColor = ahora;
    const C = COLOR_REGION, n = fragColor.filter(Boolean).length, w = pesos(x, z); for (let i = 0; i < 5; i++) _pr[i] = w[i];
    let sat = 0, rest = 0; const b = Render.ajustes.balLugar.set(0, 0, 0);
    for (let i = 0; i < 5; i++) {
      const obj = C.fragDe[i] === null ? n / 4 : fragColor[C.fragDe[i]] ? 1 : 0;
      colorReg[i] += (obj - colorReg[i]) * Math.min(1, dt / C.vuelve * 3);
      const k = colorReg[i], t = C.tinte[i];
      sat += _pr[i] * lerp(C.sinFragmento, C.sat[i], k); rest += _pr[i] * k;
      b.x += _pr[i] * lerp(1, t[0], k); b.y += _pr[i] * lerp(1, t[1], k); b.z += _pr[i] * lerp(1, t[2], k);
    }
    Render.ajustes.satLugar = sat; U.uRest.value = lerp(1, rest, Render.ajustes.colorLugar);   // en la intro y la portada, con todo su color
  }

  /* cada fotograma: sombras estables alrededor del jugador, cúpula y perspectiva aérea */
  function seguir(px, py, pz) {
    const L = UA.uLuzDir.value;
    _r.set(0, 1, 0).cross(L); if (_r.lengthSq() < 1e-6) _r.set(1, 0, 0); _r.normalize(); _u.copy(L).cross(_r).normalize();
    const tx = CAL.sombra ? CAL.sombraR * 2 / CAL.sombra : 1;
    if (!centroSombra || Math.hypot(px - centroSombra.x, pz - centroSombra.z) > SOMBRA.recentro || Math.abs(py - centroSombra.y) > SOMBRA.recentro || !dirSombra.equals(L)) {
      _c.set(px, py, pz); const a = _c.dot(_r), b = _c.dot(_u);
      _c.addScaledVector(_r, Math.round(a / tx) * tx - a).addScaledVector(_u, Math.round(b / tx) * tx - b);
      centroSombra = (centroSombra || new THREE.Vector3()).set(px, py, pz); dirSombra.copy(L); cacheValida = false; centroLuz.copy(_c);
    }
    // aplicar() mueve el sol cada fotograma: se vuelve a poner sobre el centro guardado (misma matriz, la sombra guardada sigue valiendo)
    sol.target.position.copy(centroLuz); sol.position.copy(centroLuz).addScaledVector(L, 200); sol.target.updateMatrixWorld();
    cielo.position.copy(camera.position);
    colorLugar(camera.position.x, camera.position.z);
    UA.uAtm.value.z = (1 - ENTORNO.interior) * (camera.position.y > NIVEL_AGUA - .15 ? 1 : 0);
    if (envPend && performance.now() - tEnv > 350) regenerarEnv();
  }

  return { crear, aplicar, seguir, inyectar, rojo, lunaNarrativa, UA, FASES, CIELO_ROJO, get nivelRojo() { return rojoAct; }, get aparienciaLunar() { return lunaNarrativaAct; } };
})();

function aplicarEntorno(e, interior) { Atmosfera.aplicar(e, interior); }
function seguirLuces(px, py, pz) { Atmosfera.seguir(px, py, pz); seguirAgua(); }
