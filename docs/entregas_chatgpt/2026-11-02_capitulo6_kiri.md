# Capítulo 6 · La memoria que no devuelve a nadie

**Fecha:** 2026-11-02. **Entrega editorial para Claude.** Sin implementación.

**Entrada:** Tasogare murió al intentar completar la extracción. Momo está a salvo. Hikari conserva Pétalo, Marea y Arena, el farol de Tsuru y las pruebas de Duna. Todavía no reconoce su identidad completa. Kiri abre por capítulo.

**Dependencias del capítulo 5:** confirmar punto de salida, ubicación y cuidado de Momo, arma y técnicas conservadas del duelo. Esta ficha propone una parada de Hikari y Lumi en la Gruta de las Luciérnagas; no traslada allí a Momo. El destino de la niña no se inventa. No se exige Naginata ni forja Solar.

**Fuentes leídas:** `AGENTS.md`, `COORDINACION.md`, `PLAN_FUSION.md` —incluidas las decisiones de Sayo, Yoake, Hayase, Mori y Chiyo—; `PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md`, reglas 1–27 y §§4–11; `PERSONAJES.md`; `PARTE_2_GUION_DETALLADO_DEL_INICIO.md`; entregas de los capítulos 1–4 del 2/11. Prevalecen los nombres decididos sobre las denominaciones provisionales del capítulo 4.

Pista inicial contrastada con RU03–05 de `js/50-guion-inicio.js`: «Las cuatro luces deben volver a su sitio».

## 1. Escaleta

**55 minutos objetivo**, por medir. Incluyen juego y lectura manual; sin esperas para completar duración.

| Secuencia | Minutos | Objetivo / lugar | Sistema reutilizado |
|---|---:|---|---|
| C6A | 0–5 | Ordenar pruebas y acordar ruta privada; gruta aislada | Conversación y diario, `07-sistemas` |
| C6B | 5–15 | Reconocer la intercepción; encender cuatro balizas en Kiri | Sombras, `35-sombras`; balizas, `31-arenas` |
| C6C | 15–24 | Purificar y canalizar al Gólem de Escarcha | `11-jefes`, ataques de `23-ataques-golem` |
| C6D | 24–34 | Resolver cristales y recuperar la identidad; Cueva de Cristal | `RETO.escarcha`, `07`; cámara y altar, `32-cuevas` |
| C6E | 34–42 | Subir y contrastar el registro; cima de Kiri | Corrientes, `07` y `18-movimiento`; losa, `33-santuarios` |
| C6F | 42–52 | Descender, presenciar la entrega y romper tres enlaces | Arena existente; combate nuevo sobre `21-combate` |
| C6G | 52–55 | Exigir responsabilidad y preparar el regreso | Conversación, misión y guardado, `07` y `49-campana` |

Todos los módulos citados se han leído en sus partes reutilizadas. Registro, intercepción dirigida y enlaces son adaptaciones propuestas, no funciones existentes. La cima conserva su losa pequeña: sirve para leer, no para combatir. Lumi transmite después del descenso, en la arena ya calmada.

## 2. Qué aprende el jugador

| Hecho esencial | Líneas obligatorias |
|---|---|
| Hikari es Akari; sobrevivió al rito interrumpido; Tasogare era su padre | C6M02–07 |
| Recordar no devuelve a Tasogare ni a las víctimas consumidas | C6M08–09, C6R04–05 |
| Encarnar concentra reserva y voluntad; cuerpo destruido y red cortada impiden escapar | C6R01–03 |
| Lumi informó voluntariamente, incluso después de Duna; luego pierde el control | C6L01–12 |
| Romper sus ataduras devuelve agencia, sin perdón ni desactivación de la red completa | C6S01–08 |

No hay preguntas opcionales con información esencial. La ruta privada se acuerda dentro del aislamiento ya establecido de la gruta. Ningún Vigía ni emisor presencia esa conversación. Lumi la transmite al salir; la confesión identifica después esa transmisión.

## 3. Guion completo

