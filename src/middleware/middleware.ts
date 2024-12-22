import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { schema, type Locale } from "next-globe-gen/schema";
import { NextResponse, type NextRequest } from "next/server";
import { compile } from "path-to-regexp";
import { extractLocaleAndRoutePathname, matchRoute } from "~/utils/routes";

export function middleware(request: NextRequest) {
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
      new URL(`/${matchedLocale}${routePathname}`, request.url)
    );
  }

  // It there is no locale at this point, we have to be on default locale site
  if (!locale) locale = schema.defaultLocale;

  // Apply alternative localized links
  const response = NextResponse.next();
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
  const { localizedPaths, params } = routeMatch;
  return schema.locales
    .map((locale) => {
      const alternatePath = compile(localizedPaths[locale]!)(params);
      const alternateURL = new URL(alternatePath, request.url);
      alternateURL.search = "";
      return `<${alternateURL}>; rel="alternate"; hreflang="${locale}"`;
    })
    .join(", ");
}
