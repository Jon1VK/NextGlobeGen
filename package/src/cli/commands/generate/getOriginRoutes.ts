import { readdirSync } from "fs";
import path from "path";
import type { Config, OriginRoute } from "~/cli/types";
import { isDirectory, isFile } from "~/cli/utils/fs-utils";
import { compile } from "~/cli/utils/ts-utils";

type GetOriginRoutesParams = {
  config: Config;
  directory?: string;
  parentRoute?: OriginRoute;
};

export async function getOriginRoutes({
  config,
  directory,
  parentRoute,
}: GetOriginRoutesParams) {
  const originRoutes: OriginRoute[] = [];
  const currentDir = directory ?? config.routes.originDir;
  const files = getAppRouterFiles(currentDir);
  for await (const file of files) {
    const filePath = path.join(currentDir, file.name);
    const routePath = `${parentRoute?.path ?? ""}/${file.name}`;
    const isDir = file.type === "dir";
    if (isDir && file.name.startsWith("_")) continue;
    const routeTranslations = isDir
      ? await getRouteTranslations(filePath)
      : undefined;
    const localizedPaths = Object.fromEntries(
      config.locales
        .map((locale) => {
          if (isDifferentLocaleMarkdownPageFile(file, locale)) return;
          const noLocalePrefix =
            !config.routes.prefixDefaultLocale &&
            locale === config.defaultLocale;
          const localePrefix = noLocalePrefix ? `(${locale})` : locale;
          const localizedDir =
            parentRoute?.localizedPaths[locale] ?? `/${localePrefix}`;
          const localizedSegment =
            routeTranslations?.[locale] ??
            file.name.replace(`.${locale}.`, ".");
          const localizedPath = `${localizedDir}/${localizedSegment}`;
          return [locale, localizedPath];
        })
        .filter((v) => !!v),
    );
    const originRoute: OriginRoute = {
      type: file.type as RouteType,
      path: routePath,
      localizedPaths,
    };
    if (!isDir) {
      originRoutes.push(originRoute);
      continue;
    }
    const childRoutes = await getOriginRoutes({
      config,
      directory: filePath,
      parentRoute: originRoute,
    });
    originRoutes.push(...childRoutes);
  }
  return originRoutes;
}

function isDifferentLocaleMarkdownPageFile(file: File, locale: string) {
  return (
    file.type === "copy" &&
    /^page\.[^.]*\.mdx?$/.test(file.name) &&
    !file.name.includes(`.${locale}.`)
  );
}

const APP_ROUTER_FILE_REGEXPS = {
  page: /^page\.(j|t)sx?$/,
  layout: /^layout\.(j|t)sx?$/,
  template: /^template\.(j|t)sx?$/,
  default: /^default\.(j|t)sx?$/,
  loading: /^loading\.(j|t)sx?$/,
  "not-found": /^not-found\.(j|t)sx?$/,
  forbidden: /^forbidden\.(j|t)sx?$/,
  unauthorized: /^unauthorized\.(j|t)sx?$/,
  error: /^error\.(j|t)sx?$/,
  sitemap: /^sitemap\.(j|t)s$/,
  icon: /^icon\.(j|t)sx?$/,
  "apple-icon": /^apple-icon\.(j|t)sx?$/,
  "opengraph-image": /^opengraph-image\.(j|t)sx?$/,
  "twitter-image": /^opengraph-image\.(j|t)sx?$/,
  copy: /^(page\.[^.]*\.mdx?|sitemap\.xml|icon\d*\.(ico|jpg|jpeg|png|svg)|apple-icon\d*\.(jpg|jpeg|png)|(opengraph|twitter)-image\.(jpg|jpeg|png|gif|alt\.txt))$/,
};

type File = { name: string; type: FileType };
export type RouteType = keyof typeof APP_ROUTER_FILE_REGEXPS;
type FileType = RouteType | "dir";

function getAppRouterFiles(directory: string) {
  const mapFn = (name: string): File | undefined => {
    if (isDirectory(path.join(directory, name))) return { name, type: "dir" };
    for (const [type, regexp] of Object.entries(APP_ROUTER_FILE_REGEXPS)) {
      if (regexp.test(name)) return { name, type: type as FileType };
    }
  };
  const filterFn = (v?: File) => !!v;
  const priorityFn = (file: File): number => Number(file.type === "dir");
  const sorterFn = (a: File, b: File) => priorityFn(b) - priorityFn(a);
  return readdirSync(directory).map(mapFn).filter(filterFn).sort(sorterFn);
}

const I18N_FILE_NAMES = ["i18n.js", "i18n.ts"];
type I18N = {
  default: Record<string, string> | (() => Promise<Record<string, string>>);
};

async function getRouteTranslations(directory: string) {
  for (const file of I18N_FILE_NAMES) {
    const filePath = path.join(directory, file);
    if (!isFile(filePath)) continue;
    const i18n = (await compile<I18N>(filePath)).default;
    if (typeof i18n === "function") return await i18n();
    return i18n;
  }
}
