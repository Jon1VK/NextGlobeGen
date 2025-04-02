import type { NextConfig } from "next";
import type {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_EXPORT,
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
  PHASE_TEST,
} from "next/constants";
import type { Rewrite } from "next/dist/lib/load-custom-routes";
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import type { Config, UserConfig } from "~/utils/config";
import debugLog from "~/utils/debug-print";
import { compile } from "~/utils/ts-utils";

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
  debugLog(`Creating NextGlobeGen plugin with config path: ${configPath}`);

  return function withNextGlobeGen(config: NextConfig) {
    debugLog(`Initializing NextGlobeGen plugin`);

    return async (phase: Phase) => {
      debugLog(`Plugin phase: ${phase}`);

      debugLog(`Compiling user config from: ${configPath}`);
      const userConfig = await compile<{ default: UserConfig }>(configPath);

      debugLog(`Setting up generator`);
      useGenerator(configPath, phase);

      debugLog(`Adding aliases to Next.js config`);
      addAliases(config, {
        "next-globe-gen/schema": "./next-globe-gen/schema.ts",
        "next-globe-gen/messages": "./next-globe-gen/messages.ts",
      });

      debugLog(`Adding domain rewrites`);
      await addDomainRewrites(config, userConfig.default.domains);

      return config;
    };
  };
}

function useGenerator(configPath: string, phase: Phase) {
  debugLog(`Using generator in phase: ${phase}`);

  if (process.env.NEXT_PRIVATE_WORKER) {
    debugLog(`Skipping generator - NEXT_PRIVATE_WORKER is set`);
    return;
  }

  if (process.env.NEXT_DEPLOYMENT_ID !== undefined) {
    debugLog(`Skipping generator - NEXT_DEPLOYMENT_ID is set`);
    return;
  }

  try {
    if (phase !== "phase-production-server") {
      debugLog(`Running next-globe-gen compiler`);
      spawnSync(`npx next-globe-gen --config ${configPath}`, {
        cwd: process.cwd(),
        stdio: "inherit",
        shell: true,
      });
    }

    if (phase === "phase-development-server") {
      debugLog(`Starting next-globe-gen in watch mode`);
      spawn(`npx next-globe-gen --watch --config ${configPath}`, {
        cwd: process.cwd(),
        stdio: "inherit",
        shell: true,
        detached: false,
      });
    }
  } catch (error) {
    debugLog(`Failed to spawn NextGlobeGen compiler process: ${error}`);
    console.error("Failed to spawn the NextGlobeGen compiler process");
  }
}

/**
 * Adds an alias to the bundler config.
 * @param config The Next.js config object
 * @param aliases A map of aliases to their relative paths
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
  } else {
    const originalWebpack = nextConfig.webpack;
    nextConfig.webpack = (nextConfig, options) => {
      const config = originalWebpack?.(nextConfig, options) ?? nextConfig;
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
  }
}

/**
 * Adds domain rewrite rules to the next.js config.
 * @param config The Next.js config object
 * @param domains An array of domain based routes
 */
async function addDomainRewrites(
  nextConfig: NextConfig,
  domains: Config["domains"],
) {
  if (!domains) return;
  const originalRewrites = await nextConfig.rewrites?.();
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
  nextConfig.rewrites = async function rewrites() {
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
}

/**
 * @deprecated Will be removed in the next major release. Use default export instead.
 */
export const withNextGlobeGenPlugin = createNextGlobeGenPlugin;
