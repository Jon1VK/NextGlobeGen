import { flatten, unflatten } from "~/cli/utils/obj-utils";
import { getLocales, type Config } from "~/utils/config";

let messagesCache: Record<string, unknown> | null = null;

export async function getMessages(config: Config, { fromCache = false } = {}) {
  if (fromCache && messagesCache) return messagesCache;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: Record<string, any> = {};
  const locales = getLocales(config);
  for await (const locale of locales) {
    const localeMessages = await config.messages.getMessages(locale);
    messages[locale] = unflatten(flatten(localeMessages));
  }
  messagesCache = messages;
  return messages;
}
