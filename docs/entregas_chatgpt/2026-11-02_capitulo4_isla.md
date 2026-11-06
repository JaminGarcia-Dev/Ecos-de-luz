# Capítulo 4 · Fuera del Velo / Diseño de la isla nueva

**Fecha:** 2026-11-02. **Entrega editorial para Claude.** Sin implementación.

**Entrada:** Duna terminada; Pétalo, Marea y Arena integrados. Hikari y Lumi conocen la suplantación y la complicidad de Tasogare, padre de Akari. Hikari todavía no reconoce su continuidad completa con ella. Tsuru vive; conserva su farol. Sayo ha sido liberada del emisor de la gruta.

Fuentes: `AGENTS.md`, `COORDINACION.md`, `PLAN_FUSION.md`; `PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md`, reglas 1–27 y §§4–11; `PERSONAJES.md`; entregas `2026-11-02_capitulo1_petalo.md` y `2026-11-02_auditoria_piloto.md`. Sistemas y sustituciones contrastados con `js/07-sistemas.js`, `js/26-guion.js`, `js/37-asedio.js` y `js/39-escenas.js`.

## Parte A · Isla para producción procedural

### A1. Planta, bioma y construcción

**Nombre canónico:** isla Yoake («amanecer»); identificador de producción propuesto `isla_exilio`. Isla completa de **380 × 420 m**, al suroeste de la principal. Bosque costero templado: pinos bajos, juncos, pradera salina y playas pedregosas. Paleta: roca pizarra `#56636B`, hierba salvia `#859879`, arena crema `#D5C7A5`, madera `#89735C`, agua verde azul `#628E99`. El amanecer aporta ámbar; la vida cotidiana conserva colores sobrios.

Relieve: ensenada protegida al noreste; terrazas habitables entre 4 y 12 m; loma central de 32 m; costa occidental rocosa. Caminos de 3 m, pendientes suaves y descansos. Un circuito de unos 650 m conecta todos los lugares; los desvíos vuelven a él. Acceso caminando a cada objetivo; planear ofrece atajos.

Coordenadas locales orientativas: centro `(0,0)`, norte hacia `-z`; alturas sobre el mar. Ajustar sólidos y cámaras al prototipar.

| Punto | Centro x,z / altura | Construcción y función |
|---|---|---|
| Embarcadero | `130,-85 / 2 m` | Pasarela de 18 × 3 m, pilotes, dos amarres y cobertizo. Llegada y retorno visibles. |
| Refugio | `35,-25 / 8 m` | Seis casas de 6 × 8 m alrededor de patio de 25 m; casa común de 12 × 9 m. Dos interiores visitables. Camas, cocina y espacio para recién llegados. |
| Huertos | `-30,25 / 7 m` | Tres bancales, canal y compuerta; muestran alimento y trabajo compartido. |
| Cisterna | `-70,-45 / 12 m` | Depósito de lluvia y canal por gravedad. La dificultad es repartir agua. |
| Señal propia | `100,-130 / 18 m` | Torre de madera de 8 m. Su lámpara está apagada al llegar; postigo trabado. Usa energía ambiental, sin enlace lunar. |
| Mirador | `145,-25 / 26 m` | Plataforma con baranda; vista al noreste: silueta de la isla principal entre claros del Velo. |
| Cala occidental | `-135,80 / 1 m` | Paseo y varadero de reparación. Refuerza la extensión de la isla sin otra colección. |

Para three.js: máscara elíptica de costa, ruido de baja frecuencia y terrazas niveladas; adaptar chunks y niveles de detalle de `js/02-terreno.js`. Casas con cajas, tejados prismáticos y vigas; torre con cilindros y pasarela. Agrupar rocas, pilotes y vegetación repetida mediante instancias. Reservar caminos, parcelas y vistas antes de dispersar decoración. El Velo queda detrás del mar; fuera se ve el cielo natural, sin duplicar el astro.

