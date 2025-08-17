import { writeFileSync } from "fs";
import path from "path";
import type { OriginRoute } from "~/cli/types";
import { unflatten } from "~/cli/utils/obj-utils";
import {
  getRouteName,
  getRoutePath,
  isPageOriginRoute,
} from "~/cli/utils/route-utils";
import type { Schema } from "~/types/schema";
import { getLocales, getUnPrefixedLocales, type Config } from "~/utils/config";
import { makeDirectory } from "~/utils/fs-utils";
import { getMessages } from "./getMessages";

export const OUT_DIR = "./next-globe-gen";

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
    formats: config.messages.formats,
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
  "export const messages = {messages} as const;\n\n",
  "export const clientMessages = {clientMessages} as const;\n\n",
  'declare module "next-globe-gen" {\n',
  "\tinterface MessagesRegister {\n",
  "\t\tmessages: typeof messages\n\t}\n}\n",
);

export async function generateMessagesFile(config: Config) {
  const { allMessages, clientMessages } = await getFilteredMessages(config);
  const jsonMessages = JSON.stringify(allMessages, null, "\t");
  const jsonClientMessages = JSON.stringify(clientMessages, null, "\t");
  const messagesFile = messagesTemplate
    .replace("{messages}", jsonMessages)
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allMessages: Record<string, any> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientMessages: Record<string, any> = {};
  Object.entries(messages).forEach(([locale, localeMessages]) => {
    allMessages[locale] = localeMessages;
    clientMessages[locale] = {};
    Object.entries(localeMessages).forEach(([key, message]) => {
      const matchesClientKey =
        !clientKeys || clientKeys.some((regExp) => regExp.test(key));
      if (matchesClientKey) clientMessages[locale]![key] = message;
    });
    allMessages[locale] = unflatten(allMessages[locale]);
    clientMessages[locale] = unflatten(clientMessages[locale]);
  });
  return { allMessages, clientMessages };
}
