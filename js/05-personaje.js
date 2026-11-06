/* === Ecos de Luz · 05-personaje.js ===
   Efectos de partículas y números, tela simulada (capa y cintas de Hikari, que vive en
   17-hikari.js) y Lumi (hada guía). Los habitantes (NPC) están en 25-gente.js. */
"use strict";

/* ---------- efectos: chispas, humo y números ----------
   Dos grupos de partículas con el mismo programa: chispas (suman luz) y humo (oscurece: mezcla normal, sin caer y
   creciendo con la vida; lo usa la oscuridad del prólogo) */
const FX = (() => {
  const nums = []; let C, Hm;
  const VS = 'attribute vec4 aC; attribute float aS; varying vec4 vC; void main(){ vC=aC; vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=aS*520./max(-mv.z,.5); }';
  const FS = 'varying vec4 vC; void main(){ vec2 c=gl_PointCoord-.5; float d=length(c); float a=smoothstep(.5,.0,d); if(a<.01) discard; gl_FragColor=vec4(vC.rgb*(1.+a), vC.a*a); }';
  /* grupo de N partículas: luz (aditiva, cae un poco) o humo (normal, sube y crece) */
  function grupo(N, humo) {
    const g = new THREE.BufferGeometry(), P = { N, i0: 0, humo, pos: new Float32Array(N * 3), col: new Float32Array(N * 4), alfa0: new Float32Array(N), tam: new Float32Array(N), tam0: new Float32Array(N), vel: new Float32Array(N * 3), vida: new Float32Array(N), vmax: new Float32Array(N) };
    for (let i = 0; i < N; i++) P.pos[i * 3 + 1] = -999;
    g.setAttribute('position', new THREE.BufferAttribute(P.pos, 3)); g.setAttribute('aC', new THREE.BufferAttribute(P.col, 4)); g.setAttribute('aS', new THREE.BufferAttribute(P.tam, 1));
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: humo ? THREE.NormalBlending : THREE.AdditiveBlending, vertexShader: VS, fragmentShader: FS });
    P.pts = new THREE.Points(g, m); P.pts.frustumCulled = false; P.pts.renderOrder = humo ? 4 : 5; scene.add(P.pts);
    return P;
  }
  function init() {
    C = grupo(360, false); Hm = grupo(420, true);
    // cada número tiene su lienzo y su textura desde el principio: se redibuja, sin crear texturas a cada golpe
    for (let i = 0; i < 10; i++) {
      const c = document.createElement('canvas'); c.width = 128; c.height = 64; const tex = new THREE.CanvasTexture(c);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, fog: false })); s.visible = false; s.renderOrder = 20; scene.add(s); nums.push({ s, t: 0, x: 0, y: 0, z: 0, c, tex });
    }
  }
  function poner(P, x, y, z, vx, vy, vz, vidaS, tamano, hex, alfa, brillo) {
    const i = P.i0; P.i0 = (P.i0 + 1) % P.N; const c = lin(hex || 0xffffff);
    P.pos[i * 3] = x; P.pos[i * 3 + 1] = y; P.pos[i * 3 + 2] = z; P.vel[i * 3] = vx; P.vel[i * 3 + 1] = vy; P.vel[i * 3 + 2] = vz;
    P.vida[i] = P.vmax[i] = vidaS; P.tam[i] = P.tam0[i] = tamano; P.col[i * 4] = c.r * brillo; P.col[i * 4 + 1] = c.g * brillo; P.col[i * 4 + 2] = c.b * brillo; P.col[i * 4 + 3] = P.alfa0[i] = alfa === undefined ? 1 : alfa;
  }
  function emit(x, y, z, vx, vy, vz, vidaS, tamano, hex, alfa) { poner(C, x, y, z, vx, vy, vz, vidaS, tamano, hex, alfa, 2); }
  function humo(x, y, z, vx, vy, vz, vidaS, tamano, hex, alfa) { poner(Hm, x, y, z, vx, vy, vz, vidaS, tamano, hex, alfa, .5); }
  function rafaga(x, y, z, n, vel0, vidaS, tamano, hex, arriba) { for (let k = 0; k < n; k++) { const a = Math.random() * TAU, b = (Math.random() - .3) * Math.PI, s = vel0 * (.4 + Math.random() * .6); emit(x, y, z, Math.cos(a) * Math.cos(b) * s, Math.sin(b) * s + (arriba || 0), Math.sin(a) * Math.cos(b) * s, vidaS * (.6 + Math.random() * .6), tamano, hex); } }
  /* números que salen casi en el mismo sitio a la vez (golpes seguidos): se escalonan hacia arriba y a los lados de la
     pantalla en vez de apilarse (cerca, m; recientes: les queda más de 'reciente' de vida; escalón y lado, m) */
  const NUMEROS = { cerca: 1.2, reciente: .55, escalon: .4, lado: .35 }, _der = new THREE.Vector3();
  function numero(txt, x, y, z, color) {
    const n = nums.find(q => !q.s.visible) || nums[0];
    let k = 0; for (const q of nums) if (q !== n && q.s.visible && q.t > NUMEROS.reciente && Math.hypot(q.x0 - x, q.z0 - z) < NUMEROS.cerca) k++;
    const g = n.c.getContext('2d'); g.clearRect(0, 0, 128, 64);
    g.font = '700 40px "Zen Maru Gothic", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = 'rgba(10,10,30,.9)'; g.strokeText(txt, 64, 32); g.fillStyle = color || '#fff'; g.fillText(txt, 64, 32);
    n.tex.needsUpdate = true;
    const lado = k ? (k % 2 ? 1 : -1) * NUMEROS.lado : 0; _der.setFromMatrixColumn(camera.matrixWorld, 0);
    n.x0 = x; n.z0 = z; n.x = x + _der.x * lado; n.y = y + k * NUMEROS.escalon; n.z = z + _der.z * lado;
    n.s.scale.set(1.3, .65, 1); n.t = 1; n.s.visible = true; n.s.position.set(n.x, n.y, n.z);
  }
  function mover(P, dt) {
    let vivas = 0;
    for (let i = 0; i < P.N; i++) {
      if (P.vida[i] <= 0) { P.col[i * 4 + 3] = 0; continue; }
      vivas++; P.vida[i] -= dt; const k = Math.max(P.vida[i] / P.vmax[i], 0);
      if (!P.humo) P.vel[i * 3 + 1] -= .6 * dt; else { P.vel[i * 3] *= 1 - .4 * dt; P.vel[i * 3 + 2] *= 1 - .4 * dt; P.tam[i] = P.tam0[i] * (1 + (1 - k) * 1.6); }
      P.pos[i * 3] += P.vel[i * 3] * dt; P.pos[i * 3 + 1] += P.vel[i * 3 + 1] * dt; P.pos[i * 3 + 2] += P.vel[i * 3 + 2] * dt;
      P.col[i * 4 + 3] = P.alfa0[i] * (P.humo ? Math.min(1, k * 2.5, (1 - k) * 6) : Math.min(1, k * 2.2)); if (P.vida[i] <= 0) P.pos[i * 3 + 1] = -999;
    }
    if (!vivas && !P.sucio) return; P.sucio = vivas > 0;
    const g = P.pts.geometry.attributes; g.position.needsUpdate = true; g.aC.needsUpdate = true; g.aS.needsUpdate = true;
  }
  function actualizar(dt) {
    mover(C, dt); mover(Hm, dt);
    for (const n of nums) if (n.s.visible) { n.t -= dt * .9; n.y += dt * 1.6; n.s.position.set(n.x, n.y, n.z); n.s.material.opacity = clamp(n.t * 2, 0, 1); if (n.t <= 0) n.s.visible = false; }
  }
  return { init, emit, humo, rafaga, numero, actualizar };
})();

