# Relevamiento de uso de Ancleto — App Coffice

- **Fecha:** 2026-09-22
- **Repo:** `D:\Repos D\Proyectos\App Coffice` · **Rama:** `main`
- **Alcance:** cómo funcionó Ancleto durante el desarrollo del change `reset-pedido-intuitivo`, del change `pwa-instalable-android-ios` y del refresh de íconos.
- **Método:** evidencia recolectada con subagentes read-only (`@general`, `@memory-keeper`). Donde no hubo ejecución directa se marca como **inferencia**.

> Convención: **[observación]** = dato con output crudo o path:línea que lo respalda. **[inferencia]** = deducción sin ejecución directa.

---

## 1. Tools de memoria disponibles y su MCP

**[observación]** En esta sesión están cargadas:

| Tool | MCP | Estado |
|---|---|---|
| `searchMemory`, `recordRule`, `recordDecision` | **ancleto-memory** | ✅ presentes |
| `mem_save`, `mem_search`, `mem_context`, … | engram | ✅ presentes |
| `caveman_*` (compress / retrieve / toon) | caveman | ✅ presentes |

Config global `C:\Users\damia\.config\opencode\opencode.json`:

```json
"ancleto-memory": {
  "type": "local",
  "enabled": true,
  "command": ["...node.exe", ".../@ancleto/spec/src/cli/index.js", "mcp"]
}
```
También `caveman` (caveman-mcp.exe) y `engram` (engram.exe mcp --tools=agent). `engram` está duplicado en `opencode.jsonc`.

⚠️ **Nota de rol:** las tools **existen**, pero el orquestador tiene prohibido llamarlas; solo `@memory-keeper` toca la memoria del repo.

---

## 2. Llamada real a `searchMemory`

**[observación]** `searchMemory("maskable")` → **4 resultados**, keys: `pwa-manifest-filename-and-fields`, `pwa-icon-validity`, `maskable-safe-zone-circle`, `pwa-installability-root-cause-first`.

**[observación]** `searchMemory("pwa iconos")` → **3 resultados** (se cae `pwa-manifest-filename-and-fields`).

Semántica medida:

| query | resultado |
|---|---|
| `maskable` | 4 |
| `maskable pwa` | 3 |
| `como instalar la pwa en el celular` | `[]` |
| `autenticacion jwt` | `[]` |

**Conclusión:** la tool **existe Y funciona** (no es stub), pero es **AND léxico** (FTS5/BM25), no semántica: una consulta en lenguaje natural que mezcla vocabulario devuelve `[]`.

---

## 3. ¿Existe `.ancleto/working-context.md`?

**[observación]** **NO existe.** `.ancleto/` contiene solo: `memory.db` (4.096 B), `memory.db-shm` (32.768 B), `memory.db-wal` (469.712 B).

**Por qué:** ese archivo se materializa solo con `ancleto memory context --out .ancleto/working-context.md`; nadie lo corrió en la sesión. → **Gap #1**: la feature de reglas activas nunca se inyectó.

---

## 4. Reglas y decisiones en `memory.db`, scope, e inyectadas

**[observación]** 12 filas: **10 activas** + **2 superseded**.

| memory_key | type | scope | status |
|---|---|---|---|
| `pwa-base-safe-asset-paths` | rule | project | active |
| `aspec-archive-convention` | rule | project | active |
| `maskable-safe-zone-circle` | rule | project | active |
| `pwa-icon-validity` | decision | project | active |
| `vite-public-dir-ships-verbatim` | decision | project | active |
| `coffice-default-theme-is-light` | decision | feature | active |
| `pwa-target-browsers` | decision | feature | active |
| `pwa-installability-root-cause-first` | decision | feature | active |
| `pwa-manifest-filename-and-fields` | decision | feature | active |
| `pwa-ios-detection-ipados-and-touch-targets` | decision | feature | active |
| `pwa-base-safe-asset-paths` | rule | project | superseded |
| `pwa-installability-root-cause-first` | decision | feature | superseded |

Totales: `active: 10` (3 rule · 7 decision; 5 project · 5 feature), `superseded: 2`, `deleted: 0`.

