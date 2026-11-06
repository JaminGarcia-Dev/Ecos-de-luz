# Capítulo 5 · Lo que un padre llama salvar

**Fecha:** 2026-11-02. **Entrega editorial para Claude.** Sin implementación.

**Entrada:** `c4:momo_capturada`, tras regresar de Yoake. Lazo de Momo hacia el faro. Hikari conserva tres fragmentos y farol de Tsuru, fallecida. Sayo en Yoake. Yuki acompaña; Kaito mantiene salida marítima. Kiri cerrado; identidad completa reservada al capítulo 6.

**Fuentes leídas:** `AGENTS.md`, `COORDINACION.md`, `PLAN_FUSION.md` (decisiones Sayo, Yoake, Hayase, Mori, Chiyo); `PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md`, reglas 1–27, §§4–11, especialmente §7; `PERSONAJES.md`; `PARTE_2_GUION_DETALLADO_DEL_INICIO.md`; entregas de capítulos 1–4 del 2/11. Módulos contrastados: `js/07-sistemas.js`, `js/04-estructuras.js`, `js/11-jefes.js`, `js/20-armas.js`, `js/21-combate.js`, `js/23-ataques-golem.js`, `js/26-guion.js`, `js/27-ecos.js`, `js/31-arenas.js`, `js/35-sombras.js`, `js/38-cazadores.js`, `js/42-duelo.js`, `js/43-duelo-espiral.js`, `js/09-cinematica.js`, `js/49-campana.js`.

## 1. Escaleta

**55 minutos objetivo**, por medir. Navegación y lectura libre; sin esperas obligatorias.

| Secuencia | Minutos | Objetivo / lugar | Reutilización |
|---|---:|---|---|
| C5A · La señal | 0–5 | Seguir el rastro desde el muelle | Navegación y pasos de `07` |
| C5B · El camino cerrado | 5–17 | Reunir piedras; purificar al Gólem Musgoso | Altar, pilares y combate de `11`, `23`, `31` |
| C5C · Lo que guardaron | 17–27 | Consultar a Taiyo, ver el eco y tomar la katana en el Mirador | `27`, `Estr.katana`, recogida de `07` |
| C5D · La plaza | 27–37 | Apartar a Tasogare del acceso al faro | Duelo de `42`; guardia y golpes de `21` |
| C5E · La espiral | 37–47 | Iluminar plataformas y alcanzar a Momo | `43`, Sombras de `35`, Cazador temporal de `38` |
| C5F · El último intento | 47–51 | Interrumpir el dispositivo; detener la reactivación | Interacción nueva; escena con `Cin` de `09` |
| C5G · Después | 51–55 | Atender a Momo y acordar buscar Escarcha | Conversación y continuidad de `07` |

**Espacio propuesto:** enlazar arena Musgosa `(118,-26)`, Mirador `(74,80)` y plaza. Arena guardando el acceso; tres piedras junto al corredor.

**Dispositivo nuevo:** extractor al final de la espiral, bajo la corona. Aro, cierre lateral y palanca visibles. Momo sujeta antes del duelo. Accionamiento presencial, sin cuatro claves. Corona y prisión inaccesibles.

## 2. Qué aprende el jugador

| Hecho esencial | Líneas obligatorias |
|---|---|
| La señal es de Momo; Tasogare la llevó hacia el faro | C5S01–04, C5M01 |
| El aparato local puede matarla sin reparar la red completa | C5A04–07, C5P04 |
| Energía e identidad son distintas; restaurar una forma anterior ha fallado | C5A05–08 |
| Tasogare es padre de Akari; pretende usar a Momo y gastar a Hikari | C5A02, C5P01–09 |
| Hikari mata a Tasogare al impedir la extracción; la muerte es definitiva | C5F04–08, C5D01–06 |

Dirección a Kiri: C5D07–10. Información esencial obligatoria.

## 3. Guion completo

