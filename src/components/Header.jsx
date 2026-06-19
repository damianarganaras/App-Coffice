export default function Header({
  view,
  theme,
  layout,
  onToggleTheme,
  onToggleLayout,
  onSwitchView,
}) {
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
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 transition-colors"
          >
            {view === 'catalog' ? 'Pedido' : 'Catálogo'}
          </button>
        </div>
      </div>
    </header>
  )
}
