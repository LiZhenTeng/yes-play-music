import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({ reactivityTransform: true }),
    createSvgIconsPlugin({
      iconDirs: [resolve(__dirname, './src/assets/icons')],
      symbolId: 'icon-[name]',
      inject:'body-first'
    }),
    /* VitePWA({
      manifest: {
        name: 'YesPlayMusic',
        icons: [{
          favicon32: 'img/icons/favicon-32x32.png'
        }],
        theme_color: '#ffffff00',
        background_color: '#335eea'
      },
    }) */
  ],
  build:{
    
  },
  define: {
    process: {
      env: {
        VUE_APP_NETEASE_API_URL: 'http://cloud-music.pl-fe.cn/',
        DEV_SERVER_PORT: 5173,
        VUE_APP_LASTFM_API_KEY: '09c55292403d961aa517ff7f5e8a3d9c',
        VUE_APP_ELECTRON_API_URL: '/api',
        VUE_APP_ELECTRON_API_URL_DEV: 'http://127.0.0.1:10754',
        VUE_APP_LASTFM_API_SHARED_SECRET: '307c9fda32b3904e53654baff215cb67'
      }
    }
  },
  server: {
    port: 5173,
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
