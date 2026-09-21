---
node: decisions
kind: decisions
read_when: entender reglas, contratos, riesgos y acoplamiento
generatedAt: 2026-09-21T20:25:00.000Z
pluginVersion: 0.6.5
skillVersion: '2.3'
---

# Decisiones, reglas y riesgos

## Reglas técnicas que condicionan cambios

| Regla | Fuente | Por qué importa |
| --- | --- | --- |
| **No usar `react-router` ni rutas con `pushState` al path** | `app_context_spec.md` §1.1, `openspec/.../design.md` D1, ausencia en `package.json` | GitHub Pages responde 404 en refresh profundo. |
| Navegación entre **Catálogo** y **Pedido** vía `view: 'catalog' \| 'summary'` + `history.pushState({ view }, '', '#')` + `popstate` | `src/App.jsx`, `design.md` D1 | Permite que el botón "atrás" del navegador alterne entre vistas sin cambiar la URL. |
| **Doble store Zustand con claves separadas** (`cafe-inventory-storage`, `cafe-active-order`) y `partialize` estricto | `src/store/useInventoryStore.js`, `src/store/useOrderStore.js`, `design.md` D2 | Garantiza que `clearOrder()` no afecte al inventario. |
| **`clearOrder()` reinicia `items` a `{}`** sin escribir en el otro store | `src/store/useOrderStore.js:38-40` | Cumple RF4 y la salvaguarda de la arquitectura. |
| IDs de productos custom = `Date.now().toString()`; IDs baseline = `b1`–`b8` y son **inmutables** (`BASELINE_IDS` se chequea en `removeCustomProduct`) | `src/store/useInventoryStore.js:15, 28-46` | ID por timestamp evita colisiones en la misma sesión; baseline protegido. |
| Tema y layout viven en **estado local de `App.jsx`**, no en un store Zustand | `src/App.jsx:17-28`, `design.md` D3 | Son preferencias UI, no datos de dominio; se persisten con `localStorage` directo. |
| **Productos baseline** son una constante de módulo (`BASELINE_PRODUCTS`) y se mergean con `customProducts` en cada lectura | `src/store/useInventoryStore.js:4-17, 24-26`, `src/components/CatalogView.jsx:109`, `src/components/SummaryView.jsx:15` | No se persisten: se generan en cada carga. |
| Listado de iconos apunta a `import.meta.env.BASE_URL + 'assets/icons/...'`. **No** usar `/assets/...` absoluto | `src/components/CatalogView.jsx:6,9`, `src/components/SummaryView.jsx:5,60` | El `base` de GitHub Pages (`/App-Coffice/`) rompe las rutas absolutas. |
| Tailwind con `darkMode: 'class'` y `dark` aplicado por toggle de `document.documentElement.classList` | `tailwind.config.js`, `src/App.jsx:20-23` | Cumple RNF3 y permite override manual. |
| **Touch targets ≥ 48 px** en todos los botones (incluidos `+`, `−`, `🗑️`, toggles del `Header`) | `src/components/Header.jsx`, `src/components/SummaryView.jsx`, `src/components/AddCustomProduct.jsx`, `design.md` D6 | Cumple RNF1. |
| Viewport bloqueado a `maximum-scale=1.0, user-scalable=no` | `index.html:6`, `app_context_spec.md` RNF2 | Evita zoom accidental en doble tap. |
| `<AnimatePresence>` con `duration ≤ 0.15s` para feedback de taps, badges y modales | `src/components/*.jsx`, `design.md` D6 | Cumple RNF4. |
| Manifest PWA con **`./` relativo** en iconos | `vite.config.js:27-29`, `design.md` D5 | Idem `assets/icons` arriba. |
| `workbox.globPatterns` limitado a `js, css, html, ico, png, svg, woff2` | `vite.config.js:14-16` | Cualquier asset fuera de ese set **no** se cachea. |

## Riesgos y deuda

| Riesgo | Mitigación actual / observación | Severidad |
| --- | --- | --- |
| **Ruta de asset rota si cambia el nombre del repo**: `base` y `scope`/`start_url` están hardcodeadas a `/App-Coffice/`. | Hay que modificar `vite.config.js` (línea 6 y manifest) si se renombra el repo. Sin script automatizado en `.github/workflows/deploy.yml`. | Alta para migraciones |
| **Service Worker obsoleto**: el plugin ya usa `autoUpdate`, pero el workflow no invalida caches externas ni notifica a usuarios. | Aceptable: depende solo del navegador. | Baja |
| **`localStorage` puede crecer** si el operador crea productos custom sin tope. | Aceptado en `design.md` D-Risks. Sin límite actual en `addCustomProduct`. | Baja |
| **`removeCustomProduct` no retira los productos huérfanos** del carrito en `cafe-active-order`. Si un item queda en el carrito y luego se borra del catálogo, `SummaryView` lo muestra como `id` literal (ver `src/components/SummaryView.jsx:68`). | El render cae al fallback `product?.name \|\| id`. No se limpia el carrito al borrar el producto custom. | Media |
| **El botón "Limpiar Pedido" no navega** de vuelta al catálogo pese a estar descrito así en `tasks.md:5.3`. Observado: solo llama a `clearOrder()` y se queda en la vista Pedido (`src/components/SummaryView.jsx:103-108`). | Desviación entre `openspec/.../tasks.md` y la implementación vigente. Documentar antes de sincronizar specs. | Baja |
| **Catálogo no tiene borrado de productos custom** desde la UI. `useInventoryStore.removeCustomProduct` existe pero ningún componente la invoca (búsqueda directa en `src/`). | La API está creada pero sin consumidor; considerarla "infraestructura lista" o eliminarla. | Baja |
| **`coffice-install-dismissed`** marca el prompt como descartado para siempre, sin vencimiento. | Aceptable para una PWA interna de oficina, pero queda como dato residual en `localStorage`. | Baja |
| **`history.pushState` con URL `'#'`** puede colisionar si más adelante se introduce deep linking real. | Aceptable hoy; cualquier feature nueva de URLs debe convivir con esta ruta anclada a `#`. | Baja |
| **`App.jsx:34-42`**: el handler de `popstate` solo restaura si `e.state?.view` existe; si el estado llega falsy, no se rompe (guard OK). | Cubierto por el guard. | — |
| **Ausencia de tests**: no hay `vitest`, `@testing-library`, `jest`, ni archivos `*.test.js*` en `package.json`. | Cambios en stores o reglas de carrito corren sin red de seguridad automatizada. | Media |

## Acoplamiento

- `CatalogView` y `SummaryView` **leen directamente** `BASELINE_PRODUCTS`
  desde `useInventoryStore.js` y de `customProducts` para componer la
  lista. Si se agrega un tercer origen (p. ej. sin categoría o
  estacionales), hay que tocar ambos componentes — no hay un único
  punto de combinación.
- Las claves de `localStorage` están **dispersas en el código**: dos en
  Zustand (`cafe-*`), tres escritas manualmente (`coffice-*`). Una
  refactorización debería centralizarlas en un módulo `storageKeys.js`
  si aumenta el número.
- `vite.config.js` arrastra el `base: '/App-Coffice/'` duplicado con el
  `start_url` y `scope` del manifest: tres lugares a tocar ante un
  renombrado del repo.
