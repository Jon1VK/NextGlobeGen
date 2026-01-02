import type { Formats } from "intl-messageformat";
import type {
  Config,
  DeepPartial,
  DomainConfig,
  MessagesConfig,
} from "./types";

export function mergeConfigs(a: Config, b: DeepPartial<Config>) {
  return {
    ...a,
    ...b,
    domains: mergeDomainConfigs(a.domains, b.domains),
    messages: mergeMessageConfigs(
      a.messages,
      b.messages as Partial<MessagesConfig> | undefined,
    ),
    routes: { ...a.routes, ...b.routes },
  } as Config;
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

export function getLocales(config: Config) {
  if (!config.domains) return config.locales;
  return config.domains
    .flatMap(({ locales }) => locales)
    .sort((a, b) => b.length - a.length);
}

export function getUnPrefixedLocales(config: Config) {
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
