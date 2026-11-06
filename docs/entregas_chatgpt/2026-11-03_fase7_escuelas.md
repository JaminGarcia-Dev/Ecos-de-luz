# Fase 7 · Viento, brasa, escarcha y oscuridad

Fecha del encargo y nombre solicitado: 2026-11-03. Realización: 2026-11-04. Diseño y código acotado en la copia. Fuentes: COORDINACION, AGENTS, CLAUDE, PLAN_JUEGO fases 6–7, investigación 02 (3.2–3.5), entrega de fase 6, canon 2.0 y contratos 07, 21, 28, 70, 71 y 72. Se contrastaron además los puntos narrativos de 59 y 60.

Se entregan los cuatro módulos globales en un único archivo de menos de 600 líneas. Comparten una fábrica de acciones y zonas. Todo vuelo, colisión de proyectiles y registro de sus contactos pertenece a `TallerLuz`. No se repite su motor. El HTML carga 74 inmediatamente después de 72. No se han conectado aún al inventario, al combate ni a las escenas.

El encargo prevalece sobre los básicos gratuitos del informe de investigación. Todos los movimientos gastan luz. Oscuridad añade un coste de vida pequeño. Los capítulos de adquisición y la herencia de Tasogare ya están decididos en el encargo y el plan. Las puestas en escena siguientes son propuestas de integración. No crean otro origen mágico, maestro, parentesco o fragmento.

## Identidad y adquisición

Una escuela ocupa `eq.arma` completo. Con viento no se lleva a la vez la naginata. Su adquisición coincide en capítulo, sin imbuir el arma con magia. La escuela de escarcha tampoco añade hielo a una espada. Los cuatro movimientos llegan juntos. Cambiar de estilo no rellena luz ni vida. No hay daño a habitantes; la fauna conserva el contrato común de calma de `Impacto`.

### Viento · capítulo 2 · propuesta `c2_forma_viento`

Misión corta «Dejar pasar el aire», 40–60 s. En el muelle de Kaito, tras su primera conversación y la adquisición adelantada de la naginata. Kaito pide liberar una cinta de amarre atrapada en una tabla. Hikari lo hace con {interactuar}; observa su dirección y reúne la luz ambiental en un corte de aire. Se guarda la naginata antes de la demostración. Dos gestos hacia el agua vacía enseñan el corte y el frente. Kaito aporta una observación de su oficio, sin convertirse en maestro de magia.

Concesión propuesta: `Sis.dar('escuela_viento', 1, true)` una vez al cerrar la demostración. Reconciliar por posesión de la ficha al cargar; poseer la naginata por sí solo no demuestra que se completó este ensayo. Si se omite la práctica tras verla, conceder igualmente. La memoria de Rui conserva su espacio; esta misión no aparece encima de su despedida.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| F7V01 | Kaito | «La cinta quedó atrapada. ¿La sueltas?» | Oferta fuera de combate | Señala el amarre. |
| F7V02 | Hikari | «El aire sigue tirando hacia el agua.» | Cinta liberada | Guarda el arma. Sigue la cinta con la palma. |
| F7V03 | Interfaz | «Combina {guardia} y {atacar} para abrir espacio.» | Ensayo seguro | Marca una referencia vacía frente al muelle. |
| F7V04 | Hikari | «Puedo seguir moviéndome mientras lo preparo.» | Primer corte | Camina de lado con la palma abierta. |
| F7V05 | Interfaz | «Escuela de viento disponible.» | Cierre | Concesión única; selección fuera de combate. |

### Brasa · capítulo 3 · propuesta `c3_forma_brasa`

Misión corta «Un círculo de calor», 45–60 s, después de `c3:archivo_contrastado`, en piedra despejada fuera del archivo. Hikari practica contener el calor de su luz en un aro sobre la piedra. El objetivo es dejar una zona y salir de ella con {esquivar}; no se pide incendiar papel, plantas ni animales. La recompensa es el aprendizaje, no energía del archivo ni el don de Inés. No se usa una víctima, reliquia nueva o instrucción que cambie la historia de las Lunas.

Concesión propuesta: `Sis.dar('escuela_brasa', 1, true)` al terminar el ensayo. Nada se quema en el escenario. La marca se extingue por su temporizador. Se puede conservar otro estilo para el Gólem de Arena. No depende del desafío opcional de odachi.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| F7B01 | Hikari | «La luz también guarda calor.» | Piedra segura, tras leer el archivo | Acerca las manos, sin tocar documentos. |
| F7B02 | Hikari | «Voy a mantenerlo dentro del círculo.» | Demostración | Dibuja el aro con la palma. |
| F7B03 | Interfaz | «Combina {guardia} y {atacar}. Después, sal con {esquivar}.» | Ensayo | El aro deja visible el suelo. |
| F7B04 | Hikari | «La brasa se queda. Yo puedo apartarme.» | Zona encendida | Se retira y observa cómo se apaga. |
| F7B05 | Interfaz | «Escuela de brasa disponible.» | Cierre | Concesión única. |

