# Capítulo 3 · Los nombres bajo la arena

**Fecha:** 2026-11-02. **Entrega editorial para Claude.** Sin implementación.

**Entrada:** el capítulo 2 acaba enviando a Hikari a Duna. Conserva Pétalo y Marea: `frag[0]` y `frag[2]`. Se abre Duna con oasis y pirámides. Kiri, mar y ascensos posteriores siguen cerrados por capítulo. Tsuru vive y conserva su farol.

**Dependencia del capítulo 2:** confirmar enlace final, posición, copias y pistas previas de Lumi. Sayo es la madre de Nao; Rui es el hijo perdido de Kaito. Permanecen en su capítulo.

**Fuentes:** `AGENTS.md`, `COORDINACION.md`, `PLAN_FUSION.md`; `PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md`, reglas 1–27 y §§4–11; `PERSONAJES.md`; entregas del 2/11 del capítulo 1 y auditoría del piloto. Signos según Coordinación. Módulos leídos: `js/07-sistemas.js`, `js/26-guion.js`, `js/11-jefes.js`, `js/33-santuarios.js`.

## 1. Escaleta

**55 minutos objetivo**, pendientes de medir. Incluyen navegación, observación y lectura libre. No exigen esperas ni derrotas. Una campaña, solo subtítulos, sin voz ni habla silabeada. Koto y flauta; capa propia de combate.

| Secuencia | Objetivo del jugador | Lugar | Sistema reutilizado | Min |
|---|---|---|---|---:|
| C3A · Llegar con preguntas | Alcanzar el oasis y localizar el archivo | Camino y campamento del oasis | `LUGARES`, navegación (`07`); campamento (`33`) | 6 |
| C3B · Dos nombres | Comparar signos, leer registros y copiar el esquema | Terraza exterior del santuario | Lectura de murales (`04`, `26`); conversaciones y diario (`07`) | 12 |
| C3C · Tres alturas | Reunir tres glifos y llevarlos a las columnas | Pirámides y arena | `Estr.piramides` (`33`); recogida y columnas (`11`) | 10 |
| C3D · Soltar al guardián | Romper cadenas, purificar y canalizar | Arena de las Dunas | `JEFES.arena`, puntos débiles y punto de luz (`11`) | 10 |
| C3E · La tercera memoria | Resolver los seis orbes y tocar el fragmento | Santuario y pirámides | `RETO.duna`, altar y memoria (`07`, `09`) | 8 |
| C3F · Llevar las pruebas | Volver a Hinode y preparar consulta a Kaito | Camino, patio de Tsuru | Navegación, conversación y misión (`07`) | 9 |
| **Total** | | | | **55** |

**Montaje:** cuatro conversaciones: oasis, archivo, fragmento y regreso. Archivo nuevo en atriles exteriores accesibles, siempre consultables; sin entrar en el templo sólido.

Se pueden rodear las Sombras. Cada pirámide conserva escalera y glifo; las tres columnas despiertan al gólem. Conserva garras, tormenta, lluvia y movedizas. El haz rompe cadenas y alcanza el núcleo expuesto. Ajustar dificultad al progreso real; nivel 6 es la recomendación antigua.

**Adaptaciones necesarias:** habilitar sistemas por capítulo. Conservar seis orbes y 100 s; el sexto habilita el fragmento, sin ejecutar `fragmento(1)`. Integración por contacto. Reintentar conserva documentos, columnas y purificación. El archivo no depende del combate. Reconciliar hallazgos fuera de orden.

## 2. Qué aprende el jugador

| Idea | Líneas obligatorias |
|---|---|
| Dorada y Roja son entidades distintas; la Roja usurpó a la original | CDA01–09 |
| La ofrenda sostiene la apariencia robada; la Dorada sigue cautiva | CDA07–11 |
| Tasogare conocía la sustitución y colaboraba en ocultarla | CDA12–16 |
| Una guardiana puede estar sobre una plataforma conectada al faro por cuatro enlaces | CDE01–05 |
| Hay tres fragmentos integrados; toca compartir pruebas y preparar una salida | CDR05–06, CDV01–08 |

