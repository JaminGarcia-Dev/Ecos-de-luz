# Investigación 03 · Historia, cinemáticas, misiones, recompensas y contenido

**Fecha de entrega:** 2026-11-03. **Investigación:** iniciada el 2026-11-02. **Destinatario:** Claude, dirección e implementación. **Alcance:** investigación y diseño. Sin cambios en el juego.

## 1. Resumen de 10 líneas

1. La campaña tiene un conflicto sólido; conviene hacer más visibles sus causas, decisiones y consecuencias.
2. Cada capítulo debe combinar una revelación, una acción distinta y un cambio reconocible del mundo.
3. Las cinemáticas breves funcionan cuando muestran relaciones claras y dejan tiempo para leer y reaccionar.
4. Las 13 secundarias actuales necesitan más situaciones y menos cuotas de recolección con entrega de vuelta.
5. Las recompensas deben ofrecer identidad, nuevas posibilidades, personalización o memoria, además de experiencia.
6. La Naginata llega tarde; conviene probar una adquisición temprana sin alterar la misión de Kuma sin autorización.
7. La Odachi necesita una procedencia aprobada; su antigua forja no debe regresar por inercia.
8. El vestuario puede separar apariencia y efecto para que el jugador conserve su aspecto favorito.
9. Los poderes deben ampliar pulso, haz, planeo y canalización, con costes y accesos que respeten los capítulos.
10. La prioridad es pulir comprensión, respuesta y recompensas existentes antes de multiplicar sistemas y colecciones.

## 2. Hallazgos por tema

### Método y límites de la investigación

Se consultaron entrevistas con desarrolladores, manuales oficiales, páginas de los estudios y resúmenes públicos de GDC. Las URL figuran junto a los hallazgos y en la sección 6. **Las explicaciones de por qué funcionan son análisis de diseño de esta investigación.** No son resultados experimentales ni citas literales de sus autores. No se atribuyen detalles a vídeos completos que no se han visionado. En GDC se distingue el resumen público de la charla.

**Todos los números propuestos para Ecos de Luz son valores iniciales de prueba.** No proceden de copiar parámetros internos de los juegos citados. Las cifras existentes del proyecto se identifican como tales. Las dificultades consideran el proyecto actual, sus guardados y su arte procedural; no son estimaciones de jornadas.

### 2.1. Historia ambiental: una prueba que el jugador puede interpretar

