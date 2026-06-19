import { motion } from 'framer-motion'
import { useOrderStore } from '../store/useOrderStore.js'
import { useInventoryStore } from '../store/useInventoryStore.js'

export default function SummaryView({ onBack }) {
  const items = useOrderStore((s) => s.items)
  const getAllProducts = useInventoryStore((s) => s.getAllProducts)
  const addItem = useOrderStore((s) => s.addItem)
  const removeItem = useOrderStore((s) => s.removeItem)
  const deleteItem = useOrderStore((s) => s.deleteItem)
  const clearOrder = useOrderStore((s) => s.clearOrder)

  const products = getAllProducts()
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

  const activeItems = Object.entries(items).filter(
    ([, qty]) => qty > 0,
  )

  const handleClear = () => {
    clearOrder()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold">Pedido</h2>
        <button
          onClick={onBack}
          className="min-h-[48px] min-w-[48px] px-3 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          ← Catálogo
        </button>
      </div>

      {activeItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
          <span className="text-5xl mb-4">☕</span>
          <p className="text-lg font-medium">No hay productos en el pedido</p>
          <p className="text-sm mt-1">Volvé al catálogo para agregar items</p>
        </div>
      ) : (
        <>
          <ul className="flex-1 flex flex-col gap-2 mb-6 min-h-0 overflow-y-auto">
            {activeItems.map(([id, qty]) => {
              const product = productMap[id]
              return (
                <motion.li
                  key={id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {product?.name || id}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {product?.category || 'custom'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => removeItem(id)}
                      className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-lg font-bold transition-colors select-none"
                    >
                      −
                    </button>
                    <span className="min-w-[32px] text-center font-bold text-lg select-none">
                      {qty}
                    </span>
                    <button
                      onClick={() => addItem(id)}
                      className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-lg font-bold transition-colors select-none"
                    >
                      +
                    </button>
                    <button
                      onClick={() => deleteItem(id)}
                      className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-lg transition-colors select-none ml-1"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </motion.li>
              )
            })}
          </ul>

          <button
            onClick={handleClear}
            className="w-full min-h-[48px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors"
          >
            Limpiar Pedido
          </button>
        </>
      )}
    </div>
  )
}