Conclusiones obligatorias dichas por personajes. Lumi reconoce la usurpación; dirección fija su decisión de seguir informando. Confiesa en el capítulo 6.

## 3. Guion completo

Avance manual, pausa y repetición. Una línea visible; 1 s de reacción. Lecturas con subtítulos atribuidos. Pistas en ventanas seguras. `{omitir}` conserva pruebas, resumen y consecuencias.

### C3A · Campamento del oasis

Descanso ante el santuario. Farol doméstico, sin vigilancia ni aislamiento mágico.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| CDO01 | Hikari | «Aquí puedo ordenar las copias.» | Al llegar al toldo | Extiende las hojas |
| CDO02 | Hikari | «Busco el signo del mural. Quiero saber a quién representa.» | Ante la copia | Recorre el disco con un dedo |
| CDO03 | Lumi | «En el santuario hay más registros. Podemos compararlos.» | Respuesta | Señala la terraza |
| CDO04 | Hikari | «Llevaremos también lo que encontremos aquí.» | Cierre | Guarda las hojas |
| CDO05 | Interfaz | «Consultar el archivo · {interactuar}» | Ante el primer atril | Sin exigir el farol de Tsuru |

### C3B · Archivo de Duna

**Puesta en escena:** registro anterior de devolución ambiental, protocolo bajo el sello actual y esquema. Desarrollan hechos canónicos, sin fechas, autores o víctimas nuevos. Documentos independientes de la red. Lumi examina cada pieza.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| CDA01 | Hikari | «Este disco completo tiene un conejo. Debajo dice “Luna Dorada”.» | Primer documento | Alinea la copia del Pétalo |
| CDA02 | Hikari | «“Guardiana original. Devolución de energía del entorno cada doce años”.» | Sigue leyendo | Detiene el dedo en la entrada |
| CDA03 | Hikari | «“Sin extracción de núcleos personales”.» | Misma página | Mira a Lumi |
| CDA04 | Lumi | «Esa ceremonia no necesitaba víctimas.» | Comparación obligatoria | Se acerca al siguiente documento |
| CDA05 | Hikari | «Aquí está la media luna cortada. Tiene la misma grieta que el sello actual.» | Segundo documento | Pone ambas copias juntas |
| CDA06 | Hikari | «La entrada la llama “Luna Roja”.» | Bajo el signo | Pausa de 2 s |
| CDA07 | Hikari | «“Mantener cautivo el núcleo de la Dorada. Su vínculo permite operar el faro”.» | Protocolo | Sigue la línea hasta el final |
| CDA08 | Hikari | «“Usar luz infantil para sostener la apariencia dorada de la Roja”.» | Entrada siguiente | Aparta despacio la mano |
| CDA09 | Lumi | «La Roja ocupó el lugar de la Dorada. Son dos seres distintos.» | Tras examinar ambas piezas | Halo bajo; respuesta consciente |
| CDA10 | Hikari | «Se presentaba como nuestra protectora con la luz que robaba.» | Conclusión | Mira el sello actual |
| CDA11 | Lumi | «Y mantiene a la Dorada cautiva para usar su vínculo.» | Confirmación | No promete una liberación inmediata |
| CDA12 | Hikari | «Hay una instrucción del guardián Tasogare.» | Margen del protocolo | Acerca la página |
| CDA13 | Hikari | «“Ocultar los registros de la sustitución. Mantener las entregas”.» | Lectura obligatoria | Sostiene el borde con ambas manos |
| CDA14 | Hikari | «Lo sabía. Ayudó a mantener el engaño.» | Conclusión | Deja el documento sobre el atril |
| CDA15 | Lumi | «Después rompió el rito.» | Respuesta | Mira hacia el faro |
| CDA16 | Hikari | «Eso no borra a quienes llevó antes.» | Tras 2 s | Vuelve a las copias de los nombres |
| CDA17 | Hikari | «Guardaré estas pruebas junto a los nombres de los niños.» | Cierre del registro | Copia texto y signos |

