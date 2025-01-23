import { readdirSync } from "fs";
import path from "path";
import type { OriginRoute } from "~/cli/types";
import type { Locale } from "~/types/schema";
import { getLocales, type Config } from "~/utils/config";
import { isDirectory, isFile } from "~/utils/fs-utils";
import { compile } from "~/utils/ts-utils";

type GetOriginRoutesParams = {
  config: Config;
  directory?: string;
  parentRoute?: OriginRoute;
  locales_?: Locale[];
};

export async function getOriginRoutes({
  config,
  directory,
  parentRoute,
  locales_,
}: GetOriginRoutesParams) {
  const originRoutes: OriginRoute[] = [];
  const currentDir = directory ?? config.routes.originDir;
  const files = getAppRouterFiles(currentDir);
  const locales = locales_ ?? getLocales(config);
  for await (const file of files) {
    const filePath = path.join(currentDir, file.name);
    const routePath = `${parentRoute?.path ?? ""}/${file.name}`;
    const isDir = file.type === "dir";
    if (isDir && file.name.startsWith("_")) continue;
    const routeTranslations = isDir
      ? await getRouteTranslations(filePath)
      : undefined;
    const localizedPathEntries = locales
      .map((locale) => {
        if (isDifferentLocaleMarkdownPageFile(file, locale)) return;
        const prefixDefaultLocale =
          typeof config.routes.prefixDefaultLocale === "boolean"
            ? config.routes.prefixDefaultLocale
            : config.prefixDefaultLocale;
        const skipPrefixLocale =
          !config.domains &&
          !prefixDefaultLocale &&
          locale === config.defaultLocale;
        const localePrefix = skipPrefixLocale ? `(${locale})` : locale;
        const localizedDir =
          parentRoute?.localizedPaths[locale] ?? `/${localePrefix}`;
        const localizedSegment =
          routeTranslations?.[locale] ??
          file.name.replace(`.${locale}.mdx`, ".tsx");
        const localizedPath = `${localizedDir}/${localizedSegment}`;
        return [locale, localizedPath];
      })
      .filter((v) => !!v);
    if (localizedPathEntries.length === 0) continue;
    const originRoute: OriginRoute = {
      type: file.type as RouteType,
      path: routePath,
      localizedPaths: Object.fromEntries(localizedPathEntries),
    };
    if (!isDir) {
      originRoutes.push(originRoute);
      continue;
    }
    const childRoutes = await getOriginRoutes({
      config,
      directory: filePath,
      parentRoute: originRoute,
      locales_: locales,
    });
    originRoutes.push(...childRoutes);
  }
  return originRoutes;
}

function isDifferentLocaleMarkdownPageFile(file: File, locale: string) {
  return file.type === "markdown" && !file.name.includes(`.${locale}.`);
}

const APP_ROUTER_FILE_REGEXPS = {
  page: /^page\.(j|t)sx?$/,
  markdown: /^page\.[^.]*\.mdx$/,
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
  copy: /^(sitemap\.xml|icon\d*\.(ico|jpg|jpeg|png|svg)|apple-icon\d*\.(jpg|jpeg|png)|(opengraph|twitter)-image\.(jpg|jpeg|png|gif|alt\.txt))$/,
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
  return readdirSync(directory).map(mapFn).filter(filterFn);
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