**[observación]** **Inyectadas en esta sesión: 0.** Si se generara el working-context, entrarían solo las **3 `rule/project`** (`pwa-base-safe-asset-paths`, `aspec-archive-convention`, `maskable-safe-zone-circle`). Las `decision` no se inyectan nunca; se consultan on-demand.

**Guardado ≠ inyectado.**

---

## 5. ¿Se llamó a `searchMemory` en esta sesión?

**[observación]** El **orquestador NO** llamó memory tools directamente (prohibido por su rol); delegó a `@memory-keeper`. Hubo **una** Recall (al inicio del change de reset) → devolvió **vacío** ("no hay memoria en este repo"). Después funcionó.

**[observación]** Sí llamaron al MCP: `@memory-keeper` (inventario/record) y `@spec-writer` (registró `pwa-target-browsers`, etc.).

→ El protocolo **reactivo** (Recall) se usó **una vez** y no aportó nada (memoria vacía en ese momento).

---

## 6. ¿Qué se grabó, con qué justification, qué supersedió?

**Delegado por el orquestador a `@memory-keeper` (3):**

| key | type/scope | justification (resumen) |
|---|---|---|
| `pwa-icon-validity` | decision/project | "Los iconos invalidos rompian la instalabilidad sin error visible… validar y regenerar los PNG evita diagnosticar en la UI en lugar de en el asset." |
| `vite-public-dir-ships-verbatim` | decision/project | build evidence: precache 24→23 entradas, `dist/logo.png` eliminado; `globIgnores` solo evita precache. |
| `maskable-safe-zone-circle` | rule/project | evidencia 0,4053/0,4061 (fail) vs 0,3794/0,3798 (pass). |

**Grabado por otros subagentes (no por el orquestador):** `pwa-target-browsers`, `pwa-installability-root-cause-first`, `pwa-manifest-filename-and-fields`, `pwa-ios-detection-ipados-and-touch-targets`, `coffice-default-theme-is-light`, `pwa-base-safe-asset-paths`, `aspec-archive-convention`. ⚠️ **violación de la regla "solo `@memory-keeper` escribe memoria"** (no está forzada técnicamente).

**Supersesiones (2):** `pwa-base-safe-asset-paths` v1 (path erróneo `/App-Coffee/`) → v2; `pwa-installability-root-cause-first` v1 (hipótesis) → v2 (confirmada). Mecanismo: misma `memory_key`; índice único parcial garantiza **1 activa por key**.

---

## 7. `ancleto memory doctor`

**[observación]**

```
  ✔ Integridad DB: quick_check ok
  ✔ Indice FTS5: indice consistente con la tabla de contenido
  ✔ Reglas activas (unicidad): una sola activa por memory_key
EXITCODE=0
```
Sin cambios en `.ancleto/` (tamaños y mtime idénticos; el WAL no se checkpointeó).

---

## 8. Skills invocadas y por qué (routing)

**[observación]** El **orquestador** cargó 3 skills:

| Skill | Cuándo | Por qué |
|---|---|---|
| `ancleto-technical-discovery` | pedido "hacé un descubrimiento del sistema e inicializalo" | orientación de repo desde el seed (no barrido) |
| `triage-clarifier` | bug PWA, categoría no obvia | decidir entre direct vs spec-required |
| `ancleto-commit` | pedido "hacé un commit y subilo a main" | convención de commit del repo |

**[inferencia]** Los subagentes usaron las skills de su rol (spec-writer/documenter/memory-keeper).

---

## 9. `aspec/changes/`

**[observación]** **Sin change activo.** 2 archivados:

| Change | Artefactos | Tareas |
|---|---|---|
| `archive/2026-09-21-reset-pedido-intuitivo/` | proposal, design, tasks, specs/reset-order | **11/11** ✅ |
| `archive/2026-09-22-pwa-instalable-android-ios/` | proposal, design, tasks, specs/pwa-instalable | **7/11** — pendientes 6, 7, 8, 11 (dispositivo real); Tarea 8 con 7 `[ ]` sin tildar |

Además (legacy, fuera de `aspec/`): `openspec/changes/cafeteria-pwa-foundation/` (activo, no archivado).

---

