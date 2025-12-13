import type { Locale, Route, StaticRoute } from "next-globe-gen/schema";
import type {
  AppRouterInstance,
  NavigateOptions,
  PrefetchOptions,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter as useNextRouter } from "next/navigation";
import { useLocale, useSchema } from ".";
import {
  createHrefFactory,
  extractHrefOptions,
  type HrefOptions,
  type ParamsOption,
  type UseHrefArgs,
} from "../shared/useHrefFactory";

type RouterArgs<
  R extends Route,
  N extends NavigateOptions | Partial<PrefetchOptions> = Partial<
    NavigateOptions & PrefetchOptions
  >,
  O = N & { locale?: Locale } & ParamsOption<R>,
> =
  | (R extends StaticRoute
      ? [route: R | (string & {}), opts?: O]
      : [route: R | (string & {}), opts: O])
  | [
      options: HrefOptions<R>,
      opts?: N & { params?: undefined; locale?: undefined },
    ];

/**
 * Returns a router object with localized navigation methods. Uses next/navigation's useRouter under the hood.
 *
 * @returns An object with push, replace, prefetch, back, forward, and refresh methods.
 *
 * @example
 * const router = useRouter();
 * router.push("/about");
 * router.push("/users/[id]", { params: { id: "123" } });
 * router.push("/about", { locale: "fi" });
 */
export function useRouter() {
  const router = useNextRouter();
  const schema = useSchema();
  const locale = useLocale();

  function push<R extends Route>(...args: RouterArgs<R, NavigateOptions>) {
    const { hrefOpts, scroll } = extractRouterOptions(...args);
    const opts = { ...hrefOpts, locale: hrefOpts.locale ?? locale };
    const createHref = createHrefFactory(schema, !!hrefOpts.locale);
    router.push(createHref(opts), { scroll });
  }

  function replace<R extends Route>(...args: RouterArgs<R, NavigateOptions>) {
    const { hrefOpts, scroll } = extractRouterOptions(...args);
    const opts = { ...hrefOpts, locale: hrefOpts.locale ?? locale };
    const createHref = createHrefFactory(schema, !!hrefOpts.locale);
    router.replace(createHref(opts), { scroll });
  }

  function prefetch<R extends Route>(
    ...args: RouterArgs<R, Partial<PrefetchOptions>>
  ) {
    const { hrefOpts, kind } = extractRouterOptions(...args);
    const opts = { ...hrefOpts, locale: hrefOpts.locale ?? locale };
    const createHref = createHrefFactory(schema, !!hrefOpts.locale);
    router.prefetch(createHref(opts), kind && { kind });
  }

  return {
    back: router.back.bind(router),
    forward: router.forward.bind(router),
    refresh: router.refresh.bind(router),
    push,
    replace,
    prefetch,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } satisfies Record<keyof AppRouterInstance, (...args: any) => void>;
}

function extractRouterOptions<R extends Route>(...args: RouterArgs<R>) {
  const [route, opts] = args;
  const [params, locale, scroll, kind] = [
    opts?.params,
    opts?.locale,
    opts?.scroll,
    opts?.kind,
  ];
  const hrefArgs = [route, params ?? locale, locale] as UseHrefArgs<R>;
  const hrefOpts = extractHrefOptions(hrefArgs);
  return { hrefOpts, scroll, kind };
}
