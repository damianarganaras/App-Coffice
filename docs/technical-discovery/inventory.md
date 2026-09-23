---
node: inventory
kind: inventory
read_when: verificar el alcance documentado de la semilla
generatedAt: 2026-09-23T18:59:06.396Z
pluginVersion: 0.6.31
skillVersion: '2.3'
---

# Alcance documentado

| Alcance | Documento | Motivo |
| --- | --- | --- |
| `src/App.jsx`, `src/main.jsx`, `src/index.css` | `overview.md`, `decisions.md`, `units/pwa-y-despliegue.md` | Entrypoint, layout raíz, navegación y reset diario. |
| `src/components/**` | `overview.md`, `units/_map.md`, `units/almacenamiento-dual.md`, `units/pwa-y-despliegue.md` | Componentes de UI (Header, CatalogView, SummaryView, AddCustomProduct, ConfirmDialog, PWAInstaller). |
| `src/store/**` | `overview.md`, `decisions.md`, `units/almacenamiento-dual.md` | Stores Zustand (inventario y pedido con `dayMarker`) y su `persist` segregado. |
| `vite.config.js`, `index.html`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `package.json` | `setup.md`, `overview.md`, `decisions.md`, `units/pwa-y-despliegue.md` | Build, PWA, manifest, viewport, meta iOS y tooling. |
| `.github/workflows/deploy.yml` | `setup.md`, `units/pwa-y-despliegue.md` | Pipeline de build y deploy a GitHub Pages. |
| `public/**`, `design/logo.png` | `units/pwa-y-despliegue.md`, `overview.md` | Iconos PWA/iOS y assets; fuente de diseño del logo. |
| `aspec/specs/**`, `aspec/changes/archive/**` | `decisions.md`, `unknowns.md`, `units/*.md` | Specs vigentes y changes archivadas que originaron los flujos nuevos. |
| `openspec/changes/cafeteria-pwa-foundation/**` | `unknowns.md`, `overview.md` | Cambio OpenSpec original (legado). |
| `.opencode/**`, `.ancleto/**`, `docs/**` | `inventory.md`, `unknowns.md` | Tooling y documentación del repo; fuera del comportamiento de la app. |
| `.ancletorc`, `.discovery-map.json`, `.gitignore` | `setup.md`, `decisions.md` | Configuración de herramienta y exclusiones. |
| `dev-dist/**` | (no documentado) | Artefactos generados por `vite-plugin-pwa` en dev; se regeneran al compilar. |

> `.gitignore` excluye `/openspec`, `/.opencode`, `/aspec`, `/.ancleto` y
> `/.ancletorc`: esos directorios no se versionan en git, aunque el pack los
> capturó (o los listó) durante la generación.