Solo subtítulos. Avance manual, pausa, repetición y `{omitir}`. Una línea visible; gesto preparado y un segundo de reacción. Las frases durante juego esperan ventanas seguras. Omitir conserva hechos y resumen, sin resolver combates ni interacciones pendientes. Koto y flauta; ambiente continuo. Sin fanfarria al recordar al padre.

### C6A–B · Lo que solo hablamos aquí

Montaje propuesto: mapa abierto en la cámara protegida de la gruta. La ruta de los mojones es una denominación de producción para un acceso caminable a la arena, no otro lugar canónico. Al salir, Lumi se retrasa hasta cruzar el límite protegido; su halo pulsa. Aún no se muestra destinataria.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C6A01 | Hikari | «Momo está a salvo. Tasogare murió cuando detuve la extracción.» | Ante las copias | Manos inmóviles |
| C6A02 | Hikari | «Me falta el recuerdo de Escarcha. Quiero entender qué me pasó.» | Continuación | Busca Kiri |
| C6A03 | Hikari | «Aquí no llega la red. Acordemos el camino antes de salir.» | Cámara aislada | Acerca el mapa |
| C6A04 | Hikari | «Tomaremos el paso de los mojones hasta la arena.» | Ruta fijada | Sigue el trazo |
| C6A05 | Lumi | «Iré contigo.» | Respuesta | Se acerca al mapa |
| C6B01 | Hikari | «Nos estaban esperando en el paso que elegimos a solas.» | Ve dos Sombras apostadas | Se cubre antes de avanzar |
| C6B02 | Lumi | «Podemos pasar por un lado.» | Antes del encuentro | Evita mirarla |
| C6B03 | Hikari | «Después hablaremos de esto.» | Tras combatir o rodear | Mira a Lumi |
| C6B04 | Lumi | «Hay cuatro balizas. Al encenderlas, el guardián despertará en su arena.» | Primera baliza | Señala las restantes |
| C6B05 | Interfaz | «Encender baliza · mantén {interactuar} · {n}/4» | Cada baliza pendiente | Confirma unidad |
| C6B06 | Hikari | «Está corrompido por la red del faro. Intentaré liberarlo.» | Entrada de arena | Observa sus vetas |

### C6C · El guardián del hielo

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C6G01 | Lumi | «Las estacas siguen esa franja. Sal hacia un lado.» | Primer aviso; peligro detenido | Señala el borde |
| C6G02 | Lumi | «Después queda expuesto el núcleo azul. Alcánzalo tres veces.» | Primera recuperación | Mira al torso |
| C6G03 | Hikari | «Ahora puedo purificarlo con el haz.» | Primer aturdimiento | Apunta al núcleo |
| C6G04 | Lumi | «La ventisca está llegando. Enciende una fogata y quédate cerca.» | Antes del primer pulso de frío | Señala leña y abrigo |
| C6G05 | Hikari | «Se cubrió de cristal. Lo romperé con golpes.» | Tercera fase | Prepara el arma conservada |
| C6G06 | Interfaz | «Encender fogata · mantén {interactuar}» | Fogata apagada | Alternativas: {haz} o {pulso} |
| C6G07 | Interfaz | «Canalizar luz · mantén {interactuar}» | Guardián purificado | Junto al núcleo |
| C6G08 | Hikari | «Ya está en calma. Volvamos al altar de la cueva.» | Canalización | Baja las manos; dos segundos |

### C6D · Recordar desde dentro

Conservar cuatro cristales y secuencia de cuatro pulsos. Añadir números visibles, repetidos durante la demostración; el sonido y el color no son la única pista. Error: misma secuencia, sin castigo. Resolver habilita el fragmento; tocarlo lo integra. Purificación y canalización son condiciones de progresión propuestas.

