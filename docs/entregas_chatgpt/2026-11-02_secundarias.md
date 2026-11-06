# Ecos de Luz · Las 13 misiones secundarias de la campaña única

**Fecha:** 2 de noviembre de 2026. **Entrega:** guion y diseño para Claude. **Estado:** propuesta para integrar; no implementada.

Se conservan los 13 identificadores del encargo. Las fichas sustituyen sus textos y sus condiciones de oferta de la campaña anterior. No dependen de sus misiones principales retiradas.

**Fuentes leídas:** `COORDINACION.md`, `AGENTS.md`, `CLAUDE.md`, `PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md`, `PARTE_2_GUION_DETALLADO_DEL_INICIO.md`, `PERSONAJES.md`, `PLAN_FUSION.md`, `js/59-guion-capitulos.js`, `CAPITULOS` de `js/49-campana.js` y `MIS` e `ITEMS` de `js/07-sistemas.js`. También se contrastaron posiciones, fauna y movimientos de habitantes con los módulos del mundo y de los capítulos.

## Criterios de integración narrativa

- La numeración es la de `CAPITULOS`: el inicio es el capítulo 0. Estas secundarias empiezan desde el 1. Pradera y Sakura están disponibles entonces; Marea abre en el 2; Duna, en el 3; Yoake, en el 4; Kiri y la nieve, en el 6.
- **Ofrecer no equivale a poder completar.** `murales`, `ecos` y `viento` pueden empezar en el 1, pero sus colecciones completas llegan a Kiri. Su cierre más temprano es el 6. `callan` empieza en el 4 y también llega a Kiri.
- Las misiones son opcionales. Ninguna retrasa el capítulo siguiente, exige reunir los cuatro fragmentos ni activa escenas de la historia anterior. Siguen disponibles después del final.
- Cada ficha distingue los textos visibles de las condiciones de diseño. Las tablas usan ID de línea, campo, personaje, texto, cuándo y gesto o intención. Los códigos `SEC_…` identifican texto; los ID de misión permanecen intactos.
- En encargos de habitantes, el último paso es una conversación breve de entrega. Se añaden esos cierres donde antes solo había un contador. En las misiones de lugar, `intro` y `dlg` pueden ser observaciones de Hikari: no se inventa un habitante invisible. `callan`, `gruta` y `manada` terminan en el propio lugar. `oso` nace en el glaciar y se entrega a Yuki.
- Cada entrega concede una sola vez la XP y los objetos de su ficha. Hablar de nuevo no los duplica. Las frases no convierten una recompensa de inventario en luz personal extraída.
- Lo explorado antes de aceptar cuenta: murales distintos, capas ocultas distintas, ecos distintos, espíritus distintos, chispas recogidas y luciérnagas encontradas. También cuentan la caña recuperada, la cumbre alcanzada y los animales de misión ya calmados. No se pide repetir una interacción que ya desapareció.
- No hay destinos de seguimiento al otro lado de una región cerrada. Si solo queda contenido de Kiri, el diario conserva el progreso y espera al capítulo 6. La guía esencial no depende de Lumi. Sus intervenciones y su vigilancia siguen siendo las de la historia principal.

### Continuidad de habitantes

| Momento | Quién ofrece y recibe |
| --- | --- |
| Capítulos 1–3 | Tsuru recibe `te` en Hinode. Momo ofrece y recibe `murales` y `viento` allí. |
| Capítulo 4, antes de la muerte de Tsuru | Tsuru aún puede recibir `te` si hay un momento libre. El asedio y las escenas tienen prioridad. |
| Capítulo 4, después de la muerte de Tsuru | Momo hereda `te`, aunque aún no se hubiera aceptado. Se usan la oferta heredada y `dlgHeredero`. Se puede hablar con ella en un descanso seguro, en el muelle o en Yoake. Nunca se dirige al jugador hacia Tsuru. |
| Desde la captura de Momo al final del 4 hasta su rescate en el 5 | Momo no ofrece ni recibe encargos. `te`, `murales` y `viento` conservan progreso. Se puede seguir reuniendo o explorando. Sus entregas esperan al rescate y a un momento seguro. |
| Tras el rescate y traslado del capítulo 5 | Momo ofrece y recibe los tres encargos en Yoake, junto al refugio de Chiyo. Deja de ofrecerlos en Hinode. Sigue disponible allí durante los capítulos 6–7 y después de los créditos. |
| Yuki y Kaito durante la evacuación y las travesías | Las entregas siguen su ubicación real. Se atienden cuando acaba la escena o el viaje. No se exige volver a una copia del habitante en su ubicación anterior. |
| Taiyō | Ofrece `ecos` desde el 1 y `kiri` desde el 6. Se busca su ubicación vigente: Mirador durante la campaña y Hinode cuando el epílogo lo reúne allí. |

