import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    reportCompressedSize: true,
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true },
    },
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('@supabase/supabase-js')) return 'supabase'
          if (id.includes('html2canvas-pro')) return 'capture'
          if (id.includes('jspdf')) return 'pdf-export'
          if (id.includes('jszip')) return 'zip'
          if (id.includes('file-saver')) return 'file-save'
          if (id.includes('pdfjs-dist')) return 'document-pdf'
          if (id.includes('mammoth')) return 'document-docx'
          if (id.includes('marked')) return 'document-markdown'
        },
      },
    },
  },
})
