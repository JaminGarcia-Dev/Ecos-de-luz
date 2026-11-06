# Capítulo 7 · La luz que ya no se entrega / Epílogo jugable

**Fecha:** 2026-11-02. **Entrega editorial para Claude. Sin implementación.**

**Entrada y dependencias del capítulo 6:** identidad Hikari/Akari recuperada; cuatro fragmentos integrados y conservados; registro de Kiri leído; traición confesada; tres enlaces de control de Lumi rotos. La red reactivada sigue operativa: liberarla a ella no desactiva el faro. Tasogare y Tsuru han muerto; Momo está rescatada. Claude debe enlazar estos estados y la salida de Kiri, sin inventar eventos ya implementados.

**Fuentes:** `AGENTS.md`, `COORDINACION.md`, `PLAN_FUSION.md`; `PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md`, reglas 1–27 y §§4–11, especialmente 7–10; `PERSONAJES.md`; `PARTE_2_GUION_DETALLADO_DEL_INICIO.md`; entregas `2026-11-02_capitulo1_petalo.md` a `2026-11-02_capitulo4_isla.md`. Prevalecen las decisiones posteriores de Claude: Sayo solo vio la luz desde la orilla; isla **Yoake**; Hayase: Ren y su hija Sora; Mori: Aiko, su madre y Taku; Chiyo en la casa común. Sustituyen aquí las denominaciones provisionales del capítulo 4.

## 1. Escaleta y sistemas contrastados

**65 minutos objetivo, incluido el epílogo.** Pendientes de medir; sin esperas ni derrotas obligatorias.

| Secuencia | Minutos | Juego y lugar | Reutilización leída |
|---|---|---|---|
| C7A · Elegir el destino | 0–5 | Reagruparse al pie del faro; contrastar Duna y Kiri | Misiones, diario y conversaciones de `js/07-sistemas.js` |
| C7B · Un corredor para todos | 5–16 | Abrir plaza y salida costera; confirmar evacuación | Dos oleadas de `ASEDIOS.asalto`, `js/37-asedio.js`; Sombras de `js/35-sombras.js` |
| C7C · Bajo la corona | 16–22 | Ascender por la espiral existente; reconocer prisión e invertir conducto | Estructura usada por `js/44-duelo-gigante.js`; escenas de `js/09-cinematica.js` |
| C7D · La ocupante desciende | 22–26 | Ver encarnación y reconocer cuatro anclajes | Cielo de `js/40-tormenta.js`; plataforma de `44` |
| C7E · Tres etapas | 26–44 | Anclajes: 7 min; cuerpo: 6; máscara rota: 5 | Haz, brazos, marcas y barra de `44`; combate de `js/21-combate.js` |
| C7F · Abrir, después de vencer | 44–50 | Canalizar; Lumi abre salida; liberar Dorada y reserva | Interacción canalizada de `44`; cámara de `09` |
| EP7 · Volver a decidir | 50–65 | Hinode, señal del faro, travesía y Yoake | `MIS`, viajes y guardado de `07`; ruta del capítulo 4; regiones de `js/49-campana.js` |

**Adaptación para Claude:** `44` proporciona cuatro puntos que acumulan haz, barrido, lluvia y canalización. Actualmente carece de combate corporal lunar. Requiere cuerpo completo de unos cinco metros, colisiones, resistencia, fijación y recepción de golpes nuevos, conectados a `21`. Conservar herramientas previas; sin forja Solar obligatoria.

`40` liga su cielo a `MIS.alba`: asociarlo al tramo de encarnación/liberación de esta misión. Rayos ambientales sin daño. Reducir destellos y truenos durante avisos. El disco de radio 7 de `44` es punto de partida; ampliar si las pruebas no dejan corredores seguros. Espiral transitable, sin reactivar duelos de Tasogare.

## 2. Qué aprende el jugador

| Hecho obligatorio | Líneas |
|---|---|
| Duna muestra cuatro conexiones; Kiri explica la vulnerabilidad al encarnar | C7A01–04 |
| Evacuar y cortar anclajes impide nuevas extracciones; la reserva ya estaba retenida | C7A05–07, C7D02, C7G04 |
| Hikari conserva su identidad y responde por sus actos sin aceptar otra víctima | C7G05–07, EP7M03–05 |
| Lumi eligió informar; reparar le cuesta su acceso y su forma anterior | C7A08–09, C7F01–04 |
| Dorada libre, muertos ausentes, Velo abierto y faro comunitario | C7F05–10, EP7T01–03, EP7Y01–04 |

