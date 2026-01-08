import {
  parse,
  TYPE,
  type MessageFormatElement,
} from "@formatjs/icu-messageformat-parser";
import { writeFileSync } from "fs";
import path from "path";
import {
  getRouteName,
  getRoutePath,
  isPageOriginRoute,
} from "~/cli/utils/route-utils";
import type { Config, MessageEntry } from "~/config/types";
import { getLocales, getUnPrefixedLocales } from "~/config/utils";
import type { Schema } from "~/types/schema";
import { makeDirectory } from "~/utils/fs-utils";
import { unflatten } from "~/utils/obj-utils";
import { getMessageEntries } from "./getMessageEntries";
import type { OriginRoute } from "./getOriginRoutes";

export const OUT_DIR = "./next-globe-gen";

const schemaTemplate = "".concat(
  "export const schema = {schema} as const;\n\n",
  'declare module "next-globe-gen" {\n',
  "\tinterface SchemaRegister {\n",
  "\t\tschema: typeof schema\n\t}\n}\n",
);

export function generateOutDir() {
  makeDirectory(OUT_DIR);
  writeFileSync(path.join(OUT_DIR, ".gitignore"), "*");
}

export function generateLocalizedDir(localizedDir: string) {
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
  "type MessagesParams = {messagesParams};\n\n",
  'declare module "next-globe-gen" {\n',
  "\tinterface MessagesRegister {\n",
  "\t\tmessages: typeof messages\n",
  "\t\tmessagesParams: MessagesParams\n\t}\n}\n",
);

export async function generateMessagesFile(config: Config) {
  const { allMessageEntries, clientMessageEntries } =
    await getFilteredMessages(config);
  const jsonMessages = generateMessagesJson(allMessageEntries);
  const jsonClientMessages = generateMessagesJson(clientMessageEntries);
  const messagesParamsJson = generateMessagesParamsJson(allMessageEntries);
  const messagesFile = messagesTemplate
    .replace("{messages}", jsonMessages)
    .replace("{clientMessages}", jsonClientMessages)
    .replace("{messagesParams}", messagesParamsJson);
  const messagesFilePath = path.join(OUT_DIR, "messages.ts");
  writeFileSync(messagesFilePath, messagesFile);
}

async function getFilteredMessages(config: Config) {
  const allMessageEntries = await getMessageEntries(config);
  const clientKeys =
    config.messages.clientKeys instanceof RegExp
      ? [config.messages.clientKeys]
      : config.messages.clientKeys;
  const clientMessageEntries: Record<string, MessageEntry[]> = {};
  Object.entries(allMessageEntries).forEach(([locale, localeEntries]) => {
    const clientEntries: MessageEntry[] = [];
    localeEntries.forEach((entry) => {
      const matchesClientKey =
        !clientKeys || clientKeys.some((regExp) => regExp.test(entry.key));
      if (matchesClientKey) clientEntries.push(entry);
    });
    clientMessageEntries[locale] = clientEntries;
  });
  return { allMessageEntries, clientMessageEntries };
}

function generateMessagesJson(messageEntries: Record<string, MessageEntry[]>) {
  const allMessages: Record<string, unknown> = {};
  Object.entries(messageEntries).forEach(([locale, entries]) => {
    const localeMessages = Object.fromEntries(
      entries.map((entry) => [entry.key, entry.message]),
    );
    allMessages[locale] = unflatten(localeMessages);
  });
  return JSON.stringify(allMessages, null, "\t");
}

function generateMessagesParamsJson(
  messageEntries: Record<string, MessageEntry[]>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messagesParams: Record<string, any> = {};
  Object.values(messageEntries).forEach((entries) => {
    entries.forEach(({ key, message }) => {
      const ast = parse(message, { requiresOtherClause: false });
      const messageParams = astToMessageParams(ast);
      if (Object.keys(messageParams).length === 0) return;
      messagesParams[key] = { ...messagesParams[key], ...messageParams };
    });
  });
  return JSON.stringify(unflatten(messagesParams), null, "\t").replace(
    /"__REPLACE_START__(.*)__REPLACE_END__"/g,
    "$1",
  );
}

function astToMessageParams(ast: MessageFormatElement[]) {
  const params: Record<string, unknown> = {};
  ast.forEach((element) => {
    Object.assign(params, toTypeScriptType(element));
    if (element.type === TYPE.plural || element.type === TYPE.select) {
      Object.values(element.options).forEach((option) => {
        const optionParams = astToMessageParams(option.value);
        Object.assign(params, optionParams);
      });
    }
    if (element.type === TYPE.tag) {
      const childParams = astToMessageParams(element.children);
      Object.assign(params, childParams);
    }
  });
  return params;
}

function toTypeScriptType(element: MessageFormatElement) {
  switch (element.type) {
    case TYPE.literal:
    case TYPE.pound:
      return {};
    case TYPE.argument:
      return { [element.value]: "__REPLACE_START__string__REPLACE_END__" };
    case TYPE.number:
    case TYPE.plural:
      return { [element.value]: "__REPLACE_START__number__REPLACE_END__" };
    case TYPE.date:
    case TYPE.time:
      return { [element.value]: "__REPLACE_START__Date__REPLACE_END__" };
    case TYPE.select:
      return {
        [element.value]: `__REPLACE_START__${Object.keys(element.options)
          .map((option) => `'${option}'`)
          .join(" | ")}__REPLACE_END__`,
      };
    case TYPE.tag:
      return {
        [element.value]:
          "__REPLACE_START__(children: React.ReactNode) => React.ReactNode__REPLACE_END__",
      };
  }
}
