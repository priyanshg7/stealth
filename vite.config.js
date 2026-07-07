import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api requests to the KisanMitra backend proxy server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      // Proxy /ml-api requests to the local Python ML pipeline
      '/ml-api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ml-api/, '/api')
      }
    }
  }
})
