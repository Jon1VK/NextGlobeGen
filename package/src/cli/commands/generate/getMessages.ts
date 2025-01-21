import { flatten } from "~/cli/utils/obj-utils";
import type { Messages } from "~/types/messages";
import type { Config } from "~/utils/config";

export async function getMessages(config: Config) {
  const messages: Messages = {};
  for await (const locale of config.locales) {
    const localeMessages = await config.messages.getMessages(locale);
    messages[locale] = flatten(localeMessages);
  }
  return messages;
}
