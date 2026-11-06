/* === Ecos de Luz · 73-hilo-luz.js ===
   Cinta de extracción para three r128. Comparte Halo y los materiales de partículas de FX: ningún shader nuevo.
   API: new HiloLuz(padre) reserva nodos y partículas según AJUSTES.calidad (después de FX.init).
   tender(origenMundo, destinoMundo, esfuerzo01): Bézier; el llamador obtiene el ancla del hueso después de posar.
   evaluar(s01, vectorDestino): escribe un punto sin asignaciones; cruce(base, punta, destino): distancia filo/cinta.
   cortar(puntoMundo): dos tramos, hueco, látigo y motas; onda(centro, normal): anillo de 0,35 s.
   grieta(puntosMundo, k01): polilínea sobre la obra; estela(baseMundo, puntaMundo): historial real del filo.
   actualizar(tSegundosDelPlano, dt): reloj dirigido; fijar tiempo ANTES de los eventos con la propiedad tiempo.
   emitir(...), polvo(...): firma de FX.emit; grupos propios, presupuestados y limpiables al repetir u omitir.
   limpiar(): reinicia sin liberar recursos. Propiedades: longitud (-1 oculta, 0–1 tendido), fase (s),
   pecho y dintel (alfa; -1 = pulso automático).
   visible y estado(): consulta para las pruebas. Los vectores, colores y arrays se reservan al construir. */
