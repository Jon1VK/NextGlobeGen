import { readdirSync, readFileSync } from "fs";
import type { Formats } from "intl-messageformat";
import path from "path";
import { parse } from "yaml";
import { isDirectory, isFile } from "~/utils/fs-utils";

type PrefixConfig = {
  /** List of all supported locale codes */
  locales: string[];
  /** The default locale to use when no locale is specified */
  defaultLocale: string;
  /** Whether to prefix the default locale in URLs (defaults to true) */
  prefixDefaultLocale?: boolean;
  domains?: never;
};

type DomainsConfig = {
  locales?: never;
  defaultLocale?: never;
  prefixDefaultLocale?: never;
  /** Array of domain configurations, each serving specific locales */
  domains: DomainConfig[];
};

export type DomainConfig = {
  /** The domain name (e.g., "example.com" or "example.com:3000") */
  domain: string;
  /** List of locale codes served from this domain */
  locales: string[];
  /** The default locale for this domain */
  defaultLocale: string;
  /** Whether to prefix the default locale in URLs (defaults to true) */
  prefixDefaultLocale?: boolean;
};

type RoutesConfig = {
  /**
   * @deprecated Will be removed on next major release. Use prefixDefaultLocale option at the root level instead.
   */
  prefixDefaultLocale?: boolean;
  /** Directory containing the original route files (default: "./src/_app") */
  originDir: string;
  /** Directory where localized routes will be generated (default: "./src/app/(i18n)") */
  localizedDir: string;
  /** Skip generating language alternates metadata in route files (default: false) */
  skipLanguageAlternatesMetadata?: boolean;
};

type MessagesConfig = {
  /** Directory containing message files (default: "./src/messages") */
  originDir: string;
  /** Regular expressions to filter which message keys are sent to the client */
  clientKeys?: RegExp[] | RegExp;
  /** Custom format configurations for date, time, number, and plural formatting */
  formats?: Partial<Formats>;
  /** Function to load messages for a given locale */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMessages: (locale: string) => Promise<any> | any;
};

export type Config = {
  routes: RoutesConfig;
  messages: MessagesConfig;
} & (PrefixConfig | DomainsConfig);

type DeepPartial<T> =
  T extends Record<string, unknown>
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;

/**
 * User-provided configuration for next-globe-gen.
 * All properties except locale configuration are optional and will be merged with defaults.
 *
 * @example
 * // Basic prefix-based routing
 * const config = {
 *   locales: ["en", "fi"],
 *   defaultLocale: "en",
 * };
 *
 * @example
 * // Domain-based routing
 * const config = {
 *   domains: [
 *     { domain: "example.com", locales: ["en"], defaultLocale: "en" },
 *     { domain: "example.fi", locales: ["fi"], defaultLocale: "fi" },
 *   ],
 * };
 */
export type UserConfig = DeepPartial<{
  /** Configuration for route generation and localization */
  routes: RoutesConfig;
  /** Configuration for message loading and formatting */
  messages: MessagesConfig;
}> &
  (PrefixConfig | DomainsConfig);

export const DEFAULT_CONFIG: Config = {
  locales: [],
  defaultLocale: "",
  prefixDefaultLocale: true,
  routes: {
    originDir: "./src/_app",
    localizedDir: "./src/app/(i18n)",
  },
  messages: {
    originDir: "./src/messages",
    getMessages,
  },
};

const FILE_EXTENSIONS = [".json", ".yml", ".yaml"];

function getMessages(this: { originDir: string }, locale: string) {
  return {
    ...getIndexMessages.bind(this)(locale),
    ...getDirMessages.bind(this)(locale),
  };
}

function getIndexMessages(this: { originDir: string }, locale: string) {
  let messages: Record<string, unknown> = {};
  FILE_EXTENSIONS.forEach((extension) => {
    const filePath = path.join(this.originDir, `${locale}${extension}`);
    if (!isFile(filePath)) return;
    const content = readFileSync(filePath).toString();
    const parsedContent =
      extension === ".json" ? JSON.parse(content) : parse(content);
    messages = { ...messages, ...parsedContent };
  });
  return messages;
}

function getDirMessages(
  this: { originDir: string },
  dir: string,
): Record<string, unknown> {
  let messages: Record<string, unknown> = {};
  const dirPath = path.join(this.originDir, dir);
  if (!isDirectory(dirPath)) return messages;
  const files = readdirSync(dirPath, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      const dirPath = path.join(dir, file.name);
      const dirMessages = getDirMessages.bind(this)(dirPath);
      messages[file.name] = dirMessages;
      continue;
    }
    const extension = path.extname(file.name);
    if (!FILE_EXTENSIONS.includes(extension)) continue;
    const filePath = path.join(dirPath, file.name);
    const namespace = file.name.replace(extension, "");
    const content = readFileSync(filePath).toString();
    const parsedContent =
      extension === ".json" ? JSON.parse(content) : parse(content);
    if (namespace === "index") {
      messages = { ...messages, ...parsedContent };
    } else {
      messages[namespace] = parsedContent;
    }
  }
  return messages;
}

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
