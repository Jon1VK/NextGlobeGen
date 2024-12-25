import type { NextConfig } from "next";
import { resolve } from "node:path";

/**
 * Adds an alias to the bundler config.
 * @param config The Next.js config object
 * @param aliases A map of aliases to their relative paths
 */
export function addAliases(
  nextConfig: NextConfig,
  aliases: Record<string, string>,
) {
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
    nextConfig.webpack = (config, options) => {
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
      if (typeof originalWebpack === "function") {
        return originalWebpack(config, options);
      }
      return config;
    };
  }
}