Isla principal, corredor marítimo e isla exterior requieren regiones diferenciadas. El límite radial actual de `02-terreno` no admite esta ampliación directamente. Es terreno jugable nuevo, con mapa, colisiones y persistencia. Las regiones se abren por capítulo; el mar exterior abre en el 4.

### A2. Habitantes y tareas

Nombres y composición familiar decididos por Claude en `PLAN_FUSION.md`. Vestuario y rutinas son propuestas de producción.

| Habitante | Ficha breve y presencia |
|---|---|
| Sayo | Conserva ropa índigo remendada y farol cerrado. Embarca desde el muelle tras salir de la gruta; no se presupone que residiera aquí. Ayuda a recibir familias. Nao sigue fallecido. |
| Familia Hayase · Ren y su hija Sora | Familia del embarcadero. Ropa gris azul, cuerdas y mangas recogidas. Ren mantiene amarres y señal; Sora ayuda en tierra. |
| Familia Mori · Aiko y su hijo Taku | Familia de los huertos. Ropa tierra y verde. Aiko regula el agua; Taku conoce los bancales. |
| Chiyo · vecina de la casa común | Adulta mayor, delantal crema y paso firme. Organiza camas y comida. Atiende a Momo sin exigirle alegría. |

Rutinas y modelos humanos: adaptar `Gente` de `js/25-gente.js` y las fichas de `07-sistemas`; Sayo necesita su recurso propio. Los niños estudian, juegan y ayudan; los adultos asumen el mantenimiento peligroso.

Dos misiones breves integradas en la ruta: **Agua para compartir**, orientar la compuerta desde la cisterna hasta el bancal seco; **Una señal para volver**, subir a la torre, liberar el postigo y orientar la lámpara al canal de entrada. Cada acción cambia algo visible. Son interacciones nuevas sobre pasos de `MIS`; no existen como sistemas de reparación. Sin cuotas de materiales, monedas ni enemigos en el refugio.

### A3. Llegar y regresar

Barca de Kaito desde su muelle existente `(-150,152)`. Capacidad visual para los ocho viajeros: Kaito, Hikari, Lumi, Momo, Yuki, Sayo y dos refugiados. Sayo llega desde la gruta durante la evacuación; otros grupos quedan bajo protección en Hinode. No se afirma que una barca saque al pueblo entero.

Kaito gobierna. Hikari asegura la amarra, baja un postigo frente al barrido de un Cazador y libera una cuerda cuando Kaito indica el paso. Cada interacción usa `{interactuar}`. Se atraviesan rocas, niebla y corriente lateral; equivocarse devuelve a una posición segura, sin pasajeros perdidos. La barca y sus activadores son nuevos; reutilizar cámara y escenas de `js/09-cinematica.js` y `39-escenas`, y amenaza de `js/38-cazadores.js`. El Cazador termina su persecución dentro del Velo.

Frontera visual: pared irregular de niebla, reflejo rojo y sonido amortiguado; al cruzar, la niebla queda atrás y reaparecen horizonte, viento y cielo natural. Kaito explica la diferencia. No se disuelve el Velo ni se restaura el faro.

Se vuelve con Kaito desde el embarcadero exterior. La primera vuelta pertenece al capítulo; después, travesía abreviable entre amarres con `{interactuar}`. La señal marca la entrada segura. Adaptar viajes de `07-sistemas`: el viaje rápido no salta la primera travesía, la captura ni fronteras de capítulos.

## Parte B · Capítulo 4

### 1. Escaleta

**65 minutos objetivo**, pendientes de medir. Incluyen exploración, acciones y lectura manual. Sin esperas para alcanzar la cifra.

