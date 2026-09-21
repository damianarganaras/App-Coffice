---
node: index
kind: router
read_when: primer punto de entrada para cualquier pregunta sobre el repositorio
generatedAt: 2026-09-21T20:25:00.000Z
pluginVersion: 0.6.5
skillVersion: '2.3'
---

# Índice de la semilla técnica

Esta semilla describe **Coffice**, una PWA cliente para tomar pedidos en una
cafetería de oficina. Está construida con Vite + React + Zustand + Tailwind +
Framer Motion y se publica en GitHub Pages como sitio estático.

## ¿Qué buscás?

| Pregunta típica | Documento a abrir |
| --- | --- |
| ¿Qué hace la app y cómo está compuesta? | `overview.md` |
| ¿Cómo se levanta, compila y publica? | `setup.md` |
| ¿Por qué se eligieron estas tecnologías y reglas? | `decisions.md` |
| ¿Qué sistemas externos toca? | `integrations.md` |
| ¿Dónde está el carrito, el catálogo o el instalador? | `units/_map.md` |
| ¿Qué partes del repo están documentadas y cuáles no? | `inventory.md` |
| ¿Qué no pude verificar al generar la semilla? | `unknowns.md` |

## Recorridos sugeridos

- **Onboarding del proyecto**: `overview.md` → `setup.md` →
  `units/almacenamiento-dual.md` → `decisions.md`.
- **Modificar el catálogo o el carrito**: `overview.md` → `units/_map.md` →
  `units/almacenamiento-dual.md`.
- **Cambiar el deploy o la PWA**: `setup.md` → `decisions.md` →
  `units/pwa-y-despliegue.md`.
- **Saber qué falta documentar**: `unknowns.md` y `inventory.md`.
