# Plan de fusión · una sola campaña de Ecos de Luz

**Fecha:** 2 de noviembre de 2026. **Dirige:** Claude. **Escribe guion:** ChatGPT. **Aprueba:** el usuario.

**Objetivo:** una única versión del juego, pulida, con el canon 2.0 ([PARTE_1](PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md)) y todo el contenido jugable de la historia anterior reaprovechado: misiones, escenas, jefes y regiones. Desaparecen el botón de campaña y la «Historia anterior».

## Decisiones del usuario (2/11)

| Tema | Decisión |
|---|---|
| Alcance | **Isla nueva completa.** 8 capítulos, unas 7 h. El capítulo 4 cruza el mar hasta una segunda isla con el refugio de los exiliados. |
| Exploración | **Las zonas se abren por capítulo.** Cada región se abre al llegar su capítulo. |
| Música | **Koto y flauta en todo.** Se quitan los cinco temas orquestales (7,2 MB) y se añade una capa propia para combates y jefes. |
| Voz | **Solo subtítulos.** Se quita la voz de prueba de Tsuru (55, 56 y su ajuste). |

## Decisiones de dirección (Claude)

- **Guardado:** una sola clave, `ecos3_luna_partida`. Las partidas `ecos2_partida` quedan en el navegador, pero el juego ya no las lee.
- **Tasogare:**
  - Los duelos de la plaza (42) y de la espiral (43) pasan a ser el clímax del capítulo 5: rescate de Momo y muerte de Tasogare.
  - Tasogare no se transforma.
  - La técnica del gigante (44) sirve de base para la **Luna Roja física** del capítulo 7, con arte y ataques propios.
- **Se retiran:** la Ofrenda (41), el renacer, el final «Hikari entrega toda su luz», la Odachi «Solar» como forja del guardián y el desenlace anterior de la Tormenta (40). La Tormenta pasa a ser el cielo de la encarnación.
- **Gólems:** son guardianes corrompidos por la red del faro. Se purifican, no se matan.
- **Ecos y murales:** se reescriben según el canon. El eco del muelle es Kaito con Rui; el del último guardián, Tasogare llevando a otro niño.
- **Misiones secundarias:** se conservan las que no contradicen el canon (té para la abuela, amigos del bosque, jabalí, oso, manada blanca, espíritus del viento, luz dispersa). El pescador perdido y los murales se reescriben.

## Decisiones de canon tomadas por Claude (delegadas por el usuario)

- **Sayo:** vio desde la orilla la luz del rito la noche en que se llevaron a Nao. No supo nada más de él ni presenció su muerte.
- **Isla nueva:** se llama **Yoake** («amanecer»). Familias: los **Hayase** (Ren y su hija Sora), en el embarcadero; los **Mori** (Aiko, su madre, y Taku), en los huertos; y **Chiyo**, vecina de la casa común.

## Estado

| Fase | Estado |
|---|---|
| F0 · Campaña única | ☑ 2/11. Ver el detalle en [COORDINACION.md](COORDINACION.md). |
| Guion de los capítulos 1–4 (ChatGPT) | ☑ Entregados en `docs/entregas_chatgpt/`. Pendiente de que ChatGPT aplique los nombres de arriba. |
| F1 · Capítulo 1 | ☑ 2/11. Jugable de punta a punta; `probar-capitulo1.mjs` 24/24. Decisión añadida: la Katana del Alba se recupera al principio del capítulo, en el Mirador. |
| Guion de los capítulos 5–7 (ChatGPT) | ☑ Entregados; pendiente de revisión. |
| F2 · Capítulo 2 | ☑ 2/11. Jugable; `probar-capitulo2.mjs` 26/26. |
| F3 · Capítulo 3 | ☑ 2/11. Jugable; `probar-capitulo3.mjs` 19/19. |
| F4 · Capítulo 4 | ☑ 2/11. Jugable; `probar-capitulo4.mjs` 29/29. Yoake construida a medias con ChatGPT. |
| F5 · Capítulo 5 | ☑ 2/11. Jugable; `probar-capitulo5.mjs` 22/22. |
| Modelos de las Lunas (ChatGPT) | ☑ Roja (`64`) y Dorada (`65`), en paralelo; se integran en el capítulo 7. |
| F6 · Capítulo 6 | ☑ 2/11. Jugable; `probar-capitulo6.mjs` 23/23. Combate de los enlaces de Lumi (`66-lumi-enlaces.js`, ChatGPT). |
| F7 · Capítulo 7 y epílogo | ☑ 2/11. Jugable hasta los créditos; `probar-capitulo7.mjs` 28/28. Combate final en tres etapas (`67-duelo-luna.js`, ChatGPT), liberación de la Dorada, travesía sin rojo y mirador de Yoake. |
| F8 · Pulido | ☑ Cerrada el 3/11: sigue en [PLAN_JUEGO.md](PLAN_JUEGO.md). Hecho: Yoake en el mapa y el minimapa (ChatGPT), mar calmado junto a la isla y capa de combate de la música (ChatGPT). Hecho también: aspecto de Sayo (ChatGPT), las 13 secundarias adaptadas (ChatGPT escribe, Claude integra) y retirada de la campaña anterior (sin `Campana.piloto`; módulos 40, 41 y 44 borrados). Pendiente: estética y animación de Hikari y Tasogare y medir rendimiento con el portátil enchufado. |

