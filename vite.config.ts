import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon-48.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'App de Estudos',
        short_name: 'Estudos',
        description: 'Treino diário de História e Geografia com repetição espaçada.',
        lang: 'pt-BR',
        start_url: '/',
        display: 'standalone',
        background_color: '#FFF8EC',
        theme_color: '#E2542B',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // O app shell (JS/CSS/HTML/fontes/ícones/mascote) precisa estar no precache pra
        // funcionar offline — o conteúdo em si (Fase 3) vem do Supabase, cacheado à parte no
        // Dexie (ver data/sincronizarConteudo.ts), não por aqui.
        globPatterns: ['**/*.{js,css,html,woff,woff2,svg,png,webp}'],
      },
    }),
  ],
})
