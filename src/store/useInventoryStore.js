import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const BASELINE_PRODUCTS = [
  { id: 'b1', name: 'Café Negro', category: 'cafe' },
  { id: 'b2', name: 'Negro Doble', category: 'cafe' },
  { id: 'b3', name: 'Cortado', category: 'cafe' },
  { id: 'b4', name: 'Cortado Doble', category: 'cafe' },
  { id: 'b5', name: 'Lágrima', category: 'cafe' },
  { id: 'b6', name: 'Lágrima Doble', category: 'cafe' },
  { id: 'b7', name: 'Té', category: 'infusion' },
  { id: 'b8', name: 'Bizcochitos', category: 'comida' },
]

const BASELINE_IDS = new Set(BASELINE_PRODUCTS.map((p) => p.id))

export const useInventoryStore = create(
  persist(
    (set, get) => ({
      customProducts: [],

      getAllProducts: () => {
        return [...BASELINE_PRODUCTS, ...(get().customProducts || [])]
      },

      addCustomProduct: (name) => {
        const trimmed = name.trim()
        if (!trimmed) return
        const product = {
          id: Date.now().toString(),
          name: trimmed,
          category: 'custom',
        }
        set((state) => ({
          customProducts: [...state.customProducts, product],
        }))
      },

      removeCustomProduct: (id) => {
        if (BASELINE_IDS.has(id)) return
        set((state) => ({
          customProducts: state.customProducts.filter((p) => p.id !== id),
        }))
      },
    }),
    {
      name: 'cafe-inventory-storage',
      partialize: (state) => ({ customProducts: state.customProducts }),
    },
  ),
)
