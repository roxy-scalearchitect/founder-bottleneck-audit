import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the built app works when hosted from a subpath
  // (e.g. GitHub Pages) or opened from the filesystem.
  base: './',
});
