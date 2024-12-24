import type { Locale, Route } from "next-globe-gen/schema";
import { default as NextLink } from "next/link";
import { type ComponentProps } from "react";
import {
  extractUseHrefOptions,
  type HrefOptions,
  type ParamsOption,
  type UseHrefArgs,
  type useHrefFactory,
} from "./useHrefFactory";

type NextLinkProps = ComponentProps<typeof NextLink>;

type LinkProps<R extends Route> = Omit<NextLinkProps, "href"> &
  (
    | { href: HrefOptions<R>; locale?: undefined; params?: undefined }
    | ({ href: R | (string & {}); locale?: Locale } & ParamsOption<R>)
  );

export function LinkFactory(useHref: ReturnType<typeof useHrefFactory>) {
  return function Link<R extends Route>({
    href,
    locale,
    params,
    ...linkProps
  }: LinkProps<R>) {
    const useHrefArgs = [href, params ?? locale, locale] as UseHrefArgs<R>;
    const options = extractUseHrefOptions(useHrefArgs);
    return (
      <NextLink
        {...linkProps}
        href={useHref(options)}
        hrefLang={options.locale}
      />
    );
  };
}
