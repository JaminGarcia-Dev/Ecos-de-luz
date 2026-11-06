# Fase 8 · Escenas y recompensas

**Fecha:** 3 de noviembre de 2026. **Entrega:** ChatGPT a Claude, dirección e implementación. **Estado:** diseño listo para implementar por bloques. Solo se escribe este documento.

## 0. Base y alcance

Aplicar el canon de `PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md` y las decisiones posteriores de `PLAN_JUEGO.md`. Se consultaron `COORDINACION.md`, `AGENTS.md`, `CLAUDE.md` y las investigaciones 01, 02 y, como base de contenido, 03. Los números de montaje siguen 03 §3.3. Los de movimiento y estilos siguen el plan aprobado, que prevalece sobre las alternativas de las investigaciones.

Se contrastaron las fichas de `59-guion-capitulos.js`, `68-secundarias.js`, `07-sistemas.js` y los montajes de 09, 39, 52 y 63. También sus conexiones en 08, 11, 17, 27, 35, 49, 51 y 60, la fauna y la obra del mural, Kiri y Yoake.

**Diferencias que la implementación debe resolver:**

- La apertura efectiva es la de 52. Sobrescribe `Cin.intro` de 09. No sumar ambas ni restaurar la apertura antigua.
- `Cin.perdidaTsuru` llama a `Cin.robo` con `sinRobo: true`. La campaña no roba un fragmento. Además, el montaje heredado muestra el pulso de Tsuru y su desaparición, pero no el ataque que la mata. Hay que mostrar esa causa.
- El cierre de Tasogare muestra un destello y su desaparición. Falta ver con claridad a Hikari detener la extracción. Se especifica abajo.
- `ITEMS` tiene cinco mantos en 07 y recibe `manto_guardian` mediante `Object.assign` en 11. Son seis en ejecución.
- El texto del mural 4 habla de guardiana, disco y conejo. Su dibujo actual en `texMural(4)` sigue siendo una flor. La sorpresa exige corregir ese dibujo primero.
- Las secundarias conceden XP y objetos. `completar` no lee un campo `rec.motas`. Este diseño no necesita añadirlo.
- La cola de `UI.banner` tiene un máximo de tres pendientes y deduplica por título. Eso puede perder recompensas distintas con el mismo título. `UI.aviso`, `UI.item` y el destello del contador de motas no pasan por esa cola.

No se cambia aquí la procedencia de armas. La naginata temprana, la oscuridad heredada de Tasogare y los demás estilos pertenecen a las fases 6–7. La oscuridad aprobada se aprende al deshacerse Tasogare; su presentación y explicación esperan al cierre del duelo y al silencio definidos en §5.

## 1. Cinemáticas

### 1.1. Cómo se calculan los tiempos

Son **duraciones calculadas del código**, sin omitir, avanzar, repetir ni pausar. No son cronometrajes de una partida. Se excluyen carga de terreno, precarga de ruta y diálogo manual posterior. El fundido forma parte del plano; no se suma otra vez.

En 09, `darTiempo` aplica a cada bloque de texto idéntico y consecutivo:

`tiempo actual = máximo(suma de duraciones, caracteres del txt / 15 + 1,4 s)`.

Cuenta también el nombre y el separador que construyen 52 y 63. Una misma frase entre dos planos comparte el presupuesto. Si hay ampliación, se reparte proporcionalmente. AP06 se pone directamente desde `f()`: ese rótulo no queda protegido por `darTiempo`.

Para el montaje nuevo, conservar ese mínimo y añadir el de 03:

`lectura mínima = máximo(caracteres del txt / 15 + 1,4; palabras del texto / 2,5 + 1)`.

La lectura empieza cuando el texto está entero y visible. Reservar aparte la entrada del subtítulo de hasta 0,45 s, los 0,3–0,6 s de preparación y cualquier fundido que quite legibilidad. No cortar al llegar al mínimo si falta ver la consecuencia. Mantener el resultado 1,5–2 s. Reacción normal: 0,8–1,2 s. Pausa emocional: 2–3 s.

Los tiempos nuevos de esta sección son el presupuesto final, incluidos esos márgenes. Con los textos actuales no necesitan crecer por lectura. Si cambia una línea, volver a calcularlos. `{repetir}`, `{interactuar}` y `{omitir}` conservan sus funciones. La omisión es voluntaria; los mínimos rigen la reproducción automática.

### 1.2. Inventario completo de escenas

P1 es el primer plano de cada función. En el prólogo se añade el índice 0–8 que usa 52.

| Función y origen | Montaje actual y duración aproximada | Montaje propuesto | Ajuste concreto y contenido que se conserva |
|---|---|---|---|
| `Cin.intro`, definición antigua de 09 | 9+10+10+5+4+8+10+9+11 = **76 s**. No es la apertura ejecutada. | **Sin activar.** | Mantener fuera de las rutas de campaña. Sus frases y su nacimiento inmediato de Hikari no sustituyen el prólogo vigente. Claude puede retirar la definición muerta conservando el motor y sus utilidades. |
| `Cin.intro`, sobrescritura de 52 | 10+14+14+14+14+10+10+12+12 = **110 s**. AP07 continuo durante 22 s. | **110 s**, mismos nueve tiempos. | Acortar la acción de espera en P4; usar su margen para la mano que prepara el corte. No recortar el conjunto Akari–hilo–Tasogare, las cuatro salidas ni la misma luna antes y después del cambio. Detalle en §1.3. |
| `Cin.huidaInicio`, 52 | Un plano de **12 s**. HU01 se pasa sin nombre. | **12 s**, 6+6. | Primer plano: Hikari, roca y barrido del ojo en el mismo cuadro. Segundo: roca cubre a Hikari y deja ver el camino. HU01 visible durante P1; P2 sin texto. Ningún ataque se resuelve en escena. |
| `Cin.purificado`, 09, cinco variantes | Un plano de **6 s** por gólem. Ninguna frase actual fuerza ampliación. | **8 s**, 3+5 por gólem. | Reducir la órbita a 0,4 rad en P1; detener cámara en P2. Mostrar al guardián vivo y en calma, con su núcleo accesible. Misma frase continua en ambos planos. Es una respuesta breve a la pelea; no rellenarla hasta 12 s. |
| `Cin.nocheRoja`, 39 | 6+6+8 = **20 s**. | **20 s**, mismos tiempos. | P1: rojo se asienta a los 4 s; quedan 2 s para reconocer el cambio. P2: terminar el brote de Sombras a los 4 s. P3: Tasogare prepara el gesto 0,5 s y conserva su frase 7 s; última reacción de Hikari, 0,5 s. |
| `Cin.robo`, 39, llamada sin opciones | 7+6+9+6 = **28 s**. Incluye robo de fragmento. | **Sin activar en campaña.** | No añadirle objetivos ni volver a emitir un robo. La parte reutilizable de Hinode se monta mediante `perdidaTsuru`. La rama antigua queda fuera del recorrido. |
| `Cin.perdidaTsuru`, adaptador de 63 sobre 39 | 6+9+6 = **21 s**. Su tipo interno actual es `'robo'`. | **45 s**, 6+7+8+9+9+6. | Desdoblar el plano central. Añadir ataque de Sombra visible, respuesta de Tsuru y pérdida irreversible. Dar más tiempo a Momo y al farol. Conservar C4T01–03 y `Sis.perder('tsuru','momo')`. Detalle en §1.4. |
| `Cin.recuerdo(cb, 0)`, Pétalo, 52 | 8+8+6 = **22 s**. | **22 s**, mismos tiempos. | P1: percibir desde la niña; P2: extracción visible; P3: luz se dispersa. Mantener CPR01 y la duda de Hikari en el diálogo posterior. No nombrarla Akari. |
| `Cin.recuerdo(cb, 1)`, Marea, 52 | 8+8+6 = **22 s**. Sin texto dentro. | **22 s**, mismos tiempos. | P1 conserva manos en primer término y puerta al fondo. P2 muestra el hilo tirando desde el mismo lado. P3 mantiene 2 s del resultado antes del fundido de 2 s. El contraste con Rui sigue en C2RE02–04. |
| `Cin.recuerdo(cb, 2)`, Duna, 52 | 8+8+6 = **22 s**. La variante actual comparte casi todo con Pétalo; solo apaga el hilo. | **22 s**, mismos tiempos. | En P2 añadir antebrazo y filo cruzando el hilo: preparación hasta 2 s, corte a los 3 s, hilo apagado a los 3,1 s. Conservar eje y sostener resultado hasta el final. P3: dispersión, sin cara ni parentesco nuevo. |
| `Cin.recuerdo(cb, 3)`, Escarcha, 52 | 8+8+6 = **22 s**. C6M01 cabe en el último plano. | **25 s**, 8+8+9. | Alargar solo P3 en 3 s. Mostrar a Tasogare y el corte antes de C6M01. Corte a 1,2 s; reacción hasta 2,2 s; «¡Padre!» desde 2,6 s, entero al menos 3,14 s; fundido en 7–9 s. No anticipar esa palabra en otras memorias. |
| `Cin.travesia(true)`, C4, 63 | 9+8+9+7 = **33 s**. | **24 s**, 5+7+5+7. | Recortar salida 4 s, niebla 1 s y aproximación 4 s. Conservar salida por agua, cruce del límite y contraste rojo/cielo. C4B06/08/10/11 requieren 4,07/4,60/3,40/5,60 s de lectura. En P2 quedan 5,5 s antes del fundido de 1,5 s: alcanzan para C4B08 y su entrada. Último plano sin fundido. |
| `Cin.travesia(false)`, C4, 63 | **33 s**. Solo C4B08 en P2. | **16 s**, 4+5+4+3. | Mismo recorrido inverso; P2 conserva 4,60 s de lectura. El salto espacial sigue oculto por el fundido de 1,5 s. **Mover C4B08 a P1**, continuo también en P2: dispone de 9 s antes del corte. No prometer 4,60 s legibles dentro de un P2 de 5 s con fundido. |
| `Cin.travesia(true, ..., {sinTextos:true,sinRojo:true})`, epílogo, 63 | **33 s**, sin texto. | **16 s**, 4+4+5+3. | Conservar 2 s de agua abierta y 2 s de llegada. No hay proyección ni humo rojo. `sinRojo` debe apagar también la emisión de humo de P2, que hoy se genera por índice de plano. |
| `Cin.capturaMomo`, 63 | 7+6 = **13 s**. | **16 s**, 7+9. | Mantener P1. Alargar P2 para ver la decisión de Momo: mira a Yuki, suelta el lazo a 1,5 s, Tasogare la oculta con humo a 3 s y se van a 4 s. Lazo solo y visible de 4–8 s; fundido de 8–9 s. No representar su desaparición como muerte. |
| `Cin.muerteTasogare`, 63 | 6+5+7+5 = **23 s**. | **45 s**, 8+8+12+10+7. | Alargar y abrir un plano conjunto que enseñe extracción, respuesta de Hikari y liberación de Momo. Conservar C5F03/04/06/07, `momoRescatada` y el diálogo C5D posterior. Detalle en §1.5. |
| `Cin.encarnacion`, 63 | Base 5+5+5+4 = 19 s. Lectura: 5+5+5,07+5,53 = **20,60 s**. | **22 s**, 5+5+6+6. | Alargar P3 a 6 y P4 a 6. Conexiones encendidas desde 0,5 s de P3; conservar cuerpo tangible, escala frente a Hikari y cuatro anclajes. C7D03 se lee antes de devolver la cámara. No omitir el combate mediante esta función. |
| `Cin.liberacion`, 63 | 6+6+8 = **20 s**. | **45 s**, 10+16+19. | Alargar los tres planos: corte del núcleo y Roja vencida; apertura de salida y reducción de Lumi; Dorada liberada y desaparición del rojo. Conservar C7F01–02, `doradaLibre`, `lumiLuciernaga` y la conversación C7F04–10. Detalle en §1.6. |

