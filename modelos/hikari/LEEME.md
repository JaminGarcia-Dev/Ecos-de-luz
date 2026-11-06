# Hikari · modelo 3D para web

Rediseño construido a partir de la hoja de ocho vistas proporcionada por el usuario. La interpretación es estilizada y está hecha con geometría editable; conserva la máscara sin boca, nariz, orejas humanas ni cabello, la capucha marfil, los ribetes dorados, el índigo, la capa carmesí–ámbar y las tres llamas verticales.

## Archivos

| Archivo | Uso |
| --- | --- |
| `hikari.glb` | Modelo portable con materiales PBR, atlas incrustado, esqueleto y ocho animaciones |
| `hikari.gltf` | Fuente glTF editable, con datos y textura incrustados; se puede importar en Blender |
| `hikari-atlas-1024.png` | Atlas de tejido de 1024 × 1024; la paleta y los adornos usan también colores de vértice |
| `visor.html` | Inspección con giro, animaciones, llamas y máscara agrietada |
| `frente.png`, `perfil.png`, `espalda.png`, `tres-cuartos.png` | Capturas del GLB vuelto a cargar |
| `caminar.png`, `planear.png`, `mascara-agrietada.png` | Revisión de deformaciones y variante de máscara |
| `informe.json` | Presupuesto real de geometría, huesos, materiales y clips |
| `validacion-gltf.json` | Resultado del validador de Khronos |
| `revision-animaciones.json` | Revisión de las ocho animaciones después de volver a cargar el GLB |

La fuente de construcción está en [47-hikari-modelo.js](../../js/47-hikari-modelo.js). El rig portable y el horneado están en [hikari-portable.js](../../herramientas/hikari-portable.js). Son las fuentes originales editables de esta entrega; no se ha creado un archivo `.blend`.

## Especificación

- **Escala:** metros, eje Y vertical, frente hacia +Z; cuerpo de aproximadamente 1,15 m y capucha de 1,31 m.
- **14 628 triángulos** incluyendo alas y grieta; **51 huesos**, de los cuales 21 controlan el cuerpo, 20 la capa y 10 las cintas. Nueve materiales compartidos, sin depender de shaders propios del juego.
- **Clips:** `Reposo`, `Caminar`, `Correr`, `Saltar`, `Caer`, `Aterrizar`, `Despegar` y `Planear`. Locomoción en el sitio: el controlador mueve al personaje.
- `Llama_1`, `Llama_2` y `Llama_3` son nodos separados sobre la capa, controlables mediante `visible`.
- `mascara_marfil` contiene la máscara intacta; `mascara_agrietada` añade la fractura sobre ella. Se activa escalando esa pieza a 1 y se desactiva a 0,0001. Así no se duplica toda la piel ni aparecen superficies superpuestas.
- `Ala_I` y `Ala_D` se abren en los clips de vuelo. Capa y cintas tienen huesos con pesos interpolados.
- Anclas separadas: `Ancla_arma_D`, `Ancla_arma_I`, `Ancla_farol` y `Ancla_espalda`. Las armas y el farol opcionales siguen siendo piezas del juego, en `20-armas.js` y `25-gente.js`; no están duplicados en este GLB.
- `Colision_capsula` contiene metadatos de una cápsula de radio 0,16 m y altura total 1,15 m. Es una indicación para un controlador físico; glTF no ejecuta colisiones.

En el juego se construye la misma geometría desde JavaScript y se conserva la animación procedural, el apoyo de pies sobre el terreno y la tela simulada. El GLB es la entrega portable: lleva poses horneadas y tela animada mediante huesos. No reproduce la simulación física del valle ni sustituye su controlador de colisiones.

## Revisar y regenerar

Desde la raíz del proyecto, inicia un servidor HTTP, por ejemplo `python -m http.server 8000`, y abre `http://localhost:8000/modelos/hikari/visor.html`. El visor usa Three.js r128 desde CDN; el juego no carga el exportador ni el visor.

Para regenerar los recursos y sus comprobaciones:

```powershell
npm.cmd install --prefix herramientas
node herramientas/exportar-hikari.mjs
```

La exportación usa Edge y las herramientas oficiales de Three.js r128 guardadas en `herramientas/vendor`. No actualiza ningún ZIP.
