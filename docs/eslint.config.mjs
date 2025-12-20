// @ts-check

import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig(
  { ignores: [".docusaurus", "build"] },
  { languageOptions: { globals: { ...globals.node } } },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  // @ts-expect-error Wrong types
  compat.extends("plugin:@docusaurus/recommended"),
  { linterOptions: { reportUnusedDisableDirectives: true } },
);