/* ---------- tela simulada (capa y cintas) ---------- */
class Tela {
  constructor(cols, filas, largo, anchoTop, anchoBot, colorFn, matOpts, forma) {
    this.C = cols; this.R = filas; this.largo = largo; const n = cols * filas;
    this.p = new Float32Array(n * 3); this.q = new Float32Array(n * 3); this.anc = [];
    this.aT = anchoTop; this.aB = anchoBot; this.seg = largo / (filas - 1);
    this.forma = forma || null; this.altos = new Float32Array(cols); this.anchos = new Float32Array(filas);
    for (let i = 0; i < cols; i++) this.altos[i] = this.seg * (1 - (forma ? forma.caida || 0 : 0) * (i / (cols - 1) * 2 - 1) ** 2);
    const g = new THREE.BufferGeometry(), col = new Float32Array(n * 3), idx = [];
    for (let j = 0; j < filas; j++) for (let i = 0; i < cols; i++) { const c = colorFn(i / (cols - 1 || 1), j / (filas - 1)); const k = (j * cols + i) * 3; col[k] = c.r; col[k + 1] = c.g; col[k + 2] = c.b; }
    for (let j = 0; j < filas - 1; j++) for (let i = 0; i < cols - 1; i++) { const a = j * cols + i; idx.push(a, a + cols, a + 1, a + 1, a + cols, a + cols + 1); }
    g.setAttribute('position', new THREE.BufferAttribute(this.p, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx);
    this.geo = g; this.mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true, side: THREE.DoubleSide, roughness: .7 }, matOpts || {})));
    if (forma && forma.relleno) {
      const uRellenoTela = { value: forma.relleno };
      this.mesh.material.onBeforeCompile = sh => {
        Atmosfera.inyectar(sh); sh.uniforms.uRellenoTela = uRellenoTela;
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uRellenoTela;')
          .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb*uRellenoTela;');
      };
      this.mesh.material.customProgramCacheKey = () => 'tela-luminosa';
    }
    this.mesh.frustumCulled = false; this.listo = false;
  }
  /* modo estable (forma.hz): paso fijo de 1/hz s con acumulador, anclas interpoladas entre fotogramas, más pasadas por
     paso (forma.iter) y tope al estiramiento (forma.estira × el largo de reposo desde su ancla): sin él, un tirón o una
     carrera hacen que la tela se estire como un resorte. Sin forma.hz funciona como siempre (Tasogare y las cintas). */
  anclar(arr) { // arr: posiciones mundo de la primera fila
    const C = this.C, F = this.forma;
    if (F && F.hz) {
      if (this.listo && this.aN) { const dx = arr[0].x - this.aN[0], dy = arr[0].y - this.aN[1], dz = arr[0].z - this.aN[2]; if (dx * dx + dy * dy + dz * dz > .5625) this.listo = false; }   // salto de más de 0,75 m: rehacer
      if (!this.pend) this.aP = this.listo && this.aN ? this.aN : null;   // si el paso anterior no llegó a simular, se conserva el tramo pendiente
      this.aN = new Float32Array(C * 3); for (let i = 0; i < C; i++) { this.aN[i * 3] = arr[i].x; this.aN[i * 3 + 1] = arr[i].y; this.aN[i * 3 + 2] = arr[i].z; }
    }
    if (!this.listo) { for (let j = 0; j < this.R; j++) for (let i = 0; i < C; i++) { const k = (j * C + i) * 3, a = arr[i]; this.p[k] = this.q[k] = a.x; this.p[k + 1] = this.q[k + 1] = a.y - j * this.altos[i]; this.p[k + 2] = this.q[k + 2] = a.z; } this.listo = true; this.pend = false; this.aP = null; this.acum = 0; }
    for (let i = 0; i < C; i++) { const k = i * 3; this.p[k] = this.q[k] = arr[i].x; this.p[k + 1] = this.q[k + 1] = arr[i].y; this.p[k + 2] = this.q[k + 2] = arr[i].z; }
  }
  /* viento: fuerza del aleteo; frec: su rapidez (rad/s). El aleteo crece hacia el borde libre y viaja a lo largo */
  paso(dt, gx, gy, gz, viento, bodyFn, frec) {
    const F = this.forma;
    if (F && F.hz && this.aN) {
      const h = 1 / F.hz; this.acum = (this.acum || 0) + dt; let n = Math.floor(this.acum / h);
      this.pend = n < 1; if (n < 1) return;
      if (n > F.maxSub) { n = F.maxSub; this.acum = 0; } else this.acum -= n * h;
      for (let s = 1; s <= n; s++) {
        if (this.aP) { const t = s / n; for (let i = 0; i < this.C; i++) { const k = i * 3; this.p[k] = this.q[k] = lerp(this.aP[k], this.aN[k], t); this.p[k + 1] = this.q[k + 1] = lerp(this.aP[k + 1], this.aN[k + 1], t); this.p[k + 2] = this.q[k + 2] = lerp(this.aP[k + 2], this.aN[k + 2], t); } }
        // si el ancla se mueve deprisa (carrera, salto), más pasadas: la corrección tarda en bajar por la tela
        let it = F.iter; if (this.aP && F.mov) { const d = Math.hypot(this.aN[15] - this.aP[15], this.aN[16] - this.aP[16], this.aN[17] - this.aP[17]) / n; if (d > F.mov) it += F.extra; }
        this.pasoUno(h, gx, gy, gz, viento, bodyFn, frec, it, s === n);
      }
      return;
    }
    this.pasoUno(dt, gx, gy, gz, viento, bodyFn, frec, 3, true);
  }
  pasoUno(dt, gx, gy, gz, viento, bodyFn, frec, iter, ultimo) {
    const C = this.C, R = this.R, p = this.p, q = this.q, dd = Math.pow(.9, dt * 60);
    for (let j = 1; j < R; j++) for (let i = 0; i < C; i++) {
      const k = (j * C + i) * 3, x = p[k], y = p[k + 1], z = p[k + 2];
      const w = Math.sin(U.uT.value * (frec || 2.1) - j * .9 + i * .6) * viento * (.35 + .65 * j / (R - 1));
      p[k] += (x - q[k]) * dd + (gx + w * .5) * dt * dt; p[k + 1] += (y - q[k + 1]) * dd + (gy + w * .45) * dt * dt; p[k + 2] += (z - q[k + 2]) * dd + (gz + w * .3) * dt * dt; q[k] = x; q[k + 1] = y; q[k + 2] = z;
    }
    for (let j = 0; j < R; j++) this.anchos[j] = lerp(this.aT, this.aB, this.forma ? Math.sin(j / (R - 1) * Math.PI * .5) : j / (R - 1));
    for (let it = 0; it < iter; it++) {
      // en el modo estable el barrido alterna de sentido (de la espalda al borde y a la inversa): converge el doble de rápido
      for (let jj = 1; jj < R; jj++) for (let i = 0; i < C; i++) {
        const j = this.forma && this.forma.hz && (it & 1) ? R - jj : jj;
        const a = ((j - 1) * C + i) * 3, b = (j * C + i) * 3, u = i / (C - 1) * 2 - 1;
        const arriba = this.anchos[j - 1], ancho = this.anchos[j];
        this.cons(a, b, this.forma ? Math.hypot(this.altos[i], u * (ancho - arriba) * .5) : this.seg, j === 1);
        if (i > 0) {
          this.cons(b - 3, b, this.forma ? Math.hypot(ancho / (C - 1), j * (this.altos[i] - this.altos[i - 1])) : ancho / (C - 1), false);
          if (this.forma && this.forma.diagonales) {
            // Diagonales suaves: la capa conserva el ancho sin convertirse en una lámina rígida.
            const up = (i - 1) / (C - 1) * 2 - 1, k = this.forma.diagonales;
            this.cons(a - 3, b, Math.hypot((u * ancho - up * arriba) * .5, j * this.altos[i] - (j - 1) * this.altos[i - 1]), j === 1, k);
            this.cons(a, b - 3, Math.hypot((up * ancho - u * arriba) * .5, j * this.altos[i - 1] - (j - 1) * this.altos[i]), j === 1, k);
          }
        }
      }
      if (bodyFn) for (let j = 1; j < R; j++) for (let i = 0; i < C; i++) bodyFn(p, (j * C + i) * 3);
      if (this.forma && this.forma.estira) this.topar();
    }
    if (!ultimo) return;
    const pa = this.geo.attributes.position; pa.needsUpdate = true; this.geo.computeVertexNormals(); this.geo.computeBoundingSphere();
  }
  /* ningún punto se aleja de su ancla más de forma.estira × el largo de reposo acumulado de su columna */
  topar() {
    const C = this.C, R = this.R, p = this.p, E = this.forma.estira;
    for (let i = 0; i < C; i++) {
      const k0 = i * 3, u = i / (C - 1) * 2 - 1, ax = p[k0], ay = p[k0 + 1], az = p[k0 + 2];
      let ruta = 0;   // largo de reposo acumulado a lo largo de la columna (en los bordes, la tela se ensancha al bajar y el camino es más largo que la recta)
      for (let j = 1; j < R; j++) {
        ruta += Math.hypot(this.altos[i], u * (this.anchos[j] - this.anchos[j - 1]) * .5);
        const k = (j * C + i) * 3, max = ruta * E;
        const dx = p[k] - ax, dy = p[k + 1] - ay, dz = p[k + 2] - az, d = Math.hypot(dx, dy, dz);
        if (d > max) { const f = max / d; p[k] = ax + dx * f; p[k + 1] = ay + dy * f; p[k + 2] = az + dz * f; }
      }
    }
  }
  cons(a, b, rest, fijoA, fuerza = 1) {
    const p = this.p, dx = p[b] - p[a], dy = p[b + 1] - p[a + 1], dz = p[b + 2] - p[a + 2], d = Math.hypot(dx, dy, dz) || 1e-5, k = (d - rest) / d * (fijoA ? 1 : .5) * fuerza;
    if (!fijoA) { p[a] += dx * k; p[a + 1] += dy * k; p[a + 2] += dz * k; }
    p[b] -= dx * k; p[b + 1] -= dy * k; p[b + 2] -= dz * k;
  }
}

