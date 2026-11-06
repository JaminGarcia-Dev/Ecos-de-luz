# Capítulo 2 · La orilla de los que faltan

**Fecha:** 2026-11-02. **Entrega editorial para Claude.** Sin implementación.

**Entrada:** termina CPV09 del capítulo 1. Tsuru acaba de enviar a Hikari al muelle de Kaito. Hikari conserva el Pétalo y las copias del registro y los signos. Tsuru conserva su farol.

Fuentes: `AGENTS.md`, `COORDINACION.md`, `PLAN_FUSION.md`, `PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md` (reglas 1–27, §§4–11), `PERSONAJES.md`, `2026-11-02_capitulo1_petalo.md` y `2026-11-02_auditoria_piloto.md`, ambos en `docs/entregas_chatgpt/`. Contrastados `js/07-sistemas.js` y `js/26-guion.js`; módulos debajo. Campaña única, apertura por capítulo y solo subtítulos, sin voz ni habla sintetizada. Koto, flauta y ambiente.

## 1. Escaleta

**55 minutos objetivo**, por medir. Incluyen desplazamientos y lectura manual. Sayo ocupa diez minutos de juego y conversación; sin esperas obligatorias.

| Secuencia | Objetivo del jugador | Lugar | Sistema reutilizado | Min |
|---|---|---|---|---:|
| C2A · Antes de salir | Recuperar la acción del postigo | Patio de Hinode | `53-patio-inicio`, estado de `51-piloto` | 2 |
| C2B · Rui | Consultar a Kaito y observar su eco | Muelle | NPC de `07-sistemas`; `27-ecos` | 7 |
| C2C · Un camino conocido | Volver a Sakura y localizar la gruta | Sendero, entrada existente | Navegación de `02-terreno`; cobertura de `38-cazadores` | 7 |
| C2D · La figura bajo la luz | Cubrir el emisor y escuchar a Sayo | Gruta de las Luciérnagas | Cámara de `32-cuevas`; interacción del postigo adaptada | 10 |
| C2E · Bajo el agua | Localizar el altar y reunir las dos clases de perla | Laguna de Marea | Recogida de `07-sistemas` y `31-arenas`; natación existente | 8 |
| C2F · El guardián del agua | Despertar, purificar y canalizar | Arena de Marea | `11-jefes`, `22-golems`, `23-ataques-golem`, `31-arenas` | 9 |
| C2G · Desde dentro | Habilitar el altar e integrar Marea | Pabellón | `33-santuarios`; fragmentos de `07-sistemas` | 5 |
| C2H · Otra búsqueda | Compartir pruebas y elegir Duna | Regreso al muelle | Conversación y misiones por eventos | 7 |
| **Total** | | | | **55** |

**Recorrido:** se abren costa, laguna, arena y acceso a la gruta. Esta sigue en Sakura (`CUEVAS[1]`, `02-terreno`); Kaito indica el regreso. Su encuentro queda reservado al capítulo 2. Mar, Duna y regiones posteriores siguen cerrados hasta su capítulo.

**Adaptaciones propuestas:** emisor con postigo lateral, ilusión de Sayo, aislamiento del refugio y conejo sobre la gruta existente. Sayo lleva otro farol, cerrado: cubrirlo no resuelve el encuentro. No recibe daño ni tiene barra de enemigo. Se puede retroceder. Las luciérnagas siguen como ambiente y colección opcional.

Cinco `perla` para el altar y una `perlaMarea` para el estanque comparten la inmersión. El gólem conserva brazaletes, fases, cascadas, torbellinos, proyectiles y plataformas del diluvio. Ajustar su recomendación antigua de nivel 7 al segundo capítulo; resolución con {haz}, sin exigir arma nueva. Canalizar calma al guardián; depositar perlas habilita el fragmento; tocarlo lo integra.

## 2. Qué aprende el jugador