Solo subtítulos. Avance manual, pausa y repetición; una línea visible. Intervenciones en ventanas seguras. `{omitir}` guarda resumen y consecuencias, sin resolver combates ni interacciones pendientes. Koto y flauta; ambiente continuo. Salida musical suave ante el aparato; sin fanfarria por Tasogare.

### C5A–B · Subir por Momo

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C5S01 | Hikari | «Momo soltó este lazo para que la encontráramos.» | Retoma la pista del capítulo 4 | Lo sostiene; no lo recoge otra vez |
| C5S02 | Yuki | «Tasogare subió por aquí. El camino pasa por el Mirador.» | Salida del muelle | Señala la subida |
| C5S03 | Hikari | «Volveremos con ella.» | Antes de avanzar | Guarda el lazo |
| C5S04 | Kaito | «La barca estará preparada para llevarla a Yoake.» | Despedida | Permanece en el muelle |
| C5G01 | Yuki | «El guardián bloquea la subida.» | Entrada segura de la arena | Se detiene |
| C5G02 | Lumi | «La red del faro lo mantiene corrompido.» | Observan al Musgoso | Señala sus vetas |
| C5G03 | Lumi | «Hay tres Piedras Ancestrales junto al sendero. Van en ese altar.» | Antes de recoger | Indica los tres puntos cercanos |
| C5G04 | Interfaz | «Colocar tres Piedras Ancestrales · {interactuar}» | Altar preparado | Despierta al guardián |
| C5G05 | Lumi | «El musgo lo regenera. Retíralo con el haz.» | Primera ventana segura | Señala los parches |
| C5G06 | Lumi | «Haz que cargue hacia un pilar. Apártate de su línea.» | Antes de la primera carga | Indica un pilar |
| C5G07 | Lumi | «Está aturdido. Apunta el haz al núcleo.» | Primer choque | Sin tapar el siguiente aviso |
| C5G08 | Interfaz | «Canalizar luz · mantén {interactuar}» | Purificado | Interacción junto al núcleo |
| C5G09 | Hikari | «Está vivo. Ya se ha calmado.» | Tras canalizar | Baja las manos |
| C5G10 | Yuki | «Podemos seguir al Mirador.» | Salida abierta | Retoma la marcha |

### C5C · El Mirador

Registros materiales de Taiyo. El eco `quiebre` muestra a Tasogare conduciendo a otro niño al faro, sin nombre nuevo. Reutilizar aparición y diario de `27`; figuras según `PERSONAJES`.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C5A01 | Hikari | «Tasogare se llevó a Momo. Necesitamos llegar al faro.» | Ante Taiyo | Permanece de pie |
| C5A02 | Taiyo | «Akari es su hija. Cree que puede devolverle su forma anterior.» | Respuesta | Abre las hojas |
| C5A03 | Taiyo | «Guardé estos registros. Debí entregarlos antes.» | Muestra el documento | Reconoce su silencio |
| C5A04 | Taiyo | «Conserva un extractor local. Puede funcionar aunque la red siga rota.» | Lectura obligatoria | Señala el esquema |
| C5A05 | Hikari | «“Restauración fallida. La energía añadida no restituyó la identidad”.» | Lee el resultado registrado | Sigue la línea |
| C5A06 | Taiyo | «El aparato puede arrancar el núcleo de Momo. Eso la mataría.» | Explicación | Baja la hoja |
| C5A07 | Hikari | «Aunque no consiga lo que promete.» | Conclusión | Mira el dibujo del aro |
| C5A08 | Taiyo | «No puede fabricar a la Akari de antes. Tampoco devolver a los muertos.» | Confirmación | No promete revertir pérdidas |
| C5A09 | Taiyo | «Aquí está el cierre lateral. Interrumpe el aparato desde ahí.» | Preparación del rescate | Marca la pieza en la copia |
| C5E01 | Hikari | «Ese es Tasogare. Lleva a un niño hacia el faro.» | Eco obligatorio | Sigue las manos unidas |
| C5E02 | Taiyo | «Condujo a otros antes de que eligieran a Akari.» | Ante el recuerdo | No aparta la mirada |
| C5E03 | Hikari | «También persiguió a quienes intentaron huir.» | Recuerda las pruebas | Guarda la copia |
| C5K01 | Taiyo | «La Katana del Alba sigue aquí. Puedes tomarla.» | Si no está adquirida | Señala `Estr.katana` |
| C5K02 | Interfaz | «Tomar la Katana del Alba · {interactuar}» | Recogida existente | Adquisición única |
| C5K03 | Hikari | «Voy a detenerlo.» | Con arma disponible | Se vuelve hacia el faro |

