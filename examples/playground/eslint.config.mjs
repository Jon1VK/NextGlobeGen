// @ts-check

import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import tailwind from "eslint-plugin-tailwindcss";
import { dirname } from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tailwind.configs["flat/recommended"],
  compat.extends("next/core-web-vitals", "next/typescript"),
  { linterOptions: { reportUnusedDisableDirectives: true } },
);
