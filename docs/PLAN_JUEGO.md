# Ecos de Luz · Plan de mejora del juego

Plan vigente desde el 3/11/2026. Sustituye a la fase F8 de [PLAN_FUSION.md](PLAN_FUSION.md), que queda como registro de cómo se unió la campaña.

**Equipo:** el usuario pide y aprueba; Claude dirige, decide lo técnico, implementa y prueba; ChatGPT investiga (con internet), diseña, escribe y programa piezas acotadas que Claude revisa. Cada fase se cierra con pruebas, capturas y la valoración del usuario antes de pasar a la siguiente.

**Base:** las tres investigaciones de ChatGPT en [docs/entregas_chatgpt/investigacion/](entregas_chatgpt/investigacion/): [01 movimiento](entregas_chatgpt/investigacion/01_movimiento.md), [02 combate](entregas_chatgpt/investigacion/02_combate.md) y [03 contenido](entregas_chatgpt/investigacion/03_contenido.md). Los códigos M01–M12 son del informe 01; los números citados son el punto de partida y se ajustan jugando.

## Lo que pidió el usuario (3/11)

1. Hikari camina y corre muy lento.
2. Su marcha se ve fea; las piernas fallan al girar bruscamente; la capa se estira como un resorte.
3. Escala casi todo; atraviesa algunos objetos: cada cosa debe ocupar su espacio.
4. Nado mejor y rápido, como correr, que gaste luz como el planeo.
5. Combate con sentido y mejor aspecto; más armas (katanas, arcos de luz) y magia (luz, oscuridad y otros elementos).
6. Armas y magia no se combinan: se equipa un solo tipo de ataque, y cada tipo tiene un enemigo difícil de enfrentar con él.
7. Enemigos más fluidos, con estilos de ataque y más dificultad: que no sea un juego fácil.
8. Mejorar historia, cinemáticas, misiones, recompensas, objetos, easter eggs, vestuario, poderes y calidad.

## Decisiones de dirección

| Tema | Decisión | Motivo |
|---|---|---|
| Velocidad | Explorar a **3,2 m/s**, correr a **6,8 m/s** (aceleración 18 m/s², frenado 24 m/s²). Con un enemigo fijado: 2,6 m/s y carrera a 5. | Las referencias del género y la talla de Hikari (1,15 m); el combate conserva su ritmo al fijar. |
| Nado | Normal a 3,6 m/s gratis; rápido con {correr} a **6,8 m/s** con el mismo coste que el planeo (10 luz/s, 6 con la mejora); sin recargar mientras dura. | Petición del usuario (M09). |
| Escalada | Solo lo marcado como trepable (rocas, acantilados y rutas pensadas); las casas, los templos y los muros no. Trepar exige intención: {saltar} hacia la pared. | Hoy se trepa todo lo que mide más de 1,75 m (M06). |
| Equipo de ataque | **Una ranura ofensiva**: un arma o una escuela de magia, nunca las dos. Se cambia fuera de combate (4 s sin peligro) y queda fijada dentro de un jefe. Moverse, esquivar, guardia, parada y planear valen con todo. | Petición del usuario (informe 02, 3.1). |
| Catálogo | **Armas:** Katana del Alba, katana veloz, naginata, odachi y arco de luz. **Magia:** luz, oscuridad, brasa (fuego), escarcha y viento. Cuatro movimientos cada uno; los básicos no cuestan luz y las técnicas sí. | Informe 02, 3.3–3.4. |
| Contrapesos | Cada estilo tiene un enemigo que lo complica, siempre vencible con ese mismo estilo; ninguna resistencia pasa del 50 %. | Petición del usuario; informe 02, 3.5. |
| Dificultad | Tres modos: **Sereno**, **Exigente** (por defecto) e **Intenso**. Más difícil = más presión y avisos más justos, nunca más vida a secas. | «No quiero que sea un juego fácil». |
| Animales | Se siguen calmando (su ánimo, no su vida, pilar 3). Las alternativas pacíficas de las secundarias del jabalí, la manada y el oso llegan en la fase 9. | Ya funciona; el informe 03 propone la mejora. |
| Origen de cada estilo | Cada capítulo entrega uno (tabla de la fase 6). La procedencia la escribe ChatGPT dentro del canon. | El informe 02 no inventa canon. |

