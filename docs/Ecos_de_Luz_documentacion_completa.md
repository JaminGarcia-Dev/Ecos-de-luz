# Ecos de Luz · Documentación completa del proyecto

> Documento de referencia: de qué idea nació el juego, cómo cambió, qué existe hoy, cómo funciona por dentro, cómo se construyó y qué falta.
>
> **Versión del documento:** 2 de noviembre de 2026 · **Estado:** campaña única, prólogo y capítulos 1–7 completos, epílogo jugable en Yoake y créditos. 72 módulos. Música sintetizada de koto y flauta con capa de combate. Solo subtítulos, sin locución.

Rige el [canon 2.0](PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md): la Luna Roja suplanta a la Dorada cautiva; Tasogare es el padre de Akari y conoce la suplantación; Lumi es informante. El final enfrenta a Hikari/Akari con la Luna Roja física. Liberar a la Dorada no resucita a nadie.

El estado de producción y las pruebas constan en [COORDINACION.md](COORDINACION.md) y [PLAN_FUSION.md](PLAN_FUSION.md). La campaña anterior quedó retirada. El ZIP se conserva por orden del usuario; el HTML vigente está en `dist/ecos-de-luz.html`.

---

## Índice

1. [Resumen rápido](#1-resumen-rápido)
2. [La idea: de la propuesta original a la idea actual](#2-la-idea-de-la-propuesta-original-a-la-idea-actual)
3. [Cronología del trabajo](#3-cronología-del-trabajo)
4. [Qué hay hoy en el juego](#4-qué-hay-hoy-en-el-juego)
5. [Cómo funciona por dentro](#5-cómo-funciona-por-dentro)
6. [Cada apartado en detalle](#6-cada-apartado-en-detalle)
7. [Cómo se construyó](#7-cómo-se-construyó)
8. [Documentos y entregables](#8-documentos-y-entregables)
9. [Qué se está haciendo y qué falta](#9-qué-se-está-haciendo-y-qué-falta)
- [Anexo A. Idea original (texto de partida)](#anexo-a-idea-original-texto-de-partida)
- [Anexo B. Controles completos](#anexo-b-controles-completos)
- [Anexo C. Estructura de archivos](#anexo-c-estructura-de-archivos)
- [Anexo D. Glosario](#anexo-d-glosario)

---

## 1. Resumen rápido

- **Qué es.** Aventura 3D de exploración y acción para navegador. Hikari investiga las ofrendas del Faro del Alba y recupera su memoria como Akari.
- **Estado.** Una campaña: prólogo, capítulos 1–7, epílogo en Yoake y créditos. Se puede seguir jugando después. Las regiones se abren por capítulo; Yoake, desde el 4.
- **Contenido.** 13 secundarias adaptadas, cinco gólems, duelo de Tasogare y espiral, ataduras de Lumi, Luna Roja física en tres etapas y asedios de Hinode y de la plaza del faro.
- **Tecnología.** Three.js r128, HTML y JavaScript clásico. 72 módulos en el orden de `index.html`. Arte visual procedural; música sintetizada y grabaciones de ambiente y foley. Solo subtítulos.
- **Partida.** Un guardado, `ecos3_luna_partida`; ajustes en `ecos2_ajustes`. La práctica desde portada usa estado temporal.
- **Archivos actuales.** `index.html` y `dist/ecos-de-luz.html` (2207 KB, 2 084 182 bytes). El ZIP conservado y el [enlace histórico del artefacto](https://claude.ai/artifact/X7tT9PK9o1FhAhq1bWERxF) no se han verificado como copias actuales en este encargo.
- **Relación con Ecos del Alba.** Es la idea original y el proyecto académico en Unity. Ecos de Luz sirve como referencia jugable; migrarlo supone rehacer código y arte.

---

## 2. La idea: de la propuesta original a la idea actual

### 2.1 La idea original

La propuesta de partida se llamaba **Ecos del Alba** (título provisional). Era una aventura de exploración relajante, con cooperativo opcional, para PC o móvil, con un mundo luminoso, música ambiental, personajes simples y enfoque emocional.

- **Premisa:** un pequeño ser de luz despierta en un mundo apagado. Su misión no es pelear, sino recorrer zonas, recuperar fragmentos de luz y devolverle la vida al mundo.
- **Historia:** grandes faros mantenían vivo el mundo hasta que la luz se fragmentó. El jugador es un «Eco» nacido de un fragmento. Se contaría sin diálogos largos: imágenes, música, murales y zonas que se iluminan.
- **Mecánicas:** explorar, recolectar luz como energía, planear (más luz = más tiempo en el aire), encender altares que cambian el entorno, resolver acertijos simples y, opcionalmente, cooperar con otro jugador.
- **Personaje:** pequeño, sin rostro definido, con capa o manto luminoso.

El texto completo está en el [Anexo A](#anexo-a-idea-original-texto-de-partida).

### 2.2 Cómo evolucionó

| Aspecto | Idea original | Estado vigente |
| --- | --- | --- |
| Protagonista | Un Eco sin nombre | Hikari/Akari, con máscara, capa y recuerdos propios |
| Mundo | Escenarios abiertos pequeños | Isla principal con cinco biomas e isla de Yoake; apertura por capítulo |
| Faro | Varios faros antiguos | Faro del Alba, red lunar y cuatro fragmentos de memoria |
| Luz | Energía para mecanismos y planeo | Planeo, pulso, haz, canalización y mejoras con motas |
| Acertijos | Pilares, esferas y símbolos | Faroles, perlas, orbes, cristales y activación de gólems |
| Combate | No previsto | Sombras, Cazadores, cinco gólems, Tasogare, ataduras y Luna Roja física |
| Progreso | Reunir luz | Diez niveles, habilidades, equipo y misiones por capítulo |
| Narrativa | Imágenes y diálogos breves | Prólogo, capítulos 1–7, registros, murales, ecos y epílogo jugable |
| Plataforma | PC o móvil; cooperativo opcional | Navegador de PC, teclado y ratón o mando; sin cooperativo |

### 2.3 La idea actual

Hikari despierta tras la fractura del faro. Investiga las entregas de niños y recupera los recuerdos de Akari. La Luna Roja mantiene cautiva a la Dorada y usa la red para sostener la suplantación. Tasogare lo sabía antes de intentar salvar a su hija. Lumi guía a Hikari mientras informa a la Luna.

El recorrido une investigación, exploración y combate. En Yoake, fuera del Velo, viven familias que huyeron. El final destruye el cuerpo y la red de la Roja y libera a la Dorada. Los muertos no regresan. El epílogo conserva sus nombres y abre otra forma de cuidar el faro.

**High concept:** una pequeña figura de luz recupera su memoria y combate una red que exige vidas para sostener el engaño lunar.

**Criterios de la campaña vigente:**

1. Explorar las regiones abiertas por el capítulo, con brújula, mapa y pistas.
2. Usar la luz como recurso de movimiento y combate.
3. Combatir las Sombras, calmar a la fauna y purificar a los guardianes. Las personas pueden morir y se deshacen en luz.
4. Contar hechos con escenas, documentos, murales, ecos y conversaciones de frases cortas.
5. Liberar la luz cautiva y proteger a los niños. El desenlace ya no exige que Hikari entregue su vida.

Los pilares de mapa abierto y sacrificio final de los diseños anteriores fueron sustituidos en la fusión del 2/11. Se conservan como antecedentes en la cronología.

**Público de la propuesta:** jugadores de 12 a 25 años, en sesiones de navegador de PC.

### 2.4 Dos proyectos, una misma idea

| | *Ecos de Luz* | *Ecos del Alba* |
| --- | --- | --- |
| Qué es | Prototipo web jugable completo | Proyecto en equipo de la materia Creación de Videojuegos |
| Tecnología | HTML, JavaScript, Three.js r128 | Unity LTS (URP), C#, Blender, Git con LFS |
| Alcance | Juego completo en beta | Vertical slice: una zona completa y dos más cortas |
| Papel | Valida mecánicas, contenido y ritmo | Producto académico final |

Migrar *Ecos de Luz* a Unity no es convertir archivos, sino **rehacerlo usando la beta como referencia**: el diseño y la lógica se reaprovechan, el arte y el código se rehacen (ver sección 9).

---

## 3. Cronología del trabajo

Las fechas marcadas con «aprox.» se reconstruyeron por el orden de las conversaciones y los archivos.

| Fecha | Etapa | Qué se hizo | Resultado |
| --- | --- | --- | --- |
| 18 sep 2026 | Concepto y análisis | Idea original *Ecos del Alba* y ficha de análisis técnico con *Sky: Children of the Light* como referencia comercial | Ficha técnica en DOCX y PDF |
| Sep–oct (aprox.) | Planeación del equipo | Hoja de ruta de 12 semanas (preproducción, prototipo gris, vertical slice, contenido y beta, cierre), decisión de alcance y guía de la Fase 0 | Plan del proyecto Unity |
| 27 sep (aprox.) | Primera versión web | Prototipo con la idea original y combate contra enemigos, en 7 módulos | Juego publicado como artefacto |
| 1–2 oct | Reescritura a beta | Sin enemigos, mundo de 1000 × 1000 m, 5 biomas, cuevas, intro, 19 misiones, niveles, pausa, minimapa y nuevo Hikari. Banco de pruebas automático, corrección de errores y rendimiento | Beta publicada en el mismo enlace |
| Oct (aprox.) | Consultas de diseño | Migración a Unity (rehacer con la beta como referencia). Actividad del Tema 2: concepto, narrativa, diseño, producción y high concept | Respuestas para la materia |
| 12 oct | Diseño del sistema del equipo | GDD 1.0 de *Ecos del Alba* (60 decisiones sobre acciones, combate y progreso) y guía de jefes con 5 gólems | Documentos de diseño |
| 13–14 oct | Gólems y mando | 5 gólems, haz de luz, canalización, puntos de luz y soporte de mando Xbox, con pruebas automáticas | Beta publicada con 13 módulos |
| 14 oct | Arte definitivo | Lista de todo lo que hay que diseñar y guía de sustitución de assets | Documento compartible |
| 17 oct | Documentación | Este documento | — |
| 17–19 oct (aprox.) | Mejora por fases | Las 10 fases de el antiguo plan de mejoras (documento ya borrado): motor gráfico HDR, terreno y vegetación, Hikari y movilidad, fauna, combate y armas, gólems, estructuras y personajes, narrativa y cinemáticas, interfaz y audio, y cierre (carga, equipos modestos, pulido y empaquetado), más una ronda de pendientes (niebla de las hojas, coste de GPU, cámara, audio) | 28 módulos; 94–169 FPS en alta, 112–181 en media y 166–255 en baja |
| 19 oct | Segunda ronda de pendientes (fase 12) | Interfaz sin caracteres japoneses (iconos SVG), mapa grande con todos los nombres, rótulos en cola, melodía y cara de los ecos, caras con gestos, piernas de los gólems en desniveles, agua con refracción, animales que rodean obstáculos, muelle y santuarios con piezas nuevas, y menos llamadas de dibujo | 29 módulos; 98–188 FPS en alta, 105–188 en media y 164–254 en baja |
| 19 oct | Rendimiento y estética (fase 14) | Obra por zonas, sombra de lo estático guardada, carga del terreno por pasos, gólems en una malla, texturas guardadas en el navegador, oclusión ambiental, rayos de sol, desenfoque en cinemáticas, color por región y por fragmento, reflejos en el agua, luz de faroles en el suelo, casas de entramado, losas, guirnaldas, borde de luz de Hikari, pueblo que canta en la intro y menú de pausa nuevo | 30 módulos; alta 107–147 FPS, media 65–128 y baja 124–197; GPU en alta a mitad de la fase entre −27 % y +1 % frente a la fase 13 (los reflejos cuestan ~0,9 ms con mucha agua) |
| 19 oct | Presentación (fase 13) | Textos que no se pierden, faro, templos y casas con más detalle, intro nueva (haz del faro, color que se apaga) y portada nueva | 30 módulos; 141–190 FPS en alta, 88–180 en media y 124–201 en baja (equipo más lento ese día; sin coste de GPU frente a la fase 12 salvo la aldea, +6–9 %) |
| 20–22 oct (aprox.) | Campaña anterior | Se añadieron Sombras, Cazadores, robo de fragmento, forja de la Odachi Solar y caza. El asalto incluía Tormenta, duelo en plaza, espiral y Tasogare gigante. Después se jugaba la Ofrenda: Hikari entregaba su luz y renacía. | Esa campaña y ese final se retiraron el 2/11; no son una ruta actual. |
| 23–25 oct | Canon 2.0 y piloto | Se implementaron el inicio y su registro exterior, audio con voz de prueba opcional, modelos de personajes y la parte 5 de movimiento, combate y progresión. «Historia anterior» siguió accesible desde portada con ecos2_partida; el piloto usó ecos3_luna_partida. | Se llegó a 59 módulos y un HTML de unos 9114 KB con voz. Fue una etapa transitoria. |
| 2 nov 2026 | Fusión en una campaña y retirada | Se unieron prólogo y capítulos 1–7, epílogo jugable en Yoake y créditos. Se abrieron regiones por capítulo, se adaptaron 13 secundarias y los cinco gólems, y se integraron Tasogare, Lumi y la Luna Roja física. Se retiraron la ruta anterior, su botón, Ofrenda, renacer, Tormenta, gigante, forja y caza; se borraron los módulos 40, 41 y 44. Se quitaron voz de prueba y música orquestal. | Una campaña y un guardado; 72 módulos, HTML de 2207 KB. Inicio 43/43, registro 14/14, parte5 29/29, audio 16/16, secundarias 18/18 y capítulos 1–7 en verde; tres calidades sin errores. |


---

## 4. Qué hay hoy en el juego

### 4.1 El contenido en números

| Elemento | Cantidad y alcance |
| --- | --- |
| Campaña | Una: prólogo / capítulo 0 y capítulos 1–7; epílogo dentro del 7 |
| Mundo | Isla principal de 1000 × 1000 m y Yoake desde el capítulo 4 |
| Biomas | Cinco en la isla principal; Yoake tiene terreno propio |
| Lugares registrados | 18 en LUGARES, 13 con viaje rápido; Yoake tiene puntos propios |
| Cuevas | Dos: Cristal y Gruta de las Luciérnagas |
| Misiones | 28 fichas: 10 principales, 13 secundarias adaptadas y 5 g_*; oferta independiente de g_* por medir |
| Combates de historia | Cinco gólems; Tasogare en plaza y espiral (5); tres ataduras de Lumi (6); Luna Roja en tres etapas (7) |
| Asedios | Dos: Hinode (4) y plaza del faro (7) |
| Fauna | Doce especies y cinco animales con nombre |
| Personajes | Reparto ampliado con Sayo y las familias de Yoake; total de interlocutores por medir |
| Progresión | Diez niveles y cinco habilidades desbloqueables |
| Equipo | Katana y Naginata con obtención vigente; seis mantos, una máscara y tres consumibles. El código conserva una Odachi sin la antigua misión de forja |
| Colecciones de la isla principal | Objetivo de generación: 80 chispas; diez espíritus, ocho murales, ocho capas ocultas, seis ecos y ocho cofres. Chispas efectivamente generadas: por medir |
| Presentación | Prólogo de 110 s; escenas y conversaciones; solo subtítulos |
| Código y paquete | 72 módulos; HTML de 2207 KB (2 084 182 bytes, 1024 bytes por KB, redondeado) |

Las cifras de misiones cuentan definiciones, no horas ni combates adicionales. La duración real de la campaña sigue **por medir**. Los objetivos de 26 min para el piloto y 435 min para la campaña fueron estimaciones de diseño.

### 4.2 Recorrido de una partida

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

La portada ofrece Continuar, Nueva partida, Práctica de combate, Controles y Ajustes. El prólogo se puede saltar con la acción que indica la interfaz. La lectura del registro del Pétalo abre el capítulo 1; ya no es el final del contenido disponible.

### 4.3 Reglas del mundo

- **Las Sombras sí se combaten.** Desde que Hikari lleva la Katana del Alba, grupos de Sombras rastreras brotan en siete zonas del mapa (al menos una por región) y, la primera vez, alrededor del Mirador al tomar la katana. Acechan en círculo, avisan con los ojos encendidos y saltan sobre Hikari, de dos en dos como mucho; se rompen con el combo o con un pulso y sueltan luz rescatada (3 motas cada una). Si Hikari se aleja, se hunden; una zona limpia vuelve a llenarse a los 4 minutos (detalle en 6.7b).
- **Los animales no son enemigos.** Los animales viven su vida. Los huidizos escapan; los defensivos (jabalí, lobo, oso, escorpión y cangrejo) **solo atacan si los golpeas**, y avisan con un anillo rojo.
- **Fauna y guardianes.** Al agotar su «ánimo», los animales se calman, dejan una ofrenda y dan experiencia. Los gólems se purifican.
- **Confianza.** Si Hikari se agacha y se queda quieta, los animales huidizos pueden acercarse a que los acaricie.
- **Caer cuesta algo, sin frustrar (llamas).** Hikari tiene 3 llamas, que brillan en una columna vertical sobre su capa y en el HUD. Si la vida llega a 0, gasta una y reaparece con toda la vida en su último punto de luz (o en el lugar de viaje más cercano). Si cae sin llamas, **la alcanza el Ocaso**: su luz rescatada queda donde cayó (un brillo dorado, también en el minimapa) y vuelve con las 3 llamas; si llega a ese sitio antes de caer otra vez, la recupera, y si cae antes, se pierde. Las llamas se avivan junto a los altares de los santuarios y en los puntos de luz (al crearlos o con «Avivar tus llamas»). Contra un gólem no se gastan: el combate vuelve a empezar, como siempre (`LLAMAS` en 07-sistemas.js; lógica en 10-juego.js).

---

## 5. Cómo funciona por dentro

### 5.1 Tecnología

- **Three.js r128** para el 3D, cargado desde cdnjs. El posprocesado (HDR, *bloom*, exposición automática, tono y gradación) es propio, en `13-render.js`.
- **JavaScript clásico** repartido en 72 módulos que se cargan en orden. No hay compilación ni frameworks.
- **Arte visual procedural:** terreno, modelos, texturas y animaciones se calculan con código. Desde la fase 24, el audio combina grabaciones con licencia y síntesis propia; las grabaciones se incluyen comprimidas en el juego.
- **Web Audio** para sintetizar la música y los efectos.
- **localStorage** del navegador para guardar la partida y los ajustes.
- **Requisitos:** navegador moderno con WebGL2 (Chrome, Edge o Firefox) e internet para cargar Three.js y las fuentes.

### 5.2 Los 72 módulos

Se cargan en el siguiente orden de `index.html`. Cada línea corresponde a un módulo; la numeración no determina el orden. Campaña, guion y secundarias se definen antes de construir `MIS`.

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


Hikari comparte su fuente geométrica con las exportaciones de [modelos/hikari/](../modelos/hikari/LEEME.md). Tasogare hace lo mismo con [modelos/tasogare/](../modelos/tasogare/LEEME.md). El juego conserva animación procedural y tela física; no descarga los GLB.

### 5.3 Qué pasa en cada fotograma

La función `tick()` de `10-juego.js` se ejecuta unas 60 veces por segundo, en este orden:

1. **Leer el mando** y traducir sus botones a las mismas teclas virtuales que usa el teclado.
2. **Elegir el estado:** carga, portada, cinemática, pausa o juego. Solo «juego» sigue con los pasos siguientes.
3. **Interacción:** busca lo más cercano con lo que interactuar. Pulsar E lo activa; si es una canalización, hay que mantener E y se llena una barra.
4. **Combate** (`Combate.entrada`): fijar objetivo, guardia, ataques, carga, pulso, objetos rápidos y guía de Lumi. Tras la física, `Combate.orientar` pone a Hikari de cara al objetivo fijado.
5. **Física de Hikari:** movimiento, salto, planeo, nado, pendientes, corrientes de aire, colisiones y gasto de luz.
6. **Cámara** orbital con choque contra el terreno, las cuevas y las construcciones (paredes, casas, faro); si algo la tapa se acerca hasta 0,35 m.
7. **Haz de luz**, si se mantiene clic derecho o RT.
8. **Animación de Hikari** según su estado.
9. **Mundo vivo:** fauna, gólems, Lumi, misiones, recolectables, lugares y retos.
10. **Ambiente:** luz del día según los fragmentos, niebla, interior de cuevas y efectos de los jefes.
11. **Partículas e interfaz:** HUD, aviso de interacción, barras y minimapa.
12. **Audio** según el bioma y la situación.
13. **Carga del terreno cercano** por trozos y **dibujo** de la escena.

### 5.4 Arranque

Al abrir la página se ve una barra de carga mientras se generan, por orden: texturas, lugares y cuevas, mapa, cielo y agua, vegetación, estructuras, personajes, fauna, sistemas, gólems, mando y el terreno alrededor del jugador. Después aparece la portada.

- **Texturas guardadas:** las capas del suelo y el atlas de hojas se guardan en el navegador (IndexedDB) la primera vez; desde la segunda carga se suben tal cual (de 6,7 a 3,4 s hasta la portada). Si el navegador no deja guardar, se generan como siempre.
- **Tiempo de carga** (Intel Arc 140V): de 6 a 9 s la primera vez, porque el navegador tiene que compilar los shaders, y unos 5 s las siguientes, porque los guarda. Para acortar la primera, los ~45 programas se compilan **a la vez** en un renderer de usar y tirar (`Render.precompilar`, con `KHR_parallel_shader_compile`) y el `compile()` de verdad los encuentra luego en la caché del navegador; el generador de texturas usa un programa por capa con bucles que el compilador no desenrolla. Antes tardaba 18 s.
- **Sin tirones al moverse:** el terreno se construye por pasos (unas filas cada vez, 4–6 ms por fotograma), igual que la hierba de cada trozo y las instancias de la vegetación (por tipos, 3 ms). La sombra de lo estático (terreno, vegetación y obra) se guarda y solo se rehace al alejarse Hikari 12 m, al moverse el sol o al cambiar trozos; cada fotograma se copia y encima se dibuja lo que se mueve. Las construcciones van en zonas de 120 m que la cámara descarta si no las ve, y sus piezas pequeñas, sin sombra y ocultas a más de 70 m.
- **Nada se compila durante el juego:** lo que aparece después de la carga (los animales) se compila con mallas de muestra (`Animales.muestras()`).
- **Entradas con fundido:** al empezar, viajar o reaparecer, la pantalla queda a negro hasta que los fotogramas vuelven a ir fluidos (como mucho 1,8 s; números en `ENTRADA`), para no ver los tirones de los primeros fotogramas en un sitio nuevo.
- **Equipos modestos:** si tras 4 s en la portada el valle no llega a 45 FPS (`SUGERENCIA`, contando fotogramas reales), se propone bajar un nivel de calidad, o directamente la baja por debajo de 25 FPS; se aplica al recargar y «Seguir así» no vuelve a preguntar. La resolución dinámica cuenta los fotogramas largos recortados a 100 ms (antes descartaba los de más de 250 ms, y en un equipo muy lento no bajaba nunca). Probado con render por software (SwiftShader, ~1 FPS): carga en 6 s sin errores, baja la resolución al mínimo y propone la calidad baja.

### 5.5 Cómo se comunican los módulos

- **Objetos globales:** cada módulo expone un objeto (`Sis`, `UI`, `Fauna`, `Jefes`…) que los demás llaman directamente.
- **Bus de eventos:** para avisos que interesan a varios módulos. Por ejemplo, la fauna emite `dañoJugador` y `calmado`, y el juego y las misiones reaccionan.
- **Misiones por eventos:** las acciones generan eventos con nombre (`saltar`, `planear`, `chispa`, `calmar:kuma`, `jefe:musgoso:purificado`…). Cada paso de misión espera uno de ellos, así que añadir misiones no exige tocar la física ni el combate.

### 5.6 Estado y guardado

- Todo el progreso vive en `Sis.ST`: capítulo, inicio, nivel, experiencia, vida, luz, inventario, equipo, misiones, lugares, cofres, murales, ecos, fragmentos, retos, gólems, cielo rojo, habitantes ausentes y punto de luz.
- Una sola clave de campaña: `ecos3_luna_partida` (`Campana.clave`). Se guarda cada 30 s y tras momentos importantes. Los ajustes conservan `ecos2_ajustes`.
- Las partidas antiguas `ecos2_partida` no se leen ni se borran. No hay selector de campaña.
- `Sis.ST.capitulo` decide regiones y sistemas activos según `CAPITULOS`. `Sis.ST.inicio` conserva las lecturas y conversaciones del inicio. Los guardados del piloto sin capítulo se migran según hayan leído el registro.
- Un reto resuelto deja el fragmento en el altar. Se integra en Hikari al tocarlo; los pedestales y el robo del final anterior no rigen esta campaña.
- Continuar carga la partida. Nueva partida conserva la confirmación mediante doble pulsación cuando hay progreso y reinicia el mundo. La práctica trabaja con un estado temporal.

### 5.7 Calidad gráfica

| Ajuste | Alta | Media | Baja |
| --- | --- | --- | --- |
| Distancia de visión | 430 m | 340 m | 230 m |
| Sombras | 2048 px en 140 m | 1024 px en 110 m | Sin sombras |
| Hierba | Densa | Media | Sin hierba |
| Tubería HDR (*bloom*, exposición automática) | Sí | Sí (bloom desde 1/4 de resolución) | No: dibujo directo con tono ACES |
| Oclusión ambiental · rayos de sol · reflejos en el agua | Sí · Sí · Sí | No · Sí · Sí | No |
| Antialias | MSAA ×4 | MSAA ×2 | El del navegador |
| Resolución dinámica mínima | 70 % | 60 % | 50 % |
| Detalle de vegetación cercana | 85 % | 62 % | 45 % |

Las tres calidades se han comprobado sin errores en la campaña única. Las cifras de FPS y coste que siguen son históricas, de fases anteriores a la fusión; el rendimiento actual enchufado queda por medir. Las tres calidades comparten el cielo físico, las nubes, la niebla atmosférica, la luz del cielo (IBL) y el agua nueva. Con una Intel Arc 140V a 1080p, enchufada y sin límite de FPS (tras la segunda ronda de pendientes): alta 98–188, media 105–188 y baja 164–254 según la zona. Dibujar la escena cuesta unas 150–230 llamadas en alta (sombras incluidas) y 1,5–2 ms de CPU: los halos van en un solo lote y las mallas instanciadas vacías no se dibujan. La gruta, antes la más cara (79), va a 168: dentro de una cueva el sol no dibuja sombras, las dos luces de cueva son una sola y la roca usa el triplanar barato (−43 % de GPU frente al fin de la fase 10). En aquella medición, con el límite normal de 60 Hz el juego iba estable a 60 FPS. La calidad se cambia en Ajustes y se aplica al recargar.

---

## 6. Cada apartado en detalle

### 6.1 Mundo y terreno

**Qué tiene.** Una isla principal de 1000 × 1000 m con cinco biomas, caminos, dos cuevas y lagunas. Yoake tiene terreno propio fuera del Velo, desde el capítulo 4. Pradera y Sakura figuran abiertas desde el prólogo; Marea abre en el 2, Duna en el 3 y Kiri en el 6.

| Bioma | Centro (x, z) | Carácter | Lugares |
| --- | --- | --- | --- |
| Pradera del Alba | 0, 0 | Colinas verdes, caminos, el corazón del valle | Faro del Alba, aldea de Hinode, Mirador, círculo de piedras |
| Bosque de Sakura | −270, −240 | Cerezos, bambú, pétalos | Santuario del Pétalo, Gruta de las Luciérnagas |
| Cumbres de Kiri | 270, −262 | Montañas nevadas, un lago helado por el que se anda, una aguja de 120 m | Santuario de Escarcha, Cueva de Cristal, Cima de Kiri (losa de piedra con santuario pequeño, mojón y farol), arena del Gólem de Escarcha (torii de piedra con cuerda sagrada, fogatas con anillo de piedras, espigas de hielo y mojones) |
| Dunas del Sol Dormido | 272, 256 | Arena, cactus, pirámides escalonadas, oasis con palmeras, juncos y nenúfares | Santuario de la Duna, Oasis del Sol Dormido (campamento con toldo y losas hasta el agua), arena del Gólem de Arena (puerta de arenisca, columnas con capitel y ruinas alrededor) |
| Lagos de Marea | −262, 262 | Lagunas, juncos, nenúfares; pradera húmeda con una franja de barro en la orilla | Santuario de la Marea, muelle de Kaito, arena del Gólem de Marea (Estanque Sagrado con bordillo y nenúfares, plataformas de sillería con farol, torii en la entrada) |

**Cómo se construyó.** La altura del suelo sale de una función de ruido (`altura(x, z)`), que mezcla colinas, montañas y la forma de la isla. Los lugares importantes se registran en `SITIOS` y el terreno se aplana a su alrededor. El suelo se divide en trozos que se generan y simplifican según la distancia. Un shader pinta hierba, roca, nieve o arena según el bioma y la pendiente. Los fragmentos recuperados devuelven color a sus regiones. El cielo rojo de la Noche Roja es un estado adicional dentro del Velo. Fuera, en Yoake, se ve el amanecer aunque el faro siga roto. Yoake se dibuja en el minimapa y en un recuadro del mapa grande; su costa calma las olas del mar.

### 6.2 Vegetación y ambiente

**Cielo rojo** (rediseño de la historia, desde la Noche Roja hasta el final): un segundo eje encima de la hora del día, de 0 a 1, que entra en 25 s. La tabla del cielo pasa a su luminancia teñida de carmesí, así que el cielo, la bruma, la perspectiva aérea, los reflejos del agua y la luz ambiental cambian a la vez; el sol se vuelve rojo y más débil, hay más nubes y más densas, más bruma, un poco menos de saturación, balance cálido y menos exposición (más oscuro). De noche, el cielo es carmesí oscuro y las nubes brillan en rojo durante la Noche Roja del capítulo 4. En Yoake no se proyecta ese rojo. Números en `CIELO_ROJO`; `Atmosfera.rojo(k, dt)` lo fija o lo acerca. En el final, el cielo rojo se rompe al amanecer. Rehacer la tabla mientras cambia no da tirones (medido: el peor fotograma de la transición, 17,7 ms).

**Qué tiene.** 13 tipos de árboles, plantas y rocas (cerezo, arce, pino, palmera, bambú, cactus, arbusto, roca, roca nevada, peña, junco, nenúfar y cristal), hierba que se mueve con el viento y partículas por bioma: polen, pétalos, nieve, arena, luciérnagas y motas de agua.

**Cómo se construyó.** Cada tipo es un modelo generado una vez y dibujado miles de veces con *instancing* (una sola llamada para todas las copias). Cerca se ve el modelo completo y lejos una versión simple. Los troncos tienen colisión circular.

### 6.3 Lugares y estructuras

**Qué tiene.**

- **Ruinas del Mirador:** en una loma de la Pradera que mira al faro y al valle: terraza octogonal con columnas rotas, la roca con la katana, muro caído, columna tumbada, banco y farol.
- **Faro del Alba:** pagoda de 4 niveles sobre un basamento de dos gradas con escalinata en los cuatro lados y baranda; tres pisos de entramado (postes lacados, zócalo, vigas, puertas de papel con celosía en el primero y ventanas de listones que brillan en los demás), ménsulas bajo los aleros, tejados con esquinas levantadas y el último piso abierto, donde flota el corazón de cristal; en la cumbre, el sōrin dorado (nueve anillos y llama de agua). Plaza circular de dos niveles con 8 faroles que dejan libres las escalinatas y bancos de piedra, 4 pedestales tallados para los fragmentos y torii; la hierba llega hasta la plaza.
- **Aldea de Hinode** (con un torii a la entrada, sobre el camino del faro, y otros tres por el camino, en el tramo abierto de la Pradera: refugios contra el ojo del Cazador, `ALDEA.toriiCamino`; huertos con valla de bambú y un santuario de camino alrededor; 6 casas de entramado, con ventanas de listones en los cuatro lados y la mitad con tejado de frontón; cortina en la puerta, farolillo, barril, leña, guirnaldas de farolillos sobre la plaza y charcos de luz cálida ante las puertas que se notan al amanecer y de noche; caminos de losas cerca del faro, la aldea y el Pétalo), **ruinas del Mirador** con la katana clavada y **muelle de Kaito** (sobre el agua, con barca, amarres, farol, cobertizo, redes secándose y carga).
- **4 santuarios:** del Pétalo (salón con galería y baranda, tejado irimoya, cuerda sagrada sobre la puerta, farolillos, caja de ofrendas y faroles numerados), de Escarcha (puerta de piedra con viga curva y cuerda sagrada ante la Cueva de Cristal y sus cristales de memoria), de la Duna (templo escalonado con escalinata hasta un santuario con columnas y disco solar, 3 pirámides con cornisas y escalinata hasta la cima (faroles y pedestal del glifo), reloj de sol, dos cabezas de piedra medio enterradas, toldos, vasijas y puerta de arenisca) y de la Marea (pabellón de entramado sobre pilotes con baranda y pasarela, torii dentro del agua, rocas con faroles, nenúfares y campanillas de viento).
- **Bocas de las cuevas:** la ladera sube con suavidad sobre la entrada y un pórtico de roca la enmarca; se entra andando y el túnel lleva a la cámara.
- **Formaciones:** arcos de roca, chimeneas de roca, columnas de basalto y círculos de piedra.
- **Objetos:** 8 murales con la historia (cada uno con una capa oculta que solo se ve con el farol de Tsuru), 8 cofres, faroles de piedra y 11 linternas de punto de luz.
- **El farol de Tsuru** (rediseño, fase 19): un farol de mano de madera y papel con una brasa dentro (`FAROL` y `Gente.farol`, 25-gente.js). Lo lleva la Abuela Tsuru en la mano izquierda (el bastón, en la derecha); cuando es de Hikari, le cuelga de la cintura y se balancea al andar (`Hikari.llevaFarol`). Es un objeto especial del zurrón. A su luz, al acercarse a un mural (entero a 3 m, empieza a verse a 10 m), aparece la **capa oculta**: otro dibujo en trazos de brasa (un niño que sube la escalinata hacia el sol, las cuatro familias, el pueblo que canta mientras alguien sube, una madre en la orilla, dos hermanos bajo el cerezo, la despedida desde la cumbre, un sabio que lleva niños arriba y la máscara sobre el Eco) y, con E («Alzar el farol ante el mural»), su texto, que va al diario debajo del del mural (`GUION.muralesOcultos`, estado `Sis.ST.ocultos`). Los murales cuya capa falta brillan en color brasa. Se consigue al final de la Noche Roja, cuando Tsuru se pierde.
- **Yoake:** embarcadero y barca de Kaito, refugio, huertos, cisterna con compuerta, torre de señal con postigo y mirador. Obra y puntos en `62-isla-yoake.js`.
- **5 arenas de jefe** (detalle en 6.8).

**Cómo se construyó.** Cada lugar es una función que arma piezas geométricas y registra sus colisiones (cajas y cilindros sólidos del objeto `Sol`) para que se pueda caminar y trepar por ellos. Todas las piezas se funden en una sola malla con el **material de obra** (`24-arquitectura.js`): cada pieza lleva una clase (piedra en sillares, madera, enlucido, teja, laca, arenisca, metal, roca, corteza o piedra tallada) que elige una capa de `Texturas`; la textura se proyecta en el mundo como detalle sobre el color de la pieza, las tejas siguen la pendiente de cada tejado y las vetas de los postes van a lo largo. Las piezas detalladas son funciones propias: torii con la viga superior curva, anillos negros, cuñas y placa; farol de piedra hexagonal (basa, fuste, caja de luz con ventanas, tejadillo con las esquinas levantadas y joya); casa de pueblo con zócalo de piedra, entramado de madera, paños de enlucido, puertas de papel con celosía que brillan, galería de tablas y tejado de teja con remate; zorros de piedra con babero rojo; y los faroles de los puntos de luz (andon con celosía). La obra de las cinco arenas también se funde, lo que bajó las llamadas de dibujo (pradera de 310 a 241). Las cuevas usan la misma roca con textura y la lámpara de Hikari es más suave y alta dentro de ellas (`LAMPARA` en 10-juego.js).

### 6.4 Hikari, Lumi y los personajes

**Actualización de personajes · fase 23 (23 de octubre de 2026).** Por petición del usuario, la presentación se acerca a la suavidad de Sky conservando las identidades del valle. Hikari viste ahora una túnica corta marfil con ribete dorado sobre calzas y mangas índigo; mantiene máscara, armas y mantos. Su capa pasa de 0,64 a 0,72 m de largo, de 0,26 a 0,40 m de ancho en los hombros y de 0,50 a 0,94 m de ancho inferior, que aumenta suavemente hasta 1,42 m al planear. La simulación incorpora bajo curvo, diagonales suaves y conservación lateral del volumen, con libertad para ondear. El trote reduce el rebote y la rigidez de los codos; el planeo añade balanceo lento y la mirada sigue la cámara con suavizado continuo.

`ASPECTO_PERSONAJES` (17-hikari.js) define relleno, contorno, color y exponente por identidad: Hikari, habitantes y Ocaso. Los tres comparten programa por uniformes y no añaden luces ni pases de dibujo. El brillo propio de Tasogare sigue apagando también su contorno. La capa de Hikari incorpora un programa de tela con relleno suave, compilado al cargar; las demás telas conservan su material. Se reduce el halo de Hikari para que no borre el detalle del cuerpo. Los habitantes tienen ribetes en mangas y bajo, cuello en V y transiciones separadas de cabeza, brazos y torso (`GENTE.animacion`); su iluminación ya no depende del nivel de luz de Hikari. Las figuras de los ecos conservan su material translúcido.

**Revisión reproducible:** `node herramientas/personajes.mjs [--raiz copia-anterior] [--salida carpeta] [--calidad alta|media|baja]` guarda retratos y un informe JSON; comprueba once poses y una transición de teletransporte y pausa buscando coordenadas inválidas. La comparación de GPU se hace por separado con `comparar.mjs`, y las escenas de juego con `probar.mjs`. Inventario del reparto: [PERSONAJES.md](PERSONAJES.md).

**Resultado de la fase 23:** doce comprobaciones válidas y prólogo completo simulado (76,3 s), sin errores de consola. En Intel Arc 140V, 1920 × 1080, aldea/Kiri/Cueva de Cristal: alta 94/101/128 FPS, media 100/109/130 y baja 121/128/133. Son medias en ventanas de tres segundos; en la tanda final de alta hubo un fotograma de 25,2 ms. A/B de GPU: +4,1 % faro, +0,2 % aldea y +0,3 % cueva, con ruido de ±3–5 %. Capturas en `herramientas/salida-personajes/despues/`; el informe `resultado.json` registra poses, GPU, programas y finalización del prólogo.

**Hikari** mide unos 1,15 m y lleva un borde de luz que la separa del fondo. Túnica marfil sobre calzas y mangas índigo, líneas turquesa que brillan más cuanta más luz tiene, máscara marfil y oro (con una grieta fina que crece con cada revelación: su evolución sigue los recuerdos y revelaciones de los capítulos; `Hikari.grieta(k)`, estado `grieta`), capucha y capa en degradado carmesí, ámbar y oro. Es una malla continua con esqueleto de 21 huesos (skinning), así que codos y rodillas se doblan sin cortes. La animación es procedural: los pies se apoyan de verdad en el suelo (IK de dos huesos), la zancada y la cadencia dependen de la velocidad, la cadera baja en pendientes y escalones, los brazos y el tronco se coordinan con las piernas, se inclina al acelerar y en las curvas, flexiona las rodillas al aterrizar, respira y mira hacia donde mira la cámara. Además mezcla poses para saltar, planear, nadar, deslizar, trepar, aupar, esquivar, atacar, cargar, apuntar el haz, canalizar, recoger, acariciar y recibir daño. La capa y las cintas son tela simulada (la capa ondea más rápido y con más fuerza cuanto más corre, se ancla en arco sobre los hombros y conserva una sección curva, así que de lado no se ve como una lámina; números en `CAPA`), y las alas de luz aparecen al planear.

**Tasogare, el Guardián del Ocaso** (forma normal, fase 26): el último guardián del faro, padre de Akari y cómplice de la suplantación. Su duelo de plaza y espiral ocurre en el capítulo 5; muere al detener Hikari la extracción de Momo. Mide 2,40 m hasta la cabeza y 2,58 m con capucha. Kimono negro hasta el suelo, faldones separados con bajo desgarrado, mangas amplias, guanteletes, botas, pecho y hombreras de láminas con oro envejecido y cordones rojo oscuro. La máscara de marfil ennegrecido no muestra piel, cabello ni facciones humanas. Una grieta diagonal cruza su **ojo izquierdo rojo**, a la derecha de la imagen frontal (+X del personaje); el derecho permanece oscuro. La Hoja del Ocaso es una pieza independiente con una fractura fija, conservada incluso en el prólogo; el fragmento que se desprende es un efecto narrativo separado. La capa física conserva un patrón fijo de roturas y se abre como alas oscuras.

Fuente geométrica y rig en `48-tasogare-modelo.js`; poses y simulación en `36-tasogare.js`. `Tasogare.efectos({ojo,filo,brasa,brasas,oscuridad})` separa las emisiones, las partículas JavaScript y el oscurecimiento del material. El material amplía el shader de Hikari y compila sus variantes en la carga. El duelo conserva avisos de 0,62 s (combo 0,42) y corte de 0,25 s; parada, pulso y rotura de guardia muestran la pose `recibir`.

Entrega en [modelos/tasogare/LEEME.md](../modelos/tasogare/LEEME.md): GLB y fuente Blender editable, glTF, arma GLB independiente, atlas 1024 × 1024, 19 964 triángulos, 54 huesos y nueve clips. Cuerpo, máscara, armadura, capa y espada son piezas separadas; capa y mangas tienen huesos, y los nodos de cápsula y volúmenes de daño contienen metadatos para un controlador. La antigua forma gigante (44) se borró.2. El juego genera su arte por código y no descarga estos GLB.

**Lumi** acompaña y guía a Hikari con {lumi}. Es informante de la Luna Roja; en Duna conoce la suplantación y sigue informando. En el capítulo 6 confiesa y la Luna la somete con tres ataduras. Tras la liberación final queda viva como luciérnaga.

**Personajes y continuidad:**

| Personaje | Lugar y función vigentes |
| --- | --- |
| Tsuru | Hinode; guía del inicio y recibe el té. Muere en la Noche Roja del capítulo 4; Momo hereda el encargo |
| Momo | Hinode, captura al final del 4, rescate en el 5 y traslado a Yoake; murales, espíritus y té heredado |
| Yuki | Hinode y rutas de evacuación; luz dispersa, animales y entrega del equipo de Kuma |
| Kaito | Muelle y barca; padre de Rui, travesías a Yoake y La caña de Kaito |
| Taiyō | Mirador y después Hinode; registros, responsabilidad por las ofrendas, ecos y Cumbre de Kiri |
| Sayo | Gruta y después Yoake; madre de Nao y testigo de los exiliados |
| Aiko, Taku, Ren, Sora y Chiyo | Familias de Yoake; refugio, agua, señal y vida fuera del Velo |

Sayo lleva manto índigo, capucha bajada, remiendos, colgante del disco completo y farol cerrado. Sus rasgos se definen como campos reutilizables de ficha en `25-gente.js`.

Los habitantes (`25-gente.js`) tienen cuerpo con esqueleto: kimono con mangas anchas que siguen a los brazos y falda que sigue a las piernas, obi con lazo, cuello blanco, pelo con moño y accesorios según la ficha (sombrero de paja de Kaito, barba de Taiyō, bastones y la caña de pescar con sedal y corcho). Cada uno tiene una rutina: la Abuela Tsuru pasea despacio y encorvada con su bastón, Momo corretea y salta alrededor de su sitio, Yuki vigila entre tres puntos con las manos a la espalda, Kaito pesca al final del muelle (da tirones de vez en cuando) y Taiyō medita de pie con el bastón; si Hikari se acerca, alza la cabeza y la saluda con una reverencia. Todos la siguen con la mirada a menos de 9 m, dejan lo que hacen y se giran hacia ella a menos de 4,2 m y gesticulan mientras hablan. Tienen **cara**: ojos que parpadean, cejas y boca que se mueve al hablar, con un gesto que sale de su rutina o de su ficha (`GESTOS` y `GESTO_DE`: Momo va alegre, Yuki seria, Taiyō medita con los ojos entornados y los ecos que cantan abren la boca); al llegar Hikari sonríen y alzan las cejas un momento. Ojos, cejas y boca son huesos de la misma malla, así que no añaden llamadas de dibujo. Los ecos tienen la misma cara, con los rasgos brillando.

### 6.5 Movimiento y física

| Acción | Valor actual |
| --- | --- |
| Caminar / correr / agachada | 3,2 / 6,8 / 1,25 m/s en terreno plano (2,6 / 5 con un enemigo fijado); guardia 1,5 m/s (`MOV.vel`). Marcha procedural con IK; estética y transiciones pendientes de pulido |
| Aceleración / frenado | 7,2 / 9 m/s² (`MOV`); en el lago helado 5 / 3; la nieve agarra como la tierra. En el aire, 8 m/s² |
| Giro del cuerpo | En el suelo, hacia donde pide el mando (no hacia donde aún lleva la inercia); 14 rad/s parada, 7 rad/s a toda velocidad; derrape al invertir la dirección a más de 2,8 m/s |
| Pendientes | Cuesta arriba hasta un 30 % más lenta, cuesta abajo hasta un 12 % más rápida |
| Deslizar | Correr a más de 4,8 m/s y pulsar C (LT); frena 6,2 m/s² (2,3 en nieve, 11,7 en arena) y acelera cuesta abajo |
| Trepar | Empujar contra una pared o un acantilado de más de 51°; 1,6 m/s, gasta 8 de luz por segundo (2,5 quieta). Espacio salta hacia atrás, C se suelta. Si no se mueve la cámara (o queda atascada a menos de 1,5 m), se coloca sola a la espalda de Hikari (`CAM_TREPA`); probado en acantilados de la pradera, Kiri y las dunas y en un muro de piedra |
| Aupar | Salientes de 0,45 a 1,75 m: Hikari se sube sola al empujar contra ellos o al llegar en el aire, si el camino está libre (no atraviesa vallas ni barandillas, que tampoco se pueden aupar ni trepar) |
| Nadar / bucear | 3,2 / 2,6 m/s |
| Salto | 9,9 m/s hacia arriba, con gravedad de 24 m/s². Un Espacio pulsado hasta 0,12 s antes de aterrizar (o de acabar la esquiva) cuenta, y aún se salta hasta 0,12 s después de salir de un borde |
| Cámara | Inclinación de −0,45 a 1,05 rad (no llega a la vista cenital). Las columnas finas (espigas, faroles, postes) no la acercan a Hikari; si acaba dentro de una, se aparta de lado (`CAM_PITCH`, `CAM_COLUMNA`) |
| Doble salto | Desde el nivel 2 |
| Planeo | 8,8 m/s hacia delante; cae a 2,1 m/s (1,5 m/s desde el nivel 4) |
| Gasto de luz al planear | 10 por segundo (6 desde el nivel 4) |
| Recuperación de luz | 16/s quieta, 9/s andando, 34/s dentro de una corriente de aire |
| Recuperación de vida | 1,6/s tras 6 s sin daño (no durante un jefe) |
| Daño por caída | Si el impacto supera 19 m/s, hasta 35 de daño |

Además: árboles, rocas y cactus solo chocan por debajo de su altura (al planear o saltar por encima no frenan), las pendientes muy empinadas hacen resbalar, el lago helado reduce el agarre (la nieve no), 5 corrientes de aire cálido elevan al planear (3 forman la ruta a la aguja de Kiri; la última sube lo bastante para posarse en la losa de la cima) y una corriente devuelve a la isla si se nada demasiado lejos.

### 6.6 Combate y acciones de luz

Cada arma tiene su propio combo y su peso (fichas en `ARMAS`, 20-armas.js; números del combate en `COMBATE`, 21-combate.js). La hoja sigue una trayectoria (anticipación, golpe, seguimiento y recuperación), los brazos la siguen con IK y solo daña mientras barre: cada animal o gólem recibe un golpe por tajo. Deja una estela de luz del color del arma.

| Arma | Combo | Golpe cargado (nivel 5) | Peso |
| --- | --- | --- | --- |
| Sin arma | 3 golpes de palma | Palma con impulso | Ligero |
| Katana del Alba | Tajo diagonal, revés, tajo ascendente y estocada | *Iai*: desenvaine a la carrera (avanza 3,4 m) | Ligero |
| Naginata de Escarcha | Estocada, barrido amplio (245°) y golpe por encima de la cabeza | Remolino de 420° alrededor de Hikari | Medio |

- **Encadenar y cancelar:** pulsar ataque durante un golpe lo encadena al terminar su seguimiento; la pulsación se recuerda 0,32 s. La esquiva cancela un golpe salvo en su parte comprometida (de la mitad de la anticipación al final del tajo) y la guardia cancela su recuperación; moverse también la cancela desde que se podría encadenar (salvo con otro golpe pedido o cargando). Una esquiva pulsada hasta 0,2 s antes de poder esquivar sale en cuanto se puede. Atacar al terminar una esquiva lanza el golpe tras la esquiva.
- **Peso:** cada golpe pesa 1, 2 o 3. Cuanto más pesa, más pausa de impacto (0,045 a 0,12 s), sacudida, vibración y empuje. Si el peso alcanza el aguante del animal (1 los pequeños, 2 los demás, 3 el oso y los animales con nombre grandes), se tambalea y su ataque se interrumpe.
- **Fijar objetivo** (Z, clic central o R3): elige el animal o gólem más cercano al centro de la cámara; la cámara lo sigue, Hikari lo encara al andar y los golpes se acercan a él hasta 3,2 m. Mover el ratón o el stick cambia de objetivo; se suelta a más de 32 m o al calmarlo.
- **Guardia** (mantener R o RB): Hikari anda a 1,5 m/s y detiene los golpes de frente (arco de 126°): cada punto de daño detenido cuesta 0,8 de luz y llega solo el 25 %. Sin luz suficiente, la guardia se rompe. No detiene los ataques que caen del cielo o salen del suelo (lluvia de rocas, estacas, tormenta, arenas movedizas, cascada, torbellino y raíces).
- **Parada:** alzar la guardia como mucho 0,2 s antes del golpe lo anula, devuelve 12 de luz, aturde al animal 1,8 s (y calma el 25 % de su ánimo) o, contra un gólem, le quita un 35 % de su equilibrio y, si el ataque es interrumpible, lo hace tambalearse 1,2 s. El siguiente golpe en 1,4 s es un contraataque con un 60 % más de daño. Pulsar la guardia sin parar no sirve: tras soltarla hay que esperar 0,4 s.
- **Reacciones de Hikari:** un golpe recibido la hace tambalearse 0,3 s; uno que quita al menos el 16 % de la vida máxima (o la embestida de un Cazador) la derriba (cae de espaldas y se levanta en 1,15 s, sin recibir daño mientras tanto). Puede levantarse rodando con la esquiva a partir de la mitad.
- **Esquiva:** voltereta de 0,46 s con 0,42 s de invulnerabilidad y 0,9 s de espera. Desde el nivel 7, esquivar justo a tiempo devuelve luz.
- **Pulso de luz** (nivel 3): cuesta 30 de luz, afecta a 14 m y recarga en 6 s. Empuja, calma, enciende receptores e interrumpe ataques de los jefes.
- **Haz de luz:** rayo continuo que se apunta con la cámara (clic derecho o RT). Permite moverse; no gasta luz (salvo en la espiral del duelo), pero mientras está encendido la luz no se recupera; enciende balizas y fogatas, quema puntos débiles y purifica el núcleo de un gólem aturdido. El pulso lo corta.
- **Canalizar:** mantener E (o Y) junto a un punto. Sirve para crear puntos de luz, encender balizas y purificar el núcleo de un gólem vencido.

### 6.7 Fauna

| Tipo | Especies | Comportamiento |
| --- | --- | --- |
| Huidizos | Ciervo, conejo, zorro, zorro ártico, lagarto de arena, pato de laguna | Huyen; se acercan si Hikari está agachada y quieta |
| Tranquilo | Tortuga de marea | Pasea despacio |
| Defensivos | Jabalí, lobo, oso, escorpión, cangrejo | Solo atacan si los golpeas, con aviso previo |
| Con nombre | Colmillo de Bruma (jabalí), la manada blanca (3 lobos), Kuma (oso) | Versiones grandes ligadas a misiones |

Los cuadrúpedos son mallas con esqueleto (`19-animales.js`): cada pata se apoya en el suelo con IK y la marcha cambia con la velocidad (paso, trote, galope; el conejo salta y el lagarto repta). El cuerpo se inclina con el terreno, la cola y las orejas reaccionan al estado y al echarse pliegan las patas. El pato nada, picotea bajo el agua y alza el vuelo al huir; la tortuga esconde la cabeza; cangrejo y escorpión caminan con 8 patas.

Comportamiento (números en `CONDUCTA`): ciervos, patos, jabalíes y lobos van en **manadas** que siguen a un guía; pastan, pasean, olfatean y se echan a descansar. Si uno se alarma, la alarma se contagia al resto con un pequeño retraso y huyen juntos. Los defensivos **avisan antes de atacar** (el oso se yergue, el jabalí escarba, el lobo se agacha, cangrejo y escorpión alzan las pinzas) y solo atacan si los golpeas. **Se turnan para atacar:** solo uno ataca a la vez; los demás esperan rodeando a Hikari un poco más allá de su alcance (`CONDUCTA.turno`). Al pasear o huir **rodean los obstáculos** (agua, rocas, construcciones) buscando a los lados; si no encuentran paso en unos segundos (`CONDUCTA.rodeo.paciencia`), eligen otro destino. Lejos de Hikari la animación se actualiza a mitad de frecuencia y sin sombra propia (`LOD_FAUNA`).

Cada animal tiene una barra de «ánimo». Al agotarla se sienta en calma, deja una ofrenda (pelaje, colmillo, pluma, concha…) y da experiencia.

### 6.7b Sombras y encuentros de capítulo

**Tasogare (capítulo 5).** El duelo de la plaza usa `42-duelo.js`: cortes que se pueden parar, cargas que se esquivan, guardia, equilibrio y ventanas de contraataque. La subida por la espiral usa `43-duelo-espiral.js`: las plataformas solo se pisan al iluminarlas con {haz}; Sombras y un Cazador amenazan el avance. Arriba está el extractor de Momo. Tasogare no se transforma en gigante.

**Lumi (capítulo 6).** Tres ataduras con formas distintas —círculo, dos barras y triángulo— sostienen el control de la Roja. Sus nudos se rompen con {haz} o {atacar}. Sistema en `66-lumi-enlaces.js`.

**Luna Roja física (capítulo 7).** Tras evacuar y abrir el conducto, encarna en un cuerpo tangible. El combate pasa por anclajes, cuerpo y máscara. Se cortan cuatro conexiones y, después de vencerla, se canaliza junto al núcleo para liberar la reserva y a la Dorada. Sistema en `67-duelo-luna.js`; modelos en 64 y 65.

**Asedios.** `37-asedio.js` lleva las oleadas de Hinode en el capítulo 4 y de la plaza del faro en el 7. El segundo abre la evacuación; no precede a un nuevo duelo contra Tasogare.

**Cazadores del Ocaso.** Conservan su ojo, haz de vigilancia, avisos, embestida y pérdida de motas. El jugador puede esquivar y usar cobertura de terreno, rocas, árboles, casas, torii y cuevas. Patrullan cuando los activa la historia: huida del inicio, encuentros guiados y Cazador invocado de la espiral. La caza de la campaña anterior (derribarlos con la Odachi para aclarar el cielo) se borró del código; hoy solo queda el de la pradera, más el que invoca la espiral.

Las Sombras son los enemigos comunes de la red lunar: se destruyen y sueltan la luz que robaron. Hay tres tipos comunes y una élite, el oni, que guarda cada santuario. Con el cielo rojo, cada zona suelta una rastrera más y se vuelve a llenar en la mitad de tiempo (`SOMBRAS_CFG.rojo`).

| Sombra | Grupo | Ánimo | Daño | Cómo ataca | Cómo se vence | Motas |
| --- | --- | --- | --- | --- | --- | --- |
| Rastrera | 3 a 5 | 22 | 8 | Acecha en círculo a 3–5 m, avisa 0,45 s (se agacha y le arden los ojos) y salta sobre Hikari | Combo (2–3 golpes de katana), un pulso, o parar su salto (rebota aturdida) | 3 |
| Escudo | 1–2 por grupo | 34 | 10 | Avanza despacio tras un farol de hierro apagado, se inclina 0,6 s y golpea de cerca | Su farol para los golpes de frente; se quiebra (para siempre) con un golpe cargado, un arma pesada, la onda o el pulso; por la espalda no protege | 5 |
| Oni (élite) | 1 por santuario | 240 | 18 / 14 | Grande (2,7 m), con una maza de tinta: **mazazo** de frente (marca roja en sector, 0,85 s; se puede parar) y **barrido** alrededor (anillo rojo, 0,7 s; no se para: se salta o se esquiva) | Su armadura de tinta se queda con el 75 % del daño; cada golpe gasta su **equilibrio** (90; más con armas pesadas y contraataques; una parada gasta el 35 %, el pulso 12). Sin equilibrio queda **roto**, de rodillas 3 s, y recibe el daño entero: hay que romperlo unas dos veces. Un golpe pesado durante su aviso lo interrumpe | 25 |
| Lanzadora | 1–2 por grupo | 18 | 7 | Guarda 8–13 m, huye si Hikari se acerca a menos de 5 m, carga una esquirla roja en la mano 0,55 s y la lanza | Acercarse (planeando, corriendo); un pulso deshace sus esquirlas; parar una esquirla a tiempo la devuelve y la rompe (24 de daño) | 4 |

**Grupos:** de fácil a difícil por región: la Pradera solo rastreras; en Sakura se suma el escudo; desde los Lagos, la lanzadora; en Kiri, dos escudos, una lanzadora y una rastrera. Todas rodean a Hikari desde donde están, sin cruzarle por delante.

**Onis de guardia:** uno en el camino de llegada a cada santuario (en Escarcha, en el borde de la plataforma), mientras no se haya recuperado ese fragmento. Aparece cuando Hikari lleva la katana y se acerca (60 m), espera de guardia mirando al camino y despierta a 18 m (con un aviso la primera vez). Mientras vive, el reto del santuario no responde («Un oni de sombra guarda este santuario»). Si Hikari se aleja más de 30 m de su puesto, vuelve a él y se cura. Vencido, el santuario queda libre (se guarda en la partida). Su barra (vida y equilibrio) es la de los gólems.

**Reglas:** como mucho dos atacan a la vez; brotan cuando Hikari se acerca a menos de 25 m de su zona y solo si ya lleva la katana; si se aleja más de 34 m se hunden en la tierra; una zona limpia vuelve a llenarse a los 4 minutos (y no mientras Hikari está cerca). Se pueden fijar como objetivo, salen como puntos rojos en el minimapa y despiertan la capa de tambores de combate. No entran en el agua (sí en el hielo). Chocan con la obra y los árboles como Hikari y, si uno las frena mientras acechan, lo rodean; no se meten en Hikari salvo al atacar (y la esquiva las atraviesa). Números en `SOMBRAS` y `SOMBRAS_CFG` (35-sombras.js).

**Cómo se construyó.** Cada Sombra es una malla de piezas abolladas (cada tipo con su silueta: la rastrera baja con seis patas, el escudo encorvado con su farol aparte —se rompe—, la lanzadora alta con esquirlas rojas en la espalda) con un material de tinta mate (refleja poco el cielo) que tiembla en el vértice y un borde rojo por Fresnel; un solo programa para todas, compilado durante la carga. Los ojos son halos del lote común. Entra en el combate por las mismas puertas que los animales: fijar objetivo, barrido de la hoja, onda de choque, pulso y parada (el daño a Hikari llega por `dañoJugador` con `s`).

### 6.8 Gólems guardianes

Cada bioma tiene un gólem en una arena llana de 24 m de radio. No aparecen solos: hay que cumplir un objetivo de exploración.

| Gólem | Bioma | Cómo se despierta | Cómo se purifica |
| --- | --- | --- | --- |
| Musgoso | Pradera | 3 Piedras Ancestrales en el Altar de Musgo | Arrancar su musgo (en fase 2 lo cura) y hacer que se estrelle contra un pilar |
| Escarcha | Kiri | Encender las 4 Balizas de Hielo | Golpear 3 veces su núcleo azul tras las estacas; en la ventisca, quedarse junto a una fogata; en fase 3, romper su armadura cuerpo a cuerpo |
| Arena | Dunas | 3 Glifos del Sol (en las pirámides) en las columnas rotas | Romper sus dos cadenas; evitar la tormenta y las arenas movedizas |
| Marea | Lagos | La Perla de Marea (fondo de la laguna) en el Estanque Sagrado | Destruir sus dos brazaletes; en el diluvio, subir a las plataformas |
| Cerezo | Sakura | 3 Semillas Espirituales en los cerezos marchitos | Quemar su manto de hojas con el haz y romper sus cristales |

**Reglas comunes.** Cada ataque se anuncia con una marca roja en el suelo; los golpes que se pueden parar (garras, embestida y cada golpe del combo) avisan además con un destello en la mano 0,32 s antes. La onda va por el suelo: se salta o se esquiva, la guardia no la para. Cambian de fase al 66 % y al 33 % de su barra de oscuridad (300 a 650 puntos según el gólem). El pulso interrumpe los ataques interrumpibles. Cuando quedan aturdidos, se arrodillan, su núcleo brilla y el haz lo purifica 2,5 veces más rápido.

**Equilibrio** (barra fina bajo la de oscuridad; números en `EQUILIBRIO`). Cada gólem tiene de 120 a 150 puntos. Los golpes cuerpo a cuerpo lo gastan según su peso (×0,6 ligero, ×1 medio, ×1,6 pesado; ×1,5 si es un contraataque), una parada gasta el 35 % y el pulso, 12. Se recupera a 8 por segundo tras 3 s sin recibir golpes. Al agotarse, el gólem queda aturdido 3,5 s con el núcleo expuesto. Un golpe pesado (ōdachi o golpe cargado) durante el aviso de un ataque interrumpible lo hace tambalearse 0,8 s y lo cancela. Tras vencerlos, canalizar 3 s junto al núcleo devuelve toda la vida. Purificar a los cinco da el **Manto del Guardián**. Si Hikari cae, el combate se reinicia y ella reaparece en su último punto de luz.

**Cómo se construyó.** Un sistema por datos: cada gólem es una ficha con altura, oscuridad, fases, ataques por fase y forma de activación. Hay 14 ataques genéricos (onda, lluvia de rocas, embestida, aliento helado, estacas, garras, tormenta, arenas movedizas, cascada, torbellino, proyectiles, pétalos, raíces y combo), cada uno con aviso, golpe activo y recuperación. El arte está en `22-golems.js`: cada gólem es un cuerpo articulado de bloques abollados (una sola malla con esqueleto: unas 13 llamadas de dibujo menos por gólem) (pelvis, tronco, cabeza, hombros, codos, puños y piernas con IK de dos huesos) con un material que proyecta las capas de `Texturas` (roca con musgo, arenisca, hielo translúcido, agua o corteza) y vetas de corrupción violeta que laten; al purificarlo, el color y las vetas vuelven a su tono en 2,5 s y se alza una columna de luz. Las piernas dan pasos pesados que levantan polvo y hacen temblar la cámara y se apoyan en desniveles: cada pie busca el suelo (terreno o sólidos) y la cadera baja e inclina el cuerpo hacia el pie más bajo (números en `ANIM_GOLEM.paso`). El Gólem de Marea es agua: su superficie fluye y refracta el cielo y el entorno (`ASPECTO_GOLEM.marea.agua`); los golpes recibidos lo doblan en la dirección del empuje y sueltan astillas del material. Los puntos débiles siguen siendo piezas separadas.

### 6.9 Progresión y equipo

- **Niveles 1 a 10.** La experiencia necesaria sube con cada nivel. Cada nivel da +12 de vida, +8 de luz y +8 % de daño.
- **Habilidades:** doble salto (nivel 2), pulso de luz (3), planeo mejorado (4), golpe cargado (5) y esquiva perfecta (7).
- **Armas obtenibles en la campaña:** Katana del Alba (daño 10, alcance 2,7 m), en el capítulo 1; Naginata de Escarcha (14, 3,5 m, más lenta), entregada por Yuki al completar `oso`. El código aún define la Odachi, pero la antigua misión de forja y la caza se retiraron.
- **Mantos:** del Alba, de Sakura (+20 % de luz), de Marea (+15 % de vida), de Escarcha (+15 % de daño), Solar (+15 % de luz y +10 % de daño) y del Guardián (+15 % de vida y de daño). Cambian el color de la capa.
- **Luz rescatada (motas):** el puntaje del juego; se gana con cada chispa (5) y cada eco (25), y al vencer Sombras; un Cazador que alcanza a Hikari le quita el 30 % (entre 5 y 40; la mitad se puede recoger); se guarda en la partida y se gasta en los altares de los santuarios (`LUZ_RESCATADA`, 07-sistemas.js).
- **Mejoras del altar** (pestaña «Altar» del menú; se compran junto a un altar de santuario, donde aparece «Ofrecer luz rescatada»): **Capa de luz** (planear gasta un 12 % menos de luz y cae un 6 % más despacio por nivel), **Corazón de luz** (+15 de vida máxima por nivel) e **Hilo de luz** (el efecto del manto equipado crece un 25 % por nivel); tres niveles cada una, de 40–60 a 160–200 motas (`MEJORAS_ALTAR`, 07-sistemas.js; se guardan en la partida).
- **Consumibles:** té de sakura (+45 de vida), onigiri (+30 de vida y +25 de luz) y esencia estelar (+80 de luz). Se cocinan en el Zurrón con materiales.

### 6.10 Misiones y retos

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

La oferta indica el primer capítulo posible. Las colecciones de toda la isla esperan a Kiri para completarse. Momo hereda el té de Tsuru; sus encargos esperan durante su captura y se entregan en Yoake tras el rescate. Los destinos siguen la ubicación vigente del habitante. Fuente implementada: [68-secundarias.js](../js/68-secundarias.js); la [entrega narrativa](entregas_chatgpt/2026-11-02_secundarias.md) conserva el diseño previo a la integración.

| ID de ficha | Gólem | Encuentro principal | Dificultad conservada |
| --- | --- | --- | --- |
| `g_cerezo` | Gólem del Cerezo | Capítulo 1 | Épica |
| `g_marea` | Gólem de Marea | Capítulo 2 | Épica |
| `g_arena` | Gólem de Arena | Capítulo 3 | Difícil |
| `g_musgoso` | Gólem Musgoso | Capítulo 5 | Media |
| `g_escarcha` | Gólem de Escarcha | Capítulo 6 | Difícil |

Los cinco combates están incorporados a las misiones principales. **Oferta independiente de las fichas `g_*`: por medir.** `11-jefes.js` aún las vincula a `faro`, una misión retirada. El capítulo de la tabla identifica el encuentro principal, no una oferta secundaria verificada.

El catálogo suma **28 fichas: 10 principales (dos del inicio, siete de capítulo y una de epílogo), 13 secundarias adaptadas y 5 de gólems**. Las fichas de gólem describen los mismos encuentros de la historia; no son cinco combates adicionales. `c7_luna` tiene `dif: 4`, pero `DIF` solo define 0–3: su etiqueta queda **por medir**.

**Contenido por datos.** `50-guion-inicio.js` aporta dos misiones del inicio. `59-guion-capitulos.js` añade siete de capítulo y el epílogo. `68-secundarias.js` aporta las 13 adaptadas; `11-jefes.js` suma las cinco fichas `g_*`. Sus pasos siguen eventos, inventario, destino, conversación o escena. Las ofertas secundarias admiten capítulo, objeto necesario y paso previo. `60-capitulos.js` reconcilia objetivos ya cumplidos para permitir exploración fuera de orden.

Los fragmentos se integran en Hikari al tocarlos, después de resolver cada reto. El robo y la devolución a pedestales pertenecían a la campaña retirada.

**Retos de los santuarios:**

- **Pétalo:** encender 3 faroles en el orden 1, 2, 3; si te equivocas, se apagan.
- **Marea:** bucear para reunir 5 perlas de luz y llevarlas al altar.
- **Duna:** reunir 6 orbes en 100 s, repartidos por las cimas del templo y las pirámides.
- **Escarcha:** repetir una secuencia de 4 cristales que se iluminan con notas. Mientras suena, la cámara sube sobre el altar para ver los cuatro; al repetirla, un marcador cuenta los aciertos y el altar deja volver a oírla; si se falla, suena la misma melodía. Los cristales del reto muestran su color también en reposo, y el centro de la cámara de la cueva queda despejado (la decoración va contra las paredes).

### 6.11 Interfaz

- **HUD:** nivel con anillo de experiencia, barras de vida y luz, tres **llamas** (vidas; laten en rojo si no queda ninguna), contador de **luz rescatada** (motas) con un «+n» al ganarlas y un «−n» en rojo al perderlas (la vida perdida deja un rastro claro que se vacía tras un instante; con menos del 30 % el borde late en rojo; la luz llena brilla), brújula con distancia al objetivo, minimapa que gira con la cámara, panel de misión, habilidades con su recarga, objetos rápidos, barra del animal o del jefe, temporizador, avisos, rótulos (en cola: título, región y eco nunca se pisan), aviso de interacción con barra de canalización, mira del haz y viñeta de daño.
- **Menú de pausa** con el estilo de la portada (emblema, esquinas doradas y pestañas subrayadas) y 8 pestañas: Misiones (de fácil a épica, con botón «Seguir»), Mapa (ocupa casi toda la pantalla, nombra todos los lugares —los no descubiertos en cursiva— sin que se pisen, con viaje rápido), Zurrón (objetos y cocina), Hikari (estadísticas y habilidades), Altar (mejoras con la luz rescatada), Diario (murales leídos), Controles (teclado y mando) y Ajustes.
- **HUD dinámico:** tras 6 s en calma (sin combate, con la vida y la luz llenas y sin diálogo) las barras, habilidades y objetos se atenúan al 30 %; brújula, minimapa y misión siguen visibles. Se puede desactivar en Ajustes.
- **Diálogos** con efecto de máquina de escribir, placa con el nombre y subtítulos con avance manual, **tarjetas del diario** (murales y ecos) y **créditos**.
- **Iconos** de trazo en SVG dibujados en el código (`28-iconos.js`), sin caracteres japoneses: toda la interfaz está en español.
- **Portada** (`29-portada.js`): la cámara recorre el valle al amanecer en tres planos que se funden (la plaza del faro, el valle desde lo alto y el pasillo de torii del Pétalo), con el faro a la derecha y el menú a la izquierda sobre una sombra suave; motas de luz y pétalos flotan por encima y rayos de sol giran despacio. Al entrar, el emblema del faro se dibuja, el título dorado aparece letra a letra (y un brillo lo recorre de vez en cuando), luego el lema y el menú con iconos; «Continuar» muestra el capítulo de la partida guardada. También hay acceso a la Práctica de combate temporal. Al empezar, el menú se desvanece. La pantalla de carga usa el mismo emblema.
- **Imagen** (13-render.js): oclusión ambiental en las esquinas y bajo los aleros (alta), rayos de sol entre árboles y nubes (alta y media; más fuertes al amanecer y al atardecer), desenfoque de profundidad en las cinemáticas y la portada, reflejos del faro, los torii y los árboles en el agua (alta y media), y color de cada región que vuelve con su fragmento (antes, la región tiene el suelo y la imagen apagados).
- **Textos legibles:** los rótulos llevan una franja oscura difuminada y letra con contorno; en las cinemáticas los subtítulos van dentro de la franja negra de abajo (más alta con subtítulos grandes) y fuera de ellas, sobre una placa difuminada; al cambiar de frase, la anterior se funde antes de la nueva y cada frase se ve al menos el tiempo de leerla (15 letras por segundo más 1,4 s). Los nombres de los habitantes solo se ven a menos de 14 m.
- **Ajustes:** calidad, sensibilidad, campo de visión, volumen general, de música, de efectos y de ambiente, tamaño de los subtítulos (normal, grande y muy grande, también en los diálogos), HUD dinámico, vibración del mando, eje invertido y contador de FPS.

### 6.12 Cinemáticas y audio

- **Guion:** `26-guion.js` conserva textos del mundo, habitantes y ecos. `50-guion-inicio.js` y `59-guion-capitulos.js` reúnen las líneas, bloques, notas y misiones del inicio y los capítulos; `68-secundarias.js`, las secundarias. Frases cortas y una idea por frase.
- **Motor de planos:** `09-cinematica.js` aporta pausa, repetición, avance, fundidos, tiempo de lectura y utilidades de cámara. Las rutas se precargan para evitar cambios bruscos de detalle; el modo cine usa `EFECTOS.cine` en `13-render.js`.
- **Prólogo:** 110 s y nueve planos en `52-escenas-inicio.js`. De noche, Tasogare corta el hilo de Akari, su luz se dispersa, el corazón del faro se fragmenta y la Luna deja ver su apariencia roja. Sigue una elipsis hasta el despertar. Saltarlo restaura los estados del mundo.
- **Capítulos:** `63-escenas-capitulos.js` monta recuerdos, travesías, captura y rescate de Momo, muerte de Tasogare, encarnación, liberación y créditos. La Noche Roja y utilidades visuales compartidas quedan en `39-escenas.js`. El capítulo 4 usa la pérdida de Tsuru sin robo de fragmento.
- **Final y epílogo:** Hikari vence a la Roja física y libera la luz cautiva. Lumi queda como luciérnaga; la Dorada es libre y nadie resucita. En Hinode se abren los registros; en Yoake se recuerdan los nombres y se llega al mirador con Momo. Después de los créditos se sigue jugando.
- **Ecos:** seis recuerdos externos, distintos de la memoria de Hikari. El muelle muestra a Kaito con su hijo Rui. El Mirador muestra a Tasogare llevando a otro niño al faro. Cada eco conserva frase, motivo musical, diario y registro de descubrimiento.

La música de **todo el juego**, incluida la portada, se sintetiza con koto y flauta en [54-musica-inicio.js](../js/54-musica-inicio.js). Alterna frases y silencios. En combate añade taiko y koto apagado; la capa se intensifica contra gólems, Tasogare, las ataduras de Lumi y la Luna Roja. Se silencia durante diálogos, escenas y pausa.

[46-paisaje-sonoro.js](../js/46-paisaje-sonoro.js) reproduce ambiente natural y foley: pasos, tela, agua e impactos. [01-audio.js](../js/01-audio.js) conserva mezcla, reverberación, magia y señales sonoras. Las muestras están incluidas; no se transmite música desde servicios externos.

**Solo subtítulos, sin locución.** Se retiraron la voz de prueba de Tsuru, su ajuste y los temas orquestales. La antigua muestra de escucha y los informes de la parte 4 son antecedentes. Fuentes y atribuciones de las grabaciones: [AUDIO_LICENCIAS.md](../AUDIO_LICENCIAS.md) y `audio/manifiesto.json`. La valoración sonora del usuario sigue pendiente.

El ambiente y el foley alternan variantes. La mezcla conserva panoramización, atenuación y reverberación por canal. Herramientas: `probar-audio-piloto.mjs` para continuidad y mezcla, `audio.mjs` para niveles y escucha, y `preparar-audio.mjs` para preparar las grabaciones. El resultado vigente de audio es 16/16; las mediciones de la fase 24 con temas orquestales son antecedentes de otro sistema.

### 6.13 Mando de Xbox

Los botones del mando se traducen a las mismas acciones del teclado, así que todo el juego funciona igual con ambos. También funciona en la portada, el menú de pausa y los créditos (cruceta para moverse, A para aceptar, B para volver, LB y RB para cambiar de pestaña). Los iconos del HUD cambian al mando cuando se usa y vibra con los golpes si el navegador lo permite. El mapeo completo está en el [Anexo B](#anexo-b-controles-completos).

---

## 7. Cómo se construyó

### 7.1 Método de trabajo

Cada cambio siguió el mismo ciclo:

1. **Petición:** qué se quiere añadir o cambiar.
2. **Diseño:** cómo encaja con lo que ya existe y qué se deja fuera.
3. **Código** por módulos, revisando la sintaxis de cada archivo.
4. **Pruebas automáticas** en un navegador sin pantalla.
5. **Capturas** para revisar a ojo lo que el código no detecta.
6. **Correcciones** y nueva ronda de pruebas.
7. **Empaquetado y publicación** en el mismo enlace.

Hubo libertad creativa en mecánicas, recompensas y equilibrio; las correcciones fueron sobre todo de alcance.

### 7.2 Herramientas

- **Three.js r128** para todo el 3D.
- **Node.js** para comprobar la sintaxis de cada módulo (`node --check`).
- **Chromium sin pantalla con Playwright** y renderizado por software para jugar, medir y capturar automáticamente. Desde la fase 1 de mejoras, `herramientas/probar.mjs` usa Edge sin pantalla con la GPU real y mide FPS, tiempos y exposición. Con `?solidos` en la URL, el juego dibuja en alambre todos los sólidos (verde, lo que se pisa; rojo, las paredes): sirve para encontrar la obra que se atraviesa.
- **Node.js** también para empaquetar el juego en un solo archivo (`herramientas/empaquetar.mjs`) y montar mosaicos de capturas.

### 7.3 Ganchos de prueba

El juego expone `window.__ecos` para controlarlo desde las pruebas:

| Función | Para qué sirve |
| --- | --- |
| `manual(true)` | Detiene el bucle automático para avanzar fotograma a fotograma |
| `empezarRapido(nueva)` | Entra al juego sin portada ni intro |
| `sim(n, dt)` / `avanzar(n, dt)` | Simula `n` fotogramas, sin dibujar o dibujando el último |
| `tele(x, z)` | Lleva a Hikari a un punto del mapa |
| `mirar(giro, inclinación, distancia)` | Coloca la cámara |
| `tecla(código, pulsada)` | Simula una tecla o botón |
| `Jefes.forzar(id, ataque)` | Obliga a un gólem a usar un ataque concreto |

### 7.4 Pruebas realizadas

Resultados vigentes comunicados por Claude en el encargo y registrados en [COORDINACION.md](COORDINACION.md), a 2/11/2026. Esta revisión documental no vuelve a ejecutar las pruebas del juego.

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

En fases anteriores también se comprobaron ataques y purificación de gólems, mando simulado, salto de la espiral, corrientes de Kiri, guardado, viaje rápido y carga con render por software. Esas comprobaciones históricas no certifican rutas retiradas como parte de la campaña actual.

### 7.5 Problemas encontrados y cómo se resolvieron

| Problema | Causa | Solución |
| --- | --- | --- |
| La cámara inicial quedaba tapada | Hikari empezaba junto a un pedestal y un farol | Nueva posición inicial y ángulo de cámara |
| Hikari se hundía en la plaza del faro | El suelo de la plaza no tenía colisión | Discos sólidos en los dos niveles de la plaza |
| Contadores con decimales (12,15/40) | Distancias sumadas sin redondear | Redondeo en el HUD y el menú |
| El destello de la intro oscurecía la pantalla | Usaba el telón negro de los fundidos | Una capa de destello blanco propia |
| La espiral final era imposible | Plataformas a 14 m del cristal y saltos de 9 m | 13 plataformas que suben 1,32 m cada 5,5 m |
| La cima de Kiri estaba en el mar | Coordenadas sin comprobar (−22 m de altura) | Movida a la aguja real de 110 m, con corrientes de aire |
| Teletransportes encima de estructuras | Se buscaba el suelo desde 200 m de altura | Búsqueda desde la altura del terreno |
| Nueva partida mezclaba el progreso anterior | El mundo se construía con el guardado viejo | Se borra el guardado y se reinicia la página |
| La confirmación no funcionaba en el visor | Los iframes bloquean `confirm()` | Confirmar pulsando el botón dos veces |
| Calmar a un animal con nombre contaba doble | Evento repetido | Un evento por especie, por nombre y por grupo |
| Los pétalos del Gólem del Cerezo no golpeaban | Apuntaban por encima de la cabeza | Puntería a la altura del pecho |
| Avisos de ataque poco visibles | Poca opacidad | Más contraste y un pulso más marcado |
| Error al arrancar con los módulos nuevos | El gancho de pruebas los usaba antes de cargarlos | Referencias que se resuelven al usarlas |
| Hierba, pinos y cerezos lavados de dorado lejos del faro | three r128 no envía `cameraPosition` a los materiales Lambert: su niebla se medía desde el centro del mapa | La niebla toma la posición de la cámara de `uMatCam` |
| Cerezos casi negros a contraluz | La translucidez se sumaba a la luz directa y la sombra de la propia copa la borraba | Se suma después de la sombra (`TRANSL_SOMBRA`) |
| La cámara se metía en el faro y las casas | Solo chocaba con el terreno y las cuevas | Choca también con los sólidos de las construcciones (`Sol.dentro`) |
| Medidas de rendimiento que cambiaban un 50 % de una vez a otra | Equipo con batería baja y procesos en segundo plano | Comparación A/B intercalada (`herramientas/comparar.mjs`) |
| La comparación A/B daba siempre ventaja a la versión nueva (un 10–15 % comparando el juego consigo mismo) | La página que se abre primero rinde más, y la nueva se abría siempre antes | Dos tandas, una abriendo antes cada versión, combinadas; el orden de medida se alterna en cada ronda (calibrado: ±3 %) |

### 7.6 Empaquetado y publicación

- `herramientas/solidos.mjs` busca obra que se atraviesa; se revisa después con `?solidos`.
- `node herramientas/empaquetar.mjs` une estilos y los **72 módulos del índice**, incluidos los datos de audio. Genera `dist/ecos-de-luz.html`, de **2207 KB** (2 084 182 bytes; redondeo con 1024 bytes por KB). Comprueba sintaxis, referencias, servidores permitidos y el máximo de 16 MB. `retirado/` queda fuera del paquete.
- **`dist/ecos-de-luz.zip` se conserva por orden del usuario.** Es un archivo histórico; no se regenera ni se presenta como copia actual.
- El proyecto usó un artefacto de claude.ai. El visor admite scripts de cdnjs y jsdelivr, impone el máximo de 16 MB y puede bloquear captura de ratón, mando o `confirm()`. Para el ratón se conserva la alternativa de arrastrar; para el mando puede abrirse la carpeta modular. La publicación remota de esta versión no se ha verificado en este encargo.

---

## 8. Documentos y entregables

| Entregable | Formato | Dónde | Contenido |
| --- | --- | --- | --- |
| Artefacto histórico | Página web | <https://claude.ai/artifact/X7tT9PK9o1FhAhq1bWERxF> | Versión remota actual por verificar |
| `ecos-de-luz.html` | HTML único | `dist/` | Campaña única; 72 módulos y 2207 KB |
| `ecos-de-luz.zip` | Archivo histórico | `dist/` | Conservado sin regenerar; su contenido no representa el estado actual |
| `README.md` | Markdown | Raíz del proyecto | Cómo jugar, controles, gólems, misiones y estructura |
| Guía de diseño y sustitución de assets | Documento compartible | <https://claude.ai/code/artifact/63914010-c4d9-4af3-b7e0-0568b3493f17> | Estándares de entrega, fichas por asset, integración en el código y fases |
| Este documento | Markdown | Archivos de la conversación | Historia, estado y funcionamiento del proyecto |
| Actividad del Tema 2 | En la conversación | — | Concepto, narrativa, diseño, producción y high concept |
| Ficha de análisis técnico | DOCX y PDF | Proyecto del equipo | Identidad del juego, clasificación técnica, mecánicas, requisitos y herramientas, con *Sky* como referencia |
| Hoja de ruta y guía de la Fase 0 | PDF | Proyecto del equipo | Fases de 12 semanas, alcance, entorno, control de versiones, convenciones y reparto de tareas |
| GDD 1.0 de *Ecos del Alba* y guía de jefes | PDF | Aportados al proyecto | 60 decisiones sobre acciones, combate y progreso, y los 5 gólems |

---

## 9. Qué se está haciendo y qué falta

**Hecho:** fusión F0–F7 y contenido jugable hasta los créditos, con regiones por capítulo, Yoake, Luna Roja física y epílogo. F8 incorpora mapa de Yoake, mar calmado en su costa, capa de combate, aspecto de Sayo, 13 secundarias adaptadas y retirada de la campaña anterior. Continúa el pulido de estética y animación de Hikari y Tasogare. Estado de referencia: [PLAN_FUSION.md](PLAN_FUSION.md) y [COORDINACION.md](COORDINACION.md).

### 9.1 Por validar

- Rendimiento actual con el portátil enchufado: **por medir**. Las cifras anteriores con Intel Arc 140V y render por software son históricas; faltan GPU antiguas reales.
- Un mando físico, y si el visor del artefacto deja usarlo.
- Música y sonidos escuchados por personas, también la melodía de cada eco (los niveles ya se midieron: sin saturación y con la mezcla a un volumen normal).
- Equilibrio jugado por personas; por ejemplo, el Gólem de Marea castiga mucho quedarse quieto.
- Duración con personas, comprensión de escenas y partidas largas: **por medir**.
- Oferta independiente de `g_*` y etiqueta de dificultad de `c7_luna`: pendientes de comprobar o resolver con Claude; ver 6.10.

### 9.2 Arte definitivo

Todo el arte es provisional. La guía de assets ordena el trabajo en 7 fases:

1. Identidad: Hikari, Lumi, logo.
2. Jefes.
3. Interfaz.
4. Lugares clave.
5. Fauna y personajes.
6. Mundo: vegetación, suelo, agua y cielo.
7. Acabado: efectos, murales, storyboards y audio.

El código está preparado para sustituir cada pieza por separado.

### 9.3 Pendientes del GDD 1.0

Del documento de diseño del equipo quedaron fuera por ahora:

- El puzzle global, la ruta que permite terminar el juego solo con conocimiento.
- Espejos y reflejos del haz.
- El antiguo pendiente de jefe final quedó resuelto con la Luna Roja física del capítulo 7.
- Las debilidades elementales; están simplificadas a puntos débiles y luz.
- El modo cooperativo.

### 9.4 El proyecto del equipo en Unity

- **Plan:** vertical slice con una zona completa y dos más cortas, sin cooperativo en línea.
- **Por dónde empezar:** prototipo gris con caminar, saltar, planear y activar un altar; después, una zona completa y pulida.
- **Qué se reaprovecha de esta beta:** el diseño, las misiones, los números de física y combate, y las reglas de fauna y jefes.
- **Qué se rehace:** modelos, shaders, música, interfaz y el controlador del personaje.

---

## Anexo A. Idea original (texto de partida)

> **Título provisional:** Ecos del Alba
> **Género:** aventura, exploración, relajante, cooperativo opcional
> **Plataforma ideal:** PC o móvil
> **Estilo:** mundo luminoso, música ambiental, personajes simples, enfoque emocional
>
> La idea central es que el jugador controla a un pequeño ser de luz que despierta en un mundo apagado. Su misión no es pelear, sino recorrer distintas zonas, recuperar fragmentos de luz y devolverle vida al mundo.
>
> El videojuego tendría una experiencia tranquila, enfocada en caminar, saltar, planear y resolver pequeños acertijos. La emoción principal sería la sensación de descubrimiento: encontrar ruinas, encender altares, liberar criaturas luminosas y abrir caminos nuevos.
>
> **Historia.** Hace mucho tiempo, el mundo estaba conectado por grandes faros de luz. Estos faros mantenían vivos los cielos, los bosques y los pueblos. Pero un día, la luz se fragmentó y cayó en distintas regiones. El jugador es un «Eco», una pequeña criatura nacida de uno de esos fragmentos. Su objetivo es reunir luz suficiente para despertar los faros antiguos y restaurar el amanecer. No habría diálogos largos. La historia se contaría con imágenes, música, animaciones y escenarios: estatuas rotas, murales, zonas oscuras que se iluminan poco a poco.
>
> **Mecánicas principales**
>
> - **Exploración:** el jugador puede caminar por escenarios abiertos pequeños. Cada zona tendría caminos ocultos, plataformas, cuevas y lugares elevados.
> - **Recolección de luz:** la luz funciona como energía. Sirve para activar mecanismos, abrir puertas y mejorar temporalmente la capacidad de planear.
> - **Planeo:** el personaje puede saltar y planear durante unos segundos. Mientras más luz tenga, más tiempo puede mantenerse en el aire.
> - **Altares:** en cada nivel hay altares apagados. Al llevarles luz, el entorno cambia: aparecen flores luminosas, se abren puentes, se activa música o se desbloquea una nueva ruta.
> - **Acertijos simples:** encender tres pilares en orden, guiar una esfera de luz hasta una puerta, activar plataformas usando luz, encontrar símbolos escondidos en el escenario.
> - **Cooperativo opcional:** si se quiere agregar algo parecido a *Sky*, otro jugador podría aparecer como otra criatura de luz. No sería obligatorio. Dos jugadores podrían cargar más luz juntos o abrir puertas cooperativas.
>
> **Personaje principal.** El protagonista sería pequeño, sin rostro definido, con una capa o manto luminoso. Esto hace que sea fácil de modelar o dibujar.

---

## Anexo B. Controles completos

Los textos del juego (misiones, avisos, pistas, rótulos y menús) nombran la tecla o el botón según lo último que se haya usado. Por ejemplo, «activa el altar (E)» con el teclado y «(Y)» con el mando. Los botones sin letra salen con su dibujo: Vista (⧉, el de dos cuadrados junto al botón Xbox; mantenido llama a Lumi y pulsado abre el mapa) y Menú (≡). Con mando, la pestaña Controles muestra primero su tabla, y el pie del menú dice «B o ≡ Menú · continuar · LB / RB · pestañas».

| Acción | Teclado y ratón | Mando Xbox |
| --- | --- | --- |
| Moverse | W A S D | Stick izquierdo |
| Cámara · zoom | Ratón o flechas · rueda | Stick derecho |
| Correr | Shift | Pulsar el stick izquierdo (L3) |
| Saltar · doble salto | Espacio | A |
| Planear | Mantener Espacio en el aire | Mantener A en el aire |
| Agacharse · bucear | C | LT |
| Deslizar | Correr y pulsar C | Correr y pulsar LT |
| Trepar · soltarse | Empujar contra una pared · Espacio o C | Empujar contra una pared · A o LT |
| Atacar · golpe cargado | Clic izquierdo · mantener | X · mantener |
| Esquivar · golpe tras la esquiva | V · atacar al terminar | B · atacar al terminar |
| Haz de luz | Mantener clic derecho | Mantener RT |
| Interactuar · canalizar | E · mantener E | Y · mantener Y |
| Pulso de luz | Q | LB |
| Guardia · parada | Mantener R | Mantener RB |
| Fijar objetivo · cambiar | Z o clic central · mover el ratón | R3 · stick derecho |
| Guía de Lumi | F | Mantener Vista |
| Objetos rápidos · cambiar arma | 1, 2, 3 · 4 | Cruceta ▲ ▶ ▼ · ◀ |
| Misiones · Zurrón · Mapa | J o Tab · I · M | Pulsar Vista abre el mapa |
| Pausa | Esc o P | Menú |
| Centrar la cámara | — | R3 sin objetivo cerca |
| Saltar una escena | Mantener Espacio | Mantener A |

---

## Anexo C. Estructura de archivos

```text
index.html                         página, interfaz y orden de carga de los 72 módulos
css/estilos.css                    HUD, menús y portada
js/                                módulos enumerados en orden en la sección 5.2
audio/                             muestras y manifiesto de licencias
modelos/                           exportaciones y fuentes de personajes
herramientas/                      pruebas, mediciones y empaquetado
vendor/LEEME.txt                   instrucciones para jugar sin internet
README.md                          guía de juego, estado actual, repositorio y ramas
AUDIO_LICENCIAS.md                 fuentes y licencias del audio
CLAUDE.md, AGENTS.md               instrucciones para Claude y ChatGPT (Codex)
docs/
  Ecos_de_Luz_documentacion_completa.md  referencia y cronología
  COORDINACION.md                  tablero de trabajo
  PLAN_JUEGO.md                    fases de movimiento, combate, contenido y pulido
  PLAN_FUSION.md                   decisiones y fases de la campaña única
  PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md  canon 2.0
  PERSONAJES.md                    catálogo de personajes
  entregas_chatgpt/                guion, diseño, revisiones e investigaciones
dist/ecos-de-luz.html              paquete generado: 2207 KB (no se sube al repositorio)
dist/ecos-de-luz.zip               archivo histórico conservado (local, no se sube)
```

Ramas del repositorio (`main`, `develop`, `fase/…`): ver el README.

La lista completa, una línea por módulo y en el orden de `index.html`, está en la sección 5.2. Los módulos 40, 41 y 44 de la campaña anterior se borraron.

---

## Anexo D. Glosario

| Término | Significado |
| --- | --- |
| Procedural | Generado por código al arrancar, sin archivos de arte |
| Three.js | Librería de JavaScript para dibujar 3D en el navegador |
| Módulo | Cada uno de los 72 módulos de código, con una responsabilidad |
| Instancing | Dibujar miles de copias de un modelo en una sola llamada |
| Shader | Programa que corre en la tarjeta gráfica y decide el color de cada píxel |
| Bioma | Región con paisaje, vegetación, fauna y música propias |
| HUD | Información en pantalla durante el juego |
| Telegrafía | Marca roja en el suelo que anuncia un ataque |
| Punto débil | Parte de un gólem que recibe más daño o lo aturde al romperse |
| Núcleo | Corazón de un gólem; se purifica con el haz cuando está aturdido |
| Pulso de luz | Onda alrededor de Hikari que empuja, calma e interrumpe |
| Haz de luz | Rayo continuo que se apunta y purifica |
| Canalizar | Mantener E o Y junto a un punto para transferirle luz |
| Punto de luz | Linterna donde se reaparece tras caer |
| Vertical slice | Porción pequeña del juego terminada con calidad final |
| GDD | Documento de diseño del juego |
| High concept | El juego explicado en una sola frase |
| Artefacto | Página publicada en claude.ai donde se puede jugar |

---
