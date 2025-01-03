import type { Config } from "next-globe-gen";

const config: Config = {
  locales: ["en", "fi"],
  defaultLocale: "en",
  messages: {
    clientKeys: /client\./,
  },
};

export default config;
