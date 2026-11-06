# Ecos de Luz · Parte 1: guion base de la Luna y Akari

**Fecha:** 24 de octubre de 2026. **Versión:** 2.0, integración autorizada de la llamada del equipo. **Estado:** guion base vigente; el piloto implementa su inicio y los capítulos posteriores siguen pendientes de producción.

**Decisión incorporada:** Luna Roja y exiliados. El usuario autorizó integrarla: la antagonista es una usurpadora, la guardiana original permanece cautiva y la apariencia dorada se sostiene con ofrendas. El origen de una única guardiana que se corrompe queda sustituido. El historial de la beta anterior no se convierte en el argumento de esta campaña.

Este documento fija el guion de trabajo del nuevo ciclo de seis partes. Desarrolla la propuesta narrativa. Continuaciones autorizadas: parte 2: guion del inicio y parte 3: inicio jugable, implementado como campaña separada. Los capítulos posteriores siguen pendientes; la historia anterior permanece accesible. La parte 4 fue autorizada: audio interactivo y muestra española. La parte 5 también fue autorizada e implementada. No iniciar la parte 6 sin autorización.

## 1. Orden de aplicación y decisiones de esta entrega

Estos números son **partes del nuevo ciclo**, no las fases históricas 1–35 de `PLAN_MEJORAS.md`.

| Parte | Trabajo y entrega | Narrativa, voz y música | Estado |
| --- | --- | --- | --- |
| **1. Guion base** | Canon, cronología, personajes, reglas, revelaciones y desenlace | Se define qué se contará y desde qué punto de vista | **Terminada en este documento** |
| **2. Guion del inicio** | Escaleta y diálogos del piloto de 20–30 min; apertura de unos 90–120 s | Se escriben las intervenciones narrativas y su intención; todavía sin producir voz | Terminada en su documento |
| **3. Inicio jugable** | Integrar escenas, cámara, gestos, subtítulos, pausa y control | Preparar duración por intervención y señales de sincronización | Implementada; resultado |
| **4. Audio y narración** | Música inicial anterior recuperada y mezcla del piloto implementada | Muestra española optativa de tres frases de Tsuru; revisar antes de producir más voz | Audio y muestra entregados |
| **5. Movimiento y combate** | Locomoción, animación, perfiles enemigos y práctica sin progreso narrativo | Pasos por contacto y señales de ataque sincronizadas | Implementada |
| **6. Evaluación y expansión** | Revisar el piloto y producir el resto por capítulos | Extender actuación, sonido y música validados; medir la campaña | Pendiente |

La narración pertenece al guion desde la parte 2; su **voz audible** se incorpora en la 4. No se generó voz en esta entrega. La indicación de recuperar la música queda programada para esa misma parte, sin cambiar ahora el audio ni restaurar otros archivos antiguos del juego.

### Origen identificado de la música anterior

**Actualización posterior:** la parte 4 ya recuperó este generador y entregó una muestra española de Tsuru. Los puntos siguientes conservan la identificación y el plan de adaptación de la parte 1.

- Copia localizada y leída sin modificar: `../ecos-de-luz.zip`.
- Archivo interior: `ecos-de-luz/js/01-audio.js`, 23 249 bytes.
- SHA-256 del archivo interior: `B3B6C7CEC9751892EBD001208CCDB1A84554C38983AF5F5A5F2C2FA87572F81B`.
- Es anterior a `PaisajeSonoro`: genera frases de koto, acompañamiento sostenido y entradas de flauta mediante Web Audio. **No es una canción grabada única.** La variación aleatoria impide prometer una secuencia de notas idéntica a una escucha pasada; sí se puede recuperar el generador y sus parámetros.
- La portada actual selecciona `hogar`, asociado a `Childhood`, en el sistema introducido durante la fase 24. En la parte 4 se recuperará el comportamiento anterior para **portada y música de apertura**, con salidas suaves entre ambos estados.
- Se adaptará esa lógica a la API actual. Copiar el módulo antiguo completo podría deshacer controles, mezcla y efectos posteriores; no es necesario para restaurar la música solicitada.
- Las otras músicas y efectos se revisarán dentro de la parte 4, por separado. Esta orden no implica restaurar todo el juego ni cambiar sus ZIP.

## 2. Premisa definitiva de trabajo

La Luna Roja encerró a la Luna Dorada, su hermana y guardiana original, y ocupó su lugar. El Faro del Alba conserva el núcleo cautivo que le permite utilizar su vínculo. La luz infantil robada sostiene una apariencia dorada ante la población; nunca restaura lo que la usurpadora no puede producir por sí misma. Tasogare, padre de Akari y ejecutor del pacto, conoce la sustitución y la oculta. Cuando la usurpadora exige a su hija, rompe el rito para salvarla: el faro se fractura, la apariencia lunar se vuelve roja y Akari sobrevive transformada, sin memoria.

