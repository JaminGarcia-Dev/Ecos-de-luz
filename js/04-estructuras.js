/* === Ecos de Luz · 04-estructuras.js ===
   Faro del Alba, aldea, ruinas del Mirador, muelle, formaciones rocosas, murales, sistema de sólidos (cajas y
   columnas) y las utilidades de obra (ini, fin, bx, cy…) que agrupan la geometría por zonas. Los santuarios, las
   pirámides, el oasis y la cima de Kiri están en 33-santuarios.js; los interiores de las cuevas, en 32-cuevas.js. Dónde
   va cada cosa; el material de obra y las piezas (torii, faroles, casas, zorros…) están en 24-arquitectura.js y 34-piezas.js. */
"use strict";

const Sol = {
  cajas: [], cols: [],
  add(x, z, hx, hz, ry, y0, y1) { const c = { x, z, hx, hz, ry, y0, y1, on: true, r: Math.hypot(hx, hz), cs: Math.cos(ry), sn: Math.sin(ry) }; this.cajas.push(c); return c; },
  col(x, z, r, y0, y1) { const c = { x, z, r, y0, y1, on: true }; this.cols.push(c); return c; },
  /* techo sólido más alto bajo (x,z) al que se puede subir desde y */
  suelo(x, z, y) {
    let best = -1e9;
    for (const c of this.cajas) {
      if (!c.on || c.y1 > y + .65 || c.y1 <= best) continue;
      const dx = x - c.x, dz = z - c.z; if (dx * dx + dz * dz > (c.r + .3) * (c.r + .3)) continue;
      const lx = dx * c.cs - dz * c.sn, lz = dx * c.sn + dz * c.cs;
      if (Math.abs(lx) <= c.hx && Math.abs(lz) <= c.hz && c.y0 < y + 2.2) best = c.y1;
    }
    for (const c of this.cols) { if (!c.on || c.y1 > y + .65 || c.y1 <= best) continue; if (Math.hypot(x - c.x, z - c.z) < c.r && c.y1 - c.y0 < 1.2) best = c.y1; }
    return best;
  },
  /* empuja al jugador fuera de paredes. p:{x,z}; devuelve true si hubo contacto */
  empujar(p, r, y) {
    let hit = false;
    for (const c of this.cajas) {
      if (!c.on || c.y1 <= y + .65 || y + 1.6 < c.y0) continue; // si c.y1 <= y+.65 se puede pisar
      const dx = p.x - c.x, dz = p.z - c.z; if (dx * dx + dz * dz > (c.r + r) * (c.r + r)) continue;
      const lx = dx * c.cs - dz * c.sn, lz = dx * c.sn + dz * c.cs;
      const qx = clamp(lx, -c.hx, c.hx), qz = clamp(lz, -c.hz, c.hz);
      let nx = lx - qx, nz = lz - qz, d = Math.hypot(nx, nz);
      if (d >= r) continue;
      if (d < 1e-5) { const ex = c.hx - Math.abs(lx), ez = c.hz - Math.abs(lz); if (ex < ez) { nx = Math.sign(lx) || 1; nz = 0; d = -ex; } else { nz = Math.sign(lz) || 1; nx = 0; d = -ez; } }
      else { nx /= d; nz /= d; }
      const push = r - d, wx = nx * c.cs + nz * c.sn, wz = -nx * c.sn + nz * c.cs;
      p.x += wx * push; p.z += wz * push; hit = true;
    }
    for (const c of this.cols) {
      if (!c.on || y + 1.6 < c.y0 || c.y1 <= y + .65) continue;
      const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + r;
      if (d < m) { const k = d < 1e-5 ? 0 : 1 / d; p.x += (d < 1e-5 ? m : dx * k * (m - d)); p.z += (d < 1e-5 ? 0 : dz * k * (m - d)); hit = true; }
    }
    return hit;
  },
  /* ¿el punto está dentro de un sólido agrandado m metros? (la cámara no atraviesa paredes ni edificios); con rMin, no
     cuentan las columnas más finas */
  dentro(x, y, z, m, rMin) {
    for (const c of this.cajas) {
      if (!c.on || y < c.y0 - m || y > c.y1 + m) continue;
      const dx = x - c.x, dz = z - c.z; if (dx * dx + dz * dz > (c.r + m) * (c.r + m)) continue;
      const lx = dx * c.cs - dz * c.sn, lz = dx * c.sn + dz * c.cs;
      if (Math.abs(lx) <= c.hx + m && Math.abs(lz) <= c.hz + m) return true;
    }
    for (const c of this.cols) if (c.on && !(c.r < rMin) && y >= c.y0 - m && y <= c.y1 + m && Math.hypot(x - c.x, z - c.z) < c.r + m) return true;
    return false;
  },
  /* aparta de lado el punto p:{x,z} (a la altura y) de las columnas más finas que rMax, agrandadas m metros */
  fueraColumnas(p, y, m, rMax) {
    for (const c of this.cols) {
      if (!c.on || c.r >= rMax || y < c.y0 - m || y > c.y1 + m) continue;
      const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), k = c.r + m;
      if (d < k) { if (d < 1e-4) p.x += k; else { p.x = c.x + dx / d * k; p.z = c.z + dz / d * k; } }
    }
  },
  /* ¿hay un sólido de al menos 'alto' m por encima de y a menos de r m de (x, z)? (cobertura para esconderse) */
  cubre(x, z, r, y, alto) {
    for (const c of this.cols) if (c.on && c.y1 >= y + alto && c.y0 <= y + .5 && Math.hypot(x - c.x, z - c.z) < c.r + r) return true;
    for (const c of this.cajas) {
      if (!c.on || c.y1 < y + alto || c.y0 > y + .5) continue;
      const dx = x - c.x, dz = z - c.z; if (dx * dx + dz * dz > (c.r + r) * (c.r + r)) continue;
      const lx = dx * c.cs - dz * c.sn, lz = dx * c.sn + dz * c.cs;
      if (Math.abs(lx) <= c.hx + r && Math.abs(lz) <= c.hz + r) return true;
    }
    return false;
  },
  /* vista de depuración (?solidos en la URL o __ecos.solidos()): cajas y columnas en alambre, en verde lo que se pisa
     (menos de 1,2 m de alto) y en rojo las paredes. Así se ve qué obra no tiene sólido y se atraviesa */
  vista() {
    const pos = [], col = [], V = [.25, 1, .35], R = [1, .3, .25];
    const linea = (a, b, k) => { pos.push(a[0], a[1], a[2], b[0], b[1], b[2]); col.push(...k, ...k); };
    for (const c of this.cajas) {
      const k = c.y1 - c.y0 < 1.2 ? V : R, esq = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, w]) => { const lx = u * c.hx, lz = w * c.hz; return [c.x + lx * c.cs + lz * c.sn, c.z - lx * c.sn + lz * c.cs]; });
      for (let i = 0; i < 4; i++) { const a = esq[i], b = esq[(i + 1) % 4]; linea([a[0], c.y0, a[1]], [b[0], c.y0, b[1]], k); linea([a[0], c.y1, a[1]], [b[0], c.y1, b[1]], k); linea([a[0], c.y0, a[1]], [a[0], c.y1, a[1]], k); }
    }
    for (const c of this.cols) {
      const k = c.y1 - c.y0 < 1.2 ? V : R, n = 12, p = i => [c.x + Math.cos(i / n * TAU) * c.r, c.z + Math.sin(i / n * TAU) * c.r];
      for (let i = 0; i < n; i++) { const a = p(i), b = p(i + 1); linea([a[0], c.y0, a[1]], [b[0], c.y0, b[1]], k); linea([a[0], c.y1, a[1]], [b[0], c.y1, b[1]], k); if (i % 3 === 0) linea([a[0], c.y0, a[1]], [a[0], c.y1, a[1]], k); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, depthTest: false, transparent: true, opacity: .75 })); m.renderOrder = 30; m.frustumCulled = false; return m;
  },
  /* pared sólida más cercana al alcance (para trepar y aupar): normal hacia fuera y altura de la cima. Los sólidos finos
     (c.fina: barandillas, vallas, postes, faroles, fogatas) frenan como cualquiera, pero no se auparan ni se trepan */
  pared(x, z, r, y) {
    let mejor = null, dm = r;
    for (const c of this.cajas) {
      if (!c.on || c.fina || c.y1 <= y + .45 || y + 1.6 < c.y0) continue;
      const dx = x - c.x, dz = z - c.z; if (dx * dx + dz * dz > (c.r + r) * (c.r + r)) continue;
      const lx = dx * c.cs - dz * c.sn, lz = dx * c.sn + dz * c.cs, qx = clamp(lx, -c.hx, c.hx), qz = clamp(lz, -c.hz, c.hz);
      let nx = lx - qx, nz = lz - qz, d = Math.hypot(nx, nz);
      if (d >= dm) continue;
      if (d < 1e-5) { const ex = c.hx - Math.abs(lx), ez = c.hz - Math.abs(lz); if (ex < ez) { nx = Math.sign(lx) || 1; nz = 0; } else { nz = Math.sign(lz) || 1; nx = 0; } d = 0; }
      else { nx /= d; nz /= d; }
      dm = d; mejor = { nx: nx * c.cs + nz * c.sn, nz: -nx * c.sn + nz * c.cs, y1: c.y1, d, caja: c };
    }
    for (const c of this.cols) {
      if (!c.on || c.fina || c.y1 <= y + .45 || y + 1.6 < c.y0) continue;
      const dx = x - c.x, dz = z - c.z, d = Math.hypot(dx, dz) - c.r;
      if (d < dm && d > -c.r) { dm = d; const l = Math.hypot(dx, dz) || 1; mejor = { nx: dx / l, nz: dz / l, y1: c.y1, d: Math.max(d, 0), col: c }; }
    }
    return mejor;
  }
};

