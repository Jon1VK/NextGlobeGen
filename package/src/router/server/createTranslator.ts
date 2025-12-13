import {
  messages as allMessages,
  type MessageParams,
  type Namespace,
  type NamespaceKey,
} from "next-globe-gen/messages";
import type { Locale } from "next-globe-gen/schema";
import type { ReactNode } from "react";
import { formatters } from "../shared/formatters";
import { tImpl } from "../shared/useTranslationsFactory";

/**
 * Creates a translation function for a specific locale and optional namespace.
 *
 * @param locale - The locale to translate for.
 * @param namespace - Optional namespace to scope translations.
 * @returns A translation function that can be used to translate message keys.
 *
 * @example
 * const t = createTranslator("en");
 * const greeting = t("hello");
 *
 * const tCommon = createTranslator("fi", "common");
 * const title = tCommon("title");
 */
export function createTranslator<N extends Namespace = undefined>(
  locale: Locale,
  namespace?: N,
) {
  return function t<
    K extends NamespaceKey<N>,
    A = MessageParams<N, K>,
    R = ((children: ReactNode) => ReactNode) extends A[keyof A]
      ? ReactNode
      : string,
  >(
    key: K,
    ...rest: NoInfer<A> extends Record<string, never>
      ? [args?: never]
      : [args: NoInfer<A>]
  ) {
    const args = rest[0] as Record<string, unknown> | undefined;
    const messages = allMessages[locale];
    return tImpl({
      messages,
      formatters,
      locale,
      namespace,
      key,
      args,
    }) as R;
  };
}
