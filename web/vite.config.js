import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Backend (DB-backed) counselor sessions
      // Route counselor session APIs to Voice Assistant service (dev in-memory store)
      '/api/counselor/sessions': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/api/counselor/session': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      // Voice Assistant APIs (admin, counselor, tts, resources, sessions, hooks)
      '/api/admin': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/api/counselor': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/api/tts': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/api/resources': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/api/session': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/api/hooks': { target: 'http://localhost:3000', changeOrigin: true, secure: false },

      // Main Backend APIs (booking, counsellors)
      // Route booking to Voice Assistant proxy which then calls backend
      '/api/book': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/api/counsellors': { target: 'http://localhost:5000', changeOrigin: true, secure: false }
    }
  }
})