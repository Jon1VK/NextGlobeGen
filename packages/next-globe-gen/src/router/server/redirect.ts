import type { Route } from "next-globe-gen/schema";
import {
  type RedirectType,
  permanentRedirect as nextPermanentRedirect,
  redirect as nextRedirect,
} from "next/navigation";
import { useHref } from ".";
import {
  type UseHrefArgs,
  extractUseHrefOptions,
} from "../shared/useHrefFactory";

export function redirect<R extends Route>(...args: UseHrefArgs<R>) {
  const useHrefOptions = extractUseHrefOptions(args);
  nextRedirect(useHref(useHrefOptions));
}

redirect.type = (type: "push" | "replace") => {
  return function redirectWithType<R extends Route>(...args: UseHrefArgs<R>) {
    const useHrefOptions = extractUseHrefOptions(args);
    nextRedirect(useHref(useHrefOptions), type as RedirectType);
  };
};

export function permanentRedirect<R extends Route>(...args: UseHrefArgs<R>) {
  const useHrefOptions = extractUseHrefOptions(args);
  nextPermanentRedirect(useHref(useHrefOptions));
}

permanentRedirect.type = (type: "push" | "replace") => {
  return function redirectWithType<R extends Route>(...args: UseHrefArgs<R>) {
    const useHrefOptions = extractUseHrefOptions(args);
    nextPermanentRedirect(useHref(useHrefOptions), type as RedirectType);
  };
};