**Aprobado por el usuario (3/11):** velocidad 3,2 / 6,8 m/s; la oscuridad es herencia de Tasogare (al deshacerse en el capítulo 5, Hikari aprende a usarla sin corromperse); un estilo nuevo por capítulo según la tabla de la fase 6; se empieza por la fase 1, con ChatGPT en la fase 8 en paralelo.

## Fases, de menor a mayor dificultad (la 11 es transversal)

Cada fase dice qué hace ChatGPT y qué hace Claude. «Listo» es la condición para cerrarla.

### Fase 1 · Moverse rápido sin atravesar nada · dificultad baja · **en curso (3/11)**

**Hecho:** velocidades 3,2 / 6,8 m/s con aceleración 18 y frenado 24 (arranque en 0,37 s, frenada en 0,28 s); 2,6 / 5 con un enemigo fijado; deslizar, derrape y esquiva reajustados a la carrera nueva; avance en subpasos de 0,12 m; `probar-fase1.mjs` 20/20 (paredes de 3, 10 y 20 cm contra carrera y esquiva con fotogramas de 17, 33 y 50 ms). **Auditoría de sólidos (ChatGPT, [informe](entregas_chatgpt/2026-11-03_auditoria_solidos.md)):** aplicadas S01–S52 (S36 parcial), D01 (galería del Pétalo ampliada a 13,8 × 10,8 y atril movido) y D03 provisional (casas, templos, pirámides y muros marcados como no escalables). Quedan para las fases 4 y 10: D02 (tejados y aleros), D04 (altar de Marea dentro del pabellón), D05 (rocas irregulares y qué formaciones se escalan), D06 (cuevas), D07 (partes móviles) y D08 (telas, barcas y bajos).

- **Claude:** velocidades nuevas (M01). Movimiento por subpasos de 0,12 m para que la velocidad no atraviese paredes (paso intermedio de M07). Auditoría de sólidos con `solidos.mjs` y `?solidos` en aldea, muelle, faro, santuarios, Duna y Yoake (M02).
- **ChatGPT:** recorrer el código de obra (04, 24, 33, 34, 61, 62) y entregar la lista de piezas sin sólido o con sólido mal medido, con el cambio exacto para cada una.
- **Listo:** recorridos y frenadas medidos; cero obra grande atravesable en las rutas; capítulos 1–7 en verde.

### Fase 2 · Nado rápido y planeo pulido · dificultad baja-media · **en curso (3/11)**

**Hecho:** nado normal a 3,6 m/s gratis y rápido a 6,8 m/s con {correr}, al mismo coste que el planeo; sin regeneración durante el sprint ni 0,75 s después; al agotarse se baja al nado normal y se rearma soltando {correr} y con 12 de luz; aviso único de poca luz; histéresis de entrada y salida del agua (0,75 / 0,55 m); corregido un fallo de fondo: dentro del agua también se aplicaba la regeneración de tierra. `probar-fase2.mjs` 14/14. **Pendiente:** poses de brazada (ChatGPT) y transiciones del planeo (M11).

- **Claude:** nado normal y rápido con coste de luz (M09); entrada y salida del agua sin parpadeo (histéresis de M10); transiciones de planeo a suelo y agua (M11).
- **ChatGPT:** poses de brazada normal y rápida para el esqueleto de Hikari (código acotado en 17, revisado por Claude).
- **Listo:** 100 → 50 de luz en 5 s de nado rápido; sin saltos al entrar o salir.

### Fase 3 · Marcha, giros y capa de Hikari · dificultad media · **en curso (3/11)**

