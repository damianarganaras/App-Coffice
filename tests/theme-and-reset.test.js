import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import React from 'react'
import tailwindConfig from '../tailwind.config.js'

// The stores use zustand's persist middleware, which touches localStorage while
// the module graph loads. Node has no localStorage, so provide a minimal stub
// before any SSR module is imported.
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
}

// Load the real components through Vite so JSX and import.meta.env resolve the
// same way they do in the app, without installing a test framework.
const server = await createServer({
  configFile: false,
  root: fileURLToPath(new URL('..', import.meta.url)),
  esbuild: { jsx: 'automatic' },
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

after(async () => {
  await server.close()
})

const { default: CatalogView } = await server.ssrLoadModule(
  '/src/components/CatalogView.jsx',
)
const { default: Header } = await server.ssrLoadModule('/src/components/Header.jsx')
const { useOrderStore } = await server.ssrLoadModule('/src/store/useOrderStore.js')
const { BASELINE_PRODUCTS } = await server.ssrLoadModule(
  '/src/store/useInventoryStore.js',
)
const { default: SummaryView } = await server.ssrLoadModule(
  '/src/components/SummaryView.jsx',
)
const { default: AddCustomProduct } = await server.ssrLoadModule(
  '/src/components/AddCustomProduct.jsx',
)
const { default: ConfirmDialog } = await server.ssrLoadModule(
  '/src/components/ConfirmDialog.jsx',
)

// zustand v5 feeds React's SSR snapshot from `getInitialState()`, so a
// `setState()` performed by the test would never reach the server render. Make
// the SSR snapshot read the live store state so the component can be driven
// from the test.
const useSyncExternalStore = React.useSyncExternalStore
React.useSyncExternalStore = (subscribe, getSnapshot) =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

const RESET_LABEL = 'Limpiar Pedido'
const DIALOG_MESSAGE = '¿Estás seguro de que quieres borrar todo el pedido?'

function renderCatalog(layout = 'grid') {
  return renderToStaticMarkup(createElement(CatalogView, { layout }))
}

function renderHeader(orderCount) {
  return renderToStaticMarkup(
    createElement(Header, {
      view: 'catalog',
      theme: 'light',
      layout: 'grid',
      orderCount,
      onToggleTheme: () => {},
      onToggleLayout: () => {},
      onSwitchView: () => {},
    }),
  )
}

// Returns the opening <button ...> tag of the reset control, so assertions can
// inspect only that element's attributes/classes.
function resetControlTag(html) {
  const labelIndex = html.indexOf(RESET_LABEL)
  assert.notEqual(labelIndex, -1, 'reset control must always be rendered')
  const start = html.lastIndexOf('<button', labelIndex)
  const end = html.indexOf('>', start)
  return html.slice(start, end + 1)
}

function doubleBadgeCount(html) {
  return (html.match(/bg-accent-red[^>]*>\s*Doble\s*</g) || []).length
}

test('reset control is always rendered, disabled and non-actionable when the order is empty', () => {
  useOrderStore.setState({ items: {} })
  const html = renderCatalog()

  const tag = resetControlTag(html)
  assert.match(tag, /\bdisabled\b/, 'control must be disabled when empty')
  assert.ok(!html.includes(DIALOG_MESSAGE), 'dialog must not be open')
  assert.ok(!html.includes('role="dialog"'), 'dialog must not be rendered')
  assert.ok(!html.includes('(0)'), 'disabled control must not show a count')
})

test('adding the first item enables the control, shows the count and does not displace the grid', () => {
  useOrderStore.setState({ items: {} })
  const emptyHtml = renderCatalog()
  const emptyTag = resetControlTag(emptyHtml)

  useOrderStore.setState({ items: { b1: 1 } })
  const filledHtml = renderCatalog()
  const filledTag = resetControlTag(filledHtml)

  assert.ok(!/\bdisabled\b/.test(filledTag), 'control must be enabled with items')
  assert.ok(filledHtml.includes('(1)'), 'enabled control must show the count')

  // Stable placement: the control keeps the same reserved height in both states
  // and always stays before the product grid.
  assert.ok(emptyTag.includes('min-h-[48px]'))
  assert.ok(filledTag.includes('min-h-[48px]'))
  assert.ok(emptyHtml.indexOf(RESET_LABEL) < emptyHtml.indexOf('Café Negro'))
  assert.ok(filledHtml.indexOf(RESET_LABEL) < filledHtml.indexOf('Café Negro'))
})

test('red "Doble" badge is rendered for double variants in grid layout', () => {
  useOrderStore.setState({ items: {} })
  const html = renderCatalog('grid')
  const expectedDoubles = BASELINE_PRODUCTS.filter((p) => /doble/i.test(p.name))

  assert.equal(expectedDoubles.length, 3, 'baseline data contract: b2, b4, b6')
  assert.equal(doubleBadgeCount(html), expectedDoubles.length)
})

test('red "Doble" badge is rendered for double variants in list layout', () => {
  useOrderStore.setState({ items: {} })
  const html = renderCatalog('list')
  assert.equal(doubleBadgeCount(html), 3)
})

test('header order badge appears only when the order has items', () => {
  const empty = renderHeader(0)
  const filled = renderHeader(3)

  assert.equal((empty.match(/bg-accent-red/g) || []).length, 0)
  assert.equal((filled.match(/bg-accent-red/g) || []).length, 1)
})

test('restyled components render without errors', () => {
  useOrderStore.setState({ items: {} })
  const emptySummary = renderToStaticMarkup(
    createElement(SummaryView, { onBack: () => {} }),
  )
  assert.ok(emptySummary.includes('No hay productos en el pedido'))

  useOrderStore.setState({ items: { b1: 2 } })
  const filledSummary = renderToStaticMarkup(
    createElement(SummaryView, { onBack: () => {} }),
  )
  assert.ok(filledSummary.includes('Café Negro'))
  assert.ok(filledSummary.includes(RESET_LABEL))

  const addProduct = renderToStaticMarkup(createElement(AddCustomProduct))
  assert.ok(addProduct.includes('+ Producto'))

  const dialog = renderToStaticMarkup(
    createElement(ConfirmDialog, {
      isOpen: true,
      title: 'Limpiar Pedido',
      message: DIALOG_MESSAGE,
      onConfirm: () => {},
      onCancel: () => {},
      danger: true,
    }),
  )
  assert.ok(dialog.includes('role="dialog"'))
  assert.ok(dialog.includes(DIALOG_MESSAGE))
})

test('tailwind exposes the semantic palette contract for both themes', () => {
  assert.equal(tailwindConfig.darkMode, 'class')
  const colors = tailwindConfig.theme.extend.colors

  assert.equal(colors.navy.bg, '#0b1120')
  assert.equal(colors.navy.surface, '#161f36')
  assert.equal(colors.beige.bg, '#f0e9db')
  assert.equal(colors.beige.surface, '#cebc9b')
  assert.equal(colors.accent.red, '#dc2626')
  assert.ok(colors.accent.blue)
  assert.ok(colors.accent.green)
})

test('the superseded dark background token is removed from the palette', () => {
  const colors = tailwindConfig.theme.extend.colors
  assert.ok(!('dark-bg' in colors))
  assert.ok(!JSON.stringify(colors).includes('#1e1e2e'))
})

test('restyled components no longer reference the superseded dark background token', () => {
  const files = [
    'src/App.jsx',
    'src/components/Header.jsx',
    'src/components/CatalogView.jsx',
    'src/components/AddCustomProduct.jsx',
    'src/components/SummaryView.jsx',
    'src/components/ConfirmDialog.jsx',
    'src/components/PWAInstaller.jsx',
  ]

  for (const file of files) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
    assert.ok(!source.includes('dark-bg'), `${file} still uses dark-bg`)
    assert.ok(!source.includes('#1e1e2e'), `${file} still uses #1e1e2e`)
  }
})
