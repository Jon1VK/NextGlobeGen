import type { Metadata } from "next";
import {
  schema,
  type Route,
  type RouteParams,
  type StaticRoute,
} from "next-globe-gen/schema";
import { createHref } from ".";

type WithLanguageAlternatesArgs<R extends Route> = R extends StaticRoute
  ? [route: R, _?: undefined]
  : [route: R, params: RouteParams<R>];

/**
 * Creates a function that injects language alternate links into page metadata.
 *
 * @example
 * export const generateMetadata = withLanguageAlternates("/about")({
 *   title: "About Us",
 * });
 *
 * export const generateMetadata = withLanguageAlternates("/users/[id]", { id: "123" })({
 *   title: "User Profile",
 * });
 */
export function withLanguageAlternates<R extends Route>(
  ...args: WithLanguageAlternatesArgs<R>
) {
  const [pathname, params] = args;
  const languages = Object.fromEntries(
    schema.locales
      .map((locale) => [locale, createHref({ pathname, params, locale })])
      .concat([
        [
          "x-default",
          createHref({ pathname, params, locale: schema.defaultLocale }),
        ],
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
