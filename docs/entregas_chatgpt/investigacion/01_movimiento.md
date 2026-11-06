# Investigación 01 · Movimiento y animación

**Fecha de entrega:** 3 de noviembre de 2026. **Encargo:** Claude, dirección. **Destino:** diseño y posterior implementación por Claude.

Lectura de contexto: `COORDINACION.md`, `CLAUDE.md`, `AGENTS.md`, `PLAN_FUSION.md`, `README.md` y `PERSONAJES.md`. Revisión del movimiento, Hikari, sólidos y sus dependencias. Este informe no modifica el juego.

## 1) Resumen de 10 líneas

1. Probar 3,2 m/s de desplazamiento normal y 6,8 m/s de carrera, con aceleración de 18 m/s².
2. Hikari mide 1,15 m; su carrera debe tener una fase de vuelo visible para sostener esa velocidad.
3. Mantener la carrera terrestre gratuita y reservar el gasto de luz para las capacidades que ya lo usan y el nado rápido solicitado.
4. Corregir la marcha con poses claras, cadencia controlada y transiciones de arranque, parada y giro.
5. Soltar los apoyos por distancia y torsión antes de que las piernas se crucen o alcancen su extensión máxima.
6. Estabilizar la capa con pasos de simulación constantes, anclas interpoladas y límites de estiramiento medidos.
7. Autorizar la escalada mediante superficies marcadas y una intención explícita del jugador.
8. Revisar primero los sólidos ausentes y después el barrido de colisión del personaje completo.
9. Añadir nado rápido de superficie a 6,8 m/s, con el mismo coste por segundo que el planeo y sin regeneración simultánea.
10. Validar movimiento, agua, capa y giros a 30, 60 y 120 FPS antes de aprobar los valores finales.

## 2) Hallazgos por tema

### 2.1. Qué se comprobó y qué significan las cifras

Se distinguen tres tipos de información:

- **Código local:** valores y condiciones leídos en esta copia del proyecto. No equivalen a una reproducción del fallo en pantalla.
- **Fuente externa:** información de sus autores, documentación de motores o mediciones originales de la comunidad. Se indica su alcance.
- **Propuesta:** números diseñados para Ecos de Luz. Son puntos de partida para pruebas, no parámetros secretos de otros juegos.

**Límite de la investigación:** no se encontró una tabla primaria y comparable de velocidades, aceleraciones y alturas para los nueve referentes. En particular, faltan aceleraciones numéricas verificables. No se rellenan esos huecos con cifras atribuidas a sus estudios. Se conservan las referencias útiles de control y se propone un protocolo para medir lo pendiente.

En las páginas de GDC se consultaron las fichas y resúmenes públicos. No se atribuyen detalles a vídeos que no se hayan examinado. Las recomendaciones numéricas que siguen son propias.

### 2.2. Diagnóstico del código real

| Área | Evidencia local | Consecuencia o hipótesis de trabajo |
| --- | --- | --- |
| Escala | `js/47-hikari-modelo.js`, `HIKARI_DISENO`: cuerpo de 1,15 m; punta de capucha de 1,31 m. Piernas de 0,25 + 0,24 m en `17-hikari.js`. | Las proporciones exigen pasos y vuelos estilizados. No basta con acelerar una marcha adulta. |
| Velocidad | `18-movimiento.js`, `MOV`: andar 2,4; correr 4,2; acelerar 7,2; frenar 9. | En llano, desde reposo, alcanzar 4,2 tarda unos 0,58 s. Soltar a esa velocidad tarda unos 0,47 s y recorre unos 0,98 m. Son cálculos del modelo continuo, sin pendientes ni colisiones. |
| Orientación | `Mov.actualizar`: el cuerpo mira hacia la entrada en suelo. La velocidad conserva inercia. `Hikari.mover` añade otro suavizado, de tasa 18. | Durante un cambio brusco, dirección pedida, desplazamiento y cuerpo visible pueden diferir. El IK debe conocer esa diferencia. |
| Marcha | `17-hikari.js`: longitud de paso `0,36 + 0,11 × velocidad`. La frecuencia de ciclo es `v / longitud / 2`. | A 2,4 produce unos 3,85 contactos/s; a 4,2, unos 5,11. Elevar solo la velocidad a 6,8 produciría unos 6,14: riesgo de pasos demasiado rápidos. |
| IK | Cada pie guarda una posición mundial durante el apoyo. El reinicio general depende de un desplazamiento mayor de 1,6 m. No hay liberación específica por ángulo de giro. | Un giro sobre el mismo punto puede dejar un pie al otro lado del cuerpo. El límite de alcance del solver evita alargar huesos, pero no corrige el apoyo imposible. |
| Rodillas | `ikPierna` limita distancia al 99,5 % de 0,49 m y define un polo frontal. | Ya existe límite de longitud. Falta liberar el pie y proteger el plano de flexión cuando las direcciones casi se alinean. |
| Tela | La clase `Tela` está en `05-personaje.js`. Usa posiciones actual/anterior, integración Verlet y tres iteraciones de restricciones. Hikari aporta colisión corporal desde `17`. | El proyecto ya tiene Verlet y restricciones. La mejora debe estabilizarlos y medir su error. |
| Tiempo de tela | `17` recorta a 0,033 s el paso enviado a la capa; el juego admite hasta 0,05 s. Solo se actualiza la fila anclada con la posición actual del pecho. | A 20 FPS, el pecho puede avanzar 0,34 m con la carrera propuesta mientras la tela solo integra 33 ms. Es un candidato al tirón, no un fallo reproducido. |
| Forma de capa | Malla de 10 × 14 puntos; largo de 0,72 m; ancho inferior de 0,91 m, que pasa a 1,38 m al planear. `colisionCuerpo` también recoloca puntos después de las restricciones. | Parte del cambio de tamaño es intencional. Hay que distinguir despliegue, error de longitud y deformación introducida por la colisión. |
| Escalada | `intentarTrepar` acepta la pared que encuentre `Sol.pared`, salvo sólidos `fina`. Empujar 0,22 s puede iniciar trepa; en aire no exige esa espera. | Una pared sólida se interpreta casi siempre como escalable. Falta permiso positivo por superficie. |
| Auparse | `aupar`: entre 0,45 y 1,75 m. La trayectoria se interpola. `pasoLibre` comprueba cuatro puntos con margen de 0,1 m a una altura. | Se puede autorizar una ruta para un punto que no sea válida para todo Hikari. |
| Escalones | `MOV.paso` = 0,6 m. `Sol.suelo` acepta techos hasta 0,65 m por encima. | Hikari puede subir de forma automática alturas cercanas a media estatura. Cambiar uno solo de esos umbrales dejaría reglas contradictorias. |
| Sólidos | `Sol` está definido en `04-estructuras.js`, no en `00-nucleo.js`. Usa cajas orientadas y columnas. `Sol.empujar` resuelve solapamientos en la posición final. | Se deben separar tres problemas: objeto sin sólido, sólido mal ajustado y movimiento que atraviesa un sólido entre dos posiciones. |
| Volumen del jugador | `18` llama a `Sol.empujar` con radio 0,42 m. `Sol` usa un intervalo vertical de 1,6 m y omite ciertos obstáculos bajos. | El volumen de navegación no coincide con el cuerpo de 1,15 m. Tampoco hay un barrido vertical general contra techos de estructuras. |
| Nado | La selección de velocidad toma primero `J.nada`; no consulta `{correr}` en esa rama. Usa 3,2 m/s o 2,6 al bucear. | El nado rápido solicitado no existe. |
| Energía en agua | `finPaso` recupera 6 unidades de luz/s al nadar. | Añadir un descuento de 10/s sin cambiar la regeneración dejaría un coste neto de solo 4/s en esa rama. |
| Buceo | `{agacharse}` genera descenso; al soltar, la flotación lleva a superficie. `{saltar}` hace salir del agua. | No hay un estado persistente de buceo con ascenso independiente. |
| Corriente marítima | Tras `Sol.empujar`, se aplica una devolución radial según `tierraDe`. Esa rama no exige `J.nada`. | Es una barrera de mundo, no una corriente acuática local. Puede modificar la posición después de la última resolución de sólidos. |
| Planeo | 8,8 m/s; descenso de 2,1 o 1,5 m/s; coste de 10 o 6 unidades/s, con multiplicadores de altar. | La carrera propuesta debe seguir siendo más lenta que planear. La mejora de nivel y la del altar ya afectan a la autonomía. |