### Oscuridad · capítulo 5 · propuesta `c5_forma_oscuridad`

Herencia al deshacerse Tasogare, como aprobó el usuario. Un hilo de tinta y una brasa roja contenida llegan a la mano de Hikari mientras el resto de él se dispersa en luz. No es otro núcleo, su alma prisionera, un pacto o una resurrección. No habla desde la mano ni la controla. Tampoco se adelanta la certeza de «era mi padre»: llega en Kiri.

Guardar en ese instante la concesión `escuela_oscuridad`, sin rótulo, sonido de premio, cambio automático de equipo ni ejercicio obligatorio. Primero se atiende a Momo. Después de `c5:despues`, ofrecer fuera de combate un ensayo de 20–30 s hacia suelo vacío. No se condiciona la herencia a repetir el desenlace o a aceptar una interpretación moral de la muerte.

Coste mixto: 3–18 L y 1–3 de vida por emisión. Representa esfuerzo físico al contener la técnica heredada. No consume identidad, memoria, núcleos o personas. La vida retirada es `min(costeVida, max(0, vidaActual - 1))`. Nunca mata y, a 1 de vida, sigue exigiendo toda la luz: permite completar un combate con el único estilo equipado. No roba ni devuelve vida al acertar. El coste no se multiplica por dificultad, manto, daño o número de objetivos. No produce reacción de daño, invulnerabilidad, sangre, heridas ni grietas en la máscara. Se comunica con el coste de la ficha y una contracción breve de la mano.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| F7O01 | Dirección | Sin texto. | Tasogare se deshace | Un trazo queda contenido en la palma. Se mantiene la atención en Momo. |
| F7O02 | Hikari | «Quedó algo de su oscuridad en mi mano.» | Después de atender a Momo y cerrar la conversación | Mira el trazo. Mantiene su voz propia. |
| F7O03 | Hikari | «Puedo contenerla.» | Ensayo opcional | Cierra y vuelve a abrir la palma. |
| F7O04 | Interfaz | «Oscuridad usa luz y un poco de vida. Siempre conserva 1 de vida.» | Ficha o ensayo seguro | Texto informativo sin fanfarria. |
| F7O05 | Interfaz | «Escuela de oscuridad disponible.» | Fuera de escena, en la ficha | No interrumpe el duelo. |

### Escarcha · capítulo 6 · propuesta `c6_forma_escarcha`

Misión corta «Dar forma al frío», 40–60 s. Tras `c6:ruta_acordada`, en un punto seguro de la ruta a Kiri, antes de entrar en el paso de la emboscada. Hikari observa escarcha sobre una piedra y prueba a dar esa forma a la luz ambiental. El gesto permite un abanico sobre terreno vacío. No congela el agua ni crea plataformas. No se conoce aún la identidad completa. Lumi no revela la emboscada ni queda exculpada por acompañar el ensayo.

Concesión propuesta: `Sis.dar('escuela_escarcha', 1, true)` una vez al cerrar. Se puede omitir la repetición después de ver el gesto. No depende de purificar a Alba, del don de fogatas ni del cuarto fragmento. La katana veloz tiene su adquisición aparte.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| F7E01 | Hikari | «El frío dibuja líneas sobre la piedra.» | Inicio seguro de la subida | Se agacha y observa, sin retirar una pieza del santuario. |
| F7E02 | Hikari | «Puedo darles forma con la luz.» | Demostración | Levanta una aguja sobre la palma. |
| F7E03 | Interfaz | «Combina {guardia} y {atacar} para frenar el avance.» | Ensayo seguro | Abanico hacia suelo vacío. |
| F7E04 | Interfaz | «Mantén {atacar}. Suelta para quebrar una guardia.» | Ficha del cargado | Enseña una abertura; no promete inmovilizar a un jefe. |
| F7E05 | Interfaz | «Escuela de escarcha disponible.» | Cierre | Concesión única. |

## Textos de interfaz

