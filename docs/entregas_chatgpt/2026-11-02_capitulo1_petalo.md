# Capítulo 1 · El pueblo que llama honor a la pérdida

**Fecha:** 2026-11-02. **Entrega editorial para Claude.** Parte 6 autorizada.

**Entrada:** acaba RP04; `inicio:registro_completo` está cumplido. Hikari está junto al atril exterior. No posee fragmentos. El registro acredita entregas sin regreso asentado; todavía no explica el destino de las víctimas.

Fuentes: `PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md` (canon 2.0, reglas 1–27 y capítulos), `PARTE_2_GUION_DETALLADO_DEL_INICIO.md` (tono, actuación y conversaciones), `REVISION_GUION_LUNA_ROJA_Y_EXILIADOS.md` y `docs/entregas_chatgpt/2026-11-02_auditoria_piloto.md`. Sistemas contrastados con `js/50-guion-inicio.js`, `js/33-santuarios.js`, `js/11-jefes.js`, `js/27-ecos.js` y `js/07-sistemas.js`.

## 1. Escaleta

Los **40 minutos** empiezan después del registro. Sustituyen el presupuesto pendiente del capítulo; no se suman al piloto como otra apertura. El encargo acota aquí los 55 minutos generales del canon. Son una meta por medir, sin esperas ni reintentos obligatorios.

| Secuencia | Objetivo del jugador | Lugar | Sistema reutilizado | Min |
|---|---|---|---|---:|
| C1A · Seguir investigando | Examinar el altar y decidir buscar acceso | Galería exterior del Pétalo | Conversación con pausas; `Estr.altar.petalo` | 3 |
| C1B · Una imagen distinta | Observar mural y eco; guardar comparación | Exterior del santuario, junto al cerezo | Lectura; figuras y aparición de `Ecos` | 5 |
| C1C · El camino de las semillas | Reunir tres semillas; sortear una patrulla y despejar un paso | Sakura, camino a la arena | Recolectables `semilla`, Sombras y Cazadores | 8 |
| C1D · El guardián del bosque | Plantar las semillas, combatir y canalizar | Arena existente del Cerezo | `JEFES.cerezo`, puntos débiles, haz y punto de luz | 8 |
| C1E · Tres luces cercanas | Volver y encender faroles 1, 2 y 3 | Explanada del Pétalo | Reto del santuario y altar existentes | 5 |
| C1F · Una mano que no alcanza | Tocar e integrar el primer fragmento | Altar exterior | Conversación; memoria breve; cambio regional | 4 |
| C1G · Volver con algo cierto | Contar el hallazgo y acordar consultar a Kaito | Camino de regreso y patio de Hinode | Navegación; Tsuru y Momo; misiones por eventos | 7 |
| **Total** | | | | **40** |

**Montaje propuesto:** cuatro conversaciones: C1A, C1B, C1F y C1G. El resto sucede jugando. El eco es una figura infantil que juega, sin identidad asignada. El mural muestra la guardiana y el conejo ya previstos; solo se observa una diferencia entre sus signos y el sello actual. No aparece aún el conejo vivo.

Las tres semillas quedan en Sakura para esta campaña: una junto al eco, otra tras un paso con Sombras y otra en un desvío con cobertura frente al Cazador. Se reutilizan recogida y plantación; se elimina la dependencia de la gruta de Marea. La ruta ofrece combate contra Sombras o rodeo. Evitar al Cazador cuenta; no hay cuota de bajas ni oleadas de relleno.

El gólem corresponde a `JEFES.cerezo`, llamado **Gólem del Cerezo**, no a una especie nueva. Conserva arena, hojas, cristales, ataques y canalización. Claude deberá ajustar su resistencia y daño al primer capítulo: la ficha actual recomienda nivel 8. El haz permite resolverlo sin conceder una katana con origen todavía pendiente. Hikari decide atender esa amenaza antes de recoger el fragmento; el gólem no crea una cerradura mágica nueva.

**Adaptaciones necesarias, no implementadas:** habilitar estos sistemas en la campaña Luna; sustituir textos heredados del eco y del gólem por los de esta entrega. El tercer farol debe dejar el fragmento disponible en el altar, en lugar de concederlo automáticamente como hace el reto antiguo. La adquisición ocurre al tocarlo. El altar exterior evita entrar en el salón sólido. La reactivación regional llega con el fragmento, no al vencer al gólem.

