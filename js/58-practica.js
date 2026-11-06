/* Encuentro de revisión, fuera del argumento. Solo usa estado temporal: ni ganar,
   perder, cambiar nivel o salir puede guardar o borrar una campaña. */
"use strict";
const PRACTICA = { centro: { x: 60, z: 60, y: 240 }, radio: 15, vidaEco: 220, niveles: [1, 5, 10] };
const Practica = (() => {
  let activa = false, nivel = 1, siguiente = 1, resultado = '', perfil = null, g = null, piso = null, tiempo = 0, paradas = 0;
  function crear() {
    if (g) return; const C = PRACTICA.centro;
    g = new THREE.Group(); g.position.set(C.x, C.y, C.z); g.visible = false; scene.add(g);
    const suelo = new THREE.Mesh(new THREE.CylinderGeometry(PRACTICA.radio, PRACTICA.radio, .6, 48), new THREE.MeshStandardMaterial({ color: 0x4a5668, roughness: .95 }));
    suelo.position.y = -.3; suelo.receiveShadow = true; g.add(suelo);
    const ring = new THREE.Mesh(new THREE.RingGeometry(13.5, 13.65, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xe4d7b0 })); ring.position.y = .012; g.add(ring);
    piso = Sol.add(C.x, C.z, PRACTICA.radio, PRACTICA.radio, 0, C.y - .6, C.y); piso.on = false;
  }
  function comenzar() { Portada.mostrar(false); activa = true; siguiente = 1; crear(); g.visible = true; piso.on = true; if (UI.dlg) UI.saltarDialogo(); reiniciar(); UI.abrir('ajustes'); }
  function reiniciar() {
    if (!activa) return;
    Duelo.detener(); nivel = siguiente; resultado = ''; tiempo = paradas = 0;
    Sis.nueva(); const S = Sis.ST, C = PRACTICA.centro;
    S.nivel = nivel; S.inv = { katana: 1, ...(nivel >= 5 ? { naginata: 1 } : {}), ...(nivel >= 10 ? { odachi: 1 } : {}) };
    const mejoras = nivel >= 10 ? 3 : nivel >= 5 ? 1 : 0; S.mejoras = { vida: mejoras, capa: mejoras, manto: mejoras }; S.mis = {}; S.seg = null;
    ProgresionEnemiga.registrar(S); Sis.equipar('katana'); S.hp = Sis.hpMax(); S.luz = Sis.luzMax();
    if (S.inicio) Object.assign(S.inicio, { prologo: true, nombre: true, hinode: true, momo: true, tsuru: true, hoja: true, rumbo: true, fin: true });
    Object.assign(J, { x: C.x, y: C.y, z: C.z - 5, vx: 0, vy: 0, vz: 0, vivo: true, suelo: true, nada: false, vel: 0, yaw: Math.PI, camYaw: Math.PI, camPitch: .28, camDist: 6.4, camDistObj: 6.4,
      inv: 1, cdEsq: 0, rodando: 0, hitstop: 0, herido: 0, impacto: 0, sinDano: 0, tSalto: 9, doble: false, cdPulso: 0, combate: 3 });
    G.estado = 'juego'; G.bloqueo = false; G.tAuto = 0; G.sx = J.x; G.sy = J.y + 1.4; G.sz = J.z;
    Mov.reiniciar(); Combate.reiniciar(); Hikari.mostrar(true); Hikari.mover(J.x, J.y, J.z, J.yaw); Hikari.reiniciarAnimacion(); Hikari.reiniciarTela();
    Lumi.teletransportar(J.x, J.y + 1, J.z); perfil = ProgresionEnemiga.capturar('practica');
    Tasogare.reiniciar(); Duelo.empezar({ centro: C, practica: true, perfil, vida: PRACTICA.vidaEco });
    $('btnSalir').textContent = 'Salir de la práctica'; UI.hud(true); UI.refrescarMision();
    $('misPanel').style.display = 'none'; $('mapaWrap').style.display = 'none'; actualizarTexto();
    if (UI.pausado) UI.cerrar();
  }
  function actualizarTexto() {
    const e = $('practicaInfo'); e.classList.remove('oculto');
    e.textContent = 'PRÁCTICA · Nivel ' + nivel + ' · ' + (resultado || 'Eco de Tasogare') + ' · ' + UI.teclas('{menu}: nivel y reinicio');
  }
  function elegir(n) { if (!PRACTICA.niveles.includes(n)) return; siguiente = n; UI.render(); UI.aviso('Nivel ' + n + ' al reiniciar la práctica', 'info'); }
  function terminar(gano) {
    if (!activa || resultado) return;
    resultado = gano ? 'Encuentro superado' : 'Inténtalo de nuevo'; Duelo.detener(); G.bloqueo = true;
    Combate.reiniciar(); J.vivo = true; J.vx = J.vz = J.vy = 0; actualizarTexto(); UI.abrir('ajustes');
  }
  function actualizar(dt) {
    if (!activa || resultado) return; tiempo += dt;
    const C = PRACTICA.centro;
    if (Math.hypot(J.x - C.x, J.z - C.z) > PRACTICA.radio - .5 || J.y < C.y - 1) { J.x = C.x; J.z = C.z - 5; J.y = C.y; J.vx = J.vy = J.vz = 0; J.planeo = false; J.suelo = true; Hikari.reiniciarAnimacion(); Hikari.reiniciarTela(); UI.aviso('Regresas al círculo de práctica', 'info'); }
  }
  function panel() {
    if (!activa) return '';
    const d = Duelo.depurar(), resistencia = d.fase === 'espera' ? Math.round(PRACTICA.vidaEco * perfil.vida) : d.vidaMax;
    return '<div class="grupoT">Práctica de combate</div><p>Espacio de ensayo fuera de la historia. No cambia tu partida.</p>' +
      '<p>' + (resultado || 'Esquiva las cargas; para los cortes y contraataca al recuperarse. Mantener la guardia no equivale a una parada.') + '</p>' +
      '<p>Nivel actual: ' + nivel + ' · próximo: ' + siguiente + ' · paradas: ' + paradas + '</p>' +
      '<p>Eco: ' + resistencia + ' de resistencia · ' + (1 + perfil.rango) + (perfil.rango ? ' cortes' : ' corte') + ' por secuencia. Atributos fijados al empezar.</p><div class="ajuste"><span>Nivel al reiniciar</span><span>' +
      PRACTICA.niveles.map(n => '<button class="mini" data-act="practicaNivel" data-v="' + n + '">' + n + '</button>').join(' ') +
      '</span></div><button class="mini" data-act="practicaReiniciar">' + (Duelo.fase === 'espera' ? 'Comenzar encuentro' : 'Reiniciar encuentro') + '</button><div class="grupoT">Ajustes</div>';
  }
  Bus.on('practica:resultado', d => terminar(d.gano)); Bus.on('parada', () => { if (activa && !resultado) paradas++; });
  Bus.on('dispositivo', () => { if (activa) actualizarTexto(); });
  return { crear, comenzar, reiniciar, elegir, terminar, actualizar, panel, get activa() { return activa; },
    depurar: () => ({ activa, nivel, siguiente, resultado, perfil, tiempo, paradas }) };
})();
