# Fase 7 · Variantes de Sombra

Entrega de código acotado. Fecha de ejecución: 4 de noviembre de 2026. Se conserva el nombre solicitado.

Las seis variantes están implementadas. Usan las puertas comunes de Sombras y el director existente. La integración elemental queda pendiente de Claude: el 70 actual descarta los metadatos de escuela. También necesita reenviar la consulta vertical para alcanzar a la alada durante el vuelo. Más abajo figura el texto exacto.

## Archivos y arquitectura

| Archivo | Cambio |
|---|---|
| `js/35-sombras.js` | Enlaces de extensión en `Sombras.variantes`. Defensa antes del daño. Consulta de altura opcional en `enRango`. Límite vertical en golpes directos y pulso contra la alada. Coste por ficha. Agenda del picado. Sustituciones por capítulo. Guardias por tipo. Precompilación de todas las geometrías y ambos materiales. Separación y resolución de atasco también para las IA nuevas. |
| `js/75-variantes-sombra.js` | Nuevo catálogo: seis fichas, arte, defensas, absorción de la devoradora, vuelo y picado. Añade el reparto regional a `ZONAS_SOMBRA`, `Sombras.zonas`, `GUARDIAS_ONI` y `Sombras.guardias`. |
| `index.html` | Una referencia a 75, inmediatamente después de 35. |
| `herramientas/probar-director.mjs` | Carga 75 y exporta su mundo de prueba. Permite seleccionar dificultad y calidad. Conserva las 48 regresiones. |
| `herramientas/probar-variantes.mjs` | Nuevo. Pruebas de fichas, defensas, permisos, secuencias, alturas, reparto y progresión. Importa las regresiones del director. |
| Esta entrega | Números, lectura del fallo, contrato e integración pendiente. |

No se modifican 69 ni 57. El director ya entiende costes de 1 y 2. La progresión copia fichas de forma recursiva y escala sus números sin necesitar casos por variante. La prueba usa también el 57 real.

La fijación funciona con `Sombras.lista`. `Combate.posObj` ya apunta a `s.y + s.E.alto * .6`. No requiere cambios en 21. Siguen funcionando `golpear`, `enRango`, `pulso`, `desviar`, `romper`, `quitar`, la custodia y las marcas persistentes de guardias. El pulso se identifica como luz desde 35.

## Fichas y números

Valores base antes de progresión y dificultad. A/Ac/R significa aviso, activo y recuperación, en segundos. El alcance usa la convención actual del archivo: el contacto suma el radio que corresponda.

| Tipo | Ánimo / daño / motas | Velocidad | Radio / alto | A / Ac / R | Espera | Ataque y alcance | Coste |
|---|---|---|---|---|---|---|---|
| `espejo` | 34 / 10 / 5 | 2,6 m/s | 0,55 / 1,5 m | 0,80 / 0,16 / 1,00 | 1,4–2,4 s | Golpe frontal. Alcance 2 m. Arco 1,6 rad. | 1 |
| `devoradora` | 36 / 10 / 5 | 2,7 m/s | 0,55 / 1,6 m | 0,90 / 0,20 / 1,40 | 1,5–2,7 s | Cierra el pecho y descarga alrededor. Radio nominal 2,6 m. Parable. | 1 |
| `escoria` | 40 / 12 / 6 | 1,9 m/s | 0,65 / 1,6 m | 0,90 / 0,22 / 1,20 | 1,7–2,8 s | Golpe de hombro. Alcance 2,3 m. Arco 1,8 rad. | 2 |
| `alada` | 28 / 11 / 6 | 4 m/s | 0,60 / 1,1 m | 0,90 / últimos 0,22 del picado / 1,40 | 1,4–2,2 s | Picado de 0,80 s. Velocidad horizontal máxima 7 m/s. Contacto de 1,6 m y arco 1,8 rad. | 2 |
| `lanzadoraEscarcha` | 24 / 8 / 5 | 2,2 m/s | 0,45 / 1,6 m | 0,80 / emisión / 1,05 | 2,0–3,2 s | Esquirla a 11 m/s. Radio 0,20 m. Vida 2 s. Devuelta: 26 D. | 1 |
| `oniAnclado` | 240 / 18 o 14 / 25 | 2,4 m/s | 0,95 / 2,7 m | Ver secuencia | 1,4–2,6 s | Mazazo frontal de 3,2 m y arco 1,5 rad. Barrido de radio 3,3 m. | 2 |

