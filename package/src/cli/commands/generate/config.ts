import { readFileSync } from "fs";
import path from "path";
import type { Config, UserConfig } from "~/cli/types";

export const DEFAULT_CONFIG: Config = {
  locales: [],
  defaultLocale: "",
  routes: {
    prefixDefaultLocale: true,
    originDir: "./src/_app",
    localizedDir: "./src/app/(i18n)",
  },
  messages: {
    originDir: "./src/messages",
    async getMessages(locale) {
      const messageFilePath = path.join(this.originDir, `${locale}.json`);
      const content = readFileSync(messageFilePath).toString();
      return JSON.parse(content);
    },
  },
};

export function mergeConfigs(a: Config, b: Partial<UserConfig>): Config {
  return {
    ...a,
    ...b,
    messages: { ...a.messages, ...b.messages },
    routes: { ...a.routes, ...b.routes },
  };
}
