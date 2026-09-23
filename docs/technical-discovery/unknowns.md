---
node: unknowns
kind: unknowns
read_when: validar evidencia ausente o probar suposiciones antes de cambiar código
generatedAt: 2026-09-23T18:59:06.396Z
pluginVersion: 0.6.31
skillVersion: '2.3'
---

# Evidencias no verificadas

Afirmaciones o reglas donde el pack global **no aporta evidencia suficiente**,
o donde la implementación podría divergir de la documentación existente.
Confirmar leyendo el código en el path citado antes de tomar decisiones que
las toquen.

## Límites del pack usado en esta regeneración

- **El pack fue comprimido** (el tier del repo es `minimo`, que fuerza
  `--compress` en Repomix). La compresión conserva la estructura pero
  **elimina cuerpos de función y contenido de varios archivos de
  configuración**: `vite.config.js`, `postcss.config.js`, `tailwind.config.js`
  y `main.jsx` aparecen vacíos o casi vacíos en el pack.
- Por eso, los hechos de comportamiento del seed (reglas de reset,
  `ConfirmDialog`, manifest, detección iPadOS, etc.) se confirmaron
  **leyendo directamente los archivos fuente citados**, no solo el pack.
  El pack estableció la lista de archivos, la estructura y los cambios
  (nuevo `ConfirmDialog.jsx`, nuevas funciones de `useOrderStore`, nuevos
  meta tags de `index.html`, `.gitignore` actualizado).
- **Los archivos `*.md` y `docs/**` quedaron excluidos del pack** por el
  mismo tier (`**/*.md`, `docs/**`). Por eso `PRODUCT.md`,
  `app_context_spec.md`, `AGENTS.md`, `aspec/**` y `openspec/**` no están en
  el pack; se consultaron directo para las specs vigentes.

## Divergencias entre documentación e implementación

- **`app_context_spec.md` está desactualizado** respecto del código: su
  schema de `OrderState` no incluye `dayMarker` ni `resetOrder`, y su
  baseline no menciona `icon` en los productos. Las specs vigentes viven en
  `aspec/specs/` (`reset-order`, `pwa-instalable`).
- **`PRODUCT.md` es la plantilla de ancleto sin completar** (contiene
  `[Product Name]`, `src/core/`, comandos de `npm test`/`npm run lint` que no
  existen). No usarla como fuente de contexto de producto.
- **`removeCustomProduct` sin consumidor**: la spec/`design.md` previos
  hablaban de borrar productos custom, pero ningún componente JSX/JS invoca
  el método. No verifiqué que no exista un consumidor indirecto.

## Datos no presentes o no verificables

- **No hay tests automatizados** (`package.json` no declara `vitest`, `jest`
  ni `@testing-library`, y no hay archivos `*.test.*`).
- **No hay `README.md`, `LICENSE`, `CONTRIBUTING.md` ni `SECURITY.md`** en la
  raíz. La descripción del proyecto vive en `app_context_spec.md` y en las
  specs de `aspec/`.
- **No hay `.npmrc`, `.nvmrc` ni `.node-version`**. La versión de Node 22 solo
  está fijada en `.github/workflows/deploy.yml`.
- **No hay CI de lint/format/type-check**: el workflow solo construye y
  despliega.
- **Iconos PWA**: el pack no incluye binarios, así que no pude verificar que
  `pwa-*.png` / `apple-touch-icon.png` sean PNG decodificables ni que sus
  dimensiones reales coincidan con lo declarado. La spec
  `aspec/specs/pwa-instalable/spec.md` afirma que una versión previa tenía
  PNG corruptos y que se regeneraron desde `public/logo.png`.
- **`Content-Type` del `manifest.json` en GitHub Pages**: no verificado (la
  propia spec lo deja pendiente al cierre de `pwa-instalable-android-ios`).
- **Aceptación en dispositivo real** (instalación/standalone en Chrome y
  Samsung Internet Android, Safari iOS/iPadOS, medición de touch targets) no
  fue ejecutada; el repo no tiene framework de tests.

## Detalles que requieren lectura directa del path citado

- **Reglas internas del Service Worker** más allá de `globPatterns`
  (precache vs runtime, expiración, headers): el pack no cubre el runtime de
  `vite-plugin-pwa`.
- **Comportamiento de actualización concurrente** del SW en dos pestañas: no
  observado.
- **`docs/relevamiento-uso-ancleto.md`** y `.ancleto/working-context.md`:
  documentación del uso del tooling ancleto; no se evaluó su contenido por
  quedar fuera del pack y no ser relevante para el comportamiento de la app.

## No inventado

- **No hay clientes HTTP, SDKs de pago ni APIs externas** en runtime;
  consistente con `package.json` y con el pack.
- **No hay secretos, tokens ni `.env`** en el repositorio.