El espejo orbita a 1,9–2,6 m. Protege 130 grados. Gira como máximo 90 grados por segundo. Baja la placa al golpear y durante su recuperación. No lleva el farol que bloquea completamente los golpes del escudo original.

La devoradora orbita a 2,4–3,2 m. Su absorción prepara una descarga. No roba vida, no se cura y no refleja el daño recibido. Las costillas se separan durante la abertura. Se adapta el prototipo del informe a un enemigo común de coste 1. No añade otro élite obligatorio.

La escoria orbita a 2–2,6 m. Su giro está limitado a 80 grados por segundo. Su ataque deja el cuerpo expuesto. Se adapta el prototipo de cubierta a una Sombra común pesada de coste 2, sin la armadura adicional del oni.

La lanzadora de escarcha busca 7–11 m. Dispara hasta 14 m y exige más de 4 m si puede moverse. Retrocede solo 1 m cada 3,4 s. Usa el mismo ciclo de esquirlas, devolución y cancelación que la lanzadora actual. Sus esquirlas infligen daño normal; no se inventa un estado de congelación del jugador.

El oni anclado deriva de `oniAvanzado`. Conserva 90 de equilibrio, armadura de 0,25, presión base 8, pesos `[0, .6, 1, 1.6]`, parada de 35 % del máximo, pulso de 12, recuperación de 10 por segundo tras 3 s y rotura de 3 s. Guarda a 18 m y vuelve a 30 m. Roto recibe el daño completo.

Su mazazo tiene A/Ac de 0,85/0,18 s. El barrido tiene 0,70/0,22 s y daño 14; exige salto o esquiva. Después del primer golpe espera 0,35 s. El segundo tiene aviso de 0,40 s y el activo de la rama elegida. Recupera 1,30 s tras terminar ambos. La primera petición reserva ambos avisos e impactos. Una parada o interrupción cancela el segundo. El barrido conserva la exclusión de acompañantes.

## Defensas y propiedades de `op`

| Variante | Qué lee | Daño recibido con defensa | Abertura |
|---|---|---|---|
| Espejo | `elemento === 'luz'`, dirección del contacto y estado. Una flecha de luz también se atenúa. | 70 % en el frente durante acecho y aviso. | Flanco, golpe, recuperación o aturdimiento: 100 %. |
| Devoradora | `elemento === 'oscuridad'`. | 70 % con el pecho cerrado. | Recuperación, daño que la hace retroceder o parada: 100 %. |
| Escoria | `elemento === 'brasa'`, `perfora`, `arco`. | 72 %. Perforación sin flecha: 80 %. | Recuperación o aturdimiento: 100 %. |
| Alada | `elemento === 'brasa'`. `vertical` y `origenY` para admitir golpes directos a su altura. | 72 % mientras mantiene su postura aérea. | Aterrizaje y aturdimiento: 100 %. |
| Lanzadora de escarcha | `elemento === 'escarcha'`, `perfora`, `arco`. | 70 %. Perforación sin flecha: 80 %. | Recuperación o aturdimiento: 100 %. |
| Oni anclado | `elemento === 'viento'`, `empuje`; también conserva `peso`, `contra` y `pulso`. | 70 % del daño que pasa la armadura. Presión de equilibrio al 70 %. | Recuperación o tambaleo: sin reducción elemental adicional. Roto: daño entero y sin armadura. |

El ajuste crea una copia de `op`; no modifica el objeto del ataque. `equilibrioSombra` es un dato interno entre la defensa y `golpearOni`; Claude no necesita producirlo. En el anclado, el ajuste de `empuje` conserva el 25 % del valor. El oni actual no aplica desplazamiento por golpes; su anclaje físico hereda ese comportamiento. No se promete un desplazamiento nuevo.

