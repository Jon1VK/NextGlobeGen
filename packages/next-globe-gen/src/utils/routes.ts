import {
  schema,
  type Locale,
  type Route,
  type RouteParams,
  type Schema,
} from "next-globe-gen/schema";

import { match as pathMatcher } from "path-to-regexp";

export function extractLocaleAndRoutePathname(pathname: string) {
  const regexp = new RegExp(`\\/(${schema.locales.join("|")})(\\/?.*)`);
  const match = pathname.match(regexp);
  if (!match) return [undefined, pathname] as const;
  return [match[1] as Locale, match[2] || "/"] as const;
}

type RouteMatch<R extends Route = Route> = {
  route: R;
  localizedPaths: Schema["routes"][R];
  params: RouteParams<R>;
};

export function matchRoute(
  locale: Locale,
  pathname: string,
): RouteMatch | undefined {
  let params: Partial<Record<string, string | string[]>> = {};
  const routeMatch = Object.entries(schema.routes).find(
    ([_, localizedPaths]) => {
      const match = pathMatcher(localizedPaths[locale]!)(pathname);
      if (!match) return false;
      params = match.params;
      return true;
    },
  );
  if (!routeMatch) return undefined;
  const [route, localizedPaths] = routeMatch;
  return { route, localizedPaths, params };
}
