import type { Rewrite } from "next/dist/lib/load-custom-routes";
import type { WebpackConfigContext } from "next/dist/server/config-shared";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";
import withNextGlobeGenPlugin from ".";

const CONFIG_PATH = "./src/__mocks__/i18n.config.ts";

vi.mock("node:child_process");

const expectedRewrites: Rewrite[] = [
  {
    source: "/en-US/:path*",
    destination: "/en-US/:path*",
    has: [{ type: "host", value: "en.example.com" }],
  },
  {
    source: "/:path*",
    destination: "/en/:path*",
    has: [{ type: "host", value: "en.example.com" }],
  },
  {
    source: "/:path*",
    destination: "/fi/:path*",
    has: [{ type: "host", value: "fi.example.com" }],
  },
];

describe("plugin", () => {
  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllEnvs();
  });

  test("adds aliases correctly to webpack config", async () => {
    const config = await withNextGlobeGenPlugin(CONFIG_PATH)({})(
      "phase-production-server",
    );
    const webpackConfig = config.webpack?.(
      { context: "/" },
      {} as WebpackConfigContext,
    );
    expect(webpackConfig.resolve.alias).toStrictEqual({
      "next-globe-gen/schema": path.resolve("/next-globe-gen/schema.ts"),
      "next-globe-gen/messages": path.resolve("/next-globe-gen/messages.ts"),
    });
  });

  test("includes user defined custom webpack config", async () => {
    const config = await withNextGlobeGenPlugin(CONFIG_PATH)({
      webpack: (config) => {
        config.resolve = {};
        config.resolve.alias = { abc: "/abc.js" };
        return config;
      },
    })("phase-production-server");
    const webpackConfig = config.webpack?.(
      { context: "/home" },
      {} as WebpackConfigContext,
    );
    expect(webpackConfig.resolve.alias).toStrictEqual({
      abc: "/abc.js",
      "next-globe-gen/schema": path.resolve("/home/next-globe-gen/schema.ts"),
      "next-globe-gen/messages": path.resolve(
        "/home/next-globe-gen/messages.ts",
      ),
    });
  });

  test("adds aliases correctly to turbopack config", async () => {
    vi.stubEnv("TURBOPACK", "1");
    const config = await withNextGlobeGenPlugin(CONFIG_PATH)({})(
      "phase-production-server",
    );
    expect(config.turbopack?.resolveAlias).toStrictEqual({
      "next-globe-gen/schema": "./next-globe-gen/schema.ts",
      "next-globe-gen/messages": "./next-globe-gen/messages.ts",
    });
  });

  test("does not spawn child processes when in production", async () => {
    await withNextGlobeGenPlugin(CONFIG_PATH)({})("phase-production-server");
    expect(spawn).not.toBeCalled();
    expect(spawnSync).not.toBeCalled();
  });

  test("skip another spawn in build phase", async () => {
    vi.stubEnv("NEXT_DEPLOYMENT_ID", "1");
    await withNextGlobeGenPlugin(CONFIG_PATH)({})("phase-production-build");
    expect(spawn).not.toBeCalled();
    expect(spawnSync).not.toBeCalled();
  });

  test("spawns generator in sync mode when building", async () => {
    await withNextGlobeGenPlugin(CONFIG_PATH)({})("phase-production-build");
    expect(spawn).not.toBeCalled();
    expect(spawnSync).toHaveBeenCalledWith(
      "npx next-globe-gen --plugin --config ./src/__mocks__/i18n.config.ts",
      expect.objectContaining({
        stdio: "inherit",
        shell: true,
      }),
    );
  });

  test("adds domain rewrites correctly", async () => {
    vi.stubEnv("TURBOPACK", "1");
    const config = await withNextGlobeGenPlugin(CONFIG_PATH)({})(
      "phase-production-server",
    );
    const rewrites = await config.rewrites?.();
    expect(rewrites).toStrictEqual(expectedRewrites);
  });

  test("includes user defined rewrites array correctly", async () => {
    const config = await withNextGlobeGenPlugin(CONFIG_PATH)({
      async rewrites() {
        return [{ source: "/abc", destination: "/def" }];
      },
    })("phase-production-server");
    const rewrites = await config.rewrites?.();
    expect(rewrites).toStrictEqual([
      { source: "/abc", destination: "/def" },
      ...expectedRewrites,
    ]);
  });

  test("includes user defined rewrites object correctly", async () => {
    const config = await withNextGlobeGenPlugin(CONFIG_PATH)({
      async rewrites() {
        return {
          beforeFiles: [{ source: "/a", destination: "/b" }],
          afterFiles: [{ source: "/c", destination: "/d" }],
          fallback: [{ source: "/e", destination: "/f" }],
        };
      },
    })("phase-production-server");
    const rewrites = await config.rewrites?.();
    expect(rewrites).toStrictEqual({
      beforeFiles: [{ source: "/a", destination: "/b" }],
      afterFiles: [{ source: "/c", destination: "/d" }, ...expectedRewrites],
      fallback: [{ source: "/e", destination: "/f" }],
    });
  });
});