/* faro: ángulos (rad) de los faroles del anillo (flanquean cada escalinata, dejando libre su eje) y de los bancos (en los
   huecos, lejos de los ejes y de los cinco caminos); color de la laca y pisos de la pagoda (ancho y alto; el último, abierto) */
const FARO = { faroles: [0, 1, 2, 3].flatMap(k => [k * Math.PI / 2 - .24, k * Math.PI / 2 + .24]), bancos: [.5, 1.07, 2.07, 4.2, 5.25],
  rojo: 0xa3312a, niveles: [{ w: 9, h: 4.6 }, { w: 7.4, h: 4.2 }, { w: 6, h: 3.9 }, { w: 4.8, h: 3.6 }] };
/* zonas de obra: la obra se agrupa por zonas de 'lado' m para que la cámara descarte lo que no ve (antes era una
   sola malla de toda la isla, dibujada entera también en la sombra); las piezas de menos de 'menudo' m de radio
   (cuñas, ménsulas, vasijas, papeles) van en otra malla sin sombra que se oculta a más de 'verMenudos' m */
/* espiral de luz del final: opacidad de las plataformas y brillo de su halo (× opacidad); en sombra (fase 2 del duelo):
   opacidad sin luz y luz a partir de la que se pisa */
const ESPIRAL = { opacidad: .78, halo: .55, sombra: .15, pisa: .5 };
/* alrededores de la aldea (desde su centro): huertos [x, z, ancho, fondo, giro] y santuario de camino [x, z, giro] */
const ALDEA = { huertos: [[-34, -3, 7, 5, 1.6], [-33, 10, 6, 4.5, 1.4], [5, -33, 8, 5, .1]], hokora: [27, 15, -2.1],
  torii: { dist: 24, esc: 1.2 },   // torii de la entrada, sobre el camino del faro: a cuántos m del centro y su tamaño
  /* torii del camino del faro a Hinode, en el tramo abierto que patrulla el Cazador de la Pradera (refugios contra su ojo):
     en qué fracciones del camino (0 el faro, 1 la aldea) y su tamaño */
  toriiCamino: { t: [.3, .45, .6], esc: 1 } };
/* ruinas del Mirador: alto de la terraza, altura de cada una de las 8 columnas (0: solo la basa) y de los sillares del
   muro caído */
const MIRADOR = { terraza: .35, columnas: [3.4, 1.4, 2.6, 0, 3, 1.1, 0, 2.2], muro: [1.2, 2.4, 3.1, 2.2, 1.6, .9, 1.4] };
const OBRA_ZONAS = { lado: 120, menudo: .45, verMenudos: 70 };
/* luz de los faroles en el suelo: un charco de luz cálida bajo cada farol encendido y ante cada casa, que se nota al
   amanecer y de noche (uPenumbra de Atmosfera); radio en m, color e intensidad. Todos en una sola malla instanciada */
