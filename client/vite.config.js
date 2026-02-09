import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['Nomad.svg', 'Nomad.png', 'hyperwave-one.ttf'],
      
      // Usar estrategia de inyección de manifest
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      
      manifest: {
        name: 'NOMAD® Wear - Streetwear Argentina',
        short_name: 'NOMAD®',
        description: 'Ropa urbana diseñada para el movimiento. Streetwear e indumentaria urbana Argentina',
        theme_color: '#1b1b1b',
        background_color: '#1b1b1b',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      
      // IMPORTANTE: No usar workbox, usar injectManifest
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf}']
      },
      
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})