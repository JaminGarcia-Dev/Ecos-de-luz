// GLB, glTF editable, atlas, validación, capturas y fuente Blender de Tasogare. Nunca modifica ZIP.
import {chromium} from 'playwright-core';
import {validateBytes} from 'gltf-validator';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {generarVisorTasogare} from './visor-tasogare.mjs';
const raiz=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),salida=path.join(raiz,'modelos/tasogare');
const arg=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1];};
fs.mkdirSync(salida,{recursive:true});
const servidor=http.createServer((q,r)=>{
  const p=path.resolve(raiz,'.'+decodeURIComponent(q.url.split('?')[0]==='/'?'/index.html':q.url.split('?')[0]));
  if(path.relative(raiz,p).startsWith('..')||!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);r.end();return;}
  r.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.glb':'model/gltf-binary'})[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(r);
});
await new Promise(r=>servidor.listen(0,'127.0.0.1',r));let nav;
try{
  nav=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist','--disable-gpu-vsync']});
  const p=await nav.newPage({viewport:{width:1100,height:1100}}),errores=[];p.on('pageerror',e=>errores.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errores.push(m.text());});await p.route('**/favicon.ico',r=>r.fulfill({status:204}));
  await p.addInitScript(()=>{localStorage.clear();localStorage.setItem('ecos2_ajustes',JSON.stringify({calidad:'alta'}));});
  const base='http://127.0.0.1:'+servidor.address().port;
  await p.goto(base+'/index.html?depurar');await p.waitForFunction(()=>window.__ecos&&__ecos.estado()==='portada',null,{timeout:180000});
  await p.evaluate(()=>{__ecos.empezarRapido(true);__ecos.manual(true);});
  const prueba=await p.evaluate(()=>{
    Tasogare.mostrar(true);Tasogare.colocar(0,0,0,0);Tasogare.efectos({brasas:0});
    const estados=[];for(const nombre of Object.keys(TASOGARE.poses)){
      Tasogare.reiniciar();Tasogare.pose(nombre,0,true);const t=performance.now();
      for(let i=0;i<90;i++)Tasogare.actualizar(1/60);
      let valido=Tasogare.capa.p.every(Number.isFinite);Tasogare.root.traverse(o=>{if(!o.matrixWorld.elements.every(Number.isFinite))valido=false;});
      estados.push({nombre,valido,cpuMs:+((performance.now()-t)/90).toFixed(3)});
    }
    const geo=Tasogare.modelo.arma.geometry,before=Array.from(geo.attributes.position.array);Tasogare.hojaEntera(true);
    const oculta=!Tasogare.modelo.punta.visible,punta=Tasogare.romperHoja();scene.remove(punta);
    const fracturaConstante=before.every((v,i)=>v===geo.attributes.position.array[i]);
    Tasogare.efectos({ojo:0,filo:1.3,brasa:.4,brasas:0,oscuridad:.5});Tasogare.actualizar(1/60);
    const canales=Tasogare.efectos();Tasogare.efectos({ojo:1,filo:1,brasa:1,brasas:0,oscuridad:0});
    return{estados,fracturaConstante,puntaOcultaEnPrologo:oculta,ojoIzquierdo:TASOGARE_DISENO.ojoIzquierdo[0]>0,canales};
  });
  fs.writeFileSync(path.join(salida,'revision-juego.json'),JSON.stringify(prueba,null,2));
  if(prueba.estados.some(e=>!e.valido)||!prueba.fracturaConstante||!prueba.ojoIzquierdo)throw Error('Falló la revisión del modelo en el juego');
  const narrativa=await p.evaluate(()=>{
    let fin=false,n=0;Cin.intro(()=>fin=true);
    while(Cin.activa&&n<6000){U.uT.value+=1/30;Tasogare.actualizar(1/30);Cin.actualizar(1/30);if(n%90===0)Render.dibujar();n++;}
    const fases=new Set(),emitir=Bus.emit,golpes=[];let parada=false;
    Bus.emit=(ev,...args)=>{if(ev==='dañoJugador'){golpes.push(args[0]);return;}return emitir.call(Bus,ev,...args);};
    try{
      Bus.emit('empieza:duelo');const s=sitio('faro'),j={...J,x:s.x,y:sueloEnJ(s.x,Estr.yFaro+6,s.z+14),z:s.z+14,vivo:true};
      for(let i=0;i<900;i++){
        if(Duelo.enPie()){j.x=Duelo.x;j.z=Duelo.z+3;j.y=sueloEnJ(j.x,Estr.yFaro+6,j.z);}
        Duelo.actualizar(1/60,j);Tasogare.actualizar(1/60);fases.add(Duelo.fase);
        if(!parada&&Duelo.fase==='aviso'&&i>200){Duelo.parada();parada=Duelo.fase==='tambaleo';}
      }
    }finally{Bus.emit=emitir;}
    return{prologo:{terminado:fin,segundosSimulados:n/30,camaraValida:camera.position.toArray().every(Number.isFinite)},combate:{fases:[...fases],parada,anticipacion:DUELO.corte.aviso,anticipacionCombo:DUELO.corte.avisoCombo,corte:DUELO.corte.dur,golpes:golpes.length}};
  });
  fs.writeFileSync(path.join(salida,'revision-narrativa-combate.json'),JSON.stringify(narrativa,null,2));
  if(!narrativa.prologo.terminado||!narrativa.combate.fases.includes('corte')||!narrativa.combate.parada)throw Error('Falló el prólogo o el combate real');
  await p.addScriptTag({url:base+'/herramientas/vendor/GLTFExporter-r128.js'});await p.addScriptTag({url:base+'/herramientas/tasogare-portable.js'});
  const datos=await p.evaluate(()=>construirTasogarePortable()),bin=Buffer.from(datos.glb,'base64');
  fs.writeFileSync(path.join(salida,'tasogare.glb'),bin);fs.writeFileSync(path.join(salida,'tasogare.gltf'),datos.gltf);fs.writeFileSync(path.join(salida,'tasogare-atlas-1024.png'),Buffer.from(datos.atlas,'base64'));
  fs.writeFileSync(path.join(salida,'hoja-del-ocaso.glb'),Buffer.from(datos.arma,'base64'));
  generarVisorTasogare(raiz);
  const v=await validateBytes(new Uint8Array(bin),{uri:'tasogare.glb',maxIssues:100});fs.writeFileSync(path.join(salida,'validacion-gltf.json'),JSON.stringify(v,null,2));
  datos.reporte.bytes=bin.length;datos.reporte.validacion={errores:v.issues.numErrors,avisos:v.issues.numWarnings};datos.reporte.errores=errores;
  fs.writeFileSync(path.join(salida,'informe.json'),JSON.stringify(datos.reporte,null,2));console.log(JSON.stringify(datos.reporte,null,2));
  if(v.issues.numErrors)throw Error('GLB inválido: '+JSON.stringify(v.issues.messages.filter(m=>m.severity===0)));
  const va=await validateBytes(new Uint8Array(Buffer.from(datos.arma,'base64')),{uri:'hoja-del-ocaso.glb'});fs.writeFileSync(path.join(salida,'validacion-arma.json'),JSON.stringify(va,null,2));if(va.issues.numErrors)throw Error('Arma GLB inválida');
  if(datos.reporte.triangulos<12000||datos.reporte.triangulos>20000)throw Error('Geometría fuera del presupuesto de 12 000–20 000 triángulos');
  await p.goto(base+'/modelos/tasogare/visor.html');await p.waitForFunction(()=>window.tasogareVisor?.listo,null,{timeout:90000});await p.evaluate(()=>{tasogareVisor.manual(true);particulas.checked=false;});
  for(const [nombre,a,e]of [['frente',0,.05],['espalda',Math.PI,.05],['perfil-izquierdo',Math.PI/2,.05],['perfil-derecho',-Math.PI/2,.05],['tres-cuartos',.6,.15],['desde-arriba',.6,1.05],['desde-abajo',.6,-.38],['invertida',Math.PI,-1.05]]){
    await p.evaluate(({a,e})=>tasogareVisor.vista(a,e),{a,e});await p.screenshot({path:path.join(salida,nombre+'.png')});
  }
  const clips=await p.evaluate(()=>tasogareVisor.verificar());fs.writeFileSync(path.join(salida,'revision-animaciones.json'),JSON.stringify(clips,null,2));
  if(clips.some(c=>!c.valido))throw Error('Deformaciones inválidas después de cargar el GLB');
  for(const [nombre,t,a]of [['Caminar',.4,.5],['Preparar_ataque',.7,.6],['Corte',.25,.6],['Abrir_capa',1.95,Math.PI],['Entregar_luz',1.8,.6]]){
    await p.evaluate(({nombre,t,a})=>{tasogareVisor.pose(nombre,t);tasogareVisor.vista(a,.13,nombre==='Abrir_capa'?6.6:5.3);},{nombre,t,a});await p.screenshot({path:path.join(salida,nombre.toLowerCase()+'.png')});
  }
  if(errores.length)throw Error('Errores: '+errores.join('; '));
  const blender=arg('blender');if(blender){
    const proc=spawnSync(blender,['--background','--factory-startup','--python',path.join(raiz,'herramientas/fuente-tasogare.py'),'--',salida],{encoding:'utf8',maxBuffer:4*1024*1024,windowsHide:true});
    fs.writeFileSync(path.join(salida,'blender.log'),proc.stdout+'\n'+proc.stderr);if(proc.status!==0)throw Error('Falló Blender: '+proc.stderr+' '+proc.stdout);
    const ver=spawnSync(blender,['--background',path.join(salida,'tasogare.blend'),'--python',path.join(raiz,'herramientas/fuente-tasogare.py'),'--',salida,'verificar'],{encoding:'utf8',windowsHide:true});
    fs.writeFileSync(path.join(salida,'blender-verificacion.log'),ver.stdout+'\n'+ver.stderr);if(ver.status!==0)throw Error('No se pudo volver a abrir la fuente Blender');
  }
}finally{if(nav)await nav.close();servidor.close();}
