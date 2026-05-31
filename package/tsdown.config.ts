import { defineConfig, type TsdownPlugin } from "tsdown";

const removeNextImportsJSExtensionPlugin: TsdownPlugin = {
  name: "next-imports-plugin",
  renderChunk(code) {
    return code.replace(/from "next\/(.*).js"/g, 'from "next/$1"');
  },
};

export default defineConfig([
  {
    dts: false,
    deps: { neverBundle: ["next-globe-gen/schema", "next-globe-gen/messages"] },
    plugins: [removeNextImportsJSExtensionPlugin],
    entry: {
      server: "./src/router/server/index.ts",
      cli: "./src/cli/index.ts",
    },
  },
  {
    dts: false,
    banner: { js: '"use client";' },
    deps: { neverBundle: ["next-globe-gen/schema", "next-globe-gen/messages"] },
    entry: {
      client: "./src/router/client/index.ts",
    },
  },
  {
    dts: false,
    deps: { neverBundle: ["next-globe-gen/schema", "next-globe-gen/messages"] },
    plugins: [removeNextImportsJSExtensionPlugin],
    entry: {
      config: "./src/config/index.ts",
      plugin: "./src/plugin/index.ts",
      middleware: "./src/middleware/index.ts",
      proxy: "./src/proxy/index.ts",
    },
  },
  {
    dts: { emitDtsOnly: true },
    plugins: [removeNextImportsJSExtensionPlugin],
    entry: {
      client: "./src/router/client/index.ts",
      config: "./src/config/index.ts",
      plugin: "./src/plugin/index.ts",
      middleware: "./src/middleware/index.ts",
      proxy: "./src/proxy/index.ts",
    },
  },
]);