`EscenasCapitulos.creditos` no es una `Cin.*`. Es un panel que espera «Seguir en el valle». Su duración es **libre**. Conservarlo. No asignarle segundos ni contar su lectura como escena automática. `Cin.repetir`, `avanzar`, `actualizar`, `estadoPlano`, `colocarJugador`, `alFinal` y `util` son operaciones del motor, no escenas adicionales.

### 1.3. Prólogo: preservar los 110 s y mejorar la actuación

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| F8-AP-P1 | Tsuru, testimonio | Conservar AP01 | P1 / índice 0, 0–10 s | Mantener luna y faro en cuadro. No anticipar un cielo rojo general. |
| F8-AP-P2 | Tsuru | Conservar AP02 | P2 / índice 1, 0–14 s | Un conjunto sitúa vecinos, niña, escalinata y faro. AP02 tiene 17 palabras: reservar **7,8 s** de lectura, además de entrada. |
| F8-AP-P3 | Tsuru | Conservar AP03 | P3 / índice 2, 0–14 s | Akari sube. Tasogare acompaña. No introducir un encuadre que declare parentesco. |
| F8-AP-P4 | Tasogare | Sin texto | P4 / índice 3, 0–14 s | Mirada hacia la puerta 0–4; ve a Akari 4–7; mano se aproxima al arma 7–10; conjunto inmóvil 10–14. Sustituye espera indiferenciada. |
| F8-AP-P5 | Tsuru | Conservar AP04 | P5 / índice 4, 0–14 s | Hilo visible desde 0,8 s. Akari se inclina; resultado legible hasta el corte siguiente. |
| F8-AP-P6 | Tasogare | Conservar AP05 | P6 / índice 5, 0–10 s | Mantener corte a 3 s y dispersión 5–8 s. Akari, filo e hilo comparten plano. Dos segundos del resultado. |
| F8-AP-P7 | Tsuru | Conservar AP07, continuo hasta P8 | P7 / índice 6, 0–10 s | Mantener salida de cuatro fragmentos de 1–6 s. Conservar direcciones y colores. |
| F8-AP-P8 | Tsuru | Mismo AP07, sin reiniciar lectura | P8 / índice 7, 0–12 s | Mantener cambio lunar 1–5 s. Mostrar el mismo disco rojo hasta 12 s. No confundirlo con la Noche Roja de C4. |
| F8-AP-P9 | Rótulo | Conservar AP06 | P9 / índice 8, desde 5 s; fundido 10,5–12 s | Queda entero **5,5 s** antes del fundido. Conservar esta excepción explícita al motor de lectura. |

No retimar `SONIDOS_PROLOGO` mientras se conserven estos contactos. Si Claude mueve uno, sonido y efecto dependen del tiempo del acontecimiento, no de una suma global de duraciones.

### 1.4. Tsuru: 45 s, ataque y consecuencia visibles

La Sombra mata a Tsuru cuando protege a Momo. El farol repele a las Sombras; no es un sacrificio voluntario que consume su núcleo. Nada de sangre, impacto gráfico o cuerpo caído.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| F8-TS-P1 | Momo | C4T01: «¡Abuela, por aquí!» | P1, 6 s; texto desde 0,4 s | Conjunto del cerco. Se entiende dónde está la salida hacia Yuki. |
| F8-TS-P2 | Tsuru | C4T02: «Sigue con Yuki.» | P2, 7 s; texto desde 0,5 s | Entra y se coloca entre Momo y la Sombra del hueco. Alza el farol en 3–4 s. |
| F8-TS-P3 | Tsuru y Sombra | Sin texto | P3, 8 s | La Sombra prepara 0,6 s, alcanza su silueta a 1,2 s y la atraviesa como oscuridad. Tsuru pierde firmeza, sigue cubriendo a Momo y el farol emite el pulso a 3,5 s. Conjunto sin corte de eje. |
| F8-TS-P4 | Tsuru | Sin texto | P4, 9 s | Las Sombras retroceden 0–2 s. Tsuru se deshace en luz 2–5 s. Farol cae 5–6 s. Mantener su ausencia y el farol 6–9 s. Ambiente, sin fanfarria. |
| F8-TS-P5 | Momo y Hikari | C4T03: «¡Abuela!» | P5, 9 s; texto desde 0,8 s | Momo tiende la mano al espacio vacío. Hikari se acerca y recoge el farol 4–5 s. Momo permanece junto a ella. |
| F8-TS-P6 | Hikari y Momo | Sin texto | P6, 6 s; fundido final de 1 s | Hikari baja la mano libre para acompañarla. Tres segundos sin gesto nuevo antes del fundido. |

Reasignar los umbrales de `TSURU_ESCENA` a estos planos. No dejar activos los antiguos `estalla:4.5`, `deshace:[5,7]` y `cae:7` en un plano que ahora cumple otra función. Farol concedido una vez por el final lógico, aunque se omita antes de recogerlo. Su objeto existe al retomar; su aviso espera. C4T04–07 se leen después, con duración manual y sin recompensas sobre el diálogo.

### 1.5. Tasogare: 45 s, Hikari impide otra extracción

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| F8-TA-P1 | Tasogare | C5F03: «Todavía puedo recuperar a Akari.» | P1, 8 s; texto desde 0,5 s | Conjunto lateral: Hikari, Tasogare, cierre, aro y Momo. Tasogare se vuelve al mecanismo; no está rendido. |
| F8-TA-P2 | Momo | C5F04: «¡Vuelve a tirar de mí!» | P2, 8 s; texto desde 1 s | Tasogare acciona a 0,6 s. El hilo sale **de Momo hacia el conducto** a 1 s. Hikari lo mira y prepara la intervención al final del plano. |
| F8-TA-P3 | Hikari; después Momo | C5F06: «Se detuvo.» | P3, 12 s; texto desde 6 s | Hikari interviene a 1,2 s. Mostrar su gesto y a Tasogare en el mismo cuadro. Hilo se apaga a 1,3 s; él se deshace entre 2,4–5,5 s. Aro se abre a 5,5 s. Momo reacciona 0,5 s antes de hablar. Resultado estable hasta 12 s. |
| F8-TA-P4 | Hikari | C5F07: «Ven.» | P4, 10 s; texto desde 0,5 s | Tiende la mano. Momo cruza el aro abierto 2–5 s. Ambas se apartan del extractor y bajan las manos. |
| F8-TA-P5 | Hikari y Momo | Sin texto | P5, 7 s; fundido final de 1 s | Acompañar a Momo. El sitio de Tasogare queda vacío. Tres segundos de quietud antes del fundido. |

