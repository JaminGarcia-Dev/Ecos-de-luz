/* Comparte la geometría y las poses del juego. La capa física se convierte en 25 huesos portables. */
async function construirTasogarePortable(){
  const D=TASOGARE_DISENO,O=Tasogare.modelo,S=new THREE.Scene();S.name='Tasogare_normal';
  S.userData={unidad:'metro',alturaCabeza:2.4,alturaCapucha:2.58,izquierdaAnatomica:'+X',frente:'+Z',ojoRojo:'izquierdo',
    variante:'normal',grieta:D.grieta,fractura:D.hoja,referencia:'Plantilla del usuario, ocho vistas. La forma gigante tiene su propio recurso.'};
  const B=O.definicion.map(h=>{const b=new THREE.Bone();b.name=h[0];b.position.set(h[2],h[3],h[4]);return b;});
  O.definicion.forEach((h,i)=>h[1]<0?S.add(B[i]):B[h[1]].add(B[i]));
  const base=B.length,cadenas=[],reposos=new Map(),mallas=[];
  const capaP=(u,v)=>{
    const idx=u*(D.capa.cols-1),i=Math.min(D.capa.cols-2,Math.floor(idx)),d=lerp(D.capa.dientes[i],D.capa.dientes[i+1],idx-i),a=u*2-1;
    return new THREE.Vector3(a*lerp(D.capa.arriba,D.capa.abajo,v)*.5,1.97-v*(D.capa.largo-d),-.30-.25*v-.05*(1-a*a)+.08*a*a);
  };
  for(let c=0;c<5;c++){
    const cad=[];for(let j=0;j<5;j++){
      const b=new THREE.Bone();b.name='capa_'+c+'_'+j;b.position.copy(capaP(c/4,j/4)).sub(j?capaP(c/4,(j-1)/4):new THREE.Vector3(0,1.68,0));
      (j?cad[j-1]:B[2]).add(b);reposos.set(b,b.position.clone());B.push(b);cad.push(b);
    }cadenas.push(cad);
  }
  const atlas=ModeloTasogare.atlas(),mat={
    tela:new THREE.MeshStandardMaterial({name:'Tejido_negro',vertexColors:true,map:atlas,roughness:.95,skinning:true,side:THREE.DoubleSide}),
    armadura:new THREE.MeshStandardMaterial({name:'Acero_ennegrecido',vertexColors:true,map:atlas,metalness:.5,roughness:.52,skinning:true,side:THREE.DoubleSide}),
    oro:new THREE.MeshStandardMaterial({name:'Oro_envejecido',vertexColors:true,metalness:.65,roughness:.44,skinning:true,side:THREE.DoubleSide}),
    mascara:new THREE.MeshStandardMaterial({name:'Marfil_hollin',vertexColors:true,map:atlas,roughness:.5,skinning:true,side:THREE.DoubleSide}),
    negro:new THREE.MeshStandardMaterial({name:'Ojo_derecho_oscuro',vertexColors:true,roughness:1,side:THREE.DoubleSide}),
    ojo:new THREE.MeshStandardMaterial({name:'Emision_ojo_izquierdo',vertexColors:true,emissive:lin(D.color.rojo),emissiveIntensity:.9,roughness:.5,side:THREE.DoubleSide}),
    filo:new THREE.MeshStandardMaterial({name:'Emision_filo',vertexColors:true,emissive:lin(D.color.rojo),emissiveIntensity:.9,roughness:.4,side:THREE.DoubleSide}),
    brasa:new THREE.MeshStandardMaterial({name:'Emision_brasa',vertexColors:true,emissive:lin(0xf15a27),emissiveIntensity:.45,roughness:.7,skinning:true,side:THREE.DoubleSide}),
    capa:new THREE.MeshStandardMaterial({name:'Capa_carbon_brasa',vertexColors:true,map:atlas,emissive:lin(0x2e0804),emissiveIntensity:.35,roughness:.95,skinning:true,side:THREE.DoubleSide})
  };
  S.updateMatrixWorld(true);const invCabeza=new THREE.Matrix4().copy(B[4].matrixWorld).invert();
  function separar(geo,padre,skin=true){
    for(const parte of geo.userData.partes){
      const g=new THREE.BufferGeometry(),lista=[],remap=new Map(),porMat=new Map(),indices=[];
      for(let t=parte.inicio;t<parte.inicio+parte.cantidad;t+=3){
        const v=geo.index.getX(t),rug=geo.attributes.aMat.getX(v),em=geo.attributes.aMat.getY(v);
        const tipo=['ojo','filo','brasa','negro'].includes(parte.material)?parte.material:rug<.48&&em<.1?'oro':parte.material==='oro'?(rug>.7?'tela':'oro'):['metal','armadura'].includes(parte.material)?'armadura':parte.material;
        if(!porMat.has(tipo))porMat.set(tipo,[]);
        for(let k=0;k<3;k++){const id=geo.index.getX(t+k);if(!remap.has(id)){remap.set(id,lista.length);lista.push(id);}porMat.get(tipo).push(remap.get(id));}
      }
      for(const [nombre,a]of Object.entries(geo.attributes))if(!['aMat','aCanal'].includes(nombre)){
        const arr=new a.array.constructor(lista.length*a.itemSize);lista.forEach((id,i)=>{for(let k=0;k<a.itemSize;k++)arr[i*a.itemSize+k]=a.array[id*a.itemSize+k];});g.setAttribute(nombre,new THREE.BufferAttribute(arr,a.itemSize,a.normalized));
      }
      porMat.forEach((ix,tipo)=>{g.addGroup(indices.length,ix.length,Object.keys(mat).indexOf(tipo));indices.push(...ix);});g.setIndex(indices);
      const cabezaRigida=skin&&['Ojo_izquierdo_rojo','Ojo_derecho_oscuro','Cuenca_izquierda','Grieta_izquierda'].includes(parte.nombre);
      if(!skin||cabezaRigida){g.deleteAttribute('skinIndex');g.deleteAttribute('skinWeight');if(cabezaRigida)g.applyMatrix4(invCabeza);}
      const m=skin&&!cabezaRigida?new THREE.SkinnedMesh(g,Object.values(mat)):new THREE.Mesh(g,Object.values(mat));
      m.name=parte.nombre==='Hoja_del_Ocaso'?'Acero_fracturado':parte.nombre;m.frustumCulled=false;(cabezaRigida?B[4]:padre).add(m);if(m.isSkinnedMesh)mallas.push(m);
    }
  }
  separar(O.malla.geometry,S);
  const arma=new THREE.Group();arma.name='Hoja_del_Ocaso';arma.position.copy(O.arma.position);arma.quaternion.copy(O.arma.quaternion);B[10].add(arma);separar(O.arma.geometry,arma,false);
  const p=[],c=[],uv=[],si=[],sw=[];
  for(let j=0;j<D.capa.filas;j++)for(let i=0;i<D.capa.cols;i++){
    const u=i/(D.capa.cols-1),v=j/(D.capa.filas-1),q=capaP(u,v),co=ModeloTasogare.colorCapa(u,v),a=Math.min(3,Math.floor(u*4)),b=Math.min(3,Math.floor(v*4)),x=u*4-a,y=v*4-b;
    p.push(q.x,q.y,q.z);c.push(co.r,co.g,co.b);uv.push(u,v);si.push(base+a*5+b,base+(a+1)*5+b,base+a*5+b+1,base+(a+1)*5+b+1);sw.push((1-x)*(1-y),x*(1-y),(1-x)*y,x*y);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));ModeloTasogare.rasgarCapa(g);g.computeVertexNormals();
  const capa=new THREE.SkinnedMesh(g,mat.capa);capa.name='Capa_desgarrada';S.add(capa);mallas.push(capa);
  S.updateMatrixWorld(true);const skeleton=new THREE.Skeleton(B);
  for(const m of mallas){const a=m.geometry.attributes;for(let i=0;i<a.skinIndex.count*4;i++)if(a.skinWeight.array[i]===0)a.skinIndex.array[i]=0;m.bind(skeleton);}
  const crearVacio=(nombre,padre,pos,datos)=>{const o=new THREE.Object3D();o.name=nombre;o.position.fromArray(pos);o.userData=datos||{};padre.add(o);return o;};
  crearVacio('Ancla_espada',B[10],[0,0,0]);crearVacio('Emisor_brasas',B[2],[0,.29,-.3],{tipo:'particulas_JS',porSegundo:7});
  crearVacio('Colision_capsula',S,[0,1.2,0],{tipo:'capsula',radio:.43,alturaTotal:2.4});
  crearVacio('Volumen_dano',B[2],[0,-.25,0],{tipo:'capsula',radio:.4,alturaTotal:1.8});
  crearVacio('Volumen_golpe_espada',B[10],[0,-.57,.04],{tipo:'segmento_barrido',desde:[0,-.205,.04],hasta:[.05,-.94,.04],radio:.12,activoSoloEnCorte:true});
  const luz=new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),new THREE.MeshStandardMaterial({name:'Ultima_luz',color:0xffefca,emissive:0xffdb9b,emissiveIntensity:1}));luz.name='Luz_entregada';luz.position.set(0,-.08,.14);luz.scale.setScalar(.0001);B[7].add(luz);
  const ojo=S.getObjectByName('Ojo_izquierdo_rojo'),clips=[],dt=1/30;
  const defs=[
    {nombre:'Reposo',dur:TAU/1.3,ciclo:true,inicio:'reposo',f:()=>{}},
    {nombre:'Caminar',dur:TAU/(.65*5),ciclo:true,inicio:'reposo',andar:.65,f:()=>{}},
    {nombre:'Giro',dur:1.5,inicio:'reposo',f:()=>{}},
    {nombre:'Preparar_ataque',dur:.8,inicio:'guardia',f:t=>Tasogare.pose('alzar',6)},
    {nombre:'Corte',dur:.4,inicio:'alzar',f:t=>{if(t>.025)Tasogare.pose('corte',14);}},
    {nombre:'Recuperacion',dur:1,inicio:'corte',f:()=>Tasogare.pose('guardia',3)},
    {nombre:'Recibir_dano',dur:.7,inicio:'guardia',f:t=>Tasogare.pose(t<.22?'recibir':'guardia',t<.22?14:4)},
    {nombre:'Abrir_capa',dur:2,inicio:'hablar',f:()=>Tasogare.abrirAlas(true)},
    {nombre:'Entregar_luz',dur:3,inicio:'rodillas',f:()=>Tasogare.pose('entregar',2)}
  ];
  Tasogare.mostrar(true);Tasogare.colocar(0,0,0,0);Tasogare.efectos({brasas:0});
  for(const def of defs){
    Tasogare.reiniciar();Tasogare.pose(def.inicio,0,true);Tasogare.caminar(def.andar||0);
    for(let i=0;i<90;i++)Tasogare.actualizar(dt);
    const n=Math.ceil(def.dur*30),times=[],qs=B.map(()=>[]),ps=B.map(()=>[]),ls=[],lp=[],os=[];
    for(let f=0;f<=n;f++){
      const t=f*def.dur/n;times.push(t);def.f(t);Tasogare.actualizar(def.dur/n);
      O.huesos.forEach((b,i)=>{B[i].quaternion.copy(b.quaternion);B[i].position.copy(b.position);});
      if(def.nombre==='Giro')B[0].quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),smooth(0,def.dur,t)*Math.PI));
      const desplegar=def.nombre==='Abrir_capa'?smooth(0,1.7,t):0;
      cadenas.forEach((cad,col)=>cad.forEach((b,j)=>{
        b.position.copy(reposos.get(b));const u=(col-2)/2,arriba=D.capa.arriba+1.5*desplegar,abajo=lerp(D.capa.abajo,D.capa.vuelo,desplegar);
        b.position.x=j?u*(abajo-arriba)/8:u*arriba*.5;if(j===0){b.position.y+=.4*desplegar*Math.abs(u);b.position.z-=.12*desplegar;}
        b.quaternion.setFromEuler(new THREE.Euler(.025*Math.sin(t*TAU/def.dur-j*.65+col*.4),0,(col-2)*.055*desplegar));
      }));
      B.forEach((b,i)=>{qs[i].push(...b.quaternion.toArray());ps[i].push(...b.position.toArray());});
      const entrega=def.nombre==='Entregar_luz'?smooth(.6,1.4,t)*(1-smooth(2.5,3,t)):0;
      ls.push(...[0,1,2].map(()=>Math.max(.0001,entrega*1.4)));lp.push(0,-.08+smooth(1.5,3,t)*.35,.14+smooth(1.4,3,t)*.35);
      const encendido=def.nombre==='Entregar_luz'?1-smooth(1,2.8,t):1;os.push(...[0,1,2].map(()=>Math.max(.0001,encendido)));
    }
    const tracks=[];
    B.forEach((b,i)=>{
      if(def.ciclo){const q0=new THREE.Quaternion().fromArray(qs[i]),q=new THREE.Quaternion();for(let f=n-5;f<=n;f++){const w=smooth(n-5,n,f);q.fromArray(qs[i],f*4).slerp(q0,w).toArray(qs[i],f*4);for(let k=0;k<3;k++)ps[i][f*3+k]=lerp(ps[i][f*3+k],ps[i][k],w);}}
      tracks.push(new THREE.QuaternionKeyframeTrack(b.name+'.quaternion',times,qs[i]));if(i===0||i>=base)tracks.push(new THREE.VectorKeyframeTrack(b.name+'.position',times,ps[i]));
    });
    tracks.push(new THREE.VectorKeyframeTrack(luz.name+'.scale',times,ls),new THREE.VectorKeyframeTrack(luz.name+'.position',times,lp),new THREE.VectorKeyframeTrack(ojo.name+'.scale',times,os));
    const clip=new THREE.AnimationClip(def.nombre,def.dur,tracks).optimize();clips.push(clip);
  }
  O.definicion.forEach((h,i)=>{B[i].position.set(h[2],h[3],h[4]);B[i].quaternion.identity();});reposos.forEach((p,b)=>{b.position.copy(p);b.quaternion.identity();});S.updateMatrixWorld(true);
  Tasogare.reiniciar();Tasogare.efectos({brasas:1});
  const reporte={variante:'normal',alturaCabeza:2.4,alturaCapucha:2.58,triangulos:0,huesos:B.length,atlas:[1024,1024],ojoRojo:'izquierdo (+X)',animaciones:clips.map(c=>({nombre:c.name,duracion:c.duration,pistas:c.tracks.length})),piezas:[]},mats=new Set();
  S.traverse(o=>{if(!o.isMesh)return;const n=o.geometry.index?o.geometry.index.count/3:o.geometry.attributes.position.count/3;reporte.triangulos+=n;reporte.piezas.push({nombre:o.name,triangulos:n});if(Array.isArray(o.material))o.geometry.groups.forEach(g=>mats.add(o.material[g.materialIndex].name));else mats.add(o.material.name);});reporte.materiales=mats.size;
  const exportar=binary=>new Promise((resolve,reject)=>{try{new THREE.GLTFExporter().parse(S,resolve,{binary,animations:clips,trs:true});}catch(e){reject(e);}});
  const bin=await exportar(true),fuente=await exportar(false);
  const escenaArma=new THREE.Scene(),copiaArma=arma.clone(true);copiaArma.position.set(0,0,0);copiaArma.quaternion.identity();escenaArma.add(copiaArma);escenaArma.userData={unidad:'metro',fractura:D.hoja};
  const binArma=await new Promise(resolve=>new THREE.GLTFExporter().parse(escenaArma,resolve,{binary:true,trs:true}));
  const codificar=bin=>{let texto='';const a=new Uint8Array(bin);for(let i=0;i<a.length;i+=8192)texto+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(texto);};
  return{glb:codificar(bin),arma:codificar(binArma),gltf:JSON.stringify(fuente),atlas:atlas.image.toDataURL('image/png').split(',')[1],reporte};
}