| Idea, máximo cinco | Línea obligatoria |
|---|---|
| Kaito perdió a Rui en una ofrenda anterior; el eco conserva un momento suyo | C2KA02–04, C2KA08–09 |
| Existe una ruta del exilio hacia otra isla; el Velo tiene límites | C2KA05–06 |
| La supuesta bestia es Sayo, madre de Nao; hay familias expulsadas | C2SA01–05 |
| El emisor lunar deforma la apariencia; cubrirlo permite reconocer a la persona | C2GR03–04, C2SA02–03 |
| El recuerdo del fragmento se experimenta desde dentro; difiere del eco de Rui | C2RE02–04 |

Signos comparados en C2GR05 y C2SA06; dirección siguiente en C2FI03–04. Ningún hecho esencial depende de preguntas opcionales o imágenes sin palabras.

## 3. Guion completo

Avance manual, pausa y repetición. Una línea visible. Preparar el gesto; dejar un segundo de reacción. Intervenciones en zonas seguras. Pausar detiene actuación y amenazas. Omitir guarda resumen y consecuencias, sin ejecutar interacciones pendientes. ID nuevos.

### C2A · Momo y el postigo

Si `inicio.postigo` está cumplido, usar C2MO01 y salir. Si falta, C2MO02–04 y la interacción existente, sin exigir compartir luz ni reiniciar el farol reparado. El objetivo local aparece antes del viaje. Así, una tarea opcional del piloto no deja este aprendizaje sin cubrir.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C2MO01 | Momo | «El postigo sigue firme. Lo aseguraste por el otro lado.» | Reparación previa | Señala la bisagra |
| C2MO02 | Momo | «Antes de irte, ayúdame con el postigo.» | Reparación pendiente | Sujeta el panel |
| C2MO03 | Momo | «Desde este lado se abre. Del otro puedes asegurarlo.» | Antes de actuar | Deja sitio para rodearlo |
| C2MO04 | Interfaz | «Asegurar el postigo · {interactuar}» | Lado correcto | Confirma cierre; guarda aprendizaje |

### C2B · El padre en el muelle

El eco `pescador` aparece después de hablar; registro único en `ST.ecos`. Kaito real queda separado de su figura pasada. Rui señala el agua; repiten un momento sin responder al presente. Título: «Kaito y Rui».

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C2KA01 | Hikari | «Tsuru me envió. Busco otros registros de las ofrendas.» | Ante Kaito | Guarda distancia de la caña |
| C2KA02 | Kaito | «Rui era mi hijo.» | Respuesta | Mira el lugar vacío |
| C2KA03 | Kaito | «Lo llevaron en una ofrenda anterior a la de Akari.» | Continuación | Baja la caña |
| C2KA04 | Kaito | «Nunca volvió.» | Tras pausa | Dos segundos de quietud |
| C2KA05 | Kaito | «Conozco una ruta fuera del Velo. Esa niebla rodea nuestra isla.» | Recupera la mirada | Señala el mar |
| C2KA06 | Kaito | «En otra isla viven familias que huyeron. Quiero sacar a otras.» | Mismo bloque | No inicia la travesía |
| C2KA07 | Kaito | «Sayo puede contarte lo que sufren las familias expulsadas.» | Orientación | Se vuelve hacia Hikari |
| C2KA10 | Kaito | «Búscala en la Gruta de las Luciérnagas. Vuelve al bosque de Sakura.» | Antes del eco | Marca la entrada en el mapa |
| C2EC01 | Eco de Kaito | «Mira cómo brilla el agua al amanecer, Rui.» | Aparición posterior | Pesca junto a su hijo |
| C2KA08 | Kaito | «Ese niño es Rui. A su lado estoy yo.» | Ante el eco | No toca las figuras |
| C2KA09 | Hikari | «Es un recuerdo de ustedes.» | Respuesta | Se queda mirando |

### C2C–D · La gruta y Sayo

Ruta marcada hasta la entrada real. Una patrulla ofrece rodeo con cobertura, sin cuota de combate. En la gruta, la silueta se deforma solo dentro del haz del emisor. El postigo se alcanza desde un lateral seguro. El conejo aparece una sola vez, blanco translúcido y con ojos dorados: cruza ese lateral y se desvanece. No habla, no activa nada y no es un recolectable.