Tres meses después, Hikari despierta en ese mundo. Los avisos oficiales culpan al guardián de haber herido a su protectora; el pueblo ve el rojo, pero desconoce la suplantación. Guiada por Lumi, Hikari reúne los cuatro fragmentos de su propia memoria y del conducto. Conoce exiliados, contrasta registros y descubre que la protección exigida sostenía una mentira. Cuando Tasogare intenta ofrecer a Momo para recuperar a su hija anterior, Hikari lo mata al impedir el sacrificio. Solo después comprende plenamente que ella es Akari.

Lumi entrega el enlace que ha preparado para la usurpadora. Hikari rompe el control posterior sobre su compañera y utiliza el conducto para liberar lo cautivo. Un conejo espiritual, memoria desprendida de la guardiana original durante la fractura, ayuda a reconocer el acceso a su prisión. La Luna Roja reúne su reserva en un **cuerpo físico** y desciende para impedirlo. Hikari/Akari debe vencerla y cortar la red mientras la comunidad evacúa a los niños. Liberar a la Luna Dorada es una consecuencia de ganar, no una intervención divina que sustituya al jugador.

**Tema:** proteger a alguien no da derecho a convertir a otra persona en su precio.

La Roja custodiaba los límites de la noche y resentía la admiración que recibía su hermana. Su función tenía valor; decide usurpar otra en vez de aceptar que no necesita ocupar su lugar. El rojo no es una maldad natural: la antagonista se define por encerrar, suplantar y consumir.

**Arco de Hikari:** obedecer para encontrar respuestas → contrastar lo que le dicen → actuar ante una injusticia → afrontar una verdad dolorosa → decidir con conocimiento propio.

## 3. Canon y reglas que no cambiarán entre capítulos

### Identidad, familia y luz

1. **Tasogare es el padre biológico de Akari.** No fue solamente su maestro. Kaito es el padre de otro niño que murió en una ofrenda anterior; no tiene un segundo parentesco secreto con la protagonista.
2. **Hikari y Akari son la misma persona.** Hikari es su continuidad transformada, no una copia reemplazable ni un espíritu que deba desaparecer para devolver a la «verdadera» niña. Puede conservar Hikari como nombre elegido al recordar.
3. Todas las personas tienen luz. La luz infantil aún abierta permite forzar el vínculo de la guardiana cautiva y reproducir temporalmente la apariencia dorada. El rito no obtiene un alimento estable equivalente de las defensas de un adulto. La doctrina llama «pureza» a esa vulnerabilidad; la bondad no se mide por edad, obediencia ni ausencia de sufrimiento.
4. La luz para planear, combatir y activar mecanismos es energía ambiental utilizable. El núcleo personal que roba una ofrenda contiene vida e identidad. Gastar el medidor no consume víctimas.
5. Las víctimas completamente consumidas murieron. Liberar lo que la Luna retuvo permite despedirlas y devolver energía al mundo; **no las resucita**. Akari sobrevivió porque el rito se interrumpió antes de consumir su núcleo.
6. Los cuatro fragmentos contienen la firma y recuerdos desprendidos del núcleo de Akari, unidos a cuatro sellos del conducto roto. Por eso pueden ayudar a Hikari y, reunidos, habilitar otra vez la red lunar.
7. Hikari puede integrarlos. Otras personas pueden llevarlos en relicarios aislados. El contacto incompatible prolongado provoca desanclaje: pérdida de memoria y forma hasta convertirse en Sombra. Un roce accidental no mata.
8. La muerte de Tasogare no anula los poderes ni la dignidad de Hikari. La Luna llama «impureza» a su culpa para someterla; el juego no trata esa acusación como una ley moral.

### Isla, ofrendas y límites de la Luna

