// Montajes de C4, C5 y C7. Ejecutar por separado con --calidad alta, media y baja.
// No modifica fuentes. Captura tres imágenes de cada montaje y compara el estado completo de la partida.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const archivo = arg('archivo', 'index.html'), calidad = arg('calidad', 'alta');
const salida = path.resolve(raiz, arg('salida', (process.env.TEMP || '/tmp') + '/ecos-pruebas/salida-montajes/' + calidad));
fs.mkdirSync(salida, { recursive: true });
const servidor = http.createServer((q, r) => {
  const f = path.resolve(raiz, '.' + decodeURIComponent(q.url.split('?')[0] === '/' ? '/index.html' : q.url.split('?')[0]));
  if (!f.startsWith(raiz + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html'); fs.createReadStream(f).pipe(r);
}).listen(0);
await new Promise(r => servidor.once('listening', r));
const navegador = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const pagina = await navegador.newPage({ viewport: { width: 1600, height: 900 } }), pruebas = [], errores = [], medidas = [];
await pagina.addInitScript(calidad => localStorage.setItem('ecos2_ajustes', JSON.stringify({ calidad, maestro: 0 })), calidad);
await pagina.route('**/favicon.ico', r => r.fulfill({ status: 204 }));
pagina.on('pageerror', e => errores.push(e.message));
pagina.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
const comprobar = (nombre, pasa, evidencia) => {
  pruebas.push({ nombre, pasa: !!pasa, evidencia }); if (!pasa) throw Error(nombre + ': ' + JSON.stringify(evidencia));
};
const ordenar = v => Array.isArray(v) ? v.map(ordenar) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, ordenar(v[k])])) : v;
const igual = (a, b) => JSON.stringify(ordenar(a)) === JSON.stringify(ordenar(b));
const foto = async nombre => {
  await pagina.evaluate(() => render()); await pagina.screenshot({ path: path.join(salida, nombre + '.png') });
  medidas.push(await pagina.evaluate(nombre => ({ nombre, dibujos: renderer.info.render.calls,
    triangulos: renderer.info.render.triangles, programas: renderer.info.programs.length, montaje: Cin.util.estadoMontaje() }), nombre));
};
const iniciar = (id, arma = 'katana') => pagina.evaluate(([id, arma]) => __iniciarMontaje(id, arma), [id, arma]);
const ir = (plano, t) => pagina.evaluate(([plano, t]) => {
  let n = 0;
  while (Cin.activa && Cin.plano() < plano && n++ < 6000) __ecos.sim(1, 1 / 60);
  while (Cin.activa && Cin.plano() === plano && Cin.estadoPlano().t < t - 1e-8 && n++ < 6000) {
    __ecos.sim(1, Math.min(1 / 60, t - Cin.estadoPlano().t));
  }
  if (!Cin.activa || Cin.plano() !== plano || Math.abs(Cin.estadoPlano().t - t) > .0001) throw Error('No se alcanzó el plano ' + plano + ', ' + t + ' s');
  return Cin.util.estadoMontaje();
}, [plano, t]);
const terminar = () => pagina.evaluate(() => {
  let n = 0; while (Cin.activa && n++ < 4000) __ecos.sim(1, 1 / 60);
  if (Cin.activa) throw Error('No terminó el montaje'); return __resultado;
});
const omitir = () => pagina.evaluate(() => {
  KEY.Space = true; __ecos.sim(22, .05); KEY.Space = false;
  if (Cin.activa) throw Error('No se omitió el montaje'); return __resultado;
});
const pausa = async nombre => {
  const r = await pagina.evaluate(() => {
    const capturar = () => {
      const objetos = [], particulas = [];
      scene.traverse(o => { if (o.name.startsWith('Montaje_')) {
        objetos.push(o.toJSON().object); o.traverse(h => { if (h.isPoints) particulas.push(Array.from(h.geometry.attributes.position.array)); });
      } });
      return { t: Cin.estadoPlano(), estado: Cin.util.estadoMontaje(), objetos,
        particulas, fundido: $('fundido').style.opacity,
        camara: [...camera.position.toArray(), ...camera.quaternion.toArray()], taso: Tasogare.modelo.huesos.map(b => b.quaternion.toArray()) };
    };
    UI.pausado = true; const antes = capturar(); __ecos.sim(20, .05); const despues = capturar(); UI.pausado = false;
    return JSON.stringify(antes) === JSON.stringify(despues);
  });
  comprobar(nombre, r);
};
const limpio = (nombre, r) => comprobar(nombre, r && r.cierres === 1 && r.limpio && r.funciones && igual(r.entorno, r.entrada), r);

