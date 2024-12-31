import {
  messages as allMessages,
  type Message,
  type MessageArguments,
  type Namespace,
  type NamespaceKey,
} from "next-globe-gen/messages";
import type { Locale } from "next-globe-gen/schema";
import { tImpl } from "../shared/useTranslationsFactory";

export function createTranslator<N extends Namespace = undefined>(
  locale: Locale,
  namespace?: N,
) {
  return function t<
    K extends NamespaceKey<N>,
    A extends MessageArguments<Message<N, K>> = MessageArguments<Message<N, K>>,
  >(
    ...params: A extends Record<string, never>
      ? [key: K, args?: undefined]
      : [key: K, args: A]
  ) {
    const [key, args] = params;
    const messages = allMessages[locale];
    return tImpl({ messages, locale, namespace, key, args });
  };
}
