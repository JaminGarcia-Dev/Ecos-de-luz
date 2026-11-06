/* === Ecos de Luz · 23-ataques-golem.js ===
   Los 14 ataques genéricos de los gólems (ATQ en 11-jefes.js da sus tiempos y daños). Cada ataque tiene
   ini (al elegirlo: marcas en el suelo), tele (aviso), act0 y act (golpe activo) y fin. Reciben las
   utilidades de Jefes (K) para marcar el suelo, herir a Hikari, crear zonas y disparar. */
"use strict";

function AtaquesGolem(K) {
  const { decal, herir, zona, disparar, dentro, enSector, limitar, aturdir, geos } = K;
  return {
    onda: {
      ini(B, a) { a.d.dec = decal(B, 'anillo', B.x, B.z, { r: 3 }); },
      tele(B, a) { a.d.dec.scale.setScalar(3 + Math.sin(a.t * 10) * .6); },
      act0(B, a, J) { Sonido.sfx('golpe'); J.shake = Math.max(J.shake, .9); Mando.vibrar(1, .7, 300); for (let k = 0; k < 24; k++) { const an = k / 24 * TAU; FX.emit(B.x + Math.sin(an) * 2, B.A.y + .2, B.z + Math.cos(an) * 2, Math.sin(an) * 10, 1, Math.cos(an) * 10, .9, .6, 0x9a8a70, .8); } },
      act(B, a, dt, J) { const r = B.rad + (a.t / a.A.act) * a.A.rango; a.d.dec.scale.setScalar(r); a.d.dec.material.opacity = .65; if (!a.d.hit && Math.abs(Math.hypot(J.x - B.x, J.z - B.z) - r) < 1.1 && J.y - B.A.y < .7) { a.d.hit = 1; herir(B, a.A.dmg); } }
    },
    lluvia: {
      ini(B, a, J) { const n = 5 + (B.fase > 1 ? 2 : 0); a.d.p = []; for (let k = 0; k < n; k++) { const p = dentro(B, J.x + (k ? rnd(-7, 7) : 0), J.z + (k ? rnd(-7, 7) : 0)); a.d.p.push(p); decal(B, 'disco', p.x, p.z, { r: 2.3 }); } },
      tele(B, a) {
        if (a.t > a.A.tele - .55 && !a.d.rocas) a.d.rocas = a.d.p.map(p => { const m = new THREE.Mesh(geos.roca, B.mt.roca); m.position.set(p.x, B.A.y + 16, p.z); m.scale.setScalar(1.3); scene.add(m); B.temp.push(m); return m; });
        if (a.d.rocas) { const k = clamp((a.t - (a.A.tele - .55)) / .55, 0, 1); for (const m of a.d.rocas) m.position.y = B.A.y + 16 * (1 - k * k) + .7; }
      },
      act0(B, a, J) { Sonido.sfx('golpe'); J.shake = Math.max(J.shake, .5); for (const p of a.d.p) { FX.rafaga(p.x, B.A.y + .5, p.z, 10, 4, .6, .4, 0x8a7a6a); if (!a.d.hit && Math.hypot(J.x - p.x, J.z - p.z) < 2.6 && J.y - B.A.y < 3) { a.d.hit = 1; herir(B, a.A.dmg); } } }
    },
    embestida: {
      ini(B, a, J) { const dx = J.x - B.x, dz = J.z - B.z, d = Math.hypot(dx, dz) || 1, ux = dx / d, uz = dz / d, t = dentro(B, J.x + ux * 6, J.z + uz * 6), L = Math.hypot(t.x - B.x, t.z - B.z);
        a.d.tx = t.x; a.d.tz = t.z; B.yaw = Math.atan2(ux, uz); decal(B, 'rect', B.x + ux * L / 2, B.z + uz * L / 2, { len: L, w: B.rad * 2.2, yaw: B.yaw }); },
      act(B, a, dt, J) {
        const v = 15 * dt, rx = a.d.tx - B.x, rz = a.d.tz - B.z, rl = Math.hypot(rx, rz); if (rl < v + .2) { a.fin = true; return; }
        B.x += rx / rl * v; B.z += rz / rl * v; B.mov = 2.2;
        if (!a.d.hit && Math.hypot(J.x - B.x, J.z - B.z) < B.rad + .8 && J.y - B.A.y < 2) { a.d.hit = 1; herir(B, a.A.dmg); }
        for (const p of B.pilares) if (Math.hypot(B.x - p.x, B.z - p.z) < p.r + B.rad * .95) { Sonido.sfx('golpe'); J.shake = Math.max(J.shake, 1); FX.rafaga(p.x, B.A.y + 3, p.z, 30, 6, 1, .5, 0x9a9a8a); UI.aviso('¡Se estrelló contra el pilar! Está aturdido', 'conteo'); aturdir(B, 3); return; }
        if (Math.random() < dt * 30) FX.emit(B.x, B.A.y + .3, B.z, rnd(-2, 2), rnd(.5, 2), rnd(-2, 2), .8, .5, 0x9a8a70, .7);
      }
    },
    aliento: {
      ini(B, a, J) { a.d.yaw = Math.atan2(J.x - B.x, J.z - B.z); a.d.dec = decal(B, 'sector', B.x, B.z, { r: 11, ang: 1.05, yaw: a.d.yaw }); },
      tele(B, a, dt, J) { a.d.yaw = angDamp(a.d.yaw, Math.atan2(J.x - B.x, J.z - B.z), 2, dt); B.yaw = a.d.yaw; a.d.dec.rotation.y = a.d.yaw - Math.PI / 2; },
      act(B, a, dt, J) {
        a.d.dec.material.opacity = .5;
        for (let k = 0; k < 3; k++) { const an = a.d.yaw + rnd(-.45, .45), s = rnd(6, 12); FX.emit(B.x + Math.sin(an) * 1.5, B.A.y + B.D.alto * .55, B.z + Math.cos(an) * 1.5, Math.sin(an) * s, rnd(-1.5, -.5), Math.cos(an) * s, .9, .45, 0xcff4ff, .8); }
        if (!a.d.hit && enSector(B, a.d.yaw, 11, 1.05, J) && J.y - B.A.y < 3) { a.d.hit = 1; herir(B, a.A.dmg, false); J.lento = 4; UI.aviso('Congelado: te mueves más lento', 'error'); }
      }
    },
    estacas: {
      ini(B, a, J) { const yaw = Math.atan2(J.x - B.x, J.z - B.z); a.d.yaw = yaw; a.d.L = 22; a.d.n = 0; B.yaw = yaw; decal(B, 'rect', B.x + Math.sin(yaw) * 11, B.z + Math.cos(yaw) * 11, { len: 22, w: 2.4, yaw }); },
      act0() { Sonido.sfx('golpe'); },
      act(B, a, dt, J) {
        const p = a.t / a.A.act, ux = Math.sin(a.d.yaw), uz = Math.cos(a.d.yaw);
        while (a.d.n * 1.6 < p * a.d.L) { const s = 1.5 + a.d.n * 1.6, m = new THREE.Mesh(geos.pincho, B.mt.pincho); m.position.set(B.x + ux * s, B.A.y + .9, B.z + uz * s); m.rotation.set(rnd(-.2, .2), 0, rnd(-.2, .2)); scene.add(m); B.temp.push(m); a.d.n++; }
        const rx = J.x - B.x, rz = J.z - B.z, al = rx * ux + rz * uz, lat = Math.abs(rx * uz - rz * ux);
        if (!a.d.hit && al > 0 && al < p * a.d.L + .6 && lat < 1.5 && J.y - B.A.y < 2) { a.d.hit = 1; herir(B, a.A.dmg); }
      },
      fin(B) { if (B.id === 'escarcha') { B.expuesto = 4.5; if (!B.avisoNuc) { B.avisoNuc = 1; UI.aviso('¡Su núcleo azul queda expuesto! Golpéalo 3 veces', 'conteo'); } } }
    },
    garras: {
      ini(B, a, J) { a.d.yaw = Math.atan2(J.x - B.x, J.z - B.z); B.yaw = a.d.yaw; decal(B, 'sector', B.x, B.z, { r: 7.5, ang: 2.4, yaw: a.d.yaw }); },
      act0(B, a, J) { Sonido.sfx('corte'); if (enSector(B, a.d.yaw, 7.5, 2.4, J) && J.y - B.A.y < 2.5) herir(B, a.A.dmg);
        for (const o of [-.6, .6]) zona(B, B.x + Math.sin(a.d.yaw + o) * 4.5, B.z + Math.cos(a.d.yaw + o) * 4.5, 2.4, 3, { dps: 6, color: 0xd99a3a }); }
    },
    tormenta: {
      ini(B, a) { a.d.dec = decal(B, 'anillo', B.x, B.z, { r: 16 }); },
      act(B, a, dt, J) {
        B.spin += 10 * dt; a.d.dec.material.opacity = .35; const dx = B.x - J.x, dz = B.z - J.z, d = Math.hypot(dx, dz);
        if (d < 16 && d > .1) { J.x += dx / d * 3.4 * dt; J.z += dz / d * 3.4 * dt; }
        a.d.tick = (a.d.tick || 0) - dt; if (d < B.rad + 2.4 && a.d.tick <= 0) { a.d.tick = .7; herir(B, a.A.dmg); }
        for (let k = 0; k < 4; k++) { const an = Math.random() * TAU, r = rnd(2, 15); FX.emit(B.x + Math.cos(an) * r, B.A.y + rnd(.2, 4), B.z + Math.sin(an) * r, -Math.sin(an) * 8 - Math.cos(an) * 2, rnd(0, 1), Math.cos(an) * 8 - Math.sin(an) * 2, .6, .5, 0xd9b27c, .6); }
      },
      fin(B) { B.yaw += B.spin; B.spin = 0; }
    },
    movedizas: {
      ini(B, a, J) { a.d.z = []; for (let k = 0; k < 4; k++) { const p = dentro(B, J.x + (k ? rnd(-9, 9) : 0), J.z + (k ? rnd(-9, 9) : 0)); a.d.z.push(p); decal(B, 'disco', p.x, p.z, { r: 4, color: 0xc9873a }); } },
      act0(B, a) { for (const p of a.d.z) zona(B, p.x, p.z, 4, 6, { dps: 3, lento: true, color: 0xb87a3a }); a.fin = true; }
    },
    cascada: {
      ini(B, a, J) { const yaw = Math.atan2(J.x - B.x, J.z - B.z); a.d.yaw = yaw; B.yaw = yaw; decal(B, 'rect', B.x + Math.sin(yaw) * 13, B.z + Math.cos(yaw) * 13, { len: 26, w: 13, yaw }); },
      act0(B, a) { const m = new THREE.Mesh(geos.caja, B.mt.ola); m.scale.set(13, 2.4, 1.4); m.rotation.y = a.d.yaw; scene.add(m); B.temp.push(m); a.d.m = m; Sonido.sfx('chapuzon'); },
      act(B, a, dt, J) {
        const s = 2 + a.t * 16, ux = Math.sin(a.d.yaw), uz = Math.cos(a.d.yaw); a.d.m.position.set(B.x + ux * s, B.A.y + 1.1, B.z + uz * s); a.d.m.visible = s < 27;
        const rx = J.x - B.x, rz = J.z - B.z, al = rx * ux + rz * uz, lat = Math.abs(rx * uz - rz * ux);
        if (!a.d.hit && Math.abs(al - s) < 1.2 && lat < 6.6 && J.y - B.A.y < 1.1) { a.d.hit = 1; herir(B, a.A.dmg); J.vx += ux * 8; J.vz += uz * 8; }
        if (Math.random() < dt * 40) FX.emit(B.x + ux * s + uz * rnd(-6, 6), B.A.y + 2, B.z + uz * s - ux * rnd(-6, 6), ux * 4, rnd(1, 3), uz * 4, .7, .5, 0xcffff0, .8);
      }
    },
    torbellino: {
      ini(B, a, J) { a.d.z = [-5, 5].map(o => { const p = dentro(B, J.x + o, J.z + rnd(-3, 3)); return { x: p.x, z: p.z, dec: decal(B, 'disco', p.x, p.z, { r: 3.6, color: 0x3fa8ff }) }; }); },
      act(B, a, dt, J) {
        for (const w of a.d.z) {
          const dx = J.x - w.x, dz = J.z - w.z, d = Math.hypot(dx, dz); if (d > .1) { w.x += dx / d * 1.3 * dt; w.z += dz / d * 1.3 * dt; }
          w.dec.position.set(w.x, B.A.y + .12, w.z); w.dec.material.opacity = .4;
          if (d < 3.6) { J.x -= dx * 1.6 * dt; J.z -= dz * 1.6 * dt; J.lento = .3; w.tick = (w.tick || 0) - dt; if (w.tick <= 0) { w.tick = .6; herir(B, a.A.dmg, false); } }
          if (Math.random() < dt * 25) { const an = Math.random() * TAU; FX.emit(w.x + Math.cos(an) * 3, B.A.y + .3, w.z + Math.sin(an) * 3, -Math.sin(an) * 5, rnd(.5, 2), Math.cos(an) * 5, .6, .35, 0x7fe0ff, .7); }
        }
      }
    },
    proyectiles: {
      ini(B, a, J) { decal(B, 'disco', J.x, J.z, { r: 1.6 }); a.d.n = 0; a.d.tt = 0; },
      act(B, a, dt, J) { a.d.tt -= dt; if (a.d.tt <= 0 && a.d.n < 6) { a.d.tt = .38; const p = B.M.manos[a.d.n % 2].getWorldPosition(new THREE.Vector3()); disparar(B, p, { x: J.x + J.vx * .3, y: J.y + 1, z: J.z + J.vz * .3 }, 15, 'orbe'); a.d.n++; } }
    },
    petalos: {
      ini(B, a, J) { a.d.yaw = Math.atan2(J.x - B.x, J.z - B.z); B.yaw = a.d.yaw; decal(B, 'sector', B.x, B.z, { r: 20, ang: 1.25, yaw: a.d.yaw }); },
      act0(B, a, J) { const o = new THREE.Vector3(B.x, B.A.y + B.D.alto * .55, B.z), dj = Math.max(3, Math.hypot(J.x - B.x, J.z - B.z)); for (let k = 0; k < 7; k++) { const an = a.d.yaw + (k - 3) * .19; disparar(B, o, { x: o.x + Math.sin(an) * dj, y: J.y + 1, z: o.z + Math.cos(an) * dj }, 17, 'petalo'); } Sonido.sfx('corte'); }
    },
    raices: {
      ini(B, a, J) { a.d.x = J.x; a.d.z = J.z; a.d.dec = decal(B, 'disco', J.x, J.z, { r: 2.5, color: 0x8a5a2a }); },
      tele(B, a, dt, J) { if (a.t < a.A.tele * .6) { a.d.x = damp(a.d.x, J.x, 4, dt); a.d.z = damp(a.d.z, J.z, 4, dt); a.d.dec.position.set(a.d.x, B.A.y + .12, a.d.z); } },
      act0(B, a, J) {
        for (let k = 0; k < 7; k++) { const an = k / 7 * TAU, m = new THREE.Mesh(geos.pincho, B.mt.raiz); m.position.set(a.d.x + Math.cos(an) * 1.6, B.A.y + .8, a.d.z + Math.sin(an) * 1.6); m.rotation.set(-Math.sin(an) * .5, 0, Math.cos(an) * .5); scene.add(m); B.temp.push(m); }
        if (Math.hypot(J.x - a.d.x, J.z - a.d.z) < 2.7 && J.y - B.A.y < 1.5) { herir(B, a.A.dmg, false); J.atrapado = 2; UI.aviso('¡Raíces! No puedes moverte', 'error'); }
      }
    },
    combo: {
      ini(B, a, J) { a.d.i = 0; a.d.yaw = Math.atan2(J.x - B.x, J.z - B.z); a.d.dec = decal(B, 'sector', B.x, B.z, { r: 6.5, ang: 2.1, yaw: a.d.yaw }); },
      tele(B, a, dt, J) { a.d.yaw = angDamp(a.d.yaw, Math.atan2(J.x - B.x, J.z - B.z), 4, dt); B.yaw = a.d.yaw; a.d.dec.rotation.y = a.d.yaw - Math.PI / 2; },
      act(B, a, dt, J) {
        const T = [0, .6, 1.2];
        for (; a.d.i < 3 && a.t >= T[a.d.i]; a.d.i++) {
          B.x += Math.sin(a.d.yaw) * 1.4; B.z += Math.cos(a.d.yaw) * 1.4; limitar(B); Sonido.sfx('corte');
          if (enSector(B, a.d.yaw, 6.5, 2.1, J) && J.y - B.A.y < 2.5) herir(B, a.A.dmg);
          a.d.swing = a.d.i; a.d.yaw = Math.atan2(J.x - B.x, J.z - B.z); B.yaw = a.d.yaw;
        }
        a.d.dec.rotation.y = a.d.yaw - Math.PI / 2; a.d.dec.position.set(B.x, B.A.y + .12, B.z); a.d.dec.material.opacity = .2 + .25 * Math.sin(a.t * 18);
      }
    }
  };
}