9. Antes de la fractura había día y noche. El faro guiaba viajes y sostenía protecciones locales; no era el único origen del sol ni de toda vida. La antigua frase «el valle nunca conoció la noche» se sustituirá en la parte 2 o se presentará explícitamente como doctrina, sin afirmarla como verdad del mundo.
10. La guardiana original celebraba cada doce años una devolución comunitaria de energía ambiental, sin víctimas. La usurpadora convirtió esa ceremonia en ofrenda infantil. La elección de Momo tres meses después de Akari es una **extracción extraordinaria** que Tasogare prepara para recuperar la forma anterior de su hija, no otro ciclo ordinario.
11. El Velo rodea esta isla, no todo el planeta. La Luna lo mantiene mediante faro, sellos y emisarios: niebla, corrientes y Cazadores. Fuera existe una comunidad fundada por familias fugitivas.
12. La isla refugio tiene amaneceres y dificultades propias. Su vida demuestra que la protección lunar no exige ofrendas. Visitarla forma parte de la ruta principal.
13. La usurpadora observa mediante faroles vinculados, Vigías y transmisiones de Lumi. No lee pensamientos ni ve cada rincón. Los refugios aislados de la red permiten investigar. Los faroles domésticos y el portátil de Tsuru no son automáticamente emisores de vigilancia.
14. La Luna puede castigar, amenazar y extraer a través de un vínculo activo. No puede capturar a cualquier persona a voluntad, sin conducto, preparación ni colaboradores. Por eso necesita a Tasogare, a Lumi y los fragmentos.
15. Al romperse el rito, los sellos dispersos dejan parte del sistema activo: permanecen el Velo y las patrullas, pero se pierde la ruta central de extracción. No se extingue todo el poder lunar de inmediato.
16. Encarnar concentra la reserva y la voluntad de la Luna Roja en materia tangible. Tras destruir su cuerpo y cortar la red, la usurpadora no escapa en otro núcleo para reiniciar el conflicto. La Luna Dorada liberada es otra entidad, no una segunda vida de la jefa. Hay un solo astro natural: la apariencia de la ocupante se proyecta dentro del Velo.

### Responsabilidad y tono

17. Tasogare tuvo oportunidades para proteger a otras familias y eligió perseguirlas. Descubrir el engaño y amar a Akari no cancela esa responsabilidad.
18. Lumi informa voluntariamente antes de ser controlada. La posesión posterior no sirve para atribuir todas sus decisiones a otra persona.
19. Los habitantes tienen grados distintos de conocimiento y participación. No son un bloque inocente ni un pueblo entero malvado.
20. Las muertes y sacrificios se representan sin detalle gráfico. La excepción dirigida de Tasogare no habilita atacar libremente a aldeanos ni animales.

### Usurpación, memoria y refugios

21. La Luna Dorada permanece viva porque su núcleo cautivo es el sello que reconoce el faro. Consumirlo inutilizaría el conducto. La usurpadora puede forzar ese vínculo con ofrendas, pero no gastar libremente la energía de su hermana.
22. La red velaba recuerdos de noches rituales mediante exposición prolongada y un pulso del faro. No elimina haber tenido un hijo ni fabrica una vida completa. El dolor y la ausencia permanecen. Los documentos, grabaciones y pruebas del diario no se reescriben.
23. La fractura corta el pulso general. Persisten recuerdos dañados y efectos locales; una ilusión bajo un emisor puede deformar una silueta y cesa al cubrir su luz. La red completa solo se reactiva con las cuatro claves y el enlace de Lumi. El jugador no pierde objetivos, objetos ni progreso por una amnesia impuesta.
24. Tras la fractura el disco lunar se vuelve rojo. La versión oficial dice que Tasogare hirió a su protectora. La Noche Roja es el asedio que extiende esa presencia al cielo y a los caminos, no la primera ocasión en que alguien ve el rojo. Fuera del Velo no aparece la misma proyección.
25. El refugio interior de la Gruta de las Luciérnagas y la comunidad exterior cumplen funciones diferentes: el primero descubre la persecución de personas; la segunda demuestra que se puede vivir fuera del pacto. No todas las Sombras son personas. Se conserva el rescate de desanclados y la protección de la fauna corriente.
26. El conejo es una memoria de la guardiana que pudo salir por la fisura exterior abierta durante el rito de Akari. No es un quinto fragmento de Hikari ni otra colección. Sus apariciones son limitadas; no es compañero permanente, narrador omnisciente ni solución del combate final.
27. El Vigía de forma de lechuza es una criatura ligada al pacto, con una función de observación y persecución. El búho queda como emblema antiguo; no se añade otro consejero ni otra genealogía. La noche y el color rojo no hacen malvada a toda criatura.
28. **Guardianes del Faro (decisión del 3/11/2026, idea del usuario).** Los cinco gólems fueron personas: cinco trabajadores de la red del faro (Vera, injertadora, Cerezo; León, calafate, Marea; Inés, copista, Arena; Bruno, cantero, Musgoso; Alba, cuidadora de refugios, Escarcha) que cada uno por su cuenta descubrieron una parte del engaño. La Roja los ató desde instalaciones vinculadas, antes de la fractura: cuerpo de coraza regional, alma atada, una voluntad retenida que conserva un gesto de su oficio. Tasogare los conocía y silenció sus denuncias; no se fija que ejecutara las capturas. Al purificarlos y canalizar, la atadura se abre: el espíritu asciende, comparte un hilo de luz con Hikari (un don pequeño) y se dispersa. No resucitan, no son parientes de nadie, ninguno reconoce a Hikari como Akari y sus luces no son fragmentos ni llaves del final. Son distintos de los cuatro fragmentos de Akari. Solo son sólidos cuando luchan. Detalle: [entrega](entregas_chatgpt/2026-11-03_golems_guardianes.md).