Katana existente; procedencia sin definir, nunca punta de Tasogare. Si ya se posee, omitir C5K01–02 y comprobar equipo. Desactivar su emboscada automática del Mirador.

### C5D · Lo que llama salvar

Momo arriba. Yuki busca el acceso inferior; Hikari afronta la plaza. Tasogare conserva tamaño y katana rota.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C5P01 | Hikari | «¿Dónde está Momo?» | Entrada de la plaza | Detiene la marcha |
| C5P02 | Tasogare | «Arriba. Su luz devolverá a mi hija.» | Respuesta | Cierra el acceso |
| C5P03 | Hikari | «Akari. Sabías lo que hacían antes de que la eligieran.» | Lo enfrenta | Mantiene la distancia |
| C5P04 | Tasogare | «Akari es mi hija. No espero otro ciclo. Esta extracción será para ella.» | Antes del duelo | Mano sobre la empuñadura |
| C5P05 | Hikari | «Momo morirá. Tus registros dicen que no puedes restaurar a Akari.» | Advierte | Muestra la copia |
| C5P06 | Tasogare | «Tú conservas algo suyo. Lo usaré para traerla como era.» | Mira su máscara | Niega su vida actual |
| C5P07 | Hikari | «Siento esos recuerdos como míos. No puedes borrarme para buscarla.» | Respuesta | Mano al pecho |
| C5P08 | Tasogare | «Gastaré esa forma si hace falta.» | Rechaza detenerse | Desenvaina la hoja rota |
| C5P09 | Hikari | «Momo no es el precio de tu hija.» | Cierre | Adopta guardia |
| C5P10 | Interfaz | «Cortes: {guardia}. Cargas: {esquivar}. Contraataca con {atacar}.» | Antes de devolver control | Ayuda de combate |
| C5P11 | Tasogare | «No vas a detenerme.» | Fin de resistencia en plaza | Retrocede hacia la subida |
| C5P12 | Hikari | «Va hacia Momo.» | `dueloFin` | Mira la espiral |

### C5E · La espiral en sombra

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C5L01 | Lumi | «Ilumina la siguiente plataforma. Así podrás pisarla.» | Primer apoyo | Señala el borde |
| C5L02 | Hikari | «La que piso conserva la luz.» | Primer avance | Comprueba el suelo |
| C5L03 | Lumi | «Aquí el haz gasta luz. Apágalo para recuperarla.» | Descanso seguro | Mira el medidor |
| C5L04 | Lumi | «Con el haz activo no puedes parar ni golpear.» | Antes de la primera Sombra | Advierte la decisión |
| C5L05 | Lumi | «El ojo apaga las plataformas vacías. Espera a que pase.» | Primer barrido | Marca el siguiente apoyo |
| C5L06 | Hikari | «Tasogare llama Sombras sobre la subida.» | Primera invocación visible | Sigue el hilo desde su mano |
| C5L07 | Interfaz | «Iluminar plataforma · {haz}» | Durante el ascenso | Marcador persistente |

### C5F · Momo dentro del aro