La puesta en escena respeta la ranura ofensiva única del plan. Usar el estilo que Hikari tenga equipado. Con arma, el contacto usa su animación; con magia, su descarga. La resolución dirigida es la misma y no equipa otra escuela o espada a escondidas. La versión actual puede usar su ataque disponible; al integrar las fases 6–7 se sustituye ese único gesto mediante la ranura ofensiva.

El cambio de `momoRescatada` y la emisión de `c5:momo_liberada` deben ocurrir también al omitir. No depender del `in()` de P4, como hace hoy la marca en el último plano. La oscuridad heredada no aparece como botín que sale de él: guardar el aprendizaje aprobado y presentar su ficha tras C5D y 20 s seguros. No añadirle ahora una explicación de linaje o corrupción.

### 1.6. Liberación: 45 s tras la victoria jugada

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| F8-LI-P1 | Lumi y Hikari | Conservar C7F01 | P1, 10 s; texto desde 0,4 s | Roja ya vencida. Hikari corta el núcleo de extracción a 2 s. El cuerpo se deshace 4–7 s. Resultado visible 7–10 s. La victoria no la realiza Lumi. |
| F8-LI-P2 | Lumi | Conservar C7F02 | P2, 16 s; texto desde 0,5 s | Sigue el trayecto al conducto. Abre salida a 6 s y la reserva fluye hacia afuera 6–11 s. Reducción hasta escala `0.35` en 11–13 s. Sostener 13–16 s para reconocerla. |
| F8-LI-P3 | Luna Dorada | Sin texto nuevo | P3, 19 s; fundido final de 1,5 s | Se ven prisión y cadenas 0–3 s. Cadenas ceden 3–9 s; rojo desaparece 7–12 s. Dorada libre y cielo sin proyección 12–17,5 s. |

Después se conserva íntegra la conversación C7F04–10. Expresa que nadie resucita. El modelo de la Dorada puede ocultarse al pasar a la conversación según la arquitectura vigente; no convertir esa desaparición técnica en una segunda muerte. Al omitir, restaurar el mismo cielo, escala de Lumi, flags y posición final.

### 1.7. Motor, pausa y omisión

Todos los gestos nuevos se disparan por `t` del plano y una marca local de ejecución. Retirar de los montajes tocados los `setTimeout` de efectos. Pausar congela actor, texto, pulso, partículas y temporizadores narrativos. Repetir reinicia la puesta en escena del plano; no vuelve a pagar ni a consumir objetos.

Separar **presentar** y **confirmar estado final**. La misma confirmación, una sola vez, sirve al final normal y a `{omitir}`. Guardar después de aplicar todo el resultado. El código actual emite `narrativa:terminar` antes del callback final: la cola debe esperar a que finalice el callback y a un nuevo fotograma seguro.

Para Tsuru, usar un identificador semántico `perdidaTsuru`, aunque se reutilice la función de 39. No bloquear recompensas según un `'robo'` genérico. Si se mantiene ese tipo interno por compatibilidad, transmitir además `emocion:'tsuru'` desde el adaptador. Tasogare usa `muerteTasogare`.

Al omitir, actualizar misión y permitir consultar dos frases en el diario. No abrir otra escena obligatoria de resumen. Reutilizar las notas de capítulo existentes. En los dos cierres de pérdida, la notificación de esa nota también espera a §5.

## 2. Cinco secundarias como situaciones

### 2.1. Contrato común

Conservar los IDs de misión, XP, objetos y cantidades. No cambiar los eventos principales ni añadir moneda al premio. Las siguientes fichas usan el formato de 68. Los nombres de funciones nuevos son contratos de implementación, no funciones que ya existan.

Las conversaciones principales tienen prioridad. Una oferta secundaria espera a que termine el bloque principal del NPC. El aviso de cierre espera a la lectura que esté activa; no se pierde por el `if (q.cierre && !UI.dlg)` actual. No terminar misiones con un `setTimeout(50)` mientras aún se lee la entrega: confirmar al cerrar su conversación. La omisión de esa conversación confirma el mismo resultado.

`Sis.npcDe('tsuru')` sigue resolviendo la herencia a Momo. Durante captura, asedio o un traslado, esperar a su ubicación real y disponibilidad. Después del rescate, la entrega señala a Momo en Yoake. Una marca de misión guardada nunca exige volver a un NPC ausente.

### 2.2. `chispas`: aprender a reconocer un desvío

```js
{ id: 'chispas', nom: 'Luz dispersa', dif: 0, tipo: 's',
  des: { npc: 'yuki', cap: 1 },
  intro: ['La luz queda atrapada entre las rocas del camino.',
    'Sigue seis chispas. Puedes reunirlas sin apartarte mucho.'],
  desc: 'Sigue la luz entre el camino y sus dos claros. La sexta chispa cierra el recorrido.',
  rec: { xp: 50, items: [['esencia', 1]] },
  pasos: [{ k: 'ev', ev: 'chispa', n: 6,
    txt: 'Recoge seis chispas en las regiones abiertas; mira también a los lados del camino',
    pos: 'chispa' }],
  cierre: ['La luz también vuelve por estos claros. Puedo seguir hacia el altar.'] }
```

**Situación:** seis chispas en tres parejas. La primera enseña la continuidad del camino; la segunda aparece tras una roca baja; la tercera se ve desde el borde de un claro. Dos desvíos de 6 m, con retorno visible. Sin contador que se reinicie, carrera obligatoria ni pelea añadida. La colocación precisa se define en §3.3. Las demás chispas del mundo también cuentan; no crear una cuota territorial nueva.

**Resultado:** cierre automático al sexto evento; la esencia entra en el inventario. No exigir regresar. En la siguiente conversación libre con Yuki, una sola línea: «Encontraste luz donde parecía que el camino terminaba.» No añadir un paso `hablar` para poder oírla.

**Fuera de orden:** al aceptar, contar únicamente las claves de `ST.rec` que coincidan con `^c[0-9]+$`, hasta seis. No usar `previo:'rec'`, que también contaría flores, perlas y otros objetos. Reconciliar el contador y cerrar una vez. En una partida antigua con la misión activa y `p:1`, el sexto evento ya estaba cumplido: completar al migrar sin exigir la charla. Si ya estaba hecha, no pagar de nuevo.

**Eventos nuevos:** ninguno. Conservar `ev:'chispa'`. Marcas propuestas: `ST.secundarias.chispasComentarioPendiente` y `chispasComentarioVisto`.

### 2.3. `te`: preparar y compartir una pausa

```js
{ id: 'te', nom: 'Té para compartir', dif: 0, tipo: 's',
  des: { npc: 'tsuru', cap: 1 },
  intro: ['Me sentaré un momento. Podemos preparar té.',
    'Hay cinco flores entre los dos parches junto a Hinode.'],
  introHeredero: ['Quiero preparar el té que hacía la abuela.',
    'Podemos compartirlo cuando tengamos cinco flores.'],
  desc: 'Reúne cinco flores. Prepara té y compártelo con Tsuru o con Momo.',
  rec: { xp: 80, items: [['te', 3]] },
  pasos: [
    { k: 'inv', it: 'flor', n: 5,
      txt: 'Reúne cinco flores en los dos parches cercanos a Hinode', pos: 'flor' },
    { k: 'hablar', npc: 'tsuru', txt: 'Preparar té juntos ({interactuar})',
      quita: ['flor', 5],
      dlg: ['Pon las flores aquí. Yo serviré el té.'],
      dlgHeredero: ['Ponlas aquí. Puedo prepararlo contigo.'] },
    { k: 'escena', cin: 'teCompartido', npc: 'tsuru', r: 3.4,
      txt: 'Comparte el té junto al banco' }
  ],
  cierre: ['Quedan tres tazas para el camino.'] }
```

**Obra y recogida:** conservar los ocho IDs de flores `f0–f7`. Reagrupar cinco en dos parches de 3+2 a 12–20 m del borde transitable de Hinode; dejar tres de reserva. Reutilizar el recolectable actual. No cambiar la receta general de cocina ni exigir hierba además de estas cinco flores.

**Escena nueva `Cin.teCompartido`: 6 s**, un plano de resultado doméstico, sin locución. Reutilizar la posición del NPC heredero y un banco colocado a un lado de su punto de entrega; no caminar atravesando una casa para sentarse. Banco de 1,6 × 0,35 m, asiento a 0,4 m. Dos tazas y una tetera pequeñas de geometría existente. En Yoake, usar un banco del refugio; no llevar allí el banco de Hinode. Dos actores como máximo, con espacio para Hikari.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| F8-TE-01 | Tsuru o Momo; Hikari | Sin texto | 0–1 s | Se acomodan. Hikari deja las flores en la bandeja. |
| F8-TE-02 | Tsuru o Momo | Sin texto | 1–3 s | Inclina la tetera y acerca una taza. No necesita una simulación de líquido. |
| F8-TE-03 | Ambas | Sin texto | 3–6 s | Sostienen las tazas. La bandeja queda en el banco. Dos segundos de reposo. |
| F8-TE-04 | Hikari | «Quedan tres tazas para el camino.» | Al cerrar, con lectura manual o en cola | Guarda lo que llevarán. Las tres tazas son la recompensa consumible, no otras dos entregas adicionales. |

