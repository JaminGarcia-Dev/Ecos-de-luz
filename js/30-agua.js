/* === Ecos de Luz · 30-agua.js ===
   Superficie del agua (mar, lagos y ríos), separada de 02-terreno.js: una malla que sigue a la cámara con olas de
   Gerstner, reflejo del cielo, de las nubes y de lo que hay en pantalla (Render.reflejos), espuma en la orilla y
   hielo en Kiri. La altura del agua es NIVEL_AGUA (02-terreno.js). Se crea al arrancar (crearAgua) y se mueve con
   la cámara desde Atmosfera (seguirAgua). */
"use strict";

/* ---------- agua ----------
   Olas de Gerstner en los vértices, detalle con normales de ruido, reflejo del cielo
   y las nubes con Fresnel, brillo del sol o la luna, absorción según la profundidad
   (orilla transparente), espuma en la orilla y en las crestas, y hielo en Kiri.
   Color premultiplicado: el reflejo se suma y el cuerpo del agua tapa el fondo. */
let AGUA;
const AGUA_SEG = 180, AGUA_PASO = 1000 / AGUA_SEG;
/* las islas quedan fuera del mapa de profundidad: junto a su costa (distancia relativa a sus semiejes) el mar se calma
   como en la del continente; sin esto, las olas altas de mar abierto la rodean de espuma */
