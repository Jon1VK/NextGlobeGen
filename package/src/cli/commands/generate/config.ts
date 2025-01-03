import { readdirSync, readFileSync } from "fs";
import path from "path";
import { parse } from "yaml";
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
    getMessages,
  },
};

const FILE_EXTENSIONS = [".json", ".yml", ".yaml"];

function getMessages(this: { originDir: string }, locale: string) {
  return {
    ...getIndexMessages.bind(this)(locale),
    ...getLocaleDirMessages.bind(this)(locale),
  };
}

function getIndexMessages(this: { originDir: string }, locale: string) {
  let messages: Record<string, unknown> = {};
  FILE_EXTENSIONS.forEach((extension) => {
    const filePath = path.join(this.originDir, `${locale}${extension}`);
    if (!isFile(filePath)) return;
    const content = readFileSync(filePath).toString();
    const parsedContent =
      extension === ".json" ? JSON.parse(content) : parse(content);
    messages = { ...messages, ...parsedContent };
  });
  return messages;
}

function getLocaleDirMessages(this: { originDir: string }, locale: string) {
  let messages: Record<string, unknown> = {};
  const localeDirPath = path.join(this.originDir, locale);
  if (!isDirectory(localeDirPath)) return messages;
  const files = readdirSync(localeDirPath);
  for (const file of files) {
    const extension = path.extname(file);
    if (!FILE_EXTENSIONS.includes(extension)) continue;
    const filePath = path.join(localeDirPath, file);
    const namespace = file.replace(extension, "");
    const content = readFileSync(filePath).toString();
    const parsedContent =
      extension === ".json" ? JSON.parse(content) : parse(content);
    if (namespace === "index") {
      messages = { ...messages, ...parsedContent };
    } else {
      messages[namespace] = parsedContent;
    }
  }
  return messages;
}

export function mergeConfigs(a: Config, b: Partial<UserConfig>): Config {
  return {
    ...a,
    ...b,
    messages: { ...a.messages, ...b.messages },
    routes: { ...a.routes, ...b.routes },
  };
}
