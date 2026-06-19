import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useOrderStore = create(
  persist(
    (set) => ({
      items: {},

      addItem: (id) => {
        set((state) => ({
          items: {
            ...state.items,
            [id]: (state.items[id] || 0) + 1,
          },
        }))
      },

      removeItem: (id) => {
        set((state) => {
          const current = state.items[id] || 0
          if (current <= 1) {
            const { [id]: _, ...rest } = state.items
            return { items: rest }
          }
          return {
            items: { ...state.items, [id]: current - 1 },
          }
        })
      },

      deleteItem: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.items
          return { items: rest }
        })
      },

      clearOrder: () => {
        set({ items: {} })
      },
    }),
    {
      name: 'cafe-active-order',
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
