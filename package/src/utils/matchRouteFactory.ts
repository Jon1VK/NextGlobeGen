import type { Locale, Route, RouteParams, Schema } from "next-globe-gen/schema";
import { match as pathMatcher } from "path-to-regexp";

type RouteMatch<R extends Route = Route> = {
  route: R;
  localizedPaths: Schema["routes"][R];
  params: RouteParams<R>;
};

export function matchRouteFactory(useSchema: () => Schema) {
  return function matchRoute(
    locale: Locale,
    pathname: string,
  ): RouteMatch | undefined {
    const schema = useSchema();
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
  };
}
