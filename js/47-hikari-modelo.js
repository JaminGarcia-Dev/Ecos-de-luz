/* Fuente editable del modelo de Hikari, basada en la hoja de ocho vistas del usuario.
   Solo construye geometría y detalles; movimiento, combate y animación viven en 17-hikari.js.
   Una unidad = un metro. Máscara sin rasgos humanos, capucha marfil y ornamentos geométricos. */
"use strict";
const HIKARI_DISENO = {
  altura: 1.15, punta: 1.31,
  color: { cuerpo: 0x20344f, oscuro: 0x111c2c, linea: 0x57e9ed, mascara: 0xf3eedf, oro: 0xc99a3e, bota: 0x233047, capa: [0x9e302b, 0xeb8536, 0xffcf78] },
  tunica: 0xeee6d5, ribete: 0xffedca, forro: 0x625548,
  cabeza: { y: 1.04, ancho: .112, fondo: .094 },
  capa: { cols: 10, filas: 14, largo: .72, arriba: .38, abajo: .91, vuelo: 1.38 },
  llamas: { columna: 4.5, filas: [3, 6.2, 9.5], ancho: .095, alto: .145 }
};

const ModeloHikari = (() => {
  class Malla {
    constructor() { this.p = []; this.c = []; this.m = []; this.si = []; this.sw = []; this.i = []; this.partes = []; }
    vert(x, y, z, c, rug, em, pw) {
      this.p.push(x, y, z); this.c.push(c.r, c.g, c.b); this.m.push(rug, em);
      this.si.push(pw[0], pw[2] || 0, 0, 0); this.sw.push(pw[1], pw[3] || 0, 0, 0); return this.p.length / 3 - 1;
    }
    parte(nombre) { if (this.partes.length) this.partes[this.partes.length - 1].cantidad = this.i.length - this.partes[this.partes.length - 1].inicio; this.partes.push({ nombre, inicio: this.i.length, cantidad: 0 }); }
    superficie(nx, ny, posicion, color, rug, em, pesos, invertir = false) {
      const base = this.p.length / 3;
      for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
        const u = i / nx, v = j / ny, p = posicion(u, v), c = typeof color === 'function' ? color(p.x, p.y, p.z, u, v) : color;
        this.vert(p.x, p.y, p.z, c, rug, em, pesos(p.y, p.x, p.z));
      }
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = base + j * (nx + 1) + i, b = a + nx + 1; invertir ? this.i.push(a,b,a+1,a+1,b,b+1) : this.i.push(a, a + 1, b, a + 1, b + 1, b); }
    }
    tubo(secciones, lados, x0, z0, color, rug, em, pesos, tapas) {
      const base = this.p.length / 3;
      for (const s of secciones) for (let a = 0; a <= lados; a++) {
        const an = a / lados * TAU, x = x0 + Math.cos(an) * s[1], z = z0 + (s[3] || 0) + Math.sin(an) * s[2];
        this.vert(x, s[0], z, typeof color === 'function' ? color(x, s[0], z, an) : color, rug, em, pesos(s[0], x, z));
      }
      for (let j = 0; j < secciones.length - 1; j++) for (let a = 0; a < lados; a++) { const b = base + j * (lados + 1) + a; this.i.push(b, b + 1, b + lados + 1, b + 1, b + lados + 2, b + lados + 1); }
      if (tapas) for (const [j, arriba] of [[0, true], [secciones.length - 1, false]]) {
        const s = secciones[j], c = this.vert(x0, s[0], z0 + (s[3] || 0), typeof color === 'function' ? color(x0, s[0], z0, 0) : color, rug, em, pesos(s[0], x0, z0));
        for (let a = 0; a < lados; a++) { const b = base + j * (lados + 1) + a; arriba ? this.i.push(c, b + 1, b) : this.i.push(c, b, b + 1); }
      }
    }
    geoPieza(g, col, rug, em, pesos) {
      const p = g.attributes.position, base = this.p.length / 3;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); this.vert(x, y, z, typeof col === 'function' ? col(x, y, z) : col, rug, em, pesos(y, x, z)); }
      if (g.index) for (const i of g.index.array) this.i.push(base + i); else for (let i = 0; i < p.count; i++) this.i.push(base + i);
      g.dispose();
    }
    elipse(x, y, z, rx, ry, rz, col, rug, em, pesos, nx = 16, ny = 10) {
      const g = new THREE.SphereGeometry(1, nx, ny); g.scale(rx, ry, rz); g.translate(x, y, z); this.geoPieza(g, col, rug, em, pesos);
    }
    trazo(puntos, radio, col, rug, em, pesos, segmentos = 18) {
      const c = new THREE.CatmullRomCurve3(puntos.map(p => new THREE.Vector3(...p)));
      this.geoPieza(new THREE.TubeGeometry(c, segmentos, radio, 5, false), col, rug, em, pesos);
    }
    poligono(puntos, col, rug, em, pesos) {
      const area=puntos.reduce((a,p,i)=>{const q=puntos[(i+1)%puntos.length];return a+p[0]*q[1]-q[0]*p[1];},0);if(area<0)puntos=puntos.slice().reverse();
      const centro = puntos.reduce((v, p) => v.add(new THREE.Vector3(...p)), new THREE.Vector3()).multiplyScalar(1 / puntos.length), base = this.p.length / 3;
      this.vert(centro.x, centro.y, centro.z, col, rug, em, pesos(centro.y, centro.x, centro.z));
      for (const p of puntos) this.vert(...p, col, rug, em, pesos(p[1], p[0], p[2]));
      for (let i = 0; i < puntos.length; i++) this.i.push(base, base + 1 + i, base + 1 + (i + 1) % puntos.length);
    }
    geometria() {
      if (this.partes.length) this.partes[this.partes.length - 1].cantidad = this.i.length - this.partes[this.partes.length - 1].inicio;
      const g = new THREE.BufferGeometry(), uv = [];
      for (let i = 0; i < this.p.length; i += 3) uv.push(this.p[i] * 1.7 + this.p[i + 2] * .4 + .5, this.p[i + 1] * 1.3);
      for (const [n, datos, tam] of [['position',this.p,3], ['color',this.c,3], ['aMat',this.m,2], ['skinWeight',this.sw,4], ['uv',uv,2]]) g.setAttribute(n, new THREE.Float32BufferAttribute(datos, tam));
      g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(this.si, 4)); g.setIndex(this.i); g.computeVertexNormals(); g.computeBoundingSphere(); g.userData.partes = this.partes;
      return g;
    }
  }
  function crear(H) {
    const D = HIKARI_DISENO, K = D.color, C = new Malla(), V = (x,y,z) => new THREE.Vector3(x,y,z), L = lin;
    const cu = L(K.cuerpo), os = L(K.oscuro), oro = L(K.oro), ma = L(K.mascara), luz = L(K.linea), blanco = L(D.tunica), bota = L(K.bota);
    const fijo = n => () => [H[n], 1], cab = fijo('cabeza'), hip = fijo('cadera'), pecho = fijo('pecho');
    const mezclar = (a,b,y,y0,y1) => { const t = smooth(y0,y1,y); return [H[a],t,H[b],1-t]; };
    const tela = c => (x,y,z) => c.clone().multiplyScalar(.98 + .025 * Ruido.n2(x * 32 + z * 9, y * 32));
    const tronco = y => y > .88 ? mezclar('cuello','pecho',y,.89,.94) : y > .7 ? mezclar('pecho','columna',y,.70,.78) : y > .58 ? mezclar('columna','cadera',y,.59,.67) : [H.cadera,1];
    const falda = (y,x) => { const w = smooth(.60,.47,y) * .98; return [H.cadera,1-w,H[x >= 0 ? 'musloI':'musloD'],w]; };
    C.parte('cuerpo_y_vestimenta');
    C.tubo([[.95,.036,.035],[.91,.052,.047],[.87,.113,.077],[.81,.12,.081],[.74,.104,.075],[.66,.091,.068],[.59,.105,.079],[.53,.104,.077]], 24, 0, 0, tela(blanco), .9, 0, tronco, true);
    // Túnica abierta en el centro: el bajo cae en dos paneles, con pliegues amplios.
    C.superficie(32, 8, (u,v) => {
      const a = u * TAU, r = lerp(.128,.184,v) * (1 + .035 * Math.cos(a * 8) * v), frontal = Math.max(0,Math.sin(a));
      const y = lerp(.59,.36,v) + v*v*(.025*Math.cos(a*2) + .034*Math.pow(frontal,8));
      return V(Math.cos(a)*r, y, Math.sin(a)*r*.7);
    }, tela(blanco), .92, 0, falda);
    for (const s of [-1,1]) {
      C.trazo([[s*.014,.565,.087],[s*.032,.49,.108],[s*.045,.425,.13],[s*.017,.395,.132]],.003,oro,.42,.06,falda,20);
      C.poligono([[s*.05,.405,.135],[s*.075,.433,.131],[s*.104,.402,.124]], oro,.45,.04,falda);
      C.poligono([[s*.059,.407,.137],[s*.075,.423,.133],[s*.091,.405,.129]], blanco,.9,0,falda);
    }
    C.tubo([[.625,.108,.081],[.592,.112,.084]],24,0,0,tela(oro),.43,.08,hip,true);
    C.poligono([[-.02,.609,.087],[0,.629,.09],[.02,.609,.087],[0,.588,.09]],oro,.3,.08,hip);
    C.poligono([[-.009,.609,.092],[0,.62,.094],[.009,.609,.092],[0,.598,.094]],luz,.3,1.3,hip);
    // Mangas índigo, guantes y calzas; el mismo esqueleto del control actual.
    for (const s of [1,-1]) {
      const sf = s > 0 ? 'I':'D', x = .125*s, xl = .072*s;
      const brazo = y => y > .84 ? [H['brazo'+sf],.7,H['hombro'+sf],.3] : y > .66 ? mezclar('brazo'+sf,'antebrazo'+sf,y,.665,.72) : y > .51 ? [H['antebrazo'+sf],1] : mezclar('antebrazo'+sf,'mano'+sf,y,.49,.53);
      C.tubo([[.89,.039,.04],[.85,.044,.043],[.79,.039,.038],[.71,.031,.033],[.66,.033,.035],[.59,.029,.03],[.53,.023,.026],[.5,.025,.027]],16,x,0,tela(cu),.84,0,brazo,true);
      C.elipse(x,.861,-.003,.047,.05,.047,tela(cu),.85,0,fijo('brazo'+sf));
      C.trazo([[x+s*.03,.80,.025],[x-s*.012,.74,.035],[x+s*.024,.68,.03],[x-s*.013,.59,.03],[x+s*.015,.54,.026]],.0018,luz,.4,1.3,brazo,28);
      const mano = fijo('mano'+sf);
      C.elipse(x,.466,.008,.023,.043,.025,tela(cu),.8,0,mano,14,9);
      C.elipse(x-s*.023,.477,.025,.012,.024,.012,cu,.8,0,mano,10,7);
      for (let d=0;d<4;d++) C.elipse(x+(d-1.5)*.011,.43+(d===0||d===3?.005:0),.014,.006,.022,.008,cu,.8,0,mano,8,6);
      const pierna = y => y > .51 ? mezclar('muslo'+sf,'cadera',y,.52,.60) : y > .26 ? mezclar('muslo'+sf,'pierna'+sf,y,.27,.33) : y > .09 ? [H['pierna'+sf],1] : mezclar('pierna'+sf,'pie'+sf,y,.065,.1);
      C.tubo([[.59,.058,.062],[.51,.06,.06],[.43,.052,.055],[.35,.044,.047],[.30,.041,.044],[.25,.044,.046],[.18,.034,.037],[.09,.028,.031]],18,xl,0,tela(cu),.84,0,pierna,true);
      for(const r of [-1,1]) C.trazo([[xl+r*.016,.43,.049],[xl-r*.024,.35,.046],[xl+r*.02,.28,.044],[xl-r*.012,.19,.038]],.0017,luz,.4,1.2,pierna,23);
      // Botas altas con vuelta en V y suela definida.
      C.tubo([[.25,.045,.048],[.22,.044,.047],[.16,.038,.039],[.10,.035,.038],[.06,.038,.048,.013]],18,xl,0,tela(bota),.76,0,pierna,true);
      C.elipse(xl,.05,.035,.046,.04,.092,tela(bota),.77,0,(y,x,z)=>mezclar('dedos'+sf,'pie'+sf,z,.045,.08),18,11);
      C.elipse(xl,.018,.037,.048,.013,.095,L(0x58432d),.9,0,fijo('pie'+sf),18,7);
      C.trazo([[xl-.04,.247,.02],[xl-.027,.235,.045],[xl,.213,.052],[xl+.027,.235,.045],[xl+.04,.247,.02]],.0035,oro,.4,.05,pierna,22);
      C.poligono([[xl-.011,.18,.041],[xl,.196,.044],[xl+.011,.18,.041],[xl,.16,.044]],oro,.4,.05,pierna);
      C.trazo([[xl-.033,.045,.098],[xl,.035,.125],[xl+.033,.045,.098]],.0027,oro,.45,.04,fijo('pie'+sf),16);
    }
    // Pañuelo marfil y esclavina roja sobre los hombros, cerrada por el broche.
    C.tubo([[.94,.06,.06],[.915,.078,.066],[.89,.075,.067]],24,0,0,tela(blanco),.9,0,pecho,true);
    for(const s of [-1,1]) {
      C.superficie(18,5,(u,v)=>{
        const x=s*lerp(.015,.192,u), y=.90-u*.048-v*(.055+.07*u), z=.079-.06*u+.025*Math.sin(v*Math.PI);
        return V(x,y,z);
      },tela(L(K.capa[0])),.9,0,pecho,s>0);
      C.trazo([[0,.885,.105],[s*.075,.861,.094],[s*.14,.823,.066],[s*.19,.775,.036]],.0042,oro,.45,.08,pecho,24);
    }
    const aro = new THREE.TorusGeometry(.032,.0048,8,32); aro.translate(0,.886,.113); C.geoPieza(aro,oro,.32,.13,pecho);
    C.elipse(0,.886,.11,.028,.028,.009,L(0x316975),.35,.15,pecho,22,10);
    C.poligono([[-.012,.886,.122],[0,.901,.124],[.012,.886,.122],[0,.871,.124]],oro,.28,.2,pecho);
    C.poligono([[-.014,.835,.086],[0,.815,.096],[.014,.835,.086],[0,.857,.086]],luz,.35,1.5,pecho);
    // Capucha: abertura frontal alta, forro oscuro, pliegues y punta hacia atrás.
    C.parte('capucha_marfil');
    const contorno = (u, ancho, arriba, abajo, z) => {
      const a=u*TAU, c=Math.cos(a), forma=.9-.12*Math.max(0,c);
      return V(Math.sin(a)*ancho*forma, 1.045+c*(c>=0?arriba:abajo),z+.012*Math.sin(a*3));
    };
    C.superficie(40,12,(u,v)=>{
      const anillos=[[.156,.265,.175,.095,0],[.166,.255,.16,-.03,0],[.14,.23,.15,-.11,0],[.09,.20,.13,-.16,0],[.0001,.0001,.0001,-.24,.185]];
      const k=Math.min(3,Math.floor(v*4)),f=v*4-k,a=anillos[k],b=anillos[k+1];
      const p=contorno(u,lerp(a[0],b[0],f),lerp(a[1],b[1],f),lerp(a[2],b[2],f),lerp(a[3],b[3],f)), pliegue=Math.sin(u*TAU*7+v*3)*.0035*Math.sin(v*Math.PI);
      p.y+=lerp(a[4],b[4],f);
      p.x+=Math.sin(u*TAU)*pliegue; p.z+=pliegue; return p;
    },tela(blanco),.94,0,cab);
    C.superficie(40,3,(u,v)=>{const p=contorno(u,lerp(.147,.114,v),lerp(.251,.18,v),lerp(.165,.13,v),lerp(.096,.015,v));return p;},L(D.forro),.96,0,cab);
    C.superficie(40,4,(u,v)=>contorno(u,lerp(.156,.119,v),lerp(.265,.19,v),lerp(.175,.14,v),lerp(.095,.121,v)),tela(blanco),.94,0,cab,true);
    const borde=[]; for(let i=0;i<=48;i++){const p=contorno(i/48,.119,.19,.14,.124);borde.push(p.toArray());}
    C.trazo(borde,.0033,oro,.4,.05,cab,64);
    // Dos emblemas de la capucha, apoyados en los laterales y visibles de perfil.
    for(const s of [-1,1]) {
      const x=s*.135;
      C.poligono([[x,1.115,.01],[x+s*.006,1.142,-.012],[x,1.18,-.018],[x-s*.006,1.143,.006]],oro,.45,.06,cab);
    }
    C.parte('mascara_marfil');
    C.elipse(0,1.033,-.002,.103,.132,.083,os,.95,0,cab,20,12);
    const anillos=[[1.155,.018,.025],[1.147,.065,.061],[1.12,.096,.084],[1.08,.112,.096],[1.035,.103,.094],[.99,.082,.08],[.95,.052,.057],[.926,.022,.027],[.922,.002,.015]];
    C.superficie(28,anillos.length-1,(u,v)=>{
      const k=Math.min(anillos.length-2,Math.floor(v*(anillos.length-1))), f=v*(anillos.length-1)-k, a=anillos[k],b=anillos[k+1],t=u*Math.PI;
      return V(Math.cos(t)*lerp(a[1],b[1],f),lerp(a[0],b[0],f),.025+Math.sin(t)*lerp(a[2],b[2],f));
    },ma,.43,0,cab);
    const zCara=(x,y)=>.025+.095*Math.sqrt(Math.max(.05,1-(x/.115)**2-((y-1.065)/.16)**2));
    C.poligono([[-.011,1.122,zCara(-.011,1.122)+.002],[0,1.153,zCara(0,1.153)+.002],[.011,1.122,zCara(.011,1.122)+.002],[0,1.095,zCara(0,1.095)+.002]],oro,.35,.1,cab);
    C.poligono([[-.004,1.122,zCara(-.004,1.122)+.004],[0,1.135,zCara(0,1.135)+.004],[.004,1.122,zCara(.004,1.122)+.004],[0,1.112,zCara(0,1.112)+.004]],luz,.3,1,cab);
    C.parte('ojos_turquesa');
    for(const s of [-1,1]) {
      const pts=[];
      for(let i=0;i<=12;i++){const u=i/12,x=s*lerp(.026,.087,u),y=1.048+.022*u+Math.sin(u*Math.PI)*.006;pts.push([x,y,zCara(x,y)+.005]);}
      for(let i=12;i>=0;i--){const u=i/12,x=s*lerp(.026,.087,u),y=1.048+.022*u-Math.sin(u*Math.PI)*.009;pts.push([x,y,zCara(x,y)+.006]);}
      if(s<0)pts.reverse(); C.poligono(pts,luz,.3,1.05,cab);
    }
    return C.geometria();
  }
  let tex = null;
  function atlas() {
    if(tex)return tex;
    const c=document.createElement('canvas'); c.width=c.height=1024; const x=c.getContext('2d');
    x.fillStyle='#faf9f6';x.fillRect(0,0,1024,1024);
    for(let i=0;i<1024;i+=4){x.fillStyle=i%8?'rgba(80,64,40,.018)':'rgba(255,255,255,.35)';x.fillRect(i,0,1,1024);x.fillRect(0,i,1024,1);}
    tex=new THREE.CanvasTexture(c);tex.name='Hikari_atlas_1024';tex.encoding=THREE.sRGBEncoding;tex.wrapS=tex.wrapT=THREE.RepeatWrapping; return tex;
  }
  function llama() {
    const s=new THREE.Shape();s.moveTo(0,.53);s.bezierCurveTo(.08,.28,.42,.03,.25,-.23);s.bezierCurveTo(.14,-.48,-.22,-.4,-.28,-.18);s.bezierCurveTo(-.37,.05,-.08,.17,-.15,.35);s.bezierCurveTo(-.08,.28,-.05,.2,0,.53);
    const interior=new THREE.Shape();interior.moveTo(0,.23);interior.bezierCurveTo(.17,.02,.15,-.25,0,-.29);interior.bezierCurveTo(-.16,-.22,-.13,-.02,0,.23);
    const a=new THREE.ShapeGeometry(s,12),b=new THREE.ShapeGeometry(interior,10);b.translate(0,0,.002);
    return fusionar([pieza(a,0xffc35c),pieza(b,0xfff0ba)]);
  }
  return { crear, atlas, llama, Malla, diseno: HIKARI_DISENO };
})();
