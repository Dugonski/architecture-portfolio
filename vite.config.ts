import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The 3D viewer chunk (three.js) is lazy-loaded on project pages only.
    chunkSizeWarningLimit: 1200,
  },
});
