import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/coffice/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: 'Coffice - Cafetería',
        short_name: 'Coffice',
        description: 'App de pedidos para cafetería de oficina',
        theme_color: '#1e1e2e',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/coffice/',
        scope: '/coffice/',
        icons: [
          { src: './pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: './pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
