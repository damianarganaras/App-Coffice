import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import { useInventoryStore } from '../store/useInventoryStore.js'
import { useOrderStore } from '../store/useOrderStore.js'
import AddCustomProduct from './AddCustomProduct.jsx'

function ProductCard({ product, quantity, onTap, layout }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onTap}
      className={`
        relative min-h-0 p-3 rounded-xl border
        bg-white dark:bg-gray-800
        border-gray-200 dark:border-gray-700
        hover:border-blue-400 dark:hover:border-blue-500
        transition-colors text-left select-none
        ${layout === 'list' ? 'flex-1 flex items-center justify-between w-full' : 'flex flex-col gap-2'}
      `}
    >
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-sm truncate">{product.name}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {product.category}
        </span>
      </div>
      <AnimatePresence>
        {quantity > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.15 }}
            className={`
              flex items-center justify-center
              min-w-[28px] h-7 px-2 rounded-full
              bg-blue-600 text-white text-xs font-bold
              ${layout === 'list' ? '' : 'absolute top-2 right-2'}
            `}
          >
            {quantity}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default function CatalogView({ layout }) {
  const getAllProducts = useInventoryStore((s) => s.getAllProducts)
  const items = useOrderStore((s) => s.items)
  const addItem = useOrderStore((s) => s.addItem)

  const products = getAllProducts()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold">Catálogo</h2>
        <AddCustomProduct />
      </div>
      <div
        className={
          layout === 'grid'
            ? 'flex-1 grid grid-cols-2 auto-rows-fr gap-3 min-h-0'
            : 'flex-1 flex flex-col gap-2 min-h-0'
        }
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={items[product.id] || 0}
            onTap={() => addItem(product.id)}
            layout={layout}
          />
        ))}
      </div>
    </div>
  )
}