En el rellano, retirar amenazas de la espiral. Tasogare alcanza el mando lateral, siempre visible. Hikari abre el cierre jugando: detiene el aparato y suelta el aro. Momo se incorpora dentro del perímetro. El golpe impide la reactivación antes de que pueda salir.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C5M01 | Momo | «Solté el lazo junto al muelle. Quería que me vieran.» | Llegada de Hikari | Levanta la cabeza |
| C5M02 | Momo | «Ese cierre está unido al aro.» | Mira el lateral | Señala con la mano |
| C5M03 | Hikari | «Voy a abrirlo.» | Ante el cierre | Guarda la katana |
| C5M04 | Interfaz | «Interrumpir extractor y abrir aro · {interactuar}» | Interacción nueva | Detiene aparato y sujeción |
| C5F01 | Hikari | «Momo, sal por aquí.» | Cierre abierto | Le tiende la mano |
| C5F02 | Hikari | «Tasogare, déjala salir.» | Él alcanza la palanca | Se interpone |
| C5F03 | Tasogare | «Todavía puedo recuperar a Akari.» | Rechaza abandonar | Empuja el mando |
| C5F04 | Momo | «¡Vuelve a tirar de mí!» | Se reactiva el conducto | Su luz comienza a tensarse |
| C5F05 | Hikari | «¡Suéltala!» | Amenaza inmediata | Desenvaina e intercepta |
| C5F06 | Momo | «Se detuvo.» | El golpe alcanza a Tasogare | El hilo se apaga |
| C5F07 | Hikari | «Ven.» | Tasogare se dispersa en luz | Saca a Momo del perímetro |
| C5F08 | Interfaz | «Asegurar cierre del extractor · {interactuar}» | Tras la escena | Inutiliza el mando local |

**Dirección del golpe:** plano conjunto de Momo, hilo activo y mano de Tasogare sobre la palanca. Hikari lo alcanza con un corte. Sin detalle de impacto, sangre ni heridas. Suelta el mando y se deshace en luz, sin cuerpo. Sigue atacando. Muerte dirigida tras la interacción; sin elección de perdón, remate ni prueba de reflejos.

### C5G · Seguir con lo ocurrido

Descenso seguro abreviado; Yuki recibe a Momo. Sin ataques, botín ni discurso póstumo.

| ID | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| C5D01 | Yuki | «Momo, estoy aquí.» | Reencuentro | Se arrodilla; ofrece abrigo |
| C5D02 | Momo | «Quiero sentarme.» | Respuesta | Se apoya en ella |
| C5D03 | Hikari | «Maté a Tasogare.» | Momo ya atendida | Mira su mano vacía |
| C5D04 | Hikari | «Volvió a activar el aparato. Momo seguía dentro.» | Tras pausa | Respira antes de seguir |
| C5D05 | Yuki | «Iba a matarla. Lo detuviste.» | Respuesta | Permanece junto a ambas |
| C5D06 | Hikari | «No volverá. Liberar a la Dorada tampoco lo traerá.» | Después de 3 s | Baja la cabeza |
| C5D07 | Hikari | «Hablaba de devolver a Akari. Yo siento sus recuerdos.» | Sin confirmar identidad | Toca su máscara |
| C5D08 | Lumi | «Falta el fragmento de Escarcha. Está en Kiri.» | Orientación | No promete otra persona |
| C5D09 | Hikari | «Necesito recordar. Iré a buscarlo.» | Decisión | Levanta la mirada |
| C5D10 | Yuki | «Llevaré a Momo con Kaito. La espera una casa en Yoake.» | Cierre | Acompaña a Momo |

## 4. Combates y etapas

Avisos legibles sin sonido: bordes claros sobre rojo; línea, sector, anillo y discos diferenciados. Sustituyen avisos heredados, sin superponerse a conversaciones.

