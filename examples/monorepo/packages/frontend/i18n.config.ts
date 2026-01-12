import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_CONFIG, mergeConfigs } from "next-globe-gen/config";

// __dirname replacement for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// We need an absolute path for originDir in shared package so that
// message loading of shared messages works correctly in applications
const sharedThis = { originDir: path.resolve(__dirname, "./src/messages") };

const defaultLoader = DEFAULT_CONFIG.messages.loadMessageEntries;

/**
 * Shared i18n configuration used in multiple applications.
 */
export const sharedI18nconfig = mergeConfigs(DEFAULT_CONFIG, {
  locales: ["en", "fi"],
  defaultLocale: "en",
  messages: {
    // Enable pruning of unused keys so that the shared messages will not be
    // written to the application message files if they are not used there.
    pruneUnusedKeys: true,
    async loadMessageEntries(locale) {
      // This binding is necessary to preserve correct `this` context
      const loadAppMessageEntries = defaultLoader.bind(this);
      // This binding is necessary so that shared loader uses its own originDir
      const loadSharedMessageEntries = defaultLoader.bind(sharedThis);
      const appMessageEntries = await loadAppMessageEntries(locale);
      const sharedMessageEntries = await loadSharedMessageEntries(locale);
      return [...appMessageEntries, ...sharedMessageEntries];
    },
  },
});

/**
 * Configuration for i18n in the frontend package.
 *
 * This configuration extends the shared i18n config to
 * use default message loading instead of the custom loader
 * defined in the shared config.
 */
const config = mergeConfigs(sharedI18nconfig, {
  messages: {
    loadMessageEntries: defaultLoader,
  },
});

export default config;