## 2. Qué aprende el jugador

| Idea, máximo cinco | Línea obligatoria |
|---|---|
| Los niños no regresaban; el archivo no explica qué les ocurrió | CPV02–03, tras el dato de RP04 |
| El mural y el sello actual presentan signos distintos; falta contrastarlos | CPM02–04 |
| La energía usada en el reto procede del entorno | CPA05 |
| El fragmento contiene una memoria que Hikari percibe desde dentro, sin poder identificarla | CPR03–05 |
| Recuperarlo reactiva Sakura, pero el faro sigue roto | CPR07–08 |

La dirección siguiente queda dicha en CPV08–09. Ningún dato esencial depende de preguntas opcionales, de un rótulo o de entender una imagen sin explicación.

## 3. Guion completo

Conversaciones con avance manual, pausa y repetición como en el piloto. Una sola línea visible. Preparar el gesto antes de hablar; dejar 1 s de reacción, salvo indicación. Las máscaras expresan con manos, cuerpo y orientación. Las intervenciones al caminar esperan a que terminen peligro y lectura. Pausar detiene actuación y amenazas; omitir conserva el resumen y resuelve solo lo sucedido.

### C1A · Junto al registro

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| CPA01 | Hikari | «Quiero saber qué pasó después de esas entregas.» | Tras cerrar RP04 | Mantiene una mano junto al libro |
| CPA02 | Lumi | «Mira el altar. Hay un fragmento.» | Respuesta | Señala desde la galería |
| CPA03 | Hikari | «¿Podría guardar algo de aquella noche?» | Al observarlo | Se acerca sin tocar |
| CPA04 | Lumi | «Podemos comprobarlo. Los faroles están numerados.» | Antes de salir | Mira los tres faroles |
| CPA05 | Lumi | «Puedes encenderlos con luz del entorno. Esa energía vuelve al descansar.» | Misma conversación | Señala el medidor; no promete devolver vidas |
| CPA06 | Hikari | «Primero miraré alrededor.» | Cierre | Gira hacia el cerezo |
| CPA07 | Interfaz | «Examinar el altar · {interactuar}» | Antes de resolver el reto | Muestra el destino sin concederlo |
| CPA08 | Hikari | «Aún no puedo recogerlo.» | Si examina antes del reto | Retira la mano; una vez |

### C1B · Mural y eco

El mural permanece consultable. La comparación se comenta obligatoriamente. El eco repite un juego breve con figuras existentes; no representa a Nao ni habla con Hikari. Su línea queda en el diario al descubrirlo.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| CPM01 | Eco infantil | «¡Todavía me toca!» | Primera aparición segura | Extiende una mano; sigue jugando |
| CPM02 | Hikari | «Hay una guardiana junto a un conejo.» | Ante el mural | Sigue las figuras sin nombrarlas |
| CPM03 | Hikari | «Este signo es distinto del sello del registro.» | Misma conversación | Alterna la mirada entre imagen y copia |
| CPM04 | Lumi | «Guardemos los dos. Podemos compararlos con otros.» | Respuesta | No interpreta su origen |
| CPM05 | Hikari | «Allí hay una semilla.» | Tras el eco | Se agacha junto al recolectable |
| CPM06 | Lumi | «Hay tres cerezos marchitos en la arena.» | Tras recogerla | Señala el camino existente |
| CPM07 | Hikari | «El guardián se mueve entre ellos.» | Desde la entrada segura de la arena | Se detiene antes del alcance |
| CPM08 | Hikari | «No quiero dejarlo así. Probaré con las semillas.» | Tras CPM07 | Decide el desvío; sin amenaza a Momo |
| CPM09 | Interfaz | «Examinar el mural · {interactuar}» | Junto a la imagen | Reabre la comparación |

### C1C–E · Recorrido, gólem y faroles