Todos se dicen en la ruta principal. Ninguna pregunta opcional contiene un hecho esencial.

## 3. Guion completo

Solo subtítulos. Koto, flauta y capa de combate. Una línea visible; avance manual, pausa y repetición. Preparar gesto y dejar reacción. Hablar durante combate solo en recuperación segura. Pausar detiene amenazas y actuación; adaptar temporizadores pendientes de `09`/`40`. `{omitir}` resuelve conversación y resumen, nunca combate ni interacciones pendientes. Sin sangre ni heridas; desapariciones en luz.

### C7A–B · La comunidad abre el paso

Yuki reúne a quienes quedaron en Hinode tras coberturas ajenas a emisores. Kaito espera en la costa. Momo permanece con Yuki; Sayo sigue en Yoake. Taiyō aporta documentos y llaves, sin sustituir al jugador.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C7A01 | Hikari | «Duna mostraba una figura sobre la plataforma. Tenía cuatro conexiones al faro.» | Ante las copias | Recorre el esquema |
| C7A02 | Hikari | «Kiri explica que encarnar concentra su reserva. Así podemos alcanzarla.» | Misma charla | Abre el registro |
| C7A03 | Taiyō | «La Dorada está cautiva bajo la corona. Su núcleo reconoce el faro.» | Antes de subir | Entrega acceso |
| C7A04 | Hikari | «Invertiré el conducto para liberar la luz. La Roja intentará impedirlo.» | Decisión | Guarda copias |
| C7A05 | Yuki | «Primero abrimos la salida. Los niños irán conmigo hasta Kaito.» | Señala corredor | Organiza adultos |
| C7A06 | Lumi | «Puede extraer por los enlaces activos. Manténganse lejos de los emisores.» | Antes del peligro | Señala sus haces |
| C7A07 | Yuki | «Los llevaremos por detrás de las coberturas.» | Respuesta | Comprueba ruta |
| C7A08 | Lumi | «Yo elegí seguir informando. Quiero ayudar a abrir la salida de la luz.» | Antes de separarse | Halo bajo |
| C7A09 | Hikari | «Puedes ayudar. Todavía tendremos que hablar de lo que hiciste.» | Respuesta | No ofrece absolución |
| C7B01 | Yuki | «Yo mantendré este paso. Despeja la plaza.» | Primera oleada | Pulso ambiental |
| C7B02 | Yuki | «El primer grupo ya pasó. Falta abrir el corredor de la costa.» | Entre oleadas | Confirma tránsito |
| C7B03 | Interfaz | «Abrir corredor · oleada {n}/{m}» | Combate | Marcador único |
| C7B04 | Kaito | «Todos los niños de este grupo están a cubierto. Momo también.» | Hikari confirma en costa | Cuenta con Yuki |
| C7B05 | Yuki | «Seguiremos evacuando a las familias. Puedes subir.» | Cierre obligatorio | Mantiene guardia |

**Combate comunitario:** conservar las dos composiciones de `ASEDIOS.asalto`: tres rastreras y un escudo; después tres rastreras, un escudo y dos lanzadoras. Primera oleada libera plaza; segunda libera corredor. Adaptar posiciones de aparición para no brotar entre refugiados. Reutilizar pulso de Yuki de la ficha `asedio`, trasladado al corredor.

Rastrera avisa al agacharse; evitar salto y golpear al recuperar. Escudo alza farol; rodear o romper guardia con herramientas disponibles. Lanzadora reúne esquirlas; esquivar o devolver con parada. Conservar avisos de `35`. Refugiados esperan en cobertura hasta despejar el tramo: sin barras de vida, muertes por tardar ni escolta expuesta. `asaltoFin` abre paso; confirmar llegada segura requiere C7B04–05. No se afirma evacuar toda la isla en una barca.

### C7C–D · La reserva toma cuerpo

