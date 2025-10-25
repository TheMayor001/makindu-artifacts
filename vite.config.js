// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // CRITICAL FIX FOR GITHUB PAGES:
  // This sets the base URL for the built assets to be relative, 
  // ensuring the app can find its files regardless of the GitHub Pages subdirectory.
  base: './' 
})