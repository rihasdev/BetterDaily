import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'prompt',
    manifest: {
      name: 'BetterDaily', short_name: 'BetterDaily',
      description: 'Small actions. Meaningful changes. Every day.',
      start_url: '/', scope: '/', display: 'standalone',
      theme_color: '#215C43', background_color: '#F7F7EF',
      icons: [
        {src:'/icons/icon-192.png', sizes:'192x192', type:'image/png'},
        {src:'/icons/icon-512.png', sizes:'512x512', type:'image/png'},
        {src:'/icons/icon.svg', sizes:'any', type:'image/svg+xml'}
      ],
    },
    workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'], navigateFallback: '/index.html', cleanupOutdatedCaches: true }
  })],
})
