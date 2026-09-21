---
node: units/_map
kind: inventory
read_when: localizar la unidad responsable de un flujo
generatedAt: 2026-09-21T20:25:00.000Z
pluginVersion: 0.6.5
skillVersion: '2.3'
---

# Mapa de unidades

| Unidad | Propósito | Entrada principal | Dossier |
| --- | --- | --- | --- |
| `App` (orquestador) | Mantiene `view`, `theme`, `layout`; enruta sin router usando `history.pushState`/`popstate`. | `src/App.jsx` | `units/pwa-y-despliegue.md` |
| `Header` | Toggles instantáneos de tema, layout y vista; título de la app. | `src/components/Header.jsx` | — |
| `CatalogView` | Renderiza el catálogo en grid o lista; cada tarjeta es un `addItem` con animación. | `src/components/CatalogView.jsx` | — |
| `AddCustomProduct` | Modal/drawer para crear un producto nuevo (ID = `Date.now().toString()`). | `src/components/AddCustomProduct.jsx` | — |
| `SummaryView` | Lista los items con `quantity > 0`, expone `+`/`−`/`🗑️` y "Limpiar Pedido". | `src/components/SummaryView.jsx` | — |
| `PWAInstaller` | Captura `beforeinstallprompt` o detecta iOS/Safari para guiar la instalación. | `src/components/PWAInstaller.jsx` | `units/pwa-y-despliegue.md` |
| `useInventoryStore` | Productos custom + merge con baseline; persiste en `cafe-inventory-storage`. | `src/store/useInventoryStore.js` | `units/almacenamiento-dual.md` |
| `useOrderStore` | Carrito del día (`items: Record<string, number>`); persiste en `cafe-active-order`. | `src/store/useOrderStore.js` | `units/almacenamiento-dual.md` |
| Configuración Vite/PWA | Define `base`, plugin React, plugin PWA, manifest y `workbox.globPatterns`. | `vite.config.js` | `units/pwa-y-despliegue.md` |
| Workflow de despliegue | Build + upload + deploy a GitHub Pages en `push` a `main`. | `.github/workflows/deploy.yml` | `units/pwa-y-despliegue.md` |
| Cambio OpenSpec original | Propuesta, diseño, tasks y specs delta que dieron origen al proyecto. | `openspec/changes/cafeteria-pwa-foundation/` | — |

> Las unidades marcadas con **—** no tienen dossier propio porque el
> pack global no aporta evidencia adicional que justifique uno. Se
> entienden leyéndolas directamente desde los paths listados.
