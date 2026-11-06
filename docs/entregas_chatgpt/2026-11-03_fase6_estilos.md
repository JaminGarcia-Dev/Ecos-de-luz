# Fase 6 · Arco de luz y escuela de luz

Fecha: 2026-11-03. Encargo de Claude: diseño y código acotado en una copia. Los módulos están listos para integrar. La adquisición, la selección de estilo y la animación siguen a cargo de Claude.

Fuentes leídas: COORDINACION, AGENTS, CLAUDE, fases 6 y 7 de PLAN_JUEGO, investigación 02 de combate, canon 2.0, PERSONAJES y entregas de capítulos 1 y 4. Contratos contrastados con 00, 20, 21, 35 y 70. El encargo actual prevalece sobre los básicos gratuitos, el haz ofensivo y el Pulso del informe 02.

## Diseño e identidad

Una ranura ofensiva: `arco` o `luz` ocupa el puesto completo del arma. Cada módulo contiene sus cuatro movimientos. Ninguno equipa, cambia de estilo o se suscribe al daño por su cuenta. Claude conectará selección, guardado y exclusión en `Combate`. El haz de utilidad conserva su función de iluminar mecanismos. El Pulso es otro sistema.

Todos los ataques cuestan luz ambiental. El daño nominal de las tablas se multiplica por `Sis.dmgMult()` al emitir. Después, `Impacto` aplica las reglas actuales del objetivo y su variación. Las flechas no llaman a habitantes. La fauna pasa por el mismo contrato de calma del juego. Los módulos no escriben vida, invulnerabilidad o daño recibido de Hikari.

El arco ofrece distancia y precisión. Apuntar reduce la marcha al 45 %. Obliga a cumplir la primera mitad de la recuperación antes de iniciar guardia o esquiva. Esa exposición compensa su alcance frente a la katana, que puede volver a guardia al terminar el tramo activo. La escuela ofrece un abanico de área y una parada ampliada de un solo uso. Canalizar reduce la marcha al 30 %. Sus ataques cuestan más luz. Ambos conservan la esquiva y la defensa común que integre Claude fuera de sus compromisos.

## Movimientos implementados

L = unidades de `Sis.ST.luz`. A/Ac/R = aviso / activo / recuperación, en segundos. La carga y el tiempo que el jugador mantiene la acción se suman a esos tiempos. La fase activa es la emisión; el vuelo sigue después sin bloquear a Hikari. Los alcances son distancias recorridas por el centro del proyectil. `Impacto` suma su radio de contacto y el del objetivo; el alcance del sector también se mide desde el borde del objetivo según el contrato 70.

| Estilo / movimiento | Entrada | L | Daño nominal | Peso | A/Ac/R | Alcance; velocidad; radio |
|---|---|---:|---:|---:|---|---|
| Arco · Disparo rápido | Tocar y soltar {atacar} | 3 | 14 | 1 | 0,10 / 0,04 / 0,26 | 22 m; 30 m/s; 0,13 m |
| Arco · Tiro tensado | Mantener {atacar} al menos 0,75 s; soltar | 10 | 32 por objetivo | 2 | 0,08 / 0,06 / 0,36 | 30 m; 42 m/s; 0,16 m |
| Arco · Tres luces | Mantener {guardia} y pulsar {atacar} | 12 en total | 8 por flecha; máximo 24 sobre un blanco | 1 | 0,18 / 0,10 / 0,42 | 7 m; 22 m/s; 0,16 m |
| Arco · Flecha de marca | Pulsar {atacar} antes de 0,30 s tras esquivar | 5 | 18 | 1 | 0,06 / 0,04 / 0,30 | 18 m; 34 m/s; 0,14 m |
| Luz · Orbe guiado | Tocar y soltar {atacar} | 5 | 12 | 1 | 0,12 / 0,06 / 0,32 | 9 m; 16 m/s; 0,22 m |
| Luz · Abanico de luz | Mantener {guardia} y pulsar {atacar} | 16 | 22 por objetivo | 2 | 0,20 / 0,12 / 0,42 | Sector de 3,6 m; semiángulo 0,90 rad |
| Luz · Escudo de luz | Pulsar {guardia}; recibir un ataque válido | 10 al parar | 0 | 2, reservado en ficha | 0,08 / 0,30 / 0,42 | Radio visual 1,05 m; semiángulo frontal 1,10 rad |
| Luz · Lanza de luz | Mantener {atacar} al menos 0,90 s; soltar | 20 | 42 | 3 | 0,16 / 0,08 / 0,50 | 26 m; 38 m/s; 0,30 m |

