import { writeFileSync } from "fs";
import path from "path";
import type { Config, OriginRoute } from "~/cli/types";
import { makeDirectory } from "~/cli/utils/fs-utils";
import {
  getRouteName,
  getRoutePath,
  isPageOriginRoute,
} from "~/cli/utils/route-utils";
import { toPascalCase } from "~/cli/utils/string-utils";
import { getMessages } from "./getMessages";

const OUT_DIR = "./.next-globe-gen";

const template = (type: "schema" | "messages") => {
  return "".concat(
    `export const ${type} = {${type}} as const;\n\n`,
    type === "messages"
      ? "export const clientMessages = {clientMessages};\n\n"
      : "",
    `declare module "next-globe-gen" {\n`,
    `\tinterface ${toPascalCase(type)}Register {\n`,
    `\t\t${type}: typeof ${type}\n\t}\n}\n`,
  );
};

export function generateOutdirs(localizedDir: string) {
  makeDirectory(OUT_DIR);
  writeFileSync(path.join(OUT_DIR, ".gitignore"), "*");
  writeFileSync(path.join(OUT_DIR, ".prettierignore"), "*");
  makeDirectory(localizedDir);
  writeFileSync(path.join(localizedDir, ".gitignore"), "*");
  writeFileSync(path.join(localizedDir, ".prettierignore"), "*");
  generateDeclarationFile();
}

function generateDeclarationFile() {
  const declarationFileContent = "".concat(
    "/* eslint-disable @typescript-eslint/triple-slash-reference */\n",
    '/// <reference path="./.next-globe-gen/schema.ts" />\n',
    '/// <reference path="./.next-globe-gen/messages.ts" />\n',
  );
  const declarationFilePath = "next-globe-gen.d.ts";
  writeFileSync(declarationFilePath, declarationFileContent);
}

export function generateSchemaFile(
  config: Config,
  originRoutes: OriginRoute[],
) {
  const routes: Record<string, Record<string, string>> = {};
  originRoutes.forEach((originRoute) => {
    if (!isPageOriginRoute(originRoute)) return;
    const routeName = getRouteName(originRoute.path);
    routes[routeName] ||= {};
    Object.entries(originRoute.localizedPaths).forEach(
      ([locale, localizedPath]) => {
        const routePath = getRoutePath(localizedPath);
        routes[routeName]![locale] = routePath;
      },
    );
  });
  const schema = {
    locales: config.locales,
    defaultLocale: config.defaultLocale,
    prefixDefaultLocale: config.routes.prefixDefaultLocale,
    routes,
  };
  const JSONSchema = JSON.stringify(schema);
  const schemaFile = template("schema").replace("{schema}", JSONSchema);
  const schemaFilePath = path.join(OUT_DIR, "schema.ts");
  writeFileSync(schemaFilePath, schemaFile);
}

export async function generateMessagesFile(config: Config) {
  const messages = await getMessages(config);
  const JSONMessages = JSON.stringify(messages);
  const clientKeys =
    config.messages.clientKeys instanceof RegExp
      ? [config.messages.clientKeys]
      : config.messages.clientKeys;
  const clientMessages = !clientKeys
    ? messages
    : Object.fromEntries(
        Object.entries(messages).map(([locale, localeMessages]) => {
          const filteredMessages = Object.fromEntries(
            Object.entries(localeMessages).filter(([key]) => {
              return clientKeys.some((regExp) => regExp.test(key));
            }),
          );
          return [locale, filteredMessages];
        }),
      );
  const JSONClientMessages = JSON.stringify(clientMessages);
  const messagesFile = template("messages")
    .replace("{messages}", JSONMessages)
    .replace("{clientMessages}", JSONClientMessages);
  const messagesFilePath = path.join(OUT_DIR, "messages.ts");
  writeFileSync(messagesFilePath, messagesFile);
}
