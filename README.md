# Ecos de Luz — Beta jugable

**Estado: 2 de noviembre de 2026.** Aventura de exploración y acción con estética japonesa. Una sola campaña, desde el prólogo hasta los capítulos 1–7, con epílogo jugable en Yoake y créditos. Hecho con **Three.js r128**, HTML y JavaScript, sin compilación.

## Campaña única

Rige el [canon 2.0](docs/PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md): la Luna Roja suplanta a la Dorada cautiva. Tasogare es el padre de Akari y conoce la suplantación. Lumi informa a la red lunar. El final enfrenta a Hikari/Akari con la Luna Roja en cuerpo físico. Liberar a la Dorada no resucita a nadie.

| Capítulo | Nombre en CAPITULOS | Apertura de regiones | Recorrido |
| --- | --- | --- | --- |
| Prólogo / 0 | La noche que rompió el faro | Pradera y Sakura | Rito interrumpido, Lumi, Cazador, Hinode, Tsuru, hoja de Nao y registro exterior del Pétalo. |
| 1 | El pueblo que llama honor a la pérdida | Sin región nueva | Katana del Alba, tres semillas, Gólem del Cerezo, faroles y primer recuerdo. |
| 2 | La orilla de los que faltan | Lagos de Marea | Kaito y Rui; emisor de la gruta, Sayo y conejo; Gólem de Marea, perlas y segundo recuerdo. |
| 3 | Los nombres bajo la arena | Dunas del Sol Dormido | Archivo de Duna, dos Lunas, complicidad de Tasogare; Gólem de Arena, seis orbes y tercer recuerdo. |
| 4 | Fuera del Velo | Isla de Yoake | Asedio de Hinode, pérdida de Tsuru, travesía y tareas de Yoake; regreso y captura de Momo. |
| 5 | Lo que un padre llama salvar | Sin región nueva | Gólem Musgoso, registros de Taiyō, duelo de Tasogare en plaza y espiral; rescate de Momo. |
| 6 | La memoria que no devuelve a nadie | Cumbres de Kiri | Gólem de Escarcha, cristales, identidad de Akari, registro de Kiri y tres ataduras de Lumi. |
| 7 | La luz que ya no se entrega | Sin región nueva | Evacuación y asedio de la plaza del faro; Luna Roja física en tres etapas; liberación de la Dorada. |

El epílogo jugable **El amanecer** forma parte del capítulo 7: registros de Taiyō en Hinode, viaje a Yoake sin cielo rojo, memoria con Sayo y Momo, mirador y créditos. Se puede seguir explorando después. El Velo impide entrar en regiones que aún no abrió la historia. Sakura ya figura abierta en el prólogo para llegar al registro; sus sistemas de exploración se activan en el capítulo 1.

## Cómo jugar