**Hecho:**
- **Capa:** tela con paso fijo de 1/120 s, anclas interpoladas, 4 pasadas por paso (8 si el ancla va rápido) con barrido alterno, tope de estiramiento y anclaje detrás del torso; los sesgos de forma reescalados por segundo. El estiramiento máximo en carreras, inversiones de 180°, frenadas y saltos pasó de 108–467 % a 17–23 % (la capa ondea de reposo hasta ~18 %). Coste: de 1,2 a 1,5 ms por fotograma a 60 FPS.
- **Piernas:** el pie plantado se suelta si se cruza, se retuerce más de 40°, se estira o queda lejos; pivote de 0,1 s en inversiones; la rodilla conserva su plano; la cadera ya no se hunde de golpe. En cien giros bruscos los pies plantados cruzados bajan de 760 a 51 fotogramas de 6000, y la extensión máxima de 5,07 a 1,0 veces la pierna.
- **Marcha:** zancada alargada para 3,6 contactos por segundo al trote y 4,6 corriendo.
- `probar-fase3.mjs`. **Pendiente:** aprobación visual del usuario, poses de brazada de nado (ChatGPT) y revisar la marcha en cámara lenta.

- **Claude:** liberar y replantar los pies por distancia y torsión, giro en el sitio y pivote al invertir la carrera (M03); capa con paso fijo de 1/120 s, anclas interpoladas y tope de estiramiento del 3–5 % (M05).
- **ChatGPT:** diseño de la marcha: cuatro poses por ciclo, cadencias, rebote e inclinación para trote y carrera (M04), como tabla de números lista para `Hikari.MARCHA`.
- **Listo:** cien giros bruscos sin piernas cruzadas; capa sin resorte a 30, 60 y 120 FPS; **aprobación visual del usuario**.

### Fase 4 · Escalada con reglas y espacio entre personajes · dificultad media · **en curso (3/11)**

**Hecho:** se trepa solo con {saltar} mantenido 0,15 s contra una pared; la obra marcada (casas, templos, muros, columnas) no se trepa ni se aupa; aupar llega a 0,95 m; el terreno se trepa solo en Sakura, Kiri y Dunas (no en pradera ni lagos); Hikari rodea a los habitantes sin atravesarlos; ayuda de controles actualizada. `probar-fase4.mjs` 14/14. **Pendiente:** buceo dirigido (M10), permisos de pisar/aupar/trepar por pieza y rutas obligatorias de la auditoría (tabla de la sección 4 de la auditoría), y separación con animales.

- **Claude:** permisos en los sólidos (pisar, aupar, trepar) y terreno trepable por zonas (M06); separación suave con habitantes (M08); buceo dirigido (resto de M10).
- **ChatGPT:** inventario de rutas obligatorias por capítulo (pirámides, espiral, Kiri, Yoake) para que ninguna se rompa al prohibir trepar.
- **Listo:** casas y templos no se trepan; todas las rutas de los capítulos siguen accesibles.

### Fase 5 · Combate base que se entiende · dificultad media · **en curso (3/11)**

**Hecho (Hikari):** tres dificultades (Sereno, Exigente por defecto, Intenso) con selector en Ajustes, que cambian daño recibido, vida y equilibrio de los enemigos nuevos, ventana de parada (0,24 / 0,16 / 0,14 s) e invulnerabilidad de la esquiva (0,24 / 0,18 / 0,16 s); esquiva precisa y parada con luz desde el principio; memoria de órdenes más corta; pausa de parada de 80 ms; aviso de derrota que explica adónde vuelves. `probar-fase5.mjs` 11/11. **Hecho (ChatGPT, integrado por Claude):** director de combate y ajuste de las cuatro Sombras (`69-director-combate.js`, `35-sombras.js`; `probar-director.mjs` 48/48), y aviso previo del oni guardián al aparecer a 60 m. **Hecho (3/11, tarde):** el oni guardián solo despierta tras romper tres Sombras comunes (`SOMBRAS_CFG.practica`; la emboscada de la katana son tres) y salen dos consejos de una sola vez (esquivar al brillar los ojos; parada a tiempo); `probar-fase5` 13/13. **Hecho (4/11):** los gólems piden permiso al director (`jefe`, `zonaGrande`) y cada familia de gesto avisa con su sonido (`AVISO_SONIDO`: golpe, alzar, carga, barrido, soplo). **Pendiente:** avisos de forma en el suelo para los 14 ataques, cancelaciones, conectar los jefes al director y la valoración del usuario con teclado y mando.