## 4. Cronología verdadera: lo que ocurrió aunque el jugador aún no lo sepa

| Momento | Hecho | Causa y consecuencia |
| --- | --- | --- |
| Antes de los personajes actuales | La Luna Roja encierra a la Dorada y ocupa su lugar | Conserva su núcleo como sello del faro; utiliza la luz robada para aparentar su identidad |
| Durante generaciones | El rito comunitario de doce años se convierte en una ofrenda infantil | La doctrina y los recuerdos velados sostienen el engaño; las víctimas no regresan |
| Años antes | Familias se oponen; algunas mueren y otras alcanzan otra isla | Tasogare dirige persecuciones y conoce pruebas del exterior; ayuda a ocultarlas |
| Último ciclo, antes de la elección | Tasogare, ya conocedor de la sustitución y los exilios, confirma que parte de las amenazas responde a la usurpadora y que conserva a las víctimas | La protección también es extorsión. Intenta romper o renegociar el pacto sin reconocer públicamente su complicidad |
| Hace tres meses | La Luna exige a Akari y amenaza con retirar las protecciones | Castiga la desobediencia de Tasogare y demuestra que él tampoco puede reclamar una excepción |
| Noche de la fractura | Tasogare rompe el conducto durante la extracción | Akari sobrevive; se dispersan sus cuatro fragmentos. La apariencia roja queda visible y una memoria del núcleo cautivo sale como conejo. La guardiana original sigue encerrada |
| Tres meses de búsqueda | Tasogare intenta recomponer el rito para recuperar a la niña anterior | Considera a Hikari un residuo utilizable; no acepta que Akari pueda vivir de otra forma |
| Comienzo jugable | Hikari despierta y Lumi se ofrece a guiarla | La Luna necesita que alguien compatible reúna los fragmentos; promete independencia a Lumi |
| Primeras regiones | Hikari encuentra a la madre exiliada de Nao, ve al conejo y contrasta los signos del pacto en Duna | Reúne tres fragmentos y confirma la usurpación. Lumi aprende esa verdad con ella, pero decide continuar informando |
| Noche Roja y travesía | La Luna intensifica la persecución; Tsuru muere al proteger la salida de Momo; Kaito conduce a los fugitivos fuera del Velo | El farol de Tsuru conserva testimonios grabados antes de su muerte; el refugio contradice el relato oficial |
| Regreso | Tasogare captura a Momo con una promesa de protección y prepara un rito extraordinario | Pretende usar su núcleo para restaurar la forma anterior de Akari; Momo deja una señal que permite localizarla |
| Duelo del padre | Hikari libera a Momo y detiene letalmente a Tasogare cuando intenta completar la extracción | La amenaza es real e inmediata; el combate no exige ejecutar a un enemigo rendido |
| Cuarto fragmento | Hikari integra la memoria completa en Kiri | Reconoce como propios los recuerdos de Akari y comprende a quién mató |
| Traición | Lumi transmite la firma de las cuatro claves y alinea el conducto | Hikari conserva los fragmentos; la Luna obtiene acceso a la red, toma el cuerpo de Lumi e intenta sujetar a Hikari |
| Ruptura del vínculo | Hikari combate la forma controlada de Lumi y rompe tres enlaces visibles | Lumi recupera agencia y elige ayudar a corregir lo que hizo, pagando un coste real |
| Asalto final | La comunidad evacúa; Hikari invierte el conducto para liberar la reserva | La Luna ya no puede conservar su poder esperando otro sacrificio: encarna para detenerla |
| Desenlace | Hikari/Akari derrota físicamente a la Luna Roja y corta el núcleo de extracción | Libera a la Dorada y la reserva. Los vivos regresan; los muertos no resucitan y la comunidad responde por su complicidad |

La muerte de Tsuru es una pérdida concreta, no una justificación para aumentar una cifra de víctimas. Sus grabaciones solo contienen lo que conoció en vida. El juego no le atribuye comentarios posteriores sobre la identidad completa de Hikari o el combate lunar.

## 5. Personajes: objetivo, información y decisión decisiva