**Esquema obligatorio:** guardiana completa, pies sobre plataforma y cuatro conexiones al faro. Ubicación exacta de la cautiva, efectos de encarnar y vulnerabilidades reservados para Kiri y el final.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| CDE01 | Hikari | «La guardiana tiene los pies sobre una plataforma.» | Tercera pieza | Señala los apoyos |
| CDE02 | Lumi | «Hay cuatro conexiones entre ella y el faro.» | Sigue cada trazo | Las recorre una por una |
| CDE03 | Hikari | «Entonces puede tomar forma aquí abajo.» | Al ver la figura completa | Mira la escala de la plataforma |
| CDE04 | Lumi | «El esquema muestra esa posibilidad. No explica cómo detenerla.» | Respuesta | No anticipa la solución de Kiri |
| CDE05 | Hikari | «Copiaré también las cuatro conexiones.» | Cierre de lectura | Guarda el esquema |
| CDE06 | Hikari | «El guardián de arena sigue encadenado. Quiero soltarlo.» | Desde la terraza | Mira hacia la arena |
| CDE07 | Lumi | «Los glifos están en las tres pirámides. Encajan en sus columnas.» | Antes de salir | Señala las cimas |

**Dirección reservada de Lumi:** CDA09–11 son sinceras. Sigue informando por la independencia prometida y porque cree poder negociar después. Sin posesión. Hikari mira la escalera; Lumi transmite fuera de su vista. Solo se muestra una contracción del halo. Informa del hallazgo, sin entregar cuatro firmas ni reactivar la red. Ningún Vigía presencia la conversación. Guardar esta decisión incluso al omitir. Confesión en el capítulo 6.

### C3C–D · Pirámides y Gólem de Arena

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| CDG01 | Lumi | «Puedes subir por las escaleras. Desde arriba verás las otras pirámides.» | Primera base | Señala un recorrido caminable |
| CDG02 | Hikari | «Es un Glifo del Sol.» | Primera recogida | Lo levanta y guarda |
| CDG03 | Interfaz | «Colocar un glifo · {interactuar}» | Cada columna libre | Consume uno; confirma 1/3, 2/3, 3/3 |
| CDG04 | Lumi | «La red del faro lo mantiene corrompido.» | Antes de colocar el tercero | Mira las cadenas; peligro detenido |
| CDG05 | Lumi | «Apunta el haz a las dos cadenas.» | Primera oportunidad segura | No tapa el aviso de garras |
| CDG06 | Lumi | «Su núcleo está expuesto. Alcánzalo con el haz.» | Aturdimiento por cadenas rotas | Señala el punto vulnerable |
| CDG07 | Lumi | «La arena cede. Muévete hacia las columnas.» | Primera fase de movedizas | Aviso breve |
| CDG08 | Interfaz | «Canalizar luz · mantén {interactuar}» | Tras purificar | Junto al núcleo |
| CDG09 | Hikari | «Ya puede descansar.» | Tras canalizar | Baja las manos; 2 s |
| CDG10 | Hikari | «Volvamos al altar.» | Al salir | Retoma su búsqueda |

Gólem vivo y en calma. Purificar no concede el fragmento ni restaura Duna. Haz viable sin arma obligatoria.

### C3E · Orbes y tercera memoria

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| CDT01 | Lumi | «El altar enciende seis orbes. Recorre sus luces antes de que se apaguen.» | Antes del intento | Mira la ruta ya explorada |
| CDT02 | Interfaz | «Iniciar recorrido · {interactuar}» | Ante el altar | Marcador: «Orbes 0/6 · 100 s» |
| CDT03 | Lumi | «Se apagaron. Puedes empezar otra vez desde el altar.» | Tiempo agotado | Sin reproche ni pérdida narrativa |
| CDT04 | Lumi | «El fragmento está disponible. Tócalo cuando estés lista.» | Seis orbes reunidos | Espera fuera del altar |
| CDT05 | Interfaz | «Tocar el fragmento · {interactuar}» | Altar habilitado | Adquisición deliberada |
| CDR01 | Hikari | «Otra vez estoy dentro del recuerdo.» | Memoria al contacto | Perspectiva infantil del rito |
| CDR02 | Hikari | «Siento cómo la luz sale de mí.» | Hilo de extracción visible | Mano abierta; sin detalle gráfico |
| CDR03 | Hikari | «El hilo se corta.» | Reutiliza la fractura | Sin apelativo familiar |
| CDR04 | Hikari | «Lo siento como algo que me pasó. Aún me faltan recuerdos.» | Regreso al altar | Mira sus manos; admite la sospecha |
| CDR05 | Hikari | «La arena guarda el tercer fragmento. Ahora está conmigo.» | Integración | Mano al pecho |
| CDR06 | Lumi | «Falta el de Escarcha. El faro sigue roto.» | Cambio regional visible | Sin ordenar restaurarlo |
| CDR07 | Hikari | «Primero llevemos las pruebas a Hinode.» | Cierre | Guarda el diario |

