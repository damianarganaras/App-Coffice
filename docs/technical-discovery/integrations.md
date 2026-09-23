---
node: integrations
kind: integrations
read_when: preguntas sobre sistemas externos y dependencias observables
generatedAt: 2026-09-23T18:59:06.396Z
pluginVersion: 0.6.31
skillVersion: '2.3'
---

# Integraciones y dependencias observables

La aplicación **no realiza llamadas a APIs externas**: no hay `fetch`,
clientes HTTP, WebSockets ni SDKs de terceros en runtime más allá del
Service Worker y de las APIs PWA del navegador.

## Dependencias externas

| Tipo | Origen / qué hace | Evidencia |
| --- | --- | --- |
| Assets estáticos PWA | Servidos como archivos del propio build (`public/`). | `public/logo.png`, `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/pwa-maskable-*.png`, `public/apple-touch-icon.png`, `public/favicon-32x32.png`, `public/assets/icons/*.png` |
| Service Worker del navegador | Workbox inyectado por `vite-plugin-pwa`. Precaches assets locales. | `vite.config.js`, `dev-dist/sw.js`, `dev-dist/workbox-7e5eb42b.js` |
| Prompt `beforeinstallprompt` (Chrome/Android) | API del navegador, sin intermediarios. | `src/components/PWAInstaller.jsx` |
| User-agent parsing para iOS/iPadOS | APIs `navigator.userAgent` y `navigator.maxTouchPoints`, sin librería externa. | `src/components/PWAInstaller.jsx` |
| LocalStorage del navegador | Persistencia Zustand (`persist` middleware) + 3 claves manuales. | `src/store/useOrderStore.js`, `src/store/useInventoryStore.js`, `src/App.jsx`, `src/components/PWAInstaller.jsx` |

## Hosting y CI/CD

| Proveedor | Uso | Referencia |
| --- | --- | --- |
| GitHub Pages | Hospeda el `dist/` del build como sitio estático bajo `/App-Coffice/`. | `.github/workflows/deploy.yml`, `vite.config.js` |
| GitHub Actions | Build + upload artifact + deploy automático en `push` a `main`. | `.github/workflows/deploy.yml` |
| `actions/setup-node@v4` | Fija Node 22 en el runner. | `.github/workflows/deploy.yml` |
| `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4` | Publicación oficial en Pages. | `.github/workflows/deploy.yml` |

El workflow declara `permissions: contents: read, pages: write, id-token:
write` y usa `concurrency: pages` con `cancel-in-progress: true`.

## Dependencias privadas o internas

- **No hay** módulos `@scope/*` ni imports desde repos privados
  (`package.json` solo lista paquetes públicos de `npm`).
- **No hay** archivos `.env` ni `.npmrc` con tokens. Ver `setup.md`.
- El tooling del repo (`.opencode/` con agentes/skills de ancleto y `aspec/`)
  es local y está excluido por `.gitignore`; no es una dependencia de runtime.

## Contratos observables hacia afuera

| Contrato | Cliente | Implementación |
| --- | --- | --- |
| `manifest.json` | Navegador (instalación PWA). | Generado por `VitePWA` desde `vite.config.js` con `id`, `name`, `short_name`, `description`, `lang: 'es'`, `theme_color`, `background_color`, `display: standalone`, `start_url`, `scope` y 4 iconos (`any` + `maskable`). |
| Service Worker (`registerSW.js`, `sw.js`, `workbox-*.js`) | Navegador. | Emitidos por el plugin PWA. `dev-dist/` contiene copias generadas en dev (no se distribuyen en producción, las regenera el build). |
| Precaches sobre `js, css, html, ico, png, svg, woff2` | Navegador offline. | `vite.config.js`. |
| Metadatos iOS en el documento | Safari iOS/iPadOS. | `index.html`: `apple-touch-icon`, `apple-mobile-web-app-title`, `apple-mobile-web-app-capable`, `mobile-web-app-capable`. |

## Ausencias relevantes

- **Sin backend ni API HTTP**: no hay URL base, ni `fetch`, ni cliente
  GraphQL/REST. Toda la persistencia es local del navegador.
- **Sin telemetría ni analytics**: no se observa Google Analytics, Sentry ni
  equivalentes.
- **Sin autenticación**: no hay OAuth, SSO ni tokens.
- **Sin servicio de tiempo (NTP)**: el auto-reset diario usa solo el reloj
  local del dispositivo (declarado fuera de scope en
  `aspec/specs/reset-order/spec.md`).
