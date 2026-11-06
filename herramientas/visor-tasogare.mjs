// Visor que abre directamente desde un archivo, sin servidor local. El GLB y su cargador quedan incrustados.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright-core';
export function generarVisorTasogare(raiz){
  const carpeta=path.join(raiz,'modelos/tasogare'),modelo=fs.readFileSync(path.join(carpeta,'tasogare.glb')).toString('base64');
  const cargador=fs.readFileSync(path.join(raiz,'herramientas/vendor/GLTFLoader-r128.js'),'utf8').replace(/<\/script/gi,'<\\/script');
  const licencia=fs.readFileSync(path.join(raiz,'herramientas/vendor/LICENSE-three-r128.txt'),'utf8');
  let html=fs.readFileSync(path.join(carpeta,'visor.html'),'utf8');
  html=html.replace('<script src="../../herramientas/vendor/GLTFLoader-r128.js"></script>','<script>/*\n'+licencia+'\n*/\n'+cargador+'</script>')
    .replace(".load('tasogare.glb',",".load('data:model/gltf-binary;base64,"+modelo+"',");
  const destino=path.join(carpeta,'visor-autonomo.html');fs.writeFileSync(destino,html);return destino;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const raiz=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),archivo=generarVisorTasogare(raiz),errores=[];
  const nav=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
  try{
    const p=await nav.newPage({viewport:{width:1100,height:1100}});p.on('pageerror',e=>errores.push(e.message));p.on('console',m=>{if(m.type()==='error')errores.push(m.text());});
    await p.goto(pathToFileURL(archivo).href);await p.waitForFunction(()=>window.tasogareVisor?.listo,null,{timeout:90000});
    await p.evaluate(()=>{tasogareVisor.manual(true);tasogareVisor.pose('Reposo',1);tasogareVisor.vista(.5,.1);});
    await p.screenshot({path:path.join(path.dirname(archivo),'vista-previa.png')});
    fs.writeFileSync(path.join(path.dirname(archivo),'revision-visor-autonomo.json'),JSON.stringify({archivo:'visor-autonomo.html',cargaSinServidor:true,errores},null,2));
    if(errores.length)throw Error(errores.join('; '));console.log('Visor autónomo: carga y render desde archivo sin errores.');
  }finally{await nav.close();}
}