Memoria subjetiva de unos 30 s: mano infantil, extracción, Tasogare cortando el hilo; la luz de Akari cambia de forma y enlaza con el despertar. Es la continuidad del rito conocido, sin biografía nueva. Akari recordada no responde al presente.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C6C01 | Hikari | «Los cristales repiten cuatro pulsos. Seguiré sus números.» | Ante el altar | Observa el anillo |
| C6C02 | Interfaz | «Iniciar o repetir secuencia · {interactuar}» | Altar | Encuadre de los cuatro |
| C6C03 | Interfaz | «Tocar cristal {n} · {interactuar}» | Durante respuesta | Progreso 0/4 a 4/4 |
| C6C04 | Hikari | «Me equivoqué. Puedo volver a verla.» | Error | Solo una vez por intento |
| C6C05 | Interfaz | «Tocar el fragmento · {interactuar}» | Reto resuelto | Contacto deliberado |
| C6M01 | Akari · recuerdo | «¡Padre!» | Ve el corte del hilo | Tiende la mano |
| C6M02 | Hikari | «Soy Akari. Esos recuerdos son míos.» | Regreso al altar | Mira sus manos |
| C6M03 | Hikari | «El rito se interrumpió antes de consumir mi núcleo. Sobreviví así.» | Reconoce la transformación | Toca la capa |
| C6M04 | Hikari | «Los cuatro fragmentos guardaban partes de mi memoria.» | Integración completa | Mano al pecho |
| C6M05 | Hikari | «Tasogare era mi padre. Yo lo maté.» | Tras dos segundos | Se sienta |
| C6M06 | Hikari | «Intentaba consumir a Momo. Tenía que detenerlo.» | Sin respuesta inmediata | Recupera la mirada |
| C6M07 | Hikari | «Recuerdo ser Akari. Quiero seguir llamándome Hikari.» | Cierre de identidad | Se incorpora despacio |
| C6M08 | Hikari | «Recordarlo no lo trae de vuelta.» | Ante el farol | No lo activa |
| C6M09 | Hikari | «Tsuru tampoco va a volver.» | Pausa de tres segundos | Sostiene el marco |
| C6M10 | Hikari | «Escarcha recuperó su luz. El faro sigue roto.» | Cambio regional | Mira hacia la salida |
| C6M11 | Lumi | «En la cima hay un registro del conducto.» | Después de la pausa | Indica el ascenso |

### C6E · Registro de Kiri

Registro material nuevo en el pequeño santuario de `Estr.cima`; sin autor ni fecha inventados. Lectura obligatoria por Hikari, independiente de Lumi y del farol. Ascenso con corrientes existentes; salto y planeo, sin acertijo adicional. Un fallo devuelve al último apoyo seguro.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C6K01 | Hikari | «Las columnas de aire me sostienen. Puedo pasar de una a otra.» | Primer apoyo | Mira la siguiente |
| C6K02 | Interfaz | «Planear en la corriente · mantén {saltar}» | Antes del salto | Marca apoyo seguro |
| C6K03 | Interfaz | «Leer el registro de Kiri · {interactuar}» | Losa de la cima | Abre lectura |
| C6R01 | Hikari | «“Al encarnar, la Luna Roja concentra su reserva y su voluntad en un cuerpo tangible”.» | Primera entrada | Sigue el texto |
| C6R02 | Hikari | «“Esa concentración permite dañarla”.» | Entrada siguiente | Pausa |
| C6R03 | Hikari | «“Destruir el cuerpo y cortar la red impide que escape en otro núcleo”.» | Cierre técnico | Guarda copia |
| C6R04 | Hikari | «“Los núcleos completamente consumidos no pueden reconstruirse”.» | Segunda entrada | Sostiene el borde |
| C6R05 | Hikari | «Liberar la reserva no devolverá a Nao ni a Rui.» | Conclusión | Baja la copia |
| C6R06 | Hikari | «En Duna vimos un cuerpo y cuatro conexiones. Este registro explica su punto débil.» | Compara esquema | Superpone hojas |
| C6R07 | Hikari | «Bajemos. Llevaré estas pruebas antes de subir al faro.» | Cierre | Mira el descenso |

### C6F · La entrega

