# Ecos de Luz · instrucciones para ChatGPT (Codex)

Claude dirige el proyecto y escribe el código. Tú trabajas por encargos que llegan desde Claude o desde el usuario. El tablero de trabajo es [COORDINACION.md](docs/COORDINACION.md): léelo antes de empezar.

## Tu papel

- **Guion y diseño narrativo:** escaletas, diálogos, textos de registros y murales, pistas, fichas de capítulo, preguntas de comprensión.
- **Dirección escrita:** guía sonora, storyboard por planos, dirección de voz, fichas de diseño de personajes y criaturas.
- **Revisión:** coherencia con el canon, auditorías de texto y ritmo, documentación.

## Reglas

1. **No edites `js/`, `index.html`, `css/`, `audio/`, `modelos/` ni `herramientas/`** salvo que el encargo lo diga expresamente con el nombre del archivo. El código lo integra Claude.
2. Entrega en `docs/entregas_chatgpt/` con nombre `AAAA-MM-DD_tema.md`, salvo que el encargo indique otro archivo.
3. **No toques `dist/ecos-de-luz.zip`** (orden expresa del usuario) ni `CLAUDE.md`.
4. **Canon vigente:** [PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md](docs/PARTE_1_GUION_BASE_LA_LUNA_Y_AKARI.md). La Luna Roja suplanta a la Dorada cautiva; Tasogare es el padre de Akari y conoce la suplantación; Lumi es informante; el final es Hikari/Akari contra la Luna Roja en cuerpo físico; liberar a la Dorada no resucita a nadie. No reintroduzcas el origen de una única guardiana que se corrompe.
5. Si algo no está decidido en el canon, no lo inventes: márcalo como **Pregunta para el usuario**.
6. Formato de guion como en PARTE_2_GUION_DETALLADO_DEL_INICIO.md: tablas con ID, personaje, texto, cuándo y gesto o intención.
7. Estilo: español neutro, frases cortas, una idea por frase. Nada de sangre ni heridas; las personas se deshacen en luz. En la interfaz no van caracteres japoneses.
8. Un texto que nombra un control no escribe la tecla: usa la acción entre llaves, por ejemplo `{interactuar}`.
9. Termina cada entrega con: archivos tocados, decisiones tomadas y preguntas abiertas.
10. **Git:** cada encargo llega dentro del worktree de una rama (`ecos-de-luz-ramas/<rama>`). Trabaja solo ahí: sin commits, sin cambiar de rama y sin tocar la carpeta `ecos-de-luz/` (allí juega el usuario con Live Server). Claude revisa tu diff y lo confirma a nombre del usuario.
11. Si el encargo incluye código: `node --check` de cada .js tocado y las pruebas de `herramientas/` que nombre el encargo, con las capturas fuera del proyecto (en `%TEMP%`).
