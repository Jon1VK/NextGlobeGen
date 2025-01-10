import type { Route, Schema } from "next-globe-gen/schema";
import { usePathname } from "next/navigation";
import { matchRouteFactory } from "~/utils/matchRouteFactory";
import { useLocale } from "./IntlProvider";

export function useRouteFactory(useSchema: () => Schema) {
  return function useRoute(): Route {
    const matchRoute = matchRouteFactory(useSchema);
    const locale = useLocale();
    const pathname = usePathname();
    const routeMatch = matchRoute(locale, pathname);
    if (!routeMatch) {
      throw new Error(
        "Hook useRoute was not able to match current pathname to any route.",
      );
    }
    return routeMatch.route;
  };
}
