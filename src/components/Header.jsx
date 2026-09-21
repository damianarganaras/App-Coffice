import { AnimatePresence, motion } from 'framer-motion'

export default function Header({
  view,
  theme,
  layout,
  orderCount = 0,
  onToggleTheme,
  onToggleLayout,
  onSwitchView,
}) {
  const badgeLabel = orderCount > 99 ? '99+' : String(orderCount)

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-dark-bg/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold tracking-tight select-none">
          ☕ Coffice
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl"
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={onToggleLayout}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl"
            aria-label={layout === 'grid' ? 'Vista lista' : 'Vista cuadrícula'}
          >
            {layout === 'grid' ? '☰' : '⊞'}
          </button>
          <button
            onClick={onSwitchView}
            className="relative min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 transition-colors"
            aria-label={
              view === 'catalog'
                ? `Ir al Pedido${orderCount > 0 ? ` (${orderCount} ítems)` : ''}`
                : 'Ir al Catálogo'
            }
          >
            {view === 'catalog' ? 'Pedido' : 'Catálogo'}
            <AnimatePresence>
              {view === 'catalog' && orderCount > 0 && (
                <motion.span
                  key="order-badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold leading-none shadow-md"
                >
                  {badgeLabel}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </header>
  )
}
