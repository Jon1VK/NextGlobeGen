// @ts-check

import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import "eslint-plugin-only-warn";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

/**
 * A shared base ESLint configuration for the repository.
 */
export const eslintConfigBase = defineConfig(
  { ignores: ["*.mjs", "next-globe-gen"] },
  { linterOptions: { reportUnusedDisableDirectives: true } },
  eslint.configs.recommended,
  eslintConfigPrettier,
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
);