## Capítulos: qué se reutiliza y qué es nuevo

| Cap. | Canon 2.0 | Región que abre | Se reutiliza | Nuevo |
|---|---|---|---|---|
| 0 | La noche que rompió el faro | Faro, pradera, Hinode | Piloto completo (hecho) | — |
| 1 | El pueblo que llama honor a la pérdida | Sakura / Pétalo | Gólem del Cerezo, reto de faroles, altar, eco | Guion de ChatGPT (entregado); el fragmento se gana al tocarlo |
| 2 | La orilla de los que faltan | Costa / Marea, muelle, gruta | Gólem de Marea, Gruta de las Luciérnagas, muelle de Kaito | Sayo bajo el emisor lunar; conejo; eco de Kaito y Rui |
| 3 | Los nombres bajo la arena | Duna, oasis, pirámides | Gólem de Arena, santuario de la Duna | Archivo de Duna; esquema de la plataforma; Lumi ve la usurpación |
| 4 | Fuera del Velo | Mar y **isla nueva** | Asedio de Hinode (Noche Roja), Cazadores | Muerte de Tsuru; travesía en barca; segunda isla con refugio y su gente |
| 5 | Lo que un padre llama salvar | Mirador / faro | Duelo de la plaza y de la espiral, Gólem Musgoso como guardián del camino | Captura de Momo; dispositivo de extracción; muerte de Tasogare |
| 6 | La memoria que no devuelve a nadie | Escarcha / Kiri | Gólem de Escarcha, cima de Kiri | Identidad completa; registro de Kiri; combate de los tres enlaces de Lumi |
| 7 | La luz que ya no se entrega | Faro (corona) | Asalto al faro, convertido en evacuación; técnica del gigante; Tormenta | Luna Roja física en 3 etapas; liberación de la Dorada; epílogo jugable |

## Orden de producción

Cada fase termina con pruebas (`probar.mjs` en las tres calidades, pruebas del inicio y de combate, y una prueba nueva por capítulo), capturas revisadas y una nota en [COORDINACION.md](COORDINACION.md).

1. **F0 · Campaña única (Claude).**
   - Quitar `Campana.piloto` y las 41 bifurcaciones; poner reglas por capítulo (qué regiones están abiertas, qué sistemas funcionan).
   - Retirar el botón de campaña, la Ofrenda, la voz de prueba y la música orquestal.
   - Barrera de región por capítulo.
2. **F1 · Capítulo 1 (Claude).** Implementar la entrega de ChatGPT.
3. **F2–F3 · Capítulos 2 y 3.** ChatGPT escribe; Claude implementa.
4. **F4 · Capítulo 4.**
   - La isla nueva va primero: terreno, bioma, refugio y su gente.
   - Después, la Noche Roja y la travesía.
5. **F5 · Capítulo 5.** Duelo con Tasogare en el rescate de Momo.
6. **F6 · Capítulo 6.** Kiri y el combate de Lumi.
7. **F7 · Capítulo 7.** Luna Roja física, evacuación y epílogo.
8. **F8 · Pulido.**
   - Estética y animación de Hikari y Tasogare (bloque 3).
   - Modelos de la Luna Roja, el conejo, el Vigía y Sayo.
   - Música de combate.
   - Medir la duración con personas y el rendimiento enchufado.

## Lo que necesitará el usuario

- Jugar cada capítulo cuando esté listo y decir qué no se entiende o qué no gusta.
- Contestar las preguntas de canon que no estén decididas; ChatGPT las marca y Claude decide las de producción.

## Pendiente heredado del plan de mejoras anterior

Lo que seguía abierto en el antiguo PLAN_MEJORAS (fases 28–35 y pruebas sin hacer), ya retirado:

- **Estética y animación de personajes:** silueta, materiales, ropa e iluminación de Hikari y Tasogare; marcha de Tasogare, apoyos, transiciones y vuelo.
- **Combate de Hikari:** función de cada arma, desplazamiento, colisiones, cancelaciones y respuesta al golpe; coordinación de los enemigos y evolución junto a Hikari.
- **Dirección de escenas:** actuación, cámara y montaje de las cinemáticas.
- **Integración y cierre:** asistencias, accesibilidad, modos de presentación y rendimiento (medir con el portátil enchufado: los reflejos del agua cuestan ~0,9 ms con mucha agua en pantalla).
- **Pruebas con personas:** oír la mezcla de audio, probar con un mando físico (tiempo de la parada) y jugar la campaña entera de principio a fin.
