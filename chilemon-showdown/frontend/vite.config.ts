import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://fullstack.dcc.uchile.cl:7142',
        changeOrigin: true,
      },
    }
  }
})
