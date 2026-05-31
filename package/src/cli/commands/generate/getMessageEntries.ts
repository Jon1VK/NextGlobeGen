import type { MessageEntry, ResolvedConfig } from "~/config/types";
import { getLocales } from "~/config/utils";

export async function getMessageEntries(config: ResolvedConfig) {
  const messagesMaps: Record<string, MessageEntry[]> = {};
  const locales = getLocales(config);
  await Promise.all(
    locales.map(async (locale) => {
      const messageEntries = await config.messages.loadMessageEntries(locale);
      messagesMaps[locale] = messageEntries;
    }),
  );
  return messagesMaps;
}