| Encuentro / etapa | Enemigo | Jugador | Aviso |
|---|---|---|---|
| Musgoso 1 | Onda expansiva, lluvia de rocas y embestida | Saltar la onda; salir de discos; alinear carga con pilar y apartarse; haz al núcleo aturdido | C5AV01 «Onda: salta»; C5AV02 «Rocas: sal de los círculos»; C5AV03 «Carga: apártate de la línea» |
| Musgoso 2, 66 % | El musgo restante regenera corrupción; repite cargas | Retirar parches con {haz}; aprovechar choque y núcleo; purificar y canalizar | C5AV04 «El musgo lo regenera»; C5AV05 «Núcleo expuesto · {haz}» |
| Plaza, guardia | Tasogare bloquea golpes frontales y puede contraatacar | Buscar espalda, golpe cargado o recuperación; no atacar sin pausa | C5AV06 «Contraataque» con sector anticipado |
| Plaza, cortes y carga | Encadena cortes; carga en dirección anunciada | Parar con {guardia} o esquivar; esquivar carga; atacar durante recuperación o equilibrio roto | C5AV07 «Corte»; C5AV08 «Carga»; C5AV09 «Sin equilibrio» |
| Espiral, apoyos | Sombras lanzadoras/escudo fijas; máximo dos; plataformas pierden luz | Iluminar siguiente apoyo, avanzar; apagar haz para recuperar luz y combatir | C5L01–04; proyectiles y defensa visibles |
| Espiral, barrido | Cazador temporal devora luz de apoyos vacíos | Esperar en apoyo ocupado; reiluminar tras el barrido | C5L05 y cono visible |
| Rellano | Tasogare reactiva extracción con Momo dentro | Abrir cierre; escena dirigida detiene la acción; asegurar aparato | C5F04 y conducto visible |

Tiempos de `42`: primer corte 0,9 s, siguientes 0,7 s, carga 1,1 s; perfil ajustado al capítulo. Máximo de cortes según rango. Espiral: coste y permanencia de `43`; apoyo ocupado para recuperar luz. Reintento desde rellano seguro propuesto, sin muerte de Momo ni cuenta atrás global.

## 5. Misión propuesta

**ID:** `c5_rescatar_momo`, enlace del capítulo 4. `ev` consume evento; `ir` comprueba llegada; `escena` requiere escena nueva. Señales `c5:*` propuestas; cierres de escenas como salidas.

1. `escena` · `c5:rastro_acordado`: «Sigue la señal de Momo hacia el faro». C5S.
2. `ev` · `jefe:musgoso:items`: «Reúne tres Piedras Ancestrales junto al sendero».
3. `ir` · `c5:arena_alcanzada`: «Llévalas al Altar de Musgo».
4. `ev` · `jefe:musgoso:pelea`: «Coloca las piedras ({interactuar})».
5. `ev` · `jefe:musgoso:purificado`: «Retira musgo y alcanza el núcleo con {haz}».
6. `ev` · `jefe:musgoso:canal`: «Canaliza: mantén {interactuar}».
7. `ir` · `c5:mirador_alcanzado`: «Sube a las ruinas del Mirador».
8. `escena` · `c5:extractor_comprendido`: «Consulta a Taiyo y observa el eco ({interactuar})». C5A y C5E.
9. `ev` · `katana`: «Toma la Katana del Alba ({interactuar})». Reconciliar si ya existe.
10. `escena` · `c5:tasogare_enfrentado`: «Llega a la plaza del faro». C5P01–10.
11. `ev` · `duelo`, `empieza:duelo`: «Aparta a Tasogare: {guardia}, {esquivar}, {atacar}».
12. `ev` · `duelo2`, `empieza:duelo2`: «Alcanza a Momo por la espiral ({haz})».
13. `ev` · `c5:aro_abierto`: «Interrumpe el extractor y abre el aro ({interactuar})». C5M.
14. `escena` · `c5:tasogare_muerto`: «Detén la reactivación». C5F01–07, dirigida.
15. `ev` · `c5:extractor_asegurado`: «Asegura el cierre ({interactuar})».
16. `escena` · `c5:rescate_cerrado`: «Reúnete con Yuki y Momo». C5D completo.

