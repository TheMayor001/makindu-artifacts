import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// 1. This import is necessary for the resolve.alias setting below
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // CRITICAL DEPLOYMENT FIX: This tells Vite to use relative paths (e.g., ./assets)
  // instead of absolute paths (e.g., /assets), which is necessary for serving
  // from a subdirectory like 'makindu-artifacts' on GitHub Pages.
  base: "./",

  // 2. Local Fix for the stubborn fsevents issue (keep this)
  resolve: {
    alias: {
      // Force 'fsevents' imports to resolve to our empty stub module.
      fsevents: path.resolve(__dirname, "./stub.js"),
    },
  },

  // Keeping this for redundancy
  optimizeDeps: {
    exclude: ["fsevents"],
  },

  server: {
    // Turning off the HMR error overlay
    hmr: {
      overlay: false,
    },
  },
});
