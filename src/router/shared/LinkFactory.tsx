import type { Locale, Route } from "next-globe-gen/schema";
import {
  default as NextLink,
  type LinkProps as NextLinkProps,
} from "next/link";
import React from "react";
import {
  extractUseHrefOptions,
  type ParamsOption,
  type UseHrefArgs,
  type useHrefFactory,
  type UseHrefOptions,
} from "./useHrefFactory";

type LinkProps<R extends Route> = Omit<NextLinkProps, "href"> & {
  ref?: React.Ref<HTMLAnchorElement>;
} & (
    | { href: UseHrefOptions<R>; locale?: undefined; params?: undefined }
    | ({ href: R; locale?: Locale } & ParamsOption<R>)
  );

type LinkPropsReal<R extends Route> = React.PropsWithChildren<
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<R>> &
    LinkProps<R>
>;

export function LinkFactory(useHref: ReturnType<typeof useHrefFactory>) {
  return function Link<R extends Route>({
    href,
    locale,
    params,
    ref,
    ...linkProps
  }: LinkPropsReal<R>) {
    const useHrefArgs = [href, params ?? locale, locale] as UseHrefArgs<R>;
    const options = extractUseHrefOptions(useHrefArgs);
    return <NextLink {...linkProps} ref={ref} href={useHref(options)} />;
  };
}
