import type { Metadata } from "next";
import {
  schema,
  type Route,
  type RouteParams,
  type StaticRoute,
} from "next-globe-gen/schema";
import { createHref } from "./useHrefFactory";

type WithLanguageAlternatesArgs<R extends Route> = R extends StaticRoute
  ? [route: R, _?: undefined]
  : [route: R, params: RouteParams<R>];

export function withLanguageAlternates<R extends Route>(
  ...args: WithLanguageAlternatesArgs<R>
) {
  const [pathname, params] = args;
  const languages = Object.fromEntries(
    schema.locales.map((locale) => [
      locale,
      createHref({ pathname, params, locale }),
    ]),
  );
  return function injectLanguageAlternates(metadata: Metadata) {
    metadata.alternates ??= {};
    metadata.alternates.languages = {
      ...languages,
      ...metadata.alternates.languages,
    };
    return metadata;
  };
}
