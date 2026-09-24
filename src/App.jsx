import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import CatalogView from './components/CatalogView.jsx'
import SummaryView from './components/SummaryView.jsx'
import PWAInstaller from './components/PWAInstaller.jsx'
import { useOrderStore } from './store/useOrderStore.js'

function getInitialTheme() {
  return localStorage.getItem('coffice-theme') || 'light'
}

function getInitialLayout() {
  return localStorage.getItem('coffice-layout') || 'grid'
}

export default function App() {
  const [view, setView] = useState('catalog')
  const [theme, setTheme] = useState(getInitialTheme)
  const [layout, setLayout] = useState(getInitialLayout)
  const items = useOrderStore((s) => s.items)
  const orderCount = Object.values(items).reduce((sum, qty) => sum + qty, 0)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('coffice-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('coffice-layout', layout)
  }, [layout])

  const switchView = useCallback((nextView) => {
    setView(nextView)
    history.pushState({ view: nextView }, '', '#')
  }, [])

  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state?.view) {
        setView(e.state.view)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        useOrderStore.getState().checkAndAutoReset()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  const toggleLayout = () => {
    setLayout((l) => (l === 'grid' ? 'list' : 'grid'))
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-beige-bg dark:bg-navy-bg text-beige-text dark:text-navy-text transition-colors duration-150">
      <Header
        view={view}
        theme={theme}
        layout={layout}
        orderCount={orderCount}
        onToggleTheme={toggleTheme}
        onToggleLayout={toggleLayout}
        onSwitchView={() => switchView(view === 'catalog' ? 'summary' : 'catalog')}
      />
      <PWAInstaller />
      <main className="flex-1 overflow-hidden px-4 pt-4 pb-4 flex flex-col min-h-0">
        {view === 'catalog' ? (
          <CatalogView key="catalog" layout={layout} />
        ) : (
          <SummaryView key="summary" onBack={() => switchView('catalog')} />
        )}
      </main>
    </div>
  )
}
