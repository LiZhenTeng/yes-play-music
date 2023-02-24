import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import type {  VitePWAOptions } from 'vite-plugin-pwa'
import { VitePWA } from 'vite-plugin-pwa'

const pwaOptions: Partial<VitePWAOptions> = {
  includeAssets: ['favicon.svg'],
  manifest: {
    name: 'YesPlayMusic',
    short_name: 'YesPlayMusic',
    theme_color: '#ffffff00',
    background_color: '#335eea',
    icons: [
      {
        src: 'img/icons/256x256.png', // <== don't add slash, for testing
        sizes: '256x256',
        type: 'image/png',
      },
      {
        src: 'img/icons/512x512.png', // <== don't remove slash, for testing
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'img/icons/512x512.png', // <== don't add slash, for testing
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  devOptions: {
    enabled: true,
    /* when using generateSW the PWA plugin will switch to classic */
    type: 'module',
    navigateFallback: 'index.html',
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({ reactivityTransform: true }),
    createSvgIconsPlugin({
      iconDirs: [resolve(__dirname, './src/assets/icons')],
      symbolId: 'icon-[name]',
      inject: 'body-first'
    }),
    VitePWA(pwaOptions)
  ],
  build: {
    rollupOptions: {

    }
  },
  define: {
    process: {
      env: {
        IS_ELECTRON: false,
        VUE_APP_NETEASE_API_URL: 'http://cloud-music.pl-fe.cn/',
        VUE_APP_LASTFM_API_KEY: '09c55292403d961aa517ff7f5e8a3d9c',
        VUE_APP_ELECTRON_API_URL: '/api',
        VUE_APP_ELECTRON_API_URL_DEV: 'http://127.0.0.1:10754',
        VUE_APP_LASTFM_API_SHARED_SECRET: '307c9fda32b3904e53654baff215cb67'
      }
    }
  },
  server: {
    host:'127.0.0.1',
    port: 8080,
    proxy: {
      '^/api': {
        target: process.env.VUE_APP_NETEASE_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace('/^\/api/', '')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
})
