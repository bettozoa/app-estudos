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
      includeAssets: ['favicon.svg'],
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
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // O conteúdo já vem embutido no bundle (ver carregarConteudo.ts), então o precache
        // padrão do app shell (JS/CSS/HTML/fontes) já cobre "funciona offline" da Fase 0.
        globPatterns: ['**/*.{js,css,html,woff,woff2,svg,png}'],
      },
    }),
  ],
})
