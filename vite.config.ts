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
        DEV_SERVER_PORT: 8001
      }
    }
  },
  server: {
    port: 8080,
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
