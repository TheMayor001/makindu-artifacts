/** @type {import('tailwindcss').Config} */
export default {
  // This content array tells Tailwind to scan these files for classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all files in src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
