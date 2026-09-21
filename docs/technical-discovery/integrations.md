---
node: integrations
kind: integrations
read_when: preguntas sobre sistemas externos y dependencias observables
generatedAt: 2026-09-21T20:25:00.000Z
pluginVersion: 0.6.5
skillVersion: '2.3'
---

# Integraciones y dependencias observables

La aplicación **no realiza llamadas a APIs externas**: no hay `fetch`,
clientes HTTP, WebSockets ni SDKs de terceros en runtime más allá del
Service Worker y el prompt PWA del navegador.

## Dependencias externas

| Tipo | Origen / qué hace | Evidencia |
| --- | --- | --- |
| CDN de iconos y assets PWA | Servidos como archivos estáticos del propio build (`public/`). | `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/assets/icons/*.png` |
| Service Worker del navegador | Workbox inyectado por `vite-plugin-pwa`. Solo cachea assets locales. | `vite.config.js:9-31` |
| Prompt `beforeinstallprompt` (Chrome/Android) | API del navegador, sin intermediarios. | `src/components/PWAInstaller.jsx:37-46` |
| User-agent parsing para iOS/Safari | API `navigator.userAgent`, sin librería externa. | `src/components/PWAInstaller.jsx:27-30` |
| LocalStorage del navegador | Persistencia Zustand (`persist` middleware) + 3 claves manuales. | `src/store/useOrderStore.js:42-45`, `src/store/useInventoryStore.js:48-51`, `src/App.jsx:22-27`, `src/components/PWAInstaller.jsx:14` |

## Hosting y CI/CD

| Proveedor | Uso | Referencia |
| --- | --- | --- |
| GitHub Pages | Hospeda el `dist/` resultante del build como sitio estático bajo `/App-Coffice/`. | `.github/workflows/deploy.yml`, `vite.config.js` |
| GitHub Actions | Build + upload artifact + deploy automático en `push` a `main`. | `.github/workflows/deploy.yml` |
| `actions/setup-node@v4` | Fija Node 22 en el runner. | `.github/workflows/deploy.yml:23-27` |
| `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4` | Publicación oficial en Pages. | `.github/workflows/deploy.yml:34-40` |

El workflow declara `permissions: contents: read, pages: write, id-token:
write` y usa `concurrency: pages` con `cancel-in-progress: true`.

## Dependencias privadas o internas

- **No hay** módulos `@scope/*` ni imports desde repos privados
  (`package.json` solo lista paquetes públicos en `npm`).
- **No hay** archivos `.env`, `.npmrc` con tokens ni secretos en el
  repositorio (ver `setup.md`).

## Contratos observables hacia afuera

| Contrato | Cliente | Implementación |
| --- | --- | --- |
| `manifest.webmanifest` | Navegador (instalación PWA). | Generado por `VitePWA` desde `vite.config.js:17-30` con `name`, `short_name`, `theme_color`, `background_color`, `display: standalone`, `start_url`, `scope` e `icons`. |
| Service Worker (`registerSW.js`, `sw.js`, `workbox-*.js`) | Navegador. | Emitidos por el plugin PWA. `dev-dist/` contiene copias generadas en dev (no se distribuyen en producción, las regenera el build). |
| Cache-First sobre `js, css, html, ico, png, svg, woff2` | Navegador offline. | `vite.config.js:14-16`. |

## Ausencias relevantes

- **Sin backend ni API HTTP**: no hay URL base, ni `fetch`, ni cliente
  GraphQL/REST. Toda la persistencia es local del navegador.
- **Sin telemetría ni analytics**: no se observa Google Analytics, Sentry,
  ni equivalentes. El manifest tampoco declara `gcm_sender_id` ni claves
  opcionales.
- **Sin autenticación**: no hay OAuth, SSO ni tokens; el cambio OpenSpec
  lo declara explícitamente como no-objetivo.
