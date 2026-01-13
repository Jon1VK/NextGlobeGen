// @ts-check

import nextVitals from "eslint-config-next/core-web-vitals";
import { defineConfig } from "eslint/config";
import { eslintConfigBase } from "./base.js";

/**
 * A custom ESLint configuration for Next.js.
 */
export const eslintConfigNextJs = defineConfig(
  { ignores: [".next", "next-env.d.ts"] },
  eslintConfigBase,
  nextVitals,
);