| Nombre | Descripción de una línea | Consejo |
|---|---|---|
| Escuela de viento | «Cortes lejanos para moverte y abrir espacio.» | «Empuja con {guardia} y {atacar}. Sigue moviéndote.» |
| Escuela de brasa | «Calor que permanece sobre el suelo.» | «Deja un sello donde vaya a pasar la Sombra.» |
| Escuela de escarcha | «Frena el avance y presiona las guardias.» | «Mantén {atacar}. Suelta al ver una abertura.» |
| Escuela de oscuridad | «Tinta contenida con un coste de luz y vida.» | «Usa aberturas cortas. Cada emisión exige esfuerzo.» |
| Cuchilla de aire | «Un corte de aire que atraviesa cuerpos.» | «Alinea las Sombras. Las paredes detienen el corte.» |
| Frente de viento | «Una ráfaga frontal que separa a las Sombras.» | «Mantén {guardia} y pulsa {atacar}.» |
| Corte al paso | «Un corte breve después de esquivar.» | «Usa {atacar} justo después de {esquivar}.» |
| Corte de presión | «Un corte largo con gran peso.» | «Mantén {atacar} y suelta al completar la carga.» |
| Ascua | «Una brasa que se detiene al tocar.» | «Fija con {fijar} para apuntar a un blanco elevado.» |
| Sello ardiente | «Un aro que deja calor durante tres segundos.» | «Mantén {guardia} y pulsa {atacar}.» |
| Rastro de brasa | «Una zona de calor a tus pies.» | «Tras {esquivar}, usa {atacar} cuando te sigan.» |
| Estallido | «Un golpe de calor sobre una zona lejana.» | «Prepara con {atacar}. Suelta hacia suelo libre.» |
| Aguja fría | «Una aguja que frena un poco el avance.» | «Toca {atacar} para mantener la presión.» |
| Abanico frío | «Un frente frío que ralentiza a varias Sombras.» | «Mantén {guardia} y pulsa {atacar}.» |
| Huella fría | «Un aro frío a tus pies.» | «Tras {esquivar}, usa {atacar} para cubrir la retirada.» |
| Quiebre de hielo | «Una punta pesada que presiona la guardia.» | «Mantén {atacar}. Suelta cuando la Sombra se acerque.» |
| Hebra de tinta | «Un trazo breve de oscuridad contenida.» | «Busca una abertura antes de {atacar}.» |
| Pozo contenido | «Un sello de tinta que frena el paso.» | «Mantén {guardia} y pulsa {atacar}.» |
| Nudo breve | «Un trazo frontal que sujeta un instante.» | «Tras {esquivar}, usa {atacar} de frente.» |
| Ruptura de tinta | «Un trazo pesado que atraviesa cuerpos.» | «Mantén {atacar}. Suelta hacia una abertura.» |

Avisos del módulo: «Falta luz. Suelta {atacar} y espera.»; «Espera a que termine {atacar}.»; «Busca suelo libre para {atacar}.». El aviso «Falta conocer tu vida para {atacar}.» señala una conexión incorrecta: no debe aparecer en una integración terminada. No hay iconos nuevos obligatorios. Todas las acciones son las mismas para teclado y mando.

## API exacta

Globales: `ESCUELAS_MAGIA_CFG`, las cuatro fichas `ESCUELA_VIENTO`, `ESCUELA_BRASA`, `ESCUELA_ESCARCHA`, `ESCUELA_OSCURIDAD`, la fábrica `EscuelasMagia.crear(C)` y los cuatro módulos `EscuelaViento`, `EscuelaBrasa`, `EscuelaEscarcha`, `EscuelaOscuridad`. Scripts clásicos: 70 → 71 → 72 → 74. La lógica no requiere DOM, listeners, temporizadores ni THREE. THREE solo se usa en creación, modelo y muestras gráficas.

| API de cada módulo | Contrato |
|---|---|
| `id`, `nom` | `viento`, `brasa`, `escarcha`, `oscuridad`; «Escuela de …». |
| `entrada(dt, E)` | `{ gasta, ralentiza, bloquea, yaw, pose: { nombre, k }, aviso? }`. Oscuridad añade `gastaVida` numérico, también cuando vale cero. Costes de una emisión; descontar inmediatamente y una sola vez. No modifica `Sis.ST`. |
| `actualizar(dt)` | Resuelve vuelos, zonas y efectos; devuelve `undefined`. Una llamada por fotograma de juego, después de cobrar. Continúa sin entrada. Pausar con el resto del combate. |
| `reiniciar()` | Borra acción, carga, búfer, vuelos, zona, guía y efectos. No devuelve recursos. Usar en muerte, escena, cambio de estilo y reinicio de práctica. |
| `crear(escena)` | Una sola construcción. Añade seis objetos por escuela: cinco de TallerLuz y un aro propio. Sin creación, funciona toda la lógica. |
| `modelo()` | Nuevo `THREE.Group`, sello sobre la palma en origen, +Y arriba, +Z delante. Ninguna espada, proyectil adicional o colisión. |
| `muestras()` | Antes de crear, `[]`. Después, siete objetos para precalentar: cinco del motor, modelo y copia visible del aro. No exponer los lotes activos al precalentamiento. |
| `estado()` | Copia plana `{ vuelos, efectos, vista, carga, accion, bufer, zonas }`. `accion` es `normal`, `area`, `paso`, `cargado` o `null`. `carga` es segundos o `null`. `zonas` es 0 o 1. |
| `defender` | No existe en estas cuatro escuelas: conservan guardia/parada común. Solo luz mantiene su escudo especial. |

`E = { libre, atacar, atacarPulsado, esquivaReciente, x, y, z, yaw, objetivo, luz, guardia?, guardiaPulsada?, esquivarPulsado?, cancelar?, vida? }`. Es la entrada de 72; `vida` es necesaria al equipar oscuridad. `objetivo` es un punto mundial con altura. `guardiaPulsada` se admite por compatibilidad; estas escuelas usan la guardia mantenida. `libre` describe disponibilidad externa; no incluir su propio `bloquea`, carga o guardia común. `cancelar` es una interrupción ya aceptada. No se leen teclas ni botones físicos.

