---
node: units/_map
kind: inventory
read_when: localizar la unidad responsable de un flujo
generatedAt: 2026-09-23T18:59:06.396Z
pluginVersion: 0.6.31
skillVersion: '2.3'
---

# Mapa de unidades

| Unidad | Propósito | Entrada principal | Dossier |
| --- | --- | --- | --- |
| `App` (orquestador) | Mantiene `view`, `theme`, `layout`; enruta sin router con `history.pushState`/`popstate`; dispara el auto-reset diario al volver a foco. | `src/App.jsx` | `units/pwa-y-despliegue.md` |
| `Header` | Toggles instantáneos de tema, layout y vista; título y badge de conteo de pedido (`99+` como tope). | `src/components/Header.jsx` | — |
| `CatalogView` | Renderiza el catálogo en grid o lista; cada tarjeta es un `addItem`; botón "Limpiar Pedido (N)" con confirmación. | `src/components/CatalogView.jsx` | `units/almacenamiento-dual.md` |
| `AddCustomProduct` | Modal para crear un producto nuevo (ID = `Date.now().toString()`). | `src/components/AddCustomProduct.jsx` | — |
| `SummaryView` | Lista los items con `quantity > 0`, expone `+`/`−`/`🗑️` y "Limpiar Pedido" con confirmación + vuelta al catálogo. | `src/components/SummaryView.jsx` | `units/almacenamiento-dual.md` |
| `ConfirmDialog` | Diálogo de confirmación accesible (`role=dialog`, focus trap, `Escape`). | `src/components/ConfirmDialog.jsx` | `units/almacenamiento-dual.md` |
| `PWAInstaller` | Banner `beforeinstallprompt` (Android/Chrome) y guía manual iOS/iPadOS; recuerda el descarte. | `src/components/PWAInstaller.jsx` | `units/pwa-y-despliegue.md` |
| `useInventoryStore` | Productos custom + merge con baseline; persiste en `cafe-inventory-storage`. | `src/store/useInventoryStore.js` | `units/almacenamiento-dual.md` |
| `useOrderStore` | Carrito del día (`items`) + `dayMarker`; reset manual y auto-reset diario. Persiste en `cafe-active-order`. | `src/store/useOrderStore.js` | `units/almacenamiento-dual.md` |
| Configuración Vite/PWA | Define `base`, plugin React, plugin PWA, `manifestFilename`, manifest (4 iconos) y `workbox.globPatterns`. | `vite.config.js` | `units/pwa-y-despliegue.md` |
| Workflow de despliegue | Build + upload + deploy a GitHub Pages en `push` a `main`. | `.github/workflows/deploy.yml` | `units/pwa-y-despliegue.md` |
| Specs y cambios (`aspec/`) | Specs vigentes (`reset-order`, `pwa-instalable`) y changes archivadas que originaron los flujos nuevos. | `aspec/specs/`, `aspec/changes/archive/` | — |
| Cambio OpenSpec original | Propuesta, diseño, tasks y specs delta que dieron origen al proyecto (legado). | `openspec/changes/cafeteria-pwa-foundation/` | — |

> Las unidades marcadas con **—** no tienen dossier propio porque el pack
> global no aporta evidencia adicional que justifique uno. Se entienden
> leyéndolas directamente desde los paths listados.
