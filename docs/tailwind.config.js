/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{src,docs}/**/*.{js,jsx,ts,tsx,mdx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  corePlugins: {
    preflight: false,
    container: false,
  },
  theme: {},
  plugins: [],
};