`ralentiza`: viento 0,95 al emitir / 0,80 al cargar; brasa 0,55 / 0,35; escarcha 0,65 / 0,40; oscuridad 0,60 / 0,35. Viento conserva más marcha, sin velocidad extra, desplazamiento automático, invulnerabilidad o capacidad de cruzar sólidos.

## Tabla de movimientos con números

L = luz; V = vida; A/Ac/R = aviso / activo / recuperación, segundos. Son valores base antes de `Sis.dmgMult()` y la variación de daño de 70. Coste V acotado para conservar 1 de vida. Alcances según 70/71: proyectil por recorrido de su centro; sector desde el borde del objetivo. Las zonas tienen centro limitado desde Hikari y radio propio; no hay proyectil invisible adicional.

| Escuela · movimiento (id) | Entrada | L + V | Daño | Peso | A/Ac/R | Alcance y forma |
|---|---|---:|---:|---:|---|---|
| Viento · Cuchilla de aire (`normal`) | Tocar y soltar {atacar} | 4 | 13 | 1 | 0,10/0,06/0,26 | 18 m; 28 m/s; radio 0,24; perfora cuerpos |
| Viento · Frente de viento (`area`) | {guardia} + pulsar {atacar} | 12 | 18 | 2 | 0,15/0,12/0,38 | Sector 4 m; semiángulo 0,80 rad |
| Viento · Corte al paso (`paso`) | {atacar} antes de 0,30 s tras esquivar | 6 | 16 | 1 | 0,06/0,05/0,23 | 14 m; 32 m/s; radio 0,24; perfora cuerpos |
| Viento · Corte de presión (`cargado`) | Cargar 0,55 s y soltar {atacar} | 18 | 40 | 3 | 0,10/0,08/0,42 | 22 m; 36 m/s; radio 0,30; perfora cuerpos |
| Brasa · Ascua (`normal`) | Tocar y soltar {atacar} | 4 | 12 | 1 | 0,12/0,06/0,32 | 10 m; 18 m/s; radio 0,24; primer contacto |
| Brasa · Sello ardiente (`area`) | {guardia} + pulsar {atacar} | 18 | 16 + 6 × 3; máximo 34 | 2; pulsos 1 | 0,40/0,10/0,45 | Centro hasta 6 m; radio 1,8; dura 3 s |
| Brasa · Rastro de brasa (`paso`) | {atacar} antes de 0,30 s tras esquivar | 8 | 10 + 4 × 2; máximo 18 | 1 | 0,08/0,08/0,30 | Centro a los pies; radio 1,3; dura 2 s |
| Brasa · Estallido (`cargado`) | Cargar 0,75 s y soltar {atacar} | 20 | 48 | 3 | 0,16/0,10/0,50 | Centro hasta 8 m; radio 1,8; persiste 0,20 s |
| Escarcha · Aguja fría (`normal`) | Tocar y soltar {atacar} | 4 | 14 | 1 | 0,10/0,06/0,29 | 12 m; 24 m/s; radio 0,24; primer contacto |
| Escarcha · Abanico frío (`area`) | {guardia} + pulsar {atacar} | 12 | 22 | 2 | 0,20/0,12/0,40 | Sector 3,5 m; semiángulo 0,65 rad |
| Escarcha · Huella fría (`paso`) | {atacar} antes de 0,30 s tras esquivar | 10 | 18 por objetivo en toda la zona | 2 | 0,10/0,08/0,32 | Centro a los pies; radio 1,6; dura 2 s |
| Escarcha · Quiebre de hielo (`cargado`) | Cargar 0,65 s y soltar {atacar} | 18 | 44 | 3 | 0,12/0,08/0,45 | 14 m; 28 m/s; radio 0,30; primer contacto |
| Oscuridad · Hebra de tinta (`normal`) | Tocar y soltar {atacar} | 3 + 1 | 15 | 1 | 0,12/0,06/0,32 | 7 m; 18 m/s; radio 0,24; primer contacto |
| Oscuridad · Pozo contenido (`area`) | {guardia} + pulsar {atacar} | 14 + 2 | 28 por objetivo en toda la zona | 2 | 0,35/0,10/0,50 | Centro hasta 5 m; radio 2; dura 2,5 s |
| Oscuridad · Nudo breve (`paso`) | {atacar} antes de 0,30 s tras esquivar | 10 + 1 | 22 | 2 | 0,12/0,08/0,40 | Sector 4,5 m; semiángulo 0,35 rad |
| Oscuridad · Ruptura de tinta (`cargado`) | Cargar 0,65 s y soltar {atacar} | 18 + 3 | 46 | 3 | 0,14/0,08/0,48 | 9 m; 22 m/s; radio 0,30; perfora cuerpos |

