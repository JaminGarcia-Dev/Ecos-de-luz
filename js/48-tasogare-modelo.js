/* Tasogare normal: fuente editable de la hoja de ocho vistas. Frente +Z, izquierda anatómica +X.
   Un único patrón de grieta, fractura y desgarros se comparte entre juego y entrega GLB. */
"use strict";
const TASOGARE_DISENO = {
  altura: 2.4, capucha: 2.58, ojoIzquierdo: [.067,2.251,.196],
  color: { negro:0x1a191e, carbon:0x363239, hierro:0x424148, laca:0x28262c, oro:0x98784a,
    cordon:0x762f2b, mascara:0xbfb49e, rojo:0xff3c20, brasa:0xb54425, hoja:0x29272c },
  capa: { cols:23, filas:18, largo:1.86, arriba:.83, abajo:1.8, vuelo:2.7,
    dientes:[.09,.02,.18,.05,.21,.11,.03,.25,.07,.18,.02,.15,.24,.03,.12,.23,.05,.18,.03,.20,.1,.02,.14] },
  grieta:[[-.085,2.387],[-.034,2.345],[.004,2.326],[.015,2.294],[.067,2.251],[.043,2.224],[.085,2.181],[.067,2.124],[.11,2.073]],
  hoja:[[-.046,-.205],[-.042,-.4],[-.023,-.67],[.003,-.88],[.024,-.966],[.062,-.903],[.046,-.846],[.096,-.881],[.074,-.797],[.113,-.821],[.085,-.682],[.065,-.40],[.056,-.205]]
};