El teletransporte de `10-juego.js` **ya llama a `Hikari.reiniciarTela()`**. No se propone arreglarlo como si faltara. Hay que revisar también movimientos directos de escenas y giros sin teletransporte.

En `35-sombras.js` ya hay separación entre Sombras, frente a Hikari y frente a sólidos. La separación con ella se omite durante ciertos ataques y mientras rueda. Ese comportamiento es deliberado en el código; una revisión de navegación no debe convertirlo por accidente en un bloqueo nuevo del combate.

### 2.3. Velocidad, aceleración y escala de los referentes

**Comparación correcta:** registrar velocidad del centro del personaje en un tramo recto y llano. Separar caminar con entrada parcial, desplazamiento normal con entrada completa, sprint y habilidades. Comparar también `velocidad / altura corporal`, expresada en alturas por segundo. El FOV y la distancia de cámara alteran la impresión, pero no la distancia recorrida.

| Referente concreto | Datos utilizables y escala | Qué funciona y qué trasladar |
| --- | --- | --- |
| **Zelda: Breath of the Wild** | No se verificó aquí una velocidad base ni una aceleración con unidad y versión suficientemente documentadas. No se le atribuyen las cifras de TotK. La entrevista a Aonuma describe el valor de poder agarrarse y controlar la escalada. | El relieve ofrece decisiones de ruta. Trasladar la conexión entre altura ganada, planeo y destino visible. La entrevista no proporciona números de locomoción. [Entrevista a Aonuma, Time](https://time.com/4369527/zelda-breath-wild-open-world/). |
| **Zelda: Tears of the Kingdom** | Una medición original de 2023 por coordenadas reporta 1,5 / 2,3 / 3 m/s con entrada parcial; 5 m/s de carrera normal; 8 m/s de sprint; 1,5 m/s de nado base y 0,7 m/s de escalada. Es una medición comunitaria, sin repetición independiente en este encargo. Altura y aceleración no verificadas. | La relación sprint/normal reportada es 1,6. Sirve como contraste de ritmos. No demuestra que Ecos de Luz necesite copiar 5/8. [Medición original, Independent-View-478](https://www.reddit.com/r/tearsofthekingdom/comments/16svd42/the_speed_of_link_tears_of_the_kingdom/). |
| **Genshin Impact** | Una prueba original en HoYoLAB registra **25 m en 678 fotogramas a 30 FPS: 1,11 m/s al caminar**, y **24 m en 160 fotogramas: 4,5 m/s al correr**, usando distancias del indicador de misión. No mide sprint ni otros cuerpos; no se generaliza a todo el reparto. KQM distingue modelos y técnicas; su prueba de 2021 arroja una relación aproximada de **1,71** entre encadenar dashes y desplazamiento sin sprint. No es una velocidad constante del sprint mantenido. | La diferencia entre modelos muestra por qué no basta con comparar siluetas. Copiar un ritmo ágil, pero evitar que saltar o pulsar repetidamente sea obligatorio para viajar bien. [Medición original en HoYoLAB](https://www.hoyolab.com/article/8700739), [KQM, pruebas de movimiento](https://library.keqingmains.com/evidence/general-mechanics/movement-and-physics). |
| **Ghost of Tsushima** | No se halló una pareja verificable de velocidad/aceleración en m/s y m/s² ni una altura de navegación en las fuentes primarias consultadas. | Su charla técnica explica cómo ropa, partículas y vegetación responden al viento de forma coherente. Trasladar esa coherencia a la capa y a las señales del desplazamiento, sin atribuirle un controlador de Hikari. [Bill Rockenbeck, GDC 2021](https://www.gdcvault.com/play/1027350/Blowing-from-the-West-Simulating). |
| **Assassin’s Creed Shadows** | Ubisoft diferencia la rapidez de Naoe y la mayor distancia de arranque de Yasuke. No publica en ese artículo velocidades ni aceleraciones numéricas. No se generaliza a toda la saga. | Arranque y animación expresan peso. Las reglas de entrada, salto y descenso evitan acciones involuntarias. [Ubisoft, sistema de parkour](https://www.ubisoft.com/en-us/game/assassins-creed/news/4TA6gKaTvtOC1mOjZIxCZd/assassins-creed-shadows-parkour-system-overview). |
| **Sekiro** | No se verificaron m/s, m/s² o estatura del controlador. La presentación de lanzamiento de PlayStation describe movilidad sin límite de estamina. Activision documenta puntos válidos de gancho con señal de alcance. | El desplazamiento permite reposicionarse sin pagar cada paso. La verticalidad especial tiene destinos legibles. Es una referencia útil para carrera terrestre gratuita y escalada autorizada. [PlayStation](https://blog.playstation.com/2019/03/22/sekiro-shadows-die-twice-tips-for-dark-souls-bloodborne-veterans/), [Activision](https://support.activision.com/sekiro/articles/using-the-shinobi-prosthetic-in-sekiro-shadows-die-twice). |
| **Elden Ring** | La guía oficial confirma desplazamiento, dash y regeneración de estamina, pero no aporta velocidades o aceleraciones. La escala del avatar no se normalizó aquí. | Separar desplazamiento, evasión y acciones de ataque ayuda a conservar intención. La animación de giro no debe impedir una evasión válida. [Guía oficial de Bandai Namco](https://en.bandainamcoent.eu/elden-ring/news/elden-ring-starter-guide-tips-know-playing-the-game). |
| **Sky: Children of the Light** | La ayuda oficial histórica distingue vuelo con alas cerradas y planeo con alas abiertas. No aporta m/s o aceleraciones. Sus notas de buceo distinguen respiración y energía de capa. | Tener estados reconocibles facilita entender control y gasto. Ecos de Luz puede tomar la claridad de esos estados usando su propia luz compartida. [Ayuda de vuelo, Sky Beta](https://thatgamecompany.helpshift.com/hc/en/13-sky-beta/faq/377-how-do-i-fly-with-my-character/?f=patch-notes---june-29-2021---0-14-0-171755&p=all&s=patch-notes), [Notas oficiales 0.16.0](https://thatgamecompany.helpshift.com/hc/en/17-sky-children-of-the-light/faq/866-patch-notes---january-13-2022---0-16-0-182597/). |
| **Journey** | La entrevista al equipo documenta animación de personajes en Maya y simulación propia de ropa. No publica velocidades, aceleraciones o una altura métrica utilizable. | La ropa responde al viento y refuerza la lectura del viaje. La silueta puede estar muy diseñada y conservar movimiento secundario físico. [Entrevista a Matt Nava y Aaron Jessie, CGW](https://www.cgw.com/Publications/CGW/2012/Volume-35-Issue-4-June-July-2012/Mysterious-Journey.aspx). |
| **A Short Hike** | Su creador describe un mundo pequeño que admite explorar en dirección contraria a la ruta evidente. No publica en las fuentes consultadas una escala métrica o aceleraciones. | El trayecto recompensa la curiosidad. Hacer a Hikari rápida exige conservar motivos para detenerse y mirar. [Adam Robinson-Yu, PlayStation Blog](https://blog.playstation.com/2021/08/05/crafting-a-tiny-open-world-a-look-behind-the-scenes-at-the-creation-of-a-short-hike/), [postmortem GDC](https://www.gdcvault.com/play/1026613/). |

**Cálculo local de escala:** a 2,4 y 4,2 m/s, Hikari recorre 2,09 y 3,65 alturas corporales/s. Con 3,2 y 6,8 serán 2,78 y 5,91. El segundo valor exige una carrera fantástica. Esa es una elección de diseño coherente con un ser de luz; no una equivalencia anatómica con Jin, Link o Wolf.

**Cómo completar las mediciones externas:** grabar cinco repeticiones por estado y anotar versión, FPS, superficie, equipo y modelo corporal. Medir 20–50 m después de alcanzar velocidad estable. Si no existen metros comprobables, expresar distancias en alturas corporales y no convertirlas a metros. Para el arranque, medir velocidad en ventanas de 0,05–0,10 s y el tiempo entre el 10 % y el 90 % de la velocidad final. Publicar mediana y dispersión. Una aceleración equivalente `0,8 × v_final / t_10–90` no prueba que el juego use aceleración constante.

### 2.4. Procedural, clips y motion matching

**Overgrowth:** David Rosen presenta técnicas procedurales combinadas con pocas poses clave. Su ejemplo avala diseñar primero poses legibles y usar procedimientos para adaptarlas. No obliga a importar una biblioteca externa ni a capturar movimiento. [Rosen, GDC 2014](https://www.gdcvault.com/play/1020583/Animation-Bootcamp-An-Indie-Approachtalking).

**For Honor:** Simon Clavet describe motion matching como una búsqueda de pose y trayectoria futura en datos de animación. La ventaja es seleccionar transiciones variadas. El requisito es disponer de los movimientos que se desea encontrar. No genera una marcha atractiva a partir de una base pobre. [Clavet, GDC 2016](https://www.gdcvault.com/play/1023280/Motion-Matching-and-The-Road).

**Aplicación a Ecos de Luz:** mantener el desplazamiento en `Mov`; dar forma artística a la carrera mediante poses; resolver después inclinación, terreno e IK. El esqueleto procedural del juego tiene 21 huesos corporales. El GLB portable tiene 51 en total y ocho clips, incluidos huesos para tela y cintas. No debe sustituirse un rig por otro sin adaptar sus pistas.

Los clips existentes tampoco se consideran una cura automática: la documentación indica que fueron horneados desde la solución del proyecto. Si contienen la marcha cuestionada, reutilizarlos conserva el problema. Three.js r128 ya dispone de mezcla y fundidos de acciones; se puede aplicar una solución híbrida sin actualizar el motor. [Código oficial de AnimationMixer r128](https://github.com/mrdoob/three.js/blob/r128/src/animation/AnimationMixer.js), [AnimationAction r128](https://github.com/mrdoob/three.js/blob/r128/src/animation/AnimationAction.js).

### 2.5. Plantado de pies, pivotes e inclinación

La documentación de Epic separa liberación por ángulo, liberación por distancia, umbrales de replantado, extensión de pierna y separación entre pies. Esa separación importa: un pie plantado es una restricción temporal que se debe poder soltar. No es un objetivo mundial permanente. [Epic, Foot Placement Plant Settings](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/AnimationWarpingRuntime/FFootPlacementPlantSettings).

**Inferencia para Hikari:** el giro brusco mezcla apoyos mundiales antiguos con un cuerpo que cambia de orientación. Hace falta un paso de recolocación, o un breve vuelo si corre. El polo de la rodilla debe conservar continuidad. Reducir el peso IK durante ese cambio puede ayudar, pero no reemplaza la corrección del destino del pie.

En un giro parado, los pies deben alternar pequeños pasos. En una inversión de carrera, conviene soltar ambos apoyos durante una fase breve y recuperar la zancada. El control debe responder desde el primer instante; la pose del pivote acompaña esa respuesta.

### 2.6. Tela y capas

Jakobsen documenta Verlet, proyección de colisiones y relajación de restricciones para física interactiva. Position Based Dynamics formaliza la corrección directa de posiciones y su utilidad para ropa. Son antecedentes adecuados al simulador que ya existe. [Jakobsen, Advanced Character Physics](https://www.cs.cmu.edu/afs/cs/academic/class/15462-s13/www/lec_slides/Jakobsen.pdf), [Müller y otros, Position Based Dynamics](https://doi.org/10.2312/PE/vriphys/vriphys06/071-080).

**Por qué funciona:** una restricción de distancia corrige la separación de dos puntos hacia una longitud de reposo. Un paso temporal estable limita variaciones de comportamiento. Aumentar iteraciones mejora convergencia, con coste de CPU. Un límite desde cada punto hasta su ancla ayuda a impedir que toda la cadena acumule extensión.

La capa de Hikari ya choca con una aproximación del torso. El problema requiere coordinar esa proyección con las restricciones. Si el cuerpo desplaza un punto después de la última corrección de longitud, el error reaparece. También hay que evitar que recolocar la tela cree una velocidad artificial mediante una diferencia excesiva entre posición actual y anterior.

Fiedler explica por qué un paso variable puede cambiar la simulación o permitir atravesar obstáculos. Su acumulador y la interpolación son una referencia para esta corrección. [Fix Your Timestep!](https://www.gafferongames.com/post/fix_your_timestep/).

### 2.7. Escalada y colisiones

**Decisión recomendada:** superficies escalables explícitas. El mundo de Ecos de Luz se abre por capítulos y contiene retos de altura. Una capacidad universal cambia sus rutas. La referencia útil de Sekiro es anunciar oportunidades válidas. Ubisoft explica que en Shadows las superficies sin asideros físicos no se pueden escalar y que eso permite diseñar mejor las rutas. También separa las intenciones de ascender y descender. La propuesta de etiquetas para Ecos de Luz es una adaptación de diseño, no una afirmación de que usen el mismo algoritmo. [Ubisoft, superficies no escalables](https://www.ubisoft.com/en-us/game/assassins-creed/news/4TA6gKaTvtOC1mOjZIxCZd/assassins-creed-shadows-parkour-system-overview).

Para colisiones, la documentación de PhysX distingue volumen del personaje, escalón, pendiente, barrido y deslizamiento por paredes. Explica el riesgo de atravesar paredes con pruebas discretas. Estos conceptos se pueden implementar sobre los sólidos actuales sin incorporar PhysX. [NVIDIA, Character Controllers](https://nvidia-omniverse.github.io/PhysX/physx/5.3.0/docs/CharacterControllers.html).

**Orden del diagnóstico:** un objeto sin collider se atraviesa a cualquier velocidad. Una comprobación continua tampoco lo encontrará. Primero revisar la correspondencia entre geometría y sólidos; después el volumen y la trayectoria.

### 2.8. Nado, buceo, corrientes y planeo

Las pruebas originales de KQM registran efectos de pulsar repetidamente el impulso acuático y un gasto extra al girar en versiones concretas. Son ejemplos de lo que debe comprobarse para que la técnica más cómoda también resulte eficaz. No se propone copiar esas irregularidades. [KQM, Swimming](https://library.keqingmains.com/evidence/general-mechanics/movement-and-physics#swimming).

Sky introdujo una separación explícita entre superficie y buceo, con control de dirección y propulsión. En esa versión, bucear consume respiración y no energía de capa. Para Ecos de Luz se recomienda conservar una sola reserva de luz y cobrar únicamente el nado rápido solicitado. No se introduce una barra de aire ni una regla de ahogamiento. [Notas oficiales de Sky 0.16.0](https://thatgamecompany.helpshift.com/hc/en/17-sky-children-of-the-light/faq/866-patch-notes---january-13-2022---0-16-0-182597/).

En planeo, la base actual ya ofrece velocidad y corrientes ascendentes. Antes de añadir picados o sustentación aerodinámica compleja, conviene mejorar entrada, salida, giro y continuidad de la capa. La distinción de modos de Sky sirve como referencia de legibilidad, sin importar su sistema completo.

## 3) Recomendaciones aplicables, con números y dificultad

Todos los valores de esta sección son **propuestas para Ecos de Luz**. Las dificultades incluyen integración y comprobación: baja para ajustes localizados; media para estados o sistemas compartidos; alta para cambiar el controlador o producir animaciones nuevas.

### M01 · Velocidad y respuesta — dificultad baja

| Parámetro | Actual | Propuesta inicial |
| --- | --- | --- |
| Desplazamiento normal | 2,4 m/s | **3,2 m/s** |
| Carrera con `{correr}` | 4,2 m/s | **6,8 m/s** |
| Aceleración terrestre | 7,2 m/s² | **18 m/s²** |
| Frenado terrestre | 9 m/s² | **24 m/s²** |
| Aceleración en aire | 8 m/s² | Mantener **8 m/s²** en primera prueba |
| Agachado / guardia | 1,25 / 1,5 m/s | Mantener en primera prueba |
| Margen de borde / búfer de salto | 0,12 / 0,12 s | Mantener ambos |
| Carrera terrestre | Sin coste específico | **0 luz/s** |

Con aceleración constante, el arranque a 6,8 tarda unos **0,38 s**. Frenar tarda **0,28 s** y ocupa **0,96 m**. Así sube la velocidad sin aumentar la distancia actual de parada. Desde 3,2 a 6,8, la aceleración tarda **0,20 s**.

Una inversión recta completa, con la selección de aceleración/frenado de `acercar`, tardaría aproximadamente **0,66 s**. No debe presentarse como un giro instantáneo. M03 cubre la pose durante ese intervalo.

En 100 m a velocidad estable, la carrera pasa de **23,81 a 14,71 s**; el desplazamiento normal, de **41,67 a 31,25 s**. Son tiempos calculados, no medidos en el juego. Probar una variante de carrera de **6,2 m/s** solo si 6,8 dificulta leer caminos o entrar en interacciones.

**Integración prevista:** números en `MOV`; conservar las reducciones por ataque y carga hasta revisar combate. Antes de publicar la velocidad nueva, completar M02 y las comprobaciones de M07. El cambio de constantes es fácil; la validación del conjunto no lo es.

### M02 · Objetos sólidos completos y visibles en depuración — dificultad baja por pieza

Usar `?solidos` o `__ecos.solidos()` para recorrer muelle, casas, ruinas, faro, pirámides y plataformas. Clasificar cada incidencia como sólido ausente, tamaño incorrecto o trayectoria incorrecta.

**Objetivos numéricos:** diferencia visible/collider de **0,02–0,05 m** en superficies de contacto; huecos transitables de al menos **0,65 m** con la futura cápsula de M07; **0 objetos grandes atravesables** en las rutas obligatorias. Una vasija decorativa pequeña puede quedar sin bloqueo si esa es una decisión explícita de dirección.

Registrar la pieza concreta y el punto de contacto. No agrandar una caja hasta cerrar una puerta o llenar el interior de una casa. Cuando una construcción necesite huecos, representarla mediante varias piezas sólidas.

**Integración prevista:** datos de obra que generan `Sol`, incluidos los módulos de santuarios, piezas y capítulos. La auditoría completa tiene dificultad media por extensión, aunque corregir una pieza sea baja.

### M03 · Liberación de pies y giros — dificultad media, prioridad visual alta

| Situación | Regla propuesta |
| --- | --- |
| Pie demasiado lejos de su posición de descanso | Iniciar recolocación al superar **0,24 m** en el plano horizontal. No esperar al teletransporte de 1,6 m. |
| Torsión de apoyo | Liberar al superar **40°** entre orientación del apoyo y cuerpo; permitir replantado por debajo de **20°**. Guardar la orientación al apoyar. |
| Rodilla casi extendida | Liberar el apoyo al superar **95 %** de longitud total, unos **0,466 m** de cadera a tobillo. Mantener el límite duro del solver de aproximadamente **0,488 m**. |
| Posición lateral | Cada pie permanece en su lado con un mínimo de **0,025 m** desde el plano central de la pelvis. Validar después de transformar al espacio de la cadera. |
| Pérdida de suelo | Si el punto de apoyo baja más de **0,18 m** sin superficie válida, dejar de plantarlo allí. |
| Paso de recolocación parado | **0,16–0,22 s**, alza de **0,04–0,06 m** y pies alternos. |
| Giro parado grande | Con velocidad inferior a **0,25 m/s** y diferencia mayor de **55°**, dos pasos breves; objetivo visual de **0,28–0,40 s** para 90°. |
| Inversión corriendo | Si la dirección pedida difiere más de **120°**, soltar los apoyos antiguos y usar pose de pivote de **0,12–0,18 s**. El control y la colisión siguen actualizándose. |
| Mezcla durante pivote | Bajar peso de plantado hacia **0,25** en **0,06 s**; recuperarlo en **0,10 s**, una vez válidos los destinos. |

El límite de distancia no sustituye al de torsión. La separación lateral no debe empujar un pie fuera del alcance de su pierna: primero elegir un destino válido; después resolver IK.

Proteger el polo de rodilla: si el producto vectorial usado para formar su plano tiene longitud menor de **0,001**, recuperar el plano válido anterior y ortonormalizarlo. Mantener continuidad de signo. No normalizar un vector casi nulo ni reiniciar las rodillas a un eje arbitrario en cada giro.

La orientación del pie plantado puede variar hasta **15°** mediante un pequeño pivote; por encima debe levantarse. Limitar la alineación al suelo a **25°** por eje para que una muestra extrema no retuerza el tobillo.

**Integración prevista:** estado de cada pie, `reiniciarPies`, `ikPierna` y marcha de `17`. Tomar el giro del cuerpo visible, que ya tiene suavizado, y la velocidad real. No desactivar todo el IK de forma permanente para ocultar el fallo. Base conceptual: [Epic, restricciones de plantado](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/AnimationWarpingRuntime/FFootPlacementPlantSettings).

### M04 · Marcha diseñada y transiciones — dificultad media

Construir cuatro poses principales por ciclo: contacto, recepción de peso, paso por debajo y vuelo. Mantener el ancho nominal actual de **0,17 m entre pies**; admitir **0,14–0,20 m** según el estado.

| Estado | Cadencia total, ambos pies | Contacto de un pie | Otras pautas |
| --- | --- | --- | --- |
| Marcha cuidadosa con entrada parcial | **1,8–2,4 contactos/s** | Aproximadamente **55–65 % de su ciclo** | Velocidad hasta **1,6 m/s**; alza de **0,035–0,055 m**. |
| Trote normal a 3,2 m/s | **3,4–3,8 contactos/s** | **0,10–0,12 s** | Alza de **0,08–0,11 m**. |
| Carrera a 6,8 m/s | **4,4–4,8 contactos/s** | **0,06–0,075 s** | Alza de **0,12–0,16 m**; vuelo claro. |

La distancia entre contactos consecutivos resulta de `v / cadencia`: aproximadamente **0,84–0,94 m** en trote y **1,42–1,55 m** en carrera. Esa distancia incluye avance del cuerpo en vuelo. **No es el alcance horizontal de una pierna ni un destino IK situado a 1,5 m de la cadera.** En 0,07 s a 6,8 m/s, el cuerpo recorre 0,476 m: el apoyo puede pasar de delante a detrás antes de soltar.

Usar al principio rebote vertical de pelvis de **0,015–0,025 m** en trote y **0,025–0,035 m** en carrera. Inclinación sostenida de **6–8°** y **10–14°**, respectivamente. Los brazos acompañan con codo flexionado; no deben imitar la amplitud de las piernas.

Añadir recepción de arranque de **0,08 s**, mezcla de locomoción de **0,10–0,14 s** y asentamiento de parada de **0,10 s**. Son ventanas visuales superpuestas al control, sin espera antes de moverse. El pie que recibe el peso decide la pose de parada.

Para curvas, mantener inclinación calculada a partir de velocidad y giro, con tope de **12°** en trote y **18°** en carrera. Entrada en **0,10 s**, salida en **0,16 s**. El código ya inclina el cuerpo; ajustar ese sistema, sin añadir otra inclinación acumulativa.

Mantener `hikari:paso` como fuente de contacto y sonido. Tolerancia deseada entre apoyo visible y sonido: **±0,03 s**. La animación debe usar desplazamiento resuelto: al correr contra una pared no deben seguir avanzando las piernas a la velocidad solicitada.

**Integración prevista:** `MARCHA`, poses y medición de avance en `17`, con datos de contacto de `18`. En mando, la entrada parcial puede cubrir la marcha lenta. En teclado, el desplazamiento normal de 3,2 se verá como trote. No introducir un tercer control sin encargo.

### M05 · Capa estable — dificultad media

| Parámetro o regla | Propuesta |
| --- | --- |
| Malla | Mantener **10 × 14 puntos**, 140 en total. No añadir detalle antes de estabilizar. |
| Paso interno | **1/120 s** con acumulador. A 30/60/120 FPS corresponden 4/2/1 subpasos. |
| Recuperación tras tirón | Máximo **6 subpasos** para los 0,05 s admitidos por el juego; ante saltos mayores o vuelta de pestaña, reiniciar historial. |
| Anclas | Interpolar posición y orientación entre pecho anterior y actual durante los subpasos. Evitar aplicar la posición final del pecho en todos ellos. |
| Iteraciones | Empezar con **4 por subpaso**; subir a **6** si no se cumple el límite de longitud. Medir CPU. |
| Extensión | Error objetivo de aristas estructurales inferior al **3 %**; tolerancia máxima de **5 %** tras giros y frenadas. Medir después de la colisión corporal. |
| Límite al ancla | Para cada punto, distancia a su ancla no mayor de **1,03 × la longitud de reposo acumulada de su columna**. Considerar la forma y altura propia de esa columna. |
| Colisión corporal | Separación de **0,015–0,025 m** con proxies simples de torso y cadera. Añadir muslos solo si su penetración resulta visible. |
| Amortiguación | Conservar inicialmente una retención equivalente a la actual: **0,90 por 1/60 s**, convertida al paso interno. No usar 0,90 sin convertir en cada subpaso. |
| Cambios discontinuos | Recolocar posiciones actual y anterior si el ancla salta más de **0,75 m** en una actualización o hay cambio instantáneo de orientación mayor de **120°**. No reiniciar durante curvas normales. |

Orden recomendado por subpaso: integrar; fijar anclas; resolver distancias y diagonales; proyectar colisiones; repetir la resolución conjunta hasta la tolerancia. Una última pasada de distancias puede introducir penetración de nuevo: comprobar ambas restricciones al terminar. Si persiste un conflicto, reducir movimiento secundario y conservar una forma de respaldo cercana al cuerpo.

Revisar las recolocaciones de `colisionCuerpo`: con cuatro iteraciones por subpaso habrá más llamadas que ahora. Los sesgos de forma deben aplicarse como objetivos o restricciones con peso estable en tiempo; no multiplicar sin ajuste el desplazamiento de `CAPA.curva` por la nueva cantidad de iteraciones.

Al corregir una discontinuidad, aplicar la transformación también a la posición anterior. En contactos normales, eliminar la velocidad hacia dentro del cuerpo y amortiguar el componente tangencial. No borrar toda la inercia de la capa en cada contacto.

Mantener largo nominal de **0,72 m**. El ancho de **0,91 a 1,38 m** es un despliegue deliberado; interpolarlo durante **0,30–0,40 s**. Calcular el error contra la forma de reposo vigente, no contra el ancho terrestre cuando las alas están abiertas. Presupuesto inicial de tela y cintas de Hikari: **≤0,8 ms de CPU, percentil 95**, en el portátil de referencia enchufado. Es un objetivo, no una medición actual.

**Integración prevista:** opciones por instancia en `Tela` de `05`, anclas y colisión en `17`. Tasogare también usa `Tela`: verificarlo después de cualquier cambio compartido. Fundamento: [Jakobsen](https://www.cs.cmu.edu/afs/cs/academic/class/15462-s13/www/lec_slides/Jakobsen.pdf) y [Fiedler](https://www.gafferongames.com/post/fix_your_timestep/).

### M06 · Reglas de escalada y auparse — dificultad media

Añadir permisos separados al sólido o a la superficie: **se puede pisar**, **se puede aupar** y **se puede trepar**. Los nombres concretos los decide Claude. La ausencia de permiso de trepa significa que no se trepa. Las zonas de terreno escalable también requieren datos de autorización; no basta con su pendiente.

| Regla | Número propuesto |
| --- | --- |
| Escalón automático | **0,25 m**, con el mismo umbral en las consultas de suelo y avance. |
| Auparse | Desnivel de **0,30–0,95 m**, únicamente si la superficie lo permite. |
| Animación de auparse | **0,30–0,50 s**, según altura. |
| Intención de trepar | `{mover}` hacia la pared y `{saltar}` mantenido **0,15 s**. Sin activación por empujar solamente. |
| Dirección válida | Dentro de **35°** respecto a la dirección hacia la pared. |
| Distancia de detección | Hasta **0,40 m desde el centro** para la cápsula propuesta; validar la posición final sin penetración. |
| Pendiente caminable del terreno | Hasta **42°**, equivalente a gradiente aproximado de **0,90**. |
| Inicio de deslizamiento | A partir de **46°**, gradiente aproximado de **1,04**. Entre ambos, conservar estado para evitar parpadeo. |
| Trepa de superficie inclinada | **60–95° desde horizontal**, con permiso. Techos y voladizos quedan fuera. |
| Subida / movimiento lateral | **1,6 / 1,3 m/s**, conservar inicialmente. |
| Coste al moverse / quieta | **8 / 2,5 luz/s**, conservar. Sin regeneración durante la trepa. |
| Reserva de entrada | **8 unidades de luz**. |
| Descanso entre tramos | Plataforma segura cada **8–12 m verticales** en rutas obligatorias. |

`pendiente()` devuelve un gradiente, no grados ni radianes. Los umbrales actuales 1,15 y 1,25 representan aproximadamente **49° y 51°**. Convertir mediante tangente al configurar y documentar; no comparar directamente 42 con ese resultado.

A 1,6 m/s y 8 luz/s, subir 12 m consume unas **60 unidades**. Con 100 unidades, el máximo teórico continuo es **20 m**. Una ruta obligatoria debe permitir margen y no asumir una reserva llena después del combate.

En `J.trepa`, guardar el sólido o la región autorizada. Revalidar al cambiar de pared: un roce lateral no debe transferir a una superficie prohibida. Para auparse, comprobar barrido de cuerpo y espacio final con holgura de **0,05 m**. Pendiente del destino menor de **35°**. No iniciar la interpolación si la cabeza o el torso cruzan una viga.

**Dependencia de contenido:** auditar pirámides de Duna, espiral, santuarios, cima de Kiri y accesos de Yoake. Un techo no escalable aún puede ser alcanzable con el salto actual, que sube unos **2,04 m** antes de considerar doble salto. Decidir por lugar qué acceso se permite. Las etiquetas de trepa no sustituyen el diseño de rutas ni el Velo.

**Integración prevista:** permisos de `Sol` y obra; lógica de `18`; pruebas de capítulos. Mantener el agarre en aire solo con intención y superficie válidas. Base de control: [Activision, puntos válidos de gancho](https://support.activision.com/sekiro/articles/using-the-shinobi-prosthetic-in-sekiro-shadows-die-twice).

### M07 · Barrido y deslizamiento de colisión — dificultad alta

Objetivo: barrer un volumen del personaje desde posición anterior hasta destino, tomar el primer contacto y deslizar el resto del movimiento por la superficie. Incluir avance horizontal, salto, descenso, trepa, auparse y desplazamientos de corrientes.

| Parámetro | Propuesta |
| --- | --- |
| Cápsula inicial de evaluación | Altura total de **1,31 m**, radio de **0,24 m**, incluyendo la capucha en altura. |
| Margen de contacto | **0,015 m**. |
| Deslizamientos sucesivos | Hasta **3 contactos** por desplazamiento. |
| Corrección de penetración residual | Hasta **4 pasadas**, con objetivo residual de **≤0,01 m**. |
| Filtro espacial inicial | Celdas de **16 m** para consultar sólidos cercanos, si el perfil demuestra que hace falta. |

La cápsula es una propuesta de navegación, no el volumen de daño ni la tela. Mantener inicialmente el radio actual de 0,42 en la versión jugable mientras se ensaya la nueva cápsula en rutas y puertas. Cambiar forma, radio y umbrales a la vez sin comparación impediría saber qué mejoró.

Como paso intermedio, dividir el movimiento según `ceil(distancia / 0,12 m)`, con al menos una subdivisión, y resolver contactos en cada una. A 6,8 m/s y 0,05 s son **3 subdivisiones**. Esto reduce saltos, pero **no garantiza** detectar cualquier pared fina: el objetivo final sigue siendo el barrido. No confundirlo con detección continua completa.

Tras cada contacto, quitar de la velocidad la componente que entra en la pared. Obtener la velocidad visual del desplazamiento realmente aceptado para no animar una carrera contra un muro. Comprobar techo para estructuras normales, además del límite que ya existe para cuevas.

Aplicar la corriente antes del barrido final o barrer su desplazamiento por separado. La resolución actual queda antes de esa corrección de posición. Igual criterio para cualquier empuje externo.

**Integración prevista:** extender consultas en `Sol`, controlador de `Mov` y conexión con `sueloEnJ`. Es una modificación de arquitectura localizada, no una propuesta de migrar a otro motor. Referencia: [NVIDIA, barrido, escalones y deslizamiento](https://nvidia-omniverse.github.io/PhysX/physx/5.3.0/docs/CharacterControllers.html).

### M08 · Separación con personas y criaturas — dificultad media

Para habitantes, usar un radio de proximidad de **0,25–0,32 m** más el radio de Hikari; iniciar desaceleración suave **0,15 m** antes del contacto. La corrección no debe superar **0,06 m por subpaso**. Respetar diferencia vertical y superficies distintas: nadie bajo un puente debe empujar a quien camina encima.

Prioridad recomendada: Hikari frena o desliza ante un habitante quieto; un habitante con ruta busca rodearla. Evitar empujar a Tsuru, Momo o animales contra paredes y bordes. Tras una corrección de separación, volver a resolver sólidos. Mantener **0,02 m** de separación residual de cuerpos cuando haya espacio.

Para Sombras, conservar los radios de sus fichas y revisar la excepción actual de esquiva y ataque. No reutilizar la cápsula de navegación como alcance de daño. Las reacciones de fauna siguen siendo calma o huida según el sistema vigente; la colisión de movimiento no inflige daño.

**Integración prevista:** reutilizar la separación existente de `35`; acordar la equivalente de habitantes con el sistema de `25`. Consultar vecinos a **2 m** para personajes de tamaño humano; usar el radio propio en criaturas grandes. Revisar un grupo de **10 habitantes o Sombras** en una esquina, sin apilado ni vibración visible.

### M09 · Nado rápido con luz — dificultad media

| Parámetro | Propuesta |
| --- | --- |
| Nado normal de superficie | **3,6 m/s**, sin consumo de luz. |
| Nado rápido con `{correr}` | **6,8 m/s**, igual que la carrera terrestre propuesta. |
| Aceleración / frenado acuático | **12 / 14 m/s²**. |
| Cambio de normal a rápido | Unos **0,27 s** con esa aceleración. |
| Coste por segundo | **La misma expresión que el planeo:** base 10, o 6 con su mejora de nivel, multiplicada por `Sis.planeoMult().coste`. |
| Regeneración durante nado rápido | **0 luz/s**, aunque `J.suelo` haya quedado activo durante la transición. |
| Regeneración en nado normal | **6 luz/s**, después de **0,75 s** sin sprint y sin otro consumo activo incompatible. |
| Entrada al sprint | Reserva mínima de **12 unidades** y movimiento solicitado. |
| Agotamiento | Volver a nado normal; exigir soltar `{correr}` y recuperar 12 unidades para rearmar el sprint. |
| Aviso de reserva baja | Una señal al cruzar **20 %** de luz. Evitar avisos repetidos durante **3 s**. |

Con 100 unidades, sin mejoras ni regeneración simultánea, son **10 s** de sprint acuático a coste 10, hasta unos **68 m** a velocidad estable. A coste 6 son **16,67 s**, unos **113 m**. La autonomía real usa la luz máxima del nivel, el altar y la aceleración; no fijar el diseño de una travesía al valor 100.

El agotamiento no añade ahogamiento, daño ni bloqueo de desplazamiento. Hikari continúa a 3,6 m/s. Si pulsa `{correr}` estando quieta, no se cobra. Cobrar tiempo de sprint activo, no número de brazadas ni cambios de dirección. Mantener pulsado y pulsar repetidamente no deben dar costes diferentes por la misma distancia y tiempo activos.

Animación: nado normal con ciclo de **0,85–1,0 s**; sprint con ciclo de **0,60–0,70 s**. Interpolar en **0,15 s**. Brazadas opuestas, piernas con patada corta y estela acuática sostenida. Vincular la propulsión visible a la velocidad sin convertirla en grandes tirones del controlador. Balanceo vertical máximo de **0,025 m**.

**Integración prevista:** rama acuática y contabilidad de `finPaso` en `18`; estado y datos de animación enviados por `10`; poses de `17`. Compartir la función de coste de desplazamiento luminoso para evitar que agua y aire diverjan. No gastar motas, que son moneda y puntaje. Aplicar exactamente los descuentos de planeo cumple la igualdad solicitada, aunque la mejora existente se llame «capa».

### M10 · Buceo y corrientes legibles — dificultad media

Primera entrega funcional: conservar superficie estable alrededor del objetivo actual `NIVEL_AGUA - 0,42`. Usar histéresis de profundidad del suelo: entrar a nado con **0,75 m** de profundidad y salir en **0,55 m**. Revisar altura de la cabeza con la pose inclinada; las olas visuales no deben cambiar el modo a cada fotograma.

Para buceo dirigido, mantener `{agacharse}` como descenso y permitir `{saltar}` como ascenso mientras esté sumergida. Velocidad vertical de **2,2 m/s** hacia abajo y **2,8 m/s** hacia arriba; límite de **0,25 m** sobre el fondo. Al soltar ambas acciones, conservar profundidad con amortiguación, en vez de subir siempre de inmediato. Reservar el salto fuera del agua para la superficie y evitar que mantener ascenso lo dispare repetidamente.

Velocidad horizontal de buceo normal: **3,2 m/s**. Buceo rápido: **6 m/s**, con el mismo coste de luz por segundo de M09. Mezcla de entrada/salida de **0,20 s**. La cámara debe mantener rumbo y colisión, con margen de **0,20 m** sobre el fondo para no entrar en roca.

Corrientes locales opcionales: vector de **0,4–0,8 m/s**; máximo de **1,2 m/s** en un tramo señalado. Transición espacial de fuerza a lo largo de **3–5 m**. Espuma, partículas o vegetación muestran el sentido. Su desplazamiento pasa por colisión.

La devolución al límite del mundo se conserva como sistema distinto. Auditar su aplicación actual fuera del nado antes de cambiarla, porque también contiene a quien planea lejos. Una corriente local nunca debe permitir cruzar el Velo ni reemplazar la travesía de historia a Yoake.

**Integración prevista:** estados acuáticos en `18` y su inicialización en `J`; pose y lectura de buceo en `17`/`10`. El nado rápido de superficie puede entregarse antes que el buceo persistente. No se propone añadir oxígeno. Referencia de estados acuáticos: [Sky 0.16.0](https://thatgamecompany.helpshift.com/hc/en/17-sky-children-of-the-light/faq/866-patch-notes---january-13-2022---0-16-0-182597/).

### M11 · Planeo: conservar alcance y mejorar control — dificultad media

Mantener inicialmente **8,8 m/s**, descensos de **2,1 / 1,5 m/s**, costes de **10 / 6 luz/s** y multiplicadores existentes. La relación de planeo a velocidad estable, sin mejoras de altar ni corrientes, es aproximadamente **4,19 / 5,87 m horizontales por metro descendido**. Es un cálculo útil para revisar distancias, no una distancia garantizada desde cualquier salto.

El parámetro actual `giro: 2,6` es una tasa de `angDamp`, **no un límite duro de 2,6 rad/s**. Si se desea un giro limitado, proponerlo de forma explícita: máximo de **160°/s**, con amortiguación de entrada de **0,12 s**. La inclinación visual puede llegar a **25°**, sin rotar el collider de navegación.

Mezclar apertura de alas en **0,18 s** y capa en **0,35 s**. Conservar el descenso actual mientras se prueba el nuevo giro. Al tocar suelo, proyectar la velocidad sobre él y mezclar a carrera durante **0,15–0,20 s**; aplicar frenado o velocidad máxima terrestre después, sin un salto visual de velocidad. Al tocar agua, pasar a nado y cerrar alas en **0,20 s**.

Objetivo de continuidad: al pasar de aire a agua o suelo, salto visual de posición inferior a **0,03 m**, sin penetración. Mantener el inicio de planeo descendente que ya existe y revisar su respuesta antes de cambiar más controles.

**Integración prevista:** `MOV.planeo`, transiciones en `18` y pose/capa de `17`. No añadir vuelo ascendente permanente, picados con aceleración ilimitada o una segunda reserva. La prioridad es hacer legible y estable el planeo existente.

### M12 · Clips nuevos o motion matching — dificultad alta, ampliación posterior

Si M03–M04 no alcanzan la calidad deseada, producir poses o clips nuevos para este cuerpo. Paquete mínimo: **reposo, trote, carrera, arranque, dos paradas según pie, giro de 90° a cada lado y pivote de 180° a cada lado**: **10 piezas**. Añadir después nado normal y rápido como otras dos. Usar fundidos de **0,08–0,16 s**, con sincronización de fase entre ciclos.

Aplicación: `Mov` resuelve desplazamiento; una sola capa base escribe los huesos; después se aplican inclinación, IK y arma. No ejecutar en paralelo un clip de piernas y el generador actual escribiendo la misma rotación. La tela física permanece separada de las pistas de tela horneadas.

**Motion matching:** dificultad alta adicional; no se recomienda para esta fase. Los ocho clips portables actuales no cubren arranques, paradas y pivotes variados. Antes de evaluarlo, producir un corpus que cubra esas maniobras y demostrar que una máquina de estados pequeña no basta. Presupuesto exploratorio de búsqueda: **≤0,5 ms de CPU, percentil 95** en el equipo de referencia; es un criterio de evaluación propio, no una cifra publicada de For Honor. [Clavet, explicación del método](https://www.gdcvault.com/play/1023280/Motion-Matching-and-The-Road).

## 4) Lista ordenada de menor a mayor dificultad

El orden siguiente compara dificultad. Las dependencias de entrega se indican aparte.

| Orden | Cambio | Dificultad | Condición para darlo por válido |
| --- | --- | --- | --- |
| 1 | **M01:** velocidades, aceleración y frenado | Baja | Recorridos y frenadas medidos; revisión de colisiones antes de publicar. |
| 2 | **M02:** corregir un sólido ausente o mal ajustado | Baja por pieza | Geometría y sólido coinciden; accesos abiertos. |
| 3 | **M09:** lógica de sprint acuático y luz | Media | Mantener y pulsar tienen coste coherente; no hay regeneración simultánea. |
| 4 | **M11:** transiciones y giro de planeo | Media | Mantiene rutas y alcance; transiciones sin saltos. |
| 5 | **M08:** separación con habitantes | Media | No empuja a nadie contra obra ni cambia excepciones de combate. |
| 6 | **M03:** soltar, recolocar y replantar pies | Media | Cien giros bruscos sin cruce ni extensión visible imposible. |
| 7 | **M04:** poses y cadencia de locomoción | Media | Marcha aprobada visualmente a tres velocidades y contra pared. |
| 8 | **M06:** permisos de escalada y revisión de rutas | Media | Todas las alturas obligatorias siguen accesibles; obra prohibida no activa trepa. |
| 9 | **M10:** buceo dirigido y corrientes locales | Media | Control vertical estable; barca y Velo conservan su función. |
| 10 | **M05:** tiempo, restricciones y colisión de capa | Media | Error de longitud medido y presupuesto de CPU cumplido. |
| 11 | **M07:** barrido del cuerpo y resolución completa | Alta | Cero cruces en obstáculos de prueba, incluidos techos y esquinas. |
| 12 | **M12:** producción e integración de clips nuevos | Alta | Mejora visual demostrada frente a la base procedural. |
| 13 | **M12, ampliación:** motion matching | Alta adicional | Corpus suficiente y beneficio medido; posponer. |

**Orden de entrega recomendado:** diagnóstico M02 → protección de colisión M07 → ajuste conjunto M01/M03/M04 → nado M09 → capa M05 → escalada M06 → refinamientos M08/M10/M11. M01 puede ensayarse enseguida, pero aumentar la velocidad pública sin revisar trayectorias agravaría los fallos de atravesamiento.

## 5) Riesgos y qué evitar

| Riesgo | Qué evitar | Comprobación concreta |
| --- | --- | --- |
| Carrera rápida con piernas de 0,49 m | Aumentar frecuencia o alcance sin límite; plantar durante toda la zancada. | Vídeo frontal, lateral y trasero a 1,6, 3,2 y 6,8 m/s. Revisar pies a cámara lenta. |
| Giros que siguen fallando | Bajar IK sin liberar destinos; girar ambos pies plantados 180°. | **100 cambios** de 90° y 180°, alternando lados, en llano y en pendiente. |
| Capa que vuelve a estirarse | Más viento, más puntos o más iteraciones sin corregir tiempo y anclas. | Medir longitud de aristas después de resolver cuerpo y tela; error máximo **≤5 %**. |
| Capa rígida o nerviosa | Reiniciarla en cada curva; convertir sesgos por iteración en fuerzas multiplicadas. | Carrera, parada y giro a 30/60/120 FPS; comprobar forma a 0,5 s de cada maniobra. |
| Penetraciones | Suponer que toda geometría visual tiene collider o resolver solo al final. | Paredes de **0,05, 0,10 y 0,20 m** de espesor; cajas giradas 45°; esquina cóncava; techo bajo. |
| Salto que atraviesa techos o losas | Validar solo X/Z y ajustar Y al terminar. | Saltos ascendentes y caída sobre plataformas, con cuerpo completo. |
| Escalada que rompe capítulos | Etiquetar toda roca o cerrar todo sin inventario de rutas. | Capítulos 1–7, en especial Duna, Kiri y espiral; confirmar Velo y accesos. |
| Sprint acuático casi gratuito | Descontar 10/s y recuperar 6/s en el mismo paso. | Nivel 1 sin mejoras: **100 → 50 luz en 5 s** de sprint activo. El tramo debe permitir toda la prueba. |
| Recarga indebida con otra acción | Mantener la recuperación acuática aunque el haz u otro consumo sigan activos. | Combinaciones de estado; una única contabilidad explícita por paso. |
| Nado que obliga a pulsar muchas veces | Cobrar por brazada o regalar impulsos al reactivar. | Comparar mantener con pulsos equivalentes durante **10 s**; verificar tiempo y coste activos. |
| Agua que cambia de modo sin parar | Usar un solo umbral o las crestas visuales como cambio de estado. | Entrar y salir por orilla durante **30 s**, sin alternancia rápida de suelo/nado. |
| Corriente que atraviesa el muelle | Aplicar desplazamiento después de colisionar. | Nadar contra corriente junto a pilotes y bajo el muelle. |
| Lectura de historia peor con velocidad nueva | Dar por válidos tiempos antiguos de viaje y diálogos. | Recorrer inicio y trayectos con conversación; medir cuánto texto queda al llegar. |
| Combate demasiado fácil de eludir | Aumentar la velocidad de todos los enemigos en el mismo porcentaje. | Probar Oni, Cazador, Tasogare y Luna Roja; valorar persecución y regreso a arena por separado. |
| Colisión que daña a seres vivos | Convertir contacto o sprint en embestida ofensiva. | Rozar habitantes y fauna; ningún daño provocado por locomoción. |
| Rendimiento asumido | Tomar cifras históricas a batería como presupuesto actual. | Medir enchufado en tres calidades; separar CPU de animación, tela y colisión. |

**Protocolo de aceptación para Claude:** usar las herramientas existentes de avance manual y `Hikari._marcha()`. Medir un tramo de **100 m**, diez arranques y diez frenadas. Registrar mediana y máximo. Para diferencias entre tasas de actualización, objetivo inicial de distancia y gasto dentro de **±2 %** y sin penetración visible. Ejecutar además secuencias con un fotograma de **0,05 s** y reanudación tras pausa. El recorte de `dt` del juego no equivale a recuperar todo el tiempo real perdido; documentar si la prueba mide tiempo simulado o de reloj.

Para colisiones, hacer **20 pasadas por caso y tasa** a 30/60/120 FPS, con carrera, esquiva, salto y planeo. Para capa, registrar percentil 95 de coste de CPU durante **60 s**, además del peor error de longitud. Estas son pruebas propuestas; no se ejecutaron porque el encargo es de investigación y el juego no cambió.

La aprobación visual del usuario sigue siendo necesaria para marcha y capa. Una captura aislada no acredita continuidad y una prueba de consola no mide si el movimiento resulta agradable.

## 6) Fuentes

Consulta web realizada para este informe el **2 y 3 de noviembre de 2026**. Se prefieren autores, estudios y documentación oficial. La evidencia comunitaria original se identifica expresamente. Las páginas de motores aportan principios; no se presupone que sus nodos existan en Three.js.

| ID | Fuente y URL | Uso y límite |
| --- | --- | --- |
| F01 | [Aonuma entrevistado por Matt Peckham, Time, 2016](https://time.com/4369527/zelda-breath-wild-open-world/) | Decisiones de salto y escalada de BotW. Entrevista directa; sin parámetros numéricos. |
| F02 | [Nintendo, Change and Constant, GDC 2017](https://www.gdcvault.com/play/1024562/Change-and-Constant-Breaking-Conventions) | Referencia de diseño y desarrollo. Se consultó la ficha pública; no se extraen velocidades de ella. |
| F03 | [Independent-View-478, The Speed of Link — TotK, 2023](https://www.reddit.com/r/tearsofthekingdom/comments/16svd42/the_speed_of_link_tears_of_the_kingdom/) | Medición original comunitaria por coordenadas. Confianza limitada; sin aceleraciones ni repetición independiente aquí. |
| F04 | [KQM, Movement and Physics — Evidence Vault](https://library.keqingmains.com/evidence/general-mechanics/movement-and-physics) | Pruebas originales con fechas, métodos y vídeos. Datos de versiones concretas; no tabla oficial de HoYoverse. |
| F05 | [Ubisoft, Assassin’s Creed Shadows — Parkour System Overview, 2025](https://www.ubisoft.com/en-us/game/assassins-creed/news/4TA6gKaTvtOC1mOjZIxCZd/assassins-creed-shadows-parkour-system-overview) | Intención de controles, diferencias de personajes y transiciones. Sin m/s ni m/s². |
| F06 | [PlayStation Blog, Sekiro — Tips for Dark Souls, Bloodborne Veterans, 2019](https://blog.playstation.com/2019/03/22/sekiro-shadows-die-twice-tips-for-dark-souls-bloodborne-veterans/) | Movilidad sin límite de estamina. Fuente de la plataforma; sin métricas. |
| F07 | [Activision, Using the Shinobi Prosthetic in Sekiro, 2019](https://support.activision.com/sekiro/articles/using-the-shinobi-prosthetic-in-sekiro-shadows-die-twice) | Puntos válidos de gancho y señal de alcance. |
| F08 | [Bandai Namco, Elden Ring Starter Guide](https://en.bandainamcoent.eu/elden-ring/news/elden-ring-starter-guide-tips-know-playing-the-game) | Dash y estamina. Contenido pertinente visible en el índice de búsqueda; la apertura completa agotó el tiempo de respuesta. No se usa como fuente de cifras. |
| F09 | [thatgamecompany, How do I fly with my character? — Sky Beta](https://thatgamecompany.helpshift.com/hc/en/13-sky-beta/faq/377-how-do-i-fly-with-my-character/?f=patch-notes---june-29-2021---0-14-0-171755&p=all&s=patch-notes) | Ayuda oficial histórica sobre modos de vuelo. No es una afirmación sobre todos los controles actuales de Sky. |
| F10 | [thatgamecompany, Sky — Patch Notes 0.16.0, 13/01/2022](https://thatgamecompany.helpshift.com/hc/en/17-sky-children-of-the-light/faq/866-patch-notes---january-13-2022---0-16-0-182597/) | Introducción del buceo, dirección, propulsión y respiración. |
| F11 | [Karen Moltenbrey, Mysterious Journey, CGW, 2012](https://www.cgw.com/Publications/CGW/2012/Volume-35-Issue-4-June-July-2012/Mysterious-Journey.aspx) | Entrevista directa a Nava y Jessie sobre animación y simulación de ropa. |
| F12 | [Adam Robinson-Yu, Crafting a Tiny Open World, PlayStation Blog, 2021](https://blog.playstation.com/2021/08/05/crafting-a-tiny-open-world-a-look-behind-the-scenes-at-the-creation-of-a-short-hike/) | Diseño de exploración explicado por su creador. |
| F13 | [Adam Robinson-Yu, A Short Hike Postmortem, GDC 2020](https://www.gdcvault.com/play/1026613/) | Ficha pública del postmortem; alcance y estrategia de producción. |
| F14 | [David Rosen, An Indie Approach to Procedural Animation, GDC 2014](https://www.gdcvault.com/play/1020583/Animation-Bootcamp-An-Indie-Approachtalking) | Pocas poses y adaptación procedural; ejemplos de Overgrowth y otros juegos de Wolfire. |
| F15 | [Simon Clavet, Motion Matching and the Road to Next-Gen Animation, GDC 2016](https://www.gdcvault.com/play/1023280/Motion-Matching-and-The-Road) | Búsqueda de pose y trayectoria en un corpus de animación. |
| F16 | [Epic Games, FFootPlacementPlantSettings](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/AnimationWarpingRuntime/FFootPlacementPlantSettings) | Liberación y replantado por distancia/ángulo, extensión y separación de pies. |
| F17 | [Thomas Jakobsen, Advanced Character Physics, IO Interactive](https://www.cs.cmu.edu/afs/cs/academic/class/15462-s13/www/lec_slides/Jakobsen.pdf) | Artículo original, copia académica. Verlet, restricciones y proyección de colisiones. |
| F18 | [Müller, Heidelberger, Hennix y Ratcliff, Position Based Dynamics, 2006](https://doi.org/10.2312/PE/vriphys/vriphys06/071-080) | Publicación original sobre corrección de posiciones y ropa interactiva. |
| F19 | [Bill Rockenbeck, Blowing from the West — Ghost of Tsushima, GDC 2021](https://www.gdcvault.com/play/1027350/Blowing-from-the-West-Simulating) | Coherencia y coste de simulaciones de viento. Se consultó la ficha, no se extrapolan parámetros de Jin. |
| F20 | [NVIDIA, PhysX 5.3 — Character Controllers](https://nvidia-omniverse.github.io/PhysX/physx/5.3.0/docs/CharacterControllers.html) | Barrido, deslizamiento, penetración, escalones y pendientes. |
| F21 | [Glenn Fiedler, Fix Your Timestep!, 2004](https://www.gafferongames.com/post/fix_your_timestep/) | Paso temporal, acumulador y límites de recuperación. |
| F22 | [Three.js r128, AnimationMixer](https://github.com/mrdoob/three.js/blob/r128/src/animation/AnimationMixer.js) y [AnimationAction](https://github.com/mrdoob/three.js/blob/r128/src/animation/AnimationAction.js) | Código primario de mezcla y transiciones en la versión del proyecto. |
| F23 | [HoYoLAB, medición original de velocidades al caminar y correr](https://www.hoyolab.com/article/8700739) | Publicación comunitaria en japonés; no declaración oficial de HoYoverse. Describe distancia, fotogramas y 30 FPS. El personaje y la escala corporal no quedan identificados en el texto consultado; no incluye sprint. Contenido recuperado por búsqueda, sin repetición independiente aquí. |

**Fuentes locales revisadas:** documentación inicial citada; `js/00-nucleo.js`, `04-estructuras.js`, `05-personaje.js`, `17-hikari.js`, `18-movimiento.js` y `47-hikari-modelo.js`; consultas de suelo, tiempo, teletransporte y conexión de animación en `10-juego.js`; cálculo de luz y mejoras en `07-sistemas.js`; separación en `35-sombras.js`; uso compartido de tela en `36-tasogare.js`; guía `modelos/hikari/LEEME.md`. Algunas descripciones de estado de `PERSONAJES.md` conservan la etapa del piloto: para el alcance de capítulos prevalecen el tablero, el plan y el README vigentes. No se corrigen en este encargo.

### Cierre de entrega

- **Archivos tocados:** únicamente `docs/entregas_chatgpt/investigacion/01_movimiento.md`.
- **Decisiones tomadas:** proponer 3,2/6,8 m/s y 18/24 m/s²; conservar locomoción híbrida; liberar apoyos antes de forzar IK; estabilizar la tela existente; autorizar escalada por superficie; resolver volumen y trayectoria; equiparar coste del nado rápido al planeo. Son propuestas para integrar y probar, no cambios aprobados o implementados.
- **Preguntas abiertas:** **Pregunta para el usuario:** tras probar 6,8 m/s, ¿la carrera resulta cómoda en caminos y junto a personajes? **Pregunta para el usuario:** ¿el estilo de carrera con vuelo breve y ligero conserva la personalidad que quiere para Hikari? Para Claude: inventariar superficies escalables obligatorias y comprobar si el nado rápido debe recibir en interfaz el mismo nombre de mejora que la capa. No quedan nuevas decisiones de canon fijadas por este informe.