**Texto común de espera para una entrega a Momo capturada:** «Momo está cautiva. Podré hablar con ella cuando esté a salvo.» Aparece en el diario, sin bloquear la misión principal. Tras el traslado, el objetivo pasa a «Habla con Momo en Yoake ({interactuar})» cuando no haya un texto más específico en la ficha.

Taiyō es el abuelo de Akari/Hikari, según la indicación de este encargo. Estas secundarias no utilizan ese parentesco como revelación. Tampoco anticipan su reconocimiento del extractor del capítulo 5 ni sustituyen esa conversación. Kaito perdió a Rui; nunca reconoce en Hikari a su hijo. Tsuru no habla de sucesos posteriores a su muerte. Lumi sigue informando hasta el capítulo 6; ninguna secundaria la presenta como ajena a la red durante ese tramo.

## 1. `chispas` · Luz dispersa

**Quién la da:** Yuki, en Hinode. **Desde:** capítulo 1. **Cierre más temprano:** 1. **Condición:** hablar con Yuki en un momento libre. Sustituye la dependencia de `despertar`.

**Recompensa:** 50 XP y 1 Esencia estelar (`esencia`). Se conserva.

| ID | Campo | Personaje | Texto | Cuándo | Gesto o intención |
| --- | --- | --- | --- | --- | --- |
| SEC_CH01 | `intro` | Yuki | Hay chispas de luz por la pradera. Si reúnes seis, vuelve a verme. | Al ofrecer | Señala el camino exterior. |
| SEC_CH02 | `desc` | Diario | Reúne seis chispas de luz y vuelve con Yuki. | Al aceptar | Objetivo cotidiano. |
| SEC_CH03 | Paso 1 | Objetivo | Recoge seis chispas de luz en las regiones abiertas. | Durante la búsqueda | Contador `chispa`: 6. Se recogen al acercarse. |
| SEC_CH04 | Paso 2 | Objetivo | Habla con Yuki ({interactuar}). | Con seis recogidas | Sigue su ubicación actual. |
| SEC_CH05 | `dlg` | Yuki | Ya reuniste las seis. Lleva esta esencia para el camino. | Al entregar | Ofrece el frasco. |

**Permanencia:** Yuki sigue siendo la responsable durante toda la campaña. No pasa a Tsuru ni a Momo. `dlgHeredero`: no corresponde.

## 2. `amigos` · Amigos del bosque

**Quién la da:** Yuki, en Hinode. **Desde:** capítulo 1. **Cierre más temprano:** 1. **Condición:** hablar con Yuki. Sustituye la dependencia de `despertar`.

**Recompensa:** 70 XP y 1 Manto de Sakura (`manto_sakura`). Se conserva. Lo entrega Yuki; no procede de quitarle nada a un animal.

| ID | Campo | Personaje | Texto | Cuándo | Gesto o intención |
| --- | --- | --- | --- | --- | --- |
| SEC_AM01 | `intro` | Yuki | Los animales se asustan si corres hacia ellos. Acércate despacio y espera a que confíen. | Al ofrecer | Baja la mano para indicar calma. |
| SEC_AM02 | `desc` | Diario | Gana la confianza de los animales del bosque. Después, vuelve con Yuki. | Al aceptar | Cuidar antes que perseguir. |
| SEC_AM03 | Paso 1 | Objetivo | Acaricia animales tres veces: usa {agacharse}, espera cerca y pulsa {interactuar} cuando confíen. | Durante la búsqueda | Conserva las tres interacciones de `acariciar`; no exige tres especies. |
| SEC_AM04 | Paso 2 | Objetivo | Cuenta a Yuki cómo te fue ({interactuar}). | Tras las tres caricias | Sigue su ubicación actual. |
| SEC_AM05 | `dlg` | Yuki | Se acercaron por su cuenta. Este manto es para ti. | Al entregar | Asiente y ofrece el manto. |

**Permanencia:** Yuki la sigue ofreciendo. No exige entrar en Kiri ni conocer al conejo espiritual. Los animales acariciables son fauna común. `dlgHeredero`: no corresponde.

## 3. `te` · Té para la abuela

