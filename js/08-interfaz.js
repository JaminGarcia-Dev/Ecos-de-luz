/* === Ecos de Luz · 08-interfaz.js ===
   HUD, brújula, minimapa guía, avisos, diálogos y menú de pausa
   (misiones, mapa, zurrón, Hikari, diario, controles y ajustes). */
"use strict";

const UI = (() => {
  const U_ = { pausado: false, dlg: null, tab: 'misiones', onViaje: null, onSalir: null, onReanudar: null, hudOn: false };
  let cBr, xBr, cMm, xMm, tBan = 0, tDia = 0, tCons = [], regionTxt = '', tFps = 0, nf = 0, fpsV = 0, sinHab = {};
  // barras con rastro (la vida perdida se ve un momento antes de vaciarse) y HUD que se atenúa en calma
  const HUD_ = { rastroVida: 1, rastroLuz: 1, espera: 0, calma: 0, hp0: 0, luz0: 0, reposo: 6, motas: -1, llamas: -1 };
  /* insertos del mapa: medidas en píxeles sobre el lienzo de referencia de 700; salida de la flecha en metros */
  const MAPA_INSERTO = { lado: 150, margen: 10, cabecera: 26, relleno: 5, letra: 12, despeje: 20, salida: 45, punta: 6, trazo: 4 };
  /* rótulos: dura lo que su animación (CSS #banner.on) más un hueco; como mucho 'cola' esperando */
  const ROTULO = { dura: 4.6, hueco: .4, cola: 3 };
  /* subtítulos: al cambiar de línea, la anterior se funde (ms, igual que la transición de #subtitulo) antes de la nueva */
  const SUBT = { cambio: 450 }; let subTok = 0;
  const colaRot = []; let tRotFin = 0, tFundidoFin = 0, enCine = false;
  const CONSEJOS = ['Si te quedas quieto y agachado ({agacharse}), los animales curiosos se acercan.', 'Los animales solo se defienden si los golpeas. Y no mueren: se calman.', 'Mantén {saltar} en el aire para planear. Cuanta más luz tengas, más durará.',
    'Las corrientes de aire cálido te elevan: planea sobre ellas para llegar a la cima.', 'Los murales guardan la historia del valle. Son ocho.', 'Esquiva con {esquivar}: tienes unos instantes de invulnerabilidad.'];
  /* teclas en los textos: un texto (misión, aviso, pista, rótulo, menú) nombra la acción entre llaves, {interactuar}, y
     se muestra con la tecla o con el botón del mando según lo último que se usó (Mando.ultimo); mismas equivalencias
     que la pantalla de controles */
  const TECLAS_ACCION = { interactuar: ['E', 'Y'], saltar: ['Espacio', 'A'], agacharse: ['C', 'LT'], pulso: ['Q', 'LB'], guardia: ['R', 'RB'], esquivar: ['V', 'B'],
    atacar: ['clic izquierdo', 'X'], fijar: ['Z / clic central', 'R3'], haz: ['clic derecho', 'RT'], correr: ['Shift', 'L3'], mover: ['WASD', 'stick izquierdo'], lumi: ['F', '⧉ Vista'], menu: ['Esc', '≡ Menú'],
    repetir: ['R', 'RB'], omitir: ['V', 'B'] };   // repetir línea o plano; omitir una conversación (conversaciones y escenas del piloto)   // en texto, Vista y Menú con su dibujo
  const teclas = txt => !txt || txt.indexOf('{') < 0 ? txt : txt.replace(/\{(\w+)\}/g, (s, k) => TECLAS_ACCION[k] ? TECLAS_ACCION[k][Mando.ultimo === 'mando' ? 1 : 0] : s);
  const $$ = s => document.querySelector(s);
  /* botones de las escenas del piloto, con la tecla o el botón del dispositivo en uso */
  function etiquetasCine() {
    $('cinePausa').textContent = teclas('Pausar · {menu}');
    $('cineRepetir').textContent = teclas('Repetir plano · {repetir}');
    $('cineAvanzar').textContent = teclas('Avanzar · {interactuar}');
  }

  function iniciar() {
    Bus.on('dispositivo', () => { refrescarMision(true); if (U_.pausado) render(); etiquetasCine(); etiquetasDialogo(); });   // las teclas de los textos cambian con el mando
    cBr = $('brujula'); xBr = cBr.getContext('2d'); cMm = $('minimapa'); xMm = cMm.getContext('2d');
    const hb = $('hotbar'); hb.innerHTML = [1, 2, 3, 4].map(i => `<div class="slot" id="slot${i}"><kbd class="k-tec">${i}</kbd><kbd class="k-pad">${['▲', '▶', '▼', '◀'][i - 1]}</kbd><span></span><b></b></div>`).join('');
    Iconos.poner();   // iconos fijos del HUD, la portada y los créditos (data-ico)
    // luz rescatada: «+n» junto al contador; reiniciar la animación en el fotograma siguiente evita recalcular la página
    Bus.on('motas', d => { const m = $('motasMas'), c = $('motas'); m.textContent = (d.n < 0 ? '−' : '+') + Math.abs(d.n); m.classList.toggle('pierde', d.n < 0); m.classList.remove('on'); c.classList.remove('gana'); HUD_.calma = 0;
      requestAnimationFrame(() => requestAnimationFrame(() => { m.classList.add('on'); c.classList.add('gana'); })); });
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-act]'); if (!a) return; const act = a.dataset.act, v = a.dataset.v;
      if (act === 'tab') { U_.tab = v; render(); Sonido.sfx('ui'); }
      else if (act === 'seguir') { Sis.seguir(v); render(); }
      else if (act === 'usar') { Sis.usar(v); render(); }
      else if (act === 'cocinar') { Sis.cocinar(+v); render(); }
      else if (act === 'mejorar') { Sis.mejorar(v); render(); }
      else if (act === 'viajar') { if (U_.onViaje) U_.onViaje(v); }
      else if (act === 'practicaNivel') Practica.elegir(+v);
      else if (act === 'practicaReiniciar') Practica.reiniciar();
      else if (act === 'info') { const d = $('descItem'); if (d) d.innerHTML = '<b>' + ITEMS[v].nom + '</b><br>' + ITEMS[v].desc + (ITEMS[v].tipo === 'cons' || ITEMS[v].tipo === 'arma' || ITEMS[v].tipo === 'manto' || ITEMS[v].tipo === 'mascara' ? '<br><small>Clic de nuevo para ' + (ITEMS[v].tipo === 'cons' ? 'usar' : 'equipar') + '.</small>' : ''); U_.sel = v; }
    });
    document.addEventListener('input', e => {
      const k = e.target.dataset && e.target.dataset.aj; if (!k) return; const t = e.target;
      AJUSTES[k] = t.type === 'checkbox' ? t.checked : t.type === 'range' ? +t.value : t.value; guardarAjustes(); Sonido.volumen(); aplicarAjustes(); if (k === 'fps') $('fps').classList.toggle('oculto', !AJUSTES.fps);    });
    $('dialogo').addEventListener('click', e => { if (!e.target.closest('button')) avanzarDialogo(); });
    $('dlgSiguiente').onclick = avanzarDialogo;
    $('dlgRepetir').onclick = repetirDialogo;
    $('dlgSaltar').onclick = saltarDialogo;
    $('cinePausa').onclick = () => UI.abrir('diario');
    $('cineRepetir').onclick = () => Cin.repetir();
    $('cineAvanzar').onclick = () => Cin.avanzar();
    aplicarAjustes();
  }

  /* ajustes que cambian la página: tamaño de los subtítulos */
  function aplicarAjustes() { document.body.dataset.subs = AJUSTES.subtitulos || 'normal'; }

  /* ---------- avisos y banners ---------- */
  function aviso(txt, tipo) {
    const a = document.createElement('div'); a.className = 'aviso ' + (tipo || ''); a.textContent = teclas(txt); const c = $('avisos'); c.appendChild(a); while (c.children.length > 4) c.removeChild(c.firstChild); setTimeout(() => a.remove(), 4300);
  }
  /* los rótulos se encolan: si hay uno en pantalla, el siguiente espera a que termine (título, región y lugar no se pisan) */
  function banner(tit, sub, ic, tipo) {
    if (colaRot.some(r => r[0] === tit) || colaRot.length >= ROTULO.cola) return;
    colaRot.push([tit, sub, ic, tipo]); if (performance.now() >= tRotFin) siguienteRotulo();
  }
  function siguienteRotulo() {
    // durante una cinemática los rótulos esperan (sin perderse) a que termine
    if (enCine && colaRot.length) { tRotFin = performance.now() + 300; setTimeout(siguienteRotulo, 300); return; }
    const r = colaRot.shift(); if (!r) return; const [tit, sub, ic, tipo] = r, b = $('banner');
    // la animación se reinicia quitando la clase y poniéndola en el fotograma siguiente (leer offsetWidth obligaba a
    // recalcular toda la página en el mismo fotograma: hasta 25 ms)
    b.className = ''; $('banKj').innerHTML = ic ? Iconos.svg(ic) : ''; $('banTit').textContent = teclas(tit); $('banSub').textContent = teclas(sub) || '';
    requestAnimationFrame(() => requestAnimationFrame(() => { if (!enCine) b.className = 'on ' + (tipo || ''); }));
    const ms = (ROTULO.dura + ROTULO.hueco) * 1000; tRotFin = performance.now() + ms; setTimeout(siguienteRotulo, ms);
  }
  /* ¿hay algo en pantalla que no conviene tapar? (rótulo, diálogo o fundido); los ecos esperan a que no lo haya */
  function ocupada() { return performance.now() < tRotFin || colaRot.length > 0 || !!U_.dlg || performance.now() < tFundidoFin || +$('fundido').style.opacity > .05; }
  function item(nom, n, ic) { aviso('+' + n + ' ' + nom, 'conteo'); }
  function nivel(n, hab) { banner('¡Nivel ' + n + '!', hab || 'Tu luz crece: más vida, más luz y más daño', 'nivel', 'mision'); }
  function diarioNuevo(t, tx) { $('diarioTit').textContent = t; $('diarioTxt').textContent = tx; $('diarioCard').classList.remove('oculto'); tDia = 9; }
  /* la pista calla mientras hay un subtítulo o un rótulo en pantalla: no se pisan */
  function pista(txt) { const p = $('pista'); if (txt && !ocupada() && !$('subtitulo').classList.contains('on')) { p.textContent = teclas(txt); p.classList.remove('oculto'); } else p.classList.add('oculto'); }
  function prompt(txt) { const p = $('prompt'); if (txt) { $('promptTxt').textContent = teclas(txt); p.classList.remove('oculto'); } else p.classList.add('oculto'); }
  function promptProg(f) { $('prompt').style.setProperty('--p', clamp(f, 0, 1)); }
  function mira(v) { $('mira').classList.toggle('oculto', !v); }
  function vineta(k) { const v = $('vineta'); v.style.background = 'radial-gradient(ellipse at center,transparent 35%,rgba(210,20,40,' + (.55 * k) + ') 100%)'; v.style.opacity = k > .01 ? 1 : 0; }
  function fundido(o, ms) { const f = $('fundido'); f.style.transition = 'opacity ' + (ms === undefined ? .6 : ms / 1000) + 's'; f.style.opacity = o; tFundidoFin = performance.now() + (ms === undefined ? 600 : ms); }
  /* grietas de cristal sobre la imagen (p: 0 nada … 1 rota): rayas que salen de un punto y se ramifican; se crean una
     vez por rotura (nuevo = true) */
  let rotura = null;
  function grietas(p, nuevo) {
    const c = $('grietas'); if (!p) { c.style.display = 'none'; rotura = null; return; }
    const W = innerWidth, Hh = innerHeight;
    if (nuevo || !rotura) {
      c.width = W; c.height = Hh; const cx = W * (.46 + Math.random() * .08), cy = Hh * (.42 + Math.random() * .1), R = [];
      const rama = (x, y, a, largo, nivel) => { const pts = [[x, y]]; let px = x, py = y; const n = 7; for (let i = 0; i < n; i++) { a += (Math.random() - .5) * .5; px += Math.cos(a) * largo / n; py += Math.sin(a) * largo / n; pts.push([px, py]); if (nivel < 2 && Math.random() < .3) rama(px, py, a + (Math.random() < .5 ? -1 : 1) * (.5 + Math.random() * .6), largo * .45, nivel + 1); } R.push({ pts, ancho: 2.6 - nivel * .8, ini: nivel * .18 + Math.random() * .1 }); };
      for (let k = 0; k < 13; k++) rama(cx, cy, k / 13 * TAU + Math.random() * .3, Math.hypot(W, Hh) * (.35 + Math.random() * .3), 0);
      rotura = R;
    }
    c.style.display = 'block'; const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); x.lineCap = 'round'; x.lineJoin = 'round';
    for (const r of rotura) {
      const k = clamp((p - r.ini) / (1 - r.ini), 0, 1); if (k <= 0) continue; const n = Math.max(1, Math.floor(k * (r.pts.length - 1)));
      for (const [col, w, blur] of [['rgba(255,80,60,.55)', r.ancho * 3, 12], ['rgba(255,250,240,.95)', r.ancho, 4]]) {
        x.strokeStyle = col; x.lineWidth = w; x.shadowColor = 'rgba(255,90,60,.8)'; x.shadowBlur = blur; x.beginPath(); x.moveTo(r.pts[0][0], r.pts[0][1]); for (let i = 1; i <= n; i++) x.lineTo(r.pts[i][0], r.pts[i][1]); x.stroke();
      }
    }
  }
  /* aviso del Cazador del Ocaso en el borde de la pantalla: dirección en pantalla (dx, dy de -1 a 1), cuánto (0…1), si
     está en alerta (late) y si Hikari está escondida (apagado) */
  function bordeCazador(dx, dy, k, alerta, oculta) {
    const b = $('bordeCaz'); if (!b) return; b.classList.toggle('alerta', !!alerta && k > 0); b.classList.toggle('oculta', !!oculta && !alerta);
    const c = b.children, n = Math.hypot(dx, dy) || 1, x = dx / n, y = dy / n, v = [Math.max(0, -x), Math.max(0, x), Math.max(0, y), Math.max(0, -y)];
    for (let i = 0; i < 4; i++) c[i].style.opacity = (k * (.25 + .75 * v[i])).toFixed(2);
  }
  function destello(o, ms) { const f = $('destello'); f.style.transition = 'opacity ' + (ms === undefined ? .15 : ms / 1000) + 's'; f.style.opacity = o; }
  function hud(v) { $('hud').classList.toggle('oculto', !v); U_.hudOn = v; }
  function cargando(p, txt) { $('cargando').classList.remove('oculto'); $('barraCarga').style.width = Math.round(p * 100) + '%'; if (txt) $('txtCarga').textContent = txt; if (!$('consejoCarga').textContent) $('consejoCarga').textContent = teclas(pick(CONSEJOS)); }
  function finCarga() { $('cargando').classList.add('oculto'); }
  /* equipos modestos: propone bajar la calidad (se aplica al recargar) */
  /* aviso persistente (se cerró solo, se perdió la imagen) en el recuadro de la portada; con recargar, ofrece recargar */
  function avisoCaida(txt, recargar) {
    $('sugTxt').textContent = txt; $('btnSugSi').classList.toggle('oculto', !recargar); $('btnSugSi').textContent = 'Recargar';
    $('btnSugSi').onclick = () => location.reload(); $('btnSugNo').textContent = 'Entendido';
    $('btnSugNo').onclick = () => $('sugCalidad').classList.add('oculto'); $('sugCalidad').classList.remove('oculto');
  }
  function sugerirCalidad(nivel, fps) {
    $('btnSugSi').classList.remove('oculto'); $('btnSugNo').textContent = 'Seguir así';
    $('sugTxt').textContent = 'El valle va a ' + fps + ' FPS en este equipo. Con calidad ' + nivel + ' irá más fluido.';
    $('btnSugSi').textContent = 'Usar calidad ' + nivel + ' (recarga)';
    $('btnSugSi').onclick = () => { AJUSTES.calidad = nivel; guardarAjustes(); location.reload(); };
    $('btnSugNo').onclick = () => { AJUSTES.sinSugerencia = true; guardarAjustes(); $('sugCalidad').classList.add('oculto'); };
    $('sugCalidad').classList.remove('oculto');
  }
  /* en una escena, la nota nueva del diario se esconde y su tiempo no corre: aparece al acabar */
  function cine(v) { enCine = v; if (v) $('banner').className = ''; $('bordeCaz').style.display = v ? 'none' : ''; $('diarioCard').style.visibility = v ? 'hidden' : ''; $('cineTop').classList.toggle('on', v); $('cineBot').classList.toggle('on', v); $('cineControles').classList.toggle('oculto', !v); if (v) etiquetasCine(); if (v) { hud(false); if (document.pointerLockElement) document.exitPointerLock(); } }
  function subtitulo(t) {
    const s = $('subtitulo'), k = ++subTok;
    if (!t) { s.classList.remove('on'); return; }
    if (s.classList.contains('on') && s.textContent !== t) { s.classList.remove('on'); setTimeout(() => { if (k === subTok) { s.textContent = t; s.classList.add('on'); } }, SUBT.cambio); }
    else { s.textContent = t; s.classList.add('on'); }
  }
  function tituloCine(v, sub) { $('tcSub').textContent = sub || ''; $('tituloCine').classList.toggle('on', !!v); }
  function creditos(html) { const c = $('creditos'); c.innerHTML = html; (c.querySelector('.ci') || c).insertAdjacentHTML('beforeend', PaisajeSonoro.creditos()); c.classList.remove('oculto'); }

  /* ---------- diálogo ---------- */
  function etiquetasDialogo() {
    $('dlgSig').textContent = teclas('Continuar · {interactuar}');
    $('dlgSiguiente').textContent = teclas('Continuar · {interactuar}');
    $('dlgRepetir').textContent = teclas('Repetir línea · {repetir}');
    $('dlgSaltar').textContent = teclas('Saltar conversación · {omitir}');
  }
  const textoDialogo = d => typeof d.lineas[d.i] === 'string' ? d.lineas[d.i] : d.lineas[d.i].texto;
  function mostrarLinea() {
    const d = U_.dlg, l = d.lineas[d.i]; d.n = 0; d.letra = 0; d.listo = false;
    d.espera = d.op.pausas ? Math.max(1.2, textoDialogo(d).length / 18) + (l.pausa || 0) : 0;
    $('dlgNom').textContent = l.nombre || d.nombre; $('dlgTxt').textContent = '';
    etiquetasDialogo();
    if (d.op.alLinea) d.op.alLinea(d.i);
    if (d.op.alHablar) d.op.alHablar(l.nombre || d.nombre, l.id);
  }
  function dialogo(nombre, lineas, cb, voz, op) {
    op = op || {}; U_.dlg = { nombre, lineas, i: clamp(op.i || 0, 0, lineas.length - 1), cb, voz, op };
    $('dlgOpciones').replaceChildren(); $('dlgControles').classList.toggle('oculto', !op.pausas);
    $('dlgSig').style.display = op.pausas ? 'none' : '';
    $('dialogo').classList.remove('oculto'); mostrarLinea(); Sonido.sfx('ui2');
    document.body.classList.toggle('leyendo-inicio', !!op.pausas);
    if (document.pointerLockElement) document.exitPointerLock();
  }
  function terminarDialogo() {
    const d = U_.dlg; if (!d) return; U_.dlg = null; $('dialogo').classList.add('oculto'); $('dlgOpciones').replaceChildren();
    document.body.classList.remove('leyendo-inicio');
    Bus.emit('narrativa:terminar', { dialogo: true });
    if (d.cb) d.cb();
  }
  function repetirDialogo() { if (U_.dlg && !U_.dlg.opciones) mostrarLinea(); }
  function saltarDialogo() { if (U_.dlg && !U_.dlg.opciones) terminarDialogo(); }
  function moverOpcion(delta) {
    const d = U_.dlg; if (!d || !d.opciones) return;
    d.elegida = (d.elegida + delta + d.opciones.length) % d.opciones.length;
    [...$('dlgOpciones').children].forEach((b, i) => b.classList.toggle('foco', i === d.elegida));
  }
  function opciones(nombre, lista) {
    U_.dlg = { opciones: lista, elegida: 0 }; $('dlgNom').textContent = nombre; $('dlgTxt').textContent = '';
    $('dlgSig').style.visibility = 'hidden'; $('dlgControles').classList.add('oculto'); $('dlgOpciones').replaceChildren();
    lista.forEach((op, i) => { const b = document.createElement('button'); b.className = 'mini'; b.textContent = op.texto;
      b.onclick = () => { terminarDialogo(); op.fn(); }; b.onfocus = () => { if (U_.dlg) U_.dlg.elegida = i; }; $('dlgOpciones').appendChild(b); });
    $('dialogo').classList.remove('oculto'); moverOpcion(0); if (document.pointerLockElement) document.exitPointerLock();
  }
  function avanzarDialogo() {
    const d = U_.dlg; if (!d) return false;
    if (d.opciones) { const fn = d.opciones[d.elegida].fn; terminarDialogo(); fn(); return true; }
    if (!d.listo) { d.n = textoDialogo(d).length; return true; }
    if (d.espera > 0) return true;
    d.i++; Sonido.sfx('ui');
    if (d.i >= d.lineas.length) terminarDialogo(); else mostrarLinea();
    return true;
  }

  /* ---------- HUD por fotograma ---------- */
  function refrescarMision(soloTexto) {
    const o = Sis.objetivo(), id = Sis.ST.seg;
    if (id && o) { const q = Q[id]; $('misTit').textContent = q.nom; $('misPaso').textContent = teclas(o.txt); $('misDif').textContent = (q.tipo === 'p' ? 'Principal' : 'Secundaria') + ' · ' + DIF[q.dif] + (Sis.ST.mis[id].c ? ' · ' + Math.floor(Sis.ST.mis[id].c) + '/' + (q.pasos[Sis.ST.mis[id].p].n || 1) : ''); $('misPanel').style.display = ''; }
    else { $('misTit').textContent = 'Sin misión seguida'; $('misPaso').textContent = teclas('Abre el menú ({menu}) y elige una misión para seguirla.'); $('misDif').textContent = ''; }
    if (!soloTexto && U_.pausado && U_.tab === 'misiones') render();
  }
  function brujula(J, obj) {
    const w = 520, h = 40, x = xBr; x.clearRect(0, 0, w, h);
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(15,20,48,0)'); g.addColorStop(.15, 'rgba(15,20,48,.7)'); g.addColorStop(.85, 'rgba(15,20,48,.7)'); g.addColorStop(1, 'rgba(15,20,48,0)'); x.fillStyle = g; x.fillRect(0, 6, w, 28);
    const px = (ang) => w / 2 - angDif(J.camYaw, ang) * (w / (Math.PI * 1.1)); // posición según rumbo
    x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let a = 0; a < 360; a += 15) { const r = a * Math.PI / 180, xx = px(r - Math.PI); if (xx < 10 || xx > w - 10) continue; x.fillStyle = 'rgba(243,197,107,.5)'; x.fillRect(xx - .5, a % 45 === 0 ? 8 : 14, 1, a % 45 === 0 ? 8 : 4); }
    const car = [['N', Math.PI, '#f3c56b'], ['E', Math.PI / 2 * -1 + Math.PI, '#fff'], ['S', 0, '#fff'], ['O', Math.PI / 2, '#fff']];
    // rumbo: ángulo de la dirección (dx,dz) = atan2(dx,dz); N es -z => atan2(0,-1)=PI; E es +x => PI/2; S +z => 0; O -x => -PI/2
    const dirs = [['N', Math.PI], ['E', Math.PI / 2], ['S', 0], ['O', -Math.PI / 2]];
    for (const [n, a] of dirs) { const xx = px(a); if (xx > 14 && xx < w - 14) { x.font = '800 18px "Shippori Mincho",serif'; x.fillStyle = n === 'N' ? '#f3c56b' : '#fff'; x.fillText(n, xx, 24); } }
    if (obj && obj.x !== null && obj.x !== undefined) {
      const a = Math.atan2(obj.x - J.x, obj.z - J.z); let xx = clamp(px(a), 16, w - 16); const d = Math.round(Math.hypot(obj.x - J.x, obj.z - J.z));
      x.fillStyle = '#ffd45a'; x.beginPath(); x.moveTo(xx, 8); x.lineTo(xx + 7, 16); x.lineTo(xx, 24); x.lineTo(xx - 7, 16); x.closePath(); x.fill(); x.font = '700 11px "Zen Maru Gothic",system-ui,sans-serif'; x.fillStyle = '#fff'; x.fillText(d + ' m', xx, 32);
    }
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(w / 2, 4); x.lineTo(w / 2 + 5, 0); x.lineTo(w / 2 - 5, 0); x.fill();
  }
  function minimapa(J, obj, animales) {
    const S = 220, c = S / 2, zoom = 1.0, x = xMm; x.clearRect(0, 0, S, S); x.save(); x.beginPath(); x.arc(c, c, c, 0, TAU); x.clip(); x.fillStyle = '#0b1830'; x.fillRect(0, 0, S, S);
    x.translate(c, c); x.rotate(J.camYaw - Math.PI);
    x.imageSmoothingEnabled = true; x.drawImage(MAPA.img, -(J.x + 500) * zoom, -(J.z + 500) * zoom, 1000 * zoom, 1000 * zoom);
    for (const m of MAPA.islas) x.drawImage(m.img, (m.x0 - J.x) * zoom, (m.z0 - J.z) * zoom, m.lado * zoom, m.lado * zoom);
    const P = (wx, wz) => [(wx - J.x) * zoom, (wz - J.z) * zoom];
    // lugares descubiertos
    for (const l of LUGARES) { if (!Sis.ST.lug[l.id]) continue; const [mx, mz] = P(l.x, l.z); if (Math.hypot(mx, mz) > c - 6) continue; x.fillStyle = l.viaje ? '#f3c56b' : '#fff'; x.strokeStyle = '#0f1430'; x.lineWidth = 2; x.beginPath(); x.rect(mx - 3.5, mz - 3.5, 7, 7); x.stroke(); x.fill(); }
    // luz rescatada que quedó atrás al alcanzarte el Ocaso
    const oc = Sis.ST.ocaso; if (oc) { let [mx, mz] = P(oc.x, oc.z); const d = Math.hypot(mx, mz), lim = c - 10; if (d > lim) { mx *= lim / d; mz *= lim / d; } x.save(); x.translate(mx, mz); x.rotate(Math.PI / 4); x.fillStyle = '#ffc96a'; x.strokeStyle = '#0f1430'; x.lineWidth = 2; x.globalAlpha = .7 + .3 * Math.sin(performance.now() / 250); x.beginPath(); x.rect(-4, -4, 8, 8); x.fill(); x.stroke(); x.restore(); }
    // Sombras cercanas (rojo: peligro)
    for (const s of Sombras.lista) { if (s.estado === 'romper') continue; const [mx, mz] = P(s.x, s.z), d = Math.hypot(mx, mz); if (d > c - 4 || d > 60 * zoom) continue; x.fillStyle = '#ff3a2a'; x.beginPath(); x.arc(mx, mz, 2.8, 0, TAU); x.fill(); }
    // animales cercanos
    for (const a of animales) { if (a.estado === 'calmado') continue; const [mx, mz] = P(a.x, a.z), d = Math.hypot(mx, mz); if (d > c - 4 || d > 60 * zoom) continue; x.fillStyle = a.E.tipo === 'defensivo' ? '#ff7a6b' : '#fff'; x.globalAlpha = .85; x.beginPath(); x.arc(mx, mz, 2.2, 0, TAU); x.fill(); x.globalAlpha = 1; }
    // objetivo
    if (obj && obj.x !== null && obj.x !== undefined) {
      let [mx, mz] = P(obj.x, obj.z); const d = Math.hypot(mx, mz), lim = c - 12; let borde = false; if (d > lim) { mx *= lim / d; mz *= lim / d; borde = true; }
      x.save(); x.translate(mx, mz); x.rotate(-(J.camYaw - Math.PI)); x.fillStyle = '#ffd45a'; x.strokeStyle = '#0f1430'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -9); x.lineTo(7, 0); x.lineTo(0, 9); x.lineTo(-7, 0); x.closePath(); x.stroke(); x.fill();
      x.globalAlpha = .5 + .4 * Math.sin(performance.now() / 300); x.strokeStyle = '#ffd45a'; x.beginPath(); x.arc(0, 0, borde ? 12 : 14, 0, TAU); x.stroke(); x.restore();
    }
    x.restore();
    // jugador (flecha fija hacia arriba) y cono de visión
    x.save(); x.translate(c, c); const g = x.createRadialGradient(0, 0, 4, 0, 0, 52); g.addColorStop(0, 'rgba(255,255,255,.28)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, 52, -Math.PI / 2 - .55, -Math.PI / 2 + .55); x.fill();
    x.rotate(angDif(J.camYaw, J.yaw)); x.fillStyle = '#5ff2e0'; x.strokeStyle = '#0f1430'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -8); x.lineTo(6, 6); x.lineTo(0, 3); x.lineTo(-6, 6); x.closePath(); x.stroke(); x.fill(); x.restore();
  }
  function actualizar(dt, J, ctx) {
    const S = Sis.ST;
    const fv = clamp(S.hp / Sis.hpMax(), 0, 1), fl = clamp(S.luz / Sis.luzMax(), 0, 1);
    $('fillVida').style.width = fv * 100 + '%'; $('fillLuz').style.width = fl * 100 + '%';
    // rastro: espera un momento y luego alcanza el valor actual
    if (fv < HUD_.rastroVida) { HUD_.espera += dt; if (HUD_.espera > .45) HUD_.rastroVida = damp(HUD_.rastroVida, fv, 5, dt); } else { HUD_.rastroVida = fv; HUD_.espera = 0; }
    $('rastroVida').style.width = HUD_.rastroVida * 100 + '%';
    $('barraVida').classList.toggle('baja', fv < .3); $('barraLuz').classList.toggle('llena', fl > .995);
    // HUD dinámico: en calma (sin combate, vida y luz llenas, sin diálogo) las barras y habilidades se atenúan
    const cambia = Math.abs(S.hp - HUD_.hp0) > .5 || Math.abs(S.luz - HUD_.luz0) > 2; HUD_.hp0 = S.hp; HUD_.luz0 = S.luz;
    if (J.combate > 0 || fv < .99 || fl < .98 || ctx.bestia || U_.dlg || cambia || J.guardia) HUD_.calma = 0; else HUD_.calma += dt;
    $('hud').classList.toggle('reposo', AJUSTES.hudDinamico !== false && HUD_.calma > HUD_.reposo);
    if (S.motas !== HUD_.motas) { HUD_.motas = S.motas; $('motasNum').textContent = S.motas; }
    const nl = Llamas.n; if (nl !== HUD_.llamas) { HUD_.llamas = nl; const ll = $('llamas'); [...ll.children].forEach((e, i) => e.classList.toggle('gastada', i >= nl)); ll.classList.toggle('sin', nl === 0); }
    $('txtVida').textContent = Math.ceil(S.hp) + ' / ' + Sis.hpMax(); $('txtLuz').textContent = Math.ceil(S.luz) + ' / ' + Sis.luzMax();
    $('nivelNum').textContent = S.nivel; $('anilloXP').style.setProperty('--xp', S.nivel >= Sis.NIVEL_MAX ? 100 : Math.round(S.xp / Sis.xpSig(S.nivel) * 100));
    const obj = Sis.objetivo(); brujula(J, obj); minimapa(J, obj, Fauna.lista);
    const hs = [['habEsq', J.cdEsq || 0, 1], ['habPulso', J.cdPulso || 0, Sis.pulso() ? 1 : 0], ['habGuardia', 0, 1], ['habLumi', 0, 1]];
    for (const [id, cd, ok] of hs) { const e = $(id); e.style.setProperty('--cd', Math.round(cd * 100)); e.classList.toggle('sin', !ok); }
    $('habLumi').classList.toggle('on', ctx.guia); $('habGuardia').classList.toggle('on', !!J.guardia);
    // ranura: icono en el span y cantidad en el b (los kbd son las teclas del teclado y del mando); el icono solo se cambia si cambia
    const h = ['te', 'onigiri', 'esencia']; for (let i = 0; i < 4; i++) { const el = $('slot' + (i + 1)), ic = el.querySelector('span'), n = el.querySelector('b'), a = i === 3 ? Sis.arma() : null, nom = i === 3 ? (a ? a.ic : '') : ITEMS[h[i]].ic;
      if (ic.dataset.ico !== nom) { ic.dataset.ico = nom; ic.innerHTML = nom ? Iconos.svg(nom) : '—'; }
      const c = i === 3 ? '' : String(Sis.tiene(h[i]) || ''); if (n.textContent !== c) n.textContent = c; el.classList.toggle('vacio', i === 3 ? !a : !Sis.tiene(h[i])); }
    const t = Sis.timer; $('timerWrap').classList.toggle('oculto', !t); if (t) { $('timerTxt').textContent = t.max ? t.txt + ' · ' + Math.ceil(t.t) + ' s' : t.txt; $('timerFill').style.width = clamp((t.max ? t.t / t.max : t.frac || 0) * 100, 0, 100) + '%'; }
    const b = ctx.bestia; $('bestia').classList.toggle('oculto', !b); $('bestia').classList.toggle('jefe', !!(b && b.jefe)); if (b) { $('bestiaNom').textContent = b.nom + (b.estado === 'calmado' ? ' · calmado' : ''); $('bestiaFill').style.width = clamp(b.ani / b.aniMax * 100, 0, 100) + '%'; if (b.eq !== undefined) $('bestiaEq').style.width = clamp(b.eq * 100, 0, 100) + '%'; }
    if (ctx.region !== regionTxt) { regionTxt = ctx.region; $('mapaRegion').textContent = regionTxt; }
    if (tDia > 0 && !enCine) { tDia -= dt; if (tDia <= 0) $('diarioCard').classList.add('oculto'); }
    nf++; tFps += dt; if (tFps > .5) { fpsV = Math.round(nf / tFps); nf = 0; tFps = 0; if (AJUSTES.fps) $('fps').textContent = fpsV + ' FPS · ' + renderer.info.render.triangles + ' tri · ' + Math.round(Render.medida.escala * 100) + ' % res'; }
    if (AJUSTES.fps) $('coord').textContent = Math.round(J.x) + ', ' + Math.round(J.y) + ', ' + Math.round(J.z);
    // diálogo (máquina de escribir)
    const d = U_.dlg; if (d && !d.opciones) { const L = textoDialogo(d); d.espera = Math.max(0, d.espera - dt); d.n = Math.min(L.length, d.n + dt * 55); const n = Math.floor(d.n); $('dlgTxt').textContent = L.slice(0, n); d.listo = d.n >= L.length; $('dlgSig').style.visibility = d.listo && d.espera <= 0 ? 'visible' : 'hidden'; $('dlgSiguiente').disabled = d.espera > 0;
      // voz silabeada: una sílaba cada tres letras
      if (!d.op.pausas && n >= d.letra + 3) { d.letra = n; if (/[a-záéíóúñü]/i.test(L[n - 1] || '')) Sonido.voz(d.voz); } }
  }

  /* ---------- menú de pausa ---------- */
  const TABS = [['misiones', 'Misiones'], ['mapa', 'Mapa'], ['zurron', 'Zurrón'], ['hikari', 'Hikari'], ['altar', 'Altar'], ['diario', 'Diario'], ['controles', 'Controles'], ['ajustes', 'Ajustes']];
  function abrir(tab) { U_.pausado = true; if (tab) U_.tab = tab; $('pausa').classList.remove('oculto'); render(); Sonido.sfx('ui2'); if (document.pointerLockElement) document.exitPointerLock(); }
  function cerrar() { U_.pausado = false; $('pausa').classList.add('oculto'); if (U_.onReanudar) U_.onReanudar(); }
  // el emblema del faro de la portada, pequeño, delante de las pestañas
  const EMBLEMA = document.querySelector('#portada .emblema') ? document.querySelector('#portada .emblema').outerHTML : '';
  function render() {
    $('ptabs').innerHTML = EMBLEMA + TABS.map(t => `<div class="ptab ${U_.tab === t[0] ? 'on' : ''}" data-act="tab" data-v="${t[0]}">${t[1]}</div>`).join('');
    $('pausa').firstElementChild.classList.toggle('mapa', U_.tab === 'mapa');   // la pestaña del mapa agranda el menú
    const c = $('pcontenido'), sc = c.scrollTop; c.innerHTML = teclas(({ misiones: tMisiones, mapa: tMapa, zurron: tZurron, hikari: tHikari, altar: tAltar, diario: tDiario, controles: tControles, ajustes: tAjustes })[U_.tab]()); c.scrollTop = sc;
    if (U_.tab === 'mapa') dibujarMapa();
  }
  function tMisiones() {
    const L = Sis.listaMisiones(), S = Sis.ST; let h = '<div style="font-size:13px;opacity:.8;margin-bottom:6px">Ordenadas de fácil a épica. Pulsa «Seguir» para guiarte con la brújula, el minimapa y Lumi.</div>';
    for (let d = 0; d < 4; d++) {
      const act = L.filter(o => o.q.dif === d && o.m.e === 'activa'); if (!act.length) continue; h += `<div class="grupoT"><span class="badge b${d}">${DIF[d]}</span></div>`;
      for (const { q, m } of act) { const s = q.pasos[m.p]; h += `<div class="mrow ${S.seg === q.id ? 'seg' : ''}"><div class="mi"><div class="mt">${q.tipo === 'p' ? '★ ' : ''}${q.nom}</div><div class="md">${q.desc}</div><div class="mp">▸ ${s.txt}${m.c ? ' (' + Math.floor(m.c) + '/' + (s.n || 1) + ')' : ''}</div><div class="md">Recompensa: ${q.rec.xp} XP${(q.rec.items || []).map(r => ' · ' + ITEMS[r[0]].nom).join('')}</div></div><span class="badge b${d}">${q.tipo === 'p' ? 'Principal' : 'Secundaria'}</span><button class="mini" data-act="seguir" data-v="${q.id}" ${S.seg === q.id ? 'disabled' : ''}>${S.seg === q.id ? 'Siguiendo' : 'Seguir'}</button></div>`; }
    }
    const fin = L.filter(o => o.m.e === 'hecha'); if (fin.length) { h += '<div class="grupoT">Completadas</div>'; for (const { q } of fin) h += `<div class="mrow hecha"><div class="mi"><div class="mt">✔ ${q.nom}</div></div><span class="badge b${q.dif}">${DIF[q.dif]}</span></div>`; }
    return h;
  }
  /* mapa grande: ocupa casi toda la pantalla (el menú se agranda en esta pestaña) y nombra todos los lugares;
     los que faltan por descubrir van en hueco y más tenues (pilar 1: el mapa guía sin obligar) */
  function tMapa() {
    let h = '<div class="mapaGrande"><canvas id="mapaG"></canvas><div class="leyenda"><div class="grupoT">Viaje rápido</div>';
    const v = LUGARES.filter(l => l.viaje && Sis.ST.lug[l.id]); h += v.length ? v.map(l => `<div class="mrow"><div class="mi"><div class="mt">${Iconos.svg(l.ic)} ${l.nom}</div><div class="md">${BIOMAS[biomaDe(l.x, l.z)].nom}</div></div><button class="mini" data-act="viajar" data-v="${l.id}">Viajar</button></div>`).join('') : '<div class="md">Descubre lugares para poder viajar a ellos.</div>';
    const n = LUGARES.filter(l => Sis.ST.lug[l.id]).length;
    h += `<div class="grupoT">Leyenda</div><div style="font-size:13px;line-height:1.9">◆ <span style="color:#ffd45a">Objetivo</span> · ■ <span style="color:#f3c56b">Lugar con viaje</span> · ■ Lugar descubierto · □ <span style="opacity:.7">Por descubrir</span> · ▲ <span style="color:#5ff2e0">Tú</span><br>Lugares descubiertos: ${n} / ${LUGARES.length}</div></div></div>`; return h;
  }
  function dibujarMapa() {
    const c = $('mapaG'); if (!c || !MAPA.img) return;
    // resolución del lienzo = tamaño en pantalla × densidad de píxeles (texto nítido a cualquier tamaño)
    const dpr = Math.min(2, devicePixelRatio || 1), lado = Math.round(c.getBoundingClientRect().width * dpr) || 900;
    if (c.width !== lado) { c.width = c.height = lado; }
    const x = c.getContext('2d'), S = c.width, k = S / 700, J = Sis.J || { x: 0, z: 0, yaw: 0 }, P = (wx, wz) => [(wx + 500) / 1000 * S, (wz + 500) / 1000 * S];
    x.drawImage(MAPA.img, 0, 0, S, S); x.strokeStyle = 'rgba(243,197,107,.3)'; x.lineWidth = k; for (let i = 1; i < 5; i++) { x.beginPath(); x.moveTo(i * S / 5, 0); x.lineTo(i * S / 5, S); x.moveTo(0, i * S / 5); x.lineTo(S, i * S / 5); x.stroke(); }
    const o = Sis.objetivo(), lugares = LUGARES.filter(l => !islaEn(l.x, l.z)), insertos = [];
    if (Campana.abierta('isla')) {
      const C = MAPA_INSERTO, w = C.lado * k, h = (C.lado + C.cabecera) * k, margen = C.margen * k;
      // elige una esquina libre de marcadores y de la salida hacia las islas; los nombres se ajustan después
      const puntos = lugares.map(l => P(l.x, l.z)); puntos.push(P(J.x, J.z));
      if (o && o.x !== null && o.x !== undefined) puntos.push(P(o.x, o.z));
      for (const I of ISLAS) { const d = Math.hypot(I.x, I.z); puntos.push(P(I.x / d * RADIO_ISLA, I.z / d * RADIO_ISLA)); }
      MAPA.islas.forEach((m, i) => {
        const opciones = [[margen, S - margen - h], [S - margen - w, S - margen - h], [margen, margen], [S - margen - w, margen]];
        const peso = ([a, b]) => puntos.filter(([px, py]) => px >= a - C.despeje * k && px <= a + w + C.despeje * k && py >= b - C.despeje * k && py <= b + h + C.despeje * k).length
          + insertos.filter(r => a < r.x + r.w && a + w > r.x && b < r.y + r.h && b + h > r.y).length * (puntos.length + 1);
        opciones.sort((a, b) => peso(a) - peso(b));
        insertos.push({ x: opciones[0][0], y: opciones[0][1], w, h, m, I: ISLAS[i] });
      });
    }
    dibujarZonaMapa(x, k, islaEn(J.x, J.z) ? null : J, o && islaEn(o.x, o.z) ? null : o, P, lugares, BIOMAS, { x: 0, y: 0, w: S, h: S }, insertos);
    for (const r of insertos) {
      const C = MAPA_INSERTO, I = r.I, d = Math.hypot(I.x, I.z), ux = I.x / d, uz = I.z / d;
      const a = P(ux * RADIO_ISLA, uz * RADIO_ISLA), b = P(ux * (RADIO_ISLA + C.salida), uz * (RADIO_ISLA + C.salida));
      // flecha desde la costa en la dirección real de la isla, sin representar el trayecto a escala
      x.save(); x.strokeStyle = 'rgba(243,197,107,.65)'; x.lineWidth = k; x.setLineDash([C.trazo * k, C.trazo * k]);
      x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); x.setLineDash([]);
      x.beginPath(); x.moveTo(b[0] - (ux + uz) * C.punta * k, b[1] - (uz - ux) * C.punta * k); x.lineTo(b[0], b[1]); x.lineTo(b[0] - (ux - uz) * C.punta * k, b[1] - (uz + ux) * C.punta * k); x.stroke();
      x.fillStyle = '#0b1830'; x.fillRect(r.x, r.y, r.w, r.h); x.strokeRect(r.x, r.y, r.w, r.h);
      x.font = '700 ' + Math.round(C.letra * k) + 'px "Zen Maru Gothic",system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#f3c56b';
      x.fillText(I.nom, r.x + r.w / 2, r.y + C.cabecera * k / 2, r.w - 2 * C.relleno * k);
      const area = { x: r.x + C.relleno * k, y: r.y + C.cabecera * k, w: r.w - 2 * C.relleno * k, h: r.w - 2 * C.relleno * k }, m = r.m;
      const PI = (wx, wz) => [area.x + (wx - m.x0) / m.lado * area.w, area.y + (wz - m.z0) / m.lado * area.h];
      x.beginPath(); x.rect(area.x, area.y, area.w, area.h); x.clip(); x.drawImage(m.img, area.x, area.y, area.w, area.h);
      dibujarZonaMapa(x, k, islaEn(J.x, J.z) === I ? J : null, o && islaEn(o.x, o.z) === I ? o : null, PI, LUGARES.filter(l => islaEn(l.x, l.z) === I), [], area);
      x.restore();
    }
  }
  /* nombres y símbolos compartidos por el continente y los insertos, dentro de sus propios límites */
  function dibujarZonaMapa(x, k, J, o, P, lugares, biomas, limites, reservas = []) {
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
    // primero se colocan los nombres de los lugares (cada uno donde no tape a otro: arriba, abajo, derecha o izquierda),
    // después los de las regiones donde no pisen a ninguno, y se dibuja de abajo arriba: regiones, marcadores y lugares
    const ocupado = reservas.slice(), choca = r => ocupado.some(o => r.x < o.x + o.w && r.x + r.w > o.x && r.y < o.y + o.h && r.y + r.h > o.y);
    const dentro = r => r.x >= limites.x && r.x + r.w <= limites.x + limites.w && r.y >= limites.y && r.y + r.h <= limites.y + limites.h;
    const lista = lugares.map(l => ({ l, d: !!Sis.ST.lug[l.id], p: P(l.x, l.z) })), letra = q => (q.d ? '700 ' : 'italic 500 ') + Math.round((q.d ? 12 : 11) * k) + 'px "Zen Maru Gothic",system-ui,sans-serif';
    for (const q of lista) ocupado.push({ x: q.p[0] - 6 * k, y: q.p[1] - 6 * k, w: 12 * k, h: 12 * k });
    for (const q of lista) {
      const [mx, mz] = q.p; x.font = letra(q); const w = x.measureText(q.l.nom).width + 4 * k, h = Math.round((q.d ? 12 : 11) * k) * 1.15, sep = 8 * k;
      const opciones = [[mx, mz - sep - h / 2], [mx, mz + sep + h / 2], [mx + sep + w / 2, mz], [mx - sep - w / 2, mz]];
      q.e = opciones[0];
      for (const [cx, cy] of opciones) { const r = { x: cx - w / 2, y: cy - h / 2, w, h }; if (dentro(r) && !choca(r)) { q.e = [cx, cy]; break; } }
      ocupado.push({ x: q.e[0] - w / 2, y: q.e[1] - h / 2, w, h });
    }
    x.font = '700 ' + Math.round(14 * k) + 'px "Shippori Mincho",serif';
    const regiones = biomas.map(b => {
      const t = b.nom.toUpperCase(), w = x.measureText(t).width + 8 * k, h = 18 * k, [bx, bz] = P(b.c[0], b.c[1]); let e = [bx, bz];
      for (const [dx, dz] of [[0, 0], [0, 28], [0, -28], [0, 56], [0, -56], [70, 0], [-70, 0], [0, 84], [0, -84]]) { const r = { x: bx + dx * k - w / 2, y: bz + dz * k - h / 2, w, h }; if (dentro(r) && !choca(r)) { e = [bx + dx * k, bz + dz * k]; break; } }
      ocupado.push({ x: e[0] - w / 2, y: e[1] - h / 2, w, h }); return { t, e };
    });
    x.fillStyle = 'rgba(255,255,255,.5)'; x.strokeStyle = 'rgba(10,14,34,.5)'; x.lineWidth = 3 * k;
    for (const r of regiones) { x.strokeText(r.t, r.e[0], r.e[1]); x.fillText(r.t, r.e[0], r.e[1]); }
    for (const q of lista) {
      const [mx, mz] = q.p, m = 5 * k; x.lineWidth = 2 * k; x.strokeStyle = '#0f1430';
      if (q.d) { x.fillStyle = q.l.viaje ? '#f3c56b' : '#fff'; x.beginPath(); x.rect(mx - m, mz - m, 2 * m, 2 * m); x.stroke(); x.fill(); }
      else { x.fillStyle = 'rgba(15,20,48,.55)'; x.beginPath(); x.rect(mx - m, mz - m, 2 * m, 2 * m); x.fill(); x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 1.5 * k; x.stroke(); }
    }
    for (const q of lista) {
      x.font = letra(q); x.lineWidth = 3 * k; x.strokeStyle = 'rgba(10,14,34,.85)'; x.fillStyle = q.d ? '#fff' : 'rgba(225,230,245,.78)';
      x.strokeText(q.l.nom, q.e[0], q.e[1]); x.fillText(q.l.nom, q.e[0], q.e[1]);
    }
    if (o && o.x !== null && o.x !== undefined) { const [mx, mz] = P(o.x, o.z); x.fillStyle = '#ffd45a'; x.strokeStyle = '#0f1430'; x.lineWidth = 2 * k; x.beginPath(); x.moveTo(mx, mz - 11 * k); x.lineTo(mx + 8 * k, mz); x.lineTo(mx, mz + 11 * k); x.lineTo(mx - 8 * k, mz); x.closePath(); x.stroke(); x.fill(); }
    if (!J) return;
    const [jx, jz] = P(J.x, J.z); x.save(); x.translate(jx, jz); x.scale(k, k); x.rotate(Math.PI - J.yaw); x.fillStyle = '#5ff2e0'; x.strokeStyle = '#0f1430'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -10); x.lineTo(7, 8); x.lineTo(0, 4); x.lineTo(-7, 8); x.closePath(); x.stroke(); x.fill(); x.restore();
  }
  function tZurron() {
    const inv = Sis.ST.inv, S = Sis.ST; const ids = Object.keys(ITEMS).filter(i => inv[i] || i === 'manto_alba'); const orden = { especial: -1, arma: 0, manto: 1, mascara: 2, cons: 3, mat: 4 }; ids.sort((a, b) => orden[ITEMS[a].tipo] - orden[ITEMS[b].tipo]);
    let h = '<div class="inv">' + ids.map(i => { const it = ITEMS[i], eq = S.eq.arma === i || S.eq.manto === i || (i === 'mascara' && S.eq.mascara); return `<div class="it ${eq ? 'eq' : ''}" data-act="${U_.sel === i && (it.tipo === 'cons' || it.tipo === 'arma' || it.tipo === 'manto' || it.tipo === 'mascara') ? 'usar' : 'info'}" data-v="${i}" title="${it.nom}"${it.tint !== undefined && it.tint !== 0xffffff ? ' style="color:#' + it.tint.toString(16).padStart(6, '0') + '"' : ''}>${Iconos.svg(it.ic)}${inv[i] > 1 ? '<b>' + inv[i] + '</b>' : ''}${eq ? '<small>equip.</small>' : ''}</div>`; }).join('') + '</div>';
    h += `<div class="desc" id="descItem">${U_.sel && ITEMS[U_.sel] ? '<b>' + ITEMS[U_.sel].nom + '</b><br>' + ITEMS[U_.sel].desc : 'Selecciona un objeto. Pulsa de nuevo para usarlo o equiparlo.'}</div>`;
    h += '<div class="grupoT">Cocina de campamento</div>' + RECETAS.map((r, i) => { const ok = Object.keys(r.req).every(k => Sis.tiene(k) >= r.req[k]); return `<div class="mrow"><div class="mi"><div class="mt">${ITEMS[r.id].nom}</div><div class="md">${Object.keys(r.req).map(k => ITEMS[k].nom + ' ×' + r.req[k] + ' (tienes ' + Sis.tiene(k) + ')').join(' + ')}</div></div><button class="mini" data-act="cocinar" data-v="${i}" ${ok ? '' : 'disabled'}>Preparar</button></div>`; }).join('');
    return h;
  }
  /* altar: mejoras que se compran con la luz rescatada (solo junto a un altar de santuario) */
  function tAltar() {
    const S = Sis.ST, cerca = !!Sis.altarCerca();
    let h = `<div class="stat"><span>${Iconos.svg('mota')} Luz rescatada</span><b>${S.motas || 0}</b></div>`;
    h += `<div class="md" style="margin:8px 0 4px">${cerca ? 'Estás junto a un altar: ofrece tu luz para fortalecer a Hikari.' : 'Las mejoras se compran junto a un altar de santuario (pétalo, duna, marea o escarcha). La luz rescatada se gana con chispas, ecos y Sombras rotas.'}</div>`;
    for (const id in MEJORAS_ALTAR) {
      const M = MEJORAS_ALTAR[id], n = Sis.mejora(id), max = n >= M.costes.length, coste = max ? 0 : M.costes[n], ok = cerca && !max && (S.motas || 0) >= coste;
      const puntos = M.costes.map((_, i) => `<span class="pt ${i < n ? 'on' : ''}"></span>`).join('');
      h += `<div class="mrow"><div class="mi"><div class="mt">${Iconos.svg(M.ic)} ${M.nom} <span class="niv">${puntos}</span></div><div class="md">${n ? 'Ahora: ' + M.desc(n) : 'Aún sin mejorar'}${max ? '' : ' · siguiente: ' + M.desc(n + 1)}</div></div>`
        + `<button class="mini" data-act="mejorar" data-v="${id}" ${ok ? '' : 'disabled'}>${max ? 'Completa' : coste + ' motas'}</button></div>`;
    }
    return h;
  }
  function tHikari() {
    const S = Sis.ST; const hab = [[2, 'salto', 'Doble salto', 'Pulsa {saltar} otra vez en el aire.'], [3, 'pulso', 'Pulso de luz ({pulso})', 'Onda de luz que calma y empuja a los animales enfadados.'], [4, 'alas', 'Planeo mejorado', 'El planeo gasta menos luz.'], [5, 'golpe', 'Golpe cargado', 'Mantén {atacar} y suelta: barrido potente.'], [7, 'esquiva', 'Esquiva perfecta', 'Esquivar justo antes de un golpe devuelve luz.']];
    return `<div class="stat"><span>Nivel</span><b>${S.nivel} / ${Sis.NIVEL_MAX}</b></div><div class="stat"><span>Experiencia</span><b>${S.nivel >= Sis.NIVEL_MAX ? 'MÁX' : S.xp + ' / ' + Sis.xpSig(S.nivel)}</b></div><div class="stat"><span>Vida máxima</span><b>${Sis.hpMax()}</b></div><div class="stat"><span>Luz máxima</span><b>${Sis.luzMax()}</b></div><div class="stat"><span>Daño de luz</span><b>×${Sis.dmgMult().toFixed(2)}</b></div>
    <div class="stat"><span>Animales calmados</span><b>${S.calmados}</b></div><div class="stat"><span>Luz rescatada</span><b>${S.motas || 0}</b></div><div class="stat"><span>Fragmentos de luz</span><b>${S.frag.filter(Boolean).length} / 4</b></div><div class="stat"><span>Lugares descubiertos</span><b>${Object.keys(S.lug).length} / ${LUGARES.length}</b></div><div class="stat"><span>Murales leídos</span><b>${Object.keys(S.murales).length} / 8</b></div><div class="stat"><span>Guardianes purificados</span><b>${Object.values(S.jefes || {}).filter(j => j.can).length} / 5</b></div>
    <div class="grupoT">Habilidades</div>` + hab.map(a => `<div class="sk ${S.nivel >= a[0] ? '' : 'no'}"><i>${Iconos.svg(a[1])}</i><div><b>${a[2]}</b> <small>${S.nivel >= a[0] ? '· desbloqueada' : '· nivel ' + a[0]}</small><div class="md" style="font-size:12px;opacity:.8">${a[3]}</div></div></div>`).join('');
  }
  function tDiario() {
    return Piloto.diario();
  }
  function tControles() {
    const K = [['Moverse', '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>'], ['Correr', '<kbd>Shift</kbd>'], ['Saltar / doble salto', '<kbd>Espacio</kbd>'], ['Planear', 'Mantén <kbd>Espacio</kbd> en el aire'], ['Agacharse / bucear', '<kbd>C</kbd>'], ['Deslizar', 'Corre y pulsa <kbd>C</kbd>'], ['Trepar (gasta luz) · soltarse', 'Contra una roca, mantén <kbd>Espacio</kbd> · soltarse: <kbd>Espacio</kbd> o <kbd>C</kbd>'],
      ['Atacar (combo de cada arma)', 'Clic izquierdo'], ['Golpe cargado (Nv 5)', 'Mantén clic izq.'], ['Esquivar · golpe tras esquivar', '<kbd>V</kbd> · clic al acabar'], ['Guardia · parada (pulsa justo antes del golpe)', 'Mantén <kbd>R</kbd>'], ['Fijar objetivo · cambiar', '<kbd>Z</kbd> o clic central · mueve el ratón'], ['Haz de luz (apuntar)', 'Mantén clic derecho'], ['Canalizar · punto de luz', 'Mantén <kbd>E</kbd>'], ['Interactuar / acariciar', '<kbd>E</kbd>'], ['Pulso de luz (Nv 3)', '<kbd>Q</kbd>'],
      ['Guía de Lumi', '<kbd>F</kbd>'], ['Objetos rápidos', '<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>'], ['Cambiar arma', '<kbd>4</kbd>'], ['Misiones', '<kbd>J</kbd> o <kbd>Tab</kbd>'], ['Zurrón', '<kbd>I</kbd>'], ['Mapa', '<kbd>M</kbd>'],
      ['Girar cámara', 'Ratón o flechas'], ['Zoom de cámara', 'Rueda del ratón'], ['Pausa y controles', '<kbd>Esc</kbd> o <kbd>P</kbd>'], ['Saltar escena', 'Mantén <kbd>Espacio</kbd>']];
    // con mando, su tabla va primero; Vista y Menú llevan el dibujo del botón (no tienen letra)
    const V = Iconos.svg('botonVista'), M = Iconos.svg('botonMenu'), fila = k => `<div><span>${k[0]}</span><span>${k[1]}</span></div>`;
    const tec = '<div class="grupoT">Teclado y ratón</div><div class="ctrl">' + K.map(fila).join('') + '</div>';
    const pad = '<div class="grupoT">Mando (Xbox)</div><div class="ctrl">' + [['Moverse · cámara', 'Stick izq. · stick der.'], ['Saltar / planear', 'A (mantener en el aire)'], ['Deslizar', 'Corre y pulsa LT'], ['Trepar · soltarse', 'Contra una roca, mantén A · soltarse: A o LT'], ['Esquivar', 'B'], ['Atacar · golpe cargado', 'X (mantener)'], ['Guardia · parada', 'RB (mantener)'], ['Fijar objetivo · cambiar', 'R3 · stick der.'], ['Interactuar · canalizar', 'Y (mantener)'], ['Pulso de luz', 'LB'], ['Guía de Lumi', 'Mantén ' + V + ' Vista (el botón de dos cuadrados, junto al Xbox)'], ['Agacharse / bucear', 'LT'], ['Haz de luz', 'RT (mantener)'], ['Correr', 'Pulsar stick izq. (L3)'], ['Centrar cámara (sin objetivo)', 'R3'], ['Objetos · cambiar arma', 'Cruceta ▲ ▶ ▼ · ◀'], ['Pausa · mapa', M + ' Menú · toca ' + V + ' Vista'], ['En menús', 'Cruceta, A aceptar, B volver, LB/RB pestañas']].map(fila).join('') + '</div>';
    return (Mando.ultimo === 'mando' ? pad + tec : tec + pad) + '<div class="grupoT">Consejos</div><div style="font-size:14px;line-height:1.8">• Los animales <b>no atacan</b> a menos que los golpees. Si lo haces, se defienden: esquiva y atácalos hasta agotar su ánimo.<br>• Nunca mueren: se calman, dejan una ofrenda y te dan experiencia.<br>• La guardia gasta luz con cada golpe que detiene. Si la alzas justo antes del golpe, haces una <b>parada</b>: recuperas luz, el atacante se tambalea y tu siguiente golpe es un contraataque más fuerte.<br>• Las armas pesadas hacen tambalearse a los animales grandes; la katana es la más rápida.<br>• Agáchate y quédate quieto cerca de un animal huidizo: puede acercarse a que lo acaricies.<br>• Cuanta más luz tengas, más tiempo podrás planear.<br>• Los cinco gólems guardianes se despiertan explorando: piedras, balizas, glifos, una perla y semillas. Lee sus marcas rojas en el suelo, rompe sus puntos débiles y, cuando queden aturdidos, apunta el haz de luz a su núcleo.<br>• Mantén {interactuar} en una linterna de piedra para crear un punto de luz: ahí reaparecerás.</div>';
  }
  function tAjustes() {
    const A = AJUSTES; return `${Practica.panel()}<div class="ajuste"><span>Calidad gráfica (se aplica al reiniciar la página)</span><select data-aj="calidad"><option value="alta" ${A.calidad === 'alta' ? 'selected' : ''}>Alta</option><option value="media" ${A.calidad === 'media' ? 'selected' : ''}>Media</option><option value="baja" ${A.calidad === 'baja' ? 'selected' : ''}>Baja</option></select></div>
    <div class="ajuste"><span>Dificultad del combate (Exigente es la de referencia; un combate ya empezado conserva la que tenía)</span><select data-aj="dificultad">${Object.keys(DIFICULTADES).map(k => `<option value="${k}" ${(A.dificultad || 'exigente') === k ? 'selected' : ''}>${DIFICULTADES[k].nom}</option>`).join('')}</select></div>
    <div class="ajuste"><span>Sensibilidad del ratón</span><input type="range" min=".3" max="2.5" step=".05" value="${A.sens}" data-aj="sens"></div>
    <div class="ajuste"><span>Campo de visión</span><input type="range" min="50" max="90" step="1" value="${A.fov}" data-aj="fov"></div>
    <div class="ajuste"><span>Volumen general</span><input type="range" min="0" max="1" step=".05" value="${A.maestro}" data-aj="maestro"></div>
    <div class="ajuste"><span>Volumen de música</span><input type="range" min="0" max="1" step=".05" value="${A.musica}" data-aj="musica"></div>
    <div class="ajuste"><span>Volumen de efectos</span><input type="range" min="0" max="1" step=".05" value="${A.efectos}" data-aj="efectos"></div>
    <div class="ajuste"><span>Volumen del ambiente (viento, agua, animales)</span><input type="range" min="0" max="1" step=".05" value="${A.ambiente}" data-aj="ambiente"></div>
    <div class="ajuste"><span>Tamaño de los subtítulos</span><select data-aj="subtitulos"><option value="normal" ${A.subtitulos === 'normal' ? 'selected' : ''}>Normal</option><option value="grande" ${A.subtitulos === 'grande' ? 'selected' : ''}>Grande</option><option value="enorme" ${A.subtitulos === 'enorme' ? 'selected' : ''}>Muy grande</option></select></div>
    <div class="ajuste"><span>HUD dinámico (se atenúa al explorar con calma)</span><input type="checkbox" ${A.hudDinamico !== false ? 'checked' : ''} data-aj="hudDinamico"></div>
    <div class="ajuste"><span>Vibración del mando</span><input type="checkbox" ${A.vibracion !== false ? 'checked' : ''} data-aj="vibracion"></div>
    <div class="ajuste"><span>Invertir eje vertical de la cámara</span><input type="checkbox" ${A.invY ? 'checked' : ''} data-aj="invY"></div>
    <div class="ajuste"><span>Mostrar FPS y coordenadas</span><input type="checkbox" ${A.fps ? 'checked' : ''} data-aj="fps"></div>${PaisajeSonoro.creditos()}`;
  }
  return Object.assign(U_, { teclas, iniciar, sugerirCalidad, avisoCaida, aviso, banner, ocupada, item, nivel, diarioNuevo, pista, prompt, vineta, fundido, destello, promptProg, mira, hud, cargando, finCarga, cine, subtitulo, tituloCine, creditos, dialogo, avanzarDialogo, repetirDialogo, saltarDialogo, opciones, moverOpcion, refrescarMision, actualizar, abrir, cerrar, render, grietas, bordeCazador, consejo: () => pick(CONSEJOS) });
})();
