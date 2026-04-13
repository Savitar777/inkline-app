import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('@supabase/supabase-js')) return 'supabase'
          if (id.includes('jspdf') || id.includes('html2canvas-pro')) return 'export'
          if (id.includes('jszip')) return 'zip'
        },
      },
    },
  },
})