Empujes en unidades de impulso del contrato 70, sin equivalencia prometida en metros: viento 3 / 6 / 3,5 / 6; brasa 1 / 0 / 0 / 3,5; escarcha 1 / 1 / 0 / 3,5; oscuridad 0 / 0 / 0 / 1,5, en orden normal/área/paso/cargado. Los pulsos de brasa llevan empuje 0. Solo Quiebre de hielo declara `romper` y `romperSombra` verdaderos.

Estados solicitados al receptor: Aguja fría ralentiza 15 % durante 1 s; Abanico frío 30 % durante 2 s; Huella fría 25 % durante 2 s; Quiebre 30 % durante 2 s. Pozo ralentiza 20 % durante 1,2 s en su único contacto por objetivo. Nudo sujeta 0,45 s. No hay congelación total ni multiplicación de daño por estados previos. La ralentización no se suma ni modifica ataques ya anunciados; élites/jefes conservan sus límites. Aplicarlos sigue pendiente en el receptor, no se modifican directamente posiciones o timers enemigos desde 74.

### Coste, carga, cancelaciones y zonas

Se comprueba luz al ordenar y otra vez al emitir, tras el aviso. Solo se cobra si hay sitio para el vuelo o suelo válido para la zona. Oscuridad vuelve a leer la vida al emitir. El daño y su multiplicador se capturan al emitir. Cambiar de manto después no modifica un vuelo o una quemadura ya creados. Si se cancela antes de emitir, coste cero; después, no hay devolución.

| Estado | Cancelación y compromiso |
|---|---|
| Carga | {guardia}, {esquivar}, `cancelar` o `libre = false`; coste cero. Soltar antes del umbral produce `normal`. Satura a 2 s sin autodisparo. |
| Aviso y activo | Bloquean acciones voluntarias. Solo interrupción externa aceptada mediante `cancelar` o falta de disponibilidad. |
| Recuperación | Primer 25 % obligatorio. Después {guardia} mantenida o pulsación de {esquivar} cancelan. Compromiso adicional: `recupera × 0,25` para cada fila. |
| Ataque siguiente | Espera el fin del ciclo; búfer de 0,16 s. La esquiva nueva tiene prioridad sobre una orden nueva de ataque. |
| Cambio, muerte, escena | `reiniciar()` elimina también vuelos y zonas. `cancelar` local solo interrumpe preparación/acción; lo ya emitido termina. |

Área tiene prioridad sobre paso; paso requiere una esquiva ya terminada, como `J.finEsq`. Mantener {guardia} no invoca escudos propios. No sumar la guardia común a una pose ofensiva: 21 ya la excluye con `ocupado(M)`.

Una sola zona por escuela; la nueva sustituye a la anterior. Como solo hay un estilo equipado y el cambio lo reinicia, no se apilan zonas de escuelas distintas. El centro se fija al emitir; no persigue ni se arrastra al caminar. Sin fijación va al alcance máximo delante; con fijación se limita a su distancia horizontal. Rastro y Huella quedan en los pies actuales, no al inicio de la esquiva. La selección del centro comprueba `Sol.dentro` cada 0,12 m y rechaza desnivel mayor de 2,5 m. Rechazo: aviso y coste cero.

Brasa: contacto inicial una vez a los blancos presentes. Pulsos cada 0,5 s, cada uno con su propio `Set`; máximo seis o cuatro pulsos, también con `dt` grande. Un blanco que entra tarde solo recibe pulsos posteriores, sin recuperar el daño inicial ni ticks anteriores. Ninguna quemadura acompaña al blanco al salir. Estallido, Huella y Pozo comparten un `Set` durante toda su persistencia; admiten blancos que entran tarde y nunca repiten daño sobre el mismo. Repetir Pozo no detona la marca anterior.

La trayectoria de un proyectil la resuelve exclusivamente 71 y respeta sólidos, suelo y altura. La selección del centro de zona respeta sólidos; impedir que un radio o sector alcance a alguien al otro lado de una pared requiere la oclusión por objetivo descrita abajo. No se afirma que la oclusión radial exista ya en 70.

## Contrato con las Sombras

Está duplicado de forma breve al principio de 74 para el encargo de variantes. `F.op` se construye al emitir y no depende de leer el estilo equipado durante el impacto. `perfora` permite continuar el vuelo después del contacto; nunca ignora guardia, cubierta o resistencia.