| Secuencia | Minutos | Objetivo / lugar | Sistema |
|---|---:|---|---|
| C4A | 0–4 | Reunirse en Hinode; comprender el cerco | `Cin.nocheRoja`, `39-escenas` |
| C4B | 4–12 | Abrir la salida de la plaza | Tres oleadas de `ASEDIOS.asedio`, `37-asedio` |
| C4C | 12–17 | Pérdida de Tsuru; recoger su farol | Puesta en escena de `TSURU_ESCENA`, `39-escenas` |
| C4D | 17–24 | Acompañar a Momo y Yuki al muelle | Coberturas y Cazadores, `38-cazadores` |
| C4E | 24–32 | Embarcar y cruzar el Velo | Barca nueva; cámara existente |
| C4F | 32–38 | Llegar y dejar a salvo a los viajeros | Conversación y diario, `07-sistemas` |
| C4G | 38–51 | Repartir agua y habilitar la señal | Interacciones nuevas; pasos `MIS` |
| C4H | 51–56 | Ver el amanecer y decidir volver | Mirador; conversación |
| C4I | 56–62 | Regresar por quienes quedaron | Travesía y desembarco |
| C4J | 62–65 | Descubrir la captura y seguir su señal | Escena nueva; gancho al 5 |

El asedio conserva tres oleadas y el pulso de Yuki. Su final abre una salida; no representa una victoria definitiva. Una Sombra alcanza a Tsuru mientras protege a Momo en el paso. El pulso del farol usa energía ambiental; su muerte es consecuencia del ataque. Reutilizar dispersión y caída del farol, retirando la idea antigua de quemar voluntariamente su núcleo. Hikari está sosteniendo la salida de otras personas en el mismo plano. No hay una falsa opción de salvarla ni fallo por tardar.

### 2. Qué aprende el jugador

| Idea esencial | Línea obligatoria |
|---|---|
| La Noche Roja amplía una persecución ya existente | C4N01–03 |
| Tsuru murió; su farol conserva testimonios anteriores | C4T04–06, C4R05–07 |
| El Velo rodea una isla; existe vida fuera del pacto | C4B03–04, C4R01–03, C4H01–02 |
| Las protecciones cortan señales; Lumi reacciona | C4R08–10 |
| Tasogare captura a Momo; ella deja una pista | C4C01–06 |

Cada hecho lo dice un personaje. Las preguntas opcionales no contienen información necesaria.

### 3. Guion completo

Solo subtítulos, sin voces ni habla sintetizada. Conversaciones con avance manual, pausa y repetición; una línea visible. Mantener cada frase al menos palabras/2,5 + 1 s. Las intervenciones durante juego esperan una ventana segura. Omitir conserva resumen y consecuencias; repetir no duplica objetos. Koto y flauta, ambiente continuo y salida musical suave durante la pérdida.

#### C4A–B · Noche Roja

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C4N01 | Hikari | «La luna ya era roja. Ahora el rojo cubre los caminos.» | Primer plano de `Cin.nocheRoja` | Mira cielo y salida |
| C4N02 | Yuki | «Las Sombras están cercando Hinode.» | Plano de la plaza | Reúne a las familias |
| C4N03 | Yuki | «Abre un paso. Yo sacaré a los niños.» | Antes de las oleadas | Señala el corredor |
| C4N04 | Tasogare | «Entréguenme a los niños. Yo los protegeré.» | Sobre el torii | Mano extendida |
| C4N05 | Yuki | «No te los llevarás.» | Respuesta | Se planta ante la salida |
| C4N06 | Tsuru | «Momo, ve con Yuki.» | Antes del combate | La acerca al grupo |
| C4N07 | Tsuru | «Guardé mi testimonio en el farol.» | A Hikari | Toca su marco |
| C4N08 | Interfaz | «Abre la salida · oleada {n}/{m}» | Durante el asedio | Marcador |
| C4N09 | Yuki | «El paso está libre. ¡Hacia la costa!» | `asedioFin` | Hace avanzar al grupo |

