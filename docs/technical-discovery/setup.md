---
node: setup
kind: setup
read_when: preparar el entorno o ejecutar los comandos principales
generatedAt: 2026-09-23T18:59:06.396Z
pluginVersion: 0.6.31
skillVersion: '2.3'
---

# Setup

## Comandos principales

| Objetivo | Comando | Fuente |
| --- | --- | --- |
| Instalar dependencias | `npm install` | `package.json` |
| Levantar dev server con HMR y service worker de dev | `npm run dev` | `package.json`, `vite.config.js` (`devOptions.enabled: true`) |
| Compilar producción (genera `dist/` con SW y manifest) | `npm run build` | `package.json`, `vite.config.js` |
| Servir el build local | `npm run preview` | `package.json` |
| Desplegar a GitHub Pages | Workflow `Deploy to GitHub Pages` (`.github/workflows/deploy.yml`): `npm ci && npm run build` sobre Node 22 + `actions/upload-pages-artifact` + `actions/deploy-pages` | `.github/workflows/deploy.yml` |

No hay scripts de `lint` ni `test` en `package.json`.

## Requisitos previos

- Node 22 (lo fija `actions/setup-node@v4` en el workflow de deploy).
- No requiere backend, ni claves, ni servicios externos: el build es 100 %
  del lado cliente.

## Entornos y variables

La aplicación **no declara variables de entorno** en el código fuente ni
utiliza archivos `.env`. Lo único sensible al entorno es:

| Nombre | Propósito | Fuente |
| --- | --- | --- |
| `import.meta.env.BASE_URL` | Prefijo de rutas para iconos de producto (`assets/icons/*`). Se completa desde `vite.config.js` con `base: '/App-Coffice/'`. | `vite.config.js`, `src/components/CatalogView.jsx`, `src/components/SummaryView.jsx` |
| `coffice-theme` (`localStorage`) | Tema persistido (`'light' \| 'dark'`). | `src/App.jsx` |
| `coffice-layout` (`localStorage`) | Layout persistido (`'grid' \| 'list'`). | `src/App.jsx` |
| `coffice-install-dismissed` (`localStorage`) | Marca de descarte del prompt de instalación PWA. | `src/components/PWAInstaller.jsx` |
| `cafe-inventory-storage` (`localStorage`) | Productos custom persistidos por Zustand `persist`. | `src/store/useInventoryStore.js` |
| `cafe-active-order` (`localStorage`) | Carrito persistido (`items`) más `dayMarker` (fecha `YYYY-MM-DD` local). | `src/store/useOrderStore.js` |

No hay archivos `.env`, `.env.local` ni credenciales en el repositorio.

## Convenciones operativas

- **Iconos PWA**: deben usar **rutas relativas** (`./pwa-192x192.png`) en el
  manifest, y `%BASE_URL%` / `import.meta.env.BASE_URL` en el HTML y en los
  componentes, para sobrevivir al `base` de GitHub Pages.
- **`base` de Vite** está fijado a `/App-Coffice/`. Si el repositorio se
  renombra, deben cambiarse `base`, `start_url`, `scope`, `manifest.id`
  (`vite.config.js`) y las rutas del manifest.
- **`registerType: 'autoUpdate'`** en `VitePWA` reemplaza el Service Worker
  sin pedir confirmación al usuario.
- **`workbox.globPatterns`** cubre `js, css, html, ico, png, svg, woff2`;
  cualquier nuevo tipo de asset debe agregarse allí para ser cacheado.
- **El manifest se emite como `manifest.json`** (`manifestFilename:
  'manifest.json'` en `vite.config.js`).
- **Iconos**: `public/logo.png` es la fuente; los `pwa-*.png` y
  `pwa-maskable-*.png` se derivan de él. Regenerarlos con herramientas que
  produzcan PNG válidos y decodificables (ver `decisions.md`).