## 10. ¿Keywords de spec en inglés o traducidas?

**[observación]** **Mixto, no uniforme:**

- `aspec/specs/pwa-instalable/spec.md` → **inglés literal** (`### Requirement:`, `#### Scenario:`, `**WHEN**`, `**THEN**`, `SHALL`) con prosa en español.
- `aspec/specs/reset-order/spec.md` → **traducido**: usa `#### RF1: …` + `**Dado** / **Cuando** / **Entonces**`; grep de `Requirement|Scenario|WHEN|THEN|SHALL` → **0** matches.
- `openspec/changes/cafeteria-pwa-foundation/specs/*` → **inglés completo** (`## ADDED Requirements`).

→ Inconsistencia entre capacidades dentro del mismo `aspec/`.

---

## 11. ¿Se corrió verify antes de cerrar? ¿Se archivó? ¿Quedó algo sin archivar?

**[observación]** Sí: cada change pasó por verificación de `@tester` (build + evidencia cruda) y review independiente. **Ambos archivados.** El refresh de íconos fue **`direct-implementation`** (sin archive, por diseño).

**Sin archivar / pendiente:** tareas 6, 7, 8 y 11 del change PWA (verificación en dispositivo real: instalación/standalone en Android e iOS, apariencia del ícono). El archive lo dejó explícito.

---

## 12. ¿Qué clasificación de triage y por qué?

| Pedido | Clasificación | Por qué |
|---|---|---|
| Reset del pedido + auto-reset | **spec-required** | flujo UX + cambio de comportamiento observable + criterios de aceptación |
| PWA instalable + iOS | **spec-required** | comportamiento visible + config transversal (manifest/index.html/assets/base) con criterios por plataforma |
| Renovar logos desde el nuevo `logo.png` | **direct-implementation** | asset/contenido con resultado claro; contrato del manifest sin cambios; **con confirmación previa del usuario** |
| "ancleto install con UI de init" | **bloqueado** | el fuente del CLI vive en otro repo (`...\ancleto\spec`), no en el workspace |

---

## 13. `.discovery-map.json`, seed y `ancleto discovery --check`

**[observación]** `.discovery-map.json` **existe** (525 B tras la auditoría). Seed en `docs/technical-discovery/` (11 archivos: index, overview, inventory, integrations, decisions, unknowns, setup, `.discovery-state.json`, `units/_map.md`, `units/almacenamiento-dual.md`, `units/pwa-y-despliegue.md`).

```
ancleto discovery --check
{ "schemaVersion": 2, "state": "STALE",
  "recommendedAction": "regenerate",
  "message": "El repositorio cambio desde el ultimo pack.",
  "missingDocs": [] }
EXIT=0
```

⚠️ **Efecto colateral:** el comando **reescribió** `.discovery-map.json` (506 → 525 B) **pese a `--check`**.

---

## 14. Tier y modelos

**[observación]** `.opencode/.ancleto-tier` → contenido: `minimo` (7 B). **No existe `.opencode/agents/`** en el repo.

**[observación]** Los 10 agentes **globales** (`C:\Users\damia\.config\opencode\agents\*.md`) declaran todos `model: opencode-go/deepseek-v4.1-flash`.

**[inferencia]** El tier `minimo` del repo quedó **huérfano** (no hay agentes locales donde aplicarlo) y los agentes globales no reflejan ese tier.

---

## 15. `ancleto check` y `ancleto doctor`

**[observación]**

```
$ ancleto check
ancleto: check -> 0 faltantes, 0 huerfanos      (EXIT=0)

$ ancleto doctor
  ✔ Node.js 24.15.0 (>=24)
  ✔ node:sqlite importable
  ✔ opencode.json valido                        (EXIT=0)
```

---

## 16. ¿Bloques LOCKED intactos y EXTENSIBLE preservadas?

**[observación]** **No existe `AGENTS.md` ni `PRODUCT.md`** en el repo (glob + búsqueda recursiva → ninguno). Por lo tanto: **0 bloques `LOCKED`, sin sección `EXTENSIBLE`** — N/A.

**[inferencia]** El `ancleto install --project` (que copia los templates `AGENTS.md`/`PRODUCT.md`) **no se corrió** en este repo; solo el install global. El orquestador, que asume `AGENTS.md` en la raíz, no lo tiene.