const LUZ_SUELO = { radio: 3.2, color: 0xffb46a, fuerza: .5 };
const Estr = (() => {
  const G = new THREE.Group();
  const GA = new Map(), GL = [];   // geometría fusionada: normal (por zonas) y emisiva
  let lA, lL, lS;
  let matE, matL;
  const E = {
    grupo: G, murales: [], faroles: [], pedestales: [], cristalesMem: [], haces: [], espiral: [], npcs: {}, luzCueva: null, refugios: [],
    corazon: null, katana: null, altar: {}, cuevaInfo: {}, tickers: []
  };
  const COL_FRAG = [0xff8fb8, 0xffc04a, 0x6fe8d0, 0x86e6ff]; // pétalo, duna, marea, escarcha
  E.COL_FRAG = COL_FRAG;

  const ini = () => { lA = []; lL = []; lS = []; };
  /* cada pieza lleva su clase de material (24-arquitectura.js); sin clase, se deduce de su color */
  const A = (g, clase, vertical) => { Arquitectura.clase(g, clase, vertical); lA.push(g); return g; }, Lz = g => { lL.push(g); return g; };
  function fin(x, y, z, ry) {
    ry = ry || 0; const m = new THREE.Matrix4().makeRotationY(ry); m.setPosition(x, y, z);
    const zk = Math.floor(x / OBRA_ZONAS.lado) + ',' + Math.floor(z / OBRA_ZONAS.lado); let Z = GA.get(zk); if (!Z) GA.set(zk, Z = { grande: [], menudo: [] });
    for (const g of lA) { g.applyMatrix4(m); g.computeBoundingSphere(); (g.boundingSphere.radius < OBRA_ZONAS.menudo ? Z.menudo : Z.grande).push(g); }
    for (const g of lL) { g.applyMatrix4(m); GL.push(g); }
    const c = Math.cos(ry), sn = Math.sin(ry);
    for (const s of lS) {
      const wx = x + s.x * c + s.z * sn, wz = z - s.x * sn + s.z * c;
      const so = s.circ ? Sol.col(wx, wz, s.r, y + s.y0, y + s.y1) : Sol.add(wx, wz, s.hx, s.hz, ry + (s.ry || 0), y + s.y0, y + s.y1); if (s.fina) so.fina = true;
    }
  }
  const sol = (x, z, hx, hz, y0, y1, o) => lS.push({ x, z, hx, hz, ry: o && o.ry || 0, y0, y1, fina: !!(o && o.fina) });   // o.fina: ver Sol.pared
  const solC = (x, z, r, y0, y1, o) => lS.push({ circ: true, x, z, r, y0, y1, fina: !!(o && o.fina) });
  const bx = (w, h, d, hex, x, y, z, o) => A(pieza(new THREE.BoxGeometry(w, h, d), hex, Object.assign({ x, y: y + h / 2, z, ao: .2, var: .08 }, o)), o && o.clase);
  const cy = (rt, rb, h, seg, hex, x, y, z, o) => A(pieza(new THREE.CylinderGeometry(rt, rb, h, seg), hex, Object.assign({ x, y: y + h / 2, z, var: .08 }, o)), o && o.clase, true);
  const glowBx = (w, h, d, hex, x, y, z) => Lz(pieza(new THREE.BoxGeometry(w, h, d), hex, { x, y: y + h / 2, z }));
  function techo(w, d, h, hex, x, y, z, o) { return A(Arquitectura.tejado(w, d, h, hex, x, y, z, o)); }
  const K = { bx, cy, glowBx: (...a) => glowBx(...a), techo: (...a) => techo(...a), A: (g, c, v) => A(g, c, v), Lz: g => Lz(g), sol, solC };
  /* punto (lx, lz) de una obra puesta en (x, z) con giro ry (como en fin) */
  const aMundo = (x, z, ry, lx, lz) => ({ x: x + lx * Math.cos(ry) + lz * Math.sin(ry), z: z - lx * Math.sin(ry) + lz * Math.cos(ry) });
  /* refugios (fase 20): sitios donde el haz de un Cazador del Ocaso no ve a Hikari (bajo un torii, junto a una casa) */
  const refugio = (x, z, r) => E.refugios.push({ x, z, r });
  function torii(x, z, ry, esc, hex) { ini(); Arquitectura.torii(K, esc, hex); fin(x, altura(x, z), z, ry); refugio(x, z, 2.2 * esc); }
  function torou(x, z, esc, brasa) { ini(); Arquitectura.toro(K, esc, brasa); fin(x, altura(x, z), z, 0); luzSuelo(x, z, esc); }
  const charcos = []; const luzSuelo = (x, z, k) => charcos.push({ x, z, y: altura(x, z), r: LUZ_SUELO.radio * (k || 1) });
  function casa(w, d, h, rot, x, z, y, muro, tej, o) { ini(); Arquitectura.casa(K, w, d, h, muro, tej, o); fin(x, y, z, rot); refugio(x, z, Math.max(w, d) / 2 + 1.2); const f = d / 2 + 1.4; luzSuelo(x + Math.sin(rot) * f, z + Math.cos(rot) * f, 1.15); }

  /* ---------- murales (Recuerdos) ----------
     capa oculta (rediseño, fase 19): con el farol de Tsuru, cada mural muestra otro dibujo en trazos de brasa. revela:
     distancias (m) a las que se ve entera y empieza a verse; color de los trazos, su intensidad (HDR: de día hace falta más), opacidad y color del halo que avisa */
  const MURAL_OCULTO = { revela: [3, 10], trazo: '#ff3010', intensidad: 1.8, opacidad: .95, aviso: 0xff8a4a };
  function texMural(k) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 400; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, '#2c2f4e'); g.addColorStop(1, '#171a30'); x.fillStyle = g; x.fillRect(0, 0, 512, 400);
    for (let i = 0; i < 1800; i++) { x.fillStyle = 'rgba(255,255,255,' + Math.random() * .035 + ')'; x.fillRect(Math.random() * 512, Math.random() * 400, 2, 2); }
    x.strokeStyle = '#e8c06a'; x.fillStyle = '#e8c06a'; x.lineWidth = 5; x.lineCap = 'round'; x.lineJoin = 'round'; x.shadowColor = '#ffcf6a'; x.shadowBlur = 10;
    const sol = (X, Y, r) => { x.beginPath(); x.arc(X, Y, r, 0, TAU); x.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.beginPath(); x.moveTo(X + Math.cos(a) * (r + 10), Y + Math.sin(a) * (r + 10)); x.lineTo(X + Math.cos(a) * (r + 30), Y + Math.sin(a) * (r + 30)); x.stroke(); } };
    const montes = () => { x.beginPath(); x.moveTo(30, 340); x.lineTo(150, 200); x.lineTo(210, 270); x.lineTo(310, 130); x.lineTo(420, 300); x.lineTo(482, 340); x.stroke(); };
    switch (k) {
      case 0: sol(256, 190, 48); x.beginPath(); x.moveTo(40, 280); x.lineTo(472, 280); x.stroke(); montes(); break;
      case 1: x.beginPath(); x.moveTo(256, 90); x.lineTo(256, 340); x.stroke(); for (let i = 0; i < 4; i++) { const y = 120 + i * 60, w = 90 - i * 14; x.beginPath(); x.moveTo(256 - w, y + 20); x.quadraticCurveTo(256, y - 20, 256 + w, y + 20); x.stroke(); } sol(256, 60, 22); break;
      case 2: for (let i = 0; i < 3; i++) { const X = 90 + i * 140; x.strokeRect(X, 230, 90, 80); x.beginPath(); x.moveTo(X - 14, 230); x.lineTo(X + 45, 180); x.lineTo(X + 104, 230); x.stroke(); } sol(420, 90, 30); break;
      case 3: for (let r = 0; r < 4; r++) { x.beginPath(); for (let i = 0; i <= 40; i++) { const X = 30 + i * 11.5, Y = 150 + r * 55 + Math.sin(i * .6 + r) * 14; i ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); } x.beginPath(); x.arc(256, 70, 22, 0, TAU); x.fill(); break;
      case 4: x.beginPath(); x.moveTo(256, 360); x.quadraticCurveTo(230, 260, 256, 190); x.stroke(); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; x.beginPath(); x.ellipse(256 + Math.cos(a) * 60, 150 + Math.sin(a) * 50, 28, 14, a, 0, TAU); x.stroke(); } break;
      case 5: x.beginPath(); x.moveTo(60, 350); x.lineTo(256, 70); x.lineTo(452, 350); x.stroke(); x.beginPath(); x.moveTo(210, 140); x.lineTo(240, 170); x.lineTo(256, 140); x.lineTo(280, 175); x.lineTo(310, 140); x.stroke(); x.beginPath(); x.moveTo(40, 120); x.quadraticCurveTo(120, 100, 200, 120); x.stroke(); break;
      case 6: for (let i = 0; i < 5; i++) x.strokeRect(120 + i * 22, 330 - i * 50, 272 - i * 44, 46); sol(420, 80, 28); break;
      case 7: x.beginPath(); x.arc(256, 130, 34, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(256, 164); x.lineTo(256, 250); x.moveTo(256, 190); x.quadraticCurveTo(190, 200, 150, 290); x.moveTo(256, 190); x.quadraticCurveTo(322, 200, 362, 290); x.stroke(); x.beginPath(); x.moveTo(256, 250); x.lineTo(226, 350); x.moveTo(256, 250); x.lineTo(286, 350); x.stroke(); for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(70 + i * 124, 60 + (i % 2) * 30, 8, 0, TAU); x.fill(); } break;
    }
    x.shadowBlur = 0; x.strokeStyle = '#e8c06a'; x.lineWidth = 4; x.strokeRect(10, 10, 492, 380);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
  }
  /* dibujo de la capa oculta (sobre fondo transparente; se suma a la luz del mural) */
  function texOculta(k) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 400; const x = c.getContext('2d');
    x.strokeStyle = x.fillStyle = MURAL_OCULTO.trazo; x.lineWidth = 4; x.lineCap = 'round'; x.lineJoin = 'round'; x.shadowColor = MURAL_OCULTO.trazo; x.shadowBlur = 12;
    const fig = (X, Y, s, brazos) => { x.beginPath(); x.arc(X, Y - 46 * s, 9 * s, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(X, Y - 37 * s); x.lineTo(X, Y - 14 * s); x.moveTo(X, Y - 14 * s); x.lineTo(X - 8 * s, Y); x.moveTo(X, Y - 14 * s); x.lineTo(X + 8 * s, Y);
      const b = brazos || 0; x.moveTo(X, Y - 30 * s); x.lineTo(X - 12 * s, Y - 22 * s - b * s); x.moveTo(X, Y - 30 * s); x.lineTo(X + 12 * s, Y - 22 * s - b * s); x.stroke(); };
    const escalera = (x0, y0, x1, y1, n) => { x.beginPath(); x.moveTo(x0, y0); for (let i = 0; i < n; i++) { const a = x0 + (x1 - x0) * i / n, b = y0 + (y1 - y0) * (i + 1) / n; x.lineTo(a, b); x.lineTo(x0 + (x1 - x0) * (i + 1) / n, b); } x.stroke(); };
    switch (k) {
      case 0: escalera(110, 360, 240, 210, 7); fig(236, 206, .7, 14); break;                                                              // un niño sube hacia el sol
      case 1: for (let i = 0; i < 4; i++) { fig(90 + i * 110, 370, 1); fig(112 + i * 110, 370, .6); } fig(256, 112, .6, 16); break;       // cuatro familias; uno sube
      case 2: for (let i = 0; i < 5; i++) { fig(60 + i * 44, 380, .8); x.beginPath(); x.arc(60 + i * 44, 335, 4, 0, TAU); x.fill(); } escalera(300, 380, 470, 230, 6); fig(452, 228, .6); break;   // cantan mientras sube
      case 3: fig(120, 120, 1.2); for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(108 + (i % 2) * 24, 150 + i * 30, 5, 0, TAU); x.fill(); } break;   // espera en la orilla; perlas que caen
      case 4: fig(200, 380, .8); fig(232, 380, .8); x.setLineDash([6, 10]); x.beginPath(); x.moveTo(250, 372); x.quadraticCurveTo(360, 360, 450, 250); x.stroke(); x.setLineDash([]); fig(452, 248, .6); break;   // dos hermanos; él se va
      case 5: escalera(330, 340, 450, 250, 5); fig(442, 246, .45); for (let i = 0; i < 3; i++) fig(150 + i * 26, 160, .55, 6); break;     // despedida desde la cumbre
      case 6: fig(150, 330, 1.1); x.beginPath(); x.moveTo(166, 290); x.lineTo(176, 360); x.stroke(); for (let i = 0; i < 4; i++) fig(200 + i * 40, 320 - i * 50, .6); break;   // un sabio con su bastón lleva niños arriba
      case 7: x.beginPath(); x.ellipse(256, 128, 30, 38, 0, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(236, 122); x.lineTo(250, 118); x.moveTo(262, 118); x.lineTo(276, 122); x.moveTo(256, 92); x.lineTo(256, 108); x.stroke(); break;   // la máscara, sobre el Eco
    }
    return new THREE.CanvasTexture(c);
  }
  function mural(k, x, z, ry) {
    const y = altura(x, z);
    ini(); bx(3.4, 3, .5, 0x6c6b6e, 0, 0, 0, { var: .2, ao: .3 }); bx(3.9, .5, .9, 0x58575a, 0, 0, 0, { var: .2 }); sol(0, 0, 1.95, .45, 0, .5, { fina: true }); sol(0, 0, 1.70, .25, .5, 3, { fina: true }); fin(x, y, z, ry);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.4), new THREE.MeshStandardMaterial({ map: texMural(k), emissiveMap: null, roughness: .8, emissive: 0x332a10, emissiveIntensity: .35 }));
    m.position.set(x + Math.sin(ry) * .27, y + 1.7, z + Math.cos(ry) * .27); m.rotation.y = ry; G.add(m);
    const brillo = new Halo(0xffd27a, .0);
    brillo.scale.set(5, 5, 1); brillo.position.set(m.position.x, m.position.y, m.position.z); G.add(brillo);
    const oculta = new THREE.Mesh(m.geometry, new THREE.MeshBasicMaterial({ map: texOculta(k), color: new THREE.Color().setScalar(MURAL_OCULTO.intensidad), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    oculta.position.copy(m.position).add(new THREE.Vector3(Math.sin(ry) * .012, 0, Math.cos(ry) * .012)); oculta.rotation.y = ry; oculta.visible = false; G.add(oculta);
    E.murales.push({ k, x, z, y: y + 1.5, ry, visto: false, brillo, oculta, revela: 0, titulo: GUION.murales[k][0], texto: GUION.murales[k][1], nom: 'Mural: ' + GUION.murales[k][0] });   // textos en GUION (26-guion.js)
    ZONAS_LIBRES.push({ x, z, r: 4 });
  }

  /* ---------- formaciones rocosas ---------- */
  function rocaGeo(g, hex, o) { return A(pieza(g, hex, Object.assign({ var: .2, ao: .35 }, o)), hex === 0xb4764e || hex === 0xbc7d56 || hex === 0xb5764f ? 'arenisca' : 'roca'); }
  function arco(x, z, ry, esc, hex) {
    ini(); const g = new THREE.TorusGeometry(6, 2.3, 9, 22, Math.PI); abollar(g, .16, .6, x * .1);
    rocaGeo(g, hex, { y: 0, sx: esc, sy: esc * 1.1, sz: esc * 1.3 });
    for (const s of [-1, 1]) { rocaGeo(abollar(icoSuave(3.2, 2), .2, .5, s + x), hex, { x: s * 6 * esc, y: .5, sx: esc * .85, sy: esc * 1.0, sz: esc * 1.2 }); solC(s * 6 * esc, 0, 3.3 * esc, -6, 12 * esc); }
    fin(x, altura(x, z) - .5, z, ry); ZONAS_LIBRES.push({ x, z, r: 12 * esc });
  }
  function hoodoos(x, z, n, hex, semilla) {
    const r = rng(semilla); ini(); let cy0 = altura(x, z);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU, d = 3 + r() * 14, h = 5 + r() * 12, w = 1.2 + r() * 1.6;
      const ox = Math.cos(a) * d, oz = Math.sin(a) * d, yy = altura(x + ox, z + oz) - cy0;
      const g = new THREE.CylinderGeometry(w * .8, w * 1.25, h, 9, 7); const p = g.attributes.position;
      for (let k = 0; k < p.count; k++) { const t = (p.getY(k) + h / 2) / h, s = 1 + .5 * Math.sin(t * 9 + i) * .3 + (t > .85 ? .75 * (t - .85) / .15 : 0); p.setX(k, p.getX(k) * s); p.setZ(k, p.getZ(k) * s); }
      abollar(g, .1, .8, i + semilla);
      rocaGeo(g, hex, { x: ox, y: yy + h / 2 - 1, z: oz, ry: r() * 3 }); solC(ox, oz, w * 1.15, yy - 3, yy + h);
    }
    fin(x, cy0, z, 0); ZONAS_LIBRES.push({ x, z, r: 20 });
  }
  function columnasBasalto(x, z, hex, semilla) {
    const r = rng(semilla); ini(); const c0 = altura(x, z);
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
      if (Math.hypot(i, j) > 3.2 || r() < .25) continue;
      const px = i * 1.9 + (j % 2) * .95, pz = j * 1.65, h = 1.5 + r() * 5 * (1 - Math.hypot(i, j) / 4.4);
      const yy = altura(x + px, z + pz) - c0;
      cy(1.05, 1.05, h + 3, 6, hex, px, yy - 3, pz, { var: .15, ry: r() }); solC(px, pz, 1, yy, yy + h);
    }
    fin(x, c0, z, 0); ZONAS_LIBRES.push({ x, z, r: 9 });
  }
  function circuloPiedras(x, z, n, r0, hex) {
    ini(); const c0 = altura(x, z);
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, px = Math.cos(a) * r0, pz = Math.sin(a) * r0, h = 3 + (i % 3) * .8, yy = altura(x + px, z + pz) - c0;
      rocaGeo(abollar(new THREE.BoxGeometry(1.3, h, .9, 2, 3, 2), .06, .8, i), hex, { x: px, y: yy + h / 2 - .3, z: pz, ry: -a, rz: (i % 2 ? .05 : -.04) }); solC(px, pz, .9, yy, yy + h);
    }
    cy(1.6, 1.8, .5, 8, 0x8a8a84, 0, 0, 0); fin(x, c0, z, 0); ZONAS_LIBRES.push({ x, z, r: r0 + 4 });
  }

  /* ---------- Faro del Alba ---------- */
  function construirFaro() {
    const S = sitio('faro'), y = S.h;
    ini();
    cy(22, 23.5, 1, 40, 0x8f8e88, 0, -.4, 0, { var: .16 }); cy(15, 15.6, .6, 36, 0xa9a8a1, 0, .55, 0, { var: .14 });
    for (let i = 0; i < 4; i++) cy(15 - i * .01, 15, .02, 4, 0x6b6a66, 0, 1.15, 0);
    // bancos de piedra en el anillo de la plaza, entre los faroles y fuera de los cuatro caminos a los santuarios
    for (const a of FARO.bancos) { const x = Math.cos(a) * 18.4, z = Math.sin(a) * 18.4, r = -a + Math.PI / 2; bx(2.6, .14, .7, 0x9a9992, x, .98, z, { ry: r, clase: 'piedra' }); for (const s of [-1, 1]) bx(.32, .42, .55, 0x84837d, x + Math.cos(r) * s * .95, .56, z - Math.sin(r) * s * .95, { ry: r, clase: 'piedra' }); sol(x, z, 1.3, .35, .56, 1.12, { ry: r }); }
    solC(0, 0, 22.4, -.4, .6); solC(0, 0, 15.4, .55, 1.15);
    // basamento de dos gradas con cornisa, escalinata en los cuatro lados y baranda arriba (con paso en cada escalinata)
    bx(14, 1.6, 14, 0x84837d, 0, 1.15, 0, { var: .14, clase: 'piedra' }); bx(14.5, .22, 14.5, 0x9a9992, 0, 2.53, 0, { clase: 'piedra' });
    bx(11.6, 1.4, 11.6, 0x908f89, 0, 2.75, 0, { clase: 'piedra' }); bx(12, .2, 12, 0x9a9992, 0, 3.95, 0, { clase: 'piedra' });
    sol(0, 0, 7, 7, 0, 2.75, { fina: true }); sol(0, 0, 5.8, 5.8, 2.75, 4.15, { fina: true });
    sol(0, 0, 7.25, 7.25, 2.53, 2.75, { fina: true }); sol(0, 0, 6, 6, 3.95, 4.15, { fina: true });
    for (let s = 0; s < 4; s++) Arquitectura.escalinata(K, s, 5.8, 1.15, 4.15, 3, 10, 0x8f8e88);
    Arquitectura.barandal(K, 11.5, 11.5, 4.15, FARO.rojo, { hueco: 3.4 });
    // cuatro pisos: tres cerrados (puertas en los cuatro lados del primero, ventanas en los demás) y el último abierto,
    // donde flota el corazón; ménsulas bajo cada alero y el sōrin dorado en la cumbre
    let yy = 4.1;
    FARO.niveles.forEach((n, k) => {
      const ultimo = k === FARO.niveles.length - 1;
      if (!ultimo) { Arquitectura.muro(K, n.w, n.w, n.h, { y: yy, poste: FARO.rojo, puertas: k === 0 ? [0, 1, 2, 3] : [], luz: 0xffe2a8, muro: 0xf2eadb }); sol(0, 0, n.w / 2 + .17, n.w / 2 + .17, yy, yy + n.h, { fina: true }); }
      else { bx(n.w, .4, n.w, 0xeee4d0, 0, yy, 0, { clase: 'piedra' }); Arquitectura.barandilla(K, n.w + .2, yy + .4, FARO.rojo); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { cy(.24, .24, n.h, 10, FARO.rojo, sx * (n.w / 2), yy, sz * (n.w / 2)); solC(sx * 2.4, sz * 2.4, .24, 17.7, 21.3, { fina: true }); } }
      Arquitectura.mensulas(K, n.w, n.w, yy + n.h - .75, ultimo ? 1 : 3, FARO.rojo, .82);
      bx(n.w + .6, .3, n.w + .6, 0x3b2a22, 0, yy + n.h, 0, { clase: 'madera' }); sol(0, 0, (n.w + .6) / 2, (n.w + .6) / 2, yy + n.h, yy + n.h + .3, { fina: true });
      techo(n.w + 5.2 - k * .3, n.w + 5.2 - k * .3, 2.5, k % 2 ? 0x3a4f6e : 0x2f3552, 0, yy + n.h + .1, 0);
      yy += n.h + .3;
    });
    Arquitectura.sorin(K, 1, yy + 2);
    fin(0, y, 0, 0); E.altoFaro = yy + 3; E.yFaro = y; E.cimaFaro = yy + 2 + 6.9;   // cima: punta del sōrin (sobre y)
    // corazón de cristal en el último nivel (emisivo)
    const cor = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 1), new THREE.MeshBasicMaterial({ color: 0x555a78, fog: false }));
    cor.scale.set(.8, 1.4, .8); cor.position.set(0, y + yy - 1.6, 0); G.add(cor); E.corazon = cor;
    E.corazonLuz = new Halo(0xfff0c0, .0);
    E.corazonLuz.scale.set(26, 26, 1); E.corazonLuz.position.copy(cor.position); G.add(E.corazonLuz);
    // pedestales de fragmentos hacia cada santuario
    const dest = [sitio('petalo'), sitio('duna'), { x: -246, z: 232 }, sitio('escarcha')];
    dest.forEach((d, i) => {
      const a = Math.atan2(d.z, d.x), px = Math.cos(a) * 10.5, pz = Math.sin(a) * 10.5;
      ini(); Arquitectura.altar(K, 0x8e8d86, 1.5, 1.1); fin(px, y + 1.15, pz, 0);
      const f = new THREE.Mesh(new THREE.OctahedronGeometry(.55, 0), new THREE.MeshBasicMaterial({ color: 0x4b4f66, fog: false }));
      f.position.set(px, y + 3.1, pz); G.add(f);
      const hz = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, 1, 8, 1, true), new THREE.MeshBasicMaterial({ color: COL_FRAG[i], transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      const alto = cor.position.y - (y + 3.1); hz.scale.set(1, alto, 1); hz.position.set(px / 2, y + 3.1 + alto / 2, pz / 2); hz.rotation.set(0, 0, 0);
      // el haz va del pedestal al corazón: cilindro inclinado
      const v = new THREE.Vector3(-px, alto, -pz), L = v.length(); hz.scale.set(1, L, 1); hz.position.set(px / 2, y + 3.1 + alto / 2, pz / 2);
      hz.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); G.add(hz);
      E.pedestales.push({ i, x: px, z: pz, y: y + 3.1, mesh: f, haz: hz, activo: false });
      torii(Math.cos(a) * 29, Math.sin(a) * 29, -a + Math.PI / 2, 1.5, 0xb7332d);
    });
    for (const a of FARO.faroles) torou(Math.cos(a) * 20, Math.sin(a) * 20, 1.4);
    // espiral final de plataformas (aparece al restaurar los cuatro fragmentos)
    // 13 plataformas en espiral que se cierran hacia el último piso (cada escalón sube 1.32 m: se salta con Espacio)
    { let a = Math.PI / 2 + .3;
      for (let k = 0; k < 13; k++) {
        const r = 14 - k * .48, top = y + 2.3 + k * 1.32, py = top - .2;
        // plataforma de luz: hexágono que se estrecha hacia abajo (malla y material compartidos) con un halo cálido debajo
        if (!E.espGeo) { E.espGeo = new THREE.CylinderGeometry(1.7, 1.15, .36, 6); E.espMat = new THREE.MeshBasicMaterial({ color: 0xffe3a6, transparent: true, opacity: 0, fog: false, depthWrite: false }); }
        const m = new THREE.Mesh(E.espGeo, E.espMat); m.rotation.y = a;
        m.position.set(Math.cos(a) * r, py, Math.sin(a) * r); m.visible = false; G.add(m);
        const hl = new Halo(0xffd890, 0); hl.scale.set(5.5, 5.5, 1); hl.position.y = -.25; m.add(hl);
        const c = Sol.add(m.position.x, m.position.z, 1.45, 1.45, 0, py - .4, py + .2); c.on = false;
        E.espiral.push({ m, c, hl, x: m.position.x, y: py + .2, z: m.position.z });
        a += 5.7 / r;
      } }
    E.corona = { x: 0, y: y + yy - 1, z: 0 };
    Sol.add(0, 0, 2.4, 2.4, 0, y + 17.5, y + 18.1);
    ZONAS_LIBRES.push({ x: 0, z: 0, r: 50, rHierba: 24 });   // sin árboles junto al faro; la hierba llega hasta la plaza
  }

  function aldea() {
    const S = sitio('aldea'), y = S.h;
    const casas = [[-14, -12, 8, 6, .2], [12, -14, 9, 6.5, -.3], [-20, 6, 7, 6, 1.5], [20, 4, 8, 6, -1.4], [-8, 18, 9, 6, 3.3], [10, 19, 8, 6, 3.1]];
    casas.forEach((c, i) => casa(c[2], c[3], 3.6, c[4], S.x + c[0], S.z + c[1], y, i % 2 ? 0xe9dec6 : 0xdccfb3, i % 3 === 0 ? 0x2f3552 : i % 3 === 1 ? 0x4a3f55 : 0x3a4f5e, { irimoya: i % 2 === 1, noren: [0x2f3f6e, 0x8a2e2a, 0x3d5a3a][i % 3] }));
    ini(); cy(1.5, 1.7, 1.1, 14, 0x8a8a84, 0, 0, 0); cy(1.2, 1.2, .1, 14, 0x1b3a4a, 0, 1, 0); for (const s of [-1, 1]) { cy(.1, .1, 2.2, 6, 0x5a3b26, s * 1.4, 1, 0); solC(s * 1.4, 0, .10, 1, 3.2, { fina: true }); } bx(3.2, .15, .3, 0x5a3b26, 0, 3.1, 0); solC(0, 0, 1.7, 0, 1.2, { fina: true }); sol(0, 0, 1.6, .15, 3.1, 3.25, { fina: true }); fin(S.x, y, S.z, 0);
    torou(S.x + 4, S.z - 5, 1.2, 0xffc977); torou(S.x - 6, S.z + 8, 1.2, 0xffc977); torou(S.x + 14, S.z - 4, 1.2, 0xffc977);
    for (let i = 0; i < 3; i++) { ini(); for (const s of [-1, 1]) { cy(.1, .1, 2.4, 6, 0x5a3b26, s * 1.4, 0, 0); solC(s * 1.4, 0, .15, 0, 2.4, { fina: true }); } bx(3, .1, .1, 0x5a3b26, 0, 2.2, 0); for (let k = 0; k < 4; k++) bx(.2, 1.1, .05, pick([0xe9dfc9, 0xc96a55, 0x6b86a8]), -1.1 + k * .72, 1.1, 0); fin(S.x - 24 + i * 5, y, S.z - 22, 0); }
    // guirnaldas de farolillos de alero a alero sobre la plaza
    for (const [a0, a1] of [[[-9.5, -10], [8, -12]], [[-4, 15.5], [6, 16.5]]]) { ini(); Arquitectura.guirnalda(K, a0[0], 4.3, a0[1], a1[0], 4.3, a1[1], 6, .55); fin(S.x, y, S.z, 0); }
    // alrededores: huertos con valla (sin hierba encima) y un santuario de camino junto a la entrada desde el faro
    for (const [hx, hz, w, d, ry] of ALDEA.huertos) { const x = S.x + hx, z = S.z + hz; ini(); Arquitectura.huerto(K, w, d, hx * 7 + hz); fin(x, altura(x, z), z, ry); ZONAS_LIBRES.push({ x, z, r: Math.hypot(w, d) / 2 + 1.5 }); }
    { const [hx, hz, ry] = ALDEA.hokora, x = S.x + hx, z = S.z + hz; ini(); Arquitectura.hokora(K); fin(x, altura(x, z), z, ry); ZONAS_LIBRES.push({ x, z, r: 2 }); luzSuelo(x + Math.sin(ry) * 1.2, z + Math.cos(ry) * 1.2, .6); }
    // torii de la entrada, cruzando el camino del faro (en la Noche Roja, Tasogare aparece encima)
    { const c = CAMINOS[0], T = ALDEA.torii, d = q => Math.hypot(q[0] - S.x, q[1] - S.z); let k = c.length - 1; while (k > 0 && d(c[k]) < T.dist) k--;
      const a = c[k], b = c[Math.min(k + 1, c.length - 1)]; let t0 = 0, t1 = 1; for (let i = 0; i < 12; i++) { const t = (t0 + t1) / 2; if (d([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]) > T.dist) t0 = t; else t1 = t; }
      const x = lerp(a[0], b[0], t0), z = lerp(a[1], b[1], t0), ry = Math.atan2(b[0] - a[0], b[1] - a[1]);
      torii(x, z, ry, T.esc, 0xb7332d); ZONAS_LIBRES.push({ x, z, r: 4 }); E.toriiHinode = { x, z, y: altura(x, z), ry, alto: (4.6 + .13) * T.esc }; }
    // torii del camino: refugios contra el ojo del Cazador en el tramo abierto de la Pradera
    { const c = CAMINOS[0], L = [0]; for (let i = 1; i < c.length; i++) L.push(L[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
      for (const t of ALDEA.toriiCamino.t) { const l = t * L[L.length - 1]; let k = 0; while (k < c.length - 2 && L[k + 1] < l) k++;
        const a = c[k], b = c[k + 1], u = (l - L[k]) / (L[k + 1] - L[k]), x = lerp(a[0], b[0], u), z = lerp(a[1], b[1], u);
        torii(x, z, Math.atan2(b[0] - a[0], b[1] - a[1]), ALDEA.toriiCamino.esc, 0xb7332d); ZONAS_LIBRES.push({ x, z, r: 3.5 }); } }
    E.npcs.tsuru = { x: S.x + 6, z: S.z + 6, y }; E.npcs.momo = { x: S.x - 3, z: S.z - 4, y }; E.npcs.yuki = { x: S.x + 16, z: S.z - 8, y };
  }
  function mirador() {
    const S = sitio('mirador'), M = MIRADOR, t = M.terraza, al = Math.atan2(-S.x, -S.z);   // al: hacia el faro
    const y = S.h + t;
    // la ruina es una sola obra girada hacia el faro: +z mira al faro
    ini();
    cy(8.2, 8.6, t + .5, 8, 0x8a8a84, 0, -.5, 0, { clase: 'piedra', var: .18 }); cy(7.9, 7.9, .08, 8, 0x9a9992, 0, t - .02, 0, { clase: 'piedra' }); solC(0, 0, 8.2, -.5, t);
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU + Math.PI / 8, h = M.columnas[i];
      if (!h) continue;
      const x = Math.cos(a) * 6.3, z = Math.sin(a) * 6.3;
      cy(.62, .7, .3, 8, 0x84837d, x, t, z, { clase: 'tallada' }); cy(.5, .56, h, 9, 0x9a9a92, x, t + .3, z, { clase: 'tallada', var: .2 }); solC(x, z, .65, t, t + .3 + h);
      if (h > 2.6) cy(.66, .58, .3, 8, 0x8e8d86, x, t + .3 + h, z, { clase: 'tallada' });
    }
    bx(5, .55, 5, 0x8a8a84, 0, t, 0, { var: .15, clase: 'piedra' }); sol(0, 0, 2.5, 2.5, t, t + .55);
    A(pieza(abollar(icoSuave(1.1, 2), .2, 1, 3), 0x6e6d70, { y: t + .55 + .55, sx: 1.2, sy: .8, var: .15, ao: .3 }), 'roca');
    // muro caído a espaldas del faro (sillares de alturas distintas) y bloques sueltos
    for (let k = 0; k < 7; k++) { const a = Math.PI + (k - 3) * .19, h = M.muro[k]; bx(1.9, h, .7, 0x8f8e88, Math.sin(a) * 9.3, -.2, Math.cos(a) * 9.3, { ry: a, clase: 'piedra', var: .2 }); sol(Math.sin(a) * 9.3, Math.cos(a) * 9.3, .95, .35, -.2, h - .2, { ry: a, fina: true }); }
    for (const [x, z, s] of [[-5.5, -10.5, .8], [4.8, -11, .6], [10.4, -3.5, .7]]) A(pieza(new THREE.BoxGeometry(1.1 * s, .7 * s, .8 * s), 0x8f8e88, { x, y: .25 * s, z, ry: x, rz: .25, var: .2, ao: .3 }), 'piedra');
    // columna tumbada, partida en dos
    cy(.5, .5, 3.2, 9, 0x9a9a92, -10.5, -1.1, 2.5, { rz: Math.PI / 2, ry: .4, clase: 'tallada', var: .2 }); cy(.5, .52, 1.6, 9, 0x9a9a92, -10.2, -.3, 5.3, { rx: Math.PI / 2 - .2, ry: 1.2, clase: 'tallada', var: .2 });
    solC(-10.5, 2.5, 1, 0, 1); solC(-10.2, 5.3, .8, 0, 1);
    // banco de piedra mirando al faro y al valle (el farol que sigue en pie va aparte, en el suelo)
    bx(2.6, .14, .7, 0x9a9992, 3.6, .45, 10.6, { clase: 'piedra' }); for (const s of [-1, 1]) bx(.32, .42, .55, 0x84837d, 3.6 + s * .95, .03, 10.6, { clase: 'piedra' }); sol(3.6, 10.6, 1.3, .35, 0, .59);
    fin(S.x, S.h, S.z, al);
    { const ox = S.x + Math.sin(al) * 9.5 - Math.cos(al) * 3.2, oz = S.z + Math.cos(al) * 9.5 + Math.sin(al) * 3.2; ini(); Arquitectura.toro(K, 1.1, 0xffc977); fin(ox, altura(ox, oz), oz, 0); luzSuelo(ox, oz, .9); }
    ZONAS_LIBRES.push({ x: S.x, z: S.z, r: 14, rHierba: 9 });
    const kt = new THREE.Group();
    kt.add(new THREE.Mesh(new THREE.BoxGeometry(.06, 1.6, .02), new THREE.MeshStandardMaterial({ color: 0xdde6ee, metalness: .8, roughness: .25, emissive: 0x5ff2e0, emissiveIntensity: .5 })));
    const tsuka = new THREE.Mesh(new THREE.BoxGeometry(.09, .5, .06), new THREE.MeshStandardMaterial({ color: 0x1d1d3a })); tsuka.position.y = -1.05; kt.add(tsuka);
    const tsuba = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, .03, 12), new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: .6, roughness: .3 })); tsuba.position.y = -.82; kt.add(tsuba);
    kt.position.set(S.x, y + 2.25, S.z); G.add(kt);
    const hl = new Halo(0x9ffff0, .7); hl.scale.set(5, 5, 1); hl.position.set(S.x, y + 2.4, S.z); G.add(hl);
    E.katana = { x: S.x, z: S.z, y: y + 1.6, mesh: kt, halo: hl, tomada: false };
    E.npcs.taiyo = { x: S.x + 4.5, z: S.z - 2, y };
  }
  function muelle() {
    // sale de la orilla hacia el agua abierta: la dirección con la orilla cerca y más agua seguida después
    const S = sitio('muelle'), y0 = NIVEL_AGUA + 1.2; let mejor = null;
    for (let a = 0; a < TAU; a += TAU / 90) {
      const ux = Math.sin(a), uz = Math.cos(a); let ori = -1;
      for (let d = 0; d < 40; d += .5) if (altura(S.x + ux * d, S.z + uz * d) < y0 - .15) { ori = d; break; }
      if (ori < 0) continue; let agua = 0; for (let d = ori + 3; d < ori + 45; d += 1.5) if (altura(S.x + ux * d, S.z + uz * d) < NIVEL_AGUA - .5) agua++;
      const nota = agua - ori * .4; if (!mejor || nota > mejor.nota) mejor = { a, ori, nota };
    }
    const ang = mejor.a, x0 = S.x + Math.sin(ang) * mejor.ori, z0 = S.z + Math.cos(ang) * mejor.ori; ini();
    for (let i = 0; i < 14; i++) { bx(2.4, .25, 3, 0x7a5a3e, 0, -.2, i * 3, { var: .15 }); sol(0, i * 3, 1.2, 1.5, -.20, .05); if (i % 3 === 0) for (const s of [-1, 1]) { cy(.14, .14, 5, 6, 0x5a3b26, s * 1.1, -4.8, i * 3); solC(s * 1.1, i * 3, .14, -4.8, .20, { fina: true }); } }
    fin(x0, y0, z0, ang);
    E.npcs.kaito = { x: x0 + Math.sin(ang) * 36, z: z0 + Math.cos(ang) * 36, y: y0 + .05 };
    E.muelleFin = { x: E.npcs.kaito.x, z: E.npcs.kaito.z, y: y0 + .05 };
    E.muelleAng = ang; E.muelleEco = { x: x0 + Math.sin(ang) * 24, z: z0 + Math.cos(ang) * 24, y: y0 + .05 };   // el eco del pescador, a mitad del muelle
    E.muelleSonido = { x: x0, z: z0, y: y0 + .05, ang, largo: 42, ancho: 2.4 }; // superficie de tablas para los pasos
    // la vida del muelle: barca amarrada, postes con cuerda, farol al final, y en tierra el cobertizo, la red y la carga
    const M = (lx, lz) => ({ x: x0 + lx * Math.cos(ang) + lz * Math.sin(ang), z: z0 - lx * Math.sin(ang) + lz * Math.cos(ang) });
    const tierra = (lx, lz) => { for (let k = 0; k < 8; k++) { const p = M(lx, lz - k * 2); if (altura(p.x, p.z) > .5) return p; } return M(lx, lz); };
    let p = M(2.6, 31); ini(); Arquitectura.barca(K, 1); fin(p.x, NIVEL_AGUA - .12, p.z, ang + .08);
    for (const [lx, lz] of [[1.05, 28.5], [-1.05, 34.5], [1.05, 38.5]]) { p = M(lx, lz); ini(); Arquitectura.amarre(K, 1); fin(p.x, y0 + .05, p.z, 0); }
    p = M(-.8, 40.8); ini(); Arquitectura.toro(K, .75); fin(p.x, y0 + .05, p.z, 0);
    p = tierra(-4.5, -3); ini(); Arquitectura.cobertizo(K); fin(p.x, altura(p.x, p.z), p.z, ang);
    p = tierra(-9, -2); ini(); Arquitectura.red(K); fin(p.x, altura(p.x, p.z), p.z, ang + 1.3);
    p = tierra(2.8, -2); ini(); Arquitectura.carga(K); fin(p.x, altura(p.x, p.z), p.z, ang - .4);
  }

  /* ---------- construcción principal ---------- */
  function init() {
    matE = Arquitectura.material();
    matL = new THREE.MeshBasicMaterial({ vertexColors: true, fog: true });
    scene.add(G);
    construirFaro(); aldea(); mirador(); muelle();
    // santuarios, pirámides, oasis y cima de Kiri (33-santuarios.js): reciben las utilidades de obra de aquí
    Santuarios.crear({ G, E, ini, fin, A, Lz, bx, cy, glowBx, techo, sol, solC, K, aMundo, torii, torou, rocaGeo });
    arco(-70, -135, .4, 1.3, 0x8f8a84); arco(140, 30, 2.2, 1.1, 0x9a948c); arco(214, 150, 1.0, 1.6, 0xb5764f); arco(-190, -160, -.6, 1.2, 0x8a8782); arco(40, -300, .1, 1.5, 0x8a8f9a);
    hoodoos(330, 180, 9, 0xb4764e, 11); hoodoos(300, 262, 7, 0xbc7d56, 23); hoodoos(160, 205, 5, 0xb4764e, 41);
    columnasBasalto(-190, 150, 0x5a5b62, 5); columnasBasalto(230, -170, 0x6a707c, 8); columnasBasalto(-60, 250, 0x5a5b62, 14);
    circuloPiedras(115, -75, 9, 9, 0x8f8e88); circuloPiedras(-170, -95, 7, 7, 0x8a8a84);
    const M = [[0, 26, -34, 0], [1, -22, 30, 3.14], [2, -112, 86, 2.1], [3, -200, 200, .8], [4, -240, -178, .4], [5, 296, -196, -1.2], [6, 252, 268, 3.4], [7, 88, 56, 3.5]];
    for (const m of M) {
      let [k, x, z, ry] = m; if (k === 7) { x = 90; z = 100; } mural(k, x, z, ry);
    }
    Cuevas.crear(G, E);   // interiores de las cuevas (32-cuevas.js)
    E.menudos = []; E.zonasObra = 0;
    for (const Z of GA.values()) {
      if (Z.grande.length) { const a = new THREE.Mesh(Arquitectura.fusionar(Z.grande), matE); a.castShadow = true; a.receiveShadow = true; a.layers.set(CAPAS.estatica); G.add(a); E.zonasObra++; }
      if (Z.menudo.length) { const a = new THREE.Mesh(Arquitectura.fusionar(Z.menudo), matE); a.receiveShadow = true; G.add(a); E.menudos.push(a); }
    }
    if (GL.length) { const l = new THREE.Mesh(fusionar(GL), matL); G.add(l); E.luzMesh = l; }
    crearCharcos();
  }
  /* charcos de luz: un cuadro horizontal por farol con un degradado radial, aditivo y sin escribir profundidad */
  function crearCharcos() {
    if (!charcos.length) return;
    const m = new THREE.MeshBasicMaterial({ map: TEX.halo, color: LUZ_SUELO.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    m.onBeforeCompile = sh => { Atmosfera.inyectar(sh); sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uPenumbra;').replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb *= uPenumbra*' + LUZ_SUELO.fuerza.toFixed(2) + ';'); };
    m.customProgramCacheKey = () => 'charcos';
    const g = new THREE.PlaneGeometry(2, 2); g.rotateX(-Math.PI / 2);
    const im = new THREE.InstancedMesh(g, m, charcos.length), mm = new THREE.Matrix4();
    charcos.forEach((c, i) => { mm.makeScale(c.r, 1, c.r); mm.setPosition(c.x, c.y + .06, c.z); im.setMatrixAt(i, mm); });
    im.renderOrder = 2; G.add(im); E.charcos = im;
  }
  /* cada fotograma: piezas lejanas, luz de las cuevas, corazón del faro, murales y katana */
  function actualizar(dt, t, px, py, pz, interior) {
    for (const f of E.tickers) f(t);
    // las piezas menudas de las zonas lejanas (desde la cámara: también en cinemáticas y portada) no se dibujan
    const cp = camera.position; for (const m of E.menudos) { const b = m.geometry.boundingSphere; m.visible = cp.distanceTo(b.center) - b.radius < OBRA_ZONAS.verMenudos; }
    Cuevas.actualizar(dt, px, pz, interior);
    if (E.corazon) { const k = 1 + .08 * Math.sin(t * 2); E.corazon.rotation.y = t * .4; E.corazonLuz.scale.setScalar(26 * k * (.4 + .6 * clamp(E.brillo || 0, 0, 1))); }
    // murales: brillo dorado si no se han leído; con el farol, brillo de brasa si falta su capa oculta, que se ve al acercarse
    const MO = MURAL_OCULTO, farol = Sis.tiene('farol') > 0, ocultos = Sis.ST.ocultos || {};
    for (const m of E.murales) {
      const avisa = farol && m.visto && !ocultos[m.k]; m.brillo.color.setHex(avisa ? MO.aviso : 0xffd27a);
      m.brillo.opacidad = damp(m.brillo.opacidad, !m.visto || avisa ? .5 + .25 * Math.sin(t * 2 + m.k) : 0, 3, dt);
      m.revela = damp(m.revela, farol ? smooth(MO.revela[1], MO.revela[0], Math.hypot(px - m.x, pz - m.z)) : 0, 2.5, dt);
      m.oculta.visible = m.revela > .01; m.oculta.material.opacity = m.revela * MO.opacidad * (.85 + .15 * Math.sin(t * 7 + m.k * 2));
    }
    if (E.katana && !E.katana.tomada) { E.katana.mesh.rotation.y = t * .6; E.katana.halo.opacidad = .5 + .25 * Math.sin(t * 2.4); }
  }
  /* --- activaciones de historia --- */
  E.encenderFragmento = function (i, activo) {
    const p = E.pedestales[i]; if (!p) return; p.activo = activo;
    p.mesh.material.color.setHex(activo ? COL_FRAG[i] : 0x4b4f66); p.haz.material.opacity = activo ? .55 : 0;
    E.refrescarCorazon();
  };
  /* brillo y color del corazón del faro según los fragmentos devueltos (las cinemáticas lo cambian y lo restauran con esto) */
  E.refrescarCorazon = function () {
    E.brillo = (E.pedestales.filter(q => q.activo).length) / 4; E.corazonLuz.opacidad = E.brillo >= 1 ? .5 : 0;   // con los cuatro, el corazón brilla
    E.corazon.material.color.setHex(E.brillo >= 1 ? 0xfff2c8 : E.brillo > 0 ? 0xc8d4ff : 0x555a78);
  };
  /* pedestal vacío: el fragmento robado por Tasogare no está (ni apagado ni encendido) */
  /* ¿(x, z) está en un refugio (bajo un torii, junto a una casa)? */
  E.enRefugio = (x, z) => E.refugios.some(r => Math.hypot(x - r.x, z - r.z) < r.r);
  E.vaciarPedestal = function (i, v) { const p = E.pedestales[i]; if (p) p.mesh.visible = !v; };
  E.mostrarEspiral = function (v) { for (const s of E.espiral) { s.m.visible = v; s.c.on = v; } };
  /* la espiral en sombra (fase 2 del duelo): E.luzEspiral[k] es la luz de cada plataforma (0…1); sin luz apenas se ve y
     no se pisa. Con null, todas encendidas (cada una pasa a tener su material mientras dura) */
  E.luzEspiral = null;
  E.animarEspiral = function (t) {
    if (E.espMat) E.espMat.opacity = damp(E.espMat.opacity, ESPIRAL.opacidad, 2, .016);
    const L = E.luzEspiral;
    E.espiral.forEach((s, k) => {
      if (L && !s.mat) { s.mat = E.espMat.clone(); s.m.material = s.mat; } else if (!L && s.mat) { s.m.material = E.espMat; s.mat.dispose(); s.mat = null; }
      if (!s.m.visible) return;
      const l = L ? L[k] : 1; if (L) { s.mat.opacity = lerp(ESPIRAL.sombra, ESPIRAL.opacidad, l); s.c.on = l > ESPIRAL.pisa; }
      s.hl.opacidad = (L ? s.mat.opacity * l : E.espMat.opacity) * ESPIRAL.halo * (.8 + .2 * Math.sin(t * 2 + s.x)); s.m.position.y = s.y - .2 + Math.sin(t * 1.4 + s.x) * .05;
    });
  };
  return Object.assign(E, { init, actualizar });
})();