**Confirmación:** descontar las cinco flores una sola vez al cerrar el paso de conversación. Guardar `ST.secundarias.tePreparado=true` y pasar a la escena. Al cargar desde ahí, reanudar el compartir sin pedir más flores. Al omitir la escena, dejar bandeja y banco en su estado final y completar con las mismas tres tazas. Al acabar, guardar `teCompartido=true`; el banco queda como lugar de descanso visual. No concede regeneración adicional.

**Eventos nuevos:** ninguno para la misión; usa `inv`, `hablar` y `escena` existentes. Requiere registrar la nueva función `Cin.teCompartido` y resolver su `npc` mediante `npcDe`. No basta con copiar la ficha sin implementar el montaje.

### 2.4. `pescador`: leer la orilla y devolverle una actividad a Kaito

```js
{ id: 'pescador', nom: 'La caña de Kaito', dif: 1, tipo: 's',
  des: { npc: 'kaito', cap: 2, paso: ['c2_marea', 1] },
  intro: ['Mi caña quedó en la orilla oeste de la laguna.',
    'Desde la tabla rota se ve el corcho entre los juncos.'],
  desc: 'Sigue las señales de la orilla. Puedes rodear por tierra o entrar al agua.',
  rec: { xp: 180, items: [['manto_marea', 1]] },
  pasos: [
    { k: 'ev', ev: 'cana', txt: 'Busca el corcho entre los juncos de la orilla oeste', pos: 'cana' },
    { k: 'hablar', npc: 'kaito', txt: 'Devuelve la caña a Kaito ({interactuar})',
      quita: ['cana', 1],
      dlg: ['Ya puedo volver a sentarme junto al agua.',
        'Lleva este manto. Te acompañará en Marea.'] }
  ] }
```

**Mantener** el recolectable `cana`, ID `ca`, en `x:-196, z:188`, con la altura actual `max(altura,0)+0,9`. Una caña. Un Manto de Marea. No afirmar que fue de Rui.

**Dos pistas físicas:** una tabla vieja de 0,8 × 0,15 m a 6 m del objeto, en la orilla seca más cercana; corcho de 0,08 m y línea corta junto al punto de recogida. Ambos se ven sin activar un poder. Para el punto seco, buscar alrededor de `ca` en radios 6, 7 y 8 m, pasos angulares de 15°, el primer suelo con altura >0,8 m, pendiente <0,35 y espacio libre de radio 0,6 m. Ordenar candidatos por cercanía al muelle. No desplazar la caña para hacerla coincidir con la tabla.

**Elección:** caminar por el borde transitable hasta el objeto o nadar hasta él y volver a la misma orilla. No exigir nado rápido, buceo dirigido ni gastar luz. La actividad funciona con el movimiento actual. Las pistas no añaden pasos obligatorios ni un tercer objeto a entregar.

**Resultado visible:** al cerrar la entrega, Kaito sostiene la caña recuperada, se orienta al agua y la baja durante 3 s. Después conserva su rutina de pesca. Cámara libre. Guardar `ST.secundarias.canaDevuelta=true`; reconstruir el accesorio al cargar, salvo que la historia lo tenga embarcando o en otra tarea. El manto se concede al confirmar la entrega; su aviso espera a que termine el gesto.

**Fuera de orden:** si `ST.rec.ca` o `Sis.tiene('cana')` ya es verdadero al ofrecerla, reconciliar el primer paso. Si la caña ya se devolvió en una partida anterior, conservar `hecha`; no reclamar otra. Una recogida previa no se descarta por no estar aún activo `ev:'cana'`.

**Eventos nuevos:** ninguno. Conservar `ev:'cana'`. El gesto de Kaito es una reacción local, no una cinemática obligatoria.

### 2.5. `amigos`: tres individuos, tres aproximaciones

```js
{ id: 'amigos', nom: 'Amigos del bosque', dif: 0, tipo: 's',
  des: { npc: 'yuki', cap: 1 },
  intro: ['Si te quedas tranquila, algunos animales se acercan.',
    'Prueba con tres distintos. Deja que elijan la distancia.'],
  desc: 'Gana la confianza de tres animales distintos y cuenta a Yuki qué hicieron.',
  rec: { xp: 70, items: [['manto_sakura', 1]] },
  pasos: [
    { k: 'ev', ev: 'acariciar', n: 3,
      txt: 'Acércate con {agacharse}; acaricia a tres animales distintos con {interactuar}' },
    { k: 'hablar', npc: 'yuki', txt: 'Cuenta a Yuki cómo se acercaron ({interactuar})',
      dlg: ['No necesitaste perseguirlos.',
        'Quiero que tengas el Manto de Sakura.'] }
  ] }
```

**Situación:** parar, agacharse y dejar que un animal curioso se acerque. La aproximación tranquila usa 2,5 s dentro del comportamiento de confianza existente. No añadir 2,5 s después de que el aviso de acariciar ya esté disponible. Si una tortuga ya permite la caricia, conservar esa solución.

**Identidad:** `Fauna.acariciar` ya emite `Bus.emit('acariciado',{a,sp})`. Usar `a` para identificar al individuo. Los animales comunes tienen hoy `a.id:null`: no sirve contar por especie, nombre o UUID temporal de la malla. Añadir un campo separado `a.uidAmistad` para no convertirlos en fauna nombrada ni alterar su descarga por distancia.

Para nombrados, usar `nom:<a.id>`. Para comunes, asignar `fauna:<contador>` al crearlos, con contador creciente en `ST.secundarias.siguienteAnimal`. Conservar el UID si se restaura ese mismo individuo; una aparición procedural nueva recibe otro. Guardar los UID acariciados como claves de `ST.secundarias.amistades`. Desaparecer una malla no borra el progreso de confianza ya ganado. No usar su posición actual como identidad.

El evento **sigue siendo `ev:'acariciar'`**, con cantidad 3. Mover su emisión incondicional de 07 al tratamiento de la primera caricia de cada UID. Guardar primero el UID; emitir después `Sis.evento('acariciar')`. Eliminar la segunda emisión de la interacción antigua para no contar dos veces. Las caricias repetidas siguen teniendo gesto y sonido, pero no suben este contador.

**Resultado:** `petT=2` ya ofrece la reacción. Tras la tercera caricia, el animal permanece tranquilo esos 2 s; no se fija a Hikari ni se teletransporta para asistir a la entrega de Yuki. El manto queda vinculado a haber esperado y observado. No hace falta perseguir, provocar ni calmar por golpes.

**Fuera de orden y guardados antiguos:** contar las claves de `amistades` al aceptar y al cargar. Si la misión vieja ya llegó a `p:1`, respetar sus tres caricias como progreso adquirido y dejar disponible la entrega. Si estaba en `p:0`, conservar su `c` antiguo como crédito y exigir solo `3-c` primeras caricias nuevas. No inventar identidades históricas ni reiniciar al jugador a cero. Una misión hecha conserva su premio.

**Eventos nuevos:** ninguno. Sí requiere UID, deduplicación y migración explícitos.

### 2.6. `kiri`: reconocer cómo se subió, sin otro viaje de entrega

```js
{ id: 'kiri', nom: 'Cumbre de Kiri', dif: 2, tipo: 's',
  des: { npc: 'taiyo', cap: 6 },
  intro: ['Desde la cima puedes reconocer las corrientes que te sostuvieron.',
    'Mira sus apoyos y luego el valle. No hace falta que vuelvas a contármelo.'],
  desc: 'Alcanza Kiri y reconoce la subida desde sus dos lados seguros.',
  rec: { xp: 280, items: [['esencia', 2]] },
  pasos: [
    { k: 'ir', x: 220, z: -316, r: 16, y: 95,
      txt: 'Llega a la cima con las columnas de aire y {saltar}' },
    { k: 'ev', ev: 'kiri:panorama',
      txt: 'Observa las corrientes y el valle desde los dos lados de la losa',
      pos: () => Estr.cima }
  ],
  cierre: ['Desde aquí reconozco los apoyos de la subida. Ya sé por dónde bajar.'] }
```

Se conservan el ascenso existente, `x:220,z:-316,r:16,y:95`, 280 XP y dos esencias. La parte opcional es observar; leer el registro principal no completa esa observación. Se retira la vuelta a Taiyō.

**Dos posiciones en la losa existente**, sin construir apoyos en el aire. Usar `C=Estr.cima`, pues la obra busca el punto más alto y puede desplazar el centro. Sea `f=normalize((-C.x,-C.z))`, hacia el faro, y `l=(-f.z,f.x)`. Posición izquierda `C+0,7·l`; derecha `C-0,7·l`. Pies a `C.y`. La losa tiene radio 2,6 m: ambos puntos quedan dentro. Prompt disponible en radio 0,65 m, con Hikari en suelo y diferencia de altura ≤0,6 m.

Izquierda: `{interactuar}` muestra foco de 2 s hacia `CORR[2]`, la última corriente (`233,-287`). Derecha: foco de 2 s hacia el faro. Entrada/salida de 0,4 s incluidas en cada foco. Se devuelve antes al mover la cámara; si se cancela antes de 1 s de vista estable, ese lado no cuenta. No bloquear desplazamiento, leer otro registro ni subir a una segunda cumbre.

