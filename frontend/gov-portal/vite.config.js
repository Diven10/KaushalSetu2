import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Port pinned so the backend's CORS allow-list covers it:
//   5173 trainee panel, 5174 employer panel, 5175 government portal.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    open: true,
  },
})