#### C4C–D · El farol queda

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C4T01 | Momo | «¡Abuela, por aquí!» | Una Sombra corta el paso | Tiende la mano |
| C4T02 | Tsuru | «Sigue con Yuki.» | Se interpone y alza el farol | El pulso abre un hueco |
| C4T03 | Momo | «¡Abuela!» | El ataque alcanza a Tsuru | Yuki sostiene a Momo |
| C4T04 | Yuki | «Las Sombras la mataron.» | Tras dispersarse en luz | Se arrodilla; pausa |
| C4T05 | Momo | «Su farol sigue aquí.» | Junto al objeto | No intenta alcanzarla |
| C4T06 | Hikari | «Lo llevaré conmigo.» | Recoge el farol | Guarda silencio 3 s |
| C4T07 | Yuki | «Nos esperan en el muelle de Kaito.» | Después de la reacción | Ofrece la mano a Momo |
| C4T08 | Hikari | «Hay un Cazador sobre la costa.» | Antes del tramo expuesto | Busca cobertura |
| C4T09 | Yuki | «Nos moveremos cuando aparte el ojo.» | Desde una roca | Mantiene unido al grupo |
| C4T10 | Interfaz | «Cúbrete junto a la roca · {agacharse}» | Primera cobertura | Ayuda breve |

Dispersión sin cuerpo, sangre ni heridas. El farol cae encendido. No mostrar la muerte como recompensa, ascenso o rito. La ruta admite reintentos sin volver a matar a Tsuru.

#### C4E · Cruzar

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C4B01 | Kaito | «Suban. Conozco un paso entre las corrientes.» | Muelle | Cuenta pasajeros |
| C4B02 | Sayo | «Vengo de la gruta. Iré con ustedes.» | Embarca | Ayuda a subir a Momo |
| C4B03 | Kaito | «El Velo rodea nuestra isla. Hay otra fuera.» | Antes de soltar amarras | Señala el horizonte |
| C4B04 | Kaito | «Se llama Yoake. Allí viven familias que huyeron con sus hijos.» | Respuesta de Hikari | Comprueba la cuerda |
| C4B05 | Interfaz | «Soltar amarra · {interactuar}» | Barca preparada | Inicia salida |
| C4B06 | Kaito | «Baja el postigo. Su ojo barre el agua.» | Refugio entre rocas | Señala la cobertura |
| C4B07 | Interfaz | «Cerrar postigo · {interactuar}» | Barrido próximo | Sin combate obligatorio |
| C4B08 | Kaito | «Ahora suelta esa cuerda. Yo llevaré la barca.» | Corriente transversal | Corrige el rumbo |
| C4B09 | Interfaz | «Liberar cuerda · {interactuar}» | Ventana segura | Confirma avance |
| C4B10 | Hikari | «El rojo quedó detrás.» | Frontera cruzada | Mira hacia popa |
| C4B11 | Kaito | «Era su proyección dentro del Velo. Aquí vemos el cielo.» | Horizonte despejado | Afloja los hombros |

#### C4F–G · Una casa y trabajo

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C4R01 | Aiko | «Soy Aiko Mori. Hui con mi hijo Taku. Sigue conmigo.» | Recepción obligatoria | Lo reúne a su lado |
| C4R02 | Hikari | «¿Aquí nadie entrega niños?» | Mira las casas | Pregunta directa |
| C4R03 | Aiko | «Nadie. Compartimos agua, comida y trabajo.» | Respuesta | Abre la casa común |
| C4R04 | Chiyo | «Soy Chiyo. Momo, puedes sentarte conmigo.» | Entrada | Deja un sitio sin exigir respuesta |
| C4R05 | Momo | «Quiero leer lo que dejó la abuela.» | Ante el farol | Hikari se sienta a su altura |
| C4R06 | Tsuru · grabación anterior | «Vi llevar niños al faro. Callé. Debí hablar.» | Reproducción obligatoria | Identificar registro anterior |
| C4R07 | Hikari | «Es lo que dejó grabado. Tsuru no está dentro.» | Cierra el registro | Momo apoya una mano junto al farol |
| C4R08 | Hikari | «Lumi, tu luz cambió.» | Cruzan la protección | Observa su halo entrecortado |
| C4R09 | Sayo | «Aquí no llegan las señales del faro.» | Dentro del refugio | Señala el límite protegido |
| C4R10 | Lumi | «Me quedaré junto al alero.» | Se aparta | Permanece dentro; no transmite |
| C4R11 | Aiko | «El agua se desvía al bancal lleno. Abre el canal del seco.» | Cisterna | Muestra ambos cauces |
| C4R12 | Interfaz | «Orientar compuerta · {interactuar}» | Mecanismo | El agua cambia de camino |
| C4R13 | Aiko | «Ya llega. Hoy podremos regarlo.» | Flujo confirmado | Comprueba la tierra |
| C4R14 | Ren | «Soy Ren Hayase. Mi hija Sora espera abajo. La lámpara toma luz del entorno. Su postigo se trabó.» | Torre | Señala el cierre |
| C4R15 | Interfaz | «Liberar postigo y orientar señal · {interactuar}» | Plataforma | Ilumina el canal |
| C4R16 | Kaito | «Así reconoceré la entrada cuando vuelva.» | Señal habilitada | Mira hacia el mar |

