import { getLocales, type Config, type MessageEntry } from "~/config";
import type { Locale } from "~/types/schema";
import { getMessageEntries } from "./getMessageEntries";

const prevStringifiedMessages: Record<Locale, string> = {};

export async function syncMessages(
  messagesMap: Map<string, MessageEntry>,
  config: Config,
) {
  const locales = getLocales(config);
  const messageEntries = await getMessageEntries(config);
  locales.forEach((locale) => {
    const entries = messageEntries[locale] || [];
    const existingEntries = new Map(entries.map((entry) => [entry.key, entry]));
    existingEntries.forEach((entry, key) => {
      if (messagesMap.has(key)) {
        const extractedEntry = messagesMap.get(key)!;
        extractedEntry.message = entry.message;
        extractedEntry.description ??= entry.description;
        return;
      }
      const whitelistedKeys =
        config.messages.whitelistedKeys instanceof RegExp
          ? [config.messages.whitelistedKeys]
          : config.messages.whitelistedKeys;
      const shouldBePruned =
        config.messages.pruneUnusedKeys &&
        !whitelistedKeys?.some((regExp) => regExp.test(key));
      if (!shouldBePruned) messagesMap.set(key, entry);
    });
    const sortedMessages = messagesMap
      .values()
      .toArray()
      .sort((a, b) => a.key.localeCompare(b.key));
    const stringifiedMessages = JSON.stringify(sortedMessages);
    if (stringifiedMessages === prevStringifiedMessages[locale]) return;
    prevStringifiedMessages[locale] = stringifiedMessages;
    config.messages.writeMessageEntries(locale, sortedMessages);
  });
}
