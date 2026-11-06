// Reproduce la entrega GLB, fuente glTF, atlas, informe y vistas. No modifica ningún ZIP.
import { chromium } from 'playwright-core';
import { validateBytes } from 'gltf-validator';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),salida=path.join(raiz,'modelos/hikari');
fs.mkdirSync(salida,{recursive:true});
const servidor=http.createServer((q,r)=>{
  const p=path.resolve(raiz,'.'+decodeURIComponent(q.url.split('?')[0]==='/'?'/index.html':q.url.split('?')[0]));
  if(path.relative(raiz,p).startsWith('..')||!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);r.end();return;}
  r.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.gltf':'model/gltf+json','.glb':'model/gltf-binary'})[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(r);
});
await new Promise(r=>servidor.listen(0,'127.0.0.1',r));
let nav;
try{
  nav=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist','--disable-gpu-vsync']});
  const p=await nav.newPage({viewport:{width:1000,height:1000}}),errores=[];
  p.on('pageerror',e=>errores.push(e.message));await p.route('**/favicon.ico',r=>r.fulfill({status:204}));
  await p.addInitScript(()=>{localStorage.clear();localStorage.setItem('ecos2_ajustes',JSON.stringify({calidad:'alta'}));});
  const base='http://127.0.0.1:'+servidor.address().port;
  await p.goto(base+'/index.html?depurar');await p.waitForFunction(()=>window.__ecos&&__ecos.estado()==='portada',null,{timeout:180000});
  await p.evaluate(()=>{__ecos.empezarRapido(true);__ecos.manual(true);});
  await p.addScriptTag({url:base+'/herramientas/vendor/GLTFExporter-r128.js'});await p.addScriptTag({url:base+'/herramientas/hikari-portable.js'});
  const datos=await p.evaluate(()=>construirHikariPortable());
  const bin=Buffer.from(datos.glb,'base64');fs.writeFileSync(path.join(salida,'hikari.glb'),bin);fs.writeFileSync(path.join(salida,'hikari.gltf'),datos.gltf);fs.writeFileSync(path.join(salida,'hikari-atlas-1024.png'),Buffer.from(datos.atlas,'base64'));
  const validacion=await validateBytes(new Uint8Array(bin),{uri:'hikari.glb',maxIssues:100});
  fs.writeFileSync(path.join(salida,'validacion-gltf.json'),JSON.stringify(validacion,null,2));
  datos.reporte.bytes=bin.length;datos.reporte.validacion={errores:validacion.issues.numErrors,avisos:validacion.issues.numWarnings};datos.reporte.erroresJuego=errores;
  fs.writeFileSync(path.join(salida,'informe.json'),JSON.stringify(datos.reporte,null,2));
  if(validacion.issues.numErrors)throw new Error('GLB inválido: '+JSON.stringify(validacion.issues.messages));
  if(errores.length)throw new Error('Errores del juego: '+errores.join('; '));
  console.log(JSON.stringify(datos.reporte,null,2));
  // Roundtrip en un visor limpio: sin shaders de atmósfera ni modificaciones del juego.
  await p.goto(base+'/modelos/hikari/visor.html');await p.waitForFunction(()=>window.hikariVisor?.listo,null,{timeout:90000});
  for(const [nombre,a] of [['frente',0],['tres-cuartos',Math.PI/4],['perfil',Math.PI/2],['espalda',Math.PI]]){
    await p.evaluate(a=>hikariVisor.vista(a),a);await p.screenshot({path:path.join(salida,nombre+'.png')});
  }
  const revisado=await p.evaluate(()=>hikariVisor.verificar());fs.writeFileSync(path.join(salida,'revision-animaciones.json'),JSON.stringify(revisado,null,2));
  if(revisado.some(c=>!c.valido))throw new Error('Animación con valores no finitos.');
  for(const [nombre,t,a] of [['Caminar',.3,Math.PI/4],['Planear',.5,Math.PI*.8]]){
    await p.evaluate(({nombre,t,a})=>{hikariVisor.pose(nombre,t);hikariVisor.vista(a);},{nombre,t,a});await p.screenshot({path:path.join(salida,nombre.toLowerCase()+'.png')});
  }
  await p.evaluate(()=>{hikariVisor.pose('');grieta.checked=true;grieta.onchange();vidas.value='1';vidas.onchange();hikariVisor.vista(.35);});
  await p.screenshot({path:path.join(salida,'mascara-agrietada.png')});
  if(datos.reporte.triangulosVisibles>15000)throw new Error('El modelo supera el presupuesto de 15 000 triángulos.');
}finally{if(nav)await nav.close();servidor.close();}