Memoria de 20–30 s: extracción y corte del prólogo. Sin adulto identificable, transformación ni confirmación Hikari/Akari. Luz regional; Velo activo y luna ya roja.

### C3F · Regreso a Hinode

Tsuru y Momo siguen vivas y juntas. El asedio no empieza dentro de esta entrega.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| CDV01 | Hikari | «La Luna Roja sustituyó a la Dorada. La mantiene cautiva.» | Muestra las copias a Tsuru | Las coloca abiertas |
| CDV02 | Hikari | «Tasogare lo sabía. Ordenó ocultarlo y mantener las entregas.» | Misma conversación | Señala la instrucción |
| CDV03 | Tsuru | «Dejamos a los niños en sus manos.» | Tras leer | Se sienta; 2 s |
| CDV04 | Momo | «¿Todavía tenemos que obedecerlo?» | Mira a Tsuru | No se acerca al sello |
| CDV05 | Tsuru | «No. Tenemos que protegerlos.» | Respuesta | Ofrece la mano a Momo |
| CDV06 | Hikari | «El esquema conecta una guardiana con el faro. Aún no sé cómo romper esa red.» | Muestra la tercera copia | No promete vencerla ya |
| CDV07 | Tsuru | «Habla con Kaito. Necesitamos preparar una salida de la isla.» | Orientación obligatoria | Mira hacia el muelle |
| CDV08 | Hikari | «Iré al muelle. Llevaré las pruebas.» | Cierre | Recupera el control |

## 4. Misión propuesta

**ID:** `c3_duna`. Activación por cierre del capítulo 2. En `ir`/`escena`, señales de salida propuestas; `escena` requiere `cin` nueva. Archivo solicitado con `{interactuar}`.

| Paso | Tipo | Evento o señal | Objetivo visible / bloque |
|---:|---|---|---|
| 1 | `ir` | `c3:oasis_alcanzado` | «Llega al campamento del oasis.» |
| 2 | `escena` | `c3:busqueda_acordada` | «Ordena las copias junto al toldo.» C3A |
| 3 | `escena` | `c3:archivo_contrastado` | «Consulta el archivo de Duna ({interactuar}).» C3B completo |
| 4 | `ev` | `jefe:arena:items` | «Reúne los tres glifos en las pirámides.» |
| 5 | `ir` | `c3:arena_alcanzada` | «Lleva los glifos a la arena.» |
| 6 | `ev` | `jefe:arena:pelea` | «Coloca los glifos en las columnas ({interactuar}).» |
| 7 | `ev` | `jefe:arena:purificado` | «Rompe las cadenas y alcanza el núcleo con {haz}.» |
| 8 | `ev` | `jefe:arena:canal` | «Canaliza junto al núcleo: mantén {interactuar}.» |
| 9 | `ir` | `c3:altar_regreso` | «Vuelve al altar de Duna.» |
| 10 | `ev` | `c3:orbes_resueltos` | «Activa el recorrido ({interactuar}) y reúne seis orbes.» |
| 11 | `ev` | `frag:1` | «Toca el fragmento ({interactuar}).» Incluye C3E |
| 12 | `escena` | `c3:pruebas_compartidas` | «Habla con Tsuru en Hinode ({interactuar}).» C3F |

