import type { Config } from "next-globe-gen";

const config: Config = {
  locales: ["en", "fi"],
  defaultLocale: "en",
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
  },
};

export default config;