const ModeloTasogare = (() => {
  const D=TASOGARE_DISENO, V=(x,y,z)=>new THREE.Vector3(x,y,z), L=lin;
  // El taller genérico de Hikari se comparte; el diseño, el rig y los materiales son independientes.
  class Taller extends ModeloHikari.Malla {
    constructor(){super();this.canal=0;this.canales=[];}
    vert(...a){const n=super.vert(...a);this.canales.push(this.canal);return n;}
    parte(nombre,material='tela',canal=0){super.parte(nombre);this.partes[this.partes.length-1].material=material;this.canal=canal;}
    geometria(){const g=super.geometria();g.setAttribute('aCanal',new THREE.Float32BufferAttribute(this.canales,1));return g;}
    trazo(puntos,radio,col,rug,em,pesos,segmentos=18){const curva=new THREE.CatmullRomCurve3(puntos.map(p=>new THREE.Vector3(...p)));this.geoPieza(new THREE.TubeGeometry(curva,segmentos,radio,4,false),col,rug,em,pesos);}
    elipse(x,y,z,rx,ry,rz,col,rug,em,pesos,nx=16,ny=10){if(Math.max(rx,ry,rz)<.025){nx=5;ny=4;}super.elipse(x,y,z,rx,ry,rz,col,rug,em,pesos,nx,ny);}
    caja(x,y,z,w,h,d,col,rug,pesos,rz=0){const g=new THREE.BoxGeometry(w,h,d);g.rotateZ(rz);g.translate(x,y,z);this.geoPieza(g,col,rug,0,pesos);}
    placa(x,y,z,w,h,col,pesos,rz=0){
      const e=.1, puntos=[[-.5+e,-.5],[.5-e,-.5],[.5,-.5+e],[.5,.5-e],[.5-e,.5],[-.5+e,.5],[-.5,.5-e],[-.5,-.5+e]];
      const sh=new THREE.Shape(puntos.map(p=>new THREE.Vector2(p[0]*w,p[1]*h)));
      const g=new THREE.ExtrudeGeometry(sh,{depth:.025,bevelEnabled:false,steps:1});
      g.rotateZ(rz);g.translate(x,y,z);this.geoPieza(g,col,.52,0,pesos);
      // Borde de oro envejecido: franja plana, sin tubos de alta densidad.
      const p=[],ix=[],cs=Math.cos(rz),sn=Math.sin(rz);
      for(const [px,py] of puntos)for(const f of [1,.91])p.push(x+px*w*f*cs-py*h*f*sn,y+px*w*f*sn+py*h*f*cs,z+.032);
      for(let i=0;i<8;i++){const a=i*2,b=((i+1)%8)*2;ix.push(a,b,a+1,a+1,b,b+1);}
      const rib=new THREE.BufferGeometry();rib.setAttribute('position',new THREE.Float32BufferAttribute(p,3));rib.setIndex(ix);rib.computeVertexNormals();this.geoPieza(rib,L(D.color.oro),.42,.025,pesos);
    }
  }
  function rig(){
    const h=[['cadera',-1,0,1.22,0],['columna',0,0,.16,0],['pecho',1,0,.3,0],['cuello',2,0,.32,.02],['cabeza',3,0,.12,0],
      ['brazoI',2,.4,.26,0],['antebrazoI',5,0,-.46,0],['manoI',6,0,-.42,0],['brazoD',2,-.4,.26,0],['antebrazoD',8,0,-.46,0],['manoD',9,0,-.42,0],
      ['musloI',0,.17,-.04,0],['piernaI',11,0,-.55,0],['pieI',12,0,-.55,0],['musloD',0,-.17,-.04,0],['piernaD',14,0,-.55,0],['pieD',15,0,-.55,0]];
    for(const s of ['I','D']){h.push(['manga'+s,s==='I'?6:9,0,-.08,-.07]);h.push(['mangaPunta'+s,h.length-1,0,-.25,0]);}
    for(const [n,x,z]of [['IF',.22,.16],['DF',-.22,.16],['IT',.22,-.16],['DT',-.22,-.16]]){h.push(['faldon'+n,0,x,-.04,z]);h.push(['faldonPunta'+n,h.length-1,0,-.55,0]);}
    return h;
  }
  const zMascara=(x,y)=>{
    const a=[[2.4,.012,.02],[2.39,.067,.07],[2.36,.115,.122],[2.31,.15,.157],[2.25,.157,.17],[2.19,.145,.155],[2.13,.113,.126],[2.075,.067,.078],[2.045,.025,.036],[2.04,.002,.016]];
    const i=Math.max(0,Math.min(a.length-2,a.findIndex((p,k)=>k<a.length-1&&y<=p[0]&&y>=a[k+1][0]))),p=a[i],q=a[i+1],f=clamp((p[0]-y)/(p[0]-q[0]),0,1),rx=lerp(p[1],q[1],f),rz=lerp(p[2],q[2],f);
    return .025+rz*Math.sqrt(Math.max(.01,1-(x/rx)**2));
  };
  function crear(H){
    const C=new Taller(), K=D.color, negro=L(K.negro), oro=L(K.oro), metal=L(K.hierro), rojo=L(K.rojo), cordon=L(K.cordon);
    const fijo=n=>()=>[H[n],1], cab=fijo('cabeza'), pecho=fijo('pecho'), hip=fijo('cadera');
    const mezcla=(a,b,t)=>[H[a],t,H[b],1-t];
    const tejido=c=>(x,y,z)=>c.clone().multiplyScalar(.94+.055*Ruido.n2(x*27+z*11,y*27));
    const torso=y=>y>1.92?mezcla('cuello','pecho',smooth(1.93,2,y)):y>1.4?mezcla('pecho','columna',smooth(1.42,1.61,y)):mezcla('columna','cadera',smooth(1.23,1.39,y));
    C.parte('Cuerpo_vestido');
    C.tubo([[2.04,.09,.09],[1.97,.16,.135],[1.91,.30,.205],[1.8,.34,.23],[1.62,.31,.225],[1.43,.28,.215],[1.23,.33,.255]],28,0,0,tejido(negro),.94,0,torso,true);
    // Faldones separados con aberturas reales: la malla no cruza de una pierna a la otra.
    for(const [n,a0,a1]of [['IF',.045,Math.PI*.5-.045],['DF',Math.PI*.5+.045,Math.PI-.045],['DT',Math.PI+.035,Math.PI*1.5-.025],['IT',Math.PI*1.5+.025,TAU-.035]]){
      const pesos=y=>y>1.12?mezcla('cadera','faldon'+n,smooth(1.12,1.24,y)):mezcla('faldon'+n,'faldonPunta'+n,smooth(.35,.8,y));
      C.superficie(14,10,(u,v)=>{const a=lerp(a0,a1,u),r=lerp(.34,.60,v)*(1+.022*Math.cos(a*16)*v),corte=(.06+.055*Math.sin(a*17)**2+.035*Math.sin(a*39+2)**2)*v**8;
        return V(Math.cos(a)*r,lerp(1.24,.09,v)+corte,Math.sin(a)*r*.79);},tejido(negro),.95,0,pesos);
      // Filete gastado y cortes grandes en el borde, con el mismo patrón determinista.
      const pts=[];for(let i=0;i<=24;i++){const a=lerp(a0,a1,i/24),r=.60*(1+.022*Math.cos(a*16));pts.push([Math.cos(a)*r,.09+.06+.055*Math.sin(a*17)**2+.035*Math.sin(a*39+2)**2,Math.sin(a)*r*.79]);}
      C.trazo(pts,.0022,oro.clone().multiplyScalar(.55),.6,0,pesos,32);
    }
    // Extremidades largas, botas y mangas amplias con huesos propios.
    for(const [s,k]of [['I',1],['D',-1]]){
      const xp=.17*k,xb=.4*k,leg=y=>y>.64?mezcla('muslo'+s,'pierna'+s,smooth(.59,.72,y)):y>.18?[H['pierna'+s],1]:mezcla('pierna'+s,'pie'+s,smooth(.12,.2,y));
      C.tubo([[1.2,.11,.115],[.85,.105,.11],[.63,.09,.095],[.38,.082,.085],[.13,.075,.08]],16,xp,0,tejido(negro),.9,0,leg,true);
      C.tubo([[.48,.094,.098],[.31,.089,.095],[.12,.081,.087]],16,xp,0,L(K.laca),.6,0,leg,true);
      C.elipse(xp,.078,.065,.104,.071,.195,L(K.laca),.62,0,fijo('pie'+s),18,10);
      C.elipse(xp,.021,.065,.108,.017,.199,L(0x282423),.9,0,fijo('pie'+s),18,6);
      for(const y of [.16,.26,.4])C.trazo([[xp-.08,y,.06],[xp,y-.012,.102],[xp+.08,y,.06]],.004,oro,.45,0,leg,14);
      const arm=y=>y>1.5?mezcla('brazo'+s,'antebrazo'+s,smooth(1.45,1.56,y)):y>1.15?[H['antebrazo'+s],1]:[H['mano'+s],1];
      const manga=y=>y>1.45?arm(y):mezcla('manga'+s,'mangaPunta'+s,smooth(1.10,1.42,y));
      C.tubo([[1.95,.125,.14],[1.78,.145,.16],[1.54,.17,.19],[1.31,.20,.245],[1.1,.225,.28]],22,xb,-.04,tejido(negro),.96,0,manga);
      C.tubo([[1.46,.082,.09],[1.25,.08,.085],[1.09,.068,.072]],16,xb,.035,L(K.laca),.52,0,arm,true);
      C.elipse(xb,1.016,.04,.058,.082,.063,tejido(negro),.85,0,fijo('mano'+s),14,9);
      C.elipse(xb-k*.054,1.03,.071,.022,.05,.025,negro,.85,0,fijo('mano'+s),10,7);
      for(let i=0;i<4;i++)C.elipse(xb+(i-1.5)*.025,.949+(i===0||i===3?.012:0),.058,.014,.045,.02,negro,.85,0,fijo('mano'+s),9,6);
    }
    C.parte('Armadura','armadura');
    // Pechera de láminas, hombreras, guanteletes y protecciones del cinturón.
    for(let j=0;j<5;j++){
      const y=1.60+j*.073,w=lerp(.50,.66,j/4);
      C.superficie(16,2,(u,v)=>V((u-.5)*w,y+v*.061,.23+.044*(1-(u*2-1)**2)),L(K.laca),.52,0,pecho);
      C.trazo([[-w*.5,y,.23],[0,y,.278],[w*.5,y,.23]],.0032,oro,.42,.025,pecho,16);
      for(const s of [-1,1])C.elipse(s*w*.43,y+.032,.252,.011,.011,.007,oro,.38,.02,pecho,8,6);
    }
    for(const [s,k]of [['I',1],['D',-1]]){
      const b=fijo('brazo'+s),a=fijo('antebrazo'+s);
      C.elipse(k*.4,1.97,-.01,.19,.14,.185,L(K.laca),.6,0,b,18,10);
      for(let j=0;j<4;j++){
        const x=k*(.43+j*.05),y=1.96-j*.125;
        C.placa(x,y,.17,.27,.15,L(K.laca),b,k*.34);
        C.placa(x,y,-.205,.27,.15,L(K.laca),b,k*.34);
        C.superficie(8,2,(u,v)=>V(k*(.53+j*.05+.035*Math.sin(u*Math.PI)),y-.055+v*.10,lerp(-.20,.17,u)),L(K.laca),.6,0,b);
        C.elipse(x-k*.075,y+.02,.209,.009,.009,.007,oro,.4,0,b,8,6);
      }
      C.placa(k*.4,1.27,.117,.13,.28,L(K.laca),a,k*.08);
      C.poligono([[k*.4-.02,1.29,.151],[k*.4,1.32,.156],[k*.4+.02,1.29,.151],[k*.4,1.25,.156]],oro,.4,.03,a);
      for(const y of [1.12,1.39])C.trazo([[k*.4-.07,y,.071],[k*.4,y-.01,.128],[k*.4+.07,y,.071]],.004,oro,.42,.025,a,12);
    }
    // Fajín y faldillas de armadura. El panel central lleva los anillos del ocaso.
    C.tubo([[1.46,.302,.237],[1.33,.336,.268]],28,0,0,L(K.laca),.62,0,hip,true);
    for(const y of [1.37,1.405,1.44])C.tubo([[y+.009,.337,.27],[y-.009,.337,.27]],28,0,0,cordon,.85,0,hip);
    for(const s of [-1,1])for(let j=0;j<3;j++)C.placa(s*(.23+j*.035),1.24-j*.12,.285,.16,.15,L(K.laca),fijo('faldon'+(s>0?'IF':'DF')),s*.2);
    const estola=fijo('faldonIF');C.placa(0,.78,.48,.17,.88,L(K.laca),estola);
    for(let j=0;j<4;j++){const g=new THREE.TorusGeometry(.035,.003,5,16);g.translate(0,.49+j*.15,.517);C.geoPieza(g,oro,.43,.025,estola);}
    C.trazo([[0,.41,.52],[0,1.19,.52]],.0024,oro,.45,.02,estola,12);
    C.parte('Cordones_y_ornamentos','oro');
    // Solapas cruzadas, cordón rojo y borlas de relieve; no hay piel visible.
    for(const s of [-1,1]){
      C.caja(s*.09,1.96,.19,.065,.27,.035,negro,.95,pecho,-s*.5);
      const g=new THREE.TorusGeometry(.042,.006,6,20);g.translate(s*.26,1.94,.224);C.geoPieza(g,oro,.45,0,pecho);
      C.trazo([[s*.26,1.94,.232],[s*.27,1.75,.285],[s*.26,1.59,.278]],.008,cordon,.88,0,pecho,18);
      for(let f=0;f<5;f++)C.trazo([[s*.26+(f-2)*.007,1.62,.287],[s*.26+(f-2)*.012,1.49,.29]],.0035,cordon,.9,0,pecho,5);
    }
    C.parte('Capucha','tela');
    const contorno=(u,ancho,arriba,abajo,z)=>{const a=u*TAU,c=Math.cos(a);return V(Math.sin(a)*ancho*(.94-.08*Math.max(0,c)),2.22+c*(c>=0?arriba:abajo),z);};
    const blanco=L(0x343137);
    C.superficie(44,16,(u,v)=>{
      const rings=[[.24,.36,.25,.13,0],[.245,.34,.24,-.04,0],[.21,.32,.21,-.17,0],[.13,.28,.18,-.26,0],[.0001,.0001,.0001,-.40,.32]],i=Math.min(3,Math.floor(v*4)),f=v*4-i,a=rings[i],b=rings[i+1];
      const p=contorno(u,lerp(a[0],b[0],f),lerp(a[1],b[1],f),lerp(a[2],b[2],f),lerp(a[3],b[3],f));p.y+=lerp(a[4],b[4],f);p.z+=Math.sin(u*TAU*9+v*4)*.005*Math.sin(v*Math.PI);return p;
    },tejido(negro),.97,0,cab);
    C.superficie(44,4,(u,v)=>contorno(u,lerp(.24,.175,v),lerp(.36,.255,v),lerp(.25,.205,v),lerp(.13,.195,v)),tejido(negro),.96,0,cab,true);
    C.superficie(44,3,(u,v)=>contorno(u,lerp(.172,.165,v),lerp(.252,.24,v),lerp(.20,.19,v),lerp(.193,.06,v)),L(0x39302e),.95,0,cab);
    const borde=[];for(let i=0;i<=64;i++){const p=contorno(i/64,.176,.256,.206,.198);borde.push(p.toArray());}C.trazo(borde,.0038,oro,.5,.025,cab,64);
    C.tubo([[2.025,.115,.12],[1.99,.14,.145]],20,0,-.015,tejido(blanco),.95,0,fijo('cuello'),true);
    C.parte('Mascara','mascara');
    C.elipse(0,2.22,-.012,.143,.18,.133,negro,.95,0,cab,20,12);
    C.superficie(32,12,(u,v)=>{const y=lerp(2.4,2.04,v),a=u*Math.PI;let lo=0,hi=.16;for(let i=0;i<10;i++){const x=(lo+hi)*.5;if(zMascara(x,y)>.042)lo=x;else hi=x;}const x=Math.cos(a)*lo;return V(x,y,zMascara(x,y));},(x,y,z)=>{
      const quemado=.12+.26*smooth(-.06,.09,x)+.08*Ruido.n2(x*30,y*24);return L(K.mascara).lerp(negro,quemado);
    },.5,0,cab);
    C.parte('Grieta_izquierda','brasa',3);
    for(let i=1;i<D.grieta.length;i++){const a=D.grieta[i-1],b=D.grieta[i],p=[];for(let j=0;j<=4;j++){const x=lerp(a[0],b[0],j/4),y=lerp(a[1],b[1],j/4);p.push([x,y,zMascara(x,y)+.004]);}C.trazo(p,.0028,L(0xff5b27),.5,.75,cab,5);}
    C.parte('Ornamento_mascara','oro');
    C.trazo([[0,2.397,zMascara(0,2.397)+.004],[0,2.35,zMascara(0,2.35)+.004],[0,2.30,zMascara(0,2.30)+.004]],.0025,oro,.4,.025,cab,15);
    const aro=new THREE.TorusGeometry(.021,.0028,5,18);aro.translate(0,2.331,zMascara(0,2.331)+.005);C.geoPieza(aro,oro,.4,.02,cab);
    // +X es el ojo izquierdo del personaje: a la derecha de la imagen frontal.
    const ojo=(s,interno,col,em)=>C.superficie(14,3,(u,v)=>{
      const x=s*lerp(.027,.119,u),y=2.235+.024*u+Math.sin(u*Math.PI)*lerp(interno?-.006:-.011,interno?.006:.016,v);
      return V(x,y,zMascara(x,y)+(interno?.011:.006));
    },col,interno?.35:.8,em,cab,s<0);
    C.parte('Ojo_derecho_oscuro','negro');ojo(-1,false,L(0x050406),0);
    C.parte('Cuenca_izquierda','negro');ojo(1,false,L(0x0a0404),0);
    C.parte('Ojo_izquierdo_rojo','ojo',1);ojo(1,true,rojo,1.5);
    return C.geometria();
  }
  function espada(){
    const C=new Taller(),K=D.color,p=()=>[0,1],negro=L(K.hoja),oro=L(K.oro),rojo=L(K.rojo);
    C.parte('Hoja_del_Ocaso','metal');
    C.tubo([[.10,.026,.027],[-.18,.028,.029]],14,0,.04,L(K.cordon),.83,0,p,true);
    for(let j=0;j<8;j++){const y=.08-j*.033;C.trazo([[-.022,y,.057],[0,y-.022,.071],[.022,y,.057]],.0035,negro,.7,0,p,6);}
    const g=new THREE.TorusGeometry(.079,.007,6,28);g.rotateX(Math.PI/2);g.translate(0,-.205,.04);C.geoPieza(g,oro,.45,.025,p);
    const disco=new THREE.CylinderGeometry(.075,.075,.014,24);disco.translate(0,-.205,.04);C.geoPieza(disco,L(0x453b2d),.5,0,p);
    const sh=new THREE.Shape(D.hoja.map(a=>new THREE.Vector2(a[0],a[1]))),blade=new THREE.ExtrudeGeometry(sh,{depth:.012,bevelEnabled:false,steps:1});blade.translate(0,0,.034);C.geoPieza(blade,negro,.46,0,p);
    C.parte('Filo_rojo','filo',2);
    const borde=D.hoja.slice(4).map(a=>[a[0],a[1],.049]);C.trazo(borde,.0036,rojo,.4,1.6,p,32);
    C.trazo([[-.022,-.31,.048],[.025,-.42,.048],[.003,-.49,.048],[.045,-.58,.048],[.024,-.69,.048],[.067,-.77,.048]],.0016,L(0xe94a24),.45,.65,p,20);
    C.parte('Borla_espada','tela');C.trazo([[0,.11,.04],[-.025,.17,.04],[-.018,.19,.04]],.005,L(K.cordon),.9,0,p,12);
    for(let i=0;i<5;i++)C.trazo([[-.018+(i-2)*.004,.19,.04],[-.018+(i-2)*.008,.11,.037]],.0028,L(K.cordon),.9,0,p,4);
    const geo=C.geometria();geo.deleteAttribute('skinIndex');geo.deleteAttribute('skinWeight');return geo;
  }
  function rasgarCapa(g){
    const K=D.capa,C=K.cols,R=K.filas,idx=[];
    for(let j=0;j<R-1;j++)for(let i=0;i<C-1;i++){
      const roto=(j>=R-4&&[2,7,12,17,20].includes(i)&&((i+j)%3!==0))||(j===R-6&&[4,15].includes(i));if(roto)continue;
      const a=j*C+i;idx.push(a,a+C,a+1,a+1,a+C,a+C+1);
    }g.setIndex(idx);return g;
  }
  const colorCapa=(u,v)=>{
    const c=L(D.color.negro).lerp(L(D.color.carbon),.25+.4*Math.sin(u*23+v*11)**2);
    return c.lerp(L(0x7e2d22),smooth(.65,1,v)*(.6+.4*Math.sin(u*47)**2));
  };
  let tex;
  function atlas(){
    if(tex)return tex;const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');x.fillStyle='#f4f1ea';x.fillRect(0,0,1024,1024);
    let seed=7261;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<1024;i+=3){x.fillStyle='rgba(32,25,20,.025)';x.fillRect(i,0,1,1024);x.fillRect(0,i,1024,1);}
    for(let i=0;i<1800;i++){const a=random()*1024,b=random()*1024;x.strokeStyle='rgba(60,45,30,'+(.01+random()*.045)+')';x.beginPath();x.moveTo(a,b);x.lineTo(a+random()*17,b+random()*3);x.stroke();}
    tex=new THREE.CanvasTexture(c);tex.name='Tasogare_atlas_1024';tex.encoding=THREE.sRGBEncoding;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;return tex;
  }
  return{crear,rig,espada,rasgarCapa,colorCapa,atlas,zMascara,diseno:D};
})();
