import { messages, type Messages } from "next-globe-gen/messages";
import type { Locale } from "next-globe-gen/schema";
import { useLocale } from "./LocaleStore";

export function getMessages(messageKeys: RegExp[] | RegExp): Messages[Locale] {
  const localeMessages = messages[useLocale()];
  if (!localeMessages) return {};
  const keys = messageKeys instanceof RegExp ? [messageKeys] : messageKeys;
  return Object.fromEntries(
    Object.entries(localeMessages).filter(([key]) => {
      return keys.some((regExp) => regExp.test(key));
    }),
  );
}
