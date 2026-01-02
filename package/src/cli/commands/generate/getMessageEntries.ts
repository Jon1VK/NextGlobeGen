import { getLocales, type Config, type MessageEntry } from "~/config";
import { flatten } from "~/utils/obj-utils";

export async function getMessageEntries(config: Config) {
  const messagesMaps: Record<string, MessageEntry[]> = {};
  const locales = getLocales(config);
  for await (const locale of locales) {
    if (config.messages.getMessages) {
      const messages = await config.messages.getMessages(locale);
      const messageEntries = Object.entries(flatten(messages)).map(
        ([key, message]) => ({
          key,
          message,
        }),
      );
      messagesMaps[locale] = messageEntries;
      continue;
    }
    const messageEntries = await config.messages.loadMessageEntries(locale);
    messagesMaps[locale] = messageEntries;
  }
  return messagesMaps;
}