Tres luces emite flechas a −0,24, 0 y +0,24 rad respecto al rumbo elegido. Cada flecha tiene su `toc`. Cada una se detiene en el primer contacto. El tensado atraviesa objetivos a lo largo de sus 30 m, con un único `toc` para todo su vuelo. Nunca vuelve a dañar al mismo objetivo. Las paredes y el suelo detienen también el tensado. La marca deja luz residual durante 0,65 s en el contacto. Es una señal visual de posición; no aumenta daño ni crea un estado persistente.

El orbe corrige suavemente hacia el punto fijado, con coeficiente de guía 4/s. La entrada actualiza esas coordenadas durante el vuelo. Cambiar la fijación redirige los orbes que salieron con objetivo. Al perderla mantienen el último punto conocido; un orbe lanzado sin objetivo sigue recto. No buscan blancos por su cuenta. La lanza se detiene en el primer contacto. El abanico es frontal y alcanza a quien entra durante sus 0,12 s activos, una sola vez por objetivo. No despeja esquirlas como el Pulso.

La trayectoria se muestra con hasta 16 puntos durante la carga. Es recta y se corta ante suelo o sólidos. No predice el movimiento del enemigo. La carga satura su pose a los 2 s; no acumula daño adicional ni dispara automáticamente.

### Coste y cancelaciones

El coste se devuelve en `gasta` justo al emitir, después del aviso. Se comprueba otra vez la luz en ese instante. Si el jugador la gastó durante la carga, no sale un ataque parcial. Cancelar antes de emitir cuesta cero. Después de emitir, el coste permanece gastado y el vuelo termina por su cuenta.

| Estado | Qué puede cancelarlo | Riesgo o contramedida |
|---|---|---|
| Carga de arco o lanza | {guardia}, {esquivar}, `cancelar` o perder disponibilidad física | No hay invulnerabilidad. Una rastrera puede cerrar distancia. Soltar antes del umbral produce el ataque rápido/orbe. |
| Aviso y emisión de cualquier ataque | Interrupción externa aceptada: `cancelar` o `libre = false` | El módulo devuelve `bloquea = true`. El adaptador impide iniciar otras acciones voluntarias durante ese compromiso. |
| Recuperación del arco | {guardia} mantenida o pulsación de {esquivar}, desde la segunda mitad | La primera mitad sigue bloqueada: 0,13 / 0,18 / 0,21 / 0,15 s adicionales según el movimiento. El vuelo continúa. Un ataque nuevo espera el final o un búfer válido. |
| Recuperación de luz | Pulsación de {guardia} o {esquivar} | Evita que mantener {guardia} rearme el escudo. |
| Escudo antes de parar | {guardia} + pulsación de {atacar} cambia al abanico | El ataque cobra su coste normal al emitir. Se abandona la ventana defensiva. |
| Caída, muerte, escena o cambio de estilo | `reiniciar()` en muerte, entrada en escena o cambio; `cancelar` para una interrupción local | `reiniciar()` elimina también todos los vuelos y efectos. |

El búfer dura 0,16 s. No se usa para retrasar una esquiva. El ataque tras esquiva requiere que esta haya terminado: `esquivaReciente` mide desde su final, como `J.finEsq` actual. El abanico tiene prioridad sobre la flecha de marca.

El escudo solo está activo entre 0,08 y 0,38 s desde el inicio. Intercepta un ataque frontal, dirigido y parable. No intercepta caída ni ataque imparable. Cada uso exige soltar y volver a pulsar {guardia}; además, hay 0,60 s de espera después de su ciclo de 0,80 s. Intervalo mínimo entre inicios: 1,40 s. Sin ataques recibidos, el gasto es cero. Si falta luz al recibir, no bloquea y devuelve un aviso. Su ventana de 0,30 s amplía los 0,16 s de la parada común en Exigente; no aumenta la invulnerabilidad de la esquiva.

## Obtención dentro del canon 2.0

Los capítulos y personajes citados ya existen. Las dos escenas siguientes son propuestas de adquisición para confirmar. No añaden una reliquia antigua, un maestro nuevo o una revelación de identidad. La energía procede del entorno. No se extrae del farol de Tsuru ni de una víctima.

