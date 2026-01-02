import type { Formats } from "intl-messageformat";

/** Configuration for prefix-based locale routing */
export type PrefixConfig = {
  /** List of all supported locale codes */
  locales: string[];
  /** The default locale to use when no locale is specified */
  defaultLocale: string;
  /** Whether to prefix the default locale in URLs (defaults to true) */
  prefixDefaultLocale?: boolean;
  domains?: never;
};

/** Configuration for domain-based locale routing */
export type DomainsConfig = {
  locales?: never;
  defaultLocale?: never;
  prefixDefaultLocale?: never;
  /** Array of domain configurations, each serving specific locales */
  domains: DomainConfig[];
};

/** Configuration for a single domain in domain-based routing */
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

/** Configuration for route generation and localization */
export type RoutesConfig = {
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

/**
 * Represents a single message entry for internationalization.
 * Used when writing messages to locale files during key extraction.
 */
export type MessageEntry = {
  /** The dot-separated message key (e.g., "common.buttons.submit") */
  key: string;
  /** The message content, which may contain ICU message format syntax */
  message: string;
  /** Optional description comment to be included above the message in YAML files */
  description?: string;
};

/** Configuration for message loading, formatting, and key extraction */
export type MessagesConfig = {
  /** Directory containing message files (default: "./src/messages") */
  originDir: string;
  /** Regular expressions to filter which message keys are sent to the client */
  clientKeys?: RegExp[] | RegExp;
  /** Custom format configurations for date, time, number, and plural formatting */
  formats?: Partial<Formats>;
  /**
   * Function to load messages for a given locale
   * @deprecated Use `loadMessageEntries` instead. Will be removed in next major release.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMessages?: (locale: string) => Promise<any> | any;
  /** Function to load message entries for a given locale */
  loadMessageEntries: (
    locale: string,
  ) => Promise<MessageEntry[]> | MessageEntry[];
  /** Function to write message entries for a given locale. Used to persist updated message keys during key extraction. */
  writeMessageEntries: (
    locale: string,
    messageEntries: MessageEntry[],
  ) => Promise<void> | void;
  /** Directories to scan for translation key usage. Set to an empty array to disable extraction. (defaults to ["./src"]) */
  keyExtractionDirs: string[];
  /** Remove unused keys from message files when extracting (default: false) */
  pruneUnusedKeys?: boolean;
  /** Regular expressions to whitelist keys from being pruned */
  whitelistedKeys?: RegExp[] | RegExp;
};

/** Complete configuration for next-globe-gen */
export type Config = {
  routes: RoutesConfig;
  messages: MessagesConfig;
} & (PrefixConfig | DomainsConfig);

export type DeepPartial<T> =
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
