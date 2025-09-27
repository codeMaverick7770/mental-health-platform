import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Counselor APIs should go to the Backend server (port 5000)
      '/api/counselor/reports': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/api/counselor/report': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/api/counselor/session': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/api/counselor/sessions': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/api/counselor': { target: 'http://localhost:5000', changeOrigin: true, secure: false },

      // Booking endpoint (handled by backend)
      '/api/book': { target: 'http://localhost:5000', changeOrigin: true, secure: false },

      // Voice Assistant APIs (admin, tts, resources, sessions, hooks)
      '/api/admin': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/api/tts': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/api/resources': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/api/session': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/api/hooks': { target: 'http://localhost:3000', changeOrigin: true, secure: false },

      // Main Backend APIs (booking, counsellors)
      // Route booking to Voice Assistant proxy which then calls backend
      '/api/counsellors': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      // Direct backend access (DB-backed APIs)
      '/api-backend': { target: 'http://localhost:5000', changeOrigin: true, secure: false }
    }
  }
})