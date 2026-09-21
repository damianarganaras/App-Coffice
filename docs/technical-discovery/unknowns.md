---
node: unknowns
kind: unknowns
read_when: validar evidencia ausente o probar suposiciones antes de cambiar código
generatedAt: 2026-09-21T20:25:00.000Z
pluginVersion: 0.6.5
skillVersion: '2.3'
---

# Evidencias no verificadas

Lista de afirmaciones o reglas donde el pack global **no aporta
evidencia suficiente** o donde la implementación diverge de la
documentación existente. Estas brechas deberían confirmarse leyendo el
código en el path citado antes de tomar decisiones que las toquen.

## Divergencias entre documentación e implementación

- **"Limpiar Pedido" navega al catálogo** (`openspec/changes/cafeteria-pwa-foundation/tasks.md:5.3`) **vs.** observado en
  `src/components/SummaryView.jsx:103-108`: la función solo llama a
  `clearOrder()` y permanece en `SummaryView`. Decidir si la doc debe
  actualizarse o si falta la navegación.
- **Remoción de producto custom desde UI**: `tasks.md` 4.3 y `design.md`
  hablan de "delete action on a custom product", y `useInventoryStore`
  expone `removeCustomProduct(id)`, pero **ningún componente JSX/JS lo
  invoca**. No verifiqué que no exista un consumidor indirecto.

## Datos no presentes en el pack global

- **No hay tests automatizados** (`package.json` no declara
  `vitest`, `jest`, `@testing-library`, ni hay archivos `*.test.*`).
  Cualquier cambio en reglas de carrito corre sin red de seguridad.
- **No hay `README.md`** en la raíz observado en el pack. La
  descripción del proyecto vive en `app_context_spec.md` y en la
  propuesta de OpenSpec; no asumo formato estándar de readme.
- **No hay `.npmrc`, `.nvmrc`, `.node-version` ni lockfile commit
  distinto a `package-lock.json`**. La versión de Node 22 está
  documentada solo en `.github/workflows/deploy.yml`.
- **No hay `LICENSE`, `CONTRIBUTING.md` ni `SECURITY.md`**. Si el
  repositorio es público, esto es una ausencia material, no solo de
  cobertura.
- **No hay configuraciones de CI adicionales** (lint, format, type-check
  en CI). El workflow solo construye y despliega.
- **No se observa telemetría/analytics** declarados en manifest ni
  integraciones; ver `integrations.md` para la lista de
  dependencias externas.
- **`history.pushState({ view }, '', '#')`** no acumula entradas en
  navegadores que respeten `replaceState` estricto o limits del
  historial profundo. No verifiqué comportamiento con >50
  conmutaciones seguidas.

## Detalles que requieren lectura directa del path citado

- **Reglas internas del Service Worker** más allá de los
  `globPatterns` (precache vs runtime, headers, expiración). El pack
  no cubre `vite-plugin-pwa` runtime, solo su configuración.
- **Comportamiento de `workbox.precache` ante actualizaciones
  concurrentes** de un mismo usuario en dos pestañas: no observado
  en `dev-dist/`.
- **Política exacta de `Content-Security-Policy`**: no se encontró un
  CSP declarado en `index.html` ni en el manifest. Pendiente de
  evaluar si `vite-plugin-pwa` lo añade por defecto.

## No inventado

- **No hay clientes HTTP, SDKs de pago, ni APIs externas** en runtime;
  declarado en `integrations.md` y consistente con el pack. Si en el
  futuro se agrega alguno, debe aparecer tanto en `package.json` como
  en los dossiers correspondientes.
- **No hay secretos, tokens ni `.env`** en el repositorio. Verificado
  por ausencia en el listado de archivos y por la no-declaración en
  `package.json` o Vite config.
