import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 6001,
    proxy: {
      '/auth': {
        target: 'http://localhost:8007',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://localhost:8007',
        changeOrigin: true,
      },
      '/plans': {
        target: 'http://localhost:8007',
        changeOrigin: true,
      },
      '/tenants': {
        target: 'http://localhost:8007',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:8007',
        changeOrigin: true,
      },
      '/usage': {
        target: 'http://localhost:8007',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8007',
        changeOrigin: true,
      },
    },
  },
})
