import { messages, type Messages } from "next-globe-gen/messages";
import type { Locale } from "next-globe-gen/schema";
import { useLocale } from "./LocaleStore";

/**
 * Retrieves messages from the current locale that match the provided regular expressions.
 * Useful for code splitting and reducing the size of messages sent to the client.
 *
 * @param messageKeys - A single RegExp or array of RegExp patterns to match message keys.
 * @returns An object containing only the matched messages for the current locale.
 *
 * @example
 * const messages = getMessages(/^common\./);
 * const messages = getMessages([/^common\./, /^errors\./]);
 */
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