| Personaje | Objetivo y conocimiento al inicio | Cambio o decisión decisiva |
| --- | --- | --- |
| **Hikari/Akari** | Encontrar su origen; confunde recuerdos propios con ecos de otras víctimas | Protege a Momo, afronta la muerte del padre y decide liberar la luz en vez de pagar otra ofrenda |
| **Luna Roja** | Mantener la identidad y autoridad usurpadas; conoce el origen de Hikari | Utiliza su culpa, restaura el enlace e intenta vencerla en cuerpo físico |
| **Luna Dorada** | Sobrevivir cautiva y recuperar la capacidad de devolver luz | Su liberación depende de la victoria de Hikari. No rescata al jugador ni resucita a los fallecidos |
| **Tasogare** | Recuperar a la Akari anterior; sabe que Hikari procede de ella, pero niega que siga siendo una persona completa | Está dispuesto a sacrificar a Momo y gastar a Hikari para lograrlo; muere al intentar consumar ese acto |
| **Lumi** | Reunir las claves por una luz independiente; sabe que espía, aunque inicialmente cree que su patrona protege el valle | Aprende la usurpación en Duna y sigue informando. Tras la entrega y el control de su forma debe reparar decisiones conscientes |
| **Tsuru** | Proteger a Momo; conoce las ofrendas, a Akari y parte de las mentiras del pueblo | Deja de callar, entrega pruebas y protege la huida; su farol conserva su testimonio |
| **Momo** | Seguir junto a Tsuru y entender por qué algunos niños no vuelven | Participa en la evacuación y deja señales durante su captura; su rescate no depende de que espere pasivamente |
| **Kaito** | Sacar familias de la isla; perdió a otro hijo en una ofrenda | Revela la ruta del exilio y guía la travesía; no confirma una paternidad que ya no le corresponde |
| **Yuki** | Proteger Hinode sin conocer toda la maquinaria | Rompe con la obediencia al guardián y organiza defensa y evacuación |
| **Taiyō** | Conservar el orden que ayudó a justificar; conoce los registros | Entrega nombres, llaves y pruebas; reconoce su responsabilidad sin ofrecer a otro niño ni sustituirlo en un nuevo rito |
| **Madre de Nao** | Mantener suministros y refugios para familias expulsadas | Vincula el registro inicial con una persona, aporta pruebas y permite comprender la deshumanización de los exiliados |
| **Conejo blanco** | Preservar una memoria de la guardiana original y reconocer sus accesos | Aliado puntual en la gruta y el final; no ocupa el lugar de Lumi ni revela la identidad familiar de Hikari |
| **Vigía lunar** | Observar, avisar e interceptar al servicio del pacto | Amenaza legible que puede evitarse o liberarse de su vínculo; no convierte a todas las aves en enemigas |

**Lumi y el refugio:** sus protecciones impiden transmitir. Allí Lumi se distancia o busca el borde del aislamiento antes de retomar el enlace. La Luna no conoce automáticamente las conversaciones protegidas. La navegación y los objetivos esenciales siguen disponibles en el diario aunque Lumi no acompañe a Hikari.

## 6. Información que recibe el jugador y orden de revelaciones

| Tramo | Información obligatoria | Lo que aún puede permanecer abierto | Prueba y acción siguiente |
| --- | --- | --- | --- |
| Inicio | Hubo una ceremonia interrumpida; Hikari no recuerda; existen víctimas y un faro roto | Su identidad y el propósito de Lumi | Conversación con Tsuru, nombre de un desaparecido y objetivo del primer templo |
| Pétalo | Las ofrendas no devuelven a los niños; el primer fragmento reactiva una región | Cómo funciona el conducto completo | Registro verificable y recuerdo parcial; investigar otra región |
| Marea y Duna | Una supuesta bestia era una exiliada; los signos y archivos prueban la sustitución lunar. Tasogare conocía el pacto y Akari era su hija | Que Hikari sea Akari; ubicación y estado completo de la guardiana cautiva | Madre de Nao, conejo, registros y comparación de signos; preparar una salida |
| Refugio | Hay vida fuera del Velo y supervivientes de la persecución | Qué ganará Lumi al reunir las claves | Llegar, convivir y ayudar; decidir regresar por quienes quedaron |
| Duelo de Tasogare | Pretende ofrecer a Momo para recuperar a Akari; niega la persona actual de Hikari | La confirmación autobiográfica completa | Rescatar a Momo y detener el rito; buscar la memoria que falta |
| Kiri | Hikari es Akari; las cuatro memorias pertenecen a su propia vida | Cómo liberar la red sin alimentar de nuevo a la Luna | Integración del cuarto fragmento y registro independiente |
| Lumi | Su guía también fue vigilancia; la conexión se ha completado | El desenlace de su reparación | Transmisión visible, admisión y combate de los tres enlaces |
| Final | La usurpadora concentra la reserva en su cuerpo; la guardiana original está cautiva bajo la corona | El resultado del combate depende de jugarlo | Evacuar, romper anclajes, vencer a la Roja y liberar a la Dorada y la luz |