"use strict";
/* Se carga antes de arrancar(): Halo.lote reserva esta capacidad antes de la compilación y de cualquier escena. */
HALO_LOTE.cap = Math.max(HALO_LOTE.cap, 4096);
class HiloLuz {
  constructor(padre) {
    const q = AJUSTES.calidad === 'baja' ? 2 : AJUSTES.calidad === 'media' ? 1 : 0;
    this.n = [48, 36, 24][q]; this.nMotas = [8, 6, 4][q]; this.nOnda = [24, 16, 12][q];
    this.nGrieta = [24, 16, 12][q]; this.nEstela = [12, 8, 6][q];
    this.limite = [144, 100, 72][q]; this.maxLuz = [180, 120, 80][q]; this.maxPolvo = [72, 48, 24][q];
    this.grupo = new THREE.Group(); this.grupo.name = 'HiloLuz'; padre.add(this.grupo);
    this.halos = [];
    const crear = (n, hex) => Array.from({ length: n }, () => {
      const h = new Halo(lin(hex), 0); this.grupo.add(h); this.halos.push(h); return h;
    });
    this.cinta = crear(this.n, 0xfff3ce); this.motas = crear(this.nMotas, 0xfff3ce);
    this.anclas = crear(4, 0xe8be70); this.anillo = crear(this.nOnda, 0xf4d7a2);
    this.fisura = crear(this.nGrieta, 0xffd8a0); this.rastro = crear(this.nEstela, 0xffd99a);
    this.flash = crear(1, 0xfff4d7)[0];
    this.p0 = new THREE.Vector3(); this.p1 = new THREE.Vector3(); this.p2 = new THREE.Vector3(); this.p3 = new THREE.Vector3();
    this.curva = new THREE.CubicBezierCurve3(this.p0, this.p1, this.p2, this.p3);
    this.v = new THREE.Vector3(); this.w = new THREE.Vector3(); this.proyA = new THREE.Vector3(); this.proyB = new THREE.Vector3();
    this.lado = new THREE.Vector3(); this.direccion = new THREE.Vector3(); this.centroCorte = new THREE.Vector3();
    this.centroOnda = new THREE.Vector3(); this.ejeA = new THREE.Vector3(); this.ejeB = new THREE.Vector3();
    this.normal = new THREE.Vector3(); this.color = new THREE.Color(); this.oro = lin(0xe8be70); this.nucleo = lin(0xfff3ce);
    this.a = new THREE.Vector3(); this.b = new THREE.Vector3(); this.c = new THREE.Vector3();
    this.d = new THREE.Vector3(); this.e = new THREE.Vector3(); this.f = new THREE.Vector3();
    this.histBase = Array.from({ length: this.nEstela }, () => new THREE.Vector3());
    this.histPunta = Array.from({ length: this.nEstela }, () => new THREE.Vector3());
    this.histT = new Float32Array(this.nEstela); this.histI = 0;
    this.N = this.maxLuz + this.maxPolvo;
    this.pos = new Float32Array(this.N * 3); this.col = new Float32Array(this.N * 4); this.tam = new Float32Array(this.N);
    this.inicio = new Float32Array(this.N * 3); this.vel = new Float32Array(this.N * 3);
    this.nace = new Float32Array(this.N); this.vida = new Float32Array(this.N); this.tam0 = new Float32Array(this.N); this.alfa = new Float32Array(this.N);
    const geometria = (desde, n) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(this.pos.subarray(desde * 3, (desde + n) * 3), 3).setUsage(THREE.DynamicDrawUsage));
      geo.setAttribute('aC', new THREE.BufferAttribute(this.col.subarray(desde * 4, (desde + n) * 4), 4).setUsage(THREE.DynamicDrawUsage));
      geo.setAttribute('aS', new THREE.BufferAttribute(this.tam.subarray(desde, desde + n), 1).setUsage(THREE.DynamicDrawUsage));
      return geo;
    };
    let material, humo;
    scene.traverse(o => {
      if (!o.isPoints) return;
      if (o.geometry.attributes.position.count === 360) material = o.material;
      if (o.geometry.attributes.position.count === 420) humo = o.material;
    });
    if (!material || !humo) throw Error('HiloLuz necesita FX.init antes de preparar la escena');
    // Baja comparte un solo dibujo con mezcla normal; el color HDR conserva las motas luminosas sin bloom.
    this.particulas = new THREE.Points(geometria(0, q === 2 ? this.N : this.maxLuz), q === 2 ? humo : material);
    this.particulas.name = 'Motas_prologo';
    this.particulas.frustumCulled = false; this.particulas.renderOrder = 5; this.grupo.add(this.particulas);
    this.polvareda = q === 2 ? null : new THREE.Points(geometria(this.maxLuz, this.maxPolvo), humo);
    if (this.polvareda) { this.polvareda.name = 'Polvo_prologo'; this.polvareda.frustumCulled = false; this.polvareda.renderOrder = 4; this.grupo.add(this.polvareda); }
    this.limpiar();
  }
  tender(origen, destino, esfuerzo) {
    if (this.roto) return;
    this.ruta = null; this.activo = true; this.esfuerzo = clamp(esfuerzo, 0, 1);
    this.p0.copy(origen); this.p3.copy(destino); this.direccion.subVectors(destino, origen);
    this.lado.set(this.direccion.z, 0, -this.direccion.x).normalize();
    this.p1.copy(origen).addScaledVector(this.direccion, .25).addScaledVector(this.lado, .18); this.p1.y += .30;
    this.p2.copy(origen).addScaledVector(this.direccion, .72).addScaledVector(this.lado, -.12); this.p2.y += .15;
  }
  evaluar(s, destino) {
    (this.ruta || this.curva).getPoint(s, destino);
    const onda = lerp(.025, .065, this.esfuerzo) * Math.sin(TAU * (2 * s - .8 * this.tiempo)) * Math.sin(Math.PI * s);
    destino.addScaledVector(this.lado, onda); return destino;
  }
  /* Conductos por fuera de la obra: conserva cinta, ancho y pulso, admite circulación inversa. */
  seguirRuta(puntos) {
    this.ruta = new THREE.CatmullRomCurve3(puntos, false, 'centripetal'); this.activo = true; this.esfuerzo = .75;
    this.p0.copy(puntos[0]); this.p3.copy(puntos[puntos.length - 1]);
    this.direccion.subVectors(this.p3, this.p0); this.lado.set(this.direccion.z, 0, -this.direccion.x).normalize();
  }
  /* Distancia entre el filo y los segmentos de la curva. Conserva el punto de la cinta más cercano al metal. */
  cruce(base, punta, destino) {
    this.a.subVectors(punta, base); const aa = this.a.lengthSq(); let mejor = Infinity;
    this.evaluar(0, this.b);
    for (let i = 1; i <= 96; i++) {
      this.evaluar(i / 96, this.c); this.d.subVectors(this.c, this.b); this.e.subVectors(base, this.b);
      const bb = this.a.dot(this.d), cc = this.d.lengthSq(), dd = this.a.dot(this.e), ee = this.d.dot(this.e), den = aa * cc - bb * bb;
      let u = den > 1e-12 ? clamp((bb * ee - cc * dd) / den, 0, 1) : 0;
      let v = cc > 1e-12 ? clamp((bb * u + ee) / cc, 0, 1) : 0;
      u = aa > 1e-12 ? clamp((bb * v - dd) / aa, 0, 1) : 0;
      v = cc > 1e-12 ? clamp((bb * u + ee) / cc, 0, 1) : 0;
      this.f.copy(base).addScaledVector(this.a, u); this.w.copy(this.b).addScaledVector(this.d, v);
      const dist = this.f.distanceToSquared(this.w);
      if (dist < mejor) { mejor = dist; destino.copy(this.w); }
      this.b.copy(this.c);
    }
    return Math.sqrt(mejor);
  }
  cortar(punto, opciones) {
    if (this.roto) return;
    let menor = Infinity; this.sCorte = .5;
    for (let i = 1; i < 96; i++) {
      const s = i / 96; this.evaluar(s, this.v); const d = this.v.distanceToSquared(punto);
      if (d < menor) { menor = d; this.sCorte = s; }
    }
    this.centroCorte.copy(punto); this.roto = true; this.corteT = this.tiempo; this.sueltas = 0;
    this.motasCorte = !opciones || opciones.motas !== false;
    for (let i = 0; i < (this.motasCorte ? 14 : 0); i++) {
      const a = i * 2.39996, v = 1 + (i % 7) * .2;
      this.emitir(punto.x, punto.y, punto.z, Math.cos(a) * v, Math.sin(a * 1.7) * v, Math.sin(a) * v, .35 + i % 6 * .05, .04 + i % 5 * .01, 0xfff3ce, .9);
    }
  }
  onda(centro, normal, opciones) {
    this.centroOnda.copy(centro); this.normal.copy(normal).normalize();
    this.v.set(Math.abs(this.normal.y) < .9 ? 0 : 1, Math.abs(this.normal.y) < .9 ? 1 : 0, 0);
    this.ejeA.crossVectors(this.normal, this.v).normalize(); this.ejeB.crossVectors(this.normal, this.ejeA);
    this.ondaT = this.tiempo; this.ondaOpciones = opciones || null;
  }
  segmento(h, a, b, ancho, alfa) {
    h.position.copy(a).add(b).multiplyScalar(.5); h.opacidad = alfa;
    this.proyA.copy(a).applyMatrix4(camera.matrixWorldInverse); this.proyB.copy(b).applyMatrix4(camera.matrixWorldInverse);
    h.giro = Math.atan2(this.proyB.y - this.proyA.y, this.proyB.x - this.proyA.x);
    h.scale.set(Math.max(ancho, a.distanceTo(b) * 1.7), ancho, 1);
  }
  grieta(puntos, k) {
    const n = puntos.length - 1;
    for (let i = 0; i < this.nGrieta; i++) {
      const s0 = i / this.nGrieta, s1 = Math.min(k, (i + 1) / this.nGrieta), h = this.fisura[i];
      if (s0 >= k) { h.opacidad = 0; continue; }
      const j = Math.min(n - 1, Math.floor(s0 * n)), l = Math.min(n - 1, Math.floor(s1 * n));
      this.v.lerpVectors(puntos[j], puntos[j + 1], s0 * n - j);
      this.w.lerpVectors(puntos[l], puntos[l + 1], s1 * n - l);
      const dist = camera.position.distanceTo(this.v), pixel = dist * Math.tan(camera.fov * Math.PI / 360) * 4 / Math.max(1, renderer.domElement.height);
      this.segmento(h, this.v, this.w, Math.max(.06 + .06 * (i % 3) / 2, pixel), .55 + .2 * Math.sin(i * 2.3 + this.tiempo * 17));
    }
  }
  estela(base, punta) {
    const j = this.histI; this.histBase[j].copy(base); this.histPunta[j].copy(punta); this.histT[j] = this.tiempo;
    this.histI = (j + 1) % this.nEstela;
  }
  guardar(x, y, z, vx, vy, vz, vida, tam, hex, alfa, polvo) {
    const desde = polvo ? this.maxLuz : 0, hasta = polvo ? this.N : this.maxLuz;
    for (let i = desde; i < hasta; i++) if (this.vida[i] <= 0 || this.tiempo - this.nace[i] >= this.vida[i]) {
      const j = i * 3, c = i * 4; this.inicio[j] = x; this.inicio[j + 1] = y; this.inicio[j + 2] = z;
      this.vel[j] = vx; this.vel[j + 1] = vy; this.vel[j + 2] = vz;
      this.nace[i] = this.tiempo; this.vida[i] = vida; this.tam0[i] = tam; this.alfa[i] = alfa === undefined ? 1 : alfa;
      this.color.setHex(hex).convertSRGBToLinear().multiplyScalar(polvo ? .5 : 2);
      this.col[c] = this.color.r; this.col[c + 1] = this.color.g; this.col[c + 2] = this.color.b; return;
    }
  }
  emitir(x, y, z, vx, vy, vz, vida, tam, hex, alfa) { this.guardar(x, y, z, vx, vy, vz, vida, tam, hex, alfa, false); }
  polvo(x, y, z, vx, vy, vz, vida, tam, hex, alfa) { this.guardar(x, y, z, vx, vy, vz, vida, tam, hex, alfa, true); }
  actualizar(t, dt) {
    this.tiempo = t; const tc = this.roto ? Math.max(0, t - this.corteT) : -1, ancho = lerp(.12, this.anchoMax, this.esfuerzo);
    camera.updateMatrixWorld(true);
    const largo = Math.max(.01, this.p0.distanceTo(this.p3)), flujo = Math.max(0, t - this.fase), pulso = (flujo % 1.2) / .65;
    for (let i = 0; i < this.n; i++) {
      const s = i / (this.n - 1), h = this.cinta[i], dist = Math.abs(s - this.sCorte) * largo;
      const sf = this.inversa ? 1 - s : s;
      let alfa = this.activo && s <= this.longitud ? lerp(.35, .65, this.esfuerzo) + .25 * Math.exp(-(((sf - pulso) / .12) ** 2)) : 0;
      this.evaluar(s, this.v); this.evaluar(Math.min(1, s + 1 / (this.n - 1)), this.w);
      if (this.roto) {
        const hueco = .125 * smooth(0, .08, tc), desarma = smooth(.18, .85, tc);
        alfa *= 1 - smooth(0, Math.max(.01, largo * .7), desarma * largo - dist);
        if (dist < hueco || tc >= .85) alfa = 0;
        const signo = s < this.sCorte ? -1 : 1, peso = Math.exp(-dist * 3);
        const retro = (signo < 0 ? .22 : .45) * smooth(.06, .55, tc) * peso;
        this.direccion.subVectors(this.p3, this.p0).normalize();
        this.v.addScaledVector(this.direccion, signo * retro).addScaledVector(this.lado, Math.sin(tc * 24) * .18 * Math.exp(-tc * 5) * peso);
        this.w.addScaledVector(this.direccion, signo * retro);
      }
      this.segmento(h, this.v, this.w, ancho, Math.min(.9, alfa));
      h.color.copy(this.oro).lerp(this.nucleo, .6 + .4 * Math.exp(-(((sf - pulso) / .12) ** 2)));
    }
    for (let i = 0; i < this.nMotas; i++) {
      const h = this.motas[i], s = ((flujo + i * 1.2 / this.nMotas) % 1.2) / .65;
      h.opacidad = this.activo && !this.roto && t >= this.fase && s <= this.longitud && s <= 1 ? .9 : 0;
      this.evaluar(this.inversa ? 1 - Math.min(1, s) : Math.min(1, s), h.position); h.scale.setScalar(.035 + .03 * (i % 3) / 2);
    }
    const salida = flujo % 1.2, llegada = (flujo - .65 + 120) % 1.2;
    for (let i = 0; i < 4; i++) {
      const h = this.anclas[i], pecho = i < 2;
      h.position.copy(pecho ? this.p0 : this.p3); h.scale.setScalar(pecho ? (i === 0 ? .30 : .55) : (i === 2 ? .45 : .80));
      const manual = pecho ? this.pecho : this.dintel;
      let alfa = manual >= 0 ? manual : pecho ? (salida < .25 ? lerp(.60, .30, salida / .25) : .45) : .25 + .5 * Math.max(0, 1 - Math.abs(llegada - .175) / .175);
      if (this.roto) alfa *= pecho ? .7 : 1 - smooth(.4, .65, tc);
      h.opacidad = this.activo ? alfa * (i % 2 ? .5 : 1) : 0;
    }
    if (this.roto && this.motasCorte && tc >= .18 && dt > 0) {
      const n = Math.floor(32 * smooth(.18, .85, tc));
      while (this.sueltas < n) {
        const j = this.sueltas++, s = (j + .5) / 32; this.evaluar(s, this.v); const a = j * 2.39996;
        this.emitir(this.v.x, this.v.y, this.v.z, Math.cos(a) * .5, .3 + j % 4 * .15, Math.sin(a) * .5, .45 + j % 8 * .05, .04 + j % 6 * .01, 0xfff3ce, .7);
      }
    }
    this.flash.opacidad = this.roto ? .8 * (1 - smooth(0, .08, tc)) : 0;
    this.flash.position.copy(this.centroCorte); this.flash.scale.setScalar(lerp(.35, .75, smooth(0, .08, tc)));
    const O = this.ondaOpciones || {}, durOnda = O.dur || .35;
    const to = t - this.ondaT, ro = lerp(O.desde || .15, O.hasta || 1.4, clamp(to / durOnda, 0, 1));
    for (let i = 0; i < this.nOnda; i++) {
      const h = this.anillo[i], a = i / this.nOnda * TAU;
      h.position.copy(this.centroOnda).addScaledVector(this.ejeA, Math.cos(a) * ro).addScaledVector(this.ejeB, Math.sin(a) * ro);
      h.scale.setScalar(.13 + .10 * ro); h.opacidad = to >= 0 && to < durOnda ? .35 * (1 - to / durOnda) : 0;
    }
    for (let i = 0; i < this.nEstela; i++) {
      const edad = t - this.histT[i], h = this.rastro[i];
      this.segmento(h, this.histBase[i], this.histPunta[i], lerp(.09, .04, clamp(edad / .18, 0, 1)), edad >= 0 && edad < .18 ? .6 * (1 - edad / .18) : 0);
    }
    let vivas = 0, polvoVivo = 0;
    for (let i = 0; i < this.N; i++) {
      const edad = t - this.nace[i], j = i * 3, c = i * 4, polvo = i >= this.maxLuz;
      if (this.vida[i] <= 0 || edad < 0 || edad >= this.vida[i]) { this.col[c + 3] = 0; continue; }
      vivas++; if (polvo) polvoVivo++; const k = 1 - edad / this.vida[i];
      this.pos[j] = this.inicio[j] + this.vel[j] * edad;
      this.pos[j + 1] = this.inicio[j + 1] + this.vel[j + 1] * edad - (polvo ? .08 : .3) * edad * edad;
      this.pos[j + 2] = this.inicio[j + 2] + this.vel[j + 2] * edad;
      this.tam[i] = this.tam0[i] * (polvo ? 1 + (1 - k) * 1.6 : 1);
      this.col[c + 3] = this.alfa[i] * (polvo ? Math.min(1, k * 2.5, (1 - k) * 6) : Math.min(1, k * 2.2));
    }
    this.particulas.visible = (this.polvareda ? vivas - polvoVivo : vivas) > 0; this.ensuciar(this.particulas);
    if (this.polvareda) { this.polvareda.visible = polvoVivo > 0; this.ensuciar(this.polvareda); }
  }
  ensuciar(objeto) {
    const at = objeto.geometry.attributes; at.position.needsUpdate = true; at.aC.needsUpdate = true; at.aS.needsUpdate = true;
  }
  limpiar() {
    this.activo = this.roto = false; this.tiempo = this.esfuerzo = this.sueltas = 0; this.sCorte = .5;
    this.longitud = 1; this.fase = 0; this.pecho = this.dintel = -1; this.ondaT = -999; this.histT.fill(-999); this.histI = 0;
    this.inversa = false; this.anchoMax = .20; this.ondaOpciones = null; this.ruta = null;
    this.oro.copy(lin(0xe8be70)); this.nucleo.copy(lin(0xfff3ce));
    this.vida.fill(0); this.col.fill(0); this.particulas.visible = false;
    if (this.polvareda) { this.polvareda.visible = false; this.ensuciar(this.polvareda); }
    for (const h of this.halos) h.opacidad = 0;
    this.particulas.geometry.attributes.aC.needsUpdate = true;
  }
  get visible() { for (const h of this.cinta) if (h.opacidad > .001) return true; return false; }
  estado() {
    let halos = 0, luz = 0, polvo = 0;
    for (const h of this.halos) if (h.opacidad > 0) halos++;
    for (let i = 0; i < this.N; i++) if (this.col[i * 4 + 3] > 0) { if (i < this.maxLuz) luz++; else polvo++; }
    return { visible: this.visible, roto: this.roto, halos, luz, polvo, limite: this.limite, maxLuz: this.maxLuz, maxPolvo: this.maxPolvo };
  }
}