Guardar `ST.secundarias.kiriVistas.corrientes` y `.valle` por separado. Cuando ambas sean verdaderas, emitir **una vez** `Sis.evento('kiri:panorama')`. Es el único evento de misión nuevo de estas cinco fichas. Reconciliarlo al aceptar o cargar. La visita principal se reconoce por `ST.lug.kiri` o por `ST.mis.c6_kiri` hecha o con `p>=8`, que ya superó `c6:registro_leido`; avanza el primer paso sin repetir la subida. No buscar un evento histórico en un registro que el motor no conserva.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| F8-KI-01 | Hikari | Sin texto | Foco izquierdo, 2 s | Reconocer la última columna de aire y el apoyo del que llegó. |
| F8-KI-02 | Hikari | Sin texto | Foco derecho, 2 s | Reconocer el valle. No revelar otra prueba crucial. |
| F8-KI-03 | Hikari | «Desde aquí reconozco los apoyos de la subida. Ya sé por dónde bajar.» | Tras ambos focos, lectura manual o en cola | Cierre automático. Dos esencias; no regreso de entrega. |

La partida antigua con `kiri` hecha sigue hecha. Si estaba esperando entregar a Taiyō, conservar el premio pendiente: completar con el cierre al migrar, sin imponerle dos vistas nuevas. Las partidas nuevas y las que aún estaban subiendo usan la ficha revisada.

## 3. Economía de motas

### 3.1. Ingresos: qué existe y qué se propone

**Objetivo:** que se pueda comprar una mejora de 40 durante C1 y otra de 90, en la misma rama, al terminar C2. No se restringe comprar antes si el jugador explora más o elige otra rama. No es una cerradura por capítulo.

| Fuente | Valor actual y propuesto | C1 para la ruta de referencia | C2 añadido | Concesión y persistencia |
|---|---:|---:|---:|---|
| Chispa | **5 motas**; también 3 XP y hasta 15 de luz | 8 × 5 = **40** | 3 × 5 = **15** | `ST.rec.cN`. Una vez por chispa. Se recolocan 11 de las 80; no se crean 11 adicionales. |
| `chispas` | **0 motas**, 50 XP, 1 esencia | 0 | 0 | El sexto evento da el objeto, no otras 30 motas. |
| `te` | **0 motas**, 80 XP, 3 tés | 0 | 0 | Cinco flores consumidas una vez. |
| `amigos` | **0 motas**, 70 XP, Manto de Sakura | 0 | 0 | Tres individuos; un manto. |
| `pescador` | **0 motas**, 180 XP, Manto de Marea | — | 0 | Una caña devuelta una vez. |
| `kiri` | **0 motas**, 280 XP, 2 esencias | — | — | Desde C6. No interviene en las primeras compras. |
| Otras ocho secundarias | **0 motas** | 0 | 0 | Mantener sus premios. No convertir XP en moneda. |
| Regalos de NPC, cofres y consumibles | **0 motas** en esta fase | 0 | 0 | No inventar un fondo inicial, regalo retroactivo ni venta de té. |
| Oni guardián del santuario | **25 motas** | Pétalo: **25** | Marea: **25** | `ST.onis.petalo` y `.marea` evitan repetir el guardia. No añadir otro pago en la misión principal. |
| Eco nuevo | **25 motas** | Extras según exploración | Kaito y Rui: **25**, ya exigido por la principal | `ST.ecos[id]`. Si se oyó antes, su ingreso ya está en la cuenta anterior, no se vuelve a sumar. |
| Sombras comunes | Rastrera **3**, escudo **5**, lanzadora **4** | Variable | Variable | Ingreso adicional por encuentros. No se exige cultivarlas para financiar la ruta. |
| Fragmento, purificación, nivel y descubrimiento | **0 motas** | 0 | 0 | Sus XP, recuperación y cambios del mundo conservan su función. |

El código genera 80 chispas con semilla 4242, pero no asegura ocho en una ruta normal de C1. La intervención de economía es **colocación**, no multiplicar premios. Los seis ecos completos añaden 150 motas en toda la campaña. Las 80 chispas aportan 400. Son techos de recogidas únicas, no previsiones de lo que verá cada jugador.

### 3.2. Compras: mantener `MEJORAS_ALTAR`

El importe de la tabla es el precio de **ese nivel**, no el acumulado.

| Rama / ID | Nivel 1 | Nivel 2 | Nivel 3 | Acumulado | Efecto acumulado en niveles 1 / 2 / 3 |
|---|---:|---:|---:|---:|---|
| Capa de luz / `capa` | 40 | 90 | 160 | **290** | Gasto de planeo −12/24/36 %; caída −6/12/18 %. |
| Corazón de luz / `vida` | 40 | 90 | 160 | **290** | Vida máxima +15/+30/+45 antes del multiplicador del manto. |
| Hilo de luz / `manto` | 60 | 120 | 200 | **380** | Multiplica el único efecto elegido por 1,25/1,50/1,75. No suma puntos porcentuales directos. |
| **Total** | **140** | **300** | **520** | **960** | No es un requisito para terminar el juego. |

Ejemplo: Sakura pasa de +20 % de luz a +25 % con Hilo I. Alba no tiene efecto: advertir «Este manto no tiene una bonificación que ampliar» y mostrar el efecto seleccionado. No vender Hilo I como +25 % de luz para cualquier manto.

La fase 2 hace que el nado rápido use el coste del planeo. Cuando se integre, la descripción de Capa debe mencionar también ese efecto. No introducir un descuento diferente desde fase 8. Compras a menos de **6 m** del altar, con los bloqueos de reto e interacción existentes.

### 3.3. Colocación concreta de las once chispas

Mantener los IDs `c0–c10` y la suma global de 80. Reproducir primero el sorteo original completo de posiciones con semilla 4242; después sustituir solo las coordenadas de `c0–c10` por las anclas de esta tabla. Conservar la secuencia de azar y las posiciones originales de `c11–c79`. No empezar el generador en `n=11`, porque cambiaría la correspondencia entre IDs y posiciones. Toda chispa reservada ya recogida sigue recogida.

**Ocho de C1:** utilizar la polilínea `CAMINOS[2]`, faro → Pétalo, que ya construye `trazarCaminos`. `P(d)` es el punto a distancia acumulada `d` desde el extremo del faro; `n(d)` es su perpendicular horizontal normalizada. Así se apoya la colocación en un camino existente y no en una diagonal que corte rocas.

| IDs | Centro y separación | Función |
|---|---|---|
| `c0,c1` | `P(55)` y `P(63)` | Pareja sobre el camino. Enseña continuidad. |
| `c2,c3` | `P(100)+6n` y `P(108)+6n` | Primer desvío corto; visibles al salir de una roca baja. |
| `c4,c5` | `P(155)-6n` y `P(163)-6n` | Segundo desvío; se reconoce desde el camino. Cierra la secundaria si eran las primeras seis. |
| `c6,c7` | En el acceso al altar del Pétalo, a 11 y 7 m del altar, sobre la ruta de llegada | Completa 40 motas y vuelve a conectar con una compra. Fuera del volumen del altar y de los faroles. |

Para `c6,c7`, proyectar el acceso hacia el último punto transitable del camino que queda frente al santuario; colocar sobre el recorrido peatonal de la escalinata, no dentro del edificio. Altura de cada chispa: apoyo real de los pies +1,1 m. No tomar el terreno bajo la plataforma si hay una losa encima.

**Tres de C2:** `c8,c9,c10` en el recorrido desde el muelle de Kaito hacia el guardia de Marea (`-189,178`), a 18, 28 y 38 m desde el muelle. Usar el borde seco existente, no cruzar en línea recta la laguna. En cada distancia elegir el punto transitable más cercano del borde; altura de pies +1,1 m. No usar las posiciones de las cinco perlas ni la Perla de Marea.

Regla de colocación común: regiones ya abiertas, pendiente <0,35, altura >0,8 m, sin sólido en un radio de 0,7 m y sin separación vertical que exija escalar. Para los desvíos laterales, si el punto de 6 m no sirve, probar 5, 4 y 3 m sobre la misma perpendicular. Si ninguno sirve, ponerlo sobre el camino. No añadir un obstáculo para ocultar una chispa. Mantener al menos 4 m entre objetos. Validar la accesibilidad con los sólidos de la fase 1; el diseño no depende de subir velocidades.

El código de generación debe resolver estas anclas una vez al crear el mundo. La entrega visual comprueba las once posiciones. Si un punto falla, corregir su ancla, no crear una chispa extra ni reducir el coste de altar sin revisar la cuenta.

### 3.4. Cuentas de las dos compras

**Cuenta mínima de referencia, sin motas de Sombras comunes ni ecos opcionales:**

| Momento | Operación | Saldo |
|---|---|---:|
| Inicio | 0 | **0** |
| C1, primeras seis chispas | 0 + 6×5 | **30** |
| C1, otras dos del acceso al altar | 30 + 2×5 | **40** |
| Primera compra: Capa I o Corazón I | 40 − 40 | **0** |
| C1, oni del Pétalo | 0 + 25 | **25** |
| C2, tres chispas de la orilla | 25 + 3×5 | **40** |
| C2, primera observación de Kaito y Rui | 40 + 25 | **65** |
| C2, oni de Marea | 65 + 25 | **90** |
| Segunda compra: nivel II de la primera rama | 90 − 90 | **0** |

Los ingresos pueden llegar en otro orden. Altar accesible y sus interacciones disponibles antes de terminar el capítulo: presentar «Puedes mejorar en este altar» una sola vez cuando saldo ≥40 y ninguna mejora comprada; no abrir un menú de forma automática. Después del fragmento de Marea, recordar la segunda posibilidad si el saldo ≥90 y existe una rama en nivel I. La compra sigue siendo decisión del jugador.

