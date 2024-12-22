import type { Route } from "next-globe-gen/schema";
import { usePathname } from "next/navigation";
import { matchRoute } from "~/utils/routes";
import { useLocale } from "./IntlProvider";

export function useRoute(): Route {
  const locale = useLocale();
  const pathname = usePathname();
  const routeMatch = matchRoute(locale, pathname);
  if (!routeMatch) {
    throw new Error(
      "Hook useRoute was not able to match current pathname to any route."
    );
  }
  return routeMatch.route;
}