#### C4H–J · Regresar

Momo elige volver con el grupo. Al desembarcar, Tasogare la intercepta tras el cobertizo mientras los adultos amarran. Se muestra la captura desde allí; Hikari la descubre al rodearlo. No hay plazo de rescate oculto.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C4H01 | Hikari | «Está amaneciendo. El faro sigue roto.» | Mirador | Observa ambos horizontes |
| C4H02 | Sayo | «El sol no depende de ese pacto.» | Respuesta | Deja espacio a Hikari |
| C4H03 | Hikari | «Quedó gente en Hinode. Volvamos por ellos.» | Decisión | Mira a Kaito |
| C4H04 | Momo | «Voy con Yuki. Quiero ayudar a traerlos.» | Embarcadero | Busca su mano |
| C4H05 | Yuki | «Te quedarás conmigo.» | Antes de embarcar | La ayuda a subir |
| C4C01 | Tasogare | «Momo. Ven conmigo. Yo puedo protegerte.» | Regreso al muelle principal | Se interpone entre ella y Yuki |
| C4C02 | Momo | «¡Yuki! ¡No quiero ir!» | Tasogare la sujeta y se la lleva | Suelta un lazo del obi |
| C4C03 | Yuki | «¡Tasogare se llevó a Momo!» | Alcanza a Hikari | Señala el sendero |
| C4C04 | Hikari | «Aquí está su lazo.» | Tras el cobertizo | Lo recoge del poste |
| C4C05 | Yuki | «La vi soltarlo. Nos dejó una señal.» | Junto a la pista | Mira cuesta arriba |
| C4C06 | Hikari | «Va hacia el faro. Vamos por ella.» | Huellas en el sendero | Devuelve el control |

### 4. Misión propuesta

**ID:** `c4_fuera_velo`. Activar al cerrar Duna, no por número de fragmentos. En `ir` y `escena`, las señales siguientes nombran salidas propuestas; no son eventos existentes. Las escenas avanzan por su cierre; los `ev`, por eventos confirmados.

1. `escena` · `Cin.nocheRoja` · `c4:cerco_visto`: «Vuelve a Hinode.» C4A.
2. `ev` · `asedio`, `empieza: asedio`: «Abre la salida de Hinode.» Conservar `empieza:asedio` → `asedioFin` → `Sis.evento('asedio')`.
3. `escena` · nueva pérdida · `c4:tsuru_perdida`: C4T01–07. Farol adquirido una vez al cerrar.
4. `ir` · `c4:muelle_alcanzado`: «Acompaña a Momo hasta Kaito.» C4T08–10.
5. `ev` · `c4:velo_cruzado`: «Embarca y sigue las indicaciones de Kaito ({interactuar}).» Subeventos nuevos: `c4:amarra_suelta`, `c4:postigo_cerrado`, `c4:cuerda_liberada`; el cruce solo confirma tras completarlos.
6. `escena` · recepción · `c4:refugio_conocido`: C4R01–10.
7. `ev` · `c4:agua_repartida`: «Orienta la compuerta hacia el bancal seco ({interactuar}).»
8. `ev` · `c4:senal_lista`: «Habilita la señal del embarcadero ({interactuar}).»
9. `escena` · mirador · `c4:regreso_decidido`: C4H01–03.
10. `ev` · `c4:regreso_desembarcado`: «Regresa con Kaito ({interactuar}).» Incluye C4H04–05.
11. `escena` · captura y pista · `c4:momo_capturada`: C4C01–06.