El conejo aparece una vez junto al acceso bajo la corona. Reconoce la entrada y se desvanece; no activa mecanismos. Hikari accede al conducto y lo invierte. La Dorada permanece encerrada. La reserva converge en pies, manos y torso de la Roja sobre la plataforma; su peso y contacto se ven antes del primer ataque.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C7C01 | Hikari | «El conejo está junto a esa entrada.» | Descanso del ascenso | Mira acceso |
| C7C02 | Lumi | «Es la memoria de la Dorada que salió durante la fractura.» | Ante prisión | Reconoce señal |
| C7C03 | Hikari | «Aquí sigue cautiva. Voy a abrir el conducto hacia afuera.» | Antes de actuar | Mano al mecanismo |
| C7C04 | Interfaz | «Invertir el conducto · {interactuar}» | Acceso habilitado | Acción deliberada |
| C7D01 | Luna Roja | «Esa luz me pertenece.» | Encarnación | Cierra las manos |
| C7D02 | Lumi | «Está reuniendo la reserva retenida en su cuerpo.» | Forma completa | Mira cuatro uniones |
| C7D03 | Hikari | «Los cuatro anclajes la protegen. Los cortaré primero.» | Antes de luchar | Identifica destinos |
| C7D04 | Lumi | «Abre cada cubierta con el haz. Después golpea la unión.» | Ventana inicial | Señala anclaje bajo |

### C7E · Combate obligatorio

Máscara nacarada y oro robado, grietas rojas, disco incompleto y mantos de medias lunas duras. Cámara permite ver manos, suelo y rutas seguras. Pies y cuerpo tienen alcance y colisiones reales. Los anclajes están en bases alcanzables con armas, numerados y diferenciados por forma, además de color.

| Etapa | Enemigo y avisos | Jugador y condición de salida |
|---|---|---|
| 1 · El descenso | Barrera corporal; alterna barrido, lluvia y extracción. Anclaje abierto muestra junta blanca y sonido de cristal | Haz acumulable abre cubierta; golpe corta unión. Cuatro cortes, en cualquier orden. Cada corte cancela su ramal de extracción. Barrera cae al cuarto; sin canalización |
| 2 · El cuerpo que exige | Manos y arcos; tras impacto fallido baja torso al alcance. Resistencia visible | Combatir con armas, aprovechar recuperación y paradas. Agotar resistencia corporal rompe máscara; sin pérdida de controles ni poderes |
| 3 · Lo que queda bajo el brillo | Máscara rota deja ver a la usurpadora. Alterna cierre de salida y golpes finales; no regenera anclajes | Interrumpir cierre con golpe cargado o varios golpes normales; dañar núcleo expuesto mediante combate. Agotar resistencia final gana; después se habilita canalización |

**Ataques propuestos:** tiempos de prueba, no valores definitivos. Un ataque peligroso cada vez; ningún patrón cubre toda la plataforma. Marcas blancas con contorno oscuro, formas distintas y sonido propio; cielo rojo detrás. Ventana de castigo significa oportunidad de atacar.

| Nombre / etapa | Aviso visual y sonoro | Ventana de castigo | Cómo se evita |
|---|---|---|---|
| Barrido del manto / 1–3 | Brazo atrás; banda baja, 1,8 s; roce grave y latido | 2,5 s; mano baja, anclaje accesible | {saltar} sobre banda o {esquivar} fuera del arco; no bloquear |
| Lluvia retenida / 1, 3 | Círculos fijos, 1,5 s; tintineo descendente | 3 s tras último impacto | Salir de círculos; no persiguen después del aviso |
| Zona de extracción / 1 | Rombo rayado conectado a anclaje, 2 s; succión creciente | 3 s; cubierta estable para {haz} | Abandonar rombo; solo drena medidor ambiental de Hikari |
| Mano que exige / 2–3 | Palma alzada; rectángulo, 1,6 s; dos golpes graves | 3 s; torso inclinado | {esquivar} lateral; {guardia} frontal reduce daño |
| Arco retenido / 2 | Manto abierto; media luna vertical, 1,5 s; silbido agudo | 2,5 s; parada añade tambaleo | Esquivar lateral o parada con {guardia}; conecta respuesta nueva a `21` |
| Cerrar la salida / 3 | Dos manos hacia núcleo; barras convergentes, 3 s; tres pulsos | Interrupción abre núcleo 4 s | Golpear manos para interrumpir; si falla, salir de franja central. Repite sin consumir víctimas ni provocar derrota automática |