### Escuela de luz · capítulo 1, después de la katana

Propuesta `c1_forma_luz`: práctica breve de 45–75 s, después de las tres Sombras iniciales de la katana. Fuera de peligro, Hikari prueba a concentrar la luz ambiental en la palma en un lugar seguro del Mirador. Lumi la acompaña con las indicaciones básicas de la tabla. Sigue siendo informante; esta escena no prueba su inocencia ni anticipa su confesión.

La escuela se concede al completar la demostración, antes de volver a la ruta del Pétalo. No se exige ganar otro combate, conseguir un fragmento o pagar motas. El ensayo permite comprobar el orbe contra una referencia visual sin vida; no usa animales como blancos. El resto de técnicas queda disponible a la vez en su ficha. El adaptador de selección propone probar `luz` al jugador; no suma magia a la katana equipada.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| F6L01 | Hikari | «Puedo reunir la luz en la mano.» | Tras guardar la katana, en la zona segura | Abre la palma. |
| F6L02 | Lumi | «Prueba a darle una forma pequeña.» | Demostración segura | Se aparta de la trayectoria. |
| F6L03 | Interfaz | «Toca {atacar} para soltar un orbe.» | Durante el ensayo | Señala una referencia vacía. |
| F6L04 | Hikari | «Así puedo alcanzar varios pasos más allá.» | Primer orbe emitido | Sigue su recorrido. |
| F6L05 | Interfaz | «Escuela de luz disponible. Elige tu estilo fuera de combate.» | Al cerrar el ensayo | Una concesión guardada, sin repetirla al releer. |

Esta incorporación sustituye las ayudas antiguas CPG04–06 que pedían dañar al Gólem del Cerezo con {haz}. Claude debe adaptarlas a {atacar} y a una abertura utilizable por cualquier estilo. Encender faroles y canalizar tras purificar siguen siendo interacciones. Esta entrega no modifica ese guion ni el gólem.

### Arco de luz · Yoake, capítulo 4

Propuesta `c4_forma_arco`: regalo de aprendizaje tras habilitar la señal con Ren, antes del mirador y del regreso. Duración de 45–60 s. La lámpara ambiental y su dirección ofrecen una referencia para el gesto; Ren conserva su oficio de mantenimiento. Hikari forma el arco con la luz que ya sabe reunir. El regalo es la nueva forma aprendida, sin objeto robado, núcleo ajeno o linaje secreto.

Una primera tensión apunta desde la torre hacia el mar vacío. No se caza fauna ni aparecen Sombras en el refugio. La concesión se guarda al terminar el gesto. La tarea de la señal y su recompensa se reconcilian por separado al cargar, para admitir partidas que ya repararon la torre. El ensayo puede omitirse después de ver la demostración. La historia continúa aunque se conserve otro estilo equipado.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| F6A01 | Ren | «La señal ya apunta a la entrada.» | Después de `c4:senal_lista` | Comprueba el postigo. |
| F6A02 | Hikari | «Quiero llevar la luz más lejos.» | Mira el canal despejado | Separa las manos; forma el arco. |
| F6A03 | Interfaz | «Mantén {atacar} para tensar. Suelta para disparar.» | Ensayo hacia el mar | Muestra la guía sin blancos vivos. |
| F6A04 | Hikari | «Necesitaré espacio para prepararlo.» | Termina la primera tensión | Baja el arco y deja pasar a Ren. |
| F6A05 | Interfaz | «Arco de luz disponible. Elige tu estilo fuera de combate.» | Cierre | Guarda la concesión una vez. |

El arco no procede de la muerte de Tsuru. Su farol conserva testimonios anteriores, y Tsuru permanece fallecida. La escena ocurre después de la acogida y las tareas, sin pisar el duelo de Momo. Lumi permanece en la situación de aislamiento del refugio prevista en el capítulo 4.

## Textos de interfaz

