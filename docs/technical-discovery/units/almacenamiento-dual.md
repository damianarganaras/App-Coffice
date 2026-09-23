---
node: units/almacenamiento-dual
kind: dossier
read_when: preguntas sobre el carrito, el catálogo, el reset manual/diario o la separación entre inventario y pedido
covers: [order-state, inventory-state, localStorage, zustand-persist, baseline-products, reset-order, confirm-dialog]
sources: ["src/store/useInventoryStore.js", "src/store/useOrderStore.js", "src/App.jsx", "src/components/CatalogView.jsx", "src/components/SummaryView.jsx", "src/components/AddCustomProduct.jsx", "src/components/ConfirmDialog.jsx"]
sourcesSha: c5b1a175b5ad8a6786aed0175337ef2b0aa20ebfec66641134ecb0726b42b787
generatedAt: 2026-09-23T18:59:06.396Z
pluginVersion: 0.6.31
skillVersion: '2.3'
---

# Almacenamiento dual (inventario y pedido)

## Propósito

Definir y separar el **estado de catálogo** del **estado de pedido** del
día, de modo que limpiar el pedido jamás toque al catálogo, y viceversa.
Coffice no tiene backend: la única fuente de verdad durable es el
`localStorage` del navegador. El pedido se limpia por acción explícita
(con confirmación) o automáticamente al cambiar el día.

## Recorrido relevante

```text
Agregar producto custom
  AddCustomProduct.jsx → useInventoryStore.addCustomProduct(name)
    └─ valida name.trim() no vacío
    └─ crea { id: Date.now().toString(), name, category: 'custom' }
    └─ persist (cafe-inventory-storage) con partialize: customProducts

Tocar producto del catálogo
  CatalogView.ProductCard.onTap → useOrderStore.addItem(id)
    └─ set(items: { ...prev, [id]: (prev[id] || 0) + 1 })

Editar pedido (SummaryView)
    ├─ [ + ]   → useOrderStore.addItem(id)
    ├─ [ − ]   → useOrderStore.removeItem(id)   (al llegar a ≤1 elimina la clave)
    ├─ [ 🗑️ ] → useOrderStore.deleteItem(id)
    └─ [ Limpiar Pedido ] → abre ConfirmDialog

Reset manual (confirmado)
  CatalogView  → clearOrder()                     (permanece en Catálogo)
  SummaryView  → clearOrder() + onBack()          (vuelve al Catálogo)
    └─ clearOrder() → resetOrder() → set({ items: {}, dayMarker: todayISO() })

Auto-reset diario
  App.jsx visibilitychange (visible) → checkAndAutoReset()
  useOrderStore.onRehydrateStorage   → misma comparación al hidratar
    └─ dayMarker == null  ⇒ solo set({ dayMarker: hoy }), conserva items
    └─ dayMarker !== hoy  ⇒ set({ items: {}, dayMarker: hoy }) en silencio
```

## Reglas, contratos y riesgos

- **Contrato de claves**: `cafe-inventory-storage` solo contiene
  `customProducts`; `cafe-active-order` contiene `items` **y** `dayMarker`
  (`partialize` en ambos stores). `dayMarker` es `YYYY-MM-DD` en hora local.
- **`clearOrder()` no toca el inventario**: delega en `resetOrder()`, que
  solo escribe el estado del pedido. No hay path de código que cruce stores.
- **`checkAndAutoReset()` es idempotente**: si `dayMarker === hoy` no hace
  nada; si es `null` solo fija la fecha (protege estados legacy/upgrade).
- **Lógica de auto-reset duplicada** entre `onRehydrateStorage` y
  `checkAndAutoReset()`: mismo criterio repetido en dos lugares.
- **Confirmación antes de limpiar**: `ConfirmDialog` con `danger`, botones
  "Cancelar" / "Sí, limpiar"; `Escape` y click en overlay cancelan sin
  tocar el pedido. En `SummaryView`, confirmar navega al Catálogo.
- **Botón de reset condicional**: en `CatalogView` solo se muestra si
  `orderCount > 0`; en `SummaryView`, si el pedido está vacío se muestra el
  estado vacío sin botón.
- **Productos baseline (`b1`–`b8`) son inmutables desde la UI**:
  `removeCustomProduct` valida contra `BASELINE_IDS` y rechaza el borrado.
  No hay UI que invoque `removeCustomProduct`; el método queda sin consumidor.
- **IDs custom son timestamps**: `Date.now().toString()`. Si se crean dos
  productos en el mismo milisegundo, el segundo reemplaza la entrada del
  primero en el state. Riesgo muy bajo.
- **Productos custom borrados dejan carrito huérfano**: las filas en
  `cafe-active-order` sobreviven hasta el próximo reset; `SummaryView` cae
  al fallback `product?.name || id`.
- **Tema y layout están fuera del doble store**: viven en `App.jsx` y se
  persisten con `localStorage` directo bajo `coffice-theme` /
  `coffice-layout`.
- **El catálogo se compone en cada componente**: `CatalogView` y
  `SummaryView` arman `[...BASELINE_PRODUCTS, ...customProducts]` por
  separado (no hay un punto único de combinación).

## Paths clave

| Path | Rol |
| --- | --- |
| `src/store/useInventoryStore.js` | Define `BASELINE_PRODUCTS` (8 ítems), `BASELINE_IDS` y el store persistente de custom products. |
| `src/store/useOrderStore.js` | Store del carrito: `addItem`, `removeItem`, `deleteItem`, `resetOrder`, `clearOrder`, `checkAndAutoReset`, `dayMarker` y `onRehydrateStorage`. |
| `src/App.jsx` | Dispara `checkAndAutoReset()` en `visibilitychange`; guarda `theme` y `layout`. |
| `src/components/CatalogView.jsx` | Une baseline + custom; botón de reset con confirmación. |
| `src/components/SummaryView.jsx` | Filtra `quantity > 0`, controles por fila y reset confirmado con navegación. |
| `src/components/ConfirmDialog.jsx` | Diálogo accesible reutilizado por ambas vistas. |
| `src/components/AddCustomProduct.jsx` | Modal que invoca `addCustomProduct(name)`. |

## Cómo se invalida o se borra

- **Reset manual del pedido**: botón "Limpiar Pedido" (Catálogo o Pedido) →
  `ConfirmDialog` → `clearOrder()`. No afecta al inventario.
- **Auto-reset diario**: al hidratar o volver a foco, si `dayMarker` cambió.
- **Borrar un producto custom**: hoy no hay UI que lo invoque; el método
  `removeCustomProduct(id)` está implementado pero sin consumidor.
- **Devolver todo a cero**: borrar manualmente `cafe-inventory-storage`,
  `cafe-active-order`, `coffice-theme`, `coffice-layout` y
  `coffice-install-dismissed` desde DevTools.
