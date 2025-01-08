import type { Locale, Route } from "next-globe-gen/schema";
import { default as NextLink } from "next/link";
import { forwardRef, type ComponentProps, type Ref } from "react";
import {
  extractHrefOptions,
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
  return forwardRef(function Link<R extends Route>(
    { href, locale, params, ...linkProps }: LinkProps<R>,
    ref?: Ref<HTMLAnchorElement>,
  ) {
    const useHrefArgs = [href, params ?? locale, locale] as UseHrefArgs<R>;
    const options = extractHrefOptions(useHrefArgs);
    return (
      <NextLink
        {...linkProps}
        ref={ref}
        href={useHref(options)}
        hrefLang={options.locale}
      />
    );
  }) as <R extends Route>(props: LinkProps<R>) => JSX.Element;
}
