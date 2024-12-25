import { defineConfig } from "tsup";

export default defineConfig([
  {
    clean: true,
    format: ["cjs", "esm"],
    external: ["next-globe-gen"],
    entry: {
      cli: "src/cli/index.ts",
      plugin: "src/plugin/index.ts",
      middleware: "src/middleware/index.ts",
      "index.server": "src/router/server/index.ts",
    },
    dts: {
      entry: {
        plugin: "src/plugin/index.ts",
        middleware: "src/middleware/index.ts",
      },
    },
  },
  {
    clean: true,
    format: ["cjs", "esm"],
    external: ["next-globe-gen"],
    esbuildOptions(options) {
      options.banner = { js: '"use client"' };
    },
    entry: { "index.client": "src/router/client/index.ts" },
    dts: true,
  },
]);