**Quién la da:** Tsuru; después, Momo como heredera. **Desde:** capítulo 1. **Cierre más temprano:** 1. **Condición:** hablar con quien esté disponible según la tabla de continuidad.

**Recompensa:** 80 XP y 3 Tés de sakura (`te`). Se conserva. Se descuentan cinco Flores de té (`flor`) solo al entregar. Las flores que se usen antes para cocinar no cuentan como entregadas.

| ID | Campo | Personaje | Texto | Cuándo | Gesto o intención |
| --- | --- | --- | --- | --- | --- |
| SEC_TE01 | `intro` | Tsuru | ¿Me traes cinco flores de té? Crecen entre la hierba, cerca de Hinode. | Oferta con Tsuru viva | Deja espacio junto a la mesa. |
| SEC_TE02 | `desc` | Diario | Tsuru necesita cinco flores de té de los alrededores de Hinode. | Con Tsuru viva | Necesidad concreta. |
| SEC_TE03 | Paso 1 | Objetivo | Reúne cinco flores de té cerca de Hinode. | Mientras faltan flores | Inventario `flor`: 5. Se recogen al acercarse. |
| SEC_TE04 | Paso 2 | Objetivo | Lleva las cinco flores a Tsuru ({interactuar}). | Con Tsuru viva y cinco flores | Entrega material. |
| SEC_TE05 | `dlg` | Tsuru | Alcanzan para preparar más té. Lleva estas tres tazas. | Al entregar en vida | Acerca el té a Hikari. |
| SEC_TE06 | Oferta heredada (`introHeredero`) | Momo | La abuela preparaba té con estas flores. ¿Me traes cinco de las que crecen junto a Hinode? | Primera oferta después de la muerte de Tsuru | Mira las flores del entorno o las manos de Hikari. |
| SEC_TE07 | `desc`, heredada | Diario | Momo quiere reunir cinco flores para recordar a Tsuru. | Después de la muerte de Tsuru | Sustituye la descripción anterior. |
| SEC_TE08 | Paso 2, heredado | Objetivo | Lleva las cinco flores a Momo ({interactuar}). | En el muelle o en un descanso seguro del capítulo 4 | No señala la casa vacía de Tsuru. |
| SEC_TE09 | Paso 2, en Yoake | Objetivo | Lleva las cinco flores a Momo en Yoake ({interactuar}). | Tras su traslado del capítulo 5; también si se entrega durante la visita del 4 | Cerca del refugio de Chiyo. |
| SEC_TE10 | `dlgHeredero` | Momo | Pondré las flores junto al nombre de la abuela. Este té es para ti. | Toda entrega después de la muerte de Tsuru | Recibe las flores; pausa breve. |

**Permanencia:** Tsuru deja de ofrecerla al morir en el capítulo 4. Momo hereda tanto una misión pendiente como una oferta aún no aceptada. Durante la captura espera; tras el rescate se ofrece en Yoake. No se exige volver a Hinode para entregar. El nombre de la misión se conserva como recuerdo; su descripción y su destino cambian. No se presenta el té como una última reserva que Momo deba transportar sin que el relato lo haya establecido.

## 4. `murales` · Recuerdos de piedra

**Quién la da:** Momo. **Desde:** capítulo 1. **Cierre más temprano:** 6, por el mural de Kiri. **Condición:** hablar con Momo; no depende de `despertar`.

**Recompensa:** 160 XP y 1 Máscara de kitsune (`mascara`). Se conserva.

| ID | Campo | Personaje | Texto | Cuándo | Gesto o intención |
| --- | --- | --- | --- | --- | --- |
| SEC_MU01 | `intro` | Momo | Hay ocho murales por la isla. Quiero saber qué cuentan los que están lejos. | Al ofrecer en Hinode | Mira hacia la salida. |
| SEC_MU02 | `intro`, en Yoake | Momo | En nuestra isla hay ocho murales. ¿Me cuentas qué dicen cuando los hayas leído? | Si se acepta después del traslado | Conversación tranquila. |
| SEC_MU03 | `desc` | Diario | Lee los ocho murales de la isla y cuenta a Momo qué encontraste. | Al aceptar | Las inscripciones son testimonios que se pueden contrastar. |
| SEC_MU04 | Paso 1 | Objetivo | Lee los ocho murales de la isla ({interactuar}). | Durante la exploración | Ocho murales distintos; conserva `mural` y el progreso previo. |
| SEC_MU05 | Paso 2 | Objetivo | Cuenta a Momo lo que leíste en los murales ({interactuar}). | Con los ocho leídos | Seguir su ubicación vigente. |
| SEC_MU06 | Paso 2, en Yoake | Objetivo | Cuenta a Momo lo que leíste en los murales de la otra isla ({interactuar}). | Desde su traslado | El destino es Yoake. |
| SEC_MU07 | `dlg` | Momo | Una piedra decía que fuera del Velo había bestias. Aquí viven familias. | Al entregar, desde el capítulo 6 | Mira las casas de Yoake. |
| SEC_MU08 | `dlg` | Momo | Esta máscara es para ti. | Después de SEC_MU07 | La ofrece sin ceremonia. |