| Referencia y evidencia | Por qué funciona | Aplicación a Ecos de Luz |
|---|---|---|
| **Ori and the Will of the Wisps.** La charla de Jeremy Gritton y Chris McEntee trata la comunicación de temas mediante narrativa visual y su integración con el juego. Se consultó su resumen público. | La imagen y la acción pueden compartir el mismo sentido. La escena gana fuerza cuando sabemos qué intenta hacer el personaje. | Conservar el mismo encuadre antes y después de cubrir el emisor de Sayo. Se entiende que cambia la percepción de una persona que ya estaba allí. [Fuente](https://www.gdcvault.com/play/1027305/-Ori-Will-of-the). |
| **Okami.** El manual relaciona ayudar a personas, alimentar animales y restaurar árboles con obtener Praise y mejorar atributos. | La progresión premia conductas coherentes con el papel de la protagonista. Restaurar deja una consecuencia visible. | Dar valor mecánico al cuidado y a la restauración. Un gólem purificado debe permanecer vivo y reconocible en su arena. [Manual oficial, páginas impresas 28–29](https://static.capcom.com/okami/manuals/Wii_Okami_Manual.pdf). |
| **Genshin Impact.** Hadi Qi explica cómo colocaron vistas de Luhua Pool después del recorrido jugable. Guodong explica la necesidad de despejar la vista sin eliminar la interfaz útil. | Llegar a una buena vista puede ser una recompensa espacial. El recorrido prepara su aparición. | Diseñar la salida del Velo y el mirador de Yoake para comparar ambos horizontes desde el control del jugador. [Entrevista a los responsables](https://apps.apple.com/cn/iphone/story/id1576338984?l=en-GB). |

**Conclusión de diseño:** una pista ambiental necesita un lugar legible, una observación y una consecuencia. El mural distinto plantea una pregunta. El archivo de Duna la demuestra. El diario conserva lo demostrado. La información imprescindible también debe quedar expresada en la ruta principal.

### 2.2. Cinemáticas: arco emocional, actuación y economía

**Journey.** El resumen de *Designing Journey*, de Jenova Chen, presenta el pulido de un arco emocional como parte central del desarrollo. Esto apoya diseñar la experiencia por cambios de estado emocional; no demuestra una duración universal para las escenas. Para Ecos de Luz: curiosidad en Sakura, duda en Marea, indignación en Duna, duelo y alivio en Yoake, urgencia en el rescate, responsabilidad en Kiri y decisión en el faro. [GDC 2013](https://www.gdcvault.com/play/1017700/Designing).

**Kena: Bridge of Spirits.** Hunter Schmidt describe una biblioteca de expresiones y poses de manos para refinar y unificar la actuación. También explica que el desgaste de la ropa comunica experiencia. La lección es producir una actuación consistente con pocos recursos bien dirigidos. Para Hikari, cuya máscara limita la expresión facial, manos, inclinación y distancia entre personajes son recursos principales. [Artículo del director de animación](https://blog.playstation.com/2021/09/15/bringing-the-lead-character-of-kena-bridge-of-spirits-to-life/).

**Inferencia aplicable:** una escena de 25 segundos puede necesitar más cuidado que otra de dos minutos. Su brevedad solo ayuda si cada plano aclara quién actúa, sobre qué y con qué resultado. Cortar antes de que se lea el gesto empeora la comprensión.

### 2.3. Misiones secundarias: ayudar cambia una situación

**A Short Hike.** Adam Robinson-Yu explica que diseñó alrededor de la curiosidad y de la posibilidad de alejarse de la ruta obvia. Las actividades encontradas durante el paseo varían el recorrido. Su postmortem también documenta un alcance deliberadamente pequeño. Funciona porque un desvío ofrece una experiencia reconocible y vuelve a conectarse con el objetivo general. [Artículo del creador](https://blog.playstation.com/2021/08/05/crafting-a-tiny-open-world-a-look-behind-the-scenes-at-the-creation-of-a-short-hike/), [resumen del postmortem GDC](https://www.gdcvault.com/play/1026613/Independent-Games-Summit-Crafting-A).

**Spiritfarer.** Nicolas Guérin explica que el abrazo se convirtió en una forma mecánica de cuidar, y que personajes y despedidas exigieron iteración. La relación se construye haciendo algo para una persona concreta. Para Ecos de Luz, preparar té o repartir agua puede funcionar si vemos el cuidado y su efecto en la convivencia. El número de flores, por sí solo, no crea ese vínculo. [Entrevista al director creativo](https://www.gamedeveloper.com/design/inside-the-thoughtful-design-of-thunder-lotus-i-spiritfarer-i-).

**Kena.** El correo espiritual se devuelve a una casa y ayuda a restaurarla. Hay recogida y entrega, pero el destino tiene una consecuencia identificable. Esto muestra que el problema del recado está en su falta de significado o variación, no en transportar un objeto. [Descripción oficial de Spirit Mail y los Rot](https://www.playstation.com/en-au/games/kena-bridge-of-spirits/meet-the-rot-kena-bridge-of-spirits-cute-sidekick-creatures/).

**Regla propuesta:** una secundaria debe cambiar al menos uno de estos elementos: el lugar, una relación, una ruta o una forma de jugar. Si solo sube un contador, conviene tratarla como colección de fondo.

### 2.4. Recompensas: elección e identidad

| Juego | Qué se verificó | Por qué funciona y qué trasladar |
|---|---|---|
| **Ghost of Tsushima** | Sucker Punch describe la katana como un arma que acompaña a Jin durante su viaje. La guía oficial distingue ventajas del equipo, mejoras y tintes. | El jugador reconoce su herramienta y decide cómo vestir. Trasladar tres armas con funciones claras y apariencia elegible. No hacen falta docenas de hojas casi iguales. [Sucker Punch](https://blog.playstation.com/?p=329947), [guía oficial](https://www.playstation.com/en-us/editorial/ghost-of-tsushima-beginners-guide/). |
| **Hollow Knight** | La descripción de Team Cherry presenta los Charms como reliquias equipables con poderes, junto a nuevas habilidades de movimiento y un mundo interconectado. | Una recompensa puede cambiar una decisión, no solo aumentar daño. Trasladar pocos efectos distinguibles y espacios opcionales revisitables. [Descripción publicada por Team Cherry](https://store.steampowered.com/app/367520/Hollow_Knight/). |
| **Hades** | Supergiant relaciona combinaciones de poderes y desafíos con nuevos acontecimientos narrativos. Kasavin y Korb documentan su proceso de diálogo e iteración en GDC. | El progreso mecánico puede sostener encuentros con personajes. Trasladar comentarios que reconozcan hechos ya vividos, sin adoptar la repetición de muertes del roguelite. [FAQ del estudio](https://www.supergiantgames.com/blog/hades-faq/), [resumen de GDC](https://www.gdcvault.com/play/1026975/Breathing-Life-into-Greek-Myth). |
| **Sky: Children of the Light** | El centro de ayuda vincula recuerdos de espíritus con expresiones, cosméticos y otras recompensas. | Un aspecto o gesto puede recordar un encuentro. Trasladar esa asociación. La disponibilidad temporal descrita por Sky no es necesaria para una campaña cerrada. [Ayuda oficial](https://thatgamecompany.helpshift.com/hc/en/19-sky-pc-steam/faq/1211-what-are-traveling-spirits/?p=web). |

### 2.5. Poderes y accesos: libertad con reglas legibles

**Zelda: Breath of the Wild / Tears of the Kingdom.** En la entrevista de Nintendo sobre TotK, sus responsables relacionan la libertad con las experiencias del juego anterior. Explican también que objetos que no se pueden mover reciben señales visuales coherentes. El interés está en permitir soluciones propias y comunicar las restricciones. Para Ecos de Luz: dos maneras de alcanzar un desvío dentro de una región abierta; una sola explicación clara del Velo entre capítulos. No hace falta reproducir Ultrahand ni una simulación física general. [Nintendo, parte 5](https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-9-the-legend-of-zelda-tears-of-the-kingdom-part-5/).

**Hollow Knight** aporta el contraste: nuevas capacidades y mundo interconectado. **Ori** aporta movimiento trabajado como parte central del placer de jugar. La entrevista a Thomas Mahler atribuye ese resultado a iterar controles, animación, sonido y efectos en conjunto. La aplicación es ampliar verbos existentes y comprobar sus combinaciones. [Entrevista publicada por Moon Studios](https://www.orithegame.com/gamasutra-qa-designing-the-gorgeous-metroidvania-ori-and-the-will-of-the-wisps/).

### 2.6. Secretos y calidad percibida

**Ghost of Tsushima** orienta con viento, animales y señales del paisaje. La guía oficial también invita a experimentar con la flauta desde una buena vista. La curiosidad dispone de indicios reconocibles. Esto sirve para diseñar secretos que empiecen con una observación, sin exigir consultar una guía externa. [Guía oficial](https://www.playstation.com/en-us/editorial/ghost-of-tsushima-beginners-guide/).

**Hi-Fi Rush.** Su historia oral documenta la coordinación entre música, animaciones y ataques. La aplicación a Ecos de Luz es sincronizar el sonido con el gesto y el efecto. La referencia no exige convertir su combate en uno rítmico ni sustituir el koto y la flauta. [Entrevistas al equipo](https://news.xbox.com/en-us/2023/10/04/hi-fi-rush-exclusive-oral-history/).

**Conclusión:** el pulido se percibe en cadenas pequeñas: acción, gesto, sonido, reacción y consecuencia. Un sombrero nuevo aporta menos si al recogerlo la cámara atraviesa una pared o el aviso tapa una despedida.

## 3. Recomendaciones concretas para Ecos de Luz

### 3.1. Punto de partida verificado

Se leyeron `COORDINACION.md`, `CLAUDE.md`, `AGENTS.md`, `PLAN_FUSION.md`, `README.md`, `PERSONAJES.md`, el guion base, las siete entregas de capítulos y `js/68-secundarias.js`. Para comprobar cifras se consultaron también las fichas de sistemas, armas, movimiento, combate y progresión enemiga.

**Precedencia usada:** el guion base fija el canon; Coordinación, Plan de Fusión y README describen la producción vigente. Algunos encabezados antiguos de PERSONAJES y de las entregas siguen diciendo «pendiente» o «sin implementación». No se interpretan como estado actual: la campaña ya llega al epílogo. La Katana ya se obtiene en el capítulo 1.

| Dato existente | Implicación de diseño |
|---|---|
| 13 secundarias en `68-secundarias.js` | Mejorarlas antes de crear otro catálogo. Sus recompensas actuales se conservan hasta aprobar cambios. |
| Ocho murales con ocho capas ocultas, seis ecos y diez espíritus del viento | Ya hay suficientes colecciones para una campaña breve. Reorganizar su significado y presentación. |
| Naginata tras `manada → oso`, desde el capítulo 6 | Gran parte de la campaña puede jugarse con una sola arma adquirida. |
| Odachi definida, sin vía vigente de obtención según README | No anunciarla como recompensa existente ni recuperar la forja retirada. |
| Andar 2,4 m/s; correr 4,2 m/s; planeo 8,8 m/s | Resolver trayectos repetidos con rutas y atajos antes de acelerar toda la locomoción. |
| Luz máxima base: 100 + 8 por nivel posterior al primero, antes del manto | Expresar costes de poderes en unidades de luz, no en motas. |
| Pulso: coste 30, radio 14 m, espera configurada 6 s; parada: ventana 0,20 s y devolución 12 de luz | Una mejora nueva debe considerar retornos de luz ya disponibles. Verificar el tiempo real de reutilización del pulso al integrar. |
| Planeo: 10 de luz/s, o 6 con mejora de nivel; altar de capa reduce más el gasto | Una capacidad de recorrido puede trivializar distancias al combinarse con mejoras. |
| Altares: capa y vida cuestan 40/90/160 motas; manto 60/120/200 | Las recompensas nuevas no pueden ignorar esta economía. |

En `ITEMS.katana` permanece la descripción absoluta «no seres vivos». Conviene revisarla por la muerte dirigida de Tasogare. Es una observación editorial; aquí no se modifica.

### 3.2. Campaña de 7–8 horas: medir antes de alargar · dificultad baja de diseño, media de ajuste

Las entregas usan 26 minutos de piloto, 40 de capítulo 1, 55 de capítulos 2, 3, 5 y 6, y 65 de capítulos 4 y 7. **Suman 416 minutos: 6 h 56 min.** El guion base propone 435 minutos: 7 h 15 min. Ambas cifras son presupuestos sin validación con personas.

Probar un presupuesto revisado de **435 minutos de ruta principal**, con lectura normal y exploración necesaria. El jugador rápido podrá tardar menos. Dos o tres secundarias breves pueden llevar una partida normal cerca de ocho horas; completar todas puede superarlas. No prometer ocho horas al 100 %.

| Capítulo | Presupuesto de prueba | Función y mejora concreta | Dificultad |
|---|---:|---|---|
| 0 · Despertar | 30 min | Mantener el prólogo de 110 s. Dar 2 oportunidades de observar la relación faro–registro sin repetir una explicación completa. Comprobar que se entiende por qué investigar a Nao. | Baja |
| 1 · Pétalo | 45 min | Las 3 semillas exigen observar, elegir cobertura y abrir un paso; no tres recogidas idénticas. Tras la primera Katana, ofrecer 45–60 s de práctica voluntaria. La memoria mantiene 20–30 s y aporta una percepción propia. | Media |
| 2 · Marea | 55 min | Separar visualmente las 5 perlas comunes y la Perla de Marea. Agrupar las comunes en 3 situaciones de inmersión: 2+2+1. La gruta conserva su revelación de Sayo y el conejo puntual. | Media |
| 3 · Duna | 55 min | Distribuir los 3 atriles para comparar signos y protocolo, con cámara libre al leer. Dividir la exposición en 3 bloques de 4–6 líneas, con acción de comparar entre ellos. Conservar los 6 orbes y sus 100 s de partida; ensayar asistencia de 130 s tras 2 fallos. | Baja / media |
| 4 · Yoake | 65 min | Conservar 2 tareas útiles: agua y señal. Que cada una muestre su resultado en 2–4 s y admita observarlo después. Reservar 2–3 min de exploración tranquila tras la recepción, sin espera forzada ni avisos de recompensa. | Media |
| 5 · Rescate | 55 min | Llevar las 3 piedras al corredor de avance; desplazamiento añadido por cada una ≤20 s. Preparar extractor y cierre con el documento existente. Tras el duelo, silencio y cuidado; sin botín sobre Tasogare. | Baja / media |
| 6 · Kiri | 60 min | Separar identidad y traición con 3–5 min de ascenso y contraste del registro. La emboscada debe recordar la ruta acordada a solas. Dar utilidad distinta a la cima secundaria, pues alcanzarla ya es obligatorio. | Media |
| 7 · Faro y epílogo | 70 min | Mantener evacuación y tres etapas. Ensayar jefe de 10–12 min en intento victorioso, frente a los 18 min presupuestados en la entrega, y dedicar el margen al recorrido con consecuencias. Epílogo jugable: 12–15 min. | Media / alta |
| **Total** | **435 min** | **Objetivo editorial, pendiente de prueba completa.** | — |

Los minutos extra respecto a 416 no justifican nuevas esperas. Si la campaña resulta satisfactoria en 400–420 minutos, conservar ese ritmo. Solo ampliar donde la prueba encuentre una falta concreta de desarrollo.

**Cadencia propuesta:** una variación significativa cada 6–9 min; un tramo de recuperación de 60–120 s tras un encuentro importante; entre 2 y 4 min de control continuo entre conversaciones que no necesiten enlazarse. No aplicar estos intervalos como temporizadores automáticos.

**Desplazamiento:** un tramo de 126 m equivale a 30 s corriendo a 4,2 m/s, sin obstáculos. Usar 80–125 m como referencia inicial entre un desvío y su retorno. Si una entrega obliga a repetir más de 250 m de camino ya resuelto, cerrar a distancia mediante el diario o abrir un atajo que reduzca el retorno al menos un 50 %. Dificultad baja si se usan activadores existentes; media si cambia la obra.

### 3.3. Cinemáticas y comprensión · dificultad baja / media

| Recomendación | Números iniciales | Dificultad |
|---|---|---|
| Mostrar causa y consecuencia en el mismo eje visual | 1 plano conjunto antes del detalle. Mantener el resultado 1,5–2 s antes de cortar. | Baja |
| Limitar escenas de transición | 12–25 s; 2–4 planos. Excepciones justificadas: prólogo, pérdida, rescate, traición y final. | Baja |
| Preservar escenas mayores | 45–90 s como revisión inicial, además del prólogo existente de 110 s. Los diálogos manuales tienen duración libre. | Media |
| Leer sin perder el gesto | Una frase de 8–16 palabras cuando sea posible; mínimo visible de palabras/2,5 + 1 s, ampliable por el jugador. | Baja |
| Actuar antes de hablar | Preparación de 0,3–0,6 s; reacción de 0,8–1,2 s; pausa emocional de 2–3 s en momentos señalados. | Baja |
| Reutilizar actuación consistente | Biblioteca inicial de 8 gestos: señalar, ofrecer, guardar, retroceder, sostener, sentarse, tender mano y bajar arma. Transiciones de 0,15–0,30 s. | Media |
| Ceder la cámara tras mostrar un destino | Foco de 1,5–2,5 s; entrada/salida de 0,35–0,50 s; devolución anticipada al mover la cámara. | Media |
| Retomar tras omitir | Resumen consultable de 2 frases y objetivo actualizado; presentación inicial de hasta 6 s, cerrable. Ningún combate se resuelve por omitir. | Media |
| Separar emoción y recompensa | Bloquear rótulos de botín durante las escenas; tras Tsuru o Tasogare, mantenerlos en cola al menos 20 s de juego seguro. | Baja / media |

En las memorias, cada repetición del rito necesita un dato nuevo: percepción en Pétalo, contraste con el eco en Marea, corte del hilo en Duna y padre/continuidad en Kiri. Evitar añadir tomas que revelen esa última información antes de tiempo.

**Ejemplo de montaje, sin diálogo nuevo:**

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| INV03-SAY01 | Hikari y figura de Sayo | Sin texto nuevo; conservar guion C2GR | 2 s antes de cubrir el emisor | Ambas siluetas y borde del haz visibles en un plano conjunto. |
| INV03-SAY02 | Hikari | Conservar C2GR06 | Al confirmar {interactuar} | Mano cierra el postigo; sonido acompaña el contacto. |
| INV03-SAY03 | Sayo | Conservar C2SA01 | 2 s después del cierre | Mantiene postura y posición. La deformación desaparece en 0,6–0,9 s. |
| INV03-SAY04 | Hikari | Conservar C2SA02 | Tras identificarla | Baja las manos antes de avanzar el texto. |

Las condiciones de pausa, omisión y carga deben producir el mismo estado narrativo. El problema de temporizadores mencionado en Coordinación debe verificarse antes de ampliar el montaje. No se da por corregido por esta investigación.

### 3.4. Revisión de las 13 secundarias

**Propuesta de alcance:** conservar los 13 identificadores. Convertir 7 en situaciones breves y presentar 6 como recorridos o colecciones de fondo. Los textos y las recompensas actuales son la base de migración; las tablas siguientes proponen cambios para revisión de Claude.

| ID y problema actual | Propuesta concreta | Recompensa y efecto perceptible | Tiempo / dificultad |
|---|---|---|---|
| `chispas`: reunir 6 y regresar | Las mismas 6 chispas forman una ruta de aprendizaje con 2 desvíos. Cierre automático al recoger la sexta; comentario de Yuki en la siguiente visita. | Conservar 50 XP y 1 esencia. Mostrar el punto de luz cercano y la mejora de altar que se puede comprar; sin moneda adicional. | 3–4 min; baja |
| `amigos`: acariciar 3 veces | Exigir 3 individuos distintos, con identificador persistente. Aproximación tranquila de 2–3 s; la misión no exige provocar a ninguno. | Conservar Manto de Sakura. Una animación de confianza de 2 s y un animal que permanece cerca al cerrar. | 4–6 min; media |
| `te`: recoger 5 flores y entregar | Conservar 5 flores agrupadas en 2 parches locales. Añadir preparar y compartir té como una interacción de 4–6 s. Momo conserva la herencia tras Tsuru. | Conservar las 3 tazas. El banco queda como lugar de descanso, sin regeneración adicional al sistema existente. | 3–5 min; media |
| `murales`: leer 8 y volver | Mantener 8, con pares locales que permitan comparar. Mostrar progreso parcial sin exigir otra entrega por pareja. Cierre completo con Momo cuando esté disponible. | Conservar Máscara de kitsune. Cada pareja añade una comparación visual de hasta 30 palabras, basada en textos ya existentes. | Colección de fondo; media |
| `callan`: repetir los 8 con farol | Guardar desde la primera visita la ubicación de cada mural. Con el farol, revisar su capa en el mismo panel del diario; visitar físicamente sigue siendo necesario para revelarla. | Conservar recompensa. Las 8 capas se consultan juntas; no añaden una novena revelación imprescindible. | Desvíos de 30–90 s; media |
| `ecos`: encontrar 6 y regresar | Registrar por identidad única y ofrecer una nota de contraste al descubrir 2, 4 y 6. Ningún premio requiere oír de nuevo un eco completo. | Conservar 240 XP y 2 esencias al cierre. El diario distingue observación, inferencia y hecho confirmado. | Colección de fondo; baja / media |
| `viento`: alcanzar 10 | Mantener 10 distribuidos en 3 circuitos, de 3+3+4. Progreso de circuito visible; sin reinicio por caída. | Conservar Manto Solar. Cada circuito termina en una vista o un atajo; el tercero no regala vuelo ilimitado. | 3–5 min por circuito; media |
| `jabali`: provocar y calmar | Ofrecer desviar a Colmillo hacia un espacio de cosecha apartado usando 2 señales del entorno. Mantener la resolución de calma existente como alternativa. | Conservar 3 onigiris. Su ruta deja de atravesar el bancal; no vuelve a exigirse el mismo encuentro. | 4–6 min; alta por IA y alternativa nueva |
| `gruta`: recoger 5 luces | Mantener 5 como observación de fondo; sin bloquear a Sayo. Colocarlas en 3 rincones visibles desde el camino, sin seguir al conejo espiritual. | Conservar 180 XP y 1 esencia. Una vista breve de la gruta es el cierre. | 2–3 min añadidos a la visita; baja |
| `pescador`: buscar caña y volver | Conservar el objeto y su origen conocido. La orilla muestra 2 pistas espaciales y permite elegir un camino seco o una inmersión corta. | Conservar Manto de Marea. Kaito vuelve a usar la caña con un gesto de 2–3 s; sin inventar que perteneció a Rui. | 4–6 min; media |
| `kiri`: subir donde la principal ya obliga | Reconocer automáticamente la cima obligatoria. La parte opcional pasa a 2 apoyos laterales de observación, sin otro registro crucial. | Conservar 280 XP y 2 esencias al concluir el recorrido opcional. Si no se aprueba ampliarlo, cerrar al subir en la principal. | 3–4 min opcionales; media |
| `manada`: calmar 3 lobos | Reconocer individuos únicos. Crear un corredor alternativo de observación que permita dejar pasar la manada sin golpearla. | Propuesta: mismo premio por despejar la ruta con cualquiera de las dos soluciones. Una sola concesión. | 4–6 min; alta por conducta alternativa |
| `oso`: otro combate animal, al final | Presentar distancia y avisos antes de acercarse. Si se aprueba alternativa pacífica, retirar 2 obstáculos del entorno desde zonas seguras y dejar una salida al oso. | Mantener Manto de Escarcha; la adquisición de Naginata se trata aparte. Nunca botín desde el cuerpo del animal. | 5–7 min; alta por solución nueva |

La programación actual usa eventos de calma y ataque para la fauna defensiva. Las alternativas pacíficas de las tres últimas situaciones animales **requieren diseño e implementación nuevos**. No basta con cambiar sus frases. Priorizar primero `te`, `pescador`, `amigos` y el cierre de `kiri`, que aportan variedad con menos riesgo.

**Reglas comunes · dificultad media:** oferta de hasta 2 frases; 2–3 pasos relevantes; un resultado visible; hasta 3 secundarias seguidas simultáneamente en el HUD. Las colecciones siguen disponibles en el diario. Aceptación y cierre pueden ocurrir fuera de orden; el estado real debe reconciliar los eventos. Las tareas de Momo esperan durante su captura y señalan su destino vigente en Yoake después del rescate.

### 3.5. Recompensas, armas y objetos

#### Economía que se pueda leer · dificultad baja / media

Mantener **motas como única moneda**. La luz del medidor es energía de uso; la experiencia conserva su función actual; ninguna es una segunda cartera de compra. No añadir rarezas, afijos aleatorios ni fabricación con diez materiales nuevos.

Probar estas referencias de recompensa, **sustituyendo** pagos equivalentes cuando corresponda, sin sumarlas automáticamente a los actuales:

| Actividad | Pago propuesto | Regla |
|---|---:|---|
| Desvío breve de 2–3 min sin objeto único | 10 motas | Una sola vez por identificador. |
| Situación secundaria de 4–7 min | 20 motas **o** 1 cosmético / efecto único | Mostrar qué recibe antes de aceptar; evitar pagar todas las categorías juntas. |
| Circuito de movimiento de 3–5 min | 15 motas | Sin premio por reiniciar el mismo circuito. |
| Cadena de dos situaciones con cierre propio | 30 motas **o** 1 técnica | Técnicas opcionales no abren la única ruta de historia. |

Ejemplo: una chispa ya concede 5 motas. Seis dan 30; no añadir otras 30 a `chispas` sin medir. Primera mejora de capa: 40 motas. Segunda: 90. Con 3 secundarias de 20 y 6 chispas se obtienen 90 motas antes de otros ingresos; alcanza para la primera mejora y deja 50, no para comprar ambas. Usar esta cuenta para ajustar el ritmo, sin suponer que todas las chispas generadas son accesibles.

Objetivo de prueba: permitir **una primera compra de 40 motas durante el capítulo 1** con exploración normal; una segunda decisión de compra al terminar el 2 o empezar el 3. Registrar ingresos, compras y pérdidas reales. Los tres árboles de altar completos cuestan actualmente 960 motas en total; no exigir completarlos para vencer a la Luna.

#### Tres armas con una razón para elegirlas

| Arma | Estado existente | Recomendación numérica para prototipo | Obtención propuesta / dificultad |
|---|---|---|---|
| Katana del Alba | Capítulo 1; daño 10, alcance 2,7 m, velocidad 1. | Conservar base. Enseñar su primer ataque, defensa y contraataque en práctica de 45–60 s. No dar otra katana de mayor rareza que la invalide. | Mantener recogida del Mirador en C1; baja. |
| Naginata de Escarcha | `oso`, C6; daño 14, alcance 3,5 m, velocidad 0,85. | Ensayar daño 12, alcance 3,5 m y velocidad 0,85 si se adelanta. Identidad: distancia y barrido; primera práctica con 2 blancos separados 3 m. | **Candidata:** obtenerla al terminar C2 y ofrecer mejora visual en Kuma. Cambia la distribución vigente y necesita aprobar quién la entrega y por qué. Media. |
| Odachi Solar | Definida: daño 19, alcance 3,2 m, velocidad 0,7; obtención vigente ausente. | Ensayar daño 17, alcance 3,2 m, velocidad 0,7; recuperación mínima de golpe pesado 0,70 s. Comparar contra la ruptura de equilibrio de las otras dos. | **Candidata:** desafío opcional de 5–7 min en Duna, disponible desde C3. Procedencia por decidir. No recuperar la forja de Taiyō. Media / alta. |

Estos cambios no garantizan equilibrio por sí solos. Los combos, multiplicadores y pausas ya difieren. Comparar daño efectivo, alcance y ruptura de equilibrio durante 30 s contra los mismos blancos y con el mismo nivel. Objetivo inicial: ninguna arma debe aventajar a las otras más de un 15 % en daño sostenido contra todos los tipos a la vez. Las diferencias situacionales sí deben ser mayores.

`57-progresion-enemiga.js` ya pondera equipo y asigna valores diferentes a Katana, Naginata y Odachi. Adelantar una adquisición puede aumentar la potencia capturada del siguiente encuentro. Medir el cambio de dificultad y revisar esa ponderación; el premio no debe sentirse como una subida automática de resistencia enemiga que lo anule.

**Pregunta para el usuario:** ¿se autoriza adelantar la Naginata a C2 y habilitar la Odachi en C3? La procedencia y la persona que las entrega no están establecidas en el canon. Hasta resolverlo, mantener las vías actuales y tratar ambos cambios como alternativas de investigación. No presentar una historia nueva de esas armas como hecho.

#### Objetos útiles, recuerdos y colecciones · dificultad baja / media

| Categoría | Cantidad y comportamiento propuestos | Motivo |
|---|---|---|
| Consumibles | Conservar té: 45 de vida; onigiri: 30 de vida +25 de luz; esencia: 80 de luz. Mostrar cantidad recuperable antes de usar. Probar 3 espacios de acceso rápido. | Ya cubren salud, mezcla y energía. Añadir diez variantes hace más trabajo de interfaz que decisiones. |
| Objetos de misión | Agrupar copias y pruebas en el diario, con registro de adquisición y último uso; máximo 2 objetos de misión pendientes destacados. | Separar lo que explica la historia de lo que se equipa o consume. |
| Recuerdos sin estadísticas | 1 entrada significativa por capítulo, reutilizando documentos y testimonios existentes. Texto de 25–45 palabras. | No crear otra colección de siete objetos físicos. |
| Colecciones | Conservar las cantidades actuales: 8 murales, 8 capas, 6 ecos y 10 espíritus. | Darles contexto y hitos intermedios antes de aumentar su número. |
| Premio mayor | 1 capacidad, pieza de equipo, aspecto o cambio persistente cada 25–40 min como objetivo de distribución. | Variar el premio. Un fragmento y una región restaurada ya cuentan. |

El Farol de Tsuru es un legado y una herramienta de lectura. No contiene su conciencia, no habla sobre hechos posteriores a su muerte y no funciona como emisor lunar. El lazo de Momo conserva su función de pista. Evitar convertir estos objetos en materiales vendibles o consumibles.

### 3.6. Vestuario y personalización

**Primera mejora, dificultad baja:** mantener los seis mantos existentes y permitir verlos con iluminación de día y noche en el Zurrón. Vista giratoria a 30 grados/s; transición entre apariencias de 0,25 s. Mostrar efecto actual y diferencia antes de equipar.

**Segunda mejora, dificultad media:** separar **aspecto del manto** y **efecto del manto**. Se conserva un efecto activo; elegir apariencia no suma otro. Los niveles del altar mejoran ese único efecto como ahora. Migración: al cargar, el manto equipado determina ambas selecciones iniciales.

| Apariencia existente | Reconocimiento visual propuesto | Entrega / dificultad |
|---|---|---|
| Alba | Conservar carmesí, ámbar y oro. Silueta de referencia. | Desde el inicio; baja. |
| Sakura | Borde con tres formas de pétalo y rosa suave; identidad visible a 5 m. | `amigos`; media visual. |
| Marea | Dos bandas de oleaje y ribete azul verdoso. | `pescador`; baja / media. |
| Escarcha | Motivo geométrico de cristal en el bajo; mantener señales de llamas legibles. | `oso`; media visual. |
| Solar | Ribete dorado que se distingue del Alba por patrón, además del color. El nombre no atribuye una forja nueva. | `viento`; baja / media. |
| Guardián | Cinco pequeñas marcas por los guardianes purificados, usando hechos de progreso existentes. | Purificar a los cinco; media. |

**Límite de producción:** 6 aspectos, 2 patrones por aspecto como máximo y 1 adorno opcional activo. No desplegar de inicio un editor de prendas por piezas. Preservar máscara, ojos, capucha y tres llamas de Hikari. La Máscara de kitsune no debe ocultar la información de identidad o de estado necesaria en una escena.

Los diseños nuevos son **propuestas visuales**, no antigüedades canónicas ni insignias de familias inventadas. Usar geometría y paletas procedurales, materiales compartidos y patrones legibles. Cambiar la silueta o el esqueleto eleva la dificultad a alta.

### 3.7. Poderes nuevos integrados con los estilos existentes

Proponer extensiones aprendidas del uso de energía ambiental. No inventar deidades, linajes o un quinto fragmento para justificarlas. Sus nombres son etiquetas de diseño. Cualquier explicación argumental nueva se marca como **Pregunta para el usuario**.

| Poder candidato | Desbloqueo y cifras iniciales | Uso en exploración y combate | Dificultad |
|---|---|---|---|
| **Pulso de lectura** | Tras Pétalo, si el pulso ya está disponible. Ampliación del mismo {pulso}: coste total 30, espera objetivo 6 s; marcas de interacción a 8 m durante 6 s. | Revela indicios ya presentes, sin resolverlos. En pelea conserva el pulso actual; no duplica daño ni devolución. Favorece acercarse con Katana. | Media |
| **Haz que sostiene** | Tras Marea. Mantener {haz} 1 s sobre un receptor; coste adicional de activación 8 de luz, una vez por apertura. El apoyo queda activo 6 s tras soltar. | Permite apagar el haz y golpear con Naginata o Katana. Solo receptores señalizados, nunca cualquier superficie. El apoyo ocupado no caduca bajo los pies. | Alta |
| **Planeo impulsado** | Tras Duna. Una activación por vuelo al volver a pulsar {saltar} tras soltarlo: 15 de luz, 0,35 s a 12 m/s y subida máxima de 0,8 m. | Gana aproximadamente 1,1 m horizontal frente a seguir a 8,8 m/s durante ese lapso. Sirve para un desvío corto o reposicionarse; no da invulnerabilidad ni daño. | Alta |
| **Canalización de resguardo** | Antes del ascenso final, mediante aprendizaje explícito propuesto. Mantener {interactuar} 1,2 s en un punto designado, coste 20 de luz; área de 2,5 m durante 5 s, espera 12 s. | Activa cobertura local contra un tipo de proyectil señalado. Deja una oportunidad para una Odachi lenta si está obtenida. No bloquea golpes físicos, no cura y no sustituye evacuar. | Alta |

**Alcance recomendado:** producir primero Pulso de lectura. Después ensayar Haz que sostiene en una sala. Los otros dos son ampliaciones opcionales; no forman un paquete que deba implementarse entero.

**Prueba de presupuesto:** con 100 de luz, 4 s de planeo sin mejoras cuestan 40. Un impulso cuesta 15 y un pulso 30. Quedan 15, sin contar regeneración ni otros gastos. Ese recorrido necesita un descanso seguro antes de exigir otra activación. Probar siempre con el medidor base y sin consumibles. Un salto obligatorio no puede necesitar una esencia opcional.

**Reciprocidad en combate:** mantener la ventana de parada existente de 0,20 s. Si se añade una técnica posterior a la parada, usar una ventana de activación de 1,0 s dentro del contraataque existente; no añadir otra devolución de luz sobre sus 12 unidades sin medir. Propuesta inicial de efectos por arma: Katana conserva respuesta rápida, Naginata gana espacio con su barrido y Odachi explota equilibrio roto. Ninguna añade daño a aldeanos ni elimina las reglas de calma de la fauna.

**Mapa de accesos propuesto, dificultad media para contenido y alta para capacidades nuevas:**

| Capacidad | Acceso de prueba | Retorno |
|---|---|---|
| Pulso de lectura | 1 nicho opcional en Sakura, visible antes de obtenerla; recorrido de 30–45 s. | Vuelve al sendero existente. Guarda una comparación de signos ya conocidos, sin otra revelación. |
| Haz que sostiene | 1 paso de apoyos en Marea, primero sobre suelo seguro; circuito de 45–75 s. | Atajo local y 15 motas una sola vez. |
| Planeo impulsado | 1 cornisa de Duna con aterrizaje amplio; prueba de 30–60 s. | Vista y regreso caminable. No abre Kiri anticipadamente. |
| Farol de Tsuru, existente | Capas ocultas de murales en regiones ya abiertas. | Relectura con significado; nunca exige el farol antes de C4. |

Las capacidades abren **bolsas dentro de regiones abiertas**. El Velo conserva su función de frontera narrativa. Conservar una ruta principal realizable con las herramientas garantizadas; no crear una cadena de bloqueos con poderes opcionales. Tras reducirse Lumi a luciérnaga, diario, mapa y herramientas de Hikari siguen funcionando sin atribuirle facultades nuevas.

### 3.8. Easter eggs ligados al canon

Son propuestas de puesta en escena y descubrimiento. No añaden biografías ni poderes. Las pistas obligatorias del argumento siguen en su ruta normal. Empezar con los tres primeros.

| Idea | Activación y resultado | Límite de canon / dificultad |
|---|---|---|
| **El disco completo** | En C1, una alineación de cámara desde el sendero junta las partes ya visibles del mural y su conejo. 2 s de encuadre claro; sin botón ni premio de estadísticas. | Reutiliza el signo decidido. No muestra al conejo espiritual fuera de sus apariciones. Baja / media. |
| **La ruta que aprendiste** | En el epílogo, mirar desde el mirador de Yoake sitúa señal, canal de entrada y faro en un mismo eje. Tras 3 s, guardar una estampa del diario, sin interrumpir el control. | La recompensa es reconocer el trayecto. No invoca otro astro. Baja. |
| **Lumi, a su nueva escala** | Después de terminar el epílogo, quedarse 4 s junto a una planta permite que la luciérnaga se pose durante 3 s. Sin interacción obligatoria. | Solo un gesto físico. No habla ni recupera la red. Media. |
| **Los dos horizontes** | En una segunda visita al mirador de Yoake, el diario permite comparar la vista de C4 con la del epílogo. 2 imágenes esquemáticas procedurales. | Recuerda el Velo abierto y la victoria definitiva. Media. |
| **El farol y los signos** | Tras revelar una capa oculta, acercar su imagen a la copia del sello en el diario alinea la grieta ya documentada. Un destello suave de 0,4 s confirma la coincidencia. | No hay mensaje nuevo de Tsuru ni otra octava clave. Media. |
| **El mundo después del guardián** | Volver a una arena purificada permite observar 1 gesto tranquilo del gólem, de 4–6 s, y escuchar su ambiente sin música de jefe. | El guardián sigue vivo. No concede su núcleo ni reactiva una pelea. Media. |

No usar secuencias de teclas secretas, fechas reales ni esperar diez minutos. No exigir descubrir todos los secretos para entender o terminar la historia. Si se desea un homenaje externo, **Pregunta para el usuario:** qué obra se autoriza a citar y con qué diseño propio. No introducir personajes de otras franquicias por iniciativa de esta investigación.

### 3.9. Pulido y calidad percibida

| Área | Objetivo concreto de prueba | Dificultad |
|---|---|---|
| Respuesta a recogida | Primer cambio visual dentro de 100 ms tras la confirmación lógica; sonido ligado al mismo evento. Rótulo de 1,8–2,5 s, en cola si hay lectura. | Baja / media |
| Sonido de acción | Alinear contacto visible y efecto dentro de ±50 ms en una captura. Medir salida real; no confundirlo con prometer latencia de todo el equipo. | Media |
| Pasos y tela | Pasos al apoyar; 2–3 variaciones por superficie con volumen coherente. Ropa responde al movimiento sin ocultar el golpe. | Media |
| Cámara narrativa | No atravesar paredes en 10 posiciones de entrada distintas por escena. Después de la devolución, mantener orientación compatible con la salida. | Media |
| Impactos | Conservar pausas existentes por peso de 25/45/70 ms como referencia. No prolongarlas automáticamente por cada arma nueva. Sacudida ajustable hasta cero. | Baja / media |
| Sonido ambiental | Fundidos iniciales de 1,5–3 s entre estados; mantener ambiente bajo conversación. Evitar cortes de cola y fanfarrias en pérdidas. | Baja / media |
| Recogida de arma | Presentación opcional de 3–5 s, explicación de 1 función y acceso inmediato a prueba. Nada de bloquear 20 s por una variante de color. | Baja |
| Rendimiento | Objetivo del proyecto: 60 FPS, 16,7 ms por fotograma. Comparar A/B enchufado y mirar percentiles y tirones, además de medias. Probar alta, media y baja. | Media |
| Arte de recompensas | No crear un shader distinto por manto. Precargar variantes; objetivo inicial de ≤2 llamadas de dibujo adicionales por adorno activo y cero compilaciones al equipar. | Media |

La entrevista de Ori respalda trabajar conjuntamente controles, sonido, animación y efectos; las tolerancias anteriores son propuestas propias. [Fuente](https://www.orithegame.com/gamasutra-qa-designing-the-gorgeous-metroidvania-ori-and-the-will-of-the-wisps/).

### 3.10. Cómo validar estas propuestas · dificultad media

Realizar una primera ronda con **5 personas que no hayan leído el guion**, y una segunda tras corregir problemas. Es una muestra formativa, no una prueba estadística de toda la audiencia.

| Pregunta de prueba | Criterio inicial |
|---|---|
| ¿Qué se intenta averiguar y por qué? | Al menos 4 de 5 personas lo explican al terminar el capítulo 1. |
| ¿Sayo cambió o cambió lo que se veía? | Al menos 4 de 5 identifican al emisor como causa, sin ayuda. |
| ¿Cuántas Lunas hay y qué hizo Tasogare? | Al menos 4 de 5 distinguen a las dos entidades y su complicidad después de Duna. |
| ¿Cuándo decide Lumi informar y cuándo la controlan? | Al menos 4 de 5 separan ambas fases al terminar Kiri. |
| ¿Por qué se obtuvo esa recompensa? | Al menos 4 de 5 relacionan un manto con su misión al volver a verlo 20 min después. |
| ¿El equipo ofrece elección? | En pruebas equivalentes, al menos 2 armas se prefieren por razones distintas. Registrar también problemas de control. |
| ¿La campaña dura lo previsto? | Medir desde nueva partida hasta créditos: juego, lectura, pausas externas, navegación, reintentos y secundarias por separado. |
| ¿El desvío merece la pena? | Preguntar tras 3 secundarias diferentes; si 3 de 5 describen una como «solo recoger», revisar sus acciones y cierre. |

No interrogar a mitad de una escena emocional. Las preguntas se hacen al cerrar el tramo. No introducir cuestionarios de comprensión en la interfaz por esta investigación.

## 4. Lista ordenada de menor a mayor dificultad

El orden expresa esfuerzo y riesgo aproximados. Dentro de cada nivel, favorece reaprovechar contenido. Una dependencia puede adelantar una tarea más difícil: la persistencia y la pausa van antes de estrenar poderes.

| Orden | Trabajo | Dificultad | Dependencia y criterio de cierre |
|---:|---|---|---|
| 1 | Revisar descripciones contradictorias y recompensas anunciadas | Baja | Katana compatible con excepción de Tasogare; Odachi identificada como no obtenible hasta aprobar vía. |
| 2 | Cambiar presentación de colecciones y cerrar `chispas` al completar | Baja | No cambiar cantidades ni duplicar premios previos. |
| 3 | Reordenar avisos y respetar silencios de pérdida | Baja | Una cola legible; ningún rótulo sobre una escena crucial. |
| 4 | Ajustar duración de planos y conservar causa–resultado | Baja | Prueba de comprensión antes de ampliar escenas. |
| 5 | Añadir los secretos de composición del mural y el mirador | Baja / media | Sin información esencial nueva ni objeto obligatorio. |
| 6 | Previsualizar mantos y explicar recompensas | Baja / media | Los 6 se distinguen a 5 m y sus efectos se entienden. |
| 7 | Mejorar té y caña de Kaito | Media | Resultado visible, 3–6 min, sin inventar parentescos ni propiedad de Rui. |
| 8 | Resolver redundancia de cima y duplicados de individuos | Media | Principal y secundaria coherentes; no contar al mismo animal 3 veces. |
| 9 | Ajustar economía y calendario de adquisiciones | Media | Registrar ingresos; probar compras de 40/90 motas y potencia enemiga. Armas sujetas a decisión de origen. |
| 10 | Separar apariencia y efecto del manto | Media | Un solo efecto activo y migración de guardado probada. |
| 11 | Biblioteca de gestos y cámara consistente | Media | Ocho gestos y escenas revisadas desde diez entradas. Verificar pausa y omisión. |
| 12 | Pulso de lectura y un nicho de prueba | Media | Coste único, indicios legibles y ninguna revelación fuera de orden. |
| 13 | Revisión de ritmo con campaña completa | Media | Dos rondas de observación; duración registrada sin sumar pausas externas. |
| 14 | Alternativas pacíficas para Colmillo, manada y Kuma | Alta | Conductas fiables, rutas válidas y mismo premio sin repetición. |
| 15 | Haz que sostiene y receptores persistentes | Alta | Guardado, colisiones, ocupación y apertura probados antes de usarlo en la espiral. |
| 16 | Planeo impulsado y bolsas de acceso | Alta | Sin atravesar el Velo ni invalidar rutas y cámaras existentes. |
| 17 | Canalización de resguardo y revisión de encuentros | Alta | No trivializa proyectiles ni exige arma opcional. |
| 18 | Ropa con siluetas nuevas o personalización por piezas | Alta | Solo tras validar la separación de aspecto y efecto; coste en animación y rendimiento medido. |

**Primer bloque recomendado a Claude:** puntos 1–4, más `te` y `pescador` como dos muestras. **Segundo bloque:** economía, presentación del equipo y separación de apariencia. **Tercero:** un poder y una sala de prueba. Cada bloque necesita valoración del usuario antes de ampliarse, según el flujo del proyecto.

## 5. Riesgos y qué evitar

| Riesgo | Qué evitar / medida concreta |
|---|---|
| Alterar el canon al añadir contenido | No crear otro origen de la Luna, otro padre, un quinto fragmento o una resurrección. La Dorada se libera después de la victoria física. |
| Cambiar el orden de revelaciones | No confirmar Hikari/Akari antes del duelo mediante texto de objeto, cosmético, nombre de técnica o secreto. Mantener sospecha y confirmación separadas. |
| Convertir duelo en recompensa | No colocar arma, experiencia celebrada o logro sobre la desaparición de Tsuru o Tasogare. Separar progresión de la escena de pérdida. |
| Blanquear responsabilidades | El amor de Tasogare no cancela su complicidad. La posesión de Lumi no explica retroactivamente su espionaje voluntario. |
| Confundir energía con vida | Gastar 30 de luz no consume un núcleo personal. No describir el medidor como almas de víctimas ni hacer intercambiables luz y motas. |
| Reforzar provocar animales para cobrar | No usar trofeos extraídos, raciones presentadas como carne del animal ni premios repetibles por calmarlo. Las rutas pacíficas propuestas necesitan conducta real. |
| Rellenar siete horas con cuotas | No aumentar semillas, perlas u orbes para cuadrar un presupuesto. Una campaña más corta y comprensible merece conservar su ritmo. |
| Explosión de sistemas | No añadir a la vez cuatro poderes, veinte atuendos, artesanía, rarezas y otro mapa. Prototipar uno con una situación de uso. |
| Retroceso obligatorio por todas las regiones | No exigir releer ocho murales solo para desbloquear el final. Las colecciones son opcionales y conservan lo descubierto. |
| Bloqueos por experiencia | Doble salto, pulso y golpe cargado dependen hoy del nivel. Si una situación principal exige uno, garantizar su disponibilidad o mantener solución alternativa. |
| Recompensa anulada por escalado | No subir automáticamente la resistencia de todos los enemigos al dar una arma. Revisar la captura regional de potencia y su percepción. |
| Cosmético que oculta información | No tapar ojos, grieta, llamas o anticipaciones con adornos y partículas. Validar contra nieve, cielo rojo e interiores oscuros. |
| Economía rota por nuevos premios | No sumar pagos a todos los eventos existentes. Migrar una sola vez; probar partida nueva y cargada con premios ya recibidos. |
| Estado incoherente al omitir o cargar | No duplicar farol, armas, muertes, liberaciones o motas. Una recompensa importante y su marca de concesión deben persistir juntas. |
| Secretos que contradicen límites | No convertir el conejo en compañero permanente ni a Lumi final en guía de red. No hacer que Tsuru responda después de morir. |
| Presentación ajena al proyecto | Conservar solo subtítulos, sin locución nueva; koto y flauta, con capa de combate. Nada de caracteres japoneses en interfaz ni teclas literales. |
| Confundir una propuesta con validación | No usar las cifras de este informe como rendimiento medido, aprobación del usuario o prueba de ocho horas de contenido. |

## 6. Fuentes

Consulta realizada el **2 de noviembre de 2026**. Se citan páginas concretas. No se usan estimaciones de duración de otros juegos para deducir la de Ecos de Luz.

| ID | Fuente / autor | Tipo y alcance comprobado |
|---|---|---|
| F01 | [Designing Journey · Jenova Chen, GDC 2013](https://www.gdcvault.com/play/1017700/Designing) | Resumen público. Arco emocional, pulido y proceso de diseño. No se presenta como transcripción. |
| F02 | [Ori: Narrative Design and Visual Storytelling · Jeremy Gritton y Chris McEntee, GDC 2021](https://www.gdcvault.com/play/1027305/-Ori-Will-of-the) | Resumen público. Temas visuales e integración narrativa. |
| F03 | [Diseño de Ori and the Will of the Wisps · entrevista a Thomas Mahler](https://www.orithegame.com/gamasutra-qa-designing-the-gorgeous-metroidvania-ori-and-the-will-of-the-wisps/) | Entrevista reproducida en el sitio oficial de Ori, 2020. Iteración de controles, animación, efectos y sonido. |
| F04 | [Okami · manual oficial de Capcom](https://static.capcom.com/okami/manuals/Wii_Okami_Manual.pdf) | Manual. Praise por ayudar y restaurar, y mejora de atributos; páginas impresas 28–29. |
| F05 | [Ghost of Tsushima: Your questions answered · Sucker Punch](https://blog.playstation.com/?p=329947) | Respuestas de Nate Fox y Jason Connell, PlayStation Blog, 2020. Katana, viento y exploración. |
| F06 | [Ghost of Tsushima · guía oficial para principiantes](https://www.playstation.com/en-us/editorial/ghost-of-tsushima-beginners-guide/) | Señales del mundo, equipo con ventajas, tintes, técnicas y momentos musicales. |
| F07 | [Crafting a tiny open world · Adam Robinson-Yu](https://blog.playstation.com/2021/08/05/crafting-a-tiny-open-world-a-look-behind-the-scenes-at-the-creation-of-a-short-hike/) | Artículo del creador, 2021. Curiosidad, rutas libres, actividades y música dinámica de A Short Hike. |
| F08 | [A Short Hike Postmortem · Adam Robinson-Yu, GDC 2020](https://www.gdcvault.com/play/1026613/Independent-Games-Summit-Crafting-A) | Resumen público consultado. Alcance pequeño, decisiones y expectativas. El enlace presentó disponibilidad intermitente al volver a abrirlo. |
| F09 | [Inside the thoughtful design of Spiritfarer · entrevista a Nicolas Guérin](https://www.gamedeveloper.com/design/inside-the-thoughtful-design-of-thunder-lotus-i-spiritfarer-i-) | Entrevista directa, Game Developer, 2021. Cuidado, personajes, abrazo y despedida. |
| F10 | [Bringing Kena to life · Hunter Schmidt, Ember Lab](https://blog.playstation.com/2021/09/15/bringing-the-lead-character-of-kena-bridge-of-spirits-to-life/) | Artículo del director de animación, 2021. Vestuario, actuación y biblioteca de expresiones. |
| F11 | [Meet the Rot · Kena, PlayStation](https://www.playstation.com/en-au/games/kena-bridge-of-spirits/meet-the-rot-kena-bridge-of-spirits-cute-sidekick-creatures/) | Descripción oficial. Cosméticos, restauración de casas, correo espiritual y utilidad de los Rot. |
| F12 | [Hollow Knight · descripción publicada por Team Cherry en Steam](https://store.steampowered.com/app/367520/Hollow_Knight/) | Descripción del desarrollador: mundo interconectado, capacidades, Charms y descubrimientos. No se usan reseñas de usuarios como evidencia. |
| F13 | [Hades FAQ · Supergiant Games](https://www.supergiantgames.com/blog/hades-faq/) | Fuente del estudio. Combinaciones de poderes, narrativa, progresión y accesibilidad. |
| F14 | [The Dialogue of Hades · Greg Kasavin y Darren Korb, GDC 2021](https://www.gdcvault.com/play/1026975/Breathing-Life-into-Greek-Myth) | Resumen público. Proceso colaborativo de diálogo e iteración narrativa. |
| F15 | [Sky: What are Traveling Spirits? · thatgamecompany](https://thatgamecompany.helpshift.com/hc/en/19-sky-pc-steam/faq/1211-what-are-traveling-spirits/?p=web) | Ayuda oficial. Memorias, expresiones y cosméticos. No se trasladan sus precios ni calendario a Ecos de Luz. |
| F16 | [Ask the Developer: Tears of the Kingdom, parte 5 · Nintendo](https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-9-the-legend-of-zelda-tears-of-the-kingdom-part-5/) | Entrevista a los responsables, 2023. Libertad, reglas visuales y aprendizaje desde Breath of the Wild. |
| F17 | [Bringing fantasy to life · Hadi Qi y Guodong](https://apps.apple.com/cn/iphone/story/id1576338984?l=en-GB) | Entrevista directa en App Store sobre Genshin Impact. Composición de vistas, recorrido e interfaz. |
| F18 | [Hi-Fi Rush: The Exclusive Oral History · equipo de Tango Gameworks](https://news.xbox.com/en-us/2023/10/04/hi-fi-rush-exclusive-oral-history/) | Entrevistas directas, Xbox Wire, 2023. Coordinación de música, animación y combate. |

**Fuentes locales principales:** [Coordinación](../../COORDINACION.md), [instrucciones de Claude](../../../CLAUDE.md), [AGENTS](../../../AGENTS.md), [Plan de Fusión](../../PLAN_FUSION.md), [README](../../../README.md), [Personajes](../../PERSONAJES.md), [canon 2.0](../../PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md), [secundarias implementadas](../../../js/68-secundarias.js).

**Guion de capítulos leído:** [Pétalo](../2026-11-02_capitulo1_petalo.md), [Marea](../2026-11-02_capitulo2_marea.md), [Duna](../2026-11-02_capitulo3_duna.md), [Yoake](../2026-11-02_capitulo4_isla.md), [Tasogare](../2026-11-02_capitulo5_tasogare.md), [Kiri](../2026-11-02_capitulo6_kiri.md), [Luna y epílogo](../2026-11-02_capitulo7_luna.md).

### Cierre de la entrega

**Archivos tocados:** creado únicamente `docs/entregas_chatgpt/investigacion/03_contenido.md`. No se modificó código, documentación de dirección ni el ZIP.

**Decisiones tomadas:** priorizar pulido y contenido existente; conservar el canon y las 13 secundarias como base; proponer recompensas con identidad, seis apariencias y un único efecto activo; separar cifras existentes de objetivos de prueba; ordenar ampliaciones por dificultad. Ninguna propuesta queda aprobada ni implementada por este informe.

**Preguntas abiertas — Pregunta para el usuario:** autorizar o mantener la distribución actual de la Naginata; decidir si la Odachi vuelve a ser obtenible y cuál sería su procedencia; aprobar cualquier explicación argumental nueva para las técnicas candidatas; indicar un homenaje externo solo si se desea incluirlo. Las decisiones no necesarias para el primer bloque no impiden pulir las misiones y escenas actuales.
