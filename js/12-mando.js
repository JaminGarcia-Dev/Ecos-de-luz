/* === Ecos de Luz · 12-mando.js ===
   Mando Xbox (o cualquier mando con mapeo estándar): juego, menús, portada y créditos.
   Los botones se traducen a las mismas teclas virtuales que usa el teclado. */
"use strict";
const Mando = (() => {
  const M = { ultimo: 'teclado', id: '', prev: [], mx: 0, mz: 0, sprint: false, foco: 0, rep: 0, repX: 0, conectado: false, vista: 0, vistaUsada: false };
  // A, B, X, Y, LB, RB (guardia), LT, RT, R3 (fijar objetivo), cruceta ↑ → ↓ ←
  const MAPA = { 0: 'Space', 1: 'KeyV', 2: 'Mouse0', 3: 'KeyE', 4: 'KeyQ', 5: 'KeyR', 6: 'KeyC', 7: 'Mouse2', 11: 'KeyZ', 12: 'Digit1', 15: 'Digit2', 13: 'Digit3', 14: 'Digit4' };
  const TABS = ['misiones', 'mapa', 'zurron', 'hikari', 'diario', 'controles', 'ajustes'];
  const nombre = id => /xbox|xinput/i.test(id) ? 'Xbox' : /playstation|dualsense|dualshock|054c/i.test(id) ? 'PlayStation' : 'mando';
  function pad() { const ps = navigator.getGamepads ? navigator.getGamepads() : []; for (const p of ps) if (p && p.connected) return p; return null; }
  function usar(m) { if (M.ultimo === m) return; M.ultimo = m; document.body.classList.toggle('modo-mando', m === 'mando'); Bus.emit('dispositivo', m); }   // los textos con {acción} se rehacen (08-interfaz.js)
  function soltar() { for (const k of Object.values(MAPA)) KEY[k] = false; }
  function iniciar() {
    addEventListener('gamepadconnected', e => { M.conectado = true; M.id = e.gamepad.id; UI.aviso('Mando conectado (' + nombre(e.gamepad.id) + ')', 'conteo'); usar('mando'); });
    addEventListener('gamepaddisconnected', () => { M.conectado = false; M.sprint = false; soltar(); M.mx = M.mz = 0; UI.aviso('Mando desconectado', 'error'); usar('teclado'); });
    addEventListener('keydown', () => usar('teclado')); addEventListener('mousedown', () => usar('teclado'));
  }
  const pulsado = (p, i) => { const b = p.buttons[i]; return !!b && (b.pressed || b.value > .35); };
  const zm = v => Math.abs(v) < .18 ? 0 : (v - Math.sign(v) * .18) / .82;
  function enMenu() { return UI.pausado || UI.dlg && UI.dlg.opciones || G.estado === 'portada' || G.estado === 'portada-menu' || !$('creditos').classList.contains('oculto'); }
  function leer(dt) {
    const p = pad(); if (!p) { M.mx = M.mz = 0; M.sprint = false; return; }
    if (!M.conectado) { M.conectado = true; M.id = p.id; }
    const B = p.buttons.map((_, i) => pulsado(p, i)), prev = M.prev, nuevo = i => B[i] && !prev[i];
    const lx = zm(p.axes[0] || 0), ly = zm(p.axes[1] || 0), rx = zm(p.axes[2] || 0), ry = zm(p.axes[3] || 0);
    if (B.some((v, i) => v && !prev[i]) || Math.hypot(lx, ly) > .3 || Math.hypot(rx, ry) > .3) usar('mando');
    if (enMenu()) { soltar(); M.mx = M.mz = 0; navegar(B, nuevo, lx, ly, dt); M.prev = B; return; }
    for (const i in MAPA) { const k = MAPA[i]; if (B[i] && !prev[i]) { KEY[k] = true; KEYP[k] = true; } else if (!B[i] && prev[i]) KEY[k] = false; }
    if (Cin.activa && nuevo(9)) UI.abrir('diario');
    // Vista: pulsar abre el mapa; mantener activa o desactiva la guía de Lumi
    if (G.estado === 'juego' && !Cin.activa) {
      if (nuevo(9)) UI.abrir();
      if (B[8]) { M.vista += dt; if (M.vista > .45 && !M.vistaUsada) { M.vistaUsada = true; KEYP.KeyF = true; } }
      else { if (prev[8] && !M.vistaUsada) UI.abrir('mapa'); M.vista = 0; M.vistaUsada = false; }
    }
    if (nuevo(10)) { M.sprint = !M.sprint; }
    M.mx = lx; M.mz = -ly; if (Math.hypot(lx, ly) < .12) M.sprint = false;
    G.mdx += Math.sign(rx) * rx * rx * 1150 * dt; G.mdy += Math.sign(ry) * ry * ry * 700 * dt;
    M.prev = B;
  }
  function navegar(B, nuevo, lx, ly, dt) {
    const cred = !$('creditos').classList.contains('oculto');
    const cont = cred ? $('creditos') : UI.pausado ? $('pausa') : UI.dlg && UI.dlg.opciones ? $('dialogo') : $('portada');
    const els = [...cont.querySelectorAll('button, [data-act], input, select')].filter(e => e.offsetParent !== null && !e.disabled && !(e.dataset && e.dataset.act === 'tab'));
    document.querySelectorAll('.foco').forEach(e => { if (!els.includes(e)) e.classList.remove('foco'); });
    if (!els.length) return;
    M.foco = clamp(M.foco, 0, els.length - 1);
    const ey = Math.abs(ly) > .5 ? Math.sign(ly) : 0, ex = Math.abs(lx) > .5 ? Math.sign(lx) : 0;
    M.rep -= dt; M.repX -= dt; if (!ey) M.rep = 0; if (!ex) M.repX = 0;
    let dy = (nuevo(13) ? 1 : 0) - (nuevo(12) ? 1 : 0); if (!dy && ey && M.rep <= 0) { dy = ey; M.rep = .22; }
    let dx = (nuevo(15) ? 1 : 0) - (nuevo(14) ? 1 : 0); if (!dx && ex && M.repX <= 0) { dx = ex; M.repX = .22; }
    if (dy) { M.foco = (M.foco + dy + els.length) % els.length; Sonido.sfx('ui'); }
    const el = els[M.foco]; els.forEach(e => e.classList.toggle('foco', e === el)); if (dy) el.scrollIntoView({ block: 'nearest' });
    if (dx && el.tagName === 'INPUT' && el.type === 'range') { el.value = +el.value + dx * (+el.step || .05); el.dispatchEvent(new Event('input', { bubbles: true })); }
    else if (dx && el.tagName === 'SELECT') { el.selectedIndex = clamp(el.selectedIndex + dx, 0, el.options.length - 1); el.dispatchEvent(new Event('input', { bubbles: true })); }
    if (nuevo(0)) { if (el.type === 'checkbox') { el.checked = !el.checked; el.dispatchEvent(new Event('input', { bubbles: true })); } else el.click(); }
    if (UI.pausado && (nuevo(1) || nuevo(9))) UI.cerrar();
    if (UI.pausado && (nuevo(4) || nuevo(5))) { const i = TABS.indexOf(UI.tab); UI.tab = TABS[(i + (nuevo(5) ? 1 : -1) + TABS.length) % TABS.length]; UI.render(); M.foco = 0; Sonido.sfx('ui'); }
  }
  function vibrar(f, d, ms) {
    if (AJUSTES.vibracion === false) return;
    if (M.ultimo !== 'mando') return; const p = pad(); if (!p || !p.vibrationActuator) return;
    try { const r = p.vibrationActuator.playEffect('dual-rumble', { duration: ms || 200, strongMagnitude: f, weakMagnitude: d }); if (r && r.catch) r.catch(() => { }); } catch (e) { }
  }
  return { iniciar, leer, vibrar, get ultimo() { return M.ultimo; }, get mx() { return M.mx; }, get mz() { return M.mz; }, get sprint() { return M.sprint; }, get conectado() { return M.conectado; } };
})();
