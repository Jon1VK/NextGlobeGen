// @ts-check

import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import globals from "globals";
import path from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  { ignores: [".docusaurus"] },
  { languageOptions: { globals: { ...globals.node } } },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  compat.extends("plugin:@docusaurus/recommended"),
  { linterOptions: { reportUnusedDisableDirectives: true } },
);
