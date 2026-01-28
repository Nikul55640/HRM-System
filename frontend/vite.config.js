import path from "path";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state-vendor': ['zustand'],
          'ui-vendor': ['@radix-ui/react-slot', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'date-vendor': ['date-fns'],
          'icons-vendor': ['lucide-react'],
          'toast-vendor': ['react-toastify'],
        }
      }
    },
    chunkSizeWarningLimit: 300, // Warn if chunk > 300kb (reduced from 500kb)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    }
  },
  // Add performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'date-fns', 'lucide-react']
  }
});