- **Claude:** búferes, ventanas y cancelaciones; esquiva precisa y parada enseñadas desde el principio; equilibrio (postura) de enemigos y abertura al romperlo; director de combate (presupuesto de amenaza, separación de avisos); impacto (pausas de 30–90 ms, sacudida ajustable); los tres modos de dificultad.
- **ChatGPT:** fichas de comportamiento de las cuatro Sombras actuales (rastrera, escudo, lanzadora y oni) con avisos, tiempos y recuperación (informe 02, 3.6), y textos de la práctica de combate.
- **Listo:** arena de práctica con katana contra las cuatro Sombras; cada golpe recibido tiene un aviso reconocible; **valoración del usuario con teclado y mando**.

### Fase 6 · Estilo único y primeros estilos · dificultad media-alta · **en curso (3/11)**

**Hecho:** `70-impacto.js` (contrato común de daño; barrido, onda y pulso lo usan); ranura ofensiva única (un arma o estilo en `eq.arma`, sin cambio en combate); **arco de luz** y **escuela de luz** de ChatGPT (`71`, `72`; diseño y textos en [la entrega](entregas_chatgpt/2026-11-03_fase6_estilos.md)) conectados al combate con pose, marcha lenta al apuntar, coste de luz, escudo de luz como parada de pago y modelo en la mano. Pruebas: `probar-impacto`, `probar-estilos` (42, lógica) y `probar-fase6`. **Pendiente:** conseguirlos en la historia (`c1_forma_luz`, `c4_forma_arco`), práctica con los textos F6L/F6A, animación fina del tiro, haz de utilidad separado del ataque, contrato de impacto en jefes y Lumi/Luna, adaptar un gólem a cualquier estilo, catálogo de la tabla (viento, brasa, escarcha, oscuridad), valoración del usuario.

- **Claude:** ranura ofensiva única (estado, interfaz, guardado y cambio fuera de combate); separar el haz de utilidad (ilumina, no daña) del ataque; contrato de impacto común para Sombras, gólems, Tasogare, Lumi y la Luna; adaptar un gólem para que se venza con cualquier estilo.
- **ChatGPT:** módulo del **arco de luz** (apuntar, tensar y flechas con colisión) y de la **escuela de luz**, con los cuatro movimientos de cada uno; diseño y textos de cómo se consigue cada estilo.
- **Reparto propuesto de estilos por capítulo** (la historia de cada uno la escribe ChatGPT):

| Capítulo | Estilo nuevo | Su contrapeso |
|---|---|---|
| 1 · Pétalo | Katana del Alba y escuela de luz | Sombra escudo; Sombra espejo |
| 2 · Marea | Naginata (adelantada) y viento | Rastrera; oni anclado |
| 3 · Duna | Brasa y odachi (desafío opcional) | Sombra de escoria; Sombra alada |
| 4 · Yoake | Arco de luz | Sombra escudo (flanqueo) |
| 5 · Tasogare | Oscuridad (lo que deja al deshacerse) | Sombra devoradora |
| 6 · Kiri | Escarcha y katana veloz | Lanzadora de escarcha; oni |

- **Listo:** el gólem elegido se vence con katana, naginata, arco y luz; no hay forma de usar arma y magia a la vez.

### Fase 6B · Guardianes del Faro (idea del usuario, 3/11) · **en curso**

**Hecho:** textos de ChatGPT aplicados (pistas por capítulo, frases, despedidas, sustituciones CPM07…C7B04, variantes fuera de orden); solidez solo en combate con formación de 0,8 s y empuje sin saltos; purificación de 3 s y liberación de 16 s con un solo ascenso; dones de nado, planeo y fogatas; `probar-guardianes` 5/5 y batería en verde. **Pendiente:** ramal visible del sello en la subida del Musgoso y recogidas cerca de la ruta, pista visual (relieves, herramientas, nudo) en cada arena, aspecto traspasable de los bordes, detalle de capa del Cerezo y consulta del esquema de Arena en el diario, retirar el haz como único arma contra los gólems (fase 6), valoración del usuario.

