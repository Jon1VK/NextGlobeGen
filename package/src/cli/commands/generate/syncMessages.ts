import { flatten, unflatten } from "~/cli/utils/obj-utils";
import { getLocales, type Config } from "~/utils/config";
import { getMessages } from "./getMessages";

export async function syncMessages(extractedKeys: Set<string>, config: Config) {
  const locales = getLocales(config);
  const messages = await getMessages(config, { fromCache: true });
  const result = { added: 0, removed: 0 };
  locales.forEach((locale) => {
    const flatMessages = flatten(messages[locale]);
    const existingKeys = new Set(Object.keys(flatMessages));
    const keysToAdd = extractedKeys
      .keys()
      .filter((key) => !existingKeys.has(key))
      .toArray();
    keysToAdd.forEach((key) => {
      flatMessages[key] = "EXTRACTED_KEY_PLACEHOLDER";
    });
    result.added += keysToAdd.length;
    const keysToRemove = config.messages.pruneUnusedKeys
      ? existingKeys
          .keys()
          .filter((key) => !extractedKeys.has(key) && !config.messages)
          .toArray()
      : [];
    keysToRemove.forEach((key) => {
      delete flatMessages[key];
    });
    result.removed += keysToRemove.length;
    if (keysToAdd.length === 0 && keysToRemove.length === 0) return;
    const updatedMessages = unflatten(
      Object.fromEntries(
        Object.entries(flatMessages).sort(([a], [b]) => a.localeCompare(b)),
      ),
    );
    config.messages.writeMessages(locale, updatedMessages);
  });
  return result;
}
