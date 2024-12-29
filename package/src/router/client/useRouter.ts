import type { Locale, Route, StaticRoute } from "next-globe-gen/schema";
import type {
  AppRouterInstance,
  NavigateOptions,
  PrefetchOptions,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter as useNextRouter } from "next/navigation";
import { useHref } from ".";
import {
  extractUseHrefOptions,
  type HrefOptions,
  type ParamsOption,
  type UseHrefArgs,
} from "../shared/useHrefFactory";

type RouterArgs<
  R extends Route,
  N extends NavigateOptions | PrefetchOptions = Partial<
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

export function useRouter() {
  const router = useNextRouter();

  function push<R extends Route>(...args: RouterArgs<R, NavigateOptions>) {
    const { hrefOpts, scroll } = extractRouterOptions(...args);
    router.push(useHref(hrefOpts), { scroll });
  }

  function replace<R extends Route>(...args: RouterArgs<R, NavigateOptions>) {
    const { hrefOpts, scroll } = extractRouterOptions(...args);
    router.replace(useHref(hrefOpts), { scroll });
  }

  function prefetch<R extends Route>(...args: RouterArgs<R, PrefetchOptions>) {
    const { hrefOpts, kind } = extractRouterOptions(...args);
    router.prefetch(useHref(hrefOpts), kind && { kind });
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
  const hrefOpts = extractUseHrefOptions(hrefArgs);
  return { hrefOpts, scroll, kind };
}