/* ---------- Lumi, el hada guía ---------- */
const Lumi = (() => {
  const g = new THREE.Group(); let alas = [], halo, t = 0, pos = new THREE.Vector3(), objetivo = null, modo = 0, brillo = 1, fijo = null, temblor = 0;
  /* cinemáticas: Lumi se queda junto a un punto ({ x, y, z }; null: vuelve a seguir a Hikari) y tiembla (0…1) */
  function fijar(p, k) { fijo = p; temblor = k || 0; }
  function crear() {
    const nucleo = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })); g.add(nucleo);
    halo = new Halo(0xfff0b0, .95); halo.scale.set(1.5, 1.5, 1); g.add(halo);
    for (const s of [-1, 1]) {
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(.25, .22, .32, .02); sh.quadraticCurveTo(.2, -.08, 0, 0);
      const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: 0xcffcff, transparent: true, opacity: .75, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      m.scale.x = s; m.position.set(s * .03, 0, 0); g.add(m); alas.push(m);
    }
    scene.add(g); return g;
  }
  function actualizar(dt, jx, jy, jz, yaw, objetivoPos, interior) {
    t += dt; const ox = Math.sin(t * .9) * 1.1, oz = Math.cos(t * .7) * 1.1;
    let tx = jx + ox - Math.sin(yaw) * 1.2, ty = jy + 2.1 + Math.sin(t * 2.1) * .25, tz = jz + oz - Math.cos(yaw) * 1.2;
    if (objetivoPos) { const dx = objetivoPos.x - jx, dz = objetivoPos.z - jz, d = Math.hypot(dx, dz) || 1, a = Math.min(4.5, d * .5); tx = jx + dx / d * a + ox * .3; tz = jz + dz / d * a + oz * .3; ty = jy + 2.3 + Math.sin(t * 2.6) * .3; }
    if (fijo) { tx = fijo.x; ty = fijo.y + Math.sin(t * 2.1) * .05; tz = fijo.z; }
    if (pos.lengthSq() === 0) pos.set(tx, ty, tz);
    pos.x = damp(pos.x, tx, 3.2, dt); pos.y = damp(pos.y, ty, 3.2, dt); pos.z = damp(pos.z, tz, 3.2, dt);
    g.position.copy(pos); const asp = Math.atan2(camera.position.x - pos.x, camera.position.z - pos.z); g.rotation.y = asp;
    if (temblor) g.position.add(_tb.set(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).multiplyScalar(.03 * temblor));
    const bat = Math.sin(t * (38 + 30 * temblor)) * .8; alas.forEach((a, i) => { a.rotation.y = (i ? -1 : 1) * (.5 + bat * .6); });
    halo.opacidad = (.8 + .2 * Math.sin(t * 5)) * (1 - .4 * temblor); halo.scale.setScalar((1.3 + .2 * Math.sin(t * 4)) * (1 + interior * .6) * (1 - .25 * temblor));
    if (Math.random() < dt * 14) FX.emit(pos.x + rnd(-.1, .1), pos.y - .05, pos.z + rnd(-.1, .1), rnd(-.15, .15), rnd(-.3, -.05), rnd(-.15, .15), rnd(.5, 1), .12, 0xfff0b0, .8);
    g.visible = true; return pos;
  }
  function teletransportar(x, y, z) { pos.set(x, y + 2, z); }
  const _tb = new THREE.Vector3();
  return { crear, actualizar, teletransportar, fijar, grupo: g, get pos() { return pos; } };
})();
