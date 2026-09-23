---
node: overview
kind: overview
read_when: entender el propósito, la arquitectura y el recorrido principal
generatedAt: 2026-09-23T18:59:06.396Z
pluginVersion: 0.6.31
skillVersion: '2.3'
---

# Visión general

## Propósito

`Coffice` es una **PWA cliente** para tomar pedidos de cafetería desde el
móvil en una oficina, sin backend ni cuentas: el operador toca productos del
catálogo, revisa el resumen y limpia el carrito al terminar. Funciona offline
(Service Worker con precache) y se publica en **GitHub Pages** como sitio
estático.

## Stack

| Capa | Tecnología | Fuente |
| --- | --- | --- |
| Build / dev server | Vite 5 + `@vitejs/plugin-react` 4 | `package.json`, `vite.config.js` |
| UI | React 18 + Tailwind 3 (`darkMode: 'class'`) | `tailwind.config.js`, `src/index.css` |
| Estado | Zustand 5 con `persist` (localStorage) | `src/store/use*.js` |
| Animación | Framer Motion 11 | `src/components/*.jsx` |
| PWA / offline | `vite-plugin-pwa` 0.20 + Workbox | `vite.config.js` |
| Despliegue | GitHub Actions + GitHub Pages | `.github/workflows/deploy.yml` |
| Lenguaje | JavaScript (ESM) con `tsconfig.json` solo de tipo (`strict`) | `tsconfig.json` |

## Arquitectura

Coffice **no usa `react-router`**: GitHub Pages devolvería 404 en recargas
profundas. La navegación se reduce a un string-enum en `useState` y a
`history.pushState`/`popstate` para que el botón "atrás" alterne entre
Catálogo y Pedido.

```text
main.jsx
  └─ App.jsx                     ← view / theme / layout; reset diario
       ├─ Header.jsx             ← toggles de tema, layout y vista + badge de pedido
       ├─ PWAInstaller.jsx       ← banner Android/Chrome + guía manual iOS/iPadOS
       ├─ CatalogView.jsx        ← grid o lista de productos (tap = añadir)
       │    ├─ ProductCard (interno, animado con Framer Motion)
       │    ├─ AddCustomProduct.jsx  ← modal para crear producto custom
       │    └─ ConfirmDialog.jsx     ← confirmación de "Limpiar Pedido"
       └─ SummaryView.jsx        ← filas con +/-/🗑️ + "Limpiar Pedido"
            └─ ConfirmDialog.jsx

Estado global (Zustand persist):
  - useInventoryStore → clave "cafe-inventory-storage" (customProducts)
  - useOrderStore     → clave "cafe-active-order"     (items + dayMarker)
```

Cada store persiste solo lo necesario mediante `partialize`, lo que impide
que `clearOrder()` toque el inventario accidentalmente.

## Recorrido del usuario (observado)

1. **Carga inicial**: `index.html` sirve `src/main.jsx`, que monta `<App/>`
   en `#root` dentro de `React.StrictMode`. `App.jsx` lee `localStorage`
   para `coffice-theme` y `coffice-layout` y aplica la clase `dark` a
   `<html>` si corresponde.
2. **Catálogo**: `CatalogView` une los 8 productos base (`BASELINE_PRODUCTS`
   en `src/store/useInventoryStore.js`) con los productos custom del store
   persistente. Cada toque llama a `useOrderStore.addItem(id)`, que
   incrementa `items[id]`.
3. **Cambio a Pedido**: el botón del `Header` llama a `switchView`, que
   empuja `history.pushState({ view: 'summary' }, '', '#')` y renderiza
   `SummaryView`.
4. **Edición del pedido**: `SummaryView` filtra `items` con `quantity > 0` y
   expone `+` (`addItem`), `−` (`removeItem`, elimina la entrada al llegar a
   0) y `🗑️` (`deleteItem`).
5. **Limpiar pedido (manual)**: tanto `CatalogView` (botón "Limpiar Pedido
   (N)", visible solo si `orderCount > 0`) como `SummaryView` abren
   `ConfirmDialog`; al confirmar llaman a `clearOrder()` → `resetOrder()`
   (`items = {}`, `dayMarker = hoy`). En `SummaryView` además navega de
   vuelta al Catálogo (`onBack()`).
6. **Auto-reset diario**: al hidratar el store (`onRehydrateStorage`) o al
   volver la pestaña a foco (`visibilitychange` → `checkAndAutoReset`), si
   `dayMarker` difiere de la fecha local actual el pedido se vacía en
   silencio. Sin `dayMarker` (estado legacy) solo se fija la fecha, sin
   perder items.
7. **Botón "atrás"**: `popstate` lee `e.state?.view` y restaura la vista.
   Sin estado, sale de la PWA (comportamiento esperado).
8. **Instalación**: `PWAInstaller` intercepta `beforeinstallprompt` o
   detecta Safari iOS/iPadOS para mostrar la guía manual. Se desactiva en
   modo `standalone` y recuerda el descarte con `coffice-install-dismissed`.

## Datos persistidos

| Clave `localStorage` | Origen | Contenido |
| --- | --- | --- |
| `cafe-inventory-storage` | `useInventoryStore` (`partialize: customProducts`) | Productos custom (nunca se resetea con el pedido) |
| `cafe-active-order` | `useOrderStore` (`partialize: items, dayMarker`) | Carrito del día + fecha del día |
| `coffice-theme` | `App.jsx` | `'light' \| 'dark'` |
| `coffice-layout` | `App.jsx` | `'grid' \| 'list'` |
| `coffice-install-dismissed` | `PWAInstaller.jsx` | Marca de descarte del prompt |

## Estructura del repositorio (alto nivel)

| Ruta | Rol |
| --- | --- |
| `src/` | Código fuente de la PWA (componentes y stores). |
| `public/` | Iconos PWA y assets públicos (`logo.png`, `pwa-*.png`, `pwa-maskable-*.png`, `apple-touch-icon.png`, `favicon-32x32.png`, `assets/icons/*`). |
| `design/logo.png` | Fuente de diseño desde la que se regeneran los iconos. |
| `aspec/` | Cambios y specs del flujo spec-driven (`specs/`, `changes/archive/`). |
| `openspec/` | Cambio OpenSpec original (`cafeteria-pwa-foundation`), legado. |
| `.opencode/` | Agentes, comandos y skills de ancleto (tooling del repo). |
| `.github/workflows/deploy.yml` | Build + deploy a GitHub Pages en `push` a `main`. |
| `dev-dist/` | Artefactos generados por el plugin PWA en modo dev. |
