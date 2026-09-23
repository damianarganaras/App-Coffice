---
node: decisions
kind: decisions
read_when: entender reglas, contratos, riesgos y acoplamiento
generatedAt: 2026-09-23T18:59:06.396Z
pluginVersion: 0.6.31
skillVersion: '2.3'
---

# Decisiones, reglas y riesgos

## Reglas técnicas que condicionan cambios

| Regla | Fuente | Por qué importa |
| --- | --- | --- |
| **No usar `react-router` ni rutas con `pushState` al path** | `app_context_spec.md` §1.1, ausencia en `package.json`, `aspec/specs/pwa-instalable/spec.md` | GitHub Pages responde 404 en refresh profundo. |
| Navegación entre **Catálogo** y **Pedido** vía `view: 'catalog' \| 'summary'` + `history.pushState({ view }, '', '#')` + `popstate` | `src/App.jsx` | Permite que el botón "atrás" del navegador alterne entre vistas sin cambiar la URL. |
| **Doble store Zustand con claves separadas** (`cafe-inventory-storage`, `cafe-active-order`) y `partialize` estricto | `src/store/useInventoryStore.js`, `src/store/useOrderStore.js` | Garantiza que el reset del pedido no afecte al inventario (RF4 de `reset-order`). |
| **`resetOrder()` reinicia `items` a `{}` y fija `dayMarker = hoy`**; `clearOrder()` delega en `resetOrder()` | `src/store/useOrderStore.js` | Unifica reset manual y automático bajo el mismo path. |
| **Auto-reset diario** por `dayMarker` (`YYYY-MM-DD` local): en `onRehydrateStorage` y en `checkAndAutoReset()` (invocado desde `visibilitychange`). Si `dayMarker` es `null`, solo se fija la fecha (no se resetea); si difiere, se vacía en silencio | `src/store/useOrderStore.js`, `src/App.jsx` | Evita arrastrar el pedido de un día al siguiente sin intervención (RF5 de `reset-order`). |
| **Confirmación obligatoria antes de limpiar el pedido** en ambas vistas (`ConfirmDialog`): "Cancelar" / "Sí, limpiar"; `Escape` y click en overlay cancelan | `src/components/CatalogView.jsx`, `src/components/SummaryView.jsx`, `src/components/ConfirmDialog.jsx` | Evita resets accidentales (RF1/RF2 de `reset-order`). |
| **`SummaryView` navega al Catálogo al confirmar** (`clearOrder()` + `onBack()`) | `src/components/SummaryView.jsx` | Resuelve la divergencia previa entre `tasks.md` y la implementación. |
| IDs de productos custom = `Date.now().toString()`; IDs baseline = `b1`–`b8` y son **inmutables** (`BASELINE_IDS` se chequea en `removeCustomProduct`) | `src/store/useInventoryStore.js` | ID por timestamp evita colisiones en la misma sesión; baseline protegido. |
| Tema y layout viven en **estado local de `App.jsx`**, no en un store Zustand | `src/App.jsx` | Son preferencias UI, no datos de dominio; se persisten con `localStorage` directo. |
| **Productos baseline** son una constante de módulo (`BASELINE_PRODUCTS`, 8 ítems) y se mergean con `customProducts` en cada lectura | `src/store/useInventoryStore.js`, `src/components/CatalogView.jsx`, `src/components/SummaryView.jsx` | No se persisten: se generan en cada carga. |
| Listado de iconos apunta a `import.meta.env.BASE_URL + 'assets/icons/...'`. **No** usar `/assets/...` absoluto | `src/components/CatalogView.jsx`, `src/components/SummaryView.jsx` | El `base` de GitHub Pages (`/App-Coffice/`) rompe las rutas absolutas. |
| Tailwind con `darkMode: 'class'` y `dark` aplicado por toggle de `document.documentElement.classList` | `tailwind.config.js`, `src/App.jsx` | Permite override manual del tema. |
| **Touch targets ≥ 48 px** en todos los botones (incluidos `+`, `−`, `🗑️`, toggles del `Header`, botones del `ConfirmDialog` y del banner de instalación) | `src/components/*.jsx`, `aspec/specs/*/spec.md` | Invariante de ergonomía táctil del proyecto. |
| Viewport bloqueado a `maximum-scale=1.0, user-scalable=no` | `index.html`, `app_context_spec.md` RNF2 | Evita zoom accidental en doble tap. |
| Animaciones con `duration ≤ 0.15s` (y spring corto en el badge de cantidad) | `src/components/*.jsx` | Feedback inmediato. |
| **`ConfirmDialog` accesible**: `role="dialog"`, `aria-modal`, `aria-labelledby`, `autoFocus` en Cancelar y focus trap con `Tab`/`Shift+Tab` | `src/components/ConfirmDialog.jsx` | Diálogo usable con teclado y lectores de pantalla. |
| Manifest PWA con `id`, `lang: 'es'`, `manifestFilename: 'manifest.json'`, y **4 iconos** (`any` 192/512 + `maskable` 192/512) en rutas relativas `./` | `vite.config.js`, `aspec/specs/pwa-instalable/spec.md` | Requisitos de instalabilidad Android/Samsung + icono adaptativo sin recorte. |
| **Metadatos iOS en `index.html`**: `apple-touch-icon`, `apple-mobile-web-app-title: Coffice`, `apple-mobile-web-app-capable`, `mobile-web-app-capable`, `favicon-32x32` | `index.html`, `aspec/specs/pwa-instalable/spec.md` | Safari iOS requiere estos metadatos para instalar con nombre e icono correctos. |
| **Detección iPadOS** en `PWAInstaller`: UA `Macintosh` **y** `navigator.maxTouchPoints > 1` | `src/components/PWAInstaller.jsx` | Safari en iPadOS se reporta como macOS; sin esto no muestra la guía manual. |
| `workbox.globPatterns` limitado a `js, css, html, ico, png, svg, woff2` | `vite.config.js` | Cualquier asset fuera de ese set **no** se cachea. |

