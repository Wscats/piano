import { defineConfig } from 'vite'

export default defineConfig({
  // Serve public directory (contains piano.wasm, mp3 samples)
  publicDir: 'public',

  // Worker support
  worker: {
    format: 'es',
  },

  build: {
    target: 'es2022',
    outDir: 'dist',
  },

  server: {
    port: 5173,
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.jsx', '.js'],
  },

  // Omi uses h() as JSX factory
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'h.f',
  },
})
