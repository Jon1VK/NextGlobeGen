import IntlMessageFormat from "intl-messageformat";
import {
  messages,
  type Message,
  type MessageArguments,
  type Namespace,
  type NamespaceKey,
} from "next-globe-gen/messages";
import type { Locale } from "next-globe-gen/schema";

export function getServerTranslations<N extends Namespace>(
  locale: Locale,
  namespace?: N
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
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const message = messages[locale]?.[fullKey];
    if (!message) return fullKey;
    const msgFormat = new IntlMessageFormat(message, locale);
    return msgFormat.format(args) as string;
  };
}