| Campo | Significado para el receptor |
|---|---|
| `elemento` | `viento`, `brasa`, `escarcha`, `oscuridad`. Discrimina resistencia y señal del contacto. |
| `movimiento` | `normal`, `area`, `paso`, `cargado`; diagnóstico, no resistencia oculta. |
| `peso`, `empuje` | 1–3; impulso según 70. Un oni anclado mantiene su posición sin borrar daño/presión. |
| `perfora` | Continuidad entre cuerpos; no rompe faroles. |
| `romper`, `romperSombra` | Solo Quiebre de hielo. Mantener protección de 4 s tras rotura; no encadenar interrupciones infinitas. |
| `lenta`, `durLenta` | Fracción retirada de locomoción y segundos. Combinar por máximo, sin sumar. No reducir cadencia o aviso ya iniciado. |
| `sujeta` | Segundos. Una sujeción cada 5 s por élite. Jefes reciben daño y peso, sin congelación o arrastre. |
| `suelo`, `periodico` | Aro a ras de suelo; pulso de quemadura. Filtrar altura, no volver inmune a toda la escuela a una alada. |
| `ocluir`, `origen` | 74 solicita oclusión; 70 añade coordenadas del origen por impacto al reenviar. Receptor descarta el contacto tapado por un sólido antes de daño/estados. |

| Escuela / rival | Defensa propuesta, abertura y solución | Tiempo adicional objetivo | Fallo visible |
|---|---|---|---|
| Viento / oni anclado | Lee `elemento`, `empuje`. Anclado: viento ×0,75 y sin desplazamiento. Al recuperar el mazazo o romper equilibrio: daño completo. Usar Corte de presión y parada. | +33 % de referencia con defensa continua; meta de encuentro +30 %, aceptación +25–60 %. | Cintas de aire se abren sobre sus pies clavados. El cuerpo acusa daño, pero no retrocede. Al recuperar, se alzan las trabas. |
| Brasa / Sombra de escoria | Lee `elemento`, `periodico`. Cubierta ×0,70 para daño inicial y pulsos. Junta abierta 1,3 s tras golpe pesado o equilibrio roto: ×1. Colocar sello en su recuperación o preparar Estallido. | +43 % con defensa continua; meta de encuentro +35 %, aceptación +25–60 %. | Brasas pálidas sobre costra mate. La junta naranja se abre antes del castigo. El aro sigue encendido al salir el enemigo. |
| Brasa / Sombra alada | Lee `suelo` y altura. Aros bajos no tocan un cuerpo fuera de su altura. Ascua apunta al punto fijado incluso en vuelo; aterrizaje tras picado de al menos 1,4 s permite sello/Estallido. Sin resistencia elemental adicional. | Meta +35 %, aceptación +25–60 %. Se calibra el tiempo de vuelo y aterrizaje, sin sumar resistencia. | El aro queda claramente abajo. Ascua sigue la altura fijada al salir. Alas cerradas y cuerpo bajo anuncian aterrizaje. |
| Escarcha / lanzadora de escarcha | Lee `elemento`, `lenta`. Cubierta: daño ×0,70 y efecto de ralentización ×0,5; abierta durante sus 1,2 s de recuperación: daño completo. Esquivar disparo y soltar Quiebre/Aguja. | +43 % continuo; meta +35 %, aceptación +25–60 %. | Cristales pequeños resbalan sobre cubierta; sigue desplazándose a menor velocidad. La cubierta se separa al terminar su lanzamiento. |
| Escarcha / oni | Lee `lenta`, `sujeta`, `romper`. Ralentización a la mitad; no baja los avisos ni garantiza romper de un golpe. Mantiene daño completo. Parar y usar Quiebre en su recuperación. | Meta +30 %, aceptación +25–60 %, por menor control y exposición, sin subir vida. | Huella visible, zancada aún firme. Su postura acusa el golpe pesado. Una rotura muestra una abertura real. |
| Oscuridad / Sombra devoradora | Lee `elemento`, `sujeta`. Pecho cerrado: oscuridad ×0,70 y sin sujeción completa; reducirla a 0,20 s con espera de élite. Absorción avisada 0,9 s, después pecho abierto 1,4 s: daño completo. No cura al recibir. Preparar Ruptura fuera del cierre. | +43 % continuo; meta +35 %, aceptación +25–60 %. | Tinta se disipa en costuras cerradas; pequeña reacción de daño. El pecho abre sus costuras tras absorber. No aparece curación. |

Son objetivos de diseño; **no son tiempos medidos**. Las referencias 1/0,75 = 1,33 y 1/0,70 = 1,43 solo describen un daño continuo bajo defensa. Aberturas, escalones de golpes y movimiento cambian el encuentro. Validar diez resoluciones aprendidas, misma vida, dificultad Exigente, potencia, luz inicial y escenario; comparar medianas con la misma criatura sin su defensa especial. Admitir `T_contrapeso/T_referencia` entre 1,25 y 1,60. Una referencia de 10 s exige 12,5–16 s. Ajustar exposición/defensa, sin doblar vida ni añadir inmunidad. Ninguna variante está implementada aquí.

Otros fallos: cargar poco produce el movimiento normal; sin luz no hay emisión ni coste; perder luz durante carga tampoco permite disparar; suelo tapado devuelve aviso; una zona dejada atrás no persigue a nadie. El coste de vida de oscuridad se paga también al fallar un tiro ya emitido. No aparece sangre ni un estado de corrupción.

