import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Replace 'hydro-flow' with your EXACT repo name if it's different
  base: "/hydro-flow/", 
})