| Nombre | Descripción de una línea | Consejo de uso |
|---|---|---|
| Arco de luz | «Flechas de luz para mantener la distancia.» | «Toca {atacar} para un tiro rápido. Mantén y suelta para perforar.» |
| Escuela de luz | «Luz concentrada y un abanico cercano.» | «Combina {guardia} y {atacar} para cubrir el frente.» |
| Disparo rápido | «Una flecha breve que se detiene al tocar.» | «Dispara cuando tengas espacio.» |
| Tiro tensado | «Una flecha que atraviesa objetivos.» | «Alinea las Sombras antes de soltar {atacar}.» |
| Tres luces | «Tres flechas de corto alcance.» | «Mantén {guardia} y pulsa {atacar}.» |
| Flecha de marca | «Un tiro veloz al terminar una esquiva.» | «Usa {atacar} justo después de {esquivar}.» |
| Orbe guiado | «Un orbe que busca el punto fijado.» | «Fija un objetivo cercano con {fijar}.» |
| Abanico de luz | «Una ráfaga frontal que alcanza varios objetivos.» | «Acércate por un lado. Combina {guardia} y {atacar}.» |
| Escudo de luz | «Una parada más amplia que cuesta luz al acertar.» | «Pulsa {guardia} antes del golpe.» |
| Lanza de luz | «Un proyectil largo que exige preparación.» | «Mantén {atacar} y suelta cuando termine la carga.» |

Avisos implementados: «Falta luz. Suelta {atacar} y espera.»; «Espera a que llegue la luz de {atacar}.»; «Falta luz para {guardia}. Aléjate con {esquivar}.». El segundo solo aparece si se llena la reserva de 12 proyectiles del módulo.

## Contrapesos y lectura del fallo

| Estilo | Contrapeso y solución con el mismo estilo | Objetivo de tiempo adicional | Fallo visible |
|---|---|---|---|
| Arco | Sombra escudo actual. Su farol cubre 130°. Flanquear durante su giro limitado o castigar su recuperación. Ninguna flecha marca `romperSombra`; tensar atraviesa cuerpos, pero no rompe el farol. | Objetivo +40 %; intervalo aceptable +25–60 % frente a una Sombra equivalente sin guardia. | El farol produce el destello y sonido de bloqueo actuales. La flecha rápida termina allí. El tensado sigue, pero ese escudo queda registrado y no recibe intentos repetidos del mismo tiro. |
| Escuela de luz | Sombra espejo, prevista para fase 7. Propuesta: superficie reflectante durante su defensa frontal; daño de luz al 70 % durante esa defensa. Se puede rodear o atacar durante su recuperación. Sin inmunidad total ni devolución automática contra Hikari. | Referencia matemática de exposición continua: 1 / 0,70 = 1,43, aproximadamente +43 %. Meta de encuentro +40 %; aceptación +25–60 %. | Propuesta: cara clara en forma de rombo, contacto fragmentado en puntos y sonido de cristal apagado. El brillo se abre al recuperar. Un orbe que falla no persigue otro blanco. |

Son objetivos de balance, no mediciones del navegador. Para validar: mismo estilo, nivel, daño, dificultad Exigente, vida y geometría; cambiar solo la defensa del contrapeso. Medir diez resoluciones después de aprender el patrón, con luz inicial idéntica. Comparar medianas: `T_contrapeso / T_referencia` debe quedar entre 1,25 y 1,60. Una referencia de 10 s admitiría entre 12,5 y 16 s. Registrar intentos frontales y tiempo dedicado al flanqueo. No subir vida para forzar el porcentaje. La Sombra espejo aún no existe; su defensa y su señal no están implementadas aquí.

Otros fallos: fuera de alcance, la flecha o el orbe desaparece al completar su distancia. Contra suelo o pared queda un destello breve. Soltar pronto emite la técnica breve y su pose. Cargar con poca luz termina en aviso, sin emisión ni cobro. Un enemigo que entra durante la carga ve a Hikari con los brazos ocupados y sin protección añadida. El escudo desaparece al vencer su ventana; nunca promete protección continua.

## API exacta para Claude

Scripts clásicos, constantes globales `ARCO`, `TallerLuz`, `ArcoLuz`, `ESCUELA_LUZ`, `EscuelaLuz`. Orden obligatorio: 70, 71, 72. `TallerLuz` comparte construcción y viaje; cada estilo posee instancias y estado separados. No usar sus funciones internas como controles de juego. No hay dependencias de DOM, temporizadores, listeners ni THREE al evaluar la lógica.

