import { writeFileSync } from "fs";
import path from "path";
import type { Config, OriginRoute } from "~/cli/types";
import { makeDirectory } from "~/cli/utils/fs-utils";
import { toPascalCase } from "~/cli/utils/string-utils";
import { getMessages } from "./getMessages";

const OUT_DIR = "./.next-globe-gen";

const template = (type: "schema" | "messages") => {
  return "".concat(
    `export const ${type} = {${type}} as const;\n\n`,
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
  const messagesFile = template("messages").replace("{messages}", JSONMessages);
  const messagesFilePath = path.join(OUT_DIR, "messages.ts");
  writeFileSync(messagesFilePath, messagesFile);
}

function isPageOriginRoute(originRoute: OriginRoute) {
  return (
    originRoute.type === "page" ||
    (originRoute.type === "copy" && /page\.[^.]*\.mdx?$/.test(originRoute.path))
  );
}

function getRouteName(originPath: string) {
  return [
    removePageSegment,
    removeGroupSegments,
    removeParallelSegments,
    removeInterceptedSegments,
    asRootPath,
  ].reduce((result, next) => next(result), originPath);
}

function getRoutePath(localizedPath: string) {
  return [
    removePageSegment,
    removeGroupSegments,
    removeParallelSegments,
    removeInterceptedSegments,
    formatDynamicSegments,
    asRootPath,
  ].reduce((result, next) => next(result), localizedPath);
}

function removePageSegment(input: string) {
  return input.replace(/\/page(\.[^.]+)?\.(js|ts|md)x?$/, "");
}

function removeGroupSegments(input: string) {
  return input.replace(/\/\([^)/]+\)/g, "");
}

function removeParallelSegments(input: string) {
  return input.replace(/\/@[^/]+/g, "");
}

function removeInterceptedSegments(input: string) {
  let result = input.replace(/\(\.\)/g, "");
  const twoDotsRegExp = /[^/]+\/\(\.{2}\)/g;
  while (twoDotsRegExp.test(result)) {
    result = result.replace(twoDotsRegExp, "");
  }
  return result.replace(/.*\(\.{3}\)/g, "/");
}

function formatDynamicSegments(input: string) {
  return input
    .replace(/\/\[{2}\.{3}([^\]]+)\]{2}/g, "{/*$1}") // /[[...slug]] -> {/*slug}
    .replace(/\/\[\.{3}([^\]]+)\]/g, "/*$1") // /[...slug] -> /*slug
    .replace(/\/\[([^\]]+)\]/g, "/:$1"); // /[slug] -> /:slug
}

function asRootPath(input: string) {
  return input.startsWith("/") ? input : `/${input}`;
}