**Sensibilidad a la exploración:** el eco del Mirador puede añadir 25 en la recogida de la Katana, y el del Cerezo otros 25. Con ambos: C1 suma `40+25+25+25=115`; tras comprar 40, quedan **75**. C2 añade 65: hay **140**; tras comprar 90, quedan **50**. Si además encuentra otros ecos o vence Sombras, puede comprar antes. No ocultar sus ingresos para forzar el calendario.

Si el eco de Kaito se oyó en C1, trasladar sus 25 a C1: total acumulado al final de C2 idéntico. Si compra Corazón I y después Capa I, gasta `40+40=80`, no 130; le quedarán 50 en la cuenta mínima acumulada de 130. Esa alternativa es válida. Si ahorra 60 para Hilo I, ha elegido otra secuencia: explicar el siguiente precio, sin compensarle con regalos.

**Pérdidas:** el Cazador y el Ocaso pueden reducir el saldo. Los depósitos recuperados son restitución, no ingreso nuevo. El objetivo de dos compras supone recoger las once chispas y recuperar lo perdido; no garantiza 90 tras abandonarlo. Ejemplo: pérdida neta de 15 deja 75 para la segunda compra; otras tres chispas dan 15 y restauran la posibilidad. Registrar saldo, gasto y pérdida neta en la prueba de C1–C2.

**Migración:** no volver a pagar chispas `c0–c10` ya recogidas. En partidas antiguas no prometer que las compras ocurrieron durante capítulos pasados. Mantener saldo y mejoras; la ruta nueva sirve para partidas nuevas y las recogidas que aún queden.

## 4. Tres sorpresas del canon

### 4.1. Estado y reglas compartidas

Guardar marcas nuevas en `Sis.ST.inicio.cap.sorpresas`, con claves `discoCompleto`, `rutaYoake` y `lumiPosada`. Inicializar con `{}` si falta; no sustituir las otras marcas de `inicio.cap`. Guardar la marca al confirmar el descubrimiento con `Sis.guardar()`.

El temporizador de observación usa segundos de simulación. Se congela al pausar y se reinicia al abandonar el lugar o perder las condiciones. No cuentan cámara de cinemática, portada, práctica ni teletransporte. Exigir `J.vivo`, control libre, sin diálogo, menú, subtítulo, escena ni peligro cercano. No usar `UI.ocupada()` como único filtro: una cola de recompensas retenida no debe bloquear el mundo (§5).

Cada sorpresa se descubre una vez. Después conserva la imagen o el comportamiento natural sin repetir premio, aviso o nota. No da motas, XP, objetos ni una llave de historia.

### 4.2. El disco completo del mural

**Requisito visual previo:** corregir `texMural(4)`. Canvas actual de 512×400, misma textura, plano y material. Propuesta de trazos: disco completo con centro `(256,82)`, radio 45; guardiana con cabeza `(256,171)` y manto triangular hasta `(195,326)`–`(317,326)`; conejo corriente dibujado, cuerpo oval en `(357,305)`, cabeza `(370,279)` y dos orejas. Trazos dorados de 5 px sobre el fondo existente. Sin rayos de sol alrededor del disco, grieta, media luna ni un conejo tridimensional. Es el signo aprobado, no una aparición espiritual.

**Activación exacta:** desde C1, mural `k===4`, `(-240,-178)`, `ry:0.4`. Hikari a 3–10 m del frente. La cámara debe estar delante del plano: producto punto entre su vector desde el mural y la normal `(sin(ry),0,cos(ry))` ≥0,85. Proyectar en pantalla disco, cabeza y conejo: los tres dentro del 80 % central, por delante de la cámara y con línea de visión libre. Mantener **2 s**. No hace falta haber leído el mural ni poseer farol.

**Qué se ve:** al encajar la vista, disco, figura y conejo se leen juntos. Un brillo breve recorre el contorno ya dibujado, 0,4 s de entrada +1,2 s estable +0,4 s de salida: **2 s**. Usar el halo existente y su opacidad; el dibujo permanece siempre visible. No recomponer piedras móviles ni revelar otra capa secreta.

**Registro:** al completar los 2 s de observación, marcar `discoCompleto:true` y añadir mediante `Piloto.nota('f8_disco',...)`: título «El disco completo»; texto «El disco del mural está entero. El conejo aparece junto a la guardiana. El sello del registro tiene otra forma.» Notificación de diario en cola. Esta nota no emite `mural`, `oculto` ni `c1:mural_comparado`; la comparación principal sigue siendo necesaria y accesible.

### 4.3. La ruta vista desde el mirador de Yoake

**Disponibilidad:** `inicio.cap.doradaLibre===true`, `cieloRojo===false` y misión `ep7_amanecer` activa o hecha. Así puede encontrarse durante el epílogo o después.

**Geometría real:** mirador en torno a `(-955,975)`, señal `(-1000,870)`, embarcadero en torno a `(-950,882)` antes de su desplazamiento local, faro `(0,0)`. La señal y el faro **no son colineales** desde el mirador. No mover la torre ni inventar otro faro para cumplir un único eje. La sorpresa es una panorámica reconocible en dos sectores.

**Activación exacta:** Hikari en suelo a ≤3 m de `IslaYoake.puntos.mirador`, altura de pies ±0,8 m. Con cámara libre, observar el sector del canal y la señal durante **1,5 s**, y el del faro durante **1,5 s**, dentro de la misma estancia en el mirador. Cámara apuntando a ≤15° del centro del sector correspondiente. Para el primero, usar como centro el punto medio de `puntos.embarcadero` y la lámpara de `sitio('yoakeSenal')`; ambos dentro de pantalla. Para el segundo, la corona real del faro. No exigir una orientación de mando exacta ni que los tres quepan simultáneamente. Total mínimo de atención: **3 s**. Los dos acumuladores se reinician al salir del radio, entrar en diálogo o empezar otra escena.

**Qué se ve y cuánto dura:** el mundo permanece bajo control. Confirmación visual discreta de **2 s**, sin rótulo de recompensa. El diario guarda una estampa esquemática de los dos sectores: señal, canal y silueta del faro, unidos por el recorrido ya conocido. Generarla con líneas y colores del mapa existente, no con una captura que obligue a renderizar toda la isla principal a máximo detalle. Título «La ruta que aprendimos». Texto: «La señal marca el canal de entrada. Más allá queda el faro. El camino entre ambas islas ya no está cubierto de rojo.»

**Persistencia:** `rutaYoake:true` y `Piloto.nota('f8_ruta_yoake',...)`, guardados juntos. Mantener el esquema disponible en el diario. No cambia la ruta de navegación ni emite `ep7:nombre` o `ep7:fin`.

**Condición de entrega visual:** la silueta real del faro debe distinguirse a su distancia. Si el LOD la elimina, conservar solo su silueta lejana con la malla ya existente, sin cargar el terreno de alta resolución de 1,3 km. Validar niebla y tres calidades. No confirmar una mirada a un punto vacío. La estampa conserva el resultado cuando se cambia de calidad.

### 4.4. Lumi se posa a su nueva escala

**Disponibilidad exacta:** `ST.mis.ep7_amanecer.e==='hecha'`, `inicio.cap.lumiLuciernaga===true` y `doradaLibre===true`. La misión termina cuando se pulsa «Seguir en el valle» y se emite `ep7:fin`, no simplemente al abrir créditos. No usar solo `ST.final`, que no identifica ese recorrido.

**Lugar:** una planta junto a los huertos de Yoake. Registrar `puntos.plantaLumi` en el borde del bancal seco ya regado, a 0,5 m hacia fuera del cultivo y 0,55 m sobre su apoyo. Reutilizar una planta decorativa existente y un extremo de hoja estable. Si la geometría no expone un ancla, añadir un tallo de dos segmentos y dos hojas con el material vegetal existente. No convertir todo el sistema de vegetación en una lista de posaderos.

**Activación:** Hikari en suelo a 1–2,5 m del ancla, velocidad horizontal <0,1 m/s, durante **4 s** continuos. Sin ataque, haz, pulso, diálogo, menú, escena o peligro. La planta y Lumi deben estar en pantalla, en el 90 % central, con línea de visión libre. Si Hikari se va o mueve una acción, reiniciar la espera.

**Qué se ve:** Lumi se aproxima durante **1 s**, se posa durante **3 s** y despega durante **1 s**. Duración visible total **5 s**, además de los 4 s de espera. Mantener escala `0.35`; alas se recogen con el movimiento existente. No habla, envía señales ni vuelve a guiar por la red. Usar `Lumi.fijar` durante el gesto y liberarlo al acabar; evitar que la lógica de seguimiento sobrescriba la posición cada fotograma.

**Interrupción:** devolver seguimiento en 0,25 s, sin bloquear a Hikari. Si no completó los 3 s posada, no marcar y permitir otro intento. Al completar la posada, marcar `lumiPosada:true` y guardar. Sin nota emergente, sonido de logro ni consumible. Después puede posarse de nuevo al cumplirse las mismas condiciones, con espera de 30 s de juego entre visitas, pero no se registra otro descubrimiento. La repetición es conducta; la marca identifica la primera observación completa.

