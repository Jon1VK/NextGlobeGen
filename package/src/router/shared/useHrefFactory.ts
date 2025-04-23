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
  hash?: string;
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
    const { pathname, params, query, hash, locale } = extractHrefOptions(args);
    return createHrefFactory(
      schema,
      !!locale,
    )({
      pathname,
      params,
      query,
      hash,
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
    const { pathname, params, query, hash, locale } = extractHrefOptions(
      args as UseHrefArgs<R>,
    );
    const localizedPaths = schema.routes[pathname];
    if (!locale || !localizedPaths) {
      return withHash(withQuery(pathname, query), hash);
    }
    const path = localizedPaths[locale];
    if (!path) return withHash(withQuery(pathname, query), hash);
    const compiledPath = compile(path)(params);
    const domainConfig = includeDomain
      ? schema.domains?.find(({ locales }) => locales.includes(locale))
      : undefined;
    return withDomain(
      withHash(withQuery(compiledPath, query), hash),
      domainConfig?.domain,
    );
  };
}

function withHash(pathname: string, hash?: string) {
  if (!hash) return pathname;
  return `${pathname}#${hash}`;
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
  if (typeof arg1 === "object") return checkStateAndExtract(arg1);
  const pathname = arg1;
  const params = typeof arg2 === "object" ? arg2 : undefined;
  const locale = typeof arg2 === "object" ? arg3 : arg2;
  return checkStateAndExtract({
    pathname,
    params,
    locale,
    query: undefined,
    hash: undefined,
  });
}

/**
 * Extracts the hash and query params from the pathname and returns the pathname without the hash and query params.
 * @param options - The options object containing the pathname, hash, and other options.
 * @returns HrefOptions<Route> with hash and query params extracted from pathname if they exist.
 */
function checkStateAndExtract(options: HrefOptions<Route>): HrefOptions<Route> {
  // Check for hash
  const hashIndex = options.pathname.indexOf("#");
  const hash =
    hashIndex !== -1 ? options.pathname.slice(hashIndex + 1) : options.hash;
  let pathname =
    hashIndex !== -1 ? options.pathname.slice(0, hashIndex) : options.pathname;
  // Check for query params
  const queryIndex = options.pathname.indexOf("?");
  let queryString: string | undefined;
  if (queryIndex !== -1) {
    queryString = pathname.slice(queryIndex + 1);
    pathname = pathname.slice(0, queryIndex);
  }
  // Convert query string to Record<string, string> if needed
  const query = queryString
    ? Object.fromEntries(new URLSearchParams(queryString))
    : options.query;
  return {
    pathname,
    params: options.params,
    locale: options.locale,
    query,
    hash,
  };
}
