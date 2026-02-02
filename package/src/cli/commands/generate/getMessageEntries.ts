import type { MessageEntry, ResolvedConfig } from "~/config/types";
import { getLocales } from "~/config/utils";
import { flatten } from "~/utils/obj-utils";

export async function getMessageEntries(config: ResolvedConfig) {
  const messagesMaps: Record<string, MessageEntry[]> = {};
  const locales = getLocales(config);
  await Promise.all(
    locales.map(async (locale) => {
      if (config.messages.getMessages) {
        const messages = await config.messages.getMessages(locale);
        const messageEntries = Object.entries(flatten(messages)).map(
          ([key, message]) => ({
            key,
            message,
          }),
        );
        messagesMaps[locale] = messageEntries;
        return;
      }
      const messageEntries = await config.messages.loadMessageEntries(locale);
      messagesMaps[locale] = messageEntries;
    }),
  );
  return messagesMaps;
}