**Permanencia:** no se retira al dejar Hinode. Momo la ofrece y recibe en Yoake desde su traslado. Durante la captura no hay oferta ni entrega. No tiene heredero porque Momo sobrevive. La misión no afirma que todo lo grabado en piedra sea cierto ni identifica a Hikari antes del capítulo 6.

## 5. `callan` · Lo que callan las piedras

**Quién la da:** el Farol de Tsuru, como herramienta de lectura; la observación es de Hikari. **Desde:** capítulo 4, después de recibir el objeto `farol` tras la muerte de Tsuru. **Cierre más temprano:** 6, por Kiri. No exige terminar primero `murales`.

**Recompensa:** 200 XP y 1 Esencia estelar (`esencia`). Se conserva como recompensa automática de exploración.

| ID | Campo | Personaje | Texto | Cuándo | Gesto o intención |
| --- | --- | --- | --- | --- | --- |
| SEC_CA01 | `intro` | Hikari | Con el farol se ven otras marcas en la piedra. Las leeré también. | Primera oportunidad de examinar un mural con el farol, fuera de una escena | Acerca el farol a la superficie. |
| SEC_CA02 | `desc` | Diario | El Farol de Tsuru revela marcas ocultas en los ocho murales. Compáralas con las inscripciones visibles. | Al ofrecer | Lectura material. |
| SEC_CA03 | Paso 1 | Objetivo | Lee cada mural y alza el Farol de Tsuru ante él ({interactuar}): ocho marcas ocultas. | Durante la exploración | Una lectura oculta por mural; conserva `oculto` y el progreso previo. |
| SEC_CA04 | `dlg`, cierre automático | Hikari | Ya guardé las ocho marcas. Puedo compararlas con lo que estaba a la vista. | Al leer la última capa | Mira el diario; devuelve el control enseguida. |

**Permanencia:** sigue disponible con Hikari durante toda la campaña y después del final. No tiene entrega a Tsuru ni heredero. Las marcas no son palabras nuevas de Tsuru desde el farol. No se necesita a Momo para activar ni cerrar la misión. El objeto se conserva al completar.

## 6. `ecos` · Ecos del pasado

**Quién la da:** Taiyō. **Desde:** capítulo 1, en el Mirador. **Cierre más temprano:** 6, por el eco de Kiri. **Condición:** hablar con él en un momento libre; sustituye la dependencia de `faro`.

**Recompensa:** 240 XP y 2 Esencias estelares (`esencia`). Se conserva.

| ID | Campo | Personaje | Texto | Cuándo | Gesto o intención |
| --- | --- | --- | --- | --- | --- |
| SEC_EC01 | `intro` | Taiyō | Hay seis ecos en la isla. Acércate y escucha lo que repiten. | Al ofrecer | Deja que Hikari observe el entorno. |
| SEC_EC02 | `desc` | Diario | Encuentra los seis ecos y vuelve con Taiyō. Conservan momentos de quienes vivieron aquí. | Al aceptar | Recuerdos externos, distintos de los fragmentos de Hikari. |
| SEC_EC03 | Paso 1 | Objetivo | Acércate a los seis ecos y escucha cada recuerdo. | Durante la exploración | Seis ecos distintos; conserva `eco` y el progreso previo. |
| SEC_EC04 | Paso 2 | Objetivo | Cuenta a Taiyō lo que viste ({interactuar}). | Con los seis escuchados | Mirador o su ubicación del epílogo. |
| SEC_EC05 | `dlg` | Taiyō | Viste también a quienes llevaban a los niños al faro. Yo ayudé a justificar esas ofrendas. | Al entregar, desde el capítulo 6 | Baja el bastón; no busca una absolución. |
| SEC_EC06 | `dlg` | Taiyō | Lleva estas esencias. | Después de SEC_EC05 | Ofrece los frascos. |