---

## 17. Archivos creados/modificados en la sesión (contraste con git)

**[observación]** Por change:

- **reset-pedido-intuitivo:** `src/components/ConfirmDialog.jsx` (nuevo), `src/components/CatalogView.jsx`, `src/components/SummaryView.jsx`, `src/components/Header.jsx`, `src/App.jsx`, `src/store/useOrderStore.js` (+ artefactos en `aspec/`).
- **pwa-instalable-android-ios:** `vite.config.js`, `index.html`, `src/components/PWAInstaller.jsx`, `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/pwa-maskable-192x192.png`, `public/pwa-maskable-512x512.png`, `public/apple-touch-icon.png`, `public/favicon-32x32.png`, `public/logo.png` → `design/logo.png` (move), `docs/technical-discovery/**` (seed).

**[observación]** Commits: `d40dc7c`, `55935d1`, `f6dab7e`, `e6cc7d5` (por el orquestador vía subagente) y `88d7b58 "Update de iconos"` (**no** hecho por el orquestador).

**[observación]** `git status --porcelain` actual:
```
 M .ancletorc
 M .discovery-map.json
```
`.discovery-map.json` figura modificado **por la propia auditoría** (`discovery --check`).

---

## 18. Evidencia por afirmación (anti-confabulación)

| Afirmación | Respaldo |
|---|---|
| `ancleto-memory` registrado y enabled | `C:\Users\damia\.config\opencode\opencode.json` (bloque `mcp`) |
| `searchMemory` funciona | output crudo de `searchMemory("maskable")` → 4 keys |
| Semántica AND | `maskable`=4 vs `maskable pwa`=3; `como instalar la pwa en el celular`=`[]` |
| working-context ausente | `.ancleto/` listado = solo 3 archivos `memory.db*` |
| 10 activas / 2 superseded | agregados SQL sobre `memory_nodes` |
| `memory doctor` verde | output pegado (exit 0) |
| `discovery --check` = STALE | output JSON pegado |
| Tier `minimo` | `.opencode/.ancleto-tier` = `minimo` |
| Agentes globales = flash | `model:` de los 10 `*.md` |
| Sin `AGENTS.md`/`PRODUCT.md` | glob + búsqueda recursiva → ninguno |
| Keywords mixtas | grep por spec (pwa-instalable inglés; reset-order 0 matches) |
| `.gitignore` ignora `/aspec`, `/openspec`, `/.ancleto`, `/.ancletorc`, `/.opencode`, `dist` | contenido de `.gitignore` |

---

## 19. ¿Qué es observación y qué inferencia?

**Observación (con evidencia cruda):** items 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14 (parte `[observación]`), 15, 16 (ausencia), 17, 18.

**Inferencia:**
- 8 → skills de subagentes (no verificado).
- 14 → que el tier quedó huérfano y los globales no lo reflejan.
- 16 → que no se corrió `install --project`.
- 12 → el "por qué" de cada clasificación es razonamiento del orquestador, no output.

---

## Hallazgos accionables (resumen)

1. **Gap #1 — `working-context.md` ausente** → activar con `ancleto memory context --out .ancleto/working-context.md`.
2. **`searchMemory` es AND léxico** → no sirve para consultas en lenguaje natural; usar 1–2 tokens.
3. **WAL no checkpointeado** → lectores que ignoran el WAL ven la DB vacía (posible causa del "motor no disponible" inicial).
4. **`.gitignore` ignora `/aspec`** → toda la fuente-de-verdad y el historial de changes **no se versionan**.
5. **`discovery --check` muta `.discovery-map.json`** (y el seed está **STALE**).
6. **Guarda de roles no forzada** → subagentes distintos de `memory-keeper` escribieron memoria.
7. **`AGENTS.md`/`PRODUCT.md` ausentes** → el orquestador asume un contrato que no existe.
8. **Tier `minimo` huérfano**; agentes globales todos en flash.
9. **Keywords de spec inconsistentes** entre capacidades.
10. **`@coder` sin shell** → no puede buildear ni generar assets (fricción estructural).