No hay inmunidades elementales. No se implementa inmunidad al nudo ni a la ralentización. Los estados de control de 74 necesitan un contrato propio si Claude decide conectarlos. Las diferencias con los porcentajes iniciales del informe son deliberadas: 70–72 % de daño recibido permite una resistencia moderada y aberturas útiles.

Con exposición protegida continua, 70 % equivale a +42,9 % de tiempo; 72 %, a +38,9 %; 80 %, a +25 %. Son relaciones matemáticas, no duraciones medidas de encuentros. Como aproximación, los ciclos medios con recuperación abierta dan aumentos del orden de +25–30 % bajo presión continua, sin contar esquivas, paradas, proyectiles ni redondeo de golpes. **Queda pendiente demostrar el intervalo +25–60 % jugando.** No se aumentó el ánimo en función del estilo equipado.

## Altura y vuelo

La raíz real de la alada está a 3,1 m sobre su suelo. Su cuerpo mide 1,1 m. Esa raíz se utiliza tanto para dibujar como para el volumen vertical de Impacto. Asciende a 4 m/s. Desciende hasta 0,25 m al finalizar el picado y permanece en recuperación durante 1,40 s.

El picado solo se solicita si Hikari está a menos de `SOMBRAS_CFG.altoAtaque` respecto al suelo de salida. El contacto también comprueba la diferencia de altura real. El activo comienza en los últimos 0,22 s del descenso. Solo puede dañar una vez. La parada funciona durante ese contacto.

Si no obtiene permiso, inicia una bajada sin ataque antes de cumplir cinco segundos en el aire. La bajada dura como máximo 0,30 s. No inicia un aviso tardío que rebase el ciclo previsto. No se teletransporta sobre Hikari.

`Sombras.enRango` acepta un sexto argumento opcional: `{ y, vertical }`. Una consulta cercana normal excluye a la alada fuera de los 2,4 m. Una consulta vertical devuelve candidatos para que **Impacto** compruebe después el volumen exacto. Un proyectil bajo o demasiado alto falla. Sin el cambio del 70 indicado abajo, las flechas no alcanzan a la alada en vuelo; sí durante su aterrizaje.

## Ojos, color y lectura del fallo

Se reutilizan `Sombras.material()` y `materialMate()`. No se añaden shaders, texturas ni luces. Las geometrías se guardan en caché. `muestras()` incluye cuerpos, rombo, alas, costillas, farol y maza con ambos materiales. El dibujo es el mismo en alta, media y baja.

| Tipo | Ojos: alto / adelanto | Cuerpo / detalle / ojos | Señal |
|---|---|---|---|
| Espejo | 1,30 / 0,24 m | `121220` / `a5a9bd` / `ffe3af` | Rombo claro frontal. Material común al defender y mate al abrirse. Se separa al recuperar. Contacto en dos grupos de tres puntos. Aviso `cristal` grave (`k: -2`); contacto `tick` corto. |
| Devoradora | 1,30 / 0,25 m | `140e20` / `634278` / `d5a5f2` | Costillas cerradas durante absorción. Abiertas al recuperar. Aviso `acecho`; contacto `gruñido` grave. |
| Escoria | 1,36 / 0,26 m | `201710` / `80583b` / `ffb05c` | Hombros anchos con placas. Inclina el cuerpo antes del golpe. Aviso `avisoAtaque`; contacto `bloqueo`. |
| Alada | 0,80 / 0,24 m | `1b1014` / `c07850` / `ffcf9c` | Dos alas. Inclina el cuerpo durante el picado. Las recoge al recuperar. Aviso `sombraLanza`; contacto `sombraBrota`. |
| Lanzadora de escarcha | 1,40 / 0,18 m | `0e1722` / `62969e` / `c0f5ff` | Placas alargadas. Mano y esquirla azul claro (`a4e4ef`). Aviso `cristal`; contacto `tick`. |
| Oni anclado | 2,28 / 0,42 m | `121a17` / `6e8777` / `b6dfc5` | Bases anchas en los pies. Conserva la maza y las marcas de suelo. Aviso `avisoAtaque` en ambos golpes; contacto `bloqueo`. Nombre propio en la barra. |