**Permanencia:** Taiyō sigue ofreciendo y recibiendo. No tiene heredero. El eco del muelle es Kaito con Rui. El del Mirador es Tasogare llevando a otro niño al faro; no se da identidad nueva a ese niño. No se atribuye felicidad a todos los ecos. Encontrarlos no promete recuperar a quienes murieron ni revela por sí solo la identidad autobiográfica de Hikari.

## 7. `viento` · Espíritus del viento

**Quién la da:** Momo. **Desde:** capítulo 1. **Cierre más temprano:** 6, por el espíritu situado en Kiri. **Condición:** hablar con Momo. El planeo ya existe desde el inicio; no depende de `hoja` ni de conseguir un arma.

**Recompensa:** 260 XP y 1 Manto Solar (`manto_solar`). Se conserva. El nombre del manto no implica una forja, una Odachi ni una reliquia de Tasogare.

| ID | Campo | Personaje | Texto | Cuándo | Gesto o intención |
| --- | --- | --- | --- | --- | --- |
| SEC_VI01 | `intro` | Momo | Hay diez espíritus del viento en lugares altos. ¿Puedes llegar hasta ellos con tu capa? | Al ofrecer en Hinode | Sigue con la mirada una altura. |
| SEC_VI02 | `intro`, en Yoake | Momo | En nuestra isla hay diez espíritus del viento. Me gustaría saber si siguen en las alturas. | Si se acepta tras el traslado | Curiosidad sin urgencia. |
| SEC_VI03 | `desc` | Diario | Alcanza los diez espíritus del viento de la isla y vuelve con Momo. | Al aceptar | Explorar las alturas. |
| SEC_VI04 | Paso 1 | Objetivo | Alcanza los diez espíritus del viento. Salta con {saltar} y mantén {saltar} en el aire para planear. | Durante la exploración | Diez espíritus distintos; conserva `viento`. Se alcanzan al acercarse. |
| SEC_VI05 | Paso 2 | Objetivo | Cuenta a Momo dónde encontraste los espíritus ({interactuar}). | Con los diez alcanzados | Sigue su ubicación vigente. |
| SEC_VI06 | Paso 2, en Yoake | Objetivo | Cuenta a Momo en Yoake dónde encontraste los espíritus ({interactuar}). | Desde su traslado | Entrega en el refugio. |
| SEC_VI07 | `dlg` | Momo | ¡Llegaste a los diez! Quiero que tengas este manto. | Al entregar, desde el capítulo 6 | Despliega un borde del manto. |

**Permanencia:** se traslada con Momo a Yoake. No se ofrece ni entrega durante la captura. No tiene heredero. No se añaden espíritus en Yoake: se conservan los diez recolectables de la isla inicial.

## 8. `jabali` · El jabalí furioso

**Quién la da:** Yuki. **Desde:** capítulo 1, después de recuperar la Katana del Alba. **Cierre más temprano:** 1. **Condición:** hablar con Yuki y disponer de `katana`; sustituye la dependencia de la misión retirada `hoja`.

**Recompensa:** 200 XP y 3 Onigiris (`onigiri`). Se conserva.

| ID | Campo | Personaje | Texto | Cuándo | Gesto o intención |
| --- | --- | --- | --- | --- | --- |
| SEC_JA01 | `intro` | Yuki | Colmillo de Bruma está destrozando la huerta. Ronda al noreste del faro. | Al ofrecer | Señala esa dirección. |
| SEC_JA02 | `desc` | Diario | Calma a Colmillo de Bruma y vuelve con Yuki. El jabalí se defiende si lo provocas. | Al aceptar | Proteger la huerta y al animal. |
| SEC_JA03 | Paso 1 | Objetivo | Calma a Colmillo de Bruma con {atacar}. Apártate de sus embestidas y detente cuando se calme. | Junto al jabalí | Conserva `calmar:colmillo`; reduce ánimo, sin heridas. |
| SEC_JA04 | Paso 2 | Objetivo | Cuenta a Yuki que Colmillo se calmó ({interactuar}). | Tras calmarlo | No exige que el animal haya desaparecido. |
| SEC_JA05 | `dlg` | Yuki | Dejaré parte de la cosecha fuera de la huerta. Lleva estos onigiris. | Al entregar | Mira la huerta antes de ofrecer la comida. |

**Permanencia:** Yuki sigue siendo la responsable; su ubicación cambia con la evacuación. No tiene heredero. No se pide matar, herir ni quitar colmillos. Se conserva el funcionamiento de calmar con luz del arma; no se introduce una mecánica de comida que aún no existe.

## 9. `gruta` · La gruta de las luciérnagas

