---
node: units/almacenamiento-dual
kind: dossier
read_when: preguntas sobre el carrito, el catálogo o la separación entre inventario y pedido
covers: [order-state, inventory-state, localStorage, zustand-persist, baseline-products]
sources: ["src/store/useInventoryStore.js", "src/store/useOrderStore.js", "src/App.jsx", "src/components/CatalogView.jsx", "src/components/SummaryView.jsx", "src/components/AddCustomProduct.jsx"]
sourcesSha: eb43dcffdc9b1cee225188841ee41180d0fab8d97bea0ccb0512a9cc2a82eb96
generatedAt: 2026-09-21T20:25:00.000Z
pluginVersion: 0.6.5
skillVersion: '2.3'
---

# Almacenamiento dual (inventario y pedido)

## Propósito

Definir y separar el **estado de catálogo** del **estado de pedido** del
día, de modo que vaciar el pedido jamás toque al catálogo, y viceversa.
Coffice no tiene backend: la única fuente de verdad durable es el
`localStorage` del navegador.

## Recorrido relevante

```text
Agregar producto custom
  AddCustomProduct.jsx → useInventoryStore.addCustomProduct(name)
    └─ valida name.trim() no vacío
    └─ crea { id: Date.now().toString(), name, category: 'custom' }
    └─ set(customProducts: [...prev, product])
    └─ persist (cafe-inventory-storage) con partialize: customProducts

Tocar producto del catálogo
  CatalogView.ProductCard.onTap → useOrderStore.addItem(id)
    └─ set(items: { ...prev, [id]: (prev[id] ?? 0) + 1 })
    └─ persist (cafe-active-order) con partialize: items

Editar pedido
  SummaryView
    ├─ [ + ]   → useOrderStore.addItem(id)
    ├─ [ − ]   → useOrderStore.removeItem(id)   (al llegar a 0 elimina la clave)
    ├─ [ 🗑️ ] → useOrderStore.deleteItem(id)   (elimina la clave directamente)
    └─ [ Limpiar Pedido ] → useOrderStore.clearOrder()
                              └─ set(items: {})

Lectura de productos (catalog + summary)
  useInventoryStore.js exporta BASELINE_PRODUCTS (constante de módulo, 8 ítems)
  CatalogView/SummaryView construyen:
    products = [...BASELINE_PRODUCTS, ...customProducts]
```

## Reglas, contratos y riesgos

- **Contrato de claves**: `cafe-inventory-storage` solo contiene
  `customProducts` y `cafe-active-order` solo contiene `items`, gracias a
  `partialize` en ambos stores.
  (`src/store/useInventoryStore.js:48-51`, `src/store/useOrderStore.js:42-45`).
- **`clearOrder()` reinicia `items` a `{}` y nunca toca el inventario**:
  no hay path de código que cruce stores. La arquitectura lo hace
  imposible por construcción (claves `localStorage` separadas).
- **Productos baseline (`b1`–`b8`) son inmutables desde la UI**:
  `removeCustomProduct` valida contra `BASELINE_IDS` y rechaza el borrado
  (`src/store/useInventoryStore.js:15, 41-46`). No hay otra función que
  los elimine.
- **IDs custom son timestamps**: `Date.now().toString()`. Aceptable
  porque la creación es secuencial dentro de una misma sesión. **Si se
  crean dos productos en el mismo milisegundo**, el segundo sobrescribe
  la entrada del primero en el state (no en `localStorage`, porque `set`
  reemplaza por id). Riesgo muy bajo; registrado.
- **`addCustomProduct` valida nombre vacío** (`name.trim()`) y rechaza
  silenciosamente sin error visible. Convergente con el spec
  "empty-name rejected".
- **Productos custom sin borrar carrito huérfano**: si se elimina un
  producto custom desde una futura UI, las filas en `cafe-active-order`
  sobreviven hasta el siguiente `clearOrder()`. `SummaryView:67-72`
  cae al fallback `product?.name || id` cuando el id ya no resuelve.
- **Tema y layout están fuera del doble store**: viven en `App.jsx` y se
  persisten con `localStorage` directo bajo `coffice-theme` /
  `coffice-layout`. No hay razón para acoplarlos al pedido o al
  inventario.

## Paths clave

| Path | Rol |
| --- | --- |
| `src/store/useInventoryStore.js` | Define `BASELINE_PRODUCTS` (8 ítems), `BASELINE_IDS`, y el store persistente de custom products. |
| `src/store/useOrderStore.js` | Define el store del carrito y sus 4 acciones (`addItem`, `removeItem`, `deleteItem`, `clearOrder`). |
| `src/components/CatalogView.jsx` | Une baseline + custom y renderiza con animación de tap. |
| `src/components/SummaryView.jsx` | Filtra `quantity > 0`, muestra controles y maneja "Limpiar Pedido". |
| `src/components/AddCustomProduct.jsx` | Modal que invoca `addCustomProduct(name)`. |
| `src/App.jsx` | Almacena `theme` y `layout` por separado (no dominio). |

## Cómo se invalida o se borra

- **Reset completo del carrito**: botonera "Limpiar Pedido" en
  `SummaryView`. No afecta al inventario.
- **Borrar un producto custom**: hoy no hay UI que lo invoque; el método
  `removeCustomProduct(id)` está implementado pero sin consumidor.
- **Devolver todo a cero**: borrar manualmente `cafe-inventory-storage`,
  `cafe-active-order`, `coffice-theme`, `coffice-layout` y
  `coffice-install-dismissed` desde DevTools.
