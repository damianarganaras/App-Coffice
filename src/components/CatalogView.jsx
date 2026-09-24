import { useState } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { useInventoryStore, BASELINE_PRODUCTS } from '../store/useInventoryStore.js'
import { useOrderStore } from '../store/useOrderStore.js'
import AddCustomProduct from './AddCustomProduct.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'

const BASE = import.meta.env.BASE_URL

function isDoubleVariant(name) {
  return /doble/i.test(name || '')
}

function ProductCard({ product, quantity, onTap, layout }) {
  const iconSrc = product.icon ? `${BASE}assets/icons/${product.icon}` : null
  const iconControls = useAnimationControls()
  const isDouble = isDoubleVariant(product.name)

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
      <span className="text-sm font-bold text-beige-text/50 dark:text-navy-text/50">x</span>
      <span className="text-4xl font-extrabold text-beige-text dark:text-navy-text leading-none" style={{ textShadow: '0 0 1px currentColor' }}>
        {quantity}
      </span>
    </motion.span>
  )

  if (layout === 'list') {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleTap}
        className="relative flex-1 flex items-center gap-3 p-3 rounded-xl border bg-beige-surface dark:bg-navy-surface border-beige-border dark:border-navy-border hover:border-accent-blue dark:hover:border-accent-blue transition-colors text-left select-none min-h-0"
      >
        <motion.div
          animate={iconControls}
          className="w-10 h-10 flex-shrink-0"
        >
          {iconSrc ? (
            <img src={iconSrc} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center rounded-lg bg-beige-elevated dark:bg-navy-elevated text-lg">
              ☕
            </div>
          )}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{product.name}</p>
          <p className="text-xs text-beige-muted dark:text-navy-muted capitalize">{product.category}</p>
          {isDouble && (
            <span className="mt-1 inline-block rounded-full bg-accent-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Doble
            </span>
          )}
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
      className="relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border bg-beige-surface dark:bg-navy-surface border-beige-border dark:border-navy-border hover:border-accent-blue dark:hover:border-accent-blue transition-colors select-none min-h-0"
    >
      {isDouble && (
        <span className="absolute top-1 left-1 rounded-full bg-accent-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Doble
        </span>
      )}
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
            <span className="text-sm font-bold text-beige-text/50 dark:text-navy-text/50">x</span>
            <span className="text-4xl font-extrabold text-beige-text dark:text-navy-text leading-none" style={{ textShadow: '0 0 1px currentColor' }}>
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

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={orderCount === 0}
        className={
          'w-full min-h-[48px] mb-4 flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors select-none flex-shrink-0 ' +
          (orderCount === 0
            ? 'bg-beige-elevated dark:bg-navy-elevated border-beige-border dark:border-navy-border text-beige-muted dark:text-navy-muted opacity-60 cursor-not-allowed'
            : 'bg-accent-red hover:bg-accent-red-hover border-transparent text-white')
        }
      >
        <span aria-hidden="true">🗑️</span>
        <span>Limpiar Pedido{orderCount > 0 ? ` (${orderCount})` : ''}</span>
      </button>

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