## 5. Cola de rótulos y veinte segundos de cuidado

### 5.1. Qué se retiene

Un único filtro de presentación debe alcanzar `UI.banner`, `UI.aviso`, `UI.item`, `UI.nivel`, `UI.diarioNuevo` y el «+n» animado del contador de motas. El saldo, inventario, nivel, habilidad y misión se actualizan inmediatamente y se guardan. Se difiere **su anuncio**, no el premio ni el uso del objeto.

| Clase | Durante una `Cin` o lectura principal | Tras Tsuru o Tasogare |
|---|---|---|
| Premio, objeto, nivel, XP, motas ganadas, colección | Retener | Retener hasta terminar el silencio y la lectura activa. |
| Misión completada, capítulo y descubrimiento de lugar | Retener | Retener; agrupar al salir del silencio. |
| Nota nueva de diario | Guardar de inmediato; no abrir tarjeta | Mismo tratamiento. Se puede consultar manualmente. |
| Objetivo principal del HUD | Actualizar estado; mostrar al devolver control | Mostrar al devolver control. Es información de ruta, sin fanfarria. |
| Subtítulo del montaje o conversación | Mostrar según su guion | Mostrar según su guion. No es una recompensa. |
| Peligro actual, pérdida de motas, error de interacción o falta de luz | No dejar un aviso viejo para después. En escena no hay simulación de daño al jugador. | Señales de seguridad inmediatas si vuelve un peligro; no quedan detrás del botín. |
| Confirmación de compra pedida por el jugador | No se compra dentro de una escena | Si abre voluntariamente el altar, confirmar en ese panel; sin banner ni celebración externa. No termina el silencio. |

### 5.2. Reloj y condiciones de salida

Al terminar normalmente **o al omitir** `perdidaTsuru` o `muerteTasogare`, establecer `restante=20`. Si llega otra pérdida, conservar el mayor plazo. Empieza a contar tras la devolución de control y después de confirmar el resultado lógico. Un diálogo que arranca en ese callback no consume tiempo seguro.

Restar `dt` únicamente con Hikari viva, control disponible, sin escena, diálogo, pausa, menú, pantalla de créditos, combate, proyectiles hostiles, Cazador en alerta/ataque ni enemigo hostil a ≤30 m. El tiempo se acumula entre tramos seguros; un peligro lo congela, no lo borra. No usar `performance.now()` ni `setTimeout(20000)`. Cerrar una ventana o dejar el juego pausado no gasta esos 20 s.

La primera escena triste seguida de conversación y de huida puede retener premios más de 20 s de reloj real. Es deliberado: 03 pide juego seguro. El farol y el aprendizaje de oscuridad ya están disponibles durante ese intervalo; sus avisos esperan.

En escenas normales, liberar al terminar el callback, cuando no haya otro subtítulo o diálogo y haya **0,8 s** continuos de control seguro. En las tristes, esa salida se aplica además del reloj de 20 s. Los diálogos posteriores no se interrumpen para vaciar la cola.

### 5.3. Datos, orden y persistencia

Cada aviso pendiente lleva `id`, `clase`, `origen`, `titulo`, `detalle`, `cantidad` y orden de creación. La clave es el hecho: `mision:te`, `item:manto_marea:pescador`, `nivel:4`, `aprendizaje:oscuridad`, etc. No deduplicar por «Misión completada», título que comparten muchos premios.

Usar una cola lógica sin el límite actual de tres hechos. Agrupar motas consecutivas por tramo y objetos iguales por cantidad. Si hay más de ocho tarjetas esperando, resumir las menores en «Otros cambios en el diario», preservando sus datos consultables; no tirar un manto o una habilidad. La cola del HUD es presentación, no el historial de recompensas.

Un banner ya visible que entra en escena se oculta y se vuelve a encolar con su mismo ID. Al salir puede mostrarse entero; no se concede de nuevo. Durante la pausa tampoco avanza su duración visible. Repetir un plano no produce nuevas tarjetas.

Orden al liberar: **herramienta o estilo necesario → manto u objeto único → cierre de misión → nivel → recogidas agrupadas**. Mostrar una tarjeta de 2,5 s, hueco de 0,4 s; subir a 4,6 s solo si el detalle requiere lectura más larga. No apilar tarjetas. Para premios retenidos mucho tiempo, incluir el origen: «Manto de Marea · Por devolver la caña de Kaito».

Guardar `ST.presentacion = { version:1, silencioRestante, pendientes:[], mostrados:[] }`. Los hechos y su aviso pendiente se confirman en el mismo guardado. Marcar como mostrado solo cuando termina o el usuario lo descarta voluntariamente. Al cargar, restaurar reloj restante y pendientes; si se cargó dentro de una escena reanudada, volver a retenerlos. En guardados sin este campo, iniciar vacío y no reconstruir todas las recompensas históricas como avisos nuevos.

Separar `haySuperposicionVisible` de `hayPendientes`. `UI.ocupada()` hoy considera ocupada cualquier cola y los ecos la consultan. **Una recompensa retenida no debe impedir que se oiga un eco, empiece una conversación o avance la principal.** Solo una tarjeta realmente visible bloquea otra presentación. Para el reloj de seguridad, consultar peligro y lectura; no consultar una cola que está esperando al propio reloj.

Al guardar y cargar tras 7 s seguros de una pérdida deben quedar **13 s**, no 20 ni 0. Al abrir un menú durante 10 s deben seguir quedando 13. Al volver de un peligro y jugar 13 s seguros, liberar la primera tarjeta cuando termine cualquier lectura activa.

## 6. Seis mantos: geometría, paleta y obtención

### 6.1. Contrato visual y separación del efecto

Conservar largo y anclas de la capa, la capucha, la máscara, las cintas y las tres llamas. La tela actual usa 10 columnas y 14 filas de puntos. `u` recorre el ancho y `v` el largo desde los hombros. Los patrones se construyen por vértices y triángulos sobre la misma simulación. No añadir una segunda capa con otra física.

Definir dos selecciones guardadas: `eq.aspectoManto` y `eq.manto` para el efecto vigente. La segunda conserva el papel mecánico que ya usa `Sis.perk`. Al migrar, ambas parten del manto equipado. `manto_alba` es propiedad inicial aunque hoy no figure en `inv`; añadirlo una vez al catálogo de aspectos disponibles. Solo se puede elegir aspecto o efecto de mantos obtenidos. Un único efecto activo; `Hilo de luz` multiplica ese efecto.

Cambiar aspecto no cura, rellena luz, suma daño ni recalcula el perfil de dificultad como si se hubiese adquirido equipo. Cambiar efecto conserva los límites actuales de vida y luz. Conservar los `perk` existentes; esta fase no convierte manto en una segunda escuela de magia ni añade proyectiles.

Usar el material de tela ya precargado, colores por vértice y un atlas de triángulos de patrón adheridos mediante la interpolación `puntoCapa`. Un solo lote de detalles activo, hasta **120 triángulos**, objetivo de **una llamada adicional** y máximo dos si hace falta separar las dos caras. Separación de superficie de 0,004 m. No nuevo programa de shader, textura externa, partículas continuas ni luz puntual por manto. Precargar las seis variantes para que equipar no compile.

Reservar el corredor de las marcas de llama y 0,035 m alrededor de cada una. Los patrones no las tapan ni imitan tres indicadores de vida extra. Cambiar contorno como máximo 0,02 m en el último 10 % del largo; aplicar el mismo perfil a reposo y planeo sin estirar la simulación. Los detalles cambian, la física no.

### 6.2. Catálogo visual

Los HEX son colores de diseño; convertirlos a lineal igual que los actuales. «Patrón» no atribuye una familia, orden sagrada o procedencia histórica nueva.

