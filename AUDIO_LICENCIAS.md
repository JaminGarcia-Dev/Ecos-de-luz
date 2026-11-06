# Ecos de Luz · Fuentes y licencias de audio

Selección del 23 de octubre de 2026 para la fase 24. Dirección solicitada: **cinematográfica y orgánica, con calma, asombro y peligro marcado**.

**Campaña única (2 de noviembre de 2026):** se retiraron los cinco temas orquestales de Scott Buckley y la voz de prueba de Tsuru. La música es el generador propio de koto y flauta en todo el juego; el juego va solo con subtítulos.

Las grabaciones se distribuyen con el juego y también se incrustan, comprimidas como Ogg Vorbis, en `js/45-audio-recursos.js`. La reproducción no necesita servidores de música ni cuentas. No se ha utilizado audio extraído de Sky.

## Foley · Kenney · CC0

- [RPG Audio](https://kenney.nl/assets/rpg-audio): tela, manejo de objetos, cortes de hoja y apertura de un objeto.
- [Impact Sounds](https://kenney.nl/assets/impact-sounds): pasos de hierba, piedra, madera y nieve; impactos suaves, metálicos y de piedra; cristal y campana.

Autor: **Kenney / Kenney Vleugels**. Licencia: [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). Los paquetes originales incluyen su licencia. Los archivos seleccionados se filtraron y convirtieron a Ogg Vorbis mono de 24 kHz; durante la reproducción se alternan variantes y se modifica ligeramente el tono y el volumen.

## Ambiente

| Fuente | Autor | Licencia | Adaptación |
| --- | --- | --- | --- |
| [Forest Ambience 2](https://freesound.org/people/deadrobotmusic/sounds/687054/) | deadrobotmusic | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | Fragmento de grabación de campo; se utilizó la versión pública de escucha HQ del autor, con ajuste de nivel y conversión. |
| [Sea and river wave sounds — VistulaShort](https://opengameart.org/content/sea-and-river-wave-sounds) | RandomMind | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | Selección de grabación de la orilla del Vístula; ajuste de nivel y conversión. |
| [Ambient Bird, Cricket and Frog](https://opengameart.org/content/ambient-bird-cricket-and-frog) | Blender Foundation / Yo Frankie!; publicado en OpenGameArt por Lamoot | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | Selección de aves y grillos; filtrado, nivelado y conversión a mono de 24 kHz. |

## Síntesis propia del proyecto

Se conservan el viento, algunas gotas, las voces abstractas y las señales mágicas y de acertijos. La música es el generador propio de koto, flauta y acompañamiento del archivo original, con frases y descansos; los pájaros, grillos y ambientes grabados conservan las fuentes indicadas arriba. No se utiliza música ni efectos extraídos de Sky.

## Reproducción de la preparación

Desde la raíz del proyecto:

```powershell
npm.cmd install --prefix herramientas
node herramientas/preparar-audio.mjs
```

La herramienta usa `ffmpeg-static`, descarga desde las fuentes identificadas y conserva los originales en el directorio temporal `ecos-audio-fuentes`. Genera los Ogg de `audio/`, su manifiesto con autor, licencia y cambios, y el módulo de datos incrustados. No hace falta ejecutar esta preparación para jugar.
