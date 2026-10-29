import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` -> normal multi-file build in dist/ for hosting.
// `npm run build:preview` -> one self-contained HTML file in dist-preview/ for sharing.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'preview' ? [viteSingleFile()] : [])],
  build: mode === 'preview' ? { outDir: 'dist-preview' } : { outDir: 'dist' },
}))
