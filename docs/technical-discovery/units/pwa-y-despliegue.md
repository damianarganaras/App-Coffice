---
node: units/pwa-y-despliegue
kind: dossier
read_when: preguntas sobre la PWA, el service worker, la navegación routerless o el deploy a GitHub Pages
covers: [pwa, service-worker, routerless-navigation, github-pages-deploy, vite-config]
sources: ["vite.config.js", "src/App.jsx", "src/components/PWAInstaller.jsx", ".github/workflows/deploy.yml", "index.html", "tailwind.config.js"]
sourcesSha: eb43dcffdc9b1cee225188841ee41180d0fab8d97bea0ccb0512a9cc2a82eb96
generatedAt: 2026-09-21T20:25:00.000Z
pluginVersion: 0.6.5
skillVersion: '2.3'
---

# PWA sin enrutador y despliegue

## Propósito

Definir cómo Coffice es **instalable como PWA**, cómo se mantiene
funcional **offline**, y cómo se publica en **GitHub Pages** sin router
de React. Este grupo de decisiones concentra la razón por la que el
proyecto adopta Vite + `vite-plugin-pwa` y un esquema de navegación
basado en `view` enum con `history.pushState`/`popstate`.

## Recorrido relevante

```text
Build
  vite.config.js
    ├─ base: '/App-Coffice/'             ← usado por import.meta.env.BASE_URL
    ├─ VitePWA (autoUpdate)              ← autoUpdate hace swap del SW al detectar nueva build
    ├─ workbox.globPatterns              ← cachea js, css, html, ico, png, svg, woff2
    └─ manifest (name, icons relativos)  ← './pwa-192x192.png', './pwa-512x512.png'

Runtime
  index.html → viewport lock, theme-color
    └─ main.jsx → ReactDOM.createRoot → <App/>

  App.jsx
    ├─ useState('catalog' | 'summary') para view
    ├─ history.pushState({ view }, '', '#') en cada switchView
    ├─ popstate → si e.state?.view ⇒ setView, si no ⇒ deja salir (PWA exit)
    ├─ useState('light' | 'dark') ⇒ document.documentElement.classList.toggle('dark')
    ├─ useState('grid' | 'list') ⇒ persiste en 'coffice-layout'
    └─ renderiza CatalogView o SummaryView (no <Routes>)

  PWAInstaller.jsx
    ├─ Si display-mode standalone ⇒ no muestra nada
    ├─ Si iPhone|iPad|iPod + Safari (sin CriOS|FxiOS|OPiOS|mercury) ⇒ modal manual
    ├─ window.beforeinstallprompt ⇒ guarda prompt en ref + muestra botón "Instalar"
    └─ Descartado ⇒ setItem('coffice-install-dismissed', '1')

CI / CD (.github/workflows/deploy.yml)
  push en main
    └─ ubuntu-latest + Node 22
        └─ npm ci && npm run build
            └─ actions/upload-pages-artifact (dist/)
                └─ actions/deploy-pages (GitHub Pages)
```

## Reglas, contratos y riesgos

- **`base` debe coincidir con `start_url` y `scope`** del manifest. Hoy los
  tres dicen `'/App-Coffice/'` (`vite.config.js:6, 24-25`). Cambiar el
  nombre del repositorio exige tocar tres lugares.
- **Iconos y assets usan rutas relativas** (`./pwa-512x512.png`,
  `import.meta.env.BASE_URL + 'assets/icons/...'`). Rutas absolutas
  (`/icon.png`) se rompen por el prefijo `base`. Riesgo
  documentado y aceptado.
- **`autoUpdate`** en `VitePWA`: el SW nuevo toma el control sin
  confirmación al detectar nueva build. Si el comportamiento cambia a
  `prompt`, los usuarios verán versiones viejas hasta recargar.
- **`workbox.globPatterns` limitado**: tipos no listados
  (`woff`, `ttf`, `gif`, `webp`, `json`, etc.) **no** se cachean.
- **`popstate` con `state.view` falsy o null sale de la PWA**: es el
  comportamiento esperado y está guardado por `if (e.state?.view)`.
- **`history.pushState(..., '#')`**: la URL siempre lleva un `#`
  anclado. Cualquier feature nueva que use rutas debe convivir con
  esto.
- **iOS no dispara `beforeinstallprompt`**: la UI de instalación se
  basa en detección de UA. Cambios en navegadores iOS pueden invalidar
  esta heurística.
- **`coffice-install-dismissed` no vence**: una vez descartado, el
  banner no reaparece. Aceptable para una PWA interna.
- **Sin step de "smoke test" post-build** en el workflow: el deploy
  publica directo `dist/`. Si un build rompe assets, el sitio queda
  roto sin alerta automática.

## Paths clave

| Path | Rol |
| --- | --- |
| `vite.config.js` | `base`, plugins, PWA, manifest, globPatterns. |
| `src/App.jsx` | `view` enum, `theme`, `layout`, `popstate`. |
| `src/components/PWAInstaller.jsx` | Manejo de `beforeinstallprompt` y fallback iOS. |
| `index.html` | Viewport lock, `theme-color`, `apple-mobile-web-app-capable`, import al bundle. |
| `tailwind.config.js` | `darkMode: 'class'` y color `dark-bg: '#1e1e2e'`. |
| `src/index.css` | Reset mínimo + tipografía del sistema, sin reglas CSS de tema. |
| `.github/workflows/deploy.yml` | Pipeline de CI/CD hacia GitHub Pages. |
| `public/pwa-192x192.png`, `public/pwa-512x512.png` | Iconos PWA referenciados en el manifest. |
| `dev-dist/` | Artefactos del plugin PWA en dev (regenerados en cada `npm run dev`). |

## Cómo se valida localmente

1. `npm run build` produce `dist/` con `manifest.webmanifest`, el SW y
   rutas prefijadas con `/App-Coffice/`.
2. `npm run preview` sirve el build localmente; las navegaciones entre
   Catálogo y Pedido deben alternar con el botón "atrás" del navegador
   sin cambiar la URL.
3. DevTools → Application → Service Workers confirma la activación
   automática con `autoUpdate`.
4. Probar offline cortando la red tras la primera carga: la app debe
   seguir siendo interactiva desde cache.
