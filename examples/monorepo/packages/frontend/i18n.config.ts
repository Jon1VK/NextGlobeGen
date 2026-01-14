import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_CONFIG, mergeConfigs } from "next-globe-gen/config";

// __dirname replacement for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// We need an absolute path for originDir in shared package so that
// message loading of shared messages works correctly in applications
const sharedThis = { originDir: path.resolve(__dirname, "./src/messages") };

// Store default message loader and writer to use in custom implementations
const defaultLoader = DEFAULT_CONFIG.messages.loadMessageEntries;
const defaultWriter = DEFAULT_CONFIG.messages.writeMessageEntries;

const SHARED_KEY_REGEX = /^shared\./;

/**
 * Shared i18n configuration used in multiple applications.
 */
export const sharedI18nconfig = mergeConfigs(DEFAULT_CONFIG, {
  locales: ["en", "fi"],
  defaultLocale: "en",
  messages: {
    // Enable pruning of unused keys to keep translation files clean
    pruneUnusedKeys: true,
    // Do not prune shared package keys to allow keys in the shared frontend
    // package to be used also in applications.
    whitelistedKeys: [SHARED_KEY_REGEX],
    // Applications need to load messages from both the application and the
    // shared frontend package message files.
    async loadMessageEntries(locale) {
      // This binding is necessary to preserve correct `this` context
      const loadAppMessageEntries = defaultLoader.bind(this);
      // This binding is necessary so that shared loader uses its own originDir
      const loadSharedMessageEntries = defaultLoader.bind(sharedThis);
      const appMessageEntries = await loadAppMessageEntries(locale);
      const sharedMessageEntries = await loadSharedMessageEntries(locale);
      return [...appMessageEntries, ...sharedMessageEntries];
    },
    // Since shared keys are not pruned, we need to split the entries
    // back to their respective files when writing.
    async writeMessageEntries(locale, entries) {
      const { sharedEntries = [], appEntries = [] } = Object.groupBy(
        entries,
        ({ key }) =>
          SHARED_KEY_REGEX.test(key) ? "sharedEntries" : "appEntries",
      );
      // This binding is necessary to preserve correct `this` context
      const writeAppMessageEntries = defaultWriter.bind(this);
      // This binding is necessary so that shared loader uses its own originDir
      const writeSharedMessageEntries = defaultWriter.bind(sharedThis);
      await writeAppMessageEntries(locale, appEntries);
      await writeSharedMessageEntries(locale, sharedEntries);
    },
  },
});

/**
 * Configuration for i18n in the frontend package.
 *
 * This configuration is only used to generate types for the frontend package.
 */
const config = mergeConfigs(sharedI18nconfig, {
  messages: {
    loadMessageEntries: defaultLoader,
    writeMessageEntries: defaultWriter,
  },
});

export default config;