Los sonidos son efectos ya existentes. No se solicita editar audio. La señal de resistencia se limita a una emisión cada 0,22 s por Sombra. El número flotante muestra el daño reducido real. El espejo no provoca daño automático a Hikari. La rotura conserva la dispersión de luz y las motas actuales.

Estos textos ya están en las fichas. Aparecen la primera vez que una resistencia reduce un golpe. El oni también avisa al entrar en combate como guardián.

| ID de entrega | Personaje | Texto | Cuándo | Gesto o intención |
|---|---|---|---|---|
| F7E01 | Aviso | El rombo protege el frente. Rodea a la Sombra o golpea cuando se abra. | Primer contacto atenuado del espejo. | La placa deja puntos de luz. Enseña el flanco. |
| F7D01 | Aviso | La devoradora cierra sus costillas. Su cuerpo se abre después de la descarga. | Primer contacto de oscuridad atenuado. | Señala el pecho y su recuperación. |
| F7S01 | Aviso | La escoria atenúa la brasa. Castiga la abertura después de su golpe. | Primer contacto de brasa atenuado. | Enseña a esperar el golpe pesado. |
| F7A01 | Aviso | La alada baja antes de atacar. Tras el picado queda al alcance. | Primer contacto de brasa atenuado. | Relaciona descenso y abertura. |
| F7L01 | Aviso | Las placas atenúan la escarcha. Devuelve su esquirla o ataca al bajar el brazo. | Primer contacto de escarcha atenuado. | Ofrece dos soluciones con el estilo actual. |
| F7O01 | Aviso | El oni anclado golpea dos veces. Espera el segundo golpe o para la maza. | Entrada del guardián o primer contacto de viento atenuado. | Evita atacar tras el primer impacto. |

Los ID sirven para esta entrega. No se añade una tabla GUION fuera del alcance autorizado. No se nombran teclas.

## Reparto por región y capítulo

Se conservan las coordenadas comprobadas del proyecto. Las variantes **sustituyen puestos**, no añaden cuerpos al grupo. La selección ocurre al brotar y permanece durante el encuentro. El cielo rojo conserva una rastrera extra. La Pradera y la emboscada de la katana siguen usando solo rastreras.

| Zona | Capítulo mínimo | Grupo tras habilitarse |
|---|---|---|
| Pradera `(40, -90)` y `(-21, 94)` | Sin cambio | Tres y cuatro rastreras. |
| Sakura `(-278, -150)` | 1 | Dos rastreras y espejo. Sustituye al escudo de ese grupo. |
| Sakura `(-175, -219)` | 5 | Rastrera, devoradora, rastrera y escudo. Antes: grupo original. |
| Lagos `(-183, 187)` | 2 | Rastrera, espejo y lanzadora. |
| Dunas `(209, 99)` | 3 | Dos rastreras, escoria y alada. |
| Kiri `(289, -132)` | 6 | Escudo, devoradora, lanzadora de escarcha y rastrera. |

Pétalo y Duna conservan el oni original. Marea usa `oniAnclado` desde el capítulo 2. Escarcha usa `oniAnclado` desde el 6. Antes de esos capítulos usan el oni original. Se conservan los mismos ID, fragmentos, marcas de victoria, custodia, requisito de práctica y posiciones. No se cambian los asedios ni las invocaciones de Tasogare.

## Para Claude · texto exacto de integración

### 70 · Reenviar metadatos y origen vertical

En el bucle de Sombras de `sector`, sustituir la consulta por:

```js
for (const s of Sombras.enRango(o.x, o.z, o.yaw, alc, ang, { y: o.y, vertical: vert })) {
```

Conservar la prueba `dentroAlto` existente. Sustituir solo el objeto final de opciones de `Sombras.golpear` por:

```js
{ ...op, vertical: vert, origenY: o.y, peso, empuje,
  romper: op.romperSombra !== undefined ? op.romperSombra : op.romper,
  contra: op.contra }
```

Esto conserva `elemento`, `arco` y `perfora`. No deducir el elemento a partir del equipo: podría haber vuelos emitidos antes de cambiar de estado. El ensayo vertical de variantes ejecuta el 70 real con estas dos sustituciones **solo en memoria**. El archivo del proyecto queda intacto.