try {
  await pagina.goto(`http://localhost:${servidor.address().port}/${archivo}`, { timeout: 180000 });
  await pagina.waitForFunction(() => window.__ecos && G.estado === 'portada', null, { timeout: 120000 });
  await pagina.evaluate(() => {
    __ecos.manual(true); __ecos.empezarRapido(true); G.estado = 'intro';
    window.__baseMontajes = JSON.parse(JSON.stringify(Sis.ST));
    const evento = Sis.evento, perder = Sis.perder, dar = Sis.dar;
    window.__eventosMontaje = []; window.__perdidasMontaje = []; window.__objetosMontaje = [];
    Sis.evento = function (id) { __eventosMontaje.push(id); return evento.apply(Sis, arguments); };
    Sis.perder = function (id) { __perdidasMontaje.push(id); return perder.apply(Sis, arguments); };
    Sis.dar = function (id) { __objetosMontaje.push(id); return dar.apply(Sis, arguments); };
    window.__danosMontaje = 0;
    const equipar = Sis.equipar; window.__equiposMontaje = 0;
    Sis.equipar = function () { __equiposMontaje++; return equipar.apply(Sis, arguments); };
    for (const k of ['sector', 'circulo', 'proyectil']) {
      const antes = Impacto[k]; Impacto[k] = function () { __danosMontaje++; return antes.apply(Impacto, arguments); };
    }
    window.__entornoMontaje = () => ({ fov: camera.fov, foco: Render.ajustes.foco, colorLugar: Render.ajustes.colorLugar,
      desenfoque: Render.ajustes.desenfoqueObj, lamp: Cin.lamp,
      corazon: [Estr.corazon.geometry.uuid, Estr.corazon.visible, ...Estr.corazon.position.toArray(), ...Estr.corazon.scale.toArray(),
        ...Estr.corazon.quaternion.toArray(), ...Estr.corazon.material.color.toArray(), Estr.brillo],
      luz: [Estr.corazonLuz.opacidad, ...Estr.corazonLuz.scale.toArray(), ...Estr.corazonLuz.color.toArray()] });
    window.__capturarMontaje = () => ({ st: JSON.parse(JSON.stringify(Sis.ST)), inventario: { ...Sis.ST.inv }, eventos: [...__eventosMontaje],
      perdidas: [...__perdidasMontaje], objetos: [...__objetosMontaje], jugador: [J.x, J.y, J.z, J.yaw],
      tsuru: Sis.npcs.tsuru.g.visible, tasogare: Tasogare.visible, roja: LunaRoja.root.visible,
      lumi: Lumi.grupo.scale.toArray(), cielo: [Atmosfera.nivelRojo, Atmosfera.aparienciaLunar],
      momo: [Sis.npcs.momo.g.visible, ...Sis.npcs.momo.g.position.toArray()], danos: __danosMontaje, equipos: __equiposMontaje });
    window.__iniciarMontaje = (id, arma, partida) => {
      while (UI.dlg) UI.saltarDialogo();
      Sis.ST = JSON.parse(JSON.stringify(__baseMontajes));
      const n = id === 'perdidaTsuru' ? 4 : id === 'muerteTasogare' ? 5 : 7;
      Sis.ST.capitulo = n; Sis.ST.inicio.cap = { momoCapturada: n >= 5, momoRescatada: n === 7 };
      Object.assign(Sis.ST.inicio, { prologo: true, nombre: true, momo: true, tsuru: true, hoja: true, rumbo: true, fin: true, registroPetalo: true });
      const ids = ['c1_petalo', 'c2_marea', 'c3_duna', 'c4_velo', 'c5_tasogare', 'c6_kiri', 'c7_luna'];
      Sis.ST.mis = Object.fromEntries(ids.map((m, i) => [m, { e: i + 1 < n ? 'hecha' : 'activa', p: i + 1 < n ? 99 : 0, c: 0 }]));
      Sis.ST.mis[ids[n - 1]].p = n === 4 ? 2 : n === 5 ? 9 : 6; Sis.ST.seg = ids[n - 1];
      Sis.ST.inv = { katana: 1, arco: 1, escuela: 1 }; Sis.ST.eq.arma = arma;
      Sis.ST.robado = null; Sis.ST.frag = [true, true, true, false]; Sis.ST.ausentes = {};
      Sis.ST.avisos = { restante: 0, pendientes: [], mostrados: [] }; Sis.ST.cieloRojo = true;
      Sis.ST.dueloLuna = { etapa: 3, golpes: [4, 4, 4, 4], vencida: true, liberada: true };
      if (partida) {
        localStorage.setItem(Campana.clave, JSON.stringify(partida));
        if (!Sis.cargar()) throw Error('No se pudo reanudar el montaje guardado');
      }
      DueloLuna.detener(); EscenarioCapitulos.actualizar(0, null, 0);
      Tasogare.mostrar(false); LunaRoja.crear(); LunaRoja.mostrar(false); LunaDorada.crear(); LunaDorada.mostrar(false);
      Hikari.equipar(arma); Hikari.llevaFarol(false); Hikari.mostrar(true); Hikari.reiniciarAnimacion();
      Lumi.fijar(null); Lumi.grupo.scale.setScalar(1); Lumi.grupo.visible = true;
      const q = n === 4 ? sitio('aldea') : n === 5 ? EscenarioCapitulos.puntos.aro : EscenasCapitulos.centroLuna();
      __ecos.tele(q.x, q.z); J.y = q.y === undefined ? q.h : q.y; J.yaw = 0; J.vivo = J.suelo = true; J.combate = 0;
      Hikari.mover(J.x, J.y, J.z, J.yaw); Sis.J = J; Sis.ST.pos = { x: J.x, y: J.y, z: J.z };
      Atmosfera.rojo(1); Atmosfera.lunaNarrativa(1); G.estado = 'intro'; UI.pausado = false;
      __eventosMontaje.length = __perdidasMontaje.length = __objetosMontaje.length = 0;
      __danosMontaje = __equiposMontaje = 0;
      window.__cierresMontaje = 0; window.__resultado = null; window.__entradaMontaje = __entornoMontaje();
      window.__funcionesMontaje = [Hikari.animar, Tasogare.actualizar, MusicaInicio.actualizar, Sonido.pausar, UI.fundido];
      Cin[id](() => {
        __cierresMontaje++;
        const fx = Cin.util.estadoMontaje().hilo;
        window.__resultado = { final: __capturarMontaje(), cierres: __cierresMontaje, entrada: __entradaMontaje, entorno: __entornoMontaje(),
          limpio: !scene.getObjectByName('Montaje_' + id).visible && !fx.halos && !fx.luz && !fx.polvo,
          funciones: [Hikari.animar, Tasogare.actualizar, MusicaInicio.actualizar, Sonido.pausar, UI.fundido].every((f, i) => f === __funcionesMontaje[i]) };
      });
      return Cin.estadoPlano();
    };
  });

  const casos = [
    { id: 'perdidaTsuru', planos: 6, fotos: [[2, 1.24], [3, 4.9], [4, 5.2]], repetir: [3, 4], impacto: [2, 1.22] },
    { id: 'muerteTasogare', planos: 5, fotos: [[1, 4], [2, 1.22], [3, 6]], repetir: [2, 3.8], impacto: [2, 1.22] },
    { id: 'liberacion', planos: 3, fotos: [[0, 2.02], [1, 12], [2, 13]], repetir: [1, 12], impacto: [0, 2.02] }
  ];
  for (const caso of casos) {
    const programasAntes = await pagina.evaluate(() => renderer.info.programs.length);
    const { id } = caso, inicio = await iniciar(id);
    comprobar(id + ': 45 s', inicio.total === 45, inicio);
    let pico = { halos: 0, luz: 0, polvo: 0 };
    for (let i = 0; i < caso.fotos.length; i++) { await ir(...caso.fotos[i]); await foto(id + '-' + (i + 1)); }
    comprobar(id + ': ningún programa nuevo', await pagina.evaluate(() => renderer.info.programs.length) === programasAntes, programasAntes);
    const normal = await terminar(); limpio(id + ': cierre normal y restauración', normal);
    comprobar(id + ': ningún daño ni cambio de equipo', normal.final.danos === 0 && normal.final.equipos === 0, normal.final.danos);
    comprobar(id + ': hecho único', normal.final.st.inicio.cap.montajes[id] === true &&
      (id === 'perdidaTsuru' ? normal.final.inventario.farol === 1 && normal.final.perdidas.length === 1 && normal.final.objetos.filter(x => x === 'farol').length === 1 :
        id === 'muerteTasogare' ? normal.final.st.inicio.cap.momoRescatada && normal.final.st.inicio.cap.oscuridadHeredada && normal.final.eventos.filter(x => x === 'c5:momo_liberada').length === 1 :
          normal.final.st.inicio.cap.doradaLibre && normal.final.st.inicio.cap.lumiLuciernaga && normal.final.lumi.every(v => v === .35) && !normal.final.roja), normal.final);
    for (let plano = 0; plano < caso.planos; plano++) {
      await iniciar(id); await ir(plano, .7); const omitido = await omitir(); limpio(id + ': omitir plano ' + (plano + 1), omitido);
      comprobar(id + ': estado normal = omitido P' + (plano + 1), igual(normal.final, omitido.final), { normal: normal.final, omitido: omitido.final });
    }
    await iniciar(id); await ir(...caso.repetir);
    const primero = await pagina.evaluate(() => Cin.util.estadoMontaje());
    await pagina.evaluate(() => Cin.repetir()); await ir(...caso.repetir);
    comprobar(id + ': repetir usa la misma semilla y no concede progreso', igual(primero, await pagina.evaluate(() => Cin.util.estadoMontaje())) &&
      await pagina.evaluate(() => __cierresMontaje === 0 && !Sis.ST.inicio.cap.montajes), primero);
    await pausa(id + ': pausa durante una desaparición o transformación');
    const repetido = await terminar(); limpio(id + ': cierre tras repetir', repetido);
    comprobar(id + ': estado normal = repetido', igual(normal.final, repetido.final), repetido.final);

    await iniciar(id); await ir(caso.planos - 1, id === 'liberacion' ? 18.5 : id === 'perdidaTsuru' ? 5.5 : 6.5);
    await pausa(id + ': pausa durante el fundido'); await pagina.evaluate(() => Cin.repetir());
    comprobar(id + ': repetir cancela el fundido', await pagina.evaluate(() => +$('fundido').style.opacity === 0)); await omitir();

    await iniciar(id); await ir(...caso.impacto);
    const retenido = await pagina.evaluate(() => ({ posicion: Hikari.root.position.toArray(), cam: camera.position.toArray(),
      taso: Tasogare.modelo.huesos.map(b => b.quaternion.toArray()), estado: Cin.util.estadoMontaje() }));
    await pagina.evaluate(() => __ecos.sim(1, .005));
    const retenido2 = await pagina.evaluate(() => ({ posicion: Hikari.root.position.toArray(), cam: camera.position.toArray(),
      taso: Tasogare.modelo.huesos.map(b => b.quaternion.toArray()), estado: Cin.util.estadoMontaje() }));
    comprobar(id + ': retención de pose y contacto', igual(retenido, retenido2) && retenido.estado.contacto && retenido.estado.errorContacto < .1, retenido);
    await pausa(id + ': pausa en el contacto'); await omitir();

    // La consulta reutiliza el montaje desde un estado posterior y conserva la partida completa.
    await iniciar(id); await terminar();
    const consulta = await pagina.evaluate(id => {
      const antes = JSON.stringify(Sis.ST), eventos = __eventosMontaje.length, objetos = __objetosMontaje.length;
      window.__consulta = null; Cin[id](() => { __consulta = { igual: antes === JSON.stringify(Sis.ST), eventos: eventos === __eventosMontaje.length,
        objetos: objetos === __objetosMontaje.length }; }, { consulta: true }); return true;
    }, id);
    comprobar(id + ': consulta disponible después de verla', consulta);
    await omitir(); comprobar(id + ': consultar no vuelve a pagar', await pagina.evaluate(() => __consulta && __consulta.igual && __consulta.eventos && __consulta.objetos));

    // Guardar antes del cierre simula una recarga interrumpida: ningún plano intermedio confirma recompensas.
    await iniciar(id); await ir(caso.repetir[0], .7);
    const partida = await pagina.evaluate(() => { Sis.guardar(); return JSON.parse(localStorage.getItem(Campana.clave)); });
    comprobar(id + ': guardado intermedio sin cierre parcial', !partida.inicio.cap.montajes && !partida.inv.farol && !partida.inicio.cap.oscuridadHeredada, partida.inicio.cap);
    await omitir();
    await pagina.evaluate(([id, partida]) => __iniciarMontaje(id, 'katana', partida), [id, partida]);
    const reanudado = await terminar(); limpio(id + ': restauración después de cargar a mitad', reanudado);
    comprobar(id + ': estado normal = recarga intermedia', igual(normal.final, reanudado.final), { normal: normal.final, reanudado: reanudado.final });

    await iniciar(id);
    const presupuesto = await pagina.evaluate(() => {
      const pico = { halos: 0, luz: 0, polvo: 0, dibujosFX: 0 }, limite = Cin.util.estadoMontaje().hilo;
      let n = 0;
      while (Cin.activa && n++ < 4000) {
        __ecos.sim(1, 1 / 60); const e = Cin.util.estadoMontaje().hilo, grupo = scene.getObjectByName('Montaje_' + Cin.tipo);
        let halos = 0, dibujos = 0;
        const contar = o => {
          let padre = o; while (padre && padre.visible && padre !== scene) padre = padre.parent;
          if (padre !== scene) return;
          if (o instanceof Halo && o.opacidad > 0) halos++;
          if (o.isPoints) dibujos++;
        };
        if (grupo) grupo.traverse(contar);
        if (Cin.tipo === 'liberacion') { LunaDorada.root.traverse(contar); LunaRoja.root.traverse(contar); Lumi.grupo.traverse(contar); }
        pico.halos = Math.max(pico.halos, halos); pico.luz = Math.max(pico.luz, e.luz); pico.polvo = Math.max(pico.polvo, e.polvo); pico.dibujosFX = Math.max(pico.dibujosFX, dibujos);
      }
      return { pico, limite };
    });
    pico = presupuesto.pico; medidas.push({ id, presupuesto });
    comprobar(id + ': límites simultáneos de toda la escena', pico.halos <= presupuesto.limite.limite && pico.luz <= presupuesto.limite.maxLuz &&
      pico.polvo <= presupuesto.limite.maxPolvo && pico.dibujosFX <= (calidad === 'baja' ? 1 : 2), presupuesto);
    const recargaFinal = await pagina.evaluate(() => {
      const antes = JSON.parse(JSON.stringify(Sis.ST)), eventos = __eventosMontaje.length; Sis.guardar();
      if (!Sis.cargar()) throw Error('No se pudo cargar el cierre');
      return { antes, despues: JSON.parse(JSON.stringify(Sis.ST)), eventos: eventos === __eventosMontaje.length };
    });
    comprobar(id + ': cargar el cierre no duplica inventario, eventos ni estado', igual(recargaFinal.antes, recargaFinal.despues) && recargaFinal.eventos, recargaFinal);
  }
  for (const arma of ['arco', 'escuela', 'naginata', 'odachi']) {
    await iniciar('muerteTasogare', arma); await ir(2, 1.22);
    const gesto = await pagina.evaluate(() => ({ montaje: Cin.util.estadoMontaje(), arma: Sis.ST.eq.arma,
      luz: Sis.ST.luz, inicial: __baseMontajes.luz, inv: { ...Sis.ST.inv } }));
    comprobar('Intervención equipada: ' + arma, gesto.arma === arma && gesto.montaje.errorContacto < .1 && gesto.luz === gesto.inicial, gesto);
    await omitir();
  }

  await iniciar('muerteTasogare'); await omitir();
  const silencio = await pagina.evaluate(() => {
    const piloto = Piloto.actualizar;
    try {
      Piloto.actualizar = () => {};
      Object.values(Sis.ST.mis).forEach(m => m.e = 'hecha');
      for (const s of Sombras.lista.slice()) Sombras.quitar(s); Sombras.esquirlas.length = 0;
      Cazadores.lista.forEach(c => c.estado = 'patrulla');
      const P = IslaYoake.puntos.chiyo; __ecos.tele(P.x, P.z); J.combate = 0; G.estado = 'juego';
      UI.banner('Prueba de recompensa', 'Debe esperar al silencio', 'luz', 'mision'); UI.nivel(5, 'Prueba de nivel'); Sis.rescatar(5);
      const pendientes = Sis.ST.avisos.pendientes.length, popupOculto = $('motasMas').style.visibility === 'hidden';
      __ecos.sim(140, .05); const siete = Sis.ST.avisos.restante;
      UI.pausado = true; __ecos.sim(200, .05); const pausa = Sis.ST.avisos.restante; UI.pausado = false;
      UI.dialogo('Hikari', ['Prueba de lectura.'], () => {}); __ecos.sim(40, .05);
      const lectura = Sis.ST.avisos.restante; UI.saltarDialogo();
      J.combate = 30; __ecos.sim(40, .05); const combate = Sis.ST.avisos.restante; J.combate = 0;
      Sis.guardar(); if (!Sis.cargar()) throw Error('No se pudo cargar el reloj seguro');
      const carga = Sis.ST.avisos.restante, retenidos = Sis.ST.avisos.pendientes.length;
      __ecos.sim(259, .05); const antes = { restante: Sis.ST.avisos.restante, mostrados: Sis.ST.avisos.mostrados.length };
      __ecos.sim(2, .05); const despues = { restante: Sis.ST.avisos.restante, mostrados: Sis.ST.avisos.mostrados.length };
      return { pendientes, retenidos, popupOculto, siete, pausa, lectura, combate, carga, antes, despues };
    } finally { Piloto.actualizar = piloto; }
  });
  comprobar('Veinte segundos seguros; pausa, diálogo, combate y recarga conservan los 13 s restantes', silencio.popupOculto && silencio.pendientes >= 3 &&
    silencio.retenidos >= silencio.pendientes && [silencio.siete, silencio.pausa, silencio.lectura, silencio.combate, silencio.carga].every(t => Math.abs(t - 13) < .001) &&
    silencio.antes.restante > 0 && silencio.antes.mostrados === 0 && silencio.despues.restante === 0 && silencio.despues.mostrados === 1, silencio);

  // Carga real de un cierre: mismo inventario y hechos, sin anunciar ni ejecutar el montaje otra vez.
  await iniciar('liberacion'); const final = await terminar();
  await pagina.evaluate(() => Sis.guardar());
  await pagina.reload({ timeout: 180000 });
  await pagina.waitForFunction(() => window.__ecos && G.estado === 'portada', null, { timeout: 120000 });
  const cargado = await pagina.evaluate(() => {
    __ecos.manual(true); if (!Sis.cargar()) throw Error('No se pudo cargar');
    return { inv: Sis.ST.inv, cap: Sis.ST.inicio.cap, cielo: Sis.ST.cieloRojo, duelo: Sis.ST.dueloLuna };
  });
  comprobar('Recarga conserva liberación única y coste de Lumi', igual(cargado.inv, final.final.st.inv) && igual(cargado.cap, final.final.st.inicio.cap) &&
    !cargado.cielo && cargado.duelo.liberada, cargado);
  await pagina.locator('#btnContinuar').click();
  await pagina.waitForFunction(() => G.estado === 'juego', null, { timeout: 30000 });
  await pagina.evaluate(() => __ecos.sim(2, 1 / 60));
  comprobar('Continuar conserva la escala 0,35 y no vuelve a iniciar combate ni montaje', await pagina.evaluate(() =>
    Math.abs(Lumi.grupo.scale.x - .35) < 1e-8 && !DueloLuna.activo && !Cin.activa && !Sis.ST.cieloRojo));
  comprobar('Cero errores de consola', errores.length === 0, errores);
} catch (e) {
  errores.push(e.stack || e.message); process.exitCode = 1;
  try { await foto('error'); } catch {}
} finally {
  fs.writeFileSync(path.join(salida, 'resultado.json'), JSON.stringify({ archivo, calidad, pruebas, medidas, errores }, null, 2));
  console.log(JSON.stringify({ archivo, calidad, correctas: pruebas.filter(p => p.pasa).length, total: pruebas.length, errores }, null, 2));
  await navegador.close(); await new Promise(r => servidor.close(r));
}