| Miembro común | Firma y resultado |
|---|---|
| Identidad | `ArcoLuz.id === 'arco'`, `ArcoLuz.nom === 'Arco de luz'`; `EscuelaLuz.id === 'luz'`, `EscuelaLuz.nom === 'Escuela de luz'`. |
| Entrada | `entrada(dt, E) -> { gasta, ralentiza, bloquea, yaw, pose: { nombre, k }, aviso? }`. `dt` en segundos, una llamada por fotograma equipado. `gasta` se descuenta ya, una vez. `ralentiza` multiplica la marcha. `bloquea` impide iniciar otras acciones durante aviso, emisión y la mitad obligatoria de recuperación del arco. `yaw` es un rumbo absoluto en radianes, o `null`. `k` está entre 0 y 1. |
| Vuelo | `actualizar(dt) -> undefined`. Una vez por fotograma de juego, para ambos estilos, tras entrada y antes de renderizar. Resuelve proyectiles y efectos aunque no se llame a entrada. Pausa el juego con el mismo criterio que el resto del combate. |
| Limpieza | `reiniciar() -> undefined`. Elimina acción, carga, búfer, proyectiles, guía y efectos. En luz elimina también ventana, espera y memoria de guardia. No devuelve luz. |
| Construcción | `crear(escena) -> undefined`. Construye una sola vez. Añade cinco objetos gráficos por módulo. Sin esta llamada, toda la lógica funciona. |
| Mano | `modelo() -> THREE.Group`. Nuevo grupo por llamada. Empuñadura/palma en el origen; +Y arriba y +Z delante. Claude lo cuelga de la mano y oculta el modelo del estilo anterior. |
| Precompilación | `muestras() -> THREE.Object3D[]`. Antes de `crear`, `[]`. Después devuelve seis objetos: muestras de lotes, área, escudo y modelo en mano. Muestras visibles separadas de los lotes activos; llevarlas a la escena temporal del precalentamiento. No hay variantes nuevas por calidad. |
| Diagnóstico | `estado() -> copia de { vuelos, efectos, vista, carga, accion, bufer }`; en luz añade `espera`. `vista` y `accion` son nombres o `null`; los contadores son números. No expone los conjuntos de contacto ni el estado mutable. |
| Defensa, solo luz | `EscuelaLuz.defender(e, luzActual) -> { gasta, bloquea, parada, aviso }`. Consulta síncrona que consume la ventana si acierta. No modifica `Sis.ST`. Un resultado fallido devuelve `gasta: 0`, `bloquea: false`, `parada: false`; `aviso` es texto o `null`. |

`E` conserva los campos pedidos: `{ libre, atacar, atacarPulsado, esquivaReciente, x, y, z, yaw, objetivo, luz }`. `objetivo` es el punto mundial ya calculado por `Combate.posObj`, no la referencia `obj` interna ni una posición de suelo. `luz` debe reflejar el gasto de sistemas anteriores del mismo fotograma.

Extensión mínima necesaria de entrada: `guardia?: boolean`, `guardiaPulsada?: boolean`, `esquivarPulsado?: boolean`, `cancelar?: boolean`. Todos son acciones normalizadas de teclado o mando. Sin ellos sigue funcionando el ataque breve/cargado y la flecha tras esquiva. `guardia` habilita ambos abanicos y el escudo. Luz deduce la pulsación de guardia por flanco ascendente si se omite `guardiaPulsada`. `cancelar` significa una interrupción ya aceptada; `esquivarPulsado` permite cancelar la preparación o la recuperación.

`libre` representa disponibilidad física externa: viva, fuera de diálogo, caída, agua, trepa, haz, etc. No incluir el propio `bloquea`, la carga de este estilo ni su modificador de guardia: eso cortaría cada técnica en el fotograma siguiente. El `libre()` actual de 21 incluye `J.guardia`; Claude debe adaptar esa condición al construir `E` para que {guardia}+{atacar} llegue al módulo. Los módulos resuelven sus propias ocupaciones y su búfer.

`e` en `defender` es el evento actual de daño: necesita `x,z` del atacante y comprueba `caida` e `imparable`. Consultar después de descartar muerte, cinemática y esquiva invulnerable. Solo consultar el estilo equipado. Si `bloquea` es verdadero, descontar `gasta` inmediatamente, usar una sola vez las desviaciones de la parada existente y terminar el procesamiento de ese golpe. Esa parada de pago no concede además los 8 L de la parada común. Si es falso, continuar la defensa/daño habitual. El módulo no llama al método privado `parada` de `Combate`; Claude integra esa ruta.