Puentes existentes: `dueloFin → Sis.evento('duelo')`; `duelo2Fin → Sis.evento('duelo2')`. Configurar `CAPITULOS[5].fin`: `c5:rescate_cerrado`. Abre Kiri y propone `c6_escarcha`: «Busca el fragmento de Escarcha en Kiri».

## 6. Continuidad guardada

- `ecos3_luna_partida`: misión, paso, posición segura y línea pendiente. Fragmentos `[true,true,true,false]`, farol y pruebas conservados.
- Piedras recogidas/consumidas, altar, purificación y canalización separados. Guardián vivo; núcleo conservado. Reconciliar eventos cumplidos.
- Documento, eco `quiebre` y comentario registrados; katana adquirida/equipada una vez.
- Plaza superada y rellano seguro persistentes; sin repetir plaza. Adaptar `42`, que reinicia resistencia, y `43`, que inicia plataformas vacías sin checkpoints intermedios.
- Aro abierto y escena pendiente se guardan juntos. Muerte definitiva, Momo fuera del aro y extractor detenido: transacción única. Asegurarlo impide reuso local; red lunar intacta.
- Cargar u omitir aplica el cierre una vez; repetir línea solo reproduce actuación. Sin resurrecciones ni identidad completa. Momo vuelve acompañada a Yoake, sin duplicado en Hinode.

## 7. Sustituciones y cierre

| Fuente | Sustituir o retirar al integrar |
|---|---|
| `07`: `guardian`, `hoja`, `alba` | Absorber Mirador y recogida en C5. Retirar cadena `laVerdad → guardian`; trasladar pasos `duelo/duelo2` de `alba`. Ningún `duelo3`, `corona`, forja Solar u Ofrenda por cerrar C5. |
| `07`: descripción de `katana` | Retirar garantía absoluta «no seres vivos». Mantener protección habitual de fauna y aldeanos; muerte dirigida excepcional. |
| `11`, `31`: `g_musgoso` | Integrar cuatro eventos sin misión/recompensa duplicada. Reubicar piedras al corredor; ajustar dificultad. Retirar `nucleo_tierra` como trofeo y textos con tecla literal. |
| `26`, `27` | Reemplazar eco `quiebre` y `tasogare.mirador/duelo/derrota`; usar C5. Sustituir avisos `GUION.duelo`, `jefes.musgoso`; quitar despedida que absuelve y crecimiento con fragmento robado. |
| `35` | Desactivar emboscada del Mirador por `katanaTomada`; conservar Sombras fijas de la espiral. |
| `42` | Conservar combate y retirada a espiral. Su dispersión de humo representa desplazamiento; reservar disolución definitiva para C5F. |
| `43` | Sustituir `terminar()` y «se retira al cristal»: conservar limpieza de Sombras/Cazador y `duelo2Fin`; mantener a Tasogare visible junto al aparato. Desacoplar acceso de cuatro fragmentos. |
| `49`, `04`, `09` | Apertura del camino y escena local por capítulo; mostrar espiral desde C5. Montar muerte sin gigante; ni pulso de red completa ni final lunar anticipado. |

**Archivos tocados:** actualizado `docs/entregas_chatgpt/2026-11-02_capitulo4_isla.md`; creado `docs/entregas_chatgpt/2026-11-02_capitulo5_tasogare.md`.

**Decisiones tomadas:** 55 minutos; Musgoso purificado; katana existente; plaza y espiral reutilizadas; extractor local; muerte definitiva dirigida. Identidad, control de Lumi y batalla lunar reservados.

**Preguntas abiertas reales — Pregunta para el usuario:** ninguna. **Pendientes de Claude:** medir duración/dificultad; validar camino, rellano y checkpoints.
