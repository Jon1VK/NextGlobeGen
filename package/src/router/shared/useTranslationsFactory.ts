import IntlMessageFormat, { type Options } from "intl-messageformat";
import type {
  Message,
  MessageArguments,
  Messages,
  Namespace,
  NamespaceKey,
} from "next-globe-gen/messages";
import type { Locale } from "next-globe-gen/schema";
import { cloneElement, type ReactNode } from "react";

export function useTranslationsFactory(
  useLocale: () => Locale,
  useMessages: () => Messages[Locale] | undefined,
  useFormatters: () => Options["formatters"],
) {
  return function useTranslations<N extends Namespace = undefined>(
    namespace?: N,
  ) {
    const locale = useLocale();
    const messages = useMessages();
    const formatters = useFormatters();
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
      type TReturnType = ((children: ReactNode) => ReactNode) extends A[keyof A]
        ? ReactNode
        : string;
      return tImpl({
        messages,
        formatters,
        locale,
        namespace,
        key,
        args,
      }) as TReturnType;
    };
  };
}

export function tImpl<
  N extends Namespace,
  K extends NamespaceKey<N>,
  A extends MessageArguments<Message<N, K>> = MessageArguments<Message<N, K>>,
>({
  messages,
  formatters,
  locale,
  namespace,
  key,
  args,
}: {
  messages: Messages[Locale] | undefined;
  formatters: Options["formatters"];
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
    const msgFormat = new IntlMessageFormat(message, locale, undefined, {
      formatters,
    });
    const keyedTagArgs = injectKeysToTagArgs(args);
    return msgFormat.format(keyedTagArgs);
  } catch (error) {
    console.error(error);
    return localeFullKey;
  }
}

function injectKeysToTagArgs(args?: Record<string, unknown>) {
  if (!args) return;
  let index = 0;
  return Object.fromEntries(
    Object.entries(args).map(([key, value]) => {
      if (typeof value !== "function") return [key, value];
      const keyedTag = (children: ReactNode) => {
        const node = value(children);
        return cloneElement(node, { key: index++ });
      };
      return [key, keyedTag];
    }),
  );
}
