
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Native esbuild configuration for production cleaning
  esbuild: {
    drop: ['console', 'debugger'],
  },
  define: {
    // Ensuring process.env is consistently mapped for Gemini SDK compatibility
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || process.env.API_KEY || ""),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Use esbuild for minification (default in Vite, requires no extra dependencies)
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['@firebase/app', '@firebase/auth', '@firebase/firestore'],
          genai: ['@google/genai'],
        },
      },
    },
  },
});
