import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { useInventoryStore, BASELINE_PRODUCTS } from '../store/useInventoryStore.js'
import { useOrderStore } from '../store/useOrderStore.js'
import AddCustomProduct from './AddCustomProduct.jsx'

const BASE = import.meta.env.BASE_URL

function ProductCard({ product, quantity, onTap, layout }) {
  const iconSrc = product.icon ? `${BASE}assets/icons/${product.icon}` : null
  const iconControls = useAnimationControls()

  const handleTap = () => {
    iconControls.start({
      scale: [1, 1.4, 0.9, 1.1, 1],
      transition: { duration: 0.35, ease: 'easeInOut' },
    })
    onTap()
  }

  const quantityBadge = quantity > 0 && (
    <motion.span
      key={product.id + '-' + quantity}
      initial={{ scale: 0.3, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 20 }}
      transition={{ type: 'spring', stiffness: 500, damping: 12 }}
      className="flex items-baseline gap-0.5 px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-sm"
    >
      <span className="text-sm font-bold text-black/50 dark:text-white/50">x</span>
      <span className="text-4xl font-black text-black dark:text-white leading-none">
        {quantity}
      </span>
    </motion.span>
  )

  if (layout === 'list') {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleTap}
        className="relative flex-1 flex items-center gap-3 p-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-left select-none min-h-0"
      >
        <motion.div
          animate={iconControls}
          className="w-10 h-10 flex-shrink-0"
        >
          {iconSrc ? (
            <img src={iconSrc} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-lg">
              ☕
            </div>
          )}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{product.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{product.category}</p>
        </div>
        <AnimatePresence>
          {quantityBadge}
        </AnimatePresence>
      </motion.button>
    )
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={handleTap}
      className="relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors select-none min-h-0"
    >
      <motion.div
        animate={iconControls}
        className="flex-1 flex items-center justify-center min-h-0 w-full"
      >
        {iconSrc ? (
          <img src={iconSrc} alt={product.name} className="max-w-full max-h-full object-contain" />
        ) : (
          <span className="text-4xl">☕</span>
        )}
      </motion.div>
      <span className="font-semibold text-xs text-center leading-tight">{product.name}</span>
      <AnimatePresence>
        {quantity > 0 && (
          <motion.span
            key={product.id + '-' + quantity}
            initial={{ scale: 0.3, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 12 }}
            className="absolute top-1 right-1 flex items-baseline gap-0.5 px-2 py-0.5 rounded-full bg-white/70 dark:bg-transparent"
          >
            <span className="text-sm font-bold text-black/50 dark:text-white/50">x</span>
            <span className="text-4xl font-black text-black dark:text-white leading-none">
              {quantity}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default function CatalogView({ layout }) {
  const customProducts = useInventoryStore((s) => s.customProducts)
  const items = useOrderStore((s) => s.items)
  const addItem = useOrderStore((s) => s.addItem)

  const products = [...BASELINE_PRODUCTS, ...customProducts]

  return (
    <div className="flex flex-col flex-1 min-h-0">
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
