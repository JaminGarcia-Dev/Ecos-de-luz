/* Fuente editable de la entrega GLB. Se ejecuta en la página del juego desde exportar-hikari.mjs.
   Comparte la geometría y hornea las poses de Hikari; sustituye la tela física por huesos portables. */
async function construirHikariPortable() {
  const D = HIKARI_DISENO, original = Hikari.modelo, grupo = new THREE.Scene(); grupo.name = 'Hikari';
  grupo.userData = { autor: 'Ecos de Luz', unidad: 'metro', alturaSinCapucha: 1.15, frente: '+Z',
    referencia: 'Hoja modelo de Hikari, ocho vistas, proporcionada por el usuario',
    colision: { tipo: 'capsula', radio: .16, altura: 1.15, centro: [0,.575,0] } };
  const huesos = original.definicion.map(h => { const b = new THREE.Bone(); b.name = h[0]; b.position.set(h[2],h[3],h[4]); return b; });
  original.definicion.forEach((h,i) => h[1] < 0 ? grupo.add(huesos[i]) : huesos[h[1]].add(huesos[i]));
  const pecho = huesos[2], cabeza = huesos[4], geo = original.malla.geometry;
  const atlas = ModeloHikari.atlas(), materiales = {
    tela: new THREE.MeshStandardMaterial({ name:'Tela_marfil_indigo',vertexColors:true,map:atlas,roughness:.88,skinning:true,side:THREE.DoubleSide }),
    ceramica: new THREE.MeshStandardMaterial({ name:'Mascara_marfil',vertexColors:true,roughness:.43,skinning:true,side:THREE.DoubleSide }),
    oro: new THREE.MeshStandardMaterial({ name:'Oro',vertexColors:true,metalness:.65,roughness:.36,skinning:true,side:THREE.DoubleSide }),
    luz: new THREE.MeshStandardMaterial({ name:'Luz_turquesa',vertexColors:true,emissive:lin(D.color.linea),emissiveIntensity:.7,roughness:.4,skinning:true,side:THREE.DoubleSide }),
    capa: new THREE.MeshStandardMaterial({ name:'Capa_carmesi_ambar',vertexColors:true,map:atlas,roughness:.9,skinning:true,side:THREE.DoubleSide }),
    llama: new THREE.MeshStandardMaterial({ name:'Llama_dorada',vertexColors:true,emissive:lin(0xffc35c),emissiveIntensity:.7,roughness:.5,side:THREE.DoubleSide }),
    cinta: new THREE.MeshStandardMaterial({ name:'Cinta_turquesa',color:lin(D.color.linea),emissive:lin(0x2aa8b2),emissiveIntensity:.7,roughness:.5,skinning:true,side:THREE.DoubleSide }),
    ala: new THREE.MeshStandardMaterial({ name:'Alas_de_luz',color:lin(0xa3fff1),emissive:lin(0x63e9d9),emissiveIntensity:.7,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false })
  };
  const mallas = [], cuerpos = [];
  // Cada pieza conserva su rig, UV y colores. El atributo de shader aMat se convierte a materiales PBR normales.
  for (const parte of geo.userData.partes) {
    const g = new THREE.BufferGeometry(), lista = [], remap = new Map(), indices = [], grupos = [], porMaterial = new Map();
    for (let t = parte.inicio; t < parte.inicio + parte.cantidad; t += 3) {
      const v = geo.index.getX(t), rug = geo.attributes.aMat.getX(v), em = geo.attributes.aMat.getY(v);
      const tipo = em >= .8 ? 'luz' : rug < .42 && em > .01 ? 'oro' : parte.nombre === 'mascara_marfil' && rug < .6 ? 'ceramica' : 'tela';
      if(!porMaterial.has(tipo))porMaterial.set(tipo,[]);
      for(let k=0;k<3;k++) { const id=geo.index.getX(t+k); if(!remap.has(id)){remap.set(id,lista.length);lista.push(id);} porMaterial.get(tipo).push(remap.get(id)); }
    }
    for (const [nombre,a] of Object.entries(geo.attributes)) if(nombre!=='aMat') {
      const arr=new a.array.constructor(lista.length*a.itemSize); lista.forEach((id,i)=>{for(let k=0;k<a.itemSize;k++)arr[i*a.itemSize+k]=a.array[id*a.itemSize+k];});
      g.setAttribute(nombre,new THREE.BufferAttribute(arr,a.itemSize,a.normalized));
    }
    porMaterial.forEach((ix,tipo)=>{grupos.push({start:indices.length,count:ix.length,materialIndex:Object.keys(materiales).indexOf(tipo)});indices.push(...ix);});
    g.setIndex(indices); grupos.forEach(a=>g.addGroup(a.start,a.count,a.materialIndex));
    const m=new THREE.SkinnedMesh(g,Object.values(materiales));m.name=parte.nombre;m.frustumCulled=false;grupo.add(m);mallas.push(m);cuerpos.push(m);
  }
  const capaP = (u,v) => new THREE.Vector3((u*2-1)*lerp(D.capa.arriba,D.capa.abajo,Math.sin(v*Math.PI*.5))*.5,
    .865-v*D.capa.largo*(1-.16*(u*2-1)**2),-.095-.025*v-.02*(1-(u*2-1)**2));
  // Cinco cadenas de cuatro huesos. Las marcas se montan sobre la cadena central.
  const cadenas=[], reposos=new Map();
  for(let i=0;i<5;i++) {
    const cadena=[];
    for(let j=0;j<4;j++) {
      const b=new THREE.Bone(), p=capaP(i/4,j/3); b.name='capa_'+i+'_'+j;
      b.position.copy(p).sub(j?capaP(i/4,(j-1)/3):new THREE.Vector3(0,.78,0));
      (j?cadena[j-1]:pecho).add(b);huesos.push(b);cadena.push(b);reposos.set(b,b.position.clone());
    } cadenas.push(cadena);
  }
  function tejido(nombre,nx,ny,pos,color,peso,mat) {
    const p=[],c=[],uv=[],si=[],sw=[],ix=[];
    for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
      const u=i/nx,v=j/ny,q=pos(u,v),co=color(u,v),w=peso(u,v);
      p.push(q.x,q.y,q.z);c.push(co.r,co.g,co.b);uv.push(u,v);si.push(...w[0]);sw.push(...w[1]);
    }
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;ix.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));g.setIndex(ix);g.computeVertexNormals();
    const m=new THREE.SkinnedMesh(g,mat);m.name=nombre;m.frustumCulled=false;grupo.add(m);mallas.push(m);return m;
  }
  const colores=D.color.capa.map(lin);
  tejido('Capa',24,20,capaP,(u,v)=>{
    const c=v<.55?colores[0].clone().lerp(colores[1],v/.55):colores[1].clone().lerp(colores[2],(v-.55)/.45);
    return v>.91||u<.025||u>.975?c.lerp(lin(D.ribete),.95):c;
  },(u,v)=>{
    const a=Math.min(3,Math.floor(u*4)),b=Math.min(2,Math.floor(v*3)),x=u*4-a,y=v*3-b;
    return [[huesos.indexOf(cadenas[a][b]),huesos.indexOf(cadenas[a+1][b]),huesos.indexOf(cadenas[a][b+1]),huesos.indexOf(cadenas[a+1][b+1])],[(1-x)*(1-y),x*(1-y),(1-x)*y,x*y]];
  },materiales.capa);
  const marcas=[];
  D.llamas.filas.forEach((fila,i)=>{
    const v=fila/(D.capa.filas-1),j=Math.round(v*3),padre=cadenas[2][j],m=new THREE.Mesh(ModeloHikari.llama(),materiales.llama);
    m.name='Llama_'+(i+1);m.position.copy(capaP(.5,v)).sub(capaP(.5,j/3));m.position.z-=.008;m.rotation.y=Math.PI;
    m.scale.set(D.llamas.ancho,D.llamas.alto,1);m.userData={vida:i+1,control:'visible'};padre.add(m);marcas.push(m);
  });
  const cintas=[];
  for(const s of [-1,1]){
    const cad=[];const pos=v=>new THREE.Vector3(s*(.075+.13*v+.04*Math.sin(v*Math.PI)),.92-.61*v,-.095-.11*v);
    for(let j=0;j<5;j++){const b=new THREE.Bone();b.name='cinta_'+(s>0?'I':'D')+'_'+j;b.position.copy(pos(j/4)).sub(j?pos((j-1)/4):new THREE.Vector3(0,.78,0));(j?cad[j-1]:pecho).add(b);huesos.push(b);reposos.set(b,b.position.clone());cad.push(b);}cintas.push(cad);
    tejido('Cinta_'+(s>0?'I':'D'),2,20,(u,v)=>pos(v).add(new THREE.Vector3((u-.5)*lerp(.025,.013,v),0,0)),()=>new THREE.Color(1,1,1),(u,v)=>{
      const j=Math.min(3,Math.floor(v*4)),f=v*4-j;return [[huesos.indexOf(cad[j]),huesos.indexOf(cad[j+1]),0,0],[1-f,f,0,0]];
    },materiales.cinta);
  }
  grupo.updateMatrixWorld(true);const skeleton=new THREE.Skeleton(huesos);mallas.forEach(m=>{
    const g=m.geometry,si=g.attributes.skinIndex,sw=g.attributes.skinWeight;
    for(let i=0;i<si.count;i++)for(let k=0;k<4;k++)if(sw.array[i*4+k]===0)si.array[i*4+k]=0;
    m.bind(skeleton);
  });
  const alas=original.alas.map((a,i)=>{
    const g=a.geometry.clone();g.deleteAttribute('color');g.computeVertexNormals();const m=new THREE.Mesh(g,materiales.ala);m.name='Ala_'+(i?'D':'I');m.position.copy(a.position);m.scale.set(i?-1:1,.0001,.0001);pecho.add(m);return m;
  });
  // La variante agrietada se activa como una pieza separada sobre la máscara intacta, sin duplicar su piel.
  const agrietada=new THREE.Group();agrietada.name='mascara_agrietada';agrietada.scale.setScalar(.0001);cabeza.add(agrietada);
  const grieta=new THREE.Mesh(original.grieta.geometry.clone(),new THREE.MeshStandardMaterial({name:'Grieta_oscura',color:0x241a1a,roughness:.95}));
  grieta.geometry.setDrawRange(0,Infinity);grieta.name='Grieta';agrietada.add(grieta);
  const anclas=[['Ancla_arma_D',12,[0,-.045,.01]],['Ancla_arma_I',8,[0,-.045,.01]],['Ancla_farol',0,[.15,-.03,.06]],['Ancla_espalda',2,[0,.02,-.12]]];
  anclas.forEach(([nombre,i,p])=>{const a=new THREE.Object3D();a.name=nombre;a.position.fromArray(p);huesos[i].add(a);});
  const col=new THREE.Object3D();col.name='Colision_capsula';col.userData={tipo:'capsula',radio:.16,altura:1.15,centro:[0,.575,0]};grupo.add(col);
  const clips=[], fps=30, dt=1/fps, defs=[
    ['Reposo',4,true,()=>({suelo:true})],
    ['Caminar',4*(.36+.11*1.1)/1.1,true,()=>({suelo:true,vel:1.1,vz:1.1})],
    ['Correr',4*(.36+.11*4.2)/4.2,true,()=>({suelo:true,vel:4.2,vz:4.2})],
    ['Saltar',.8,false,t=>({suelo:false,vy:5-5*t})],
    ['Caer',1,true,()=>({suelo:false,vy:-5})],
    ['Aterrizar',.8,false,t=>({suelo:t>.1,vy:t>.1?0:-4,impacto:t>.1&&t<.15?8:0})],
    ['Despegar',1,false,t=>({suelo:false,vy:3,planeo:t>.3,vel:5,vz:5})],
    ['Planear',2,true,()=>({suelo:false,planeo:true,vel:6,vz:6})]
  ];
  const sueloAnterior=sueloEnJ;sueloEnJ=()=>0;
  try {
    for(const [nombre,duracion,ciclo,estado] of defs){
      Hikari.mover(0,0,0,0);Hikari.reiniciarAnimacion();let recorrido=0;
      const paso=(t,delta=dt)=>{const st={luz:1,giro:0,vy:0,...estado(t)};recorrido+=(st.vel||0)*delta;Hikari.mover(0,0,recorrido,0);Hikari.animar(delta,st);return st;};
      for(let i=0;i<(ciclo?90:12);i++)paso(ciclo?1:0);
      const n=Math.round(duracion*fps),tiempos=[],q=huesos.map(()=>[]),p=huesos.map(()=>[]),alasS=alas.map(()=>[]);
      for(let f=0;f<=n;f++){
        const t=f*duracion/n,st=paso(t,duracion/n),vuelo=nombre==='Planear'?1:nombre==='Despegar'?smooth(.25,.75,t):0;
        tiempos.push(t);
        original.huesos.forEach((b,i)=>{huesos[i].position.copy(b.position);huesos[i].quaternion.copy(b.quaternion);});
        cadenas.forEach((cad,c)=>cad.forEach((b,j)=>{
          b.position.copy(reposos.get(b));b.quaternion.setFromEuler(new THREE.Euler((j?.045:.035)*Math.sin(t*TAU/duracion-j*.8+c*.4)+(j===0?.06*vuelo:0),0,(c-2)*.10*vuelo));
        }));
        cintas.forEach((cad,c)=>cad.forEach((b,j)=>b.quaternion.setFromEuler(new THREE.Euler(.08*Math.sin(t*TAU/duracion-j*.7),.12*Math.sin(t*TAU/duracion-j*.6+c),0))));
        huesos.forEach((b,i)=>{q[i].push(...b.quaternion.toArray());p[i].push(...b.position.toArray());});
        alas.forEach((a,i)=>alasS[i].push(i?-1:1,Math.max(.0001,vuelo*.9),Math.max(.0001,vuelo)));
      }
      const tracks=[];
      huesos.forEach((b,i)=>{
        if(ciclo){
          const inicio=new THREE.Quaternion().fromArray(q[i]),qa=new THREE.Quaternion();
          for(let f=Math.max(0,n-5);f<=n;f++){
            const w=smooth(n-5,n,f);qa.fromArray(q[i],f*4).slerp(inicio,w).toArray(q[i],f*4);
            for(let k=0;k<3;k++)p[i][f*3+k]=lerp(p[i][f*3+k],p[i][k],w);
          }
        }
        tracks.push(new THREE.QuaternionKeyframeTrack(b.name+'.quaternion',tiempos,q[i]));
        // La posición solo varía en la cadera; el resto conserva su longitud de reposo.
        if(i===0)tracks.push(new THREE.VectorKeyframeTrack(b.name+'.position',tiempos,p[i]));
      });
      alas.forEach((a,i)=>tracks.push(new THREE.VectorKeyframeTrack(a.name+'.scale',tiempos,alasS[i])));
      clips.push(new THREE.AnimationClip(nombre,duracion,tracks).optimize());
    }
  } finally {sueloEnJ=sueloAnterior;Hikari.mover(0,0,0,0);Hikari.reiniciarAnimacion();}
  // Devuelve todo al bind pose antes de exportar: no guardar accidentalmente una pose de planeo.
  original.definicion.forEach((h,i)=>{huesos[i].position.set(h[2],h[3],h[4]);huesos[i].quaternion.identity();});
  reposos.forEach((p,b)=>{b.position.copy(p);b.quaternion.identity();});grupo.updateMatrixWorld(true);
  const reporte={triangulos:0,triangulosVisibles:0,huesos:huesos.length,materiales:0,animaciones:clips.map(c=>({nombre:c.name,duracion:c.duration,pistas:c.tracks.length})),atlas:[1024,1024],alturaSinPunta:1.15,alturaConCapucha:1.31,piezas:[]};
  const mats=new Set();grupo.traverse(o=>{if(!o.isMesh)return;const n=o.geometry.index?o.geometry.index.count/3:o.geometry.attributes.position.count/3;reporte.triangulos+=n;if(o!==agrietada)reporte.triangulosVisibles+=n;reporte.piezas.push({nombre:o.name,triangulos:n});if(Array.isArray(o.material))o.geometry.groups.forEach(g=>mats.add(o.material[g.materialIndex].name));else mats.add(o.material.name);});reporte.materiales=mats.size;
  const exportar=binary=>new Promise((resolve,reject)=>{try{new THREE.GLTFExporter().parse(grupo,resolve,{binary,animations:clips,onlyVisible:true,trs:true});}catch(e){reject(e);}});
  const bin=await exportar(true),fuente=await exportar(false);
  const base64=buffer=>{const a=new Uint8Array(buffer);let s='';for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(s);};
  return {glb:base64(bin),gltf:JSON.stringify(fuente),atlas:atlas.image.toDataURL('image/png').split(',')[1],reporte};
}
