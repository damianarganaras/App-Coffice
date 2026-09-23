---
node: index
kind: router
read_when: primer punto de entrada para cualquier pregunta sobre el repositorio
generatedAt: 2026-09-23T18:59:06.396Z
pluginVersion: 0.6.31
skillVersion: '2.3'
---

# Índice de la semilla técnica

Esta semilla describe **Coffice**, una PWA cliente para tomar pedidos en una
cafetería de oficina. Stack: Vite 5 + React 18 + Zustand 5 + Tailwind 3 +
Framer Motion 11; se publica en **GitHub Pages** como sitio estático bajo el
prefijo `/App-Coffice/`. No tiene backend ni cuentas.

## ¿Qué buscás?

| Pregunta típica | Documento a abrir |
| --- | --- |
| ¿Qué hace la app y cómo está compuesta? | `overview.md` |
| ¿Cómo se levanta, compila y publica? | `setup.md` |
| ¿Por qué se eligieron estas tecnologías y reglas? | `decisions.md` |
| ¿Qué sistemas externos toca? | `integrations.md` |
| ¿Dónde está el carrito, el catálogo o el reset diario? | `units/_map.md` |
| ¿Qué partes del repo están documentadas y cuáles no? | `inventory.md` |
| ¿Qué no se pudo verificar al generar la semilla? | `unknowns.md` |

## Recorridos sugeridos

- **Onboarding del proyecto**: `overview.md` → `setup.md` →
  `units/almacenamiento-dual.md` → `decisions.md`.
- **Tocar el pedido, el reset o el catálogo**: `overview.md` →
  `units/_map.md` → `units/almacenamiento-dual.md`.
- **Cambiar la PWA, los iconos o el deploy**: `setup.md` →
  `units/pwa-y-despliegue.md` → `decisions.md`.
- **Saber qué falta documentar**: `unknowns.md` y `inventory.md`.