El jugador puede observar los tres huecos de plantación antes de reunir las semillas. No empieza el combate durante la conversación. Al quedar plantados los tres, se reutiliza el despertar del gólem. Las pistas de combate aparecen en ventanas seguras; el objetivo permanece visible.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| CPG01 | Lumi | «Una Sombra está en el paso. También puedes rodearla.» | Antes del encuentro | Indica ambas rutas |
| CPG02 | Lumi | «El Cazador mira hacia aquí. Espera detrás de esa roca.» | Antes del desvío | Se mantiene a cubierto |
| CPG03 | Interfaz | «Plantar Semilla Espiritual · {interactuar}» | Con semilla ante un hueco libre | Consume una; confirma cada árbol |
| CPG04 | Lumi | «Las hojas cubren sus cristales. Apunta el haz a las hojas.» | Primer aviso del gólem | Mirada al punto débil |
| CPG05 | Lumi | «Ahora alcanza los cristales con el haz.» | Al retirar las hojas | Una vez; no tapa avisos de ataque |
| CPG06 | Interfaz | «Proyectar luz · {haz}» | Primera oportunidad segura | Ayuda de acción |
| CPG07 | Interfaz | «Canalizar luz · mantén {interactuar}» | Gólem purificado | Junto al núcleo |
| CPG08 | Hikari | «Ya está quieto.» | Tras canalizar | Baja las manos; 2 s |
| CPG09 | Hikari | «Volvamos al altar.» | Al salir de la arena | Retoma la investigación |
| CPG10 | Lumi | «Enciéndelos en orden. Primero el uno.» | Al volver a los faroles | No repite la fórmula de las cuatro luces |
| CPG11 | Interfaz | «Encender farol 1 · {interactuar}» | Junto al primer farol apagado | Confirma interacción |
| CPG12 | Interfaz | «Encender farol 2 · {interactuar}» | Junto al segundo farol apagado | Confirma interacción |
| CPG13 | Interfaz | «Encender farol 3 · {interactuar}» | Junto al tercer farol apagado | Confirma interacción |
| CPG14 | Lumi | «Se apagaron. Empieza otra vez por el uno.» | Orden incorrecto | Sin pérdida de objetos |
| CPG15 | Lumi | «Los tres están encendidos. Puedes acercarte al fragmento.» | Reto resuelto | Espera; no inicia la memoria a distancia |
| CPG16 | Interfaz | «Tocar el fragmento · {interactuar}» | Junto al altar habilitado | Interacción deliberada |

### C1F · Primer recuerdo

**Memoria auténtica de Akari, sin etiqueta de identidad.** Se reutiliza el rito del prólogo durante unos 20–30 s: altura de la niña, luz saliendo de su cuerpo, mano que intenta alcanzar la salida. No se muestra su transformación ni a Tasogare junto a ella. La frase nueva expresa el miedo de ese instante; no añade un episodio anterior sin canon. Sin narrador que certifique el origen. Después vuelve el plano compartido con Lumi; la conversación continúa manualmente.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| CPR01 | Voz del recuerdo | «Quiero volver a casa.» | Al tocar el fragmento | La mano tiembla; 2 s después |
| CPR02 | Hikari | «Había una niña.» | Regreso al altar | Mira su propia mano |
| CPR03 | Hikari | «Le quitaban la luz. Yo sentía su miedo.» | Misma conversación | La cierra despacio |
| CPR04 | Hikari | «Lo veía desde sus ojos.» | Tras una pausa de 2 s | Busca a Lumi |
| CPR05 | Hikari | «No sé de quién era ese recuerdo.» | Respuesta pendiente | No niega una sospecha razonable |
| CPR06 | Hikari | «El fragmento sigue en mí.» | Integración concluida | Mano al pecho; no lo devuelve al pedestal |
| CPR07 | Hikari | «Ha vuelto la luz entre los cerezos.» | Cambio regional visible | Mira el entorno; 2 s |
| CPR08 | Lumi | «Aquí sí. El faro sigue roto.» | Después | Señala la torre sin ordenar restaurarla |
| CPR09 | Hikari | «Quiero contárselo a Tsuru.» | Cierre | Recupera postura y control |

### C1G · Algo que llevar de vuelta

