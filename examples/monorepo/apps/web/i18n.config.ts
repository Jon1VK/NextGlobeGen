import { sharedI18nconfig } from "@repo/frontend/i18n.config";
import { DEFAULT_CONFIG, type Config } from "next-globe-gen/config";

/**
 * Configuration for i18n in the web-1 app.
 *
 * This configuration extends the default NextGlobeGen config to
 * include message entries from the shared frontend package, allowing
 * for reuse of translations across the monorepo.
 */
const config: Config = {
  locales: ["en", "fi"],
  defaultLocale: "en",
  messages: {
    originDir: "./src/messages",
    pruneUnusedKeys: true,
    async loadMessageEntries(locale) {
      const loadAppMessageEntries =
        // This binding is necessary to preserve correct `this` context
        DEFAULT_CONFIG.messages.loadMessageEntries.bind(this);
      const appMessageEntries = await loadAppMessageEntries(locale);
      const sharedMessageEntries =
        (await sharedI18nconfig.messages?.loadMessageEntries?.(locale)) ?? [];
      return [...appMessageEntries, ...sharedMessageEntries];
    },
  },
};

export default config;
