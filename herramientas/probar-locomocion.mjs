// Medición del motor real con teclado y mando simulado, sobre una plataforma plana de ensayo.
import {chromium} from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const raiz=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),referencia=process.argv.includes('--referencia');
const indiceSalida=process.argv.indexOf('--salida'), salida=path.resolve(raiz,indiceSalida<0?(process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-locomocion':process.argv[indiceSalida+1]);fs.mkdirSync(salida,{recursive:true});
const servidor=http.createServer((q,r)=>{
  const p=path.resolve(raiz,'.'+decodeURIComponent(q.url.split('?')[0]==='/'?'/index.html':q.url.split('?')[0]));
  if(path.relative(raiz,p).startsWith('..')||!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);r.end();return;}
  r.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css'})[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(r);
});await new Promise(r=>servidor.listen(0,'127.0.0.1',r));let nav;
try{
  nav=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
  const p=await nav.newPage(),errores=[];p.on('pageerror',e=>errores.push(e.message));await p.route('**/favicon.ico',r=>r.fulfill({status:204}));
  await p.addInitScript(()=>{localStorage.clear();localStorage.setItem('ecos2_ajustes',JSON.stringify({calidad:'baja',maestro:0}));Object.defineProperty(navigator,'getGamepads',{value:()=>window.__padPrueba?[window.__padPrueba]:[]});});
  await p.goto('http://127.0.0.1:'+servidor.address().port+'/index.html?depurar');await p.waitForFunction(()=>window.__ecos&&__ecos.estado()==='portada',null,{timeout:180000});
  await p.evaluate(()=>{__ecos.empezarRapido(true);__ecos.manual(true);});
  const datos=await p.evaluate(()=>{
    const piso=Sol.add(0,0,100,100,0,199,200),base={...J},pendienteOriginal={...MOV.pendiente},r=[];
    MOV.pendiente.subida=MOV.pendiente.bajada=0;
    const soltar=()=>{for(const k in KEY)KEY[k]=false;for(const k in KEYP)delete KEYP[k];window.__padPrueba=null;Mando.leer(1/60);};
    const reset=()=>{soltar();Object.assign(J,base,{x:0,y:200,z:0,vx:0,vz:0,vy:0,camYaw:0,yaw:0,suelo:true,vivo:true,nada:false,planeo:false,desliza:false,trepa:null,aupa:null,atq:null,rodando:0,derribo:0,tambaleo:0,bloqueoT:0,atrapado:0,lento:0,cargando:0,guardia:false,canaliza:false,tSalto:9,tAire:0,rodDir:[0,1]});G.bloqueo=false;Mov.reiniciar();};
    const paso=(dt=1/60)=>{Mando.leer(dt);Mov.actualizar(dt);for(const k in KEYP)delete KEYP[k];};
    function medir(nombre,entrada){reset();entrada();let alcanza=0;for(let i=0;i<180;i++){paso();if(!alcanza&&Math.hypot(J.vx,J.vz)>.95*MOV.vel.correr)alcanza=(i+1)/60;}const v=Math.hypot(J.vx,J.vz),x=J.x,z=J.z;for(let i=0;i<60;i++)paso();const distancia=Math.hypot(J.x-x,J.z-z);r.push({nombre,velocidad:+v.toFixed(3),metrosEnUnSegundo:+distancia.toFixed(3),tiempo95Carrera:+alcanza.toFixed(3)});return v;}
    const andar=medir('andar_teclado',()=>KEY.KeyW=true),correr=medir('correr_teclado',()=>{KEY.KeyW=KEY.ShiftLeft=true;});
    const diagonal=medir('correr_diagonal',()=>{KEY.KeyW=KEY.KeyD=KEY.ShiftLeft=true;});
    soltar();let frenado=0;for(let i=0;i<90;i++){paso();if(Math.hypot(J.vx,J.vz)<.01){frenado=(i+1)/60;break;}}
    function mando(sprint,valor){const botones=Array.from({length:17},()=>({pressed:false,value:0}));window.__padPrueba={id:'Xbox ensayo',connected:true,index:0,mapping:'standard',axes:[0,-valor,0,0],buttons:botones};if(sprint)botones[10]={pressed:true,value:1};}
    const vMando=medir('correr_mando',()=>mando(true,1));soltar();const liberaSprint=!Mando.sprint;
    medir('andar_tras_desconectar',()=>KEY.KeyW=true);
    const vParcial=medir('andar_mando_parcial',()=>mando(false,.6));
    reset();KEY.KeyW=KEY.ShiftLeft=true;for(let i=0;i<90;i++)paso();KEY.KeyC=KEYP.KeyC=true;paso();const desliza=J.desliza;
    reset();KEY.KeyW=KEY.ShiftLeft=true;for(let i=0;i<90;i++)paso();KEY.KeyW=false;KEY.KeyS=true;let derrapa=false;for(let i=0;i<60;i++){paso();derrapa ||= J.derrape;}
    reset();KEY.KeyW=KEY.ShiftLeft=true;for(let i=0;i<90;i++)paso();KEY.Space=KEYP.Space=true;paso();const salto=!J.suelo&&J.vy>0;
    for(let i=0;i<55;i++)paso();const planeo=J.planeo;KEY.Space=false;for(let i=0;i<240;i++)paso();const aterriza=J.suelo;
    const tasas=[30,60,120].map(hz=>{reset();Hikari.reiniciarAnimacion();KEY.KeyW=KEY.ShiftLeft=true;let errorQ=0;for(let i=0;i<hz*2;i++){paso(1/hz);Hikari.mover(J.x,J.y,J.z,J.yaw,1/hz);Hikari.animar(1/hz,{suelo:true,vel:J.vel,vx:J.vx,vz:J.vz});for(const b of Hikari.modelo.huesos)errorQ=Math.max(errorQ,Math.abs(1-b.quaternion.length()));}return{hz,metros:Math.hypot(J.x,J.z),velocidad:J.vel,errorQ};});
    const estableFPS=Math.max(...tasas.map(x=>x.metros))-Math.min(...tasas.map(x=>x.metros))<.15&&tasas.every(x=>Number.isFinite(x.errorQ)&&x.errorQ<.001);
    piso.on=false;Object.assign(MOV.pendiente,pendienteOriginal);soltar();
    return{configuracion:{...MOV.vel,aceleracion:MOV.acel,frenado:MOV.frenado},medidas:r,frenadoSegundos:frenado,desliza,derrapa,salto,planeo,aterriza,
      tasas,estableFPS,diagonalNormalizada:Math.abs(diagonal-correr)<.025,mandoEquivalente:Math.abs(vMando-correr)<.025,mandoAnalogico:vParcial>0&&vParcial<andar,desconexionLiberaSprint:liberaSprint,finito:[J.x,J.y,J.z,J.vel].every(Number.isFinite)};
  });
  datos.errores=errores;fs.writeFileSync(path.join(salida,referencia?'antes.json':'despues.json'),JSON.stringify(datos,null,2));console.log(JSON.stringify(datos,null,2));
  if(errores.length||!datos.estableFPS||!datos.diagonalNormalizada||!datos.mandoEquivalente||!datos.mandoAnalogico||!datos.desliza||!datos.derrapa||!datos.salto||!datos.planeo||!datos.aterriza||!datos.finito)throw Error('Falló una comprobación de locomoción');
  if(!referencia&&(Math.abs(datos.medidas[0].velocidad-3.2)>.03||Math.abs(datos.medidas[1].velocidad-6.8)>.03))throw Error('Velocidades distintas de 3,2 y 6,8 m/s');
  if(!referencia&&!datos.desconexionLiberaSprint)throw Error('La carrera queda activada al desconectar el mando');
}finally{if(nav)await nav.close();servidor.close();}
