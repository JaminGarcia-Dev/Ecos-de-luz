/* === Ecos de Luz · 15-texturas.js ===
   Texturas procedurales generadas en la GPU al arrancar (sin archivos):
   · SUELO: dos arrays de capas repetibles de 512 px.
       A = color (sRGB) + rugosidad · B = normal (xy) + altura + oclusión.
     Capas: hierba, musgo, tierra, roca, nieve, arena, barro, arenisca, corteza, cortezaPino y, para las
     construcciones, tablas de madera, sillar, teja y enlucido. medio[i]: color lineal medio de cada capa.
   · HOJAS: atlas 2×2 con alfa (hojas anchas, flor de cerezo, agujas de pino, hojas largas).
   Cada capa se dibuja en un render target, se lee y se sube como DataTexture2DArray con mipmaps. */
"use strict";

const Texturas = (() => {
  const N = 512, N_HOJAS = 1024;
  const CAPAS = ['hierba', 'musgo', 'tierra', 'roca', 'nieve', 'arena', 'barro', 'arenisca', 'corteza', 'cortezaPino', 'tablas', 'sillar', 'teja', 'enlucido'];
  const CAPA = {}; CAPAS.forEach((c, i) => CAPA[c] = i);
  // relieve de la normal por capa (más alto = más marcado)
  const RELIEVE = [9, 8, 12, 16, 5, 6, 8, 14, 14, 13, 9, 13, 12, 4];
  const ATLAS = { anchas: [0, 0], flor: [1, 0], agujas: [0, 1], largas: [1, 1] }; // celda (x, y) del atlas

  const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
  /* ruido periódico: todo se repite exactamente en [0,1) para que las texturas no tengan costuras */
  const GLSL_RUIDO = `
const float TAU = 6.28318530718;
/* siempre 0 (no se asigna): con él el número de vueltas deja de ser constante y el compilador de D3D no
   desenrolla los bucles; compilar estos shaders en frío pasa de segundos a décimas */
uniform int uCero;
vec2 h22(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p)*43758.5453); }
float h21(vec2 p){ return fract(sin(dot(p, vec2(41.7, 289.3)))*43758.5453); }
float gn(vec2 x, vec2 P){
  vec2 i = floor(x), f = fract(x), u = f*f*f*(f*(f*6. - 15.) + 10.);
  vec2 a = h22(mod(i, P))*2. - 1., b = h22(mod(i + vec2(1., 0.), P))*2. - 1.;
  vec2 c = h22(mod(i + vec2(0., 1.), P))*2. - 1., d = h22(mod(i + vec2(1.), P))*2. - 1.;
  return 1.4*mix(mix(dot(a, f), dot(b, f - vec2(1., 0.)), u.x), mix(dot(c, f - vec2(0., 1.)), dot(d, f - vec2(1.)), u.x), u.y);
}
float fbm(vec2 uv, vec2 P, int o){ float s = 0., a = .5, n = 0.; for (int i = 0; i < o + uCero; i++) { s += a*gn(uv*P, P); n += a; a *= .5; P *= 2.; } return s/n; }
float rid(vec2 uv, vec2 P, int o){ float s = 0., a = .5, n = 0.; for (int i = 0; i < o + uCero; i++) { s += a*(1. - abs(gn(uv*P, P))); n += a; a *= .5; P *= 2.; } return s/n; }
/* celdas de Worley: xy = vector al punto más cercano, z = F1, w = id de la celda; F2 aparte */
vec4 wor(vec2 uv, vec2 P, out float f2){
  vec2 x = uv*P, i = floor(x), f = fract(x); float d1 = 9., d2 = 9., id = 0.; vec2 v1 = vec2(0.);
  for (int y = -1; y <= 1 + uCero; y++) for (int k = -1; k <= 1 + uCero; k++) {
    vec2 g = vec2(float(k), float(y)), c = mod(i + g, P), o = h22(c + 17.3), v = g + o - f;
    float d = length(v);
    if (d < d1) { d2 = d1; d1 = d; v1 = v; id = h21(c); } else if (d < d2) d2 = d;
  }
  f2 = d2; return vec4(v1, d1, id);
}
vec3 L(vec3 c){ return pow(c, vec3(2.2)); }
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }`;

  /* superficies: altura h (0..1), color lineal y rugosidad */
  const FRAG_SUELO = `uniform float uPase; varying vec2 vUv;
${GLSL_RUIDO}
void superficie(int t, vec2 uv, out float h, out vec3 col, out float rug){
  float f2;
  if (t == 0) {            // hierba: matas y briznas en cuatro orientaciones
    vec4 w = wor(uv, vec2(10.), f2); float mata = smoothstep(.85, .15, w.z);
    float o = floor(w.w*4.);
    vec2 q = o < 1. ? uv : o < 2. ? uv.yx : o < 3. ? vec2(uv.x + uv.y, uv.x - uv.y) : vec2(uv.x - uv.y, uv.x + uv.y);
    float br = pow(1. - abs(gn(vec2(q.x*96., q.y*12.), vec2(96., 12.))), 5.);
    float br2 = pow(1. - abs(gn(vec2(q.y*80., q.x*10.) + 7.1, vec2(80., 10.))), 6.);
    float b = max(br, br2*.8), seco = smoothstep(.1, .6, fbm(uv, vec2(3.), 3));
    h = .25 + .35*mata + .4*b*(.5 + .5*mata) + .06*fbm(uv, vec2(32.), 3);
    vec3 hoja = mix(vec3(.2, .34, .08), vec3(.44, .55, .15), b*.6 + .4*h21(floor(uv*128.)));
    hoja = mix(hoja, vec3(.56, .52, .26), seco*.45);
    col = L(mix(vec3(.12, .1, .06), hoja, smoothstep(.22, .55, h)));
    rug = .88;
  } else if (t == 1) {     // musgo del bosque con pétalos y hojarasca
    vec4 w = wor(uv, vec2(14.), f2); float cojin = smoothstep(.9, .1, w.z);
    float fino = fbm(uv, vec2(64.), 4)*.5 + .5;
    h = .25 + .45*cojin + .25*fino;
    vec3 c = mix(vec3(.13, .1, .07), mix(vec3(.2, .28, .1), vec3(.38, .45, .16), fino), smoothstep(.2, .55, h));
    vec4 p = wor(uv, vec2(26.), f2); vec2 d = rot(p.w*44.)*p.xy;
    float e = length(d/vec2(.34, .19));
    if (e < 1. && p.w < .42) { c = p.w < .3 ? mix(vec3(.96, .74, .82), vec3(1., .88, .92), fract(p.w*17.)) : vec3(.46, .3, .17); h += .12*(1. - e); }
    col = L(c); rug = .85;
  } else if (t == 2) {     // tierra de camino con guijarros
    vec4 p = wor(uv, vec2(18.), f2); float r = .16 + .16*fract(p.w*7.3);
    float g = smoothstep(r, r*.55, p.z)*step(.68, p.w);
    float s = fbm(uv, vec2(24.), 5)*.5 + .5;
    h = .22 + .25*s + .55*g*sqrt(max(0., 1. - p.z*p.z/(r*r)));
    vec3 cs = mix(vec3(.36, .28, .19), vec3(.52, .42, .3), s), cg = mix(vec3(.36, .33, .29), vec3(.52, .48, .42), fract(p.w*13.1));
    col = L(mix(cs*(.9 + .2*(gn(uv*160., vec2(160.))*.5 + .5)), cg, g)); rug = mix(.95, .72, g);
  } else if (t == 3) {     // roca: fracturas irregulares (Worley deformado), erosión y líquenes
    vec2 wa = vec2(fbm(uv, vec2(4.), 4), fbm(uv + .37, vec2(4.), 4))*.09;
    float g = fbm(uv, vec2(5.), 6); vec4 w = wor(uv + wa, vec2(4.), f2);
    float gr = mix(1., smoothstep(0., .07, f2 - w.z), step(.35, fract(w.w*5.3 + g*.3)));  // solo algunas fracturas
    float f2b; vec4 w2 = wor(uv + wa*1.6, vec2(13.), f2b); float gr2 = mix(1., smoothstep(0., .04, f2b - w2.z), .55);
    float det = fbm(uv, vec2(48.), 5), cap = rid(uv + wa, vec2(9., 3.), 4);
    h = .5 + .25*g + .1*det + .12*cap - .32*(1. - gr) - .1*(1. - gr2);
    vec3 b = mix(vec3(.38, .38, .39), vec3(.6, .58, .55), .5 + .5*g)*(.82 + .3*(.5 + .5*det));
    b = mix(b, vec3(.5, .45, .38), smoothstep(.1, .6, fbm(uv + 1.9, vec2(3.), 3))*.35);
    float liq = smoothstep(.6, .8, fbm(uv + 3.7, vec2(12.), 4)*.5 + .5)*gr;
    b = mix(b, vec3(.62, .6, .4), liq*.4);
    col = L(b)*mix(.45, 1., gr*gr2); rug = .8 - .1*liq;
  } else if (t == 4) {     // nieve con surcos de viento
    float sas = rid(uv, vec2(3., 12.), 4), su = fbm(uv, vec2(8.), 5)*.5 + .5;
    h = .4 + .3*sas + .3*su;
    col = L(mix(vec3(.8, .85, .93), vec3(.95, .97, 1.), su)); rug = .5 + .25*su;
  } else if (t == 5) {     // arena con rizos
    float wa = fbm(uv, vec2(3.), 3), riz = .5 + .5*sin((uv.y*22. + wa*1.6 + .15*sin(uv.x*TAU*3.))*TAU);
    float gra = gn(uv*256., vec2(256.))*.5 + .5;
    h = .3 + .4*pow(riz, 1.6) + .12*(fbm(uv, vec2(16.), 3)*.5 + .5) + .06*gra;
    col = L(mix(vec3(.74, .6, .41), vec3(.88, .77, .56), riz*.45 + .25*gra + .2*(wa*.5 + .5))); rug = .93;
  } else if (t == 6) {     // barro de orilla con charcos y grava
    vec4 p = wor(uv, vec2(22.), f2); float g = smoothstep(.3, .15, p.z)*step(.55, p.w);
    float s = fbm(uv, vec2(12.), 5)*.5 + .5, ch = smoothstep(.43, .34, s);
    h = .25 + .5*s + .3*g - .15*ch;
    vec3 c = mix(vec3(.24, .2, .14), vec3(.37, .32, .22), s); c = mix(c, vec3(.5, .48, .44), g);
    col = L(c)*mix(1., .55, ch); rug = mix(.9, .2, ch);
  } else if (t == 7) {     // arenisca en estratos
    float wa = fbm(uv, vec2(4.), 4), capa = uv.y*7. + wa*.6, ba = fract(capa), er = rid(uv, vec2(8.), 5);
    h = .3 + .35*smoothstep(0., .15, ba)*smoothstep(1., .75, ba) + .35*er;
    float sel = h21(vec2(mod(floor(capa), 7.), 3.));
    col = L(mix(mix(vec3(.7, .42, .27), vec3(.85, .61, .41), sel), vec3(.58, .34, .22), er*.45)); rug = .88;
  } else if (t == 8) {     // corteza de hoja ancha: fibras, grietas y lenticelas
    float fib = rid(uv, vec2(14., 3.), 5), gr = smoothstep(.36, .18, gn(uv*vec2(10., 2.), vec2(10., 2.))*.5 + .5);
    float len = smoothstep(.93, 1., .5 + .5*sin(uv.y*TAU*24. + fbm(uv, vec2(4.), 2)*3.))*step(.55, gn(uv*vec2(6., 24.), vec2(6., 24.))*.5 + .5);
    h = .3 + .5*fib - .3*gr - .1*len;
    col = L(mix(vec3(.26, .21, .17), vec3(.46, .39, .31), fib))*mix(1., .45, gr)*(1. - .25*len); rug = .9;
  } else if (t == 10) {    // tablas de madera: seis hileras, juntas, vetas y algún nudo
    float fy = uv.y*6., fila = mod(floor(fy), 6.), ly = fract(fy), off = h21(vec2(fila, 3.)), lx = uv.x*2. + off, id = mod(floor(lx), 2.) + fila*2., px = fract(lx);
    float junta = smoothstep(0., .05, ly)*smoothstep(1., .95, ly)*smoothstep(0., .012, px)*smoothstep(1., .988, px);
    float veta = gn(uv*vec2(2., 96.) + vec2(id*.37, 0.), vec2(2., 96.))*.5 + .5, fino = gn(uv*vec2(4., 384.), vec2(4., 384.))*.5 + .5;
    vec4 kn = wor(uv, vec2(5., 7.), f2); float nudo = smoothstep(.12, .02, kn.z)*step(.82, kn.w);
    float tono = h21(vec2(id, 9.)), anillo = .5 + .5*sin((veta*6. + kn.z*14.*nudo)*TAU);
    h = .55 + .18*veta + .08*fino - .45*(1. - junta) - .1*nudo;
    vec3 c = mix(vec3(.4, .27, .16), vec3(.6, .44, .28), tono*.6 + veta*.4)*(.85 + .15*anillo)*(.9 + .1*fino);
    col = L(c)*mix(.35, 1., junta)*(1. - .45*nudo); rug = .72;
  } else if (t == 11) {    // sillar: hiladas de bloques escuadrados, juntas de mortero y desconchones
    float fy = uv.y*4., fila = mod(floor(fy), 4.), ly = fract(fy), off = mod(fila, 2.)*.5 + h21(vec2(fila, 1.))*.2, lx = uv.x*3. + off, id = mod(floor(lx), 3.) + fila*3., px = fract(lx);
    float bord = min(min(ly, 1. - ly), min(px, 1. - px)*.33*4.), junta = smoothstep(.015, .05, bord);
    float det = fbm(uv, vec2(24.), 5)*.5 + .5, gol = rid(uv, vec2(12.), 3), tono = h21(vec2(id, 5.));
    vec4 w = wor(uv, vec2(9.), f2); float desc = smoothstep(.18, .08, w.z)*step(.75, w.w);
    h = .25 + .45*junta*smoothstep(.05, .14, bord) + .15*det + .1*gol - .15*desc;
    vec3 c = mix(vec3(.46, .44, .4), vec3(.64, .61, .56), tono)*(.85 + .25*det);
    col = L(mix(vec3(.3, .29, .27), c, junta))*(1. - .2*desc); rug = mix(.95, .82, junta);
  } else if (t == 12) {    // teja curva (kawara): canales a lo largo de v, hileras solapadas
    float cx = uv.x*8., fx = fract(cx), cid = mod(floor(cx), 8.), fy = uv.y*10., ly = fract(fy), rid2 = mod(floor(fy), 10.);
    float perfil = sin(fx*3.14159), borde = smoothstep(0., .12, ly), tono = h21(vec2(cid, rid2));
    h = .2 + .6*perfil*(.75 + .25*borde) + .05*(fbm(uv, vec2(32.), 3)*.5 + .5);
    vec3 c = mix(vec3(.5, .52, .56), vec3(.68, .7, .73), tono)*(.75 + .35*perfil)*mix(.55, 1., borde);
    col = L(c)*mix(.35, 1., smoothstep(.0, .18, fx)*smoothstep(1., .82, fx)); rug = .55 + .2*tono;
  } else if (t == 13) {    // enlucido de cal: grano fino, manchas de lluvia y grietas finas
    float g = fbm(uv, vec2(48.), 4)*.5 + .5, man = fbm(uv, vec2(3., 1.), 4)*.5 + .5, gri = smoothstep(.97, 1., rid(uv, vec2(6.), 4));
    h = .5 + .12*g - .25*gri;
    col = L(vec3(.8, .78, .74)*(.92 + .1*g)*(1. - .12*smoothstep(.55, .8, man)))*(1. - .4*gri); rug = .9;
  } else {                 // corteza de pino en placas
    vec4 w = wor(uv, vec2(6., 3.), f2); float pl = smoothstep(0., .12, f2 - w.z), det = fbm(uv, vec2(24., 8.), 4)*.5 + .5;
    h = .25 + .5*pl + .25*det;
    col = L(mix(vec3(.3, .17, .11), vec3(.52, .32, .2), fract(w.w*7.)*.6 + det*.4))*mix(.35, 1., pl); rug = .88;
  }
}
void main(){
  float h, rug; vec3 col;
  superficie(TIPO, vUv, h, col, rug);
  gl_FragColor = uPase < .5 ? vec4(pow(col, vec3(1./2.2)), rug) : vec4(h, 0., 0., 1.);
}`;
  /* normal (diferencias centrales) y oclusión (altura frente a su entorno) a partir de la altura */
  const FRAG_NORMAL = `uniform sampler2D tAltura; uniform float uRelieve; varying vec2 vUv;
float H(vec2 o){ return texture2D(tAltura, vUv + o/${N}.).r; }
void main(){
  float h = H(vec2(0.));
  vec3 n = normalize(vec3((H(vec2(-1., 0.)) - H(vec2(1., 0.)))*.5*uRelieve, (H(vec2(0., -1.)) - H(vec2(0., 1.)))*.5*uRelieve, 1.));
  float m = (H(vec2(6., 0.)) + H(vec2(-6., 0.)) + H(vec2(0., 6.)) + H(vec2(0., -6.)) + H(vec2(4.)) + H(vec2(-4.)) + H(vec2(4., -4.)) + H(vec2(-4., 4.)))/8.;
  gl_FragColor = vec4(n.xy*.5 + .5, h, clamp(1. - (m - h)*2.4, .35, 1.));
}`;

  /* atlas de hojas: cada celda es un racimo con alfa; los huecos llevan el color medio (sin halos al filtrar) */
  const FRAG_HOJAS = `varying vec2 vUv;
${GLSL_RUIDO}
float ramita(vec2 t, vec2 a, vec2 b, float w){ vec2 pa = t - a, ba = b - a; float hh = clamp(dot(pa, ba)/dot(ba, ba), 0., 1.); return smoothstep(w, w*.4, length(pa - ba*hh)); }
vec4 anchas(vec2 t){
  vec4 r = vec4(.3, .45, .14, 0.);
  for (int k = 0; k < 3 + uCero; k++) { float fk = float(k); vec2 e = vec2(.5, .5) + (h22(vec2(fk, 9.)) - .5)*.8; if (ramita(t, vec2(.5, .05), e, .008) > .5) r = vec4(.33, .24, .16, 1.); }
  for (int k = 0; k < 46 + uCero; k++) {
    float fk = float(k); vec2 c = vec2(.5) + (h22(vec2(fk, 1.3)) - .5)*.74;
    float len = .13 + .07*h21(vec2(fk, 2.2)), an = h21(vec2(fk, 7.1))*TAU;
    vec2 d = rot(an)*(t - c); float x = d.x/len; if (x < 0. || x > 1.) continue;
    float hw = len*.36*pow(sin(3.14159*x), .75)*(1. - .2*x); if (abs(d.y) > hw) continue;
    float ay = abs(d.y)/hw;
    float vena = smoothstep(.07, 0., ay) + .45*smoothstep(.06, 0., abs(fract(x*7. - ay*1.6) - .5));
    vec3 c0 = mix(vec3(.24, .42, .1), vec3(.46, .62, .18), h21(vec2(fk, 5.)));
    c0 *= .78 + .22*(1. - ay*ay); c0 = mix(c0, c0*1.3 + .04, clamp(vena, 0., 1.)*.5);
    r = vec4(c0, 1.);
  }
  return r;
}
vec4 flor(vec2 t){
  vec4 r = vec4(.95, .78, .84, 0.);
  for (int k = 0; k < 3 + uCero; k++) { float fk = float(k); vec2 e = vec2(.5) + (h22(vec2(fk, 4.)) - .5)*.85; if (ramita(t, vec2(.5, .02), e, .01) > .5) r = vec4(.3, .2, .15, 1.); }
  for (int k = 0; k < 8 + uCero; k++) {
    float fk = float(k); vec2 c = vec2(.5) + (h22(vec2(fk, 6.6)) - .5)*.7; float len = .1;
    vec2 d = rot(h21(vec2(fk, 3.))*TAU)*(t - c); float x = d.x/len;
    if (x > 0. && x < 1. && abs(d.y) < len*.3*sin(3.14159*x)) r = vec4(.32, .5, .16, 1.);
  }
  for (int k = 0; k < 58 + uCero; k++) {
    float fk = float(k); vec2 c = vec2(.5) + (h22(vec2(fk, 2.7)) - .5)*.8;
    float s = .05 + .032*h21(vec2(fk, 8.)), ro = h21(vec2(fk, 1.1))*TAU;
    vec2 d = t - c; float rr = length(d)/s, th = atan(d.y, d.x) + ro;
    float pe = abs(cos(th*2.5)), f = .5 + .5*pow(pe, .55) - .12*smoothstep(.93, 1., pe);
    if (rr < f) {
      vec3 c0 = mix(vec3(1., .93, .96), vec3(.96, .7, .8), smoothstep(.2, 1., rr)*.7 + .3*h21(vec2(fk, 5.)));
      if (rr < .22) c0 = mix(vec3(.82, .3, .45), vec3(1., .85, .4), step(.85, h21(floor(d*900.))));
      r = vec4(c0, 1.);
    }
  }
  return r;
}
vec4 agujas(vec2 t){
  vec4 r = vec4(.13, .26, .14, 0.);
  for (int k = 0; k < 13 + uCero; k++) {
    float fk = float(k); vec2 a = vec2(.5, .03) + vec2((h21(vec2(fk, 1.)) - .5)*.6, h21(vec2(fk, 2.))*.42);
    vec2 dir = normalize(vec2((h21(vec2(fk, 3.)) - .5)*1.8, 1.)); float len = .38 + .22*h21(vec2(fk, 4.));
    vec2 pa = t - a; float s = dot(pa, dir)/len, d = pa.x*dir.y - pa.y*dir.x;
    if (s < 0. || s > 1.) continue;
    float lado = .12*(1. - s*.5);
    if (abs(d) < .005) { r = vec4(.32, .21, .13, 1.); continue; }
    if (abs(d) > lado) continue;
    float fase = s*len*120. - abs(d)*70.;
    if (abs(fract(fase) - .5) < .2) r = vec4(mix(vec3(.09, .2, .11), vec3(.22, .38, .17), abs(d)/lado*.7 + .3*h21(vec2(fk, floor(fase)))), 1.);
  }
  return r;
}
vec4 largas(vec2 t){
  vec4 r = vec4(.38, .55, .2, 0.);
  for (int k = 0; k < 24 + uCero; k++) {
    float fk = float(k); vec2 c = vec2(.5) + (h22(vec2(fk, 5.4)) - .5)*.6;
    float len = .3 + .14*h21(vec2(fk, 2.)), an = h21(vec2(fk, 9.))*TAU;
    vec2 d = rot(an)*(t - c); float x = d.x/len; if (x < 0. || x > 1.) continue;
    float hw = len*.085*pow(sin(3.14159*x), .6)*(1. - .4*x); if (abs(d.y) > hw) continue;
    vec3 c0 = mix(vec3(.3, .5, .15), vec3(.52, .66, .24), h21(vec2(fk, 7.)));
    c0 = mix(c0, c0*1.25, smoothstep(.12, 0., abs(d.y)/hw)*.6);
    r = vec4(c0*(.85 + .15*(1. - abs(d.y)/hw)), 1.);
  }
  return r;
}
void main(){
  vec2 cel = floor(vUv*2.), t = fract(vUv*2.);
  t = (t - .5)*1.04 + .5;   // margen para que los mipmaps no mezclen celdas
  vec4 r = cel.y < .5 ? (cel.x < .5 ? anchas(t) : flor(t)) : (cel.x < .5 ? agujas(t) : largas(t));
  if (t.x < 0. || t.y < 0. || t.x > 1. || t.y > 1.) r.a = 0.;
  gl_FragColor = r;
}`;

  const T = { suelo: null, sueloN: null, hojas: null, CAPA, ATLAS, N, medio: [] };

  /* caché en el navegador (IndexedDB): generar las capas cuesta ~1,8 s (16 programas que compilar y lecturas de la GPU);
     se guardan con una clave que cambia si cambia cualquier shader, tamaño o capa, y en las cargas siguientes se suben
     tal cual. Si el navegador no deja guardar (o falla), se generan como siempre */
  const CACHE = { bd: 'ecos2_texturas', almacen: 'capas', version: 1, espera: 1500 };   // espera: ms como mucho para leerla (si el navegador no contesta, se generan)
  function clave() { const s = [FRAG_SUELO, FRAG_NORMAL, FRAG_HOJAS, N, N_HOJAS, CAPAS.join(), RELIEVE.join(), CACHE.version].join('|'); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return 'v' + (h >>> 0).toString(36); }
  function abrirBD() { return new Promise((res, rej) => { const q = indexedDB.open(CACHE.bd, 1); q.onupgradeneeded = () => q.result.createObjectStore(CACHE.almacen); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }
  function leerCache(k) { return Promise.race([leerCache0(k), new Promise(r => setTimeout(() => r(null), CACHE.espera))]); }
  async function leerCache0(k) {
    try { const bd = await abrirBD(); return await new Promise(res => { const q = bd.transaction(CACHE.almacen).objectStore(CACHE.almacen).get('capas'); q.onsuccess = () => res(q.result && q.result.clave === k ? q.result : null); q.onerror = () => res(null); }); }
    catch (e) { return null; }
  }
  async function guardarCache(v) { try { const bd = await abrirBD(); bd.transaction(CACHE.almacen, 'readwrite').objectStore(CACHE.almacen).put(v, 'capas'); } catch (e) { } }
  const arrCapas = (d, aniso) => {
    const t = new THREE.DataTexture2DArray(d, N, N, CAPAS.length);
    t.format = THREE.RGBAFormat; t.type = THREE.UnsignedByteType; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.anisotropy = aniso; t.needsUpdate = true;
    return t;
  };
  function atlasDe(h, aniso) { const t = new THREE.DataTexture(h, N_HOJAS, N_HOJAS, THREE.RGBAFormat); t.encoding = THREE.sRGBEncoding; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.anisotropy = aniso; t.needsUpdate = true; return t; }

  async function crear() {
    const k = clave(), guardado = typeof indexedDB !== 'undefined' ? await leerCache(k) : null, an = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    if (guardado) {
      T.suelo = arrCapas(guardado.A, an); T.sueloN = arrCapas(guardado.B, an); T.hojas = atlasDe(guardado.h, an); T.medio = guardado.medio.map(v => new THREE.Vector3(v[0], v[1], v[2])); T.desdeCache = true;
      if (/[?&]depurar/.test(location.search)) T._datos = { A: guardado.A, B: guardado.B, h: guardado.h };
      return;
    }
    const esc = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); quad.frustumCulled = false; esc.add(quad);
    const opc = { type: THREE.UnsignedByteType, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false, generateMipmaps: false };
    const prev = renderer.getRenderTarget(), aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    // capas del suelo: color → altura (en coma flotante) → normal y oclusión. Un programa por capa (TIPO):
    // se compilan todos a la vez con el de normales y el de hojas (en frío, unos 3 s menos que uno solo con todas)
    const mats = CAPAS.map((_, i) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG_SUELO, defines: { TIPO: i }, uniforms: { uPase: { value: 0 } }, depthTest: false, depthWrite: false }));
    const mn = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG_NORMAL, uniforms: { tAltura: { value: null }, uRelieve: { value: 1 } }, depthTest: false, depthWrite: false });
    const mh = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG_HOJAS, depthTest: false, depthWrite: false });
    await Render.precompilar([{ materiales: mats.concat(mn), codificacion: THREE.LinearEncoding }, { materiales: [mh], codificacion: THREE.sRGBEncoding }]);
    const flot = renderer.capabilities.isWebGL2 && !!renderer.extensions.get('EXT_color_buffer_float');
    const rt = new THREE.WebGLRenderTarget(N, N, opc), capa = N * N * 4;
    const rh = new THREE.WebGLRenderTarget(N, N, Object.assign({}, opc, { type: flot ? THREE.HalfFloatType : THREE.UnsignedByteType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter }));
    rh.texture.wrapS = rh.texture.wrapT = THREE.RepeatWrapping;
    const A = new Uint8Array(capa * CAPAS.length), B = new Uint8Array(capa * CAPAS.length), tmp = new Uint8Array(capa);
    const pase = (m, destino) => { quad.material = m; renderer.setRenderTarget(destino); renderer.render(esc, cam); };
    for (let i = 0; i < CAPAS.length; i++) {
      const mat = mats[i];
      mat.uniforms.uPase.value = 0; pase(mat, rt); renderer.readRenderTargetPixels(rt, 0, 0, N, N, tmp); A.set(tmp, i * capa);
      let r = 0, g = 0, b = 0; for (let k = 0; k < capa; k += 4 * 37) { r += (tmp[k] / 255) ** 2.2; g += (tmp[k + 1] / 255) ** 2.2; b += (tmp[k + 2] / 255) ** 2.2; } const nm = Math.ceil(capa / (4 * 37)); T.medio.push(new THREE.Vector3(r / nm, g / nm, b / nm));
      mat.uniforms.uPase.value = 1; pase(mat, rh);
      mn.uniforms.tAltura.value = rh.texture; mn.uniforms.uRelieve.value = RELIEVE[i];
      pase(mn, rt); renderer.readRenderTargetPixels(rt, 0, 0, N, N, tmp); B.set(tmp, i * capa);
    }
    T.suelo = arrCapas(A, aniso); T.sueloN = arrCapas(B, aniso);
    rt.dispose(); rh.dispose(); mats.forEach(m => m.dispose()); mn.dispose();
    // atlas de hojas: se queda en su render target, con mipmaps
    quad.material = mh;
    const ra = new THREE.WebGLRenderTarget(N_HOJAS, N_HOJAS, Object.assign({}, opc, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter }));
    ra.texture.encoding = THREE.sRGBEncoding; ra.texture.anisotropy = aniso;
    renderer.setRenderTarget(ra); renderer.render(esc, cam);
    T.hojas = ra.texture; mh.dispose();
    const h = new Uint8Array(N_HOJAS * N_HOJAS * 4); renderer.readRenderTargetPixels(ra, 0, 0, N_HOJAS, N_HOJAS, h);
    if (/[?&]depurar/.test(location.search)) T._datos = { A, B, h };   // datos para revisar las texturas desde las pruebas
    if (typeof indexedDB !== 'undefined') guardarCache({ clave: k, A, B, h, medio: T.medio.map(v => [v.x, v.y, v.z]) });
    renderer.setRenderTarget(prev);
  }
  /* mosaico PNG de todas las capas (solo con ?depurar): primero el color, luego normal/altura/oclusión, y el atlas */
  function volcar() {
    if (!T._datos) return null;
    const S = 256, F = Math.ceil(CAPAS.length / 5), cv = document.createElement('canvas'); cv.width = S * 5 + S * 2; cv.height = S * F * 2; const cx = cv.getContext('2d');
    const pinta = (datos, off, n, x, y, tam) => {
      const im = cx.createImageData(tam, tam), paso = n / tam;
      for (let j = 0; j < tam; j++) for (let i = 0; i < tam; i++) { const s = off + ((n - 1 - Math.floor(j * paso)) * n + Math.floor(i * paso)) * 4, d = (j * tam + i) * 4; im.data[d] = datos[s]; im.data[d + 1] = datos[s + 1]; im.data[d + 2] = datos[s + 2]; im.data[d + 3] = 255; }
      cx.putImageData(im, x, y);
    };
    for (let i = 0; i < CAPAS.length; i++) { pinta(T._datos.A, i * N * N * 4, N, (i % 5) * S, Math.floor(i / 5) * S, S); pinta(T._datos.B, i * N * N * 4, N, (i % 5) * S, (F + Math.floor(i / 5)) * S, S); }
    pinta(T._datos.h, 0, N_HOJAS, S * 5, 0, S * 2);
    return cv.toDataURL('image/png');
  }
  T.volcar = volcar;
  /* trozo GLSL para muestrear el suelo (WebGL2): A = color sRGB + rugosidad, B = normal + altura + oclusión */
  const GLSL = `
precision highp sampler2DArray;
uniform sampler2DArray tSueloA; uniform sampler2DArray tSueloB;
vec4 sueloA(vec2 uv, float c){ vec4 a = texture(tSueloA, vec3(uv, c)); return vec4(pow(a.rgb, vec3(2.2)), a.a); }
vec4 sueloB(vec2 uv, float c){ vec4 b = texture(tSueloB, vec3(uv, c)); return vec4(b.xy*2. - 1., b.zw); }
/* triplanar barato: pesos por la normal sin las proyecciones de menos del 2 % (renormalizados), y muestreo
   solo de las que pesan; las derivadas se toman antes de las ramas (textureGrad), así el filtrado no cambia.
   A: color y rugosidad mezclados; bx, by, bz: normal, altura y oclusión de cada proyección (neutras si no pesa) */
vec3 triPesos(vec3 n){ vec3 w = pow(abs(n), vec3(4.)); w /= w.x + w.y + w.z; w *= step(vec3(.02), w); return w/(w.x + w.y + w.z); }
void triplanar(vec2 ux, vec2 uy, vec2 uz, vec3 w, float c, out vec4 A, out vec4 bx, out vec4 by, out vec4 bz){
  vec2 x1 = dFdx(ux), y1 = dFdy(ux), x2 = dFdx(uy), y2 = dFdy(uy), x3 = dFdx(uz), y3 = dFdy(uz); vec4 t;
  A = vec4(0.); bx = by = bz = vec4(0., 0., .5, 1.);
  if (w.x > 0.) { t = textureGrad(tSueloA, vec3(ux, c), x1, y1); A += vec4(pow(t.rgb, vec3(2.2)), t.a)*w.x; t = textureGrad(tSueloB, vec3(ux, c), x1, y1); bx = vec4(t.xy*2. - 1., t.zw); }
  if (w.y > 0.) { t = textureGrad(tSueloA, vec3(uy, c), x2, y2); A += vec4(pow(t.rgb, vec3(2.2)), t.a)*w.y; t = textureGrad(tSueloB, vec3(uy, c), x2, y2); by = vec4(t.xy*2. - 1., t.zw); }
  if (w.z > 0.) { t = textureGrad(tSueloA, vec3(uz, c), x3, y3); A += vec4(pow(t.rgb, vec3(2.2)), t.a)*w.z; t = textureGrad(tSueloB, vec3(uz, c), x3, y3); bz = vec4(t.xy*2. - 1., t.zw); }
}`;
  /* añade al shader los uniformes de las texturas del suelo */
  function usar(sh) { sh.uniforms.tSueloA = { value: T.suelo }; sh.uniforms.tSueloB = { value: T.sueloN }; }

  T.crear = crear; T.GLSL = GLSL; T.usar = usar;
  return T;
})();