El jugador puede sospechar la identidad de Hikari antes que ella. No se fuerza una sorpresa ocultando información que todos deberían responder. Su aspecto transformado y su máscara permiten dudas razonables; quienes conocieron a Akari pueden señalar parecidos y admitir incertidumbre. El cuarto fragmento aporta continuidad de memoria, no simplemente otro nombre.

**Pistas obligatorias de Lumi:** una ruta privada termina interceptada; repite una fórmula del faro que todavía no había oído en pantalla; su señal cambia ante las protecciones del refugio. Cada pista admite una explicación inicial, pero adquiere sentido completo al verla transmitir.

## 7. Clímax de Tasogare y consecuencias

El encuentro sucede hacia la quinta hora, después de comprobar que hay alternativas a la doctrina. Sus objetivos son salvar a Momo y desactivar el rito. Tasogare combate con su katana rota y utiliza los mecanismos del santuario; no se transforma después en el jefe lunar.

Tasogare conserva un dispositivo de extracción local del faro: puede arrancar el núcleo de Momo sin haber reparado todavía la red completa. Cree que esa energía devolverá la forma anterior de Akari, pero confunde energía con identidad. Su método puede matar a Momo; no puede resucitar a otra persona ni fabricar una Akari anterior. La amenaza no depende de que su promesa sea verdadera. Esta diferencia se anticipa mediante registros de intentos fallidos de restauración.

Hikari intenta detener el proceso. Tasogare rechaza abandonar la extracción y reactiva el conducto con Momo aún dentro. El golpe que lo mata interrumpe esa acción. Su muerte es definitiva y dirigida por el relato; no se presenta una opción de perdón que el juego vaya a ignorar.

Después se atiende a Momo y se deja espacio para la reacción. La revelación de Kiri ocurre más tarde. No hay fanfarria de victoria ni una explicación que absuelva al padre. Tampoco se obliga a Hikari a concluir que merecía haber dejado morir a otra niña.

## 8. Lumi y la manipulación de la Luna

Lumi deseaba una luz propia que no dependiera de obedecer. La Luna prometió dársela cuando el conducto estuviera completo. Lumi no conocía todos los efectos de encarnar, pero sí sabía que ocultaba vigilancia y que guiaba las claves hacia su dueña.

Inicialmente cree que su patrona protege el valle. Al comprobar la usurpación en Duna junto a Hikari, tiene información suficiente para elegir. Continúa transmitiendo porque se aferra a la independencia prometida y a poder negociar después. Esa decisión prepara su responsabilidad en la entrega final. Un Vigía no puede haber observado la ruta privada que sirve de prueba contra ella: se elige en una zona aislada.

Al transmitir, la Luna reclama también su cuerpo. Hikari rompe tres enlaces identificables durante un enfrentamiento y le devuelve la capacidad de actuar. Romperlos no perdona automáticamente la traición.

En el final, Lumi elige abrir una salida para la luz cautiva, aunque eso destruye su acceso a la red y reduce su forma a una pequeña luciérnaga. Sobrevive; pierde facultades y debe reconstruir la confianza. Se conserva el nombre **Lumi**. «Hotaru» queda fuera de los nombres canónicos para no duplicar compañeros.

## 9. La Luna física y el combate final obligatorio

**Hikari/Akari lucha directamente contra la Luna Roja.** La confrontación no se resuelve únicamente con diálogo, canalización o un acertijo. La encarnación es la presencia real de la usurpadora concentrada en materia, con cuerpo, alcance, colisiones y vulnerabilidad. No es una ilusión ni una transformación de Tasogare.

### Aparición y forma

La reunión de los cuatro sellos vuelve a unir el conducto. Cuando Hikari lo invierte para liberar la reserva, la Luna concentra esa luz en su cuerpo para impedir perderla. La aparición nace de una regla anunciada en murales y registros, y del mismo proceso que el jugador acaba de activar.

En Duna, un esquema muestra a la guardiana con pies sobre la plataforma y cuatro conexiones al faro; en Kiri, un registro explica que encarnar concentra su reserva y la vuelve vulnerable. Antes del ascenso, Hikari y sus aliados relacionan ambas pruebas. La forma exacta puede sorprender, pero su posibilidad y la manera de combatirla ya tienen preparación.

Su diseño de trabajo es una figura de unos **cinco metros**, erguida, con máscara nacarada y dorada robada, grietas rojas y un disco incompleto tras la cabeza. Al romperse la apariencia se muestra el cuerpo de la usurpadora. Los mantos forman medias lunas duras y las manos golpean y cierran rutas. El rojo del fondo no debe ocultar la anticipación de sus ataques ni las rutas seguras. La hoja de modelo y sus pruebas se producirán en la parte 6.

