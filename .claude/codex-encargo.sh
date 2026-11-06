#!/usr/bin/env bash
# Lanza un encargo a ChatGPT (Codex CLI del PATH) dentro del worktree de una rama.
# Uso: bash .claude/codex-encargo.sh <worktree> <read-only|workspace-write> <encargo.md> <nombre>
# Deja la respuesta final en $TEMP/ecos-codex/<nombre>.txt y el registro completo en <nombre>.log.
# Codex no hace commits: Claude revisa su diff (git diff en el worktree) y confirma.
set -euo pipefail
WT="$1"; MODO="$2"; ENCARGO="$3"; NOMBRE="$4"
SAL="${TEMP:-/tmp}/ecos-codex"; mkdir -p "$SAL"
[ -d "$WT/.git" ] || [ -f "$WT/.git" ] || { echo "no es un worktree: $WT" >&2; exit 2; }
RAMA=$(git -C "$WT" branch --show-current)
{ cat <<EOF
Trabajas en el worktree de la rama \`$RAMA\` ($WT). Lee antes AGENTS.md y docs/COORDINACION.md.
Reglas de git: no hagas commit, ni cambies de rama, ni toques otros worktrees. Claude revisa tu diff y lo confirma.
Pruebas: puedes ejecutar node --check y las herramientas de herramientas/ (las capturas van fuera del proyecto, en %TEMP%).

EOF
cat "$ENCARGO"; } | codex exec --sandbox "$MODO" -C "$WT" -o "$SAL/$NOMBRE.txt" - > "$SAL/$NOMBRE.log" 2>&1
echo "fin $NOMBRE ($RAMA): $(git -C "$WT" status --short | wc -l) archivos cambiados"
cat "$SAL/$NOMBRE.txt"
