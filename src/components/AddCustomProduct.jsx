import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInventoryStore } from '../store/useInventoryStore.js'

export default function AddCustomProduct() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const addCustomProduct = useInventoryStore((s) => s.addCustomProduct)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    addCustomProduct(name)
    setName('')
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="min-h-[48px] min-w-[48px] px-3 flex items-center justify-center rounded-lg bg-accent-green hover:bg-accent-green-hover text-white text-sm font-medium transition-colors"
      >
        + Producto
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.15 }}
              className="w-full sm:max-w-md bg-beige-surface dark:bg-navy-surface rounded-t-2xl sm:rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Agregar Producto</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del producto..."
                  autoFocus
                  className="min-h-[48px] px-4 rounded-xl border border-beige-border dark:border-navy-border bg-beige-bg dark:bg-navy-bg text-sm placeholder:text-beige-muted dark:placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 min-h-[48px] rounded-xl border border-beige-border dark:border-navy-border text-sm font-medium hover:bg-beige-elevated dark:hover:bg-navy-elevated transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="flex-1 min-h-[48px] rounded-xl bg-accent-blue text-white text-sm font-medium hover:bg-accent-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
