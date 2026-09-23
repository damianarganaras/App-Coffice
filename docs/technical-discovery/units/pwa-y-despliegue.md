---
node: units/pwa-y-despliegue
kind: dossier
read_when: preguntas sobre la PWA, el service worker, los iconos, la navegación routerless o el deploy a GitHub Pages
covers: [pwa, service-worker, install-prompt, maskable-icons, routerless-navigation, github-pages-deploy, vite-config]
sources: ["vite.config.js", "src/App.jsx", "src/components/PWAInstaller.jsx", ".github/workflows/deploy.yml", "index.html", "tailwind.config.js"]
sourcesSha: c5b1a175b5ad8a6786aed0175337ef2b0aa20ebfec66641134ecb0726b42b787
generatedAt: 2026-09-23T18:59:06.396Z
pluginVersion: 0.6.31
skillVersion: '2.3'
---

# PWA sin enrutador y despliegue

## Propósito

Definir cómo Coffice es **instalable como PWA** (Android/Chrome, Samsung
Internet, Safari iOS/iPadOS), cómo se mantiene funcional **offline**, y cómo
se publica en **GitHub Pages** sin router de React. Concentra la
configuración de Vite + `vite-plugin-pwa`, el esquema de navegación `view`
enum y la metadata de instalación.

## Recorrido relevante

```text
Build
  vite.config.js
    ├─ base: '/App-Coffice/'                  ← usado por import.meta.env.BASE_URL
    ├─ VitePWA (registerType: 'autoUpdate')
    ├─ manifestFilename: 'manifest.json'
    ├─ devOptions.enabled: true               ← SW activo en dev
    ├─ workbox.globPatterns                   ← js, css, html, ico, png, svg, woff2
    └─ manifest
         ├─ id / start_url / scope = '/App-Coffice/'
         ├─ lang: 'es', display: 'standalone'
         └─ icons: any 192/512 + maskable 192/512 (./ relativo)

Runtime
  index.html → viewport lock, theme-color, favicon, apple-touch-icon, meta iOS
    └─ main.jsx → ReactDOM.createRoot → <App/> (StrictMode)

  App.jsx
    ├─ useState('catalog' | 'summary') para view
    ├─ history.pushState({ view }, '', '#') en cada switchView
    ├─ popstate → si e.state?.view ⇒ setView, si no ⇒ deja salir (PWA exit)
    ├─ visibilitychange (visible) ⇒ checkAndAutoReset()
    ├─ useState('light' | 'dark') ⇒ document.documentElement.classList.toggle('dark')
    └─ useState('grid' | 'list') ⇒ persiste en 'coffice-layout'

  PWAInstaller.jsx
    ├─ Si 'coffice-install-dismissed' ⇒ no muestra nada
    ├─ Si display-mode standalone ⇒ no muestra nada
    ├─ Si iPadOS (Macintosh + maxTouchPoints > 1) o iPhone/iPad/iPod Safari ⇒ modal manual
    ├─ window.beforeinstallprompt ⇒ guarda prompt en ref + banner "Instalá la app"
    └─ Aceptado o descartado ⇒ setItem('coffice-install-dismissed', '1')

CI / CD (.github/workflows/deploy.yml)
  push en main → ubuntu-latest + Node 22 → npm ci && npm run build
    └─ actions/upload-pages-artifact (dist/) → actions/deploy-pages
```

## Reglas, contratos y riesgos

- **`base`, `start_url`, `scope` e `id` deben coincidir** en
  `/App-Coffice/`. Hoy son cuatro lugares en `vite.config.js`; renombrar el
  repo exige tocar los cuatro.
- **Iconos en rutas relativas** (`./pwa-512x512.png`) y assets vía
  `import.meta.env.BASE_URL`. Rutas absolutas se rompen por el prefijo
  `base`.
- **Manifest emitido como `manifest.json`** con `lang: 'es'` y `id` dentro
  del scope. Un `Content-Type` incorrecto en Pages impediría el parseo
  (pendiente de verificación, ver `unknowns.md`).
- **Iconos `maskable` dedicados** (`pwa-maskable-192x192.png`,
  `pwa-maskable-512x512.png`) para el icono adaptativo de Android.
- **`apple-touch-icon` opaco** referenciado desde `index.html`, más
  `apple-mobile-web-app-title: Coffice` para el nombre bajo el icono iOS.
- **Detección iPadOS** por UA `Macintosh` + `navigator.maxTouchPoints > 1`;
  una Mac de escritorio (`maxTouchPoints === 0`) no debe mostrar la guía.
- **`autoUpdate`** en `VitePWA`: el SW nuevo toma el control sin
  confirmación al detectar nueva build.
- **`workbox.globPatterns` limitado**: tipos no listados (`woff`, `ttf`,
  `gif`, `webp`, `json`, etc.) **no** se cachean.
- **`popstate` con `state.view` falsy o null sale de la PWA**: comportamiento
  esperado, guardado por `if (e.state?.view)`.
- **`history.pushState(..., '#')`**: la URL siempre lleva un `#` anclado.
- **Sin step de smoke test post-build**: el deploy publica `dist/` directo.

## Paths clave

| Path | Rol |
| --- | --- |
| `vite.config.js` | `base`, plugins, PWA, `manifestFilename`, manifest (4 iconos), globPatterns. |
| `src/App.jsx` | `view` enum, `theme`, `layout`, `popstate`, auto-reset en foco. |
| `src/components/PWAInstaller.jsx` | `beforeinstallprompt`, detección iOS/iPadOS y descarte. |
| `index.html` | Viewport lock, `theme-color`, favicon, `apple-touch-icon`, meta iOS, import al bundle. |
| `tailwind.config.js` | `darkMode: 'class'` y color `dark-bg: '#1e1e2e'`. |
| `.github/workflows/deploy.yml` | Pipeline de CI/CD hacia GitHub Pages. |
| `public/logo.png` | Fuente de la que derivan los iconos. |
| `public/pwa-*.png`, `public/pwa-maskable-*.png`, `public/apple-touch-icon.png`, `public/favicon-32x32.png` | Iconos PWA/iOS declarados. |
| `design/logo.png` | Asset de diseño (fuente del logo). |
| `dev-dist/` | Artefactos del plugin PWA en dev (regenerados en cada `npm run dev`). |

## Cómo se valida localmente

1. `npm run build` produce `dist/` con `manifest.json`, el SW y rutas
   prefijadas con `/App-Coffice/`.
2. `npm run preview` sirve el build localmente; las navegaciones entre
   Catálogo y Pedido deben alternar con el botón "atrás" sin cambiar la URL.
3. DevTools → Application → Manifest confirma `id`, `lang`, iconos
   `any`/`maskable` y ausencia de errores de instalabilidad.
4. Probar offline cortando la red tras la primera carga.