Tras cubrir el emisor, mantener encuadre y postura: desaparece la deformación, queda la misma mujer. Sayo conduce unos pasos hasta la cámara aislada para conversar. La perturbación de Lumi ocurre al cruzar ese límite; no transmite desde allí. No se muestra todavía a quién informa.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C2GR01 | Lumi | «El Cazador pasa por el claro. Puedes bordearlo entre las rocas.» | Antes del claro | Señala cobertura |
| C2GR02 | Sayo, sin identificar | «No te acerques a esa luz.» | Silueta visible | Alza una mano; retrocede |
| C2GR03 | Hikari | «La figura cambia donde la alcanza el emisor.» | Observación segura | Sigue el borde del haz |
| C2GR04 | Hikari | «Tiene un postigo. Puedo asegurarlo como me enseñó Momo.» | Ve el lateral | Mira bisagra y cierre |
| C2GR05 | Hikari | «Ese conejo se parece al del mural. Allí estaba junto al disco completo.» | Aparición breve | Lo sigue con la mirada |
| C2GR06 | Interfaz | «Cubrir el emisor lunar · {interactuar}» | Junto al postigo | Cierra y fija; no consume luz |
| C2SA01 | Sayo | «Soy Sayo. La madre de Nao.» | Sin deformación | Mantiene la mano abierta |
| C2SA02 | Hikari | «No eras una bestia.» | Respuesta | Baja las manos |
| C2SA03 | Sayo | «El emisor lunar hacía que me vieras así.» | Confirmación | Señala la luz cubierta |
| C2SA04 | Hikari | «Leí el nombre de Nao. Tenía ocho años. No anotaron su regreso.» | A solas, cámara interior | Abre su copia |
| C2SA05 | Sayo | «Me expulsaron. Llevo provisiones a otras familias que se esconden.» | Respuesta | Muestra los suministros |
| C2SA06 | Hikari | «El emisor lleva la media luna cortada con grieta. Es el sello del registro.» | Comparación obligatoria | Guarda ambos dibujos |
| C2SA07 | Sayo | «Más adentro estamos fuera de la red lunar.» | Ya bajo protección | Se aparta del acceso |
| C2SA08 | Hikari | «Lumi, tu luz parpadeó al entrar.» | Tras cruzar el límite | Se vuelve hacia ella |
| C2SA09 | Lumi | «Lo sentí.» | Respuesta | Recupera el pulso; permanece dentro |
| C2SA10 | Sayo | «Busca también en el Santuario de la Marea. Está junto a la laguna.» | Cierre | Señala la salida hacia la costa |
| C2SA11 | Hikari | «Guardaré tu testimonio junto al nombre de Nao.» | Despedida | Cierra el diario |

Sayo permanece protegida. Su testimonio acredita expulsión y refugios. Se reservan suplantación, nombres de las dos Lunas, procedencia del conejo y espionaje.

### C2E–F · Laguna y Gólem de Marea

El altar presenta el destino de las cinco perlas. La Perla de Marea tiene apariencia y nombre distintos. Se visitan las plataformas antes de invocar. El guardián espera al cierre del diálogo.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C2AG01 | Lumi | «El altar tiene cinco huecos. Las perlas de luz están bajo el agua.» | Pabellón | Señala laguna y altar |
| C2AG02 | Interfaz | «Bucear · mantén {agacharse} bajo el agua» | Orilla segura | Ayuda de acción |
| C2AG03 | Lumi | «Esa es la Perla de Marea. Va al estanque del guardián.» | Recogida singular | Distingue ambos destinos |
| C2AG04 | Hikari | «El guardián también está corrompido. Intentaré liberarlo.» | Entrada de la arena | Observa antes de invocar |
| C2AG05 | Interfaz | «Lanzar la Perla de Marea al estanque · {interactuar}» | Con objeto | Consume solo `perlaMarea` |
| C2AG06 | Lumi | «Alcanza los dos brazaletes con el haz.» | Primera ventana segura | Señala ambos brazos |
| C2AG07 | Lumi | «Cuando pierda el equilibrio, dirige el haz al núcleo.» | Primer tambaleo | No tapa avisos de ataque |
| C2AG08 | Lumi | «Sube a una plataforma. El agua está creciendo.» | Aviso de diluvio | Indica peldaños |
| C2AG09 | Interfaz | «Canalizar luz · mantén {interactuar}» | Tras purificar | Junto al núcleo |
| C2AG10 | Hikari | «Ya se ha calmado. Volvamos al altar.» | Canalización concluida | Dos segundos; devuelve control |

