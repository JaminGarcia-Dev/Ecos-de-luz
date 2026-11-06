/* Objetos y coberturas del piloto: geometría sencilla, sólidos y estado visual restaurable. */
"use strict";
const PatioInicio = (() => {
  let g, postigo, brasa, papel, luz, mesa;
  const puntos = {};
  const mate = color => new THREE.MeshLambertMaterial({ color });
  function caja(w, h, d, mat, x, y, z, padre) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (padre || g).add(m); return m;
  }
  function crear() {
    if (g) return;
    g = new THREE.Group(); scene.add(g);
    const S = sitio('aldea'), madera = mate(0x654831), marfil = mate(0xe6d7ad), piedra = mate(0x686c75);
    puntos.tsuru = { x: S.x + 6, z: S.z + 6, y: S.h };
    puntos.momo = { x: S.x + 2.8, z: S.z + 5, y: S.h };
    puntos.hoja = { x: S.x + 4.2, z: S.z + 7.6, y: S.h };
    puntos.farol = { x: S.x + 2.3, z: S.z + 7.6, y: S.h };
    puntos.aviso = { x: S.x + 10, z: S.z + 1, y: S.h };
    const T = puntos.hoja, F = puntos.farol;
    mesa = caja(4, .15, 1.15, madera, T.x - .8, T.y + .65, T.z);
    for (const dx of [-1.7, 1.7]) for (const dz of [-.4, .4]) caja(.13, .65, .13, madera, T.x - .8 + dx, T.y + .3, T.z + dz);
    Sol.add(T.x - .8, T.z, 2, .575, 0, T.y, T.y + .73);
    papel = caja(.58, .014, .44, marfil, T.x, T.y + .74, T.z); papel.rotation.y = -.18;
    caja(.75, .18, .54, madera, T.x + .9, T.y + .8, T.z);
    caja(.42, .62, .42, madera, F.x, F.y + 1.04, F.z);
    luz = caja(.33, .47, .33, mate(0x80776b), F.x, F.y + 1.05, F.z);
    postigo = new THREE.Group(); postigo.position.set(F.x + .23, F.y + 1.05, F.z + .2); g.add(postigo);
    caja(.025, .53, .43, madera, 0, 0, -.2, postigo);
    brasa = new Halo(0xffcf85, 0); brasa.scale.set(1.1, 1.1, 1); brasa.position.set(F.x, F.y + 1.1, F.z + .24); g.add(brasa);
    const A = puntos.aviso;
    caja(1.95, 1.25, .14, madera, A.x, A.y + 1.35, A.z);
    for (const dx of [-.8, .8]) caja(.12, 1.5, .12, madera, A.x + dx, A.y + .75, A.z);
    const lienzo = document.createElement('canvas'); lienzo.width = 512; lienzo.height = 320;
    const tinta = lienzo.getContext('2d'); tinta.fillStyle = '#e6d7ad'; tinta.fillRect(0, 0, 512, 320);
    tinta.textAlign = 'center'; tinta.fillStyle = '#6b2927'; tinta.font = 'bold 33px Georgia'; tinta.fillText('AVISO DEL FARO', 256, 62);
    tinta.font = '28px Georgia'; tinta.fillStyle = '#30251c'; tinta.fillText('Nuestra protectora', 256, 170); tinta.fillText('está herida', 256, 211);
    tinta.fillStyle = '#a63d31'; tinta.beginPath(); tinta.arc(256, 112, 20, 0, Math.PI * 2); tinta.fill();
    const textura = new THREE.CanvasTexture(lienzo); textura.encoding = THREE.sRGBEncoding;
    const anuncio = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), new THREE.MeshLambertMaterial({ map: textura, side: THREE.DoubleSide }));
    anuncio.position.set(A.x, A.y + 1.35, A.z + .08); g.add(anuncio);
    Sol.add(A.x, A.z, .98, .12, 0, A.y + .7, A.y + 2);
    // Coberturas anchas sobre el trayecto. También sirven de hitos con el audio silenciado.
    for (const [x, z] of [[-30, 24], [-53, 40]]) {
      const y = altura(x, z); caja(3.6, 1.7, 1.7, piedra, x, y + .85, z);
      Sol.add(x, z, 1.8, .85, 0, y, y + 1.7);
    }
    // Losas bajas: salto opcional y alternativa transitable a los lados.
    for (const [x, z, h] of [[-12, 19, .25], [-16, 21, .55], [-21, 23, .25]]) {
      const y = altura(x, z); caja(2.8, h, 2.8, piedra, x, y + h / 2, z); Sol.add(x, z, 1.4, 1.4, 0, y, y + h);
    }
    actualizar(0); Bus.emit('sombraEstatica');
  }
  function actualizar(t) {
    if (!g) return; const s = Sis.ST.inicio;
    postigo.rotation.y = s.postigo ? 0 : .8 + Math.sin(t * 2.1) * .2;
    brasa.opacidad = s.farol ? .55 : 0; luz.material.color.setHex(s.farol ? 0xffdc9a : 0x80776b);
    papel.visible = !!s.tsuru;
  }
  return { crear, actualizar, puntos };
})();
