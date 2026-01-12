import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_CONFIG, type Config } from "next-globe-gen/config";

// __dirname replacement for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Shared frontend package i18n configuration.
 * This package only generates message types (no routes).
 */
export const sharedI18nconfig: Config = {
  // Shared package supports all locales used by applications
  locales: ["en", "fi"],
  defaultLocale: "en",
  messages: {
    // We need an absolute path for originDir in shared packages so that
    // default message loading works correctly in applications
    originDir: path.resolve(__dirname, "./src/messages"),
    loadMessageEntries: DEFAULT_CONFIG.messages.loadMessageEntries,
    pruneUnusedKeys: true,
  },
};

export default sharedI18nconfig;
