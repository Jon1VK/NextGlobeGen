import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: { "~": path.join(process.cwd(), "/src") },
  },
});
