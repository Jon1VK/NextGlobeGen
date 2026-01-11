// @ts-check

import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import { eslintConfigBase } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use React.
 */
export const eslintConfigReact = defineConfig(
  eslintConfigBase,
  // @ts-expect-error
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  pluginReactHooks.configs.flat.recommended,
  { settings: { react: { version: "detect" } } },
);