**Quién la da:** el lugar Gruta de las Luciérnagas, en Sakura. **Desde:** capítulo 1, al descubrirlo. **Cierre más temprano:** 1. Las luciérnagas ya están allí; el encuentro principal con Sayo sigue en el 2.

**Recompensa:** 180 XP y 1 Esencia estelar (`esencia`). Se conserva como recompensa automática de exploración.

| ID | Campo | Personaje | Texto | Cuándo | Gesto o intención |
| --- | --- | --- | --- | --- | --- |
| SEC_GR01 | `intro` | Hikari | Hay luces entre las raíces. Seguiré el túnel para verlas de cerca. | Al descubrir la gruta, sin otra conversación activa | Mira hacia el interior. |
| SEC_GR02 | `desc` | Diario | Busca las cinco luces de luciérnaga de la gruta de Sakura. | Al descubrir | Exploración del túnel y la cámara. |
| SEC_GR03 | Paso 1 | Objetivo | Acércate a las cinco luces de luciérnaga dentro de la gruta. | Durante el recorrido | Conserva los cinco recolectables `luciernaga`; no pide una interacción nueva. |
| SEC_GR04 | `dlg`, cierre automático | Hikari | Ya encontré las cinco luces. | Al alcanzar la última | Mira alrededor y continúa. |

**Permanencia:** depende del lugar, no de que Sayo permanezca allí. Sigue disponible después de su traslado. No se recoge a Lumi ni se encierra a los insectos en un objeto. Las cinco luces son el objetivo del recolectable; no una entrega de vida. Esta misión no descubre, neutraliza ni explica el emisor lunar antes de su escena principal.

## 10. `pescador` · La caña de Kaito

**Quién la da:** Kaito, en su muelle. **Desde:** capítulo 2, después de su conversación principal sobre Rui. **Cierre más temprano:** 2. Sustituye la dependencia de `despertar`.

El ID sigue siendo `pescador`. El nombre visible cambia de «El pescador perdido» a «La caña de Kaito» para señalar el objeto buscado.

**Recompensa:** 180 XP y 1 Manto de Marea (`manto_marea`). Se conserva. Se descuenta `cana` al devolverla.

| ID | Campo | Personaje | Texto | Cuándo | Gesto o intención |
| --- | --- | --- | --- | --- | --- |
| SEC_PE01 | `intro` | Kaito | Perdí mi caña en la orilla oeste de la laguna. ¿La buscas si pasas por allí? | Después de la conversación principal; nunca pegada al momento de duelo por Rui | Mira la orilla. |
| SEC_PE02 | `desc` | Diario | Encuentra la caña en la orilla oeste de la laguna de Marea y devuélvesela a Kaito. | Al aceptar | Una necesidad cotidiana de una persona viva. |
| SEC_PE03 | Paso 1 | Objetivo | Recoge la caña de Kaito en la orilla oeste de la laguna. | Durante la búsqueda | Conserva `cana` y su posición; se recoge al acercarse. |
| SEC_PE04 | Paso 2 | Objetivo | Devuelve la caña a Kaito ({interactuar}). | Con `cana` en el inventario | Sigue al Kaito real, también si está en Yoake. |
| SEC_PE05 | `dlg` | Kaito | Es esta. Gracias por buscarla. | Al entregar | Comprueba el sedal. |
| SEC_PE06 | `dlg` | Kaito | Lleva este manto para el viaje. | Después de SEC_PE05 | Ofrece el manto. |

**Permanencia:** Kaito la sigue ofreciendo y recibiendo en su ubicación vigente. No tiene heredero. No atribuye la caña a Rui ni introduce un recuerdo familiar nuevo. No llama hija a Hikari ni promete que la luz de Rui regresará.

## 11. `kiri` · Cumbre de Kiri

**Quién la da:** Taiyō. **Desde:** capítulo 6. **Cierre más temprano:** 6. **Condición:** hablar con él cuando Kiri ya esté abierta. Se elimina la dependencia de `hoja`.

**Recompensa:** 280 XP y 2 Esencias estelares (`esencia`). Se conserva.

