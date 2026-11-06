# Tasogare · Guardián del Ocaso

Forma normal rediseñada a partir de la hoja de ocho vistas del usuario. El juego y los recursos exportados comparten una fuente geométrica: [48-tasogare-modelo.js](../../js/48-tasogare-modelo.js). La animación del juego continúa en [36-tasogare.js](../../js/36-tasogare.js).

## Entrega

| Archivo | Contenido |
| --- | --- |
| `tasogare.glb` | Personaje, materiales PBR, esqueleto y nueve animaciones |
| `tasogare.blend` | Fuente Blender editable con mallas, armadura de 54 huesos, nueve acciones NLA y atlas empaquetado |
| `tasogare.gltf` | Fuente glTF con geometría y textura incrustadas |
| `hoja-del-ocaso.glb` | Arma independiente, con la misma fractura y escala que la del personaje |
| `tasogare-atlas-1024.png` | Atlas principal; tejido y desgaste fino, combinado con colores de vértice |
| `referencia-ocho-vistas.png` | Hoja original del usuario, también empaquetada en el `.blend` como referencia |
| `visor.html` | Giro, zoom, nueve clips, secuencia de ataque, emisión, partículas y oscuridad |
| `visor-autonomo.html` | El mismo visor con el GLB y su cargador incrustados: abre directamente en el navegador sin servidor; Three.js requiere internet |
| `informe.json`, `validacion-gltf.json`, `validacion-arma.json` | Presupuesto y validación de ambos GLB |
| `revision-animaciones.json`, `revision-juego.json` | Revisión del rig, las poses y la continuidad del diseño |
| `revision-narrativa-combate.json` | Prólogo y estados del combate, con anticipaciones y parada |
| `revision-blender.json` | Fuente Blender vuelta a abrir y comprobada |

La fuente Blender se genera desde la misma geometría y las mismas animaciones del GLB, sin reconstruirla a partir de una imagen. Conserva los pesos, las piezas y las acciones para editar. Las pistas NLA quedan silenciadas al abrir para mostrar la pose de referencia; activa la acción que quieras revisar. El archivo usa Blender 4.5 LTS.

## Diseño y presupuesto

- **2,40 m hasta la cabeza**, 2,58 m con capucha; metros, Y vertical y frente hacia +Z en glTF. Blender convierte la vertical a Z.
- **19 964 triángulos** en la entrega completa, incluida la espada, la capa y la luz de la animación final. El juego no necesita la pequeña esfera de entrega de luz del visor.
- **54 huesos:** 17 corporales, cuatro de mangas, ocho de faldones y 25 de capa.
- **Diez materiales compartidos** y atlas principal de 1024 × 1024. Marfil ennegrecido, oro envejecido, acero oscuro, tejido negro y brasa controlada.
- El **ojo izquierdo del personaje** es el rojo: coordenada X positiva, a la derecha al observarlo de frente. El otro ojo permanece oscuro. La máscara no tiene rostro humano, piel ni cabello visibles.
- La grieta, los desgarros y los dientes de la espada se construyen desde datos fijos de `TASOGARE_DISENO`. Girar el modelo conserva exactamente su lado y sus roturas.
- El kimono tiene faldones separados; las mangas y faldones tienen huesos propios. Capa, máscara, armadura y arma son piezas separadas en la entrega.

## Animaciones

| Clip | Comportamiento |
| --- | --- |
| `Reposo` | Respiración y balanceo suave |
| `Caminar` | Marcha en el sitio con mangas y faldones |
| `Giro` | Media vuelta sobre el sitio |
| `Preparar_ataque` | Anticipación de 0,8 s sin daño |
| `Corte` | Corte de 0,4 s; separado de la preparación |
| `Recuperacion` | Regreso a guardia |
| `Recibir_dano` | Reacción y recuperación |
| `Abrir_capa` | Apertura de la capa como alas oscuras |
| `Entregar_luz` | Se arrodilla, ofrece la luz y se apaga el ojo |

Los clips son portables y no aplican daño. En el juego se conservan las reglas y tiempos de `DUELO`: aviso de 0,62 s, aviso de combo de 0,42 s y corte de 0,25 s. La reacción a parada, pulso y rotura de guardia usa la nueva pose `recibir`.

El juego mantiene la capa física. La entrega GLB anima la capa mediante huesos. La Hoja del Ocaso conserva su fractura incluso en el prólogo: `hojaEntera()` prepara un fragmento narrativo oculto y `romperHoja()` lo desprende sin completar ni cambiar la silueta del arma normal.

## Controles y anclas

En el juego:

```js
Tasogare.efectos({ ojo: 1, filo: 1, brasa: .5, brasas: 1, oscuridad: 0 });
Tasogare.abrirAlas(true);
Tasogare.pose('recibir', 8);
```

Los tres primeros valores regulan emisión; `brasas` regula partículas JavaScript y `oscuridad` oscurece el material del personaje. `Tasogare.brillo(k)` conserva el control general usado por la historia. El visor incluye controles equivalentes para revisar el GLB.

Materiales de emisión: `Emision_ojo_izquierdo`, `Emision_filo`, `Emision_brasa` y `Capa_carbon_brasa`. Se pueden ajustar por separado desde JavaScript mediante `emissiveIntensity`. Las brasas no están modeladas como piezas del personaje: se generan como partículas.

Anclas: `Ancla_espada` y `Emisor_brasas`. `Hoja_del_Ocaso` es un grupo separado unido a la mano derecha. `Colision_capsula`, `Volumen_dano` y `Volumen_golpe_espada` describen cápsula y zonas de combate en `userData`; son metadatos para un controlador, no un motor de física ejecutable. La lógica de colisiones y daño del juego sigue siendo la existente.

La forma gigante permanece separada en `44-duelo-gigante.js`; se corrigió su ojo y la orientación de su grieta al lado izquierdo para conservar continuidad. **Esta entrega no convierte la plantilla normal en un gigante:** su rediseño requiere la hoja propia indicada por el usuario.

## Revisar y regenerar

Abre `visor-autonomo.html` directamente en el navegador. Para trabajar sobre la versión modular, sirve la raíz por HTTP y abre `/modelos/tasogare/visor.html`. El visor usa Three.js r128; arrastra para girar y usa la rueda para acercar. El botón «Ver ataque completo» reproduce preparación, corte y recuperación en orden.

```powershell
npm.cmd install --prefix herramientas
node herramientas/exportar-tasogare.mjs --blender 'C:/ruta/a/blender.exe'
```

El script valida los GLB, vuelve a cargarlos, muestrea las deformaciones, guarda ocho vistas, comprueba el prólogo y el combate y genera y vuelve a abrir el `.blend`. La fuente del horneado está en `herramientas/tasogare-portable.js`; la preparación de Blender, en `herramientas/fuente-tasogare.py`.

**El ZIP del juego no se actualiza.**
