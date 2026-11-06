// Misiones secundarias de la campaña única (68-secundarias.js): cuándo se ofrecen, quién las da y las recibe, herencia y cierre.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/* Pruebas de estado y terreno sin navegador. El modo habitual sigue siendo la prueba visual de Claude. */
if (process.argv.includes('--logica')) {
  const leer = nombre => fs.readFileSync(path.join(raiz, 'js', nombre), 'utf8');
  const c = vm.createContext({ console });
  const ejecutar = texto => vm.runInContext(texto, c);
  ejecutar(leer('00-nucleo.js').split('/* ---------- color')[0]);
  ejecutar(leer('02-terreno.js').split('let MAT_SUELO')[0]);
  ejecutar(leer('04-estructuras.js').split('/* faro:')[0]);
  ejecutar(`
    class Vector {
      constructor(x=0,y=0,z=0) { this.set(x,y,z); }
      set(x,y,z) { Object.assign(this,{x,y,z}); return this; }
      setScalar(n) { return this.set(n,n,n); }
      copy(p) { return this.set(p.x,p.y,p.z); }
      clone() { return new Vector(this.x,this.y,this.z); }
    }
    class Objeto {
      constructor(geometry, material) { Object.assign(this, {geometry,material,position:new Vector(),rotation:new Vector(),scale:new Vector(1,1,1),children:[],userData:{},visible:true}); }
      add(o) { this.children.push(o); }
      remove(o) { this.children = this.children.filter(p=>p!==o); }
    }
    const THREE = { Group:Objeto, Mesh:Objeto, BoxGeometry:Objeto, SphereGeometry:Objeto, CylinderGeometry:Objeto, MeshStandardMaterial:Objeto };
    class Halo extends Objeto {}
    const scene = new Objeto(), Sonido={sfx(){}}, FX={rafaga(){},emit(){},actualizar(){}}, ProgresionEnemiga={registrar(){}};
    const registros=[], Bus={oyentes:{},on(id,fn){(this.oyentes[id]||=[]).push(fn);},emit(id,e){registros.push([id,e]);for(const fn of this.oyentes[id]||[])fn(e);}};
    const UI={dlg:null,pausado:false,bloqueada:false,refrescarMision(){},aviso(){},banner(){},item(){},nivel(){},cine(){},subtitulo(){},tituloCine(){},fundido(){},ocupada(){return this.bloqueada;},dialogo(nombre,lineas,cb){this.dlg={nombre,lineas,cb};},saltarDialogo(){const d=this.dlg;this.dlg=null;if(d&&d.cb)d.cb();}};
    const GUION={voces:{}}, Piloto={aprender(){},actualizar(){},interactuable(){return null;},conversar(id){this.conversacion=id;}};
    const Hikari={grieta(){},root:{visible:false}}, Jefes={enCombate:()=>false}, Sombras={lista:[],custodia:()=>false}, Asedio={activo:false};
    const G={tCamMan:1,foco:null}, KEYP={}, Fauna={lista:[],acariciable:()=>null};
    const elemento={style:{opacity:0},classList:{toggle(){},add(){}}},document={getElementById:()=>elemento};
    const camera={position:new Vector(),lookAt(){}},Render={ajustes:{}};
    const memoria={}, localStorage={setItem(k,v){memoria[k]=v;},getItem(k){return memoria[k]||null;},removeItem(k){delete memoria[k];}};
    const Gente={crear(d){return {g:new Objeto(),sig:new Objeto(),nombre:d.nombre,actualizar(){},ponerGesto(){}};}};
    for (const s of SITIOS) s.h=Math.max(2.4,alturaNatural(s.x,s.z)); prepararCuevas(); trazarCaminos();
    const s=sitio('petalo'), d=Math.hypot(s.x,s.z);
    const Estr={altar:{petalo:{x:s.x-s.x/d*5.2,z:s.z-s.z/d*5.2,y:s.h+2.9}},npcs:{},perlas:[],piramides:[{x:230,z:220,top:9},{x:240,z:220,top:10}],faroles:[],murales:[],cristalesMem:[],cima:{x:220,y:105,z:-316},encenderFragmento(){},mostrarEspiral(){}};
    for(const id of ['yuki','tsuru','momo','kaito','taiyo'])Estr.npcs[id]={x:-104,z:64,y:sitio('aldea').h};
    Bus.on('focoCamara',f=>G.foco=f);
  `);
  for (const nombre of ['49-campana.js','50-guion-inicio.js','59-guion-capitulos.js','68-secundarias.js','09-cinematica.js']) ejecutar(leer(nombre));
  ejecutar('Cin.omitir=()=>{KEY.Space=true;Cin.actualizar(1.01);KEY.Space=false;};');
  let sistemas = leer('07-sistemas.js');
  sistemas = sistemas.replace('  return {\n    get ST()', '  globalThis.pruebaSis = { nuevoEstado, migrarSecundarias, reconciliarSecundaria, anclasChispas, anclasFlores, sembrarPicks, recoger, transitableRecogida, pasoRecogida, mostrarCierre, registrarCaricia, puntosKiri, observarKiri, actualizarVistaKiri, recordarCompras };\n  return {\n    get ST()');
  ejecutar(sistemas); ejecutar(leer('60-capitulos.js'));
  ejecutar(`Sis.J={x:0,y:20,z:0,vivo:true,suelo:true,combate:0}; Sis.iniciar();
    function reiniciar() { UI.dlg=null;UI.pausado=false;UI.bloqueada=false;if(Cin.activa)Cin.omitir();Sis.ST=pruebaSis.nuevoEstado();Sis.ST.capitulo=1;Object.assign(Sis.ST.inicio,{nombre:true,momo:true,tsuru:true,hoja:true,rumbo:true});Sis.J={x:0,y:20,z:0,vivo:true,suelo:true,combate:0}; }
    function guardarComoAntigua() { delete Sis.ST.secundarias; Sis.guardar(); }
    function fotoPremio() {return JSON.stringify({xp:Sis.ST.xp,nivel:Sis.ST.nivel,inv:Sis.ST.inv,motas:Sis.ST.motas});}
  `);
  let correctas = 0;
  const comprobar = (nombre, expresion) => { assert.ok(ejecutar(expresion), nombre); correctas++; console.log('✓ ' + nombre); };
  comprobar('Siguen siendo trece secundarias', 'SECUNDARIAS.length===13');
  ejecutar(`reiniciar(); Sis.revelar('chispas'); for(let i=0;i<6;i++)Sis.evento('chispa');`);
  comprobar('La sexta chispa cierra y concede una esencia sin moneda extra', `Sis.ST.mis.chispas.e==='hecha'&&Sis.tiene('esencia')===1&&Sis.ST.motas===0`);
  ejecutar(`const premioChispas=fotoPremio();for(let i=0;i<6;i++)Sis.evento('chispa');pruebaSis.reconciliarSecundaria('chispas');`);
  comprobar('Reconciliar y repetir eventos no duplican el premio', 'premioChispas===fotoPremio()');
  ejecutar(`reiniciar(); for(let i=0;i<8;i++)Sis.ST.rec['f'+i]=1;Sis.ST.rec.p0=1;Sis.revelar('chispas');`);
  comprobar('Flores y perlas no cuentan como chispas', 'Sis.ST.mis.chispas.c===0');
  ejecutar(`reiniciar();for(let i=0;i<6;i++)Sis.ST.rec['c'+i]=1;Sis.revelar('chispas');`);
  comprobar('Las seis recogidas previas cierran al aceptar', `Sis.ST.mis.chispas.e==='hecha'&&Sis.tiene('esencia')===1`);
  ejecutar(`reiniciar();Sis.ST.mis.chispas={e:'activa',p:1,c:0};Sis.ST.motas=37;Sis.ST.mejoras={vida:1};Object.assign(Sis.J,{x:8,y:9,z:10});guardarComoAntigua();Sis.J.x=999;Sis.cargar();const premioMigrado=fotoPremio();Sis.cargar();`);
  comprobar('Migra chispas p:1 una vez y conserva saldo, mejoras y posición', `Sis.ST.mis.chispas.e==='hecha'&&Sis.tiene('esencia')===1&&Sis.ST.motas===37&&Sis.ST.mejoras.vida===1&&Sis.ST.pos.x===8&&premioMigrado===fotoPremio()`);
  ejecutar(`reiniciar();Sis.ST.mis.chispas={e:'hecha',p:2,c:0};guardarComoAntigua();Sis.cargar();`);
  comprobar('Una misión ya hecha nunca vuelve a pagar al migrar', 'Sis.tiene("esencia")===0');
  ejecutar(`reiniciar();Sis.revelar('chispas');UI.dialogo('Tsuru',['Otra lectura']);for(let i=0;i<6;i++)Sis.evento('chispa');pruebaSis.mostrarCierre();`);
  comprobar('El cierre se conserva mientras se lee otra conversación', `UI.dlg.nombre==='Tsuru'&&Sis.ST.secundarias.cierres.includes('chispas')`);
  ejecutar(`UI.saltarDialogo();pruebaSis.mostrarCierre();UI.saltarDialogo();Sis.hablar('yuki');UI.saltarDialogo();`);
  comprobar('Yuki comenta una sola vez y no exige otra entrega', 'Sis.ST.secundarias.chispasComentarioVisto&&!Sis.ST.secundarias.chispasComentarioPendiente');
  ejecutar(`reiniciar();Sis.ST.capitulo=2;Sis.ST.mis.c2_marea={e:'activa',p:0,c:0};Sis.hablar('kaito');`);
  comprobar('La conversación principal de Kaito tiene prioridad', `Piloto.conversacion==='c2_kaito'&&!UI.dlg`);
  ejecutar(`Sis.ST.mis.c2_marea.p=1;Sis.ST.rec.ca=1;Sis.dar('cana',1,true);Sis.revelar('pescador');Sis.hablar('kaito');`);
  comprobar('La caña previa avanza y la lectura aún no consume ni premia', `Sis.ST.mis.pescador.p===1&&Sis.tiene('cana')===1&&!Sis.tiene('manto_marea')`);
  ejecutar('UI.saltarDialogo();Sis.guardar();Sis.cargar();');
  comprobar('Al cerrar se devuelve una caña y se gana un solo manto', `Sis.ST.mis.pescador.e==='hecha'&&Sis.tiene('cana')===0&&Sis.tiene('manto_marea')===1&&Sis.ST.secundarias.canaDevuelta`);
  ejecutar(`reiniciar();Sis.revelar('te');Sis.dar('flor',5,true);Sis.hablar('tsuru');`);
  comprobar('Las flores esperan al cierre de la conversación', 'Sis.tiene("flor")===5&&Sis.ST.mis.te.p===1');
  ejecutar(`UI.saltarDialogo();Sis.guardar();Sis.cargar();`);
  comprobar('Cargar con té preparado no pide ni descuenta más flores', 'Sis.ST.mis.te.p===2&&Sis.ST.secundarias.tePreparado&&Sis.tiene("flor")===0&&!Sis.tiene("te")');
  ejecutar(`const nTe=Sis.npcs.tsuru.g.position;Object.assign(Sis.J,{x:nTe.x,y:nTe.y,z:nTe.z});Sis.actualizar(0,Sis.J,0);UI.pausado=true;Cin.actualizar(10);`);
  comprobar('La pausa congela los seis segundos del té en el motor real', 'Cin.activa&&Cin.estadoPlano().t===0&&Cin.estadoPlano().total===6&&!Sis.tiene("te")');
  ejecutar(`UI.pausado=false;Cin.omitir();Cin.omitir();`);
  comprobar('Omitir el compartir da tres tés una vez', `Sis.ST.mis.te.e==='hecha'&&Sis.ST.secundarias.teCompartido&&Sis.tiene('te')===3&&Sis.tiene('flor')===0`);
  ejecutar(`reiniciar();Sis.revelar('te');Sis.dar('flor',5,true);Sis.hablar('tsuru');UI.saltarDialogo();Object.assign(Sis.J,{x:nTe.x,y:nTe.y,z:nTe.z});Sis.actualizar(0,Sis.J,0);Cin.actualizar(2);Cin.repetir();const tiempoRepetido=Cin.estadoPlano().t;Cin.actualizar(6);Sis.guardar();Sis.cargar();`);
  comprobar('Repetir y terminar el té normalmente tampoco duplica flores ni tazas', `tiempoRepetido===0&&Sis.ST.mis.te.e==='hecha'&&Sis.tiene('te')===3&&Sis.tiene('flor')===0`);
  ejecutar(`reiniciar();Sis.perder('tsuru','momo');Sis.ST.inicio.cap={momoCapturada:true};Sis.revelar('te');Sis.dar('flor',5,true);Sis.hablar('momo');`);
  comprobar('Momo capturada no recibe las flores', '!UI.dlg&&Sis.tiene("flor")===5');
  ejecutar(`Sis.ST.inicio.cap.momoRescatada=true;Sis.hablar('momo');`);
  comprobar('Momo rescatada usa su diálogo de entrega', `UI.dlg&&UI.dlg.lineas.includes('Ponlas aquí. Puedo prepararlo contigo.')`);
  ejecutar(`reiniciar();Sis.revelar('amigos');const animalA={id:null},animalB={id:null},animalC={id:'kuma'};for(let i=0;i<3;i++)Bus.emit('acariciado',{a:animalA});`);
  comprobar('Tres caricias del mismo animal cuentan una', 'Sis.ST.mis.amigos.c===1&&Object.keys(Sis.ST.secundarias.amistades).length===1');
  ejecutar(`Bus.emit('acariciado',{a:animalB});Bus.emit('acariciado',{a:animalC});Sis.guardar();Sis.cargar();`);
  comprobar('Tres individuos distintos y su progreso sobreviven a cargar', 'Sis.ST.mis.amigos.p===1&&Object.keys(Sis.ST.secundarias.amistades).length===3&&animalA.uidAmistad!==animalB.uidAmistad');
  ejecutar(`reiniciar();Sis.ST.mis.amigos={e:'activa',p:0,c:2};guardarComoAntigua();Sis.cargar();Bus.emit('acariciado',{a:{id:null}});`);
  comprobar('El crédito antiguo c:2 solo requiere un individuo nuevo', 'Sis.ST.mis.amigos.p===1');
  ejecutar(`reiniciar();Sis.ST.capitulo=6;Sis.ST.mis.kiri={e:'activa',p:1,c:0};guardarComoAntigua();Sis.cargar();const premioKiri=fotoPremio();Sis.cargar();`);
  comprobar('Kiri p:1 antigua cierra sin otra subida ni doble pago', `Sis.ST.mis.kiri.e==='hecha'&&Sis.tiene('esencia')===2&&premioKiri===fotoPremio()`);
  ejecutar(`reiniciar();Sis.ST.capitulo=6;Sis.ST.mis.c6_kiri={e:'activa',p:8,c:0};Sis.revelar('kiri');Sis.guardar();Sis.cargar();`);
  comprobar('Una visita principal previa cuenta y p:1 nueva espera las vistas', `Sis.ST.mis.kiri.p===1&&Sis.ST.mis.kiri.e==='activa'&&!Sis.tiene('esencia')`);
  ejecutar(`const vistas=pruebaSis.puntosKiri();Object.assign(Sis.J,vistas[0]);pruebaSis.observarKiri(vistas[0]);G.tCamMan=0;pruebaSis.actualizarVistaKiri(.5,Sis.J);G.tCamMan=1;`);
  comprobar('Cancelar antes de un segundo estable no marca el lado', '!Sis.ST.secundarias.kiriVistas.corrientes');
  ejecutar(`pruebaSis.observarKiri(vistas[0]);pruebaSis.actualizarVistaKiri(2,Sis.J);Sis.guardar();Sis.cargar();Object.assign(Sis.J,vistas[1]);pruebaSis.observarKiri(vistas[1]);pruebaSis.actualizarVistaKiri(2,Sis.J);`);
  comprobar('Ambas vistas cierran Kiri y conceden dos esencias', `Sis.ST.mis.kiri.e==='hecha'&&Sis.tiene('esencia')===2&&Sis.ST.secundarias.kiriPanorama`);
  ejecutar(`reiniciar();Sis.reiniciarMundo();pruebaSis.sembrarPicks();const anclas=pruebaSis.anclasChispas();`);
  comprobar('Hay ochenta chispas, con los once IDs reservados', 'Sis.picks.filter(p=>p.tipo==="chispa").length===80&&anclas.length===11');
  comprobar('Las once anclas son secas, sin colisión y con separación de cuatro metros', 'anclas.every((p,i)=>pruebaSis.transitableRecogida(p.x,p.z)&&anclas.slice(0,i).every(q=>Math.hypot(p.x-q.x,p.z-q.z)>=4-1e-6))');
  comprobar('Las anclas también guardan cuatro metros respecto a las chispas conservadas', 'anclas.every(p=>Sis.picks.filter(q=>q.tipo==="chispa"&&+q.id.slice(1)>=11).every(q=>Math.hypot(p.x-q.x,p.z-q.z)>=4-1e-6))');
  ejecutar(`const obstaculo=Sol.col(anclas[0].x,anclas[0].z,1.2,altura(anclas[0].x,anclas[0].z),altura(anclas[0].x,anclas[0].z)+3);const conObstaculo=pruebaSis.anclasChispas();`);
  comprobar('Un sólido obliga a corregir el ancla sin crear otra chispa', 'conObstaculo.length===11&&conObstaculo.every(p=>pruebaSis.transitableRecogida(p.x,p.z))&&Math.hypot(conObstaculo[0].x-anclas[0].x,conObstaculo[0].z-anclas[0].z)>1.8');
  ejecutar('obstaculo.on=false;');
  ejecutar(`const originales=[];{const r=rng(4242);let n=0,intentos=0;while(n<80&&intentos++<3000){const x=(r()-.5)*860,z=(r()-.5)*860;if(Math.hypot(x,z)>420)continue;const h=altura(x,z);if(h<1||pendiente(x,z)>.8||CUEVAS.some(c=>Math.hypot(x-c.mx,z-c.mz)<c.mr))continue;if(SITIOS.some(s=>Math.hypot(x-s.x,z-s.z)<s.r1))continue;originales.push({x,z});n++;}}`);
  comprobar('c11–c79 conservan exactamente el sorteo original', 'originales.slice(11).every((p,i)=>{const q=Sis.picks.find(q=>q.id==="c"+(i+11));return q.x===p.x&&q.z===p.z;})');
  comprobar('Cinco flores están en dos parches seguros y siguen existiendo ocho', 'pruebaSis.anclasFlores().length===5&&Sis.picks.filter(p=>p.tipo==="flor").length===8');
  ejecutar(`reiniciar();Sis.ST.rec.c0=1;Sis.ST.rec.c10=1;Sis.reiniciarMundo();pruebaSis.sembrarPicks();`);
  comprobar('Recolocar no repone chispas recogidas ni paga motas', '!Sis.picks.some(p=>p.id==="c0"||p.id==="c10")&&Sis.ST.motas===0');
  ejecutar(`reiniciar();Sis.reiniciarMundo();pruebaSis.sembrarPicks();const altar=Estr.altar.petalo;Object.assign(Sis.J,{x:altar.x,y:altar.y,z:altar.z});for(let i=0;i<8;i++)pruebaSis.recoger(Sis.picks.find(p=>p.id==='c'+i));const compra40=Sis.mejorar('capa');const saldoPrimera=Sis.ST.motas;Sis.rescatar(25);for(let i=8;i<11;i++)pruebaSis.recoger(Sis.picks.find(p=>p.id==='c'+i));Sis.rescatar(25);Sis.rescatar(25);const disponibleSegunda=Sis.ST.motas;const compra90=Sis.mejorar('capa');`);
  comprobar('Cuenta mínima: 40−40=0; 25+15+25+25−90=0', 'compra40&&saldoPrimera===0&&disponibleSegunda===90&&compra90&&Sis.ST.motas===0&&Sis.mejora("capa")===2');
  ejecutar(`pruebaSis.recoger(Sis.picks.find(p=>p.id==='c0'));Sis.guardar();Sis.cargar();`);
  comprobar('Recoger otra vez o cargar las once chispas no duplica su moneda', 'Sis.ST.motas===0&&Object.keys(Sis.ST.rec).filter(k=>/^c[0-9]+$/.test(k)).length===11');
  ejecutar(`reiniciar();Object.assign(Sis.J,{x:altar.x,y:altar.y,z:altar.z});Sis.rescatar(115);Sis.mejorar('vida');Sis.rescatar(65);const conExtras=Sis.ST.motas;Sis.mejorar('vida');`);
  comprobar('Dos ecos opcionales dejan 140 antes de comprar 90 y 50 después', 'conExtras===140&&Sis.ST.motas===50');
  ejecutar(`reiniciar();Object.assign(Sis.J,{x:altar.x,y:altar.y,z:altar.z});Sis.rescatar(130);Sis.mejorar('capa');Sis.ST.motas-=15;const perdidaNeta=15;const compraInsuficiente=Sis.mejorar('capa');const saldoPerdida=Sis.ST.motas;Sis.rescatar(15);const compraRecuperada=Sis.mejorar('capa');`);
  comprobar('Perder 15 deja 75; restituirlas permite comprar sin ingreso adicional', '!compraInsuficiente&&saldoPerdida===75&&perdidaNeta===15&&compraRecuperada&&Sis.ST.motas===0');
  console.log(JSON.stringify({ modo:'lógica sin navegador', correctas, cuentas: { minimo:{ingresos:130,gasto:130,saldo:0},extras:{ingresos:180,gasto:130,saldo:50},perdida:{saldoAntesDeRecuperar:75,perdidaNeta:15,saldoTrasRecuperarYComprar:0} }, limite:'Sin comprobación de imagen ni de toda la obra. Claude ejecuta el modo habitual y los capítulos 1–7.' },null,2));
  process.exit(0);
}
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const { chromium } = await import('playwright-core');
const archivo = arg('archivo', 'index.html'), salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-secundarias'));
fs.mkdirSync(salida, { recursive: true });
const srv = http.createServer((q, r) => { const f = path.resolve(raiz, '.' + decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(raiz + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html'); fs.createReadStream(f).pipe(r); }).listen(0);
await new Promise(r => srv.once('listening', r));
const nav = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const p = await nav.newPage({ viewport: { width: 1600, height: 900 } }), errores = [], pruebas = [];
await p.addInitScript(() => localStorage.setItem('ecos2_ajustes', JSON.stringify({ calidad: 'alta', maestro: 0 })));
await p.route('**/favicon.ico', r => r.fulfill({ status: 204 })); p.on('pageerror', e => errores.push(e.message)); p.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
const url = `http://localhost:${srv.address().port}/${archivo}`;
const comprobar = (nombre, pasa, evidencia) => { pruebas.push({ nombre, pasa: !!pasa, evidencia }); if (!pasa) throw Error(nombre + ': ' + JSON.stringify(evidencia)); };
const cargar = async () => { await p.goto(url, { timeout: 180000 }); await p.waitForFunction(() => window.__ecos && G.estado === 'portada', null, { timeout: 120000 }); await p.evaluate(() => __ecos.manual(true)); };
const sim = n => p.evaluate(n => __ecos.sim(n, 1 / 60), n);
const foto = async nombre => { await p.evaluate(() => render()); await p.waitForTimeout(500); await p.screenshot({ path: path.join(salida, nombre + '.png') }); };
const paso = () => p.evaluate(() => { const m = Sis.ST.mis.c7_luna; return m ? (m.e === 'hecha' ? 99 : m.p) : -1; });
const ofrece = () => p.evaluate(() => { const o = mejorInteract(J); return o && o.txt; });
const usar = () => p.evaluate(() => { const o = mejorInteract(J); if (o) o.fn(); return o && o.txt; });
const cerrarDialogo = async () => { await sim(2); await p.evaluate(() => { if (UI.dlg) UI.saltarDialogo(); }); await sim(2); };
const ir = async (x, z) => { await p.evaluate(([x, z]) => { __ecos.tele(x, z); J.vx = J.vz = 0; }, [x, z]); await sim(20); };
const junto = async (fn, a) => { const [x, z] = await p.evaluate(fn, a); await ir(x, z); };
const estado = id => p.evaluate(id => { const m = Sis.ST.mis[id]; return m ? (m.e === 'hecha' ? 99 : m.p) : -1; }, id);
const hablarCon = async id => { await p.evaluate(id => { Sis.hablar(id); }, id); await sim(5); const d = await p.evaluate(() => UI.dlg && UI.dlg.lineas.map(l => l.texto || l)); await p.waitForTimeout(200); await cerrarDialogo(); await sim(10); return d; };
const esperarCierre = async texto => {
  for (let i = 0; i < 250; i++) {
    await sim(2);
    if (await p.evaluate(texto => UI.dlg && UI.dlg.lineas.some(l => (l.texto || l).includes(texto)), texto)) return;
    await p.waitForTimeout(100);
  }
  throw Error('No llegó el cierre: ' + texto);
};
try {
  await cargar();
  await p.evaluate(() => { __ecos.empezarRapido(true); Sis.ST.capitulo = 0; });
  await sim(60); await cerrarDialogo();
  comprobar('En el prólogo nadie ofrece secundarias', await p.evaluate(() => !['yuki', 'kaito', 'taiyo', 'momo', 'tsuru'].some(id => Sis.encargo(id))));
  await p.evaluate(() => { Sis.ST.capitulo = 1; Object.assign(Sis.ST.inicio, { prologo: true, nombre: true, hinode: true, momo: true, tsuru: true, hoja: true, rumbo: true, fin: true, registroPetalo: true }); });
  await sim(60);
  comprobar('Desde el capítulo 1, Yuki tiene un encargo', await p.evaluate(() => Sis.encargo('yuki')));
  comprobar('La marca sobre la cabeza lo indica', await p.evaluate(() => Sis.npcs.yuki.sig.userData.v === true));
  const d1 = await hablarCon('yuki');
  comprobar('Yuki ofrece Luz dispersa', JSON.stringify(d1).includes('seis chispas') && await estado('chispas') === 0, d1);
  comprobar('El jabalí espera a la katana', await estado('jabali') === -1 && await p.evaluate(() => !SECUNDARIAS.find(q => q.id === 'jabali') || !Sis.ST.inv.katana));
  const esencias = await p.evaluate(() => Sis.tiene('esencia'));
  for (let i = 0; i < 6; i++) await p.evaluate(() => Sis.evento('chispa'));
  comprobar('Seis chispas cierran sin volver a Yuki', await estado('chispas') === 99 && await p.evaluate(e => Sis.tiene('esencia') === e + 1, esencias), await estado('chispas'));
  await esperarCierre('estos claros'); await cerrarDialogo();
  const d2 = await hablarCon('yuki');
  comprobar('Yuki comenta el recorrido sin duplicar el premio', JSON.stringify(d2).includes('Encontraste luz') && await p.evaluate(e => Sis.tiene('esencia') === e + 1, esencias), d2);
  comprobar('La historia sigue al hablar con Kaito sin encargo', await p.evaluate(() => !Sis.encargo('kaito')));
  await p.evaluate(() => { Sis.evento('noop'); Sis.ST.lug.gruta = 1; }); await sim(60);
  comprobar('Descubrir la gruta revela su secundaria', await estado('gruta') === 0, await estado('gruta'));
  for (let i = 0; i < 5; i++) await p.evaluate(() => Sis.evento('luciernaga'));
  await esperarCierre('cinco luces');
  comprobar('La gruta se cierra con la voz de Hikari', await estado('gruta') === 99 && await p.evaluate(() => UI.dlg && UI.dlg.lineas.some(l => /cinco luces/.test(l.texto || l))));
  await cerrarDialogo();
  await hablarCon('taiyo'); await hablarCon('taiyo');
  comprobar('Taiyō ofrece los ecos, pero Kiri no antes del capítulo 6', await estado('ecos') === 0 && await estado('kiri') === -1, [await estado('ecos'), await estado('kiri')]);
  // capítulo 4: Tsuru se pierde y Momo hereda su encargo
  await p.evaluate(() => { Sis.ST.capitulo = 4; Sis.perder('tsuru', 'momo'); Sis.dar('farol', 1, true); }); await sim(60);
  comprobar('Con el farol en el capítulo 4 aparece Lo que callan las piedras', await estado('callan') === 0, await estado('callan'));
  comprobar('Momo ofrece el té de la abuela como heredera', await p.evaluate(() => Sis.encargo('momo')), await p.evaluate(() => { const m = Sis.npcs.momo; return { vis: m.g.visible, ocu: m.ocupado, aus: Sis.ST.ausentes, te: Sis.ST.mis.te, cap: Campana.capitulo() }; }));
  let dm = []; for (let i = 0; i < 4 && !JSON.stringify(dm).includes('Quiero preparar el té'); i++) dm = await hablarCon('momo');
  comprobar('La oferta heredada usa el texto de Momo', JSON.stringify(dm).includes('Quiero preparar el té') && await estado('te') === 0, dm);
  await p.evaluate(() => Sis.dar('flor', 5)); await sim(10);
  const dt = await hablarCon('momo');
  comprobar('Momo prepara el té y las flores se consumen una vez', await estado('te') === 2 && JSON.stringify(dt).includes('Puedo prepararlo contigo'), dt);
  await junto(() => { const p = Sis.npcs.momo.g.position; return [p.x + 1, p.z]; }); await sim(400);
  comprobar('Compartir el té cierra y concede tres tazas', await estado('te') === 99 && await p.evaluate(() => Sis.ST.secundarias.teCompartido && Sis.tiene('te') >= 3));
  await esperarCierre('tres tazas'); await cerrarDialogo();
  // capítulo 6: Taiyō ofrece Kiri
  await p.evaluate(() => { Sis.ST.capitulo = 6; }); await sim(60);
  let dk = []; for (let i = 0; i < 4 && !JSON.stringify(dk).includes('reconocer las corrientes'); i++) dk = await hablarCon('taiyo');
  comprobar('En el capítulo 6, Taiyō ofrece la cumbre de Kiri', await estado('kiri') === 0, dk);
  comprobar('Las secundarias no se cuelan como misión seguida delante del capítulo', await p.evaluate(() => !Sis.ST.seg || Q[Sis.ST.seg].tipo === 'p' || !Object.keys(Sis.ST.mis).some(id => Q[id].tipo === 'p' && Sis.ST.mis[id].e === 'activa')));
  await foto('01-final');
  comprobar('Sin errores de navegador', !errores.length, errores);
} catch (e) {
  errores.push(e.stack || e.message);
  try { await foto('error'); console.log(await p.evaluate(() => ({ cap: Sis.ST.capitulo, mis: Object.fromEntries(Object.entries(Sis.ST.mis).filter(([k]) => SECUNDARIAS.some(q => q.id === k))), dlg: UI.dlg && UI.dlg.lineas.map(l => l.id || l.texto) }))); } catch {}
}
console.log(JSON.stringify({ archivo, correctas: pruebas.filter(x => x.pasa).length, pruebas: pruebas.length, errores, detalle: pruebas.map(x => (x.pasa ? '✓ ' : '✗ ') + x.nombre) }, null, 1));
if (errores.length || pruebas.some(x => !x.pasa)) process.exitCode = 1;
await nav.close(); srv.close();
