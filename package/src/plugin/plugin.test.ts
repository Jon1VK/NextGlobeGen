import type { WebpackConfigContext } from "next/dist/server/config-shared";
import { spawn, spawnSync } from "node:child_process";
import { afterEach, describe, expect, test, vi } from "vitest";
import { withNextGlobeGenPlugin } from ".";

vi.mock("node:child_process");

describe("plugin", () => {
  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllEnvs();
  });

  test("adds aliases correctly to webpack config", () => {
    const config = withNextGlobeGenPlugin()({})("phase-production-server");
    const webpackConfig = config.webpack?.(
      { context: "/" },
      {} as WebpackConfigContext,
    );
    expect(webpackConfig.resolve.alias).toStrictEqual({
      "next-globe-gen/schema": "/.next-globe-gen/schema.ts",
      "next-globe-gen/messages": "/.next-globe-gen/messages.ts",
    });
  });

  test("includes user defined custom webpack config", () => {
    const config = withNextGlobeGenPlugin()({
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
      "next-globe-gen/schema": "/home/.next-globe-gen/schema.ts",
      "next-globe-gen/messages": "/home/.next-globe-gen/messages.ts",
    });
  });

  test("adds aliases correctly to turbopack config", () => {
    vi.stubEnv("TURBOPACK", "1");
    const config = withNextGlobeGenPlugin()({})("phase-production-server");
    expect(config.experimental?.turbo?.resolveAlias).toStrictEqual({
      "next-globe-gen/schema": "./.next-globe-gen/schema.ts",
      "next-globe-gen/messages": "./.next-globe-gen/messages.ts",
    });
  });

  test("does not spawn child processes when in production", () => {
    withNextGlobeGenPlugin()({})("phase-production-server");
    expect(spawn).not.toBeCalled();
    expect(spawnSync).not.toBeCalled();
  });

  test("spawns generator in async watch mode when in dev", () => {
    withNextGlobeGenPlugin()({})("phase-development-server");
    expect(spawnSync).not.toBeCalled();
    expect(spawn).toHaveBeenCalledWith(
      "npx next-globe-gen --watch --config ./i18n.config.ts",
      expect.objectContaining({
        stdio: "inherit",
        shell: true,
        detached: false,
      }),
    );
  });

  test("does not spawn child processes when executed in a dev worker", () => {
    vi.stubEnv("NEXT_PRIVATE_WORKER", "1");
    withNextGlobeGenPlugin()({})("phase-development-server");
    expect(spawn).not.toBeCalled();
    expect(spawnSync).not.toBeCalled();
  });

  test("skip another spawn in build phase", () => {
    vi.stubEnv("NEXT_DEPLOYMENT_ID", "1");
    withNextGlobeGenPlugin()({})("phase-production-build");
    expect(spawn).not.toBeCalled();
    expect(spawnSync).not.toBeCalled();
  });

  test("spawns generator in sync mode when building", () => {
    withNextGlobeGenPlugin()({})("phase-production-build");
    expect(spawn).not.toBeCalled();
    expect(spawnSync).toHaveBeenCalledWith(
      "npx next-globe-gen --config ./i18n.config.ts",
      expect.objectContaining({
        stdio: "inherit",
        shell: true,
      }),
    );
  });
});
