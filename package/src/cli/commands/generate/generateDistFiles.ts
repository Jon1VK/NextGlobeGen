import { writeFileSync } from "fs";
import path from "path";
import type { OriginRoute } from "~/cli/types";
import {
  getRouteName,
  getRoutePath,
  isPageOriginRoute,
} from "~/cli/utils/route-utils";
import { toPascalCase } from "~/cli/utils/string-utils";
import type { Messages } from "~/types/messages";
import type { Schema } from "~/types/schema";
import type { Config } from "~/utils/config";
import { makeDirectory } from "~/utils/fs-utils";
import { getMessages } from "./getMessages";

export const OUT_DIR = "./.next-globe-gen";
export const TYPES_DECLARATION_FILE = "next-globe-gen.d.ts";

const template = (
  type: "schema" | "messages",
  splitMessages: boolean = false,
) => {
  return "".concat(
    type === "messages" && splitMessages
      ? "export const serverOnlyMessages = {serverOnlyMessages} as const;\n\n" +
          "export const clientMessages = {clientMessages} as const;\n\n"
      : "",
    `export const ${type} = {${type}} as const;\n\n`,
    type === "messages" && !splitMessages
      ? "export const clientMessages = {clientMessages};\n\n"
      : "",
    `declare module "next-globe-gen" {\n`,
    `\tinterface ${toPascalCase(type)}Register {\n`,
    `\t\t${type}: typeof ${type}\n\t}\n}\n`,
  );
};

export function generateOutDirs(localizedDir: string) {
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
  writeFileSync(TYPES_DECLARATION_FILE, declarationFileContent);
}

export function generateSchemaFile(
  config: Config,
  originRoutes: OriginRoute[],
) {
  const schema = generateSchema(config, originRoutes);
  const JSONSchema = JSON.stringify(schema, null, "\t");
  const schemaFile = template("schema").replace("{schema}", JSONSchema);
  const schemaFilePath = path.join(OUT_DIR, "schema.ts");
  writeFileSync(schemaFilePath, schemaFile);
}

function generateSchema(config: Config, originRoutes: OriginRoute[]) {
  const routes: Schema["routes"] = {};
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
  return {
    locales: config.locales,
    defaultLocale: config.defaultLocale,
    prefixDefaultLocale: config.routes.prefixDefaultLocale,
    routes: sortedRoutes(routes),
  } satisfies Schema;
}

function sortedRoutes(routes: Schema["routes"]) {
  const dynamicSegmentRegexp = /\[\.{0,3}/;
  const catchAllSegmentRegexp = /\[\.{3}/;
  return Object.fromEntries(
    Object.entries(routes).sort(([a], [b]) => {
      const aIsDynamic = dynamicSegmentRegexp.test(a);
      const bIsDynamic = dynamicSegmentRegexp.test(b);
      if (!aIsDynamic && !bIsDynamic) return a.localeCompare(b);
      if (!bIsDynamic) return 1;
      if (!aIsDynamic) return -1;
      const aIsCatchAll = catchAllSegmentRegexp.test(a);
      const bIsCatchAll = catchAllSegmentRegexp.test(b);
      if (aIsCatchAll && !bIsCatchAll) return 1;
      if (!aIsCatchAll && bIsCatchAll) return -1;
      const dynamicDepthA = a.split("[").at(0)!.match(/\//g)!.length;
      const dynamicDepthB = b.split("[").at(0)!.match(/\//g)!.length;
      const dynamicDepthDiff = dynamicDepthB - dynamicDepthA;
      if (dynamicDepthDiff !== 0) return dynamicDepthDiff;
      return a.localeCompare(b);
    }),
  );
}

export async function generateMessagesFile(config: Config) {
  const messages = await getMessages(config);
  const serverOnlyMessages = getFilteredMessages(config, messages, false);
  const clientMessages = getFilteredMessages(config, messages, true);
  const JSONServerOnlyMessages = serverOnlyMessages
    ? JSON.stringify(serverOnlyMessages, null, "\t")
    : "{}";
  const JSONClientMessages = clientMessages
    ? JSON.stringify(clientMessages, null, "\t")
    : "messages";
  const JSONMessages =
    serverOnlyMessages || clientMessages
      ? getSpreadOperatorString(messages)
      : JSON.stringify(messages, null, "\t");
  const messagesFile = template(
    "messages",
    !!clientMessages || !!serverOnlyMessages,
  )
    .replace("{serverOnlyMessages}", JSONServerOnlyMessages)
    .replace("{clientMessages}", JSONClientMessages)
    .replace("{messages}", JSONMessages);
  const messagesFilePath = path.join(OUT_DIR, "messages.ts");
  writeFileSync(messagesFilePath, messagesFile);
}

function getFilteredMessages(
  config: Config,
  messages: Messages,
  isClient: boolean,
) {
  const clientKeys =
    config.messages.clientKeys instanceof RegExp
      ? [config.messages.clientKeys]
      : config.messages.clientKeys;
  if (!clientKeys) return undefined;
  const clientMessages = Object.fromEntries(
    Object.entries(messages).map(([locale, localeMessages]) => {
      const filteredMessages = Object.fromEntries(
        Object.entries(localeMessages).filter(([key]) => {
          const matchesClientKey = clientKeys.some((regExp) =>
            regExp.test(key),
          );
          return isClient ? matchesClientKey : !matchesClientKey;
        }),
      );
      return [locale, filteredMessages];
    }),
  );
  return clientMessages;
}

function getSpreadOperatorString(messages: Messages) {
  const spreadOperators = Object.keys(messages)
    .map(
      (locale) =>
        `\t"${locale}": { ...serverOnlyMessages["${locale}"], ...clientMessages["${locale}"] }`,
    )
    .join(",\n");

  return `{\n${spreadOperators}\n}`;
}
