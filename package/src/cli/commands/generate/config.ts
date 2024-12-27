import { readdirSync, readFileSync } from "fs";
import path from "path";
import type { Config, UserConfig } from "~/cli/types";
import { isDirectory, isFile } from "~/cli/utils/fs-utils";

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
      let messages: Record<string, unknown> = {};
      const indexFilePath = path.join(this.originDir, `${locale}.json`);
      if (isFile(indexFilePath)) {
        const content = JSON.parse(readFileSync(indexFilePath).toString());
        messages = content;
      }
      const localeDirPath = path.join(this.originDir, locale);
      if (!isDirectory(localeDirPath)) return messages;
      const files = readdirSync(localeDirPath);
      for (const file of files) {
        const fileExtension = path.extname(file);
        if (fileExtension !== ".json") continue;
        const filePath = path.join(localeDirPath, file);
        const namespace = file.replace(fileExtension, "");
        const content = JSON.parse(readFileSync(filePath).toString());
        if (namespace === "index") {
          messages = { ...messages, ...content };
        } else {
          messages[namespace] = content;
        }
      }
      return messages;
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