### 71 y 72 · Identificar arco y luz

En `ARCO.motor`, añadir:

```js
elemento: 'luz', arco: true,
```

En `ESCUELA_LUZ.motor`, después de `...ARCO.motor`, añadir:

```js
elemento: 'luz', arco: false,
```

En el `op` creado por `TallerLuz.crearMotor().lanzar`, usar:

```js
op: { elemento: C.elemento || 'luz', arco: !!C.arco, perfora: !!F.perfora,
  peso: F.peso, vertical: true, romper: false, romperSombra: false }
```

En el abanico de `EscuelaLuz`, usar este objeto de opciones:

```js
{ elemento: 'luz', arco: false, perfora: false,
  peso: F.peso, vertical: true, romperSombra: false }
```

### 74 · Contrato de escuelas

Cada ataque conserva el elemento de su emisión. Las opciones son:

```js
{ elemento: 'viento', arco: false, perfora: false }
{ elemento: 'brasa', arco: false, perfora: false }
{ elemento: 'escarcha', arco: false, perfora: false }
{ elemento: 'oscuridad', arco: false, perfora: false }
```

Se añaden a las opciones de peso, empuje y rotura de cada técnica. `perfora: true` solo para técnicas realmente perforantes. Si 74 reutiliza el taller, su motor debe llevar `elemento` y `arco: false`. No necesita producir `equilibrioSombra`. No se requieren propiedades nuevas para las defensas de daño entregadas aquí.

### Documentación y comprobación visual

Actualizar README y la documentación completa al integrar. Esos archivos no estaban autorizados en esta copia. Mantener la referencia de 75 después de 35 al traer los archivos.

Comprobar siluetas, legibilidad del rombo, maza del segundo golpe y volumen de las alas. Revisar teclado y mando. Ejecutar capítulos 1–7 y las pruebas del navegador en alta, media y baja. Medir seis enemigos y doce proyectiles a 60 FPS. No se abrió Edge y no hay medición de GPU.

Para validar +25–60 %: diez resoluciones aprendidas por estilo y variante. Misma ficha, perfil, dificultad y recursos. Comparar contra la misma variante con `defensa.recibe = 1`; para viento, también `defensa.equilibrio = 1`. Conservar la IA, el vuelo y las aberturas en ambas muestras. Medir medianas y anotar contactos protegidos. Ajustar los porcentajes o ventanas si la razón no queda entre 1,25 y 1,60. El contrapeso aéreo de odachi necesita además comparar una referencia terrestre equivalente.

## Validación realizada

`node --check` en los cuatro archivos JavaScript/MJS nuevos o modificados. Pruebas sin navegador:

- Director: **48/48**.
- Variantes: **95/95**, además de las 48 anteriores que se importan.
- Estilos: **42/42**.

Se comprueban costes y veto en Sereno, Exigente e Intenso. También reducción por los cinco elementos, aberturas, perforación, ausencia de daño reflejado, dos golpes y cancelación del anclado, reserva de agenda, altura, caída sin permiso, contacto único, pasos de 8,3/16,7/33,3/50 ms, capítulos 0–7, custodia, cielo rojo, precompilación con dobles gráficos y progresión del 57 real. Las pruebas de calidad ejecutan la lógica con cada ajuste; no certifican el dibujo ni la GPU.

## Cierre

**Archivos tocados:** `js/35-sombras.js`, `js/75-variantes-sombra.js`, `index.html`, `herramientas/probar-director.mjs`, `herramientas/probar-variantes.mjs` y esta entrega.

**Decisiones tomadas:** catálogo separado; seis variantes; resistencias parciales; cuerpos abiertos durante recuperación; devoradora común con descarga; escoria común pesada; oni anclado derivado del avanzado; sustitución de puestos por capítulo; vuelo con altura real y aterrizaje obligatorio. No se añade historia al canon.

**Preguntas abiertas:** ninguna decisión de canon necesaria para esta implementación. Quedan para Claude el contrato de 70/71/72/74, la valoración visual, las pruebas de capítulos en navegador, el rendimiento y la medición real del +25–60 %.