| ID / manto | Tela y paleta | Geometría, bordes y patrón | Obtención y efecto existente |
|---|---|---|---|
| `manto_alba` / Alba | Superior **#8E282C**, centro **#C45D32**, bajo **#E5A24B**. Oro **#D9A441** y borde oscuro **#58232A**. | Silueta de referencia; borde continuo de 0,025 m. Dos costuras diagonales desde hombros hacia los extremos del bajo, grosor 0,008 m. Sin medallón ni sol central. Se reconoce por el degradado cálido continuo. | **Desde el despertar**. No requiere comprarlo ni abrir cofre. `perk:{}`. |
| `manto_sakura` / Sakura | Superior ciruela **#693952**, centro rosa **#D995B4**, bajo **#F2CAD9**. Borde **#913F68**. | Tres puntas redondeadas sugeridas por un perfil de bajo de hasta 0,015 m; no añadir flecos físicos. Tres pétalos de 0,10×0,13 m en el tercio inferior: lateral izquierdo, lateral derecho y bajo central, evitando las llamas. Ribete rosa oscuro de 0,03 m. | Completar **`amigos`**, disponible desde **C1**. Un ejemplar. +20 % de luz máxima. |
| `manto_marea` / Marea | Superior **#244D62**, centro **#438D9B**, bajo **#70C7BB**. Ribete claro **#B2E2D8**. | Bajo casi horizontal; dos ondas quebradas a `v≈0,72` y `v≈0,87`, grosor 0,018 m y amplitud 0,025 m. Construir con tiras trianguladas, no curvas de shader. Bordes laterales azul profundo de 0,03 m. | Completar **`pescador`**, desde **C2**, tras hablar con Kaito sobre Rui. +15 % de vida máxima. |
| `manto_escarcha` / Escarcha | Superior índigo **#34415F**, centro **#6386AB**, bajo azul pálido **#B8D9ED**. Ribete **#E4F0F2**. | Bajo con tres ángulos poco profundos, hasta 0,02 m. Dos cristales laterales hechos de rombos de 0,10×0,14 m; una banda de pequeños triángulos claros a `v≈0,90`. Mantener índigo entre rombos para que se lea sobre nieve. Sin transparencia ni material refractivo. | Completar **`oso`**, tras **`manada`**, desde **C6**. +15 % de daño según el `perk.dmg` actual. La reubicación aprobada de naginata se integra aparte; no depende de cambiar este manto. |
| `manto_solar` / Solar | Superior ocre **#7B4D2A**, centro ámbar **#C48732**, bajo oro **#E3BA60**. Contorno **#513D30**. | Borde doble: oscuro de 0,035 m y línea de oro de 0,012 m. Seis radios cortos de 0,07 m alrededor de un semicírculo en la parte baja, por debajo de las llamas. Dos abanicos laterales triangulados; nunca una segunda serie de indicadores. Contorno liso, sin puntas. Se distingue del Alba por líneas radiales y borde doble. | Completar **`viento`**, **10 espíritus** y charla con Momo disponible. La misión se ofrece desde C1, pero `v8` está en Kiri: obtención completa **desde C6** en la ruta normal. +15 % de luz y +10 % de daño. No atribuirlo a una forja. |
| `manto_guardian` / Guardián | Superior **#294F49**, centro **#58876E**, bajo **#A4C9AA**. Contorno marfil **#D7DECA**. | Borde continuo de 0,035 m. Cinco pequeñas placas geométricas en arco bajo: hoja redondeada de Musgo, rombo de Escarcha, trapecio de Arena, onda de Marea y pétalo de Cerezo. Cada marca cabe en 0,07×0,07 m; separación ≥0,025 m. Repartidas en los laterales y el bajo, fuera del corredor de llamas. Sin armadura, cadenas o núcleo extraído. | **Canalizar los cinco** gólems: `musgoso`, `escarcha`, `arena`, `marea`, `cerezo`. Usar `ST.jefes[id].can`, no solo `der`. En la campaña normal llega al canalizar Escarcha en **C6**. Marca existente `ST.jefesManto`; premio actual de 11. +15 % de vida y +15 % de daño. |

Escarcha, Solar y Guardián pueden coincidir en C6. No inventar capítulos tempranos para repartirlos. Presentar cada uno con su origen y dejar que el usuario los compare. El Manto del Guardián se concede por cuidar a los cinco, no como pieza sacada de un cuerpo.

### 6.3. Vista previa del zurrón

Previsualización con Hikari o busto ya existente, en posición neutra; giro de **30°/s** mientras el usuario lo pide. Botón de luz «Día / Noche», con dos configuraciones fijas de iluminación. No cambia la hora del mundo. Vista desde atrás por defecto, transición de aspecto de **0,25 s**, sin simular un nuevo tipo de tela.

Dos elecciones explícitas: «Aspecto» y «Efecto». Mostrar nombre, fuente y valor del efecto activo, más la diferencia al seleccionar otro. Ejemplo: «Aspecto: Marea · Efecto: Sakura · Luz máxima +20 %». Con Hilo I: «+25 %». No sumar vida de Marea por llevar su apariencia.

La prueba visual exige distinguir los seis a **5 m**, de espalda, sobre pradera, nieve, interior y cielo rojo. Hacer una captura con una sola llama y otra con tres. Verificar que cambiar de manto no crea compilación ni salto de la capa.

## 7. Implementación por bloques, de menor a mayor dificultad

Cada bloque se entrega con pruebas de Claude y valoración del usuario según `COORDINACION.md`. Los módulos indicados son destinos para Claude, no archivos modificados por esta entrega.

**Verificación proporcional:** `node --check` en módulos que Claude modifique; `probar-secundarias.mjs` y pruebas de C1–C2 para los primeros bloques; C4–C7 e inicio para escenas y persistencia. Ampliar a toda la campaña al tocar el contrato compartido de misiones, equipamiento o guardado. Revisar capturas y secuencias completas: una batería verde no demuestra que se entienda el ataque o el duelo.

Pruebas decisivas de aceptación: compra de 40 y de 90 con cuentas visibles; pausa de 10 s dentro de un gesto; omisión en cada plano de las tres escenas mayores; repetir el plano de recogida sin otro farol; cargar con té preparado; caña recogida antes de oferta; tres caricias del mismo animal frente a tres individuos; 7 s de silencio consumidos y carga con 13 s pendientes; un manto visual con otro efecto; Lumi después de `ep7:fin`, nunca antes.

**Archivos tocados:** solo `docs/entregas_chatgpt/2026-11-03_fase8_escenas_y_recompensas.md`.

**Decisiones tomadas:** apertura de 110 s conservada; transiciones de 12–24 s; cierres mayores de 45 s; secundarios con acciones y consecuencias visibles; mismos IDs, XP, cantidades y premios; un evento nuevo, `kiri:panorama`; economía por colocación de once chispas existentes; costes de altar intactos; tres sorpresas sin premio estadístico; anuncios retenidos con 20 s seguros tras las pérdidas; seis aspectos de manto con un solo efecto activo.

**Preguntas abiertas:** ninguna decisión nueva de canon es necesaria para implementar estos bloques. La procedencia y los textos de adquisición de los estilos de fases 6–7 pertenecen a su encargo específico; aquí solo se respeta su calendario aprobado. Quedan por validar jugando la legibilidad, las posiciones de recogida, la silueta lejana del faro y la aceptación visual del usuario. Son comprobaciones de implementación, no hechos narrativos inventados.

**Lista priorizada para Claude:**

| Prioridad | Bloque | Dificultad | Destino y condición de cierre |
|---:|---|---|---|
| 1 | Textos de las cinco secundarias y cierre automático de `chispas` | Baja | 68 y reconciliación en 07. Mismos IDs, cantidades y premios. Seis chispas previas cuentan sin contar flores. Migración de `p:1` sin doble premio. |
| 2 | Primera y segunda compra con once chispas colocadas | Baja–media | 07. Reutilizar IDs `c0–c10`, conservar 80 totales y costes. Recorrido nuevo: 40 disponibles en C1 y acumulado suficiente para 40+90 al final de C2, sin cultivar Sombras. Registrar extras y pérdidas. |
| 3 | Cola de presentación y silencio tras pérdidas | Media | 08, puntos de concesión y estado en 07. Cero avisos sobre escenas. Recompensa retenida no bloquea ecos ni conversaciones. Guardar/cargar conserva los 20 s restantes. Depende solo de identificar las escenas actuales; precede a los montajes nuevos. |
| 4 | Retimado de transiciones, recuerdos y purificación | Media | 09, 52 y 63. Verificar `estadoPlano().total`: 110; 12; 8; 22/22/22/25; travesías 24/16/16; captura 16; encarnación 22. Lectura completa antes de fundidos. Pausa y repetición congelan y reinician efectos correctamente. |
| 5 | Dibujo del disco y sorpresa del mural | Media | Textura procedural de 04, detección y marca de sorpresa. Signo coincide con canon y comparación principal. Dos segundos de encuadre; sin duplicar `mural` o XP. |
| 6 | Caña con dos pistas y gesto de Kaito | Media | 68, 07 y accesorio/rutina. Dos rutas con el movimiento actual; una caña, un manto. Si se recoge antes, se puede devolver. Su rutina no pisa embarques de la historia. |
| 7 | Té compartido y observación opcional de Kiri | Media | 68, 07 y un módulo breve de escenas auxiliares. Seis segundos de compartir; cinco flores descontadas una vez; dos focos sobre la losa de Kiri; cierre sin viaje de entrega. Esperan durante la captura de Momo. |
| 8 | Apariencia y efecto separados; vista previa y seis patrones | Media | Estado/equipamiento, 17 y zurrón. Migración desde `eq.manto`; un efecto activo; Alba seleccionable desde inicio; seis siluetas legibles. Sin nuevo shader ni física de capa. |
| 9 | Tres caricias distintas con identidad persistente | Media | 06, 07 y 68. Repetir caricia no cuenta; tres individuos sí; reiniciar no borra progreso ni duplica UID. Fauna común conserva su ciclo de aparición y descarga. |
| 10 | Panorámica de Yoake y estampa | Media | Detección de cámara, diario y LOD de la silueta del faro. Dos sectores suman 3 s; sin mover la obra ni precargar toda la isla. Las tres calidades muestran el destino observado. |
| 11 | Lumi posándose después de los créditos | Media | Seguimiento de Lumi y ancla vegetal local. Cuatro segundos quieta, aproximación 1, posada 3, salida 1; sin volver a hablar o recuperar la red. Cancelación devuelve seguimiento. |
| 12 | Montajes mayores: Tsuru, Tasogare y liberación | Media, la mayor carga de actuación | 39 y 63, reutilizando el motor probado. 45 s cada uno. Ataque de Sombra, intervención de Hikari y liberación se entienden en imagen. Mismo resultado al omitir en cada plano. Cola y oscuridad aprobada respetan el cierre emocional. |
