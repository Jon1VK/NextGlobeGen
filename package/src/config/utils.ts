import type { Formats } from "intl-messageformat";
import type {
  DeepPartial,
  DomainConfig,
  MessagesConfig,
  ResolvedConfig,
} from "./types";

/**
 * Deep merges two configuration objects, combining default config with user-provided config.
 * Handles special merging logic for domains, messages, and routes.
 * @param a - The base configuration (typically DEFAULT_CONFIG)
 * @param b - The partial user configuration to merge
 * @returns The merged configuration object
 */
export function mergeConfigs(
  a: ResolvedConfig,
  b: DeepPartial<ResolvedConfig>,
): ResolvedConfig {
  return {
    ...a,
    ...b,
    domains: mergeDomainConfigs(a.domains, b.domains),
    messages: mergeMessageConfigs(
      a.messages,
      b.messages as Partial<MessagesConfig> | undefined,
    ),
    routes: { ...a.routes, ...b.routes },
  } as ResolvedConfig;
}

function mergeDomainConfigs(a?: DomainConfig[], b?: DomainConfig[]) {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  return [...a, ...b];
}

function mergeMessageConfigs(a: MessagesConfig, b?: Partial<MessagesConfig>) {
  if (!b) return a;
  const formats = mergeFormatsConfigs(a.formats, b.formats);
  return { ...a, ...b, formats };
}

function mergeFormatsConfigs(a?: Partial<Formats>, b?: Partial<Formats>) {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  return { ...a, ...b };
}

/**
 * Extracts all supported locales from the configuration.
 * For prefix-based routing, returns the locales array directly.
 * For domain-based routing, extracts and deduplicates locales from all domains,
 * sorted by length (longest first) for proper matching.
 * @param config - The configuration object
 * @returns Array of locale codes
 */
export function getLocales(config: ResolvedConfig) {
  if (!config.domains) return config.locales;
  return config.domains
    .flatMap(({ locales }) => locales)
    .sort((a, b) => b.length - a.length);
}

/**
 * Determines which locales should not have a prefix in their URLs.
 * For prefix-based routing: returns empty set if prefixDefaultLocale is true,
 * otherwise returns a set containing only the default locale.
 * For domain-based routing: returns the default locales of domains
 * where prefixDefaultLocale is false.
 * @param config - The configuration object
 * @returns A Set of locale codes that should not be prefixed
 */
export function getUnPrefixedLocales(config: ResolvedConfig) {
  const prefixDefaultLocale =
    typeof config.routes.prefixDefaultLocale === "boolean"
      ? config.routes.prefixDefaultLocale
      : config.prefixDefaultLocale;
  if (!config.domains && prefixDefaultLocale) {
    return new Set<string>();
  }
  if (!config.domains && !prefixDefaultLocale) {
    return new Set([config.defaultLocale]);
  }
  return new Set(
    config
      .domains!.filter(({ prefixDefaultLocale }) => !prefixDefaultLocale)
      .map(({ defaultLocale }) => defaultLocale),
  );
}
