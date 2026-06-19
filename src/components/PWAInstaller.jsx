import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PWAInstaller() {
  const [showInstall, setShowInstall] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const deferredPrompt = useRef(null)

  useEffect(() => {
    const isStandalone = window.matchMedia(
      '(display-mode: standalone)',
    ).matches
    if (isStandalone) return

    const isIOS =
      /iPhone|iPad|iPod/.test(navigator.userAgent) &&
      /Safari/.test(navigator.userAgent) &&
      !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent)

    if (isIOS) {
      setShowIOSModal(true)
      return
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault()
      deferredPrompt.current = e
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () =>
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt.current) return
    deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted') {
      setShowInstall(false)
    }
    deferredPrompt.current = null
  }

  return (
    <>
      <AnimatePresence>
        {showInstall && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white"
          >
            <span className="text-sm font-medium">Instalá la app para acceso rápido</span>
            <button
              onClick={handleInstall}
              className="min-h-[40px] px-4 rounded-lg bg-white text-blue-600 text-sm font-bold hover:bg-blue-50 transition-colors"
            >
              Instalar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIOSModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowIOSModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.15 }}
              className="w-full sm:max-w-sm bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl p-6 shadow-xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-4xl mb-3 block">📱</span>
              <h3 className="text-lg font-bold mb-2">Instalar en iPhone/iPad</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Tocá el botón <strong>Compartir</strong> en Safari y luego{' '}
                <strong>"Agregar a Inicio"</strong>
              </p>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full min-h-[48px] rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
