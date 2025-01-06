import path from "path";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: {
      "~": path.resolve("./src"),
      "next-globe-gen/schema": path.resolve("./types/schema"),
    },
    coverage: {
      exclude: [
        "./src/__mocks__/**",
        "./src/types/**",
        "./src/cli/types.ts",
        ...coverageConfigDefaults.exclude,
      ],
    },
  },
});
