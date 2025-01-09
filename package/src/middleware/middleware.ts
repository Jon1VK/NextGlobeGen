import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { schema, type Locale } from "next-globe-gen/schema";
import { NextResponse, type NextRequest } from "next/server";
import { compile } from "path-to-regexp";
import { extractLocaleAndRoutePathname, matchRoute } from "~/utils/routes";

type MiddlewareOptions = {
  skipAlternateLinkHeader?: boolean;
};

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
  const [locale_, routePathname] = extractLocaleAndRoutePathname(pathname);

  let locale = locale_;

  // Redirect to nonprefixed URL if default locale is not wanted
  if (!schema.prefixDefaultLocale && locale === schema.defaultLocale) {
    return NextResponse.redirect(new URL(routePathname, request.url));
  }

  // Redirect to locale prefixed URL
  if (schema.prefixDefaultLocale && !locale) {
    const matchedLocale = localeMatcher(request);
    return NextResponse.redirect(
      new URL(`/${matchedLocale}${routePathname}`, request.url),
    );
  }

  // It there is no locale at this point, we have to be on default locale site
  if (!locale) locale = schema.defaultLocale;

  const response = NextResponse.next();

  // User wants to skip alternate link header, just return a response
  if (opts?.skipAlternateLinkHeader) return response;

  // Apply alternative localized links
  const alternativeLinks = getAlternativeLinks(locale, request);
  if (!alternativeLinks) return response;
  response.headers.set("Link", alternativeLinks);
  return response;
}

function localeMatcher(request: NextRequest) {
  const headers = Object.fromEntries(request.headers);
  const negotiator = new Negotiator({ headers });
  return match(negotiator.languages(), schema.locales, schema.defaultLocale);
}

function getAlternativeLinks(locale: Locale, request: NextRequest) {
  const routeMatch = matchRoute(locale, request.nextUrl.pathname);
  if (!routeMatch) return undefined;
  const { route, localizedPaths, params } = routeMatch;
  const localeAlternates = schema.locales
    .map((locale) => {
      const alternatePath = compile(localizedPaths[locale]!)(params);
      const alternateURL = new URL(alternatePath, request.url);
      alternateURL.search = "";
      return `<${alternateURL}>; rel="alternate"; hreflang="${locale}"`;
    })
    .join(", ");
  if (route !== "/") return localeAlternates;
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