Las poses son identificadores para la futura adaptación: `reposo`, `arco_apunta`, `arco_rapido`, `arco_tensado`, `arco_abanico`, `arco_marca`, `luz_canaliza`, `luz_orbe`, `luz_rafaga`, `luz_escudo`, `luz_lanza`. `k` expresa proporción de carga al apuntar/canalizar y progreso del ciclo al ejecutar. No se alteran huesos desde estos módulos.

## Implementación y verificación

Cada ataque llama a `Impacto.proyectil` o `Impacto.sector`. No se repite la lista de fauna, Sombras, gólems o jefes. Los proyectiles tienen daño fijado al emitir. Un sector conserva su `toc` durante la acción. El taller subdivide el viaje en pasos máximos de 0,12 m y conserva el registro en todos los fotogramas. Un contacto perforante continúa el mismo tramo con ese registro. Sol y suelo detienen el vuelo antes de consultar daño del tramo bloqueado.

Límite por módulo: 12 proyectiles y 8 efectos residuales. Tres `InstancedMesh` para cuerpos/efectos, puntas y esferas/guía; dos mallas fijas para abanico y escudo. Los lotes con `count === 0` llevan `visible = false`. Materiales `MeshBasicMaterial` sin texturas, luces añadidas ni código de shader propio. Las geometrías y materiales se crean una vez; los modelos de mano se construyen fuera del bucle. El orbe se ve esférico; la lanza mide 1,8 m en su eje visual. El dibujo es provisional y sustituible.

Resultado: `node herramientas/probar-estilos.mjs`, **42/42**, código 0. Los tres scripts nuevos pasan `node --check`, código 0. La prueba funciona sin navegador ni dependencias externas. Incluye un doble de Impacto y una ejecución adicional del 70 real con proveedores simulados. Comprueba fichas, costes, ausencia de luz, gasto devuelto sin mutación del jugador, contactos únicos, perforación, cada flecha del abanico, carga agotada, cancelación, reinicio, alcance, altura, pared fina, guía móvil, área frontal durante su ventana, escudo vacío, ventana, dirección, ataque imparable, búfer, recuperación obligatoria del arco, doce proyectiles contra seis blancos, fotogramas de 8,3/16,7/33,3/50 ms y objetos para precalentar.

Estas pruebas no miden GPU ni valoran animación. Queda para Claude: navegador sin errores en las tres calidades, teclado y mando, duelo contra gólem con cada estilo, ensayo de seis enemigos y doce proyectiles, precalentamiento sin compilaciones durante juego y valoración visual del usuario. No se abrió Edge. El sector común todavía no filtra oclusión entre cada objetivo y el origen; esa limitación pertenece a `Impacto`, y también debe revisarse en encuentros con paredes.

## Cierre de entrega

Archivos y líneas tocadas: `js/71-arco-luz.js`, 1–219, nuevo completo; `js/72-escuela-luz.js`, 1–115, nuevo completo; `herramientas/probar-estilos.mjs`, 1–272, nuevo completo; esta entrega, 1–163, nueva completa; `index.html`, 219–220, dos líneas añadidas inmediatamente después de 70. No se editaron los archivos que modifica Claude.

Decisiones tomadas: ocho movimientos y una ranura; todos los ataques pagan luz; carga al soltar; combinación de guardia y ataque para los abanicos; tensado perforante con registro único; marca visual sin bonificación; escudo de una parada con cobro al acertar; taller compartido en 71; daño por el contrato existente; adquisiciones propuestas sin ampliar genealogías o reliquias.

Preguntas abiertas:

- **Pregunta para el usuario:** ¿confirma la práctica de la palma en el Mirador como adquisición de la escuela de luz, después de la práctica inicial de katana?
- **Pregunta para el usuario:** ¿confirma que Hikari aprenda la forma de arco tras reparar la señal de Yoake, como regalo de aprendizaje sin un objeto antiguo nuevo?
- Pendiente de Claude: conectar acciones opcionales, selección/guardado, poses, cancelaciones externas, consulta de escudo y recompensa única; adaptar las ayudas del Cerezo; implementar Sombra espejo en fase 7 y medir el +25–60 % de ambos contrapesos. La política de regeneración de luz debe tener en cuenta carga, emisión y defensa; estos módulos no la modifican.