Mantener recarga ambiental entre oportunidades; haz acumulable sin exigir una reserva completa. Daño y resistencias se ajustan a equipo real. No obligar a una habilidad opcional. En etapa 3 siempre hay ventanas de golpes normales.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C7G01 | Interfaz | «Anclajes cortados · {n}/4» | Etapa 1 | Progreso persistente |
| C7G02 | Hikari | «La cubierta está abierta. Ahora puedo cortarlo.» | Primera apertura segura | Mira junta |
| C7G03 | Hikari | «Cayó la barrera. Puedo alcanzarla.» | Transición a 2 | Arma preparada |
| C7G04 | Lumi | «Los cuatro ramales están cortados. Ya no alcanzan a los niños.» | Transición segura | Mira bases apagadas |
| C7G05 | Luna Roja | «Mataste a tu padre. ¿Todavía te crees digna?» | Recuperación en 2 | Intenta someterla |
| C7G06 | Hikari | «Era mi padre. Iba a matar a Momo.» | Respuesta segura | Mantiene posición |
| C7G07 | Hikari | «Ella tenía derecho a vivir.» | Antes del siguiente patrón | Afirma decisión |
| C7G08 | Luna Roja | «¡No abrirás mi reserva!» | Máscara rota | Cubre núcleo |
| C7G09 | Hikari | «Está cerrando la salida. Sus manos dejan el núcleo expuesto al caer.» | Primer cierre | Observa recuperación |
| C7G10 | Hikari | «Ya no puede luchar. Falta liberar lo que retuvo.» | Victoria física | Baja arma |

### C7F · La luz sale

Último golpe deshace el cuerpo. La reserva queda en el mecanismo expuesto, sin otra voluntad fugitiva. Solo ahora canalizar tres segundos corta el núcleo de extracción. Lumi abre la salida de la reserva; se rompen las sujeciones de la Dorada. Tormenta y proyección se disipan; Velo abierto. Sin intervención de la Dorada durante la lucha.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C7F01 | Lumi | «Abriré la salida mientras cortas el núcleo de extracción.» | Tras vencer | Se acerca al cierre |
| C7F02 | Lumi | «Perderé el acceso a la red. Mi forma quedará reducida.» | Antes de actuar | Aleteo firme |
| C7F03 | Interfaz | «Liberar la reserva · mantén {interactuar}» | Sin ataques | Canalización posterior |
| C7F04 | Hikari | «Lumi sigue viva. Ahora es una luciérnaga.» | Salida abierta | Le ofrece apoyo |
| C7F05 | Luna Dorada | «Mi hermana me mantuvo cautiva. Has roto su prisión.» | Ya libre | Manos abiertas |
| C7F06 | Hikari | «¿Y quienes murieron?» | Ante luz liberada | Mira farol |
| C7F07 | Luna Dorada | «No puedo devolverles la vida. La luz liberada vuelve al mundo.» | Respuesta | Deja silencio |
| C7F08 | Hikari | «La Roja perdió su cuerpo y su red. Ya no puede volver a exigir vidas.» | Cierre | Mira mecanismo apagado |
| C7F09 | Luna Dorada | «Mi libertad no les exige otra ofrenda. Ustedes decidirán cómo cuidar el faro.» | Despedida | Se aparta del paso |
| C7F10 | Hikari | «El Velo se está abriendo. Podemos volver con los demás.» | Horizonte despejado | Recupera control |

## 4. Epílogo jugable