Los cinco gólems son antiguos Guardianes del Faro (regla 28 del guion base; diseño completo en [la entrega](entregas_chatgpt/2026-11-03_golems_guardianes.md)). **Decisiones de Claude (delegadas):** sí fueron personas; Hikari recibe solo un don pequeño y la luz asciende una única vez; se aprueban Vera, León, Inés, Bruno y Alba; Tasogare los conocía y silenció sus denuncias; las cuatro familias se conservan solo como servicio de las luces de los santuarios (sin «fragmentos» antes de la fractura); el Musgoso sigue en el rescate con un ramal del sello visible sobre la subida. **ChatGPT:** matriz de textos (pistas por capítulo, frases de liberación, sustituciones CPM07, C5G09…) y la ficha de canon. **Claude:** solidez solo en combate con formación segura, cinco liberaciones de 22 s con un solo ascenso, dones y guardado, ramal del Musgoso, cola de avisos. **Listo:** ningún gólem se atraviesa con Hikari dentro al despertar; cada liberación se entiende sin sonido; los dones no son necesarios para ninguna ruta principal.

### Fase 7 · Catálogo completo y enemigos nuevos · dificultad alta

- **Claude:** integrar odachi, katana veloz y las escuelas de oscuridad, brasa, escarcha y viento; zonas y estados con sus límites; Sombra alada; adaptar los demás gólems, Tasogare, las ataduras de Lumi y la Luna Roja al estilo único.
- **ChatGPT:** módulos de las variantes de Sombra (espejo, devoradora, escoria, lanzadora de escarcha y oni anclado) siguiendo el patrón de `35-sombras.js`, y los movimientos de cada escuela.
- **Listo:** cada jefe se vence con cada estilo; cada estilo tarda un 25–60 % más contra su contrapeso; 60 FPS con 6 enemigos y 12 proyectiles.

### Fase 8 · Historia, escenas y recompensas · dificultad baja-media (en paralelo desde la fase 2) · **en curso (3/11)**

**Hecho:** diseño completo de ChatGPT ([escenas y recompensas](entregas_chatgpt/2026-11-03_fase8_escenas_y_recompensas.md)); bloques 1 y 2 aplicados por ChatGPT e integrados por Claude: las cinco secundarias reescritas como situaciones (`chispas`, `te`, `pescador`, `amigos`, `kiri`), cierre automático de `chispas`, caricias a tres animales distintos, escena breve del té, observación de Kiri y las once chispas recolocadas con las cuentas de las dos compras (migración de partidas guardadas incluida). `probar-secundarias.mjs` 19/19 y 37/37 en modo lógica. **Pendiente:** gesto de Kaito con la caña, banco y tazas del té, focos de Kiri, bloques 3 a 12 (cola de rótulos, retimado de escenas, disco del mural, mantos, panorámica de Yoake, Lumi posada).

- **ChatGPT:** revisar planos y duración de las cinemáticas (causa y efecto visibles, 12–25 s en transiciones); mejorar `te`, `pescador`, `amigos`, `chispas` y `kiri`; economía de motas (primera compra en el capítulo 1); las tres primeras sorpresas: el disco completo del mural, la ruta vista desde el mirador y Lumi posándose tras el epílogo.
- **Claude:** cola de rótulos que respeta las escenas tristes; presentación de colecciones; vista previa de los mantos en el zurrón; separar el aspecto del manto de su efecto; los easter eggs.
- **Listo:** ningún rótulo pisa una escena; cada recompensa se entiende al recibirla.

### Fase 9 · Poderes, vestuario y alternativas · dificultad alta

- **ChatGPT:** diseño de los poderes Pulso de lectura, Haz que sostiene y Planeo impulsado, con sus salas de prueba; seis mantos con identidad visual; alternativas pacíficas para Colmillo, la manada y Kuma.
- **Claude:** implementarlos sin abrir el Velo ni romper rutas; mantos sin programas de shader nuevos.
- **Listo:** cada poder abre un rincón opcional; ningún camino principal depende de un poder opcional.