## Para Claude · conexiones exactas

Estos cambios están descritos para integrar. **No se han editado los archivos protegidos.**

1. En 71, dentro de `lanzar`, sustituir la construcción actual de `p.op` por:

```js
op: { vertical: true, romper: false, romperSombra: false, ...F.op, peso: F.peso }
```

Conserva los valores de arco/luz cuando `F.op` no existe. 74 ya entrega la ficha con `op`. No añadir un motor alternativo ni envolver globalmente `Impacto`.

2. En 70, para la llamada a `Sombras.golpear`, sustituir el argumento de opciones por este objeto. Mantener el resto de la llamada y su daño actual:

```js
{ ...op, origen: { x: o.x, y: o.y, z: o.z }, peso, empuje,
  romper: op.romperSombra !== undefined ? op.romperSombra : op.romper,
  contra: op.contra }
```

En `Duelo`, `LumiEnlaces`, `DueloLuna` y `Jefes`, reenviar igualmente `...op` y `origen` antes de las opciones ya normalizadas. No aplicar los estados de control a los jefes por este mero reenvío. La fauna conserva su calma con peso/empuje; no añadirle quemadura, sujeción o estados de combate nuevos.

Oclusión: antes de cobrar daño/estados en cada receptor, si `op.ocluir && op.origen`, comprobar el segmento desde ese punto hasta el punto alcanzable del cuerpo con `Sol.dentro`, paso máximo 0,12 m y radio 0,06 m. No limitarse a comprobar el centro de la zona: sus radios pueden abarcar una pared. Integrar también la altura existente para las aladas y la superficie del terreno entre ambos puntos. Una oclusión fallida descarta el contacto completo; nunca deja pasar su estado. Esta parte no está cubierta por la proyección de dos cambios de la prueba.

3. En 35 y los receptores de jefes, aplicar las propiedades de la tabla. Daño ×resistencia una sola vez, antes de sus reglas de equilibrio. `romper` no salta el periodo protegido. Jefes no se congelan ni se desplazan; comunes y élites respetan tope de lenta y espera de sujeción. Eliminar estados al romperse/retirarse/reiniciar un enemigo. Si la implementación de variantes prefiere un contrato ya acordado diferente, adaptar ambos extremos antes de integrar.

4. En 07 `ITEMS`, fichas propuestas exactas; los iconos ya existen en 28:

```js
escuela_viento: { nom: 'Escuela de viento', tipo: 'arma', estilo: 'viento', dmg: 0, alc: 0, vel: 1, ic: 'pluma', desc: 'Cortes lejanos para moverte y abrir espacio.' },
escuela_brasa: { nom: 'Escuela de brasa', tipo: 'arma', estilo: 'brasa', dmg: 0, alc: 0, vel: 1, ic: 'llama', desc: 'Calor que permanece sobre el suelo.' },
escuela_escarcha: { nom: 'Escuela de escarcha', tipo: 'arma', estilo: 'escarcha', dmg: 0, alc: 0, vel: 1, ic: 'copo', desc: 'Frena el avance y presiona las guardias.' },
escuela_oscuridad: { nom: 'Escuela de oscuridad', tipo: 'arma', estilo: 'oscuridad', dmg: 0, alc: 0, vel: 1, ic: 'nucleo', desc: 'Tinta contenida con un coste de luz y vida.' },
```

No añadirlas a `DONES`: los dones pequeños de guardianes siguen siendo pasivos separados. Guardar la concesión en inventario, no en un contador que multiplique potencia por escuelas aprendidas. Oscuridad se concede con silencio aunque haya otro estilo equipado.

5. En 21, sustituir `estiloDe` por una tabla explícita para impedir que toda escuela desconocida se convierta en luz:

```js
const estiloDe = () => {
  const it = Sis.arma();
  return it && ({ arco: ArcoLuz, luz: EscuelaLuz, viento: EscuelaViento,
    brasa: EscuelaBrasa, escarcha: EscuelaEscarcha, oscuridad: EscuelaOscuridad })[it.estilo] || null;
};
```

En la construcción de `E` de `entradaEstilo`, añadir `vida: S.hp`. Justo después del descuento de `R.gasta`, añadir:

```js
if (R.gastaVida) { S.hp = Math.max(1, S.hp - R.gastaVida); J.sinDano = 0; }
```

No mandar ese coste por `recibir`/`dañoJugador`: no es un ataque enemigo, no debe esquivarse, bloquearse, multiplicarse por dificultad ni conceder parada. No requiere cambios en `recibir` porque estas escuelas no tienen escudo. Mantener su exclusión de guardia común mientras `ocupado(M)` es verdadero.

Añadir los cuatro módulos a `crear`, `actualizar` y `reiniciar` de Combate y a la precompilación de muestras de 10. Incluir las cuatro fichas en la rotación de equipamiento: `'escuela_viento', 'escuela_brasa', 'escuela_escarcha', 'escuela_oscuridad'`. Conservar `Sis.equipar` como única puerta y el bloqueo de cambio en combate. No mezclar arma y escuela.

