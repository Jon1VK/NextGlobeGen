// @ts-check

/** @type {import("prettier").Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const prettierConfig = {
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  tailwindStylesheet: "./packages/frontend/src/styles/globals.css",
  tailwindFunctions: ["cn", "cva"],
};

export default prettierConfig;