Regreso sin emboscada obligatoria. Tsuru conserva su farol; Momo sigue en el patio. No se exige haber reparado el postigo.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| CPV01 | Momo | «¡Volviste!» | Llegada segura | Deja espacio junto al banco |
| CPV02 | Hikari | «No encontré ningún regreso escrito.» | Ante Tsuru | Le muestra la copia |
| CPV03 | Tsuru | «Los niños no regresaban. Todavía no sabemos qué les hicieron.» | Respuesta | Sostiene el papel; 2 s |
| CPV04 | Hikari | «El fragmento me mostró una niña en el rito.» | Misma conversación | Se mira las manos |
| CPV05 | Hikari | «Sentí que estaba allí.» | Después | Sin descubrirse la máscara |
| CPV06 | Tsuru | «¿Recordaste su nombre?» | Respuesta | Pregunta sin identificarla |
| CPV07 | Hikari | «No. Quiero seguir buscando.» | Cierre del tema | Levanta la cabeza |
| CPV08 | Tsuru | «Kaito conoce la costa de Marea. Está en el muelle. Pregúntale por sus caminos.» | Orientación obligatoria | Señala la salida hacia la costa |
| CPV09 | Hikari | «Le preguntaré si hay otros registros.» | Decisión final | Guarda la copia; devuelve el control |

## 4. Misión propuesta

**ID:** `c1_petalo`. Se activa tras `registro_petalo`, incluido un guardado que ya lo completó. `ev` consume un evento; `ir` comprueba llegada; `escena` completa una conversación. Para estos dos últimos, el nombre indicado es la señal de salida propuesta, no un evento que ya exista.

1. `escena` · `c1:altar_observado` · «Examina el altar junto al registro ({interactuar}).» Bloque C1A.
2. `escena` · `c1:mural_comparado` · «Compara el mural con el sello del registro ({interactuar}).» Bloque C1B.
3. `ev` · `jefe:cerezo:items` · «Reúne tres Semillas Espirituales en Sakura.»
4. `ir` · `c1:arena_alcanzada` · «Lleva las semillas a la arena del Cerezo.»
5. `ev` · `jefe:cerezo:pelea` · «Planta una semilla en cada cerezo marchito ({interactuar}).»
6. `ev` · `jefe:cerezo:purificado` · «Retira las hojas y alcanza los cristales con {haz}.»
7. `ev` · `jefe:cerezo:canal` · «Canaliza junto al núcleo: mantén {interactuar}.»
8. `ir` · `c1:santuario_regreso` · «Vuelve al Santuario del Pétalo.»
9. `ev` · `c1:faroles_resueltos` · «Enciende los faroles en orden: 1, 2 y 3 ({interactuar}).» Evento nuevo, separado de la adquisición.
10. `ev` · `frag:0` · «Toca el fragmento del altar ({interactuar}).» Incluye C1F; emitir al resolver su cierre, también al omitirlo.
11. `escena` · `c1:testimonio_compartido` · «Cuenta a Tsuru lo que encontraste ({interactuar}).» Bloque C1G en Hinode.

**Salida:** revelar `c2_consultar_kaito`; primer paso `ev`, `c2:kaito_consultado`: «Habla con Kaito en el muelle sobre Marea ({interactuar}).» Su diálogo pertenece al capítulo 2.

## 5. Continuidad guardada

- Misión, paso y conversación/línea pendientes. Entrar desde el piloto conserva registro, nombre provisional y tareas opcionales reales.
- Mural comparado y copia de los dos signos; eco visto y nota propia, sin identificar al niño.
- Semillas recogidas y consumidas; huecos plantados; gólem purificado/canalizado. Reconciliar eventos con esos estados al cargar o llegar fuera de orden.
- Orden parcial de faroles y reto resuelto. El error reinicia solo el orden.
- `frag[0]`, primer recuerdo recuperado y reactivación regional. Integración y recompensa únicas; repetir texto no vuelve a concederlas. Guardar adquisición y memoria pendiente juntas para sobrevivir a una salida durante C1F.
- Testimonio compartido y consulta a Kaito disponible. Diario distingue pruebas de dudas: recuerdo sin nombre, destinos sin resolver. Hikari conserva el fragmento; el farol sigue con Tsuru.

## 6. Cierre

**Archivos tocados:** creado únicamente `docs/entregas_chatgpt/2026-11-02_capitulo1_petalo.md`.

**Decisiones tomadas:** 40 minutos objetivo; cuatro conversaciones; semillas locales; gólem reutilizado y ajustado; fragmento adquirido por contacto; primer recuerdo limitado al rito; continuación hacia Kaito. La fórmula de Lumi no se explica aún. Se reservan identidad, parentesco, suplantación y espionaje.

**Preguntas abiertas — Pregunta para el usuario:** ¿qué formas concretas distinguen el signo antiguo del mural y el sello actual? Las fuentes fijan la diferencia, pero no su dibujo. Esta entrega usa referencias genéricas hasta definirlos.