6. En 20/17, enlazar `modelo()` de cada escuela a la misma palma usada por luz y ocultar el equipo anterior. Poses que emite 74, texto exacto:

```text
viento_normal, viento_area, viento_paso, viento_cargado, viento_canaliza
brasa_normal, brasa_area, brasa_paso, brasa_cargado, brasa_canaliza
escarcha_normal, escarcha_area, escarcha_paso, escarcha_cargado, escarcha_canaliza
oscuridad_normal, oscuridad_area, oscuridad_paso, oscuridad_cargado, oscuridad_canaliza
```

Dirección: viento abre palma y mantiene pasos laterales; brasa baja palma hacia el centro elegido; escarcha extiende dedos y adelanta la mano al quebrar; oscuridad recoge el trazo hacia el pecho y lo suelta sin cambiar máscara, voz o voluntad. `pose.k` recorre todo A/Ac/R; canaliza usa carga normalizada. Añadir las poses a la tabla de estilos actual; no inventar un `ARMAS[id]` con combo de espada para estas fichas. Cada sello usa dos mallas de mano, con tinta gris oscura y brasa roja central en oscuridad.

7. En 59/60/63, integrar las cuatro adquisiciones propuestas, sus concesiones únicas y la reconciliación al cargar. Las propuestas de escena son contenido nuevo del encargo, no declaraciones de que ya ocurren en el canon escrito. La herencia de oscuridad sí está autorizada; no volver a pedir su fundamento narrativo. Mantener el rótulo fuera del rescate y de `c5_despues`. Actualizar README/documentación y coordinación durante la integración: estos archivos no estaban autorizados en la copia.

## Verificación y pendientes

Ejecutado sin navegador: `node --check js/74-escuelas-magia.js`, `node --check herramientas/probar-escuelas-magia.mjs`, `node herramientas/probar-escuelas-magia.mjs`. Resultado: **61/61**. Regresión de arco/luz: `node herramientas/probar-estilos.mjs`, **42/42**. La prueba nueva ejecuta 71 real con dobles de objetivos; también usa 70 real para perforación y diagnóstico de contrato. No importa paquetes ni cambia archivos al probar. Se ejecuta desde cualquier carpeta.

Comprueba los 16 costes y daños, máximo de pulsos, registro de un contacto por objetivo/ataque o por pulso, multiplicador capturado, sin luz, carga corta/larga, pérdida de luz al cargar, cancelaciones, prioridad de esquiva, búfer caducado, limpieza completa, altura, alcance, pared fina y suelo tapado. Prueba pasos de 8,3 / 16,7 / 33,3 / 50 ms. Dobles gráficos comprueban creación única y muestras en alta, media y baja; **no equivalen a renderizar ni medir esas calidades**.

La prueba muestra explícitamente la pérdida de metadatos de los 70/71 originales. Otra prueba proyecta **solo en memoria** los dos cambios de reenvío para comprobar que llegan a Sombras. No se han modificado 70/71 en disco. Ese ensayo no prueba las resistencias, estados, oclusión radial, escenas, modelo de mano integrado, FPS, teclado ni mando en el juego completo. Al integrar el contrato real, el diagnóstico acepta su transmisión y deja de afirmar la pérdida.

Se intentó además ejecutar `probar-impacto.mjs`; su importación falló por ausencia de `playwright-core`, antes de iniciar las pruebas o un navegador. No se instaló esa dependencia ni se abrió Edge. La lógica real de 70 se comprobó mediante el contexto VM de la batería nueva y la de estilos, sin usar esa herramienta de navegador.

Pendiente para Claude: conexiones enumeradas; variantes y estados; oclusión por objetivo; poses finales y adquisición; integrar los costes antes de resolver impactos. Pendiente tras integración: probar todos los jefes con cada escuela y medir contrapesos +25–60 %; validar teclado/mando, captura visual y 60 FPS con seis enemigos, doce proyectiles y una zona. No se abrió Edge ni se modificó el ZIP.

**Archivos tocados:** `js/74-escuelas-magia.js` (nuevo), `herramientas/probar-escuelas-magia.mjs` (nuevo), esta entrega (nueva) e `index.html` (una inclusión). Ningún otro archivo.

**Decisiones tomadas:** fábrica común de escuelas; un aro persistente por estilo; vuelos exclusivos de TallerLuz; todos los movimientos con coste de luz; oscuridad con esfuerzo mixto no letal; sin escudos adicionales; resistencia de referencia entre 25 y 30 % y aberturas para vencer con el mismo estilo. Las adquisiciones son propuestas dirigidas para los capítulos ya autorizados.

**Preguntas abiertas:** ninguna bloquea esta entrega. Quedan la revisión narrativa de las puestas en escena por Claude y la valoración del usuario después de la integración. No se añade una pregunta de canon sobre el origen de oscuridad ya resuelta por el encargo.
