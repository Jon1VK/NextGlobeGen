import type { Config } from "next-globe-gen/config";

const config: Config = {
  locales: ["en", "fi"],
  defaultLocale: "en",

  /**
   * Prefix default locale in URL paths (default: true)
   * Set to false to serve default locale from root path (e.g., "/" instead of "/en")
   */
  // prefixDefaultLocale: false,

  /**
   * Skip automatic language alternates metadata generation (default: false)
   * Set to true if you want to handle language alternates manually
   */
  // skipLanguageAlternatesMetadata: true,

  /**
   * Commented out domains config is used to test domain based routing locally
   */
  // domains: [
  //   {
  //     domain: "fi.localhost:3000",
  //     locales: ["fi"],
  //     defaultLocale: "fi",
  //   },
  //   {
  //     domain: "en.localhost:3000",
  //     locales: ["en", "en-US"],
  //     defaultLocale: "en",
  //   },
  // ],

  messages: {
    clientKeys: /client\./,
    pruneUnusedKeys: true,
    whitelistedKeys: [
      // These keys are used dynamically via template literals and cannot be statically extracted
      /^demos\.client\.titles\.(components|hooks|messages|functions|routing)$/,
      /^demos\.descriptions\.not-found$/,
    ],

    /**
     * Custom directories to scan for translation keys (default: ["./src"])
     */
    // keyExtractionDirs: ["./src", "./components"],

    /**
     * Custom message loading from external source (e.g., CMS, database)
     */
    // async loadMessageEntries(locale) {
    //   const response = await fetch(`https://cms.example.com/messages/${locale}`);
    //   const messages = await response.json();
    //   return Object.entries(messages).map(([key, message]) => ({
    //     key,
    //     message: message as string,
    //   }));
    // },

    /**
     * Custom message writing to external source
     */
    // async writeMessageEntries(locale, entries) {
    //   await fetch(`https://cms.example.com/messages/${locale}`, {
    //     method: "PUT",
    //     body: JSON.stringify(entries),
    //   });
    // },

    /**
     * Custom formats for number, date, and time formatting
     * These extend the default ICU format options
     */
    // formats: {
    //   number: {
    //     compact: { notation: "compact" },
    //   },
    //   date: {
    //     relative: { style: "long" },
    //   },
    // },
  },
};

export default config;