const AGUA_ISLA = { calma: [1.05, 1.6], amp: .3 };
function crearAgua() {
  const g = new THREE.PlaneGeometry(1000, 1000, AGUA_SEG, AGUA_SEG); g.rotateX(-Math.PI / 2);
  const m = new THREE.ShaderMaterial({
    transparent: true, fog: true, defines: { NISLAS: ISLAS.length, AMP_ISLA: AGUA_ISLA.amp.toFixed(3) },
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {}]),
    vertexShader: `
uniform float uT; uniform sampler2D tBio; uniform sampler2D tProf; uniform sampler2D tDet; uniform vec4 uIslas[NISLAS]; uniform vec2 uCalma;
varying vec3 vW; varying float vHi; varying float vProf; varying vec3 vNo; varying float vCresta;
#include <fog_pars_vertex>
void ola(vec2 dir, float lon, float incl, vec2 p, float amp, inout vec3 desp, inout vec3 tg, inout vec3 bn){
  float k = 6.28318/lon, c = sqrt(9.8/k), s = incl*amp, a = s/k;
  vec2 d = normalize(dir); float f = k*(dot(d, p) - c*uT), co = cos(f), se = sin(f);
  desp += vec3(d.x*a*co, a*se, d.y*a*co);
  tg += vec3(-d.x*d.x*s*se, d.x*s*co, -d.x*d.y*s*se);
  bn += vec3(-d.x*d.y*s*se, d.y*s*co, -d.y*d.y*s*se);
}
void main(){
  vec4 w = modelMatrix*vec4(position, 1.);
  float hi = 0., prof = 12.;
  #ifdef VERTEX_TEXTURES
  vec2 uvM = (w.xz + 500.)/1000.;
  hi = texture2D(tBio, uvM).r; prof = texture2D(tProf, uvM).r*12.;
  #endif
  float mar = smoothstep(330., 470., length(w.xz));
  for (int i = 0; i < NISLAS; i++) mar *= mix(AMP_ISLA, 1., smoothstep(uCalma.x, uCalma.y, length((w.xz - uIslas[i].xy)/uIslas[i].zw)));
  float amp = mix(.16, 1., mar)*(1. - smoothstep(.35, .55, hi))*smoothstep(.2, 4., prof);
  #ifdef VERTEX_TEXTURES
  amp *= mix(.45, 1.3, texture2D(tDet, w.xz*.0035).g);   // olas más altas o más bajas por zonas: desde lo alto no se ve una trama repetida
  #endif
  vec3 desp = vec3(0.), tg = vec3(1., 0., 0.), bn = vec3(0., 0., 1.);
  ola(vec2(1., .3), 38., .15, w.xz, amp, desp, tg, bn);
  ola(vec2(-.4, 1.), 26., .12, w.xz, amp, desp, tg, bn);
  ola(vec2(-.9, -.25), 61., .1, w.xz, amp*mar, desp, tg, bn);
  w.xyz += desp; vNo = normalize(cross(bn, tg)); vCresta = desp.y;
  vW = w.xyz; vHi = hi; vProf = prof;
  vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
  #include <fog_vertex>
}`,
    fragmentShader: `
uniform float uT; uniform sampler2D tDet; uniform sampler2D tBio;
varying vec3 vW; varying float vHi; varying float vProf; varying vec3 vNo; varying float vCresta;
#ifdef SSR
// reflejo en pantalla: el rayo reflejado avanza (pasos cada vez más largos) hasta pasar por detrás de lo dibujado
uniform sampler2D tCopia, tCopiaProf; uniform mat4 uProjAgua; uniform float uCerca, uLejosC;
float zVistaC(float d){ float z = d*2. - 1.; return 2.*uCerca*uLejosC/((uLejosC + uCerca) - z*(uLejosC - uCerca)); }
vec2 aPantalla(vec3 q){ vec4 c = uProjAgua*vec4(q, 1.); return c.xy/c.w*.5 + .5; }
vec4 reflejoPantalla(vec3 P, vec3 R){
  vec3 q = (viewMatrix*vec4(P, 1.)).xyz, rv = normalize((viewMatrix*vec4(R, 0.)).xyz);
  float paso = .35;
  for (int i = 0; i < 30; i++) {
    vec3 q1 = q + rv*paso; vec2 uv = aPantalla(q1);
    if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1. || q1.z > -uCerca) break;
    float zs = zVistaC(texture2D(tCopiaProf, uv).r), zq = -q1.z;
    if (zq > zs && zq - zs < paso*1.5 + .6) {
      vec3 a = q, b = q1;                                   // afina el punto entre el paso anterior y este
      for (int k = 0; k < 5; k++) { vec3 m = (a + b)*.5; vec2 um = aPantalla(m); if (-m.z > zVistaC(texture2D(tCopiaProf, um).r)) b = m; else a = m; }
      vec2 ub = aPantalla(b); vec2 bo = smoothstep(vec2(0.), vec2(.08), ub)*smoothstep(vec2(0.), vec2(.08), 1. - ub);
      return vec4(texture2D(tCopia, ub).rgb, bo.x*bo.y*(1. - float(i)/30.));
    }
    q = q1; paso *= 1.17;
  }
  return vec4(0.);
}
#endif
#include <atmosfera_pars>
#include <atmosfera_nubes>
#include <fog_pars_fragment>
vec3 detalle(vec2 p, float lejos){
  const float e = 1./512.;
  vec2 a = p*.06 + vec2(uT*.011, uT*.007), b = p*.17 - vec2(uT*.017, -uT*.012);
  float ha = texture2D(tDet, a).g, hb = texture2D(tDet, b).r;
  vec2 ga = vec2(texture2D(tDet, a + vec2(e, 0.)).g - ha, texture2D(tDet, a + vec2(0., e)).g - ha);
  vec2 gb = vec2(texture2D(tDet, b + vec2(e, 0.)).r - hb, texture2D(tDet, b + vec2(0., e)).r - hb);
  vec2 gr = (ga*9. + gb*6.)*(1. - lejos*.85);
  return vec3(-gr.x, 0., -gr.y);
}
void main(){
  vec3 vv = cameraPosition - vW; float dist = length(vv); vec3 v = vv/dist;
  float lejos = smoothstep(30., 280., dist);
  vec3 n = normalize(vNo + detalle(vW.xz, lejos));
  float ndv = dot(n, v); if (ndv < .02) { n = normalize(n + v*(.02 - ndv)); ndv = .02; }
  float F = .02 + .98*pow(1. - ndv, 5.);
  vec3 r = reflect(-v, n); r.y = abs(r.y) + .01; r = normalize(r);
  vec3 refl = cieloLUT(r);
  vec4 nu = nubesReflejo(cameraPosition, r, refl); refl = mix(refl, nu.rgb, nu.a);
  #ifdef SSR
  if (lejos < .75) { vec4 rp = reflejoPantalla(vW, reflect(-v, normalize(mix(vec3(0., 1., 0.), n, .3)))); refl = mix(refl, rp.rgb, rp.a*(1. - lejos/.75)); }   // a lo lejos, solo el cielo
  #endif
  vec3 h = normalize(uLuzDir + v); float nh = max(dot(n, h), 0.), nl = max(dot(n, uLuzDir), 0.);
  float ru = mix(.085, .2, lejos), a2 = ru*ru*ru*ru, dd = nh*nh*(a2 - 1.) + 1.;
  vec3 brillo = uLuzCol*(a2/(A_PI*dd*dd))*(.02 + .98*pow(1. - max(dot(v, h), 0.), 5.))*nl*.25;
  vec3 amb = cieloLUT(vec3(0., 1., 0.));
  vec3 cuerpo = vec3(.006, .032, .04)*(amb*2.5 + uLuzCol*max(uLuzDir.y, 0.)*.4);
  cuerpo += vec3(.03, .12, .09)*uLuzCol*pow(max(dot(v, -uLuzDir), 0.), 3.)*smoothstep(-.2, .9, vCresta)*.25;
  float aC = mix(1. - exp(-vProf*.5), 1., lejos*.8);
  float nE = texture2D(tDet, vW.xz*.23 + vec2(uT*.031, -uT*.021)).b;
  float orilla = (1. - smoothstep(0., 1.1, vProf))*smoothstep(.42, .72, nE + .35*sin(vProf*7. - uT*1.8));
  float esp = clamp(orilla + smoothstep(.55, 1.1, vCresta)*smoothstep(.5, .75, nE), 0., 1.)*(1. - vHi);
  vec3 col = cuerpo*aC*(1. - F) + refl*F + brillo;
  float a = aC*(1. - F) + F;
  col = mix(col, amb*1.3 + uLuzCol*max(uLuzDir.y, .05)*.9, esp*.85); a = max(a, esp*.85);
  // hielo de Kiri: azulado con vetas, nieve posada a manchas y grietas finas; es liso, así que refleja el cielo
  // con su propio Fresnel (normal hacia arriba) y da un brillo de sol estrecho
  float hi = smoothstep(.4, .58, texture2D(tBio, (vW.xz + 500.)/1000.).r);
  if (hi > 0.) {   // solo donde hay hielo (el mar no paga sus lecturas)
    float nieveH = smoothstep(.55, .75, texture2D(tDet, vW.xz*.013).g);
    vec3 hie = mix(vec3(.7, .83, .93), vec3(.88, .95, 1.), texture2D(tDet, vW.xz*.07).g);
    hie = mix(hie, vec3(.42, .58, .74), (1. - smoothstep(0., .018, abs(texture2D(tDet, vW.xz*.045).b - .5)))*.7*(1. - nieveH));
    hie = mix(hie, vec3(.93, .95, .98), nieveH*.85)*(amb*2.2 + uLuzCol*max(uLuzDir.y, 0.)*1.1);
    float Fh = (.03 + .32*pow(1. - max(v.y, 0.), 5.))*(1. - nieveH*.8);   // hielo algo rugoso: refleja menos que el agua
    vec3 rH = vec3(-v.x, abs(v.y) + .01, -v.z), hH = normalize(uLuzDir + v);
    hie = hie*(1. - Fh) + cieloLUT(normalize(rH))*vec3(.8, .92, 1.)*Fh + uLuzCol*pow(max(hH.y, 0.), 400.)*1.5*(1. - nieveH);
    col = mix(col, hie, hi); a = mix(a, 1., hi);
  }
  gl_FragColor = vec4(col, clamp(a, 0., 1.));
  #include <tonemapping_fragment>
  #include <encodings_fragment>
  #ifdef USE_FOG
  gl_FragColor.rgb = aplicarNiebla(gl_FragColor.rgb/max(gl_FragColor.a, 1e-3))*gl_FragColor.a;
  #endif
}`
  });
  Object.assign(m.uniforms, { uIslas: { value: ISLAS.map(I => new THREE.Vector4(I.x, I.z, I.rx, I.rz)) }, uCalma: { value: new THREE.Vector2(...AGUA_ISLA.calma) }, uT: U.uT, tDet: U.tDet, tBio: U.tBio, tProf: U.tProf });
  AGUA = new THREE.Mesh(g, m); AGUA.frustumCulled = false; AGUA.renderOrder = 2; scene.add(AGUA);
  Render.reflejos(AGUA);   // en alta y media: refleja lo que hay en pantalla (faro, torii, árboles)
}
/* la malla sigue a la cámara en saltos de una celda para que las olas no "naden" */
function seguirAgua() {
  AGUA.position.set(Math.round(camera.position.x / AGUA_PASO) * AGUA_PASO, NIVEL_AGUA, Math.round(camera.position.z / AGUA_PASO) * AGUA_PASO);
}