### C2G–H · El segundo recuerdo y el regreso

Depositar las cinco perlas deja el fragmento disponible, sin concederlo. Antes de tocarlo debe haberse canalizado al guardián. Es una condición de progresión propuesta, sin añadir una explicación mágica. Memoria de 20–30 s: otro ángulo subjetivo del rito ya visto, el hilo tenso y las manos de la niña. No añade un episodio biográfico, parentesco o identificación nuevos.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C2RE00 | Interfaz | «Colocar cinco perlas de luz · {interactuar}» | Altar; inventario suficiente | Depósito único |
| C2RE01 | Interfaz | «Tocar el fragmento · {interactuar}» | Altar habilitado | Contacto deliberado |
| C2RE02 | Hikari | «Otra vez el rito. Sentía el hilo tirando de mí.» | Después de la memoria | Se mira las manos |
| C2RE03 | Hikari | «A Rui lo veía delante. Aquí miraba desde los ojos de la niña.» | Continuación | Distingue ambas experiencias |
| C2RE04 | Hikari | «Todavía no sé quién era.» | Tras pausa | No cancela sospechas |
| C2RE05 | Hikari | «Ahora llevo dos fragmentos. Ha vuelto el color a la laguna.» | Integración | Mira el agua |
| C2RE06 | Lumi | «Aquí también. El faro sigue roto.» | Respuesta | No anuncia otra ofrenda |
| C2FI01 | Hikari | «Sayo es la madre de Nao. El emisor la hacía parecer una bestia.» | Regreso al muelle | Comparte copia y testimonio |
| C2FI02 | Hikari | «El mural y el emisor tienen signos distintos.» | Mismo bloque | Los muestra juntos |
| C2FI03 | Kaito | «En Duna hay un archivo. Busca qué dicen allí sobre esos signos.» | Orientación final | Marca la región siguiente |
| C2FI04 | Hikari | «Iré al archivo. Quiero comparar sus registros con lo que vimos.» | Decisión | Guarda las pruebas |

## 4. Misión propuesta

Conservar el enlace del capítulo 1: **`c2_consultar_kaito`**, primer paso `ev`, `c2:kaito_consultado`, «Habla con Kaito en el muelle ({interactuar}).» C2A se resuelve al salir de Hinode; si falta aprendizaje: «Asegura el postigo con Momo ({interactuar}).» C2B, hasta C2KA10, emite la consulta y abre **`c2_marea`**.

`ev` consume eventos; `ir` comprueba llegada; `escena` termina conversación. Nombres `c2:*` nuevos; en `ir/escena` son señales de salida propuestas. Eventos `jefe:*` y `frag:2` ya existen.

| Paso | Tipo y señal | Objetivo visible |
|---:|---|---|
| 1 | `escena` · `c2:rui_observado` | Observa el eco junto a Kaito. C2EC01–KA09. |
| 2 | `ir` · `c2:gruta_alcanzada` | Vuelve a Sakura. Busca la Gruta de las Luciérnagas. |
| 3 | `ev` · `c2:emisor_cubierto` | Asegura el postigo del emisor ({interactuar}). |
| 4 | `escena` · `c2:sayo_escuchada` | Escucha a Sayo en el refugio ({interactuar}). |
| 5 | `ir` · `c2:altar_observado` | Examina el pabellón de la Marea. C2AG01. |
| 6 | `ev` · `c2:perlas_reunidas` | Reúne cinco perlas de luz; bucea con {agacharse}. |
| 7 | `ev` · `jefe:marea:items` | Encuentra la Perla de Marea en lo hondo de la laguna. |
| 8 | `ir` · `c2:arena_alcanzada` | Lleva la Perla de Marea al estanque del guardián. |
| 9 | `ev` · `jefe:marea:pelea` | Lanza la perla al estanque ({interactuar}). |
| 10 | `ev` · `jefe:marea:purificado` | Rompe los brazaletes y purifica con {haz}. |
| 11 | `ev` · `jefe:marea:canal` | Canaliza junto al núcleo: mantén {interactuar}. |
| 12 | `ir` · `c2:altar_regreso` | Vuelve al pabellón de la Marea. |
| 13 | `ev` · `c2:perlas_depositadas` | Coloca las cinco perlas de luz ({interactuar}). |
| 14 | `ev` · `frag:2` | Toca el fragmento ({interactuar}). Incluye C2RE02–06. |
| 15 | `escena` · `c2:pruebas_compartidas` | Cuenta a Kaito lo que encontraste ({interactuar}). |

