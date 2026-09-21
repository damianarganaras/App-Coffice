import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const useOrderStore = create(
  persist(
    (set, get) => ({
      items: {},
      dayMarker: null,

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

      resetOrder: () => {
        set({ items: {}, dayMarker: todayISO() })
      },

      clearOrder: () => {
        get().resetOrder()
      },

      checkAndAutoReset: () => {
        const today = todayISO()
        const state = useOrderStore.getState()
        if (state.dayMarker == null) {
          set({ dayMarker: today })
        } else if (state.dayMarker !== today) {
          set({ items: {}, dayMarker: today })
        }
      },
    }),
    {
      name: 'cafe-active-order',
      partialize: (state) => ({
        items: state.items,
        dayMarker: state.dayMarker,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          useOrderStore.setState({ dayMarker: todayISO() })
          return
        }
        if (!state) return
        const today = todayISO()
        if (state.dayMarker == null) {
          useOrderStore.setState({ dayMarker: today })
        } else if (state.dayMarker !== today) {
          useOrderStore.setState({ items: {}, dayMarker: today })
        }
      },
    },
  ),
)