### Fase 10 · Colisión completa y animación por clips · dificultad alta, solo si hace falta

- Barrido de cápsula completo (M07) si los subpasos de la fase 1 no bastan; clips nuevos de locomoción (M12) si la marcha procedural no alcanza la calidad que pide el usuario.

### Fase 11 · Revisión completa del juego · transversal, se cierra al final

Revisión de principio a fin de lo ya hecho y de lo nuevo, con teclado y con mando y en las tres calidades. Empieza con el incidente que reportó el usuario el 3/11 y crece con cada fase.

**Incidente 2 · «El juego se reinicia solo al iniciar, en la portada y en el prólogo» (4/11, video del usuario):** no era el navegador ni una caída: el usuario juega con Live Server, que recarga la página al cambiar cualquier archivo, y las pruebas escribían capturas en el proyecto. Arreglo: `.vscode/settings.json` (Live Server ignora todo), capturas borradas al terminar y `Diagnostico` (76) para reconocer una caída real. Pendiente de confirmar por el usuario jugando con el equipo quieto.

**Incidente 1 · «Al llegar al templo de los cerezos el juego se reinicia y me saca»** (capítulo 1, Santuario del Pétalo).
- **Qué se comprobó (3/11):** llegar caminando, con el bucle real, con viaje rápido desde el mapa y con pelea normal; en ningún caso hay cuelgue, recarga de la página ni errores en la consola. El código no recarga la página en ningún momento salvo «Nueva partida», «Guardar y salir» y el cambio de calidad.
- **Causa más probable:** con la katana en la mano, en el camino al templo aparece el **oni guardián** (ficha `oni` de `35-sombras.js`). Cada mazazo quita 18 de vida de 100: con Hikari quieta cae en unos 25 s. Al caer, la pantalla se funde a negro, pierde una llama y reaparece lejos, en el último punto de luz o en el lugar descubierto más cercano (`morir()` en `10-juego.js`). Desde fuera eso parece un reinicio.
- **Qué falla de verdad:** un capítulo 1 con un enemigo élite que se encuentra sin enseñanza previa, y una derrota que no se explica.
- **Arreglo:** la fase 5 (avisos claros, postura y práctica) y esta fase: pantalla de derrota propia que diga qué pasó y adónde vuelve; el oni del capítulo 1 aparece tras la práctica; el aviso de «guarda el santuario» se ve antes de entrar en su radio.
- **Pendiente del usuario:** si lo que vio fue otra cosa (pantalla negra sin volver, vuelta a la portada, bloqueo del navegador), decirlo con el navegador usado y con qué se abre el juego.

**Lista de revisión (se completa fase a fase):**
1. Recorrer los capítulos 0–7 y el epílogo sin atajos, caminando, anotando tirones, atascos y textos que no se entienden.
2. Cada derrota posible (oni, gólems, Tasogare, Lumi, Luna Roja, caídas, ahogamiento): qué muestra y adónde vuelve.
3. Guardado y carga en cada capítulo; partidas antiguas.
4. Cámara dentro de edificios, cuevas y escenas.
5. Mezcla de audio en cada región y en combate; que nada suene tapado.
6. Rendimiento con el portátil enchufado en las tres calidades; percentiles y tirones.
7. Diagnóstico: guardar en el navegador los últimos errores y pérdidas de contexto gráfico para poder leerlos si algo falla de verdad.
8. Revisar el texto de ayuda de controles tras cambiar velocidades, estilos y dificultad.

## Validación con personas

Al cerrar las fases 3, 5, 7 y 9: partida del usuario con teclado y con mando, y, cuando se pueda, cinco personas que no conozcan el guion (preguntas del informe 03, 3.10). Medir el rendimiento con el portátil enchufado.

## Pendiente heredado

De PLAN_FUSION: estética de Hikari y Tasogare (fases 3 y 9), dirección de escenas (fase 8), pruebas con personas y rendimiento enchufado (validación).
