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

export function redirect<R extends Route>(...args: RedirectArgs<R>) {
  const { hrefOpts, type } = extractRedirectOptions(...args);
  nextRedirect(useHref(hrefOpts), type);
}

export function permanentRedirect<R extends Route>(...args: RedirectArgs<R>) {
  const { hrefOpts, type } = extractRedirectOptions(...args);
  nextPermanentRedirect(useHref(hrefOpts), type);
}

function extractRedirectOptions<R extends Route>(...args: RedirectArgs<R>) {
  const [route, opts] = args;
  const [params, locale, type] = [opts?.params, opts?.locale, opts?.type];
  const hrefArgs = [route, params ?? locale, locale] as UseHrefArgs<R>;
  const hrefOpts = extractHrefOptions(hrefArgs);
  return { hrefOpts, type };
}
