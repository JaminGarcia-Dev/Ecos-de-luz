// Descarga fuentes con licencia documentada y prepara el audio comprimido e incrustado (ambiente y foley; desde la fusión
// no hay temas orquestales: la música es el koto y la flauta generados de 54-musica-inicio.js).
// Uso: node herramientas/preparar-audio.mjs. Los originales se conservan en el directorio temporal.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(os.tmpdir(), 'ecos-audio-fuentes'), destino = path.join(raiz, 'audio');
fs.mkdirSync(cache, { recursive: true }); fs.mkdirSync(destino, { recursive: true });
const descargar = async (url, archivo) => {
  const f = path.join(cache, archivo);
  if (!fs.existsSync(f)) {
    const r = await fetch(url, { signal: AbortSignal.timeout(120000) });
    if (!r.ok) throw new Error(`${r.status}: ${url}`);
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  return f;
};
const fuentes = [
  { id: 'bosque', titulo: 'Forest Ambience 2', autor: 'deadrobotmusic', licencia: 'CC0-1.0', pagina: 'https://freesound.org/people/deadrobotmusic/sounds/687054/', url: 'https://cdn.freesound.org/previews/687/687054_11532701-hq.mp3', archivoCache: 'bosque-natural.mp3', inicio: 2, duracion: 32 },
  { id: 'orilla', titulo: 'VistulaShort', autor: 'RandomMind', licencia: 'CC0-1.0', pagina: 'https://opengameart.org/content/sea-and-river-wave-sounds', url: 'https://opengameart.org/sites/default/files/VistulaShort_0.mp3', inicio: 20, duracion: 32 }
];
await Promise.all(fuentes.map(async f => { f.original = await descargar(f.url, f.archivoCache || f.id + '.mp3'); console.log('Fuente:', f.id); }));
const paquetes = [
  ['rpg', 'https://kenney.nl/media/pages/assets/rpg-audio/8e99002d76-1677590336/kenney_rpg-audio.zip', 'zip'],
  ['impactos', 'https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip', 'zip'],
  ['naturaleza', 'https://opengameart.org/sites/default/files/amb_bird_cricket_frog.7z', '7z']
];
for (const [id, url, ext] of paquetes) {
  const f = await descargar(url, id + '.' + ext), carpeta = path.join(cache, id); fs.mkdirSync(carpeta, { recursive: true });
  const r = spawnSync('tar', ['-xf', f, '-C', carpeta], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || r.error);
}
const muestras = [];
const agregar = (id, paquete, archivo, tipo = 'efecto') => muestras.push({ id, tipo, original: path.join(cache, paquete, archivo), titulo: archivo,
  autor: paquete === 'naturaleza' ? 'Blender Foundation / Yo Frankie!' : 'Kenney', licencia: paquete === 'naturaleza' ? 'CC-BY-3.0' : 'CC0-1.0',
  pagina: paquete === 'naturaleza' ? 'https://opengameart.org/content/ambient-bird-cricket-and-frog' : 'https://kenney.nl/assets/' + (paquete === 'rpg' ? 'rpg-audio' : 'impact-sounds') });
for (let i = 0; i < 3; i++) {
  agregar('paso-tierra-' + i, 'impactos', `Audio/footstep_grass_00${i}.ogg`);
  agregar('paso-piedra-' + i, 'impactos', `Audio/footstep_concrete_00${i}.ogg`);
  agregar('paso-nieve-' + i, 'impactos', `Audio/footstep_snow_00${i}.ogg`);
  agregar('paso-madera-' + i, 'impactos', `Audio/footstep_wood_00${i}.ogg`);
  agregar('impacto-suave-' + i, 'impactos', `Audio/impactSoft_medium_00${i}.ogg`);
  agregar('impacto-metal-' + i, 'impactos', `Audio/impactMetal_medium_00${i}.ogg`);
  agregar('impacto-piedra-' + i, 'impactos', `Audio/impactMining_00${i}.ogg`);
  agregar('cristal-' + i, 'impactos', `Audio/impactGlass_light_00${i}.ogg`);
}
agregar('campana', 'impactos', 'Audio/impactBell_heavy_000.ogg');
for (const [id, archivo] of [['tela-0','cloth1'], ['tela-1','cloth2'], ['corte-0','knifeSlice'], ['corte-1','knifeSlice2'], ['objeto','handleSmallLeather'], ['cofre','bookOpen']]) agregar(id, 'rpg', 'Audio/' + archivo + '.ogg');
agregar('ave-0', 'naturaleza', 'amb_bird_cricket_frog/amb_bird_1.flac');
agregar('ave-1', 'naturaleza', 'amb_bird_cricket_frog/amb_bird_2.flac');
agregar('grillos', 'naturaleza', 'amb_bird_cricket_frog/amb_cricket_1.flac', 'ambiente');
const recursos = {}, manifiesto = [];
for (const f of [...fuentes.map(f => ({ ...f, tipo: ['bosque','orilla'].includes(f.id) ? 'ambiente' : 'musica' })), ...muestras]) {
  const archivo = f.id + '.ogg', largo = f.duracion;
  const filtros = f.tipo === 'musica' ? `loudnorm=I=-19:TP=-3:LRA=11,afade=t=in:d=1.2,afade=t=out:st=${largo - 2}:d=2`
    : f.tipo === 'ambiente' ? 'highpass=f=45,loudnorm=I=-24:TP=-5:LRA=9' + (largo ? `,afade=t=in:d=0.15,afade=t=out:st=${largo - .15}:d=0.15` : '') : 'highpass=f=50,alimiter=limit=0.8:level=false';
  const args = ['-y', '-hide_banner', '-loglevel', 'error', ...(f.inicio ? ['-ss', String(f.inicio)] : []), '-i', f.original,
    ...(largo ? ['-t', String(largo)] : []), '-vn', '-map_metadata', '-1', '-af', filtros, '-ar', f.tipo === 'musica' ? '32000' : '24000',
    '-ac', f.tipo === 'musica' ? '2' : '1', '-c:a', 'libvorbis', '-q:a', f.tipo === 'musica' ? '3' : '2', path.join(destino, archivo)];
  const r = spawnSync(ffmpeg, args, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(f.id + ': ' + r.stderr);
  const datos = fs.readFileSync(path.join(destino, archivo)); recursos[f.id] = datos.toString('base64');
  manifiesto.push({ id: f.id, archivo, tipo: f.tipo, titulo: f.titulo, autor: f.autor, licencia: f.licencia, pagina: f.pagina,
    ...(f.url ? { descarga: f.url } : {}), ...(largo ? { inicioOriginal: f.inicio || 0, duracion: largo } : {}), bytes: datos.length,
    cambios: 'Selección de fragmento cuando procede; filtrado, ajuste de nivel y conversión a Ogg Vorbis.' });
  console.log('Preparado:', f.id, Math.round(datos.length / 1024) + ' KB');
}
fs.writeFileSync(path.join(destino, 'manifiesto.json'), JSON.stringify(manifiesto, null, 2) + '\n');
fs.writeFileSync(path.join(raiz, 'js/45-audio-recursos.js'), '// Generado por herramientas/preparar-audio.mjs. Fuentes y licencias en audio/manifiesto.json y AUDIO_LICENCIAS.md.\n"use strict";\nconst AUDIO_RECURSOS = ' + JSON.stringify(recursos, null, 2) + ';\n');
console.log('Total:', (manifiesto.reduce((s, f) => s + f.bytes, 0) / 1048576).toFixed(2) + ' MB');
