---
node: inventory
kind: inventory
read_when: verificar el alcance documentado de la semilla
generatedAt: 2026-09-21T20:25:00.000Z
pluginVersion: 0.6.5
skillVersion: '2.3'
---

# Alcance documentado

| Alcance | Documento | Motivo |
| --- | --- | --- |
| `src/App.jsx`, `src/main.jsx`, `src/index.css` | `overview.md`, `decisions.md`, `units/pwa-y-despliegue.md` | Entrypoint, layout raíz, navegación y reset CSS. |
| `src/components/**` | `overview.md`, `units/_map.md`, `units/pwa-y-despliegue.md` | Componentes de la UI (Header, CatalogView, SummaryView, AddCustomProduct, PWAInstaller). |
| `src/store/**` | `overview.md`, `decisions.md`, `units/almacenamiento-dual.md` | Stores Zustand (inventario y pedido) con `persist` segregado. |
| `vite.config.js`, `index.html`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `package.json` | `setup.md`, `overview.md`, `decisions.md`, `units/pwa-y-despliegue.md` | Configuración de build, PWA, manifest, viewport y tooling. |
| `.github/workflows/deploy.yml` | `setup.md`, `units/pwa-y-despliegue.md` | Pipeline de build y deploy a GitHub Pages. |
| `public/**` | `units/pwa-y-despliegue.md`, `overview.md` | Iconos PWA y assets servidos como static. |
| `openspec/changes/cafeteria-pwa-foundation/**` | `unknowns.md`, `overview.md` | Cambio OpenSpec original (propuesta, diseño, tasks y specs delta). |
| `.ancletorc`, `.discovery-map.json`, `.gitignore` | `setup.md`, `decisions.md` (cuando aplique) | Configuración de herramienta y exclusiones. |
| `dev-dist/**` | (no documentado) | Artefactos generados por `vite-plugin-pwa` en modo dev; se regeneran al compilar. No requieren descripción estable. |

> El directorio `openspec/` está excluido por `.gitignore` (línea 25),
> por lo que sus cambios no se versionan en git; el pack sí los capturó
> en disco durante la generación.