| ID | Campo | Personaje | Texto | Cuándo | Gesto o intención |
| --- | --- | --- | --- | --- | --- |
| SEC_KI01 | `intro` | Taiyō | Desde la aguja más alta de Kiri se ve el valle entero. Las columnas de aire cálido pueden sostener tu capa. | Al ofrecer, desde el capítulo 6 | Mira hacia las cumbres. |
| SEC_KI02 | `desc` | Diario | Alcanza la aguja más alta de Kiri con las corrientes de aire y vuelve con Taiyō. | Al aceptar | Reto de navegación. |
| SEC_KI03 | Paso 1 | Objetivo | Llega a la cima de Kiri: salta dentro de las columnas de aire y mantén {saltar} para planear de una a otra. | Durante la subida | Conserva el destino alto de `kiri`: x 220, z −316, radio 16, altura mínima 95. No basta con pasar por debajo. |
| SEC_KI04 | Paso 2 | Objetivo | Cuenta a Taiyō que llegaste a la cima ({interactuar}). | Tras alcanzar la altura requerida | Sigue su ubicación vigente. |
| SEC_KI05 | `dlg` | Taiyō | Desde allí pudiste ver el valle. Lleva estas esencias. | Al entregar | Escucha antes de ofrecerlas. |

**Permanencia:** Taiyō sigue recibiéndola después del final. No tiene heredero. Llegar ya durante la misión principal satisface el primer paso. Esta secundaria no condiciona el registro de la cima, no lo sustituye y no exige completar el cuarto recuerdo para ascender. Su texto no revela quién es Hikari: la identidad se cuenta en la secuencia principal.

## 12. `manada` · La manada blanca

**Quién la da:** el camino del Santuario de Escarcha, como misión de lugar. **Desde:** capítulo 6, al descubrir Escarcha. **Cierre más temprano:** 6.

**Recompensa:** 300 XP y 2 Esencias estelares (`esencia`). Se conserva como recompensa automática del encuentro.

| ID | Campo | Personaje | Texto | Cuándo | Gesto o intención |
| --- | --- | --- | --- | --- | --- |
| SEC_MA01 | `intro` | Hikari | Hay tres lobos junto al camino. Si tengo que acercarme, intentaré calmarlos. | Al descubrir el paso, fuera de una escena | Se detiene a observarlos. |
| SEC_MA02 | `desc` | Diario | Calma a los tres lobos de la Manada Blanca que están junto al camino de Escarcha. | Al ofrecer | Encuentro opcional; no cierra la ruta principal. |
| SEC_MA03 | Paso 1 | Objetivo | Calma a los tres lobos con {atacar}. Mantén espacio entre ellos y detente cuando se calmen. | Durante el encuentro | Conserva `calmar:manada`; cuenta a `lobo1`, `lobo2` y `lobo3` una vez cada uno. |
| SEC_MA04 | `dlg`, cierre automático | Hikari | Los tres están tranquilos. Puedo seguir. | Tras calmar al último | Baja el arma y se aparta. |

**Permanencia:** la ofrece el lugar; no tiene heredero ni entrega a un habitante. No requiere que Lumi explique el encuentro. El nombre Manada Blanca se conserva sin exigir un cambio del pelaje actual. Los lobos no son Sombras ni están condenados a convertirse en ellas.

## 13. `oso` · El oso del glaciar

**Quién la da:** el entorno de Kuma, en el glaciar de Kiri. **Quién recibe:** Yuki. **Desde:** capítulo 6, después de completar `manada` y al acercarse al entorno de Kuma. **Cierre más temprano:** 6. No exige un regreso a Hinode entre los lobos y el oso.

**Recompensa:** 500 XP, 1 Naginata de Escarcha (`naginata`) y 1 Manto de Escarcha (`manto_escarcha`). Se conservan los objetos originales, con entrega de Yuki. No salen del cuerpo del animal, no se fabrican con sus restos y no dependen de la forja retirada.

| ID | Campo | Personaje | Texto | Cuándo | Gesto o intención |
| --- | --- | --- | --- | --- | --- |
| SEC_OS01 | `intro` | Hikari | Ese oso es enorme. Si me acerco, tendré que darle espacio. | Al ofrecer junto al glaciar | Observa sus patas y deja distancia. |
| SEC_OS02 | `desc` | Diario | Calma a Kuma, el oso del glaciar. Después, cuenta a Yuki cómo fue. | Al aceptar | Encuentro opcional, de dificultad alta. |
| SEC_OS03 | Paso 1 | Objetivo | Calma a Kuma con {atacar}. Apártate de sus zarpazos y detente cuando se calme. | Durante el encuentro | Conserva `calmar:kuma`; ánimo, sin heridas ni muerte. |
| SEC_OS04 | Paso 2 | Objetivo | Cuenta a Yuki que Kuma se calmó ({interactuar}). | Tras calmarlo | Sigue su ubicación actual; puede esperar hasta después del final. |
| SEC_OS05 | `dlg` | Yuki | Kuma sigue vivo. Dale espacio cuando vuelvas a pasar. | Al entregar | Escucha y asiente. |
| SEC_OS06 | `dlg` | Yuki | Lleva esta naginata y este manto. | Después de SEC_OS05 | Entrega el equipo, sin relato de procedencia. |

