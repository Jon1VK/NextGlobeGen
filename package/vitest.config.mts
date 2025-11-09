import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: {
      "~": path.resolve("./src"),
      "next-globe-gen/schema": path.resolve("./src/types/schema"),
    },
    coverage: {
      include: ["src/**"],
      exclude: ["./src/__mocks__/**", "./src/types/**", "./src/cli/types.ts"],
    },
  },
});
