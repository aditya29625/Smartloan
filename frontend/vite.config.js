import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth':        { target: 'http://localhost:8000', changeOrigin: true },
      '/predictions': { target: 'http://localhost:8000', changeOrigin: true },
      '/dashboard':   { target: 'http://localhost:8000', changeOrigin: true },
      '/profile':     { target: 'http://localhost:8000', changeOrigin: true },
      '/admin':       { target: 'http://localhost:8000', changeOrigin: true },
      '/health':      { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
