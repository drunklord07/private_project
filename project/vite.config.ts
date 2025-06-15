import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['xlsx', 'file-saver'],
          ui: ['lucide-react', 'react-dropzone', 'react-beautiful-dnd']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    fs: {
      strict: false
    }
  }
});