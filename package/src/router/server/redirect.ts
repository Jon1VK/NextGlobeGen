import type { Locale, Route, StaticRoute } from "next-globe-gen/schema";
import {
  type RedirectType,
  permanentRedirect as nextPermanentRedirect,
  redirect as nextRedirect,
} from "next/navigation";
import { useHref } from ".";
import {
  type HrefOptions,
  type ParamsOption,
  type UseHrefArgs,
  extractHrefOptions,
} from "../shared/useHrefFactory";

type RedirectArgs<
  R extends Route,
  O = { type?: RedirectType; locale?: Locale } & ParamsOption<R>,
> =
  | (R extends StaticRoute
      ? [route: R | (string & {}), opts?: O]
      : [route: R | (string & {}), opts: O])
  | [
      options: HrefOptions<R>,
      opts?: { type?: RedirectType; params?: undefined; locale?: undefined },
    ];

/**
 * Redirects to a localized route. Calls next/navigation's redirect under the hood with the localized path.
 *
 * @example
 * redirect("/about");
 * redirect("/users/[id]", { params: { id: "123" } });
 * redirect("/about", { locale: "fi" });
 * redirect({ pathname: "/about", locale: "fi", query: { tab: "overview" } });
 */
export function redirect<R extends Route>(...args: RedirectArgs<R>) {
  const { hrefOpts, type } = extractRedirectOptions(...args);
  return nextRedirect(useHref(hrefOpts), type);
}

/**
 * Performs a permanent redirect (308) to a localized route. Calls next/navigation's permanentRedirect under the hood with the localized path.
 *
 * @example
 * permanentRedirect("/about");
 * permanentRedirect("/users/[id]", { params: { id: "123" } });
 * permanentRedirect("/about", { locale: "fi" });
 */
export function permanentRedirect<R extends Route>(...args: RedirectArgs<R>) {
  const { hrefOpts, type } = extractRedirectOptions(...args);
  return nextPermanentRedirect(useHref(hrefOpts), type);
}

function extractRedirectOptions<R extends Route>(...args: RedirectArgs<R>) {
  const [route, opts] = args;
  const [params, locale, type] = [opts?.params, opts?.locale, opts?.type];
  const hrefArgs = [route, params ?? locale, locale] as UseHrefArgs<R>;
  const hrefOpts = extractHrefOptions(hrefArgs);
  return { hrefOpts, type };
}
