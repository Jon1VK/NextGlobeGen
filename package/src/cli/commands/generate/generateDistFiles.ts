import { writeFileSync } from "fs";
import path from "path";
import type { OriginRoute } from "~/cli/types";
import {
  getRouteName,
  getRoutePath,
  isPageOriginRoute,
} from "~/cli/utils/route-utils";
import type { Messages } from "~/types/messages";
import type { Locale, Schema } from "~/types/schema";
import { getLocales, getUnPrefixedLocales, type Config } from "~/utils/config";
import { makeDirectory } from "~/utils/fs-utils";
import { getMessages } from "./getMessages";

export const OUT_DIR = "./.next-globe-gen";
export const TYPES_DECLARATION_FILE = "next-globe-gen.d.ts";

const schemaTemplate = "".concat(
  "export const schema = {schema} as const;\n\n",
  'declare module "next-globe-gen" {\n',
  "\tinterface SchemaRegister {\n",
  "\t\tschema: typeof schema\n\t}\n}\n",
);

export function generateOutDirs(localizedDir: string) {
  makeDirectory(OUT_DIR);
  writeFileSync(path.join(OUT_DIR, ".gitignore"), "*");
  makeDirectory(localizedDir);
  writeFileSync(path.join(localizedDir, ".gitignore"), "*");
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
  const schemaFile = schemaTemplate.replace("{schema}", JSONSchema);
  const schemaFilePath = path.join(OUT_DIR, "schema.ts");
  writeFileSync(schemaFilePath, schemaFile);
}

function generateSchema(config: Config, originRoutes: OriginRoute[]) {
  const routes: Schema["routes"] = {};
  const unPrefixedLocales = getUnPrefixedLocales(config);
  originRoutes.forEach((originRoute) => {
    if (!isPageOriginRoute(originRoute)) return;
    const routeName = getRouteName(originRoute.path);
    routes[routeName] ||= {};
    Object.entries(originRoute.localizedPaths).forEach(
      ([locale, localizedPath]) => {
        const routePath = getRoutePath(
          localizedPath,
          unPrefixedLocales.has(locale),
        );
        routes[routeName]![locale] = routePath;
      },
    );
  });
  return {
    locales: getLocales(config),
    defaultLocale: config.defaultLocale ?? "",
    unPrefixedLocales: [...unPrefixedLocales],
    domains: config.domains,
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

const messagesTemplate = "".concat(
  "export const messages = {clientMessages} as const;\n\n",
  "export const clientMessages = messages;\n\n",
  'declare module "next-globe-gen" {\n',
  "\tinterface MessagesRegister {\n",
  "\t\tmessages: typeof messages\n\t}\n}\n",
);

function createSplittedMessagesTemplate(locales: Locale[]) {
  const mergedMessagesEntries = locales
    .map((locale) => {
      return `\t"${locale}": { ...serverOnlyMessages["${locale}"], ...clientMessages["${locale}"] }`;
    })
    .join(",\n");
  const mergedMessagesObject = `{\n${mergedMessagesEntries}\n}`;
  return "".concat(
    "export const serverOnlyMessages = {serverOnlyMessages} as const;\n\n",
    "export const clientMessages = {clientMessages} as const;\n\n",
    `export const messages = ${mergedMessagesObject} as const;\n\n`,
    'declare module "next-globe-gen" {\n',
    "\tinterface MessagesRegister {\n",
    "\t\tmessages: typeof messages\n\t}\n}\n",
  );
}

export async function generateMessagesFile(config: Config) {
  const { serverOnlyMessages, clientMessages } =
    await getFilteredMessages(config);
  const jsonServerOnlyMessages = JSON.stringify(serverOnlyMessages, null, "\t");
  const jsonClientMessages = JSON.stringify(clientMessages, null, "\t");
  const template = !serverOnlyMessages
    ? messagesTemplate
    : createSplittedMessagesTemplate(getLocales(config));
  const messagesFile = template
    .replace("{serverOnlyMessages}", jsonServerOnlyMessages)
    .replace("{clientMessages}", jsonClientMessages);
  const messagesFilePath = path.join(OUT_DIR, "messages.ts");
  writeFileSync(messagesFilePath, messagesFile);
}

async function getFilteredMessages(config: Config) {
  const messages = await getMessages(config);
  const clientKeys =
    config.messages.clientKeys instanceof RegExp
      ? [config.messages.clientKeys]
      : config.messages.clientKeys;
  if (!clientKeys)
    return { serverOnlyMessages: undefined, clientMessages: messages };
  const serverOnlyMessages: Messages = {};
  const clientMessages: Messages = {};
  Object.entries(messages).forEach(([locale, localeMessages]) => {
    serverOnlyMessages[locale] = {};
    clientMessages[locale] = {};
    Object.entries(localeMessages).forEach(([key, message]) => {
      const matchesClientKey = clientKeys.some((regExp) => regExp.test(key));
      if (matchesClientKey) clientMessages[locale]![key] = message;
      if (!matchesClientKey) serverOnlyMessages[locale]![key] = message;
    });
  });
  return { serverOnlyMessages, clientMessages };
}
