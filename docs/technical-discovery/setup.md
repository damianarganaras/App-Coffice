---
node: setup
kind: setup
read_when: preparar el entorno o ejecutar los comandos principales
generatedAt: 2026-09-21T20:25:00.000Z
pluginVersion: 0.6.5
skillVersion: '2.3'
---

# Setup

## Comandos principales

| Objetivo | Comando | Fuente |
| --- | --- | --- |
| Instalar dependencias | `npm install` | `package.json` |
| Levantar dev server con HMR y service worker de dev | `npm run dev` | `package.json` |
| Compilar producción (genera `dist/` con SW y manifest) | `npm run build` | `package.json`, `vite.config.js` |
| Servir el build local | `npm run preview` | `package.json` |
| Desplegar a GitHub Pages | Workflow `Deploy to GitHub Pages` (`.github/workflows/deploy.yml`) — `npm ci && npm run build` sobre Node 22 y `actions/upload-pages-artifact` + `actions/deploy-pages` | `.github/workflows/deploy.yml` |

## Requisitos previos

- Node 22 (lo fija `actions/setup-node@v4` en el workflow de deploy).
- No requiere backend, ni claves, ni servicios externos: el build es 100 %
  del lado cliente.

## Entornos y variables

La aplicación **no declara variables de entorno** en el código fuente ni
utiliza `.env`. Lo único sensible al entorno es:

| Nombre | Propósito | Fuente |
| --- | --- | --- |
| `import.meta.env.BASE_URL` | Prefijo de rutas para iconos (`assets/icons/*`) — se completa desde `vite.config.js` con `base: '/App-Coffice/'`. | `vite.config.js`, `src/components/CatalogView.jsx`, `src/components/SummaryView.jsx` |
| `coffice-theme` (`localStorage`) | Tema persistido (`'light' \| 'dark'`). | `src/App.jsx` |
| `coffice-layout` (`localStorage`) | Layout persistido (`'grid' \| 'list'`). | `src/App.jsx` |
| `coffice-install-dismissed` (`localStorage`) | Marca de descarte del prompt de instalación PWA. | `src/components/PWAInstaller.jsx` |
| `cafe-inventory-storage` (`localStorage`) | Productos custom persistidos por Zustand `persist`. | `src/store/useInventoryStore.js` |
| `cafe-active-order` (`localStorage`) | Carrito persistido por Zustand `persist`. | `src/store/useOrderStore.js` |

No hay archivos `.env`, `.env.local` ni credenciales en el repositorio.

## Convenciones operativas

- **Iconos PWA**: deben usar **rutas relativas** (`./pwa-192x192.png`) en el
  manifest para sobrevivir al `base` de GitHub Pages (verificado en
  `vite.config.js`).
- **`base` de Vite** está fijado a `/App-Coffice/`. Si el repositorio se
  renombra, debe cambiarse también este valor y la `start_url`/`scope` del
  manifest.
- **`registerType: 'autoUpdate'`** en `VitePWA` reemplaza el Service Worker
  sin pedir confirmación al usuario (declarado y observado).
- **`workbox.globPatterns`** cubre `js, css, html, ico, png, svg, woff2`;
  cualquier nuevo tipo de asset debe agregarse allí para ser cacheado.
