import type {
  Locale,
  Route,
  RouteParams,
  Schema,
  StaticRoute,
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

export function useHrefFactory(
  useLocale: () => Locale,
  useSchema: () => Schema,
) {
  return function useHref<R extends Route>(...args: UseHrefArgs<R>) {
    const schema = useSchema();
    const { pathname, params, query, locale } = extractHrefOptions(args);
    return createHrefFactory(
      schema,
      !!locale,
    )({
      pathname,
      params,
      query,
      locale: locale ?? useLocale(),
    });
  };
}

export type CreateHrefOptions<R extends Route> = Omit<
  HrefOptions<R>,
  "locale"
> & {
  locale: Locale;
};

export type CreateHrefArgs<R extends Route> =
  | (R extends StaticRoute
      ? [route: R, locale: Locale, _?: undefined]
      : [route: R, params: RouteParams<R>, locale: Locale])
  | [options: CreateHrefOptions<R>, _?: undefined, __?: undefined];

export function createHrefFactory(schema: Schema, includeDomain: boolean) {
  return function createHref<R extends Route>(...args: CreateHrefArgs<R>) {
    const { pathname, params, query, locale } = extractHrefOptions(
      args as UseHrefArgs<R>,
    );
    if (!locale) return withQuery(pathname, query);
    const localizedPaths = schema.routes[pathname];
    if (!localizedPaths) return withQuery(pathname, query);
    const path = localizedPaths[locale];
    if (!path) return withQuery(pathname, query);
    const compiledPath = compile(path)(params);
    const domainConfig = includeDomain
      ? schema.domains?.find(({ locales }) => locales.includes(locale))
      : undefined;
    return withDomain(withQuery(compiledPath, query), domainConfig?.domain);
  };
}

function withQuery(pathname: string, query?: Record<string, string>) {
  if (!query) return pathname;
  const searchParams = new URLSearchParams(query);
  return `${pathname}?${searchParams}`;
}

function withDomain(pathname: string, domain?: string) {
  if (!domain) return pathname;
  const protocol = process.env.NODE_ENV === "development" ? "http:" : "https:";
  return `${protocol}//${domain}${pathname}`;
}

export function extractHrefOptions<R extends Route>(args: UseHrefArgs<R>) {
  const [arg1, arg2, arg3] = args;
  if (typeof arg1 === "object") return arg1;
  const pathname = arg1;
  const params = typeof arg2 === "object" ? arg2 : undefined;
  const locale = typeof arg2 === "object" ? arg3 : arg2;
  return { pathname, params, locale, query: undefined };
}