La escala permite un duelo en una plataforma amplia, con cuerpo y avisos visibles desde la cámara de juego. No se decide aún un presupuesto de polígonos, daño ni velocidad: se fijarán al prototipar y medir el encuentro.

### Progresión del encuentro

| Etapa | Acción de la Luna | Acción necesaria del jugador | Función narrativa |
| --- | --- | --- | --- |
| **1. El descenso** | Ya encarnada, protege cuatro anclajes del faro con barridos, impactos y zonas de extracción anunciadas | Combatir mientras abre y corta los cuatro anclajes; combinar movimiento, haz y golpes | Desmontar su protección y detener el acceso a los niños que están evacuando |
| **2. El cuerpo que exige** | Pierde la barrera y pelea directamente: manos, arcos de luz retenida y golpes con recuperación visible | Atacar y reducir su resistencia corporal con las armas de Hikari; esquivar, bloquear o interrumpir según el aviso | La autoridad que parecía intocable se enfrenta a alguien que ya no obedece |
| **3. Lo que queda bajo el brillo** | Su máscara se rompe; intenta cerrar la salida y consumir la reserva que aún conserva | Vencer sus últimos ataques, abrir el núcleo con el combate y canalizar después para liberar la luz | El golpe y la liberación completan el final; no se compra otra restauración con una víctima |

La canalización final llega **después de ganar el enfrentamiento**, sin reemplazarlo. Cada reintento mantiene un estado narrativo coherente; una derrota de juego no inventa nuevas muertes de niños para castigar al jugador.

### Límites del desenlace

- La forma física usa la reserva ya retenida. La amenaza de extraer a los niños vivos se detiene al cortar los anclajes y mediante la evacuación comunitaria; derrotarla no exige permitir un sacrificio nuevo.
- Hikari conserva lo aprendido y sus herramientas. La Luna intenta culparla por la muerte de Tasogare; no hay una pérdida arbitraria de controles o poderes como castigo moral.
- La destrucción del cuerpo y la ruptura del núcleo terminan la capacidad de gobernar y alimentarse de la Luna. No escapa otro núcleo para invalidar la victoria.
- Tasogare no revive, no combate a su lado ni entrega en el último segundo una solución que borre lo que hizo.
- Lumi y la comunidad colaboran en la salida y la evacuación. El enfrentamiento contra la Luna lo juega Hikari/Akari.

## 10. Final y epílogo

La reserva liberada abre el Velo y devuelve luz al entorno. Los niños rescatados regresan con quienes los cuidan. Los fallecidos reciben nombre, memoria y despedida. Tsuru permanece en los registros de su farol; Hikari no conversa con ella como si hubiera sobrevivido.

La Luna Dorada sobrevive porque estaba cautiva, no consumida. Recupera su libertad después de ganar el combate contra su hermana; no interviene para ganarlo. Su retorno no impone otro culto ni una deuda de vidas. La comunidad conserva la decisión de salir, mantener el faro y elegir cómo comparte su energía.

Hikari recuerda que fue Akari y puede seguir llamándose Hikari. No debe borrar su vida nueva para recuperar la anterior. Conserva dolor por su padre y la certeza de que Momo tenía derecho a vivir.

Taiyō entrega los registros completos y deja de controlar el rito. Yuki organiza una protección que no dependa del secreto. Kaito establece una ruta abierta al refugio. Se muestra trabajo y desacuerdo: el amanecer no vuelve inocentes a todos.

El faro queda como señal de navegación y memoria, alimentada por energía ambiental y mantenimiento voluntario; nunca por núcleos personales. La luz artificial no sustituye el sol. El último tramo es jugable y permite ver estas consecuencias antes de cerrar.

El desenlace no incluye la antigua ofrenda de Hikari, renacer por devolución comunitaria ni una grieta roja que anuncie inmediatamente el mismo tirano. Si más adelante se desea otra historia, tendrá que respetar esta victoria.

## 11. Estructura de campaña que sostendrá el guion

