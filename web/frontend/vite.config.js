/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import vue from '@vitejs/plugin-vue'

if (
  process.env.npm_lifecycle_event === 'build' &&
  !process.env.CI &&
  !process.env.SHOPIFY_API_KEY
) {
  console.warn(
    '\nBuilding the frontend app without an API key. The frontend build will not run without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command.\n'
  )
}

const proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
  // target: `http://127.0.0.1:3000`,
  changeOrigin: false,
  secure: true,
  ws: false
}
const serverApiProxyOptions = {
  target: `http://127.0.0.1:3000`,
  changeOrigin: false,
  secure: true,
  ws: false
}

const host = process.env.HOST ? process.env.HOST.replace(/https?:\/\//, '') : 'localhost'

let hmrConfig
if (host === 'localhost') {
  hmrConfig = {
    protocol: 'ws',
    host: 'localhost',
    port: 64999,
    clientPort: 64999
  }
} else {
  hmrConfig = {
    protocol: 'wss',
    host: host,
    port: process.env.FRONTEND_PORT,
    clientPort: 443
  }
}

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  plugins: [vue()],
  define: {
    'process.env.SHOPIFY_API_KEY': JSON.stringify(process.env.SHOPIFY_API_KEY)
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: 'localhost',
    port: process.env.FRONTEND_PORT,
    hmr: hmrConfig,
    proxy: {
      '^/(\\?.*)?$': proxyOptions,
      '^/api(/|(\\?.*)?$)': proxyOptions,
    //  '^/server/v1(/|(\\?.*)?$)': serverApiProxyOptions,
     '^/server/v1(/|(\\?.*)?$)': {
      target: `http://127.0.0.1:3000}`,
      changeOrigin: true,
      secure: false,
      rewrite: (path) => {
        console.log(`Proxying request for: ${path}`); // 添加调试日志
        return path;
      },
  },
    }
  }
})
