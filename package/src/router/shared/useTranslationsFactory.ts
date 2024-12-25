import IntlMessageFormat from "intl-messageformat";
import type {
  Message,
  MessageArguments,
  Messages,
  Namespace,
  NamespaceKey,
} from "next-globe-gen/messages";
import type { Locale } from "next-globe-gen/schema";

export function useTranslationsFactory(
  useLocale: () => Locale,
  useMessages: () => Messages[Locale] | undefined,
) {
  return function useTranslations<N extends Namespace>(namespace?: N) {
    const locale = useLocale();
    return function t<
      K extends NamespaceKey<N>,
      A extends MessageArguments<Message<N, K>> = MessageArguments<
        Message<N, K>
      >,
    >(
      ...params: A extends Record<string, never>
        ? [key: K, args?: undefined]
        : [key: K, args: A]
    ) {
      const [key, args] = params;
      const messages = useMessages();
      const fullKey = namespace ? `${namespace}.${key}` : key;
      const message = messages?.[fullKey];
      if (!message) return fullKey;
      const msgFormat = new IntlMessageFormat(message, locale);
      return msgFormat.format(args) as string;
    };
  };
}
