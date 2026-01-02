import { defineConfig, Options } from "tsup";

type Plugin = Options["plugins"] extends (infer T)[] | undefined ? T : never;

const nextImportsPlugin: Plugin = {
  name: "next-imports-plugin",
  renderChunk(_, chunk) {
    if (this.format !== "esm") return;
    const code = chunk.code.replace(/from "next\/(.*)"/g, 'from "next/$1.js"');
    return { code };
  },
};

const sharedConfig: Options = {
  clean: true,
  format: ["cjs", "esm"],
  external: ["next-globe-gen"],
  splitting: false,
  shims: true,
};

export default defineConfig([
  {
    ...sharedConfig,
    entry: {
      cli: "src/cli/index.ts",
      plugin: "src/plugin/index.ts",
      middleware: "src/middleware/index.ts",
      proxy: "src/proxy/index.ts",
      "index.server": "src/router/server/index.ts",
    },
    dts: {
      entry: {
        "index.client": "src/router/client/index.ts",
        plugin: "src/plugin/index.ts",
        middleware: "src/middleware/index.ts",
        proxy: "src/proxy/index.ts",
      },
    },
  },
  {
    ...sharedConfig,
    esbuildOptions(options) {
      options.banner = { js: '"use client"' };
    },
    plugins: [nextImportsPlugin],
    entry: { "index.client": "src/router/client/index.ts" },
  },
]);
