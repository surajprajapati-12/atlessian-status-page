import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        client: path.resolve(__dirname, 'src/client/main.tsx'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  ssr: {
    noExternal: ['react', 'react-dom', 'react-router-dom'],
    target: 'node',
    format: 'esm',
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['fsevents'],
  },
  server: {
    middlewareMode: true,
  },
});