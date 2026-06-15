import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // Force the production React build when bundling. Without this, an ambient
  // NODE_ENV (e.g. from a running dev server) can leak the ~250KB development
  // build of react-dom into the production output.
  ...(command === 'build'
    ? { define: { 'process.env.NODE_ENV': JSON.stringify('production') } }
    : {}),
}))
