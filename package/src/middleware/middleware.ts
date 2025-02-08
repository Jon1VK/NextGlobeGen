import Negotiator from "negotiator";
import { schema, type Locale } from "next-globe-gen/schema";
import { NextResponse, type NextRequest } from "next/server";
import { compile } from "path-to-regexp";
import { matchRouteFactory } from "~/utils/matchRouteFactory";

type MiddlewareOptions = {
  skipAlternateLinkHeader?: boolean;
};

const matchRoute = matchRouteFactory(() => schema);

const LOCALE_COOKIE_NAME = "NEXTGLOBEGEN_LOCALE";
const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
} as const;

/**
 * The middleware handles locale negotiation and adds alternate links of the page to the response headers.
 *
 * @example
 * import nextGlobeGenMiddleware from "next-globe-gen/middleware";
 * export function middleware(request) {
 *   const response = nextGlobeGenMiddleware(request);
 *   // other custom logic that possibly modify the response
 *   return response;
 * }
 * // Ignore next internals and static assets
 * export const config = {
 *   matcher: ["/((?!_next|.*\\.).*)"],
 * };
 */
export default function middleware(
  request: NextRequest,
  opts?: MiddlewareOptions,
) {
  const pathname = request.nextUrl.pathname;
  const domain = request.headers.get("host");
  const [pathLocale, routePathname] = extractLocaleAndRoutePathname(pathname);

  const domainConfig = schema.domains?.find(
    (domainConfig) => domainConfig.domain === domain,
  );
  const localeConfig = schema.domains?.find(({ locales }) =>
    locales.includes(pathLocale!),
  );

  // Redirect to correct domain if path locale is not served from current domain
  if (domainConfig && localeConfig && domainConfig !== localeConfig) {
    const skipLocalePrefix = schema.unPrefixedLocales.includes(pathLocale!);
    const path = skipLocalePrefix ? routePathname : pathname;
    const url = new URL(path, request.url);
    url.host = localeConfig.domain;
    return NextResponse.redirect(url);
  }

  // Redirect to nonprefixed URL if current locale is not wanted to be prefixed
  if (pathLocale && schema.unPrefixedLocales.includes(pathLocale)) {
    return NextResponse.redirect(new URL(routePathname, request.url));
  }

  const locales = domainConfig?.locales ?? schema.locales;
  const defaultLocale = domainConfig?.defaultLocale ?? schema.defaultLocale;

  // Redirect to users preferred locale if the default locale should be prefixed
  const prefixDefaultLocale =
    (domainConfig && domainConfig.prefixDefaultLocale) ||
    schema.unPrefixedLocales.length === 0;
  if (!pathLocale && prefixDefaultLocale) {
    const matchedLocale = localeMatcher(request, locales, defaultLocale);
    const response = NextResponse.redirect(
      new URL(`/${matchedLocale}${routePathname}`, request.url),
    );
    response.cookies.set(LOCALE_COOKIE_NAME, matchedLocale, COOKIE_OPTS);
    return response;
  }

  // If there is no locale at this point, we have to be on default locale.
  const locale =
    pathLocale ?? domainConfig?.defaultLocale ?? schema.defaultLocale;

  // Redirect to users preferred locale if has not been done yet
  const localeCookieValue = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (!localeCookieValue) {
    const matchedLocale = localeMatcher(request, locales, defaultLocale);
    if (matchedLocale !== locale) {
      const routeMatch = matchRoute(locale, pathname);
      if (!routeMatch) return NextResponse.next();
      const { localizedPaths, params } = routeMatch;
      const localizedPath = localizedPaths[matchedLocale];
      if (!localizedPath) return NextResponse.next();
      const path = compile(localizedPath)(params);
      const response = NextResponse.redirect(new URL(path, request.url));
      response.cookies.set(LOCALE_COOKIE_NAME, matchedLocale, COOKIE_OPTS);
      return response;
    }
  }

  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE_NAME, locale, COOKIE_OPTS);

  // User wants to skip alternate link header, just return a response
  if (opts?.skipAlternateLinkHeader) return response;

  // Apply alternative localized links
  const alternativeLinks = getAlternativeLinks(locale, request);
  if (!alternativeLinks) return response;
  response.headers.set("Link", alternativeLinks);
  return response;
}

function extractLocaleAndRoutePathname(pathname: string) {
  const regexp = new RegExp(`\\/(${schema.locales.join("|")})(\\/?.*)`);
  const match = pathname.match(regexp);
  if (!match) return [undefined, pathname] as const;
  return [match[1] as Locale, match[2] || "/"] as const;
}

function localeMatcher(
  request: NextRequest,
  locales: string[],
  defaultLocale: string,
) {
  const headers = Object.fromEntries(request.headers);
  const negotiator = new Negotiator({ headers });
  return negotiator.language(locales) ?? defaultLocale;
}

function getAlternativeLinks(locale: Locale, request: NextRequest) {
  const routeMatch = matchRoute(locale, request.nextUrl.pathname);
  if (!routeMatch) return undefined;
  const { route, localizedPaths, params } = routeMatch;
  const localeAlternates = schema.locales
    .map((locale) => {
      const localizedPath = localizedPaths[locale];
      if (!localizedPath) return;
      const alternatePath = compile(localizedPath)(params);
      const alternateURL = new URL(alternatePath, request.url);
      const domainConfig = schema.domains?.find(({ locales }) =>
        locales.includes(locale),
      );
      if (domainConfig) alternateURL.host = domainConfig.domain;
      alternateURL.search = "";
      return `<${alternateURL}>; rel="alternate"; hreflang="${locale}"`;
    })
    .filter((v) => !!v)
    .join(", ");
  if (schema.domains || route !== "/") return localeAlternates;
  const defaultURL = new URL(route, request.url);
  defaultURL.search = "";
  return localeAlternates.concat(
    `, <${defaultURL}>; rel="alternate"; hreflang="x-default"`,
  );
}

/**
 * The middleware handles locale negotiation and adds alternate links of the page to the response headers.
 *
 * @example
 * export { middleware } from "next-globe-gen/middleware";
 * // Ignore next internals and static assets
 * export const config = {
 *   matcher: ["/((?!_next|.*\\.).*)"],
 * };
 */
const middlewareExport = middleware;

export { middlewareExport as middleware };
