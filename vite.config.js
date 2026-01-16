import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/  "homepage": "http://PNurmanM.github.io/To-Do-List",
export default defineConfig({
  base: '/To-Do-List/',
  plugins: [react()],
})