## Riesgos y deuda

| Riesgo | Mitigación actual / observación | Severidad |
| --- | --- | --- |
| **Ruta de asset rota si cambia el nombre del repo**: `base`, `start_url`, `scope` y `manifest.id` están fijados a `/App-Coffice/`. | Hay que modificar `vite.config.js` si se renombra el repo. Sin script automatizado en `.github/workflows/deploy.yml`. | Alta para migraciones |
| **Lógica de auto-reset duplicada**: `onRehydrateStorage` y `checkAndAutoReset()` repiten la misma comparación `dayMarker`/hoy. | Extraer a un helper único para evitar divergencias futuras. | Media |
| **`removeCustomProduct` no retira los productos huérfanos** del carrito. Si un item queda en `cafe-active-order` y se borra del catálogo, `SummaryView` cae al fallback `product?.name \|\| id`. | No se limpia el carrito al borrar el producto custom. | Media |
| **Sin UI para borrar productos custom**: `useInventoryStore.removeCustomProduct` existe pero ningún componente lo invoca. | API sin consumidor; considerarla "infraestructura lista" o eliminarla. | Baja |
| **Ausencia de tests**: no hay `vitest`, `@testing-library`, `jest`, ni archivos `*.test.js*` en `package.json`. | Cambios en stores o reglas de pedido corren sin red de seguridad automatizada. | Media |
| **Service Worker obsoleto**: el plugin usa `autoUpdate`, pero el workflow no invalida caches externas ni notifica a usuarios. | Aceptable: depende del navegador. | Baja |
| **`localStorage` puede crecer** si se crean productos custom sin tope. | Sin límite en `addCustomProduct`. | Baja |
| **`coffice-install-dismissed`** marca el prompt como descartado para siempre, sin vencimiento. | Aceptable para una PWA interna de oficina. | Baja |
| **`history.pushState` con URL `'#'`** puede colisionar si se introduce deep linking real. | Aceptable hoy; cualquier feature de URLs debe convivir con esta ruta anclada a `#`. | Baja |
| **Iconos PWA**: la no-instalabilidad previa se atribuyó a PNG corruptos (IDAT truncado), regenerados desde `public/logo.png`. | Si se regeneran con herramientas que produzcan PNG inválidos, la app deja de ser instalable. Verificar dimensiones reales (192/512/180). | Media |
| **`manifest.json` desplegado**: el `Content-Type` servido por GitHub Pages no fue verificado al cierre de la change `pwa-instalable-android-ios`. | Declarado como pendiente en `aspec/specs/pwa-instalable/spec.md` §Riesgos. | Baja |
| **`PRODUCT.md` es la plantilla de ancleto sin completar** (contiene `[Product Name]` y placeholders). | No usarlo como fuente de contexto de producto hasta completarlo. | Baja |
| **Auto-reset por reloj local**: cambiar la hora del dispositivo o viajar de zona horaria altera el "día". | Aceptado explícitamente en `aspec/specs/reset-order/spec.md` §Casos edge. | Baja |

## Acoplamiento

- `CatalogView` y `SummaryView` **componen por separado** la lista
  `[...BASELINE_PRODUCTS, ...customProducts]` y calculan `orderCount` cada
  uno. Si se agrega un tercer origen de productos, hay que tocar ambos
  componentes: no hay un único punto de combinación.
- Las claves de `localStorage` están **dispersas en el código**: dos en
  Zustand (`cafe-*`) y tres escritas manualmente (`coffice-*`). Si aumentan,
  conviene centralizarlas en un módulo de claves.
- `vite.config.js` duplica el prefijo `/App-Coffice/` en `base`,
  `start_url`, `scope` e `id`: cuatro lugares a tocar ante un renombrado.
- La lógica de reset (`resetOrder` / `checkAndAutoReset` /
  `onRehydrateStorage`) y la de confirmación (`ConfirmDialog`) son puntos
  únicos de cambio para el flujo de pedido: modificarlos afecta a ambas
  vistas a la vez.
