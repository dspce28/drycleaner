import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Version 2 ("Inside the studio"): built from v2/ into v2/dist.
export default defineConfig({
  root: 'v2',
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
})
