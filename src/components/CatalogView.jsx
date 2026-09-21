import { useState } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { useInventoryStore, BASELINE_PRODUCTS } from '../store/useInventoryStore.js'
import { useOrderStore } from '../store/useOrderStore.js'
import AddCustomProduct from './AddCustomProduct.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'

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
      className="flex items-baseline gap-1"
    >
      <span className="text-sm font-bold text-black/50 dark:text-white/50">x</span>
      <span className="text-4xl font-extrabold text-black dark:text-white leading-none" style={{ textShadow: '0 0 1px currentColor' }}>
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
      className="relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border  border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors select-none min-h-0"
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
            className="absolute top-1 right-1 flex items-baseline gap-1"
          >
            <span className="text-sm font-bold text-black/50 dark:text-white/50">x</span>
            <span className="text-4xl font-extrabold text-black dark:text-white leading-none" style={{ textShadow: '0 0 1px currentColor' }}>
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
  const clearOrder = useOrderStore((s) => s.clearOrder)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const products = [...BASELINE_PRODUCTS, ...customProducts]
  const orderCount = Object.values(items).reduce((sum, qty) => sum + qty, 0)

  const handleConfirmClear = () => {
    clearOrder()
    setConfirmOpen(false)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold">Catálogo</h2>
        <AddCustomProduct />
      </div>

      <AnimatePresence>
        {orderCount > 0 && (
          <motion.button
            key="reset-button"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setConfirmOpen(true)}
            className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-semibold transition-colors hover:bg-red-100 dark:hover:bg-red-900/30 select-none flex-shrink-0 overflow-hidden"
          >
            <span aria-hidden="true">🗑️</span>
            <span>Limpiar Pedido ({orderCount})</span>
          </motion.button>
        )}
      </AnimatePresence>

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

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Limpiar Pedido"
        message="¿Estás seguro de que quieres borrar todo el pedido?"
        confirmLabel="Sí, limpiar"
        onConfirm={handleConfirmClear}
        onCancel={() => setConfirmOpen(false)}
        danger
      />
    </div>
  )
}