**Salida:** completar abre Duna y revela `c3_archivo_duna`; objetivo inicial: «Busca el archivo de Duna.» No activa la Noche Roja.

## 5. Continuidad guardada y sustituciones

- Guardar misión, paso, línea pendiente, aprendizaje de Momo y apertura de regiones en `ecos3_luna_partida`.
- Eco `pescador` observado y comentario pendiente separados. Repetir no duplica recompensa. Diario conserva las líneas de Kaito, sin confundir eco con superviviente.
- Emisor cubierto, Sayo reconocida, testimonio y signos copiados; perturbación de Lumi y conejo vistos. Recargar conserva el postigo cerrado y a Sayo humana. El conejo no reaparece por cargar.
- Cinco perlas recogidas/depositadas, Perla de Marea recogida/consumida y estados del gólem separados. Reconciliar señales con inventario y estados al cargar o actuar fuera de orden; `c2:perlas_reunidas` se deriva de cinco perlas disponibles o ya depositadas.
- Guardar `frag[2]` y memoria pendiente juntos. Emitir `frag:2` al cerrar u omitir la memoria; adquisición única. Quedan `[true, false, true, false]`. No cambia `robado` ni comienza el asedio.

**Textos y misiones anteriores:**

- `07-sistemas`: sustituir `MIS.marea` por la ruta propuesta; separar depósito y contacto, antes unidos en `fragmento(2)`. Retirar `MIS.pescador` y la búsqueda de la caña; su encuentro pasa a consulta, eco y testimonios. Mantener `MIS.gruta` como colección opcional, disponible desde este capítulo, sin exigir sus cinco luciérnagas para Sayo.
- `11-jefes`: absorber `g_marea` en la principal, sin duplicar recompensas. Conservar sus cuatro eventos. Retirar `nucleo_marea` de la recompensa y su descripción «trofeo: corazón»; no se extrae el núcleo del guardián vivo.
- `26-guion`: sustituir `GUION.ecos[id=pescador]` por C2EC01 y título «Kaito y Rui»; `GUION.fragmentos[2]` por C2RE02–06; `GUION.jefes.marea` por C2AG10. Suprimir referencias a la hija de Kaito en `npc.kaito.inicio[1]` y `alba[0]`, y `verdad.kaito`. Las charlas ambientales de este capítulo reutilizan sus líneas nuevas, sin amaneceres ya restaurados ni parentesco con Hikari.
- Desactivar `MIS.nocheRoja` al segundo fragmento y la cadena antigua `laVerdad → guardian`. Sus hitos se integran donde fija `PLAN_FUSION`, sin ejecutar las escenas heredadas. Las semillas del Cerezo ya quedaron en Sakura según el capítulo 1.

## 6. Cierre

**Archivos tocados:** creado únicamente `docs/entregas_chatgpt/2026-11-02_capitulo2_marea.md`.

**Decisiones tomadas:** 55 minutos; gruta existente; recuperación del postigo; Sayo sin combate; conejo puntual; eco obligatorio de Rui; dos tipos de perla; gólem purificado; fragmento por contacto; continuación a Duna. Se aplican los signos ya decididos: disco completo con conejo y media luna cortada con grieta. Su significado definitivo se prueba después.

**Preguntas abiertas — Pregunta para el usuario:** ¿qué llegó a conocer Sayo sobre el destino final de Nao? El canon fija la muerte de las víctimas consumidas, pero no qué presenció o supo ella. Esta entrega limita su testimonio a los hechos establecidos; no inventa una despedida ni una prueba de su muerte.
