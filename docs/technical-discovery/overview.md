---
node: overview
kind: overview
read_when: entender el propósito, la arquitectura y el recorrido principal
generatedAt: 2026-09-21T20:25:00.000Z
pluginVersion: 0.6.5
skillVersion: '2.3'
---

# Visión general

## Propósito

`Coffice` es una **PWA cliente** pensada para tomar pedidos de cafetería
desde el móvil en una oficina, sin backend ni cuentas: el operador toca
productos del catálogo, revisa el resumen y vacía el carrito al terminar.
Funciona offline (Service Worker con estrategia Cache-First) y se publica
en **GitHub Pages** como sitio estático.

## Stack

| Capa | Tecnología | Fuente |
| --- | --- | --- |
| Build / dev server | Vite 5 + `@vitejs/plugin-react` 4 | `package.json`, `vite.config.js` |
| UI | React 18 + Tailwind 3 (`darkMode: 'class'`) | `tailwind.config.js`, `src/index.css` |
| Estado | Zustand 5 con `persist` (localStorage) | `src/store/use*.js` |
| Animación | Framer Motion 11 | `src/components/*.jsx` |
| PWA / offline | `vite-plugin-pwa` 0.20 + Workbox | `vite.config.js` |
| Despliegue | GitHub Actions + GitHub Pages | `.github/workflows/deploy.yml` |
| Lenguaje | JavaScript (ESM) con `tsconfig.json` solo de tipo | `tsconfig.json` |

## Arquitectura

Coffice no es una SPA con router: **no usa `react-router`** (GitHub Pages
devolvería 404 en recargas profundas). Toda la navegación se reduce a un
string-enum en `useState` y a `history.pushState`/`popstate` para que el
botón "atrás" del navegador cambie entre Catálogo y Pedido.

```text
main.jsx
  └─ App.jsx               ← estado de vista, tema y layout
       ├─ Header.jsx       ← toggles de tema, layout y vista
       ├─ PWAInstaller.jsx ← prompt de instalación (Chrome/Android + iOS)
       ├─ CatalogView.jsx  ← grid o lista de productos (tap = añadir)
       │    └─ ProductCard (interno, animado con Framer Motion)
       │    └─ AddCustomProduct.jsx ← modal para crear producto custom
       └─ SummaryView.jsx  ← filas con +/-/🗑️ + "Limpiar Pedido"

Estado global (Zustand persist):
  - useInventoryStore → clave "cafe-inventory-storage" (productos custom)
  - useOrderStore     → clave "cafe-active-order"     (carrito del día)
```

Cada store persiste solo lo necesario mediante `partialize`, lo que impide
que `clearOrder()` toque el inventario accidentalmente.

## Recorrido del usuario (declarado y observado)

1. **Carga inicial**: `index.html` sirve `src/main.jsx`, que monta `<App/>`
   en `#root`. `App.jsx` lee `localStorage` para `coffice-theme` y
   `coffice-layout`, y aplica la clase `dark` a `<html>` si corresponde.
2. **Catálogo**: `CatalogView` une los 8 productos base (`BASELINE_PRODUCTS`
   en `src/store/useInventoryStore.js`) con los productos custom del store
   persistente. Cada toque llama a `useOrderStore.addItem(id)`, que
   incrementa `items[id]` en `localStorage`.
3. **Cambio a Pedido**: el botón del `Header` empuja
   `history.pushState({ view: 'summary' }, '', '#')` y renderiza
   `SummaryView`.
4. **Edición del pedido**: `SummaryView` filtra `items` con `quantity > 0`
   y expone `[+]` (`addItem`), `[−]` (`removeItem` elimina la entrada al
   llegar a 0) y `[🗑️]` (`deleteItem`).
5. **Vaciar pedido**: el botón "Limpiar Pedido" llama a
   `useOrderStore.clearOrder()`, que vuelve `items` a `{}`. No toca el
   inventario.
6. **Botón "atrás"**: `popstate` lee `e.state?.view` y restaura la vista.
   Sin estado, sale de la PWA (comportamiento esperado).
7. **Instalación**: `PWAInstaller` registra `beforeinstallprompt` o detecta
   iOS/Safari para mostrar instrucciones manuales. Se desactiva en modo
   `standalone` y recuerda el descarte con `coffice-install-dismissed`.

## Datos persistidos

| Clave `localStorage` | Origen | Sobrevive a `clearOrder` |
| --- | --- | --- |
| `cafe-inventory-storage` | `useInventoryStore` (`partialize: customProducts`) | Sí |
| `cafe-active-order` | `useOrderStore` (`partialize: items`) | No (es su objetivo) |
| `coffice-theme` | `App.jsx` | Sí |
| `coffice-layout` | `App.jsx` | Sí |
| `coffice-install-dismissed` | `PWAInstaller.jsx` | Sí |

## Estructura del repositorio (alto nivel)

| Ruta | Rol |
| --- | --- |
| `src/` | Código fuente de la PWA (componentes y stores). |
| `public/` | Iconos PWA y assets públicos (`pwa-192x192.png`, `pwa-512x512.png`, `assets/icons/*`). |
| `openspec/changes/cafeteria-pwa-foundation/` | Cambio OpenSpec original (propuesta, diseño, tasks y specs). |
| `.github/workflows/deploy.yml` | Build + deploy a GitHub Pages en `push` a `main`. |
| `dev-dist/` | Artefactos generados por el plugin PWA en modo dev (ignorados por la app en runtime). |