En la arena calmada, Lumi se coloca junto a un emisor de enlace propuesto. Hikari presencia el envío completo. Solo entonces reaparece la continuidad central de la red. Los fragmentos permanecen integrados. Tres ataduras materiales visibles nacen de bases separadas; el halo de Lumi queda suspendido entre ellas. Su cuerpo sigue siendo el pequeño núcleo alado.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C6L01 | Lumi | «Ya están las cuatro firmas. Alineo el conducto.» | Transmisión visible | Pulso hacia el faro |
| C6L02 | Hikari | «¡Lumi! ¿Le estás enviando nuestras claves?» | Interrumpe el acercamiento | Mano extendida |
| C6L03 | Lumi | «Sí. Te guié para reunirlas. Los fragmentos siguen contigo.» | Antes del control | Mantiene su propia postura |
| C6L04 | Lumi | «También envié nuestra ruta al salir de la gruta.» | Admisión | Mira los mojones |
| C6L05 | Hikari | «Por eso nos estaban esperando.» | Reconoce la prueba | Retrocede |
| C6L06 | Lumi | «Me prometió una luz propia. Al principio creí que nos protegía.» | Confesión | Halo irregular |
| C6L07 | Lumi | «En Duna supe que era una usurpadora. Seguí informando. Quería negociar después.» | Sin amenaza corporal aún | No busca excusa |
| C6L08 | Luna Roja · por el enlace | «Las cuatro luces deben volver a su sitio.» | Responde al envío | Repite la fórmula de RU03 |
| C6L09 | Hikari | «Lumi, dijiste eso antes de buscar el primer registro. Era una orden suya.» | Reconoce la fórmula | La mira |
| C6L10 | Luna Roja · por el enlace | «Has abierto mi camino. Ahora usaré también tu cuerpo.» | Tres ataduras se tensan | Cambio brusco de postura |
| C6L11 | Lumi | «¡No puedo moverme!» | Primer control involuntario | Alas forzadas |
| C6L12 | Hikari | «La estás controlando. Romperé esas tres ataduras.» | Antes del combate | Mira cada base |
| C6L13 | Luna Roja · por Lumi | «Mataste a tu padre. Tu luz es impura. Entrégamela.» | Encuadre previo, sin ataques | Intenta someterla |
| C6L14 | Hikari | «Mi culpa no te da derecho a tomar mi vida.» | Respuesta | Sostiene la postura |
| C6L15 | Hikari | «Veo un círculo, dos barras y un triángulo. Sus nudos están en las bases.» | Inspección segura | Recorre las tres |
| C6L16 | Interfaz | «Rompe las ataduras · {n}/3 · {haz} o {atacar}» | Durante el enfrentamiento | Identifica objetivo activo |

### C6G · Ayudar no salda la deuda

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C6S01 | Lumi | «Puedo moverme otra vez.» | Tercer nudo roto | Alas recuperan su ritmo |
| C6S02 | Hikari | «Rompí tus ataduras. La red del faro sigue activa.» | Observa el conducto distante | Baja el arma |
| C6S03 | Lumi | «Antes de que me controlara, yo elegí informarle.» | Se acerca; se detiene | Acepta distancia |
| C6S04 | Lumi | «En los refugios cambiaba mi señal porque no podía transmitir.» | Admite la tercera pista | Halo bajo |
| C6S05 | Hikari | «No te perdono por haberme vigilado.» | Respuesta | Mantiene el espacio |
| C6S06 | Lumi | «Quiero ayudar a sacar la luz cautiva.» | Sin pedir absolución | Espera |
| C6S07 | Lumi | «Cuando inviertas el conducto, puedo abrir una salida para la reserva.» | Orientación final | Señala el faro |
| C6S08 | Hikari | «Mostrarás cada paso antes de hacerlo. Decidiré contigo delante.» | Condición | Guarda las pruebas |
| C6S09 | Hikari | «Primero avisaremos a Yuki y Kaito. Hay que sacar a los niños.» | Cierre | Devuelve control |

Lumi conserva aquí su forma y facultades restantes. La pérdida de acceso y su reducción a luciérnaga pertenecen a su acción reparadora del capítulo 7.

## 4. Combates y etapas

**Intercepción:** una rastrera avisa agachándose antes del salto; una lanzadora levanta la esquirla. Usar {esquivar}, {guardia}, parada o rodeo cubierto. `35-sombras`: avisos actuales de 0,45/0,55 s. Hikari reconoce la emboscada incluso si evita luchar. Esta colocación sustituye al oni automático de Escarcha; no duplica custodios.

