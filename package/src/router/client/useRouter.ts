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
  N extends NavigateOptions | PrefetchOptions,
  O = N & { locale?: Locale } & ParamsOption<R>,
> =
  | (R extends StaticRoute ? [route: R, opts?: O] : [route: R, opts: O])
  | [
      options: HrefOptions<R>,
      opts?: N & { params?: undefined; locale?: undefined },
    ];

export function useRouter() {
  const router = useNextRouter();

  function push<R extends Route>(...args: RouterArgs<R, NavigateOptions>) {
    const [route, opts] = args;
    const hrefArgs = [
      route,
      opts?.params ?? opts?.locale,
      opts?.locale,
    ] as UseHrefArgs<R>;
    const hrefOptions = extractUseHrefOptions(hrefArgs);
    router.push(useHref(hrefOptions), opts);
  }

  function replace<R extends Route>(...args: RouterArgs<R, NavigateOptions>) {
    const [route, opts] = args;
    const hrefArgs = [
      route,
      opts?.params ?? opts?.locale,
      opts?.locale,
    ] as UseHrefArgs<R>;
    const hrefOptions = extractUseHrefOptions(hrefArgs);
    router.replace(useHref(hrefOptions), opts);
  }

  function prefetch<R extends Route>(...args: RouterArgs<R, PrefetchOptions>) {
    const [route, opts] = args;
    const hrefArgs = [
      route,
      opts?.params ?? opts?.locale,
      opts?.locale,
    ] as UseHrefArgs<R>;
    const hrefOptions = extractUseHrefOptions(hrefArgs);
    router.prefetch(useHref(hrefOptions), opts);
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