Descenso abreviado hasta Hinode, con control restituido. Ruta obligatoria: archivos, protección compartida, señal del faro, muelle y Yoake. Interacciones cambian el mundo; las conversaciones no son un menú opcional. Sin repetir compuerta ni postigo reparados en C4.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| EP7T01 | Taiyō | «Estos son todos los registros. Yo ayudé a justificar las ofrendas.» | Entrega pública | Deposita archivos |
| EP7T02 | Taiyō | «Ya no controlaré el rito ni guardaré sus llaves.» | Misma charla | Suelta llavero |
| EP7T03 | Yuki | «Los registros quedarán abiertos. Habrá quienes te pidan cuentas.» | Hikari abre archivo | No lo absuelve |
| EP7Y01 | Yuki | «Prepararemos rutas y turnos que todos puedan conocer.» | Tablero de Hinode | Invita a participar |
| EP7Y02 | Yuki | «No quiero que Taiyō decida los turnos.» | Ante su propuesta | Expresa desacuerdo |
| EP7Y03 | Hikari | «Dejemos la propuesta a la vista para hablarla entre todos.» | Coloca tablero | No decide por otros |
| EP7Y04 | Yuki | «El faro guiará barcos y guardará memoria. Lo cuidaremos con energía ambiental y trabajo voluntario.» | Señal del faro | Muestra alimentación |
| EP7K01 | Kaito | «Abriremos una ruta a Yoake. Cada familia podrá elegir dónde vivir.» | Muelle | Prepara travesía |
| EP7K02 | Kaito | «Rui murió. Quiero que su nombre quede junto a los demás.» | Copia de nombres | Señala entrada |
| EP7S01 | Sayo | «Esa noche vi la luz del rito desde la orilla. Después no supe nada de Nao.» | Yoake, casa común | Sostiene su copia |
| EP7S02 | Hikari | «Nao murió en la ofrenda. Liberar la luz no puede traerlo de vuelta.» | Conversación obligatoria | Se sienta cerca |
| EP7S03 | Sayo | «Quiero que su nombre quede escrito.» | Tras silencio | Coloca copia |
| EP7R01 | Ren Hayase | «Hay sitio para amarrar. Sora, dejemos libre el paso.» | Embarcadero | Trabaja junto a su hija |
| EP7R02 | Sora Hayase | «Por aquí pueden bajar las provisiones.» | Desembarco | Señala ruta segura |
| EP7R03 | Madre de Aiko | «Aiko y Taku están en los huertos. Allí recibimos los suministros.» | Patio | Indica destino |
| EP7R04 | Aiko Mori | «Deja la cesta junto al canal.» | Entrega jugable | Hace espacio |
| EP7R05 | Taku Mori | «Después iremos a comer con los recién llegados.» | Entrega completa | Mira casa común |
| EP7R06 | Chiyo | «Pueden quedarse a comer. Hay que preparar más sitios.» | Casa común | Ofrece una tarea |
| EP7M01 | Momo | «Quiero poner aquí el nombre de la abuela.» | Mesa de memoria | Elige lugar |
| EP7M02 | Hikari | «Conservamos lo que grabó. Tsuru no está dentro del farol.» | Colocan nombre | No reproduce mensaje nuevo |
| EP7M03 | Hikari | «También extraño a mi padre. Momo, tenías derecho a vivir.» | Tras un silencio | Se queda a su lado |
| EP7M04 | Momo | «¿Te llamo Akari?» | Paseo final | Mira a Hikari |
| EP7M05 | Hikari | «Fui Akari. Soy la misma. Quiero seguir llamándome Hikari.» | Respuesta | Camina a su lado |
| EP7M06 | Hikari | «Lumi, puedes venir. La confianza llevará tiempo.» | Luciérnaga cerca | Deja espacio sin absolver |
| EP7M07 | Interfaz | «Terminar este recorrido · {interactuar}» | Mirador de Yoake | Créditos voluntarios |

Hikari orienta la señal ambiental, abre archivos, coloca propuesta pública, transporta una cesta y prepara un sitio con Chiyo. Los niños rescatados están con sus cuidadores. Amanecer natural, trabajo y duelo conviven. Tras créditos, continuar devuelve a este mundo liberado.

## 5. Misiones propuestas

`ev` consume evento; `ir` comprueba llegada; `escena` requiere conversación nueva en `Cin`. Señales `c7:*`/`ep7:*` nuevas; en `ir/escena` nombran salidas de montaje. Activación por cierre de C6 y dependencias, nunca solo por cuatro fragmentos.

| Misión / paso | Tipo · evento o señal | Objetivo visible |
|---|---|---|
| `c7_luna` / 1 | `escena` · `c7:plan_acordado` | Reúnete al pie del faro ({interactuar}). C7A |
| 2 | `ev` · `asalto`, `empieza:asalto` | Abre la plaza y el corredor. `asaltoFin` → evento `asalto` existente |
| 3 | `escena` · `c7:evacuacion_confirmada` | Confirma con Kaito la llegada de los niños ({interactuar}). |
| 4 | `ir` · `c7:corona_alcanzada` | Sube hasta la corona. |
| 5 | `ev` · `c7:conducto_invertido` | Invierte el conducto ({interactuar}); incluye C7C–D. |
| 6 | `ev` · `c7:anclajes_cortados` | Abre con {haz} y corta con {atacar} los cuatro anclajes. |
| 7 | `ev` · `c7:cuerpo_vencido` | Combate hasta romper la máscara ({atacar}, {esquivar}, {guardia}). |
| 8 | `ev` · `c7:luna_vencida` | Vence los últimos ataques y alcanza el núcleo con {atacar}. |
| 9 | `ev` · `c7:reserva_liberada` | Canaliza después de vencer: mantén {interactuar}. Incluye C7F |
| `ep7_amanecer` / 1 | `ir` · `ep7:hinode_alcanzado` | Vuelve a Hinode. |
| 2 | `ev` · `ep7:archivos_abiertos` | Recibe y abre los archivos ({interactuar}). EP7T |
| 3 | `ev` · `ep7:propuesta_publica` | Coloca la propuesta de turnos ({interactuar}). EP7Y01–03 |
| 4 | `ev` · `ep7:senal_orientada` | Orienta la señal del faro ({interactuar}). EP7Y04 |
| 5 | `ev` · `ep7:yoake_desembarcado` | Viaja con Kaito ({interactuar}). EP7K, EP7R01–03 |
| 6 | `ev` · `ep7:suministros_entregados` | Lleva la cesta a los Mori ({interactuar}). EP7R04–05 |
| 7 | `ev` · `ep7:mesa_preparada` | Prepara un sitio con Chiyo ({interactuar}). EP7R06 |
| 8 | `escena` · `ep7:memoria_compartida` | Acompaña a Sayo y Momo ({interactuar}). EP7S, EP7M01–03 |
| 9 | `escena` · `ep7:nombre_elegido` | Camina con Momo hasta el mirador. EP7M04–06 |
| 10 | `ev` · `ep7:recorrido_cerrado` | Termina el recorrido cuando quieras ({interactuar}). |