| Encuentro / etapa | Qué hace el enemigo | Qué hace el jugador | Avisos legibles |
|---|---|---|---|
| Escarcha 1, hasta 66 % | Aliento en sector; estacas en línea | Salir de la franja; alcanzar tres veces el núcleo expuesto; purificar con {haz} durante aturdimiento | Sector 1 s; franja 1,3 s; contador de impactos |
| Escarcha 2, hasta 33 % | Añade onda y ventisca periódica | Saltar la onda; encender fogatas y sostenerse en su calor; repetir apertura | Anillo 1,2 s; señal previa de ventisca y refugio marcado |
| Escarcha 3 | Añade armadura de cristal regenerable | Romperla con {atacar}; aprovechar exposición y {haz}; canalizar al terminar | Silueta facetada; aviso de armadura y de rotura |
| Lumi 1 · Círculo, base oeste | Emite línea de luz hacia posición marcada | Esquivar lateralmente; golpear o iluminar el nudo durante recuperación | Un aro y número 1; franja fija 1,3 s |
| Lumi 2 · Dos barras, base este | Barre un sector desde el segundo enlace | Rodear el sector; atacar el nudo expuesto | Dos barras y número 2; sector 1,3 s |
| Lumi 3 · Triángulo, base norte | Marca dos discos de sujeción en el suelo | Salir de ambos; romper el último nudo | Triángulo y número 3; discos fijos 1,5 s |

Escarcha conserva ventanas y lógica de `11/23`, incluida exposición de 4,5 s tras estacas. Añadir preaviso de ventisca antes del daño. Fogatas separadas de balizas. Ajustar dificultad al sexto capítulo, sin exigir nivel antiguo.

Lumi es un encuentro nuevo: adaptar marcas de `11/23` y recepción de daño, fijación y golpes de `21`. Bases a distancia caminable, dentro de la arena; nudos grandes, a altura de ataque. Cada nudo necesita varias aplicaciones, con progreso visible y ventanas repetibles. No hay barra vital de Lumi ni ejecución. Golpear su halo no progresa. Solo ataca el enlace vigente; cada ruptura elimina su ataque. Señales con contorno oscuro sobre nieve, número y forma; nunca solo color. Tiempos propuestos para prototipo.

## 5. Misión propuesta

**ID:** `c6_kiri`. Activar al cierre confirmado del 5. `c6:*` son nombres nuevos; en `ir/escena` nombran salidas propuestas. Las escenas requieren fichas nuevas. Eventos `jefe:escarcha:*` y `frag:3` existen.

| Paso | Tipo / evento o señal | Objetivo visible |
|---:|---|---|
| 1 | `ir` · `c6:gruta_alcanzada` | Vuelve a la cámara protegida de la gruta. |
| 2 | `escena` · `c6:ruta_acordada` | Ordena las pruebas ({interactuar}). C6A. |
| 3 | `ir` · `c6:intercepcion_reconocida` | Sigue el paso de los mojones. C6B01–03. |
| 4 | `ev` · `jefe:escarcha:items` | Enciende cuatro balizas (mantén {interactuar}). |
| 5 | `ev` · `jefe:escarcha:pelea` | Entra en la arena helada. |
| 6 | `ev` · `jefe:escarcha:purificado` | Abre el núcleo y purifica al guardián ({haz}). |
| 7 | `ev` · `jefe:escarcha:canal` | Canaliza junto al núcleo (mantén {interactuar}). |
| 8 | `ir` · `c6:cueva_alcanzada` | Busca el altar de la Cueva de Cristal. |
| 9 | `ev` · `c6:cristales_resueltos` | Repite los cuatro pulsos ({interactuar}). |
| 10 | `ev` · `frag:3` | Toca el fragmento ({interactuar}). Incluye C6M. |
| 11 | `ir` · `c6:cima_alcanzada` | Asciende con las corrientes ({saltar}). |
| 12 | `escena` · `c6:registro_leido` | Lee el registro de Kiri ({interactuar}). |
| 13 | `ir` · `c6:arena_regreso` | Desciende hacia la arena calmada. |
| 14 | `escena` · `c6:traicion_presenciada` | C6F completo hasta C6L15; transmisión antes del control. |
| 15 | `ev` · `c6:lumi_liberada` | Rompe los tres enlaces ({haz} o {atacar}). |
| 16 | `escena` · `c6:regreso_acordado` | Escucha a Lumi. C6S. |