Los cuatro eventos `jefe:arena:*` y `frag:1` existen. `c3:orbes_resueltos` es nuevo. Usar `Jefes.guia` para glifos, columnas y núcleo; ubicaciones existentes del oasis, arena y altar. Salida propuesta: revelar `c4_preparar_salida`, primer evento nuevo `c4:kaito_consultado`: «Habla con Kaito en el muelle ({interactuar}).» El capítulo 4 escribe su respuesta y dispara la Noche Roja.

## 5. Continuidad guardada

- Clave única `ecos3_luna_partida`: capítulo, misión, paso, conversación y línea pendientes. Regiones abiertas conservadas; ninguna recompensa duplicada al repetir.
- Copias de signos, protocolo, instrucción de Tasogare y esquema. Diario separa usurpación probada, posibilidad de encarnar e identidad personal todavía incompleta.
- Estado reservado: Lumi conoce la usurpación y elige seguir informando; transmisión de Duna concluida. Hikari no conoce esa decisión. Guardar con el cierre del archivo, incluso al omitir.
- Glifos recogidos, inventario y columnas ocupadas; gólem purificado y canalizado. Reconciliar eventos al cargar y al visitar fuera de orden. Reintentar el combate no borra el archivo.
- Reto completado separado de `frag[1]`. Guardar adquisición y memoria pendiente juntas; emitir `frag:1` al cerrar o saltar la memoria. Un intento activo interrumpido vuelve al altar sin penalización; uno completado no se repite obligatoriamente.
- Fragmentos conservados: Pétalo, Marea y Arena; reactivación regional única. Pruebas compartidas, consulta a Kaito disponible. Tsuru conserva el farol; sin robo, asedio ni liberación lunar anticipados.

## 6. Textos y misiones antiguas

| Fuente | Sustitución o retirada propuesta para Claude |
|---|---|
| `07`: MIS `duna` | Sustituir por `c3_duna`; separar orbes de `frag:1`. Mostrar «Fragmento de la Arena»; conservar índice 1. |
| `11`: MIS generada `g_arena` | Integrar sus cuatro pasos en C3. Evitar doble misión/recompensa; conservar recogida, columnas, combate y canalización. |
| `07`: `nocheRoja`, `laVerdad`, `guardian` | Retirar disparadores automáticos por dos/tres fragmentos y su cadena. El asedio pasa al capítulo 4; esta entrega sustituye la llamada al muelle tras el tercero. |
| `26`: `verdad`, `tasogare.mirador` | No ejecutar esos diálogos heredados al salir de Duna. CDV entrega pruebas sin parentesco ni encuentro prematuro. |
| `26`: `fragmentos[1]`, `jefes.arena`, `vision[2]` | Reemplazar por CDR, CDG09 y CDT. Retirar familias solares como explicación de la memoria y la promesa automática de restauración. |
| `26`: `murales[6]`, `muralesOcultos[6]`; MIS `murales`/`callan` | El archivo y esquema se leen sin farol y son obligatorios. Colecciones opcionales pueden registrar la visita; nunca sustituir esta lectura. No conservar aquí el sabio que cuenta escalones como única prueba. |

El eco `quiebre` de `26` conserva su ubicación del Mirador para su adaptación posterior: Tasogare conduce a otro niño, según `PERSONAJES`. No se traslada a Duna ni revela paternidad. La forja Solar, la Ofrenda y el renacer permanecen retirados según `PLAN_FUSION`.

## 7. Cierre

**Archivos tocados:** creado únicamente `docs/entregas_chatgpt/2026-11-02_capitulo3_duna.md`.

**Decisiones tomadas:** 55 minutos objetivo; archivo exterior obligatorio; signos ya decididos; reutilización de pirámides, gólem y orbes; integración por contacto. Lumi comprueba y continúa voluntariamente su espionaje. Se reserva el parentesco de Tasogare por orden expresa del encargo, aunque el cuadro de revelaciones del canon permite adelantarlo en Marea/Duna.

**Preguntas abiertas reales — Pregunta para el usuario:** ninguna nueva de canon. **Dependencias para Claude:** confirmar enlace de salida del capítulo 2 y contenido previo de sus pistas de Lumi; medir recorrido, lectura y dificultad. La vulnerabilidad de la encarnación queda para Kiri.
