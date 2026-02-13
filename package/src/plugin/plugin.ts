import type { NextConfig } from "next";
import type {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_EXPORT,
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
  PHASE_TEST,
} from "next/constants";
import type { Rewrite } from "next/dist/lib/load-custom-routes";
import type { NextJsWebpackConfig } from "next/dist/server/config-shared";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import type { Config, DomainConfig } from "~/config/types";
import { compile } from "~/utils/ts-utils";
import { detectPackageManagerRunner } from "./detectPackageManagerRunner";

type Phase =
  | typeof PHASE_EXPORT
  | typeof PHASE_PRODUCTION_BUILD
  | typeof PHASE_PRODUCTION_SERVER
  | typeof PHASE_DEVELOPMENT_SERVER
  | typeof PHASE_TEST;

/**
 * This function creates the wrapper function for your Next.js config object.
 *
 * @example
 * import createNextGlobeGenPlugin from "next-globe-gen/plugin";
 * const withNextGlobeGen = createNextGlobeGenPlugin();
 * export default withNextGlobeGen({
 *   // Next.js config options here
 * });
 */
export default function createNextGlobeGenPlugin(
  configPath = "./i18n.config.ts",
) {
  return function withNextGlobeGen(config: NextConfig) {
    return async (phase: Phase) => {
      const userConfig = await compile<{ default: Config }>(configPath);
      const outDir = userConfig.default.outDir ?? "./next-globe-gen";
      await useGenerator(configPath, phase);
      return addDomainRewrites(
        addAliases(config, {
          "next-globe-gen/schema": `${outDir}/schema.ts`,
          "next-globe-gen/messages": `${outDir}/messages.ts`,
        }),
        userConfig.default.domains,
      );
    };
  };
}

async function useGenerator(configPath: string, phase: Phase) {
  const nextjsVersion = getNextJSVersion();
  // prettier-ignore
  if (nextjsVersion.major >= 16 && phase === "phase-development-server" && !process.env.NEXT_PRIVATE_WORKER) return;
  if (nextjsVersion.major < 16 && process.env.NEXT_PRIVATE_WORKER) return;
  if (process.env.NEXT_DEPLOYMENT_ID !== undefined) return;
  const runner = detectPackageManagerRunner();
  try {
    if (phase !== "phase-production-server") {
      spawnSync(`${runner} next-globe-gen --plugin --config ${configPath}`, {
        cwd: process.cwd(),
        stdio: "inherit",
        shell: true,
      });
    }
    if (phase === "phase-development-server") {
      const abortController = new AbortController();
      process.on("exit", () => {
        abortController.abort();
      });
      process.on("SIGINT", () => {
        abortController.abort();
        process.exit();
      });
      process.on("SIGTERM", () => {
        abortController.abort();
        process.exit();
      });
      spawn(
        `${runner} next-globe-gen --plugin --watch --config ${configPath}`,
        {
          cwd: process.cwd(),
          stdio: "inherit",
          shell: true,
          detached: false,
          signal: abortController.signal,
        },
      );
    }
  } catch (error) {
    console.error("Failed to spawn the NextGlobeGen compiler process");
    throw error;
  }
}

function getNextJSVersion() {
  const requireFunc = createRequire(process.cwd() + "/package.json");
  const version = requireFunc("next/package.json").version;
  const [major, minor, patch] = version.split(".").map(Number);
  return { major, minor, patch };
}

/**
 * Adds an alias to the bundler config.
 * @param config The Next.js config object
 * @param aliases A map of aliases to their relative paths
 * @returns The modified Next.js config object with the aliases added
 */
function addAliases(nextConfig: NextConfig, aliases: Record<string, string>) {
  if (process.env.TURBOPACK) {
    nextConfig.experimental ??= {};
    nextConfig.experimental.turbo ??= {};
    nextConfig.experimental.turbo.resolveAlias ??= {};
    nextConfig.experimental.turbo.resolveAlias = {
      ...nextConfig.experimental.turbo.resolveAlias,
      ...aliases,
    };
    return nextConfig;
  }
  const webpack: NextJsWebpackConfig = (inputConfig, options) => {
    const config = nextConfig.webpack?.(inputConfig, options) ?? inputConfig;
    const absoluteAliases: Record<string, string> = {};
    for (const [alias, relativePath] of Object.entries(aliases)) {
      absoluteAliases[alias] = resolve(config.context, relativePath);
    }
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      ...absoluteAliases,
    };
    return config;
  };
  return Object.assign({}, nextConfig, { webpack });
}

/**
 * Adds domain rewrite rules to the next.js config.
 * @param config The Next.js config object
 * @param domains An array of domain based routes
 * @return The modified Next.js config object with the domain rewrites added
 */
function addDomainRewrites(nextConfig: NextConfig, domains?: DomainConfig[]) {
  if (!domains) return nextConfig;
  const domainRewrites: Rewrite[] = domains
    .filter(({ prefixDefaultLocale }) => !prefixDefaultLocale)
    .flatMap(({ domain, locales, defaultLocale }) => {
      return [
        ...locales
          .filter((locale) => locale !== defaultLocale)
          .map<Rewrite>((locale) => ({
            source: `/${locale}/:path*`,
            destination: `/${locale}/:path*`,
            has: [{ type: "host", value: domain.split(":").at(0)! }],
          })),
        {
          source: `/:path*`,
          destination: `/${defaultLocale}/:path*`,
          has: [{ type: "host", value: domain.split(":").at(0)! }],
        },
      ];
    });
  const rewrites = async function rewrites() {
    const originalRewrites = await nextConfig.rewrites?.();
    if (!originalRewrites) return domainRewrites;
    if (Array.isArray(originalRewrites)) {
      return [...originalRewrites, ...domainRewrites];
    }
    return {
      ...originalRewrites,
      afterFiles: originalRewrites.afterFiles
        ? [...originalRewrites.afterFiles, ...domainRewrites]
        : domainRewrites,
    };
  };
  return Object.assign({}, nextConfig, { rewrites });
}

/**
 * @deprecated Will be removed in the next major release. Use default export instead.
 */
export const withNextGlobeGenPlugin = createNextGlobeGenPlugin;
