import IntlMessageFormat from "intl-messageformat";
import type {
  Message,
  MessageArguments,
  Messages,
  Namespace,
  NamespaceKey,
} from "next-globe-gen/messages";
import type { DefaultLocale, Locale } from "next-globe-gen/schema";
import { cloneElement, isValidElement, type ReactNode } from "react";

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
      return tImpl({ messages, locale, namespace, key, args });
    };
  };
}

export function tImpl<
  N extends Namespace,
  K extends NamespaceKey<N>,
  A extends MessageArguments<Message<N, K>> = MessageArguments<Message<N, K>>,
>({
  messages,
  locale,
  namespace,
  key,
  args,
}: {
  messages: Messages[DefaultLocale] | undefined;
  locale: Locale;
  namespace: N;
  key: K;
  args?: A;
}) {
  const fullKey = namespace ? `${namespace}.${key}` : key;
  const localeFullKey = `${locale}.${fullKey}`;
  const message = messages?.[fullKey];
  if (!message) return localeFullKey;
  const isLiteralMessage = !/['{<]/.test(message);
  if (isLiteralMessage) return message;
  try {
    const msgFormat = new IntlMessageFormat(message, locale);
    const formatted = msgFormat.format(args) as string | ReactNode[];
    if (!Array.isArray(formatted)) return formatted;
    return toKeyedChildren(formatted);
  } catch (error) {
    console.error(error);
    return localeFullKey;
  }
}

function toKeyedChildren(children: ReactNode[]) {
  return children.map((node, i): ReactNode => {
    if (!isValidElement<{ children: ReactNode[] }>(node)) return node;
    return cloneElement(node, { key: i }, toKeyedChildren(node.props.children));
  });
}
