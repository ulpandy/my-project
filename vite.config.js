import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,           // фронт будет работать здесь
    proxy: {
      '/api': {           // всё, что начинается с /api
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false      // если HTTPS не нужен
      }
    }
  }
});