| Capítulo | Duración objetivo | Suceso que hace avanzar el conflicto |
| --- | ---: | --- |
| 0. La noche que rompió el faro | 30 min | Fractura, despertar y aprendizaje; se plantea el objetivo inmediato |
| 1. El pueblo que llama honor a la pérdida | 55 min | Tsuru, Momo, investigación y fragmento del Pétalo |
| 2. La orilla de los que faltan | 55 min | Kaito, madre exiliada de Nao, gruta, conejo y fragmento de la Marea; la escena de 8–12 min se integra dentro de investigación y rescate |
| 3. Los nombres bajo la arena | 55 min | Archivo de Duna, prueba de la sustitución, complicidad del guardián y fragmento de la Arena |
| 4. Fuera del Velo | 65 min | Noche Roja, pérdida de Tsuru, travesía y refugio |
| 5. Lo que un padre llama salvar | 55 min | Captura y rescate de Momo; muerte de Tasogare |
| 6. La memoria que no devuelve a nadie | 55 min | Cuarto fragmento en Kiri, identidad completa y traición de Lumi |
| 7. La luz que ya no se entrega | 65 min | Evacuación, encarnación de la Roja, combate, liberación de la Dorada y epílogo |
| **Total** | **435 min / 7 h 15 min** | Meta de primeras partidas a ritmo normal, pendiente de producir y medir |

Marea y Duna pueden intercambiarse; los hitos restantes conservan su orden. Los espacios abiertos admiten exploración, pero la ruta principal no revela la identidad completa antes del duelo. La duración exige templos, investigación, rescates y navegación con decisiones; no se obtiene añadiendo esperas obligatorias.

La gruta incorpora a la madre de Nao dentro del contenido previsto; no añade otra travesía ni otra colección. Cubrir el emisor lunar elimina una ilusión localizada y permite reconocer a la persona. Esa acción recupera lo aprendido con el postigo de Momo, sin usar antes de tiempo el farol portátil de Tsuru. La liberación de la guardiana original ocurre en el final previsto, bajo la corona del faro.

## 12. Aplicación posterior sin mezclar versiones

| Elemento actual | Resolución en el nuevo guion | Momento de implementación |
| --- | --- | --- |
| Kaito reconoce a su hija | Habla de su propio hijo perdido y de la ruta del exilio | Partes 2–3 para el piloto; parte 6 para capítulos posteriores |
| Prólogo afirma el origen de Hikari | Presenta el rito y la fractura sin confirmar su identidad | Partes 2–3 |
| Tasogare gigante como jefe final | Tasogare muere en el rescate; su sistema puede servir de base técnica a otro jefe con arte y comportamiento propios | Parte 6 |
| Ofrenda final y renacer | Combate físico lunar, liberación y epílogo sin nuevas víctimas | Parte 6 |
| Música de portada posterior al cambio | Recuperar el generador anterior identificado en la sección 1 | Parte 4 |
| Voz narrativa | Tsuru y sus testimonios limitados a lo que sabía; voces puntuales de Lumi y la Luna si se eligen | Escritura en parte 2; producción e integración en parte 4; expansión en parte 6 |
| Guardados de la historia anterior | Campaña versionada y espacios separados; preservar partidas anteriores | Antes de habilitar progreso de la nueva campaña |

Los pilares de exploración totalmente libre, máximo de cinco escenas y desenlace de ofrenda pertenecen a la versión anterior. Este ciclo define una ruta semilineal, más conversaciones breves cuando sean necesarias y el nuevo final lunar. Se conservan el cuidado de la vida, la exploración, la luz como recurso y la protección de aldeanos y animales; la muerte dirigida de Tasogare es una excepción argumental explícita.

## 13. Comprobación editorial y cierre de la parte 1

- [x] Un solo padre de Akari y una sola continuidad Hikari/Akari.
- [x] Motivos y responsabilidad de Tasogare establecidos antes del duelo.
- [x] Distinción entre regla mágica de la luz y propaganda sobre pureza.
- [x] Ciclo ordinario y ofrenda extraordinaria diferenciados.
- [x] Límites de percepción y acción de la Luna; refugio compatible con ellos.
- [x] Cuatro fragmentos con efecto útil y riesgo causal; Hikari conserva sus núcleos.
- [x] Orden de revelaciones que permite sospechas sin ocultar información obvia.
- [x] Muerte del padre anterior a la memoria completa y consecuencias permanentes.
- [x] Espionaje voluntario de Lumi separado del control posterior de su cuerpo.
- [x] **Encarnación física de la Luna y lucha final directa de Hikari/Akari.**
- [x] Final sin resurrecciones que cancelen pérdidas ni otra ofrenda para ganar.
- [x] Narración audible y recuperación de música inicial asignadas a la parte 4.
- [x] Campaña objetivo suma 435 min; su duración real sigue sin estar validada.

**Entrega editorial cerrada:** guion base, reglas, cronología, personajes, revelaciones y desenlace. Los diálogos se desarrollaron en la parte 2 y el inicio se implementó después, con autorización, en la parte 3. Esta primera entrega no modificó el ejecutable. La parte 4 sigue pendiente de autorización y el ZIP continúa intacto.
