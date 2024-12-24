import {
  schema,
  type Locale,
  type Route,
  type RouteParams,
  type StaticRoute,
} from "next-globe-gen/schema";
import { compile } from "path-to-regexp";

export type ParamsOption<R extends Route> = R extends StaticRoute
  ? { params?: undefined }
  : { params: RouteParams<R> };

export type HrefOptions<R extends Route> = {
  pathname: R | (string & {});
  locale?: Locale;
  query?: Record<string, string>;
} & ParamsOption<R>;

export type UseHrefArgs<R extends Route> =
  | (R extends StaticRoute
      ? [route: R, locale?: Locale, _?: undefined]
      : [route: R, params: RouteParams<R>, locale?: Locale])
  | [options: HrefOptions<R>, _?: undefined, __?: undefined];

export function useHrefFactory(useLocale: () => Locale) {
  return function useHref<R extends Route>(...args: UseHrefArgs<R>) {
    const { pathname, params, query, locale } = extractUseHrefOptions(args);
    const localizedPaths = schema.routes[pathname];
    if (!localizedPaths) return withQuery(pathname, query);
    const path = localizedPaths[locale ?? useLocale()];
    if (!path) return withQuery(pathname, query);
    const compliedPath = compile(path)(params);
    if (!query) return compliedPath;
    return withQuery(compliedPath, query);
  };
}

function withQuery(pathname: string, query?: Record<string, string>) {
  if (!query) return pathname;
  const searchParams = new URLSearchParams(query);
  return `${pathname}?${searchParams}`;
}

export function extractUseHrefOptions<R extends Route>(args: UseHrefArgs<R>) {
  const [arg1, arg2, arg3] = args;
  if (typeof arg1 === "object") return arg1;
  const pathname = arg1;
  const params = typeof arg2 === "object" ? arg2 : undefined;
  const locale = typeof arg2 === "object" ? arg3 : arg2;
  return { pathname, params, locale, query: undefined };
}
