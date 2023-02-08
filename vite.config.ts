import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({ reactivityTransform: true }),
    createSvgIconsPlugin({
      iconDirs: [resolve(__dirname, './src/assets/icons')],
      symbolId: 'icon-[name]',
    })
  ],
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
        target: 'http://cloud-music.pl-fe.cn/',
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