- **Archivo único:** genera `dist/ecos-de-luz.html` con `node herramientas/empaquetar.mjs` (ver [Empaquetado](#empaquetado); `dist/` no se sube al repositorio) y ábrelo (necesita internet para Three.js y las fuentes). Pesa **2207 KB**, redondeados con 1024 bytes por KB; tamaño leído: **2 084 182 bytes**.
- **Carpeta modular:** abre `index.html` con conexión. Para uso sin internet, lee `vendor/LEEME.txt`.
- **Guardado único:** `ecos3_luna_partida`. Las partidas antiguas `ecos2_partida` permanecen en el navegador, pero ya no se leen ni se borran. La portada muestra el capítulo guardado.
- **Práctica de combate:** desde portada, niveles 1/5/10 y estado temporal. No guarda, borra ni avanza la campaña.
- **Lectura y escenas:** usa las acciones de avanzar, repetir o saltar que muestra la interfaz; {menu} abre la pausa. Las conversaciones permiten repetir líneas o saltar con {omitir}.
- Navegador moderno con WebGL2 (Chrome, Edge, Firefox). Se recomienda GPU dedicada o integrada reciente.
- Ajustes → *Calidad* (alta / media / baja) se aplica al recargar la página. Si el valle no llega a 45 FPS, la portada propone bajar la calidad.
- Ajustes incluye volumen general, música, efectos y ambiente, tamaño de subtítulos, HUD dinámico y vibración. **Solo subtítulos, sin voz de prueba.**
- Velocidades vigentes: **3,2 m/s al andar y 6,8 m/s al correr** (2,6 y 5 con un enemigo fijado), según `MOV.vel` de [18-movimiento.js](js/18-movimiento.js).

## Controles

Abre {menu} → **Controles** para consultar las asignaciones de teclado, ratón y mando. Los textos del juego muestran la tecla o el botón según el dispositivo usado. Aquí se nombran las acciones entre llaves.

| Acción | Uso |
| --- | --- |
| {mover} · {correr} | Caminar o correr |
| {saltar} | Saltar; mantener en el aire para planear y gastar luz |
| {agacharse} | Agacharse o bucear; al correr permite deslizar |
| {mover} contra una pared | Trepar; soltarse con {saltar} o {agacharse} |
| {atacar} | Combo del arma; mantener y soltar para el golpe cargado cuando está disponible |
| {esquivar} · {atacar} | Esquivar y golpear al terminar |
| {guardia} | Mantener la defensa; alzarla justo antes del golpe para parar |
| {fijar} | Fijar objetivo |
| {haz} | Apuntar el haz de luz |
| {interactuar} | Hablar, leer o acariciar; mantener para canalizar o crear un punto de luz |
| {pulso} | Pulso de luz cuando está disponible |
| {lumi} | Pedir la guía de Lumi |
| {menu} | Pausa y acceso a controles y ajustes |

El menú de controles incluye también cámara, objetos rápidos, cambio de arma, misiones, Zurrón y mapa. Las habilidades de nivel se detallan en la sección de progresión.

Conecta un mando estándar y usa cualquier botón para activar sus indicaciones. La vibración depende del navegador. Si el visor embebido bloquea el mando, abre la carpeta modular en el navegador. Si no permite capturar el ratón, arrastra con el botón izquierdo para girar la cámara.

## Reglas del mundo

- **Hay Sombras y Cazadores.** Son amenazas distintas de la fauna. Los animales huidizos escapan; los defensivos (jabalí, lobo, oso, escorpión, cangrejo) **solo atacan si los golpeas** y avisan con un anillo rojo.
- Los animales **no mueren**: al agotar su ánimo se calman, dejan una ofrenda y te dan experiencia.
- Usa {agacharse} y quédate quieto cerca de un animal huidizo: puede acercarse para que lo acaricies con {interactuar}.
- Si tu vida llega a 0 te desmayas y reapareces con toda la vida en tu último **punto de luz** o, si no has creado ninguno, en el lugar con viaje rápido más cercano.

## Personajes y presentación

Hikari lleva una túnica marfil sobre calzas índigo, máscara marfil y oro y una capa carmesí, ámbar y oro de borde claro. La capa tiene un bajo curvo, conserva su volumen al moverse y se abre al planear; el trote tiene menos rebote y el vuelo un balanceo suave. Los habitantes conservan sus kimonos y colores, con ribetes claros y gestos con distintas transiciones para cabeza, brazos y torso. La luz de relleno y el contorno suave ayudan a leer las siluetas en sombra; Tasogare usa un perfil oscuro de contorno rojo. Números en `ASPECTO_PERSONAJES`, `CAPA`, `MARCHA` y `GENTE.animacion`.

Rediseño de la hoja de ocho vistas: capucha marfil con punta posterior, máscara sin rasgos humanos, broche, guantes y botas con oro, cintas turquesas y tres llamas verticales independientes. Fuente geométrica en `js/47-hikari-modelo.js`, cargada antes de `17-hikari.js`. Entrega [GLB y fuente editable](modelos/hikari/LEEME.md): 14 628 triángulos, 51 huesos, atlas 1024 × 1024 y ocho clips; [visor 3D](modelos/hikari/visor.html). El juego conserva la animación procedural y la tela física; el GLB lleva animaciones horneadas y huesos para la tela.

Reparto y descripciones: [PERSONAJES.md](docs/PERSONAJES.md). Capturas y revisión de poses: `node herramientas/personajes.mjs` (opciones `--raiz`, `--salida` y `--calidad`).

Tasogare también se reconstruye desde su plantilla: ojo izquierdo rojo, máscara marfil ennegrecida, armadura de láminas, kimono negro, capa desgarrada y Hoja del Ocaso con fractura fija. [GLB, fuente Blender y guía](modelos/tasogare/LEEME.md), con 19 964 triángulos, 54 huesos y nueve animaciones; [visor de Tasogare sin servidor](modelos/tasogare/visor-autonomo.html). La forma gigante de Tasogare se retiró; su duelo vigente ocurre en el capítulo 5.

## Mundo

La isla principal conserva cinco regiones: Pradera del Alba, Bosque de Sakura, Cumbres de Kiri, Dunas del Sol Dormido y Lagos de Marea. Se abren según la tabla de capítulos. Yoake está disponible desde el capítulo 4, fuera del Velo. Tiene embarcadero, refugio, huertos, cisterna, torre de señal y mirador. Aparece en el minimapa y en un recuadro del mapa grande.

En la isla principal hay 18 lugares registrados, 13 con viaje rápido, dos cuevas, ocho murales con capas ocultas, seis ecos, ocho cofres y diez espíritus del viento. El generador intenta colocar 80 chispas; su cantidad efectiva queda **por medir**. Cinco corrientes de aire ayudan a planear; tres forman la ruta a la cima de Kiri. El reto de cada santuario deja un fragmento en el altar: Hikari lo integra al tocarlo con {interactuar}. Los fragmentos conservan sus recuerdos. No se llevan a los pedestales del faro.

## Gólems guardianes

Los cinco gólems se purifican durante los capítulos. Cada uno despierta al completar su objetivo de exploración:

| Gólem | Bioma | Cómo se despierta | Cómo se purifica |
|---|---|---|---|
| Musgoso | Pradera del Alba | 3 Piedras Ancestrales en el Altar de Musgo | Arranca su musgo (en fase 2 lo cura) y haz que se estrelle contra un pilar |
| Escarcha | Cumbres de Kiri | Enciende las 4 Balizas de Hielo | Golpea 3 veces su núcleo azul tras las estacas; en la ventisca, quédate junto a una fogata encendida; en fase 3 rompe su armadura cuerpo a cuerpo |
| Arena | Dunas del Sol Dormido | 3 Glifos del Sol (cimas de las pirámides) en las columnas rotas | Rompe sus dos cadenas; evita la tormenta y las arenas movedizas |
| Marea | Lagos de Marea | La Perla de Marea (fondo de la laguna) en el Estanque Sagrado | Destruye sus dos brazaletes; en fase 2 solo ellos son vulnerables; en el diluvio sube a las plataformas |
| Cerezo | Bosque de Sakura | 3 Semillas Espirituales en los cerezos marchitos | Quema su manto de hojas con el haz y rompe sus cristales flotantes |

Reglas comunes: cada ataque se anuncia con una marca roja en el suelo (y los que se pueden parar, con un destello en la mano); los golpes pesados y las paradas gastan su **equilibrio** (barra fina bajo la de oscuridad) y, al agotarlo, quedan aturdidos; cambian de fase al 66 % y al 33 % de su oscuridad, el pulso interrumpe los ataques interrumpibles y, cuando quedan **aturdidos**, su núcleo brilla: apunta el **haz de luz** para purificarlo más rápido. Los gólems no mueren: se purifican. Después, mantén {interactuar} junto a su núcleo para **canalizar** la luz y recuperar toda tu vida. Purificar a los cinco da el **Manto del Guardián**. Si caes, el combate se reinicia y reapareces con toda la vida en tu último **punto de luz** (mantén {interactuar} en una linterna de piedra para crearlo).

## Otros combates de la historia

- **Capítulo 4:** asedio de Hinode durante la Noche Roja.
- **Capítulo 5:** duelo con Tasogare en la plaza y subida por la espiral en sombra, iluminando plataformas con {haz}. Un Cazador apaga su luz.
- **Capítulo 6:** tres ataduras de Lumi: círculo, dos barras y triángulo.
- **Capítulo 7:** asedio de la plaza del faro para evacuar a los niños. Después, Luna Roja física en tres etapas: anclajes, cuerpo y máscara. Al vencerla, se canaliza para liberar la luz cautiva.

## Progresión

Nivel máximo 10. Habilidades: nivel 2, doble salto; 3, pulso de luz; 4, planeo mejorado; 5, golpe cargado; 7, esquiva perfecta. La Katana del Alba se recupera en el capítulo 1. Yuki entrega la Naginata de Escarcha al terminar `oso`. La antigua forja de la Odachi Solar y la misión de caza se retiraron; la definición del arma que queda en el código no acredita una vía de obtención vigente.

Se mantienen los mantos del Alba, Sakura, Marea, Escarcha, Solar y del Guardián; Máscara de kitsune; cocina en el Zurrón y mejoras de altar con motas. Los animales se calman y los gólems se purifican. Las personas que mueren se deshacen en luz.

Se conservan los puntos de luz como punto de reaparición, la canalización, la recuperación completa al canalizar tras purificar un gólem y la pausa de regeneración de vida durante los combates de jefe. La luz rescatada permite mejorar capa, vida y efectos del manto en los altares.

## Misiones

| Capítulo | ID | Misión principal | Dificultad en código |
| --- | --- | --- | --- |
| 0 | `inicio_luna` | Un nombre entre las ruinas | Fácil |
| 0 | `registro_petalo` | Los nombres de la ofrenda | Fácil |
| 1 | `c1_petalo` | El pueblo que llama honor a la pérdida | Media |
| 2 | `c2_marea` | La orilla de los que faltan | Difícil |
| 3 | `c3_duna` | Los nombres bajo la arena | Difícil |
| 4 | `c4_velo` | Fuera del Velo | Épica |
| 5 | `c5_tasogare` | Lo que un padre llama salvar | Épica |
| 6 | `c6_kiri` | La memoria que no devuelve a nadie | Épica |
| 7 | `c7_luna` | La luz que ya no se entrega | Por medir: sin etiqueta en DIF (valor 4) |
| 7 · epílogo | `ep7_amanecer` | El amanecer | Fácil |

| ID | Secundaria | Capítulo de oferta | Dificultad | Condición y cierre |
| --- | --- | --- | --- | --- |
| `chispas` | Luz dispersa | 1 | Fácil | Yuki; seis chispas |
| `amigos` | Amigos del bosque | 1 | Fácil | Yuki; acariciar animales tres veces |
| `te` | Té para la abuela | 1 | Fácil | Tsuru; Momo hereda tras su pérdida |
| `murales` | Recuerdos de piedra | 1 | Media | Momo; ocho murales, cierre desde el 6 |
| `callan` | Lo que callan las piedras | 4 | Media | Tener el Farol de Tsuru; ocho marcas ocultas, cierre desde el 6 |
| `ecos` | Ecos del pasado | 1 | Media | Taiyō; seis ecos, cierre desde el 6 |
| `viento` | Espíritus del viento | 1 | Difícil | Momo; diez espíritus, cierre desde el 6 |
| `jabali` | El jabalí furioso | 1 | Media | Yuki y Katana del Alba; calmar a Colmillo |
| `gruta` | La gruta de las luciérnagas | 1 | Media | Descubrir la gruta; cinco luces |
| `pescador` | La caña de Kaito | 2 | Media | Kaito, después de hablar de Rui (paso 1 de c2_marea) |
| `kiri` | Cumbre de Kiri | 6 | Difícil | Taiyō; alcanzar la cima |
| `manada` | La manada blanca | 6 | Difícil | Descubrir Escarcha; calmar a tres lobos |
| `oso` | El oso del glaciar | 6 | Épica | Completar manada; calmar a Kuma y entregar a Yuki |

La oferta indica el primer capítulo posible. Las colecciones de toda la isla esperan a Kiri para completarse. Momo hereda el té de Tsuru; sus encargos esperan durante su captura y se entregan en Yoake tras el rescate. Los destinos siguen la ubicación vigente del habitante. Fuente implementada: [68-secundarias.js](js/68-secundarias.js); la [entrega narrativa](docs/entregas_chatgpt/2026-11-02_secundarias.md) conserva el diseño previo a la integración.

| ID de ficha | Gólem | Encuentro principal | Dificultad conservada |
| --- | --- | --- | --- |
| `g_cerezo` | Gólem del Cerezo | Capítulo 1 | Épica |
| `g_marea` | Gólem de Marea | Capítulo 2 | Épica |
| `g_arena` | Gólem de Arena | Capítulo 3 | Difícil |
| `g_musgoso` | Gólem Musgoso | Capítulo 5 | Media |
| `g_escarcha` | Gólem de Escarcha | Capítulo 6 | Difícil |

Los cinco combates están incorporados a las misiones principales. **Oferta independiente de las fichas `g_*`: por medir.** `11-jefes.js` aún las vincula a `faro`, una misión retirada. El capítulo de la tabla identifica el encuentro principal, no una oferta secundaria verificada.

El catálogo suma **28 fichas: 10 principales (dos del inicio, siete de capítulo y una de epílogo), 13 secundarias adaptadas y 5 de gólems**. Las fichas de gólem describen los mismos encuentros de la historia; no son cinco combates adicionales. `c7_luna` tiene `dif: 4`, pero `DIF` solo define 0–3: su etiqueta queda **por medir**.

## Repositorio y ramas

```text
index.html, css/, js/, audio/, vendor/   el juego (se abre index.html tal cual, sin compilar)
herramientas/                            pruebas, mediciones, exportación de modelos y empaquetado (npm install aquí)
modelos/                                 exportaciones GLB/glTF y fuente Blender de Hikari y Tasogare
docs/                                    documentación completa, planes, tablero, canon y personajes
docs/entregas_chatgpt/                   guiones, diseño e investigaciones por encargo
README.md, AUDIO_LICENCIAS.md            guía y licencias de audio
CLAUDE.md, AGENTS.md                     instrucciones para los asistentes de código
```

`dist/` (paquete generado) y `herramientas/node_modules/` no se suben.

| Rama | Uso |
| --- | --- |
| `main` | Versión estable y jugable. Solo recibe fusiones desde `develop` con la batería de pruebas en verde. |
| `develop` | Integración: aquí se juntan las ramas de trabajo terminadas. |
| `fase/NN-nombre` | Una fase de [PLAN_JUEGO](docs/PLAN_JUEGO.md) (`fase/06b-guardianes`, `fase/07-catalogo`, `fase/08-historia`). Sale de `develop` y vuelve a ella. |
| `mejora/…`, `arreglo/…`, `docs/…` | Cambios sueltos: una mecánica, un error o documentación. Salen de `develop`. |

Antes de fusionar: `node --check` de cada módulo tocado y las pruebas de `herramientas/` que correspondan (ver [Pruebas vigentes](#pruebas-vigentes)).

## Estructura del proyecto

**72 módulos**, una línea por módulo, en el orden real de `index.html`. El número del archivo no determina su carga.

```text
js/00-nucleo.js                 utilidades, ruido, texturas, halos (todos en una sola llamada de dibujo), calidades, bus de eventos
js/01-audio.js                  mezcla Web Audio, efectos, magia, motivos y reverberación por canal
js/02-terreno.js                isla principal y Yoake, biomas, relieve, cuevas, caminos, regiones y mapa
js/03-flora.js                  árboles, rocas, hierba y partículas (instanciado)
js/04-estructuras.js            dónde va cada construcción: faro, santuarios, aldea, murales, cuevas; colisiones
js/05-personaje.js              Lumi, tela simulada y partículas
js/06-fauna.js                  especies y comportamiento: manadas, pastar, alerta, huida, avisos
js/49-campana.js                CAPITULOS, apertura de regiones, límite del Velo y guardado único
js/50-guion-inicio.js           textos, documentos y dos misiones del inicio
js/59-guion-capitulos.js        guion, notas y misiones de capítulos 1–7 y epílogo
js/68-secundarias.js            13 secundarias adaptadas, oferta por capítulo y textos de herencia y cierre
js/57-progresion-enemiga.js     potencia permanente y perfil regional fijado al iniciar cada encuentro
js/07-sistemas.js               objetos, niveles, misiones, retos, NPC, guardado
js/08-interfaz.js               HUD, minimapa, brújula, diálogos, menú de pausa
js/09-cinematica.js             motor de planos y utilidades compartidas; purificación de gólems
js/10-juego.js                  entrada, cámara, bucle, arranque y detección de combates de jefe
js/11-jefes.js                  gólems guardianes: fichas, estados, IA, daño, equilibrio, canalización y puntos de luz
js/12-mando.js                  mando Xbox/estándar, navegación de menús y vibración
js/13-render.js                 tubería HDR: MSAA, bloom, oclusión ambiental, rayos de sol, desenfoque, reflejos en el agua, color por región, exposición automática y resolución dinámica
js/14-atmosfera.js              cielo físico, nubes, estrellas, luna, niebla y perspectiva aérea, sol e IBL
js/15-texturas.js               texturas PBR procedurales en la GPU (suelo, cortezas, tablas, sillar, teja y enlucido) y atlas de hojas
js/16-plantas.js                árboles por especie con tres niveles de detalle, hierba, rocas y sus materiales
js/47-hikari-modelo.js          geometría, atlas y ornamentos de Hikari (se carga antes de 17)
js/17-hikari.js                 Hikari: malla con esqueleto, animación procedural con pies apoyados, capa y alas
js/18-movimiento.js             física del jugador: andar 3,2 m/s, correr 6,8 m/s, aceleración, pendientes, deslizar, trepar y aupar
js/19-animales.js               modelos de los animales con esqueleto y locomoción por patas (paso, trote, galope, salto)
js/20-armas.js                  armas: combo de cada una, trayectoria de la hoja, modelos, fundas y estelas
js/21-combate.js                combate: combos, cancelaciones, fijar objetivo, guardia y parada, reacciones, pulso y haz de luz
js/22-golems.js                 arte de los gólems: materiales, cuerpo articulado con IK, animación, reacciones y efectos
js/23-ataques-golem.js          los 14 ataques de los gólems
js/24-arquitectura.js           material de obra y piezas: tejados con esquinas levantadas, muros de entramado, ménsulas, escalinatas, sōrin, torii, faroles, casas, altares
js/25-gente.js                  habitantes con esqueleto, cara con gestos, animación y rutinas (pasear, jugar, pescar, vigilar, meditar)
js/26-guion.js                  guion: cinemáticas, frases de los habitantes según el progreso y ecos
js/27-ecos.js                   ecos del pasado: figuras de luz que repiten un recuerdo (con su melodía) cuando te acercas
js/28-iconos.js                 iconos de la interfaz: SVG dibujados en el código
js/29-portada.js                portada, capítulo de la partida guardada y acceso a la práctica
js/30-agua.js                   superficie del agua: olas, reflejos, espuma y hielo
js/31-arenas.js                 arenas de los gólems: obra, linternas de punto de luz, balizas y objetos
js/32-cuevas.js                 interiores de las cuevas: roca, cristales, luciérnagas, cristales de memoria y su luz
js/33-santuarios.js             los cuatro santuarios, las pirámides, el campamento del oasis y la cima de Kiri
js/34-piezas.js                 piezas de cada lugar (muelle, aldea, árbol seco, Duna y Marea), añadidas a Arquitectura
js/35-sombras.js                las Sombras: fichas, zonas donde brotan (más con el cielo rojo), IA de grupo, arte de tinta, rotura con motas y los onis que guardan los santuarios
js/48-tasogare-modelo.js        geometría, rig, atlas, grieta y fractura de Tasogare (antes de 36)
js/36-tasogare.js               Tasogare, el Guardián del Ocaso: animación, emisión independiente, Hoja del Ocaso, capa física y poses
js/37-asedio.js                 asedios de Hinode y de la plaza del faro, por oleadas
js/38-cazadores.js              Cazadores del Ocaso: vigilancia, cobertura, avisos y embestidas en encuentros de la historia
js/39-escenas.js                Noche Roja y utilidades visuales de escenas; pérdida de Tsuru sin robo en el capítulo 4
js/42-duelo.js                  duelo de Tasogare en la plaza del faro (capítulo 5) y base de la práctica
js/43-duelo-espiral.js          espiral en sombra, plataformas iluminadas con el haz y Cazador (capítulo 5)
js/45-audio-recursos.js         datos generados de ambiente y foley Ogg incrustados
js/46-paisaje-sonoro.js         ambiente natural, pasos, tela e impactos; decodificación y mezcla de grabaciones
js/54-musica-inicio.js          koto y flauta sintetizados en todo el juego; capa de combate con taiko y koto apagado
js/51-piloto.js                 progreso del inicio, conversaciones, investigación y enlace con los capítulos
js/52-escenas-inicio.js         prólogo nocturno, fractura del faro y presentación del Cazador
js/53-patio-inicio.js           objetos, coberturas, sólidos y estado visual del inicio
js/58-practica.js               práctica temporal de combate con niveles 1/5/10, sin guardar progreso
js/62-isla-yoake.js             obra de Yoake, barca, embarcadero, refugio, huertos, cisterna y señal
js/61-escenario-capitulos.js    objetos, figuras y puntos interactivos de los capítulos
js/63-escenas-capitulos.js      recuerdos, travesías, rescate, encarnación, liberación y créditos
js/64-luna-roja.js              modelo físico, poses y conexiones de la Luna Roja
js/65-luna-dorada.js            modelo y poses de la Luna Dorada cautiva y liberada
js/66-lumi-enlaces.js           combate de las tres ataduras de Lumi (capítulo 6)
js/67-duelo-luna.js             Luna Roja física: anclajes, cuerpo, máscara y canalización (capítulo 7)
js/69-director-combate.js         permisos de ataque entre enemigos (presupuesto por dificultad)
js/70-impacto.js                 contrato común de daño de Hikari: sector, círculo y proyectil contra todos los objetivos
js/71-arco-luz.js               arco de luz y taller compartido de proyectiles
js/72-escuela-luz.js             escuela de luz: orbe, abanico, escudo y lanza
js/73-hilo-luz.js                cinta de luz, corte, onda y grieta de las escenas del prólogo y de las pérdidas
js/74-escuelas-magia.js          escuelas de viento, brasa, escarcha y oscuridad
js/75-variantes-sombra.js        Sombras espejo, devoradora, escoria, alada, lanzadora de escarcha y oni anclado
js/76-diagnostico.js             detecta cierres inesperados de la página y baja la calidad si se repiten
js/60-capitulos.js              lógica, conversaciones, pistas, reconciliación de pasos y continuidad de capítulos
```

Los módulos `40-tormenta.js`, `41-ofrenda.js` y `44-duelo-gigante.js` de la campaña anterior se borraron, igual que la voz de prueba (55 y 56): ya no forman parte del juego.

`css/estilos.css` contiene HUD, menús y portada. `audio/` conserva muestras y licencias; `herramientas/`, pruebas y empaquetado. El arte visual del juego se construye por código; `modelos/` conserva exportaciones GLB y fuentes editables. Los ajustes usan `ecos2_ajustes`, independientes del guardado de campaña.

## Audio actual

La música de **todo el juego**, incluida la portada, se sintetiza con koto y flauta en [54-musica-inicio.js](js/54-musica-inicio.js). Alterna frases y silencios. En combate añade taiko y koto apagado; la capa se intensifica contra gólems, Tasogare, las ataduras de Lumi y la Luna Roja. Se silencia durante diálogos, escenas y pausa.

[46-paisaje-sonoro.js](js/46-paisaje-sonoro.js) reproduce ambiente natural y foley: pasos, tela, agua e impactos. [01-audio.js](js/01-audio.js) conserva mezcla, reverberación, magia y señales sonoras. Las muestras están incluidas; no se transmite música desde servicios externos.

**Solo subtítulos, sin locución.** Se retiraron la voz de prueba de Tsuru, su ajuste y los temas orquestales. La antigua muestra de escucha y los informes de la parte 4 son antecedentes. Fuentes y atribuciones de las grabaciones: [AUDIO_LICENCIAS.md](AUDIO_LICENCIAS.md) y `audio/manifiesto.json`. La valoración sonora del usuario sigue pendiente.

## Pruebas vigentes

Resultados vigentes comunicados por Claude en el encargo y registrados en [COORDINACION.md](docs/COORDINACION.md), a 2/11/2026. Esta revisión documental no vuelve a ejecutar las pruebas del juego.

| Batería | Resultado |
| --- | --- |
| Inicio | 43/43 |
| Registro del Pétalo | 14/14 |
| Parte 5: movimiento y combate | 29/29 |
| Audio del piloto | 16/16 |
| Secundarias | 18/18 |
| Capítulo 1 | 24/24 |
| Capítulo 2 | 26/26 |
| Capítulo 3 | 19/19 |
| Capítulo 4 | 29/29 |
| Capítulo 5 | 22/22 |
| Capítulo 6 | 23/23 |
| Capítulo 7 y epílogo | 28/28 |
| Calidades alta, media y baja | Sin errores |

Estas comprobaciones no miden la duración con personas ni sustituyen su valoración del ritmo, del audio, de la estética y del combate. Rendimiento actual con el portátil enchufado: **por medir**.

## Rendimiento (mediciones históricas)

Las cifras siguientes se conservan como registros de sus fases. No certifican el rendimiento actual de la campaña fusionada. La medición con el portátil enchufado queda por medir.

**Audio, fase 24:** comprobadas cinco situaciones de juego y siete estados musicales sin errores ni saturación; máximo medido −0,6 dBFS. Silenciar los tres canales también silencia la reverberación. HTML único de unos **8,71 MiB**, con el audio incluido. En el archivo empaquetado, aldea/Cueva de Cristal a 1920 × 1080 con Intel Arc 140V: alta 136/163 FPS, media 161/191 y baja 236/259; son medias de tres segundos, con fotogramas aislados de hasta 99,4 ms. Las cifras de otras fases son históricas y no constituyen una comparación A/B.

**Personajes, fase 23 · Intel Arc 140V, 1920 × 1080, sin límite de FPS:** en aldea, Kiri y Cueva de Cristal, alta **94–128 FPS**, media **100–130** y baja **121–133**, sin errores de consola. Son medias de ventanas de tres segundos: hubo fotogramas aislados de hasta 25,2 ms en alta; no representan un mínimo garantizado. A/B de GPU frente a la versión anterior: +4,1 % junto al faro, +0,2 % en la aldea y +0,3 % en la cueva (equipo con ruido de ±3–5 %). La capa añade un programa compilado en la carga y conserva el número de mallas del personaje.

La sombra de lo que no se mueve se guarda y se reutiliza, las construcciones se reparten por zonas que la cámara descarta, el terreno se construye por pasos (sin tirones al viajar) y las texturas generadas se guardan en el navegador (la segunda carga tarda la mitad). Medido con una GPU real (Intel Arc 140V) a 1920 × 1080 y sin límite de FPS: *alta* 107–147 FPS, *media* 65–128 y *baja* 124–197 según la zona (con la oclusión ambiental, los rayos de sol y los reflejos en el agua; medido a batería), con 74–229 llamadas de dibujo en alta (los halos se pintan todos juntos en una sola). En *alta* un fotograma cuesta 7,7 ms de GPU (el objetivo de 60 FPS da 16,7 ms). Si un equipo no llega a 60 FPS, la **resolución dinámica** baja la resolución interna hasta el 70 % (alta), 60 % (media) o 50 % (baja) y la recupera cuando sobra margen. Con «Mostrar FPS» activado en Ajustes se ve también la resolución en uso.

## Empaquetado

Desde `herramientas/` (la primera vez, `npm install`), `node empaquetar.mjs` crea `dist/ecos-de-luz.html` con los 72 módulos, estilos y audio incluidos. Comprueba sintaxis, referencias locales y el máximo de 16 MB. Tamaño actual: **2207 KB**. **`dist/ecos-de-luz.zip` se conserva por orden del usuario y no representa el paquete actual.**

## Historia del proyecto

| Fecha | Cambio | Estado histórico |
| --- | --- | --- |
| Hasta octubre de 2026 | La campaña anterior permitía recorrer los santuarios en cualquier orden. Incluía la forja de la Odachi Solar, la caza, la Tormenta, Tasogare gigante y una Ofrenda jugable. Hikari entregaba toda su luz y renacía. | Ese recorrido se retiró. |
| 23–25/10/2026 | El piloto del canon 2.0 convivió con «Historia anterior» en portada. Usaban guardados separados; se incorporó una voz de prueba opcional. | Fue una etapa de transición. |
| 2/11/2026 | Se fusionó el juego en una campaña: prólogo, capítulos 1–7 y epílogo en Yoake. Se adaptaron 13 secundarias y los combates; se retiraron 40, 41 y 44, la voz de prueba y la música orquestal. | Estado vigente: 72 módulos y un guardado. |

La cronología completa se conserva en [Ecos_de_Luz_documentacion_completa.md](docs/Ecos_de_Luz_documentacion_completa.md). Las duraciones de 26 min para el piloto y 435 min para la campaña fueron objetivos de diseño. Duración real con personas: **por medir**.

## Estado y limitaciones

La campaña, sus siete capítulos y el epílogo están implementados. Continúa el pulido de estética y animación de Hikari y Tasogare, ritmo, comprensión, sonido y equilibrio. Quedan por validar el mando físico y las restricciones del visor, las GPU antiguas y las partidas largas. Las pruebas automáticas no equivalen a aceptación del usuario. El cooperativo queda fuera del alcance.

## Créditos y licencias

Three.js (MIT). Fuentes Shippori Mincho y Zen Maru Gothic (SIL OFL) vía Google Fonts. Arte visual y síntesis musical propios. Foley de Kenney (CC0); ambiente de deadrobotmusic y RandomMind (CC0), y Blender Foundation / Yo Frankie! (CC BY 3.0). Los temas de Scott Buckley pertenecen a una etapa retirada. Detalle de fuentes y adaptaciones en [AUDIO_LICENCIAS.md](AUDIO_LICENCIAS.md).