## 6. Continuidad guardada

Clave única `ecos3_luna_partida`. Guardar misión, región, línea pendiente, copias, cuatro fragmentos, farol y ausencias definitivas. Mantener obras y habitantes de Yoake; barca y posiciones sin duplicados.

Persistir oleadas completas y evacuación confirmada. Caer o alejarse reinicia solo oleada pendiente, sin nuevas víctimas. Jefe: guardar etapa, anclajes cortados y cubiertas abiertas; reintento restaura inicio de etapa actual, resistencia correspondiente y recursos suficientes. No repetir encarnación ni acusaciones completas. Sin reaparecer Tasogare.

Victoria física se guarda antes de habilitar canalización. Cargar después no reabre combate. Canalización interrumpida reinicia solo sus tres segundos. Liberación guarda conjuntamente núcleo cortado, Dorada libre, Velo abierto, proyección retirada, Lumi luciérnaga y epílogo disponible. Resumen pendiente si se sale durante escena. Repetir no duplica consecuencias.

Guardar cada tarea del epílogo y último desembarco seguro. `final` no puede suprimir sus objetivos: separar victoria lunar de recorrido terminado. Créditos no reinician la campaña ni restauran la red.

## 7. Sustituciones para integración

| Fuente | Retirar o sustituir |
|---|---|
| `07`, `MIS.alba` | Cadena asalto → duelos → cristal, activación por fragmentos y recompensa Solar. Sustituir por las dos misiones propuestas |
| `37`, `ASEDIOS.asalto` | Conservar oleadas; reemplazar textos `GUION.asalto` por evacuación. `asaltoFin` no llama a Tasogare; tampoco recoloca automáticamente a Yuki lejos del grupo |
| `44`, `GUION.duelo.gigante*` en `26` | Retirar absorción de fragmento robado, busto colosal, Tasogare arrodillado y `duelo3Fin` como victoria. Crear progresión lunar de tres etapas; canalización posterior |
| `40` | Cambiar dependencia de `alba`; cielo de encarnación sin desenlace antiguo |
| `07`, interacción `corona`; `26`, `ofrenda`/`final` | Retirar oferta de Taiyō, `Cin.ofrenda`, `Ofrenda.empezar`, renacer y créditos por entregar toda la luz. Sustituir por C7F y EP7; revisar también `npc.*.alba`, incluida la hija falsa de Kaito |
| `49` | Capítulo 7 habilita encuentro lunar y epílogo; regiones abiertas persistentes. Sin bloqueo lunar después de liberar Velo |

No reactivar `forja`, caza obligatoria ni misiones que requieran hablar con fallecidos. Las retiradas son instrucciones de integración, no cambios hechos.

**Archivos tocados:** creado únicamente `docs/entregas_chatgpt/2026-11-02_capitulo7_luna.md`.

**Decisiones tomadas:** 65 minutos con epílogo; evacuación comunitaria; tres etapas obligatorias; canalización posterior; reparación costosa de Lumi; pérdidas permanentes; Yoake con nombres vigentes. Patrones, tareas y guardados son propuestas de producción para Claude.

**Preguntas abiertas reales — Pregunta para el usuario:** ninguna nueva de canon. **Dependencias para Claude:** concretar salida de C6, ajustar combate y medir duración; implementar recepción de golpes lunares y persistencia. No se fijan nuevas capacidades de Lumi tras reducirse.
