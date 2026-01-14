import type { Config } from "~/config/types";

const config: Config = {
  domains: [
    {
      domain: "en.example.com:3000",
      locales: ["en", "en-US"],
      defaultLocale: "en",
    },
    {
      domain: "fi.example.com:3000",
      locales: ["fi"],
      defaultLocale: "fi",
    },
  ],
};

export default config;