**Permanencia:** el lugar sigue ofreciendo el encuentro si aún está pendiente; Yuki recibe el cierre durante toda la campaña. No tiene heredero. Si Kuma se calmó antes de aceptar, se reconoce y solo queda hablar con Yuki. No es una prueba impuesta por Tasogare ni un requisito para el final.

## Recompensas y alcance de los cambios

Todos los objetos propuestos existen en `ITEMS` de `js/07-sistemas.js`. No hace falta sustituir ninguno por otro ID. La Naginata y el Manto de Escarcha cambian de forma de entrega: los da Yuki. Los mantos Solar, Sakura y Marea son recompensas de los habitantes; no acreditan una forja ni una genealogía nuevas. El té heredado tampoco requiere un objeto distinto.

Se mantienen las cantidades y la XP originales. Solo `te` consume cinco flores y `pescador` consume la caña al entregar. Las demás misiones registran acciones o descubrimientos; no descuentan luz personal, fauna ni fragmentos. Los ocho murales visibles y sus ocho capas ocultas son dos colecciones distintas. Leer una inscripción puede contar para el capítulo principal y para una secundaria sin duplicar su lectura.

Las líneas nuevas de oferta, pasos y cierre no reescriben el contenido completo de murales o ecos. Al integrar, Claude debe revisar los textos antiguos que todavía queden en esas fuentes: los contadores no deben restaurar el juramento anterior del guardián, una paternidad de Kaito ni la doctrina lunar como explicación cierta del mundo. El texto de esta entrega no añade esos contenidos.

## Tabla resumen

El número indica el primer capítulo de oferta. Los requisitos adicionales figuran entre paréntesis.

| id | Quién | Desde capítulo | Recompensa |
| --- | --- | --- | --- |
| `chispas` | Yuki | 1 | 50 XP · `esencia` ×1 |
| `amigos` | Yuki | 1 | 70 XP · `manto_sakura` ×1 |
| `te` | Tsuru → Momo; en Yoake tras el traslado | 1 | 80 XP · `te` ×3 |
| `murales` | Momo; en Yoake tras el traslado | 1; cierre desde 6 | 160 XP · `mascara` ×1 |
| `callan` | Farol de Tsuru / observación de Hikari | 4 (con `farol`); cierre desde 6 | 200 XP · `esencia` ×1 |
| `ecos` | Taiyō | 1; cierre desde 6 | 240 XP · `esencia` ×2 |
| `viento` | Momo; en Yoake tras el traslado | 1; cierre desde 6 | 260 XP · `manto_solar` ×1 |
| `jabali` | Yuki | 1 (con `katana`) | 200 XP · `onigiri` ×3 |
| `gruta` | Gruta de las Luciérnagas / Hikari | 1 (descubrir el lugar) | 180 XP · `esencia` ×1 |
| `pescador` | Kaito | 2 (tras su conversación principal) | 180 XP · `manto_marea` ×1 |
| `kiri` | Taiyō | 6 | 280 XP · `esencia` ×2 |
| `manada` | Camino de Escarcha / Hikari | 6 (descubrir Escarcha) | 300 XP · `esencia` ×2 |
| `oso` | Glaciar / Hikari; entrega a Yuki | 6 (tras `manada`, junto a Kuma) | 500 XP · `naginata` ×1 · `manto_escarcha` ×1 |

## Cierre de la entrega

- **Archivos tocados:** solo `docs/entregas_chatgpt/2026-11-02_secundarias.md`, creado para este encargo.
- **Decisiones tomadas:** conservar las 13 secundarias y sus ID; abrirlas según las regiones de `CAPITULOS`; reconocer progreso previo; pasar el té a Momo con `dlgHeredero`; trasladar sus ofertas y entregas a Yoake; esperar durante su captura; mantener recompensas existentes y dar el equipo de Kuma a través de Yuki; usar cierres breves y acciones entre llaves.
- **Preguntas abiertas / dudas:** ninguna necesaria para estas fichas. El parentesco de Taiyō se toma de la instrucción expresa del encargo. La revisión de los textos internos de murales y ecos que aún conserven la versión anterior queda señalada para la integración de Claude; no requiere inventar canon.