Subeventos nuevos: `c6:enlace_circulo_roto`, `c6:enlace_barras_roto`, `c6:enlace_triangulo_roto`. Solo los tres confirman liberación. Salida: abrir capítulo 7 con `c6:regreso_acordado`; misión propuesta `c7_preparar_evacuacion`: «Habla con Yuki y Kaito antes de subir al faro».

## 6. Continuidad guardada

- `ecos3_luna_partida`: capítulo, paso, línea pendiente, ruta privada, envío de Lumi fuera del aislamiento e intercepción reconocida.
- Balizas individuales, guardián purificado/canalizado; recompensas únicas. Secuencia estable, reto resuelto separado de adquisición. Reconciliar acciones anticipadas.
- `frag[3]` y memoria pendiente juntos; emitir `frag:3` al cerrar u omitir C6M. Cuatro fragmentos integrados, sin robo. Identidad completa y nombre elegido persistentes.
- Cima alcanzada, registro y esquema contrastados. Copias disponibles sin Lumi. Tsuru solo permanece en registros anteriores; Tasogare continúa muerto; Momo conserva su estado seguro.
- Transmisión completa, red reactivada y control corporal se guardan en orden. Repetir la escena no vuelve a transmitir ni duplica enlaces.
- Tres nudos persistentes y progreso por nudo; reintento desde entrada segura con ataques activos reiniciados. No repetir memoria, traición ni rupturas confirmadas. Liberación y agencia se guardan juntas.
- Perdonar no es bandera ni recompensa. El Velo permanece; liberar a Lumi no libera a la Dorada. No hay encarnación lunar anticipada.

## 7. Sustituciones y cierre

| Fuente | Cambio propuesto para integración |
|---|---|
| `07`: `MIS.escarcha`, `tocarCristal` | Sustituir misión; retirar concesión automática tras cuarto pulso. Separar reto y contacto. |
| `11`: misión `g_escarcha`, recompensa `nucleo_nieve` | Absorber sus eventos sin doble recompensa; retirar trofeo de corazón extraído. Guardián vivo. Reemplazar teclas literales por acciones. |
| `07`: `MIS.kiri`, `manada`, `oso` | Integrar ascenso en principal; evitar recompensa duplicada. Fauna opcional conservada; ninguna condición de Kuma para recordar. |
| `26`: `fragmentos[3]`, `jefes.escarcha` | Sustituir narración de familia de montaña por C6M y C6G08. Registro nuevo obligatorio; colecciones de murales no lo sustituyen. |
| `07`: `fragmento`, `forja`, `alba`; `49`: cierre del 6 | Retirar apertura automática de espiral y cadenas por cuatro fragmentos. No activar forja, gigante Tasogare, Ofrenda ni Tormenta final antigua. Cierre solo tras C6S. |
| `35`: custodia Escarcha; `21`: objetivos | Sustituir oni por intercepción; añadir blancos de enlace y recepción de ataques nueva. No tratar a Lumi como fauna ni como Tasogare. |

**Archivos tocados:** creado únicamente `docs/entregas_chatgpt/2026-11-02_capitulo6_kiri.md`.

**Decisiones tomadas:** 55 minutos; prueba privada dentro de aislamiento existente; identidad después del duelo; registro material en la cima; combate de tres enlaces en la arena calmada; responsabilidad sin perdón automático. Geometría, ventanas y pasos nuevos son propuestas de producción.

**Preguntas abiertas reales — Pregunta para el usuario:** ninguna nueva de canon. **Dependencias para Claude:** enlace y estados del capítulo 5 indicados al inicio; conservar RU03–05 y las perturbaciones de Lumi en los refugios; medir duración, ascenso y legibilidad de ambos combates.
