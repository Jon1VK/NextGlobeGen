import type { Locale, Route } from "next-globe-gen/schema";
import { revalidatePath as nextRevalidatePath } from "next/cache";
import { useHref } from ".";
import {
  extractHrefOptions,
  type ParamsOption,
  type UseHrefArgs,
} from "../shared/useHrefFactory";

type RevalidateType = "layout" | "page";

type RevalidatePathArgs<
  R extends Route,
  O = { locale: Locale; type?: RevalidateType } & ParamsOption<R>,
> = [route: R | (string & {}), opts: O];

export function revalidatePath<R extends Route>(
  ...args: RevalidatePathArgs<R>
) {
  const { hrefOpts, type } = extractRevalidatePathOptions(...args);
  nextRevalidatePath(decodeURI(useHref(hrefOpts)), type);
}

function extractRevalidatePathOptions<R extends Route>(
  ...args: RevalidatePathArgs<R>
) {
  const [route, opts] = args;
  const [params, locale, type] = [opts?.params, opts?.locale, opts?.type];
  const hrefArgs = [
    route,
    params ?? locale,
    locale,
  ] as unknown as UseHrefArgs<R>;
  const hrefOpts = extractHrefOptions(hrefArgs);
  return { hrefOpts, type };
}
