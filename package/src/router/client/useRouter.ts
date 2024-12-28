import type { Route } from "next-globe-gen/schema";
import type {
  AppRouterInstance,
  NavigateOptions,
  PrefetchOptions,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter as useNextRouter } from "next/navigation";
import { useHref } from ".";
import { type HrefOptions } from "../shared/useHrefFactory";

export function useRouter() {
  const router = useNextRouter();

  function push<R extends Route>(
    hrefOptions: HrefOptions<R>,
    opts?: NavigateOptions,
  ) {
    router.push(useHref(hrefOptions), opts);
  }

  function replace<R extends Route>(
    hrefOptions: HrefOptions<R>,
    opts?: NavigateOptions,
  ) {
    router.replace(useHref(hrefOptions), opts);
  }

  function prefetch<R extends Route>(
    hrefOptions: HrefOptions<R>,
    opts?: PrefetchOptions,
  ) {
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