**Salida:** capítulo 5 disponible, Mirador/camino del faro abierto; misión propuesta `c5_rescatar_momo`: «Sigue la señal de Momo hacia el faro.» Kiri permanece cerrado.

### 5. Continuidad guardada

- Clave única `ecos3_luna_partida`: región, capítulo, misión, paso y línea pendiente. Guardar cada desembarco; al cargar en el mar, restaurar último tramo seguro y pasajeros.
- Oleadas completadas; reiniciar solo la interrumpida. Muerte, farol e inicio de huida se guardan juntos. Restaurar ausencia de Tsuru sin repetir su muerte.
- Tres fragmentos integrados, sin robo. Registro de Tsuru fechado antes de morir; solo se reproduce, nunca responde.
- Agua, señal, recepción y decisión persistentes; reconciliar tareas realizadas antes del paso. Protección del refugio bloquea transmisiones de Lumi. Diario y objetivos funcionan sin ella.
- Posiciones y embarque únicos de Sayo, Momo, Yuki y Kaito. Captura, ausencia de Momo y lazo como prueba se guardan juntos; rescate pendiente, sin extracción iniciada aquí.

### 6. Sustituciones y cierre

En `07-sistemas`, sustituir `MIS.nocheRoja` completa: retirar activación con dos fragmentos y paso `Cin.robo`. Reutilizar asedio; retirar `laVerdad`/`Cin.verdad` de la cadena: su identificación de Akari como hija de Kaito contradice el canon. `guardian` deja de abrirse tras `laVerdad`; se integra en el capítulo 5. No activar `forja`, `caza` ni `alba` por esta visita. Revisar herencia `tsuru → momo`: la captura no puede desbloquear diálogos de Tsuru ni tareas que exijan hablar con Momo ausente.

En `26-guion`, C4N04 sustituye `tasogare.nocheRoja`; C4N08–09 sustituyen marcador/final de `asedio`. C4T y C4R reemplazan `tsuru.farol` y frases `npc.*.nocheRoja`, especialmente «Por eso la dio». Elegir etapa por capítulo y ausencias, no por `ST.robado`. No reutilizar la falsa hija de `verdad.kaito`: Rui es el hijo fallecido de Kaito. Mantener los signos decididos: disco completo con conejo para la Dorada; media luna cortada con grieta para el sello actual.

En `39-escenas`, adaptar `Cin.nocheRoja`; extraer la pérdida de `Cin.robo` sin robo, pedestal ni banner. En `37-asedio`, desacoplar el cierre ambiental de `roboFin`: nueva salida tras la pérdida. El rojo permanece dentro del Velo. La persecución marítima requiere adaptar la ruta terrestre del Cazador de Marea en `38-cazadores`. Barca, isla, lectura de grabaciones y activadores siguen pendientes de implementación por Claude.

**Archivos tocados en esta revisión:** actualizado `docs/entregas_chatgpt/2026-11-02_capitulo4_isla.md`; creado `docs/entregas_chatgpt/2026-11-02_capitulo5_tasogare.md` como entrega del mismo encargo.

**Decisiones tomadas:** isla completa; 65 minutos objetivo; dos tareas útiles; Sayo cruza desde la gruta; muerte causada por ataque; regreso antes de la captura; solo subtítulos. Aplicados los nombres canónicos Yoake, Hayase (Ren y Sora), Mori (Aiko y Taku) y Chiyo. Ajustadas fichas y diálogos a esos integrantes. Dimensiones y rutinas siguen siendo propuestas de producción.

**Preguntas abiertas:** ninguna nueva de canon. Los nombres pendientes quedaron resueltos por Claude.
