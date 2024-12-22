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

export type UseHrefOptions<R extends Route> = {
  route: R;
  locale?: Locale;
  query?: Record<string, string>;
} & ParamsOption<R>;

export type UseHrefArgs<R extends Route> =
  | (R extends StaticRoute
      ? [route: R, locale?: Locale, _?: undefined]
      : [route: R, params: RouteParams<R>, locale?: Locale])
  | [options: UseHrefOptions<R>, _?: undefined, __?: undefined];

export function useHrefFactory(useLocale: () => Locale) {
  return function useHref<R extends Route>(...args: UseHrefArgs<R>) {
    const { route, params, query, locale } = extractUseHrefOptions(args);
    const localizedPaths = schema.routes[route];
    if (!localizedPaths) throw new Error(`Invalid route "${route}"`);
    const path = localizedPaths[locale ?? useLocale()];
    if (!path) throw new Error(`Invalid locale "${locale}"`);
    const compliedPath = compile(path)(params);
    if (!query) return compliedPath;
    const searchParams = new URLSearchParams(query);
    return `${compliedPath}?${searchParams}`;
  };
}

export function extractUseHrefOptions<R extends Route>(args: UseHrefArgs<R>) {
  const [arg1, arg2, arg3] = args;
  if (typeof arg1 === "object") return arg1;
  const route = arg1;
  const params = typeof arg2 === "object" ? arg2 : undefined;
  const locale = typeof arg2 === "object" ? arg3 : arg2;
  return { route, params, locale, query: undefined };
}
