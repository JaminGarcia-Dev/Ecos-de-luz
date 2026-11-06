/* === Ecos de Luz · herramientas/empaquetar.mjs ===
   Une la página, el CSS y los módulos de js/ (en el orden de index.html) en un solo ecos-de-luz.html,
   listo para publicarlo como artefacto de claude.ai. three.js r128 y las fuentes siguen viniendo de
   cdnjs y de Google Fonts. Comprueba la sintaxis de cada módulo, que no quede ningún archivo local
   sin incluir y que el resultado no pase de 16 MB. Con --zip comprime además la carpeta modular.

   Uso (desde herramientas/):  node empaquetar.mjs [--salida carpeta] [--zip]
   Por defecto deja los archivos en dist/ (en la raíz del proyecto). */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIMITE = 16 * 1024 * 1024;   // tamaño máximo de un artefacto de claude.ai
const arg = (n, def) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : def; };
const SALIDA = path.resolve(RAIZ, arg('--salida', 'dist'));
const ZIP = process.argv.includes('--zip');
const kb = n => (n / 1024).toFixed(0) + ' KB';
const ruta = f => { const r = path.relative(RAIZ, f); return r.startsWith('..') ? f : r; };

let html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const errores = [];

// estilos locales → <style>
html = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (_, f) => `<style>\n${fs.readFileSync(path.join(RAIZ, f), 'utf8')}\n</style>`);

// módulos locales → <script> en línea, en el mismo orden
const modulos = [];
html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, f) => {
  const codigo = fs.readFileSync(path.join(RAIZ, f), 'utf8');
  try { new vm.Script(codigo, { filename: f }); } catch (e) { errores.push(`${f}: ${e.message}`); }
  modulos.push({ f, bytes: Buffer.byteLength(codigo) });
  // un «</script» dentro del código cerraría la etiqueta antes de tiempo
  return `<script>/* ${f} */\n${codigo.replace(/<\/script/gi, '<\\/script')}\n</script>`;
});

// no debe quedar ninguna referencia a archivos locales
// Revisa atributos del documento, sin confundir las plantillas de créditos del JavaScript con archivos locales.
const marcado = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
const locales = [...marcado.matchAll(/(?:src|href)="(?!https?:|data:|#)([^"]+)"/g)].map(m => m[1]);
if (locales.length) errores.push('referencias locales sin incluir: ' + locales.join(', '));
// los scripts externos solo pueden venir de cdnjs o jsdelivr
for (const m of html.matchAll(/<script src="([^"]+)"/g)) if (!/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)\//.test(m[1])) errores.push('script de un servidor no permitido: ' + m[1]);

const bytes = Buffer.byteLength(html);
if (bytes > LIMITE) errores.push(`el archivo ocupa ${kb(bytes)} (máximo ${kb(LIMITE)})`);
if (errores.length) { console.error('No se ha empaquetado:\n- ' + errores.join('\n- ')); process.exit(1); }

fs.mkdirSync(SALIDA, { recursive: true });
const destino = path.join(SALIDA, 'ecos-de-luz.html');
fs.writeFileSync(destino, html);
console.log(`${ruta(destino)}: ${kb(bytes)} · ${modulos.length} módulos (${kb(modulos.reduce((a, m) => a + m.bytes, 0))} de código) · sintaxis correcta`);

if (ZIP) {
  // Carpeta modular y documentación: los .md de la raíz y la carpeta docs/ (catálogo de personajes y documentos que enlaza el README).
  const documentos = [...fs.readdirSync(RAIZ, { withFileTypes: true }).filter(f => f.isFile() && f.name.endsWith('.md')).map(f => f.name), ...(fs.existsSync(path.join(RAIZ, 'docs')) ? ['docs'] : [])];
  const zip = path.join(SALIDA, 'ecos-de-luz.zip'), lista = ['index.html', 'css', 'js', 'vendor', ...(fs.existsSync(path.join(RAIZ, 'audio')) ? ['audio'] : []), ...documentos]; fs.rmSync(zip, { force: true });
  // en Windows, el tar del sistema (bsdtar) sabe hacer zip; en otros sistemas, zip
  const r = process.platform === 'win32'
    ? spawnSync(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe'), ['-a', '-c', '-f', zip, ...lista], { cwd: RAIZ, encoding: 'utf8' })
    : spawnSync('zip', ['-r', '-q', zip, ...lista], { cwd: RAIZ, encoding: 'utf8' });
  if (r.status !== 0) { console.error('No se ha podido crear el zip: ' + (r.stderr || r.error)); process.exit(1); }
  console.log(`${ruta(zip)}: ${kb(fs.statSync(zip).size)}`);
}
