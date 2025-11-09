// @ts-check

import eslint from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,
  eslintConfigPrettier,
  tseslint.configs.recommended,
  nextVitals,
  { linterOptions: { reportUnusedDisableDirectives: true } },
);
